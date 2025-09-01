# This file seeds the database with example data for local development and testing.
# It is idempotent (safe to run repeatedly).

require "date"

RICH_RESUMES = [
  <<~RESUME1,
    Alice Johnson
    alice@example.com ❖ (555) 1010 ❖ Austin, TX

    WORK EXPERIENCE

    FinTech Labs                           March 2021 – Present
    Software Engineer                      Austin, TX
        • Implemented payment microservices in Ruby on Rails, handling $2M daily transactions.
        • Introduced React front-end pattern library cutting UI development time by 40%.

    Creative Apps Inc.                     July 2018 – February 2021
    Full-Stack Developer                   Austin, TX
        • Built internal tools with Node.js and Vue.js used by 50+ employees.
        • Optimized PostgreSQL queries reducing report generation time from 2m to 20s.

    EDUCATION

    University of Texas                    August 2014 – May 2018
    B.S. in Computer Science               Austin, TX

    SKILLS

        • Ruby on Rails, React, PostgreSQL, Vue.js, Node.js
RESUME1
  <<~RESUME2,
    Carlos Ramirez
    carlos@example.com ❖ (555) 3030 ❖ Denver, CO

    WORK EXPERIENCE

    ShopNow                                January 2019 – Present
    Senior Backend Engineer                Denver, CO
        • Designed event-driven architecture with Kafka processing 5M messages/day.
        • Led GraphQL API adoption reducing client network calls by 60%.

    CloudMarket                            June 2015 – December 2018
    Software Engineer                      Denver, CO
        • Migrated monolith to microservices in Go and gRPC.
        • Built CI/CD pipeline with Jenkins and Docker cutting deployments from hours to minutes.

    EDUCATION

    Colorado State University              August 2011 – May 2015
    B.S. in Software Engineering           Fort Collins, CO

    SKILLS

        • Go, Ruby, GraphQL, Kafka, Docker, AWS
RESUME2
  <<~RESUME3,
    Bob Smith
    bob@example.com ❖ (555) 2020 ❖ Portland, OR

    WORK EXPERIENCE

    WebWorks                               February 2020 – Present
    Frontend Developer                     Remote
        • Developed reusable React components increasing development speed by 30%.
        • Integrated TypeScript improving code reliability and catching 100+ bugs pre-prod.

    Designify                              May 2017 – January 2020
    UI Developer                           Portland, OR
        • Created responsive UI for e-commerce platform serving 200k users.
        • Collaborated with designers to implement accessible interfaces.

    EDUCATION

    Portland State University              September 2013 – June 2017
    B.S. in Computer Science               Portland, OR

    SKILLS

        • React, TypeScript, CSS, HTML, Redux
RESUME3
  <<~RESUME4,
    Dana Lee
    dana@example.com ❖ (555) 4040 ❖ Seattle, WA

    WORK EXPERIENCE

    DesignHub                              April 2018 – Present
    UI Engineer                            Seattle, WA
        • Led migration to modern design system with Figma and React.
        • Collaborated with product to deliver features used by 1M users.

    MediaMart                              July 2015 – March 2018
    Frontend Engineer                      San Diego, CA
        • Built interactive dashboards in Vue.js for marketing teams.
        • Implemented automated visual regression tests.

    EDUCATION

    University of Washington               September 2011 – June 2015
    B.A. in Graphic Design                 Seattle, WA

    SKILLS

        • React, Vue.js, CSS, Figma, Jest
RESUME4
  <<~RESUME5,
    Emily Davis
    emily@example.com ❖ (555) 5050 ❖ Chicago, IL

    WORK EXPERIENCE

    QualitySoft                            June 2019 – Present
    QA Analyst                             Chicago, IL
        • Authored Selenium tests covering 95% of critical user flows.
        • Set up continuous testing with CircleCI reducing regressions by 70%.

    DataSecure                              July 2017 – May 2019
    Test Engineer                           Chicago, IL
        • Created load testing suite in JMeter supporting 50k concurrent users.
        • Documented test plans adopted across teams.

    EDUCATION

    Illinois Institute of Technology       August 2013 – May 2017
    B.S. in Information Systems            Chicago, IL

    SKILLS

        • Selenium, RSpec, JMeter, CircleCI, AWS
RESUME5
  <<~RESUME6,
    Frank Ortiz
    frank@example.com ❖ (555) 6060 ❖ Miami, FL

    WORK EXPERIENCE

    DataCorp                               January 2018 – Present
    Data Analyst                           Miami, FL
        • Built Tableau dashboards influencing $3M in annual sales strategy.
        • Automated ETL pipelines in Python reducing manual reporting by 80%.

    MarketMetrics                           June 2015 – December 2017
    Business Analyst                        Miami, FL
        • Conducted A/B tests driving 15% increase in conversions.
        • Maintained SQL data warehouse with 2TB of data.

    EDUCATION

    Florida International University       August 2011 – May 2015
    B.S. in Mathematics                    Miami, FL

    SKILLS

        • SQL, Tableau, Python, Excel, Statistics
RESUME6
  <<~RESUME7,
    Grace Hopper
    grace@example.com ❖ (555) 7070 ❖ New York, NY

    WORK EXPERIENCE

    SystemSoft                             January 2015 – Present
    Backend Engineer                       New York, NY
        • Developed Go microservices handling 10k requests/sec.
        • Introduced gRPC communication reducing latency by 40%.

    CodeLogic                              June 2012 – December 2014
    Software Engineer                      New York, NY
        • Maintained legacy Java services and gradually migrated to Go.
        • Mentored junior engineers on best practices.

    EDUCATION

    Yale University                         September 2008 – May 2012
    M.S. in Computer Science                New Haven, CT

    SKILLS

        • Go, gRPC, PostgreSQL, Kubernetes, Java
RESUME7
  <<~RESUME8,
    Henry Ford
    henry@example.com ❖ (555) 8080 ❖ Detroit, MI

    WORK EXPERIENCE

    MotorSoft                             March 2017 – Present
    API Developer                         Detroit, MI
        • Designed RESTful APIs in Go serving mobile clients.
        • Implemented Docker-based development environment.

    AutoApps                              July 2014 – February 2017
    Software Engineer                     Detroit, MI
        • Migrated monolithic app to microservices architecture.
        • Introduced automated deployment with Jenkins.

    EDUCATION

    University of Michigan                September 2010 – May 2014
    B.S. in Computer Engineering          Ann Arbor, MI

    SKILLS

        • Go, Docker, PostgreSQL, Jenkins, REST APIs
RESUME8
  <<~RESUME9,
    Isabel Allende
    isabel@example.com ❖ (555) 9090 ❖ San Francisco, CA

    WORK EXPERIENCE

    CloudOps                               June 2016 – Present
    DevOps Specialist                      San Francisco, CA
        • Managed AWS infrastructure with Terraform and Kubernetes.
        • Built monitoring stack with Prometheus and Grafana.

    NetSecure                              August 2013 – May 2016
    Systems Engineer                       San Francisco, CA
        • Automated deployments with Ansible across 200 servers.
        • Implemented disaster recovery strategy reducing downtime to <1h.

    EDUCATION

    San Jose State University             September 2009 – May 2013
    B.S. in Information Technology        San Jose, CA

    SKILLS

        • Terraform, AWS, Kubernetes, Docker, Prometheus
RESUME9
  <<~RESUME10,
    Jack Sparrow
    jack@example.com ❖ (555) 0101 ❖ Tampa, FL

    WORK EXPERIENCE

    PirateCloud                            January 2018 – Present
    Cloud Engineer                         Remote
        • Deployed secure AWS infrastructure for global clients.
        • Wrote Helm charts simplifying Kubernetes deployments.

    SeaTech                                 May 2015 – December 2017
    DevOps Engineer                         Tampa, FL
        • Containerized legacy apps with Docker.
        • Established logging stack using ELK.

    EDUCATION

    University of South Florida           August 2011 – May 2015
    B.S. in Computer Science              Tampa, FL

    SKILLS

        • AWS, Docker, Kubernetes, Terraform, Helm
RESUME10
]

