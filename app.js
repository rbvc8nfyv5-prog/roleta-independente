(function(){
"use strict";

/* ============================================================
   ANALISADOR 0 • 6 • 9 — V11.1
   ============================================================

   BASE:
   - SOMENTE ÚLTIMOS 35 NÚMEROS
   - ÚLTIMOS 14 = MOMENTO

   MOTOR:
   - RX4 / RX5 / RX6 INTERNOS
   - AUTO
   - 80% sequência + 20% forma acumulada
   - próximos reais das réplicas
   - 8 IDs
   - sem offset global

   CONTEXTO:
   - trio de terminais
   - zonas
   - alternância/repetição de zonas
   - geometria da roda
   - corredores físicos ±5
   - miolo/laterais/pontas do corredor
   - LOSS de borda
   - FORA1 / FORA2 / quebra ampla

   JOGADA:
   - 5 setores de 2 vizinhos
   - 1 setor de 1 vizinho
   - sem sobreposição
   - 28 números únicos

   VISUAL:
   - sem "Raio-X mais forte"
   - sem ALTO/BAIXO
============================================================ */


/* ============================================================
   CONFIG
============================================================ */

const STORAGE_KEY =
"ANALISADOR_069_IDS_CORRESPONDENTES_V1";

/*
   Mantém a chave do motor V10 para
   não perder o estado que já existia.
*/
const STORAGE_ENGINE =
"ANALISADOR_069_ENGINE_COMPLETO_V10";

const MAX_HISTORICO = 35;
const MAX_TIMELINE = 300;

const JANELA_MOMENTO = 14;

const RX_LIST = [4,5,6];

const MAX_REPLICAS = 40;

const COR_T0 = "#00c853";
const COR_T6 = "#ffc107";
const COR_T9 = "#2196f3";


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


/* ============================================================
   ZONAS
============================================================ */

const regioes = {

ZERO:new Set([
0,32,15,26,3,35,12
]),

VOISINS:new Set([
19,4,21,2,25,28,7,29,18,22
]),

ORPHELINS:new Set([
9,31,14,20,1,17,6,34
]),

TIERS:new Set([
27,13,36,11,30,8,23,10,5,24,16,33
])

};

const coresRegioes = {
ZERO:"#8bcf31",
VOISINS:"#8629c7",
ORPHELINS:"#176436",
TIERS:"#29499b"
};


/* ============================================================
   IDS 0 / 6 / 9
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
   BASE FIXA 35
============================================================ */

function limitar35(base){

if(!Array.isArray(base)){
return [];
}

return base.slice(-35);
}


/* ============================================================
   ESTADO
============================================================ */

let historico = carregarHistorico();

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
},

ultimaEscolha:null

};

carregarEstado();


/* ============================================================
   STORAGE
============================================================ */

function carregarHistorico(){

try{

const raw =
localStorage.getItem(STORAGE_KEY);

if(!raw){
return [];
}

const arr =
JSON.parse(raw);

if(!Array.isArray(arr)){
return [];
}

return arr
.map(Number)
.filter(n =>
Number.isInteger(n) &&
n >= 0 &&
n <= 36
)
.slice(-35);

}catch(e){

console.error(e);

return [];
}

}


function salvarHistorico(){

historico =
limitar35(historico);

try{

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(historico)
);

}catch(e){

console.error(e);

}

}


function carregarEstado(){

try{

const raw =
localStorage.getItem(STORAGE_ENGINE);

if(!raw){
return;
}

const salvo =
JSON.parse(raw);


if(
salvo.modo === "AUTO" ||
salvo.modo === "MANUAL"
){
estado.modo = salvo.modo;
}


if(
RX_LIST.includes(salvo.manualRX)
){
estado.manualRX = salvo.manualRX;
}


if(salvo.pendentes){

estado.pendentes =
Object.assign(
estado.pendentes,
salvo.pendentes
);

}


if(salvo.timelines){

["AUTO",4,5,6]
.forEach(k => {

if(
Array.isArray(
salvo.timelines[k]
)
){

estado.timelines[k] =
salvo.timelines[k]
.slice(-MAX_TIMELINE);

}

});

}


if(salvo.ultimaEscolha){

estado.ultimaEscolha =
salvo.ultimaEscolha;

}

}catch(e){

console.error(e);

}

}


function salvarEstado(){

try{

localStorage.setItem(
STORAGE_ENGINE,
JSON.stringify(estado)
);

}catch(e){

console.error(e);

}

}


/* ============================================================
   RODA
============================================================ */

function indice(numero){

return track.indexOf(numero);

}


function setor(centro,qtd){

const i =
indice(centro);

if(i < 0){
return [];
}

const r = [];

for(
let d=-qtd;
d<=qtd;
d++
){

r.push(
track[
(
i+d+
track.length
) %
track.length
]
);

}

return r;

}


function vizinhos(numero,qtd=1){

const i =
indice(numero);

if(i < 0){
return [];
}

const r = [numero];

for(
let d=1;
d<=qtd;
d++
){

r.push(
track[
(
i-d+
track.length
) %
track.length
]
);

r.push(
track[
(
i+d
) %
track.length
]
);

}

return r;

}


function distanciaRoda(a,b){

const ia = indice(a);
const ib = indice(b);

if(
ia < 0 ||
ib < 0
){
return 99;
}

const d =
Math.abs(ia-ib);

return Math.min(
d,
track.length-d
);

}


function deltaRoda(centro,numero){

const ic =
indice(centro);

const inum =
indice(numero);

if(
ic < 0 ||
inum < 0
){
return 0;
}

let d =
(
inum-ic+
track.length
) %
track.length;

if(d > 18){
d -= 37;
}

return d;

}


/* ============================================================
   CARACTERÍSTICAS
============================================================ */

function regiao(numero){

if(regioes.ZERO.has(numero)){
return "ZERO";
}

if(regioes.VOISINS.has(numero)){
return "VOISINS";
}

if(regioes.ORPHELINS.has(numero)){
return "ORPHELINS";
}

if(regioes.TIERS.has(numero)){
return "TIERS";
}

return null;

}


function corRoleta(numero){

if(numero === 0){
return "#087c48";
}

return vermelhos.has(numero)
? "#c6283d"
: "#181818";

}


function terminal(numero){

return numero % 10;

}


function terminalAnterior(t){

return (t+9)%10;

}


function terminalSeguinte(t){

return (t+1)%10;

}


/* ============================================================
   IDS
============================================================ */

const coberturaIds = {};

BASES.forEach(base => {

coberturaIds[base] =
new Set(
vizinhos(base,1)
);

});


function familia(id){

if(
id === 0 ||
id === 10 ||
id === 20 ||
id === 30
){
return 0;
}

if(
id === 6 ||
id === 16 ||
id === 26 ||
id === 36
){
return 6;
}

if(
id === 9 ||
id === 19 ||
id === 29 ||
id === 39
){
return 9;
}

return null;

}


function corId(id){

const f =
familia(id);

if(f === 0){
return COR_T0;
}

if(f === 6){
return COR_T6;
}

if(f === 9){
return COR_T9;
}

return "#555";

}


function idsQueBatem(numero){

const ids = [];

BASES.forEach(base => {

if(
coberturaIds[base].has(numero)
){
ids.push(base);
}

});


if(
Object.prototype
.hasOwnProperty.call(
ESPECIAIS,
numero
)
){

ESPECIAIS[numero]
.forEach(id => {

if(!ids.includes(id)){
ids.push(id);
}

});

}

return ids;

}


function familiasQueBatem(numero){

return new Set(
idsQueBatem(numero)
.map(familia)
.filter(x => x !== null)
);

}


function eventoNumero(numero){

const f =
familiasQueBatem(numero);

return (
(f.has(0) ? 1 : 0) |
(f.has(6) ? 2 : 0) |
(f.has(9) ? 4 : 0)
);

}


/* ============================================================
   TRIOS
============================================================ */

const COMBINACOES_TRIO = [];

for(let a=0;a<=7;a++){

for(let b=a+1;b<=8;b++){

for(let c=b+1;c<=9;c++){

COMBINACOES_TRIO.push([
a,b,c
]);

}

}

}


function coberturaTerminaisTrio(trio){

const s = new Set();

trio.forEach(t => {

s.add(t);
s.add(terminalAnterior(t));
s.add(terminalSeguinte(t));

});

return s;

}


