const KEY='vidyasetu_v2',API='http://localhost:5000/api/chat';
function blank(){return{user:null,lang:'en',history:[],topics:{},chat:[]}}
let S;try{S=JSON.parse(localStorage.getItem(KEY))||blank()}catch(e){S=blank()}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const x=s=>{const p=String(s).split('|');return S.lang==='ta'&&p[1]?p[1]:p[0]};
const t=k=>I18N[S.lang][k]??I18N.en[k]??k;
const tn=k=>S.lang==='ta'?(TA[k]||k):k;
const st=p=>p>=80?'strong':p>=50?'mid':'weak';
const ab=p=>p>=80?'advanced':p>=50?'intermediate':'beginner';
let view='home',subj='Mathematics',lt='Fractions',qz=null,rep=0,typing=false,confetti=false;
const QS=()=>Q.filter(q=>q.s===subj);
const avgOf=a=>a.length?Math.round(a.reduce((p,c)=>p+c,0)/a.length):0;
const subjAvg=s=>avgOf(SUBJECTS[s].topics.filter(k=>S.topics[k]!==undefined).map(k=>S.topics[k]));
const avg=()=>avgOf(Object.values(S.topics));
const recs=()=>Object.entries(S.topics).filter(([k,v])=>v<80).sort((a,b)=>a[1]-b[1]).map(([k,v])=>({k,v}));
const bar=p=>`<div class="bar"><i class="${st(p)}" style="width:${p}%"></i></div>`;
const ring=(p,sz=110)=>`<svg class="ring" width="${sz}" height="${sz}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" class="rb"/><circle cx="50" cy="50" r="40" class="rf ${st(p)}" style="stroke-dashoffset:${251*(1-p/100)}"/><text x="50" y="57" text-anchor="middle">${p}%</text></svg>`;
const fmt=s=>s>=60?`${Math.floor(s/60)} ${t('m')} ${s%60} ${t('sc')}`:`${s} ${t('sc')}`;

function go(v,a){
 if(!S.user&&!['home','login'].includes(v))v='login';
 view=v;
 if(v==='quiz'){subj=a||subj;qz={i:0,a:[],sel:null,t0:Date.now()}}
 if(v==='learn')lt=a||lt;
 if(v==='report')rep=a;
 render();scrollTo({top:0})}
function switchLang(){S.lang=S.lang==='en'?'ta':'en';save();render()}
function logout(){S.user=null;save();go('login')}
function doLogin(){
 const f=id=>$('#'+id).value.trim(),u={name:f('ln'),cls:$('#lc').value,inst:f('li'),phone:f('lp')},er=[];
 if(u.name.length<2)er.push('e_name');if(!u.inst)er.push('e_inst');if(!/^[6-9]\d{9}$/.test(u.phone))er.push('e_phone');
 if(er.length){$('#err').innerHTML=er.map(k=>t(k)).join('<br>');return}
 if(S.user&&S.user.phone!==u.phone){S.history=[];S.topics={};S.chat=[]}
 S.user=u;save();go('dash')}

function recCards(){
 if(!S.history.length)return `<div class="card">${t('noq')}</div>`;
 const r=recs().slice(0,4);
 if(!r.length)return `<div class="card strong">\ud83c\udf89 ${t('allgood')}</div>`;
 return r.map(o=>`<div class="card hv"><div class="row"><b>${tn(o.k)}</b><span class="tag ${st(o.v)}">${t(st(o.v))} \u00b7 ${o.v}%</span></div><div class="mut">${tn(TS[o.k])}</div>${bar(o.v)}<button class="btn" onclick="go('learn','${o.k}')">${t('study')}</button></div>`).join('')}


