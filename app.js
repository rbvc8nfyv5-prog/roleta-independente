(function(){

/* ================= CONFIG BASE ================= */

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

let horarioCentros = [];
let horarioC6 = null;

let antiCentros = [];
let antiC6 = null;

/* ================= UTIL ================= */

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

/* ================= MOTOR ESTRUTURAL ================= */

function gerarMotor(baseTimeline){

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
  baseTimeline.forEach(n=>freq[n]=(freq[n]||0)+1);

  const freqViz = {};
  baseTimeline.forEach(n=>{
    vizinhos2(n).forEach(v=>{
      freqViz[v]=(freqViz[v]||0)+1;
    });
  });

  const candidatos = track.map(n=>{
    const permanencia = freq[n] || 0;
    const calor = freqViz[n] || 0;
    const score = (permanencia * 1.2) + (calor * 1.0);
    return {n,score};
  })
  .sort((a,b)=>b.score-a.score)
  .map(x=>x.n);

  for(const n of candidatos){
    if(pode(n)) registrar(n);
    if(centros.length>=5) break;
  }

  let melhorScore = -1;
  let melhorC6 = null;

  track.forEach(n=>{
    if(centros.includes(n)) return;
    const dMedia = centros.reduce((acc,c)=>acc+dist(c,n),0)/centros.length;
    if(dMedia > melhorScore){
      melhorScore = dMedia;
      melhorC6 = n;
    }
  });

  return {centros, ruptura:melhorC6};
}

/* ================= GERADORES ================= */

function gerarBase(){
  const r = gerarMotor(timeline);
  estruturalCentros = r.centros;
  estruturalC6 = r.ruptura;
}

function gerarHorarioAnti(){

  if(timeline.length === 0){
    horarioCentros = [];
    antiCentros = [];
    return;
  }

  const ultimo = timeline[0];
  const i = track.indexOf(ultimo);

  const vizEsq = track[(i-1+37)%37];
  const vizDir = track[(i+1)%37];

  const horarioBase = [vizEsq, ultimo, vizDir];
  const antiBase = [vizDir, ultimo, vizEsq];

  const h = gerarMotor(horarioBase.concat(timeline));
  const a = gerarMotor(antiBase.concat(timeline));

  horarioCentros = h.centros;
  horarioC6 = h.ruptura;

  antiCentros = a.centros;
  antiC6 = a.ruptura;
}

/* ================= VALIDAÇÃO ================= */

function dentroNucleo(n){
  return estruturalCentros.some(c=>vizinhos2(c).includes(n));
}

function dentroC6(n){
  return estruturalC6!==null && vizinhos2(estruturalC6).includes(n);
}

/* ================= UI ================= */

document.body.style.background="#111";
document.body.style.color="#fff";
document.body.style.fontFamily="sans-serif";

document.body.innerHTML = `
<div style="max-width:1100px;margin:auto;padding:10px">

<h3>CSM Estrutural</h3>

<div>
Histórico:
<input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
<button id="colar">Colar</button>
<button id="limpar">Limpar</button>
</div>

<div style="margin-top:10px">
🕒 Timeline (14):
<div id="tl" style="font-weight:600;font-size:18px"></div>
</div>

<div id="estruturaBox"
     style="border:1px solid #555;padding:10px;margin:10px 0">
</div>

<div style="display:flex;gap:20px;margin-bottom:20px">

  <div style="flex:1;border:1px solid #444;padding:10px">
    <b>HORÁRIO</b><br>
    <div id="painelHorario"></div>
  </div>

  <div style="flex:1;border:1px solid #444;padding:10px">
    <b>ANTI-HORÁRIO</b><br>
    <div id="painelAnti"></div>
  </div>

</div>

<div id="nums"
     style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px">
</div>

</div>
`;

/* ===== BOTÕES ===== */

for(let n=0;n<=36;n++){
  const b=document.createElement("button");
  b.textContent=n;
  b.style="padding:10px;background:#222;color:#fff;border:1px solid #444";
  b.onclick=()=>add(n);
  nums.appendChild(b);
}

/* ================= ADD ================= */

function add(n){

  if(dentroNucleo(n)){
    estruturalRes.unshift("V");
  } else if(dentroC6(n)){
    estruturalRes.unshift("R");
  } else {
    estruturalRes.unshift("X");
  }

  timeline.unshift(n);

  gerarBase();
  gerarHorarioAnti();
  render();
}

/* ================= COLAR ================= */

colar.onclick = ()=>{

  const lista = inp.value
    .split(/[\s,]+/)
    .map(Number)
    .filter(n=>n>=0 && n<=36);

  lista.forEach(n=>add(n));

  inp.value="";
};

/* ================= RENDER ================= */

function render(){

  const ultimos14 = timeline.slice(0,14);
  const ultRes = estruturalRes.slice(0,14);

  tl.innerHTML = ultimos14.map((n,i)=>{
    const r = ultRes[i];
    let cor = "#aaa";
    if(r==="V") cor="#00e676";
    if(r==="R") cor="#9c27b0";
    if(r==="X") cor="#ff5252";
    return `<span style="color:${cor}">${n}</span>`;
  }).join(" · ");

  estruturaBox.innerHTML = `
  <b>Núcleo Base (C1–C5)</b><br>
  ${estruturalCentros.join(" , ")}
  <br><br>
  <b>Ruptura (C6)</b><br>
  <span style="color:#9c27b0">${estruturalC6}</span>
  `;

  painelHorario.innerHTML = `
    C1–C5: ${horarioCentros.join(" , ")}<br>
    C6: <span style="color:#9c27b0">${horarioC6}</span>
  `;

  painelAnti.innerHTML = `
    C1–C5: ${antiCentros.join(" , ")}<br>
    C6: <span style="color:#9c27b0">${antiC6}</span>
  `;
}

limpar.onclick=()=>{
  timeline=[];
  estruturalRes=[];
  estruturalCentros=[];
  estruturalC6=null;
  horarioCentros=[];
  antiCentros=[];
  render();
};

gerarBase();
gerarHorarioAnti();
render();

})();
