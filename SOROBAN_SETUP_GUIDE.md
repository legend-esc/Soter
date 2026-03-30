# Soroban Aid Escrow - Setup & Quick Start Guide

## Prerequisites

- Node.js 18+ and pnpm
- Backend repository cloned: `app/backend/`
- PostgreSQL running (for other features)
- Stellar CLI (optional, for contract inspection)

## Installation

### 1. Install Dependencies

The project already includes necessary dependencies. Verify in `package.json`:

- `@nestjs/common`, `@nestjs/core` - Core NestJS framework
- `@nestjs/config` - Configuration management
- `class-validator`, `class-transformer` - DTOs and validation
- `@nestjs/swagger` - API documentation

For Soroban integration, the `stellar` SDK will be dynamically imported when using the SorobanAdapter.

```bash
# Already included, but verify installation
cd app/backend
pnpm install

# Optional: Install Stellar JS SDK if using production SorobanAdapter
pnpm add stellar
```

### 2. Environment Configuration

Create `.env` file in `app/backend/`:

```bash
# Copy from example
cp .env.example .env

# Edit with your values
```

**For Development (Mock Adapter - No Blockchain Required):**

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/soter?schema=public"

# Blockchain - Use Mock Adapter
ONCHAIN_ADAPTER=mock

# Optional: Stellar config (not used with mock)
STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
# SOROBAN_CONTRACT_ID not needed when using mock

# API Key
API_KEY=your-secret-api-key-here
```

**For Testnet (Soroban Adapter):**

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/soter?schema=public"

# Blockchain - Use Soroban Adapter
ONCHAIN_ADAPTER=soroban

# Stellar Configuration
STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
SOROBAN_CONTRACT_ID=CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Deploy contract first, then add ID above
```

**For Production (Soroban Mainnet):**

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL="postgresql://user:securepass@prod-db:5432/soter_prod?schema=public"

# Blockchain - Production
ONCHAIN_ADAPTER=soroban

# Stellar - Mainnet
STELLAR_RPC_URL="https://soroban-mainnet.stellar.org"
STELLAR_NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
SOROBAN_CONTRACT_ID=CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Security
JWT_SECRET=$(openssl rand -base64 32)
API_KEY=production-api-key

# Logging
LOG_LEVEL=info
```

## Quick Start

### Option 1: Development with Mock Adapter (Recommended for Testing)

No blockchain interaction needed. Perfect for local development:

```bash
cd app/backend

# Set mock adapter
export ONCHAIN_ADAPTER=mock

# Start development server
pnpm start:dev
```

The server will start on `http://localhost:3001`

Test the API:
```bash
# Create an aid package
curl -X POST http://localhost:3001/onchain/aid-escrow/packages \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "test-pkg-001",
    "recipientAddress": "GBUQWP3BOUZX34ULNQG23RQ6F4BFXWBTRSE53XSTE23JMCVOCJGXVSVZ",
    "amount": "1000000000",
    "tokenAddress": "GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ5LKG3FZTSZ3NYNEJBBENSN",
    "expiresAt": 1711900800
  }'
```

### Option 2: Testnet Integration

Interact with actual Soroban testnet:

```bash
cd app/backend

# Prerequisites:
# 1. Deploy the AidEscrow contract to testnet
# 2. Get the contract ID (CAxxxxxx...)
# 3. Add SOROBAN_CONTRACT_ID to .env

export ONCHAIN_ADAPTER=soroban
export SOROBAN_CONTRACT_ID=CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Start server
pnpm start:dev
```

Note: This requires the Stellar SDK to be installed:
```bash
pnpm add stellar
```

### Option 3: Production Build

```bash
cd app/backend

# Build
pnpm build

# Start production server
pnpm start:prod
```

## Verify Installation

### 1. Check Swagger Docs

Open in browser:
```
http://localhost:3001/api/docs
```

You should see the API documentation with these endpoints:
- POST `/onchain/aid-escrow/packages`
- POST `/onchain/aid-escrow/packages/batch`
- POST `/onchain/aid-escrow/packages/:id/claim`
- POST `/onchain/aid-escrow/packages/:id/disburse`
- GET `/onchain/aid-escrow/packages/:id`
- GET `/onchain/aid-escrow/stats`

### 2. Run Tests

```bash
# All tests
pnpm test

# Specific test file
pnpm test -- aid-escrow.integration.spec.ts

# Watch mode (useful during development)
pnpm test:watch

# With coverage
pnpm test:cov
```

Expected output should show:
```
PASS  test/aid-escrow.integration.spec.ts
  AidEscrow Integration Tests
    Service: createAidPackage
      ✓ should create an aid package
      ✓ should include operator address in metadata
    Service: batchCreateAidPackages
      ✓ should batch create multiple aid packages
      ✓ should throw error if arrays have different lengths
    ...
    (20+ test cases)
```

### 3. Test API Endpoints

```bash
# Health check (all modules loaded)
curl http://localhost:3001/health

# Create package (mock adapter)
curl -X POST http://localhost:3001/onchain/aid-escrow/packages \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "verify-001",
    "recipientAddress": "GBUQWP3BOUZX34ULNQG23RQ6F4BFXWBTRSE53XSTE23JMCVOCJGXVSVZ",
    "amount": "1000000000",
    "tokenAddress": "GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ5LKG3FZTSZ3NYNEJBBENSN",
    "expiresAt": 1711900800
  }'

# Expected: 201 with success response
```

