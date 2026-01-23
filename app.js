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
  const coluna   = n => n===0?null:((n-1)%3)+1;

  function vizinhos(c, d){
    const i = track.indexOf(c);
    let a=[];
    for(let x=-d;x<=d;x++) a.push(track[(i+37+x)%37]);
    return a;
  }

  function cobertura(set, base){
    let c=0;
    base.forEach(n=>{ if(set.has(n)) c++; });
    return c;
  }

  // ================= MAPA TRINCAS =================
  const mapaTrincas = trincasCentrais.map(trinca=>{
    let amplo=new Set(), curto=new Set();
    trinca.forEach(c=>{
      vizinhos(c,4).forEach(n=>amplo.add(n)); // histórico
      vizinhos(c,2).forEach(n=>curto.add(n)); // timeline
    });
    return { trinca, amplo, curto };
  });

  // ================= HISTÓRICO DO NÚMERO =================
  function chamadosPor(n){
    let r=[];
    for(let i=0;i<hist.length-1;i++){
      if(hist[i]===n) r.push(hist[i+1]);
    }
    return r;
  }

  // ================= PARES =================
  function confluenciaPares(base){
    let p=[];
    for(let a=0;a<10;a++){
      for(let b=a+1;b<10;b++){
        let s=new Set();
        track.forEach(n=>{
          if(terminal(n)===a||terminal(n)===b) s.add(n);
        });
        p.push({a,b,score:cobertura(s,base)});
      }
    }
    p.sort((x,y)=>y.score-x.score);
    return p;
  }

  function quebraPar(p, base){
    let best={t:null,s:-1};
    for(let t=0;t<10;t++){
      if(t===p.a||t===p.b) continue;
      let s=new Set();
      track.forEach(n=>{
        if([p.a,p.b,t].includes(terminal(n))) s.add(n);
      });
      let sc=cobertura(s,base);
      if(sc>best.s) best={t,s:sc};
    }
    return best.t;
  }

  // ================= MELHOR TRINCA (COM CONFLUÊNCIA EXTRA) =================
  function melhorTrinca(num, par1){
    const chamados = chamadosPor(num);
    const cols = timeline.slice(0,janela).map(coluna).filter(Boolean);

    let best=null;

    mapaTrincas.forEach(t=>{
      const histHit   = cobertura(t.amplo, chamados);
      const timeHit   = cobertura(t.curto, timeline.slice(0,janela));
      const parHit    = [...t.amplo].filter(n=>terminal(n)===par1.a||terminal(n)===par1.b).length;
      const colHit    = [...t.curto].filter(n=>cols.includes(coluna(n))).length;

      const score =
        histHit*4 +        // o que o número chamou
        timeHit*5 +        // trinca dominante na mesa
        parHit*3 +         // compatibilidade com pares
        colHit*2;          // confluência de colunas

      if(!best || score>best.score){
        best={trinca:t.trinca,alvos:[...t.curto],score,
              histHit,timeHit,parHit,colHit};
      }
    });

    return best;
  }

  // ================= UI (IGUAL AO ANTERIOR) =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML=`
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Confluência Completa</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Cole histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff;border:1px solid #555"/>
        <div style="margin-top:6px">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
          Analisar últimos:
          <select id="jan">
            <option>3</option><option>4</option><option>5</option><option selected>6</option>
          </select>
        </div>
      </div>

      <div>🕒 Linha do tempo (14): <span id="tl"></span></div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🔗 <b>Confluência dos Pares</b><br>
        <span id="pares"></span>
      </div>

      <div style="border:1px solid #aaa;padding:8px">
        🎯 <b>Jogada Indicada</b><br>
        <span id="out"></span>
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
    document.getElementById("inp").value.split(/[\s,]+/)
      .map(Number).filter(n=>n>=0&&n<=36).forEach(add);
    document.getElementById("inp").value="";
  };

  document.getElementById("lim").onclick=()=>{
    hist=[]; timeline=[]; render();
  };

  function render(){
    document.getElementById("tl").textContent=timeline.join(" · ");
    if(!hist.length) return;

    const base=timeline.slice(0,janela);
    const pares=confluenciaPares(base);
    const p1=pares[0];
    const q=quebraPar(p1,base);

    document.getElementById("pares").innerHTML=
      `Par 1: T${p1.a}·T${p1.b}<br>Quebra: T${q}`;

    const m=melhorTrinca(hist[hist.length-1],p1);

    document.getElementById("out").innerHTML=
      `Número analisado: <b>${hist[hist.length-1]}</b><br>
       Trinca: <b>${m.trinca.join("-")}</b><br>
       Alvos: ${m.alvos.join(" · ")}<br>
       Confluências → Hist:${m.histHit} | Mesa:${m.timeHit} | Pares:${m.parHit} | Colunas:${m.colHit}`;
  }

})();