function estatisticaTrio(
trio,
janela
){

let acertos = 0;
let direto = 0;
let vizinho = 0;

let pontos = 0;
let pesoTotal = 0;


janela.forEach(
(numero,index) => {

const t =
terminal(numero);

const peso =
index+1;

pesoTotal += peso;


if(trio.includes(t)){

acertos++;
direto++;

pontos += peso;

}

else if(
trio.some(c =>
t === terminalAnterior(c) ||
t === terminalSeguinte(c)
)
){

acertos++;
vizinho++;

pontos +=
peso*.72;

}

});


return {

taxa:
janela.length
? acertos/janela.length*100
: 0,

acertos,
direto,
vizinho,

qualidade:
pesoTotal
? pontos/pesoTotal*100
: 0

};

}


/* ============================================================
   MELHOR TRIO — ÚLTIMOS 14
============================================================ */

function calcularTrioTerminais(base){

const janela14 =
limitar35(base)
.slice(-14);

if(!janela14.length){

return {

trio:[],
taxa14:0,
direto14:0,
vizinho14:0,
cobertura:[],
candidatos100:0

};

}


const j8 =
janela14.slice(-8);

const j5 =
janela14.slice(-5);


const ranking =
COMBINACOES_TRIO
.map(trio => {

const e14 =
estatisticaTrio(
trio,
janela14
);

const e8 =
estatisticaTrio(
trio,
j8
);

const e5 =
estatisticaTrio(
trio,
j5
);

const cobertura =
coberturaTerminaisTrio(
trio
);


return {

trio:trio.slice(),

taxa14:e14.taxa,
taxa8:e8.taxa,
taxa5:e5.taxa,

direto14:e14.direto,
direto5:e5.direto,

vizinho14:e14.vizinho,

qualidade:e14.qualidade,

cobertura:
Array.from(cobertura)
.sort((a,b)=>a-b),

coberturaQtd:
cobertura.size

};

});


ranking.sort((a,b) => {

if(b.taxa14 !== a.taxa14){
return b.taxa14-a.taxa14;
}

if(b.taxa5 !== a.taxa5){
return b.taxa5-a.taxa5;
}

if(b.taxa8 !== a.taxa8){
return b.taxa8-a.taxa8;
}

if(b.direto5 !== a.direto5){
return b.direto5-a.direto5;
}

if(b.direto14 !== a.direto14){
return b.direto14-a.direto14;
}

if(
a.coberturaQtd !==
b.coberturaQtd
){
return a.coberturaQtd-b.coberturaQtd;
}

return b.qualidade-a.qualidade;

});


const perfeitos =
ranking.filter(
x => x.taxa14 >= 99.999
);


const melhor =
perfeitos.length
? perfeitos[0]
: ranking[0];


return {

trio:
melhor.trio.slice(),

taxa14:
melhor.taxa14,

direto14:
melhor.direto14,

vizinho14:
melhor.vizinho14,

cobertura:
melhor.cobertura.slice(),

candidatos100:
perfeitos.length,

ranking

};

}


/* ============================================================
   ZONAS
============================================================ */

function analisarZonas(base){

const janela =
limitar35(base)
.slice(-14);

const contagem = {
ZERO:0,
VOISINS:0,
ORPHELINS:0,
TIERS:0
};

const sequencia =
janela.map(regiao);


sequencia.forEach(z => {

if(z){
contagem[z]++;
}

});


let alternancias = 0;
let repeticoes = 0;


for(
let i=1;
i<sequencia.length;
i++
){

if(
sequencia[i] !==
sequencia[i-1]
){
alternancias++;
}

else{
repeticoes++;
}

}


let sequenciaAtual = 0;
let zonaAtual = null;


if(sequencia.length){

zonaAtual =
sequencia[
sequencia.length-1
];

for(
let i=sequencia.length-1;
i>=0;
i--
){

if(
sequencia[i] ===
zonaAtual
){
sequenciaAtual++;
}

else{
break;
}

}

}


const transicoes = {

ZERO:{
ZERO:0,
VOISINS:0,
ORPHELINS:0,
TIERS:0
},

VOISINS:{
ZERO:0,
VOISINS:0,
ORPHELINS:0,
TIERS:0
},

ORPHELINS:{
ZERO:0,
VOISINS:0,
ORPHELINS:0,
TIERS:0
},

TIERS:{
ZERO:0,
VOISINS:0,
ORPHELINS:0,
TIERS:0
}

};


for(
let i=0;
i<sequencia.length-1;
i++
){

const a =
sequencia[i];

const b =
sequencia[i+1];

if(a && b){
transicoes[a][b]++;
}

}


const proximaZona = {};

if(zonaAtual){

Object.keys(
transicoes[zonaAtual]
)
.forEach(z => {

proximaZona[z] =
transicoes[zonaAtual][z];

});

}


const ranking =
Object.entries(contagem)
.sort((a,b)=>b[1]-a[1]);


return {

janela,
sequencia,
contagem,

alternancias,
repeticoes,

pctAlternancia:
sequencia.length > 1
? alternancias/
(sequencia.length-1)*100
: 0,

zonaAtual,
sequenciaAtual,

dominante:
ranking.length
? ranking[0][0]
: null,

dominanteQtd:
ranking.length
? ranking[0][1]
: 0,

transicoes,
proximaZona

};

}


/* ============================================================
   GEOMETRIA GERAL DA RODA
============================================================ */

function analisarGeometria(base){

const janela =
limitar35(base)
.slice(-14);

const densidade =
new Map();

track.forEach(n =>
densidade.set(n,0)
);


janela.forEach(
(numero,index) => {

const recencia =
.55 +
(
(index+1) /
Math.max(
1,
janela.length
)
)*.45;


track.forEach(centro => {

const d =
distanciaRoda(
numero,
centro
);

let peso = 0;

if(d === 0){
peso = 1;
}

else if(d === 1){
peso = .72;
}

else if(d === 2){
peso = .48;
}

else if(d === 3){
peso = .27;
}

else if(d === 4){
peso = .13;
}


if(peso){

densidade.set(
centro,
(
densidade.get(centro) ||
0
)+
peso*recencia
);

}

});

});


const ranking =
track
.map(numero => ({

numero,

score:
densidade.get(numero) || 0

}))
.sort(
(a,b)=>b.score-a.score
);


const centroMomento =
ranking.length
? ranking[0].numero
: null;


let meio = 0;
let lateral = 0;
let aberta = 0;


if(centroMomento !== null){

janela.forEach(numero => {

const d =
distanciaRoda(
numero,
centroMomento
);

if(d <= 1){
meio++;
}

else if(d <= 3){
lateral++;
}

else{
aberta++;
}

});

}


return {

centroMomento,

meio,
lateral,
aberta,

pctMeio:
janela.length
? meio/janela.length*100
: 0,

pctLateral:
janela.length
? lateral/janela.length*100
: 0,

pctAberta:
janela.length
? aberta/janela.length*100
: 0,

densidade,
ranking

};

}


/* ============================================================
   NOVO — CORREDORES FÍSICOS ±5

   Não existem centros fixos.

   Varre:
   32,15,19,4...30...10...17...9...0
   TODOS OS 37.

   Cada corredor contém:
   5 vizinhos esquerda
   + centro
   + 5 vizinhos direita

   Total = 11 casas físicas.
============================================================ */

function analisarCorredoresFisicos(base){

const janela14 =
limitar35(base)
.slice(-14);

const corredores = [];


track.forEach(centro => {

const numeros =
setor(centro,5);

let acertos = 0;

let pontos = 0;

let miolo = 0;
let laterais = 0;
let pontas = 0;

let ladoEsquerdo = 0;
let ladoDireito = 0;


janela14.forEach(
(numero,index) => {

const delta =
deltaRoda(
centro,
numero
);

const d =
Math.abs(delta);


if(d > 5){
return;
}


acertos++;


const recencia =
.55 +
(
(index+1) /
Math.max(
1,
janela14.length
)
)*.45;


/*
   MIolo:
   centro e ±1

   laterais:
   ±2 e ±3

   pontas:
   ±4 e ±5
*/

if(d <= 1){

miolo++;

pontos +=
1.00*recencia;

}

else if(d <= 3){

laterais++;

pontos +=
.92*recencia;

}

else{

pontas++;

pontos +=
.86*recencia;

}


if(delta < 0){
ladoEsquerdo++;
}

else if(delta > 0){
ladoDireito++;
}

});


const taxa =
janela14.length
? acertos/
janela14.length*
100
: 0;


let perfil =
"MIOLO";


if(
pontas > miolo &&
pontas >= laterais
){

perfil =
"PONTAS";

}

else if(
laterais > miolo
){

perfil =
"LATERAIS";

}


let lado =
"CENTRO";


if(
ladoEsquerdo >
ladoDireito+1
){

lado =
"ESQUERDA";

}

else if(
ladoDireito >
ladoEsquerdo+1
){

lado =
"DIREITA";

}


corredores.push({

centro,

numeros,

acertos,

taxa,

pontos,

miolo,
laterais,
pontas,

ladoEsquerdo,
ladoDireito,

perfil,
lado

});

});


corredores.sort((a,b) => {

if(
b.pontos !==
a.pontos
){
return b.pontos-a.pontos;
}

if(
b.acertos !==
a.acertos
){
return b.acertos-a.acertos;
}

return 0;

});


/*
   Corredores muito próximos podem
   representar a MESMA concentração.

   Eles continuam existindo no ranking,
   mas isso não é interpretado como
   tendências independentes.
*/

return {

janela14,

ranking:
corredores,

fortes:
corredores.slice(0,5),

principal:
corredores[0] || null

};

}


