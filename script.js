document.addEventListener('DOMContentLoaded', () => {
    initResizers();
    renderExplorer();
    initMonaco();
    initActivityBar();
    initTerminal();
    initKeyboardShortcuts();
    initContextMenu();
    initDropdowns();
    initThemePicker();
});

let editor;
let isMonacoReady = false;

function initMonaco() {
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }});
    require(['vs/editor/editor.main'], function() {
        
        // Register HTML snippets for auto-closing tags
        monaco.languages.registerCompletionItemProvider('html', {
            provideCompletionItems: function(model, position) {
                const suggestions = [
                    { label: '!', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>${1:Document}</title>\n</head>\n<body>\n\t$2\n</body>\n</html>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'HTML5 Boilerplate' },
                    { label: 'h1', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<h1>$1</h1>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Heading 1' },
                    { label: 'color', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'color: ${1:red};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Color Property' },
                    { label: 'h2', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<h2>$1</h2>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Heading 2' },
                    { label: 'h3', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<h3>$1</h3>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Heading 3' },
                    { label: 'p', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<p>$1</p>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Paragraph' },
                    { label: 'div', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<div>$1</div>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Division' },
                    { label: 'span', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<span>$1</span>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Span' },
                    { label: 'a', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<a href="$1">$2</a>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Anchor' },
                    { label: 'img', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<img src="$1" alt="$2">', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Image' },
                    { label: 'ul', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<ul>\n\t<li>$1</li>\n</ul>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Unordered List' },
                    { label: 'li', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<li>$1</li>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'List Item' },
                    { label: 'button', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<button>$1</button>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Button' },
                    { label: 'input', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<input type="${1:text}" placeholder="$2">', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Input' },
                    { label: 'style', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<style>\n\t$1\n</style>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Style Tag' },
                    { label: 'script', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '<script>\n\t$1\n</script>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Script Tag' }
                ];
                return { suggestions: suggestions };
            }
        });

        editor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
            value: '',
            language: 'html',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            fontFamily: 'Fira Code, monospace',
            minimap: { enabled: true },
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: true,
            cursorStyle: 'line',
            padding: { top: 15, bottom: 15 },
            autoClosingTags: true,
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            formatOnType: true,
            formatOnPaste: true
        });

        isMonacoReady = true;
        initEditorSync(); 
        
        if (activeTabId) {
            renderEditor();
        }
    });
}

// --- File System State ---
const fileSystem = {
    id: "root",
    name: "Vs replica project",
    type: "folder",
    expanded: true,
    children: [
        {
            id: "vscode",
            name: ".vscode",
            type: "folder",
            expanded: false,
            children: []
        },
        { id: "1", name: "index.html", type: "file", language: "html", content: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Clone</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>" },
        { id: "3", name: "script.js", type: "file", language: "javascript", content: "console.log('Welcome to JS');\n\nfunction init() {\n  // do something\n}" },
        { id: "2", name: "style.css", type: "file", language: "css", content: "body {\n  background-color: #1e1e1e;\n  color: #d4d4d4;\n}" }
    ]
};

let openTabs = [];
let activeTabId = null;

// --- Resizers ---
function initResizers() {
    const sidebar = document.getElementById('sidebar');
    const sidebarResizer = document.getElementById('sidebar-resizer');
    const bottomPanel = document.getElementById('bottom-panel');
    const panelResizer = document.getElementById('panel-resizer');
    
    let isResizingSidebar = false;
    let isResizingPanel = false;

    sidebarResizer.addEventListener('mousedown', (e) => {
        isResizingSidebar = true;
        sidebarResizer.classList.add('active');
        document.body.style.cursor = 'ew-resize';
        e.preventDefault();
    });

    panelResizer.addEventListener('mousedown', (e) => {
        isResizingPanel = true;
        panelResizer.classList.add('active');
        document.body.style.cursor = 'ns-resize';
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (isResizingSidebar) {
            const newWidth = e.clientX - 48; // 48px is the activity bar width
            if (newWidth > 150 && newWidth < 600) {
                sidebar.style.width = newWidth + 'px';
            }
        } else if (isResizingPanel) {
            const bottomOffset = window.innerHeight - e.clientY - 22; // 22px is the status bar
            if (bottomOffset > 100 && bottomOffset < window.innerHeight - 200) {
                bottomPanel.style.height = bottomOffset + 'px';
            }
        }
    });

    window.addEventListener('mouseup', () => {
        if (isResizingSidebar) {
            isResizingSidebar = false;
            sidebarResizer.classList.remove('active');
            document.body.style.cursor = 'default';
        }
        if (isResizingPanel) {
            isResizingPanel = false;
            panelResizer.classList.remove('active');
            document.body.style.cursor = 'default';
        }
    });
}

// --- Explorer Rendering ---
function renderExplorer() {
    const sidebarContent = document.getElementById('sidebar-content');
    sidebarContent.innerHTML = ''; 
    const rootEl = createTreeNode(fileSystem, 0);
    sidebarContent.appendChild(rootEl);
}

function createTreeNode(node, depth) {
    const el = document.createElement('div');
    el.className = 'tree-node';
    
    const nodeRow = document.createElement('div');
    nodeRow.className = 'tree-node-row';
    nodeRow.style.paddingLeft = (depth * 15 + 10) + 'px';
    
    const iconEl = document.createElement('i');
    if (node.type === 'folder') {
        iconEl.className = node.expanded ? 'fa-solid fa-chevron-down folder-icon' : 'fa-solid fa-chevron-right folder-icon';
        iconEl.style.marginRight = '5px';
        iconEl.style.width = '12px';
    } else {
        if (node.name.endsWith('.html')) iconEl.className = 'fa-brands fa-html5 file-icon html-icon';
        else if (node.name.endsWith('.css')) iconEl.className = 'fa-brands fa-css3-alt file-icon css-icon';
        else if (node.name.endsWith('.js')) iconEl.className = 'fa-brands fa-js file-icon js-icon';
        else if (node.name.endsWith('.dart')) iconEl.className = 'fa-brands fa-flutter file-icon dart-icon';
        else iconEl.className = 'fa-regular fa-file file-icon';
        
        iconEl.style.marginRight = '5px';
        iconEl.style.width = '14px';
        iconEl.style.textAlign = 'center';
    }
    
    const nameEl = document.createElement('span');
    nameEl.textContent = node.name;
    
    nodeRow.appendChild(iconEl);
    nodeRow.appendChild(nameEl);
    el.appendChild(nodeRow);
    
    nodeRow.addEventListener('click', (e) => {
        e.stopPropagation();
        if (node.type === 'folder') {
            node.expanded = !node.expanded;
            renderExplorer();
        } else {
            openFile(node);
        }
    });
    
    if (node.type === 'folder' && node.expanded && node.children) {
        const childrenContainer = document.createElement('div');
        node.children.forEach(child => {
            childrenContainer.appendChild(createTreeNode(child, depth + 1));
        });
        el.appendChild(childrenContainer);
    }
    return el;
}

// --- Editor and Tabs ---
function openFile(node) {
    const existingIndex = openTabs.findIndex(t => t.id === node.id);
    if (existingIndex === -1) {
        openTabs.push(node);
    }
    activeTabId = node.id;
    renderTabs();
    renderEditor();
}

function renderTabs() {
    const tabsContainer = document.getElementById('editor-tabs');
    tabsContainer.innerHTML = '';
    
    openTabs.forEach(tabData => {
        const tabEl = document.createElement('div');
        tabEl.className = 'tab ' + (tabData.id === activeTabId ? 'active' : '');
        
        let iconClass = 'fa-regular fa-file';
        let iconColor = '#cccccc';
        if (tabData.name.endsWith('.html')) { iconClass = 'fa-brands fa-html5'; iconColor = '#e34c26'; }
        if (tabData.name.endsWith('.css')) { iconClass = 'fa-brands fa-css3-alt'; iconColor = '#264de4'; }
        if (tabData.name.endsWith('.js')) { iconClass = 'fa-brands fa-js'; iconColor = '#f7df1e'; }
        if (tabData.name.endsWith('.dart')) { iconClass = 'fa-brands fa-flutter'; iconColor = '#0175C2'; }
        
        tabEl.innerHTML = `
            <i class="tab-icon ${iconClass}" style="color: ${iconColor}"></i>
            <span>${tabData.name}</span>
            <i class="fa-solid fa-xmark tab-close"></i>
        `;
        
        tabEl.addEventListener('click', () => {
            activeTabId = tabData.id;
            renderTabs();
            renderEditor();
        });
        
        const closeBtn = tabEl.querySelector('.tab-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tabData.id);
        });
        
        tabsContainer.appendChild(tabEl);
    });
}

function closeTab(id) {
    const index = openTabs.findIndex(t => t.id === id);
    if (index !== -1) {
        openTabs.splice(index, 1);
        if (openTabs.length > 0) {
            activeTabId = openTabs[Math.max(0, index - 1)].id;
        } else {
            activeTabId = null;
        }
        renderTabs();
        renderEditor();
    }
}

function renderEditor() {
    const langStatus = document.getElementById('status-language');
    if (!isMonacoReady || !editor) return;

    if (activeTabId) {
        const activeTab = openTabs.find(t => t.id === activeTabId);
        const content = activeTab.content || '';
        const langCode = activeTab.language || 'plaintext';
        
        // Monaco language IDs
        let monacoLang = 'plaintext';
        if (langCode === 'html') monacoLang = 'html';
        else if (langCode === 'css') monacoLang = 'css';
        else if (langCode === 'javascript') monacoLang = 'javascript';
        else if (langCode === 'dart') monacoLang = 'dart';

        editor.setValue(content);
        monaco.editor.setModelLanguage(editor.getModel(), monacoLang);
        editor.updateOptions({ readOnly: false });
        
        langStatus.textContent = activeTab.language ? activeTab.language.toUpperCase() : 'Plain Text';
    } else {
        editor.setValue('');
        editor.updateOptions({ readOnly: true });
        langStatus.textContent = 'Plain Text';
    }
}

// --- Editor Sync ---
function initEditorSync() {
    if (!editor) return;
    const statusLineCol = document.getElementById('status-line-col');

    editor.onDidChangeModelContent(() => {
        if (activeTabId) {
            const activeTab = openTabs.find(t => t.id === activeTabId);
            if (activeTab) {
                activeTab.content = editor.getValue();
            }
        }
    });

    editor.onDidChangeCursorPosition((e) => {
        statusLineCol.textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
    });
}

// --- Terminal ---
function initTerminal() {
    const termInput = document.getElementById('terminal-input');
    const termOutput = document.getElementById('terminal-output');
    const panelContent = document.getElementById('terminal-content');
    const closePanelBtn = document.getElementById('close-panel-btn');
    const bottomPanel = document.getElementById('bottom-panel');

    closePanelBtn.addEventListener('click', () => {
        bottomPanel.style.display = 'none';
    });

    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = termInput.value.trim();
            if (cmd) {
                termOutput.innerHTML += `<div><span class="prompt"></span> ${escapeHtml(cmd)}</div>`;
                processCommand(cmd, termOutput);
                termInput.value = '';
                panelContent.scrollTop = panelContent.scrollHeight;
            }
        }
    });
}

function processCommand(cmd, outputEl) {
    const args = cmd.split(' ');
    const command = args[0].toLowerCase();
    const outputDiv = document.createElement('div');
    outputDiv.style.marginBottom = '5px';

    if (command === 'help') {
        outputDiv.innerHTML = `Available commands:<br> help  - Show this message<br> clear - Clear the terminal<br> echo  - Print text to the terminal`;
    } else if (command === 'clear') {
        outputEl.innerHTML = '';
        return; 
    } else if (command === 'echo') {
        outputDiv.textContent = args.slice(1).join(' ');
    } else {
        outputDiv.innerHTML = `<span style="color: #f48771;">${escapeHtml(command)} : The term '${escapeHtml(command)}' is not recognized.</span>`;
    }
    
    if (outputDiv.innerHTML) {
        outputEl.appendChild(outputDiv);
    }
}

function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// --- Activity Bar ---
function initActivityBar() {
    const activityIcons = document.querySelectorAll('.activity-top .activity-icon');
    const sidebarTitle = document.getElementById('sidebar-title');
    const sidebarContent = document.getElementById('sidebar-content');

    activityIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            activityIcons.forEach(i => i.classList.remove('active'));
            icon.classList.add('active');
            
            const panel = icon.getAttribute('data-panel');
            sidebarTitle.textContent = panel.replace('-', ' ').toUpperCase();
            
            if (panel === 'explorer') {
                renderExplorer();
            } else {
                sidebarContent.innerHTML = `<div style="padding: 20px; text-align: center; color: #858585;">
                    <i class="${icon.querySelector('i').className}" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                    <p>This is the mock ${panel} panel.</p>
                </div>`;
            }
        });
    });
}

