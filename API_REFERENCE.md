# King Myco API Reference (Web3 Edition)

## Base URL

Production: `https://your-railway-url`
Development: `http://localhost:3000`

## Authentication

### For Public Endpoints
No authentication required. Public endpoints return leaderboard and stats data.

### For Protected Endpoints
Use wallet signature verification:

1. Get nonce: `GET /api/wallet/:address/nonce`
2. Sign with wallet
3. Verify: `POST /api/wallet/verify`
4. Use returned token in `x-auth-token` header OR use `x-api-key` for server-side operations

### Headers
```
Content-Type: application/json
x-api-key: your-api-key (for server-to-server)
x-auth-token: user-token (for user wallet auth)
```

---

## Authentication Endpoints

### Generate Nonce for Wallet Sign-In

**Endpoint:** `GET /api/wallet/:address/nonce`

**Parameters:**
- `:address` - User's wallet address (Ethereum/Solana)

**Response (200 OK):**
```json
{
  "success": true,
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595fEA...",
  "nonce": "abc123xyz789",
  "expiresIn": 600,
  "message": "Sign this message with your wallet: abc123xyz789"
}
```

**Errors:**
- `400 Bad Request` - Invalid wallet address format
- `500 Server Error` - Database error

---

### Verify Wallet Signature

**Endpoint:** `POST /api/wallet/verify`

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595fEA...",
  "signature": "0x1234567890abcdef...",
  "nonce": "abc123xyz789"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595fea...",
  "verified": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

**Errors:**
- `400 Bad Request` - Missing fields or invalid signature
- `401 Unauthorized` - Signature verification failed
- `500 Server Error` - Database error

---

## User Profile Endpoints

### Get User Profile

**Endpoint:** `GET /api/user/:wallet/profile`

**Parameters:**
- `:wallet` - User's wallet address

**Authentication:** Required (unless user already verified)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595fea...",
    "totalSpores": 500,
    "questsCompleted": 5,
    "chainId": 501,
    "isVerified": true,
    "telegramUserId": 123456789,
    "telegramName": "john_doe",
    "lastActiveAt": "2026-01-18T10:30:00Z"
  }
}
```

**Errors:**
- `404 Not Found` - User wallet not found
- `401 Unauthorized` - Invalid authentication
- `500 Server Error` - Database error

---

### Get User Spores

**Endpoint:** `GET /api/user/:wallet/spores`

**Parameters:**
- `:wallet` - User's wallet address

**Authentication:** Optional (returns 0 if not found)

**Response (200 OK):**
```json
{
  "success": true,
  "walletAddress": "0x742d35cc...",
  "totalSpores": 500
}
```

---

### Get User Rank

**Endpoint:** `GET /api/user/:wallet/rank`

**Parameters:**
- `:wallet` - User's wallet address

**Authentication:** Optional

**Response (200 OK):**
```json
{
  "success": true,
  "walletAddress": "0x742d35cc...",
  "rank": 3,
  "spores": 500,
  "percentile": 98
}
```

---

### Link Telegram Account

**Endpoint:** `POST /api/user/:wallet/telegram-link`

**Parameters:**
- `:wallet` - User's wallet address

**Request Body:**
```json
{
  "telegramUserId": 123456789,
  "telegramName": "john_doe"
}
```

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Telegram account linked successfully",
  "walletAddress": "0x742d35cc...",
  "telegramUserId": 123456789,
  "telegramName": "john_doe"
}
```

---

## Quest Endpoints

### Create Quest

**Endpoint:** `POST /api/user/:wallet/quests`

**Parameters:**
- `:wallet` - Quest creator's wallet

**Authentication:** Required (x-api-key)

**Request Body:**
```json
{
  "title": "Swap 1000 tokens on Raydium",
  "description": "Complete a token swap for 1000 MYCO tokens",
  "reward": 50,
  "questType": "on-chain",
  "contractAddress": "0xRaydium...",
  "chainId": 501
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "questId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Swap 1000 tokens on Raydium",
  "reward": 50,
  "message": "Quest created successfully"
}
```