/* ============================================================
   MOMENTO COMPLETO
============================================================ */

function analisarMomento(base){

base =
limitar35(base);

const janela =
base.slice(-14);

const roda =
new Map();

track.forEach(n =>
roda.set(n,0)
);


janela.forEach(
(numero,index) => {

const recencia =
.6 +
(
(index+1) /
Math.max(
1,
janela.length
)
)*.4;


track.forEach(alvo => {

const d =
distanciaRoda(
numero,
alvo
);

let peso = 0;

if(d === 0){
peso = 1;
}

else if(d === 1){
peso = .58;
}

else if(d === 2){
peso = .28;
}

else if(d === 3){
peso = .10;
}


if(peso){

roda.set(
alvo,
(
roda.get(alvo) ||
0
)+
peso*recencia
);

}

});

});


return {

tamanho:
janela.length,

janela,

trioTerminais:
calcularTrioTerminais(base),

zonas:
analisarZonas(base),

geometria:
analisarGeometria(base),

corredores:
analisarCorredoresFisicos(base),

roda

};

}


/* ============================================================
   SCORE TRIO
============================================================ */

function scoreTrioTerminal(
numero,
momento
){

const info =
momento.trioTerminais;

if(
!info ||
!info.trio.length
){
return 0;
}


const t =
terminal(numero);


if(
info.trio.includes(t)
){
return 1;
}


if(
info.trio.some(c =>
t === terminalAnterior(c) ||
t === terminalSeguinte(c)
)
){
return .58;
}


return 0;

}


/* ============================================================
   SCORE ZONA
============================================================ */

function scoreZonaNumero(
numero,
momento
){

const z =
regiao(numero);

const zonas =
momento.zonas;

if(!z){
return 0;
}


const total =
Math.max(
1,
momento.tamanho
);


let score =
zonas.contagem[z] /
total;


if(
zonas.zonaAtual &&
zonas.proximaZona
){

const valores =
Object.values(
zonas.proximaZona
);

const soma =
valores.reduce(
(a,b)=>a+b,
0
);


if(soma){

score +=
(
zonas.proximaZona[z] ||
0
) /
soma *
.55;

}

}


if(
z === zonas.zonaAtual &&
zonas.sequenciaAtual >= 2
){

score += .12;

}


return score;

}


/* ============================================================
   SCORE GEOMETRIA
============================================================ */

function scoreGeometriaNumero(
numero,
momento
){

const g =
momento.geometria;


if(
g.centroMomento === null
){
return 0;
}


const d =
distanciaRoda(
numero,
g.centroMomento
);


if(
g.pctMeio >=
g.pctLateral
){

if(d === 0){
return 1;
}

if(d === 1){
return .75;
}

if(d === 2){
return .40;
}

if(d === 3){
return .18;
}

return 0;

}


if(d === 2){
return 1;
}

if(d === 3){
return .90;
}

if(d === 1){
return .65;
}

if(d === 4){
return .45;
}

if(d === 0){
return .40;
}

return 0;

}


/* ============================================================
   SCORE DOS CORREDORES ±5

   IMPORTANTE:
   corredor NÃO cria candidato.

   Ele só dá força adicional para
   números/setores que já vieram
   das réplicas RX.
============================================================ */

function scoreCorredorNumero(
numero,
momento
){

if(
!momento ||
!momento.corredores ||
!momento.corredores.fortes
){
return 0;
}


const fortes =
momento.corredores.fortes;

let score = 0;


fortes.forEach(
(corredor,posicao) => {

const delta =
deltaRoda(
corredor.centro,
numero
);

const d =
Math.abs(delta);


if(d > 5){
return;
}


const forcaRanking =
[1,.82,.67,.54,.43][posicao]
|| .35;


const confianca =
corredor.taxa/100;


let local = 0;


/* -----------------------------------------
   CORREDOR BATENDO NAS PONTAS
----------------------------------------- */

if(
corredor.perfil ===
"PONTAS"
){

if(d >= 4){
local = 1;
}

else if(d === 3){
local = .72;
}

else if(d === 2){
local = .52;
}

else{
local = .38;
}

}


/* -----------------------------------------
   CORREDOR BATENDO NAS LATERAIS
----------------------------------------- */

else if(
corredor.perfil ===
"LATERAIS"
){

if(
d >= 2 &&
d <= 3
){
local = 1;
}

else if(d === 4){
local = .67;
}

else if(d === 1){
local = .58;
}

else{
local = .48;
}

}


/* -----------------------------------------
   CORREDOR BATENDO NO MIOLO
----------------------------------------- */

else{

if(d <= 1){
local = 1;
}

else if(d === 2){
local = .72;
}

else if(d === 3){
local = .50;
}

else{
local = .30;
}

}


/*
   Se existe lado predominante dentro
   do corredor, pequeno reforço.

   Não desloca a roda.
*/

if(
corredor.lado ===
"ESQUERDA" &&
delta < 0
){

local *= 1.08;

}

else if(
corredor.lado ===
"DIREITA" &&
delta > 0
){

local *= 1.08;

}


score +=
forcaRanking *
confianca *
local;

});


return score;

}


/* ============================================================
   RX CACHE
============================================================ */

function construirCache(base){

base =
limitar35(base);

const eventos =
new Uint8Array(
base.length
);


for(
let i=0;
i<base.length;
i++
){

eventos[i] =
eventoNumero(
base[i]
);

}


return {
base,
eventos
};

}


/* ============================================================
   SIMILARIDADE RX
   80% EVENTOS
   20% FORMA ACUMULADA
============================================================ */

function similaridadeJanelas(
cache,
a,
b,
tamanho
){

let iguais = 0;
let erro = 0;

let a0=0,a6=0,a9=0;
let b0=0,b6=0,b9=0;


for(
let k=0;
k<tamanho;
k++
){

const ea =
cache.eventos[a+k];

const eb =
cache.eventos[b+k];


if(ea === eb){
iguais++;
}


if(ea&1) a0++;
if(ea&2) a6++;
if(ea&4) a9++;

if(eb&1) b0++;
if(eb&2) b6++;
if(eb&4) b9++;


erro +=
Math.abs(a0-b0);

erro +=
Math.abs(a6-b6);

erro +=
Math.abs(a9-b9);

}


const scoreEventos =
iguais/tamanho*100;


const maxErro =
tamanho*tamanho*3;


const scoreForma =
Math.max(
0,
Math.min(
1,
1-erro/maxErro
)
)*100;


return (
scoreEventos*.80 +
scoreForma*.20
);

}


/* ============================================================
   RX
============================================================ */

