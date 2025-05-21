#!/usr/bin/env python3
"""
GitFlow Commands - Implementation of Git operations.
"""

import os
import sys
import subprocess
import inquirer
from colorama import init, Fore, Style

# Initialize colorama
init(autoreset=True)

def run_command(command, capture_output=True):
    """Run a shell command and handle errors."""
    try:
        result = subprocess.run(
            command,
            capture_output=capture_output,
            text=True,
            check=True,
            shell=True
        )
        return result.stdout.strip() if capture_output else None
    except subprocess.CalledProcessError as e:
        print(f"{Fore.RED}Error: {e.stderr}{Style.RESET_ALL}")
        return None

def is_git_repository():
    """Check if current directory is a git repository."""
    return run_command("git rev-parse --is-inside-work-tree 2>/dev/null") is not None

def init_repository():
    """Initialize a new git repository."""
    if is_git_repository():
        print(f"{Fore.YELLOW}Repository already initialized.{Style.RESET_ALL}")
        return
    
    print(f"{Fore.CYAN}Initializing git repository...{Style.RESET_ALL}")
    run_command("git init", capture_output=False)
    print(f"{Fore.GREEN}Git repository initialized successfully!{Style.RESET_ALL}")
    
    # Ask if user wants to add remote repository
    questions = [
        inquirer.Confirm('add_remote', message="Do you want to add a remote repository?", default=False),
    ]
    answers = inquirer.prompt(questions)
    
    if answers and answers['add_remote']:
        remote_url = input(f"{Fore.CYAN}Enter remote repository URL: {Style.RESET_ALL}")
        run_command(f"git remote add origin {remote_url}", capture_output=False)
        print(f"{Fore.GREEN}Remote repository added successfully!{Style.RESET_ALL}")

def add_files(files):
    """Add files to the staging area."""
    if not is_git_repository():
        print(f"{Fore.RED}Not a git repository. Initialize with 'gitflow init'.{Style.RESET_ALL}")
        return
    
    for file in files:
        print(f"{Fore.CYAN}Adding {file} to staging area...{Style.RESET_ALL}")
        run_command(f"git add {file}", capture_output=False)
    
    print(f"{Fore.GREEN}Files added to staging area.{Style.RESET_ALL}")

def commit_changes(message=None):
    """Commit staged changes."""
    if not is_git_repository():
        print(f"{Fore.RED}Not a git repository. Initialize with 'gitflow init'.{Style.RESET_ALL}")
        return
    
    # Get commit message if not provided
    if not message:
        message = input(f"{Fore.CYAN}Enter commit message: {Style.RESET_ALL}")
    
    print(f"{Fore.CYAN}Committing changes...{Style.RESET_ALL}")
    run_command(f'git commit -m "{message}"', capture_output=False)
    print(f"{Fore.GREEN}Changes committed successfully!{Style.RESET_ALL}")

def push_to_remote(branch=None):
    """Push commits to remote repository."""
    if not is_git_repository():
        print(f"{Fore.RED}Not a git repository. Initialize with 'gitflow init'.{Style.RESET_ALL}")
        return
    
    # Check if remote repository exists
    if not run_command("git remote"):
        print(f"{Fore.YELLOW}No remote repository configured.{Style.RESET_ALL}")
        remote_url = input(f"{Fore.CYAN}Enter remote repository URL: {Style.RESET_ALL}")
        run_command(f"git remote add origin {remote_url}", capture_output=False)
    
    # Get current branch if branch not specified
    if not branch:
        branch = run_command("git rev-parse --abbrev-ref HEAD")
    
    print(f"{Fore.CYAN}Pushing to remote repository...{Style.RESET_ALL}")
    result = run_command(f"git push -u origin {branch}", capture_output=False)
    if result is not None:
        print(f"{Fore.GREEN}Changes pushed to remote repository.{Style.RESET_ALL}")

