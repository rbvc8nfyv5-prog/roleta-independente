(function(){

const track=[
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

const terminal=n=>n%10;

const corTerminal={
0:"#ff5252",
1:"#ff9800",
2:"#ffc107",
3:"#00e676",
4:"#00bcd4",
5:"#2196f3",
6:"#9c27b0",
7:"#e91e63",
8:"#8bc34a",
9:"#ff00ff"
};

let timeline=[];
let historicoCompleto=[];
let expandido=false;
let faixa10Ativa=false;
let analise100Ativa=false;
let analiseColunasAtiva=false;
let colunasTopo=[1,2,3,4,5,6,7,8,9,10,11,12];

const analises={
MANUAL:{filtros:new Set()}
};

const modosTerminais={};
const ordemSelecionados=[];

for(let t=0;t<=9;t++) modosTerminais[t]=0;

function clarearCor(hex){
hex=hex.replace("#","");
let r=parseInt(hex.substring(0,2),16);
let g=parseInt(hex.substring(2,4),16);
let b=parseInt(hex.substring(4,6),16);

r=Math.min(255,Math.floor(r+(255-r)*0.45));
g=Math.min(255,Math.floor(g+(255-g)*0.45));
b=Math.min(255,Math.floor(b+(255-b)*0.45));

return "#"+[r,g,b].map(x=>x.toString(16).padStart(2,"0")).join("");
}

function atualizarModosPorOrdem(){
for(let t=0;t<=9;t++) modosTerminais[t]=0;

if(ordemSelecionados.length>0)
modosTerminais[ordemSelecionados[0]]=2;

for(let i=1;i<ordemSelecionados.length;i++)
modosTerminais[ordemSelecionados[i]]=1;
}

function vizinhos1(n){
const i=track.indexOf(n);
return[
track[(i+36)%37],
n,
track[(i+1)%37]
];
}

function vizinhos2(n){
const i=track.indexOf(n);
return[
track[(i+35)%37],
track[(i+36)%37],
n,
track[(i+1)%37],
track[(i+2)%37]
];
}

function segundoVizinho(n){
const i=track.indexOf(n);
return[
track[(i+35)%37],
track[(i+2)%37]
];
}

function coberturaTerminal(t,qtd){

const set=new Set();

track.forEach(n=>{

if(terminal(n)===t){

if(qtd===2)
vizinhos2(n).forEach(v=>set.add(v));
else
vizinhos1(n).forEach(v=>set.add(v));

}

});

return set;
}

function aplicarAnalise100(){

if(historicoCompleto.length<3) return;

let melhor=null;

for(let t2=0;t2<=9;t2++){

for(let t1=0;t1<=9;t1++){

if(t1===t2) continue;

const cov2=coberturaTerminal(t2,2);
const cov1=coberturaTerminal(t1,1);

const cobertura=new Set([...cov2,...cov1]);

let green=0;
let red=0;

const base=historicoCompleto.slice(-100);

for(let i=0;i<base.length-1;i++){

const prox=base[i+1];

if(cobertura.has(prox))
green++;
else
red++;

}

const taxa=(green+red)?green/(green+red):0;

const teste={
t2,
t1,
green,
red,
taxa
};

if(
!melhor||
teste.red<melhor.red||
(teste.red===melhor.red&&teste.green>melhor.green)||
(teste.red===melhor.red&&teste.green===melhor.green&&teste.taxa>melhor.taxa)
){
melhor=teste;
}

}

}

if(!melhor) return;

analises.MANUAL.filtros.clear();
ordemSelecionados.length=0;

analises.MANUAL.filtros.add(melhor.t2);
ordemSelecionados.push(melhor.t2);

analises.MANUAL.filtros.add(melhor.t1);
ordemSelecionados.push(melhor.t1);

atualizarModosPorOrdem();
}

function setorComRaio(centro,raio){

const i=track.indexOf(centro);
const set=new Set();

for(let d=-raio;d<=raio;d++){
set.add(track[(i+d+37)%37]);
}

return set;
}

function analisarSetor(base,centro){

const setor=setorComRaio(centro,9);

let atual=0;

for(let i=base.length-1;i>=0;i--){

if(setor.has(base[i]))
atual++;
else
break;

}

let max=0;
let seq=0;
let total=0;

base.forEach(n=>{

if(setor.has(n)){
total++;
seq++;
if(seq>max) max=seq;
}else{
seq=0;
}

});

return{
atual,
max,
pct:base.length?((total/base.length)*100):0
};

}

function analisarColunas(){

const base=historicoCompleto.slice().reverse();
let html="";

for(let c=0;c<12;c++){

const cont={};

for(let t=0;t<=9;t++)
cont[t]=0;

for(let i=c;i<base.length;i+=12)
cont[terminal(base[i])]++;

const top=Object.entries(cont)
.sort((a,b)=>b[1]-a[1])
.slice(0,2)
.map(x=>Number(x[0]));

html+=`
<span style="
display:inline-block;
margin:2px;
padding:4px 6px;
background:#222;
border:1px solid #555;
border-radius:4px;
font-size:12px;
">
C${c+1}
<b style="color:${corTerminal[top[0]]}">
T${top[0]}
</b>
/
<b style="color:${corTerminal[top[1]]}">
T${top[1]}
</b>
</span>`;
}

return html;
}

document.body.innerHTML=`
<div style="
padding:10px;
max-width:1000px;
margin:auto;
background:#111;
color:#fff;
font-family:sans-serif;
">

<textarea
id="inputHist"
placeholder="Cole histórico aqui"
style="
width:100%;
margin-bottom:10px;
background:#222;
color:#fff;
border:1px solid #555;
padding:6px;
"></textarea>

<h3 style="text-align:center">CSM</h3>

<div id="setoresBox"></div>

<div style="margin:10px 0">
🕒 Timeline:
<span id="tl"></span>
</div>

<div style="
display:flex;
gap:8px;
flex-wrap:wrap;
margin-bottom:10px;
">
<button id="btnUndo">Apagar último</button>
<button id="btnClear">Limpar tudo</button>
<button id="btn10">10</button>
<button id="btnAnalise100">Análise 100</button>
<button id="btnAnaliseColunas">Análise Colunas</button>
</div>

<div style="
border:1px solid #555;
padding:8px;
margin-bottom:10px;
">
Terminais
<div id="btnT"
style="
display:flex;
gap:6px;
flex-wrap:wrap;
margin-top:6px;
"></div>
</div>

<div id="conjArea"
style="
display:none;
margin-top:12px;
overflow:auto;
"></div>

<div id="analiseColunasBox"
style="
display:none;
margin-top:10px;
"></div>

<div id="nums"
style="
display:grid;
grid-template-columns:repeat(9,1fr);
gap:6px;
margin-top:12px;
"></div>

</div>
`;

inputHist.addEventListener("paste",()=>{

setTimeout(()=>{

historicoCompleto=inputHist.value
.split(/[\s,;|]+/)
.map(Number)
.filter(n=>n>=0&&n<=36);

timeline=historicoCompleto.slice(-14).reverse();

inputHist.style.display="none";

if(analise100Ativa)
aplicarAnalise100();

render();

},0);

});

for(let t=0;t<=9;t++){

const b=document.createElement("button");

b.textContent="T"+t;

b.onclick=()=>{

analise100Ativa=false;

if(analises.MANUAL.filtros.has(t)){
analises.MANUAL.filtros.delete(t);
const idx=ordemSelecionados.indexOf(t);
if(idx!==-1) ordemSelecionados.splice(idx,1);
}else{
analises.MANUAL.filtros.add(t);
ordemSelecionados.push(t);
}

atualizarModosPorOrdem();
render();

};

btnT.appendChild(b);

}

for(let n=0;n<=36;n++){

const b=document.createElement("button");

b.textContent=n;

b.onclick=()=>add(n);

nums.appendChild(b);

}

btnUndo.onclick=()=>{

if(!timeline.length) return;

timeline.shift();
historicoCompleto.pop();

if(analise100Ativa)
aplicarAnalise100();

render();

};

btnClear.onclick=()=>{

timeline=[];
historicoCompleto=[];
analises.MANUAL.filtros.clear();
ordemSelecionados.length=0;

render();

};

btn10.onclick=()=>{

faixa10Ativa=!faixa10Ativa;
render();

};

btnAnalise100.onclick=()=>{

analise100Ativa=!analise100Ativa;

if(analise100Ativa)
aplicarAnalise100();

render();

};

btnAnaliseColunas.onclick=()=>{

analiseColunasAtiva=!analiseColunasAtiva;
render();

};

function add(n){

timeline.unshift(n);

if(timeline.length>14)
timeline.pop();

historicoCompleto.push(n);

if(analise100Ativa)
aplicarAnalise100();

render();

}

function render(){

tl.innerHTML=timeline.join(" · ");

const zero=analisarSetor(historicoCompleto,0);
const dez=analisarSetor(historicoCompleto,10);

setoresBox.innerHTML=`
<div style="
display:flex;
gap:8px;
flex-wrap:wrap;
">

<div style="
flex:1;
padding:8px;
border:2px solid #00e676;
background:#102015;
">
<b>LADO ZERO ±9</b>
<br>Atual: ${zero.atual}
<br>Máxima: ${zero.max}
<br>Acerto: ${zero.pct.toFixed(1)}%
</div>

<div style="
flex:1;
padding:8px;
border:2px solid #ffc107;
background:#221b00;
">
<b>LADO 10 ±9</b>
<br>Atual: ${dez.atual}
<br>Máxima: ${dez.max}
<br>Acerto: ${dez.pct.toFixed(1)}%
</div>

</div>
`;

if(analiseColunasAtiva){
analiseColunasBox.style.display="block";
analiseColunasBox.innerHTML=analisarColunas();
}else{
analiseColunasBox.style.display="none";
}

}

render();

})();