function analisarRX(base,rx){

base =
limitar35(base);


if(
base.length <
rx*2+4
){

return {

valido:false,
rx,
replicas:[],
similaridade:0,
rankingIds:[],

sinal:{
0:0,
6:0,
9:0
}

};

}


const cache =
construirCache(base);


const atualInicio =
base.length-rx;


const candidatos = [];


for(
let i=0;
i+rx<atualInicio;
i++
){

const proximo =
base[i+rx];

if(
proximo === undefined
){
continue;
}


candidatos.push({

inicio:i,

proximo,

similaridade:
similaridadeJanelas(
cache,
atualInicio,
i,
rx
)

});

}


candidatos.sort(
(a,b) => {

if(
b.similaridade !==
a.similaridade
){

return (
b.similaridade -
a.similaridade
);

}

return b.inicio-a.inicio;

}
);


if(!candidatos.length){

return {

valido:false,
rx,
replicas:[],
similaridade:0,
rankingIds:[],

sinal:{
0:0,
6:0,
9:0
}

};

}


/*
   Aproximadamente top 10%.
   Expande se necessário para
   conseguir 8 IDs positivos.
*/

let qtd =
Math.ceil(
candidatos.length*.10
);


qtd =
Math.max(
4,
qtd
);


qtd =
Math.min(
qtd,
MAX_REPLICAS,
candidatos.length
);


const replicas =
candidatos.slice(0,qtd);


const contagem =
new Map();


TODOS_IDS.forEach(id =>
contagem.set(id,0)
);


const familias = {
0:0,
6:0,
9:0
};


function contar(rep){

const ids =
idsQueBatem(
rep.proximo
);


ids.forEach(id => {

contagem.set(
id,
(
contagem.get(id) ||
0
)+1
);

});


const fs =
Array.from(
new Set(
ids
.map(familia)
.filter(
x => x !== null
)
)
);


if(fs.length){

const parte =
1/fs.length;

fs.forEach(f => {

familias[f] += parte;

});

}

}


replicas.forEach(contar);


function positivos(){

return TODOS_IDS
.filter(
id =>
(
contagem.get(id) ||
0
) > 0
)
.length;

}


let pos = qtd;


while(
positivos() < 8 &&
pos < candidatos.length &&
replicas.length < MAX_REPLICAS
){

const rep =
candidatos[pos++];

replicas.push(rep);

contar(rep);

}


const rankingIds =
TODOS_IDS
.map(
(id,ordem) => ({

id,

ocorrencias:
contagem.get(id) || 0,

ordem

})
)
.filter(
x => x.ocorrencias > 0
)
.sort(
(a,b) => {

if(
b.ocorrencias !==
a.ocorrencias
){

return (
b.ocorrencias -
a.ocorrencias
);

}

return a.ordem-b.ordem;

}
);


const total =
familias[0]+
familias[6]+
familias[9];


const sinal = {

0:
total
? familias[0]/total*100
: 0,

6:
total
? familias[6]/total*100
: 0,

9:
total
? familias[9]/total*100
: 0

};


return {

valido:true,

rx,

replicas,

rankingIds,

sinal,

similaridade:
replicas.reduce(
(s,x)=>
s+x.similaridade,
0
) /
replicas.length

};

}


/* ============================================================
   FREQUÊNCIA DOS PRÓXIMOS REAIS
============================================================ */

function frequenciaReplicas(replicas){

const freq =
new Map();

track.forEach(n =>
freq.set(n,0)
);


replicas.forEach(rep => {

freq.set(
rep.proximo,
(
freq.get(rep.proximo) ||
0
)+1
);

});


return freq;

}


/* ============================================================
   CLASSIFICAÇÃO
============================================================ */

function classificarPorBlocos(
numero,
blocos2,
blocos1
){

const todos = [];


blocos2.forEach(b => {

todos.push({

centro:b.centro,
qtd:2,
numeros:b.numeros

});

});


blocos1.forEach(b => {

todos.push({

centro:b.centro,
qtd:1,
numeros:b.numeros

});

});


for(const b of todos){

if(
b.numeros.includes(numero)
){

const d =
distanciaRoda(
numero,
b.centro
);


return {

green:true,

tipo:
d === 0
? "ALVO"
: (
d === 1
? "V1"
: "V2"
),

distancia:d,

centro:b.centro,

qtd:b.qtd,

lado:
Math.sign(
deltaRoda(
b.centro,
numero
)
)

};

}

}


let melhor = null;


todos.forEach(b => {

const dCentro =
distanciaRoda(
numero,
b.centro
);


const gap =
dCentro-b.qtd;


if(
gap > 0 &&
(
!melhor ||
gap < melhor.gap
)
){

melhor = {

gap,

centro:b.centro,

qtd:b.qtd,

lado:
Math.sign(
deltaRoda(
b.centro,
numero
)
)

};

}

});


if(!melhor){

return {

green:false,
tipo:"FORA",
distancia:99,
centro:null,
qtd:null,
lado:0

};

}


return {

green:false,

tipo:
melhor.gap === 1
? "FORA1"
: (
melhor.gap === 2
? "FORA2"
: "FORA"
),

distancia:
melhor.gap,

centro:
melhor.centro,

qtd:
melhor.qtd,

lado:
melhor.lado

};

}


/* ============================================================
   DIAGNÓSTICO LOSS
============================================================ */

function diagnosticarLosses(lista){

if(!Array.isArray(lista)){
lista = [];
}


let consecutivos = [];


for(
let i=lista.length-1;
i>=0;
i--
){

if(lista[i].green){
break;
}

consecutivos.unshift(
lista[i]
);

}


if(!consecutivos.length){

return {

ativo:false,
seq:0,
tipo:"ESTÁVEL",
intensidade:0,
coerencia:0,
lado:0

};

}


const ultimos =
consecutivos.slice(-3);


const fora1 =
ultimos.filter(
x => x.tipo === "FORA1"
).length;


const fora2 =
ultimos.filter(
x => x.tipo === "FORA2"
).length;


const total =
ultimos.length;


const esquerda =
ultimos.filter(
x => x.lado < 0
).length;


const direita =
ultimos.filter(
x => x.lado > 0
).length;


const mesmoLado =
Math.max(
esquerda,
direita
);


const zonas = {};
const terminais = {};


ultimos.forEach(x => {

const z =
regiao(x.resultado);

const t =
terminal(x.resultado);


zonas[z] =
(zonas[z]||0)+1;


terminais[t] =
(terminais[t]||0)+1;

});


const maiorZona =
Math.max(
0,
...Object.values(zonas)
);


const maiorTerminal =
Math.max(
0,
...Object.values(terminais)
);


const coerencia =
Math.max(

total
? mesmoLado/total
: 0,

total
? maiorZona/total
: 0,

total
? maiorTerminal/total
: 0

);


let tipo =
"QUEBRA ISOLADA";


let intensidade =
.20;


/*
   1 LOSS logo do lado:
   erro básico de borda.
*/

if(
consecutivos.length === 1 &&
consecutivos[0].tipo === "FORA1"
){

tipo =
"BORDA";

intensidade =
.10;

}


else if(
fora1 >= 2 &&
mesmoLado >= 2
){

tipo =
"BORDA REPETIDA";

intensidade =
.45;

}


else if(
consecutivos.length >= 2 &&
coerencia >= .66
){

tipo =
"MUDANÇA COERENTE";

intensidade =
.65;

}


else if(
consecutivos.length >= 3
){

tipo =
"QUEBRA AMPLA";

intensidade =
.75;

}


return {

ativo:true,

seq:
consecutivos.length,

tipo,

intensidade,

coerencia,

fora1,
fora2,

lado:
direita > esquerda
? 1
: (
esquerda > direita
? -1
: 0
),

terminais,
zonas

};

}


/* ============================================================
   SCORE DO SETOR
============================================================ */

function avaliarSetor(
centro,
qtd,
freq,
momento,
contexto,
diagnostico
){

const numeros =
setor(
centro,
qtd
);


let score = 0;
let suporte = 0;

let alvo = 0;
let v1 = 0;
let v2 = 0;


numeros.forEach(
(numero,index) => {

const f =
freq.get(numero) || 0;

suporte += f;


const d =
Math.abs(
index-qtd
);


let peso = 1;


if(d === 0){

peso = 1.45;
alvo += f;

}

else if(d === 1){

peso = 1.22;
v1 += f;

}

else{

peso = 1;
v2 += f;

}


score +=
f*peso;

});


/*
   Sem próximo real das réplicas,
   nenhum contexto pode inventar setor.
*/

if(suporte <= 0){

return {

centro,
qtd,
numeros,

suporte:0,

score:-999999

};

}


const ic =
indice(centro);


const foraEsq =
track[
(
ic-qtd-1+
track.length
) %
track.length
];


const foraDir =
track[
(
ic+qtd+1
) %
track.length
];


const fEsq =
freq.get(foraEsq) || 0;


const fDir =
freq.get(foraDir) || 0;


score -=
(fEsq+fDir)*.28;


score +=
alvo*.13 +
v1*.08;


if(contexto > 0){

let trio = 0;
let zona = 0;
let geo = 0;
let corredor = 0;
let roda = 0;


numeros.forEach(n => {

trio +=
scoreTrioTerminal(
n,
momento
);


zona +=
scoreZonaNumero(
n,
momento
);


geo +=
scoreGeometriaNumero(
n,
momento
);


corredor +=
scoreCorredorNumero(
n,
momento
);


roda +=
momento.roda.get(n) || 0;

});


trio /=
numeros.length;

zona /=
numeros.length;

geo /=
numeros.length;

corredor /=
numeros.length;

roda /=
numeros.length;


/*
   RX continua mandando.

   Contexto apenas diferencia
   setores que já possuem suporte.

   CORREDOR ±5 agora participa
   diretamente da montagem.
*/

score +=
suporte *
(
trio*.28 +
zona*.14 +
geo*.10 +
corredor*.18 +
roda*.020
) *
contexto;


/*
   Tratamento de LOSS de borda.
*/

if(
diagnostico &&
diagnostico.ativo &&
diagnostico.lado !== 0
){

const freqLado =
diagnostico.lado < 0
? fEsq
: fDir;


if(
diagnostico.tipo ===
"BORDA"
){

score +=
freqLado*.12;

}


else if(
diagnostico.tipo ===
"BORDA REPETIDA"
){

score +=
freqLado*.32;

}


else if(
diagnostico.tipo ===
"MUDANÇA COERENTE"
){

score +=
freqLado*
.38*
diagnostico.coerencia;

}

}

}


return {

centro,
qtd,
numeros,

suporte,

alvo,
v1,
v2,

foraEsq,
foraDir,

fEsq,
fDir,

score

};

}


