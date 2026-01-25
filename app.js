(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  // ================= TRINCAS (TIMING) =================
  const trincasCentrais = [
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
  let janela = 6;

  let scoreOps = { soma:0, sub:0, mult:0, div:0 };

  // ================= UTIL =================
  const terminal = n => n % 10;

  function vizinhos(n, d){
    const i = track.indexOf(n);
    let a=[];
    for(let x=-d;x<=d;x++){
      a.push(track[(i+37+x)%37]);
    }
    return a;
  }

  function cobertura(set, base){
    let c=0;
    base.forEach(n=>{ if(set.has(n)) c++; });
    return c;
  }

  // ================= TRINCA PELO TIMING =================
  const mapaTrincas = trincasCentrais.map(trinca=>{
    let curto = new Set();
    trinca.forEach(c=>{
      vizinhos(c,2).forEach(n=>curto.add(n));
    });
    return { trinca, curto };
  });

  function melhorTrincaTimeline(){
    const base = timeline.slice(0,janela);
    let best=null;

    mapaTrincas.forEach(t=>{
      const score = cobertura(t.curto, base);
      if(!best || score > best.score){
        best = { trinca:t.trinca, score };
      }
    });

    return best;
  }

  // ================= PAR 1 (LEITURA GERAL) =================
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

  // ================= TERMINAL MATEMÁTICO =================
  function avaliarTerminalMatematico(){
    if(timeline.length < 2) return null;

    let a = terminal(timeline[0]);
    let b = terminal(timeline[1]);

    let calc = {
      soma: (a+b)%10,
      sub: Math.abs(a-b)%10,
      mult: (a*b)%10,
      div: (b!==0?Math.floor(a/b):0)%10
    };

    let prox = hist[hist.length-1];
    if(prox !== undefined){
      let t = terminal(prox);
      if(t === calc.soma) scoreOps.soma++;
      if(t === calc.sub) scoreOps.sub++;
      if(t === calc.mult) scoreOps.mult++;
      if(t === calc.div) scoreOps.div++;
    }

    let tops = Object.values(calc).map(t=>"T"+t);
    let ops = Object.entries(scoreOps)
      .sort((a,b)=>b[1]-a[1])
      .map(x=>x[0].toUpperCase());

    return { tops, ops };
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML=`
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Trinca pelo Timing</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Cole histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff;border:1px solid #555"/>
        <div style="margin-top:6px">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
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
        🎯 <b>Trinca do Timing</b><br>
        <span id="trinca"></span>
      </div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🔗 <b>Par 1 (leitura estrutural)</b><br>
        <span id="par1"></span>
      </div>

      <div style="border:1px solid #aaa;padding:8px;margin:6px 0">
        🧮 <b>Terminal Matemático</b><br>
        <span id="termMat"></span>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  document.getElementById("jan").onchange=e=>{
    janela=parseInt(e.target.value,10);
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
    scoreOps={soma:0,sub:0,mult:0,div:0};
    render();
  };

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");
    if(!timeline.length) return;

    const m = melhorTrincaTimeline();
    document.getElementById("trinca").textContent =
      m ? `${m.trinca.join("-")} | impactos: ${m.score}` : "-";

    const p = melhorParTimeline();
    document.getElementById("par1").textContent =
      p ? `Par 1: T${p.a}·T${p.b} (${p.score})` : "-";

    const tm = avaliarTerminalMatematico();
    document.getElementById("termMat").textContent =
      tm ? `Operações fortes: ${tm.ops.join(", ")} | Terminais: ${tm.tops.join(" · ")}` : "-";
  }

})();
