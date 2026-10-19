/* ui/102-canh4-sat-thuong.js — Fix343: Cánh Cấp 4 thêm +% sát thương MỌI kỹ năng & thần thông.
   Móc dm() (SKF=1 = đòn kỹ năng/thần thông, cùng cách ui/101). Không sửa core. Chỉnh số: C4DMG. */
(function(){
  var C4DMG=20; /* % sát thương kỹ năng/thần thông thêm khi có Cánh Cấp 4 */
  var _dm=dm;
  dm=function(e,m,sl){
    try{if(SKF&&typeof wl==='function'&&wl()>=4)m*=1+C4DMG/100}catch(x){}
    return _dm.call(this,e,m,sl)};
  /* hiện dòng thuộc tính trong tab Cánh */
  if(typeof wgUI==='function'){var _ui=wgUI;
    wgUI=function(){var h=_ui.apply(this,arguments);
      try{if(wl()>=4)h+='<div class="dt">🪽 <b>Long Vũ Thiên Thần Dực</b>: +'+C4DMG+'% sát thương mọi kỹ năng &amp; thần thông</div>'}catch(x){}
      return h}}
  window.C4DMG=C4DMG;
})();