**Errors:**
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Invalid API key
- `500 Server Error` - Database error

---

### Get User Quests

**Endpoint:** `GET /api/user/:wallet/quests`

**Parameters:**
- `:wallet` - User's wallet address
- `?completed=true/false` - Filter by status (optional)
- `?limit=10` - Limit results (optional, default 50)

**Authentication:** Optional

**Response (200 OK):**
```json
{
  "success": true,
  "walletAddress": "0x742d35cc...",
  "totalCount": 10,
  "count": 10,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Swap 1000 tokens on Raydium",
      "description": "Complete a token swap",
      "reward": 50,
      "questType": "on-chain",
      "contractAddress": "0xRaydium...",
      "chainId": 501,
      "completed": false,
      "completedAt": null,
      "transactionHash": null,
      "createdAt": "2026-01-18T10:00:00Z"
    }
  ]
}
```

---

### Get Single Quest

**Endpoint:** `GET /api/user/:wallet/quests/:questId`

**Parameters:**
- `:wallet` - User's wallet address
- `:questId` - Quest UUID

**Authentication:** Optional

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Swap 1000 tokens on Raydium",
    "description": "Complete a token swap",
    "reward": 50,
    "questType": "on-chain",
    "contractAddress": "0xRaydium...",
    "chainId": 501,
    "completed": true,
    "completedAt": "2026-01-18T10:30:00Z",
    "transactionHash": "0x1234567890abcdef...",
    "proof": {
      "proofType": "on-chain",
      "verified": true,
      "contractAddress": "0xRaydium...",
      "chainId": 501
    }
  }
}
```

---

### Complete Quest (with Proof)

**Endpoint:** `POST /api/user/:wallet/quests/:questId/complete`

**Parameters:**
- `:wallet` - User's wallet address
- `:questId` - Quest UUID

**Authentication:** Required (x-api-key for server-side)

**Request Body:**
```json
{
  "transactionHash": "0x1234567890abcdef...",
  "proofData": {
    "contractAddress": "0xRaydium...",
    "functionCalled": "swap",
    "amountSwapped": "1000000000000",
    "chainId": 501,
    "timestamp": 1705590600,
    "gasUsed": 150000
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Quest completed! 50 spores awarded.",
  "walletAddress": "0x742d35cc...",
  "questId": "550e8400-e29b-41d4-a716-446655440000",
  "sporesAwarded": 50,
  "newTotal": 550,
  "transactionHash": "0x1234567890abcdef...",
  "proofVerified": true
}
```

**Errors:**
- `400 Bad Request` - Missing proof data
- `404 Not Found` - Quest not found
- `409 Conflict` - Quest already completed
- `500 Server Error` - Database or verification error

---

## Leaderboard & Stats Endpoints

### Get Leaderboard

**Endpoint:** `GET /api/leaderboard`

**Query Parameters:**
- `?limit=10` - Top N wallets (default 10, max 100)
- `?offset=0` - Pagination offset (optional)
- `?chainId=501` - Filter by blockchain (optional)

**Authentication:** Not required (public)

**Response (200 OK):**
```json
{
  "success": true,
  "limit": 10,
  "offset": 0,
  "total": 150,
  "data": [
    {
      "rank": 1,
      "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595fea...",
      "totalSpores": 500,
      "questsCompleted": 5,
      "chainId": 501,
      "isVerified": true,
      "telegramName": "john_doe"
    },
    {
      "rank": 2,
      "walletAddress": "0xabc123def456...",
      "totalSpores": 450,
      "questsCompleted": 4,
      "chainId": 501,
      "isVerified": true,
      "telegramName": null
    }
  ]
}
```

---

### Get Statistics

**Endpoint:** `GET /api/stats`

**Query Parameters:**
- `?chainId=501` - Filter by blockchain (optional)

**Authentication:** Not required (public)

**Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalSpores": 15000,
    "totalQuestsCompleted": 500,
    "averageSporesPerUser": 100,
    "topPlayer": {
      "rank": 1,
      "walletAddress": "0x742d35cc...",
      "totalSpores": 500,
      "telegramName": "john_doe"
    },
    "chainStats": [
      {
        "chainId": 501,
        "chainName": "Solana",
        "userCount": 150,
        "totalSpores": 15000,
        "questsCompleted": 500
      }
    ]
  }
}
```

---

### Get Health Check

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2026-01-18T10:30:00Z",
  "version": "1.0.0",
  "database": "connected",
  "uptime": 3600
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional details if available"
  }
}
```

### Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| INVALID_WALLET | 400 | Invalid wallet address format |
| MISSING_FIELDS | 400 | Required fields missing |
| SIGNATURE_INVALID | 401 | Wallet signature verification failed |
| UNAUTHORIZED | 401 | Invalid API key or token |
| NOT_FOUND | 404 | Resource not found |
| ALREADY_EXISTS | 409 | Resource already exists |
| QUEST_COMPLETED | 409 | Quest already completed |
| DATABASE_ERROR | 500 | Database operation failed |
| PROOF_VERIFICATION_FAILED | 500 | On-chain proof could not be verified |

---

## Rate Limiting

### Limits
- Public endpoints: 100 requests/minute per IP
- Authenticated endpoints: 200 requests/minute per wallet
- Quest completion: 1 per wallet per quest

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1705590660
```

