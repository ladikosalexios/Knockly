# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_07_16_225750) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "candidate_resumes", force: :cascade do |t|
    t.string "job_title"
    t.text "description"
    t.integer "years_experience_min"
    t.integer "years_experience_max"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.string "email"
    t.text "resume_text"
    t.integer "user_id"
    t.index ["email"], name: "index_candidate_resumes_on_email", unique: true
    t.index ["user_id"], name: "index_candidate_resumes_on_user_id"
  end

  create_table "companies", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.string "logo_url"
    t.string "website"
    t.string "industry"
    t.string "company_size"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "company_users", force: :cascade do |t|
    t.bigint "company_id", null: false
    t.bigint "user_id", null: false
    t.string "role"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_company_users_on_company_id"
    t.index ["user_id"], name: "index_company_users_on_user_id"
  end

  create_table "job_applications", force: :cascade do |t|
    t.integer "job_id"
    t.string "name"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "job_description_skills", force: :cascade do |t|
    t.bigint "job_description_id", null: false
    t.bigint "skill_id", null: false
    t.string "importance"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["job_description_id"], name: "index_job_description_skills_on_job_description_id"
    t.index ["skill_id"], name: "index_job_description_skills_on_skill_id"
  end

  create_table "job_descriptions", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.text "requirements"
    t.text "benefits"
    t.string "company_name"
    t.string "location"
    t.boolean "is_remote"
    t.string "job_type"
    t.string "experience_level"
    t.integer "salary_min"
    t.integer "salary_max"
    t.string "salary_currency"
    t.boolean "is_salary_visible"
    t.string "external_id"
    t.string "source"
    t.datetime "parsed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "job_skills", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.bigint "skill_id", null: false
    t.string "importance"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["job_id"], name: "index_job_skills_on_job_id"
    t.index ["skill_id"], name: "index_job_skills_on_skill_id"
  end

  create_table "jobs", force: :cascade do |t|
    t.string "status"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "company_id", null: false
    t.bigint "posted_by_user_id", null: false
    t.integer "job_description_id"
    t.index ["company_id"], name: "index_jobs_on_company_id"
    t.index ["posted_by_user_id"], name: "index_jobs_on_posted_by_user_id"
  end

  create_table "resume_skills", force: :cascade do |t|
    t.bigint "candidate_resume_id", null: false
    t.bigint "skill_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["candidate_resume_id"], name: "index_resume_skills_on_candidate_resume_id"
    t.index ["skill_id"], name: "index_resume_skills_on_skill_id"
  end

  create_table "skills", force: :cascade do |t|
    t.string "name"
    t.string "category"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_skills_on_name", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "user_type"
    t.datetime "last_login_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role", default: "candidate", null: false
    t.integer "company_id"
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "encrypted_password", default: "", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "company_users", "companies"
  add_foreign_key "company_users", "users"
  add_foreign_key "job_description_skills", "job_descriptions"
  add_foreign_key "job_description_skills", "skills"
  add_foreign_key "job_skills", "jobs"
  add_foreign_key "job_skills", "skills"
  add_foreign_key "jobs", "companies"
  add_foreign_key "jobs", "users", column: "posted_by_user_id"
  add_foreign_key "resume_skills", "candidate_resumes"
  add_foreign_key "resume_skills", "skills"
end
