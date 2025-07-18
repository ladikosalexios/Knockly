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
  experience_level: "mid",
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
  experience_level: "senior",
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