/* ============================================================
   MONTA JOGADA
============================================================ */

function montarJogada(
rx,
base,
contexto=1,
diagnostico=null
){

base =
limitar35(base);


if(
!rx ||
!rx.valido
){

return {

valido:false,
blocos2:[],
blocos1:[],
numeros:new Set()

};

}


const freq =
frequenciaReplicas(
rx.replicas
);


const momento =
analisarMomento(base);


const candidatos2 =
track
.map(c =>
avaliarSetor(
c,
2,
freq,
momento,
contexto,
diagnostico
)
)
.sort(
(a,b)=>b.score-a.score
);


const candidatos1 =
track
.map(c =>
avaliarSetor(
c,
1,
freq,
momento,
contexto,
diagnostico
)
)
.sort(
(a,b)=>b.score-a.score
);


let melhor = null;


/*
   Testa cada possível setor de 1V.
   Depois procura 5 setores 2V
   sem sobreposição.
*/

for(const um of candidatos1){

const usados =
new Set(
um.numeros
);


const dois = [];

let score =
um.score;


for(
const candidato
of candidatos2
){

const conflito =
candidato.numeros
.some(n =>
usados.has(n)
);


if(conflito){
continue;
}


dois.push(
candidato
);


score +=
candidato.score;


candidato.numeros
.forEach(n =>
usados.add(n)
);


if(dois.length === 5){
break;
}

}


if(
dois.length === 5 &&
usados.size === 28
){

if(
!melhor ||
score > melhor.score
){

melhor = {

valido:true,

blocos2:
dois,

blocos1:[
um
],

numeros:
usados,

score,

trioTerminais:
momento
.trioTerminais
.trio
.slice(),

trioTaxa14:
momento
.trioTerminais
.taxa14,

zona:
momento.zonas,

geometria:
momento.geometria,

corredores:
momento.corredores

};

}

}

}


return melhor || {

valido:false,

blocos2:[],

blocos1:[],

numeros:new Set()

};

}


/* ============================================================
   CONFIG
============================================================ */

function gerarConfig(
base,
rxTam,
contexto=1,
diagnostico=null
){

base =
limitar35(base);


const raioX =
analisarRX(
base,
rxTam
);


if(!raioX.valido){

return {
valido:false,
rx:rxTam
};

}


const jogada =
montarJogada(
raioX,
base,
contexto,
diagnostico
);


return {

valido:
jogada.valido,

rx:
rxTam,

contexto,

raioX,

jogada,

similaridade:
raioX.similaridade

};

}


/* ============================================================
   RESULTADO DA JOGADA
============================================================ */

function classificarResultadoJogada(
numero,
jogada
){

if(
!jogada ||
!jogada.valido
){

return {

green:false,
tipo:"FORA",
distancia:99,
lado:0

};

}


return classificarPorBlocos(
numero,
jogada.blocos2,
jogada.blocos1
);

}


/* ============================================================
   BACKTEST WALK-FORWARD
============================================================ */

function backtest(
base,
rxTam,
contexto=1
){

base =
limitar35(base);


const timeline = [];


const minimo =
Math.max(
14,
rxTam*2+4
);


if(
base.length <= minimo
){

return estatBacktest(
timeline
);

}


const inicio =
Math.max(
minimo,
base.length-20
);


for(
let i=inicio;
i<base.length;
i++
){

const passado =
base.slice(0,i);


/*
   Diagnóstico somente com aquilo
   que já aconteceu antes.
*/

const diagnostico =
diagnosticarLosses(
timeline
);


const cfg =
gerarConfig(
passado,
rxTam,
contexto,
diagnostico
);


if(!cfg.valido){
continue;
}


const real =
base[i];


const r =
classificarResultadoJogada(
real,
cfg.jogada
);


timeline.push({

resultado:real,

green:r.green,

tipo:r.tipo,

distancia:r.distancia,

lado:r.lado,

terminal:
terminal(real),

regiao:
regiao(real),

trio:
cfg.jogada
.trioTerminais
.slice()

});

}


return estatBacktest(
timeline
);

}


/* ============================================================
   ESTATÍSTICA BACKTEST
============================================================ */

function estatBacktest(timeline){

function taxa(arr){

if(!arr.length){
return 0;
}

return (
arr.filter(
x=>x.green
).length /
arr.length *
100
);

}


function qualidade(arr){

const q = {

green:0,
alvo:0,
v1:0,
v2:0,

fora1:0,
fora2:0,
fora:0,

pctInterno:0

};


arr.forEach(x => {

if(x.green){
q.green++;
}


if(x.tipo === "ALVO"){
q.alvo++;
}

else if(x.tipo === "V1"){
q.v1++;
}

else if(x.tipo === "V2"){
q.v2++;
}

else if(x.tipo === "FORA1"){
q.fora1++;
}

else if(x.tipo === "FORA2"){
q.fora2++;
}

else{
q.fora++;
}

});


if(q.green){

q.pctInterno =
(
q.alvo+
q.v1
) /
q.green *
100;

}


return q;

}


let loss = 0;


for(
let i=timeline.length-1;
i>=0;
i--
){

if(timeline[i].green){
break;
}

loss++;

}


return {

total:
timeline.length,

taxa5:
taxa(
timeline.slice(-5)
),

taxa10:
taxa(
timeline.slice(-10)
),

taxa20:
taxa(
timeline.slice(-20)
),

lossSeguidos:
loss,

qualidade10:
qualidade(
timeline.slice(-10)
),

qualidade20:
qualidade(
timeline.slice(-20)
),

timeline

};

}


/* ============================================================
   MELHOR DE CADA RX
============================================================ */

const CONTEXTOS = [
0,
.5,
1
];


function melhorDoRX(base,rxTam){

base =
limitar35(base);


let melhor = null;


const diagLive =
diagnosticarLosses(
estado.timelines[rxTam]
);


for(
const contexto
of CONTEXTOS
){

const cfg =
gerarConfig(
base,
rxTam,
contexto,
diagLive
);


if(!cfg.valido){
continue;
}


const bt =
backtest(
base,
rxTam,
contexto
);


let score =

bt.taxa5*.38 +

bt.taxa10*.34 +

bt.taxa20*.22 +

cfg.similaridade*.06;


score +=
bt.qualidade10
.pctInterno *
.035;


/*
   FORA1 sozinho:
   pequena penalização.
*/

if(
bt.lossSeguidos === 1
){

const ultimo =
bt.timeline[
bt.timeline.length-1
];


if(
ultimo &&
ultimo.tipo === "FORA1"
){

score -= 1.5;

}

else{

score -= 4;

}

}


const diagBT =
diagnosticarLosses(
bt.timeline
);


if(
diagBT.tipo ===
"BORDA REPETIDA"
){

score -= 3;

}


else if(
diagBT.tipo ===
"MUDANÇA COERENTE"
){

score -= 7;

}


else if(
diagBT.tipo ===
"QUEBRA AMPLA"
){

score -= 10;

}


const item = {

valido:true,

rx:
rxTam,

contexto,

raioX:
cfg.raioX,

jogada:
cfg.jogada,

similaridade:
cfg.similaridade,

backtest:
bt,

diagnostico:
diagLive,

score

};


if(
!melhor ||
item.score > melhor.score
){

melhor = item;

}

}


return melhor;

}


