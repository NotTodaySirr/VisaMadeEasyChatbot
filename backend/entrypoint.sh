#!/bin/bash

# Wait for postgres to be ready
echo "Waiting for postgres..."
while ! nc -z postgres 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Run migrations
echo "Running database migrations..."
flask db upgrade

# Start the application
echo "Starting Flask application..."
exec "$@"
