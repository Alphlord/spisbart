/* FORTGJORT (tidligere iOrden og IK-mat). Vanlig JavaScript uten byggesteg. All tilgangsstyring skjer i databasen (RLS), ikke her. */
(function () {
'use strict';

var SB_URL = 'https://bcdcmjsewvztnnamwrfh.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZGNtanNld3Z6dG5uYW13cmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU2MjQ5NzYsImV4cCI6MjExMTIwMDk3Nn0.FWrro76-j56Cm3BKkv6AtY1WHP4z8OGH1AVCTSJqdJU';
if (!window.supabase) {
  document.addEventListener('DOMContentLoaded', function () {
    var a = document.getElementById('s-auth'); a.classList.add('on');
    a.insertBefore(Object.assign(document.createElement('div'), { className: 'err', textContent: 'Kunne ikke laste tjenesten. Sjekk nettet og last siden på nytt.' }), a.firstChild);
  });
  return;
}
var sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });

/* ---------- små hjelpere ---------- */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function h(tag, attrs) {
  var e = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(function (k) {
    var v = attrs[k];
    if (v == null || v === false) return;
    if (k === 'class') e.className = v;
    else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
    else if (k === 'value') e.value = v;
    else if (k === 'checked' || k === 'disabled' || k === 'hidden' || k === 'required') e[k] = !!v;
    else e.setAttribute(k, v === true ? '' : v);
  });
  for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
  return e;
}
function add(e, c) {
  if (c == null || c === false) return;
  if (Array.isArray(c)) c.forEach(function (x) { add(e, x); });
  else e.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
}
function clear(e) { while (e.firstChild) e.removeChild(e.firstChild); return e; }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function parseYmd(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function addDays(s, n) { var d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); }
var WD = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
var WDL = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag', 'søndag'];
var MON = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
function isoDow(d) { return ((d.getDay() + 6) % 7) + 1; }
function fmtDate(s) { var d = parseYmd(s); return WDL[isoDow(d) - 1] + ' ' + d.getDate() + '. ' + MON[d.getMonth()]; }
function fmtTs(t) { var d = new Date(t); return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
function num(v) { if (v == null || v === '') return null; var n = Number(String(v).replace(',', '.')); return isFinite(n) ? n : null; }
function uuid() { return (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); })); }
function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ingenting */ } }
var toastT;
function toast(t) { var e = $('#toast'); e.textContent = t; e.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { e.hidden = true; }, 3200); }
function msg(el, kind, text) { clear(el); if (text) el.appendChild(h('div', { class: kind }, text)); }
function errText(e) {
  var m = (e && (e.message || e.error_description)) || String(e);
  if (/Invalid login/i.test(m)) return 'Feil e-post eller passord.';
  if (/already registered/i.test(m)) return 'Denne e-posten har allerede en bruker. Logg inn i stedet.';
  if (/Password should/i.test(m)) return 'Passordet må ha minst 8 tegn.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Ingen kontakt med tjenesten. Sjekk nettet og prøv igjen.';
  return m;
}
function isNetErr(e) { return !navigator.onLine || /Failed to fetch|NetworkError|Load failed/i.test((e && e.message) || ''); }
function csvCell(v) { v = v == null ? '' : String(v); return /[;"\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }

/* ---------- tilstand ---------- */
var S = {
  user: null, mems: [], org: null, role: 'ansatt', areas: [], tasks: [], units: [], names: {},
  day: ymd(new Date()), area: 'all', month: null, devFilter: 'alle', devs: [], dayRows: [], overdue: [], screen: 'auth', cameFrom: 'more'
};
function isLeder() { return S.role === 'leder'; }
function nameOf(id) { return (id && S.names[id]) || 'Ukjent'; }

/* ---------- navigasjon ---------- */
var TABS = ['today', 'cal', 'dev', 'more', 'mod', 'sub'];
function go(name) {
  S.screen = name;
  $$('.screen').forEach(function (s) { s.classList.remove('on'); s.classList.remove('printing'); });
  $('#s-' + name).classList.add('on');
  var inApp = TABS.indexOf(name) >= 0;
  $('#tabs').hidden = !(inApp && S.org);
  $('#addNav').hidden = !(S.org && isLeder());
  $('#top').hidden = !(S.org || name === 'start' || name === 'wiz');
  $$('#tabs button').forEach(function (b) { if (b.dataset.go === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  $$('#mods button').forEach(function (b) { b.setAttribute('aria-current', (name === 'mod' || name === 'sub') && S.mod === b.dataset.mod ? 'true' : 'false'); });
  window.scrollTo(0, 0);
  if (name === 'mod') renderMod();
  if (name === 'today') renderToday();
  if (name === 'cal') renderCal();
  if (name === 'dev') loadDevs();
  if (name === 'more') renderMore();
}
$$('#tabs button[data-go]').forEach(function (b) { b.addEventListener('click', function () { go(b.dataset.go); }); });

/* ---------- dialog ---------- */
var dlg = $('#dlg');
function openDlg(nodes) { var b = clear($('#dlgBody')); add(b, nodes); if (!dlg.open) dlg.showModal(); }
function closeDlg() { if (dlg.open) dlg.close(); }
dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDlg(); });

/* ---------- innlogging ---------- */
var authMode = 'in';
function setAuthMode(m) {
  authMode = m;
  $('#authIn').setAttribute('aria-pressed', m === 'in');
  $('#authUp').setAttribute('aria-pressed', m === 'up');
  $('#authGo').textContent = m === 'in' ? 'Logg inn' : 'Opprett bruker';
  $('#pw').setAttribute('autocomplete', m === 'in' ? 'current-password' : 'new-password');
  $('#resetPw').hidden = m !== 'in';
  msg($('#authMsg'), '', '');
}
$('#authIn').addEventListener('click', function () { setAuthMode('in'); });
$('#authUp').addEventListener('click', function () { setAuthMode('up'); });
$('#authForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  var email = $('#email').value.trim(), pw = $('#pw').value, out = $('#authMsg'), btn = $('#authGo');
  btn.disabled = true; msg(out, '', '');
  try {
    if (authMode === 'in') {
      var r = await sb.auth.signInWithPassword({ email: email, password: pw });
      if (r.error) throw r.error;
    } else {
      var u = await sb.auth.signUp({ email: email, password: pw, options: { emailRedirectTo: location.origin + location.pathname } });
      if (u.error) throw u.error;
      if (!u.data.session) msg(out, 'ok', 'Sjekk e-posten din og bekreft adressen. Deretter kan du logge inn.');
    }
  } catch (err) { msg(out, 'err', errText(err)); }
  btn.disabled = false;
});
$('#resetPw').addEventListener('click', async function () {
  var email = $('#email').value.trim();
  if (!email) { msg($('#authMsg'), 'err', 'Skriv inn e-postadressen din først.'); return; }
  var r = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
  msg($('#authMsg'), r.error ? 'err' : 'ok', r.error ? errText(r.error) : 'Hvis adressen finnes, har vi sendt en lenke for nytt passord.');
});
async function logout() { await sb.auth.signOut(); S.org = null; S.mems = []; go('auth'); }
$('#startOut').addEventListener('click', logout);

function recoveryDialog() {
  var pw = h('input', { type: 'password', id: 'newpw', minlength: 8, autocomplete: 'new-password' });
  var out = h('div', { role: 'status' });
  openDlg([h('h2', null, 'Nytt passord'), h('label', { class: 'f' }, 'Nytt passord (minst 8 tegn)', pw), out,
    h('button', { class: 'btn', onclick: async function () {
      var r = await sb.auth.updateUser({ password: pw.value });
      if (r.error) msg(out, 'err', errText(r.error)); else { closeDlg(); toast('Passordet er endret'); }
    } }, 'Lagre')]);
}

/* ---------- oppstart ---------- */
sb.auth.onAuthStateChange(function (ev, session) {
  if (ev === 'PASSWORD_RECOVERY') { setTimeout(recoveryDialog, 0); }
  if (ev === 'SIGNED_OUT') { S.user = null; return; }
  if ((ev === 'SIGNED_IN' || ev === 'INITIAL_SESSION') && session && (!S.user || S.user.id !== session.user.id)) {
    S.user = session.user;
    setTimeout(afterLogin, 0);
  } else if (ev === 'INITIAL_SESSION' && !session) go('auth');
});

async function afterLogin() {
  try {
    var r = await sb.from('members').select('org_id, role, display_name, organizations(id, name, orgnr, address, business_type, has_alcohol, created_at)').eq('user_id', S.user.id);
    if (r.error) throw r.error;
    S.mems = r.data || [];
    if (!S.mems.length) { S.org = null; go('start'); return; }
    var want = lsGet('ikmat-org', null);
    var m = S.mems.filter(function (x) { return x.org_id === want; })[0] || S.mems[0];
    await selectOrg(m);
    go('today');
    flushQueue();
  } catch (e) {
    if (isNetErr(e)) { $('#offline').hidden = false; toast('Ingen nett'); }
    else toast(errText(e));
  }
}
async function selectOrg(m) {
  S.org = m.organizations; S.role = m.role; lsSet('ikmat-org', m.org_id);
  S.cover = loadCover();
  var res = await Promise.all([
    sb.from('areas').select('*').eq('org_id', S.org.id).order('created_at'),
    sb.from('tasks').select('*').eq('org_id', S.org.id).order('sort').order('title'),
    sb.from('members').select('user_id, role, display_name').eq('org_id', S.org.id),
    sb.from('units').select('*').eq('org_id', S.org.id).order('created_at')
  ]);
  res.forEach(function (x) { if (x.error) throw x.error; });
  S.areas = res[0].data; S.tasks = res[1].data; S.units = res[3].data;
  var bl = await sb.from('routine_blocks').select('*').eq('org_id', S.org.id).order('start_time'); S.blocks = bl.error ? [] : bl.data;
  await reloadQuick();
  S.names = {}; S.members = res[2].data;
  S.members.forEach(function (x) { S.names[x.user_id] = x.display_name || 'Uten navn'; });
}
window.addEventListener('online', function () { $('#offline').hidden = true; flushQueue(); });
window.addEventListener('offline', function () { $('#offline').hidden = false; });
if (!navigator.onLine) $('#offline').hidden = false;

/* ---------- start: bli med ---------- */
$('#startNew').addEventListener('click', function () { startWizard(); });
$('#joinGo').addEventListener('click', async function () {
  var out = $('#joinMsg'), name = $('#joinName').value.trim(), code = $('#joinCode').value.trim();
  if (!name || !code) { msg(out, 'err', 'Fyll inn navn og kode.'); return; }
  var r = await sb.rpc('join_with_code', { p_code: code, p_name: name });
  if (r.error) { msg(out, 'err', errText(r.error)); return; }
  await afterLogin();
});

/* ================= I DAG ================= */
var ROUT_LABEL = { apning: 'Åpning', stenging: 'Stenging' };
var DOMAIN_LABEL = { mat: 'Mat', alkohol: 'Alkohol', hms: 'HMS' };
var queue = lsGet('ikmat-q', []);

function recText(r) {
  var f = r.freq || 'daily', ev = +r.every > 1 ? +r.every : 1;
  if (ev > 1) {
    var u = { daily: 'dag', weekly: 'uke', monthly: 'måned', yearly: 'år' }[f] || 'dag';
    var base = 'Hver ' + ev + '. ' + u;
    if (f === 'weekly') base += ' ' + (r.weekdays || [1]).map(function (n) { return WD[n - 1].toLowerCase(); }).join(', ');
    if (f === 'monthly') base += ' den ' + (r.day || 1) + '.';
    return base + (r.start ? ' fra ' + fmtShort(r.start) : '');
  }
  if (f === 'daily') return r.weekdays && r.weekdays.length && r.weekdays.length < 7 ? 'Hver ' + r.weekdays.map(function (n) { return WD[n - 1].toLowerCase(); }).join(', ') : 'Hver dag';
  if (f === 'weekly') return 'Ukentlig ' + (r.weekdays || [1]).map(function (n) { return WD[n - 1].toLowerCase(); }).join(', ');
  if (f === 'monthly') return 'Månedlig den ' + (r.day || 1) + '.';
  return 'Årlig ' + (r.day || 1) + '. ' + MON[(r.month || 1) - 1];
}
function fmtShort(s) { var d = parseYmd(s); return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear(); }
function dayNum(d) { return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
function dueOn(rec, d) {
  var f = rec.freq || 'daily', iso = isoDow(d);
  if (rec.start && ymd(d) < rec.start) return false;
  var ev = +rec.every > 1 ? +rec.every : 1;
  if (ev > 1) {
    var st = rec.start ? parseYmd(rec.start) : d;
    if (f === 'daily') return (dayNum(d) - dayNum(st)) % ev === 0;
    if (f === 'weekly') { if (Math.round(((dayNum(d) - (iso - 1)) - (dayNum(st) - (isoDow(st) - 1))) / 7) % ev !== 0) return false; }
    if (f === 'monthly') { if (((d.getFullYear() - st.getFullYear()) * 12 + d.getMonth() - st.getMonth()) % ev !== 0) return false; }
    if (f === 'yearly') { if ((d.getFullYear() - st.getFullYear()) % ev !== 0) return false; }
  }
  var wd = Array.isArray(rec.weekdays) ? rec.weekdays.map(Number) : null;
  var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  if (f === 'daily') return !wd || wd.indexOf(iso) >= 0;
  if (f === 'weekly') return (wd || [1]).indexOf(iso) >= 0;
  if (f === 'monthly') return d.getDate() === Math.min(rec.day || 1, last);
  if (f === 'yearly') return d.getMonth() + 1 === (rec.month || 1) && d.getDate() === Math.min(rec.day || 1, last);
  return false;
}

async function fetchDay(day) {
  var key = 'ikmat-day-' + S.org.id + '-' + day;
  try {
    var r = await sb.rpc('tasks_for_day', { p_org: S.org.id, p_day: day });
    if (r.error) throw r.error;
    $('#offline').hidden = navigator.onLine;
    lsSet(key, r.data);
    return r.data;
  } catch (e) {
    if (isNetErr(e)) { $('#offline').hidden = false; return lsGet(key, []); }
    throw e;
  }
}
function applyQueue(rows, day) {
  // vis kvitteringer som venter på nett som utført
  queue.forEach(function (q) {
    if (q.due_date !== day || q.org_id !== S.org.id) return;
    rows.forEach(function (r) { if (r.task_id === q.task_id && !r.run_id) { r.run_status = q.status; r.run_value = q.value; r.run_done_by = S.user.id; r.run_done_at = q.done_at; r.pending = true; } });
  });
  return rows;
}

async function renderToday() {
  if (!S.org) return;
  var day = S.day, today = ymd(new Date());
  $('#dLabel').textContent = '';
  var lab = $('#dLabel'); lab.appendChild(document.createTextNode(day === today ? 'I dag' : fmtDate(day)));
  lab.appendChild(h('small', null, day === today ? fmtDate(day) : (day < today ? 'Tidligere dag' : 'Kommende dag')));
  $('#dNext').disabled = false;
  // avdelingsfilter
  var chips = clear($('#areaChips'));
  $('#covRow').hidden = S.areas.length < 2;
  if (S.areas.length > 1) {
    chips.appendChild(chip('Alle', !S.cover.length, function () { S.cover = []; saveCover(); renderToday(); }));
    S.areas.forEach(function (a) { chips.appendChild(chip(a.name, S.cover.indexOf(a.id) >= 0, function () {
      var i = S.cover.indexOf(a.id); if (i >= 0) S.cover.splice(i, 1); else S.cover.push(a.id);
      saveCover(); renderToday();
    })); });
  }
  var rows;
  try {
    if (day === today && S.closedFor !== S.org.id + today) { S.closedFor = S.org.id + today; try { await sb.rpc('close_missed', { p_org: S.org.id }); } catch (e) { /* ikke kritisk */ } }
    rows = applyQueue(await fetchDay(day), day);
    S.dayRows = rows;
    var startDay = S.org && S.org.created_at ? ymd(new Date(S.org.created_at)) : null;
    if (day === today && (!startDay || startDay < today)) {
      var prev = applyQueue(await fetchDay(addDays(day, -1)), addDays(day, -1));
      var todayIds = {}; rows.forEach(function (r) { todayIds[r.task_id] = 1; });
      S.overdue = prev.filter(function (r) { return !r.run_status && !todayIds[r.task_id]; }).map(function (r) { r.overdueDay = addDays(day, -1); return r; });
    } else S.overdue = [];
    S.hmsItems = [];
    if (day === today && isLeder()) { try { S.hmsItems = await hmsTodayItems(); } catch (e) { S.hmsItems = []; } }
  } catch (e) { clear($('#taskList')).appendChild(h('div', { class: 'err' }, errText(e))); return; }
  drawToday();
}
/* ---------- Jeg dekker i dag ---------- */
function coverKey() { return 'fg-cover-' + (S.org ? S.org.id : ''); }
function loadCover() { var v = lsGet(coverKey(), null); return v && v.day === ymd(new Date()) && Array.isArray(v.ids) ? v.ids : []; }
function saveCover() { lsSet(coverKey(), { day: ymd(new Date()), ids: S.cover }); }
function inCover(r) { return !S.cover.length || !r.area_id || S.cover.indexOf(r.area_id) >= 0; }

/* ---------- Når det skjer ---------- */
async function reloadQuick() {
  var q = await sb.from('quick_routines').select('*').eq('org_id', S.org.id).eq('active', true).order('sort').order('created_at');
  S.quick = q.error ? [] : q.data;
}
function quickOpen(q) {
  var items = Array.isArray(q.items) ? q.items : [], boxes = [], note = h('textarea', { placeholder: 'Valgfritt notat om hva som skjedde' });
  var rows = items.map(function (t, i) {
    var c = h('input', { type: 'checkbox', id: 'qk' + i }); boxes.push(c);
    return h('label', { class: 'qchk', for: 'qk' + i }, c, h('span', null, t));
  });
  openDlg([h('h2', null, q.title), q.intro ? h('p', { class: 'muted' }, q.intro) : null, h('div', null, rows), h('label', { class: 'f' }, 'Notat', note),
    h('div', { class: 'row' },
      h('button', { class: 'btn', type: 'button', onclick: async function () {
        var n = boxes.filter(function (b) { return b.checked; }).length;
        var r = await sb.from('quick_runs').insert({ org_id: S.org.id, routine_id: q.id, title: q.title, ticked: n, note: note.value.trim() || null });
        if (r.error) { toast(errText(r.error)); return; }
        closeDlg(); toast('Logget: ' + q.title);
      } }, 'Ferdig, logg'),
      h('button', { class: 'btn alt', type: 'button', onclick: closeDlg }, 'Lukk')),
    h('p', { class: 'small muted' }, 'Sjekklisten er et forslag. Tilpass den til stedet. Er noen skadet eller i fare: ring 110, 112 eller 113.')]);
}
async function renderQuickSection(l) {
  var list = S.quick || [], runs = [];
  try { var rr = await sb.from('quick_runs').select('title,ticked,note,done_by,done_at').eq('org_id', S.org.id).order('done_at', { ascending: false }).limit(10); runs = rr.error ? [] : rr.data; } catch (e) { runs = []; }
  var box = h('div', { class: 'stack' }, h('h2', null, 'Når det skjer'),
    h('p', { class: 'muted' }, 'Korte sjekklister du åpner når noe skjer, uavhengig av vakt og klokkeslett. Alle kan åpne dem. Hver gjennomføring logges.'));
  if (!list.length) box.appendChild(h('div', { class: 'note' }, isLeder() ? 'Ingen sjekklister ennå. Legg til fra forslag eller lag din egen.' : 'Ingen sjekklister er lagt inn ennå. Be lederen legge dem til.'));
  list.forEach(function (q) {
    var n = (q.items || []).length;
    box.appendChild(h('div', { class: 'row' },
      h('button', { class: 'dev grow', type: 'button', onclick: function () { quickOpen(q); } }, h('div', { class: 't' }, q.title), h('div', { class: 'small muted' }, (q.intro ? q.intro + ' ' : '') + n + ' punkter')),
      isLeder() ? h('button', { class: 'btn soft small', type: 'button', onclick: function () { quickEdit(q); } }, 'Rediger') : null));
  });
  if (isLeder()) box.appendChild(h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: function () { quickEdit(null); } }, 'Ny sjekkliste'), h('button', { class: 'btn alt', type: 'button', onclick: quickSuggest }, 'Legg til fra forslag')));
  if (runs.length) box.appendChild(h('details', { class: 'card' }, h('summary', { style: 'font-weight:600;cursor:pointer' }, 'Logg for sjekklister (' + runs.length + ')'), table(['Tid', 'Hvem', 'Sjekkliste', 'Punkter'], runs.map(function (x) { return [fmtTs(x.done_at), nameOf(x.done_by), x.title, x.ticked]; }))));
  l.appendChild(box);
}
function quickSuggest() {
  var have = {}; (S.quick || []).forEach(function (q) { have[q.title] = 1; });
  var sug = window.DATA.quick.filter(function (q) { return !have[q.title]; });
  if (!sug.length) { toast('Alle forslagene er lagt til'); return; }
  var boxes = sug.map(function (q, i) { return h('input', { type: 'checkbox', id: 'qs' + i, checked: q.pin }); });
  openDlg([h('h2', null, 'Forslag'), h('p', { class: 'muted' }, 'Velg hvilke du vil legge til. Du kan endre dem etterpå. Teksten er forslag som må tilpasses stedet.'),
    h('div', null, sug.map(function (q, i) { return h('label', { class: 'qchk', for: 'qs' + i }, boxes[i], h('span', null, h('b', null, q.title), h('div', { class: 'small muted' }, q.intro))); })),
    h('button', { class: 'btn', type: 'button', onclick: async function () {
      var rows = [], base = (S.quick || []).length;
      sug.forEach(function (q, i) { if (boxes[i].checked) rows.push({ org_id: S.org.id, title: q.title, intro: q.intro, items: q.items, pinned: !!q.pin, sort: base + rows.length }); });
      if (!rows.length) { closeDlg(); return; }
      var r = await sb.from('quick_routines').insert(rows);
      if (r.error) { toast(errText(r.error)); return; }
      closeDlg(); await reloadQuick(); renderMod(); toast('Lagt til');
    } }, 'Legg til valgte')]);
}
function quickEdit(q) {
  var title = h('input', { type: 'text', maxlength: 80, value: q ? q.title : '' }), intro = h('input', { type: 'text', maxlength: 300, value: q && q.intro ? q.intro : '' });
  var items = h('textarea', { rows: 8, placeholder: 'Ett punkt per linje' }, q ? (q.items || []).join('\n') : '');
    openDlg([h('h2', null, q ? 'Rediger sjekkliste' : 'Ny sjekkliste'), h('label', { class: 'f' }, 'Navn', title), h('label', { class: 'f' }, 'Når brukes den?', intro), h('label', { class: 'f' }, 'Punkter', items),
    h('div', { class: 'row' },
      h('button', { class: 'btn', type: 'button', onclick: async function () {
        var name = title.value.trim(), arr = items.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
        if (!name || !arr.length) { toast('Skriv navn og minst ett punkt'); return; }
        var row = { title: name, intro: intro.value.trim() || null, items: arr };
        var r = q ? await sb.from('quick_routines').update(row).eq('id', q.id) : await sb.from('quick_routines').insert(Object.assign({ org_id: S.org.id, sort: (S.quick || []).length }, row));
        if (r.error) { toast(errText(r.error)); return; }
        closeDlg(); await reloadQuick(); renderMod();
      } }, 'Lagre'),
      q ? h('button', { class: 'btn danger', type: 'button', onclick: async function () {
        if (!confirm('Slette «' + q.title + '»?')) return;
        var r = await sb.from('quick_routines').delete().eq('id', q.id);
        if (r.error) { toast(errText(r.error)); return; }
        closeDlg(); await reloadQuick(); renderMod();
      } }, 'Slett') : null)]);
}
function chip(text, on, fn) { return h('button', { class: 'chip', type: 'button', 'aria-pressed': on ? 'true' : 'false', onclick: fn }, text); }

