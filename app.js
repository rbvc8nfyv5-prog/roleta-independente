(function(){
"use strict";

/* ============================================================
   ANALISADOR 0 • 6 • 9
   RAIO X + MOMENTO 14 + MEMÓRIA ADAPTATIVA

   PRESERVADO:
   - Motor RX 4 / 5 / 6
   - AUTO
   - Momento 14
   - Terminais
   - Cores
   - Zonas
   - Corredores
   - Densidade
   - Concentração física das dúzias
   - 5 blocos de 2 vizinhos + 1 bloco de 1 vizinho
   - 28 números cobertos
   - G1 congelado
   - Histórico operacional limitado a 35
   - Ordem visual:
     TIERS → ORPHELINS → VOISINS → ZERO

   NOVO:
   - Pode colar qualquer quantidade de números.
   - TODO o histórico colado é percorrido cronologicamente.
   - O sistema cria memória interna walk-forward.
   - A memória aprende GREEN, G1 e LOSS.
   - Aprende FORA1/FORA2/FORA, lado e deslocamento.
   - Reconhece contextos semelhantes.
   - Memória recente pesa mais.
   - Só os últimos 35 ficam no motor operacional.
   - Cada novo número continua alimentando a memória.
   - BT10 / BT20 / REAL10 / REAL20 removidos da tela.

   IMPORTANTE:
   A memória adaptativa altera apenas a pontuação dos candidatos.
   A estrutura original do motor e a cobertura de 28 números
   permanecem preservadas.
============================================================ */

const STORAGE_KEY="ANALISADOR_069_IDS_CORRESPONDENTES_V1";
const STORAGE_ENGINE="ANALISADOR_069_ENGINE_COMPLETO_V10";
const STORAGE_DUPLAS="ANALISADOR_069_DUPLAS_VISUAIS_V4";
const STORAGE_FREEZE="ANALISADOR_069_JOGADA_CONGELADA_V1";
const STORAGE_MEMORIA="ANALISADOR_069_MEMORIA_ADAPTATIVA_V1";

const MAX_HISTORICO=35;
const JANELA_MOMENTO=14;
const MAX_TIMELINE=300;
const MAX_MEMORIA=1200;

const RX_LIST=[4,5,6];
const MAX_REPLICAS=40;

const PESO_MOMENTO=.34;
const PESO_DUZIA_FISICA=.16;
const MAX_GIRADA=2;

/*
   A memória nunca domina sozinha a jogada.
   Ela funciona como correção da pontuação original.
*/
const PESO_MEMORIA=.22;
const MIN_SIM_MEMORIA=.58;
const MAX_CENARIOS_USADOS=24;


/* ============================================================
   ROLETA
============================================================ */

const track=[
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

const vermelhos=new Set([
1,3,5,7,9,12,14,16,18,
19,21,23,25,27,30,32,34,36
]);

const regioes={
ZERO:new Set([0,32,15,26,3,35,12]),
VOISINS:new Set([19,4,21,2,25,28,7,29,18,22]),
ORPHELINS:new Set([9,31,14,20,1,17,6,34]),
TIERS:new Set([27,13,36,11,30,8,23,10,5,24,16,33])
};

const ORDEM_REGIOES={
TIERS:0,
ORPHELINS:1,
VOISINS:2,
ZERO:3
};


/* ============================================================
   DÚZIAS
============================================================ */

function duzia(n){
if(n>=1&&n<=12)return 1;
if(n>=13&&n<=24)return 2;
if(n>=25&&n<=36)return 3;
return 0;
}

const MAPA_DUZIA_FISICA={
1:new Map([
[3,1],[12,1],[7,.95],[4,.92],[2,.92],[11,.82],
[8,.86],[5,.86],[6,.40],[1,.36],[9,.36],[10,.58]
]),
2:new Map([
[15,1],[19,1],[21,.98],[17,.70],[13,.72],[23,.96],
[24,.94],[16,.94],[14,.88],[20,.88],[18,.92]
]),
3:new Map([
[29,1],[30,1],[32,.96],[25,.94],[27,.88],[28,.92],
[26,.80],[35,.72],[36,.68],[34,.64],[33,.42],[31,.40]
])
};


/* ============================================================
   IDS
============================================================ */

const BASES=[0,10,20,30,6,16,26,36,9,19,29];
const TODOS_IDS=[0,10,20,30,6,16,26,36,9,19,29,39];

const ESPECIAIS={
25:[39],
17:[9],
2:[9]
};


/* ============================================================
   UTILIDADES
============================================================ */

function limitar35(base){
return Array.isArray(base)?base.slice(-35):[];
}

function indice(n){
return track.indexOf(n);
}

function numeroOffset(c,o){
const i=indice(c);
return i<0?c:track[(i+o+37)%37];
}

function setor(c,q){
const i=indice(c);
if(i<0)return[];
const r=[];
for(let d=-q;d<=q;d++)r.push(track[(i+d+37)%37]);
return r;
}

function vizinhos(n,q=1){
return setor(n,q);
}

function distanciaRoda(a,b){
const ia=indice(a),ib=indice(b);
if(ia<0||ib<0)return 99;
const d=Math.abs(ia-ib);
return Math.min(d,37-d);
}

function deltaRoda(c,n){
const a=indice(c),b=indice(n);
if(a<0||b<0)return 0;
let d=(b-a+37)%37;
if(d>18)d-=37;
return d;
}

function terminal(n){return n%10}
function terminalAnterior(t){return(t+9)%10}
function terminalSeguinte(t){return(t+1)%10}

function regiao(n){
if(regioes.ZERO.has(n))return"ZERO";
if(regioes.VOISINS.has(n))return"VOISINS";
if(regioes.ORPHELINS.has(n))return"ORPHELINS";
if(regioes.TIERS.has(n))return"TIERS";
return null;
}

function tipoCor(n){
if(n===0)return"VERDE";
return vermelhos.has(n)?"VERMELHO":"PRETO";
}

function corRoleta(n){
if(n===0)return"#087c48";
return vermelhos.has(n)?"#c6283d":"#181818";
}

function ordenarBlocosVisual(blocos){
return blocos.slice().sort((a,b)=>{
const ra=regiao(a.centro),rb=regiao(b.centro);
return(ORDEM_REGIOES[ra]??99)-(ORDEM_REGIOES[rb]??99);
});
}


/* ============================================================
   IDS / EVENTOS
============================================================ */

const coberturaIds={};

BASES.forEach(b=>{
coberturaIds[b]=new Set(vizinhos(b,1));
});

function familia(id){
if([0,10,20,30].includes(id))return 0;
if([6,16,26,36].includes(id))return 6;
if([9,19,29,39].includes(id))return 9;
return null;
}

function idsQueBatem(numero){
const ids=[];
BASES.forEach(b=>{
if(coberturaIds[b].has(numero))ids.push(b);
});
if(Object.prototype.hasOwnProperty.call(ESPECIAIS,numero)){
ESPECIAIS[numero].forEach(id=>{
if(!ids.includes(id))ids.push(id);
});
}
return ids;
}

function eventoNumero(numero){
const fs=new Set(
idsQueBatem(numero).map(familia).filter(x=>x!==null)
);
return(fs.has(0)?1:0)|(fs.has(6)?2:0)|(fs.has(9)?4:0);
}


/* ============================================================
   STORAGE
============================================================ */

function lerJSON(chave,padrao){
try{
const x=localStorage.getItem(chave);
return x?JSON.parse(x):padrao;
}catch(e){return padrao}
}

function gravarJSON(chave,valor){
try{localStorage.setItem(chave,JSON.stringify(valor))}catch(e){}
}

function carregarHistorico(){
const arr=lerJSON(STORAGE_KEY,[]);
if(!Array.isArray(arr))return[];
return limitar35(
arr.map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<=36)
);
}

let historico=carregarHistorico();

let estado={
modo:"AUTO",
manualRX:6,
pendentes:{AUTO:null,4:null,5:null,6:null},
timelines:{AUTO:[],4:[],5:[],6:[]}
};

(function carregarEstado(){
const x=lerJSON(STORAGE_ENGINE,null);
if(!x)return;

if(x.modo==="AUTO"||x.modo==="MANUAL")estado.modo=x.modo;
if(RX_LIST.includes(x.manualRX))estado.manualRX=x.manualRX;

if(x.timelines){
["AUTO",4,5,6].forEach(k=>{
if(Array.isArray(x.timelines[k]))
estado.timelines[k]=x.timelines[k].slice(-MAX_TIMELINE);
});
}

if(x.pendentes)
estado.pendentes=Object.assign(estado.pendentes,x.pendentes);
})();

function salvarHistorico(){
historico=limitar35(historico);
gravarJSON(STORAGE_KEY,historico);
}

function salvarEstado(){
gravarJSON(STORAGE_ENGINE,estado);
}


/* ============================================================
   MEMÓRIA ADAPTATIVA
============================================================ */

let memoriaAdaptativa=[];

(function carregarMemoria(){
const x=lerJSON(STORAGE_MEMORIA,[]);
if(Array.isArray(x))
memoriaAdaptativa=x.slice(-MAX_MEMORIA);
})();

function salvarMemoria(){
memoriaAdaptativa=memoriaAdaptativa.slice(-MAX_MEMORIA);
gravarJSON(STORAGE_MEMORIA,memoriaAdaptativa);
}

function limparMemoria(){
memoriaAdaptativa=[];
salvarMemoria();
}

/*
   Cria uma fotografia numérica do momento ANTES do resultado.
   Não contém informação futura.
*/
function vetorContexto(base,momento,rx,diag){

const janela=limitar35(base).slice(-14);

const zonas=["ZERO","VOISINS","ORPHELINS","TIERS"];

const zonaFreq=zonas.map(z=>
janela.length
?momento.zonas.contagem[z]/janela.length
:0
);

const cores=[
momento.cores.contagem.VERMELHO,
momento.cores.contagem.PRETO,
momento.cores.contagem.VERDE
].map(v=>janela.length?v/janela.length:0);

const duzias=[1,2,3].map(d=>
janela.length
?momento.duziasFisicas.contagem[d]/janela.length
:0
);

const trio=momento.terminais.trio||[];

const corredor=momento.corredores.principal;

return[
rx/6,
Math.min(1,(diag?.seq||0)/4),
diag?.lado===-1?1:0,
diag?.lado===1?1:0,

...zonaFreq,
...cores,
...duzias,

momento.cores.pctAlternancia/100,
momento.zonas.pctAlternancia/100,

(trio[0]??0)/9,
(trio[1]??0)/9,
(trio[2]??0)/9,

corredor?indice(corredor.centro)/36:0,
corredor?corredor.taxa/100:0,

momento.duziasFisicas.dominante
?momento.duziasFisicas.dominante.duzia/3
:0
];

}

function similaridadeContexto(a,b){

if(!a||!b||a.length!==b.length)return 0;

let erro=0;

for(let i=0;i<a.length;i++)
erro+=Math.abs(a[i]-b[i]);

return Math.max(0,1-erro/a.length);

}

function resumoJogadaMemoria(jogada){

if(!jogada||!jogada.valido)return null;

return{
centros2:jogada.blocos2.map(x=>x.centro),
centro1:jogada.blocos1[0]?.centro??null
};

}

function numerosResumoJogada(j){

if(!j)return new Set();

const s=new Set();

(j.centros2||[]).forEach(c=>{
setor(c,2).forEach(n=>s.add(n));
});

if(j.centro1!==null&&j.centro1!==undefined)
setor(j.centro1,1).forEach(n=>s.add(n));

return s;
}

function registrarMemoria(registro){

if(!registro)return;

registro.ordem=Date.now()+memoriaAdaptativa.length/10000;

memoriaAdaptativa.push(registro);

if(memoriaAdaptativa.length>MAX_MEMORIA)
memoriaAdaptativa=memoriaAdaptativa.slice(-MAX_MEMORIA);

}

/*
   Analisa cenários antigos parecidos com o cenário atual.

   Não pergunta apenas "deu GREEN ou LOSS".
   Também observa onde o resultado apareceu fisicamente.

   Isso permite favorecer deslocamentos que historicamente
   responderam melhor em contextos semelhantes.
*/
function consultarMemoria(contexto){

if(!contexto||memoriaAdaptativa.length<4){

return{
ativo:false,
amostras:0,
confianca:0,
mapa:new Map(),
lado:0,
taxaLoss:0
};

}

const semelhantes=[];

for(let i=0;i<memoriaAdaptativa.length;i++){

const m=memoriaAdaptativa[i];

if(!m.contexto)continue;

const sim=similaridadeContexto(contexto,m.contexto);

if(sim<MIN_SIM_MEMORIA)continue;

/*
   Esquecimento gradual:
   memória recente pesa mais.
*/
const idade=memoriaAdaptativa.length-i;

const recencia=Math.max(
.35,
1-idade/Math.max(60,memoriaAdaptativa.length*1.35)
);

semelhantes.push({
m,
sim,
peso:sim*recencia
});

}

semelhantes.sort((a,b)=>b.peso-a.peso);

const usados=semelhantes.slice(0,MAX_CENARIOS_USADOS);

if( usados.length<3 ){

return{
ativo:false,
amostras:usados.length,
confianca:0,
mapa:new Map(),
lado:0,
taxaLoss:0
};

}

const mapa=new Map();
track.forEach(n=>mapa.set(n,0));

let pesoTotal=0;
let perdas=0;
let esquerda=0;
let direita=0;

usados.forEach(({m,peso})=>{

pesoTotal+=peso;

if(m.resultadoFinal==="LOSS")
perdas+=peso;

/*
   Resultado real recebe calor.
   Casas próximas recebem calor menor.
*/
track.forEach(n=>{

const d=distanciaRoda(n,m.numero);

let local=0;

if(d===0)local=1;
else if(d===1)local=.72;
else if(d===2)local=.44;
else if(d===3)local=.22;
else if(d===4)local=.09;

if(local)
mapa.set(n,(mapa.get(n)||0)+local*peso);

});

if(m.lado<0)esquerda+=peso;
if(m.lado>0)direita+=peso;

});

/*
   Normalização.
*/
let max=0;
mapa.forEach(v=>{if(v>max)max=v});

if(max){
mapa.forEach((v,k)=>mapa.set(k,v/max));
}

const taxaLoss=pesoTotal?perdas/pesoTotal:0;

const lado=
direita>esquerda*1.15
?1
:(esquerda>direita*1.15?-1:0);

const confianca=
Math.min(
1,
usados.length/12
)*
Math.min(
1,
usados.reduce((s,x)=>s+x.sim,0)/usados.length
);

return{
ativo:true,
amostras:usados.length,
confianca,
mapa,
lado,
taxaLoss
};

}

function scoreMemoriaSetor(centro,qtd,consulta){

if(!consulta||!consulta.ativo)return 0;

const nums=setor(centro,qtd);

let soma=0;

nums.forEach(n=>{

const d=distanciaRoda(centro,n);

let peso=1;

if(d===0)peso=1.18;
else if(d===1)peso=1.08;

soma+=(consulta.mapa.get(n)||0)*peso;

});

return(soma/nums.length)*consulta.confianca;

}


/* ============================================================
   ENTRADAS VISUAIS
============================================================ */

let duplasVisual=[];

function avaliacoesVazias(){
return{AUTO:null,4:null,5:null,6:null};
}

function snapshotsVazios(){
return{AUTO:null,4:null,5:null,6:null};
}

function copiarSnapshotVisual(p){
if(!p)return null;
return{
assinatura:p.assinatura,
rx:p.rx,
centros2:Array.isArray(p.centros2)?p.centros2.slice():[],
centro1:p.centro1!==undefined?p.centro1:null
};
}

function capturarSnapshotsPendentes(){
const r=snapshotsVazios();
["AUTO",4,5,6].forEach(k=>{
r[k]=copiarSnapshotVisual(estado.pendentes[k]);
});
return r;
}

function normalizarDuplaVisual(d){
return{
resultado:d.resultado!==undefined?d.resultado:null,
g1:d.g1!==undefined?d.g1:null,
avaliacoes:Object.assign(avaliacoesVazias(),d.avaliacoes||{}),
avaliacoesG1:Object.assign(avaliacoesVazias(),d.avaliacoesG1||{}),
snapshotEntrada:Object.assign(snapshotsVazios(),d.snapshotEntrada||{}),
fase:d.fase||"FINALIZADO"
};
}

(function carregarDuplas(){
const x=lerJSON(STORAGE_DUPLAS,[]);
if(Array.isArray(x))
duplasVisual=x.map(normalizarDuplaVisual).slice(-14);
})();

function salvarDuplasVisual(){
duplasVisual=duplasVisual.map(normalizarDuplaVisual).slice(-14);
gravarJSON(STORAGE_DUPLAS,duplasVisual);
}


/* ============================================================
   JOGADA CONGELADA
============================================================ */

let jogadaCongelada=null;

(function carregarFreeze(){
const x=lerJSON(STORAGE_FREEZE,null);
if(x&&x.valido&&x.jogada)jogadaCongelada=x;
})();

function salvarJogadaCongelada(){
gravarJSON(STORAGE_FREEZE,jogadaCongelada);
}

function copiarJogadaCongelada(config){

if(!config||!config.valido||!config.jogada||!config.jogada.valido)
return null;

return{
valido:true,
rx:config.rx,
jogada:{
valido:true,
blocos2:config.jogada.blocos2.map(b=>({
centro:b.centro,
qtd:2,
numeros:b.numeros.slice()
})),
blocos1:config.jogada.blocos1.map(b=>({
centro:b.centro,
qtd:1,
numeros:b.numeros.slice()
}))
}
};

}


/* ============================================================
   TERMINAIS
============================================================ */

function analisarTerminais(base){

const janela=limitar35(base).slice(-14);
const ranking=[];

for(let t=0;t<=9;t++){

let direto=0,vizinho=0,direto5=0,vizinho5=0,score=0;

janela.forEach((n,i)=>{

const tn=terminal(n);
const recencia=.50+((i+1)/Math.max(1,janela.length))*.50;

if(tn===t){

direto++;
score+=2.20*recencia;

if(i>=janela.length-5){
direto5++;
score+=.95;
}

}else if(tn===terminalAnterior(t)||tn===terminalSeguinte(t)){

vizinho++;
score+=.62*recencia;

if(i>=janela.length-5){
vizinho5++;
score+=.20;
}

}

});

ranking.push({terminal:t,direto,vizinho,direto5,vizinho5,score});

}

ranking.sort((a,b)=>
b.score-a.score||
b.direto5-a.direto5||
b.direto-a.direto||
b.vizinho-a.vizinho
);

const trio=ranking.slice(0,3).map(x=>x.terminal);

let cobertura=0;

janela.forEach(n=>{
const t=terminal(n);

if(trio.includes(t)){
cobertura++;
return;
}

if(trio.some(c=>t===terminalAnterior(c)||t===terminalSeguinte(c)))
cobertura++;
});

return{
ranking,
trio,
taxa:janela.length?cobertura/janela.length*100:0
};

}

function scoreTerminalNumero(numero,momento){

const trio=momento.terminais.trio;
if(!trio.length)return 0;

const t=terminal(numero);

if(t===trio[0])return 1;
if(t===trio[1])return .88;
if(t===trio[2])return .78;

if(t===terminalAnterior(trio[0])||t===terminalSeguinte(trio[0]))return .46;
if(t===terminalAnterior(trio[1])||t===terminalSeguinte(trio[1]))return .40;
if(t===terminalAnterior(trio[2])||t===terminalSeguinte(trio[2]))return .34;

return 0;
}


/* ============================================================
   CORES
============================================================ */

function analisarCores(base){

const janela=limitar35(base).slice(-14);

const contagem={
VERMELHO:0,
PRETO:0,
VERDE:0
};

janela.forEach(n=>contagem[tipoCor(n)]++);

let alternancias=0;

for(let i=1;i<janela.length;i++)
if(tipoCor(janela[i])!==tipoCor(janela[i-1]))alternancias++;

return{
contagem,
ultima:janela.length?tipoCor(janela[janela.length-1]):null,
pctAlternancia:janela.length>1
?alternancias/(janela.length-1)*100
:0
};

}

function scoreCorNumero(numero,momento){

const info=momento.cores;
const total=Math.max(1,momento.janela.length);
const cor=tipoCor(numero);

let score=info.contagem[cor]/total;

if(info.pctAlternancia>=60&&info.ultima){

if(info.ultima==="VERMELHO"&&cor==="PRETO")score+=.18;
else if(info.ultima==="PRETO"&&cor==="VERMELHO")score+=.18;

}

return score;
}


/* ============================================================
   ZONAS
============================================================ */

function analisarZonas(base){

const janela=limitar35(base).slice(-14);
const seq=janela.map(regiao);

const contagem={
ZERO:0,
VOISINS:0,
ORPHELINS:0,
TIERS:0
};

seq.forEach(z=>{if(z)contagem[z]++});

const transicoes={};

Object.keys(contagem).forEach(a=>{
transicoes[a]={};
Object.keys(contagem).forEach(b=>transicoes[a][b]=0);
});

let alternancias=0;

for(let i=1;i<seq.length;i++){

if(seq[i]!==seq[i-1])alternancias++;

if(seq[i-1]&&seq[i])
transicoes[seq[i-1]][seq[i]]++;

}

const atual=seq.length?seq[seq.length-1]:null;

let repeticaoAtual=0;

if(atual){
for(let i=seq.length-1;i>=0;i--){
if(seq[i]===atual)repeticaoAtual++;
else break;
}
}

return{
contagem,
transicoes,
atual,
repeticaoAtual,
pctAlternancia:seq.length>1
?alternancias/(seq.length-1)*100
:0
};

}

function scoreZonaNumero(numero,momento){

const info=momento.zonas;
const z=regiao(numero);

if(!z)return 0;

const total=Math.max(1,momento.janela.length);

let score=info.contagem[z]/total;

if(info.atual){

const linha=info.transicoes[info.atual];
const soma=Object.values(linha).reduce((a,b)=>a+b,0);

if(soma)score+=((linha[z]||0)/soma)*.45;

}

if(z===info.atual&&info.repeticaoAtual>=2)score+=.10;

return score;
}


/* ============================================================
   DÚZIAS FÍSICAS
============================================================ */

function analisarDuziasFisicas(base){

const janela=limitar35(base).slice(-14);

const forca={1:0,2:0,3:0};
const contagem={1:0,2:0,3:0};
const calor=new Map();

track.forEach(n=>calor.set(n,0));

janela.forEach((numero,i)=>{

const d=duzia(numero);
if(d)contagem[d]++;

const recencia=.45+((i+1)/Math.max(1,janela.length))*.55;

if(d){

const mapa=MAPA_DUZIA_FISICA[d];

const estrutural=
mapa&&mapa.has(numero)
?mapa.get(numero)
:.55;

forca[d]+=recencia*(.55+.45*estrutural);

}

track.forEach(alvo=>{

const dist=distanciaRoda(numero,alvo);

let peso=0;

if(dist===0)peso=1;
else if(dist===1)peso=.72;
else if(dist===2)peso=.46;
else if(dist===3)peso=.26;
else if(dist===4)peso=.12;
else if(dist===5)peso=.05;

if(peso)
calor.set(alvo,(calor.get(alvo)||0)+peso*recencia);

});

});

const confluencia={1:0,2:0,3:0};

[1,2,3].forEach(d=>{

const mapa=MAPA_DUZIA_FISICA[d];

let soma=0,pesoTotal=0;

mapa.forEach((peso,numero)=>{
soma+=(calor.get(numero)||0)*peso;
pesoTotal+=peso;
});

confluencia[d]=pesoTotal?soma/pesoTotal:0;

});

const maxForca=Math.max(forca[1],forca[2],forca[3],.0001);
const maxConfluencia=Math.max(confluencia[1],confluencia[2],confluencia[3],.0001);

const ranking=[1,2,3].map(d=>{

const frequencia=janela.length?contagem[d]/janela.length:0;
const momento=forca[d]/maxForca;
const fisica=confluencia[d]/maxConfluencia;

return{
duzia:d,
contagem:contagem[d],
frequencia,
momento,
fisica,
score:frequencia*.35+fisica*.45+momento*.20
};

}).sort((a,b)=>b.score-a.score);

return{
janela,
calor,
forca,
contagem,
confluencia,
ranking,
dominante:ranking[0]||null,
segunda:ranking[1]||null
};

}

function scoreDuziaFisicaNumero(numero,momento){

const analise=momento.duziasFisicas;
if(!analise)return 0;

const d=duzia(numero);
if(!d)return 0;

const item=analise.ranking.find(x=>x.duzia===d);
if(!item)return 0;

const mapa=MAPA_DUZIA_FISICA[d];

const estrutural=
mapa&&mapa.has(numero)
?mapa.get(numero)
:.48;

const calorAtual=analise.calor.get(numero)||0;

let maxCalor=0;
analise.calor.forEach(v=>{if(v>maxCalor)maxCalor=v});

const calorNorm=maxCalor?calorAtual/maxCalor:0;

let proximidade=0;

mapa.forEach((peso,alvo)=>{

const dist=distanciaRoda(numero,alvo);

let p=0;

if(dist===0)p=1;
else if(dist===1)p=.78;
else if(dist===2)p=.52;
else if(dist===3)p=.28;
else if(dist===4)p=.12;

p*=peso;

if(p>proximidade)proximidade=p;

});

return(
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

const janela=limitar35(base).slice(-14);
const ranking=[];

track.forEach(centro=>{

let dentro=0,miolo=0,lateral=0,ponta=0;
let esquerda=0,direita=0,score=0;

janela.forEach((numero,i)=>{

const delta=deltaRoda(centro,numero);
const d=Math.abs(delta);

if(d>5)return;

dentro++;

const recencia=.50+((i+1)/Math.max(1,janela.length))*.50;

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

if(delta<0)esquerda++;
else if(delta>0)direita++;

});

let perfil="MIOLO";

if(ponta>miolo&&ponta>=lateral)perfil="PONTA";
else if(lateral>miolo)perfil="LATERAL";

let direcao=0;

if(direita>esquerda+1)direcao=1;
else if(esquerda>direita+1)direcao=-1;

ranking.push({
centro,dentro,
taxa:janela.length?dentro/janela.length*100:0,
miolo,lateral,ponta,
esquerda,direita,direcao,perfil,score
});

});

ranking.sort((a,b)=>b.score-a.score||b.dentro-a.dentro);

return{
ranking,
fortes:ranking.slice(0,5),
principal:ranking[0]||null
};

}

function scoreCorredorNumero(numero,momento){

const fortes=momento.corredores.fortes;
if(!fortes.length)return 0;

let score=0;

fortes.forEach((c,pos)=>{

const delta=deltaRoda(c.centro,numero);
const d=Math.abs(delta);

if(d>5)return;

const rankingPeso=[1,.78,.60,.46,.34][pos];
const confianca=c.taxa/100;

let local=0;

if(c.perfil==="PONTA"){

if(d>=4)local=1;
else if(d===3)local=.72;
else if(d===2)local=.50;
else local=.34;

}else if(c.perfil==="LATERAL"){

if(d===2||d===3)local=1;
else if(d===4)local=.70;
else if(d===1)local=.62;
else local=.45;

}else{

if(d<=1)local=1;
else if(d===2)local=.72;
else if(d===3)local=.48;
else local=.28;

}

if(c.direcao!==0&&Math.sign(delta)===c.direcao)local*=1.08;

score+=rankingPeso*confianca*local;

});

return score;
}


/* ============================================================
   DENSIDADE
============================================================ */

function analisarDensidade(base){

const janela=limitar35(base).slice(-14);
const mapa=new Map();

track.forEach(n=>mapa.set(n,0));

janela.forEach((numero,i)=>{

const recencia=.50+((i+1)/Math.max(1,janela.length))*.50;

track.forEach(alvo=>{

const d=distanciaRoda(numero,alvo);

let peso=0;

if(d===0)peso=1;
else if(d===1)peso=.68;
else if(d===2)peso=.40;
else if(d===3)peso=.20;
else if(d===4)peso=.08;

if(peso)
mapa.set(alvo,(mapa.get(alvo)||0)+peso*recencia);

});

});

const ranking=track.map(n=>({
numero:n,
score:mapa.get(n)||0
})).sort((a,b)=>b.score-a.score);

return{
mapa,
ranking,
centro:ranking.length?ranking[0].numero:null
};

}


/* ============================================================
   MOMENTO
============================================================ */

function analisarMomento(base){

base=limitar35(base);

return{
janela:base.slice(-14),
terminais:analisarTerminais(base),
cores:analisarCores(base),
zonas:analisarZonas(base),
corredores:analisarCorredores(base),
densidade:analisarDensidade(base),
duziasFisicas:analisarDuziasFisicas(base)
};

}

function scoreMomentoNumero(numero,momento){

const scoreBase=
scoreTerminalNumero(numero,momento)*.31+
scoreCorNumero(numero,momento)*.10+
scoreZonaNumero(numero,momento)*.13+
scoreCorredorNumero(numero,momento)*.30+
(momento.densidade.mapa.get(numero)||0)*.055;

return scoreBase+
scoreDuziaFisicaNumero(numero,momento)*PESO_DUZIA_FISICA;

}

function direcaoMomento(centro,momento){

let esquerda=0,direita=0;

momento.janela.forEach((numero,i)=>{

const delta=deltaRoda(centro,numero);
const d=Math.abs(delta);

if(d>7)return;

const recencia=.55+((i+1)/Math.max(1,momento.janela.length))*.45;
const proximidade=Math.max(0,1-d/8);
const peso=recencia*proximidade;

if(delta<0)esquerda+=peso;
else if(delta>0)direita+=peso;

});

const total=esquerda+direita;

if(!total)return{direcao:0,forca:0};

return{
direcao:direita>esquerda?1:(esquerda>direita?-1:0),
forca:Math.abs(direita-esquerda)/total
};

}


/* ============================================================
   RX
============================================================ */

function construirCache(base){

const eventos=new Uint8Array(base.length);

for(let i=0;i<base.length;i++)
eventos[i]=eventoNumero(base[i]);

return{base,eventos};

}

function similaridadeJanelas(cache,a,b,tamanho){

let iguais=0,erro=0;
let a0=0,a6=0,a9=0,b0=0,b6=0,b9=0;

for(let k=0;k<tamanho;k++){

const ea=cache.eventos[a+k];
const eb=cache.eventos[b+k];

if(ea===eb)iguais++;

if(ea&1)a0++;
if(ea&2)a6++;
if(ea&4)a9++;

if(eb&1)b0++;
if(eb&2)b6++;
if(eb&4)b9++;

erro+=Math.abs(a0-b0)+Math.abs(a6-b6)+Math.abs(a9-b9);

}

const eventos=iguais/tamanho*100;
const forma=Math.max(0,1-erro/(tamanho*tamanho*3))*100;

return eventos*.80+forma*.20;

}

function analisarRX(base,rx){

base=limitar35(base);

if(base.length<rx*2+4)
return{valido:false,rx,replicas:[],rankingIds:[],similaridade:0};

const cache=construirCache(base);
const atualInicio=base.length-rx;
const candidatos=[];

for(let i=0;i+rx<atualInicio;i++){

const proximo=base[i+rx];
if(proximo===undefined)continue;

candidatos.push({
inicio:i,
proximo,
similaridade:similaridadeJanelas(cache,atualInicio,i,rx)
});

}

candidatos.sort((a,b)=>b.similaridade-a.similaridade||b.inicio-a.inicio);

if(!candidatos.length)
return{valido:false,rx,replicas:[],rankingIds:[],similaridade:0};

let qtd=Math.ceil(candidatos.length*.10);

qtd=Math.max(4,qtd);
qtd=Math.min(qtd,MAX_REPLICAS,candidatos.length);

const replicas=candidatos.slice(0,qtd);

const contagem=new Map();
TODOS_IDS.forEach(id=>contagem.set(id,0));

function contar(rep){
idsQueBatem(rep.proximo).forEach(id=>{
contagem.set(id,(contagem.get(id)||0)+1);
});
}

replicas.forEach(contar);

function positivos(){
return TODOS_IDS.filter(id=>(contagem.get(id)||0)>0).length;
}

let pos=qtd;

while(
positivos()<8&&
pos<candidatos.length&&
replicas.length<MAX_REPLICAS
){
const rep=candidatos[pos++];
replicas.push(rep);
contar(rep);
}

const rankingIds=TODOS_IDS.map((id,ordem)=>({
id,
ocorrencias:contagem.get(id)||0,
ordem
}))
.filter(x=>x.ocorrencias>0)
.sort((a,b)=>b.ocorrencias-a.ocorrencias||a.ordem-b.ordem);

return{
valido:true,
rx,
replicas,
rankingIds,
similaridade:replicas.reduce((s,r)=>s+r.similaridade,0)/replicas.length
};

}

function frequenciaReplicas(replicas){

const freq=new Map();
track.forEach(n=>freq.set(n,0));

replicas.forEach(rep=>{
freq.set(rep.proximo,(freq.get(rep.proximo)||0)+1);
});

return freq;

}


/* ============================================================
   LOSS
============================================================ */

function diagnosticarLosses(lista){

if(!Array.isArray(lista))lista=[];

const validos=lista.filter(x=>!x.semJogada);
const losses=[];

for(let i=validos.length-1;i>=0;i--){

if(validos[i].green)break;

losses.unshift(validos[i]);

}

if(!losses.length)
return{ativo:false,seq:0,tipo:"ESTAVEL",lado:0,forca:0};

const recentes=losses.slice(-3);

let fora1=0,esquerda=0,direita=0;

recentes.forEach(x=>{

if(x.tipo==="FORA1")fora1++;

if(x.lado<0)esquerda++;
if(x.lado>0)direita++;

});

let tipo="ISOLADO",forca=.10;

if(losses.length===1&&fora1===1){
tipo="BORDA";
forca=.10;
}else if(fora1>=2&&Math.max(esquerda,direita)>=2){
tipo="BORDA_REPETIDA";
forca=.35;
}else if(losses.length>=2&&Math.max(esquerda,direita)>=2){
tipo="DESLOCAMENTO";
forca=.50;
}else if(losses.length>=3){
tipo="QUEBRA";
forca=.60;
}

return{
ativo:true,
seq:losses.length,
tipo,
lado:direita>esquerda?1:(esquerda>direita?-1:0),
forca
};

}


/* ============================================================
   SCORES
============================================================ */

function scoreRXPuro(centro,qtd,freq){

const numeros=setor(centro,qtd);

let score=0,suporte=0;

numeros.forEach(n=>{

const f=freq.get(n)||0;

suporte+=f;

const d=distanciaRoda(centro,n);

let peso=1;

if(d===0)peso=1.45;
else if(d===1)peso=1.22;

score+=f*peso;

});

return{score,suporte,numeros};

}

function scoreMomentoSetor(centro,qtd,momento){

const numeros=setor(centro,qtd);
let score=0;

numeros.forEach(n=>{

const d=distanciaRoda(centro,n);

let peso=1;

if(d===0)peso=1.20;
else if(d===1)peso=1.08;

score+=scoreMomentoNumero(n,momento)*peso;

});

return score/numeros.length;

}


/* ============================================================
   GIRADA DINÂMICA + MEMÓRIA
============================================================ */

function avaliarCentroComGiradas(
centroOriginal,
qtd,
freq,
momento,
diagnostico,
consultaMemoria=null
){

let melhor=null;

for(let offset=-MAX_GIRADA;offset<=MAX_GIRADA;offset++){

const centro=numeroOffset(centroOriginal,offset);

const rx=scoreRXPuro(centro,qtd,freq);

if(rx.suporte<=0)continue;

const momentoScore=scoreMomentoSetor(centro,qtd,momento);

const custoGirada=
Math.abs(offset)*.15*Math.max(1,rx.suporte);

const direcao=direcaoMomento(centroOriginal,momento);

let bonusDirecao=0;

if(
offset!==0&&
direcao.direcao!==0&&
Math.sign(offset)===direcao.direcao
){
bonusDirecao=direcao.forca*rx.suporte*.18;
}

let bonusLoss=0;

if(
diagnostico&&
diagnostico.ativo&&
diagnostico.lado!==0&&
offset!==0&&
Math.sign(offset)===diagnostico.lado
){
bonusLoss=diagnostico.forca*rx.suporte*.22;
}

/*
   NOVA CAMADA:
   histórico de contextos semelhantes.
*/
const memoriaScore=
scoreMemoriaSetor(
centro,
qtd,
consultaMemoria
);

let bonusMemoria=
memoriaScore*
rx.suporte*
PESO_MEMORIA;

/*
   Quando cenários semelhantes apresentaram muitos losses
   e apontaram repetidamente para um mesmo lado físico,
   a memória dá uma pequena preferência à correção nesse lado.
*/
if(
consultaMemoria?.ativo&&
consultaMemoria.taxaLoss>=.45&&
consultaMemoria.lado!==0&&
offset!==0&&
Math.sign(offset)===consultaMemoria.lado
){
bonusMemoria+=
consultaMemoria.confianca*
consultaMemoria.taxaLoss*
rx.suporte*
.08;
}

const scoreFinal=
rx.score+
momentoScore*rx.suporte*PESO_MOMENTO+
bonusDirecao+
bonusLoss+
bonusMemoria-
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
scoreMemoria:memoriaScore,
score:scoreFinal
};

if(!melhor||item.score>melhor.score)melhor=item;

}

return melhor;

}

function gerarCandidatos(
qtd,
freq,
momento,
diagnostico,
consultaMemoria=null
){

const mapa=new Map();

track.forEach(centroOriginal=>{

const c=avaliarCentroComGiradas(
centroOriginal,
qtd,
freq,
momento,
diagnostico,
consultaMemoria
);

if(!c)return;

const existente=mapa.get(c.centro);

if(!existente||c.score>existente.score)
mapa.set(c.centro,c);

});

return Array.from(mapa.values()).sort((a,b)=>
b.score-a.score||
b.suporte-a.suporte||
Math.abs(a.offset)-Math.abs(b.offset)
);

}


/* ============================================================
   JOGADA
============================================================ */

function montarJogada(
raioX,
base,
diagnostico=null,
usarMemoria=true
){

if(!raioX||!raioX.valido)
return{valido:false,blocos2:[],blocos1:[],numeros:new Set()};

base=limitar35(base);

const momento=analisarMomento(base);
const freq=frequenciaReplicas(raioX.replicas);

const contexto=
vetorContexto(
base,
momento,
raioX.rx,
diagnostico||{ativo:false,seq:0,lado:0}
);

const consulta=
usarMemoria
?consultarMemoria(contexto)
:null;

const candidatos2=gerarCandidatos(
2,freq,momento,diagnostico,consulta
);

const candidatos1=gerarCandidatos(
1,freq,momento,diagnostico,consulta
);

let melhor=null;

for(const um of candidatos1){

const usados=new Set(um.numeros);
const dois=[];

let score=um.score;

for(const candidato of candidatos2){

const conflito=candidato.numeros.some(n=>usados.has(n));

if(conflito)continue;

dois.push(candidato);
score+=candidato.score;

candidato.numeros.forEach(n=>usados.add(n));

if(dois.length===5)break;

}

if(dois.length===5&&usados.size===28){

if(!melhor||score>melhor.score){

melhor={
valido:true,
blocos2:dois,
blocos1:[um],
numeros:usados,
score,
momento,
contexto,
consultaMemoria:consulta
};

}

}

}

return melhor||{
valido:false,
blocos2:[],
blocos1:[],
numeros:new Set(),
momento,
contexto,
consultaMemoria:consulta
};

}

function gerarConfig(
base,
rxTam,
diagnostico=null,
usarMemoria=true
){

base=limitar35(base);

const raioX=analisarRX(base,rxTam);

if(!raioX.valido)return{valido:false,rx:rxTam};

const jogada=montarJogada(
raioX,
base,
diagnostico,
usarMemoria
);

return{
valido:jogada.valido,
rx:rxTam,
raioX,
jogada,
similaridade:raioX.similaridade
};

}


/* ============================================================
   CLASSIFICAÇÃO
============================================================ */

function classificarJogada(numero,jogada){

if(!jogada||!jogada.valido)
return{green:false,tipo:"FORA",lado:0,gap:99};

const blocos=[...jogada.blocos2,...jogada.blocos1];

for(const b of blocos){

if(b.numeros.includes(numero)){

const d=distanciaRoda(numero,b.centro);

return{
green:true,
tipo:d===0?"ALVO":(d===1?"V1":"V2"),
lado:Math.sign(deltaRoda(b.centro,numero)),
gap:0
};

}

}

let melhor=null;

blocos.forEach(b=>{

const d=distanciaRoda(numero,b.centro);
const gap=d-b.qtd;

if(gap>0&&(!melhor||gap<melhor.gap)){

melhor={
gap,
lado:Math.sign(deltaRoda(b.centro,numero))
};

}

});

if(!melhor)
return{green:false,tipo:"FORA",lado:0,gap:99};

return{
green:false,
tipo:melhor.gap===1?"FORA1":(melhor.gap===2?"FORA2":"FORA"),
lado:melhor.lado,
gap:melhor.gap
};

}


/* ============================================================
   STATS / BACKTEST
============================================================ */

function statsTimeline(lista){

const validos=lista.filter(x=>!x.semJogada);

function taxa(qtd){
const v=validos.slice(-qtd);
return v.length?v.filter(x=>x.green).length/v.length*100:0;
}

let loss=0;

for(let i=lista.length-1;i>=0;i--){

const x=lista[i];

if(x.semJogada)continue;
if(x.green)break;

loss++;

}

return{
total:validos.length,
totalLinha:lista.length,
taxa5:taxa(5),
taxa10:taxa(10),
taxa20:taxa(20),
lossSeguidos:loss,
timeline:lista
};

}

function backtest(base,rxTam){

base=limitar35(base);

const timeline=[];

const minimo=Math.max(14,rxTam*2+4);
const inicio=Math.max(minimo,base.length-20);

for(let i=inicio;i<base.length;i++){

const passado=base.slice(0,i);
const diag=diagnosticarLosses(timeline);

/*
   O backtest interno não consulta a memória futura.
   Ele testa o motor base.
*/
const cfg=gerarConfig(passado,rxTam,diag,false);

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

const r=classificarJogada(base[i],cfg.jogada);

timeline.push({
resultado:base[i],
semJogada:false,
green:r.green,
tipo:r.tipo,
lado:r.lado
});

}

return statsTimeline(timeline);

}


/* ============================================================
   RX / AUTO
============================================================ */

function melhorDoRX(base,rxTam,usarMemoria=true){

const diag=diagnosticarLosses(estado.timelines[rxTam]);

const cfg=gerarConfig(
base,
rxTam,
diag,
usarMemoria
);

if(!cfg.valido)return null;

const bt=backtest(base,rxTam);

let score=
bt.taxa5*.42+
bt.taxa10*.32+
bt.taxa20*.20+
cfg.similaridade*.06;

if(bt.lossSeguidos===1){

const validos=bt.timeline.filter(x=>!x.semJogada);
const ultimo=validos[validos.length-1];

if(ultimo&&ultimo.tipo==="FORA1")score-=1;
else score-=3;

}

const live=statsTimeline(estado.timelines[rxTam]);

if(live.total)
score+=live.taxa10*.05+live.taxa20*.025;

return{
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

const lista=RX_LIST
.map(rx=>configs[rx])
.filter(x=>x&&x.valido);

if(!lista.length)return null;

lista.sort((a,b)=>
b.score-a.score||
b.backtest.taxa10-a.backtest.taxa10||
b.backtest.taxa20-a.backtest.taxa20
);

return lista[0];

}


/* ============================================================
   TREINAMENTO WALK-FORWARD DO HISTÓRICO COLADO

   IMPORTANTE:
   Em cada ponto:
   1. só usa números anteriores;
   2. calcula a jogada;
   3. depois observa o resultado;
   4. grava o aprendizado;
   5. segue para o próximo ponto.

   Portanto o resultado futuro não entra na construção
   da jogada que está sendo testada.
============================================================ */

function treinarHistoricoCompleto(numeros){

limparMemoria();

if(!Array.isArray(numeros)||numeros.length<18)return;

const timelineTreino=[];
let pendenteG1=null;

for(let i=0;i<numeros.length;i++){

const numero=numeros[i];

/*
   Se havia uma entrada esperando G1,
   o número atual resolve o mesmo pacote.
*/
if(pendenteG1){

const rG1=classificarJogada(numero,pendenteG1.jogada);

pendenteG1.registro.g1=numero;

if(rG1.green){

pendenteG1.registro.resultadoFinal="GREEN_G1";
pendenteG1.registro.greenG1=true;

}else{

pendenteG1.registro.resultadoFinal="LOSS";
pendenteG1.registro.greenG1=false;
pendenteG1.registro.tipoG1=rG1.tipo;
pendenteG1.registro.ladoG1=rG1.lado;

}

registrarMemoria(pendenteG1.registro);

pendenteG1=null;

/*
   O G1 também pertence ao histórico normalmente.
   Ele não cria uma segunda entrada de treinamento.
*/
continue;

}

const passado=numeros.slice(
Math.max(0,i-35),
i
);

if(passado.length<14)continue;

const configs={};

RX_LIST.forEach(rx=>{

/*
   Durante o treinamento, o motor consulta somente
   memórias já criadas por situações anteriores.
*/
const diag=diagnosticarLosses(timelineTreino);

const cfg=gerarConfig(
passado,
rx,
diag,
true
);

if(!cfg.valido){
configs[rx]=null;
return;
}

/*
   Seleção RX preserva a lógica do backtest.
*/
const bt=backtest(passado,rx);

let score=
bt.taxa5*.42+
bt.taxa10*.32+
bt.taxa20*.20+
cfg.similaridade*.06;

configs[rx]={
valido:true,
rx,
raioX:cfg.raioX,
jogada:cfg.jogada,
similaridade:cfg.similaridade,
backtest:bt,
live:statsTimeline(timelineTreino),
score
};

});

const auto=escolherAuto(configs);

if(!auto||!auto.valido)continue;

const diag=diagnosticarLosses(timelineTreino);

const momento=auto.jogada.momento||analisarMomento(passado);

const contexto=
auto.jogada.contexto||
vetorContexto(passado,momento,auto.rx,diag);

const r=classificarJogada(numero,auto.jogada);

const registro={
contexto,
rx:auto.rx,
jogada:resumoJogadaMemoria(auto.jogada),
numero,
primeiroGreen:r.green,
tipo:r.tipo,
lado:r.lado,
gap:r.gap,
g1:null,
greenG1:false,
resultadoFinal:r.green?"GREEN1":"AGUARDA_G1"
};

timelineTreino.push({
resultado:numero,
semJogada:false,
green:r.green,
tipo:r.tipo,
lado:r.lado
});

timelineTreino.splice(0,Math.max(0,timelineTreino.length-300));

if(r.green){

registrarMemoria(registro);

}else{

/*
   LOSS de primeira:
   a mesma jogada é congelada para o próximo número.
*/
pendenteG1={
jogada:auto.jogada,
registro
};

}

}

/*
   Se o histórico terminou justamente após um LOSS,
   ainda não existe G1 conhecido.
   Não inventamos resultado.
*/
salvarMemoria();

}


/* ============================================================
   SNAPSHOT
============================================================ */

function assinatura(){
return historico.length+"|"+historico.join(",");
}

function snapshot(config){

if(!config||!config.valido)return null;

return{
assinatura:assinatura(),
rx:config.rx,
centros2:config.jogada.blocos2.map(x=>x.centro),
centro1:config.jogada.blocos1[0]
?config.jogada.blocos1[0].centro
:null
};

}

function classificarSnapshot(numero,p){

if(!p)return{green:false,tipo:"FORA",lado:0};

const blocos2=(p.centros2||[]).map(c=>({
centro:c,
qtd:2,
numeros:setor(c,2)
}));

const blocos1=
p.centro1!==null&&p.centro1!==undefined
?[{
centro:p.centro1,
qtd:1,
numeros:setor(p.centro1,1)
}]
:[];

return classificarJogada(numero,{
valido:true,
blocos2,
blocos1
});

}

function garantirPendentes(configs,auto){

const sig=assinatura();

RX_LIST.forEach(rx=>{

if(
estado.pendentes[rx]&&
estado.pendentes[rx].assinatura===sig
)return;

estado.pendentes[rx]=snapshot(configs[rx]);

});

if(!estado.pendentes.AUTO||estado.pendentes.AUTO.assinatura!==sig)
estado.pendentes.AUTO=snapshot(auto);

salvarEstado();

}

function avaliarPendentes(numero){

const sig=assinatura();

["AUTO",4,5,6].forEach(k=>{

const p=estado.pendentes[k];

if(!p||p.assinatura!==sig){

estado.timelines[k].push({
resultado:numero,
semJogada:true,
green:null,
tipo:"SEM_JOGADA",
lado:0,
hora:Date.now()
});

estado.timelines[k]=estado.timelines[k].slice(-MAX_TIMELINE);

estado.pendentes[k]=null;
return;

}

const r=classificarSnapshot(numero,p);

estado.timelines[k].push({
resultado:numero,
semJogada:false,
green:r.green,
tipo:r.tipo,
lado:r.lado,
hora:Date.now()
});

estado.timelines[k]=estado.timelines[k].slice(-MAX_TIMELINE);
estado.pendentes[k]=null;

});

salvarEstado();

}


/* ============================================================
   CONTROLE VISUAL / G1
============================================================ */

function chaveVisualAtual(){
return estado.modo==="AUTO"?"AUTO":estado.manualRX;
}

function avaliarNumeroContraPacote(numero,pacote){

const resultado=avaliacoesVazias();

["AUTO",4,5,6].forEach(k=>{

const p=pacote&&pacote[k]?pacote[k]:null;

if(!p){
resultado[k]="SEM";
return;
}

const r=classificarSnapshot(numero,p);

resultado[k]=r.green?"GREEN":"LOSS";

});

return resultado;
}

function capturarAvaliacoesDoResultado(numero){

const resultado={};

["AUTO",4,5,6].forEach(k=>{

const lista=estado.timelines[k]||[];
const item=lista[lista.length-1];

if(!item||item.resultado!==numero){
resultado[k]=null;
return;
}

resultado[k]=item.semJogada
?"SEM"
:(item.green?"GREEN":"LOSS");

});

return resultado;
}

function prepararVisualAntes(numero){

const snapshotsAntes=capturarSnapshotsPendentes();

const ultima=duplasVisual.length
?duplasVisual[duplasVisual.length-1]
:null;

if(ultima&&ultima.fase==="ESPERA_G1"){

return{
tipo:"G1",
numero,
entrada:ultima,
snapshotsAntes
};

}

return{
tipo:"ENTRADA",
numero,
snapshotsAntes
};

}

function statusEntrada(entrada,chave){

const primeira=(entrada.avaliacoes||{})[chave];
const g1=(entrada.avaliacoesG1||{})[chave];

if(primeira==="GREEN")
return{tipo:"GREEN1",texto:"G",classe:"green"};

if(primeira==="SEM")
return{tipo:"SEM",texto:"—",classe:"sem"};

if(primeira==="LOSS"){

if(entrada.g1===null||entrada.g1===undefined)
return{tipo:"AGUARDA_G1",texto:"L",classe:"loss"};

if(g1==="GREEN")
return{tipo:"GREENG1",texto:"G",classe:"g1"};

if(g1==="SEM")
return{tipo:"SEM",texto:"—",classe:"sem"};

return{tipo:"LOSS",texto:"L",classe:"loss"};

}

return{tipo:"ABERTA",texto:"—",classe:"aberta"};

}


/* ============================================================
   REGISTRO AO VIVO NA MEMÓRIA
============================================================ */

let memoriaEntradaPendente=null;

function prepararRegistroMemoria(configAntes){

if(
!configAntes||
!configAntes.valido||
!configAntes.jogada||
!configAntes.jogada.valido
)return null;

const base=historico.slice(-35);
const momento=analisarMomento(base);

const diag=diagnosticarLosses(
estado.timelines[
configAntes.rx
]||[]
);

return{
contexto:
configAntes.jogada.contexto||
vetorContexto(base,momento,configAntes.rx,diag),

rx:configAntes.rx,
jogada:resumoJogadaMemoria(configAntes.jogada)
};

}

function finalizarVisualDepois(
numero,
controle,
configAntes,
registroAntes
){

const chave=chaveVisualAtual();

if(controle.tipo==="G1"){

const entrada=controle.entrada;

entrada.g1=numero;

entrada.avaliacoesG1=
avaliarNumeroContraPacote(
numero,
entrada.snapshotEntrada
);

entrada.fase="FINALIZADO";

if(memoriaEntradaPendente){

const rG1=classificarJogada(
numero,
memoriaEntradaPendente.jogadaCompleta
);

memoriaEntradaPendente.registro.g1=numero;

if(rG1.green){

memoriaEntradaPendente.registro.resultadoFinal="GREEN_G1";
memoriaEntradaPendente.registro.greenG1=true;

}else{

memoriaEntradaPendente.registro.resultadoFinal="LOSS";
memoriaEntradaPendente.registro.greenG1=false;
memoriaEntradaPendente.registro.tipoG1=rG1.tipo;
memoriaEntradaPendente.registro.ladoG1=rG1.lado;

}

registrarMemoria(memoriaEntradaPendente.registro);
salvarMemoria();

memoriaEntradaPendente=null;

}

jogadaCongelada=null;

salvarJogadaCongelada();
salvarDuplasVisual();

return;

}

const avaliacoes=capturarAvaliacoesDoResultado(numero);
const atual=avaliacoes[chave];

const entrada=normalizarDuplaVisual({
resultado:numero,
g1:null,
avaliacoes,
avaliacoesG1:avaliacoesVazias(),
snapshotEntrada:controle.snapshotsAntes,
fase:atual==="LOSS"?"ESPERA_G1":"FINALIZADO"
});

duplasVisual.push(entrada);
duplasVisual=duplasVisual.slice(-14);

if(registroAntes&&configAntes?.jogada?.valido){

const r=classificarJogada(numero,configAntes.jogada);

const registro={
contexto:registroAntes.contexto,
rx:registroAntes.rx,
jogada:registroAntes.jogada,
numero,
primeiroGreen:r.green,
tipo:r.tipo,
lado:r.lado,
gap:r.gap,
g1:null,
greenG1:false,
resultadoFinal:r.green?"GREEN1":"AGUARDA_G1"
};

if(r.green){

registrarMemoria(registro);
salvarMemoria();

memoriaEntradaPendente=null;

}else{

memoriaEntradaPendente={
registro,
jogadaCompleta:configAntes.jogada
};

}

}

if(atual==="LOSS")
jogadaCongelada=copiarJogadaCongelada(configAntes);
else
jogadaCongelada=null;

salvarJogadaCongelada();
salvarDuplasVisual();

}


/* ============================================================
   CONFIGURAÇÃO ATUAL
============================================================ */

function calcularConfiguracoesAtuais(){

const base=historico.slice(-35);
const configs={};

RX_LIST.forEach(rx=>{
configs[rx]=melhorDoRX(base,rx,true);
});

const auto=escolherAuto(configs);

const ativa=
estado.modo==="AUTO"
?auto
:configs[estado.manualRX];

return{base,configs,auto,ativa};

}


/* ============================================================
   ADICIONAR NÚMERO
============================================================ */

function adicionarNumero(numero){

const calculoAntes=calcularConfiguracoesAtuais();

const configAntes=
jogadaCongelada||
calculoAntes.ativa;

const registroAntes=
prepararRegistroMemoria(configAntes);

const controleVisual=
prepararVisualAntes(numero);

avaliarPendentes(numero);

historico.push(numero);
historico=historico.slice(-35);

salvarHistorico();

render();

finalizarVisualDepois(
numero,
controleVisual,
configAntes,
registroAntes
);

render();

}


/* ============================================================
   COLAR HISTÓRICO

   NÃO CORTA ANTES DO TREINAMENTO.
============================================================ */

function extrairNumeros(texto){

const encontrados=
texto.match(/\b(?:[0-9]|[12][0-9]|3[0-6])\b/g);

if(!encontrados)return[];

return encontrados.map(Number);

}

function inserirHistorico(){

const campo=document.getElementById("entradaHistorico");

const numeros=extrairNumeros(campo.value);

if(!numeros.length)return;

document.getElementById("status").textContent=
"TREINANDO MEMÓRIA • "+numeros.length+" NÚMEROS...";

/*
   Limpa estado operacional anterior.
*/
estado.pendentes={AUTO:null,4:null,5:null,6:null};
estado.timelines={AUTO:[],4:[],5:[],6:[]};

duplasVisual=[];
jogadaCongelada=null;
memoriaEntradaPendente=null;

/*
   PRIMEIRO:
   percorre TODO o histórico fornecido.
*/
treinarHistoricoCompleto(numeros);

/*
   DEPOIS:
   somente os últimos 35 viram histórico operacional.
*/
historico=numeros.slice(-35);

salvarJogadaCongelada();
salvarDuplasVisual();
salvarHistorico();
salvarEstado();

campo.value="";

render();

}


/* ============================================================
   APAGAR
============================================================ */

function apagarUltimoDaDupla(){

if(!duplasVisual.length)return;

const ultima=duplasVisual[duplasVisual.length-1];

if(ultima.g1!==null&&ultima.g1!==undefined){

ultima.g1=null;
ultima.avaliacoesG1=avaliacoesVazias();
ultima.fase="ESPERA_G1";

salvarDuplasVisual();
return;

}

duplasVisual.pop();
salvarDuplasVisual();

}

function apagarUltimo(){

if(!historico.length)return;

apagarUltimoDaDupla();

historico.pop();

estado.pendentes={AUTO:null,4:null,5:null,6:null};

jogadaCongelada=null;
memoriaEntradaPendente=null;

salvarJogadaCongelada();
salvarHistorico();
salvarEstado();

render();

}

function apagarTudo(){

if(!confirm("Apagar histórico e memória adaptativa?"))return;

historico=[];
duplasVisual=[];
jogadaCongelada=null;
memoriaEntradaPendente=null;

estado.pendentes={AUTO:null,4:null,5:null,6:null};
estado.timelines={AUTO:[],4:[],5:[],6:[]};

limparMemoria();

salvarJogadaCongelada();
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
"margin:0;background:#101010;color:#fff;font-family:Arial,sans-serif;";

const app=document.createElement("div");

app.innerHTML=`
<style>
*{box-sizing:border-box}
body{background:#101010}
.app{max-width:900px;margin:auto;padding:7px}
h2{text-align:center;font-size:20px;margin:5px}
.painel{background:#1c1c1f;border:1px solid #414141;border-radius:10px;padding:8px;margin-bottom:7px}
.titulo{font-size:9px;font-weight:900;color:#888;margin-bottom:5px}
textarea{width:100%;height:60px;background:#111;color:#fff;border:1px solid #555;border-radius:7px;padding:7px}
.botoes{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}
button{cursor:pointer;font-family:Arial;font-weight:900}
.btn{border:1px solid #555;background:#333;color:#fff;border-radius:7px;padding:7px 10px}
.btn.verde{background:#17643b}
.btn.red{background:#762832}
.modos{display:flex;gap:4px}
.modo{background:#222;color:#999;border:1px solid #555;border-radius:7px;padding:7px 11px}
.modo.ativo{background:#007d98;border-color:#00e5ff;color:#fff}

.trio{margin-top:7px;background:#111;border:1px solid #333;border-radius:8px;padding:8px}
.trioTitulo{font-size:7px;font-weight:900;color:#777;margin-bottom:6px}
.trioLinha{display:flex;gap:6px}
.terminal{flex:1;border-radius:7px;padding:7px;text-align:center;font-size:18px;font-weight:900;background:#202020}
.terminal.primeiro{border:1px solid #00e676}
.terminal.segundo{border:1px solid #00b0ff}
.terminal.terceiro{border:1px solid #ffc107}
.terminal small{display:block;font-size:7px;color:#888;margin-top:3px}

.timelineRow{display:grid;grid-template-columns:40px 1fr 42px;gap:4px;align-items:center;margin-top:4px}
.timeline{display:flex;gap:2px;justify-content:flex-end;overflow:hidden}
.gl{width:15px;height:15px;min-width:15px;border-radius:3px;font-size:7px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff}
.gl.greenPrimeira{background:#00994d}
.gl.greenG1{background:#ffc107;color:#111}
.gl.lossEntrada,.gl.aguardaG1{background:#c62828}
.semJogadaGL{width:15px;height:15px;min-width:15px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#777}
.nomeTL,.taxaTL{font-size:8px;font-weight:900}
.taxaTL{text-align:right}

.duplas14{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;width:100%}
.dupla14{min-width:0;min-height:65px;border-radius:7px;display:flex;align-items:flex-start;justify-content:center;background:#272727;border:2px solid #555;position:relative;padding:6px 4px 26px}
.dupla14.green{background:rgba(0,153,77,.18);border-color:#00b85c}
.dupla14.loss{background:rgba(198,40,40,.18);border-color:#d93a3a}
.dupla14.g1{background:rgba(255,193,7,.16);border-color:#ffc107}
.dupla14.sem{background:#292929;border-color:#666}
.dupla14.aberta{background:#202020;border-color:#777;border-style:dashed}
.bolaDupla{width:31px;height:31px;min-width:31px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#fff;border:2px solid #aaa}
.resultadoEntrada{position:absolute;left:50%;bottom:2px;transform:translateX(-50%);height:19px;min-width:26px;padding:2px 5px;border-radius:5px;display:flex;align-items:center;justify-content:center;gap:3px;font-size:7px;font-weight:900;white-space:nowrap;border:1px solid #777;background:#171717}
.resultadoEntrada.green{background:#00994d;border-color:#00e676;color:#fff}
.resultadoEntrada.g1{background:#ffc107;border-color:#ffe082;color:#111}
.resultadoEntrada.loss{background:#c62828;border-color:#ff5252;color:#fff}
.resultadoEntrada.sem{background:#333;border-color:#666;color:#aaa}
.g1Numero{font-size:6px;font-weight:900;padding-left:3px;border-left:1px solid rgba(255,255,255,.45)}

.jogadaStatus{font-size:8px;font-weight:900;margin:3px 0 6px;padding:4px 6px;border-radius:5px;display:inline-block;background:#15323a;color:#00e5ff;border:1px solid #007d98}
.jogadaStatus.congelada{background:#4a3510;color:#ffc107;border-color:#ffc107}
.jogadaCompacta{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;width:100%;margin-top:4px}
.blocoCompacto{height:52px;min-width:0;background:#111;border:1px solid #00e5ff;border-radius:8px;display:flex;align-items:center;justify-content:center;position:relative}
.blocoCompacto.um{border-color:#ffc107}
.blocoCompacto strong{font-size:25px;line-height:1;font-weight:900}
.blocoCompacto .tipoVizinho{position:absolute;right:3px;top:2px;font-size:6px;font-weight:900;color:#777}
.blocoCompacto .regiaoMini{position:absolute;left:3px;bottom:2px;font-size:5px;font-weight:900;color:#555}

.memoriaInfo{font-size:7px;color:#777;font-weight:900;margin-top:5px}
.memoriaInfo b{color:#00e5ff}

.teclado{display:grid;grid-template-columns:repeat(6,1fr);gap:4px}
.numero{height:37px;border:1px solid #666;border-radius:6px;color:#fff}
.zero{grid-column:span 6}
.status{font-size:9px;font-weight:900;color:#00e676;margin-top:5px}

@media(max-width:600px){
.duplas14{grid-template-columns:repeat(4,1fr)}
.dupla14{min-height:65px}
.jogadaCompacta{grid-template-columns:repeat(6,1fr);gap:3px}
.blocoCompacto{height:46px;border-radius:6px}
.blocoCompacto strong{font-size:21px}
}
</style>

<div class="app">

<h2>ANÁLISE 0 • 6 • 9</h2>

<div class="painel">
<textarea id="entradaHistorico"
placeholder="Cole qualquer quantidade de números — todos treinam a memória e os últimos 35 ficam ativos"></textarea>

<div class="botoes">
<button id="inserir" class="btn verde">INSERIR</button>
<button id="apagar" class="btn">APAGAR ÚLTIMO</button>
<button id="limpar" class="btn red">APAGAR TUDO</button>
</div>

<div id="status" class="status">PRONTO</div>
</div>

<div class="painel">

<div class="titulo">MOTOR</div>

<div class="modos">
<button id="auto" class="modo">AUTO</button>
<button id="rx4" class="modo">4</button>
<button id="rx5" class="modo">5</button>
<button id="rx6" class="modo">6</button>
</div>

<div id="trio" class="trio"></div>

<div id="timelineAUTO" class="timelineRow"></div>
<div id="timeline4" class="timelineRow"></div>
<div id="timeline5" class="timelineRow"></div>
<div id="timeline6" class="timelineRow"></div>

<div id="memoriaInfo" class="memoriaInfo"></div>

</div>

<div class="painel">
<div class="titulo">ÚLTIMAS 14 • ENTRADAS</div>
<div id="ultimos14" class="duplas14"></div>
</div>

<div class="painel">
<div class="titulo">JOGADA</div>
<div id="jogada"></div>
</div>

<div class="painel">
<div class="titulo">TECLADO</div>
<div id="teclado" class="teclado"></div>
</div>

</div>
`;

document.body.appendChild(app);


/* ============================================================
   EVENTOS
============================================================ */

document.getElementById("inserir").onclick=inserirHistorico;
document.getElementById("apagar").onclick=apagarUltimo;
document.getElementById("limpar").onclick=apagarTudo;

document.getElementById("auto").onclick=()=>{

estado.modo="AUTO";

jogadaCongelada=null;

salvarJogadaCongelada();
salvarEstado();
render();

};

RX_LIST.forEach(rx=>{

document.getElementById("rx"+rx).onclick=()=>{

estado.modo="MANUAL";
estado.manualRX=rx;

jogadaCongelada=null;

salvarJogadaCongelada();
salvarEstado();
render();

};

});


/* ============================================================
   TECLADO
============================================================ */

const teclado=document.getElementById("teclado");

for(let n=1;n<=36;n++){

const b=document.createElement("button");

b.className="numero";
b.textContent=n;
b.style.background=corRoleta(n);
b.onclick=()=>adicionarNumero(n);

teclado.appendChild(b);

}

const zero=document.createElement("button");

zero.className="numero zero";
zero.textContent="0";
zero.style.background=corRoleta(0);
zero.onclick=()=>adicionarNumero(0);

teclado.appendChild(zero);


/* ============================================================
   TIMELINE
============================================================ */

function timelineEntradas(chave){

return duplasVisual.map(d=>{

const s=statusEntrada(d,chave);

return{
resultado:d.resultado,
tipo:s.tipo
};

});

}

function taxaEntradas(lista,qtd){

const validos=lista.filter(x=>
x.tipo==="GREEN1"||
x.tipo==="GREENG1"||
x.tipo==="LOSS"
).slice(-qtd);

if(!validos.length)return 0;

return validos.filter(x=>
x.tipo==="GREEN1"||
x.tipo==="GREENG1"
).length/validos.length*100;

}

function renderTimeline(id,nome,chave){

const lista=timelineEntradas(chave).slice(-20);
const taxa=taxaEntradas(lista,20);

document.getElementById(id).innerHTML=

'<div class="nomeTL">'+nome+'</div>'+

'<div class="timeline">'+

lista.map(x=>{

if(x.tipo==="SEM")
return'<span class="semJogadaGL">—</span>';

if(x.tipo==="GREEN1")
return'<span class="gl greenPrimeira">G</span>';

if(x.tipo==="GREENG1")
return'<span class="gl greenG1">G</span>';

if(x.tipo==="AGUARDA_G1")
return'<span class="gl aguardaG1">L</span>';

if(x.tipo==="LOSS")
return'<span class="gl lossEntrada">L</span>';

return'<span class="semJogadaGL">—</span>';

}).join("")+

'</div>'+

'<div class="taxaTL">'+
(lista.length?taxa.toFixed(0)+"%":"—")+
'</div>';

}


/* ============================================================
   TERMINAIS
============================================================ */

function renderTrio(momento){

const itens=momento.terminais.ranking.slice(0,3);

document.getElementById("trio").innerHTML=

'<div class="trioTitulo">'+
'TERMINAIS DO MOMENTO • COM 1 VIZINHO DE CADA LADO'+
'</div>'+

'<div class="trioLinha">'+

itens.map((x,i)=>

'<div class="terminal '+
(i===0?"primeiro":(i===1?"segundo":"terceiro"))+
'">'+

x.terminal+

'<small>FORÇA '+
x.score.toFixed(1)+
'</small>'+

'</div>'

).join("")+

'</div>';

}


/* ============================================================
   JOGADA
============================================================ */

function renderJogada(config,congelada=false){

const area=document.getElementById("jogada");

if(!config||!config.valido){

area.innerHTML=
'<div style="color:#777">AGUARDANDO DADOS</div>';

return;

}

const todos=[
...config.jogada.blocos2,
...config.jogada.blocos1
];

const ordenados=ordenarBlocosVisual(todos);

area.innerHTML=

'<div class="jogadaStatus '+
(congelada?"congelada":"")+
'">'+
(congelada
?"JOGADA CONGELADA • G1"
:"JOGADA ATUAL")+
'</div>'+

'<div class="jogadaCompacta">'+

ordenados.map(b=>{

const r=regiao(b.centro)||"";

return(
'<div class="blocoCompacto '+
(b.qtd===1?"um":"")+
'">'+

'<span class="tipoVizinho">'+
(b.qtd===1?"1V":"2V")+
'</span>'+

'<strong>'+b.centro+'</strong>'+

'<span class="regiaoMini">'+
r+
'</span>'+

'</div>'
);

}).join("")+

'</div>';

}


/* ============================================================
   ENTRADAS
============================================================ */

function renderDuplas14(){

const area=document.getElementById("ultimos14");

const lista=duplasVisual.slice(-14);
const chave=chaveVisualAtual();

area.innerHTML=lista.map(d=>{

d=normalizarDuplaVisual(d);

const s=statusEntrada(d,chave);

let g1="";

if(d.g1!==null&&d.g1!==undefined)
g1='<span class="g1Numero">G1 '+d.g1+'</span>';

return(
'<div class="dupla14 '+s.classe+'">'+

'<div class="bolaDupla" style="background:'+
corRoleta(d.resultado)+
'">'+
d.resultado+
'</div>'+

'<div class="resultadoEntrada '+s.classe+'">'+
s.texto+
g1+
'</div>'+

'</div>'
);

}).join("");

}


/* ============================================================
   RENDER
============================================================ */

function render(){

historico=historico.slice(-35);
salvarHistorico();

const base=historico.slice(-35);
const momento=analisarMomento(base);

const configs={};

RX_LIST.forEach(rx=>{
configs[rx]=melhorDoRX(base,rx,true);
});

const auto=escolherAuto(configs);

garantirPendentes(configs,auto);

const ativa=
estado.modo==="AUTO"
?auto
:configs[estado.manualRX];

["auto","rx4","rx5","rx6"].forEach(id=>{
document.getElementById(id).classList.remove("ativo");
});

if(estado.modo==="AUTO")
document.getElementById("auto").classList.add("ativo");
else
document.getElementById("rx"+estado.manualRX).classList.add("ativo");


/*
   BT10 / BT20 / REAL10 / REAL20
   NÃO SÃO MAIS EXIBIDOS.
   O backtest continua trabalhando internamente.
*/

renderTrio(momento);

renderTimeline("timelineAUTO","AUTO","AUTO");
renderTimeline("timeline4","RX4",4);
renderTimeline("timeline5","RX5",5);
renderTimeline("timeline6","RX6",6);

renderDuplas14();

if(jogadaCongelada)
renderJogada(jogadaCongelada,true);
else
renderJogada(ativa,false);


/* ============================================================
   INFORMAÇÃO DISCRETA DA MEMÓRIA
============================================================ */

let consultaAtual=null;

if(
ativa&&
ativa.valido&&
ativa.jogada&&
ativa.jogada.consultaMemoria
){
consultaAtual=ativa.jogada.consultaMemoria;
}

document.getElementById("memoriaInfo").innerHTML=

'MEMÓRIA INTERNA: <b>'+
memoriaAdaptativa.length+
'</b> CENÁRIOS'+

(
consultaAtual&&consultaAtual.ativo
?' • SEMELHANTES AGORA: <b>'+
consultaAtual.amostras+
'</b>'
:''
);


const esperandoG1=
duplasVisual.length&&
duplasVisual[duplasVisual.length-1].fase==="ESPERA_G1";

document.getElementById("status").textContent=

base.length+
"/35 • MOMENTO 14 • MEMÓRIA "+
memoriaAdaptativa.length+
(
esperandoG1
?" • G1: JOGADA CONGELADA"
:""
);

}


/* ============================================================
   START
============================================================ */

render();

})();