// --- Context Menu ---
function initContextMenu() {
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.innerHTML = `
        <div class="context-item" id="ctx-new-file">New File</div>
        <div class="context-item" id="ctx-new-folder">New Folder</div>
        <div class="context-separator"></div>
        <div class="context-item" id="ctx-delete">Delete</div>
    `;
    document.body.appendChild(contextMenu);

    let activeNodeForContext = null;

    document.getElementById('sidebar-content').addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const row = e.target.closest('.tree-node-row');
        if (row) {
            document.querySelectorAll('.tree-node-row').forEach(r => r.classList.remove('active'));
            row.classList.add('active');
            const nameNode = row.querySelector('span');
            if (nameNode) {
                 activeNodeForContext = findNodeByName(fileSystem, nameNode.textContent);
            }
        } else {
            activeNodeForContext = fileSystem;
        }

        contextMenu.style.display = 'block';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
    });

    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
        document.querySelectorAll('.tree-node-row').forEach(r => r.classList.remove('active'));
    });

    document.getElementById('ctx-new-file').addEventListener('click', () => {
        const name = prompt("Enter file name (e.g., test.js):");
        if (name && activeNodeForContext) {
            const parent = activeNodeForContext.type === 'folder' ? activeNodeForContext : fileSystem;
            if(!parent.children) parent.children = [];
            parent.children.push({
                id: Date.now().toString(), name: name, type: 'file', content: ''
            });
            renderExplorer();
        }
    });

    document.getElementById('ctx-delete').addEventListener('click', () => {
        if (activeNodeForContext && activeNodeForContext.id !== 'root') {
            if (confirm(`Delete '${activeNodeForContext.name}'?`)) {
                removeNode(fileSystem, activeNodeForContext.id);
                closeTab(activeNodeForContext.id);
                renderExplorer();
            }
        }
    });
}