function drawToday() {
  var tById = {}; S.tasks.forEach(function (t) { tById[t.id] = t; });
  function visible(r, day) { var t = tById[r.task_id]; return !t || blockOk(t, day); }
  var rows = S.dayRows.filter(function (r) { return inCover(r) && visible(r, S.day); });
  var otherRows = S.dayRows.filter(function (r) { return !inCover(r) && visible(r, S.day); });
  /* Uregistrert fra i går: daglige er logget som «ikke registrert». Resten flyttes til dagens liste. */
  var nowM0 = new Date().getHours() * 60 + new Date().getMinutes(), carry = {};
  S.overdue.filter(function (r) { return inCover(r) && visible(r, r.overdueDay); }).forEach(function (r) {
    var t = tById[r.task_id], b = S.day === ymd(new Date()) ? blockOf(t) : null;
    if (b && blockNight(b) && nowM0 <= minOf(b.end_time)) { (carry[b.id] = carry[b.id] || []).push(r); return; }
    if (t && (!t.recurrence || (t.recurrence.freq || 'daily') === 'daily')) return;
    rows.push(r);
  });
  var done = rows.filter(function (r) { return r.run_status && r.run_status !== 'missed'; }).length;
  $('#progBar').style.width = (rows.length ? 100 * done / rows.length : 0) + '%';
  $('#progTxt').textContent = rows.length ? done + ' av ' + rows.length + ' oppgaver er kvittert' : 'Ingen oppgaver denne dagen.';

  drawHmsToday();
  clear($('#overdue'));

  var list = clear($('#taskList'));
  function area(r) { return r.area_name || ''; }
  var groups = [];
  var areaOrder = S.areas.map(function (a) { return a.id; });
  function gFor(title, key) { var g = groups.filter(function (x) { return x.key === key; })[0]; if (!g) { g = { key: key, title: title, rows: [] }; groups.push(g); } return g; }
  var open = [], mid = [], close = [], blocked = {};
  (S.blocks || []).filter(function (b) { return carry[b.id]; }).forEach(function (b) { var g = gFor(b.name + ' · fra i går · ' + blockSpan(b), 'c' + b.id); g.rows = carry[b.id]; g.now = true; g.carry = true; });
  var nowM = new Date().getHours() * 60 + new Date().getMinutes(), isToday = S.day === ymd(new Date());
  rows.forEach(function (r) { var t = tById[r.task_id], b = blockOf(t); if (b) { (blocked[b.id] = blocked[b.id] || []).push(r); } else (r.routine === 'apning' ? open : r.routine === 'stenging' ? close : mid).push(r); });
  (S.blocks || []).filter(function (b) { return blocked[b.id]; }).sort(function (a, b) { return (a.start_time || '') < (b.start_time || '') ? -1 : 1; }).forEach(function (b) {
    var arn = b.area_id ? ((S.areas.filter(function (a) { return a.id === b.area_id; })[0] || {}).name || '') : '';
    var g = gFor(b.name + (arn && b.name.indexOf(arn) < 0 ? ' · ' + arn : '') + ' · ' + blockSpan(b), 'b' + b.id); g.rows = blocked[b.id]; g.block = b;
    var sm = b.start_time ? +hm(b.start_time).slice(0, 2) * 60 + +hm(b.start_time).slice(3) : 0, em = b.end_time ? +hm(b.end_time).slice(0, 2) * 60 + +hm(b.end_time).slice(3) : 1440;
    g.now = isToday && (b.start_time || b.end_time) && nowM >= sm && (blockNight(b) || nowM <= em);
  });
  function perArea(arr, label, prefix) {
    var ids = areaOrder.filter(function (id) { return arr.some(function (r) { return r.area_id === id; }); });
    if (arr.some(function (r) { return !r.area_id; })) ids.push(null);
    ids.forEach(function (id) {
      var rs = arr.filter(function (r) { return r.area_id === id; });
      var nm = id ? area(rs[0]) : '';
      var g = gFor(label + (nm ? ' · ' + nm : ''), prefix + (id || 'x')); g.rows = rs; g.rout = true;
    });
  }
  perArea(open, 'Åpning', 'o');
  ['mat', 'alkohol', 'hms'].forEach(function (dm) {
    var rs = mid.filter(function (r) { return r.domain === dm; });
    if (rs.length) { var g = gFor('Faste kontroller · ' + DOMAIN_LABEL[dm], 'm' + dm); g.rows = rs; }
  });
  perArea(close, 'Stenging', 's');
  if (!groups.length) list.appendChild(h('div', { class: 'note' }, 'Ingen oppgaver er planlagt denne dagen. Trykk «Ny rutine» for å legge til.'));
  groups.forEach(function (g) {
    var d = g.rows.filter(function (r) { return r.run_status && r.run_status !== 'missed'; }).length;
    var head = h('header', null, h('h3', null, g.title), g.now && d !== g.rows.length ? h('span', { class: 'pill a' }, 'Pågår nå') : null, h('span', { class: 'pill ' + (d === g.rows.length ? 'g' : '') }, d === g.rows.length ? 'Ferdig' : d + ' av ' + g.rows.length));
    var box = h('div', { class: 'group' }, head);
    g.rows.forEach(function (r) { box.appendChild(taskRow(r, r.overdueDay || S.day)); });
    list.appendChild(box);
  });
  if (otherRows.length) {
    var od2 = otherRows.filter(function (r) { return r.run_status && r.run_status !== 'missed'; }).length, det = h('details', { class: 'other' }, h('summary', null, 'Andre rutiner · ' + od2 + ' av ' + otherRows.length));
    otherRows.forEach(function (r) { det.appendChild(taskRow(r, S.day)); });
    list.appendChild(det);
  }
  var cb = clear($('#closeBox'));
  if (rows.length && done === rows.length) cb.appendChild(h('div', { class: 'ok' }, 'Alt er kvittert for ' + (S.day === ymd(new Date()) ? 'i dag' : fmtDate(S.day)) + '. Bra jobbet.'));
}

function taskRow(r, day) {
  var st = r.run_status;
  var tick = h('button', { class: 'tick', type: 'button', 'aria-label': st ? 'Se detaljer for ' + r.title : 'Kvitter ' + r.title,
    onclick: function () { onTick(r, day); } }, st === 'done' ? '✓' : st === 'skipped' ? '↷' : st === 'missed' ? '✕' : '');
  var meta = h('div', { class: 'meta' });
  if (r.kind === 'measure' && (r.min_value != null || r.max_value != null)) meta.appendChild(h('span', null, 'Grense: ' + (r.min_value != null ? 'min ' + r.min_value : '') + (r.min_value != null && r.max_value != null ? ', ' : '') + (r.max_value != null ? 'maks ' + r.max_value : '') + ' ' + (r.unit || '')));
  if (st) {
    var who = st === 'missed' ? '' : nameOf(r.run_done_by) + ' ' + fmtTs(r.run_done_at);
    if (r.run_value != null) meta.appendChild(h('span', null, r.run_value + ' ' + (r.unit || '')));
    meta.appendChild(h('span', null, st === 'missed' ? 'Ikke registrert' : st === 'skipped' ? 'Hoppet over av ' + who : who));
    if (r.pending) meta.appendChild(h('span', { class: 'pill a' }, 'Venter på nett'));
    if (r.run_value != null && ((r.min_value != null && r.run_value < r.min_value) || (r.max_value != null && r.run_value > r.max_value))) meta.appendChild(h('span', { class: 'pill r' }, 'Utenfor grense'));
  }
  var more = h('div', { class: 'more', hidden: true });
  if (r.hint) more.appendChild(h('div', null, r.hint));
  if (st === 'skipped' && r.run_skip_reason) more.appendChild(h('div', null, 'Begrunnelse: ' + r.run_skip_reason));
  if (r.run_note) more.appendChild(h('div', null, 'Notat: ' + r.run_note));
  if (isLeder()) more.appendChild(h('div', { class: 'acts' }, h('button', { class: 'btn soft small', type: 'button', onclick: function (e) { e.stopPropagation(); var t = S.tasks.filter(function (x) { return x.id === r.task_id; })[0]; if (t) taskDialog(t); } }, 'Endre hvor ofte')));
  if (!st) more.appendChild(h('div', { class: 'acts' }, h('button', { class: 'btn alt small', type: 'button', onclick: function (e) { e.stopPropagation(); skipDialog(r, day); } }, 'Hopp over eller utsett')));
  var body = h('div', { class: 'body' }, h('div', { class: 'ttl' }, r.title), meta, more);
  if (r.hint || st || !st) body.addEventListener('click', function (e) { if (e.target.closest('button')) return; more.hidden = !more.hidden; });
  return h('div', { class: 'task ' + (st || '') }, tick, body);
}

function onTick(r, day) {
  if (r.run_status === 'missed') { toast('Ikke registrert'); return; }
  if (r.run_status) { toast(nameOf(r.run_done_by) + ' · ' + fmtTs(r.run_done_at)); return; }
  if (r.kind === 'check') { saveRun(r, day, { status: 'done' }); return; }
  var note = h('textarea', { id: 'rnote', placeholder: 'Valgfritt notat' });
  var val = h('input', { type: 'text', inputmode: 'decimal', id: 'rval', autocomplete: 'off' });
  var file = h('input', { type: 'file', accept: 'image/*', capture: 'environment', id: 'rfile' });
  var out = h('div', { role: 'status' });
  var fields = [h('h2', null, r.title)];
  if (r.kind === 'measure') {
    fields.push(h('label', { class: 'f' }, 'Måling' + (r.unit ? ' (' + r.unit + ')' : ''), val));
    if (r.min_value != null || r.max_value != null) fields.push(h('div', { class: 'note' }, 'Grense: ' + (r.min_value != null ? 'minst ' + r.min_value : '') + (r.min_value != null && r.max_value != null ? ' og ' : '') + (r.max_value != null ? 'høyst ' + r.max_value : '') + ' ' + (r.unit || '') + '. Utenfor grense opprettes avvik automatisk.'));
  }
  if (r.kind === 'photo') fields.push(h('label', { class: 'f' }, 'Bilde', file));
  fields.push(h('label', { class: 'f' }, r.kind === 'note' ? 'Notat' : 'Notat (valgfritt)', note), out);
  fields.push(h('div', { class: 'row' }, h('button', { class: 'btn alt', type: 'button', onclick: closeDlg }, 'Avbryt'),
    h('button', { class: 'btn grow', type: 'button', onclick: async function (ev) {
      var p = { status: 'done', note: note.value.trim() || null };
      if (r.kind === 'measure') { p.value = num(val.value); if (p.value == null) { msg(out, 'err', 'Skriv inn et tall.'); return; } }
      if (r.kind === 'note' && !p.note) { msg(out, 'err', 'Skriv et notat.'); return; }
      if (r.kind === 'photo') { if (!file.files[0]) { msg(out, 'err', 'Ta eller velg et bilde.'); return; } }
      ev.target.disabled = true;
      try { if (r.kind === 'photo' || file.files[0]) p.photo_path = await uploadPhoto(file.files[0]); } catch (e) { msg(out, 'err', 'Bildet ble ikke lastet opp: ' + errText(e)); ev.target.disabled = false; return; }
      closeDlg(); saveRun(r, day, p);
    } }, 'Kvitter')));
  openDlg(fields);
  setTimeout(function () { (val.isConnected && r.kind === 'measure' ? val : note).focus(); }, 50);
}
function skipDialog(r, day) {
  var why = h('textarea', { id: 'why', placeholder: 'Hvorfor hoppes oppgaven over?' }), out = h('div', { role: 'status' });
  openDlg([h('h2', null, 'Hopp over'), h('p', { class: 'muted' }, r.title), h('label', { class: 'f' }, 'Begrunnelse (kreves)', why), out,
    h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: closeDlg }, 'Avbryt'),
      h('button', { class: 'btn grow', onclick: function () {
        if (!why.value.trim()) { msg(out, 'err', 'Skriv en begrunnelse.'); return; }
        closeDlg(); saveRun(r, day, { status: 'skipped', skip_reason: why.value.trim() });
      } }, 'Hopp over'))]);
}
async function saveRun(r, day, p) {
  var rec = { id: uuid(), org_id: S.org.id, task_id: r.task_id, due_date: day, status: p.status, value: p.value == null ? null : p.value,
    note: p.note || null, skip_reason: p.skip_reason || null, photo_path: p.photo_path || null, done_at: new Date().toISOString() };
  // vis med en gang
  r.run_status = rec.status; r.run_value = rec.value; r.run_note = rec.note; r.run_skip_reason = rec.skip_reason; r.run_done_by = S.user.id; r.run_done_at = rec.done_at;
  if (day !== S.day) S.overdue = S.overdue.filter(function (x) { return x !== r; });
  drawToday();
  var ins = Object.assign({}, rec); delete ins.done_at;
  try {
    var res = await sb.from('task_runs').insert(ins);
    if (res.error) {
      if (res.error.code === '23505') { toast('Allerede kvittert av noen andre'); renderToday(); return; }
      throw res.error;
    }
    if (rec.value != null && ((r.min_value != null && rec.value < r.min_value) || (r.max_value != null && rec.value > r.max_value))) toast('Utenfor grense. Avvik er opprettet.');
    renderToday();
  } catch (e) {
    if (isNetErr(e)) { r.pending = true; queue.push(rec); lsSet('ikmat-q', queue); drawToday(); toast('Lagret på enheten. Sendes når du er på nett.'); }
    else { toast('Kunne ikke lagre: ' + errText(e)); renderToday(); }
  }
}
var flushing = false;
async function flushQueue() {
  if (flushing || !queue.length || !S.org || !navigator.onLine) return;
  flushing = true;
  var rest = [];
  for (var i = 0; i < queue.length; i++) {
    var q = Object.assign({}, queue[i]); delete q.done_at;
    var r = await sb.from('task_runs').insert(q);
    if (r.error && r.error.code !== '23505') { if (isNetErr(r.error)) { rest = queue.slice(i); break; } }
  }
  queue = rest; lsSet('ikmat-q', queue); flushing = false;
  if (S.screen === 'today') renderToday();
}
$('#dPrev').addEventListener('click', function () { S.day = addDays(S.day, -1); renderToday(); });
$('#dNext').addEventListener('click', function () { S.day = addDays(S.day, 1); renderToday(); });

/* ---------- bilder ---------- */
function shrink(file) {
  return new Promise(function (res, rej) {
    var img = new Image(), url = URL.createObjectURL(file);
    img.onload = function () {
      var max = 1280, w = img.width, hh = img.height, k = Math.min(1, max / Math.max(w, hh));
      var c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(hh * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(function (b) { URL.revokeObjectURL(url); b ? res(b) : rej(new Error('Kunne ikke lese bildet')); }, 'image/jpeg', 0.82);
    };
    img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('Kunne ikke lese bildet')); };
    img.src = url;
  });
}
async function uploadPhoto(file) {
  if (!file) return null;
  var blob = await shrink(file), path = S.org.id + '/' + uuid() + '.jpg';
  var r = await sb.storage.from('ikmat-bilder').upload(path, blob, { contentType: 'image/jpeg' });
  if (r.error) throw r.error;
  return path;
}
async function photoImg(path) {
  var r = await sb.storage.from('ikmat-bilder').createSignedUrl(path, 3600);
  if (r.error) return h('div', { class: 'muted small' }, 'Bildet kunne ikke vises.');
  return h('img', { src: r.data.signedUrl, alt: 'Vedlagt bilde', style: 'max-width:100%;border-radius:10px' });
}

/* ================= KALENDER ================= */
$('#mPrev').addEventListener('click', function () { S.month = new Date(S.month.getFullYear(), S.month.getMonth() - 1, 1); renderCal(); });
$('#mNext').addEventListener('click', function () { S.month = new Date(S.month.getFullYear(), S.month.getMonth() + 1, 1); renderCal(); });
$('#addTask').addEventListener('click', function () { taskDialog(null); });
$('#addNav').addEventListener('click', function () { taskDialog(null); });

