import re
L=open('_src/site_template.html',encoding='utf-8').read().split('\n')
def seg(a,b): return '\n'.join(L[a-1:b])
full='\n'.join(L)
head_css=seg(6,212)   # <style>..</style>
head_css=head_css.replace('.chapter h2::before','@@B@@').replace('.chapter h2','.chapter h1,.chapter h2').replace('@@B@@','.chapter h1::before,.chapter h2::before').replace('h2{font-weight:800;font-size:clamp(32px,6vw,44px);margin-top:6px}','h1,h2{font-weight:800;font-size:clamp(32px,6vw,44px);margin-top:6px}')
extra=r'''
/* ---- toppmeny ---- */
.topbar{position:sticky;top:0;z-index:50;background:var(--bg);border-bottom:1px solid var(--line)}
.topbar .wrap{display:flex;align-items:center;justify-content:space-between;height:60px}
.brand{font-family:var(--display);font-weight:800;text-transform:uppercase;letter-spacing:.04em;font-size:26px;color:var(--fg);text-decoration:none}
.burger{width:46px;height:46px;border-radius:10px;border:1.5px solid var(--fg);background:transparent;cursor:pointer;display:grid;place-content:center;gap:4px;padding:0}
.burger i{display:block;width:30px;height:5px;transition:transform .25s}
.burger i:nth-child(1){background:#E8B84B}.burger i:nth-child(2){background:#C8376A}.burger i:nth-child(3){background:#5C7A39}.burger i:nth-child(4){background:#1B4F7A}
.burger[aria-expanded="true"]{grid-auto-flow:column;gap:4px}
.burger[aria-expanded="true"] i{width:5px;height:30px}
.menu-panel{position:absolute;left:0;right:0;top:100%;background:var(--bg);border-bottom:1px solid var(--line);box-shadow:0 18px 30px rgba(0,0,0,.08);display:none}
.menu-panel.open{display:block}
.menu-panel ul{list-style:none;margin:0 auto;padding:10px max(16px,env(safe-area-inset-left,0px)) 18px;max-width:960px}
.menu-panel a{display:block;padding:13px 4px;font-family:var(--display);font-weight:800;text-transform:uppercase;font-size:28px;letter-spacing:.02em;color:var(--fg);text-decoration:none;border-bottom:1px solid var(--line)}
.menu-panel li:last-child a{border-bottom:0}
.menu-panel a[aria-current="page"]{text-decoration:underline;text-decoration-thickness:5px;text-decoration-color:var(--green);text-underline-offset:6px}
.menu-panel a:hover{color:var(--green)}
.menu-panel a:focus-visible,.burger:focus-visible,.brand:focus-visible{outline:3px solid var(--blue);outline-offset:3px}
@media (prefers-reduced-motion:reduce){.burger i{transition:none}}
.hero{padding-top:36px}
.sitefoot{border-top:1px solid var(--line);padding-block:30px;color:var(--muted);font-size:15px}
.sitefoot .trust-row{margin:0 0 22px;justify-content:flex-start}
.sitefoot .wrap>div{display:flex;gap:8px 24px;flex-wrap:wrap;justify-content:space-between}
.teaser>*{max-width:38em}.sitefoot a{color:var(--fg)}
.teaser .more{margin-top:14px}
.prodgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:18px;margin-top:28px}
.prod{background:var(--card);border:1px solid var(--line);border-top:8px solid var(--c);border-radius:12px;padding:22px;display:flex;flex-direction:column;gap:10px}
.prod h2{font-size:30px;margin:0}
.prod p{color:var(--muted);font-size:17px}
.prod .tag{font-family:var(--display);font-weight:600;text-transform:uppercase;letter-spacing:.1em;font-size:14px;color:var(--muted)}
.prod .ch-btns{margin-top:auto;padding-top:10px}
.prod .ch-btn{background:var(--c);color:var(--ink);border-color:var(--c)}
.prod .ch-btn.alt{background:transparent;color:var(--fg);border-color:var(--fg)}
.pagehead{padding-block:44px 0}
.pagehead h1{font-size:clamp(40px,8vw,72px);line-height:1}

.chapter h1::before,.chapter h2::before{display:none}
.brand{display:inline-flex;align-items:center}
.txt{flex-direction:row-reverse;align-items:stretch;gap:clamp(12px,2.6vw,22px)}
.tw{display:flex;flex-direction:column;align-items:flex-start}
.sqs{font-size:clamp(56px,16vw,84px);margin-top:.183em;margin-bottom:.1em;display:flex;flex-direction:column;gap:clamp(4px,.9vw,7px);width:clamp(30px,6vw,46px)}
.sqs i{flex:1;display:block}
.sqs i:nth-child(1){background:#E8B84B}.sqs i:nth-child(2){background:#C8376A}.sqs i:nth-child(3){background:#5C7A39}.sqs i:nth-child(4){background:#1B4F7A}
.card h3:has(.ci){display:flex;align-items:center;gap:10px}
.ci{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:50%;font-size:18px;line-height:1;flex:none;font-family:Barlow,Arial,sans-serif;font-weight:700}
.ci-l{color:#2E7D32;background:#E6F2E7}.ci-r{color:#1B4F7A;background:#E4EDF5}.ci-s{color:#C8376A;background:#FBE9EF}.ci-t{color:#1a1a1a;background:#EFEBE0}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .ci-l{background:#233a25;color:#8fd194}:root:not([data-theme="light"]) .ci-r{background:#1d2f40;color:#8fb8dd}:root:not([data-theme="light"]) .ci-s{background:#40202b;color:#f08aa9}:root:not([data-theme="light"]) .ci-t{background:#34302a;color:#f3efe4}}
.word{font-size:clamp(34px,11.5vw,84px)}
.txt{flex-direction:column;align-items:flex-start}
.bartlogo{width:56px;height:auto;margin-right:10px;flex:none}
.pg-barn #bart{animation:none;fill:#E8B84B}.pg-kafe #bart{animation:none;fill:#5C7A39}.pg-prove #bart{animation:none;fill:#C8376A}
@media (prefers-reduced-motion:reduce){.pg-barn #bart,.pg-kafe #bart,.pg-prove #bart{animation:none}}
.hero{position:relative;isolation:isolate}
html,body{overflow-x:clip}
.hero::before{content:"";position:absolute;inset:-8% -25% -30%;z-index:-1;pointer-events:none;background:radial-gradient(38% 46% at 18% 30%,rgba(233,208,154,.55),transparent 70%),radial-gradient(34% 42% at 84% 22%,rgba(169,75,101,.22),transparent 70%),radial-gradient(34% 34% at 62% 66%,rgba(102,121,77,.22),transparent 70%)}
.showcase{max-width:960px;margin:44px auto 0;padding:0 16px 70px;overflow-x:clip}
.showcase h2{text-align:center;font-size:clamp(28px,4.5vw,40px);margin-bottom:6px}
.showcase p.lede{text-align:center;color:var(--muted);margin-bottom:28px}
.fan{display:flex;justify-content:center;align-items:flex-end;padding:14px 0 10px}
.fan a{display:block;flex:0 1 29%;max-width:260px;margin:0 -1%;border-radius:22px;background:var(--card);border:1px solid var(--line);border-top:8px solid var(--c);padding:8px;box-shadow:0 16px 34px rgba(0,0,0,.14);transition:transform .25s}
.fan a:nth-child(1){transform:rotate(-5deg) translateY(14px)}
.fan a:nth-child(2){transform:translateY(-8px);z-index:2}
.fan a:nth-child(3){transform:rotate(5deg) translateY(14px)}
.fan a:hover,.fan a:focus-visible{transform:translateY(-14px) rotate(0);z-index:3}
.fan img{display:block;width:100%;height:auto;aspect-ratio:3/4.3;object-fit:cover;object-position:top;border-radius:14px}
.fan span{display:block;text-align:center;font-family:var(--display);font-weight:800;text-transform:uppercase;letter-spacing:.03em;font-size:18px;color:var(--fg);padding:8px 0 4px}
@media (max-width:560px){.showcase{padding-inline:6px}.fan a{flex-basis:34%;padding:5px;border-radius:14px;margin:0 -3%}.fan span{font-size:13px}}
@media (prefers-reduced-motion:reduce){.fan a{transition:none}}
.tile .ic{display:block;width:34px;height:34px;margin-bottom:10px;stroke:var(--fg);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
'''
head_css=head_css.replace('</style>',extra+'</style>')