const ptsOf=h=>h.pts??h.score*5;
const totalPts=()=>S.history.reduce((p,h)=>p+ptsOf(h),0);
const lvl=p=>p>=240?'lv3':p>=120?'lv2':p>=40?'lv1':'lv0';
const pctOf=h=>Math.round(h.score/h.total*100);
const arrow=d=>d>0?'\u25b2 +'+d:d<0?'\u25bc '+d:'\u25cf 0';
function cmpBlock(i){
 const h=S.history[i],p=S.history.slice(0,i).reverse().find(z=>z.subj===h.subj);
 if(!p)return `<div class="card imp" style="margin-bottom:18px"><b>\ud83d\ude80 ${t('first')}</b></div>`;
 const a=pctOf(p),b=pctOf(h),d=b-a,cls=d>0?'strong':d<0?'weak':'mid',msg=d>0?t('improved'):d<0?t('declined'):t('same');
 return `<h2>\ud83d\udcc8 ${t('vsPrev')}</h2><div class="card imp ${cls}-glow" style="margin-bottom:18px"><div class="cmp"><div><div class="mut">${t('prev')}</div>${ring(a,100)}<div class="mut">\u2b50 ${ptsOf(p)} ${t('pts')}</div></div>
 <div class="delta ${cls}"><div class="arr">${d>0?'\u25b2':d<0?'\u25bc':'\u25cf'}</div><div class="dv">${d>0?'+':''}${d}%</div><span>${msg}</span></div>
 <div><div class="mut">${t('curr')}</div>${ring(b,100)}<div class="mut">\u2b50 ${ptsOf(h)} ${t('pts')}</div></div></div>
 <h3 style="margin:16px 0 6px">${t('tchg')}</h3>${Object.keys(h.t).map(k=>{const o=p.t[k]??0,n=h.t[k],dd=n-o;return `<div class="row"><b>${tn(k)}</b><span class="mut">${o}% \u2192 ${n}%</span><span class="ar ${dd>0?'strong':dd<0?'weak':'mid'}">${arrow(dd)}%</span></div><div class="bar thin"><i style="width:${o}%;background:#c9c2f5"></i></div><div class="bar thin"><i class="${st(n)}" style="width:${n}%"></i></div>`}).join('')}</div>`}
function impSection(){
 let up=0;
 const rows=Object.keys(SUBJECTS).map(s=>{const hs=S.history.filter(z=>z.subj===s);if(!hs.length)return '';
  const sc=hs.map(pctOf),n=sc.length,cur=sc[n-1],pv=n>1?sc[n-2]:null,d=pv===null?null:cur-pv;if(d>0)up++;
  return `<div class="card hv"><div class="row"><b>${SUBJECTS[s].ic} ${tn(s)}</b>${d===null?`<span class="tag">${t('firstTag')}</span>`:`<span class="dtag ${d>0?'strong':d<0?'weak':'mid'}">${arrow(d)}%</span>`}</div>
  <div class="mini">${sc.slice(-6).map((v,i)=>`<div class="mb"><i class="${st(v)}" style="height:${Math.max(v,5)}%;animation-delay:${i*.12}s"></i><span>${v}%</span></div>`).join('')}</div>
  <div class="mut">${d===null?t('first'):pv+'% \u2192 '+cur+'%'}</div></div>`}).join('');
 return `<h2>\ud83d\udcc8 ${t('impTitle')}</h2>${up?`<div class="card imp strong-glow" style="margin-bottom:16px"><b>\ud83c\udf89 ${t('topimp')} ${up} ${t('subjs')}</b></div>`:''}<div class="grid">${rows||`<div class="card">${t('noimp')}</div>`}</div>`}