RESUME_QUEUE = RICH_RESUMES.shuffle

def next_resume
  RESUME_QUEUE.shift || RICH_RESUMES.sample
end

def create_candidate(job:, profile:, experience:, education:, skills:, application:)
  profile_record = ApplicantProfile.find_or_create_by!(email: profile[:email]) do |p|
    p.name = profile[:name]
    p.total_years_experience = profile[:total_years_experience]
  end

  profile_record.applicant_experiences.find_or_create_by!(
    job_title: experience[:job_title],
    company_name: experience[:company_name],
    start_date: experience[:start_date],
    end_date: experience[:end_date],
    description: experience[:description]
  )

  profile_record.applicant_educations.find_or_create_by!(
    degree: education[:degree],
    school: education[:school],
    field_of_study: education[:field_of_study],
    start_year: education[:start_year],
    end_year: education[:end_year],
    description: education[:description]
  )

  skills.each do |name|
    skill = Skill.find_or_create_by!(name: name)
    ApplicantProfileSkill.find_or_create_by!(applicant_profile: profile_record, skill: skill)
  end

  JobApplication.find_or_initialize_by(job: job, email: profile_record.email).tap do |app|
    app.applicant_profile = profile_record
    app.name = profile_record.name
    app.phone = application[:phone]
    app.resume_text = application[:resume_text]
    app.work_authorization = application[:work_authorization]
    app.gender = application[:gender]
    app.ethnicity = application[:ethnicity]
    app.disability_status = application[:disability_status]
    app.veteran_status = application[:veteran_status]
    app.status = application[:status]
    app.save!
  end