async function renderCal() {
  if (!S.org) return;
  if (!S.month) { var n = new Date(); S.month = new Date(n.getFullYear(), n.getMonth(), 1); }
  var m = S.month, first = ymd(m), last = ymd(new Date(m.getFullYear(), m.getMonth() + 1, 0));
  $('#mLabel').textContent = MON[m.getMonth()] + ' ' + m.getFullYear();
  var runs = [];
  var r = await sb.from('task_runs').select('task_id, due_date, status').eq('org_id', S.org.id).gte('due_date', first).lte('due_date', last).limit(5000);
  if (!r.error) runs = r.data;
  var done = {};
  runs.forEach(function (x) { done[x.due_date] = (done[x.due_date] || 0) + 1; });
  var g = clear($('#calGrid'));
  WD.forEach(function (w) { g.appendChild(h('div', { class: 'h' }, w)); });
  var lead = isoDow(m) - 1, days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate(), today = ymd(new Date());
  for (var i = 0; i < lead; i++) g.appendChild(h('div'));
  for (var d = 1; d <= days; d++) {
    var dt = new Date(m.getFullYear(), m.getMonth(), d), key = ymd(dt);
    var due = S.tasks.filter(function (t) { return t.active && dueOn(t.recurrence, dt) && blockOk(t, dt); }).length;
    var n2 = done[key] || 0, cls = '';
    if (due) cls = n2 >= due ? 'g' : n2 > 0 ? 'a' : (key < today ? 'r' : '');
    (function (k) {
      g.appendChild(h('button', { class: 'day' + (key === today ? ' today' : ''), type: 'button', 'aria-label': fmtDate(key), onclick: function () { S.day = k; go('today'); } },
        String(d), h('span', { class: 'dot ' + cls })));
    })(key);
  }
  drawTaskAdmin();
}
function drawTaskAdmin() {
  var box = clear($('#taskAdmin'));
  $('#addTask').hidden = !isLeder();
  if (!S.tasks.length) { box.appendChild(h('div', { class: 'note' }, 'Ingen oppgaver ennå.')); return; }
  var areaName = {}; S.areas.forEach(function (a) { areaName[a.id] = a.name; });
  S.tasks.slice().sort(function (a, b) { return (b.active - a.active) || a.title.localeCompare(b.title, 'nb'); }).forEach(function (t) {
    var row = h('div', { class: 'trow' + (t.active ? '' : ' off') },
      h('div', { class: 'grow' }, h('div', { style: 'font-weight:600' }, t.title),
        h('div', { class: 'small muted' }, [(areaName[t.area_id] || 'Hele stedet'), ROUT_LABEL[t.routine] || null, DOMAIN_LABEL[t.domain], recText(t.recurrence)].filter(Boolean).join(' · '))));
    if (isLeder()) row.appendChild(h('button', { class: 'btn soft small', type: 'button', onclick: function () { taskDialog(t); } }, 'Endre'));
    box.appendChild(row);
  });
}
function taskDialog(t, preDomain, preBlock) {
  var isNew = !t; t = t || { title: '', block_id: preBlock || null, domain: preDomain || 'mat', routine: 'annet', kind: 'check', recurrence: { freq: 'daily' }, active: true, area_id: null, unit: '', hint: '' };
  var title = h('input', { type: 'text', id: 't-title', value: t.title, maxlength: 200 });
  var hint = h('textarea', { id: 't-hint' }, t.hint || '');
  var area = h('select', { id: 't-area' }, h('option', { value: '' }, 'Hele stedet'), S.areas.map(function (a) { return h('option', { value: a.id }, a.name); }));
  area.value = t.area_id || '';
  var dom = h('select', { id: 't-dom' }, ['mat', 'alkohol', 'hms'].map(function (x) { return h('option', { value: x }, DOMAIN_LABEL[x]); })); dom.value = t.domain;
  var rout = h('select', { id: 't-rout' }, [['apning', 'Åpning'], ['stenging', 'Stenging'], ['daglig', 'Daglig'], ['ukentlig', 'Ukentlig'], ['manedlig', 'Månedlig'], ['arlig', 'Årlig'], ['annet', 'Annet']].map(function (x) { return h('option', { value: x[0] }, x[1]); })); rout.value = t.routine;
  var kind = h('select', { id: 't-kind' }, [['check', 'Avkrysning'], ['measure', 'Måling'], ['note', 'Notat'], ['photo', 'Bilde']].map(function (x) { return h('option', { value: x[0] }, x[1]); })); kind.value = t.kind;
  var unit = h('input', { type: 'text', id: 't-unit', value: t.unit || '', placeholder: '°C' });
  var mn = h('input', { type: 'text', inputmode: 'decimal', id: 't-min', value: t.min_value == null ? '' : t.min_value });
  var mx = h('input', { type: 'text', inputmode: 'decimal', id: 't-max', value: t.max_value == null ? '' : t.max_value });
  var measure = h('div', { class: 'stack' }, h('label', { class: 'f' }, 'Enhet', unit), h('div', { class: 'row' }, h('label', { class: 'f grow' }, 'Minst', mn), h('label', { class: 'f grow' }, 'Høyst', mx)));
  var rec = t.recurrence || { freq: 'daily' };
  var freq = h('select', { id: 't-freq' }, [['daily', 'Hver dag'], ['weekly', 'Ukentlig'], ['monthly', 'Månedlig'], ['yearly', 'Årlig']].map(function (x) { return h('option', { value: x[0] }, x[1]); })); freq.value = rec.freq || 'daily';
  var every = h('input', { type: 'number', id: 't-every', min: 1, max: 99, value: rec.every || 1, 'aria-label': 'Intervall' });
  var evUnit = h('span', null, '');
  var startD = h('input', { type: 'date', id: 't-start', value: rec.start || '' });
  var evWrap = h('div', { class: 'row' }, h('label', { class: 'f grow' }, 'Hver ...', h('div', { class: 'row' }, every, evUnit)), h('label', { class: 'f grow' }, 'Starter', startD));
  var wd = (rec.weekdays || (rec.freq === 'weekly' ? [1] : [1, 2, 3, 4, 5, 6, 7])).map(Number);
  var wdBox = h('div', { class: 'chips' }, WD.map(function (w, i) {
    var b = h('button', { class: 'chip', type: 'button', 'aria-pressed': wd.indexOf(i + 1) >= 0 ? 'true' : 'false', onclick: function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); } }, w); b.dataset.n = i + 1; return b;
  }));
  var dayN = h('input', { type: 'number', id: 't-day', min: 1, max: 31, value: rec.day || 1 });
  var monN = h('select', { id: 't-mon' }, MON.map(function (m, i) { return h('option', { value: i + 1 }, m); })); monN.value = rec.month || 1;
  var wdWrap = h('div', { class: 'f' }, 'Ukedager', wdBox), dayWrap = h('label', { class: 'f' }, 'Dag i måneden', dayN), monWrap = h('label', { class: 'f' }, 'Måned', monN);
  function sync() {
    measure.hidden = kind.value !== 'measure';
    wdWrap.hidden = !(freq.value === 'daily' || freq.value === 'weekly');
    dayWrap.hidden = !(freq.value === 'monthly' || freq.value === 'yearly');
    monWrap.hidden = freq.value !== 'yearly';
    evUnit.textContent = { daily: '. dag', weekly: '. uke', monthly: '. måned', yearly: '. år' }[freq.value];
  }
  kind.addEventListener('change', sync); freq.addEventListener('change', sync); sync();
  var blk = h('select', { id: 't-blk' }, h('option', { value: '' }, 'Ingen rutinesamling'), (S.blocks || []).map(function (b) { return h('option', { value: b.id }, b.name + ' · ' + blockSpan(b)); })); blk.value = t.block_id || '';
  var act = h('input', { type: 'checkbox', id: 't-act', checked: t.active });
  var out = h('div', { role: 'status' });
  var adv = h('div', { class: 'stack' }, h('label', { class: 'f' }, 'Hjelpetekst', hint),
    h('div', { class: 'row' }, h('label', { class: 'f grow' }, 'Avdeling', area), h('label', { class: 'f grow' }, 'Område', dom)),
    h('div', { class: 'row' }, h('label', { class: 'f grow' }, 'Rutine', rout), h('label', { class: 'f grow' }, 'Type', kind)), measure);
  adv.hidden = isNew;
  var advBtn = h('button', { class: 'btn soft small', type: 'button', onclick: function () { adv.hidden = !adv.hidden; advBtn.textContent = adv.hidden ? 'Flere valg' : 'Færre valg'; } }, 'Flere valg');
  openDlg([h('h2', null, isNew ? 'Ny rutine' : 'Endre rutine'),
    h('label', { class: 'f' }, 'Hva skal gjøres?', title),
    h('label', { class: 'f' }, 'Hvor ofte', freq), evWrap, wdWrap, dayWrap, monWrap, h('label', { class: 'f' }, 'Rutinesamling (sted, vakt eller tid på døgnet)', blk),
    isNew ? advBtn : null, adv,
    isNew ? null : h('label', { class: 'chk' }, act, h('div', null, h('b', null, 'Aktiv'), h('span', null, 'Fjern haken for å slutte å bruke oppgaven. Historikken beholdes.'))),
    out,
    h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: closeDlg }, 'Avbryt'), h('button', { class: 'btn grow', onclick: async function (ev) {
      if (!title.value.trim()) { msg(out, 'err', 'Skriv hva som skal gjøres.'); return; }
      var r2 = { freq: freq.value };
      if (freq.value === 'daily' || freq.value === 'weekly') {
        r2.weekdays = $$('button', wdBox).filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return +b.dataset.n; });
        if (!r2.weekdays.length) { msg(out, 'err', 'Velg minst én ukedag.'); return; }
        if (freq.value === 'daily' && r2.weekdays.length === 7) delete r2.weekdays;
      }
      var evn = Math.max(1, Math.min(99, Math.floor(+every.value) || 1));
      if (evn > 1) { r2.every = evn; r2.start = startD.value || ymd(new Date()); if (freq.value === 'daily') delete r2.weekdays; }
      else if (startD.value) r2.start = startD.value;
      if (freq.value === 'monthly' || freq.value === 'yearly') r2.day = Math.max(1, Math.min(31, +dayN.value || 1));
      if (freq.value === 'yearly') r2.month = +monN.value;
      var row = { org_id: S.org.id, area_id: area.value || null, domain: dom.value, routine: rout.value, title: title.value.trim(), hint: hint.value.trim() || null,
        kind: kind.value, unit: kind.value === 'measure' ? (unit.value.trim() || null) : null,
        min_value: kind.value === 'measure' ? num(mn.value) : null, max_value: kind.value === 'measure' ? num(mx.value) : null,
        recurrence: r2, active: act.checked, block_id: blk.value || null };
      ev.target.disabled = true;
      var res = isNew ? await sb.from('tasks').insert(Object.assign(row, { source: 'egen' })) : await sb.from('tasks').update(row).eq('id', t.id);
      if (res.error) { msg(out, 'err', errText(res.error)); ev.target.disabled = false; return; }
      closeDlg(); toast('Lagret');
      var rt = await sb.from('tasks').select('*').eq('org_id', S.org.id).order('sort').order('title'); if (!rt.error) S.tasks = rt.data;
      if (S.screen === 'today') renderToday(); else if (S.screen === 'mod') renderMod(); else if (S.screen === 'sub') refreshSub(); else renderCal();
    } }, 'Lagre'))]);
}

/* ================= AVVIK ================= */
var DEV_STATUS = { apen: 'Åpen', under_arbeid: 'Under arbeid', lukket: 'Lukket' };
async function loadDevs() {
  if (!S.org) return;
  var r = await sb.from('deviations').select('*').eq('org_id', S.org.id).order('created_at', { ascending: false }).limit(500);
  if (r.error) { clear($('#devList')).appendChild(h('div', { class: 'err' }, errText(r.error))); return; }
  S.devs = r.data; drawDevs();
}
function drawDevs() {
  var chips = clear($('#devChips'));
  [['alle', 'Alle'], ['apen', 'Åpne'], ['under_arbeid', 'Under arbeid'], ['lukket', 'Lukket']].forEach(function (x) {
    chips.appendChild(chip(x[1], S.devFilter === x[0], function () { S.devFilter = x[0]; drawDevs(); }));
  });
  var q = $('#devQ').value.trim().toLowerCase(), list = clear($('#devList'));
  var rows = S.devs.filter(function (d) {
    if (S.devFilter !== 'alle' && d.status !== S.devFilter) return false;
    return !q || (d.title + ' ' + (d.description || '') + ' ' + (d.cause || '') + ' ' + (d.action || '')).toLowerCase().indexOf(q) >= 0;
  });
  if (!rows.length) list.appendChild(h('div', { class: 'note' }, S.devs.length ? 'Ingen avvik passer.' : 'Ingen avvik registrert. Bra.'));
  rows.forEach(function (d) {
    list.appendChild(h('button', { class: 'dev', type: 'button', onclick: function () { devDialog(d); } },
      h('div', { class: 't' }, d.title),
      h('div', { class: 'row small' }, h('span', { class: 'pill ' + (d.status === 'lukket' ? 'g' : d.status === 'apen' ? 'r' : 'a') }, DEV_STATUS[d.status]), h('span', { class: 'pill' }, DOMAIN_LABEL[d.category]), h('span', { class: 'muted' }, fmtTs(d.created_at) + ' · ' + nameOf(d.created_by)))));
  });
}
$('#devQ').addEventListener('input', drawDevs);
$('#newDev').addEventListener('click', function () { devDialog(null); });

function devDialog(d) {
  var isNew = !d; d = d || { title: '', category: 'mat', status: 'apen', description: '', cause: '', action: '' };
  var title = h('input', { type: 'text', id: 'd-title', value: d.title, maxlength: 200 });
  var cat = h('select', { id: 'd-cat' }, ['mat', 'alkohol', 'hms'].map(function (x) { return h('option', { value: x }, DOMAIN_LABEL[x]); })); cat.value = d.category;
  var desc = h('textarea', { id: 'd-desc' }, d.description || '');
  var cause = h('textarea', { id: 'd-cause' }, d.cause || '');
  var act = h('textarea', { id: 'd-act' }, d.action || '');
  var status = h('select', { id: 'd-st' }, Object.keys(DEV_STATUS).map(function (k) { return h('option', { value: k }, DEV_STATUS[k]); })); status.value = d.status;
  var resp = h('select', { id: 'd-resp' }, h('option', { value: '' }, 'Ikke satt'), (S.members || []).map(function (m) { return h('option', { value: m.user_id }, m.display_name || 'Uten navn'); })); resp.value = d.responsible || '';
  var file = h('input', { type: 'file', accept: 'image/*', capture: 'environment', id: 'd-file' });
  var out = h('div', { role: 'status' }), photoBox = h('div');
  if (d.photo_path) photoImg(d.photo_path).then(function (im) { photoBox.appendChild(im); });
  openDlg([h('h2', null, isNew ? 'Nytt avvik' : 'Avvik'),
    h('label', { class: 'f' }, 'Hva skjedde?', title),
    h('div', { class: 'row' }, h('label', { class: 'f grow' }, 'Område', cat), h('label', { class: 'f grow' }, 'Status', status)),
    h('label', { class: 'f' }, 'Beskrivelse', desc), h('label', { class: 'f' }, 'Årsak', cause), h('label', { class: 'f' }, 'Tiltak', act),
    h('label', { class: 'f' }, 'Ansvarlig', resp), photoBox, h('label', { class: 'f' }, d.photo_path ? 'Bytt bilde' : 'Bilde', file), out,
    h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: closeDlg }, 'Lukk'), h('button', { class: 'btn grow', onclick: async function (ev) {
      if (!title.value.trim()) { msg(out, 'err', 'Beskriv hva som skjedde.'); return; }
      ev.target.disabled = true;
      var row = { category: cat.value, title: title.value.trim(), description: desc.value.trim() || null, cause: cause.value.trim() || null, action: act.value.trim() || null,
        status: status.value, responsible: resp.value || null, closed_at: status.value === 'lukket' ? (d.closed_at || new Date().toISOString()) : null };
      try { if (file.files[0]) row.photo_path = await uploadPhoto(file.files[0]); } catch (e) { msg(out, 'err', 'Bildet ble ikke lastet opp: ' + errText(e)); ev.target.disabled = false; return; }
      var res = isNew ? await sb.from('deviations').insert(Object.assign(row, { org_id: S.org.id })) : await sb.from('deviations').update(row).eq('id', d.id);
      if (res.error) { msg(out, 'err', errText(res.error)); ev.target.disabled = false; return; }
      closeDlg(); toast('Lagret'); loadDevs();
    } }, 'Lagre'))]);
}


/* ================= KJØLESKAP OG FRYSERE ================= */
var UNIT_LABEL = { kjol: 'Kjøl', frys: 'Frys' };
var UNIT_GENERIC = { kjol: /kjøl/i, frys: /frys/i };
function unitTitle(kind, name, closing) { return UNIT_LABEL[kind] + ': ' + name + (closing ? ' ved stenging' : ''); }
async function unitLimits(orgId) {
  var lim = { kjol: 4, frys: -18 };
  var r = await sb.from('haccp_plans').select('plan').eq('org_id', orgId).order('version', { ascending: false }).limit(1);
  if (!r.error && r.data && r.data[0] && r.data[0].plan && r.data[0].plan.ccps) {
    r.data[0].plan.ccps.forEach(function (c) { if (lim.hasOwnProperty(c.id) && typeof c.value === 'number') lim[c.id] = c.value; });
  }
  return lim;
}
/* list: [{kind:'kjol'|'frys', name, area_id}] */
async function createUnits(orgId, list, limits) {
  list = list.filter(function (x) { return x.name && x.name.trim(); });
  if (!list.length) return [];
  var lim = limits || await unitLimits(orgId);
  var ins = await sb.from('units').insert(list.map(function (x) { return { org_id: orgId, area_id: x.area_id || null, kind: x.kind, name: x.name.trim() }; })).select();
  if (ins.error) throw ins.error;
  var rows = [];
  ins.data.forEach(function (u, i) {
    [false].forEach(function (closing) {
      rows.push({ org_id: orgId, area_id: u.area_id, unit_id: u.id, domain: 'mat', routine: closing ? 'stenging' : 'apning', title: unitTitle(u.kind, u.name, closing),
        hint: 'Mål og skriv inn. Grensen kommer fra HACCP-planen.', kind: 'measure', unit: '°C', max_value: lim[u.kind], recurrence: { freq: 'daily' }, source: 'haccp', sort: 1000 + i * 2 + (closing ? 1 : 0) });
    });
  });
  var tr = await sb.from('tasks').insert(rows);
  if (tr.error) throw tr.error;
  // de generelle kjøl- og fryse-målingene erstattes av enhetene
  var gen = await sb.from('tasks').select('id, title, area_id').eq('org_id', orgId).eq('source', 'mal').eq('active', true).eq('unit', '°C').is('unit_id', null);
  if (!gen.error) {
    var off = gen.data.filter(function (t) {
      return ins.data.some(function (u) { return UNIT_GENERIC[u.kind].test(t.title) && (!u.area_id || !t.area_id || u.area_id === t.area_id); });
    });
    for (var j = 0; j < off.length; j++) await sb.from('tasks').update({ active: false }).eq('id', off[j].id);
  }
  return ins.data;
}
async function reloadUnits() {
  var a = await sb.from('units').select('*').eq('org_id', S.org.id).order('created_at');
  var b = await sb.from('tasks').select('*').eq('org_id', S.org.id).order('sort').order('title');
  if (!a.error) S.units = a.data; if (!b.error) S.tasks = b.data;
}
function unitsDialog() {
  var areaName = {}; S.areas.forEach(function (a) { areaName[a.id] = a.name; });
  var list = h('div', { class: 'stack' });
  if (!S.units.length) list.appendChild(h('p', { class: 'muted' }, 'Ingen registrert ennå. Legg til hvert kjøleskap og hver fryser, så får de egne målinger i dagslisten.'));
  S.units.slice().sort(function (a, b) { return (b.active - a.active) || a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name, 'nb'); }).forEach(function (u) {
    list.appendChild(h('div', { class: 'trow' + (u.active ? '' : ' off') },
      h('div', { class: 'grow' }, h('div', { style: 'font-weight:600' }, u.name), h('div', { class: 'small muted' }, UNIT_LABEL[u.kind] + (u.area_id ? ' · ' + (areaName[u.area_id] || '') : '') + (u.active ? '' : ' · Ikke i bruk'))),
      h('button', { class: 'btn soft small', type: 'button', onclick: function () { unitEditDialog(u); } }, 'Endre')));
  });
  openDlg([h('h2', null, 'Kjøleskap og frysere'), list,
    h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: closeDlg }, 'Lukk'), h('button', { class: 'btn grow', onclick: function () { unitAddDialog(); } }, 'Legg til')) ]);
}
function unitAddDialog() {
  var kind = h('select', { id: 'u-kind' }, h('option', { value: 'kjol' }, 'Kjøleskap eller kjølerom'), h('option', { value: 'frys' }, 'Fryser eller fryserom'));
  var name = h('input', { type: 'text', id: 'u-name', maxlength: 100, placeholder: 'For eksempel Kjøl 1 eller Fryser bak' });
  var area = h('select', { id: 'u-area' }, h('option', { value: '' }, 'Hele stedet'), S.areas.map(function (a) { return h('option', { value: a.id }, a.name); }));
  var out = h('div', { role: 'status' });
  openDlg([h('h2', null, 'Legg til'), h('label', { class: 'f' }, 'Type', kind), h('label', { class: 'f' }, 'Navn', name), h('label', { class: 'f' }, 'Avdeling', area),
    h('p', { class: 'small muted' }, 'Enheten får målinger ved åpning og stenging. De generelle målingene for kjøl og frys i samme avdeling slås av.'), out,
    h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: unitsDialog }, 'Tilbake'), h('button', { class: 'btn grow', onclick: async function (ev) {
      if (!name.value.trim()) { msg(out, 'err', 'Gi enheten et navn.'); return; }
      ev.target.disabled = true;
      try { await createUnits(S.org.id, [{ kind: kind.value, name: name.value, area_id: area.value || null }]); }
      catch (e) { msg(out, 'err', errText(e)); ev.target.disabled = false; return; }
      await reloadUnits(); toast('Lagt til'); renderMore(); unitsDialog();
    } }, 'Lagre'))]);
}
function unitEditDialog(u) {
  var name = h('input', { type: 'text', id: 'ue-name', maxlength: 100, value: u.name });
  var act = h('input', { type: 'checkbox', id: 'ue-act', checked: u.active });
  var out = h('div', { role: 'status' });
  openDlg([h('h2', null, 'Endre ' + UNIT_LABEL[u.kind].toLowerCase()), h('label', { class: 'f' }, 'Navn', name),
    h('label', { class: 'chk' }, act, h('div', null, h('b', null, 'I bruk'), h('span', null, 'Fjern haken når enheten tas ut av drift. Tidligere målinger beholdes.'))), out,
    h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: unitsDialog }, 'Tilbake'), h('button', { class: 'btn grow', onclick: async function (ev) {
      if (!name.value.trim()) { msg(out, 'err', 'Gi enheten et navn.'); return; }
      ev.target.disabled = true;
      var r1 = await sb.from('units').update({ name: name.value.trim(), active: act.checked }).eq('id', u.id);
      if (r1.error) { msg(out, 'err', errText(r1.error)); ev.target.disabled = false; return; }
      var ts = S.tasks.filter(function (t) { return t.unit_id === u.id; });
      for (var i = 0; i < ts.length; i++) {
        var closing = ts[i].routine === 'stenging';
        var r2 = await sb.from('tasks').update({ title: unitTitle(u.kind, name.value.trim(), closing), active: act.checked }).eq('id', ts[i].id);
        if (r2.error) { msg(out, 'err', errText(r2.error)); ev.target.disabled = false; return; }
      }
      await reloadUnits(); toast('Lagret'); renderMore(); unitsDialog();
    } }, 'Lagre'))]);
}

