(function () {

  // ================= CONFIG BASE =================
  const terminais = {
    0:[0,10,20,30],
    1:[1,11,21,31],
    2:[2,12,22,32],
    3:[3,13,23,33],
    4:[4,14,24,34],
    5:[5,15,25,35],
    6:[6,16,26,36],
    7:[7,17,27],
    8:[8,18,28],
    9:[9,19,29]
  };

  const terminal = n => n % 10;

  // ================= UI =================
  document.body.style.background = "#111";
  document.body.style.color = "#fff";

  document.body.innerHTML = `
    <div style="padding:10px;font-family:sans-serif;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Leitura de Trinca</h3>

      <div style="margin-bottom:8px">
        📋 Cole o histórico (números separados por espaço ou vírgula):
      </div>

      <textarea id="histInput"
        style="width:100%;height:120px;background:#222;color:#fff;border:1px solid #555;padding:6px">
      </textarea>

      <div style="margin:10px 0;text-align:center">
        <button id="analisar"
          style="padding:8px 16px;background:#333;color:#fff;border:1px solid #777">
          Analisar Histórico
        </button>
      </div>

      <div style="border:1px solid #666;padding:8px;margin-top:10px">
        🔎 Resultado da Análise:
        <div id="resultado" style="margin-top:8px;font-size:14px"></div>
      </div>
    </div>
  `;

  document.getElementById("analisar").onclick = analisar;

  // ================= LÓGICA =================
  function analisar(){
    let txt = document.getElementById("histInput").value;
    if(!txt.trim()) return;

    // converte texto em array de números
    let hist = txt
      .replace(/\n/g," ")
      .split(/[\s,]+/)
      .map(n=>parseInt(n,10))
      .filter(n=>!isNaN(n) && n>=0 && n<=36);

    if(hist.length < 6){
      document.getElementById("resultado").textContent =
        "Histórico muito curto.";
      return;
    }

    let resultados = {};

    for(let i=0;i<hist.length-5;i++){
      // trinca (em terminais)
      let t1 = terminal(hist[i]);
      let t2 = terminal(hist[i+1]);
      let t3 = terminal(hist[i+2]);

      let chave = `${t1}-${t2}-${t3}`;

      // próximos 3 números reais
      let prox = hist.slice(i+3, i+6);

      if(prox.length < 3) continue;

      if(!resultados[chave]) resultados[chave] = [];
      resultados[chave].push(prox);
    }

    renderResultado(resultados);
  }

  function renderResultado(resultados){
    let div = document.getElementById("resultado");
    div.innerHTML = "";

    Object.keys(resultados).forEach(chave=>{
      let bloco = document.createElement("div");
      bloco.style = "margin-bottom:10px;padding:6px;border-bottom:1px dashed #555";

      let titulo = document.createElement("div");
      titulo.innerHTML = `🔸 <b>Trinca ${chave}</b>`;
      bloco.appendChild(titulo);

      resultados[chave].forEach(seq=>{
        let linha = document.createElement("div");
        linha.textContent = "→ " + seq.join(" · ");
        bloco.appendChild(linha);
      });

      div.appendChild(bloco);
    });

    if(!div.innerHTML){
      div.textContent = "Nenhuma trinca encontrada.";
    }
  }

})();