end

# --- Acme Inc ---
company = Company.find_or_create_by!(name: "Acme Inc")

looply_admin = User.find_or_create_by!(email: "admin@looply.ai") do |u|
  u.password = "securepassword123"
  u.password_confirmation = "securepassword123"
  u.is_looply_admin = true
  u.company = company
end

admin = User.find_or_create_by!(email: "admin3@acme.com") do |u|
  u.password = "password123"
  u.password_confirmation = "password123"
  u.company = company
end

recruiter = User.find_or_create_by!(email: "recruiter@acme.com") do |u|
  u.password = "password123"
  u.password_confirmation = "password123"
  u.company = company
end

User.find_or_create_by!(email: "acme_admin@example.com") do |u|
  u.password = "password"
  u.password_confirmation = "password"
  u.company = company
end

job1 = Job.find_or_create_by!(company: company, posted_by_user: admin, status: "active")
job2 = Job.find_or_create_by!(company: company, posted_by_user: recruiter, status: "active")
job3 = Job.find_or_create_by!(company: company, posted_by_user: admin, status: "active")
job4 = Job.find_or_create_by!(company: company, posted_by_user: recruiter, status: "active")

jd1 = JobDescription.find_or_create_by!(job: job1) do |jd|
  jd.title = "Fullstack Developer"
  jd.description = "Build web apps using Rails and React."
  jd.company_name = company.name
  jd.location = "Remote"
  jd.is_remote = true
  jd.job_type = "full-time"
  jd.salary_min = 110000
  jd.salary_max = 150000
  jd.salary_currency = "USD"
  jd.is_salary_visible = true
end

jd2 = JobDescription.find_or_create_by!(job: job2) do |jd|
  jd.title = "Frontend Engineer"
  jd.description = "Create beautiful user experiences with React and TypeScript."
  jd.company_name = company.name
  jd.location = "New York, NY"
  jd.is_remote = false
  jd.job_type = "full-time"
  jd.salary_min = 130000
  jd.salary_max = 170000
  jd.salary_currency = "USD"
  jd.is_salary_visible = true
end

jd3 = JobDescription.find_or_create_by!(job: job3) do |jd|
  jd.title = "QA Engineer"
  jd.description = "Ensure product quality with automated testing."
  jd.company_name = company.name
  jd.location = "Chicago, IL"
  jd.is_remote = false
  jd.job_type = "contract"
  jd.salary_min = 90000
  jd.salary_max = 110000
  jd.salary_currency = "USD"
  jd.is_salary_visible = true
end

