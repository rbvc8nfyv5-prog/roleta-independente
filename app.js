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
  const eixos = {
    ZERO: [[0,32,15],[19,4,21],[2,25,17],[34,6,27]],
    TIERS: [[13,36,11],[30,8,23],[10,5,24],[16,33,1]],
    ORPHELINS: [[20,14,31],[9,22,18],[7,29,28],[12,35,3]]
  };

  // ================= ESTADO GLOBAL =================
  let timeline = [];
  let janela = 6;

  let modoAtivo = "MANUAL"; // MANUAL | AUTO | VIZINHO | NUNUM
  const analises = {
    MANUAL: { filtrosT:new Set(), res:[] },
    AUTO:   { filtrosT:new Set(), res:[] },
    VIZINHO:{ filtrosT:new Set(), res:[] },
    NUNUM:  { filtrosT:new Set(), res:[] }
  };

  let autoTCount = 0;

  // ================= UTIL =================
  function vizinhos(n,d){
    const i = track.indexOf(n);
    const r = new Set();
    for(let x=-d;x<=d;x++) r.add(track[(i+37+x)%37]);
    return r;
  }

  function validarNumero(numero, trios){
    return trios.some(t=>t.flatMap(c=>[...vizinhos(c,1)]).includes(numero));
  }

  // ================= AUTO TERMINAIS =================
  function calcularAutoTerminais(){
    const set = new Set();
    for(const n of timeline){
      set.add(terminal(n));
      if(set.size>=autoTCount) break;
    }
    analises.AUTO.filtrosT = set;
  }

  // ================= TRIOS =================
  function gerarTrios(filtrosT){
    let lista=[];
    Object.entries(eixos).forEach(([nome,trios])=>{
      trios.forEach(trio=>{
        const inter = trio.map(terminal).filter(t=>!filtrosT.size||filtrosT.has(t)).length;
        if(inter>0) lista.push({ eixo:nome, trio, score:inter });
      });
    });
    lista.sort((a,b)=>b.score-a.score);

    // mínimo 8 / máximo 9
    return lista.slice(0,9).filter((_,i)=>i<9);
  }

  // ================= REGISTRAR RESULTADO =================
  function registrarResultado(modo, numero){
    const filtros = analises[modo].filtrosT;
    const trios = gerarTrios(filtros).map(x=>x.trio);
    const r = validarNumero(numero,trios) ? "V" : "X";
    analises[modo].res.unshift(r);
    if(analises[modo].res.length>timeline.length)
      analises[modo].res.length=timeline.length;
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML=`
  <div style="padding:10px;max-width:1000px;margin:auto">
    <h3 style="text-align:center">CSM</h3>

    <div style="border:1px solid #444;padding:8px">
      <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
      <div style="margin-top:6px">
        <button id="col">Colar</button>
        <button id="lim">Limpar</button>
        Janela:
        <select id="jan">${Array.from({length:8},(_,i)=>`<option ${i+3===6?'selected':''}>${i+3}</option>`).join("")}</select>
        Auto T:
        <select id="autoT">
          <option value="0">Manual</option>
          ${[2,3,4,5,6,7].map(n=>`<option value="${n}">${n}</option>`).join("")}
        </select>
      </div>
    </div>

    <div style="margin:8px 0">
      🕒 Timeline:
      <span id="tl"></span>
    </div>

    <div style="display:flex;gap:6px;margin:8px 0">
      ${["MANUAL","AUTO","VIZINHO","NUNUM"].map(m=>`<button class="modo" data-m="${m}">${m}</button>`).join("")}
    </div>

    <div id="btnT" style="display:flex;gap:6px;flex-wrap:wrap"></div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px">
      <div><b>ZERO</b><div id="cZERO"></div></div>
      <div><b>TIERS</b><div id="cTIERS"></div></div>
      <div><b>ORPHELINS</b><div id="cORP"></div></div>
    </div>

    <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
  </div>
  `;

  // ================= BOTÕES =================
  document.querySelectorAll(".modo").forEach(b=>{
    b.onclick=()=>{
      modoAtivo=b.dataset.m;
      render();
    };
  });

  const btnT=document.getElementById("btnT");
  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.textContent="T"+t;
    b.onclick=()=>{
      analises.MANUAL.filtrosT.has(t)
        ? analises.MANUAL.filtrosT.delete(t)
        : analises.MANUAL.filtrosT.add(t);
      modoAtivo="MANUAL";
      render();
    };
    btnT.appendChild(b);
  }

  for(let n=0;n<=36;n++){
    const b=document.createElement("button");
    b.textContent=n;
    b.onclick=()=>add(n);
    document.getElementById("nums").appendChild(b);
  }

  // ================= EVENTOS =================
  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();

    Object.keys(analises).forEach(m=>{
      if(timeline.length>1)
        registrarResultado(m,n);
    });

    if(autoTCount>0) calcularAutoTerminais();
    render();
  }

  document.getElementById("col").onclick=()=>{
    document.getElementById("inp").value.split(/[\s,]+/)
      .map(Number).filter(n=>n>=0&&n<=36).forEach(add);
    document.getElementById("inp").value="";
  };

  document.getElementById("lim").onclick=()=>{
    timeline=[];
    Object.values(analises).forEach(a=>a.res=[]);
    render();
  };

  document.getElementById("jan").onchange=e=>{
    janela=parseInt(e.target.value,10);
    render();
  };

  document.getElementById("autoT").onchange=e=>{
    autoTCount=parseInt(e.target.value,10);
    analises.AUTO.filtrosT.clear();
    if(autoTCount>0) calcularAutoTerminais();
    modoAtivo="AUTO";
    render();
  };

  // ================= RENDER =================
  function render(){
    // timeline verde/vermelha
    const res = analises[modoAtivo].res;
    document.getElementById("tl").innerHTML =
      timeline.map((n,i)=>{
        const r=res[i];
        const c=r==="V"?"#00e676":r==="X"?"#ff5252":"#ccc";
        return `<span style="font-size:17px;font-weight:600;color:${c}">${n}</span>`;
      }).join(" · ");

    // pintar T
    document.querySelectorAll("#btnT button").forEach(b=>{
      const t=+b.textContent.slice(1);
      const ativo = modoAtivo==="MANUAL"
        ? analises.MANUAL.filtrosT.has(t)
        : analises[modoAtivo].filtrosT.has(t);
      b.style.background=ativo?"#00e676":"#333";
      b.style.color="#fff";
    });

    // trios
    const trios=gerarTrios(analises[modoAtivo].filtrosT);
    const por={ZERO:[],TIERS:[],ORPHELINS:[]};
    trios.forEach(x=>por[x.eixo].push(x.trio.join("-")));

    document.getElementById("cZERO").innerHTML=por.ZERO.join("<br>");
    document.getElementById("cTIERS").innerHTML=por.TIERS.join("<br>");
    document.getElementById("cORP").innerHTML=por.ORPHELINS.join("<br>");
  }

  render();

})();
