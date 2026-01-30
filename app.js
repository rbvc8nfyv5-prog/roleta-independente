(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  // ================= TRINCAS DE TIMING =================
  const trincasTiming = [
    [4,7,16],
    [2,20,30],
    [6,9,26],
    [17,23,31],
    [18,19,24],
    [9,17,26]
  ];

  // ================= EIXOS (RACE REAL) =================
  const eixos = [
    { nome: "ZERO", nums: [0,32,15,19,4,21,2,25,17,34,6,27] },
    { nome: "TIERS", nums: [13,36,11,30,8,23,10,5,24,16,33,1] },
    { nome: "ORPHELINS", nums: [20,14,31,9,22,18,29,7,28,12,35,3] },
    { nome: "FECHO", nums: [26] }
  ];

  // ================= ESTADO =================
  let timeline = [];
  let janela = 6;
  let coberturaNivel = 2;

  // ================= UTIL =================
  const idx = n => track.indexOf(n);

  function vizinhos(n){
    const i = idx(n);
    let a=[];
    for(let x=-coberturaNivel; x<=coberturaNivel; x++){
      a.push(track[(i+37+x)%37]);
    }
    return a;
  }

  // ================= SCORE DA TRINCA (SEM PESO) =================
  function scoreTrinca(trinca){
    let zona = new Set();
    trinca.forEach(c=>{
      vizinhos(c).forEach(n=>zona.add(n));
    });

    let total = 0;
    let curto = 0;

    timeline.slice(0,janela).forEach(n=>{
      if(zona.has(n)) total++;
    });

    timeline.slice(0,3).forEach(n=>{
      if(zona.has(n)) curto++;
    });

    let penalidade = 0;
    if(total > 0 && curto < Math.ceil(total * 0.5)){
      penalidade = Math.ceil(total * 0.4);
    }

    return total - penalidade;
  }

  function melhorTrinca(){
    let best=null;
    trincasTiming.forEach(trinca=>{
      const sc = scoreTrinca(trinca);
      if(!best || sc > best.score){
        best = { trinca, score: sc };
      }
    });
    return best;
  }

  // ================= EIXO DOMINANTE =================
  function eixoDominante(){
    let res = eixos.map(e=>{
      let c = 0;
      timeline.slice(0,janela).forEach(n=>{
        if(e.nums.includes(n)) c++;
      });
      return { ...e, count: c };
    });

    res.sort((a,b)=>b.count - a.count);
    return res[0];
  }

  // ================= RELAÇÃO TRINCA × EIXO =================
  function relacaoTrincaEixo(trinca, eixo){
    let dentro = trinca.filter(n=>eixo.nums.includes(n)).length;

    if(dentro === 3) return { tipo:"CONTINUAÇÃO", cor:"#00e676" };
    if(dentro === 1 || dentro === 2) return { tipo:"ALERTA", cor:"#ffeb3b" };
    return { tipo:"MIGRAÇÃO", cor:"#ff5252" };
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:720px;margin:auto">
      <h3 style="text-align:center">CSM – Trinca × Eixo</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Cole histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
        <div style="margin-top:6px">
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

      <div style="border:2px solid #00e676;padding:10px;margin:10px 0;text-align:center">
        🎯 <b>TRINCA TIMING</b><br>
        <span id="trincaBox" style="font-size:20px"></span>
      </div>

      <div style="border:2px solid #888;padding:10px;margin:10px 0;text-align:center">
        🧭 <b>EIXO DOMINANTE</b><br>
        <span id="eixoBox"></span>
      </div>

      <div style="border:2px solid #444;padding:10px;margin:10px 0;text-align:center">
        🔎 <b>LEITURA</b><br>
        <span id="leituraBox"></span>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  document.getElementById("jan").onchange = e=>{
    janela = parseInt(e.target.value,10);
    render();
  };

  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>add(n);
    document.getElementById("nums").appendChild(b);
  }

  function add(n){
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
    timeline=[];
    render();
  };

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");
    if(timeline.length===0) return;

    const t = melhorTrinca();
    const e = eixoDominante();
    const r = relacaoTrincaEixo(t.trinca, e);

    document.getElementById("trincaBox").textContent =
      `${t.trinca.join(" - ")} | score ${t.score}`;

    document.getElementById("eixoBox").textContent =
      `${e.nome} (${e.count})`;

    document.getElementById("leituraBox").innerHTML =
      `<span style="color:${r.cor};font-size:18px">${r.tipo}</span>`;
  }

  render();

})();
