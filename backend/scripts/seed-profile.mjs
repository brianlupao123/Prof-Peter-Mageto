import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) { console.error('DATABASE_URL is required.'); process.exit(1); }
const sql = neon(databaseUrl);

await sql`
  update profile set
    full_name = 'Rev. Professor Peter Mageto',
    title = 'Fifth Vice Chancellor of Africa University',
    email = ${process.env.PROFILE_EMAIL || 'info@africau.edu'},
    phone = ${process.env.PROFILE_PHONE || '+263 8688002151'},
    address = 'Africa University, 1 Fairview Rd, Old Mutare, Zimbabwe',
    updated_at = now()
  where id = 1
`;
for (const table of ['hero_slides', 'credentials', 'career_entries', 'publications', 'research_themes', 'strategy_goals', 'sources_list']) {
  await sql(`delete from ${table}`);
}
const slides = [
  { pageKey: 'overview', eyebrow: 'Africa University Vice Chancellor', heading: 'Rev. Professor Peter Mageto', subheading: 'The fifth Vice Chancellor of Africa University, a theological ethics scholar and institutional leader advancing pan-African education through justice, equity, collaboration, and student-centered transformation.', panelCaption: 'Leading Africa University into a new era of excellence, access, and continental impact.' },
  { pageKey: 'leadership', eyebrow: 'Institutional Service', heading: 'Leadership & Governance', subheading: "A career spanning multiple institutions across Africa and the United States, grounded in ethical scholarship and transformational governance.", panelCaption: 'From Kenya Methodist University to Africa University - a lifelong commitment to values-led leadership.' },
  { pageKey: 'scholarship', eyebrow: 'Academic Profile', heading: 'Scholarship & Research', subheading: 'Theological ethics scholar advancing discourse on justice, reconciliation, HIV/AIDS, and sustainable development.', panelCaption: 'Author of "Victim Theology" and contributor to African ethical scholarship.' },
  { pageKey: 'strategy', eyebrow: '2023-2027 Strategic Plan', heading: 'Strategy & Vision', subheading: 'Five strategic goals positioning Africa University for sustainable growth, internationalized research, empowered staff, and enhanced student success.', panelCaption: 'A roadmap for pan-African academic excellence and institutional resilience.' },
  { pageKey: 'roadmap', eyebrow: 'Platform Development', heading: 'Portfolio Roadmap', subheading: 'Milestones toward a fully operational leadership portfolio.', panelCaption: 'Building a digital presence worthy of Africa University.' },
  { pageKey: 'contact', eyebrow: 'Get in Touch', heading: 'Contact the Office', subheading: "Reach the Vice Chancellor's office through official channels.", panelCaption: 'Africa University, Old Mutare, Manicaland, Zimbabwe.' },
  { pageKey: 'sources', eyebrow: 'Transparency & Trust', heading: 'Verified Sources', subheading: 'Every claim on this portfolio is traced to an official public source.', panelCaption: 'Built on Africa University publications, UM News, and institutional records.' },
];
for (const [i, s] of slides.entries()) {
  await sql`
    insert into hero_slides (page_key, eyebrow, heading, subheading, panel_caption, sort_order)
    values (${s.pageKey}, ${s.eyebrow}, ${s.heading}, ${s.subheading}, ${s.panelCaption}, ${i})
    on conflict do nothing
  `;
}

const credentials = [
  'Ph.D. in Theological Ethics, Garrett-Evangelical Theological Seminary, USA',
  'Master of Theological Studies, Garrett-Evangelical Theological Seminary, USA',
  "Bachelor of Divinity, St Paul's United Theological College, Kenya",
  'Postgraduate Certificate in African Studies, Northwestern University',
];
for (const [i, label] of credentials.entries()) {
  await sql`insert into credentials (label, sort_order) values (${label}, ${i}) on conflict do nothing`;
}

