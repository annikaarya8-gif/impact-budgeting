// ===============================
// ELEMENTS
// ===============================

const categorySelect = document.getElementById("category");
const taskInput = document.getElementById("task");
const minutesInput = document.getElementById("minutes");
const addBtn = document.getElementById("addBtn");
const clearBtn = document.getElementById("clearBtn");

const historyList = document.getElementById("history");
const categoryTotalsList = document.getElementById("categoryTotals");

const totalEl = document.getElementById("totalMinutes");
const weeklyEl = document.getElementById("weeklyMinutes");
const impactEl = document.getElementById("impactScore");

const categoryChart = document.getElementById("categoryChart");
const ctx = categoryChart.getContext("2d");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = categoryChart.getBoundingClientRect();

  categoryChart.width = rect.width * dpr;
  categoryChart.height = rect.height * dpr;

  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
  ctx.scale(dpr, dpr);
}

resizeCanvas();

const calendarEl = document.getElementById("calendar");
const monthLabelEl = document.getElementById("monthLabel");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
// ===== Theme customization =====
const accentPicker = document.getElementById("accentPicker");
const bgPicker = document.getElementById("bgPicker");
const textPicker = document.getElementById("textPicker");
const resetThemeBtn = document.getElementById("resetTheme");

const THEME_KEY = "impact_theme_v1";

function applyTheme(theme) {
  document.documentElement.style.setProperty("--heading", theme.accent);
  document.documentElement.style.setProperty("--h2", theme.accent); // keep it consistent
  document.documentElement.style.setProperty("--bg", theme.bg);
  document.documentElement.style.setProperty("--text", theme.text);
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
}

function loadTheme() {
  try {
    return JSON.parse(localStorage.getItem(THEME_KEY));
  } catch {
    return null;
  }
}

function getDefaultTheme() {
  return { accent: "#ff9fcc", bg: "#fff6fb", text: "#3a2a33" };
}

// init
const saved = loadTheme();
const theme = saved || getDefaultTheme();
applyTheme(theme);

// sync pickers to current theme
accentPicker.value = theme.accent;
bgPicker.value = theme.bg;
textPicker.value = theme.text;

// listeners
accentPicker.addEventListener("input", () => {
  const t = { accent: accentPicker.value, bg: bgPicker.value, text: textPicker.value };
  applyTheme(t);
  saveTheme(t);
});

bgPicker.addEventListener("input", () => {
  const t = { accent: accentPicker.value, bg: bgPicker.value, text: textPicker.value };
  applyTheme(t);
  saveTheme(t);
});

textPicker.addEventListener("input", () => {
  const t = { accent: accentPicker.value, bg: bgPicker.value, text: textPicker.value };
  applyTheme(t);
  saveTheme(t);
});

resetThemeBtn.addEventListener("click", () => {
  const t = getDefaultTheme();
  applyTheme(t);
  saveTheme(t);
  accentPicker.value = t.accent;
  bgPicker.value = t.bg;
  textPicker.value = t.text;
});

// ===============================
// STORAGE
// ===============================

const STORAGE_KEY = "impact_entries_v2";
let entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ===============================
// HELPERS
// ===============================

function startOfWeek(ts) {
  const d = new Date(ts);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// ===============================
// PINK GRAPH
// ===============================

function drawCategoryChart(categoryTotals) {
  ctx.clearRect(0, 0, categoryChart.width, categoryChart.height);

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  if (!labels.length) {
    ctx.fillStyle = "#c06a98";
    ctx.font = "16px Arial";
    ctx.fillText("Add entries to see a graph 💗", 20, 40);
    return;
  }

  const padding = 40;
  const w = categoryChart.width;
  const h = categoryChart.height;

  const maxVal = Math.max(...values);
  const chartW = w - padding * 2;
  const chartH = h - padding * 2;

  const barGap = 12;
  const barW = (chartW - barGap * (labels.length - 1)) / labels.length;

  ctx.strokeStyle = "#ff9fcc";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, h - padding);
  ctx.lineTo(w - padding, h - padding);
  ctx.stroke();

  ctx.font = "12px Arial";

  for (let i = 0; i < labels.length; i++) {
    const val = values[i];
    const barH = (val / maxVal) * chartH;

    const x = padding + i * (barW + barGap);
    const y = h - padding - barH;

    ctx.fillStyle = "#ffb6d9";
    ctx.fillRect(x, y, barW, barH);

    ctx.fillStyle = "#c06a98";
    ctx.fillText(labels[i], x, h - padding + 14);
    ctx.fillText(`${val}m`, x, y - 6);
  }
}

