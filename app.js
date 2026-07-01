/* ===== Storage Helpers ===== */
const STORAGE_KEYS = [
  'theme', 'todos', 'notes', 'progress', 'topics',
  'sessionHistory', 'vocabPairs', 'pomodoroSessions', 'flashcardDecks', 'aiChatHistory'
];

const store = {
  get(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getAll() {
    const data = { app: 'StudyHub', version: 1, savedAt: new Date().toISOString() };
    STORAGE_KEYS.forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
      }
    });
    return data;
  },
  setAll(data) {
    STORAGE_KEYS.forEach(key => {
      if (data[key] !== undefined) store.set(key, data[key]);
    });
  }
};

/* ===== Toast Notifications ===== */
const Toast = {
  timer: null,
  show(message, type = 'success') {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.className = `toast show ${type}`;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => el.classList.remove('show'), 3000);
  }
};

/* ===== Save & Backup ===== */
const Backup = {
  fileHandle: null,
  IDB_NAME: 'studyhub-backup-db',
  IDB_STORE: 'handles',

  init() {
    document.getElementById('saveBackupBtn').addEventListener('click', () => this.openModal());
    document.getElementById('saveAllBtn').addEventListener('click', () => this.openModal());
    document.getElementById('loadBackupBtn').addEventListener('click', () => {
      document.getElementById('backupFileInput').click();
    });
    document.getElementById('backupFileInput').addEventListener('change', e => {
      if (e.target.files[0]) this.load(e.target.files[0]);
      e.target.value = '';
    });
    document.getElementById('saveModalCancel').addEventListener('click', () => this.closeModal());
    document.getElementById('saveModalConfirm').addEventListener('click', () => this.confirmSave(false));
    document.getElementById('saveModalAs').addEventListener('click', () => this.confirmSave(true));
    document.getElementById('saveModal').addEventListener('click', e => {
      if (e.target.id === 'saveModal') this.closeModal();
    });
    document.getElementById('saveFileName').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.confirmSave(false);
      if (e.key === 'Escape') this.closeModal();
    });
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.quickSave();
      }
    });
    this.restoreFileHandle();
    this.updateLinkedHint();
  },

  getDefaultName() {
    return store.get('lastBackupName', 'studyhub-backup');
  },

  sanitizeName(name) {
    const cleaned = name.trim().replace(/\.json$/i, '').replace(/[<>:"/\\|?*]/g, '-');
    return cleaned || 'studyhub-backup';
  },

  getBlob() {
    return new Blob([JSON.stringify(store.getAll(), null, 2)], { type: 'application/json' });
  },

  openModal() {
    const modal = document.getElementById('saveModal');
    const input = document.getElementById('saveFileName');
    input.value = this.getDefaultName();
    const linked = document.getElementById('saveLinkedHint');
    if (this.fileHandle) {
      linked.textContent = `Linked file: ${this.getDefaultName()}.json — Save will update it`;
      linked.classList.remove('empty');
    } else {
      linked.textContent = 'Pick a name, then choose where to save on your computer';
      linked.classList.add('empty');
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => input.select(), 50);
  },

  closeModal() {
    const modal = document.getElementById('saveModal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  },

  updateLinkedHint() {
    const el = document.getElementById('linkedFileHint');
    const name = this.getDefaultName();
    if (this.fileHandle) {
      el.textContent = `Linked: ${name}.json · Ctrl+S to update`;
    } else {
      el.textContent = 'Ctrl+S to quick-save';
    }
  },

  rememberName(name) {
    store.set('lastBackupName', name);
    this.updateLinkedHint();
  },

  async openIDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.IDB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(this.IDB_STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async restoreFileHandle() {
    if (!('showSaveFilePicker' in window)) return;
    try {
      const db = await this.openIDB();
      const handle = await new Promise((resolve, reject) => {
        const tx = db.transaction(this.IDB_STORE, 'readonly');
        const req = tx.objectStore(this.IDB_STORE).get('backup');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
      if (handle && await this.verifyPermission(handle)) {
        this.fileHandle = handle;
        this.updateLinkedHint();
      }
    } catch { /* indexedDB unavailable */ }
  },

  async storeFileHandle(handle) {
    this.fileHandle = handle;
    try {
      const db = await this.openIDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(this.IDB_STORE, 'readwrite');
        tx.objectStore(this.IDB_STORE).put(handle, 'backup');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch { /* handle stays in memory for this session */ }
    this.updateLinkedHint();
  },

  async verifyPermission(handle) {
    if (!handle) return false;
    const opts = { mode: 'readwrite' };
    if ((await handle.queryPermission(opts)) === 'granted') return true;
    if ((await handle.requestPermission(opts)) === 'granted') return true;
    return false;
  },

  async writeToHandle(handle) {
    if (!await this.verifyPermission(handle)) {
      this.fileHandle = null;
      throw new Error('Permission denied — use Save As New to pick the file again');
    }
    const writable = await handle.createWritable();
    await writable.write(this.getBlob());
    await writable.close();
  },

  downloadFallback(name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(this.getBlob());
    a.download = `${name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  },

  async quickSave() {
    const name = this.getDefaultName();
    if (this.fileHandle) {
      try {
        await this.writeToHandle(this.fileHandle);
        Toast.show(`Updated ${name}.json`);
        return;
      } catch (err) {
        Toast.show(err.message, 'error');
        this.openModal();
        return;
      }
    }
    this.openModal();
  },

  async confirmSave(saveAs) {
    const name = this.sanitizeName(document.getElementById('saveFileName').value);
    this.closeModal();

    if (this.fileHandle && !saveAs) {
      try {
        await this.writeToHandle(this.fileHandle);
        this.rememberName(name);
        Toast.show(`Updated ${name}.json`);
        return;
      } catch (err) {
        Toast.show(err.message, 'error');
      }
    }

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: `${name}.json`,
          types: [{ description: 'StudyHub Backup', accept: { 'application/json': ['.json'] } }]
        });
        await this.writeToHandle(handle);
        await this.storeFileHandle(handle);
        this.rememberName(name);
        Toast.show(`Saved ${name}.json`);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    this.downloadFallback(name);
    this.rememberName(name);
    Toast.show(`Downloaded ${name}.json`);
  },

  save() {
    this.quickSave();
  },

  load(file) {
    const baseName = file.name.replace(/\.json$/i, '');
    if (baseName) this.rememberName(baseName);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || (data.app !== 'StudyHub' && !data.todos && !data.topics)) {
          throw new Error('Not a valid StudyHub backup file');
        }
        if (!confirm('Load this backup? Your current data will be replaced.')) return;
        store.setAll(data);
        if (data.theme) Theme.set(data.theme);
        Todo.items = store.get('todos', []);
        Todo.render();
        document.getElementById('quickNotes').value = store.get('notes', '');
        Progress.items = store.get('progress', []);
        Progress.render();
        Prompts.topics = store.get('topics', []);
        Prompts.history = store.get('sessionHistory', []);
        Prompts.renderTopics();
        Prompts.renderHistory();
        Tools.vocabPairs = store.get('vocabPairs', Tools.vocabPairs);
        Pomodoro.sessions = store.get('pomodoroSessions', 0);
        document.getElementById('pomodoroCount').textContent = Pomodoro.sessions;
        Flashcards.decks = store.get('flashcardDecks', []);
        Flashcards.renderDeckList();
        Flashcards.refreshView();
        AIChat.messages = store.get('aiChatHistory', []);
        AIChat.renderMessages();
        Toast.show('Backup loaded successfully');
      } catch (err) {
        Toast.show(err.message || 'Could not read backup file', 'error');
      }
    };
    reader.readAsText(file);
  }
};

/* ===== Theme ===== */
const Theme = {
  init() {
    const saved = store.get('theme', null);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.set(saved || (prefersDark ? 'dark' : 'light'));
    document.getElementById('themeToggle').addEventListener('click', () => this.toggle());
    document.getElementById('themeToggleMobile').addEventListener('click', () => this.toggle());
  },
  set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeLabel').textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    store.set('theme', theme);
  },
  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.set(current === 'dark' ? 'light' : 'dark');
  }
};

/* ===== Navigation ===== */
const Nav = {
  init() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => this.go(btn.dataset.section));
    });
    document.getElementById('menuBtn').addEventListener('click', () => this.toggleSidebar());
    document.getElementById('sidebarOverlay').addEventListener('click', () => this.closeSidebar());
  },
  go(section) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.section === section));
    document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === section));
    this.closeSidebar();
  },
  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
  },
  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
  }
};

/* ===== Date Display ===== */
function initDate() {
  const el = document.getElementById('currentDate');
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

/* ===== Pomodoro Timer ===== */
const Pomodoro = {
  FOCUS: 25 * 60,
  BREAK: 5 * 60,
  time: 25 * 60,
  total: 25 * 60,
  running: false,
  isBreak: false,
  sessions: 0,
  interval: null,

  init() {
    this.sessions = store.get('pomodoroSessions', 0);
    document.getElementById('pomodoroCount').textContent = this.sessions;
    document.getElementById('pomodoroStart').addEventListener('click', () => this.toggle());
    document.getElementById('pomodoroReset').addEventListener('click', () => this.reset());
    this.render();
  },

  toggle() {
    this.running = !this.running;
    const btn = document.getElementById('pomodoroStart');
    btn.textContent = this.running ? 'Pause' : 'Start';
    if (this.running) {
      this.interval = setInterval(() => this.tick(), 1000);
    } else {
      clearInterval(this.interval);
    }
  },

  tick() {
    if (this.time <= 0) {
      this.complete();
      return;
    }
    this.time--;
    this.render();
  },

  complete() {
    clearInterval(this.interval);
    this.running = false;
    document.getElementById('pomodoroStart').textContent = 'Start';

    if (!this.isBreak) {
      this.sessions++;
      store.set('pomodoroSessions', this.sessions);
      document.getElementById('pomodoroCount').textContent = this.sessions;
      this.playChime();
    }

    this.isBreak = !this.isBreak;
    this.total = this.isBreak ? this.BREAK : this.FOCUS;
    this.time = this.total;
    this.updatePhase();
    this.render();
  },

  reset() {
    clearInterval(this.interval);
    this.running = false;
    this.isBreak = false;
    this.total = this.FOCUS;
    this.time = this.FOCUS;
    document.getElementById('pomodoroStart').textContent = 'Start';
    this.updatePhase();
    this.render();
  },

  updatePhase() {
    const phase = document.getElementById('pomodoroPhase');
    const mode = document.getElementById('pomodoroModeLabel');
    if (this.isBreak) {
      phase.textContent = 'Break';
      mode.textContent = '5 min break';
    } else {
      phase.textContent = 'Focus';
      mode.textContent = '25 min focus';
    }
  },

  render() {
    const mins = Math.floor(this.time / 60);
    const secs = this.time % 60;
    document.getElementById('pomodoroTime').textContent =
      `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const ring = document.getElementById('pomodoroRing');
    const circumference = 2 * Math.PI * 54;
    const progress = this.time / this.total;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference * (1 - progress);
  },

  playChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.value = 0.15;
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.3);
      });
    } catch { /* audio not available */ }
  }
};

/* ===== Todo List ===== */
const Todo = {
  items: [],

  init() {
    this.items = store.get('todos', []);
    document.getElementById('todoForm').addEventListener('submit', e => {
      e.preventDefault();
      const input = document.getElementById('todoInput');
      const text = input.value.trim();
      if (!text) return;
      this.items.push({ id: Date.now(), text, done: false });
      input.value = '';
      this.save();
      this.render();
    });
    this.render();
  },

  save() {
    store.set('todos', this.items);
  },

  toggle(id) {
    const item = this.items.find(t => t.id === id);
    if (item) item.done = !item.done;
    this.save();
    this.render();
  },

  remove(id) {
    this.items = this.items.filter(t => t.id !== id);
    this.save();
    this.render();
  },

  render() {
    const list = document.getElementById('todoList');
    const active = this.items.filter(t => !t.done).length;
    document.getElementById('todoCount').textContent = `${active} task${active !== 1 ? 's' : ''}`;

    if (this.items.length === 0) {
      list.innerHTML = '<li class="todo-empty">No tasks yet. Add one above!</li>';
      return;
    }

    list.innerHTML = this.items.map(item => `
      <li class="todo-item ${item.done ? 'done' : ''}">
        <div class="todo-check" data-id="${item.id}">
          ${item.done ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        </div>
        <span class="todo-text">${escapeHtml(item.text)}</span>
        <button class="todo-delete" data-id="${item.id}" aria-label="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </li>
    `).join('');

    list.querySelectorAll('.todo-check').forEach(el => {
      el.addEventListener('click', () => this.toggle(Number(el.dataset.id)));
    });
    list.querySelectorAll('.todo-delete').forEach(el => {
      el.addEventListener('click', () => this.remove(Number(el.dataset.id)));
    });
  }
};

/* ===== Quick Notes ===== */
const Notes = {
  timer: null,

  init() {
    const textarea = document.getElementById('quickNotes');
    textarea.value = store.get('notes', '');
    textarea.addEventListener('input', () => {
      const status = document.getElementById('notesSaveStatus');
      status.textContent = 'Saving...';
      status.classList.add('saving');
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        store.set('notes', textarea.value);
        status.textContent = 'Saved';
        status.classList.remove('saving');
      }, 500);
    });
  }
};

