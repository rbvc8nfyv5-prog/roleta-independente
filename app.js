(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  // ================= TRINCAS =================
  // Trinca de TIMING
  const trincasTiming = [
    [4,7,16],
    [2,20,30],
    [6,9,26],
    [17,23,31],
    [18,19,24],
    [9,17,26]
  ];

  // Trinca de CENTRAIS (fixas, como antes)
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

  // Trincas fixas vinculadas ao PAR
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

  function cobertura(set, base){
    let c=0;
    base.forEach(n=>{ if(set.has(n)) c++; });
    return c;
  }

  function scoreTrinca(trinca){
    const base = timeline.slice(0,janela);
    let s = new Set();
    trinca.forEach(c=>vizinhos(c).forEach(n=>s.add(n)));
    return cobertura(s, base);
  }

  // ================= MELHORES LEITURAS =================
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

  function melhorParTimeline(){
    const base = timeline.slice(0,janela);
    let best=null;

    for(let a=0;a<10;a++){
      for(let b=a+1;b<10;b++){
        let s=new Set();
        track.forEach(n=>{
          if(terminal(n)===a || terminal(n)===b) s.add(n);
        });
        let sc=cobertura(s,base);
        if(!best || sc>best.score){
          best={a,b,score:sc};
        }
      }
    }
    return best;
  }

  function trincaVinculadaAoPar(par){
    if(!par) return null;

    const base = timeline.slice(0,janela);
    let numsPar = new Set();

    track.forEach(n=>{
      if(terminal(n)===par.a || terminal(n)===par.b){
        numsPar.add(n);
      }
    });

    let best=null;

    trincasParFixas.forEach(trinca=>{
      let s=new Set();
      trinca.forEach(c=>{
        vizinhos(c).forEach(n=>{
          if(numsPar.has(n)) s.add(n);
        });
      });

      let sc=cobertura(s,base);
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

  document.body.innerHTML=`
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Leitura Pura</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Cole histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
        <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>

          Timing:
          <select id="jan">
            <option>3</option><option>4</option><option>5</option>
            <option selected>6</option>
          </select>

          Cobertura:
          <select id="cov">
            <option>1</option><option selected>2</option>
            <option>3</option><option>4</option>
          </select>
        </div>
      </div>

      <div>🕒 Linha do tempo (14): <span id="tl"></span></div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🎯 <b>Trinca do Timing</b><br>
        <span id="timingBox"></span>
      </div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🧩 <b>Trinca de Centrais</b><br>
        <span id="centraisBox"></span>
      </div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🔗 <b>Par 1</b><br>
        <span id="par1"></span><br>
        <small id="trincaPar"></small>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  document.getElementById("jan").onchange=e=>{
    janela=parseInt(e.target.value,10);
    render();
  };

  document.getElementById("cov").onchange=e=>{
    coberturaNivel=parseInt(e.target.value,10);
    render();
  };

  const nums=document.getElementById("nums");
  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>add(n);
    nums.appendChild(b);
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
      t ? `${t.trinca.join("-")} | score ${t.score}` : "-";

    const c = melhorTrinca(trincasCentrais);
    document.getElementById("centraisBox").textContent =
      c ? `${c.trinca.join("-")} | score ${c.score}` : "-";

    const p = melhorParTimeline();
    document.getElementById("par1").textContent =
      p ? `Par 1: T${p.a}·T${p.b} (${p.score})` : "-";

    const tv = trincaVinculadaAoPar(p);
    document.getElementById("trincaPar").textContent =
      tv ? `Trinca vinculada ao par: ${tv.trinca.join("-")} (${tv.score})` : "-";
  }

  render();

})();
