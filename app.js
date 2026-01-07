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

    // percorre TODO o histórico
    for (let i = 0; i < hist.length - 1; i++){
      if (setG.has(hist[i])) {
        chamados.push(hist[i+1]); // só o primeiro após
      }
    }
    return chamados;
  }

  // ================= MELHOR JOGADA (TERMINAIS + VIZINHOS) =================
  function melhorJogadaPorNumeros(nums){
    if (!nums || nums.length === 0) return null;

    let mapa = {};
    nums.forEach(n=>{
      // conta o próprio
      mapa[terminal(n)] = (mapa[terminal(n)]||0) + 1;
      // conta vizinhos
      vizinhos(n).forEach(v=>{
        mapa[terminal(v)] = (mapa[terminal(v)]||0) + 1;
      });
    });

    let ordenado = Object.entries(mapa)
      .sort((a,b)=>b[1]-a[1])
      .map(e=>Number(e[0]));

    return {
      principais: ordenado.slice(0,2),
      quebra: ordenado[2] ?? null,
      ranking: ordenado
    };
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";

  document.body.innerHTML = `
    <div style="padding:10px;font-family:sans-serif;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Melhor Jogada por GRUPO (1º após)</h3>

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

      <div style="border:1px solid #bbb;padding:6px;margin:6px 0;text-align:center">
        🎯 Melhor jogada (terminais):
        <div id="jogada" style="margin-top:6px"></div>
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

  // ================= RENDER =================
  function render(){
    document.getElementById("timeline").textContent =
      timeline.join(" · ");

    if(hist.length===0){
      document.getElementById("grupoAtual").textContent="-";
      document.getElementById("chamados").textContent="-";
      document.getElementById("jogada").textContent="-";
      return;
    }

    let ultimo = hist[hist.length-1];
    let grupo = grupoDoNumero(ultimo);

    document.getElementById("grupoAtual").textContent =
      grupo ? `${grupo} (${grupos[grupo].join(" · ")})` : "Sem grupo";

    if(!grupo){
      document.getElementById("chamados").textContent="—";
      document.getElementById("jogada").textContent="—";
      return;
    }

    let chamados = chamadosPorGrupo(grupo);
    document.getElementById("chamados").textContent =
      chamados.length ? chamados.join(" · ") : "Nenhum registro ainda.";

    let mj = melhorJogadaPorNumeros(chamados);
    if(!mj){
      document.getElementById("jogada").textContent = "Aguardando dados...";
    }else{
      let txt = `Principais: ${mj.principais.join(" · ")}`;
      if(mj.quebra!==null) txt += ` | Quebra: ${mj.quebra}`;
      document.getElementById("jogada").textContent = txt;
    }
  }

  render();

})();
