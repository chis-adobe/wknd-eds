# GitHub Actions Workflows

## Update Component Library
**File:** `update-component-library.yml`

Updates `@ac-comp-lib/component-library` to the latest version and creates a PR when changes are found.

**Triggers:**
- **Schedule:** Daily at 9:00 AM UTC
- **Manual:** Actions tab → "Update Component Library" → "Run workflow"

**Use when:** The component library has published a new version but this project hasn't changed. Run manually or wait for the daily schedule to pick it up.

---

## Template Sync Workflows

This repository includes **two workflows** for syncing with the main template repository (`AEMXSC/RefDemoEDS`):

## 🔄 Workflow 1: Sync with Template (Create PR for Review)
**File:** `sync-template-using-pr.yml`

Creates a **Pull Request** with template changes for review before merging.

**Use when:**
- You want to review changes before they go live
- You've made custom modifications to files
- You need time to test the updates
- You want team review before merging

## ⚡ Workflow 2: Sync with Template (Direct Merge - No Review)
**File:** `sync-template-direct.yml`

**Directly merges** template changes to main branch without creating a PR.

**Smart Fallback:** If conflicts are detected, automatically creates a PR instead of failing.

**Use when:**
- You trust the template updates completely
- You want quick syncing without PR overhead
- Your repository has minimal customizations
- You need faster updates without review process

**✨ Best of Both Worlds:** Tries direct merge first, falls back to PR if needed.

---

## 📊 Workflow Comparison

| Feature | PR-based Workflow | Direct Merge Workflow |
|---------|-------------------|----------------------|
| **Review before merge** | ✅ Yes (via PR) | ❌ No (auto-merges) |
| **Conflict handling** | ✅ Creates PR with conflicts | ✅ Auto-fallback to PR |
| **Trigger** | Manual only | Manual only |
| **Speed** | Slower (needs PR review) | ⚡ Instant (if no conflicts) |
| **Safety** | 🛡️ High | 🛡️ High (with fallback) |
| **Best for** | Production repos | Production & Dev repos |
| **Workflow outcome** | Always creates PR | Direct merge OR PR (if conflicts) |
| **GitHub permissions** | Needs PR permission | Needs PR permission |

---

## Setup Instructions

### 1. Template Repository Configuration

This workflow is pre-configured to sync with the main template repository:

```yaml
git remote add template https://github.com/AEMXSC/RefDemoEDS.git
```

If you created this repository using "Use this template" from `AEMXSC/RefDemoEDS`, no configuration changes are needed.

### 2. Enable GitHub Actions Permissions

**⚠️ IMPORTANT**: You must enable PR creation for GitHub Actions in your repository settings:

1. Go to your repository **Settings**
2. Navigate to **Actions** → **General** (in the left sidebar)
3. Scroll down to **"Workflow permissions"**
4. Select **"Read and write permissions"**
5. ✅ **Check** "Allow GitHub Actions to create and approve pull requests"
6. Click **"Save"**

Without this setting, you'll get an error: `GitHub Actions is not permitted to create or approve pull requests`

### 3. Required Permissions

The workflow requires the following permissions (already configured in the workflow file):
- `contents: write` - To create branches and push changes
- `pull-requests: write` - To create pull requests

### 4. Repository Settings

Make sure your repository has the following settings:
- GitHub Actions are enabled
- The default branch is `main` (or update the workflow to match your default branch)

## How It Works

1. **Manual Trigger**: Trigger the workflow manually from the "Actions" tab in your repository
2. **Update Check**: It fetches the latest changes from the template repository (`AEMXSC/RefDemoEDS`)
3. **Smart Sync**: Only creates a pull request if there are actual updates
4. **Smart Merge Strategy**: Uses `-X theirs` to prefer template changes, avoiding false conflicts
5. **File Protection**: Preserves your custom files (`paths.json`, `fstab.yaml`, `.github/workflows`) during sync
6. **Pull Request**: Creates a PR with all the template changes for review and merging