jd4 = JobDescription.find_or_create_by!(job: job4) do |jd|
  jd.title = "Data Analyst"
  jd.description = "Analyze business data to drive decisions."
  jd.company_name = company.name
  jd.location = "Remote"
  jd.is_remote = true
  jd.job_type = "full-time"
  jd.salary_min = 95000
  jd.salary_max = 125000
  jd.salary_currency = "USD"
  jd.is_salary_visible = true
end

jd1.skills = %w[ruby rails react postgresql].map { |name| Skill.find_or_create_by!(name: name) }
jd2.skills = %w[react typescript css html].map { |name| Skill.find_or_create_by!(name: name) }
jd3.skills = %w[selenium rspec capybara].map { |name| Skill.find_or_create_by!(name: name) }
jd4.skills = %w[sql tableau python].map { |name| Skill.find_or_create_by!(name: name) }
[jd1, jd2, jd3, jd4].each(&:save!)

# --- Globex Corp ---
company2 = Company.find_or_create_by!(name: "Globex Corp")

globex_admin = User.find_or_create_by!(email: "admin@globex.com") do |u|
  u.password = "password123"
  u.password_confirmation = "password123"
  u.company = company2
end

globex_job1 = Job.find_or_create_by!(company: company2, posted_by_user: globex_admin, status: "active")
globex_job2 = Job.find_or_create_by!(company: company2, posted_by_user: globex_admin, status: "active")

globex_jd1 = JobDescription.find_or_create_by!(job: globex_job1) do |jd|
  jd.title = "Backend Engineer"
  jd.description = "Develop APIs using Go and PostgreSQL."
  jd.company_name = company2.name
  jd.location = "Austin, TX"
  jd.is_remote = false
  jd.job_type = "full-time"
  jd.salary_min = 100000
  jd.salary_max = 140000
  jd.salary_currency = "USD"
  jd.is_salary_visible = true
end

globex_jd2 = JobDescription.find_or_create_by!(job: globex_job2) do |jd|
  jd.title = "DevOps Engineer"
  jd.description = "Automate infrastructure using Terraform and AWS."
  jd.company_name = company2.name
  jd.location = "Remote"
  jd.is_remote = true
  jd.job_type = "full-time"
  jd.salary_min = 120000
  jd.salary_max = 160000
  jd.salary_currency = "USD"
  jd.is_salary_visible = true
end

globex_jd1.skills = %w[go postgresql grpc].map { |name| Skill.find_or_create_by!(name: name) }
globex_jd2.skills = %w[terraform aws docker kubernetes].map { |name| Skill.find_or_create_by!(name: name) }
[globex_jd1, globex_jd2].each(&:save!)

# --- Example candidates for Acme ---
create_candidate(
  job: job1,
  profile: { name: "Alice Johnson", email: "alice@example.com", total_years_experience: 5 },
  experience: {
    job_title: "Fullstack Developer",
    company_name: "StartupX",
    start_date: Date.new(2019, 1, 1),
    end_date: Date.new(2022, 12, 31),
    description: "Built features in Rails and React."
  },
  education: {
    degree: "BSc Computer Science",
    school: "State University",
    field_of_study: "Computer Science",
    start_year: 2014,
    end_year: 2018,
    description: "Focused on web development."
  },
  skills: %w[ruby rails react],
  application: {
    phone: "555-1010",
    resume_text: next_resume,
    work_authorization: "US Citizen",
    gender: "Female",
    ethnicity: "Hispanic",
    disability_status: "No",
    veteran_status: "No",
    status: :submitted
  }
)

create_candidate(
  job: job1,
  profile: { name: "Carlos Ramirez", email: "carlos@example.com", total_years_experience: 7 },
  experience: {
    job_title: "Senior Developer",
    company_name: "TechCorp",
    start_date: Date.new(2016, 1, 1),
    end_date: Date.new(2023, 1, 1),
    description: "Led backend services using Rails and GraphQL."
  },
  education: {
    degree: "MSc Computer Science",
    school: "Tech University",
    field_of_study: "Software Engineering",
    start_year: 2012,
    end_year: 2014,
    description: "Advanced algorithms."
  },
  skills: %w[ruby graphql react],
  application: {
    phone: "555-3030",
    resume_text: next_resume,
    work_authorization: "H1B",
    gender: "Male",
    ethnicity: "Latino",
    disability_status: "No",
    veteran_status: "No",
    status: :interviewed
  }
)