/* ===== Progress Tracker ===== */
const Progress = {
  items: [],

  init() {
    this.items = store.get('progress', []);
    document.getElementById('progressForm').addEventListener('submit', e => {
      e.preventDefault();
      const input = document.getElementById('progressInput');
      const text = input.value.trim();
      if (!text) return;
      this.items.push({ id: Date.now(), text, done: false });
      input.value = '';
      this.save();
      this.render();
    });
    this.render();
  },

  save() {
    store.set('progress', this.items);
  },

  toggle(id) {
    const item = this.items.find(p => p.id === id);
    if (item) item.done = !item.done;
    this.save();
    this.render();
  },

  remove(id) {
    this.items = this.items.filter(p => p.id !== id);
    this.save();
    this.render();
  },

  render() {
    const list = document.getElementById('progressList');
    const done = this.items.filter(p => p.done).length;
    const total = this.items.length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    document.getElementById('progressPercent').textContent = `${pct}%`;
    document.getElementById('progressBar').style.width = `${pct}%`;

    if (total === 0) {
      list.innerHTML = '<li class="todo-empty">Add study goals to track progress</li>';
      return;
    }

    list.innerHTML = this.items.map(item => `
      <li class="progress-item ${item.done ? 'done' : ''}">
        <input type="checkbox" id="prog-${item.id}" ${item.done ? 'checked' : ''}>
        <label for="prog-${item.id}">${escapeHtml(item.text)}</label>
        <button class="progress-delete" data-id="${item.id}" aria-label="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </li>
    `).join('');

    list.querySelectorAll('input[type="checkbox"]').forEach(el => {
      el.addEventListener('change', () => this.toggle(Number(el.id.replace('prog-', ''))));
    });
    list.querySelectorAll('.progress-delete').forEach(el => {
      el.addEventListener('click', () => this.remove(Number(el.dataset.id)));
    });
  }
};