PAGES=[('index.html','Forside'),('produkter.html','Produkter'),('barnehage.html','For barnehage'),('horeca.html','For horeca'),('quiz.html','quizzMe'),('om.html','Om oss')]
def topbar(cur):
    items=''.join('<li><a href="%s"%s>%s</a></li>'%(h,' aria-current="page"' if h==cur else '',t) for h,t in PAGES)
    return '''<div class="topbar"><div class="wrap"><a class="brand" href="index.html"><svg class="bartlogo" viewBox="0 0 100 38" aria-hidden="true"><defs><path id="half" d="M50,10 C57,3 68,4 75,10 C82,15 90,14 92,6 C93,2 99,3 98,10 C97,27 84,37 71,33 C63,30 56,27 50,19 Z"/><mask id="bite" maskUnits="userSpaceOnUse" x="-5" y="0" width="110" height="45"><rect x="-5" width="110" height="45" fill="#fff"/><circle cx="3" cy="33" r="12.5"/><circle cx="4.96" cy="20.65" r="4.1"/><circle cx="9.99" cy="22.64" r="4.1"/><circle cx="13.71" cy="26.56" r="4.1"/><circle cx="15.43" cy="31.69" r="4.1"/></mask></defs><g id="bart"><use href="#half"/><g mask="url(#bite)"><use href="#half" transform="translate(100 0) scale(-1 1)"/></g></g></svg><span>spisbart.no</span></a>
<button class="burger" id="burger" type="button" aria-label="Meny" aria-expanded="false" aria-controls="menu"><i></i><i></i><i></i><i></i></button></div>
<nav class="menu-panel" id="menu" aria-label="Hovedmeny"><ul>%s</ul></nav></div>
<noscript><style>.menu-panel{display:block;position:static}.burger{display:none}</style></noscript>'''%items
FOOT='''<footer class="sitefoot"><div class="wrap">
<ul class="trust-row"><li>Data lagres i EU</li><li>Ingen sporingsinfokapsler</li><li>Databehandleravtale før bruk</li><li>Norsk virksomhet, org.nr. 925 412 309</li></ul>
<div><span>© 2026 spisbart.no</span><span><a href="personvern.html">Personvern</a> · <a href="vilkar.html">Vilkår</a> · <a href="mailto:post@spisbart.no">post@spisbart.no</a></span></div></div></footer>'''
MENU_JS='''<script>
(function(){var b=document.getElementById('burger'),m=document.getElementById('menu');if(!b)return;
function set(o){m.classList.toggle('open',o);b.setAttribute('aria-expanded',o?'true':'false')}
b.addEventListener('click',function(e){e.stopPropagation();set(!m.classList.contains('open'))});
document.addEventListener('click',function(e){if(!m.contains(e.target))set(false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){set(false);b.focus()}});})();
</script>'''
fit_js=seg(402,417)+'\n'  # fit() + copy handler lines
fit_js=fit_js.replace("if(sw>0)s.style.fontSize=(fs0*ww/sw)+'px';","if(sw>0)s.style.fontSize=(fs0*ww/sw)+'px';\n  var q=document.querySelector('.sqs');if(q){q.style.marginTop=(0.183*fw)+'px';q.style.marginBottom=(0.41*parseFloat(getComputedStyle(s).fontSize))+'px'}")
fit_only=re.sub(r"document.getElementById\('copy'\).*?\}\);\n",'',fit_js,flags=re.S)
copy_only="document.getElementById('copy').addEventListener('click',function(){\n  var b=this,t=document.getElementById('addr');\n  function ok(){b.textContent='Kopiert';setTimeout(function(){b.textContent='Kopier'},1800)}\n  function sel(){var r=document.createRange();r.selectNodeContents(t);var x=getSelection();x.removeAllRanges();x.addRange(r)}\n  try{navigator.clipboard.writeText(t.textContent).then(ok,sel)}catch(e){sel()}\n});\n"
track=seg(419,430)

