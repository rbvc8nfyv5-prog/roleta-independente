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
  let timeline = [];          // 14 números
  let conjuntoHist = [];      // 30 números
  let janela = 6;
  let modoAtivo = "MANUAL";
  let autoTAtivo = null;
  let modoConjuntos = false;
  let filtrosConjuntos = new Set();

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

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
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

      <div style="display:flex;gap:6px;margin-bottom:6px">
        ${["MANUAL","VIZINHO","NUNUM"].map(m=>`
          <button class="modo" data-m="${m}"
            style="padding:6px;background:#444;color:#fff;border:1px solid #666">${m}</button>`).join("")}
        <button id="btnConj" style="padding:6px;background:#444;color:#fff;border:1px solid #666">
          CONJUNTOS
        </button>
      </div>

      <div style="display:flex;gap:6px;margin-bottom:10px">
        ${[3,4,5,6,7].map(n=>`
          <button class="auto" data-a="${n}"
            style="padding:6px;background:#444;color:#fff;border:1px solid #666">A${n}</button>`).join("")}
      </div>

      <div id="conjArea" style="display:none;margin-top:12px;overflow-x:auto"></div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>
    </div>
  `;

  // ================= EVENTOS =================
  document.querySelectorAll(".modo").forEach(b=>{
    b.onclick=()=>{
      modoAtivo=b.dataset.m;
      autoTAtivo=null;
      render();
    };
  });

  document.querySelectorAll(".auto").forEach(b=>{
    b.onclick=()=>{
      modoAtivo="AUTO";
      autoTAtivo=+b.dataset.a;
      render();
    };
  });

  btnConj.onclick=()=>{
    modoConjuntos=!modoConjuntos;
    btnConj.style.background = modoConjuntos?"#00e676":"#444";
    render();
  };

  for(let n=0;n<=36;n++){
    const b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>add(n);
    nums.appendChild(b);
  }

  function add(n){
    // timeline (14)
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();

    // conjunto (30)
    conjuntoHist.unshift(n);
    if(conjuntoHist.length>30) conjuntoHist.pop();

    render();
  }

  col.onclick=()=>{
    inp.value.split(/[\s,]+/)
      .map(Number).filter(n=>n>=0&&n<=36).forEach(add);
    inp.value="";
  };

  lim.onclick=()=>{
    timeline=[];
    conjuntoHist=[];
    filtrosConjuntos.clear();
    modoConjuntos=false;
    btnConj.style.background="#444";
    render();
  };

  function render(){
    tl.innerHTML = timeline.join(" · ");

    document.querySelectorAll(".modo,.auto").forEach(b=>{
      b.style.background =
        (b.dataset.m===modoAtivo || +b.dataset.a===autoTAtivo)
          ? "#00e676" : "#444";
    });

    conjArea.style.display = modoConjuntos?"block":"none";
    if(modoConjuntos){
      conjArea.innerHTML = `
        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(28px,1fr));
          gap:4px
        ">
          ${conjuntoHist.map(n=>`
            <div style="
              text-align:center;
              font-size:12px;
              padding:4px 0;
              background:#222;
              border:1px solid #333;
              border-radius:4px
            ">${n}</div>
          `).join("")}
        </div>
      `;
    }
  }

  render();

})();
