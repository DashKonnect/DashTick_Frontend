webpackJsonp([1],{23:function(t,exports,a){var e,n,s;(function(r){"use strict";!function(r,o,i){n=[a(2)],e=r,s="function"==typeof e?e.apply(exports,n):e,!(void 0!==s&&(t.exports=s))}(function($){var t=function(t,a,e){var n={invalid:[],getCaret:function(){try{var a,e=0,s=t.get(0),r=document.selection,o=s.selectionStart;return r&&navigator.appVersion.indexOf("MSIE 10")===-1?(a=r.createRange(),a.moveStart("character",-n.val().length),e=a.text.length):(o||"0"===o)&&(e=o),e}catch(i){}},setCaret:function(a){try{if(t.is(":focus")){var e,n=t.get(0);n.setSelectionRange?n.setSelectionRange(a,a):(e=n.createTextRange(),e.collapse(!0),e.moveEnd("character",a),e.moveStart("character",a),e.select())}}catch(s){}},events:function(){t.on("keydown.mask",function(a){t.data("mask-keycode",a.keyCode||a.which),t.data("mask-previus-value",t.val()),t.data("mask-previus-caret-pos",n.getCaret()),n.maskDigitPosMapOld=n.maskDigitPosMap}).on($.jMaskGlobals.useInput?"input.mask":"keyup.mask",n.behaviour).on("paste.mask drop.mask",function(){setTimeout(function(){t.keydown().keyup()},100)}).on("change.mask",function(){t.data("changed",!0)}).on("blur.mask",function(){o===n.val()||t.data("changed")||t.trigger("change"),t.data("changed",!1)}).on("blur.mask",function(){o=n.val()}).on("focus.mask",function(t){e.selectOnFocus===!0&&$(t.target).select()}).on("focusout.mask",function(){e.clearIfNotMatch&&!s.test(n.val())&&n.val("")})},getRegexMask:function(){for(var t,e,n,s,o,i,c=[],l=0;l<a.length;l++)t=r.translation[a.charAt(l)],t?(e=t.pattern.toString().replace(/.{1}$|^.{1}/g,""),n=t.optional,s=t.recursive,s?(c.push(a.charAt(l)),o={digit:a.charAt(l),pattern:e}):c.push(n||s?e+"?":e)):c.push(a.charAt(l).replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&"));return i=c.join(""),o&&(i=i.replace(new RegExp("("+o.digit+"(.*"+o.digit+")?)"),"($1)?").replace(new RegExp(o.digit,"g"),o.pattern)),new RegExp(i)},destroyEvents:function(){t.off(["input","keydown","keyup","paste","drop","blur","focusout",""].join(".mask "))},val:function(a){var e,n=t.is("input"),s=n?"val":"text";return arguments.length>0?(t[s]()!==a&&t[s](a),e=t):e=t[s](),e},calculateCaretPosition:function(){var a=t.data("mask-previus-value")||"",e=n.getMasked(),s=n.getCaret();if(a!==e){var r=t.data("mask-previus-caret-pos")||0,o=e.length,i=a.length,c=0,l=0,u=0,v=0,f=0;for(f=s;f<o&&n.maskDigitPosMap[f];f++)l++;for(f=s-1;f>=0&&n.maskDigitPosMap[f];f--)c++;for(f=s-1;f>=0;f--)n.maskDigitPosMap[f]&&u++;for(f=r-1;f>=0;f--)n.maskDigitPosMapOld[f]&&v++;if(s>i)s=o;else if(r>=s&&r!==i){if(!n.maskDigitPosMapOld[s]){var k=s;s-=v-u,s-=c,n.maskDigitPosMap[s]&&(s=k)}}else s>r&&(s+=u-v,s+=l)}return s},behaviour:function(a){a=a||window.event,n.invalid=[];var e=t.data("mask-keycode");if($.inArray(e,r.byPassKeys)===-1){var s=n.getMasked(),o=n.getCaret();return setTimeout(function(){n.setCaret(n.calculateCaretPosition())},10),n.val(s),n.setCaret(o),n.callbacks(a)}},getMasked:function(t,s){var o,i,c=[],l=void 0===s?n.val():s+"",u=0,v=a.length,f=0,k=l.length,p=1,h="push",d=-1,g=0,m=[];e.reverse?(h="unshift",p=-1,o=0,u=v-1,f=k-1,i=function(){return u>-1&&f>-1}):(o=v-1,i=function(){return u<v&&f<k});for(var M;i();){var y=a.charAt(u),b=l.charAt(f),w=r.translation[y];w?(b.match(w.pattern)?(c[h](b),w.recursive&&(d===-1?d=u:u===o&&(u=d-p),o===d&&(u-=p)),u+=p):b===M?(g--,M=void 0):w.optional?(u+=p,f-=p):w.fallback?(c[h](w.fallback),u+=p,f-=p):n.invalid.push({p:f,v:b,e:w.pattern}),f+=p):(t||c[h](y),b===y?(m.push(f),f+=p):(M=y,m.push(f+g),g++),u+=p)}var C=a.charAt(o);v!==k+1||r.translation[C]||c.push(C);var P=c.join("");return n.mapMaskdigitPositions(P,m,k),P},mapMaskdigitPositions:function(t,a,s){var r=e.reverse?t.length-s:0;n.maskDigitPosMap={};for(var o=0;o<a.length;o++)n.maskDigitPosMap[a[o]+r]=1},callbacks:function(s){var r=n.val(),i=r!==o,c=[r,s,t,e],l=function(t,a,n){"function"==typeof e[t]&&a&&e[t].apply(this,n)};l("onChange",i===!0,c),l("onKeyPress",i===!0,c),l("onComplete",r.length===a.length,c),l("onInvalid",n.invalid.length>0,[r,s,t,n.invalid,e])}};t=$(t);var s,r=this,o=n.val();a="function"==typeof a?a(n.val(),void 0,t,e):a,r.mask=a,r.options=e,r.remove=function(){var a=n.getCaret();return n.destroyEvents(),n.val(r.getCleanVal()),n.setCaret(a),t},r.getCleanVal=function(){return n.getMasked(!0)},r.getMaskedVal=function(t){return n.getMasked(!1,t)},r.init=function(o){if(o=o||!1,e=e||{},r.clearIfNotMatch=$.jMaskGlobals.clearIfNotMatch,r.byPassKeys=$.jMaskGlobals.byPassKeys,r.translation=$.extend({},$.jMaskGlobals.translation,e.translation),r=$.extend(!0,{},r,e),s=n.getRegexMask(),o)n.events(),n.val(n.getMasked());else{e.placeholder&&t.attr("placeholder",e.placeholder),t.data("mask")&&t.attr("autocomplete","off");for(var i=0,c=!0;i<a.length;i++){var l=r.translation[a.charAt(i)];if(l&&l.recursive){c=!1;break}}c&&t.attr("maxlength",a.length),n.destroyEvents(),n.events();var u=n.getCaret();n.val(n.getMasked()),n.setCaret(u)}},r.init(!t.is("input"))};$.maskWatchers={};var a=function(){var a=$(this),n={},s="data-mask-",r=a.attr("data-mask");if(a.attr(s+"reverse")&&(n.reverse=!0),a.attr(s+"clearifnotmatch")&&(n.clearIfNotMatch=!0),"true"===a.attr(s+"selectonfocus")&&(n.selectOnFocus=!0),e(a,r,n))return a.data("mask",new t(this,r,n))},e=function(t,a,e){e=e||{};var n=$(t).data("mask"),s=JSON.stringify,r=$(t).val()||$(t).text();try{return"function"==typeof a&&(a=a(r)),"object"!=typeof n||s(n.options)!==s(e)||n.mask!==a}catch(o){}},n=function(t){var a,e=document.createElement("div");return t="on"+t,a=t in e,a||(e.setAttribute(t,"return;"),a="function"==typeof e[t]),e=null,a};$.fn.mask=function(a,n){n=n||{};var s=this.selector,r=$.jMaskGlobals,o=r.watchInterval,i=n.watchInputs||r.watchInputs,c=function(){if(e(this,a,n))return $(this).data("mask",new t(this,a,n))};return $(this).each(c),s&&""!==s&&i&&(clearInterval($.maskWatchers[s]),$.maskWatchers[s]=setInterval(function(){$(document).find(s).each(c)},o)),this},$.fn.masked=function(t){return this.data("mask").getMaskedVal(t)},$.fn.unmask=function(){return clearInterval($.maskWatchers[this.selector]),delete $.maskWatchers[this.selector],this.each(function(){var t=$(this).data("mask");t&&t.remove().removeData("mask")})},$.fn.cleanVal=function(){return this.data("mask").getCleanVal()},$.applyDataMask=function(t){t=t||$.jMaskGlobals.maskElements;var e=t instanceof $?t:$(t);e.filter($.jMaskGlobals.dataMaskAttr).each(a)};var s={maskElements:"input,td,span,div",dataMaskAttr:"*[data-mask]",dataMask:!0,watchInterval:300,watchInputs:!0,useInput:!/Chrome\/[2-4][0-9]|SamsungBrowser/.test(window.navigator.userAgent)&&n("input"),watchDataMask:!1,byPassKeys:[9,16,17,18,36,37,38,39,40,91],translation:{0:{pattern:/\d/},9:{pattern:/\d/,optional:!0},"#":{pattern:/\d/,recursive:!0},A:{pattern:/[a-zA-Z0-9]/},S:{pattern:/[a-zA-Z]/}}};$.jMaskGlobals=$.jMaskGlobals||{},s=$.jMaskGlobals=$.extend(!0,{},s,$.jMaskGlobals),s.dataMask&&$.applyDataMask(),setInterval(function(){$.jMaskGlobals.watchDataMask&&$.applyDataMask()},s.watchInterval)},r,window.Zepto)}).call(exports,a(2))}});
//# sourceMappingURL=creditcard-formatter-newmask-init.js.map