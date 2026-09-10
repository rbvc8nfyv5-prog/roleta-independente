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


/*
  RAIO X:
  Pode analisar somente os últimos
  4, 5 ou 6 resultados.

  Padrão inicial = 6.
*/
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


/*
  Réplica forte.
*/
const SIMILARIDADE_MINIMA_FORTE = 88;


/*
  Quantos pontos abaixo da melhor réplica
  ainda entram no grupo forte.
*/
const FAIXA_DO_TOPO = 5;


/*
  Máximo de réplicas utilizadas.
*/
const MAX_REPLICAS = 20;


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
   REGIÕES
   SOMENTE LEITURA VISUAL DO MOMENTO ATUAL
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
   IDS ESPECIAIS
========================================================= */

const IDS_ESPECIAIS = {

25:[39],
17:[9],
2:[9]

};


/* =========================================================
   FAMÍLIA DO ID
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
   COR DO ID
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


/* =========================================================
   VIZINHOS
========================================================= */

function vizinhos(numero,quantidade){

if(
quantidade === undefined
){
quantidade = 1;
}

const indice =
track.indexOf(numero);

if(
indice === -1
){
return [];
}

const resultado = [
numero
];


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

const familias =
new Set();


idsQueBatem(numero)
.forEach(function(id){

const familia =
familiaDoId(id);

if(
familia !== null
){

familias.add(familia);

}

});


return familias;

}


/* =========================================================
   REGIÃO
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
   COR NORMAL DA ROLETA
========================================================= */

