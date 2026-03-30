# Soroban Aid Escrow - API Examples

Quick reference for common operations. All examples use curl.

## Environment Setup

```bash
# Set base URL
BASE_URL="http://localhost:3001"
TOKEN="your-jwt-token"
```

## 1. Create Single Aid Package

Create a new aid package for a specific recipient.

```bash
curl -X POST "${BASE_URL}/onchain/aid-escrow/packages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "packageId": "pkg-2026-03-30-001",
    "recipientAddress": "GBUQWP3BOUZX34ULNQG23RQ6F4BFXWBTRSE53XSTE23JMCVOCJGXVSVZ",
    "amount": "1000000000",
    "tokenAddress": "GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ5LKG3FZTSZ3NYNEJBBENSN",
    "expiresAt": 1711900800,
    "metadata": {
      "campaign_ref": "humanitarian-aid-2026",
      "region": "LATAM"
    }
  }'
```

**Expected Response (201 Created):**
```json
{
  "packageId": "pkg-2026-03-30-001",
  "transactionHash": "ABC123DEF456ABC123DEF456ABC123DEF456ABC123DEF456ABC123DEF456ABCD",
  "timestamp": "2026-03-30T12:30:00.000Z",
  "status": "success",
  "metadata": {
    "contractId": "CBAA...",
    "operator": "GOPER8TORADDRESS..."
  }
}
```

## 2. Batch Create Aid Packages

Create multiple aid packages for multiple recipients in one transaction (more efficient).

```bash
curl -X POST "${BASE_URL}/onchain/aid-escrow/packages/batch" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "recipientAddresses": [
      "GBUQWP3BOUZX34ULNQG23RQ6F4BFXWBTRSE53XSTE23JMCVOCJGXVSVZ",
      "GA5ZSEJYB37JRC5AVCIA5MOP4GZ5DA47EL5QRUVLYEK2OOABEXVR5CV7",
      "GCZXWRNQALMNNRUOCIIHCHGWEYWMCG5CCSJQILMAY4FZONZ7ailcnq2"
    ],
    "amounts": [
      "1000000000",
      "500000000",
      "750000000"
    ],
    "tokenAddress": "GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ5LKG3FZTSZ3NYNEJBBENSN",
    "expiresIn": 2592000,
    "metadata": {
      "campaign_ref": "emergency-relief-march-2026"
    }
  }'
```

**Expected Response (201 Created):**
```json
{
  "packageIds": ["0", "1", "2"],
  "transactionHash": "XYZ789ABC123XYZ789ABC123XYZ789ABC123XYZ789ABC123XYZ789ABC123XYZA",
  "timestamp": "2026-03-30T12:30:00.000Z",
  "status": "success",
  "metadata": {
    "contractId": "CBAA...",
    "count": 3
  }
}
```

## 3. Claim Aid Package

As a recipient, claim your aid package to receive the funds.

```bash
curl -X POST "${BASE_URL}/onchain/aid-escrow/packages/pkg-2026-03-30-001/claim" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{}'
```

**Expected Response (200 OK):**
```json
{
  "packageId": "pkg-2026-03-30-001",
  "transactionHash": "DEF456GHI789DEF456GHI789DEF456GHI789DEF456GHI789DEF456GHI789DEFG",
  "timestamp": "2026-03-30T12:35:00.000Z",
  "status": "success",
  "amountClaimed": "1000000000",
  "metadata": {
    "contractId": "CBAA...",
    "recipient": "GBUQWP3BOUZX34ULNQG23RQ6F4BFXWBTRSE53XSTE23JMCVOCJGXVSVZ"
  }
}
```

## 4. Disburse Aid Package (Admin Action)

As an admin, disburse a package (alternative to recipient claim).

```bash
curl -X POST "${BASE_URL}/onchain/aid-escrow/packages/pkg-2026-03-30-001/disburse" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{}'
```

**Expected Response (200 OK):**
```json
{
  "packageId": "pkg-2026-03-30-001",
  "transactionHash": "GHI789JKL012GHI789JKL012GHI789JKL012GHI789JKL012GHI789JKL012GHIJ",
  "timestamp": "2026-03-30T12:40:00.000Z",
  "status": "success",
  "amountDisbursed": "1000000000",
  "metadata": {
    "contractId": "CBAA...",
    "operator": "GOPER8TORADDRESS..."
  }
}
```

## 5. Get Package Details

Retrieve full details of an aid package including status and expiration.

```bash
curl -X GET "${BASE_URL}/onchain/aid-escrow/packages/pkg-2026-03-30-001" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Expected Response (200 OK):**
```json
{
  "package": {
    "id": "pkg-2026-03-30-001",
    "recipient": "GBUQWP3BOUZX34ULNQG23RQ6F4BFXWBTRSE53XSTE23JMCVOCJGXVSVZ",
    "amount": "1000000000",
    "token": "GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ5LKG3FZTSZ3NYNEJBBENSN",
    "status": "Claimed",
    "createdAt": 1711814400,
    "expiresAt": 1714406400,
    "metadata": {
      "campaign_ref": "humanitarian-aid-2026",
      "region": "LATAM"
    }
  },
  "timestamp": "2026-03-30T12:45:00.000Z"
}
```

## 6. Get Package Statistics

Retrieve aggregated statistics for all packages.

```bash
curl -X GET "${BASE_URL}/onchain/aid-escrow/stats" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Expected Response (200 OK):**
```json
{
  "aggregates": {
    "totalCommitted": "5000000000",
    "totalClaimed": "2500000000",
    "totalExpiredCancelled": "500000000"
  },
  "timestamp": "2026-03-30T12:50:00.000Z"
}
```

## Error Examples

