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

  // ================= ZONAS =================
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
  let grupoManualAtivo = null; // NOVO

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

  const gruposManual = [
    new Set([2,5,8,9]),
    new Set([1,4,7,9]),
    new Set([0,3,6,9])
  ];
  const nomesGrupos = ["2589","1479","0369"];

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
  }

  // ================= NOVO =================
  function melhores3TerminaisGrupo(grupo){
    const cont = {};
    timeline.slice(0,janela).forEach(n=>{
      const t = terminal(n);
      if(grupo.has(t)) cont[t]=(cont[t]||0)+1;
    });
    return Object.entries(cont)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,3)
      .map(([t])=>+t);
  }

  function calcularEstatisticaZonas(){
    const base = timeline.slice(0,janela);
    const total = base.length || 1;
    const res={};
    Object.keys(zonas).forEach(z=>{
      const count = base.filter(n=>zonas[z].includes(n)).length;
      res[z]=((count/total)*100).toFixed(1);
    });
    return res;
  }

  // ================= RESTO DO BASE =================

  function calcularAutoT(k){
    const set = new Set();
    for(const n of timeline.slice(0,janela)){
      set.add(terminal(n));
      if(set.size>=k) break;
    }
    analises.AUTO[k].filtros = set;
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
        <div style="margin-top:6px">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
        </div>
      </div>

      <div style="margin:10px 0">
        🕒 Timeline:
        <span id="tl" style="font-weight:600"></span>
      </div>

      <div id="manualSec"></div>

      <div style="margin-top:15px;border:1px solid #444;padding:8px">
        <b>📊 Estatística Zonas</b>
        <div id="zonasStats" style="margin-top:6px"></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:15px">
        <div><b>ZERO</b><div id="cZERO"></div></div>
        <div><b>TIERS</b><div id="cTIERS"></div></div>
        <div><b>ORPHELINS</b><div id="cORPH"></div></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>
    </div>
  `;

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

    tl.innerHTML = timeline.map((n,i)=>{
      const r=analises.MANUAL.res[i];
      const c=r==="V"?"#00e676":r==="X"?"#ff5252":"#aaa";
      return `<span style="color:${c}">${n}</span>`;
    }).join(" · ");

    // MANUAL
    manualSec.innerHTML = gruposManual.map((grupo,idx)=>{

      const marcados=new Set();
      track.forEach(n=>{
        if(grupo.has(terminal(n))){
          vizinhosRace(n).forEach(v=>marcados.add(v));
        }
      });

      return `
        <div data-i="${idx}" style="
          border:2px solid ${grupoManualAtivo===idx?'#00e676':'#444'};
          padding:8px;
          margin-top:6px;
          cursor:pointer;
        ">
          <b>${nomesGrupos[idx]}</b>
          <div style="margin-top:4px">
            ${timeline.map(n=>`
              <span style="
                padding:2px 4px;
                background:${marcados.has(n)?"#00e676":"#222"};
                border-radius:3px
              ">${n}</span>
            `).join("")}
          </div>
        </div>
      `;
    }).join("");

    document.querySelectorAll("#manualSec > div").forEach(el=>{
      el.onclick=()=>{
        const i=+el.dataset.i;
        grupoManualAtivo=(grupoManualAtivo===i)?null:i;
        render();
      };
    });

    // ESTATÍSTICA ZONAS
    const stats=calcularEstatisticaZonas();
    zonasStats.innerHTML=Object.entries(stats)
      .map(([z,p])=>`${z}: <b>${p}%</b>`)
      .join(" | ");

    // TRIOS
    let melhoresSet=null;
    if(grupoManualAtivo!==null){
      melhoresSet=new Set(
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
            background:${destaque?'#00e676':'transparent'};
            color:${destaque?'#000':'#fff'};
            padding:3px;
            margin:2px 0;
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
