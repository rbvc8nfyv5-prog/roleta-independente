(function(){

"use strict";

/* =========================================================
   ANALISADOR 0 • 6 • 9
   RAIO X DE RÉPLICAS HISTÓRICAS
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const TAMANHO_JANELA = 14;

const STORAGE_KEY =
"ANALISADOR_069_IDS_CORRESPONDENTES_V1";

/*
  O algoritmo começa exigindo réplicas extremamente próximas.

  Ele só reduz o nível quando não há quantidade suficiente
  de ocorrências no nível superior.
*/
const NIVEIS_REPLICA = [
100,
98,
96,
94,
92,
90,
88,
85
];

const MIN_REPLICAS_IDEAL = 3;

/*
  Depois de encontrar o nível correto, usamos no máximo
  as ocorrências mais recentes deste grupo.
*/
const MAX_REPLICAS = 20;

/*
  Peso final da assinatura.
*/
const PESO_LINHAS = 0.70;
const PESO_REGIOES = 0.30;


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
   CORES DAS LINHAS
========================================================= */

const COR_T0 = "#00c853";
const COR_T6 = "#ffc107";
const COR_T9 = "#2196f3";


/* =========================================================
   REGIÕES FIXAS
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


const codigoRegiao = {

ZERO:0,
VOISINS:1,
ORPHELINS:2,
TIERS:3

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
   IDs ESPECIAIS

   REGRA ORIGINAL:

   25 → 39
   17 → 9
   2  → 9

   39 pertence à família 9.
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

const familia = familiaDoId(id);

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
   VIZINHOS NA ROLETA
========================================================= */

function vizinhos(numero,quantidade){

if(quantidade === undefined){
quantidade = 1;
}

const indice =
track.indexOf(numero);

if(indice === -1){
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
vizinhos(base,1)
);

});


/* =========================================================
   IDs QUE BATEM
========================================================= */

function idsQueBatem(numero){

const ids = [];


/*
  BASE NORMAL + VIZINHOS
*/
BASES_069.forEach(function(base){

if(
coberturaDasBases[base]
.has(numero)
){

ids.push(base);

}

});


/*
  IDS ESPECIAIS
*/
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


/* =========================================================
   FAMÍLIAS QUE BATEM
========================================================= */

function familiasQueBatem(numero){

const familias = new Set();

idsQueBatem(numero)
.forEach(function(id){

const familia =
familiaDoId(id);

if(familia !== null){
familias.add(familia);
}

});

return familias;

}


/* =========================================================
   REGIÃO DO NÚMERO
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
JSON.stringify(historico)
);

}catch(erro){

console.error(
"Erro ao salvar histórico.",
erro
);

}

}


/* =========================================================
   EXTRAIR HISTÓRICO COLADO
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
   JANELA ATUAL
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
   TRAJETÓRIA DAS LINHAS 0 • 6 • 9
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


eventos.push(evento);


pontos.push({

posicao:index + 1,

numero:numero,

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
   ASSINATURA DAS REGIÕES
========================================================= */

function gerarAssinaturaRegioes(janela){

const sequencia = [];

const transicoes = [];


janela.forEach(function(numero,index){

const regiao =
regiaoDoNumero(numero);

const codigo =
codigoRegiao[regiao];

sequencia.push(
codigo
);


if(index > 0){

const anterior =
sequencia[index - 1];


/*
  0 = permaneceu na mesma região
  1 = mudou de região

  Assim não tratamos ZERO, VOISINS, ORPHELINS ou TIERS
  como se uma fosse matematicamente maior que a outra.
*/
transicoes.push(
codigo === anterior
? 0
: 1
);

}

});


return {

sequencia:sequencia,

transicoes:transicoes

};

}


/* =========================================================
   EVENTO 0/6/9 EM FORMATO DE CHAVE
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
   SIMILARIDADE EXATA DOS EVENTOS DAS LINHAS
========================================================= */

function similaridadeEventosLinhas(
atual,
antiga
){

let iguais = 0;

for(
let i = 0;
i < TAMANHO_JANELA;
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

iguais++;

}

}

return (
iguais /
TAMANHO_JANELA
) * 100;

}


/* =========================================================
   SIMILARIDADE DO FORMATO ACUMULADO

   Compara a geometria das três linhas ponto a ponto.
========================================================= */

function similaridadeFormaLinhas(
atual,
antiga
){

let erro = 0;

for(
let i = 0;
i < TAMANHO_JANELA;
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
  Erro máximo teórico utilizado apenas
  para normalização do desenho.
*/
const divisor =
TAMANHO_JANELA *
TAMANHO_JANELA *
3;


let score =
1 -
(
erro /
divisor
);


score =
Math.max(
0,
Math.min(
1,
score
)
);


return score * 100;

}


/* =========================================================
   SIMILARIDADE FINAL DO DESENHO 0/6/9

   O evento exato vale muito mais.

   Isso faz uma réplica realmente igual ficar próxima de 100%.
========================================================= */

function similaridadeLinhas(
janelaAtual,
janelaAntiga
){

const atual =
gerarTrajetoria(
janelaAtual
);

const antiga =
gerarTrajetoria(
janelaAntiga
);


const eventos =
similaridadeEventosLinhas(
atual,
antiga
);


const forma =
similaridadeFormaLinhas(
atual,
antiga
);


return (
eventos * 0.80 +
forma * 0.20
);

}


/* =========================================================
   SIMILARIDADE DAS REGIÕES
========================================================= */

function similaridadeRegioes(
janelaAtual,
janelaAntiga
){

const atual =
gerarAssinaturaRegioes(
janelaAtual
);

const antiga =
gerarAssinaturaRegioes(
janelaAntiga
);


let posicoesIguais = 0;

for(
let i = 0;
i < TAMANHO_JANELA;
i++
){

if(
atual.sequencia[i] ===
antiga.sequencia[i]
){

posicoesIguais++;

}

}


const scoreSequencia =

(
posicoesIguais /
TAMANHO_JANELA
) * 100;


let transicoesIguais = 0;


for(
let i = 0;
i < TAMANHO_JANELA - 1;
i++
){

if(
atual.transicoes[i] ===
antiga.transicoes[i]
){

transicoesIguais++;

}

}


const scoreTransicoes =

(
transicoesIguais /
(
TAMANHO_JANELA - 1
)
) * 100;


/*
  75% sequência real de regiões
  25% comportamento troca/continuidade
*/
return (
scoreSequencia * 0.75 +
scoreTransicoes * 0.25
);

}


/* =========================================================
   SIMILARIDADE TOTAL
========================================================= */

function calcularSimilaridade(
janelaAtual,
janelaAntiga
){

const linhas =
similaridadeLinhas(
janelaAtual,
janelaAntiga
);


const regioes =
similaridadeRegioes(
janelaAtual,
janelaAntiga
);


const total =

linhas *
PESO_LINHAS

+

regioes *
PESO_REGIOES;


return {

total:total,

linhas:linhas,

regioes:regioes

};

}


/* =========================================================
   PESO DE RECÊNCIA

   Quanto mais recente a réplica,
   maior o peso dela nas conclusões.

   A similaridade seleciona o grupo.
   A recência decide quem pesa mais dentro do grupo.
========================================================= */

function pesoRecencia(distancia){

/*
  distância = quantidade de giros entre
  o final daquele desenho e o início do atual.
*/

return (
1 /
(
1 +
distancia / 120
)
);

}


/* =========================================================
   PESO FINAL DE UMA RÉPLICA
========================================================= */

function pesoReplica(item){

const pesoSimilaridade =
Math.pow(
item.similaridade.total / 100,
4
);


const recencia =
pesoRecencia(
item.distancia
);


return (
pesoSimilaridade *
recencia
);

}


/* =========================================================
   PROCURA TODAS AS RÉPLICAS HISTÓRICAS
========================================================= */

function procurarReplicas(){

const total =
historico.length;


if(
total <
TAMANHO_JANELA * 2 + 1
){

return {

suficiente:false,

mensagem:
"Histórico insuficiente para comparar o momento atual com o passado."

};

}


const inicioAtual =
total -
TAMANHO_JANELA;


const janelaAtual =
historico.slice(
inicioAtual,
total
);


const todas = [];


/*
  IMPORTANTE:

  A janela histórica precisa terminar antes
  do início da janela atual.

  Assim não contaminamos a comparação com
  o próprio momento presente.
*/
for(
let inicio = 0;
inicio + TAMANHO_JANELA < inicioAtual;
inicio++
){

const fim =
inicio +
TAMANHO_JANELA;


const janelaAntiga =
historico.slice(
inicio,
fim
);


const proximoNumero =
historico[fim];


if(
proximoNumero === undefined
){
continue;
}


const similaridade =
calcularSimilaridade(
janelaAtual,
janelaAntiga
);


/*
  Quantos giros atrás terminou a réplica.
*/
const distancia =
inicioAtual -
fim;


todas.push({

inicio:inicio,

fim:fim,

proximoNumero:
proximoNumero,

similaridade:
similaridade,

distancia:
distancia

});

}


/*
  Primeiro maior similaridade.

  Em caso de empate:
  ocorrência mais recente primeiro.
*/
todas.sort(function(a,b){

const diferenca =
b.similaridade.total -
a.similaridade.total;


if(
Math.abs(diferenca) >
0.0001
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

janelaAtual:
janelaAtual,

todas:
todas

};

}


/* =========================================================
   SELECIONAR O NÍVEL DAS RÉPLICAS

   Primeiro 100%.
   Depois 98%.
   Depois 96%...
========================================================= */

function selecionarReplicas(todas){

if(!todas.length){

return {

nivel:null,
replicas:[]

};

}


let nivelEscolhido = null;

let grupo = [];


for(
let i = 0;
i < NIVEIS_REPLICA.length;
i++
){

const nivel =
NIVEIS_REPLICA[i];


const encontrados =
todas.filter(function(item){

return (
item.similaridade.total >= nivel
);

});


if(
encontrados.length >=
MIN_REPLICAS_IDEAL
){

nivelEscolhido =
nivel;

grupo =
encontrados;

break;

}

}


/*
  Caso não existam 3 réplicas em nenhum nível,
  ainda utilizamos as que tenham pelo menos 85%.

  Mas o painel mostra que a amostra é pequena.
*/
if(
nivelEscolhido === null
){

grupo =
todas.filter(function(item){

return (
item.similaridade.total >= 85
);

});


if(grupo.length){

nivelEscolhido =
85;

}

}


/*
  Dentro do nível já escolhido:
  usamos as mais recentes.

  Mas a réplica principal continua sendo
  calculada pela maior similaridade.
*/
grupo.sort(function(a,b){

if(
a.distancia !==
b.distancia
){

return (
a.distancia -
b.distancia
);

}

return (
b.similaridade.total -
a.similaridade.total
);

});


grupo =
grupo.slice(
0,
MAX_REPLICAS
);


return {

nivel:
nivelEscolhido,

replicas:
grupo

};

}


/* =========================================================
   RÉPLICA PRINCIPAL

   Maior similaridade.
   Empate = mais recente.
========================================================= */

function obterReplicaPrincipal(replicas){

if(!replicas.length){
return null;
}


const copia =
replicas.slice();


copia.sort(function(a,b){

const diferenca =
b.similaridade.total -
a.similaridade.total;


if(
Math.abs(diferenca) >
0.0001
){

return diferenca;

}


return (
a.distancia -
b.distancia
);

});


return copia[0];

}


/* =========================================================
   RAIO X FINAL
========================================================= */

function analisarRaioX(){

const busca =
procurarReplicas();


if(!busca.suficiente){

return {

estado:"AGUARDANDO",

mensagem:
busca.mensagem,

replicas:0,

nivel:0,

mediaTotal:0,

mediaLinhas:0,

mediaRegioes:0,

principal:null,

familias:{
0:0,
6:0,
9:0,
fora:0
},

lider:null,

ranking:[]

};

}


const selecao =
selecionarReplicas(
busca.todas
);


const replicas =
selecao.replicas;


if(!replicas.length){

const melhor =
busca.todas.length
?
busca.todas[0]
:
null;


return {

estado:"SEM RÉPLICA FORTE",

mensagem:
"Não encontrei réplica histórica com pelo menos 85% de similaridade.",

replicas:0,

nivel:85,

mediaTotal:
melhor
?
melhor.similaridade.total
:
0,

mediaLinhas:
melhor
?
melhor.similaridade.linhas
:
0,

mediaRegioes:
melhor
?
melhor.similaridade.regioes
:
0,

principal:
melhor,

familias:{
0:0,
6:0,
9:0,
fora:0
},

lider:null,

ranking:[]

};

}


/* =====================================================
   RÉPLICA PRINCIPAL
===================================================== */

const principal =
obterReplicaPrincipal(
replicas
);


/* =====================================================
   MÉDIAS
===================================================== */

let somaTotal = 0;
let somaLinhas = 0;
let somaRegioes = 0;


replicas.forEach(function(item){

somaTotal +=
item.similaridade.total;

somaLinhas +=
item.similaridade.linhas;

somaRegioes +=
item.similaridade.regioes;

});


const mediaTotal =
somaTotal /
replicas.length;


const mediaLinhas =
somaLinhas /
replicas.length;


const mediaRegioes =
somaRegioes /
replicas.length;


/* =====================================================
   CONTAGEM PONDERADA DO QUE VEIO DEPOIS
===================================================== */

let peso0 = 0;
let peso6 = 0;
let peso9 = 0;
let pesoFora = 0;

let pesoTotal = 0;


const rankingMap =
new Map();


replicas.forEach(function(item){

const peso =
pesoReplica(item);


pesoTotal += peso;


const numero =
item.proximoNumero;


if(
!rankingMap.has(numero)
){

rankingMap.set(
numero,
{

numero:numero,

ocorrencias:0,

peso:0,

melhorSimilaridade:0,

maisRecente:
Infinity

}
);

}


const registro =
rankingMap.get(numero);


registro.ocorrencias++;

registro.peso += peso;


registro.melhorSimilaridade =
Math.max(
registro.melhorSimilaridade,
item.similaridade.total
);


registro.maisRecente =
Math.min(
registro.maisRecente,
item.distancia
);


/* -----------------------------------------------------
   FAMÍLIA DO RESULTADO POSTERIOR
----------------------------------------------------- */

const familias =
Array.from(
familiasQueBatem(numero)
);


if(!familias.length){

pesoFora += peso;

}else{

/*
  Se um resultado pertence a duas famílias,
  divide o peso.

  Isso evita fazer o total passar de 100%.
*/
const pesoDividido =
peso /
familias.length;


familias.forEach(function(familia){

if(familia === 0){
peso0 += pesoDividido;
}

if(familia === 6){
peso6 += pesoDividido;
}

if(familia === 9){
peso9 += pesoDividido;
}

});

}

});


/* =====================================================
   PERCENTUAIS = 100%
===================================================== */

const percentual0 =
pesoTotal
?
(
peso0 /
pesoTotal
) * 100
:
0;


const percentual6 =
pesoTotal
?
(
peso6 /
pesoTotal
) * 100
:
0;


const percentual9 =
pesoTotal
?
(
peso9 /
pesoTotal
) * 100
:
0;


const percentualFora =
pesoTotal
?
(
pesoFora /
pesoTotal
) * 100
:
0;


/* =====================================================
   LÍDER ENTRE AS LINHAS 0 / 6 / 9

   A linha que ficar em primeiro é mostrada como sinal.
===================================================== */

const listaFamilias = [

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


listaFamilias.sort(function(a,b){

return (
b.valor -
a.valor
);

});


let lider = null;


if(
listaFamilias.length
){

const primeiro =
listaFamilias[0];

const segundo =
listaFamilias[1];


/*
  Empate técnico exato:
  não inventamos um líder.
*/
if(
Math.abs(
primeiro.valor -
segundo.valor
) > 0.01
){

lider = {

familia:
primeiro.familia,

valor:
primeiro.valor,

segundo:
segundo.familia,

valorSegundo:
segundo.valor,

vantagem:
primeiro.valor -
segundo.valor

};

}

}


/* =====================================================
   RANKING DOS 8 NÚMEROS
===================================================== */

const ranking =
Array.from(
rankingMap.values()
);


ranking.forEach(function(item){

item.percentual =
pesoTotal
?
(
item.peso /
pesoTotal
) * 100
:
0;

});


ranking.sort(function(a,b){

/*
  Primeiro peso histórico.
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
  Depois frequência.
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
  Depois mais recente.
*/
return (
a.maisRecente -
b.maisRecente
);

});


const top8 =
ranking.slice(
0,
8
);


/* =====================================================
   ESTADO
===================================================== */

let estado =
"RÉPLICA ENCONTRADA";


if(lider){

estado =
"SINAL " +
lider.familia;

}


/*
  Se há apenas 1 ou 2 réplicas:
  continuamos mostrando o resultado,
  mas avisamos que a amostra é pequena.
*/
let mensagem =
"Análise baseada nas réplicas mais recentes dentro do nível de similaridade selecionado.";


if(
replicas.length <
MIN_REPLICAS_IDEAL
){

mensagem =
"Réplica forte encontrada, porém com poucas ocorrências históricas.";

}


return {

estado:estado,

mensagem:mensagem,

replicas:
replicas.length,

nivel:
selecao.nivel,

mediaTotal:
mediaTotal,

mediaLinhas:
mediaLinhas,

mediaRegioes:
mediaRegioes,

principal:
principal,

familias:{

0:percentual0,

6:percentual6,

9:percentual9,

fora:
percentualFora

},

lider:
lider,

ranking:
top8

};

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


if(!numeros.length){

statusArea.textContent =
"Nenhum número válido encontrado.";

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


/* ========================================================= */

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


/* ========================================================= */

function apagarUltimo(){

if(!historico.length){
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


/* ========================================================= */

function apagarTudo(){

const confirmar =
window.confirm(
"Apagar todo o histórico?"
);


if(!confirmar){
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
document.body.style.color = "#ffffff";
document.body.style.fontFamily = "Arial,sans-serif";


const app =
document.createElement("div");


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
width:100%;
max-width:850px;
margin:auto;
padding:7px;
}

h2{
text-align:center;
font-size:22px;
margin:5px 0 10px;
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

textarea{
width:100%;
height:72px;
background:#111;
border:1px solid #555;
border-radius:7px;
padding:8px;
color:#fff;
resize:vertical;
}

.acoes{
display:flex;
gap:5px;
flex-wrap:wrap;
margin-top:6px;
}

.btn{
padding:8px 10px;
background:#333;
color:#fff;
border:1px solid #555;
border-radius:7px;
font-weight:900;
}

.btnVerde{
background:#146238;
}

.btnVermelho{
background:#762832;
}

.btnMostrar{
padding:5px 9px;
background:#292929;
color:#ddd;
border:1px solid #555;
border-radius:6px;
font-size:10px;
font-weight:900;
}

.status{
margin-top:6px;
font-size:11px;
font-weight:900;
color:#aaa;
}


/* =====================================================
   CABEÇALHO RECOLHÍVEL
===================================================== */

.cabecalhoPainel{
display:flex;
align-items:center;
justify-content:space-between;
gap:8px;
}

.conteudoOculto{
display:none;
margin-top:8px;
}


/* =====================================================
   ÚLTIMOS 14
===================================================== */

.linhaAnalise{
display:grid;
grid-template-columns:65px minmax(0,1fr);
gap:5px;
margin-top:7px;
align-items:center;
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
justify-content:center;
align-items:center;
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
gap:8px;
flex-wrap:wrap;
justify-content:center;
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

.legendaGrafico{
display:flex;
gap:12px;
font-size:10px;
font-weight:900;
margin-bottom:6px;
}

.itemLegenda{
display:flex;
gap:4px;
align-items:center;
}

.corLegenda{
width:16px;
height:4px;
border-radius:3px;
}

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
width:100%;
height:210px;
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
border:1px solid #555;
border-radius:8px;
padding:8px;
}

.rxEstadoLinha{
display:flex;
justify-content:space-between;
align-items:center;
gap:8px;
margin-bottom:7px;
}

.rxNome{
font-size:12px;
font-weight:900;
color:#00e5ff;
}

.rxEstado{
padding:5px 8px;
background:#222;
border:1px solid #555;
border-radius:6px;
font-size:11px;
font-weight:900;
}

.rxGrid3{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:5px;
margin-bottom:6px;
}

.rxGrid2{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:5px;
margin-bottom:6px;
}

.rxCard{
background:#181818;
border:1px solid #333;
border-radius:7px;
padding:6px 4px;
text-align:center;
}

.rxCard small{
display:block;
font-size:8px;
font-weight:900;
color:#888;
}

.rxCard strong{
display:block;
font-size:16px;
margin-top:3px;
}

.rxSubtitulo{
margin-top:9px;
margin-bottom:5px;
font-size:9px;
font-weight:900;
color:#888;
}

.rxPrincipal{
background:#151515;
border:1px solid #444;
border-radius:8px;
padding:8px;
margin-top:7px;
}

.rxPrincipalNumero{
font-size:28px;
font-weight:900;
color:#00e5ff;
text-align:center;
margin:5px 0;
}

.rxPrincipalInfo{
font-size:9px;
color:#999;
text-align:center;
line-height:1.45;
}

.rxFamilias{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:4px;
}

.rxFamilia{
background:#171717;
border:1px solid #333;
border-radius:6px;
padding:6px 2px;
text-align:center;
}

.rxFamilia strong{
display:block;
font-size:16px;
}

.rxFamilia small{
display:block;
font-size:8px;
color:#888;
margin-top:2px;
}

.rxSinal{
margin-top:7px;
background:#111;
border:1px solid #444;
border-radius:8px;
padding:8px;
text-align:center;
}

.rxSinalRotulo{
font-size:9px;
color:#888;
font-weight:900;
}

.rxSinalNumero{
font-size:28px;
font-weight:900;
margin-top:3px;
}

.rxSinalInfo{
font-size:9px;
color:#999;
margin-top:4px;
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
padding:6px 2px;
text-align:center;
}

.rxNumero strong{
display:block;
font-size:17px;
}

.rxNumero small{
display:block;
font-size:8px;
color:#888;
margin-top:2px;
line-height:1.25;
}

.rxAviso{
font-size:9px;
color:#777;
line-height:1.4;
text-align:center;
margin-top:8px;
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

.numeroBtn:active{
transform:scale(.96);
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
padding-bottom:3px;
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
height:190px;
}

.rxRanking{
grid-template-columns:repeat(4,1fr);
}

.rxCard strong{
font-size:14px;
}

}

</style>


<div class="app069">

<h2>
Análise 0 • 6 • 9
</h2>


<!-- ===================================================
     ENTRADA
=================================================== -->

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


<!-- ===================================================
     ÚLTIMOS 14
=================================================== -->

<section class="painel">

<div class="tituloPainel">
ÚLTIMOS
<span id="qtdJanela">0</span>/14
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


<!-- ===================================================
     EVOLUÇÃO OCULTA
=================================================== -->

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

<div class="legendaGrafico">

<div class="itemLegenda">
<span
class="corLegenda"
style="background:#00c853"
></span>
0
</div>

<div class="itemLegenda">
<span
class="corLegenda"
style="background:#ffc107"
></span>
6
</div>

<div class="itemLegenda">
<span
class="corLegenda"
style="background:#2196f3"
></span>
9
</div>

</div>


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

<canvas id="grafico069">
</canvas>

</div>

</div>

</section>


<!-- ===================================================
     RAIO X OCULTO
=================================================== -->

<section class="painel">

<div class="cabecalhoPainel">

<div class="tituloPainel">
RAIO X DO PADRÃO
</div>

<button
id="btnMostrarRaioX"
class="btnMostrar"
>
Mostrar
</button>

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


<!-- ===================================================
     TECLADO
=================================================== -->

<section class="painel">

<div class="tituloPainel">
TECLADO 0–36
</div>

<div
id="teclado"
class="teclado"
></div>

</section>


<!-- ===================================================
     HISTÓRICO OCULTO
=================================================== -->

<section class="painel">

<div class="cabecalhoPainel">

<div class="tituloPainel">

HISTÓRICO OCULTO —
<span id="qtdHistorico">0</span>

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


document.body.appendChild(app);


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
   BOTÃO GENÉRICO MOSTRAR / OCULTAR
========================================================= */

function configurarPainelOculto(
botaoId,
conteudoId,
callbackAbrir
){

const botao =
document.getElementById(
botaoId
);


const conteudo =
document.getElementById(
conteudoId
);


botao.onclick = function(){

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


if(callbackAbrir){

setTimeout(
callbackAbrir,
20
);

}

}

};

}


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


botao.onclick = function(){

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


zero.onclick = function(){

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
   PAINÉIS OCULTOS
========================================================= */

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
   RENDER DOS ÚLTIMOS 14
========================================================= */

function renderJanela(){

const analise =
analisarJanela14();


qtdJanela.textContent =
analise.janela.length;


if(!analise.janela.length){

linhaCores.innerHTML =
"Sem números.";

linhaRegioes.innerHTML =
"Sem números.";

linhaIds.innerHTML =
"Sem números.";

return;

}


/* ---------------------------------------------------------
   ROLETA
--------------------------------------------------------- */

linhaCores.innerHTML =

analise.janela

.map(function(numero){

const cor =
corNumeroRoleta(
numero
);

return (

'<div class="numeroRoleta" ' +

'style="' +
'background:' +
cor.fundo +
';color:' +
cor.texto +
'">' +

numero +

'</div>'

);

})

.join("");


/* ---------------------------------------------------------
   REGIÕES
--------------------------------------------------------- */

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


/* ---------------------------------------------------------
   IDS
--------------------------------------------------------- */

linhaIds.innerHTML =

analise.sequencia

.map(function(item){

if(!item.ids.length){

return (

'<div class="idBox">' +

'<span class="semID">' +
'—' +
'</span>' +

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
   GRÁFICO 0 • 6 • 9
========================================================= */

function renderGrafico(){

const conteudo =
document.getElementById(
"conteudoGrafico"
);


/*
  Se estiver oculto, apenas atualizamos os totais.
*/
const janela =
historico.slice(
-TAMANHO_JANELA
);


const trajetoria =
gerarTrajetoria(
janela
);


total0.textContent =
trajetoria.total0;


total6.textContent =
trajetoria.total6;


total9.textContent =
trajetoria.total9;


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
trajetoria.pontos
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
) *

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
) *

alturaUtil

);

}


/* ---------------------------------------------------------
   GRID
--------------------------------------------------------- */

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


/* ---------------------------------------------------------
   EIXO X
--------------------------------------------------------- */

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


/* ---------------------------------------------------------
   DESENHAR LINHA
--------------------------------------------------------- */

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
   COR DO SINAL
========================================================= */

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
   RAIO X - RENDER
========================================================= */

function renderRaioX(){

const resultado =
analisarRaioX();


/* =====================================================
   PRINCIPAL
===================================================== */

let principalHTML = "";


if(resultado.principal){

const p =
resultado.principal;


principalHTML =

'<div class="rxSubtitulo">' +
'RÉPLICA PRINCIPAL' +
'</div>' +


'<div class="rxPrincipal">' +


'<div class="rxGrid3">' +


'<div class="rxCard">' +

'<small>' +
'RÉPLICA TOTAL' +
'</small>' +

'<strong>' +
p.similaridade.total.toFixed(1) +
'%' +
'</strong>' +

'</div>' +


'<div class="rxCard">' +

'<small>' +
'LINHAS 0/6/9' +
'</small>' +

'<strong>' +
p.similaridade.linhas.toFixed(1) +
'%' +
'</strong>' +

'</div>' +


'<div class="rxCard">' +

'<small>' +
'REGIÕES' +
'</small>' +

'<strong>' +
p.similaridade.regioes.toFixed(1) +
'%' +
'</strong>' +

'</div>' +


'</div>' +


'<div class="rxSubtitulo" ' +
'style="text-align:center;margin-top:7px">' +

'O QUE VEIO IMEDIATAMENTE DEPOIS' +

'</div>' +


'<div class="rxPrincipalNumero">' +
p.proximoNumero +
'</div>' +


'<div class="rxPrincipalInfo">' +

'Essa é a réplica individual mais próxima do desenho atual.' +

'<br>' +

'Terminou ' +
p.distancia +
' giros antes do início da janela atual.' +

'</div>' +


'</div>';

}


/* =====================================================
   RANKING DOS 8
===================================================== */

let rankingHTML = "";


resultado.ranking.forEach(function(item,index){

rankingHTML +=

'<div class="rxNumero">' +

'<strong>' +
item.numero +
'</strong>' +

'<small>' +

'#' +
(index + 1) +

' • ' +

item.ocorrencias +
'x' +

'<br>' +

item.percentual.toFixed(1) +
'% peso' +

'</small>' +

'</div>';

});


if(!rankingHTML){

rankingHTML =

'<div class="rxNumero">' +
'<small>Sem resultados suficientes</small>' +
'</div>';

}


/* =====================================================
   SINAL
===================================================== */

let sinalHTML = "";


if(resultado.lider){

const lider =
resultado.lider;


const cor =
corFamilia(
lider.familia
);


sinalHTML =

'<div class="rxSinal">' +

'<div class="rxSinalRotulo">' +
'LINHA QUE FICOU EM PRIMEIRO' +
'</div>' +

'<div ' +
'class="rxSinalNumero" ' +
'style="color:' +
cor +
'">' +

'SINAL ' +
lider.familia +

'</div>' +

'<div class="rxSinalInfo">' +

'Força histórica posterior: ' +
lider.valor.toFixed(1) +
'%' +

' • ' +

'2ª linha: ' +
lider.segundo +
' com ' +
lider.valorSegundo.toFixed(1) +
'%' +

' • ' +

'vantagem: +' +
lider.vantagem.toFixed(1) +

'</div>' +

'</div>';

}else{

sinalHTML =

'<div class="rxSinal">' +

'<div class="rxSinalRotulo">' +
'SITUAÇÃO' +
'</div>' +

'<div ' +
'class="rxSinalNumero" ' +
'style="font-size:17px;color:#ffc107">' +

'SEM LÍDER DEFINIDO' +

'</div>' +

'</div>';

}


/* =====================================================
   PAINEL COMPLETO
===================================================== */

raioX.innerHTML =

'<div class="rxEstadoLinha">' +

'<div class="rxNome">' +
'RÉPLICA DO MOMENTO ATUAL' +
'</div>' +

'<div class="rxEstado">' +
resultado.estado +
'</div>' +

'</div>' +


'<div class="rxGrid3">' +


'<div class="rxCard">' +

'<small>' +
'RÉPLICAS USADAS' +
'</small>' +

'<strong>' +
resultado.replicas +
'</strong>' +

'</div>' +


'<div class="rxCard">' +

'<small>' +
'NÍVEL MÍNIMO' +
'</small>' +

'<strong>' +
resultado.nivel.toFixed(0) +
'%' +
'</strong>' +

'</div>' +


'<div class="rxCard">' +

'<small>' +
'SIMILARIDADE MÉDIA' +
'</small>' +

'<strong>' +
resultado.mediaTotal.toFixed(1) +
'%' +
'</strong>' +

'</div>' +


'</div>' +


'<div class="rxGrid2">' +


'<div class="rxCard">' +

'<small>' +
'DESENHO 0 • 6 • 9' +
'</small>' +

'<strong>' +
resultado.mediaLinhas.toFixed(1) +
'%' +
'</strong>' +

'</div>' +


'<div class="rxCard">' +

'<small>' +
'DESENHO DAS REGIÕES' +
'</small>' +

'<strong>' +
resultado.mediaRegioes.toFixed(1) +
'%' +
'</strong>' +

'</div>' +


'</div>' +


principalHTML +


'<div class="rxSubtitulo">' +
'CONJUNTO DE RÉPLICAS — O QUE VEIO DEPOIS' +
'</div>' +


'<div class="rxFamilias">' +


'<div class="rxFamilia">' +

'<strong style="color:' +
COR_T0 +
'">' +

resultado.familias[0].toFixed(1) +
'%' +

'</strong>' +

'<small>' +
'LINHA 0' +
'</small>' +

'</div>' +


'<div class="rxFamilia">' +

'<strong style="color:' +
COR_T6 +
'">' +

resultado.familias[6].toFixed(1) +
'%' +

'</strong>' +

'<small>' +
'LINHA 6' +
'</small>' +

'</div>' +


'<div class="rxFamilia">' +

'<strong style="color:' +
COR_T9 +
'">' +

resultado.familias[9].toFixed(1) +
'%' +

'</strong>' +

'<small>' +
'LINHA 9' +
'</small>' +

'</div>' +


'<div class="rxFamilia">' +

'<strong style="color:#aaa">' +

resultado.familias.fora.toFixed(1) +
'%' +

'</strong>' +

'<small>' +
'FORA' +
'</small>' +

'</div>' +


'</div>' +


sinalHTML +


'<div class="rxSubtitulo">' +

'8 PRÓXIMOS RESULTADOS MAIS RECORRENTES' +

'</div>' +


'<div class="rxRanking">' +

rankingHTML +

'</div>' +


'<div class="rxAviso">' +

'Os 8 números acima não são os mais frequentes do histórico inteiro. ' +

'São os resultados que mais apareceram imediatamente depois das réplicas ' +

'selecionadas do desenho atual. Réplicas mais recentes e mais semelhantes ' +

'recebem peso maior.' +

'</div>' +


'<div class="rxAviso">' +

'Similaridade final = 70% desenho das linhas 0/6/9 + 30% padrão das regiões.' +

'</div>' +


'<div class="rxAviso">' +

resultado.mensagem +

'</div>';

}


/* =========================================================
   HISTÓRICO
========================================================= */

function renderHistorico(){

qtdHistorico.textContent =
historico.length;


if(!historico.length){

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
