(function(){

const track = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

let timeline = [];
let estruturalRes = [];

function dist(a,b){
  const ia = track.indexOf(a);
  const ib = track.indexOf(b);
  const d = Math.abs(ia-ib);
  return Math.min(d,37-d);
}

function vizinhos1(n){
  const i = track.indexOf(n);
  return [track[(i-1+37)%37], n, track[(i+1)%37]];
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

/* ================= MOTOR BASE COM MODO ================= */

function gerarEstruturalModo(modo){

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

  const freqViz = {};
  timeline.forEach(n=>{
    vizinhos2(n).forEach(v=>{
      freqViz[v]=(freqViz[v]||0)+1;
    });
  });

  function deslocDirecional(a,b,index){

    let ia = track.indexOf(a);
    let ib = track.indexOf(b);
    let d = ib - ia;

    if(d > 18) d -= 37;
    if(d < -18) d += 37;

    if(modo==="BASE"){
      if(index % 2 === 1) d = -d;
    }

    if(modo==="H"){
      if(d < 0) d += 37;
    }

    if(modo==="A"){
      if(d > 0) d -= 37;
    }

    return d;
  }

  let saltoMedio = 0;
  for(let i=0;i<timeline.length-1;i++){
    saltoMedio += dist(timeline[i],timeline[i+1]);
  }
  saltoMedio = timeline.length>1
    ? saltoMedio/(timeline.length-1)
    : 0;

  let somaDir = 0;
  for(let i=0;i<timeline.length-1;i++){
    somaDir += deslocDirecional(
      timeline[i+1],
      timeline[i],
      i
    );
  }

  const mediaDirecional =
    timeline.length>1
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
            ) - mediaDirecional
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
    if(centros.length>=5) break;
  }

  let melhorScore = -1;
  let melhorC6 = null;

  track.forEach(n=>{
    if(centros.includes(n)) return;
    const dMedia =
      centros.reduce((acc,c)=>acc+dist(c,n),0)
      / centros.length;

    if(dMedia > melhorScore){
      melhorScore = dMedia;
      melhorC6 = n;
    }
  });

  return {
    centros,
    c6: melhorC6
  };
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
🕒 Timeline:
<div id="tl" style="font-weight:600;font-size:18px"></div>
</div>

<div id="painelBase"
     style="border:1px solid #555;padding:10px;margin:10px 0">
</div>

<div style="display:flex;gap:10px">

<div id="painelHorario"
     style="flex:1;border:1px solid #444;padding:10px">
</div>

<div id="painelAnti"
     style="flex:1;border:1px solid #444;padding:10px">
</div>

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

  const base = gerarEstruturalModo("BASE");

  if(base.centros.some(c=>vizinhos2(c).includes(n))){
    estruturalRes.unshift("V");
  } else if(vizinhos2(base.c6).includes(n)){
    estruturalRes.unshift("R");
  } else {
    estruturalRes.unshift("X");
  }

  timeline.unshift(n);
  render();
}

/* ================= COLAR ================= */

colar.onclick=()=>{
  const lista = inp.value
    .split(/[\s,]+/)
    .map(Number)
    .filter(n=>n>=0&&n<=36);

  lista.forEach(n=>add(n));
  inp.value="";
};

limpar.onclick=()=>{
  timeline=[];
  estruturalRes=[];
  render();
};

/* ================= RENDER ================= */

function render(){

  tl.innerHTML = timeline.slice(0,14).map((n,i)=>{
    const r=estruturalRes[i];
    let cor="#aaa";
    if(r==="V") cor="#00e676";
    if(r==="R") cor="#9c27b0";
    if(r==="X") cor="#ff5252";
    return `<span style="color:${cor}">${n}</span>`;
  }).join(" · ");

  const base = gerarEstruturalModo("BASE");
  const horario = gerarEstruturalModo("H");
  const anti = gerarEstruturalModo("A");

  painelBase.innerHTML = `
    <b>BASE</b><br>
    Núcleo: ${base.centros.join(" , ")}<br>
    C6: <span style="color:#9c27b0">${base.c6}</span>
  `;

  painelHorario.innerHTML = `
    <b>HORÁRIO</b><br>
    Núcleo: ${horario.centros.join(" , ")}<br>
    C6: <span style="color:#9c27b0">${horario.c6}</span>
  `;

  painelAnti.innerHTML = `
    <b>ANTI-HORÁRIO</b><br>
    Núcleo: ${anti.centros.join(" , ")}<br>
    C6: <span style="color:#9c27b0">${anti.c6}</span>
  `;
}

render();

})();