## Project Structure

```
app/backend/
├── src/
│   ├── onchain/
│   │   ├── aid-escrow.controller.ts        # REST endpoints
│   │   ├── aid-escrow.service.ts           # Business logic
│   │   ├── aid-escrow.module.ts            # Feature module
│   │   ├── onchain.adapter.ts              # Interface
│   │   ├── onchain.adapter.mock.ts         # Mock impl
│   │   ├── soroban.adapter.ts              # Soroban impl
│   │   ├── onchain.module.ts               # Module setup
│   │   ├── onchain.service.ts              # Queue management
│   │   ├── dto/
│   │   │   └── aid-escrow.dto.ts           # Request/response
│   │   ├── utils/
│   │   │   └── soroban-error.mapper.ts     # Error mapping
│   │   └── SOROBAN_INTEGRATION.md          # Full docs
│   ├── app.module.ts                       # Root module (updated)
│   └── ... (other modules)
│
├── test/
│   ├── aid-escrow.integration.spec.ts      # Integration tests
│   └── ... (other tests)
│
├── .env.example
├── package.json
└── ...
```

## Common Development Tasks

### Run Tests with Watch
```bash
pnpm test:watch
```

### Check Code Quality
```bash
# Lint
pnpm lint:check

# Format
pnpm format:check
```

### Build for Production
```bash
pnpm build

# Check build output size
du -sh dist/
```

### Generate Prisma Client
```bash
pnpm prisma:generate
```

### View Swagger Documentation
```bash
# While server is running
open http://localhost:3001/api/docs
```

## Troubleshooting

### Issue: "ONCHAIN_ADAPTER_TOKEN not found"
**Solution:** Make sure `AidEscrowModule` is imported in `AppModule`
```bash
# Check src/app.module.ts includes:
# import { AidEscrowModule } from './onchain/aid-escrow.module';
# Then add to imports: AidEscrowModule
```

### Issue: "Soroban SDK not available"
**Solution:** Install Stellar SDK
```bash
pnpm add stellar
```

### Issue: "Cannot find module '@nestjs/swagger'"
**Solution:** Already installed, but verify
```bash
pnpm install
```

### Issue: Tests failing with timeout
**Solution:** Increase Jest timeout in `jest.config.js`
```javascript
// jest.config.js
module.exports = {
  testTimeout: 30000, // 30 seconds
};
```

### Issue: Port already in use
**Solution:** Use different port
```bash
PORT=3002 pnpm start:dev
```

### Issue: Database connection failed
**Solution:** Ensure PostgreSQL is running
```bash
# Check if PostgreSQL is running
psql -U postgres -d postgres -c "SELECT 1;"

# Or with Docker
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  postgres:15
```

## Next Steps

1. **Understand the Architecture**
   - Read [SOROBAN_INTEGRATION.md](./src/onchain/SOROBAN_INTEGRATION.md)
   - Review adapter pattern in `onchain.adapter.ts`

2. **Test Locally**
   - Use mock adapter with `ONCHAIN_ADAPTER=mock`
   - Run integration tests: `pnpm test`

3. **Deploy Contract (If Not Already Done)**
   - Build contract: `cd app/onchain && make build`
   - Deploy to testnet following contract README
   - Get contract ID: `CAxxxxxx...`

4. **Test with Soroban**
   - Set `SOROBAN_CONTRACT_ID` in `.env`
   - Switch to `ONCHAIN_ADAPTER=soroban`
   - Start server and test endpoints

5. **Monitor Transactions**
   - Check Stellar testnet explorer: https://stellar.expert
   - Look for your contract transactions

6. **Production Deployment**
   - Build: `pnpm build`
   - Set production environment variables
   - Deploy with: `pnpm start:prod`

## Resources

- **Soroban Integration**: [SOROBAN_INTEGRATION.md](./src/onchain/SOROBAN_INTEGRATION.md)
- **API Examples**: [SOROBAN_API_EXAMPLES.md](./SOROBAN_API_EXAMPLES.md)
- **Error Handling**: [ERROR_HANDLING.md](./ERROR_HANDLING.md)
- **Contract**: [app/onchain/contracts/aid_escrow](../onchain/contracts/aid_escrow)
- **Stellar Docs**: https://developers.stellar.org/soroban
- **JS SDK**: https://github.com/stellar/js-stellar-sdk

## Support

If you encounter issues:

1. Check this guide and troubleshooting section
2. Review logs: `tail -f logs/server.log`
3. Check test output: `pnpm test -- --verbose`
4. Review Swagger docs: http://localhost:3001/api/docs
5. Check integration guide: [SOROBAN_INTEGRATION.md](./src/onchain/SOROBAN_INTEGRATION.md)

## Summary

You now have:
- ✅ Development environment with mock adapter (no blockchain needed)
- ✅ Production-ready SorobanAdapter for testnet/mainnet
- ✅ Comprehensive integration tests
- ✅ REST API with full documentation
- ✅ Error handling and validation
- ✅ Service layer abstraction

Start developing! 🚀
