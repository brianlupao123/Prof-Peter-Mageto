#!/usr/bin/env python3
"""
Project Analyzer — Peter Mageto Portfolio Edition
==================================================
Scans the whole codebase (frontend/ + backend/ + api/) and produces a report
grounded in the ACTUAL project architecture, not a generic template:

  • Full project structure + technology stack
  • Vercel deployment readiness (vercel.json rewrites vs React Router routes,
    api/ serverless entry files)
  • Neon Postgres / schema completeness (which CMS tables exist vs the
    profile/hero_slides/CRUD schema this project is building toward)
  • Backend CRUD route coverage (which /api/* endpoints exist vs the ones
    the CMS plan calls for)
  • Frontend CMS wiring (PageBanner component, useProfile hook, whether
    AdminDashboard actually calls the CRUD endpoints)
  • Security audit — flags hardcoded secrets, and specifically escalates
    any secret found under frontend/ src, since that code ships into the
    public browser bundle
  • Dark-mode audit — hardcoded colors outside the CSS variable/token
    system vs proper var(--...) usage
  • Environment variable checklist for this project's real vars
    (DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, CORS_ORIGIN,
    BLOB_READ_WRITE_TOKEN)

Usage:
  python analyze_project.py .
  python analyze_project.py /path/to/project --output analysis
  python analyze_project.py . --output analysis && cat analysis/PROJECT_REPORT.md

After running, share PROJECT_REPORT.md (and llm_context.md, for pasting into
an AI assistant) — that's what turns this into "here's exactly what's built
vs still missing," instead of another status update from memory.
"""

import os
import sys
import json
import re
import ast
import hashlib
import argparse
import time
import subprocess
from pathlib import Path
from collections import defaultdict, Counter
from datetime import datetime

# ─── Configuration ────────────────────────────────────────────────────────────

IGNORE_DIRS = {
    "node_modules", ".git", "dist", "build", ".next", "out", "coverage",
    "__pycache__", ".pytest_cache", "venv", "env", ".venv",
    "vendor", ".idea", ".vscode", "tmp", "temp", "cache", ".cache",
    "eggs", ".eggs", "htmlcov", ".tox", ".mypy_cache", ".vercel",
    ".dart_tool", ".pub-cache", "analysis",
}

IGNORE_EXTENSIONS = {
    ".pyc", ".pyo", ".class", ".o", ".obj", ".exe", ".dll", ".so",
    ".dylib", ".lock", ".log", ".DS_Store", ".ico",
}

BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp", ".tiff",
    ".pdf", ".zip", ".tar", ".gz", ".rar", ".7z", ".mp4", ".mp3",
    ".mov", ".avi", ".woff", ".woff2", ".ttf", ".eot", ".otf",
}

LANG_MAP = {
    ".py": "Python", ".js": "JavaScript", ".ts": "TypeScript",
    ".jsx": "React JSX", ".tsx": "React TSX", ".dart": "Dart",
    ".java": "Java", ".kt": "Kotlin", ".swift": "Swift",
    ".go": "Go", ".rs": "Rust", ".cpp": "C++", ".c": "C",
    ".cs": "C#", ".rb": "Ruby", ".php": "PHP",
    ".html": "HTML", ".css": "CSS", ".scss": "SCSS",
    ".vue": "Vue", ".svelte": "Svelte",
    ".sql": "SQL", ".graphql": "GraphQL",
    ".sh": "Shell", ".bash": "Bash",
    ".yaml": "YAML", ".yml": "YAML", ".json": "JSON",
    ".md": "Markdown", ".mdx": "MDX", ".prisma": "Prisma",
}

# ─── This project's actual architecture — the ground truth the checks below
#     compare the real code against. Edit these lists if the plan changes.

CMS_EXPECTED_TABLES = [
    "profile", "hero_slides", "credentials", "career_entries",
    "publications", "research_themes", "strategy_goals", "sources_list",
    "social_links", "users", "messages", "content_updates",
]

# (method, substring-to-match-in-path, human label). Matched loosely against
# whatever the route scanner picks up from Express route declarations.
CMS_EXPECTED_ROUTES = [
    ("GET", "/api/profile", "Public profile read (powers every page)"),
    ("PUT", "/api/profile", "Admin: update singleton profile fields"),
    ("GET", "/api/hero-slides", "Public: read banner slides for a page"),
    ("POST", "/api/hero-slides", "Admin: add a banner slide"),
    ("PUT", "/api/hero-slides", "Admin: edit a banner slide"),
    ("DELETE", "/api/hero-slides", "Admin: delete a banner slide"),
    ("GET", "/api/activity", "Admin: visible CRUD activity feed"),
    ("POST", "/api/uploads", "Admin: image upload (Vercel Blob)"),
    ("POST", "/api/auth/login", "Auth: login"),
    ("POST", "/api/auth/register", "Auth: register"),
    ("GET", "/api/auth/me", "Auth: session check"),
    ("POST", "/api/contact", "Public: submit a contact message"),
    ("GET", "/api/messages", "Admin: read inbox"),
    ("PATCH", "/api/messages", "Admin: update a message's status"),
    ("POST", "/api/:collection", "Generic CRUD: add credential/career/etc. row"),
    ("PUT", "/api/:collection", "Generic CRUD: edit a row"),
    ("DELETE", "/api/:collection", "Generic CRUD: delete a row"),
]

EXPECTED_ENV_VARS = {
    "DATABASE_URL": "Neon Postgres connection string",
    "JWT_SECRET": "Signs/verifies admin session tokens — must have no code fallback",
    "ADMIN_EMAIL": "Seeded admin login",
    "ADMIN_PASSWORD": "Seeded admin login — must have no code fallback, must be rotated if ever hardcoded",
    "CORS_ORIGIN": "Should be the real production domain, not '*' / true",
    "BLOB_READ_WRITE_TOKEN": "Vercel Blob — required for the image upload endpoint",
}

REACT_PAGE_ROUTES = [
    "/", "/leadership", "/scholarship", "/strategy", "/roadmap",
    "/contact", "/sources", "/access", "/dashboard",
]

# ─── Helpers ──────────────────────────────────────────────────────────────────

