(function(){

const track = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

let timeline = [];
let estruturalCentros = [];
let estruturalC6 = null;

let estruturalRes = [];
let duziaRes = [];
let colunaRes = [];

let duziasAtivas = new Set();
let colunasAtivas = new Set();

let listaDuziaGerada = [];
let listaColunaGerada = [];

function dist(a,b){
  const ia = track.indexOf(a);
  const ib = track.indexOf(b);
  const d = Math.abs(ia-ib);
  return Math.min(d,37-d);
}

function vizinhos2(n){
  const i = track.indexOf(n);
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

function dentroC6(n){
  return estruturalC6!==null && vizinhos2(estruturalC6).includes(n);
}

function duzia(n){
  if(n>=1 && n<=12) return 1;
  if(n>=13 && n<=24) return 2;
  if(n>=25 && n<=36) return 3;
  return null;
}

function coluna(n){
  if(n===0) return null;
  return ((n-1)%3)+1;
}

function gerarEstrutural(){

  const usados = new Set();
  const centros = [];

  function pode(n){
    return vizinhos2(n).every(x=>!usados.has(x));
  }

  function registrar(n){
    vizinhos2(n).forEach(x=>usados.add(x));
    centros.push(n);
  }

  const freq = {};
  timeline.forEach(n=>freq[n]=(freq[n]||0)+1);

  const candidatos = Object.entries(freq)
    .sort((a,b)=>b[1]-a[1])
    .map(x=>+x[0]);

  for(const n of candidatos){
    if(pode(n)) registrar(n);
    if(centros.length>=5) break;
  }

  while(centros.length<5){
    const extra = track.find(n=>pode(n));
    if(extra===undefined) break;
    registrar(extra);
  }

  let melhorScore=-1;
  let melhorC6=null;

  track.forEach(n=>{
    if(centros.includes(n)) return;
    const dMedia = centros.reduce((acc,c)=>acc+dist(c,n),0)/centros.length;
    const saltoRecente = timeline.length>1 ? dist(timeline[0],timeline[1]) : 0;
    const score = (dMedia*0.5)+(saltoRecente*0.5);
    if(score>melhorScore){
      melhorScore=score;
      melhorC6=n;
    }
  });

  estruturalCentros = centros.slice(0,5);
  estruturalC6 = melhorC6;
}

document.body.style.background="#111";
document.body.style.color="#fff";
document.body.style.fontFamily="sans-serif";

document.body.innerHTML = `
<div style="max-width:1000px;margin:auto;padding:10px">

<h3>CSM Estrutural</h3>

<div>Timeline Estrutural:<div id="tlEstrutural"></div></div>
<div>Timeline Dúzia:<div id="tlDuzia"></div></div>
<div>Timeline Coluna:<div id="tlColuna"></div></div>

<br>

<div id="nucleo"></div>

<br>

<div>
<b>Dúzias</b><br>
<button id="btnD1" onclick="toggleD(1)">D1</button>
<button id="btnD2" onclick="toggleD(2)">D2</button>
<button id="btnD3" onclick="toggleD(3)">D3</button>
<div id="duziasBox" style="margin-top:6px"></div>
</div>

<br>

<div>
<b>Colunas</b><br>
<button id="btnC1" onclick="toggleC(1)">C1</button>
<button id="btnC2" onclick="toggleC(2)">C2</button>
<button id="btnC3" onclick="toggleC(3)">C3</button>
<div id="colunaBox" style="margin-top:6px"></div>
</div>

<br>

<div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px"></div>

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
  if(duziasAtivas.has(d)) duziasAtivas.delete(d);
  else duziasAtivas.add(d);
  render();
}

window.toggleC=function(c){
  if(colunasAtivas.has(c)) colunasAtivas.delete(c);
  else colunasAtivas.add(c);
  render();
}

function gerarListasFiltradas(){

  listaDuziaGerada = [];
  listaColunaGerada = [];

  const base = [...estruturalCentros, estruturalC6];

  base.forEach(n=>{
    if(duziasAtivas.has(duzia(n))){
      listaDuziaGerada.push(n);
    }
    if(colunasAtivas.has(coluna(n))){
      listaColunaGerada.push(n);
    }
  });

}

function add(n){

  estruturalRes.unshift(dentroEstrutural(n)?"V":"X");

  gerarListasFiltradas();

  duziaRes.unshift(listaDuziaGerada.includes(n)?"V":"X");
  colunaRes.unshift(listaColunaGerada.includes(n)?"V":"X");

  timeline.unshift(n);
  if(timeline.length>14) timeline.pop();

  gerarEstrutural();
  render();
}

function atualizarBotoes(){

  [1,2,3].forEach(d=>{
    const btn=document.getElementById("btnD"+d);
    if(duziasAtivas.has(d)){
      btn.style.background="#2196f3";
      btn.style.color="#fff";
      btn.style.boxShadow="0 0 6px #2196f3";
    }else{
      btn.style.background="#333";
      btn.style.color="#fff";
      btn.style.boxShadow="none";
    }
  });

  [1,2,3].forEach(c=>{
    const btn=document.getElementById("btnC"+c);
    if(colunasAtivas.has(c)){
      btn.style.background="#ffc107";
      btn.style.color="#000";
      btn.style.boxShadow="0 0 6px #ffc107";
    }else{
      btn.style.background="#333";
      btn.style.color="#fff";
      btn.style.boxShadow="none";
    }
  });
}

function render(){

  gerarListasFiltradas();
  atualizarBotoes();

  tlEstrutural.innerHTML = timeline.map((n,i)=>{
    const cor=estruturalRes[i]==="V"?"#00e676":"#ff5252";
    return `<span style="color:${cor}">${n}</span>`;
  }).join(" · ");

  tlDuzia.innerHTML = timeline.map((n,i)=>{
    const cor=duziaRes[i]==="V"?"#2196f3":"#ff5252";
    return `<span style="color:${cor}">${n}</span>`;
  }).join(" · ");

  tlColuna.innerHTML = timeline.map((n,i)=>{
    const cor=colunaRes[i]==="V"?"#ffc107":"#ff5252";
    return `<span style="color:${cor}">${n}</span>`;
  }).join(" · ");

  nucleo.innerHTML = `
    <div style="color:#00e676">
      C1–C5: ${estruturalCentros.join(" , ")}
    </div>
    <div style="color:#9c27b0">
      C6 (CCX): ${estruturalC6}
    </div>
  `;

  duziasBox.innerHTML = listaDuziaGerada.join(" , ");
  colunaBox.innerHTML = listaColunaGerada.join(" , ");
}

gerarEstrutural();
render();

})();
