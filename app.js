
(() => {
"use strict";

/*
=========================================================
              ANÁLISE BETA V6.3.8
=========================================================

BASE INTEGRAL: V6.3.7

MANTIDO:
- JANELA AUTOMÁTICA 90 + 10
- 12 MOTORES
- 7 ESTRATÉGIAS ORIGINAIS
- 12 ADAPTATIVAS
- 4 POSIÇÕES AUTO
- ESTRATÉGIAS PERSONALIZADAS
- TREINADOR GLOBAL
- TREINADOR GLOBAL G1
- CONGELADA
- AJUSTE FINO
- RECONSTRUÇÃO INDEPENDENTE
- CONTINUIDADE
- DESLOCAMENTO
- RUPTURA
- SALTOS E DIREÇÃO
- ESPELHO / ANTIESPELHO
- LINHA DO TEMPO
- LABORATÓRIO
- HISTÓRICOS MANUAIS
- APAGAR ÚLTIMO MANUAL
- RECUPERAR HISTÓRICO
- FICHAS E MULTIPLICADOR

NOVO V6.3.8:

1. TREINADOR GLOBAL NÚMERO
   - ANALISA CADA GATILHO DE 0 A 36.
   - AVALIA COMBINAÇÕES DOS 6 CENTRAIS.
   - COMPARA OS MOTORES E ESTRATÉGIAS
     ESPECIFICAMENTE PARA O NÚMERO.
   - USA APENAS RESULTADOS JÁ CONHECIDOS.
   - REAVALIA APÓS CADA NOVO GIRO.

2. TREINADOR GLOBAL G1 POR NÚMERO
   - ANALISA O NÚMERO QUE CAUSOU O GALE.
   - COMPARA AS 3 DEFESAS.
   - ANALISA O RESULTADO DE CADA DEFESA
     NAS OCORRÊNCIAS DO MESMO GATILHO.
   - REAVALIA CONTINUIDADE,
     DESLOCAMENTO E RUPTURA.
   - PODE MANTER, AJUSTAR OU RECONSTRUIR.

3. BOTÕES ATIVOS
   - TREINADOR GLOBAL NÚMERO.
   - TREINADOR GLOBAL G1.
   - INDICAÇÃO VISUAL ACESA.

4. JANELA 90 + 10
   - IMPORTA OS ÚLTIMOS 90.
   - ACEITA 10 MANUAIS.
   - RECALCULA COM OS ÚLTIMOS 90.
   - REINICIA TODO O APRENDIZADO.
   - PRESERVA APENAS OS REGISTROS
     MANUAIS ARQUIVADOS.

IMPORTANTE:
ESTATÍSTICAS HISTÓRICAS NÃO GARANTEM
RESULTADOS FUTUROS EM ROLETA.
=========================================================
*/

const VERSION = "6.3.8";
const KEY = "ANALISE_BETA_V638";
const OLD_KEY = "ANALISE_BETA_V637";

const WINDOW = 90;
const MANUAL_LIMIT = 10;

const W = [
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

const RED = new Set([
1,3,5,7,9,12,14,16,18,
19,21,23,25,27,30,32,34,36
]);

const REGIONS = {
TIERS:[27,13,36,11,30,8,23,10,5,24,16,33],
ORFAOS:[17,34,6,1,20,14,31,9],
VOISINS:[22,18,29,7,25,2,21,4,19],
ZERO:[28,12,35,3,26,0,32,15]
};

const FAMILIES = [
"NORMAL",
"DINAMICO",
"RX_NORMAL",
"RX_DINAMICO"
];

const RADII = [4,5,6];

const ORIGINALS = [
["FIXED","AUTO RANKING"],
["GEO","MELHOR GEOMETRIA"],
["BEST","MELHOR DESEMPENHO"],
["STABLE","ESTABILIDADE"],
["SWITCH","TROCA INTELIGENTE"],
["CONSENSUS","CONSENSO"],
["UNION","UNIÃO"]
];

const ADAPTATIVES = Array.from(
{length:12},
(_,i)=>({
id:"A"+String(i+1).padStart(2,"0"),
name:"ADAPTATIVA "+String(i+1).padStart(2,"0"),
window:[10,10,10,20,20,20,30,30,20,30,20,30][i],
margin:[.05,.10,.15,.05,.10,.15,.05,.10,.08,.12,.10,.08][i],
maxRank:[12,12,12,12,12,12,12,12,12,6,4,8][i]
})
);

const G1_MODES = [
"CONGELADA",
"AJUSTE FINO",
"RECONSTRUÇÃO"
];

const BEHAVIORS = [
"CONTINUIDADE",
"DESLOCAMENTO",
"RUPTURA"
];

const NUMBER_STYLES = [
{
id:"NUM_FREQUENCIA",
name:"NÚMERO • FREQUÊNCIA",
recency:45,
spread:2
},
{
id:"NUM_RECENTE",
name:"NÚMERO • RECENTE",
recency:18,
spread:2
},
{
id:"NUM_FISICO",
name:"NÚMERO • FÍSICO",
recency:30,
spread:3
},
{
id:"NUM_HIBRIDO",
name:"NÚMERO • HÍBRIDO",
recency:28,
spread:2
}
];

const $ = id => document.getElementById(id);

const mod = n => (n%37+37)%37;

const ix = n => W.indexOf(n);

const avg = a => a.length
?a.reduce((s,n)=>s+n,0)/a.length
:0;

const clamp = (n,a,b) =>
Math.max(a,Math.min(b,n));

const copy = x => x==null
?x
:JSON.parse(JSON.stringify(x));

const fmt = n => Number.isFinite(n)
?n.toFixed(2).replace(".",",")
:"—";

const pct = (a,b) => b
?fmt(100*a/b)+"%"
:"—";

function esc(x) {
return String(x??"").replace(
/[&<>"']/g,
c=>({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#39;"
}[c])
);
}

function cleanNumbers(a) {
return Array.isArray(a)
?a.filter(n=>
Number.isInteger(n)&&n>=0&&n<=36
)
:[];
}

function neighbors(n,r) {
const p=ix(n);

if(p<0)return [];

return Array.from(
{length:2*r+1},
(_,i)=>W[mod(p+i-r)]
);
}

function distance(a,b) {
const x=ix(a);
const y=ix(b);

if(x<0||y<0)return 18;

const d=Math.abs(x-y);

return Math.min(d,37-d);
}

function direction(a,b) {
const x=ix(a);
const y=ix(b);

if(x<0||y<0)return 0;

const f=mod(y-x);
const r=mod(x-y);

return f<=r?f:-r;
}

function region(n) {
return Object.keys(REGIONS).find(
k=>REGIONS[k].includes(n)
)||"ZERO";
}

const MIRROR=new Set();

for(const n of [
11,12,13,21,22,23,31,32,33
]) {
for(const x of neighbors(n,1)) {
MIRROR.add(x);
}
}

function mirror(n) {
return MIRROR.has(n)
?"ESPELHO"
:"ANTIESPELHO";
}

/* ======================================================
 ESTADO
====================================================== */

function fresh() {
return {
history:[],
sources:[],
manualCount:0,
manualLog:[],
cyclesCompleted:0,

strategy:"TRAINER",
rank:3,
manual:null,
adaptive:"A05",
created:[],
activeCreated:null,

g1:true,
g1Trainer:true,
numberTrainer:true,

galeSkip:false,
secondHouse:false,

stake:1,
multiplier:1,

phase:"ENTRY",
cycle:null,
defense:null,
previous:null,

trainerChoice:null,
trainerTurns:0,
trainerChanges:0,
trainerPending:false,
trainerHistory:[],

numberChoice:null,
numberHistory:[],
numberRows:[],
numberChanges:0,

virtual:{},
entryRows:[],
g1Rows:[],
g1Pending:[],
realG1:[],
decisions:[],
ledger:[],

open:{
general:true,
trainer:true,
numbertrainer:true,
g1ranking:true,
g1numbers:true,
motors:false,
jumps:false,
mirrors:false,
timeline:true,
lab:false
}
};
}

function read(key) {
try {
return JSON.parse(
localStorage.getItem(key)||"null"
);
} catch {
return null;
}
}

let state=fresh();
let busy=false;
let saveError="";

const saved=read(KEY);

if(saved&&Array.isArray(saved.history)) {
state={
...fresh(),
...saved,
open:{
...fresh().open,
...(saved.open||{})
}
};

state.history=
cleanNumbers(state.history).slice(-100);

state.manualCount=clamp(
Number(state.manualCount)||0,
0,10
);

for(const name of [
"manualLog",
"sources",
"created",
"trainerHistory",
"numberHistory",
"numberRows",
"entryRows",
"g1Rows",
"g1Pending",
"realG1",
"decisions",
"ledger"
]) {
if(!Array.isArray(state[name])) {
state[name]=[];
}
}

if(
!state.virtual||
typeof state.virtual!=="object"
) {
state.virtual={};
}
}

function save() {
try {
const data={
...state,
numberRows:state.numberRows.slice(-5000),
numberHistory:state.numberHistory.slice(-300),
entryRows:state.entryRows.slice(-4000),
g1Rows:state.g1Rows.slice(-5000),
ledger:state.ledger.slice(-300),
realG1:state.realG1.slice(-300),
decisions:state.decisions.slice(-300),
trainerHistory:state.trainerHistory.slice(-300)
};

localStorage.setItem(
KEY,
JSON.stringify(data)
);

saveError="";
return true;

} catch(e) {
saveError=String(e.message||e);
return false;
}
}

function settings() {
return {
strategy:state.strategy,
rank:state.rank,
manual:state.manual,
adaptive:state.adaptive,
created:copy(state.created),
activeCreated:state.activeCreated,

g1:state.g1,
g1Trainer:state.g1Trainer,
numberTrainer:state.numberTrainer,

galeSkip:state.galeSkip,
secondHouse:state.secondHouse,

stake:state.stake,
multiplier:state.multiplier,

open:copy(state.open)
};
}

/* ======================================================
 GEOMETRIA DE 28 NÚMEROS
====================================================== */

const FIVE=W.map(n=>({
center:n,
radius:2,
numbers:neighbors(n,2)
}));

const THREE=W.map(n=>({
center:n,
radius:1,
numbers:neighbors(n,1)
}));

for(const b of [...FIVE,...THREE]) {
b.mask=b.numbers.reduce(
(s,n)=>s|(1n<<BigInt(ix(n))),
0n
);
}

function geometry(weights,mandatory=[]) {
const scoreBlock=b=>({
...b,
value:b.numbers.reduce(
(s,n)=>s+(weights[ix(n)]||0),
0
)
});

const fives=FIVE.map(scoreBlock).sort(
(a,b)=>b.value-a.value
);

const threes=THREE.map(scoreBlock)
.filter(b=>mandatory.every(
n=>b.numbers.includes(n)
))
.sort((a,b)=>b.value-a.value);

let best=null;

for(const small of threes) {
let beam=[{
blocks:[small],
mask:small.mask,
score:small.value
}];

for(let step=0;step<5;step++) {
const next=[];

for(const item of beam) {
for(const b of fives) {
if((item.mask&b.mask)!==0n)continue;

next.push({
blocks:[...item.blocks,b],
mask:item.mask|b.mask,
score:item.score+b.value
});
}
}

next.sort((a,b)=>b.score-a.score);

beam=[];
const seen=new Set();

for(const item of next) {
const key=String(item.mask);

if(seen.has(key))continue;

seen.add(key);
beam.push(item);

if(beam.length>=6)break;
}

if(!beam.length)break;
}

for(const item of beam) {
if(item.blocks.length!==6)continue;

if(!best||item.score>best.score) {
best=item;
}
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

if(new Set(numbers).size!==28)return null;

return {
blocks,
numbers,
score:best.score
};
}

function validPlay(play) {
return !!play&&
Array.isArray(play.numbers)&&
play.numbers.length===28&&
new Set(play.numbers).size===28&&
Array.isArray(play.blocks)&&
play.blocks.length===6&&
play.blocks.filter(
b=>b.radius===2
).length===5&&
play.blocks.filter(
b=>b.radius===1
).length===1;
}

function missing(play) {
if(!validPlay(play))return [...W];

const set=new Set(play.numbers);

return W.filter(n=>!set.has(n));
}

/* ======================================================
 ANÁLISE SEQUENCIAL
====================================================== */

function analyze(h) {
const transitions=[];

for(
let i=Math.max(1,h.length-45);
i<h.length;
i++
) {
const a=h[i-1];
const b=h[i];

const pd=direction(a,b);

transitions.push({
from:a,
to:b,
numeric:b-a,
physical:pd,
distance:Math.abs(pd),
mirrorFrom:mirror(a),
mirrorTo:mirror(b)
});
}

const last6=transitions.slice(-6);

function streak(field) {
const sign=Math.sign(
transitions.at(-1)?.[field]||0
);

let length=0;

if(sign) {
for(
let i=transitions.length-1;
i>=0;
i--
) {
if(
Math.sign(
transitions[i][field]
)!==sign
)break;

length++;
}
}

return {
dir:sign,
length
};
}

const regions={};

for(const name of Object.keys(REGIONS)) {
let absence=0;

for(let i=h.length-1;i>=0;i--) {
if(region(h[i])===name)break;
absence++;
}

regions[name]={
absence,
recent:h.slice(-12).filter(
n=>region(n)===name
).length
};
}

const last3=transitions.slice(-3);
const prev3=transitions.slice(-6,-3);

return {
transitions,
last6,

numericStreak:streak("numeric"),
physicalStreak:streak("physical"),

mean3:avg(
last3.map(x=>x.distance)
),

previous3:avg(
prev3.map(x=>x.distance)
),

acceleration:
avg(last3.map(x=>x.distance))-
avg(prev3.map(x=>x.distance)),

regions
};
}

/* ======================================================
 12 MOTORES ORIGINAIS
====================================================== */

function weightsFor(h,family,radius) {
const weights=Array(37).fill(.01);
const recent=h.slice(-60);

for(let k=0;k<recent.length;k++) {
const p=ix(
recent[recent.length-1-k]
);

const decay=Math.exp(
-k/(radius*2.3)
);

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=6) {
weights[j]+=
decay*(7-d)/7;
}
}
}

if(family.includes("DINAMICO")) {
for(
let k=0;
k<Math.min(radius+2,h.length);
k++
) {
const p=ix(
h[h.length-1-k]
);

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=3) {
weights[j]+=
(4-d)/(k+2)*1.7;
}
}
}
}

if(family.startsWith("RX")) {
const len=Math.min(
radius,
h.length-2
);

const matches=[];

if(len>=2) {
for(
let i=0;
i+len<h.length-1;
i++
) {
let score=0;

for(let j=0;j<len;j++) {
score+=Math.max(
0,
6-distance(
h[h.length-len+j],
h[i+j]
)
)/6;
}

matches.push({
score:score/len,
next:h[i+len]
});
}

matches.sort(
(a,b)=>b.score-a.score
);

for(const match of matches.slice(0,12)) {
const p=ix(match.next);

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=3) {
weights[j]+=
(4-d)*match.score*.45;
}
}
}
}
}

if(h.length>=3) {
const a=analyze(h);
const last=h.at(-1);

const numericBias=
a.last6.filter(
x=>x.numeric>0
).length-
a.last6.filter(
x=>x.numeric<0
).length;

const physicalBias=
a.last6.filter(
x=>x.physical>0
).length-
a.last6.filter(
x=>x.physical<0
).length;

const expected=clamp(
Math.round(
avg(a.last6.map(
x=>x.distance
))
),
1,18
);

for(const n of W) {
const pd=direction(last,n);
const d=Math.abs(pd);

let bonus=0;

if(
numericBias&&
Math.sign(n-last)===
Math.sign(numericBias)
)bonus+=.10;

if(
physicalBias&&
Math.sign(pd)===
Math.sign(physicalBias)
)bonus+=.12;

if(
Math.abs(d-expected)<=2
)bonus+=.09;

if(
a.numericStreak.length>=2&&
Math.sign(n-last)===
a.numericStreak.dir
)bonus+=.07;

if(
a.physicalStreak.length>=2&&
Math.sign(pd)===
a.physicalStreak.dir
)bonus+=.07;

if(
a.acceleration>=3&&
d>=10
)bonus+=.07;

if(
a.acceleration<=-3&&
d<=5
)bonus+=.07;

weights[ix(n)]+=
bonus*radius/5;
}
}

return weights;
}