def pull_from_remote():
    """Pull changes from remote repository."""
    if not is_git_repository():
        print(f"{Fore.RED}Not a git repository. Initialize with 'gitflow init'.{Style.RESET_ALL}")
        return
    
    print(f"{Fore.CYAN}Pulling from remote repository...{Style.RESET_ALL}")
    run_command("git pull", capture_output=False)
    print(f"{Fore.GREEN}Changes pulled from remote repository.{Style.RESET_ALL}")

def create_branch(name):
    """Create a new branch."""
    if not is_git_repository():
        print(f"{Fore.RED}Not a git repository. Initialize with 'gitflow init'.{Style.RESET_ALL}")
        return
    
    print(f"{Fore.CYAN}Creating branch '{name}'...{Style.RESET_ALL}")
    run_command(f"git branch {name}", capture_output=False)
    
    # Ask if user wants to checkout the new branch
    questions = [
        inquirer.Confirm('checkout', message=f"Do you want to checkout branch '{name}'?", default=True),
    ]
    answers = inquirer.prompt(questions)
    
    if answers and answers['checkout']:
        checkout_branch(name)
    else:
        print(f"{Fore.GREEN}Branch '{name}' created successfully!{Style.RESET_ALL}")

def checkout_branch(branch):
    """Checkout a branch."""
    if not is_git_repository():
        print(f"{Fore.RED}Not a git repository. Initialize with 'gitflow init'.{Style.RESET_ALL}")
        return
    
    print(f"{Fore.CYAN}Checking out branch '{branch}'...{Style.RESET_ALL}")
    run_command(f"git checkout {branch}", capture_output=False)
    print(f"{Fore.GREEN}Switched to branch '{branch}'.{Style.RESET_ALL}")

def merge_branch(branch):
    """Merge a branch into the current branch."""
    if not is_git_repository():
        print(f"{Fore.RED}Not a git repository. Initialize with 'gitflow init'.{Style.RESET_ALL}")
        return
    
    current_branch = run_command("git rev-parse --abbrev-ref HEAD")
    print(f"{Fore.CYAN}Merging branch '{branch}' into '{current_branch}'...{Style.RESET_ALL}")
    run_command(f"git merge {branch}", capture_output=False)
    print(f"{Fore.GREEN}Branch '{branch}' merged into '{current_branch}'.{Style.RESET_ALL}")

def display_status():
    """Display git status."""
    if not is_git_repository():
        print(f"{Fore.RED}Not a git repository. Initialize with 'gitflow init'.{Style.RESET_ALL}")
        return
    
    print(f"{Fore.CYAN}Git Status:{Style.RESET_ALL}")
    run_command("git status", capture_output=False)

def display_log(num_commits=5):
    """Display git commit history."""
    if not is_git_repository():
        print(f"{Fore.RED}Not a git repository. Initialize with 'gitflow init'.{Style.RESET_ALL}")
        return
    
    print(f"{Fore.CYAN}Git Commit History (last {num_commits} commits):{Style.RESET_ALL}")
    run_command(f"git log --oneline --graph --decorate -n {num_commits}", capture_output=False)

def clone_repository(url, directory=None):
    """Clone a remote repository."""
    clone_cmd = f"git clone {url}"
    if directory:
        clone_cmd += f" {directory}"
    
    print(f"{Fore.CYAN}Cloning repository from {url}...{Style.RESET_ALL}")
    run_command(clone_cmd, capture_output=False)
    print(f"{Fore.GREEN}Repository cloned successfully!{Style.RESET_ALL}")

