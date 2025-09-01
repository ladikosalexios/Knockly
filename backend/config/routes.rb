Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }

  namespace :api do
    get "users/me", to: "users#me"
    get "matching", to: "matching#show"
    post "invite_user", to: "users#invite"
    post "generate_invite", to: "users#generate_invite"
    get "accept_invite/:token", to: "users#accept_invite", as: "accept_invite"
    post "finalize_invite", to: "users#finalize_invite"
    get "companies/slug/:slug", to: "companies#show_by_slug"
    get "companies/:slug/jobs", to: "companies#jobs_by_slug"
    get "matching", to: "matching#show"
    resources :jobs
    resources :job_descriptions, only: [:create, :update]
    resources :job_applications, only: [:create, :index, :update] do
      collection do
        post :extract_resume
      end
    end
    resources :interviews
    resources :companies
    resources :skills
    resources :users
    namespace :admin do
      get 'dashboard', to: 'dashboard#index'
    end
  end
  # get '*path', to: 'static#index', constraints: ->(req) { !req.xhr? && req.format.html? }
end
