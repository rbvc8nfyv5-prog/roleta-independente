(function () {

  // ================= CONFIG =================
  const terminal = n => n % 10;

  // ================= ESTADO =================
  let hist = [];          // histórico oculto completo
  let timeline = [];      // últimos 14 (visual)

  // ================= UI =================
  document.body.style.background = "#111";
  document.body.style.color = "#fff";

  document.body.innerHTML = `
    <div style="padding:10px;font-family:sans-serif;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Leitura de DUPLA (Terminais)</h3>

      <div style="margin-bottom:8px">
        📋 Cole o histórico (espaço ou vírgula):
        <input id="pasteInput"
          style="width:100%;padding:6px;background:#222;color:#fff;border:1px solid #555"
          placeholder="Ex: 32 15 19 4 21 2 25 17 34" />
        <button id="btnColar"
          style="margin-top:6px;padding:6px 12px;background:#333;color:#fff;border:1px solid #777">
          Colar histórico
        </button>
      </div>

      <div style="margin-bottom:6px">
        🕒 Linha do tempo (14 – espelhada):
        <div id="timeline"
          style="margin-top:4px;padding:6px;border:1px solid #555;min-height:22px">
        </div>
      </div>

      <div style="border:1px solid #666;padding:6px;margin:6px 0;text-align:center">
        🔢 DUPLA ATUAL (terminais): <span id="dupla">-</span>
      </div>

      <div style="border:1px solid #999;padding:6px;margin:6px 0">
        🔎 Resultado da DUPLA (6 números após):
        <div id="resultado" style="margin-top:6px"></div>
      </div>

      <div id="nums"
        style="display:grid;grid-template-columns:repeat(9,1fr);
               gap:6px;margin-top:12px">
      </div>
    </div>
  `;

  const numsDiv = document.getElementById("nums");

  // ================= BOTÕES =================
  for (let n = 0; n <= 36; n++) {
    let b = document.createElement("button");
    b.textContent = n;
    b.style = "padding:8px;background:#333;color:#fff;border:1px solid #555";
    b.onclick = () => inserirNumero(n);
    numsDiv.appendChild(b);
  }

  // ================= INSERÇÃO MANUAL =================
  function inserirNumero(n){
    hist.push(n);

    timeline.unshift(n);
    if (timeline.length > 14) timeline.pop();

    render();
  }

  // ================= COLAR HISTÓRICO =================
  document.getElementById("btnColar").onclick = () => {
    let txt = document.getElementById("pasteInput").value;
    if(!txt.trim()) return;

    let nums = txt
      .replace(/\n/g," ")
      .split(/[\s,]+/)
      .map(n=>parseInt(n,10))
      .filter(n=>!isNaN(n) && n>=0 && n<=36);

    if(nums.length === 0) return;

    nums.forEach(n => hist.push(n));
    timeline = hist.slice(-14).reverse();

    document.getElementById("pasteInput").value = "";
    render();
  };

  // ================= ANÁLISE DA DUPLA =================
  function analisarDupla(){
    if (hist.length < 8) return null;

    let t1 = terminal(hist[hist.length - 2]);
    let t2 = terminal(hist[hist.length - 1]);

    let chave = `${t1}-${t2}`;
    let resultados = [];

    for (let i = 0; i <= hist.length - 8; i++) {
      if (
        terminal(hist[i])   === t1 &&
        terminal(hist[i+1]) === t2
      ) {
        resultados.push(hist.slice(i+2, i+8)); // 6 números depois
      }
    }

    return { chave, resultados };
  }

  // ================= RENDER =================
  function render(){
    document.getElementById("timeline").textContent =
      timeline.join(" · ");

    let analise = analisarDupla();
    let duplaSpan = document.getElementById("dupla");
    let resDiv = document.getElementById("resultado");

    if (!analise) {
      duplaSpan.textContent = "-";
      resDiv.textContent = "Insira pelo menos 8 números.";
      return;
    }

    duplaSpan.textContent = analise.chave;

    if (analise.resultados.length === 0) {
      resDiv.textContent = "Sem resultado no histórico.";
    } else {
      resDiv.innerHTML = "";
      analise.resultados.forEach(seq => {
        let d = document.createElement("div");
        d.textContent = "→ " + seq.join(" · ");
        resDiv.appendChild(d);
      });
    }
  }

  render();

})();
