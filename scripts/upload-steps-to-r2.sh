#!/usr/bin/env bash
set -euo pipefail

# Upload step illustration webp assets to Cloudflare R2.
# Prerequisites:
#   - awscli installed
#   - env vars set: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
#   - webp files exist at public/steps/*.webp

if [[ -z "${R2_ENDPOINT:-}" || -z "${R2_ACCESS_KEY_ID:-}" || -z "${R2_SECRET_ACCESS_KEY:-}" || -z "${R2_BUCKET:-}" ]]; then
  echo "Missing R2 env vars. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET." >&2
  exit 1
fi

export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"

SOURCE_DIR="public/steps"
DEST_PATH="s3://${R2_BUCKET}/steps"

echo "Uploading ${SOURCE_DIR}/*.webp to ${DEST_PATH}"

aws s3 cp "${SOURCE_DIR}" "${DEST_PATH}" \
  --recursive \
  --exclude "*" \
  --include "*.webp" \
  --endpoint-url "${R2_ENDPOINT}" \
  --acl public-read

echo "Done. Verify files at your CDN mapped to the R2 bucket."