function motors(h) {
if(h.length<8)return [];

const result=[];

for(const family of FAMILIES) {
for(const radius of RADII) {
if(
family.startsWith("RX")&&
h.length<radius*2+4
)continue;

const play=geometry(
weightsFor(h,family,radius)
);

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

result.sort(
(a,b)=>b.score-a.score
);

result.forEach((m,i)=>{
m.rank=i+1;
});

return result;
}

/* ======================================================
 NOVO: TREINADOR GLOBAL NÚMERO
====================================================== */

/*
EXEMPLO:

HISTÓRICO:
2,17,8,2,30,11,2,5

TRANSIÇÕES DO NÚMERO 2:
2 -> 17
2 -> 30
2 -> 5

O TREINADOR MONTA COMBINAÇÕES
COM OS 6 CENTRAIS PARA O GATILHO 2.

CADA COMBINAÇÃO É AVALIADA
CRONOLOGICAMENTE.

NUNCA UTILIZA O PRÓXIMO RESULTADO
ANTES DE ELE SER INFORMADO.
*/

function numberTransitions(h,trigger) {
const rows=[];

for(let i=0;i<h.length-1;i++) {
if(h[i]!==trigger)continue;

rows.push({
next:h[i+1],
age:h.length-1-i,
turn:i+2
});
}

return rows;
}

function numberWeights(h,trigger,style) {
const weights=Array(37).fill(.02);

const pairs=numberTransitions(
h,trigger
);

const recent=h.slice(-50);

for(const pair of pairs) {
const p=ix(pair.next);

const decay=Math.exp(
-pair.age/style.recency
);

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=style.spread) {
weights[j]+=
decay*
(style.spread+1-d)/
(style.spread+1)*5;
}
}
}

for(let k=0;k<recent.length;k++) {
const p=ix(
recent[recent.length-1-k]
);

const decay=Math.exp(
-k/(style.recency/2)
);

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=2) {
weights[j]+=
decay*(3-d)/3*.45;
}
}
}

if(style.id==="NUM_FISICO") {
for(const n of neighbors(trigger,3)) {
weights[ix(n)]+=.30;
}
}

if(style.id==="NUM_HIBRIDO") {
const base=weightsFor(
h,"RX_DINAMICO",5
);

for(let j=0;j<37;j++) {
weights[j]+=
base[j]*.35;
}
}

return weights;
}

function numberCandidates(h,trigger) {
if(h.length<8||trigger==null)return [];

const result=[];

for(const style of NUMBER_STYLES) {
const play=geometry(
numberWeights(h,trigger,style)
);

if(!validPlay(play))continue;

result.push({
key:style.id,
name:style.name,
rank:0,
score:play.score,
play,
type:"NUMBER"
});
}

return result;
}

function numberMotorRows(trigger,key,limit=100) {
return state.numberRows.filter(
r=>
r.trigger===trigger&&
r.motor===key
).slice(-limit);
}

function numberMotorMetrics(
trigger,key,limit=100
) {
const rows=numberMotorRows(
trigger,key,limit
);

const hits=rows.filter(
r=>r.hit
).length;

return {
total:rows.length,
hits,
loss:rows.length-hits,
rate:rows.length
?hits/rows.length
:null
};
}

function numberScore(
trigger,
motor,
limit=40
) {
const rows=numberMotorRows(
trigger,motor.key,limit
);

const recent=rows.slice(-8);

const base=28/37;

const hits=rows.filter(
r=>r.hit
).length;

const hits8=recent.filter(
r=>r.hit
).length;

const historical=
(hits+base*10)/
(rows.length+10);

const short=
(hits8+base*6)/
(recent.length+6);

return {
total:rows.length,
hits,
loss:rows.length-hits,
score:
historical*.75+
short*.25
};
}

function rankNumberMotors(h,cs) {
const trigger=h.at(-1);

if(trigger==null)return [];

const extra=numberCandidates(
h,trigger
);

const candidates=[
...cs,
...extra
];

return candidates.map(m=>{
const stats=numberScore(
trigger,m
);

return {
...m,
numberStats:stats,
numberScore:stats.score
};
}).sort((a,b)=>
b.numberScore-a.numberScore||
b.numberStats.total-
a.numberStats.total||
(a.rank||99)-(b.rank||99)
);
}

function bestNumberMotor(h,cs) {
return rankNumberMotors(
h,cs
)[0]||null;
}

/*
TODOS OS MOTORES E TODAS AS
COMBINAÇÕES POR NÚMERO SÃO
TESTADOS NO GIRO SEGUINTE.

AS ESTATÍSTICAS SÃO REGISTRADAS
SOMENTE DEPOIS DE CONHECER
O NÚMERO SORTEADO.
*/

function trainNumberMotors(
before,
n,
cs,
turn
) {
const trigger=before.at(-1);

if(trigger==null)return;

const extra=numberCandidates(
before,trigger
);

for(const motor of [
...cs,
...extra
]) {
state.numberRows.push({
turn,
trigger,
motor:motor.key,
name:motor.name||motor.key,
number:n,
hit:motor.play.numbers.includes(n),
centers:motor.play.blocks.map(
b=>b.center
)
});
}

if(state.numberRows.length>5500) {
state.numberRows=
state.numberRows.slice(-5500);
}
}

/* ======================================================
 ESTRATÉGIAS
====================================================== */

function definitions() {
return [
...ORIGINALS.map(([rule,name])=>({
id:"ORIGINAL:"+rule,
name,
rule,
type:"ORIGINAL"
})),

...Array.from(
{length:4},
(_,i)=>({
id:"RANK:"+(i+1),
name:"AUTO "+(i+1)+"º",
rank:i+1,
type:"RANK"
})
),

...ADAPTATIVES.map(config=>({
id:"ADAPTIVE:"+config.id,
name:config.name,
config,
type:"ADAPTIVE"
})),

...state.created.map(c=>({
id:"CREATED:"+c.id,
name:c.name,
config:c.config,
type:"CREATED"
}))
];
}

function motorRate(key,limit=12) {
const rows=state.ledger.filter(
r=>r.motorHits&&
key in r.motorHits
).slice(-limit);

if(!rows.length)return .5;

return rows.filter(
r=>r.motorHits[key]
).length/rows.length;
}

function chooseMotor(def,cs,previous) {
if(!cs.length)return null;

const fixed=cs[
clamp(
state.rank-1,
0,
cs.length-1
)
];

if(def.rank) {
return cs[
clamp(
def.rank-1,
0,
cs.length-1
)
];
}

if(def.config) {
const c=def.config;

const ranked=cs.filter(
m=>m.rank<=c.maxRank
).map(m=>({
motor:m,
score:
motorRate(m.key,3)*.55+
motorRate(m.key,c.window)*.45
})).sort((a,b)=>
b.score-a.score||
a.motor.rank-b.motor.rank
);

const best=ranked[0];

const old=ranked.find(
x=>x.motor.key===previous
);

if(
old&&best&&
best.score<old.score+c.margin
)return old.motor;

return best?.motor||fixed;
}

if(def.rule==="GEO") {
return cs[0];
}

if(def.rule==="BEST") {
return [...cs].sort(
(a,b)=>
motorRate(b.key,20)-
motorRate(a.key,20)
)[0];
}

if(def.rule==="STABLE") {
return cs.find(
m=>
m.key===previous&&
m.rank<=5
)||fixed;
}

if(def.rule==="SWITCH") {
const old=cs.find(
m=>m.key===previous
)||fixed;

const best=[...cs].sort(
(a,b)=>
motorRate(b.key,12)-
motorRate(a.key,12)
)[0];

return motorRate(best.key,12)>
motorRate(old.key,12)+.12
?best:old;
}

if(
["CONSENSUS","UNION"].includes(
def.rule
)
) {
const weights=Array(37).fill(0);

const selected=
def.rule==="UNION"
?cs.slice(0,3)
:cs;

for(const m of selected) {
for(const n of m.play.numbers) {
weights[ix(n)]+=
1/(1+m.rank*.1);
}
}

const play=geometry(weights);

if(play) {
return {
key:def.rule,
rank:0,
score:play.score,
play
};
}
}

return fixed;
}

/* ======================================================
 DEFESAS G1
====================================================== */