const V={
login:()=>{const u=S.user||{};return `<div class="login"><div class="l"><div style="font-size:3rem">\ud83c\udf09</div><h2 style="color:#fff">${t('lt')}</h2><p style="opacity:.9">${t('ls')}</p></div>
<div class="r"><label>${t('nm')}</label><input id="ln" value="${esc(u.name||'')}" autocomplete="name">
<label>${t('cl')}</label><select id="lc">${CLASSES.map(c=>`<option value="${c}" ${u.cls===c?'selected':''}>${x(c)}</option>`).join('')}</select>
<label>${t('inst')}</label><input id="li" value="${esc(u.inst||'')}">
<label>${t('ph')}</label><input id="lp" value="${esc(u.phone||'')}" inputmode="numeric" maxlength="10" onkeydown="if(event.key==='Enter')doLogin()">
<div class="err" id="err"></div><br><button class="btn" onclick="doLogin()">${t('enter')}</button>${u.name?` <button class="btn sec" onclick="logout()">${t('logout')}</button>`:''}</div></div>`},
home:()=>`<div class="hero"><i class="orb" style="width:260px;height:260px;background:#ffb703;top:-60px;right:20%"></i><i class="orb" style="width:220px;height:220px;background:#00e0d0;bottom:-70px;left:10%;animation-delay:-4s"></i>
<div><span class="pill">\u2728 Hackathon Prototype</span><h1>VidyaSetu</h1><div class="sub"><b>Adaptive Smart Learning Companion</b></div><p>${t('tag')}<br>${t('welcome')}</p><button class="btn" onclick="go(S.user?'dash':'login')">${t('start')} \u2192</button></div>
<svg class="bridge" viewBox="0 0 320 200"><path d="M10 140 Q160 -30 310 140"/><path d="M0 150H320"/><path d="M60 80V150M110 52V150M160 42V150M210 52V150M260 80V150"/><circle class="dot" cx="60" cy="80" r="5"/><circle class="dot" cx="160" cy="42" r="5" style="animation-delay:.5s"/><circle class="dot" cx="260" cy="80" r="5" style="animation-delay:1s"/></svg></div>
<div class="stats">${[['st1',4],['st2',32],['st3',2],['st4','AI']].map(([k,n])=>`<div class="card hv" style="text-align:center"><div class="big" ${typeof n=='number'?`data-n="${n}"`:''}>${n}</div>${t(k)}</div>`).join('')}</div>
<h2>${t('flow')}</h2><div class="steps">${['s1','s2','s3','s4','s5'].map((k,i)=>`<div class="step"><i>${i+1}</i><b>${t(k)}</b></div>`).join('')}</div>`,
dash:()=>`<div class="card" style="background:linear-gradient(120deg,#3d1fc4,#5b3df5,#00a8b5);color:#fff;margin-bottom:20px"><h2 style="color:#fff;margin:0">${t('hi')}, ${esc(S.user.name)} \ud83d\udc4b</h2><div style="opacity:.9">${x(S.user.cls)} \u00b7 ${esc(S.user.inst)}</div></div>
<div class="grid"><div class="card hv"><div class="mut">${t('overall')}</div>${ring(avg())}</div><div class="card hv"><div class="big" data-n="${S.history.length}">0</div>${t('quizzes')}<br><br><button class="btn" onclick="go('subj')">${t('startq')}</button></div><div class="card hv pts"><div class="trophy">\ud83c\udfc6</div><div class="big" data-n="${totalPts()}">0</div>${t('ptsTotal')}<div class="tag" style="margin-top:8px">${t('level')}: ${t(lvl(totalPts()))}</div>${[1,2,3,4].map(n=>`<i class="spark" style="left:${n*20}%;animation-delay:${n*.4}s">\u2b50</i>`).join('')}</div>
<div class="card hv">${Object.keys(SUBJECTS).map(s=>`<div class="row"><span>${SUBJECTS[s].ic} ${tn(s)}</span><b>${subjAvg(s)}%</b></div>${bar(subjAvg(s))}`).join('')}</div></div>
${impSection()}<h2>${t('rec')}</h2><div class="grid">${recCards()}</div>`,
subj:()=>`<h2>${t('pick')}</h2><div class="grid">${Object.keys(SUBJECTS).map(s=>{const d=SUBJECTS[s],h=[...S.history].reverse().find(z=>z.subj===s);return `<div class="sc" style="--c1:${d.c[0]};--c2:${d.c[1]}"><div class="ic">${d.ic}</div><h3>${tn(s)}</h3><div class="mut" style="color:#fff;opacity:.9">8 ${t('qn')}</div><div>${d.topics.map(k=>`<span class="chip">${tn(k)}</span>`).join('')}</div>${h?`<p style="margin-top:8px">${t('last')}: <b>${h.score}/${h.total}</b></p>`:''}<button class="btn" onclick="go('quiz','${s}')">${t('startq')}</button></div>`}).join('')}</div>`,
quiz:()=>{const qs=QS(),q=qs[qz.i],last=qz.i===qs.length-1;
 return `<div class="card"><div class="row"><span class="tag">${tn(subj)} \u00b7 ${tn(q.t)}</span><b>${qz.i+1} ${t('of')} ${qs.length}</b></div>${bar((qz.i+1)/qs.length*100)}<div class="mut">\u2b50 ${t('pt5')} \u00b7 ${t('maxp')}: ${qs.length*5}</div><h2>${x(q.q)}</h2>
 ${q.o.map((o,i)=>`<button class="opt ${qz.sel===i?'sel':''}" onclick="qz.sel=${i};render(true)"><b>${'ABCD'[i]}</b>${x(o)}</button>`).join('')}
 <br><button class="btn" ${qz.sel===null?'disabled':''} onclick="nextQ()">${last?t('finish'):t('next')} \u2192</button></div>`},
report:()=>{const h=S.history[rep];if(!h)return V.dash();
 const pct=Math.round(h.score/h.total*100),A=ab(pct),qs=Q.filter(q=>q.s===h.subj),tp=Object.entries(h.t),
 good=tp.filter(([k,v])=>v>=80),bad=tp.filter(([k,v])=>v<80).sort((a,b)=>a[1]-b[1]);
 return `${confetti&&pct>=70?Array.from({length:40},()=>`<i class="cf" style="left:${Math.random()*100}%;background:hsl(${Math.random()*360},85%,60%);animation-delay:${Math.random()*1.2}s"></i>`).join(''):''}
 <div class="rhead"><div><div style="opacity:.85">${t('rep')} \u00b7 ${tn(h.subj)}</div><h2 style="color:#fff;margin:4px 0">${esc(S.user.name)}</h2><div style="opacity:.9">${x(S.user.cls)} \u00b7 ${esc(S.user.inst)}<br>\ud83d\udcde ${esc(S.user.phone)} \u00b7 ${h.date}</div><span class="badge">${t('ability')}: ${t(A)}</span></div>${ring(pct,130)}</div>
 <div class="grid"><div class="card"><div class="mut">${t('acc')}</div><div class="big">${pct}%</div></div><div class="card"><div class="mut">${t('cw')}</div><div class="big">${h.score} / ${h.total-h.score}</div></div><div class="card pts"><div class="trophy">\ud83c\udfc6</div><div class="big" data-n="${ptsOf(h)}">0</div><div>/ ${h.total*5} ${t('pts')}</div><div class="mut">${t('pt5')}</div>${[1,2,3,4,5,6].map(n=>`<i class="spark" style="left:${n*15}%;animation-delay:${n*.35}s">\u2b50</i>`).join('')}</div><div class="card"><div class="mut">${t('time')}</div><div class="big" style="font-size:1.6rem">${fmt(h.secs)}</div><div class="mut">${t('avgq')}: ${fmt(Math.round(h.secs/h.total))}</div></div></div>
 ${cmpBlock(rep)}<div class="card" style="margin-bottom:18px"><b>\ud83d\udcac ${t('m_'+A)}</b></div>
 <h2>${t('tsc')}</h2><div class="grid">${tp.map(([k,v])=>`<div class="card hv"><div class="row"><b>${tn(k)}</b><span class="tag ${st(v)}">${t(st(v))}</span></div><div class="big ${st(v)}" style="-webkit-text-fill-color:currentColor">${v}%</div>${bar(v)}</div>`).join('')}</div>
 <div class="grid"><div class="card"><h3>\u2705 ${t('sg')}</h3><ul style="margin:8px 0 0 18px">${good.map(([k,v])=>`<li>${tn(k)} \u2013 ${v}%</li>`).join('')||`<li>${t('nostrong')}</li>`}</ul></div>
 <div class="card"><h3>\ud83c\udfaf ${t('fx')}</h3><ul style="margin:8px 0 0 18px">${bad.map(([k,v])=>`<li>${tn(k)} \u2013 ${v}%</li>`).join('')||`<li>${t('nofocus')}</li>`}</ul></div></div>
 ${bad.length?`<h2>\ud83d\udcda ${t('plan')}</h2><div class="card"><ol>${bad.map(([k])=>`<li>${t('pl1')} <b>${tn(k)}</b>, ${t('pl2')} <button class="btn sec" style="padding:4px 12px;box-shadow:none" onclick="go('learn','${k}')">${t('study')}</button></li>`).join('')}</ol></div>`:''}
 <h2>${t('review')}</h2>${qs.map((q,i)=>{const ok=h.qa[i]===q.a;return `<div class="rv ${ok?'':'no'}" style="animation-delay:${i*.08}s"><div class="row"><b>${i+1}. ${x(q.q)}</b><span class="ptchip ${ok?'y':'n'}" style="animation-delay:${i*.12+.3}s">${ok?'+5':'0'} ${t('pts')}</span></div><div>${t('yans')}: ${x(q.o[h.qa[i]])} ${ok?'\u2714':'\u2718'}</div>${ok?'':`<div class="strong">${t('cans')}: ${x(q.o[q.a])}</div>`}</div>`}).join('')}
 <br><div class="noprint row" style="justify-content:flex-start"><button class="btn" onclick="go('quiz','${h.subj}')">${t('retake')}</button><button class="btn sec" onclick="print()">\ud83d\udda8 ${t('print')}</button></div>`},
learn:()=>{const d=L[lt],sj=TS[lt];return `<div class="tabs">${SUBJECTS[sj].topics.map(k=>`<button class="btn ${k===lt?'':'sec'}" onclick="go('learn','${k}')">${tn(k)}</button>`).join('')}</div>
<div class="card"><span class="tag">${SUBJECTS[sj].ic} ${tn(sj)}</span><h2>${t('explain')}: ${tn(lt)}</h2><p>${x(d.e)}</p><h3>${t('formula')}</h3><div class="formula">${d.f}</div><h3>${t('example')}</h3><p>${x(d.x)}</p></div><br>
<h2>${t('practice')}</h2>${d.p.map(p=>`<div class="card" style="margin-bottom:14px"><b>${p.q}</b>${p.o.map((o,i)=>`<button class="opt" onclick="prac(this,${i},${p.a})"><b>${'ABCD'[i]}</b>${o}</button>`).join('')}</div>`).join('')}
<button class="btn" onclick="go('quiz','${sj}')">${t('takeq')}</button>`},
prog:()=>`<h2>${t('prog')}</h2><div class="grid"><div class="card hv"><div class="mut">${t('overall')}</div>${ring(avg(),130)}</div>
${Object.keys(SUBJECTS).map(s=>`<div class="card hv"><div class="row"><b>${SUBJECTS[s].ic} ${tn(s)}</b><b>${subjAvg(s)}%</b></div>${SUBJECTS[s].topics.map(k=>{const p=S.topics[k]||0;return `<div class="row mut"><span>${tn(k)}</span><span class="${st(p)}">${p}%</span></div>${bar(p)}`}).join('')}</div>`).join('')}</div>
<h2>${t('hist')}</h2>${S.history.length?S.history.map((h,i)=>({h,i})).reverse().map(({h,i})=>`<div class="card row" style="margin-bottom:12px"><div><b>${tn(h.subj)}</b><div class="mut">${h.date}</div></div><span class="tag ${st(h.score/h.total*100)}">${h.score}/${h.total}</span><span class="tag">\u2b50 ${ptsOf(h)}</span><button class="btn sec" onclick="go('report',${i})">${t('viewrep')}</button></div>`).join(''):`<div class="card">${t('none')}</div>`}`,
chat:()=>`<h2>\ud83e\udd16 ${t('chat')}</h2><div class="card"><div class="chat" id="cb">${S.chat.length?'':`<div class="msg">${t('greet')}</div>`}${S.chat.map(m=>`<div class="msg ${m.r}">${esc(m.m)}</div>`).join('')}${typing?'<div class="msg dots"><span></span><span></span><span></span></div>':''}</div>
<div class="chips">${[t('weakq'),'What is a fraction?','Explain photosynthesis','25% of 200','What is a loop?'].map(c=>`<button onclick="send(this.textContent)">${c}</button>`).join('')}</div>
<div class="row" style="flex-wrap:nowrap"><input id="ci" placeholder="${t('ask')}" onkeydown="if(event.key==='Enter')send()"><button class="btn" onclick="send()">${t('send')}</button></div></div>`};

