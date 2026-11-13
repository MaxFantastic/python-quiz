const APP_VERSION = '7.0.5';
const BUILD_ID = '2026-11-13.9';
const DATA_URL = './questions.json';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/MaxFantastic/python-quiz/main';
const STORAGE_KEY = 'pythonQuizIphone.v1'; // 永远保持不变：继承旧版本地学习记录
const $ = id => document.getElementById(id);
const viewIds = ['homeView','chaptersView','lecturesView','profileView','quizView','resultView'];
const tabViewIds = ['homeView','chaptersView','lecturesView','profileView'];
const letters = ['A','B','C','D'];
let data, questions=[], chapters={}, state, session=null, updateBusy=false, lastUpdateCheck=0;

function defaultState(){return {stats:{},wrong:[],session:null,lastResult:null};}
function loadState(){try{return {...defaultState(),...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')};}catch{return defaultState();}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
function getQ(id){return questions.find(q=>q.id===id);}
function eligible(q){return q.answer!==null && q.answer!==undefined;}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function setVersionUI(){ $('appVersion').textContent='V'+APP_VERSION; }
function showView(id){
  viewIds.forEach(v=>$(v).classList.toggle('active',v===id));
  $('appShell').dataset.screen=id;
  document.documentElement.dataset.screen=id;
  $('bottomTabs').classList.toggle('hidden',!tabViewIds.includes(id));
  document.querySelectorAll('.tab-button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  if(id==='profileView')renderProfile();
}
function statsSummary(){
  const attempted=Object.values(state.stats||{}).filter(x=>x&&x.attempts>0);
  const total=attempted.reduce((s,x)=>s+x.attempts,0);
  const correct=attempted.reduce((s,x)=>s+(x.correct||0),0);
  return {total,correct,accuracy:total?Math.round(correct/total*100):null};
}
function renderHome(){
  const s=statsSummary();
  $('statAnswered').textContent=s.total;$('statCorrect').textContent=s.correct;$('statAccuracy').textContent=s.accuracy===null?'—':s.accuracy+'%';
  $('wrongCount').textContent=state.wrong.filter(id=>!!getQ(id)).length;
  const sourceCount=questions.filter(q=>q.chapter<=6).length;
  const slideCount=questions.length-sourceCount;
  $('heroCount').textContent=questions.length;
  $('heroSummary').textContent=`课堂习题 ${sourceCount} 道 + 课件精选 ${slideCount} 道`;
  $('allModeCount').textContent=`${questions.length} 道题随机练习`;
  renderChapterLists();
  const hasResume=!!(state.session && state.session.ids?.length && state.session.index<state.session.ids.length);
  $('resumeCard').classList.toggle('hidden',!hasResume);
  if(hasResume)$('resumeMeta').textContent=`${state.session.title} · 已完成 ${state.session.index}/${state.session.ids.length} 题`;
}
function renderChapterLists(){
  $('chapterList').innerHTML='';$('lectureList').innerHTML='';
  let exerciseN=0,lectureN=0;
  Object.entries(chapters).forEach(([num,name])=>{
    const n=Number(num),isLecture=n>=7,qs=questions.filter(q=>q.chapter===n);
    if(!qs.length)return;
    const done=qs.filter(q=>state.stats[q.id]?.attempts).length;
    const label=isLecture?`课件第 ${n-7} 讲`:`习题 ${num}`;
    const b=document.createElement('button');b.className='chapter-item';b.type='button';
    b.innerHTML=`<span class="chapter-index">${isLecture?'P'+(n-7):String(num).padStart(2,'0')}</span><span class="chapter-copy"><span class="chapter-name">${escapeHTML(name)}</span><span class="chapter-sub">${label} · 已练 ${done}/${qs.length}</span></span><span class="chapter-count">${qs.length} 题</span><span class="chapter-arrow">›</span>`;
    b.addEventListener('click',()=>startSession(qs.map(q=>q.id),isLecture?name:`习题 ${num} · ${name}`));
    $(isLecture?'lectureList':'chapterList').appendChild(b);
    if(isLecture)lectureN++;else exerciseN++;
  });
  $('exerciseCount').textContent=`${exerciseN} 个章节`;$('lectureCount').textContent=`${lectureN} 个章节`;
}
function renderProfile(){
  const s=statsSummary();
  $('profileAnswered').textContent=s.total;$('profileAccuracy').textContent=s.accuracy===null?'—':s.accuracy+'%';
  $('profileWrong').textContent=state.wrong.filter(id=>!!getQ(id)).length;
}
function startSession(ids,title){
  if(!ids.length){alert('当前没有可练习的题目。');return;}
  session={ids:shuffle(ids),index:0,answers:{},title,wrongIds:[],correct:0,wrong:0,unscored:0};
  state.session=session;saveState();renderQuestion();showView('quizView');
}
function resumeSession(){if(!state.session)return;session=state.session;renderQuestion();showView('quizView');}
function currentQ(){return getQ(session.ids[session.index]);}
function renderQuestion(){
  const q=currentQ();if(!q){finishSession();return;}
  const n=session.index+1,total=session.ids.length,pct=Math.round((n-1)/total*100);
  $('progressText').textContent=`第 ${n} / ${total} 题`;$('progressPercent').textContent=pct+'%';$('progressBar').style.width=pct+'%';
  $('quizModeLabel').textContent=session.title;$('questionChapter').textContent=q.source?`课件 · 第${q.chapter-7}讲`:`习题 ${q.chapter}`;
  $('questionNumber').textContent=`QUESTION ${String(n).padStart(2,'0')}`;$('questionText').textContent=q.text;
  const list=$('optionsList');list.innerHTML='';$('feedback').className='feedback hidden';$('feedback').textContent='';
  letters.forEach(letter=>{if(!(letter in q.options))return;const b=document.createElement('button');b.className='option-button';b.type='button';b.innerHTML=`<span class="option-letter">${letter}</span><span class="option-content">${escapeHTML(q.options[letter])}</span>`;b.addEventListener('click',()=>chooseAnswer(letter));list.appendChild(b);});
  const prev=session.answers[q.id];if(prev)showFeedback(prev.choice,true);
  $('nextBtn').disabled=!prev;$('nextBtn').textContent=n===total?'查看结果':'下一题';
}
function chooseAnswer(letter){
  const q=currentQ();if(session.answers[q.id])return;
  const isScored=eligible(q),correct=isScored&&letter===q.answer;
  session.answers[q.id]={choice:letter,correct,scored:isScored};
  if(!isScored)session.unscored++;else if(correct)session.correct++;else{session.wrong++;session.wrongIds.push(q.id);if(!state.wrong.includes(q.id))state.wrong.push(q.id);}
  if(isScored){const stat=state.stats[q.id]||{attempts:0,correct:0};stat.attempts++;if(correct){stat.correct++;state.wrong=state.wrong.filter(id=>id!==q.id);}state.stats[q.id]=stat;}
  state.session=session;saveState();showFeedback(letter,false);$('nextBtn').disabled=false;$('nextBtn').textContent=session.index===session.ids.length-1?'查看结果':'下一题';
}
function showFeedback(choice,restoring){
  const q=currentQ(),scored=eligible(q),buttons=[...$('optionsList').querySelectorAll('.option-button')];
  buttons.forEach(b=>{const l=b.querySelector('.option-letter').textContent;b.disabled=true;if(scored&&l===q.answer)b.classList.add('correct');if(l===choice&&scored&&choice!==q.answer)b.classList.add('incorrect');if(l===choice&&!scored)b.classList.add('selected');});
  const f=$('feedback');f.className='feedback '+(scored?(choice===q.answer?'good':'bad'):'neutral');
  const origin=q.source?`<div class="feedback-origin">📖 ${escapeHTML(q.source)} · 第 ${Number(q.source_page)} 页</div>`:'';
  if(!scored)f.innerHTML=`<strong>本题存在答案争议，不计入成绩</strong>${escapeHTML(q.note||'原题答案可能存在疑点。')}${q.source_answer?`<br>原资料标注答案：${escapeHTML(q.source_answer)}`:''}${origin}`;
  else if(choice===q.answer)f.innerHTML=`<strong>回答正确 ✓</strong>${q.note?escapeHTML(q.note):'很好，继续保持。'}${origin}`;
  else f.innerHTML=`<strong>回答错误 · 正确答案：${q.answer}</strong>${q.note?escapeHTML(q.note):'记下这个知识点，稍后可以在错题本中复习。'}${origin}`;
  if(restoring)$('nextBtn').disabled=false;
}
function nextQuestion(){if(!session.answers[currentQ().id])return;session.index++;state.session=session;saveState();if(session.index>=session.ids.length)finishSession();else renderQuestion();}
function finishSession(){
  const scored=session.correct+session.wrong,accuracy=scored?Math.round(session.correct/scored*100):0;
  const result={title:session.title,total:session.ids.length,correct:session.correct,wrong:session.wrong,unscored:session.unscored,accuracy,wrongIds:[...new Set(session.wrongIds)]};
  state.lastResult=result;state.session=null;saveState();renderResult(result);renderHome();showView('resultView');
}
function renderResult(r){
  $('resultAccuracy').textContent=r.accuracy+'%';$('scoreRing').style.setProperty('--score',r.accuracy+'%');$('resultCorrect').textContent=r.correct;$('resultWrong').textContent=r.wrong;$('resultUnscored').textContent=r.unscored;
  $('resultTitle').textContent=r.wrong===0?'漂亮，全部掌握！':r.accuracy>=80?'表现不错！':'继续巩固';
  $('resultSubtitle').textContent=`本次完成 ${r.total} 道题，正确率按可判分题目计算。`;$('resultIcon').textContent=r.accuracy>=80?'✓':'↗';
  $('reviewWrongBtn').disabled=!r.wrongIds.length;$('reviewWrongBtn').style.opacity=r.wrongIds.length?1:.45;
  $('resultNotes').textContent=r.unscored?`本次有 ${r.unscored} 道题在原资料中存在答案疑点，已排除在正确率之外。`:'';
}
function startWrongReview(){const ids=state.wrong.filter(id=>getQ(id));startSession(ids,'错题复习');}
function showHelp(){$('helpModal').classList.remove('hidden');}
function hideHelp(){$('helpModal').classList.add('hidden');}
function quitSession(){if(confirm('退出本次练习？当前进度会保留，可以稍后继续。')){state.session=session;saveState();renderHome();showView('homeView');}}

function setupTabs(){
  document.querySelectorAll('.tab-button').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.view)));
}
function setupRecoveryTools(){
  $('layoutDiagnosticBtn')?.addEventListener('click',showLayoutDiagnostics);
  $('exportBtn')?.addEventListener('click',exportLearningData);
  $('importBtn')?.addEventListener('click',()=>$('importFile').click());
  $('importFile')?.addEventListener('change',async()=>{
    const file=$('importFile').files?.[0];if(!file)return;
    try{
      const info=JSON.parse(await file.text());
      if(info.format!=='python-quiz-backup'||!info.data||typeof info.data!=='object'||!Array.isArray(info.data.wrong)||typeof info.data.stats!=='object'||!info.data.stats||Array.isArray(info.data.stats))throw Error('文件不是有效的题库备份');
      if(!confirm('确定恢复备份吗？这会覆盖当前设备的学习记录，建议先备份现有记录。'))return;
      localStorage.setItem(STORAGE_KEY,JSON.stringify(info.data));state=loadState();session=null;renderHome();renderProfile();showView('profileView');alert('学习记录已恢复。');
    }catch(error){alert('无法导入：'+(error.message||'文件格式有误'));}
    finally{$('importFile').value='';}
  });
  $('updateBtn')?.addEventListener('click',()=>checkForUpdates({source:'button'}));
  $('githubUpdateBtn')?.addEventListener('click',()=>checkForUpdates({source:'button'}));
  if('serviceWorker' in navigator){
    let reloading=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;setGlobalStatus('更新已激活，正在重载');location.reload();});
  }
}
function showLayoutDiagnostics(){
  const root=document.documentElement;
  const shell=document.getElementById('appShell');
  const nav=document.getElementById('bottomTabs');
  const vv=window.visualViewport;
  const shellRect=shell?.getBoundingClientRect();
  const navRect=nav?.getBoundingClientRect();
  const probe=document.createElement('div');
  probe.setAttribute('aria-hidden','true');
  probe.style.cssText='position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);';
  document.body.appendChild(probe);
  const probeStyle=getComputedStyle(probe);
  const safeTop=parseFloat(probeStyle.paddingTop)||0;
  const safeBottom=parseFloat(probeStyle.paddingBottom)||0;
  probe.remove();
  const n=v=>Number.isFinite(v)?Math.round(v*10)/10:'—';
  const report=[
    'Python Quiz iOS 布局诊断（单位：CSS px）',
    `显示模式：${root.dataset.displayMode||'未设置'}`,
    `navigator.standalone：${String(window.navigator.standalone)}`,
    `display-mode standalone：${String(!!window.matchMedia?.('(display-mode: standalone)').matches)}`,
    `screen：${screen.width} × ${screen.height}`,
    `window.inner：${window.innerWidth} × ${window.innerHeight}`,
    `documentElement.clientHeight：${root.clientHeight}`,
    `visualViewport：${vv?`${n(vv.width)} × ${n(vv.height)}，offsetTop ${n(vv.offsetTop)}，pageTop ${n(vv.pageTop)}`:'不可用'}`,
    `devicePixelRatio：${window.devicePixelRatio}`,
    `safe-area top/bottom：${n(safeTop)} / ${n(safeBottom)}`,
    `app-shell top/bottom/height：${shellRect?`${n(shellRect.top)} / ${n(shellRect.bottom)} / ${n(shellRect.height)}`:'未找到'}`,
    `bottom-tabs top/bottom/height：${navRect?`${n(navRect.top)} / ${n(navRect.bottom)} / ${n(navRect.height)}`:'未找到'}`,
    `innerHeight - 导航栏 bottom：${navRect?n(window.innerHeight-navRect.bottom):'—'}`,
    `screen.height - 导航栏 bottom：${navRect?n(screen.height-navRect.bottom):'—'}`,
    '',
    '请把这段诊断信息截图发回；它不会读取或修改学习记录。'
  ];
  alert(report.join('\n'));
}