function fineG1(original,trigger) {
if(!validPlay(original?.play)) {
return null;
}

const weights=Array(37).fill(.01);
const mandatory=neighbors(trigger,1);

for(const n of original.play.numbers) {
weights[ix(n)]+=100;
}

for(const n of mandatory) {
weights[ix(n)]+=100000;
}

const play=geometry(
weights,mandatory
);

return play
?{
key:original.key,
rank:original.rank,
play
}
:copy(original);
}

function g1History(
strategy=null,
mode=null,
limit=400
) {
return state.g1Rows.filter(r=>
(strategy==null||
r.strategy===strategy)&&
(mode==null||
r.mode===mode)
).slice(-limit);
}

function uniqueGales(
strategy=null,
limit=100
) {
const rows=g1History(
strategy,null,5000
);

const map=new Map();

for(const r of rows) {
const key=
r.strategy+"|"+r.eventId;

if(!map.has(key)) {
map.set(key,r);
}
}

return [...map.values()].slice(-limit);
}

/* ======================================================
 NOVO: G1 CONDICIONADO AO NÚMERO
====================================================== */

function numberG1Rows(
strategy,
trigger,
mode=null,
limit=200
) {
return state.g1Rows.filter(r=>
r.strategy===strategy&&
r.trigger===trigger&&
(mode==null||r.mode===mode)
).slice(-limit);
}

function numberG1Metrics(
strategy,
trigger,
mode,
limit=100
) {
const rows=numberG1Rows(
strategy,trigger,mode,limit
);

const hits=rows.filter(
r=>r.hit
).length;

return {
total:rows.length,
hits,
loss:rows.length-hits,
rate:rows.length
?hits/rows.length
:null
};
}

function numberG1Events(
strategy,
trigger,
limit=100
) {
const rows=numberG1Rows(
strategy,trigger,null,1000
);

const map=new Map();

for(const row of rows) {
if(!map.has(row.eventId)) {
map.set(row.eventId,row);
}
}

return [...map.values()].slice(-limit);
}

/*
LEITURA POR NÚMERO:
COMPARA OS GALES ASSOCIADOS
AO MESMO GATILHO, ALÉM DO
COMPORTAMENTO GLOBAL DA ESTRATÉGIA.
*/

function behaviorReading(
original,h,strategy,trigger=null
) {
const rows=uniqueGales(
strategy,45
);

const recent=rows.slice(-12);
const last6=rows.slice(-6);

const loss12=recent.filter(
r=>!r.hit
).length;

const loss6=last6.filter(
r=>!r.hit
).length;

const uncovered=new Set(
missing(original.play)
);

const outside6=h.slice(-6).filter(
n=>uncovered.has(n)
).length;

let streak=0;

for(let i=rows.length-1;i>=0;i--) {
if(rows[i].hit)break;
streak++;
}

const numberRows=trigger==null
?[]
:numberG1Events(
strategy,trigger,20
);

const numberRecent=
numberRows.slice(-8);

const numberLoss=
numberRecent.filter(
r=>!r.hit
).length;

let type="CONTINUIDADE";

if(
streak>=3||
(last6.length>=5&&
loss6/last6.length>=.60)||
(h.length>=6&&outside6>=4)||
(numberRecent.length>=4&&
numberLoss/numberRecent.length>=.60)
) {
type="RUPTURA";
}

else if(
(recent.length>=5&&
loss12/recent.length>=.32)||
outside6>=2||
(numberRecent.length>=3&&
numberLoss/numberRecent.length>=.34)
) {
type="DESLOCAMENTO";
}

return {
type,
streak,
outside6,
loss12,
total12:recent.length,
loss6,
total6:last6.length,
numberTotal:numberRecent.length,
numberLoss,
numberHit:
numberRecent.length-numberLoss
};
}

/* ======================================================
 RECONSTRUÇÃO INDEPENDENTE
====================================================== */

/*
A RECONSTRUÇÃO NÃO UTILIZA
OS PESOS NEM OS 28 NÚMEROS
DO MOTOR ORIGINAL.

A V6.3.8 ACRESCENTA TRANSIÇÕES
DO NÚMERO GATILHO AO HISTÓRICO.
*/

function reconstructG1(
original,
trigger,
h,
strategy
) {
if(!validPlay(original?.play)) {
return null;
}

const reading=behaviorReading(
original,h,strategy,trigger
);

const weights=Array(37).fill(.1);

const recent=h.slice(-60);

const gales=g1History(
strategy,null,180
);

const transitions=numberTransitions(
h,trigger
);

for(const n of W) {
const f60=recent.filter(
x=>x===n
).length;

const f24=h.slice(-24).filter(
x=>x===n
).length;

const f8=h.slice(-8).filter(
x=>x===n
).length;

const losses=gales.filter(
r=>!r.hit&&
r.outcome===n
).length;

const conditional=transitions.reduce(
(s,t)=>
s+(t.next===n
?Math.exp(-t.age/35)
:0),
0
);

let value=
f60*.30+
f24*.55+
f8*.85+
losses*.35+
conditional*2.2;

if(
reading.type==="DESLOCAMENTO"
) {
value+=f8*.35+
conditional*.35;
}

if(
reading.type==="RUPTURA"
) {
value+=
f8*.60+
losses*.45+
conditional*.65;
}

weights[ix(n)]+=value;
}

for(let k=0;k<recent.length;k++) {
const p=ix(
recent[recent.length-1-k]
);

const decay=Math.exp(
-k/(
reading.type==="RUPTURA"
?8:14
)
);

for(let j=0;j<37;j++) {
const d=Math.min(
Math.abs(p-j),
37-Math.abs(p-j)
);

if(d<=3) {
weights[j]+=
decay*(4-d)/4*.65;
}
}
}

for(const n of neighbors(trigger,2)) {
weights[ix(n)]+=.4;
}

const play=geometry(weights);

if(!validPlay(play))return null;

return {
key:"G1_INDEPENDENTE",
rank:0,
play,
behavior:reading.type
};
}

function defenses(
original,
trigger,
h,
strategy
) {
if(!validPlay(original?.play)) {
return [];
}

const reading=behaviorReading(
original,h,strategy,trigger
);

const frozen={
mode:"CONGELADA",
motor:copy(original),
behavior:reading.type
};

const fine={
mode:"AJUSTE FINO",
motor:fineG1(
original,trigger
),
behavior:reading.type
};

const recon=reconstructG1(
original,trigger,h,strategy
);

return [
frozen,
fine,
...(recon?[{
mode:"RECONSTRUÇÃO",
motor:recon,
behavior:reading.type
}]:[])
];
}

function defenseMetrics(
strategy,
mode,
limit=100
) {
const rows=g1History(
strategy,mode,limit
);

const hits=rows.filter(
r=>r.hit
).length;

return {
total:rows.length,
hits,
loss:rows.length-hits,
rate:rows.length
?hits/rows.length
:null
};
}

/* ======================================================
 NOVO: RANKING G1 GLOBAL + NÚMERO
====================================================== */

function rankDefenses(
options,
strategy,
h,
trigger=null
) {
return options.map(option=>{
const rows=g1History(
strategy,option.mode,100
);

const recent=rows.slice(-12);

const hits=rows.filter(
r=>r.hit
).length;

const hits12=recent.filter(
r=>r.hit
).length;

const base=28/37;

const historical=
(hits+base*12)/
(rows.length+12);

const short=
(hits12+base*8)/
(recent.length+8);

const coverage=h.length
?h.slice(-18).filter(
n=>
option.motor.play.numbers.includes(n)
).length/
Math.min(18,h.length)
:base;

const byNumber=trigger==null
?{
total:0,
hits:0,
loss:0
}
:numberG1Metrics(
strategy,
trigger,
option.mode,
100
);

const conditional=
(byNumber.hits+base*8)/
(byNumber.total+8);

let bonus=0;

if(
option.behavior==="CONTINUIDADE"&&
option.mode==="CONGELADA"
)bonus=.012;

if(
option.behavior==="DESLOCAMENTO"&&
option.mode==="AJUSTE FINO"
)bonus=.010;

if(
option.behavior==="RUPTURA"&&
option.mode==="RECONSTRUÇÃO"
)bonus=.020;

/*
QUANDO HÁ AMOSTRA ESPECÍFICA
DO NÚMERO, SEU PESO AUMENTA.
*/

const numberWeight=trigger==null
?0
:Math.min(
.48,
byNumber.total/
(byNumber.total+8)
);

const globalScore=
historical*.55+
short*.25+
coverage*.20;

const score=
globalScore*(1-numberWeight)+
conditional*numberWeight+
bonus;

return {
...option,
score,
total:rows.length,
hits,
loss:rows.length-hits,
numberTotal:byNumber.total,
numberHits:byNumber.hits,
numberLoss:byNumber.loss,
numberScore:conditional,
uncovered:missing(
option.motor.play
)
};
}).sort((a,b)=>
b.score-a.score||
b.numberTotal-a.numberTotal
);
}

function chooseG1(
original,
trigger,
h,
strategy
) {
const ranked=rankDefenses(
defenses(
original,trigger,h,strategy
),
strategy,
h,
trigger
);

if(!ranked.length)return null;

let chosen=ranked[0];

const frozen=ranked.find(
x=>x.mode==="CONGELADA"
);

if(
frozen&&
chosen!==frozen&&
chosen.total<8&&
chosen.numberTotal<4&&
chosen.score-frozen.score<.025
) {
chosen=frozen;
}

return {
motor:copy(chosen.motor),
mode:chosen.mode,
behavior:chosen.behavior,
score:chosen.score,
numberTotal:chosen.numberTotal,
numberHits:chosen.numberHits,
numberLoss:chosen.numberLoss,
uncovered:chosen.uncovered,

alternatives:ranked.map(x=>({
mode:x.mode,
score:x.score,
total:x.total,
hits:x.hits,
loss:x.loss,
numberTotal:x.numberTotal,
numberHits:x.numberHits,
numberLoss:x.numberLoss
}))
};
}

/* ======================================================
 TREINADOR GLOBAL ORIGINAL
====================================================== */

function virtualCycle(id) {
return state.virtual[id]||
(state.virtual[id]={
phase:"ENTRY",
previous:null,
defense:null,
entry:null,
trigger:null
});
}

function trainerRanking(
trigger=null
) {
return definitions().map(def=>{
const rows=state.entryRows.filter(
r=>
r.strategy===def.id&&
r.closed
).slice(-30);

const recent=rows.slice(-12);

const hits=rows.filter(
r=>r.result!=="LOSS"
).length;

const losses=recent.filter(
r=>r.result==="LOSS"
).length;

const globalScore=
(hits+8*(28/37))/
(rows.length+8)-
losses*.008;

/*
NOVO:
ESTRATÉGIA AVALIADA TAMBÉM
PELO NÚMERO QUE DISPAROU
A ENTRADA.
*/

const specific=trigger==null
?[]
:state.entryRows.filter(
r=>
r.strategy===def.id&&
r.closed&&
r.trigger===trigger
).slice(-30);

const specificHits=specific.filter(
r=>r.result!=="LOSS"
).length;

const specificScore=
(specificHits+8*(28/37))/
(specific.length+8);

const numberWeight=
state.numberTrainer&&
trigger!=null
?Math.min(
.50,
specific.length/
(specific.length+8)
)
:0;

const score=
globalScore*(1-numberWeight)+
specificScore*numberWeight;

return {
...def,
score,
total:rows.length,
hits,
loss:rows.length-hits,
numberTotal:specific.length,
numberHits:specificHits,
numberLoss:
specific.length-specificHits
};
}).sort((a,b)=>
b.score-a.score||
b.numberTotal-a.numberTotal||
a.id.localeCompare(b.id)
);
}

function activeDefinition() {
const defs=definitions();

if(state.strategy==="TRAINER") {
return defs.find(
d=>d.id===state.trainerChoice
)||defs[0];
}

if(state.strategy==="ADAPTIVE") {
return defs.find(
d=>
d.id==="ADAPTIVE:"+state.adaptive
)||defs[0];
}

if(state.strategy==="CREATED") {
return defs.find(
d=>d.id===state.activeCreated
)||defs[0];
}

return defs.find(
d=>
d.id==="ORIGINAL:"+state.strategy
)||defs[0];
}

