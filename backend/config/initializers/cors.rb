Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    allowed_origins = ENV.fetch('CORS_ALLOWED_ORIGINS', '').split(',').map(&:strip).reject(&:empty?)

    origins allowed_origins.empty? ? '*' : allowed_origins

    resource '*',
      headers: :any,
      methods: [:get, :post, :patch, :put, :delete, :options, :head],
      credentials: allowed_origins.any?
  end
end