### 400 - Bad Request (Invalid Amount)
```bash
curl -X POST "${BASE_URL}/onchain/aid-escrow/packages" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "pkg-001",
    "amount": "-1000",  # Invalid: negative amount
    ...
  }'
```

**Response:**
```json
{
  "code": 400,
  "message": "Invalid amount",
  "details": {
    "error_type": "contract_error",
    "error_code": 4
  },
  "traceId": "REQ-ABC123",
  "timestamp": "2026-03-30T12:55:00.000Z",
  "path": "/onchain/aid-escrow/packages"
}
```

### 404 - Not Found (Package Not Found)
```bash
curl -X GET "${BASE_URL}/onchain/aid-escrow/packages/nonexistent-pkg" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Response:**
```json
{
  "code": 404,
  "message": "Package not found",
  "details": {
    "error_type": "contract_error",
    "error_code": 5
  },
  "traceId": "REQ-DEF456",
  "timestamp": "2026-03-30T13:00:00.000Z",
  "path": "/onchain/aid-escrow/packages/nonexistent-pkg"
}
```

### 409 - Conflict (Package Already Exists)
```bash
curl -X POST "${BASE_URL}/onchain/aid-escrow/packages" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "pkg-2026-03-30-001",  # Already created
    ...
  }'
```

**Response:**
```json
{
  "code": 409,
  "message": "Package ID already exists",
  "details": {
    "error_type": "contract_error",
    "error_code": 10
  },
  "traceId": "REQ-GHI789",
  "timestamp": "2026-03-30T13:05:00.000Z",
  "path": "/onchain/aid-escrow/packages"
}
```

### 410 - Gone (Package Expired)
```bash
curl -X POST "${BASE_URL}/onchain/aid-escrow/packages/expired-pkg/claim" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Response:**
```json
{
  "code": 410,
  "message": "Package has expired",
  "details": {
    "error_type": "contract_error",
    "error_code": 7
  },
  "traceId": "REQ-JKL012",
  "timestamp": "2026-03-30T13:10:00.000Z",
  "path": "/onchain/aid-escrow/packages/expired-pkg/claim"
}
```

### 403 - Forbidden (Not Authorized)
```bash
curl -X POST "${BASE_URL}/onchain/aid-escrow/packages" \
  -H "Authorization: Bearer ${INVALID_TOKEN}" \
  -d '{ ... }'
```

**Response:**
```json
{
  "code": 403,
  "message": "Not authorized to perform this action",
  "details": {
    "error_type": "contract_error",
    "error_code": 3
  },
  "traceId": "REQ-MNO345",
  "timestamp": "2026-03-30T13:15:00.000Z",
  "path": "/onchain/aid-escrow/packages"
}
```

### 400 - Bad Request (Mismatched Arrays)
```bash
curl -X POST "${BASE_URL}/onchain/aid-escrow/packages/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientAddresses": [
      "GBUQWP3BOUZX34ULNQG23RQ6F4BFXWBTRSE53XSTE23JMCVOCJGXVSVZ",
      "GA5ZSEJYB37JRC5AVCIA5MOP4GZ5DA47EL5QRUVLYEK2OOABEXVR5CV7"
    ],
    "amounts": ["1000000000"],  # Only 1 amount for 2 recipients
    ...
  }'
```

**Response:**
```json
{
  "code": 400,
  "message": "Recipients and amounts arrays must have the same length",
  "details": {
    "error_type": "validation_error"
  },
  "traceId": "REQ-PQR678",
  "timestamp": "2026-03-30T13:20:00.000Z",
  "path": "/onchain/aid-escrow/packages/batch"
}
```

## Common Patterns

### Check if Package Exists Before Claiming
```bash
# First check package status
curl -X GET "${BASE_URL}/onchain/aid-escrow/packages/pkg-001"

# Then claim if status is "Created"
curl -X POST "${BASE_URL}/onchain/aid-escrow/packages/pkg-001/claim"
```

### Create Multiple Packages Efficiently
```bash
# Use batch endpoint instead of creating individually
# Much more efficient than multiple POST requests
for i in {1..100}; do
  # Create 100 packages in one call
  curl -X POST "${BASE_URL}/onchain/aid-escrow/packages/batch" \
    -d "{recipients: [...], amounts: [...]}"
done
```

### Monitor Package Statistics
```bash
# Poll stats endpoint to track progress
while true; do
  curl -X GET "${BASE_URL}/onchain/aid-escrow/stats"
  sleep 60  # Check every minute
done
```

## Testing with JavaScript

```javascript
const BASE_URL = 'http://localhost:3001';
const TOKEN = 'your-jwt-token';

async function createPackage() {
  const response = await fetch(`${BASE_URL}/onchain/aid-escrow/packages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      packageId: 'pkg-js-001',
      recipientAddress: 'GBUQWP3BOUZX34ULNQG23RQ6F4BFXWBTRSE53XSTE23JMCVOCJGXVSVZ',
      amount: '1000000000',
      tokenAddress: 'GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ5LKG3FZTSZ3NYNEJBBENSN',
      expiresAt: Math.floor(Date.now() / 1000) + 86400 * 30,
    }),
  });

  return response.json();
}

async function claimPackage(packageId) {
  const response = await fetch(
    `${BASE_URL}/onchain/aid-escrow/packages/${packageId}/claim`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
      },
    },
  );

  return response.json();
}
```

## Notes

- All amounts are in **stroops** (1 XLM = 10^7 stroops)
- Timestamps are Unix epoch (seconds since 1970-01-01)
- Package IDs should be unique identifiers within your system
- Token addresses must be valid Stellar addresses
- Recipient addresses must be valid Stellar addresses
- Set `ONCHAIN_ADAPTER=soroban` in production
- Use mock adapter for local testing: `ONCHAIN_ADAPTER=mock`
