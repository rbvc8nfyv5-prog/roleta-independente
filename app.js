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


/* ============================================================
   NOVO:
   PESO DA CONCENTRAÇÃO FÍSICA DAS DÚZIAS

   É AUXILIAR.
   NÃO SUBSTITUI O RAIO X.
============================================================ */

const PESO_DUZIA_FISICA = .16;


/* ============================================================
   ROLETA EUROPEIA FÍSICA
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

   IMPORTANTE:
   NÃO ESTAMOS DIZENDO QUE ESSES NÚMEROS
   "PERTENCEM" A OUTRA DÚZIA.

   O MAPA REPRESENTA CONFLUÊNCIA FÍSICA NA RODA.

   Quanto maior o peso, mais representativo é
   aquele número/área para o bolsão físico da dúzia.
============================================================ */

const MAPA_DUZIA_FISICA = {

1: new Map([

/* 3 • 12 • 7 — concentração próxima 26/29 */
[3,1.00],
[12,1.00],
[7,.95],

/* 4 • 2 — concentração próxima do 21 */
[4,.92],
[2,.92],

/* 11 • 8 • 5 */
[11,.82],
[8,.86],
[5,.86],

/* mais isolados */
[6,.40],
[1,.36],
[9,.36],

/* 10 intermediário */
[10,.58]

]),


2: new Map([

/* concentração forte */
[15,1.00],
[19,1.00],
[21,.98],

/* quebra / continuidade */
[17,.70],
[13,.72],

/* bloco 23 • 24 • 16 */
[23,.96],
[24,.94],
[16,.94],

/* área 13/14/20 */
[14,.88],
[20,.88],

/* 28/18 — 18 pertence à 2ª;
   28 funciona como vizinhança física auxiliar */
[18,.92]

]),


3: new Map([

/* região 29–32 */
[29,1.00],
[30,1.00],
[32,.96],

/* região 25–30 */
[25,.94],
[27,.88],
[28,.92],
[29,1.00],
[30,1.00],

/* outros com sustentação física */
[26,.80],
[35,.72],
[36,.68],
[34,.64],

/* mais perdidos */
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

const i=indice(centro);

if(i<0)
return centro;

return track[
(i+offset+37)%37
];

}

function setor(centro,qtd){

const i=indice(centro);

if(i<0)
return [];

const r=[];

for(let d=-qtd;d<=qtd;d++){

r.push(
track[
(i+d+37)%37
]
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
   IDS
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
coberturaIds[base]
.has(numero)
){

ids.push(base);

}

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

const fs=
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

let historico=
carregarHistorico();

let estado={

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
RX_LIST.includes(
x.manualRX
)
)
estado.manualRX=x.manualRX;

if(x.timelines){

["AUTO",4,5,6]
.forEach(k=>{

if(Array.isArray(x.timelines[k])){

estado.timelines[k]=
x.timelines[k]
.slice(-MAX_TIMELINE);

}

});

}

if(x.pendentes){

estado.pendentes=
Object.assign(
estado.pendentes,
x.pendentes
);

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
   DUPLAS VISUAIS FIXAS
============================================================ */
/* ============================================================
   DUPLAS VISUAIS FIXAS + G1 CONGELADO
============================================================ */

let duplasVisual=[];
let proximoGatilhoVisual=null;


/* ============================================================
   AVALIAÇÕES VAZIAS
============================================================ */

function avaliacoesVazias(){

return {
AUTO:null,
4:null,
5:null,
6:null
};

}


/* ============================================================
   NORMALIZA DUPLA SALVA
============================================================ */

function normalizarDuplaVisual(d){

if(!d || typeof d!=="object")
return null;

return {

gatilho:Number(d.gatilho),

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
d.avaliacoes &&
typeof d.avaliacoes==="object"
?Object.assign(
avaliacoesVazias(),
d.avaliacoes
)
:avaliacoesVazias(),

avaliacoesG1:
d.avaliacoesG1 &&
typeof d.avaliacoesG1==="object"
?Object.assign(
avaliacoesVazias(),
d.avaliacoesG1
)
:avaliacoesVazias(),

snapshots:
d.snapshots &&
typeof d.snapshots==="object"
?d.snapshots
:{
AUTO:null,
4:null,
5:null,
6:null
},

snapshotsResultado:
d.snapshotsResultado &&
typeof d.snapshotsResultado==="object"
?d.snapshotsResultado
:{
AUTO:null,
4:null,
5:null,
6:null
}

};

}


/* ============================================================
   SALVAR DUPLAS
============================================================ */

function salvarDuplasVisual(){

duplasVisual=
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


/* ============================================================
   CARREGAR DUPLAS
============================================================ */

function carregarDuplasVisual(){

try{

const raw=
localStorage.getItem(
STORAGE_DUPLAS
);

if(raw){

const arr=
JSON.parse(raw);

if(Array.isArray(arr)){

duplasVisual=
arr
.map(normalizarDuplaVisual)
.filter(Boolean)
.slice(-7);

return;

}

}

}catch(e){}


/*
   Se ainda não houver histórico visual salvo,
   monta as duplas antigas de forma neutra.
*/

const ultimos=
historico.slice(-14);

duplasVisual=[];

for(
let i=0;
i<ultimos.length;
i+=2
){

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

snapshots:{
AUTO:null,
4:null,
5:null,
6:null
},

snapshotsResultado:{
AUTO:null,
4:null,
5:null,
6:null
}

});

}

salvarDuplasVisual();

}

carregarDuplasVisual();


/* ============================================================
   MODO VISUAL ATUAL
============================================================ */

function chaveVisualAtual(){

return estado.modo==="AUTO"
?"AUTO"
:estado.manualRX;

}


/* ============================================================
   COPIAR SNAPSHOT
============================================================ */

function copiarSnapshot(p){

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


/* ============================================================
   CAPTURAR JOGADAS CONGELADAS ATUAIS
============================================================ */

function capturarSnapshotsAtuais(){

return {

AUTO:
copiarSnapshot(
estado.pendentes.AUTO
),

4:
copiarSnapshot(
estado.pendentes[4]
),

5:
copiarSnapshot(
estado.pendentes[5]
),

6:
copiarSnapshot(
estado.pendentes[6]
)

};

}


/* ============================================================
   AVALIAR NÚMERO CONTRA JOGADA CONGELADA
============================================================ */

function avaliarContraSnapshots(
numero,
snapshots
){

const out=
avaliacoesVazias();

["AUTO",4,5,6]
.forEach(k=>{

const p=
snapshots
?snapshots[k]
:null;

if(!p){

out[k]="SEM";
return;

}

const r=
classificarSnapshot(
numero,
p
);

out[k]=
r.green
?"GREEN"
:"LOSS";

});

return out;

}


/* ============================================================
   ESTADO VISUAL DA DUPLA
============================================================ */

function estadoDuplaNoModo(
d,
chave
){

if(!d)
return "SEM";

if(
d.resultado===null ||
d.resultado===undefined
)
return "ABERTA";

const primeira=
d.avaliacoes
?d.avaliacoes[chave]
:null;


/*
   ACERTO DIRETO
*/

if(primeira==="GREEN")
return "GREEN";


/*
   SEM JOGADA
*/

if(
primeira===null ||
primeira==="SEM"
)
return "SEM";


/*
   PRIMEIRO RESULTADO FOI LOSS
*/

if(primeira==="LOSS"){

if(
d.g1===null ||
d.g1===undefined
)
return "AGUARDANDO_G1";

const segunda=
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
   VERIFICA SE ESTÁ ESPERANDO G1
============================================================ */

function duplaPrecisaG1(d){

const chave=
chaveVisualAtual();

return (
estadoDuplaNoModo(
d,
chave
)==="AGUARDANDO_G1"
);

}


/* ============================================================
   CRIAR NOVO GATILHO
============================================================ */

function criarDuplaGatilho(
numero,
snapshots
){

return {

gatilho:numero,

resultado:null,

g1:null,

avaliacoes:
avaliacoesVazias(),

avaliacoesG1:
avaliacoesVazias(),

snapshots:
snapshots || {
AUTO:null,
4:null,
5:null,
6:null
},

snapshotsResultado:{
AUTO:null,
4:null,
5:null,
6:null
}

};

}


/* ============================================================
   REGISTRAR NÚMERO ANTES DO MOTOR CONSUMIR A JOGADA

   EXEMPLO:

   20 = GATILHO

   jogada do 20 fica congelada.

   Sai 27:
   testa 27 contra a jogada do 20.

   Se perder:
   continua no mesmo quadro.

   Sai próximo número:
   testa novamente contra a MESMA jogada do 20.
============================================================ */

function registrarNumeroDuplaAntes(numero){

const snapshotsAntes=
capturarSnapshotsAtuais();


/*
   PRIMEIRO GATILHO
*/

if(!duplasVisual.length){

duplasVisual.push(

criarDuplaGatilho(
numero,
snapshotsAntes
)

);

salvarDuplasVisual();

return {
tipo:"NOVO_GATILHO"
};

}


const ultima=
duplasVisual[
duplasVisual.length-1
];


/*
   GATILHO JÁ EXISTE.
   ESTE NÚMERO É O PRIMEIRO RESULTADO.
*/

if(
ultima.resultado===null ||
ultima.resultado===undefined
){

ultima.resultado=
numero;


/*
   TESTA CONTRA JOGADA CONGELADA
   DO GATILHO.
*/

ultima.avaliacoes=
avaliarContraSnapshots(
numero,
ultima.snapshots
);


/*
   GUARDA A JOGADA QUE EXISTIA
   QUANDO ESTE RESULTADO SAIU.

   Se ele for LOSS, depois será
   usado como próximo gatilho.
*/

ultima.snapshotsResultado=
snapshotsAntes;

salvarDuplasVisual();

return {
tipo:"RESULTADO",
dupla:ultima
};

}


/*
   PRIMEIRO RESULTADO FOI LOSS.

   ESTE NÚMERO É O G1.

   CONTINUA TESTANDO CONTRA
   A MESMA JOGADA DO GATILHO.
*/

if(
duplaPrecisaG1(
ultima
)
){

ultima.g1=
numero;

ultima.avaliacoesG1=
avaliarContraSnapshots(
numero,
ultima.snapshots
);

salvarDuplasVisual();

return {
tipo:"G1",
dupla:ultima
};

}


/*
   DUPLA ANTERIOR JÁ TERMINOU.
   NÚMERO NOVO VIRA GATILHO.
*/

duplasVisual.push(

criarDuplaGatilho(
numero,
snapshotsAntes
)

);

duplasVisual=
duplasVisual.slice(-7);

salvarDuplasVisual();

return {
tipo:"NOVO_GATILHO"
};

}


/* ============================================================
   FINALIZAR G1

   EXEMPLO:

   20 → 27 → 8

   O quadro do 20 termina.

   27 fica preparado para ser
   o próximo gatilho.

   A jogada do 27 já estava congelada
   quando o 27 apareceu.
============================================================ */

function finalizarNumeroDuplaDepois(
numero,
controle
){

if(
!controle ||
controle.tipo!=="G1"
)
return;

const d=
controle.dupla;

if(!d)
return;

proximoGatilhoVisual={

numero:
d.resultado,

snapshots:
d.snapshotsResultado || {
AUTO:null,
4:null,
5:null,
6:null
}

};

salvarDuplasVisual();

}


/* ============================================================
   ABRIR PRÓXIMO GATILHO
============================================================ */

function garantirProximoGatilhoVisual(){

if(!proximoGatilhoVisual)
return;

const ultima=
duplasVisual[
duplasVisual.length-1
];

if(
ultima &&
ultima.gatilho===
proximoGatilhoVisual.numero &&
(
ultima.resultado===null ||
ultima.resultado===undefined
)
){

proximoGatilhoVisual=null;
return;

}

duplasVisual.push(

criarDuplaGatilho(

proximoGatilhoVisual.numero,

proximoGatilhoVisual.snapshots

)

);

duplasVisual=
duplasVisual.slice(-7);

proximoGatilhoVisual=null;

salvarDuplasVisual();

}


/* ============================================================
   APAGAR ÚLTIMO DA DUPLA
============================================================ */

function apagarUltimoDaDupla(numero){

proximoGatilhoVisual=null;

if(!duplasVisual.length)
return;

const ultima=
duplasVisual[
duplasVisual.length-1
];


/*
   GATILHO ABERTO
*/

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


/*
   APAGANDO G1
*/

if(
ultima.g1!==null &&
ultima.g1!==undefined &&
ultima.g1===numero
){

ultima.g1=null;

ultima.avaliacoesG1=
avaliacoesVazias();

salvarDuplasVisual();

return;

}


/*
   APAGANDO PRIMEIRO RESULTADO
*/

if(
ultima.resultado!==null &&
ultima.resultado!==undefined &&
ultima.resultado===numero
){

ultima.resultado=null;
ultima.g1=null;

ultima.avaliacoes=
avaliacoesVazias();

ultima.avaliacoesG1=
avaliacoesVazias();

ultima.snapshotsResultado={
AUTO:null,
4:null,
5:null,
6:null
};

salvarDuplasVisual();

return;

}

salvarDuplasVisual();

}



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

function scoreTerminalNumero(numero,momento){

const trio=
momento.terminais.trio;

if(!trio.length)
return 0;

const t=terminal(numero);

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
contagem[tipoCor(n)]++;
});

let alternancias=0;

for(let i=1;i<janela.length;i++){

if(
tipoCor(janela[i])!==
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

const info=momento.cores;

const total=
Math.max(
1,
momento.janela.length
);

const cor=
tipoCor(numero);

let score=
info.contagem[cor]/total;

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

for(let i=1;i<seq.length;i++){

if(seq[i]!==seq[i-1])
alternancias++;

if(seq[i-1] && seq[i])
transicoes[seq[i-1]][seq[i]]++;

}

const atual=
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

const info=momento.zonas;
const z=regiao(numero);

if(!z)
return 0;

const total=
Math.max(
1,
momento.janela.length
);

let score=
info.contagem[z]/total;

if(info.atual){

const linha=
info.transicoes[info.atual];

const soma=
Object.values(linha)
.reduce((a,b)=>a+b,0);

if(soma)
score+=
((linha[z]||0)/soma)*.45;

}

if(
z===info.atual &&
info.repeticaoAtual>=2
)
score+=.10;

return score;

}


/* ============================================================
   NOVO MOTOR AUXILIAR:
   CONCENTRAÇÃO FÍSICA DAS DÚZIAS
============================================================ */

function analisarDuziasFisicas(base){

const janela=
limitar35(base)
.slice(-JANELA_MOMENTO);


/*
   FORÇA BASE DAS TRÊS DÚZIAS NO MOMENTO.
*/

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


/*
   MATRIZ DE CALOR FÍSICA.

   Cada resultado aquece sua posição real na roda
   e as casas próximas.
*/

const calor=new Map();

track.forEach(n=>
calor.set(n,0)
);


janela.forEach((numero,i)=>{

const d=duzia(numero);

if(d)
contagem[d]++;


/*
   RESULTADOS MAIS NOVOS PESAM MAIS.
*/

const recencia=
.45+
((i+1)/
Math.max(1,janela.length))
*.55;


/*
   Peso natural da dúzia do resultado.
*/

if(d){

const mapa=
MAPA_DUZIA_FISICA[d];

const estrutural=
mapa && mapa.has(numero)
?mapa.get(numero)
:.55;

forca[d]+=
recencia*
(.55+.45*estrutural);

}


/*
   CALOR NA RODA.
*/

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


/*
   Agora verificamos quanto cada dúzia
   está fisicamente alinhada com esse calor.
*/

const confluencia={
1:0,
2:0,
3:0
};

[1,2,3].forEach(d=>{

const mapa=
MAPA_DUZIA_FISICA[d];

let soma=0;
let pesoTotal=0;

mapa.forEach((peso,numero)=>{

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


/*
   NORMALIZAÇÃO.
*/

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
forca[d]/maxForca;

const fisica=
confluencia[d]/
maxConfluencia;


/*
   Não usamos apenas frequência.

   35% presença da dúzia
   65% concentração física real.
*/

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
ranking[0] || null,

segunda:
ranking[1] || null

};

}


/* ============================================================
   SCORE DA DÚZIA PARA UM NÚMERO

   IMPORTANTE:
   O NÚMERO RECEBE REFORÇO SE:
   1. sua própria dúzia está forte;
   2. sua posição física está em um bolsão forte;
   3. está perto de uma concentração daquela dúzia.
============================================================ */

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


/*
   Peso estrutural do número
   dentro da concentração da própria dúzia.
*/

const mapa=
MAPA_DUZIA_FISICA[d];

const estrutural=
mapa && mapa.has(numero)
?mapa.get(numero)
:.48;


/*
   Calor físico atual.
*/

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


/*
   Procura também proximidade física com
   os principais números estruturais da dúzia.
*/

let proximidade=0;

if(mapa){

mapa.forEach((peso,alvo)=>{

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


/*
   SCORE AUXILIAR.
*/

return (

item.score*.44 +
estrutural*.22 +
calorNorm*.22 +
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

janela.forEach((numero,i)=>{

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

else if(lateral>miolo)
perfil="LATERAL";

let direcao=0;

if(direita>esquerda+1)
direcao=1;

else if(esquerda>direita+1)
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
fortes:ranking.slice(0,5),
principal:ranking[0]||null

};

}

function scoreCorredorNumero(numero,momento){

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

if(d===2 || d===3)
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
Math.sign(delta)===c.direcao
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
(a,b)=>b.score-a.score
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
   MOMENTO 14
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

/*
   NOVO AUXILIAR
*/
duziasFisicas:
analisarDuziasFisicas(base)

};

}


/* ============================================================
   SCORE DO MOMENTO

   RAIO X NÃO ESTÁ AQUI.
   Esse score é apenas o AUXILIAR usado depois
   sobre os candidatos produzidos pelo Raio X.
============================================================ */

function scoreMomentoNumero(numero,momento){

const scoreBase=(

scoreTerminalNumero(
numero,
momento
)*.31 +

scoreCorNumero(
numero,
momento
)*.10 +

scoreZonaNumero(
numero,
momento
)*.13 +

scoreCorredorNumero(
numero,
momento
)*.30 +

(
momento.densidade.mapa
.get(numero)||0
)*.055

);


/*
   NOVA CONFLUÊNCIA DA DÚZIA.
*/

const scoreDuzia=
scoreDuziaFisicaNumero(
numero,
momento
);


return (
scoreBase +
scoreDuzia*
PESO_DUZIA_FISICA
);

}


function direcaoMomento(centro,momento){

let esquerda=0;
let direita=0;

momento.janela.forEach((numero,i)=>{

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
Math.max(1,momento.janela.length))
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

if(!total)
return {
direcao:0,
forca:0
};

return {

direcao:
direita>esquerda
?1
:(esquerda>direita?-1:0),

forca:
Math.abs(direita-esquerda)/
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

for(let i=0;i<base.length;i++)
eventos[i]=
eventoNumero(base[i]);

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

for(let k=0;k<tamanho;k++){

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

erro+=Math.abs(a0-b0);
erro+=Math.abs(a6-b6);
erro+=Math.abs(a9-b9);

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

return eventos*.80+
forma*.20;

}


function analisarRX(base,rx){

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

if(proximo===undefined)
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
Math.max(4,qtd);

qtd=
Math.min(
qtd,
MAX_REPLICAS,
candidatos.length
);

const replicas=
candidatos.slice(0,qtd);

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
replicas.length<MAX_REPLICAS
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
.filter(x=>x.ocorrencias>0)
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
(s,r)=>s+r.similaridade,
0
)/replicas.length

};

}


/* ============================================================
   FREQUÊNCIA DAS RÉPLICAS
============================================================ */

function frequenciaReplicas(replicas){

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
   LOSS
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
Math.max(esquerda,direita)>=2
){

tipo="BORDA_REPETIDA";
forca=.35;

}else if(
losses.length>=2 &&
Math.max(esquerda,direita)>=2
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
   SCORE RX PURO
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

score+=f*peso;

});

return {
score,
suporte,
numeros
};

}


/* ============================================================
   SCORE AUXILIAR DO MOMENTO PARA O SETOR
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
)*peso;

});

return score/
numeros.length;

}


/* ============================================================
   GIRADA DINÂMICA
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


/*
   REGRA FUNDAMENTAL:
   SEM SUPORTE DO RAIO X,
   A DÚZIA NÃO CRIA UMA JOGADA SOZINHA.
*/

if(rx.suporte<=0)
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


/*
   RX CONTINUA SENDO A BASE.
*/

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
numeros:rx.numeros,
suporte:rx.suporte,
scoreRX:rx.score,
scoreMomento:momentoScore,
score:scoreFinal

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
mapa.get(c.centro);

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
   JOGADA
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

if(dois.length===5)
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
   CONFIG
============================================================ */

function gerarConfig(
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

if(!raioX.valido)
return {
valido:false,
rx:rxTam
};

const jogada=
montarJogada(
raioX,
base,
diagnostico
);

return {

valido:jogada.valido,
rx:rxTam,
raioX,
jogada,
similaridade:
raioX.similaridade

};

}


/* ============================================================
   RESULTADO
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
...jogada.blocos2,
...jogada.blocos1
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
:(d===1?"V1":"V2"),

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
v.filter(x=>x.green).length/
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

const x=lista[i];

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

lossSeguidos:loss,

timeline:lista

};

}


/* ============================================================
   BACKTEST
============================================================ */

function backtest(
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
gerarConfig(
passado,
rxTam,
diag
);

if(!cfg.valido){

timeline.push({

resultado:base[i],
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
   RX / AUTO
============================================================ */

function melhorDoRX(
base,
rxTam
){

const diag=
diagnosticarLosses(
estado.timelines[rxTam]
);

const cfg=
gerarConfig(
base,
rxTam,
diag
);

if(!cfg.valido)
return null;

const bt=
backtest(
base,
rxTam
);

let score=

bt.taxa5*.42+
bt.taxa10*.32+
bt.taxa20*.20+
cfg.similaridade*.06;

if(bt.lossSeguidos===1){

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

const live=
statsTimeline(
estado.timelines[rxTam]
);

if(live.total){

score+=
live.taxa10*.05+
live.taxa20*.025;

}

return {

valido:true,
rx:rxTam,
raioX:cfg.raioX,
jogada:cfg.jogada,
similaridade:cfg.similaridade,
backtest:bt,
live,
score

};

}


function escolherAuto(configs){

const lista=
RX_LIST
.map(rx=>configs[rx])
.filter(
x=>x && x.valido
);

if(!lista.length)
return null;

lista.sort(
(a,b)=>
b.score-a.score ||
b.backtest.taxa10-
a.backtest.taxa10 ||
b.backtest.taxa20-
a.backtest.taxa20
);

return lista[0];

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
!config.valido
)
return null;

return {

assinatura:
assinatura(),

rx:
config.rx,

centros2:
config.jogada
.blocos2
.map(x=>x.centro),

centro1:
config.jogada.blocos1[0]
?config.jogada.blocos1[0].centro
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
numeros:
setor(p.centro1,1)

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


function garantirPendentes(
configs,
auto
){

const sig=
assinatura();

RX_LIST.forEach(rx=>{

if(
estado.pendentes[rx] &&
estado.pendentes[rx]
.assinatura===sig
)
return;

estado.pendentes[rx]=
snapshot(
configs[rx]
);

});

if(
!estado.pendentes.AUTO ||
estado.pendentes.AUTO
.assinatura!==sig
){

estado.pendentes.AUTO=
snapshot(auto);

}

salvarEstado();

}


/* ============================================================
   AVALIA PENDENTES
============================================================ */

function avaliarPendentes(numero){

const sig=
assinatura();

["AUTO",4,5,6]
.forEach(k=>{

const p=
estado.pendentes[k];

if(!p){

estado.timelines[k]
.push({

resultado:numero,
semJogada:true,
green:null,
tipo:"SEM_JOGADA",
lado:0,
hora:Date.now()

});

estado.timelines[k]=
estado.timelines[k]
.slice(-MAX_TIMELINE);

return;

}

if(
p.assinatura!==sig
){

estado.timelines[k]
.push({

resultado:numero,
semJogada:true,
green:null,
tipo:"SEM_JOGADA",
lado:0,
hora:Date.now()

});

estado.timelines[k]=
estado.timelines[k]
.slice(-MAX_TIMELINE);

estado.pendentes[k]=null;

return;

}

const r=
classificarSnapshot(
numero,
p
);

estado.timelines[k]
.push({

resultado:numero,
semJogada:false,
green:r.green,
tipo:r.tipo,
lado:r.lado,
hora:Date.now()

});

estado.timelines[k]=
estado.timelines[k]
.slice(-MAX_TIMELINE);

estado.pendentes[k]=null;

});

salvarEstado();

}


/* ============================================================
   DUPLAS VISUAIS
============================================================ */

function capturarAvaliacoesDoResultado(
numero
){

const resultado={};

["AUTO",4,5,6]
.forEach(k=>{

const lista=
estado.timelines[k]||[];

const item=
lista[
lista.length-1
];

if(
!item ||
item.resultado!==numero
){

resultado[k]=null;
return;

}

if(item.semJogada){

resultado[k]="SEM";

}else{

resultado[k]=
item.green
?"GREEN"
:"LOSS";

}

});

return resultado;

}


function registrarNumeroDupla(numero){

if(!duplasVisual.length){

duplasVisual.push({

gatilho:numero,
resultado:null,

avaliacoes:{
AUTO:null,
4:null,
5:null,
6:null
}

});

salvarDuplasVisual();

return;

}

const ultima=
duplasVisual[
duplasVisual.length-1
];

if(
ultima.resultado===null ||
ultima.resultado===undefined
){

ultima.resultado=
numero;

ultima.avaliacoes=
capturarAvaliacoesDoResultado(
numero
);

}else{

duplasVisual.push({

gatilho:numero,
resultado:null,

avaliacoes:{
AUTO:null,
4:null,
5:null,
6:null
}

});

}

duplasVisual=
duplasVisual.slice(-7);

salvarDuplasVisual();

}


function apagarUltimoDaDupla(numero){

if(!duplasVisual.length)
return;

const ultima=
duplasVisual[
duplasVisual.length-1
];

if(
ultima.resultado===numero
){

ultima.resultado=null;

ultima.avaliacoes={
AUTO:null,
4:null,
5:null,
6:null
};

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

salvarDuplasVisual();

}


/* ============================================================
   INSERÇÃO
============================================================ */

function adicionarNumero(numero){

avaliarPendentes(
numero
);

registrarNumeroDupla(
numero
);

historico.push(numero);

historico=
historico.slice(-35);

salvarHistorico();

render();

}


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

estado.pendentes={
AUTO:null,
4:null,
5:null,
6:null
};

estado.timelines={
AUTO:[],
4:[],
5:[],
6:[]
};

duplasVisual=[];

const visual=
historico.slice(-14);

for(
let i=0;
i<visual.length;
i+=2
){

duplasVisual.push({

gatilho:visual[i],

resultado:
i+1<visual.length
?visual[i+1]
:null,

avaliacoes:{
AUTO:null,
4:null,
5:null,
6:null
}

});

}

salvarDuplasVisual();
salvarHistorico();
salvarEstado();

campo.value="";

render();

}


function apagarUltimo(){

if(!historico.length)
return;

const removido=
historico[
historico.length-1
];

apagarUltimoDaDupla(
removido
);

historico.pop();

estado.pendentes={
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
"Apagar histórico?"
)
)
return;

historico=[];
duplasVisual=[];

estado.pendentes={
AUTO:null,
4:null,
5:null,
6:null
};

estado.timelines={
AUTO:[],
4:[],
5:[],
6:[]
};

salvarDuplasVisual();
salvarHistorico();
salvarEstado();

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
document.createElement("div");

app.innerHTML=`

<style>

*{box-sizing:border-box}

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

.modos{
display:flex;
gap:4px
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

.timelineRow{
display:grid;
grid-template-columns:40px 1fr 42px;
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
font-weight:900
}

.g{
background:#00994d
}

.l{
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


/* DUPLAS */

.duplas14{
display:grid;
grid-template-columns:repeat(7,1fr);
gap:5px;
width:100%
}

.dupla14{
min-width:0;
height:48px;
border-radius:7px;
display:flex;
align-items:center;
justify-content:center;
gap:4px;
background:#272727;
border:2px solid #555
}

.dupla14.green{
background:rgba(0,153,77,.18);
border-color:#00b85c
}

.dupla14.loss{
background:rgba(198,40,40,.18);
border-color:#d93a3a
}

.dupla14.sem{
background:#292929;
border-color:#666
}

.dupla14.aberta{
background:#202020;
border-color:#777;
border-style:dashed
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
font-size:10px;
font-weight:900;
color:#aaa
}


/* DÚZIAS */

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


/* JOGADA */

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

}

</style>


<div class="app">

<h2>ANÁLISE 0 • 6 • 9</h2>


<div class="painel">

<textarea
id="entradaHistorico"
placeholder="Cole o histórico — serão mantidos somente os últimos 35"
></textarea>

<div class="botoes">

<button id="inserir" class="btn verde">
INSERIR
</button>

<button id="apagar" class="btn">
APAGAR ÚLTIMO
</button>

<button id="limpar" class="btn red">
APAGAR TUDO
</button>

</div>

<div id="status" class="status">
PRONTO
</div>

</div>


<div class="painel">

<div class="titulo">
MOTOR
</div>

<div class="modos">

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


<div id="resumo" class="resumo"></div>

<div id="trio" class="trio"></div>

<div id="duzias" class="duziasBox"></div>

<div id="timelineAUTO" class="timelineRow"></div>
<div id="timeline4" class="timelineRow"></div>
<div id="timeline5" class="timelineRow"></div>
<div id="timeline6" class="timelineRow"></div>

</div>


<div class="painel">

<div class="titulo">
ÚLTIMOS 14 • DUPLAS
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

<div id="jogada"></div>

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

document.body.appendChild(app);


/* ============================================================
   EVENTOS
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

document
.getElementById("auto")
.onclick=()=>{

estado.modo="AUTO";

salvarEstado();
render();

};

RX_LIST.forEach(rx=>{

document
.getElementById(
"rx"+rx
)
.onclick=()=>{

estado.modo="MANUAL";
estado.manualRX=rx;

salvarEstado();
render();

};

});


/* ============================================================
   TECLADO
============================================================ */

const teclado=
document.getElementById(
"teclado"
);

for(let n=1;n<=36;n++){

const b=
document.createElement(
"button"
);

b.className="numero";
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

teclado.appendChild(zero);


/* ============================================================
   TIMELINE
============================================================ */

function renderTimeline(
id,
nome,
lista
){

const st=
statsTimeline(lista);

const ultimos=
lista.slice(-20);

document
.getElementById(id)
.innerHTML=

'<div class="nomeTL">'+
nome+
'</div>'+

'<div class="timeline">'+

ultimos.map(x=>{

if(x.semJogada){

return (
'<span class="semJogadaGL">—</span>'
);

}

return (

'<span class="gl '+
(x.green?"g":"l")+
'">'+
(x.green?"G":"L")+
'</span>'

);

}).join("")+

'</div>'+

'<div class="taxaTL">'+
(
st.total
?st.taxa20.toFixed(0)+"%"
:"—"
)+
'</div>';

}


/* ============================================================
   TRIO
============================================================ */

function renderTrio(momento){

const itens=
momento.terminais
.ranking
.slice(0,3);

document
.getElementById("trio")
.innerHTML=

'<div class="trioTitulo">'+
'TERMINAIS DO MOMENTO • COM 1 VIZINHO DE CADA LADO'+
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

function renderDuzias(momento){

const info=
momento.duziasFisicas;

const ranking=
info.ranking;

document
.getElementById("duzias")
.innerHTML=

'<div class="trioTitulo">'+
'CONCENTRAÇÃO FÍSICA DAS DÚZIAS • AUXILIAR DO RAIO X'+
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
   JOGADA
============================================================ */

function renderJogada(config){

const area=
document.getElementById(
"jogada"
);

if(
!config ||
!config.valido
){

area.innerHTML=
'<div style="color:#777">AGUARDANDO DADOS</div>';

return;

}

const dois=
config.jogada
.blocos2
.map(b=>

'<div class="bloco">'+
'<small>2 VIZINHOS DO</small>'+
'<strong>'+b.centro+'</strong>'+
'<div class="numeros">'+
b.numeros.join(" • ")+
'</div>'+
'</div>'

).join("");

const um=
config.jogada
.blocos1
.map(b=>

'<div class="bloco um">'+
'<small>1 VIZINHO DO</small>'+
'<strong>'+b.centro+'</strong>'+
'<div class="numeros">'+
b.numeros.join(" • ")+
'</div>'+
'</div>'

).join("");

area.innerHTML=

'<div class="jogada">'+
dois+
'</div>'+

'<div class="jogada">'+
um+
'</div>';

}


/* ============================================================
   DUPLAS FIXAS
============================================================ */

function renderDuplas14(){

const area=
document.getElementById(
"ultimos14"
);

const lista=
duplasVisual.slice(-7);

const chave=
estado.modo==="AUTO"
?"AUTO"
:estado.manualRX;

let html="";

lista.forEach(d=>{

let classe="sem";

if(
d.resultado===null ||
d.resultado===undefined
){

classe="aberta";

}else{

const avaliacoes=
d.avaliacoes||{};

const avaliacao=
avaliacoes[chave] ||
d.avaliacao ||
null;

if(avaliacao==="GREEN")
classe="green";

else if(avaliacao==="LOSS")
classe="loss";

else
classe="sem";

}

html+=

'<div class="dupla14 '+
classe+
'">'+

'<div class="bolaDupla" style="background:'+
corRoleta(d.gatilho)+
'">'+
d.gatilho+
'</div>'+

'<span class="setaDupla">›</span>'+

(
d.resultado!==null &&
d.resultado!==undefined

?

'<div class="bolaDupla" style="background:'+
corRoleta(d.resultado)+
'">'+
d.resultado+
'</div>'

:

'<div class="bolaDupla" style="background:#444;color:#999">'+
'—'+
'</div>'

)+

'</div>';

});

area.innerHTML=html;

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
analisarMomento(base);

const configs={};

RX_LIST.forEach(rx=>{

configs[rx]=
melhorDoRX(
base,
rx
);

});

const auto=
escolherAuto(
configs
);

garantirPendentes(
configs,
auto
);

const ativa=

estado.modo==="AUTO"

?auto

:configs[
estado.manualRX
];


["auto","rx4","rx5","rx6"]
.forEach(id=>{

document
.getElementById(id)
.classList.remove("ativo");

});

if(
estado.modo==="AUTO"
){

document
.getElementById("auto")
.classList.add("ativo");

}else{

document
.getElementById(
"rx"+estado.manualRX
)
.classList.add("ativo");

}


/* RESUMO */

const live=
statsTimeline(
estado.timelines.AUTO
);

document
.getElementById("resumo")
.innerHTML=

'<div class="card">'+
'<small>BT10</small>'+
'<strong>'+
(
auto
?auto.backtest.taxa10.toFixed(0)+"%"
:"—"
)+
'</strong>'+
'</div>'+

'<div class="card">'+
'<small>BT20</small>'+
'<strong>'+
(
auto
?auto.backtest.taxa20.toFixed(0)+"%"
:"—"
)+
'</strong>'+
'</div>'+

'<div class="card">'+
'<small>REAL10</small>'+
'<strong>'+
(
live.total
?live.taxa10.toFixed(0)+"%"
:"—"
)+
'</strong>'+
'</div>'+

'<div class="card">'+
'<small>REAL20</small>'+
'<strong>'+
(
live.total
?live.taxa20.toFixed(0)+"%"
:"—"
)+
'</strong>'+
'</div>';


renderTrio(
momento
);

renderDuzias(
momento
);

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

renderDuplas14();

renderJogada(
ativa
);


/*
   MOSTRA QUAL DÚZIA ESTÁ MAIS FORTE,
   MAS ELA NÃO É A DONA DA JOGADA.
*/

const df=
momento.duziasFisicas.dominante;

document
.getElementById("status")
.textContent=

base.length+
"/35 • MOMENTO 14 • 35×14 ATIVO"+
(
df
?" • CONCENTRAÇÃO: "+df.duzia+"ª DÚZIA"
:""
);

}


/* ============================================================
   START
============================================================ */

render();

})();
