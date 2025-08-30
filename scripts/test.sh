#!/usr/bin/env bash
# Run backend and frontend test suites for reviewers
set -e

# Run backend migrations and tests
cd "$(dirname "$0")/../backend"
bin/rails db:migrate
bundle exec rails test

# Run frontend tests
cd ../frontend
npm test -- --run
