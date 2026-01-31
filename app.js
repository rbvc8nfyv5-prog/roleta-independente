(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const terminal = n => n % 10;

  // ================= TRINCAS TIMING (TEAM) =================
  const trincasTiming = [
    [4,7,16],
    [2,20,30],
    [6,9,26],
    [17,23,31],
    [18,19,24],
    [9,17,26]
  ];

  // ================= EIXOS (FIXOS) =================
  // (mantendo exatamente os 3 eixos que você já definiu)
  const eixos = [
    { nome: "ZERO", trios: [[0,32,15],[15,19,4],[21,2,25],[17,34,6]] },
    { nome: "TIERS", trios: [[13,36,11],[30,8,23],[10,5,24],[16,33,1]] },
    { nome: "ORPHELINS", trios: [[20,14,31],[31,9,22],[29,7,28],[12,35,3]] }
  ];

  // Mapa rápido: número -> eixo
  const eixoPorNumero = (() => {
    const m = new Map();
    eixos.forEach(e => e.trios.flat().forEach(n => m.set(n, e.nome)));
    return m;
  })();

  // ================= ESTADO =================
  let timeline = [];
  let janela = 6;

  // ================= TRINCA TIMING ATIVA (sem peso, só contagem) =================
  function trincaTimingAtiva(){
    let best = null;
    const base = timeline.slice(0, janela);

    trincasTiming.forEach(trinca=>{
      let score = 0;
      base.forEach(n => { if(trinca.includes(n)) score++; });

      if(!best || score > best.score){
        best = { trinca, score };
      }
    });

    return best;
  }

  // ================= T POR EIXO (o que você pediu: alinhado nos 3 eixos) =================
  function statsTerminaisPorEixo(){
    const base = timeline.slice(0, janela);

    // contagem por eixo -> T -> qtd
    const cont = {
      ZERO: Array(10).fill(0),
      TIERS: Array(10).fill(0),
      ORPHELINS: Array(10).fill(0),
      OUTRO: Array(10).fill(0)
    };

    base.forEach(n=>{
      const e = eixoPorNumero.get(n) || "OUTRO";
      cont[e][terminal(n)]++;
    });

    return cont;
  }

  // ================= SELEÇÃO DOS 9 TRIOS (cobre os 3 eixos) =================
  function triosSelecionados9(){
    const cont = statsTerminaisPorEixo();

    // score do trio = soma das contagens dos terminais do trio dentro do próprio eixo
    // (sem peso temporal, cada número da janela vale 1)
    let candidatos = [];
    eixos.forEach(e=>{
      e.trios.forEach(trio=>{
        const score =
          cont[e.nome][terminal(trio[0])] +
          cont[e.nome][terminal(trio[1])] +
          cont[e.nome][terminal(trio[2])];

        candidatos.push({ eixo: e.nome, trio, score });
      });
    });

    // Ordena por score (maior primeiro), mas vamos garantir cobertura por eixo
    candidatos.sort((a,b)=>b.score - a.score);

    // Pega primeiro um “núcleo” de cada eixo (pra não ficar cego no escape)
    const pick = [];
    const usados = new Set();
    const add = (obj) => {
      const key = obj.eixo + "|" + obj.trio.join("-");
      if(!usados.has(key)){
        usados.add(key);
        pick.push(obj);
      }
    };

    // Garantia mínima: 2 trios por eixo (se existirem)
    ["ZERO","TIERS","ORPHELINS"].forEach(nome=>{
      const topEixo = candidatos.filter(x=>x.eixo===nome).slice(0,2);
      topEixo.forEach(add);
    });

    // Completa até 9 com os melhores restantes (já ordenados)
    for(const c of candidatos){
      if(pick.length >= 9) break;
      add(c);
    }

    return pick.slice(0,9);
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML=`
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM — Timing + Trios (T alinhado nos 3 eixos)</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff;border:1px solid #555"/>
        <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
          Janela:
          <select id="jan">
            <option>3</option><option>4</option><option>5</option>
            <option selected>6</option>
            <option>7</option><option>8</option><option>9</option><option>10</option>
          </select>
        </div>
      </div>

      <div>🕒 Timeline (14): <span id="tl"></span></div>

      <div style="border:2px solid #00e676;padding:10px;margin:10px 0">
        🎯 <b>TRINCA TIMING (TEAM)</b><br>
        <span id="trincaBox"></span>
      </div>

      <div style="border:2px solid #42a5f5;padding:10px;margin:10px 0">
        📌 <b>T alinhado nos 3 eixos (janela)</b><br>
        <div id="tEixosBox"></div>
      </div>

      <div style="border:2px solid #e53935;padding:10px;margin:10px 0">
        🧭 <b>9 Trios (dentro dos eixos, alinhado com T do eixo)</b>
        <div id="triosBox"></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  document.getElementById("jan").onchange=e=>{
    janela=parseInt(e.target.value,10);
    render();
  };

  // botões 0-36
  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff;border:1px solid #555";
    b.onclick=()=>add(n);
    document.getElementById("nums").appendChild(b);
  }

  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    render();
  }

  document.getElementById("col").onclick=()=>{
    const v = document.getElementById("inp").value;
    v.split(/[\s,]+/)
      .map(Number)
      .filter(n=>Number.isFinite(n) && n>=0 && n<=36)
      .forEach(add);
    document.getElementById("inp").value="";
  };

  document.getElementById("lim").onclick=()=>{
    timeline=[];
    render();
  };

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");
    if(!timeline.length){
      document.getElementById("trincaBox").textContent = "-";
      document.getElementById("tEixosBox").innerHTML = "-";
      document.getElementById("triosBox").innerHTML = "-";
      return;
    }

    // Trinca timing
    const t = trincaTimingAtiva();
    document.getElementById("trincaBox").textContent =
      t ? `${t.trinca.join(" - ")} | hits ${t.score}` : "-";

    // T por eixo (mostrar ordenado)
    const cont = statsTerminaisPorEixo();
    const eixoList = ["ZERO","TIERS","ORPHELINS"];

    document.getElementById("tEixosBox").innerHTML = eixoList.map(nome=>{
      const arr = cont[nome]
        .map((v,idx)=>({T:idx,v}))
        .filter(x=>x.v>0)
        .sort((a,b)=>b.v-a.v);

      const linha = arr.length
        ? arr.map(x=>`T${x.T}(${x.v})`).join(" · ")
        : "sem leitura";

      return `<div style="margin-top:4px"><b>${nome}</b>: ${linha}</div>`;
    }).join("");

    // 9 trios alinhados nos eixos
    const trios = triosSelecionados9();
    document.getElementById("triosBox").innerHTML =
      trios.map(x=>`<div style="margin-top:4px"><b>${x.eixo}</b>: ${x.trio.join("-")} <span style="opacity:.7">(${x.score})</span></div>`).join("");
  }

  render();

})();
