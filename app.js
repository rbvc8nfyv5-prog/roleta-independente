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
let estruturalAtivo = true;

const quadros = {
  q047: [0,4,7],
  q269: [2,6,9],
  q581: [5,8,1]
};

const coresQuadro = {
  q047: ["#00e676","#2196f3","#ff5252"],
  q269: ["#ff9800","#9c27b0","#03a9f4"],
  q581: ["#ffc107","#8bc34a","#e91e63"]
};

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

  // C6 ruptura inteligente
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

document.body.style.background="#111";
document.body.style.color="#fff";
document.body.style.fontFamily="sans-serif";

document.body.innerHTML = `
<div style="max-width:1000px;margin:auto;padding:10px">

<h3>CSM Estrutural</h3>

<div>🕒 Timeline:<div id="tl"></div></div>

<div id="estruturaBox" style="border:1px solid #555;padding:10px;margin:10px 0"></div>

<div id="q047" style="border:1px solid #555;padding:6px;margin-bottom:6px"></div>
<div id="q269" style="border:1px solid #555;padding:6px;margin-bottom:6px"></div>
<div id="q581" style="border:1px solid #555;padding:6px;margin-bottom:6px"></div>

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

  Object.entries(quadros).forEach(([id,grupo])=>{

    document.getElementById(id).innerHTML=`
      <b>${id.replace("q","")}</b><br><br>
      ${timeline.map(n=>{
        let cor = "transparent";
        grupo.forEach((t,i)=>{
          if(vizinhos2(n).some(v=>terminal(v)===t)){
            cor = coresQuadro[id][i];
          }
        });
        return `<span style="
          display:inline-block;
          width:18px;
          text-align:center;
          background:${cor};
          margin-right:2px;
        ">${n}</span>`;
      }).join("")}
    `;
  });
}

gerarEstrutural();
render();

})();