/* ===== Study Prompt Generator ===== */
const Prompts = {
  topics: [],
  history: [],
  currentQuestion: null,
  focusStart: null,

  init() {
    this.topics = store.get('topics', [
      { id: 1, name: 'General Knowledge', questions: ['What is the capital of France?', 'Who wrote Romeo and Juliet?', 'What is the largest planet in our solar system?'] },
      { id: 2, name: 'JavaScript', questions: ['What is the difference between let and const?', 'Explain closures in JavaScript.', 'What does the event loop do?'] }
    ]);
    this.history = store.get('sessionHistory', []);

    document.getElementById('topicForm').addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('topicName').value.trim();
      const qs = document.getElementById('topicQuestions').value.trim();
      if (!name || !qs) return;
      const questions = qs.split('\n').map(q => q.trim()).filter(Boolean);
      this.topics.push({ id: Date.now(), name, questions });
      document.getElementById('topicName').value = '';
      document.getElementById('topicQuestions').value = '';
      this.save();
      this.renderTopics();
    });

    document.getElementById('generateBtn').addEventListener('click', () => this.generate());
    document.getElementById('markDoneBtn').addEventListener('click', () => this.markAnswered());
    document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
    document.getElementById('exportBtn').addEventListener('click', () => this.export());
    document.getElementById('focusModeBtn').addEventListener('click', () => this.enterFocus());
    document.getElementById('focusExitBtn').addEventListener('click', () => this.exitFocus());
    document.getElementById('focusGenerateBtn').addEventListener('click', () => this.generate(true));
    document.getElementById('focusMarkBtn').addEventListener('click', () => this.markAnswered(true));

    this.renderTopics();
    this.renderHistory();
  },

  save() {
    store.set('topics', this.topics);
    store.set('sessionHistory', this.history);
  },

  renderTopics() {
    const list = document.getElementById('topicList');
    const select = document.getElementById('topicSelect');

    select.innerHTML = '<option value="all">All Topics</option>' +
      this.topics.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');

    if (this.topics.length === 0) {
      list.innerHTML = '<li class="history-empty">No topics yet</li>';
      return;
    }

    list.innerHTML = this.topics.map(t => `
      <li class="topic-item">
        <div class="topic-info">
          <strong>${escapeHtml(t.name)}</strong>
          <span>${t.questions.length} question${t.questions.length !== 1 ? 's' : ''}</span>
        </div>
        <button class="topic-delete" data-id="${t.id}" aria-label="Delete topic">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </li>
    `).join('');

    list.querySelectorAll('.topic-delete').forEach(el => {
      el.addEventListener('click', () => {
        this.topics = this.topics.filter(t => t.id !== Number(el.dataset.id));
        this.save();
        this.renderTopics();
      });
    });
  },

  getPool() {
    const selected = document.getElementById('topicSelect').value;
    if (selected === 'all') {
      return this.topics.flatMap(t => t.questions.map(q => ({ question: q, topic: t.name })));
    }
    const topic = this.topics.find(t => t.id === Number(selected));
    return topic ? topic.questions.map(q => ({ question: q, topic: topic.name })) : [];
  },

  generate(focus = false) {
    const pool = this.getPool();
    if (pool.length === 0) return;

    const pick = pool[Math.floor(Math.random() * pool.length)];
    this.currentQuestion = pick;

    const html = `<div class="generator-question">${escapeHtml(pick.question)}</div>`;
    document.getElementById('generatorDisplay').innerHTML = html;
    document.getElementById('generatorMeta').textContent = `Topic: ${pick.topic}`;
    document.getElementById('markDoneBtn').disabled = false;

    if (focus) {
      document.getElementById('focusQuestion').innerHTML = html;
    }
  },

  markAnswered(focus = false) {
    if (!this.currentQuestion) return;
    this.history.unshift({
      question: this.currentQuestion.question,
      topic: this.currentQuestion.topic,
      time: new Date().toISOString()
    });
    if (this.history.length > 50) this.history = this.history.slice(0, 50);
    this.save();
    this.renderHistory();
    this.currentQuestion = null;
    document.getElementById('markDoneBtn').disabled = true;
    if (focus) document.getElementById('focusQuestion').innerHTML = '<p style="color:var(--text-muted)">Question marked! Generate another.</p>';
    else document.getElementById('generatorMeta').textContent = 'Marked as answered ✓';
  },

  renderHistory() {
    const list = document.getElementById('historyList');
    if (this.history.length === 0) {
      list.innerHTML = '<li class="history-empty">No sessions yet</li>';
      return;
    }
    list.innerHTML = this.history.map(h => `
      <li class="history-item">
        <time>${new Date(h.time).toLocaleString()}</time>
        <p>${escapeHtml(h.question)}</p>
        <span class="history-topic">${escapeHtml(h.topic)}</span>
      </li>
    `).join('');
  },

  clearHistory() {
    if (!confirm('Clear all session history?')) return;
    this.history = [];
    this.save();
    this.renderHistory();
  },

  export() {
    Backup.openModal();
  },

  enterFocus() {
    this.focusStart = Date.now();
    document.getElementById('focusOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    this.generate(true);
    this.updateFocusTimer();
    this.focusInterval = setInterval(() => this.updateFocusTimer(), 1000);
  },

  exitFocus() {
    document.getElementById('focusOverlay').classList.remove('active');
    document.body.style.overflow = '';
    clearInterval(this.focusInterval);
  },

  updateFocusTimer() {
    if (!this.focusStart) return;
    const elapsed = Math.floor((Date.now() - this.focusStart) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    document.getElementById('focusTimer').textContent =
      `Focus session: ${mins}:${String(secs).padStart(2, '0')}`;
  }
};

/* ===== Subject Tools ===== */
const Tools = {
  init() {
    document.querySelectorAll('.tool-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tool-${tab.dataset.tool}`).classList.add('active');
      });
    });

    this.initMath();
    this.initRegex();
    this.initVocab();
    this.initConverter();
  },

  /* --- Math Solver --- */
  initMath() {
    document.getElementById('mathSolveBtn').addEventListener('click', () => this.solveMath());
    document.getElementById('mathEquation').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.solveMath();
    });
  },

  solveMath() {
    const input = document.getElementById('mathEquation').value.trim();
    const container = document.getElementById('mathSteps');

    try {
      const result = this.parseLinearEquation(input);
      container.innerHTML = result.steps.map((s, i) => `
        <div class="math-step">
          <div class="math-step-num">Step ${i + 1}</div>
          <div class="math-step-eq">${escapeHtml(s)}</div>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = `<div class="math-error">${escapeHtml(err.message)}</div>`;
    }
  },

  parseLinearEquation(eq) {
    const cleaned = eq.replace(/\s/g, '');
    const match = cleaned.match(/^([+-]?\d*\.?\d*)x([+-]\d+\.?\d*)?=([+-]?\d+\.?\d*)$/);

    if (!match) {
      throw new Error('Enter a linear equation like: 2x + 5 = 13 or 3x - 7 = 8');
    }

    let a = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1]);
    const b = match[2] ? parseFloat(match[2]) : 0;
    const c = parseFloat(match[3]);
    const steps = [];
    const original = `${a === 1 ? '' : a === -1 ? '-' : a}x${b >= 0 ? ' + ' + b : ' - ' + Math.abs(b)} = ${c}`;

    steps.push(`Start: ${original}`);

    if (b !== 0) {
      const newC = c - b;
      steps.push(`${b > 0 ? 'Subtract' : 'Add'} ${Math.abs(b)} from both sides: ${a === 1 ? '' : a === -1 ? '-' : a}x = ${newC}`);
    }

    const rhs = c - b;
    if (a !== 1 && a !== -1) {
      steps.push(`Divide both sides by ${a}: x = ${rhs / a}`);
    }

    const solution = rhs / a;
    steps.push(`Solution: x = ${Number.isInteger(solution) ? solution : solution.toFixed(4)}`);

    return { steps, solution };
  },

  /* --- Regex Tester --- */
  initRegex() {
    const run = () => this.testRegex();
    document.getElementById('regexPattern').addEventListener('input', run);
    document.getElementById('regexText').addEventListener('input', run);
  },

  testRegex() {
    const patternInput = document.getElementById('regexPattern').value;
    const text = document.getElementById('regexText').value;
    const matchesEl = document.getElementById('regexMatches');
    const highlightEl = document.getElementById('regexHighlight');

    if (!patternInput) {
      matchesEl.innerHTML = 'Enter a regex pattern to test';
      highlightEl.textContent = text || 'Matches will be highlighted here';
      return;
    }

    try {
      let pattern = patternInput;
      let flags = 'g';
      const slashMatch = patternInput.match(/^\/(.+)\/([gimsuy]*)$/);
      if (slashMatch) {
        pattern = slashMatch[1];
        flags = slashMatch[2] || 'g';
      }

      const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      const matches = [...text.matchAll(regex)];

      matchesEl.innerHTML = `<span class="match-count">${matches.length}</span> match${matches.length !== 1 ? 'es' : ''} found`;

      if (matches.length === 0) {
        highlightEl.textContent = text || '(no matches)';
        return;
      }

      let highlighted = text;
      const sorted = matches.sort((a, b) => b.index - a.index);
      sorted.forEach(m => {
        highlighted = highlighted.slice(0, m.index) +
          `<mark>${escapeHtml(m[0])}</mark>` +
          highlighted.slice(m.index + m[0].length);
      });
      highlightEl.innerHTML = highlighted;
    } catch (err) {
      matchesEl.innerHTML = `<span class="regex-error">Invalid regex: ${escapeHtml(err.message)}</span>`;
      highlightEl.textContent = text;
    }
  },

  /* --- Vocabulary Matcher --- */
  vocabPairs: [],
  vocabSelected: null,
  vocabScore: 0,

  initVocab() {
    this.vocabPairs = store.get('vocabPairs', [
      { word: 'Ephemeral', def: 'Lasting a very short time' },
      { word: 'Ubiquitous', def: 'Present everywhere' },
      { word: 'Pragmatic', def: 'Dealing with things practically' },
      { word: 'Eloquent', def: 'Fluent and persuasive in speaking' }
    ]);

    document.getElementById('vocabForm').addEventListener('submit', e => {
      e.preventDefault();
      const word = document.getElementById('vocabWord').value.trim();
      const def = document.getElementById('vocabDef').value.trim();
      if (!word || !def) return;
      this.vocabPairs.push({ word, def });
      store.set('vocabPairs', this.vocabPairs);
      document.getElementById('vocabWord').value = '';
      document.getElementById('vocabDef').value = '';
    });

    document.getElementById('vocabStartBtn').addEventListener('click', () => this.startVocabDrill());
  },

  startVocabDrill() {
    if (this.vocabPairs.length < 2) {
      alert('Add at least 2 word-definition pairs to start.');
      return;
    }

    this.vocabScore = 0;
    this.vocabSelected = null;
    const shuffledWords = shuffle([...this.vocabPairs]);
    const shuffledDefs = shuffle([...this.vocabPairs]);

    document.getElementById('vocabScore').textContent = '0';
    document.getElementById('vocabTotal').textContent = shuffledWords.length;

    const wordsEl = document.getElementById('vocabWords');
    const defsEl = document.getElementById('vocabDefs');

    wordsEl.innerHTML = shuffledWords.map((p, i) =>
      `<li data-idx="${i}" data-word="${escapeHtml(p.word)}">${escapeHtml(p.word)}</li>`
    ).join('');

    defsEl.innerHTML = shuffledDefs.map((p, i) =>
      `<li data-idx="${i}" data-def="${escapeHtml(p.def)}" data-word="${escapeHtml(p.word)}">${escapeHtml(p.def)}</li>`
    ).join('');

    const handleClick = (el, type) => {
      if (el.classList.contains('matched')) return;

      if (type === 'word') {
        wordsEl.querySelectorAll('.selected').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        this.vocabSelected = { el, word: el.dataset.word, type: 'word' };
      } else {
        if (!this.vocabSelected || this.vocabSelected.type !== 'word') return;
        const wordEl = this.vocabSelected.el;
        if (el.dataset.word === this.vocabSelected.word) {
          el.classList.add('matched');
          wordEl.classList.add('matched');
          el.classList.remove('selected');
          this.vocabScore++;
          document.getElementById('vocabScore').textContent = this.vocabScore;
          this.vocabSelected = null;
          if (this.vocabScore === shuffledWords.length) {
            setTimeout(() => alert('Perfect score! Great job!'), 300);
          }
        } else {
          el.classList.add('wrong');
          wordEl.classList.add('wrong');
          setTimeout(() => {
            el.classList.remove('wrong', 'selected');
            wordEl.classList.remove('wrong', 'selected');
            this.vocabSelected = null;
          }, 600);
        }
      }
    };

    wordsEl.querySelectorAll('li').forEach(el => el.addEventListener('click', () => handleClick(el, 'word')));
    defsEl.querySelectorAll('li').forEach(el => el.addEventListener('click', () => handleClick(el, 'def')));
  },

  /* --- Unit Converter --- */
  units: {
    length: {
      m: 1, km: 1000, cm: 0.01, mm: 0.001,
      mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254
    },
    mass: {
      kg: 1, g: 0.001, mg: 0.000001,
      lb: 0.453592, oz: 0.0283495, t: 1000
    },
    temperature: { C: 'C', F: 'F', K: 'K' },
    energy: {
      J: 1, kJ: 1000, cal: 4.184, kcal: 4184,
      Wh: 3600, eV: 1.602e-19
    }
  },

  formulas: {
    length: [
      { name: 'Distance', formula: 'd = v × t', desc: 'Distance equals velocity times time' },
      { name: 'Area (rectangle)', formula: 'A = l × w', desc: 'Length times width' }
    ],
    mass: [
      { name: 'Density', formula: 'ρ = m / V', desc: 'Mass divided by volume' },
      { name: 'Force', formula: 'F = m × a', desc: "Newton's second law" }
    ],
    temperature: [
      { name: 'Celsius to Fahrenheit', formula: '°F = (°C × 9/5) + 32', desc: 'Standard conversion' },
      { name: 'Kinetic Energy', formula: 'KE = ½mv²', desc: 'Energy of a moving object' }
    ],
    energy: [
      { name: 'Kinetic Energy', formula: 'KE = ½mv²', desc: 'Energy of a moving object' },
      { name: 'Potential Energy', formula: 'PE = mgh', desc: 'Gravitational potential energy' },
      { name: 'E = mc²', formula: 'E = mc²', desc: 'Mass-energy equivalence' }
    ]
  },

  initConverter() {
    const cat = document.getElementById('convertCategory');
    cat.addEventListener('change', () => this.updateConverterUnits());
    document.getElementById('convertValue').addEventListener('input', () => this.convert());
    document.getElementById('convertFrom').addEventListener('change', () => this.convert());
    document.getElementById('convertTo').addEventListener('change', () => this.convert());
    this.updateConverterUnits();
  },

  updateConverterUnits() {
    const cat = document.getElementById('convertCategory').value;
    const units = Object.keys(this.units[cat]);
    const from = document.getElementById('convertFrom');
    const to = document.getElementById('convertTo');

    from.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    to.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    if (units.length > 1) to.selectedIndex = 1;

    this.renderFormulas(cat);
    this.convert();
  },

  convert() {
    const cat = document.getElementById('convertCategory').value;
    const val = parseFloat(document.getElementById('convertValue').value);
    const from = document.getElementById('convertFrom').value;
    const to = document.getElementById('convertTo').value;
    const resultEl = document.getElementById('convertResult');

    if (isNaN(val)) {
      resultEl.textContent = '—';
      return;
    }

    let result;
    if (cat === 'temperature') {
      result = this.convertTemp(val, from, to);
    } else {
      const base = val * this.units[cat][from];
      result = base / this.units[cat][to];
    }

    resultEl.textContent = typeof result === 'number'
      ? (Number.isInteger(result) ? result : result.toPrecision(6))
      : result;
  },

  convertTemp(val, from, to) {
    let celsius;
    if (from === 'C') celsius = val;
    else if (from === 'F') celsius = (val - 32) * 5 / 9;
    else celsius = val - 273.15;

    if (to === 'C') return celsius;
    if (to === 'F') return celsius * 9 / 5 + 32;
    return celsius + 273.15;
  },

  renderFormulas(cat) {
    const container = document.getElementById('formulaContent');
    const items = this.formulas[cat] || [];
    container.innerHTML = items.map(f => `
      <div class="formula-item">
        <strong>${escapeHtml(f.name)}</strong>
        <code>${escapeHtml(f.formula)}</code>
        <p>${escapeHtml(f.desc)}</p>
      </div>
    `).join('');
  }
};

/* ===== Utilities ===== */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ===== Flashcards ===== */
const Flashcards = {
  decks: [],
  activeDeckId: null,
  studying: false,
  order: [],
  index: 0,
  flipped: false,
  score: { correct: 0, wrong: 0 },
  graded: {},

  init() {
    this.decks = store.get('flashcardDecks', [
      {
        id: 1,
        name: 'Sample: JavaScript',
        cards: [
          { id: 101, front: 'What is a closure?', back: 'A function that retains access to its outer scope variables.' },
          { id: 102, front: 'What does === check?', back: 'Strict equality — same value and same type.' },
          { id: 103, front: 'What is the DOM?', back: 'Document Object Model — the page structure browsers render.' }
        ]
      }
    ]);

    document.getElementById('newDeckBtn').addEventListener('click', () => this.createDeck());
    document.getElementById('deleteDeckBtn').addEventListener('click', () => this.deleteDeck());
    document.getElementById('deckNameInput').addEventListener('input', e => this.renameDeck(e.target.value));
    document.getElementById('cardAddForm').addEventListener('submit', e => {
      e.preventDefault();
      this.addCard();
    });
    document.getElementById('startStudyBtn').addEventListener('click', () => this.startStudy());
    document.getElementById('exitStudyBtn').addEventListener('click', () => this.exitStudy());
    document.getElementById('restartStudyBtn').addEventListener('click', () => this.startStudy());
    document.getElementById('studyAgainBtn').addEventListener('click', () => this.startStudy());
    document.getElementById('shuffleToggle').addEventListener('change', () => {
      if (this.studying) this.startStudy();
    });

    document.getElementById('flashcardScene').addEventListener('click', () => this.flip());
    document.getElementById('prevCardBtn').addEventListener('click', () => this.prev());
    document.getElementById('nextCardBtn').addEventListener('click', () => this.next());
    document.getElementById('markCorrectBtn').addEventListener('click', () => this.grade(true));
    document.getElementById('markWrongBtn').addEventListener('click', () => this.grade(false));

    document.getElementById('importDeckBtn').addEventListener('click', () => {
      document.getElementById('deckFileInput').click();
    });
    document.getElementById('exportDeckBtn').addEventListener('click', () => this.exportDeck());
    document.getElementById('deckFileInput').addEventListener('change', e => {
      if (e.target.files[0]) this.importDeck(e.target.files[0]);
      e.target.value = '';
    });

    document.addEventListener('keydown', e => this.onKeydown(e));

    this.renderDeckList();
    this.refreshView();
  },

  save() {
    store.set('flashcardDecks', this.decks);
  },

  getDeck(id) {
    return this.decks.find(d => d.id === id);
  },

  createDeck() {
    const name = prompt('Deck name:', 'New Deck');
    if (!name || !name.trim()) return;
    const deck = { id: Date.now(), name: name.trim(), cards: [] };
    this.decks.push(deck);
    this.activeDeckId = deck.id;
    this.save();
    this.renderDeckList();
    this.refreshView();
    Toast.show('Deck created');
  },

  deleteDeck() {
    if (!this.activeDeckId) return;
    const deck = this.getDeck(this.activeDeckId);
    if (!confirm(`Delete "${deck.name}" and all its cards?`)) return;
    this.decks = this.decks.filter(d => d.id !== this.activeDeckId);
    this.activeDeckId = this.decks[0]?.id || null;
    this.studying = false;
    this.save();
    this.renderDeckList();
    this.refreshView();
  },

  renameDeck(name) {
    const deck = this.getDeck(this.activeDeckId);
    if (!deck) return;
    deck.name = name.trim() || 'Untitled Deck';
    this.save();
    this.renderDeckList();
  },

  selectDeck(id) {
    this.activeDeckId = id;
    this.studying = false;
    this.renderDeckList();
    this.refreshView();
  },

  addCard() {
    const deck = this.getDeck(this.activeDeckId);
    if (!deck) return;
    const front = document.getElementById('cardFrontInput').value.trim();
    const back = document.getElementById('cardBackInput').value.trim();
    if (!front || !back) return;
    deck.cards.push({ id: Date.now(), front, back });
    document.getElementById('cardFrontInput').value = '';
    document.getElementById('cardBackInput').value = '';
    this.save();
    this.renderCardList();
    this.renderDeckList();
  },

  deleteCard(cardId) {
    const deck = this.getDeck(this.activeDeckId);
    if (!deck) return;
    deck.cards = deck.cards.filter(c => c.id !== cardId);
    this.save();
    this.renderCardList();
    this.renderDeckList();
  },

  renderDeckList() {
    const list = document.getElementById('deckList');
    document.getElementById('exportDeckBtn').disabled = !this.activeDeckId;

    if (this.decks.length === 0) {
      list.innerHTML = '<li class="card-edit-empty">No decks yet</li>';
      return;
    }

    list.innerHTML = this.decks.map(d => `
      <li class="deck-item ${d.id === this.activeDeckId ? 'active' : ''}" data-id="${d.id}">
        <div class="deck-item-info">
          <strong>${escapeHtml(d.name)}</strong>
          <span>${d.cards.length} card${d.cards.length !== 1 ? 's' : ''}</span>
        </div>
      </li>
    `).join('');

    list.querySelectorAll('.deck-item').forEach(el => {
      el.addEventListener('click', () => this.selectDeck(Number(el.dataset.id)));
    });
  },

  renderCardList() {
    const list = document.getElementById('cardEditList');
    const deck = this.getDeck(this.activeDeckId);
    if (!deck || deck.cards.length === 0) {
      list.innerHTML = '<li class="card-edit-empty">Add cards to this deck</li>';
      return;
    }

    list.innerHTML = deck.cards.map(c => `
      <li class="card-edit-item">
        <span class="card-front">${escapeHtml(c.front)}</span>
        <span class="card-back">${escapeHtml(c.back)}</span>
        <button class="card-edit-delete" data-id="${c.id}" aria-label="Delete card">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </li>
    `).join('');

    list.querySelectorAll('.card-edit-delete').forEach(el => {
      el.addEventListener('click', () => this.deleteCard(Number(el.dataset.id)));
    });
  },

  refreshView() {
    const empty = document.getElementById('flashEmpty');
    const editor = document.getElementById('flashEditor');
    const study = document.getElementById('flashStudy');
    const kbd = document.getElementById('flashKbdHints');
    const deck = this.getDeck(this.activeDeckId);

    if (!deck) {
      empty.hidden = false;
      editor.hidden = true;
      study.hidden = true;
      kbd.hidden = true;
      return;
    }

    empty.hidden = true;

    if (this.studying) {
      editor.hidden = true;
      study.hidden = false;
      kbd.hidden = false;
    } else {
      editor.hidden = false;
      study.hidden = true;
      kbd.hidden = true;
      document.getElementById('deckNameInput').value = deck.name;
      this.renderCardList();
    }
  },

  startStudy() {
    const deck = this.getDeck(this.activeDeckId);
    if (!deck || deck.cards.length === 0) {
      Toast.show('Add at least one card to start', 'error');
      return;
    }

    this.studying = true;
    this.index = 0;
    this.flipped = false;
    this.score = { correct: 0, wrong: 0 };
    this.graded = {};

    this.order = deck.cards.map(c => c.id);
    if (document.getElementById('shuffleToggle').checked) {
      this.order = shuffle([...this.order]);
    }

    document.getElementById('studyComplete').hidden = true;
    document.getElementById('flashcardScene').hidden = false;
    document.querySelector('.study-nav').hidden = false;
    document.querySelector('.flip-hint').hidden = false;

    this.refreshView();
    this.showCard();
    this.updateScore();
  },

  exitStudy() {
    this.studying = false;
    this.refreshView();
  },

  currentCard() {
    const deck = this.getDeck(this.activeDeckId);
    if (!deck) return null;
    const id = this.order[this.index];
    return deck.cards.find(c => c.id === id);
  },

  showCard() {
    const card = this.currentCard();
    if (!card) return;

    const cardId = this.order[this.index];
    const wasGraded = this.graded[cardId] !== undefined;

    document.getElementById('cardFrontText').textContent = card.front;
    document.getElementById('cardBackText').textContent = card.back;

    this.flipped = wasGraded;
    document.getElementById('flashcard').classList.toggle('flipped', wasGraded);
    document.getElementById('studyGrade').hidden = !wasGraded;

    document.getElementById('studyProgress').textContent =
      `${this.index + 1}/${this.order.length}`;
    document.getElementById('prevCardBtn').disabled = this.index === 0;
    document.getElementById('nextCardBtn').disabled = this.index === this.order.length - 1;
  },

  flip() {
    if (!this.studying || document.getElementById('studyComplete').hidden === false) return;
    this.flipped = !this.flipped;
    document.getElementById('flashcard').classList.toggle('flipped', this.flipped);
    document.getElementById('studyGrade').hidden = !this.flipped;
  },

  prev() {
    if (this.index <= 0) return;
    this.index--;
    this.showCard();
  },

  next() {
    if (this.index >= this.order.length - 1) {
      this.finishStudy();
      return;
    }
    this.index++;
    this.showCard();
  },

  grade(correct) {
    const cardId = this.order[this.index];
    if (this.graded[cardId] === undefined) {
      this.graded[cardId] = correct;
      if (correct) this.score.correct++;
      else this.score.wrong++;
      this.updateScore();
    } else if (this.graded[cardId] !== correct) {
      if (this.graded[cardId]) { this.score.correct--; this.score.wrong++; }
      else { this.score.wrong--; this.score.correct++; }
      this.graded[cardId] = correct;
      this.updateScore();
    }

    if (this.index < this.order.length - 1) {
      setTimeout(() => this.next(), 300);
    } else {
      setTimeout(() => this.finishStudy(), 300);
    }
  },

  updateScore() {
    document.getElementById('scoreCorrect').textContent = this.score.correct;
    document.getElementById('scoreWrong').textContent = this.score.wrong;
  },

  finishStudy() {
    const total = this.order.length;
    const graded = Object.keys(this.graded).length;
    document.getElementById('flashcardScene').hidden = true;
    document.querySelector('.study-nav').hidden = true;
    document.querySelector('.flip-hint').hidden = true;

    const complete = document.getElementById('studyComplete');
    complete.hidden = false;
    const pct = total ? Math.round((this.score.correct / total) * 100) : 0;
    document.getElementById('studyCompleteSummary').textContent =
      `You got ${this.score.correct} of ${total} correct (${pct}%). Missed: ${this.score.wrong}. Cards reviewed: ${graded}.`;
  },

  exportDeck() {
    const deck = this.getDeck(this.activeDeckId);
    if (!deck) return;
    const data = { app: 'StudyHub', type: 'flashcard-deck', exported: new Date().toISOString(), deck };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${deck.name.replace(/[<>:"/\\|?*]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    Toast.show(`Exported "${deck.name}"`);
  },

  importDeck(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        let deck = null;

        if (data.type === 'flashcard-deck' && data.deck) {
          deck = data.deck;
        } else if (data.name && Array.isArray(data.cards)) {
          deck = data;
        } else if (Array.isArray(data.decks) && data.decks[0]) {
          deck = data.decks[0];
        } else {
          throw new Error('Invalid flashcard deck file');
        }

        deck.id = Date.now();
        deck.name = deck.name || 'Imported Deck';
        deck.cards = (deck.cards || []).map(c => ({
          id: Date.now() + Math.random(),
          front: c.front || '',
          back: c.back || ''
        })).filter(c => c.front && c.back);

        this.decks.push(deck);
        this.activeDeckId = deck.id;
        this.save();
        this.renderDeckList();
        this.refreshView();
        Toast.show(`Imported "${deck.name}" (${deck.cards.length} cards)`);
      } catch (err) {
        Toast.show(err.message || 'Could not import deck', 'error');
      }
    };
    reader.readAsText(file);
  },

  onKeydown(e) {
    const section = document.getElementById('flashcards');
    if (!section.classList.contains('active') || !this.studying) return;
    if (e.target.matches('input, textarea, select')) return;
    if (document.getElementById('studyComplete').hidden === false) return;

    if (e.code === 'Space') {
      e.preventDefault();
      this.flip();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      this.next();
    }
  }
};

/* ===== AI Chat ===== */
const AIChat = {
  messages: [],
  loading: false,
  online: false,
  API: '/api/chat',

  init() {
    this.messages = store.get('aiChatHistory', []);
    if (this.messages.length > 0) this.renderMessages();

    document.getElementById('aiChatForm').addEventListener('submit', e => {
      e.preventDefault();
      this.send();
    });

    document.getElementById('aiChatInput').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    });

    document.getElementById('aiChatInput').addEventListener('input', e => {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    });

    document.getElementById('clearChatBtn').addEventListener('click', () => this.clearChat());

    document.querySelectorAll('.ai-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('aiChatInput').value = chip.dataset.prompt;
        this.send();
      });
    });

    this.checkHealth();
  },

  async checkHealth() {
    const badge = document.getElementById('aiStatusBadge');
    const navDot = document.getElementById('aiNavStatus');
    const banner = document.getElementById('aiSetupBanner');

    if (window.location.protocol === 'file:') {
      this.online = false;
      badge.textContent = 'Offline — run server';
      badge.className = 'ai-status-badge offline';
      navDot.className = 'nav-status offline';
      banner.hidden = false;
      return;
    }

    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      this.online = data.ai;
      if (data.ai) {
        badge.textContent = `Online · ${data.model}`;
        badge.className = 'ai-status-badge online';
        navDot.className = 'nav-status online';
        banner.hidden = true;
      } else {
        badge.textContent = 'Offline — no API key';
        badge.className = 'ai-status-badge offline';
        navDot.className = 'nav-status offline';
        banner.hidden = false;
      }
    } catch {
      this.online = false;
      badge.textContent = 'Offline — start server';
      badge.className = 'ai-status-badge offline';
      navDot.className = 'nav-status offline';
      banner.hidden = false;
    }
  },

  save() {
    store.set('aiChatHistory', this.messages);
  },

  clearChat() {
    if (this.loading) return;
    if (this.messages.length && !confirm('Clear all chat messages?')) return;
    this.messages = [];
    this.save();
    document.getElementById('aiMessages').innerHTML = `
      <div class="ai-welcome">
        <div class="ai-avatar">AI</div>
        <div class="ai-bubble ai-bubble-assistant">
          <p>Hi! I'm your StudyHub AI tutor. Ask me to explain topics, create quizzes, summarize notes, or help you study any subject.</p>
        </div>
      </div>`;
  },

  formatText(text) {
    const escaped = escapeHtml(text);
    return escaped
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .split(/\n\n+/)
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');
  },

  renderMessages() {
    const container = document.getElementById('aiMessages');
    if (this.messages.length === 0) return;

    container.innerHTML = this.messages.map(msg => `
      <div class="ai-msg-row ${msg.role}">
        <div class="ai-avatar">${msg.role === 'user' ? 'You' : 'AI'}</div>
        <div class="ai-bubble ${msg.role === 'assistant' ? 'ai-bubble-assistant' : ''}">
          ${msg.role === 'assistant' ? this.formatText(msg.content) : `<p>${escapeHtml(msg.content)}</p>`}
        </div>
      </div>
    `).join('');
    this.scrollToBottom();
  },

  appendMessage(role, content, isError = false) {
    const container = document.getElementById('aiMessages');
    const welcome = container.querySelector('.ai-welcome');
    if (welcome) welcome.remove();

    const row = document.createElement('div');
    row.className = `ai-msg-row ${role}`;
    row.innerHTML = `
      <div class="ai-avatar">${role === 'user' ? 'You' : 'AI'}</div>
      <div class="ai-bubble ${role === 'assistant' ? 'ai-bubble-assistant' : ''}${isError ? ' error' : ''}">
        ${role === 'assistant' && !isError ? this.formatText(content) : `<p>${escapeHtml(content)}</p>`}
      </div>`;
    container.appendChild(row);
    this.scrollToBottom();
  },

  showTyping() {
    const container = document.getElementById('aiMessages');
    const el = document.createElement('div');
    el.className = 'ai-msg-row assistant';
    el.id = 'aiTyping';
    el.innerHTML = `
      <div class="ai-avatar">AI</div>
      <div class="ai-bubble ai-bubble-assistant">
        <div class="ai-typing"><span></span><span></span><span></span></div>
      </div>`;
    container.appendChild(el);
    this.scrollToBottom();
  },

  hideTyping() {
    document.getElementById('aiTyping')?.remove();
  },

  scrollToBottom() {
    const el = document.getElementById('aiMessages');
    el.scrollTop = el.scrollHeight;
  },

  async send() {
    if (this.loading) return;
    const input = document.getElementById('aiChatInput');
    const text = input.value.trim();
    if (!text) return;

    if (window.location.protocol === 'file:') {
      Toast.show('Run npm start and open http://localhost:3000', 'error');
      document.getElementById('aiSetupBanner').hidden = false;
      return;
    }

    if (!this.online) {
      await this.checkHealth();
      if (!this.online) {
        Toast.show('AI is offline — check your API key and server', 'error');
        return;
      }
    }

    this.messages.push({ role: 'user', content: text });
    this.appendMessage('user', text);
    input.value = '';
    input.style.height = 'auto';
    this.save();

    this.loading = true;
    document.getElementById('aiSendBtn').disabled = true;
    this.showTyping();

    try {
      const res = await fetch(this.API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: this.messages })
      });

      const data = await res.json();
      this.hideTyping();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      this.messages.push({ role: 'assistant', content: data.message });
      this.appendMessage('assistant', data.message);
      this.save();
    } catch (err) {
      this.hideTyping();
      this.appendMessage('assistant', err.message, true);
    }

    this.loading = false;
    document.getElementById('aiSendBtn').disabled = false;
    input.focus();
  }
};

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Nav.init();
  Backup.init();
  initDate();
  Pomodoro.init();
  Todo.init();
  Notes.init();
  Progress.init();
  Prompts.init();
  Tools.init();
  Flashcards.init();
  AIChat.init();
});
