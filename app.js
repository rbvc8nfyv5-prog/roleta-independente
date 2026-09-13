(function(){

"use strict";

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const TAMANHO_JANELA = 14;

const STORAGE_KEY =
"ANALISADOR_069_IDS_CORRESPONDENTES_V1";

const STORAGE_RX =
"ANALISADOR_069_TAMANHO_RX_V1";

const COR_T0 = "#00c853";
const COR_T6 = "#ffc107";
const COR_T9 = "#2196f3";

const PERCENTUAL_REPLICAS_RX = 0.10;
const MIN_REPLICAS_RX = 15;
const MAX_REPLICAS_RX = 40;
const MIN_ZONAS_RX = 8;


/* =========================================================
   TAMANHO RAIO X
========================================================= */

let TAMANHO_RX = 6;

try{

const salvo =
Number(
localStorage.getItem(STORAGE_RX)
);

if(
salvo === 4 ||
salvo === 5 ||
salvo === 6
){
TAMANHO_RX = salvo;
}

}catch(e){}


/* =========================================================
   ROLETA EUROPEIA
========================================================= */

const track = [
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];


/* =========================================================
   VERMELHOS
========================================================= */

const numerosVermelhos = new Set([
1,3,5,7,9,
12,14,16,18,
19,21,23,25,27,
30,32,34,36
]);


/* =========================================================
   REGIÕES VISUAIS
========================================================= */

const regioesRoleta = {

ZERO:new Set([
0,32,15,26,3,35,12
]),

VOISINS:new Set([
19,4,21,2,25,
28,7,29,18,22
]),

ORPHELINS:new Set([
9,31,14,20,1,17,6,34
]),

TIERS:new Set([
27,13,36,11,30,8,
23,10,5,24,16,33
])

};

const coresRegioes = {
ZERO:"#9bea2c",
VOISINS:"#8a20d4",
ORPHELINS:"#176436",
TIERS:"#29499b"
};


/* =========================================================
   IDS
========================================================= */

const BASES_069 = [
0,10,20,30,
6,16,26,36,
9,19,29
];

const TODOS_IDS_RX = [
0,10,20,30,
6,16,26,36,
9,19,29,39
];

const IDS_ESPECIAIS = {
25:[39],
17:[9],
2:[9]
};


/* =========================================================
   FAMÍLIAS
========================================================= */

function familiaDoId(id){

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


function corDoId(id){

const f =
familiaDoId(id);

if(f === 0) return COR_T0;
if(f === 6) return COR_T6;
if(f === 9) return COR_T9;

return "#555";

}


function corFamilia(f){

if(f === 0) return COR_T0;
if(f === 6) return COR_T6;
if(f === 9) return COR_T9;

return "#aaa";

}


/* =========================================================
   VIZINHOS
========================================================= */

function vizinhos(numero, quantidade = 1){

const indice =
track.indexOf(numero);

if(indice === -1){
return [];
}

const resultado = [numero];

for(
let distancia = 1;
distancia <= quantidade;
distancia++
){

resultado.push(
track[
(
indice -
distancia +
track.length
)
%
track.length
]
);

resultado.push(
track[
(
indice +
distancia
)
%
track.length
]
);

}

return resultado;

}


/* =========================================================
   COBERTURA DOS IDS
========================================================= */

const coberturaDasBases = {};

BASES_069.forEach(function(base){

coberturaDasBases[base] =
new Set(
vizinhos(base,1)
);

});


function idsQueBatem(numero){

const ids = [];

BASES_069.forEach(function(base){

if(
coberturaDasBases[base]
.has(numero)
){
ids.push(base);
}

});


if(
Object.prototype
.hasOwnProperty
.call(
IDS_ESPECIAIS,
numero
)
){

IDS_ESPECIAIS[numero]
.forEach(function(id){

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

.map(familiaDoId)

.filter(function(f){
return f !== null;
})

);

}


/* =========================================================
   REGIÃO VISUAL
========================================================= */

function regiaoDoNumero(numero){

if(regioesRoleta.ZERO.has(numero)){
return "ZERO";
}

if(regioesRoleta.VOISINS.has(numero)){
return "VOISINS";
}

if(regioesRoleta.ORPHELINS.has(numero)){
return "ORPHELINS";
}

if(regioesRoleta.TIERS.has(numero)){
return "TIERS";
}

return null;

}


/* =========================================================
   COR ROLETA
========================================================= */

function corNumeroRoleta(numero){

if(numero === 0){

return {
fundo:"#087c48",
texto:"#ffffff"
};

}

if(
numerosVermelhos.has(numero)
){

return {
fundo:"#c6283d",
texto:"#ffffff"
};

}

return {
fundo:"#181818",
texto:"#ffffff"
};

}


/* =========================================================
   STORAGE
========================================================= */

function carregarHistorico(){

try{

const salvo =
localStorage.getItem(STORAGE_KEY);

if(!salvo){
return [];
}

const dados =
JSON.parse(salvo);

if(!Array.isArray(dados)){
return [];
}

return dados

.map(Number)

.filter(function(numero){

return (
Number.isInteger(numero) &&
numero >= 0 &&
numero <= 36
);

})

.slice(-5000);

}catch(e){

return [];

}

}


let historico =
carregarHistorico();


function salvarHistorico(){

try{

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(historico)
);

}catch(e){}

}


/* =========================================================
   EXTRAIR HISTÓRICO
========================================================= */

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

.filter(function(n){
return n >= 0 && n <= 36;
})

.slice(-5000);

}


/* =========================================================
   ÚLTIMOS 14
========================================================= */

function analisarJanela14(){

const janela =
historico.slice(
-TAMANHO_JANELA
);

return {

janela:janela,

sequencia:

janela.map(function(numero){

return {
numero:numero,
ids:idsQueBatem(numero)
};

})

};

}


/* =========================================================
   TRAJETÓRIA 0 / 6 / 9
========================================================= */

function gerarTrajetoria(janela){

let t0 = 0;
let t6 = 0;
let t9 = 0;

const pontos = [];
const eventos = [];

janela.forEach(function(numero,index){

const familias =
familiasQueBatem(numero);

const bate0 =
familias.has(0) ? 1 : 0;

const bate6 =
familias.has(6) ? 1 : 0;

const bate9 =
familias.has(9) ? 1 : 0;

t0 += bate0;
t6 += bate6;
t9 += bate9;

eventos.push({
t0:bate0,
t6:bate6,
t9:bate9
});

pontos.push({
posicao:index+1,
numero:numero,
t0:t0,
t6:t6,
t9:t9
});

});

return {
pontos:pontos,
eventos:eventos,
total0:t0,
total6:t6,
total9:t9
};

}


/* =========================================================
   CHAVE EVENTO
========================================================= */

function chaveEvento(evento){

let chave = "";

if(evento.t0){
chave += "0";
}

if(evento.t6){
chave += "6";
}

if(evento.t9){
chave += "9";
}

if(!chave){
chave = "-";
}

return chave;

}


/* =========================================================
   SIMILARIDADE
========================================================= */

function calcularSimilaridade(
janelaAtual,
janelaAntiga
){

const tamanho =
janelaAtual.length;

if(
!tamanho ||
janelaAntiga.length !== tamanho
){
return 0;
}

const atual =
gerarTrajetoria(janelaAtual);

const antiga =
gerarTrajetoria(janelaAntiga);


let eventosIguais = 0;

for(
let i=0;
i<tamanho;
i++
){

if(
chaveEvento(atual.eventos[i])
===
chaveEvento(antiga.eventos[i])
){
eventosIguais++;
}

}

const scoreEventos =
(
eventosIguais /
tamanho
)
*
100;


let erro = 0;

for(
let i=0;
i<tamanho;
i++
){

erro +=
Math.abs(
atual.pontos[i].t0 -
antiga.pontos[i].t0
);

erro +=
Math.abs(
atual.pontos[i].t6 -
antiga.pontos[i].t6
);

erro +=
Math.abs(
atual.pontos[i].t9 -
antiga.pontos[i].t9
);

}

const maxErro =
tamanho *
tamanho *
3;

let scoreForma =
1 -
(
erro /
maxErro
);

scoreForma =
Math.max(
0,
Math.min(
1,
scoreForma
)
)
*
100;


return (
scoreEventos * 0.80
+
scoreForma * 0.20
);

}


/* =========================================================
   PROCURAR RÉPLICAS
========================================================= */

function procurarReplicas(){

const tamanho =
TAMANHO_RX;

const total =
historico.length;

if(
total <
(
tamanho * 2 +
1
)
){

return {
suficiente:false,
replicas:[],
totalJanelas:0
};

}


const inicioAtual =
total -
tamanho;

const janelaAtual =
historico.slice(
inicioAtual,
total
);

const todas = [];


for(
let inicio=0;
inicio+tamanho<inicioAtual;
inicio++
){

const fim =
inicio+tamanho;

const janelaAntiga =
historico.slice(
inicio,
fim
);

const proximo =
historico[fim];

if(
proximo === undefined
){
continue;
}

const similaridade =
calcularSimilaridade(
janelaAtual,
janelaAntiga
);

const distancia =
inicioAtual -
fim;

todas.push({

inicio:inicio,
fim:fim,
proximo:proximo,
similaridade:similaridade,
distancia:distancia

});

}


todas.sort(function(a,b){

if(
Math.abs(
b.similaridade -
a.similaridade
)
>
0.0001
){

return (
b.similaridade -
a.similaridade
);

}

return (
a.distancia -
b.distancia
);

});


return {
suficiente:true,
replicas:todas,
totalJanelas:todas.length
};

}


/* =========================================================
   CONTAR ZONAS
========================================================= */

function contarZonasDoGrupo(grupo){

const zonas =
new Set();

grupo.forEach(function(item){

idsQueBatem(
item.proximo
)
.forEach(function(id){

if(
TODOS_IDS_RX.includes(id)
){
zonas.add(id);
}

});

});

return zonas;

}


/* =========================================================
   SELEÇÃO DAS RÉPLICAS
========================================================= */

function selecionarReplicas(){

const busca =
procurarReplicas();

if(
!busca.suficiente
){

return {
estado:"AGUARDANDO",
replicas:[],
melhor:0,
nivel:0,
totalJanelas:0
};

}

if(
!busca.replicas.length
){

return {
estado:"SEM DADOS",
replicas:[],
melhor:0,
nivel:0,
totalJanelas:0
};

}


const totalDisponivel =
busca.replicas.length;


let quantidadeInicial =
Math.ceil(
totalDisponivel *
PERCENTUAL_REPLICAS_RX
);


quantidadeInicial =
Math.max(
quantidadeInicial,
MIN_REPLICAS_RX
);


quantidadeInicial =
Math.min(
quantidadeInicial,
totalDisponivel,
MAX_REPLICAS_RX
);


const grupo =
busca.replicas.slice(
0,
quantidadeInicial
);


let zonas =
contarZonasDoGrupo(grupo);


let indice =
quantidadeInicial;


while(
zonas.size < MIN_ZONAS_RX &&
indice < totalDisponivel &&
grupo.length < MAX_REPLICAS_RX
){

grupo.push(
busca.replicas[indice]
);

indice++;

zonas =
contarZonasDoGrupo(
grupo
);

}


return {

estado:
grupo.length
? "OK"
: "SEM DADOS",

replicas:grupo,

melhor:
busca.replicas[0]
.similaridade,

nivel:
grupo.length
? grupo[
grupo.length-1
].similaridade
: 0,

totalJanelas:
totalDisponivel

};

}


/* =========================================================
   LEITURA DA MESA
========================================================= */

function analisarMesaAtual(){

const mapa =
new Map();


TODOS_IDS_RX.forEach(function(id){

mapa.set(
id,
{

id:id,

incidencias14:0,
incidencias20:0,

maisRecente14:Infinity,
maisRecente20:Infinity

}
);

});


function ler(
janela,
campoIncidencia,
campoRecencia
){

janela.forEach(function(numero,index){

const distancia =
janela.length -
1 -
index;

idsQueBatem(numero)
.forEach(function(id){

if(!mapa.has(id)){
return;
}

const registro =
mapa.get(id);

registro[campoIncidencia]++;

registro[campoRecencia] =
Math.min(
registro[campoRecencia],
distancia
);

});

});

}


ler(
historico.slice(-20),
"incidencias20",
"maisRecente20"
);

ler(
historico.slice(-14),
"incidencias14",
"maisRecente14"
);


const lista =
Array.from(
mapa.values()
);


lista.sort(function(a,b){

if(
b.incidencias14 !==
a.incidencias14
){

return (
b.incidencias14 -
a.incidencias14
);

}

if(
a.maisRecente14 !==
b.maisRecente14
){

return (
a.maisRecente14 -
b.maisRecente14
);

}

if(
b.incidencias20 !==
a.incidencias20
){

return (
b.incidencias20 -
a.incidencias20
);

}

if(
a.maisRecente20 !==
b.maisRecente20
){

return (
a.maisRecente20 -
b.maisRecente20
);

}

return (

TODOS_IDS_RX.indexOf(a.id)
-
TODOS_IDS_RX.indexOf(b.id)

);

});


return lista;

}


/* =========================================================
   RANKING BRUTO RX
========================================================= */

function gerarRankingBrutoRX(){

const selecao =
selecionarReplicas();


const mapa =
new Map();


TODOS_IDS_RX.forEach(function(id){

mapa.set(
id,
{

id:id,
ocorrencias:0,
melhorSimilaridade:0,
maisRecente:Infinity,
origem:"RX"

}
);

});


if(
selecao.estado !==
"OK"
){

return {

selecao:selecao,

ranking:[],

familias:{
0:0,
6:0,
9:0
},

lider:null,

similaridade:0

};

}


let somaSimilaridade = 0;

let cont0 = 0;
let cont6 = 0;
let cont9 = 0;

let totalFamilias = 0;


selecao.replicas
.forEach(function(item){

somaSimilaridade +=
item.similaridade;


/* IDS */

idsQueBatem(
item.proximo
)
.forEach(function(id){

if(!mapa.has(id)){
return;
}

const registro =
mapa.get(id);

registro.ocorrencias++;

registro.melhorSimilaridade =
Math.max(
registro.melhorSimilaridade,
item.similaridade
);

registro.maisRecente =
Math.min(
registro.maisRecente,
item.distancia
);

});


/* FAMÍLIAS */

const familias =
Array.from(
familiasQueBatem(
item.proximo
)
);


if(familias.length){

const fracao =
1 /
familias.length;


familias.forEach(function(f){

if(f === 0){
cont0 += fracao;
}

if(f === 6){
cont6 += fracao;
}

if(f === 9){
cont9 += fracao;
}

});


totalFamilias++;

}

});


let p0 = 0;
let p6 = 0;
let p9 = 0;


if(totalFamilias){

p0 =
cont0 /
totalFamilias *
100;

p6 =
cont6 /
totalFamilias *
100;

p9 =
cont9 /
totalFamilias *
100;

}


const ordem =
new Map();


TODOS_IDS_RX
.forEach(function(id,index){

ordem.set(
id,
index
);

});


const ranking =
Array.from(
mapa.values()
)

.filter(function(item){

return (
item.ocorrencias > 0
);

});


ranking.sort(function(a,b){

if(
b.ocorrencias !==
a.ocorrencias
){

return (
b.ocorrencias -
a.ocorrencias
);

}


if(
Math.abs(
b.melhorSimilaridade -
a.melhorSimilaridade
)
>
0.0001
){

return (
b.melhorSimilaridade -
a.melhorSimilaridade
);

}


if(
a.maisRecente !==
b.maisRecente
){

return (
a.maisRecente -
b.maisRecente
);

}


return (

ordem.get(a.id)
-
ordem.get(b.id)

);

});


const familiasOrdenadas = [

{
familia:0,
valor:p0
},

{
familia:6,
valor:p6
},

{
familia:9,
valor:p9
}

];


familiasOrdenadas
.sort(function(a,b){

return (
b.valor -
a.valor
);

});


const lider =
familiasOrdenadas[0]
.valor > 0

?
familiasOrdenadas[0]

:
null;


return {

selecao:selecao,

ranking:ranking,

familias:{
0:p0,
6:p6,
9:p9
},

lider:lider,

similaridade:
selecao.replicas.length
?
somaSimilaridade /
selecao.replicas.length
:
0

};

}


/* =========================================================
   COBERTURA DO ID
========================================================= */

function coberturaDoIdParaJogada(id){

if(id === 39){
return [25];
}


if(
Object.prototype
.hasOwnProperty.call(
coberturaDasBases,
id
)
){

return Array.from(
coberturaDasBases[id]
);

}

return [];

}


/* =========================================================
   TOP 8 EFETIVO
========================================================= */

function gerarTop8Efetivo(){

const bruto =
gerarRankingBrutoRX();


const candidatos =
bruto.ranking
.map(function(item){

return {
...item
};

});


/* =====================================================
   COMPLEMENTA PELA MESA
===================================================== */

const mesa =
analisarMesaAtual();


mesa.forEach(function(item){

if(
candidatos.some(function(x){
return x.id === item.id;
})
){
return;
}


if(
item.incidencias14 <= 0 &&
item.incidencias20 <= 0
){
return;
}


candidatos.push({

id:item.id,

ocorrencias:
item.incidencias14 > 0
?
item.incidencias14
:
item.incidencias20,

melhorSimilaridade:0,

maisRecente:
item.maisRecente14 !== Infinity
?
item.maisRecente14
:
item.maisRecente20,

origem:
item.incidencias14 > 0
?
"MESA 14"
:
"MESA 20"

});

});


const selecionados = [];

const usados =
new Set();


for(
let i=0;
i<candidatos.length;
i++
){

if(
selecionados.length >= 8
){
break;
}


const atual =
candidatos[i];


if(
usados.has(
atual.id
)
){
continue;
}


/* =================================================
   ZERO + 26
================================================= */

if(
atual.id === 0 ||
atual.id === 26
){

const outro =
atual.id === 0
?
26
:
0;


const outroCandidato =
candidatos.find(function(x){

return (
x.id === outro
);

});


if(
outroCandidato &&
!usados.has(outro)
){

selecionados.push({

tipo:"ZERO26",

ids:[0,26],

idPrincipal:0,

label:"0 + 3",

ocorrencias:
atual.ocorrencias +
outroCandidato.ocorrencias,

origem:
(
atual.origem === "RX" ||
outroCandidato.origem === "RX"
)
?
"RX"
:
atual.origem,

cobertura:
new Set([
26,
0,
32,
3
])

});


usados.add(0);
usados.add(26);

continue;

}

}


/* =================================================
   NORMAL
================================================= */

selecionados.push({

tipo:"NORMAL",

ids:[
atual.id
],

idPrincipal:
atual.id,

label:
String(
atual.id
),

ocorrencias:
atual.ocorrencias,

origem:
atual.origem,

cobertura:
new Set(
coberturaDoIdParaJogada(
atual.id
)
)

});


usados.add(
atual.id
);

}


/* =====================================================
   COMPLEMENTO FINAL
===================================================== */

if(
selecionados.length < 8
){

TODOS_IDS_RX
.forEach(function(id){

if(
selecionados.length >= 8
){
return;
}


if(
usados.has(id)
){
return;
}


selecionados.push({

tipo:"NORMAL",

ids:[id],

idPrincipal:id,

label:String(id),

ocorrencias:0,

origem:"SEM DADOS",

cobertura:
new Set(
coberturaDoIdParaJogada(id)
)

});


usados.add(id);

});

}


return {

...bruto,

top8:
selecionados.slice(
0,
8
)

};

}


/* =========================================================
   ALVOS
========================================================= */

function gerarAlvosDaJogada(top8){

const alvos =
new Set();


top8.forEach(function(item){

item.cobertura
.forEach(function(numero){

alvos.add(numero);

});

});


return alvos;

}


/* =========================================================
   FORÇA DE UM BLOCO

   SOMA AS INCIDÊNCIAS DAS ZONAS
   DO TOP 8 QUE O BLOCO ATINGE.
========================================================= */

function calcularForcaBloco(
numeros,
top8
){

const conjunto =
new Set(numeros);

let forca = 0;

const zonasAtingidas = [];


top8.forEach(function(item){

let bate = false;


item.cobertura
.forEach(function(numero){

if(
conjunto.has(numero)
){
bate = true;
}

});


if(bate){

forca +=
item.ocorrencias;

zonasAtingidas.push(
item.label
);

}

});


return {

forca:forca,

zonasAtingidas:
zonasAtingidas

};

}


/* =========================================================
   NÚMEROS NOVOS
========================================================= */

function numerosNovosDoBloco(
numeros,
faltando
){

const encontrados = [];


numeros.forEach(function(numero){

if(
faltando.has(numero)
){

encontrados.push(
numero
);

}

});


return encontrados;

}


/* =========================================================
   MELHOR BLOCO DE 2 VIZINHOS
========================================================= */

function melhorBloco2Vizinhos(
faltando,
top8
){

let melhor = null;


track.forEach(function(centro){

const numeros =
vizinhos(
centro,
2
);


const novos =
numerosNovosDoBloco(
numeros,
faltando
);


/*
  2 VIZINHOS SÓ ENTRA
  SE PEGAR PELO MENOS
  2 ALVOS NOVOS.
*/

if(
novos.length < 2
){
return;
}


const dadosForca =
calcularForcaBloco(
numeros,
top8
);


const extras =
numeros.filter(function(n){

return (
!faltando.has(n)
);

}).length;


const candidato = {

centro:centro,

quantidade:2,

numeros:numeros,

novos:novos,

ganho:
novos.length,

extras:extras,

forca:
dadosForca.forca,

zonasAtingidas:
dadosForca.zonasAtingidas

};


if(!melhor){

melhor =
candidato;

return;

}


/* =====================================================
   1. COBRE MAIS NÚMEROS NOVOS
===================================================== */

if(
candidato.ganho >
melhor.ganho
){

melhor =
candidato;

return;

}


if(
candidato.ganho <
melhor.ganho
){
return;
}


/* =====================================================
   2. MAIOR INCIDÊNCIA DO RAIO X
===================================================== */

if(
candidato.forca >
melhor.forca
){

melhor =
candidato;

return;

}


if(
candidato.forca <
melhor.forca
){
return;
}


/* =====================================================
   3. MENOS EXTRAS
===================================================== */

if(
candidato.extras <
melhor.extras
){

melhor =
candidato;

return;

}


if(
candidato.extras >
melhor.extras
){
return;
}


/* =====================================================
   4. ORDEM DA ROLETA
===================================================== */

if(
track.indexOf(
candidato.centro
)
<
track.indexOf(
melhor.centro
)
){

melhor =
candidato;

}

});


return melhor;

}


/* =========================================================
   MELHOR BLOCO DE 1 VIZINHO
========================================================= */

function melhorBloco1Vizinho(
faltando,
top8
){

let melhor = null;


track.forEach(function(centro){

const numeros =
vizinhos(
centro,
1
);


const novos =
numerosNovosDoBloco(
numeros,
faltando
);


if(
!novos.length
){
return;
}


const dadosForca =
calcularForcaBloco(
numeros,
top8
);


const extras =
numeros.filter(function(n){

return (
!faltando.has(n)
);

}).length;


const candidato = {

centro:centro,

quantidade:1,

numeros:numeros,

novos:novos,

ganho:
novos.length,

extras:extras,

forca:
dadosForca.forca,

zonasAtingidas:
dadosForca.zonasAtingidas

};


if(!melhor){

melhor =
candidato;

return;

}


/* =====================================================
   1. MAIS ALVOS NOVOS
===================================================== */

if(
candidato.ganho >
melhor.ganho
){

melhor =
candidato;

return;

}


if(
candidato.ganho <
melhor.ganho
){
return;
}


/* =====================================================
   2. MAIOR INCIDÊNCIA
===================================================== */

if(
candidato.forca >
melhor.forca
){

melhor =
candidato;

return;

}


if(
candidato.forca <
melhor.forca
){
return;
}


/* =====================================================
   3. MENOS EXTRAS
===================================================== */

if(
candidato.extras <
melhor.extras
){

melhor =
candidato;

return;

}


if(
candidato.extras >
melhor.extras
){
return;
}


/* =====================================================
   4. ORDEM DA ROLETA
===================================================== */

if(
track.indexOf(
candidato.centro
)
<
track.indexOf(
melhor.centro
)
){

melhor =
candidato;

}

});


return melhor;

}


/* =========================================================
   JOGADA

   PRIMEIRO 2 VIZINHOS.
   DEPOIS 1 VIZINHO.

   NO FINAL:
   ORDENA MAIOR INCIDÊNCIA -> MENOR.
========================================================= */

function montarJogada(top8){

const alvos =
gerarAlvosDaJogada(
top8
);


const faltando =
new Set(
alvos
);


const blocos2 = [];

const blocos1 = [];


/* =====================================================
   2 VIZINHOS
===================================================== */

while(
faltando.size > 0
){

const melhor =
melhorBloco2Vizinhos(
faltando,
top8
);


if(!melhor){
break;
}


blocos2.push(
melhor
);


melhor.novos
.forEach(function(numero){

faltando.delete(
numero
);

});

}


/* =====================================================
   1 VIZINHO PARA COMPLETAR
===================================================== */

while(
faltando.size > 0
){

const melhor =
melhorBloco1Vizinho(
faltando,
top8
);


if(!melhor){
break;
}


blocos1.push(
melhor
);


melhor.novos
.forEach(function(numero){

faltando.delete(
numero
);

});

}


/* =====================================================
   RECALCULA A FORÇA FINAL DE CADA BLOCO
===================================================== */

blocos2.forEach(function(bloco){

const dados =
calcularForcaBloco(
bloco.numeros,
top8
);

bloco.forca =
dados.forca;

bloco.zonasAtingidas =
dados.zonasAtingidas;

});


blocos1.forEach(function(bloco){

const dados =
calcularForcaBloco(
bloco.numeros,
top8
);

bloco.forca =
dados.forca;

bloco.zonasAtingidas =
dados.zonasAtingidas;

});


/* =====================================================
   ORDEM:
   MAIOR INCIDÊNCIA PRIMEIRO
===================================================== */

function ordenarBlocos(a,b){

if(
b.forca !==
a.forca
){

return (
b.forca -
a.forca
);

}


if(
b.ganho !==
a.ganho
){

return (
b.ganho -
a.ganho
);

}


return (

track.indexOf(a.centro)
-
track.indexOf(b.centro)

);

}


blocos2.sort(
ordenarBlocos
);


blocos1.sort(
ordenarBlocos
);


/* =====================================================
   NÚMEROS APOSTADOS / COBERTURA
===================================================== */

const numerosApostados =
new Set();


blocos2
.forEach(function(bloco){

bloco.numeros
.forEach(function(numero){

numerosApostados.add(
numero
);

});

});


blocos1
.forEach(function(bloco){

bloco.numeros
.forEach(function(numero){

numerosApostados.add(
numero
);

});

});


const cobertos =
new Set();


alvos
.forEach(function(numero){

if(
numerosApostados.has(numero)
){

cobertos.add(
numero
);

}

});


return {

alvos:alvos,

blocos2:blocos2,

blocos1:blocos1,

numerosApostados:
numerosApostados,

cobertos:
cobertos,

faltando:
faltando,

completa:
faltando.size === 0

};

}


/* =========================================================
   RAIO X COMPLETO
========================================================= */

function analisarRaioX(){

const dados =
gerarTop8Efetivo();


const jogada =
montarJogada(
dados.top8
);


return {

estado:
dados.lider
?
"SINAL " +
dados.lider.familia
:
"SEM SINAL",

tamanho:
TAMANHO_RX,

replicas:
dados.selecao
.replicas.length,

totalJanelas:
dados.selecao
.totalJanelas || 0,

similaridade:
dados.similaridade,

familias:
dados.familias,

lider:
dados.lider,

ranking:
dados.top8,

jogada:
jogada

};

}


/* =========================================================
   ALTERAR RAIO X
========================================================= */

function alterarTamanhoRaioX(
tamanho
){

if(
tamanho !== 4 &&
tamanho !== 5 &&
tamanho !== 6
){
return;
}


TAMANHO_RX =
tamanho;


try{

localStorage.setItem(
STORAGE_RX,
String(TAMANHO_RX)
);

}catch(e){}


atualizarBotoesRX();

render();

}


/* =========================================================
   AÇÕES
========================================================= */

function inserirHistorico(){

const campo =
document.getElementById(
"entradaHistorico"
);


const numeros =
extrairNumeros(
campo.value
);


if(
!numeros.length
){

statusArea.textContent =
"Nenhum número válido.";

statusArea.style.color =
"#ff5252";

return;

}


historico =
numeros.slice(-5000);


salvarHistorico();


campo.value = "";


statusArea.textContent =
historico.length +
" números carregados.";


statusArea.style.color =
"#00e676";


render();

}


function adicionarNumero(numero){

historico.push(
numero
);


if(
historico.length >
5000
){

historico.shift();

}


salvarHistorico();


statusArea.textContent =
"Número " +
numero +
" inserido.";


statusArea.style.color =
"#00e5ff";


render();

}


function apagarUltimo(){

if(
!historico.length
){
return;
}


const apagado =
historico.pop();


salvarHistorico();


statusArea.textContent =
"Número " +
apagado +
" apagado.";


statusArea.style.color =
"#ffc107";


render();

}


function apagarTudo(){

if(
!window.confirm(
"Apagar todo o histórico?"
)
){
return;
}


historico = [];


salvarHistorico();


statusArea.textContent =
"Histórico apagado.";


statusArea.style.color =
"#ff5252";


render();

}


/* =========================================================
   INTERFACE
========================================================= */

document.body.innerHTML = "";

document.body.style.margin = "0";
document.body.style.background = "#101010";
document.body.style.color = "#fff";
document.body.style.fontFamily =
"Arial,sans-serif";


const app =
document.createElement(
"div"
);


app.innerHTML = `

<style>

*{
box-sizing:border-box;
}

button,
textarea{
font-family:Arial,sans-serif;
}

button{
cursor:pointer;
touch-action:manipulation;
}

.app069{
max-width:850px;
margin:auto;
padding:7px;
}

h2{
text-align:center;
margin:5px 0 10px;
font-size:22px;
}

.painel{
background:#1d1d1f;
border:1px solid #444;
border-radius:10px;
padding:9px;
margin-bottom:8px;
}

.tituloPainel{
font-size:11px;
font-weight:900;
color:#aaa;
}

.cabecalhoPainel{
display:flex;
align-items:center;
justify-content:space-between;
gap:6px;
}

.cabecalhoDireita{
display:flex;
align-items:center;
gap:5px;
}

.btnMostrar{
background:#292929;
border:1px solid #555;
color:#ddd;
border-radius:6px;
padding:5px 8px;
font-size:10px;
font-weight:900;
}

.conteudoOculto{
display:none;
margin-top:8px;
}


/* =====================================================
   RX
===================================================== */

.seletorRX{
display:flex;
gap:3px;
}

.btnRX{
min-width:29px;
height:27px;
padding:0 6px;
background:#202020;
border:1px solid #555;
border-radius:6px;
color:#888;
font-size:11px;
font-weight:900;
}

.btnRX.ativo{
background:#00a6c7;
border-color:#00e5ff;
color:#fff;
box-shadow:0 0 5px rgba(0,229,255,.35);
}


/* =====================================================
   ENTRADA
===================================================== */

textarea{
width:100%;
height:72px;
background:#111;
color:#fff;
border:1px solid #555;
border-radius:7px;
padding:8px;
resize:vertical;
}

.acoes{
display:flex;
gap:5px;
flex-wrap:wrap;
margin-top:6px;
}

.btn{
background:#333;
color:#fff;
border:1px solid #555;
border-radius:7px;
padding:8px 10px;
font-weight:900;
}

.btnVerde{
background:#146238;
}

.btnVermelho{
background:#762832;
}

.status{
margin-top:6px;
font-size:11px;
font-weight:900;
color:#aaa;
}


/* =====================================================
   ÚLTIMOS 14
===================================================== */

.linhaAnalise{
display:grid;
grid-template-columns:65px minmax(0,1fr);
gap:5px;
align-items:center;
margin-top:7px;
}

.rotulo{
font-size:9px;
font-weight:900;
color:#aaa;
}

.scrollLinha{
display:flex;
gap:4px;
overflow-x:auto;
padding-bottom:2px;
}

.numeroRoleta,
.numeroRegiao,
.idBox{
min-width:35px;
height:35px;
display:flex;
align-items:center;
justify-content:center;
font-weight:900;
font-size:13px;
}

.numeroRoleta{
border-radius:50%;
border:2px solid rgba(255,255,255,.75);
}

.numeroRegiao{
border-radius:7px;
border:1px solid #aaa;
}

.idBox{
border-radius:7px;
background:#111;
border:1px solid #444;
gap:2px;
padding:2px;
}

.tagID{
font-size:11px;
font-weight:900;
padding:6px 4px;
border-radius:5px;
color:#fff;
}

.semID{
color:#555;
}

.legendaRegioes{
display:flex;
justify-content:center;
gap:8px;
flex-wrap:wrap;
margin-top:8px;
font-size:9px;
color:#aaa;
}

.itemRegiao{
display:flex;
align-items:center;
gap:4px;
}

.corRegiao{
width:10px;
height:10px;
border-radius:3px;
}


/* =====================================================
   JOGADA
===================================================== */

.jogadaBox{
background:#101010;
border:1px solid #444;
border-radius:8px;
padding:8px;
}

.jogadaResumo{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:5px;
margin-bottom:8px;
}

.jogadaResumoCard{
background:#181818;
border:1px solid #333;
border-radius:7px;
padding:6px;
text-align:center;
}

.jogadaResumoCard small{
display:block;
font-size:8px;
color:#888;
font-weight:900;
}

.jogadaResumoCard strong{
display:block;
font-size:17px;
margin-top:3px;
}

.jogadaSubtitulo{
font-size:9px;
font-weight:900;
color:#aaa;
margin:8px 0 5px;
}

.linhaJogadas{
display:flex;
gap:5px;
overflow-x:auto;
padding-bottom:3px;
}

.blocoJogada{
min-width:128px;
background:#181818;
border:1px solid #00e5ff;
border-radius:8px;
padding:7px;
text-align:center;
}

.blocoJogada.um{
border-color:#ffc107;
}

.blocoJogada small{
display:block;
font-size:8px;
color:#888;
font-weight:900;
}

.blocoJogada strong{
display:block;
font-size:20px;
margin:3px 0;
}

.blocoJogada .centro2{
color:#00e5ff;
}

.blocoJogada .centro1{
color:#ffc107;
}

.incidenciaJogada{
font-size:13px !important;
font-weight:900 !important;
color:#ffffff !important;
margin-top:4px;
}

.numerosBloco{
font-size:9px;
color:#bbb;
font-weight:900;
line-height:1.4;
margin-top:4px;
}


/* =====================================================
   RAIO X
===================================================== */

.raiox{
background:#101010;
border:1px solid #444;
border-radius:8px;
padding:8px;
}

.rxTopo{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:5px;
margin-bottom:7px;
}

.rxCard{
background:#181818;
border:1px solid #333;
border-radius:7px;
padding:6px;
text-align:center;
}

.rxCard small{
display:block;
font-size:8px;
color:#888;
font-weight:900;
}

.rxCard strong{
display:block;
font-size:15px;
margin-top:3px;
}

.rxFamilias{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:5px;
margin-bottom:7px;
}

.rxFamilia{
background:#171717;
border:1px solid #333;
border-radius:7px;
padding:6px 3px;
text-align:center;
}

.rxFamilia strong{
font-size:17px;
}

.rxFamilia small{
display:block;
font-size:8px;
color:#888;
margin-top:2px;
}

.rxSinal{
background:#111;
border:1px solid #444;
border-radius:8px;
text-align:center;
padding:8px;
margin-bottom:8px;
}

.rxSinal small{
display:block;
font-size:8px;
font-weight:900;
color:#888;
}

.rxSinal strong{
display:block;
font-size:26px;
margin-top:3px;
}

.rxRanking{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:4px;
}

.rxNumero{
background:#181818;
border:1px solid #3c3c3c;
border-radius:7px;
text-align:center;
padding:7px 2px;
min-height:68px;
}

.rxNumero strong{
display:block;
font-size:18px;
}

.rxNumero small{
display:block;
font-size:8px;
color:#888;
margin-top:2px;
}

.rxOrigem{
font-size:7px !important;
font-weight:900;
}

.zero26{
border-width:2px;
}


/* =====================================================
   TECLADO
===================================================== */

.teclado{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:4px;
margin-top:7px;
}

.numeroBtn{
height:40px;
border:1px solid #666;
border-radius:7px;
color:#fff;
font-weight:900;
font-size:14px;
}

.zeroBtn{
grid-column:span 6;
}


/* =====================================================
   HISTÓRICO
===================================================== */

.historico{
display:flex;
gap:4px;
overflow-x:auto;
}

.histNumero{
min-width:31px;
height:31px;
display:flex;
align-items:center;
justify-content:center;
border-radius:6px;
border:1px solid #555;
font-size:12px;
font-weight:900;
}

.janelaAtual{
border:2px solid #00e5ff;
}

.ultimo{
box-shadow:0 0 8px #00e5ff;
}


/* =====================================================
   MOBILE
===================================================== */

@media(max-width:600px){

.app069{
padding:5px;
}

.painel{
padding:7px;
}

.linhaAnalise{
grid-template-columns:58px minmax(0,1fr);
}

.numeroRoleta,
.numeroRegiao,
.idBox{
min-width:34px;
height:34px;
}

.rxTopo{
grid-template-columns:repeat(3,1fr);
}

.blocoJogada{
min-width:118px;
}

}

</style>


<div class="app069">

<h2>
Análise 0 • 6 • 9
</h2>


<section class="painel">

<textarea
id="entradaHistorico"
placeholder="Cole o histórico do mais antigo para o mais recente..."
></textarea>

<div class="acoes">

<button
id="btnInserir"
class="btn btnVerde"
>
Inserir histórico
</button>

<button
id="btnApagarUltimo"
class="btn"
>
Apagar último
</button>

<button
id="btnApagarTudo"
class="btn btnVermelho"
>
Apagar tudo
</button>

</div>

<div
id="statusArea"
class="status"
>
Cole o histórico ou use o teclado.
</div>

</section>


<section class="painel">

<div class="tituloPainel">
ÚLTIMOS
<span id="qtdJanela">
0
</span>/14
</div>


<div class="linhaAnalise">

<div class="rotulo">
ROLETA
</div>

<div
id="linhaCores"
class="scrollLinha"
></div>

</div>


<div class="linhaAnalise">

<div class="rotulo">
REGIÕES
</div>

<div
id="linhaRegioes"
class="scrollLinha"
></div>

</div>


<div class="linhaAnalise">

<div class="rotulo">
ID<br>0 • 6 • 9
</div>

<div
id="linhaIds"
class="scrollLinha"
></div>

</div>


<div class="legendaRegioes">

<div class="itemRegiao">
<span
class="corRegiao"
style="background:#9bea2c"
></span>
Zero
</div>

<div class="itemRegiao">
<span
class="corRegiao"
style="background:#8a20d4"
></span>
Voisins
</div>

<div class="itemRegiao">
<span
class="corRegiao"
style="background:#176436"
></span>
Orphelins
</div>

<div class="itemRegiao">
<span
class="corRegiao"
style="background:#29499b"
></span>
Tiers
</div>

</div>

</section>


<!-- =====================================================
     JOGADA
===================================================== -->

<section class="painel">

<div class="cabecalhoPainel">

<div class="tituloPainel">
JOGADA SUGERIDA
</div>

<button
id="btnMostrarJogada"
class="btnMostrar"
>
Mostrar
</button>

</div>

<div
id="conteudoJogada"
class="conteudoOculto"
>

<div
id="jogadaArea"
class="jogadaBox"
></div>

</div>

</section>


<!-- =====================================================
     RAIO X
===================================================== -->

<section class="painel">

<div class="cabecalhoPainel">

<div class="tituloPainel">
RAIO X
</div>

<div class="cabecalhoDireita">

<div class="seletorRX">

<button
id="rx4"
class="btnRX"
>
4
</button>

<button
id="rx5"
class="btnRX"
>
5
</button>

<button
id="rx6"
class="btnRX"
>
6
</button>

</div>

<button
id="btnMostrarRaioX"
class="btnMostrar"
>
Mostrar
</button>

</div>

</div>

<div
id="conteudoRaioX"
class="conteudoOculto"
>

<div
id="raioX"
class="raiox"
></div>

</div>

</section>


<!-- =====================================================
     TECLADO
===================================================== -->

<section class="painel">

<div class="tituloPainel">
TECLADO 0–36
</div>

<div
id="teclado"
class="teclado"
></div>

</section>


<!-- =====================================================
     HISTÓRICO
===================================================== -->

<section class="painel">

<div class="cabecalhoPainel">

<div class="tituloPainel">

HISTÓRICO OCULTO —
<span id="qtdHistorico">
0
</span>

</div>

<button
id="btnMostrarHistorico"
class="btnMostrar"
>
Mostrar
</button>

</div>

<div
id="conteudoHistorico"
class="conteudoOculto"
>

<div
id="historico"
class="historico"
></div>

</div>

</section>

</div>

`;


document.body.appendChild(
app
);


/* =========================================================
   ELEMENTOS
========================================================= */

const statusArea =
document.getElementById(
"statusArea"
);

const qtdJanela =
document.getElementById(
"qtdJanela"
);

const linhaCores =
document.getElementById(
"linhaCores"
);

const linhaRegioes =
document.getElementById(
"linhaRegioes"
);

const linhaIds =
document.getElementById(
"linhaIds"
);

const raioX =
document.getElementById(
"raioX"
);

const jogadaArea =
document.getElementById(
"jogadaArea"
);

const teclado =
document.getElementById(
"teclado"
);

const qtdHistorico =
document.getElementById(
"qtdHistorico"
);

const elementoHistorico =
document.getElementById(
"historico"
);


/* =========================================================
   SELETOR RX
========================================================= */

function atualizarBotoesRX(){

[4,5,6]
.forEach(function(numero){

const botao =
document.getElementById(
"rx" + numero
);

if(
numero ===
TAMANHO_RX
){

botao.classList.add(
"ativo"
);

}else{

botao.classList.remove(
"ativo"
);

}

});

}


document
.getElementById("rx4")
.onclick =
function(){

alterarTamanhoRaioX(4);

};


document
.getElementById("rx5")
.onclick =
function(){

alterarTamanhoRaioX(5);

};


document
.getElementById("rx6")
.onclick =
function(){

alterarTamanhoRaioX(6);

};


atualizarBotoesRX();


/* =========================================================
   PAINÉIS
========================================================= */

function configurarPainelOculto(
botaoId,
conteudoId,
callback
){

const botao =
document.getElementById(
botaoId
);

const conteudo =
document.getElementById(
conteudoId
);


botao.onclick =
function(){

const aberto =
conteudo.style.display ===
"block";


if(aberto){

conteudo.style.display =
"none";

botao.textContent =
"Mostrar";

}else{

conteudo.style.display =
"block";

botao.textContent =
"Ocultar";

if(callback){
callback();
}

}

};

}


configurarPainelOculto(
"btnMostrarJogada",
"conteudoJogada",
renderJogada
);


configurarPainelOculto(
"btnMostrarRaioX",
"conteudoRaioX",
renderRaioX
);


configurarPainelOculto(
"btnMostrarHistorico",
"conteudoHistorico",
function(){

elementoHistorico.scrollLeft =
elementoHistorico.scrollWidth;

}
);


/* =========================================================
   TECLADO
========================================================= */

for(
let numero=1;
numero<=36;
numero++
){

const botao =
document.createElement(
"button"
);

const cor =
corNumeroRoleta(
numero
);

botao.className =
"numeroBtn";

botao.textContent =
numero;

botao.style.background =
cor.fundo;

botao.onclick =
function(){

adicionarNumero(
numero
);

};

teclado.appendChild(
botao
);

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

zero.onclick =
function(){

adicionarNumero(0);

};

teclado.appendChild(
zero
);


/* =========================================================
   BOTÕES
========================================================= */

document
.getElementById(
"btnInserir"
)
.onclick =
inserirHistorico;


document
.getElementById(
"btnApagarUltimo"
)
.onclick =
apagarUltimo;


document
.getElementById(
"btnApagarTudo"
)
.onclick =
apagarTudo;


/* =========================================================
   RENDER ÚLTIMOS 14
========================================================= */

function renderJanela(){

const analise =
analisarJanela14();


qtdJanela.textContent =
analise.janela.length;


if(
!analise.janela.length
){

linhaCores.innerHTML =
"Sem números.";

linhaRegioes.innerHTML =
"Sem números.";

linhaIds.innerHTML =
"Sem números.";

return;

}


linhaCores.innerHTML =

analise.janela

.map(function(numero){

const cor =
corNumeroRoleta(
numero
);

return (

'<div class="numeroRoleta" ' +

'style="background:' +
cor.fundo +
';color:' +
cor.texto +
'">' +

numero +

'</div>'

);

})

.join("");


linhaRegioes.innerHTML =

analise.janela

.map(function(numero){

const regiao =
regiaoDoNumero(
numero
);

const cor =
regiao
?
coresRegioes[regiao]
:
"#555";

return (

'<div class="numeroRegiao" ' +

'style="background:' +
cor +
'">' +

numero +

'</div>'

);

})

.join("");


linhaIds.innerHTML =

analise.sequencia

.map(function(item){

if(
!item.ids.length
){

return (

'<div class="idBox">' +
'<span class="semID">—</span>' +
'</div>'

);

}


const tags =

item.ids

.map(function(id){

return (

'<span class="tagID" ' +

'style="background:' +
corDoId(id) +
'">' +

id +

'</span>'

);

})

.join("");


return (

'<div class="idBox">' +
tags +
'</div>'

);

})

.join("");

}


/* =========================================================
   RENDER JOGADA
========================================================= */

function renderJogada(){

const rx =
analisarRaioX();

const jogada =
rx.jogada;


if(
!jogada.alvos.size
){

jogadaArea.innerHTML =
'<div style="color:#777;text-align:center;">Sem dados suficientes.</div>';

return;

}


/* =====================================================
   2 VIZINHOS
===================================================== */

let html2 = "";


jogada.blocos2
.forEach(function(bloco){

html2 +=

'<div class="blocoJogada">' +

'<small>2 VIZINHOS DO</small>' +

'<strong class="centro2">' +
bloco.centro +
'</strong>' +

'<small class="incidenciaJogada">' +

bloco.forca +
'x' +

'</small>' +

'<div class="numerosBloco">' +

bloco.numeros.join(
" • "
) +

'</div>' +

'</div>';

});


if(!html2){

html2 =

'<div style="' +
'font-size:9px;' +
'color:#666;' +
'padding:6px' +
'">' +

'Nenhum bloco de 2 vizinhos necessário.' +

'</div>';

}


/* =====================================================
   1 VIZINHO
===================================================== */

let html1 = "";


jogada.blocos1
.forEach(function(bloco){

html1 +=

'<div class="blocoJogada um">' +

'<small>1 VIZINHO DO</small>' +

'<strong class="centro1">' +
bloco.centro +
'</strong>' +

'<small class="incidenciaJogada">' +

bloco.forca +
'x' +

'</small>' +

'<div class="numerosBloco">' +

bloco.numeros.join(
" • "
) +

'</div>' +

'</div>';

});


if(!html1){

html1 =

'<div style="' +
'font-size:9px;' +
'color:#666;' +
'padding:6px' +
'">' +

'Não precisa completar com 1 vizinho.' +

'</div>';

}


jogadaArea.innerHTML =

'<div class="jogadaResumo">' +


'<div class="jogadaResumoCard">' +

'<small>2 VIZINHOS</small>' +

'<strong>' +
jogada.blocos2.length +
'</strong>' +

'</div>' +


'<div class="jogadaResumoCard">' +

'<small>1 VIZINHO</small>' +

'<strong>' +
jogada.blocos1.length +
'</strong>' +

'</div>' +


'</div>' +


'<div class="jogadaSubtitulo">' +
'1ª LINHA — 2 VIZINHOS' +
'</div>' +


'<div class="linhaJogadas">' +
html2 +
'</div>' +


'<div class="jogadaSubtitulo">' +
'2ª LINHA — 1 VIZINHO PARA COMPLETAR' +
'</div>' +


'<div class="linhaJogadas">' +
html1 +
'</div>';

}


/* =========================================================
   RENDER RAIO X
========================================================= */

function renderRaioX(){

const rx =
analisarRaioX();


let rankingHTML = "";


rx.ranking
.forEach(function(item,index){

const familia =
familiaDoId(
item.idPrincipal
);

const cor =
corFamilia(
familia
);


const classeExtra =
item.tipo === "ZERO26"
?
" zero26"
:
"";


rankingHTML +=

'<div class="rxNumero' +
classeExtra +
'" style="border-color:' +
cor +
'">' +


'<small>#' +
(index+1) +
'</small>' +


'<strong style="color:' +
cor +
'">' +

item.label +

'</strong>' +


'<small>' +

item.ocorrencias +
'x' +

'</small>' +


'<small class="rxOrigem">' +

item.origem +

'</small>' +


'</div>';

});


let sinalHTML = "";


if(rx.lider){

const cor =
corFamilia(
rx.lider.familia
);

sinalHTML =

'<div class="rxSinal">' +

'<small>SINAL</small>' +

'<strong style="color:' +
cor +
'">' +

rx.lider.familia +

'</strong>' +

'</div>';

}else{

sinalHTML =

'<div class="rxSinal">' +

'<small>SINAL</small>' +

'<strong style="' +
'color:#777;' +
'font-size:18px' +
'">' +

'SEM SINAL' +

'</strong>' +

'</div>';

}


raioX.innerHTML =

'<div class="rxTopo">' +


'<div class="rxCard">' +

'<small>RÉPLICAS USADAS</small>' +

'<strong>' +
rx.replicas +
'</strong>' +

'</div>' +


'<div class="rxCard">' +

'<small>JANELAS</small>' +

'<strong>' +
rx.totalJanelas +
'</strong>' +

'</div>' +


'<div class="rxCard">' +

'<small>SIMILARIDADE</small>' +

'<strong>' +
rx.similaridade.toFixed(1) +
'%' +
'</strong>' +

'</div>' +


'</div>' +


'<div class="rxFamilias">' +


'<div class="rxFamilia">' +

'<strong style="color:' +
COR_T0 +
'">' +

rx.familias[0].toFixed(0) +
'%' +

'</strong>' +

'<small>0</small>' +

'</div>' +


'<div class="rxFamilia">' +

'<strong style="color:' +
COR_T6 +
'">' +

rx.familias[6].toFixed(0) +
'%' +

'</strong>' +

'<small>6</small>' +

'</div>' +


'<div class="rxFamilia">' +

'<strong style="color:' +
COR_T9 +
'">' +

rx.familias[9].toFixed(0) +
'%' +

'</strong>' +

'<small>9</small>' +

'</div>' +


'</div>' +


sinalHTML +


'<div class="tituloPainel" ' +
'style="margin-bottom:5px">' +

'8 ZONAS — RAIO X ' +
rx.tamanho +

'</div>' +


'<div class="rxRanking">' +

rankingHTML +

'</div>';

}


/* =========================================================
   HISTÓRICO
========================================================= */

function renderHistorico(){

qtdHistorico.textContent =
historico.length;


if(
!historico.length
){

elementoHistorico.innerHTML =
"Histórico vazio.";

return;

}


const inicioJanela =
Math.max(
0,
historico.length -
TAMANHO_JANELA
);


const visiveis =
historico.slice(-100);


const offset =
historico.length -
visiveis.length;


elementoHistorico.innerHTML =

visiveis

.map(function(numero,index){

const indiceReal =
offset +
index;

const cor =
corNumeroRoleta(
numero
);

const dentroJanela =
indiceReal >=
inicioJanela;

const ultimo =
indiceReal ===
historico.length-1;


return (

'<div class="' +

'histNumero ' +

(
dentroJanela
?
'janelaAtual '
:
''
) +

(
ultimo
?
'ultimo'
:
''
) +

'" style="' +

'background:' +
cor.fundo +
';' +

'color:' +
cor.texto +

'">' +

numero +

'</div>'

);

})

.join("");


elementoHistorico.scrollLeft =
elementoHistorico.scrollWidth;

}


/* =========================================================
   RENDER GERAL
========================================================= */

function render(){

renderJanela();

renderJogada();

renderRaioX();

renderHistorico();

}


/* =========================================================
   INICIAR
========================================================= */

render();

})();
