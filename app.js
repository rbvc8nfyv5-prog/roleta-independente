(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  // ================= TRINCAS DE CENTRAIS =================
  const trincasCentrais = [
    [5,25,35],
    [26,33,36],
    [13,14,15],
    [19,27,29],
    [16,17,18],
    [5,6,7],
    [11,21,31],
    [30,31,32],
    [1,2,3],
    [33,34,35],

    // ➕ NOVAS TRINCAS
    [14,4,30],
    [2,22,26],
    [9,17,33],
    [3,20,21],
    [8,18,0]
  ];

  // ================= ESTADO =================
  let hist = [];
  let timeline = [];
  let janelaAnalise = 6;

  // ================= UTIL =================
  const terminal = n => n % 10;

  function vizinhos(c, dist){
    let i = track.indexOf(c);
    let arr=[];
    for(let d=-dist; d<=dist; d++){
      arr.push(track[(i+37+d)%37]);
    }
    return arr;
  }

  // ================= MAPAS =================
  const mapaTrincas = trincasCentrais.map(trinca=>{
    let amplo = new Set();
    let curto = new Set();
    trinca.forEach(c=>{
      vizinhos(c,4).forEach(n=>amplo.add(n)); // histórico
      vizinhos(c,2).forEach(n=>curto.add(n)); // timeline / alvos
    });
    return { trinca, amplo, curto };
  });

  function chamadosPor(n){
    let r=[];
    for(let i=0;i<hist.length-1;i++){
      if(hist[i]===n) r.push(hist[i+1]);
    }
    return r;
  }

  function cobertura(set, base){
    let c=0;
    base.forEach(n=>{ if(set.has(n)) c++; });
    return c;
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

  // ================= MELHOR TRINCA =================
  function melhorTrinca(num, par1){
    let chamados=chamadosPor(num);
    let best=null;

    mapaTrincas.forEach(t=>{
      let score =
        cobertura(t.amplo, chamados)*4 +
        cobertura(t.curto, timeline.slice(0,janelaAnalise))*5 +
        ([...t.amplo].some(n=>terminal(n)===par1.a||terminal(n)===par1.b)?6:0);

      if(!best || score>best.score){
        best={trinca:t.trinca,alvos:[...t.curto],score};
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
      <h3 style="text-align:center">CSM – Trincas Estendidas</h3>

      <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
      <button id="col">Colar</button>
      <button id="lim">Limpar</button>

      <div>Timeline: <span id="tl"></span></div>
      <div>Pares: <span id="pares"></span></div>
      <div><b>Jogada:</b> <span id="out"></span></div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  const nums=document.getElementById("nums");
  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
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
    document.getElementById("inp").value.split(/[\s,]+/).map(Number)
      .filter(n=>n>=0&&n<=36).forEach(add);
    document.getElementById("inp").value="";
  };

  document.getElementById("lim").onclick=()=>{
    hist=[]; timeline=[]; render();
  };

  function render(){
    document.getElementById("tl").textContent=timeline.join(" · ");
    if(!hist.length) return;

    let base=timeline.slice(0,janelaAnalise);
    let pares=confluenciaPares(base);
    let p1=pares[0];
    let q=quebraPar(p1,base);

    document.getElementById("pares").textContent=
      `Par1 T${p1.a}-${p1.b} | Quebra T${q}`;

    let m=melhorTrinca(hist[hist.length-1],p1);
    document.getElementById("out").textContent=
      `${m.trinca.join("-")} → Alvos: ${m.alvos.join(" ")}`;
  }

})();