/* ================= MER ================= */
function hm(t) { return t ? String(t).slice(0, 5) : ''; }
function blockOf(t) { return t && t.block_id ? (S.blocks || []).filter(function (b) { return b.id === t.block_id; })[0] : null; }
function blockOk(t, dayStr) {
  var b = blockOf(t); if (!b) return true; if (!b.active) return false;
  return !b.weekdays || !b.weekdays.length || b.weekdays.indexOf(isoDow(typeof dayStr === 'string' ? parseYmd(dayStr) : dayStr)) >= 0;
}
function blockNight(b) { return !!(b.start_time && b.end_time && hm(b.end_time) < hm(b.start_time)); }
function minOf(t) { return +hm(t).slice(0, 2) * 60 + +hm(t).slice(3); }
function blockSpan(b) { return b.start_time || b.end_time ? hm(b.start_time) + '–' + hm(b.end_time) + (blockNight(b) ? ' (natt)' : '') : 'Hele døgnet'; }
function blockDays(b) { return b.weekdays && b.weekdays.length && b.weekdays.length < 7 ? b.weekdays.slice().sort().map(function (n) { return WD[n - 1]; }).join(', ') : 'Alle dager'; }
var MOD = {
  rut: ['Planlegging', 'Her planlegger du rutiner og sjekklister. Rutinesamlinger (steder, vakter og tider på døgnet) blir egne grupper i I dag-listen. Sjekklister åpnes når noe skjer.'],
  mat: ['IK-mat', 'Internkontroll for mat: HACCP-plan, temperaturer, renhold og avvik.'],
  alkohol: ['IK-alkohol', 'Internkontroll for servering av alkohol: ansvar, opplæring og hendelser.'],
  hms: ['HMS', 'Helse, miljø og sikkerhet: vernerunder, brann, førstehjelp og risiko.']
};
function renderMod() {
  var m = S.mod || 'mat';
  $('#modTitle').textContent = MOD[m][0]; $('#modInfo').textContent = MOD[m][1] + (m === 'rut' ? '' : ' Alle rutinene vises også i I dag-listen.');
  var l = clear($('#modLinks'));
  $('#modTasksWrap').hidden = m === 'rut';
  if (m === 'rut') renderRut(l);
  else if (m === 'hms' || m === 'alkohol') { if (m === 'alkohol' && !S.org.has_alcohol) l.appendChild(h('div', { class: 'note' }, 'Stedet er ikke registrert med alkohol. Du kan likevel bruke modulen.')); var hb = h('div', { class: 'stack' }); l.appendChild(hb); renderHms(hb); }
  else if (m === 'mat') {
    l.appendChild(moreItem('IK-mat-plan', 'HACCP-planen for stedet', showPlan));
    l.appendChild(moreItem('Tilsynsmappe', 'Plan, kvitteringer og avvik for en periode', showFolder));
    if (isLeder()) l.appendChild(moreItem('Kjøleskap og frysere', 'Gi dem navn og mål hver for seg', unitsDialog));
  } else if (m === 'alkohol' && !S.org.has_alcohol) {
    l.appendChild(h('div', { class: 'note' }, 'Stedet er ikke registrert med alkohol. Rutiner du legger inn her vises likevel i I dag-listen.'));
  }
  $('#modAdd').hidden = !isLeder();
  if (m === 'rut') return;
  var box = clear($('#modTasks'));
  var ts = S.tasks.filter(function (t) { return t.domain === m; }).sort(function (a, b) { return (b.active - a.active) || a.title.localeCompare(b.title, 'nb'); });
  if (!ts.length) box.appendChild(h('div', { class: 'note' }, 'Ingen rutiner ennå.'));
  ts.forEach(function (t) {
    var row = h('div', { class: 'trow' + (t.active ? '' : ' off') }, h('div', { class: 'grow' }, h('div', { style: 'font-weight:600' }, t.title), h('div', { class: 'small muted' }, [ROUT_LABEL[t.routine] || null, recText(t.recurrence)].filter(Boolean).join(' · '))));
    if (isLeder()) row.appendChild(h('button', { class: 'btn soft small', type: 'button', onclick: function () { taskDialog(t); } }, 'Endre'));
    box.appendChild(row);
  });
}
$$('#mods button').forEach(function (b) { b.addEventListener('click', function () { S.mod = b.dataset.mod; go('mod'); }); });
$('#modAdd').addEventListener('click', function () { taskDialog(null, S.mod); });
function moreItem(title, sub, fn) {
  return h('button', { class: 'dev', type: 'button', onclick: fn }, h('div', { class: 't' }, title), sub ? h('div', { class: 'small muted' }, sub) : null);
}
function renderMore() {
  var l = clear($('#moreList'));
  l.appendChild(h('div', { class: 'card' }, h('div', { style: 'font-weight:600' }, S.org.name), h('div', { class: 'small muted' }, (S.org.orgnr ? 'Org.nr. ' + S.org.orgnr + ' · ' : '') + (isLeder() ? 'Du er leder' : 'Du er ansatt'))));
  l.appendChild(moreItem('IK-mat-plan', 'HACCP-planen for stedet', showPlan));
  l.appendChild(moreItem('Tilsynsmappe', 'Plan, kvitteringer og avvik for en periode. Skriv ut eller last ned.', showFolder));
  if (isLeder()) {
    l.appendChild(moreItem('Kjøleskap og frysere', S.units.filter(function (u) { return u.active; }).length + ' registrert. Gi dem navn og mål hver for seg.', unitsDialog));
    l.appendChild(moreItem('Team og invitasjon', 'Se hvem som har tilgang og lag invitasjonskode', teamDialog));
    l.appendChild(moreItem('Endringslogg', 'Hvem som endret hva, og når', showAudit));
  }
  l.appendChild(moreItem('Mitt navn', nameOf(S.user.id), nameDialog));
  if (S.mems.length > 1) l.appendChild(moreItem('Bytt virksomhet', null, orgSwitch));
  l.appendChild(moreItem('Personvern og vilkår', 'Data lagres i EU', function () { location.href = '../personvern.html'; }));
  l.appendChild(moreItem('Logg ut', S.user.email, logout));
  l.appendChild(h('p', { class: 'small muted' }, 'Grenseverdier og rutiner er forslag. Virksomheten er selv ansvarlig for at planen passer driften og gjeldende regelverk.'));
}
function nameDialog() {
  var n = h('input', { type: 'text', id: 'my-name', value: S.names[S.user.id] || '', maxlength: 120, autocomplete: 'name' });
  openDlg([h('h2', null, 'Mitt navn'), h('p', { class: 'muted' }, 'Navnet vises på kvitteringer og avvik.'), h('label', { class: 'f' }, 'Navn', n),
    h('button', { class: 'btn', onclick: async function () {
      var r = await sb.rpc('set_my_name', { p_org: S.org.id, p_name: n.value.trim() });
      if (r.error) { toast(errText(r.error)); return; }
      S.names[S.user.id] = n.value.trim(); closeDlg(); toast('Lagret'); renderMore();
    } }, 'Lagre')]);
}
function orgSwitch() {
  openDlg([h('h2', null, 'Bytt virksomhet')]
    .concat(S.mems.map(function (m) {
      var cur = S.org && m.org_id === S.org.id;
      return h('button', { class: 'btn ' + (cur ? '' : 'alt'), 'aria-current': cur ? 'true' : null, onclick: async function () { closeDlg(); if (!cur) { await selectOrg(m); go('today'); } } }, m.organizations.name);
    }))
  );
}
async function teamDialog() {
  var out = h('div', { role: 'status' }), list = h('div', { class: 'stack' });
  var r = await sb.from('members').select('user_id, role, display_name').eq('org_id', S.org.id);
  (r.data || []).forEach(function (m) {
    var row = h('div', { class: 'trow' }, h('div', { class: 'grow' }, h('div', { style: 'font-weight:600' }, m.display_name || 'Uten navn'), h('div', { class: 'small muted' }, m.role === 'leder' ? 'Leder' : 'Ansatt')));
    if (m.user_id !== S.user.id) {
      row.appendChild(h('button', { class: 'btn soft small', onclick: async function () {
        var e = await sb.from('members').update({ role: m.role === 'leder' ? 'ansatt' : 'leder' }).eq('org_id', S.org.id).eq('user_id', m.user_id);
        if (e.error) toast(errText(e.error)); else { await selectOrg(S.mems.filter(function (x) { return x.org_id === S.org.id; })[0]); teamDialog(); }
      } }, m.role === 'leder' ? 'Gjør til ansatt' : 'Gjør til leder'));
      row.appendChild(h('button', { class: 'btn danger small', onclick: async function () {
        if (!confirm('Fjerne ' + (m.display_name || 'denne personen') + ' fra stedet?')) return;
        var e = await sb.from('members').delete().eq('org_id', S.org.id).eq('user_id', m.user_id);
        if (e.error) toast(errText(e.error)); else { await selectOrg(S.mems.filter(function (x) { return x.org_id === S.org.id; })[0]); teamDialog(); }
      } }, 'Fjern'));
    }
    list.appendChild(row);
  });
  openDlg([h('h2', null, 'Team'), list,
    h('div', { class: 'note' }, 'Lag en kode og gi den til den som skal få tilgang. Koden virker én gang og i sju dager. Personen oppretter bruker og skriver koden under «Bli med på et sted».'),
    out, h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: closeDlg }, 'Lukk'), h('button', { class: 'btn grow', onclick: async function () {
      var c = await sb.rpc('create_invite', { p_org: S.org.id, p_role: 'ansatt' });
      if (c.error) msg(out, 'err', errText(c.error)); else msg(out, 'ok', 'Kode: ' + c.data);
    } }, 'Lag kode for ansatt'))]);
}

/* ---------- dokumenter ---------- */
function docScreen(nodes, csv) {
  var b = clear($('#docBody')); add(b, nodes); $('#docPrint').hidden = false;
  $('#docCsv').hidden = !csv; $('#docCsv').onclick = csv || null;
  go('doc'); $('#s-doc').classList.add('printing'); $('#top').hidden = false; $('#tabs').hidden = true;
}
$('#docBack').addEventListener('click', function () { var b = S.docBack || 'more'; S.docBack = null; go(b); });
$('#subBack').addEventListener('click', function () { go('mod'); });
$('#docPrint').addEventListener('click', function () { window.print(); });
function downloadCsv(name, rows) {
  var text = '﻿' + rows.map(function (r) { return r.map(csvCell).join(';'); }).join('\r\n');
  var a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })), download: name });
  document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function table(head, rows) {
  return h('div', { class: 'scroll' }, h('table', { class: 't' }, h('thead', null, h('tr', null, head.map(function (x) { return h('th', null, x); }))),
    h('tbody', null, rows.map(function (r) { return h('tr', null, r.map(function (c) { return h('td', null, c == null ? '' : String(c)); })); }))));
}
function planNodes(p, meta) {
  var D = window.DATA, out = [];
  out.push(h('div', { class: 'card stack' }, h('h2', null, 'IK-mat-plan'), h('div', null, S.org.name + (S.org.orgnr ? ' · org.nr. ' + S.org.orgnr : '')),
    meta ? h('div', { class: 'small muted' }, meta) : null));
  if (!p || !p.steps) { out.push(h('div', { class: 'note' }, 'Planen er ikke fylt ut ennå.')); return out; }
  var stepName = {}; D.steps.forEach(function (s) { stepName[s[0]] = s[1]; });
  out.push(h('div', { class: 'card stack' }, h('h3', null, 'Prosess'), h('div', null, p.steps.map(function (s) { return stepName[s]; }).join(' → '))));
  var hz = [];
  p.steps.forEach(function (s) { (p.hazards[s] || []).forEach(function (x) {
    var vur = x.cls ? D.risk.label[x.cls] + ' (' + D.risk.often[x.often].toLowerCase() + ', ' + D.risk.bad[x.bad].toLowerCase() + ')' : 'Ikke vurdert';
    hz.push([stepName[s], D.hazardTypes[x.type], x.text, vur]);
  }); });
  out.push(h('div', { class: 'card stack' }, h('h3', null, 'Farevurdering'), table(['Steg', 'Type', 'Fare', 'Vurdering'], hz)));
  out.push(h('div', { class: 'card stack' }, h('h3', null, 'God hygienepraksis'), table(['Rutine', 'Beskrivelse'], (p.ghp || []).map(function (g) { return [g.title, g.text]; }))));
  out.push(h('div', { class: 'card stack' }, h('h3', null, 'Kritiske styringspunkter'),
    table(['Punkt', 'Grense', 'Overvåking', 'Korrigerende tiltak', 'Verifisering'], (p.ccps || []).map(function (c) { return [c.title, (c.kind === 'max' ? 'Høyst ' : 'Minst ') + c.value + ' ' + c.unit, c.monitor, c.action, c.verify]; }))));
  return out;
}
async function showPlan() {
  var r = await sb.from('haccp_plans').select('*').eq('org_id', S.org.id).order('version', { ascending: false }).limit(1);
  if (r.error) { toast(errText(r.error)); return; }
  var pl = r.data[0] || {}, nodes = planNodes(pl.plan, 'Versjon ' + (pl.version || 1) + ' · ' + (pl.status === 'godkjent' ? 'Godkjent ' + fmtTs(pl.approved_at) + ' av ' + nameOf(pl.approved_by) : 'Utkast'));
  if (isLeder() && pl.id && pl.status !== 'godkjent') nodes.push(h('button', { class: 'btn noprint', onclick: async function () {
    var u = await sb.from('haccp_plans').update({ status: 'godkjent', approved_by: S.user.id, approved_at: new Date().toISOString() }).eq('id', pl.id);
    if (u.error) toast(errText(u.error)); else { toast('Planen er godkjent'); showPlan(); }
  } }, 'Godkjenn planen'));
  docScreen(nodes, null);
}
async function showFolder() {
  var to = ymd(new Date()), from = addDays(to, -30);
  var f = h('input', { type: 'date', id: 'f-from', value: from }), t = h('input', { type: 'date', id: 'f-to', value: to });
  openDlg([h('h2', null, 'Tilsynsmappe'), h('p', { class: 'muted' }, 'Velg perioden som skal tas med.'),
    h('div', { class: 'row' }, h('label', { class: 'f grow' }, 'Fra', f), h('label', { class: 'f grow' }, 'Til', t)),
    h('button', { class: 'btn', onclick: function () { closeDlg(); buildFolder(f.value, t.value); } }, 'Lag mappe')]);
}
async function buildFolder(from, to) {
  if (!from || !to || from > to) { toast('Ugyldig periode'); return; }
  var res = await Promise.all([
    sb.from('haccp_plans').select('*').eq('org_id', S.org.id).order('version', { ascending: false }).limit(1),
    sb.from('task_runs').select('*, tasks(title, domain, routine, unit, area_id)').eq('org_id', S.org.id).gte('due_date', from).lte('due_date', to).order('due_date').limit(10000),
    sb.from('deviations').select('*').eq('org_id', S.org.id).gte('created_at', from + 'T00:00:00').lte('created_at', to + 'T23:59:59').order('created_at')
  ]);
  for (var i = 0; i < res.length; i++) if (res[i].error) { toast(errText(res[i].error)); return; }
  var plan = res[0].data[0] || {}, runs = res[1].data, devs = res[2].data;
  var areaName = {}; S.areas.forEach(function (a) { areaName[a.id] = a.name; });
  var runRows = runs.map(function (r) { var t = r.tasks || {}; return [r.due_date, areaName[t.area_id] || 'Hele stedet', DOMAIN_LABEL[t.domain] || '', t.title || '', r.status === 'done' ? 'Utført' : r.status === 'missed' ? 'Ikke registrert' : 'Hoppet over', r.value == null ? '' : r.value + ' ' + (t.unit || ''), r.note || r.skip_reason || '', r.done_by ? nameOf(r.done_by) : '', r.status === 'missed' ? '' : fmtTs(r.done_at)]; });
  var devRows = devs.map(function (d) { return [fmtTs(d.created_at), DOMAIN_LABEL[d.category], d.title, DEV_STATUS[d.status], d.cause || '', d.action || '', nameOf(d.responsible)]; });
  var nodes = [h('div', { class: 'card stack' }, h('h2', null, 'Tilsynsmappe'), h('div', null, S.org.name + (S.org.orgnr ? ' · org.nr. ' + S.org.orgnr : '')), h('div', { class: 'small muted' }, 'Periode ' + from + ' til ' + to + '. Laget ' + fmtTs(new Date())))]
    .concat(planNodes(plan.plan, plan.version ? 'Versjon ' + plan.version + ' · ' + (plan.status === 'godkjent' ? 'Godkjent' : 'Utkast') : null));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, 'Kvitteringer (' + runRows.length + ')'), table(['Dato', 'Avdeling', 'Område', 'Oppgave', 'Status', 'Måling', 'Notat', 'Av', 'Tid'], runRows)));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, 'Avvik (' + devRows.length + ')'), table(['Opprettet', 'Område', 'Avvik', 'Status', 'Årsak', 'Tiltak', 'Ansvarlig'], devRows)));
  docScreen(nodes, function () {
    downloadCsv('ik-mat-' + from + '-' + to + '.csv', [['Kvitteringer'], ['Dato', 'Avdeling', 'Område', 'Oppgave', 'Status', 'Måling', 'Notat', 'Av', 'Tid']].concat(runRows).concat([[], ['Avvik'], ['Opprettet', 'Område', 'Avvik', 'Status', 'Årsak', 'Tiltak', 'Ansvarlig']]).concat(devRows));
  });
}
async function showAudit() {
  var r = await sb.from('audit_log').select('*').eq('org_id', S.org.id).order('at', { ascending: false }).limit(300);
  if (r.error) { toast(errText(r.error)); return; }
  var names = { organizations: 'Virksomhet', members: 'Medlem', areas: 'Avdeling', haccp_plans: 'HACCP-plan', tasks: 'Oppgave', task_runs: 'Kvittering', deviations: 'Avvik' };
  var acts = { INSERT: 'Opprettet', UPDATE: 'Endret', DELETE: 'Slettet' };
  docScreen([h('div', { class: 'card stack' }, h('h2', null, 'Endringslogg'), h('div', { class: 'small muted' }, 'De siste 300 endringene. Loggen kan ikke endres eller slettes av brukere.'),
    table(['Tid', 'Hvem', 'Hva', 'Handling'], r.data.map(function (x) { return [fmtTs(x.at), nameOf(x.user_id), names[x.table_name] || x.table_name, acts[x.action] || x.action]; })))], null);
}

/* ================= VEIVISER ================= */
var W = null;

