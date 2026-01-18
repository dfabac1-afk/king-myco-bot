# 🌐 King Myco Web3 Integration Guide

## Overview

Your system is now optimized for **wallet-based Web3 participation**. Users connect their wallets to earn spores, complete quests, and compete on the leaderboard.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  kingmyco.com (Web3)                         │
│  - Wallet Connection (MetaMask, Phantom, etc)               │
│  - Quest Participation                                       │
│  - Spore Display                                            │
│  - Leaderboard                                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ (REST API + Wallet Auth)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Express API Server (Port 3000)                  │
│  - Wallet signature verification                             │
│  - Quest management                                          │
│  - Spore tracking                                           │
│  - Leaderboard queries                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│           Supabase Database (Web3-optimized)                 │
│  - user_profiles (walletAddress-based)                       │
│  - quests (on-chain proof tracking)                          │
│  - participation_proofs (on-chain verification)              │
│  - spore_transactions (audit trail)                          │
└──────────────────────────────────────────────────────────────┘
                      │
                      └─────────► Telegram Bot (Announcements)
```

## Key Changes for Web3

### 1. Wallet-Based Identification
- **Primary Key**: `walletAddress` (instead of userId)
- **Format**: Ethereum/Solana address (0x... or base58)
- **Case**: All addresses stored lowercase for consistency
- **Optional Telegram Link**: Users can link their Telegram for announcements

### 2. Authentication via Signatures
No passwords! Users prove ownership by signing messages:

```
1. Frontend requests nonce: GET /api/wallet/:address/nonce
2. User signs nonce with wallet (MetaMask, Phantom, etc)
3. Frontend sends signature: POST /api/wallet/verify
4. Backend verifies signature
5. User gets session token
```

### 3. On-Chain Proof Integration
Quests can track on-chain participation:

```typescript
{
  questId: "550e8400-e29b-41d4-a716-446655440000",
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f...",
  proofType: "on-chain",
  proofData: {
    contractAddress: "0x...",
    transactionHash: "0x...",
    chainId: 501,  // Solana or 1 for Ethereum
    eventLogs: [...]
  },
  transactionHash: "0x...",
  verified: true
}
```

### 4. Multi-Chain Support
- **chainId**: Field included in all tables
- **Default**: 501 (Solana)
- **Support**: Solana, Ethereum, Polygon, etc.

## API Endpoints (Web3-Optimized)

### Wallet Authentication

**Generate Nonce (for signature)**
```bash
GET /api/wallet/0x742d35Cc6634C0532925a3b844Bc9e7595f.../nonce

Response:
{
  "success": true,
  "walletAddress": "0x742d35cc...",
  "nonce": "abc123xyz789",
  "message": "Sign this nonce with your wallet..."
}
```

**Verify Signature**
```bash
POST /api/wallet/verify
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f...",
  "signature": "0x...",
  "nonce": "abc123xyz789"
}

Response:
{
  "success": true,
  "walletAddress": "0x742d35cc...",
  "verified": true,
  "token": "base64-encoded-token"
}
```

### User Profile (Wallet-Based)

**Get User Profile**
```bash
GET /api/user/0x742d35Cc6634C0532925a3b844Bc9e7595f.../profile

Response:
{
  "success": true,
  "data": {
    "walletAddress": "0x742d35cc...",
    "totalSpores": 500,
    "questsCompleted": 5,
    "chainId": 501,
    "isVerified": true,
    "lastActiveAt": "2026-01-18T10:30:00Z"
  }
}
```

**Get Spore Balance**
```bash
GET /api/user/0x742d35Cc.../spores

Response:
{
  "success": true,
  "walletAddress": "0x742d35cc...",
  "totalSpores": 500
}
```

**Get User Rank**
```bash
GET /api/user/0x742d35Cc.../rank

Response:
{
  "success": true,
  "walletAddress": "0x742d35cc...",
  "rank": 3,
  "spores": 500
}
```

### Quests (Web3)

**Create Quest**
```bash
POST /api/user/0x742d35Cc.../quests
Content-Type: application/json
x-api-key: your-api-key

{
  "title": "Swap 1000 tokens",
  "description": "Complete a token swap on Raydium",
  "reward": 50,
  "questType": "on-chain",
  "contractAddress": "0xTokenAddress..."
}

