// Downloads the two approved photos and attaches them to the Overview and
// Leadership hero slides via the real API — no manual dashboard clicking needed.
//
// Usage:
//   SITE_URL=https://prof-peter-mageto.vercel.app \
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... \
//   OVERVIEW_PHOTO_URL="<direct image url from step 1>" \
//   LEADERSHIP_PHOTO_URL="<direct image url from step 1>" \
//   node backend/scripts/set-launch-photos.mjs

const SITE_URL = process.env.SITE_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const PHOTOS = {
  overview: process.env.OVERVIEW_PHOTO_URL,
  leadership: process.env.LEADERSHIP_PHOTO_URL,
};

for (const [key, value] of Object.entries({ SITE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ...PHOTOS })) {
  if (!value) {
    console.error(`Missing required env var for: ${key}`);
    process.exit(1);
  }
}

async function login() {
  const res = await fetch(`${SITE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.message || 'Login failed');
  return payload.token;
}

async function uploadPhoto(token, sourceUrl, filename) {
  const sourceRes = await fetch(sourceUrl);
  if (!sourceRes.ok) throw new Error(`Could not fetch ${sourceUrl} (${sourceRes.status})`);
  const bytes = Buffer.from(await sourceRes.arrayBuffer());
  const contentType = sourceRes.headers.get('content-type') || 'image/jpeg';

  const uploadRes = await fetch(`${SITE_URL}/api/uploads?filename=${encodeURIComponent(filename)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': contentType },
    body: bytes,
  });
  const payload = await uploadRes.json();
  if (!uploadRes.ok) throw new Error(payload.message || 'Upload failed');
  return payload.url; // now hosted on this project's own Vercel Blob storage
}

async function attachToSlide(token, pageKey, backgroundImageUrl) {
  const slidesRes = await fetch(`${SITE_URL}/api/hero-slides/${pageKey}`);
  const { heroSlides } = await slidesRes.json();
  const target = heroSlides?.[0];
  if (!target) throw new Error(`No existing hero slide found for "${pageKey}" — run seed-profile.mjs first.`);

  const res = await fetch(`${SITE_URL}/api/hero-slides/${pageKey}/${target.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ backgroundImageUrl }), // other fields untouched — backend coalesces
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to attach photo to slide');
}

const token = await login();
for (const [pageKey, sourceUrl] of Object.entries(PHOTOS)) {
  console.log(`Uploading photo for "${pageKey}"...`);
  const hostedUrl = await uploadPhoto(token, sourceUrl, `${pageKey}-hero.jpg`);
  await attachToSlide(token, pageKey, hostedUrl);
  console.log(`  ✓ ${pageKey} now uses ${hostedUrl}`);
}
console.log('Done. Both photos are now hosted on this project\'s own storage and attached to their slides.');