function nextQ(){
 qz.a.push(qz.sel);qz.sel=null;const qs=QS();
 if(qz.i<qs.length-1){qz.i++;return render()}
 const c={},n={},r={};let sc=0;
 qs.forEach((q,i)=>{n[q.t]=(n[q.t]||0)+1;c[q.t]=(c[q.t]||0)+(qz.a[i]===q.a?1:0)});
 Object.keys(n).forEach(k=>{r[k]=Math.round(c[k]/n[k]*100);S.topics[k]=r[k];sc+=c[k]});
 S.history.push({date:new Date().toLocaleString(),subj,score:sc,total:qs.length,t:r,pts:sc*5,qa:qz.a,secs:Math.round((Date.now()-qz.t0)/1000)});
 save();confetti=true;go('report',S.history.length-1)}
function prac(b,i,a){[...b.parentNode.querySelectorAll('.opt')].forEach((o,k)=>{o.disabled=true;if(k===a)o.classList.add('right')});if(i!==a)b.classList.add('wrong')}

function calc(m){
 const s=m.toLowerCase().replace(/what is|calculate|how much is|=|\?|,/g,'').trim();
 let p=s.match(/^([\d.]+)\s*%\s*of\s*([\d.]+)$/);if(p)return `${p[1]}% of ${p[2]} = ${+(p[1]*p[2]/100).toFixed(2)}`;
 if(/^[\d\s+\-*/().x\u00d7\u00f7]+$/.test(s)&&/\d\s*[-+*/x\u00d7\u00f7]\s*\d/.test(s)){try{const v=Function('"use strict";return ('+s.replace(/[x\u00d7]/g,'*').replace(/\u00f7/g,'/')+')')();if(isFinite(v))return s+' = '+ +v.toFixed(4)}catch(e){}}
 return null}
