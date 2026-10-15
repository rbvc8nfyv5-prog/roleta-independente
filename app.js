
(() => {
"use strict";

/* ============================================================
   ANÁLISE BETA V6.0
   ============================================================
   BASE: V5.9 / V5.10

   CORREÇÕES:
   - Histórico importado sem limite de 200 números
   - Histórico não desaparece ao trocar estratégia
   - Resultados antigos permanecem congelados
   - Treinador pode trocar a cada giro
   - Troca obrigatória até o 3º giro operacional
   - Motor também é reavaliado
   - Gale não muda de jogada durante o ciclo
   - Saltos físicos entre regiões
   - Ausência de regiões
   - Espelho / antiespelho conforme definição solicitada
   - Bordas verde / amarela / rosa
   - 12 motores preservados
   - 12 adaptativas preservadas
   - Geometria 5 blocos de 5 + 1 bloco de 3
   - Centros TIERS / ÓRFÃOS / VOISINS / ZERO

   OBSERVAÇÃO:
   Os sinais são indicadores históricos exploratórios.
   Não demonstram previsibilidade de uma roleta justa.
   ============================================================ */

const VERSION="6.0";
const KEY="ANALISE_BETA_V60";
const PREVIOUS_KEYS=[
"ANALISE_BETA_V59",
"ANALISE_BETA_V55_COMPLETO"
];

const ANALYSIS_WINDOW=200;
const MAX_LEDGER=1200;
const TRAINER_MAX=3;

const W=[
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

const RED=new Set([
1,3,5,7,9,12,14,16,18,
19,21,23,25,27,30,32,34,36
]);

const FAMILIES=[
"NORMAL",
"DINAMICO",
"RX_NORMAL",
"RX_DINAMICO"
];

const RADII=[4,5,6];

const SECTORS={
TIERS:[27,13,36,11,30,8,23,10,5,24,16,33],
ORFAOS:[17,34,6,1,20,14,31,9],
VOISINS:[22,18,29,7,25,2,21,4,19],
ZERO:[28,12,35,3,26,0,32,15]
};

const SECTOR_ORDER=[
"TIERS","ORFAOS","VOISINS","ZERO"
];

const MIRROR_BASE=[
11,12,13,
21,22,23,
31,32,33
];

const $=id=>document.getElementById(id);

const mod=n=>(n%37+37)%37;
const idx=n=>W.indexOf(n);
const copy=x=>JSON.parse(JSON.stringify(x));

const fmt=n=>Number.isFinite(n)
?n.toFixed(1).replace(".",",")
:"—";

const pct=(a,b)=>b
?fmt(a/b*100)+"%"
:"—";

const esc=x=>String(x??"").replace(
/[&<>"']/g,
c=>({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#39;"
}[c])
);

function neighbors(n,r=1){
const p=idx(n);
return Array.from(
{length:r*2+1},
(_,i)=>W[mod(p+i-r)]
);
}

function distance(a,b){
const d=Math.abs(idx(a)-idx(b));
return Math.min(d,37-d);
}

function sector(n){
return SECTOR_ORDER.find(
s=>SECTORS[s].includes(n)
)||"ZERO";
}

/* ============================================================
   ESPELHO / ANTIESPELHO

   ESPELHO:
   11,12,13 / 21,22,23 / 31,32,33
   E UM VIZINHO FÍSICO DE CADA LADO.

   TODOS OS DEMAIS = ANTIESPELHO.
   ============================================================ */

const MIRROR=new Set();

for(const n of MIRROR_BASE){
for(const v of neighbors(n,1)){
MIRROR.add(v);
}
}

function mirrorType(n){
return MIRROR.has(n)
?"ESPELHO"
:"ANTIESPELHO";
}

/* ============================================================
   12 ADAPTATIVAS ORIGINAIS
   ============================================================ */

const ADAPTATIVES=[
["A01",10,.05,6,12,0,0,0,false,3],
["A02",10,.10,6,12,0,0,0,false,3],
["A03",10,.15,6,12,0,0,0,false,3],
["A04",20,.05,10,12,0,0,0,false,3],
["A05",20,.10,10,12,0,0,0,false,3],
["A06",20,.15,10,12,0,0,0,false,3],
["A07",30,.05,12,12,0,0,0,false,3],
["A08",30,.10,12,12,0,0,0,false,3],
["A09",20,.08,10,12,.025,0,.4,true,2],
["A10",30,.12,12,6,.02,.04,.3,false,3],
["A11",20,.10,10,4,.03,.05,.5,true,3],
["A12",30,.08,12,8,.015,.08,.35,true,2]
].map(x=>({
id:x[0],
name:"ADAPTATIVA "+x[0].slice(1),
window:x[1],
margin:x[2],
minSamples:x[3],
maxRank:x[4],
lossPenalty:x[5],
consensus:x[6],
recentWeight:x[7],
switchAfterLoss:x[8],
persistence:x[9]
}));

const ORIGINALS=[
["FIXED","AUTO RANKING"],
["GEO","MELHOR GEOMETRIA"],
["BEST","MELHOR DESEMPENHO"],
["STABLE","ESTABILIDADE"],
["SWITCH","TROCA INTELIGENTE"],
["CONSENSUS","CONSENSO"],
["UNION","UNIÃO"]
];

/* ============================================================
   ESTADO
   ============================================================ */

function fresh(){
return {
history:[],
sources:[],
ledger:[],

strategy:"FIXED",
rank:3,
manual:null,

activeAdaptive:"A05",
activeCreated:null,
createdStrategies:[],

g1:true,
galeSkip:false,
secondHouse:false,

phase:"ENTRY",
frozen:null,
cycle:null,
previousMotor:null,

trainerChoice:null,
trainerMotor:null,
trainerStart:0,
trainerChanges:0,
trainerMotorChanges:0,
trainerPending:false,

open:{
general:true,
trainer:true,
lab:false,
motors:false,
timeline:true,
virtualRanking:false,
opportunities:false,
coveragePlan:false,
comparisons:false,
created:false
}
};
}

let state=fresh();

function readStorage(key){
try{
return JSON.parse(
localStorage.getItem(key)||"null"
);
}catch(e){
return null;
}
}

const saved=readStorage(KEY);

if(saved){
state={
...fresh(),
...saved,
open:{
...fresh().open,
...(saved.open||{})
}
};
}

function save(){
try{
localStorage.setItem(
KEY,
JSON.stringify(state)
);
}catch(e){
console.warn(
"Não foi possível salvar todos os dados.",
e
);
}
}

/* ============================================================
   HISTÓRICO COMPLETO

   Não há corte dos números importados.
   Os motores analisam apenas a janela recente.
   ============================================================ */

function analysisHistory(){
return state.history.slice(
-ANALYSIS_WINDOW
);
}

function historySignature(){
const h=analysisHistory();

return (
state.history.length+
":"+
h.join(",")
);
}

/* ============================================================
   LEITURA DE SALTOS
   ============================================================ */

function jumpClass(d){
if(d<=4)return "CURTO";
if(d<=9)return "MÉDIO";
return "GRANDE";
}

function jumpAnalysis(history=state.history){

const recent=history.slice(-60);

const jumps=[];

for(let i=1;i<recent.length;i++){

const from=recent[i-1];
const to=recent[i];
const d=distance(from,to);

jumps.push({
from,
to,
distance:d,
type:jumpClass(d),
fromSector:sector(from),
toSector:sector(to),
fromMirror:mirrorType(from),
toMirror:mirrorType(to)
});
}

const last=jumps.slice(-12);
const last3=jumps.slice(-3);
const previous3=jumps.slice(-6,-3);

const avg=arr=>arr.length
?arr.reduce(
(s,x)=>s+x.distance,0
)/arr.length
:0;

const recentAverage=avg(last3);
const previousAverage=avg(previous3);

const large=last.filter(
x=>x.type==="GRANDE"
).length;

const regionAbsence={};

for(const s of SECTOR_ORDER){

const p=history.length-1-
history.lastIndexOf(
history.slice().reverse().find(
n=>sector(n)===s
)
);

/*
 Calcula ausência diretamente
 para evitar ambiguidades.
*/

let absent=0;

for(let i=history.length-1;i>=0;i--){

if(sector(history[i])===s)break;
absent++;
}

regionAbsence[s]=absent;
}

const mirrorLast=history.slice(-12);

const mirrorCount=mirrorLast.filter(
n=>MIRROR.has(n)
).length;

const mirrorAbsent=(()=>{
let count=0;

for(let i=history.length-1;i>=0;i--){

if(MIRROR.has(history[i]))break;
count++;
}

return count;
})();

const antiAbsent=(()=>{
let count=0;

for(let i=history.length-1;i>=0;i--){

if(!MIRROR.has(history[i]))break;
count++;
}

return count;
})();

let signal="ESTÁVEL";

if(
last3.length>=2&&
recentAverage>=10
){
signal="SALTOS GRANDES RECENTES";
}

if(
last3.length>=2&&
recentAverage>previousAverage+3
){
signal="AUMENTO DOS SALTOS";
}

if(
last3.length>=2&&
recentAverage<previousAverage-3
){
signal="REDUÇÃO DOS SALTOS";
}

return {
jumps,
last,
last3,
large,
recentAverage,
previousAverage,
signal,
regionAbsence,
mirrorCount,
mirrorAbsent,
antiAbsent
};
}

/* ============================================================
   PESOS DOS 12 MOTORES — BASE ORIGINAL
   ============================================================ */

function motorWeights(history,family,radius){

const weights=Array(37).fill(.01);
const recent=history.slice(-60);

for(let k=0;k<recent.length;k++){

const n=recent[recent.length-1-k];
const decay=Math.exp(-k/(radius*2.3));
const p=idx(n);

for(let j=0;j<37;j++){

const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=6){
weights[j]+=decay*(7-d)/7;
}
}
}

if(family.includes("DINAMICO")){

for(
let k=0;
k<Math.min(radius+2,history.length);
k++
){

const n=history[history.length-1-k];
const p=idx(n);

for(let j=0;j<37;j++){

const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=3){
weights[j]+=(4-d)/(k+2)*1.7;
}
}
}
}

if(family.startsWith("RX")){

const length=Math.min(
radius,
history.length-2
);

if(length>=2){

const current=history.slice(-length);
const matches=[];

for(
let i=0;
i+length<history.length-1;
i++
){

let score=0;

for(let j=0;j<length;j++){

score+=Math.max(
0,
6-distance(
current[j],
history[i+j]
)
)/6;
}

matches.push({
score:score/length,
next:history[i+length]
});
}

matches.sort((a,b)=>b.score-a.score);

const selected=matches.slice(
0,
Math.max(
3,
Math.ceil(matches.length*.2)
)
);

for(const m of selected){

const p=idx(m.next);

for(let j=0;j<37;j++){

const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=3){
weights[j]+=(4-d)*m.score*.45;
}
}
}
}
}

return weights;
}

/* ============================================================
   GEOMETRIA ORIGINAL
   ============================================================ */

const BLOCKS5=[];
const BLOCKS3=[];

for(let center=0;center<37;center++){

for(const radius of [1,2]){

const numbers=[];

for(let d=-radius;d<=radius;d++){
numbers.push(W[mod(center+d)]);
}

const mask=numbers.reduce(
(m,n)=>m|(1n<<BigInt(idx(n))),
0n
);

const block={
center:W[center],
radius,
numbers,
mask
};

if(radius===1){
BLOCKS3.push(block);
}else{
BLOCKS5.push(block);
}
}
}

function geometry(weights,mandatory=[]){

const required=new Set(mandatory);

const scoreBlock=b=>{
let score=0;

for(const n of b.numbers){
score+=weights[idx(n)]||0;
}

return score;
};

const fives=BLOCKS5.map(b=>({
...b,
value:scoreBlock(b)
})).sort((a,b)=>b.value-a.value);

const threes=BLOCKS3.map(b=>({
...b,
value:scoreBlock(b)
})).sort((a,b)=>b.value-a.value);

let best=null;

for(const small of threes){

if(required.size){

const missing=[...required].filter(
n=>!small.numbers.includes(n)
);

if(missing.length)continue;
}

let beam=[{
blocks:[small],
mask:small.mask,
score:small.value
}];

for(let step=0;step<5;step++){

const next=[];

for(const item of beam){

for(const b of fives){

if((item.mask&b.mask)!==0n){
continue;
}

next.push({
blocks:[...item.blocks,b],
mask:item.mask|b.mask,
score:item.score+b.value
});
}
}

if(!next.length){
beam=[];
break;
}

next.sort((a,b)=>b.score-a.score);

const unique=new Set();
const trimmed=[];

for(const item of next){

const key=item.mask.toString();

if(unique.has(key))continue;

unique.add(key);
trimmed.push(item);

if(trimmed.length>=10)break;
}

beam=trimmed;
}

for(const item of beam){

if(item.blocks.length!==6)continue;

if(best&&item.score<=best.score){
continue;
}

best=item;
}
}

if(!best)return null;

const blocks=best.blocks.map(b=>({
center:b.center,
radius:b.radius,
numbers:[...b.numbers]
}));

const numbers=blocks.flatMap(
b=>b.numbers
);

if(new Set(numbers).size!==28){
return null;
}

return {
score:best.score,
blocks,
numbers,
centers5:blocks
.filter(b=>b.radius===2)
.map(b=>b.center),
center3:blocks.find(
b=>b.radius===1
).center
};
}

/* ============================================================
   12 MOTORES
   ============================================================ */

function candidates(history){

if(history.length<8)return [];

const result=[];

for(const family of FAMILIES){

for(const radius of RADII){

if(
family.startsWith("RX")&&
history.length<radius*2+4
)continue;

const weights=motorWeights(
history,
family,
radius
);

const play=geometry(weights);

if(!play)continue;

result.push({
key:family+"_"+radius,
family,
radius,
score:play.score,
play
});
}
}

result.sort((a,b)=>b.score-a.score);

result.forEach((c,i)=>{
c.rank=i+1;
});

return result;
}

let candidateCache={
signature:null,
value:[]
};

function getCandidates(){

const signature=historySignature();

if(candidateCache.signature===signature){
return candidateCache.value;
}

const value=candidates(
analysisHistory()
);

candidateCache={
signature,
value
};

return value;
}

function invalidateCandidates(){
candidateCache.signature=null;
}

/* ============================================================
   ESTATÍSTICAS VIRTUAIS
   ============================================================ */

function motorStats(
key,
window=20,
ledger=state.ledger
){

const rows=ledger.filter(
r=>r.virtual?.some(
x=>x.key===key
)
).slice(-window);

let hits=0;

for(const row of rows){

const m=row.virtual.find(
x=>x.key===key
);

if(m.numbers.includes(row.number)){
hits++;
}
}

return {
total:rows.length,
hits,
misses:rows.length-hits,
rate:rows.length
?hits/rows.length
:null
};
}

function virtualSnapshot(cs){

return cs.map(c=>({
key:c.key,
rank:c.rank,
score:c.score,
numbers:[...c.play.numbers],
centers5:[...c.play.centers5],
center3:c.play.center3
}));
}

/* ============================================================
   ADAPTATIVAS ORIGINAIS
   ============================================================ */

function adaptiveChoose(cs,config,previous){

if(!cs.length)return null;

const eligible=cs.filter(
c=>c.rank<=config.maxRank
);

const ranked=eligible.map(c=>{

const stats=motorStats(
c.key,
config.window
);

let score=stats.total>=config.minSamples
?stats.rate
:.5;

if(config.recentWeight){

const recent=motorStats(
c.key,
Math.max(
5,
Math.floor(config.window/2)
)
);

if(recent.rate!==null){

score=
score*(1-config.recentWeight)+
recent.rate*config.recentWeight;
}
}

if(config.lossPenalty){

const recent=motorStats(c.key,5);

score-=recent.misses*
config.lossPenalty;
}

if(config.consensus){

let votes=0;

for(const n of c.play.numbers){

votes+=cs.filter(
x=>x.play.numbers.includes(n)
).length;
}

score+=config.consensus*
votes/(28*cs.length);
}

return {c,score,stats};
});

ranked.sort(
(a,b)=>
b.score-a.score||
a.c.rank-b.c.rank
);

const best=ranked[0];

if(!best)return cs[0];
if(!previous)return best.c;

const old=ranked.find(
x=>x.c.key===previous
);

if(!old)return best.c;

if(old.c.key===best.c.key){
return old.c;
}

if(config.switchAfterLoss){

const recent=state.ledger
.filter(r=>r.virtual?.length)
.slice(-config.persistence);

if(recent.length===config.persistence){

const failures=recent.every(r=>{

const m=r.virtual.find(
x=>x.key===previous
);

return m&&
!m.numbers.includes(r.number);
});

if(failures)return best.c;
}
}

if(
best.stats.total>=config.minSamples&&
old.stats.total>=config.minSamples&&
best.score>=old.score+config.margin
){
return best.c;
}

return old.c;
}

/* ============================================================
   CONSENSO / UNIÃO
   ============================================================ */

function collective(cs,rule){

const votes=Array(37).fill(0);

const selected=rule==="UNION"
?cs.slice(0,3)
:cs;

for(const c of selected){

for(const n of c.play.numbers){

votes[idx(n)]+=
rule==="UNION"
?1
:1/(1+c.rank*.1);
}
}

const play=geometry(votes);

if(!play)return cs[0];

return {
key:rule,
family:rule,
radius:0,
rank:0,
score:play.score,
play
};
}

/* ============================================================
   AVALIAÇÃO DE SALTOS NA COBERTURA

   Avalia distribuição e correspondência
   com sinais históricos recentes.
   ============================================================ */

function signalScore(play,analysis){

if(!play)return 0;

const covered=new Set(
play.numbers
);

let score=0;

const regionCoverage={};

for(const s of SECTOR_ORDER){

const count=play.numbers.filter(
n=>sector(n)===s
).length;

regionCoverage[s]=count;

const absence=analysis.regionAbsence[s]||0;

/*
 Ausência é um indicador descritivo.
 Peso pequeno, sem presumir que o
 setor está prestes a sair.
*/

score+=Math.min(absence,12)*
count*.00015;
}

/*
 Cobertura distribuída quando os
 saltos recentes são grandes.
*/

if(analysis.recentAverage>=9){

const represented=SECTOR_ORDER.filter(
s=>regionCoverage[s]>0
).length;

score+=represented*.012;
}

/*
 Avalia os destinos dos últimos
 saltos grandes observados.
*/

const large=analysis.last.filter(
j=>j.type==="GRANDE"
);

for(const j of large){

const around=neighbors(j.to,1);

const hits=around.filter(
n=>covered.has(n)
).length;

score+=hits*.0015;
}

/*
 Espelho / antiespelho:
 acompanha a distribuição recente.
*/

const mirrorCovered=play.numbers.filter(
n=>MIRROR.has(n)
).length;

const antiCovered=28-mirrorCovered;

const mirrorRatio=
analysis.mirrorCount/12;

const observedMirror=
Math.min(1,mirrorRatio);

const coverageMirror=
mirrorCovered/28;

score+=(
1-Math.abs(
coverageMirror-observedMirror
)
)*.018;

/*
 Ausência prolongada é exibida,
 mas não recebe grande peso.
*/

if(analysis.mirrorAbsent>=6){
score+=mirrorCovered*.0002;
}

if(analysis.antiAbsent>=6){
score+=antiCovered*.0002;
}

return score;
}

/* ============================================================
   TREINADOR — AVALIAÇÃO DINÂMICA
   ============================================================ */

let trainerCache={
signature:null,
rows:[],
ranking:[],
recommendation:null
};

function invalidateTrainer(){
trainerCache.signature=null;
}

function trainerAnalysis(cs=getCandidates()){

const signature=
historySignature()+"|"+
state.ledger.length+"|"+
state.ledger.at(-1)?.id;

if(trainerCache.signature===signature){
return trainerCache;
}

const rows=[];
const ranking=[];

const jump=jumpAnalysis();

for(const family of FAMILIES){

for(const radius of RADII){

const key=family+"_"+radius;

ranking.push({
key,
...motorStats(key,30)
});
}
}

ranking.sort(
(a,b)=>
(b.rate??-1)-(a.rate??-1)
);

for(const config of ADAPTATIVES){

const last3=state.ledger
.filter(r=>r.virtual?.length)
.slice(-3);

let hits=0;
let total=0;

for(const row of last3){

const eligible=row.virtual
.filter(m=>m.rank<=config.maxRank)
.sort((a,b)=>a.rank-b.rank);

const m=eligible[0];

if(!m)continue;

total++;

if(m.numbers.includes(row.number)){
hits++;
}
}

const recentRate=total
?hits/total
:.5;

const longer=state.ledger
.filter(r=>r.virtual?.length)
.slice(-config.window);

let longHits=0;
let longTotal=0;

for(const row of longer){

const m=row.virtual
.filter(x=>x.rank<=config.maxRank)
.sort((a,b)=>a.rank-b.rank)[0];

if(!m)continue;

longTotal++;

if(m.numbers.includes(row.number)){
longHits++;
}
}

const longRate=longTotal
?longHits/longTotal
:.5;

const eligible=cs.filter(
c=>c.rank<=config.maxRank
);

const evaluated=eligible.map(c=>{

const stats=motorStats(
c.key,
config.window
);

const recent=motorStats(
c.key,3
);

let motorScore=
(recent.rate??.5)*.55+
(stats.rate??.5)*.35+
signalScore(c.play,jump)*.10;

motorScore-=config.lossPenalty*
recent.misses;

motorScore+=config.consensus*.015;

return {
motor:c,
motorScore
};
}).sort(
(a,b)=>b.motorScore-a.motorScore||
a.motor.rank-b.motor.rank
);

const best=evaluated[0];

let score=
recentRate*.60+
longRate*.25+
(best?.motorScore??0)*.15;

score+=config.recentWeight*
recentRate*.02;

rows.push({
id:config.id,
name:config.name,
config,
hits,
total,
rate:total?hits/total:null,
score,
motor:best?.motor||null,
motorScore:best?.motorScore??0
});
}

rows.sort(
(a,b)=>
b.score-a.score||
a.id.localeCompare(b.id)
);

trainerCache={
signature,
rows,
ranking,
recommendation:rows[0]||null
};

return trainerCache;
}

/* ============================================================
   TREINADOR — TROCA EM 1, 2 OU 3 GIROS

   NÃO TROCA DURANTE GALE.

   AO COMPLETAR 3 GIROS OPERACIONAIS,
   A ADAPTATIVA PRECISA SER DIFERENTE.

   O MOTOR TAMBÉM É REAVALIADO.
   ============================================================ */

function updateTrainerChoice(cs=getCandidates()){

if(state.strategy!=="TRAINER"||
state.manual){
return;
}

if(state.phase!=="ENTRY"){

if(
state.history.length-
state.trainerStart>=TRAINER_MAX
){
state.trainerPending=true;
}

return;
}

if(!cs.length)return;

const analysis=trainerAnalysis(cs);

if(!analysis.rows.length)return;

const previous=state.trainerChoice;

const elapsed=Math.max(
0,
state.history.length-
(state.trainerStart||0)
);

const current=analysis.rows.find(
r=>r.id===previous
);

const best=analysis.rows[0];

let shouldSwitch=!previous;

if(previous){

if(
elapsed>=TRAINER_MAX||
state.trainerPending
){
shouldSwitch=true;
}

/*
 Troca antecipada se houver diferença
 relevante na avaliação.
*/

else if(
elapsed>=1&&
best.id!==previous&&
best.score>(current?.score??-1)+.035
){
shouldSwitch=true;
}
}

if(!shouldSwitch)return;

/*
 Na troca obrigatória, exclui a
 adaptativa anterior.
*/

let alternatives=analysis.rows;

if(previous){

alternatives=analysis.rows.filter(
r=>r.id!==previous
);
}

const chosen=alternatives[0]||best;

if(!chosen)return;

if(previous&&chosen.id!==previous){
state.trainerChanges++;
}

state.trainerChoice=chosen.id;
state.trainerStart=state.history.length;
state.trainerPending=false;

/*
 O motor é reavaliado independentemente.
*/

const motor=chosen.motor?.key||null;

if(
state.trainerMotor&&
motor&&
motor!==state.trainerMotor
){
state.trainerMotorChanges++;
}

state.trainerMotor=motor;

save();
}

function trainerStatus(){

const elapsed=Math.max(
0,
state.history.length-
(state.trainerStart||0)
);

return {
adaptive:state.trainerChoice,
motor:state.trainerMotor,
elapsed,
remaining:Math.max(
0,
TRAINER_MAX-elapsed
),
pending:state.trainerPending,
changes:state.trainerChanges,
motorChanges:state.trainerMotorChanges
};
}

/* ============================================================
   ESTRATÉGIA ATIVA
   ============================================================ */

function activeStrategy(){

if(state.manual){

return {
rule:"MANUAL",
name:state.manual
};
}

if(state.strategy==="TRAINER"){

updateTrainerChoice();

const config=ADAPTATIVES.find(
x=>x.id===state.trainerChoice
)||ADAPTATIVES[4];

return {
rule:"TRAINER",
config,
name:"TREINADOR → "+config.name
};
}

if(state.strategy==="ADAPTIVE"){

const config=ADAPTATIVES.find(
x=>x.id===state.activeAdaptive
)||ADAPTATIVES[4];

return {
rule:"ADAPTIVE",
config,
name:config.name
};
}

if(state.strategy==="CREATED"){

const created=state.createdStrategies.find(
x=>x.id===state.activeCreated
);

if(created){

return {
rule:"ADAPTIVE",
config:created.config,
name:created.name
};
}
}

return {
rule:state.strategy,
name:ORIGINALS.find(
x=>x[0]===state.strategy
)?.[1]||state.strategy
};
}

/* ============================================================
   SELEÇÃO DE MOTOR
   ============================================================ */

function selectMotor(cs){

if(!cs.length)return null;

const active=activeStrategy();

const fixed=cs[
Math.min(
Math.max(state.rank-1,0),
cs.length-1
)
];

const previous=state.previousMotor;

if(active.rule==="MANUAL"){

return cs.find(
x=>x.key===state.manual
)||fixed;
}

if(active.rule==="TRAINER"){

const analysis=trainerAnalysis(cs);

const selected=analysis.rows.find(
r=>r.id===state.trainerChoice
);

const proposed=selected?.motor;

if(proposed){

state.trainerMotor=proposed.key;
return proposed;
}

return fixed;
}

if(active.rule==="FIXED")return fixed;
if(active.rule==="GEO")return cs[0];

if(active.rule==="ADAPTIVE"){

return adaptiveChoose(
cs,
active.config,
previous
);
}

if(active.rule==="STABLE"){

const old=cs.find(
x=>x.key===previous
);

return old&&old.rank<=5
?old
:fixed;
}

if(active.rule==="BEST"){

return [...cs].sort((a,b)=>{

const A=motorStats(a.key);
const B=motorStats(b.key);

const ar=A.total>=8?A.rate:-1;
const br=B.total>=8?B.rate:-1;

return br-ar||a.rank-b.rank;
})[0];
}

if(active.rule==="SWITCH"){

const old=cs.find(
x=>x.key===previous
)||fixed;

const oldStats=motorStats(old.key);

const alternatives=cs.map(c=>({
c,
stats:motorStats(c.key)
}))
.filter(x=>x.stats.total>=12)
.sort(
(a,b)=>b.stats.rate-a.stats.rate
);

if(
alternatives.length&&
oldStats.total>=12&&
alternatives[0].stats.rate>
oldStats.rate+.12
){
return alternatives[0].c;
}

return old;
}

if(
active.rule==="CONSENSUS"||
active.rule==="UNION"
){
return collective(cs,active.rule);
}

return fixed;
}

/* ============================================================
   G1 AJUSTE FINO ORIGINAL
   ============================================================ */

function tuneG1(original,lastNumber){

if(!original)return null;

const mandatory=neighbors(lastNumber,1);

const weights=Array(37).fill(.01);

for(const n of original.play.numbers){
weights[idx(n)]+=100;
}

for(const n of mandatory){
weights[idx(n)]+=100000;
}

const play=geometry(
weights,
mandatory
);

if(!play){

return {
...copy(original),
g1:false,
g1Failed:true,
trigger:lastNumber
};
}

const covered=mandatory.every(
n=>play.numbers.includes(n)
);

if(!covered){

return {
...copy(original),
g1:false,
g1Failed:true,
trigger:lastNumber
};
}

return {
...copy(original),
play,
g1:true,
g1Failed:false,
trigger:lastNumber
};
}

function snapMotor(m){

if(!m)return null;

return {
key:m.key,
family:m.family,
radius:m.radius,
rank:m.rank,
score:m.score,
play:copy(m.play)
};
}

/* ============================================================
   REGISTRO DEFINITIVO

   Cada resultado conserva:
   - Número
   - Estratégia
   - Motor
   - Jogada
   - Resultado
   - Fase
   - Configuração do ciclo

   Trocar estratégia NÃO altera registros.
   ============================================================ */

function recordSpin(
number,
source="TEMPO REAL"
){

const cs=getCandidates();
const virtual=virtualSnapshot(cs);

const active=activeStrategy();
const phaseBefore=state.phase;

let motor=null;
let result="AGUARDANDO";
let played=false;
let covered=false;
let strategyName=active.name;

let cycleSnapshot=state.cycle
?copy(state.cycle)
:null;

if(state.phase==="ENTRY"){

motor=snapMotor(
selectMotor(cs)
);

if(motor){

state.previousMotor=motor.key;

state.cycle={
start:state.history.length+1,
strategy:active.name,
motor:motor.key,
source,
original:copy(motor),
firstNumber:null,
options:{
g1:state.g1,
galeSkip:state.galeSkip,
secondHouse:state.secondHouse
}
};

cycleSnapshot=copy(state.cycle);

if(state.secondHouse){

state.frozen=copy(motor);
state.phase="SECOND_SKIP";
result="2ª CASA";

}else{

played=true;

covered=motor.play.numbers.includes(
number
);

if(covered){

result="GREEN";

state.phase="ENTRY";
state.frozen=null;
state.cycle=null;

}else{

result="GALE";

state.cycle.firstNumber=number;

state.frozen=state.g1
?tuneG1(motor,number)
:copy(motor);

state.phase=state.galeSkip
?"GALE_SKIP"
:"GALE";
}
}

}else{
result="SEM MOTOR";
}
}

else if(state.phase==="SECOND_SKIP"){

motor=copy(state.frozen);
strategyName=state.cycle?.strategy||active.name;

result="CASA PULADA";
state.phase="SECOND_ENTRY";
}

else if(state.phase==="SECOND_ENTRY"){

motor=copy(state.frozen);
strategyName=state.cycle?.strategy||active.name;

played=!!motor;

covered=!!(
motor&&
motor.play.numbers.includes(number)
);

if(covered){

result="GREEN";

state.phase="ENTRY";
state.frozen=null;
state.cycle=null;

}else{

result="GALE";

if(state.cycle){
state.cycle.firstNumber=number;
}

state.frozen=state.cycle?.options.g1
?tuneG1(motor,number)
:copy(motor);

state.phase=state.cycle?.options.galeSkip
?"GALE_SKIP"
:"GALE";
}
}

else if(state.phase==="GALE_SKIP"){

motor=copy(state.frozen);
strategyName=state.cycle?.strategy||active.name;

result="GALE PULADO";
state.phase="GALE";
}

else if(state.phase==="GALE"){

motor=copy(state.frozen);
strategyName=state.cycle?.strategy||active.name;

played=!!motor;

covered=!!(
motor&&
motor.play.numbers.includes(number)
);

result=covered
?"GREEN G1"
:"LOSS";

state.phase="ENTRY";
state.frozen=null;
state.cycle=null;
}

const row={
id:Date.now()+"_"+state.history.length,
turn:state.history.length+1,
number,
source,
strategy:strategyName,
motor:motor?.key||"—",
phase:phaseBefore,
result,
played,
covered,
g1:!!motor?.g1,
g1Failed:!!motor?.g1Failed,
trigger:motor?.trigger??null,
play:motor?copy(motor.play):null,
cycle:cycleSnapshot,
virtual,
timestamp:Date.now()
};

state.history.push(number);
state.sources.push(source);
state.ledger.push(row);

/*
 Histórico completo preservado.

 Apenas os registros detalhados mais
 antigos podem ser compactados para
 evitar excesso de armazenamento.
*/

if(state.ledger.length>MAX_LEDGER){

const old=state.ledger.shift();

if(old){
old.virtual=[];
}
}

invalidateCandidates();
invalidateTrainer();

/*
 Reavalia após o giro.
 Se houver Gale, aguarda fechamento.
*/

if(
state.strategy==="TRAINER"&&
!state.manual
){

if(state.phase==="ENTRY"){
updateTrainerChoice();
}else if(
state.history.length-
state.trainerStart>=TRAINER_MAX
){
state.trainerPending=true;
}
}

save();

return row;
}

/* ============================================================
   APAGAR ÚLTIMO

   Restaura o ciclo pelo snapshot.
   Não reinterpreta resultados anteriores.
   ============================================================ */

function undoLast(){

if(!state.history.length)return;

state.history.pop();
state.sources.pop();

const removed=state.ledger.at(-1);

if(
removed&&
removed.turn===state.history.length+1
){
state.ledger.pop();
}

const last=state.ledger.at(-1);

state.phase="ENTRY";
state.frozen=null;
state.cycle=null;

if(last){

const result=last.result;

if(result==="2ª CASA"){

state.phase="SECOND_SKIP";
state.cycle=copy(last.cycle);
state.frozen=copy(
last.cycle?.original||null
);
}

else if(result==="CASA PULADA"){

state.phase="SECOND_ENTRY";
state.cycle=copy(last.cycle);
state.frozen=copy(
last.cycle?.original||null
);
}

else if(result==="GALE"){

state.cycle=copy(last.cycle);

if(state.cycle){

state.cycle.firstNumber=last.number;

const original=state.cycle.original;

state.frozen=state.cycle.options.g1
?tuneG1(original,last.number)
:copy(original);

state.phase=state.cycle.options.galeSkip
?"GALE_SKIP"
:"GALE";
}
}

else if(result==="GALE PULADO"){

state.cycle=copy(last.cycle);

if(state.cycle){

state.frozen=state.cycle.options.g1
?tuneG1(
state.cycle.original,
state.cycle.firstNumber
)
:copy(state.cycle.original);

state.phase="GALE";
}
}
}

state.previousMotor=
last?.motor&&last.motor!=="—"
?last.motor
:null;

state.trainerStart=Math.min(
state.trainerStart,
state.history.length
);

state.trainerPending=false;

invalidateCandidates();
invalidateTrainer();

save();
render();
}

/* ============================================================
   MÉTRICAS
   ============================================================ */

function metrics(rows){

const closed=rows.filter(
r=>[
"GREEN",
"GREEN G1",
"LOSS"
].includes(r.result)
);

const green=closed.filter(
r=>r.result==="GREEN"
).length;

const greenG1=closed.filter(
r=>r.result==="GREEN G1"
).length;

const loss=closed.filter(
r=>r.result==="LOSS"
).length;

const gale=rows.filter(
r=>r.result==="GALE"
).length;

return {
total:closed.length,
green,
greenG1,
loss,
gale,
success:green+greenG1
};
}

function metricsHTML(rows){

const m=metrics(rows);

return `
<div class="metrics">

<div class="metric">
<small>CICLOS FECHADOS</small>
<b>${m.total}</b>
</div>

<div class="metric">
<small>GREEN DIRETO</small>
<b class="good">${m.green}</b>
</div>

<div class="metric">
<small>GREEN G1</small>
<b class="good">${m.greenG1}</b>
</div>

<div class="metric">
<small>GALE ACIONADO</small>
<b>${m.gale}</b>
</div>

<div class="metric">
<small>LOSS</small>
<b class="bad">${m.loss}</b>
</div>

<div class="metric">
<small>GREEN TOTAL</small>
<b>${pct(m.success,m.total)}</b>
</div>

</div>`;
}

/* ============================================================
   CENTROS ORDENADOS
   ============================================================ */

function sortedBlocks(play){

if(!play)return [];

return [...play.blocks].sort((a,b)=>{

const sa=SECTOR_ORDER.indexOf(
sector(a.center)
);

const sb=SECTOR_ORDER.indexOf(
sector(b.center)
);

if(sa!==sb)return sa-sb;

return idx(a.center)-idx(b.center);
});
}

function centersHTML(play){

if(!play)return "";

return sortedBlocks(play).map(b=>`
<div class="center ${b.radius===1?"short":""}">
${b.center}
<small>
${sector(b.center)}
• ${b.radius}V
</small>
</div>
`).join("");
}

/* ============================================================
   RANKING
   ============================================================ */

function virtualRankingHTML(){

const rows=[];

for(const family of FAMILIES){

for(const radius of RADII){

const key=family+"_"+radius;

rows.push({
key,
...motorStats(key,200)
});
}
}

rows.sort(
(a,b)=>
(b.rate??-1)-(a.rate??-1)
);

return rows.map((m,i)=>`
<div class="listrow">
<b>${i+1}º ${esc(m.key)}</b>
<div class="muted">
${m.total} giros
• ${m.hits} cobertos
• ${m.misses} descobertos
• ${pct(m.hits,m.total)}
</div>
</div>
`).join("");
}

function opportunities(){

const rows=[];

for(const row of state.ledger){

if(
!row.play||
row.covered||
!row.played
)continue;

const alternatives=(row.virtual||[])
.filter(
m=>m.numbers.includes(row.number)
);

rows.push({
turn:row.turn,
number:row.number,
motor:row.motor,
result:row.result,
alternatives:alternatives.map(
x=>x.key
)
});
}

return rows;
}

function opportunitiesHTML(){

return opportunities()
.slice(-20)
.reverse()
.map(x=>`
<div class="listrow">
<b>GIRO ${x.turn}</b>
• ${x.number}
• ${esc(x.result)}
<div class="muted">
Motor: ${esc(x.motor)}
<br>
Alternativas:
${esc(
x.alternatives.join(", ")||
"NENHUMA"
)}
</div>
</div>
`).join("");
}

function regionStats(){

const result={};

for(const name of SECTOR_ORDER){
result[name]={
total:0,
longest:0
};
}

let last=null;
let streak=0;

for(const n of state.history){

const name=sector(n);

result[name].total++;

streak=name===last
?streak+1
:1;

last=name;

result[name].longest=Math.max(
result[name].longest,
streak
);
}

return result;
}

function coveragePlanHTML(){

const regions=regionStats();
const misses=opportunities();

const alternative=misses.filter(
x=>x.alternatives.length
).length;

return `
<div class="box">

<b>PLANO DE COBERTURA</b>

<p>
Giros descobertos:
${misses.length}
</p>

<p>
Outro motor cobria:
${alternative}
</p>

<p>
Nenhum motor cobria:
${misses.length-alternative}
</p>

</div>

${SECTOR_ORDER.map(name=>`
<div class="listrow">
<b>${name}</b>
• ${regions[name].total} ocorrências
• sequência máxima:
${regions[name].longest}
</div>
`).join("")}
`;
}

/* ============================================================
   PAINEL DE SALTOS
   ============================================================ */

function jumpsHTML(){

const a=jumpAnalysis();

const latest=a.last.slice(-8).reverse();

return `
<div class="box">

<b>LEITURA DOS SALTOS FÍSICOS</b>

<p>
SINAL:
<strong>${esc(a.signal)}</strong>
</p>

<p>
MÉDIA ÚLTIMOS 3:
${fmt(a.recentAverage)} CASAS
</p>

<p>
MÉDIA 3 ANTERIORES:
${fmt(a.previousAverage)} CASAS
</p>

<p>
SALTOS GRANDES NOS ÚLTIMOS 12:
${a.large}
</p>

</div>

<div class="title">
REGIÕES SEM APARECER
</div>

${SECTOR_ORDER.map(s=>`
<div class="listrow">
<b>${s}</b>
• ${a.regionAbsence[s]} GIROS
</div>
`).join("")}

<div class="title">
ÚLTIMOS SALTOS
</div>

${latest.map(j=>`
<div class="listrow">
<b>${j.from} → ${j.to}</b>
• ${j.distance} CASAS
• ${j.type}
<div class="muted">
${j.fromSector} → ${j.toSector}
<br>
${j.fromMirror} → ${j.toMirror}
</div>
</div>
`).join("")}

<div class="warning">
Ausência de uma região e repetição de saltos
não aumentam sua probabilidade matemática
no próximo giro de uma roleta justa.
</div>
`;
}

/* ============================================================
   ESPELHO / ANTIESPELHO
   ============================================================ */

function mirrorHTML(){

const a=jumpAnalysis();

const recent=state.history.slice(-20);

const mirrorHits=recent.filter(
n=>MIRROR.has(n)
).length;

const antiHits=recent.length-mirrorHits;

return `
<div class="box">

<b>ESPELHO / ANTIESPELHO</b>

<p>
ESPELHO:
11, 12, 13 • 21, 22, 23 •
31, 32, 33
E SEUS VIZINHOS FÍSICOS.
</p>

<p>
ESPELHO NOS ÚLTIMOS 20:
<b>${mirrorHits}</b>
</p>

<p>
ANTIESPELHO NOS ÚLTIMOS 20:
<b>${antiHits}</b>
</p>

<p>
ESPELHO SEM APARECER:
<b>${a.mirrorAbsent} GIROS</b>
</p>

<p>
ANTIESPELHO SEM APARECER:
<b>${a.antiAbsent} GIROS</b>
</p>

</div>

<div class="title">
NÚMEROS DO ESPELHO
</div>

<div class="numberCloud">

${W.filter(n=>MIRROR.has(n))
.map(n=>`
<span>${n}</span>
`).join("")}

</div>

<div class="title">
NÚMEROS DO ANTIESPELHO
</div>

<div class="numberCloud">

${W.filter(n=>!MIRROR.has(n))
.map(n=>`
<span>${n}</span>
`).join("")}

</div>
`;
}

/* ============================================================
   INTERFACE
   ============================================================ */

const css=`

*{box-sizing:border-box}

body{
margin:0;
background:#10151e;
color:#f3f7fb;
font-family:Arial,sans-serif;
}

.app{
max-width:1100px;
margin:auto;
padding:12px;
}

h1{
text-align:center;
font-size:23px;
margin:16px 0 5px;
}

.sub{
text-align:center;
font-size:11px;
color:#9cb3c9;
margin-bottom:18px;
}

.panel{
background:#1c2634;
border:1px solid #40546c;
border-radius:11px;
padding:12px;
margin:10px 0;
}

.title{
color:#32d9f4;
font-size:12px;
font-weight:bold;
margin:12px 0;
}

.row{
display:flex;
flex-wrap:wrap;
gap:6px;
margin:8px 0;
}

.btn{
background:#304056;
border:1px solid #69819d;
border-radius:7px;
padding:10px;
color:white;
font-weight:bold;
font-size:11px;
cursor:pointer;
}

.btn.active{
background:#087f9d;
border-color:#32d9f4;
}

.btn.trainer{
background:#0a6653;
border:2px solid #2c9f81;
}

.btn.trainer.active{
background:#075f4e;
border:2px solid #69ffd0;
animation:trainerGlow 1.4s ease-in-out infinite;
}

@keyframes trainerGlow{
0%,100%{
box-shadow:
0 0 5px #19d5a0,
0 0 10px #19d5a055;
}
50%{
box-shadow:
0 0 12px #69ffd0,
0 0 24px #17f0ad,
0 0 36px #17f0ad77;
}
}

textarea{
width:100%;
height:85px;
padding:10px;
border-radius:8px;
background:#0c1623;
border:1px solid #62758b;
color:white;
}

.centers{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:5px;
}

.center{
padding:13px 2px;
border:2px solid #20d7f4;
background:#096a92;
border-radius:9px;
text-align:center;
font-size:22px;
font-weight:bold;
}

.center.short{
background:#caa127;
border-color:#ffe282;
color:#111;
}

.center small{
display:block;
font-size:9px;
margin-top:5px;
}

.keys{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:5px;
}

.key{
height:43px;
border:1px solid #697b8f;
border-radius:7px;
color:white;
font-size:15px;
font-weight:bold;
cursor:pointer;
}

.key.zero{
grid-column:span 6;
}

.metrics{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:6px;
}

.metric{
background:#29384b;
padding:12px 5px;
border-radius:8px;
text-align:center;
}

.metric small{
display:block;
font-size:9px;
color:#b9cad9;
}

.metric b{
display:block;
font-size:23px;
margin-top:6px;
}

.good{color:#4ee2a2}
.bad{color:#ff778c}

.muted{
font-size:11px;
color:#afc0d1;
line-height:1.7;
}

.box{
background:#111d2a;
border:1px solid #425a75;
padding:12px;
border-radius:9px;
margin:9px 0;
font-size:12px;
line-height:1.7;
}

.head{
display:flex;
justify-content:space-between;
width:100%;
background:#2c3d51;
color:white;
border:1px solid #5e7895;
border-radius:8px;
padding:12px;
font-weight:bold;
cursor:pointer;
}

.hide{display:none}

.history{
display:flex;
flex-wrap:wrap;
gap:5px;
}

.chip{
padding:8px;
border:2px solid #718397;
border-radius:7px;
min-width:47px;
text-align:center;
}

.chip.result-green{
border:3px solid #24f49a;
box-shadow:0 0 6px #24f49a88;
}

.chip.result-gale{
border:3px solid #ffda35;
box-shadow:0 0 6px #ffda3588;
}

.chip.result-loss{
border:3px solid #ff386c;
box-shadow:0 0 7px #ff386c99;
}

.chip b{
display:block;
font-size:18px;
}

.chip small{
font-size:9px;
}

.listrow{
border-bottom:1px solid #35475b;
padding:9px 3px;
font-size:11px;
line-height:1.7;
}

.tablewrap{overflow:auto}

table{
width:100%;
border-collapse:collapse;
min-width:600px;
font-size:11px;
}

td,th{
padding:9px;
border-bottom:1px solid #40516a;
text-align:left;
}

th{color:#50d9ee}

.virtualHero{
background:#102b3a;
border:1px solid #1cacc8;
border-radius:10px;
padding:14px;
margin:12px 0;
}

.virtualRecommendation{
background:#102f27;
border:1px solid #35a981;
border-radius:10px;
padding:14px;
margin:10px 0;
}

.virtualButton{
width:100%;
background:#0b8466;
border:1px solid #52e6b5;
color:white;
border-radius:9px;
padding:14px;
font-size:13px;
font-weight:bold;
cursor:pointer;
margin:8px 0;
}

.miniHead{
display:flex;
justify-content:space-between;
width:100%;
margin:10px 0 0;
padding:11px;
background:#24364b;
border:1px solid #4c6985;
border-radius:8px;
color:#d6eafa;
font-size:11px;
font-weight:bold;
cursor:pointer;
}

.strategyGroup{
margin-top:12px;
padding-top:8px;
border-top:1px solid #34485e;
}

.strategyLabel{
font-size:10px;
color:#7fe1f3;
font-weight:bold;
margin:8px 0;
}

.status{
padding:8px;
font-size:11px;
color:#81dceb;
}

.warning{
border-left:3px solid #d9a63c;
padding:9px;
background:#2b281f;
color:#e8d5a6;
font-size:11px;
line-height:1.6;
}

.trainerCycle{
background:#102c26;
border:1px solid #30bf91;
padding:12px;
border-radius:9px;
margin:10px 0;
}

.trainerCycle b{
color:#7fffd2;
}

.numberCloud{
display:flex;
flex-wrap:wrap;
gap:5px;
margin:10px 0;
}

.numberCloud span{
padding:8px;
background:#273b50;
border:1px solid #60829f;
border-radius:6px;
font-size:12px;
font-weight:bold;
}

@media(max-width:600px){

.center{
font-size:18px;
padding:12px 1px;
}

.center small{
font-size:8px;
}

.btn{
font-size:10px;
padding:9px;
}

}
`;

document.body.innerHTML=`
<style>${css}</style>

<main class="app">

<h1>ANÁLISE BETA V${VERSION}</h1>

<div class="sub">
12 MOTORES • 28 COBERTOS •
TREINADOR ESTRATÉGICO
</div>

<section class="panel">

<div class="title">IMPORTAR HISTÓRICO</div>

<textarea id="paste"
placeholder="Cole números de 0 a 36, do mais antigo ao mais recente"></textarea>

<div class="row">

<button class="btn" id="import">
IMPORTAR E ANALISAR
</button>

<button class="btn" id="restoreOld">
RECUPERAR HISTÓRICO ANTERIOR
</button>

<button class="btn" id="undo">
APAGAR ÚLTIMO
</button>

<button class="btn" id="clear">
ZERAR
</button>

</div>

<div class="status" id="status"></div>

</section>

<section class="panel">

<div class="title">ESTRATÉGIA ATIVA</div>

<div id="strategies"></div>

<div class="row" id="options"></div>

<div class="muted" id="selected"></div>

<div class="centers" id="centers"></div>

<div class="muted" id="coverage"></div>

</section>

<section class="panel">

<div class="title">TECLADO 0–36</div>

<div class="keys" id="keys"></div>

</section>

<section class="panel">

<div class="title">ÚLTIMOS 14 RESULTADOS</div>

<div class="history" id="last"></div>

</section>

<section class="panel">

<button class="head" data-panel="general">
RESULTADO GERAL
<span>−</span>
</button>

<div id="general"></div>

</section>

<section class="panel">

<button class="head" data-panel="trainer">
TREINADOR ESTRATÉGICO
<span>−</span>
</button>

<div id="trainer"></div>

</section>

<section class="panel">

<button class="head" data-panel="lab">
LABORATÓRIO DE ESTRATÉGIAS
<span>+</span>
</button>

<div id="lab"></div>

</section>

<section class="panel">

<button class="head" data-panel="motors">
12 MOTORES E RANKING
<span>+</span>
</button>

<div id="motors"></div>

</section>

<section class="panel">

<button class="head" data-panel="jumps">
SALTOS FÍSICOS E REGIÕES
<span>+</span>
</button>

<div id="jumps"></div>

</section>

<section class="panel">

<button class="head" data-panel="mirrors">
ESPELHO / ANTIESPELHO
<span>+</span>
</button>

<div id="mirrors"></div>

</section>

<section class="panel">

<button class="head" data-panel="timeline">
LINHA DO TEMPO — GREEN / GALE / LOSS
<span>−</span>
</button>

<div id="timeline"></div>

</section>

</main>
`;

state.open.jumps??=false;
state.open.mirrors??=false;

/* ============================================================
   BOTÕES
   ============================================================ */

function makeButton(
label,
onClick,
parent,
extra=""
){

const b=document.createElement("button");

b.className="btn "+extra;
b.textContent=label;
b.onclick=onClick;

parent.appendChild(b);

return b;
}

function changeStrategy(
rule,
adaptive=null,
created=null
){

state.manual=null;
state.strategy=rule;
state.activeAdaptive=adaptive;
state.activeCreated=created;

if(rule==="TRAINER"){

state.trainerChoice=null;
state.trainerMotor=null;
state.trainerStart=state.history.length;
state.trainerPending=false;

if(state.phase==="ENTRY"){
updateTrainerChoice();
}
}

save();
render();
}

function buildStrategyButtons(){

const root=$("strategies");
root.innerHTML="";

const trainer=document.createElement("div");
trainer.className="strategyGroup";

trainer.innerHTML=`
<div class="strategyLabel">
TREINADOR AUTOMÁTICO
</div>
`;

const trainerRow=document.createElement("div");
trainerRow.className="row";

const trainerButton=makeButton(
"TREINADOR ESTRATÉGICO",
()=>changeStrategy("TRAINER"),
trainerRow,
"trainer"
);

trainerButton.dataset.trainer="1";

trainer.appendChild(trainerRow);
root.appendChild(trainer);

const originals=document.createElement("div");
originals.className="strategyGroup";

originals.innerHTML=`
<div class="strategyLabel">
ESTRATÉGIAS ORIGINAIS
</div>
`;

const originalRow=document.createElement("div");
originalRow.className="row";

for(const [key,name] of ORIGINALS){

const b=makeButton(
name,
()=>changeStrategy(key),
originalRow
);

b.dataset.strategy=key;
}

for(let rank=1;rank<=4;rank++){

const b=makeButton(
"AUTO "+rank+"º",
()=>{
state.rank=rank;
changeStrategy("FIXED");
},
originalRow
);

b.dataset.rank=rank;
}

originals.appendChild(originalRow);
root.appendChild(originals);

const adaptives=document.createElement("div");
adaptives.className="strategyGroup";

adaptives.innerHTML=`
<div class="strategyLabel">
12 ESTRATÉGIAS ADAPTATIVAS
</div>
`;

const adaptiveRow=document.createElement("div");
adaptiveRow.className="row";

for(const config of ADAPTATIVES){

const b=makeButton(
config.name,
()=>changeStrategy(
"ADAPTIVE",
config.id
),
adaptiveRow
);

b.dataset.adaptive=config.id;
}

adaptives.appendChild(adaptiveRow);
root.appendChild(adaptives);

if(state.createdStrategies.length){

const created=document.createElement("div");
created.className="strategyGroup";

created.innerHTML=`
<div class="strategyLabel">
ESTRATÉGIAS CRIADAS
</div>
`;

const createdRow=document.createElement("div");
createdRow.className="row";

for(const config of state.createdStrategies){

const b=makeButton(
config.name,
()=>changeStrategy(
"CREATED",
null,
config.id
),
createdRow
);

b.dataset.createdStrategy=config.id;
}

created.appendChild(createdRow);
root.appendChild(created);
}
}

buildStrategyButtons();

/* ============================================================
   OPÇÕES
   ============================================================ */

for(const [field,name] of [
["g1","G1 AJUSTE FINO"],
["galeSkip","GALE 2ª RODADA"],
["secondHouse","2ª CASA"]
]){

const b=makeButton(
name,
()=>{
state[field]=!state[field];
save();
render();
},
$("options")
);

b.dataset.option=field;
}

/* ============================================================
   TECLADO
   ============================================================ */

let importing=false;

for(let n=0;n<=36;n++){

const b=document.createElement("button");

b.className="key"+(n===0?" zero":"");
b.textContent=n;

b.style.background=
n===0
?"#087b50"
:RED.has(n)
?"#ac293f"
:"#12151b";

b.onclick=()=>{

if(importing)return;

recordSpin(n);
render();
};

$("keys").appendChild(b);
}

/* ============================================================
   IMPORTAÇÃO COMPLETA

   IMPORTA TODOS OS NÚMEROS.
   NÃO CORTA EM 200.

   Para históricos grandes, registra
   os números antigos como histórico
   bruto e processa a janela final
   com os motores.

   O histórico bruto permanece fixo.
   ============================================================ */

async function importNumbers(numbers){

if(importing)return;

importing=true;

state.history=[];
state.sources=[];
state.ledger=[];

state.phase="ENTRY";
state.frozen=null;
state.cycle=null;
state.previousMotor=null;

state.trainerChoice=null;
state.trainerMotor=null;
state.trainerStart=0;
state.trainerPending=false;
state.trainerChanges=0;
state.trainerMotorChanges=0;

invalidateCandidates();
invalidateTrainer();

const total=numbers.length;

const detailedStart=Math.max(
0,
total-ANALYSIS_WINDOW
);

/*
 Preserva todos os números antigos.
*/

state.history=numbers.slice(
0,
detailedStart
);

state.sources=Array(
detailedStart
).fill("HISTÓRICO");

for(let i=detailedStart;i<total;i++){

recordSpin(
numbers[i],
"HISTÓRICO"
);

if((i-detailedStart)%4===3){

$("status").textContent=
"ANALISANDO "+
(i+1)+
"/"+
total;

await new Promise(
resolve=>setTimeout(resolve,0)
);
}
}

importing=false;

invalidateCandidates();
invalidateTrainer();

save();
render();
}

$("import").onclick=()=>{

if(importing)return;

const numbers=(
$("paste").value.match(/\d+/g)||[]
)
.map(Number)
.filter(n=>n>=0&&n<=36);

if(!numbers.length){

alert("Cole números de 0 a 36.");
return;
}

if(!confirm(
"Importar "+numbers.length+
" números e substituir o histórico atual?"
))return;

$("paste").value="";

importNumbers(numbers);
};

$("restoreOld").onclick=()=>{

if(importing)return;

let old=null;

for(const key of PREVIOUS_KEYS){

old=readStorage(key);

if(old?.history?.length)break;
}

if(!old?.history?.length){

alert(
"Nenhum histórico anterior encontrado."
);

return;
}

if(!confirm(
"Recuperar "+old.history.length+
" números da versão anterior?"
))return;

importNumbers(old.history);
};

$("undo").onclick=()=>{

if(importing)return;

undoLast();
};

$("clear").onclick=()=>{

if(importing)return;

if(!confirm(
"Apagar histórico e resultados?"
))return;

state=fresh();

state.open.jumps=false;
state.open.mirrors=false;

invalidateCandidates();
invalidateTrainer();

buildStrategyButtons();

save();
render();
};

/* ============================================================
   PAINÉIS RECOLHÍVEIS
   ============================================================ */

function applyOpenState(){

for(const [name,open] of Object.entries(
state.open
)){

const element=$(name);

const button=document.querySelector(
'[data-panel="'+name+'"]'
);

if(element){

element.classList.toggle(
"hide",
!open
);
}

if(button){

const span=button.querySelector("span");

if(span){
span.textContent=open?"−":"+";
}
}
}
}

document.addEventListener("click",e=>{

const b=e.target.closest("[data-panel]");

if(!b)return;

const name=b.dataset.panel;

state.open[name]=!state.open[name];

save();
render();
});

function miniPanel(id,title,content){

const open=!!state.open[id];

return `
<button class="miniHead"
data-panel="${id}">
${esc(title)}
<span>${open?"−":"+"}</span>
</button>

<div id="${id}"
class="${open?"":"hide"}">
${open?content:""}
</div>
`;
}

/* ============================================================
   TREINADOR — INTERFACE
   ============================================================ */

function trainerHTML(){

const analysis=trainerAnalysis();
const rec=analysis.recommendation;

const m=metrics(state.ledger);
const missed=opportunities();

const status=trainerStatus();

const activeConfig=ADAPTATIVES.find(
x=>x.id===status.adaptive
);

return `
<div class="virtualHero">

<div class="title">
TREINADOR ESTRATÉGICO VIRTUAL
</div>

<div class="metrics">

<div class="metric">
<small>GIROS NO HISTÓRICO</small>
<b>${state.history.length}</b>
</div>

<div class="metric">
<small>MOTORES</small>
<b>12</b>
</div>

<div class="metric">
<small>GREEN</small>
<b class="good">${m.success}</b>
</div>

<div class="metric">
<small>GALE</small>
<b>${m.gale}</b>
</div>

<div class="metric">
<small>LOSS</small>
<b class="bad">${m.loss}</b>
</div>

<div class="metric">
<small>DESCOBERTOS</small>
<b>${missed.length}</b>
</div>

</div>

</div>

<div class="trainerCycle">

<div class="title">
TREINADOR DINÂMICO
</div>

<p>
ADAPTATIVA:
<b>
${esc(
activeConfig?.name||"AGUARDANDO"
)}
</b>
</p>

<p>
MOTOR:
<b>
${esc(status.motor||"AGUARDANDO")}
</b>
</p>

<p>
GIROS NA ADAPTATIVA:
<b>${status.elapsed}</b>
</p>

<p>
TROCA:
<b>
${status.pending
?"APÓS FECHAR O GALE"
:"PODE OCORRER A CADA GIRO"
}
</b>
</p>

<p>
LIMITE PARA TROCA:
<b>
${status.remaining} GIRO(S)
</b>
</p>

<p>
TROCAS DE ADAPTATIVA:
<b>${status.changes}</b>
</p>

<p>
TROCAS DE MOTOR:
<b>${status.motorChanges}</b>
</p>

</div>

<div class="virtualRecommendation">

<div class="title">
MELHOR AVALIAÇÃO ATUAL
</div>

<b>
${esc(rec?.name||"AGUARDANDO")}
</b>

<p class="muted">
Motor avaliado:
${esc(rec?.motor?.key||"—")}
</p>

<p class="muted">
Cobertura virtual recente:
${pct(rec?.hits||0,rec?.total||0)}
em ${rec?.total||0} registros.
</p>

<button class="virtualButton"
id="activateTrainer">
ATIVAR TREINADOR ESTRATÉGICO
</button>

${rec?`
<button class="virtualButton"
id="activateRecommended">
ATIVAR ${esc(rec.name)}
</button>
`:""}

</div>

${miniPanel(
"virtualRanking",
"RANKING VIRTUAL DOS 12 MOTORES",
state.open.virtualRanking
?virtualRankingHTML()
:""
)}

${miniPanel(
"opportunities",
"ÚLTIMAS 20 OPORTUNIDADES",
state.open.opportunities
?opportunitiesHTML()
:""
)}

${miniPanel(
"coveragePlan",
"PLANO DE COBERTURA",
state.open.coveragePlan
?coveragePlanHTML()
:""
)}

<div class="warning">
As pontuações são indicadores históricos
exploratórios. Não garantem acerto futuro.
</div>
`;
}

/* ============================================================
   LABORATÓRIO
   ============================================================ */

function labHTML(){

const analysis=trainerAnalysis();

const comparisons=state.open.comparisons
?`
<div class="tablewrap">

<table>

<thead>
<tr>
<th>ESTRATÉGIA</th>
<th>COBERTOS</th>
<th>REGISTROS</th>
<th>COBERTURA</th>
</tr>
</thead>

<tbody>

${analysis.rows.map(r=>`
<tr>
<td>${esc(r.name)}</td>
<td>${r.hits}</td>
<td>${r.total}</td>
<td>${pct(r.hits,r.total)}</td>
</tr>
`).join("")}

</tbody>

</table>

</div>
`:"";

return `
<div class="box">

<b>COMPARAÇÃO DAS ADAPTATIVAS</b>

<p class="muted">
Comparação exploratória com
saltos físicos, regiões e
espelho / antiespelho.
</p>

</div>

${miniPanel(
"comparisons",
"COMPARAÇÃO DAS 12 ADAPTATIVAS",
comparisons
)}

${miniPanel(
"created",
"ESTRATÉGIAS PERSONALIZADAS",
state.open.created
?state.createdStrategies.map(c=>`
<div class="listrow">
${esc(c.name)}
</div>
`).join("")||
'<div class="box">Nenhuma criada.</div>'
:""
)}

<button class="virtualButton"
id="createAdaptive">
CRIAR E ATIVAR CÓPIA DA RECOMENDADA
</button>
`;
}

/* ============================================================
   LINHA DO TEMPO DEFINITIVA
   ============================================================ */

function timelineHTML(){

return state.ledger
.slice(-80)
.reverse()
.map(r=>`

<div class="listrow">

<b>GIRO ${r.turn}</b>

• <b>${r.number}</b>

• <span class="${
r.result.startsWith("GREEN")
?"good"
:r.result==="LOSS"
?"bad"
:""
}">
${esc(r.result)}
</span>

<div class="muted">

Estratégia:
${esc(r.strategy)}

• Motor:
${esc(r.motor)}

• Fase:
${esc(r.phase)}

• Região:
${sector(r.number)}

• ${mirrorType(r.number)}

${r.g1?`
• G1 AJUSTADO
`:""}

${r.g1Failed?`
• AJUSTE G1 NÃO APLICADO
`:""}

</div>

${r.play?`
<div class="muted">
Centros:
${sortedBlocks(r.play)
.map(b=>b.center)
.join(" • ")}
</div>
`:""}

</div>

`).join("");
}

/* ============================================================
   BORDAS
   ============================================================ */

function resultBorderClass(result){

if(result==="LOSS"){
return "result-loss";
}

if(result.startsWith("GREEN")){
return "result-green";
}

if(
result==="GALE"||
result==="GALE PULADO"
){
return "result-gale";
}

return "";
}

/* ============================================================
   RENDERIZAÇÃO
   ============================================================ */

let renderScheduled=false;

function render(){

if(renderScheduled)return;

renderScheduled=true;

requestAnimationFrame(()=>{

renderScheduled=false;

try{
performRender();
}catch(error){

console.error(error);

$("status").textContent=
"ERRO: "+error.message;
}
});
}

function performRender(){

const cs=getCandidates();
const active=activeStrategy();

const selected=state.frozen||
snapMotor(selectMotor(cs));

const play=selected?.play||null;

$("status").textContent=
state.history.length+
" NÚMEROS PRESERVADOS • "+
cs.length+
"/12 MOTORES • "+
state.phase;

/* BOTÕES */

for(const b of document.querySelectorAll(
"[data-strategy]"
)){

b.classList.toggle(
"active",
!state.manual&&
state.strategy===b.dataset.strategy
);
}

for(const b of document.querySelectorAll(
"[data-adaptive]"
)){

b.classList.toggle(
"active",
!state.manual&&
state.strategy==="ADAPTIVE"&&
state.activeAdaptive===
b.dataset.adaptive
);
}

for(const b of document.querySelectorAll(
"[data-created-strategy]"
)){

b.classList.toggle(
"active",
!state.manual&&
state.strategy==="CREATED"&&
state.activeCreated===
b.dataset.createdStrategy
);
}

for(const b of document.querySelectorAll(
"[data-trainer]"
)){

b.classList.toggle(
"active",
!state.manual&&
state.strategy==="TRAINER"
);
}

for(const b of document.querySelectorAll(
"[data-rank]"
)){

b.classList.toggle(
"active",
!state.manual&&
state.strategy==="FIXED"&&
state.rank===Number(b.dataset.rank)
);
}

for(const b of document.querySelectorAll(
"[data-option]"
)){

b.classList.toggle(
"active",
!!state[b.dataset.option]
);
}

/* JOGADA */

const frozenPhase=state.phase!=="ENTRY";

$("selected").textContent=
(frozenPhase
?state.cycle?.strategy||active.name
:active.name
)+
" • MOTOR "+
(selected?.key||"AGUARDANDO")+
" • "+
state.phase;

$("centers").innerHTML=centersHTML(play);

$("coverage").textContent=play
?"28 COBERTOS • 9 DESCOBERTOS"+
(selected?.g1
?" • G1 AJUSTADO"
:"")
:"Importe pelo menos 8 números.";

/* ÚLTIMOS 14 */

const lastNumbers=state.history.slice(-14);

$("last").innerHTML=lastNumbers
.map((number,i)=>{

const turn=
state.history.length-lastNumbers.length+i+1;

const row=state.ledger.find(
r=>r.turn===turn
);

const result=row?.result||"HISTÓRICO";

return `
<div class="chip ${resultBorderClass(result)}"
style="
background:${
number===0
?"#087b50"
:RED.has(number)
?"#a72740"
:"#14181f"
}">

<b>${number}</b>

<small>
${esc(result)}
</small>

</div>
`;
})
.reverse()
.join("");

/* RESULTADO GERAL */

if(state.open.general){

const historical=state.ledger.filter(
r=>r.source==="HISTÓRICO"
);

const live=state.ledger.filter(
r=>r.source==="TEMPO REAL"
);

$("general").innerHTML=`

<div class="title">HISTÓRICO</div>
${metricsHTML(historical)}

<div class="title">TEMPO REAL</div>
${metricsHTML(live)}

<div class="title">TOTAL ACUMULADO</div>
${metricsHTML(state.ledger)}

<div class="box">
TOTAL DE NÚMEROS ARMAZENADOS:
<b>${state.history.length}</b>
</div>

`;
}

/* TREINADOR */

if(state.open.trainer){

$("trainer").innerHTML=trainerHTML();

const activate=$("activateTrainer");

if(activate){

activate.onclick=()=>{
changeStrategy("TRAINER");
};
}

const recommended=$(
"activateRecommended"
);

if(recommended){

recommended.onclick=()=>{

const rec=trainerAnalysis()
.recommendation;

if(!rec)return;

changeStrategy(
"ADAPTIVE",
rec.id
);
};
}
}

/* LABORATÓRIO */

if(state.open.lab){

$("lab").innerHTML=labHTML();

const create=$("createAdaptive");

if(create){

create.onclick=()=>{

const rec=trainerAnalysis()
.recommendation;

if(!rec)return;

const created={
id:"VIRTUAL_"+Date.now(),
name:"ESTRATÉGIA VIRTUAL "+
(state.createdStrategies.length+1),
config:copy(rec.config)
};

state.createdStrategies.push(
created
);

state.strategy="CREATED";
state.activeCreated=created.id;
state.manual=null;

buildStrategyButtons();

save();
render();
};
}
}

/* 12 MOTORES */

if(state.open.motors){

$("motors").innerHTML=`

<div class="row" id="motorButtons">

${FAMILIES.flatMap(f=>
RADII.map(r=>`
<button class="btn"
data-manual="${f}_${r}">
${f}_${r}
</button>
`)
).join("")}

</div>

${cs.map(c=>`

<div class="listrow">

<b>${c.rank}º</b>
• ${esc(c.key)}
• SCORE ${fmt(c.score)}

<div class="muted">
${sortedBlocks(c.play)
.map(b=>b.center)
.join(" • ")}
</div>

</div>

`).join("")}
`;

for(const b of document.querySelectorAll(
"[data-manual]"
)){

b.onclick=()=>{

state.manual=b.dataset.manual;

save();
render();
};
}
}

/* SALTOS */

if(state.open.jumps){
$("jumps").innerHTML=jumpsHTML();
}

/* ESPELHO */

if(state.open.mirrors){
$("mirrors").innerHTML=mirrorHTML();
}

/* LINHA DO TEMPO */

if(state.open.timeline){
$("timeline").innerHTML=timelineHTML();
}

applyOpenState();
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

render();

})();