const career = [
  { role: 'Vice Chancellor', place: 'Africa University, Zimbabwe (2022-present)', note: 'The 5th Vice Chancellor of Africa University, and its first non-Zimbabwean VC - leads the pan-African United Methodist-related institution.' },
  { role: 'Deputy Vice Chancellor', place: 'Africa University (2018-2021)', note: 'Senior academic leadership prior to his installation as Vice Chancellor.' },
  { role: 'Vice Chancellor and Professor of Ethics', place: 'University of Kigali, Rwanda', note: 'Advanced institutional leadership, academic quality, and ethical scholarship.' },
  { role: 'Acting Vice Chancellor', place: 'Kenya Methodist University', note: 'Academic affairs, student welfare, and ethics teaching leadership.' },
];
for (const [i, c] of career.entries()) {
  await sql`insert into career_entries (role, place, note, sort_order) values (${c.role}, ${c.place}, ${c.note}, ${i}) on conflict do nothing`;
}

const publications = [
  "Victim Theology: A critical look at the church's response to AIDS (2005)",
  "Silent Church = Death: A critical look at the church's response to HIV/AIDS (2005)",
  'Spiritual Gullibility in Search of Health: Tragedies of Scarcity and Sanctity in African Contexts (2020)',
  'Corporate and personal ethics for sustainable development: experiences, challenges and promises (2015)',
];
for (const [i, title] of publications.entries()) {
  await sql`insert into publications (title, sort_order) values (${title}, ${i}) on conflict do nothing`;
}

const researchThemes = ['Ethics', 'Theology', 'HIV/AIDS in Africa', 'Peace & Reconciliation', 'Educational Transformation', 'Pastoral Care'];
for (const [i, label] of researchThemes.entries()) {
  await sql`insert into research_themes (label, sort_order) values (${label}, ${i}) on conflict do nothing`;
}

const strategyGoals = [
  'Enhance student access and success',
  'Invest in and empower staff',
  'Increase financial stewardship and institutional sustainability',
  'Cultivate strategic partnerships and economic competitiveness',
  'Internationalize research, teaching, and learning',
];
for (const [i, label] of strategyGoals.entries()) {
  await sql`insert into strategy_goals (label, sort_order) values (${label}, ${i}) on conflict do nothing`;
}

const sources = [
  { label: 'Africa University official Vice Chancellor profile', url: 'https://africau.edu/about/vice-chancellor/', publisher: 'Africa University', sourceType: 'official', verified: true, retired: false },
  { label: 'Africa University faculty directory profile', url: 'https://africau.edu/faculty-staff/rev-peter-mageto/', publisher: 'Africa University', sourceType: 'official', verified: true, retired: false },
  { label: 'UM News: 5th Vice Chancellor installation', url: 'https://www.umnews.org/news/new-vice-chancellor-fulfills-calling-at-africa-university', publisher: 'United Methodist News', sourceType: 'press', publishedDate: '2022-03-01', verified: true, retired: false },
  { label: 'Africa University 2023/27 Strategic Plan launch', url: 'https://aunews.africau.edu/africa-universitys-vice-chancellor-launches-2023-27-strategic-plan/', publisher: 'Africa University News', sourceType: 'official', verified: true, retired: false },
  { label: 'Wikipedia biography', url: 'https://en.wikipedia.org/wiki/Peter_Mageto', publisher: 'Wikipedia', sourceType: 'contextual', verified: false, retired: false },
  { label: 'ResearchGate - Spiritual Gullibility in Search of Health', url: 'https://www.researchgate.net/publication/356651216_Spiritual_Gullibility_in_Search_of_Health_Tragedies_of_Scarcity_and_Sanctity_in_African_Contexts', publisher: 'ResearchGate', sourceType: 'scholarly', verified: false, retired: true },
  { label: 'Amani Partners feature profile', url: 'https://amanipartners.org/peter-mageto-maiko/', publisher: 'Amani Partners', sourceType: 'contextual', verified: false, retired: false },
  { label: 'Africa University official contact page', url: 'https://africau.edu/about/contact-us/', publisher: 'Africa University', sourceType: 'official', verified: true, retired: false },
];
for (const [i, s] of sources.entries()) {
  await sql`
    insert into sources_list (label, url, sort_order, publisher, source_type, published_date, verified, retired)
    values (${s.label}, ${s.url}, ${i}, ${s.publisher}, ${s.sourceType}, ${s.publishedDate || null}, ${s.verified}, ${s.retired})
    on conflict do nothing
  `;
}

console.log('Profile content seeded - all pages should now be fully populated.');