// ===============================
// CALENDAR
// ===============================

let calendarMonth = new Date();
calendarMonth.setDate(1);

function drawCalendar(entries) {
  calendarEl.innerHTML = "";

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  for (const d of days) {
    const head = document.createElement("div");
    head.className = "cal-head";
    head.textContent = d;
    calendarEl.appendChild(head);
  }

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  monthLabelEl.textContent =
    calendarMonth.toLocaleString(undefined,{month:"long",year:"numeric"});

  const itemsByDay = {};

  for (const e of entries) {
    const dt = new Date(e.createdAt);
    if (dt.getFullYear() === year && dt.getMonth() === month) {
      const key = dt.getDate();
      if (!itemsByDay[key]) itemsByDay[key] = [];
      itemsByDay[key].push(e);
    }
  }

  const firstDay = new Date(year, month, 1);
  const start = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < start; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-day";
    empty.style.opacity = "0";
    calendarEl.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "cal-day";
  // --- NEW: highlight today + tint weekends ---
  const now = new Date();

  const isToday =
    now.getFullYear() === year &&
    now.getMonth() === month &&
    now.getDate() === day;

  if (isToday) cell.classList.add("today");

  const weekday = new Date(year, month, day).getDay(); // 0=Sun ... 6=Sat
  if (weekday === 0 || weekday === 6) cell.classList.add("weekend");
  // --- end new ---

    const num = document.createElement("div");
    num.className = "cal-num";
    num.textContent = day;
    cell.appendChild(num);

    const items = itemsByDay[day] || [];

    const list = document.createElement("div");
    list.className = "cal-list";

    for (const e of items) {
      const row = document.createElement("div");
      row.className = "cal-item";
      row.innerHTML = `<span>${e.category}:</span> ${e.task} (${e.minutes}m)`;
      list.appendChild(row);
    }

    cell.appendChild(list);
    calendarEl.appendChild(cell);
  }
}

prevMonthBtn.addEventListener("click", () => {
  calendarMonth.setMonth(calendarMonth.getMonth() - 1);
  drawCalendar(entries);
});

nextMonthBtn.addEventListener("click", () => {
  calendarMonth.setMonth(calendarMonth.getMonth() + 1);
  drawCalendar(entries);
});

// ===============================
// RENDER EVERYTHING
// ===============================

function render() {
  historyList.innerHTML = "";
  categoryTotalsList.innerHTML = "";

  const categoryTotals = {};
let total = 0;
let weeklyTotal = 0;
let impactScore = 0;
const thisWeekStart = startOfWeek(Date.now());
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];

    total += e.minutes;
const cat = (e.category || "").toLowerCase();
const mins = Number(e.minutes) || 0;

if (cat.includes("volunteer")) impactScore += mins * 2;
else if (cat.includes("lead")) impactScore += mins * 1.5;
else if (cat.includes("donat")) impactScore += 50; // flat bonus per donation entry
else impactScore += mins;
impactEl.textContent = Math.round(impactScore);


    if (startOfWeek(e.createdAt) === thisWeekStart) {
      weeklyTotal += e.minutes;
    }

    categoryTotals[e.category] =
      (categoryTotals[e.category] || 0) + e.minutes;

    const li = document.createElement("li");
    li.textContent =
      `${e.category} — ${e.task} — ${e.minutes} min `;

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      entries.splice(i, 1);
      saveEntries();
      render();
    });

    li.appendChild(del);
    historyList.appendChild(li);
  }

  totalEl.textContent = total;
  weeklyEl.textContent = weeklyTotal;

  for (const [cat, mins] of Object.entries(categoryTotals)) {
    const li = document.createElement("li");
    li.textContent = `${cat}: ${mins} min`;
    categoryTotalsList.appendChild(li);
  }

  drawCategoryChart(categoryTotals);
  drawCalendar(entries);
}

// ===============================
// BUTTONS
// ===============================

addBtn.addEventListener("click", () => {
  const task = taskInput.value.trim();
  const minutes = Number(minutesInput.value);
  const category = categorySelect.value;

  if (!task || !minutes || minutes <= 0) {
    alert("Please enter valid values 💗");
    return;
  }

  entries.unshift({
    task,
    minutes,
    category,
    createdAt: Date.now(),
  });

  saveEntries();
  render();

  taskInput.value = "";
  minutesInput.value = "";
});

clearBtn.addEventListener("click", () => {
  entries = [];
  saveEntries();
  render();
});

// Initial load
render();