# Soroban Aid Escrow - Dependencies & Installation

## Package Dependencies

### Already Included in Backend

All required dependencies are already in `package.json`. No additional dependencies needed for the core implementation.

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/config": "^4.0.2",
    "@nestjs/swagger": "^11.2.5",
    "class-validator": "^0.14.3",
    "class-transformer": "^0.5.1"
  }
}
```

### Optional: Stellar JS SDK

For production Soroban integration, install the Stellar JavaScript SDK:

```bash
pnpm add stellar
```

**Note**: The implementation uses dynamic imports, so the SDK is only required when using `ONCHAIN_ADAPTER=soroban`. For mock adapter development, it's not needed.

## Import Structure

### Production Implementation (SorobanAdapter)
```typescript
// Dynamically imported when needed
const mod = await import('stellar');
```

### Mock Adapter (No External Dependencies)
```typescript
// Uses only Node.js built-ins: crypto
import { createHash } from 'crypto';
```

## Installation Instructions

### 1. Fresh Installation

```bash
# Clone repository (if needed)
git clone <repo-url>
cd Memmplethee/Soter

# Install workspace dependencies
pnpm install

# Install backend specifically
cd app/backend
pnpm install
```

### 2. For Development (Mock Adapter)

No additional installation needed beyond `pnpm install`:

```bash
# Backend already ready
ONCHAIN_ADAPTER=mock pnpm start:dev
```

### 3. For Production (Soroban Adapter)

Install Stellar SDK:

```bash
cd app/backend
pnpm add stellar
```

Then use Soroban adapter:

```bash
ONCHAIN_ADAPTER=soroban \
SOROBAN_CONTRACT_ID=CAxxxxxx \
pnpm start:prod
```

## Environment Setup

### Node Version

Verify you're using Node.js 18 or higher:

```bash
node --version     # Should be v18.x, v20.x, etc.
pnpm --version     # Should be 8.x or higher
```

### pnpm Workspace

The project uses pnpm workspaces. Install pnpm if needed:

```bash
npm install -g pnpm

# Or with Homebrew (macOS)
brew install pnpm
```

## Dependency Tree

### AidEscrow Service Dependencies

```
AidEscrowService
├── Inject(OnchainAdapter)
│   ├── SorobanAdapter
│   │   ├── ConfigService
│   │   ├── Logger
│   │   └── SorobanErrorMapper
│   └── MockOnchainAdapter
└── DTOs
    ├── CreateAidPackageDto
    ├── BatchCreateAidPackagesDto
    ├── ClaimAidPackageDto
    ├── DisburseAidPackageDto
    ├── GetAidPackageDto
    └── GetAidPackageStatsDto
```

### AidEscrow Controller Dependencies

```
AidEscrowController
├── AidEscrowService
├── SorobanErrorMapper
├── Logger
└── Request/Response handling
    ├── NestJS Guards (auth)
    ├── DTOs (validation)
    └── Swagger documentation
```

### Error Mapper Dependencies

```
SorobanErrorMapper
├── Soroban Error Codes (mapped)
├── HTTP Status Codes
├── NestJS Exceptions
│   ├── BadRequestException
│   └── InternalServerErrorException
└── Error Response Format (standardized)
```

## Optional Dependencies

### For Contract Interaction (When Using SorobanAdapter)

```json
{
  "devDependencies": {
    "stellar": "^latest"
  }
}
```

Install only when needed:

```bash
pnpm add --save-dev stellar
```

Or as runtime dependency:

```bash
pnpm add stellar
```

### For Development Tools

Already included:

```json
{
  "devDependencies": {
    "@nestjs/testing": "^11.0.1",
    "jest": "^30.0.0",
    "@types/jest": "^30.0.0",
    "ts-jest": "^29.2.5",
    "supertest": "^7.0.0"
  }
}
```

## Compatibility Matrix

| Component | Requirement | Status |
|-----------|-------------|--------|
| Node.js | ^18.0.0 | ✅ |
| TypeScript | ^5.7.3 | ✅ |
| NestJS | ^11.0.0 | ✅ |
| class-validator | ^0.14.0 | ✅ |
| class-transformer | ^0.5.0 | ✅ |
| PostgreSQL | ^12.0 | ✅ (for other features) |
| Stellar SDK | ^optional | ⚠️ (optional for Soroban) |

## Installation Verification

### Verify Core Dependencies

```bash
# Check installed versions
pnpm list @nestjs/common
pnpm list @nestjs/config
pnpm list class-validator
```

### Verify Stellar SDK (If Installed)

```bash
# If using Soroban adapter
pnpm list stellar

