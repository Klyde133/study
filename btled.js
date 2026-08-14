/* ===== BTLed StudyHub — Schedule, HE Tools, Math Tools, Universal Tools ===== */

const BTLED_KEYS = [
  'scheduleClasses', 'recipeIngredients', 'menuPlanner', 'budgetData',
  'fabricProject', 'gpaGrades', 'studyScheduler', 'structuredNotes',
  'mathFormulaCards', 'pomodoroTheme', 'lastSection'
];

const PH_FOODS = [
  { name: 'Steamed Rice (1 cup)', cal: 205, protein: 4.3, carbs: 44.5, fat: 0.4, pinggang: 'go' },
  { name: 'Sinangag (garlic rice)', cal: 250, protein: 5, carbs: 48, fat: 4, pinggang: 'go' },
  { name: 'Chicken Adobo (1 serving)', cal: 350, protein: 28, carbs: 8, fat: 22, pinggang: 'grow' },
  { name: 'Pork Sinigang', cal: 320, protein: 25, carbs: 12, fat: 18, pinggang: 'grow' },
  { name: 'Tinola (chicken)', cal: 280, protein: 30, carbs: 6, fat: 14, pinggang: 'grow' },
  { name: 'Pinakbet', cal: 120, protein: 4, carbs: 14, fat: 6, pinggang: 'glow' },
  { name: 'Ensaladang Talong', cal: 90, protein: 2, carbs: 8, fat: 5, pinggang: 'glow' },
  { name: 'Banana (saba, 1 pc)', cal: 105, protein: 1.3, carbs: 27, fat: 0.3, pinggang: 'glow' },
  { name: 'Pancit Canton', cal: 380, protein: 12, carbs: 52, fat: 14, pinggang: 'go' },
  { name: 'Lumpia Shanghai (3 pcs)', cal: 270, protein: 10, carbs: 18, fat: 18, pinggang: 'grow' }
];