Response:
{
  "success": true,
  "questId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Quest created successfully"
}
```

**List User Quests**
```bash
GET /api/user/0x742d35Cc.../quests?completed=false

Response:
{
  "success": true,
  "data": [
    {
      "id": "550e8400...",
      "walletAddress": "0x742d35cc...",
      "title": "Swap 1000 tokens",
      "reward": 50,
      "questType": "on-chain",
      "completed": false,
      "transactionHash": null
    }
  ]
}
```

**Complete Quest (with On-Chain Proof)**
```bash
POST /api/user/0x742d35Cc.../quests/550e8400.../complete
Content-Type: application/json
x-api-key: your-api-key

{
  "proofData": {
    "contractAddress": "0xTokenAddress...",
    "functionCalled": "swap",
    "amountSwapped": "1000000000000",
    "chainId": 501
  },
  "transactionHash": "0x1234567890abcdef..."
}

Response:
{
  "success": true,
  "message": "Quest completed! Spores awarded.",
  "walletAddress": "0x742d35cc...",
  "questId": "550e8400..."
}
```

### Leaderboard & Stats

**Get Leaderboard (No Auth)**
```bash
GET /api/leaderboard?limit=10

Response:
{
  "success": true,
  "data": [
    {
      "walletAddress": "0x742d35cc...",
      "totalSpores": 500,
      "questsCompleted": 5,
      "isVerified": true
    },
    ...
  ]
}
```

**Get Stats (No Auth)**
```bash
GET /api/stats

Response:
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalSpores": 15000,
    "totalQuestsCompleted": 500,
    "topPlayer": {
      "walletAddress": "0x742d35cc...",
      "totalSpores": 500
    }
  }
}
```

## Frontend Integration Examples

### Connect Wallet & Sign In

```javascript
import { ethers } from 'ethers';

const API = 'https://your-railway-url/api';

async function connectWallet() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  
  // Get nonce
  const nonceRes = await fetch(`${API}/wallet/${address}/nonce`);
  const { nonce } = await nonceRes.json();
  
  // Sign message
  const signature = await signer.signMessage(`Sign to verify: ${nonce}`);
  
  // Verify on backend
  const verifyRes = await fetch(`${API}/wallet/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress: address,
      signature,
      nonce
    })
  });
  
  const { token } = await verifyRes.json();
  localStorage.setItem('wallet_token', token);
  
  return address;
}
```

### Get User Profile & Spores

```javascript
async function getUserProfile(walletAddress) {
  const res = await fetch(`${API}/user/${walletAddress}/profile`);
  const { data } = await res.json();
  
  console.log(`Total Spores: ${data.totalSpores}`);
  console.log(`Quests Completed: ${data.questsCompleted}`);
  
  return data;
}
```

### Create & Complete Quest

```javascript
async function createQuest(walletAddress, apiKey) {
  const res = await fetch(`${API}/user/${walletAddress}/quests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      title: 'Swap Tokens on Raydium',
      description: 'Complete a token swap',
      reward: 50,
      questType: 'on-chain',
      contractAddress: '0xRaydium...'
    })
  });
  
  const { questId } = await res.json();
  return questId;
}

