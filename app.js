(function(){
"use strict";

/* ============================================================
   ANALISADOR 0 • 6 • 9
   RAIO X + MOMENTO 14 + CONCENTRAÇÃO FÍSICA DAS DÚZIAS
============================================================ */

const STORAGE_KEY =
"ANALISADOR_069_IDS_CORRESPONDENTES_V1";

const STORAGE_ENGINE =
"ANALISADOR_069_ENGINE_COMPLETO_V10";

const STORAGE_DUPLAS =
"ANALISADOR_069_DUPLAS_VISUAIS_V1";

const MAX_HISTORICO = 35;
const JANELA_MOMENTO = 14;
const MAX_TIMELINE = 300;

const RX_LIST = [4,5,6];
const MAX_REPLICAS = 40;

const PESO_MOMENTO = .34;
const MAX_GIRADA = 2;
const PESO_DUZIA_FISICA = .16;


/* ============================================================
   ROLETA EUROPEIA
============================================================ */

const track = [
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

const vermelhos = new Set([
1,3,5,7,9,12,14,16,18,
19,21,23,25,27,30,32,34,36
]);

const regioes = {
ZERO:new Set([0,32,15,26,3,35,12]),
VOISINS:new Set([19,4,21,2,25,28,7,29,18,22]),
ORPHELINS:new Set([9,31,14,20,1,17,6,34]),
TIERS:new Set([27,13,36,11,30,8,23,10,5,24,16,33])
};


/* ============================================================
   DÚZIAS
============================================================ */

function duzia(numero){

if(numero>=1 && numero<=12) return 1;
if(numero>=13 && numero<=24) return 2;
if(numero>=25 && numero<=36) return 3;

return 0;
}

const MAPA_DUZIA_FISICA = {

1:new Map([
[3,1],[12,1],[7,.95],
[4,.92],[2,.92],
[11,.82],[8,.86],[5,.86],
[6,.40],[1,.36],[9,.36],
[10,.58]
]),

2:new Map([
[15,1],[19,1],[21,.98],
[17,.70],[13,.72],
[23,.96],[24,.94],[16,.94],
[14,.88],[20,.88],
[18,.92]
]),

3:new Map([
[29,1],[30,1],[32,.96],
[25,.94],[27,.88],[28,.92],
[26,.80],[35,.72],[36,.68],[34,.64],
[33,.42],[31,.40]
])

};


/* ============================================================
   IDS
============================================================ */

const BASES = [
0,10,20,30,
6,16,26,36,
9,19,29
];

const TODOS_IDS = [
0,10,20,30,
6,16,26,36,
9,19,29,39
];

const ESPECIAIS = {
25:[39],
17:[9],
2:[9]
};


/* ============================================================
   UTILIDADES
============================================================ */

function limitar35(base){

if(!Array.isArray(base))
return [];

return base.slice(-MAX_HISTORICO);

}

function indice(n){
return track.indexOf(n);
}

function numeroOffset(centro,offset){

const i=indice(centro);

if(i<0)
return centro;

return track[(i+offset+37)%37];

}

function setor(centro,qtd){

const i=indice(centro);

if(i<0)
return [];

const r=[];

for(let d=-qtd;d<=qtd;d++){

r.push(
track[(i+d+37)%37]
);

}

return r;

}

function vizinhos(numero,qtd=1){
return setor(numero,qtd);
}

function distanciaRoda(a,b){

const ia=indice(a);
const ib=indice(b);

if(ia<0 || ib<0)
return 99;

const d=Math.abs(ia-ib);

return Math.min(d,37-d);

}

function deltaRoda(centro,numero){

const a=indice(centro);
const b=indice(numero);

if(a<0 || b<0)
return 0;

let d=(b-a+37)%37;

if(d>18)
d-=37;

return d;

}

function terminal(n){
return n%10;
}

function terminalAnterior(t){
return (t+9)%10;
}

function terminalSeguinte(t){
return (t+1)%10;
}


/* ============================================================
   COR / REGIÃO
============================================================ */

function regiao(n){

if(regioes.ZERO.has(n)) return "ZERO";
if(regioes.VOISINS.has(n)) return "VOISINS";
if(regioes.ORPHELINS.has(n)) return "ORPHELINS";
if(regioes.TIERS.has(n)) return "TIERS";

return null;

}

function tipoCor(n){

if(n===0)
return "VERDE";

return vermelhos.has(n)
? "VERMELHO"
: "PRETO";

}

function corRoleta(n){

if(n===0)
return "#087c48";

return vermelhos.has(n)
? "#c6283d"
: "#181818";

}


/* ============================================================
   COBERTURA DOS IDS
============================================================ */

const coberturaIds = {};

BASES.forEach(base=>{

coberturaIds[base] =
new Set(
vizinhos(base,1)
);

});

function familia(id){

if(id===0 || id===10 || id===20 || id===30)
return 0;

if(id===6 || id===16 || id===26 || id===36)
return 6;

if(id===9 || id===19 || id===29 || id===39)
return 9;

return null;

}

function idsQueBatem(numero){

const ids=[];

BASES.forEach(base=>{

if(coberturaIds[base].has(numero))
ids.push(base);

});

if(
Object.prototype.hasOwnProperty.call(
ESPECIAIS,
numero
)
){

ESPECIAIS[numero].forEach(id=>{

if(!ids.includes(id))
ids.push(id);

});

}

return ids;

}

function eventoNumero(numero){

const fs =
new Set(
idsQueBatem(numero)
.map(familia)
.filter(x=>x!==null)
);

return (
(fs.has(0)?1:0) |
(fs.has(6)?2:0) |
(fs.has(9)?4:0)
);

}


/* ============================================================
   STORAGE / ESTADO
============================================================ */

function carregarHistorico(){

try{

const raw =
localStorage.getItem(STORAGE_KEY);

if(!raw)
return [];

const arr =
JSON.parse(raw);

if(!Array.isArray(arr))
return [];

return limitar35(
arr
.map(Number)
.filter(
n=>
Number.isInteger(n) &&
n>=0 &&
n<=36
)
);

}catch(e){

return [];

}

}

let historico =
carregarHistorico();

let estado = {

modo:"AUTO",

manualRX:6,

pendentes:{
AUTO:null,
4:null,
5:null,
6:null
},

timelines:{
AUTO:[],
4:[],
5:[],
6:[]
}

};

function carregarEstado(){

try{

const raw =
localStorage.getItem(STORAGE_ENGINE);

if(!raw)
return;

const x =
JSON.parse(raw);

if(
x.modo==="AUTO" ||
x.modo==="MANUAL"
)
estado.modo=x.modo;

if(RX_LIST.includes(x.manualRX))
estado.manualRX=x.manualRX;

if(x.timelines){

["AUTO",4,5,6].forEach(k=>{

if(Array.isArray(x.timelines[k])){

estado.timelines[k] =
x.timelines[k].slice(-MAX_TIMELINE);

}

});

}

if(x.pendentes){

estado.pendentes =
Object.assign(
estado.pendentes,
x.pendentes
);

}

}catch(e){}

}

carregarEstado();

function salvarHistorico(){

historico =
limitar35(historico);

try{

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(historico)
);

}catch(e){}

}

function salvarEstado(){

try{

localStorage.setItem(
STORAGE_ENGINE,
JSON.stringify(estado)
);

}catch(e){}

}


/* ============================================================
   DUPLAS VISUAIS
============================================================ */

let duplasVisual = [];

function avaliacoesVazias(){

return {
AUTO:null,
4:null,
5:null,
6:null
};

}

function snapshotsVazios(){

return {
AUTO:null,
4:null,
5:null,
6:null
};

}

function copiarSnapshotVisual(p){

if(!p)
return null;

return {

assinatura:p.assinatura,

rx:p.rx,

centros2:
Array.isArray(p.centros2)
?p.centros2.slice()
:[],

centro1:
p.centro1===undefined
?null
:p.centro1

};

}

function copiarPacoteSnapshots(pacote){

const out =
snapshotsVazios();

["AUTO",4,5,6].forEach(k=>{

out[k] =
copiarSnapshotVisual(
pacote
?pacote[k]
:null
);

});

return out;

}

function capturarSnapshotsAtuais(){

return {

AUTO:
copiarSnapshotVisual(
estado.pendentes.AUTO
),

4:
copiarSnapshotVisual(
estado.pendentes[4]
),

5:
copiarSnapshotVisual(
estado.pendentes[5]
),

6:
copiarSnapshotVisual(
estado.pendentes[6]
)

};

}

function pacoteTemSnapshot(pacote){

if(!pacote)
return false;

return ["AUTO",4,5,6]
.some(k=>!!pacote[k]);

}

function criarQuadroVisual(
gatilho,
snapshotGatilho
){

return {

gatilho:Number(gatilho),

resultado:null,

g1:null,

avaliacoes:
avaliacoesVazias(),

avaliacoesG1:
avaliacoesVazias(),

snapshotGatilho:
copiarPacoteSnapshots(
snapshotGatilho ||
snapshotsVazios()
),

snapshotResultado:
snapshotsVazios(),

proximoPreparado:false

};

}

function normalizarDuplaVisual(d){

if(!d || typeof d!=="object")
return null;

const gatilho =
Number(d.gatilho);

if(
!Number.isInteger(gatilho) ||
gatilho<0 ||
gatilho>36
)
return null;

return {

gatilho,

resultado:
d.resultado===null ||
d.resultado===undefined
?null
:Number(d.resultado),

g1:
d.g1===null ||
d.g1===undefined
?null
:Number(d.g1),

avaliacoes:
Object.assign(
avaliacoesVazias(),
d.avaliacoes||{}
),

avaliacoesG1:
Object.assign(
avaliacoesVazias(),
d.avaliacoesG1||{}
),

snapshotGatilho:
copiarPacoteSnapshots(
d.snapshotGatilho ||
d.snapshots ||
snapshotsVazios()
),

snapshotResultado:
copiarPacoteSnapshots(
d.snapshotResultado ||
d.snapshotsResultado ||
snapshotsVazios()
),

proximoPreparado:
!!d.proximoPreparado

};

}

function salvarDuplasVisual(){

duplasVisual =
duplasVisual
.filter(Boolean)
.slice(-7);

try{

localStorage.setItem(
STORAGE_DUPLAS,
JSON.stringify(duplasVisual)
);

}catch(e){}

}

function carregarDuplasVisual(){

try{

const raw =
localStorage.getItem(STORAGE_DUPLAS);

if(raw){

const arr =
JSON.parse(raw);

if(Array.isArray(arr)){

duplasVisual =
arr
.map(normalizarDuplaVisual)
.filter(Boolean)
.slice(-7);

return;

}

}

}catch(e){}

const ultimos =
historico.slice(-14);

duplasVisual=[];

for(let i=0;i<ultimos.length;i+=2){

duplasVisual.push({

gatilho:
ultimos[i],

resultado:
i+1<ultimos.length
?ultimos[i+1]
:null,

g1:null,

avaliacoes:
avaliacoesVazias(),

avaliacoesG1:
avaliacoesVazias(),

snapshotGatilho:
snapshotsVazios(),

snapshotResultado:
snapshotsVazios(),

proximoPreparado:false

});

}

duplasVisual =
duplasVisual.slice(-7);

salvarDuplasVisual();

}

carregarDuplasVisual();


/* ============================================================
   TERMINAIS
============================================================ */

function analisarTerminais(base){

const janela =
limitar35(base)
.slice(-JANELA_MOMENTO);

const ranking=[];

for(let t=0;t<=9;t++){

let direto=0;
let vizinho=0;
let direto5=0;
let vizinho5=0;
let score=0;

janela.forEach((n,i)=>{

const tn =
terminal(n);

const recencia =
.50+
((i+1)/
Math.max(1,janela.length))
*.50;

if(tn===t){

direto++;
score += 2.20*recencia;

if(i>=janela.length-5){

direto5++;
score += .95;

}

}else if(
tn===terminalAnterior(t) ||
tn===terminalSeguinte(t)
){

vizinho++;
score += .62*recencia;

if(i>=janela.length-5){

vizinho5++;
score += .20;

}

}

});

ranking.push({
terminal:t,
direto,
vizinho,
direto5,
vizinho5,
score
});

}

ranking.sort(
(a,b)=>
b.score-a.score ||
b.direto5-a.direto5 ||
b.direto-a.direto ||
b.vizinho-a.vizinho
);

const trio =
ranking
.slice(0,3)
.map(x=>x.terminal);

let cobertura=0;

janela.forEach(n=>{

const t =
terminal(n);

if(trio.includes(t)){

cobertura++;
return;

}

if(
trio.some(c=>
t===terminalAnterior(c) ||
t===terminalSeguinte(c)
)
)
cobertura++;

});

return {

ranking,
trio,

taxa:
janela.length
?cobertura/janela.length*100
:0

};

}

function scoreTerminalNumero(numero,momento){

const trio =
momento.terminais.trio;

if(!trio.length)
return 0;

const t =
terminal(numero);

if(t===trio[0]) return 1;
if(t===trio[1]) return .88;
if(t===trio[2]) return .78;

if(
t===terminalAnterior(trio[0]) ||
t===terminalSeguinte(trio[0])
)
return .46;

if(
t===terminalAnterior(trio[1]) ||
t===terminalSeguinte(trio[1])
)
return .40;

if(
t===terminalAnterior(trio[2]) ||
t===terminalSeguinte(trio[2])
)
return .34;

return 0;

}


/* ============================================================
   CORES
============================================================ */

function analisarCores(base){

const janela =
limitar35(base)
.slice(-JANELA_MOMENTO);

const contagem = {
VERMELHO:0,
PRETO:0,
VERDE:0
};

janela.forEach(n=>{
contagem[tipoCor(n)]++;
});

let alternancias=0;

for(let i=1;i<janela.length;i++){

if(
tipoCor(janela[i]) !==
tipoCor(janela[i-1])
)
alternancias++;

}

return {

contagem,

ultima:
janela.length
?tipoCor(janela[janela.length-1])
:null,

pctAlternancia:
janela.length>1
?alternancias/(janela.length-1)*100
:0

};

}

function scoreCorNumero(numero,momento){

const info =
momento.cores;

const total =
Math.max(
1,
momento.janela.length
);

const cor =
tipoCor(numero);

let score =
info.contagem[cor]/total;

if(
info.pctAlternancia>=60 &&
info.ultima
){

if(
info.ultima==="VERMELHO" &&
cor==="PRETO"
)
score += .18;

else if(
info.ultima==="PRETO" &&
cor==="VERMELHO"
)
score += .18;

}

return score;

}


/* ============================================================
   ZONAS
============================================================ */

function analisarZonas(base){

const janela =
limitar35(base)
.slice(-JANELA_MOMENTO);

const seq =
janela.map(regiao);

const contagem = {
ZERO:0,
VOISINS:0,
ORPHELINS:0,
TIERS:0
};

seq.forEach(z=>{
if(z)
contagem[z]++;
});

const transicoes = {

ZERO:{ZERO:0,VOISINS:0,ORPHELINS:0,TIERS:0},
VOISINS:{ZERO:0,VOISINS:0,ORPHELINS:0,TIERS:0},
ORPHELINS:{ZERO:0,VOISINS:0,ORPHELINS:0,TIERS:0},
TIERS:{ZERO:0,VOISINS:0,ORPHELINS:0,TIERS:0}

};

let alternancias=0;

for(let i=1;i<seq.length;i++){

if(seq[i] !== seq[i-1])
alternancias++;

if(seq[i-1] && seq[i])
transicoes[seq[i-1]][seq[i]]++;

}

const atual =
seq.length
?seq[seq.length-1]
:null;

let repeticaoAtual=0;

if(atual){

for(let i=seq.length-1;i>=0;i--){

if(seq[i]===atual)
repeticaoAtual++;

else
break;

}

}

return {

contagem,
transicoes,
atual,
repeticaoAtual,

pctAlternancia:
seq.length>1
?alternancias/(seq.length-1)*100
:0

};

}

function scoreZonaNumero(numero,momento){

const info =
momento.zonas;

const z =
regiao(numero);

if(!z)
return 0;

const total =
Math.max(
1,
momento.janela.length
);

let score =
info.contagem[z]/total;

if(info.atual){

const linha =
info.transicoes[info.atual];

const soma =
Object.values(linha)
.reduce((a,b)=>a+b,0);

if(soma)
score +=
((linha[z]||0)/soma)*.45;

}

if(
z===info.atual &&
info.repeticaoAtual>=2
)
score += .10;

return score;

}


/* ============================================================
   CONCENTRAÇÃO FÍSICA DAS DÚZIAS
============================================================ */

function analisarDuziasFisicas(base){

const janela =
limitar35(base)
.slice(-JANELA_MOMENTO);

const forca = {
1:0,
2:0,
3:0
};

const quantidade = {
1:0,
2:0,
3:0
};

janela.forEach((numero,i)=>{

const d =
duzia(numero);

if(!d)
return;

quantidade[d]++;

const mapa =
MAPA_DUZIA_FISICA[d];

const pesoFisico =
mapa.has(numero)
?mapa.get(numero)
:.25;

const recencia =
.50+
((i+1)/
Math.max(1,janela.length))
*.50;

forca[d] +=
pesoFisico*
recencia;

});

const ranking =
[1,2,3]
.map(d=>({

duzia:d,
forca:forca[d],
quantidade:quantidade[d]

}))
.sort(
(a,b)=>
b.forca-a.forca ||
b.quantidade-a.quantidade
);

return {
forca,
quantidade,
ranking
};

}

function scoreDuziaNumero(numero,momento){

const d =
duzia(numero);

if(!d)
return 0;

const info =
momento.duzias;

const maior =
Math.max(
info.forca[1],
info.forca[2],
info.forca[3],
.0001
);

const relativo =
info.forca[d]/maior;

const mapa =
MAPA_DUZIA_FISICA[d];

const fisico =
mapa.has(numero)
?mapa.get(numero)
:.25;

return (
relativo*.55 +
fisico*.45
);

}


/* ============================================================
   MOMENTO
============================================================ */

function analisarMomento(base){

const janela =
limitar35(base)
.slice(-JANELA_MOMENTO);

const momento = {

janela,

terminais:null,
cores:null,
zonas:null,
duzias:null

};

momento.terminais =
analisarTerminais(janela);

momento.cores =
analisarCores(janela);

momento.zonas =
analisarZonas(janela);

momento.duzias =
analisarDuziasFisicas(janela);

return momento;

}

function scoreMomentoNumero(numero,momento){

const st =
scoreTerminalNumero(numero,momento);

const sc =
scoreCorNumero(numero,momento);

const sz =
scoreZonaNumero(numero,momento);

const sd =
scoreDuziaNumero(numero,momento);

return (
st*.36 +
sc*.20 +
sz*.28 +
sd*PESO_DUZIA_FISICA
);

}


/* ============================================================
   ASSINATURA
============================================================ */

function assinaturaHistorico(base){

return limitar35(base)
.join(",");

}


/* ============================================================
   CONTAGEM IDS
============================================================ */

function contarIds(base){

const contagem={};

TODOS_IDS.forEach(id=>{
contagem[id]=0;
});

limitar35(base)
.forEach(numero=>{

idsQueBatem(numero)
.forEach(id=>{

if(
Object.prototype.hasOwnProperty.call(
contagem,
id
)
)
contagem[id]++;

});

});

return contagem;

}


/* ============================================================
   SCORE IDS
============================================================ */

function scoreIds(base){

const janela =
limitar35(base);

const momento =
analisarMomento(janela);

const contagem =
contarIds(janela);

const scores=[];

TODOS_IDS.forEach(id=>{

const fam =
familia(id);

let score =
contagem[id]||0;

if(BASES.includes(id)){

const nums =
Array.from(
coberturaIds[id]
);

let bonusMomento=0;

nums.forEach(n=>{

bonusMomento +=
scoreMomentoNumero(
n,
momento
);

});

bonusMomento /=
Math.max(
1,
nums.length
);

score +=
bonusMomento*
PESO_MOMENTO*
10;

}

scores.push({
id,
familia:fam,
score,
contagem:contagem[id]||0
});

});

scores.sort(
(a,b)=>
b.score-a.score ||
b.contagem-a.contagem ||
a.id-b.id
);

return {
scores,
momento,
contagem
};

}


/* ============================================================
   CENTROS RX
============================================================ */

function gerarCentrosRX(base,rx){

const analise =
scoreIds(base);

const candidatos =
analise.scores
.filter(x=>
BASES.includes(x.id)
);

const centros=[];

for(const c of candidatos){

if(centros.length>=2)
break;

if(
centros.every(x=>
distanciaRoda(
x,
c.id
)>rx
)
){

centros.push(c.id);

}

}

if(centros.length<2){

for(const c of candidatos){

if(centros.length>=2)
break;

if(!centros.includes(c.id))
centros.push(c.id);

}

}

return {

centros2:
centros.slice(0,2),

centro1:
centros.length
?centros[0]
:null,

analise

};

}


/* ============================================================
   COBERTURA
============================================================ */

function numerosDaJogada(
centros2,
centro1,
rx
){

const set =
new Set();

if(Array.isArray(centros2)){

centros2.forEach(c=>{

setor(c,rx)
.forEach(n=>
set.add(n)
);

});

}

if(
centro1!==null &&
centro1!==undefined
){

setor(
centro1,
Math.max(1,rx-1)
)
.forEach(n=>
set.add(n)
);

}

return Array.from(set);

}


/* ============================================================
   SNAPSHOT
============================================================ */

function criarSnapshot(base,rx){

if(
!Array.isArray(base) ||
!base.length
)
return null;

const g =
gerarCentrosRX(
base,
rx
);

return {

assinatura:
assinaturaHistorico(base),

rx,

centros2:
g.centros2.slice(),

centro1:
g.centro1

};

}


/* ============================================================
   CLASSIFICAÇÃO
============================================================ */

function classificarSnapshot(
numero,
snapshot
){

if(!snapshot){

return {
green:false,
tipo:"SEM"
};

}

const cobertura =
numerosDaJogada(
snapshot.centros2,
snapshot.centro1,
snapshot.rx
);

const green =
cobertura.includes(numero);

return {

green,

tipo:
green
?"GREEN"
:"LOSS"

};

}


/* ============================================================
   BACKTEST
============================================================ */

function backtestRX(base,rx){

const arr =
limitar35(base);

if(arr.length<4){

return {
rx,
greens:0,
loss:0,
total:0,
taxa:0,
score:0
};

}

let greens=0;
let loss=0;

const inicio =
Math.max(
1,
arr.length-JANELA_MOMENTO
);

for(let i=inicio;i<arr.length;i++){

const passado =
arr.slice(0,i);

const snap =
criarSnapshot(
passado,
rx
);

if(!snap)
continue;

const r =
classificarSnapshot(
arr[i],
snap
);

if(r.green)
greens++;

else
loss++;

}

const total =
greens+loss;

const taxa =
total
?greens/total*100
:0;

const score =
greens-
loss*.90+
taxa*.03;

return {
rx,
greens,
loss,
total,
taxa,
score
};

}


/* ============================================================
   AUTO RX
============================================================ */

function escolherRXAutomatico(base){

const resultados =
RX_LIST
.map(rx=>
backtestRX(
base,
rx
)
);

resultados.sort(
(a,b)=>
b.score-a.score ||
b.taxa-a.taxa ||
a.rx-b.rx
);

return {

rx:
resultados.length
?resultados[0].rx
:6,

resultados

};

}


/* ============================================================
   PENDENTES
============================================================ */

function gerarPendentesAtuais(){

if(!historico.length){

estado.pendentes.AUTO=null;

RX_LIST.forEach(rx=>{
estado.pendentes[rx]=null;
});

salvarEstado();
return;

}

const auto =
escolherRXAutomatico(
historico
);

estado.pendentes.AUTO =
criarSnapshot(
historico,
auto.rx
);

RX_LIST.forEach(rx=>{

estado.pendentes[rx] =
criarSnapshot(
historico,
rx
);

});

salvarEstado();

}

function garantirPendentes(){

const assinatura =
assinaturaHistorico(
historico
);

const p =
estado.pendentes.AUTO;

if(
!p ||
p.assinatura!==assinatura
){

gerarPendentesAtuais();

}

}


/* ============================================================
   TIMELINE
============================================================ */

function adicionarTimeline(
chave,
registro
){

if(
!Array.isArray(
estado.timelines[chave]
)
)
estado.timelines[chave]=[];

estado.timelines[chave]
.push(registro);

estado.timelines[chave] =
estado.timelines[chave]
.slice(-MAX_TIMELINE);

}

function avaliarPendentes(numero){

["AUTO",4,5,6]
.forEach(chave=>{

const p =
estado.pendentes[chave];

if(!p)
return;

const r =
classificarSnapshot(
numero,
p
);

adicionarTimeline(
chave,
{

numero,

resultado:r.tipo,

rx:p.rx,

centros2:
Array.isArray(p.centros2)
?p.centros2.slice()
:[],

centro1:
p.centro1

}
);

});

salvarEstado();

}


/* ============================================================
   VISUAL
============================================================ */

function chaveVisualAtual(){

return estado.modo==="AUTO"
?"AUTO"
:estado.manualRX;

}

function avaliarContraSnapshots(
numero,
snapshots
){

const resultado =
avaliacoesVazias();

["AUTO",4,5,6]
.forEach(k=>{

const p =
snapshots
?snapshots[k]
:null;

if(!p){

resultado[k]="SEM";
return;

}

const r =
classificarSnapshot(
numero,
p
);

resultado[k] =
r.green
?"GREEN"
:"LOSS";

});

return resultado;

}

function estadoDuplaVisual(d,chave){

if(!d)
return "SEM";

if(
d.resultado===null ||
d.resultado===undefined
)
return "ABERTA";

const primeira =
d.avaliacoes
?d.avaliacoes[chave]
:null;

if(primeira==="GREEN")
return "GREEN";

if(
primeira===null ||
primeira==="SEM"
)
return "SEM";

if(primeira==="LOSS"){

if(
d.g1===null ||
d.g1===undefined
)
return "AGUARDANDO_G1";

const segunda =
d.avaliacoesG1
?d.avaliacoesG1[chave]
:null;

if(segunda==="GREEN")
return "G1_GREEN";

if(segunda==="LOSS")
return "G1_LOSS";

return "SEM";

}

return "SEM";

}


/* ============================================================
   CONTROLE VISUAL
============================================================ */

function processarVisualAntes(numero){

const chave =
chaveVisualAtual();

const snapshotsAntes =
capturarSnapshotsAtuais();

if(!duplasVisual.length){

return {
tipo:"CRIAR_BASE",
numero
};

}

const ultima =
duplasVisual[
duplasVisual.length-1
];

if(
ultima.resultado===null ||
ultima.resultado===undefined
){

if(
!pacoteTemSnapshot(
ultima.snapshotGatilho
)
){

ultima.snapshotGatilho =
copiarPacoteSnapshots(
snapshotsAntes
);

}

ultima.resultado =
numero;

ultima.avaliacoes =
avaliarContraSnapshots(
numero,
ultima.snapshotGatilho
);

salvarDuplasVisual();

return {

tipo:"PRIMEIRO_RESULTADO",
numero,
quadro:ultima,
chave

};

}

const situacao =
estadoDuplaVisual(
ultima,
chave
);

if(
situacao==="AGUARDANDO_G1"
){

ultima.g1 =
numero;

ultima.avaliacoesG1 =
avaliarContraSnapshots(
numero,
ultima.snapshotGatilho
);

salvarDuplasVisual();

return {

tipo:"G1",
numero,
quadro:ultima,

proximoGatilho:
ultima.resultado,

snapshotProximo:
copiarPacoteSnapshots(
ultima.snapshotResultado
)

};

}

return {

tipo:"CRIAR_BASE",
numero

};

}

function processarVisualDepois(
numero,
controle
){

if(!controle)
return;

if(
controle.tipo==="CRIAR_BASE"
){

const snapshots =
capturarSnapshotsAtuais();

duplasVisual.push(

criarQuadroVisual(
numero,
snapshots
)

);

duplasVisual =
duplasVisual.slice(-7);

salvarDuplasVisual();

return;

}

if(
controle.tipo===
"PRIMEIRO_RESULTADO"
){

const snapshotsDoResultado =
capturarSnapshotsAtuais();

controle.quadro.snapshotResultado =
copiarPacoteSnapshots(
snapshotsDoResultado
);

salvarDuplasVisual();

return;

}

if(
controle.tipo==="G1"
){

duplasVisual.push(

criarQuadroVisual(
controle.proximoGatilho,
controle.snapshotProximo
)

);

duplasVisual =
duplasVisual.slice(-7);

salvarDuplasVisual();

return;

}

}


/* ============================================================
   ADICIONAR
============================================================ */

function adicionarNumero(numero){

numero =
Number(numero);

if(
!Number.isInteger(numero) ||
numero<0 ||
numero>36
)
return;

const controleVisual =
processarVisualAntes(
numero
);

avaliarPendentes(
numero
);

historico.push(
numero
);

historico =
historico.slice(
-MAX_HISTORICO
);

salvarHistorico();

gerarPendentesAtuais();

processarVisualDepois(
numero,
controleVisual
);

salvarEstado();

render();

}


/* ============================================================
   APAGAR VISUAL
============================================================ */

function apagarUltimoDaDupla(numero){

if(!duplasVisual.length)
return;

const ultima =
duplasVisual[
duplasVisual.length-1
];

if(
(
ultima.resultado===null ||
ultima.resultado===undefined
) &&
duplasVisual.length>=2
){

const anterior =
duplasVisual[
duplasVisual.length-2
];

if(
anterior &&
anterior.g1===numero &&
ultima.gatilho===
anterior.resultado
){

duplasVisual.pop();

anterior.g1=null;

anterior.avaliacoesG1 =
avaliacoesVazias();

anterior.proximoPreparado=false;

salvarDuplasVisual();

return;

}

}

if(
ultima.g1!==null &&
ultima.g1!==undefined &&
ultima.g1===numero
){

ultima.g1=null;

ultima.avaliacoesG1 =
avaliacoesVazias();

salvarDuplasVisual();

return;

}

if(
ultima.resultado!==null &&
ultima.resultado!==undefined &&
ultima.resultado===numero
){

ultima.resultado=null;
ultima.g1=null;

ultima.avaliacoes =
avaliacoesVazias();

ultima.avaliacoesG1 =
avaliacoesVazias();

ultima.snapshotResultado =
snapshotsVazios();

salvarDuplasVisual();

return;

}

if(
(
ultima.resultado===null ||
ultima.resultado===undefined
) &&
ultima.gatilho===numero
){

duplasVisual.pop();

salvarDuplasVisual();

return;

}

}


/* ============================================================
   APAGAR
============================================================ */

function apagarUltimo(){

if(!historico.length)
return;

const numero =
historico[
historico.length-1
];

historico.pop();

salvarHistorico();

apagarUltimoDaDupla(
numero
);

gerarPendentesAtuais();

render();

}

function apagarTudo(){

historico=[];

duplasVisual=[];

estado.pendentes = {
AUTO:null,
4:null,
5:null,
6:null
};

estado.timelines = {
AUTO:[],
4:[],
5:[],
6:[]
};

salvarHistorico();
salvarDuplasVisual();
salvarEstado();

render();

}


/* ============================================================
   INSERIR HISTÓRICO
============================================================ */

function inserirHistorico(texto){

if(typeof texto!=="string")
return;

const nums =
texto
.split(/[^0-9]+/)
.map(Number)
.filter(
n=>
Number.isInteger(n) &&
n>=0 &&
n<=36
);

if(!nums.length)
return;

historico =
nums.slice(
-MAX_HISTORICO
);

salvarHistorico();

const visual =
historico.slice(-14);

duplasVisual=[];

for(let i=0;i<visual.length;i+=2){

duplasVisual.push({

gatilho:
visual[i],

resultado:
i+1<visual.length
?visual[i+1]
:null,

g1:null,

avaliacoes:
avaliacoesVazias(),

avaliacoesG1:
avaliacoesVazias(),

snapshotGatilho:
snapshotsVazios(),

snapshotResultado:
snapshotsVazios(),

proximoPreparado:false

});

}

duplasVisual =
duplasVisual.slice(-7);

salvarDuplasVisual();

gerarPendentesAtuais();

render();

}


/* ============================================================
   ESTATÍSTICAS
============================================================ */

function estatisticasTimeline(chave){

const lista =
estado.timelines[chave]||[];

let greens=0;
let loss=0;

lista.forEach(x=>{

if(x.resultado==="GREEN")
greens++;

else if(x.resultado==="LOSS")
loss++;

});

const total =
greens+loss;

return {

greens,
loss,
total,

taxa:
total
?greens/total*100
:0

};

}


/* ============================================================
   JOGADA ATUAL
============================================================ */

function jogadaAtual(){

garantirPendentes();

const chave =
chaveVisualAtual();

return estado.pendentes[
chave
];

}

function textoJogada(snapshot){

if(!snapshot)
return "SEM JOGADA";

const c2 =
Array.isArray(snapshot.centros2)
?snapshot.centros2
:[];

const partes=[];

if(c2.length){

partes.push(
"ALVOS: "+
c2.join(" • ")
);

}

if(
snapshot.centro1!==null &&
snapshot.centro1!==undefined
){

partes.push(
"APOIO: "+
snapshot.centro1
);

}

partes.push(
"RX "+snapshot.rx
);

return partes.join(
" | "
);

}


/* ============================================================
   CSS — SOMENTE LAYOUT
============================================================ */

function instalarCSS(){

let antigo =
document.getElementById(
"analisa069-css"
);

if(antigo)
antigo.remove();

const style =
document.createElement(
"style"
);

style.id =
"analisa069-css";

style.textContent = `

#analisa069{
position:fixed;
z-index:2147483647;
left:50%;
bottom:4px;
transform:translateX(-50%);
width:min(1000px,98vw);
max-height:97vh;
overflow:auto;
box-sizing:border-box;
font-family:Arial,Helvetica,sans-serif;
background:#101010;
color:#fff;
border:1px solid #444;
border-radius:12px;
box-shadow:0 8px 30px rgba(0,0,0,.75);
padding:8px;
font-size:12px
}

#analisa069 *{
box-sizing:border-box
}

.a069-top{
display:flex;
align-items:center;
justify-content:space-between;
gap:6px;
margin-bottom:6px
}

.a069-title{
font-size:18px;
font-weight:900;
letter-spacing:.5px
}

.a069-actions{
display:flex;
gap:4px;
flex-wrap:wrap
}

.a069-btn{
border:1px solid #555;
background:#292929;
color:#fff;
border-radius:7px;
padding:7px 10px;
font-size:11px;
font-weight:900;
cursor:pointer
}

.a069-btn.active{
background:#007d98;
border-color:#00e5ff;
color:#fff
}

.a069-section{
background:#1c1c1f;
border:1px solid #414141;
border-radius:9px;
padding:7px;
margin-top:6px
}

.a069-label{
font-size:9px;
font-weight:900;
color:#888;
letter-spacing:.7px;
text-transform:uppercase;
margin-bottom:5px
}


/* ============================================================
   JOGADA PRINCIPAL
============================================================ */

.a069-jogada-principal{
border:2px solid #00e5ff;
background:#101719;
padding:8px;
}

.a069-jogada-topo{
display:flex;
justify-content:space-between;
align-items:center;
gap:8px;
margin-bottom:7px
}

.a069-modo-atual{
font-size:11px;
font-weight:900;
color:#00e5ff
}

.a069-rx-atual{
font-size:11px;
font-weight:900;
padding:4px 8px;
background:#007d98;
border-radius:6px
}

.a069-blocos{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:6px
}

.a069-bloco-jogada{
background:#111;
border:2px solid #00e5ff;
border-radius:9px;
padding:7px;
text-align:center;
min-width:0
}

.a069-bloco-jogada.apoio{
border-color:#ffc107
}

.a069-bloco-tipo{
font-size:8px;
font-weight:900;
color:#888;
margin-bottom:2px
}

.a069-centro{
font-size:28px;
font-weight:900;
line-height:1.05;
margin:3px 0 6px
}

.a069-cobertura{
display:flex;
justify-content:center;
gap:3px;
flex-wrap:wrap;
border-top:1px solid #333;
padding-top:6px
}

.a069-mini-num{
width:26px;
height:26px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:9px;
font-weight:900;
border:1px solid rgba(255,255,255,.3);
color:#fff
}

.a069-jogada-vazia{
text-align:center;
padding:15px;
font-size:14px;
font-weight:900;
color:#777
}

.a069-stats-jogada{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:4px;
margin-top:6px
}

.a069-stat{
background:#111;
border:1px solid #333;
border-radius:6px;
padding:5px;
text-align:center
}

.a069-stat small{
display:block;
font-size:7px;
font-weight:900;
color:#777
}

.a069-stat strong{
font-size:13px
}


/* ============================================================
   DUPLAS
============================================================ */

#ultimos14{
display:grid;
grid-template-columns:repeat(7,minmax(0,1fr));
gap:5px
}

.dupla14{
position:relative;
min-width:0;
height:52px;
border:2px solid #555;
background:#272727;
border-radius:8px;
display:flex;
align-items:center;
justify-content:center;
gap:3px;
padding:3px
}

.dupla14.aberta{
border-color:#777;
border-style:dashed;
background:#202020
}

.dupla14.green{
background:rgba(0,153,77,.20);
border-color:#00b85c
}

.dupla14.loss{
background:rgba(198,40,40,.20);
border-color:#d93a3a
}

.dupla14.g1{
background:rgba(255,193,7,.22);
border-color:#ffc107
}

.dupla14.sem{
background:#272727;
border-color:#555
}

.bolaDupla{
width:29px;
height:29px;
min-width:29px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:10px;
font-weight:900;
color:#fff;
border:2px solid #aaa
}

.setaDupla{
font-size:11px;
font-weight:900;
color:#aaa
}


/* ============================================================
   TECLADO
============================================================ */

.a069-keyboard{
display:grid;
grid-template-columns:repeat(12,1fr);
gap:3px
}

.a069-num{
height:34px;
border:1px solid #666;
border-radius:6px;
color:#fff;
font-size:11px;
font-weight:900;
cursor:pointer
}

.a069-num.zero{
grid-column:span 12
}


/* ============================================================
   INFORMAÇÕES
============================================================ */

.a069-grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:6px
}

.a069-card{
background:#111;
border:1px solid #333;
border-radius:7px;
padding:6px
}

.a069-small{
font-size:10px;
color:#bbb;
line-height:1.55
}

.a069-small b{
color:#fff
}

.a069-momento-grid{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:4px
}

.a069-momento-card{
background:#111;
border:1px solid #333;
border-radius:7px;
padding:6px;
text-align:center
}

.a069-momento-card small{
display:block;
font-size:7px;
font-weight:900;
color:#777
}

.a069-momento-card strong{
display:block;
font-size:14px;
margin-top:2px
}


/* ============================================================
   TIMELINE
============================================================ */

.a069-timeline{
display:flex;
gap:3px;
flex-wrap:wrap
}

.a069-tl{
width:25px;
height:25px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:8px;
font-weight:900;
color:#fff
}

.a069-green{
outline:2px solid #00c66b
}

.a069-loss{
outline:2px solid #e33648
}


/* ============================================================
   HISTÓRICO
============================================================ */

.a069-input{
width:100%;
min-height:48px;
resize:vertical;
background:#111;
border:1px solid #555;
border-radius:7px;
color:#fff;
padding:7px;
font-size:11px
}

.a069-row{
display:flex;
gap:5px;
align-items:center;
flex-wrap:wrap
}


/* ============================================================
   MOBILE
============================================================ */

@media(max-width:650px){

#analisa069{
width:99vw;
bottom:1px;
padding:5px;
max-height:99vh
}

.a069-title{
font-size:14px
}

.a069-btn{
padding:6px 8px;
font-size:9px
}

.a069-jogada-principal{
padding:6px
}

.a069-blocos{
grid-template-columns:repeat(3,1fr);
gap:3px
}

.a069-bloco-jogada{
padding:4px 2px
}

.a069-centro{
font-size:23px
}

.a069-mini-num{
width:21px;
height:21px;
font-size:7px
}

#ultimos14{
grid-template-columns:repeat(4,minmax(0,1fr))
}

.dupla14{
height:46px
}

.bolaDupla{
width:23px;
height:23px;
min-width:23px;
font-size:8px
}

.a069-keyboard{
grid-template-columns:repeat(9,1fr)
}

.a069-num.zero{
grid-column:span 9
}

.a069-num{
height:31px
}

.a069-grid{
grid-template-columns:1fr
}

.a069-momento-grid{
grid-template-columns:repeat(4,1fr)
}

}

`;

document.head.appendChild(style);

}


/* ============================================================
   HTML — SOMENTE LAYOUT
============================================================ */

function instalarHTML(){

const anterior =
document.getElementById(
"analisa069"
);

if(anterior)
anterior.remove();

const root =
document.createElement(
"div"
);

root.id =
"analisa069";

root.innerHTML = `

<div class="a069-top">

<div class="a069-title">
ANALISADOR 0 • 6 • 9
</div>

<div class="a069-actions">

<button class="a069-btn" id="modoAuto">
AUTO
</button>

<button class="a069-btn" id="rx4">
RX4
</button>

<button class="a069-btn" id="rx5">
RX5
</button>

<button class="a069-btn" id="rx6">
RX6
</button>

<button class="a069-btn" id="apagarUltimo">
⌫
</button>

<button class="a069-btn" id="apagarTudo">
LIMPAR
</button>

</div>
</div>


<div class="a069-section a069-jogada-principal">

<div class="a069-jogada-topo">

<div class="a069-label" style="margin:0;color:#00e5ff">
JOGADA ATUAL
</div>

<div id="rxAtual" class="a069-rx-atual">
—
</div>

</div>

<div id="jogadaAtual"></div>

<div id="infoAtual"></div>

</div>


<div class="a069-section">

<div class="a069-label">
7 QUADROS • GREEN / LOSS / G1
</div>

<div id="ultimos14"></div>

</div>


<div class="a069-section">

<div class="a069-label">
TECLADO
</div>

<div
class="a069-keyboard"
id="teclado069">
</div>

</div>


<div class="a069-section">

<div class="a069-label">
MOMENTO 14
</div>

<div id="momento14"></div>

</div>


<div class="a069-grid">

<div class="a069-section">

<div class="a069-label">
DESEMPENHO
</div>

<div
class="a069-small"
id="desempenho">
</div>

</div>


<div class="a069-section">

<div class="a069-label">
TIMELINE
</div>

<div
class="a069-timeline"
id="timeline069">
</div>

</div>

</div>


<div class="a069-section">

<div class="a069-label">
COLAR HISTÓRICO
</div>

<textarea
class="a069-input"
id="historicoInput"
placeholder="Cole números separados por espaço, vírgula ou quebra de linha...">
</textarea>

<div
class="a069-row"
style="margin-top:5px">

<button
class="a069-btn"
id="inserirHistorico">
INSERIR
</button>

<span
class="a069-small"
id="qtdHistorico">
</span>

</div>

</div>

`;

document.body.appendChild(
root
);

}


/* ============================================================
   TECLADO
============================================================ */

function montarTeclado(){

const area =
document.getElementById(
"teclado069"
);

if(!area)
return;

area.innerHTML="";

for(let n=1;n<=36;n++){

const b =
document.createElement(
"button"
);

b.className =
"a069-num";

b.textContent =
String(n);

b.style.background =
corRoleta(n);

b.addEventListener(
"click",
()=>adicionarNumero(n)
);

area.appendChild(b);

}

const zero =
document.createElement(
"button"
);

zero.className =
"a069-num zero";

zero.textContent =
"0";

zero.style.background =
corRoleta(0);

zero.addEventListener(
"click",
()=>adicionarNumero(0)
);

area.appendChild(zero);

}


/* ============================================================
   DUPLAS
============================================================ */

function renderDuplas14(){

const area =
document.getElementById(
"ultimos14"
);

if(!area)
return;

const lista =
duplasVisual.slice(-7);

const chave =
chaveVisualAtual();

let html="";

lista.forEach(d=>{

const situacao =
estadoDuplaVisual(
d,
chave
);

let classe="sem";

if(situacao==="ABERTA")
classe="aberta";

else if(situacao==="GREEN")
classe="green";

else if(situacao==="AGUARDANDO_G1")
classe="loss";

else if(situacao==="G1_GREEN")
classe="g1";

else if(situacao==="G1_LOSS")
classe="loss";

html +=
'<div class="dupla14 '+classe+'">';

html +=
'<div class="bolaDupla" style="background:'+
corRoleta(d.gatilho)+
'">'+
d.gatilho+
'</div>';

html +=
'<span class="setaDupla">›</span>';

if(
d.resultado!==null &&
d.resultado!==undefined
){

html +=
'<div class="bolaDupla" style="background:'+
corRoleta(d.resultado)+
'">'+
d.resultado+
'</div>';

}else{

html +=
'<div class="bolaDupla" style="background:#444;color:#999">—</div>';

}

if(
d.g1!==null &&
d.g1!==undefined
){

html +=
'<span class="setaDupla">›</span>';

html +=
'<div class="bolaDupla" style="background:'+
corRoleta(d.g1)+
'">'+
d.g1+
'</div>';

}

html +=
'</div>';

});

area.innerHTML =
html;

}


/* ============================================================
   NOVO RENDER VISUAL DA JOGADA
   SOMENTE APRESENTAÇÃO
============================================================ */

function htmlNumeroJogada(n){

return (
'<span class="a069-mini-num" style="background:'+
corRoleta(n)+
'">'+
n+
'</span>'
);

}

function htmlBlocoJogada(
centro,
qtd,
tipo
){

const numeros =
setor(
centro,
qtd
);

return (

'<div class="a069-bloco-jogada '+
(tipo==="APOIO"?"apoio":"")+
'">'+

'<div class="a069-bloco-tipo">'+
tipo+
'</div>'+

'<div class="a069-centro">'+
centro+
'</div>'+

'<div class="a069-cobertura">'+

numeros
.map(htmlNumeroJogada)
.join("")+

'</div>'+

'</div>'

);

}

function renderJogada(){

const area =
document.getElementById(
"jogadaAtual"
);

const info =
document.getElementById(
"infoAtual"
);

const rxAtual =
document.getElementById(
"rxAtual"
);

if(
!area ||
!info ||
!rxAtual
)
return;

const snap =
jogadaAtual();

const chave =
chaveVisualAtual();

const est =
estatisticasTimeline(
chave
);

if(!snap){

area.innerHTML =
'<div class="a069-jogada-vazia">'+
'SEM JOGADA'+
'</div>';

rxAtual.textContent =
"—";

}else{

rxAtual.textContent =
(
estado.modo==="AUTO"
?"AUTO • "
:""
)+
"RX "+snap.rx;

const blocos=[];

const c2 =
Array.isArray(
snap.centros2
)
?snap.centros2
:[];

c2.forEach((centro,i)=>{

blocos.push(
htmlBlocoJogada(
centro,
snap.rx,
"ALVO "+(i+1)
)
);

});

if(
snap.centro1!==null &&
snap.centro1!==undefined
){

blocos.push(
htmlBlocoJogada(
snap.centro1,
Math.max(
1,
snap.rx-1
),
"APOIO"
)
);

}

area.innerHTML =
'<div class="a069-blocos">'+
blocos.join("")+
'</div>';

}

info.innerHTML =

'<div class="a069-stats-jogada">'+

'<div class="a069-stat">'+
'<small>GREEN</small>'+
'<strong>'+
est.greens+
'</strong>'+
'</div>'+

'<div class="a069-stat">'+
'<small>LOSS</small>'+
'<strong>'+
est.loss+
'</strong>'+
'</div>'+

'<div class="a069-stat">'+
'<small>TAXA</small>'+
'<strong>'+
est.taxa.toFixed(1)+
'%</strong>'+
'</div>'+

'</div>';

}


/* ============================================================
   MOMENTO
============================================================ */

function renderMomento(){

const el =
document.getElementById(
"momento14"
);

if(!el)
return;

const momento =
analisarMomento(
historico
);

const terminais =
momento.terminais.ranking
.slice(0,3)
.map(x=>
'T'+x.terminal
)
.join(" • ");

const zona =
momento.zonas.atual ||
"—";

const dz =
momento.duzias.ranking.length
?momento.duzias.ranking[0].duzia
:"—";

el.innerHTML =

'<div class="a069-momento-grid">'+

'<div class="a069-momento-card">'+
'<small>TERMINAIS</small>'+
'<strong>'+
(terminais||"—")+
'</strong>'+
'</div>'+

'<div class="a069-momento-card">'+
'<small>COBERTURA</small>'+
'<strong>'+
momento.terminais.taxa.toFixed(0)+
'%</strong>'+
'</div>'+

'<div class="a069-momento-card">'+
'<small>ZONA</small>'+
'<strong>'+
zona+
'</strong>'+
'</div>'+

'<div class="a069-momento-card">'+
'<small>DÚZIA FÍSICA</small>'+
'<strong>'+
dz+
'ª</strong>'+
'</div>'+

'</div>';

}


/* ============================================================
   DESEMPENHO
============================================================ */

function renderDesempenho(){

const el =
document.getElementById(
"desempenho"
);

if(!el)
return;

const auto =
escolherRXAutomatico(
historico
);

let html =
'AUTO ATUAL: <b>RX'+
auto.rx+
'</b><br>';

auto.resultados
.forEach(r=>{

html +=

'RX'+
r.rx+
': <b>'+
r.greens+
'G</b> / <b>'+
r.loss+
'L</b> — '+
r.taxa.toFixed(1)+
'%<br>';

});

el.innerHTML =
html;

}


/* ============================================================
   TIMELINE
============================================================ */

function renderTimeline(){

const area =
document.getElementById(
"timeline069"
);

if(!area)
return;

const chave =
chaveVisualAtual();

const lista =
(
estado.timelines[chave]||
[]
)
.slice(-40);

let html="";

lista.forEach(x=>{

const classe =
x.resultado==="GREEN"
?"a069-green"
:"a069-loss";

html +=

'<div class="a069-tl '+
classe+
'" style="background:'+
corRoleta(x.numero)+
'">'+
x.numero+
'</div>';

});

area.innerHTML =
html;

}


/* ============================================================
   BOTÕES
============================================================ */

function renderBotoes(){

const auto =
document.getElementById(
"modoAuto"
);

const r4 =
document.getElementById(
"rx4"
);

const r5 =
document.getElementById(
"rx5"
);

const r6 =
document.getElementById(
"rx6"
);

if(
!auto ||
!r4 ||
!r5 ||
!r6
)
return;

auto.classList.toggle(
"active",
estado.modo==="AUTO"
);

r4.classList.toggle(
"active",
estado.modo==="MANUAL" &&
estado.manualRX===4
);

r5.classList.toggle(
"active",
estado.modo==="MANUAL" &&
estado.manualRX===5
);

r6.classList.toggle(
"active",
estado.modo==="MANUAL" &&
estado.manualRX===6
);

}


/* ============================================================
   QUANTIDADE
============================================================ */

function renderQuantidade(){

const el =
document.getElementById(
"qtdHistorico"
);

if(!el)
return;

el.textContent =
historico.length+
" / "+
MAX_HISTORICO+
" números";

}


/* ============================================================
   RENDER
============================================================ */

function render(){

garantirPendentes();

renderDuplas14();
renderJogada();
renderMomento();
renderDesempenho();
renderTimeline();
renderBotoes();
renderQuantidade();

salvarEstado();
salvarDuplasVisual();

}


/* ============================================================
   EVENTOS
============================================================ */

function instalarEventos(){

const auto =
document.getElementById(
"modoAuto"
);

const r4 =
document.getElementById(
"rx4"
);

const r5 =
document.getElementById(
"rx5"
);

const r6 =
document.getElementById(
"rx6"
);

const del =
document.getElementById(
"apagarUltimo"
);

const clear =
document.getElementById(
"apagarTudo"
);

const inserir =
document.getElementById(
"inserirHistorico"
);

const input =
document.getElementById(
"historicoInput"
);

auto.addEventListener(
"click",
()=>{

estado.modo="AUTO";

salvarEstado();

render();

}
);

r4.addEventListener(
"click",
()=>{

estado.modo="MANUAL";
estado.manualRX=4;

salvarEstado();

render();

}
);

r5.addEventListener(
"click",
()=>{

estado.modo="MANUAL";
estado.manualRX=5;

salvarEstado();

render();

}
);

r6.addEventListener(
"click",
()=>{

estado.modo="MANUAL";
estado.manualRX=6;

salvarEstado();

render();

}
);

del.addEventListener(
"click",
()=>{

apagarUltimo();

}
);

clear.addEventListener(
"click",
()=>{

if(
confirm(
"Apagar todo o histórico e resultados?"
)
){

apagarTudo();

}

}
);

inserir.addEventListener(
"click",
()=>{

inserirHistorico(
input.value
);

}
);

}


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

function iniciar(){

instalarCSS();

instalarHTML();

montarTeclado();

instalarEventos();

garantirPendentes();

render();

}


/* ============================================================
   ESPERA BODY
============================================================ */

if(document.body){

iniciar();

}else{

document.addEventListener(
"DOMContentLoaded",
iniciar,
{once:true}
);

}

})();
