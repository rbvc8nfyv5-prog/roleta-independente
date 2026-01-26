(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  const TRINCAS = [
    [4,7,16],
    [2,20,30],
    [6,9,26],
    [17,23,31],
    [18,19,24],
    [9,17,26]
  ];

  // ================= ESTADO =================
  let timeline = [];
  let janela = 6;

  let estadoTrincaTiming = {
    trinca: null,
    wins: 0,
    quebras: 0
  };

  // ================= UTIL =================
  function viz(n,d){
    const i = track.indexOf(n);
    let a=[];
    for(let x=-d;x<=d;x++) a.push(track[(i+37+x)%37]);
    return a;
  }

  function area(trinca){
    let s = new Set();
    trinca.forEach(c=>{
      viz(c,2).forEach(n=>s.add(n));
    });
    return s;
  }

  // ================= TRINCA DO TIMING =================
  function melhorTrincaTimeline(){
    const base = timeline.slice(0,janela);
    let best=null;

    TRINCAS.forEach(tr=>{
      const a = area(tr);
      const score = base.filter(n=>a.has(n)).length;
      if(!best || score > best.score){
        best = { trinca: tr, score };
      }
    });

    return best;
  }

  // ================= MOTOR ESQUADRA =================
  let sinal = null;

  function atualizarEsquadra(n, trincaAtual){
    sinal = null;

    if(
      !estadoTrincaTiming.trinca ||
      estadoTrincaTiming.trinca.join("-") !== trincaAtual.join("-")
    ){
      estadoTrincaTiming = {
        trinca: trincaAtual,
        wins: 0,
        quebras: 0
      };
    }

    const a = area(trincaAtual);

    if(a.has(n)){
      if(estadoTrincaTiming.quebras > 0){
        sinal = trincaAtual;
        estadoTrincaTiming.wins = 0;
        estadoTrincaTiming.quebras = 0;
      } else {
        estadoTrincaTiming.wins++;
      }
    } else {
      if(estadoTrincaTiming.wins >= 2){
        estadoTrincaTiming.quebras++;
      }
    }
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Trinca por Timing</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Cole histórico:
        <input id="inp"
          style="width:100%;padding:6px;background:#222;color:#fff"/>
        <div style="margin-top:6px">
          <button id="col">Colar</button>
          Analisar últimos:
          <select id="jan">
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option selected>6</option>
          </select>
        </div>
      </div>

      <div>🕒 Linha do tempo (14): <span id="tl"></span></div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🎯 <b>Melhor Trinca (Timing)</b><br>
        <span id="trinca"></span>
      </div>

      <div style="border:3px solid #00ff00;padding:14px;
                  font-size:18px;text-align:center">
        <b id="out">—</b>
      </div>

      <div id="nums"
        style="display:grid;grid-template-columns:repeat(9,1fr);
               gap:6px;margin-top:10px"></div>
    </div>
  `;

  document.getElementById("jan").onchange=e=>{
    janela = parseInt(e.target.value,10);
    render();
  };

  const nums = document.getElementById("nums");
  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>add(n);
    nums.appendChild(b);
  }

  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();

    const melhor = melhorTrincaTimeline();
    if(melhor){
      atualizarEsquadra(n, melhor.trinca);
    }
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

    const t = melhorTrincaTimeline();
    document.getElementById("trinca").textContent =
      t ? `${t.trinca.join(" – ")} | impactos: ${t.score}` : "-";

    if(sinal){
      document.getElementById("out").textContent =
        `🟢 JOGAR AGORA\n${sinal.join(" – ")}`;
    } else {
      document.getElementById("out").textContent = "—";
    }
  }

})();
