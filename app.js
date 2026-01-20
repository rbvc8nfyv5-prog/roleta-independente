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
    [33,34,35]
  ];

  // ================= ESTADO =================
  let hist = [];
  let timeline = [];

  // ================= UTIL =================
  function vizinhosCentral(c){
    let i = track.indexOf(c);
    let arr = [];
    for(let d=-4; d<=4; d++){
      arr.push(track[(i+37+d)%37]);
    }
    return arr;
  }

  // mapa: trinca -> Set de cobertura
  const mapaTrincas = trincasCentrais.map(trinca=>{
    let set = new Set();
    trinca.forEach(c=>{
      vizinhosCentral(c).forEach(n=>set.add(n));
    });
    return { trinca, set };
  });

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

  function cobertura(set, base){
    let h = 0;
    base.forEach(n=>{
      if(set.has(n)) h++;
    });
    return h;
  }

  // ================= LEITURA POR TRINCA =================
  function leituraPorTrincas(numero){
    const chamados = numerosChamadosPor(numero);

    return mapaTrincas.map(t=>{
      return {
        trinca: t.trinca,
        chamados: cobertura(t.set, chamados),
        timeline: cobertura(t.set, timeline)
      };
    }).sort((a,b)=>{
      if(b.chamados !== a.chamados) return b.chamados - a.chamados;
      return b.timeline - a.timeline;
    });
  }

  // ================= UI =================
  document.body.style.background = "#111";
  document.body.style.color = "#fff";
  document.body.style.fontFamily = "sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Leitura por Trincas de Centrais</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:10px">
        📋 Cole até <b>500</b> números:
        <input id="pasteInput"
          style="width:100%;padding:6px;background:#222;color:#fff;border:1px solid #555;margin-top:6px" />
        <div style="margin-top:6px">
          <button id="btnColar">Colar</button>
          <button id="btnLimpar">Limpar</button>
        </div>
      </div>

      <div>
        🕒 Linha do tempo (14 – espelhada):
        <div id="timeline" style="border:1px solid #555;padding:6px;margin-top:4px"></div>
      </div>

      <div style="border:1px solid #bbb;padding:8px;margin-top:10px">
        🎯 <b>Leitura por Trincas</b>
        <div id="trincaOut" style="margin-top:6px"></div>
      </div>

      <div id="nums"
        style="display:grid;grid-template-columns:repeat(9,1fr);
               gap:6px;margin-top:14px"></div>
    </div>
  `;

  const numsDiv = document.getElementById("nums");

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

  function parseNums(txt){
    return txt.replace(/\n/g," ")
      .split(/[\s,;]+/)
      .map(x=>parseInt(x,10))
      .filter(n=>!isNaN(n) && n>=0 && n<=36);
  }

  document.getElementById("btnColar").onclick=()=>{
    let nums=parseNums(document.getElementById("pasteInput").value).slice(0,500);
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

    if(hist.length===0){
      document.getElementById("trincaOut").textContent="-";
      return;
    }

    const ultimo = hist[hist.length-1];
    const ranking = leituraPorTrincas(ultimo);

    let html = `<div><b>Número analisado:</b> ${ultimo}</div>`;
    html += `<div style="margin-top:6px"><b>Ranking de Trincas:</b></div>`;

    ranking.forEach(r=>{
      html += `
        <div>
          ${r.trinca.join("-")}
          → chamados: ${r.chamados}
          | timeline: ${r.timeline}
        </div>
      `;
    });

    html += `
      <div style="margin-top:8px">
        🎯 <b>Melhor jogada agora:</b>
        ${ranking[0].trinca.join("-")}
      </div>
    `;

    document.getElementById("trincaOut").innerHTML = html;
  }

  render();

})();
