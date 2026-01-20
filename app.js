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

  function vizinhosCentral(c){
    let i = track.indexOf(c);
    let arr = [];
    for(let d=-4; d<=4; d++){
      arr.push(track[(i+37+d)%37]);
    }
    return arr;
  }

  function zona(n){
    let i = track.indexOf(n);
    return Math.floor(i / 10);
  }

  // ===== mapa das trincas =====
  const mapaTrincas = trincasCentrais.map(trinca=>{
    let set = new Set();
    trinca.forEach(c=>{
      vizinhosCentral(c).forEach(n=>set.add(n));
    });
    return { trinca, set };
  });

  // ================= COBERTURAS =================
  function cobertura(set, base){
    let h = 0;
    base.forEach(n=>{
      if(set.has(n)) h++;
    });
    return h;
  }

  function zonasCobertas(set){
    let z = new Set();
    set.forEach(n=>z.add(zona(n)));
    return z.size;
  }

  // ================= HISTÓRICO =================
  function numerosChamadosPor(n){
    let r = [];
    for(let i=0;i<hist.length-1;i++){
      if(hist[i] === n){
        r.push(hist[i+1]);
      }
    }
    return r;
  }

  // ================= CONFLUÊNCIA DOS 45 PARES =================
  function confluencia45Pares(baseTimeline6){
    let pares = [];
    for(let a=0;a<10;a++){
      for(let b=a+1;b<10;b++){
        let set = new Set();
        track.forEach(n=>{
          if(terminal(n)===a || terminal(n)===b) set.add(n);
        });
        const score = cobertura(set, baseTimeline6);
        pares.push({a,b,score,set});
      }
    }
    pares.sort((x,y)=>y.score-x.score);
    return pares;
  }

  function escolherQuebra(par, baseTimeline6){
    let best={t:null,score:-1};
    for(let t=0;t<10;t++){
      if(t===par.a || t===par.b) continue;
      let set=new Set();
      track.forEach(n=>{
        if(terminal(n)===par.a || terminal(n)===par.b || terminal(n)===t){
          set.add(n);
        }
      });
      const s=cobertura(set,baseTimeline6);
      if(s>best.score) best={t,score:s};
    }
    return best.t;
  }

  // ================= MELHOR TRINCA =================
  function melhorTrinca(numero, par1){
    const chamados = numerosChamadosPor(numero);
    let melhor=null;

    mapaTrincas.forEach(t=>{
      const histHits = cobertura(t.set, chamados);
      const timeHits = cobertura(t.set, timeline);
      const zonasHit = zonasCobertas(t.set);
      const par1Hit  = cobertura(t.set, track.filter(n=>terminal(n)===par1.a||terminal(n)===par1.b));

      // score ponderado (Par 1 pesa mais)
      const score =
        histHits * 4 +
        timeHits * 3 +
        zonasHit * 2 +
        par1Hit  * 5;

      if(!melhor || score > melhor.score){
        melhor = {
          trinca: t.trinca,
          histHits,
          timeHits,
          zonasHit,
          par1Hit,
          score
        };
      }
    });

    return melhor;
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Confluência Final</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:10px">
        📋 Cole até <b>500</b> números:
        <input id="pasteInput" style="width:100%;padding:6px;background:#222;color:#fff;border:1px solid #555"/>
        <div style="margin-top:6px">
          <button id="btnColar">Colar</button>
          <button id="btnLimpar">Limpar</button>
        </div>
      </div>

      <div>
        🕒 Linha do tempo (14):
        <div id="timeline" style="border:1px solid #555;padding:6px;margin-top:4px"></div>
      </div>

      <div style="border:1px solid #bbb;padding:8px;margin-top:10px">
        🔗 <b>Confluência dos Pares</b>
        <div id="paresOut"></div>
      </div>

      <div style="border:1px solid #bbb;padding:8px;margin-top:10px">
        🎯 <b>Melhor Trinca para Jogar</b>
        <div id="trincaOut"></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:14px"></div>
    </div>
  `;

  const numsDiv=document.getElementById("nums");

  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff;border:1px solid #555";
    b.onclick=()=>inserir(n);
    numsDiv.appendChild(b);
  }

  function inserir(n){
    hist.push(n);
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    render();
  }

  document.getElementById("btnColar").onclick=()=>{
    let nums=document.getElementById("pasteInput").value.split(/\s+/).map(Number).filter(n=>n>=0&&n<=36);
    nums.forEach(n=>hist.push(n));
    timeline=hist.slice(-14).reverse();
    document.getElementById("pasteInput").value="";
    render();
  };

  document.getElementById("btnLimpar").onclick=()=>{
    hist=[]; timeline=[]; render();
  };

  function render(){
    document.getElementById("timeline").textContent =
      timeline.length ? timeline.join(" · ") : "-";

    if(hist.length===0) return;

    const ultimo=hist[hist.length-1];
    const pares=confluencia45Pares(timeline.slice(0,6));
    const p1=pares[0];
    const p2=pares[1];
    const quebra=escolherQuebra(p1,timeline.slice(0,6));

    document.getElementById("paresOut").innerHTML=`
      Par 1: T${p1.a} · T${p1.b}<br/>
      Par 2: T${p2.a} · T${p2.b}<br/>
      Quebra: T${quebra}
    `;

    const trinca=melhorTrinca(ultimo,p1);

    document.getElementById("trincaOut").innerHTML=`
      Número analisado: <b>${ultimo}</b><br/>
      Trinca indicada: <b>${trinca.trinca.join("-")}</b><br/>
      Histórico: ${trinca.histHits}<br/>
      Timeline: ${trinca.timeHits}<br/>
      Zonas: ${trinca.zonasHit}<br/>
      Compatível Par 1: ${trinca.par1Hit>0?"SIM":"NÃO"}
    `;
  }

  render();

})();
