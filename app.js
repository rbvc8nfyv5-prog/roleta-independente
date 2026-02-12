(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];
  const terminal = n => n % 10;

  // ================= EIXOS =================
  const eixos = [
    { nome:"ZERO", trios:[[0,32,15],[19,4,21],[2,25,17],[34,6,27]] },
    { nome:"TIERS", trios:[[13,36,11],[30,8,23],[10,5,24],[16,33,1]] },
    { nome:"ORPHELINS", trios:[[20,14,31],[9,22,18],[7,29,28],[12,35,3]] }
  ];

  // ================= ESTADO =================
  let timeline = [];
  let janela = 6;
  let modoAtivo = "MANUAL";
  let autoTAtivo = null;

  const analises = {
    MANUAL: { filtros:new Set(), res:[] },
    VIZINHO:{ filtros:new Set(), res:[], motor:new Set() },
    NUNUM:  { filtros:new Set(), res:[] },
    AUTO: {
      3:{ filtros:new Set(), res:[] },
      4:{ filtros:new Set(), res:[] },
      5:{ filtros:new Set(), res:[] },
      6:{ filtros:new Set(), res:[] },
      7:{ filtros:new Set(), res:[] }
    }
  };

  let modoConjuntos = false;
  let filtrosConjuntos = new Set();

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
  }

  // ================= LÓGICAS =================
  function calcularAutoT(k){
    const set = new Set();
    for(const n of timeline.slice(0,janela)){
      set.add(terminal(n));
      if(set.size>=k) break;
    }
    analises.AUTO[k].filtros = set;
  }

  function melhorTrincaBase(){
    const cont = {};
    timeline.slice(0,janela).forEach(n=>{
      const t = terminal(n);
      cont[t] = (cont[t]||0)+1;
    });
    return Object.entries(cont)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,3)
      .map(x=>+x[0]);
  }

  function calcularVizinho(){
    const base = melhorTrincaBase();
    analises.VIZINHO.filtros = new Set(base);
    analises.VIZINHO.motor.clear();
    base.forEach(t=>{
      track.filter(n=>terminal(n)===t)
        .forEach(n=>vizinhosRace(n)
          .forEach(v=>analises.VIZINHO.motor.add(v))
        );
    });
  }

  function calcularNunum(){
    const set = new Set();
    timeline.slice(0,2).forEach(n=>{
      vizinhosRace(n).forEach(v=>set.add(terminal(v)));
    });
    analises.NUNUM.filtros = set;
  }

  function triosSelecionados(filtros){
    let lista=[];
    eixos.forEach(e=>{
      e.trios.forEach(trio=>{
        const inter = trio.map(terminal)
          .filter(t=>!filtros.size||filtros.has(t)).length;
        if(inter>0) lista.push({eixo:e.nome,trio});
      });
    });
    return lista.slice(0,9);
  }

  function validar(n, filtros){
    return triosSelecionados(filtros).some(x=>x.trio.includes(n));
  }

  function registrar(n){
    analises.MANUAL.res.unshift(validar(n,analises.MANUAL.filtros)?"V":"X");
    analises.VIZINHO.res.unshift(analises.VIZINHO.motor.has(n)?"V":"X");
    analises.NUNUM.res.unshift(validar(n,analises.NUNUM.filtros)?"V":"X");
    [3,4,5,6,7].forEach(k=>{
      analises.AUTO[k].res.unshift(
        validar(n,analises.AUTO[k].filtros)?"V":"X"
      );
    });
  }

  // ================= ATUALIZAÇÃO DOS QUADROS (ÚNICA PARTE ALTERADA) =================
  function renderLinhasQuadros(){

    const quadros = [
      { lineId:"line2589", bestId:"best2589", base:[2,5,8,9] },
      { lineId:"line1479", bestId:"best1479", base:[1,4,7,9] },
      { lineId:"line0369", bestId:"best0369", base:[0,3,6,9] }
    ];

    function gerarTrios(arr){
      const trios=[];
      for(let i=0;i<arr.length;i++){
        for(let j=i+1;j<arr.length;j++){
          for(let k=j+1;k<arr.length;k++){
            trios.push([arr[i],arr[j],arr[k]]);
          }
        }
      }
      return trios;
    }

    quadros.forEach(cfg=>{
      const elLine = document.getElementById(cfg.lineId);
      const elBest = document.getElementById(cfg.bestId);
      if(!elLine || !elBest) return;

      // 1️⃣ VIZINHOS DOS 4 TERMINAIS DO QUADRO
      const vizinhosSet = new Set();

      cfg.base.forEach(t=>{
        track.forEach(n=>{
          if(terminal(n)===t){
            vizinhosRace(n).forEach(v=>vizinhosSet.add(v));
          }
        });
      });

      elLine.innerHTML = timeline.slice(0,14).map(n=>{
        const cor = vizinhosSet.has(n) ? "#00e676" : "#aaa";
        return `<span style="color:${cor};font-weight:600">${n}</span>`;
      }).join(" · ");

      // 2️⃣ MELHOR TRIO ENTRE OS 4
      const trios = gerarTrios(cfg.base);

      let melhorTrio = trios[0];
      let melhorScore = 0;

      trios.forEach(trio=>{
        let score=0;
        timeline.slice(0,14).forEach(n=>{
          if(trio.includes(terminal(n))) score++;
        });
        if(score>melhorScore){
          melhorScore=score;
          melhorTrio=trio;
        }
      });

      elBest.textContent =
        `melhor trio: ${melhorTrio.join("")} (${melhorScore})`;
    });
  }

  // ================= RESTO DO SEU CÓDIGO CONTINUA EXATAMENTE IGUAL =================

  // ... (todo restante permanece igual ao que você enviou)

})();