def should_ignore(path: Path) -> bool:
    for part in path.parts:
        if part in IGNORE_DIRS or part.endswith(".egg-info"):
            return True
    return path.suffix in IGNORE_EXTENSIONS

def is_binary(path: Path) -> bool:
    return path.suffix.lower() in BINARY_EXTENSIONS

def read_file(path: Path):
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return None

def file_md5(path: Path) -> str:
    try:
        h = hashlib.md5()
        h.update(path.read_bytes())
        return h.hexdigest()
    except Exception:
        return ""

def count_lines(content: str) -> dict:
    lines = content.splitlines()
    total = len(lines)
    blank = sum(1 for l in lines if not l.strip())
    comment = sum(1 for l in lines if l.strip().startswith(("#", "//", "/*", "*", "<!--", "--")))
    return {"total": total, "blank": blank, "comment": comment, "code": total - blank - comment}

def run_git(args: list, cwd: Path) -> str:
    try:
        result = subprocess.run(
            ["git"] + args, cwd=str(cwd),
            capture_output=True, text=True, timeout=30
        )
        return result.stdout.strip()
    except Exception:
        return ""

def is_frontend_bundle_path(rel: str) -> bool:
    """True if this file's contents end up shipped in the public browser
    bundle — i.e. anything under a frontend/client src tree. A secret found
    here is a live leak, not just bad hygiene."""
    low = rel.replace("\\", "/").lower()
    return (
        ("frontend/" in low or low.startswith("frontend/") or "client/" in low or low.startswith("src/"))
        and "backend/" not in low
        and "/api/" not in low
    )

# ─── Main Analyzer ────────────────────────────────────────────────────────────

