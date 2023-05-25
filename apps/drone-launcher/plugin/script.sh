#!/bin/sh

baseUrl="${PLUGIN_URL:?Error: PLUGIN_URL environment variable is not set or empty}"
token="${PLUGIN_TOKEN:?Error: PLUGIN_TOKEN environment variable is not set or empty}"
appName="${PLUGIN_APP_NAME:?Error: PLUGIN_APP_NAME environment variable is not set or empty}"
commitId="${PLUGIN_COMMIT_ID:?Error: PLUGIN_COMMIT_ID environment variable is not set or empty}"
target="${PLUGIN_TARGET:?Error: PLUGIN_TARGET environment variable is not set or empty}"

echo ""
echo "Version v1.0.2" # TODO: Automate versioning
echo ""
echo "Base URL: $baseUrl"
echo "App Name: $appName"
echo "Commit ID: $commitId"
echo "Target: $target"
echo ""

retry_delay="${PLUGIN_RETRY_DELAY:-0.5}"
max_retries="${PLUGIN_MAX_RETRIES:-60}"

launchUrl="$baseUrl/launch"
headers="Authorization: Bearer $token"

response=""
retry_count=0

response=$(curl -s -o - -w "%{http_code}" -X POST \
  "$launchUrl" \
  --header "$headers" \
  --header "Content-Type: application/json" \
  --data-raw "{
    \"appName\": \"$appName\",
    \"commitId\": \"$commitId\",
    \"target\": \"$target\"
  }")

status_code=$(expr substr "$response" $(expr length "$response" - 2) 3)
body=${response%???}

echo ""
echo "Launching request..."
echo "Status Code: $status_code"
echo "Response Body: $body"
echo ""

if [ "$status_code" -ne 201 ]; then
  echo "Failed to launch process!"
  exit 1
fi

processId=$body
echo "Process ID: $processId"
getStatusUrl="$baseUrl/status/$processId"

while true; do
  response=$(curl -s -o - -w "%{http_code}" -X GET "$getStatusUrl" --header "$headers")

  status_code=$(expr substr "$response" $(expr length "$response" - 2) 3)
  body=${response%???}

  if [ "$body" = "Error!" ]; then
    echo $body
    exit 1
  fi

  if [ "$body" = "Done!" ]; then
    echo $body
    exit 0
  fi

  if [ "$status_code" -eq 200 ] && [ -n "$body" ]; then
    retry_count=0
    echo $body
  fi

  if [ "$retry_count" -eq "$max_retries" ]; then
    echo ""
    echo "Last response: $body"
    echo "Max retries reached. Exiting..."
    exit 1
  fi

  retry_count=$((retry_count + 1))
  sleep $retry_delay
done
