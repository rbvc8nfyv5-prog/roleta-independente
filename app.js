(function(){

// ================= TRACK =================

const track = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

const terminal = n => n % 10;

// ================= ESTADO =================

let timeline = [];
let historicoCompleto = [];

let estruturalCentros = [];
let estruturalC6 = null;
let estruturalRes = [];

let pesos = {
  permanencia: 1.2,
  calor: 1.0,
  salto: 1.1,
  direcional: 0.8
};

let aprendizado = {
  erro:0,
  acerto:0
};

// ================= FUNÇÕES BASE =================

function dist(a,b){
  const ia = track.indexOf(a);
  const ib = track.indexOf(b);
  let d = Math.abs(ia-ib);
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

function dentroNucleo(n){
  return estruturalCentros.some(c=>vizinhos2(c).includes(n));
}

function dentroC6(n){
  return estruturalC6!==null && vizinhos2(estruturalC6).includes(n);
}

// ================= GERADOR ESTRUTURAL =================

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
  historicoCompleto.forEach(n=>freq[n]=(freq[n]||0)+1);

  const freqViz = {};
  historicoCompleto.forEach(n=>{
    vizinhos2(n).forEach(v=>{
      freqViz[v]=(freqViz[v]||0)+1;
    });
  });

  let saltoMedio = 0;
  for(let i=0;i<historicoCompleto.length-1;i++){
    saltoMedio += dist(
      historicoCompleto[i],
      historicoCompleto[i+1]
    );
  }
  saltoMedio = historicoCompleto.length>1
    ? saltoMedio/(historicoCompleto.length-1)
    : 0;

  function deslocDirecional(a,b,index){
    const size=37;
    let ia=track.indexOf(a);
    let ib=track.indexOf(b);
    let d=ib-ia;
    if(d>size/2)d-=size;
    if(d<-size/2)d+=size;
    if(index%2===1)d=-d;
    return d;
  }

  let somaDir=0;
  for(let i=0;i<historicoCompleto.length-1;i++){
    somaDir+=deslocDirecional(
      historicoCompleto[i+1],
      historicoCompleto[i],
      i
    );
  }

  const mediaDir = historicoCompleto.length>1
    ? somaDir/(historicoCompleto.length-1)
    : 0;

  const candidatos = track.map(n=>{

    const permanencia = freq[n]||0;
    const calor = freqViz[n]||0;

    const alinhamento =
      historicoCompleto.length
        ? Math.abs(
            deslocDirecional(
              historicoCompleto[0],
              n,
              0
            ) - mediaDir
          )
        : 0;

    const espalhamento =
      centros.length
        ? centros.reduce((a,c)=>a+dist(c,n),0)/centros.length
        : saltoMedio;

    const score =
      (permanencia * pesos.permanencia)
    + (calor * pesos.calor)
    + ((10 - Math.abs(saltoMedio - espalhamento)) * pesos.salto)
    + ((10 - alinhamento) * pesos.direcional);

    return {n,score};

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

  // C6 ruptura
  let melhorScore=-1;
  let melhor=null;

  track.forEach(n=>{
    if(centros.includes(n))return;

    const dMedia = centros.reduce(
      (acc,c)=>acc+dist(c,n),0
    )/centros.length;

    if(dMedia>melhorScore){
      melhorScore=dMedia;
      melhor=n;
    }
  });

  estruturalCentros=centros;
  estruturalC6=melhor;
}

// ================= APRENDIZADO =================

function ajustarPesos(acertou){

  if(acertou){
    aprendizado.acerto++;
  }else{
    aprendizado.erro++;
  }

  const total = aprendizado.acerto+aprendizado.erro;
  if(total<20) return;

  const taxaErro = aprendizado.erro/total;

  if(taxaErro>0.4){
    pesos.direcional*=0.9;
    pesos.salto*=0.9;
  }else{
    pesos.direcional*=1.02;
    pesos.salto*=1.02;
  }

  aprendizado.acerto=0;
  aprendizado.erro=0;
}

// ================= UI =================

document.body.style.background="#111";
document.body.style.color="#fff";
document.body.style.fontFamily="sans-serif";

document.body.innerHTML=`
<div style="max-width:1000px;margin:auto;padding:10px">

<h3>CSM Estrutural Adaptativo</h3>

<div>
<input id="inp" style="width:100%;padding:6px;background:#222;color:#fff">
<button id="col">Colar</button>
</div>

<div style="margin:10px 0">
🕒 Timeline:
<div id="tl"></div>
</div>

<div id="estruturaBox"
style="border:1px solid #555;padding:10px;margin:10px 0"></div>

<div id="nums"
style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px"></div>

</div>
`;

for(let n=0;n<=36;n++){
  const b=document.createElement("button");
  b.textContent=n;
  b.style="padding:8px;background:#333;color:#fff;border:1px solid #555";
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

// ================= ADD =================

function add(n){

  const acertou =
    dentroNucleo(n) || dentroC6(n);

  estruturalRes.unshift(
    acertou ? "V" : "X"
  );

  ajustarPesos(acertou);

  historicoCompleto.unshift(n);
  timeline.unshift(n);

  if(timeline.length>14) timeline.pop();

  gerarEstrutural();
  render();
}

// ================= RENDER =================

function render(){

  tl.innerHTML = timeline.map((n,i)=>{
    const r=estruturalRes[i];
    let cor="#aaa";
    if(r==="V") cor="#00e676";
    if(r==="X") cor="#ff5252";
    return `<span style="color:${cor}">${n}</span>`;
  }).join(" · ");

  estruturaBox.innerHTML=`
  <b>Núcleo C1–C5:</b><br>
  ${estruturalCentros.join(" , ")}
  <br><br>
  <b>C6 Ruptura:</b><br>
  ${estruturalC6}
  `;
}

gerarEstrutural();
render();

})();
