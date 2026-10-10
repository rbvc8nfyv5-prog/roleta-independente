(function () {
"use strict";

/*
============================================================
ANÁLISE BETA — VERSÃO 3.1
============================================================

12 MOTORES
AUTO
G1 INDEPENDENTE
28 NÚMEROS COBERTOS
5 CENTROS COM 2 VIZINHOS
1 CENTRO COM 1 VIZINHO
SEM SOBREPOSIÇÃO
SEM BURACOS ISOLADOS

JOGADOR VIRTUAL V3.1:
- AUDITA A ESCOLHA ORIGINAL
- COMPARA OS 12 MOTORES
- IDENTIFICA ALTERNATIVAS QUE ACERTARIAM
- EXPLICA A PRIORIDADE DO AUTO
- SEPARA ERRO DE SELEÇÃO E ERRO DE COBERTURA
- NÃO ALTERA JOGADAS RETROATIVAMENTE

OTIMIZAÇÃO:
- GEOMETRIA PRÉ-CALCULADA
- CACHE DE CONFIGURAÇÕES
- PROCESSAMENTO ASSÍNCRONO
- RENDERIZAÇÃO SEM RECÁLCULO DESNECESSÁRIO
============================================================
*/

const STORAGE = "ANALISE_BETA_VIRTUAL_V31";

const TRACK = [
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

const VERMELHOS = new Set([
1,3,5,7,9,12,14,16,18,
19,21,23,25,27,30,32,34,36
]);

const MOTORES = [
"NORMAL",
"DINAMICO",
"RX_NORMAL",
"RX_DINAMICO"
];

const RX_LIST = [4,5,6];

const PREFIXOS = {
NORMAL:"N",
DINAMICO:"D",
RX_NORMAL:"RN",
RX_DINAMICO:"RD"
};

const ZONAS_QUEBRA = {
1:[13,14,15,16,17,18],
2:[0,26,3,35,28,7,6,30],
3:[23,10,24,20,22,21,4,19]
};

const GRUPOS_FISICOS = {
1:[
[3,12,7],
[4,2,21],
[11,8,5],
[6,1,9]
],
2:[
[13,36,11,30,8],
[23,10,5,24,16],
[15,19,17,14,20,18]
],
3:[
[25,17,34,6,27],
[32,15,19,4,21],
[29,7,28,12,35,3,26],
[31,9,22,18,33]
]
};

const REGIOES = {
VOISINS:new Set([
19,4,21,2,25,28,7,29,18,22
]),
ZERO:new Set([
0,32,15,26,3,35,12
]),
TIERS:new Set([
27,13,36,11,30,8,23,10,5,24,16,33
]),
ORPHELINS:new Set([
9,31,14,20,1,17,6,34
])
};

const ORDEM_REGIOES = [
"VOISINS",
"ZERO",
"TIERS",
"ORPHELINS",
"OUTROS"
];

const INDICE = new Map(
TRACK.map((n,i)=>[n,i])
);

const mod = (n,m)=>((n%m)+m)%m;

const pos = n=>INDICE.get(n)??-1;

function distancia(a,b){
const x=pos(a),y=pos(b);
if(x<0||y<0)return 99;
const d=Math.abs(x-y);
return Math.min(d,37-d);
}

function delta(a,b){
let d=mod(pos(b)-pos(a),37);
return d>18?d-37:d;
}

function vizinhos(n,q){
const p=pos(n);
if(p<0)return [];
const r=[];
for(let d=-q;d<=q;d++){
r.push(TRACK[mod(p+d,37)]);
}
return r;
}

function duzia(n){
return n===0?0:Math.ceil(n/12);
}

function corNumero(n){
return n===0?"#087c48":
VERMELHOS.has(n)?"#c6283d":"#181818";
}

function nomeMotor(m){
return {
NORMAL:"NORMAL",
DINAMICO:"DINÂMICO",
RX_NORMAL:"RAIO-X",
RX_DINAMICO:"RAIO-X DINÂMICO"
}[m]||m;
}

function nomeConfig(c){
return c?
nomeMotor(c.motor)+" C"+c.rx:
"SEM JOGADA";
}

function regiao(n){
for(const [nome,numeros] of Object.entries(REGIOES)){
if(numeros.has(n))return nome;
}
return "OUTROS";
}

function chaveMotor(m,rx){
return m+"_"+rx;
}

function criarMapa(valor=null){
const r={AUTO:valor};
for(const m of MOTORES){
r[m]={};
for(const rx of RX_LIST)r[m][rx]=valor;
}
return r;
}

function criarTimelines(){
const t=criarMapa();
t.AUTO=[];
for(const m of MOTORES){
for(const rx of RX_LIST)t[m][rx]=[];
}
return t;
}

function criarEstado(){
return {
historico:[],
modo:"AUTO",
motorManual:"NORMAL",
manualRX:4,
timelines:criarTimelines(),
pendentes:criarMapa(),
freezes:criarMapa(),
visual:[],
visualFreeze:null,
painelCandidatosAberto:false,
painelTimelinesAberto:false,
jogadorVirtualAberto:true,
diagnostico:null,
ultimoNumero:null
};
}

let estado=criarEstado();

function carregar(){
try{
const raw=localStorage.getItem(STORAGE);
if(!raw)return;
const s=JSON.parse(raw);

estado.historico=(s.historico||[])
.map(Number)
.filter(n=>Number.isInteger(n)&&n>=0&&n<=36)
.slice(-20);

estado.modo=s.modo==="MANUAL"?"MANUAL":"AUTO";

if(MOTORES.includes(s.motorManual))
estado.motorManual=s.motorManual;

if(RX_LIST.includes(s.manualRX))
estado.manualRX=s.manualRX;

estado.painelCandidatosAberto=
!!s.painelCandidatosAberto;

estado.painelTimelinesAberto=
!!s.painelTimelinesAberto;

estado.jogadorVirtualAberto=
s.jogadorVirtualAberto!==false;

estado.diagnostico=s.diagnostico||null;
estado.ultimoNumero=s.ultimoNumero??null;

if(s.timelines){
estado.timelines.AUTO=
(s.timelines.AUTO||[]).slice(-20);

for(const m of MOTORES){
for(const rx of RX_LIST){
estado.timelines[m][rx]=
(s.timelines[m]?.[rx]||[]).slice(-20);
}
}
}

for(const campo of ["pendentes","freezes"]){
if(!s[campo])continue;

estado[campo].AUTO=s[campo].AUTO||null;

for(const m of MOTORES){
for(const rx of RX_LIST){
estado[campo][m][rx]=
s[campo][m]?.[rx]||null;
}
}
}

estado.visual=(s.visual||[]).slice(-14);
estado.visualFreeze=s.visualFreeze||null;

}catch(e){
console.warn("Erro ao carregar:",e);
}
}

function salvar(){
try{
localStorage.setItem(
STORAGE,
JSON.stringify(estado)
);
}catch(e){
console.warn("Erro ao salvar:",e);
}
}

carregar();

/*
============================================================
ANÁLISE FÍSICA
============================================================
*/

function analisarFisica(base){

const calor=new Float64Array(37);
const contagem=[0,0,0,0];
const forca=[0,0,0,0];
const quebra=[0,0,0,0];
const pesos=[1,.78,.52,.29,.14,.06];

base.forEach((numero,i)=>{

const peso=.45+.55*(i+1)/Math.max(1,base.length);
const d=duzia(numero);

if(d){
contagem[d]++;
forca[d]+=peso;
}

for(let z=1;z<=3;z++){
if(ZONAS_QUEBRA[z].includes(numero))
quebra[z]+=peso;
}

for(let j=0;j<37;j++){
const dist=distancia(numero,TRACK[j]);
if(dist<=5)calor[j]+=pesos[dist]*peso;
}
});

const info={};

for(let z=1;z<=3;z++){

const numeros=[
...new Set(GRUPOS_FISICOS[z].flat())
];

const fisica=numeros.reduce(
(s,n)=>s+calor[pos(n)],0
)/numeros.length;

const score=
forca[z]*.46+
fisica*.40+
quebra[z]*.14;

info[z]={
duzia:z,
contagem:contagem[z],
fisica,
quebra:quebra[z],
score
};
}

const maior=Math.max(
.00001,
info[1].score,
info[2].score,
info[3].score
);

const ranking=[1,2,3]
.map(z=>({
...info[z],
intensidade:info[z].score/maior
}))
.sort((a,b)=>b.score-a.score);

return {
calor,
ranking,
info,
maxCalor:Math.max(.00001,...calor)
};
}

function contagemFisica(base,rx){

const mapa=new Float64Array(37);
const decay={4:.78,5:.82,6:.86}[rx];
const pesos=[1,.72,.44,.22,.10];

let peso=1;

for(let i=base.length-1;i>=0;i--){

for(let j=0;j<37;j++){
const d=distancia(base[i],TRACK[j]);
if(d<=4)mapa[j]+=pesos[d]*peso;
}

peso*=decay;
}

const maior=Math.max(.00001,...mapa);

return mapa.map(v=>v/maior);
}

/*
============================================================
RAIO-X
============================================================
*/

function analisarRaioX(base,rx){

const frequencia=new Float64Array(37);

if(base.length<rx*2+4){
return {
valido:false,
frequencia,
similaridade:0
};
}

const atual=base.slice(-rx);
const candidatos=[];

for(let i=0;i+rx<base.length-rx;i++){

let score=0;

for(let k=0;k<rx;k++){

const antigo=base[i+k];
const recente=atual[k];

if(duzia(antigo)===duzia(recente))
score+=.70;

score+=.30*Math.max(
0,
1-distancia(antigo,recente)/19
);
}

candidatos.push({
numero:base[i+rx],
score:score/rx,
indice:i
});
}

candidatos.sort(
(a,b)=>b.score-a.score||b.indice-a.indice
);

const escolhidos=candidatos.slice(
0,
Math.max(4,Math.ceil(candidatos.length*.30))
);

const pesos=[1,.70,.42,.18];

for(const item of escolhidos){
for(let j=0;j<37;j++){
const d=distancia(item.numero,TRACK[j]);

if(d<=3){
frequencia[j]+=
pesos[d]*(.40+.60*item.score);
}
}
}

const maior=Math.max(.00001,...frequencia);

const similaridade=escolhidos.length?
escolhidos.reduce((s,x)=>s+x.score,0)/
escolhidos.length*100:0;

return {
valido:escolhidos.length>0,
frequencia:frequencia.map(v=>v/maior),
similaridade
};
}

/*
============================================================
PONTUAÇÃO
============================================================
*/

function pontuarMotor(
base,motor,rx,analise,contagem,raioX
){

const usaRX=motor.startsWith("RX");
const dinamico=motor.includes("DINAMICO");

if(usaRX&&!raioX.valido)return null;

const alvo=rx-3;
const scores=new Float64Array(37);

for(let j=0;j<37;j++){

const numero=TRACK[j];
const principal=duzia(numero)===alvo?1:0;

let proximidade=0;

for(const grupo of GRUPOS_FISICOS[alvo]){
for(const n of grupo){

const d=distancia(numero,n);

const peso=
d===0?1:
d===1?.75:
d===2?.45:
d===3?.20:0;

proximidade=Math.max(proximidade,peso);
}
}

const quebra=ZONAS_QUEBRA[alvo]
.some(n=>distancia(numero,n)<=2)?1:0;

const fisica=analise.calor[j]/analise.maxCalor;

let score=
principal*.52+
proximidade*.48+
fisica*.24+
quebra*.22+
contagem[j]*.22;

if(usaRX){
score=
principal*.42+
proximidade*.38+
fisica*.22+
quebra*.18+
contagem[j]*.12+
raioX.frequencia[j]*.34;
}

if(dinamico){

const ultimos=base.slice(-rx);
let direcao=0,total=0;

ultimos.forEach((n,i)=>{

const d=delta(numero,n);

if(Math.abs(d)<=7){
const peso=(i+1)/ultimos.length;
direcao+=Math.sign(d)*peso;
total+=peso;
}
});

if(total>0){
score+=Math.abs(direcao/total)*.11;
}
}

scores[j]=score;
}

return {
scores,
similaridade:raioX.similaridade||0
};
}

/*
============================================================
GEOMETRIA
============================================================
*/

const PADROES=[];

function gerarPadroes(restante,atual){

if(atual.length===6){
if(restante===0)PADROES.push([...atual]);
return;
}

for(let gap=0;gap<=restante;gap++){

if(gap===1)continue;

atual.push(gap);
gerarPadroes(restante-gap,atual);
atual.pop();
}
}

gerarPadroes(9,[]);

const MODELOS=[];
const ASSINATURAS=new Set();

for(let inicio=0;inicio<37;inicio++){

for(let posicao3=0;posicao3<6;posicao3++){

for(const gaps of PADROES){

let cursor=inicio;
const blocos5=[];
let bloco3=-1;

for(let k=0;k<6;k++){

const tamanho=k===posicao3?3:5;

const centro=mod(
cursor+Math.floor(tamanho/2),37
);

if(k===posicao3){
bloco3=centro;
}else{
blocos5.push(centro);
}

cursor=mod(cursor+tamanho+gaps[k],37);
}

const chave=
[...blocos5].sort((a,b)=>a-b).join("-")+
"|"+bloco3;

if(ASSINATURAS.has(chave))continue;

ASSINATURAS.add(chave);

MODELOS.push({
blocos5,
bloco3,
chave
});
}
}
}

/*
============================================================
CONSTRUTOR OTIMIZADO
============================================================
*/

function construirJogada(scores,usadas){

const pontos5=new Float64Array(37);
const pontos3=new Float64Array(37);

for(let c=0;c<37;c++){

for(let d=-2;d<=2;d++){

const peso=
d===0?1.22:
Math.abs(d)===1?1.08:1;

pontos5[c]+=scores[mod(c+d,37)]*peso;
}

for(let d=-1;d<=1;d++){

pontos3[c]+=
scores[mod(c+d,37)]*
(d===0?1.22:1);
}
}

let melhor=null;
let maior=-Infinity;

for(const modelo of MODELOS){

if(usadas.has(modelo.chave))continue;

let score=pontos3[modelo.bloco3];

for(const c of modelo.blocos5){
score+=pontos5[c];
}

if(score>maior){
maior=score;
melhor=modelo;
}
}

if(!melhor)return null;

const blocos2=melhor.blocos5.map(i=>({
centro:TRACK[i],
qtd:2,
numeros:vizinhos(TRACK[i],2)
}));

const blocos1=[{
centro:TRACK[melhor.bloco3],
qtd:1,
numeros:vizinhos(TRACK[melhor.bloco3],1)
}];

const numeros=new Set(
[...blocos2,...blocos1].flatMap(b=>b.numeros)
);

if(numeros.size!==28)return null;

return {
valido:true,
blocos2,
blocos1,
numeros,
score:maior,
assinatura:melhor.chave
};
}

function gerarConfig(
base,motor,rx,usadas,analise,contagem,raioX
){

const minimo=motor.startsWith("RX")?
Math.max(14,rx*2+4):
Math.max(8,rx+4);

if(base.length<minimo){
return {
valido:false,
motor,
rx,
motivo:"AGUARDANDO HISTÓRICO"
};
}

const info=pontuarMotor(
base,motor,rx,analise,contagem,raioX
);

if(!info){
return {
valido:false,
motor,
rx,
motivo:"SEM RÉPLICAS"
};
}

const jogada=construirJogada(info.scores,usadas);

if(!jogada){
return {
valido:false,
motor,
rx,
motivo:"SEM JOGADA VÁLIDA"
};
}

return {
valido:true,
motor,
rx,
alvoDuzia:rx-3,
jogada,
score:jogada.score,
assinatura:jogada.assinatura,
similaridade:info.similaridade
};
}

/*
============================================================
CLASSIFICAÇÃO
============================================================
*/

function classificar(numero,jogada){

if(!jogada?.valido){
return {
green:false,
tipo:"SEM",
centro:null
};
}

const blocos=[
...jogada.blocos2,
...jogada.blocos1
];

for(const bloco of blocos){

if(bloco.numeros.includes(numero)){

const d=distancia(numero,bloco.centro);

return {
green:true,
tipo:d===0?"ALVO":d===1?"V1":"V2",
centro:bloco.centro,
distancia:d
};
}
}

let proximo=null;

for(const bloco of blocos){

const d=distancia(numero,bloco.centro);
const gap=d-bloco.qtd;

if(gap>0&&(!proximo||gap<proximo.gap)){
proximo={
centro:bloco.centro,
distancia:d,
gap
};
}
}

return {
green:false,
tipo:"FORA",
centro:proximo?.centro??null,
distancia:proximo?.distancia??null,
gap:proximo?.gap??null
};
}

/*
============================================================
ESTATÍSTICAS
============================================================
*/

function estatisticas(lista){

const validos=(lista||[])
.filter(x=>
!x.semJogada&&
!x.aguardandoG1&&
typeof x.green==="boolean"
).slice(-20);

function taxa(n){
const itens=validos.slice(-n);
return itens.length?
itens.filter(x=>x.green).length/itens.length*100:
0;
}

let perdas=0;

for(let i=validos.length-1;i>=0;i--){
if(validos[i].green)break;
perdas++;
}

return {
total:validos.length,
taxa5:taxa(5),
taxa10:taxa(10),
taxa20:taxa(20),
perdas
};
}

/*
============================================================
CACHE E AUTO
============================================================
*/

let cacheChave=null;
let cacheResultado=null;
let calculando=false;
let versaoCalculo=0;

function invalidarCache(){
cacheChave=null;
cacheResultado=null;
versaoCalculo++;
}

function escolherAuto(configs){

const candidatos=[];

for(const m of MOTORES){
for(const rx of RX_LIST){

const c=configs[m][rx];

if(c?.valido)candidatos.push(c);
}
}

candidatos.sort(
(a,b)=>b.scoreAuto-a.scoreAuto
);

return candidatos[0]||null;
}

async function calcularDoze(base,versao){

const configs={
NORMAL:{},
DINAMICO:{},
RX_NORMAL:{},
RX_DINAMICO:{}
};

const analise=analisarFisica(base);
const contagens={};
const raioXs={};

for(const rx of RX_LIST){
contagens[rx]=contagemFisica(base,rx);
raioXs[rx]=analisarRaioX(base,rx);
}

const usadas=new Set();

for(const m of MOTORES){

for(const rx of RX_LIST){

if(versao!==versaoCalculo)return null;

const config=gerarConfig(
base,m,rx,usadas,
analise,contagens[rx],raioXs[rx]
);

if(config.valido){

usadas.add(config.assinatura);

const live=estatisticas(
estado.timelines[m][rx]
);

config.criteriosAuto={
pontuacaoGeometrica:config.score,
taxa10:live.taxa10,
taxa20:live.taxa20,
perdas:live.perdas,
similaridade:config.similaridade
};

config.scoreAuto=
config.score+
live.taxa10*.02+
live.taxa20*.01-
live.perdas*.30+
config.similaridade*.005;
}

configs[m][rx]=config;
}

/*
Cede controle ao navegador após cada família
de motores, permitindo que a interface responda.
*/
await new Promise(resolve=>setTimeout(resolve,0));
}

return {
configs,
analise,
auto:escolherAuto(configs)
};
}

async function obterConfigs(){

const chave=estado.historico.join(",");

if(cacheChave===chave&&cacheResultado){
return cacheResultado;
}

const versao=versaoCalculo;
const base=[...estado.historico];

const resultado=await calcularDoze(base,versao);

if(!resultado||versao!==versaoCalculo){
return null;
}

cacheChave=chave;
cacheResultado=resultado;

return resultado;
}

function configAtiva(configs,auto){

return estado.modo==="AUTO"?
auto:
configs[estado.motorManual]?.[estado.manualRX]||null;
}

/*
============================================================
SNAPSHOTS
============================================================
*/

function snapshot(c){

if(!c?.valido)return null;

return {
motor:c.motor,
rx:c.rx,
centros2:c.jogada.blocos2.map(b=>b.centro),
centro1:c.jogada.blocos1[0].centro,
historico:estado.historico.join(","),
score:c.score,
scoreAuto:c.scoreAuto,
criteriosAuto:c.criteriosAuto||null
};
}

function jogadaSnapshot(s){

if(!s)return null;

const blocos2=s.centros2.map(centro=>({
centro,
qtd:2,
numeros:vizinhos(centro,2)
}));

const blocos1=[{
centro:s.centro1,
qtd:1,
numeros:vizinhos(s.centro1,1)
}];

return {
valido:true,
blocos2,
blocos1,
numeros:new Set(
[...blocos2,...blocos1].flatMap(b=>b.numeros)
)
};
}

function prepararPendentes(configs,auto){

const chave=estado.historico.join(",");

if(!estado.freezes.AUTO){
if(estado.pendentes.AUTO?.historico!==chave){
estado.pendentes.AUTO=snapshot(auto);
}
}

for(const m of MOTORES){
for(const rx of RX_LIST){

if(estado.freezes[m][rx])continue;

if(estado.pendentes[m][rx]?.historico!==chave){
estado.pendentes[m][rx]=
snapshot(configs[m][rx]);
}
}
}
}

/*
============================================================
G1 INDEPENDENTE
============================================================
*/

function avaliarLinha(numero,pendente,freeze,timeline,chave){

const lista=[...timeline];

if(freeze){

const r=classificar(
numero,
jogadaSnapshot(freeze)
);

const i=lista.findLastIndex(
x=>x.aguardandoG1
);

const item={
resultadoG1:numero,
green:r.green,
tipo:r.tipo,
fase:r.green?"G1":"LOSS",
aguardandoG1:false,
semJogada:false
};

if(i>=0){
lista[i]={...lista[i],...item};
}else{
lista.push({resultado:numero,...item});
}

return {
timeline:lista.slice(-20),
pendente:null,
freeze:null
};
}

if(!pendente||pendente.historico!==chave){

lista.push({
resultado:numero,
green:null,
semJogada:true,
fase:"SEM"
});

return {
timeline:lista.slice(-20),
pendente:null,
freeze:null
};
}

const r=classificar(
numero,
jogadaSnapshot(pendente)
);

if(r.green){

lista.push({
resultado:numero,
green:true,
tipo:r.tipo,
semJogada:false,
fase:"ENTRADA"
});

return {
timeline:lista.slice(-20),
pendente:null,
freeze:null
};
}

lista.push({
resultado:numero,
green:null,
semJogada:false,
aguardandoG1:true,
fase:"ESPERA_G1"
});

return {
timeline:lista.slice(-20),
pendente:null,
freeze:{...pendente}
};
}

function avaliarPendentes(numero){

const chave=estado.historico.join(",");

const auto=avaliarLinha(
numero,
estado.pendentes.AUTO,
estado.freezes.AUTO,
estado.timelines.AUTO,
chave
);

estado.timelines.AUTO=auto.timeline;
estado.pendentes.AUTO=auto.pendente;
estado.freezes.AUTO=auto.freeze;

for(const m of MOTORES){
for(const rx of RX_LIST){

const r=avaliarLinha(
numero,
estado.pendentes[m][rx],
estado.freezes[m][rx],
estado.timelines[m][rx],
chave
);

estado.timelines[m][rx]=r.timeline;
estado.pendentes[m][rx]=r.pendente;
estado.freezes[m][rx]=r.freeze;
}
}
}

/*
============================================================
JOGADOR VIRTUAL V3.1
AUDITORIA DA ESCOLHA
============================================================
*/

function auditarEscolha(
numero,
escolhida,
configs,
modoEscolha
){

if(!escolhida?.valido){

return {
tipo:"SEM_JOGADA",
titulo:"AGUARDANDO HISTÓRICO",
texto:"Não havia uma jogada válida antes do sorteio.",
detalhes:[]
};
}

const resultado=classificar(
numero,
escolhida.jogada
);

const todos=[];

for(const m of MOTORES){
for(const rx of RX_LIST){

const c=configs[m][rx];

if(c?.valido){

todos.push({
config:c,
resultado:classificar(numero,c.jogada)
});
}
}
}

const pontuacao=c=>
Number(c.scoreAuto??c.score??0);

const criterios=escolhida.criteriosAuto||{};

const detalhes=[
"Número sorteado: "+numero,
"Motor escolhido: "+nomeConfig(escolhida),
"Modo de escolha: "+modoEscolha,
"Pontuação AUTO: "+pontuacao(escolhida).toFixed(2),
"Pontuação geométrica: "+
Number(escolhida.score||0).toFixed(2),
"Histórico de acertos em 10: "+
Number(criterios.taxa10||0).toFixed(0)+"%",
"Histórico de acertos em 20: "+
Number(criterios.taxa20||0).toFixed(0)+"%",
"Sequência de perdas: "+
Number(criterios.perdas||0),
"Similaridade RX: "+
Number(criterios.similaridade||0).toFixed(1)+"%"
];

if(resultado.green){

return {
tipo:"ACERTO",
titulo:"ACERTO NA PRIMEIRA ENTRADA",
texto:
"O motor "+nomeConfig(escolhida)+
" cobria o número "+numero+
". A escolha acertou na primeira entrada.",
detalhes:[
...detalhes,
"Centro atingido: "+resultado.centro,
"Classificação: "+resultado.tipo
]
};
}

const alternativas=todos
.filter(x=>x.resultado.green)
.sort(
(a,b)=>
pontuacao(b.config)-pontuacao(a.config)
);

if(alternativas.length){

const melhor=alternativas[0];
const alternativa=melhor.config;

const diferenca=
pontuacao(escolhida)-
pontuacao(alternativa);

const criterioDominante=[
{
nome:"pontuação geométrica",
valor:Number(criterios.pontuacaoGeometrica||0)
},
{
nome:"taxa histórica de 10 entradas",
valor:Number(criterios.taxa10||0)*.02
},
{
nome:"taxa histórica de 20 entradas",
valor:Number(criterios.taxa20||0)*.01
},
{
nome:"similaridade Raio-X",
valor:Number(criterios.similaridade||0)*.005
}
].sort((a,b)=>b.valor-a.valor)[0];

const outros=alternativas
.map(x=>nomeConfig(x.config))
.join(" • ");

const motivo=modoEscolha==="AUTO"?
(
"O AUTO deu prioridade ao motor "+
nomeConfig(escolhida)+
" porque ele obteve a maior pontuação combinada "+
"entre os candidatos válidos. "+
"O componente de maior peso nessa pontuação foi "+
criterioDominante.nome+". "
):
(
"O motor "+nomeConfig(escolhida)+
" estava selecionado manualmente. "+
"Portanto, o AUTO não foi responsável por essa escolha. "
);

return {
tipo:"ERRO_SELECAO",
titulo:"POR QUE ESCOLHEMOS ERRADO?",
texto:
motivo+
"Entretanto, o motor "+
nomeConfig(alternativa)+
" já tinha uma jogada que cobria o número "+
numero+". "+
"Para acertar especificamente este resultado de primeira, "+
"teríamos precisado selecionar "+
nomeConfig(alternativa)+
" em vez de "+
nomeConfig(escolhida)+
". A comparação revela uma limitação do critério de seleção, "+
"mas não prova que essa alternativa teria sido melhor "+
"antes de conhecer o resultado.",
detalhes:[
...detalhes,
"Motores que acertariam: "+alternativas.length,
"Melhor alternativa retrospectiva: "+
nomeConfig(alternativa),
"Pontuação alternativa: "+
pontuacao(alternativa).toFixed(2),
"Diferença de prioridade: "+
diferenca.toFixed(2),
"Centro que cobriria o número: "+
melhor.resultado.centro,
"Alternativas: "+outros
],
alternativa:{
motor:alternativa.motor,
rx:alternativa.rx,
centro:melhor.resultado.centro
}
};
}

const descobertos=TRACK.filter(
n=>!escolhida.jogada.numeros.has(n)
);

return {
tipo:"ERRO_COBERTURA",
titulo:"POR QUE NENHUM MOTOR PEGOU?",
texto:
"O problema não foi apenas a seleção do AUTO. "+
"Nenhum dos "+todos.length+
" motores válidos havia gerado uma jogada que cobrisse "+
"o número "+numero+". "+
"Para acertar essa entrada, seria necessário gerar "+
"uma configuração diferente antes do sorteio. "+
"Isso indica uma limitação comum aos critérios de cobertura "+
"usados pelos motores. A revisão adequada é comparar "+
"novos pesos e configurações em outros resultados históricos, "+
"sem ajustar a previsão usando o próprio resultado que falhou.",
detalhes:[
...detalhes,
"Motores que cobririam o número: 0",
"Números descobertos da escolha: "+
descobertos.join(", "),
"Tipo de falha: COBERTURA DOS CANDIDATOS"
]
};
}

function atualizarDiagnosticoG1(numero,snap){

const anterior=estado.diagnostico;

if(!anterior||anterior.tipo==="SEM_JOGADA")return;

const r=classificar(
numero,
jogadaSnapshot(snap)
);

estado.diagnostico={
...anterior,
titulo:r.green?
"PRIMEIRA FALHOU • G1 ACERTOU":
"PRIMEIRA E G1 FALHARAM",
texto:
anterior.texto+
" No G1 saiu "+numero+
(r.green?
", dentro da cobertura congelada.":
", também fora da cobertura congelada."),
detalhes:[
...anterior.detalhes,
"Resultado G1: "+numero,
"G1: "+(r.green?"ACERTO":"ERRO")
],
greenG1:r.green
};
}

/*
============================================================
INTERFACE
============================================================
*/

document.body.innerHTML="";
document.body.style.cssText=
"margin:0;background:#101014;color:#fff;font-family:Arial,sans-serif";

const app=document.createElement("div");

app.innerHTML=`
<style>
*{box-sizing:border-box}
.app{max-width:950px;margin:auto;padding:8px}
h2{text-align:center;font-size:20px;margin:8px 0}
.painel{
background:#1b1c23;
border:1px solid #363843;
border-radius:11px;
padding:10px;
margin-bottom:9px
}
.titulo{
font-size:10px;
font-weight:900;
color:#aeb5c5;
margin-bottom:8px
}
textarea{
width:100%;
height:60px;
background:#101116;
color:white;
border:1px solid #515666;
border-radius:7px;
padding:9px
}
button{
font-family:Arial,sans-serif;
font-weight:900;
cursor:pointer;
touch-action:manipulation
}
.botoes,.modos{
display:flex;
flex-wrap:wrap;
gap:5px;
margin-top:7px
}
.btn{
background:#333846;
color:white;
border:1px solid #555e70;
border-radius:7px;
padding:9px 11px;
font-size:10px
}
.verde{background:#17643b}
.red{background:#782a35}
.cabecalho{
width:100%;
display:flex;
align-items:center;
justify-content:space-between;
background:#232632;
border:1px solid #414756;
border-radius:8px;
padding:10px;
color:white;
text-align:left
}
.cabecalho strong{font-size:11px}
.seta{color:#00d9ff;font-size:15px}
.oculto{display:none!important}
.autoCompacto{
display:flex;
align-items:center;
gap:8px;
padding:8px;
background:#111820;
border:1px solid #007d98;
border-radius:8px;
margin-top:7px
}
.autoQuadrado{
min-width:53px;
height:42px;
background:#007d98;
border:1px solid #00e5ff;
border-radius:8px;
color:white;
font-size:12px
}
.autoDescricao{
font-size:10px;
font-weight:900;
color:#00e5ff
}
.seletorGrupo{margin-top:11px}
.seletorTitulo{
font-size:9px;
color:#aeb5c5;
font-weight:900
}
.modo{
background:#262936;
color:#c3c7d0;
border:1px solid #555c6b;
border-radius:7px;
padding:9px 12px;
font-size:11px
}
.modo.ativo{
background:#007d98;
color:white;
border-color:#00e5ff
}
.modo.dinamico.ativo{
background:#6c4d00;
border-color:#ffc107
}
.modo.raiox.ativo{
background:#4b236b;
border-color:#d27cff
}
.modo.raiox.dinamico.ativo{
background:#7a3d00;
border-color:#ff9800
}
.resumo{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:5px;
margin-top:10px
}
.card{
background:#101116;
border:1px solid #333947;
border-radius:7px;
padding:9px 5px;
text-align:center
}
.card small{
display:block;
font-size:8px;
color:#a4aab7
}
.card strong{
display:block;
font-size:18px;
margin-top:4px
}
.duziasLinha{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:5px;
margin-top:8px
}
.duziaCard{
background:#101116;
border:1px solid #414653;
border-radius:7px;
padding:8px;
text-align:center
}
.duziaCard.forte{border-color:#00e676}
.duziaCard small{
display:block;
font-size:8px;
color:#aeb5c5
}
.duziaCard strong{
display:block;
font-size:17px;
margin:5px 0
}
.duziaCard span{
font-size:8px;
color:#aeb5c5
}
.timelineSecao{
margin-top:10px;
padding-top:8px;
border-top:1px solid #363843
}
.timelineTituloGrupo{
font-size:9px;
font-weight:900;
color:#aeb5c5
}
.timelineRow{
display:grid;
grid-template-columns:70px minmax(0,1fr) 38px;
gap:5px;
align-items:center;
margin-top:6px
}
.timeline{
display:flex;
gap:2px;
justify-content:flex-end;
overflow:hidden
}
.gl{
width:17px;
min-width:17px;
height:18px;
border-radius:4px;
font-size:8px;
display:flex;
align-items:center;
justify-content:center;
font-weight:900
}
.gl.green{background:#00994d}
.gl.loss{background:#c62828}
.gl.g1{background:#ffc107;color:#111}
.gl.wait{background:#4a3510;color:#ffc107}
.gl.sem{background:#333;color:#999}
.nomeTL,.taxaTL{
font-size:9px;
font-weight:900
}
.taxaTL{text-align:right}
.duplas14{
display:grid;
grid-template-columns:repeat(7,1fr);
gap:5px
}
.dupla14{
min-height:63px;
border-radius:7px;
background:#272a34;
border:2px solid #555;
display:flex;
justify-content:center;
position:relative;
padding:6px 3px 25px
}
.dupla14.green{border-color:#00b85c}
.dupla14.loss{border-color:#d93a3a}
.dupla14.g1{border-color:#ffc107}
.dupla14.wait{border-color:#8a6b00}
.bolaDupla{
width:30px;
height:30px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:11px;
font-weight:900;
border:2px solid #aaa
}
.resultadoEntrada{
position:absolute;
bottom:3px;
left:50%;
transform:translateX(-50%);
background:#171717;
border:1px solid #777;
border-radius:5px;
padding:3px 5px;
font-size:8px;
white-space:nowrap
}
.resultadoEntrada.green{background:#00994d}
.resultadoEntrada.loss{background:#c62828}
.resultadoEntrada.g1{
background:#ffc107;
color:#111
}
.resultadoEntrada.wait{color:#ffc107}
.jogadaStatus{
display:block;
font-size:10px;
font-weight:900;
color:#00e5ff;
margin-bottom:9px;
line-height:1.5
}
.jogadaStatus.congelada{color:#ffc107}
.jogadaHorizontal{
display:grid;
grid-template-columns:repeat(6,minmax(0,1fr));
gap:5px;
width:100%
}
.alvoQuadrado{
aspect-ratio:1/1;
min-height:45px;
background:#006ca6;
border:2px solid #00cfff;
border-radius:9px;
color:#fff;
display:flex;
align-items:center;
justify-content:center;
font-size:clamp(16px,4vw,27px);
font-weight:900
}
.alvoQuadrado.um{
background:#b78300;
border-color:#ffd54f;
color:#111
}
.alvoQuadrado.congelado{
box-shadow:0 0 0 1px #ffc107 inset
}
.legendaJogada{
display:flex;
gap:13px;
align-items:center;
margin-top:9px;
flex-wrap:wrap;
font-size:9px;
color:#aeb5c5
}
.legendaCor{
display:inline-block;
width:11px;
height:11px;
border-radius:3px;
margin-right:4px;
vertical-align:middle
}
.legendaCor.azul{background:#0089cf}
.legendaCor.amarelo{background:#ffc107}
.teclado{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:5px
}
.numero{
height:43px;
border:1px solid #666;
border-radius:6px;
color:white;
font-size:13px
}
.zero{grid-column:span 6}
.virtualCabecalho{
display:flex;
align-items:center;
gap:9px
}
.virtualAvatar{
width:39px;
height:39px;
background:#133e50;
border:1px solid #00d9ff;
border-radius:10px;
display:flex;
align-items:center;
justify-content:center;
font-size:22px
}
.virtualTitulo{
font-size:13px;
font-weight:900;
color:#00d9ff
}
.virtualSubtitulo{
font-size:9px;
color:#aeb5c5;
margin-top:3px
}
.virtualStatus{
padding:9px;
border-radius:8px;
font-size:11px;
font-weight:900;
margin-top:10px;
line-height:1.5
}
.virtualStatus.green{
background:#123b2b;
color:#00e676;
border:1px solid #008e52
}
.virtualStatus.loss{
background:#451d25;
color:#ff6c78;
border:1px solid #a33142
}
.virtualStatus.wait{
background:#373015;
color:#ffd54f;
border:1px solid #977c20
}
.virtualTexto{
background:#11141b;
border:1px solid #363b48;
border-radius:8px;
padding:11px;
margin-top:8px;
font-size:12px;
line-height:1.6;
color:#e4e8f0
}
.virtualDetalhes{
display:grid;
grid-template-columns:repeat(2,minmax(0,1fr));
gap:5px;
margin-top:9px
}
.virtualDetalhe{
background:#12151d;
border:1px solid #333b4a;
border-radius:6px;
padding:8px;
font-size:10px;
line-height:1.5;
color:#c5cedc
}
.status{
font-size:10px;
font-weight:900;
color:#00e676;
margin-top:8px;
line-height:1.6
}
@media(max-width:600px){
.resumo{grid-template-columns:repeat(2,1fr)}
.duplas14{grid-template-columns:repeat(4,1fr)}
.timelineRow{
grid-template-columns:63px minmax(0,1fr) 34px
}
.gl{
width:15px;
min-width:15px;
height:17px;
font-size:7px
}
.alvoQuadrado{
min-height:42px;
border-radius:6px
}
.jogadaHorizontal{gap:4px}
.virtualDetalhes{grid-template-columns:1fr}
}
</style>

<div class="app">

<h2>ANÁLISE BETA V3.1</h2>

<div class="painel">
<textarea id="entradaHistorico"
placeholder="Cole o histórico — últimos 20 números"></textarea>
<div class="botoes">
<button id="inserir" class="btn verde">INSERIR</button>
<button id="apagar" class="btn">APAGAR ÚLTIMO</button>
<button id="limpar" class="btn red">APAGAR TUDO</button>
</div>
<div id="status" class="status">PRONTO</div>
</div>

<div class="painel">

<button id="recolherCandidatos" class="cabecalho">
<strong>AUTO • 12 CANDIDATOS</strong>
<span id="setaCandidatos" class="seta">+</span>
</button>

<div class="autoCompacto">
<button id="btnAUTO" class="autoQuadrado">AUTO</button>
<div id="autoDescricao" class="autoDescricao">
AGUARDANDO
</div>
</div>

<div id="conteudoCandidatos" class="oculto">

${[
["NORMAL","NORMAL • DÚZIAS FÍSICAS","N",""],
["DINAMICO","DINÂMICO • DÚZIAS FÍSICAS","D","dinamico"],
["RX_NORMAL","RAIO-X NORMAL","RN","raiox"],
["RX_DINAMICO","RAIO-X DINÂMICO","RD","raiox dinamico"]
].map(([motor,nome,prefixo,classe])=>`
<div class="seletorGrupo">
<div class="seletorTitulo">${nome}</div>
<div class="modos">
${RX_LIST.map(rx=>`
<button id="btn${prefixo}${rx}"
class="modo ${classe}">
${prefixo.startsWith("R")?"RX ":""}C${rx}
</button>
`).join("")}
</div>
</div>
`).join("")}

<div id="resumo" class="resumo"></div>

<div class="timelineSecao">
<div class="timelineTituloGrupo">
CONCENTRAÇÃO FÍSICA DAS DÚZIAS
</div>
<div id="duzias" class="duziasLinha"></div>
</div>

</div>
</div>

<div class="painel">

<button id="recolherTimelines" class="cabecalho">
<strong>LINHAS DO TEMPO</strong>
<span id="setaTimelines" class="seta">+</span>
</button>

<div class="timelineSecao">
<div class="timelineTituloGrupo">AUTO</div>
<div id="timelineAUTO" class="timelineRow"></div>
</div>

<div id="conteudoTimelines" class="oculto">

${[
["NORMAL","N"],
["DINÂMICO","D"],
["RAIO-X NORMAL","RN"],
["RAIO-X DINÂMICO","RD"]
].map(([nome,prefixo])=>`
<div class="timelineSecao">
<div class="timelineTituloGrupo">${nome}</div>
${RX_LIST.map(rx=>`
<div id="timeline${prefixo}${rx}"
class="timelineRow"></div>
`).join("")}
</div>
`).join("")}

</div>
</div>

<div class="painel">
<div class="titulo">ÚLTIMAS 14 JOGADAS</div>
<div id="ultimos14" class="duplas14"></div>
</div>

<div class="painel">
<div class="titulo">JOGADA ATUAL</div>
<div id="jogada"></div>
</div>

<div class="painel">
<div class="titulo">TECLADO</div>
<div id="teclado" class="teclado"></div>
</div>

<div class="painel">

<button id="recolherVirtual" class="cabecalho">

<div class="virtualCabecalho">
<div class="virtualAvatar">🤖</div>
<div>
<div class="virtualTitulo">JOGADOR VIRTUAL</div>
<div class="virtualSubtitulo">
AUDITORIA DA ESCOLHA • PRIMEIRA ENTRADA E G1
</div>
</div>
</div>

<span id="setaVirtual" class="seta">−</span>
</button>

<div id="conteudoVirtual">

<div id="virtualStatus" class="virtualStatus wait">
AGUARDANDO RESULTADO
</div>

<div id="virtualTexto" class="virtualTexto">
O jogador virtual vai investigar por que o motor escolhido
recebeu prioridade e quais alternativas teriam acertado.
</div>

<div id="virtualDetalhes" class="virtualDetalhes"></div>

</div>
</div>

</div>
`;

document.body.appendChild(app);

const $=id=>document.getElementById(id);

/*
============================================================
TECLADO
============================================================
*/

for(let n=1;n<=36;n++){

const b=document.createElement("button");

b.className="numero";
b.textContent=n;
b.style.background=corNumero(n);

b.onclick=()=>adicionarNumero(n);

$("teclado").appendChild(b);
}

const zero=document.createElement("button");

zero.className="numero zero";
zero.textContent="0";
zero.style.background=corNumero(0);
zero.onclick=()=>adicionarNumero(0);

$("teclado").appendChild(zero);

/*
============================================================
PAINÉIS
============================================================
*/

function renderPaineis(){

$("conteudoCandidatos").classList.toggle(
"oculto",!estado.painelCandidatosAberto
);

$("conteudoTimelines").classList.toggle(
"oculto",!estado.painelTimelinesAberto
);

$("conteudoVirtual").classList.toggle(
"oculto",!estado.jogadorVirtualAberto
);

$("setaCandidatos").textContent=
estado.painelCandidatosAberto?"−":"+";

$("setaTimelines").textContent=
estado.painelTimelinesAberto?"−":"+";

$("setaVirtual").textContent=
estado.jogadorVirtualAberto?"−":"+";
}

$("recolherCandidatos").onclick=()=>{
estado.painelCandidatosAberto=
!estado.painelCandidatosAberto;
salvar();
renderPaineis();
};

$("recolherTimelines").onclick=()=>{
estado.painelTimelinesAberto=
!estado.painelTimelinesAberto;
salvar();
renderPaineis();
};

$("recolherVirtual").onclick=()=>{
estado.jogadorVirtualAberto=
!estado.jogadorVirtualAberto;
salvar();
renderPaineis();
};

/*
============================================================
SELEÇÃO
============================================================
*/

function selecionar(motor,rx){

if(motor==="AUTO"){
estado.modo="AUTO";
}else{
estado.modo="MANUAL";
estado.motorManual=motor;
estado.manualRX=rx;
}

salvar();
agendarRender();
}

$("btnAUTO").onclick=()=>selecionar("AUTO");

for(const m of MOTORES){
for(const rx of RX_LIST){

$("btn"+PREFIXOS[m]+rx).onclick=
()=>selecionar(m,rx);
}
}

/*
============================================================
ENTRADA DOS NÚMEROS
============================================================
*/

let entradaOcupada=false;

async function adicionarNumero(numero){

if(entradaOcupada)return;

if(!Number.isInteger(numero)||numero<0||numero>36)
return;

entradaOcupada=true;

try{

const resultadoConfigs=await obterConfigs();

if(!resultadoConfigs)return;

const {configs,auto}=resultadoConfigs;

prepararPendentes(configs,auto);

const ativa=configAtiva(configs,auto);

const modoEscolha=estado.modo;

const candidatosAntes=configs;

avaliarPendentes(numero);

if(estado.visualFreeze){

const snap=estado.visualFreeze;

const r=classificar(
numero,
jogadaSnapshot(snap)
);

const ultimo=estado.visual.at(-1);

if(ultimo){
ultimo.g1=numero;
ultimo.green=r.green;
ultimo.fase=r.green?"G1":"LOSS";
}

atualizarDiagnosticoG1(numero,snap);

estado.visualFreeze=null;

}else{

const snap=snapshot(ativa);

const r=snap?
classificar(numero,jogadaSnapshot(snap)):
null;

estado.visual.push({
resultado:numero,
g1:null,
green:r?.green?true:null,
semJogada:!snap,
fase:!snap?"SEM":
r.green?"ENTRADA":"ESPERA_G1"
});

/*
AUDITORIA EXECUTADA COM AS CONFIGURAÇÕES
QUE EXISTIAM ANTES DO RESULTADO.
*/

estado.diagnostico=auditarEscolha(
numero,
ativa,
candidatosAntes,
modoEscolha
);

if(r&&!r.green){
estado.visualFreeze=snap;
}
}

estado.ultimoNumero=numero;

estado.historico.push(numero);
estado.historico=estado.historico.slice(-20);
estado.visual=estado.visual.slice(-14);

invalidarCache();
salvar();

/*
Atualiza primeiro o resultado e o diagnóstico.
A próxima jogada é calculada em seguida.
*/
renderResultadosImediatos();

agendarRender();

}finally{
entradaOcupada=false;
}
}

function reiniciarApontamentos(){

estado.timelines=criarTimelines();
estado.pendentes=criarMapa();
estado.freezes=criarMapa();
estado.visual=[];
estado.visualFreeze=null;
estado.diagnostico=null;
estado.ultimoNumero=null;

invalidarCache();
}

function inserirHistorico(){

const campo=$("entradaHistorico");

const encontrados=campo.value.match(
/\b(?:[0-9]|[12][0-9]|3[0-6])\b/g
);

if(!encontrados)return;

estado.historico=encontrados
.map(Number)
.slice(-20);

reiniciarApontamentos();

campo.value="";
salvar();
agendarRender();
}

function apagarUltimo(){

if(!estado.historico.length)return;

estado.historico.pop();
reiniciarApontamentos();
salvar();
agendarRender();
}

function apagarTudo(){

if(!confirm("Apagar todo o histórico?"))return;

estado.historico=[];
reiniciarApontamentos();
salvar();
agendarRender();
}

$("inserir").onclick=inserirHistorico;
$("apagar").onclick=apagarUltimo;
$("limpar").onclick=apagarTudo;

/*
============================================================
RENDER TIMELINE
============================================================
*/

function renderTimeline(id,nome,lista){

const itens=(lista||[]).slice(-20);

const validos=itens.filter(x=>
!x.semJogada&&
!x.aguardandoG1&&
typeof x.green==="boolean"
);

const taxa=validos.length?
validos.filter(x=>x.green).length/
validos.length*100:null;

const html=itens.map(item=>{

if(item.semJogada)
return '<span class="gl sem">—</span>';

if(item.aguardandoG1)
return '<span class="gl wait">…</span>';

if(item.green&&item.fase==="G1")
return '<span class="gl g1">G1</span>';

if(item.green)
return '<span class="gl green">G</span>';

return '<span class="gl loss">L</span>';

}).join("");

$(id).innerHTML=`
<div class="nomeTL">${nome}</div>
<div class="timeline">${html}</div>
<div class="taxaTL">
${taxa===null?"—":taxa.toFixed(0)+"%"}
</div>
`;
}

/*
============================================================
JOGADA HORIZONTAL
============================================================
*/

function renderJogada(config,congelada){

const area=$("jogada");

if(!config?.valido||!config.jogada?.valido){

area.innerHTML=`
<div class="jogadaStatus">
AGUARDANDO JOGADA VÁLIDA
</div>
`;

return;
}

const blocos=[
...config.jogada.blocos2.map(b=>({...b,um:false})),
...config.jogada.blocos1.map(b=>({...b,um:true}))
];

blocos.sort((a,b)=>{

const ra=ORDEM_REGIOES.indexOf(regiao(a.centro));
const rb=ORDEM_REGIOES.indexOf(regiao(b.centro));

return ra-rb||pos(a.centro)-pos(b.centro);
});

area.innerHTML=`
<div class="jogadaStatus ${congelada?"congelada":""}">
${congelada?"G1 • JOGADA CONGELADA":"JOGADA ATUAL"}
• ${nomeMotor(config.motor)}
• C${config.rx}
• ${config.rx-3}ª DÚZIA
</div>

<div class="jogadaHorizontal">

${blocos.map(b=>`
<div class="alvoQuadrado
${b.um?"um":""}
${congelada?"congelado":""}"
title="${b.um?"1 vizinho":"2 vizinhos"}">
${b.centro}
</div>
`).join("")}

</div>

<div class="legendaJogada">
<span>
<span class="legendaCor azul"></span>
2 VIZINHOS
</span>
<span>
<span class="legendaCor amarelo"></span>
1 VIZINHO
</span>
<span>28 NÚMEROS COBERTOS</span>
</div>
`;
}

/*
============================================================
ÚLTIMOS 14
============================================================
*/

function renderUltimos(){

$("ultimos14").innerHTML=
estado.visual.slice(-14).map(item=>{

const classe=
item.semJogada?"sem":
item.fase==="ESPERA_G1"?"wait":
item.fase==="G1"?"g1":
item.green?"green":"loss";

const textos={
sem:"—",
wait:"…",
g1:"G1",
green:"G",
loss:"L"
};

return `
<div class="dupla14 ${classe}">

<div class="bolaDupla"
style="background:${corNumero(item.resultado)}">
${item.resultado}
</div>

<div class="resultadoEntrada ${classe}">
${textos[classe]}
${item.g1==null?"":" • "+item.g1}
</div>

</div>
`;
}).join("");
}

/*
============================================================
JOGADOR VIRTUAL
============================================================
*/

function renderVirtual(){

const d=estado.diagnostico;

const status=$("virtualStatus");
const texto=$("virtualTexto");
const detalhes=$("virtualDetalhes");

if(!d){

status.className="virtualStatus wait";
status.textContent="AGUARDANDO RESULTADO";

texto.textContent=
"Após o próximo número, vou auditar a escolha feita antes do sorteio e comparar os 12 motores.";

detalhes.innerHTML="";
return;
}

const acertou=
d.tipo==="ACERTO"||
d.greenG1===true;

const aguardando=d.tipo==="SEM_JOGADA";

status.className="virtualStatus "+
(aguardando?"wait":acertou?"green":"loss");

status.textContent=d.titulo;
texto.textContent=d.texto;

detalhes.replaceChildren();

for(const item of d.detalhes||[]){

const div=document.createElement("div");

div.className="virtualDetalhe";
div.textContent=item;

detalhes.appendChild(div);
}
}

/*
============================================================
RENDER IMEDIATO
============================================================
*/

function renderResultadosImediatos(){

renderUltimos();
renderVirtual();

renderTimeline(
"timelineAUTO",
"AUTO",
estado.timelines.AUTO
);

if(estado.painelTimelinesAberto){

for(const m of MOTORES){
for(const rx of RX_LIST){

renderTimeline(
"timeline"+PREFIXOS[m]+rx,
m.startsWith("RX")?"RX C"+rx:"C"+rx,
estado.timelines[m][rx]
);
}
}
}
}

/*
============================================================
RENDER COMPLETO
============================================================
*/

let renderSolicitado=false;
let renderEmExecucao=false;

function agendarRender(){

renderSolicitado=true;

if(renderEmExecucao)return;

setTimeout(executarRender,0);
}

async function executarRender(){

if(renderEmExecucao)return;

renderEmExecucao=true;

try{

while(renderSolicitado){

renderSolicitado=false;

$("status").textContent=
estado.historico.length+
"/20 • CALCULANDO 12 MOTORES...";

const resultado=await obterConfigs();

if(!resultado)continue;

if(renderSolicitado)continue;

render(resultado);
}

}finally{
renderEmExecucao=false;
}
}

function render(resultado){

const {configs,auto,analise}=resultado;

prepararPendentes(configs,auto);

const ativa=configAtiva(configs,auto);

for(const m of MOTORES){
for(const rx of RX_LIST){

$("btn"+PREFIXOS[m]+rx)
.classList.remove("ativo");
}
}

$("btnAUTO").style.background=
estado.modo==="AUTO"?"#007d98":"#303744";

$("btnAUTO").style.borderColor=
estado.modo==="AUTO"?"#00e5ff":"#555c6b";

if(estado.modo==="MANUAL"){

$("btn"+PREFIXOS[estado.motorManual]+estado.manualRX)
.classList.add("ativo");
}

$("autoDescricao").textContent=auto?
nomeConfig(auto)+" • "+auto.alvoDuzia+"ª DÚZIA":
"AGUARDANDO JOGADAS";

const live=estatisticas(estado.timelines.AUTO);

$("resumo").innerHTML=[
["REAL 5",live.total?live.taxa5:null],
["REAL 10",live.total?live.taxa10:null],
["REAL 20",live.total?live.taxa20:null],
["PERDAS",live.perdas]
].map(([nome,valor])=>`
<div class="card">
<small>${nome}</small>
<strong>
${valor===null?"—":
nome==="PERDAS"?valor:valor.toFixed(0)+"%"}
</strong>
</div>
`).join("");

$("duzias").innerHTML=
analise.ranking.map((item,i)=>`
<div class="duziaCard ${i===0?"forte":""}">
<small>${item.duzia}ª DÚZIA</small>
<strong>${(item.intensidade*100).toFixed(0)}%</strong>
<span>
${item.contagem}/20 • QUEBRA
${item.quebra.toFixed(1)}
</span>
</div>
`).join("");

renderTimeline(
"timelineAUTO","AUTO",estado.timelines.AUTO
);

if(estado.painelTimelinesAberto){

for(const m of MOTORES){
for(const rx of RX_LIST){

renderTimeline(
"timeline"+PREFIXOS[m]+rx,
m.startsWith("RX")?"RX C"+rx:"C"+rx,
estado.timelines[m][rx]
);
}
}
}

const freeze=estado.modo==="AUTO"?
estado.freezes.AUTO:
estado.freezes[estado.motorManual][estado.manualRX];

let exibida=ativa;

if(freeze){

exibida={
valido:true,
motor:freeze.motor,
rx:freeze.rx,
jogada:jogadaSnapshot(freeze)
};
}

renderJogada(exibida,!!freeze);

renderUltimos();
renderVirtual();

const validos=[];

for(const m of MOTORES){
for(const rx of RX_LIST){

if(configs[m][rx]?.valido)
validos.push(configs[m][rx]);
}
}

const diferentes=new Set(
validos.map(x=>x.assinatura)
).size;

$("status").textContent=
estado.historico.length+
"/20 • 12 MOTORES • "+
validos.length+
"/12 VÁLIDOS • "+
diferentes+
" JOGADAS DIFERENTES • 28 NÚMEROS • "+
"SEM SOBREPOSIÇÃO • CONCENTRAÇÃO "+
analise.ranking[0].duzia+
"ª DÚZIA"+
(freeze?" • G1 CONGELADO":"");

renderPaineis();
salvar();
}

/*
============================================================
INICIALIZAÇÃO
============================================================
*/

renderPaineis();
renderResultadosImediatos();
agendarRender();

})();
