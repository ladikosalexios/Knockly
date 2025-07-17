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

ActiveRecord::Schema[8.0].define(version: 2025_07_17_220856) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "applicant_educations", force: :cascade do |t|
    t.bigint "applicant_profile_id", null: false
    t.string "degree"
    t.string "school"
    t.string "field_of_study"
    t.integer "start_year"
    t.integer "end_year"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["applicant_profile_id"], name: "index_applicant_educations_on_applicant_profile_id"
  end

  create_table "applicant_experiences", force: :cascade do |t|
    t.bigint "applicant_profile_id", null: false
    t.string "job_title"
    t.string "company_name"
    t.date "start_date"
    t.date "end_date"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["applicant_profile_id"], name: "index_applicant_experiences_on_applicant_profile_id"
  end

  create_table "applicant_profile_skills", force: :cascade do |t|
    t.bigint "applicant_profile_id", null: false
    t.bigint "skill_id", null: false
    t.string "proficiency"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["applicant_profile_id"], name: "index_applicant_profile_skills_on_applicant_profile_id"
    t.index ["skill_id"], name: "index_applicant_profile_skills_on_skill_id"
  end

  create_table "applicant_profiles", force: :cascade do |t|
    t.string "name"
    t.string "email", null: false
    t.integer "total_years_experience"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_applicant_profiles_on_email", unique: true
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

  create_table "job_applications", force: :cascade do |t|
    t.integer "job_id"
    t.string "name"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "applicant_profile_id"
    t.index ["applicant_profile_id"], name: "index_job_applications_on_applicant_profile_id"
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

  create_table "skills", force: :cascade do |t|
    t.string "name"
    t.string "category"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_skills_on_name", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.datetime "last_login_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "encrypted_password", default: "", null: false
    t.bigint "company_id"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "applicant_educations", "applicant_profiles"
  add_foreign_key "applicant_experiences", "applicant_profiles"
  add_foreign_key "applicant_profile_skills", "applicant_profiles"
  add_foreign_key "applicant_profile_skills", "skills"
  add_foreign_key "job_applications", "applicant_profiles"
  add_foreign_key "job_description_skills", "job_descriptions"
  add_foreign_key "job_description_skills", "skills"
  add_foreign_key "jobs", "companies"
  add_foreign_key "jobs", "users", column: "posted_by_user_id"
  add_foreign_key "users", "companies"
end
