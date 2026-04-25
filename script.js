// ===== VS CODE CLONE - script.js =====

// ---------- STATE ----------
const state = {
  activePanel: 'explorer',
  sidebarVisible: true,
  panelVisible: true,
  activeTab: null,
  tabs: [],
  editorInstances: {},
  currentFile: null,
  panelTab: 'TERMINAL',
  terminalLines: [],
  terminalCwd: 'C:\\Users\\okoye\\vscode-clone',
  cursorPos: { ln: 1, col: 1 },
  inSelection: false,
  currentTheme: 'vscode-dark',
  fileHistory: [],
  fileHistoryIndex: -1,
  isDebugging: false,
  wordWrap: false,
  minimap: true,
  autoSave: false,
  zoomLevel: 0,
};

// ---------- FILE TREE DATA ----------
const fileTree = [
  {
    name: 'VSCODE-CLONE', type: 'folder', open: true, children: [
      { name: 'src', type: 'folder', open: false, children: [
          { name: 'index.html', type: 'file', lang: 'html', content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>VS Code Clone</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div id="app"></div>\n  <script src="script.js"><\/script>\n</body>\n</html>` },
          { name: 'style.css', type: 'file', lang: 'css', content: `/* Main Styles */\n:root {\n  --bg: #1e1e1e;\n  --fg: #cccccc;\n  --accent: #007acc;\n}\n\nbody {\n  margin: 0;\n  font-family: 'Segoe UI', sans-serif;\n  background: var(--bg);\n  color: var(--fg);\n}\n\n#app {\n  display: flex;\n  flex-direction: column;\n  height: 100vh;\n}` },
          { name: 'script.js', type: 'file', lang: 'javascript', content: `// Main application script\nconst app = document.getElementById('app');\n\nfunction init() {\n  console.log('App initialized');\n  render();\n}\n\nfunction render() {\n  // Render the application\n}\n\ninit();` },
      ]},
      { name: 'package.json', type: 'file', lang: 'json', content: `{\n  "name": "vscode-clone",\n  "version": "1.0.0",\n  "description": "A VS Code clone",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview"\n  },\n  "devDependencies": {\n    "vite": "^5.0.0"\n  }\n}` },
      { name: 'README.md', type: 'file', lang: 'markdown', content: `# VS Code Clone\n\nA functional clone of Visual Studio Code built with HTML, CSS, and JavaScript.\n\n## Features\n- Monaco Editor integration\n- File explorer\n- Integrated terminal\n- Git panel\n- Extensions panel\n- Command palette\n\n## Getting Started\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`` },
      { name: '.gitignore', type: 'file', lang: 'plaintext', content: `node_modules/\ndist/\n.env\n.DS_Store\n*.log` },
    ]
  }
];

// ---------- ICON MAP ----------
function fileIcon(name, type, open) {
  if (type === 'folder') return open
    ? `<svg viewBox="0 0 16 16" class="icon-folder-open" fill="currentColor"><path d="M1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .493-.406L16 8.5V5.5a.5.5 0 0 0-.5-.5H8.414l-1.5-1.5H1.5z"/></svg>`
    : `<svg viewBox="0 0 16 16" class="icon-folder" fill="currentColor"><path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.586a1 1 0 0 1 .707.293L8 3h6.5A1.5 1.5 0 0 1 16 4.5v8A1.5 1.5 0 0 1 14.5 14h-13A1.5 1.5 0 0 1 0 12.5V5c0-.626.38-1.163.938-1.385L1 3.5z"/></svg>`;
  const ext = name.split('.').pop().toLowerCase();
  const map = {
    html: `<svg viewBox="0 0 16 16" class="icon-html" fill="currentColor"><text y="13" font-size="11" font-weight="bold">H</text></svg>`,
    css: `<svg viewBox="0 0 16 16" class="icon-css" fill="currentColor"><text y="13" font-size="11" font-weight="bold">C</text></svg>`,
    js: `<svg viewBox="0 0 16 16" class="icon-js" fill="currentColor"><text y="13" font-size="11" font-weight="bold">J</text></svg>`,
    json: `<svg viewBox="0 0 16 16" class="icon-json" fill="currentColor"><text y="13" font-size="9" font-weight="bold">{}</text></svg>`,
    md: `<svg viewBox="0 0 16 16" class="icon-md" fill="currentColor"><text y="13" font-size="9" font-weight="bold">Mâ†“</text></svg>`,
  };
  return map[ext] || `<svg viewBox="0 0 16 16" fill="#858585"><rect x="3" y="1" width="10" height="13" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
}

function langLabel(ext) {
  return ({ html: 'HTML', css: 'CSS', js: 'JavaScript', json: 'JSON', md: 'Markdown', ts: 'TypeScript', gitignore: 'Ignore' })[ext] || 'Plain Text';
}

// ---------- THEMES ----------
const MONACO_TOKEN_RULES = [
  { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
  { token: 'keyword', foreground: '569cd6' },
  { token: 'string', foreground: 'ce9178' },
  { token: 'number', foreground: 'b5cea8' },
  { token: 'type', foreground: '4ec9b0' },
];

const themes = [
  {
    id: 'vscode-dark',
    label: 'Dark+ (Default Dark)',
    description: 'Balanced dark grays with a cool blue accent.',
    preview: ['#1e1e1e', '#252526', '#007acc', '#c9d9ff'],
    cssVars: {
      '--bg': '#1e1e1e',
      '--bg2': '#252526',
      '--bg3': '#2d2d30',
      '--bg4': '#3c3c3c',
      '--border': '#3c3c3c',
      '--accent': '#007acc',
      '--accent2': '#0e639c',
      '--fg': '#cccccc',
      '--fg-dim': '#969696',
      '--fg-bright': '#ffffff',
      '--active-tab': '#1e1e1e',
      '--inactive-tab': '#2d2d30',
      '--titlebar-bg': '#323233',
      '--titlebar-fg': '#cccccc',
    },
    monaco: {
      base: 'vs-dark',
      inherit: true,
      colors: {
        'editor.background': '#1e1e1e',
        'editor.lineHighlightBackground': '#2a2a2a',
        'editorLineNumber.foreground': '#858585',
        'editorCursor.foreground': '#aeafad',
      },
    },
  },
  {
    id: 'vscode-light',
    label: 'Light+ (Default Light)',
    description: 'Soft light palette with subtle contrast.',
    preview: ['#ffffff', '#f3f3f3', '#005fb8', '#333333'],
    cssVars: {
      '--bg': '#ffffff',
      '--bg2': '#f3f3f3',
      '--bg3': '#e8e8e8',
      '--bg4': '#dddddd',
      '--border': '#d0d0d0',
      '--accent': '#005fb8',
      '--accent2': '#0f6cbd',
      '--fg': '#333333',
      '--fg-dim': '#5f5f5f',
      '--fg-bright': '#111111',
      '--active-tab': '#ffffff',
      '--inactive-tab': '#ececec',
      '--titlebar-bg': '#e8e8e8',
      '--titlebar-fg': '#333333',
    },
    monaco: {
      base: 'vs',
      inherit: true,
      colors: {
        'editor.background': '#ffffff',
        'editor.lineHighlightBackground': '#f7f7f7',
        'editorLineNumber.foreground': '#8a8a8a',
        'editorCursor.foreground': '#333333',
      },
    },
  },
  {
    id: 'vscode-abyss',
    label: 'Abyss',
    description: 'Deep navy base with bright cyan highlights.',
    preview: ['#000c18', '#001122', '#0090ff', '#e6f3ff'],
    cssVars: {
      '--bg': '#000c18',
      '--bg2': '#001122',
      '--bg3': '#001933',
      '--bg4': '#002952',
      '--border': '#0c2d48',
      '--accent': '#0090ff',
      '--accent2': '#007acc',
      '--fg': '#d7e6ff',
      '--fg-dim': '#8aa5c4',
      '--fg-bright': '#ffffff',
      '--active-tab': '#000c18',
      '--inactive-tab': '#001933',
      '--titlebar-bg': '#001428',
      '--titlebar-fg': '#d7e6ff',
    },
    monaco: {
      base: 'vs-dark',
      inherit: true,
      colors: {
        'editor.background': '#000c18',
        'editor.lineHighlightBackground': '#001a2f',
        'editorLineNumber.foreground': '#406080',
        'editorCursor.foreground': '#e6f3ff',
      },
    },
  },
];

const themeById = themes.reduce((map, theme) => {
  map[theme.id] = theme;
  return map;
}, {});

function defineMonacoThemes() {
  if (!window.monaco?.editor) return;
  themes.forEach(theme => {
    monaco.editor.defineTheme(theme.id, {
      base: theme.monaco.base,
      inherit: theme.monaco.inherit,
      rules: MONACO_TOKEN_RULES,
      colors: theme.monaco.colors,
    });
  });
}

function applyTheme(themeId, options = {}) {
  const theme = themeById[themeId] || themeById['vscode-dark'];
  Object.entries(theme.cssVars).forEach(([name, value]) => {
    document.documentElement.style.setProperty(name, value);
  });
  state.currentTheme = theme.id;
  try {
    window.localStorage.setItem('vscode-clone-theme', theme.id);
  } catch (err) {
    // Ignore storage failures (e.g., private mode restrictions).
  }
  if (monacoReady && window.monaco?.editor) {
    defineMonacoThemes();
    monaco.editor.setTheme(theme.id);
  }
  if (options.notify) showNotif(`Theme changed: ${theme.label}`, 'info');
}

function renderThemePickerOverlay() {
  const grid = document.getElementById('theme-picker-grid');
  if (!grid) return;
  grid.innerHTML = themes.map(theme => {
    const isActive = theme.id === state.currentTheme;
    const description = theme.description ? `<div class="theme-card-desc">${theme.description}</div>` : '';
    const swatches = theme.preview?.map(color => `<span style="background:${color};"></span>`).join('') || '';
    return `<button type="button" class="theme-card${isActive ? ' active' : ''}" data-theme-id="${theme.id}">
      <div class="theme-card-top">
        <div class="theme-card-meta">
          <div class="theme-card-name">${theme.label}</div>
          ${description}
        </div>
        <span class="theme-card-tag">${isActive ? 'Current' : 'Select'}</span>
      </div>
      <div class="theme-card-swatch">
        ${swatches}
      </div>
    </button>`;
  }).join('');
  grid.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.themeId;
      if (!id) return;
      applyTheme(id, { notify: true });
      closeThemePickerOverlay();
    });
  });
}

function openThemePickerOverlay() {
  const overlay = document.getElementById('theme-picker-overlay');
  if (!overlay) return;
  renderThemePickerOverlay();
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeThemePickerOverlay() {
  const overlay = document.getElementById('theme-picker-overlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}

// ---------- SIDEBAR PANELS ----------
function buildExplorer() {
  const body = document.getElementById('sidebar-body');
  body.innerHTML = '';
  function renderTree(nodes, depth) {
    nodes.forEach(node => {
      const el = document.createElement('div');
      const indent = depth * 16;
      if (node.type === 'folder') {
        el.className = 'tree-item';
        el.style.paddingLeft = (8 + indent) + 'px';
        el.innerHTML = `<span class="arrow ${node.open ? 'open' : ''}">&#9654;</span> ${fileIcon(node.name, 'folder', node.open)} <span class="tree-folder-label">${node.name}</span>`;
        el.addEventListener('click', () => {
          node.open = !node.open;
          buildExplorer();
        });
        body.appendChild(el);
        if (node.open && node.children) {
          const childWrap = document.createElement('div');
          childWrap.className = 'tree-children open';
          body.appendChild(childWrap);
          const saved = body;
          // re-render into childWrap trick: temporarily point
          const tmp = { innerHTML: '' };
          node.children.forEach(child => {
            const ce = document.createElement('div');
            const ci = (depth + 1) * 16;
            ce.className = 'tree-item' + (state.currentFile === child ? ' selected' : '');
            ce.style.paddingLeft = (8 + ci) + 'px';
            if (child.type === 'folder') {
              ce.innerHTML = `<span class="arrow ${child.open ? 'open' : ''}">&#9654;</span> ${fileIcon(child.name, 'folder', child.open)} <span class="tree-folder-label">${child.name}</span>`;
              ce.addEventListener('click', () => { child.open = !child.open; buildExplorer(); });
            } else {
              ce.innerHTML = `<span style="width:12px;display:inline-block"></span> ${fileIcon(child.name)} <span>${child.name}</span>`;
              ce.addEventListener('click', () => openFile(child));
              ce.addEventListener('contextmenu', e => showCtxMenu(e, child));
            }
            childWrap.appendChild(ce);
            if (child.type === 'folder' && child.open && child.children) {
              renderTree(child.children, depth + 2);
            }
          });
        }
      } else {
        el.className = 'tree-item' + (state.currentFile === node ? ' selected' : '');
        el.style.paddingLeft = (8 + indent) + 'px';
        el.innerHTML = `<span style="width:12px;display:inline-block"></span> ${fileIcon(node.name)} <span>${node.name}</span>`;
        el.addEventListener('click', () => openFile(node));
        el.addEventListener('contextmenu', e => showCtxMenu(e, node));
        body.appendChild(el);
      }
    });
  }
  renderTree(fileTree, 0);
}

function buildSearch() {
  const body = document.getElementById('sidebar-body');
  body.innerHTML = `<div class="search-panel">
    <input id="search-input" placeholder="Search" style="margin-bottom:8px">
    <input id="replace-input" placeholder="Replace" style="margin-bottom:8px">
    <div id="search-results"></div>
  </div>`;
  const inp = document.getElementById('search-input');
  inp.addEventListener('input', () => {
    const q = inp.value.trim();
    const res = document.getElementById('search-results');
    res.innerHTML = '';
    if (!q) return;
    function searchNode(nodes) {
      nodes.forEach(n => {
        if (n.type === 'file' && n.content) {
          const lines = n.content.split('\n');
          const matches = lines.map((l, i) => ({ ln: i + 1, text: l })).filter(l => l.text.toLowerCase().includes(q.toLowerCase()));
          if (matches.length) {
            const title = document.createElement('div');
            title.className = 'search-result-file';
            title.textContent = n.name;
            res.appendChild(title);
            matches.forEach(m => {
              const row = document.createElement('div');
              row.className = 'search-result-line';
              const hl = m.text.replace(new RegExp(q, 'gi'), s => `<span class="search-hl">${s}</span>`);
              row.innerHTML = `<span class="ln">${m.ln}</span> ${hl}`;
              row.addEventListener('click', () => openFile(n));
              res.appendChild(row);
            });
          }
        }
        if (n.children) searchNode(n.children);
      });
    }
    searchNode(fileTree);
  });
}

function buildGit() {
  const body = document.getElementById('sidebar-body');
  const changes = [
    { name: 'BABA.html', status: 'M' },
    { name: 'style.css', status: 'U' },
    { name: 'script.js', status: 'U' },
  ];
  body.innerHTML = `<div style="padding:8px">
    <input class="git-input" id="commit-msg" placeholder="Message (Ctrl+Enter to commit)">
    <button class="git-btn" id="commit-btn">&#10003; Commit</button>
  </div>
  <div class="git-section-title">Changes (${changes.length})</div>
  ${changes.map(c => `<div class="git-change"><span class="git-change-letter ${c.status}">${c.status}</span><span>${c.name}</span></div>`).join('')}`;
  document.getElementById('commit-btn').addEventListener('click', () => {
    const msg = document.getElementById('commit-msg').value.trim();
    if (msg) { showNotif('Committed: ' + msg, 'info'); document.getElementById('commit-msg').value = ''; }
    else showNotif('Enter a commit message first', 'warn');
  });
}

function buildExtensions() {
  const body = document.getElementById('sidebar-body');
  const exts = [
    { name: 'Prettier', desc: 'Code formatter', pub: 'Prettier', icon: 'âœ¨', color: '#1a73e8', installed: true },
    { name: 'ESLint', desc: 'JavaScript linting', pub: 'ESLint', icon: 'ðŸ”´', color: '#4b32c3', installed: true },
    { name: 'GitLens', desc: 'Git supercharged', pub: 'GitKraken', icon: 'ðŸ”', color: '#914db3', installed: false },
    { name: 'Live Server', desc: 'Local dev server', pub: 'Ritwick Dey', icon: 'ðŸŒ', color: '#16b48e', installed: false },
    { name: 'Tailwind CSS', desc: 'IntelliSense for Tailwind', pub: 'Tailwind Labs', icon: 'ðŸŽ¨', color: '#06b6d4', installed: false },
  ];
  body.innerHTML = `<div class="search-panel"><input placeholder="Search Extensions in Marketplace" style="margin-bottom:8px"></div>
  ${exts.map(e => `<div class="ext-item">
    <div class="ext-icon" style="background:${e.color}20;color:${e.color}">${e.icon}</div>
    <div class="ext-info">
      <div class="ext-name">${e.name}</div>
      <div class="ext-desc">${e.desc}</div>
      <div class="ext-meta">${e.pub}</div>
    </div>
    <button class="ext-install ${e.installed ? 'installed' : ''}">${e.installed ? 'Installed' : 'Install'}</button>
  </div>`).join('')}`;
  body.querySelectorAll('.ext-install:not(.installed)').forEach(btn => {
    btn.addEventListener('click', () => { btn.textContent = 'Installed'; btn.classList.add('installed'); showNotif('Extension installed!', 'info'); });
  });
}

// ---------- SIDEBAR SWITCH ----------
function switchPanel(panel) {
  state.activePanel = panel;
  if (state.sidebarVisible && panel === state.lastPanel) {
    state.sidebarVisible = false;
    document.getElementById('sidebar').classList.add('hidden');
    state.lastPanel = null;
    return;
  }
  state.lastPanel = panel;
  state.sidebarVisible = true;
  document.getElementById('sidebar').classList.remove('hidden');
  document.getElementById('sidebar-title').textContent = ({ explorer: 'Explorer', search: 'Search', git: 'Source Control', debug: 'Run and Debug', extensions: 'Extensions' })[panel] || panel.toUpperCase();
  document.querySelectorAll('.activ-icon').forEach(i => i.classList.remove('active'));
  document.querySelector(`.activ-icon[data-panel="${panel}"]`)?.classList.add('active');
  const funcs = { explorer: buildExplorer, search: buildSearch, git: buildGit, extensions: buildExtensions };
  if (funcs[panel]) funcs[panel]();
  else document.getElementById('sidebar-body').innerHTML = `<div style="padding:16px;color:var(--fg-dim)">Coming soonâ€¦</div>`;
}

// ---------- FILE OPEN / TABS ----------
function pushFileHistory(file) {
  if (!file) return;
  const current = state.fileHistory[state.fileHistoryIndex];
  if (current === file) return;
  if (state.fileHistoryIndex < state.fileHistory.length - 1) {
    state.fileHistory = state.fileHistory.slice(0, state.fileHistoryIndex + 1);
  }
  state.fileHistory.push(file);
  state.fileHistoryIndex = state.fileHistory.length - 1;
}

function openFile(file, options = {}) {
  if (!file) return;
  state.currentFile = file;
  const exists = state.tabs.find(t => t === file);
  if (!exists) state.tabs.push(file);
  state.activeTab = file;
  if (options.recordHistory !== false) pushFileHistory(file);
  renderTabs();
  updateBreadcrumb(file);
  showEditor(file);
  updateStatusBar(file);
  buildExplorer();
}

function closeTab(file, e) {
  if (e) e.stopPropagation();
  const idx = state.tabs.indexOf(file);
  state.tabs.splice(idx, 1);
  if (state.activeTab === file) {
    state.activeTab = state.tabs[Math.min(idx, state.tabs.length - 1)] || null;
  }
  if (state.editorInstances[file.name]) {
    state.editorInstances[file.name] = null;
  }
  renderTabs();
  if (state.activeTab) { showEditor(state.activeTab); updateBreadcrumb(state.activeTab); updateStatusBar(state.activeTab); }
  else {
    document.getElementById('editor-area').innerHTML = `<div id="welcome-inner" class="welcome-page">${welcomeHTML()}</div>`;
    document.getElementById('breadcrumb').innerHTML = '';
    document.getElementById('status-lang').textContent = 'Plain Text';
  }
}

function renderTabs() {
  const bar = document.getElementById('tab-bar');
  bar.innerHTML = '';
  state.tabs.forEach(file => {
    const tab = document.createElement('div');
    tab.className = 'tab' + (file === state.activeTab ? ' active' : '');
    tab.innerHTML = `<span class="tab-icon">${fileIcon(file.name)}</span><span class="tab-name">${file.name}</span><span class="tab-close" title="Close"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.647.707.707L8 8.707z"/></svg></span>`;
    tab.addEventListener('click', () => { state.activeTab = file; renderTabs(); showEditor(file); updateBreadcrumb(file); updateStatusBar(file); });
    tab.querySelector('.tab-close').addEventListener('click', e => closeTab(file, e));
    bar.appendChild(tab);
  });
}

function updateBreadcrumb(file) {
  const rootName = fileTree[0]?.name || 'workspace';
  document.getElementById('breadcrumb').innerHTML = `<span>${rootName}</span><span class="breadcrumb-sep"> &rsaquo; </span><span>${file.name}</span>`;
}

// ---------- INLINE SUGGEST BAR ----------
function registerMonacoSuggestions() {
  const langs = ['html', 'css', 'javascript', 'json', 'markdown'];
  langs.forEach(lang => {
    monaco.languages.registerCompletionItemProvider(lang, {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        const suggestions = (SUGGEST_DICT[lang] || []).map(s => ({
          label: s.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: s.insert,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
          detail: 'Snippet'
        }));
        return { suggestions: suggestions };
      }
    });
  });
}

