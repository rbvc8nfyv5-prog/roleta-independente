(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];
  const terminal = n => n % 10;

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
  }

  // ================= EIXOS =================
  const eixos = [
    { nome:"ZERO", trios:[[0,32,15],[19,4,21],[2,25,17],[34,6,27]] },
    { nome:"TIERS", trios:[[13,36,11],[30,8,23],[10,5,24],[16,33,1]] },
    { nome:"ORPHELINS", trios:[[20,14,31],[9,22,18],[7,29,28],[12,35,3]] }
  ];

  // ================= ESTADO BASE =================
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
  let filtrosConjuntos = new Set();

  // ================= LAYOUT DUAS TELAS =================
  document.body.style.margin = "0";
  document.body.style.background = "#111";
  document.body.style.color = "#fff";
  document.body.style.fontFamily = "sans-serif";
  document.body.style.overflowX = "auto";

  document.body.innerHTML = `
    <div id="pages" style="
      display:flex;
      width:200vw;
      height:100vh;
      scroll-snap-type:x mandatory;
      overflow-x:auto;
    ">

      <!-- ================= TELA 1 : CSM BASE ================= -->
      <div style="width:100vw; padding:10px; scroll-snap-align:start">
        ${document.currentScript.previousElementSibling?.innerHTML || ""}
      </div>

      <!-- ================= TELA 2 : CONJUNTOS ================= -->
      <div style="width:100vw; padding:10px; scroll-snap-align:start">
        <h3 style="text-align:center">CONJUNTOS</h3>

        <button id="btnConj" style="padding:6px 12px;background:#444;color:#fff;border:1px solid #666">
          Conjuntos ▾
        </button>

        <div id="listaT" style="display:none;gap:6px;flex-wrap:wrap;margin:8px 0"></div>

        <div id="gridConj" style="
          display:grid;
          grid-template-columns:repeat(6,1fr);
          gap:6px;
        "></div>
      </div>
    </div>
  `;

  // ================= CONJUNTOS UI =================
  const listaT = document.getElementById("listaT");
  const gridConj = document.getElementById("gridConj");
  const btnConj = document.getElementById("btnConj");

  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.textContent="T"+t;
    b.style="padding:6px;background:#333;color:#fff;border:1px solid #555";
    b.onclick=()=>{
      filtrosConjuntos.has(t)
        ? filtrosConjuntos.delete(t)
        : filtrosConjuntos.add(t);
      atualizarBT();
      renderConjuntos();
    };
    listaT.appendChild(b);
  }

  btnConj.onclick=()=>{
    listaT.style.display = listaT.style.display==="flex"?"none":"flex";
    listaT.style.display = "flex";
  };

  function atualizarBT(){
    [...listaT.children].forEach(b=>{
      const t=+b.textContent.slice(1);
      b.style.background=filtrosConjuntos.has(t)?"#00e676":"#333";
    });
  }

  function renderConjuntos(){
    gridConj.innerHTML="";
    let marcados=new Set();

    filtrosConjuntos.forEach(t=>{
      track.filter(n=>terminal(n)===t)
        .forEach(n=>vizinhosRace(n).forEach(v=>marcados.add(v)));
    });

    timeline.forEach(n=>{
      const d=document.createElement("div");
      d.textContent=n;
      d.style=`
        padding:10px;
        text-align:center;
        background:${marcados.has(n)?"#00e676":"#222"};
        border:1px solid #555;
        font-weight:600;
      `;
      gridConj.appendChild(d);
    });
  }

})();