/* ============================================================
   AUTO
============================================================ */

function escolherAuto(configs){

const lista =
RX_LIST
.map(rx=>configs[rx])
.filter(Boolean)
.filter(x=>x.valido);


if(!lista.length){
return null;
}


/*
   Score global primeiro.
   Taxas entram no desempate.
*/

lista.sort((a,b) => {

if(
b.score !==
a.score
){
return b.score-a.score;
}


if(
b.backtest.taxa5 !==
a.backtest.taxa5
){
return (
b.backtest.taxa5-
a.backtest.taxa5
);
}


if(
b.backtest.taxa10 !==
a.backtest.taxa10
){
return (
b.backtest.taxa10-
a.backtest.taxa10
);
}


return (
b.backtest.taxa20-
a.backtest.taxa20
);

});


return lista[0];

}


/* ============================================================
   SNAPSHOT
============================================================ */

function assinaturaHistorico(){

return (
historico.length+
"|" +
historico.join(",")
);

}


function snapshot(config){

if(
!config ||
!config.valido
){
return null;
}


return {

assinatura:
assinaturaHistorico(),

rx:
config.rx,

contexto:
config.contexto,

numeros:
Array.from(
config.jogada.numeros
),

centros2:
config.jogada
.blocos2
.map(x=>x.centro),

centro1:
config.jogada
.blocos1.length
? config.jogada
.blocos1[0]
.centro
: null,

trio:
config.jogada
.trioTerminais
.slice(),

hora:
Date.now()

};

}


/* ============================================================
   CLASSIFICA SNAPSHOT
============================================================ */

function classificarSnapshot(
numero,
p
){

if(!p){

return {

green:false,
tipo:"FORA",
distancia:99,
lado:0

};

}


const b2 =
(p.centros2||[])
.map(c => ({

centro:c,
qtd:2,
numeros:setor(c,2)

}));


const b1 =
p.centro1 !== null &&
p.centro1 !== undefined

? [{

centro:p.centro1,

qtd:1,

numeros:setor(
p.centro1,
1
)

}]

: [];


return classificarPorBlocos(
numero,
b2,
b1
);

}


/* ============================================================
   PENDENTES
============================================================ */

function garantirPendentes(
configs,
auto
){

const sig =
assinaturaHistorico();


RX_LIST.forEach(rx => {

const atual =
estado.pendentes[rx];


if(
atual &&
atual.assinatura === sig
){
return;
}


estado.pendentes[rx] =
snapshot(
configs[rx]
);

});


if(
!estado.pendentes.AUTO ||
estado.pendentes.AUTO
.assinatura !== sig
){

estado.pendentes.AUTO =
snapshot(auto);

}


salvarEstado();

}


function avaliarPendentes(numero){

const sigAntes =
assinaturaHistorico();


["AUTO",4,5,6]
.forEach(chave => {

const p =
estado.pendentes[chave];


if(!p){
return;
}


if(
p.assinatura !== sigAntes
){

estado.pendentes[chave] =
null;

return;

}


const r =
classificarSnapshot(
numero,
p
);


estado.timelines[chave]
.push({

resultado:
numero,

green:
r.green,

tipo:
r.tipo,

distancia:
r.distancia,

lado:
r.lado,

terminal:
terminal(numero),

regiao:
regiao(numero),

rx:
p.rx,

contexto:
p.contexto,

numeros:
p.numeros.slice(),

centros2:
p.centros2.slice(),

centro1:
p.centro1,

trio:
Array.isArray(p.trio)
? p.trio.slice()
: [],

hora:
Date.now()

});


estado.timelines[chave] =
estado.timelines[chave]
.slice(-MAX_TIMELINE);


estado.pendentes[chave] =
null;

});


salvarEstado();

}


/* ============================================================
   LIVE
============================================================ */

function statsTimeline(lista){

function taxa(arr){

if(!arr.length){
return 0;
}

return (
arr.filter(
x=>x.green
).length /
arr.length *
100
);

}


let loss = 0;


for(
let i=lista.length-1;
i>=0;
i--
){

if(lista[i].green){
break;
}

loss++;

}


return {

total:
lista.length,

taxa10:
taxa(
lista.slice(-10)
),

taxa20:
taxa(
lista.slice(-20)
),

lossSeguidos:
loss

};

}


/* ============================================================
   INSERÇÃO
============================================================ */

function adicionarNumero(numero){

avaliarPendentes(numero);

historico.push(numero);


/*
   ENTROU O 36º:
   SAI O MAIS ANTIGO.
*/

historico =
historico.slice(-35);


salvarHistorico();

render();

}


function extrairNumeros(texto){

const encontrados =
texto.match(
/\b(?:[0-9]|[12][0-9]|3[0-6])\b/g
);


if(!encontrados){
return [];
}


return encontrados
.map(Number)
.filter(n =>
n >= 0 &&
n <= 36
)
.slice(-35);

}


function inserirHistorico(){

const campo =
document.getElementById(
"entradaHistorico"
);


const numeros =
extrairNumeros(
campo.value
);


if(!numeros.length){

setStatus(
"Nenhum número válido.",
"#ff5252"
);

return;

}


/*
   Mesmo que cole 300:
   ficam somente os últimos 35.
*/

historico =
numeros.slice(-35);


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
salvarEstado();


campo.value = "";

render();

}


function apagarUltimo(){

if(!historico.length){
return;
}


historico.pop();


estado.pendentes = {
AUTO:null,
4:null,
5:null,
6:null
};


salvarHistorico();
salvarEstado();

render();

}


function apagarTudo(){

if(
!confirm(
"Apagar todo o histórico?"
)
){
return;
}


historico = [];


estado = {

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
},

ultimaEscolha:null

};


salvarHistorico();
salvarEstado();

render();

}


/* ============================================================
   INTERFACE
============================================================ */

document.body.innerHTML = "";

document.body.style.margin = "0";
document.body.style.background = "#101010";
document.body.style.color = "#fff";

document.body.style.fontFamily =
"Arial,sans-serif";


const app =
document.createElement("div");