const SUGGEST_DICT = {
  html: [
    { label: '!',           insert: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${1:Document}</title>\n</head>\n<body>\n  ${0}\n</body>\n</html>' },
    { label: 'html',        insert: '<html lang="${1:en}">\n\t${0}\n</html>' },
    { label: 'head',        insert: '<head>\n\t${0}\n</head>' },
    { label: 'body',        insert: '<body>\n\t${0}\n</body>' },
    { label: 'h1',          insert: '<h1>${1}</h1>' },
    { label: 'h2',          insert: '<h2>${1}</h2>' },
    { label: 'h3',          insert: '<h3>${1}</h3>' },
    { label: 'h4',          insert: '<h4>${1}</h4>' },
    { label: 'h5',          insert: '<h5>${1}</h5>' },
    { label: 'h6',          insert: '<h6>${1}</h6>' },
    { label: 'p',           insert: '<p>${1}</p>' },
    { label: 'a',           insert: '<a href="${1:#}">${2:Link}</a>' },
    { label: 'div',         insert: '<div class="${1:container}">\n\t${0}\n</div>' },
    { label: 'span',        insert: '<span>${1}</span>' },
    { label: 'img',         insert: '<img src="${1}" alt="${2}">' },
    { label: 'ul',          insert: '<ul>\n  <li>${1}</li>\n</ul>' },
    { label: 'ol',          insert: '<ol>\n  <li>${1}</li>\n</ol>' },
    { label: 'li',          insert: '<li>${1}</li>' },
    { label: 'table',       insert: '<table>\n  <thead>\n    <tr><th>${1}</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>${2}</td></tr>\n  </tbody>\n</table>' },
    { label: 'section',     insert: '<section id="${1}">\n\t${0}\n</section>' },
    { label: 'article',     insert: '<article>\n\t${0}\n</article>' },
    { label: 'aside',       insert: '<aside>\n\t${0}\n</aside>' },
    { label: 'nav',         insert: '<nav>\n\t${0}\n</nav>' },
    { label: 'header',      insert: '<header>\n\t${0}\n</header>' },
    { label: 'footer',      insert: '<footer>\n\t${0}\n</footer>' },
    { label: 'main',        insert: '<main>\n\t${0}\n</main>' },
    { label: 'form',        insert: '<form action="${1}" method="${2:post}">\n  ${0}\n</form>' },
    { label: 'input',       insert: '<input type="${1:text}" name="${2}" placeholder="${3}">' },
    { label: 'button',      insert: '<button type="${1:button}">${2:Click Me}</button>' },
    { label: 'label',       insert: '<label for="${1}">${2:Label}</label>' },
    { label: 'select',      insert: '<select name="${1}">\n  <option value="${2}">${3}</option>\n</select>' },
    { label: 'textarea',    insert: '<textarea name="${1}" rows="${2:4}">${3}</textarea>' },
    { label: 'script',      insert: '<script>\n  ${0}\n</script>' },
    { label: 'script:src',  insert: '<script src="${1}"></script>' },
    { label: 'link',        insert: '<link rel="stylesheet" href="${1:style.css}">' },
    { label: 'style',       insert: '<style>\n  ${0}\n</style>' },
    { label: 'meta:utf',    insert: '<meta charset="UTF-8">' },
    { label: 'meta:vp',     insert: '<meta name="viewport" content="width=device-width, initial-scale=1.0">' },
    { label: 'br',          insert: '<br>' },
    { label: 'hr',          insert: '<hr>' },
    { label: 'strong',      insert: '<strong>${1}</strong>' },
    { label: 'em',          insert: '<em>${1}</em>' },
    { label: 'code',        insert: '<code>${1}</code>' },
    { label: 'pre',         insert: '<pre>${1}</pre>' },
    { label: 'blockquote',  insert: '<blockquote>${1}</blockquote>' },
    { label: 'iframe',      insert: '<iframe src="${1}" frameborder="0"></iframe>' },
    { label: 'video',       insert: '<video src="${1}" controls></video>' },
    { label: 'audio',       insert: '<audio src="${1}" controls></audio>' },
    { label: 'canvas',      insert: '<canvas id="${1}" width="${2:300}" height="${3:150}"></canvas>' },
    { label: 'svg',         insert: '<svg width="${1:100}" height="${2:100}" viewBox="0 0 ${1} ${2}">\n\t${0}\n</svg>' },
    { label: 'path',        insert: '<path d="${1}" fill="${2:currentColor}" />' },
  ],
  css: [
    { label: 'color',            insert: 'color: ${1:#000};' },
    { label: 'background',       insert: 'background: ${1:#fff};' },
    { label: 'background-color', insert: 'background-color: ${1:#fff};' },
    { label: 'font-size',        insert: 'font-size: ${1:14px};' },
    { label: 'font-family',      insert: "font-family: ${1:'Segoe UI', sans-serif};" },
    { label: 'font-weight',      insert: 'font-weight: ${1:bold};' },
    { label: 'margin',           insert: 'margin: ${1:0};' },
    { label: 'padding',          insert: 'padding: ${1:0};' },
    { label: 'width',            insert: 'width: ${1:100%};' },
    { label: 'height',           insert: 'height: ${1:auto};' },
    { label: 'display:flex',     insert: 'display: flex;' },
    { label: 'display:grid',     insert: 'display: grid;' },
    { label: 'display:none',     insert: 'display: none;' },
    { label: 'flex-direction',   insert: 'flex-direction: ${1:column};' },
    { label: 'justify-content',  insert: 'justify-content: ${1:center};' },
    { label: 'align-items',      insert: 'align-items: ${1:center};' },
    { label: 'gap',              insert: 'gap: ${1:10px};' },
    { label: 'grid-template-columns', insert: 'grid-template-columns: repeat(${1:3}, 1fr);' },
    { label: 'position',         insert: 'position: ${1:relative};' },
    { label: 'top',              insert: 'top: ${1:0};' },
    { label: 'border',           insert: 'border: ${1:1px solid #ccc};' },
    { label: 'border-radius',    insert: 'border-radius: ${1:4px};' },
    { label: 'box-shadow',       insert: 'box-shadow: ${1:0 2px 8px rgba(0,0,0,0.1)};' },
    { label: 'transition',       insert: 'transition: ${1:all 0.3s ease};' },
    { label: 'transform',        insert: 'transform: ${1:scale(1.1)};' },
    { label: 'opacity',          insert: 'opacity: ${1:0.5};' },
    { label: 'cursor',           insert: 'cursor: ${1:pointer};' },
    { label: 'z-index',          insert: 'z-index: ${1:100};' },
    { label: 'overflow',         insert: 'overflow: ${1:hidden};' },
    { label: '@media',           insert: '@media (max-width: ${1:768px}) {\n\t${0}\n}' },
    { label: '@keyframes',       insert: '@keyframes ${1:name} {\n  from { ${2} }\n  to { ${3} }\n}' },
    { label: 'var',              insert: 'var(--${1:name})' },
  ],
  javascript: [
    { label: 'function',      insert: 'function ${1:name}(${2:params}) {\n\t${0}\n}' },
    { label: 'const',         insert: 'const ${1:name} = ${2:value};' },
    { label: 'let',           insert: 'let ${1:name} = ${2:value};' },
    { label: 'if',            insert: 'if (${1:condition}) {\n\t${0}\n}' },
    { label: 'for',           insert: 'for (let i = 0; i < ${1:length}; i++) {\n\t${0}\n}' },
    { label: 'forEach',       insert: '${1:array}.forEach(${2:item} => {\n\t${0}\n});' },
    { label: 'map',           insert: 'const ${1:newArray} = ${2:array}.map(${3:item} => {\n\treturn ${0};\n});' },
    { label: 'addEventListener', insert: "${1:element}.addEventListener('${2:click}', (e) => {\n\t${0}\n});" },
    { label: 'console.log',   insert: 'console.log(${1:item});' },
    { label: 'setTimeout',    insert: 'setTimeout(() => {\n\t${0}\n}, ${1:1000});' },
    { label: 'fetch',         insert: "fetch('${1:url}')\n\t.then(res => res.json())\n\t.then(data => {\n\t\t${0}\n\t});" },
    { label: 'async-function', insert: 'async function ${1:name}(${2:params}) {\n\t${0}\n}' },
    { label: 'try-catch',      insert: 'try {\n\t${0}\n} catch (error) {\n\tconsole.error(error);\n}' },
  ],
  json: [
    { label: 'key-value', insert: '"${1:key}": "${2:value}"' },
    { label: 'object',    insert: '"${1:key}": {\n\t${0}\n}' },
    { label: 'array',     insert: '"${1:key}": [\n\t${0}\n]' },
  ],
  markdown: [
    { label: 'h1', insert: '# ${1:Title}' },
    { label: 'h2', insert: '## ${1:Subtitle}' },
    { label: 'bold', insert: '**${1:text}**' },
    { label: 'italic', insert: '*${1:text}*' },
    { label: 'link', insert: '[${1:text}](${2:url})' },
    { label: 'code', insert: '```${1:javascript}\n${0}\n```' },
  ]
};


let monacoReady = false;
let pendingOpen = null;

function initMonaco() {
  if (typeof window.require !== 'function') {
    showNotif('Editor runtime unavailable. Check internet connection for Monaco CDN.', 'warn');
    return;
  }
  window.MonacoEnvironment = {
    getWorkerUrl: function (workerId, label) {
      const getWorkerBlob = (content) => URL.createObjectURL(new Blob([content], { type: 'application/javascript' }));
      const cdn = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/';
      if (label === 'json') return getWorkerBlob(`importScripts('${cdn}vs/language/json/jsonWorker.js');`);
      if (label === 'css' || label === 'scss' || label === 'less') return getWorkerBlob(`importScripts('${cdn}vs/language/css/cssWorker.js');`);
      if (label === 'html' || label === 'handlebars' || label === 'razor') return getWorkerBlob(`importScripts('${cdn}vs/language/html/htmlWorker.js');`);
      if (label === 'typescript' || label === 'javascript') return getWorkerBlob(`importScripts('${cdn}vs/language/typescript/tsWorker.js');`);
      return getWorkerBlob(`importScripts('${cdn}vs/base/worker/workerMain.js');`);
    }
  };
  require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
  require(['vs/editor/editor.main'], () => {
    monacoReady = true;
    defineMonacoThemes();
    monaco.editor.setTheme(state.currentTheme);
    
    // Register custom suggestions
    registerMonacoSuggestions();

    if (pendingOpen) { showEditor(pendingOpen); pendingOpen = null; }
    else {
      // Auto-open package.json so editor is visible immediately
      window.openFileByName('package.json');
    }
  });
}

function showEditor(file) {
  const area = document.getElementById('editor-area');
  // Clear previous content
  area.innerHTML = '';
  if (!monacoReady) {
    pendingOpen = file;
    area.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--fg-dim);font-size:14px;">â³ Loading editorâ€¦</div>`;
    return;
  }
  const container = document.createElement('div');
  container.id = 'monaco-editor';
  container.style.cssText = 'width:100%;height:100%;';
  area.appendChild(container);
  const langMap = { html: 'html', css: 'css', js: 'javascript', json: 'json', md: 'markdown', ts: 'typescript', gitignore: 'plaintext' };
  const ext = file.name.split('.').pop().toLowerCase();
  const ed = monaco.editor.create(container, {
    value: file.content || '',
    language: langMap[ext] || 'plaintext',
    theme: state.currentTheme,
    fontSize: 14,
    fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace",
    fontLigatures: true,
    minimap: { enabled: true },
    wordWrap: 'off',
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    renderLineHighlight: 'all',
    bracketPairColorization: { enabled: true },
    automaticLayout: true,
    padding: { top: 10 },
    lineNumbers: 'on',
    folding: true,
    quickSuggestions: { other: true, comments: false, strings: true },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    wordBasedSuggestions: 'currentDocument',
    suggest: { showKeywords: true, showSnippets: true, showClasses: true, showFunctions: true, showVariables: true, showWords: true },
  });
  state.editorInstances[file.name] = ed;
  
  // Custom suggest bar removed in favor of Monaco built-in autocomplete
  // attachSuggestBar(ed, langMap[ext] || 'plaintext');
  ed.onDidChangeModelContent(() => { file.content = ed.getValue(); });
  ed.onDidChangeCursorPosition(e => {
    state.cursorPos = { ln: e.position.lineNumber, col: e.position.column };
    document.getElementById('status-cursor').textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
  });
}

