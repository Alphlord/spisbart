/* ── LYDBOK: leser pensum høyt med nettleserens egen talesyntese (Web Speech API) ── */
(function(){
  var syn=window.speechSynthesis,bar=document.getElementById('tts-bar');
  if(!syn||!window.SpeechSynthesisUtterance){if(bar)bar.style.display='none';return;}
  var KEY=(location.pathname.indexOf('etablerer')>-1?'ep':'qs')+'-tts';
  var el=function(i){return document.getElementById(i)};
  var items=[],idx=0,playing=false,rate=1,auto=true,voice=null,tok=0;
  try{var sv=JSON.parse(localStorage.getItem(KEY)||'{}');if(sv.rate)rate=sv.rate;if(sv.auto===false)auto=false;}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify({rate:rate,auto:auto}))}catch(e){}}
  function pick(){var v=syn.getVoices()||[];voice=null;
    for(var i=0;i<v.length;i++){if(/^(nb|no)([-_]|$)/i.test(v[i].lang)){voice=v[i];break;}}
    if(!voice)for(var j=0;j<v.length;j++){if(/^nn/i.test(v[j].lang)){voice=v[j];break;}}
    status();}
  if(syn.addEventListener)syn.addEventListener('voiceschanged',pick);pick();
  function textOf(n){
    if(n.classList.contains('lov-para')){var a=n.querySelector('.lov-para-num'),b=n.querySelector('.lov-para-title'),c=n.querySelector('.lov-para-body');
      return (a?a.textContent:'')+'. '+(b?b.textContent:'')+'. '+(c?c.textContent:'');}
    if(n.classList.contains('lov-header'))return 'Alkoholloven, relevante paragrafer.';
    return n.textContent;}
  function norm(t){return t
    .replace(/§\s*(\d+)\s*[-–]\s*(\d+[a-z]?)/g,'paragraf $1 $2').replace(/§\s*/g,'paragraf ')
    .replace(/\bkl\.\s*/gi,'klokken ')
    .replace(/(\d{1,2})[.:]00\b/g,'$1').replace(/(\d{1,2})[.:](\d{2})\b/g,'$1 $2')
    .replace(/(\d)\s*[–-]\s*(\d)/g,'$1 til $2').replace(/%/g,' prosent')
    .replace(/(\d)\s*cl\b/gi,'$1 centiliter').replace(/\bf\.eks\./gi,'for eksempel').replace(/\bjf\./gi,'jamfør')
    .replace(/\bosv\./gi,'og så videre').replace(/\bmva\b/gi,'merverdiavgift').replace(/\bm\/\s*/g,'med ')
    .replace(/[→↺✓📖·]/g,' ').replace(/\s+/g,' ').trim();}
  function chunks(t){var s=t.split(/(?<=[.!?:;])\s+/),out=[],cur='';
    s.forEach(function(x){if((cur+' '+x).length>200&&cur){out.push(cur);cur=x;}else cur=cur?cur+' '+x:x;});
    if(cur)out.push(cur);return out;}
  function collect(){var body=el('read-body');items=[];idx=0;if(!body)return;
    body.querySelectorAll('.psec-h,.pp,.lov-header,.lov-para').forEach(function(n){var t=norm(textOf(n));if(t)items.push({el:n,t:t});});}
  function mark(){document.querySelectorAll('.tts-on').forEach(function(n){n.classList.remove('tts-on')});
    var it=items[idx];if(it){it.el.classList.add('tts-on');try{it.el.scrollIntoView({block:'center',behavior:'smooth'})}catch(e){}}}
  function status(msg){var s=el('tts-st');if(!s)return;
    if(msg){s.textContent=msg;return;}
    var v=syn.getVoices()||[];
    if(v.length&&!voice)s.textContent='Fant ingen norsk stemme på enheten. Legg til norsk tale i innstillingene.';
    else s.textContent=items.length?('Avsnitt '+(idx+1)+' av '+items.length):'';}
  function ui(){var b=el('tts-play');if(!b)return;b.setAttribute('aria-label',playing?'Pause':'Spill av');
    el('tts-ico').textContent=playing?'⏸':'▶';el('tts-lbl').textContent=playing?'Pause':(items.length&&idx>0?'Fortsett':'Lytt');}
  function stop(reset){tok++;playing=false;try{syn.cancel()}catch(e){}
    document.querySelectorAll('.tts-on').forEach(function(n){n.classList.remove('tts-on')});
    if(reset){items=[];idx=0;}ui();status();}
  function nextTheme(){
    var keys=(typeof PENSUM!=='undefined')?Object.keys(PENSUM):[],i=keys.indexOf(window.cat),n=keys[i+1];
    if(!auto||!n)return false;
    var lock=null;try{lock=localStorage.getItem('spisbart-demo-kat')}catch(e){}
    if(lock&&lock!==n){status('Resten av temaene får du i fullversjonen.');return false;}
    window.openRead(n);setTimeout(function(){collect();if(items.length){playing=true;speak();}},350);return true;}
  function speak(){
    if(!playing)return;
    if(idx>=items.length){if(!nextTheme()){stop(false);idx=0;status('Ferdig. Trykk Lytt for å høre igjen.');}return;}
    var my=++tok,parts=chunks(items[idx].t),k=0;mark();status();ui();
    try{syn.cancel()}catch(e){}
    (function go(){
      if(my!==tok||!playing)return;
      if(k>=parts.length){idx++;speak();return;}
      var u=new SpeechSynthesisUtterance(parts[k++]);u.lang=voice?voice.lang:'nb-NO';if(voice)u.voice=voice;u.rate=rate;
      u.onend=go;u.onerror=function(e){if(my===tok&&e&&e.error!=='interrupted'&&e.error!=='canceled'){stop(false);status('Kunne ikke spille av lyden på denne enheten.');}};
      syn.speak(u);})();}
  function play(){
    if(!items.length||!document.body.contains(items[0].el))collect();
    if(!items.length)return;
    playing=true;speak();}
  function pause(){tok++;playing=false;try{syn.cancel()}catch(e){}ui();}
  function jump(d){if(!items.length||!document.body.contains(items[0].el))collect();
    idx=Math.max(0,Math.min(items.length-1,idx+d));if(playing){speak();}else{mark();status();ui();}}
  var pl=el('tts-play');if(!pl)return;
  pl.addEventListener('click',function(){playing?pause():play()});
  el('tts-prev').addEventListener('click',function(){jump(-1)});
  el('tts-next').addEventListener('click',function(){jump(1)});
  var r=el('tts-rate'),a=el('tts-auto');
  r.value=String(rate);if(r.value!==String(rate))r.value='1';
  a.checked=auto;
  r.addEventListener('change',function(){rate=parseFloat(r.value)||1;save();if(playing)speak();});
  a.addEventListener('change',function(){auto=a.checked;save();});
  var nt=window.navTo;window.navTo=function(p){if(p!=='read')stop(true);return nt.apply(this,arguments);};
  window.addEventListener('pagehide',function(){try{syn.cancel()}catch(e){}});
  ui();
})();
