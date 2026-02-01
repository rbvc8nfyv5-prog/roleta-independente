(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const terminal = n => n % 10;

  function vizinhos(n){
    const i = track.indexOf(n);
    return [
      track[(i+36)%37],
      track[(i+1)%37]
    ];
  }

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
  let janela = 6;

  let filtrosT = new Set();
  let autoTCount = 0;
  let modoVizinho = false;
  let modoNumNum = false;

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

  // ================= VIZINHO =================
  function calcularVizinhoTerminais(){
    const cont = {};
    timeline.slice(0,janela).forEach(n=>{
      vizinhos(n).forEach(v=>{
        const t = terminal(v);
        cont[t] = (cont[t]||0)+1;
      });
    });

    const tops = Object.entries(cont)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,3)
      .map(x=>parseInt(x[0],10));

    filtrosT = new Set(tops);
    atualizarBotoesT();
  }

  // ================= NUMERO–NUMERO =================
  function calcularNumeroNumero(){
    if (timeline.length < 2) return;

    const set = new Set();
    const [a,b] = timeline;

    [a,b].forEach(n=>{
      set.add(terminal(n));
      vizinhos(n).forEach(v=>{
        set.add(terminal(v));
      });
    });

    filtrosT = set;
    atualizarBotoesT();
  }

  function atualizarBotoesT(){
    document.querySelectorAll("#btnT button").forEach(b=>{
      const t = parseInt(b.dataset.t,10);
      b.style.background = filtrosT.has(t) ? "#00e676" : "#333";
    });
  }

  // ================= TRIOS =================
  function triosSelecionados9(){
    let candidatos = [];
    eixos.forEach(e=>{
      e.trios.forEach(trio=>{
        const ts = trio.map(terminal);
        let inter = ts.filter(t=>!filtrosT.size || filtrosT.has(t)).length;
        const score = inter / ts.length;
        if(score>0){
          candidatos.push({ eixo:e.nome, trio, score });
        }
      });
    });
    candidatos.sort((a,b)=>b.score-a.score);
    return candidatos.slice(0,9);
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:1000px;margin:auto">
      <h3 style="text-align:center">CSM — Terminais Avançado</h3>

      <div style="border:1px solid #444;padding:8px">
        📋 Histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
        <div style="margin-top:6px;display:flex;gap:10px;flex-wrap:wrap">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
          <button id="viz">Vizinho</button>
          <button id="nn">NÚM–NÚM</button>
        </div>
      </div>

      <div style="margin:8px 0">🕒 Timeline (14): <span id="tl"></span></div>

      <div style="border:2px solid #00e676;padding:8px;margin:10px 0">
        🎯 Terminais
        <div id="btnT" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div><b>ZERO</b><div id="colZERO"></div></div>
        <div><b>TIERS</b><div id="colTIERS"></div></div>
        <div><b>ORPHELINS</b><div id="colORPH"></div></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  // ================= BOTÕES T =================
  const btnT = document.getElementById("btnT");
  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.dataset.t=t;
    b.textContent="T"+t;
    b.style="padding:6px;background:#333;color:#fff;border:1px solid #555";
    b.onclick=()=>{
      modoVizinho=false;
      modoNumNum=false;
      document.getElementById("viz").style.background="#333";
      document.getElementById("nn").style.background="#333";
      filtrosT.has(t)?filtrosT.delete(t):filtrosT.add(t);
      atualizarBotoesT();
      render();
    };
    btnT.appendChild(b);
  }

  // ================= EVENTOS =================
  document.getElementById("viz").onclick=()=>{
    modoVizinho=!modoVizinho;
    modoNumNum=false;
    document.getElementById("viz").style.background = modoVizinho?"#ff9800":"#333";
    document.getElementById("nn").style.background="#333";
    filtrosT.clear();
    if(modoVizinho) calcularVizinhoTerminais();
    render();
  };

  document.getElementById("nn").onclick=()=>{
    modoNumNum=!modoNumNum;
    modoVizinho=false;
    document.getElementById("nn").style.background = modoNumNum?"#03a9f4":"#333";
    document.getElementById("viz").style.background="#333";
    filtrosT.clear();
    if(modoNumNum) calcularNumeroNumero();
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
    if(modoVizinho) calcularVizinhoTerminais();
    if(modoNumNum) calcularNumeroNumero();
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
    modoVizinho=false;
    modoNumNum=false;
    document.getElementById("viz").style.background="#333";
    document.getElementById("nn").style.background="#333";
    atualizarBotoesT();
    render();
  };

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");
    const trios = triosSelecionados9();
    const por = { ZERO:[], TIERS:[], ORPHELINS:[] };
    trios.forEach(x=>por[x.eixo].push(x.trio.join("-")));
    document.getElementById("colZERO").innerHTML = por.ZERO.join("<br>");
    document.getElementById("colTIERS").innerHTML = por.TIERS.join("<br>");
    document.getElementById("colORPH").innerHTML = por.ORPHELINS.join("<br>");
  }

  render();

})();
