Rails.application.routes.draw do
  namespace :api do
    get "matching", to: "matching#show"   # <-- Add this line here!
    resources :jobs
    resources :companies
    resources :skills
    resources :users
  end
end
