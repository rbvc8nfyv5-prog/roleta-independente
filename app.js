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
  const eixos = {
    ZERO:       [0,32,15,19,4,21,2,25,17,34,6,27],
    TIERS:      [13,36,11,30,8,23,10,5,24,16,33,1],
    ORPHELINS:  [20,14,31,9,22,18,7,29,28,12,35,3]
  };

  // ================= ESTADO =================
  let timeline = [];
  let janela = 6;
  let modoAtivo = "MANUAL";
  let autoTAtivo = null;

  const analises = {
    MANUAL: { filtros:new Set(), res:[] },
    VIZINHO:{ filtros:new Set(), res:[] },
    NUNUM:  { filtros:new Set(), res:[] },
    AUTO: {
      2:{ filtros:new Set(), res:[] },
      3:{ filtros:new Set(), res:[] },
      4:{ filtros:new Set(), res:[] },
      5:{ filtros:new Set(), res:[] },
      6:{ filtros:new Set(), res:[] },
      7:{ filtros:new Set(), res:[] },
      8:{ filtros:new Set(), res:[] },
      9:{ filtros:new Set(), res:[] },
      10:{ filtros:new Set(), res:[] }
    }
  };

  // ================= UTIL =================
  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [
      track[(i+36)%37],
      n,
      track[(i+1)%37]
    ];
  }

  function calcularAutoT(k){
    const set = new Set();
    for (const n of timeline.slice(0,janela)) {
      set.add(terminal(n));
      if (set.size >= k) break;
    }
    analises.AUTO[k].filtros = set;
  }

  function calcularVizinho(){
    const cont = {};
    timeline.slice(0,janela).forEach(n=>{
      const t = terminal(n);
      cont[t] = (cont[t]||0)+1;
    });
    const base = Object.entries(cont)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,3)
      .map(x=>+x[0]);

    const set = new Set();
    base.forEach(t=>{
      track.filter(n=>terminal(n)===t)
        .forEach(n=>vizinhosRace(n)
          .forEach(v=>set.add(terminal(v)))
        );
    });
    analises.VIZINHO.filtros = set;
  }

  function calcularNunum(){
    const set = new Set();
    timeline.slice(0,2).forEach(n=>{
      vizinhosRace(n).forEach(v=>set.add(terminal(v)));
    });
    analises.NUNUM.filtros = set;
  }

  // ================= TRIOS DINÂMICOS POR EIXO =================
  function gerarTriosDinamicos(filtros){
    const usados = new Set();
    const trios = [];

    Object.entries(eixos).forEach(([nome, nums])=>{
      let count = 0;
      for(let i=0;i<nums.length-2;i++){
        const trio = [nums[i], nums[i+1], nums[i+2]];
        if (trio.some(n=>usados.has(n))) continue;

        const ok = trio.some(n=>!filtros.size || filtros.has(terminal(n)));
        if (!ok) continue;

        trio.forEach(n=>usados.add(n));
        trios.push({ eixo:nome, trio });
        count++;
        if (count >= 3) break;
        if (trios.length >= 9) break;
      }
    });

    return trios.slice(0,9);
  }

  function registrar(n){
    Object.keys(analises).forEach(k=>{
      if(k==="AUTO"){
        Object.keys(analises.AUTO).forEach(x=>{
          analises.AUTO[x].res.unshift(
            gerarTriosDinamicos(analises.AUTO[x].filtros)
              .some(t=>t.trio.includes(n)) ? "V":"X"
          );
        });
      } else {
        analises[k].res.unshift(
          gerarTriosDinamicos(analises[k].filtros)
            .some(t=>t.trio.includes(n)) ? "V":"X"
        );
      }
    });
  }

  // ================= UI (layout preservado) =================
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
            ${Array.from({length:8},(_,i)=>`<option>${i+3}</option>`).join("")}
          </select>
          Auto T:
          <select id="autoT">
            <option value="">Manual</option>
            ${Array.from({length:9},(_,i)=>`<option>${i+2}</option>`).join("")}
          </select>
        </div>
      </div>

      <div style="margin:10px 0">
        🕒 Timeline (14):
        <span id="tl" style="font-size:18px;font-weight:600"></span>
      </div>

      <div style="display:flex;gap:6px;margin-bottom:8px">
        ${["MANUAL","VIZINHO","NUNUM"].map(m=>`
          <button class="modo" data-m="${m}"
            style="padding:6px;background:#444;color:#fff;border:1px solid #666">${m}</button>`).join("")}
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

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>
    </div>
  `;

  // ================= EVENTOS =================
  jan.onchange=e=>{ janela=+e.target.value; render(); };

  autoT.onchange=e=>{
    autoTAtivo=+e.target.value;
    modoAtivo="AUTO";
    calcularAutoT(autoTAtivo);
    render();
  };

  document.querySelectorAll(".modo").forEach(b=>{
    b.onclick=()=>{
      modoAtivo=b.dataset.m;
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
    registrar(n);
    calcularVizinho();
    calcularNunum();
    Object.keys(analises.AUTO).forEach(calcularAutoT);
    render();
  }

  col.onclick=()=>{
    inp.value.split(/[\s,]+/)
      .map(Number).filter(n=>n>=0&&n<=36).forEach(add);
    inp.value="";
  };

  lim.onclick=()=>{
    timeline=[];
    Object.values(analises).forEach(a=>{
      if(a.res) a.res=[];
      if(a.filtros) a.filtros.clear();
    });
    render();
  };

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

    const filtros =
      modoAtivo==="AUTO"
        ? analises.AUTO[autoTAtivo]?.filtros || new Set()
        : analises[modoAtivo].filtros;

    document.querySelectorAll("#btnT button").forEach(b=>{
      const t=+b.textContent.slice(1);
      b.style.background = filtros.has(t)?"#00e676":"#444";
    });

    const trios = gerarTriosDinamicos(filtros);
    const por={ZERO:[],TIERS:[],ORPHELINS:[]};
    trios.forEach(x=>por[x.eixo].push(x.trio.join("-")));
    cZERO.innerHTML=por.ZERO.join("<div></div>");
    cTIERS.innerHTML=por.TIERS.join("<div></div>");
    cORPH.innerHTML=por.ORPHELINS.join("<div></div>");
  }

  render();

})();
