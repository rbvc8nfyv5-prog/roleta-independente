
(function(){
"use strict";

const KEY="ANALISE_BETA_V53";
const LIMIT=200;

const W=[
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

const INDEX=new Map(W.map((n,i)=>[n,i]));

const MOTORS=[
"NORMAL","DINAMICO",
"RX_NORMAL","RX_DINAMICO"
];

const RX=[4,5,6];

const LABEL={
NORMAL:"NORMAL",
DINAMICO:"DINÂMICO",
RX_NORMAL:"RAIO-X NORMAL",
RX_DINAMICO:"RAIO-X DINÂMICO",
UNION:"AUTO UNIÃO"
};

const RED=new Set([
1,3,5,7,9,12,14,16,18,19,
21,23,25,27,30,32,34,36
]);

/*
 DIVISÃO DEFINIDA PELO USUÁRIO.
 OS CENTROS SÃO APRESENTADOS
 NA ORDEM DOS QUATRO SETORES.
*/

const SECTORS=[
{
name:"TIERS",
numbers:[
27,13,36,11,30,8,
23,10,5,24,16,33
]
},
{
name:"ÓRFÃOS",
numbers:[
17,34,6,1,20,14,31,9
]
},
{
name:"VOISINS",
numbers:[
22,18,29,7,25,2,21,4,19
]
},
{
name:"ZERO",
numbers:[
28,12,35,3,26,0,32,15
]
}
];

const $=id=>document.getElementById(id);
const mod=n=>(n%37+37)%37;
const idx=n=>INDEX.get(n)??-1;

const fmt=n=>
Number.isFinite(n)
?n.toFixed(2).replace(".",",")
:"—";

const pct=n=>
Number.isFinite(n)
?n.toFixed(1).replace(".",",")+"%"
:"—";

function dist(a,b){
const x=idx(a),y=idx(b);
if(x<0||y<0)return 99;
const d=Math.abs(x-y);
return Math.min(d,37-d);
}

function neigh(n,r){
return Array.from(
{length:r*2+1},
(_,i)=>W[mod(idx(n)+i-r)]
);
}

function dozen(n){
return n===0?0:n<=12?1:n<=24?2:3;
}

function color(n){
return n===0?"#087c48":
RED.has(n)?"#b9233b":"#171717";
}

function matrix(f){
return Object.fromEntries(
MOTORS.map(m=>[
m,
Object.fromEntries(RX.map(r=>[r,f()]))
])
);
}

function clean(a){
return (Array.isArray(a)?a:[])
.map(Number)
.filter(n=>
Number.isInteger(n)&&n>=0&&n<=36
)
.slice(-LIMIT);
}

function emptyGeneral(){
return {analyzed:0,green:0,red:0};
}

function fresh(){
return {
history:[],
rank:3,
alternate:false,
nextRank:3,
best2:false,
union:false,
geoBest2:false,
allBest:false,
allTurn:0,
fineG1:false,
galeSecond:false,
secondHouse:false,
mode:"AUTO",
manual:"NORMAL",
rx:4,
seen:0,
positionRecords:[],
geometryRecords:[],
virtualCycles:null,
lines:{
AUTO:[],
UNION:[],
...matrix(()=>[])
},
pending:{
AUTO:null,
UNION:null,
...matrix(()=>null)
},
frozen:{
AUTO:null,
UNION:null,
...matrix(()=>null)
},
secondCycle:{
AUTO:null,
UNION:null,
...matrix(()=>null)
},
general:emptyGeneral(),
cards:[],
audit:null,
openCandidates:false,
openLines:false,
openVirtual:true,
openGeneral:false
};
}

let s=fresh();

function save(){
try{
localStorage.setItem(KEY,JSON.stringify(s));
}catch(e){
console.warn(e);
}
}

function load(){
try{
const raw=localStorage.getItem(KEY);
if(!raw)return;

const a=JSON.parse(raw);
const base=fresh();

s={...base,...a};

s.history=clean(a.history);

s.positionRecords=
Array.isArray(a.positionRecords)
?a.positionRecords:[];

s.geometryRecords=
Array.isArray(a.geometryRecords)
?a.geometryRecords:[];

s.lines={...base.lines,...a.lines};
s.pending={...base.pending,...a.pending};
s.frozen={...base.frozen,...a.frozen};

s.secondCycle={
...base.secondCycle,
...a.secondCycle
};

s.general={...base.general,...a.general};

s.cards=Array.isArray(a.cards)
?a.cards.slice(-14):[];

for(const m of MOTORS){
s.lines[m]={
...base.lines[m],
...a.lines?.[m]
};

s.pending[m]={
...base.pending[m],
...a.pending?.[m]
};

s.frozen[m]={
...base.frozen[m],
...a.frozen?.[m]
};

s.secondCycle[m]={
...base.secondCycle[m],
...a.secondCycle?.[m]
};
}

}catch(e){
s=fresh();
}
}

load();

/* ESTATÍSTICAS */

function stats(items){
const v=(items||[]).filter(x=>
!x.wait&&!x.sem&&
typeof x.hit==="boolean"
);

const wins=v.filter(x=>x.hit).length;

const rate=n=>{
const a=v.slice(-n);

return a.length
?100*a.filter(x=>x.hit).length/a.length
:0;
};

let losses=0;

for(let i=v.length-1;i>=0&&!v[i].hit;i--){
losses++;
}

return {
n:v.length,
wins,
losses:v.length-wins,
rate:v.length?100*wins/v.length:null,
r10:rate(10),
r20:rate(20),
consecutiveLosses:losses
};
}

/*
 MOTORES ORIGINAIS.
 TODOS OS RESULTADOS DISPONÍVEIS
 EM s.history SÃO UTILIZADOS,
 ATÉ O LIMITE DE 200.
*/

function heat(history,r){
const v=new Float64Array(37);

const decay={
4:.78,
5:.82,
6:.86
}[r];

let weight=1;

for(let i=history.length-1;i>=0;i--){
for(let j=0;j<37;j++){
const d=dist(history[i],W[j]);

if(d<=4){
v[j]+=[1,.72,.44,.22,.1][d]*weight;
}
}

weight*=decay;
}

const max=Math.max(.001,...v);
return v.map(x=>x/max);
}

function rxMatch(history,r){
if(history.length<r*2+4)return null;

const current=history.slice(-r);
const samples=[];

for(let i=0;i+r<history.length-r;i++){
let score=0;

for(let k=0;k<r;k++){
score+=
(dozen(history[i+k])===dozen(current[k])
?.7:0)
+.3*(1-dist(history[i+k],current[k])/19);
}

samples.push({
n:history[i+r],
score:score/r,
index:i
});
}

samples.sort((a,b)=>
b.score-a.score||
b.index-a.index
);

const chosen=samples.slice(
0,
Math.max(4,Math.ceil(samples.length*.3))
);

const out=new Float64Array(37);

for(const x of chosen){
for(let j=0;j<37;j++){
const d=dist(x.n,W[j]);

if(d<=3){
out[j]+=
[1,.7,.42,.18][d]*
(.4+.6*x.score);
}
}
}

const max=Math.max(.001,...out);

return {
values:out.map(x=>x/max),
similarity:
chosen.reduce((t,x)=>t+x.score,0)/
Math.max(1,chosen.length)*100
};
}

function scores(history,m,r){
const recent=heat(history,r);

const rx=m.startsWith("RX")
?rxMatch(history,r):null;

if(m.startsWith("RX")&&!rx)return null;

const out=new Float64Array(37);

for(let j=0;j<37;j++){
const n=W[j],z=r-3;
let near=0;

for(const h of history){
const d=dist(n,h);

near+=d<=3
?[1,.72,.4,.15][d]:0;
}

let score=
(dozen(n)===z?.60:0)+
recent[j]*.48+
near/Math.max(1,history.length)*.6;

if(m.startsWith("RX")){
score=score*.72+rx.values[j]*.7;
}

if(m.includes("DINAMICO")){
const a=history.slice(-r);
let v=0;

for(let i=0;i<a.length;i++){
const d=dist(n,a[i]);

v+=(i+1)/a.length*
(d<=5?(6-d)/6:0);
}

score+=v*.12;
}

out[j]=score;
}

return {
out,
similarity:rx?.similarity||0
};
}

/* GEOMETRIA ORIGINAL */

function makePlay(centers5,center3,score=0){
if(
!Array.isArray(centers5)||
centers5.length!==5||
!W.includes(center3)||
centers5.some(n=>!W.includes(n))||
new Set([...centers5,center3]).size!==6
)return null;

const blocks=[
...centers5.map(c=>({
center:c,
r:2,
nums:neigh(c,2)
})),
{
center:center3,
r:1,
nums:neigh(center3,1)
}
];

const numbers=new Set(
blocks.flatMap(b=>b.nums)
);

if(numbers.size!==28)return null;

for(let i=0;i<37;i++){
if(
!numbers.has(W[i])&&
numbers.has(W[mod(i-1)])&&
numbers.has(W[mod(i+1)])
)return null;
}

return {
valid:true,
centers5:[...centers5],
center3,
blocks,
numbers,
score
};
}

function optimize(weights,exact=false){
const p5=new Float64Array(37);
const p3=new Float64Array(37);

for(let c=0;c<37;c++){
for(let d=-2;d<=2;d++){
const factor=exact
?1
:d===0?1.22
:Math.abs(d)===1?1.08:1;

p5[c]+=weights[mod(c+d)]*factor;
}

for(let d=-1;d<=1;d++){
p3[c]+=weights[mod(c+d)]*
(exact?1:d===0?1.22:1);
}
}

let best=null;

for(let start=0;start<37;start++){
for(let short=0;short<6;short++){
const sizes=[5,5,5,5,5,5];
sizes[short]=3;

const memo=new Map();

function solve(k,g){
if(k===6){
return g===9
?{score:0,gaps:[]}
:null;
}

const key=k+"|"+g;

if(memo.has(key))return memo.get(key);

let used=0;

for(let i=0;i<k;i++){
used+=sizes[i];
}

const center=mod(
start+used+g+
Math.floor(sizes[k]/2)
);

const value=sizes[k]===3
?p3[center]
:p5[center];

let winner=null;

for(let gap=0;gap<=9-g;gap++){
if(gap===1)continue;

const next=solve(k+1,g+gap);
if(!next)continue;

const score=value+next.score;

if(!winner||score>winner.score){
winner={
score,
gaps:[gap,...next.gaps]
};
}
}

memo.set(key,winner);
return winner;
}

const result=solve(0,0);
if(!result)continue;

let cursor=start;
const centers5=[];
let center3=null;

for(let k=0;k<6;k++){
const center=W[
mod(cursor+Math.floor(sizes[k]/2))
];

if(sizes[k]===3){
center3=center;
}else{
centers5.push(center);
}

cursor+=sizes[k]+result.gaps[k];
}

const candidate=makePlay(
centers5,
center3,
result.score
);

if(
candidate&&
(!best||candidate.score>best.score)
){
best=candidate;
}
}
}

return best;
}

function geometry(weights){
return optimize(weights,false);
}

/* DESEMPENHO AUTO E GEOMETRIA */

function performance(records){
const arr=[];

for(let p=1;p<=12;p++){
const items=records.filter(x=>
x.position===p
);

if(!items.length)continue;

const wins=items.filter(x=>x.hit).length;

arr.push({
position:p,
total:items.length,
wins,
rate:100*wins/items.length
});
}

return arr.sort((a,b)=>
b.rate-a.rate||
b.total-a.total||
a.position-b.position
);
}

function autoPerformance(){
return performance(s.positionRecords);
}

function geoPerformance(){
return performance(s.geometryRecords);
}

function effectiveAutoMode(){
if(s.allBest){
return [
"ALTERNATE",
"BEST",
"UNION",
"GEO_BEST"
][s.allTurn%4];
}

if(s.geoBest2)return "GEO_BEST";
if(s.union)return "UNION";
if(s.best2)return "BEST";
if(s.alternate)return "ALTERNATE";

return "FIXED";
}

function bestAutoPosition(){
return autoPerformance()[0]?.position??3;
}

function bestGeoPosition(){
return geoPerformance()[0]?.position??3;
}

function currentRank(){
const mode=effectiveAutoMode();

if(mode==="BEST"){
return bestAutoPosition();
}

if(mode==="ALTERNATE"){
return s.nextRank;
}

return s.rank;
}

function autoModeLabel(mode){
switch(mode){
case "ALTERNATE":
return "AUTO 2º ⇄ 3º";

case "BEST":
return "AUTO MELHOR DESEMPENHO";

case "UNION":
return "AUTO UNIÃO";

case "GEO_BEST":
return "AUTO MELHOR GEOMETRIA";

default:
return "AUTO FIXO "+s.rank+"º";
}
}

let cacheKey=null;
let cache=null;

function invalidate(){
cacheKey=null;
cache=null;
}

function calculate(){
/*
 OS MOTORES UTILIZAM ATÉ
 200 NÚMEROS DO HISTÓRICO.
*/

const history=s.history;

const key=
history.join(",")+"|"+
MOTORS.flatMap(m=>
RX.map(r=>{
const t=stats(s.lines[m][r]);

return [
t.n,
t.r10,
t.r20,
t.consecutiveLosses
].join(":");
})
).join("|");

if(cacheKey===key&&cache){
return cache;
}

const configs=matrix(()=>null);
const ranking=[];

for(const m of MOTORS){
for(const r of RX){
const minimum=m.startsWith("RX")
?Math.max(14,r*2+4)
:Math.max(8,r+4);

if(history.length<minimum)continue;

const v=scores(history,m,r);
if(!v)continue;

const play=geometry(v.out);
if(!play)continue;

const t=stats(s.lines[m][r]);

const autoScore=
play.score+
t.r10*.02+
t.r20*.01-
t.consecutiveLosses*.30+
v.similarity*.005;

const c={
motor:m,
rx:r,
valid:true,
play,
autoScore,
similarity:v.similarity
};

configs[m][r]=c;
ranking.push(c);
}
}

ranking.sort((a,b)=>
b.autoScore-a.autoScore||
MOTORS.indexOf(a.motor)-
MOTORS.indexOf(b.motor)||
a.rx-b.rx
);

ranking.forEach((c,i)=>{
c.rank=i+1;
});

const geometryRanking=
[...ranking].sort((a,b)=>
b.play.score-a.play.score||
a.rank-b.rank
);

geometryRanking.forEach((c,i)=>{
c.geometryRank=i+1;
});

cacheKey=key;

cache={
configs,
ranking,
geometryRanking
};

return cache;
}

/* AUTO UNIÃO */

function buildUnion(d){
if(!d.ranking.length)return null;

const a=d.ranking[
(bestAutoPosition()||1)-1
];

const b=d.geometryRanking[
(bestGeoPosition()||1)-1
];

if(!a||!b)return null;

const A=a.play.numbers;
const B=b.play.numbers;

const intersection=new Set(
[...A].filter(n=>B.has(n))
);

const all=new Set([...A,...B]);

const weights=new Float64Array(37);

for(let i=0;i<37;i++){
const n=W[i];

weights[i]=all.has(n)
?1000+(intersection.has(n)?1:0)
:0;
}

const play=optimize(weights,true);
if(!play)return null;

const covered=[...all].filter(n=>
play.numbers.has(n)
);

const missing=[...all].filter(n=>
!play.numbers.has(n)
);

const extra=[...play.numbers].filter(n=>
!all.has(n)
);

return {
valid:true,
motor:"UNION",
rx:0,
play,
unionSize:all.size,
covered:covered.length,
missing,
extra
};
}

function autoSelected(d){
const mode=effectiveAutoMode();

if(mode==="UNION"){
return buildUnion(d);
}

if(mode==="GEO_BEST"){
return d.geometryRanking[
bestGeoPosition()-1
]||
d.geometryRanking.at(-1)||
null;
}

return d.ranking[
currentRank()-1
]||
d.ranking.at(-1)||
null;
}

function selected(d){
return s.mode==="MANUAL"
?d.configs[s.manual]?.[s.rx]||null
:autoSelected(d);
}

function snapshot(c){
if(!c?.valid)return null;

return {
motor:c.motor,
rx:c.rx,
rank:c.rank,
geometryRank:c.geometryRank,
centers5:[...c.play.centers5],
center3:c.play.center3,
history:s.history.join(",")
};
}

function snapPlay(x){
return x
?makePlay(x.centers5||[],x.center3)
:null;
}

function check(n,play){
if(!play)return {hit:false};

for(const b of play.blocks){
if(b.nums.includes(n)){
return {
hit:true,
center:b.center
};
}
}

return {hit:false};
}

/*
 AJUSTE FINO V5.3

 DIFERENÇA DA V5.1:

 ANTES:
 ESCOLHIA O MENOR DESLOCAMENTO,
 SEM PRIORIZAR A REGIÃO DA FALHA.

 AGORA:
 1. PRIORIZA O NÚMERO PERDIDO.
 2. PRIORIZA SEUS VIZINHOS FÍSICOS.
 3. PRESERVA A COBERTURA ORIGINAL.
 4. UTILIZA O OTIMIZADOR ORIGINAL.
 5. MANTÉM 28 NÚMEROS DISTINTOS.
 6. MANTÉM 5 CENTROS COM 2 VIZINHOS.
 7. MANTÉM 1 CENTRO COM 1 VIZINHO.

 EXEMPLOS:
 28 -> 7,28,12
 10 -> 23,10,5
*/

function tuneG1(original,miss){
const base=snapPlay(original);

if(!base)return original;

const target=neigh(miss,1);
const originalNumbers=base.numbers;

const originalCovered=target.filter(n=>
originalNumbers.has(n)
).length;

/*
 SE A REGIÃO INTEIRA JÁ
 ESTIVER COBERTA, NÃO HÁ
 MOTIVO PARA MUDAR A JOGADA.
*/

if(originalCovered===3){
return {
...original,
g1:{
type:"REGIÃO JÁ COBERTA",
miss,
targetCovered:3,
preserved:28,
removed:0,
added:0
}
};
}

/*
 PONTUAÇÃO DA COBERTURA:

 - NÚMERO DA FALHA: PRIORIDADE
 - VIZINHOS: PRIORIDADE ALTA
 - NÚMEROS ORIGINAIS: PRESERVAÇÃO

 OS PESOS PRIORITÁRIOS SÃO
 MAIORES DO QUE A SOMA DOS
 PESOS DA COBERTURA ORIGINAL.
*/

const weights=new Float64Array(37);

for(let i=0;i<37;i++){
const n=W[i];

weights[i]=originalNumbers.has(n)
?100:0;
}

weights[idx(miss)]+=100000;

for(const n of target){
if(n!==miss){
weights[idx(n)]+=50000;
}
}

/*
 BUSCA UMA NOVA GEOMETRIA
 UTILIZANDO A MESMA FUNÇÃO
 DO SISTEMA ORIGINAL.
*/

const optimized=optimize(weights,true);

if(!optimized){
return {
...original,
g1:{
type:"ORIGINAL",
miss,
targetCovered:originalCovered,
preserved:28,
removed:0,
added:0
}
};
}

const targetCovered=target.filter(n=>
optimized.numbers.has(n)
).length;

const preserved=[...originalNumbers].filter(n=>
optimized.numbers.has(n)
).length;

const removed=28-preserved;
const added=28-preserved;

/*
 NÃO SUBSTITUIR POR UMA
 GEOMETRIA COM MENOS
 COBERTURA NA REGIÃO ALVO.
*/

if(targetCovered<originalCovered){
return {
...original,
g1:{
type:"ORIGINAL PRESERVADA",
miss,
targetCovered:originalCovered,
preserved:28,
removed:0,
added:0
}
};
}

/*
 EM CASO DE COBERTURA IGUAL,
 PRESERVAR A ORIGINAL QUANDO
 A NOVA TROCAR NÚMEROS SEM
 AUMENTAR A COBERTURA ALVO.
*/

if(
targetCovered===originalCovered&&
removed>0
){
return {
...original,
g1:{
type:"ORIGINAL PRESERVADA",
miss,
targetCovered:originalCovered,
preserved:28,
removed:0,
added:0
}
};
}

return {
...original,

centers5:[
...optimized.centers5
],

center3:optimized.center3,

g1:{
type:"AJUSTE FINO OTIMIZADO",
miss,
targetCovered,
preserved,
removed,
added
}
};
}

/*
 JOGADOR VIRTUAL ORIGINAL

 12 POSIÇÕES AUTO
 12 POSIÇÕES GEOMETRIA
 ENTRADA + GALE
*/

function newVirtualCycle(d){
if(!d.ranking.length)return null;

function create(list,kind){
return list.map(c=>({
position:
kind==="AUTO"
?c.rank
:c.geometryRank,

play:snapshot(c),

stage:s.secondHouse
?"SKIP":"ENTRY",

skipRemaining:0,
hit:false,
galePlay:null
}));
}

return {
auto:create(d.ranking,"AUTO"),
geometry:create(d.geometryRanking,"GEO")
};
}

function updateVirtualGroup(group,n,records){
if(!group)return;

for(const x of group){
if(x.stage==="DONE")continue;

if(x.stage==="SKIP"){
x.stage="ENTRY";
continue;
}

if(x.stage==="ENTRY"){
if(check(n,snapPlay(x.play)).hit){
x.hit=true;
x.stage="DONE";

records.push({
position:x.position,
hit:true
});

continue;
}

x.galePlay=s.fineG1
?tuneG1(x.play,n)
:x.play;

x.skipRemaining=
s.secondHouse||s.galeSecond
?1:0;

x.stage="GALE";
continue;
}

if(x.stage==="GALE"){
if(x.skipRemaining>0){
x.skipRemaining--;
continue;
}

x.hit=check(
n,
snapPlay(x.galePlay)
).hit;

x.stage="DONE";

records.push({
position:x.position,
hit:x.hit
});
}
}
}

function updateVirtual(n){
const v=s.virtualCycles;
if(!v)return;

updateVirtualGroup(
v.auto,
n,
s.positionRecords
);

updateVirtualGroup(
v.geometry,
n,
s.geometryRecords
);

s.positionRecords=
s.positionRecords.slice(-2400);

s.geometryRecords=
s.geometryRecords.slice(-2400);

const all=[
...v.auto,
...v.geometry
];

if(all.every(x=>x.stage==="DONE")){
s.virtualCycles=null;
}
}

function startVirtual(d){
if(!s.virtualCycles){
s.virtualCycles=newVirtualCycle(d);
}
}

/* LINHAS DOS MOTORES */

function getLane(obj,name,r){
return r===undefined
?obj[name]
:obj[name][r];
}

function setLane(obj,name,r,value){
if(r===undefined){
obj[name]=value;
}else{
obj[name][r]=value;
}
}

function prepare(d){
const key=s.history.join(",");

function arm(name,r,c){
const f=getLane(s.frozen,name,r);
const cy=getLane(s.secondCycle,name,r);
const p=getLane(s.pending,name,r);

if(!f&&!cy&&p?.history!==key){
setLane(
s.pending,
name,r,
snapshot(c)
);
}
}

arm(
"AUTO",
undefined,
autoSelected(d)
);

arm(
"UNION",
undefined,
buildUnion(d)
);

for(const m of MOTORS){
for(const r of RX){
arm(m,r,d.configs[m][r]);
}
}
}

/* ENTRADA E GALE */

function evaluate(n,p,freeze,line,key,cycle){
line=line.slice(-20);

if(freeze){
if((freeze.skipRemaining||0)>0){
return {
line,
freeze:{
...freeze,
skipRemaining:
freeze.skipRemaining-1,
skipped:[
...(freeze.skipped||[]),n
]
},
cycle:null,
pending:null,
done:false,
stage:"GALE_SKIP"
};
}

const hit=check(
n,
snapPlay(freeze)
).hit;

const i=line.findLastIndex(x=>x.wait);

const result={
n:line[i]?.n??n,
hit,
wait:false,
gale:n,
skipped:freeze.skipped||[],
phase:hit?"GALE":"LOSS"
};

if(i>=0){
line[i]=result;
}else{
line.push(result);
}

return {
line:line.slice(-20),
freeze:null,
cycle:null,
pending:null,
done:true,
hit,
phase:result.phase,
stage:"GALE_RESULT"
};
}

if(cycle?.stage==="PULAR"){
return {
line,
freeze:null,
pending:null,
cycle:{
...cycle,
stage:"VALIDAR",
skipped:[
...(cycle.skipped||[]),n
]
},
done:false,
stage:"ENTRY_SKIP"
};
}

if(cycle?.stage==="VALIDAR"){
p=cycle.play;

const hit=check(
n,
snapPlay(p)
).hit;

if(hit){
line.push({
n,
hit:true,
phase:"WIN",
entrySkipped:cycle.skipped||[]
});

return {
line:line.slice(-20),
freeze:null,
cycle:null,
pending:null,
done:true,
hit:true,
phase:"WIN",
stage:"ENTRY_RESULT"
};
}

line.push({
n,
wait:true,
phase:"AGUARDANDO",
entrySkipped:cycle.skipped||[]
});

const adjusted=s.fineG1
?tuneG1(p,n)
:p;

return {
line:line.slice(-20),
freeze:{
...adjusted,
skipRemaining:1,
skipped:[],
galeSecond:true
},
cycle:null,
pending:null,
done:false,
hit:false,
phase:"AGUARDANDO",
stage:"ENTRY_RESULT"
};
}

if(!p||p.history!==key){
line.push({
n,
sem:true,
phase:"SEM"
});

return {
line:line.slice(-20),
freeze:null,
cycle:null,
pending:null,
done:false,
stage:"SEM"
};
}

const hit=check(
n,
snapPlay(p)
).hit;

if(hit){
line.push({
n,
hit:true,
phase:"WIN"
});

return {
line:line.slice(-20),
freeze:null,
cycle:null,
pending:null,
done:true,
hit:true,
phase:"WIN",
stage:"ENTRY_RESULT"
};
}

line.push({
n,
wait:true,
phase:"AGUARDANDO"
});

const adjusted=s.fineG1
?tuneG1(p,n)
:p;

return {
line:line.slice(-20),
freeze:{
...adjusted,
skipRemaining:s.galeSecond?1:0,
skipped:[],
galeSecond:s.galeSecond
},
cycle:null,
pending:null,
done:false,
hit:false,
phase:"AGUARDANDO",
stage:"ENTRY_RESULT"
};
}

function updateLane(n,name,r){
const key=s.history.join(",");

const a=evaluate(
n,
getLane(s.pending,name,r),
getLane(s.frozen,name,r),
getLane(s.lines,name,r),
key,
getLane(s.secondCycle,name,r)
);

setLane(s.lines,name,r,a.line);
setLane(s.pending,name,r,a.pending);
setLane(s.frozen,name,r,a.freeze);
setLane(s.secondCycle,name,r,a.cycle);

return a;
}

function advanceAutoMode(){
const mode=effectiveAutoMode();

if(mode==="ALTERNATE"){
s.nextRank=s.nextRank===3?2:3;
s.rank=s.nextRank;
}

if(s.allBest){
s.allTurn=(s.allTurn+1)%4;
}
}

function updateAll(n){
const auto=updateLane(n,"AUTO");
const union=updateLane(n,"UNION");

if(auto.done){
advanceAutoMode();
}

const manual=matrix(()=>null);

for(const m of MOTORS){
for(const r of RX){
manual[m][r]=updateLane(n,m,r);
}
}

return {
auto,
union,
manual
};
}

function armSecondHouse(d){
if(!s.secondHouse)return;

function arm(name,r,c){
if(
getLane(s.frozen,name,r)||
getLane(s.secondCycle,name,r)
)return;

const p=snapshot(c);
if(!p)return;

setLane(
s.secondCycle,
name,r,
{
stage:"PULAR",
play:p,
skipped:[]
}
);

setLane(s.pending,name,r,null);
}

arm(
"AUTO",
undefined,
autoSelected(d)
);

arm(
"UNION",
undefined,
buildUnion(d)
);

for(const m of MOTORS){
for(const r of RX){
arm(m,r,d.configs[m][r]);
}
}
}

function activePending(){
return s.mode==="MANUAL"
?s.pending[s.manual][s.rx]
:s.pending.AUTO;
}

function activeFrozen(){
return s.mode==="MANUAL"
?s.frozen[s.manual][s.rx]
:s.frozen.AUTO;
}

function activeCycle(){
return s.mode==="MANUAL"
?s.secondCycle[s.manual][s.rx]
:s.secondCycle.AUTO;
}

function registerGeneral(result){
if(
!result?.done||
typeof result.hit!=="boolean"
)return;

s.general.analyzed++;

if(result.hit){
s.general.green++;
}else{
s.general.red++;
}
}

/*
 PROCESSAMENTO SEQUENCIAL
 DOS 200 RESULTADOS.

 NÃO UTILIZA RESULTADOS FUTUROS
 PARA CALCULAR JOGADAS PASSADAS.
*/

function addNumber(n,silent=false){
if(
!Number.isInteger(n)||
n<0||n>36
)return;

const d=calculate();
prepare(d);

const wasGale=!!activeFrozen();
const wasCycle=!!activeCycle();

const isSecondStart=
s.secondHouse&&!wasGale&&!wasCycle;

s.seen++;

if(isSecondStart){
s.history=clean([
...s.history,n
]);

invalidate();

const next=calculate();

armSecondHouse(next);
startVirtual(next);

s.cards.push({
n,
phase:activeCycle()?"START":"SEM",
skipped:[]
});

s.audit={
title:"2ª CASA — START",
text:
"Número "+n+
" registrado. A próxima casa será pulada."
};

s.cards=s.cards.slice(-14);

if(!silent){
save();
render();
}

return;
}

if(
!s.secondHouse&&
!s.virtualCycles&&
!wasGale
){
startVirtual(d);
}

const selectedMode=s.mode;
const selectedMotor=s.manual;
const selectedRx=s.rx;

const updates=updateAll(n);

const result=selectedMode==="MANUAL"
?updates.manual[selectedMotor][selectedRx]
:updates.auto;

registerGeneral(result);
updateVirtual(n);

if(result.stage==="ENTRY_SKIP"){
const last=s.cards.at(-1);

if(last){
last.phase="ENTRADA_ESPERA";

last.entrySkipped=[
...(last.entrySkipped||[]),n
];
}

s.audit={
title:"2ª CASA — PULADA",
text:
"Número "+n+
" analisado sem validar a jogada."
};

}else if(
result.stage==="ENTRY_RESULT"&&
wasCycle
){
const last=s.cards.at(-1);

if(last){
last.entryResult=n;
last.hit=!!result.hit;

last.phase=result.hit
?"WIN":"AGUARDANDO";
}

s.audit={
title:result.hit
?"WIN NA 2ª CASA":"GALE",

text:
"Resultado "+n+
(result.hit
?" • GREEN"
:" • aguardando Gale")
};

}else if(result.stage==="GALE_SKIP"){
const last=s.cards.at(-1);

if(last){
last.skipped=[
...(last.skipped||[]),n
];
}

s.audit={
title:"GALE — CASA PULADA",
text:
"Número "+n+
" registrado. Próximo número valida o Gale."
};

}else if(result.stage==="GALE_RESULT"){
const last=s.cards.at(-1);

if(last){
last.gale=n;
last.hit=!!result.hit;

last.phase=result.hit
?"GALE":"LOSS";
}

s.audit={
title:result.hit
?"WIN NO GALE":"LOSS",

text:
"Resultado "+n+
(result.hit
?" • GREEN":" • RED")
};

}else if(result.stage==="ENTRY_RESULT"){
s.cards.push({
n,
hit:!!result.hit,
phase:result.hit
?"WIN":"AGUARDANDO",
skipped:[]
});

s.audit={
title:result.hit
?"WIN NA ENTRADA"
:"AGUARDANDO GALE",

text:"Resultado "+n
};

}else if(result.stage==="SEM"){
s.cards.push({
n,
sem:true,
phase:"SEM",
skipped:[]
});
}

s.cards=s.cards.slice(-14);

s.history=clean([
...s.history,n
]);

invalidate();

if(!silent){
save();
render();
}
}

/* BACKTEST DOS 200 RESULTADOS */

let processing=false;

async function insert(){
if(processing)return;

const nums=(
$("inputHistory").value.match(/\d+/g)||[]
)
.map(Number)
.filter(n=>n>=0&&n<=36)
.slice(-LIMIT);

if(!nums.length)return;

processing=true;

const button=$("insert");
button.disabled=true;
button.textContent="ANALISANDO...";

const old=s;
const next=fresh();

for(const k of [
"rank",
"alternate",
"nextRank",
"best2",
"union",
"geoBest2",
"allBest",
"allTurn",
"fineG1",
"galeSecond",
"secondHouse",
"mode",
"manual",
"rx",
"openCandidates",
"openLines",
"openVirtual",
"openGeneral"
]){
next[k]=old[k];
}

s=next;
invalidate();

try{
for(let i=0;i<nums.length;i++){
addNumber(nums[i],true);

if(i%5===4){
button.textContent=
"ANALISANDO "+
(i+1)+"/"+nums.length;

await new Promise(resolve=>
setTimeout(resolve,0)
);
}
}

$("inputHistory").value="";

s.audit={
title:"HISTÓRICO ANALISADO",
text:
nums.length+
" resultados processados em sequência. "+
"Os motores utilizaram até 200 números. "+
"Desempenhos AUTO e GEOMETRIA "+
"calculados com entrada e Gale."
};

save();
render();

}catch(e){
console.error(e);

alert(
"Erro na análise: "+
e.message
);
}finally{
processing=false;
button.disabled=false;
button.textContent="INSERIR";
}
}

function resetResults(){
const base=fresh();

s.seen=0;
s.positionRecords=[];
s.geometryRecords=[];
s.virtualCycles=null;

s.lines=base.lines;
s.pending=base.pending;
s.frozen=base.frozen;
s.secondCycle=base.secondCycle;

s.general=emptyGeneral();
s.cards=[];
s.audit=null;

invalidate();
}

function undo(){
if(!s.history.length)return;

const nums=s.history.slice(0,-1);

$("inputHistory").value=nums.join(", ");
insert();
}

function clear(){
if(!confirm(
"Apagar histórico e estatísticas?"
))return;

const old=s;
s=fresh();

for(const k of [
"rank",
"alternate",
"best2",
"union",
"geoBest2",
"allBest",
"fineG1",
"galeSecond",
"secondHouse",
"mode",
"manual",
"rx",
"openCandidates",
"openLines",
"openVirtual",
"openGeneral"
]){
s[k]=old[k];
}

invalidate();
save();
render();
}

/* CONTROLES ORIGINAIS */

function resetAutoSelection(){
s.alternate=false;
s.best2=false;
s.union=false;
s.geoBest2=false;
s.allBest=false;
}

function setRank(n){
resetAutoSelection();

s.rank=n;
s.mode="AUTO";
s.pending.AUTO=null;

invalidate();
save();
render();
}

function toggleAlternate(){
const enabled=!s.alternate;

resetAutoSelection();

s.alternate=enabled;
s.mode="AUTO";
s.nextRank=3;
s.rank=3;
s.pending.AUTO=null;

invalidate();
save();
render();
}

function toggleBest2(){
const enabled=!s.best2;

resetAutoSelection();

s.best2=enabled;
s.mode="AUTO";
s.pending.AUTO=null;

invalidate();
save();
render();
}

function toggleUnion(){
const enabled=!s.union;

resetAutoSelection();

s.union=enabled;
s.mode="AUTO";
s.pending.AUTO=null;

invalidate();
save();
render();
}

function toggleGeoBest2(){
const enabled=!s.geoBest2;

resetAutoSelection();

s.geoBest2=enabled;
s.mode="AUTO";
s.pending.AUTO=null;

invalidate();
save();
render();
}

function toggleAllBest(){
const enabled=!s.allBest;

resetAutoSelection();

s.allBest=enabled;
s.allTurn=0;
s.mode="AUTO";
s.pending.AUTO=null;

invalidate();
save();
render();
}

function toggleFine(){
s.fineG1=!s.fineG1;
save();
render();
}

function toggleSecond(){
s.galeSecond=!s.galeSecond;
save();
render();
}

function toggleSecondHouse(){
s.secondHouse=!s.secondHouse;
save();
render();
}

function setMode(m,r){
s.mode=m==="AUTO"
?"AUTO":"MANUAL";

if(m!=="AUTO"){
s.manual=m;
s.rx=r;
}

save();
render();
}

/* ESTILO ORIGINAL */

const css=`
*{box-sizing:border-box}

body{
margin:0;
background:#101014;
color:white;
font-family:Arial,sans-serif
}

.app{
max-width:980px;
margin:auto;
padding:9px
}

h2{
text-align:center;
font-size:20px;
margin:14px 0
}

.panel{
background:#1c1e26;
border:1px solid #3c414e;
border-radius:10px;
padding:11px;
margin-bottom:9px
}

.head{
width:100%;
display:flex;
justify-content:space-between;
background:#292e3a;
color:white;
border:1px solid #4d5669;
border-radius:7px;
padding:11px;
font-weight:bold;
cursor:pointer
}

.hidden{display:none!important}

.row{
display:flex;
gap:6px;
flex-wrap:wrap;
margin:8px 0
}

.btn{
padding:10px;
border:1px solid #667083;
border-radius:7px;
background:#303746;
color:white;
font-weight:bold;
cursor:pointer
}

.btn.selected{
background:#087b99;
border:2px solid #00d9ff
}

.btn.union{
background:#5a347d;
border-color:#a973e4
}

.btn.union.selected{
background:#7837a9;
border-color:#d89cff
}

.rankButtons{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:6px
}

.small{
font-size:10px;
color:#b4bfce;
line-height:1.6
}

.accent{
color:#00d9ff;
font-size:12px;
font-weight:bold;
margin:10px 0
}

.grid6{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:5px;
margin:8px 0
}

.center{
padding:12px 0;
border-radius:8px;
text-align:center;
background:#006fa7;
border:2px solid #00cfff;
font-size:23px;
font-weight:bold
}

.center.short{
background:#b98c0b;
border-color:#ffe078;
color:#111
}

.keys{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:5px
}

.key{
height:43px;
color:white;
border:1px solid #666;
border-radius:7px;
font-weight:bold;
cursor:pointer
}

.key.zero{grid-column:span 6}

.line{
display:grid;
grid-template-columns:77px 1fr 36px;
gap:4px;
align-items:center;
margin:8px 0;
font-size:10px
}

.marks{
display:flex;
justify-content:flex-end;
gap:2px;
overflow:hidden
}

.mark{
min-width:16px;
height:19px;
border-radius:3px;
display:grid;
place-items:center;
font-size:8px;
background:#555
}

.mark.good{background:#009d55}
.mark.bad{background:#b82b39}

.mark.gale{
background:#ffcc22;
color:#111
}

.mark.wait{background:#6c5818}

.history{
display:grid;
grid-template-columns:repeat(4,minmax(0,1fr));
gap:6px;
width:100%
}

.historyItem{
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
gap:5px;
width:100%;
min-width:0;
height:69px;
padding:5px 2px;
border:2px solid #21b977;
border-radius:8px;
background:#b52039;
color:white;
text-align:center;
overflow:hidden
}

.historyItem.numberRed{
background:#b52039
}

.historyItem.numberBlack{
background:#171717
}

.historyItem.numberZero{
background:#087c48
}

.historyItem.green{
border-color:#21b977
}

.historyItem.yellow{
border-color:#ffca37
}

.historyItem.red{
border-color:#ed4a62
}

.historyNumber{
font-size:20px;
line-height:1;
font-weight:bold;
flex-shrink:0
}

.historyResult{
display:flex;
flex-direction:row;
align-items:center;
justify-content:center;
gap:3px;
max-width:100%;
min-width:0;
white-space:nowrap;
font-size:11px;
line-height:1.1;
font-weight:bold
}

.historyResult span{
display:inline;
font-size:inherit;
white-space:nowrap
}

.historyResult.compact{
font-size:10px;
gap:2px
}

.historyResult .resultValue{
font-size:inherit
}

.positionBox{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:6px;
margin:10px 0
}

.positionCard{
background:#102b36;
border:1px solid #00a7c7;
border-radius:8px;
padding:9px;
text-align:center;
font-size:11px
}

.positionCard strong{
display:block;
font-size:21px;
color:#00e5ff;
margin:5px
}

.positionCard small{
font-size:9px;
color:#b4bfce
}

.audit{
padding:11px;
background:#101820;
border:1px solid #36536b;
border-radius:7px;
font-size:12px;
line-height:1.7
}

textarea{
width:100%;
height:65px;
background:#0f121a;
color:white;
border:1px solid #667;
padding:8px;
border-radius:7px
}

.candidate{
padding:7px;
border-bottom:1px solid #363c48;
font-size:11px
}

.summary{
font-size:11px;
color:#00e5ff;
margin:7px 0;
font-weight:bold
}

.switches{
display:flex;
gap:6px;
flex-wrap:wrap;
margin:8px 0
}

.switches button{
flex:1;
min-width:130px
}

.coverage{
font-size:11px;
line-height:1.8;
background:#21172c;
border:1px solid #9d64ca;
padding:9px;
border-radius:8px
}

.generalGrid{
display:grid;
grid-template-columns:repeat(3,minmax(0,1fr));
gap:6px;
margin:10px 0
}

.generalCard{
border-radius:8px;
padding:12px 5px;
text-align:center;
background:#303746;
border:1px solid #586274
}

.generalCard.green{
background:#124d37;
border-color:#20bb79
}

.generalCard.red{
background:#682735;
border-color:#e65b6c
}

.generalCard small{
display:block;
font-size:10px;
font-weight:bold;
color:#e1e7ef
}

.generalCard strong{
display:block;
font-size:25px;
margin-top:6px
}

.generalPercent{
margin:12px 0
}

.generalPercentHeader{
display:flex;
justify-content:space-between;
align-items:center;
gap:8px;
font-size:12px;
font-weight:bold;
margin-bottom:6px
}

.generalTrack{
height:11px;
border-radius:10px;
background:#404653;
overflow:hidden
}

.generalFill{
height:100%;
border-radius:10px;
transition:width .2s ease
}

.generalFill.green{
background:#19a86b
}

.generalFill.red{
background:#d7475b
}

@media(max-width:600px){
.center{font-size:19px}
.mark{min-width:14px}
.history{gap:5px}

.historyItem{
height:65px;
padding:4px 1px;
border-radius:7px
}

.historyNumber{
font-size:18px
}

.historyResult{
font-size:10px;
gap:2px
}

.historyResult.compact{
font-size:9px;
gap:1px
}

.generalCard strong{
font-size:21px
}
}
`;

/* INTERFACE ORIGINAL */

document.body.innerHTML=`
<style>${css}</style>

<main class="app">

<h2>ANÁLISE BETA V5.3</h2>

<section class="panel">

<textarea
id="inputHistory"
placeholder="Cole até 200 números, do mais antigo para o mais recente"
></textarea>

<div class="row">

<button class="btn" id="insert">
INSERIR
</button>

<button class="btn" id="undo">
APAGAR ÚLTIMO
</button>

<button class="btn" id="clear">
APAGAR TUDO
</button>

</div>

<div class="small" id="status"></div>

</section>

<section class="panel">

<button class="head" id="toggleCandidates">
AUTO • 12 CANDIDATOS
<span id="arrowCandidates">+</span>
</button>

<div class="row">

<button class="btn" id="auto">
AUTO
</button>

<div class="accent" id="autoLabel"></div>

</div>

<div class="small">
POSIÇÃO FIXA AUTO
</div>

<div class="rankButtons" id="rankButtons"></div>

<div class="switches">

<button class="btn" id="alternate">
AUTO 2º ⇄ 3º
</button>

<button class="btn" id="best2">
AUTO MELHOR DESEMPENHO
</button>

<button class="btn union" id="union">
AUTO UNIÃO
</button>

<button class="btn" id="geoBest2">
AUTO MELHOR GEOMETRIA
</button>

<button class="btn" id="allBest">
AUTO TODAS MELHORES
</button>

<button class="btn" id="fine">
G1 AJUSTE FINO
</button>

<button class="btn" id="second">
GALE 2ª RODADA
</button>

<button class="btn" id="secondHouse">
2ª CASA
</button>

</div>

<div class="small" id="modeInfo"></div>

<div id="candidatePanel" class="hidden">

<div id="motorButtons"></div>

<div class="accent">
RANKING AUTO
</div>

<div id="candidates"></div>

<div class="accent">
RANKING GEOMETRIA
</div>

<div id="geometryRanking"></div>

</div>

</section>

<section class="panel">

<button class="head" id="toggleLines">
LINHAS DO TEMPO
<span id="arrowLines">+</span>
</button>

<div id="autoSummary" class="summary"></div>

<div id="autoLine"></div>
<div id="unionLine"></div>

<div id="otherLines" class="hidden"></div>

</section>

<section class="panel">

<div class="accent" id="playLabel">
JOGADA ATUAL
</div>

<div class="small">
6 CENTROS • TIERS → ÓRFÃOS → VOISINS → ZERO
</div>

<div class="grid6" id="play"></div>

<div class="small" id="g1Info"></div>

</section>

<section class="panel">

<div class="accent">
ÚLTIMAS 14 JOGADAS
</div>

<div class="history" id="cards"></div>

</section>

<section class="panel">

<div class="accent">
TECLADO DE RESULTADOS
</div>

<div class="keys" id="keys"></div>

</section>

<section class="panel">

<button class="head" id="toggleVirtual">
JOGADOR VIRTUAL
<span id="arrowVirtual">−</span>
</button>

<div id="virtualContent">

<div class="accent">
2 MELHORES DESEMPENHOS AUTO
</div>

<div class="positionBox" id="autoPerformance"></div>

<div class="accent">
2 MELHORES DESEMPENHOS GEOMETRIA
</div>

<div class="positionBox" id="geoPerformance"></div>

<div class="accent">
DESEMPENHO DOS MOTORES
</div>

<div id="motorPerformance"></div>

<div class="accent">
COBERTURA AUTO UNIÃO
</div>

<div class="coverage" id="unionCoverage"></div>

<div class="accent">
AUDITORIA
</div>

<div class="audit" id="audit"></div>

</div>

</section>

<section class="panel">

<button class="head" id="toggleGeneral">
RESULTADO GERAL
<span id="arrowGeneral">+</span>
</button>

<div id="generalContent" class="hidden">

<div class="generalGrid">

<div class="generalCard">
<small>ANALISADOS</small>
<strong id="generalAnalyzed">0</strong>
</div>

<div class="generalCard green">
<small>GREEN</small>
<strong id="generalGreen">0</strong>
</div>

<div class="generalCard red">
<small>RED</small>
<strong id="generalRed">0</strong>
</div>

</div>

<div class="generalPercent">

<div class="generalPercentHeader">

<span style="color:#59e3a1">
GREEN —
<span id="generalGreenPct">0,0%</span>
</span>

<span id="generalGreenCount">0 / 0</span>

</div>

<div class="generalTrack">

<div
class="generalFill green"
id="generalGreenBar"
></div>

</div>

</div>

<div class="generalPercent">

<div class="generalPercentHeader">

<span style="color:#ff8190">
RED —
<span id="generalRedPct">0,0%</span>
</span>

<span id="generalRedCount">0 / 0</span>

</div>

<div class="generalTrack">

<div
class="generalFill red"
id="generalRedBar"
></div>

</div>

</div>

<div class="small">
Total acumulado das jogadas encerradas.
Casas puladas não contam como GREEN ou RED.
</div>

</div>

</section>

</main>
`;

/* EVENTOS ORIGINAIS */

$("insert").onclick=insert;
$("undo").onclick=undo;
$("clear").onclick=clear;

$("alternate").onclick=toggleAlternate;
$("best2").onclick=toggleBest2;
$("union").onclick=toggleUnion;
$("geoBest2").onclick=toggleGeoBest2;
$("allBest").onclick=toggleAllBest;

$("fine").onclick=toggleFine;
$("second").onclick=toggleSecond;
$("secondHouse").onclick=toggleSecondHouse;

$("auto").onclick=()=>setMode("AUTO");

for(const [button,field] of [
["toggleCandidates","openCandidates"],
["toggleLines","openLines"],
["toggleVirtual","openVirtual"],
["toggleGeneral","openGeneral"]
]){
$(button).onclick=()=>{
s[field]=!s[field];
save();
render();
};
}

/* TECLADO */

for(let n=1;n<=36;n++){
const b=document.createElement("button");

b.className="key";
b.textContent=n;
b.style.background=color(n);
b.onclick=()=>addNumber(n);

$("keys").appendChild(b);
}

const zero=document.createElement("button");

zero.className="key zero";
zero.textContent="0";
zero.style.background=color(0);
zero.onclick=()=>addNumber(0);

$("keys").appendChild(zero);

/* POSIÇÕES FIXAS */

for(let n=1;n<=4;n++){
const b=document.createElement("button");

b.className="btn";
b.id="rank"+n;
b.textContent=n+"º";
b.onclick=()=>setRank(n);

$("rankButtons").appendChild(b);
}

/* 12 MOTORES */

for(const m of MOTORS){
const div=document.createElement("div");
div.className="row";

const title=document.createElement("strong");

title.className="small";
title.style.width="100%";
title.textContent=LABEL[m];

div.appendChild(title);

for(const r of RX){
const b=document.createElement("button");

b.className="btn";
b.id="motor"+m+r;
b.textContent="C"+r;
b.onclick=()=>setMode(m,r);

div.appendChild(b);
}

$("motorButtons").appendChild(div);
}

/*
 ORDEM DOS CENTROS:

 TIERS
 ÓRFÃOS
 VOISINS
 ZERO

 CADA GRUPO FICA JUNTO.
*/

function orderedCenterBlocks(play){
if(!play)return [];

const ordered=[];

for(const sector of SECTORS){
for(const number of sector.numbers){
const block=play.blocks.find(
b=>b.center===number
);

if(block){
ordered.push({
...block,
sector:sector.name
});
}
}
}

return ordered;
}

/* LINHAS DO TEMPO */

function lineHtml(name,items){
const t=stats(items);

const marks=items.slice(-20).map(x=>{
const cls=
x.sem?""
:x.wait?"wait"
:x.phase==="GALE"?"gale"
:x.hit?"good":"bad";

const label=
x.sem?"—"
:x.wait?"…"
:x.phase==="GALE"?"G"
:x.hit?"W":"L";

return `
<span class="mark ${cls}">
${label}
</span>
`;
}).join("");

return `
<div class="line">

<b>${name}</b>

<div class="marks">
${marks}
</div>

<b>
${t.n?Math.round(t.r20)+"%":"—"}
</b>

</div>
`;
}

/* DESEMPENHO */

function performanceHtml(items,type){
if(!items.length){
return `
<div class="small">
Aguardando resultados.
</div>
`;
}

return items.slice(0,2).map((x,i)=>`
<div class="positionCard">

<small>
${i+1}º DESEMPENHO ${type}
</small>

<strong>
${x.position}ª POSIÇÃO
</strong>

${pct(x.rate)}

<small style="display:block">
${x.wins} WIN /
${x.total} observações
</small>

</div>
`).join("");
}

function motorPerformanceHtml(d){
return d.ranking.map(c=>{
const t=stats(s.lines[c.motor][c.rx]);

return `
<div class="candidate">

<b>${c.rank}º AUTO</b>

• ${LABEL[c.motor]} C${c.rx}

• GEOMETRIA ${c.geometryRank}º

• WIN ${t.wins}

• LOSS ${t.losses}

• ${pct(t.rate)}

</div>
`;
}).join("")||
'<div class="small">Aguardando motores.</div>';
}

/* ÚLTIMAS 14 JOGADAS */

function renderCards(){
$("cards").innerHTML=s.cards.map(x=>{
let border="green";
let label="ENTRADA";
let values=[];

const skipped=x.skipped||[];
const entrySkipped=x.entrySkipped||[];

const hasGale=Number.isInteger(x.gale);
const hasEntry=Number.isInteger(x.entryResult);

const isG2=skipped.length>0;

if(x.phase==="START"){
border="yellow";
label="START";

}else if(x.phase==="ENTRADA_ESPERA"){
border="yellow";
label="2ª CASA";
values=[...entrySkipped];

}else if(x.phase==="WIN"){
border="green";
label="WIN";

if(hasEntry){
values=[
...entrySkipped,
x.entryResult
];
}

}else if(x.phase==="GALE"){
border="yellow";
label=isG2?"G2":"G1";

values=[
...entrySkipped,
...(hasEntry?[x.entryResult]:[]),
...skipped,
...(hasGale?[x.gale]:[])
];

}else if(x.phase==="LOSS"){
border="red";
label="LOSS";

values=[
...entrySkipped,
...(hasEntry?[x.entryResult]:[]),
...skipped,
...(hasGale?[x.gale]:[])
];

}else if(x.phase==="AGUARDANDO"){
border="yellow";
label=isG2?"G2":"G1";

values=[
...entrySkipped,
...(hasEntry?[x.entryResult]:[]),
...skipped
];
}

const numberColor=
x.n===0?"numberZero":
RED.has(x.n)?"numberRed":"numberBlack";

const compact=values.length>1
?"compact":"";

const details=values.map(n=>`
<span>/</span>
<span class="resultValue">${n}</span>
`).join("");

return `
<div class="historyItem ${border} ${numberColor}">

<div class="historyNumber">
${x.n}
</div>

<div class="historyResult ${compact}">
<span>${label}</span>
${details}
</div>

</div>
`;
}).join("");
}

/* RESULTADO GERAL */

function renderGeneral(){
const total=s.general.analyzed;
const green=s.general.green;
const red=s.general.red;

const greenRate=total
?100*green/total:0;

const redRate=total
?100*red/total:0;

$("generalAnalyzed").textContent=total;
$("generalGreen").textContent=green;
$("generalRed").textContent=red;

$("generalGreenPct").textContent=pct(greenRate);
$("generalRedPct").textContent=pct(redRate);

$("generalGreenCount").textContent=
green+" / "+total;

$("generalRedCount").textContent=
red+" / "+total;

$("generalGreenBar").style.width=
greenRate+"%";

$("generalRedBar").style.width=
redRate+"%";

$("generalContent").classList.toggle(
"hidden",!s.openGeneral
);

$("arrowGeneral").textContent=
s.openGeneral?"−":"+";
}

/* RENDER ORIGINAL */

function render(){
const d=calculate();
prepare(d);

const u=buildUnion(d);
const cfg=selected(d);

const freeze=activeFrozen();
const cycle=activeCycle();

const play=freeze
?snapPlay(freeze)
:cycle?.play
?snapPlay(cycle.play)
:cfg?.play;

const effective=effectiveAutoMode();

$("status").textContent=
s.history.length+
"/200 números • "+
d.ranking.length+
"/12 motores • "+
"28 cobertos / 9 descobertos";

$("autoLabel").textContent=
s.mode==="MANUAL"
?LABEL[s.manual]+" C"+s.rx
:cfg
?LABEL[cfg.motor]+" C"+cfg.rx+
" • "+autoModeLabel(effective)
:"AGUARDANDO MOTORES";

for(const [id,value] of [
["auto",s.mode==="AUTO"],
["alternate",s.alternate],
["best2",s.best2],
["union",s.union],
["geoBest2",s.geoBest2],
["allBest",s.allBest],
["fine",s.fineG1],
["second",s.galeSecond],
["secondHouse",s.secondHouse]
]){
$(id).classList.toggle(
"selected",value
);
}

for(let n=1;n<=4;n++){
$("rank"+n).classList.toggle(
"selected",
!s.allBest&&
!s.union&&
!s.best2&&
!s.alternate&&
!s.geoBest2&&
s.rank===n
);
}

for(const m of MOTORS){
for(const r of RX){
$("motor"+m+r).classList.toggle(
"selected",
s.mode==="MANUAL"&&
s.manual===m&&
s.rx===r
);
}
}

$("modeInfo").textContent=
autoModeLabel(effective)+
" • "+
(s.galeSecond
?"GALE NA 2ª RODADA"
:"GALE NORMAL")+
" • "+
(s.fineG1
?"AJUSTE FINO LIGADO"
:"AJUSTE FINO DESLIGADO")+
" • "+
(s.secondHouse
?"2ª CASA LIGADA"
:"2ª CASA DESLIGADA");

$("candidatePanel").classList.toggle(
"hidden",!s.openCandidates
);

$("arrowCandidates").textContent=
s.openCandidates?"−":"+";

$("candidates").innerHTML=
d.ranking.map(c=>`
<div class="candidate">

<b>${c.rank}º AUTO</b>

• ${LABEL[c.motor]} C${c.rx}

• SCORE ${fmt(c.autoScore)}

</div>
`).join("");

$("geometryRanking").innerHTML=
d.geometryRanking.map(c=>`
<div class="candidate">

<b>${c.geometryRank}º GEOMETRIA</b>

• ${LABEL[c.motor]} C${c.rx}

• PESO ${fmt(c.play.score)}

• AUTO ${c.rank}º

</div>
`).join("");

const ta=stats(s.lines.AUTO);
const tu=stats(s.lines.UNION);

$("autoSummary").textContent=
"AUTO: "+
ta.wins+" WIN / "+
ta.losses+" LOSS • "+
pct(ta.rate)+
" | UNIÃO: "+
tu.wins+" WIN / "+
tu.losses+" LOSS • "+
pct(tu.rate)+
" | VISTOS: "+s.seen;

$("autoLine").innerHTML=
lineHtml("AUTO",s.lines.AUTO);

$("unionLine").innerHTML=
lineHtml("UNIÃO",s.lines.UNION);

$("otherLines").classList.toggle(
"hidden",!s.openLines
);

$("arrowLines").textContent=
s.openLines?"−":"+";

$("otherLines").innerHTML=
MOTORS.map(m=>
'<div class="small">'+LABEL[m]+"</div>"+
RX.map(r=>
lineHtml("C"+r,s.lines[m][r])
).join("")
).join("");

/* JOGADA ATUAL */

$("playLabel").textContent=freeze
?"GALE CONGELADO • "+
(LABEL[freeze.motor]||freeze.motor)
:cycle
?"2ª CASA • JOGADA CONGELADA"
:cfg
?"JOGADA • "+
(LABEL[cfg.motor]||cfg.motor)+
" C"+cfg.rx
:"AGUARDANDO JOGADA";

$("play").innerHTML=
orderedCenterBlocks(play).map(b=>`
<div
class="center ${b.r===1?"short":""}"
title="${b.sector} • ${b.nums.join(", ")}"
>
${b.center}
</div>
`).join("");

$("g1Info").textContent=freeze
?(
(freeze.skipRemaining||0)>0
?"GALE CONGELADO • PRÓXIMO RESULTADO IGNORADO"
:"GALE CONGELADO • PRÓXIMO RESULTADO DECIDE"
)
:cycle?.stage==="PULAR"
?"2ª CASA • PRÓXIMO NÚMERO SERÁ PULADO"
:cycle?.stage==="VALIDAR"
?"2ª CASA • PRÓXIMO NÚMERO VALIDA A ENTRADA"
:"AZUL: 2 VIZINHOS • AMARELO: 1 VIZINHO";

renderCards();

/* JOGADOR VIRTUAL */

$("autoPerformance").innerHTML=
performanceHtml(
autoPerformance(),
"AUTO"
);

$("geoPerformance").innerHTML=
performanceHtml(
geoPerformance(),
"GEOMETRIA"
);

$("motorPerformance").innerHTML=
motorPerformanceHtml(d);

$("unionCoverage").innerHTML=u
?`
<b>UNIÃO OTIMIZADA</b>

<div>
APROVEITADOS:
${u.covered} de ${u.unionSize}
</div>

<div>
FORA DA UNIÃO:
${u.missing.length}
</div>

<div>
CASAS ADICIONAIS:
${u.extra.length}
</div>

<div>
COBERTURA FINAL:
28 NÚMEROS
</div>
`
:"Aguardando configuração da união.";

$("audit").textContent=s.audit
?s.audit.title+" — "+s.audit.text
:"Aguardando resultado.";

$("virtualContent").classList.toggle(
"hidden",!s.openVirtual
);

$("arrowVirtual").textContent=
s.openVirtual?"−":"+";

/* RESULTADO GERAL */

renderGeneral();
save();
}

render();

})();
