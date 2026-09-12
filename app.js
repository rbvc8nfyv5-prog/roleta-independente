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


/* =========================================================
   CONFIGURAÇÃO DO RAIO X
========================================================= */

const PERCENTUAL_REPLICAS_RX = 0.10;

const MIN_REPLICAS_RX = 15;

const MAX_REPLICAS_RX = 40;

const MIN_ZONAS_RX = 8;


/* =========================================================
   TAMANHO DO RAIO X
========================================================= */

let TAMANHO_RX = 6;

try{

const salvoRX =
Number(
localStorage.getItem(
STORAGE_RX
)
);

if(
salvoRX === 4 ||
salvoRX === 5 ||
salvoRX === 6
){

TAMANHO_RX =
salvoRX;

}

}catch(erro){}


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
   REGIÕES DA ROLETA
   SOMENTE VISUAL
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
   BASES 0 • 6 • 9
========================================================= */

const BASES_069 = [

0,10,20,30,

6,16,26,36,

9,19,29

];


/* =========================================================
   TODOS OS IDS POSSÍVEIS
========================================================= */

const TODOS_IDS_RX = [

0,10,20,30,

6,16,26,36,

9,19,29,39

];


/* =========================================================
   IDS ESPECIAIS
========================================================= */

const IDS_ESPECIAIS = {

25:[39],

17:[9],

2:[9]

};


/* =========================================================
   FAMÍLIA
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


/* =========================================================
   CORES
========================================================= */

function corDoId(id){

const familia =
familiaDoId(id);

if(familia === 0){

return COR_T0;

}

if(familia === 6){

return COR_T6;

}

if(familia === 9){

return COR_T9;

}

return "#555";

}


function corFamilia(familia){

if(familia === 0){

return COR_T0;

}

if(familia === 6){

return COR_T6;

}

if(familia === 9){

return COR_T9;

}

return "#aaa";

}


/* =========================================================
   VIZINHOS
========================================================= */

function vizinhos(numero,quantidade = 1){

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
   COBERTURA DAS BASES
========================================================= */

const coberturaDasBases = {};

BASES_069.forEach(function(base){

coberturaDasBases[base] =
new Set(
vizinhos(
base,
1
)
);

});


/* =========================================================
   IDS QUE BATEM
========================================================= */

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

if(
!ids.includes(id)
){

ids.push(id);

}

});

}

return ids;

}


/* =========================================================
   FAMÍLIAS QUE BATEM
========================================================= */

function familiasQueBatem(numero){

return new Set(

idsQueBatem(numero)

.map(
familiaDoId
)

.filter(function(familia){

return familia !== null;

})

);

}


/* =========================================================
   REGIÃO DA ROLETA
========================================================= */

function regiaoDoNumero(numero){

if(
regioesRoleta.ZERO.has(numero)
){

return "ZERO";

}

if(
regioesRoleta.VOISINS.has(numero)
){

return "VOISINS";

}

if(
regioesRoleta.ORPHELINS.has(numero)
){

return "ORPHELINS";

}

if(
regioesRoleta.TIERS.has(numero)
){

return "TIERS";

}

return null;

}


/* =========================================================
   COR DA ROLETA
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
localStorage.getItem(
STORAGE_KEY
);

if(!salvo){

return [];

}

const dados =
JSON.parse(salvo);

if(
!Array.isArray(dados)
){

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

}catch(erro){

return [];

}

}


let historico =
carregarHistorico();


function salvarHistorico(){

try{

localStorage.setItem(

STORAGE_KEY,

JSON.stringify(
historico
)

);

}catch(erro){

console.error(
"Erro ao salvar histórico.",
erro
);

}

}


/* =========================================================
   EXTRAIR NÚMEROS
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

.filter(function(numero){

return (

numero >= 0 &&
numero <= 36

);

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
   TRAJETÓRIA 0 • 6 • 9
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
familias.has(0)
? 1
: 0;

const bate6 =
familias.has(6)
? 1
: 0;

const bate9 =
familias.has(9)
? 1
: 0;


t0 += bate0;

t6 += bate6;

t9 += bate9;


eventos.push({

t0:bate0,
t6:bate6,
t9:bate9

});


pontos.push({

posicao:index + 1,

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
   CHAVE DO EVENTO
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
gerarTrajetoria(
janelaAtual
);

const antiga =
gerarTrajetoria(
janelaAntiga
);


/* =====================================================
   EVENTOS
===================================================== */

