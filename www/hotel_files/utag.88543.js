//tealium universal tag - utag.88543 ut4.0.201809071900, Copyright 2018 Tealium.com Inc. All Rights Reserved.
try{(function(id,loader){var u={"id":id};utag.o[loader].sender[id]=u;if(utag.ut===undefined){utag.ut={};}
var match=/ut\d\.(\d*)\..*/.exec(utag.cfg.v);if(utag.ut.loader===undefined||!match||parseInt(match[1])<35){u.loader=function(o){var b,c,l,a=document;if(o.type==="iframe"){b=a.createElement("iframe");o.attrs=o.attrs||{"height":"1","width":"1","style":"display:none"};for(l in utag.loader.GV(o.attrs)){b.setAttribute(l,o.attrs[l]);}b.setAttribute("src",o.src);}else if(o.type=="img"){utag.DB("Attach img: "+o.src);b=new Image();b.src=o.src;return;}else{b=a.createElement("script");b.language="javascript";b.type="text/javascript";b.async=1;b.charset="utf-8";for(l in utag.loader.GV(o.attrs)){b[l]=o.attrs[l];}b.src=o.src;}if(o.id){b.id=o.id};if(typeof o.cb=="function"){if(b.addEventListener){b.addEventListener("load",function(){o.cb()},false);}else{b.onreadystatechange=function(){if(this.readyState=='complete'||this.readyState=='loaded'){this.onreadystatechange=null;o.cb()}};}}l=o.loc||"head";c=a.getElementsByTagName(l)[0];if(c){utag.DB("Attach to "+l+": "+o.src);if(l=="script"){c.parentNode.insertBefore(b,c);}else{c.appendChild(b)}}}}else{u.loader=utag.ut.loader;}
if(utag.ut.typeOf===undefined){u.typeOf=function(e){return({}).toString.call(e).match(/\s([a-zA-Z]+)/)[1].toLowerCase();};}else{u.typeOf=utag.ut.typeOf;}
u.ev={"view":1};u.map={};u.extend=[];u.send=function(a,b){if(u.ev[a]||u.ev.all!==undefined){utag.DB("send:88543");utag.DB(b);var c,d,e,f,g;u.data={"qsp_delim":"&","kvp_delim":"=","base_url_req_ttdid":"//match.adsrvr.org/track/cmf/generic?","base_url_get_ttdid":"//datacloud.tealiumiq.com/tealium_ttd/main/16/i.js?jsonp=utag.ut.tealium_pass_ttdid","base_url_pass_ttdid":"//datacloud.tealiumiq.com/vdata/i.gif?","tealium_account":"","tealium_profile":"","ttd_pid":"tealium","ttd_tpi":"1","delay":5000,"interval":0,"sin":4};utag.DB("send:88543:EXTENSIONS");utag.DB(b);c=[];g=[];for(d in utag.loader.GV(u.map)){if(b[d]!==undefined&&b[d]!==""){e=u.map[d].split(",");for(f=0;f<e.length;f++){u.data[e[f]]=b[d];}}}
utag.DB("send:88543:MAPPINGS");utag.DB(u.data);u.data.tealium_account=u.data.tealium_account||utag.cfg.utid.split("/")[0];u.data.tealium_profile=u.data.tealium_profile||utag.cfg.utid.split("/")[1];u.data.order_id=u.data.order_id||b._corder||"";if(!b["cp.utag_main_ttd_uuid"]&&!u.data.order_id){c.push("ttd_pid"+u.data.kvp_delim+u.data.ttd_pid);c.push("ttd_tpi"+u.data.kvp_delim+u.data.ttd_tpi);u.loader({"type":"img","src":u.data.base_url_req_ttdid+c.join(u.data.qsp_delim)});utag.ut.tealium_pass_ttdid=function(o){try{var tl=o.tvt?o.tvt.length:0;if(tl!=0){utag.loader.SC("utag_main",{"ttd_uuid":(o.tvt[tl-1].t1+";exp-session")});g.push("ttd_uuid"+u.data.kvp_delim+o.tvt[tl-1].t1);g.push("tealium_vid"+u.data.kvp_delim+b["cp.utag_main_v_id"]);g.push("tealium_account"+u.data.kvp_delim+u.data.tealium_account);g.push("tealium_profile"+u.data.kvp_delim+u.data.tealium_profile);u.loader({"type":"img","src":u.data.base_url_pass_ttdid+g.join(u.data.qsp_delim)});clearInterval(u.polling_interval);}}catch(e){utag.DB(e);}}
u.get_ttdid=function(interval,sin){if(interval>=sin){clearInterval(u.polling_interval);}else{u.loader({"type":"script","src":u.data.base_url_get_ttdid,"cb":null,"loc":"script","id":"utag_88543_get_ttdid","attrs":{}});u.data.interval++;}}
u.polling_interval=setInterval(function(){u.get_ttdid(u.data.interval,u.data.sin);},u.data.delay);}
utag.DB("send:88543:COMPLETE");}};utag.o[loader].loader.LOAD(id);}("88543","hyatt.main"));}catch(error){utag.DB(error);}