function kb(m){
 const c=calc(m);if(c)return c;
 if(/weak|recommend|what should i study|\u0baa\u0bb2\u0bb5\u0bc0\u0ba9|\u0b8e\u0ba9\u0bcd\u0ba9 \u0baa\u0b9f\u0bbf\u0b95\u0bcd\u0b95/i.test(m)){const r=recs();return r.length?t('focus')+' '+r.slice(0,3).map(o=>tn(o.k)+' ('+o.v+'%)').join(', '):t('nomore')}
 if(/my name|\u0b8e\u0ba9\u0bcd \u0baa\u0bc6\u0baf\u0bb0\u0bcd/i.test(m))return `${t('hi')} ${S.user.name}!`;
 for(const [k,a] of KB)if(new RegExp(k,'i').test(m))return x(a);
 return null}
async function send(txt){
 const m=(typeof txt==='string'?txt:$('#ci').value).trim();if(!m||typing)return;
 S.chat.push({r:'me',m});typing=true;render();
 let r=kb(m);
 if(!r){try{const ct=new AbortController();setTimeout(()=>ct.abort(),4000);const d=await(await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:m,lang:S.lang}),signal:ct.signal})).json();if(d.mode==='ai')r=d.reply}catch(e){}}
 await new Promise(z=>setTimeout(z,600));
 typing=false;S.chat.push({r:'bot',m:r||t('nokb')});save();render()}

