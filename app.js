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
  let janela = 6;
  let modoAtivo = "MANUAL";
  let autoTCount = 0;

  const analises = {
    MANUAL: { filtros:new Set(), res:[] },
    AUTO:   { filtros:new Set(), res:[] },
    VIZINHO:{ filtros:new Set(), res:[] },
    NUNUM:  { filtros:new Set(), res:[] }
  };

  // ================= UTIL =================
  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [
      track[(i+36)%37],
      track[i],
      track[(i+1)%37]
    ];
  }

  // ================= AUTO =================
  function calcularAuto(){
    const set = new Set();
    for(const n of timeline.slice(0,janela)){
      set.add(terminal(n));
      if(set.size>=autoTCount) break;
    }
    analises.AUTO.filtros = set;
  }

  // ================= MELHOR TRINCA =================
  function melhorTrincaBase(){
    let cont = {};
    timeline.slice(0,janela).forEach(n=>{
      const t = terminal(n);
      cont[t] = (cont[t]||0)+1;
    });
    return Object.entries(cont)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,3)
      .map(x=>+x[0]);
  }

  // ================= VIZINHO (CORRETO) =================
  function calcularVizinho(){
    const base = melhorTrincaBase();
    analises.VIZINHO.filtros = new Set(base);

    // motor interno (race sobre trinca)
    analises.VIZINHO.motor = new Set();
    base.forEach(t=>{
      track.filter(n=>terminal(n)===t)
        .forEach(n=>vizinhosRace(n)
          .forEach(v=>analises.VIZINHO.motor.add(v))
        );
    });
  }

  // ================= NUNUM (CORRETO) =================
  function calcularNunum(){
    const set = new Set();
    timeline.slice(0,2).forEach(n=>{
      vizinhosRace(n).forEach(v=>set.add(terminal(v)));
    });
    analises.NUNUM.filtros = set;
  }

  // ================= TRIOS =================
  function triosSelecionados(filtros){
    let lista=[];
    eixos.forEach(e=>{
      e.trios.forEach(trio=>{
        const inter = trio.map(terminal)
          .filter(t=>!filtros.size||filtros.has(t)).length;
        if(inter>0) lista.push({eixo:e.nome,trio,score:inter});
      });
    });
    lista.sort((a,b)=>b.score-a.score);
    return lista.slice(0,9);
  }

  function validar(n, modo){
    if(modo==="VIZINHO"){
      return analises.VIZINHO.motor?.has(n);
    }
    const trios = triosSelecionados(analises[modo].filtros);
    return trios.some(x=>x.trio.includes(n));
  }

  function registrar(n){
    Object.keys(analises).forEach(m=>{
      const ok = validar(n,m);
      analises[m].res.unshift(ok?"V":"X");
      if(analises[m].res.length>timeline.length)
        analises[m].res.length=timeline.length;
    });
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML=`
  <div style="padding:10px;max-width:1000px;margin:auto">
    <h3 style="text-align:center">CSM</h3>

    <div style="border:1px solid #444;padding:8px">
      Histórico:
      <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
      <div style="margin-top:6px;display:flex;gap:10px;flex-wrap:wrap">
        <button id="col">Colar</button>
        <button id="lim">Limpar</button>
        Janela:
        <select id="jan">${Array.from({length:8},(_,i)=>`<option ${i+3===6?'selected':''}>${i+3}</option>`).join("")}</select>
        Auto T:
        <select id="autoT">
          <option value="0">Manual</option>
          ${[2,3,4,5,6,7].map(n=>`<option>${n}</option>`).join("")}
        </select>
      </div>
    </div>

    <div style="margin:10px 0">
      🕒 Timeline (14):
      <span id="tl" style="font-size:17px;font-weight:600"></span>
    </div>

    <div style="display:flex;gap:6px;margin-bottom:8px">
      ${["MANUAL","AUTO","VIZINHO","NUNUM"].map(m=>`
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
  document.querySelectorAll(".modo").forEach(b=>{
    b.onclick=()=>{
      modoAtivo=b.dataset.m;
      if(modoAtivo==="VIZINHO") calcularVizinho();
      if(modoAtivo==="NUNUM") calcularNunum();
      render();
    };
  });

  document.getElementById("jan").onchange=e=>{
    janela=+e.target.value;
    render();
  };

  document.getElementById("autoT").onchange=e=>{
    autoTCount=+e.target.value;
    if(autoTCount>0) calcularAuto();
    modoAtivo="AUTO";
    render();
  };

  // ================= BOTÕES =================
  const btnT=document.getElementById("btnT");
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
    document.getElementById("nums").appendChild(b);
  }

  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    registrar(n);
    if(autoTCount>0) calcularAuto();
    calcularVizinho();
    calcularNunum();
    render();
  }

  document.getElementById("col").onclick=()=>{
    document.getElementById("inp").value
      .split(/[\s,]+/).map(Number)
      .filter(n=>n>=0&&n<=36).forEach(add);
    document.getElementById("inp").value="";
  };

  document.getElementById("lim").onclick=()=>{
    timeline=[];
    Object.values(analises).forEach(a=>a.res=[]);
    render();
  };

  // ================= RENDER =================
  function render(){
    document.querySelectorAll(".modo").forEach(b=>{
      b.style.background=b.dataset.m===modoAtivo?"#00e676":"#444";
    });

    const res=analises[modoAtivo].res;
    tl.innerHTML=timeline.map((n,i)=>{
      const r=res[i];
      const c=r==="V"?"#00e676":r==="X"?"#ff5252":"#ccc";
      return `<span style="color:${c}">${n}</span>`;
    }).join(" · ");

    document.querySelectorAll("#btnT button").forEach(b=>{
      const t=+b.textContent.slice(1);
      b.style.background =
        analises[modoAtivo].filtros.has(t) ? "#00e676" : "#444";
    });

    const trios=triosSelecionados(analises[modoAtivo].filtros);
    const por={ZERO:[],TIERS:[],ORPHELINS:[]};
    trios.forEach(x=>por[x.eixo].push(x.trio.join("-")));
    cZERO.innerHTML=por.ZERO.join("<div></div>");
    cTIERS.innerHTML=por.TIERS.join("<div></div>");
    cORPH.innerHTML=por.ORPHELINS.join("<div></div>");
  }

  render();

})();
