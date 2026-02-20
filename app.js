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
let rupturas = [];
let rupturaSelecionada = 1;
let estruturalRes = [];

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

/* ================= GERADOR ================= */

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

  const candidatos = track
    .map(n=>({n,score:freq[n]||0}))
    .sort((a,b)=>b.score-a.score)
    .map(x=>x.n);

  for(const n of candidatos){
    if(pode(n)) registrar(n);
    if(centros.length>=5) break;
  }

  estruturalCentros = centros;

  /* ===== GERAR 3 RUPTURAS ===== */

  const rupturaScores = [];

  track.forEach(n=>{
    if(centros.includes(n)) return;
    const dMedia = centros.reduce((acc,c)=>acc+dist(c,n),0)/centros.length;
    rupturaScores.push({n,score:dMedia});
  });

  rupturaScores.sort((a,b)=>b.score-a.score);

  rupturas = rupturaScores.slice(0,3).map(x=>x.n);
}

/* ================= VALIDAÇÃO ================= */

function dentroNucleo(n){
  return estruturalCentros.some(c=>vizinhos2(c).includes(n));
}

function dentroRuptura(n){
  const r = rupturas[rupturaSelecionada-1];
  return r !== undefined && vizinhos2(r).includes(n);
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
<b>Núcleo (C1–C5)</b>
<div id="centros"></div>
</div>

<div style="margin:10px 0">
<b>Rupturas</b><br>
<button id="r1">R1</button>
<button id="r2">R2</button>
<button id="r3">R3</button>
<div id="rupturasBox"></div>
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

/* ================= BOTÕES RUPTURA ================= */

r1.onclick=()=>{ rupturaSelecionada=1; render(); };
r2.onclick=()=>{ rupturaSelecionada=2; render(); };
r3.onclick=()=>{ rupturaSelecionada=3; render(); };

/* ================= ADD ================= */

function add(n){

  if(dentroNucleo(n)){
    estruturalRes.unshift("V");
  } else if(dentroRuptura(n)){
    estruturalRes.unshift("R");
  } else {
    estruturalRes.unshift("X");
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

limpar.onclick=()=>{
  timeline=[];
  estruturalRes=[];
  estruturalCentros=[];
  rupturas=[];
  render();
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

  centros.innerHTML = estruturalCentros.join(" , ");

  rupturasBox.innerHTML = rupturas.map((r,i)=>{
    const ativo = (i+1)===rupturaSelecionada;
    return `
      <div style="
        color:${ativo?"#9c27b0":"#aaa"};
        font-weight:${ativo?"700":"400"};
      ">
        R${i+1}: ${r}
      </div>
    `;
  }).join("");

}

gerarEstrutural();
render();

})();
