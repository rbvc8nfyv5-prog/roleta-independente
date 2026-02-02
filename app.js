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
      nome: "ZERO",
      trios: [
        [0,32,15],
        [19,4,21],
        [2,25,17],
        [34,6,27]
      ]
    },
    {
      nome: "TIERS",
      trios: [
        [13,36,11],
        [30,8,23],
        [10,5,24],
        [16,33,1]
      ]
    },
    {
      nome: "ORPHELINS",
      trios: [
        [20,14,31],
        [9,22,18],
        [7,29,28],
        [12,35,3]
      ]
    }
  ];

  // ================= ESTADO =================
  let timeline = [];
  let filtrosT = new Set();
  let autoTCount = 0;
  let modoAtivo = "MANUAL"; // MANUAL | VIZINHO | NUNUM | AUTO

  // ================= AUTO TERMINAIS =================
  function calcularAutoTerminais(){
    if (autoTCount < 2) return;
    const set = new Set();
    for (const n of timeline) {
      set.add(terminal(n));
      if (set.size >= autoTCount) break;
    }
    filtrosT = set;
    atualizarBotoesT();
  }

  function atualizarBotoesT(){
    document.querySelectorAll("#btnT button").forEach(b=>{
      const t = +b.dataset.t;
      b.style.background = filtrosT.has(t) ? "#00e676" : "#444";
    });
  }

  // ================= MODOS =================
  function atualizarBotoesModo(){
    document.querySelectorAll(".modo").forEach(b=>{
      b.style.background =
        b.dataset.m === modoAtivo ? "#00e676" : "#444";
    });
  }

  // ================= TRIOS =================
  function triosSelecionados(){
    let candidatos = [];

    eixos.forEach(e=>{
      e.trios.forEach(trio=>{
        const trioTs = trio.map(terminal);
        let inter = 0;
        trioTs.forEach(t=>{
          if (!filtrosT.size || filtrosT.has(t)) inter++;
        });
        candidatos.push({
          eixo: e.nome,
          trio,
          score: inter / trioTs.length
        });
      });
    });

    candidatos.sort((a,b)=>b.score - a.score);

    const pick = [];
    const usados = new Set();

    const add = x=>{
      const k = x.eixo + "|" + x.trio.join("-");
      if(!usados.has(k)){
        usados.add(k);
        pick.push(x);
      }
    };

    ["ZERO","TIERS","ORPHELINS"].forEach(nome=>{
      candidatos.filter(x=>x.eixo===nome && x.score>0)
        .slice(0,3)
        .forEach(add);
    });

    for(const c of candidatos){
      if(pick.length >= 9) break;
      add(c);
    }

    return pick.slice(0,9);
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
        <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>

          <button class="modo" data-m="MANUAL">Manual</button>
          <button class="modo" data-m="VIZINHO">Vizinho</button>
          <button class="modo" data-m="NUNUM">Nunum</button>

          Auto-T:
          <select id="autoT">
            <option value="0">Off</option>
            <option>2</option><option>3</option><option>4</option>
            <option>5</option><option>6</option><option>7</option>
          </select>
        </div>
      </div>

      <div style="margin:10px 0">
        🕒 Timeline (14):
        <span id="tl" style="font-size:18px;font-weight:600"></span>
      </div>

      <div style="border:1px solid #555;padding:8px;margin-bottom:10px">
        Terminais:
        <div id="btnT" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div style="border:1px solid #ff5252;padding:8px">
          <b>ZERO</b><div id="cZERO"></div>
        </div>
        <div style="border:1px solid #42a5f5;padding:8px">
          <b>TIERS</b><div id="cTIERS"></div>
        </div>
        <div style="border:1px solid #66bb6a;padding:8px">
          <b>ORPHELINS</b><div id="cORPH"></div>
        </div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>
    </div>
  `;

  // ================= BOTÕES T =================
  const btnT = document.getElementById("btnT");
  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.dataset.t=t;
    b.textContent="T"+t;
    b.style="padding:6px;background:#444;color:#fff;border:1px solid #666";
    b.onclick=()=>{
      modoAtivo = "MANUAL";
      autoTCount=0;
      document.getElementById("autoT").value="0";
      filtrosT.has(t)?filtrosT.delete(t):filtrosT.add(t);
      atualizarBotoesT();
      atualizarBotoesModo();
      render();
    };
    btnT.appendChild(b);
  }

  // ================= EVENTOS =================
  document.querySelectorAll(".modo").forEach(b=>{
    b.onclick=()=>{
      modoAtivo = b.dataset.m;
      atualizarBotoesModo();
      render();
    };
  });

  document.getElementById("autoT").onchange=e=>{
    autoTCount=+e.target.value;
    filtrosT.clear();
    if(autoTCount>0){
      modoAtivo="AUTO";
      calcularAutoTerminais();
    } else {
      modoAtivo="MANUAL";
    }
    atualizarBotoesModo();
    render();
  };

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
    if(autoTCount>0) calcularAutoTerminais();
    render();
  }

  document.getElementById("col").onclick=()=>{
    document.getElementById("inp").value
      .split(/[\s,]+/)
      .map(Number)
      .filter(n=>n>=0&&n<=36)
      .forEach(add);
    document.getElementById("inp").value="";
  };

  document.getElementById("lim").onclick=()=>{
    timeline=[];
    filtrosT.clear();
    autoTCount=0;
    modoAtivo="MANUAL";
    document.getElementById("autoT").value="0";
    atualizarBotoesT();
    atualizarBotoesModo();
    render();
  };

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");

    const trios = triosSelecionados();
    const por = { ZERO:[], TIERS:[], ORPHELINS:[] };

    trios.forEach(x=>{
      por[x.eixo].push(x.trio.join("-"));
    });

    document.getElementById("cZERO").innerHTML = por.ZERO.map(x=>`<div>${x}</div>`).join("");
    document.getElementById("cTIERS").innerHTML = por.TIERS.map(x=>`<div>${x}</div>`).join("");
    document.getElementById("cORPH").innerHTML = por.ORPHELINS.map(x=>`<div>${x}</div>`).join("");

    atualizarBotoesModo();
  }

  render();

})();