async function exportLearningData(){
  try{
    const original=localStorage.getItem(STORAGE_KEY),saved=original?JSON.parse(original):defaultState();
    const backup={format:'python-quiz-backup',version:1,source:'iPhone',exportedAt:new Date().toISOString(),data:saved};
    const file=new File([JSON.stringify(backup,null,2)],'python-quiz-progress-'+new Date().toISOString().slice(0,10)+'.json',{type:'application/json'});
    if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'Python Quiz 学习记录备份'});return;}catch(e){if(e?.name==='AbortError')return;}}
    const url=URL.createObjectURL(file),link=document.createElement('a');link.href=url;link.download=file.name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
    alert('已尝试导出学习记录，请在 iPhone「文件」App 中确认保存的 JSON 文件。');
  }catch(e){alert('备份失败：'+(e.message||'未知错误'));}
}
function setGlobalStatus(message){const el=$('globalUpdateStatus');if(el)el.textContent=message;}
function setUpdateStatus(message,kind=''){const el=$('updateStatus');if(el){el.textContent=message;el.className=kind;}}
function compareVersions(a,b){
  const pa=String(a||'0').split('.').map(x=>parseInt(x,10)||0);
  const pb=String(b||'0').split('.').map(x=>parseInt(x,10)||0);
  for(let i=0;i<Math.max(pa.length,pb.length);i++){const d=(pa[i]||0)-(pb[i]||0);if(d)return d>0?1:-1;}
  return 0;
}
async function fetchRemoteVersion(){
  const stamp=Date.now();
  // Pages is the canonical deployed source. Raw GitHub is a fallback; fetch both
  // and select the highest semantic version so a stale CDN cannot downgrade us.
  const urls=[
    `${new URL('./version.json',document.baseURI).href}?_=${stamp}`,
    `https://raw.githubusercontent.com/MaxFantastic/python-quiz/main/version.json?_=${stamp}`
  ];
  const results=await Promise.allSettled(urls.map(async url=>{
    const r=await fetch(url,{cache:'no-store',mode:'cors',headers:{'Cache-Control':'no-cache','Pragma':'no-cache'}});
    if(!r.ok)throw Error(`HTTP ${r.status}`);
    const j=await r.json();
    if(typeof j.version!=='string'||!/^\d+(\.\d+){1,3}$/.test(j.version))throw Error('版本文件格式无效');
    return j;
  }));
  const valid=results.filter(x=>x.status==='fulfilled').map(x=>x.value);
  if(!valid.length)throw Error('GitHub Pages 与仓库版本文件均无法读取');
  valid.sort((a,b)=>compareVersions(a.version,b.version)||(String(a.build||'').localeCompare(String(b.build||''))));
  return valid[valid.length-1];
}
function waitForControllerChange(timeout=18000){return new Promise(resolve=>{let done=false;const finish=v=>{if(done)return;done=true;clearTimeout(timer);navigator.serviceWorker.removeEventListener('controllerchange',onChange);resolve(v);};const onChange=()=>finish(true);const timer=setTimeout(()=>finish(false),timeout);navigator.serviceWorker.addEventListener('controllerchange',onChange,{once:true});});}
async function checkForUpdates({source='manual',silent=false}={}){
  if(updateBusy)return;updateBusy=true;lastUpdateCheck=Date.now();
  const button=$('githubUpdateBtn'),topButton=$('updateBtn');if(button)button.disabled=true;if(topButton)topButton.disabled=true;
  const setMsg=m=>{setUpdateStatus(m);setGlobalStatus(m);};
  if(!silent)setMsg('正在连接 GitHub，检查最新版本……');else setGlobalStatus('正在检查更新');
  try{
    const remote=await fetchRemoteVersion();
    const remoteCount=Number(remote.questionCount||questions.length);
    const versionOrder=compareVersions(remote.version,APP_VERSION);
    // Never label an older remote manifest as an update (the V7/V6 false-positive).
    if(versionOrder<0){
      const message=`已忽略 GitHub 上的旧版本信息 V${remote.version}：当前 App 是 V${APP_VERSION}。请确认仓库根目录 version.json 已更新，并等待 Pages 部署完成。`;
      setUpdateStatus(message,'error');setGlobalStatus('版本信息过旧');
      if(!silent)alert(message+'\n\n学习记录未被修改。');
      return;
    }
    const versionChanged=versionOrder>0||String(remote.build||'')!==BUILD_ID||remoteCount!==questions.length;
    if(!('serviceWorker'in navigator))throw Error('当前环境不支持离线更新');
    let reg=await navigator.serviceWorker.getRegistration();
    if(!reg)reg=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});

    let resolveFound;
    const foundPromise=new Promise(resolve=>{resolveFound=resolve;});
    if(reg.installing)resolveFound(reg.installing);
    reg.addEventListener('updatefound',()=>resolveFound(reg.installing),{once:true});
    const controllerChanged=waitForControllerChange(16000);
    await reg.update();

    let worker=reg.installing||reg.waiting;
    if(!worker)worker=await Promise.race([foundPromise,new Promise(resolve=>setTimeout(()=>resolve(null),1200))]);
    if(worker){
      if(worker.state==='installing'){
        await new Promise(resolve=>{
          const timer=setTimeout(resolve,20000);
          worker.addEventListener('statechange',()=>{
            if(['installed','activated','redundant'].includes(worker.state)){clearTimeout(timer);resolve();}
          });
        });
      }
      const waiting=reg.waiting;
      if(waiting)waiting.postMessage({type:'ACTIVATE_UPDATE'});
      const changed=await controllerChanged;
      if(changed){setMsg('新版本已激活，正在重新载入');setTimeout(()=>location.reload(),300);return;}
      const latest=await navigator.serviceWorker.getRegistration();
      if(latest?.waiting){latest.waiting.postMessage({type:'ACTIVATE_UPDATE'});}
    }

    if(versionChanged){
      const message=`GitHub 有新版本 V${remote.version}（${remoteCount} 道题），已请求更新。若页面未自动刷新，请稍后重新打开 App。`;
      setUpdateStatus(message,'success');setGlobalStatus(`发现 V${remote.version}`);
      if(!silent)alert(message+'\n\n学习记录未被清除。');
    }else{
      const message=`已是最新版本 V${APP_VERSION} · ${questions.length} 道题`;
      setUpdateStatus(message,'success');setGlobalStatus('已是最新版本');
    }
  }catch(error){
    const message=`检查更新失败：${error.message||'网络异常'}。当前学习记录没有被修改。`;
    setUpdateStatus(message,'error');setGlobalStatus('更新检查失败');
    if(!silent)alert(message);
  }finally{updateBusy=false;if(button)button.disabled=false;if(topButton)topButton.disabled=false;}
}
function setupPullToRefresh(){
  const indicator=$('pullIndicator');let startY=0,delta=0,tracking=false,refreshing=false;
  document.addEventListener('touchstart',event=>{
    if(event.touches.length!==1||refreshing)return;
    const y=event.touches[0].clientY;
    if(y>165)return;
    startY=y;delta=0;tracking=true;
  },{passive:true});
  document.addEventListener('touchmove',event=>{
    if(!tracking||event.touches.length!==1)return;
    delta=event.touches[0].clientY-startY;
    if(delta<=0)return;
    if(event.cancelable)event.preventDefault();
    indicator.classList.add('visible');
    indicator.classList.toggle('ready',delta>=72);
    indicator.textContent=delta>=72?'↑ 松开，检查更新':'↓ 继续下拉检查更新';
  },{passive:false});
  const finish=()=>{
    if(!tracking)return;tracking=false;
    const shouldRefresh=delta>=72;
    if(shouldRefresh&&!refreshing){refreshing=true;indicator.classList.add('visible','ready');indicator.textContent='正在检查 GitHub 更新…';checkForUpdates({source:'pull'}).finally(()=>{refreshing=false;indicator.classList.remove('visible','ready');indicator.textContent='↓ 下拉检查更新';});}
    else{indicator.classList.remove('visible','ready');indicator.textContent='↓ 下拉检查更新';}
    startY=0;delta=0;
  };
  document.addEventListener('touchend',finish,{passive:true});document.addEventListener('touchcancel',finish,{passive:true});
}
async function registerServiceWorker(){
  if(!('serviceWorker'in navigator)||!location.protocol.startsWith('http'))return;
  try{const reg=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});reg.update().catch(()=>{});}
  catch(e){setGlobalStatus('离线缓存暂不可用');}
}
function setupAutoUpdate(){
  registerServiceWorker().finally(()=>setTimeout(()=>checkForUpdates({source:'startup',silent:true}),900));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-lastUpdateCheck>5*60*1000)checkForUpdates({source:'resume',silent:true});});
  window.addEventListener('online',()=>checkForUpdates({source:'online',silent:true}));
  setupPullToRefresh();
}
function init(){
  state=loadState();setVersionUI();
  fetch(DATA_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('题库加载失败');return r.json();}).then(d=>{
    data=d;questions=d.questions;chapters=d.chapters;renderHome();renderProfile();setupTabs();
    $('allBtn').addEventListener('click',()=>startSession(questions.map(q=>q.id),'全部题目 · 随机练习'));
    $('wrongBtn').addEventListener('click',startWrongReview);$('resumeBtn').addEventListener('click',resumeSession);
    $('nextBtn').addEventListener('click',nextQuestion);$('backHome').addEventListener('click',quitSession);$('quitBtn').addEventListener('click',quitSession);
    $('resultHome').addEventListener('click',()=>{renderHome();showView('homeView');});
    $('againBtn').addEventListener('click',()=>startSession(questions.map(q=>q.id),'全部题目 · 随机练习'));
    $('reviewWrongBtn').addEventListener('click',()=>startSession(state.lastResult?.wrongIds||[],'本次错题复习'));
    $('helpBtn').addEventListener('click',showHelp);$('closeHelp').addEventListener('click',hideHelp);$('modalBackdrop').addEventListener('click',hideHelp);
    setupRecoveryTools();setupAutoUpdate();
  }).catch(error=>{document.body.innerHTML=`<div style="padding:24px;font:15px -apple-system;line-height:1.6">题库加载失败：${escapeHTML(error.message)}<br>请检查网络，或重新打开应用。</div>`;});
}
init();