function findNodeByName(node, name) {
    if (node.name === name) return node;
    if (node.children) {
        for (let child of node.children) {
            const found = findNodeByName(child, name);
            if (found) return found;
        }
    }
    return null;
}

function removeNode(parent, id) {
    if (parent.children) {
        const index = parent.children.findIndex(c => c.id === id);
        if (index > -1) {
            parent.children.splice(index, 1);
            return true;
        }
        for (let child of parent.children) {
            if (removeNode(child, id)) return true;
        }
    }
    return false;
}

// --- Keyboard Shortcuts ---
function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    if (editor && isMonacoReady) {
                        // Visual feedback for save
                        const container = document.getElementById('monaco-editor-container');
                        container.style.opacity = '0.5';
                        setTimeout(() => container.style.opacity = '1', 150);
                    }
                    break;
                case '`':
                    e.preventDefault();
                    const panel = document.getElementById('bottom-panel');
                    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
                    break;
            }
        }
    });
}

// --- Dropdown Menus ---
const menuData = {
    'menu-file': [{ label: 'New File...', shortcut: 'Ctrl+N' }, { label: 'Save', shortcut: 'Ctrl+S' }, { type: 'separator' }, { label: 'Exit' }],
    'menu-edit': [{ label: 'Undo', shortcut: 'Ctrl+Z' }, { label: 'Redo', shortcut: 'Ctrl+Y' }],
    'menu-selection': [{ label: 'Select All', shortcut: 'Ctrl+A' }],
    'menu-view': [{ label: 'Explorer', shortcut: 'Ctrl+Shift+E' }, { label: 'Terminal', shortcut: 'Ctrl+`' }, { type: 'separator' }, { label: 'Color Theme', action: () => { window.showThemePicker(); } }],
    'menu-go': [{ label: 'Go to File...', shortcut: 'Ctrl+P' }],
    'menu-run': [{ label: 'Start Debugging', shortcut: 'F5' }, { label: 'Run Without Debugging', shortcut: 'Ctrl+F5' }],
    'menu-more': [{ label: 'Terminal', action: () => { document.getElementById('bottom-panel').style.display = 'flex'; } }, { label: 'Help' }]
};

