/* core/01c-affix-petdata-skills.js — Opt ngẫu nhiên, dữ liệu thú nuôi PT4/PB/PK, init, dm, kỹ năng (cast/fire/basic)
   (tách từ core/01-engine.js; thứ tự nạp giữ nguyên, xem index.html) */
const CN=i=>{const p=PS[i];return(p&&p.nm)||CHR[i].n};
let SKF=0,bgp=0;const capN=()=>{const t=(PS[cur]||{}).tier|0;return 90+(t>=2?30:0)+(t>=3?30:0)},bgLk=k=>{const t=(PS[cur]||{}).tier|0;return k==3?t<2:k==4?t<3:false};let P,E,PJ,DT,PT,cd,auto=1,fr=0,cam=0,mvDir=0,over=0,Q,EQS=[0,1,2].map(()=>Array(NS).fill(null)),BAGS=[[],[],[]],EQ=EQS[0],BAG=BAGS[0],gold=0,bo=0,sel=null;
const AXN={dodge:'Né',acc:'Chính xác',crit:'Chí mạng',cdmg:'ST chí mạng',dred:'Giảm ST nhận',hpp:'Tăng % máu',dmgp:'Tăng % sát thương',mpp:'Tăng % năng lượng',sdmg:'Sát thương kỹ năng',aspd:'Tốc độ tấn công',cspd:'Tốc độ niệm chú',dotd:'ST hiệu ứng độc & bỏng',prc:'Tỉ lệ xuyên giáp',eres:'Kháng hiệu ứng',stnc:'Tỉ lệ gây choáng',frzc:'Tỉ lệ đóng băng',ls:'Hút máu',ms:'Hút năng lượng',goldp:'Tăng vàng nhận được'},AXU={dodge:.8,acc:1.2,crit:.6,cdmg:2,dred:.6,hpp:1.5,dmgp:1.5,mpp:2,sdmg:1.5,aspd:.8,cspd:.8,dotd:2,prc:1,eres:1,stnc:.8,frzc:.8},RMX=[1,1.4,1.9,2.6,3.5,4.6,13.8],AXF={ls:[1,7],ms:[1,7],goldp:[1,20]},AXW=['ls','ms'];
/* Opt ngẫu nhiên: số lượng 1-6 (ngẫu nhiên, không phụ thuộc phẩm); riêng phẩm Thánh luôn 7. Sức mạnh opt tăng theo phẩm đồ (RMX[r]).
 Mỗi opt roll 11 bậc z=0..10 (70%..130% dải của chính nó), lưu ở xq. Màu opt theo bậc roll chia 7 mức = 7 màu phẩm cấp
 (xám/lục/lam/tím/cam/hồng/vàng); bậc 10 = opt MAX -> thêm ★ xanh. Đồ cũ chưa có xq: suy bậc từ giá trị. */
function rollXM(r,l,mp,s){const n=r>=6?7:1+Math.floor(R()*6),ks=Object.keys(AXU).concat(['goldp'],s===0?AXW:[]).sort(()=>R()-.5).slice(0,n),x={},q={};ks.forEach(k=>{const z=Math.floor(R()*11);q[k]=z;x[k]=AXF[k]?Math.round((AXF[k][0]+(AXF[k][1]-AXF[k][0])*z/10)*10)/10:Math.round(AXU[k]*RMX[r]*((70+z*6)/100)*(1+l/100)*(1+(mp|0)*.08)*10)/10});return{x,q}}
function rollX(r,l,mp){return rollXM(r,l,mp).x}
const xQ=(i,k)=>i.hl?10:(i.xq&&i.xq[k]!=null?i.xq[k]:AXF[k]?Math.max(0,Math.min(10,Math.round((i.x[k]-AXF[k][0])/(AXF[k][1]-AXF[k][0])*10))):Math.max(0,Math.min(10,Math.round(((i.x[k]/(AXU[k]*RMX[i.r]*(1+i.l/100)*(1+(i.mp|0)*.08)))-.7)/.06)))),
 xTier=(i,k)=>Math.min(6,Math.floor(xQ(i,k)*7/11)),
 xStar=(i,k)=>xQ(i,k)>=10,
 xHtml=i=>Object.keys(i.x).map(k=>`<span style="color:${RC[xTier(i,k)]}">${xStar(i,k)?'<span style="color:#4dc3ff">★</span> ':''}${AXN[k]} +${i.x[k]}%</span>`).join('<br>')+(i.ttl?'<br><span style="color:#ffd76a">✦ Cấp mọi thần thông +'+i.ttl+'</span>':'')+(i.sk&&window.OPT2&&OPT2.cfg.sk[i.sk]?'<br><span style="color:#ff9ad0">✦ Kỹ năng +10: '+OPT2.cfg.sk[i.sk].name+' — '+OPT2.cfg.sk[i.sk].d+'</span>':'');
