const $ = id => document.getElementById(id);
const R = 90, CIRC = 2 * Math.PI * R;
$('ring').style.strokeDasharray = CIRC;
let minutes = 25, total = 25 * 60, left = total, timer = null, running = false;

function fmt(s) { const m = Math.floor(s / 60), ss = s % 60; return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`; }
function draw() {
  $('time').textContent = fmt(left);
  $('ring').style.strokeDashoffset = CIRC * (1 - left / total);
  document.title = (running ? fmt(left) + ' · ' : '') + 'FocusFlow';
}
function setMode(min) { minutes = min; total = min * 60; left = total; stop(); draw(); }
function tick() {
  left--;
  if (left <= 0) { finish(); return; }
  draw();
}
function start() { if (running) return; running = true; $('startBtn').textContent = 'Pause'; timer = setInterval(tick, 1000); }
function pause() { running = false; $('startBtn').textContent = 'Start'; clearInterval(timer); }
function stop() { pause(); }
function finish() {
  pause(); left = 0; draw();
  const isFocus = document.querySelector('#modes button.on').dataset.m === 'focus';
  if (isFocus) logSession(minutes);
  try { new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=').play(); } catch (e) {}
  alert(isFocus ? '🍅 Focus session complete! Take a break.' : 'Break over — back to it!');
  left = total; draw();
}
function logSession(mins) {
  const key = 'focusflow.log';
  const log = JSON.parse(localStorage.getItem(key) || '{}');
  const d = new Date().toISOString().slice(0, 10);
  log[d] = log[d] || { count: 0, mins: 0 };
  log[d].count++; log[d].mins += mins;
  localStorage.setItem(key, JSON.stringify(log));
}
$('startBtn').onclick = () => running ? pause() : start();
$('resetBtn').onclick = () => { left = total; pause(); draw(); };
document.querySelectorAll('#modes button').forEach(b => b.onclick = () => {
  document.querySelectorAll('#modes button').forEach(x => x.classList.remove('on')); b.classList.add('on');
  setMode(+b.dataset.min);
});

// tasks
const TKEY = 'focusflow.tasks';
const loadT = () => JSON.parse(localStorage.getItem(TKEY) || '[]');
const saveT = t => localStorage.setItem(TKEY, JSON.stringify(t));
function renderTasks() {
  const tasks = loadT();
  $('taskList').innerHTML = tasks.map((t, i) => `
    <li class="${t.done ? 'done' : ''}"><input class="cb" type="checkbox" data-i="${i}" ${t.done ? 'checked' : ''}>
      <span>${t.text.replace(/[&<>]/g, '')}</span><button class="x" data-i="${i}">✕</button></li>`).join('');
  $('taskList').querySelectorAll('.cb').forEach(c => c.onchange = () => { const t = loadT(); t[+c.dataset.i].done = c.checked; saveT(t); renderTasks(); });
  $('taskList').querySelectorAll('.x').forEach(x => x.onclick = () => { const t = loadT(); t.splice(+x.dataset.i, 1); saveT(t); renderTasks(); });
}
$('addTask').onclick = () => { const v = $('taskInput').value.trim(); if (!v) return; const t = loadT(); t.push({ text: v, done: false }); saveT(t); $('taskInput').value = ''; renderTasks(); };
$('taskInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('addTask').click(); });
renderTasks();
draw();