function corNumeroRoleta(numero){

if(
numero === 0
){

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


if(
!salvo
){
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
   EXTRAIR HISTÓRICO
========================================================= */

function extrairNumeros(texto){

const encontrados =
texto.match(
/\b(?:[0-9]|[12][0-9]|3[0-6])\b/g
);


if(
!encontrados
){
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
   JANELA VISUAL DE 14
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

ids:
idsQueBatem(numero)

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

const eventos = [];
const pontos = [];


janela.forEach(function(numero,index){

const familias =
familiasQueBatem(numero);


const evento = {

t0:
familias.has(0)
? 1
: 0,

t6:
familias.has(6)
? 1
: 0,

t9:
familias.has(9)
? 1
: 0

};


t0 += evento.t0;
t6 += evento.t6;
t9 += evento.t9;


eventos.push(
evento
);


pontos.push({

posicao:
index + 1,

numero:
numero,

t0:t0,
t6:t6,
t9:t9

});

});


return {

eventos:eventos,

pontos:pontos,

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


if(
evento.t0
){
chave += "0";
}


if(
evento.t6
){
chave += "6";
}


if(
evento.t9
){
chave += "9";
}


if(
!chave
){
chave = "-";
}


return chave;

}


/* =========================================================
   SIMILARIDADE DO RAIO X

   IMPORTANTE:

   NÃO usa 14.

   Usa somente TAMANHO_RX:
   6, 5 ou 4 resultados.
========================================================= */

function calcularSimilaridade(
janelaAtual,
janelaAntiga
){

const tamanho =
janelaAtual.length;


if(
tamanho === 0 ||
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


/* ---------------------------------------------------------
   1. EVENTOS EXATOS
--------------------------------------------------------- */

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


/* ---------------------------------------------------------
   2. FORMATO DAS TRÊS LINHAS
--------------------------------------------------------- */

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


/*
  Normalização ajustada ao tamanho
  escolhido: 4, 5 ou 6.
*/
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


/*
  A sequência exata manda.

  A forma acumulada complementa.
*/
return (

scoreEventos * 0.85

+

scoreForma * 0.15

);

}


/* =========================================================
   PROCURAR RÉPLICAS DO RAIO X

   Aqui usa somente:
   últimos 4 / 5 / 6.
========================================================= */

function procurarReplicas(){

const tamanho =
TAMANHO_RX;


const total =
historico.length;


/*
  Precisamos ter:
  um desenho antigo,
  um próximo número
  e o desenho atual.
*/
if(
total <
(
tamanho * 2
+
1
)
){

return {

suficiente:false,

replicas:[]

};

}


/*
  COMEÇO DO DESENHO ATUAL
*/
const inicioAtual =
total -
tamanho;


/*
  SOMENTE A PONTA ATUAL
*/
const janelaAtual =
historico.slice(
inicioAtual,
total
);


const todas = [];


/*
  Percorre todo o passado.

  A janela antiga precisa terminar
  antes da janela atual.

  E precisamos conhecer o número
  imediatamente posterior a ela.
*/
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


/*
  Quantos resultados existem entre
  aquela réplica e o desenho atual.
*/
const distancia =
inicioAtual -
fim;


todas.push({

inicio:inicio,

fim:fim,

similaridade:
similaridade,

distancia:
distancia,

proximo:
proximo

});

}


/* ---------------------------------------------------------
   ORDENAÇÃO

   Similaridade manda.

   Quando são praticamente iguais,
   a réplica mais recente sobe.
--------------------------------------------------------- */

todas.sort(function(a,b){

const diferenca =

b.similaridade -
a.similaridade;


if(
Math.abs(diferenca) > 0.5
){

return diferenca;

}


return (

a.distancia -
b.distancia

);

});


return {

suficiente:true,

replicas:
todas

};

}


/* =========================================================
   SELECIONAR RÉPLICAS FORTES
========================================================= */

function selecionarReplicasFortes(){

const busca =
procurarReplicas();


if(
!busca.suficiente
){

return {

estado:"AGUARDANDO",

replicas:[],

melhor:0

};

}


if(
!busca.replicas.length
){

return {

estado:"SEM SINAL",

replicas:[],

melhor:0

};

}


/*
  MELHOR RÉPLICA ENCONTRADA
*/
const melhor =
busca.replicas[0]
.similaridade;


/*
  Nem a melhor chegou em 88%.
*/
if(
melhor <
SIMILARIDADE_MINIMA_FORTE
){

return {

estado:"SEM SINAL",

replicas:[],

melhor:
melhor

};

}


/*
  Só mantém o bloco do topo.

  Exemplo:

  melhor = 98%
  entram 98, 97, 96, 95, 94, 93...

  não joga 80% no meio.
*/
const minimoDoGrupo =
Math.max(

SIMILARIDADE_MINIMA_FORTE,

melhor -
FAIXA_DO_TOPO

);


let grupo =

busca.replicas

.filter(function(item){

return (

item.similaridade >=
minimoDoGrupo

);

});


/*
  Dentro do grupo muito parecido,
  favorecemos o mais recente.
*/
grupo.sort(function(a,b){

if(

Math.abs(

b.similaridade -
a.similaridade

) <= 2

){

return (

a.distancia -
b.distancia

);

}


return (

b.similaridade -
a.similaridade

);

});


grupo =
grupo.slice(
0,
MAX_REPLICAS
);


return {

estado:
grupo.length
? "OK"
: "SEM SINAL",

replicas:
grupo,

melhor:
melhor

};

}


/* =========================================================
   RAIO X FINAL
========================================================= */

function analisarRaioX(){

const selecao =
selecionarReplicasFortes();


if(
selecao.estado !==
"OK"
){

return {

estado:
selecao.estado,

tamanho:
TAMANHO_RX,

replicas:0,

similaridade:
selecao.melhor || 0,

familias:{

0:0,
6:0,
9:0

},

lider:null,

ranking:[]

};

}


const replicas =
selecao.replicas;


let somaSimilaridade = 0;


let peso0 = 0;
let peso6 = 0;
let peso9 = 0;


let pesoFamiliasTotal = 0;


const rankingMap =
new Map();


replicas.forEach(function(item){

somaSimilaridade +=
item.similaridade;


/* ---------------------------------------------------------
   PESO DA RÉPLICA

   1. desenho parecido
   2. desenho recente
--------------------------------------------------------- */

const pesoSimilaridade =

Math.pow(

item.similaridade /
100,

4

);


const pesoRecencia =

1 /

(
1 +
item.distancia / 100
);


const peso =

pesoSimilaridade *
pesoRecencia;


/* ---------------------------------------------------------
   O QUE VEIO DEPOIS DA RÉPLICA?
--------------------------------------------------------- */

const familias =

Array.from(

familiasQueBatem(
item.proximo
)

);


/*
  Para o percentual das linhas,
  usamos apenas resultados que pertencem
  ao 0 / 6 / 9.
*/
if(
familias.length
){

const pesoDividido =

peso /
familias.length;


familias.forEach(function(familia){

if(
familia === 0
){

peso0 +=
pesoDividido;

}


if(
familia === 6
){

peso6 +=
pesoDividido;

}


if(
familia === 9
){

peso9 +=
pesoDividido;

}

});


pesoFamiliasTotal +=
peso;

}


/* ---------------------------------------------------------
   RANKING DOS PRÓXIMOS NÚMEROS

   Aqui entram TODOS os números 0–36
   que vieram depois das réplicas.
--------------------------------------------------------- */

if(
!rankingMap.has(
item.proximo
)
){

rankingMap.set(

item.proximo,

{

numero:
item.proximo,

ocorrencias:0,

peso:0,

maisRecente:
Infinity

}

);

}


const registro =
rankingMap.get(
item.proximo
);


registro.ocorrencias++;


registro.peso +=
peso;


registro.maisRecente =
Math.min(

registro.maisRecente,

item.distancia

);

});


/* =====================================================
   SIMILARIDADE MÉDIA DAS RÉPLICAS USADAS
===================================================== */

const mediaSimilaridade =

somaSimilaridade /
replicas.length;


/* =====================================================
   PERCENTUAIS 0 / 6 / 9
===================================================== */

let percentual0 = 0;
let percentual6 = 0;
let percentual9 = 0;


if(
pesoFamiliasTotal > 0
){

percentual0 =

peso0 /
pesoFamiliasTotal *
100;


percentual6 =

peso6 /
pesoFamiliasTotal *
100;


percentual9 =

peso9 /
pesoFamiliasTotal *
100;

}


/* =====================================================
   LINHA LÍDER
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
   8 PRÓXIMOS MAIS RECORRENTES
===================================================== */

const ranking =
Array.from(
rankingMap.values()
);


ranking.sort(function(a,b){

/*
  Primeiro:
  quantidade de vezes que veio depois
  do mesmo desenho.
*/
if(
b.ocorrencias !==
a.ocorrencias
){

return (

b.ocorrencias -
a.ocorrencias

);

}


/*
  Empate:
  maior qualidade/recência das réplicas.
*/
if(

Math.abs(
b.peso -
a.peso
) > 0.000001

){

return (

b.peso -
a.peso

);

}


/*
  Novo empate:
  resultado mais recente.
*/
return (

a.maisRecente -
b.maisRecente

);

});


return {

estado:

lider
? "SINAL " + lider.familia
: "SEM SINAL",

tamanho:
TAMANHO_RX,

replicas:
replicas.length,

similaridade:
mediaSimilaridade,

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
ranking.slice(
0,
8
)

};

}


/* =========================================================
   ALTERAR TAMANHO DO RAIO X
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

historico.push(numero);


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
   SELETOR DO RAIO X
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
   REGIÕES
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
   GRÁFICO DE 14
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
grid-template-columns:repeat(2,1fr);
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
font-size:16px;
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

}

</style>


<div class="app069">

<h2>
Análise 0 • 6 • 9
</h2>


<!-- ENTRADA -->

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


<!-- ÚLTIMOS 14 -->

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


<!-- GRÁFICO 14 -->

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

<small>
LINHA 0
</small>

<strong
id="total0"
style="color:#00c853"
>
0
</strong>

</div>


<div class="cardResumo">

<small>
LINHA 6
</small>

<strong
id="total6"
style="color:#ffc107"
>
0
</strong>

</div>


<div class="cardResumo">

<small>
LINHA 9
</small>

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


<!-- RAIO X -->

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


<!-- TECLADO -->

<section class="painel">

<div class="tituloPainel">
TECLADO 0–36
</div>

<div
id="teclado"
class="teclado"
></div>

</section>


<!-- HISTÓRICO -->

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
   SELETOR 4 / 5 / 6
========================================================= */

function atualizarBotoesRX(){

[
4,
5,
6
]
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
   PAINÉIS MOSTRAR / OCULTAR
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


if(
aberto
){

conteudo.style.display =
"none";


botao.textContent =
"Mostrar";

}else{

conteudo.style.display =
"block";


botao.textContent =
"Ocultar";


if(
callback
){

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
   BOTÕES PRINCIPAIS
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
   RENDER DOS 14
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
   GRÁFICO DE 14
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


if(
index === 0
){

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
   COR DA FAMÍLIA
========================================================= */

function corFamilia(familia){

if(
familia === 0
){
return COR_T0;
}

if(
familia === 6
){
return COR_T6;
}

if(
familia === 9
){
return COR_T9;
}

return "#aaa";

}


/* =========================================================
   RENDER RAIO X
========================================================= */

function renderRaioX(){

const rx =
analisarRaioX();


let rankingHTML = "";


rx.ranking
.forEach(function(item){

rankingHTML +=

'<div class="rxNumero">' +

'<strong>' +
item.numero +
'</strong>' +

'<small>' +
item.ocorrencias +
'x' +
'</small>' +

'</div>';

});


/*
  Completa visualmente até 8 posições.
*/
for(
let i =
rx.ranking.length;
i < 8;
i++
){

rankingHTML +=

'<div class="rxNumero">' +

'<strong style="color:#444">—</strong>' +

'</div>';

}


let sinalHTML = "";


if(
rx.lider
){

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

'<small>RÉPLICAS</small>' +

'<strong>' +
rx.replicas +
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

'8 PRÓXIMOS' +

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
