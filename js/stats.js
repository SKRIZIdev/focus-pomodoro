const log = JSON.parse(localStorage.getItem('focusflow.log') || '{}');
const iso = d => d.toISOString().slice(0, 10);
const todayKey = iso(new Date());
const today = log[todayKey]?.count || 0;
let totalC = 0, totalM = 0;
Object.values(log).forEach(v => { totalC += v.count; totalM += v.mins; });
document.getElementById('today').textContent = today;
document.getElementById('total').textContent = totalC;
document.getElementById('mins').textContent = totalM;

const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
const max = Math.max(1, ...days.map(d => log[iso(d)]?.count || 0));
document.getElementById('chart').innerHTML = days.map(d => {
  const c = log[iso(d)]?.count || 0;
  return `<div class="col"><div class="bar" style="height:${c / max * 100}%" title="${c} sessions"></div>
    <small>${d.toLocaleDateString('en-US', { weekday: 'short' })[0]}</small></div>`;
}).join('');
