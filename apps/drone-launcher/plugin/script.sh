#!/bin/sh

baseUrl="${PLUGIN_URL:?Error: PLUGIN_URL environment variable is not set or empty}"
token="${PLUGIN_TOKEN:?Error: PLUGIN_TOKEN environment variable is not set or empty}"
appName="${PLUGIN_APP_NAME:?Error: PLUGIN_APP_NAME environment variable is not set or empty}"
commitId="${PLUGIN_COMMIT_ID:?Error: PLUGIN_COMMIT_ID environment variable is not set or empty}"
target="${PLUGIN_TARGET:?Error: PLUGIN_TARGET environment variable is not set or empty}"

echo ""
echo "Base URL: $baseUrl"
echo "App Name: $appName"
echo "Commit ID: $commitId"
echo "Target: $target"
echo ""

retry_delay="${PLUGIN_RETRY_DELAY:-0.5}"
max_retries="${PLUGIN_MAX_RETRIES:-120}"

launchUrl="$baseUrl/launch"
getStatusUrl="$baseUrl/status/$processId"
headers="Authorization: Bearer $token"

response=""
retry_count=0

echo $launchUrl

processId=$(curl -s -X POST \
  "$launchUrl" \
  --header "$headers" \
  --header "Content-Type: application/json" \
  --data-raw "{
  "appName": "$appName",
  "commitId": "$commitId",
  "target": "$target"
}")

if [ -z "$processId" ]; then
  echo "Failed to launch process"
  exit 1
fi

echo "Process ID: $processId"

while true; do
  response=$(curl -s --request GET --url "$getStatusUrl" --header "$headers")
  if [ "$response" = "Done!" ]; then
    echo $response
    break
  fi

  if [ -n "$response" ]; then
    retry_count=0
    echo $response
  fi

  if [ "$retry_count" -eq "$max_retries" ]; then
    echo "Max retries reached. Exiting..."
    break
  fi

  if [ -z "$response" ]; then
    retry_count=$((retry_count + 1))
  fi

  sleep $retry_delay
done
