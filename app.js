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
  let grupoManualAtivo = null; // 🔹 NOVO

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

  // ===== GRUPOS SECUNDÁRIOS MANUAL =====
  const gruposManual = [
    new Set([2,5,8,9]),
    new Set([1,4,7,9]),
    new Set([0,3,6,9])
  ];

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
  }

  // 🔹 NOVO — calcula 2 melhores terminais dentro do grupo
  function melhoresTerminaisGrupo(grupoSet){
    const cont = {};
    timeline.slice(0,janela).forEach(n=>{
      const t = terminal(n);
      if(grupoSet.has(t)){
        cont[t] = (cont[t]||0)+1;
      }
    });
    return Object.entries(cont)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,2)
      .map(x=>+x[0]);
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

      <!-- MANUAL -->
      <div id="manualSec" style="margin-bottom:10px"></div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div><b>ZERO</b><div id="cZERO"></div></div>
        <div><b>TIERS</b><div id="cTIERS"></div></div>
        <div><b>ORPHELINS</b><div id="cORPH"></div></div>
      </div>

    </div>
  `;

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
    grupoManualAtivo=null;
    render();
  };

  function render(){

    tl.innerHTML = timeline.join(" · ");

    // 🔹 MANUAL agora em quadros (mesmas linhas)
    manualSec.innerHTML = gruposManual.map((grupo,i)=>`
      <div data-i="${i}" style="
        border:2px solid ${grupoManualAtivo===i?'#00e676':'#444'};
        padding:6px;
        margin-bottom:6px;
        cursor:pointer;
      ">
        ${timeline.map(n=>{
          const t=terminal(n);
          return `<span style="
            padding:2px 4px;
            margin-right:3px;
            background:${grupo.has(t)?'#00e676':'#222'};
            border-radius:3px
          ">${n}</span>`;
        }).join("")}
      </div>
    `).join("");

    document.querySelectorAll("#manualSec > div").forEach(div=>{
      div.onclick=()=>{
        grupoManualAtivo=+div.dataset.i;
        render();
      };
    });

    let filtrosExtras = new Set();

    if(grupoManualAtivo!==null){
      const melhores = melhoresTerminaisGrupo(gruposManual[grupoManualAtivo]);
      filtrosExtras = new Set(melhores);
    }

    const trios = triosSelecionados(filtrosExtras);
    const por={ZERO:[],TIERS:[],ORPHELINS:[]};

    trios.forEach(x=>{
      por[x.eixo].push(`
        <div style="
          background:${grupoManualAtivo!==null?'#00e676':'transparent'};
          padding:2px;
        ">
          ${x.trio.join("-")}
        </div>
      `);
    });

    cZERO.innerHTML=por.ZERO.join("");
    cTIERS.innerHTML=por.TIERS.join("");
    cORPH.innerHTML=por.ORPHELINS.join("");
  }

  render();

})();
