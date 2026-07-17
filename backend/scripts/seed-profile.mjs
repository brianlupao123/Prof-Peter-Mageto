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
  ['overview', 'Africa University Vice Chancellor', 'Rev. Professor Peter Mageto', 'The fifth Vice Chancellor of Africa University, a theological ethics scholar and institutional leader advancing pan-African education through justice, equity, collaboration, and student-centered transformation.', 'Leadership anchored in people and values.'],
  ['leadership', 'Leadership', 'Institutional leadership across higher education and ministry.', "Prof. Mageto's public leadership story connects ethics, formation, academic quality, student welfare, and pan-African mission.", "Guiding Africa University's mission and people."],
  ['scholarship', 'Scholarship', 'Academic foundation in theology, ethics, and African studies.', 'His research and publications engage ethics, HIV/AIDS, education, peace, and reconciliation across the continent.', 'Scholarship in service of the institution.'],
  ['strategy', 'Strategy', "Africa University's Strategic Plan 2023-2027.", "Student access, staff investment, financial stewardship, partnerships, and internationalized research define the plan's five priorities.", 'Leading the plan from the front.'],
  ['roadmap', 'Roadmap', "What's next for this platform.", "A transparent list of what's approved, what's in progress, and what's planned before public launch.", 'Building toward full launch.'],
  ['contact', 'Contact', 'Reach the Office of the Vice Chancellor.', 'Official Africa University channels, plus a direct message form for signed-in visitors.', 'Open channels, real follow-up.'],
  ['sources', 'Sources', 'Every claim on this site, traceable.', "Verified against Africa University's official site, UM News, and public coverage.", 'Built on public record, not guesswork.'],
];
await sql`delete from hero_slides`;
for (const [sortOrder, slide] of slides.entries()) {
  await sql`insert into hero_slides (page_key, eyebrow, heading, subheading, panel_caption, sort_order) values (${slide[0]}, ${slide[1]}, ${slide[2]}, ${slide[3]}, ${slide[4]}, ${sortOrder})`;
}

const insertList = async (table, rows, columns = ['label']) => {
  await sql.query(`delete from ${table}`);
  for (const [sortOrder, row] of rows.entries()) {
    const values = Array.isArray(row) ? row : [row];
    await sql.query(
      `insert into ${table} (${columns.join(', ')}, sort_order) values (${columns.map((_, i) => '$' + (i + 1)).join(', ')}, $${columns.length + 1})`,
      [...values, sortOrder],
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