function initDropdowns() {
    const menuItems = document.querySelectorAll('.title-bar-menu .menu-item');
    let activeDropdown = null;

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const menuId = item.id;
            if (activeDropdown && activeDropdown.id === `dropdown-${menuId}`) {
                closeDropdown();
            } else {
                showDropdown(item, menuId);
            }
        });

        item.addEventListener('mouseenter', () => {
            if (activeDropdown) {
                showDropdown(item, item.id);
            }
        });
    });

    document.addEventListener('click', closeDropdown);

    function showDropdown(anchor, menuId) {
        closeDropdown();
        const data = menuData[menuId];
        if (!data) return;

        anchor.classList.add('active');
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown-menu active';
        dropdown.id = `dropdown-${menuId}`;
        
        const rect = anchor.getBoundingClientRect();
        dropdown.style.left = rect.left + 'px';

        data.forEach(entry => {
            if (entry.type === 'separator') {
                const sep = document.createElement('div');
                sep.className = 'dropdown-separator';
                dropdown.appendChild(sep);
            } else {
                const row = document.createElement('div');
                row.className = 'dropdown-item';
                row.innerHTML = `<span>${entry.label}</span>${entry.shortcut ? `<span class="shortcut">${entry.shortcut}</span>` : ''}`;
                row.addEventListener('click', () => {
                    if (entry.action) entry.action();
                    closeDropdown();
                });
                dropdown.appendChild(row);
            }
        });

        document.body.appendChild(dropdown);
        activeDropdown = dropdown;
    }

    function closeDropdown() {
        if (activeDropdown) {
            activeDropdown.remove();
            activeDropdown = null;
        }
        document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    }
}

