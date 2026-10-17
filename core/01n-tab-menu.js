/* core/01n-tab-menu.js — Thanh tab menu (tabBar, NAVI)
   (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) */
/* ===== Thanh tab menu (thiết kế lại) ===== */
const NAVI=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`,
NAV=[
['Túi đồ','Túi',NAVI('<rect x="5" y="7" width="14" height="14" rx="4"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/><path d="M5 12.5h14"/><path d="M10.5 12v3h3v-3"/>')],
['Nhân vật','Nhân vật',NAVI('<circle cx="12" cy="8" r="3.6"/><path d="M5 20.5c0-4 3-6.6 7-6.6s7 2.6 7 6.6"/>')],
['Thợ rèn','Rèn',NAVI('<path d="M3.5 7.5h14.5c0 2.3-1.7 3.8-4 4.1V14h2.5v3.5h-9V14H10v-2.4C6.6 11.2 4.6 9.7 3.5 7.5z"/><path d="M18 7.5h2.5"/><path d="M6 20.5h12"/>')],
['Tạp hóa','Tạp hóa',NAVI('<path d="M3 4h2.6l2.2 11.2h9.6L20 8H6.6"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/>')],
['Dược điếm','Dược',NAVI('<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M12 8.5v7" transform="rotate(-45 12 12)"/>')],
['Nhiệm vụ','Nhiệm vụ',NAVI('<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M12 7.5v5.5"/><path d="M12 16.6h.01" stroke-width="2.4"/>')],
['Bản đồ','Bản đồ',NAVI('<path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>')],
['Hợp trang bị','Hợp',NAVI('<path d="M9.5 3h5M10.5 3v6L5.2 18.4A2 2 0 0 0 7 21.5h10a2 2 0 0 0 1.8-3.1L13.5 9V3"/><path d="M7.6 15.5h8.8"/>')],
['Tu tiên','Tu tiên',NAVI('<path d="M12 3.5c2.4 2.6 3.2 5.6 0 9.5-3.2-3.9-2.4-6.9 0-9.5z"/><path d="M4 9c3.4-.2 6 1.6 8 4.8-3.2 1.2-6.6.2-8-4.8z"/><path d="M20 9c-3.4-.2-6 1.6-8 4.8 3.2 1.2 6.6.2 8-4.8z"/><path d="M5 18c4 2 10 2 14 0"/>')],
['Thú nuôi','Thú',NAVI('<ellipse cx="6" cy="10.5" rx="1.7" ry="2.3"/><ellipse cx="9.6" cy="6.3" rx="1.7" ry="2.3"/><ellipse cx="14.4" cy="6.3" rx="1.7" ry="2.3"/><ellipse cx="18" cy="10.5" rx="1.7" ry="2.3"/><path d="M12 11.5c-3 0-5.5 3-5.5 5.3 0 1.8 1.5 2.4 3 2.1 1-.2 1.6-.5 2.5-.5s1.5.3 2.5.5c1.5.3 3-.3 3-2.1 0-2.3-2.5-5.3-5.5-5.3z"/>')],
['Cánh','Cánh',NAVI('<path d="M3.5 19C2.5 11 7 5.5 20.5 4.5c-.6 4-2.8 7.2-6.6 9.2 1.4.1 2.5.6 3.4 1.4-3 .2-5.3 1.2-7 3 .6.1 1.1.4 1.5.8-3.3.8-6.6.7-9.8.1z"/><path d="M7 17c2-4 5-7 9.5-9"/>')],
['Chỉ số','Chỉ số',NAVI('<path d="M5.5 20v-7.5M12 20V5M18.5 20v-10.5"/><path d="M3 20.8h18"/>')],
['Linh điền','Trồng',NAVI('<path d="M12 21v-9"/><path d="M12 12c0-4 3-6.5 7-6.5 0 4-2.8 6.5-7 6.5z"/><path d="M12 15c0-3-2.4-5-6-5 0 3 2.2 5 6 5z"/><path d="M7 21h10"/>')],
['Luyện đan','Đan',NAVI('<path d="M5 9h14v3a7 7 0 0 1-14 0z"/><path d="M4 9h16"/><path d="M8 21l1.2-2.2M16 21l-1.2-2.2"/><path d="M9 5.5c0-1 1-1.3 1-2.3M13 5.5c0-1 1-1.3 1-2.3"/>')],
['Khai khoáng','Mỏ',NAVI('<path d="M5 20L13 12"/><path d="M14 5c3-1.2 6 .2 7 3"/><path d="M14 5c-2 2.6-2 6.2.4 8.6"/><path d="M21 8c-2.6 0-6 1.4-7.6 3.4"/>')]
,['Lò Thánh','Thánh',NAVI('<path d="M12 3l2.6 5.4 5.9.9-4.3 4.2 1 5.9L12 16.6 6.8 19.4l1-5.9L3.5 9.3l5.9-.9z"/>')]
,['Vòng quay','Quay',NAVI('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2"/><path d="M12 3.5v6.5M12 14v6.5M3.5 12H10M14 12h6.5"/>')]
],
NAVLK=[2,3,7,15],
fmtN=n=>{try{return Math.floor(n).toLocaleString('vi-VN')}catch(e){return ''+n}};
/* Fix243: vàng từ 1.000.000 trở lên hiện rút gọn: 1,23 Triệu · 4,5 Tỷ (cắt bớt, không làm tròn lên) */
const fmtG=n=>{try{n=Math.floor(+n||0);const u=v=>(Math.floor(v*100)/100).toLocaleString('vi-VN',{maximumFractionDigits:2});return n>=1e9?u(n/1e9)+' Tỷ':n>=1e6?u(n/1e6)+' Triệu':fmtN(n)}catch(e){return ''+n}};
/* Fix243: [🔒 khoá, 💎 không khoá] Linh Thạch của nhân vật đang chơi; null nếu chưa đăng nhập ☁ */
/* Fix244: icon Linh Thạch vẽ SVG (lk=1: khoá — ngọc xám xanh + ổ khoá vàng; lk=0: không khoá — ngọc xanh) */
const ltSvg=lk=>`<svg width="16" height="16" viewBox="-10 -10 20 20" style="vertical-align:-3px"><path d="M-5.5 -10H5.5L10 -2.5L0 10L-10 -2.5Z" fill="${lk?'#8fa4c8':'#4cc3ff'}" stroke="#000" stroke-width="1.2" stroke-linejoin="round"/><path d="M-10 -2.5H10M-3 -2.5L0 10M3 -2.5L0 10" stroke="#fff" stroke-opacity=".55" fill="none"/>${lk?'<rect x="2" y="2" width="8" height="7" fill="#ffd54a" stroke="#000" stroke-width="1"/><path d="M3.5 2V.5a2.5 2.5 0 0 1 5 0V2" fill="none" stroke="#000" stroke-width="1.4"/>':''}</svg>`;
const ltHud=()=>{try{return window.LT&&LT.logged&&LT.logged()?[LT.locked()|0,LT.unlocked()|0]:null}catch(e){return null}};
function tabBar(p){
 let rd=0;try{rd=ZC.tx()=='SẴN SÀNG ĐỘT PHÁ'}catch(e){}
 const dot=[BAG.length>=capN()*.9,p.pts>0,0,0,0,qsDot(),0,0,rd,p.tier>=1&&!p.pet,0,0,FM.rdy(),0,0];
 const tabs=NAV.map((n,i)=>`<button class="tbt${tab==i?' on':''}${!vil&&NAVLK.includes(i)?' lk':''}" onclick="tb(${i})" title="${n[0]}${!vil&&NAVLK.includes(i)?' (cần ở Làng)':''}">${n[2]}<span>${n[1]}</span>${dot[i]?'<i class="nd"></i>':''}</button>`).join('');
 const cur=NAV[tab]||NAV[0];
 return `<div class="bx"><div class="bhw"><div class="bhd"><div class="bti">${cur[2]}<b>${cur[0]}</b></div><div class="bac">`
 +`<button class="ib" title="Cẩm nang" onclick="GD.open()">${NAVI('<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9 7.5h6"/>')}</button>`

 +`<button class="ib" title="Menu" onclick="mn(0)">${NAVI('<path d="M5 7h14M5 12h14M5 17h14"/>')}</button>`
 +`<button class="ib x" title="Đóng" onclick="tg()">${NAVI('<path d="M6 6l12 12M18 6L6 18"/>')}</button></div></div>`
 +`<div class="tbar">${tabs}</div></div>`
 +`<div class="rsr"><span class="chip" title="Vàng: ${fmtN(gold)}">💰 ${fmtG(gold)}</span>${(()=>{const q=ltHud();return q?`<span class="chip" title="Linh Thạch khoá (nhân vật này)">${ltSvg(1)} ${fmtN(q[0])}</span><span class="chip" title="Linh Thạch không khoá">${ltSvg(0)} ${fmtN(q[1])}</span>`:''})()}<span class="chip" title="Mảnh chế tạo">🔹 ${fmtN(frag)}</span>`
 +`<button class="chip" ${hpP<1?'disabled':''} onclick="up(0)" title="Dùng bình HP (Q)">🧪 ${hpP}<small>Dùng</small></button>`
 +`<button class="chip" ${mpP<1?'disabled':''} onclick="up(1)" title="Dùng bình MP (E)">💧 ${mpP}<small>Dùng</small></button></div>`
 +(msg?`<div class="st msgl">${msg}</div>`:'');
}