def page(fn,title,desc,body,scripts='',cls=''):
    cur=fn
    html='''<!doctype html>
<html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>%s</title><meta name="description" content="%s">
<link rel="preload" href="fonts/barlow-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="fonts/fonts.css">
%s
</head><body class="%s">
%s
<main>
%s
</main>
%s
%s
%s
%s
</body></html>
'''%(title,desc,head_css,cls,topbar(cur),body,FOOT,MENU_JS,scripts,track)
    open(fn,'w',encoding='utf-8').write(html)

# --- bygg biter fra gammel side
hero=seg(215,233)
hero=hero.replace('id="w">Spisbart<','id="w">spisbart.no<').replace('Verktøy for kjøkken og barnehager som vil vite','Til kjøkken og barnehager som vil vite').replace('Apper for matkontroll','Verktøy for matkontroll').replace('<div class="txt"><div class="word" id="w">Spisbart</div><div class="sub" id="s">Verktøy for matkontroll</div></div>','<div class="txt"><div class="tw"><div class="word" id="w">Spisbart</div><div class="sub" id="s">Verktøy for matkontroll</div></div><div class="sqs" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>')
hero=re.sub(r'\s*<svg viewBox="0 0 100 38".*?</svg>','',hero,flags=re.S)
hero=re.sub(r'<div class="sqs".*?</div>','',hero,flags=re.S)
hero=re.sub(r'\s*<div class="hero-cta">.*?</div>','',hero,flags=re.S)
hero=re.sub(r'\s*<ul class="trust-row">.*?</ul>','',hero,flags=re.S)
barn=seg(241,268); kafe=seg(270,301); prove=seg(303,352)
trygg=seg(354,366); supplier=seg(368,373); om=seg(375,388); sifra=seg(390,396)
def h1(s): return s.replace('<h2>','<h1>',1).replace('</h2>','</h1>',1)
def nosticky(s): return s
# fjern hovedoverskrift-duplikat: kapitlene beholder sin h2 -> h1
barn=h1(barn); kafe=h1(kafe); prove=h1(prove)

