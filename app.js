(function () {

const track = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

const terminal = n => n % 10;

let timeline = [];
let estruturalCentros = [];
let estruturalC6 = null;
let estruturalRes = [];

let duziasAtivas = new Set();
let colunasAtivas = new Set();

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

function dentroNucleo(n){
  return estruturalCentros.some(c=>vizinhos2(c).includes(n));
}

function dentroC6(n){
  return estruturalC6!==null && vizinhos2(estruturalC6).includes(n);
}

function dist(a,b){
  const ia = track.indexOf(a);
  const ib = track.indexOf(b);
  const d = Math.abs(ia-ib);
  return Math.min(d,37-d);
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
    const salto = timeline.length>1?dist(timeline[0],timeline[1]):0;
    const score = (dMedia*0.5)+(salto*0.5);
    if(score>melhorScore){
      melhorScore=score;
      melhorC6=n;
    }
  });

  estruturalCentros=centros.slice(0,5);
  estruturalC6=melhorC6;
}

document.body.style.background="#111";
document.body.style.color="#fff";
document.body.style.fontFamily="sans-serif";

document.body.innerHTML=`
<div style="max-width:1000px;margin:auto;padding:10px">

<h3>CSM Estrutural</h3>

<div>🕒 Timeline:<div id="tl"></div></div>

<div id="estruturaBox" style="border:1px solid #555;padding:10px;margin:10px 0"></div>

<div style="margin:10px 0">
<b>Dúzias:</b><br>
<button onclick="toggleD(1)">D1</button>
<button onclick="toggleD(2)">D2</button>
<button onclick="toggleD(3)">D3</button>
<div id="duziasBox" style="margin-top:6px"></div>
</div>

<div style="margin:10px 0">
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
  if(duziasAtivas.has(d)) duziasAtivas.delete(d);
  else duziasAtivas.add(d);
  render();
};

window.toggleC=function(c){
  if(colunasAtivas.has(c)) colunasAtivas.delete(c);
  else colunasAtivas.add(c);
  render();
};

function add(n){

  if(dentroNucleo(n)) estruturalRes.unshift("V");
  else if(dentroC6(n)) estruturalRes.unshift("R");
  else estruturalRes.unshift("X");

  timeline.unshift(n);
  if(timeline.length>14) timeline.pop();

  gerarEstrutural();
  render();
}

function render(){

  tl.innerHTML = timeline.map((n,i)=>{
    const r=estruturalRes[i];
    let cor="#aaa";
    if(r==="V") cor="#00e676";
    if(r==="R") cor="#9c27b0";
    if(r==="X") cor="#ff5252";
    return `<span style="color:${cor}">${n}</span>`;
  }).join(" · ");

  estruturaBox.innerHTML=`
  <b>Núcleo:</b> ${estruturalCentros.join(" , ")}<br>
  <b>C6:</b> <span style="color:#9c27b0">${estruturalC6}</span>
  `;

  // DÚZIAS
  let duziasHTML="";
  const coresD={1:"#2196f3",2:"#ff9800",3:"#4caf50"};

  duziasAtivas.forEach(d=>{
    const inicio=(d-1)*12+1;
    const fim=d*12;
    const lista=[];
    for(let i=inicio;i<=fim;i++){
      if(dentroNucleo(i)||dentroC6(i)) lista.push(i);
    }
    duziasHTML+=`<div style="color:${coresD[d]}">${lista.join(" , ")}</div>`;
  });

  duziasBox.innerHTML=duziasHTML;

  // COLUNAS
  let colHTML="";
  const coresC={1:"#e91e63",2:"#00bcd4",3:"#ffc107"};

  colunasAtivas.forEach(c=>{
    const lista=[];
    for(let i=1;i<=36;i++){
      if(((i-1)%3)+1===c){
        if(dentroNucleo(i)||dentroC6(i)) lista.push(i);
      }
    }
    colHTML+=`<div style="color:${coresC[c]}">${lista.join(" , ")}</div>`;
  });

  colunasBox.innerHTML=colHTML;
}

gerarEstrutural();
render();

})();
