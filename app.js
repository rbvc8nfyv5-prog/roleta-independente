(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];
  const terminal = n => n % 10;

  // ===== CORES POR TERMINAL =====
  const corTerminal = {
    0:"#ff5252",
    1:"#ff9800",
    2:"#ffc107",
    3:"#00e676",
    4:"#00bcd4",
    5:"#2196f3",
    6:"#9c27b0",
    7:"#e91e63",
    8:"#8bc34a",
    9:"#ff00ff"
  };

  const eixos = [
    { nome:"ZERO", trios:[[0,32,15],[19,4,21],[2,25,17],[34,6,27]] },
    { nome:"TIERS", trios:[[13,36,11],[30,8,23],[10,5,24],[16,33,1]] },
    { nome:"ORPHELINS", trios:[[20,14,31],[9,22,18],[7,29,28],[12,35,3]] }
  ];

  let timeline = [];
  let janela = 6;

  const analises = {
    MANUAL: { filtros:new Set(), res:[] }
  };

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

  function validar(n, filtros){
    return triosSelecionados(filtros).some(x=>x.trio.includes(n));
  }

  function registrar(n){
    analises.MANUAL.res.unshift(
      validar(n,analises.MANUAL.filtros)?"V":"X"
    );
  }

  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:1000px;margin:auto">
      <h3 style="text-align:center">CSM</h3>

      <div style="margin:10px 0">
        🕒 Timeline:
        <span id="tl" style="font-size:18px;font-weight:600"></span>
      </div>

      <div style="border:1px solid #555;padding:8px;margin-bottom:10px">
        Terminais:
        <div id="btnT" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div><b>ZERO</b><div id="cZERO"></div></div>
        <div><b>TIERS</b><div id="cTIERS"></div></div>
        <div><b>ORPHELINS</b><div id="cORPH"></div></div>
      </div>

      <!-- ===== QUADRO ÍMPARES / PARES (ADICIONADO) ===== -->
      <div style="margin-top:15px;border:1px solid #444;padding:8px">
        <b>Ímpares / Pares (Últimos 14)</b>
        <div id="parImparBox" style="margin-top:6px;font-weight:700;font-size:16px"></div>
      </div>

      <div id="conjArea" style="display:none;margin-top:12px;overflow-x:auto"></div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>
    </div>
  `;

  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.textContent="T"+t;
    b.style="padding:6px;background:#444;color:#fff;border:1px solid #666";
    b.onclick=()=>{
      if(analises.MANUAL.filtros.has(t)){
        analises.MANUAL.filtros.delete(t);
        filtrosConjuntos.delete(t);
      } else {
        analises.MANUAL.filtros.add(t);
        filtrosConjuntos.add(t);
      }
      render();
    };
    btnT.appendChild(b);
  }

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

  function render(){

    const res = analises.MANUAL.res;

    tl.innerHTML = timeline.map((n,i)=>{
      const r=res[i];
      const c=r==="V"?"#00e676":r==="X"?"#ff5252":"#aaa";
      return `<span style="color:${c}">${n}</span>`;
    }).join(" · ");

    const filtros = analises.MANUAL.filtros;

    document.querySelectorAll("#btnT button").forEach(b=>{
      const t=+b.textContent.slice(1);
      b.style.background =
        filtros.has(t) ? corTerminal[t] : "#444";
    });

    const trios = triosSelecionados(filtros);
    const por={ZERO:[],TIERS:[],ORPHELINS:[]};
    trios.forEach(x=>por[x.eixo].push(x.trio.join("-")));
    cZERO.innerHTML=por.ZERO.join("<div></div>");
    cTIERS.innerHTML=por.TIERS.join("<div></div>");
    cORPH.innerHTML=por.ORPHELINS.join("<div></div>");

    // ===== CONTAGEM ÍMPARES / PARES =====

    let pares = 0;
    let impares = 0;

    timeline.forEach(n=>{
      if(n === 0) return;
      if(n % 2 === 0) pares++;
      else impares++;
    });

    const corMaior = "#ff6d00";     // Laranja fluorescente
    const corMenor = "#00e5ff";     // Azul fluorescente

    let corPar = "#fff";
    let corImpar = "#fff";

    if(pares > impares){
      corPar = corMaior;
      corImpar = corMenor;
    } else if(impares > pares){
      corImpar = corMaior;
      corPar = corMenor;
    }

    parImparBox.innerHTML = `
      <span style="color:${corImpar}">Ímpares: ${impares}</span>
      &nbsp;&nbsp;|&nbsp;&nbsp;
      <span style="color:${corPar}">Pares: ${pares}</span>
    `;

    // ===== LINHA SECUNDÁRIA ORIGINAL =====

    if(filtros.size > 0){

      const mapaCores = {};

      filtros.forEach(t=>{
        track.forEach(n=>{
          if(terminal(n)===t){
            vizinhosRace(n).forEach(v=>{
              if(!mapaCores[v]){
                mapaCores[v] = corTerminal[t];
              }
            });
          }
        });
      });

      conjArea.style.display = "block";

      conjArea.innerHTML = `
        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit, minmax(26px, 1fr));
          gap:4px;
        ">
          ${timeline.map(n=>`
            <div style="
              height:26px;
              display:flex;align-items:center;justify-content:center;
              background:${mapaCores[n] || "#222"};
              color:#fff;font-size:10px;font-weight:700;
              border-radius:4px;border:1px solid #333;
            ">${n}</div>
          `).join("")}
        </div>
      `;
    } else {
      conjArea.style.display = "none";
    }
  }

  render();

})();