function updateTrainer() {
if(
state.strategy!=="TRAINER"||
state.phase!=="ENTRY"||
state.manual
)return;

const trigger=state.history.at(-1);

const ranked=trainerRanking(
state.numberTrainer
?trigger:null
);

const current=ranked.find(
r=>r.id===state.trainerChoice
);

const best=ranked[0];

if(!best)return;

const shouldChange=
!current||
state.trainerTurns>=3||
state.trainerPending||
(
best.id!==current.id&&
best.score>current.score+.035
);

if(!shouldChange)return;

/*
MANTÉM A REGRA DE TROCA DA
V6.3.7, AGORA COM A NOTA
CONDICIONADA AO NÚMERO.
*/

const selected=current
?ranked.find(
r=>r.id!==current.id
)||best
:best;

if(
current&&
current.id!==selected.id
) {
state.trainerChanges++;
}

state.trainerChoice=selected.id;
state.trainerTurns=0;
state.trainerPending=false;

state.trainerHistory.push({
turn:state.history.length,
trigger,
from:current?.id||"INICIAL",
to:selected.id,
score:selected.score,
numberTotal:selected.numberTotal
});
}

/* ======================================================
 MOTOR ATIVO + TREINADOR NÚMERO
====================================================== */

function activeMotor(cs) {
if(state.manual) {
return cs.find(
m=>m.key===state.manual
)||cs[0]||null;
}

const normal=chooseMotor(
activeDefinition(),
cs,
state.previous
);

if(
!state.numberTrainer||
state.strategy!=="TRAINER"||
!normal||
state.history.length<8
) {
return normal;
}

const ranked=rankNumberMotors(
state.history,cs
);

const best=ranked[0];

if(!best)return normal;

const trigger=state.history.at(-1);

const normalStats=numberScore(
trigger,normal
);

const bestStats=numberScore(
trigger,best
);

/*
TROCA APENAS QUANDO EXISTE
EVIDÊNCIA CONDICIONADA MÍNIMA.

CASO CONTRÁRIO, PRESERVA A
ESCOLHA DO TREINADOR GLOBAL.
*/

const shouldUseNumber=
best.key!==normal.key&&
bestStats.total>=3&&
bestStats.score>
normalStats.score+.035;

const selected=shouldUseNumber
?best
:normal;

state.numberChoice={
trigger,
motor:selected.key,
name:selected.name||selected.key,
changed:shouldUseNumber,
normal:normal.key,
score:bestStats.score,
tests:bestStats.total
};

return selected;
}

function profit(result) {
const unit=
Number(state.stake)||1;

const g=
Number(state.multiplier)||1;

if(result==="GREEN") {
return 8*unit;
}

if(result==="GREEN G1") {
return (8*g-28)*unit;
}

if(result==="LOSS") {
return -28*(1+g)*unit;
}

return 0;
}

/* ======================================================
 PROCESSAMENTO CRONOLÓGICO
====================================================== */

function settlePending(n) {
for(const p of state.g1Pending) {
state.g1Rows.push({
turn:state.history.length+1,
eventId:p.eventId,
strategy:p.strategy,
mode:p.mode,
behavior:p.behavior,
trigger:p.trigger,
outcome:n,
hit:p.numbers.includes(n),
uncovered:p.uncovered,
entryMotor:p.entryMotor||null
});
}

state.g1Pending=[];

if(state.g1Rows.length>5000) {
state.g1Rows=
state.g1Rows.slice(-5000);
}
}

function spin(
n,
source="HISTÓRICO"
) {
if(
!Number.isInteger(n)||
n<0||
n>36
) {
throw new Error(
"NÚMERO INVÁLIDO"
);
}

/*
PREVISÕES FORMADAS COM O
HISTÓRICO ANTERIOR AO GIRO.
*/

const before=[...state.history];

const triggerBefore=before.at(-1);

const cs=motors(before);

const defs=definitions();

const turn=before.length+1;

/*
O G1 PENDENTE É RESOLVIDO
COM O NÚMERO ATUAL.
*/

settlePending(n);

if(state.phase==="ENTRY") {
updateTrainer();
}

const phaseBefore=state.phase;

const cycleBefore=copy(
state.cycle
);

let result="AGUARDANDO";
let played=null;

const after=[
...before,
n
];

/* ======================================================
 ENTRADA REAL
====================================================== */

if(state.phase==="ENTRY") {
const motor=activeMotor(cs);

if(motor) {
played=copy(motor);
state.previous=motor.key;

state.cycle={
strategy:activeDefinition().id,
original:copy(motor),
trigger:null,
decision:null,
entryTrigger:triggerBefore
};

if(state.secondHouse) {
state.defense=copy(motor);
state.phase="SECOND_SKIP";
result="2ª CASA";
}

else if(
motor.play.numbers.includes(n)
) {
result="GREEN";
state.cycle=null;
}

else {
result="GALE";
state.cycle.trigger=n;

const strategy=
state.cycle.strategy;

const decision=state.g1Trainer
?chooseG1(
motor,n,after,strategy
)
:{
motor:state.g1
?fineG1(motor,n)
:copy(motor),

mode:state.g1
?"AJUSTE FINO"
:"CONGELADA",

behavior:behaviorReading(
motor,after,strategy,n
).type
};

state.cycle.decision=decision;

state.defense=copy(
decision.motor
);

state.phase=state.galeSkip
?"GALE_SKIP"
:"GALE";

state.decisions.push({
turn,
strategy,
mode:decision.mode,
behavior:decision.behavior,
trigger:n,
numberTests:
decision.numberTotal||0
});
}
}
}

else if(
state.phase==="SECOND_SKIP"
) {
played=copy(
state.defense
);

result="CASA PULADA";
state.phase="SECOND_ENTRY";
}

else if(
state.phase==="SECOND_ENTRY"
) {
played=copy(
state.defense
);

if(
played?.play.numbers.includes(n)
) {
result="GREEN";

state.phase="ENTRY";
state.cycle=null;
state.defense=null;
}

else {
result="GALE";

state.cycle.trigger=n;

const strategy=
state.cycle.strategy;

const decision=state.g1Trainer
?chooseG1(
played,n,after,strategy
)
:{
motor:state.g1
?fineG1(played,n)
:copy(played),

mode:state.g1
?"AJUSTE FINO"
:"CONGELADA",

behavior:behaviorReading(
played,after,strategy,n
).type
};

state.cycle.decision=decision;

state.defense=copy(
decision.motor
);

state.phase=state.galeSkip
?"GALE_SKIP"
:"GALE";

state.decisions.push({
turn,
strategy,
mode:decision.mode,
behavior:decision.behavior,
trigger:n,
numberTests:
decision.numberTotal||0
});
}
}

else if(
state.phase==="GALE_SKIP"
) {
played=copy(
state.defense
);

result="GALE PULADO";
state.phase="GALE";
}

else if(
state.phase==="GALE"
) {
played=copy(
state.defense
);

result=
played?.play.numbers.includes(n)
?"GREEN G1"
:"LOSS";

state.realG1.push({
turn,
strategy:
state.cycle?.strategy,

mode:
state.cycle?.decision?.mode,

behavior:
state.cycle?.decision?.behavior,

trigger:
state.cycle?.trigger,

outcome:n,
result
});

state.phase="ENTRY";
state.cycle=null;
state.defense=null;
}

/* ======================================================
 TREINAMENTO VIRTUAL ORIGINAL
====================================================== */

const pending=[];

for(const def of defs) {
const v=virtualCycle(def.id);

let motor=null;

let virtualResult="AGUARDANDO";

let closed=false;

/*
ENTRADA VIRTUAL:
O RESULTADO N AINDA NÃO
FOI USADO NA ESCOLHA.
*/

if(v.phase==="ENTRY") {
motor=chooseMotor(
def,cs,v.previous
);

if(!motor)continue;

motor=copy(motor);
v.previous=motor.key;

if(
motor.play.numbers.includes(n)
) {
virtualResult="GREEN";
closed=true;
}

else {
virtualResult="GALE";

v.phase="GALE";
v.entry=copy(motor);
v.trigger=n;

const options=defenses(
motor,n,after,def.id
);

const eventId=
def.id+"@"+turn;

for(const option of options) {
pending.push({
eventId,
strategy:def.id,
mode:option.mode,
behavior:option.behavior,
trigger:n,
entryMotor:motor.key,
numbers:[
...option.motor.play.numbers
],
uncovered:missing(
option.motor.play
)
});
}

const decision=chooseG1(
motor,n,after,def.id
);

v.defense=
decision?.motor||
fineG1(motor,n)||
copy(motor);
}
}

else {
motor=copy(
v.defense
);

virtualResult=
motor?.play.numbers.includes(n)
?"GREEN G1"
:"LOSS";

closed=true;

v.phase="ENTRY";
v.defense=null;
v.entry=null;
v.trigger=null;
}

/*
NOVO:
REGISTRA QUAL NÚMERO
ANTERIOR GEROU A ENTRADA.
*/

state.entryRows.push({
turn,
strategy:def.id,
trigger:
v.phase==="ENTRY"&&
virtualResult!=="GREEN"
?v.trigger
:triggerBefore,

motor:motor?.key||null,
result:virtualResult,
closed,
profit:profit(
virtualResult
)
});
}

state.g1Pending=pending;

/* ======================================================
 APRENDIZADO POR NÚMERO
====================================================== */

/*
TREINA TODAS AS COMBINAÇÕES
DO NÚMERO ANTERIOR COM O
RESULTADO QUE ACABOU DE SAIR.
*/

trainNumberMotors(
before,n,cs,turn
);

/* ======================================================
 REGISTRO DOS 12 MOTORES
====================================================== */

const motorHits={};

for(const m of cs) {
motorHits[m.key]=
m.play.numbers.includes(n);
}

state.ledger.push({
turn,
number:n,
source,

trigger:triggerBefore,

strategy:
cycleBefore?.strategy||
activeDefinition().id,

motor:
played?.key||"—",

phase:phaseBefore,
result,
profit:profit(result),

play:
played?.play||null,

motorHits
});

state.history.push(n);
state.sources.push(source);

if(state.entryRows.length>4000) {
state.entryRows=
state.entryRows.slice(-4000);
}

if(state.ledger.length>300) {
state.ledger=
state.ledger.slice(-300);
}

if(
state.strategy==="TRAINER"&&
!state.manual
) {
state.trainerTurns++;

if(
state.phase!=="ENTRY"&&
state.trainerTurns>=3
) {
state.trainerPending=true;
}
}
}

/* ======================================================
 REPROCESSAMENTO COMPLETO 90 + 10
====================================================== */

function waitFrame() {
return new Promise(resolve=>
requestAnimationFrame(
()=>resolve()
)
);
}

function setBusy(
value,
message=""
) {
busy=value;

const overlay=$("overlay");

if(overlay) {
overlay.classList.toggle(
"show",value
);
}

if($("overlayMessage")) {
$("overlayMessage").textContent=
message;
}

for(const b of document.querySelectorAll(
".key,#import,#undo,#clear,#restore"
)) {
b.disabled=value;
}
}

async function rebuild90(
numbers,
{
preserveManual=false,
incrementCycle=false
}={}
) {
if(busy)return;

const previous=state;

const clean=cleanNumbers(
numbers
).slice(-WINDOW);

const opts=settings();

const manualLog=preserveManual
?copy(state.manualLog)
:[];

const cycles=preserveManual
?state.cyclesCompleted+
(incrementCycle?1:0)
:0;

setBusy(
true,
"RECALCULANDO TODOS OS MOTORES E TREINADORES"
);

await waitFrame();

try {
state={
...fresh(),
...opts,

history:[],
sources:[],

manualLog,
manualCount:0,
cyclesCompleted:cycles
};

for(let i=0;i<clean.length;i++) {
spin(
clean[i],
"HISTÓRICO"
);

if(
i%5===4||
i===clean.length-1
) {
const message=
"RECALCULANDO ANÁLISES: "+
(i+1)+"/"+clean.length+
" NÚMEROS";

$("overlayMessage").textContent=
message;

$("status").textContent=
message;

await new Promise(resolve=>
setTimeout(resolve,0)
);
}
}

save();

} catch(e) {
state=previous;
save();

alert(
"ERRO NO RECÁLCULO: "+
String(e.message||e)
);
}

finally {
setBusy(false);
render();
}
}

