#!/usr/bin/env bash
# Creates/updates the mts-foods app-secrets Secret in-cluster from your
# existing .env — but points DATABASE_URL at the in-cluster Postgres
# Service instead of whatever your local .env has, since that's almost
# certainly wrong inside the cluster.
#
# Usage: ./k8s/create-secret.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "No .env found in $(pwd). Copy .env.example to .env and fill it in first." >&2
  exit 1
fi

set -a
source .env
set +a

POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"

kubectl create namespace mts-foods --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic app-secrets -n mts-foods \
  --from-literal=ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:?missing ANTHROPIC_API_KEY in .env}" \
  --from-literal=SECRET_KEY="${SECRET_KEY:?missing SECRET_KEY in .env}" \
  --from-literal=RAZORPAY_KEY_ID="${RAZORPAY_KEY_ID:?missing RAZORPAY_KEY_ID in .env}" \
  --from-literal=RAZORPAY_KEY_SECRET="${RAZORPAY_KEY_SECRET:?missing RAZORPAY_KEY_SECRET in .env}" \
  --from-literal=RAZORPAY_WEBHOOK_SECRET="${RAZORPAY_WEBHOOK_SECRET:-}" \
  --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
  --from-literal=DATABASE_URL="postgresql+psycopg2://postgres:${POSTGRES_PASSWORD}@postgres:5432/mts_foods" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Secret 'app-secrets' applied in namespace mts-foods."
