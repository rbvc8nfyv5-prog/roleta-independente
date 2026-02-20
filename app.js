(function(){

/* ================= CONFIG ================= */

const track = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

let timeline = [];
let resultados = [];

let C = [];      // Núcleo C1–C5
let R1 = null;   // Ruptura curta
let R2 = null;   // Ruptura média
let R3 = null;   // Ruptura extrema

let usarR1 = true;
let usarR2 = true;
let usarR3 = true;

let mostrarSim = false;

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

/* ================= GERADOR ================= */

function gerarEstrutural(){

  const usados = new Set();
  C = [];

  function pode(n){
    return vizinhos2(n).every(x=>!usados.has(x));
  }

  function registrar(n){
    vizinhos2(n).forEach(x=>usados.add(x));
    C.push(n);
  }

  const freq = {};
  timeline.forEach(n=>freq[n]=(freq[n]||0)+1);

  const freqViz = {};
  timeline.forEach(n=>{
    vizinhos2(n).forEach(v=>{
      freqViz[v]=(freqViz[v]||0)+1;
    });
  });

  let somaDir = 0;
  for(let i=0;i<timeline.length-1;i++){
    somaDir += deslocDirecional(
      timeline[i+1],
      timeline[i],
      i
    );
  }

  const mediaDir = timeline.length>1
    ? somaDir/(timeline.length-1)
    : 0;

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
            ) - mediaDir
          )
        : 0;

    const score =
      (permanencia * 1.2)
    + (calor * 1.0)
    + ((10 - alinhamento) * 0.8);

    return {n,score};
  })
  .sort((a,b)=>b.score-a.score)
  .map(x=>x.n);

  for(const n of candidatos){
    if(pode(n)) registrar(n);
    if(C.length>=5) break;
  }

  gerarRupturas();
}

/* ================= RUPTURAS ================= */

function gerarRupturas(){

  const foraNucleo = track.filter(n=>!C.includes(n));

  function mediaDist(n){
    return C.reduce((acc,c)=>acc+dist(c,n),0)/C.length;
  }

  // R1 curta (3–6)
  R1 = foraNucleo
    .filter(n=>{
      const d = mediaDist(n);
      return d>=3 && d<=6;
    })
    .sort((a,b)=>mediaDist(a)-mediaDist(b))[0] || null;

  // R2 média (7–12)
  R2 = foraNucleo
    .filter(n=>{
      const d = mediaDist(n);
      return d>=7 && d<=12;
    })
    .sort((a,b)=>mediaDist(a)-mediaDist(b))[0] || null;

  // R3 extrema (>12)
  R3 = foraNucleo
    .filter(n=>mediaDist(n)>12)
    .sort((a,b)=>mediaDist(b)-mediaDist(a))[0] || null;
}

/* ================= VALIDAÇÃO ================= */

function dentroNucleo(n){
  return C.some(c=>vizinhos2(c).includes(n));
}

function dentroR(n){
  if(usarR1 && R1 && vizinhos2(R1).includes(n)) return "R1";
  if(usarR2 && R2 && vizinhos2(R2).includes(n)) return "R2";
  if(usarR3 && R3 && vizinhos2(R3).includes(n)) return "R3";
  return null;
}

/* ================= UI ================= */

document.body.style.background="#111";
document.body.style.color="#fff";
document.body.style.fontFamily="sans-serif";

document.body.innerHTML = `
<div style="max-width:1000px;margin:auto;padding:10px">

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

<div style="margin:10px 0">
<button id="btnR1">R1</button>
<button id="btnR2">R2</button>
<button id="btnR3">R3</button>
<button id="toggleSim">Simulação</button>
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
    resultados.unshift("C");
  } else {
    const r = dentroR(n);
    if(r) resultados.unshift(r);
    else resultados.unshift("X");
  }

  timeline.unshift(n);

  gerarEstrutural();
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

  const ult14 = timeline.slice(0,14);
  const ultRes = resultados.slice(0,14);

  tl.innerHTML = ult14.map((n,i)=>{
    const r = ultRes[i];
    let cor = "#aaa";

    if(r==="C") cor="#00e676";
    if(r==="R1") cor="#b39ddb";
    if(r==="R2") cor="#7e57c2";
    if(r==="R3") cor="#4a148c";
    if(r==="X") cor="#ff5252";

    return `<span style="color:${cor}">${n}</span>`;
  }).join(" · ");

  estruturaBox.innerHTML = `
  <b>Núcleo</b><br>${C.join(" , ")}<br><br>
  <b>R1</b> ${R1 || "-"}<br>
  <b>R2</b> ${R2 || "-"}<br>
  <b>R3</b> ${R3 || "-"}
  `;

  if(mostrarSim){
    const total = resultados.length;
    const wins = resultados.filter(x=>x!=="X").length;
    const taxa = total ? ((wins/total)*100).toFixed(1) : 0;

    simArea.innerHTML = `
      Total: ${total}<br>
      Assertividade: ${taxa}%<br>
      Núcleo: ${resultados.filter(x=>x==="C").length}<br>
      R1: ${resultados.filter(x=>x==="R1").length}<br>
      R2: ${resultados.filter(x=>x==="R2").length}<br>
      R3: ${resultados.filter(x=>x==="R3").length}
    `;
  }
}

/* ================= BOTÕES ================= */

btnR1.onclick=()=>{usarR1=!usarR1; render();}
btnR2.onclick=()=>{usarR2=!usarR2; render();}
btnR3.onclick=()=>{usarR3=!usarR3; render();}

toggleSim.onclick=()=>{
  mostrarSim=!mostrarSim;
  simArea.style.display=mostrarSim?"block":"none";
  render();
};

limpar.onclick=()=>{
  timeline=[];
  resultados=[];
  C=[];
  R1=R2=R3=null;
  render();
};

gerarEstrutural();
render();

})();