// ---------- WELCOME PAGE ----------
function welcomeHTML() {
  return `<h1>Visual Studio Code</h1>
  <p class="subtitle">Editing evolved</p>
  <div class="welcome-cols">
    <div class="welcome-col">
      <h3>Start</h3>
      <div class="welcome-link" onclick="openFileByName('index.html')">&#128196; Open index.html</div>
      <div class="welcome-link" onclick="openFileByName('style.css')">&#128196; Open style.css</div>
      <div class="welcome-link" onclick="openFileByName('script.js')">&#128196; Open script.js</div>
    </div>
    <div class="welcome-col">
      <h3>Help</h3>
      <div class="welcome-link">&#9654; Show All Commands <kbd>Ctrl+Shift+P</kbd></div>
      <div class="welcome-link">&#9000; Keyboard Shortcuts <kbd>Ctrl+K Ctrl+S</kbd></div>
      <div class="welcome-link">&#128196; Documentation</div>
    </div>
  </div>`;
}

window.openFileByName = function(name) {
  function findFile(nodes) { for (const n of nodes) { if (n.type === 'file' && n.name === name) return n; if (n.children) { const f = findFile(n.children); if (f) return f; } } return null; }
  const f = findFile(fileTree);
  if (f) openFile(f);
};

function getActiveEditor() {
  return state.editorInstances[state.activeTab?.name] || null;
}

