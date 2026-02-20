(function () {

const track = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

const terminal = n => n % 10;

let timeline = [];
let historicoCompleto = [];
let estruturalCentros = [];
let estruturalC6 = null;
let estruturalRes = [];

let stats = {
  win:0,
  ruptura:0,
  erro:0
};

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

  // Permanência
  const freq = {};
  timeline.forEach(n=>freq[n]=(freq[n]||0)+1);

  // Calor
  const freqViz = {};
  timeline.forEach(n=>{
    vizinhos2(n).forEach(v=>{
      freqViz[v]=(freqViz[v]||0)+1;
    });
  });

  // Salto médio
  let saltoMedio = 0;
  for(let i=0;i<timeline.length-1;i++){
    saltoMedio += dist(timeline[i],timeline[i+1]);
  }
  saltoMedio = timeline.length>1 ? saltoMedio/(timeline.length-1) : 0;

  const candidatos = track.map(n=>{

    const permanencia = freq[n] || 0;
    const calor = freqViz[n] || 0;

    const espalhamento =
      centros.length
        ? centros.reduce((acc,c)=>acc+dist(c,n),0)/centros.length
        : 0;

    const score =
      (permanencia * 1.2)
    + (calor * 1.0)
    + ((10 - Math.abs(saltoMedio - espalhamento)) * 1.1);

    return {n,score};
  })
  .sort((a,b)=>b.score-a.score)
  .map(x=>x.n);

  for(const n of candidatos){
    if(pode(n)) registrar(n);
    if(centros.length>=5) break;
  }

  // C6 ruptura
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

  estruturalCentros = centros;
  estruturalC6 = melhorC6;
}

function dentroNucleo(n){
  return estruturalCentros.some(c=>vizinhos2(c).includes(n));
}

function dentroRuptura(n){
  return estruturalC6!==null && vizinhos2(estruturalC6).includes(n);
}

function add(n){

  historicoCompleto.push(n);

  if(dentroNucleo(n)){
    estruturalRes.unshift("V");
    stats.win++;
  } else if(dentroRuptura(n)){
    estruturalRes.unshift("R");
    stats.ruptura++;
  } else {
    estruturalRes.unshift("X");
    stats.erro++;
  }

  timeline.unshift(n);
  if(timeline.length>14) timeline.pop();

  gerarEstrutural();
  render();
}

document.body.style.background="#111";
document.body.style.color="#fff";
document.body.style.fontFamily="sans-serif";

document.body.innerHTML = `
<div style="max-width:1000px;margin:auto;padding:10px">

<h3>CSM Estrutural Estável</h3>

<div>
  Histórico:
  <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
  <button id="col">Colar</button>
  <button id="lim">Limpar</button>
</div>

<br>

<div>🕒 Timeline (14):<div id="tl"></div></div>

<br>

<div id="estruturaBox" style="border:1px solid #555;padding:10px;margin:10px 0"></div>

<div id="statsBox" style="margin-top:10px"></div>

<div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>

</div>
`;

for(let n=0;n<=36;n++){
  const b=document.createElement("button");
  b.textContent=n;
  b.style="padding:8px;background:#333;color:#fff;border:1px solid #444";
  b.onclick=()=>add(n);
  nums.appendChild(b);
}

col.onclick=()=>{
  inp.value.split(/[\s,]+/)
    .map(Number)
    .filter(n=>n>=0&&n<=36)
    .forEach(add);
  inp.value="";
};

lim.onclick=()=>{
  timeline=[];
  historicoCompleto=[];
  estruturalRes=[];
  stats={win:0,ruptura:0,erro:0};
  gerarEstrutural();
  render();
};

function render(){

  tl.innerHTML = timeline.map((n,i)=>{
    const r = estruturalRes[i];
    let cor="#aaa";
    if(r==="V") cor="#00e676";
    if(r==="R") cor="#9c27b0";
    if(r==="X") cor="#ff5252";
    return `<span style="color:${cor}">${n}</span>`;
  }).join(" · ");

  estruturaBox.innerHTML = `
  <b>C1–C5 Núcleo</b><br>
  ${estruturalCentros.join(" , ")}
  <br><br>
  <b>C6 Ruptura</b><br>
  <span style="color:#9c27b0">${estruturalC6}</span>
  `;

  const total = stats.win + stats.ruptura + stats.erro;
  const winPct = total?((stats.win/total)*100).toFixed(1):0;

  statsBox.innerHTML = `
    Win: ${stats.win} |
    Ruptura: ${stats.ruptura} |
    Erro: ${stats.erro} |
    Assertividade Núcleo: ${winPct}%
  `;
}

gerarEstrutural();
render();

})();
