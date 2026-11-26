/* Veiledning i demoen: en halvtransparent infoboks første gang du åpner en del av appen. Bare i minnet. */
(function () {
  var seen = {}, timer = null, TXT = {
    today: ['I dag', 'Her ser du dagens rutiner for kjøkken, bar og kafé. Trykk på en oppgave for å kvittere. Temperaturmålinger skriver du inn, og verdier utenfor grensen blir til avvik. Velg «Jeg dekker i dag» for å se bare ditt område.'],
    'mod:rut': ['Planlegging', 'Her samler du faste rutiner og sjekklister, og lager egne. Hver gjennomføring havner i en egen logg.'],
    'mod:mat': ['IK-mat', 'Internkontroll for mat: faresanalyse, kritiske punkter og rutiner. Planen i demoen er bygd for en kafé, og du kan åpne hvert punkt.'],
    'mod:alkohol': ['IK-alkohol', 'Internkontroll for alkohol: skjenketider, aldersgrenser og hva du gjør ved tvil. Åpningstidene dine brukes til å vise lovpålagte stengetider.'],
    'mod:hms': ['HMS', 'Brannvern, vernerunder og opplæring. Det du registrerer her kan vises frem ved tilsyn.'],
    dev: ['Avvik', 'Alt som har gått galt eller vært utenfor grensen. Her er ett åpent, ett under arbeid og ett lukket avvik. Åpne ett for å føre årsak og tiltak.'],
    learn: ['Opplæring', 'Kunnskap delt i bolker etter arbeidsområde. Les, ta quizen med fire spørsmål og signer for å loggføre opplæringen.']
  };
  function key() {
    var on = document.querySelector('.screen.on'); if (!on) return null;
    var n = on.id.replace('s-', '');
    if (n === 'mod' || n === 'sub') { var b = document.querySelector('#mods button[aria-current="true"]'); return b ? 'mod:' + b.dataset.mod : null; }
    return TXT[n] ? n : null;
  }
  function show(k) {
    var t = TXT[k]; seen[k] = true;
    var o = document.createElement('div'); o.id = 'dguide';
    o.style.cssText = 'position:fixed;inset:0;z-index:9998;background:rgba(20,20,15,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:inherit';
    var c = document.createElement('div'); c.style.cssText = 'background:rgba(255,255,255,.96);border-radius:14px;padding:20px;max-width:340px;width:100%;box-shadow:0 6px 30px rgba(0,0,0,.25)';
    var h = document.createElement('h2'); h.textContent = t[0]; h.style.cssText = 'margin:0 0 8px;font-size:1.2rem';
    var p = document.createElement('p'); p.textContent = t[1]; p.style.cssText = 'margin:0 0 14px;line-height:1.45';
    var b = document.createElement('button'); b.textContent = 'Forstått'; b.style.cssText = 'width:100%;padding:11px;font-size:1rem;border:0;border-radius:8px;background:#2f6b3a;color:#fff;font-weight:600';
    c.appendChild(h); c.appendChild(p); c.appendChild(b); o.appendChild(c);
    function close() { o.remove(); } b.onclick = close; o.onclick = function (e) { if (e.target === o) close(); };
    document.body.appendChild(o);
  }
  function check() {
    if (document.getElementById('dg') || document.getElementById('dguide') || document.querySelector('dialog[open]')) return;
    var k = key(); if (k && !seen[k]) show(k);
  }
  new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(check, 250); })
    .observe(document.documentElement, { attributes: true, subtree: true, childList: true, attributeFilter: ['class', 'aria-current'] });
})();
