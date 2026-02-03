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
  let conjuntoHist = [];
  let janela = 6;
  let modoAtivo = "MANUAL";
  let autoTAtivo = null;
  let modoConjuntos = false;

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

  function triosSelecionados(filtros){
    let lista=[];
    eixos.forEach(e=>{
      e.trios.forEach(trio=>{
        const inter = trio.map(terminal)
          .filter(t=>!filtros.size || filtros.has(t)).length;
        if(inter>0) lista.push({eixo:e.nome,trio});
      });
    });
    return lista.slice(0,9);
  }

  function validar(n,filtros){
    return triosSelecionados(filtros).some(x=>x.trio.includes(n));
  }

  function registrar(n){
    analises.MANUAL.res.unshift(validar(n,analises.MANUAL.filtros)?"V":"X");
    analises.VIZINHO.res.unshift(analises.VIZINHO.motor.has(n)?"V":"X");
    analises.NUNUM.res.unshift(validar(n,analises.NUNUM.filtros)?"V":"X");
    [3,4,5,6,7].forEach(k=>{
      analises.AUTO[k].res.unshift(
        validar(n,analises.AUTO[k].filtros)?"V":"X"
      );
    });
  }

  // ================= UI =================
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

      <div style="display:flex;gap:6px;margin-bottom:6px">
        ${["MANUAL","VIZINHO","NUNUM"].map(m=>`
          <button class="modo" data-m="${m}"
            style="padding:6px;background:#444;color:#fff;border:1px solid #666">${m}</button>`).join("")}
      </div>

      <div style="display:flex;gap:6px;margin-bottom:10px">
        ${[3,4,5,6,7].map(n=>`
          <button class="auto" data-a="${n}"
            style="padding:6px;background:#444;color:#fff;border:1px solid #666">A${n}</button>`).join("")}
      </div>

      <div style="border:1px solid #555;padding:8px;margin-bottom:10px">
        Terminais:
        <div id="btnT" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px"></div>
    </div>
  `;

  // ================= BOTÕES =================
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

  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.textContent="T"+t;
    b.style="padding:6px;background:#444;color:#fff;border:1px solid #666";
    b.onclick=()=>{
      modoAtivo="MANUAL";
      analises.MANUAL.filtros.has(t)
        ? analises.MANUAL.filtros.delete(t)
        : analises.MANUAL.filtros.add(t);
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
    conjuntoHist.unshift(n);
    if(conjuntoHist.length>30) conjuntoHist.pop();
    registrar(n);
    render();
  }

  function render(){
    const res =
      modoAtivo==="AUTO"
        ? analises.AUTO[autoTAtivo]?.res || []
        : analises[modoAtivo].res;

    tl.innerHTML = timeline.map((n,i)=>{
      const r=res[i];
      const c=r==="V"?"#00e676":r==="X"?"#ff5252":"#aaa";
      return `<span style="color:${c}">${n}</span>`;
    }).join(" · ");

    document.querySelectorAll(".modo,.auto").forEach(b=>{
      b.style.background =
        (b.dataset.m===modoAtivo || +b.dataset.a===autoTAtivo)
          ? "#00e676" : "#444";
    });

    document.querySelectorAll("#btnT button").forEach(b=>{
      const t=+b.textContent.slice(1);
      b.style.background =
        analises.MANUAL.filtros.has(t) && modoAtivo==="MANUAL"
          ? "#00e676" : "#444";
    });
  }

  render();

})();
