import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required to seed profile content.');
  process.exit(1);
}

const sql = neon(databaseUrl);

await sql`insert into profile (id) values (1) on conflict (id) do nothing`;
await sql`
  update profile set
    full_name = 'Rev. Professor Peter Mageto',
    title = 'Fifth Vice Chancellor of Africa University',
    email = ${process.env.PROFILE_EMAIL || null},
    phone = ${process.env.PROFILE_PHONE || null},
    updated_at = now()
  where id = 1
`;

const slides = [
  // ── Overview (Home) Carousel ──
  ['overview', 'Africa University Vice Chancellor', 'Rev. Professor Peter Mageto', 'The fifth Vice Chancellor of Africa University — a theological ethics scholar advancing pan-African education through justice, equity, and student-centered transformation.', 'Leading Africa University into a new era of excellence, access, and continental impact.', 'https://www.umnews.org/-/media/umc-media/2022/10/20/20/45/au-mageto-profile-1-horizontal-1200x800.jpg', 'Executive Profile', '/leadership'],
  ['overview', 'Institutional Service', 'Leadership & Governance', 'A career spanning Africa and the United States — from Kenya Methodist University to the Vice Chancellorship of Africa University — grounded in ethical scholarship.', 'A lifelong commitment to values-led institutional leadership.', 'https://africau.edu/wp-content/uploads/2023/12/profmageto-1.png', 'View Leadership Profile', '/leadership'],
  ['overview', 'Academic Profile', 'Scholarship & Research', 'Ph.D. in Theological Ethics from Garrett-Evangelical — advancing discourse on justice, reconciliation, HIV/AIDS, and sustainable development across the continent.', 'Author of "Victim Theology" and contributor to African ethical scholarship.', 'https://africau.edu/wp-content/themes/africau/images/profmageto.png', 'Explore Scholarship', '/scholarship'],
  ['overview', '2023–2027 Strategic Plan', 'Strategy & Vision', 'Five strategic goals positioning Africa University for sustainable growth, internationalized research, empowered staff, and enhanced student success.', 'A roadmap for pan-African academic excellence and institutional resilience.', 'https://aunews.africau.edu/wp-content/uploads/2023/11/STRATEGIC-PLAN-MEETING-34-800x445.jpg', 'Explore Strategy', '/strategy'],
  ['overview', 'Platform Development', 'Portfolio Roadmap', 'Milestones toward a fully operational leadership portfolio — from content approval to CMS deployment and official public launch.', 'Building a digital presence worthy of Africa University.', 'https://africau.edu/wp-content/themes/africau/images/sunset.jpg', 'View Roadmap', '/roadmap'],
  ['overview', 'Get in Touch', 'Contact the Office', "Reach the Vice Chancellor's office through official channels. Enquiries are routed securely and responded to by the communications team.", 'Africa University, Old Mutare, Manicaland, Zimbabwe.', 'https://aunews.africau.edu/wp-content/uploads/2026/03/AU-BOD-DINNER-MARCH-2026-02-800x445.jpg', 'Contact the Office', '/contact'],
  ['overview', 'Transparency & Trust', 'Verified Sources', 'Every claim on this portfolio is traced to an official public source — Africa University publications, UM News, and institutional records.', 'No claim without a verified citation.', 'https://www.umnews.org/-/media/umc-media/2022/10/20/20/45/au-mageto-profile-1-horizontal-1200x800.jpg', 'View Sources', '/sources'],
  
  // ── Individual Static Pages ──
  ['leadership', 'Institutional Service', 'Leadership & Governance', 'A career spanning multiple institutions across Africa and the United States, grounded in ethical scholarship and transformational governance.', 'From Kenya Methodist University to Africa University — a lifelong commitment to values-led leadership.', 'https://africau.edu/wp-content/uploads/2023/12/profmageto-1.png', null, null],
  ['scholarship', 'Academic Profile', 'Scholarship & Research', 'Theological ethics scholar with a Ph.D. from Garrett-Evangelical, advancing discourse on justice, reconciliation, HIV/AIDS, and sustainable development.', 'Author of "Victim Theology" and contributor to African ethical scholarship.', 'https://www.umnews.org/-/media/umc-media/2022/10/20/20/51/au-mageto-profile-2-vertical-280.jpg', null, null],
  ['strategy', '2023–2027 Strategic Plan', 'Strategy & Vision', 'Five strategic goals positioning Africa University for sustainable growth, internationalized research, empowered staff, and enhanced student success.', 'A roadmap for pan-African academic excellence and institutional resilience.', 'https://aunews.africau.edu/wp-content/uploads/2023/11/STRATEGIC-PLAN-MEETING-34-800x445.jpg', null, null],
  ['roadmap', 'Platform Development', 'Portfolio Roadmap', 'Milestones toward a fully operational leadership portfolio — from content approval to CMS deployment and official launch.', 'Building a digital presence worthy of Africa University.', 'https://africau.edu/wp-content/themes/africau/images/sunset.jpg', null, null],
  ['contact', 'Get in Touch', 'Contact the Office', "Reach the Vice Chancellor's office through official channels. Enquiries are routed securely and responded to by the communications team.", 'Africa University, Old Mutare, Manicaland, Zimbabwe.', 'https://aunews.africau.edu/wp-content/uploads/2026/03/AU-BOD-DINNER-MARCH-2026-02-800x445.jpg', null, null],
  ['sources', 'Transparency & Trust', 'Verified Sources', 'Every claim on this portfolio is traced to an official public source. No unverified material is presented.', 'Built on Africa University publications, UM News, and institutional records.', 'https://africau.edu/wp-content/themes/africau/images/profmageto.png', null, null]
];
await sql`delete from hero_slides`;
for (const [sortOrder, slide] of slides.entries()) {
  await sql`insert into hero_slides (page_key, eyebrow, heading, subheading, panel_caption, background_image_url, cta_label, cta_href, sort_order) values (${slide[0]}, ${slide[1]}, ${slide[2]}, ${slide[3]}, ${slide[4]}, ${slide[5]}, ${slide[6]}, ${slide[7]}, ${sortOrder})`;
}

