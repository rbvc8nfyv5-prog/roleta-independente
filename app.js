(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];
  const terminal = n => n % 10;

  // ================= ZONAS =================
  const zonas = {
    TIER: [27,13,36,11,30,8,23,10,5,24,16,33],
    ORFINS: [6,34,17,1,20,14,31,9],
    ZERO: [15,32,0,26,3,35,12],
    VOISINS: [25,2,21,4,19,22,18,29,7,28]
  };

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

  const gruposManual = [
    new Set([2,5,8,9]),
    new Set([1,4,7,9]),
    new Set([0,3,6,9])
  ];

  const gruposManualNomes = ["2589","1479","0369"];
  let grupoManualAtivo = null;

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
  }

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

  function calcularEstatisticasZonas(){
    const base = timeline.slice(0,14);
    const total = base.length || 1;
    const res = {};
    Object.keys(zonas).forEach(z=>{
      const count = base.filter(n=>zonas[z].includes(n)).length;
      res[z] = ((count/total)*100).toFixed(1);
    });
    return res;
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:1000px;margin:auto">
      <h3 style="text-align:center">CSM</h3>

      Histórico:
      <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
      <div style="margin:6px 0">
        <button id="col">Colar</button>
        <button id="lim">Limpar</button>
      </div>

      🕒 Timeline (14):
      <div id="tl" style="margin-bottom:10px;font-weight:600"></div>

      <div id="manualSec" style="margin-bottom:10px"></div>

      📊 Estatística de Zonas:
      <div id="statsZonas" style="margin-bottom:12px"></div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px"></div>
    </div>
  `;

  function renderManual(){
    manualSec.innerHTML = `
      <b>🎯 Grupos Manuais</b>
      <div style="display:flex;gap:8px;margin-top:6px">
        ${gruposManual.map((g,i)=>`
          <button data-i="${i}"
            style="padding:6px;background:${grupoManualAtivo===i?'#0a84ff':'#333'};color:#fff">
            ${gruposManualNomes[i]}
          </button>
        `).join("")}
      </div>
    `;

    manualSec.querySelectorAll("button").forEach(btn=>{
      btn.onclick=()=>{
        const i = +btn.dataset.i;
        grupoManualAtivo = grupoManualAtivo===i ? null : i;
        analises.MANUAL.filtros =
          grupoManualAtivo!==null ? gruposManual[grupoManualAtivo] : new Set();
        render();
      };
    });
  }

  for(let n=0;n<=36;n++){
    const b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>add(n);
    nums.appendChild(b);
  }

  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    registrar(n);
    calcularVizinho();
    calcularNunum();
    [3,4,5,6,7].forEach(calcularAutoT);
    render();
  }

  col.onclick=()=>{
    inp.value.split(/[\s,]+/)
      .map(Number).filter(n=>n>=0&&n<=36).forEach(add);
    inp.value="";
  };

  lim.onclick=()=>{
    timeline=[];
    render();
  };

  function render(){
    tl.innerHTML = timeline.join(" · ");
    renderManual();
    const stats = calcularEstatisticasZonas();
    statsZonas.innerHTML =
      Object.entries(stats)
        .map(([z,p])=>`${z}: <b>${p}%</b>`)
        .join(" | ");
  }

  render();

})();