function render(keep){
 const nav=S.user?['home','dash','subj','prog','chat']:['home'];
 $('#app').innerHTML=`<nav><span class="logo" onclick="go('home')"><svg viewBox="0 0 40 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5b3df5"/><stop offset="1" stop-color="#00c2c7"/></linearGradient></defs><rect width="40" height="40" rx="11" fill="url(#g)"/><path d="M6 26Q20 6 34 26M4 28H36M13 17V28M20 14V28M27 17V28" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>Vidya<b>Setu</b></span>${nav.map(k=>`<button class="nb ${view===k?'on':''}" onclick="go('${k}')">${t(k)}</button>`).join('')}<button class="nb" onclick="switchLang()">${S.lang==='en'?'\u0ba4\u0bae\u0bbf\u0bb4\u0bcd':'English'}</button>${S.user?`<button class="av" title="${esc(S.user.name)}" onclick="go('login')">${esc(S.user.name[0].toUpperCase())}</button>`:''}</nav><main ${keep?'style="animation:none"':''}>${V[view]()}</main>`;
 document.querySelectorAll('[data-n]').forEach(e=>{const n=+e.dataset.n;let i=0;const id=setInterval(()=>{i++;e.textContent=Math.round(n*i/25);if(i>=25)clearInterval(id)},30)});
 const cb=$('#cb');if(cb)cb.scrollTop=cb.scrollHeight;confetti=false}
render();