async function completeQuest(walletAddress, questId, transactionHash, apiKey) {
  const res = await fetch(
    `${API}/user/${walletAddress}/quests/${questId}/complete`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        transactionHash,
        proofData: {
          chainId: 501,
          contractAddress: '0xRaydium...',
          tokenAmount: '1000000000000'
        }
      })
    }
  );
  
  const result = await res.json();
  console.log('✅ Spores awarded!');
  return result;
}
```

### Display Leaderboard

```javascript
async function displayLeaderboard() {
  const res = await fetch(`${API}/leaderboard?limit=10`);
  const { data } = await res.json();
  
  data.forEach((user, i) => {
    const shortAddr = `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(-4)}`;
    console.log(`${i + 1}. ${shortAddr}: ${user.totalSpores} spores (${user.questsCompleted} quests)`);
  });
}
```

## Database Schema (Web3-Optimized)

### user_profiles
```sql
walletAddress (PK)    - Ethereum/Solana address (lowercase)
telegramUserId (FK)   - Optional Telegram link
telegramName          - User's Telegram name
totalSpores           - Cumulative spores
questsCompleted       - Number completed
chainId               - Primary blockchain (501=Solana, 1=Ethereum)
isVerified            - Signature verified
nonce                 - For wallet sign-in
lastActiveAt          - Last interaction
```

### quests
```sql
id (PK)               - UUID
walletAddress (FK)    - Quest owner/participant
title                 - Quest name
description           - Quest details
reward                - Spores to earn
questType             - 'general' or 'on-chain'
contractAddress       - Associated contract
chainId               - Blockchain for proof
completed             - Quest status
transactionHash       - On-chain proof
completedAt           - Completion timestamp
```

### participation_proofs
```sql
id (PK)               - UUID
questId (FK)          - Associated quest
walletAddress (FK)    - Quest participant
proofType             - 'on-chain' or 'off-chain'
proofData             - JSON with proof details
transactionHash       - On-chain transaction
verified              - Proof verified?
chainId               - Blockchain used
```

## Wallet Integration Best Practices

### 1. Support Multiple Wallets
```typescript
// Users can connect multiple wallets
const connectedWallets = await db.from('wallet_connections')
  .select('*')
  .eq('userId', userId);
```

### 2. Signature Verification
```typescript
// Never trust frontend signatures - verify on backend
import { verifyMessage } from 'ethers/lib/utils';

const recoveredAddress = verifyMessage(message, signature);
if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
  throw new Error('Signature invalid');
}
```

### 3. Chain Verification
```typescript
// Check transaction is on correct chain
if (receipt.chainId !== expectedChainId) {
  throw new Error('Wrong network');
}
```

### 4. Gas Fee Handling
```typescript
// Consider displaying gas costs to users
const estimatedGas = await contract.estimateGas.completeQuest();
const gasCost = estimatedGas.mul(gasPrice);
```

## Security Considerations

✅ **Implemented:**
- Wallet signature verification (no passwords)
- Nonce-based replay attack prevention
- On-chain proof verification
- Audit trail of all transactions
- Chain ID validation

⚠️ **For Production:**
- Implement RateLimiting on API
- Add IP whitelisting
- Use HTTPS everywhere
- Monitor for contract exploits
- Implement fraud detection
- Consider insurance fund for prizes

## Testing Wallet Integration

### 1. Test with Testnet
```bash
# Ethereum Goerli
chainId = 5

# Solana Devnet
chainId = 999

# Polygon Mumbai
chainId = 80001
```

### 2. Mock Wallet Signature
```javascript
// For testing without real wallet
const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f...';
const testNonce = 'test-nonce-123';
const testSignature = 'test-sig-abc...';
```

### 3. Test Quest Completion
```bash
# Create test quest
curl -X POST \
  -H "x-api-key: test-key" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","reward":10,"questType":"general"}' \
  https://your-url/api/user/0x742d.../quests

# Complete with mock proof
curl -X POST \
  -H "x-api-key: test-key" \
  -d '{"proofData":{"test":"data"},"transactionHash":"0x123..."}' \
  https://your-url/api/user/0x742d.../quests/{questId}/complete
```

## Deployment Checklist

- [ ] Run updated SQL schema in Supabase
- [ ] Update environment variables in Railway
- [ ] Test wallet authentication flow
- [ ] Verify quest creation and completion
- [ ] Test leaderboard display
- [ ] Monitor logs for errors
- [ ] Announce Web3 features to community

## Migration from User IDs

If migrating from old system with Telegram user IDs:

```sql
-- Link wallet to existing Telegram users
UPDATE user_profiles
SET telegramUserId = (SELECT telegramUserId FROM users WHERE oldId = user_profiles.userId)
WHERE walletAddress IS NOT NULL;
```

## Future Enhancements

- Multi-wallet support (multiple wallets per user)
- Cross-chain quests (earn on multiple chains)
- NFT rewards instead of just spores
- DAO governance for quest creation
- Real-time blockchain event listening
- Automated proof verification
- Integration with popular DEXs

---

## Support

For issues or questions:
- Check logs: `railway logs`
- Verify Supabase schema: Run `supabase-setup.sql`
- Test API: Use cURL examples in `examples-api.sh`
- Review error messages in response

**Your King Myco bot is now Web3-ready!** 🚀🌐
