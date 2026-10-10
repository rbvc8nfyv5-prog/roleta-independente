
(function(){
'use strict';

/*
 ANÁLISE BETA
 12 MOTORES / DÚZIAS / DUPLAS FÍSICAS
 Histórico: últimos 20 resultados.
 G1 individual para cada linha.
*/

const KEY='ANALISE_BETA_12_DUZIAS_DUPLAS_V2';
const LEGACY='ANALISE_BETA_HISTORICO_COMPLETO_20_V1';

const TRACK=[
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

const RED=new Set([
1,3,5,7,9,12,14,16,18,
19,21,23,25,27,30,32,34,36
]);

const MOTORS=[
'NORMAL',
'DINAMICO',
'RX_NORMAL',
'RX_DINAMICO'
];

const RX=[4,5,6];

const BREAK={
1:[13,14,15,16,17,18],
2:[0,26,3,35,28,7,6,30],
3:[23,10,24,20,22,21,4,19]
};

const PHYSICAL={
1:[
[3,12,7],
[4,2,21],
[11,8,5],
[6,1,9]
],
2:[
[13,36,11,30,8],
[23,10,5,24,16],
[15,19,17,14,20,18]
],
3:[
[25,17,34,6,27],
[32,15,19,4,21],
[29,7,28,12,35,3,26],
[31,9,22,18,33]
]
};

const $=id=>document.getElementById(id);
const idx=n=>TRACK.indexOf(n);
const at=i=>TRACK[(i%37+37)%37];
const offset=(n,d)=>at(idx(n)+d);

const dist=(a,b)=>{
let d=Math.abs(idx(a)-idx(b));
return Math.min(d,37-d);
};

const setor=(n,r)=>
Array.from(
{length:r*2+1},
(_,i)=>offset(n,i-r)
);

const dozen=n=>n===0?0:Math.ceil(n/12);

const mean=a=>
a.length
?a.reduce((s,v)=>s+v,0)/a.length
:0;

const pct=v=>(v*100).toFixed(0)+'%';

const empty=()=>({
history:[],
mode:'AUTO',
motor:'NORMAL',
rx:6,
lines:{},
visual:[],
selected:null
});

let state=empty();

try{
let saved=JSON.parse(
localStorage.getItem(KEY)||'null'
);

if(saved&&typeof saved==='object'){
state={...state,...saved};
}else{
let h=JSON.parse(
localStorage.getItem(LEGACY)||'[]'
);
if(Array.isArray(h))state.history=h;
}
}catch(e){}

state.history=(state.history||[])
.map(Number)
.filter(n=>
Number.isInteger(n)&&n>=0&&n<=36
)
.slice(-20);

state.lines=state.lines||{};

state.visual=Array.isArray(state.visual)
?state.visual.slice(-14)
:[];

for(const m of MOTORS){
for(const r of RX){
let k=m+'_'+r;
state.lines[k]=state.lines[k]||{
events:[],
pending:null
};
}
}

state.lines.AUTO=state.lines.AUTO||{
events:[],
pending:null
};

function save(){
state.history=state.history.slice(-20);
state.visual=state.visual.slice(-14);

for(const l of Object.values(state.lines)){
l.events=(l.events||[]).slice(-20);
}

try{
localStorage.setItem(
KEY,
JSON.stringify(state)
);
}catch(e){}
}

function window20(h){
return h.slice(-20);
}

function heat(h){
let a=Array(37).fill(0);

h.forEach((n,i)=>{
let rec=.48+.52*(i+1)/h.length;

for(let j=0;j<37;j++){
let d=dist(n,TRACK[j]);

if(d<=5){
a[j]+=
rec*[1,.80,.54,.32,.17,.07][d];
}
}
});

let mx=Math.max(.001,...a);
return a.map(v=>v/mx);
}

function trend(h){

h=window20(h);

let w={1:0,2:0,3:0};
let count={1:0,2:0,3:0};
let pairs={1:0,2:0,3:0};
let breaks={1:0,2:0,3:0};

let hs=heat(h);
let transitions=[];

h.forEach((n,i)=>{
let d=dozen(n);
if(!d)return;

let rec=
.40+.60*(i+1)/Math.max(1,h.length);

w[d]+=rec;
count[d]++;

if(BREAK[d].includes(n)){
breaks[d]+=rec;
}
});

for(let i=1;i<h.length;i++){

let a=h[i-1];
let b=h[i];
let d=dist(a,b);
let rec=.45+.55*(i+1)/h.length;

if(d<=2){

for(let z=1;z<=3;z++){

let own=
(dozen(a)===z?1:0)+
(dozen(b)===z?1:0);

pairs[z]+=
rec*
(own===2?1:own===1?.45:.12)*
(d===1?1:.68);
}

transitions.push({a,b,d,rec});
}
}

let raw={};

for(let d=1;d<=3;d++){

let ph=PHYSICAL[d].flat();

let sum=mean(
ph.map(n=>hs[idx(n)])
);

raw[d]=
w[d]*.48+
sum*3.5+
pairs[d]*.90+
breaks[d]*.20;
}

let max=Math.max(
.0001,
...Object.values(raw)
);

let ranking=[1,2,3]
.map(d=>({
d,
count:count[d],
strength:raw[d]/max,
pairs:pairs[d],
breaks:breaks[d]
}))
.sort((a,b)=>b.strength-a.strength);

let center=new Map();

for(let n of TRACK){

let score=0;

for(let d=1;d<=3;d++){

let s=raw[d]/max;
let own=dozen(n)===d?1:.12;

let physical=0;

for(let group of PHYSICAL[d]){
for(let q of group){

let dd=dist(n,q);

physical=Math.max(
physical,
dd===0?1:
dd===1?.77:
dd===2?.48:
dd===3?.20:0
);
}
}

let br=0;

for(let q of BREAK[d]){

let dd=dist(n,q);

br=Math.max(
br,
dd===0?1:
dd===1?.62:
dd===2?.26:0
);
}

score+=s*(
own*.55+
physical*.42+
br*.16
);
}

let pair=0;

for(let t of transitions){

let da=dist(n,t.a);
let db=dist(n,t.b);

pair+=t.rec*(
da<=2&&db<=2
?1
:da<=3||db<=3?.28:0
);
}

center.set(
n,
score+
hs[idx(n)]*.75+
pair*.24
);
}

let maxc=Math.max(
.001,
...center.values()
);

for(let n of TRACK){
center.set(
n,
center.get(n)/maxc
);
}

return {
ranking,
center,
heat:hs,
transitions
};
}

function recentScores(h,rx){

let a=new Map(
TRACK.map(n=>[n,0])
);

h.forEach((n,i)=>{

let age=h.length-1-i;

let dec=Math.pow(
rx===4?.77:
rx===5?.81:.85,
age
);

for(let q of TRACK){

let d=dist(n,q);

if(d<=4){
a.set(
q,
a.get(q)+
dec*[1,.72,.44,.22,.09][d]
);
}
}
});

let max=Math.max(
.001,
...a.values()
);

for(let n of TRACK){
a.set(n,a.get(n)/max);
}

return a;
}

function replicaScores(h,rx){

let map=new Map(
TRACK.map(n=>[n,0])
);

if(h.length<rx*2+3){
return map;
}

let now=h.slice(-rx);
let matches=[];

for(let i=0;i+rx<h.length-rx;i++){

let s=0;

for(let k=0;k<rx;k++){

let d=dist(
now[k],
h[i+k]
);

s+=
d===0?1:
d<=2?.62:
d<=5?.25:0;

if(
dozen(now[k])===
dozen(h[i+k])
){
s+=.28;
}
}

matches.push({
n:h[i+rx],
s:s/rx,
i
});
}

matches.sort(
(a,b)=>b.s-a.s||b.i-a.i
);

for(let x of matches.slice(
0,
Math.max(
3,
Math.ceil(matches.length*.28)
)
)){

for(let q of TRACK){

let d=dist(x.n,q);

if(d<=4){

map.set(
q,
map.get(q)+
(x.s+.15)*
[1,.72,.42,.18,.07][d]
);
}
}
}

let max=Math.max(
.001,
...map.values()
);

for(let n of TRACK){
map.set(n,map.get(n)/max);
}

return map;
}

function centerScores(
h,m,rx,t,events=[]
){

let r=recentScores(h,rx);
let rep=replicaScores(h,rx);
let scores=new Map();

let losses=events
.slice(-3)
.filter(e=>e.status==='LOSS')
.length;

for(let n of TRACK){

let rec=r.get(n);
let sim=rep.get(n);
let tr=t.center.get(n);
let v;

if(m==='NORMAL'){
v=rec*.48+tr*1.40+sim*.18;
}
else if(m==='DINAMICO'){
v=rec*.64+tr*1.22+sim*.42;
}
else if(m==='RX_NORMAL'){
v=sim*.80+tr*1.45+rec*.22;
}
else{
v=sim*.91+tr*1.36+rec*.32;
}

let shifted=0;

if(m.includes('DINAMICO')){

for(let d of [-2,-1,1,2]){

shifted=Math.max(
shifted,
(
r.get(offset(n,d))*.55+
tr*.45
)*
(.93-Math.abs(d)*.08)
);
}
}

scores.set(
n,
v+
shifted*.19+
losses*.015*tr
);
}

return scores;
}

function hole(covered){

for(let i=0;i<37;i++){

if(
!covered.has(TRACK[i])&&
covered.has(at(i-1))&&
covered.has(at(i+1))
){
return true;
}
}

return false;
}

function signature(covered){

return [...covered]
.sort((a,b)=>a-b)
.join(',');
}

function valid(j){

if(
!j||
j.blocks2.length!==5||
j.blocks1.length!==1||
j.covered.size!==28||
hole(j.covered)
){
return false;
}

let all=j.blocks2.concat(j.blocks1);

return all.reduce(
(s,b)=>s+b.numbers.length,
0
)===28;
}

function build(scores,used,seed){

let sorted=TRACK
.map(n=>({
n,
s:scores.get(n)||0
}))
.sort(
(a,b)=>
b.s-a.s||
((idx(a.n)+seed)%37)-
((idx(b.n)+seed)%37)
);

let best=null;
let tries=0;

const seeds=sorted.slice(
0,
Math.min(37,24)
);

function visit(
blocks,
covered,
score,
one
){

if(++tries>180000)return;

if(blocks.length===6){

if(
!one||
covered.size!==28||
hole(covered)
){
return;
}

let b2=blocks.filter(
b=>b.radius===2
);

let b1=blocks.filter(
b=>b.radius===1
);

let sig=signature(covered);

if(used.has(sig))return;

let candidate={
blocks2:b2,
blocks1:b1,
covered:[...covered],
signature:sig,
score
};

if(
!best||
score>best.score
){
best=candidate;
}

return;
}

let need2=
5-blocks.filter(
b=>b.radius===2
).length;

let radius=need2>0?2:1;

let list=sorted;

if(blocks.length===0){

list=seeds
.slice(seed%seeds.length)
.concat(
seeds.slice(
0,
seed%seeds.length
)
);
}

let count=0;

for(let item of list){

let nums=setor(
item.n,
radius
);

if(
nums.some(n=>covered.has(n))
){
continue;
}

let next=new Set(covered);

nums.forEach(n=>next.add(n));

if(hole(next))continue;

let b={
center:item.n,
radius,
numbers:nums
};

visit(
[...blocks,b],
next,
score+item.s+
(radius===2?.015:0),
one||radius===1
);

if(
++count>=(
blocks.length===0?17:
blocks.length===1?15:
blocks.length===2?12:
blocks.length===3?10:
blocks.length===4?8:12
)
){
break;
}

if(tries>180000)break;
}
}

visit(
[],
new Set(),
0,
false
);

if(best)return best;

/* Alternativa geométrica */

for(let step=0;step<37;step++){

for(let gap=0;gap<37;gap++){

let sizes=[5,5,5,5,5,3];
let gaps=[2,2,2,3,0,0];

let shift=gap%6;

gaps=gaps
.slice(shift)
.concat(gaps.slice(0,shift));

let blocks=[];
let covered=new Set();
let p=(step+seed)%37;
let score=0;

for(let i=0;i<6;i++){

let radius=
sizes[i]===5?2:1;

let center=at(p+radius);

let numbers=setor(
center,
radius
);

blocks.push({
center,
radius,
numbers
});

numbers.forEach(
n=>covered.add(n)
);

score+=scores.get(center)||0;

p+=sizes[i]+gaps[i];
}

let j={
blocks2:blocks.slice(0,5),
blocks1:blocks.slice(5),
covered:[...covered],
signature:signature(covered),
score
};

if(
valid({
...j,
covered:new Set(j.covered)
})&&
!used.has(j.signature)&&
(!best||j.score>best.score)
){
best=j;
}
}
}

return best;
}

function scoreOutcome(n,j){

if(!j)return null;

for(let b of j.blocks2.concat(
j.blocks1
)){

if(b.numbers.includes(n)){

return {
green:true,
type:
dist(n,b.center)===0
?'ALVO'
:dist(n,b.center)===1
?'V1'
:'V2'
};
}
}

return {
green:false,
type:'FORA'
};
}

function rates(events){

let done=events.filter(e=>
e.status==='GREEN'||
e.status==='G1'||
e.status==='LOSS'
);

let part=done.slice(-20);

let wins=part.filter(
e=>e.status!=='LOSS'
).length;

return {
total:part.length,
rate:part.length
?wins/part.length
:0,
first:part.length
?part.filter(
e=>e.status==='GREEN'
).length/part.length
:0
};
}

function backtest(h,m,rx){

let results=[];

for(
let i=Math.max(9,rx*2+2);
i<h.length;
i++
){

let prev=h.slice(0,i);
let t=trend(prev);

let scores=centerScores(
prev,m,rx,t
);

let j=build(
scores,
new Set(),
i+rx
);

if(!j)continue;

let o=scoreOutcome(h[i],j);

results.push({
status:o.green?'GREEN':'LOSS'
});
}

return rates(results);
}

function calculate(h){

let t=trend(h);
let used=new Set();
let configs={};

for(let mi=0;mi<MOTORS.length;mi++){

for(let ri=0;ri<RX.length;ri++){

let m=MOTORS[mi];
let rx=RX[ri];
let key=m+'_'+rx;

let events=
state.lines[key].events||[];

let scores=centerScores(
h,m,rx,t,events
);

let j=null;

if(h.length>=8){

for(let attempt=0;attempt<18;attempt++){

let c=build(
scores,
used,
mi*41+ri*13+attempt*7
);

if(
c&&
(!j||c.score>j.score)
){
j=c;
}
}

if(j){
used.add(j.signature);
}
}

let bt=backtest(h,m,rx);
let live=rates(events);

let loss=events
.slice(-4)
.filter(e=>e.status==='LOSS')
.length;

let autoScore=(
bt.rate*.42+
live.rate*.35+
live.first*.23
)*100+
(j?j.score*.9:0)-
loss*3;

configs[key]={
key,
m,
rx,
j,
bt,
live,
autoScore
};
}
}

let candidates=Object.values(configs)
.filter(c=>c.j);

candidates.sort(
(a,b)=>
b.autoScore-a.autoScore||
b.j.score-a.j.score
);

let auto=candidates[0]||null;

return {
t,
configs,
auto
};
}

function lineKeys(){

return [
'AUTO',
...MOTORS.flatMap(
m=>RX.map(r=>m+'_'+r)
)
];
}

function finishLine(key,n){

let line=state.lines[key];
let p=line.pending;

if(!p)return false;

let out=scoreOutcome(n,p.j);

let event=line.events[p.eventIndex];

if(event){

event.status=
out.green?'G1':'LOSS';

event.g1=n;
event.type=out.type;
}

line.pending=null;

return true;
}

function recordLine(key,n,j){

let line=state.lines[key];

if(finishLine(key,n))return;

let out=scoreOutcome(n,j);

let event={
n,
g1:null,
status:
!out?'SEM':
out.green?'GREEN':'WAIT',
type:out?.type||'SEM'
};

line.events.push(event);

line.events=line.events.slice(-20);

if(out&&!out.green){

line.pending={
j:JSON.parse(JSON.stringify(j)),
eventIndex:line.events.length-1
};
}
}

function selectedKey(){

return state.mode==='AUTO'
?'AUTO'
:state.motor+'_'+state.rx;
}

function addNumber(n){

let h=state.history.slice();

let analysis=calculate(h);

let selected=selectedKey();

let active=
selected==='AUTO'
?analysis.auto?.j
:analysis.configs[selected]?.j;

for(let key of lineKeys()){

let j=
key==='AUTO'
?analysis.auto?.j
:analysis.configs[key]?.j;

recordLine(
key,
n,
j||null
);
}

let before=
state.lines[selected]?.events?.at(-1);

let wasG1=
before?.g1===n&&
before?.status!=='WAIT';

state.visual.push({
n,
status:before?.status||'SEM',
g1:wasG1?n:null
});

state.visual=
state.visual.slice(-14);

state.history.push(n);

state.history=
state.history.slice(-20);

save();
render();
}

function resetAnalysis(){

for(let k of lineKeys()){

state.lines[k]={
events:[],
pending:null
};
}

state.visual=[];
}

function importHistory(){

let raw=$('inputHistory').value;

let nums=(
raw.match(
/\b(?:[0-9]|[12][0-9]|3[0-6])\b/g
)||[]
)
.map(Number)
.slice(-20);

if(!nums.length)return;

state.history=nums;

resetAnalysis();

$('inputHistory').value='';

save();
render();
}

function undo(){

if(!state.history.length)return;

state.history.pop();

resetAnalysis();

save();
render();
}

function clear(){

if(!confirm(
'Apagar todo o histórico?'
)){
return;
}

state.history=[];

resetAnalysis();

save();
render();
}

function ball(n){

return \`<span class="ball" style="background:\${
n===0
?'#087c48'
:RED.has(n)
?'#b71c36'
:'#171717'
}">\${n}</span>\`;
}

function name(m){

return {
NORMAL:'NORMAL',
DINAMICO:'DINÂMICO',
RX_NORMAL:'RAIO-X NORMAL',
RX_DINAMICO:'RAIO-X DINÂMICO'
}[m]||m;
}

function renderTimeline(key,label){

let l=state.lines[key];

let events=(
l?.events||[]
).slice(-20);

let r=rates(events);

return \`
<div class="tl">
<span>\${label}</span>
<div class="marks">
\${events.map(e=>\`
<b class="\${e.status.toLowerCase()}">
\${
e.status==='GREEN'?'G':
e.status==='G1'?'G1':
e.status==='LOSS'?'L':
e.status==='WAIT'?'…':'—'
}
</b>
\`).join('')}
</div>
<strong>\${
r.total?pct(r.rate):'—'
}</strong>
</div>\`;
}

function render(){

let h=state.history;
let analysis=calculate(h);
let t=analysis.t;

let activeKey=selectedKey();

let active=
activeKey==='AUTO'
?analysis.auto
:analysis.configs[activeKey];

let frozen=
state.lines[activeKey]?.pending?.j;

let j=frozen||active?.j;

$('historyCount').textContent=
h.length+'/20';

$('historyBalls').innerHTML=
h.map(ball).join('');

$('autoResult').textContent=
analysis.auto
?\`AUTO: \${name(analysis.auto.m)} C\${analysis.auto.rx} • SCORE \${analysis.auto.autoScore.toFixed(1)}\`
:'AUTO: AGUARDANDO DADOS';

$('trend').innerHTML=
t.ranking.map((d,i)=>\`
<div class="trend \${i===0?'dominant':''}">
<small>
\${d.d}ª DÚZIA
\${i===0?'• DOMINANTE':''}
</small>
<strong>\${pct(d.strength)}</strong>
<span>
\${d.count}/20 •
DUPLAS \${d.pairs.toFixed(1)} •
QUEBRAS \${d.breaks.toFixed(1)}
</span>
</div>
\`).join('');

$('trendNote').textContent=
'DÚZIAS: 1–12 | 13–24 | 25–36 • Análise de duplas, vizinhos físicos e zonas de quebra integrada aos 12 motores.';

$('choices').innerHTML=
\`<button class="mode \${
state.mode==='AUTO'?'active':''
}" data-mode="AUTO">AUTO</button>\`+
MOTORS.map(m=>\`
<div class="modegroup">
<small>\${name(m)}</small>
<div>
\${RX.map(r=>\`
<button
class="mode \${
state.mode==='MANUAL'&&
state.motor===m&&
state.rx===r
?'active':''
}"
data-m="\${m}"
data-r="\${r}">
C\${r}
</button>
\`).join('')}
</div>
</div>
\`).join('');

$('choices')
.querySelectorAll('button')
.forEach(b=>{

b.onclick=()=>{

if(b.dataset.mode==='AUTO'){

state.mode='AUTO';

}else{

state.mode='MANUAL';
state.motor=b.dataset.m;
state.rx=Number(b.dataset.r);
}

save();
render();
};
});

$('timelines').innerHTML=
renderTimeline('AUTO','AUTO')+
MOTORS.map(m=>\`
<div class="tlhead">\${name(m)}</div>
\${RX.map(r=>
renderTimeline(
m+'_'+r,
'C'+r
)
).join('')}
\`).join('');

$('summary').innerHTML=\`
<div>
<small>BT AUTO</small>
<strong>\${
analysis.auto
?pct(analysis.auto.bt.rate)
:'—'
}</strong>
</div>
<div>
<small>REAL AUTO</small>
<strong>\${
pct(rates(
state.lines.AUTO.events
).rate)
}</strong>
</div>
<div>
<small>MOTOR ATIVO</small>
<strong>\${
active?name(active.m):'—'
}</strong>
</div>
<div>
<small>G1</small>
<strong>\${
frozen?'CONGELADO':'LIVRE'
}</strong>
</div>
\`;

$('current').innerHTML=j?\`
<div class="currentTitle">
\${
frozen
?'JOGADA CONGELADA • G1'
:'JOGADA ATUAL'
}
•
\${
active
?name(active.m)+' C'+active.rx
:'AUTO'
}
• 28 NÚMEROS
</div>

<div class="blocks">

\${j.blocks2.map(b=>\`
<div class="block">
<small>2 VIZINHOS</small>
<strong>\${b.center}</strong>
<span>\${b.numbers.join(' • ')}</span>
</div>
\`).join('')}

\${j.blocks1.map(b=>\`
<div class="block one">
<small>1 VIZINHO</small>
<strong>\${b.center}</strong>
<span>\${b.numbers.join(' • ')}</span>
</div>
\`).join('')}

</div>

<div class="numbers">
COBERTURA:
\${j.covered.slice()
.sort((a,b)=>a-b)
.join(' • ')}
</div>
\`:
'<div class="waiting">AGUARDANDO HISTÓRICO SUFICIENTE</div>';

$('last14').innerHTML=
state.visual.map(e=>\`
<div class="last \${e.status.toLowerCase()}">
\${ball(e.n)}
<small>
\${e.status}
\${e.g1!==null?' • '+e.g1:''}
</small>
</div>
\`).join('');

$('status').textContent=
\`\${h.length}/20 • 12 MOTORES INDEPENDENTES • 5 CENTROS COM 2 VIZINHOS + 1 CENTRO COM 1 VIZINHO • SEM SOBREPOSIÇÃO • SEM BURACO DE 1 • G1 INDIVIDUAL\`;
}

/* INTERFACE */

document.body.innerHTML=\`

<style>

*{
box-sizing:border-box
}

body{
margin:0;
background:#101012;
color:#f6f6f6;
font-family:Arial,sans-serif
}

.app{
max-width:950px;
margin:auto;
padding:9px
}

h2{
text-align:center;
margin:9px;
font-size:21px
}

.panel{
background:#1c1c20;
border:1px solid #414147;
border-radius:11px;
padding:10px;
margin-bottom:8px
}

.label{
color:#a1a1a1;
font-size:10px;
font-weight:900;
margin:5px 0 8px
}

textarea{
width:100%;
height:58px;
background:#0e0e10;
border:1px solid #56565d;
color:white;
border-radius:8px;
padding:9px
}

.buttons{
display:flex;
flex-wrap:wrap;
gap:6px;
margin-top:8px
}

button{
font-family:inherit;
cursor:pointer;
font-weight:bold;
color:white;
border:1px solid #5b5b60;
border-radius:7px;
background:#34343a;
padding:9px
}

.ok{
background:#176b3e
}

.danger{
background:#812d35
}

.mode{
margin:3px;
background:#29292e
}

.mode.active{
background:#006d86;
border-color:#00d9ff
}

.modegroup{
display:inline-block;
vertical-align:top;
margin:6px 8px 3px 0
}

.modegroup small{
display:block;
font-size:9px;
color:#aaa;
font-weight:bold
}

.auto{
color:#00e5ff;
border:1px solid #007b93;
background:#111;
border-radius:7px;
padding:9px;
margin:8px 0;
font-size:11px;
font-weight:bold
}

.trends{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:6px
}

.trend{
background:#121214;
border:1px solid #48484a;
border-radius:8px;
padding:9px;
text-align:center
}

.trend.dominant{
border-color:#00e676
}

.trend small,
.trend span{
display:block;
color:#aaa;
font-size:9px
}

.trend strong{
display:block;
font-size:22px;
margin:4px
}

.hint{
font-size:9px;
color:#aaa;
margin:8px 0
}

.summary{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:5px
}

.summary>div{
background:#111;
border:1px solid #393939;
border-radius:7px;
padding:8px;
text-align:center
}

.summary small{
display:block;
color:#aaa;
font-size:8px
}

.summary strong{
display:block;
font-size:12px;
margin-top:4px
}

.tlhead{
font-size:9px;
color:#999;
margin-top:12px;
border-top:1px solid #383838;
padding-top:8px;
font-weight:900
}

.tl{
display:grid;
grid-template-columns:82px 1fr 45px;
align-items:center;
gap:5px;
margin:5px 0;
font-size:10px
}

.tl>strong{
text-align:right
}

.marks{
display:flex;
justify-content:flex-end;
gap:2px;
overflow:hidden
}

.marks b{
display:inline-flex;
align-items:center;
justify-content:center;
min-width:19px;
height:20px;
border-radius:4px;
background:#555;
font-size:8px
}

.marks .green{
background:#008f4c
}

.marks .g1{
background:#e0a600;
color:#151515
}

.marks .loss{
background:#bf2634
}

.marks .wait{
background:#765a13
}

.ball{
display:inline-flex;
align-items:center;
justify-content:center;
width:31px;
height:31px;
min-width:31px;
border:1px solid #888;
border-radius:50%;
font-size:12px;
font-weight:900
}

.historyBalls{
display:flex;
flex-wrap:wrap;
gap:4px;
margin:8px 0
}

.blocks{
display:flex;
overflow-x:auto;
gap:6px;
padding:5px 0
}

.block{
min-width:130px;
background:#111;
border:1px solid #00bce0;
border-radius:8px;
text-align:center;
padding:8px
}

.block.one{
border-color:#ffc107
}

.block small{
display:block;
font-size:9px;
color:#aaa
}

.block strong{
display:block;
font-size:24px;
margin:5px
}

.block span{
display:block;
border-top:1px solid #444;
padding-top:5px;
font-size:10px
}

.currentTitle{
font-size:10px;
color:#00e5ff;
font-weight:bold
}

.numbers{
font-size:10px;
color:#bbb;
line-height:1.8;
margin-top:9px
}

.waiting{
color:#888;
padding:15px
}

.last14{
display:grid;
grid-template-columns:repeat(7,1fr);
gap:5px
}

.last{
border:1px solid #555;
border-radius:7px;
text-align:center;
padding:7px 2px;
background:#252525
}

.last.green{
border-color:#00ad62
}

.last.g1{
border-color:#ffc107
}

.last.loss{
border-color:#e13a46
}

.last.wait{
border-color:#c49a18
}

.last small{
display:block;
margin-top:4px;
font-size:8px
}

.keyboard{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:5px
}

.keyboard button{
height:41px;
font-size:14px
}

.keyboard .zero{
grid-column:span 6
}

.status{
color:#00e676;
font-size:9px;
font-weight:bold;
line-height:1.6;
margin-top:9px
}

@media(max-width:600px){

.trends{
grid-template-columns:repeat(3,1fr)
}

.trend span{
font-size:8px
}

.summary{
grid-template-columns:repeat(2,1fr)
}

.last14{
grid-template-columns:repeat(4,1fr)
}

.tl{
grid-template-columns:55px 1fr 35px
}

.marks b{
min-width:15px;
height:18px;
font-size:7px
}

}

</style>

<div class="app">

<h2>ANÁLISE BETA</h2>

<div class="panel">

<div class="label">
HISTÓRICO •
<span id="historyCount"></span>
</div>

<textarea
id="inputHistory"
placeholder="Cole até 20 resultados, do mais antigo ao mais recente">
</textarea>

<div class="buttons">

<button class="ok" id="insert">
INSERIR
</button>

<button id="undo">
APAGAR ÚLTIMO
</button>

<button class="danger" id="clear">
APAGAR TUDO
</button>

</div>

<div
id="historyBalls"
class="historyBalls">
</div>

<div
class="status"
id="status">
</div>

</div>

<div class="panel">

<div class="label">
AUTO • 12 JOGADAS INDEPENDENTES
</div>

<div id="choices"></div>

<div
class="auto"
id="autoResult">
</div>

<div class="label">
TENDÊNCIA DE DÚZIAS •
DUPLAS FÍSICAS •
ZONAS DE QUEBRA
</div>

<div
id="trend"
class="trends">
</div>

<div
id="trendNote"
class="hint">
</div>

<div
id="summary"
class="summary">
</div>

<div
class="label"
style="margin-top:14px">
TIMELINES INDIVIDUAIS • G1
</div>

<div id="timelines"></div>

</div>

<div class="panel">

<div class="label">
ÚLTIMAS 14 JOGADAS
</div>

<div
id="last14"
class="last14">
</div>

</div>

<div class="panel">

<div class="label">
JOGADA
</div>

<div id="current"></div>

</div>

<div class="panel">

<div class="label">
TECLADO
</div>

<div
id="keyboard"
class="keyboard">
</div>

</div>

</div>
\`;

$('insert').onclick=importHistory;
$('undo').onclick=undo;
$('clear').onclick=clear;

for(let n=1;n<=36;n++){

let b=document.createElement(
'button'
);

b.textContent=n;

b.style.background=
RED.has(n)
?'#b71c36'
:'#171717';

b.onclick=()=>addNumber(n);

$('keyboard').appendChild(b);
}

let z=document.createElement(
'button'
);

z.textContent='0';
z.className='zero';
z.style.background='#087c48';
z.onclick=()=>addNumber(0);

$('keyboard').appendChild(z);

save();
render();

})();
