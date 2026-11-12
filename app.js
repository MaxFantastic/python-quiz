const DATA_URL = 'questions.json';
const STORAGE_KEY = 'pythonQuizIphone.v1';
let data, questions, chapters, state, session = null;
const $ = id => document.getElementById(id);
const views = ['homeView','quizView','resultView'];
const letters = ['A','B','C','D'];
function defaultState(){return {stats:{},wrong:[],session:null,lastResult:null};}
function loadState(){try{return {...defaultState(),...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')};}catch{return defaultState();}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function showView(id){views.forEach(v=>$(v).classList.toggle('active',v===id));window.scrollTo({top:0,behavior:'instant'});}
function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
function getQ(id){return questions.find(q=>q.id===id);}
function eligible(q){return q.answer!==null && q.answer!==undefined;}
function renderHome(){
 const stats=Object.values(state.stats);const attempted=stats.filter(x=>x.attempts>0);const total=attempted.reduce((s,x)=>s+x.attempts,0);const correct=attempted.reduce((s,x)=>s+x.correct,0);const unique=attempted.length;
 $('statAnswered').textContent=total;$('statCorrect').textContent=correct;$('statAccuracy').textContent=total?Math.round(correct/total*100)+'%':'—';
 $('wrongCount').textContent=state.wrong.length;
 $('chapterList').innerHTML='';
 Object.entries(chapters).forEach(([num,name])=>{const qs=questions.filter(q=>q.chapter===Number(num));const done=qs.filter(q=>state.stats[q.id]?.attempts).length;const b=document.createElement('button');b.className='chapter-item';b.innerHTML=`<span class="chapter-index">${String(num).padStart(2,'0')}</span><span class="chapter-copy"><span class="chapter-name">${escapeHTML(name)}</span><span class="chapter-sub">习题 ${num} · 已练 ${done}/${qs.length}</span></span><span class="chapter-count">${qs.length} 题</span><span class="chapter-arrow">›</span>`;b.addEventListener('click',()=>startSession(qs.map(q=>q.id),`习题 ${num} · ${name}`));$('chapterList').appendChild(b);});
 $('resumeCard').classList.toggle('hidden',!state.session || !state.session.ids?.length || state.session.index>=state.session.ids.length);
 if(state.session){$('resumeMeta').textContent=`${state.session.title} · 已完成 ${state.session.index}/${state.session.ids.length} 题`;}
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function startSession(ids,title){if(!ids.length){alert('当前没有可练习的题目。');return;}session={ids:shuffle(ids),index:0,answers:{},title,wrongIds:[],correct:0,wrong:0,unscored:0};state.session=session;saveState();renderQuestion();showView('quizView');}
function resumeSession(){if(!state.session)return;session=state.session;renderQuestion();showView('quizView');}
function currentQ(){return getQ(session.ids[session.index]);}
function renderQuestion(){
 const q=currentQ();if(!q){finishSession();return;}
 const n=session.index+1,total=session.ids.length;const pct=Math.round((n-1)/total*100);
 $('progressText').textContent=`第 ${n} / ${total} 题`;$('progressPercent').textContent=`${pct}%`;$('progressBar').style.width=pct+'%';$('quizModeLabel').textContent=session.title;$('questionChapter').textContent=`习题 ${q.chapter}`;$('questionNumber').textContent=`QUESTION ${String(n).padStart(2,'0')}`;$('questionText').textContent=q.text;
 const list=$('optionsList');list.innerHTML='';$('feedback').className='feedback hidden';$('feedback').textContent='';
 letters.forEach(letter=>{if(!(letter in q.options))return;const b=document.createElement('button');b.className='option-button';b.innerHTML=`<span class="option-letter">${letter}</span><span class="option-content">${escapeHTML(q.options[letter])}</span>`;b.addEventListener('click',()=>chooseAnswer(letter));list.appendChild(b);});
 const prev=session.answers[q.id];if(prev)showFeedback(prev.choice,true);
 $('nextBtn').disabled=!prev;$('nextBtn').textContent=n===total?'查看结果':'下一题';
}
function chooseAnswer(letter){const q=currentQ();if(session.answers[q.id])return;const isScored=eligible(q);const correct=isScored && letter===q.answer;session.answers[q.id]={choice:letter,correct,scored:isScored};if(!isScored){session.unscored++;}else if(correct){session.correct++;}else{session.wrong++;session.wrongIds.push(q.id);if(!state.wrong.includes(q.id))state.wrong.push(q.id);}
 if(isScored){const stat=state.stats[q.id]||{attempts:0,correct:0};stat.attempts++;if(correct){stat.correct++;state.wrong=state.wrong.filter(id=>id!==q.id);}state.stats[q.id]=stat;}state.session=session;saveState();showFeedback(letter,false);$('nextBtn').disabled=false;$('nextBtn').textContent=session.index===session.ids.length-1?'查看结果':'下一题';}
function showFeedback(choice,restoring){const q=currentQ();const scored=eligible(q);const buttons=[...$('optionsList').querySelectorAll('.option-button')];buttons.forEach(b=>{const l=b.querySelector('.option-letter').textContent;b.disabled=true;if(scored&&l===q.answer)b.classList.add('correct');if(l===choice&&scored&&choice!==q.answer)b.classList.add('incorrect');if(l===choice&&!scored)b.classList.add('selected');});
 const f=$('feedback');f.className='feedback '+(scored?(choice===q.answer?'good':'bad'):'neutral');
 if(!scored){f.innerHTML=`<strong>本题存在答案争议，不计入成绩</strong>${escapeHTML(q.note||'原题答案可能存在疑点。')}${q.source_answer?`<br>原资料标注答案：${escapeHTML(q.source_answer)}`:''}`;}
 else if(choice===q.answer){f.innerHTML=`<strong>回答正确 ✓</strong>${q.note?escapeHTML(q.note):'很好，继续保持。'}`;}
 else{f.innerHTML=`<strong>回答错误 · 正确答案：${q.answer}</strong>${q.note?escapeHTML(q.note):'记下这个知识点，稍后可以在错题本中复习。'}`;}
 if(restoring){$('nextBtn').disabled=false;}
}
function nextQuestion(){if(!session.answers[currentQ().id])return;session.index++;state.session=session;saveState();if(session.index>=session.ids.length)finishSession();else renderQuestion();}
function finishSession(){const scored=session.correct+session.wrong;const accuracy=scored?Math.round(session.correct/scored*100):0;const result={title:session.title,total:session.ids.length,correct:session.correct,wrong:session.wrong,unscored:session.unscored,accuracy,wrongIds:[...new Set(session.wrongIds)]};state.lastResult=result;state.session=null;saveState();renderResult(result);renderHome();showView('resultView');}
function renderResult(r){$('resultAccuracy').textContent=r.accuracy+'%';$('scoreRing').style.setProperty('--score',r.accuracy+'%');$('resultCorrect').textContent=r.correct;$('resultWrong').textContent=r.wrong;$('resultUnscored').textContent=r.unscored;$('resultTitle').textContent=r.wrong===0?'漂亮，全部掌握！':r.accuracy>=80?'表现不错！':'继续巩固';$('resultSubtitle').textContent=`本次完成 ${r.total} 道题，正确率按可判分题目计算。`;$('resultIcon').textContent=r.accuracy>=80?'✓':'↗';$('reviewWrongBtn').disabled=!r.wrongIds.length;$('reviewWrongBtn').style.opacity=r.wrongIds.length?1:.45;$('resultNotes').textContent=r.unscored?`本次有 ${r.unscored} 道题在原资料中存在答案疑点，已排除在正确率之外。`:'';}
function startWrongReview(){const ids=state.wrong.filter(id=>getQ(id));startSession(ids,'错题复习');}
function resetWrong(){if(!state.wrong.length)return;state.wrong=[];saveState();renderHome();}
function showHelp(){$('helpModal').classList.remove('hidden');}
function hideHelp(){$('helpModal').classList.add('hidden');}
function init(){state=loadState();fetch(DATA_URL).then(r=>{if(!r.ok)throw new Error('题库加载失败');return r.json();}).then(d=>{data=d;questions=d.questions;chapters=d.chapters;renderHome();$('allBtn').addEventListener('click',()=>startSession(questions.map(q=>q.id),'全部题目 · 随机练习'));$('wrongBtn').addEventListener('click',startWrongReview);$('resumeBtn').addEventListener('click',resumeSession);$('nextBtn').addEventListener('click',nextQuestion);$('backHome').addEventListener('click',()=>{if(confirm('退出本次练习？当前进度会保留，可以稍后继续。')){state.session=session;saveState();renderHome();showView('homeView');}});$('quitBtn').addEventListener('click',()=>{if(confirm('退出本次练习？当前进度会保留，可以稍后继续。')){state.session=session;saveState();renderHome();showView('homeView');}});$('resultHome').addEventListener('click',()=>{renderHome();showView('homeView');});$('againBtn').addEventListener('click',()=>startSession(questions.map(q=>q.id),'全部题目 · 随机练习'));$('reviewWrongBtn').addEventListener('click',startWrongReview);$('helpBtn').addEventListener('click',showHelp);$('closeHelp').addEventListener('click',hideHelp);$('modalBackdrop').addEventListener('click',hideHelp);});}
init();
if('serviceWorker' in navigator && location.protocol.startsWith('http')){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
