(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const terminal = n => n % 10;

  function vizinhos(n){
    const i = track.indexOf(n);
    return [track[(i+36)%37], track[(i+1)%37]];
  }

  // ================= EIXOS =================
  const eixos = [
    { nome:"ZERO", trios:[[0,32,15],[19,4,21],[2,25,17],[34,6,27]] },
    { nome:"TIERS", trios:[[13,36,11],[30,8,23],[10,5,24],[16,33,1]] },
    { nome:"ORPHELINS", trios:[[20,14,31],[9,22,18],[7,29,28],[12,35,3]] }
  ];

  // ================= ESTADO =================
  let timeline = [];
  let janela = 6;

  let filtrosT = new Set();
  let autoTCount = 0;

  let modo = "MANUAL"; // MANUAL | AUTO | VIZINHO | NUMNUM

  const timelinesModo = {
    MANUAL: [],
    AUTO: [],
    VIZINHO: [],
    NUMNUM: []
  };

  let triosAtivosAnterior = {
    MANUAL: [],
    AUTO: [],
    VIZINHO: [],
    NUMNUM: []
  };

  // ================= AUTO T =================
  function calcularAutoTerminais(){
    if (autoTCount < 2) return;
    const set = new Set();
    for (const n of timeline){
      set.add(terminal(n));
      if (set.size >= autoTCount) break;
    }
    filtrosT = set;
    atualizarBotoesT();
  }

  // ================= VIZINHO =================
  function calcularVizinhoTerminais(){
    const cont = {};
    timeline.slice(0,janela).forEach(n=>{
      vizinhos(n).forEach(v=>{
        const t = terminal(v);
        cont[t] = (cont[t]||0)+1;
      });
    });
    filtrosT = new Set(
      Object.entries(cont)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,3)
        .map(x=>parseInt(x[0]))
    );
    atualizarBotoesT();
  }

  // ================= NUM–NUM =================
  function calcularNumeroNumero(){
    if(timeline.length < 2) return;
    const set = new Set();
    timeline.slice(0,2).forEach(n=>{
      set.add(terminal(n));
      vizinhos(n).forEach(v=>set.add(terminal(v)));
    });
    filtrosT = set;
    atualizarBotoesT();
  }

  function atualizarBotoesT(){
    document.querySelectorAll("#btnT button").forEach(b=>{
      const t = parseInt(b.dataset.t);
      if(filtrosT.has(t)){
        b.style.background =
          modo==="MANUAL" ? "#42a5f5" :
          modo==="AUTO"   ? "#00e676" :
          modo==="VIZINHO"? "#ff9800" : "#ab47bc";
      } else {
        b.style.background = "#333";
      }
    });
  }

  // ================= TRIOS =================
  function triosSelecionados(){
    let out = [];
    eixos.forEach(e=>{
      e.trios.forEach(trio=>{
        const hits = trio.map(terminal)
          .filter(t=>!filtrosT.size || filtrosT.has(t)).length;
        if(hits>0){
          out.push({ eixo:e.nome, trio, score:hits/3 });
        }
      });
    });
    return out.sort((a,b)=>b.score-a.score).slice(0,9);
  }

  // ================= VALIDAÇÃO =================
  function validarNumero(n){
    const prev = triosAtivosAnterior[modo];
    if(!prev.length){
      timelinesModo[modo].unshift(null);
      return;
    }
    const ganhou = prev.some(t => t.trio.includes(n));
    timelinesModo[modo].unshift(ganhou);
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:1000px;margin:auto">
      <h3 style="text-align:center">CSM</h3>

      <div style="border:1px solid #444;padding:8px">
        📋 Histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
        <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
          Janela:
          <select id="jan">${[3,4,5,6,7,8,9,10].map(n=>`<option ${n===6?'selected':''}>${n}</option>`)}</select>
          Auto T:
          <select id="autoT">
            <option value="0">Manual</option>
            ${[2,3,4,5,6,7].map(n=>`<option value="${n}">${n}</option>`)}
          </select>
          <button id="viz">Vizinho</button>
          <button id="nn">Num-Num</button>
        </div>
      </div>

      <div style="margin:8px 0">
        🕒 Timeline:
        <div id="tl" style="display:flex;gap:6px;flex-wrap:wrap"></div>
      </div>

      <div style="border:2px solid #00e676;padding:8px;margin:10px 0">
        🎯 Terminais
        <div id="btnT" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div><b>ZERO</b><div id="colZERO"></div></div>
        <div><b>TIERS</b><div id="colTIERS"></div></div>
        <div><b>ORPHELINS</b><div id="colORPH"></div></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  // ================= BOTÕES T =================
  const btnT = document.getElementById("btnT");
  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.dataset.t=t;
    b.textContent="T"+t;
    b.style="padding:6px;background:#333;color:#fff";
    b.onclick=()=>{
      modo="MANUAL";
      filtrosT.has(t)?filtrosT.delete(t):filtrosT.add(t);
      atualizarBotoesT();
      render();
    };
    btnT.appendChild(b);
  }

  document.getElementById("jan").onchange=e=>{
    janela=parseInt(e.target.value);
    if(modo==="VIZINHO") calcularVizinhoTerminais();
    render();
  };

  document.getElementById("autoT").onchange=e=>{
    autoTCount=parseInt(e.target.value);
    filtrosT.clear();
    modo = autoTCount>0 ? "AUTO" : "MANUAL";
    if(autoTCount>0) calcularAutoTerminais();
    atualizarBotoesT();
    render();
  };

  document.getElementById("viz").onclick=()=>{
    modo="VIZINHO";
    filtrosT.clear();
    calcularVizinhoTerminais();
    render();
  };

  document.getElementById("nn").onclick=()=>{
    modo="NUMNUM";
    filtrosT.clear();
    calcularNumeroNumero();
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
    validarNumero(n);
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();

    if(modo==="VIZINHO") calcularVizinhoTerminais();
    else if(modo==="NUMNUM") calcularNumeroNumero();
    else if(modo==="AUTO") calcularAutoTerminais();

    triosAtivosAnterior[modo] = triosSelecionados();
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
    Object.keys(timelinesModo).forEach(k=>timelinesModo[k]=[]);
    filtrosT.clear();
    autoTCount=0;
    modo="MANUAL";
    atualizarBotoesT();
    render();
  };

  function render(){
    const tl = document.getElementById("tl");
    tl.innerHTML="";
    timelinesModo[modo].forEach((v,i)=>{
      const d=document.createElement("div");
      d.textContent = timeline[i];
      d.style=`padding:4px 6px;border-radius:4px;
        background:${v===true?"#2e7d32":v===false?"#c62828":"#333"}`;
      tl.appendChild(d);
    });

    const trios = triosSelecionados();
    const por={ZERO:[],TIERS:[],ORPHELINS:[]};
    trios.forEach(t=>por[t.eixo].push(t.trio.join("-")));
    document.getElementById("colZERO").innerHTML=por.ZERO.join("<br>");
    document.getElementById("colTIERS").innerHTML=por.TIERS.join("<br>");
    document.getElementById("colORPH").innerHTML=por.ORPHELINS.join("<br>");
  }

  render();

})();
