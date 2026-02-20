(function(){

const track = [
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

const terminal = n => n % 10;

let timeline=[];
let estruturalCentros=[];
let estruturalC6=null;
let estruturalRes=[];
let filtroRes=[];

let duziasAtivas=new Set();
let colunasAtivas=new Set();

function duzia(n){
  if(n>=1&&n<=12) return 1;
  if(n>=13&&n<=24) return 2;
  if(n>=25&&n<=36) return 3;
  return 0;
}

function coluna(n){
  if(n===0) return 0;
  return ((n-1)%3)+1;
}

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

function dentroNucleo(n){
  return estruturalCentros.some(c=>vizinhos2(c).includes(n));
}

function dentroC6(n){
  return estruturalC6 && vizinhos2(estruturalC6).includes(n);
}

function gerarEstrutural(){

  const usados=new Set();
  const centros=[];

  function pode(n){
    return vizinhos2(n).every(x=>!usados.has(x));
  }

  function registrar(n){
    vizinhos2(n).forEach(x=>usados.add(x));
    centros.push(n);
  }

  const freq={};
  timeline.forEach(n=>freq[n]=(freq[n]||0)+1);

  const candidatos=Object.entries(freq)
    .sort((a,b)=>b[1]-a[1])
    .map(x=>+x[0]);

  for(const n of candidatos){
    if(pode(n)) registrar(n);
    if(centros.length>=5) break;
  }

  while(centros.length<5){
    const extra=track.find(n=>pode(n));
    if(!extra) break;
    registrar(extra);
  }

  estruturalCentros=centros;

  estruturalC6=track.find(n=>!centros.includes(n));
}

function add(n){

  // valida estrutural
  if(dentroNucleo(n)){
    estruturalRes.unshift("V");
  } else if(dentroC6(n)){
    estruturalRes.unshift("R");
  } else {
    estruturalRes.unshift("X");
  }

  // valida filtro D/C
  if(
    (duziasAtivas.size>0 || colunasAtivas.size>0) &&
    dentroNucleo(n)
  ){
    const okD = duziasAtivas.size===0 || duziasAtivas.has(duzia(n));
    const okC = colunasAtivas.size===0 || colunasAtivas.has(coluna(n));

    if(okD && okC){
      filtroRes.unshift("V");
    } else {
      filtroRes.unshift("X");
    }
  } else {
    filtroRes.unshift("-");
  }

  timeline.unshift(n);
  if(timeline.length>14) timeline.pop();

  gerarEstrutural();
  render();
}

document.body.style.background="#111";
document.body.style.color="#fff";
document.body.style.fontFamily="sans-serif";

document.body.innerHTML=`
<div style="max-width:1000px;margin:auto;padding:10px">

<h3>Estrutural + Dúzias/Colunas</h3>

<div>🕒 Timeline Estrutural:<div id="tl"></div></div>
<div style="margin-top:6px">🕒 Timeline Filtro:<div id="tlFiltro"></div></div>

<div id="estruturaBox" style="border:1px solid #555;padding:10px;margin:10px 0"></div>

<div>
<b>Dúzias:</b><br>
<button id="D1" onclick="toggleD(1)">D1</button>
<button id="D2" onclick="toggleD(2)">D2</button>
<button id="D3" onclick="toggleD(3)">D3</button>
<div id="duziasBox" style="margin-top:6px"></div>
</div>

<div style="margin-top:10px">
<b>Colunas:</b><br>
<button id="C1" onclick="toggleC(1)">C1</button>
<button id="C2" onclick="toggleC(2)">C2</button>
<button id="C3" onclick="toggleC(3)">C3</button>
<div id="colunasBox" style="margin-top:6px"></div>
</div>

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

window.toggleD=function(d){
  duziasAtivas.has(d)?duziasAtivas.delete(d):duziasAtivas.add(d);
  render();
}

window.toggleC=function(c){
  colunasAtivas.has(c)?colunasAtivas.delete(c):colunasAtivas.add(c);
  render();
}

function render(){

  tl.innerHTML=timeline.map((n,i)=>{
    const r=estruturalRes[i];
    let cor="#aaa";
    if(r==="V") cor="#00e676";
    if(r==="R") cor="#9c27b0";
    if(r==="X") cor="#ff5252";
    return `<span style="color:${cor}">${n}</span>`;
  }).join(" · ");

  tlFiltro.innerHTML=timeline.map((n,i)=>{
    const r=filtroRes[i];
    let cor="#666";
    if(r==="V") cor="#00e676";
    if(r==="X") cor="#ff5252";
    return `<span style="color:${cor}">${n}</span>`;
  }).join(" · ");

  estruturaBox.innerHTML=`
  <b>Núcleo</b><br>${estruturalCentros.join(", ")}
  <br><br>
  <b>C6</b><br><span style="color:#9c27b0">${estruturalC6}</span>
  `;

  const coresD={1:"#2196f3",2:"#ff9800",3:"#4caf50"};
  const coresC={1:"#e91e63",2:"#00bcd4",3:"#ffc107"};

  [1,2,3].forEach(d=>{
    const btn=document.getElementById("D"+d);
    if(duziasAtivas.has(d)){
      btn.style.background=coresD[d];
      btn.style.color="#000";
    } else {
      btn.style.background="#333";
      btn.style.color="#fff";
    }
  });

  [1,2,3].forEach(c=>{
    const btn=document.getElementById("C"+c);
    if(colunasAtivas.has(c)){
      btn.style.background=coresC[c];
      btn.style.color="#000";
    } else {
      btn.style.background="#333";
      btn.style.color="#fff";
    }
  });
}

gerarEstrutural();
render();

})();
