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

  // ================= ZONAS COMPLETAS =================
  const zonas = {
    ZERO: [0,32,15,19,4,21,2,25,17,34,6,27],
    TIERS: [13,36,11,30,8,23,10,5,24,16,33,1],
    ORPHELINS: [20,14,31,9,22,18,7,29,28,12,35,3],
    VOISINS: [22,18,29,7,28,12,35,3,26,0,32,15,19,4,21,2,25]
  };

  // ================= ESTADO =================
  let timeline = [];
  let janela = 6;
  let modoAtivo = "MANUAL";
  let autoTAtivo = null;
  let grupoManualAtivo = null;

  const gruposManual = [
    new Set([2,5,8,9]),
    new Set([1,4,7,9]),
    new Set([0,3,6,9])
  ];
  const gruposManualNomes = ["2589","1479","0369"];

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
  }

  // ================= MELHORES 3 TERMINAIS =================
  function melhores3TerminaisGrupo(grupoSet){
    const cont = {};
    timeline.slice(0,janela).forEach(n=>{
      const t = terminal(n);
      if(grupoSet.has(t)) cont[t] = (cont[t]||0)+1;
    });
    return Object.entries(cont)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,3)
      .map(([t])=>+t);
  }

  // ================= ESTATÍSTICA ZONAS =================
  function calcularEstatisticaZonas(){
    const base = timeline.slice(0,janela);
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
    <div style="padding:10px;max-width:1100px;margin:auto">
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
        🕒 Timeline:
        <span id="tl" style="font-size:18px;font-weight:600"></span>
      </div>

      <div id="manualSec"></div>

      <div style="margin-top:15px;border:1px solid #444;padding:8px">
        <b>📊 Estatística de Zonas (janela)</b>
        <div id="zonasStats" style="display:flex;gap:15px;margin-top:6px;flex-wrap:wrap"></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:15px">
        <div><b>ZERO</b><div id="cZERO"></div></div>
        <div><b>TIERS</b><div id="cTIERS"></div></div>
        <div><b>ORPHELINS</b><div id="cORPH"></div></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:15px"></div>
    </div>
  `;

  jan.onchange=e=>{ janela=+e.target.value; render(); };

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

    // ===== QUADROS MANUAL =====
    manualSec.innerHTML = gruposManual.map((grupo,idx)=>{
      const ativo = grupoManualAtivo===idx;
      return `
        <div data-idx="${idx}" style="
          border:2px solid ${ativo?'#00e676':'#444'};
          padding:8px;
          margin-top:8px;
          cursor:pointer;
          border-radius:6px;
        ">
          <b>Grupo ${gruposManualNomes[idx]}</b>
        </div>
      `;
    }).join("");

    document.querySelectorAll("#manualSec > div").forEach(el=>{
      el.onclick=()=>{
        const idx=+el.dataset.idx;
        grupoManualAtivo = (grupoManualAtivo===idx)?null:idx;
        render();
      };
    });

    // ===== ESTATÍSTICA ZONAS =====
    const stats = calcularEstatisticaZonas();
    zonasStats.innerHTML = Object.entries(stats).map(([z,p])=>
      `<div>${z}: <b>${p}%</b></div>`
    ).join("");

    // ===== TRIOS =====
    let melhoresSet=null;

    if(grupoManualAtivo!==null){
      melhoresSet = new Set(
        melhores3TerminaisGrupo(gruposManual[grupoManualAtivo])
      );
    }

    const por={ZERO:[],TIERS:[],ORPHELINS:[]};

    eixos.forEach(e=>{
      e.trios.forEach(trio=>{
        const destaque = melhoresSet &&
          trio.some(n=>melhoresSet.has(terminal(n)));

        por[e.nome].push(`
          <div style="
            margin:3px 0;
            padding:4px;
            border-radius:4px;
            background:${destaque?'#00e676':'transparent'};
            color:${destaque?'#000':'#fff'};
            font-weight:${destaque?'700':'400'};
          ">
            ${trio.join(" - ")}
          </div>
        `);
      });
    });

    cZERO.innerHTML=por.ZERO.join("");
    cTIERS.innerHTML=por.TIERS.join("");
    cORPH.innerHTML=por.ORPHELINS.join("");
  }

  render();

})();