/* ---------- farevurdering: matrise ---------- */
function rkCls(sel) { return sel ? window.DATA.risk.matrix[sel[0]][sel[1]] : 'NONE'; }
function rkTag(c) { return h('span', { class: 'rk ' + c }, window.DATA.risk.label[c]); }
function riskMatrix(sel, pick) {
  var R = window.DATA.risk, g = h('div', { class: 'rmx', role: 'group', 'aria-label': 'Matrise: hvor ofte det skjer mot hvor ille det blir' });
  g.appendChild(h('div', { class: 'corner' }));
  g.appendChild(h('div', { class: 'xt' }, 'Hvor ille blir det hvis det skjer?  →'));
  g.appendChild(h('div', { class: 'yt' }, h('span', null, 'Hvor ofte skjer det?  →')));
  g.appendChild(h('div', { class: 'sp' }));
  R.bad.forEach(function (c, ci) { g.appendChild(h('div', { class: 'hc' + (sel && sel[1] === ci ? ' on' : '') }, c)); });
  for (var r = 4; r >= 0; r--) {
    g.appendChild(h('div', { class: 'hr' + (sel && sel[0] === r ? ' on' : '') }, R.often[r]));
    for (var c = 0; c < 5; c++) (function (r, c) {
      var cls = R.matrix[r][c], on = !!sel && sel[0] === r && sel[1] === c;
      g.appendChild(h('button', { class: 'cell ' + cls, type: 'button', 'aria-pressed': on ? 'true' : 'false',
        'aria-label': R.often[r] + ', ' + R.bad[c].toLowerCase() + ': ' + R.label[cls], onclick: function () { pick([r, c]); } }, R.label[cls]));
    })(r, c);
  }
  return g;
}
function riskResult(sel) {
  var R = window.DATA.risk;
  if (!sel) return h('div', { class: 'note' }, 'Trykk på et felt i matrisen.');
  var c = rkCls(sel);
  return h('div', { class: 'rres ' + c }, h('b', null, R.name[c]),
    h('p', { style: 'font-weight:600' }, R.oftenLong[sel[0]] + ' (' + R.often[sel[0]].toLowerCase() + '). Hvis det skjer: ' + R.badLong[sel[1]].toLowerCase() + '.'),
    h('p', null, R.text[c]));
}
var WSTEPS = ['Stedet', 'Avdelinger', 'Prosess', 'Farer', 'Hygiene', 'Styringspunkter', 'Kjøl og frys', 'Oppsummering'];
function startWizard() {
  var D = window.DATA;
  W = { step: 0, name: '', orgnr: '', btype: 'restaurant', myname: (S.org && S.user && S.names[S.user.id]) || '', areas: D.defaultAreas.restaurant.slice(), alk: false, steps: D.defaultSteps.restaurant.slice(), hz: {}, ghp: D.ghp.map(function (g, i) { return i; }), ccp: {}, units: [], risk: {}, openRisk: null };
  Object.keys(D.hazards).forEach(function (st) { D.hazards[st].forEach(function (_, i) { var sg = D.risk.suggest[st] && D.risk.suggest[st][i]; if (sg) W.risk[st + i] = sg.slice(); }); });
  D.ccps.forEach(function (c) { W.ccp[c.id] = { value: c.value, monitor: c.monitor, action: c.action, verify: c.verify }; });
  go('wiz'); drawWiz();
}
function hzDefault(step) { if (!W.hz[step]) W.hz[step] = window.DATA.hazards[step].map(function (_, i) { return i; }); return W.hz[step]; }
function toggleIn(arr, v, on) { var i = arr.indexOf(v); if (on && i < 0) arr.push(v); if (!on && i >= 0) arr.splice(i, 1); }
function checkRow(title, sub, on, fn, id) {
  var cb = h('input', { type: 'checkbox', checked: on, id: id, onchange: function () { fn(cb.checked); } });
  return h('label', { class: 'chk' }, cb, h('div', null, h('b', null, title), sub ? h('span', null, sub) : null));
}
function drawWiz() {
  var D = window.DATA, b = clear($('#wizBody'));
  var st = clear($('#wizSteps')); WSTEPS.forEach(function (_, i) { st.appendChild(h('i', { class: i <= W.step ? 'on' : '' })); });
  msg($('#wizMsg'), '', '');
  b.appendChild(h('h1', null, WSTEPS[W.step]));
  $('#wizBack').textContent = W.step === 0 ? 'Avbryt' : 'Tilbake';
  $('#wizNext').textContent = W.step === WSTEPS.length - 1 ? 'Opprett og start' : 'Neste';
  if (W.step === 0) {
    b.appendChild(h('p', { class: 'muted' }, 'Fortell litt om stedet. Veiviseren bruker svarene til å lage plan og kalender.'));
    var n = h('input', { type: 'text', id: 'w-name', value: W.name, maxlength: 200, oninput: function () { W.name = n.value; } });
    var o = h('input', { type: 'text', id: 'w-org', value: W.orgnr, inputmode: 'numeric', placeholder: '9 siffer', oninput: function () { W.orgnr = o.value; } });
    var t = h('select', { id: 'w-type', onchange: function () { W.btype = t.value; W.areas = D.defaultAreas[W.btype].slice(); W.steps = D.defaultSteps[W.btype].slice(); W.hz = {}; } }, D.businessTypes.map(function (x) { return h('option', { value: x[0] }, x[1]); })); t.value = W.btype;
    var m = h('input', { type: 'text', id: 'w-me', value: W.myname, autocomplete: 'name', oninput: function () { W.myname = m.value; } });
    b.appendChild(h('label', { class: 'f' }, 'Navn på virksomheten', n)); b.appendChild(h('label', { class: 'f' }, 'Organisasjonsnummer (valgfritt)', o));
    b.appendChild(h('label', { class: 'f' }, 'Type sted', t)); b.appendChild(h('label', { class: 'f' }, 'Ditt navn', m));
  } else if (W.step === 1) {
    b.appendChild(h('p', { class: 'muted' }, 'Hver avdeling får egne åpne- og stengerutiner.'));
    D.areas.forEach(function (a) { b.appendChild(h('div', { class: 'card' }, checkRow(a.slice(1)[0], null, W.areas.indexOf(a[0]) >= 0, function (on) { toggleIn(W.areas, a[0], on); }, 'a-' + a[0]))); });
    b.appendChild(h('div', { class: 'card' }, checkRow('Vi har skjenkebevilling', 'Legger til rutiner for IK-alkohol.', W.alk, function (on) { W.alk = on; }, 'w-alk')));
  } else if (W.step === 2) {
    b.appendChild(h('p', { class: 'muted' }, 'Hvilke steg går maten gjennom hos dere? Forhåndsvalgt etter type sted.'));
    var c = h('div', { class: 'card' });
    D.steps.forEach(function (s) { c.appendChild(checkRow(s[1], null, W.steps.indexOf(s[0]) >= 0, function (on) { toggleIn(W.steps, s[0], on); }, 's-' + s[0])); });
    b.appendChild(c);
  } else if (W.step === 3) {
    b.appendChild(h('p', { class: 'muted' }, 'Hva kan gå galt i hvert steg? Fjern det som ikke passer. For hver fare trykker du i matrisen: raden for hvor ofte den skjer, kolonnen for hvor ille den blir. Feltet vi har valgt på forhånd er et forslag. Endre det hvis det ikke stemmer for dere.'));
    D.steps.filter(function (s) { return W.steps.indexOf(s[0]) >= 0; }).forEach(function (s) {
      var sel = hzDefault(s[0]), c2 = h('div', { class: 'card' }, h('h3', null, s[1]));
      D.hazards[s[0]].forEach(function (x, i) {
        var key = s[0] + i, wrap = h('div', { class: 'hzr' });
        wrap.appendChild(checkRow(x[0], D.hazardTypes[x[1]], sel.indexOf(i) >= 0, function (on) { toggleIn(sel, i, on); drawWiz(); }, 'h-' + s[0] + i));
        if (sel.indexOf(i) >= 0) {
          var cur = W.risk[key] || null;
          wrap.appendChild(h('div', { class: 'rline' }, rkTag(rkCls(cur))));
          wrap.appendChild(riskMatrix(cur, function (p) { W.risk[key] = p; drawWiz(); }));
          wrap.appendChild(riskResult(cur));
        }
        c2.appendChild(wrap);
      });
      b.appendChild(c2);
    });
  } else if (W.step === 4) {
    b.appendChild(h('p', { class: 'muted' }, 'Grunnrutiner som alle trenger. De blir en del av planen.'));
    var c3 = h('div', { class: 'card' });
    D.ghp.forEach(function (g, i) { if (g[2] === 'alk' && !W.alk) return; c3.appendChild(checkRow(g[0], g[1], W.ghp.indexOf(i) >= 0, function (on) { toggleIn(W.ghp, i, on); }, 'g-' + i)); });
    b.appendChild(c3);
  } else if (W.step === 5) {
    b.appendChild(h('div', { class: 'note' }, 'Dette er forslag. Du er ansvarlig for at grensene passer driften. Kontroller mot Mattilsynets veiledning.'));
    var any = false;
    D.ccps.forEach(function (c) {
      if (W.steps.indexOf(c.step) < 0) return; any = true;
      var s = W.ccp[c.id];
      var v = h('input', { type: 'text', inputmode: 'decimal', id: 'c-v-' + c.id, value: s.value, oninput: function () { var x = num(v.value); if (x != null) s.value = x; } });
      var mo = h('textarea', { id: 'c-m-' + c.id, oninput: function () { s.monitor = mo.value; } }, s.monitor);
      var ac = h('textarea', { id: 'c-a-' + c.id, oninput: function () { s.action = ac.value; } }, s.action);
      var ve = h('textarea', { id: 'c-e-' + c.id, oninput: function () { s.verify = ve.value; } }, s.verify);
      b.appendChild(h('div', { class: 'card stack' }, h('h3', null, c.title), h('label', { class: 'f' }, (c.kind === 'max' ? 'Høyst ' : 'Minst ') + '(' + c.unit + ')', v),
        h('label', { class: 'f' }, 'Overvåking', mo), h('label', { class: 'f' }, 'Hvis grensen brytes', ac), h('label', { class: 'f' }, 'Verifisering', ve)));
    });
    if (!any) b.appendChild(h('p', { class: 'muted' }, 'Ingen styringspunkter for stegene du har valgt.'));
  } else if (W.step === 6) {
    b.appendChild(h('p', { class: 'muted' }, 'Gi hvert kjøleskap og hver fryser et navn, så får de egne målinger hver dag. Du kan også legge til flere senere under Mer.'));
    var cu = h('div', { class: 'stack' });
    function drawUnits() {
      clear(cu);
      W.units.forEach(function (u, i) {
        var nm = h('input', { type: 'text', maxlength: 100, value: u.name, placeholder: u.kind === 'kjol' ? 'For eksempel Kjøl 1' : 'For eksempel Fryser bak', 'aria-label': 'Navn', oninput: function () { u.name = nm.value; } });
        var ar = h('select', { 'aria-label': 'Avdeling', onchange: function () { u.area = ar.value; } }, W.areas.map(function (x) { return h('option', { value: x }, D.areas.filter(function (y) { return y[0] === x; })[0][1]); }));
        ar.value = u.area || W.areas[0];
        cu.appendChild(h('div', { class: 'card stack' }, h('div', { class: 'small muted' }, u.kind === 'kjol' ? 'Kjøleskap eller kjølerom' : 'Fryser eller fryserom'),
          nm, h('div', { class: 'row' }, h('label', { class: 'f grow' }, 'Avdeling', ar), h('button', { class: 'btn soft small', type: 'button', onclick: function () { W.units.splice(i, 1); drawUnits(); } }, 'Fjern'))));
      });
    }
    drawUnits();
    b.appendChild(cu);
    b.appendChild(h('div', { class: 'row' },
      h('button', { class: 'btn alt grow', type: 'button', onclick: function () { W.units.push({ kind: 'kjol', name: '', area: W.areas[0] }); drawUnits(); } }, 'Legg til kjøleskap'),
      h('button', { class: 'btn alt grow', type: 'button', onclick: function () { W.units.push({ kind: 'frys', name: '', area: W.areas[0] }); drawUnits(); } }, 'Legg til fryser')));
    b.appendChild(h('div', { class: 'note' }, 'Hopp over hvis du vil bruke de generelle målingene for kjøl og frys.'));
  } else {
    var a2 = W.areas.map(function (x) { return D.areas.filter(function (y) { return y[0] === x; })[0][1]; });
    b.appendChild(h('div', { class: 'card stack' }, h('div', null, h('b', null, W.name || 'Uten navn')), h('div', { class: 'muted' }, D.businessTypes.filter(function (x) { return x[0] === W.btype; })[0][1] + ' · ' + (a2.join(', ') || 'ingen avdelinger') + (W.alk ? ' · skjenkebevilling' : '') + (W.units.filter(function (u) { return u.name.trim(); }).length ? ' · ' + W.units.filter(function (u) { return u.name.trim(); }).length + ' kjøle- og fryseenheter' : '')),
      h('div', null, W.steps.length + ' steg, ' + W.ghp.filter(function (i) { return D.ghp[i][2] !== 'alk' || W.alk; }).length + ' hygienerutiner og ' + D.ccps.filter(function (c) { return W.steps.indexOf(c.step) >= 0; }).length + ' styringspunkter.')));
    b.appendChild(h('div', { class: 'note' }, 'Når du oppretter, lages planen som utkast, og kalenderen fylles med åpne- og stengerutiner for hver avdeling. Du kan endre alt etterpå.'));
  }
}
$('#wizBack').addEventListener('click', function () { if (W.step === 0) { go(S.org ? 'more' : 'start'); } else { W.step--; drawWiz(); window.scrollTo(0, 0); } });
$('#wizNext').addEventListener('click', async function () {
  var out = $('#wizMsg');
  if (W.step === 0) {
    if (!W.name.trim()) { msg(out, 'err', 'Skriv inn navnet på stedet.'); return; }
    if (!W.myname.trim()) { msg(out, 'err', 'Skriv inn ditt navn.'); return; }
    if (W.orgnr.trim() && !/^[0-9 ]{9,11}$/.test(W.orgnr.trim())) { msg(out, 'err', 'Organisasjonsnummer har 9 siffer.'); return; }
  }
  if (W.step === 1 && !W.areas.length) { msg(out, 'err', 'Velg minst én avdeling.'); return; }
  if (W.step === 2 && !W.steps.length) { msg(out, 'err', 'Velg minst ett steg.'); return; }
  if (W.step < WSTEPS.length - 1) { W.step++; drawWiz(); window.scrollTo(0, 0); return; }
  var btn = $('#wizNext'); btn.disabled = true;
  try { await finishWizard(); } catch (e) { msg(out, 'err', errText(e)); }
  btn.disabled = false;
});
async function finishWizard() {
  var D = window.DATA;
  var cr = await sb.rpc('create_organization', { p_name: W.name.trim(), p_orgnr: W.orgnr.trim() || null, p_business_type: W.btype, p_has_alcohol: W.alk, p_areas: W.areas, p_display_name: W.myname.trim() });
  if (cr.error) throw cr.error;
  var orgId = cr.data;
  var plan = { businessType: W.btype, areas: W.areas, alcohol: W.alk, steps: W.steps, hazards: {}, ghp: [], ccps: [], created: new Date().toISOString() };
  W.steps.forEach(function (s) {
    plan.hazards[s] = hzDefault(s).map(function (i) {
      var rk = W.risk[s + i];
      return { text: D.hazards[s][i][0], type: D.hazards[s][i][1], often: rk ? rk[0] : null, bad: rk ? rk[1] : null, cls: rk ? D.risk.matrix[rk[0]][rk[1]] : null };
    });
  });
  plan.ghp = W.ghp.filter(function (i) { return D.ghp[i][2] !== 'alk' || W.alk; }).sort(function (a, b) { return a - b; }).map(function (i) { return { title: D.ghp[i][0], text: D.ghp[i][1] }; });
  D.ccps.forEach(function (c) {
    if (W.steps.indexOf(c.step) < 0) return;
    var s = W.ccp[c.id]; plan.ccps.push({ id: c.id, title: c.title, kind: c.kind, value: s.value, unit: c.unit, monitor: s.monitor, action: s.action, verify: s.verify });
  });
  var up = await sb.from('haccp_plans').update({ plan: plan }).eq('org_id', orgId).eq('version', 1);
  if (up.error) throw up.error;
  // sett grenser på temperaturoppgavene og lag måleoppgaver for varme-punktene
  var tk = await sb.from('tasks').select('id, title, unit').eq('org_id', orgId);
  var ar = await sb.from('areas').select('id, kind').eq('org_id', orgId);
  if (!tk.error) {
    for (var i = 0; i < plan.ccps.length; i++) {
      var c = plan.ccps[i], re = D.limitTaskMatch[c.id];
      if (!re) continue;
      var rows = tk.data.filter(function (t) { return t.unit === '°C' && re.test(t.title); });
      for (var j = 0; j < rows.length; j++) await sb.from('tasks').update({ max_value: c.value }).eq('id', rows[j].id);
    }
  }
  var kj = (ar.data || []).filter(function (a) { return a.kind === 'kjokken'; })[0];
  var wl = W.units.filter(function (u) { return u.name.trim(); });
  if (wl.length) {
    var amap = {}; (ar.data || []).forEach(function (a) { amap[a.kind] = a.id; });
    var lim = { kjol: W.ccp.kjol ? W.ccp.kjol.value : 4, frys: W.ccp.frys ? W.ccp.frys.value : -18 };
    await createUnits(orgId, wl.map(function (u) { return { kind: u.kind, name: u.name, area_id: amap[u.area] || null }; }), lim);
  }
  var extra = [['varme', 'Kjernetemperatur ved varmebehandling', 'min'], ['varmhold', 'Temperatur ved varmholding', 'min'], ['nedkjol', 'Temperatur etter nedkjøling', 'max']];
  for (var k = 0; k < extra.length; k++) {
    var cc = plan.ccps.filter(function (x) { return x.id === extra[k][0]; })[0];
    if (!cc) continue;
    var row = { org_id: orgId, area_id: kj ? kj.id : null, domain: 'mat', routine: 'daglig', title: extra[k][1], hint: 'Mål når retten produseres. Fra HACCP-planen.', kind: 'measure', unit: cc.unit, recurrence: { freq: 'daily' }, source: 'haccp', sort: 5000 + k };
    row[cc.kind === 'min' ? 'min_value' : 'max_value'] = cc.value;
    await sb.from('tasks').insert(row);
  }
  // kontroller fra farevurderingen: ett oppdrag per prosesstrinn, hyppighet etter strengeste type
  var covered = { kjol: 1, frys: 1, varme: 1, varmhold: 1, nedkjol: 1 };
  var rank = { PRP: 0, CP: 1, OPRP: 2, CCP: 3 }, freqFor = { CP: { freq: 'monthly', day: 1 }, OPRP: { freq: 'weekly', weekdays: [1] }, CCP: { freq: 'daily' } };
  var stepNames = {}; D.steps.forEach(function (x) { stepNames[x[0]] = x[1]; });
  var rows2 = [];
  W.steps.forEach(function (st, si) {
    if (covered[st]) return;
    var hs = (plan.hazards[st] || []).filter(function (x) { return x.cls && rank[x.cls] >= 1; });
    if (!hs.length) return;
    var top = hs.reduce(function (m, x) { return rank[x.cls] > rank[m] ? x.cls : m; }, 'CP');
    rows2.push({ org_id: orgId, area_id: kj ? kj.id : null, domain: 'mat', routine: top === 'CCP' ? 'daglig' : top === 'OPRP' ? 'ukentlig' : 'manedlig',
      title: 'Kontroller: ' + stepNames[st], hint: 'Fra farevurderingen. Faren(e): ' + hs.map(function (x) { return x.text + ' (' + D.risk.label[x.cls] + ')'; }).join('; ') + '.',
      kind: 'check', recurrence: freqFor[top], source: 'haccp', sort: 6000 + si });
  });
  if (rows2.length) await sb.from('tasks').insert(rows2);
  W = null; lsSet('ikmat-org', orgId); toast('Stedet er opprettet');
  await afterLogin();
}

