(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  // ================= EIXOS / TRIOS =================
  // CENTRAL É O PRIMEIRO ELEMENTO DO TRIO
  const eixos = {
    ZERO: [
      [32,15,19],
      [4,21,2],
      [25,17,34],
      [6,27,13]
    ],
    TIERS: [
      [36,11,30],
      [8,23,10],
      [5,24,16],
      [33,1,20]
    ],
    ORPHELINS: [
      [14,31,9],
      [22,18,29],
      [7,28,12],
      [35,3,26]
    ]
  };

  // ================= ESTADO =================
  let hist = [];
  let timeline = [];
  let janela = 10;
  let autoT = 5;
  let manualTs = new Set();

  // ================= UTIL =================
  const terminal = n => n % 10;

  function getAutoTerminais() {
    const ts = [];
    for (let n of timeline) {
      const t = terminal(n);
      if (!ts.includes(t)) ts.push(t);
      if (ts.length === autoT) break;
    }
    return ts;
  }

  function getTsAtivos() {
    if (manualTs.size > 0) return [...manualTs];
    return getAutoTerminais();
  }

  function scoreTrio(trio, tsAtivos) {
    const tsTrio = trio.map(terminal);
    const hits = tsTrio.filter(t => tsAtivos.includes(t)).length;
    return hits / 3;
  }

  // ================= SELEÇÃO GLOBAL (POR MÉRITO) =================
  function selecionarTrios() {
    const tsAtivos = getTsAtivos();
    let todos = [];

    Object.entries(eixos).forEach(([eixo, trios]) => {
      trios.forEach(trio => {
        const score = scoreTrio(trio, tsAtivos);
        if (score > 0) {
          todos.push({ eixo, trio, score });
        }
      });
    });

    // ordenação GLOBAL por mérito
    todos.sort((a, b) => b.score - a.score);

    // pega os 9 melhores (ou menos)
    return todos.slice(0, 9);
  }

  // ================= UI =================
  document.body.style.background = "#111";
  document.body.style.color = "#fff";
  document.body.style.fontFamily = "sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM — Trinca Timing (Centrais por Eixo)</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Cole histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff;border:1px solid #555"/>
        <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px;align-items:center">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
          Janela:
          <select id="jan">
            ${Array.from({length:8},(_,i)=>`<option ${i+3===10?'selected':''}>${i+3}</option>`).join("")}
          </select>
          Auto T:
          <select id="autoT">
            ${Array.from({length:8},(_,i)=>`<option ${i+3===5?'selected':''}>${i+3}</option>`).join("")}
          </select>
        </div>
      </div>

      <div style="border:1px solid #555;padding:8px;margin-bottom:8px">
        🎛️ Terminais (Manual):
        <div id="ts" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
      </div>

      <div>🕒 Timeline (14): <span id="tl"></span></div>

      <div style="border:2px solid #0f0;padding:10px;margin-top:10px">
        🎯 <b>CENTRAIS POR EIXO (MERITO)</b>
        <div id="res"></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  // ================= TERMINAIS MANUAIS =================
  const tsBox = document.getElementById("ts");
  for (let t = 0; t <= 9; t++) {
    const b = document.createElement("button");
    b.textContent = "T" + t;
    b.style = "padding:6px;background:#333;color:#fff;border:1px solid #555";
    b.onclick = () => {
      if (manualTs.has(t)) {
        manualTs.delete(t);
        b.style.background = "#333";
      } else {
        manualTs.add(t);
        b.style.background = "#0a0";
      }
      render();
    };
    tsBox.appendChild(b);
  }

  // ================= NÚMEROS =================
  const nums = document.getElementById("nums");
  for (let n = 0; n <= 36; n++) {
    let b = document.createElement("button");
    b.textContent = n;
    b.style = "padding:8px;background:#333;color:#fff";
    b.onclick = () => add(n);
    nums.appendChild(b);
  }

  function add(n) {
    hist.push(n);
    timeline.unshift(n);
    if (timeline.length > 14) timeline.pop();
    render();
  }

  document.getElementById("col").onclick = () => {
    document.getElementById("inp").value
      .split(/[\s,]+/)
      .map(Number)
      .filter(n => n >= 0 && n <= 36)
      .forEach(add);
    document.getElementById("inp").value = "";
  };

  document.getElementById("lim").onclick = () => {
    hist = [];
    timeline = [];
    manualTs.clear();
    render();
  };

  document.getElementById("jan").onchange = e => {
    janela = parseInt(e.target.value, 10);
    render();
  };

  document.getElementById("autoT").onchange = e => {
    autoT = parseInt(e.target.value, 10);
    render();
  };

  // ================= RENDER =================
  function render() {
    document.getElementById("tl").textContent = timeline.join(" · ");
    if (!timeline.length) return;

    const trios = selecionarTrios();
    const box = document.getElementById("res");
    box.innerHTML = "";

    const centraisAtivos = new Map();

    trios.forEach(t => {
      const central = t.trio[0];
      const pct = Math.round(t.score * 100);
      centraisAtivos.set(central, pct);
    });

    Object.entries({
      ZERO:[32,4,25,6],
      TIERS:[36,8,5,33],
      ORPHELINS:[14,22,7,35]
    }).forEach(([eixo, cents]) => {
      const d = document.createElement("div");
      d.style = "margin-top:8px";
      d.innerHTML = `<b>${eixo}</b>: `;

      cents.forEach(c=>{
        const span = document.createElement("span");
        const pct = centraisAtivos.get(c);
        span.textContent = pct ? `${c} (${pct}%)` : `${c}`;
        span.style = `
          margin-right:8px;
          padding:4px 6px;
          border-radius:4px;
          background:${pct ? "#0a0" : "#333"};
        `;
        d.appendChild(span);
      });

      box.appendChild(d);
    });
  }

})();