/*
REINICIADOS NO RECÁLCULO:

- 12 MOTORES
- TREINADOR GLOBAL
- TREINADOR GLOBAL NÚMERO
- TREINADOR GLOBAL G1
- G1 POR NÚMERO
- CONTINUIDADE
- DESLOCAMENTO
- RUPTURA
- ENTRADAS VIRTUAIS
- GALES VIRTUAIS
- RANKINGS
- ESTATÍSTICAS
- DECISÕES
- LINHA DO TEMPO DA JANELA

PRESERVADOS:
- CONFIGURAÇÕES
- REGISTROS MANUAIS ARQUIVADOS
- CONTAGEM DE RECÁLCULOS
*/

async function addManual(n) {
if(busy)return;

if(state.history.length<8) {
alert(
"IMPORTE UM HISTÓRICO PRIMEIRO."
);
return;
}

try {
spin(n,"TEMPO REAL");

const row=state.ledger.at(-1);

state.manualLog.push({
id:
Date.now()+"_"+
state.manualLog.length,

number:n,
result:row.result,
profit:row.profit,

strategy:row.strategy,
motor:row.motor,
phase:row.phase,

timestamp:Date.now()
});

state.manualCount++;

save();
render();

if(
state.manualCount>=MANUAL_LIMIT
) {
const last90=
state.history.slice(-WINDOW);

await rebuild90(
last90,
{
preserveManual:true,
incrementCycle:true
}
);
}

} catch(e) {
alert(
"ERRO AO INSERIR NÚMERO: "+
String(e.message||e)
);
}
}

/* ======================================================
 IMPORTAR / APAGAR / ZERAR
====================================================== */

function parseInput(text) {
return (
String(text).match(/\d+/g)||[]
).map(Number).filter(n=>
Number.isInteger(n)&&
n>=0&&
n<=36
);
}

async function importHistory(numbers) {
if(busy)return;

const clean=cleanNumbers(
numbers
);

if(!clean.length) {
alert(
"INFORME NÚMEROS DE 0 A 36."
);
return;
}

if(!confirm(
"IMPORTAR "+clean.length+
" NÚMEROS?\n\n"+
"O SISTEMA USARÁ OS ÚLTIMOS "+
Math.min(WINDOW,clean.length)+
" E APAGARÁ OS REGISTROS MANUAIS ANTERIORES."
))return;

$("paste").value="";

await rebuild90(
clean,
{
preserveManual:false
}
);
}

async function undo() {
if(busy)return;

if(state.manualCount<=0) {
alert(
"NÃO EXISTE LANÇAMENTO MANUAL "+
"NESTE CICLO PARA APAGAR."
);
return;
}

const previous=state;

const numbers=
state.history.slice(0,-1);

const sources=
state.sources.slice(0,-1);

const manualLog=
state.manualLog.slice(0,-1);

const manualCount=
state.manualCount-1;

const cycles=
state.cyclesCompleted;

const opts=settings();

setBusy(
true,
"REFAZENDO ANÁLISES"
);

await waitFrame();

try {
state={
...fresh(),
...opts,
manualLog,
manualCount,
cyclesCompleted:cycles
};

for(let i=0;i<numbers.length;i++) {
spin(
numbers[i],
sources[i]||"HISTÓRICO"
);

if(i%8===7) {
$("overlayMessage").textContent=
"REPROCESSANDO "+
(i+1)+"/"+numbers.length;

await new Promise(r=>
setTimeout(r,0)
);
}
}

save();

} catch(e) {
state=previous;

alert(
String(e.message||e)
);
}

finally {
setBusy(false);
render();
}
}

function clearAll() {
if(busy)return;

if(!confirm(
"ZERAR TUDO?\n\n"+
"ISSO APAGARÁ HISTÓRICO, TREINAMENTO, "+
"GREEN, GREEN G1 E LOSS MANUAIS."
))return;

state=fresh();
save();
render();
}

/* ======================================================
 COMPONENTES DA INTERFACE
====================================================== */

function button(
label,
action,
parent,
extra=""
) {
const b=document.createElement(
"button"
);

b.className="btn "+extra;
b.textContent=label;
b.onclick=action;

parent.appendChild(b);

return b;
}

function sortedBlocks(play) {
return validPlay(play)
?[...play.blocks].sort(
(a,b)=>
Object.keys(REGIONS).indexOf(
region(a.center)
)-
Object.keys(REGIONS).indexOf(
region(b.center)
)
)
:[];
}

function centersHTML(play) {
return sortedBlocks(play).map(b=>`
<div class="center ${
b.radius===1?"short":""
}">
<strong>${b.center}</strong>

<small>
${region(b.center)}
</small>

<small>
${b.radius}
${b.radius===1
?"VIZINHO"
:"VIZINHOS"}
</small>
</div>
`).join("");
}

function cloud(
numbers,
highlight=[]
) {
const marked=new Set(
highlight
);

return `
<div class="cloud">
${numbers.map(n=>`
<span class="${
marked.has(n)?"danger":""
}">
${n}
</span>
`).join("")}
</div>
`;
}

function metrics(rows) {
const closed=rows.filter(r=>
[
"GREEN",
"GREEN G1",
"LOSS"
].includes(r.result)
);

const green=closed.filter(
r=>r.result==="GREEN"
).length;

const g1=closed.filter(
r=>r.result==="GREEN G1"
).length;

const loss=closed.filter(
r=>r.result==="LOSS"
).length;

const net=closed.reduce(
(s,r)=>s+(r.profit||0),
0
);

return {
total:closed.length,
green,
g1,
loss,
net
};
}

function metricsHTML(rows) {
const m=metrics(rows);

return `
<div class="metrics">
${[
["CICLOS",m.total],
["GREEN",m.green],
["GREEN G1",m.g1],
["LOSS",m.loss],
[
"ACERTOS",
pct(m.green+m.g1,m.total)
],
["LÍQUIDO",fmt(m.net)]
].map(([label,value])=>`
<div class="metric">
<small>${label}</small>
<b>${value}</b>
</div>
`).join("")}
</div>
`;
}

function breakdown(
strategy=null,
mode="CONGELADA"
) {
const rows=g1History(
strategy,mode,500
);

const out={
CONTINUIDADE:{
total:0,hits:0
},
DESLOCAMENTO:{
total:0,hits:0
},
RUPTURA:{
total:0,hits:0
}
};

for(const r of rows) {
const item=out[r.behavior];

if(!item)continue;

item.total++;

if(r.hit)item.hits++;
}

return out;
}

function breakdownHTML(
strategy=null
) {
const b=breakdown(
strategy
);

return `
<div class="tablewrap">
<table>
<thead>
<tr>
<th>COMPORTAMENTO</th>
<th>OCORRÊNCIAS</th>
<th>GREEN G1</th>
<th>LOSS</th>
<th>ACERTO</th>
</tr>
</thead>
<tbody>
${Object.entries(b).map(
([name,x])=>`
<tr>
<td>${name}</td>
<td>${x.total}</td>
<td class="good">
${x.hits}
</td>
<td class="bad">
${x.total-x.hits}
</td>
<td>
${pct(x.hits,x.total)}
</td>
</tr>
`
).join("")}
</tbody>
</table>
</div>
`;
}

/* ======================================================
 RANKING G1 ORIGINAL
====================================================== */

function g1RankingHTML() {
const ranked=definitions().map(def=>{
const modes=G1_MODES.map(mode=>({
mode,
...defenseMetrics(
def.id,mode,300
)
}));

const best=[...modes].sort(
(a,b)=>{
const base=28/37;

const sa=
(a.hits+base*12)/
(a.total+12);

const sb=
(b.hits+base*12)/
(b.total+12);

return sb-sa;
}
)[0];

return {
...def,
modes,
best
};
}).sort((a,b)=>{
const base=28/37;

const sa=
(a.best.hits+base*12)/
(a.best.total+12);

const sb=
(b.best.hits+base*12)/
(b.best.total+12);

return sb-sa;
});

return `
<div class="box">
<b>RANKING EXCLUSIVO DE G1</b>

<p>
APENAS ENTRADAS QUE CHEGARAM
AO GALE.
</p>

<p>
AS TRÊS DEFESAS SÃO TESTADAS
NO MESMO RESULTADO.
</p>

<p>
CADA GALE É CONTADO UMA VEZ
NO TOTAL DE EVENTOS.
</p>
</div>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>#</th>
<th>ESTRATÉGIA</th>
<th>GALES</th>
<th>MELHOR DEFESA</th>
<th>GREEN G1</th>
<th>LOSS</th>
<th>ACERTO</th>
</tr>
</thead>
<tbody>
${ranked.map((r,i)=>`
<tr>
<td>${i+1}</td>
<td>${esc(r.name)}</td>
<td>
${uniqueGales(r.id,500).length}
</td>
<td>
${esc(r.best.mode)}
</td>
<td class="good">
${r.best.hits}
</td>
<td class="bad">
${r.best.loss}
</td>
<td>
${pct(
r.best.hits,
r.best.total
)}
</td>
</tr>
`).join("")}
</tbody>
</table>
</div>

<div class="title">
CONTINUIDADE /
DESLOCAMENTO /
RUPTURA
</div>

${breakdownHTML()}

<div class="title">
COMPARAÇÃO DAS TRÊS DEFESAS
</div>

${ranked.map(r=>`
<div class="box">
<b>${esc(r.name)}</b>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>DEFESA</th>
<th>GALES</th>
<th>GREEN G1</th>
<th>LOSS</th>
<th>ACERTO</th>
</tr>
</thead>
<tbody>
${r.modes.map(m=>`
<tr>
<td>${esc(m.mode)}</td>
<td>${m.total}</td>
<td class="good">
${m.hits}
</td>
<td class="bad">
${m.loss}
</td>
<td>
${pct(m.hits,m.total)}
</td>
</tr>
`).join("")}
</tbody>
</table>
</div>
</div>
`).join("")}
`;
}

/* ======================================================
 NOVO: PAINEL TREINADOR GLOBAL NÚMERO
====================================================== */

function numberTrainerHTML() {
const h=state.history;

if(h.length<8) {
return `
<div class="box">
AGUARDANDO HISTÓRICO.
</div>
`;
}

const trigger=h.at(-1);

const cs=motors(h);

const ranked=rankNumberMotors(
h,cs
);

const pairs=numberTransitions(
h,trigger
);

const selected=activeMotor(cs);

const strategyRanking=trainerRanking(
trigger
);

return `
<div class="box">
<b>TREINADOR GLOBAL NÚMERO</b>

<p>
STATUS:
<strong class="${
state.numberTrainer
?"good":"bad"
}">
${state.numberTrainer
?"ATIVADO"
:"DESATIVADO"}
</strong>
</p>

<p>
NÚMERO GATILHO:
<strong>${trigger}</strong>
</p>

<p>
OCORRÊNCIAS ANTERIORES
DO NÚMERO COM RESULTADO
SEGUINTE:
${pairs.length}
</p>

<p>
COMBINAÇÕES ANALISADAS:
${ranked.length}
</p>

<p>
MOTOR ATUAL:
${esc(
selected?.key||"—"
)}
</p>

<p>
MELHOR COMBINAÇÃO POR NÚMERO:
${esc(
ranked[0]?.name||
ranked[0]?.key||
"—"
)}
</p>

<p>
TROCAS CONDICIONADAS:
${state.numberChanges}
</p>
</div>

<div class="title">
RANKING DOS 6 CENTRAIS
PARA O NÚMERO ${trigger}
</div>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>#</th>
<th>COMBINAÇÃO</th>
<th>TESTES</th>
<th>GREEN</th>
<th>ERROS</th>
<th>ACERTO</th>
<th>ÍNDICE</th>
</tr>
</thead>
<tbody>
${ranked.map((r,i)=>`
<tr>
<td>${i+1}</td>
<td>
${esc(r.name||r.key)}
</td>
<td>
${r.numberStats.total}
</td>
<td class="good">
${r.numberStats.hits}
</td>
<td class="bad">
${r.numberStats.loss}
</td>
<td>
${pct(
r.numberStats.hits,
r.numberStats.total
)}
</td>
<td>
${pct(r.numberScore,1)}
</td>
</tr>
`).join("")}
</tbody>
</table>
</div>

<div class="title">
6 CENTRAIS DA MELHOR COMBINAÇÃO
</div>

<div class="centers">
${centersHTML(
ranked[0]?.play
)}
</div>

<div class="title">
9 DESCOBERTOS
</div>

${cloud(
missing(ranked[0]?.play)
)}

<div class="title">
RANKING DAS ESTRATÉGIAS
PARA O NÚMERO ${trigger}
</div>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>#</th>
<th>ESTRATÉGIA</th>
<th>TESTES</th>
<th>ACERTOS</th>
<th>LOSS</th>
<th>ÍNDICE</th>
</tr>
</thead>
<tbody>
${strategyRanking.map((r,i)=>`
<tr>
<td>${i+1}</td>
<td>${esc(r.name)}</td>
<td>${r.numberTotal}</td>
<td>${r.numberHits}</td>
<td>${r.numberLoss}</td>
<td>${pct(r.score,1)}</td>
</tr>
`).join("")}
</tbody>
</table>
</div>

<div class="title">
NÚMEROS QUE SAÍRAM
DEPOIS DO ${trigger}
</div>

${cloud(
pairs.map(x=>x.next).slice(-25)
)}

<div class="muted">
A COMPARAÇÃO UTILIZA APENAS
TESTES CRONOLÓGICOS ANTERIORES.
QUANDO A AMOSTRA É PEQUENA,
O ÍNDICE É SUAVIZADO.
</div>
`;
}

