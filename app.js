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

  // ================= CONJUNTOS =================
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

  // ================= ADIÇÃO =================
  function renderLinhasQuadros(){
    const cfgs = [
      { lineId:"line2589", bestId:"best2589", t1:[2,5,9], t2:[2,8,9], all:[2,5,8,9] },
      { lineId:"line1479", bestId:"best1479", t1:[1,4,9], t2:[1,7,9], all:[1,4,7,9] },
      { lineId:"line0369", bestId:"best0369", t1:[0,3,9], t2:[0,6,9], all:[0,3,6,9] }
    ];

    cfgs.forEach(cfg=>{
      const elLine = document.getElementById(cfg.lineId);
      const elBest = document.getElementById(cfg.bestId);
      if(!elLine || !elBest) return;

      let c1=0, c2=0;
      timeline.slice(0,14).forEach(n=>{
        const t = terminal(n);
        if(cfg.t1.includes(t)) c1++;
        if(cfg.t2.includes(t)) c2++;
      });

      const best = (c1>c2) ? cfg.t1 : (c2>c1) ? cfg.t2 : cfg.t1;
      elBest.textContent = `melhor: ${best.join("")}`;

      const setBest = new Set(best);
      const setAll  = new Set(cfg.all);

      elLine.innerHTML = timeline.slice(0,14).map(n=>{
        const t = terminal(n);
        const cor =
          setBest.has(t) ? "#00e676" :
          setAll.has(t)  ? "#ffeb3b" :
          "#aaa";
        return `<span style="color:${cor};font-weight:600">${n}</span>`;
      }).join(" · ");
    });
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:1000px;margin:auto">
      <h3 style="text-align:center">CSM</h3>

      <div style="border:1px solid #444;padding:8px">
        Histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
        <div style="margin-top:6px;display:flex;gap:10px;flex-wrap:wrap">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
          Janela:
          <select id="jan">
            ${Array.from({length:8},(_,i)=>`<option ${i+3===6?'selected':''}>${i+3}</option>`).join("")}
          </select>
        </div>
      </div>

      <div style="margin:10px 0">
        🕒 Timeline (14):
        <span id="tl" style="font-size:18px;font-weight:600"></span>
      </div>

      <!-- 🔥 QUADROS AGORA EM VERTICAL -->
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:10px">
        <div style="border:1px solid #555;padding:8px;text-align:center">
          <b>2589</b>
          <div id="best2589" style="margin-top:4px;font-size:12px;color:#bbb"></div>
          <div id="line2589" style="margin-top:6px;font-size:14px;font-weight:600"></div>
        </div>
        <div style="border:1px solid #555;padding:8px;text-align:center">
          <b>1479</b>
          <div id="best1479" style="margin-top:4px;font-size:12px;color:#bbb"></div>
          <div id="line1479" style="margin-top:6px;font-size:14px;font-weight:600"></div>
        </div>
        <div style="border:1px solid #555;padding:8px;text-align:center">
          <b>0369</b>
          <div id="best0369" style="margin-top:4px;font-size:12px;color:#bbb"></div>
          <div id="line0369" style="margin-top:6px;font-size:14px;font-weight:600"></div>
        </div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>
    </div>
  `;

  render();

})();
