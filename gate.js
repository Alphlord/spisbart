/* Enkel forhåndsport for spisbart.no før lansering. Ligger i nettleseren og er ingen ekte sikkerhet. */
(function () {
  var K = 'sb-gate';
  try { if (localStorage.getItem(K) === '1') return; } catch (e) { /* ingen lagring */ }
  var st = document.createElement('style');
  st.textContent = 'html.sbg body>*:not(#sbg){display:none!important}#sbg{position:fixed;inset:0;z-index:2147483647;background:#faf7f0;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,sans-serif;color:#1c1a14}#sbg form{background:#fff;border-radius:14px;padding:24px;max-width:340px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,.12)}#sbg h1{margin:0 0 4px;font-size:1.3rem}#sbg p{margin:0 0 12px;color:#555;font-size:.92rem}#sbg label{display:block;font-size:.85rem;margin:10px 0 4px}#sbg input{width:100%;box-sizing:border-box;padding:11px;font-size:1rem;border:1px solid #bbb;border-radius:8px}#sbg button{margin-top:16px;width:100%;padding:12px;font-size:1rem;border:0;border-radius:8px;background:#2f6b3a;color:#fff;font-weight:600}#sbg .e{color:#b00020;font-size:.85rem;min-height:1.2em;margin-top:8px}';
  document.head.appendChild(st);
  document.documentElement.classList.add('sbg');
  function build() {
    var d = document.createElement('div'); d.id = 'sbg';
    d.innerHTML = '<form><h1>spisbart.no</h1><p>Siden er under utvikling. Logg inn for å se den.</p><label for="sbu">Brukernavn</label><input id="sbu" autocomplete="off" autocapitalize="off"><label for="sbp">Pinkode</label><input id="sbp" type="password" inputmode="numeric" maxlength="4" autocomplete="off"><div class="e"></div><button>Logg inn</button></form>';
    d.querySelector('form').onsubmit = function (e) {
      e.preventDefault();
      if (d.querySelector('#sbu').value.trim().toLowerCase() === 'navn' && d.querySelector('#sbp').value === '1111') {
        try { localStorage.setItem(K, '1'); } catch (x) { /* ok */ }
        d.remove(); document.documentElement.classList.remove('sbg');
      } else d.querySelector('.e').textContent = 'Feil brukernavn eller pinkode.';
    };
    document.body.appendChild(d); d.querySelector('#sbu').focus();
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