function runEditorAction(actionId, missingEditorMessage = 'Open a file in the editor first.') {
  const ed = getActiveEditor();
  if (!ed) {
    showNotif(missingEditorMessage, 'warn');
    return;
  }
  const action = ed.getAction(actionId);
  if (!action) {
    showNotif('That action is not available right now.', 'warn');
    return;
  }
  action.run();
  ed.focus();
}

function runEditorCommand(commandId, missingEditorMessage = 'Open a file in the editor first.') {
  const ed = getActiveEditor();
  if (!ed) {
    showNotif(missingEditorMessage, 'warn');
    return;
  }
  ed.trigger('keyboard', commandId, null);
  ed.focus();
}

function findParentFolder(nodes, child) {
  for (const node of nodes) {
    if (node.children?.includes(child)) return node;
    if (node.children) {
      const nested = findParentFolder(node.children, child);
      if (nested) return nested;
    }
  }
  return null;
}

function collectFiles(nodes, prefix = '', list = []) {
  nodes.forEach(node => {
    const nodePath = prefix ? `${prefix}/${node.name}` : node.name;
    if (node.type === 'file') {
      list.push({ file: node, path: nodePath });
      return;
    }
    if (node.children) collectFiles(node.children, nodePath, list);
  });
  return list;
}

function openFileQuickPick(placeholder = '> Open File...') {
  const files = collectFiles(fileTree);
  if (!files.length) {
    showNotif('No files found in this workspace.', 'warn');
    return;
  }
  const items = files.map(({ file, path }) => {
    const ext = file.name.split('.').pop().toLowerCase();
    return {
      label: path,
      key: langLabel(ext),
      action: () => openFile(file),
    };
  });
  showCmdPalette(items, placeholder);
}

function saveCurrentFile() {
  if (!state.activeTab) {
    showNotif('No active file to save.', 'warn');
    return;
  }
  showNotif(`Saved ${state.activeTab.name}`, 'info');
}

function saveCurrentFileAs() {
  const file = state.activeTab;
  if (!file) {
    showNotif('No active file to save.', 'warn');
    return;
  }
  const oldName = file.name;
  const proposed = prompt('Save As:', oldName);
  if (!proposed || proposed === oldName) return;
  const parent = findParentFolder(fileTree, file);
  if (parent?.children?.some(child => child !== file && child.name === proposed)) {
    showNotif('A file with that name already exists.', 'warn');
    return;
  }
  file.name = proposed;
  if (state.editorInstances[oldName]) {
    state.editorInstances[proposed] = state.editorInstances[oldName];
    delete state.editorInstances[oldName];
  }
  renderTabs();
  updateBreadcrumb(file);
  updateStatusBar(file);
  buildExplorer();
  showNotif(`Saved as ${proposed}`, 'info');
}

function renameWorkspaceFolder() {
  const root = fileTree[0];
  if (!root) return;
  const nextName = prompt('Workspace folder name:', root.name);
  if (!nextName || nextName === root.name) return;
  root.name = nextName;
  buildExplorer();
  if (state.activeTab) updateBreadcrumb(state.activeTab);
  showNotif(`Workspace folder set to ${nextName}`, 'info');
}

function goFileHistory(step) {
  if (!state.fileHistory.length) {
    showNotif('No file history yet.', 'warn');
    return;
  }
  const nextIndex = state.fileHistoryIndex + step;
  if (nextIndex < 0 || nextIndex >= state.fileHistory.length) {
    showNotif(step < 0 ? 'No previous file.' : 'No next file.', 'warn');
    return;
  }
  state.fileHistoryIndex = nextIndex;
  openFile(state.fileHistory[nextIndex], { recordHistory: false });
}

function goToLineColumnPrompt() {
  const ed = getActiveEditor();
  if (!ed) {
    showNotif('Open a file in the editor first.', 'warn');
    return;
  }
  const value = prompt('Go to line[:column]', `${state.cursorPos.ln}:${state.cursorPos.col}`);
  if (!value) return;
  const match = value.trim().match(/^(\d+)(?::|,)?(\d+)?$/);
  if (!match) {
    showNotif('Use line or line:column format.', 'warn');
    return;
  }
  const model = ed.getModel();
  const lineCount = model?.getLineCount?.() || 1;
  const lineNumber = Math.max(1, Math.min(lineCount, Number(match[1])));
  const maxColumn = model?.getLineMaxColumn?.(lineNumber) || 1;
  const column = Math.max(1, Math.min(maxColumn, Number(match[2] || 1)));
  ed.setPosition({ lineNumber, column });
  ed.revealPositionInCenter({ lineNumber, column });
  ed.focus();
}

function openWorkspaceSymbolPicker() {
  const symbolItems = [];
  const symbolRegexes = [
    { regex: /^\s*function\s+([A-Za-z_$][\w$]*)/gm, kind: 'fn' },
    { regex: /^\s*class\s+([A-Za-z_$][\w$]*)/gm, kind: 'class' },
    { regex: /^\s*const\s+([A-Za-z_$][\w$]*)\s*=/gm, kind: 'const' },
    { regex: /^\s*let\s+([A-Za-z_$][\w$]*)\s*=/gm, kind: 'let' },
  ];
  collectFiles(fileTree).forEach(({ file, path }) => {
    const text = file.content || '';
    symbolRegexes.forEach(({ regex, kind }) => {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const source = text.slice(0, match.index);
        const line = source.split('\n').length;
        const name = match[1];
        symbolItems.push({
          label: `${name} (${kind})`,
          key: `${path}:${line}`,
          action: () => {
            openFile(file);
            setTimeout(() => {
              const ed = getActiveEditor();
              if (!ed) return;
              ed.setPosition({ lineNumber: line, column: 1 });
              ed.revealLineInCenter(line);
              ed.focus();
            }, 0);
          },
        });
      }
    });
  });
  if (!symbolItems.length) {
    showNotif('No workspace symbols found.', 'warn');
    return;
  }
  showCmdPalette(symbolItems, '> Go to Symbol in Workspace');
}

function startRunSession(mode, options = {}) {
  state.isDebugging = mode === 'debug';
  if (!state.panelVisible) togglePanel();
  switchPanelTab('DEBUG');
  const body = document.getElementById('panel-body');
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  body.innerHTML = `<div class="terminal-line t-out">${mode === 'debug' ? 'Debug session' : 'Run session'} started at ${now}.</div>`;
  if (options.notify !== false) {
    showNotif(mode === 'debug' ? 'Debugging started.' : 'Running without debugging.', 'info');
  }
}

function stopRunSession() {
  if (!state.isDebugging) {
    showNotif('No active debug session.', 'warn');
    return;
  }
  state.isDebugging = false;
  if (!state.panelVisible) togglePanel();
  switchPanelTab('DEBUG');
  document.getElementById('panel-body').innerHTML = '<div class="terminal-line t-out">Debug session stopped.</div>';
  showNotif('Debugging stopped.', 'info');
}

function restartRunSession() {
  startRunSession('debug', { notify: false });
  showNotif('Debugging restarted.', 'info');
}

function toggleBreakpointAtCursor() {
  const ed = getActiveEditor();
  if (!ed) {
    showNotif('Open a file to toggle breakpoints.', 'warn');
    return;
  }
  const lineNumber = ed.getPosition()?.lineNumber || 1;
  showNotif(`Breakpoint toggled at line ${lineNumber}.`, 'info');
}

function runTerminalTask(command, lines = []) {
  if (!state.panelVisible) togglePanel();
  switchPanelTab('TERMINAL');
  state.terminalLines.push({ type: 'prompt', cwd: state.terminalCwd, cmd: command });
  lines.forEach(line => state.terminalLines.push(line));
  renderTerminal();
}

function showRunTaskPicker() {
  const tasks = [
    { label: 'npm: install', key: 'task', action: () => runTerminalTask('npm install', [{ type: 'success', text: 'added 248 packages in 3.2s' }]) },
    { label: 'npm: run dev', key: 'task', action: () => runTerminalTask('npm run dev', [{ type: 'success', text: 'VITE v5.0.0 ready in 312 ms' }, { type: 'out', text: 'Local: http://localhost:5173/' }]) },
    { label: 'npm: run build', key: 'task', action: () => runTerminalTask('npm run build', [{ type: 'success', text: 'Build completed successfully.' }]) },
  ];
  showCmdPalette(tasks, '> Run Task');
}

