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
    { nome:"ZERO", trios:[[32,0,26],[15,19,4],[21,2,25],[17,34,6]] },
    { nome:"TIERS", trios:[[36,13,27],[11,30,8],[23,10,5],[24,16,33]] },
    { nome:"ORPHELINS", trios:[[1,20,14],[31,9,22],[1,29,7],[28,12,35,3]] }
  ];

  // ================= ESTADO =================
  let timeline = [];
  let janela = 6;
  let modoConjuntos = false;
  let filtrosConjuntos = new Set();

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
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
      </div>
    </div>

    <div style="margin:10px 0">
      🕒 Timeline (14):
      <span id="tl" style="font-size:18px;font-weight:600"></span>
    </div>

    <div style="display:flex;gap:6px;margin-bottom:6px">
      <button id="btnConj" style="padding:6px;background:#444;color:#fff;border:1px solid #666">
        CONJUNTOS
      </button>
    </div>

    <div id="btnT" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"></div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
      <div><b>ZERO</b><div id="cZERO"></div></div>
      <div><b>TIERS</b><div id="cTIERS"></div></div>
      <div><b>ORPHELINS</b><div id="cORPH"></div></div>
    </div>

    <div id="conjTimeline" style="margin-top:12px"></div>

    <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>
  </div>
  `;

  // ================= BOTÕES T =================
  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.textContent="T"+t;
    b.style="padding:6px;background:#444;color:#fff;border:1px solid #666";
    b.onclick=()=>{
      filtrosConjuntos.has(t)
        ? filtrosConjuntos.delete(t)
        : filtrosConjuntos.add(t);
      render();
    };
    btnT.appendChild(b);
  }

  // ================= NÚMEROS =================
  for(let n=0;n<=36;n++){
    const b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>add(n);
    nums.appendChild(b);
  }

  btnConj.onclick=()=>{
    modoConjuntos=!modoConjuntos;
    btnConj.style.background = modoConjuntos ? "#00e676" : "#444";
    render();
  };

  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    render();
  }

  col.onclick=()=>{
    inp.value.split(/[\s,]+/)
      .map(Number)
      .filter(n=>n>=0&&n<=36)
      .forEach(add);
    inp.value="";
  };

  lim.onclick=()=>{
    timeline=[];
    filtrosConjuntos.clear();
    modoConjuntos=false;
    btnConj.style.background="#444";
    render();
  };

  function render(){
    tl.innerHTML = timeline.join(" · ");

    const trios = triosSelecionados(filtrosConjuntos);
    const por={ZERO:[],TIERS:[],ORPHELINS:[]};
    trios.forEach(x=>por[x.eixo].push(x.trio.join("-")));
    cZERO.innerHTML=por.ZERO.join("<div></div>");
    cTIERS.innerHTML=por.TIERS.join("<div></div>");
    cORPH.innerHTML=por.ORPHELINS.join("<div></div>");

    // ===== TIMELINE SECUNDÁRIA (CONJUNTOS) =====
    if(modoConjuntos){
      const marcados=new Set();
      filtrosConjuntos.forEach(t=>{
        track.forEach(n=>{
          if(terminal(n)===t){
            vizinhosRace(n).forEach(v=>marcados.add(v));
          }
        });
      });

      conjTimeline.innerHTML = `
        <div style="font-size:12px;margin-bottom:4px">Conjuntos (14):</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(24px,1fr));gap:4px">
          ${timeline.map(n=>`
            <div style="
              height:24px;
              display:flex;align-items:center;justify-content:center;
              background:${marcados.has(n)?"#00e676":"#222"};
              color:#fff;
              font-size:11px;
              border-radius:4px;
              border:1px solid #333;
            ">${n}</div>
          `).join("")}
        </div>
      `;
    } else {
      conjTimeline.innerHTML="";
    }
  }

  render();

})();