### Understanding the Merge Strategy

When you create a repository using "Use this template", GitHub creates a **new repository with no shared git history** with the template. This means:

- Template repo: Has commits A → B → C → D
- Your repo: Has a single initial commit X with all files

When syncing, git sees these as **unrelated histories**. The workflow handles this by:

1. Using `--allow-unrelated-histories` to allow the merge
2. Using `-X theirs` (merge strategy) to automatically prefer template changes
3. This prevents false conflicts when your repo hasn't modified files
4. Protected files (`paths.json`, `fstab.yaml`, `.github/workflows`) are still preserved via backup/restore

## Workflow Features

- ✅ **Automatic Detection**: Only runs when there are actual updates
- ✅ **Pull Request Creation**: Creates PRs for easy review and merging
- ✅ **Conflict Handling**: Gracefully handles merge conflicts with clear instructions
- ✅ **File Protection**: Preserves specified custom files during sync
- ✅ **Detailed Information**: Includes commit hashes and sync timestamps
- ✅ **Manual Override**: Can be triggered manually when needed
- ✅ **Safe Merging**: Uses `--allow-unrelated-histories` for initial syncs

## Customization Options

### Add Automatic Schedule (Optional)
By default, the workflow runs manually. To add automatic syncing, add a schedule trigger:

```yaml
on:
  workflow_dispatch: # Manual triggering
  schedule:
    - cron: '0 12 * * *'  # 12:00 PM UTC daily
    # - cron: '0 9 * * 1'   # 9:00 AM UTC every Monday
    # - cron: '0 0 1 * *'   # Midnight UTC on the 1st of every month
```

### Change Branch Names
To use a different base branch, update the workflow:

```yaml
git checkout -b "$BRANCH_NAME"
git merge template/develop --no-edit --allow-unrelated-histories  # Change 'main' to 'develop'
```

### Add More Files to Ignore During Sync
To preserve additional custom files during sync, update the `IGNORE_FILES` array in the workflow:

```yaml
IGNORE_FILES=(
  "paths.json"
  "fstab.yaml"
  ".github/workflows"
)
```

### Add Custom Logic
You can add additional steps before or after the sync:

```yaml
- name: Run tests
  run: npm test

- name: Build project
  run: npm run build
```

## Troubleshooting

### Permission Issues
If you encounter permission errors:
1. Check that the repository has Actions enabled
2. Verify the `GITHUB_TOKEN` has the required permissions
3. Ensure the template repository is public or accessible

### Merge Conflicts

The workflow uses smart merge strategies to minimize conflicts, but they can still occur in these scenarios:

**When conflicts happen:**
- You've modified the same lines in the same files as the template updates
- Binary files have changed in both repositories
- Files were moved/renamed in different ways

**What the workflow does:**
1. ✅ The workflow detects conflicts during merge
2. ✅ Creates a PR with the conflict markers
3. ✅ Labels the PR title with "⚠️ HAS CONFLICTS"
4. ✅ Provides instructions in the PR description

**How to resolve:**
1. Open the PR created by the workflow
2. Click the "Resolve conflicts" button in GitHub UI
3. Edit the files to choose which changes to keep
4. Mark each file as resolved
5. Commit the resolution
6. Review and merge the PR

**Alternative (Command Line):**
```bash
# Checkout the sync branch
git checkout sync-template-YYYYMMDD-HHMMSS

# View conflicted files
git status

# Edit conflicted files manually
# Look for <<<<<<< HEAD, =======, >>>>>>> markers

# After resolving, add and commit
git add .
git commit -m "Resolve merge conflicts"
git push

# Then merge the PR in GitHub
```

### Template Repository Not Found
Make sure:
1. The template repository URL is correct
2. The repository exists and is accessible
3. The branch name matches (default is `main`)

## Security Notes

- The workflow uses the default `GITHUB_TOKEN` which is automatically provided
- No additional secrets are required for public template repositories
- For private template repositories, you may need to configure additional authentication