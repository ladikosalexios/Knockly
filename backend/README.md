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

## Authentication and Invitations

The API uses Devise for session management with JSON-only responses. All requests should set `Content-Type: application/json` and are expected to be made over HTTPS in production.

### Sign up — `POST /users`

Creates a user and a company in a single request via `Users::RegistrationsController#create`.

- **Request body**
  ```json
  {
    "user": {
      "email": "founder@example.com",
      "password": "<password>",
      "password_confirmation": "<password>",
      "company_name": "Acme, Inc."
    }
  }
  ```
- **Success response** — `200 OK`
  ```json
  { "message": "Signed up successfully." }
  ```
- **Inactive response** — `200 OK`
  ```json
  { "message": "Signed up but inactive." }
  ```
- **Validation failure** — `422 Unprocessable Entity`
  ```json
  { "errors": ["Password can't be blank"] }
  ```

The controller creates the `Company`, associates it with the user, and Devise generates an `api_key`. Errors are returned as an array of full validation messages.【F:app/controllers/users/registrations_controller.rb†L1-L31】

### Log in — `POST /users/sign_in`

Authenticates a user and returns a trimmed session payload. Because `protect_from_forgery` is configured with `:null_session` for JSON, no CSRF token is required for API clients.【F:app/controllers/application_controller.rb†L1-L11】

- **Request body**
  ```json
  {
    "user": {
      "email": "founder@example.com",
      "password": "<password>"
    }
  }
  ```
- **Success response** — `200 OK`
  ```json
  {
    "id": 123,
    "email": "founder@example.com"
  }
  ```
- **Invalid credentials** — `401 Unauthorized`

Sessions are managed through cookies; the response body contains only the user ID and email from `Users::SessionsController#respond_with`. Logging out (`DELETE /users/sign_out`) returns `204 No Content` via `respond_to_on_destroy`.【F:app/controllers/users/sessions_controller.rb†L1-L16】

### Invitation endpoints

Invitation flows live under the `/api` namespace in `Api::UsersController`. All actions require JSON payloads; `invite` additionally requires an authenticated admin session.【F:app/controllers/api/users_controller.rb†L1-L115】【F:config/routes.rb†L1-L33】

#### Generate invite — `POST /api/generate_invite`

Generates an invite token for the supplied email. If the email’s domain already belongs to a company user, the invite links to that company; otherwise the invite indicates a new company flow.

- **Request body**
  ```json
  {
    "user": {
      "email": "teammate@example.com"
    }
  }
  ```
- **Success response** — `201 Created`
  ```json
  {
    "message": "Invite created successfully.",
    "invite_url": "http://localhost:5173/accept-invite/<token>?mode=join_company"
  }
  ```
- **Missing email** — `400 Bad Request`
  ```json
  { "error": "Email is required." }
  ```

#### Invite existing user (admin only) — `POST /api/invite_user`

Allows an authenticated admin (`is_looply_admin` flag) to invite a user to their company. The controller reuses the current user’s company ID and accepts an optional password override.

- **Request body**
  ```json
  {
    "email": "member@example.com"
  }
  ```
- **Success response** — `201 Created`
  ```json
  {
    "message": "User invited successfully.",
    "invite_url": "http://localhost:5173/accept-invite/<token>?mode=join_company"
  }
  ```
- **Validation failure** — `422 Unprocessable Entity`
  ```json
  { "errors": ["Email has already been taken"] }
  ```
- **Unauthorized/Forbidden** — Standard Devise `401` or custom `403 { "error": "Forbidden" }` when the user is not an admin.【F:app/controllers/api/users_controller.rb†L1-L47】

#### Accept invite — `GET /api/accept_invite/:token`

Returns invite details needed by the frontend to pre-fill forms.

- **Success response** — `200 OK`
  ```json
  {
    "email": "member@example.com",
    "company_name": "Acme, Inc.",
    "company_id": 42
  }
  ```
- **Invalid token** — `404 Not Found`
  ```json
  { "error": "Invalid invite token" }
  ```【F:app/controllers/api/users_controller.rb†L49-L74】

#### Finalize invite — `POST /api/finalize_invite`

Sets a password for the invited user, clears the invite token, and signs them in immediately.

- **Request body**
  ```json
  {
    "token": "<invite-token>",
    "password": "<new-password>"
  }
  ```
- **Success response** — `200 OK`
  ```json
  { "message": "Invite accepted. You are now logged in." }
  ```
- **Invalid token or missing password** — `400 Bad Request`
  ```json
  { "error": "Invalid token or password missing." }
  ```【F:app/controllers/api/users_controller.rb†L77-L107】

#### Session check — `GET /api/users/me`

Returns the authenticated user’s profile, including company linkage and invitation state. Useful for clients to confirm login or invitation completion.

- **Success response** — `200 OK`
  ```json
  {
    "id": 123,
    "email": "founder@example.com",
    "company_id": 42,
    "is_looply_admin": true,
    "invite_token": null
  }
  ```
- **Unauthenticated** — `401 Unauthorized`
  ```json
  { "error": "Not authenticated" }
  ```【F:app/controllers/api/users_controller.rb†L109-L130】

## Background processing

The application uses Solid Queue and Solid Cable. Ensure Redis is running and start the queue processor when needed:
```bash
bin/rails solid_queue:start
```
