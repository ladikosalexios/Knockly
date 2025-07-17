class CreateApplicantProfilesAndRelated < ActiveRecord::Migration[8.0]
  def change
    create_table :applicant_profiles do |t|
      t.string :name
      t.string :email, null: false
      t.integer :total_years_experience
      t.timestamps
    end
    add_index :applicant_profiles, :email, unique: true

    create_table :applicant_experiences do |t|
      t.references :applicant_profile, null: false, foreign_key: true
      t.string :job_title
      t.string :company_name
      t.date :start_date
      t.date :end_date
      t.text :description
      t.timestamps
    end

    create_table :applicant_educations do |t|
      t.references :applicant_profile, null: false, foreign_key: true
      t.string :degree
      t.string :school
      t.string :field_of_study
      t.integer :start_year
      t.integer :end_year
      t.text :description
      t.timestamps
    end

    create_table :applicant_profile_skills do |t|
      t.references :applicant_profile, null: false, foreign_key: true
      t.references :skill, null: false, foreign_key: true
      t.string :proficiency
      t.timestamps
    end

    # Add profile reference to job_applications
    add_reference :job_applications, :applicant_profile, foreign_key: true
  end
end