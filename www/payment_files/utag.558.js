//tealium universal tag - utag.558 ut4.0.201809121046, Copyright 2018 Tealium.com Inc. All Rights Reserved.
try{(function(id,loader){var u={"id":id};utag.o[loader].sender[id]=u;if(utag.ut===undefined){utag.ut={};}
var match=/ut\d\.(\d*)\..*/.exec(utag.cfg.v);if(utag.ut.loader===undefined||!match||parseInt(match[1])<41){u.loader=function(o,a,b,c,l,m){utag.DB(o);a=document;if(o.type=="iframe"){m=a.getElementById(o.id);if(m&&m.tagName=="IFRAME"){b=m;}else{b=a.createElement("iframe");}o.attrs=o.attrs||{};utag.ut.merge(o.attrs,{"height":"1","width":"1","style":"display:none"},0);}else if(o.type=="img"){utag.DB("Attach img: "+o.src);b=new Image();}else{b=a.createElement("script");b.language="javascript";b.type="text/javascript";b.async=1;b.charset="utf-8";}if(o.id){b.id=o.id;}for(l in utag.loader.GV(o.attrs)){b.setAttribute(l,o.attrs[l]);}b.setAttribute("src",o.src);if(typeof o.cb=="function"){if(b.addEventListener){b.addEventListener("load",function(){o.cb();},false);}else{b.onreadystatechange=function(){if(this.readyState=="complete"||this.readyState=="loaded"){this.onreadystatechange=null;o.cb();}};}}if(o.type!="img"&&!m){l=o.loc||"head";c=a.getElementsByTagName(l)[0];if(c){utag.DB("Attach to "+l+": "+o.src);if(l=="script"){c.parentNode.insertBefore(b,c);}else{c.appendChild(b);}}}};}else{u.loader=utag.ut.loader;}
if(utag.ut.typeOf===undefined){u.typeOf=function(e){return({}).toString.call(e).match(/\s([a-zA-Z]+)/)[1].toLowerCase();};}else{u.typeOf=utag.ut.typeOf;}
u.ev={"view":1};u.initialized=false;u.scriptrequested=false;u.queue=[];utag.globals=utag.globals||{};utag.globals.yahoo_jp_remarketing=utag.globals.yahoo_jp_remarketing||{};utag.globals.yahoo_jp_remarketing.queue=utag.globals.yahoo_jp_remarketing.queue||[];u.map={};u.extend=[];u.loader_cb=function(a,b,c){utag.DB("send:558:CALLBACK");u.initialized=true;window.yahoo_retargeting_id="";window.yahoo_retargeting_label="";if(utag.globals.yahoo_jp_remarketing.queue.length!==0){utag.globals.yahoo_jp_remarketing.queue[0].fromCallback=true;utag.sender[utag.globals.yahoo_jp_remarketing.queue[0].UID].send('view',b);}
utag.DB("send:558:CALLBACK:COMPLETE");};u.callBack=function(){var data={};while(data=u.queue.shift()){u.data=data.data;u.loader_cb(data.a,data.b,data.c);}};u.send=function(a,b){if(u.ev[a]||u.ev.all!==undefined){var c,d,e,f;u.data={"base_url":"//b92.yahoo.co.jp/js/s_retargeting.js","yahoo_retargeting_id":"IY3QUKRC71","yahoo_retargeting_label":""};for(d in utag.loader.GV(u.map)){if(b[d]!==undefined&&b[d]!==""){e=u.map[d].split(",");for(f=0;f<e.length;f++){u.data[e[f]]=b[d];}}}
if(utag.globals.yahoo_jp_remarketing.queue.length===0||!utag.globals.yahoo_jp_remarketing.queue[0].fromCallback){utag.globals.yahoo_jp_remarketing.queue.push({"UID":u.id,"retargetingID":u.data.yahoo_retargeting_id,"retargetingLabel":u.data.yahoo_retargeting_label,"fromCallback":false});}
if(!window.yahoo_retargeting_id){currYahooObj=utag.globals.yahoo_jp_remarketing.queue.shift();window.yahoo_retargeting_id=currYahooObj.retargetingID;window.yahoo_retargeting_label=currYahooObj.retargetingLabel;}else{utag.DB(u.id+': Tag has been queued.');return;}
if(u.initialized){u.loader_cb(a,b,c);}else{u.queue.push({"data":u.data,"a":a,"b":b,"c":c});if(!u.scriptrequested){u.scriptrequested=true;u.loader({"type":"script","src":u.data.base_url,"cb":u.callBack,"loc":"script","id":"utag_558","attrs":{}});}}}};utag.o[loader].loader.LOAD(id);}("558","agoda.main2018"));}catch(error){utag.DB(error);}
