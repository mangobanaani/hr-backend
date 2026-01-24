#!/bin/bash
# Health check script for development and production monitoring

API_URL="${API_URL:-http://localhost:3000}"

echo "Checking API health at $API_URL..."
echo ""

# Overall health check
echo "=== Overall Health ==="
curl -s "$API_URL/api/v1/health" | jq '.' || echo "Failed to connect"
echo ""

# Database health check
echo "=== Database Health ==="
curl -s "$API_URL/api/v1/health/database" | jq '.' || echo "Failed to connect"
echo ""

# System health check
echo "=== System Health ==="
curl -s "$API_URL/api/v1/health/system" | jq '.' || echo "Failed to connect"
echo ""

echo "Health check complete"
