(function(){

const track = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

let timeline = [];
let resultados = [];

let C = [];
let R1=null,R2=null,R3=null;

let usarR1=true, usarR2=true, usarR3=true;

function distIndex(a,b){
  let d = b-a;
  if(d<0) d+=37;
  return d;
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

/* ================= GERAR NÚCLEO ================= */

function gerarEstrutural(){

  const usados = new Set();
  C=[];

  function pode(n){
    return vizinhos2(n).every(x=>!usados.has(x));
  }

  function registrar(n){
    vizinhos2(n).forEach(x=>usados.add(x));
    C.push(n);
  }

  const freq={};
  timeline.forEach(n=>freq[n]=(freq[n]||0)+1);

  const candidatos = track
    .map(n=>({n,score:freq[n]||0}))
    .sort((a,b)=>b.score-a.score)
    .map(x=>x.n);

  for(const n of candidatos){
    if(pode(n)) registrar(n);
    if(C.length>=5) break;
  }

  gerarRupturas();
}

/* ================= RUPTURA POR BURACO REAL ================= */

function gerarRupturas(){

  if(C.length<2){
    R1=R2=R3=null;
    return;
  }

  const indices = C.map(n=>track.indexOf(n)).sort((a,b)=>a-b);

  const lacunas=[];

  for(let i=0;i<indices.length;i++){
    const atual = indices[i];
    const prox = indices[(i+1)%indices.length];

    const tamanho = distIndex(atual,prox);
    lacunas.push({
      inicio:atual,
      tamanho:tamanho
    });
  }

  lacunas.sort((a,b)=>b.tamanho-a.tamanho);

  function meio(lac){
    const meioIndex = (lac.inicio + Math.floor(lac.tamanho/2)) % 37;
    return track[meioIndex];
  }

  R1 = lacunas[0] ? meio(lacunas[0]) : null;
  R2 = lacunas[1] ? meio(lacunas[1]) : null;
  R3 = lacunas[2] ? meio(lacunas[2]) : null;
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

document.body.innerHTML=`
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
</div>

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

function add(n){

  if(dentroNucleo(n)){
    resultados.unshift("C");
  } else {
    const r=dentroR(n);
    if(r) resultados.unshift(r);
    else resultados.unshift("X");
  }

  timeline.unshift(n);
  gerarEstrutural();
  render();
}

colar.onclick=()=>{
  const lista=inp.value.split(/[\s,]+/)
    .map(Number)
    .filter(n=>n>=0 && n<=36);

  lista.forEach(n=>add(n));
  inp.value="";
};

limpar.onclick=()=>{
  timeline=[];
  resultados=[];
  C=[];
  R1=R2=R3=null;
  render();
};

btnR1.onclick=()=>{usarR1=!usarR1; render();}
btnR2.onclick=()=>{usarR2=!usarR2; render();}
btnR3.onclick=()=>{usarR3=!usarR3; render();}

function render(){

  const ult14=timeline.slice(0,14);
  const ultRes=resultados.slice(0,14);

  tl.innerHTML = ult14.map((n,i)=>{
    const r=ultRes[i];
    let cor="#aaa";
    if(r==="C") cor="#00e676";
    if(r==="R1") cor="#ce93d8";
    if(r==="R2") cor="#ab47bc";
    if(r==="R3") cor="#6a1b9a";
    if(r==="X") cor="#ff5252";
    return `<span style="color:${cor}">${n}</span>`;
  }).join(" · ");

  estruturaBox.innerHTML=`
  <b>Núcleo:</b> ${C.join(" , ")}<br><br>
  <b>R1:</b> ${R1 || "-"}<br>
  <b>R2:</b> ${R2 || "-"}<br>
  <b>R3:</b> ${R3 || "-"}
  `;
}

gerarEstrutural();
render();

})();