app.innerHTML = `

<style>

*{
box-sizing:border-box
}

button,textarea{
font-family:Arial,sans-serif
}

button{
cursor:pointer;
touch-action:manipulation
}

.app{
max-width:900px;
margin:auto;
padding:6px
}

h2{
text-align:center;
margin:5px 0 9px;
font-size:21px
}

.painel{
background:#1d1d1f;
border:1px solid #444;
border-radius:10px;
padding:8px;
margin-bottom:7px
}

.titulo{
font-size:10px;
font-weight:900;
color:#aaa
}

textarea{
width:100%;
height:65px;
background:#111;
color:#fff;
border:1px solid #555;
border-radius:7px;
padding:7px
}

.acoes{
display:flex;
gap:5px;
flex-wrap:wrap;
margin-top:5px
}

.btn{
background:#333;
color:#fff;
border:1px solid #555;
border-radius:7px;
padding:7px 9px;
font-weight:900
}

.verde{
background:#146238
}

.vermelho{
background:#762832
}

.status{
font-size:10px;
font-weight:900;
color:#aaa;
margin-top:5px
}

.controle{
display:flex;
gap:4px;
align-items:center;
flex-wrap:wrap;
margin-top:5px
}

.modo{
background:#222;
border:1px solid #555;
color:#999;
border-radius:7px;
padding:7px 10px;
font-weight:900
}

.modo.ativo{
background:#007d98;
border-color:#00e5ff;
color:#fff
}

.motorGrid{
display:grid;
grid-template-columns:repeat(5,1fr);
gap:4px;
margin-top:7px
}

.motorCard{
background:#111;
border:1px solid #333;
border-radius:7px;
padding:6px;
text-align:center
}

.motorCard small{
display:block;
font-size:7px;
font-weight:900;
color:#777
}

.motorCard strong{
display:block;
font-size:13px;
margin-top:3px
}

.ok{
color:#00e676
}

.warn{
color:#ffc107
}

.bad{
color:#ff5252
}

.momento{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:4px;
margin-top:7px
}

.momentoBox{
background:#111;
border:1px solid #333;
border-radius:7px;
padding:6px;
text-align:center
}

.momentoBox small{
display:block;
font-size:7px;
color:#777;
font-weight:900
}

.momentoBox strong{
font-size:12px
}

.timelineLinha{
display:grid;
grid-template-columns:45px 1fr 48px;
gap:4px;
align-items:center;
margin-top:4px
}

.timelineNome{
font-size:10px;
font-weight:900;
text-align:center
}

.timeline{
display:flex;
gap:2px;
overflow:hidden;
justify-content:flex-end
}

.gl{
width:16px;
min-width:16px;
height:16px;
border-radius:3px;
display:flex;
align-items:center;
justify-content:center;
font-size:7px;
font-weight:900
}

.greenGL{
background:#00a651
}

.lossGL{
background:#c62828
}

.timelineTaxa{
font-size:9px;
font-weight:900;
text-align:right
}

.linha{
display:grid;
grid-template-columns:55px minmax(0,1fr);
gap:4px;
align-items:center;
margin-top:5px
}

.rotulo{
font-size:8px;
font-weight:900;
color:#888
}

.scroll{
display:flex;
gap:3px;
overflow-x:auto
}

.bola,
.regiaoBox,
.idBox{
min-width:33px;
height:33px;
display:flex;
align-items:center;
justify-content:center;
font-size:11px;
font-weight:900
}

.bola{
border-radius:50%;
border:2px solid #aaa
}

.regiaoBox{
border-radius:6px
}

.idBox{
background:#111;
border:1px solid #444;
border-radius:6px;
gap:2px
}

.idTag{
padding:5px 3px;
border-radius:4px
}

.jogadaCab{
display:flex;
justify-content:space-between;
align-items:center;
gap:5px
}

.jogadaInfo{
font-size:11px;
font-weight:900;
color:#00e5ff
}

.jogadaLinha{
display:flex;
gap:5px;
overflow-x:auto;
margin-top:6px
}

.bloco{
min-width:138px;
background:#111;
border:1px solid #00e5ff;
border-radius:8px;
padding:7px;
text-align:center
}

.bloco.um{
border-color:#ffc107
}

.bloco small{
display:block;
font-size:7px;
font-weight:900;
color:#888
}

.bloco strong{
display:block;
font-size:21px;
margin:3px
}

.nums{
border-top:1px solid #333;
padding-top:4px;
font-size:10px;
font-weight:900
}

.teclado{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:4px;
margin-top:5px
}

.numeroBtn{
height:38px;
border:1px solid #666;
border-radius:6px;
color:#fff;
font-weight:900
}

.zeroBtn{
grid-column:span 6
}

@media(max-width:650px){

.motorGrid{
grid-template-columns:repeat(3,1fr)
}

.momento{
grid-template-columns:repeat(2,1fr)
}

.timelineLinha{
grid-template-columns:39px 1fr 43px
}

.gl{
width:14px;
min-width:14px;
height:14px
}

}

</style>


<div class="app">

<h2>Análise 0 • 6 • 9</h2>


<section class="painel">

<textarea
id="entradaHistorico"
placeholder="Cole o histórico — serão usados somente os últimos 35"
></textarea>

<div class="acoes">

<button
id="btnInserir"
class="btn verde">
Inserir histórico
</button>

<button
id="btnApagarUltimo"
class="btn">
Apagar último
</button>

<button
id="btnApagarTudo"
class="btn vermelho">
Apagar tudo
</button>

</div>

<div
id="statusArea"
class="status">
Pronto.
</div>

</section>


<section class="painel">

<div class="titulo">
MOTOR
</div>

<div class="controle">

<button id="auto" class="modo">
AUTO
</button>

<button id="rx4" class="modo">
4
</button>

<button id="rx5" class="modo">
5
</button>

<button id="rx6" class="modo">
6
</button>

</div>


<div
id="motorGrid"
class="motorGrid">
</div>


<div
id="momento"
class="momento">
</div>


<div
style="margin-top:8px"
class="titulo">
LINHA DO TEMPO REAL
</div>

<div
id="timelineAUTO"
class="timelineLinha">
</div>

<div
id="timeline4"
class="timelineLinha">
</div>

<div
id="timeline5"
class="timelineLinha">
</div>

<div
id="timeline6"
class="timelineLinha">
</div>

</section>


<section class="painel">

<div class="titulo">
ÚLTIMOS 14
</div>


<div class="linha">

<div class="rotulo">
ROLETA
</div>

<div
id="linhaRoleta"
class="scroll">
</div>

</div>


<div class="linha">

<div class="rotulo">
ZONA
</div>

<div
id="linhaRegiao"
class="scroll">
</div>

</div>


<div class="linha">

<div class="rotulo">
ID
</div>

<div
id="linhaID"
class="scroll">
</div>

</div>

</section>


<section class="painel">

<div class="jogadaCab">

<div class="titulo">
JOGADA SUGERIDA
</div>

<div
id="jogadaInfo"
class="jogadaInfo">
—
</div>

</div>

<div id="jogadaArea">
</div>

</section>


<section class="painel">

<div class="titulo">
TECLADO 0–36
</div>

<div
id="teclado"
class="teclado">
</div>

</section>

</div>

`;


document.body.appendChild(app);


const statusArea =
document.getElementById(
"statusArea"
);


const jogadaArea =
document.getElementById(
"jogadaArea"
);


const jogadaInfo =
document.getElementById(
"jogadaInfo"
);


/* ============================================================
   STATUS
============================================================ */

function setStatus(
texto,
cor="#aaa"
){

statusArea.textContent =
texto;

statusArea.style.color =
cor;

}


/* ============================================================
   TECLADO
============================================================ */

const teclado =
document.getElementById(
"teclado"
);


for(
let numero=1;
numero<=36;
numero++
){

const btn =
document.createElement(
"button"
);


btn.className =
"numeroBtn";


btn.textContent =
numero;


btn.style.background =
corRoleta(numero);


btn.onclick = () =>
adicionarNumero(numero);


teclado.appendChild(btn);

}


const zero =
document.createElement(
"button"
);


zero.className =
"numeroBtn zeroBtn";


zero.textContent =
"0";


zero.style.background =
"#087c48";


zero.onclick = () =>
adicionarNumero(0);


teclado.appendChild(zero);


/* ============================================================
   BOTÕES
============================================================ */

document
.getElementById("btnInserir")
.onclick =
inserirHistorico;


document
.getElementById("btnApagarUltimo")
.onclick =
apagarUltimo;


document
.getElementById("btnApagarTudo")
.onclick =
apagarTudo;


document
.getElementById("auto")
.onclick = () => {

estado.modo =
"AUTO";

salvarEstado();

render();

};


RX_LIST.forEach(rx => {

document
.getElementById("rx"+rx)
.onclick = () => {

estado.modo =
"MANUAL";

estado.manualRX =
rx;

salvarEstado();

render();

};

});


/* ============================================================
   TIMELINE
============================================================ */

function renderTimeline(
id,
nome,
lista
){

const area =
document.getElementById(id);


const ultimos =
lista.slice(-20);


const st =
statsTimeline(lista);


area.innerHTML =

'<div class="timelineNome">'+
nome+
'</div>'+

'<div class="timeline">'+

ultimos.map(x =>

'<span class="gl '+
(
x.green
? "greenGL"
: "lossGL"
)+
'" title="'+
x.resultado+
' • '+
x.tipo+
'">'+
(
x.green
? "G"
: "L"
)+
'</span>'

).join("")+

'</div>'+

'<div class="timelineTaxa">'+
(
st.total
? st.taxa20.toFixed(0)+"%"
: "—"
)+
'</div>';

}


/* ============================================================
   MOMENTO VISUAL

   NÃO MOSTRA ALTO/BAIXO.
   NÃO MOSTRA RX MAIS FORTE.
============================================================ */

function renderMomento(){

const m =
analisarMomento(
historico
);


const trio =
m.trioTerminais.trio
.map(t=>"T"+t)
.join(" • ");


const z =
m.zonas;


const corredor =
m.corredores.principal;


const padraoZona =
z.pctAlternancia >= 60

? "ALTERNANDO"

: (
z.sequenciaAtual >= 2
? "REPETINDO"
: "MISTO"
);


const corredorTexto =
corredor

? corredor.centro+
" • "+
corredor.perfil

: "—";


const diag =
diagnosticarLosses(
estado.timelines.AUTO
);


document
.getElementById("momento")
.innerHTML =

'<div class="momentoBox">'+
'<small>TRIO • 14</small>'+
'<strong>'+
(trio || "—")+
'</strong>'+
'<div style="font-size:8px;margin-top:3px;color:#00e676">'+
m.trioTerminais
.taxa14
.toFixed(0)+
'%</div>'+
'</div>'+


'<div class="momentoBox">'+
'<small>ZONAS</small>'+
'<strong>'+
padraoZona+
'</strong>'+
'<div style="font-size:8px;margin-top:3px;color:#aaa">'+
(z.dominante || "—")+
'</div>'+
'</div>'+


'<div class="momentoBox">'+
'<small>CORREDOR ±5</small>'+
'<strong>'+
corredorTexto+
'</strong>'+
'<div style="font-size:8px;margin-top:3px;color:#aaa">'+
(
corredor
? corredor.taxa.toFixed(0)+"%"
: "—"
)+
'</div>'+
'</div>'+


'<div class="momentoBox">'+
'<small>ÚLTIMO LOSS</small>'+
'<strong>'+
diag.tipo+
'</strong>'+
'<div style="font-size:8px;margin-top:3px;color:#aaa">'+
(
diag.seq
? diag.seq+" LOSS"
: "SEM QUEBRA"
)+
'</div>'+
'</div>';

}