// ---------- TERMINAL ----------
function initTerminal() {
  const body = document.getElementById('panel-body');
  body.innerHTML = '';
  state.terminalLines = [
    { type: 'out', text: 'Windows PowerShell' },
    { type: 'out', text: 'Copyright (C) Microsoft Corporation. All rights reserved.' },
    { type: 'out', text: '' },
  ];
  renderTerminal();
}

function renderTerminal() {
  const body = document.getElementById('panel-body');
  const atBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 10;
  body.innerHTML = '';
  state.terminalLines.forEach(line => {
    const el = document.createElement('div');
    el.className = 'terminal-line';
    if (line.type === 'prompt') {
      el.innerHTML = `<span class="t-prompt">${line.cwd}&gt;</span> <span class="t-cmd">${line.cmd}</span>`;
    } else {
      el.className += ' t-' + line.type;
      el.textContent = line.text;
    }
    body.appendChild(el);
  });
  // input line
  const inputLine = document.createElement('div');
  inputLine.className = 'terminal-input-line';
  inputLine.innerHTML = `<span class="t-prompt">${state.terminalCwd}&gt;</span><input id="terminal-input" autocomplete="off" spellcheck="false">`;
  body.appendChild(inputLine);
  const inp = document.getElementById('terminal-input');
  inp.focus();
  setTimeout(() => inp.focus(), 50);
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const cmd = inp.value.trim();
      state.terminalLines.push({ type: 'prompt', cwd: state.terminalCwd, cmd });
      if (cmd) processTerminalCmd(cmd);
      renderTerminal();
      setTimeout(() => { const i = document.getElementById('terminal-input'); if (i) i.focus(); }, 30);
    }
  });
  if (atBottom) body.scrollTop = body.scrollHeight;
}

function processTerminalCmd(cmd) {
  const parts = cmd.split(' ');
  const base = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ');
  if (base === 'clear' || base === 'cls') { state.terminalLines = []; return; }
  if (base === 'echo') { state.terminalLines.push({ type: 'out', text: arg }); return; }
  if (base === 'date') { state.terminalLines.push({ type: 'out', text: new Date().toString() }); return; }
  if (base === 'dir' || base === 'ls') {
    state.terminalLines.push({ type: 'out', text: '    Directory: ' + state.terminalCwd });
    state.terminalLines.push({ type: 'out', text: '' });
    state.terminalLines.push({ type: 'out', text: 'Mode    Name' });
    state.terminalLines.push({ type: 'out', text: '----    ----' });
    state.terminalLines.push({ type: 'out', text: 'd----   src' });
    state.terminalLines.push({ type: 'out', text: '-a---   package.json' });
    state.terminalLines.push({ type: 'out', text: '-a---   README.md' });
    return;
  }
  if (base === 'cd') {
    if (arg === '..') { const p = state.terminalCwd.split('\\'); p.pop(); state.terminalCwd = p.join('\\') || 'C:\\'; }
    else if (arg) state.terminalCwd = state.terminalCwd + '\\' + arg;
    return;
  }
  if (base === 'npm') {
    if (arg === 'install' || arg === 'i') { state.terminalLines.push({ type: 'success', text: 'added 248 packages in 3.2s' }); return; }
    if (arg === 'run dev') { state.terminalLines.push({ type: 'success', text: '  VITE v5.0.0  ready in 312 ms' }); state.terminalLines.push({ type: 'out', text: '  âžœ  Local: http://localhost:5173/' }); return; }
    state.terminalLines.push({ type: 'out', text: 'npm ' + arg + ' executed' }); return;
  }
  if (base === 'node') { state.terminalLines.push({ type: 'out', text: 'Node.js v20.11.0' }); return; }
  if (base === 'git') {
    if (arg.startsWith('status')) { state.terminalLines.push({ type: 'out', text: 'On branch main\nChanges not staged for commit:\n  modified:   BABA.html\n  new file:   style.css\n  new file:   script.js' }); return; }
    if (arg.startsWith('add')) { state.terminalLines.push({ type: 'success', text: 'Changes staged.' }); return; }
    if (arg.startsWith('commit')) { state.terminalLines.push({ type: 'success', text: '[main abc1234] ' + arg.replace(/commit -m ?/, '') }); return; }
    state.terminalLines.push({ type: 'out', text: 'git: ' + arg }); return;
  }
  if (base === 'help') {
    ['clear/cls - clear terminal', 'dir/ls - list files', 'cd - change directory', 'echo - print text', 'npm - node package manager', 'git - git commands', 'node - run node.js', 'date - show date'].forEach(l => state.terminalLines.push({ type: 'out', text: '  ' + l }));
    return;
  }
  state.terminalLines.push({ type: 'err', text: `'${base}' is not recognized as a command. Type 'help' for commands.` });
}

// ---------- PANEL TABS ----------
function switchPanelTab(name) {
  state.panelTab = name;
  document.querySelectorAll('.panel-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  const body = document.getElementById('panel-body');
  if (name === 'TERMINAL') { if (!state.terminalLines.length) initTerminal(); else renderTerminal(); }
  else if (name === 'PROBLEMS') {
    body.innerHTML = [
      { level: 'error', msg: "Expected ';' but found ','", file: 'script.js:42', icon: 'âœ–' },
      { level: 'warn', msg: "'var' is deprecated, use 'const' or 'let'", file: 'script.js:87', icon: 'âš ' },
    ].map(p => `<div class="problem-item"><span class="problem-icon prob-${p.level}">${p.icon}</span><div><div class="problem-msg">${p.msg}</div><div class="problem-file">${p.file}</div></div></div>`).join('');
  } else if (name === 'OUTPUT') {
    body.innerHTML = '<div class="terminal-line t-out">[2026-03-14 13:34:06] Extension host started.</div><div class="terminal-line t-success">[2026-03-14 13:34:07] Monaco editor loaded.</div>';
  } else if (name === 'DEBUG') {
    body.innerHTML = '<div class="terminal-line t-out">Debugger ready. Press F5 to start debugging.</div>';
  }
}

// ---------- STATUS BAR ----------
function updateStatusBar(file) {
  const ext = file ? file.name.split('.').pop().toLowerCase() : '';
  document.getElementById('status-lang').textContent = file ? langLabel(ext) : 'Plain Text';
}

function showThemePicker() {
  openThemePickerOverlay();
}

// ---------- COMMAND PALETTE ----------
const commands = [
  { label: 'View: Toggle Sidebar Visibility', key: 'Ctrl+B', action: () => toggleSidebar() },
  { label: 'View: Toggle Panel', key: 'Ctrl+J', action: () => togglePanel() },
  { label: 'View: Toggle Terminal', key: 'Ctrl+`', action: () => { if (!state.panelVisible) togglePanel(); switchPanelTab('TERMINAL'); } },
  { label: 'View: Toggle Full Screen', key: 'F11', action: () => toggleFullScreen() },
  { label: 'View: Toggle Word Wrap', key: 'Alt+Z', action: () => toggleWordWrap() },
  { label: 'View: Toggle Minimap', key: '', action: () => toggleMinimap() },
  { label: 'View: Zoom In', key: 'Ctrl+=', action: () => zoomIn() },
  { label: 'View: Zoom Out', key: 'Ctrl+-', action: () => zoomOut() },
  { label: 'View: Reset Zoom', key: 'Ctrl+0', action: () => zoomReset() },
  { label: 'File: New File', key: 'Ctrl+N', action: () => createNewFile() },
  { label: 'File: Save', key: 'Ctrl+S', action: () => saveCurrentFile() },
  { label: 'File: Save As...', key: 'Ctrl+Shift+S', action: () => saveCurrentFileAs() },
  { label: 'File: Save All', key: 'Ctrl+K S', action: () => showNotif('All files saved.', 'info') },
  { label: 'File: Open File...', key: 'Ctrl+O', action: () => openFileQuickPick('> Open File...') },
  { label: 'File: Revert File', key: '', action: () => revertFile() },
  { label: 'File: Close Editor', key: 'Ctrl+W', action: () => closeActiveEditor() },
  { label: 'File: Close All Editors', key: 'Ctrl+K Ctrl+W', action: () => closeAllEditors() },
  { label: 'File: Auto Save', key: '', action: () => toggleAutoSave() },
  { label: 'Go to File...', key: 'Ctrl+P', action: () => openFileQuickPick('> Go to File...') },
  { label: 'Go to Line/Column...', key: 'Ctrl+G', action: () => goToLineColumnPrompt() },
  { label: 'Go to Symbol in Workspace...', key: 'Ctrl+T', action: () => openWorkspaceSymbolPicker() },
  { label: 'Go to Definition', key: 'F12', action: () => goToDefinition() },
  { label: 'Go to Beginning of File', key: 'Ctrl+Home', action: () => goToBeginningOfFile() },
  { label: 'Go to End of File', key: 'Ctrl+End', action: () => goToEndOfFile() },
  { label: 'Edit: Format Document', key: 'Shift+Alt+F', action: () => formatDocument() },
  { label: 'Edit: Toggle Line Comment', key: 'Ctrl+/', action: () => toggleLineComment() },
  { label: 'Edit: Toggle Block Comment', key: 'Shift+Alt+A', action: () => toggleBlockComment() },
  { label: 'Edit: Delete Line', key: 'Ctrl+Shift+K', action: () => deleteLine() },
  { label: 'Edit: Duplicate Line Down', key: 'Shift+Alt+Down', action: () => duplicateLine() },
  { label: 'Selection: Select All Occurrences', key: 'Ctrl+Shift+L', action: () => selectAllOccurrences() },
  { label: 'Selection: Select Current Line', key: 'Ctrl+L', action: () => selectCurrentLine() },
  { label: 'Selection: Add Cursor Above', key: 'Ctrl+Alt+Up', action: () => addCursorAbove() },
  { label: 'Selection: Add Cursor Below', key: 'Ctrl+Alt+Down', action: () => addCursorBelow() },
  { label: 'Source Control: Commit', key: '', action: () => { switchPanel('git'); hideCmdPalette(); } },
  { label: 'Extensions: Open Extensions', key: 'Ctrl+Shift+X', action: () => { switchPanel('extensions'); hideCmdPalette(); } },
  { label: 'Terminal: New Terminal', key: 'Ctrl+Shift+`', action: () => { if (!state.panelVisible) togglePanel(); switchPanelTab('TERMINAL'); initTerminal(); } },
  { label: 'Terminal: Clear Terminal', key: '', action: () => clearTerminal() },
  { label: 'Terminal: Focus Terminal', key: 'Ctrl+`', action: () => focusTerminal() },
  { label: 'Run: Start Debugging', key: 'F5', action: () => startRunSession('debug') },
  { label: 'Run: Stop Debugging', key: 'Shift+F5', action: () => stopRunSession() },
  { label: 'Run: Toggle Breakpoint', key: 'F9', action: () => toggleBreakpointAtCursor() },
  { label: 'Preferences: Color Theme', key: 'Ctrl+K Ctrl+T', action: () => showThemePicker() },
  { label: 'Developer: Toggle DevTools', key: '', action: () => showNotif('DevTools not available here', 'warn') },
];

let cmdSelected = 0;
let activeCommandEntries = commands;
function showCmdPalette(items = commands, placeholder = '> Type a command...') {
  activeCommandEntries = items;
  const ov = document.getElementById('cmd-overlay');
  ov.classList.add('show');
  const inp = document.getElementById('cmd-input');
  inp.value = '';
  inp.placeholder = placeholder;
  inp.focus();
  renderCmdList(activeCommandEntries);
}
function hideCmdPalette() { document.getElementById('cmd-overlay').classList.remove('show'); }
function renderCmdList(items) {
  cmdSelected = 0;
  const list = document.getElementById('cmd-list');
  list.innerHTML = items.map((c, i) => `<div class="cmd-item ${i === 0 ? 'selected' : ''}" data-idx="${i}"><span class="cmd-item-label">${c.label}</span><span class="cmd-item-key">${c.key}</span></div>`).join('');
  list.querySelectorAll('.cmd-item').forEach(el => {
    el.addEventListener('mouseenter', () => { list.querySelectorAll('.cmd-item').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); cmdSelected = +el.dataset.idx; });
    el.addEventListener('click', () => { const c = items[+el.dataset.idx]; if (c) { hideCmdPalette(); c.action(); } });
  });
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cmd-input').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    const filtered = q ? activeCommandEntries.filter(c => c.label.toLowerCase().includes(q)) : activeCommandEntries;
    renderCmdList(filtered);
  });
  document.getElementById('cmd-input').addEventListener('keydown', e => {
    const items = document.querySelectorAll('.cmd-item');
    if (e.key === 'ArrowDown') { items[cmdSelected]?.classList.remove('selected'); cmdSelected = Math.min(cmdSelected + 1, items.length - 1); items[cmdSelected]?.classList.add('selected'); items[cmdSelected]?.scrollIntoView({ block: 'nearest' }); e.preventDefault(); }
    if (e.key === 'ArrowUp') { items[cmdSelected]?.classList.remove('selected'); cmdSelected = Math.max(cmdSelected - 1, 0); items[cmdSelected]?.classList.add('selected'); items[cmdSelected]?.scrollIntoView({ block: 'nearest' }); e.preventDefault(); }
    if (e.key === 'Enter') { items[cmdSelected]?.click(); }
    if (e.key === 'Escape') hideCmdPalette();
  });
  document.getElementById('cmd-overlay').addEventListener('click', e => { if (e.target === document.getElementById('cmd-overlay')) hideCmdPalette(); });
});

