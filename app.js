(function () {

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

let duziaAtiva = null;
let colunaAtiva = null;

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

  let melhorScore = -1;
  let melhorC6 = null;

  track.forEach(n=>{
    if(centros.includes(n)) return;

    const dMedia = centros.reduce((acc,c)=>acc+dist(c,n),0)/centros.length;
    const saltoRecente = timeline.length>1 ? dist(timeline[0],timeline[1]) : 0;
    const score = (dMedia*0.5) + (saltoRecente*0.5);

    if(score > melhorScore){
      melhorScore = score;
      melhorC6 = n;
    }
  });

  estruturalCentros = centros.slice(0,5);
  estruturalC6 = melhorC6;
}

function dentroNucleo(n){
  return estruturalCentros.some(c=>vizinhos2(c).includes(n));
}

function dentroC6(n){
  return estruturalC6!==null && vizinhos2(estruturalC6).includes(n);
}

function add(n){

  if(dentroNucleo(n)){
    estruturalRes.unshift("V");
  } else if(dentroC6(n)){
    estruturalRes.unshift("R");
  } else {
    estruturalRes.unshift("X");
  }

  timeline.unshift(n);
  if(timeline.length>14) timeline.pop();

  gerarEstrutural();
  render();
}

function filtrarPorDuzia(n){
  if(!duziaAtiva) return false;
  if(duziaAtiva===1) return n>=1 && n<=12;
  if(duziaAtiva===2) return n>=13 && n<=24;
  if(duziaAtiva===3) return n>=25 && n<=36;
}

function filtrarPorColuna(n){
  if(!colunaAtiva) return false;
  return ((n-1)%3)+1 === colunaAtiva;
}

document.body.style.background="#111";
document.body.style.color="#fff";
document.body.style.fontFamily="sans-serif";

document.body.innerHTML = `
<div style="max-width:1000px;margin:auto;padding:10px">

<h3>CSM Estrutural</h3>

<div>🕒 Timeline:<div id="tl"></div></div>

<div id="estruturaBox"
     style="border:1px solid #555;padding:10px;margin:10px 0">
</div>

<div style="border:1px solid #555;padding:8px;margin:10px 0">
<b>DÚZIAS</b><br>
<button onclick="duziaAtiva=1;render()">D1</button>
<button onclick="duziaAtiva=2;render()">D2</button>
<button onclick="duziaAtiva=3;render()">D3</button>
<div id="duziaBox"></div>
</div>

<div style="border:1px solid #555;padding:8px;margin:10px 0">
<b>COLUNAS</b><br>
<button onclick="colunaAtiva=1;render()">C1</button>
<button onclick="colunaAtiva=2;render()">C2</button>
<button onclick="colunaAtiva=3;render()">C3</button>
<div id="colunaBox"></div>
</div>

<div id="nums"
     style="display:grid;grid-template-columns:repeat(9,1fr);
            gap:6px;margin-top:12px">
</div>

</div>
`;

for(let n=0;n<=36;n++){
  const b=document.createElement("button");
  b.textContent=n;
  b.style="padding:8px;background:#333;color:#fff";
  b.onclick=()=>add(n);
  nums.appendChild(b);
}

function render(){

  tl.innerHTML = timeline.map((n,i)=>{
    const r = estruturalRes[i];
    let cor = "#aaa";
    if(r==="V") cor="#00e676";
    if(r==="R") cor="#9c27b0";
    if(r==="X") cor="#ff5252";
    return `<span style="color:${cor}">${n}</span>`;
  }).join(" · ");

  estruturaBox.innerHTML = `
  <b>Núcleo (C1–C5)</b><br>
  ${estruturalCentros.join(" , ")}
  <br><br>
  <b>C6 Ruptura</b><br>
  <span style="color:#9c27b0">${estruturalC6}</span>
  `;

  const zona = estruturalCentros.flatMap(c=>vizinhos2(c));

  duziaBox.innerHTML = duziaAtiva
    ? zona.filter(filtrarPorDuzia).join(" , ")
    : "";

  colunaBox.innerHTML = colunaAtiva
    ? zona.filter(filtrarPorColuna).join(" , ")
    : "";
}

gerarEstrutural();
render();

})();
