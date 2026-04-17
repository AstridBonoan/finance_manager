# Branch Protection & Repository Settings Guide

## Overview

This guide explains how to configure GitHub branch protection rules and repository settings for production-ready development.

## Branch Protection Setup

### Step 1: Access Branch Protection Settings

1. Go to https://github.com/AstridBonoan/finance_manager
2. Click **Settings** → **Branches**
3. Under "Branch protection rules", click **Add rule**

### Step 2: Create Rule for `master` Branch

#### Rule Name Pattern
```
Branch name pattern: master
```

#### Protection Settings

Enable the following:

- ✅ **Require a pull request before merging**
  - Require approvals: **1**
  - Require review from code owners: **Yes** (optional)
  - Dismiss stale pull request approvals when new commits are pushed: **Yes**

- ✅ **Require status checks to pass before merging**
  - Status checks that must pass:
    - `backend-typecheck`
    - `backend-build`
    - `backend-test`
    - `frontend-typecheck`
    - `frontend-build`
    - `frontend-test`
    - `lint`
    - `all-checks`
  - Require branches to be up to date before merging: **Yes**

- ✅ **Require code reviews**
  - Required number of reviewers: **1**
  - Require review from code owners: **No** (unless you have CODEOWNERS file)
  - Allow specified actors to bypass required pull requests: **No**

- ✅ **Require conversation resolution before merging**
  - Yes

- ✅ **Require linear history**
  - Yes (keeps commit history clean)

- ✅ **Include administrators**
  - Yes (apply rules to admins too)

- ⭕ **Restrict who can push to matching branches** (Optional)
  - Can be restrictive, enable if needed

### Step 3: Create Rule for `develop` Branch (Optional)

Same settings as `master` but less strict:
- Require approvals: **1**
- Status checks still required
- No linear history requirement

## Repository Settings

### Step 1: General Settings

Navigate to **Settings** → **General**

- **Repository name**: `finance_manager`
- **Description**: "Personal Finance Management Application"
- **Visibility**: Private (if sensitive data) or Public
- **Default branch**: `master`

### Step 2: Code Security Settings

Navigate to **Settings** → **Code security and analysis**

Enable:
- ✅ **Dependabot alerts** - Monitor dependencies
- ✅ **Dependabot security updates** - Auto-update vulnerable packages
- ✅ **Dependabot version updates** - Auto-update dependencies
- ✅ **Secret scanning** - Detect exposed secrets
- ✅ **Push protection** - Block commits with secrets

### Step 3: Configure Dependabot

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "sunday"
      time: "03:00"
    pull-request-branch-name:
      separator: "-"
    reviewers:
      - "AstridBonoan"
    commit-message:
      prefix: "chore"
      prefix-scope: "deps"
    allow:
      - dependency-type: "production"
      - dependency-type: "development"
```

### Step 4: Actions Settings

Navigate to **Settings** → **Actions** → **General**

- **Actions permissions**: Allow all actions and reusable workflows
- **Workflow permissions**:
  - Default permissions: **Read and write**
  - Allow GitHub Actions to approve pull requests: **No** (security)

### Step 5: Pages (Documentation Site)

Navigate to **Settings** → **Pages**

If you want to host documentation:
- Source: `Deploy from a branch`
- Branch: `gh-pages` / `/root`

## CODEOWNERS File (Optional)

Create `.github/CODEOWNERS` to require code reviews from specific people:

```
# Root files
/ @AstridBonoan

# Backend
/apps/api/ @AstridBonoan
/packages/db/ @AstridBonoan

# Frontend
/apps/web/ @AstridBonoan

# Documentation
/docs/ @AstridBonoan
```

## Pull Request Templates

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## How to Test
Steps to verify the changes:
1. ...
2. ...
3. ...

## Checklist
- [ ] Tests pass locally
- [ ] No console errors
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] Commits are clear and descriptive

## Related Issues
Closes #123
```

## Issue Templates

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Report a bug to help improve the app
---

## Description
Clear description of the bug

## Steps to Reproduce
1. ...
2. ...
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: (e.g., Windows 11)
- Node: (e.g., 18.0.0)
- Browser: (e.g., Chrome 120)