/* ---------- PWA ---------- */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* valgfritt */ }); });
}
/* ---------- RUTINER: BOLKER ---------- */
async function reloadBlocks() {
  var a = await sb.from('routine_blocks').select('*').eq('org_id', S.org.id).order('start_time');
  var b = await sb.from('tasks').select('*').eq('org_id', S.org.id).order('sort').order('title');
  if (!a.error) S.blocks = a.data; if (!b.error) S.tasks = b.data;
}
function renderRut(l) {
  renderQuickSection(l);
  var leder = isLeder(), blocks = S.blocks || [];
  if (leder) l.appendChild(h('button', { class: 'btn', onclick: function () { blockDialog(null); } }, 'Ny rutinesamling'));
  if (leder && !blocks.length) {
    l.appendChild(h('div', { class: 'note' }, 'Ingen rutinesamlinger ennå. En rutinesamling er en gruppe rutiner for et sted, en vakt eller en tid på døgnet, for eksempel «Kafé åpning» 07:00–10:00 eller «Bar kveld» 17:00–24:00.'));
    l.appendChild(h('button', { class: 'btn alt', onclick: autoBlocks }, 'Lag rutinesamlinger fra åpning og stenging'));
    l.appendChild(h('p', { class: 'small muted' }, 'Lager én rutinesamling for åpning og én for stenging per avdeling, og flytter rutinene dit. Klokkeslettene er forslag, så endre dem.'));
  }
  blocks.slice().sort(function (a, b) { return (a.start_time || '') < (b.start_time || '') ? -1 : 1; }).forEach(function (b) {
    var n = S.tasks.filter(function (t) { return t.block_id === b.id && t.active; }).length, ar = S.areas.filter(function (a) { return a.id === b.area_id; })[0];
    l.appendChild(h('button', { class: 'dev', type: 'button', onclick: function () { openSub(b.name, function (box) { blockScreen(box, b.id); }); } },
      h('div', { class: 't' }, b.name + (b.active ? '' : ' (av)')),
      h('div', { class: 'small muted' }, [blockSpan(b), blockDays(b), ar ? ar.name : 'Hele stedet', n + ' rutiner'].join(' · '))));
  });
  var free = S.tasks.filter(function (t) { return t.active && !t.block_id; });
  if (blocks.length && free.length) {
    var det = h('details', { class: 'card' }, h('summary', { style: 'font-weight:600;cursor:pointer' }, 'Rutiner uten samling (' + free.length + ')'));
    det.appendChild(h('p', { class: 'small muted' }, 'Disse vises i I dag-listen som før. Legg dem i en rutinesamling for å styre når de vises.'));
    free.forEach(function (t) { det.appendChild(h('div', { class: 'trow' }, h('div', { class: 'grow' }, t.title, h('div', { class: 'small muted' }, recText(t.recurrence))), leder ? h('button', { class: 'btn soft small', type: 'button', onclick: function () { taskDialog(t); } }, 'Endre') : null)); });
    l.appendChild(det);
  }
}
function blockScreen(box, id) {
  var b = (S.blocks || []).filter(function (x) { return x.id === id; })[0], leder = isLeder();
  if (!b) { box.appendChild(h('div', { class: 'note' }, 'Rutinesamlingen finnes ikke lenger.')); return; }
  var ar = S.areas.filter(function (a) { return a.id === b.area_id; })[0];
  box.appendChild(h('div', { class: 'card stack' }, h('div', null, h('b', null, blockSpan(b)), ' · ' + blockDays(b)), h('div', { class: 'small muted' }, (ar ? ar.name : 'Hele stedet') + (b.active ? '' : ' · Slått av')),
    leder ? h('div', { class: 'row' }, h('button', { class: 'btn soft small', onclick: function () { blockDialog(b); } }, 'Endre rutinesamling'), h('button', { class: 'btn soft small', onclick: function () { taskDialog(null, 'mat', b.id); } }, 'Ny rutine i samlingen'), h('button', { class: 'btn soft small', onclick: function () { addToBlock(b); } }, 'Legg til eksisterende')) : null));
  var ts = S.tasks.filter(function (t) { return t.block_id === id; }).sort(function (a, c) { return (c.active - a.active) || a.title.localeCompare(c.title, 'nb'); });
  if (!ts.length) box.appendChild(h('div', { class: 'note' }, 'Ingen rutiner i samlingen ennå.'));
  ts.forEach(function (t) {
    box.appendChild(h('div', { class: 'trow' + (t.active ? '' : ' off') }, h('div', { class: 'grow' }, h('div', { style: 'font-weight:600' }, t.title), h('div', { class: 'small muted' }, [DOMAIN_LABEL[t.domain], recText(t.recurrence)].join(' · '))),
      leder ? h('button', { class: 'btn soft small', type: 'button', onclick: function () { taskDialog(t); } }, 'Endre') : null,
      leder ? h('button', { class: 'btn soft small', type: 'button', onclick: async function () { var r = await sb.from('tasks').update({ block_id: null }).eq('id', t.id); if (r.error) toast(errText(r.error)); else { await reloadBlocks(); refreshSub(); } } }, 'Ta ut') : null));
  });
}
function addToBlock(b) {
  var free = S.tasks.filter(function (t) { return t.active && t.block_id !== b.id; }), picked = {};
  var list = h('div', { class: 'stack', style: 'max-height:50vh;overflow:auto' }, free.map(function (t) {
    var cb = h('input', { type: 'checkbox', onchange: function () { picked[t.id] = cb.checked; } });
    var other = blockOf(t);
    return h('label', { class: 'chk' }, cb, h('div', null, h('b', null, t.title), h('span', null, other ? 'Ligger i «' + other.name + '»' : recText(t.recurrence))));
  }));
  openDlg([h('h2', null, 'Legg til i «' + b.name + '»'), list, h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: closeDlg }, 'Avbryt'), h('button', { class: 'btn grow', onclick: async function () {
    var ids = Object.keys(picked).filter(function (k) { return picked[k]; });
    if (ids.length) { var r = await sb.from('tasks').update({ block_id: b.id }).in('id', ids); if (r.error) { toast(errText(r.error)); return; } }
    closeDlg(); await reloadBlocks(); refreshSub();
  } }, 'Legg til'))]);
}
var BLOCK_PRESETS = [['Åpning', '07:00', '11:00'], ['Lunsj', '11:00', '15:00'], ['Kveld', '16:00', '23:00'], ['Stenging', '21:00', '23:59']];
function blockDialog(b) {
  var isNew = !b; b = b || { name: '', area_id: null, start_time: '', end_time: '', weekdays: null, active: true };
  var name = h('input', { type: 'text', value: b.name, maxlength: 100, placeholder: 'F.eks. Kafé åpning, Bar kveld, Helgevakt' });
  var area = h('select', null, h('option', { value: '' }, 'Hele stedet'), S.areas.map(function (a) { return h('option', { value: a.id }, a.name); })); area.value = b.area_id || '';
  var st = h('input', { type: 'time', value: hm(b.start_time) }), en = h('input', { type: 'time', value: hm(b.end_time) });
  var wd = (b.weekdays && b.weekdays.length ? b.weekdays : [1, 2, 3, 4, 5, 6, 7]).map(Number);
  var wdBox = h('div', { class: 'chips' }, WD.map(function (w, i) { var c = h('button', { class: 'chip', type: 'button', 'aria-pressed': wd.indexOf(i + 1) >= 0 ? 'true' : 'false', onclick: function () { c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); } }, w); c.dataset.n = i + 1; return c; }));
  var act = h('input', { type: 'checkbox', checked: b.active }), out = h('div', { role: 'status' });
  var presets = isNew ? h('div', { class: 'chips' }, BLOCK_PRESETS.map(function (p) { return h('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', onclick: function () { name.value = p[0]; st.value = p[1]; en.value = p[2]; } }, p[0]); })) : null;
  openDlg([h('h2', null, isNew ? 'Ny rutinesamling' : 'Endre rutinesamling'), presets, h('label', { class: 'f' }, 'Navn', name), h('label', { class: 'f' }, 'Sted eller avdeling', area),
    h('div', { class: 'row' }, h('label', { class: 'f grow' }, 'Fra klokka', st), h('label', { class: 'f grow' }, 'Til klokka', en)),
    h('p', { class: 'small muted' }, 'Er sluttida før starttida, går rutinesamlingen over midnatt. Den hører da til dagen den starter, og rutinene kan kvitteres også etter midnatt.'),
    h('div', { class: 'f' }, 'Dager samlingen gjelder', wdBox),
    isNew ? null : h('label', { class: 'chk' }, act, h('div', null, h('b', null, 'Aktiv'), h('span', null, 'Slå av for å skjule rutinesamlingen og rutinene i den uten å slette dem.'))), out,
    h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: closeDlg }, 'Avbryt'),
      isNew ? null : h('button', { class: 'btn alt', onclick: async function () { var r = await sb.from('routine_blocks').delete().eq('id', b.id); if (r.error) { msg(out, 'err', errText(r.error)); return; } closeDlg(); await reloadBlocks(); go('mod'); toast('Rutinesamlingen er slettet. Rutinene ligger igjen uten samling.'); } }, 'Slett'),
      h('button', { class: 'btn grow', onclick: async function (ev) {
        if (!name.value.trim()) { msg(out, 'err', 'Gi rutinesamlingen et navn.'); return; }
        var days = $$('button', wdBox).filter(function (x) { return x.getAttribute('aria-pressed') === 'true'; }).map(function (x) { return +x.dataset.n; });
        if (!days.length) { msg(out, 'err', 'Velg minst én dag.'); return; }
        var row = { name: name.value.trim(), area_id: area.value || null, start_time: st.value || null, end_time: en.value || null, weekdays: days.length === 7 ? null : days, active: isNew ? true : act.checked };
        ev.target.disabled = true;
        var r = isNew ? await sb.from('routine_blocks').insert(Object.assign(row, { org_id: S.org.id })) : await sb.from('routine_blocks').update(row).eq('id', b.id);
        if (r.error) { msg(out, 'err', errText(r.error)); ev.target.disabled = false; return; }
        closeDlg(); toast('Lagret'); await reloadBlocks();
        if (S.screen === 'sub') { $('#subTitle').textContent = row.name; refreshSub(); } else renderMod();
      } }, 'Lagre'))]);
}
async function autoBlocks() {
  if (!isLeder()) return;
  var specs = [], seen = {};
  S.tasks.filter(function (t) { return t.active && (t.routine === 'apning' || t.routine === 'stenging'); }).forEach(function (t) {
    var key = t.routine + '|' + (t.area_id || ''); if (seen[key]) return; seen[key] = 1;
    var ar = S.areas.filter(function (a) { return a.id === t.area_id; })[0], op = t.routine === 'apning';
    specs.push({ key: key, routine: t.routine, area_id: t.area_id, name: (op ? 'Åpning' : 'Stenging') + (ar ? ' · ' + ar.name : ''), start_time: op ? '07:00' : '21:00', end_time: op ? '11:00' : '23:59' });
  });
  if (!specs.length) { toast('Fant ingen åpnings- eller stengerutiner å lage rutinesamlinger av.'); return; }
  var r = await sb.from('routine_blocks').insert(specs.map(function (x) { return { org_id: S.org.id, name: x.name, area_id: x.area_id, start_time: x.start_time, end_time: x.end_time, active: true }; })).select();
  if (r.error) { toast(errText(r.error)); return; }
  for (var i = 0; i < r.data.length; i++) {
    var sp = specs[i], q = sb.from('tasks').update({ block_id: r.data[i].id }).eq('org_id', S.org.id).eq('routine', sp.routine).eq('active', true);
    q = sp.area_id ? q.eq('area_id', sp.area_id) : q.is('area_id', null);
    var u = await q; if (u.error) { toast(errText(u.error)); return; }
  }
  await reloadBlocks(); renderMod(); toast(specs.length + ' rutinesamlinger er laget. Endre klokkeslettene så de passer dere.');
}

