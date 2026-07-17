export const SITE_NAME = 'The Peter Mageto Leadership Portfolio';
export const navItems = [
  { to: '/', label: 'Overview', summary: 'Executive profile landing page' },
  { to: '/leadership', label: 'Leadership', summary: 'Institutional service and governance' },
  { to: '/scholarship', label: 'Scholarship', summary: 'Ethics, theology, research themes' },
  { to: '/strategy', label: 'Strategy', summary: '2023-2027 strategic priorities' },
  { to: '/roadmap', label: 'Roadmap', summary: 'Future website improvements' },
  { to: '/contact', label: 'Contact', summary: 'Secure enquiries and workflow' },
  { to: '/sources', label: 'Sources', summary: 'Verified public references' },
  { to: '/dashboard', label: 'Dashboard', summary: 'Admin inbox and content tools' },
];

export const highlights = [
  { value: '5th', label: 'Vice Chancellor of Africa University' },
  { value: '25+', label: 'Years in ministry and higher education' },
  { value: '2023-2027', label: 'Strategic plan leadership period' },
  { value: 'Pan-African', label: 'Institutional identity and mission' },
];

export const credentials = [
  'Ph.D. in Theological Ethics, Garrett-Evangelical Theological Seminary, USA',
  'Master of Theological Studies, Garrett-Evangelical Theological Seminary, USA',
  "Bachelor of Divinity, St Paul's United Theological College, Kenya",
  'Postgraduate certificate in African Studies, Northwestern University',
];

export const career = [
  { role: 'Vice Chancellor', place: 'Africa University, Zimbabwe', note: 'Leads the pan-African United Methodist-related institution as its fifth Vice Chancellor.' },
  { role: 'Deputy Vice Chancellor and Interim Vice Chancellor', place: 'Africa University', note: 'Served in senior academic leadership before his installation as Vice Chancellor.' },
  { role: 'Vice Chancellor and Professor of Ethics', place: 'University of Kigali, Rwanda', note: 'Advanced institutional leadership, academic quality, and ethical scholarship.' },
  { role: 'Academic Leader and Ethics Scholar', place: 'Kenya Methodist University, Daystar University, University of Evansville', note: 'Held roles across academic affairs, student welfare, ethics teaching, and departmental leadership.' },
];

export const strategyGoals = [
  'Enhance student access and success',
  'Invest in and empower staff',
  'Increase financial stewardship and institutional sustainability',
  'Cultivate strategic partnerships and economic competitiveness',
  'Internationalize research, teaching, and learning',
];

export const leadershipFocus = [
  { title: 'Student access and success', text: 'Positioning the university to support student opportunity, retention, learning quality, and graduate impact.' },
  { title: 'Values-led governance', text: 'Connecting institutional decisions to ethics, accountability, community, and Africa University values.' },
  { title: 'Research internationalization', text: 'Strengthening teaching, research, and partnerships that connect Africa University to the continent and the world.' },
  { title: 'Sustainable growth', text: 'Prioritizing stewardship, partnerships, and financial sustainability for long-term institutional resilience.' },
];

export const stakeholderPaths = [
  'Prospective students and families seeking an institutional leadership profile',
  'Partners and donors evaluating strategic direction and credibility',
  'Media teams looking for verified biography, role, and contact information',
  'Academic collaborators reviewing scholarship, ethics, and leadership background',
];

export const researchThemes = ['Ethics', 'Theology', 'HIV/AIDS', 'Education', 'Peace', 'Reconciliation'];
export const publications = [
  'Victim Theology',
  'Corporate and personal ethics for sustainable development',
  'Book Review: European Traditions in the Study of Religion in Africa',
];

export const roadmap = [
  'Client-approved portrait, biography, speeches, awards, and media assets',
  'Dedicated pages for biography, publications, speeches, media, and gallery',
  'Secure Neon-backed admin CMS for communications staff to update approved content',
  'Official contact form with spam protection, inbox workflow, and email delivery',
  'Custom domain, analytics, sitemap, performance review, and launch checklist',
];

