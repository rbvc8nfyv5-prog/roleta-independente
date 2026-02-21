(function(){

const track = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

let ultimoNumero = null;

/* ================= UTIL ================= */

function vizinhos1(n){
  const i = track.indexOf(n);
  return [
    track[(i-1+37)%37],
    n,
    track[(i+1)%37]
  ];
}

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

/* ================= GERADOR BASEADO SÓ NA SEQUÊNCIA ================= */

function gerarPorSequencia(seq){

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
  seq.forEach(n=>freq[n]=(freq[n]||0)+1);

  const candidatos = track.map(n=>{

    const permanencia = freq[n] || 0;

    const alinhamento =
      Math.abs(dist(seq[1],n));

    const score =
      (permanencia * 2)
    + ((10 - alinhamento) * 1.2);

    return {n,score};
  })
  .sort((a,b)=>b.score-a.score)
  .map(x=>x.n);

  for(const n of candidatos){
    if(pode(n)) registrar(n);
    if(centros.length>=5) break;
  }

  let melhorScore = -1;
  let ruptura = null;

  track.forEach(n=>{
    if(centros.includes(n)) return;
    const dMedia = centros.reduce((acc,c)=>acc+dist(c,n),0)/centros.length;
    if(dMedia > melhorScore){
      melhorScore = dMedia;
      ruptura = n;
    }
  });

  return {centros, ruptura};
}

/* ================= UI ================= */

document.body.style.background="#111";
document.body.style.color="#fff";
document.body.style.fontFamily="sans-serif";

document.body.innerHTML = `
<div style="max-width:1000px;margin:auto;padding:10px">

<h3>Simulação Direcional do Último Número</h3>

<div>
Último número:
<div id="numeroAtual" style="font-size:22px;font-weight:bold;margin:6px 0"></div>
</div>

<div id="estruturaBox"
     style="border:1px solid #555;padding:10px;margin:10px 0">
</div>

<div id="nums"
     style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px">
</div>

</div>
`;

/* ================= BOTÕES ================= */

for(let n=0;n<=36;n++){
  const b=document.createElement("button");
  b.textContent=n;
  b.style="padding:10px;background:#222;color:#fff;border:1px solid #444";
  b.onclick=()=>add(n);
  nums.appendChild(b);
}

/* ================= ADD ================= */

function add(n){

  ultimoNumero = n;

  render();
}

/* ================= RENDER ================= */

function render(){

  if(ultimoNumero === null){
    numeroAtual.innerHTML = "-";
    estruturaBox.innerHTML = "";
    return;
  }

  numeroAtual.innerHTML = ultimoNumero;

  const lateral = vizinhos1(ultimoNumero);

  const seqHorario = [
    lateral[0],
    lateral[1],
    lateral[2]
  ];

  const seqAnti = [
    lateral[2],
    lateral[1],
    lateral[0]
  ];

  const projHorario = gerarPorSequencia(seqHorario);
  const projAnti = gerarPorSequencia(seqAnti);

  estruturaBox.innerHTML = `
  <b style="color:#00e676">Projeção Horária</b><br>
  Sequência: ${seqHorario.join(" → ")}<br>
  Núcleo: ${projHorario.centros.join(" , ")}<br>
  Ruptura: <span style="color:#9c27b0">${projHorario.ruptura}</span>
  <br><br>
  <b style="color:#ff5252">Projeção Anti-Horária</b><br>
  Sequência: ${seqAnti.join(" → ")}<br>
  Núcleo: ${projAnti.centros.join(" , ")}<br>
  Ruptura: <span style="color:#9c27b0">${projAnti.ruptura}</span>
  `;
}

render();

})();