/* ---------- HMS-MODUL ---------- */
var HMSL = null;
function hms() { return window.DATA[S.mod === 'alkohol' ? 'alk' : 'hms']; }
function isAlk() { return S.mod === 'alkohol'; }
function HT() { return hms().t; }
function hd(s) { if (!s) return ''; var d = parseYmd(String(s).slice(0, 10)); return d.getDate() + '. ' + MON[d.getMonth()].toLowerCase() + ' ' + d.getFullYear(); }
function hCls(o, b) { if (o == null || b == null) return 'NONE'; var sc = (o + 1) * (b + 1); return sc <= 4 ? 'PRP' : sc <= 9 ? 'CP' : sc <= 15 ? 'OPRP' : 'CCP'; }
function hTag(c) { return h('span', { class: 'rk ' + c }, hms().label[c]); }
var HRANK = { CCP: 4, OPRP: 3, CP: 2, PRP: 1, NONE: 0 };
function hMatrix(sel, pick) {
  var R = window.DATA.risk, H = hms(), g = h('div', { class: 'rmx', role: 'group', 'aria-label': 'Matrise: hvor ofte det skjer mot hvor ille det kan gå' });
  g.appendChild(h('div', { class: 'corner' }));
  g.appendChild(h('div', { class: 'xt' }, 'Hvor ille kan det gå?  →'));
  g.appendChild(h('div', { class: 'yt' }, h('span', null, 'Hvor ofte skjer det?  →')));
  g.appendChild(h('div', { class: 'sp' }));
  H.bad.forEach(function (c, ci) { g.appendChild(h('div', { class: 'hc' + (sel && sel[1] === ci ? ' on' : '') }, c)); });
  for (var r = 4; r >= 0; r--) {
    g.appendChild(h('div', { class: 'hr' + (sel && sel[0] === r ? ' on' : '') }, R.often[r]));
    for (var c = 0; c < 5; c++) (function (r, c) {
      var cls = hCls(r, c), on = !!sel && sel[0] === r && sel[1] === c;
      g.appendChild(h('button', { class: 'cell ' + cls, type: 'button', 'aria-pressed': on ? 'true' : 'false',
        'aria-label': R.often[r] + ', ' + H.bad[c].toLowerCase() + ': ' + H.label[cls], onclick: function () { pick([r, c]); } }, H.label[cls]));
    })(r, c);
  }
  return g;
}
function hResult(sel) {
  var R = window.DATA.risk, H = hms();
  if (!sel) return h('div', { class: 'note' }, 'Trykk på et felt i matrisen.');
  var c = hCls(sel[0], sel[1]);
  return h('div', { class: 'rres ' + c }, h('b', null, H.label[c] + ' risiko'),
    h('p', { style: 'font-weight:600' }, R.oftenLong[sel[0]] + '. Hvis det skjer: ' + H.badLong[sel[1]].toLowerCase() + '.'), h('p', null, H.text[c]));
}
async function loadHms() {
  var o = S.org.id;
  function q(t, c, asc) { return sb.from(t).select('*').eq('org_id', o).eq('module', S.mod).order(c, { ascending: !!asc }); }
  var r = await Promise.all([sb.from('hms_settings').select('*').eq('org_id', o).eq('module', S.mod).maybeSingle(), q('hms_risks', 'created_at', true), q('hms_incidents', 'occurred_at'), q('hms_training', 'done_on'), q('hms_rounds', 'done_on'), q('hms_reviews', 'done_on')]);
  r.forEach(function (x) { if (x.error) throw x.error; });
  S.hms = { settings: r[0].data || null, risks: r[1].data || [], incidents: r[2].data || [], training: r[3].data || [], rounds: r[4].data || [], reviews: r[5].data || [] };
  return S.hms;
}
function hmsStatus() {
  if (isAlk()) return alkStatus();
  var H = S.hms, st = H.settings || {}, goals = st.goals || [], roles = (st.roles || []).filter(function (x) { return x.name; });
  var rs = H.risks.filter(function (x) { return x.status !== 'fjernet' && x.source !== 'vernerunde'; });
  var unassessed = rs.filter(function (x) { return x.often == null; }).length;
  var noMeasure = rs.filter(function (x) { return HRANK[hCls(x.often, x.bad)] >= 3 && !x.measure; }).length;
  var rv = H.reviews[0], yearAgo = addDays(ymd(new Date()), -365);
  return [
    ['1. Oversikt over lover og forskrifter', true, 'Følger med i HMS-mappen.'],
    ['2. Kompetanse og opplæring', H.training.length > 0, 'Registrer opplæring under «Opplæring».'],
    ['3. Medvirkning fra ansatte', !!(st.participation && st.participation.trim()), 'Fyll ut under «Mål og ansvar».'],
    ['4. Mål for HMS', goals.length > 0, 'Legg inn mål under «Mål og ansvar».'],
    ['5. Organisasjon og ansvar', roles.length > 0, 'Sett navn på roller under «Mål og ansvar».'],
    ['6. Farer, risiko og tiltak', rs.length > 0 && !unassessed && !noMeasure, rs.length ? (unassessed ? unassessed + ' fare(r) mangler vurdering. ' : '') + (noMeasure ? noMeasure + ' høy risiko mangler tiltak.' : '') : 'Lag risikovurdering under «Farer og tiltak».'],
    ['7. Rutiner for avvik og hendelser', true, 'Standardrutine følger med i HMS-mappen.'],
    ['8. Årlig gjennomgang', !!(rv && rv.done_on >= yearAgo), 'Gjør årlig gjennomgang. Siste: ' + (rv ? hd(rv.done_on) : 'aldri') + '.']
  ];
}
function alkStatus() {
  var H = S.hms, st = H.settings || {}, ex = st.extra || {}, today = ymd(new Date());
  var rs = H.risks.filter(function (x) { return x.status !== 'fjernet' && x.source !== 'vernerunde'; });
  var unassessed = rs.filter(function (x) { return x.often == null; }).length;
  var noMeasure = rs.filter(function (x) { return HRANK[hCls(x.often, x.bad)] >= 3 && !x.measure; }).length;
  var rt = ex.routines || {}, nr = Object.keys(rt).filter(function (k) { return (rt[k] || '').trim(); }).length;
  var rv = H.reviews[0], yearAgo = addDays(today, -365);
  var okB = !!(ex.styrer && ex.stedfortreder && ex.valid_until && ex.valid_until >= today);
  return [
    ['1. Bevilling og ansvar', okB, ex.valid_until && ex.valid_until < today ? 'Bevillingen er utløpt. Oppdater datoen.' : 'Skriv inn styrer, stedfortreder og bevillingens gyldighet under «Bevilling og ansvar».'],
    ['2. Kunnskapsprøve og opplæring', H.training.length > 0, 'Registrer kunnskapsprøve for styrer og stedfortreder, og opplæring av de som skjenker.'],
    ['3. Kartlegging av utfordringer', rs.length > 0 && !unassessed && !noMeasure, rs.length ? (unassessed ? unassessed + ' risiko(er) mangler vurdering. ' : '') + (noMeasure ? noMeasure + ' høy risiko mangler tiltak.' : '') : 'Lag kartleggingen under «Risiko og tiltak».'],
    ['4. Forebyggende rutiner', nr >= 5, 'Fyll ut rutinene under «Bevilling og ansvar».'],
    ['5. Oppfølging og avvik', true, 'Standardrutine følger med i mappen.'],
    ['6. Gjennomgang', !!(rv && rv.done_on >= yearAgo), 'Gjør gjennomgang. Siste: ' + (rv ? hd(rv.done_on) : 'aldri') + '.']
  ];
}
function hmsMember(id) { return id ? nameOf(id) : ''; }
function memberSelect(val) {
  var s = h('select', null, h('option', { value: '' }, 'Ikke satt'), (S.members || []).map(function (m) { return h('option', { value: m.user_id }, m.display_name || 'Uten navn'); }));
  s.value = val || ''; return s;
}
function areaSelect(val) {
  var names = ['Hele stedet'].concat(S.areas.map(function (a) { return a.name; }));
  if (val && names.indexOf(val) < 0) names.push(val);
  var s = h('select', null, names.map(function (n) { return h('option', { value: n }, n); })); s.value = val || 'Hele stedet'; return s;
}
function openSub(title, fn) {
  S.subFn = fn; $('#subTitle').textContent = title;
  go('sub'); refreshSub();
}
async function refreshSub() {
  var b = clear($('#subBody'));
  try { if (S.mod !== 'rut') await loadHms(); S.subFn(b); } catch (e) { b.appendChild(h('div', { class: 'err' }, errText(e))); }
}
function renderHms(box) {
  var l = clear(box);
  l.appendChild(h('div', { class: 'note' }, 'Laster ...'));
  loadHms().then(function () {
    clear(l);
    var H = S.hms, stt = hmsStatus(), okN = stt.filter(function (x) { return x[1]; }).length;
    var openRisks = H.risks.filter(function (x) { return x.status === 'apen' || x.status === 'pagar'; }).length;
    var openInc = H.incidents.filter(function (x) { return x.status !== 'lukket'; }).length;
    if (isLeder()) {
      var card = h('div', { class: 'card stack' }, h('div', { class: 'row' }, h('h2', { class: 'grow' }, 'Klar for tilsyn?'), h('span', { class: 'pill ' + (okN === HT().total ? 'g' : 'a') }, okN + ' av ' + HT().total)),
        h('p', { class: 'small muted' }, isAlk() ? 'Alkoholforskriften kapittel 8 krever at du systematisk kontrollerer at kravene overholdes, og at du har dokumenterbare rutiner. Kommunen kan føre tilsyn.' : 'Internkontrollforskriften § 5 krever skriftlig dokumentasjon av mål, ansvar, risikovurdering, avviksrutiner og årlig gjennomgang.'));
      stt.forEach(function (x) { card.appendChild(h('div', { class: 'row', style: 'align-items:flex-start;gap:8px' }, h('span', { 'aria-hidden': 'true', style: 'font-weight:800;color:var(' + (x[1] ? '--green' : '--red') + ')' }, x[1] ? '✓' : '✗'), h('div', { class: 'grow' }, h('div', { style: 'font-weight:600' }, x[0]), x[1] && x[2].indexOf('Siste') !== 0 ? null : h('div', { class: 'small muted' }, x[2])))); });
      l.appendChild(card);
      if (!H.risks.length && !H.settings) l.appendChild(h('button', { class: 'btn', onclick: hmsSeed }, 'Lag grunnlaget automatisk'));
      if (!H.risks.length && !H.settings) l.appendChild(h('p', { class: 'small muted' }, HT().seedInfo));
    }
    l.appendChild(moreItem(HT().risks, openRisks + ' åpne tiltak. Risikovurdering med matrise.', function () { openSub(HT().risks, hmsRisks); }));
    l.appendChild(moreItem('Hendelser og avvik', openInc + ' åpne. ' + (isAlk() ? 'Logg nektet servering, påvirkede gjester og andre hendelser.' : 'Meld ulykke, nestenulykke eller farlig forhold.'), function () { openSub('Hendelser', hmsIncidents); }));
    if (isLeder()) l.appendChild(moreItem(HT().round, H.rounds[0] ? 'Siste: ' + hd(H.rounds[0].done_on) : 'Ingen gjennomført ennå', function () { openSub(HT().round, hmsRound); }));
    l.appendChild(moreItem(HT().trainTitle, H.training.length + ' registrert', function () { openSub(HT().trainTitle, hmsTraining); }));
    l.appendChild(moreItem(isAlk() ? 'Bevilling og ansvar' : 'Mål og ansvar', isAlk() ? 'Styrer, stedfortreder, bevilling og rutiner' : 'HMS-mål, roller og medvirkning', function () { openSub(isAlk() ? 'Bevilling og ansvar' : 'Mål og ansvar', hmsGoals); }));
    if (isLeder()) l.appendChild(moreItem('Årlig gjennomgang', H.reviews[0] ? 'Siste: ' + hd(H.reviews[0].done_on) : 'Ikke gjort ennå', function () { openSub('Årlig gjennomgang', hmsReview); }));
    l.appendChild(h('button', { class: 'btn', onclick: buildHmsDoc }, 'Hent frem ' + HT().docTitle.replace(/-mappe$/, '-mappen')));
  }).catch(function (e) { clear(l).appendChild(h('div', { class: 'err' }, errText(e))); });
}
async function hmsSeed() {
  if (!isLeder()) return;
  var H = hms(), me = S.user.id, due = addDays(ymd(new Date()), 30);
  var roles = H.roles.map(function (x, i) { return { role: x[0], duties: x[1], name: i === 0 ? nameOf(me) : '' }; });
  var ex0 = {}; if (isAlk()) { ex0.routines = {}; H.routines.forEach(function (r) { ex0.routines[r[0]] = r[2]; }); }
  var r1 = await sb.from('hms_settings').upsert({ org_id: S.org.id, module: S.mod, extra: ex0, goals: H.goals, roles: roles, participation: H.participation, updated_by: me, updated_at: new Date().toISOString() }, { onConflict: 'org_id,module' });
  if (r1.error) { toast(errText(r1.error)); return; }
  var rows = H.hazards.map(function (x) {
    var c = hCls(x[2], x[3]);
    return { org_id: S.org.id, module: S.mod, area: x[0], hazard: x[1], often: x[2], bad: x[3], measure: x[4], status: 'apen', source: 'forslag', due: HRANK[c] >= 3 ? due : null };
  });
  var r2 = await sb.from('hms_risks').insert(rows);
  if (r2.error) { toast(errText(r2.error)); return; }
  toast('Grunnlaget er laget. Gå gjennom og rett det som ikke stemmer.');
  renderHms($('#modLinks'));
}
/* Farer og tiltak */
function hmsRisks(box) {
  var H = S.hms, leder = isLeder();
  if (leder) box.appendChild(h('button', { class: 'btn', onclick: function () { riskDialog(null); } }, (isAlk() ? 'Ny risiko' : 'Ny fare')));
  var act = H.risks.filter(function (x) { return x.status === 'apen' || x.status === 'pagar'; });
  var done = H.risks.filter(function (x) { return x.status === 'ferdig'; });
  if (!H.risks.length) box.appendChild(h('div', { class: 'note' }, 'Ingenting registrert. ' + (leder ? 'Gå tilbake og trykk «Lag grunnlaget automatisk», eller legg inn selv.' : '')));
  function row(x) {
    var c = hCls(x.often, x.bad), today = ymd(new Date()), late = x.due && x.due < today && (x.status === 'apen' || x.status === 'pagar');
    var el = h('div', { class: 'card stack' },
      h('div', { class: 'row', style: 'align-items:flex-start' }, h('div', { class: 'grow' }, h('div', { style: 'font-weight:600' }, x.hazard), h('div', { class: 'small muted' }, [x.area || 'Hele stedet', x.source === 'vernerunde' ? 'Fra vernerunde' : null].filter(Boolean).join(' · '))), hTag(c)),
      x.measure ? h('div', { class: 'small' }, x.measure) : h('div', { class: 'small muted' }, 'Ingen tiltak beskrevet.'),
      h('div', { class: 'small muted' }, [x.responsible ? 'Ansvarlig: ' + hmsMember(x.responsible) : null, x.due ? (late ? 'Forfalt ' : 'Frist ') + hd(x.due) : null, x.status === 'pagar' ? 'Pågår' : null, x.status === 'ferdig' ? 'Gjort ' + hd(x.done_at) : null].filter(Boolean).join(' · ')));
    if (leder) el.appendChild(h('div', { class: 'row' }, h('button', { class: 'btn soft small', type: 'button', onclick: function () { riskDialog(x); } }, 'Endre'),
      x.status !== 'ferdig' ? h('button', { class: 'btn soft small', type: 'button', onclick: async function () { await hmsDone(x.id); refreshSub(); } }, 'Marker som gjort') : null));
    return el;
  }
  act.sort(function (a, b) { return HRANK[hCls(b.often, b.bad)] - HRANK[hCls(a.often, a.bad)]; });
  if (act.length) { box.appendChild(h('h2', null, 'Åpne')); act.forEach(function (x) { box.appendChild(row(x)); }); }
  if (done.length) { box.appendChild(h('h2', null, 'Gjort')); done.forEach(function (x) { box.appendChild(row(x)); }); }
}
async function hmsDone(id) {
  var r = await sb.from('hms_risks').update({ status: 'ferdig', done_at: new Date().toISOString() }).eq('id', id);
  if (r.error) toast(errText(r.error)); else toast('Tiltaket er markert som gjort');
}
function riskDialog(x) {
  var isNew = !x; x = x || { area: 'Hele stedet', hazard: '', often: null, bad: null, measure: '', status: 'apen', due: null, responsible: null };
  var sel = x.often == null ? null : [x.often, x.bad];
  var area = areaSelect(x.area), hz = h('input', { type: 'text', value: x.hazard, maxlength: 300, id: 'r-hz' });
  var ms = h('textarea', { id: 'r-ms' }, x.measure || ''), resp = memberSelect(x.responsible), due = h('input', { type: 'date', value: x.due || '' });
  var st = h('select', null, [['apen', 'Åpen'], ['pagar', 'Pågår'], ['ferdig', 'Gjort'], ['fjernet', 'Ikke aktuell']].map(function (o) { return h('option', { value: o[0] }, o[1]); })); st.value = x.status;
  var mxBox = h('div', { class: 'stack' }), out = h('div', { role: 'status' });
  function draw() { clear(mxBox); mxBox.appendChild(hMatrix(sel, function (p) { sel = p; draw(); })); mxBox.appendChild(hResult(sel)); }
  draw();
  openDlg([h('h2', null, isNew ? (isAlk() ? 'Ny risiko' : 'Ny fare') : 'Fare og tiltak'), h('label', { class: 'f' }, HT().hazardQ, hz), h('label', { class: 'f' }, 'Hvor', area),
    h('div', { class: 'f' }, 'Vurdering', mxBox), h('label', { class: 'f' }, 'Hva gjør vi for å hindre det? (tiltak)', ms),
    h('div', { class: 'row' }, h('label', { class: 'f grow' }, 'Ansvarlig', resp), h('label', { class: 'f grow' }, 'Frist', due)), h('label', { class: 'f' }, 'Status', st), out,
    h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: closeDlg }, 'Avbryt'), h('button', { class: 'btn grow', onclick: async function (ev) {
      if (!hz.value.trim()) { msg(out, 'err', 'Beskriv hva som kan gå galt.'); return; }
      if (!sel) { msg(out, 'err', 'Trykk på et felt i matrisen.'); return; }
      var c = hCls(sel[0], sel[1]);
      if (HRANK[c] >= 3 && st.value !== 'fjernet' && !ms.value.trim()) { msg(out, 'err', 'Høy risiko må ha et tiltak.'); return; }
      var row = { area: area.value, hazard: hz.value.trim(), often: sel[0], bad: sel[1], measure: ms.value.trim() || null, responsible: resp.value || null, due: due.value || null, status: st.value, done_at: st.value === 'ferdig' ? (x.done_at || new Date().toISOString()) : null };
      ev.target.disabled = true;
      var r = isNew ? await sb.from('hms_risks').insert(Object.assign(row, { org_id: S.org.id, module: S.mod })) : await sb.from('hms_risks').update(row).eq('id', x.id);
      if (r.error) { msg(out, 'err', errText(r.error)); ev.target.disabled = false; return; }
      closeDlg(); toast('Lagret'); refreshSub();
    } }, 'Lagre'))]);
}
/* Hendelser */
function hmsIncidents(box) {
  var H = S.hms, K = hms().kinds;
  box.appendChild(h('button', { class: 'btn', onclick: function () { incDialog(null); } }, 'Meld hendelse'));
  if (!H.incidents.length) box.appendChild(h('div', { class: 'note' }, 'Ingen hendelser registrert.'));
  H.incidents.forEach(function (x) {
    box.appendChild(h('button', { class: 'dev', type: 'button', onclick: function () { incDialog(x); } },
      h('div', { class: 't' }, x.description.slice(0, 90) + (x.description.length > 90 ? '…' : '')),
      h('div', { class: 'row small' }, h('span', { class: 'pill ' + (x.status === 'lukket' ? 'g' : x.status === 'apen' ? 'r' : 'a') }, DEV_STATUS[x.status]), h('span', { class: 'pill' }, K[x.kind]), h('span', { class: 'muted' }, fmtTs(x.occurred_at) + (x.place ? ' · ' + x.place : '')))));
  });
}
function incDialog(x) {
  var isNew = !x, leder = isLeder(), ro = !isNew && !leder;
  x = x || { kind: Object.keys(hms().kinds)[0], occurred_at: new Date().toISOString(), place: '', description: '', injured: '', cause: '', action: '', reported: '', status: 'apen' };
  var K = hms().kinds, kind = h('select', { disabled: ro }, Object.keys(K).map(function (k) { return h('option', { value: k }, K[k]); })); kind.value = x.kind;
  var dt = new Date(x.occurred_at), when = h('input', { type: 'datetime-local', value: ymd(dt) + 'T' + pad(dt.getHours()) + ':' + pad(dt.getMinutes()), disabled: ro });
  var place = h('input', { type: 'text', value: x.place || '', maxlength: 200, disabled: ro }), desc = h('textarea', { disabled: ro }, x.description);
  var inj = h('input', { type: 'text', value: x.injured || '', maxlength: 500, disabled: ro, placeholder: isAlk() ? 'Hvem var involvert?' : 'Navn og hva slags skade, hvis noen' });
  var cause = h('textarea', { disabled: !leder }, x.cause || ''), act = h('textarea', { disabled: !leder }, x.action || '');
  var rep = h('input', { type: 'text', value: x.reported || '', maxlength: 500, disabled: !leder, placeholder: isAlk() ? 'F.eks. politiet varslet, kommunen informert' : 'F.eks. NAV skademelding sendt, Arbeidstilsynet varslet' });
  var resp = memberSelect(x.responsible); resp.disabled = !leder;
  var status = h('select', { disabled: !leder }, Object.keys(DEV_STATUS).map(function (k) { return h('option', { value: k }, DEV_STATUS[k]); })); status.value = x.status;
  var out = h('div', { role: 'status' });
  var info = h('div', { class: 'note' }, 'Alvorlige ulykker og dødsfall skal meldes straks til Arbeidstilsynet og politiet, og skade i arbeid kan også skal meldes til NAV. Sjekk gjeldende regler hos Arbeidstilsynet og skriv hva som er meldt under.');
  info.textContent = HT().incNote || 'Alvorlige ulykker og dødsfall skal etter det vi vet meldes straks til Arbeidstilsynet og politiet, og arbeidsskade meldes til NAV. Sjekk gjeldende regler hos Arbeidstilsynet, og skriv under hva som er meldt.';
  openDlg([h('h2', null, isNew ? 'Meld hendelse' : 'Hendelse'), h('label', { class: 'f' }, 'Type', kind), h('label', { class: 'f' }, 'Når', when), h('label', { class: 'f' }, 'Hvor', place),
    h('label', { class: 'f' }, 'Hva skjedde?', desc), h('label', { class: 'f' }, HT().injured, inj),
    leder ? [h('label', { class: 'f' }, 'Årsak', cause), h('label', { class: 'f' }, 'Tiltak så det ikke skjer igjen', act), info, h('label', { class: 'f' }, 'Meldt til', rep), h('label', { class: 'f' }, 'Ansvarlig', resp), h('label', { class: 'f' }, 'Status', status)] : null, out,
    h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: closeDlg }, 'Lukk'), ro ? null : h('button', { class: 'btn grow', onclick: async function (ev) {
      if (!desc.value.trim()) { msg(out, 'err', 'Beskriv hva som skjedde.'); return; }
      var row = { kind: kind.value, occurred_at: new Date(when.value || Date.now()).toISOString(), place: place.value.trim() || null, description: desc.value.trim(), injured: inj.value.trim() || null };
      if (leder) Object.assign(row, { cause: cause.value.trim() || null, action: act.value.trim() || null, reported: rep.value.trim() || null, responsible: resp.value || null, status: status.value, closed_at: status.value === 'lukket' ? (x.closed_at || new Date().toISOString()) : null });
      ev.target.disabled = true;
      var r = isNew ? await sb.from('hms_incidents').insert(Object.assign(row, { org_id: S.org.id, module: S.mod })) : await sb.from('hms_incidents').update(row).eq('id', x.id);
      if (r.error) { msg(out, 'err', errText(r.error)); ev.target.disabled = false; return; }
      closeDlg(); toast('Lagret'); refreshSub();
    } }, 'Lagre'))]);
}
/* Vernerunde */
function hmsRound(box) {
  var items = hms().round.map(function (q) { return { q: q, ok: true, note: '' }; });
  var area = areaSelect('Hele stedet'), out = h('div', { role: 'status' }), note = h('textarea', null, '');
  box.appendChild(h('p', { class: 'muted' }, HT().roundIntro));
  box.appendChild(h('label', { class: 'f' }, 'Hvor', area));
  items.forEach(function (it) {
    var nt = h('input', { type: 'text', placeholder: 'Hva mangler?', maxlength: 300, hidden: true, oninput: function () { it.note = nt.value; } });
    var ok = h('button', { class: 'chip', type: 'button', 'aria-pressed': 'true' }, 'I orden'), bad = h('button', { class: 'chip', type: 'button', 'aria-pressed': 'false' }, 'Avvik');
    function set(v) { it.ok = v; ok.setAttribute('aria-pressed', v ? 'true' : 'false'); bad.setAttribute('aria-pressed', v ? 'false' : 'true'); nt.hidden = v; }
    ok.onclick = function () { set(true); }; bad.onclick = function () { set(false); nt.focus(); };
    box.appendChild(h('div', { class: 'card stack' }, h('div', { style: 'font-weight:600' }, it.q), h('div', { class: 'row' }, ok, bad), nt));
  });
  box.appendChild(h('label', { class: 'f' }, 'Kommentar', note)); box.appendChild(out);
  box.appendChild(h('button', { class: 'btn', onclick: async function (ev) {
    ev.target.disabled = true;
    var r = await sb.from('hms_rounds').insert({ org_id: S.org.id, module: S.mod, area: area.value, items: items, note: note.value.trim() || null });
    if (r.error) { msg(out, 'err', errText(r.error)); ev.target.disabled = false; return; }
    var bads = items.filter(function (i) { return !i.ok; }), due = addDays(ymd(new Date()), 14);
    if (bads.length) {
      var r2 = await sb.from('hms_risks').insert(bads.map(function (i) { return { org_id: S.org.id, module: S.mod, area: area.value, hazard: 'Avvik: ' + i.q, measure: i.note || null, status: 'apen', source: 'vernerunde', due: due }; }));
      if (r2.error) { msg(out, 'err', errText(r2.error)); ev.target.disabled = false; return; }
    }
    toast(bads.length ? bads.length + ' avvik er lagt inn som tiltak' : 'Lagret'); openSub(HT().risks, hmsRisks);
  } }, 'Lagre ' + HT().round.toLowerCase()));
  if (S.hms.rounds.length) {
    box.appendChild(h('h2', null, 'Tidligere'));
    S.hms.rounds.forEach(function (x) { var n = (x.items || []).filter(function (i) { return !i.ok; }).length; box.appendChild(h('div', { class: 'trow' }, h('div', { class: 'grow' }, h('div', { style: 'font-weight:600' }, hd(x.done_on) + ' · ' + (x.area || 'Hele stedet')), h('div', { class: 'small muted' }, n ? n + ' avvik' : 'Ingen avvik')))); });
  }
}
/* Opplæring */
function hmsTraining(box) {
  var H = S.hms, leder = isLeder(), today = ymd(new Date()), soon = addDays(today, 30);
  if (leder) box.appendChild(h('button', { class: 'btn', onclick: function () { trainDialog(null); } }, 'Registrer opplæring'));
  if (!H.training.length) box.appendChild(h('div', { class: 'note' }, 'Ingen opplæring registrert.'));
  H.training.forEach(function (x) {
    var exp = x.valid_until && x.valid_until < today, near = x.valid_until && !exp && x.valid_until <= soon;
    box.appendChild(h('div', { class: 'trow' }, h('div', { class: 'grow' }, h('div', { style: 'font-weight:600' }, x.person_name + ' · ' + x.topic),
      h('div', { class: 'small muted' }, hd(x.done_on) + (x.valid_until ? ' · gyldig til ' + hd(x.valid_until) : ''))), exp ? h('span', { class: 'pill r' }, 'Utløpt') : near ? h('span', { class: 'pill a' }, 'Utløper snart') : null,
      leder ? h('button', { class: 'btn soft small', type: 'button', onclick: function () { trainDialog(x); } }, 'Endre') : null));
  });
}
function trainDialog(x) {
  var isNew = !x; x = x || { person_name: '', topic: '', done_on: ymd(new Date()), valid_until: null, note: '' };
  var dl = h('datalist', { id: 'tp-list' }, hms().topics.map(function (t) { return h('option', { value: t }); })), dn = h('datalist', { id: 'pn-list' }, (S.members || []).map(function (m) { return h('option', { value: m.display_name || '' }); }));
  var who = h('input', { type: 'text', value: x.person_name, maxlength: 120, setAttribute: null }), topic = h('input', { type: 'text', value: x.topic, maxlength: 200 });
  who.setAttribute('list', 'pn-list'); topic.setAttribute('list', 'tp-list');
  var on = h('input', { type: 'date', value: x.done_on }), until = h('input', { type: 'date', value: x.valid_until || '' }), nt = h('input', { type: 'text', value: x.note || '', maxlength: 1000 }), out = h('div', { role: 'status' });
  openDlg([h('h2', null, isNew ? 'Registrer opplæring' : 'Opplæring'), dl, dn, h('label', { class: 'f' }, 'Hvem', who), h('label', { class: 'f' }, 'Hva (kurs eller opplæring)', topic),
    h('div', { class: 'row' }, h('label', { class: 'f grow' }, 'Dato', on), h('label', { class: 'f grow' }, 'Gyldig til (valgfritt)', until)), h('label', { class: 'f' }, 'Merknad', nt), out,
    h('div', { class: 'row' }, h('button', { class: 'btn alt', onclick: closeDlg }, 'Avbryt'),
      isNew ? null : h('button', { class: 'btn alt', onclick: async function () { var r = await sb.from('hms_training').delete().eq('id', x.id); if (r.error) { msg(out, 'err', errText(r.error)); return; } closeDlg(); refreshSub(); } }, 'Slett'),
      h('button', { class: 'btn grow', onclick: async function (ev) {
        if (!who.value.trim() || !topic.value.trim()) { msg(out, 'err', 'Fyll ut hvem og hva.'); return; }
        var row = { person_name: who.value.trim(), topic: topic.value.trim(), done_on: on.value || ymd(new Date()), valid_until: until.value || null, note: nt.value.trim() || null };
        ev.target.disabled = true;
        var r = isNew ? await sb.from('hms_training').insert(Object.assign(row, { org_id: S.org.id, module: S.mod })) : await sb.from('hms_training').update(row).eq('id', x.id);
        if (r.error) { msg(out, 'err', errText(r.error)); ev.target.disabled = false; return; }
        closeDlg(); toast('Lagret'); refreshSub();
      } }, 'Lagre'))]);
}
/* Mål, ansvar og medvirkning */
function hmsGoals(box) {
  var st = S.hms.settings || {}, leder = isLeder();
  var goals = h('textarea', { rows: 6, disabled: !leder }, (st.goals || []).join('\n'));
  var part = h('textarea', { rows: 6, disabled: !leder }, st.participation || '');
  var roles = (st.roles && st.roles.length ? st.roles : hms().roles.map(function (r) { return { role: r[0], duties: r[1], name: '' }; })).map(function (r) { return { role: r.role, duties: r.duties, name: r.name || '' }; });
  var rbox = h('div', { class: 'stack' }), out = h('div', { role: 'status' });
  var ex = st.extra || {}, exF = {};
  function exField(key, label, type, ph) { var i = h('input', { type: type || 'text', value: ex[key] || '', maxlength: 300, disabled: !leder, placeholder: ph || '' }); if (key === 'styrer' || key === 'stedfortreder') i.setAttribute('list', 'pn-list2'); exF[key] = i; return h('label', { class: 'f' }, label, i); }
  var rtF = {};
  function draw() {
    clear(rbox);
    roles.forEach(function (r, i) {
      var nm = h('input', { type: 'text', value: r.name, maxlength: 120, disabled: !leder, placeholder: 'Navn', oninput: function () { r.name = nm.value; } });
      nm.setAttribute('list', 'pn-list2');
      var ds = h('input', { type: 'text', value: r.duties, maxlength: 500, disabled: !leder, oninput: function () { r.duties = ds.value; } });
      rbox.appendChild(h('div', { class: 'card stack' }, h('div', { style: 'font-weight:600' }, r.role), h('label', { class: 'f' }, 'Navn', nm), h('label', { class: 'f' }, 'Oppgaver og myndighet', ds)));
    });
  }
  draw();
  box.appendChild(h('datalist', { id: 'pn-list2' }, (S.members || []).map(function (m) { return h('option', { value: m.display_name || '' }); })));
  if (isAlk()) {
    box.appendChild(h('p', { class: 'muted' }, 'Her samler du det kommunen og tilsynet vil se: hvem som er ansvarlig, hva bevillingen sier, og rutinene deres. Forslagene kan du endre fritt.'));
    box.appendChild(h('div', { class: 'card stack' }, h('h3', null, 'Bevilling'), exField('styrer', 'Styrer', 'text', 'Navn'), exField('stedfortreder', 'Stedfortreder for styrer', 'text', 'Navn'), exField('kommune', 'Kommune'),
      exField('valid_until', 'Bevillingen gyldig til', 'date'), exField('skjenketider', 'Skjenketider (fra bevillingen)', 'text', 'F.eks. til kl. 01:00 hverdager, 02:00 fredag og lørdag'), exField('omrade', 'Skjenkeområde', 'text', 'F.eks. restaurant og uteservering')));
    box.appendChild(h('h2', null, 'Rutiner'));
    hms().routines.forEach(function (r) { var ta = h('textarea', { rows: 6, disabled: !leder }, ((ex.routines || {})[r[0]]) || ''); rtF[r[0]] = ta; box.appendChild(h('label', { class: 'f' }, r[1], ta)); });
  } else box.appendChild(h('p', { class: 'muted' }, 'Mål, ansvar og medvirkning skal dokumenteres skriftlig (internkontrollforskriften § 5 punkt 4, 5 og 3). Forslagene kan du endre fritt.'));
  box.appendChild(h('label', { class: 'f' }, 'HMS-mål (ett per linje)', goals));
  box.appendChild(h('h2', null, 'Ansvar og roller')); box.appendChild(rbox);
  box.appendChild(h('label', { class: 'f' }, 'Hvordan de ansatte medvirker', part)); box.appendChild(out);
  if (leder) box.appendChild(h('button', { class: 'btn', onclick: async function (ev) {
    ev.target.disabled = true;
    var r = await sb.from('hms_settings').upsert({ org_id: S.org.id, module: S.mod, goals: goals.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean), roles: roles, participation: part.value.trim() || null, extra: isAlk() ? Object.assign({}, ex, Object.keys(exF).reduce(function (o, k) { o[k] = exF[k].value.trim(); return o; }, {}), { routines: Object.keys(rtF).reduce(function (o, k) { o[k] = rtF[k].value.trim(); return o; }, {}) }) : (st.extra || {}), updated_by: S.user.id, updated_at: new Date().toISOString() }, { onConflict: 'org_id,module' });
    ev.target.disabled = false;
    if (r.error) { msg(out, 'err', errText(r.error)); return; }
    toast('Lagret'); refreshSub();
  } }, 'Lagre'));
}
/* Årlig gjennomgang */
function hmsStats() {
  var H = S.hms, ya = addDays(ymd(new Date()), -365);
  return { hendelser: H.incidents.filter(function (x) { return x.occurred_at.slice(0, 10) >= ya; }).length,
    ulykker: H.incidents.filter(function (x) { return x.occurred_at.slice(0, 10) >= ya && x.kind === (isAlk() ? 'nektet' : 'ulykke'); }).length,
    apneTiltak: H.risks.filter(function (x) { return x.status === 'apen' || x.status === 'pagar'; }).length,
    gjorteTiltak: H.risks.filter(function (x) { return x.status === 'ferdig' && x.done_at && x.done_at.slice(0, 10) >= ya; }).length,
    vernerunder: H.rounds.filter(function (x) { return x.done_on >= ya; }).length, opplaering: H.training.filter(function (x) { return x.done_on >= ya; }).length };
}
function hmsReview(box) {
  var s = hmsStats(), H = S.hms;
  box.appendChild(h('p', { class: 'muted' }, HT().reviewIntro));
  box.appendChild(h('div', { class: 'card stack' }, h('h3', null, 'Siste 12 måneder'), table(['', 'Antall'], [['Hendelser', s.hendelser], [isAlk() ? 'Hvorav nektet servering' : 'Hvorav ulykker', s.ulykker], ['Tiltak gjort', s.gjorteTiltak], ['Åpne tiltak nå', s.apneTiltak], [HT().round, s.vernerunder], ['Opplæring registrert', s.opplaering]])));
  var goalsTxt = ((H.settings && H.settings.goals) || []).map(function (g) { return '• ' + g; }).join('\n');
  if (goalsTxt) box.appendChild(h('div', { class: 'card stack' }, h('h3', null, 'Målene våre'), h('div', { style: 'white-space:pre-line' }, goalsTxt)));
  var gm = h('textarea', { rows: 4 }, ''), cc = h('textarea', { rows: 4 }, ''), na = h('textarea', { rows: 4 }, ''), out = h('div', { role: 'status' });
  box.appendChild(h('label', { class: 'f' }, (isAlk() ? 'Fungerer rutinene? Hva viser hendelsesloggen?' : 'Er målene nådd?'), gm)); box.appendChild(h('label', { class: 'f' }, 'Konklusjon. Fungerer HMS-arbeidet?', cc));
  box.appendChild(h('label', { class: 'f' }, 'Hva skal vi gjøre fremover?', na)); box.appendChild(out);
  box.appendChild(h('button', { class: 'btn', onclick: async function (ev) {
    ev.target.disabled = true;
    var r = await sb.from('hms_reviews').insert({ org_id: S.org.id, module: S.mod, goals_met: gm.value.trim() || null, conclusion: cc.value.trim() || null, next_actions: na.value.trim() || null, snapshot: s });
    if (r.error) { msg(out, 'err', errText(r.error)); ev.target.disabled = false; return; }
    toast('Gjennomgangen er lagret'); refreshSub();
  } }, 'Lagre gjennomgang'));
  if (H.reviews.length) {
    box.appendChild(h('h2', null, 'Tidligere gjennomganger'));
    H.reviews.forEach(function (x) { box.appendChild(h('div', { class: 'card stack' }, h('div', { style: 'font-weight:600' }, hd(x.done_on)), x.conclusion ? h('div', { class: 'small' }, x.conclusion) : null, x.next_actions ? h('div', { class: 'small muted' }, 'Fremover: ' + x.next_actions) : null)); });
  }
}
/* HMS-mappen */
async function buildHmsDoc() {
  try { await loadHms(); } catch (e) { toast(errText(e)); return; }
  if (isAlk()) return buildAlkDoc();
  var H = S.hms, D = hms(), st = H.settings || {}, K = D.kinds, nodes = [], stt = hmsStatus(), okN = stt.filter(function (x) { return x[1]; }).length;
  nodes.push(h('div', { class: 'card stack' }, h('h2', null, 'HMS-mappe'), h('div', null, S.org.name + (S.org.orgnr ? ' · org.nr. ' + S.org.orgnr : '')),
    h('div', { class: 'small muted' }, 'Utarbeidet ' + hd(ymd(new Date())) + ' etter internkontrollforskriften § 5. ' + okN + ' av 8 punkter er dekket.')));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '1. Lover og forskrifter'), h('p', { class: 'small muted' }, 'De viktigste kravene for et serveringssted. Oversikten er ikke uttømmende. Gjeldende tekst finnes på lovdata.no og arbeidstilsynet.no.'), table(['Regelverk', 'Gjelder'], D.laws)));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '2. Kompetanse og opplæring'), H.training.length ? table(['Hvem', 'Hva', 'Dato', 'Gyldig til'], H.training.slice().reverse().map(function (x) { return [x.person_name, x.topic, hd(x.done_on), hd(x.valid_until)]; })) : h('p', null, 'Ingen opplæring registrert.')));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '3. Medvirkning fra de ansatte'), h('p', null, st.participation || 'Ikke fylt ut.')));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '4. Mål for helse, miljø og sikkerhet'), (st.goals || []).length ? h('ul', null, st.goals.map(function (g) { return h('li', null, g); })) : h('p', null, 'Ingen mål satt.')));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '5. Organisasjon, ansvar og myndighet'), (st.roles || []).length ? table(['Rolle', 'Navn', 'Oppgaver og myndighet'], st.roles.map(function (r) { return [r.role, r.name, r.duties]; })) : h('p', null, 'Ikke fylt ut.')));
  var rs = H.risks.filter(function (x) { return x.status !== 'fjernet'; }).sort(function (a, b) { return HRANK[hCls(b.often, b.bad)] - HRANK[hCls(a.often, a.bad)]; });
  var R = window.DATA.risk;
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '6. Kartlegging av farer, risikovurdering og tiltaksplan'),
    h('p', { class: 'small muted' }, 'Risiko er vurdert ut fra hvor ofte det skjer og hvor ille det kan gå.'),
    rs.length ? table(['Hvor', 'Fare', 'Risiko', 'Tiltak', 'Ansvarlig', 'Frist', 'Status'], rs.map(function (x) {
      return [x.area || 'Hele stedet', x.hazard, x.often == null ? 'Ikke vurdert' : D.label[hCls(x.often, x.bad)] + ' (' + R.often[x.often].toLowerCase() + ', ' + D.bad[x.bad].toLowerCase() + ')', x.measure || '', hmsMember(x.responsible), hd(x.due), { apen: 'Åpen', pagar: 'Pågår', ferdig: 'Gjort ' + hd(x.done_at) }[x.status]];
    })) : h('p', null, 'Ingen farer registrert.')));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '7. Rutiner for å avdekke, rette opp og forebygge brudd'), h('p', null, D.avvik),
    H.incidents.length ? table(['Når', 'Type', 'Hendelse', 'Årsak', 'Tiltak', 'Meldt til', 'Status'], H.incidents.map(function (x) { return [fmtTs(x.occurred_at), K[x.kind], x.description, x.cause || '', x.action || '', x.reported || '', DEV_STATUS[x.status]]; })) : h('p', { class: 'muted' }, 'Ingen hendelser registrert.'),
    H.rounds.length ? h('div', null, h('h4', null, 'Vernerunder'), table(['Dato', 'Hvor', 'Avvik'], H.rounds.map(function (x) { return [hd(x.done_on), x.area || 'Hele stedet', (x.items || []).filter(function (i) { return !i.ok; }).map(function (i) { return i.q + (i.note ? ' (' + i.note + ')' : ''); }).join('; ') || 'Ingen']; }))) : null));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '8. Overvåking og årlig gjennomgang'), H.reviews.length ? H.reviews.map(function (x) {
    return h('div', { class: 'stack' }, h('b', null, hd(x.done_on)), h('div', null, 'Mål nådd: ' + (x.goals_met || '–')), h('div', null, 'Konklusjon: ' + (x.conclusion || '–')), h('div', null, 'Fremover: ' + (x.next_actions || '–')));
  }) : h('p', null, 'Ingen gjennomgang er gjort ennå.')));
  S.docBack = 'mod';
  docScreen(nodes, function () {
    downloadCsv('hms-farer-og-tiltak.csv', [['Hvor', 'Fare', 'Risiko', 'Tiltak', 'Ansvarlig', 'Frist', 'Status']].concat(rs.map(function (x) { return [x.area, x.hazard, D.label[hCls(x.often, x.bad)], x.measure || '', hmsMember(x.responsible), x.due || '', x.status]; })));
  });
}
async function buildAlkDoc() {
  var H = S.hms, D = hms(), st = H.settings || {}, ex = st.extra || {}, K = D.kinds, R = window.DATA.risk, stt = hmsStatus(), okN = stt.filter(function (x) { return x[1]; }).length, nodes = [];
  nodes.push(h('div', { class: 'card stack' }, h('h2', null, 'IK-alkohol: beskrivelse av internkontrollen'), h('div', null, S.org.name + (S.org.orgnr ? ' · org.nr. ' + S.org.orgnr : '')),
    h('div', { class: 'small muted' }, 'Utarbeidet ' + hd(ymd(new Date())) + ' etter alkoholforskriften kapittel 8. ' + okN + ' av 6 punkter er dekket.')));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '1. Bevilling og ansvar'),
    table(['', ''], [['Styrer', ex.styrer || 'Ikke satt'], ['Stedfortreder', ex.stedfortreder || 'Ikke satt'], ['Kommune', ex.kommune || ''], ['Bevilling gyldig til', hd(ex.valid_until) || 'Ikke satt'], ['Skjenketider', ex.skjenketider || ''], ['Skjenkeområde', ex.omrade || '']]),
    (st.roles || []).length ? table(['Rolle', 'Navn', 'Oppgaver og myndighet'], st.roles.map(function (r) { return [r.role, r.name, r.duties]; })) : null));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '2. Regelverk'), table(['Regelverk', 'Gjelder'], D.laws)));
  var rs = H.risks.filter(function (x) { return x.status !== 'fjernet'; }).sort(function (a, b) { return HRANK[hCls(b.often, b.bad)] - HRANK[hCls(a.often, a.bad)]; });
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '3. Kartlegging av utfordringer og tiltak'), h('p', { class: 'small muted' }, 'Risiko er vurdert ut fra hvor ofte et brudd kan skje og hvor alvorlige følgene er.'),
    rs.length ? table(['Hvor', 'Risiko', 'Vurdering', 'Tiltak', 'Ansvarlig', 'Frist', 'Status'], rs.map(function (x) { return [x.area || 'Hele stedet', x.hazard, x.often == null ? 'Ikke vurdert' : D.label[hCls(x.often, x.bad)] + ' (' + R.often[x.often].toLowerCase() + ', ' + D.bad[x.bad].toLowerCase() + ')', x.measure || '', hmsMember(x.responsible), hd(x.due), { apen: 'Åpen', pagar: 'Pågår', ferdig: 'Gjort ' + hd(x.done_at) }[x.status]]; })) : h('p', null, 'Ingenting registrert.')));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '4. Forebyggende rutiner'), D.routines.map(function (r) { return h('div', { class: 'stack' }, h('b', null, r[1]), h('p', { style: 'white-space:pre-line' }, ((ex.routines || {})[r[0]]) || 'Ikke fylt ut.')); })));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '5. Opplæring og kunnskapsprøve'), H.training.length ? table(['Hvem', 'Hva', 'Dato', 'Gyldig til'], H.training.slice().reverse().map(function (x) { return [x.person_name, x.topic, hd(x.done_on), hd(x.valid_until)]; })) : h('p', null, 'Ingen registrert.'), st.participation ? h('p', null, st.participation) : null));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '6. Oppfølging: avvik, hendelseslogg og kontroller'), h('p', null, D.avvik),
    H.incidents.length ? table(['Når', 'Type', 'Hendelse', 'Årsak', 'Tiltak', 'Meldt til', 'Status'], H.incidents.map(function (x) { return [fmtTs(x.occurred_at), K[x.kind] || x.kind, x.description, x.cause || '', x.action || '', x.reported || '', DEV_STATUS[x.status]]; })) : h('p', { class: 'muted' }, 'Ingen hendelser registrert.'),
    H.rounds.length ? h('div', null, h('h4', null, 'Skjenkekontroller'), table(['Dato', 'Hvor', 'Avvik'], H.rounds.map(function (x) { return [hd(x.done_on), x.area || 'Hele stedet', (x.items || []).filter(function (i) { return !i.ok; }).map(function (i) { return i.q + (i.note ? ' (' + i.note + ')' : ''); }).join('; ') || 'Ingen']; }))) : null));
  nodes.push(h('div', { class: 'card stack' }, h('h3', null, '7. Gjennomgang'), H.reviews.length ? H.reviews.map(function (x) { return h('div', { class: 'stack' }, h('b', null, hd(x.done_on)), h('div', null, 'Rutinene virker: ' + (x.goals_met || '–')), h('div', null, 'Konklusjon: ' + (x.conclusion || '–')), h('div', null, 'Fremover: ' + (x.next_actions || '–'))); }) : h('p', null, 'Ingen gjennomgang er gjort ennå.')));
  S.docBack = 'mod';
  docScreen(nodes, function () { downloadCsv('alkohol-risiko-og-tiltak.csv', [['Hvor', 'Risiko', 'Vurdering', 'Tiltak', 'Ansvarlig', 'Frist', 'Status']].concat(rs.map(function (x) { return [x.area, x.hazard, D.label[hCls(x.often, x.bad)], x.measure || '', hmsMember(x.responsible), x.due || '', x.status]; }))); });
}
/* HMS i leders I dag-liste */
async function hmsTodayItems() {
  var o = S.org.id, today = ymd(new Date()), week = addDays(today, 14), soon = addDays(today, 30), items = [];
  var NM = { hms: 'HMS', alkohol: 'IK-alkohol' };
  var r = await Promise.all([sb.from('hms_risks').select('*').eq('org_id', o).in('status', ['apen', 'pagar']).not('due', 'is', null).lte('due', week), sb.from('hms_incidents').select('*').eq('org_id', o).neq('status', 'lukket'), sb.from('hms_training').select('*').eq('org_id', o).not('valid_until', 'is', null).lte('valid_until', soon), sb.from('hms_settings').select('*').eq('org_id', o).eq('module', 'alkohol').maybeSingle()]);
  function jump(m, title, fn) { return function () { S.mod = m; go('mod'); openSub(title, fn); }; }
  (r[0].data || []).forEach(function (x) { items.push({ title: x.hazard, sub: (x.due < today ? 'Forfalt ' : 'Frist ') + hd(x.due) + (x.responsible ? ' · ' + hmsMember(x.responsible) : ''), late: x.due < today, kind: NM[x.module] + ' · Tiltak', go: jump(x.module, x.module === 'alkohol' ? 'Risiko og tiltak' : 'Farer og tiltak', hmsRisks), done: async function () { await hmsDone(x.id); } }); });
  (r[1].data || []).forEach(function (x) { items.push({ title: x.description.slice(0, 80), sub: 'Åpen hendelse fra ' + hd(x.occurred_at), late: false, kind: NM[x.module] + ' · Hendelse', go: jump(x.module, 'Hendelser', hmsIncidents) }); });
  (r[2].data || []).forEach(function (x) { items.push({ title: x.person_name + ': ' + x.topic, sub: (x.valid_until < today ? 'Utløpt ' : 'Utløper ') + hd(x.valid_until), late: x.valid_until < today, kind: NM[x.module] + ' · Opplæring', go: jump(x.module, 'Opplæring', hmsTraining) }); });
  var ex = r[3].data && r[3].data.extra;
  if (ex && ex.valid_until && ex.valid_until <= addDays(today, 60)) items.push({ title: 'Skjenkebevillingen', sub: (ex.valid_until < today ? 'Utløpt ' : 'Utløper ') + hd(ex.valid_until), late: ex.valid_until < today, kind: 'IK-alkohol · Bevilling', go: jump('alkohol', 'Bevilling og ansvar', hmsGoals) });
  return items;
}
function drawHmsToday() {
  var b = clear($('#hmsToday')), it = S.hmsItems || [];
  if (!it.length || !isLeder()) return;
  var box = h('div', { class: 'group' }, h('header', null, h('h3', null, 'HMS · må følges opp'), h('span', { class: 'pill ' + (it.some(function (x) { return x.late; }) ? 'r' : 'a') }, it.length)));
  it.forEach(function (x) {
    box.appendChild(h('div', { class: 'trow' }, h('button', { class: 'dev grow', type: 'button', onclick: x.go, style: 'border:0;padding:0;text-align:left;background:none' }, h('div', { class: 't' }, x.title), h('div', { class: 'small ' + (x.late ? '' : 'muted'), style: x.late ? 'color:var(--red)' : '' }, x.kind + ' · ' + x.sub)),
      x.done ? h('button', { class: 'btn soft small', type: 'button', onclick: async function () { await x.done(); S.hmsItems = await hmsTodayItems(); drawHmsToday(); } }, 'Gjort') : null));
  });
  b.appendChild(box);
}

