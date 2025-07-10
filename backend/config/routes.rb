Rails.application.routes.draw do
  namespace :api do
    get "matching", to: "matching#show"
    resources :jobs
    resources :job_applications, only: [ :create, :index ]
    resources :companies
    resources :skills
    resources :users
    resources :candidate_resumes, only: [ :create, :show, :index ]
  end
end
