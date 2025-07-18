// generate_demo_data.js
// Node.js script to generate large demo SQL data for ATS


const fs = require('fs');
const path = require('path');
const faker = require('faker');

const NUM_CANDIDATES = 500;
const NUM_INTERVIEWS = 1000;
const NUM_FEEDBACK = 1000;
const NUM_RECOMMENDATIONS = 1000;

const tagsList = ['Java', 'React', 'Python', 'Manager', 'Remote', 'Intern'];
const interviewTypes = ['Screening', 'Technical', 'HR', 'Executive'];
const results = ['Selected', 'Rejected', 'On Hold'];
const stages = ['Screening', 'Technical', 'HR', 'Executive'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTags() {
  return Array.from(new Set(Array(2).fill().map(() => randomFrom(tagsList)))).join(',');
}

function pad(n, width = 3) {
  return n.toString().padStart(width, '0');
}

let sql = '-- demo_candidates.sql\nUSE ats_db;\n\n';

// Candidates
sql += 'INSERT INTO candidates (name, email, phone, resume_url, cv_file, tags, enabled) VALUES\n';
for (let i = 1; i <= NUM_CANDIDATES; i++) {
  const name = faker.name.findName();
  const email = faker.internet.email(name.split(' ')[0], name.split(' ')[1]);
  const phone = faker.phone.phoneNumber('90000####');
  const resume_url = faker.internet.url();
  const cv_file = `${name.replace(/\s/g, '').toLowerCase()}.pdf`;
  sql += `  ('${name.replace(/'/g, '')}', '${email}', '${phone}', '${resume_url}', '${cv_file}', '${randomTags()}', TRUE)`;
  sql += (i < NUM_CANDIDATES) ? ',\n' : ';\n\n';
}

// Interview History
sql += 'INSERT INTO candidate_interview_history (candidate_id, interview_date, interview_type, panel_members, feedback, result) VALUES\n';
for (let i = 1; i <= NUM_INTERVIEWS; i++) {
  const cid = (i % NUM_CANDIDATES) + 1;
  const date = faker.date.between('2025-01-01', '2025-07-01').toISOString().slice(0, 10);
  const type = randomFrom(interviewTypes);
  const panels = `${faker.datatype.number({ min: 1, max: 10 })},${faker.datatype.number({ min: 11, max: 20 })}`;
  const feedback = faker.lorem.sentence();
  const result = randomFrom(results);
  sql += `  (${cid}, '${date}', '${type}', '${panels}', '${feedback.replace(/'/g, '')}', '${result}')`;
  sql += (i < NUM_INTERVIEWS) ? ',\n' : ';\n\n';
}

// Feedback
sql += 'INSERT INTO feedback (candidate_id, stage, feedback_text, panel_member) VALUES\n';
for (let i = 1; i <= NUM_FEEDBACK; i++) {
  const cid = (i % NUM_CANDIDATES) + 1;
  const stage = randomFrom(stages);
  const text = faker.lorem.sentences(2);
  const panel = faker.datatype.number({ min: 1, max: 20 });
  sql += `  (${cid}, '${stage}', '${text.replace(/'/g, '')}', ${panel})`;
  sql += (i < NUM_FEEDBACK) ? ',\n' : ';\n\n';
}

// Recommendations
sql += 'INSERT INTO recommendations (candidate_id, recommendation_text, status, recommended_by) VALUES\n';
for (let i = 1; i <= NUM_RECOMMENDATIONS; i++) {
  const cid = (i % NUM_CANDIDATES) + 1;
  const text = faker.lorem.sentences(1);
  const status = randomFrom(results);
  const by = faker.datatype.number({ min: 1, max: 10 });
  sql += `  (${cid}, '${text.replace(/'/g, '')}', '${status}', ${by})`;
  sql += (i < NUM_RECOMMENDATIONS) ? ',\n' : ';\n\n';
}

fs.writeFileSync(path.join(__dirname, 'demo_candidates.sql'), sql);
console.log('Demo data SQL file generated: demo_candidates.sql');
