(function () {

  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];
  const terminal = n => n % 10;

  const eixos = [
    { nome:"ZERO", trios:[[0,32,15],[19,4,21],[2,25,17],[34,6,27]] },
    { nome:"TIERS", trios:[[13,36,11],[30,8,23],[10,5,24],[16,33,1]] },
    { nome:"ORPHELINS", trios:[[20,14,31],[9,22,18],[7,29,28],[12,35,3]] }
  ];

  let timeline = [];
  let janela = 6;
  let modoAtivo = "MANUAL";
  let autoTAtivo = null;
  let grupoManualAtivo = null;

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
    {nome:"2589", set:new Set([2,5,8,9])},
    {nome:"1479", set:new Set([1,4,7,9])},
    {nome:"0369", set:new Set([0,3,6,9])}
  ];

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
  }

  function calcularMelhoresTerminaisGrupo(grupo){
    const cont = {};
    timeline.slice(0,janela).forEach(n=>{
      const t = terminal(n);
      if(grupo.set.has(t)){
        cont[t] = (cont[t]||0)+1;
      }
    });
    return Object.entries(cont)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,2)
      .map(x=>+x[0]);
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
        🕒 Timeline (14):
        <span id="tl"></span>
      </div>

      <div id="manualSec" style="display:flex;flex-direction:column;gap:10px"></div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:15px">
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

    manualSec.innerHTML = gruposManual.map((g,i)=>`
      <div data-i="${i}" style="
        border:2px solid ${grupoManualAtivo===i?'#00e676':'#444'};
        padding:10px;
        cursor:pointer;
        background:#1a1a1a;
      ">
        <b>Grupo ${g.nome}</b>
      </div>
    `).join("");

    document.querySelectorAll("#manualSec > div").forEach(div=>{
      div.onclick=()=>{
        grupoManualAtivo=+div.dataset.i;
        render();
      };
    });

    let filtrosAtivos = new Set();

    if(grupoManualAtivo!==null){
      const grupo = gruposManual[grupoManualAtivo];
      const melhores = calcularMelhoresTerminaisGrupo(grupo);
      filtrosAtivos = new Set(melhores);
    }

    const trios = triosSelecionados(filtrosAtivos);
    const por={ZERO:[],TIERS:[],ORPHELINS:[]};
    trios.forEach(x=>{
      por[x.eixo].push(`
        <div style="background:${grupoManualAtivo!==null?'#00e676':'transparent'};padding:3px">
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
