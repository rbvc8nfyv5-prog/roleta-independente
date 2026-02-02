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
  let autoTCount = 0;
  let modoAtivo = "MANUAL";

  const analises = {
    MANUAL: { filtros:new Set(), res:[] },
    AUTO:   { filtros:new Set(), res:[] },
    VIZINHO:{ filtros:new Set(), res:[] },
    NUNUM:  { filtros:new Set(), res:[] }
  };

  // ================= AUTO TERMINAIS =================
  function calcularAutoTerminais(){
    if(autoTCount < 2) return;
    const set = new Set();
    for(const n of timeline){
      set.add(terminal(n));
      if(set.size >= autoTCount) break;
    }
    analises.AUTO.filtros = set;
  }

  // ================= TRIOS =================
  function triosSelecionados(filtros){
    let candidatos=[];
    eixos.forEach(e=>{
      e.trios.forEach(trio=>{
        const ts = trio.map(terminal);
        const inter = ts.filter(t=>!filtros.size||filtros.has(t)).length;
        if(inter>0) candidatos.push({eixo:e.nome,trio,score:inter});
      });
    });
    candidatos.sort((a,b)=>b.score-a.score);
    return candidatos.slice(0,9); // 8–9
  }

  function validarNumero(n, trios){
    return trios.some(t=>t.trio.includes(n));
  }

  // ================= REGISTRAR RESULTADO =================
  function registrarResultado(n){
    Object.keys(analises).forEach(m=>{
      const filtros = analises[m].filtros;
      const trios = triosSelecionados(filtros);
      const ok = validarNumero(n,trios);
      analises[m].res.unshift(ok?"V":"X");
      if(analises[m].res.length>timeline.length)
        analises[m].res.length=timeline.length;
    });
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
        Auto T:
        <select id="autoT">
          <option value="0">Manual</option>
          <option>2</option><option>3</option><option>4</option>
          <option>5</option><option>6</option><option>7</option>
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
          style="padding:6px;background:#444;color:#fff;border:1px solid #666">
          ${m}
        </button>`).join("")}
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

  // ================= MODOS =================
  document.querySelectorAll(".modo").forEach(b=>{
    b.onclick=()=>{
      modoAtivo=b.dataset.m;
      render();
    };
  });

  // ================= BOTÕES T =================
  const btnT=document.getElementById("btnT");
  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.textContent="T"+t;
    b.style="padding:6px;background:#444;color:#fff;border:1px solid #666";
    b.onclick=()=>{
      modoAtivo="MANUAL";
      const s=analises.MANUAL.filtros;
      s.has(t)?s.delete(t):s.add(t);
      render();
    };
    btnT.appendChild(b);
  }

  // ================= NUMBERS =================
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
    registrarResultado(n);
    if(autoTCount>0) calcularAutoTerminais();
    render();
  }

  document.getElementById("autoT").onchange=e=>{
    autoTCount=+e.target.value;
    analises.AUTO.filtros.clear();
    if(autoTCount>0) calcularAutoTerminais();
    modoAtivo="AUTO";
    render();
  };

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
    const res = analises[modoAtivo].res;
    document.getElementById("tl").innerHTML =
      timeline.map((n,i)=>{
        const r=res[i];
        const c=r==="V"?"#00e676":r==="X"?"#ff5252":"#ccc";
        return `<span style="color:${c}">${n}</span>`;
      }).join(" · ");

    document.querySelectorAll("#btnT button").forEach(b=>{
      const t=+b.textContent.slice(1);
      b.style.background =
        analises[modoAtivo].filtros.has(t) ? "#00e676" : "#444";
    });

    const trios = triosSelecionados(analises[modoAtivo].filtros);
    const por={ZERO:[],TIERS:[],ORPHELINS:[]};
    trios.forEach(x=>por[x.eixo].push(x.trio.join("-")));

    cZERO.innerHTML=por.ZERO.join("<div></div>");
    cTIERS.innerHTML=por.TIERS.join("<div></div>");
    cORPH.innerHTML=por.ORPHELINS.join("<div></div>");
  }

  render();

})();
