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
    {
      nome:"ZERO",
      trios:[
        [32,0,26,3,35],
        [15,19,4,21,2],
        [25,17,34,6,27]
      ]
    },
    {
      nome:"TIERS",
      trios:[
        [13,36,11,30,8,23],
        [10,5,24,16,33,1]
      ]
    },
    {
      nome:"ORPHELINS",
      trios:[
        [20,14,31,9,22],
        [18,29,7,28,12]
      ]
    }
  ];

  // ================= ESTADO =================
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
  let modoConjuntos = false;
  let filtrosConjuntos = new Set();
  let resConjuntos = []; // 🔧 AJUSTE: timeline secundária

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
  }

  // ================= LÓGICAS =================
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
    analises.VIZINHO.res.unshift(analises.VIZINHO.motor.has(n)?"V":"X");
    analises.NUNUM.res.unshift(validar(n,analises.NUNUM.filtros)?"V":"X");
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
        <span id="tl"></span>
      </div>

      <div style="display:flex;gap:6px;margin-bottom:6px">
        <button id="btnConj" style="padding:6px;background:#444;color:#fff;border:1px solid #666">
          CONJUNTOS
        </button>
      </div>

      <div style="border:1px solid #555;padding:8px;margin-bottom:6px">
        Terminais:
        <div id="btnT" style="display:flex;gap:6px;flex-wrap:wrap"></div>
      </div>

      <!-- 🔧 AJUSTE: timeline secundária -->
      <div id="tlConj" style="margin:6px 0;font-weight:600"></div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>
    </div>
  `;

  const tl = document.getElementById("tl");
  const tlConj = document.getElementById("tlConj");
  const btnT = document.getElementById("btnT");
  const btnConj = document.getElementById("btnConj");

  btnConj.onclick=()=>{
    modoConjuntos = !modoConjuntos;
    btnConj.style.background = modoConjuntos ? "#00e676" : "#444";
    render();
  };

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

  // ================= BOTÕES NUM =================
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

    // 🔧 AJUSTE: registra timeline secundária do conjunto
    if(modoConjuntos){
      const marcados = new Set();
      filtrosConjuntos.forEach(t=>{
        track.forEach(x=>{
          if(terminal(x)===t){
            vizinhosRace(x).forEach(v=>marcados.add(v));
          }
        });
      });
      resConjuntos.unshift(marcados.has(n)?"V":"X");
      if(resConjuntos.length>14) resConjuntos.pop();
    }

    registrar(n);
    render();
  }

  function render(){
    // timeline principal
    tl.innerHTML = timeline.join(" · ");

    // 🔧 AJUSTE: T acesos no conjunto
    document.querySelectorAll("#btnT button").forEach(b=>{
      const t=+b.textContent.slice(1);
      b.style.background = filtrosConjuntos.has(t) ? "#00e676" : "#444";
    });

    // 🔧 AJUSTE: timeline secundária
    if(modoConjuntos){
      tlConj.innerHTML = timeline.map((n,i)=>{
        const r=resConjuntos[i];
        const c=r==="V"?"#00e676":r==="X"?"#ff5252":"#aaa";
        return `<span style="color:${c}">${n}</span>`;
      }).join(" · ");
    } else {
      tlConj.innerHTML = "";
    }
  }

  render();

})();
