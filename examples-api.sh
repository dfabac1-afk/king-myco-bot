#!/bin/bash
# King Myco API - cURL Examples
# Replace YOUR_API_KEY and YOUR_RAILWAY_URL with your values

API_KEY="your-api-key"
API_URL="https://your-railway-url/api"

# ============================================
# LEADERBOARD
# ============================================

# Get top 10 spore earners
curl -H "x-api-key: $API_KEY" \
  "$API_URL/leaderboard?limit=10"

# Get stats
curl -H "x-api-key: $API_KEY" \
  "$API_URL/stats"

# ============================================
# USER PROFILE
# ============================================

# Get user profile
curl -H "x-api-key: $API_KEY" \
  "$API_URL/user/123456/profile"

# Get user spores balance
curl -H "x-api-key: $API_KEY" \
  "$API_URL/user/123456/spores"

# ============================================
# QUESTS
# ============================================

# Get user's active quests
curl -H "x-api-key: $API_KEY" \
  "$API_URL/user/123456/quests?completed=false"

# Get user's completed quests
curl -H "x-api-key: $API_KEY" \
  "$API_URL/user/123456/quests?completed=true"

# Create a new quest
curl -X POST \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Daily Trading Challenge",
    "description": "Execute 5 buy/sell trades",
    "reward": 100
  }' \
  "$API_URL/user/123456/quests"

# Complete a quest (returns quest ID from create response)
curl -X POST \
  -H "x-api-key: $API_KEY" \
  "$API_URL/user/123456/quests/550e8400-e29b-41d4-a716-446655440000/complete"

# ============================================
# SPORES (ADMIN)
# ============================================

# Award spores to user (promotion/reward)
curl -X POST \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "reason": "Tournament winner - First place"
  }' \
  "$API_URL/user/123456/spores/add"

# ============================================
# SCRIPTED EXAMPLES
# ============================================

# Create quest and complete it
echo "Creating quest..."
QUEST=$(curl -s -X POST \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete Profile",
    "description": "Fill out all profile information",
    "reward": 75
  }' \
  "$API_URL/user/123456/quests")

QUEST_ID=$(echo $QUEST | grep -o '"questId":"[^"]*' | cut -d'"' -f4)

echo "Quest created with ID: $QUEST_ID"
sleep 2

echo "Completing quest..."
curl -s -X POST \
  -H "x-api-key: $API_KEY" \
  "$API_URL/user/123456/quests/$QUEST_ID/complete"

echo "✅ Quest completed! Spores awarded."

# ============================================
# MONITOR LEADERBOARD
# ============================================

# Poll leaderboard every 10 seconds
while true; do
  clear
  echo "=== King Myco Leaderboard ==="
  echo ""
  curl -s -H "x-api-key: $API_KEY" \
    "$API_URL/leaderboard?limit=10" | \
    jq '.data[] | "\(.rank) \(.telegramName): \(.totalSpores) spores"'
  echo ""
  echo "Last updated: $(date)"
  sleep 10
done

# ============================================
# ERROR HANDLING EXAMPLES
# ============================================

# Check for errors
check_response() {
  local response=$1
  if echo "$response" | grep -q '"success":false'; then
    echo "❌ Error:"
    echo "$response" | jq '.error'
  else
    echo "✅ Success:"
    echo "$response" | jq '.'
  fi
}

# Example with error handling
RESPONSE=$(curl -s \
  -H "x-api-key: $API_KEY" \
  "$API_URL/user/invalid-id/spores")

check_response "$RESPONSE"

# ============================================
# BATCH OPERATIONS
# ============================================

# Award spores to multiple users
for user_id in 1001 1002 1003 1004 1005; do
  echo "Awarding spores to user $user_id..."
  curl -s -X POST \
    -H "x-api-key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "amount": 25,
      "reason": "Weekly bonus"
    }' \
    "$API_URL/user/$user_id/spores/add" > /dev/null
  sleep 1
done

echo "✅ Batch spore awards complete!"

# ============================================
# NOTES
# ============================================
# 
# 1. Replace YOUR_API_KEY with actual API key from Railway
# 2. Replace YOUR_RAILWAY_URL with your Railway deployment URL
# 3. User IDs should be Telegram user IDs (numbers)
# 4. Quest IDs are UUIDs returned from quest creation
# 5. All timestamps are in ISO 8601 format
# 6. Spore amounts must be positive integers
# 7. Install jq for JSON parsing: https://stedolan.github.io/jq/
#
