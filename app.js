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

let horarioRes = [];
let antiRes = [];

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

function vizinho1(n){
  const i = track.indexOf(n);
  return [
    track[(i-1+37)%37],
    track[(i+1)%37]
  ];
}

function vizinhos1Completo(n){
  const i = track.indexOf(n);
  return [
    track[(i-1+37)%37],
    n,
    track[(i+1)%37]
  ];
}

/* ================= MOTOR BASE ================= */

function gerarEstruturalBase(lista){

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
  lista.forEach(n=>freq[n]=(freq[n]||0)+1);

  const candidatos = track.map(n=>{
    return {n,score:freq[n]||0};
  })
  .sort((a,b)=>b.score-a.score)
  .map(x=>x.n);

  for(const n of candidatos){
    if(pode(n)) registrar(n);
    if(centros.length>=5) break;
  }

  while(centros.length<5){
    const extra = track.find(n=>pode(n));
    if(!extra) break;
    registrar(extra);
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

  return {centros,ruptura:melhorC6};
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
🕒 Timeline Base:
<div id="tlBase" style="font-weight:600;font-size:18px"></div>
</div>

<div style="margin-top:10px">
🟢 Timeline Horário (±1):
<div id="tlHorario" style="font-weight:600;font-size:18px"></div>
</div>

<div style="margin-top:10px">
🔵 Timeline Anti (±1):
<div id="tlAnti" style="font-weight:600;font-size:18px"></div>
</div>

<div id="estruturaBox"
     style="border:1px solid #555;padding:10px;margin:10px 0">
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

  // BASE
  if(estruturalCentros.length){

    if(estruturalCentros.some(c=>vizinhos2(c).includes(n))){
      estruturalRes.unshift("V");
    } else if(estruturalC6 && vizinhos2(estruturalC6).includes(n)){
      estruturalRes.unshift("R");
    } else {
      estruturalRes.unshift("X");
    }

  }

  timeline.unshift(n);

  const base = gerarEstruturalBase(timeline);
  estruturalCentros = base.centros;
  estruturalC6 = base.ruptura;

  /* ===== SIMULAÇÕES ===== */

  if(timeline.length){

    const ultimo = timeline[0];
    const v = vizinhos1Completo(ultimo);

    const horario = gerarEstruturalBase(v);
    const anti = gerarEstruturalBase([v[2],v[1],v[0]]);

    // validação ±1 apenas

    const validHorario =
      horario.centros.some(c=>vizinho1(c).includes(n)) ||
      (horario.ruptura && vizinho1(horario.ruptura).includes(n));

    const validAnti =
      anti.centros.some(c=>vizinho1(c).includes(n)) ||
      (anti.ruptura && vizinho1(anti.ruptura).includes(n));

    horarioRes.unshift(validHorario?"V":"X");
    antiRes.unshift(validAnti?"V":"X");
  }

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

limpar.onclick=()=>{
  timeline=[];
  estruturalRes=[];
  horarioRes=[];
  antiRes=[];
  estruturalCentros=[];
  estruturalC6=null;
  render();
};

/* ================= RENDER ================= */

function render(){

  const ult = timeline.slice(0,14);

  function pintar(resArray,id){
    document.getElementById(id).innerHTML =
      ult.map((n,i)=>{
        const r = resArray[i];
        const cor = r==="V"?"#00e676":"#ff5252";
        return `<span style="color:${cor}">${n}</span>`;
      }).join(" · ");
  }

  pintar(estruturalRes,"tlBase");
  pintar(horarioRes,"tlHorario");
  pintar(antiRes,"tlAnti");

  estruturaBox.innerHTML = `
    <b>Núcleo (C1–C5)</b><br>
    ${estruturalCentros.join(" , ")}
    <br><br>
    <b>C6 Ruptura</b><br>
    <span style="color:#9c27b0">${estruturalC6}</span>
  `;
}

render();

})();
