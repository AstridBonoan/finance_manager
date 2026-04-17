# GitHub Secrets & Environment Variables Setup

## Overview

This guide explains how to configure GitHub Secrets for the CI/CD pipeline and production environment.

## GitHub Secrets

### What Are GitHub Secrets?

GitHub Secrets are encrypted environment variables that are:
- Only available in GitHub Actions workflows
- Never logged or displayed in workflow output
- Securely stored and managed by GitHub
- Used for sensitive data (passwords, API keys, tokens)

### Setting Up GitHub Secrets

#### Step 1: Access Repository Settings

1. Go to https://github.com/AstridBonoan/finance_manager
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

#### Step 2: Add Required Secrets

Add the following secrets one by one:

### Required Secrets

#### Database
```
Name: DATABASE_URL
Value: postgresql://user:password@host:5432/finance_manager
```

#### Authentication
```
Name: JWT_SECRET
Value: [Generate secure random key - 32+ characters]

Name: NEXTAUTH_SECRET
Value: [Generate secure random key - 32+ characters]

Name: NEXTAUTH_URL
Value: https://yourdomain.com (production URL)
```

#### Environment
```
Name: NODE_ENV
Value: production

Name: NEXT_PUBLIC_API_URL
Value: https://api.yourdomain.com (production API URL)
```

#### Optional: Third-party Services
```
Name: STRIPE_SECRET_KEY
Value: sk_test_... (from Stripe dashboard)

Name: OPENAI_API_KEY
Value: sk-... (from OpenAI dashboard)
```

## Generating Secure Keys

### Create Random Secrets (Terminal)

```bash
# Generate 32-character random key
# Windows PowerShell:
-join ((1..32) | ForEach-Object { [char][byte]::RandomNew(33..126) })

# macOS/Linux:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Environment Variables by Stage

### Development (.env.local)
```
DATABASE_URL=postgresql://user:password@localhost:5432/finance_manager_dev
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXTAUTH_SECRET=dev-secret-not-production
NEXTAUTH_URL=http://localhost:3000
```

### Staging
```
DATABASE_URL=postgresql://user:pass@staging-db.example.com:5432/finance_manager
NODE_ENV=staging
NEXT_PUBLIC_API_URL=https://api-staging.example.com
NEXTAUTH_SECRET=[Secure random key from GitHub Secrets]
NEXTAUTH_URL=https://staging.example.com
```

### Production
```
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/finance_manager
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.example.com
NEXTAUTH_SECRET=[Secure random key from GitHub Secrets]
NEXTAUTH_URL=https://example.com
```

## Using Secrets in GitHub Actions

### In Workflow Files (.github/workflows/*)

```yaml
env:
  NODE_ENV: production
  NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build with secrets
        run: pnpm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## Best Practices

### ✅ Do's
- ✅ Store all sensitive data as secrets
- ✅ Use different secrets for different environments
- ✅ Rotate secrets regularly (quarterly)
- ✅ Use strong, random values (32+ characters)
- ✅ Document which secrets are required
- ✅ Review secret access logs periodically

### ❌ Don'ts
- ❌ Never commit secrets to git
- ❌ Never paste secrets in issues or PRs
- ❌ Never share secrets via email or chat
- ❌ Never use same secret across environments
- ❌ Don't log or print secrets in output
- ❌ Never use simple/guessable secrets

## Rotating Secrets

### When to Rotate
- Quarterly (best practice)
- When team member leaves
- If secret is compromised
- Before major deployment

### Rotation Process

1. Generate new secret value
2. Update in GitHub Secrets
3. Update in production environment variables
4. Monitor for errors (might take 5-10 min)
5. Document rotation date

```bash
# Example: Rotating JWT_SECRET
1. Generate new: openssl rand -base64 32
2. GitHub: Settings → Secrets → JWT_SECRET → Update
3. Deployment: Redeploy application
4. Monitor: Check application logs
```

## Environment-Specific Secrets

### Feature Branch Secrets

GitHub doesn't support per-branch secrets, but you can:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'  # Only on main branch
    env:
      DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
```

## Troubleshooting

### "Secrets not available in workflow"

```yaml
# ❌ Wrong - can't access secrets directly
- run: echo $DATABASE_URL  # Empty!

# ✅ Correct - must use secrets. prefix
- run: echo ${{ secrets.DATABASE_URL }}
```

### "Access denied to secret"

Solution: 
- Check branch has permission (usually main/develop)
- Verify secret exists in Settings
- Check workflow has read permissions

### "Secret value showing in logs"

GitHub automatically masks secrets in logs, but:
- Always verify secrets aren't printed
- Use `secrets.VARIABLE_NAME` syntax
- Never echo secrets in logs
- Never commit .env files

## Secret Naming Convention

```
PROD_DATABASE_URL       # Production database
STAGING_DATABASE_URL    # Staging database
JWT_SECRET              # JWT signing key
NEXTAUTH_SECRET         # NextAuth.js secret
STRIPE_SECRET_KEY       # Stripe API key
OPENAI_API_KEY          # OpenAI API key
GITHUB_TOKEN            # GitHub API token
```

## Verification Checklist

- [ ] All required secrets are added
- [ ] Secrets use strong random values
- [ ] Environment variables match production config
- [ ] Database URL is correct
- [ ] API endpoints are correct
- [ ] Workflow can access secrets
- [ ] Build succeeds with secrets
- [ ] No secrets appear in workflow logs
- [ ] Team knows which secrets to rotate

## Accessing Secrets from Different Services

### AWS Lambda Environment Variables
```bash
# Store in AWS Secrets Manager
aws secretsmanager create-secret \
  --name finance-manager/prod/db-url \
  --secret-string "postgresql://..."
```

### Docker Container
```yaml
# In docker-compose.yml
environment:
  DATABASE_URL: ${DATABASE_URL}
```

### Kubernetes Secrets
```bash
kubectl create secret generic finance-secrets \
  --from-literal=DATABASE_URL=postgresql://...
```

## Security Audit

### Monthly Security Check
- [ ] Review secret access logs
- [ ] Verify all secrets are still needed
- [ ] Check for unused secrets
- [ ] Verify no hardcoded values in code
- [ ] Test secret rotation procedure

### Documentation Update
- Update this guide if secrets change
- Document any new services
- Note expiration dates (API keys)
- Keep disaster recovery procedures current

## Emergency: Secret Compromise

If a secret is compromised:

1. **Immediately revoke** the compromised secret
2. **Generate new** secret value
3. **Update everywhere**:
   - GitHub Secrets
   - Production environment
   - Any dependent services
4. **Monitor** application logs for issues
5. **Notify** team and audit trail

## Related Documentation

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [CI/CD Pipeline Guide](./.github/workflows/ci.yml)
- [Deployment Guide](./DEPLOYMENT.md)

---

**Last Updated:** April 17, 2026  
**Maintained By:** Finance Manager Team