/* ======================================================
 TREINADOR GLOBAL ORIGINAL + NÚMERO
====================================================== */

function trainerHTML() {
const trigger=
state.history.at(-1);

const ranked=trainerRanking(
state.numberTrainer
?trigger:null
);

const active=ranked.find(
r=>r.id===state.trainerChoice
);

const real=
state.realG1.length;

const hits=
state.realG1.filter(
r=>r.result==="GREEN G1"
).length;

const virtualGales=
uniqueGales(null,5000);

return `
<div class="box">
<b>TREINADOR GLOBAL</b>

<p>
ESTRATÉGIAS:
${ranked.length}
</p>

<p>
ATIVA:
${esc(
active?.name||"AGUARDANDO"
)}
</p>

<p>
NÚMERO ANALISADO:
${trigger??"—"}
</p>

<p>
TREINADOR POR NÚMERO:
<strong class="${
state.numberTrainer
?"good":"bad"
}">
${state.numberTrainer
?"ATIVADO":"DESATIVADO"}
</strong>
</p>

<p>
GIROS DESDE A TROCA:
${state.trainerTurns}
</p>

<p>
TROCAS:
${state.trainerChanges}
</p>

<p>
${state.trainerPending
?"TROCA PENDENTE — FECHAR GALE"
:"AVALIAÇÃO A CADA GIRO"}
</p>
</div>

<div class="box">
<b>TREINADOR GLOBAL G1</b>

<p>
STATUS:
<strong class="${
state.g1Trainer
?"good":"bad"
}">
${state.g1Trainer
?"ATIVADO":"DESATIVADO"}
</strong>
</p>

<p>
ANÁLISE POR NÚMERO:
${state.g1Trainer
?"ATIVA"
:"DESLIGADA"}
</p>

<p>
GALES REAIS NA JANELA:
${real}
</p>

<p>
GREEN G1:
${hits}
</p>

<p>
LOSS:
${real-hits}
</p>

<p>
APROVEITAMENTO:
${pct(hits,real)}
</p>

<p>
GALES VIRTUAIS:
${virtualGales.length}
</p>

<p>
RUPTURAS:
${breakdown().RUPTURA.total}
</p>
</div>

<div class="title">
RANKING DAS ESTRATÉGIAS
</div>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>#</th>
<th>ESTRATÉGIA</th>
<th>CICLOS</th>
<th>ACERTOS</th>
<th>LOSS</th>
<th>TESTES Nº</th>
<th>ÍNDICE</th>
</tr>
</thead>
<tbody>
${ranked.map((r,i)=>`
<tr>
<td>${i+1}</td>
<td>${esc(r.name)}</td>
<td>${r.total}</td>
<td>${r.hits}</td>
<td>${r.loss}</td>
<td>${r.numberTotal}</td>
<td>${pct(r.score,1)}</td>
</tr>
`).join("")}
</tbody>
</table>
</div>

<div class="title">
ÚLTIMAS TROCAS
</div>

${state.trainerHistory
.slice(-12)
.reverse()
.map(x=>`
<div class="listrow">
GIRO ${x.turn}
•
NÚMERO ${x.trigger??"—"}
•
${esc(x.from)}
→
${esc(x.to)}
</div>
`).join("")}
`;
}

/* ======================================================
 G1 POR NÚMERO E DESCOBERTOS
====================================================== */

function g1NumbersHTML() {
const cs=motors(
state.history
);

const original=
state.cycle?.original||
activeMotor(cs);

if(!validPlay(original?.play)) {
return `
<div class="box">
AGUARDANDO HISTÓRICO.
</div>
`;
}

const strategy=
state.cycle?.strategy||
activeDefinition().id;

const trigger=
state.cycle?.trigger??
state.history.at(-1);

if(trigger==null)return "";

const reading=behaviorReading(
original,
state.history,
strategy,
trigger
);

const options=defenses(
original,
trigger,
state.history,
strategy
);

const decision=
state.cycle?.decision||
chooseG1(
original,
trigger,
state.history,
strategy
);

const numberGales=
numberG1Events(
strategy,trigger,100
);

return `
<div class="box">
<b>TREINADOR GLOBAL G1
POR NÚMERO</b>

<p>
STATUS:
<strong class="${
state.g1Trainer
?"good":"bad"
}">
${state.g1Trainer
?"ATIVO":"DESLIGADO"}
</strong>
</p>

<p>
ESTRATÉGIA:
${esc(strategy)}
</p>

<p>
MOTOR:
${esc(original.key)}
</p>

<p>
NÚMERO GATILHO:
<strong>${trigger}</strong>
</p>

<p>
COMPORTAMENTO:
<strong>
${reading.type}
</strong>
</p>

<p>
GALES VIRTUAIS DESTE NÚMERO:
${numberGales.length}
</p>

<p>
GREEN G1 DO NÚMERO:
${reading.numberHit}
</p>

<p>
LOSS DO NÚMERO:
${reading.numberLoss}
</p>

<p>
LOSS ÚLTIMOS 12 GALES:
${reading.loss12}/
${reading.total12}
</p>

<p>
LOSS ÚLTIMOS 6 GALES:
${reading.loss6}/
${reading.total6}
</p>

<p>
RESULTADOS FORA DA COBERTURA,
ÚLTIMOS 6:
${reading.outside6}
</p>

<p>
SEQUÊNCIA DE LOSS:
${reading.streak}
</p>

<p>
DEFESA ESCOLHIDA:
<strong>
${esc(decision?.mode||"—")}
</strong>
</p>
</div>

<div class="title">
COMPARAÇÃO DAS DEFESAS
PARA O NÚMERO ${trigger}
</div>

<div class="tablewrap">
<table>
<thead>
<tr>
<th>DEFESA</th>
<th>TESTES Nº</th>
<th>GREEN G1</th>
<th>LOSS</th>
<th>ACERTO</th>
</tr>
</thead>
<tbody>
${G1_MODES.map(mode=>{
const m=numberG1Metrics(
strategy,
trigger,
mode,
100
);

return `
<tr>
<td>${esc(mode)}</td>
<td>${m.total}</td>
<td class="good">
${m.hits}
</td>
<td class="bad">
${m.loss}
</td>
<td>
${pct(m.hits,m.total)}
</td>
</tr>
`;
}).join("")}
</tbody>
</table>
</div>

<div class="title">
9 DESCOBERTOS DA ENTRADA
</div>

${cloud(
missing(original.play)
)}

${options.map(option=>{
const m=defenseMetrics(
strategy,
option.mode,
100
);

const nm=numberG1Metrics(
strategy,
trigger,
option.mode,
100
);

return `
<div class="g1card ${
decision?.mode===option.mode
?"selected":""
}">
<b>
${esc(option.mode)}
</b>

<div class="centers">
${centersHTML(
option.motor.play
)}
</div>

<div class="muted">
28 COBERTOS •
9 DESCOBERTOS
</div>

${cloud(
missing(option.motor.play)
)}

<div class="muted">
GLOBAL:
GALES ${m.total}
•
GREEN G1 ${m.hits}
•
LOSS ${m.loss}
•
ACERTO ${pct(m.hits,m.total)}
</div>

<div class="muted">
NÚMERO ${trigger}:
GALES ${nm.total}
•
GREEN G1 ${nm.hits}
•
LOSS ${nm.loss}
•
ACERTO ${pct(nm.hits,nm.total)}
</div>
</div>
`;
}).join("")}

<div class="title">
CONTINUIDADE /
DESLOCAMENTO /
RUPTURA
</div>

${breakdownHTML(strategy)}

<div class="title">
ÚLTIMOS GALES REAIS
DA JANELA
</div>

${state.realG1.slice(-12)
.reverse().map(r=>`
<div class="listrow">
GIRO ${r.turn}
•
NÚMERO ${r.trigger}
•
${esc(r.mode)}
•
<b>${esc(r.result)}</b>
•
${esc(r.behavior)}
</div>
`).join("")}
`;
}

/* ======================================================
 SALTOS E DIREÇÃO
====================================================== */

function jumpsHTML() {
const a=analyze(
state.history
);

return `
<div class="box">
<b>SALTOS E DIREÇÃO</b>

<p>
NUMÉRICO:
${a.numericStreak.dir>0
?"CRESCENTE":
a.numericStreak.dir<0
?"DECRESCENTE"
:"MISTO"}
•
${a.numericStreak.length}
PASSOS
</p>

<p>
FÍSICO:
${a.physicalStreak.dir>0
?"HORÁRIO":
a.physicalStreak.dir<0
?"ANTI-HORÁRIO"
:"MISTO"}
•
${a.physicalStreak.length}
PASSOS
</p>

<p>
MÉDIA ÚLTIMOS 3:
${fmt(a.mean3)}
</p>

<p>
MÉDIA ANTERIOR:
${fmt(a.previous3)}
</p>

<p>
VARIAÇÃO:
${fmt(a.acceleration)}
</p>
</div>

<div class="title">
AUSÊNCIA POR REGIÃO
</div>

${Object.entries(a.regions)
.map(([name,x])=>`
<div class="listrow">
${name}
•
AUSÊNCIA: ${x.absence}
•
ÚLTIMOS 12: ${x.recent}
</div>
`).join("")}

<div class="title">
ÚLTIMAS TRANSIÇÕES
</div>

${a.transitions.slice(-12)
.reverse().map(x=>`
<div class="listrow">
${x.from} → ${x.to}
•
${x.distance} CASAS
•
${x.physical>0
?"HORÁRIO":
x.physical<0
?"ANTI-HORÁRIO"
:"PARADO"}
</div>
`).join("")}
`;
}

/* ======================================================
 ESPELHO / ANTIESPELHO
====================================================== */

function mirrorsHTML() {
const recent=
state.history.slice(-20);

const last=
state.history.at(-1);

const near=last==null
?[]
:W.filter(
n=>
MIRROR.has(n)&&
distance(last,n)<=4
);

const far=last==null
?[]
:W.filter(
n=>
MIRROR.has(n)&&
distance(last,n)>=10
);

return `
<div class="box">
<b>ESPELHO / ANTIESPELHO</b>

<p>
ESPELHO ÚLTIMOS 20:
${recent.filter(
n=>MIRROR.has(n)
).length}
</p>

<p>
ANTIESPELHO ÚLTIMOS 20:
${recent.filter(
n=>!MIRROR.has(n)
).length}
</p>
</div>

<div class="title">
ESPELHOS PRÓXIMOS
</div>

${cloud(near)}

<div class="title">
ESPELHOS DISTANTES
</div>

${cloud(far)}

<div class="title">
TODOS OS ESPELHOS
</div>

${cloud(
W.filter(n=>MIRROR.has(n))
)}

<div class="title">
ANTIESPELHOS
</div>

${cloud(
W.filter(n=>!MIRROR.has(n))
)}
`;
}

/* ======================================================
 LINHA DO TEMPO
====================================================== */