tiles='''<nav class="chapters" aria-label="Velg område">
  <a class="tile t-barn" href="barnehage.html"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7c-3-3-8-1-8 4 0 5 4 9 8 9s8-4 8-9c0-5-5-7-8-4z"/><path d="M12 7c0-2 1-4 3-5"/></svg><strong>For barnehage</strong><span>Enkel planlegging, gode oppskrifter og automatisk bestilling til barnehagekjøkkenet</span></a>
  <a class="tile t-kafe" href="horeca.html"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14c-3 0-4-4-1.5-5.5C6 5 10 4 12 6c2-2 6-1 6.5 2.5C21 10 20 14 17 14z"/><path d="M7 14v6h10v-6"/></svg><strong>For horeca</strong><span>En innholdsrik og spesialisert kalkulator for kjøkkenet</span></a>
  <a class="tile t-prove" href="quiz.html"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 9.5c0-3 6-3 6 0 0 2-3 2-3 4"/><path d="M12 17h.01"/></svg><strong>quizzMe</strong><span>Quizz deg smartere</span></a>
</nav>'''
showcase='''<section class="showcase">
  <h2>Se appene i bruk</h2>
  <p class="lede">Trykk på et bilde for å lese mer.</p>
  <div class="fan">
    <a class="t-barn" href="barnehage.html"><img src="bilder/mobil.webp" width="760" height="1088" alt="Bare Barnemat på mobil: ukevelger og varsel om allergier" loading="lazy"><span>Barnehage</span></a>
    <a class="t-kafe" href="horeca.html"><img src="bilder/automat-oversikt.webp" width="520" height="893" alt="Auto·Mat på mobil: margin per rett" loading="lazy"><span>Horeca</span></a>
    <a class="t-prove" href="quiz.html"><img src="bilder/quizz-sporsmal.webp" width="520" height="900" alt="QuizzMeg: ett spørsmål om gangen" loading="lazy"><span>quizzMe</span></a>
  </div>
</section>'''

