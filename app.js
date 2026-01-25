(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  // ================= TRINCAS (ATUALIZADAS) =================
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

  // ================= MELHOR TRINCA PELO HISTÓRICO DO TERMINAL =================
  function melhorTrincaPorTerminal(){
    if(hist.length < 2) return null;

    const ultimo = hist[hist.length-1];
    const tBase = terminal(ultimo);

    // coletar números que vieram depois das 3 últimas ocorrências do terminal
    let chamados = [];
    let count = 0;

    for(let i=hist.length-2; i>=0 && count<3; i--){
      if(terminal(hist[i]) === tBase && hist[i+1] !== undefined){
        chamados.push(hist[i+1]);
        count++;
      }
    }

    if(!chamados.length) return null;

    let best=null;

    trincasCentrais.forEach(trinca=>{
      let area = new Set();
      trinca.forEach(c=>{
        vizinhos(c,4).forEach(n=>area.add(n));
      });

      const score = cobertura(area, chamados);

      if(!best || score > best.score){
        best = { trinca, score, chamados };
      }
    });

    return best;
  }

  // ================= PAR 1 (INALTERADO – LEITURA GERAL) =================
  function melhorParTimeline(){
    let base = hist.slice(-6);
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
    if(hist.length < 2) return null;

    let a = terminal(hist[hist.length-1]);
    let b = terminal(hist[hist.length-2]);

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
      <h3 style="text-align:center">CSM – Trinca pelo Histórico do Terminal</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Cole histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff;border:1px solid #555"/>
        <div style="margin-top:6px">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
        </div>
      </div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🎯 <b>Melhor Trinca (histórico do terminal)</b><br>
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
    hist=[];
    scoreOps={soma:0,sub:0,mult:0,div:0};
    render();
  };

  function render(){
    if(!hist.length) return;

    const m = melhorTrincaPorTerminal();
    document.getElementById("trinca").textContent =
      m ? `Trinca: ${m.trinca.join("-")} | base: ${m.chamados.join(" · ")}` : "-";

    const p = melhorParTimeline();
    document.getElementById("par1").textContent =
      p ? `Par 1: T${p.a}·T${p.b}` : "-";

    const tm = avaliarTerminalMatematico();
    document.getElementById("termMat").textContent =
      tm ? `Operações fortes: ${tm.ops.join(", ")} | Terminais: ${tm.tops.join(" · ")}` : "-";
  }

})();
