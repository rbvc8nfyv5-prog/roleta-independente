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

  // ================= PERMANÊNCIA =================

  const freq = {};
  timeline.forEach(n=>freq[n]=(freq[n]||0)+1);

  // ================= CALOR DE VIZINHOS =================

  const freqViz = {};
  timeline.forEach(n=>{
    vizinhos2(n).forEach(v=>{
      freqViz[v]=(freqViz[v]||0)+1;
    });
  });

  // ================= MÉDIA DE SALTO =================

  function dist(a,b){
    const ia = track.indexOf(a);
    const ib = track.indexOf(b);
    const d = Math.abs(ia-ib);
    return Math.min(d,37-d);
  }

  let saltoMedio = 0;
  for(let i=0;i<timeline.length-1;i++){
    saltoMedio += dist(timeline[i],timeline[i+1]);
  }
  saltoMedio = timeline.length>1 ? saltoMedio/(timeline.length-1) : 0;

  // ================= DIREÇÃO ALTERNADA =================

  function deslocDirecional(a,b,index){
    const size = 37;
    let ia = track.indexOf(a);
    let ib = track.indexOf(b);
    let d = ib - ia;

    if(d > size/2) d -= size;
    if(d < -size/2) d += size;

    if(index % 2 === 1){
      d = -d;
    }

    return d;
  }

  let somaDir = 0;
  let totalDir = 0;

  for(let i=0;i<timeline.length-1;i++){
    somaDir += deslocDirecional(
      timeline[i+1],
      timeline[i],
      i
    );
    totalDir++;
  }

  const mediaDirecional = totalDir ? somaDir/totalDir : 0;

  // ================= SCORE FINAL =================

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

    const espalhamento =
      centros.length
        ? centros.reduce((acc,c)=>acc+dist(c,n),0)/centros.length
        : 0;

    const score =
      (permanencia * 1.2)
    + (calor * 1.0)
    + ((10 - Math.abs(saltoMedio - espalhamento)) * 1.1)
    + ((10 - alinhamento) * 0.8);

    return {n,score};
  })
  .sort((a,b)=>b.score-a.score)
  .map(x=>x.n);

  for(const n of candidatos){
    if(pode(n)) registrar(n);
    if(centros.length>=6) break;
  }

  estruturalCentros = centros;
}