teaser='''<section class="band">
  <div class="wrap teaser">
    <h2>Om spisbart.no</h2>
    <p class="lead2">Spisbart lager spesialverktøy for kjøkken, barnehager og de som tar skjenke- og etablererprøven. Vi er en norsk virksomhet og svarer selv på e-post.</p>
    <a class="more" href="om.html">Les mer om oss og pris</a>
  </div>
</section>'''
page('index.html','spisbart.no – Verktøy for matkontroll','Spisbart lager spesialverktøy for matkontroll og kunnskapsprøver. Bare Barnemat, Auto·Mat og QuizzMeg.',hero+'\n'+tiles+'\n'+showcase+'\n'+teaser,'<script>\n'+fit_only+'</script>')

def prod(c,tag,name,desc,demo,page_,mail):
    return '''<article class="prod %s"><span class="tag">%s</span><h2>%s</h2><p>%s</p><div class="ch-btns"><a class="ch-btn" href="%s">Prøv demo</a><a class="ch-btn alt" href="%s">Les mer</a><a class="ch-btn alt" href="mailto:post@spisbart.no?subject=%s">Kjøp</a></div></article>'''%(c,tag,name,desc,demo,page_,mail)
prods=''.join([
 prod('ch-barn','For barnehage','Bare Barnemat','Kalenderen der du planlegger månedens måltider. Du får varsel når en rett ikke passer for et barn med allergi eller spesialkost, og ser hva måneden koster.','barnemat/?demo=1','barnehage.html','Kj%C3%B8p%20Bare%20Barnemat'),
 prod('ch-kafe','For horeca','Auto·Mat','Regner ut varekost, påslag og margin for hver rett. Bestilling, svinn og allergener ligger i samme app, for proffkjøkken, kafeer og serveringssteder.','automat/','horeca.html','Kj%C3%B8p%20Auto%C2%B7Mat'),
 prod('ch-prove','quizzMe','QuizzMeg Skjenkeprøven','Over 100 spørsmål fordelt på seks temaer: salg, bevilling, skjenketider, kunde, internkontroll og reklame.','skjenkeprove/','quiz.html#skjenke','Kj%C3%B8p%20QuizzMeg%20Skjenkepr%C3%B8ven'),
 prod('ch-prove','quizzMe','QuizzMeg Etablererprøven','Nesten 150 spørsmål fordelt på 15 temaer: serveringsloven, daglig leder, mva og skatt, regnskap og kassasystem, arbeidsmiljø, konkurs og alkoholloven.','etablerer/','quiz.html#etablerer','Kj%C3%B8p%20QuizzMeg%20Etablererpr%C3%B8ven'),
])
pbody='<section class="pagehead"><div class="wrap"><h1>Produkter</h1><p class="lead2">Fire apper, og alle kan prøves som demo uten innlogging.</p><div class="prodgrid">%s</div></div></section>'%prods
page('produkter.html','Produkter – spisbart.no','Bare Barnemat, Auto·Mat og QuizzMeg: apper for barnehage, kjøkken og kunnskapsprøver.',pbody)
page('barnehage.html','For barnehage – Bare Barnemat','Bare Barnemat: planlegg månedens måltider, få varsel om allergier og se hva måneden koster.',barn+'\n'+trygg,'','pg-barn')
page('horeca.html','For horeca – Auto·Mat','Auto·Mat: varekost, svinn, margin og allergenkort for kjøkken, kafeer og serveringssteder.',kafe+'\n'+supplier,'','pg-kafe')
quiz=prove.replace('<div class="sub-app">','<div class="sub-app" id="skjenke">',1)
i=quiz.index('<div class="sub-app">'); quiz=quiz[:i]+'<div class="sub-app" id="etablerer">'+quiz[i+len('<div class="sub-app">'):]
page('quiz.html','Quiz deg til kunnskap – Skjenkeprøven og Etablererprøven','QuizzMeg: øv til skjenkeprøven og etablererprøven med pensum, quiz og eksamen.',quiz,'','pg-prove')
page('om.html','Om oss og pris – spisbart.no','Spisbart drives av MONARK JOHANSEN. Kontakt, pris og vilkår.',om+'\n'+sifra,'<script>\n'+copy_only+'</script>')
