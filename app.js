(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  // ================= TRINCAS DE TIMING =================
  const trincasTiming = [
    [4,7,16],
    [2,20,30],
    [6,9,26],
    [17,23,31],
    [18,19,24],
    [9,17,26]
  ];

  // ================= ESTADO =================
  let hist = [];
  let timeline = [];
  let janela = 6;              // 3 a 10
  let coberturaNivel = 2;

  // ================= UTIL =================
  const idx = n => track.indexOf(n);

  function vizinhos(n){
    const i = idx(n);
    let a=[];
    for(let x=-coberturaNivel; x<=coberturaNivel; x++){
      a.push(track[(i+37+x)%37]);
    }
    return a;
  }

  // ================= SCORE SEM PESO =================
  function scoreTrinca(trinca){
    let zona = new Set();
    trinca.forEach(c=>{
      vizinhos(c).forEach(n=>zona.add(n));
    });

    let scoreTotal = 0;
    let scoreCurto = 0;

    // janela principal
    timeline.slice(0,janela).forEach(n=>{
      if(zona.has(n)) scoreTotal++;
    });

    // últimos 3 (detector de mudança)
    timeline.slice(0,3).forEach(n=>{
      if(zona.has(n)) scoreCurto++;
    });

    // penalidade se a trinca parou de circular
    let penalidade = 0;
    if(scoreTotal > 0 && scoreCurto < Math.ceil(scoreTotal * 0.5)){
      penalidade = Math.ceil(scoreTotal * 0.4);
    }

    return scoreTotal - penalidade;
  }

  function melhorTrincaTiming(){
    let best = null;

    trincasTiming.forEach(trinca=>{
      const sc = scoreTrinca(trinca);
      if(!best || sc > best.score){
        best = { trinca, score: sc };
      }
    });

    return best;
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:700px;margin:auto">
      <h3 style="text-align:center">CSM – Trinca Timing (Leitura Estrutural)</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Cole histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
        <div style="margin-top:6px">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
          Janela:
          <select id="jan">
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option selected>6</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
            <option>10</option>
          </select>
        </div>
      </div>

      <div>🕒 Timeline (14): <span id="tl"></span></div>

      <div style="border:2px solid #00e676;padding:10px;margin:10px 0;text-align:center">
        🎯 <b>TRINCA DO MOMENTO</b><br>
        <span id="timingBox" style="font-size:20px"></span>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  document.getElementById("jan").onchange = e => {
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

  document.getElementById("lim").onclick=()=>{
    hist=[]; timeline=[];
    render();
  };

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");

    const t = melhorTrincaTiming();
    document.getElementById("timingBox").textContent =
      t ? `${t.trinca.join(" - ")}  |  score ${t.score}` : "-";
  }

  render();

})();
