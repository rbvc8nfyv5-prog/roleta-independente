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
  let modoAtivo = "MANUAL";

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

      <!-- LINHAS MANUAL -->
      <div id="manualSec" style="margin-bottom:10px"></div>

      <!-- BOTÕES MODO -->
      <div style="display:flex;gap:6px;margin-bottom:6px">
        <button id="btnManual">MANUAL</button>
        <button id="btnConj">CONJUNTOS</button>
      </div>

      <!-- TERMINAIS -->
      <div style="border:1px solid #555;padding:8px;margin-bottom:10px">
        Terminais:
        <div id="btnT" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
      </div>

      <!-- TRIOS -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div><b>ZERO</b><div id="cZERO"></div></div>
        <div><b>TIERS</b><div id="cTIERS"></div></div>
        <div><b>ORPHELINS</b><div id="cORPH"></div></div>
      </div>

      <!-- LINHA CONJUNTOS -->
      <div id="conjArea" style="margin-top:12px"></div>

      <!-- BOTÕES 0-36 -->
      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>

    </div>
  `;

  // ================= BOTÕES TERMINAIS =================
  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.textContent="T"+t;

    b.onclick=()=>{
      filtrosConjuntos.has(t)
        ? filtrosConjuntos.delete(t)
        : filtrosConjuntos.add(t);

      render();
    };

    btnT.appendChild(b);
  }

  // ================= BOTÕES 0 A 36 =================
  for(let n=0;n<=36;n++){
    const b=document.createElement("button");
    b.textContent=n;
    b.onclick=()=>add(n);
    nums.appendChild(b);
  }

  // ================= EVENTOS =================
  btnManual.onclick=()=>{
    modoConjuntos=false;
    modoAtivo="MANUAL";
    render();
  };

  btnConj.onclick=()=>{
    modoConjuntos=true;
    render();
  };

  col.onclick=()=>{
    inp.value.split(/[\s,]+/)
      .map(Number)
      .filter(n=>n>=0 && n<=36)
      .forEach(add);

    inp.value="";
  };

  lim.onclick=()=>{
    timeline=[];
    filtrosConjuntos.clear();
    render();
  };

  // ================= ADD =================
  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    render();
  }

  // ================= RENDER =================
  function render(){

    tl.innerHTML = timeline.join(" · ");

    // ===== MANUAL =====
    if(modoAtivo==="MANUAL"){

      manualSec.innerHTML = gruposManual.map(grupo=>{

        const marcados=new Set();

        track.forEach(n=>{
          if(grupo.has(terminal(n))){
            vizinhosRace(n).forEach(v=>marcados.add(v));
          }
        });

        return `
          <div style="display:flex;gap:3px;margin-top:4px">
            ${timeline.map(n=>`
              <span style="
                padding:3px 5px;
                background:${marcados.has(n)?"#00e676":"#222"};
                border-radius:3px;
              ">${n}</span>
            `).join("")}
          </div>
        `;

      }).join("");

    } else {
      manualSec.innerHTML="";
    }

    // ===== CONJUNTOS =====
    if(modoConjuntos){

      const marcados=new Set();

      filtrosConjuntos.forEach(t=>{
        track.forEach(n=>{
          if(terminal(n)===t){
            vizinhosRace(n).forEach(v=>marcados.add(v));
          }
        });
      });

      conjArea.innerHTML = `
        <div style="display:flex;gap:3px">
          ${timeline.map(n=>`
            <span style="
              padding:3px 5px;
              background:${marcados.has(n)?"#00e676":"#222"};
              border-radius:3px;
            ">${n}</span>
          `).join("")}
        </div>
      `;

    } else {
      conjArea.innerHTML="";
    }

    // ===== DESTACAR BOTÕES T =====
    document.querySelectorAll("#btnT button").forEach(b=>{
      const t=+b.textContent.slice(1);
      b.style.background = filtrosConjuntos.has(t) ? "#00e676" : "#444";
    });

    // ===== MOSTRAR TRIOS =====
    cZERO.innerHTML = eixos[0].trios.map(t=>t.join("-")).join("<div></div>");
    cTIERS.innerHTML = eixos[1].trios.map(t=>t.join("-")).join("<div></div>");
    cORPH.innerHTML = eixos[2].trios.map(t=>t.join("-")).join("<div></div>");
  }

  render();

})();
