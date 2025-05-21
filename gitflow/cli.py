#!/usr/bin/env python3
"""
GitFlow CLI - A simple and powerful GitHub CLI helper tool.
"""

import sys
import argparse
from .commands import (
    init_repository,
    add_files,
    commit_changes,
    push_to_remote,
    pull_from_remote,
    create_branch,
    checkout_branch,
    merge_branch,
    display_status,
    display_log,
    clone_repository,
    show_menu
)

def main():
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(
        description="GitFlow - A simple and powerful GitHub CLI helper tool"
    )
    
    # Add subparsers for different commands
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Initialize repository
    init_parser = subparsers.add_parser("init", help="Initialize a git repository")
    
    # Add files
    add_parser = subparsers.add_parser("add", help="Add files to staging area")
    add_parser.add_argument("files", nargs="*", default=["."], help="Files to add (defaults to all)")
    
    # Commit changes
    commit_parser = subparsers.add_parser("commit", help="Commit staged changes")
    commit_parser.add_argument("-m", "--message", help="Commit message")
    
    # Push changes
    push_parser = subparsers.add_parser("push", help="Push commits to remote repository")
    push_parser.add_argument("--branch", help="Branch to push (defaults to current branch)")
    
    # Quick push (add, commit, push)
    quickpush_parser = subparsers.add_parser("quickpush", help="Add all files, commit, and push")
    quickpush_parser.add_argument("-m", "--message", help="Commit message")
    
    # Pull changes
    pull_parser = subparsers.add_parser("pull", help="Pull changes from remote repository")
    
    # Create branch
    branch_parser = subparsers.add_parser("branch", help="Create a new branch")
    branch_parser.add_argument("name", help="Name of the branch")
    
    # Checkout branch
    checkout_parser = subparsers.add_parser("checkout", help="Checkout a branch")
    checkout_parser.add_argument("branch", help="Branch to checkout")
    
    # Merge branch
    merge_parser = subparsers.add_parser("merge", help="Merge a branch into the current branch")
    merge_parser.add_argument("branch", help="Branch to merge")
    
    # Status
    subparsers.add_parser("status", help="Show repository status")
    
    # Log
    log_parser = subparsers.add_parser("log", help="Display commit history")
    log_parser.add_argument("-n", type=int, default=5, help="Number of commits to display")
    
    # Clone repository
    clone_parser = subparsers.add_parser("clone", help="Clone a repository")
    clone_parser.add_argument("url", help="URL of the repository to clone")
    clone_parser.add_argument("--directory", help="Directory to clone into")
    
    # Parse arguments
    args = parser.parse_args()
    
    # If no arguments provided, show menu
    if len(sys.argv) == 1 or args.command is None:
        show_menu()
        return

    # Execute command based on argument
    if args.command == "init":
        init_repository()
    elif args.command == "add":
        add_files(args.files)
    elif args.command == "commit":
        commit_changes(args.message)
    elif args.command == "push":
        push_to_remote(args.branch)
    elif args.command == "quickpush":
        add_files(["."])
        commit_changes(args.message)
        push_to_remote(None)
    elif args.command == "pull":
        pull_from_remote()
    elif args.command == "branch":
        create_branch(args.name)
    elif args.command == "checkout":
        checkout_branch(args.branch)
    elif args.command == "merge":
        merge_branch(args.branch)
    elif args.command == "status":
        display_status()
    elif args.command == "log":
        display_log(args.n)
    elif args.command == "clone":
        clone_repository(args.url, args.directory)


if __name__ == "__main__":
    main()
