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
  const eixos = [
    { nome: "ZERO", trios: [[0,32,15],[15,19,4],[21,2,25],[17,34,6]] },
    { nome: "TIERS", trios: [[13,36,11],[30,8,23],[10,5,24],[16,33,1]] },
    { nome: "ORPHELINS", trios: [[20,14,31],[31,9,22],[29,7,28],[12,35,3]] }
  ];

  // número -> eixo
  const eixoPorNumero = (() => {
    const m = new Map();
    eixos.forEach(e => e.trios.flat().forEach(n => m.set(n, e.nome)));
    return m;
  })();

  // ================= ESTADO =================
  let timeline = [];
  let janela = 6;

  // ================= TRINCA TIMING =================
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

  // ================= T POR EIXO =================
  function statsTerminaisPorEixo(){
    const base = timeline.slice(0, janela);
    const cont = {
      ZERO: Array(10).fill(0),
      TIERS: Array(10).fill(0),
      ORPHELINS: Array(10).fill(0)
    };

    base.forEach(n=>{
      const e = eixoPorNumero.get(n);
      if(e) cont[e][terminal(n)]++;
    });

    return cont;
  }

  // ================= SELEÇÃO DOS 9 TRIOS =================
  function triosSelecionados9(){
    const cont = statsTerminaisPorEixo();
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

    candidatos.sort((a,b)=>b.score - a.score);

    const pick = [];
    const usados = new Set();
    const add = (x)=>{
      const k = x.eixo + "|" + x.trio.join("-");
      if(!usados.has(k)){
        usados.add(k);
        pick.push(x);
      }
    };

    // garante cobertura dos 3 eixos
    ["ZERO","TIERS","ORPHELINS"].forEach(nome=>{
      candidatos.filter(x=>x.eixo===nome).slice(0,2).forEach(add);
    });

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
    <div style="padding:10px;max-width:1000px;margin:auto">
      <h3 style="text-align:center">CSM — Timing + Trios por Eixo</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Histórico:
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

      <div style="border:2px solid #00e676;padding:10px;margin:10px 0">
        🎯 <b>TRINCA TIMING (TEAM)</b><br>
        <span id="trincaBox"></span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:10px 0">
        <div style="border:2px solid #ff5252;padding:8px">
          <b>ZERO</b>
          <div id="colZERO"></div>
        </div>
        <div style="border:2px solid #42a5f5;padding:8px">
          <b>TIERS</b>
          <div id="colTIERS"></div>
        </div>
        <div style="border:2px solid #66bb6a;padding:8px">
          <b>ORPHELINS</b>
          <div id="colORPH"></div>
        </div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  document.getElementById("jan").onchange=e=>{
    janela=parseInt(e.target.value,10);
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

    const t = trincaTimingAtiva();
    document.getElementById("trincaBox").textContent =
      t ? `${t.trinca.join(" - ")} | hits ${t.score}` : "-";

    const trios = triosSelecionados9();
    const porEixo = { ZERO:[], TIERS:[], ORPHELINS:[] };
    trios.forEach(x=>porEixo[x.eixo].push(x));

    document.getElementById("colZERO").innerHTML =
      porEixo.ZERO.map(x=>`<div>${x.trio.join("-")}</div>`).join("");

    document.getElementById("colTIERS").innerHTML =
      porEixo.TIERS.map(x=>`<div>${x.trio.join("-")}</div>`).join("");

    document.getElementById("colORPH").innerHTML =
      porEixo.ORPHELINS.map(x=>`<div>${x.trio.join("-")}</div>`).join("");
  }

  render();

})();
