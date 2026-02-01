(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  // ================= EIXOS / TRIOS =================
  const eixos = {
    ZERO: [
      [0,32,15],
      [19,4,21],
      [2,25,17]
    ],
    TIERS: [
      [13,36,11],
      [30,8,23],
      [10,5,24],
      [16,33,1]
    ],
    ORPHELINS: [
      [20,14,31],
      [12,35,3],
      [9,22,18]
    ]
  };

  // ================= ESTADO =================
  let hist = [];
  let timeline = [];
  let janela = 10;
  let autoT = 6;

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

  function scoreTrio(trio, tsAtivos) {
    const tsTrio = trio.map(terminal);
    const hits = tsTrio.filter(t => tsAtivos.includes(t)).length;
    return hits / 3;
  }

  // ================= SELEÇÃO CORRETA =================
  function selecionarTrios() {
    const tsAtivos = getAutoTerminais();
    const base = timeline.slice(0, janela);

    let todos = [];

    Object.entries(eixos).forEach(([eixo, trios]) => {
      trios.forEach(trio => {
        const score = scoreTrio(trio, tsAtivos);
        if (score > 0) {
          todos.push({
            eixo,
            trio,
            score
          });
        }
      });
    });

    // 🔴 CORREÇÃO CRÍTICA
    todos.sort((a, b) => b.score - a.score);

    // pega os 9 melhores (ou menos se não tiver)
    return todos.slice(0, 9);
  }

  // ================= UI =================
  document.body.style.background = "#111";
  document.body.style.color = "#fff";
  document.body.style.fontFamily = "sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM — Trinca Timing (Correção Estrutural)</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Cole histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff;border:1px solid #555"/>
        <div style="margin-top:6px">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
          Janela:
          <select id="jan">
            ${Array.from({length:8},(_,i)=>`<option ${i+3===10?'selected':''}>${i+3}</option>`).join("")}
          </select>
          Auto T:
          <select id="autoT">
            ${Array.from({length:8},(_,i)=>`<option ${i+3===6?'selected':''}>${i+3}</option>`).join("")}
          </select>
        </div>
      </div>

      <div>🕒 Timeline (14): <span id="tl"></span></div>

      <div style="border:2px solid #0f0;padding:10px;margin-top:10px">
        🎯 <b>TRIOS SELECIONADOS (POR MÉRITO)</b>
        <div id="res"></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

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

  function render() {
    document.getElementById("tl").textContent = timeline.join(" · ");
    if (!timeline.length) return;

    const trios = selecionarTrios();
    const box = document.getElementById("res");
    box.innerHTML = "";

    trios.forEach(t => {
      const d = document.createElement("div");
      d.textContent = `${t.trio.join("-")} | ${t.eixo} | score ${(t.score*100).toFixed(0)}%`;
      d.style = "margin:4px 0";
      box.appendChild(d);
    });
  }

})();