const SCHEDULE_COLORS = ['#f97316', '#6366f1', '#10b981', '#ec4899', '#8b5cf6', '#14b8a6', '#ef4444'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_FULL = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday' };

const DEMO_SCHEDULE = [
  { id: 1, name: 'Food & Nutrition', code: 'TLE-HE 101', room: 'HE Kitchen Lab', start: '07:30', end: '09:00', days: ['Mon', 'Wed'], color: '#f97316' },
  { id: 2, name: 'Clothing & Textiles', code: 'TLE-HE 102', room: 'Sewing Lab B', start: '09:15', end: '10:45', days: ['Mon', 'Wed'], color: '#ec4899' },
  { id: 3, name: 'Modern Mathematics', code: 'MATH 201', room: 'Room 204', start: '11:00', end: '12:30', days: ['Tue', 'Thu'], color: '#6366f1' },
  { id: 4, name: 'Home Management', code: 'TLE-HE 103', room: 'HE Demo Room', start: '13:00', end: '14:30', days: ['Tue', 'Fri'], color: '#10b981' },
  { id: 5, name: 'Statistics & Probability', code: 'MATH 202', room: 'Room 206', start: '07:30', end: '09:00', days: ['Thu', 'Fri'], color: '#8b5cf6' },
  { id: 6, name: 'BTLed Professional Education', code: 'PROF-ED 301', room: 'Room 101', start: '09:15', end: '11:00', days: ['Mon', 'Thu'], color: '#14b8a6' }
];

const STITCHES = [
  { name: 'Straight Stitch', use: 'Seams, topstitching', settings: 'Stitch length 2.5–3.0 mm', tip: 'Guide fabric edge along foot line for even seams.' },
  { name: 'Zigzag Stitch', use: 'Finishing raw edges, stretch seams', settings: 'Width 3–4, Length 1.5–2', tip: 'Use on knits to prevent thread breakage.' },
  { name: 'Buttonhole', use: 'Creating buttonholes', settings: 'Auto or 4-step per manual', tip: 'Interface the area before stitching.' },
  { name: 'Blind Hem', use: 'Invisible hems on skirts/pants', settings: 'Blind hem foot required', tip: 'Fold fabric correctly per foot guide.' },
  { name: 'Overlock/Serger', use: 'Seaming and finishing edges', settings: '3-thread or 4-thread', tip: 'Practice on scrap before garment fabric.' }
];

const TROUBLESHOOT = [
  { problem: 'Skipped stitches', fix: 'Rethread machine, change needle, check tension.' },
  { problem: 'Thread bunching underneath', fix: 'Rethread top thread, clean bobbin area, adjust top tension.' },
  { problem: 'Breaking needles', fix: 'Use correct needle size/type for fabric weight.' },
  { problem: 'Fabric not feeding', fix: 'Clean feed dogs, adjust presser foot pressure.' }
];

const RESOURCES = [
  { title: 'DepEd K to 12 TLE-HE Curriculum Guide', type: 'DepEd', url: 'https://www.deped.gov.ph/' },
  { title: 'TESDA Competency Standards — Cookery NC II', type: 'TESDA', url: 'https://www.tesda.gov.ph/' },
  { title: 'TESDA Dressmaking NC II Standards', type: 'TESDA', url: 'https://www.tesda.gov.ph/' },
  { title: 'Pinggang Pinoy — DOST-FNRI', type: 'Nutrition', url: 'https://www.fnri.dost.gov.ph/' },
  { title: 'LET Review — Professional Education', type: 'LET', url: 'https://www.prc.gov.ph/' },
  { title: 'BTLed Program Standards (CHED)', type: 'CHED', url: 'https://ched.gov.ph/' }
];

const NOTE_TEMPLATES = {
  cornell: `═══════════════════════════════════════
CORNELL NOTES
Topic: _______________  Date: ___________
───────────────────────────────────────
KEY QUESTIONS          │  NOTES
                       │
                       │
                       │
───────────────────────────────────────
SUMMARY:
═══════════════════════════════════════`,
  recipe: `┌─────────────────────────────────────┐
│ RECIPE CARD                         │
│ Name: _____________________________ │
│ Yield: ______  Prep: ___ Cook: ___  │
├─────────────────────────────────────┤
│ INGREDIENTS          │ AMOUNT       │
│                      │              │
├─────────────────────────────────────┤
│ PROCEDURE:                          │
│ 1.                                  │
│ 2.                                  │
├─────────────────────────────────────┤
│ NUTRITION NOTES / COST:               │
└─────────────────────────────────────┘`,
  math: `MATH PROBLEM FORMAT
─────────────────────
Given: 
Find: 
Formula: 
Solution:
  Step 1:
  Step 2:
Answer: 
Check: `
};

const BTLed = {
  schedule: [],
  editingId: null,
  selectedColor: SCHEDULE_COLORS[0],
  selectedDays: [],

  init() {
    this.hideLoader();
    this.schedule = store.get('scheduleClasses', []);
    this.initTabs();
    this.initSchedule();
    this.initHETools();
    this.initMathTools();
    this.initUniversalTools();
    this.initExport();
    this.setupAutoSave();
    this.restoreLastSection();
  },

  hideLoader() {
    setTimeout(() => {
      document.getElementById('btledLoader')?.classList.add('hidden');
    }, 1400);
  },

  save(key, data) {
    store.set(key, data);
    this.flashAutoSave();
  },

  flashAutoSave() {
    const el = document.getElementById('autosaveIndicator');
    if (!el) return;
    el.classList.add('show');
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => el.classList.remove('show'), 1500);
  },

  restoreLastSection() {
    const last = store.get('lastSection', null);
    if (last && document.querySelector(`[data-section="${last}"]`)) Nav.go(last);
  },

  initTabs() {
    document.querySelectorAll('[data-btled-tabs]').forEach(container => {
      const tabs = container.querySelectorAll('.btled-tab');
      const panels = container.querySelectorAll('.btled-panel');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          tab.classList.add('active');
          container.querySelector(`#${tab.dataset.panel}`)?.classList.add('active');
        });
      });
    });
  },

  /* ===== Schedule ===== */
  initSchedule() {
    document.querySelectorAll('.day-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const d = btn.dataset.day;
        if (this.selectedDays.includes(d)) this.selectedDays = this.selectedDays.filter(x => x !== d);
        else this.selectedDays.push(d);
      });
    });

    document.querySelectorAll('.color-swatch').forEach(s => {
      s.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('active'));
        s.classList.add('active');
        this.selectedColor = s.dataset.color;
      });
    });
    document.querySelector('.color-swatch')?.classList.add('active');

    document.getElementById('scheduleForm')?.addEventListener('submit', e => {
      e.preventDefault();
      this.saveScheduleClass();
    });
    document.getElementById('clearScheduleForm')?.addEventListener('click', () => this.resetScheduleForm());
    document.getElementById('loadDemoSchedule')?.addEventListener('click', () => this.loadDemoSchedule());
    document.getElementById('exportSchedulePdf')?.addEventListener('click', () => ExportDoc.exportSchedule('pdf'));
    document.getElementById('exportScheduleDoc')?.addEventListener('click', () => ExportDoc.exportSchedule('doc'));

    this.renderSchedule();
  },

  resetScheduleForm() {
    this.editingId = null;
    document.getElementById('schedName').value = '';
    document.getElementById('schedCode').value = '';
    document.getElementById('schedRoom').value = '';
    document.getElementById('schedStart').value = '';
    document.getElementById('schedEnd').value = '';
    this.selectedDays = [];
    document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('scheduleSubmitBtn').textContent = 'Add Class';
  },

  saveScheduleClass() {
    const name = document.getElementById('schedName').value.trim();
    const code = document.getElementById('schedCode').value.trim();
    const room = document.getElementById('schedRoom').value.trim();
    const start = document.getElementById('schedStart').value;
    const end = document.getElementById('schedEnd').value;
    if (!name || !start || !end || this.selectedDays.length === 0) {
      Toast.show('Fill in name, times, and at least one day', 'error');
      return;
    }
    const entry = { id: this.editingId || Date.now(), name, code, room, start, end, days: [...this.selectedDays], color: this.selectedColor };
    if (this.editingId) {
      const i = this.schedule.findIndex(c => c.id === this.editingId);
      if (i >= 0) this.schedule[i] = entry;
    } else {
      this.schedule.push(entry);
    }
    this.save('scheduleClasses', this.schedule);
    this.resetScheduleForm();
    this.renderSchedule();
    Toast.show('Class saved');
  },

  loadDemoSchedule() {
    if (this.schedule.length && !confirm('Replace current schedule with demo?')) return;
    this.schedule = DEMO_SCHEDULE.map(c => ({ ...c, id: Date.now() + Math.random() }));
    this.save('scheduleClasses', this.schedule);
    this.renderSchedule();
    Toast.show('BTLed demo schedule loaded');
  },

  editScheduleClass(id) {
    const c = this.schedule.find(x => x.id === id);
    if (!c) return;
    this.editingId = c.id;
    document.getElementById('schedName').value = c.name;
    document.getElementById('schedCode').value = c.code || '';
    document.getElementById('schedRoom').value = c.room || '';
    document.getElementById('schedStart').value = c.start;
    document.getElementById('schedEnd').value = c.end;
    this.selectedDays = [...c.days];
    this.selectedColor = c.color;
    document.querySelectorAll('.day-btn').forEach(b => b.classList.toggle('active', c.days.includes(b.dataset.day)));
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('active', s.dataset.color === c.color));
    document.getElementById('scheduleSubmitBtn').textContent = 'Update Class';
    document.getElementById('schedName').scrollIntoView({ behavior: 'smooth' });
  },

  deleteScheduleClass(id) {
    this.schedule = this.schedule.filter(c => c.id !== id);
    this.save('scheduleClasses', this.schedule);
    this.renderSchedule();
  },

  formatTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
  },

  renderSchedule() {
    const grid = document.getElementById('timetableGrid');
    const list = document.getElementById('subjectListBar');
    if (!grid) return;

    grid.innerHTML = DAYS.map(day => {
      const classes = this.schedule
        .filter(c => c.days.includes(day))
        .sort((a, b) => a.start.localeCompare(b.start));
      return `<div class="timetable-day"><h3>${DAY_FULL[day]}</h3>
        ${classes.map(c => `
          <div class="schedule-block" style="background:${c.color}" data-id="${c.id}">
            <strong>${escapeHtml(c.name)}</strong>
            <span>${escapeHtml(c.code || '')}</span>
            <span>${this.formatTime(c.start)} – ${this.formatTime(c.end)}</span>
            <span>${escapeHtml(c.room || '')}</span>
          </div>`).join('') || '<p style="font-size:0.75rem;color:var(--text-muted);text-align:center">No classes</p>'}
      </div>`;
    }).join('');

    grid.querySelectorAll('.schedule-block').forEach(el => {
      el.addEventListener('click', () => this.editScheduleClass(Number(el.dataset.id)));
    });

    if (list) {
      list.innerHTML = `<h3 style="font-size:0.9375rem;margin-bottom:0.5rem">All Subjects (${this.schedule.length})</h3>
        <div class="subject-chips">${this.schedule.map(c => `
          <div class="subject-chip">
            <span class="subject-chip-dot" style="background:${c.color}"></span>
            ${escapeHtml(c.name)} (${escapeHtml(c.code || '—')})
            <button data-del="${c.id}" aria-label="Delete">×</button>
          </div>`).join('') || '<span style="color:var(--text-muted);font-size:0.875rem">No subjects yet</span>'}
        </div>`;
      list.querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); this.deleteScheduleClass(Number(btn.dataset.del)); });
      });
    }
  },

  /* ===== HE Tools ===== */
  initHETools() {
    this.initRecipe();
    this.initNutrition();
    this.initFabric();
    this.initMenu();
    this.initBudget();
    this.initSewing();
  },

  initRecipe() {
    let ingredients = store.get('recipeIngredients', [
      { name: 'Flour', amount: 2, unit: 'cup' },
      { name: 'Sugar', amount: 1, unit: 'cup' },
      { name: 'Milk', amount: 240, unit: 'ml' }
    ]);
    const render = () => {
      const list = document.getElementById('recipeList');
      if (!list) return;
      list.innerHTML = ingredients.map((ing, i) => `
        <div class="ingredient-row">
          <input value="${escapeHtml(ing.name)}" data-i="${i}" data-f="name">
          <input type="number" value="${ing.amount}" step="any" data-i="${i}" data-f="amount">
          <select data-i="${i}" data-f="unit">${['cup','tbsp','tsp','g','ml','oz'].map(u =>
            `<option ${ing.unit===u?'selected':''}>${u}</option>`).join('')}</select>
          <button class="btn btn-secondary btn-sm" data-rm="${i}">×</button>
        </div>`).join('');
      list.querySelectorAll('input,select').forEach(el => {
        el.addEventListener('change', () => {
          const i = Number(el.dataset.i);
          ingredients[i][el.dataset.f] = el.dataset.f === 'amount' ? parseFloat(el.value) : el.value;
          this.save('recipeIngredients', ingredients);
        });
      });
      list.querySelectorAll('[data-rm]').forEach(btn => {
        btn.addEventListener('click', () => {
          ingredients.splice(Number(btn.dataset.rm), 1);
          this.save('recipeIngredients', ingredients);
          render();
        });
      });
    };
    document.getElementById('addIngredient')?.addEventListener('click', () => {
      ingredients.push({ name: 'New ingredient', amount: 1, unit: 'cup' });
      this.save('recipeIngredients', ingredients);
      render();
    });
    document.getElementById('scaleRecipe')?.addEventListener('click', () => {
      const orig = parseFloat(document.getElementById('origServings').value) || 1;
      const target = parseFloat(document.getElementById('targetServings').value) || 1;
      const factor = target / orig;
      const conv = { cup: 240, tbsp: 15, tsp: 5, g: 1, ml: 1, oz: 28.35 };
      let out = `<strong>Scaled to ${target} servings (${factor.toFixed(2)}×):</strong><ul>`;
      ingredients.forEach(ing => {
        const scaled = ing.amount * factor;
        const ml = scaled * (conv[ing.unit] || 1);
        out += `<li>${escapeHtml(ing.name)}: ${scaled.toFixed(2)} ${ing.unit}`;
        if (ing.unit === 'cup') out += ` ≈ ${(ml).toFixed(0)} ml / ${(ml/240).toFixed(2)} cups`;
        if (ing.unit === 'tbsp') out += ` ≈ ${(ml).toFixed(0)} ml`;
        out += '</li>';
      });
      out += '</ul>';
      document.getElementById('recipeResult').innerHTML = out;
    });
    document.getElementById('convertUnits')?.addEventListener('click', () => {
      const val = parseFloat(document.getElementById('unitConvertVal').value) || 0;
      const from = document.getElementById('unitConvertFrom').value;
      const map = { cup: 240, tbsp: 15, tsp: 5, ml: 1, g: 1 };
      const ml = val * (map[from] || 1);
      document.getElementById('unitConvertResult').innerHTML =
        `<strong>${val} ${from}</strong> = ${ml.toFixed(1)} ml = ${(ml/240).toFixed(3)} cups = ${(ml/15).toFixed(2)} tbsp`;
    });
    render();
  },

  initNutrition() {
    const grid = document.getElementById('foodGrid');
    const detail = document.getElementById('nutritionDetail');
    if (!grid) return;
    let selected = [];
    grid.innerHTML = PH_FOODS.map((f, i) => `
      <div class="food-card" data-i="${i}">
        <strong>${escapeHtml(f.name)}</strong>
        <span>${f.cal} kcal · P${f.protein}g C${f.carbs}g F${f.fat}g</span>
      </div>`).join('');
    grid.querySelectorAll('.food-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
        const i = Number(card.dataset.i);
        if (selected.includes(i)) selected = selected.filter(x => x !== i);
        else selected.push(i);
        this.updateNutrition(selected, detail);
      });
    });
  },

  updateNutrition(selected, detail) {
    if (!detail) return;
    if (!selected.length) { detail.innerHTML = 'Select foods to build a Pinggang Pinoy meal plan'; return; }
    const foods = selected.map(i => PH_FOODS[i]);
    const totals = foods.reduce((a, f) => ({
      cal: a.cal + f.cal, protein: a.protein + f.protein, carbs: a.carbs + f.carbs, fat: a.fat + f.fat
    }), { cal: 0, protein: 0, carbs: 0, fat: 0 });
    const byPlate = { go: [], grow: [], glow: [] };
    foods.forEach(f => byPlate[f.pinggang].push(f.name));
    detail.innerHTML = `
      <div class="result-box he"><strong>Meal Totals:</strong> ${totals.cal.toFixed(0)} kcal · Protein ${totals.protein.toFixed(1)}g · Carbs ${totals.carbs.toFixed(1)}g · Fat ${totals.fat.toFixed(1)}g</div>
      <div class="pinggang-plate">
        <div class="plate-section plate-go"><strong>GO (Energy)</strong><br>${byPlate.go.join(', ') || '—'}</div>
        <div class="plate-section plate-grow"><strong>GROW (Protein)</strong><br>${byPlate.grow.join(', ') || '—'}</div>
        <div class="plate-section plate-glow"><strong>GLOW (Vitamins)</strong><br>${byPlate.glow.join(', ') || '—'}</div>
      </div>`;
  },

  initFabric() {
    const calc = () => {
      const width = parseFloat(document.getElementById('fabricWidth').value) || 0;
      const length = parseFloat(document.getElementById('fabricLength').value) || 0;
      const repeat = parseFloat(document.getElementById('patternRepeat').value) || 0;
      const price = parseFloat(document.getElementById('fabricPrice').value) || 0;
      let yards = length / 36;
      if (repeat > 0) yards = Math.ceil(length / repeat) * repeat / 36;
      const cost = yards * price;
      document.getElementById('fabricResult').innerHTML =
        `<strong>Yardage:</strong> ${yards.toFixed(2)} yards (${(yards * 36).toFixed(1)} inches)<br>
         <strong>Estimated cost:</strong> ₱${cost.toFixed(2)}<br>
         <strong>Fabric width:</strong> ${width}" — add 15% for seam allowance on complex patterns.`;
      this.save('fabricProject', { width, length, repeat, price });
    };
    ['fabricWidth','fabricLength','patternRepeat','fabricPrice'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', calc);
    });
    const saved = store.get('fabricProject', {});
    if (saved.width) document.getElementById('fabricWidth').value = saved.width;
    if (saved.length) document.getElementById('fabricLength').value = saved.length;
    if (saved.repeat) document.getElementById('patternRepeat').value = saved.repeat;
    if (saved.price) document.getElementById('fabricPrice').value = saved.price;
    calc();
  },

  initMenu() {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const meals = ['breakfast','lunch','dinner'];
    let menu = store.get('menuPlanner', {});
    const grid = document.getElementById('menuGrid');
    if (!grid) return;

    grid.innerHTML = days.map(day => `
      <div class="menu-day" data-day="${day}">
        <h4>${day}</h4>
        ${meals.map(m => `<label style="font-size:0.65rem;color:var(--text-muted)">${m}</label>
          <textarea data-day="${day}" data-meal="${m}" placeholder="${m}...">${escapeHtml(menu[`${day}-${m}`] || '')}</textarea>`).join('')}
      </div>`).join('');

    grid.querySelectorAll('textarea').forEach(ta => {
      ta.addEventListener('input', () => {
        menu[`${ta.dataset.day}-${ta.dataset.meal}`] = ta.value;
        this.save('menuPlanner', menu);
      });
    });

    document.getElementById('genShoppingList')?.addEventListener('click', () => {
      const items = {};
      Object.values(menu).forEach(val => {
        val.split(/[,;\n]+/).forEach(item => {
          const t = item.trim().toLowerCase();
          if (t.length > 2) items[t] = (items[t] || 0) + 1;
        });
      });
      const prices = { rice: 55, chicken: 180, pork: 220, egg: 8, onion: 15, garlic: 5, tomato: 12, oil: 85, soy: 35 };
      const list = document.getElementById('shoppingList');
      const entries = Object.keys(items).sort();
      let total = 0;
      list.innerHTML = entries.length ? entries.map(item => {
        const est = prices[item.split(' ')[0]] || 25;
        total += est;
        return `<li><span>${escapeHtml(item)}</span><span>~₱${est}</span></li>`;
      }).join('') + `<li style="font-weight:700;border-top:2px solid var(--border)"><span>Estimated Total</span><span>~₱${total}</span></li>` : '<li>Add meals to generate list</li>';
    });

    document.getElementById('exportMenuPdf')?.addEventListener('click', () => ExportDoc.exportMenu('pdf'));
    document.getElementById('exportMenuDoc')?.addEventListener('click', () => ExportDoc.exportMenu('doc'));
  },

  initBudget() {
    let budget = store.get('budgetData', {
      income: 25000,
      items: [
        { cat: 'Rent', amount: 5000 },
        { cat: 'Utilities', amount: 2500 },
        { cat: 'Food/Grocery', amount: 8000 },
        { cat: 'Transportation', amount: 2000 },
        { cat: 'School/Supplies', amount: 1500 }
      ]
    });
    const render = () => {
      const list = document.getElementById('budgetList');
      if (!list) return;
      list.innerHTML = budget.items.map((item, i) => `
        <div class="budget-row">
          <input value="${escapeHtml(item.cat)}" data-i="${i}" data-f="cat">
          <input type="number" value="${item.amount}" data-i="${i}" data-f="amount">
          <span>₱</span>
          <button class="btn btn-secondary btn-sm" data-rm="${i}">×</button>
        </div>`).join('');
      list.querySelectorAll('input').forEach(el => {
        el.addEventListener('change', () => {
          budget.items[Number(el.dataset.i)][el.dataset.f] = el.dataset.f === 'amount' ? parseFloat(el.value) : el.value;
          this.save('budgetData', budget);
          this.calcBudget(budget);
        });
      });
      list.querySelectorAll('[data-rm]').forEach(btn => {
        btn.addEventListener('click', () => {
          budget.items.splice(Number(btn.dataset.rm), 1);
          this.save('budgetData', budget);
          render();
          this.calcBudget(budget);
        });
      });
      this.calcBudget(budget);
    };
    document.getElementById('budgetIncome')?.addEventListener('input', e => {
      budget.income = parseFloat(e.target.value) || 0;
      this.save('budgetData', budget);
      this.calcBudget(budget);
    });
    document.getElementById('budgetIncome').value = budget.income;
    document.getElementById('addBudgetItem')?.addEventListener('click', () => {
      budget.items.push({ cat: 'New expense', amount: 0 });
      this.save('budgetData', budget);
      render();
    });
    document.getElementById('loadBudgetScenario')?.addEventListener('click', () => {
      budget = {
        income: 18000,
        items: [
          { cat: 'Board/Lodging', amount: 4000 },
          { cat: 'Jeepney/Fare', amount: 1200 },
          { cat: 'Meals (student)', amount: 6000 },
          { cat: 'Load/Internet', amount: 500 },
          { cat: 'HE Lab Materials', amount: 800 },
          { cat: 'Sewing Supplies', amount: 600 }
        ]
      };
      document.getElementById('budgetIncome').value = budget.income;
      this.save('budgetData', budget);
      render();
      Toast.show('Filipino student scenario loaded');
    });
    render();
  },

  calcBudget(budget) {
    const total = budget.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const left = budget.income - total;
    const el = document.getElementById('budgetResult');
    if (!el) return;
    el.innerHTML = `<strong>Monthly Income:</strong> ₱${budget.income.toLocaleString()}<br>
      <strong>Total Expenses:</strong> ₱${total.toLocaleString()}<br>
      <strong>Remaining:</strong> <span style="color:${left >= 0 ? 'var(--success)' : 'var(--danger)'}">₱${left.toLocaleString()}</span>
      ${left < 0 ? '<br>⚠ Over budget — adjust expenses or find additional income.' : left < 2000 ? '<br>💡 Tight budget — consider cutting discretionary spending.' : '<br>✓ Healthy savings margin!'}`;
  },

  initSewing() {
    const grid = document.getElementById('stitchGrid');
    const detail = document.getElementById('stitchDetail');
    if (!grid) return;
    grid.innerHTML = STITCHES.map((s, i) =>
      `<div class="stitch-card" data-i="${i}"><strong>${escapeHtml(s.name)}</strong><br><span style="font-size:0.75rem;color:var(--text-muted)">${escapeHtml(s.use)}</span></div>`
    ).join('');
    grid.querySelectorAll('.stitch-card').forEach(card => {
      card.addEventListener('click', () => {
        grid.querySelectorAll('.stitch-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const s = STITCHES[Number(card.dataset.i)];
        detail.innerHTML = `<h3>${escapeHtml(s.name)}</h3><p><strong>Use:</strong> ${escapeHtml(s.use)}</p><p><strong>Settings:</strong> ${escapeHtml(s.settings)}</p><p><strong>Tip:</strong> ${escapeHtml(s.tip)}</p>
          <h4 style="margin-top:1rem">Troubleshooting</h4><ul>${TROUBLESHOOT.map(t => `<li><strong>${escapeHtml(t.problem)}:</strong> ${escapeHtml(t.fix)}</li>`).join('')}</ul>`;
      });
    });
  },

  /* ===== Math Tools ===== */
  initMathTools() {
    this.initMeasurePro();
    this.initStats();
    this.initInterest();
    this.initGeometry();
    this.initMathFlash();
  },

  initMeasurePro() {
    const units = {
      metric: { m: 1, cm: 0.01, mm: 0.001, km: 1000 },
      imperial: { in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
      filipino: { kilo: 1, ganta: 0.75, chupa: 0.25, tali: 0.1 }
    };
    const calc = () => {
      const val = parseFloat(document.getElementById('measureVal').value) || 0;
      const from = document.getElementById('measureFrom').value;
      const to = document.getElementById('measureTo').value;
      const cat = document.getElementById('measureCat').value;
      const u = units[cat];
      const base = val * (u[from] || 1);
      const result = base / (u[to] || 1);
      document.getElementById('measureResult').textContent = `${result.toFixed(4)} ${to}`;
    };
    const populate = () => {
      const cat = document.getElementById('measureCat').value;
      const keys = Object.keys(units[cat]);
      document.getElementById('measureFrom').innerHTML = keys.map(k => `<option>${k}</option>`).join('');
      document.getElementById('measureTo').innerHTML = keys.map(k => `<option>${k}</option>`).join('');
      if (keys.length > 1) document.getElementById('measureTo').selectedIndex = 1;
      calc();
    };
    document.getElementById('measureCat')?.addEventListener('change', populate);
    ['measureVal','measureFrom','measureTo'].forEach(id => document.getElementById(id)?.addEventListener('input', calc));
    populate();
  },

  initStats() {
    document.getElementById('calcStats')?.addEventListener('click', () => {
      const raw = document.getElementById('statsInput').value;
      const nums = raw.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
      if (!nums.length) return;
      const sorted = [...nums].sort((a, b) => a - b);
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      const freq = {};
      nums.forEach(n => freq[n] = (freq[n] || 0) + 1);
      const mode = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
      document.getElementById('statsResult').innerHTML =
        `<strong>Mean:</strong> ${mean.toFixed(2)} · <strong>Median:</strong> ${median} · <strong>Mode:</strong> ${mode} · <strong>Count:</strong> ${nums.length} · <strong>Range:</strong> ${sorted[sorted.length-1] - sorted[0]}`;
      const chart = document.getElementById('statsChart');
      const max = Math.max(...nums);
      chart.innerHTML = nums.map((n, i) =>
        `<div class="chart-bar" style="height:${(n/max*100).toFixed(0)}%" title="${n}"><span>${i+1}</span></div>`
      ).join('');
    });
  },

  initInterest() {
    document.getElementById('calcInterest')?.addEventListener('click', () => {
      const p = parseFloat(document.getElementById('loanPrincipal').value) || 0;
      const r = parseFloat(document.getElementById('loanRate').value) / 100 / 12 || 0;
      const n = parseInt(document.getElementById('loanMonths').value) || 12;
      const type = document.getElementById('loanType').value;
      let html = '';
      if (type === 'simple') {
        const total = p * (1 + r * 12 * (n / 12));
        html = `<strong>Simple Interest Total:</strong> ₱${total.toFixed(2)}`;
      } else {
        const payment = r ? p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : p / n;
        html = `<strong>Monthly Payment:</strong> ₱${payment.toFixed(2)} · <strong>Total:</strong> ₱${(payment * n).toFixed(2)}<br><table class="gpa-table" style="margin-top:0.75rem"><tr><th>#</th><th>Payment</th><th>Balance</th></tr>`;
        let bal = p;
        for (let i = 1; i <= Math.min(n, 6); i++) {
          const interest = bal * r;
          const principal = payment - interest;
          bal -= principal;
          html += `<tr><td>${i}</td><td>₱${payment.toFixed(2)}</td><td>₱${Math.max(0,bal).toFixed(2)}</td></tr>`;
        }
        if (n > 6) html += `<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">... ${n - 6} more months</td></tr>`;
        html += '</table>';
      }
      document.getElementById('interestResult').innerHTML = html;
    });
  },

  initGeometry() {
    const canvas = document.getElementById('geometryCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const draw = () => {
      const shape = document.getElementById('geoShape').value;
      const a = parseFloat(document.getElementById('geoA').value) || 0;
      const b = parseFloat(document.getElementById('geoB').value) || 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(99,102,241,0.15)';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      let area = 0, peri = 0;
      if (shape === 'rect') {
        ctx.fillRect(50, 50, a * 8, b * 8);
        ctx.strokeRect(50, 50, a * 8, b * 8);
        area = a * b; peri = 2 * (a + b);
      } else if (shape === 'circle') {
        ctx.beginPath(); ctx.arc(200, 150, a * 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        area = Math.PI * a * a; peri = 2 * Math.PI * a;
      } else {
        ctx.beginPath(); ctx.moveTo(200, 50); ctx.lineTo(200 + a * 8, 200); ctx.lineTo(200 - a * 8, 200); ctx.closePath(); ctx.fill(); ctx.stroke();
        area = 0.5 * (2 * a) * b; peri = 2 * a + 2 * Math.hypot(a, b);
      }
      document.getElementById('geoResult').innerHTML =
        `<strong>Area:</strong> ${area.toFixed(2)} sq units · <strong>Perimeter:</strong> ${peri.toFixed(2)} units`;
    };
    ['geoShape','geoA','geoB'].forEach(id => document.getElementById(id)?.addEventListener('input', draw));
    draw();
  },

  initMathFlash() {
    let cards = store.get('mathFormulaCards', [
      { q: 'Area of circle', a: 'A = πr²', level: 0 },
      { q: 'Quadratic formula', a: 'x = (-b ± √(b²-4ac)) / 2a', level: 0 },
      { q: 'Pythagorean theorem', a: 'a² + b² = c²', level: 0 },
      { q: 'Simple interest', a: 'I = Prt', level: 0 }
    ]);
    let idx = 0;
    const show = () => {
      if (!cards.length) return;
      idx = idx % cards.length;
      document.getElementById('mathFlashQ').textContent = cards[idx].q;
      document.getElementById('mathFlashA').hidden = true;
      document.getElementById('mathFlashA').textContent = cards[idx].a;
    };
    document.getElementById('mathFlashFlip')?.addEventListener('click', () => {
      document.getElementById('mathFlashA').hidden = false;
    });
    document.getElementById('mathFlashEasy')?.addEventListener('click', () => {
      cards[idx].level = Math.max(0, cards[idx].level - 1);
      cards.sort((a, b) => a.level - b.level);
      idx++; show(); this.save('mathFormulaCards', cards);
    });
    document.getElementById('mathFlashHard')?.addEventListener('click', () => {
      cards[idx].level++;
      cards.sort((a, b) => a.level - b.level);
      idx++; show(); this.save('mathFormulaCards', cards);
    });
    show();
  },

  /* ===== Universal Tools ===== */
  initUniversalTools() {
    this.initThemedPomodoro();
    this.initGPA();
    this.initScheduler();
    this.initNoteTemplates();
    this.initQuizGen();
    this.initResources();
  },

  initThemedPomodoro() {
    const theme = store.get('pomodoroTheme', 'default');
    document.querySelectorAll('.theme-chip').forEach(chip => {
      if (chip.dataset.theme === theme) chip.classList.add('active');
      chip.addEventListener('click', () => {
        document.querySelectorAll('.theme-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.save('pomodoroTheme', chip.dataset.theme);
        const label = { kitchen: '🍳 Kitchen Mode (25 min)', sewing: '🧵 Sewing Mode (30 min)', math: '📐 Math Mode (25 min)', default: '25 min focus' };
        document.getElementById('pomodoroModeLabel').textContent = label[chip.dataset.theme] || label.default;
        Toast.show(`${chip.textContent} theme applied`);
      });
    });
  },

  initGPA() {
    let grades = store.get('gpaGrades', [
      { subject: 'Food & Nutrition', units: 3, grade: 1.5 },
      { subject: 'Modern Math', units: 3, grade: 1.75 }
    ]);
    const render = () => {
      const tbody = document.getElementById('gpaBody');
      if (!tbody) return;
      tbody.innerHTML = grades.map((g, i) => `
        <tr>
          <td><input value="${escapeHtml(g.subject)}" data-i="${i}" data-f="subject" style="border:none;background:transparent;width:100%"></td>
          <td><input type="number" value="${g.units}" data-i="${i}" data-f="units" style="width:50px"></td>
          <td><input type="number" step="0.25" value="${g.grade}" data-i="${i}" data-f="grade" style="width:60px"></td>
          <td><button data-rm="${i}">×</button></td>
        </tr>`).join('');
      tbody.querySelectorAll('input').forEach(el => {
        el.addEventListener('change', () => {
          grades[Number(el.dataset.i)][el.dataset.f] = el.dataset.f === 'subject' ? el.value : parseFloat(el.value);
          this.save('gpaGrades', grades);
          this.calcGPA(grades);
        });
      });
      tbody.querySelectorAll('[data-rm]').forEach(btn => {
        btn.addEventListener('click', () => { grades.splice(Number(btn.dataset.rm), 1); this.save('gpaGrades', grades); render(); });
      });
      this.calcGPA(grades);
    };
    document.getElementById('addGpaRow')?.addEventListener('click', () => {
      grades.push({ subject: 'New Subject', units: 3, grade: 2.0 });
      this.save('gpaGrades', grades);
      render();
    });
    document.getElementById('calcFinalGrade')?.addEventListener('click', () => {
      const current = parseFloat(document.getElementById('currentGrade').value) || 0;
      const target = parseFloat(document.getElementById('targetGrade').value) || 0;
      const weight = parseFloat(document.getElementById('finalWeight').value) / 100 || 0.4;
      const needed = (target - current * (1 - weight)) / weight;
      document.getElementById('gpaPredict').innerHTML = needed <= 5
        ? `<strong>Need ${needed.toFixed(2)} on final</strong> (${(weight*100).toFixed(0)}% weight) ${needed <= 3 ? '✓ Achievable!' : needed <= 5 ? '— Study hard!' : '— Very difficult'}`
        : 'Target may not be achievable — adjust expectations.';
    });
    render();
  },

  calcGPA(grades) {
    const totalUnits = grades.reduce((s, g) => s + g.units, 0);
    const gwa = totalUnits ? grades.reduce((s, g) => s + g.grade * g.units, 0) / totalUnits : 0;
    const el = document.getElementById('gpaResult');
    if (el) el.innerHTML = `<strong>GWA:</strong> ${gwa.toFixed(2)} · <strong>Total Units:</strong> ${totalUnits}`;
  },

  initScheduler() {
    let sched = store.get('studyScheduler', { major: 40, minor: 30, review: 20, break: 10 });
    ['major','minor','review','break'].forEach(k => {
      const el = document.getElementById(`sched${k.charAt(0).toUpperCase()+k.slice(1)}`);
      if (el) { el.value = sched[k]; el.addEventListener('input', () => {
        sched[k] = parseInt(el.value) || 0;
        this.save('studyScheduler', sched);
        this.updateScheduler(sched);
      }); }
    });
    this.updateScheduler(sched);
  },

  updateScheduler(sched) {
    const total = sched.major + sched.minor + sched.review + sched.break;
    const el = document.getElementById('schedulerResult');
    if (!el) return;
    el.innerHTML = `<strong>Daily ${total}h plan:</strong> Major (HE) ${sched.major}h · Minor (Math) ${sched.minor}h · Review ${sched.review}h · Break ${sched.break}h
      <div class="progress-bar-wrap" style="margin-top:0.75rem;display:flex;height:12px;overflow:hidden;border-radius:999px">
        <div style="width:${sched.major/total*100}%;background:#f97316"></div>
        <div style="width:${sched.minor/total*100}%;background:#6366f1"></div>
        <div style="width:${sched.review/total*100}%;background:#10b981"></div>
        <div style="width:${sched.break/total*100}%;background:#9ca3af"></div>
      </div>`;
  },

  initNoteTemplates() {
    let notes = store.get('structuredNotes', {});
    let current = 'cornell';
    const area = document.getElementById('noteTemplateArea');
    document.querySelectorAll('.note-tpl-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.note-tpl-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        current = btn.dataset.tpl;
        if (!notes[current]) notes[current] = NOTE_TEMPLATES[current];
        area.value = notes[current];
      });
    });
    if (area) {
      notes.cornell = notes.cornell || NOTE_TEMPLATES.cornell;
      area.value = notes.cornell;
      area.addEventListener('input', () => {
        notes[current] = area.value;
        this.save('structuredNotes', notes);
      });
    }
  },

  initQuizGen() {
    document.getElementById('genQuizFromNotes')?.addEventListener('click', () => {
      const text = document.getElementById('quizSourceText').value.trim();
      if (!text) return;
      const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 15);
      const questions = sentences.slice(0, 5).map(s => {
        const words = s.trim().split(/\s+/);
        const blank = words[Math.floor(words.length / 2)] || '___';
        return { q: s.trim().replace(blank, '______') + '?', a: blank };
      });
      document.getElementById('quizOutput').innerHTML = questions.length
        ? questions.map((q, i) => `<div class="result-box" style="margin-bottom:0.5rem"><strong>Q${i+1}:</strong> ${escapeHtml(q.q)}<br><em style="color:var(--text-muted);font-size:0.8125rem">Answer: ${escapeHtml(q.a)}</em></div>`).join('')
        : 'Add more notes to generate questions.';
    });
  },

  initResources() {
    const list = document.getElementById('resourceList');
    if (!list) return;
    list.innerHTML = RESOURCES.map(r =>
      `<li class="resource-item"><a href="${r.url}" target="_blank" rel="noopener">${escapeHtml(r.title)}</a><span>${escapeHtml(r.type)}</span></li>`
    ).join('');
  },

  initExport() {
    document.getElementById('exportDataBtn')?.addEventListener('click', () => {
      document.getElementById('exportModal').classList.add('open');
    });
    document.getElementById('exportModalCancel')?.addEventListener('click', () => {
      document.getElementById('exportModal').classList.remove('open');
    });
    document.querySelectorAll('.format-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.format-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
      });
    });
    document.querySelector('.format-option')?.classList.add('active');
    document.getElementById('exportModalConfirm')?.addEventListener('click', () => {
      const format = document.querySelector('.format-option.active')?.dataset.format || 'json';
      const scope = document.getElementById('exportScope').value;
      ExportDoc.export(format, scope);
      document.getElementById('exportModal').classList.remove('open');
    });
  },

  setupAutoSave() {
    const origSet = store.set.bind(store);
    store.set = (key, value) => {
      origSet(key, value);
      if (BTLED_KEYS.includes(key) || key.startsWith('schedule') || key.startsWith('menu')) {
        BTLed.flashAutoSave();
      }
    };
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => store.set('lastSection', btn.dataset.section));
    });
  },

  restoreAll() {
    this.schedule = store.get('scheduleClasses', []);
    this.renderSchedule();
  }
};