### Exceeded Response (429)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

---

## Webhook Events (Coming Soon)

When configured, webhooks will POST to your endpoint:

```json
{
  "event": "quest_completed",
  "walletAddress": "0x742d35cc...",
  "questId": "550e8400...",
  "sporesAwarded": 50,
  "timestamp": "2026-01-18T10:30:00Z",
  "signature": "webhook_signature_for_verification"
}
```

---

## Code Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const API = 'https://your-railway-url';

// Get nonce
async function getNonce(walletAddress: string) {
  const res = await axios.get(`${API}/api/wallet/${walletAddress}/nonce`);
  return res.data.nonce;
}

// Complete a quest
async function completeQuest(
  walletAddress: string,
  questId: string,
  transactionHash: string,
  apiKey: string
) {
  const res = await axios.post(
    `${API}/api/user/${walletAddress}/quests/${questId}/complete`,
    {
      transactionHash,
      proofData: {
        chainId: 501,
        contractAddress: '0x...'
      }
    },
    { headers: { 'x-api-key': apiKey } }
  );
  return res.data;
}
```

### cURL

```bash
# Get nonce
curl -X GET \
  https://your-railway-url/api/wallet/0x742d.../nonce

# Get leaderboard
curl -X GET \
  https://your-railway-url/api/leaderboard?limit=10

# Create quest (requires API key)
curl -X POST \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Swap tokens",
    "description": "Complete a swap",
    "reward": 50,
    "questType": "on-chain"
  }' \
  https://your-railway-url/api/user/0x742d.../quests

# Complete quest
curl -X POST \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionHash": "0x1234...",
    "proofData": {"chainId": 501}
  }' \
  https://your-railway-url/api/user/0x742d.../quests/550e8400.../complete
```

### Python

```python
import requests
import json

API = "https://your-railway-url"

def get_user_profile(wallet_address):
    res = requests.get(f"{API}/api/user/{wallet_address}/profile")
    return res.json()

def get_leaderboard(limit=10):
    res = requests.get(f"{API}/api/leaderboard?limit={limit}")
    return res.json()

def complete_quest(wallet, quest_id, tx_hash, api_key):
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }
    data = {
        "transactionHash": tx_hash,
        "proofData": {"chainId": 501}
    }
    res = requests.post(
        f"{API}/api/user/{wallet}/quests/{quest_id}/complete",
        json=data,
        headers=headers
    )
    return res.json()
```

---

## Support

For API issues:
- Check logs: `railway logs`
- Verify wallet format (checksummed or lowercase)
- Ensure all required fields in POST body
- Check x-api-key is valid
- Review error code in response

Last updated: 2026-01-18
API Version: 1.0.0
