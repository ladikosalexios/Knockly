Rails.application.routes.draw do
devise_for :users, controllers: {
  sessions: 'users/sessions',
  registrations: 'users/registrations'
}
  namespace :api do
    get "matching", to: "matching#show"
    get "jobs/company_jobs", to: "jobs#company_jobs"
    resources :jobs
    resources :job_descriptions, only: [ :create ]
    resources :job_applications, only: [ :create, :index ]
    resources :companies
    resources :skills
    resources :users
    namespace :admin do
      get 'dashboard', to: 'dashboard#index'
    end
  end
end
