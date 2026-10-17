/* Giữ nguyên vị trí cuộn của túi đồ khi giao diện vẽ lại (bấm nút trong tab không bị cuộn lên đầu).
   Đổi tab / đổi mục nhiệm vụ thì vẫn về đầu trang như cũ. */
(function(){
if(window.__bagScroll||typeof ui!='function')return;window.__bagScroll=1;
var _ui=window.ui,_tg=window.tg,last='';
function sig(){try{return tab+'|'+(tab==5?qsub:'')}catch(e){return''}}
function box(){var b=document.getElementById('bag');return b?b.querySelector('.bx'):null}
window.ui=function(){
  var el=box(),top=el?el.scrollTop:0,s=sig(),same=(s===last);
  var r=_ui.apply(this,arguments);
  var n=box();if(n&&same&&top>0)n.scrollTop=top;
  last=s;return r;
};
if(typeof _tg=='function')window.tg=function(){last='';return _tg.apply(this,arguments)};
})();
