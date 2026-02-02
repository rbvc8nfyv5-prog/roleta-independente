(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const terminal = n => n % 10;
  const vizinhos = n => {
    const i = track.indexOf(n);
    return [track[(i+36)%37], track[(i+1)%37]];
  };

  // ================= EIXOS =================
  const eixos = [
    { nome:"ZERO", trios:[[0,32,15],[19,4,21],[2,25,17],[34,6,27]] },
    { nome:"TIERS", trios:[[13,36,11],[30,8,23],[10,5,24],[16,33,1]] },
    { nome:"ORPHELINS", trios:[[20,14,31],[9,22,18],[7,29,28],[12,35,3]] }
  ];

  // ================= ESTADO =================
  let timeline = [];
  let janela = 6;
  let modoVisivel = "MANUAL";
  let filtrosManual = new Set();

  const analises = {};

  function criar(nome, tipo, param){
    analises[nome] = {
      tipo, param,
      filtrosT:new Set(),
      trios:[],
      res:[]
    };
  }

  criar("MANUAL","MANUAL");
  [3,4,5,6,7,8,9].forEach(n=>criar("AUTO_"+n,"AUTO",n));
  criar("VIZINHO","VIZINHO");
  criar("NUMNUM","NUMNUM");

  // ================= FILTROS =================
  function calcFiltros(a){
    a.filtrosT.clear();

    if(a.tipo==="MANUAL"){
      filtrosManual.forEach(t=>a.filtrosT.add(t));
    }

    if(a.tipo==="AUTO"){
      for(const n of timeline){
        a.filtrosT.add(terminal(n));
        if(a.filtrosT.size>=a.param) break;
      }
    }

    if(a.tipo==="VIZINHO"){
      const c={};
      timeline.slice(0,janela).forEach(n=>{
        vizinhos(n).forEach(v=>{
          const t=terminal(v);
          c[t]=(c[t]||0)+1;
        });
      });
      Object.entries(c)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,3)
        .forEach(x=>a.filtrosT.add(+x[0]));
    }

    if(a.tipo==="NUMNUM"){
      timeline.slice(0,2).forEach(n=>{
        a.filtrosT.add(terminal(n));
        vizinhos(n).forEach(v=>a.filtrosT.add(terminal(v)));
      });
    }
  }

  function calcTrios(a){
    const out=[];
    eixos.forEach(e=>{
      e.trios.forEach(trio=>{
        const hit=trio.map(terminal).some(t=>a.filtrosT.has(t));
        if(hit) out.push({e:e.nome,t:trio});
      });
    });
    a.trios = out.slice(0,9);
  }

  function processar(n){
    Object.values(analises).forEach(a=>{
      if(!a.trios.length) a.res.unshift(null);
      else a.res.unshift(a.trios.some(x=>x.t.includes(n)));
    });

    timeline.unshift(n);
    if(timeline.length>500) timeline.pop();

    Object.values(analises).forEach(a=>{
      calcFiltros(a);
      calcTrios(a);
    });
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML=`
  <div style="max-width:1100px;margin:auto;padding:10px">
    <h3 style="text-align:center">CSM — Modos & Temas Visíveis</h3>

    Histórico:
    <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>

    <div style="margin:6px 0">
      <button id="col">Colar</button>
      <button id="lim">Limpar</button>
      Janela:
      <select id="jan">${[3,4,5,6,7,8,9,10].map(n=>`<option ${n===6?'selected':''}>${n}</option>`)}</select>
    </div>

    <div id="modos" style="margin:8px 0"></div>

    <div style="margin:8px 0">
      <b>Temas (T):</b>
      <div id="btnT"></div>
    </div>

    <div>Timeline (14): <div id="tl" style="display:flex;gap:6px"></div></div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px">
      <div><b>ZERO</b><div id="z"></div></div>
      <div><b>TIERS</b><div id="t"></div></div>
      <div><b>ORPHELINS</b><div id="o"></div></div>
    </div>

    <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
  </div>`;

  // ================= MODOS =================
  const modosDiv=document.getElementById("modos");

  function addModo(nome,label){
    const b=document.createElement("button");
    b.textContent=label;
    b.onclick=()=>setModo(nome);
    b.dataset.modo=nome;
    modosDiv.appendChild(b);
  }

  addModo("MANUAL","Manual");
  [3,4,5,6,7,8,9].forEach(n=>addModo("AUTO_"+n,"Auto "+n));
  addModo("VIZINHO","Vizinho");
  addModo("NUMNUM","NumNum");

  function pintarModos(){
    document.querySelectorAll("#modos button").forEach(b=>{
      b.style.background = b.dataset.modo===modoVisivel ? "#00e676" : "#333";
    });
  }

  // ================= BOTÕES T =================
  const btnT=document.getElementById("btnT");
  for(let i=0;i<10;i++){
    const b=document.createElement("button");
    b.textContent="T"+i;
    b.dataset.t=i;
    b.onclick=()=>{
      filtrosManual.has(i)?filtrosManual.delete(i):filtrosManual.add(i);
      setModo("MANUAL");
      render();
    };
    btnT.appendChild(b);
  }

  function pintarT(){
    const ativos = analises[modoVisivel].filtrosT;
    document.querySelectorAll("#btnT button").forEach(b=>{
      const t=+b.dataset.t;
      b.style.background = ativos.has(t) ? "#00e676" : "#333";
    });
  }

  // ================= CONTROLES =================
  for(let i=0;i<=36;i++){
    const b=document.createElement("button");
    b.textContent=i;
    b.onclick=()=>{processar(i);render();};
    document.getElementById("nums").appendChild(b);
  }

  document.getElementById("jan").onchange=e=>{
    janela=+e.target.value;
    Object.values(analises).forEach(a=>{calcFiltros(a);calcTrios(a);});
    render();
  };

  document.getElementById("col").onclick=()=>{
    document.getElementById("inp").value
      .split(/[\s,]+/).map(Number).filter(n=>n>=0&&n<=36)
      .forEach(n=>processar(n));
    document.getElementById("inp").value="";
    render();
  };

  document.getElementById("lim").onclick=()=>{
    timeline=[];
    filtrosManual.clear();
    Object.values(analises).forEach(a=>{a.trios=[];a.res=[];a.filtrosT.clear();});
    render();
  };

  function setModo(m){
    modoVisivel=m;
    render();
  }

  function render(){
    pintarModos();
    pintarT();

    const a=analises[modoVisivel];

    const tl=document.getElementById("tl");
    tl.innerHTML="";
    for(let i=0;i<Math.min(14,timeline.length);i++){
      const d=document.createElement("div");
      d.textContent=timeline[i];
      d.style=`padding:4px 6px;border-radius:4px;background:${
        a.res[i]===true?"#2e7d32":a.res[i]===false?"#c62828":"#333"}`;
      tl.appendChild(d);
    }

    const p={ZERO:[],TIERS:[],ORPHELINS:[]};
    a.trios.forEach(x=>p[x.e].push(x.t.join("-")));
    document.getElementById("z").innerHTML=p.ZERO.join("<br>");
    document.getElementById("t").innerHTML=p.TIERS.join("<br>");
    document.getElementById("o").innerHTML=p.ORPHELINS.join("<br>");
  }

  render();

})();
