(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  // ================= TERMINAIS PERMITIDOS =================
  const faixaTerminais = new Set([0,2,4,6,7]);

  const terminal = n => n % 10;

  // ================= TRINCAS TIMING =================
  const trincasTiming = [
    [4,7,16],
    [2,20,30],
    [6,9,26],
    [17,23,31],
    [18,19,24],
    [9,17,26]
  ];

  // ================= EIXOS + TRIOS =================
  const eixos = [
    {
      nome: "ZERO",
      trios: [[0,32,15],[15,19,4],[21,2,25],[17,34,6]]
    },
    {
      nome: "TIERS",
      trios: [[13,36,11],[30,8,23],[10,5,24],[16,33,1]]
    },
    {
      nome: "ORPHELINS",
      trios: [[20,14,31],[31,9,22],[29,7,28],[12,35,3]]
    }
  ];

  // ================= ESTADO =================
  let timeline = [];
  let janela = 6;

  // ================= UTIL =================
  function dentroDaFaixa(n){
    return faixaTerminais.has(terminal(n));
  }

  // ================= CENTRAIS TIMING =================
  function centraisTimingValidos(){
    let res = new Set();
    trincasTiming.forEach(t=>{
      t.forEach(n=>{
        if(dentroDaFaixa(n)) res.add(n);
      });
    });
    return [...res];
  }

  // ================= TRIOS VALIDOS =================
  function triosValidos(){
    let lista = [];
    eixos.forEach(e=>{
      e.trios.forEach(t=>{
        if(t.some(n=>dentroDaFaixa(n))){
          lista.push({
            eixo: e.nome,
            trio: t
          });
        }
      });
    });
    return lista;
  }

  // ================= UI =================
  document.body.style.background = "#111";
  document.body.style.color = "#fff";
  document.body.style.fontFamily = "sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:780px;margin:auto">
      <h3 style="text-align:center">CSM — Faixa T0 T2 T4 T6 T7</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
        <div style="margin-top:6px">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
          Janela:
          <select id="jan">
            <option>3</option><option>4</option><option>5</option>
            <option selected>6</option>
            <option>7</option><option>8</option><option>9</option><option>10</option>
          </select>
        </div>
      </div>

      <div>🕒 Timeline (14): <span id="tl"></span></div>

      <div style="border:2px solid #00e676;padding:10px;margin:10px 0">
        🎯 <b>Centrais TIMING (faixa)</b><br>
        <span id="centraisTiming"></span>
      </div>

      <div style="border:2px solid #ff9800;padding:10px;margin:10px 0">
        🧭 <b>Trios válidos por eixo (faixa)</b>
        <div id="triosBox"></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  document.getElementById("jan").onchange = e=>{
    janela = parseInt(e.target.value,10);
    render();
  };

  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>add(n);
    document.getElementById("nums").appendChild(b);
  }

  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    render();
  }

  document.getElementById("col").onclick=()=>{
    document.getElementById("inp").value
      .split(/[\s,]+/)
      .map(Number)
      .filter(n=>n>=0 && n<=36)
      .forEach(add);
    document.getElementById("inp").value="";
  };

  document.getElementById("lim").onclick=()=>{
    timeline=[];
    render();
  };

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");

    document.getElementById("centraisTiming").textContent =
      centraisTimingValidos().join(" · ");

    const trios = triosValidos();
    document.getElementById("triosBox").innerHTML =
      trios.map(t=>`
        <div style="margin-top:6px">
          <b>${t.eixo}</b>: ${t.trio.join("-")}
        </div>
      `).join("");
  }

  render();

})();