let eventosIguais = 0;


for(
let i = 0;
i < tamanho;
i++
){

if(
chaveEvento(
atual.eventos[i]
)
===
chaveEvento(
antiga.eventos[i]
)
){

eventosIguais++;

}

}


const scoreEventos =

(
eventosIguais /
tamanho
)

* 100;


/* =====================================================
   FORMA DAS LINHAS
===================================================== */

let erro = 0;


for(
let i = 0;
i < tamanho;
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
);


scoreForma *= 100;


return (

scoreEventos * 0.80

+

scoreForma * 0.20

);

}


/* =========================================================
   PROCURAR TODAS AS RÉPLICAS
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
let inicio = 0;
inicio + tamanho < inicioAtual;
inicio++
){

const fim =
inicio +
tamanho;


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

similaridade:similaridade,

distancia:distancia,

proximo:proximo

});

}


/* =====================================================
   PRIMEIRO SIMILARIDADE
   DEPOIS RECÊNCIA
===================================================== */

todas.sort(function(a,b){

if(

Math.abs(

b.similaridade -
a.similaridade

) > 0.0001

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
   CONTAR QUANTAS ZONAS EXISTEM EM UM GRUPO DE RÉPLICAS
========================================================= */

function contarZonasDoGrupo(grupo){

const zonas =
new Set();


grupo.forEach(function(item){

const ids =
idsQueBatem(
item.proximo
);


ids.forEach(function(id){

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
   SELEÇÃO DINÂMICA DAS RÉPLICAS

   8 NÃO É MAIS QUANTIDADE DE RÉPLICAS.

   8 = QUANTIDADE FINAL DE ZONAS.

   COMEÇA COM:
   ~10% DAS JANELAS

   MÍNIMO:
   15

   MÁXIMO:
   40

   SE NÃO TIVER 8 ZONAS,
   CONTINUA ADICIONANDO RÉPLICAS.
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

totalJanelas:
busca.totalJanelas || 0,

zonasEncontradas:0

};

}


if(
!busca.replicas.length
){

return {

estado:"SEM DADOS",

replicas:[],

melhor:0,

totalJanelas:0,

zonasEncontradas:0

};

}


const totalDisponivel =
busca.replicas.length;


const melhor =
busca.replicas[0]
.similaridade;


/* =====================================================
   AMOSTRA BASE = 10%
===================================================== */

let quantidadeInicial =
Math.ceil(

totalDisponivel *
PERCENTUAL_REPLICAS_RX

);


/* =====================================================
   GARANTE MÍNIMO
===================================================== */

quantidadeInicial =
Math.max(

quantidadeInicial,

MIN_REPLICAS_RX

);


/* =====================================================
   NÃO PASSA DO QUE EXISTE
===================================================== */

quantidadeInicial =
Math.min(

quantidadeInicial,

totalDisponivel

);


/* =====================================================
   NÃO PASSA DO LIMITE DE 40
===================================================== */

quantidadeInicial =
Math.min(

quantidadeInicial,

MAX_REPLICAS_RX

);


/* =====================================================
   MONTA GRUPO INICIAL
===================================================== */

let grupo =
busca.replicas.slice(
0,
quantidadeInicial
);


let zonas =
contarZonasDoGrupo(
grupo
);


/* =====================================================
   SE AINDA NÃO TIVER 8 ZONAS,
   VAI ADICIONANDO UMA RÉPLICA POR VEZ.
===================================================== */

let indice =
quantidadeInicial;


while(

zonas.size <
MIN_ZONAS_RX

&&

indice <
totalDisponivel

&&

grupo.length <
MAX_REPLICAS_RX

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


/* =====================================================
   SIMILARIDADE MÍNIMA USADA
===================================================== */

let nivelMinimo = 0;


if(
grupo.length
){

nivelMinimo =

grupo[
grupo.length - 1
]
.similaridade;

}


return {

estado:
grupo.length
? "OK"
: "SEM DADOS",

replicas:grupo,

melhor:melhor,

nivel:nivelMinimo,

totalJanelas:
totalDisponivel,

zonasEncontradas:
zonas.size

};

}


/* =========================================================
   LEITURA DA MESA PARA COMPLEMENTAR

   PRIMEIRO 14.
   SE PRECISAR, AMPLIA PARA 20.

   SÓ É USADA SE O RAIO X NÃO CONSEGUIR
   FORMAR 8 ZONAS REAIS.
========================================================= */

function analisarMesaAtual(){

const ranking =
new Map();


TODOS_IDS_RX.forEach(function(id){

ranking.set(
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


/* =====================================================
   ÚLTIMOS 20
===================================================== */

const janela20 =
historico.slice(-20);


janela20.forEach(function(numero,index){

const ids =
idsQueBatem(numero);


const distancia =
janela20.length -
1 -
index;


ids.forEach(function(id){

if(
!ranking.has(id)
){

return;

}


const registro =
ranking.get(id);


registro.incidencias20++;


registro.maisRecente20 =
Math.min(

registro.maisRecente20,

distancia

);

});

});


/* =====================================================
   ÚLTIMOS 14
===================================================== */

const janela14 =
historico.slice(-14);


janela14.forEach(function(numero,index){

const ids =
idsQueBatem(numero);


const distancia =
janela14.length -
1 -
index;


ids.forEach(function(id){

if(
!ranking.has(id)
){

return;

}


const registro =
ranking.get(id);


registro.incidencias14++;


registro.maisRecente14 =
Math.min(

registro.maisRecente14,

distancia

);

});

});


const lista =
Array.from(
ranking.values()
);


/* =====================================================
   PRIMEIRO O MOMENTO DOS 14.
   DEPOIS 20.
===================================================== */

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

TODOS_IDS_RX.indexOf(a.id) -
TODOS_IDS_RX.indexOf(b.id)

);

});


return lista;

}


/* =========================================================
   RAIO X FINAL
========================================================= */

function analisarRaioX(){

const selecao =
selecionarReplicas();


/* =====================================================
   CRIA AS 12 REGIÕES
===================================================== */

const rankingIds =
new Map();


TODOS_IDS_RX.forEach(function(id){

rankingIds.set(
id,
{

id:id,

ocorrencias:0,

melhorSimilaridade:0,

maisRecente:Infinity,

origem:null,

mesa14:0,

mesa20:0

}
);

});


/* =====================================================
   SEM RÉPLICAS
===================================================== */

if(
selecao.estado !==
"OK"
){

const mesa =
analisarMesaAtual();


const rankingFallback = [];


mesa.forEach(function(item){

if(
rankingFallback.length >= 8
){

return;

}


if(
item.incidencias14 > 0 ||
item.incidencias20 > 0
){

rankingFallback.push({

id:item.id,

ocorrencias:
item.incidencias14 > 0
? item.incidencias14
: item.incidencias20,

melhorSimilaridade:0,

maisRecente:
item.maisRecente14 !== Infinity
? item.maisRecente14
: item.maisRecente20,

origem:
item.incidencias14 > 0
? "MESA 14"
: "MESA 20",

mesa14:
item.incidencias14,

mesa20:
item.incidencias20

});

}

});


/* =================================================
   ÚLTIMO RECURSO VISUAL

   SOMENTE SE O HISTÓRICO AINDA FOR PEQUENO.
================================================= */

TODOS_IDS_RX.forEach(function(id){

if(
rankingFallback.length >= 8
){

return;

}


if(
rankingFallback.some(
item => item.id === id
)
){

return;

}


rankingFallback.push({

id:id,

ocorrencias:0,

melhorSimilaridade:0,

maisRecente:Infinity,

origem:"SEM DADOS",

mesa14:0,

mesa20:0

});

});


return {

estado:
selecao.estado,

tamanho:
TAMANHO_RX,

replicas:0,

totalJanelas:
selecao.totalJanelas || 0,

zonasRaioX:0,

similaridade:0,

nivel:0,

familias:{

0:0,
6:0,
9:0

},

lider:null,

ranking:
rankingFallback.slice(0,8)

};

}


/* =====================================================
   RÉPLICAS
===================================================== */

const replicas =
selecao.replicas;


let somaSimilaridade = 0;


let cont0 = 0;

let cont6 = 0;

let cont9 = 0;


let totalFamilias = 0;


/* =====================================================
   ANALISA O QUE VEIO DEPOIS
===================================================== */

replicas.forEach(function(item){

somaSimilaridade +=
item.similaridade;


/* =================================================
   IDS
================================================= */

const ids =
idsQueBatem(
item.proximo
);


ids.forEach(function(id){

if(
!rankingIds.has(id)
){

return;

}


const registro =
rankingIds.get(id);


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


registro.origem =
"RX";

});


/* =================================================
   FAMÍLIAS
================================================= */

const familias =
Array.from(

familiasQueBatem(
item.proximo
)

);


if(
familias.length
){

const fracao =
1 /
familias.length;


familias.forEach(function(familia){

if(familia === 0){

cont0 += fracao;

}

if(familia === 6){

cont6 += fracao;

}

if(familia === 9){

cont9 += fracao;

}

});


totalFamilias++;

}

});


/* =====================================================
   SIMILARIDADE MÉDIA
===================================================== */

const mediaSimilaridade =

replicas.length
?
somaSimilaridade /
replicas.length
:
0;


/* =====================================================
   PERCENTUAIS
===================================================== */

let percentual0 = 0;

let percentual6 = 0;

let percentual9 = 0;


if(
totalFamilias > 0
){

percentual0 =

cont0 /
totalFamilias *
100;


percentual6 =

cont6 /
totalFamilias *
100;


percentual9 =

cont9 /
totalFamilias *
100;

}


/* =====================================================
   SINAL
===================================================== */

const familiasOrdenadas = [

{
familia:0,
valor:percentual0
},

{
familia:6,
valor:percentual6
},

{
familia:9,
valor:percentual9
}

];


familiasOrdenadas.sort(function(a,b){

return (

b.valor -
a.valor

);

});


let lider = null;


if(
familiasOrdenadas[0].valor > 0
){

lider = {

familia:
familiasOrdenadas[0].familia,

valor:
familiasOrdenadas[0].valor

};

}


/* =====================================================
   ORDEM ORIGINAL
===================================================== */

const ordemOriginal =
new Map();


TODOS_IDS_RX.forEach(function(id,index){

ordemOriginal.set(
id,
index
);

});


/* =====================================================
   PRIMEIRO SÓ ZONAS COM INCIDÊNCIA REAL NO RX
===================================================== */

let rankingRX =
Array.from(
rankingIds.values()
)

.filter(function(item){

return (
item.ocorrencias > 0
);

});


rankingRX.sort(function(a,b){

/* 1. MAIS OCORRÊNCIAS */

if(
b.ocorrencias !==
a.ocorrencias
){

return (

b.ocorrencias -
a.ocorrencias

);

}


/* 2. MELHOR SIMILARIDADE */

if(

Math.abs(

b.melhorSimilaridade -
a.melhorSimilaridade

) > 0.0001

){

return (

b.melhorSimilaridade -
a.melhorSimilaridade

);

}


/* 3. MAIS RECENTE */

if(
a.maisRecente !==
b.maisRecente
){

return (

a.maisRecente -
b.maisRecente

);

}


/* 4. ORDEM FIXA */

return (

ordemOriginal.get(a.id) -
ordemOriginal.get(b.id)

);

});


/* =====================================================
   TOP 8 COMEÇA SOMENTE COM RX
===================================================== */

const top8 = [];


rankingRX.forEach(function(item){

if(
top8.length >= 8
){

return;

}


top8.push(item);

});


/* =====================================================
   SE O RAIO X NÃO CONSEGUIU 8 ZONAS,
   COMPLETA COM LEITURA DA MESA.
===================================================== */

if(
top8.length < 8
){

const mesa =
analisarMesaAtual();


mesa.forEach(function(item){

if(
top8.length >= 8
){

return;

}


/* NÃO DUPLICA REGIÃO */

if(
top8.some(
existente =>
existente.id === item.id
)
){

return;

}


/* =================================================
   SOMENTE ENTRA SE TIVER INCIDÊNCIA REAL
================================================= */

if(
item.incidencias14 <= 0 &&
item.incidencias20 <= 0
){

return;

}


top8.push({

id:item.id,

ocorrencias:
item.incidencias14 > 0
? item.incidencias14
: item.incidencias20,

melhorSimilaridade:0,

maisRecente:
item.maisRecente14 !== Infinity
? item.maisRecente14
: item.maisRecente20,

origem:
item.incidencias14 > 0
? "MESA 14"
: "MESA 20",

mesa14:
item.incidencias14,

mesa20:
item.incidencias20

});

});

}


/* =====================================================
   ÚLTIMO RECURSO

   SÓ SERÁ NECESSÁRIO SE NÃO EXISTIR INFORMAÇÃO
   SUFICIENTE NEM NO RX NEM NOS ÚLTIMOS 20.

   NÃO DUPLICA.
===================================================== */

if(
top8.length < 8
){

const restantes =
Array.from(
rankingIds.values()
)

.filter(function(item){

return !top8.some(
existente =>
existente.id === item.id
);

});


restantes.sort(function(a,b){

return (

ordemOriginal.get(a.id) -
ordemOriginal.get(b.id)

);

});


restantes.forEach(function(item){

if(
top8.length >= 8
){

return;

}


top8.push({

id:item.id,

ocorrencias:0,

melhorSimilaridade:0,

maisRecente:Infinity,

origem:"SEM DADOS",

mesa14:0,

mesa20:0

});

});

}


/* =====================================================
   RESULTADO
===================================================== */

return {

estado:

lider
?
"SINAL " +
lider.familia
:
"SEM SINAL",

tamanho:
TAMANHO_RX,

replicas:
replicas.length,

totalJanelas:
selecao.totalJanelas,

zonasRaioX:
rankingRX.length,

similaridade:
mediaSimilaridade,

nivel:
selecao.nivel,

familias:{

0:
percentual0,

6:
percentual6,

9:
percentual9

},

lider:
lider,

ranking:
top8.slice(0,8)

};

}


/* =========================================================
   ALTERAR TAMANHO RX
========================================================= */

function alterarTamanhoRaioX(tamanho){

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

String(
TAMANHO_RX
)

);

}catch(erro){}


atualizarBotoesRX();

renderRaioX();

}


/* =========================================================
   INSERIR HISTÓRICO
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
numeros.slice(
-5000
);


salvarHistorico();


campo.value = "";


statusArea.textContent =

historico.length +
" números carregados.";


statusArea.style.color =
"#00e676";


render();

}


/* =========================================================
   ADICIONAR NÚMERO
========================================================= */

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


/* =========================================================
   APAGAR ÚLTIMO
========================================================= */

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


/* =========================================================
   APAGAR TUDO
========================================================= */

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

document.body.style.background =
"#101010";

document.body.style.color =
"#fff";

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
   RX 4 / 5 / 6
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


/* =====================================================
   LEGENDA
===================================================== */

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
   GRÁFICO
===================================================== */

.resumoGrafico{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:5px;
margin-bottom:6px;
}

.cardResumo{
background:#111;
border:1px solid #444;
border-radius:7px;
padding:5px;
text-align:center;
}

.cardResumo small{
display:block;
font-size:9px;
color:#888;
}

.cardResumo strong{
display:block;
font-size:18px;
margin-top:2px;
}

.graficoContainer{
height:200px;
background:#111;
border:1px solid #444;
border-radius:8px;
overflow:hidden;
}

#grafico069{
width:100%;
height:100%;
display:block;
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
grid-template-columns:repeat(4,1fr);
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
margin-top:3px !important;
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

.graficoContainer{
height:185px;
}

.btnRX{
min-width:27px;
height:26px;
padding:0 5px;
}

.rxTopo{
grid-template-columns:repeat(2,1fr);
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


<section class="painel">

<div class="cabecalhoPainel">

<div class="tituloPainel">
EVOLUÇÃO 0 • 6 • 9 — ÚLTIMOS 14
</div>

<button
id="btnMostrarGrafico"
class="btnMostrar"
>
Mostrar
</button>

</div>


<div
id="conteudoGrafico"
class="conteudoOculto"
>

<div class="resumoGrafico">

<div class="cardResumo">
<small>LINHA 0</small>
<strong
id="total0"
style="color:#00c853"
>
0
</strong>
</div>

<div class="cardResumo">
<small>LINHA 6</small>
<strong
id="total6"
style="color:#ffc107"
>
0
</strong>
</div>

<div class="cardResumo">
<small>LINHA 9</small>
<strong
id="total9"
style="color:#2196f3"
>
0
</strong>
</div>

</div>


<div class="graficoContainer">

<canvas
id="grafico069"
></canvas>

</div>

</div>

</section>


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


<section class="painel">

<div class="tituloPainel">
TECLADO 0–36
</div>

<div
id="teclado"
class="teclado"
></div>

</section>


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

const total0 =
document.getElementById(
"total0"
);

const total6 =
document.getElementById(
"total6"
);

const total9 =
document.getElementById(
"total9"
);

const raioX =
document.getElementById(
"raioX"
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
   RX 4 / 5 / 6
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
.getElementById(
"rx4"
)
.onclick =
function(){

alterarTamanhoRaioX(4);

};


document
.getElementById(
"rx5"
)
.onclick =
function(){

alterarTamanhoRaioX(5);

};


document
.getElementById(
"rx6"
)
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

setTimeout(
callback,
20
);

}

}

};

}


configurarPainelOculto(

"btnMostrarGrafico",

"conteudoGrafico",

renderGrafico

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
let numero = 1;
numero <= 36;
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
   RENDER 14
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


/* =====================================================
   ROLETA
===================================================== */

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


/* =====================================================
   REGIÕES VISUAIS
===================================================== */

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


/* =====================================================
   IDS
===================================================== */

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

'<span ' +

'class="tagID" ' +

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
   GRÁFICO
========================================================= */

function renderGrafico(){

const janela =
historico.slice(
-TAMANHO_JANELA
);


const traj =
gerarTrajetoria(
janela
);


total0.textContent =
traj.total0;

total6.textContent =
traj.total6;

total9.textContent =
traj.total9;


const conteudo =
document.getElementById(
"conteudoGrafico"
);


if(
conteudo.style.display !==
"block"
){

return;

}


const canvas =
document.getElementById(
"grafico069"
);


const container =
canvas.parentElement;


const largura =
Math.max(
300,
container.clientWidth
);


const altura =
Math.max(
170,
container.clientHeight
);


const dpr =
window.devicePixelRatio ||
1;


canvas.width =
largura *
dpr;


canvas.height =
altura *
dpr;


canvas.style.width =
largura +
"px";


canvas.style.height =
altura +
"px";


const ctx =
canvas.getContext(
"2d"
);


ctx.setTransform(
dpr,
0,
0,
dpr,
0,
0
);


ctx.clearRect(
0,
0,
largura,
altura
);


ctx.fillStyle =
"#111";


ctx.fillRect(
0,
0,
largura,
altura
);


const dados = [

{
posicao:0,
t0:0,
t6:0,
t9:0
}

].concat(
traj.pontos
);


const margemEsquerda = 28;

const margemDireita = 10;

const margemSuperior = 10;

const margemInferior = 28;


const larguraUtil =

largura -
margemEsquerda -
margemDireita;


const alturaUtil =

altura -
margemSuperior -
margemInferior;


function x(posicao){

return (

margemEsquerda +

(
posicao /
TAMANHO_JANELA
)

*
larguraUtil

);

}


function y(valor){

return (

margemSuperior +

alturaUtil -

(
valor /
TAMANHO_JANELA
)

*
alturaUtil

);

}


ctx.font =
"9px Arial";


ctx.textAlign =
"right";


ctx.textBaseline =
"middle";


for(
let valor = 0;
valor <= 14;
valor += 2
){

const py =
y(valor);


ctx.beginPath();


ctx.moveTo(
margemEsquerda,
py
);


ctx.lineTo(
largura -
margemDireita,
py
);


ctx.strokeStyle =

valor === 0
?
"#555"
:
"#282828";


ctx.lineWidth = 1;


ctx.stroke();


ctx.fillStyle =
"#777";


ctx.fillText(
String(valor),
margemEsquerda - 4,
py
);

}


ctx.textAlign =
"center";


ctx.textBaseline =
"top";


for(
let i = 1;
i <= 14;
i++
){

const px =
x(i);


ctx.fillStyle =
"#666";


ctx.fillText(
String(i),
px,
altura -
margemInferior +
6
);

}


function desenharLinha(
chave,
cor
){

ctx.beginPath();


dados.forEach(function(ponto,index){

const px =
x(
ponto.posicao
);


const py =
y(
ponto[chave]
);


if(index === 0){

ctx.moveTo(
px,
py
);

}else{

ctx.lineTo(
px,
py
);

}

});


ctx.strokeStyle =
cor;


ctx.lineWidth =
3;


ctx.lineJoin =
"round";


ctx.lineCap =
"round";


ctx.stroke();


dados
.slice(1)
.forEach(function(ponto){

ctx.beginPath();


ctx.arc(

x(
ponto.posicao
),

y(
ponto[chave]
),

3,

0,

Math.PI * 2

);


ctx.fillStyle =
cor;


ctx.fill();

});

}


desenharLinha(
"t0",
COR_T0
);


desenharLinha(
"t6",
COR_T6
);


desenharLinha(
"t9",
COR_T9
);

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
item.id
);


const cor =
corFamilia(
familia
);


let origem =
item.origem ||
"RX";


let textoOcorrencias = "";


if(
origem === "RX"
){

textoOcorrencias =
item.ocorrencias +
"x";

}else if(
origem === "MESA 14"
){

textoOcorrencias =
item.ocorrencias +
"x";

}else if(
origem === "MESA 20"
){

textoOcorrencias =
item.ocorrencias +
"x";

}else{

textoOcorrencias =
"0x";

}


rankingHTML +=

'<div class="rxNumero" ' +

'style="border-color:' +
cor +
'">' +


'<small>' +

'#' +
(index + 1) +

'</small>' +


'<strong style="color:' +
cor +
'">' +

item.id +

'</strong>' +


'<small>' +

textoOcorrencias +

'</small>' +


'<small class="rxOrigem">' +

origem +

'</small>' +


'</div>';

});


/* =====================================================
   SINAL
===================================================== */

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


/* =====================================================
   PAINEL
===================================================== */

raioX.innerHTML =

'<div class="rxTopo">' +


'<div class="rxCard">' +

'<small>RÉPLICAS USADAS</small>' +

'<strong>' +
rx.replicas +
'</strong>' +

'</div>' +


'<div class="rxCard">' +

'<small>JANELAS HISTÓRICAS</small>' +

'<strong>' +
(rx.totalJanelas || 0) +
'</strong>' +

'</div>' +


'<div class="rxCard">' +

'<small>ZONAS DO RX</small>' +

'<strong>' +
(rx.zonasRaioX || 0) +
'</strong>' +

'</div>' +


'<div class="rxCard">' +

'<small>SIMILARIDADE MÉDIA</small>' +

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
historico.slice(
-100
);


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
historico.length - 1;


return (

'<div ' +

'class="' +

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

'" ' +

'style="' +

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

renderGrafico();

renderRaioX();

renderHistorico();

}


/* =========================================================
   RESIZE
========================================================= */

let resizeTimer = null;


window.addEventListener(
"resize",
function(){

clearTimeout(
resizeTimer
);


resizeTimer =
setTimeout(
function(){

const conteudo =
document.getElementById(
"conteudoGrafico"
);


if(
conteudo.style.display ===
"block"
){

renderGrafico();

}

},
120
);

}
);


/* =========================================================
   INICIAR
========================================================= */

render();

})();
