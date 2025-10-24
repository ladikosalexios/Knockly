#!/usr/bin/env bash
# Run backend test suite for reviewers
set -e

cd "$(dirname "$0")/../backend"

bin/rails db:migrate
bundle exec rails test