/* ============================================================
   ÚLTIMOS 14
============================================================ */

function render14(){

const janela =
historico.slice(-14);


document
.getElementById("linhaRoleta")
.innerHTML =

janela.map(n =>

'<div class="bola" style="background:'+
corRoleta(n)+
'">'+
n+
'</div>'

).join("");


document
.getElementById("linhaRegiao")
.innerHTML =

janela.map(n => {

const r =
regiao(n);


return (

'<div class="regiaoBox" style="background:'+
(
r
? coresRegioes[r]
: "#555"
)+
'" title="'+
(r || "")+
'">'+
n+
'</div>'

);

}).join("");


document
.getElementById("linhaID")
.innerHTML =

janela.map(n => {

const ids =
idsQueBatem(n);


if(!ids.length){

return (
'<div class="idBox">—</div>'
);

}


return (

'<div class="idBox">'+

ids.map(id =>

'<span class="idTag" style="background:'+
corId(id)+
'">'+
id+
'</span>'

).join("")+

'</div>'

);

}).join("");

}


/* ============================================================
   MOTOR VISUAL
============================================================ */

function classeTaxa(t){

if(t >= 90){
return "ok";
}

if(t >= 80){
return "warn";
}

return "bad";

}


function renderMotor(auto){

const area =
document.getElementById(
"motorGrid"
);


if(!auto){

area.innerHTML =

'<div class="motorCard">'+
'<small>STATUS</small>'+
'<strong>AGUARDANDO</strong>'+
'</div>';

return;

}


const live =
statsTimeline(
estado.timelines.AUTO
);


const diag =
diagnosticarLosses(
estado.timelines.AUTO
);


const momento =
analisarMomento(
historico
);


const principal =
momento.corredores.principal;


area.innerHTML =

'<div class="motorCard">'+
'<small>BT 10</small>'+
'<strong class="'+
classeTaxa(
auto.backtest.taxa10
)+
'">'+
auto.backtest.taxa10.toFixed(0)+
'%</strong>'+
'</div>'+


'<div class="motorCard">'+
'<small>BT 20</small>'+
'<strong class="'+
classeTaxa(
auto.backtest.taxa20
)+
'">'+
auto.backtest.taxa20.toFixed(0)+
'%</strong>'+
'</div>'+


'<div class="motorCard">'+
'<small>REAL 10</small>'+
'<strong class="'+
classeTaxa(
live.taxa10
)+
'">'+
(
live.total
? live.taxa10.toFixed(0)+"%"
: "—"
)+
'</strong>'+
'</div>'+


'<div class="motorCard">'+
'<small>CORREDOR</small>'+
'<strong>'+
(
principal
? principal.centro
: "—"
)+
'</strong>'+
'</div>'+


'<div class="motorCard">'+
'<small>LOSS</small>'+
'<strong style="font-size:9px">'+
diag.tipo+
'</strong>'+
'</div>';

}


/* ============================================================
   CONTROLE
============================================================ */

function renderControle(){

[
"auto",
"rx4",
"rx5",
"rx6"
]
.forEach(id => {

const el =
document.getElementById(id);

el.classList.remove(
"ativo"
);

});


if(
estado.modo === "AUTO"
){

document
.getElementById("auto")
.classList.add("ativo");

}

else{

document
.getElementById(
"rx"+estado.manualRX
)
.classList.add("ativo");

}

}


/* ============================================================
   JOGADA
============================================================ */

function renderJogada(config){

if(
!config ||
!config.valido
){

jogadaInfo.textContent =
"AGUARDANDO";


jogadaArea.innerHTML =

'<div style="color:#777;padding:8px">'+
'Histórico insuficiente.'+
'</div>';

return;

}


const trio =
config.jogada
.trioTerminais
.map(t=>"T"+t)
.join(" • ");


jogadaInfo.textContent =

trio+
" • "+
config.jogada
.trioTaxa14
.toFixed(0)+
"%";


const linha2 =
config.jogada
.blocos2
.map(b =>

'<div class="bloco">'+
'<small>2 VIZINHOS DO</small>'+
'<strong>'+
b.centro+
'</strong>'+
'<div class="nums">'+
b.numeros.join(" • ")+
'</div>'+
'</div>'

).join("");


const linha1 =
config.jogada
.blocos1
.map(b =>

'<div class="bloco um">'+
'<small>1 VIZINHO DO</small>'+
'<strong>'+
b.centro+
'</strong>'+
'<div class="nums">'+
b.numeros.join(" • ")+
'</div>'+
'</div>'

).join("");


jogadaArea.innerHTML =

'<div class="jogadaLinha">'+
linha2+
'</div>'+

'<div class="jogadaLinha">'+
linha1+
'</div>';

}


/* ============================================================
   RENDER PRINCIPAL
============================================================ */

let renderToken = 0;


function render(){

/*
   PROTEÇÃO FINAL:
   motor nunca mantém > 35.
*/

historico =
historico.slice(-35);


salvarHistorico();


const token =
++renderToken;


render14();

renderMomento();


renderTimeline(
"timelineAUTO",
"AUTO",
estado.timelines.AUTO
);


renderTimeline(
"timeline4",
"RX4",
estado.timelines[4]
);


renderTimeline(
"timeline5",
"RX5",
estado.timelines[5]
);


renderTimeline(
"timeline6",
"RX6",
estado.timelines[6]
);


setStatus(

historico.length
? "Calculando últimos 35..."
: "Pronto.",

"#00e5ff"

);


setTimeout(() => {

if(token !== renderToken){
return;
}


try{

const base =
historico.slice(-35);


const configs = {};


RX_LIST.forEach(rx => {

configs[rx] =
melhorDoRX(
base,
rx
);

});


const auto =
escolherAuto(
configs
);


garantirPendentes(
configs,
auto
);


const ativa =
estado.modo === "AUTO"

? auto

: configs[
estado.manualRX
];


const momento =
analisarMomento(base);


const diag =
diagnosticarLosses(
estado.timelines.AUTO
);


estado.ultimaEscolha =

auto

? {

rxInterno:
auto.rx,

contexto:
auto.contexto,

bt10:
auto.backtest.taxa10,

bt20:
auto.backtest.taxa20,

trio:
momento
.trioTerminais
.trio
.slice(),

trioTaxa:
momento
.trioTerminais
.taxa14,

zona:
momento
.zonas
.dominante,

alternanciaZona:
momento
.zonas
.pctAlternancia,

corredorPrincipal:
momento.corredores.principal
? momento.corredores.principal.centro
: null,

corredorPerfil:
momento.corredores.principal
? momento.corredores.principal.perfil
: null,

corredorTaxa:
momento.corredores.principal
? momento.corredores.principal.taxa
: 0,

diagnostico:
diag.tipo

}

: null;


salvarEstado();


renderControle();

renderMotor(auto);

renderJogada(ativa);


setStatus(

base.length+
"/35 números • "+
"momento 14 • "+
"trio + zonas + corredores ±5 ativos.",

"#00e676"

);


/*
   Informações completas ficam
   disponíveis no console sem
   poluir a tela.
*/

console.log(
"ANALISADOR 0/6/9 V11.1",
{

BASE35:
base,

MOMENTO14:
momento,

CORREDORES:
momento.corredores.ranking,

RX4:
configs[4],

RX5:
configs[5],

RX6:
configs[6],

AUTO:
auto,

LOSS:
diag

}
);


}catch(e){

console.error(e);


setStatus(

"Erro: "+
(
e && e.message
? e.message
: String(e)
),

"#ff5252"

);

}

},0);

}


/* ============================================================
   START
============================================================ */

render();

})();
