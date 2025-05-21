# Usage

## Menu-driven Interface

Simply run `gitflow` without any arguments to launch the interactive menu:

```bash
gitflow
```

## Command-line Interface

GitFlow supports both interactive and command-line modes:

### Initialize a Repository
```bash
gitflow init
```

### Quick Push (Add, Commit, Push in one command)
```bash
gitflow quickpush -m "Your commit message"
```

### Add Files
```bash
gitflow add file1.py file2.py
# Or add all files
gitflow add .
```

### Commit Changes
```bash
gitflow commit -m "Your commit message"
```

### Push to Remote
```bash
gitflow push
```

### Pull from Remote
```bash
gitflow pull
```

### Branch Operations
```bash
# Create a new branch
gitflow branch new-feature

# Checkout a branch
gitflow checkout branch-name

# Merge a branch into current branch
gitflow merge branch-name
```

### Repository Status
```bash
gitflow status
```

### View Commit History
```bash
gitflow log
# Show last 10 commits
gitflow log -n 10
```

### Clone Repository
```bash
gitflow clone https://github.com/username/repo.git
```
