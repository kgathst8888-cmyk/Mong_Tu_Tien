
(function(){
const P={
sword:'<path d="M20 4 9.5 14.5" stroke-width="2.2"/><path d="M7 12l5 5"/><path d="M9.5 14.5 5 19"/><circle cx="4" cy="20" r="1.1"/><path d="M20 4l-.3 3.2M20 4l-3.2.3"/>',
swords:'<path d="M4 4l10 10"/><path d="M12 16l4-4"/><path d="M14 14l5 5"/><path d="M20 4 10 14"/><path d="M8 12l4 4"/><path d="M10 14l-5 5"/>',
shield:'<path d="M12 3 5 6v5.5c0 4.3 2.8 7.6 7 9.5 4.2-1.9 7-5.2 7-9.5V6z"/><path d="M12 8v8M8.5 11.5h7"/>',
burst:'<path d="M12 2.5l2 5.2 5.3-2.3-2.3 5.3 5.2 2-5.2 2 2.3 5.3-5.3-2.3-2 5.2-2-5.2-5.3 2.3 2.3-5.3-5.2-2 5.2-2-2.3-5.3 5.3 2.3z"/>',
swirl:'<path d="M3.5 9C7 3.5 15.5 3.5 18.5 9"/><path d="M20.5 15c-3.5 5.5-12 5.5-15-0"/><path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0"/>',
snow:'<path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8 20.2 7.2"/><path d="M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/>',
trident:'<path d="M12 21.5V5.5"/><path d="M5.5 3.5v4.5a6.5 6.5 0 0 0 13 0V3.5"/><path d="M12 2.5v3"/>',
arrow:'<path d="M3 21 20 4"/><path d="M20 4h-5.5M20 4v5.5"/><path d="M3 21l1-4M3 21l4-1M6.5 17.5 5 16M9.5 14.5 8 13"/>',
sparkle:'<path d="M12 3c.7 4.8 3.2 7.3 8 9-4.8 1.7-7.3 4.2-8 9-.7-4.8-3.2-7.3-8-9 4.8-1.7 7.3-4.2 8-9z"/>',
mountain:'<path d="M3 20 9 9l3 5 3-7 6 13z"/><path d="M9 9l1.5 2.5M15 7l-1 2"/>',
golem:'<path d="M6 20V10l3-5.5h6l3 5.5v10z"/><path d="M9.5 11h1.2M13.3 11h1.2M9.5 16h5"/>',
dragon:'<path d="M5 20.5c4.5 1 9.5-1 9.5-5s-7.5-2-7.5-7.5S12 3 15.5 4"/><path d="M15 4l3.2-1.5-1 3.3 3.3 1.2-3.4 1.8"/><circle cx="17" cy="5.7" r=".7" fill="currentColor" stroke="none"/>',
flame:'<path d="M12 2.5c.5 3.5 5.5 6 5.5 11.2a5.5 5.5 0 0 1-11 0c0-2.2 1-3.6 2.2-4.8.2 1.5 1 2.4 2 2.8C10.2 8.2 11 5.5 12 2.5z"/>',
meteor:'<circle cx="16" cy="8" r="3.6"/><path d="M13.5 10.5 3 21M10.5 8.5 3 14M15 13.5 10 21"/>',
bolt:'<path d="M13.5 2.5 5.5 13.5h5.5l-1 8 8-11.5h-5.5z"/>',
storm:'<path d="M7 13.5a4 4 0 0 1 .3-7.9 5.2 5.2 0 0 1 9.9 1.4 3.4 3.4 0 0 1-.6 6.5"/><path d="M12.8 10.5 9.8 16.5h4l-1.6 5 4.2-7h-3.6z"/>',
ghost:'<path d="M5.5 21V11a6.5 6.5 0 0 1 13 0v10l-2.2-2-2.1 2-2.2-2-2.2 2-2.1-2z"/><circle cx="9.5" cy="11" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="11" r="1.1" fill="currentColor" stroke="none"/>',
orb:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v5M12 15v5M4 12h5M15 12h5"/>',
wolf:'<path d="M4 3l4.5 4h7L20 3v9l-3.5 4.5L12 21l-4.5-4.5L4 12z"/><path d="M9 12l1.5 1M15 12l-1.5 1M12 21v-3"/>',
leaf:'<path d="M5 20C5 10 10 5 20 4c0 10-4 15-13 15"/><path d="M5 20 14 11"/>',
rain:'<path d="M6 3 4 10M12 3l-2 7M18 3l-2 7M9 12l-2 7M15 12l-2 7M21 12l-2 7"/>',
bow:'<path d="M5 4c8 1 14 7 15 15"/><path d="M5 4 20 19"/><path d="M3.5 20.5 14 10"/><path d="M14 10v3.5M14 10h-3.5"/>',
target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/>',
skull:'<path d="M5 11a7 7 0 0 1 14 0c0 2.5-1 3.8-2.5 4.8V19h-9v-3.2C6 14.8 5 13.5 5 11z"/><circle cx="9.3" cy="11.5" r="1.6"/><circle cx="14.7" cy="11.5" r="1.6"/><path d="M10.5 19v-2.5M13.5 19v-2.5"/>',
ninja:'<path d="M12 3c-4 0-6.5 3-6.5 7 0 2 .8 3.4 2 4.4L5 21h14l-2.5-6.6c1.2-1 2-2.4 2-4.4 0-4-2.5-7-6.5-7z"/><path d="M7.5 10h9"/>',
shadow:'<circle cx="12" cy="8" r="4"/><path d="M4.5 21c0-4.5 3-7 7.5-7s7.5 2.5 7.5 7z"/>',
clone:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6z"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14c3 0 5 1.8 5 5"/>',
blood:'<path d="M12 2.5C8 8 5.5 11 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 11 16 8 12 2.5z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
moon:'<path d="M18.5 14.5A8 8 0 1 1 9.5 5.5a6.5 6.5 0 0 0 9 9z"/>',
lock:'<rect x="5.5" y="10.5" width="13" height="10" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/><circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none"/>',
portal:'<circle cx="12" cy="12" r="9" stroke-dasharray="3.2 2.2"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/>',
door:'<path d="M6 21V4.5L16 3v18"/><path d="M3.5 21h17"/><circle cx="13" cy="12" r=".9" fill="currentColor" stroke="none"/><path d="M19 9l2.5 3L19 15"/>',
gourd:'<path d="M12 2.5v2.2"/><path d="M9.5 8.2c0-2.2 1-3.5 2.5-3.5s2.5 1.3 2.5 3.5c3 1 4.8 3.4 4.8 6.6 0 3.6-3 6.2-7.3 6.2s-7.3-2.6-7.3-6.2c0-3.2 1.8-5.6 4.8-6.6z"/><path d="M9.5 8.2h5M8 14.5c2.5 1 5.5 1 8 0"/>',
pagoda:'<path d="M12 2v2"/><path d="M8.5 8 12 4l3.5 4M5.5 8h13"/><path d="M7.5 13 12 9l4.5 4M4.5 13h15"/><path d="M6.5 20v-7M17.5 20v-7M3.5 20h17M10 20v-3.5h4V20"/>',
map:'<path d="M4 6l5-2 6 2 5-2v14l-5 2-6-2-5 2z"/><path d="M9 4v14M15 6v14"/>',
taiji:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18 4.5 4.5 0 0 1 0-9 4.5 4.5 0 0 0 0-9z" fill="currentColor"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="16.5" r="1.2" fill="#140d0a" stroke="none"/>'};
const M={'🗡':['sword','#e8ecf4'],'⚔':['swords','#e8ecf4'],'🛡':['shield','#ffd27a'],'💥':['burst','#ffb347'],'🌀':['swirl','#9ff0d0'],'🌪':['swirl','#a8f0e0'],'❄':['snow','#9fe3ff'],'🧊':['snow','#b8ecff'],'🔱':['trident','#cfe3ff'],'➳':['arrow','#e8d28a'],'💫':['sparkle','#fff0a0'],'🌋':['mountain','#e0a860'],'🗿':['golem','#d6b57a'],'🐉':['dragon','#ffc04a'],'🔥':['flame','#ff8a50'],'☄':['meteor','#ff9a60'],'⚡':['bolt','#ffe85a'],'🌩':['storm','#ffe85a'],'👻':['ghost','#c4a8ff'],'🔮':['orb','#c9a0ff'],'🐺':['wolf','#b8c8e0'],'🌿':['leaf','#86e89a'],'🍃':['leaf','#9ff0b0'],'🌧':['rain','#8fd0ff'],'🏹':['bow','#e0c070'],'🎯':['target','#ff8f7a'],'☠':['skull','#d8d0e0'],'🥷':['ninja','#b8b0e0'],'👤':['shadow','#a8b0d8'],'👥':['clone','#a8b0d8'],'🩸':['blood','#ff5a6c'],'🌑':['moon','#b8a8ff'],'🔒':['lock','#a89870'],'🕳':['portal','#ff8a6a'],'🚪':['door','#ffb89a'],'🎒':['gourd','#f0b858'],'🏘':['pagoda','#8fc8ff'],'🗺':['map','#d0a8ff']};
const svg=n=>'<svg viewBox="0 0 24 24" fill="currentColor" fill-opacity=".14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+P[n]+'</svg>';
const mk=m=>'<span class="xi" style="color:'+m[1]+'">'+svg(m[0])+'</span>';
function conv(el){[...el.childNodes].forEach(n=>{if(n.nodeType==3){const t=n.nodeValue.replace(/\uFE0F/g,'').trim(),m=M[t];if(m){const d=document.createElement('span');d.innerHTML=mk(m);el.replaceChild(d.firstChild,n)}}})}
const SEL='#sk .sb,#ult,#zk .sb,#dock .sb',all=()=>document.querySelectorAll(SEL).forEach(conv);
const d=document.createElement('div');d.id='dock';['au','bg','vl','mpb','dgb'].forEach(id=>{const e=document.getElementById(id);if(e)d.appendChild(e)});document.body.appendChild(d);
const au=document.getElementById('au');au.innerHTML=mk(['taiji','#7fe0a0'])+'<small>Auto</small>';
all();
const ob=new MutationObserver(all);['sk','ult','zk','dock'].forEach(id=>{const e=document.getElementById(id);if(e)ob.observe(e,{childList:true,subtree:true})});
window.__xiSheet=()=>Object.keys(P);
})();
