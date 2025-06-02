Rails.application.routes.draw do
  namespace :api do
    resources :jobs
    resources :companies
    resources :skills
    resources :users
  end
end
