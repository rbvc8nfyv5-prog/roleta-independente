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

  // ================= ESTADO =================
  let timeline = [];
  let filtrosConjuntos = new Set();

  // ================= BASE UI =================
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
      overflow-x:auto;
      scroll-snap-type:x mandatory;
    ">

      <!-- ================= TELA 1 ================= -->
      <div style="
        width:100vw;
        padding:10px;
        scroll-snap-align:start;
      ">
        <h3 style="text-align:center">CSM</h3>

        <div style="border:1px solid #444;padding:8px">
          Histórico:
          <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
          <div style="margin-top:6px;display:flex;gap:10px;flex-wrap:wrap">
            <button id="col">Colar</button>
            <button id="lim">Limpar</button>
          </div>
        </div>

        <div style="margin:10px 0">
          🕒 Timeline (14):
          <span id="tl" style="font-size:18px;font-weight:600"></span>
        </div>
      </div>

      <!-- ================= TELA 2 ================= -->
      <div style="
        width:100vw;
        padding:10px;
        scroll-snap-align:start;
      ">
        <h3 style="text-align:center">CONJUNTOS</h3>

        <div style="margin-bottom:10px">
          <button id="btnConj" style="
            padding:6px 12px;
            background:#444;
            color:#fff;
            border:1px solid #666;
          ">Conjuntos ▾</button>

          <div id="listaT" style="
            display:none;
            margin-top:6px;
            gap:6px;
            flex-wrap:wrap;
          "></div>
        </div>

        <div id="gridConj" style="
          display:grid;
          grid-template-columns:repeat(6,1fr);
          gap:6px;
        "></div>
      </div>

    </div>
  `;

  // ================= EVENTOS CSM =================
  function renderTimeline(){
    document.getElementById("tl").textContent = timeline.join(" · ");
  }

  function add(n){
    timeline.unshift(n);
    if(timeline.length > 60) timeline.pop();
    renderTimeline();
    renderConjuntos();
  }

  document.getElementById("col").onclick = ()=>{
    document.getElementById("inp").value
      .split(/[\s,]+/)
      .map(Number)
      .filter(n=>n>=0 && n<=36)
      .forEach(add);
    document.getElementById("inp").value = "";
  };

  document.getElementById("lim").onclick = ()=>{
    timeline = [];
    filtrosConjuntos.clear();
    renderTimeline();
    renderConjuntos();
    atualizarBT();
  };

  renderTimeline();

  // ================= CONJUNTOS =================
  const listaT = document.getElementById("listaT");
  const gridConj = document.getElementById("gridConj");
  const btnConj = document.getElementById("btnConj");

  // Botões T0–T9
  for(let t=0;t<=9;t++){
    const b = document.createElement("button");
    b.textContent = "T"+t;
    b.style = "padding:6px;background:#333;color:#fff;border:1px solid #555";
    b.onclick = ()=>{
      filtrosConjuntos.has(t)
        ? filtrosConjuntos.delete(t)
        : filtrosConjuntos.add(t);
      atualizarBT();
      renderConjuntos();
    };
    listaT.appendChild(b);
  }

  btnConj.onclick = ()=>{
    listaT.style.display = listaT.style.display==="flex" ? "none" : "flex";
    listaT.style.display = "flex";
  };

  function atualizarBT(){
    [...listaT.children].forEach(b=>{
      const t = +b.textContent.slice(1);
      b.style.background = filtrosConjuntos.has(t) ? "#00e676" : "#333";
    });
  }

  function renderConjuntos(){
    gridConj.innerHTML = "";

    let marcados = new Set();

    filtrosConjuntos.forEach(t=>{
      track.filter(n=>terminal(n)===t)
        .forEach(n=>{
          vizinhosRace(n).forEach(v=>marcados.add(v));
        });
    });

    timeline.forEach(n=>{
      const d = document.createElement("div");
      d.textContent = n;
      d.style = `
        padding:10px;
        text-align:center;
        background:${marcados.has(n) ? "#00e676" : "#222"};
        border:1px solid #555;
        font-weight:600;
      `;
      gridConj.appendChild(d);
    });
  }

})();
