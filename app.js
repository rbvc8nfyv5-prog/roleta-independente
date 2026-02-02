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

  // ================= ESTADO GLOBAL =================
  let timeline = [];
  const MAX_HIST = 500;

  let janela = 6;
  let modoVisivel = "MANUAL"; // o que está sendo exibido

  // ================= ANALISES PARALELAS =================
  const analises = {};

  function criarAnalise(nome, tipo, param){
    analises[nome] = {
      tipo,
      param,
      filtrosT: new Set(),
      triosArmados: [],
      resultados: []
    };
  }

  // manual
  criarAnalise("MANUAL","MANUAL");

  // autos
  [3,4,5,6,7,8,9].forEach(n=>{
    criarAnalise("AUTO_"+n,"AUTO",n);
  });

  // vizinho e num-num
  criarAnalise("VIZINHO","VIZINHO");
  criarAnalise("NUMNUM","NUMNUM");

  // ================= FILTROS POR TIPO =================
  function calcularFiltros(analise){
    const { tipo, param } = analise;

    if(tipo==="MANUAL") return;

    if(tipo==="AUTO"){
      const set = new Set();
      for(const n of timeline){
        set.add(terminal(n));
        if(set.size>=param) break;
      }
      analise.filtrosT = set;
    }

    if(tipo==="VIZINHO"){
      const cont = {};
      timeline.slice(0,janela).forEach(n=>{
        vizinhos(n).forEach(v=>{
          const t=terminal(v);
          cont[t]=(cont[t]||0)+1;
        });
      });
      analise.filtrosT = new Set(
        Object.entries(cont).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>+x[0])
      );
    }

    if(tipo==="NUMNUM"){
      const set = new Set();
      timeline.slice(0,2).forEach(n=>{
        set.add(terminal(n));
        vizinhos(n).forEach(v=>set.add(terminal(v)));
      });
      analise.filtrosT = set;
    }
  }

  function calcularTrios(analise){
    let out=[];
    eixos.forEach(e=>{
      e.trios.forEach(trio=>{
        const hits = trio.map(terminal)
          .filter(t=>!analise.filtrosT.size||analise.filtrosT.has(t)).length;
        if(hits>0) out.push({ eixo:e.nome, trio });
      });
    });
    analise.triosArmados = out.slice(0,9);
  }

  // ================= MOTOR PARALELO =================
  function processarNumero(n){
    // valida para TODAS as análises
    Object.values(analises).forEach(a=>{
      if(!a.triosArmados.length){
        a.resultados.unshift(null);
      }else{
        a.resultados.unshift(a.triosArmados.some(t=>t.trio.includes(n)));
      }
      if(a.resultados.length>MAX_HIST) a.resultados.pop();
    });

    // adiciona número
    timeline.unshift(n);
    if(timeline.length>MAX_HIST) timeline.pop();

    // recalcula tudo para todas
    Object.values(analises).forEach(a=>{
      calcularFiltros(a);
      calcularTrios(a);
    });
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML=`
    <div style="padding:10px;max-width:1000px;margin:auto">
      <h3 style="text-align:center">CSM — Análises Paralelas</h3>

      <div style="border:1px solid #444;padding:8px">
        Histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
        <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
          Janela:
          <select id="jan">${[3,4,5,6,7,8,9,10].map(n=>`<option ${n===6?'selected':''}>${n}</option>`)}</select>
        </div>
      </div>

      <div style="margin:8px 0">
        <b>Modo visível:</b>
        <select id="modo"></select>
      </div>

      <div style="margin:8px 0">
        Linha do tempo:
        <div id="tl" style="display:flex;gap:6px;flex-wrap:wrap"></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div><b>ZERO</b><div id="colZERO"></div></div>
        <div><b>TIERS</b><div id="colTIERS"></div></div>
        <div><b>ORPHELINS</b><div id="colORPH"></div></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  // seletor de modos
  const sel=document.getElementById("modo");
  Object.keys(analises).forEach(k=>{
    const o=document.createElement("option");
    o.value=k; o.textContent=k;
    sel.appendChild(o);
  });
  sel.onchange=e=>{
    modoVisivel=e.target.value;
    render();
  };

  document.getElementById("jan").onchange=e=>{
    janela=+e.target.value;
    Object.values(analises).forEach(a=>{
      calcularFiltros(a);
      calcularTrios(a);
    });
    render();
  };

  for(let n=0;n<=36;n++){
    const b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>{ processarNumero(n); render(); };
    document.getElementById("nums").appendChild(b);
  }

  document.getElementById("col").onclick=()=>{
    document.getElementById("inp").value
      .split(/[\s,]+/).map(Number).filter(n=>n>=0&&n<=36)
      .forEach(n=>processarNumero(n));
    document.getElementById("inp").value="";
    render();
  };

  document.getElementById("lim").onclick=()=>{
    timeline=[];
    Object.values(analises).forEach(a=>{
      a.triosArmados=[];
      a.resultados=[];
      a.filtrosT.clear();
    });
    render();
  };

  function render(){
    const a = analises[modoVisivel];

    const tl=document.getElementById("tl");
    tl.innerHTML="";
    for(let i=0;i<Math.min(14,timeline.length);i++){
      const d=document.createElement("div");
      d.textContent=timeline[i];
      const r=a.resultados[i];
      d.style=`padding:4px 6px;border-radius:4px;
        background:${r===true?"#2e7d32":r===false?"#c62828":"#333"}`;
      tl.appendChild(d);
    }

    const por={ZERO:[],TIERS:[],ORPHELINS:[]};
    a.triosArmados.forEach(t=>por[t.eixo].push(t.trio.join("-")));
    document.getElementById("colZERO").innerHTML=por.ZERO.join("<br>");
    document.getElementById("colTIERS").innerHTML=por.TIERS.join("<br>");
    document.getElementById("colORPH").innerHTML=por.ORPHELINS.join("<br>");
  }

  render();

})();
