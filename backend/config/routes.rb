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
    resources :jobs
    resources :job_descriptions, only: [:create]
    resources :job_applications, only: [:create, :index]
    resources :companies
    resources :skills
    resources :users
    namespace :admin do
      get 'dashboard', to: 'dashboard#index'
    end
  end
  # get '*path', to: 'static#index', constraints: ->(req) { !req.xhr? && req.format.html? }
end