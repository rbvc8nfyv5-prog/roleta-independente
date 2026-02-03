(function () {

  /* ================= CONFIG ================= */
  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];
  const terminal = n => n % 10;

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [track[(i+36)%37], n, track[(i+1)%37]];
  }

  /* ================= ESTADO ================= */
  let timeline = [];
  let filtrosConj = new Set();

  /* ================= LAYOUT DUAS TELAS ================= */
  document.body.style.margin = "0";
  document.body.style.background = "#111";
  document.body.style.color = "#fff";
  document.body.style.fontFamily = "sans-serif";

  document.body.innerHTML = `
    <div style="
      display:flex;
      width:200vw;
      height:100vh;
      overflow-x:auto;
      scroll-snap-type:x mandatory;
    ">

      <!-- ================= TELA 1 ================= -->
      <div style="width:100vw;padding:10px;scroll-snap-align:start">
        <h3 style="text-align:center">CSM (BASE)</h3>

        <input id="inp" placeholder="Cole histórico"
          style="width:100%;padding:6px;background:#222;color:#fff"/>

        <div id="timeline1"
          style="margin:10px 0;font-size:18px;font-weight:600">
        </div>

        <div id="nums"
          style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px">
        </div>
      </div>

      <!-- ================= TELA 2 ================= -->
      <div style="width:100vw;padding:10px;scroll-snap-align:start">
        <h3 style="text-align:center">CONJUNTOS</h3>

        <button id="btnConj"
          style="padding:6px 12px;background:#444;color:#fff;border:1px solid #666">
          Conjuntos ▾
        </button>

        <div id="listaT"
          style="display:none;flex-wrap:wrap;gap:6px;margin:8px 0">
        </div>

        <div id="gridConj"
          style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px">
        </div>
      </div>
    </div>
  `;

  /* ================= BOTÕES NÚMEROS ================= */
  const numsDiv = document.getElementById("nums");
  for(let n=0;n<=36;n++){
    const b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>add(n);
    numsDiv.appendChild(b);
  }

  /* ================= INPUT ================= */
  document.getElementById("inp").onchange=e=>{
    e.target.value
      .split(/[\s,]+/)
      .map(Number)
      .filter(n=>n>=0&&n<=36)
      .forEach(add);
    e.target.value="";
  };

  /* ================= CONJUNTOS ================= */
  const listaT = document.getElementById("listaT");
  const gridConj = document.getElementById("gridConj");

  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.textContent="T"+t;
    b.style="padding:6px;background:#333;color:#fff;border:1px solid #555";
    b.onclick=()=>{
      filtrosConj.has(t)
        ? filtrosConj.delete(t)
        : filtrosConj.add(t);
      atualizarBT();
      renderConjuntos();
    };
    listaT.appendChild(b);
  }

  document.getElementById("btnConj").onclick=()=>{
    listaT.style.display = listaT.style.display==="flex"?"none":"flex";
    listaT.style.display="flex";
  };

  function atualizarBT(){
    [...listaT.children].forEach(b=>{
      const t=+b.textContent.slice(1);
      b.style.background = filtrosConj.has(t) ? "#00e676" : "#333";
    });
  }

  /* ================= FUNÇÕES ================= */
  function add(n){
    timeline.unshift(n);
    if(timeline.length>60) timeline.pop();
    renderTimeline();
    renderConjuntos();
  }

  function renderTimeline(){
    document.getElementById("timeline1").innerHTML =
      timeline.join(" · ");
  }

  function renderConjuntos(){
    gridConj.innerHTML="";
    const marcados=new Set();

    filtrosConj.forEach(t=>{
      track.filter(n=>terminal(n)===t)
        .forEach(n=>vizinhosRace(n).forEach(v=>marcados.add(v)));
    });

    timeline.forEach(n=>{
      const d=document.createElement("div");
      d.textContent=n;
      d.style=`
        padding:10px;
        text-align:center;
        font-weight:600;
        background:${marcados.has(n)?"#00e676":"#222"};
        border:1px solid #555;
      `;
      gridConj.appendChild(d);
    });
  }

})();
