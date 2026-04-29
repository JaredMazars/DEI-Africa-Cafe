/**
 * Seed demo resources — PDFs and YouTube videos
 * Run: node seed-resources.js
 */
import { executeQuery } from './config/database.js';

const resources = [
  // ── YouTube Videos ─────────────────────────────────────────────────────────
  {
    title: 'The Power of Diversity & Inclusion in the Workplace',
    type: 'video',
    category: 'DEI',
    url: 'https://www.youtube.com/watch?v=qdxNuHO-JHs',
    description: 'An engaging overview of how diversity drives innovation, team performance, and business outcomes. Perfect for onboarding and awareness training.',
    uploader_name: 'DEI Café Team',
    downloads: 142,
    rating: 4.8,
  },
  {
    title: 'Leadership Fundamentals: Building Inclusive Teams',
    type: 'video',
    category: 'Leadership',
    url: 'https://www.youtube.com/watch?v=kJ7gPIg2kNE',
    description: 'Practical strategies for leaders to foster belonging, psychological safety, and equity within their teams.',
    uploader_name: 'DEI Café Team',
    downloads: 98,
    rating: 4.6,
  },
  {
    title: 'Unconscious Bias — What It Is and How to Reduce It',
    type: 'video',
    category: 'DEI',
    url: 'https://www.youtube.com/watch?v=dl_IcuGgpAQ',
    description: 'A concise explainer on the science of unconscious bias and evidence-based techniques to minimise its impact in hiring and daily decisions.',
    uploader_name: 'DEI Café Team',
    downloads: 207,
    rating: 4.9,
  },
  {
    title: 'Career Development: Owning Your Professional Growth',
    type: 'video',
    category: 'Career',
    url: 'https://www.youtube.com/watch?v=0pqLsCJWTCs',
    description: 'Actionable advice on setting career goals, finding sponsors, and navigating organisational structures for long-term success.',
    uploader_name: 'DEI Café Team',
    downloads: 75,
    rating: 4.5,
  },

  // ── PDFs / Articles ─────────────────────────────────────────────────────────
  {
    title: 'McKinsey: Diversity Wins — How Inclusion Matters (2020)',
    type: 'pdf',
    category: 'DEI',
    url: 'https://www.mckinsey.com/~/media/mckinsey/featured%20insights/diversity%20and%20inclusion/diversity%20wins%20how%20inclusion%20matters/diversity-wins-how-inclusion-matters-vf.pdf',
    description: 'Landmark McKinsey report analysing data from 1,000+ companies across 15 countries, showing the business case for inclusion at every level.',
    uploader_name: 'DEI Café Team',
    downloads: 389,
    rating: 4.9,
  },
  {
    title: 'Harvard Business Review: The Key to Inclusive Leadership',
    type: 'pdf',
    category: 'Leadership',
    url: 'https://hbr.org/resources/pdfs/comm/achievers/hbr_achievers_report_sep13.pdf',
    description: 'HBR research on the six traits that define inclusive leaders and how organisations can develop these capabilities at scale.',
    uploader_name: 'DEI Café Team',
    downloads: 254,
    rating: 4.7,
  },
  {
    title: 'Deloitte: The Inclusion Imperative for Boards',
    type: 'pdf',
    category: 'DEI',
    url: 'https://www2.deloitte.com/content/dam/Deloitte/us/Documents/center-for-board-effectiveness/us-cbe-the-inclusion-imperative-for-boards.pdf',
    description: 'A practical guide for board-level executives on embedding diversity and inclusion into governance, strategy, and stakeholder reporting.',
    uploader_name: 'DEI Café Team',
    downloads: 118,
    rating: 4.6,
  },
  {
    title: 'Mentoring Best Practices Guide',
    type: 'pdf',
    category: 'Career',
    url: 'https://www.mentoringgroup.com/images/GettingStartedinaFormalMentoringProgram.pdf',
    description: 'Step-by-step guide for both mentors and mentees — how to structure sessions, set goals, give feedback, and measure progress.',
    uploader_name: 'DEI Café Team',
    downloads: 163,
    rating: 4.7,
  },
  {
    title: 'Psychological Safety: The Foundation of High-Performing Teams',
    type: 'article',
    category: 'Leadership',
    url: 'https://rework.withgoogle.com/guides/understanding-team-effectiveness/steps/foster-psychological-safety/',
    description: "Google's Project Aristotle findings on what makes teams effective — with actionable exercises to build trust and safety within your team.",
    uploader_name: 'DEI Café Team',
    downloads: 201,
    rating: 4.8,
  },
  {
    title: 'Forvis Mazars: ESG and Inclusive Business Practices',
    type: 'article',
    category: 'Finance',
    url: 'https://www.forvismazars.com/united-states/en/services/advisory/esg-sustainability',
    description: 'An overview of how ESG frameworks intersect with diversity and inclusion commitments, and what CFOs and finance professionals need to know.',
    uploader_name: 'DEI Café Team',
    downloads: 87,
    rating: 4.4,
  },
];

async function seed() {
  console.log('Seeding resources...');

  // Check if already seeded
  const check = await executeQuery(`SELECT COUNT(*) as cnt FROM resources WHERE is_active = 1`);
  const count = check.recordset[0].cnt;
  if (count > 0) {
    console.log(`Resources table already has ${count} active rows. Skipping seed.`);
    process.exit(0);
  }

  for (const r of resources) {
    const desc = r.description ? `'${r.description.replace(/'/g, "''")}'` : 'NULL';
    await executeQuery(`
      INSERT INTO resources (title, type, category, url, description, uploader_name, downloads, rating, is_active, created_at, updated_at)
      VALUES (
        '${r.title.replace(/'/g, "''")}',
        '${r.type}',
        '${r.category}',
        '${r.url.replace(/'/g, "''")}',
        ${desc},
        '${r.uploader_name}',
        ${r.downloads},
        ${r.rating},
        1,
        GETDATE(), GETDATE()
      )
    `);
    console.log(`  ✓ ${r.title}`);
  }

  console.log(`\nDone! Seeded ${resources.length} resources.`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