## Additional Info
Screenshots, logs, etc.
```

## Workflow Permissions Summary

### Current CI/CD Workflow Permissions

The `.github/workflows/ci.yml` has:
- **read**: Can read repository files
- **write**: Can write to checks and status

This is correct and minimal for security.

## Status Checks Configuration

All these checks must pass before merging:

```
✅ backend-typecheck    - TypeScript validation
✅ backend-build        - NestJS compilation
✅ backend-test         - Jest tests
✅ frontend-typecheck   - TypeScript validation
✅ frontend-build       - Next.js compilation
✅ frontend-test        - React tests
✅ lint                 - ESLint validation
✅ all-checks           - Summary status
```

If any check fails, the PR cannot be merged.

## Protected Branch Rules in Action

### Example: Creating a Feature

```bash
# 1. Create branch from master
git checkout master
git pull origin master
git checkout -b feature/add-analytics

# 2. Make changes
# ... code ...

# 3. Commit and push
git add .
git commit -m "feat: Add analytics feature"
git push -u origin feature/add-analytics

# 4. On GitHub: Create Pull Request
# - Status checks run automatically
# - All checks must pass ✅
# - Needs at least 1 approval

# 5. Request review
# - Reviewer approves PR

# 6. Merge PR
# - If all checks pass, "Merge" button appears
# - Can choose: Merge, Squash, Rebase

# 7. Delete branch (optional but recommended)
git branch -d feature/add-analytics
```

## Troubleshooting Branch Protection

### "Merge button is disabled"

Reason: A status check hasn't passed or is still running

Solution:
```bash
# Check CI/CD Actions tab
# View detailed logs of failing checks
# Fix the issue locally
# Push fix - CI will re-run automatically
```

### "Cannot dismiss review"

Reason: Protection rule requires review dismissal

Solution:
- Go to PR → Request changes → Approve new changes
- Stale reviews will auto-dismiss with new commits

### "Need admin override"

You can bypass rules if needed (if you included admins):
- Click "Bypass branch protections"
- Only when absolutely necessary
- Document reason in commit message

## Verifying Protection is Active

```bash
# Try to force push to master (should fail)
git push -f origin master
# Error: Ref protected from deletion or force push

# Try direct commit (should fail)
git push origin master
# Error: branch protected; requires at least 1 approval
```

## Scheduled Status Checks

You can add scheduled checks that run on a schedule:

```yaml
# In .github/workflows/scheduled-checks.yml
name: Scheduled Checks
on:
  schedule:
    - cron: "0 2 * * *"  # Daily at 2 AM UTC
jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security scan
        run: npm audit
```

## Review Configuration

### Requiring Specific Reviewers

In branch protection rule:
- Enable "Require code owner review"
- Create `.github/CODEOWNERS` file

### Auto-approve Rules

Not recommended for production, but possible:
- Only approve dependabot updates
- Create separate automation workflow

## Migration from Unprotected to Protected

If master isn't protected yet:

1. Ensure all team members are on different branches
2. Create PR from develop → master
3. Get approval
4. Merge and delete develop
5. Enable branch protection
6. Create develop branch from master
7. Communicate to team

## Backup & Disaster Recovery

Even with protection, keep backups:

```bash
# Create local backup of all branches
git fetch --all
git clone --bare https://github.com/AstridBonoan/finance_manager.git
```

## Compliance & Auditing

### View Branch Protection History

```bash
# Via GitHub CLI
gh repo view --json branchProtectionRules

# View PR history
gh pr list --state all

# View branch deletion history
gh api repos/AstridBonoan/finance_manager/audit-log
```

### Audit Log Access

1. Go to **Settings** → **Audit log**
2. View all repository actions
3. Filter by action type
4. Export for compliance

## Best Practices

✅ **Do's**
- ✅ Protect main branches (master, develop)
- ✅ Require PR reviews
- ✅ Require status checks
- ✅ Dismiss stale approvals
- ✅ Require up-to-date branches
- ✅ Enable secret scanning
- ✅ Enable dependabot

❌ **Don'ts**
- ❌ Don't disable protections
- ❌ Don't add unnecessary approvers
- ❌ Don't allow force pushes to main
- ❌ Don't commit to master directly
- ❌ Don't ignore failing checks
- ❌ Don't skip security settings

## Enforcement Summary

### Current Status

| Feature | Master | Develop |
|---------|--------|---------|
| PR Required | ✅ | ✅ |
| Approvals | 1 | 1 |
| Status Checks | 8 | 8 |
| Up to date | ✅ | ✅ |
| Linear history | ✅ | ❌ |
| Admins included | ✅ | ✅ |

## Next Steps

1. Implement all settings above
2. Test with a sample PR
3. Document exceptions (if any)
4. Train team on PR process
5. Monitor and adjust as needed

---

**Last Updated:** April 17, 2026  
**Documentation Status:** Production Ready
