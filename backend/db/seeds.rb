# This file seeds the database with example data for local development and testing.
# It is idempotent (safe to run repeatedly).

# --- Create a company ---
company = Company.find_or_create_by!(name: "Acme Inc")

# --- Create an admin user associated with the company ---
admin = User.find_or_create_by!(email: "admin3@acme.com") do |u|
  u.password = "password123"
  u.password_confirmation = "password123"
  u.company_id = company.id
end

@acme_admin = User.create!(
  email: "acme_admin@example.com",
  password: "password",
  password_confirmation: "password",
  company: company
)

# --- Create a recruiter user associated with the company ---
recruiter = User.find_or_create_by!(email: "recruiter@acme.com") do |u|
  u.password = "password123"
  u.password_confirmation = "password123"
  u.company_id = company.id
end

# --- Create Jobs first (no JobDescription yet) ---
job1 = Job.create!(
  company: company,
  posted_by_user: admin,
  status: "active"
)

job2 = Job.create!(
  company: company,
  posted_by_user: recruiter,
  status: "active"
)

# --- Create Job Descriptions, each linked to a Job (1:1) ---
jd1 = JobDescription.create!(
  job: job1,
  title: "Fullstack Developer",
  description: "Build web apps using Rails and React.",
  company_name: company.name,
  location: "Remote",
  is_remote: true,
  job_type: "full-time",
  salary_min: 110000,
  salary_max: 150000,
  salary_currency: "USD",
  is_salary_visible: true
)

jd2 = JobDescription.create!(
  job: job2,
  title: "Frontend Engineer",
  description: "Create beautiful user experiences with React and TypeScript.",
  company_name: company.name,
  location: "New York, NY",
  is_remote: false,
  job_type: "full-time",
  salary_min: 130000,
  salary_max: 170000,
  salary_currency: "USD",
  is_salary_visible: true
)

# --- Create (or find) skills and attach to job descriptions ---
skills_fs = %w[ruby rails react postgresql].map { |name| Skill.find_or_create_by!(name: name) }
skills_fe = %w[react typescript css html].map { |name| Skill.find_or_create_by!(name: name) }

jd1.skills = skills_fs
jd2.skills = skills_fe
jd1.save!
jd2.save!

# --- Add another company ---
company2 = Company.find_or_create_by!(name: "Globex Corp")

# --- Create an admin for Globex ---
globex_admin = User.find_or_create_by!(email: "admin@globex.com") do |u|
  u.password = "password123"
  u.password_confirmation = "password123"
  u.company = company2
end

# --- Add jobs to Globex ---
globex_job1 = Job.create!(
  company: company2,
  posted_by_user: globex_admin,
  status: "active"
)
globex_job2 = Job.create!(
  company: company2,
  posted_by_user: globex_admin,
  status: "active"
)

# --- Job Descriptions for Globex Jobs ---
globex_jd1 = JobDescription.create!(
  job: globex_job1,
  title: "Backend Engineer",
  description: "Develop APIs using Go and PostgreSQL.",
  company_name: company2.name,
  location: "Austin, TX",
  is_remote: false,
  job_type: "full-time",
  salary_min: 100000,
  salary_max: 140000,
  salary_currency: "USD",
  is_salary_visible: true
)

globex_jd2 = JobDescription.create!(
  job: globex_job2,
  title: "DevOps Engineer",
  description: "Automate infrastructure using Terraform and AWS.",
  company_name: company2.name,
  location: "Remote",
  is_remote: true,
  job_type: "full-time",
  salary_min: 120000,
  salary_max: 160000,
  salary_currency: "USD",
  is_salary_visible: true
)

globex_skills1 = %w[go postgresql grpc].map { |name| Skill.find_or_create_by!(name: name) }
globex_skills2 = %w[terraform aws docker kubernetes].map { |name| Skill.find_or_create_by!(name: name) }

globex_jd1.skills = globex_skills1
globex_jd2.skills = globex_skills2
globex_jd1.save!
globex_jd2.save!

# --- Add more jobs for Acme ---
job3 = Job.create!(company: company, posted_by_user: admin, status: "active")
job4 = Job.create!(company: company, posted_by_user: recruiter, status: "active")

JobDescription.create!(
  job: job3,
  title: "QA Engineer",
  description: "Ensure product quality with automated testing.",
  company_name: company.name,
  location: "Chicago, IL",
  is_remote: false,
  job_type: "contract",
  salary_min: 90000,
  salary_max: 110000,
  salary_currency: "USD",
  is_salary_visible: true,
  skills: %w[selenium rspec capybara].map { |s| Skill.find_or_create_by!(name: s) }
)

JobDescription.create!(
  job: job4,
  title: "Data Analyst",
  description: "Analyze business data to drive decisions.",
  company_name: company.name,
  location: "Remote",
  is_remote: true,
  job_type: "full-time",
  salary_min: 95000,
  salary_max: 125000,
  salary_currency: "USD",
  is_salary_visible: true,
  skills: %w[sql tableau python].map { |s| Skill.find_or_create_by!(name: s) }
)

# --- Fake applicants for Acme job1 and job2 ---
JobApplication.create!(
  job: job1,
  name: "Alice Johnson",
  email: "alice@example.com",
  phone: "555-1010",
  resume_text: "Experienced fullstack developer with focus on Ruby and React.",
  work_authorization: "US Citizen",
  gender: "Female",
  ethnicity: "Hispanic",
  disability_status: "No",
  veteran_status: "No"
)

JobApplication.create!(
  job: job2,
  name: "Bob Smith",
  email: "bob@example.com",
  phone: "555-2020",
  resume_text: "Frontend expert with strong skills in React and TypeScript.",
  work_authorization: "Green Card",
  gender: "Male",
  ethnicity: "White",
  disability_status: "No",
  veteran_status: "Yes"
)