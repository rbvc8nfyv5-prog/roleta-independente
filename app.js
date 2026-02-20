(function(){

// ================= CONFIG =================

const track = [
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

let timeline=[];
let fullHistory=[];
let estruturalCentros=[];
let estruturalC6=null;
let estruturalRes=[];

// ================= HELPERS =================

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

function dist(a,b){
  const ia=track.indexOf(a);
  const ib=track.indexOf(b);
  const d=Math.abs(ia-ib);
  return Math.min(d,37-d);
}

// ================= GERADOR AVANÇADO =================

function gerarEstrutural(){

  if(timeline.length<3) return;

  const usados=new Set();
  const centros=[];

  function pode(n){
    return vizinhos2(n).every(x=>!usados.has(x));
  }

  function registrar(n){
    vizinhos2(n).forEach(x=>usados.add(x));
    centros.push(n);
  }

  // ===== PERMANÊNCIA =====
  const freq={};
  timeline.forEach(n=>freq[n]=(freq[n]||0)+1);

  // ===== CALOR DE VIZINHO =====
  const freqViz={};
  timeline.forEach(n=>{
    vizinhos2(n).forEach(v=>{
      freqViz[v]=(freqViz[v]||0)+1;
    });
  });

  // ===== SALTOS =====
  const saltos=[];
  for(let i=0;i<timeline.length-1;i++){
    saltos.push(dist(timeline[i],timeline[i+1]));
  }

  const mediaSalto=
    saltos.length
      ? saltos.reduce((a,b)=>a+b,0)/saltos.length
      : 0;

  const variancia =
    saltos.length
      ? saltos.reduce((a,b)=>a+Math.pow(b-mediaSalto,2),0)/saltos.length
      : 0;

  const desvio = Math.sqrt(variancia);

  // ===== TENDÊNCIA EXPANSÃO =====

  const recentes = saltos.slice(0,5);
  const antigos = saltos.slice(5,10);

  const mediaRecente =
    recentes.length
      ? recentes.reduce((a,b)=>a+b,0)/recentes.length
      : 0;

  const mediaAntiga =
    antigos.length
      ? antigos.reduce((a,b)=>a+b,0)/antigos.length
      : 0;

  const expandindo = mediaRecente > mediaAntiga;

  // ===== MUDANÇA DE REGIME =====

  const regimeMudou =
    Math.abs(mediaRecente-mediaSalto) > (desvio*0.8);

  // ===== PESOS DINÂMICOS =====

  let pesoPermanencia = 1.2;
  let pesoCalor = 1.0;
  let pesoEspalhamento = 1.1;
  let pesoRuptura = 1.0;

  if(expandindo){
    pesoRuptura += 0.6;
    pesoEspalhamento += 0.4;
  }

  if(regimeMudou){
    pesoPermanencia *= 0.7;
    pesoCalor *= 0.8;
    pesoEspalhamento *= 1.3;
  }

  // ===== SCORE =====

  const candidatos = track.map(n=>{

    const permanencia=freq[n]||0;
    const calor=freqViz[n]||0;

    const espalhamento =
      centros.length
        ? centros.reduce((a,c)=>a+dist(c,n),0)/centros.length
        : mediaSalto;

    const score =
      (permanencia*pesoPermanencia)+
      (calor*pesoCalor)+
      ((10-Math.abs(mediaSalto-espalhamento))*pesoEspalhamento);

    return {n,score};
  })
  .sort((a,b)=>b.score-a.score)
  .map(x=>x.n);

  for(const n of candidatos){
    if(pode(n)) registrar(n);
    if(centros.length>=5) break;
  }

  // ===== C6 RUPTURA ADAPTATIVA =====

  let melhor=-1;
  let c6=null;

  track.forEach(n=>{
    if(centros.includes(n)) return;

    const dMedia=
      centros.reduce((a,c)=>a+dist(c,n),0)/centros.length;

    const scoreRuptura =
      dMedia*pesoRuptura;

    if(scoreRuptura>melhor){
      melhor=scoreRuptura;
      c6=n;
    }
  });

  estruturalCentros=centros;
  estruturalC6=c6;
}

// ================= VALIDAÇÃO =================

function dentroNucleo(n){
  return estruturalCentros.some(c=>vizinhos2(c).includes(n));
}

function dentroRuptura(n){
  return estruturalC6!==null && vizinhos2(estruturalC6).includes(n);
}

// ================= UI =================

document.body.style.background="#111";
document.body.style.color="#fff";
document.body.style.fontFamily="sans-serif";

document.body.innerHTML=`
<div style="max-width:1000px;margin:auto;padding:10px">

<h3>CSM Adaptativo Completo</h3>

<div>
Histórico:
<input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
<button id="col">Colar</button>
<button id="lim">Limpar</button>
</div>

<div style="margin-top:10px">
🕒 Timeline (14):<br>
<div id="tl"></div>
</div>

<div id="estruturaBox" style="border:1px solid #555;padding:10px;margin:10px 0"></div>

<div id="stats" style="margin:10px 0"></div>

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

// ================= FUNÇÕES =================

function atualizarStats(){

  let win=0;
  let ruptura=0;
  let loss=0;

  estruturalRes.forEach(r=>{
    if(r==="V") win++;
    else if(r==="R") ruptura++;
    else loss++;
  });

  const total=win+ruptura+loss;
  const perc = total?((win+ruptura)/total*100).toFixed(1):0;

  stats.innerHTML=`
  WIN Núcleo: ${win}<br>
  WIN Ruptura: ${ruptura}<br>
  LOSS: ${loss}<br>
  Assertividade Total: ${perc}%<br>
  `;
}

function add(n){

  fullHistory.unshift(n);

  if(dentroNucleo(n)) estruturalRes.unshift("V");
  else if(dentroRuptura(n)) estruturalRes.unshift("R");
  else estruturalRes.unshift("X");

  timeline.unshift(n);
  if(timeline.length>14) timeline.pop();

  gerarEstrutural();
  render();
}

col.onclick=()=>{
  const arr = inp.value.split(/[\s,]+/)
    .map(Number)
    .filter(n=>n>=0&&n<=36);

  arr.reverse().forEach(add);
  inp.value="";
};

lim.onclick=()=>{
  timeline=[];
  fullHistory=[];
  estruturalRes=[];
  estruturalCentros=[];
  estruturalC6=null;
  render();
};

function render(){

  tl.innerHTML =
    timeline.map((n,i)=>{
      const r=estruturalRes[i];
      let cor="#aaa";
      if(r==="V") cor="#00e676";
      if(r==="R") cor="#9c27b0";
      if(r==="X") cor="#ff5252";
      return `<span style="color:${cor}">${n}</span>`;
    }).join(" · ");

  estruturaBox.innerHTML=`
  <b>Núcleo:</b><br>
  ${estruturalCentros.join(" , ")}<br><br>
  <b>C6 Ruptura:</b><br>
  <span style="color:#9c27b0">${estruturalC6}</span>
  `;

  atualizarStats();
}

render();

})();
