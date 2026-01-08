(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];
  const terminal = n => n % 10;

  // ================= GRUPOS =================
  const grupos = {
    G1: [2,5,8],
    G2: [12,15,18],
    G3: [22,25,28],
    G4: [32,35],

    G5: [3,6,9],
    G6: [10,13,16,19],
    G7: [20,23,26,29],
    G8: [30,33,36],

    G9: [1,4,7],
    G10:[11,14,17],
    G11:[21,24,27],
    G12:[31,34]
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

  // ================= COLETA: 1º NÚMERO APÓS CADA OCORRÊNCIA =================
  function chamadosPorGrupo(grupoKey){
    let chamados = [];
    const setG = new Set(grupos[grupoKey]);
    for (let i = 0; i < hist.length - 1; i++){
      if (setG.has(hist[i])) chamados.push(hist[i+1]); // só o primeiro após
    }
    return chamados;
  }

  // ================= MÉTRICA: MELHOR T DE UM CONJUNTO =================
  function melhorTdosNumeros(nums){
    if(!nums || nums.length===0) return null;

    let score = {};
    nums.forEach(n=>{
      const ts = new Set([ terminal(n), ...vizinhos(n).map(v=>terminal(v)) ]);
      ts.forEach(t => score[t] = (score[t]||0) + 1);
    });

    const ordenado = Object.entries(score)
      .sort((a,b)=>b[1]-a[1])
      .map(([t,v])=>({t:Number(t), v}));

    return { score, ordenado };
  }

  // ================= CONFLUÊNCIA =================
  function confluenciaT(baseTimeline6, baseChamados6){
    const A = melhorTdosNumeros(baseTimeline6);
    const B = melhorTdosNumeros(baseChamados6);
    if(!A && !B) return null;

    let comb = {};
    if(A) Object.entries(A.score).forEach(([t,v])=> comb[t]=(comb[t]||0)+v);
    if(B) Object.entries(B.score).forEach(([t,v])=> comb[t]=(comb[t]||0)+v);

    const rank = Object.entries(comb)
      .sort((a,b)=>b[1]-a[1])
      .map(([t,v])=>({t:Number(t), v}));

    return {
      rank,
      melhor: rank[0] || null,
      top3: rank.slice(0,3),
      A, B
    };
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";

  const agora = new Date();
  const stamp = agora.toLocaleDateString() + " " + agora.toLocaleTimeString();

  document.body.innerHTML = `
    <div style="padding:10px;font-family:sans-serif;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Confluência de Terminais</h3>
      <div style="text-align:center;font-size:12px;color:#aaa;margin-bottom:8px">
        🔄 Atualizado em: <b>${stamp}</b>
      </div>

      <div style="border:1px solid #444;padding:8px;margin-bottom:10px">
        📋 Cole até <b>500</b> números:
        <input id="pasteInput"
          style="width:100%;padding:6px;background:#222;color:#fff;border:1px solid #555;margin-top:6px"
          placeholder="Ex: 32 15 19 4 21 2 25 17 ..." />
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <button id="btnColar"
            style="padding:6px 12px;background:#333;color:#fff;border:1px solid #777">
            Colar no histórico
          </button>
          <button id="btnLimpar"
            style="padding:6px 12px;background:#222;color:#fff;border:1px solid #777">
            Limpar histórico
          </button>
          <div id="infoHist" style="align-self:center;font-size:12px;color:#bbb"></div>
        </div>
      </div>

      <div style="margin-bottom:6px">
        🕒 Linha do tempo (14 – espelhada):
        <div id="timeline"
          style="margin-top:4px;padding:6px;border:1px solid #555;min-height:22px">
        </div>
      </div>

      <div style="border:1px solid #666;padding:6px;margin:6px 0;text-align:center">
        🔹 Grupo ativo: <span id="grupoAtual">-</span>
      </div>

      <div style="border:1px solid #999;padding:6px;margin:6px 0">
        📊 Números chamados (1º após cada ocorrência):
        <div id="chamados" style="margin-top:6px;font-size:13px"></div>
      </div>

      <div style="border:1px solid #bbb;padding:8px;margin:8px 0">
        🔗 <b>CONFLUÊNCIA DE T</b>
        <div style="font-size:12px;color:#bbb;margin-top:4px">
          Base A: 6 últimos da linha do tempo • Base B: 6 últimos chamados
        </div>
        <div id="conf" style="margin-top:8px"></div>
      </div>

      <div id="nums"
        style="display:grid;grid-template-columns:repeat(9,1fr);
               gap:6px;margin-top:12px">
      </div>
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
    return txt
      .replace(/\n/g," ")
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
      document.getElementById("conf").textContent="-";
      return;
    }

    const ultimo = hist[hist.length-1];
    const grupo = grupoDoNumero(ultimo);

    document.getElementById("grupoAtual").textContent =
      grupo ? `${grupo} (${grupos[grupo].join(" · ")})` : "Sem grupo";

    if(!grupo){
      document.getElementById("chamados").textContent="—";
      document.getElementById("conf").textContent="—";
      return;
    }

    const chamados = chamadosPorGrupo(grupo);
    document.getElementById("chamados").textContent =
      chamados.length ? chamados.join(" · ") : "Nenhum registro ainda.";

    // Bases para confluência
    const baseTimeline6 = timeline.slice(0,6);
    const baseChamados6 = chamados.slice(-6);

    const conf = confluenciaT(baseTimeline6, baseChamados6);
    if(!conf || !conf.melhor){
      document.getElementById("conf").textContent = "Aguardando dados...";
      return;
    }

    const aTxt = conf.A
      ? conf.A.ordenado.slice(0,3).map(x=>`T${x.t}(${x.v})`).join(" · ")
      : "-";
    const bTxt = conf.B
      ? conf.B.ordenado.slice(0,3).map(x=>`T${x.t}(${x.v})`).join(" · ")
      : "-";

    const bestTxt = conf.top3.map(x=>`T${x.t}`).join(" · ");

    document.getElementById("conf").innerHTML = `
      <div><b>Melhor jogada (confluência):</b> ${bestTxt}</div>
      <div style="font-size:12px;color:#bbb;margin-top:6px">
        A (linha do tempo): ${aTxt}<br/>
        B (chamados): ${bTxt}
      </div>
    `;
  }

  render();

})();
