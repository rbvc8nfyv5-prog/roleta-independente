(function(){

const track = [
32,15,19,4,21,2,25,17,34,6,
27,13,36,11,30,8,23,10,5,24,
16,33,1,20,14,31,9,22,18,29,
7,28,12,35,3,26,0
];

let timeline=[];
let estruturalCentros=[];
let estruturalC6=null;
let estruturalRes=[];
let relatorioErros=[];

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

  const freqViz={};
  timeline.forEach(n=>{
    vizinhos2(n).forEach(v=>{
      freqViz[v]=(freqViz[v]||0)+1;
    });
  });

  let saltoMedio=0;
  for(let i=0;i<timeline.length-1;i++){
    saltoMedio+=dist(timeline[i],timeline[i+1]);
  }
  saltoMedio=timeline.length>1?saltoMedio/(timeline.length-1):0;

  const candidatos=track.map(n=>{
    const permanencia=freq[n]||0;
    const calor=freqViz[n]||0;
    const espalhamento=
      centros.length?
      centros.reduce((acc,c)=>acc+dist(c,n),0)/centros.length:0;

    const score=
      (permanencia*1.2)+
      (calor*1.0)+
      ((10-Math.abs(saltoMedio-espalhamento))*1.1);

    return {n,score};
  })
  .sort((a,b)=>b.score-a.score)
  .map(x=>x.n);

  for(const n of candidatos){
    if(pode(n)) registrar(n);
    if(centros.length>=5) break;
  }

  let melhor=-1;
  let c6=null;

  track.forEach(n=>{
    if(centros.includes(n)) return;
    const dMedia=centros.reduce((a,c)=>a+dist(c,n),0)/centros.length;
    if(dMedia>melhor){
      melhor=dMedia;
      c6=n;
    }
  });

  estruturalCentros=centros;
  estruturalC6=c6;
}

function dentroNucleo(n){
  return estruturalCentros.some(c=>vizinhos2(c).includes(n));
}

function dentroRuptura(n){
  return estruturalC6!==null && vizinhos2(estruturalC6).includes(n);
}

function analisarErro(n){

  const distMedia=
    estruturalCentros.reduce((a,c)=>a+dist(c,n),0)/estruturalCentros.length;

  const distC6=
    estruturalC6!==null?dist(estruturalC6,n):null;

  let saltoMedio=0;
  for(let i=0;i<timeline.length-1;i++){
    saltoMedio+=dist(timeline[i],timeline[i+1]);
  }
  saltoMedio=timeline.length>1?saltoMedio/(timeline.length-1):0;

  let motivo="";

  if(distMedia>8) motivo="Quebra extrema fora do espalhamento";
  else if(distC6>8) motivo="Fora da zona de ruptura";
  else motivo="Fora do padrão estatístico ativo";

  relatorioErros.unshift({
    numero:n,
    distMedia:distMedia.toFixed(2),
    distC6:distC6,
    saltoMedio:saltoMedio.toFixed(2),
    motivo
  });
}

function add(n){

  if(dentroNucleo(n)){
    estruturalRes.unshift("V");
  }
  else if(dentroRuptura(n)){
    estruturalRes.unshift("R");
  }
  else{
    estruturalRes.unshift("X");
    analisarErro(n);
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
<h3>CSM Estrutural</h3>

<div>🕒 Timeline:<div id="tl"></div></div>

<div id="estruturaBox"
style="border:1px solid #555;padding:10px;margin:10px 0"></div>

<button id="btnRel"
style="padding:8px;background:#9c27b0;color:#fff;border:none;margin-bottom:10px">
RELATÓRIO
</button>

<div id="areaRel"
style="display:none;border:1px solid #444;padding:10px;margin-bottom:10px"></div>

<div id="nums"
style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px"></div>
</div>
`;

for(let n=0;n<=36;n++){
  const b=document.createElement("button");
  b.textContent=n;
  b.style="padding:8px;background:#333;color:#fff";
  b.onclick=()=>add(n);
  nums.appendChild(b);
}

btnRel.onclick=()=>{
  areaRel.style.display=
    areaRel.style.display==="none"?"block":"none";

  areaRel.innerHTML=
    relatorioErros.map(r=>`
    <div style="margin-bottom:8px">
      Número: ${r.numero}<br>
      Distância média dos centrais: ${r.distMedia}<br>
      Distância do C6: ${r.distC6}<br>
      Salto médio: ${r.saltoMedio}<br>
      Motivo: ${r.motivo}
    </div>
    `).join("");
};

function render(){

  tl.innerHTML=timeline.map((n,i)=>{
    const r=estruturalRes[i];
    let cor="#aaa";
    if(r==="V") cor="#00e676";
    if(r==="R") cor="#9c27b0";
    if(r==="X") cor="#ff5252";
    return `<span style="color:${cor}">${n}</span>`;
  }).join(" · ");

  estruturaBox.innerHTML=`
  <b>Núcleo</b><br>
  ${estruturalCentros.join(" , ")}
  <br><br>
  <b>C6 Ruptura</b><br>
  <span style="color:#9c27b0">${estruturalC6}</span>
  `;
}

gerarEstrutural();
render();

})();
