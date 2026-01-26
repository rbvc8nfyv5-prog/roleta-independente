(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  const trincas = [
    [4,7,16],
    [2,20,30],
    [6,9,26],
    [17,23,31],
    [18,19,24],
    [9,17,26]
  ];

  // ================= ESTADO =================
  let hist = [];
  let timeline = [];
  let janela = 6;

  // histórico oculto da trinca atual
  let estadoAtual = {
    trinca: null,
    area: null,
    wins: 0,
    quebras: 0,
    ultimoRetorno: null
  };

  // ================= UTIL =================
  function vizinhos(n, d){
    const i = track.indexOf(n);
    let a=[];
    for(let x=-d;x<=d;x++){
      a.push(track[(i+37+x)%37]);
    }
    return a;
  }

  function areaTrinca(trinca){
    let s=new Set();
    trinca.forEach(c=>{
      vizinhos(c,2).forEach(n=>s.add(n));
    });
    return s;
  }

  // ================= TRINCA PELO TIMING =================
  function melhorTrincaTimeline(){
    const base = timeline.slice(0,janela);
    let best=null;

    trincas.forEach(trinca=>{
      const area = areaTrinca(trinca);
      let score = base.filter(n=>area.has(n)).length;
      if(!best || score > best.score){
        best = { trinca, area, score };
      }
    });

    return best;
  }

  // ================= ATUALIZA HISTÓRICO OCULTO =================
  function atualizarEstado(n, novaTrinca){
    if(
      !estadoAtual.trinca ||
      novaTrinca.join("-") !== estadoAtual.trinca.join("-")
    ){
      estadoAtual = {
        trinca: novaTrinca,
        area: areaTrinca(novaTrinca),
        wins: 0,
        quebras: 0,
        ultimoRetorno: null
      };
    }

    if(estadoAtual.area.has(n)){
      if(estadoAtual.quebras > 0){
        estadoAtual.ultimoRetorno = estadoAtual.quebras;
      }
      estadoAtual.wins++;
      estadoAtual.quebras = 0;
    } else {
      estadoAtual.quebras++;
    }
  }

  function textoEsquadra(){
    if(estadoAtual.ultimoRetorno === 1){
      return "Trinca quebrou → jogar em RETORNO DE PRIMEIRA";
    }
    if(estadoAtual.ultimoRetorno === 2){
      return "Trinca quebrou → jogar em RETORNO DE SEGUNDA";
    }
    if(estadoAtual.quebras > 0){
      return "Trinca em quebra (aguardar retorno)";
    }
    return "Trinca em sequência de vitórias";
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Esquadra da Trinca</h3>

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

      <div>🕒 Linha do tempo (14): <span id="tl"></span></div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🎯 <b>Trinca do Timing</b><br>
        <span id="trinca"></span>
      </div>

      <div style="border:2px solid #0f0;padding:10px;margin:8px 0;font-size:16px">
        📐 <b>Esquadra</b><br>
        <span id="esquadra"></span>
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

    const melhor = melhorTrincaTimeline();
    if(melhor){
      atualizarEstado(n, melhor.trinca);
    }
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
    hist=[]; timeline=[];
    estadoAtual = { trinca:null, area:null, wins:0, quebras:0, ultimoRetorno:null };
    render();
  };

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");

    const melhor = melhorTrincaTimeline();
    document.getElementById("trinca").textContent =
      melhor ? `${melhor.trinca.join("-")} | impactos: ${melhor.score}` : "-";

    document.getElementById("esquadra").textContent = textoEsquadra();
  }

})();