export const sources = [
  { label: 'Africa University official Vice Chancellor profile', url: 'https://africau.edu/about/vice-chancellor/' },
  { label: 'UM News profile on Prof. Mageto', url: 'https://www.umnews.org/news/new-vice-chancellor-fulfills-calling-at-africa-university' },
  { label: 'Africa University 2023/27 Strategic Plan launch', url: 'https://aunews.africau.edu/africa-universitys-vice-chancellor-launches-2023-27-strategic-plan/' },
  { label: 'Africa University official contact page', url: 'https://africau.edu/about/contact-us/' },
];

/* ── Fallback hero slides ──────────────────────────────────
   Shown when the backend API is unreachable or hasn't seeded data.
   Each page_key maps to one slide so every page has a visible banner. */
export const fallbackHeroSlides = [
  {
    id: 'fb-overview',
    page_key: 'overview',
    sort_order: 0,
    eyebrow: 'Africa University Vice Chancellor',
    heading: 'Rev. Professor Peter Mageto',
    subheading: 'The fifth Vice Chancellor of Africa University, a theological ethics scholar and institutional leader advancing pan-African education through justice, equity, collaboration, and student-centered transformation.',
    body: null,
    panel_caption: 'Leading Africa University into a new era of excellence, access, and continental impact.',
    background_image_url: null,
  },
  {
    id: 'fb-leadership',
    page_key: 'leadership',
    sort_order: 0,
    eyebrow: 'Institutional Service',
    heading: 'Leadership & Governance',
    subheading: 'A career spanning multiple institutions across Africa and the United States, grounded in ethical scholarship and transformational governance.',
    body: null,
    panel_caption: 'From Kenya Methodist University to Africa University — a lifelong commitment to values-led leadership.',
    background_image_url: null,
  },
  {
    id: 'fb-scholarship',
    page_key: 'scholarship',
    sort_order: 0,
    eyebrow: 'Academic Profile',
    heading: 'Scholarship & Research',
    subheading: 'Theological ethics scholar with a Ph.D. from Garrett-Evangelical, advancing discourse on justice, reconciliation, HIV/AIDS, and sustainable development.',
    body: null,
    panel_caption: 'Author of "Victim Theology" and contributor to African ethical scholarship.',
    background_image_url: null,
  },
  {
    id: 'fb-strategy',
    page_key: 'strategy',
    sort_order: 0,
    eyebrow: '2023\u20132027 Strategic Plan',
    heading: 'Strategy & Vision',
    subheading: 'Five strategic goals positioning Africa University for sustainable growth, internationalized research, empowered staff, and enhanced student success.',
    body: null,
    panel_caption: 'A roadmap for pan-African academic excellence and institutional resilience.',
    background_image_url: null,
  },
  {
    id: 'fb-roadmap',
    page_key: 'roadmap',
    sort_order: 0,
    eyebrow: 'Platform Development',
    heading: 'Portfolio Roadmap',
    subheading: 'Milestones toward a fully operational leadership portfolio \u2014 from content approval to CMS deployment and official launch.',
    body: null,
    panel_caption: 'Building a digital presence worthy of Africa University.',
    background_image_url: null,
  },
  {
    id: 'fb-contact',
    page_key: 'contact',
    sort_order: 0,
    eyebrow: 'Get in Touch',
    heading: 'Contact the Office',
    subheading: 'Reach the Vice Chancellor\'s office through official channels. Enquiries are routed securely and responded to by the communications team.',
    body: null,
    panel_caption: 'Africa University, Old Mutare, Manicaland, Zimbabwe.',
    background_image_url: null,
  },
  {
    id: 'fb-sources',
    page_key: 'sources',
    sort_order: 0,
    eyebrow: 'Transparency & Trust',
    heading: 'Verified Sources',
    subheading: 'Every claim on this portfolio is traced to an official public source. No unverified material is presented.',
    body: null,
    panel_caption: 'Built on Africa University publications, UM News, and institutional records.',
    background_image_url: null,
  },
];


