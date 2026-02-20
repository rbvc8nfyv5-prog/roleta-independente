(function(){

/* ================= CONFIG BASE ================= */

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

let mostrarSimulacao = false;

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

/* ================= DIREÇÃO ALTERNADA ================= */

function deslocDirecional(a,b,index){
  const size = 37;
  let ia = track.indexOf(a);
  let ib = track.indexOf(b);
  let d = ib - ia;

  if(d > size/2) d -= size;
  if(d < -size/2) d += size;

  if(index % 2 === 1){
    d = -d;
  }

  return d;
}

/* ================= GERADOR ESTRUTURAL ================= */

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

  /* ===== Permanência ===== */
  const freq = {};
  timeline.forEach(n=>freq[n]=(freq[n]||0)+1);

  /* ===== Calor ===== */
  const freqViz = {};
  timeline.forEach(n=>{
    vizinhos2(n).forEach(v=>{
      freqViz[v]=(freqViz[v]||0)+1;
    });
  });

  /* ===== Salto médio ===== */
  let saltoMedio = 0;
  for(let i=0;i<timeline.length-1;i++){
    saltoMedio += dist(timeline[i],timeline[i+1]);
  }
  saltoMedio = timeline.length>1 ? saltoMedio/(timeline.length-1) : 0;

  /* ===== Direcional ===== */
  let somaDir = 0;
  let totalDir = 0;

  for(let i=0;i<timeline.length-1;i++){
    somaDir += deslocDirecional(
      timeline[i+1],
      timeline[i],
      i
    );
    totalDir++;
  }

  const mediaDirecional = totalDir ? somaDir/totalDir : 0;

  /* ===== Score ===== */

  const candidatos = track.map(n=>{

    const permanencia = freq[n] || 0;
    const calor = freqViz[n] || 0;

    const alinhamento =
      timeline.length
        ? Math.abs(
            deslocDirecional(
              timeline[0],
              n,
              0
            ) - mediaDirecional
          )
        : 0;

    const espalhamento =
      centros.length
        ? centros.reduce((acc,c)=>acc+dist(c,n),0)/centros.length
        : 0;

    const score =
      (permanencia * 1.2)
    + (calor * 1.0)
    + ((10 - Math.abs(saltoMedio - espalhamento)) * 1.1)
    + ((10 - alinhamento) * 0.8);

    return {n,score};
  })
  .sort((a,b)=>b.score-a.score)
  .map(x=>x.n);

  for(const n of candidatos){
    if(pode(n)) registrar(n);
    if(centros.length>=5) break;
  }

  /* ===== C6 Ruptura ===== */

  let melhorScore = -1;
  let melhorC6 = null;

  track.forEach(n=>{
    if(centros.includes(n)) return;

    const dMedia = centros.reduce((acc,c)=>acc+dist(c,n),0)/centros.length;
    const score = dMedia + Math.random();

    if(score > melhorScore){
      melhorScore = score;
      melhorC6 = n;
    }
  });

  estruturalCentros = centros;
  estruturalC6 = melhorC6;
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
<div style="max-width:1000px;margin:auto;padding:10px">

<h3>CSM Estrutural</h3>

<div>
🕒 Timeline:
<div id="tl" style="font-weight:600;font-size:18px"></div>
</div>

<div style="margin:10px 0">
<button id="toggleSim">Mostrar Simulação</button>
<button id="limpar">Limpar</button>
</div>

<div id="simArea" style="display:none;margin-bottom:10px"></div>

<div id="estruturaBox"
     style="border:1px solid #555;padding:10px;margin:10px 0">
</div>

<div id="nums"
     style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px">
</div>

</div>
`;

/* ===== Botões Numéricos ===== */

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
  if(timeline.length>50) timeline.pop();

  gerarEstrutural();
  render();
}

/* ================= RENDER ================= */

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

  if(mostrarSimulacao){

    const total = estruturalRes.length;
    const v = estruturalRes.filter(x=>x==="V").length;
    const r = estruturalRes.filter(x=>x==="R").length;

    const taxa = total ? ((v+r)/total*100).toFixed(1) : 0;

    simArea.innerHTML = `
      <b>Simulação Interna</b><br>
      Total: ${total}<br>
      Vitórias núcleo: ${v}<br>
      Ruptura: ${r}<br>
      Assertividade: ${taxa}%
    `;
  }
}

/* ================= CONTROLES ================= */

toggleSim.onclick=()=>{
  mostrarSimulacao = !mostrarSimulacao;
  simArea.style.display = mostrarSimulacao?"block":"none";
  render();
};

limpar.onclick=()=>{
  timeline=[];
  estruturalRes=[];
  estruturalCentros=[];
  estruturalC6=null;
  render();
};

gerarEstrutural();
render();

})();
