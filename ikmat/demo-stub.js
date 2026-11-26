/* Demo av FORTGJORT. Erstatter Supabase med en backend som bare lever i minnet.
   Alt er fiktivt (Kafé Fiktiv). Ingenting sendes ut av nettleseren og ingenting lagres: å laste siden på nytt starter demoen på nytt. */
(function () {
  window.__DEMO = true;

  /* Lagring i minnet i stedet for nettleserens lagring */
  (function () {
    function mem() {
      var m = {};
      return { getItem: function (k) { return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null; }, setItem: function (k, v) { m[k] = String(v); }, removeItem: function (k) { delete m[k]; }, clear: function () { m = {}; }, key: function (i) { return Object.keys(m)[i] || null; }, get length() { return Object.keys(m).length; } };
    }
    ['localStorage', 'sessionStorage'].forEach(function (n) { try { Object.defineProperty(window, n, { value: mem(), configurable: true }); } catch (e) { /* appen tåler å mangle lagring */ } });
  })();

  function uid() { return crypto.randomUUID(); }
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function pd(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  var ORG = 'o-demo', now = new Date(), TODAY = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var ME = { id: 'u-anna', email: 'anna@kafe-fiktiv.example' };
  var ORGROW = { id: ORG, name: 'Kafé Fiktiv AS', orgnr: '999999999', address: 'Fiktivgata 1', business_type: 'kafe', has_alcohol: true, created_at: addDays(TODAY, -90).toISOString(), opening_hours: { 1: ['11:00', '22:00'], 2: ['11:00', '22:00'], 3: ['11:00', '22:00'], 4: ['11:00', '23:00'], 5: ['11:00', '02:00'], 6: ['12:00', '02:00'] } };
  var people = [['u-anna', 'Anna Larsen', 'leder', ['a1', 'a2', 'a3']], ['u-ola', 'Ola Nordmann', 'ansatt', ['a1']], ['u-kari', 'Kari Hansen', 'ansatt', ['a2']], ['u-jonas', 'Jonas Berg', 'ansatt', ['a1', 'a3']], ['u-mina', 'Mina Solheim', 'ansatt', ['a2', 'a3']]];

  var T = { members: [], areas: [], routine_blocks: [], tasks: [], task_runs: [], deviations: [], units: [], haccp_plans: [], quick_routines: [], quick_runs: [], training_signoffs: [], hms_training: [], audit_log: [] };
  people.forEach(function (p, i) { T.members.push({ org_id: ORG, user_id: p[0], role: p[2], display_name: p[1], work_areas: p[3], created_at: addDays(TODAY, -80 + i).toISOString() }); });
  T.areas = [['a1', 'kjokken', 'Kjøkken'], ['a2', 'bar', 'Bar'], ['a3', 'kafe', 'Kafé']].map(function (a, i) { return { id: a[0], org_id: ORG, kind: a[1], name: a[2], created_at: String(i + 1) }; });
  [['b1', 'Kjøkken åpning', '07:00:00', '11:00:00', 'a1', 10], ['b2', 'Kjøkken stenging', '21:00:00', '23:59:00', 'a1', 20], ['b3', 'Bar kveld', '16:00:00', '02:00:00', 'a2', 30]].forEach(function (b) {
    T.routine_blocks.push({ id: b[0], org_id: ORG, name: b[1], start_time: b[2], end_time: b[3], area_id: b[4], weekdays: null, active: true, sort: b[5], created_at: addDays(TODAY, -80).toISOString() });
  });
  T.units = [['k1', 'kjol', 'Kjøleskap kjøkken', 'a1'], ['k2', 'kjol', 'Kjøleskap bar', 'a2'], ['f1', 'frys', 'Fryser kjøkken', 'a1']].map(function (u) { return { id: u[0], org_id: ORG, kind: u[1], name: u[2], area_id: u[3], active: true, created_at: addDays(TODAY, -80).toISOString() }; });

  function mk(id, area, block, routine, domain, title, kind, extra) {
    T.tasks.push(Object.assign({ id: id, org_id: ORG, area_id: area, block_id: block, domain: domain, routine: routine, title: title, hint: null, kind: kind || 'check', unit: null, min_value: null, max_value: null, unit_id: null, recurrence: { freq: 'daily' }, source: 'mal', sort: T.tasks.length * 10, active: true, created_at: addDays(TODAY, -80).toISOString() }, extra || {}));
  }
  mk('t1', 'a1', 'b1', 'apning', 'mat', 'Ansatte er friske og har rent arbeidstøy', 'check', { hint: 'Ingen jobber med mat ved oppkast eller diaré. Meld fra til leder.' });
  mk('t2', 'a1', 'b1', 'apning', 'mat', 'Temperatur i kjøleskap kjøkken', 'measure', { unit: '°C', max_value: 4, unit_id: 'k1', hint: 'Mål og skriv inn. Grensen er 4 °C.' });
  mk('t3', 'a1', 'b1', 'apning', 'mat', 'Temperatur i fryser kjøkken', 'measure', { unit: '°C', max_value: -18, unit_id: 'f1' });
  mk('t4', 'a1', 'b1', 'apning', 'mat', 'Flater og skjærebrett er rene', 'check');
  mk('t5', 'a1', 'b1', 'apning', 'mat', 'Mottakskontroll av varer', 'check', { hint: 'Kontroller temperatur, dato og emballasje ved levering.' });
  mk('t6', 'a1', 'b2', 'stenging', 'mat', 'Rester er nedkjølt, merket og dekket til', 'check');
  mk('t7', 'a1', 'b2', 'stenging', 'mat', 'Oppvaskmaskin og avtrekk er rengjort', 'check');
  mk('t8', 'a1', 'b2', 'stenging', 'mat', 'Avfall er tømt og avfallsrommet er rent', 'check');
  mk('t9', 'a2', 'b3', 'apning', 'mat', 'Ølanlegg og glass er rene', 'check');
  mk('t10', 'a2', 'b3', 'apning', 'alkohol', 'Skjenketider og ansvarlig på vakt er avklart', 'check');
  mk('t11', 'a2', 'b3', 'apning', 'mat', 'Temperatur i kjøleskap bar', 'measure', { unit: '°C', max_value: 4, unit_id: 'k2' });
  mk('t12', 'a2', 'b3', 'stenging', 'alkohol', 'Alkohol er låst inn', 'check');
  mk('t13', 'a2', 'b3', 'stenging', 'alkohol', 'Hendelseslogg er ført for vakten', 'check');
  mk('t14', 'a3', null, 'daglig', 'mat', 'Kaffemaskin og melkesystem er rengjort', 'check');
  mk('t15', 'a3', null, 'daglig', 'mat', 'Vitrinen er kontrollert og datert', 'check');
  mk('t16', null, null, 'ukentlig', 'mat', 'Kalibrer termometer', 'check', { recurrence: { freq: 'weekly', weekdays: [1] } });
  mk('t17', null, null, 'ukentlig', 'hms', 'Slukkeutstyr og rømningsveier er kontrollert', 'check', { recurrence: { freq: 'weekly', weekdays: [(TODAY.getDay() + 6) % 7 + 1] } });
  mk('t18', null, null, 'manedlig', 'hms', 'Vernerunde', 'check', { recurrence: { freq: 'monthly', day: TODAY.getDate() } });

  function dueOn(rec, d) {
    var f = rec.freq || 'daily', iso = ((d.getDay() + 6) % 7) + 1, wd = Array.isArray(rec.weekdays) ? rec.weekdays : null, last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    if (f === 'daily') return !wd || wd.indexOf(iso) >= 0;
    if (f === 'weekly') return (wd || [1]).indexOf(iso) >= 0;
    if (f === 'monthly') return d.getDate() === Math.min(rec.day || 1, last);
    return false;
  }

  /* Historikk de siste tre ukene */
  var doers = ['u-ola', 'u-kari', 'u-jonas', 'u-mina', 'u-anna'];
  function addRun(t, day, status, value) {
    var d = new Date(day); d.setHours(t.routine === 'stenging' ? 22 : 8, Math.floor(rnd() * 50), 0, 0);
    T.task_runs.push({ id: uid(), org_id: ORG, task_id: t.id, due_date: ymd(day), status: status, value: value == null ? null : value, note: null, skip_reason: status === 'skipped' ? 'Maskinen er på service' : null, photo_path: null, done_by: status === 'missed' ? null : doers[Math.floor(rnd() * doers.length)], done_at: d.toISOString() });
  }
  for (var back = 21; back >= 1; back--) {
    var day = addDays(TODAY, -back);
    T.tasks.forEach(function (t) {
      if (!dueOn(t.recurrence, day)) return;
      var r = rnd();
      if (back === 1 && (t.id === 't7' || t.id === 't13')) return;           // blir «ikke registrert» i går
      if (r > 0.94) return;                                                     // glemt (uten rad)
      if (r > 0.91 && t.id !== 't2') { addRun(t, day, 'skipped'); return; }
      if (t.kind === 'measure') addRun(t, day, 'done', t.max_value > 0 ? Math.round((2.2 + rnd() * 1.6) * 10) / 10 : -Math.round((19 + rnd() * 3) * 10) / 10);
      else addRun(t, day, 'done');
    });
  }
  /* I dag: noen er gjort */
  ['t1', 't2', 't3', 't4'].forEach(function (id) { var t = T.tasks.filter(function (x) { return x.id === id; })[0]; if (t && dueOn(t.recurrence, TODAY)) addRun(t, TODAY, 'done', t.kind === 'measure' ? (t.max_value > 0 ? 3.1 : -19.4) : null); });
  /* I går: kjøleskapet i baren var for varmt */
  (function () { var t = T.tasks.filter(function (x) { return x.id === 't11'; })[0], y = addDays(TODAY, -2); T.task_runs = T.task_runs.filter(function (r) { return !(r.task_id === 't11' && r.due_date === ymd(y)); }); addRun(t, y, 'done', 6.8); })();

  var dev = function (cat, title, desc, cause, action, status, daysAgo, resp) { T.deviations.push({ id: uid(), org_id: ORG, category: cat, title: title, description: desc, cause: cause, action: action, responsible: resp || null, status: status, source_run_id: null, photo_path: null, created_by: 'u-ola', created_at: addDays(TODAY, -daysAgo).toISOString(), closed_at: status === 'lukket' ? addDays(TODAY, -daysAgo + 1).toISOString() : null }); };
  dev('mat', 'Måling utenfor grense: Temperatur i kjøleskap bar', 'Målt 6,8 °C. Grense: ingen til 4 °C.', 'Døra sto åpen under leveransen.', 'Varene vurdert og kastet ved tvil. Tetningslister kontrolleres.', 'under_arbeid', 2, 'u-anna');
  dev('alkohol', 'Gjest uten legitimasjon forsøkte å kjøpe øl', 'Gjest som så ut til å være under 25 ble bedt om ID og hadde ingen.', 'Ny i baren.', 'Servering nektet. Rutine for ID-kontroll gjennomgått på personalmøte.', 'lukket', 9, 'u-kari');
  dev('hms', 'Glatt gulv ved bakdøren', 'Vann fra avfallsrommet rant inn og ga fare for fall.', null, null, 'apen', 1, null);

  T.haccp_plans = [{ id: 'p1', org_id: ORG, version: 1, status: 'godkjent', plan: null, created_at: addDays(TODAY, -80).toISOString() }];
  function buildPlan() {
    var D = window.DATA, steps = D.defaultSteps.kafe, plan = { businessType: 'kafe', areas: ['kjokken', 'bar', 'kafe'], alcohol: true, steps: steps, hazards: {}, ghp: [], ccps: [], created: addDays(TODAY, -80).toISOString() };
    steps.forEach(function (s) {
      plan.hazards[s] = D.hazards[s].map(function (x, i) { var rk = D.risk.suggest[s] && D.risk.suggest[s][i]; return { text: x[0], type: x[1], often: rk ? rk[0] : null, bad: rk ? rk[1] : null, cls: rk ? D.risk.matrix[rk[0]][rk[1]] : null }; });
    });
    plan.ghp = D.ghp.map(function (g) { return { title: g[0], text: g[1] }; });
    D.ccps.forEach(function (c) { if (steps.indexOf(c.step) >= 0) plan.ccps.push({ id: c.id, title: c.title, kind: c.kind, value: c.value, unit: c.unit, monitor: c.monitor, action: c.action, verify: c.verify }); });
    return plan;
  }
  function lateSeed() {
    if (T.__late || !window.DATA) return; T.__late = true;
    try { T.haccp_plans[0].plan = buildPlan(); } catch (e) { /* planen vises tom */ }
    (window.DATA.quick || []).slice(0, 6).forEach(function (q, i) { T.quick_routines.push({ id: uid(), org_id: ORG, title: q.title, intro: q.intro, items: q.items, pinned: !!q.pin, sort: i, active: true, created_at: addDays(TODAY, -60).toISOString() }); });
    T.quick_runs.push({ id: uid(), org_id: ORG, routine_id: null, title: 'Varemottak', ticked: 5, note: 'Fisken kom med 3 °C. Alt OK.', done_by: 'u-ola', done_at: addDays(TODAY, -3).toISOString() });
    T.quick_runs.push({ id: uid(), org_id: ORG, routine_id: null, title: 'Gjest med allergi', ticked: 5, note: null, done_by: 'u-kari', done_at: addDays(TODAY, -6).toISOString() });
    var L = window.DATA.learn && window.DATA.learn.bolker || [];
    ['mat-hygiene', 'mat-temp', 'rut-bruk'].forEach(function (id, i) { var b = L.filter(function (x) { return x.id === id; })[0]; if (b) T.training_signoffs.push({ id: uid(), org_id: ORG, user_id: 'u-anna', module_id: id, version: b.v, score: 4, signed_at: addDays(TODAY, -20 + i).toISOString() }); });
    ['u-ola', 'u-kari'].forEach(function (u) { var b = L.filter(function (x) { return x.id === 'alk-lov'; })[0]; if (b) T.training_signoffs.push({ id: uid(), org_id: ORG, user_id: u, module_id: 'alk-lov', version: b.v, score: 4, signed_at: addDays(TODAY, -12).toISOString() }); });
    T.hms_training.push({ id: uid(), org_id: ORG, module: 'alkohol', person_name: 'Kari Hansen', topic: 'Opplæring i alkoholloven (før første vakt)', done_on: ymd(addDays(TODAY, -40)), valid_until: null, notes: null });
    T.hms_training.push({ id: uid(), org_id: ORG, module: 'hms', person_name: 'Ola Nordmann', topic: 'Brannvern og evakuering', done_on: ymd(addDays(TODAY, -30)), valid_until: null, notes: null });
  }

  function Q(table) {
    lateSeed();
    var q = { table: table, filters: [], op: 'select', order: [], lim: null, payload: null };
    var api = {
      select: function (c) { q.sel = true; return api; },
      insert: function (p) { q.op = 'insert'; q.payload = p; return api; },
      update: function (p) { q.op = 'update'; q.payload = p; return api; },
      delete: function () { q.op = 'delete'; return api; },
      upsert: function (p) { var ex = (T[table] = T[table] || []).filter(function (r) { return r.org_id === p.org_id && r.module === p.module; })[0]; if (ex) { Object.assign(ex, p); q.op = 'noop'; } else { q.op = 'insert'; q.payload = p; } return api; },
      in: function (k, v) { q.filters.push(function (r) { return v.indexOf(r[k]) >= 0; }); return api; },
      not: function (k, o, v) { q.filters.push(function (r) { return !((r[k] == null) === (v === null)); }); return api; },
      neq: function (k, v) { q.filters.push(function (r) { return r[k] !== v; }); return api; },
      is: function (k, v) { q.filters.push(function (r) { return (r[k] == null) === (v === null); }); return api; },
      eq: function (k, v) { q.filters.push(function (r) { return r[k] === v; }); return api; },
      gte: function (k, v) { q.filters.push(function (r) { return r[k] >= v; }); return api; },
      lte: function (k, v) { q.filters.push(function (r) { return r[k] <= v; }); return api; },
      order: function (k, o) { q.order.push([k, !(o && o.ascending === false)]); return api; },
      limit: function (n) { q.lim = n; return api; },
      maybeSingle: function () { q.single = true; return api; },
      single: function () { q.single = true; return api; },
      then: function (res, rej) { return Promise.resolve(run()).then(res, rej); }
    };
    function run() {
      var rows = T[table] = T[table] || [];
      if (q.op === 'noop') return { data: null, error: null };
      if (q.op === 'insert') {
        var arr = Array.isArray(q.payload) ? q.payload : [q.payload], ins = [];
        for (var i = 0; i < arr.length; i++) {
          var r = Object.assign({ id: uid(), created_at: new Date().toISOString(), done_by: ME.id, done_at: new Date().toISOString(), created_by: ME.id, user_id: ME.id, active: true }, arr[i]);
          if (table === 'task_runs') {
            if (rows.some(function (x) { return x.task_id === r.task_id && x.due_date === r.due_date; })) return { data: null, error: { code: '23505', message: 'Allerede kvittert' } };
            var t = T.tasks.filter(function (x) { return x.id === r.task_id; })[0];
            if (t && r.status === 'done' && r.value != null && ((t.max_value != null && r.value > t.max_value) || (t.min_value != null && r.value < t.min_value))) {
              T.deviations.push({ id: uid(), org_id: ORG, category: t.domain, title: 'Måling utenfor grense: ' + t.title, description: 'Målt ' + r.value + ' ' + (t.unit || ''), cause: null, action: null, responsible: null, status: 'apen', source_run_id: r.id, created_by: ME.id, created_at: new Date().toISOString(), closed_at: null });
            }
          }
          rows.push(r); ins.push(r);
        }
        return { data: q.sel ? (q.single ? ins[0] || null : ins) : null, error: null };
      }
      var out = rows.filter(function (r) { return q.filters.every(function (f) { return f(r); }); });
      if (q.op === 'update') { out.forEach(function (r) { Object.assign(r, q.payload); }); return { data: null, error: null }; }
      if (q.op === 'delete') { T[table] = rows.filter(function (r) { return out.indexOf(r) < 0; }); return { data: null, error: null }; }
      q.order.slice().reverse().forEach(function (o) { var k = o[0], asc = o[1]; out = out.slice().sort(function (a, b) { return (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * (asc ? 1 : -1); }); });
      if (q.lim) out = out.slice(0, q.lim);
      out = out.map(function (r) {
        var c = Object.assign({}, r);
        if (table === 'members') c.organizations = ORGROW;
        if (table === 'task_runs') { var t = T.tasks.filter(function (x) { return x.id === r.task_id; })[0] || {}; c.tasks = { title: t.title, domain: t.domain, routine: t.routine, unit: t.unit, area_id: t.area_id }; }
        return c;
      });
      if (q.single) return { data: out[0] || null, error: null };
      return { data: out, error: null };
    }
    return api;
  }

  var listeners = [], openGate, gate = new Promise(function (r) { openGate = r; });
  window.__demoOpen = openGate;
  var client = {
    auth: {
      onAuthStateChange: function (cb) { listeners.push(cb); gate.then(function () { cb('INITIAL_SESSION', { user: ME }); }); return { data: { subscription: {} } }; },
      getSession: function () { return gate.then(function () { return ({ data: { session: { access_token: 'demo', user: ME } } }); }); },
      signInWithPassword: function () { return Promise.resolve({ data: {}, error: null }); },
      verifyOtp: function () { return Promise.resolve({ data: {}, error: null }); },
      signUp: function () { return Promise.resolve({ data: { session: null }, error: null }); },
      signOut: function () { location.reload(); return new Promise(function () { /* siden lastes på nytt */ }); },
      resetPasswordForEmail: function () { return Promise.resolve({ error: null }); },
      updateUser: function () { return Promise.resolve({ error: null }); }
    },
    from: Q,
    rpc: function (name, args) {
      lateSeed();
      if (name === 'tasks_for_day') {
        var d = pd(args.p_day), rows = T.tasks.filter(function (t) { return t.active && dueOn(t.recurrence, d); }).map(function (t) {
          var r = T.task_runs.filter(function (x) { return x.task_id === t.id && x.due_date === args.p_day; })[0], a = T.areas.filter(function (x) { return x.id === t.area_id; })[0];
          return { task_id: t.id, area_id: t.area_id, area_name: a ? a.name : null, domain: t.domain, routine: t.routine, title: t.title, hint: t.hint, kind: t.kind, unit: t.unit, min_value: t.min_value, max_value: t.max_value, sort: t.sort,
            run_id: r ? r.id : null, run_status: r ? r.status : null, run_value: r ? r.value : null, run_note: r ? r.note : null, run_skip_reason: r ? r.skip_reason : null, run_done_by: r ? r.done_by : null, run_done_at: r ? r.done_at : null, run_photo_path: null };
        });
        return Promise.resolve({ data: rows, error: null });
      }
      if (name === 'close_missed') {
        var ys = ymd(addDays(TODAY, -1)), y = addDays(TODAY, -1), n = 0;
        T.tasks.filter(function (t) { return t.active && (t.recurrence.freq || 'daily') === 'daily' && dueOn(t.recurrence, y) && !T.task_runs.some(function (x) { return x.task_id === t.id && x.due_date === ys; }); }).forEach(function (t) { T.task_runs.push({ id: uid(), org_id: ORG, task_id: t.id, due_date: ys, status: 'missed', done_by: null, done_at: new Date().toISOString() }); n++; });
        return Promise.resolve({ data: n, error: null });
      }
      if (name === 'set_my_work_areas') { var m = T.members.filter(function (x) { return x.user_id === ME.id; })[0]; m.work_areas = args.p_areas; return Promise.resolve({ error: null }); }
      if (name === 'create_invite') return Promise.resolve({ data: 'DEMO123456', error: null });
      if (name === 'set_my_name') { T.members[0].display_name = args.p_name; return Promise.resolve({ error: null }); }
      return Promise.resolve({ data: null, error: { message: 'Ikke tilgjengelig i demoen' } });
    },
    storage: { from: function () { return { upload: function () { return Promise.resolve({ error: null }); }, createSignedUrl: function () { return Promise.resolve({ error: { message: 'Bilder er ikke med i demoen' } }); } }; } }
  };
  window.supabase = { createClient: function () { return client; } };

  /* Innloggingstjenesten for pinkode: samme oppførsel, bare i minnet */
  var realFetch = window.fetch.bind(window);
  window.fetch = function (url, opts) {
    if (String(url).indexOf('/functions/v1/staff-auth') < 0) return realFetch(url, opts);
    var b = {}; try { b = JSON.parse(opts.body); } catch (e) { /* tomt */ }
    function res(o, st) { return Promise.resolve(new Response(JSON.stringify(o), { status: st || 200, headers: { 'Content-Type': 'application/json' } })); }
    var staff = T.members.filter(function (m) { return m.role !== 'leder'; }).map(function (m) { return { id: m.user_id, name: m.display_name }; }).sort(function (a, c) { return a.name.localeCompare(c.name, 'nb'); });
    if (b.action === 'staff_list') return res({ staff: staff });
    if (b.action === 'code') return res({ code: 'DEMO0000000000' });
    if (b.action === 'create_staff') { var id = uid(); T.members.push({ org_id: ORG, user_id: id, role: 'ansatt', display_name: String(b.name || '').trim() || 'Ny ansatt', work_areas: [], created_at: new Date().toISOString() }); return res({ id: id, name: b.name }); }
    if (b.action === 'set_pin') return res({ ok: true });
    if (b.action === 'remove_staff') { T.members = T.members.filter(function (m) { return m.user_id !== b.user_id; }); return res({ ok: true }); }
    return res({ error: 'Ikke tilgjengelig i demoen' }, 400);
  };
  window.__T = T;
})();