// ---------- CONTEXT MENU ----------
function showCtxMenu(e, file) {
  e.preventDefault();
  const menu = document.getElementById('ctx-menu');
  menu.innerHTML = [
    { label: 'Open', action: () => openFile(file) },
    { label: 'Rename', action: () => { const n = prompt('Rename to:', file.name); if (n) { file.name = n; buildExplorer(); if (state.activeTab === file) renderTabs(); } } },
    { label: 'Delete', action: () => { if (confirm(`Delete ${file.name}?`)) { closeTab(file); buildExplorer(); showNotif(`${file.name} deleted`, 'info'); } } },
    null,
    { label: 'Copy Path', action: () => { navigator.clipboard?.writeText('C:\\Users\\okoye\\vscode-clone\\' + file.name); showNotif('Path copied!', 'info'); } },
    { label: 'Copy Relative Path', action: () => { navigator.clipboard?.writeText(file.name); showNotif('Relative path copied!', 'info'); } },
  ].map(item => item ? `<div class="ctx-item" data-label="${item.label}">${item.label}</div>` : '<div class="ctx-sep"></div>').join('');
  menu.style.left = Math.min(e.clientX, window.innerWidth - 200) + 'px';
  menu.style.top = Math.min(e.clientY, window.innerHeight - 200) + 'px';
  menu.classList.add('show');
  menu.querySelectorAll('.ctx-item').forEach(el => {
    el.addEventListener('click', () => {
      const item = [{ label: 'Open', action: () => openFile(file) }, { label: 'Rename', action: () => { const n = prompt('Rename to:', file.name); if (n) { file.name = n; buildExplorer(); if (state.activeTab === file) renderTabs(); } } }, { label: 'Delete', action: () => { if (confirm(`Delete ${file.name}?`)) { closeTab(file); buildExplorer(); showNotif(`${file.name} deleted`, 'info'); } } }, null, { label: 'Copy Path', action: () => { navigator.clipboard?.writeText('C:\\\\Users\\\\okoye\\\\vscode-clone\\\\' + file.name); showNotif('Path copied!', 'info'); } }, { label: 'Copy Relative Path', action: () => { navigator.clipboard?.writeText(file.name); showNotif('Relative path copied!', 'info'); } }].find(i => i?.label === el.dataset.label);
      if (item) { menu.classList.remove('show'); item.action(); }
    });
  });
}
document.addEventListener('click', () => document.getElementById('ctx-menu')?.classList.remove('show'));

// ---------- NOTIFICATIONS ----------
function ensureNotifArea() {
  let area = document.getElementById('notif-area');
  if (area) return area;
  area = document.createElement('div');
  area.id = 'notif-area';
  area.className = 'notif-area';
  document.body.appendChild(area);
  return area;
}

function showNotif(msg, type = 'info') {
  const area = ensureNotifArea();
  const icons = { info: 'â„¹', warn: 'âš ', error: 'âœ–' };
  const el = document.createElement('div');
  el.className = `notif notif-${type}`;
  el.innerHTML = `<span class="notif-icon">${icons[type]}</span><span style="flex:1">${msg}</span><span class="notif-close">âœ•</span>`;
  area.appendChild(el);
  el.querySelector('.notif-close').addEventListener('click', () => el.remove());
  setTimeout(() => el.remove(), 4000);
}

// ---------- TOGGLE HELPERS ----------
function toggleSidebar() {
  state.sidebarVisible = !state.sidebarVisible;
  document.getElementById('sidebar').classList.toggle('hidden', !state.sidebarVisible);
}
function togglePanel() {
  state.panelVisible = !state.panelVisible;
  document.getElementById('panel').classList.toggle('hidden', !state.panelVisible);
  if (state.panelVisible) switchPanelTab(state.panelTab);
}

// ---------- RESIZE HANDLES ----------
function initResize() {
  const handle = document.getElementById('sidebar-resize');
  let dragging = false, startX = 0, startW = 0;
  handle.addEventListener('mousedown', e => {
    dragging = true; startX = e.clientX; startW = document.getElementById('sidebar').offsetWidth;
    document.getElementById('drag-overlay').style.display = 'block';
    handle.classList.add('dragging');
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const w = Math.max(150, Math.min(500, startW + e.clientX - startX));
    document.getElementById('sidebar').style.width = w + 'px';
  });
  document.addEventListener('mouseup', () => { dragging = false; document.getElementById('drag-overlay').style.display = ''; handle.classList.remove('dragging'); });

  const vHandle = document.getElementById('panel-resize');
  let vDragging = false, startY = 0, startH = 0;
  vHandle.addEventListener('mousedown', e => {
    vDragging = true; startY = e.clientY; startH = document.getElementById('panel').offsetHeight;
    const ov = document.getElementById('drag-overlay'); ov.style.display = 'block'; ov.className = 'drag-overlay row';
    vHandle.classList.add('dragging');
  });
  document.addEventListener('mousemove', e => {
    if (!vDragging) return;
    const h = Math.max(80, Math.min(600, startH + startY - e.clientY));
    document.getElementById('panel').style.height = h + 'px';
  });
  document.addEventListener('mouseup', () => { vDragging = false; const ov = document.getElementById('drag-overlay'); ov.style.display = ''; ov.className = 'drag-overlay'; vHandle.classList.remove('dragging'); });
}

// ---------- EDITOR OPTION TOGGLES ----------
function toggleWordWrap() {
  state.wordWrap = !state.wordWrap;
  Object.values(state.editorInstances).forEach(ed => ed?.updateOptions({ wordWrap: state.wordWrap ? 'on' : 'off' }));
  showNotif(`Word Wrap ${state.wordWrap ? 'On' : 'Off'}`, 'info');
}

function toggleMinimap() {
  state.minimap = !state.minimap;
  Object.values(state.editorInstances).forEach(ed => ed?.updateOptions({ minimap: { enabled: state.minimap } }));
  showNotif(`Minimap ${state.minimap ? 'On' : 'Off'}`, 'info');
}

function toggleAutoSave() {
  state.autoSave = !state.autoSave;
  showNotif(`Auto Save ${state.autoSave ? 'Enabled' : 'Disabled'}`, 'info');
}

function zoomIn() {
  state.zoomLevel = Math.min(state.zoomLevel + 1, 5);
  document.documentElement.style.fontSize = (13 + state.zoomLevel * 1.5) + 'px';
  showNotif(`Zoom: ${100 + state.zoomLevel * 10}%`, 'info');
}

function zoomOut() {
  state.zoomLevel = Math.max(state.zoomLevel - 1, -3);
  document.documentElement.style.fontSize = (13 + state.zoomLevel * 1.5) + 'px';
  showNotif(`Zoom: ${100 + state.zoomLevel * 10}%`, 'info');
}

function zoomReset() {
  state.zoomLevel = 0;
  document.documentElement.style.fontSize = '';
  showNotif('Zoom Reset to 100%', 'info');
}

function closeActiveEditor() {
  if (!state.activeTab) { showNotif('No active editor to close.', 'warn'); return; }
  closeTab(state.activeTab);
}

function closeAllEditors() {
  if (!state.tabs.length) { showNotif('No open editors.', 'warn'); return; }
  [...state.tabs].forEach(t => closeTab(t));
}

function revertFile() {
  const file = state.activeTab;
  if (!file) { showNotif('No active file to revert.', 'warn'); return; }
  const ed = getActiveEditor();
  if (ed) ed.setValue(file.content || '');
  showNotif(`Reverted ${file.name}`, 'info');
}

function duplicateLine() {
  runEditorAction('editor.action.copyLinesDownAction');
}

function deleteLine() {
  runEditorAction('editor.action.deleteLines');
}

function toggleLineComment() {
  runEditorAction('editor.action.commentLine');
}

function toggleBlockComment() {
  runEditorAction('editor.action.blockComment');
}

function formatDocument() {
  runEditorAction('editor.action.formatDocument');
}

function indentLine() {
  runEditorCommand('tab');
}

function outdentLine() {
  runEditorAction('editor.action.outdentLines');
}

function addCursorAbove() {
  runEditorAction('editor.action.insertCursorAbove');
}

function addCursorBelow() {
  runEditorAction('editor.action.insertCursorBelow');
}

function selectCurrentLine() {
  runEditorAction('expandLineSelection');
}

function selectAllOccurrences() {
  runEditorAction('editor.action.selectHighlights');
}

function goToDefinition() {
  runEditorAction('editor.action.revealDefinition');
}