create_candidate(
  job: job2,
  profile: { name: "Bob Smith", email: "bob@example.com", total_years_experience: 4 },
  experience: {
    job_title: "Frontend Developer",
    company_name: "WebWorks",
    start_date: Date.new(2020, 1, 1),
    end_date: Date.new(2023, 1, 1),
    description: "Built interactive UIs with React."
  },
  education: {
    degree: "BSc Software Engineering",
    school: "City College",
    field_of_study: "Software Engineering",
    start_year: 2016,
    end_year: 2020,
    description: "Focus on frontend development."
  },
  skills: %w[react typescript css],
  application: {
    phone: "555-2020",
    resume_text: next_resume,
    work_authorization: "Green Card",
    gender: "Male",
    ethnicity: "White",
    disability_status: "No",
    veteran_status: "Yes",
    status: :reviewed
  }
)

create_candidate(
  job: job2,
  profile: { name: "Dana Lee", email: "dana@example.com", total_years_experience: 6 },
  experience: {
    job_title: "UI Engineer",
    company_name: "DesignHub",
    start_date: Date.new(2017, 1, 1),
    end_date: Date.new(2023, 1, 1),
    description: "Specialized in responsive design."
  },
  education: {
    degree: "BA Graphic Design",
    school: "Art School",
    field_of_study: "Graphic Design",
    start_year: 2013,
    end_year: 2017,
    description: "Studied design principles."
  },
  skills: %w[react css figma],
  application: {
    phone: "555-4040",
    resume_text: next_resume,
    work_authorization: "US Citizen",
    gender: "Female",
    ethnicity: "Asian",
    disability_status: "No",
    veteran_status: "No",
    status: :rejected
  }
)

create_candidate(
  job: job3,
  profile: { name: "Emily Davis", email: "emily@example.com", total_years_experience: 3 },
  experience: {
    job_title: "QA Analyst",
    company_name: "QualitySoft",
    start_date: Date.new(2019, 6, 1),
    end_date: Date.new(2023, 1, 1),
    description: "Wrote automated tests for web applications."
  },
  education: {
    degree: "BSc Information Systems",
    school: "State University",
    field_of_study: "Information Systems",
    start_year: 2015,
    end_year: 2019,
    description: "Emphasis on testing."
  },
  skills: %w[selenium rspec],
  application: {
    phone: "555-5050",
    resume_text: next_resume,
    work_authorization: "US Citizen",
    gender: "Female",
    ethnicity: "Black",
    disability_status: "No",
    veteran_status: "No",
    status: :submitted
  }
)

create_candidate(
  job: job4,
  profile: { name: "Frank Ortiz", email: "frank@example.com", total_years_experience: 5 },
  experience: {
    job_title: "Data Analyst",
    company_name: "DataCorp",
    start_date: Date.new(2018, 1, 1),
    end_date: Date.new(2023, 1, 1),
    description: "Analyzed sales data to uncover trends."
  },
  education: {
    degree: "BSc Mathematics",
    school: "Tech College",
    field_of_study: "Mathematics",
    start_year: 2013,
    end_year: 2017,
    description: "Focused on statistics."
  },
  skills: %w[sql tableau python],
  application: {
    phone: "555-6060",
    resume_text: next_resume,
    work_authorization: "US Citizen",
    gender: "Male",
    ethnicity: "Hispanic",
    disability_status: "No",
    veteran_status: "No",
    status: :interviewed
  }
)

