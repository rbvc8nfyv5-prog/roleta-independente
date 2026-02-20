(function(){

const track = [
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

let timeline=[];
let estruturalCentros=[];
let estruturalC6=null;

let estruturalRes=[];
let duziaRes=[];
let colunaRes=[];

let duziasAtivas=new Set();
let colunasAtivas=new Set();

function duzia(n){
 if(n>=1&&n<=12) return 1;
 if(n>=13&&n<=24) return 2;
 if(n>=25&&n<=36) return 3;
 return 0;
}

function coluna(n){
 if(n===0) return 0;
 return ((n-1)%3)+1;
}

function vizinhos2(n){
 const i=track.indexOf(n);
 return [
  track[(i-2+37)%37],
  track[(i-1+37)%37],
  n,
  track[(i+1)%37],
  track[(i+2)%37]
 ];
}

function dentroEstrutural(n){
 return estruturalCentros.some(c=>vizinhos2(c).includes(n));
}

function gerarEstrutural(){

 const usados=new Set();
 const centros=[];

 function pode(n){
  return vizinhos2(n).every(x=>!usados.has(x));
 }

 function registrar(n){
  vizinhos2(n).forEach(x=>usados.add(x));
  centros.push(n);
 }

 const freq={};
 timeline.forEach(n=>freq[n]=(freq[n]||0)+1);

 const candidatos=Object.entries(freq)
  .sort((a,b)=>b[1]-a[1])
  .map(x=>+x[0]);

 for(const n of candidatos){
  if(pode(n)) registrar(n);
  if(centros.length>=5) break;
 }

 while(centros.length<5){
  const extra=track.find(n=>pode(n));
  if(!extra) break;
  registrar(extra);
 }

 estruturalCentros=centros;
 estruturalC6=track.find(n=>!centros.includes(n));
}

function add(n){

 // Estrutural
 estruturalRes.unshift(dentroEstrutural(n)?"V":"X");

 // Dúzia filtro
 if(duziasAtivas.size>0){
   if(dentroEstrutural(n) && duziasAtivas.has(duzia(n))){
     duziaRes.unshift("V");
   } else {
     duziaRes.unshift("X");
   }
 } else {
   duziaRes.unshift("-");
 }

 // Coluna filtro
 if(colunasAtivas.size>0){
   if(dentroEstrutural(n) && colunasAtivas.has(coluna(n))){
     colunaRes.unshift("V");
   } else {
     colunaRes.unshift("X");
   }
 } else {
   colunaRes.unshift("-");
 }

 timeline.unshift(n);
 if(timeline.length>14) timeline.pop();

 gerarEstrutural();
 render();
}

document.body.style.background="#111";
document.body.style.color="#fff";
document.body.style.fontFamily="sans-serif";

document.body.innerHTML=`
<div style="max-width:1000px;margin:auto;padding:10px">

<h3>Estrutural + Dúzias + Colunas</h3>

<div>🕒 Estrutural:<div id="tlEstrutural"></div></div>
<div>🕒 Filtro Dúzia:<div id="tlDuzia"></div></div>
<div>🕒 Filtro Coluna:<div id="tlColuna"></div></div>

<div style="margin-top:10px;border:1px solid #555;padding:8px">
<b>Núcleo</b><br>
<span id="nucleo"></span>
</div>

<div style="margin-top:10px">
<b>Dúzias:</b><br>
<button onclick="toggleD(1)">D1</button>
<button onclick="toggleD(2)">D2</button>
<button onclick="toggleD(3)">D3</button>
<div id="duziasBox" style="margin-top:6px"></div>
</div>

<div style="margin-top:10px">
<b>Colunas:</b><br>
<button onclick="toggleC(1)">C1</button>
<button onclick="toggleC(2)">C2</button>
<button onclick="toggleC(3)">C3</button>
<div id="colunasBox" style="margin-top:6px"></div>
</div>

<div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>

</div>
`;

for(let n=0;n<=36;n++){
 const b=document.createElement("button");
 b.textContent=n;
 b.style="padding:8px;background:#333;color:#fff";
 b.onclick=()=>add(n);
 nums.appendChild(b);
}

window.toggleD=function(d){
 duziasAtivas.has(d)?duziasAtivas.delete(d):duziasAtivas.add(d);
 render();
}

window.toggleC=function(c){
 colunasAtivas.has(c)?colunasAtivas.delete(c):colunasAtivas.add(c);
 render();
}

function render(){

 tlEstrutural.innerHTML = timeline.map((n,i)=>{
   const r=estruturalRes[i];
   const cor=r==="V"?"#00e676":"#ff5252";
   return `<span style="color:${cor}">${n}</span>`;
 }).join(" · ");

 tlDuzia.innerHTML = timeline.map((n,i)=>{
   const r=duziaRes[i];
   const cor=r==="V"?"#2196f3":r==="X"?"#ff5252":"#666";
   return `<span style="color:${cor}">${n}</span>`;
 }).join(" · ");

 tlColuna.innerHTML = timeline.map((n,i)=>{
   const r=colunaRes[i];
   const cor=r==="V"?"#ffc107":r==="X"?"#ff5252":"#666";
   return `<span style="color:${cor}">${n}</span>`;
 }).join(" · ");

 nucleo.innerHTML = estruturalCentros.join(" , ");

 // Gerar números Dúzias
 const numsD=[];
 for(let i=1;i<=36;i++){
   if(duziasAtivas.has(duzia(i)) && dentroEstrutural(i)){
     numsD.push(i);
   }
 }
 duziasBox.innerHTML = numsD.join(" , ");

 // Gerar números Colunas ordenado por coluna
 const numsC=[];
 [1,2,3].forEach(c=>{
   if(colunasAtivas.has(c)){
     for(let i=1;i<=36;i++){
       if(coluna(i)===c && dentroEstrutural(i)){
         numsC.push(i);
       }
     }
   }
 });
 colunasBox.innerHTML = numsC.join(" , ");
}

gerarEstrutural();
render();

})();