function goToBeginningOfFile() {
  const ed = getActiveEditor();
  if (!ed) { showNotif('Open a file first.', 'warn'); return; }
  ed.setPosition({ lineNumber: 1, column: 1 });
  ed.revealPosition({ lineNumber: 1, column: 1 });
  ed.focus();
}

function goToEndOfFile() {
  const ed = getActiveEditor();
  if (!ed) { showNotif('Open a file first.', 'warn'); return; }
  const model = ed.getModel();
  const lineCount = model.getLineCount();
  const col = model.getLineMaxColumn(lineCount);
  ed.setPosition({ lineNumber: lineCount, column: col });
  ed.revealPosition({ lineNumber: lineCount, column: col });
  ed.focus();
}

function debugStepOver() {
  if (!state.isDebugging) { showNotif('No active debug session.', 'warn'); return; }
  showNotif('Step Over', 'info');
}

function debugStepInto() {
  if (!state.isDebugging) { showNotif('No active debug session.', 'warn'); return; }
  showNotif('Step Into', 'info');
}

function debugStepOut() {
  if (!state.isDebugging) { showNotif('No active debug session.', 'warn'); return; }
  showNotif('Step Out', 'info');
}

function debugContinue() {
  if (!state.isDebugging) { showNotif('No active debug session.', 'warn'); return; }
  showNotif('Continue', 'info');
}

function clearTerminal() {
  state.terminalLines = [];
  if (!state.panelVisible) togglePanel();
  switchPanelTab('TERMINAL');
  renderTerminal();
}

function focusTerminal() {
  if (!state.panelVisible) togglePanel();
  switchPanelTab('TERMINAL');
  setTimeout(() => document.getElementById('terminal-input')?.focus(), 50);
}

function toggleFullScreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

// ---------- TITLE DROP DOWNS ----------
const titleMenus = {
  'menu-file': [
    { label: 'New File', key: 'Ctrl+N', action: () => createNewFile() },
    { label: 'New Folder', key: '', action: () => createNewFolder() },
    { label: 'New Window', key: 'Ctrl+Shift+N', action: () => { const t = window.open(window.location.href, '_blank'); if (!t) showNotif('Pop-up blocked by browser.', 'warn'); } },
    null,
    { label: 'Open File...', key: 'Ctrl+O', action: () => openFileQuickPick('> Open File...') },
    { label: 'Open Folder...', key: 'Ctrl+K Ctrl+O', action: () => renameWorkspaceFolder() },
    null,
    { label: 'Save', key: 'Ctrl+S', action: () => saveCurrentFile() },
    { label: 'Save As...', key: 'Ctrl+Shift+S', action: () => saveCurrentFileAs() },
    { label: 'Save All', key: 'Ctrl+K S', action: () => { state.tabs.forEach(() => {}); showNotif('All files saved.', 'info'); } },
    null,
    { label: 'Auto Save', key: '', action: () => toggleAutoSave() },
    null,
    { label: 'Revert File', key: '', action: () => revertFile() },
    { label: 'Close Editor', key: 'Ctrl+W', action: () => closeActiveEditor() },
    { label: 'Close All Editors', key: 'Ctrl+K Ctrl+W', action: () => closeAllEditors() },
    null,
    { label: 'Exit', key: '', action: () => { if (confirm('Close VS Code?')) window.close(); } },
  ],
  'menu-edit': [
    { label: 'Undo', key: 'Ctrl+Z', action: () => runEditorCommand('undo') },
    { label: 'Redo', key: 'Ctrl+Y', action: () => runEditorCommand('redo') },
    null,
    { label: 'Cut', key: 'Ctrl+X', action: () => runEditorAction('editor.action.clipboardCutAction') },
    { label: 'Copy', key: 'Ctrl+C', action: () => runEditorAction('editor.action.clipboardCopyAction') },
    { label: 'Paste', key: 'Ctrl+V', action: () => runEditorAction('editor.action.clipboardPasteAction') },
    null,
    { label: 'Find', key: 'Ctrl+F', action: () => runEditorAction('actions.find') },
    { label: 'Replace', key: 'Ctrl+H', action: () => runEditorAction('editor.action.startFindReplaceAction') },
    { label: 'Find in Files', key: 'Ctrl+Shift+F', action: () => switchPanel('search') },
    null,
    { label: 'Toggle Line Comment', key: 'Ctrl+/', action: () => toggleLineComment() },
    { label: 'Toggle Block Comment', key: 'Shift+Alt+A', action: () => toggleBlockComment() },
    null,
    { label: 'Format Document', key: 'Shift+Alt+F', action: () => formatDocument() },
    null,
    { label: 'Delete Line', key: 'Ctrl+Shift+K', action: () => deleteLine() },
    { label: 'Duplicate Line Down', key: 'Shift+Alt+Down', action: () => duplicateLine() },
    { label: 'Indent Line', key: 'Tab', action: () => indentLine() },
    { label: 'Outdent Line', key: 'Shift+Tab', action: () => outdentLine() },
  ],
  'menu-selection': [
    { label: 'Select All', key: 'Ctrl+A', action: () => runEditorAction('editor.action.selectAll') },
    { label: 'Expand Selection', key: 'Shift+Alt+Right', action: () => runEditorAction('editor.action.smartSelect.expand') },
    { label: 'Shrink Selection', key: 'Shift+Alt+Left', action: () => runEditorAction('editor.action.smartSelect.shrink') },
    null,
    { label: 'Copy Line Up', key: 'Shift+Alt+Up', action: () => runEditorAction('editor.action.copyLinesUpAction') },
    { label: 'Copy Line Down', key: 'Shift+Alt+Down', action: () => runEditorAction('editor.action.copyLinesDownAction') },
    { label: 'Move Line Up', key: 'Alt+Up', action: () => runEditorAction('editor.action.moveLinesUpAction') },
    { label: 'Move Line Down', key: 'Alt+Down', action: () => runEditorAction('editor.action.moveLinesDownAction') },
    null,
    { label: 'Add Cursor Above', key: 'Ctrl+Alt+Up', action: () => addCursorAbove() },
    { label: 'Add Cursor Below', key: 'Ctrl+Alt+Down', action: () => addCursorBelow() },
    { label: 'Select Current Line', key: 'Ctrl+L', action: () => selectCurrentLine() },
    { label: 'Select All Occurrences', key: 'Ctrl+Shift+L', action: () => selectAllOccurrences() },
  ],
  'menu-view': [
    { label: 'Command Palette...', key: 'Ctrl+Shift+P', action: () => showCmdPalette() },
    { label: 'Open View...', key: '', action: () => showCmdPalette([
      { label: 'Explorer', key: '', action: () => switchPanel('explorer') },
      { label: 'Search', key: '', action: () => switchPanel('search') },
      { label: 'Source Control', key: '', action: () => switchPanel('git') },
      { label: 'Run and Debug', key: '', action: () => switchPanel('debug') },
      { label: 'Extensions', key: '', action: () => switchPanel('extensions') },
    ], '> Open View...') },
    null,
    { label: 'Explorer', key: 'Ctrl+Shift+E', action: () => switchPanel('explorer') },
    { label: 'Search', key: 'Ctrl+Shift+F', action: () => switchPanel('search') },
    { label: 'Source Control', key: 'Ctrl+Shift+G', action: () => switchPanel('git') },
    { label: 'Run and Debug', key: 'Ctrl+Shift+D', action: () => switchPanel('debug') },
    { label: 'Extensions', key: 'Ctrl+Shift+X', action: () => switchPanel('extensions') },
    null,
    { label: 'Toggle Primary Side Bar', key: 'Ctrl+B', action: () => toggleSidebar() },
    { label: 'Toggle Panel', key: 'Ctrl+J', action: () => togglePanel() },
    { label: 'Toggle Full Screen', key: 'F11', action: () => toggleFullScreen() },
    null,
    { label: 'Word Wrap', key: 'Alt+Z', action: () => toggleWordWrap() },
    { label: 'Toggle Minimap', key: '', action: () => toggleMinimap() },
    null,
    { label: 'Zoom In', key: 'Ctrl+=', action: () => zoomIn() },
    { label: 'Zoom Out', key: 'Ctrl+-', action: () => zoomOut() },
    { label: 'Reset Zoom', key: 'Ctrl+0', action: () => zoomReset() },
    null,
    { label: 'Appearance: Color Theme', key: 'Ctrl+K Ctrl+T', action: () => showThemePicker() },
  ],
  'menu-go': [
    { label: 'Back', key: 'Alt+Left', action: () => goFileHistory(-1) },
    { label: 'Forward', key: 'Alt+Right', action: () => goFileHistory(1) },
    null,
    { label: 'Go to File...', key: 'Ctrl+P', action: () => openFileQuickPick('> Go to File...') },
    { label: 'Go to Symbol in Workspace...', key: 'Ctrl+T', action: () => openWorkspaceSymbolPicker() },
    { label: 'Go to Definition', key: 'F12', action: () => goToDefinition() },
    null,
    { label: 'Go to Line/Column...', key: 'Ctrl+G', action: () => goToLineColumnPrompt() },
    { label: 'Go to Beginning of File', key: 'Ctrl+Home', action: () => goToBeginningOfFile() },
    { label: 'Go to End of File', key: 'Ctrl+End', action: () => goToEndOfFile() },
  ],
  'menu-run': [
    { label: 'Start Debugging', key: 'F5', action: () => startRunSession('debug') },
    { label: 'Run Without Debugging', key: 'Ctrl+F5', action: () => startRunSession('run') },
    null,
    { label: 'Stop Debugging', key: 'Shift+F5', action: () => stopRunSession() },
    { label: 'Restart Debugging', key: 'Ctrl+Shift+F5', action: () => restartRunSession() },
    null,
    { label: 'Continue', key: 'F5', action: () => debugContinue() },
    { label: 'Step Over', key: 'F10', action: () => debugStepOver() },
    { label: 'Step Into', key: 'F11', action: () => debugStepInto() },
    { label: 'Step Out', key: 'Shift+F11', action: () => debugStepOut() },
    null,
    { label: 'Toggle Breakpoint', key: 'F9', action: () => toggleBreakpointAtCursor() },
  ],
  'menu-terminal': [
    { label: 'New Terminal', key: 'Ctrl+Shift+`', action: () => { if (!state.panelVisible) togglePanel(); switchPanelTab('TERMINAL'); initTerminal(); } },
    { label: 'Split Terminal', key: 'Ctrl+Shift+5', action: () => runTerminalTask('Split terminal', [{ type: 'out', text: 'Split terminal is not available in this browser demo.' }]) },
    null,
    { label: 'Run Task...', key: '', action: () => showRunTaskPicker() },
    { label: 'Run Build Task...', key: 'Ctrl+Shift+B', action: () => runTerminalTask('npm run build', [{ type: 'success', text: 'Build completed successfully.' }]) },
    null,
    { label: 'Clear Terminal', key: '', action: () => clearTerminal() },
    { label: 'Focus Terminal', key: 'Ctrl+`', action: () => focusTerminal() },
  ],
  'menu-help': [
    { label: 'Welcome', key: '', action: () => { document.getElementById('editor-area').innerHTML = `<div class="welcome-page">${welcomeHTML()}</div>`; document.getElementById('status-lang').textContent = 'Plain Text'; } },
    { label: 'Documentation', key: '', action: () => window.open('https://code.visualstudio.com/docs', '_blank') },
    { label: 'Release Notes', key: '', action: () => window.open('https://code.visualstudio.com/updates', '_blank') },
    null,
    { label: 'Keyboard Shortcuts Reference', key: 'Ctrl+K Ctrl+R', action: () => window.open('https://code.visualstudio.com/docs/getstarted/keybindings', '_blank') },
    null,
    { label: 'Report Issue', key: '', action: () => window.open('https://github.com/microsoft/vscode/issues', '_blank') },
    { label: 'Check for Updates...', key: '', action: () => showNotif('You are on the latest version.', 'info') },
    null,
    { label: 'About', key: '', action: () => showNotif('VS Code Clone — Built with Monaco Editor', 'info') },
  ]
};
function initTitleMenus() {
  const container = document.getElementById('title-dropdown-container');
  let activeMenuId = null;
  let activeItemIndex = -1;

  const menuIds = Array.from(document.querySelectorAll('.title-menu span')).map(el => el.id);

  function closeAllMenus() {
    container.innerHTML = '';
    activeMenuId = null;
    activeItemIndex = -1;
    document.querySelectorAll('.title-menu span').forEach(el => el.style.background = '');
  }

  function toggleMenu(menuId, buttonEl) {
    if (activeMenuId === menuId) {
      closeAllMenus();
      return;
    }
    
    closeAllMenus();
    activeMenuId = menuId;
    activeItemIndex = -1; // Reset selection on open
    buttonEl.style.background = 'var(--bg4)'; // Active styling

    const items = titleMenus[menuId] || [];
    const rect = buttonEl.getBoundingClientRect();

    const dropdown = document.createElement('div');
    dropdown.className = 'title-dropdown show';
    dropdown.style.left = rect.left + 'px';
    dropdown.style.top = rect.bottom + 'px';

    dropdown.innerHTML = items.map(item => {
      if (!item) return `<div class="title-dropdown-sep"></div>`;
      return `<div class="title-dropdown-item" data-label="${item.label}">
        <span>${item.label}</span>
        <span class="title-dropdown-shortcut">${item.key || ''}</span>
      </div>`;
    }).join('');

    container.appendChild(dropdown);

    // Add click listeners to items
    dropdown.querySelectorAll('.title-dropdown-item').forEach(itemEl => {
      itemEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = items.find(i => i && i.label === itemEl.dataset.label);
        if (item) item.action();
        closeAllMenus();
      });
    });
  }

  function highlightItem(index) {
    const dropdown = container.querySelector('.title-dropdown');
    if (!dropdown) return;
    const domItems = dropdown.querySelectorAll('.title-dropdown-item');
    domItems.forEach((item, i) => {
      item.classList.toggle('selected', i === index);
    });
  }

  // Bind clicks to menu triggers inside .title-menu
  Object.keys(titleMenus).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu(id, el);
    });

    el.addEventListener('mouseenter', (e) => {
      if (activeMenuId && activeMenuId !== id) {
        toggleMenu(id, el);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (!activeMenuId) return;

    const dropdown = container.querySelector('.title-dropdown');
    if (!dropdown) return;
    const domItems = dropdown.querySelectorAll('.title-dropdown-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeItemIndex = Math.min(activeItemIndex + 1, domItems.length - 1);
      highlightItem(activeItemIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeItemIndex = Math.max(activeItemIndex - 1, 0);
      highlightItem(activeItemIndex);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const currIdx = menuIds.indexOf(activeMenuId);
      const nextIdx = (currIdx + 1) % menuIds.length;
      const nextId = menuIds[nextIdx];
      const nextEl = document.getElementById(nextId);
      toggleMenu(nextId, nextEl);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const currIdx = menuIds.indexOf(activeMenuId);
      const prevIdx = (currIdx - 1 + menuIds.length) % menuIds.length;
      const prevId = menuIds[prevIdx];
      const prevEl = document.getElementById(prevId);
      toggleMenu(prevId, prevEl);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeItemIndex >= 0 && domItems[activeItemIndex]) {
        domItems[activeItemIndex].click();
      }
    } else if (e.key === 'Escape') {
      closeAllMenus();
    }
  });


  // Close menus on outside click
  document.addEventListener('click', () => {
    if (activeMenuId) closeAllMenus();
  });
}