function timelineHTML() {
return state.ledger.slice(-60)
.reverse().map(r=>`
<div class="listrow">
<b>GIRO ${r.turn}</b>
•
${r.number}
•
${esc(r.result)}

<div class="muted">
GATILHO ${r.trigger??"—"}
•
${esc(r.strategy)}
•
${esc(r.motor)}
•
${region(r.number)}
•
${mirror(r.number)}
</div>
</div>
`).join("");
}

/* ======================================================
 CSS ORIGINAL + BOTÕES ACESOS
====================================================== */

const css=`
*{
box-sizing:border-box
}

body{
margin:0;
background:#101720;
color:#f4f7fb;
font-family:Arial,sans-serif;
font-size:13px
}

.app{
max-width:1100px;
margin:auto;
padding:12px
}

h1{
font-size:24px;
text-align:center;
color:#59e5ff;
margin:15px 0 5px
}

.sub{
text-align:center;
font-size:11px;
color:#b3c7d9;
line-height:1.7;
margin-bottom:15px
}

.panel{
background:#1d2938;
border:1px solid #405a73;
border-radius:11px;
padding:12px;
margin:10px 0
}

.title{
color:#47e1f8;
font-size:12px;
font-weight:bold;
margin:13px 0
}

.row{
display:flex;
flex-wrap:wrap;
gap:6px;
margin:9px 0
}

.btn{
background:#304359;
border:1px solid #708aa6;
border-radius:7px;
color:white;
padding:10px;
font-size:11px;
font-weight:bold;
cursor:pointer
}

.btn.active{
background:#087e9c;
border-color:#4eeaff
}

.btn.trainer{
background:#263f4c;
border-color:#4d8191
}

.btn.trainer.active,
.btn.trainer.on{
background:#086c4d;
border:2px solid #42ffb0;
color:white;
box-shadow:
0 0 13px #27e99a77,
inset 0 0 8px #27e99a33
}

.btn:disabled,
.key:disabled{
opacity:.35;
cursor:not-allowed
}

textarea{
width:100%;
height:88px;
padding:10px;
border-radius:8px;
background:#0c1623;
border:1px solid #62758b;
color:white
}

.status{
font-size:12px;
color:#b5d7e8;
padding:9px 0
}

.progress{
background:#101e2c;
border:1px solid #476581;
border-radius:9px;
padding:12px;
margin:10px 0
}

.progress strong{
font-size:25px;
color:#59e5ff
}

.bar{
height:12px;
background:#34475a;
border-radius:20px;
overflow:hidden;
margin:10px 0
}

.barfill{
height:100%;
background:#31dca9;
transition:width .2s
}

.centers{
display:grid;
grid-template-columns:
repeat(6,minmax(0,1fr));
gap:5px;
margin:12px 0
}

.center{
min-height:86px;
min-width:0;
padding:8px 2px;
border:2px solid #20d7f4;
border-radius:9px;
background:#086c91;
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
gap:5px;
text-align:center
}

.center.short{
background:#d2a62b;
border-color:#ffe28a;
color:#111
}

.center strong{
font-size:clamp(27px,5vw,43px);
line-height:1;
font-weight:900
}

.center small{
font-size:9px;
font-weight:bold
}

.keys{
display:grid;
grid-template-columns:
repeat(6,1fr);
gap:5px
}

.key{
height:44px;
border:1px solid #71849b;
border-radius:7px;
color:white;
font-size:16px;
font-weight:bold;
cursor:pointer
}

.key.zero{
grid-column:span 6
}

.history{
display:flex;
flex-wrap:wrap;
gap:5px
}

.chip{
min-width:47px;
padding:8px;
border:2px solid #667f99;
border-radius:7px;
text-align:center
}

.chip b{
display:block;
font-size:18px
}

.chip small{
font-size:9px
}

.chip.green{
border:3px solid #29e99a
}

.chip.loss{
border:3px solid #ff416e
}

.chip.gale{
border:3px solid #ffe045
}

.metrics{
display:grid;
grid-template-columns:
repeat(3,1fr);
gap:6px
}

.metric{
background:#293c51;
border-radius:8px;
padding:11px 5px;
text-align:center
}

.metric small{
display:block;
font-size:9px;
color:#bbd0e2
}

.metric b{
display:block;
font-size:22px;
margin-top:5px
}

.good{
color:#4ee4a4
}

.bad{
color:#ff778c
}

.box{
background:#132235;
border:1px solid #46617d;
border-radius:9px;
padding:12px;
margin:9px 0;
line-height:1.7
}

.g1card{
background:#142438;
border:1px solid #55728f;
border-radius:9px;
padding:12px;
margin:9px 0
}

.g1card.selected{
border:2px solid #38e6aa;
background:#10382e
}

.cloud{
display:flex;
flex-wrap:wrap;
gap:5px;
margin:9px 0
}

.cloud span{
display:inline-flex;
min-width:36px;
height:36px;
align-items:center;
justify-content:center;
background:#2b4058;
border:1px solid #64829f;
border-radius:7px;
font-weight:bold
}

.cloud span.danger{
background:#69283e;
border-color:#ff6989
}

.tablewrap{
overflow:auto
}

table{
width:100%;
min-width:610px;
border-collapse:collapse;
font-size:11px
}

td,th{
padding:9px;
text-align:left;
border-bottom:1px solid #41556e
}

th{
color:#57def4
}

.listrow{
border-bottom:1px solid #35485d;
padding:9px 2px;
font-size:11px;
line-height:1.7
}

.muted{
color:#b1c7d9;
font-size:11px;
line-height:1.7
}

.head{
width:100%;
background:#2c4056;
color:white;
border:1px solid #66829f;
border-radius:8px;
padding:12px;
font-weight:bold;
text-align:left;
cursor:pointer;
display:flex;
justify-content:space-between
}

.hide{
display:none
}

input[type=number]{
width:110px;
padding:9px;
background:#101b2a;
color:white;
border:1px solid #637b95;
border-radius:7px
}

#overlay{
display:none;
position:fixed;
inset:0;
background:rgba(5,12,20,.96);
z-index:999999;
align-items:center;
justify-content:center;
padding:20px
}

#overlay.show{
display:flex
}

.overlayBox{
width:min(440px,100%);
background:#1d3143;
border:2px solid #3ce6bc;
border-radius:16px;
padding:30px 20px;
text-align:center;
box-shadow:
0 0 35px #18a57b55
}

.spinner{
width:60px;
height:60px;
margin:20px auto;
border:6px solid #36536b;
border-top-color:#3ce6bc;
border-radius:50%;
animation:spin .8s linear infinite
}

@keyframes spin{
to{
transform:rotate(360deg)
}
}

@media(max-width:600px){
.center{
min-height:79px
}

.center strong{
font-size:clamp(25px,7vw,37px)
}

.center small{
font-size:8px
}

.btn{
font-size:10px;
padding:9px
}
}
`;

/* ======================================================
 ESTRUTURA DA TELA
====================================================== */

document.body.innerHTML=`
<style>${css}</style>

<div id="overlay">
<div class="overlayBox">
<h2>
ANÁLISE BETA V${VERSION}
</h2>

<div class="spinner"></div>

<h2>
RECALCULANDO ANÁLISES
</h2>

<p id="overlayMessage">
PREPARANDO NOVA JANELA
DE 90 NÚMEROS
</p>

<div class="muted">
REINICIANDO OS 12 MOTORES,
TREINADOR GLOBAL,
TREINADOR GLOBAL NÚMERO,
TREINADOR G1 E DEFESAS.
</div>

<div class="muted">
OS REGISTROS MANUAIS
PERMANECEM ARQUIVADOS.
</div>
</div>
</div>

<main class="app">

<h1>
ANÁLISE BETA V${VERSION}
</h1>

<div class="sub">
12 MOTORES •
28 NÚMEROS •
TREINADOR GLOBAL •
G1 INDEPENDENTE
<br>
TREINADOR GLOBAL NÚMERO •
G1 POR NÚMERO
<br>
JANELA AUTOMÁTICA 90 + 10
</div>

<section class="panel">

<div class="title">
IMPORTAR HISTÓRICO
</div>

<textarea
id="paste"
placeholder="Cole os números do mais antigo ao mais recente"
></textarea>

<div class="row">
<button class="btn" id="import">
IMPORTAR
</button>

<button class="btn" id="restore">
RECUPERAR HISTÓRICO
</button>

<button class="btn" id="undo">
APAGAR ÚLTIMO MANUAL
</button>

<button class="btn" id="clear">
ZERAR TUDO
</button>
</div>

<div class="status" id="status"></div>

<div class="progress">
<div class="muted">
LANÇAMENTOS MANUAIS DO CICLO
</div>

<strong id="counter">
0 / 10
</strong>

<div class="bar">
<div
class="barfill"
id="barfill"
></div>
</div>

<div
class="muted"
id="windowInfo"
></div>
</div>

</section>

<section class="panel">

<div class="title">
ESTRATÉGIA ATIVA
</div>

<div id="strategies"></div>

<div class="row" id="options"></div>

<div class="muted" id="selected"></div>

<div class="centers" id="centers"></div>

<div class="muted" id="coverage"></div>

</section>

<section class="panel">

<div class="title">
TECLADO 0–36
</div>

<div class="keys" id="keys"></div>

</section>

<section class="panel">

<div class="title">
ÚLTIMOS 14 NÚMEROS
</div>

<div class="history" id="last"></div>

</section>

${[
["general","RESULTADO GERAL"],
["trainer","TREINADOR GLOBAL"],
[
"numbertrainer",
"TREINADOR GLOBAL NÚMERO"
],
[
"g1ranking",
"RANKING EXCLUSIVO G1 / RUPTURA"
],
[
"g1numbers",
"TREINADOR GLOBAL G1 POR NÚMERO / DEFESAS"
],
["motors","12 MOTORES"],
["jumps","SALTOS E DIREÇÃO"],
[
"mirrors",
"ESPELHO / ANTIESPELHO"
],
["timeline","LINHA DO TEMPO"],
["lab","LABORATÓRIO"]
].map(([id,title])=>`
<section class="panel">

<button
class="head"
data-panel="${id}"
>
${title}
<span>−</span>
</button>

<div id="${id}"></div>

</section>
`).join("")}

<section class="panel">

<div class="title">
FICHAS
</div>

<div class="row">

<label>
VALOR DA FICHA
<input
id="stake"
type="number"
min=".01"
step=".01"
>
</label>

<label>
MULTIPLICADOR G1
<input
id="multiplier"
type="number"
min=".01"
step=".01"
>
</label>

</div>

</section>

<div class="box">
A CADA 10 LANÇAMENTOS MANUAIS,
O SISTEMA RECOMEÇA O TREINAMENTO
COM OS ÚLTIMOS 90 NÚMEROS.

OS REGISTROS MANUAIS ANTERIORES
FICAM ARQUIVADOS, SEM INFLUENCIAR
A NOVA ANÁLISE.
</div>

</main>
`;

/* ======================================================
 BOTÕES
====================================================== */

function changeStrategy(
strategy,
adaptive=null,
created=null
) {
if(busy)return;

state.strategy=strategy;

state.adaptive=
adaptive||state.adaptive;

state.activeCreated=created;
state.manual=null;

if(strategy==="TRAINER") {
state.trainerChoice=null;
state.trainerTurns=0;
state.trainerPending=false;

updateTrainer();
}

save();
render();
}

function buildStrategies() {
const root=$("strategies");
root.innerHTML="";

const groups=[
[
"TREINADORES",
[
{
label:"TREINADOR GLOBAL",
id:"TRAINER",
action:()=>changeStrategy(
"TRAINER"
)
}
]
],

[
"ORIGINAIS",
ORIGINALS.map(([id,name])=>({
label:name,
id,
action:()=>changeStrategy(id)
}))
],

[
"12 ADAPTATIVAS",
ADAPTATIVES.map(c=>({
label:c.name,
id:c.id,
action:()=>changeStrategy(
"ADAPTIVE",c.id
)
}))
]
];

for(const [label,items] of groups) {
const group=document.createElement(
"div"
);

group.innerHTML=`
<div class="title">
${label}
</div>
`;

const row=document.createElement(
"div"
);

row.className="row";

for(const item of items) {
const b=button(
item.label,
item.action,
row,
item.id==="TRAINER"
?"trainer":""
);

b.dataset.choice=item.id;
}

group.appendChild(row);
root.appendChild(group);
}

const rankRow=document.createElement(
"div"
);

rankRow.className="row";

for(let i=1;i<=4;i++) {
const b=button(
"AUTO "+i+"º",
()=>{
state.rank=i;
changeStrategy("FIXED");
},
rankRow
);

b.dataset.rank=i;
}

root.appendChild(rankRow);

if(state.created.length) {
const group=document.createElement(
"div"
);

group.innerHTML=`
<div class="title">
ESTRATÉGIAS PERSONALIZADAS
</div>
`;

const row=document.createElement(
"div"
);

row.className="row";

for(const c of state.created) {
const b=button(
c.name,
()=>changeStrategy(
"CREATED",
null,
"CREATED:"+c.id
),
row
);

b.dataset.created=c.id;
}

group.appendChild(row);
root.appendChild(group);
}
}

