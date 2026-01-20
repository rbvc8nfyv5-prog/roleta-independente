(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

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
    [33,34,35]
  ];

  // ================= ESTADO =================
  let hist = [];
  let timeline = [];

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

  function zona(n){
    return Math.floor(track.indexOf(n)/10);
  }

  // ================= MAPAS =================
  const mapaTrincas = trincasCentrais.map(trinca=>{
    let amplo=new Set();
    let curto=new Set();
    trinca.forEach(c=>{
      vizinhos(c,4).forEach(n=>amplo.add(n)); // histórico
      vizinhos(c,2).forEach(n=>curto.add(n)); // timeline
    });
    return { trinca, amplo, curto };
  });

  // ================= HISTÓRICO =================
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

  // ================= CONFLUÊNCIA 45 PARES =================
  function confluenciaPares(base){
    let pares=[];
    for(let a=0;a<10;a++){
      for(let b=a+1;b<10;b++){
        let set=new Set();
        track.forEach(n=>{
          if(terminal(n)===a||terminal(n)===b) set.add(n);
        });
        pares.push({a,b,score:cobertura(set,base)});
      }
    }
    pares.sort((x,y)=>y.score-x.score);
    return pares;
  }

  function quebraPar(p, base){
    let best={t:null,s:-1};
    for(let t=0;t<10;t++){
      if(t===p.a||t===p.b) continue;
      let set=new Set();
      track.forEach(n=>{
        if([p.a,p.b,t].includes(terminal(n))) set.add(n);
      });
      let s=cobertura(set,base);
      if(s>best.s) best={t,s};
    }
    return best.t;
  }

  // ================= MELHOR TRINCA =================
  function melhorTrinca(num, par1){
    let chamados=chamadosPor(num);
    let best=null;

    mapaTrincas.forEach(t=>{
      let histHit = cobertura(t.amplo, chamados);
      let timeHit = cobertura(t.curto, timeline);
      let zonaHit = new Set([...t.curto].map(zona)).size;
      let par1Hit = [...t.amplo].some(n=>terminal(n)===par1.a||terminal(n)===par1.b)?1:0;

      let score =
        histHit*4 +
        timeHit*5 +
        zonaHit*2 +
        par1Hit*6;

      if(!best||score>best.score){
        best={trinca:t.trinca,histHit,timeHit,zonaHit,par1Hit,score};
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
      <h3 style="text-align:center">CSM – Confluência Refinada</h3>

      <div style="border:1px solid #444;padding:8px">
        Cole histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff;border:1px solid #555"/>
        <button id="col">Colar</button>
        <button id="lim">Limpar</button>
      </div>

      <div style="margin-top:8px">
        🕒 Timeline (14): <div id="tl"></div>
      </div>

      <div style="border:1px solid #666;padding:8px;margin-top:8px">
        🔗 <b>Pares</b>
        <div id="pares"></div>
      </div>

      <div style="border:1px solid #aaa;padding:8px;margin-top:8px">
        🎯 <b>Melhor Trinca</b>
        <div id="out"></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  const nums=document.getElementById("nums");
  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.onclick=()=>add(n);
    b.style="padding:8px;background:#333;color:#fff";
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
    document.getElementById("tl").textContent=timeline.join(" · ");
    if(!hist.length) return;

    let ult=hist[hist.length-1];
    let pares=confluenciaPares(timeline.slice(0,6));
    let p1=pares[0], p2=pares[1];
    let q=quebraPar(p1,timeline.slice(0,6));

    document.getElementById("pares").innerHTML=
      `Par 1: T${p1.a}·T${p1.b}<br>
       Par 2: T${p2.a}·T${p2.b}<br>
       Quebra: T${q}`;

    let m=melhorTrinca(ult,p1);

    document.getElementById("out").innerHTML=
      `Número: <b>${ult}</b><br>
       Trinca: <b>${m.trinca.join("-")}</b><br>
       Histórico: ${m.histHit}<br>
       Timeline (±2): ${m.timeHit}<br>
       Zonas: ${m.zonaHit}<br>
       Compatível Par 1: ${m.par1Hit?"SIM":"NÃO"}`;
  }

})();