// ---------- KEYBOARD SHORTCUTS ----------
let waitingForThemeChord = false;
let themeChordTimer = null;

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    waitingForThemeChord = true;
    clearTimeout(themeChordTimer);
    themeChordTimer = setTimeout(() => { waitingForThemeChord = false; }, 1200);
    return;
  }
  if (waitingForThemeChord) {
    waitingForThemeChord = false;
    clearTimeout(themeChordTimer);
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 't') {
      e.preventDefault();
      showThemePicker();
      return;
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') { e.preventDefault(); createNewFile(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') { e.preventDefault(); openFileQuickPick('> Open File...'); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') { e.preventDefault(); openFileQuickPick('> Go to File...'); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') { e.preventDefault(); goToLineColumnPrompt(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); runEditorAction('actions.find'); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') { e.preventDefault(); runEditorAction('editor.action.startFindReplaceAction'); return; }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') { e.preventDefault(); saveCurrentFileAs(); return; }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') { e.preventDefault(); showCmdPalette(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); toggleSidebar(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key === 'j') { e.preventDefault(); togglePanel(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key === '`') { e.preventDefault(); if (!state.panelVisible) togglePanel(); switchPanelTab('TERMINAL'); return; }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveCurrentFile(); return; }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'X') { e.preventDefault(); switchPanel('extensions'); return; }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G') { e.preventDefault(); switchPanel('git'); return; }
  if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); goFileHistory(-1); return; }
  if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); goFileHistory(1); return; }
  if (e.key === 'F5' && !e.ctrlKey && !e.metaKey && !e.shiftKey) { e.preventDefault(); startRunSession('debug'); return; }
  if (e.key === 'F5' && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); startRunSession('run'); return; }
  if (e.key === 'F5' && (e.ctrlKey || e.metaKey) && e.shiftKey) { e.preventDefault(); restartRunSession(); return; }
  if (e.key === 'F5' && e.shiftKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); stopRunSession(); return; }
  if (e.key === 'F9') { e.preventDefault(); toggleBreakpointAtCursor(); return; }
  if (e.key === 'F10') { e.preventDefault(); debugStepOver(); return; }
  if (e.key === 'F11' && !e.shiftKey) { e.preventDefault(); debugStepInto(); return; }
  if (e.key === 'F11' && e.shiftKey) { e.preventDefault(); debugStepOut(); return; }
  if (e.key === 'F12') { e.preventDefault(); goToDefinition(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key === '=') { e.preventDefault(); zoomIn(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); zoomOut(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key === '0') { e.preventDefault(); zoomReset(); return; }
  if (e.altKey && e.key === 'z') { e.preventDefault(); toggleWordWrap(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') { e.preventDefault(); closeActiveEditor(); return; }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') { e.preventDefault(); deleteLine(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key === '/') { e.preventDefault(); toggleLineComment(); return; }
  if (e.key === 'Escape') {
    if (document.getElementById('cmd-overlay').classList.contains('show')) { hideCmdPalette(); return; }
    if (document.getElementById('theme-picker-overlay')?.classList.contains('show')) { closeThemePickerOverlay(); return; }
  }
});

// ---------- SIDEBAR ACTIONS ----------
window.collapseAll = function() {
  function recurse(nodes) {
    nodes.forEach(n => {
      if (n.type === 'folder') {
        n.open = false;
        if (n.children) recurse(n.children);
      }
    });
  }
  recurse(fileTree);
  buildExplorer();
}

window.createNewFile = function() {
  const name = prompt('Enter file name:');
  if (!name) return;
  
  let targetFolder = fileTree[0];
  if (state.currentFile) {
    if (state.currentFile.type === 'folder') {
      targetFolder = state.currentFile;
    } else {
      function findParent(nodes, child) {
        for (const n of nodes) {
          if (n.children && n.children.includes(child)) return n;
          if (n.children) {
            const p = findParent(n.children, child);
            if (p) return p;
          }
        }
        return null;
      }
      const parent = findParent(fileTree, state.currentFile);
      if (parent) targetFolder = parent;
    }
  }

  if (targetFolder && targetFolder.children) {
    const ext = name.split('.').pop().toLowerCase();
    const newFile = { name, type: 'file', lang: ext, content: '' };
    targetFolder.children.push(newFile);
    targetFolder.open = true;
    buildExplorer();
    showNotif(`Created file: ${name}`, 'info');
    openFile(newFile);
  }
}

window.createNewFolder = function() {
  const name = prompt('Enter folder name:');
  if (!name) return;
  
  let targetFolder = fileTree[0];
  if (state.currentFile) {
    if (state.currentFile.type === 'folder') {
      targetFolder = state.currentFile;
    } else {
      function findParent(nodes, child) {
        for (const n of nodes) {
          if (n.children && n.children.includes(child)) return n;
          if (n.children) {
            const p = findParent(n.children, child);
            if (p) return p;
          }
        }
        return null;
      }
      const parent = findParent(fileTree, state.currentFile);
      if (parent) targetFolder = parent;
    }
  }

  if (targetFolder && targetFolder.children) {
    targetFolder.children.push({ name, type: 'folder', open: true, children: [] });
    targetFolder.open = true;
    buildExplorer();
    showNotif(`Created folder: ${name}`, 'info');
  }
}

// ---------- INIT ----------

document.addEventListener('DOMContentLoaded', () => {
  window.lucide?.createIcons?.();
  const savedTheme = window.localStorage?.getItem('vscode-clone-theme');
  applyTheme(savedTheme || state.currentTheme);
  try {
     initTitleMenus();
  } catch (e) {
     console.error('Menu Init Crash:', e);
     showNotif('Menu Init Failed: ' + e.message, 'error');
  }
  initMonaco();

  buildExplorer();
  initTerminal();
  switchPanelTab('TERMINAL');
  initResize();
  // status bar clock
  setInterval(() => {
    const now = new Date();
    const el = document.getElementById('status-time');
    if (el) el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, 1000);
  // title bar buttons

  const themeOverlay = document.getElementById('theme-picker-overlay');
  const themeClose = document.getElementById('theme-picker-close');
  themeOverlay?.addEventListener('click', e => {
    if (e.target === themeOverlay) closeThemePickerOverlay();
  });
  themeClose?.addEventListener('click', e => {
    e.stopPropagation();
    closeThemePickerOverlay();
  });

  const btnMaximize = document.getElementById('btn-maximize');
  btnMaximize?.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });
  // welcome tab
  document.getElementById('editor-area').innerHTML = `<div class="welcome-page">${welcomeHTML()}</div>`;
});


