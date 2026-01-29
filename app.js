(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  // ================= TRINCAS =================
  const trincasTiming = [
    [4,7,16],
    [2,20,30],
    [6,9,26],
    [17,23,31],
    [18,19,24],
    [9,17,26]
  ];

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

  const trincasParFixas = [
    [11,20,21],
    [2,18,26],
    [3,33,36],
    [4,11,20],
    [2,5,35],
    [7,19,27],
    [8,26,14]
  ];

  // ================= ESTADO =================
  let hist = [];
  let timeline = [];
  let janela = 6;
  let coberturaNivel = 2;

  const decayPesos = [1, 0.75, 0.55, 0.4, 0.25, 0.15];

  // ================= UTIL =================
  const terminal = n => n % 10;
  const idx = n => track.indexOf(n);

  function vizinhos(n){
    const i = idx(n);
    let a=[];
    for(let x=-coberturaNivel; x<=coberturaNivel; x++){
      a.push(track[(i+37+x)%37]);
    }
    return a;
  }

  // ================= SCORE COM MUDANÇA =================
  function scoreTrinca(trinca){
    let zona = new Set();
    trinca.forEach(c=>vizinhos(c).forEach(n=>zona.add(n)));

    let score6 = 0;
    let score3 = 0;

    timeline.slice(0,janela).forEach((n,i)=>{
      if(zona.has(n)){
        score6 += decayPesos[i] || 0;
        if(i < 3) score3 += decayPesos[i] || 0;
      }
    });

    // detector de enfraquecimento
    let penalidade = 0;
    if(score6 > 0 && score3 < score6 * 0.6){
      penalidade = score6 * 0.35;
    }

    return score6 - penalidade;
  }

  function melhorTrinca(lista){
    let best=null;
    lista.forEach(trinca=>{
      let sc = scoreTrinca(trinca);
      if(!best || sc > best.score){
        best = { trinca, score: sc };
      }
    });
    return best;
  }

  // ================= PAR =================
  function melhorParTimeline(){
    const base = timeline.slice(0,janela);
    let best=null;

    for(let a=0;a<10;a++){
      for(let b=a+1;b<10;b++){
        let s=new Set();
        track.forEach(n=>{
          if(terminal(n)===a || terminal(n)===b) s.add(n);
        });

        let sc = 0;
        base.forEach((n,i)=>{
          if(s.has(n)) sc += decayPesos[i] || 0;
        });

        if(!best || sc>best.score){
          best={a,b,score:sc};
        }
      }
    }
    return best;
  }

  function trincaVinculadaAoPar(par){
    if(!par) return null;

    let universo = new Set();
    track.forEach(n=>{
      if(terminal(n)===par.a || terminal(n)===par.b){
        universo.add(n);
      }
    });

    let best=null;

    trincasParFixas.forEach(trinca=>{
      let zona=new Set();
      trinca.forEach(c=>{
        vizinhos(c).forEach(n=>{
          if(universo.has(n)) zona.add(n);
        });
      });

      let sc=0;
      timeline.slice(0,janela).forEach((n,i)=>{
        if(zona.has(n)) sc += decayPesos[i] || 0;
      });

      if(!best || sc>best.score){
        best={trinca,score:sc};
      }
    });

    return best;
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML=`
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Leitura Dinâmica</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Cole histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
        <div style="margin-top:6px">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
          Janela:
          <select id="jan">
            <option>3</option><option>4</option><option>5</option>
            <option selected>6</option>
          </select>
        </div>
      </div>

      <div>🕒 Timeline (14): <span id="tl"></span></div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🎯 Trinca Timing: <span id="timingBox"></span>
      </div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🧩 Trinca Centrais: <span id="centraisBox"></span>
      </div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🔗 Par 1: <span id="par1"></span><br>
        <small id="trincaPar"></small>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  document.getElementById("jan").onchange=e=>{
    janela=parseInt(e.target.value,10);
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

    const t = melhorTrinca(trincasTiming);
    document.getElementById("timingBox").textContent =
      t ? `${t.trinca.join("-")} | ${t.score.toFixed(2)}` : "-";

    const c = melhorTrinca(trincasCentrais);
    document.getElementById("centraisBox").textContent =
      c ? `${c.trinca.join("-")} | ${c.score.toFixed(2)}` : "-";

    const p = melhorParTimeline();
    document.getElementById("par1").textContent =
      p ? `T${p.a}·T${p.b} (${p.score.toFixed(2)})` : "-";

    const tv = trincaVinculadaAoPar(p);
    document.getElementById("trincaPar").textContent =
      tv ? `Trinca vinculada: ${tv.trinca.join("-")} | ${tv.score.toFixed(2)}` : "-";
  }

  render();

})();
