(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  // ================= TRINCAS =================
  // Trinca por TIMING
  const trincasTiming = [
    [4,7,16],
    [2,20,30],
    [6,9,26],
    [17,23,31],
    [18,19,24],
    [9,17,26]
  ];

  // Trinca de CENTRAIS
  const trincasCentrais = [
    [0,22,13],
    [7,24,19],
    [12,21,30],
    [9,4,36],
    [23,31,32],
    [15,16,27],
    [7,16,17],
    [3,8,25],
    [20,28,34]
  ];

  // ================= ESTADO =================
  let hist = [];
  let timeline = [];
  let janela = 6;
  let coberturaNivel = 2;

  // estado oculto por TRINCA (vale para timing e centrais)
  const estadoTrinca = {};
  /*
    estado:
    - "inexistente"
    - "ativa"
    - "quebrada"
    - "retorno1"
    - "retorno2"
    - "cancelada"
  */

  // ================= UTIL =================
  const idx = n => track.indexOf(n);

  function vizinhos(n){
    let i = idx(n), a=[];
    for(let x=-coberturaNivel; x<=coberturaNivel; x++){
      a.push(track[(i+37+x)%37]);
    }
    return a;
  }

  function cobertura(set, base){
    let c=0;
    base.forEach(n=>{ if(set.has(n)) c++; });
    return c;
  }

  // ================= LEITURA DE TRINCAS =================
  function melhorTrinca(lista){
    const base = timeline.slice(0,janela);
    let best=null;

    lista.forEach(trinca=>{
      let s=new Set();
      trinca.forEach(c=>vizinhos(c).forEach(n=>s.add(n)));
      let sc = cobertura(s, base);
      if(!best || sc > best.score){
        best = { trinca, score: sc };
      }
    });

    return best;
  }

  // ================= MOTOR DE CASA =================
  function avaliarEstado(trinca){
    const k = trinca.join("-");

    if(!estadoTrinca[k]){
      estadoTrinca[k] = {
        estado: "inexistente",
        tentativas: 0
      };
    }

    const e = estadoTrinca[k];

    // 1️⃣ existência do padrão
    if(e.estado === "inexistente"){
      e.estado = "ativa";
      return null;
    }

    // 2️⃣ exige quebra
    if(e.estado === "ativa"){
      e.estado = "quebrada";
      return null;
    }

    // 3️⃣ retorno
    if(e.estado === "quebrada"){
      e.estado = "retorno1";
      e.tentativas = 1;
      return { jogar: true, retorno: 1 };
    }

    if(e.estado === "retorno1"){
      e.estado = "retorno2";
      e.tentativas = 2;
      return { jogar: true, retorno: 2 };
    }

    // 4️⃣ limite de tentativas
    if(e.estado === "retorno2"){
      e.estado = "cancelada";
      return null;
    }

    return null;
  }

  // ================= DECISÃO FINAL =================
  function decidirJogada(){
    if(timeline.length < janela) return null;

    const timing = melhorTrinca(trincasTiming);
    const central = melhorTrinca(trincasCentrais);

    let candidatos = [];

    if(timing){
      const r = avaliarEstado(timing.trinca);
      if(r && r.jogar){
        candidatos.push({
          tipo: "TIMING",
          trinca: timing.trinca,
          score: timing.score,
          retorno: r.retorno
        });
      }
    }

    if(central){
      const r = avaliarEstado(central.trinca);
      if(r && r.jogar){
        candidatos.push({
          tipo: "CENTRAL",
          trinca: central.trinca,
          score: central.score,
          retorno: r.retorno
        });
      }
    }

    if(!candidatos.length) return null;

    candidatos.sort((a,b)=>b.score-a.score);
    return candidatos[0];
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Validação Profissional</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Cole histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
        <div style="margin-top:6px">
          <button id="col">Colar</button>
          Timing
          <select id="jan">
            <option>3</option><option>4</option><option>5</option>
            <option selected>6</option>
          </select>
          Cobertura
          <select id="cov">
            <option>1</option><option selected>2</option><option>3</option><option>4</option>
          </select>
        </div>
      </div>

      <div>🕒 Linha do tempo (14): <span id="tl"></span></div>

      <div style="border:2px solid #0f0;padding:10px;margin-top:10px">
        <b>SINAL</b><br>
        <span id="sinal">⛔ SEM ENTRADA</span>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>
    </div>
  `;

  document.getElementById("jan").onchange=e=>{janela=+e.target.value;render();};
  document.getElementById("cov").onchange=e=>{coberturaNivel=+e.target.value;render();};

  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>add(n);
    document.getElementById("nums").appendChild(b);
  }

  function add(n){
    hist.push(n);
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
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

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");
    const j = decidirJogada();
    document.getElementById("sinal").textContent =
      j
        ? `🎯 JOGAR AGORA → ${j.trinca.join("-")} | retorno ${j.retorno} (${j.tipo})`
        : "⛔ SEM ENTRADA";
  }

})();
