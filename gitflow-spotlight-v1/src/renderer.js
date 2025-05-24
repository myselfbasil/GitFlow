// GitFlow Spotlight Renderer
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const commandsList = document.getElementById('commandsList');
    const statusIndicator = document.getElementById('statusIndicator');
    const currentBranchElement = document.getElementById('currentBranch');
    const remoteBadgeElement = document.getElementById('remoteBadge');
    const repoNameElement = document.getElementById('repoName');
    const currentDirectoryElement = document.getElementById('currentDirectory');
    const selectDirectoryBtn = document.getElementById('selectDirectoryBtn');
    const inputModal = document.getElementById('inputModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalInput = document.getElementById('modalInput');
    const remoteModal = document.getElementById('remoteModal');
    const remotesList = document.getElementById('remotesList');
    const remoteName = document.getElementById('remoteName');
    const remoteUrl = document.getElementById('remoteUrl');
    const addRemoteBtn = document.getElementById('addRemoteBtn');
    const closeRemoteModalBtn = document.getElementById('closeRemoteModalBtn');
    const notification = document.getElementById('notification');
    const notificationTitle = document.querySelector('.notification-title');
    const notificationMessage = document.querySelector('.notification-message');

    // State
    let commands = [];
    let filteredCommands = [];
    let selectedCommandIndex = 0;
    let currentOperation = null;
    let gitStatus = null;

    // Command definitions
    const gitCommands = [
        {
            id: 'init',
            title: 'Initialize Repository',
            description: 'Create a new Git repository in the current directory',
            icon: '🔰',
            shortcut: '1',
            requiresInput: false
        },
        {
            id: 'clone',
            title: 'Clone Repository',
            description: 'Clone a remote repository to your local machine',
            icon: '📥',
            shortcut: '2',
            requiresInput: true,
            inputTitle: 'Enter Repository URL'
        },
        {
            id: 'add',
            title: 'Add All Changes',
            description: 'Stage all changes for the next commit',
            icon: '➕',
            shortcut: '3',
            requiresInput: false
        },
        {
            id: 'commit',
            title: 'Commit Changes',
            description: 'Commit staged changes with a message',
            icon: '💾',
            shortcut: '4',
            requiresInput: true,
            inputTitle: 'Enter Commit Message'
        },
        {
            id: 'push',
            title: 'Push Changes',
            description: 'Push local commits to the remote repository',
            icon: '⬆️',
            shortcut: '5',
            requiresInput: false
        },
        {
            id: 'quickpush',
            title: 'Quick Push (Add + Commit + Push)',
            description: 'Stage all changes, commit, and push in one step',
            icon: '🚀',
            shortcut: 'q',
            requiresInput: true,
            inputTitle: 'Enter Commit Message'
        },
        {
            id: 'pull',
            title: 'Pull Changes',
            description: 'Pull latest changes from the remote repository',
            icon: '⬇️',
            shortcut: '6',
            requiresInput: false
        },
        {
            id: 'branch',
            title: 'Create Branch',
            description: 'Create a new branch from the current HEAD',
            icon: '🌿',
            shortcut: '7',
            requiresInput: true,
            inputTitle: 'Enter Branch Name'
        },
        {
            id: 'checkout',
            title: 'Checkout Branch',
            description: 'Switch to another branch',
            icon: '🔄',
            shortcut: '8',
            requiresInput: true,
            inputTitle: 'Enter Branch Name'
        },
        {
            id: 'merge',
            title: 'Merge Branch',
            description: 'Merge another branch into the current branch',
            icon: '🔀',
            shortcut: '9',
            requiresInput: true,
            inputTitle: 'Enter Branch Name to Merge'
        },
        {
            id: 'status',
            title: 'Git Status',
            description: 'Show the working tree status',
            icon: '📊',
            shortcut: 's',
            requiresInput: false
        },
        {
            id: 'log',
            title: 'Git Log',
            description: 'Show commit logs with graph',
            icon: '📜',
            shortcut: 'l',
            requiresInput: false
        },
        {
            id: 'select-directory',
            title: 'Select Directory',
            description: 'Choose a directory for Git operations',
            icon: '📁',
            shortcut: 'd',
            requiresInput: false
        },
        {
            id: 'manage-remotes',
            title: 'Manage Remotes',
            description: 'View, add, or remove Git remotes',
            icon: '🌐',
            shortcut: 'r',
            requiresInput: false
        }
    ];

    // Initialize
    function init() {
        commands = gitCommands;
        filteredCommands = [...commands];
        renderCommands();
        updateGitStatus();
        setupEventListeners();
    }

    // Event Listeners
    function setupEventListeners() {
        // Search input
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keydown', handleKeyNavigation);
        
        // Directory selection button
        selectDirectoryBtn.addEventListener('click', () => {
            window.electronAPI.selectDirectory().then(result => {
                if (result.success) {
                    showNotification('Directory Selected', `Working in: ${result.path}`);
                    updateGitStatus();
                }
            });
        });
        
        // Remote badge click to manage remotes
        remoteBadgeElement.addEventListener('click', showRemoteModal);
        
        // Add remote button
        addRemoteBtn.addEventListener('click', addRemote);
        
        // Close remote modal button
        closeRemoteModalBtn.addEventListener('click', closeRemoteModal);
        
        // Focus search input when window is shown
        window.electronAPI.onWindowShown(() => {
            searchInput.focus();
            updateGitStatus();
        });
        
        // Global key events
        document.addEventListener('keydown', (e) => {
            // Escape key to close window
            if (e.key === 'Escape') {
                if (remoteModal.classList.contains('visible')) {
                    closeRemoteModal();
                } else if (inputModal.classList.contains('visible')) {
                    closeModal();
                } else {
                    window.electronAPI.hideWindow();
                }
            }
            
            // Shortcut keys when not in input mode
            if (document.activeElement !== searchInput && 
                document.activeElement !== modalInput && 
                document.activeElement !== remoteName && 
                document.activeElement !== remoteUrl) {
                const command = commands.find(cmd => cmd.shortcut === e.key.toLowerCase());
                if (command) {
                    executeCommand(command);
                }
            }
        });
    }

    // Handle search input
    function handleSearchInput(e) {
        const query = e.target.value.toLowerCase();
        
        if (query === '') {
            filteredCommands = [...commands];
        } else {
            filteredCommands = commands.filter(command => 
                command.title.toLowerCase().includes(query) || 
                command.description.toLowerCase().includes(query)
            );
        }
        
        selectedCommandIndex = 0;
        renderCommands();
    }

    // Handle keyboard navigation
    function handleKeyNavigation(e) {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                selectedCommandIndex = Math.max(0, selectedCommandIndex - 1);
                renderCommands();
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                selectedCommandIndex = Math.min(filteredCommands.length - 1, selectedCommandIndex + 1);
                renderCommands();
                break;
                
            case 'Enter':
                e.preventDefault();
                if (filteredCommands[selectedCommandIndex]) {
                    executeCommand(filteredCommands[selectedCommandIndex]);
                }
                break;
        }
    }

    // Render command list
    function renderCommands() {
        commandsList.innerHTML = '';
        
        filteredCommands.forEach((command, index) => {
            const commandElement = document.createElement('div');
            commandElement.className = `command-item ${index === selectedCommandIndex ? 'selected' : ''}`;
            commandElement.innerHTML = `
                <div class="command-icon">${command.icon}</div>
                <div class="command-content">
                    <div class="command-title">${command.title}</div>
                    <div class="command-desc">${command.description}</div>
                </div>
                <div class="shortcut-key">${command.shortcut}</div>
            `;
            
            commandElement.addEventListener('click', () => {
                executeCommand(command);
            });
            
            commandsList.appendChild(commandElement);
        });
        
        // Scroll to selected command
        const selectedElement = commandsList.querySelector('.selected');
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'nearest' });
        }
    }

    // Execute command
    function executeCommand(command) {
        console.log("Executing command:", command.id);
        
        if (command.id === 'manage-remotes') {
            showRemoteModal();
            return;
        }
        
        if (command.requiresInput) {
            showInputModal(command);
        } else {
            performGitOperation(command.id);
        }
    }

    // Show input modal
    function showInputModal(command) {
        currentOperation = command.id;
        console.log("Setting current operation to:", currentOperation);
        modalTitle.textContent = command.inputTitle || 'Enter Input';
        modalInput.value = '';
        modalInput.placeholder = command.inputPlaceholder || 'Type here...';
        
        inputModal.classList.add('visible');
        setTimeout(() => modalInput.focus(), 100);
    }

    // Close modal
    window.closeModal = function() {
        inputModal.classList.remove('visible');
    };

    // Submit modal
    window.submitModal = function() {
        const input = modalInput.value.trim();
        
        if (input === '' && currentOperation !== 'select-directory') {
            modalInput.classList.add('error');
            setTimeout(() => modalInput.classList.remove('error'), 500);
            return;
        }
        
        console.log("Submitting modal with operation:", currentOperation, "and input:", input);
        
        if (!currentOperation) {
            showNotification('Error', 'Operation not specified', true);
            closeModal();
            return;
        }
        
        closeModal();
        performGitOperation(currentOperation, input);
        currentOperation = null; // Reset after use
    };

    // Show remote modal
    function showRemoteModal() {
        updateRemotesList();
        remoteModal.classList.add('visible');
    }

    // Close remote modal
    function closeRemoteModal() {
        remoteModal.classList.remove('visible');
        remoteName.value = '';
        remoteUrl.value = '';
    }

    // Update remotes list
    async function updateRemotesList() {
        try {
            const remotes = await window.electronAPI.getRemotes();
            remotesList.innerHTML = '';
            
            if (remotes.length === 0) {
                remotesList.innerHTML = '<div class="no-remotes">No remotes configured</div>';
                return;
            }
            
            remotes.forEach(remote => {
                const remoteElement = document.createElement('div');
                remoteElement.className = 'remote-item';
                remoteElement.innerHTML = `
                    <div class="remote-item-info">
                        <div class="remote-item-name">${remote.name}</div>
                        <div class="remote-item-url">${remote.url}</div>
                    </div>
                    <div class="remote-item-actions">
                        <button class="remote-action-btn delete" data-name="${remote.name}">Remove</button>
                    </div>
                `;
                
                remotesList.appendChild(remoteElement);
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.remote-action-btn.delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const remoteName = e.target.getAttribute('data-name');
                    removeRemote(remoteName);
                });
            });
        } catch (error) {
            console.error('Failed to update remotes list:', error);
            remotesList.innerHTML = '<div class="error">Failed to load remotes</div>';
        }
    }

    // Add remote
    async function addRemote() {
        const name = remoteName.value.trim();
        const url = remoteUrl.value.trim();
        
        if (!name || !url) {
            showNotification('Error', 'Remote name and URL are required', true);
            return;
        }
        
        try {
            const result = await window.electronAPI.addRemote(name, url);
            
            if (result.success) {
                showNotification('Success', `Remote '${name}' added`);
                remoteName.value = '';
                remoteUrl.value = '';
                updateRemotesList();
                updateGitStatus();
            } else {
                showNotification('Error', result.error || 'Failed to add remote', true);
            }
        } catch (error) {
            showNotification('Error', error.message || 'An unexpected error occurred', true);
        }
    }

    // Remove remote
    async function removeRemote(name) {
        try {
            const result = await window.electronAPI.removeRemote(name);
            
            if (result.success) {
                showNotification('Success', `Remote '${name}' removed`);
                updateRemotesList();
                updateGitStatus();
            } else {
                showNotification('Error', result.error || 'Failed to remove remote', true);
            }
        } catch (error) {
            showNotification('Error', error.message || 'An unexpected error occurred', true);
        }
    }

    // Perform Git operation
    async function performGitOperation(operation, input = '') {
        statusIndicator.textContent = '● Processing...';
        
        try {
            console.log("Performing Git operation:", operation, "with input:", input);
            
            if (!operation) {
                throw new Error("Operation not specified");
            }
            
            let result;
            
            if (operation === 'select-directory') {
                result = await window.electronAPI.selectDirectory();
                if (result.success) {
                    showNotification('Directory Selected', `Working in: ${result.path}`);
                    updateGitStatus();
                }
                return;
            }
            
            result = await window.electronAPI.executeGitOperation(operation, input);
            
            if (result.success) {
                showNotification('Success', `${getOperationName(operation)} completed`);
                updateGitStatus();
            } else {
                showNotification('Error', result.error || 'Operation failed', true);
            }
        } catch (error) {
            console.error("Error performing Git operation:", error);
            showNotification('Error', error.message || 'An unexpected error occurred', true);
        } finally {
            statusIndicator.textContent = '● Git Ready';
        }
    }

    // Get operation name for notifications
    function getOperationName(operation) {
        const command = commands.find(cmd => cmd.id === operation);
        return command ? command.title : 'Operation';
    }

    // Show notification
    function showNotification(title, message, isError = false) {
        notificationTitle.textContent = title;
        notificationMessage.textContent = message;
        
        if (isError) {
            notification.classList.add('error');
        } else {
            notification.classList.remove('error');
        }
        
        notification.classList.add('visible');
        
        setTimeout(() => {
            notification.classList.remove('visible');
        }, 3000);
    }

    // Update Git status
    async function updateGitStatus() {
        try {
            gitStatus = await window.electronAPI.getGitStatus();
            
            // Update current directory
            currentDirectoryElement.textContent = `Current directory: ${gitStatus.currentDirectory || '/'}`;
            
            if (gitStatus.isRepo) {
                // Update repo name
                repoNameElement.textContent = gitStatus.repoName || 'Unknown Repository';
                
                // Update branch info
                currentBranchElement.textContent = `Branch: ${gitStatus.branch}`;
                
                // Update remote badge
                if (gitStatus.remotes && gitStatus.remotes.length > 0) {
                    remoteBadgeElement.textContent = `${gitStatus.remotes.length} Remote(s)`;
                    remoteBadgeElement.classList.add('has-remotes');
                } else {
                    remoteBadgeElement.textContent = 'No Remote';
                    remoteBadgeElement.classList.remove('has-remotes');
                }
                
                // Update status indicator
                if (gitStatus.hasChanges) {
                    statusIndicator.textContent = '● Changes Detected';
                    statusIndicator.classList.add('pulse');
                } else {
                    statusIndicator.textContent = '● Git Ready';
                    statusIndicator.classList.remove('pulse');
                }
            } else {
                repoNameElement.textContent = 'No repository selected';
                currentBranchElement.textContent = 'Not a Git repository';
                remoteBadgeElement.textContent = 'No Remote';
                remoteBadgeElement.classList.remove('has-remotes');
                statusIndicator.textContent = '● Not a Git Repository';
                statusIndicator.classList.remove('pulse');
            }
        } catch (error) {
            console.error('Failed to update Git status:', error);
        }
    }

    // Initialize the app
    init();
});
