(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  const terminais = {
    0:[0,10,20,30], 1:[1,11,21,31], 2:[2,12,22,32], 3:[3,13,23,33],
    4:[4,14,24,34], 5:[5,15,25,35], 6:[6,16,26,36],
    7:[7,17,27], 8:[8,18,28], 9:[9,19,29]
  };

  const terminal = n => n % 10;

  // ================= GRUPOS =================
  const grupos = {
    G1: [2,5,8], G2: [12,15,18], G3: [22,25,28], G4: [32,35],
    G5: [3,6,9], G6: [10,13,16,19], G7: [20,23,26,29], G8: [30,33,36],
    G9: [1,4,7], G10:[11,14,17], G11:[21,24,27], G12:[31,34]
  };

  // ================= ESTADO =================
  let hist = [];       // histórico oculto completo
  let timeline = [];   // últimos 14 (visual)

  // ================= UTIL =================
  function vizinhos(n){
    let i = track.indexOf(n);
    return [ track[(i+36)%37], track[(i+1)%37] ];
  }
  function grupoDoNumero(n){
    for (let k in grupos){
      if (grupos[k].includes(n)) return k;
    }
    return null;
  }

  // ---------- cobertura real por terminal (terminal + vizinhos na pista)
  function coverTerminal(t){
    let s = new Set();
    (terminais[t]||[]).forEach(n=>{
      let i = track.indexOf(n);
      if(i<0) return;
      s.add(n);
      s.add(track[(i+36)%37]);
      s.add(track[(i+1)%37]);
    });
    return s;
  }
  const covers = Array.from({length:10},(_,t)=>coverTerminal(t));

  // ================= COLETA: 1º NÚMERO APÓS CADA OCORRÊNCIA =================
  function chamadosPorGrupo(grupoKey){
    let chamados = [];
    const setG = new Set(grupos[grupoKey]);
    for (let i = 0; i < hist.length - 1; i++){
      if (setG.has(hist[i])) chamados.push(hist[i+1]);
    }
    return chamados;
  }

  // ================= HELPERS =================
  function rank(arr){
    let m={};
    arr.forEach(x=>m[x]=(m[x]||0)+1);
    return Object.entries(m)
      .sort((a,b)=>b[1]-a[1])
      .map(([k,v])=>({k:Number(k), v}));
  }

  function coberturaSet(setNums, base){
    let hits = 0;
    base.forEach(n=>{ if(setNums.has(n)) hits++; });
    return hits;
  }

  function scoreZonas(setNums){
    const zones = [0,0,0,0];
    setNums.forEach(n=>{
      const i = track.indexOf(n);
      if(i<0) return;
      zones[Math.floor(i/10)]++;
    });
    return zones.filter(z=>z>0).length; // 1..4
  }

  // ================= CONFLUÊNCIA DOS 45 PARES =================
  function confluencia45Pares(baseTimeline6, baseChamados6){
    let pares = [];
    for(let a=0;a<10;a++){
      for(let b=a+1;b<10;b++){
        let set = new Set(covers[a]);
        covers[b].forEach(x=>set.add(x));

        const scoreA = coberturaSet(set, baseTimeline6);
        const scoreB = coberturaSet(set, baseChamados6);
        const scoreZ = scoreZonas(set);
        const score = scoreA*2 + scoreB*2 + scoreZ*1;

        pares.push({a,b,score,scoreA,scoreB,scoreZ,set});
      }
    }
    pares.sort((x,y)=>y.score-x.score);
    return pares;
  }

  function escolherQuebra(par, baseTimeline6, baseChamados6){
    let best = { t:null, gain:-1 };
    const baseSet = new Set(par.set);
    const before =
      coberturaSet(baseSet, baseTimeline6) +
      coberturaSet(baseSet, baseChamados6);

    for(let t=0;t<10;t++){
      if(t===par.a || t===par.b) continue;
      let set3 = new Set(baseSet);
      covers[t].forEach(x=>set3.add(x));

      const after =
        coberturaSet(set3, baseTimeline6) +
        coberturaSet(set3, baseChamados6);

      const gain = after - before;
      if(gain > best.gain){
        best = { t, gain };
      }
    }
    return best.t;
  }

  // ================= ANÁLISE CONDICIONADA AO NÚMERO =================
  // (par anterior + número atual) -> próximo número
  function mapaNumeroPorPar(){
    let mapa = {};
    for(let i=2;i<hist.length-1;i++){
      let tA = terminal(hist[i-2]);
      let tB = terminal(hist[i-1]);
      let numero = hist[i];
      let prox = hist[i+1];
      let key = `${tA}-${tB}|${numero}`;
      if(!mapa[key]) mapa[key] = { nextNums:[], nextTerms:[] };
      mapa[key].nextNums.push(prox);
      mapa[key].nextTerms.push(terminal(prox));
    }
    return mapa;
  }

  // Retorna SOMENTE os MAIS FORTES para um número
  function analiseDoNumeroTop(numero){
    let mapa = mapaNumeroPorPar();
    let saida = [];

    Object.keys(mapa).forEach(key=>{
      let [par, num] = key.split("|");
      if(Number(num) !== numero) return;

      let [tA, tB] = par.split("-").map(Number);

      let numsRank = rank(mapa[key].nextNums);
      let tRank = rank(mapa[key].nextTerms);

      // só os MAIS FORTES
      saida.push({
        tA, tB,
        topNum: numsRank[0] || null,
        topT: tRank[0] || null
      });
    });

    // ordenar por força (ocorrência do topNum)
    saida.sort((x,y)=>{
      const ax = x.topNum ? x.topNum.v : 0;
      const ay = y.topNum ? y.topNum.v : 0;
      return ay - ax;
    });

    return saida.slice(0,2); // mostrar só as 2 tendências mais fortes
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  const stamp = new Date().toLocaleDateString()+" "+new Date().toLocaleTimeString();

  document.body.innerHTML = `
    <div style="padding:10px;font-family:sans-serif;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Confluências & Análises</h3>
      <div style="text-align:center;font-size:12px;color:#aaa;margin-bottom:8px">
        🔄 Atualizado em: <b>${stamp}</b>
      </div>

      <div style="border:1px solid #444;padding:8px;margin-bottom:10px">
        📋 Cole até <b>500</b> números:
        <input id="pasteInput"
          style="width:100%;padding:6px;background:#222;color:#fff;border:1px solid #555;margin-top:6px"
          placeholder="Ex: 32 15 19 4 21 2 25 17 ..." />
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <button id="btnColar" style="padding:6px 12px;background:#333;color:#fff;border:1px solid #777">Colar</button>
          <button id="btnLimpar" style="padding:6px 12px;background:#222;color:#fff;border:1px solid #777">Limpar</button>
          <div id="infoHist" style="align-self:center;font-size:12px;color:#bbb"></div>
        </div>
      </div>

      <div style="margin-bottom:6px">
        🕒 Linha do tempo (14 – espelhada):
        <div id="timeline" style="margin-top:4px;padding:6px;border:1px solid #555;min-height:22px"></div>
      </div>

      <div style="border:1px solid #666;padding:6px;margin:6px 0;text-align:center">
        🔹 Grupo ativo: <span id="grupoAtual">-</span>
      </div>

      <div style="border:1px solid #999;padding:6px;margin:6px 0">
        📊 Números chamados (1º após cada ocorrência):
        <div id="chamados" style="margin-top:6px;font-size:13px"></div>
      </div>

      <div style="border:1px solid #bbb;padding:8px;margin:8px 0">
        🔗 <b>CONFLUÊNCIA DOS 45 PARES</b>
        <div style="font-size:12px;color:#bbb;margin-top:4px">
          Base A: 6 últimos da timeline • Base B: 6 últimos chamados • Zonas: cobertura na pista
        </div>
        <div id="paresOut" style="margin-top:8px"></div>
      </div>

      <div style="border:1px solid #bbb;padding:8px;margin:8px 0">
        🔎 <b>Análise por Número (mais fortes)</b>
        <div id="numTrendOut" style="margin-top:6px;font-size:13px"></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>
    </div>
  `;

  const numsDiv = document.getElementById("nums");

  // ================= BOTÕES =================
  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff;border:1px solid #555";
    b.onclick=()=>inserirNumero(n);
    numsDiv.appendChild(b);
  }

  // ================= INSERÇÃO =================
  function inserirNumero(n){
    hist.push(n);
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    render();
  }

  // ================= COLAR HISTÓRICO =================
  function parseNums(txt){
    return txt.replace(/\n/g," ")
      .split(/[\s,;]+/)
      .map(x=>parseInt(x,10))
      .filter(n=>!isNaN(n) && n>=0 && n<=36);
  }

  document.getElementById("btnColar").onclick = () => {
    let txt = document.getElementById("pasteInput").value || "";
    let nums = parseNums(txt).slice(0,500);
    if(nums.length === 0) return;
    nums.forEach(n => hist.push(n));
    timeline = hist.slice(-14).reverse();
    document.getElementById("pasteInput").value = "";
    render();
  };

  document.getElementById("btnLimpar").onclick = () => {
    hist = [];
    timeline = [];
    render();
  };

  // ================= RENDER =================
  function render(){
    document.getElementById("timeline").textContent =
      timeline.length ? timeline.join(" · ") : "-";

    document.getElementById("infoHist").textContent =
      `Histórico oculto: ${hist.length} números`;

    if(hist.length===0){
      document.getElementById("grupoAtual").textContent="-";
      document.getElementById("chamados").textContent="-";
      document.getElementById("paresOut").textContent="-";
      document.getElementById("numTrendOut").textContent="-";
      return;
    }

    const ultimo = hist[hist.length-1];
    const grupo = grupoDoNumero(ultimo);
    document.getElementById("grupoAtual").textContent =
      grupo ? `${grupo} (${grupos[grupo].join(" · ")})` : "Sem grupo";

    const chamados = grupo ? chamadosPorGrupo(grupo) : [];
    document.getElementById("chamados").textContent =
      chamados.length ? chamados.join(" · ") : "Nenhum registro ainda.";

    // bases p/ confluência
    const baseTimeline6 = timeline.slice(0,6);
    const baseChamados6 = chamados.slice(-6);

    if(baseTimeline6.length===0 && baseChamados6.length===0){
      document.getElementById("paresOut").textContent = "Aguardando dados...";
      document.getElementById("numTrendOut").textContent = "Aguardando dados...";
      return;
    }

    const ranking = confluencia45Pares(baseTimeline6, baseChamados6);
    const p1 = ranking[0];
    const p2 = ranking[1];
    const q1 = escolherQuebra(p1, baseTimeline6, baseChamados6);

    document.getElementById("paresOut").innerHTML = `
      <div><b>Par 1:</b> T${p1.a} · T${p1.b}
        <span style="color:#bbb"> (A:${p1.scoreA} B:${p1.scoreB} Z:${p1.scoreZ} | SCORE:${p1.score})</span>
      </div>
      <div><b>Par 2:</b> T${p2.a} · T${p2.b}
        <span style="color:#bbb"> (A:${p2.scoreA} B:${p2.scoreB} Z:${p2.scoreZ} | SCORE:${p2.score})</span>
      </div>
      <div style="margin-top:6px"><b>Quebra:</b> T${q1}</div>
    `;

    // ===== ANÁLISE POR NÚMERO (MAIS FORTES) =====
    const tops = analiseDoNumeroTop(ultimo);
    const out = document.getElementById("numTrendOut");

    if(!tops || tops.length===0){
      out.textContent = `Sem dados históricos suficientes para o número ${ultimo}.`;
    }else{
      let html = `<div><b>Número analisado:</b> ${ultimo}</div>`;
      tops.forEach(a=>{
        html += `
          <div style="margin-top:8px;padding-top:6px;border-top:1px dashed #555">
            <b>Tendência anterior:</b> T${a.tA} · T${a.tB}<br/>
            <b>Número mais forte depois:</b> ${a.topNum ? `${a.topNum.k} (${a.topNum.v})` : "-"}<br/>
            <b>T mais forte depois:</b> ${a.topT ? `T${a.topT.k} (${a.topT.v})` : "-"}
          </div>
        `;
      });
      out.innerHTML = html;
    }
  }

  render();

})();