/* ===== Export PDF / Document ===== */
const ExportDoc = {
  export(format, scope) {
    if (format === 'json') { Backup.openModal(); return; }
    if (scope === 'schedule') this.exportSchedule(format);
    else if (scope === 'menu') this.exportMenu(format);
    else if (scope === 'notes') this.exportNotes(format);
    else this.exportAll(format);
  },

  exportSchedule(format) {
    const html = this.buildScheduleHTML();
    this.download(html, 'btled-schedule', format);
  },

  exportMenu(format) {
    const menu = store.get('menuPlanner', {});
    let html = `<h1>Weekly Menu Plan</h1><table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">`;
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(day => {
      html += `<tr><td><strong>${day}</strong></td><td>${escapeHtml(menu[`${day}-breakfast`]||'—')}</td><td>${escapeHtml(menu[`${day}-lunch`]||'—')}</td><td>${escapeHtml(menu[`${day}-dinner`]||'—')}</td></tr>`;
    });
    html += '</table>';
    this.download(html, 'weekly-menu-plan', format);
  },

  exportNotes(format) {
    const notes = store.get('structuredNotes', {});
    const html = `<h1>Study Notes</h1><pre style="white-space:pre-wrap;font-family:monospace">${escapeHtml(Object.values(notes).join('\n\n---\n\n'))}</pre>`;
    this.download(html, 'study-notes', format);
  },

  exportAll(format) {
    const html = this.buildScheduleHTML() + '<hr>' + document.getElementById('schedulerResult')?.innerHTML;
    this.download(html, 'btled-studyhub-export', format);
  },

  buildScheduleHTML() {
    const schedule = store.get('scheduleClasses', []);
    let html = `<h1>BTLed Class Schedule</h1><p>Generated ${new Date().toLocaleString()}</p><table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">`;
    html += '<tr><th>Subject</th><th>Code</th><th>Room</th><th>Time</th><th>Days</th></tr>';
    schedule.forEach(c => {
      html += `<tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.code||'')}</td><td>${escapeHtml(c.room||'')}</td><td>${BTLed.formatTime(c.start)} – ${BTLed.formatTime(c.end)}</td><td>${c.days.join(', ')}</td></tr>`;
    });
    return html + '</table>';
  },

  download(content, name, format) {
    const styled = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${name}</title>
      <style>body{font-family:Segoe UI,sans-serif;padding:2rem;max-width:800px;margin:0 auto}h1{color:#f97316}table{margin-top:1rem}</style></head><body>${content}</body></html>`;
    if (format === 'pdf') {
      const w = window.open('', '_blank');
      w.document.write(styled);
      w.document.close();
      w.onload = () => { w.print(); Toast.show('Use Print → Save as PDF'); };
    } else {
      const blob = new Blob([styled], { type: 'application/msword' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${name}.doc`;
      a.click();
      URL.revokeObjectURL(a.href);
      Toast.show('Document downloaded');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => BTLed.init());
