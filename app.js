(function(){
"use strict";

/* ============================================================
   ANÁLISE BETA

   2 MOTORES INDEPENDENTES
   ------------------------------------------------------------
   NORMAL:
   - RX4
   - RX5
   - RX6
   - SEM OFFSET GLOBAL

   DINÂMICO:
   - RX4
   - RX5
   - RX6
   - OFFSET GLOBAL -2 / -1 / 0 / +1 / +2

   AUTO:
   - ÚNICO
   - COMPARA OS 6 CANDIDATOS
   - ESCOLHE UMA ÚNICA JOGADA

   LINHAS REAIS:
   - AUTO
   - NORMAL RX4
   - NORMAL RX5
   - NORMAL RX6
   - DINÂMICO RX4
   - DINÂMICO RX5
   - DINÂMICO RX6

   SELEÇÃO MANUAL:
   - AUTO
   - NORMAL 4 / 5 / 6
   - DINÂMICO 4 / 5 / 6

   G1:
   - GREEN DE PRIMEIRA LIBERA
   - LOSS CONGELA EXATAMENTE A JOGADA
   - PRÓXIMO RESULTADO É G1 DA MESMA JOGADA
   - APÓS G1 LIBERA NOVA JOGADA
============================================================ */


/* ============================================================
   STORAGE
============================================================ */

const STORAGE_KEY =
"ANALISADOR_069_IDS_CORRESPONDENTES_V1";

const STORAGE_ENGINE =
"ANALISE_BETA_MOTOR_DUPLO_INDEPENDENTE_V1";

const STORAGE_DUPLAS =
"ANALISE_BETA_DUPLAS_VISUAIS_V1";

const STORAGE_FREEZE =
"ANALISE_BETA_JOGADA_CONGELADA_V1";

const STORAGE_OFFSET =
"ANALISADOR_069_OFFSET_GLOBAL_CENTROS_V2";


/* ============================================================
   CONSTANTES
============================================================ */

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


/* ============================================================
   REGIÕES
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


/* ============================================================
   DÚZIAS
============================================================ */

function duzia(numero){

if(numero>=1 && numero<=12)
return 1;

if(numero>=13 && numero<=24)
return 2;

if(numero>=25 && numero<=36)
return 3;

return 0;

}


/* ============================================================
   MAPA FÍSICO DAS DÚZIAS
============================================================ */

const MAPA_DUZIA_FISICA = {

1:new Map([
[3,1.00],
[12,1.00],
[7,.95],
[4,.92],
[2,.92],
[11,.82],
[8,.86],
[5,.86],
[6,.40],
[1,.36],
[9,.36],
[10,.58]
]),

2:new Map([
[15,1.00],
[19,1.00],
[21,.98],
[17,.70],
[13,.72],
[23,.96],
[24,.94],
[16,.94],
[14,.88],
[20,.88],
[18,.92]
]),

3:new Map([
[29,1.00],
[30,1.00],
[32,.96],
[25,.94],
[27,.88],
[28,.92],
[26,.80],
[35,.72],
[36,.68],
[34,.64],
[33,.42],
[31,.40]
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

const i = indice(centro);

if(i<0)
return centro;

return track[
(i+offset+37)%37
];

}


function setor(centro,qtd){

const i = indice(centro);

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

return Math.min(
d,
37-d
);

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

if(regioes.ZERO.has(n))
return "ZERO";

if(regioes.VOISINS.has(n))
return "VOISINS";

if(regioes.ORPHELINS.has(n))
return "ORPHELINS";

if(regioes.TIERS.has(n))
return "TIERS";

return null;

}


function tipoCor(n){

if(n===0)
return "VERDE";

return vermelhos.has(n)
?"VERMELHO"
:"PRETO";

}


function corRoleta(n){

if(n===0)
return "#087c48";

return vermelhos.has(n)
?"#c6283d"
:"#181818";

}


/* ============================================================
   IDS / FAMÍLIAS
============================================================ */

const coberturaIds={};

BASES.forEach(base=>{

coberturaIds[base]=
new Set(
vizinhos(base,1)
);

});


function familia(id){

if(
id===0 ||
id===10 ||
id===20 ||
id===30
)
return 0;

if(
id===6 ||
id===16 ||
id===26 ||
id===36
)
return 6;

if(
id===9 ||
id===19 ||
id===29 ||
id===39
)
return 9;

return null;

}


function idsQueBatem(numero){

const ids=[];

BASES.forEach(base=>{

if(
coberturaIds[base].has(numero)
)
ids.push(base);

});

if(
Object.prototype.hasOwnProperty.call(
ESPECIAIS,
numero
)
){

ESPECIAIS[numero]
.forEach(id=>{

if(!ids.includes(id))
ids.push(id);

});

}

return ids;

}


function eventoNumero(numero){

const fs=new Set(

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
   HISTÓRICO
============================================================ */

function carregarHistorico(){

try{

const raw=
localStorage.getItem(
STORAGE_KEY
);

if(!raw)
return [];

const arr=
JSON.parse(raw);

if(!Array.isArray(arr))
return [];

return limitar35(

arr
.map(Number)
.filter(n=>
Number.isInteger(n) &&
n>=0 &&
n<=36
)

);

}catch(e){

return [];

}

}


let historico=
carregarHistorico();


/* ============================================================
   TIMELINES INDEPENDENTES
============================================================ */

function timelinesVazias(){

return {

AUTO:[],

NORMAL:{
4:[],
5:[],
6:[]
},

DINAMICO:{
4:[],
5:[],
6:[]
}

};

}


function pendentesVazios(){

return {

AUTO:null,

NORMAL:{
4:null,
5:null,
6:null
},

DINAMICO:{
4:null,
5:null,
6:null
}

};

}


/* ============================================================
   ESTADO
============================================================ */

let estado={

modo:"AUTO",

motorManual:"NORMAL",

manualRX:6,

timelines:
timelinesVazias(),

pendentes:
pendentesVazios()

};


function carregarEstado(){

try{

const raw=
localStorage.getItem(
STORAGE_ENGINE
);

if(!raw)
return;

const x=
JSON.parse(raw);


if(
x.modo==="AUTO" ||
x.modo==="MANUAL"
)
estado.modo=x.modo;


if(
x.motorManual==="NORMAL" ||
x.motorManual==="DINAMICO"
)
estado.motorManual=x.motorManual;


if(
RX_LIST.includes(x.manualRX)
)
estado.manualRX=x.manualRX;


if(x.timelines){

if(
Array.isArray(
x.timelines.AUTO
)
)
estado.timelines.AUTO=
x.timelines.AUTO
.slice(-MAX_TIMELINE);


["NORMAL","DINAMICO"]
.forEach(motor=>{

if(!x.timelines[motor])
return;

RX_LIST.forEach(rx=>{

if(
Array.isArray(
x.timelines[motor][rx]
)
){

estado.timelines[motor][rx]=
x.timelines[motor][rx]
.slice(-MAX_TIMELINE);

}

});

});

}


if(x.pendentes){

if(
Object.prototype.hasOwnProperty.call(
x.pendentes,
"AUTO"
)
)
estado.pendentes.AUTO=
x.pendentes.AUTO;


["NORMAL","DINAMICO"]
.forEach(motor=>{

if(!x.pendentes[motor])
return;

RX_LIST.forEach(rx=>{

if(
Object.prototype.hasOwnProperty.call(
x.pendentes[motor],
rx
)
)
estado.pendentes[motor][rx]=
x.pendentes[motor][rx];

});

});

}

}catch(e){}

}


carregarEstado();


function salvarHistorico(){

historico=
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
   OFFSET EXCLUSIVO DO MOTOR DINÂMICO
============================================================ */

let offsetCentroAtual=0;


function carregarOffsetCentro(){

try{

const raw=
localStorage.getItem(
STORAGE_OFFSET
);

if(raw===null)
return;

const n=Number(raw);

if(
Number.isInteger(n) &&
n>=-2 &&
n<=2
)
offsetCentroAtual=n;

}catch(e){}

}


function salvarOffsetCentro(){

try{

localStorage.setItem(
STORAGE_OFFSET,
String(offsetCentroAtual)
);

}catch(e){}

}


carregarOffsetCentro();


/* ============================================================
   VISUAL
============================================================ */

let duplasVisual=[];


function carregarDuplasVisual(){

try{

const raw=
localStorage.getItem(
STORAGE_DUPLAS
);

if(!raw)
return;

const arr=
JSON.parse(raw);

if(Array.isArray(arr))
duplasVisual=
arr.slice(-14);

}catch(e){}

}


function salvarDuplasVisual(){

duplasVisual=
duplasVisual.slice(-14);

try{

localStorage.setItem(
STORAGE_DUPLAS,
JSON.stringify(duplasVisual)
);

}catch(e){}

}


carregarDuplasVisual();


/* ============================================================
   JOGADA VISÍVEL CONGELADA
============================================================ */

let jogadaCongelada=null;


function salvarJogadaCongelada(){

try{

localStorage.setItem(
STORAGE_FREEZE,
JSON.stringify(jogadaCongelada)
);

}catch(e){}

}


function carregarJogadaCongelada(){

try{

const raw=
localStorage.getItem(
STORAGE_FREEZE
);

if(!raw)
return;

const x=
JSON.parse(raw);

if(
x &&
x.valido &&
x.jogada
)
jogadaCongelada=x;

}catch(e){}

}


carregarJogadaCongelada();


/* ============================================================
   TERMINAIS
============================================================ */

function analisarTerminais(base){

const janela=
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

const tn=terminal(n);

const recencia=
.50+
((i+1)/
Math.max(1,janela.length))
*.50;

if(tn===t){

direto++;
score+=2.20*recencia;

if(i>=janela.length-5){

direto5++;
score+=.95;

}

}else if(

tn===terminalAnterior(t) ||
tn===terminalSeguinte(t)

){

vizinho++;
score+=.62*recencia;

if(i>=janela.length-5){

vizinho5++;
score+=.20;

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


const trio=
ranking
.slice(0,3)
.map(x=>x.terminal);


let cobertura=0;

janela.forEach(n=>{

const t=terminal(n);

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


function scoreTerminalNumero(
numero,
momento
){

const trio=
momento.terminais.trio;

if(!trio.length)
return 0;

const t=
terminal(numero);

if(t===trio[0])
return 1;

if(t===trio[1])
return .88;

if(t===trio[2])
return .78;

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

const janela=
limitar35(base)
.slice(-JANELA_MOMENTO);

const contagem={
VERMELHO:0,
PRETO:0,
VERDE:0
};

janela.forEach(n=>{

contagem[
tipoCor(n)
]++;

});


let alternancias=0;

for(
let i=1;
i<janela.length;
i++
){

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
?tipoCor(
janela[janela.length-1]
)
:null,

pctAlternancia:
janela.length>1
?alternancias/(janela.length-1)*100
:0

};

}


function scoreCorNumero(
numero,
momento
){

const info=
momento.cores;

const total=
Math.max(
1,
momento.janela.length
);

const cor=
tipoCor(numero);

let score=
info.contagem[cor]/
total;


if(
info.pctAlternancia>=60 &&
info.ultima
){

if(
info.ultima==="VERMELHO" &&
cor==="PRETO"
)
score+=.18;

else if(
info.ultima==="PRETO" &&
cor==="VERMELHO"
)
score+=.18;

}

return score;

}


/* ============================================================
   ZONAS
============================================================ */

function analisarZonas(base){

const janela=
limitar35(base)
.slice(-JANELA_MOMENTO);

const seq=
janela.map(regiao);

const contagem={
ZERO:0,
VOISINS:0,
ORPHELINS:0,
TIERS:0
};

seq.forEach(z=>{

if(z)
contagem[z]++;

});


const transicoes={

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


let alternancias=0;

for(
let i=1;
i<seq.length;
i++
){

if(seq[i]!==seq[i-1])
alternancias++;

if(
seq[i-1] &&
seq[i]
)
transicoes[
seq[i-1]
][
seq[i]
]++;

}


const atual=
seq.length
?seq[seq.length-1]
:null;


let repeticaoAtual=0;

if(atual){

for(
let i=seq.length-1;
i>=0;
i--
){

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


function scoreZonaNumero(
numero,
momento
){

const info=
momento.zonas;

const z=
regiao(numero);

if(!z)
return 0;

const total=
Math.max(
1,
momento.janela.length
);

let score=
info.contagem[z]/
total;


if(info.atual){

const linha=
info.transicoes[
info.atual
];

const soma=
Object.values(linha)
.reduce(
(a,b)=>a+b,
0
);

if(soma){

score+=
((linha[z]||0)/soma)
*.45;

}

}


if(
z===info.atual &&
info.repeticaoAtual>=2
)
score+=.10;

return score;

}


/* ============================================================
   CONCENTRAÇÃO FÍSICA DAS DÚZIAS
============================================================ */

function analisarDuziasFisicas(base){

const janela=
limitar35(base)
.slice(-JANELA_MOMENTO);

const forca={
1:0,
2:0,
3:0
};

const contagem={
1:0,
2:0,
3:0
};

const calor=
new Map();

track.forEach(n=>
calor.set(n,0)
);


janela.forEach((numero,i)=>{

const d=
duzia(numero);

if(d)
contagem[d]++;

const recencia=
.45+
((i+1)/
Math.max(1,janela.length))
*.55;


if(d){

const mapa=
MAPA_DUZIA_FISICA[d];

const estrutural=
mapa &&
mapa.has(numero)
?mapa.get(numero)
:.55;

forca[d]+=
recencia*
(.55+.45*estrutural);

}


track.forEach(alvo=>{

const dist=
distanciaRoda(
numero,
alvo
);

let peso=0;

if(dist===0)
peso=1;

else if(dist===1)
peso=.72;

else if(dist===2)
peso=.46;

else if(dist===3)
peso=.26;

else if(dist===4)
peso=.12;

else if(dist===5)
peso=.05;


if(peso){

calor.set(
alvo,
(calor.get(alvo)||0)+
peso*recencia
);

}

});

});


const confluencia={
1:0,
2:0,
3:0
};


[1,2,3]
.forEach(d=>{

const mapa=
MAPA_DUZIA_FISICA[d];

let soma=0;
let pesoTotal=0;

mapa.forEach(
(peso,numero)=>{

soma+=
(calor.get(numero)||0)*
peso;

pesoTotal+=peso;

});

confluencia[d]=
pesoTotal
?soma/pesoTotal
:0;

});


const maxForca=
Math.max(
forca[1],
forca[2],
forca[3],
.0001
);


const maxConfluencia=
Math.max(
confluencia[1],
confluencia[2],
confluencia[3],
.0001
);


const ranking=

[1,2,3]
.map(d=>{

const frequencia=
janela.length
?contagem[d]/janela.length
:0;

const momento=
forca[d]/
maxForca;

const fisica=
confluencia[d]/
maxConfluencia;

const score=
frequencia*.35+
fisica*.45+
momento*.20;

return {
duzia:d,
contagem:contagem[d],
frequencia,
momento,
fisica,
score
};

})
.sort(
(a,b)=>
b.score-a.score
);


return {

janela,
calor,
forca,
contagem,
confluencia,
ranking,

dominante:
ranking[0]||null,

segunda:
ranking[1]||null

};

}


function scoreDuziaFisicaNumero(
numero,
momento
){

const analise=
momento.duziasFisicas;

if(!analise)
return 0;

const d=
duzia(numero);

if(!d)
return 0;

const item=
analise.ranking.find(
x=>x.duzia===d
);

if(!item)
return 0;

const mapa=
MAPA_DUZIA_FISICA[d];

const estrutural=
mapa &&
mapa.has(numero)
?mapa.get(numero)
:.48;


const calorAtual=
analise.calor.get(numero)||0;


let maxCalor=0;

analise.calor.forEach(v=>{

if(v>maxCalor)
maxCalor=v;

});


const calorNorm=
maxCalor
?calorAtual/maxCalor
:0;


let proximidade=0;

if(mapa){

mapa.forEach(
(peso,alvo)=>{

const dist=
distanciaRoda(
numero,
alvo
);

let p=0;

if(dist===0)
p=1;

else if(dist===1)
p=.78;

else if(dist===2)
p=.52;

else if(dist===3)
p=.28;

else if(dist===4)
p=.12;

p*=peso;

if(p>proximidade)
proximidade=p;

});

}


return (

item.score*.44+
estrutural*.22+
calorNorm*.22+
proximidade*.12

);

}


/* ============================================================
   CORREDORES
============================================================ */

function analisarCorredores(base){

const janela=
limitar35(base)
.slice(-JANELA_MOMENTO);

const ranking=[];


track.forEach(centro=>{

let dentro=0;
let miolo=0;
let lateral=0;
let ponta=0;

let esquerda=0;
let direita=0;

let score=0;


janela.forEach(
(numero,i)=>{

const delta=
deltaRoda(
centro,
numero
);

const d=
Math.abs(delta);

if(d>5)
return;

dentro++;

const recencia=
.50+
((i+1)/
Math.max(1,janela.length))
*.50;


if(d<=1){

miolo++;
score+=recencia;

}else if(d<=3){

lateral++;
score+=.92*recencia;

}else{

ponta++;
score+=.86*recencia;

}


if(delta<0)
esquerda++;

else if(delta>0)
direita++;

});


let perfil="MIOLO";

if(
ponta>miolo &&
ponta>=lateral
)
perfil="PONTA";

else if(
lateral>miolo
)
perfil="LATERAL";


let direcao=0;

if(
direita>esquerda+1
)
direcao=1;

else if(
esquerda>direita+1
)
direcao=-1;


ranking.push({

centro,
dentro,

taxa:
janela.length
?dentro/janela.length*100
:0,

miolo,
lateral,
ponta,
esquerda,
direita,
direcao,
perfil,
score

});

});


ranking.sort(
(a,b)=>

b.score-a.score ||

b.dentro-a.dentro
);


return {

ranking,

fortes:
ranking.slice(0,5),

principal:
ranking[0]||null

};

}


function scoreCorredorNumero(
numero,
momento
){

const fortes=
momento.corredores.fortes;

if(!fortes.length)
return 0;

let score=0;


fortes.forEach((c,pos)=>{

const delta=
deltaRoda(
c.centro,
numero
);

const d=
Math.abs(delta);

if(d>5)
return;

const rankingPeso=
[1,.78,.60,.46,.34][pos];

const confianca=
c.taxa/100;

let local=0;


if(c.perfil==="PONTA"){

if(d>=4)
local=1;

else if(d===3)
local=.72;

else if(d===2)
local=.50;

else
local=.34;

}else if(
c.perfil==="LATERAL"
){

if(
d===2 ||
d===3
)
local=1;

else if(d===4)
local=.70;

else if(d===1)
local=.62;

else
local=.45;

}else{

if(d<=1)
local=1;

else if(d===2)
local=.72;

else if(d===3)
local=.48;

else
local=.28;

}


if(
c.direcao!==0 &&
Math.sign(delta)===
c.direcao
)
local*=1.08;


score+=
rankingPeso*
confianca*
local;

});


return score;

}


/* ============================================================
   DENSIDADE
============================================================ */

function analisarDensidade(base){

const janela=
limitar35(base)
.slice(-JANELA_MOMENTO);

const mapa=
new Map();

track.forEach(n=>
mapa.set(n,0)
);


janela.forEach((numero,i)=>{

const recencia=
.50+
((i+1)/
Math.max(1,janela.length))
*.50;


track.forEach(alvo=>{

const d=
distanciaRoda(
numero,
alvo
);

let peso=0;

if(d===0)
peso=1;

else if(d===1)
peso=.68;

else if(d===2)
peso=.40;

else if(d===3)
peso=.20;

else if(d===4)
peso=.08;


if(peso){

mapa.set(
alvo,
(mapa.get(alvo)||0)+
peso*recencia
);

}

});

});


const ranking=
track
.map(n=>({
numero:n,
score:mapa.get(n)||0
}))
.sort(
(a,b)=>
b.score-a.score
);


return {

mapa,
ranking,

centro:
ranking.length
?ranking[0].numero
:null

};

}


/* ============================================================
   MOMENTO
============================================================ */

function analisarMomento(base){

base=
limitar35(base);

return {

janela:
base.slice(-14),

terminais:
analisarTerminais(base),

cores:
analisarCores(base),

zonas:
analisarZonas(base),

corredores:
analisarCorredores(base),

densidade:
analisarDensidade(base),

duziasFisicas:
analisarDuziasFisicas(base)

};

}


function scoreMomentoNumero(
numero,
momento
){

const scoreBase=(

scoreTerminalNumero(
numero,
momento
)*.31+

scoreCorNumero(
numero,
momento
)*.10+

scoreZonaNumero(
numero,
momento
)*.13+

scoreCorredorNumero(
numero,
momento
)*.30+

(
momento.densidade.mapa
.get(numero)||0
)*.055

);


const scoreDuzia=
scoreDuziaFisicaNumero(
numero,
momento
);


return (

scoreBase+

scoreDuzia*
PESO_DUZIA_FISICA

);

}


function direcaoMomento(
centro,
momento
){

let esquerda=0;
let direita=0;


momento.janela
.forEach((numero,i)=>{

const delta=
deltaRoda(
centro,
numero
);

const d=
Math.abs(delta);

if(d>7)
return;

const recencia=
.55+
((i+1)/
Math.max(
1,
momento.janela.length
))
*.45;


const proximidade=
Math.max(
0,
1-d/8
);


const peso=
recencia*
proximidade;


if(delta<0)
esquerda+=peso;

else if(delta>0)
direita+=peso;

});


const total=
esquerda+direita;


if(!total){

return {
direcao:0,
forca:0
};

}


return {

direcao:
direita>esquerda
?1
:(esquerda>direita?-1:0),

forca:
Math.abs(
direita-esquerda
)/
total

};

}


/* ============================================================
   RX
============================================================ */

function construirCache(base){

const eventos=
new Uint8Array(
base.length
);

for(
let i=0;
i<base.length;
i++
)
eventos[i]=
eventoNumero(
base[i]
);

return {
base,
eventos
};

}


function similaridadeJanelas(
cache,
a,
b,
tamanho
){

let iguais=0;
let erro=0;

let a0=0,a6=0,a9=0;
let b0=0,b6=0,b9=0;


for(
let k=0;
k<tamanho;
k++
){

const ea=
cache.eventos[a+k];

const eb=
cache.eventos[b+k];

if(ea===eb)
iguais++;


if(ea&1)a0++;
if(ea&2)a6++;
if(ea&4)a9++;

if(eb&1)b0++;
if(eb&2)b6++;
if(eb&4)b9++;


erro+=
Math.abs(a0-b0);

erro+=
Math.abs(a6-b6);

erro+=
Math.abs(a9-b9);

}


const eventos=
iguais/tamanho*100;


const maxErro=
tamanho*tamanho*3;


const forma=
Math.max(
0,
1-erro/maxErro
)*100;


return (
eventos*.80+
forma*.20
);

}


function analisarRX(
base,
rx
){

base=
limitar35(base);


if(
base.length<
rx*2+4
){

return {

valido:false,
rx,
replicas:[],
rankingIds:[],
similaridade:0

};

}


const cache=
construirCache(base);

const atualInicio=
base.length-rx;

const candidatos=[];


for(
let i=0;
i+rx<atualInicio;
i++
){

const proximo=
base[i+rx];

if(
proximo===undefined
)
continue;


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
(a,b)=>

b.similaridade-a.similaridade ||

b.inicio-a.inicio
);


if(!candidatos.length){

return {

valido:false,
rx,
replicas:[],
rankingIds:[],
similaridade:0

};

}


let qtd=
Math.ceil(
candidatos.length*.10
);

qtd=
Math.max(
4,
qtd
);

qtd=
Math.min(
qtd,
MAX_REPLICAS,
candidatos.length
);


const replicas=
candidatos.slice(
0,
qtd
);


const contagem=
new Map();

TODOS_IDS.forEach(
id=>contagem.set(id,0)
);


function contar(rep){

idsQueBatem(
rep.proximo
)
.forEach(id=>{

contagem.set(
id,
(contagem.get(id)||0)+1
);

});

}


replicas.forEach(contar);


function positivos(){

return TODOS_IDS
.filter(
id=>
(contagem.get(id)||0)>0
)
.length;

}


let pos=qtd;


while(
positivos()<8 &&
pos<candidatos.length &&
replicas.length<
MAX_REPLICAS
){

const rep=
candidatos[pos++];

replicas.push(rep);

contar(rep);

}


const rankingIds=

TODOS_IDS
.map((id,ordem)=>({

id,

ocorrencias:
contagem.get(id)||0,

ordem

}))
.filter(
x=>x.ocorrencias>0
)
.sort(
(a,b)=>

b.ocorrencias-a.ocorrencias ||

a.ordem-b.ordem
);


return {

valido:true,
rx,
replicas,
rankingIds,

similaridade:
replicas.reduce(
(s,r)=>
s+r.similaridade,
0
)/
replicas.length

};

}


/* ============================================================
   FREQUÊNCIA
============================================================ */

function frequenciaReplicas(
replicas
){

const freq=
new Map();

track.forEach(
n=>freq.set(n,0)
);

replicas.forEach(rep=>{

freq.set(
rep.proximo,
(freq.get(rep.proximo)||0)+1
);

});

return freq;

}


/* ============================================================
   DIAGNÓSTICO
============================================================ */

function diagnosticarLosses(lista){

if(!Array.isArray(lista))
lista=[];


const validos=
lista.filter(
x=>!x.semJogada
);


const losses=[];


for(
let i=validos.length-1;
i>=0;
i--
){

if(validos[i].green)
break;

losses.unshift(
validos[i]
);

}


if(!losses.length){

return {

ativo:false,
seq:0,
tipo:"ESTAVEL",
lado:0,
forca:0

};

}


const recentes=
losses.slice(-3);

let fora1=0;
let esquerda=0;
let direita=0;


recentes.forEach(x=>{

if(x.tipo==="FORA1")
fora1++;

if(x.lado<0)
esquerda++;

if(x.lado>0)
direita++;

});


let tipo="ISOLADO";
let forca=.10;


if(
losses.length===1 &&
fora1===1
){

tipo="BORDA";
forca=.10;

}else if(
fora1>=2 &&
Math.max(
esquerda,
direita
)>=2
){

tipo="BORDA_REPETIDA";
forca=.35;

}else if(
losses.length>=2 &&
Math.max(
esquerda,
direita
)>=2
){

tipo="DESLOCAMENTO";
forca=.50;

}else if(
losses.length>=3
){

tipo="QUEBRA";
forca=.60;

}


return {

ativo:true,
seq:losses.length,
tipo,

lado:
direita>esquerda
?1
:(esquerda>direita?-1:0),

forca

};

}


/* ============================================================
   SCORE RX
============================================================ */

function scoreRXPuro(
centro,
qtd,
freq
){

const numeros=
setor(
centro,
qtd
);

let score=0;
let suporte=0;


numeros.forEach(n=>{

const f=
freq.get(n)||0;

suporte+=f;

const d=
distanciaRoda(
centro,
n
);

let peso=1;

if(d===0)
peso=1.45;

else if(d===1)
peso=1.22;

score+=
f*peso;

});


return {
score,
suporte,
numeros
};

}


/* ============================================================
   SCORE MOMENTO SETOR
============================================================ */

function scoreMomentoSetor(
centro,
qtd,
momento
){

const numeros=
setor(
centro,
qtd
);

let score=0;


numeros.forEach(n=>{

const d=
distanciaRoda(
centro,
n
);

let peso=1;

if(d===0)
peso=1.20;

else if(d===1)
peso=1.08;


score+=
scoreMomentoNumero(
n,
momento
)*
peso;

});


return score/
numeros.length;

}


/* ============================================================
   GIRADA DINÂMICA INTERNA ORIGINAL
============================================================ */

function avaliarCentroComGiradas(
centroOriginal,
qtd,
freq,
momento,
diagnostico
){

let melhor=null;


for(
let offset=-MAX_GIRADA;
offset<=MAX_GIRADA;
offset++
){

const centro=
numeroOffset(
centroOriginal,
offset
);


const rx=
scoreRXPuro(
centro,
qtd,
freq
);


if(
rx.suporte<=0
)
continue;


const momentoScore=
scoreMomentoSetor(
centro,
qtd,
momento
);


const custoGirada=
Math.abs(offset)*
.15*
Math.max(
1,
rx.suporte
);


const direcao=
direcaoMomento(
centroOriginal,
momento
);


let bonusDirecao=0;


if(
offset!==0 &&
direcao.direcao!==0 &&
Math.sign(offset)===
direcao.direcao
){

bonusDirecao=
direcao.forca*
rx.suporte*
.18;

}


let bonusLoss=0;


if(
diagnostico &&
diagnostico.ativo &&
diagnostico.lado!==0 &&
offset!==0 &&
Math.sign(offset)===
diagnostico.lado
){

bonusLoss=
diagnostico.forca*
rx.suporte*
.22;

}


const scoreFinal=

rx.score+

(
momentoScore*
rx.suporte*
PESO_MOMENTO
)+

bonusDirecao+

bonusLoss-

custoGirada;


const item={

centroOriginal,
centro,
offset,
qtd,

numeros:
rx.numeros,

suporte:
rx.suporte,

scoreRX:
rx.score,

scoreMomento:
momentoScore,

score:
scoreFinal

};


if(
!melhor ||
item.score>melhor.score
)
melhor=item;

}


return melhor;

}


function gerarCandidatos(
qtd,
freq,
momento,
diagnostico
){

const mapa=
new Map();


track.forEach(
centroOriginal=>{

const c=
avaliarCentroComGiradas(
centroOriginal,
qtd,
freq,
momento,
diagnostico
);

if(!c)
return;


const existente=
mapa.get(
c.centro
);


if(
!existente ||
c.score>existente.score
)
mapa.set(
c.centro,
c
);

});


return Array.from(
mapa.values()
)
.sort(
(a,b)=>

b.score-a.score ||

b.suporte-a.suporte ||

Math.abs(a.offset)-
Math.abs(b.offset)

);

}


/* ============================================================
   MONTA JOGADA
============================================================ */

function montarJogada(
raioX,
base,
diagnostico=null
){

if(
!raioX ||
!raioX.valido
){

return {

valido:false,
blocos2:[],
blocos1:[],
numeros:new Set()

};

}


base=
limitar35(base);


const momento=
analisarMomento(base);


const freq=
frequenciaReplicas(
raioX.replicas
);


const candidatos2=
gerarCandidatos(
2,
freq,
momento,
diagnostico
);


const candidatos1=
gerarCandidatos(
1,
freq,
momento,
diagnostico
);


let melhor=null;


for(const um of candidatos1){

const usados=
new Set(
um.numeros
);

const dois=[];

let score=
um.score;


for(
const candidato
of candidatos2
){

const conflito=
candidato.numeros
.some(
n=>usados.has(n)
);

if(conflito)
continue;


dois.push(
candidato
);

score+=
candidato.score;


candidato.numeros
.forEach(
n=>usados.add(n)
);


if(
dois.length===5
)
break;

}


if(
dois.length===5 &&
usados.size===28
){

if(
!melhor ||
score>melhor.score
){

melhor={

valido:true,

blocos2:dois,

blocos1:[um],

numeros:usados,

score,

momento

};

}

}

}


return melhor || {

valido:false,

blocos2:[],

blocos1:[],

numeros:new Set(),

momento

};

}


/* ============================================================
   OFFSET GLOBAL
============================================================ */

function aplicarOffsetGlobalNaJogada(
jogada,
offset
){

if(
!jogada ||
!jogada.valido
)
return jogada;


if(!offset)
return jogada;


const blocos2=
jogada.blocos2
.map(b=>{

const novoCentro=
numeroOffset(
b.centro,
offset
);

return Object.assign(
{},
b,
{

centro:
novoCentro,

numeros:
setor(
novoCentro,
2
)

}
);

});


const blocos1=
jogada.blocos1
.map(b=>{

const novoCentro=
numeroOffset(
b.centro,
offset
);

return Object.assign(
{},
b,
{

centro:
novoCentro,

numeros:
setor(
novoCentro,
1
)

}
);

});


const numeros=
new Set();


blocos2.forEach(b=>
b.numeros.forEach(
n=>numeros.add(n)
)
);


blocos1.forEach(b=>
b.numeros.forEach(
n=>numeros.add(n)
)
);


return Object.assign(
{},
jogada,
{
blocos2,
blocos1,
numeros
}
);

}


/* ============================================================
   MOTOR NORMAL
============================================================ */

function gerarConfigNormal(
base,
rxTam,
diagnostico=null
){

base=
limitar35(base);


const raioX=
analisarRX(
base,
rxTam
);


if(!raioX.valido){

return {

valido:false,
motor:"NORMAL",
rx:rxTam,
usarOffset:false,
offsetAplicado:0

};

}


const jogada=
montarJogada(
raioX,
base,
diagnostico
);


return {

valido:
jogada.valido,

motor:"NORMAL",

rx:
rxTam,

usarOffset:false,

offsetAplicado:0,

raioX,

jogada,

similaridade:
raioX.similaridade

};

}


/* ============================================================
   MOTOR DINÂMICO
============================================================ */

function gerarConfigDinamico(
base,
rxTam,
diagnostico=null,
offset=offsetCentroAtual
){

base=
limitar35(base);


const raioX=
analisarRX(
base,
rxTam
);


if(!raioX.valido){

return {

valido:false,
motor:"DINAMICO",
rx:rxTam,
usarOffset:true,
offsetAplicado:offset

};

}


let jogada=
montarJogada(
raioX,
base,
diagnostico
);


jogada=
aplicarOffsetGlobalNaJogada(
jogada,
offset
);


return {

valido:
jogada.valido,

motor:"DINAMICO",

rx:
rxTam,

usarOffset:true,

offsetAplicado:
offset,

raioX,

jogada,

similaridade:
raioX.similaridade

};

}


/* ============================================================
   CLASSIFICAÇÃO
============================================================ */

function classificarJogada(
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
lado:0

};

}


const blocos=[

...(jogada.blocos2||[]),
...(jogada.blocos1||[])

];


for(const b of blocos){

if(
b.numeros.includes(numero)
){

const d=
distanciaRoda(
numero,
b.centro
);

return {

green:true,

tipo:
d===0
?"ALVO"
:(d===1
?"V1"
:"V2"),

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


let melhor=null;


blocos.forEach(b=>{

const d=
distanciaRoda(
numero,
b.centro
);

const gap=
d-b.qtd;


if(
gap>0 &&
(
!melhor ||
gap<melhor.gap
)
){

melhor={

gap,

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
lado:0

};

}


return {

green:false,

tipo:
melhor.gap===1
?"FORA1"
:(melhor.gap===2
?"FORA2"
:"FORA"),

lado:
melhor.lado

};

}


/* ============================================================
   STATS
============================================================ */

function statsTimeline(lista){

if(!Array.isArray(lista))
lista=[];


function validos(arr){

return arr.filter(
x=>!x.semJogada
);

}


function taxa(
arr,
qtd
){

const v=
validos(arr)
.slice(-qtd);

if(!v.length)
return 0;

return (
v.filter(
x=>x.green
).length/
v.length*
100
);

}


const todosValidos=
validos(lista);


let loss=0;


for(
let i=lista.length-1;
i>=0;
i--
){

const x=
lista[i];

if(x.semJogada)
continue;

if(x.green)
break;

loss++;

}


return {

total:
todosValidos.length,

totalLinha:
lista.length,

taxa5:
taxa(lista,5),

taxa10:
taxa(lista,10),

taxa20:
taxa(lista,20),

lossSeguidos:
loss,

timeline:
lista

};

}


/* ============================================================
   BACKTEST NORMAL
============================================================ */

function backtestNormal(
base,
rxTam
){

base=
limitar35(base);

const timeline=[];


const minimo=
Math.max(
14,
rxTam*2+4
);


const inicio=
Math.max(
minimo,
base.length-20
);


for(
let i=inicio;
i<base.length;
i++
){

const passado=
base.slice(0,i);


const diag=
diagnosticarLosses(
timeline
);


const cfg=
gerarConfigNormal(
passado,
rxTam,
diag
);


if(!cfg.valido){

timeline.push({

resultado:
base[i],

semJogada:true,

green:null,

tipo:"SEM_JOGADA",

lado:0

});

continue;

}


const resultado=
base[i];


const r=
classificarJogada(
resultado,
cfg.jogada
);


timeline.push({

resultado,

semJogada:false,

green:r.green,

tipo:r.tipo,

lado:r.lado

});

}


return statsTimeline(
timeline
);

}


/* ============================================================
   BACKTEST DINÂMICO

   MANTÉM O COMPORTAMENTO DO MOTOR DINÂMICO:
   O OFFSET ATUAL É APLICADO ÀS CONFIGURAÇÕES DO BACKTEST.
============================================================ */

function backtestDinamico(
base,
rxTam,
offsetAtual
){

base=
limitar35(base);

const timeline=[];


const minimo=
Math.max(
14,
rxTam*2+4
);


const inicio=
Math.max(
minimo,
base.length-20
);


for(
let i=inicio;
i<base.length;
i++
){

const passado=
base.slice(0,i);


const diag=
diagnosticarLosses(
timeline
);


const cfg=
gerarConfigDinamico(
passado,
rxTam,
diag,
offsetAtual
);


if(!cfg.valido){

timeline.push({

resultado:
base[i],

semJogada:true,

green:null,

tipo:"SEM_JOGADA",

lado:0

});

continue;

}


const resultado=
base[i];


const r=
classificarJogada(
resultado,
cfg.jogada
);


timeline.push({

resultado,

semJogada:false,

green:r.green,

tipo:r.tipo,

lado:r.lado

});

}


return statsTimeline(
timeline
);

}


/* ============================================================
   SCORE
============================================================ */

function pontuarConfiguracao(
cfg,
bt,
live
){

if(
!cfg ||
!cfg.valido
)
return -Infinity;


let score=

bt.taxa5*.42+

bt.taxa10*.32+

bt.taxa20*.20+

cfg.similaridade*.06;


if(
bt.lossSeguidos===1
){

const validos=
bt.timeline.filter(
x=>!x.semJogada
);

const ultimo=
validos[
validos.length-1
];


if(
ultimo &&
ultimo.tipo==="FORA1"
)
score-=1;

else
score-=3;

}


if(
live &&
live.total
){

score+=
live.taxa10*.05+
live.taxa20*.025;

}


return score;

}


/* ============================================================
   CANDIDATO NORMAL
============================================================ */

function analisarNormal(
base,
rx
){

const timeline=
estado.timelines.NORMAL[rx];


const diagnostico=
diagnosticarLosses(
timeline
);


const live=
statsTimeline(
timeline
);


const cfg=
gerarConfigNormal(
base,
rx,
diagnostico
);


if(!cfg.valido)
return null;


const bt=
backtestNormal(
base,
rx
);


return Object.assign(
{},
cfg,
{

backtest:bt,

live,

score:
pontuarConfiguracao(
cfg,
bt,
live
)

}
);

}


/* ============================================================
   CANDIDATO DINÂMICO
============================================================ */

function analisarDinamico(
base,
rx
){

const timeline=
estado.timelines.DINAMICO[rx];


const diagnostico=
diagnosticarLosses(
timeline
);


const live=
statsTimeline(
timeline
);


const cfg=
gerarConfigDinamico(
base,
rx,
diagnostico,
offsetCentroAtual
);


if(!cfg.valido)
return null;


const bt=
backtestDinamico(
base,
rx,
offsetCentroAtual
);


return Object.assign(
{},
cfg,
{

backtest:bt,

live,

score:
pontuarConfiguracao(
cfg,
bt,
live
)

}
);

}


/* ============================================================
   CALCULA OS 6 CANDIDATOS
============================================================ */

function calcularSeis(
base
){

const normal={};
const dinamico={};


RX_LIST.forEach(rx=>{

normal[rx]=
analisarNormal(
base,
rx
);


dinamico[rx]=
analisarDinamico(
base,
rx
);

});


return {
normal,
dinamico
};

}


/* ============================================================
   AUTO ÚNICO
============================================================ */

function escolherAuto(
seis
){

const candidatos=[];


RX_LIST.forEach(rx=>{

if(
seis.normal[rx] &&
seis.normal[rx].valido
)
candidatos.push(
seis.normal[rx]
);


if(
seis.dinamico[rx] &&
seis.dinamico[rx].valido
)
candidatos.push(
seis.dinamico[rx]
);

});


if(!candidatos.length)
return null;


candidatos.sort(
(a,b)=>

b.score-a.score ||

b.backtest.taxa10-
a.backtest.taxa10 ||

b.backtest.taxa20-
a.backtest.taxa20 ||

b.backtest.taxa5-
a.backtest.taxa5 ||

b.similaridade-
a.similaridade
);


return candidatos[0];

}


/* ============================================================
   CONFIGURAÇÃO MANUAL
============================================================ */

function configManual(
seis
){

if(
estado.motorManual==="DINAMICO"
)
return seis.dinamico[
estado.manualRX
]||null;


return seis.normal[
estado.manualRX
]||null;

}


/* ============================================================
   CONFIGURAÇÃO ATIVA
============================================================ */

function configAtiva(
seis,
auto
){

if(
estado.modo==="AUTO"
)
return auto;

return configManual(
seis
);

}


/* ============================================================
   SNAPSHOT
============================================================ */

function assinatura(){

return (
historico.length+
"|"+
historico.join(",")
);

}


function snapshot(config){

if(
!config ||
!config.valido ||
!config.jogada ||
!config.jogada.valido
)
return null;


return {

assinatura:
assinatura(),

motor:
config.motor,

rx:
config.rx,

usarOffset:
!!config.usarOffset,

offsetAplicado:
Number.isInteger(
config.offsetAplicado
)
?config.offsetAplicado
:0,

centros2:
config.jogada
.blocos2
.map(x=>x.centro),

centro1:
config.jogada.blocos1[0]
?config.jogada
.blocos1[0]
.centro
:null

};

}


function classificarSnapshot(
numero,
p
){

if(!p){

return {

green:false,
tipo:"FORA",
lado:0

};

}


const blocos2=
(p.centros2||[])
.map(c=>({

centro:c,
qtd:2,
numeros:setor(c,2)

}));


const blocos1=
p.centro1!==null &&
p.centro1!==undefined

?[{

centro:p.centro1,
qtd:1,
numeros:setor(
p.centro1,
1
)

}]

:[];


return classificarJogada(
numero,
{
valido:true,
blocos2,
blocos1
}
);

}


/* ============================================================
   PENDENTES — 7 SNAPSHOTS
============================================================ */

function garantirPendentes(
seis,
auto
){

const sig=
assinatura();


if(
!estado.pendentes.AUTO ||
estado.pendentes.AUTO.assinatura!==sig
){

estado.pendentes.AUTO=
snapshot(auto);

}


RX_LIST.forEach(rx=>{

if(
!estado.pendentes.NORMAL[rx] ||
estado.pendentes.NORMAL[rx].assinatura!==sig
){

estado.pendentes.NORMAL[rx]=
snapshot(
seis.normal[rx]
);

}


if(
!estado.pendentes.DINAMICO[rx] ||
estado.pendentes.DINAMICO[rx].assinatura!==sig
){

estado.pendentes.DINAMICO[rx]=
snapshot(
seis.dinamico[rx]
);

}

});


salvarEstado();

}


/* ============================================================
   REGISTRA UM RESULTADO EM UMA TIMELINE
============================================================ */

function avaliarUmPendente(
numero,
p,
lista,
sig
){

if(
!p ||
p.assinatura!==sig
){

lista.push({

resultado:numero,

semJogada:true,

green:null,

tipo:"SEM_JOGADA",

lado:0,

hora:Date.now()

});


return lista.slice(
-MAX_TIMELINE
);

}


const r=
classificarSnapshot(
numero,
p
);


lista.push({

resultado:numero,

semJogada:false,

green:r.green,

tipo:r.tipo,

lado:r.lado,

hora:Date.now()

});


return lista.slice(
-MAX_TIMELINE
);

}


/* ============================================================
   AVALIA OS 7 PENDENTES
============================================================ */

function avaliarPendentes(
numero
){

const sig=
assinatura();


estado.timelines.AUTO=
avaliarUmPendente(

numero,

estado.pendentes.AUTO,

estado.timelines.AUTO,

sig

);


estado.pendentes.AUTO=null;


RX_LIST.forEach(rx=>{

estado.timelines.NORMAL[rx]=
avaliarUmPendente(

numero,

estado.pendentes.NORMAL[rx],

estado.timelines.NORMAL[rx],

sig

);


estado.timelines.DINAMICO[rx]=
avaliarUmPendente(

numero,

estado.pendentes.DINAMICO[rx],

estado.timelines.DINAMICO[rx],

sig

);


estado.pendentes.NORMAL[rx]=null;

estado.pendentes.DINAMICO[rx]=null;

});


salvarEstado();

}


/* ============================================================
   ENCONTRA BATIDA DO MOTOR DINÂMICO
============================================================ */

function encontrarBatidaGlobal(
numero,
config
){

if(
!config ||
!config.valido ||
!config.jogada ||
!config.jogada.valido
)
return null;


const blocos=[

...(config.jogada.blocos2||[]),
...(config.jogada.blocos1||[])

];


let melhor=null;


for(const bloco of blocos){

if(
!bloco.numeros.includes(numero)
)
continue;


const delta=
deltaRoda(
bloco.centro,
numero
);


if(
Math.abs(delta)>bloco.qtd
)
continue;


const candidato={

centro:
bloco.centro,

numero,

delta,

qtd:
bloco.qtd

};


if(
!melhor ||
Math.abs(delta)<
Math.abs(melhor.delta)
)
melhor=candidato;

}


return melhor;

}


/* ============================================================
   MOTOR DINÂMICO ATIVO PARA ATUALIZAR OFFSET

   ELE NÃO DEPENDE DO AUTO FINAL.

   SE ESTIVER EM AUTO:
   USA O MELHOR DOS 3 RX DO PRÓPRIO MOTOR DINÂMICO.

   SE O USUÁRIO ESTIVER MANUAL NO DINÂMICO:
   USA O RX DINÂMICO SELECIONADO.
============================================================ */

function melhorDinamico(
seis
){

if(
estado.modo==="MANUAL" &&
estado.motorManual==="DINAMICO"
){

return seis.dinamico[
estado.manualRX
]||null;

}


const candidatos=
RX_LIST
.map(rx=>
seis.dinamico[rx]
)
.filter(x=>
x &&
x.valido
);


if(!candidatos.length)
return null;


candidatos.sort(
(a,b)=>

b.score-a.score ||

b.backtest.taxa10-
a.backtest.taxa10 ||

b.backtest.taxa20-
a.backtest.taxa20 ||

b.similaridade-
a.similaridade
);


return candidatos[0];

}


/* ============================================================
   ATUALIZA OFFSET
============================================================ */

function atualizarOffsetGlobal(
numero,
configDinamica
){

if(
!configDinamica ||
!configDinamica.valido ||
!configDinamica.usarOffset
)
return;


const batida=
encontrarBatidaGlobal(
numero,
configDinamica
);


if(!batida)
return;


offsetCentroAtual=
Math.max(
-2,
Math.min(
2,
batida.delta
)
);


salvarOffsetCentro();

}


/* ============================================================
   COPIA JOGADA
============================================================ */

function copiarJogada(
config
){

if(
!config ||
!config.valido ||
!config.jogada ||
!config.jogada.valido
)
return null;


return {

valido:true,

motor:
config.motor,

rx:
config.rx,

usarOffset:
!!config.usarOffset,

offsetAplicado:
Number.isInteger(
config.offsetAplicado
)
?config.offsetAplicado
:0,

jogada:{

valido:true,

blocos2:
config.jogada.blocos2
.map(b=>({

centro:b.centro,
qtd:2,
numeros:b.numeros.slice()

})),

blocos1:
config.jogada.blocos1
.map(b=>({

centro:b.centro,
qtd:1,
numeros:b.numeros.slice()

}))

}

};

}


/* ============================================================
   VISUAL G1
============================================================ */

function chaveVisual(){

if(
estado.modo==="AUTO"
)
return "AUTO";


return (
estado.motorManual+
"_"+
estado.manualRX
);

}


function ultimoVisualEsperaG1(){

if(!duplasVisual.length)
return false;

const ultimo=
duplasVisual[
duplasVisual.length-1
];

return (
ultimo &&
ultimo.fase==="ESPERA_G1"
);

}


/* ============================================================
   INSERIR NÚMERO
============================================================ */

function adicionarNumero(
numero
){

/*
   1. CALCULA TUDO ANTES DO RESULTADO.
*/

const baseAntes=
historico.slice(-35);


const seisAntes=
calcularSeis(
baseAntes
);


const autoAntes=
escolherAuto(
seisAntes
);


const ativaAntes=
configAtiva(
seisAntes,
autoAntes
);


/*
   2. JOGADA QUE O USUÁRIO ESTÁ EFETIVAMENTE ACOMPANHANDO.
*/

const configAntes=
jogadaCongelada ||
ativaAntes;


/*
   3. MOTOR DINÂMICO CONTINUA EXISTINDO INDEPENDENTEMENTE.
*/

const dinamicaAntes=
melhorDinamico(
seisAntes
);


/*
   4. VERIFICA SE ESTE RESULTADO É G1 VISUAL.
*/

const eraG1=
ultimoVisualEsperaG1();


/*
   5. AVALIA AS 7 JOGADAS QUE EXISTIAM ANTES DO RESULTADO.
*/

avaliarPendentes(
numero
);


/*
   6. MOTOR DINÂMICO ATUALIZA SEU PRÓPRIO OFFSET.
*/

atualizarOffsetGlobal(
numero,
dinamicaAntes
);


/*
   7. RESULTADO ENTRA NOS 35.
*/

historico.push(
numero
);


historico=
historico.slice(-35);


salvarHistorico();


/*
   8. CONTROLE VISUAL DO G1.
*/

if(eraG1){

const ultima=
duplasVisual[
duplasVisual.length-1
];


ultima.g1=
numero;

ultima.fase=
"FINALIZADO";


if(
jogadaCongelada &&
jogadaCongelada.jogada
){

const r=
classificarJogada(
numero,
jogadaCongelada.jogada
);


ultima.g1Green=
r.green;

}else{

ultima.g1Green=null;

}


jogadaCongelada=null;


salvarJogadaCongelada();

salvarDuplasVisual();


}else{


let resultadoAtivo=null;


if(
configAntes &&
configAntes.valido &&
configAntes.jogada
){

resultadoAtivo=
classificarJogada(
numero,
configAntes.jogada
);

}


const entrada={

resultado:
numero,

g1:null,

g1Green:null,

green:
resultadoAtivo
?resultadoAtivo.green
:null,

fase:
resultadoAtivo &&
resultadoAtivo.green===false
?"ESPERA_G1"
:"FINALIZADO",

chave:
chaveVisual(),

motor:
configAntes
?configAntes.motor
:null,

rx:
configAntes
?configAntes.rx
:null

};


duplasVisual.push(
entrada
);


duplasVisual=
duplasVisual.slice(-14);


if(
resultadoAtivo &&
resultadoAtivo.green===false
){

jogadaCongelada=
copiarJogada(
configAntes
);

}else{

jogadaCongelada=null;

}


salvarJogadaCongelada();

salvarDuplasVisual();

}


/*
   9. RENDERIZA.
*/

render();

}


/* ============================================================
   HISTÓRICO MANUAL
============================================================ */

function extrairNumeros(texto){

const encontrados=
texto.match(
/\b(?:[0-9]|[12][0-9]|3[0-6])\b/g
);

if(!encontrados)
return [];

return encontrados
.map(Number)
.slice(-35);

}


function resetarEstadoAnalise(){

estado.timelines=
timelinesVazias();

estado.pendentes=
pendentesVazios();

duplasVisual=[];

jogadaCongelada=null;

offsetCentroAtual=0;


salvarOffsetCentro();

salvarJogadaCongelada();

salvarDuplasVisual();

salvarEstado();

}


function inserirHistorico(){

const campo=
document.getElementById(
"entradaHistorico"
);


const numeros=
extrairNumeros(
campo.value
);


if(!numeros.length)
return;


historico=
numeros.slice(-35);


resetarEstadoAnalise();


salvarHistorico();


campo.value="";


render();

}


/* ============================================================
   APAGAR
============================================================ */

function apagarUltimo(){

if(!historico.length)
return;


historico.pop();


resetarEstadoAnalise();


salvarHistorico();


render();

}


function apagarTudo(){

if(
!confirm(
"Apagar histórico?"
)
)
return;


historico=[];


resetarEstadoAnalise();


salvarHistorico();


render();

}


/* ============================================================
   INTERFACE
============================================================ */

document.body.innerHTML="";


document.body.style.cssText=

"margin:0;"+
"background:#101010;"+
"color:#fff;"+
"font-family:Arial,sans-serif;";


const app=
document.createElement(
"div"
);


app.innerHTML=`

<style>

*{
box-sizing:border-box
}

body{
background:#101010
}

.app{
max-width:900px;
margin:auto;
padding:7px
}

h2{
text-align:center;
font-size:20px;
margin:5px
}

.painel{
background:#1c1c1f;
border:1px solid #414141;
border-radius:10px;
padding:8px;
margin-bottom:7px
}

.titulo{
font-size:9px;
font-weight:900;
color:#888;
margin-bottom:5px
}

textarea{
width:100%;
height:60px;
background:#111;
color:#fff;
border:1px solid #555;
border-radius:7px;
padding:7px
}

.botoes{
display:flex;
gap:5px;
flex-wrap:wrap;
margin-top:5px
}

button{
cursor:pointer;
font-family:Arial;
font-weight:900
}

.btn{
border:1px solid #555;
background:#333;
color:#fff;
border-radius:7px;
padding:7px 10px
}

.btn.verde{
background:#17643b
}

.btn.red{
background:#762832
}

.seletorGrupo{
margin-top:7px
}

.seletorTitulo{
font-size:8px;
font-weight:900;
color:#777;
margin-bottom:4px
}

.modos{
display:flex;
gap:4px;
flex-wrap:wrap
}

.modo{
background:#222;
color:#999;
border:1px solid #555;
border-radius:7px;
padding:7px 11px
}

.modo.ativo{
background:#007d98;
border-color:#00e5ff;
color:#fff
}

.modo.dinamico.ativo{
background:#6c4d00;
border-color:#ffc107;
color:#fff
}

.resumo{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:4px;
margin-top:7px
}

.card{
background:#111;
border:1px solid #333;
border-radius:7px;
padding:7px;
text-align:center
}

.card small{
display:block;
font-size:7px;
color:#777;
font-weight:900
}

.card strong{
font-size:13px
}

.origemAuto{
margin-top:6px;
padding:7px;
background:#111;
border:1px solid #00e5ff;
border-radius:7px;
font-size:9px;
font-weight:900;
text-align:center;
color:#00e5ff
}

.trio{
margin-top:7px;
background:#111;
border:1px solid #333;
border-radius:8px;
padding:8px
}

.trioTitulo{
font-size:7px;
font-weight:900;
color:#777;
margin-bottom:6px
}

.trioLinha{
display:flex;
gap:6px
}

.terminal{
flex:1;
border-radius:7px;
padding:7px;
text-align:center;
font-size:18px;
font-weight:900;
background:#202020
}

.terminal.primeiro{
border:1px solid #00e676
}

.terminal.segundo{
border:1px solid #00b0ff
}

.terminal.terceiro{
border:1px solid #ffc107
}

.terminal small{
display:block;
font-size:7px;
color:#888;
margin-top:3px
}

.timelineSecao{
margin-top:8px;
padding-top:6px;
border-top:1px solid #333
}

.timelineTituloGrupo{
font-size:8px;
font-weight:900;
margin-bottom:4px;
color:#aaa
}

.timelineRow{
display:grid;
grid-template-columns:80px 1fr 42px;
gap:4px;
align-items:center;
margin-top:4px
}

.timeline{
display:flex;
gap:2px;
justify-content:flex-end;
overflow:hidden
}

.gl{
width:15px;
height:15px;
min-width:15px;
border-radius:3px;
font-size:7px;
display:flex;
align-items:center;
justify-content:center;
font-weight:900;
color:#fff
}

.gl.green{
background:#00994d
}

.gl.loss{
background:#c62828
}

.semJogadaGL{
width:15px;
height:15px;
min-width:15px;
display:flex;
align-items:center;
justify-content:center;
font-size:11px;
font-weight:900;
color:#777
}

.nomeTL,
.taxaTL{
font-size:8px;
font-weight:900
}

.taxaTL{
text-align:right
}

.duplas14{
display:grid;
grid-template-columns:repeat(7,1fr);
gap:5px;
width:100%
}

.dupla14{
min-width:0;
min-height:65px;
border-radius:7px;
display:flex;
align-items:flex-start;
justify-content:center;
background:#272727;
border:2px solid #555;
position:relative;
padding:6px 4px 26px
}

.dupla14.green{
background:rgba(0,153,77,.18);
border-color:#00b85c
}

.dupla14.loss{
background:rgba(198,40,40,.18);
border-color:#d93a3a
}

.dupla14.g1{
background:rgba(255,193,7,.16);
border-color:#ffc107
}

.bolaDupla{
width:31px;
height:31px;
min-width:31px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:11px;
font-weight:900;
color:#fff;
border:2px solid #aaa
}

.resultadoEntrada{
position:absolute;
left:50%;
bottom:2px;
transform:translateX(-50%);
height:19px;
min-width:26px;
padding:2px 5px;
border-radius:5px;
display:flex;
align-items:center;
justify-content:center;
gap:3px;
font-size:7px;
font-weight:900;
white-space:nowrap;
border:1px solid #777;
background:#171717
}

.resultadoEntrada.green{
background:#00994d;
border-color:#00e676
}

.resultadoEntrada.loss{
background:#c62828;
border-color:#ff5252
}

.resultadoEntrada.g1{
background:#ffc107;
border-color:#ffe082;
color:#111
}

.duziasBox{
margin-top:7px;
background:#111;
border:1px solid #333;
border-radius:8px;
padding:7px
}

.duziasLinha{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:4px
}

.duziaCard{
background:#1d1d1d;
border:1px solid #444;
border-radius:7px;
padding:6px;
text-align:center
}

.duziaCard.forte{
border-color:#00e676
}

.duziaCard small{
display:block;
font-size:7px;
color:#888;
font-weight:900
}

.duziaCard strong{
font-size:14px
}

.duziaCard span{
display:block;
font-size:7px;
color:#aaa;
margin-top:2px
}

.jogadaStatus{
font-size:8px;
font-weight:900;
margin:3px 0 6px;
padding:4px 6px;
border-radius:5px;
display:inline-block;
background:#15323a;
color:#00e5ff;
border:1px solid #007d98
}

.jogadaStatus.congelada{
background:#4a3510;
color:#ffc107;
border-color:#ffc107
}

.grupoRegiao{
margin-bottom:8px;
background:#161616;
border:1px solid #333;
border-radius:8px;
padding:6px
}

.grupoRegiaoTitulo{
font-size:8px;
font-weight:900;
color:#aaa;
margin-bottom:5px
}

.jogada{
display:flex;
gap:5px;
overflow-x:auto;
margin-top:5px
}

.bloco{
min-width:135px;
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
font-size:7px;
font-weight:900;
color:#888
}

.bloco strong{
display:block;
font-size:22px;
margin:3px
}

.numeros{
border-top:1px solid #333;
padding-top:4px;
font-size:9px;
font-weight:900
}

.teclado{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:4px
}

.numero{
height:37px;
border:1px solid #666;
border-radius:6px;
color:#fff
}

.zero{
grid-column:span 6
}

.status{
font-size:9px;
font-weight:900;
color:#00e676;
margin-top:5px
}

@media(max-width:600px){

.resumo{
grid-template-columns:repeat(2,1fr)
}

.duplas14{
grid-template-columns:repeat(4,1fr)
}

.timelineRow{
grid-template-columns:70px 1fr 36px
}

}

</style>


<div class="app">

<h2>ANÁLISE BETA</h2>


<div class="painel">

<textarea
id="entradaHistorico"
placeholder="Cole o histórico — últimos 35"
></textarea>

<div class="botoes">

<button
id="inserir"
class="btn verde">
INSERIR
</button>

<button
id="apagar"
class="btn">
APAGAR ÚLTIMO
</button>

<button
id="limpar"
class="btn red">
APAGAR TUDO
</button>

</div>

<div
id="status"
class="status">
PRONTO
</div>

</div>


<div class="painel">

<div class="seletorGrupo">

<div class="seletorTitulo">
AUTO
</div>

<div class="modos">

<button
id="btnAUTO"
class="modo">
AUTO
</button>

</div>

</div>


<div class="seletorGrupo">

<div class="seletorTitulo">
NORMAL
</div>

<div class="modos">

<button
id="btnN4"
class="modo">
RX4
</button>

<button
id="btnN5"
class="modo">
RX5
</button>

<button
id="btnN6"
class="modo">
RX6
</button>

</div>

</div>


<div class="seletorGrupo">

<div class="seletorTitulo">
DINÂMICO
</div>

<div class="modos">

<button
id="btnD4"
class="modo dinamico">
RX4
</button>

<button
id="btnD5"
class="modo dinamico">
RX5
</button>

<button
id="btnD6"
class="modo dinamico">
RX6
</button>

</div>

</div>


<div
id="origemAuto"
class="origemAuto">
AUTO
</div>


<div
id="resumo"
class="resumo">
</div>


<div
id="trio"
class="trio">
</div>


<div
id="duzias"
class="duziasBox">
</div>


<div class="timelineSecao">

<div class="timelineTituloGrupo">
AUTO FINAL
</div>

<div
id="timelineAUTO"
class="timelineRow">
</div>

</div>


<div class="timelineSecao">

<div class="timelineTituloGrupo">
MOTOR NORMAL
</div>

<div
id="timelineN4"
class="timelineRow">
</div>

<div
id="timelineN5"
class="timelineRow">
</div>

<div
id="timelineN6"
class="timelineRow">
</div>

</div>


<div class="timelineSecao">

<div class="timelineTituloGrupo">
MOTOR DINÂMICO
</div>

<div
id="timelineD4"
class="timelineRow">
</div>

<div
id="timelineD5"
class="timelineRow">
</div>

<div
id="timelineD6"
class="timelineRow">
</div>

</div>

</div>


<div class="painel">

<div class="titulo">
ÚLTIMAS 14 • JOGADA SELECIONADA
</div>

<div
id="ultimos14"
class="duplas14">
</div>

</div>


<div class="painel">

<div class="titulo">
JOGADA
</div>

<div id="jogada">
</div>

</div>


<div class="painel">

<div class="titulo">
TECLADO
</div>

<div
id="teclado"
class="teclado">
</div>

</div>

</div>

`;


document.body.appendChild(
app
);


/* ============================================================
   BOTÕES
============================================================ */

document
.getElementById("inserir")
.onclick=
inserirHistorico;


document
.getElementById("apagar")
.onclick=
apagarUltimo;


document
.getElementById("limpar")
.onclick=
apagarTudo;


function selecionarAuto(){

estado.modo="AUTO";

jogadaCongelada=null;

salvarJogadaCongelada();

salvarEstado();

render();

}


function selecionarManual(
motor,
rx
){

estado.modo="MANUAL";

estado.motorManual=motor;

estado.manualRX=rx;

jogadaCongelada=null;

salvarJogadaCongelada();

salvarEstado();

render();

}


document
.getElementById("btnAUTO")
.onclick=
selecionarAuto;


RX_LIST.forEach(rx=>{

document
.getElementById(
"btnN"+rx
)
.onclick=()=>{

selecionarManual(
"NORMAL",
rx
);

};


document
.getElementById(
"btnD"+rx
)
.onclick=()=>{

selecionarManual(
"DINAMICO",
rx
);

};

});


/* ============================================================
   TECLADO
============================================================ */

const teclado=
document.getElementById(
"teclado"
);


for(
let n=1;
n<=36;
n++
){

const b=
document.createElement(
"button"
);

b.className=
"numero";

b.textContent=n;

b.style.background=
corRoleta(n);

b.onclick=()=>
adicionarNumero(n);

teclado.appendChild(b);

}


const zero=
document.createElement(
"button"
);

zero.className=
"numero zero";

zero.textContent="0";

zero.style.background=
corRoleta(0);

zero.onclick=()=>
adicionarNumero(0);

teclado.appendChild(
zero
);


/* ============================================================
   TIMELINE
============================================================ */

function renderTimeline(
id,
nome,
lista
){

lista=
(lista||[])
.filter(x=>!x.semJogada)
.slice(-20);


const stats=
statsTimeline(
lista
);


document
.getElementById(id)
.innerHTML=

'<div class="nomeTL">'+
nome+
'</div>'+

'<div class="timeline">'+

lista.map(x=>{

if(x.green){

return (
'<span class="gl green">G</span>'
);

}

return (
'<span class="gl loss">L</span>'
);

}).join("")+

'</div>'+

'<div class="taxaTL">'+

(
lista.length
?stats.taxa20.toFixed(0)+"%"
:"—"
)+

'</div>';

}


/* ============================================================
   TERMINAIS
============================================================ */

function renderTrio(
momento
){

const itens=
momento.terminais
.ranking
.slice(0,3);


document
.getElementById(
"trio"
)
.innerHTML=

'<div class="trioTitulo">'+
'TERMINAIS DO MOMENTO • 1 VIZINHO DE CADA LADO'+
'</div>'+

'<div class="trioLinha">'+

itens.map((x,i)=>

'<div class="terminal '+

(
i===0
?"primeiro"
:(i===1
?"segundo"
:"terceiro")
)+

'">'+

x.terminal+

'<small>'+
'FORÇA '+
x.score.toFixed(1)+
'</small>'+

'</div>'

).join("")+

'</div>';

}


/* ============================================================
   DÚZIAS
============================================================ */

function renderDuzias(
momento
){

const ranking=
momento
.duziasFisicas
.ranking;


document
.getElementById(
"duzias"
)
.innerHTML=

'<div class="trioTitulo">'+
'CONCENTRAÇÃO FÍSICA DAS DÚZIAS'+
'</div>'+

'<div class="duziasLinha">'+

ranking.map((x,i)=>

'<div class="duziaCard '+
(i===0?"forte":"")+
'">'+

'<small>'+
x.duzia+
'ª DÚZIA'+
'</small>'+

'<strong>'+
(x.score*100).toFixed(0)+
'%'+
'</strong>'+

'<span>'+
x.contagem+
'/14 • FÍSICA '+
(x.fisica*100).toFixed(0)+
'%'+
'</span>'+

'</div>'

).join("")+

'</div>';

}


/* ============================================================
   REGIÕES VISUAIS
============================================================ */

function ordemRegiao(nome){

const ordem={
TIERS:0,
ORPHELINS:1,
ZERO:2,
VOISINS:3
};

return ordem[nome]!==undefined
?ordem[nome]
:99;

}


function htmlBlocoJogada(
b,
um=false
){

return (

'<div class="bloco '+
(um?"um":"")+
'">'+

'<small>'+
(
um
?"1 VIZINHO DO"
:"2 VIZINHOS DO"
)+
'</small>'+

'<strong>'+
b.centro+
'</strong>'+

'<div class="numeros">'+
b.numeros.join(" • ")+
'</div>'+

'</div>'

);

}


function renderJogada(
config,
congelada=false
){

const area=
document.getElementById(
"jogada"
);


if(
!config ||
!config.valido ||
!config.jogada ||
!config.jogada.valido
){

area.innerHTML=
'<div style="color:#777">AGUARDANDO DADOS</div>';

return;

}


const todos=[];


config.jogada
.blocos2
.forEach(b=>{

todos.push({

bloco:b,
um:false,
regiao:
regiao(b.centro)||
"OUTROS"

});

});


config.jogada
.blocos1
.forEach(b=>{

todos.push({

bloco:b,
um:true,
regiao:
regiao(b.centro)||
"OUTROS"

});

});


todos.sort(
(a,b)=>{

const ra=
ordemRegiao(
a.regiao
);

const rb=
ordemRegiao(
b.regiao
);

if(ra!==rb)
return ra-rb;

return (
indice(a.bloco.centro)-
indice(b.bloco.centro)
);

});


const grupos=[];


todos.forEach(item=>{

let grupo=
grupos.find(
g=>g.nome===item.regiao
);


if(!grupo){

grupo={
nome:item.regiao,
itens:[]
};

grupos.push(grupo);

}


grupo.itens.push(item);

});


area.innerHTML=

'<div class="jogadaStatus '+
(congelada?"congelada":"")+
'">'+

(
congelada
?"JOGADA CONGELADA • G1"
:"JOGADA ATUAL"
)+

' • '+

(
config.motor==="DINAMICO"
?"DINÂMICO"
:"NORMAL"
)+

' • RX'+
config.rx+

'</div>'+

grupos.map(grupo=>

'<div class="grupoRegiao">'+

'<div class="grupoRegiaoTitulo">'+
grupo.nome+
'</div>'+

'<div class="jogada">'+

grupo.itens
.map(item=>

htmlBlocoJogada(
item.bloco,
item.um
)

)
.join("")+

'</div>'+

'</div>'

)
.join("");

}


/* ============================================================
   ÚLTIMAS 14
============================================================ */

function renderUltimos14(){

const area=
document.getElementById(
"ultimos14"
);


const lista=
duplasVisual.slice(-14);


area.innerHTML=
lista.map(d=>{


let classe="loss";
let texto="L";


if(d.green===true){

classe="green";
texto="G";

}else if(
d.g1!==null &&
d.g1!==undefined
){

if(d.g1Green===true){

classe="g1";
texto="G1 G";

}else{

classe="loss";
texto="G1 L";

}

}


return (

'<div class="dupla14 '+
classe+
'">'+

'<div class="bolaDupla" style="background:'+
corRoleta(
d.resultado
)+
'">'+

d.resultado+

'</div>'+

'<div class="resultadoEntrada '+
classe+
'">'+

texto+

(
d.g1!==null &&
d.g1!==undefined

?' • '+d.g1

:''

)+

'</div>'+

'</div>'

);

}).join("");

}


/* ============================================================
   TEXTO OFFSET
============================================================ */

function textoOffset(
config
){

if(
!config ||
!config.valido
)
return "—";


if(
config.motor!=="DINAMICO"
)
return "NORMAL";


const o=
config.offsetAplicado||0;


if(o===-2)
return "V2 ESQUERDA • TODOS -2";

if(o===-1)
return "V1 ESQUERDA • TODOS -1";

if(o===1)
return "V1 DIREITA • TODOS +1";

if(o===2)
return "V2 DIREITA • TODOS +2";

return "ALVO";

}


/* ============================================================
   RENDER
============================================================ */

function render(){

historico=
historico.slice(-35);


salvarHistorico();


const base=
historico.slice(-35);


const momento=
analisarMomento(
base
);


const seis=
calcularSeis(
base
);


const auto=
escolherAuto(
seis
);


garantirPendentes(
seis,
auto
);


const ativa=
configAtiva(
seis,
auto
);


/* BOTÕES */

[
"btnAUTO",
"btnN4",
"btnN5",
"btnN6",
"btnD4",
"btnD5",
"btnD6"
]
.forEach(id=>{

document
.getElementById(id)
.classList.remove(
"ativo"
);

});


if(
estado.modo==="AUTO"
){

document
.getElementById(
"btnAUTO"
)
.classList.add(
"ativo"
);

}else{

const id=
estado.motorManual==="NORMAL"
?"btnN"+estado.manualRX
:"btnD"+estado.manualRX;


document
.getElementById(id)
.classList.add(
"ativo"
);

}


/* ORIGEM AUTO */

document
.getElementById(
"origemAuto"
)
.textContent=

auto

?(
"AUTO ESCOLHEU • "+
(
auto.motor==="DINAMICO"
?"DINÂMICO"
:"NORMAL"
)+
" • RX"+
auto.rx
)

:"AUTO • AGUARDANDO";


/* RESUMO */

const liveAuto=
statsTimeline(
estado.timelines.AUTO
);


document
.getElementById(
"resumo"
)
.innerHTML=

'<div class="card">'+
'<small>BT10 AUTO</small>'+
'<strong>'+
(
auto
?auto.backtest.taxa10.toFixed(0)+"%"
:"—"
)+
'</strong>'+
'</div>'+

'<div class="card">'+
'<small>BT20 AUTO</small>'+
'<strong>'+
(
auto
?auto.backtest.taxa20.toFixed(0)+"%"
:"—"
)+
'</strong>'+
'</div>'+

'<div class="card">'+
'<small>REAL10 AUTO</small>'+
'<strong>'+
(
liveAuto.total
?liveAuto.taxa10.toFixed(0)+"%"
:"—"
)+
'</strong>'+
'</div>'+

'<div class="card">'+
'<small>REAL20 AUTO</small>'+
'<strong>'+
(
liveAuto.total
?liveAuto.taxa20.toFixed(0)+"%"
:"—"
)+
'</strong>'+
'</div>';


/* TERMINAIS / DÚZIAS */

renderTrio(
momento
);

renderDuzias(
momento
);


/* 7 LINHAS */

renderTimeline(
"timelineAUTO",
"AUTO",
estado.timelines.AUTO
);


renderTimeline(
"timelineN4",
"RX4",
estado.timelines.NORMAL[4]
);

renderTimeline(
"timelineN5",
"RX5",
estado.timelines.NORMAL[5]
);

renderTimeline(
"timelineN6",
"RX6",
estado.timelines.NORMAL[6]
);


renderTimeline(
"timelineD4",
"RX4",
estado.timelines.DINAMICO[4]
);

renderTimeline(
"timelineD5",
"RX5",
estado.timelines.DINAMICO[5]
);

renderTimeline(
"timelineD6",
"RX6",
estado.timelines.DINAMICO[6]
);


/* VISUAL */

renderUltimos14();


const configExibida=
jogadaCongelada ||
ativa;


renderJogada(
configExibida,
!!jogadaCongelada
);


/* STATUS */

const df=
momento
.duziasFisicas
.dominante;


document
.getElementById(
"status"
)
.textContent=

base.length+
"/35 • MOMENTO 14 • 35×14 ATIVO"+

(
df
?" • CONCENTRAÇÃO: "+
df.duzia+
"ª DÚZIA"
:""
)+

" • CENTROS: "+
textoOffset(
configExibida
)+

(
jogadaCongelada
?" • G1: JOGADA CONGELADA"
:""
);

}


/* ============================================================
   START
============================================================ */

render();

})();