// --- Theme Switching ---
function switchTheme(theme) {
  console.log('Switching to theme:', theme);
  // 1. Update Monaco Editor Workspace Theme
  if (isMonacoReady && editor) {
    monaco.editor.setTheme(theme === 'hc-black' ? 'hc-black' : (theme === 'vs-light' ? 'vs' : 'vs-dark'));
  }
  // 2. Update Globals via DOM Style Property Rules
  const root = document.documentElement;
  if (theme === 'vs-light') {
    root.style.setProperty('--vscode-editor-background', '#ffffff');
    root.style.setProperty('--vscode-editor-foreground', '#000000');
    root.style.setProperty('--vscode-activityBar-background', '#f3f3f3');
    root.style.setProperty('--vscode-activityBar-foreground', '#000000');
    root.style.setProperty('--vscode-activityBar-activeBorder', '#007acc');
    root.style.setProperty('--vscode-sideBar-background', '#f3f3f3');
    root.style.setProperty('--vscode-statusBar-background', '#007acc');
    root.style.setProperty('--vscode-statusBar-foreground', '#ffffff');
    root.style.setProperty('--vscode-titleBar-activeBackground', '#dddddd');
    root.style.setProperty('--vscode-titleBar-activeForeground', '#000000');
    root.style.setProperty('--vscode-tab-activeBackground', '#ffffff');
    root.style.setProperty('--vscode-tab-inactiveBackground', '#f3f3f3');
    root.style.setProperty('--vscode-panel-background', '#ffffff');
    root.style.setProperty('--vscode-panel-border', '#cccccc');
    root.style.setProperty('--vscode-focus-border', '#007fd4');
    root.style.setProperty('--vscode-list-hoverBg', '#f0f0f0');
    root.style.setProperty('--vscode-list-activeSelectionBg', '#e0e0e0');
    root.style.setProperty('--vscode-selection-bg', '#add6ff');
    root.style.setProperty('--vscode-hover-bg', 'rgba(0, 0, 0, 0.1)');
    root.style.setProperty('--vscode-hover-fg', 'black');
    root.style.setProperty('--vscode-border-color', '#cccccc');
    root.style.setProperty('--vscode-scrollbar-thumb', '#cccccc');
    root.style.setProperty('--vscode-error-color', '#f7768e');
  } else if (theme === 'hc-black') {
    root.style.setProperty('--vscode-editor-background', '#000000');
    root.style.setProperty('--vscode-editor-foreground', '#ffffff');
    root.style.setProperty('--vscode-activityBar-background', '#000000');
    root.style.setProperty('--vscode-activityBar-foreground', '#ffffff');
    root.style.setProperty('--vscode-activityBar-activeBorder', '#ffffff');
    root.style.setProperty('--vscode-sideBar-background', '#000000');
    root.style.setProperty('--vscode-statusBar-background', '#ffffff');
    root.style.setProperty('--vscode-statusBar-foreground', '#000000');
    root.style.setProperty('--vscode-titleBar-activeBackground', '#000000');
    root.style.setProperty('--vscode-titleBar-activeForeground', '#ffffff');
    root.style.setProperty('--vscode-tab-activeBackground', '#000000');
    root.style.setProperty('--vscode-tab-inactiveBackground', '#000000');
    root.style.setProperty('--vscode-panel-background', '#000000');
    root.style.setProperty('--vscode-panel-border', '#ffffff');
    root.style.setProperty('--vscode-focus-border', '#ffffff');
    root.style.setProperty('--vscode-list-hoverBg', '#ffffff');
    root.style.setProperty('--vscode-list-activeSelectionBg', '#ffffff');
    root.style.setProperty('--vscode-selection-bg', '#ffffff');
    root.style.setProperty('--vscode-hover-bg', 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--vscode-hover-fg', 'white');
    root.style.setProperty('--vscode-border-color', '#ffffff');
    root.style.setProperty('--vscode-scrollbar-thumb', '#ffffff');
    root.style.setProperty('--vscode-error-color', '#ffffff');
  } else {
    // Default: vs-dark
    root.style.setProperty('--vscode-editor-background', '#1e1e1e');
    root.style.setProperty('--vscode-editor-foreground', '#cccccc');
    root.style.setProperty('--vscode-activityBar-background', '#333333');
    root.style.setProperty('--vscode-activityBar-foreground', '#cccccc');
    root.style.setProperty('--vscode-activityBar-activeBorder', '#007acc');
    root.style.setProperty('--vscode-sideBar-background', '#252526');
    root.style.setProperty('--vscode-statusBar-background', '#007acc');
    root.style.setProperty('--vscode-statusBar-foreground', '#ffffff');
    root.style.setProperty('--vscode-titleBar-activeBackground', '#323233');
    root.style.setProperty('--vscode-titleBar-activeForeground', '#cccccc');
    root.style.setProperty('--vscode-tab-activeBackground', '#1e1e1e');
    root.style.setProperty('--vscode-tab-inactiveBackground', '#2d2d2d');
    root.style.setProperty('--vscode-panel-background', '#1e1e1e');
    root.style.setProperty('--vscode-panel-border', '#3e3e42');
    root.style.setProperty('--vscode-focus-border', '#007fd4');
    root.style.setProperty('--vscode-list-hoverBg', '#2a2d2e');
    root.style.setProperty('--vscode-list-activeSelectionBg', '#37373d');
    root.style.setProperty('--vscode-selection-bg', '#264f78');
    root.style.setProperty('--vscode-hover-bg', 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--vscode-hover-fg', 'white');
    root.style.setProperty('--vscode-border-color', '#454545');
    root.style.setProperty('--vscode-scrollbar-thumb', '#424242');
    root.style.setProperty('--vscode-error-color', '#f7768e');
  }
}

function initThemePicker() {
  const themePicker = document.getElementById('theme-picker');
  const themeItems = document.querySelectorAll('.theme-item');
  let ignoreNextClick = false;

  themeItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const theme = item.getAttribute('data-theme');
      console.log('Theme selected:', theme);
      switchTheme(theme);
      // Update active class
      document.querySelectorAll('.theme-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      // Hide picker
      themePicker.style.display = 'none';
    });
  });

  // Close picker when clicking outside
  document.addEventListener('click', (e) => {
    if (ignoreNextClick) {
      ignoreNextClick = false;
      return;
    }
    if (!themePicker.contains(e.target) && themePicker.style.display === 'block') {
      themePicker.style.display = 'none';
    }
  });

  // Expose the flag for menu action
  window.showThemePicker = () => {
    themePicker.style.display = 'block';
    ignoreNextClick = true;
  };
}
