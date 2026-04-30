# GitHub Actions — Comprehensive Production-Grade Example

> **A showcase of every major GitHub Actions feature**, built on top of the original "Hello GitHub Actions" skills course.

This repository contains a full CI/CD setup that demonstrates virtually every major GitHub Actions capability in a realistic, production-style configuration. Use it as a reference or starting point for your own projects.

---

## 📁 Repository Structure

```
.
├── src/
│   └── index.js                          # Simple Express.js server
├── tests/
│   └── index.test.js                     # Jest tests
├── package.json                          # npm scripts: lint, test, build, start
├── eslint.config.mjs                     # ESLint flat config
└── .github/
    ├── actions/
    │   └── setup-project/
    │       └── action.yml                # 📦 Local composite action
    └── workflows/
        ├── ci-cd-pipeline.yml            # 🚀 Main CI/CD pipeline
        ├── reusable-deploy.yml           # 🔁 Reusable deploy workflow
        ├── scheduled-maintenance.yml     # 🕐 Scheduled & event-driven
        └── release.yml                   # 🏷️ Tag-based release workflow
```

---

## 🔬 Features Demonstrated

### `.github/workflows/ci-cd-pipeline.yml` — Main CI/CD Pipeline

| Feature | Details |
|---------|---------|
| **Triggers** | `push`, `pull_request`, `workflow_dispatch` |
| **Path filters** | Only runs when `src/**`, `tests/**`, or `package.json` change |
| **`workflow_dispatch` inputs** | `environment` (choice), `debug_mode` (boolean), `version_override` (string) |
| **Concurrency control** | Groups by branch; cancels in-progress for non-`main` branches |
| **Workflow-level env vars** | `NODE_ENV`, `APP_NAME`, `REGISTRY` |
| **Permissions** | Declared at workflow and job level (principle of least privilege) |
| **`lint` job** | Runs ESLint via the composite action; uses `continue-on-error` |
| **`test` job** | Matrix strategy: Node 18/20/22 × ubuntu/windows; `fail-fast: false`; `max-parallel: 4`; caching; artifact upload |
| **`security-scan` job** | Runs in a **container** (`node:20-alpine`); uses a **Redis service**; `needs: [lint]` |
| **`build` job** | `needs: [lint, test]`; computes version; uses **job outputs** |
| **`deploy-staging` job** | `needs: [build]`; `if:` conditional (main branch only); **environment** with URL; downloads artifact |
| **`deploy-production` job** | `needs: [deploy-staging]`; `timeout-minutes: 30`; **production environment** (manual approval) |
| **Step outputs** | `$GITHUB_OUTPUT` for passing data between steps |
| **Job outputs** | `outputs:` block for passing data between jobs |
| **Artifacts** | Upload/download with `actions/upload-artifact@v4` / `actions/download-artifact@v4` |
| **Composite action** | Calls `./.github/actions/setup-project` |
| **Job summary** | Writes to `$GITHUB_STEP_SUMMARY` |

**How to trigger manually:**
1. Go to **Actions** → **CI/CD Pipeline** → **Run workflow**
2. Select environment, toggle debug mode, optionally set a version override

---

### `.github/workflows/reusable-deploy.yml` — Reusable Workflow

| Feature | Details |
|---------|---------|
| **`on: workflow_call`** | Makes the workflow callable from other workflows |
| **Typed inputs** | `environment` (string, required), `version` (string, required), `dry_run` (boolean) |
| **Secrets forwarding** | `DEPLOY_TOKEN` secret passed from caller |
| **Workflow outputs** | `deployment-url` and `deployment-status` returned to caller |
| **Dynamic environment** | Uses `${{ inputs.environment }}` as the environment name |

**How to call from another workflow:**
```yaml
jobs:
  call-deploy:
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: staging
      version: "1.2.3"
    secrets:
      DEPLOY_TOKEN: ${{ secrets.MY_DEPLOY_TOKEN }}
```

---

### `.github/workflows/scheduled-maintenance.yml` — Scheduled & Event-Driven