/*
BOTÕES ACESOS DOS TREINADORES
*/

const OPTIONS=[
[
"numberTrainer",
"TREINADOR GLOBAL NÚMERO"
],
[
"g1Trainer",
"TREINADOR GLOBAL G1"
],
[
"g1",
"G1 AJUSTE FINO"
],
[
"galeSkip",
"GALE 2ª RODADA"
],
[
"secondHouse",
"2ª CASA"
]
];

for(const [field,label] of OPTIONS) {
const b=button(
label,
()=>{
if(busy)return;

state[field]=!state[field];

save();
render();
},
$("options"),
[
"numberTrainer",
"g1Trainer"
].includes(field)
?"trainer":""
);

b.dataset.option=field;
}

for(let n=0;n<=36;n++) {
const b=document.createElement(
"button"
);

b.className=
"key"+(n===0?" zero":"");

b.textContent=n;

b.style.background=
n===0?"#087b50":
RED.has(n)?"#ac293f":
"#12151b";

b.onclick=()=>addManual(n);

$("keys").appendChild(b);
}

$("import").onclick=()=>{
importHistory(
parseInput(
$("paste").value
)
);
};

$("restore").onclick=async()=>{
if(busy)return;

const keys=[
OLD_KEY,
"ANALISE_BETA_V636",
"ANALISE_BETA_V635",
"ANALISE_BETA_V634",
"ANALISE_BETA_V633"
];

let found=null;

for(const key of keys) {
const data=read(key);

if(data?.history?.length) {
found=data;
break;
}
}

if(!found) {
alert(
"NENHUM HISTÓRICO ANTERIOR ENCONTRADO."
);
return;
}

await importHistory(
cleanNumbers(found.history)
);
};

$("undo").onclick=undo;
$("clear").onclick=clearAll;

$("stake").onchange=()=>{
state.stake=Math.max(
.01,
Number($("stake").value)||1
);

save();
render();
};

$("multiplier").onchange=()=>{
state.multiplier=Math.max(
.01,
Number($("multiplier").value)||1
);

save();
render();
};

document.addEventListener(
"click",
e=>{
const b=e.target.closest(
"[data-panel]"
);

if(!b)return;

const id=b.dataset.panel;

state.open[id]=!state.open[id];

save();
render();
}
);

/* ======================================================
 RENDERIZAÇÃO
====================================================== */

function render() {
try {
performRender();
} catch(e) {
console.error(
"ANÁLISE BETA:",e
);

if($("status")) {
$("status").textContent=
"ERRO: "+
String(e.message||e);
}
}
}

function performRender() {
buildStrategies();

const cs=motors(
state.history
);

if(
state.strategy==="TRAINER"&&
!state.trainerChoice&&
state.phase==="ENTRY"
) {
updateTrainer();
}

const def=activeDefinition();

const motor=
state.defense||
activeMotor(cs);

const play=
motor?.play||null;

$("status").textContent=
state.history.length+
" NÚMEROS NA JANELA • "+
cs.length+
"/12 MOTORES • "+
state.phase+
(saveError
?" • FALHA AO SALVAR: "+saveError
:"");

$("counter").textContent=
state.manualCount+
" / "+
MANUAL_LIMIT;

$("barfill").style.width=
(
100*state.manualCount/
MANUAL_LIMIT
)+"%";

$("windowInfo").textContent=
"JANELA BASE: 90 NÚMEROS • "+
"MANUAIS RESTANTES: "+
(
MANUAL_LIMIT-state.manualCount
)+
" • RECÁLCULOS CONCLUÍDOS: "+
state.cyclesCompleted;

for(const b of document.querySelectorAll(
"[data-choice]"
)) {
const choice=b.dataset.choice;

const active=
state.strategy==="TRAINER"
?choice==="TRAINER":
state.strategy==="ADAPTIVE"
?choice===state.adaptive:
choice===state.strategy;

b.classList.toggle(
"active",active
);
}

for(const b of document.querySelectorAll(
"[data-rank]"
)) {
b.classList.toggle(
"active",
state.strategy==="FIXED"&&
state.rank===Number(
b.dataset.rank
)
);
}

for(const b of document.querySelectorAll(
"[data-option]"
)) {
const active=
!!state[b.dataset.option];

b.classList.toggle(
"active",active
);

b.classList.toggle(
"on",active&&
[
"numberTrainer",
"g1Trainer"
].includes(
b.dataset.option
)
);
}

for(const b of document.querySelectorAll(
"[data-created]"
)) {
b.classList.toggle(
"active",
state.strategy==="CREATED"&&
state.activeCreated===
"CREATED:"+b.dataset.created
);
}

$("selected").textContent=
(
state.cycle?.strategy||
def.name
)+
" • MOTOR "+
(
motor?.key||"AGUARDANDO"
)+
" • "+
state.phase+
(
state.cycle?.decision
?" • G1 "+
state.cycle.decision.mode+
" • "+
state.cycle.decision.behavior
:""
)+
(
state.numberTrainer
?" • TREINADOR NÚMERO ATIVO"
:""
);

$("centers").innerHTML=
centersHTML(play);

$("coverage").textContent=play
?"28 COBERTOS • 9 DESCOBERTOS: "+
missing(play).join(" • ")
:"IMPORTE PELO MENOS 8 NÚMEROS.";

const last=
state.history.slice(-14);

const start=
state.history.length-
last.length;

$("last").innerHTML=
last.map((n,i)=>{
const turn=start+i+1;

const row=state.ledger.find(
r=>r.turn===turn
);

const result=
row?.result||"HISTÓRICO";

const cls=result==="LOSS"
?"loss":
result.startsWith("GREEN")
?"green":
result==="GALE"
?"gale":"";

return `
<div class="chip ${cls}"
style="background:${
n===0?"#087b50":
RED.has(n)?"#a72740":
"#14181f"
}">
<b>${n}</b>
<small>
${esc(result)}
</small>
</div>
`;
}).reverse().join("");

/* ======================================================
 RESULTADO GERAL
====================================================== */

if(state.open.general) {
$("general").innerHTML=`
<div class="title">
RESULTADOS DO HISTÓRICO ATUAL
</div>

${metricsHTML(
state.ledger.filter(
r=>r.source==="HISTÓRICO"
)
)}

<div class="title">
RESULTADOS MANUAIS ARQUIVADOS
</div>

${metricsHTML(
state.manualLog
)}

<div class="box">
<b>REGISTROS MANUAIS:</b>
${state.manualLog.length}

<p>
GREEN, GREEN G1 E LOSS
PERMANECEM ARQUIVADOS
APÓS O RECÁLCULO.
</p>

<p>
NÃO SÃO USADOS COMO
TREINAMENTO DA NOVA JANELA.
</p>
</div>

<div class="title">
ÚLTIMOS RESULTADOS MANUAIS
</div>

${state.manualLog.slice(-25)
.reverse().map(r=>`
<div class="listrow">
<b>${r.number}</b>
•
<strong class="${
r.result==="LOSS"
?"bad":"good"
}">
${esc(r.result)}
</strong>
•
${esc(r.motor)}
•
${fmt(r.profit)}
</div>
`).join("")}
`;
}

/* ======================================================
 TREINADORES
====================================================== */

if(state.open.trainer) {
$("trainer").innerHTML=
trainerHTML();
}

if(state.open.numbertrainer) {
$("numbertrainer").innerHTML=
numberTrainerHTML();
}

if(state.open.g1ranking) {
$("g1ranking").innerHTML=
g1RankingHTML();
}

if(state.open.g1numbers) {
$("g1numbers").innerHTML=
g1NumbersHTML();
}

/* ======================================================
 12 MOTORES
====================================================== */

if(state.open.motors) {
const trigger=
state.history.at(-1);

$("motors").innerHTML=`
<div class="row">
${cs.map(c=>`
<button
class="btn"
data-manual="${c.key}"
>
${esc(c.key)}
</button>
`).join("")}
</div>

${cs.map(c=>{
const m=trigger==null
?{total:0,hits:0,loss:0}
:numberMotorMetrics(
trigger,c.key
);

return `
<div class="listrow">
<b>
${c.rank}º
${esc(c.key)}
</b>
•
${fmt(c.score)}

<div class="muted">
CENTROS:
${sortedBlocks(c.play)
.map(b=>b.center)
.join(" • ")}
</div>

<div class="muted">
NÚMERO ${trigger??"—"}
•
TESTES ${m.total}
•
GREEN ${m.hits}
•
ERROS ${m.loss}
•
ACERTO ${pct(m.hits,m.total)}
</div>
</div>
`;
}).join("")}
`;

for(const b of document.querySelectorAll(
"[data-manual]"
)) {
b.classList.toggle(
"active",
state.manual===b.dataset.manual
);

b.onclick=()=>{
if(busy)return;

state.manual=b.dataset.manual;

save();
render();
};
}
}

/* ======================================================
 DEMAIS PAINÉIS ORIGINAIS
====================================================== */

if(state.open.jumps) {
$("jumps").innerHTML=
jumpsHTML();
}

if(state.open.mirrors) {
$("mirrors").innerHTML=
mirrorsHTML();
}

if(state.open.timeline) {
$("timeline").innerHTML=
timelineHTML();
}

if(state.open.lab) {
$("lab").innerHTML=`
<div class="box">
7 ORIGINAIS •
12 ADAPTATIVAS •
4 POSIÇÕES AUTO •
PERSONALIZADAS
</div>

<div class="box">
DEFESAS:
CONGELADA •
AJUSTE FINO •
RECONSTRUÇÃO INDEPENDENTE
</div>

<div class="box">
TREINADOR GLOBAL NÚMERO:
ANÁLISE DOS 6 CENTRAIS
POR GATILHO DE 0 A 36.
</div>

<div class="box">
TREINADOR GLOBAL G1:
ANÁLISE POR NÚMERO,
CONTINUIDADE,
DESLOCAMENTO E RUPTURA.
</div>

<div class="box">
REPROCESSAMENTO:
90 NÚMEROS + 10 MANUAIS
</div>

<button
class="btn trainer"
id="create"
>
CRIAR CÓPIA DA MELHOR ADAPTATIVA
</button>
`;

$("create").onclick=()=>{
if(busy)return;

const best=trainerRanking().find(
r=>r.type==="ADAPTIVE"
);

if(!best)return;

state.created.push({
id:"CUSTOM_"+Date.now(),

name:
"ESTRATÉGIA VIRTUAL "+
(state.created.length+1),

config:copy(
best.config
)
});

save();
render();
};
}

/* ======================================================
 ABRIR / FECHAR PAINÉIS
====================================================== */

for(const [id,open] of Object.entries(
state.open
)) {
const el=$(id);

if(el) {
el.classList.toggle(
"hide",!open
);
}

const b=document.querySelector(
'[data-panel="'+id+'"]'
);

const span=b?.querySelector(
"span"
);

if(span) {
span.textContent=
open?"−":"+";
}
}

$("stake").value=
state.stake;

$("multiplier").value=
state.multiplier;
}

/* ======================================================
 INICIALIZAÇÃO
====================================================== */

render();

/*
SE A PÁGINA FOI FECHADA
DURANTE A CONCLUSÃO DO
DÉCIMO NÚMERO, RETOMA
O RECÁLCULO AUTOMÁTICO.
*/

if(
state.manualCount>=MANUAL_LIMIT
) {
const numbers=
state.history.slice(-WINDOW);

setTimeout(()=>{
rebuild90(
numbers,
{
preserveManual:true,
incrementCycle:true
}
);
},0);
}

})();
