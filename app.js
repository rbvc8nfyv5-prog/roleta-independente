(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const terminal = n => n % 10;

  // ================= TRINCAS TIMING (TEAM) =================
  const trincasTiming = [
    [4,7,16],
    [2,20,30],
    [6,9,26],
    [17,23,31],
    [18,19,24],
    [9,17,26]
  ];

  // ================= MAPA FIXO DE TRIOS POR T =================
  const mapaTriosPorT = {
    0: [[26,0,32],[15,19,4],[11,30,8],[10,5,24],[14,31,9],[12,35,3],[3,26,0],[35,3,26]],
    2: [[32,2,25],[21,2,25],[22,18,29],[31,9,22],[2,20,30],[14,31,9],[26,0,32],[3,26,0]],
    4: [[19,4,21],[15,19,4],[4,21,2],[14,31,9],[20,14,31],[30,8,23],[11,30,8],[15,19,4]],
    6: [[34,6,27],[17,34,6],[13,36,11],[36,11,30],[6,9,26],[9,17,26],[35,3,26],[3,26,0]],
    7: [[29,7,28],[17,34,6],[9,17,26],[20,14,31],[14,31,9],[12,35,3],[35,3,26]]
  };

  // ================= ESTADO =================
  let timeline = [];
  let janela = 6;

  // ================= TRINCA TIMING ATIVA =================
  function trincaTimingAtiva(){
    let best = null;
    trincasTiming.forEach(trinca=>{
      let score = 0;
      timeline.slice(0,janela).forEach(n=>{
        if(trinca.includes(n)) score++;
      });
      if(!best || score > best.score){
        best = { trinca, score };
      }
    });
    return best;
  }

  // ================= T ATIVOS DA MESA =================
  function terminaisAtivos(){
    const set = new Set();
    timeline.slice(0,janela).forEach(n=>{
      set.add(terminal(n));
    });
    return [...set];
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML=`
    <div style="padding:10px;max-width:800px;margin:auto">
      <h3 style="text-align:center">CSM — Trinca Timing + Trios da Mesa</h3>

      <div>🕒 Timeline: <span id="tl"></span></div>

      <div style="border:2px solid #00e676;padding:10px;margin:10px 0">
        🎯 <b>TRINCA TIMING (TEAM)</b><br>
        <span id="trincaBox"></span>
      </div>

      <div style="border:2px solid #e53935;padding:10px;margin:10px 0">
        🧭 <b>TRIOS (MAPA DA MESA)</b>
        <div id="triosBox"></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

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

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");
    if(!timeline.length) return;

    const t = trincaTimingAtiva();
    document.getElementById("trincaBox").textContent =
      t ? `${t.trinca.join(" - ")} | hits ${t.score}` : "-";

    const ativos = terminaisAtivos();
    let html = "";

    ativos.forEach(T=>{
      if(mapaTriosPorT[T]){
        html += `<div style="margin-top:6px"><b>T${T}</b></div>`;
        mapaTriosPorT[T].forEach(tr=>{
          html += `<div style="margin-left:10px">${tr.join(" - ")}</div>`;
        });
      }
    });

    document.getElementById("triosBox").innerHTML =
      html || "<div>Nenhum trio mapeado</div>";
  }

  render();

})();