const insertList = async (table, rows, columns = ['label']) => {
  await sql(`delete from ${table}`);
  for (const [sortOrder, row] of rows.entries()) {
    const values = Array.isArray(row) ? row : [row];
    await sql(
      `insert into ${table} (${columns.join(', ')}, sort_order) values (${columns.map((_, i) => '$' + (i + 1)).join(', ')}, $${columns.length + 1})`,
      [...values, sortOrder]
    );
  }
};

await insertList('credentials', [
  'Ph.D. in Theological Ethics, Garrett-Evangelical Theological Seminary, USA',
  'Master of Theological Studies, Garrett-Evangelical Theological Seminary, USA',
  "Bachelor of Divinity, St Paul's United Theological College, Kenya",
  'Postgraduate certificate in African Studies, Northwestern University',
]);
await insertList('career_entries', [
  ['Vice Chancellor', 'Africa University, Zimbabwe', 'Leads the pan-African United Methodist-related institution as its fifth Vice Chancellor.'],
  ['Deputy Vice Chancellor and Interim Vice Chancellor', 'Africa University', 'Served in senior academic leadership before his installation as Vice Chancellor.'],
  ['Vice Chancellor and Professor of Ethics', 'University of Kigali, Rwanda', 'Advanced institutional leadership, academic quality, and ethical scholarship.'],
  ['Academic Leader and Ethics Scholar', 'Kenya Methodist University, Daystar University, University of Evansville', 'Held roles across academic affairs, student welfare, ethics teaching, and departmental leadership.'],
], ['role', 'place', 'note']);
await insertList('publications', ['Victim Theology', 'Corporate and personal ethics for sustainable development', 'Book Review: European Traditions in the Study of Religion in Africa'], ['title']);
await insertList('research_themes', ['Ethics', 'Theology', 'HIV/AIDS', 'Education', 'Peace', 'Reconciliation']);
await insertList('strategy_goals', ['Enhance student access and success', 'Invest in and empower staff', 'Increase financial stewardship and institutional sustainability', 'Cultivate strategic partnerships and economic competitiveness', 'Internationalize research, teaching, and learning']);
await insertList('sources_list', [
  ['Africa University official Vice Chancellor profile', 'https://africau.edu/about/vice-chancellor/'],
  ['UM News profile on Prof. Mageto', 'https://www.umnews.org/news/new-vice-chancellor-fulfills-calling-at-africa-university'],
  ['Africa University 2023/27 Strategic Plan launch', 'https://aunews.africau.edu/africa-universitys-vice-chancellor-launches-2023-27-strategic-plan/'],
  ['Africa University official contact page', 'https://africau.edu/about/contact-us/'],
], ['label', 'url']);
await insertList('social_links', [['website', 'https://africau.edu/about/vice-chancellor/']], ['platform', 'url']);

console.log('Profile content seeded.');
