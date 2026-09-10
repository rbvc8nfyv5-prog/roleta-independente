(function(){

"use strict";

const track=[
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

const TAMANHO_JANELA=14;
const LIMIAR_SIMILARIDADE=76;
const MAX_ENCAIXES=30;

const STORAGE_KEY="ANALISADOR_069_IDS_CORRESPONDENTES_V1";

const COR_T0="#00c853";
const COR_T6="#ffc107";
const COR_T9="#2196f3";

const numerosVermelhos=new Set([
1,3,5,7,9,
12,14,16,18,
19,21,23,25,27,
30,32,34,36
]);


/* =========================================================
   REGIÕES
========================================================= */

const regioesRoleta={

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


const coresRegioes={
ZERO:"#9bea2c",
VOISINS:"#8a20d4",
ORPHELINS:"#176436",
TIERS:"#29499b"
};


/* =========================================================
   BASES
========================================================= */

const BASES_069=[

0,10,20,30,

6,16,26,36,

9,19,29

];


/* =========================================================
   ID ESPECIAL 39

   2 / 25 / 17 => 39
   39 pertence à linha do 9
========================================================= */

const IDS_ESPECIAIS={

2:[39],
25:[39],
17:[39]

};


/* =========================================================
   FAMÍLIA
========================================================= */

function familiaDoId(id){

if(
id===0 ||
id===10 ||
id===20 ||
id===30
){
return 0;
}

if(
id===6 ||
id===16 ||
id===26 ||
id===36
){
return 6;
}

if(
id===9 ||
id===19 ||
id===29 ||
id===39
){
return 9;
}

return null;

}


function corDoId(id){

const familia=familiaDoId(id);

if(familia===0){
return COR_T0;
}

if(familia===6){
return COR_T6;
}

if(familia===9){
return COR_T9;
}

return "#555";

}


/* =========================================================
   STORAGE
========================================================= */

function carregarHistorico(){

try{

const salvo=
localStorage.getItem(STORAGE_KEY);

if(!salvo){
return [];
}

const dados=
JSON.parse(salvo);

if(!Array.isArray(dados)){
return [];
}

return dados
.map(Number)
.filter(function(numero){

return (
Number.isInteger(numero) &&
numero>=0 &&
numero<=36
);

})
.slice(-5000);

}catch(erro){

return [];

}

}


let historico=
carregarHistorico();


function salvarHistorico(){

try{

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(historico)
);

}catch(erro){

console.error(erro);

}

}


/* =========================================================
   VIZINHOS
========================================================= */

function vizinhos(numero,quantidade){

if(quantidade===undefined){
quantidade=1;
}

const indice=
track.indexOf(numero);

if(indice===-1){
return [];
}

const resultado=[numero];

for(
let distancia=1;
distancia<=quantidade;
distancia++
){

resultado.push(

track[
(
indice-
distancia+
track.length
)%
track.length
]

);

resultado.push(

track[
(
indice+
distancia
)%
track.length
]

);

}

return resultado;

}


/* =========================================================
   COBERTURA DAS BASES
========================================================= */

const coberturaDasBases={};

BASES_069.forEach(function(base){

coberturaDasBases[base]=
new Set(
vizinhos(base,1)
);

});


/* =========================================================
   IDs QUE BATEM
========================================================= */

function idsQueBatem(numero){

const ids=[];


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


/* =========================================================
   FAMÍLIAS QUE BATEM
========================================================= */

function familiasQueBatem(numero){

const familias=
new Set();

idsQueBatem(numero)
.forEach(function(id){

const familia=
familiaDoId(id);

if(familia!==null){

familias.add(familia);

}

});

return familias;

}


/* =========================================================
   REGIÃO
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

if(numero===0){

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
   TRAJETÓRIA
========================================================= */

function gerarTrajetoria(janela){

let t0=0;
let t6=0;
let t9=0;

const pontos=[];
const eventos=[];


janela.forEach(function(numero,index){

const familias=
familiasQueBatem(numero);

const evento={

t0:
familias.has(0)
?1
:0,

t6:
familias.has(6)
?1
:0,

t9:
familias.has(9)
?1
:0

};


t0+=evento.t0;
t6+=evento.t6;
t9+=evento.t9;


eventos.push(evento);


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
   ÚLTIMOS 14
========================================================= */

function analisarJanela14(){

const janela=
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
   COMPARAÇÃO DE PADRÃO
========================================================= */

function compararEventos(a,b){

let iguais=0;

if(a.t0===b.t0){
iguais++;
}

if(a.t6===b.t6){
iguais++;
}

if(a.t9===b.t9){
iguais++;
}

return iguais/3;

}


/* =========================================================
   SIMILARIDADE DE DUAS JANELAS
========================================================= */

function calcularSimilaridade(
janelaAtual,
janelaAntiga
){

const atual=
gerarTrajetoria(janelaAtual);

const antiga=
gerarTrajetoria(janelaAntiga);

let scoreEventos=0;


for(
let i=0;
i<TAMANHO_JANELA;
i++
){

scoreEventos+=
compararEventos(
atual.eventos[i],
antiga.eventos[i]
);

}

scoreEventos/=
TAMANHO_JANELA;


/* ---------------------------------------------
   FORMATO DAS LINHAS
--------------------------------------------- */

let diferenca=0;


for(
let i=0;
i<TAMANHO_JANELA;
i++
){

diferenca+=

Math.abs(
atual.pontos[i].t0-
antiga.pontos[i].t0
)

+

Math.abs(
atual.pontos[i].t6-
antiga.pontos[i].t6
)

+

Math.abs(
atual.pontos[i].t9-
antiga.pontos[i].t9
);

}


const maximo=
TAMANHO_JANELA*
TAMANHO_JANELA*
3;


let scoreForma=
1-
(
diferenca/
maximo
);


scoreForma=
Math.max(
0,
Math.min(
1,
scoreForma
)
);


/* ---------------------------------------------
   PESO FINAL
--------------------------------------------- */

const final=

(
scoreEventos*
0.70
)

+

(
scoreForma*
0.30
);


return final*100;

}


/* =========================================================
   RAIO X
========================================================= */

function analisarRaioX(){

const total=
historico.length;


/* precisa de histórico anterior + janela atual */

if(total<29){

return {

estado:"AGUARDANDO",

mensagem:
"São necessários pelo menos 29 resultados.",

encaixes:0,

similaridade:0,

familias:{
0:0,
6:0,
9:0,
fora:0
},

numeros:[]

};

}


const inicioAtual=
total-
TAMANHO_JANELA;


const janelaAtual=
historico.slice(
inicioAtual
);


const candidatos=[];


/* =====================================================
   PROCURA JANELAS ANTIGAS
===================================================== */

for(
let inicio=0;
inicio+TAMANHO_JANELA<inicioAtual;
inicio++
){

const fim=
inicio+
TAMANHO_JANELA;


const janelaAntiga=
historico.slice(
inicio,
fim
);


const proximoNumero=
historico[fim];


if(proximoNumero===undefined){
continue;
}


const similaridade=
calcularSimilaridade(
janelaAtual,
janelaAntiga
);


if(
similaridade>=
LIMIAR_SIMILARIDADE
){

candidatos.push({

similaridade:
similaridade,

proximoNumero:
proximoNumero

});

}

}


/* =====================================================
   NENHUM ENCAIXE
===================================================== */

if(!candidatos.length){

return {

estado:"SEM PADRÃO",

mensagem:
"Nenhum encaixe histórico atingiu o limite atual.",

encaixes:0,

similaridade:0,

familias:{
0:0,
6:0,
9:0,
fora:0
},

numeros:[]

};

}


/* =====================================================
   MELHORES ENCAIXES
===================================================== */

candidatos.sort(function(a,b){

return (
b.similaridade-
a.similaridade
);

});


const encaixes=
candidatos.slice(
0,
MAX_ENCAIXES
);


let somaSimilaridade=0;

let peso0=0;
let peso6=0;
let peso9=0;
let pesoFora=0;

let pesoTotal=0;


const numeros=
new Map();


encaixes.forEach(function(item){

somaSimilaridade+=
item.similaridade;


const peso=
item.similaridade/
100;


pesoTotal+=peso;


const familias=
Array.from(
familiasQueBatem(
item.proximoNumero
)
);


/* ---------------------------------------------
   PESO POR FAMÍLIA
--------------------------------------------- */

if(!familias.length){

pesoFora+=peso;

}else{

const pesoDividido=
peso/
familias.length;


familias.forEach(function(familia){

if(familia===0){

peso0+=pesoDividido;

}

if(familia===6){

peso6+=pesoDividido;

}

if(familia===9){

peso9+=pesoDividido;

}

});

}


/* ---------------------------------------------
   NÚMEROS
--------------------------------------------- */

if(
!numeros.has(
item.proximoNumero
)
){

numeros.set(
item.proximoNumero,
{
numero:item.proximoNumero,
ocorrencias:0,
peso:0
}
);

}


const registro=
numeros.get(
item.proximoNumero
);


registro.ocorrencias++;

registro.peso+=peso;

});


const ranking=
Array.from(
numeros.values()
);


ranking.sort(function(a,b){

if(
b.peso!==
a.peso
){

return (
b.peso-
a.peso
);

}

return (
b.ocorrencias-
a.ocorrencias
);

});


const percentual0=
pesoTotal
?
peso0/pesoTotal*100
:
0;


const percentual6=
pesoTotal
?
peso6/pesoTotal*100
:
0;


const percentual9=
pesoTotal
?
peso9/pesoTotal*100
:
0;


const percentualFora=
pesoTotal
?
pesoFora/pesoTotal*100
:
0;


const media=
somaSimilaridade/
encaixes.length;


let familiaLider=0;
let valorLider=percentual0;


if(
percentual6>
valorLider
){

familiaLider=6;
valorLider=percentual6;

}


if(
percentual9>
valorLider
){

familiaLider=9;
valorLider=percentual9;

}


/* só destaca se houver algum domínio real */

let estado="OBSERVANDO";

if(
encaixes.length>=4 &&
media>=78 &&
valorLider>=40
){

estado=
"SINAL "+familiaLider;

}


return {

estado:estado,

mensagem:
"Comparação feita com padrões anteriores.",

encaixes:
encaixes.length,

similaridade:
media,

familiaLider:
familiaLider,

familias:{

0:percentual0,

6:percentual6,

9:percentual9,

fora:percentualFora

},

numeros:
ranking.slice(0,3)

};

}


/* =========================================================
   EXTRAIR NÚMEROS
========================================================= */

function extrairNumeros(texto){

const encontrados=
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
numero>=0 &&
numero<=36
);

})
.slice(-5000);

}


/* =========================================================
   INTERFACE
========================================================= */

document.body.innerHTML="";

document.body.style.margin="0";
document.body.style.background="#101010";
document.body.style.color="#ffffff";
document.body.style.fontFamily="Arial,sans-serif";


const app=
document.createElement("div");

app.id="app069";

app.innerHTML=`

<style>

*{
box-sizing:border-box;
}

body{
margin:0;
background:#101010;
color:#fff;
font-family:Arial,sans-serif;
}

#app069{
width:100%;
max-width:850px;
margin:0 auto;
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

.titulo{
font-size:11px;
font-weight:900;
color:#aaa;
margin-bottom:7px;
}

textarea{
width:100%;
height:70px;
resize:vertical;
background:#111;
border:1px solid #555;
border-radius:7px;
color:#fff;
padding:8px;
}

.acoes{
display:flex;
gap:5px;
margin-top:6px;
flex-wrap:wrap;
}

.btn{
border:1px solid #555;
border-radius:7px;
padding:8px 10px;
background:#333;
color:#fff;
font-weight:900;
}

.btnVerde{
background:#146238;
}

.btnVermelho{
background:#762832;
}

#statusArea{
font-size:11px;
font-weight:bold;
color:#aaa;
margin-top:6px;
}

/* ======================================================
   3 LINHAS
====================================================== */

.linhaAnalise{
display:grid;
grid-template-columns:60px 1fr;
gap:5px;
margin-bottom:6px;
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
border:2px solid #ddd;
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


/* ======================================================
   GRÁFICO
====================================================== */

.legendaGrafico{
display:flex;
gap:12px;
font-size:11px;
font-weight:bold;
margin-bottom:5px;
}

.legendaGrafico span{
display:flex;
align-items:center;
gap:4px;
}

.bolinhaLegenda{
width:10px;
height:10px;
border-radius:50%;
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
border-radius:6px;
text-align:center;
padding:5px;
}

.cardResumo small{
display:block;
color:#888;
font-size:9px;
}

.cardResumo strong{
font-size:18px;
}

.graficoContainer{
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


/* ======================================================
   RAIO X
====================================================== */

.raiox{
background:#101010;
border:1px solid #555;
border-radius:8px;
padding:8px;
}

.rxTopo{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:7px;
}

.rxTitulo{
color:#00e5ff;
font-weight:900;
font-size:13px;
}

.rxEstado{
background:#222;
border:1px solid #555;
border-radius:6px;
padding:5px 8px;
font-size:11px;
font-weight:900;
}

.rxInfo{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:5px;
margin-bottom:6px;
}

.rxCard{
background:#181818;
border:1px solid #333;
border-radius:6px;
text-align:center;
padding:6px;
}

.rxCard small{
display:block;
font-size:9px;
color:#888;
}

.rxCard strong{
font-size:17px;
}

.rxFamilias{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:4px;
margin-top:6px;
}

.rxFamilia{
background:#171717;
border:1px solid #333;
border-radius:6px;
text-align:center;
padding:5px 2px;
}

.rxFamilia strong{
display:block;
font-size:15px;
}

.rxFamilia small{
font-size:8px;
color:#888;
}

.rxCandidatos{
display:flex;
gap:5px;
margin-top:7px;
}

.rxNumero{
flex:1;
background:#181818;
border:1px solid #444;
border-radius:6px;
text-align:center;
padding:6px;
}

.rxNumero strong{
font-size:18px;
}

.rxNumero small{
display:block;
font-size:9px;
color:#888;
}

.rxMensagem{
font-size:10px;
color:#888;
text-align:center;
margin-top:7px;
}


/* ======================================================
   TECLADO
====================================================== */

#teclado{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:4px;
}

.numeroBtn{
height:40px;
border:1px solid #666;
border-radius:6px;
color:#fff;
font-weight:900;
font-size:14px;
}

.zeroBtn{
grid-column:span 6;
}


/* ======================================================
   HISTÓRICO
====================================================== */

.histTopo{
display:flex;
justify-content:space-between;
align-items:center;
}

#historico{
display:none;
gap:4px;
overflow:auto;
margin-top:7px;
}

.histNumero{
min-width:30px;
height:30px;
border-radius:5px;
display:flex;
align-items:center;
justify-content:center;
font-size:12px;
font-weight:bold;
}

@media(max-width:600px){

.graficoContainer{
height:190px;
}

}

</style>


<h2>
Análise 0 • 6 • 9
</h2>


<section class="painel">

<textarea
id="entradaHistorico"
placeholder="Cole o histórico aqui..."
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

<div id="statusArea">
Cole o histórico ou use o teclado.
</div>

</section>


<section class="painel">

<div class="titulo">
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
REGIÃO
</div>

<div
id="linhaRegioes"
class="scrollLinha"
></div>

</div>


<div class="linhaAnalise">

<div class="rotulo">
ID 0/6/9
</div>

<div
id="linhaIds"
class="scrollLinha"
></div>

</div>

</section>


<section class="painel">

<div class="titulo">
EVOLUÇÃO 0 • 6 • 9 — ÚLTIMOS 14
</div>


<div class="legendaGrafico">

<span>

<i
class="bolinhaLegenda"
style="background:#00c853"
></i>

0

</span>


<span>

<i
class="bolinhaLegenda"
style="background:#ffc107"
></i>

6

</span>


<span>

<i
class="bolinhaLegenda"
style="background:#2196f3"
></i>

9

</span>

</div>


<div class="resumoGrafico">

<div class="cardResumo">

<small>
TERMINAL 0
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
TERMINAL 6
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
TERMINAL 9
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

</section>


<section class="painel">

<div
id="raioX"
class="raiox"
></div>

</section>


<section class="painel">

<div class="titulo">
TECLADO 0–36
</div>

<div id="teclado">
</div>

</section>


<section class="painel">

<div class="histTopo">

<div class="titulo">

HISTÓRICO OCULTO —
<span id="qtdHistorico">
0
</span>

</div>

<button
id="mostrarHistorico"
class="btn"
>
Mostrar
</button>

</div>

<div id="historico">
</div>

</section>

`;

document.body.appendChild(app);


/* =========================================================
   ELEMENTOS
========================================================= */

const statusArea=
document.getElementById(
"statusArea"
);

const linhaCores=
document.getElementById(
"linhaCores"
);

const linhaRegioes=
document.getElementById(
"linhaRegioes"
);

const linhaIds=
document.getElementById(
"linhaIds"
);

const qtdJanela=
document.getElementById(
"qtdJanela"
);

const total0=
document.getElementById(
"total0"
);

const total6=
document.getElementById(
"total6"
);

const total9=
document.getElementById(
"total9"
);

const raioX=
document.getElementById(
"raioX"
);

const teclado=
document.getElementById(
"teclado"
);

const elementoHistorico=
document.getElementById(
"historico"
);

const qtdHistorico=
document.getElementById(
"qtdHistorico"
);


/* =========================================================
   INSERIR HISTÓRICO
========================================================= */

function inserirHistorico(){

const campo=
document.getElementById(
"entradaHistorico"
);

const numeros=
extrairNumeros(
campo.value
);

if(!numeros.length){

statusArea.textContent=
"Nenhum número válido.";

statusArea.style.color=
"#ff5252";

return;

}


historico=
numeros;


salvarHistorico();


campo.value="";


statusArea.textContent=
historico.length+
" números carregados.";

statusArea.style.color=
"#00e676";


render();

}


/* =========================================================
   ADICIONAR
========================================================= */

function adicionarNumero(numero){

historico.push(numero);


if(historico.length>5000){

historico.shift();

}


salvarHistorico();


statusArea.textContent=
"Número "+
numero+
" inserido.";


statusArea.style.color=
"#00e5ff";


render();

}


/* =========================================================
   APAGAR
========================================================= */

function apagarUltimo(){

if(!historico.length){
return;
}


const apagado=
historico.pop();


salvarHistorico();


statusArea.textContent=
"Número "+
apagado+
" apagado.";


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


historico=[];


salvarHistorico();


render();

}


/* =========================================================
   RENDER 14
========================================================= */

function renderJanela(){

const analise=
analisarJanela14();


qtdJanela.textContent=
analise.janela.length;


linhaCores.innerHTML=
analise.janela
.map(function(numero){

const cor=
corNumeroRoleta(numero);

return (

'<div class="numeroRoleta" '+
'style="background:'+
cor.fundo+
'">'+
numero+
'</div>'

);

})
.join("");


linhaRegioes.innerHTML=
analise.janela
.map(function(numero){

const regiao=
regiaoDoNumero(numero);

const cor=
regiao
?
coresRegioes[regiao]
:
"#555";

return (

'<div class="numeroRegiao" '+
'style="background:'+
cor+
'">'+
numero+
'</div>'

);

})
.join("");


linhaIds.innerHTML=
analise.sequencia
.map(function(item){

if(!item.ids.length){

return (

'<div class="idBox">'+
'<span class="semID">—</span>'+
'</div>'

);

}


return (

'<div class="idBox">'+

item.ids
.map(function(id){

return (

'<span class="tagID" '+
'style="background:'+
corDoId(id)+
'">'+
id+
'</span>'

);

})
.join("")+

'</div>'

);

})
.join("");

}


/* =========================================================
   GRÁFICO
========================================================= */

function renderGrafico(){

const canvas=
document.getElementById(
"grafico069"
);

const box=
canvas.parentElement;


const largura=
Math.max(
300,
box.clientWidth
);


const altura=
Math.max(
170,
box.clientHeight
);


const dpr=
window.devicePixelRatio||
1;


canvas.width=
largura*dpr;

canvas.height=
altura*dpr;

canvas.style.width=
largura+"px";

canvas.style.height=
altura+"px";


const ctx=
canvas.getContext("2d");


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


ctx.fillStyle=
"#111";

ctx.fillRect(
0,
0,
largura,
altura
);


const janela=
historico.slice(
-TAMANHO_JANELA
);


const traj=
gerarTrajetoria(janela);


total0.textContent=
traj.total0;

total6.textContent=
traj.total6;

total9.textContent=
traj.total9;


const dados=[{

posicao:0,
t0:0,
t6:0,
t9:0

}].concat(
traj.pontos
);


const margemE=28;
const margemD=10;
const margemC=10;
const margemB=28;


const larguraUtil=
largura-
margemE-
margemD;


const alturaUtil=
altura-
margemC-
margemB;


function x(posicao){

return (
margemE+
(
posicao/
TAMANHO_JANELA
)*
larguraUtil
);

}


function y(valor){

return (
margemC+
alturaUtil-
(
valor/
TAMANHO_JANELA
)*
alturaUtil
);

}


/* grade */

ctx.font=
"9px Arial";

ctx.textAlign=
"right";

ctx.textBaseline=
"middle";


for(
let v=0;
v<=14;
v+=2
){

const py=
y(v);


ctx.beginPath();

ctx.moveTo(
margemE,
py
);

ctx.lineTo(
largura-margemD,
py
);

ctx.strokeStyle=
v===0
?
"#555"
:
"#282828";

ctx.lineWidth=1;

ctx.stroke();


ctx.fillStyle=
"#777";

ctx.fillText(
String(v),
margemE-4,
py
);

}


/* eixo horizontal */

ctx.textAlign="center";
ctx.textBaseline="top";


for(
let i=1;
i<=14;
i++
){

const px=x(i);


ctx.fillStyle=
"#666";

ctx.fillText(
String(i),
px,
altura-
margemB+
6
);

}


/* linha */

function desenhar(chave,cor){

if(!dados.length){
return;
}


ctx.beginPath();


dados.forEach(function(ponto,index){

const px=
x(ponto.posicao);

const py=
y(ponto[chave]);


if(index===0){

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


ctx.strokeStyle=
cor;

ctx.lineWidth=
3;

ctx.lineJoin=
"round";

ctx.lineCap=
"round";

ctx.stroke();


dados.slice(1)
.forEach(function(ponto){

ctx.beginPath();

ctx.arc(
x(ponto.posicao),
y(ponto[chave]),
3,
0,
Math.PI*2
);

ctx.fillStyle=
cor;

ctx.fill();

});

}


desenhar(
"t0",
COR_T0
);

desenhar(
"t6",
COR_T6
);

desenhar(
"t9",
COR_T9
);

}


/* =========================================================
   RAIO X RENDER
========================================================= */

function renderRaioX(){

const rx=
analisarRaioX();


let corEstado=
"#aaa";


if(
rx.estado.indexOf(
"SINAL 0"
)!==-1
){

corEstado=
COR_T0;

}


if(
rx.estado.indexOf(
"SINAL 6"
)!==-1
){

corEstado=
COR_T6;

}


if(
rx.estado.indexOf(
"SINAL 9"
)!==-1
){

corEstado=
COR_T9;

}


let candidatosHTML="";


rx.numeros.forEach(
function(item){

candidatosHTML+=

'<div class="rxNumero">'+

'<strong>'+
item.numero+
'</strong>'+

'<small>'+
item.ocorrencias+
'x histórico</small>'+

'</div>';

});


if(!candidatosHTML){

candidatosHTML=

'<div class="rxNumero">'+
'<small>Sem candidatos</small>'+
'</div>';

}


raioX.innerHTML=

'<div class="rxTopo">'+

'<div class="rxTitulo">'+
'RAIO X DO PADRÃO'+
'</div>'+

'<div class="rxEstado" '+
'style="color:'+
corEstado+
'">'+
rx.estado+
'</div>'+

'</div>'+


'<div class="rxInfo">'+

'<div class="rxCard">'+
'<small>ENCAIXES</small>'+
'<strong>'+
rx.encaixes+
'</strong>'+
'</div>'+

'<div class="rxCard">'+
'<small>SIMILARIDADE</small>'+
'<strong>'+
rx.similaridade.toFixed(1)+
'%</strong>'+
'</div>'+

'</div>'+


'<div class="rxFamilias">'+

'<div class="rxFamilia">'+
'<strong style="color:'+
COR_T0+
'">'+
rx.familias[0].toFixed(0)+
'%</strong>'+
'<small>LINHA 0</small>'+
'</div>'+

'<div class="rxFamilia">'+
'<strong style="color:'+
COR_T6+
'">'+
rx.familias[6].toFixed(0)+
'%</strong>'+
'<small>LINHA 6</small>'+
'</div>'+

'<div class="rxFamilia">'+
'<strong style="color:'+
COR_T9+
'">'+
rx.familias[9].toFixed(0)+
'%</strong>'+
'<small>LINHA 9</small>'+
'</div>'+

'<div class="rxFamilia">'+
'<strong style="color:#888">'+
rx.familias.fora.toFixed(0)+
'%</strong>'+
'<small>FORA</small>'+
'</div>'+

'</div>'+


'<div class="titulo" '+
'style="margin-top:9px">'+
'PRÓXIMOS RESULTADOS MAIS RECORRENTES'+
'</div>'+


'<div class="rxCandidatos">'+
candidatosHTML+
'</div>'+


'<div class="rxMensagem">'+
rx.mensagem+
'</div>';

}


/* =========================================================
   HISTÓRICO
========================================================= */

function renderHistorico(){

qtdHistorico.textContent=
historico.length;


elementoHistorico.innerHTML=
historico
.slice(-100)
.map(function(numero){

const cor=
corNumeroRoleta(numero);

return (

'<div class="histNumero" '+
'style="background:'+
cor.fundo+
'">'+
numero+
'</div>'

);

})
.join("");

}


/* =========================================================
   TECLADO
========================================================= */

for(
let numero=1;
numero<=36;
numero++
){

const botao=
document.createElement(
"button"
);


const cor=
corNumeroRoleta(numero);


botao.className=
"numeroBtn";


botao.textContent=
numero;


botao.style.background=
cor.fundo;


botao.onclick=
function(){

adicionarNumero(numero);

};


teclado.appendChild(
botao
);

}


const zero=
document.createElement(
"button"
);


zero.className=
"numeroBtn zeroBtn";


zero.textContent=
"0";


zero.style.background=
"#087c48";


zero.onclick=
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
.onclick=
inserirHistorico;


document
.getElementById(
"btnApagarUltimo"
)
.onclick=
apagarUltimo;


document
.getElementById(
"btnApagarTudo"
)
.onclick=
apagarTudo;


document
.getElementById(
"mostrarHistorico"
)
.onclick=
function(){

const aberto=
elementoHistorico.style.display===
"flex";


if(aberto){

elementoHistorico.style.display=
"none";

this.textContent=
"Mostrar";

}else{

elementoHistorico.style.display=
"flex";

this.textContent=
"Ocultar";

}

};


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

let timerResize;


window.addEventListener(
"resize",
function(){

clearTimeout(
timerResize
);

timerResize=
setTimeout(
renderGrafico,
150
);

});


/* =========================================================
   INICIAR
========================================================= */

render();

})();
