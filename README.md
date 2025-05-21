# GitFlow CLI Tool

GitFlow is a simple, powerful CLI tool that simplifies Git and GitHub workflows through an interactive menu-driven interface.

## Features

- Interactive menu-driven interface
- Automated Git workflows
- Simplified command structure
- Color-coded output for better readability
- Quick shortcuts for common operations

## Installation

You can install GitFlow using pip:

```bash
pip install gitflow-cli
```

## Usage

### Menu-driven Interface

Simply run `gitflow` without any arguments to launch the interactive menu:

```bash
gitflow
```

### Command-line Interface

GitFlow supports both interactive and command-line modes:

#### Initialize a Repository
```bash
gitflow init
```

#### Quick Push (Add, Commit, Push in one command)
```bash
gitflow quickpush -m "Your commit message"
```

#### Add Files
```bash
gitflow add file1.py file2.py
# Or add all files
gitflow add .
```

#### Commit Changes
```bash
gitflow commit -m "Your commit message"
```

#### Push to Remote
```bash
gitflow push
```

#### Pull from Remote
```bash
gitflow pull
```

#### Branch Operations
```bash
# Create a new branch
gitflow branch new-feature

# Checkout a branch
gitflow checkout branch-name

# Merge a branch into current branch
gitflow merge branch-name
```

#### Repository Status
```bash
gitflow status
```

#### View Commit History
```bash
gitflow log
# Show last 10 commits
gitflow log -n 10
```

#### Clone Repository
```bash
gitflow clone https://github.com/username/repo.git
```

## Development

### Setting up Development Environment

1. Clone the repository
```bash
git clone https://github.com/yourusername/gitflow.git
cd gitflow
```

2. Install development dependencies
```bash
pip install -e .
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