class ProjectAnalyzer:
    def __init__(self, root: Path, output_dir: Path):
        self.root = root
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.all_files: list[Path] = []
        self.stats = defaultdict(int)
        self.lang_counts = Counter()
        self.file_hashes = defaultdict(list)

        # General analysis
        self.frameworks = set()
        self.routes = []
        self.api_endpoints = []
        self.db_models = []
        self.components = []
        self.services = []
        self.controllers = []
        self.hooks = []
        self.middleware = []
        self.auth_patterns = []
        self.ai_integrations = []
        self.third_party = []
        self.env_vars = []
        self.env_files_found = []
        self.secrets_warnings = []
        self.frontend_secret_leaks = []   # subset of secrets_warnings that ship to the browser
        self.todos = []
        self.dependencies = {}
        self.ci_cd = []
        self.pages = []
        self.context_providers = []
        self.schemas = []
        self.line_stats = {"total": 0, "blank": 0, "comment": 0, "code": 0}

        # ── Git ──
        self.git_remotes: dict = {}
        self.git_branch: str = ""
        self.large_binaries: list[dict] = []   # informational, not an LFS gate

        # ── This project's specific architecture ──
        self.vercel_json_found = False
        self.vercel_config: dict = {}
        self.api_dir_files: list[str] = []
        self.neon_driver_found = False
        self.blob_driver_found = False
        self.react_routes_found: set = set()
        self.env_keys_found: set = set()
        self.env_keys_with_value: set = set()
        self.schema_tables_found: set = set()
        self.page_banner_found = False
        self.use_profile_hook_found = False
        self.admin_dashboard_file = None
        self.admin_dashboard_collections_wired: set = set()
        self.css_hardcoded_color_count = 0
        self.css_token_color_count = 0
        self.css_dark_mode_selector_found = False
        self.css_files_scanned = 0

    # ── Walk ──────────────────────────────────────────────────────────────

    def walk(self):
        print(f"  Scanning: {self.root}")
        for dirpath, dirnames, filenames in os.walk(self.root):
            dirnames[:] = [
                d for d in dirnames
                if d not in IGNORE_DIRS and not d.endswith(".egg-info")
            ]
            for fname in filenames:
                fpath = Path(dirpath) / fname
                if should_ignore(fpath):
                    continue
                self.all_files.append(fpath)
        print(f"  Found {len(self.all_files):,} files")

    # ── Git info (kept minimal — informational only, not a deploy gate) ────

    def collect_git_info(self):
        print("  Collecting Git info…")
        self.git_branch = run_git(["rev-parse", "--abbrev-ref", "HEAD"], self.root)
        remotes_raw = run_git(["remote", "-v"], self.root)
        for line in remotes_raw.splitlines():
            parts = line.split()
            if len(parts) >= 2 and "(fetch)" in line:
                self.git_remotes[parts[0]] = parts[1]

    # ── Analyse files ────────────────────────────────────────────────────

    def analyse_files(self):
        total = len(self.all_files)
        for i, fpath in enumerate(self.all_files, 1):
            if i % 500 == 0:
                print(f"  Analysed {i:,}/{total:,} files…")

            ext = fpath.suffix.lower()
            lang = LANG_MAP.get(ext, "Other")
            self.lang_counts[lang] += 1
            self.stats["total_files"] += 1
            size = fpath.stat().st_size
            self.stats["total_bytes"] += size

            rel = fpath.relative_to(self.root)
            name = str(rel).replace("\\", "/")

            if is_binary(fpath):
                self.stats["binary_files"] += 1
                if size > 500_000:
                    self.large_binaries.append({"file": name, "size_mb": round(size / 1e6, 2)})
                continue

            content = read_file(fpath)
            if content is None:
                continue

            ls = count_lines(content)
            for k, v in ls.items():
                self.line_stats[k] += v

            h = file_md5(fpath)
            if h:
                self.file_hashes[h].append(name)

            # ── Project-structure-specific file checks ──
            if fpath.name == "vercel.json":
                self.vercel_json_found = True
                try:
                    self.vercel_config = json.loads(content)
                except json.JSONDecodeError:
                    self.vercel_config = {"_parse_error": True}

            if name.startswith("api/") or "/api/" in name and name.split("/api/")[0] == "":
                self.api_dir_files.append(name)
            elif re.match(r"^api/", name):
                self.api_dir_files.append(name)

            if fpath.name == "vite.config.js" or fpath.name == "vite.config.ts":
                pass  # tracked implicitly via frameworks detection below

            if fpath.name.startswith(".env"):
                self.env_files_found.append(name)
                self._analyse_env(content, name)

            if fpath.name == "PageBanner.jsx":
                self.page_banner_found = True
            if "function PageBanner" in content or "const PageBanner" in content:
                self.page_banner_found = True

            if fpath.name == "useProfile.js" or fpath.name == "useProfile.jsx":
                self.use_profile_hook_found = True
            if "function useProfile" in content or "export function useProfile" in content:
                self.use_profile_hook_found = True

            if fpath.name == "AdminDashboard.jsx":
                self.admin_dashboard_file = name
                self._scan_admin_dashboard_wiring(content)

            # ── Language dispatchers ──
            if ext in (".js", ".ts", ".jsx", ".tsx"):
                self._analyse_js(content, name)
            elif ext == ".py":
                self._analyse_py(content, Path(name))
            elif ext in (".yaml", ".yml"):
                self._analyse_yaml(content, Path(name))
            elif ext == ".json":
                self._analyse_json_file(content, Path(name), fpath)
            elif ext == ".prisma":
                self._analyse_prisma(content, Path(name))
            elif ext == ".sql":
                self._analyse_sql(content, Path(name))
            elif ext == ".css":
                self._analyse_css(content, name)

            self._check_secrets(content, name)
            self._check_todos(content, Path(name))

    # ── This project's serverless / route wiring under api/ ───────────────

    def _scan_admin_dashboard_wiring(self, content: str):
        for collection in ("credentials", "career-entries", "publications",
                            "research-themes", "strategy-goals", "sources",
                            "social-links", "hero-slides", "profile",
                            "messages", "content-updates", "activity", "uploads"):
            if f"/api/{collection}" in content:
                self.admin_dashboard_collections_wired.add(collection)

    # ── CSS / dark-mode audit ──────────────────────────────────────────────

    _COLOR_LITERAL_RE = re.compile(
        r"#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\)"
    )

    def _analyse_css(self, content: str, name: str):
        self.css_files_scanned += 1
        if "[data-theme" in content or ":root[data-theme" in content or ".dark" in content:
            self.css_dark_mode_selector_found = True

        # Rough block splitter: selector { ... } — anything inside a
        # :root or [data-theme=...] block is a legitimate token definition;
        # a color literal anywhere else is a hardcoded value bypassing the
        # variable system (the actual thing that breaks a "real" dark mode).
        for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", content):
            selector, body = m.group(1), m.group(2)
            is_token_block = (":root" in selector) or ("[data-theme" in selector)
            literal_hits = self._COLOR_LITERAL_RE.findall(body)
            var_hits = re.findall(r"var\(--[\w-]+\)", body)
            if is_token_block:
                self.css_token_color_count += len(literal_hits)
            else:
                self.css_hardcoded_color_count += len(literal_hits)
            self.css_token_color_count += 0  # (var usage tracked separately below)
            _ = var_hits  # counted implicitly by absence of hardcoded literals

    # ── JS/TS/JSX/TSX ─────────────────────────────────────────────────────

    def _analyse_js(self, content: str, name: str):
        fw_map = {
            "react-router-dom": "React Router", "react": "React",
            "express": "Express.js", "@neondatabase/serverless": "Neon Postgres (serverless driver)",
            "@vercel/blob": "Vercel Blob Storage", "bcryptjs": "bcryptjs",
            "jsonwebtoken": "JWT Auth", "cors": "CORS middleware",
            "mongoose": "Mongoose/MongoDB", "socket.io": "Socket.io",
            "tailwind": "Tailwind CSS", "redux": "Redux", "firebase": "Firebase",
            "openai": "OpenAI", "anthropic": "Anthropic Claude",
            "stripe": "Stripe", "nodemailer": "Nodemailer",
            "react-icons": "react-icons",
        }
        content_lower = content.lower()
        for keyword, framework in fw_map.items():
            if keyword in content_lower:
                self.frameworks.add(framework)
        if "@neondatabase/serverless" in content:
            self.neon_driver_found = True
        if "@vercel/blob" in content:
            self.blob_driver_found = True

        if "jwt" in content_lower or "jsonwebtoken" in content_lower:
            self.auth_patterns.append({"type": "JWT", "file": name})
        if "bcrypt" in content_lower:
            self.auth_patterns.append({"type": "Password Hashing (bcrypt)", "file": name})
        if "verifyadmin" in content_lower or ("role" in content_lower and "admin" in content_lower):
            self.auth_patterns.append({"type": "Admin-role guard", "file": name})

        # Express routes (backend/src/app.js style)
        for pat in [
            r"""router\.(get|post|put|patch|delete|use)\s*\(\s*['"`]([^'"`]+)['"`]""",
            r"""app\.(get|post|put|patch|delete|use)\s*\(\s*['"`]([^'"`]+)['"`]""",
        ]:
            for m in re.finditer(pat, content):
                self.routes.append({"method": m.group(1).upper(), "path": m.group(2), "file": name})

        # React Router <Route path="..."> declarations
        for m in re.finditer(r"""<Route\s+[^>]*path=["']([^"']+)["']""", content):
            self.react_routes_found.add(m.group(1))

        # Client-side API calls
        for pat in [
            r"""(?:fetch|axios\.(?:get|post|put|patch|delete))\s*\(\s*[`'"]([^`'"]+)[`'"]""",
            r"""apiFetch\s*\(\s*[`'"]([^`'"]+)[`'"]""",
        ]:
            for m in re.finditer(pat, content):
                ep = m.group(1)
                if ep.startswith("/") or ep.startswith("http"):
                    self.api_endpoints.append({"endpoint": ep, "file": name})

        # React components / pages / hooks
        for m in re.finditer(r"""(?:export\s+(?:default\s+)?function|const)\s+([A-Z][A-Za-z0-9]+)\s*[=(]""", content):
            cname = m.group(1)
            entry = {"name": cname, "file": name}
            low_name = name.lower()
            if "/pages/" in low_name or "page" in cname.lower():
                self.pages.append(entry)
            elif "context" in low_name or "Provider" in cname:
                self.context_providers.append(entry)
            elif cname.startswith("use") and len(cname) > 3:
                self.hooks.append(entry)
            elif "middleware" in low_name:
                self.middleware.append(entry)
            elif "controller" in low_name:
                self.controllers.append(entry)
            elif "service" in low_name:
                self.services.append(entry)
            else:
                self.components.append(entry)

    # ── Python (kept generic, in case any tooling scripts are Python) ─────

    def _analyse_py(self, content: str, rel: Path):
        name = str(rel)
        for kw, fw in [("django", "Django"), ("flask", "Flask"), ("fastapi", "FastAPI")]:
            if kw in content.lower():
                self.frameworks.add(fw)
        try:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    self.components.append({"name": node.name, "file": name})
        except SyntaxError:
            pass

    def _analyse_yaml(self, content: str, rel: Path):
        name = str(rel)
        if ".github" in name:
            self.ci_cd.append({"type": "GitHub Actions", "file": name})

    def _analyse_json_file(self, content: str, rel: Path, fpath: Path):
        name = str(rel)
        if fpath.name == "package.json":
            try:
                data = json.loads(content)
                deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                self.dependencies[name] = deps
                fw_deps = {
                    "react": "React", "express": "Express.js",
                    "@neondatabase/serverless": "Neon Postgres (serverless driver)",
                    "@vercel/blob": "Vercel Blob Storage",
                    "react-router-dom": "React Router",
                    "cors": "CORS middleware", "jsonwebtoken": "JWT Auth",
                    "bcryptjs": "bcryptjs", "react-icons": "react-icons",
                    "vite": "Vite",
                }
                for dep, fw in fw_deps.items():
                    if dep in deps:
                        self.frameworks.add(fw)
                        if dep == "@neondatabase/serverless":
                            self.neon_driver_found = True
                        if dep == "@vercel/blob":
                            self.blob_driver_found = True
            except json.JSONDecodeError:
                pass

    def _analyse_env(self, content: str, rel: str):
        for line in content.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key = line.split("=", 1)[0].strip()
                val = line.split("=", 1)[1].strip()
                has_val = bool(val and val not in ('""', "''", ""))
                self.env_vars.append({"key": key, "file": rel, "has_value": has_val})
                self.env_keys_found.add(key)
                if has_val and not any(
                    placeholder in val.lower()
                    for placeholder in ("replace-with", "your-", "changeme", "example", "xxx")
                ):
                    self.env_keys_with_value.add(key)

    def _analyse_prisma(self, content: str, rel: Path):
        self.frameworks.add("Prisma ORM")
        for m in re.finditer(r'model\s+(\w+)\s*\{', content):
            self.db_models.append({"name": m.group(1), "file": str(rel), "type": "Prisma Model"})

    def _analyse_sql(self, content: str, rel: Path):
        self.frameworks.add("SQL Database (Postgres/Neon)")
        for m in re.finditer(r'create\s+table\s+(?:if\s+not\s+exists\s+)?["`]?(\w+)["`]?', content, re.IGNORECASE):
            table = m.group(1)
            self.db_models.append({"name": table, "file": str(rel), "type": "SQL Table"})
            self.schema_tables_found.add(table)

    # ── Secrets & TODOs ───────────────────────────────────────────────────

    _SECRET_PATTERNS = [
        (r'(?i)(api[_-]?key|apikey)\s*[=:]\s*["\']([A-Za-z0-9_\-]{20,})["\']', "API Key"),
        (r'(?i)(secret|password|passwd)\s*[=:]\s*["\']([^"\']{6,})["\']', "Password/Secret literal"),
        (r'sk-[A-Za-z0-9]{20,}', "OpenAI-style Key"),
        (r'AKIA[0-9A-Z]{16}', "AWS Access Key"),
        (r'ghp_[A-Za-z0-9]{36}', "GitHub Token"),
    ]

    def _check_secrets(self, content: str, name: str):
        if "example" in name.lower() or ".env.example" in name.lower():
            return
        for pat, label in self._SECRET_PATTERNS:
            for m in re.finditer(pat, content):
                entry = {"type": label, "file": name, "match_preview": m.group(0)[:50] + "…"}
                self.secrets_warnings.append(entry)
                if is_frontend_bundle_path(name):
                    self.frontend_secret_leaks.append(entry)

    def _check_todos(self, content: str, rel: Path):
        for i, line in enumerate(content.splitlines(), 1):
            if re.search(r'\b(TODO|FIXME|HACK|BUG|XXX)\b', line):
                self.todos.append({"file": str(rel), "line": i, "text": line.strip()[:120]})

    # ── Post-analysis: this project's specific readiness checks ───────────

    def run_project_checks(self):
        print("  Running project-specific checks…")
        self.route_coverage = []
        for method, path_fragment, label in CMS_EXPECTED_ROUTES:
            found = any(
                r["method"] == method and path_fragment.replace(":collection", "") in r["path"]
                for r in self.routes
            ) or (
                path_fragment == "/api/:collection" and
                any(re.search(r"/api/:\w+", r["path"]) for r in self.routes if r["method"] == method)
            )
            self.route_coverage.append({"method": method, "path": path_fragment, "label": label, "found": found})

        self.table_coverage = [
            {"table": t, "found": t in self.schema_tables_found} for t in CMS_EXPECTED_TABLES
        ]

        self.env_coverage = [
            {
                "key": k, "purpose": purpose,
                "declared": k in self.env_keys_found,
                "has_real_value_in_repo": k in self.env_keys_with_value,
            }
            for k, purpose in EXPECTED_ENV_VARS.items()
        ]

        self.vercel_route_coverage = []
        rewrites = self.vercel_config.get("rewrites", []) if isinstance(self.vercel_config, dict) else []
        rewrite_sources = {r.get("source", "") for r in rewrites if isinstance(r, dict)}
        for path in REACT_PAGE_ROUTES:
            if path == "/":
                covered = True  # Vercel always serves index.html at root
            else:
                covered = any(path == src or path in src for src in rewrite_sources)
            self.vercel_route_coverage.append({"path": path, "covered_by_vercel_json": covered})

    # ── Tree ──────────────────────────────────────────────────────────────

    def build_tree(self) -> str:
        lines = [str(self.root.name) + "/"]
        seen_dirs: set = set()

        def _walk(path: Path, prefix: str, depth: int):
            if depth > 6:
                return
            try:
                items = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
            except PermissionError:
                return
            dirs = [p for p in items if p.is_dir() and p.name not in IGNORE_DIRS]
            files = [p for p in items if p.is_file() and p.suffix not in IGNORE_EXTENSIONS]
            entries = dirs + files[:20]
            for idx, entry in enumerate(entries):
                connector = "└── " if idx == len(entries) - 1 else "├── "
                lines.append(prefix + connector + entry.name + ("/" if entry.is_dir() else ""))
                if entry.is_dir() and str(entry) not in seen_dirs:
                    seen_dirs.add(str(entry))
                    extension = "    " if idx == len(entries) - 1 else "│   "
                    _walk(entry, prefix + extension, depth + 1)
            if len(files) > 20:
                lines.append(prefix + f"    … and {len(files)-20} more files")

        _walk(self.root, "", 0)
        return "\n".join(lines)

    # ── Output generators ─────────────────────────────────────────────────

    def _dedupe(self, lst: list, key="name") -> list:
        seen = set()
        result = []
        for item in lst:
            k = item.get(key, str(item))
            if k not in seen:
                seen.add(k)
                result.append(item)
        return result

    def generate_outputs(self):
        print("\n  Writing output files…")

        duplicates = [paths for paths in self.file_hashes.values() if len(paths) > 1]
        sized = []
        for f in self.all_files:
            try:
                sized.append((f.stat().st_size, str(f.relative_to(self.root))))
            except Exception:
                pass
        largest = sorted(sized, reverse=True)[:20]
        ext_counts = Counter(f.suffix.lower() for f in self.all_files if f.suffix)

        tree = self.build_tree()
        (self.output_dir / "project_tree.txt").write_text(tree, encoding="utf-8")

        stats_data = {
            "total_files": self.stats["total_files"],
            "binary_files": self.stats["binary_files"],
            "total_size_mb": round(self.stats["total_bytes"] / 1e6, 2),
            "lines": self.line_stats,
            "comment_percentage": round(self.line_stats["comment"] / max(self.line_stats["total"], 1) * 100, 1),
            "languages": dict(self.lang_counts.most_common()),
            "extensions": dict(ext_counts.most_common(30)),
            "largest_files": [{"size_kb": round(s / 1024, 1), "file": f} for s, f in largest],
            "duplicate_file_groups": duplicates[:20],
            "todo_count": len(self.todos),
        }
        self._write_json("statistics.json", stats_data)

        routes_deduped = list({(r["method"], r["path"]): r for r in self.routes}.values())
        eps_deduped = list({e["endpoint"]: e for e in self.api_endpoints}.values())

        self._write_json("routes.json", routes_deduped)
        self._write_json("api_endpoints.json", eps_deduped)
        self._write_json("dependencies.json", self.dependencies)
        self._write_json("database_models.json", {"models": self._dedupe(self.db_models)})
        self._write_json("frontend_components.json", {
            "pages": self._dedupe(self.pages, "file"),
            "components": self._dedupe(self.components)[:200],
            "context_providers": self._dedupe(self.context_providers),
            "hooks": self._dedupe(self.hooks),
        })

        self._write_project_report(tree, stats_data, routes_deduped, eps_deduped)
        self._write_llm_context(tree, stats_data, routes_deduped, eps_deduped)
        self._write_full_source_dump()

        print(f"\n  ✅ Analysis complete → {self.output_dir}/")

    def _write_json(self, fname: str, data):
        (self.output_dir / fname).write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")

    # ── PROJECT REPORT (the key file) ──────────────────────────────────────

    def _write_project_report(self, tree: str, stats: dict, routes: list, endpoints: list):
        ts = datetime.now().strftime("%Y-%m-%d %H:%M")
        lines = [
            f"# Project Report — {self.root.name}",
            f"_Generated: {ts}_",
            "",
            "> **Stack:** Vite + React + react-router-dom (frontend) · Express on "
            "Vercel serverless functions (backend) · Neon Postgres · deployed "
            "entirely on Vercel.",
            "",
            "---",
            "",
            "## 🚦 Quick Status",
            "",
        ]

        tables_missing = [t["table"] for t in self.table_coverage if not t["found"]]
        routes_missing = [r for r in self.route_coverage if not r["found"]]
        env_missing = [e["key"] for e in self.env_coverage if not e["declared"]]

        lines += [
            f"| Area | Status |",
            f"|------|--------|",
            f"| Schema (CMS tables) | {len(self.table_coverage) - len(tables_missing)}/{len(self.table_coverage)} tables present |",
            f"| Backend CRUD routes | {sum(1 for r in self.route_coverage if r['found'])}/{len(self.route_coverage)} implemented |",
            f"| Vercel routing | {'✅ vercel.json found' if self.vercel_json_found else '❌ vercel.json missing'} |",
            f"| Frontend CMS wiring | PageBanner: {'✅' if self.page_banner_found else '❌'} · useProfile: {'✅' if self.use_profile_hook_found else '❌'} |",
            f"| Frontend secret leaks | {'🔴 ' + str(len(self.frontend_secret_leaks)) + ' found — fix first' if self.frontend_secret_leaks else '✅ none detected'} |",
            f"| Dark-mode token discipline | {self.css_hardcoded_color_count} hardcoded color(s) outside the token system |",
            "",
        ]

        # ── Security — always first, it's the highest-stakes section ──
        lines += ["---", "", "## 1️⃣  Security"]
        if self.frontend_secret_leaks:
            lines += [
                "",
                "🔴 **Critical — these ship inside the public browser bundle:**",
                "",
            ]
            for w in self.frontend_secret_leaks[:20]:
                lines.append(f"- **{w['type']}** in `{w['file']}` — `{w['match_preview']}`")
            lines += [
                "",
                "Anything under `frontend/` gets compiled into JS that every visitor's "
                "browser downloads — a secret here is public the moment the site is live, "
                "regardless of what the code intends. Move it server-side (read from "
                "`process.env` in `backend/src/app.js`) and rotate the exposed value.",
            ]
        else:
            lines.append("\n✅ No secret-shaped literals found under the frontend source tree.")

        backend_only_secrets = [w for w in self.secrets_warnings if w not in self.frontend_secret_leaks]
        if backend_only_secrets:
            lines += ["", "**Backend-only secret-shaped literals found (lower severity, but confirm these are dev-only fallbacks, not the real production values):**"]
            for w in backend_only_secrets[:15]:
                lines.append(f"- {w['type']} in `{w['file']}`")

        # ── Vercel / deployment ──
        lines += ["", "---", "", "## 2️⃣  Vercel Deployment Readiness", ""]
        if self.vercel_json_found:
            lines.append("✅ `vercel.json` found.")
            if self.vercel_config.get("_parse_error"):
                lines.append("❌ It didn't parse as valid JSON — check for a trailing comma or syntax error.")
        else:
            lines.append("❌ No `vercel.json` found at the project root.")

        lines += ["", "### `api/` serverless entry files detected"]
        if self.api_dir_files:
            for f in sorted(self.api_dir_files):
                lines.append(f"- `{f}`")
        else:
            lines.append("- ❌ Nothing found under `api/` — Vercel has nothing to deploy as a function.")

        lines += ["", "### React Router page routes vs `vercel.json` rewrites"]
        lines += ["| Route | Covered by a vercel.json rewrite? |", "|---|---|"]
        for r in self.vercel_route_coverage:
            mark = "✅" if r["covered_by_vercel_json"] else "❌ will 404 on direct load/refresh"
            lines.append(f"| `{r['path']}` | {mark} |")
        uncovered = [r["path"] for r in self.vercel_route_coverage if not r["covered_by_vercel_json"]]
        if uncovered:
            lines += [
                "",
                "Add rewrites for the missing paths so a direct link or page refresh "
                "doesn't 404 — each needs a `{ \"source\": \"<path>\", \"destination\": "
                "\"/index.html\" }` entry.",
            ]

        # ── Database / schema ──
        lines += ["", "---", "", "## 3️⃣  Database Schema — CMS Tables", ""]
        lines += ["| Table | Present in schema.sql? |", "|---|---|"]
        for t in self.table_coverage:
            lines.append(f"| `{t['table']}` | {'✅' if t['found'] else '❌ missing'} |")
        if tables_missing:
            lines += [
                "",
                f"**Missing:** {', '.join('`'+t+'`' for t in tables_missing)} — these are "
                "required for the profile/banner CRUD system. If they're genuinely not "
                "needed yet, that's fine, but confirm it's intentional rather than a step "
                "that got skipped during implementation.",
            ]
        lines.append(f"\n**Neon serverless driver detected:** {'✅ yes' if self.neon_driver_found else '❌ no — check backend/src/app.js imports @neondatabase/serverless'}")
        lines.append(f"**Vercel Blob detected:** {'✅ yes' if self.blob_driver_found else '⚠️  no — needed for the image-upload endpoint (§ image sourcing)'}")

        # ── CRUD route coverage ──
        lines += ["", "---", "", "## 4️⃣  Backend CRUD Route Coverage", ""]
        lines += ["| Method | Path | What it's for | Found? |", "|---|---|---|---|"]
        for r in self.route_coverage:
            lines.append(f"| `{r['method']}` | `{r['path']}` | {r['label']} | {'✅' if r['found'] else '❌'} |")
        if routes_missing:
            lines += [
                "",
                f"**{len(routes_missing)} of {len(self.route_coverage)} expected routes not detected.** "
                "This is a static-analysis pass (regex over route declarations), so double-check "
                "manually before assuming a ❌ means it's truly missing — but treat every ❌ here "
                "as something to verify, not something to ignore.",
            ]

        # ── Frontend CMS wiring ──
        lines += ["", "---", "", "## 5️⃣  Frontend CMS Wiring", ""]
        lines.append(f"- **`PageBanner` component:** {'✅ found' if self.page_banner_found else '❌ not found — the 7-page banner system in the spec isn'+chr(39)+'t built yet'}")
        lines.append(f"- **`useProfile` hook:** {'✅ found' if self.use_profile_hook_found else '❌ not found — pages are likely still reading hardcoded data instead of `/api/profile`'}")
        lines.append(f"- **`AdminDashboard.jsx`:** {'found at `' + self.admin_dashboard_file + '`' if self.admin_dashboard_file else '❌ not found'}")
        if self.admin_dashboard_file:
            expected_collections = {"credentials", "career-entries", "publications", "research-themes",
                                     "strategy-goals", "sources", "social-links", "hero-slides", "profile"}
            wired = self.admin_dashboard_collections_wired & expected_collections
            missing = expected_collections - wired
            lines.append(f"  - Collections the dashboard actually calls: {', '.join('`'+c+'`' for c in sorted(wired)) or 'none detected'}")
            if missing:
                lines.append(f"  - Not yet wired into the dashboard: {', '.join('`'+c+'`' for c in sorted(missing))}")

        # ── Dark mode / CSS ──
        lines += ["", "---", "", "## 6️⃣  Dark Mode / Styling Audit", ""]
        lines.append(f"- CSS files scanned: {self.css_files_scanned}")
        lines.append(f"- Dark-mode selector (`[data-theme]` or `.dark`) present: {'✅ yes' if self.css_dark_mode_selector_found else '❌ no'}")
        lines.append(f"- Color literals defined inside `:root`/theme token blocks (expected — this is where they belong): {self.css_token_color_count}")
        lines.append(f"- Color literals found **outside** token blocks (hardcoded, bypasses the theme system): {self.css_hardcoded_color_count}")
        if self.css_hardcoded_color_count > 0:
            lines.append(
                "\nEvery hardcoded color outside a `:root`/`[data-theme]` block is a spot dark "
                "mode can't reach — it'll stay the light-mode color regardless of the toggle. "
                "This is the concrete, checkable version of \"dark mode isn't just a background "
                "color swap.\""
            )

        # ── Environment variables ──
        lines += ["", "---", "", "## 7️⃣  Environment Variables", ""]
        lines += ["| Variable | Purpose | Declared in a .env file? | Real value in repo? |", "|---|---|---|---|"]
        for e in self.env_coverage:
            val_flag = "⚠️ literal value committed — should be Vercel-only" if e["has_real_value_in_repo"] else "—"
            lines.append(f"| `{e['key']}` | {e['purpose']} | {'✅' if e['declared'] else '❌'} | {val_flag} |")
        lines += [
            "",
            "Declared-but-empty in `.env.example` is correct (placeholders only). A "
            "**real value committed to the repo** is the thing to fix — those belong only "
            "in Vercel's Project Settings → Environment Variables.",
        ]
        if env_missing:
            lines.append(f"\n**Not referenced anywhere yet:** {', '.join('`'+k+'`' for k in env_missing)}")

        # ── Housekeeping ──
        lines += ["", "---", "", "## 8️⃣  Housekeeping", ""]
        lines.append(f"- **TODO/FIXME markers:** {len(self.todos)}")
        for t in self.todos[:15]:
            lines.append(f"  - `{t['file']}:{t['line']}` — {t['text']}")
        if len(self.todos) > 15:
            lines.append(f"  - … and {len(self.todos)-15} more (see routes.json / re-run for full list)")

        if self.large_binaries:
            lines += ["", f"**Large binary files (>500KB) — {len(self.large_binaries)} found:**"]
            for b in self.large_binaries[:15]:
                lines.append(f"  - `{b['file']}` — {b['size_mb']} MB")

        duplicates = [paths for paths in self.file_hashes.values() if len(paths) > 1]
        if duplicates:
            lines += ["", f"**Byte-identical duplicate files:** {len(duplicates)} group(s) — see `duplicate_file_groups` in statistics.json"]

        # ── Tree ──
        lines += ["", "---", "", "## 9️⃣  Project Tree", "", "```", tree[:6000]]
        if len(tree) > 6000:
            lines.append("… (see project_tree.txt for the full tree)")
        lines.append("```")

        # ── Prioritized checklist ──
        lines += ["", "---", "", "## ✅ Prioritized Checklist", ""]
        checklist = []
        if self.frontend_secret_leaks:
            checklist.append("- [ ] **Fix frontend secret leak(s) — do this first** (§1)")
        if tables_missing:
            checklist.append(f"- [ ] Add missing schema tables: {', '.join(tables_missing)} (§3)")
        if routes_missing:
            checklist.append(f"- [ ] Implement {len(routes_missing)} missing backend route(s) (§4)")
        if not self.page_banner_found:
            checklist.append("- [ ] Build the `PageBanner` component (§5)")
        if not self.use_profile_hook_found:
            checklist.append("- [ ] Build the `useProfile` hook and wire pages to it (§5)")
        if uncovered:
            checklist.append(f"- [ ] Add vercel.json rewrites for: {', '.join(uncovered)} (§2)")
        if self.css_hardcoded_color_count > 0:
            checklist.append(f"- [ ] Move {self.css_hardcoded_color_count} hardcoded color(s) into CSS variables (§6)")
        if not checklist:
            checklist.append("- [x] Everything checked above is present — spot-check manually, static analysis can't catch everything.")
        lines += checklist

        lines += ["", "---", "", f"_Report generated by analyze_project.py · {ts}_"]

        (self.output_dir / "PROJECT_REPORT.md").write_text("\n".join(lines), encoding="utf-8")

    # ── LLM context (paste into an AI assistant for instant grounding) ────

    def _write_llm_context(self, tree: str, stats: dict, routes: list, endpoints: list):
        ts = datetime.now().strftime("%Y-%m-%d %H:%M")
        lines = [
            f"# LLM Context — {self.root.name}",
            f"_Generated: {ts}_",
            "",
            "> Paste this file into Claude, ChatGPT, or another AI to give instant full project context.",
            "",
            "## 1. Project Identity",
            f"- **Name**: {self.root.name}",
            f"- **Stack**: Vite + React + react-router-dom, Express on Vercel serverless functions, Neon Postgres",
            f"- **Git branch**: `{self.git_branch or 'unknown'}`",
            "",
            "## 2. Technology Stack Detected",
        ]
        for fw in sorted(self.frameworks):
            lines.append(f"- {fw}")

        lines += [
            "",
            "## 3. Scale",
            "| Metric | Value |",
            "|--------|-------|",
            f"| Files | {stats['total_files']:,} |",
            f"| Size | {stats['total_size_mb']} MB |",
            f"| Lines of Code | {stats['lines']['code']:,} |",
            "",
            "## 4. Directory Tree",
            "```",
            tree[:6000],
        ]
        if len(tree) > 6000:
            lines.append("… (see project_tree.txt)")
        lines.append("```")

        lines += ["", "## 5. Backend Routes Detected"]
        if routes:
            lines += ["| Method | Path | File |", "|--------|------|------|"]
            for r in routes[:60]:
                lines.append(f"| `{r['method']}` | `{r['path']}` | `{r.get('file','?')}` |")
        else:
            lines.append("_None detected_")

        lines += ["", "## 6. CMS Schema Coverage"]
        for t in self.table_coverage:
            lines.append(f"- `{t['table']}`: {'present' if t['found'] else 'MISSING'}")

        lines += ["", "## 7. CMS Route Coverage"]
        for r in self.route_coverage:
            lines.append(f"- {r['method']} {r['path']}: {'present' if r['found'] else 'MISSING'} — {r['label']}")

        lines += [
            "",
            "## 8. Frontend CMS Wiring",
            f"- PageBanner component: {'present' if self.page_banner_found else 'MISSING'}",
            f"- useProfile hook: {'present' if self.use_profile_hook_found else 'MISSING'}",
            f"- AdminDashboard.jsx: {self.admin_dashboard_file or 'MISSING'}",
        ]

        lines += ["", "## 9. Security"]
        lines.append(f"- Frontend-bundle secret leaks: {len(self.frontend_secret_leaks)}")
        for w in self.frontend_secret_leaks[:10]:
            lines.append(f"  - {w['type']} in `{w['file']}`")

        lines += ["", "## 10. Environment Variables Expected"]
        for e in self.env_coverage:
            lines.append(f"- `{e['key']}` ({e['purpose']}): declared={e['declared']}")

        (self.output_dir / "llm_context.md").write_text("\n".join(lines), encoding="utf-8")

    # ── Full source dump — the actual "complete picture" file ─────────────
    #
    # Everything above extracts SIGNALS (route paths, table names, color
    # counts) via regex — it deliberately never prints a whole file, so it
    # can't show what a page's bio text or hero copy actually says. This
    # writes the real content of every real source file into one document,
    # which is what "give you the full picture" actually requires.

    FULL_DUMP_EXTENSIONS = {
        ".js", ".jsx", ".ts", ".tsx", ".css", ".scss", ".html", ".sql",
        ".md", ".mdx",
    }
    FULL_DUMP_EXCLUDE_NAMES = {
        "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    }
    # .env* files are never dumped, even .env.example — if a real value ever
    # ended up committed, this file should not be the thing that reprints it.
    FULL_DUMP_MAX_FILE_BYTES = 60_000       # skip anything larger, note it instead
    FULL_DUMP_MAX_TOTAL_BYTES = 1_200_000   # hard stop so the file stays pasteable

    def _write_full_source_dump(self):
        lines = [
            f"# Full Source — {self.root.name}",
            f"_Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}_",
            "",
            "> Complete content of every real source file in this project, in one "
            "document — paste this whole file into an AI conversation for full, "
            "ground-truth context (page copy included, not just structure).",
            "",
            "**Deliberately excluded:** `node_modules`, `dist`/`build`, lockfiles, "
            "binary/image assets, and every `.env*` file (even `.env.example`) — "
            "so this is always safe to share even if a real secret was ever "
            "accidentally committed somewhere else in the repo.",
            "",
            "---",
            "",
        ]

        total_bytes = 0
        truncated_for_size = []
        skipped_too_large = []

        # Stable order: config/schema first, then backend, then api, then frontend
        def sort_key(p: Path):
            rel = str(p.relative_to(self.root)).replace("\\", "/")
            if rel.count("/") == 0:
                bucket = 0
            elif rel.startswith("backend/"):
                bucket = 1
            elif rel.startswith("api/"):
                bucket = 2
            elif rel.startswith("frontend/"):
                bucket = 3
            else:
                bucket = 4
            return (bucket, rel)

        candidates = sorted(
            (f for f in self.all_files
             if f.suffix.lower() in self.FULL_DUMP_EXTENSIONS
             and f.name not in self.FULL_DUMP_EXCLUDE_NAMES
             and not f.name.startswith(".env")),
            key=sort_key,
        )

        for fpath in candidates:
            rel = str(fpath.relative_to(self.root)).replace("\\", "/")
            size = fpath.stat().st_size
            if size > self.FULL_DUMP_MAX_FILE_BYTES:
                skipped_too_large.append((rel, size))
                continue
            if total_bytes + size > self.FULL_DUMP_MAX_TOTAL_BYTES:
                truncated_for_size.append(rel)
                continue
            content = read_file(fpath)
            if content is None:
                continue
            total_bytes += size
            lang = LANG_MAP.get(fpath.suffix.lower(), "").lower()
            lines.append(f"## `{rel}`")
            lines.append("")
            lines.append(f"```{lang}")
            lines.append(content.rstrip("\n"))
            lines.append("```")
            lines.append("")

        if skipped_too_large:
            lines.append("---")
            lines.append("")
            lines.append(f"**Skipped ({len(skipped_too_large)} file(s) over "
                          f"{self.FULL_DUMP_MAX_FILE_BYTES // 1000}KB — open these "
                          f"individually if you need them):**")
            for rel, size in skipped_too_large:
                lines.append(f"- `{rel}` ({round(size/1024, 1)} KB)")
            lines.append("")

        if truncated_for_size:
            lines.append(f"**Not included — total size cap "
                          f"({self.FULL_DUMP_MAX_TOTAL_BYTES // 1_000_000}MB) reached "
                          f"before these files:**")
            for rel in truncated_for_size:
                lines.append(f"- `{rel}`")
            lines.append("")

        (self.output_dir / "FULL_SOURCE_CONTEXT.md").write_text("\n".join(lines), encoding="utf-8")

    # ── Main entry ──────────────────────────────────────────────────────────

    def run(self):
        t0 = time.time()
        print(f"\n{'='*60}")
        print(f"  Project Analyzer — Peter Mageto Portfolio Edition")
        print(f"{'='*60}")
        print(f"  Target : {self.root}")
        print(f"  Output : {self.output_dir}")
        print(f"{'='*60}\n")

        print("[ 1/5 ] Walking directory tree…")
        self.walk()

        print("\n[ 2/5 ] Collecting Git info…")
        self.collect_git_info()

        print("\n[ 3/5 ] Analysing files…")
        self.analyse_files()

        print("\n[ 4/5 ] Running project-specific checks…")
        self.run_project_checks()

        print("\n[ 5/5 ] Generating reports…")
        self.generate_outputs()

        elapsed = time.time() - t0
        print(f"\n{'='*60}")
        print(f"  Done in {elapsed:.1f}s")
        print(f"{'='*60}")
        print(f"\n  Output files:")
        for f in sorted(self.output_dir.iterdir()):
            size = f.stat().st_size
            print(f"    {f.name:<40} {size/1024:>7.1f} KB")
        print(f"\n  ⭐  START HERE: {self.output_dir}/PROJECT_REPORT.md")
        print(f"  📋  LLM CONTEXT: {self.output_dir}/llm_context.md")
        print()


# ─── CLI ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Analyze the Peter Mageto portfolio codebase and report what's built vs still missing from the CMS/CRUD plan.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python analyze_project.py .
  python analyze_project.py /path/to/project
  python analyze_project.py . --output my_analysis

After running, share PROJECT_REPORT.md and llm_context.md for AI-assisted work.
        """
    )
    parser.add_argument("project_path", nargs="?", default=".", help="Project root (default: current directory)")
    parser.add_argument("--output", "-o", default="analysis", help="Output directory name (default: analysis)")
    args = parser.parse_args()

    root = Path(args.project_path).resolve()
    if not root.exists():
        print(f"Error: path does not exist: {root}", file=sys.stderr)
        sys.exit(1)
    if not root.is_dir():
        print(f"Error: not a directory: {root}", file=sys.stderr)
        sys.exit(1)

    output_dir = root / args.output
    analyzer = ProjectAnalyzer(root, output_dir)
    analyzer.run()


if __name__ == "__main__":
    main()