# Or check if installed
npm ls stellar

# Or verify import works
node -e "require('stellar')" && echo "✓ Stellar SDK available"
```

### Verify NestJS Installation

```bash
# Check NestJS CLI
npx nest --version

# Or check package
pnpm list @nestjs/cli
```

## Build & Bundle

### Development Build

```bash
# Uses ts-loader for fast iteration
pnpm start:dev
```

### Production Build

```bash
# Compiles TypeScript to JavaScript
pnpm build

# Check output size
du -sh dist/

# Expected size: ~5-10 MB (depends on all modules)
```

## Docker Installation (Optional)

If containerizing the application:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY app/backend/package.json ./app/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY app/backend ./app/backend

# Build
RUN pnpm --filter backend run build

# Runtime
EXPOSE 3001
CMD ["pnpm", "--filter", "backend", "start:prod"]
```

## Troubleshooting Installation

### Issue: "pnpm: command not found"

Solution: Install pnpm globally
```bash
npm install -g pnpm@latest
```

### Issue: "Cannot find module '@nestjs/common'"

Solution: Run pnpm install
```bash
pnpm install

# Or specific directory
cd app/backend && pnpm install
```

### Issue: "stellar module not found"

Solution: Only needed for Soroban adapter
```bash
# Only if using ONCHAIN_ADAPTER=soroban
pnpm add stellar

# Or use mock adapter (default)
ONCHAIN_ADAPTER=mock pnpm start:dev
```

### Issue: "TypeScript compilation error"

Solution: Ensure TypeScript is installed
```bash
pnpm add -D typescript
pnpm install
```

### Issue: "Port 3001 already in use"

Solution: Use different port
```bash
PORT=3002 pnpm start:dev
```

## Version Management

### Lock File

The `pnpm-lock.yaml` ensures reproducible installs:

```bash
# Always use lock file
pnpm install

# Don't delete pnpm-lock.yaml
```

### Update Dependencies

```bash
# Check for updates
pnpm outdated

# Update with lock file
pnpm update

# Rebuild lock file
pnpm install --no-frozen-lockfile
```

## Performance Tips

### Install Speed

```bash
# Parallel installation (faster)
pnpm install

# With network cache
pnpm install --prefer-offline
```

### Build Speed

```bash
# Watch mode (incremental)
pnpm start:dev

# Production (optimized)
pnpm build && pnpm start:prod
```

## Dependency Vulnerabilities

### Check Security

```bash
# Audit installed packages
pnpm audit

# Fix vulnerabilities
pnpm audit --fix
```

## License Information

All dependencies are covered under their respective licenses. This project uses:

- **NestJS** - MIT License
- **TypeScript** - Apache 2.0
- **class-validator** - MIT License
- **Stellar JS SDK** - Apache 2.0 (when installed)

For full details, check `package.json` and component READMEs.

## Quick Reference

| Task | Command |
|------|---------|
| Install | `pnpm install` |
| Start Dev | `pnpm start:dev` |
| Build | `pnpm build` |
| Test | `pnpm test` |
| Lint | `pnpm lint:check` |
| Format | `pnpm format:check` |
| Add Package | `pnpm add <package>` |
| Remove Package | `pnpm remove <package>` |
| Install Optional | `pnpm add --optional stellar` |

## Support

For dependency issues:

1. **pnpm Issues**: https://pnpm.io/troubleshooting
2. **NestJS Issues**: https://github.com/nestjs/nest/issues
3. **Stellar SDK**: https://github.com/stellar/js-stellar-sdk/issues

## Next Steps

After verifying dependencies:

1. [Setup your environment](./SOROBAN_SETUP_GUIDE.md)
2. [Run integration tests](./SOROBAN_SETUP_GUIDE.md#verify-installation)
3. [Test API endpoints](./SOROBAN_API_EXAMPLES.md)
4. [Deploy to production](./SOROBAN_INTEGRATION.md#production-deployment)
