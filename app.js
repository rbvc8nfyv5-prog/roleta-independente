(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  const trincasCentrais = [
    [5,25,35],[26,33,36],[13,14,15],[19,27,29],[16,17,18],
    [5,6,7],[11,21,31],[30,31,32],[1,2,3],[33,34,35],
    [14,4,30],[2,22,26],[9,17,33],[3,20,21],[8,18,0]
  ];

  // ================= ESTADO =================
  let hist = [];
  let timeline = [];
  let janela = 6;

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

  // ================= MAPA DAS TRINCAS =================
  const mapaTrincas = trincasCentrais.map(trinca=>{
    let curto = new Set();
    trinca.forEach(c=>{
      vizinhos(c,2).forEach(n=>curto.add(n)); // TIMING manda
    });
    return { trinca, curto };
  });

  // ================= MELHOR TRINCA (TIMELINE) =================
  function melhorTrincaTimeline(){
    const base = timeline.slice(0,janela);
    let best=null;

    mapaTrincas.forEach(t=>{
      const score = cobertura(t.curto, base);
      if(!best || score > best.score){
        best = { trinca:t.trinca, curto:t.curto, score };
      }
    });

    return best;
  }

  // ================= CONFLUÊNCIA DE PARES (EM CIMA DA TRINCA) =================
  function confluenciaParesTrinca(trincaSet){
    let pares=[];
    for(let a=0;a<10;a++){
      for(let b=a+1;b<10;b++){
        let hits=0;
        trincaSet.forEach(n=>{
          if(terminal(n)===a || terminal(n)===b) hits++;
        });
        pares.push({a,b,hits});
      }
    }
    pares.sort((x,y)=>y.hits-x.hits);
    return pares[0];
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML=`
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Trinca por Linha do Tempo</h3>

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

      <div style="margin-bottom:6px">
        🕒 Linha do tempo (14): <span id="tl"></span>
      </div>

      <div style="border:1px solid #666;padding:8px;margin-bottom:6px">
        🎯 <b>Trinca da Linha do Tempo</b><br>
        <span id="trinca"></span>
      </div>

      <div style="border:1px solid #aaa;padding:8px">
        🔗 <b>Confluência dos Pares (da Trinca)</b><br>
        <span id="pares"></span>
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
    hist=[]; timeline=[]; render();
  };

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");
    if(!timeline.length) return;

    const m = melhorTrincaTimeline();
    document.getElementById("trinca").textContent =
      `${m.trinca.join("-")}  | impactos: ${m.score}`;

    const p = confluenciaParesTrinca(m.curto);
    document.getElementById("pares").textContent =
      `Par dominante na trinca: T${p.a}·T${p.b} (${p.hits} acertos)`;
  }

})();