const PT4=[{n:['Hổ Con','Mãnh Hổ','Bạch Hổ Sơn Quân','Thiên Cương Thần Hổ'],e:'🐯',m:.55,cd:70,rg:120,d:'Cận chiến mạnh · +% sát thương'},{n:['Ưng Non','Thương Ưng','Kim Sí Điêu','Cửu Thiên Thần Ưng'],e:'🦅',m:.35,cd:45,rg:340,d:'Tầm xa, đánh nhanh · +% chí mạng, chính xác'},{n:['Long Ấu','Hỏa Long','Thanh Vân Thần Long','Tinh Hà Long Vương'],e:'🐉',m:.34,cd:58,rg:270,d:'Bay lượn vỗ cánh, phun long tức tầm xa · +% ST chí mạng'},{n:['Huyền Vũ Sơ Sinh','Huyền Vũ Chiến Binh','Cổ Đại Huyền Vũ','Tối Thượng Huyền Vũ'],e:'🐢',m:.24,cd:80,rg:120,d:'Thần thú Rùa-Rắn · cắn nhanh, hồi máu chủ nhân · +% giảm ST nhận, % máu'}],PCAP=[10,20,35,50],PEG=[3000,20000,100000],PCAPD=[15,30,45,60],PEGD=[9000,60000,300000],pcap=p=>p.k==2?PCAPD[p.ev]:PCAP[p.ev],peg=p=>p.k==2?PEGD[p.ev]:p.k==1&&typeof PHX!='undefined'?PHX.gold(p):p.k==0&&typeof PTG!='undefined'?PTG.gold(p):PEG[p.ev],PCL=['#d8d8d8','#6fdc6f','#c070ff','#ffa733'];
const pet=()=>PS[cur].tier>0?PS[cur].pet:null,pnd=p=>Math.round(40*Math.pow(1.12,p.lv)),pv=p=>1+.04*(p.lv-1)+.3*p.ev;
function PB(k){const p=pet();if(!p)return 0;const v=pv(p),t=p.k;return({dmgp:t==0?5*v:0,crit:t==1?3*v:0,acc:t==1?3*v:0,cdmg:t==2?8*v:((t==1||t==0)&&p.ev>=1?2.5*v:0),dred:t==3?4*v:((t==1||t==0)&&p.ev>=2?2*v:0),hpp:t==3?6*v:0})[k]||0}
const SX=k=>k=='cdr'?0:PTB(k)+EQ.reduce((t,i)=>t+(i&&i.x?i.x[k]||0:0),0)+PB(k)+WB(k)+(typeof twB=='function'?twB(k):0);
const gP=v=>Math.round(v*(1+SX('goldp')/100));
function pcheck(p){while(p.lv<pcap(p)&&p.xp>=pnd(p)){p.xp-=pnd(p);p.lv++}}
function petGain(e){const p=pet();if(!p||p.lv>=pcap(p))return;p.xp+=(e.b?8:1)*(1+e.lv/10);pcheck(p)}
const CHAR_ATK_MUL=.6,CHAR_HP_MUL=.6,EQ_STAT_MUL={a:1,d:3,h:1}; /* Công nhân vật ×0.6 · HP nhân vật ×0.6 · Thủ từ trang bị ×3 (đã tính trên mức giảm 1/2 → ≈×1.5 so với gốc) */
const EQ_BASE_HALF=.5; /* Giảm 1/2 thuộc tính cơ bản (Công/Thủ/HP) của MỌI trang bị kể cả đồ Thánh: tính cả chỉ số thật (sm) lẫn hiển thị thẻ (ev) vì cùng dùng UM */
function UM(u){return EQ_BASE_HALF*[1,1.3,1.6,1.9,2.2,2.5,2.8,3.4,3.8,4.2,10][Math.min(10,Math.max(0,u|0))]}
const sm=k=>EQ.reduce((t,i,x)=>t+(i&&(x!=10||PS[cur].tier>0)?Math.round(i[k]*UM(i.u)*(EQ_STAT_MUL[k]||1)):0),0),atk=()=>Math.round(CHAR_ATK_MUL*.55*((20+P.lv*8)*CHR[cur].a+sm('a'))*(1+alE(0)*.001)*(1+.25*PS[cur].tier)*(setOn()?1.3:1)*ZC.cb()*ZC.pa()*HL.dmg()*(1+SX('dmgp')/100)*(window.HONP?HONP.sm():1)),mx=()=>Math.round(CHAR_HP_MUL*((200+P.lv*60)*CHR[cur].h+sm('h'))*(1+alE(1)*.002)*(1+.25*PS[cur].tier)*(setOn()?1.3:1)*ZC.cb()*ZC.ph()*HL.hp()*(1+SX('hpp')/100)*(window.HONP?HONP.sm():1)),mm=()=>Math.round(((60+P.lv*8)*CHR[cur].m)*(1+alE(2)*.003)*ZC.mb()*ZC.pm()*(1+SX('mpp')/100)),nx=()=>Math.round(100*Math.pow(P.lv,1.4)*(window.HDAO?HDAO.xm():1)*(P.lv>=21?10:1)*(((P.lv>=60&&P.lv<=100)||(window.HDAO&&HDAO.on()))?3:1));
function init(){P={x:120,pe:null,atkT:1,hp:1,mp:1,lv:P?P.lv:1,xp:P?P.xp:0,d:1,atk:0,mv:0};P.hp=mx();P.mp=mm();E=[];PJ=[];DT=[];PT=[];PETS=[];FX=[];SLT=[60,130,200,270,340];wbq=0;P.pe=null;cd=SK.map(()=>0);Q={k:0,n:20,done:0};over=0}
function dm(e,m,sl){if(R()>cl(.88+SX('acc')/100-(.03+mi()*.02+(e.b?.03:0)),.35,1)){DT.push({x:e.x,y:(e.hh||100)*SZ,s:'Trượt',c:'#aaa',l:35});return}let d=atk()*m*(.9+R()*.2)*100/(100+(e.df||0)*(1-Math.min(.5,SX('ndr')/100))),k=R()<Math.min(.85,.15+ZC.crit()+(setOn()?.1:0)+SX('crit')/100+HL.crit());if(k){d*=1.8+SX('cdmg')/100+HL.cdmg();if(R()<HL.dc()){d*=2;DT.push({x:e.x,y:(e.hh||100)*SZ+16,s:'✨ x2 Chí mạng!',c:'#ffe27a',l:45})}}d*=HL.vs(e);if(SKF)d*=1+SX('sdmg')/100;d=Math.round(d);e.hp-=d;{const ls=SX('ls'),ms=SX('ms');if(P.hp>0){if(ls>0)P.hp=Math.min(mx(),P.hp+Math.min(d*ls/100,mx()*.1));if(ms>0)P.mp=Math.min(mm(),P.mp+Math.min(d*ms/100,mm()*.1))}}e.fl=6;if(sl)e.sl=150;DT.push({x:e.x,y:(e.hh||100)*SZ,s:d,k,l:k?78:46});for(let i=0;i<4;i++)PT.push({x:e.x,y:60,vx:(R()-.5)*4,vy:R()*-3,l:25,c:'#ffd'})}
/* Chí mạng cho SÁT THƯƠNG HIỆU ỨNG (bỏng, độc, chảy máu, ma ám, tan băng, thú nuôi...): cùng tỉ lệ & ST chí mạng với đòn thường (dm); dotCrit.k=1 nếu chí mạng */
function dotCrit(d){const k=R()<Math.min(.85,.15+ZC.crit()+(setOn()?.1:0)+SX('crit')/100+HL.crit());dotCrit.k=k?1:0;return k?d*(1.8+SX('cdmg')/100+HL.cdmg()):d}
/* Màu số sát thương theo từng hiệu ứng: viền (sc) tối cùng tông với màu chữ; chí mạng thì chữ sáng hơn ~45% */
const DOTSC={'#ff9a3a':'#5a1a00','#7fe85a':'#0c3a00','#ff2a4a':'#3a0010','#9fe8ff':'#06304a','#c070ff':'#2a0a4a','#cda8ff':'#2a1050','#9fe0ff':'#08305a','#ff6a7a':'#4a0814'};
function dotSc(c){return DOTSC[c]||'#3a2000'}
function dotCl(c,k){if(!k||typeof c!=='string'||c[0]!=='#'||c.length!==7)return c;const n=parseInt(c.slice(1),16),f=v=>Math.round(v+(255-v)*.45);return '#'+[(n>>16)&255,(n>>8)&255,n&255].map(f).map(v=>v.toString(16).padStart(2,'0')).join('')}
const near=(r)=>{let b=null;E.forEach(e=>{if(e.in>0)return;const d=Math.abs(e.x-P.x);if(d<r&&(!b||d<Math.abs(b.x-P.x)))b=e});return b};
let PETS=[],FX=[],SLT=[],wbq=0,pp={x:0};
const NYI=new Image();NYI.src=ASSET_URL("a013");const NYC={};
const KDI=new Image();KDI.src=ASSET_URL("a014");
const HQI=new Image();HQI.src=ASSET_URL("a015");
const nyi=c=>{if(!NYI.complete||!NYI.naturalWidth)return null;if(NYC[c])return NYC[c];const w=NYI.naturalWidth,h=NYI.naturalHeight,v=document.createElement('canvas');v.width=w;v.height=h;const q=v.getContext('2d');q.drawImage(NYI,0,0);q.globalCompositeOperation='source-atop';q.globalAlpha=.2;q.fillStyle=c;q.fillRect(0,0,w,h);return NYC[c]=v};
const NYD=(x,y,h,al,c)=>{const v=nyi(c);if(!v)return;const w=h*v.width/v.height;g.save();g.translate(x,y);g.globalCompositeOperation='source-over';g.globalAlpha=al*.85;g.drawImage(v,-w/2,-h/2,w,h);g.globalCompositeOperation='lighter';g.globalAlpha=al*.22;g.drawImage(v,-w/2,-h/2,w,h);g.restore()};
const SPR={golem:ASSET_URL("a016"),ogre:ASSET_URL("a017"),mage:ASSET_URL("a018"),gob:ASSET_URL("a019"),wolf:ASSET_URL("a020"),scorp:ASSET_URL("a021"),arch:ASSET_URL("a022"),pal:ASSET_URL("a023")},MI={};for(const k in SPR){MI[k]=new Image();MI[k].src=SPR[k]}
function TK(){const t=CHR[cur].t;return t=='a'&&PS[cur].br==1?'w':t}
function ZK(){const t=CHR[cur].t,b=PS[cur].br;return t=='w'&&b==1?'w1':t=='m'&&b==0?'m0':t=='a'&&b==1?'a1':t}
const sks=()=>{const p=PS[cur],c=CHR[cur],b=p.br>=0?c.br[p.br]:null;return[...(b&&b.b?b.b:c.k),...(b?b.k:[0,1,2,3].map(()=>['???','🔒',0,1e9,9,0]))]},
ok=i=>{const t=PS[cur].tier;return i<2||(i<4&&t>=1)||(i==4&&t>=2)||(i==5&&t>=3)},
DS={w:80,a:380,m:330},RG={w:210,a:560,m:520},ANI={w:22,a:30,m:30},DL={w:16,a:30,m:30},NF={w:1,m:1,a:1},
MS={gob:{n:'Goblin',h:62,f:1,hm:1,rg:60},wolf:{n:'Sói',h:56,f:-1,hm:1.2,rg:60},scorp:{n:'Bọ Cạp',h:60,f:1,hm:1.1,rg:60},arch:{n:'Xạ Đá',h:96,f:1,hm:.9,rg:340},mage:{n:'Goblin Pháp',h:62,f:-1,hm:.8,rg:320},ogre:{n:'Ogre',h:118,f:-1,hm:2,rg:90},golem:{n:'Golem',h:168,f:1,hm:1,rg:120},pal:{n:'Morakh',h:196,f:1,hm:1,rg:130}},
POOL=['gob','wolf','scorp','arch','mage','ogre','gob','wolf'],vw=()=>(window.VWD&&VWD.on())?VWD.ww():W/s,sx=i=>vw()*(.4+.115*i);
function rf(){SK=sks();SL=SLS[CHR[cur].t];NM=SL.map(q=>ADJ.map(a=>q[0]+' '+a));EQ=EQS[cur];BAG=BAGS[cur];cd=SK.map(()=>0);setSK()}
function an(D){P.atkT=D+12;P.atk=D+12}
const MR=150,DASHR=340;let MSGF=0;
function needMsg(){if(fr-MSGF>40){MSGF=fr;DT.push({x:P.x,y:130,s:'Cần áp sát quái!',c:'#ffb070',l:40})}}
function actEnd(){P.act=null;P.jy=0;P.jr=0}
function spawn(i){const wb=wbq&&i==2,bt=wb?2:(!E.some(e=>e.b==1||e.b==3)&&(pq[1]>0||pq[0]>0))?(pq[1]>0?3:1):0,b=bt==1||bt==3,k=wb?'pal':bt==3?'golem':bt==1?'ogre':POOL[Math.floor(R()*POOL.length)],m=MS[k],L=cl(P.lv+Math.floor(R()*5)-2+(wb||b?3:0),LR[mapSel][0],LR[mapSel][1]),h=3*(60+L*25)*(1+mi()*.5)*m.hm*(wb?40:bt==3?22+mi()*3:b?8+mi()*1.5:1)*(lg?2.2:1)*cqM(),df=(8+L*2.2)*(1+mi()*.4)*(wb?2.5:bt==3?2.3:b?1.8:1)*(lg?1.35:1)*(1+(cqM()-1)/2);if(wb)wbq=0;if(bt==3){pq[1]--;DT.push({x:P.x,y:210,s:'👑 Boss Sử Thi xuất hiện!',c:'#d9a0ff',l:150})}else if(bt==1){pq[0]--;DT.push({x:P.x,y:210,s:'⭐ Boss Tinh Anh xuất hiện!',c:'#7fd0ff',l:130})}const sxx=P.x>vw()*.55?-50-i*45:vw()+50+i*45;E.push({k,sn:i,x:sxx,hp:h,max:h,df,b:bt,m:mi(),lv:L,cd:30,sl:0,fl:0,in:6,hh:m.h,rg:m.rg});for(let j=0;j<10;j++)PT.push({x:sxx,y:30,vx:(R()-.5)*3,vy:-R()*3,l:30,c:'#d8a0ff'})}
function cast(i){const k=SK[i];if(over||vil||!started||!ok(i)||cd[i]>0||P.mp<k[2]||P.pe||P.act)return;const t=k[4],T=TK();if(T=='w'){if(![3,6,10].includes(t)&&!near(t==13||t==17?DASHR:MR)){if(!auto)needMsg();return}}else if([0,1,2,4,7,8,11,12].includes(t)&&!near(RG[T]+60))return;P.mp-=k[2];QE('cast');cd[i]=k[3]*1.6;const D=Math.max(6,Math.round(DL[T]/(1+Math.min(1,SX(T=='m'?'cspd':'aspd')/100))));an(D);P.ln=k[0];P.pe={l:D,f:()=>fire(i),t,n:k[0]}}
function fire(i){const k=SK[i],t=k[4],T=TK(),c=CHR[cur].c,br=PS[cur].br;ZS.sfx(k,T,c);
if(t==0)PJ.push({x:P.x+40*P.d,vx:(T=='a'?12:8)*P.d,l:90,d:k[5],h:[],k:T,n:k[0],pi:k[5]>=4,big:k[5]>=3});
if(t==1){E.forEach(e=>{if(Math.abs(e.x-P.x)<k[6])dm(e,k[5])});0}
if(t==2){const e=near(T=='w'?MR+40:RG[T]+80);if(e){dm(e,k[5]);0}}
if(t==3){const q=Math.round(mx()*k[5]);P.hp=Math.min(mx(),P.hp+q);DT.push({x:P.x,y:120,s:'+'+q,g:1,l:55});0}
if(t==4){E.forEach(e=>{if(Math.abs(e.x-P.x)<k[6])dm(e,k[5],1)});0}
if(t==5){E.forEach(e=>dm(e,k[5]));0}
if(t==6){if(window.SUMC)SUMC(k);else{if(PETS.length>=3)PETS.shift();PETS.push({x:P.x-40,k:k[6],l:840,cd:0,m:k[5]});DT.push({x:P.x,y:140,s:'Triệu hồi '+k[0],g:1,l:60})}}if(t>=7)xfire(k)}
function xfire(k){const t=k[4],o=k[7]||{},rg=TK()=='w'?MR+40:RG[TK()]+80,heal=q=>{q=Math.round(mx()*q);P.hp=Math.min(mx(),P.hp+q);DT.push({x:P.x,y:120,s:'+'+q,g:1,l:55})};
if(t==7){const e=near(rg);if(!e)return;for(let j=0;j<(o.h||2);j++)ZS.later(j*4,()=>{if(e.hp>0)dm(e,k[5])})}
else if(t==8){let n=0;E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-P.x)<k[6]){dm(e,k[5],o.sl);n++}});if(o.hl&&n)heal(o.hl)}
else if(t==10){if(o.s||o.d)ZC.setS(o.s||0,o.d||0);if(o.hp)heal(o.hp);if(o.mp){const q=Math.round(mm()*o.mp);P.mp=Math.min(mm(),P.mp+q);DT.push({x:P.x,y:90,s:'+'+q+' MP',c:'#7ab8ff',l:55})}}
else if(t==11){const L=E.filter(e=>e.in<=0).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x)).slice(0,o.n||5);L.forEach((e,i)=>ZS.later(i*3,()=>{if(e.hp>0)dm(e,k[5])}))}
else if(t==12){E.forEach(e=>{if(e.in<=0&&Math.abs(e.x-P.x)<k[6])dm(e,k[5]*(e.hp<e.max*.35?2:1))})}else if(t>=13)ZS.act.skill(k)}
function basic(T){const e=near(DS[T]+90);if(!e)return;if(T=='w'){dm(e,1);FX.push({t:'sl',x:e.x,br:PS[cur].br,c:CHR[cur].c,l:14,m:14})}else PJ.push({x:P.x+40*P.d,vx:(T=='a'?12:8)*P.d,l:70,d:T=='a'?1.1:1,h:[],k:T})}
const PSC=.58,DNS=.4,DTX=.56;
const PK=[{sp:4.6,sd:54,al:0,at:22,h:50,bc:'#ffa733'},{sp:5.6,sd:175,al:62,at:26,h:44,bc:'#ffe9a0'},{sp:3.6,sd:175,al:34,at:22,h:46,bc:'#bfe3ff'},{sp:2.9,sd:46,al:0,at:34,h:36,bc:'#6fe0ff'}],
PSK=[{n:'Hổ Khiếu',d:'gầm vang, chấn thương mọi địch quanh thú',cd:420,m:2.3},{n:'Phong Vũ',d:'mưa lông vũ xé gió đánh nhiều địch',cd:360,m:.9},{n:'Long Tức',d:'phun hơi thở rồng theo hệ từng cấp: Sương Giá · Liệt Hỏa · Lôi Thủy · Tinh Hà',cd:380,m:1.5},{n:'Huyền Vũ Hộ Thể',d:'hồi máu chủ nhân và dựng khiên nước',cd:520,m:0}],
GLC={};