/* Logo: rutene bytter plass en stund og kommer tilbake. FORTGJORT-navnet tar deg til I dag. */
(function () {
  var busy = false;
  $('#logoBtn').addEventListener('click', function () {
    if (busy) return; busy = true;
    var q = $$('#logoBtn .q'), n = q.length, perm = [], i;
    do { perm = []; for (i = 0; i < n; i++) perm.push(i); for (i = n - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = perm[i]; perm[i] = perm[j]; perm[j] = t; } }
    while (perm.every(function (p, k) { return p === k; }));
    q.forEach(function (el, k) {
      var to = perm[k], dx = ((to % 3) - (k % 3)) * 42, dy = (Math.floor(to / 3) - Math.floor(k / 3)) * 42;
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    });
    setTimeout(function () { q.forEach(function (el) { el.style.transform = ''; }); setTimeout(function () { busy = false; }, 600); }, 2200);
  });
  $('#homeBtn').addEventListener('click', function () { S.day = ymd(new Date()); go('today'); });
})();
/* Hamburgermeny: virksomhet, planer og mapper, innstillinger og utlogging. */
(function () {
  var panel = $('#menuPanel'), btn = $('#burger');
  function close() { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
  function item(title, sub, fn) {
    return h('button', { class: 'mi', type: 'button', role: 'menuitem', onclick: function () { close(); fn(); } }, title, sub ? h('small', null, sub) : null);
  }
  function build() {
    clear(panel);
    if (!S.org) return;
    panel.appendChild(h('div', { class: 'mh' }, h('b', null, S.org.name), h('span', { class: 'small muted' }, isLeder() ? 'Leder' : 'Ansatt')));
    panel.appendChild(item('Planlegging', 'Rutiner og sjekklister', function () { S.mod = 'rut'; go('mod'); }));
    panel.appendChild(item('IK-mat-plan', 'HACCP-planen for stedet', showPlan));
    panel.appendChild(item('Tilsynsmappe', 'Plan, kvitteringer og avvik', showFolder));
    if (isLeder()) {
      panel.appendChild(item('Kjøleskap og frysere', null, unitsDialog));
      panel.appendChild(item('Team og invitasjon', null, teamDialog));
      panel.appendChild(item('Endringslogg', 'Hvem som endret hva', showAudit));
    }
    panel.appendChild(h('hr'));
    panel.appendChild(item('Mitt navn', nameOf(S.user.id), nameDialog));
    if (S.mems.length > 1) panel.appendChild(item('Bytt virksomhet', null, orgSwitch));
    panel.appendChild(item('Personvern og vilkår', null, function () { location.href = '../personvern.html'; }));
    panel.appendChild(item('Logg ut', S.user && S.user.email, logout));
  }
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!panel.hidden) { close(); return; }
    build(); panel.hidden = false; btn.setAttribute('aria-expanded', 'true');
  });
  document.addEventListener('click', function (e) { if (!panel.hidden && !panel.contains(e.target)) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { close(); btn.focus(); } });
})();
window.__ikmat = { S: S, go: go, dueOn: dueOn };
})();