# --- Example candidates for Globex ---
create_candidate(
  job: globex_job1,
  profile: { name: "Grace Hopper", email: "grace@example.com", total_years_experience: 8 },
  experience: {
    job_title: "Backend Engineer",
    company_name: "SystemSoft",
    start_date: Date.new(2015, 1, 1),
    end_date: Date.new(2023, 1, 1),
    description: "Built Go microservices."
  },
  education: {
    degree: "MSc Computer Science",
    school: "Computer Institute",
    field_of_study: "Computer Science",
    start_year: 2010,
    end_year: 2012,
    description: "Advanced compiler design."
  },
  skills: %w[go postgresql grpc],
  application: {
    phone: "555-7070",
    resume_text: next_resume,
    work_authorization: "US Citizen",
    gender: "Female",
    ethnicity: "White",
    disability_status: "No",
    veteran_status: "Yes",
    status: :submitted
  }
)

create_candidate(
  job: globex_job1,
  profile: { name: "Henry Ford", email: "henry@example.com", total_years_experience: 6 },
  experience: {
    job_title: "API Developer",
    company_name: "MotorSoft",
    start_date: Date.new(2017, 1, 1),
    end_date: Date.new(2023, 1, 1),
    description: "Designed RESTful APIs."
  },
  education: {
    degree: "BSc Computer Engineering",
    school: "Auto University",
    field_of_study: "Computer Engineering",
    start_year: 2011,
    end_year: 2015,
    description: "Focused on embedded systems."
  },
  skills: %w[go postgresql docker],
  application: {
    phone: "555-8080",
    resume_text: next_resume,
    work_authorization: "Green Card",
    gender: "Male",
    ethnicity: "White",
    disability_status: "No",
    veteran_status: "No",
    status: :reviewed
  }
)

create_candidate(
  job: globex_job2,
  profile: { name: "Isabel Allende", email: "isabel@example.com", total_years_experience: 7 },
  experience: {
    job_title: "DevOps Specialist",
    company_name: "CloudOps",
    start_date: Date.new(2016, 1, 1),
    end_date: Date.new(2023, 1, 1),
    description: "Managed cloud infrastructure."
  },
  education: {
    degree: "BSc Information Technology",
    school: "Tech University",
    field_of_study: "Information Technology",
    start_year: 2012,
    end_year: 2016,
    description: "Focus on systems administration."
  },
  skills: %w[terraform aws kubernetes],
  application: {
    phone: "555-9090",
    resume_text: next_resume,
    work_authorization: "US Citizen",
    gender: "Female",
    ethnicity: "Latina",
    disability_status: "No",
    veteran_status: "No",
    status: :interviewed
  }
)

create_candidate(
  job: globex_job2,
  profile: { name: "Jack Sparrow", email: "jack@example.com", total_years_experience: 5 },
  experience: {
    job_title: "Cloud Engineer",
    company_name: "PirateCloud",
    start_date: Date.new(2018, 1, 1),
    end_date: Date.new(2023, 1, 1),
    description: "Sailed the seas of AWS."
  },
  education: {
    degree: "BSc Computer Science",
    school: "Ocean College",
    field_of_study: "Computer Science",
    start_year: 2013,
    end_year: 2017,
    description: "Studied distributed systems."
  },
  skills: %w[docker kubernetes aws],
  application: {
    phone: "555-0101",
    resume_text: next_resume,
    work_authorization: "US Citizen",
    gender: "Male",
    ethnicity: "Other",
    disability_status: "No",
    veteran_status: "No",
    status: :rejected
  }
)

# --- Playground company for testing ---
playground = Company.find_or_create_by!(name: "Playground")

playground_admin = User.find_or_create_by!(email: "admin@playground.test") do |u|
  u.password = "password123"
  u.password_confirmation = "password123"
  u.company = playground
end

playground_job = Job.find_or_create_by!(company: playground, posted_by_user: playground_admin, status: "active")

playground_jd = JobDescription.find_or_create_by!(job: playground_job) do |jd|
  jd.title = "Software Development Engineer"
  jd.description = "Tinker and build exciting experiments in the Playground."
  jd.company_name = playground.name
  jd.location = "Remote"
  jd.is_remote = true
  jd.job_type = "full-time"
  jd.salary_min = 100000
  jd.salary_max = 140000
  jd.salary_currency = "USD"
  jd.is_salary_visible = true
end

playground_jd.skills = %w[ruby rails react].map { |s| Skill.find_or_create_by!(name: s) }
playground_jd.save!