def show_menu():
    """Display interactive menu for Git operations."""
    # Check if git is installed
    if run_command("git --version") is None:
        print(f"{Fore.RED}Error: Git is not installed or not in PATH.{Style.RESET_ALL}")
        sys.exit(1)
    
    # Get current repository status
    is_repo = is_git_repository()
    repo_status = None
    if is_repo:
        current_branch = run_command("git rev-parse --abbrev-ref HEAD")
        repo_status = f"Current branch: {current_branch}"

    # Display welcome message
    print(f"\n{Fore.CYAN}========================================{Style.RESET_ALL}")
    print(f"{Fore.CYAN}========== GitFlow CLI Tool ============{Style.RESET_ALL}")
    print(f"{Fore.CYAN}========================================{Style.RESET_ALL}")
    if repo_status:
        print(f"{Fore.GREEN}{repo_status}{Style.RESET_ALL}")
    print()

    # Define available options
    options = [
        "Initialize Repository",
        "Clone Repository",
        "Add Files",
        "Commit Changes",
        "Push to Remote",
        "Quick Push (Add, Commit, Push)",
        "Pull from Remote",
        "Create Branch",
        "Checkout Branch",
        "Merge Branch",
        "View Status",
        "View Commit History",
        "Exit"
    ]
    
    # Filter options based on repository status
    if not is_repo:
        options = [option for option in options if option in [
            "Initialize Repository", 
            "Clone Repository", 
            "Exit"
        ]]
    
    # Prompt user for action
    questions = [
        inquirer.List(
            'action',
            message="Select an action",
            choices=options,
        ),
    ]
    
    answers = inquirer.prompt(questions)
    
    # Execute selected action
    if answers:
        if answers['action'] == "Initialize Repository":
            init_repository()
        elif answers['action'] == "Clone Repository":
            url = input(f"{Fore.CYAN}Enter repository URL: {Style.RESET_ALL}")
            directory = input(f"{Fore.CYAN}Enter directory (leave empty for default): {Style.RESET_ALL}")
            clone_repository(url, directory if directory else None)
        elif answers['action'] == "Add Files":
            files = input(f"{Fore.CYAN}Enter files to add (space-separated, '.' for all): {Style.RESET_ALL}")
            add_files(files.split() if files else ["."])
        elif answers['action'] == "Commit Changes":
            message = input(f"{Fore.CYAN}Enter commit message: {Style.RESET_ALL}")
            commit_changes(message)
        elif answers['action'] == "Push to Remote":
            branch = input(f"{Fore.CYAN}Enter branch name (leave empty for current branch): {Style.RESET_ALL}")
            push_to_remote(branch if branch else None)
        elif answers['action'] == "Quick Push (Add, Commit, Push)":
            add_files(["."])
            message = input(f"{Fore.CYAN}Enter commit message: {Style.RESET_ALL}")
            commit_changes(message)
            push_to_remote(None)
        elif answers['action'] == "Pull from Remote":
            pull_from_remote()
        elif answers['action'] == "Create Branch":
            name = input(f"{Fore.CYAN}Enter branch name: {Style.RESET_ALL}")
            create_branch(name)
        elif answers['action'] == "Checkout Branch":
            branches = run_command("git branch").replace("*", "").split()
            questions = [
                inquirer.List(
                    'branch',
                    message="Select branch to checkout",
                    choices=branches,
                ),
            ]
            branch_answer = inquirer.prompt(questions)
            if branch_answer:
                checkout_branch(branch_answer['branch'])
        elif answers['action'] == "Merge Branch":
            branches = run_command("git branch").replace("*", "").split()
            questions = [
                inquirer.List(
                    'branch',
                    message="Select branch to merge",
                    choices=branches,
                ),
            ]
            branch_answer = inquirer.prompt(questions)
            if branch_answer:
                merge_branch(branch_answer['branch'])
        elif answers['action'] == "View Status":
            display_status()
        elif answers['action'] == "View Commit History":
            num = input(f"{Fore.CYAN}Enter number of commits to display (default 5): {Style.RESET_ALL}")
            display_log(int(num) if num else 5)
        elif answers['action'] == "Exit":
            print(f"{Fore.CYAN}Thank you for using GitFlow CLI Tool!{Style.RESET_ALL}")
            sys.exit(0)
        
        # After action completion, show menu again unless exiting
        if answers['action'] != "Exit":
            input(f"\n{Fore.YELLOW}Press Enter to continue...{Style.RESET_ALL}")
            show_menu()
