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
      <h3 style="text-align:center">CSM – Leitura de Trinca (Histórico Oculto)</h3>

      <div style="margin-bottom:6px">
        🕒 Linha do tempo (14 – espelhada):
        <div id="timeline"
          style="margin-top:4px;padding:6px;border:1px solid #555;min-height:22px">
        </div>
      </div>

      <div style="border:1px solid #666;padding:6px;margin:6px 0;text-align:center">
        🔢 Trinca Atual (terminais): <span id="trinca">-</span>
      </div>

      <div style="border:1px solid #999;padding:6px;margin:6px 0">
        🔎 Resultado da Trinca:
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

  // ================= INSERÇÃO =================
  function inserirNumero(n){
    hist.push(n);

    timeline.unshift(n);
    if (timeline.length > 14) timeline.pop();

    render();
  }

  // ================= ANÁLISE DA TRINCA =================
  function analisarTrinca(){
    if (hist.length < 6) return null;

    let t1 = terminal(hist[hist.length - 3]);
    let t2 = terminal(hist[hist.length - 2]);
    let t3 = terminal(hist[hist.length - 1]);

    let chave = `${t1}-${t2}-${t3}`;
    let resultados = [];

    for (let i = 0; i <= hist.length - 6; i++) {
      if (
        terminal(hist[i])   === t1 &&
        terminal(hist[i+1]) === t2 &&
        terminal(hist[i+2]) === t3
      ) {
        resultados.push(hist.slice(i+3, i+6));
      }
    }

    return { chave, resultados };
  }

  // ================= RENDER =================
  function render(){
    // linha do tempo
    document.getElementById("timeline").textContent =
      timeline.join(" · ");

    let analise = analisarTrinca();
    let trincaSpan = document.getElementById("trinca");
    let resDiv = document.getElementById("resultado");

    if (!analise) {
      trincaSpan.textContent = "-";
      resDiv.textContent = "Insira pelo menos 6 números.";
      return;
    }

    trincaSpan.textContent = analise.chave;

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
