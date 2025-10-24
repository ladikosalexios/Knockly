# Knockly API

This repository now contains only the Rails API. The previous React single-page application has been removed, so use API clients such as curl, HTTPie, Postman, or automated tests to interact with the service.

## Prerequisites

- Ruby 3.2 (managed through [mise](https://github.com/jdx/mise) or your preferred version manager)
- Bundler (`gem install bundler`)
- PostgreSQL 13+
- Redis (required for Solid Queue jobs)

## Setup

1. Install Ruby dependencies:
   ```bash
   cd backend
   bundle install
   ```
2. Configure environment variables as needed. At minimum provide database credentials that match `config/database.yml`. Optional configuration:
   - `CORS_ALLOWED_ORIGINS` — comma-separated list of origins that should receive cookies/credentialed responses from the API. Leave unset to accept requests from any origin (credentials will be disabled in that case).
3. Prepare the database:
   ```bash
   bin/rails db:prepare
   ```
4. (Optional) Seed sample data:
   ```bash
   bin/rails db:seed
   ```

## Running the API

Start the Rails server on port 3000:
```bash
bin/rails server
```

Use an API client to exercise endpoints. For example, after authenticating and obtaining a session cookie or bearer token:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/jobs
```

List available routes directly from the app:
```bash
bundle exec rails routes
```

## Testing

Run the Rails test suite:
```bash
bundle exec rails test
```
The helper script `scripts/test.sh` runs the same command for convenience.

## Background processing

The application uses Solid Queue and Solid Cable. Ensure Redis is running and start the queue processor when needed:
```bash
bin/rails solid_queue:start
```
