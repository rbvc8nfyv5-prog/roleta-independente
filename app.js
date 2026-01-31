(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const terminal = n => n % 10;

  // ================= EIXOS =================
  const eixos = [
    {
      nome: "ZERO",
      trios: [
        [0,32,15],
        [19,4,21],
        [2,25,17],
        [34,6,27]
      ]
    },
    {
      nome: "TIERS",
      trios: [
        [13,36,11],
        [30,8,23],
        [10,5,24],
        [16,33,1]
      ]
    },
    {
      nome: "ORPHELINS",
      trios: [
        [20,14,31],
        [9,22,18],
        [7,29,28],
        [12,35,3]
      ]
    },
    {
      nome: "FECHO",
      trios: [[3,26,0]]
    }
  ];

  const eixoPorNumero = (() => {
    const m = new Map();
    eixos.forEach(e => e.trios.flat().forEach(n => m.set(n, e.nome)));
    return m;
  })();

  // ================= ESTADO =================
  let timeline = [];
  let janela = 6;
  let filtrosT = new Set(); // T selecionados

  // ================= T POR EIXO (COM FILTRO) =================
  function statsTerminaisPorEixo(){
    const base = timeline.slice(0, janela);
    const cont = {
      ZERO: Array(10).fill(0),
      TIERS: Array(10).fill(0),
      ORPHELINS: Array(10).fill(0),
      FECHO: Array(10).fill(0)
    };

    base.forEach(n=>{
      const t = terminal(n);
      if (filtrosT.size && !filtrosT.has(t)) return;

      const e = eixoPorNumero.get(n) || "FECHO";
      cont[e][t]++;
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

    ["ZERO","TIERS","ORPHELINS"].forEach(nome=>{
      candidatos.filter(x=>x.eixo===nome).slice(0,2).forEach(add);
    });

    for(const c of candidatos){
      if(pick.length >= 9) break;
      add(c);
    }

    return pick.filter(x=>x.eixo!=="FECHO").slice(0,9);
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML=`
    <div style="padding:10px;max-width:1000px;margin:auto">
      <h3 style="text-align:center">CSM — Seleção de Terminais</h3>

      <div style="border:1px solid #444;padding:8px">
        📋 Histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
        <div style="margin-top:6px">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
          Janela:
          <select id="jan">
            ${Array.from({length:8},(_,i)=>`<option ${i+3===6?'selected':''}>${i+3}</option>`).join("")}
          </select>
        </div>
      </div>

      <div style="margin:8px 0">🕒 Timeline (14): <span id="tl"></span></div>

      <div style="border:2px solid #00e676;padding:8px;margin:10px 0">
        🎯 <b>Selecionar Terminais (T)</b><br>
        <div id="btnT" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div style="border:2px solid #ff5252;padding:8px">
          <b>ZERO</b><div id="colZERO"></div>
        </div>
        <div style="border:2px solid #42a5f5;padding:8px">
          <b>TIERS</b><div id="colTIERS"></div>
        </div>
        <div style="border:2px solid #66bb6a;padding:8px">
          <b>ORPHELINS</b><div id="colORPH"></div>
        </div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  // Botões T0–T9
  const btnT = document.getElementById("btnT");
  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.textContent="T"+t;
    b.style="padding:6px;background:#333;color:#fff;border:1px solid #555";
    b.onclick=()=>{
      filtrosT.has(t) ? filtrosT.delete(t) : filtrosT.add(t);
      b.style.background = filtrosT.has(t) ? "#00e676" : "#333";
      render();
    };
    btnT.appendChild(b);
  }

  document.getElementById("jan").onchange=e=>{
    janela=parseInt(e.target.value,10);
    render();
  };

  for(let n=0;n<=36;n++){
    const b=document.createElement("button");
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
    filtrosT.clear();
    document.querySelectorAll("#btnT button").forEach(b=>b.style.background="#333");
    render();
  };

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");
    const trios = triosSelecionados9();
    const por = { ZERO:[], TIERS:[], ORPHELINS:[] };
    trios.forEach(x=>por[x.eixo].push(x.trio.join("-")));
    document.getElementById("colZERO").innerHTML = por.ZERO.map(x=>`<div>${x}</div>`).join("");
    document.getElementById("colTIERS").innerHTML = por.TIERS.map(x=>`<div>${x}</div>`).join("");
    document.getElementById("colORPH").innerHTML = por.ORPHELINS.map(x=>`<div>${x}</div>`).join("");
  }

  render();

})();