| Feature | Details |
|---------|---------|
| **`schedule`** | Cron trigger: every Sunday at 02:00 UTC |
| **`repository_dispatch`** | Custom event types: `maintenance`, `cleanup`, `health-check` |
| **Conditional logic** | `case` statement on `github.event_name` to determine task |
| **`gh` CLI** | Creates a GitHub Issue automatically when maintenance fails |
| **Retry pattern** | Three-attempt health check with `continue-on-error` |
| **Timeout** | `timeout-minutes: 15` on the maintenance job |

**How to trigger via `repository_dispatch`:**
```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/dispatches \
  -d '{"event_type":"maintenance","client_payload":{"task":"cleanup"}}'
```

---

### `.github/actions/setup-project/action.yml` — Composite Action

| Feature | Details |
|---------|---------|
| **`using: composite`** | Bundles multiple steps into a single reusable action |
| **Inputs** | `node-version`, `install-deps`, `cache-key-prefix` |
| **Outputs** | `node-version-used`, `cache-hit` |
| **Steps** | Checkout, `actions/setup-node@v4`, `actions/cache@v4`, `npm ci`, environment info print |

---

### `.github/workflows/release.yml` — Release Workflow

| Feature | Details |
|---------|---------|
| **Tag trigger** | `on: push: tags: ["v*"]` |
| **Build & package** | Runs tests, builds, creates a `.tar.gz` asset |
| **Artifact upload** | Build asset uploaded with `actions/upload-artifact@v4` |
| **GitHub Release** | Created with `gh release create` using `GITHUB_TOKEN` |
| **Changelog** | Auto-generated from git commit history |
| **Pre-release detection** | Tags with `alpha`/`beta`/`rc` are marked as pre-releases |

**How to trigger:**
```bash
git tag v1.2.3
git push origin v1.2.3
```

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run the server
npm start

# Run tests
npm test

# Run linter
npm run lint

# Build
npm run build
```

---

## ⚙️ Required Repository Setup

To fully use the deployment features, configure the following in **Settings → Environments**:

| Environment | Purpose | Recommended Protection |
|------------|---------|----------------------|
| `staging` | Staging deployments | Branch policy: `main` only |
| `production` | Production deployments | Required reviewers + branch policy |

---

## 📚 GitHub Actions Concepts Quick Reference

| Concept | Where Used |
|---------|------------|
| `on: push/pull_request` | `ci-cd-pipeline.yml` |
| `on: workflow_dispatch` with inputs | `ci-cd-pipeline.yml`, `release.yml` |
| `on: schedule` (cron) | `scheduled-maintenance.yml` |
| `on: repository_dispatch` | `scheduled-maintenance.yml` |
| `on: workflow_call` (reusable) | `reusable-deploy.yml` |
| `on: push: tags:` | `release.yml` |
| Matrix strategy | `ci-cd-pipeline.yml` → `test` job |
| Job dependencies (`needs:`) | All multi-job workflows |
| Job outputs | `ci-cd-pipeline.yml` → `build` job |
| Caching (`actions/cache@v4`) | `ci-cd-pipeline.yml`, composite action |
| Artifacts | `ci-cd-pipeline.yml`, `release.yml` |
| Container jobs | `ci-cd-pipeline.yml` → `security-scan` |
| Service containers | `ci-cd-pipeline.yml` → `security-scan` (Redis) |
| Environments | `ci-cd-pipeline.yml`, `reusable-deploy.yml` |
| Concurrency | `ci-cd-pipeline.yml` |
| `continue-on-error` | Multiple workflows |
| `timeout-minutes` | `ci-cd-pipeline.yml`, `scheduled-maintenance.yml` |
| `permissions` | All workflows |
| Composite actions | `.github/actions/setup-project` |
| `gh` CLI | `scheduled-maintenance.yml`, `release.yml` |
| `$GITHUB_OUTPUT` | Step & job outputs everywhere |
| `$GITHUB_STEP_SUMMARY` | `ci-cd-pipeline.yml`, `release.yml` |

---

&copy; 2024 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)
