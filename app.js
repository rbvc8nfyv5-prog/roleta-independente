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
    { nome:"ZERO", trios:[[0,32,15],[19,4,21],[2,25,17],[34,6,27]] },
    { nome:"TIERS", trios:[[13,36,11],[30,8,23],[10,5,24],[16,33,1]] },
    { nome:"ORPHELINS", trios:[[20,14,31],[9,22,18],[7,29,28],[12,35,3]] }
  ];

  // ================= ESTADO =================
  let timeline = [];
  let janela = 6;
  let modoAtivo = "MANUAL";
  let autoTAtivo = null;

  const analises = {
    MANUAL: { filtros:new Set(), res:[] },
    VIZINHO:{ filtros:new Set(), res:[], motor:new Set() },
    NUNUM:  { filtros:new Set(), res:[] },
    AUTO: {
      3:{ filtros:new Set(), res:[] },
      4:{ filtros:new Set(), res:[] },
      5:{ filtros:new Set(), res:[] },
      6:{ filtros:new Set(), res:[] },
      7:{ filtros:new Set(), res:[] }
    }
  };

  let modoConjuntos = false;
  let filtrosConjuntos = new Set();

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
  }

  function pertenceGrupoVizinho(n, grupo){
    return vizinhosRace(n).some(v => grupo.includes(terminal(v)));
  }

  // ================= MELHOR TRIO INTERNO =================
  function melhorTrioGrupo(grupo){

    const trios = [];
    for(let i=0;i<grupo.length;i++){
      for(let j=i+1;j<grupo.length;j++){
        for(let k=j+1;k<grupo.length;k++){
          trios.push([grupo[i],grupo[j],grupo[k]]);
        }
      }
    }

    const cont = {};
    trios.forEach(trio=>{
      const chave = trio.join("-");
      cont[chave]=0;
      timeline.forEach(n=>{
        if(vizinhosRace(n).some(v=> trio.includes(terminal(v)))){
          cont[chave]++;
        }
      });
    });

    const ordenado = Object.entries(cont)
      .sort((a,b)=>b[1]-a[1]);

    return ordenado.length ? ordenado[0][0] : null;
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:1100px;margin:auto">
      <h3 style="text-align:center">CSM</h3>

      <div style="border:1px solid #444;padding:8px">
        Histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
        <div style="margin-top:6px;display:flex;gap:10px;flex-wrap:wrap">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
          Janela:
          <select id="jan">
            ${Array.from({length:8},(_,i)=>`<option ${i+3===6?'selected':''}>${i+3}</option>`).join("")}
          </select>
        </div>
      </div>

      <div style="margin:10px 0">
        🕒 Timeline (14):
        <span id="tl" style="font-size:18px;font-weight:600"></span>
      </div>

      <!-- ===== ZONAS HORIZONTAIS ===== -->
      <div id="zonaStats" style="margin-bottom:10px"></div>

      <!-- ===== ASSISTENTE VIRTUAL ===== -->
      <div id="assistenteBox"
           style="border:1px solid #00e676;
                  padding:10px;
                  margin-bottom:10px;
                  cursor:pointer;">
      </div>

      <!-- ===== QUADROS DOS GRUPOS ===== -->
      <div id="box1479" style="border:1px solid #555;padding:6px;margin-bottom:6px;cursor:pointer">
        <b>1479</b>
        <div id="tl1479"></div>
      </div>

      <div id="box2589" style="border:1px solid #555;padding:6px;margin-bottom:6px;cursor:pointer">
        <b>2589</b>
        <div id="tl2589"></div>
      </div>

      <div id="box0369" style="border:1px solid #555;padding:6px;margin-bottom:10px;cursor:pointer">
        <b>0369</b>
        <div id="tl0369"></div>
      </div>      <div style="display:flex;gap:6px;margin-bottom:6px">
        ${["MANUAL","VIZINHO","NUNUM"].map(m=>`
          <button class="modo" data-m="${m}"
            style="padding:6px;background:#444;color:#fff;border:1px solid #666">${m}</button>`).join("")}
        <button id="btnConj" style="padding:6px;background:#444;color:#fff;border:1px solid #666">
          CONJUNTOS
        </button>
      </div>

      <div style="display:flex;gap:6px;margin-bottom:10px">
        ${[3,4,5,6,7].map(n=>`
          <button class="auto" data-a="${n}"
            style="padding:6px;background:#444;color:#fff;border:1px solid #666">A${n}</button>`).join("")}
      </div>

      <div style="border:1px solid #555;padding:8px;margin-bottom:10px">
        Terminais:
        <div id="btnT" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div><b>ZERO</b><div id="cZERO"></div></div>
        <div><b>TIERS</b><div id="cTIERS"></div></div>
        <div><b>ORPHELINS</b><div id="cORPH"></div></div>
      </div>

      <div id="conjArea" style="display:none;margin-top:12px;overflow-x:auto"></div>
      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>
    </div>
  `;

  // ================= MODELO PROBABILÍSTICO ADAPTATIVO =================
  function analiseAdaptativa(){

    if(timeline.length < 6){
      return { texto:"Aguardando mais dados...", trio:null };
    }

    const pesos = timeline.map((n,i)=>({
      n,
      peso:(timeline.length - i)
    }));

    // ===== Probabilidade por trio interno =====
    const gruposTrios = [
      [1,4,7,9],
      [2,5,8,9],
      [0,3,6,9]
    ];

    const scoreTrios = [];

    gruposTrios.forEach(grupo=>{
      const trio = melhorTrioGrupo(grupo);
      if(!trio) return;

      let score = 0;

      pesos.forEach(obj=>{
        if(vizinhosRace(obj.n).some(v=> trio.split("-").includes(String(terminal(v))))){
          score += obj.peso;
        }
      });

      scoreTrios.push({ trio, score });
    });

    scoreTrios.sort((a,b)=>b.score-a.score);

    const trioDominante = scoreTrios.length ? scoreTrios[0].trio : null;

    // ===== Reconhecimento de padrão repetitivo =====
    const ultimos5 = timeline.slice(0,5);
    const repeticao = new Set(ultimos5.map(n=>terminal(n))).size <=2;

    // ===== Lateralização =====
    const mediaPos = timeline
      .map(n=>track.indexOf(n))
      .reduce((a,b)=>a+b,0)/timeline.length;

    const lado = mediaPos > 18 ? "Direita" : "Esquerda";

    // ===== Concentração setorial =====
    const setores = timeline.slice(0,6)
      .map(n=>Math.floor(track.indexOf(n)/9));

    const concentrado = new Set(setores).size <=2;

    // ===== Virada =====
    const dispersao = new Set(timeline.slice(0,3).map(n=>terminal(n))).size;
    const virada = dispersao >=3;

    return {
      trio:trioDominante,
      texto:`
        Trio dominante (peso adaptativo): <b>${trioDominante || "-"}</b><br>
        Padrão repetitivo: <b>${repeticao?"Sim":"Não"}</b><br>
        Lado predominante: <b>${lado}</b><br>
        Concentração setorial: <b>${concentrado?"Sim":"Não"}</b><br>
        Leitura de mesa: <b>${virada?"Possível virada":"Estável"}</b><br>
        <span style="color:#00e676">Clique para aplicar jogada</span>
      `
    };
  }

  // ================= EVENTOS =================
  jan.onchange=e=>{ janela=+e.target.value; render(); };

  document.querySelectorAll(".modo").forEach(b=>{
    b.onclick=()=>{
      modoAtivo=b.dataset.m;
      render();
    };
  });

  document.querySelectorAll(".auto").forEach(b=>{
    b.onclick=()=>{
      modoAtivo="AUTO";
      autoTAtivo=+b.dataset.a;
      calcularAutoT(autoTAtivo);
      render();
    };
  });

  btnConj.onclick=()=>{
    modoConjuntos=!modoConjuntos;
    btnConj.style.background = modoConjuntos?"#00e676":"#444";
    modoAtivo="MANUAL";
    render();
  };

  // ================= BOTÕES T =================
  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.textContent="T"+t;
    b.style="padding:6px;background:#444;color:#fff;border:1px solid #666";
    b.onclick=()=>{
      analises.MANUAL.filtros.has(t)
        ? analises.MANUAL.filtros.delete(t)
        : analises.MANUAL.filtros.add(t);

      filtrosConjuntos.has(t)
        ? filtrosConjuntos.delete(t)
        : filtrosConjuntos.add(t);

      render();
    };
    btnT.appendChild(b);
  }

  for(let n=0;n<=36;n++){
    const b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>add(n);
    nums.appendChild(b);
  }

  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    registrar(n);
    calcularVizinho();
    calcularNunum();
    [3,4,5,6,7].forEach(calcularAutoT);
    render();
  }

  col.onclick=()=>{
    inp.value.split(/[\s,]+/)
      .map(Number).filter(n=>n>=0&&n<=36).forEach(add);
    inp.value="";
  };

  lim.onclick=()=>{
    timeline=[];
    filtrosConjuntos.clear();
    Object.values(analises).forEach(a=>{
      if(a.res) a.res=[];
      if(a.filtros) a.filtros.clear();
      if(a.motor) a.motor.clear();
    });
    modoAtivo="MANUAL";
    autoTAtivo=null;
    modoConjuntos=false;
    btnConj.style.background="#444";
    render();
  };

  function render(){

    const res =
      modoAtivo==="AUTO"
        ? analises.AUTO[autoTAtivo]?.res || []
        : analises[modoAtivo].res;

    tl.innerHTML = timeline.map((n,i)=>{
      const r=res[i];
      const c=r==="V"?"#00e676":r==="X"?"#ff5252":"#aaa";
      return `<span style="color:${c}">${n}</span>`;
    }).join(" · ");

    // ===== ZONAS HORIZONTAIS =====
    const zonas = {
      TIERS:[27,13,36,11,30,8,23,10,5,24,16,33],
      VOISINS:[25,2,21,4,19,22,18,29,7,28],
      ZERO:[15,32,0,26,3,35,12],
      ORPHELINS:[6,34,17,1,20,14,31,9]
    };

    const total = timeline.length || 1;

    zonaStats.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
        ${Object.entries(zonas).map(([nome,nums])=>{
          const qtd = timeline.filter(n=>nums.includes(n)).length;
          const perc = ((qtd/total)*100).toFixed(1);
          return `
            <div style="background:#222;padding:6px;text-align:center;border:1px solid #444">
              <div style="font-size:12px">${nome}</div>
              <div style="color:#00e676;font-weight:700">${qtd}</div>
              <div style="font-size:11px">${perc}%</div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    // ===== ASSISTENTE =====
    const analise = analiseAdaptativa();
    assistenteBox.innerHTML = `
      <b>Assistente Virtual 🎯</b><br><br>
      ${analise.texto}
    `;

    assistenteBox.onclick = ()=>{
      if(!analise.trio) return;
      analises.MANUAL.filtros.clear();
      analise.trio.split("-").forEach(n=>{
        analises.MANUAL.filtros.add(terminal(+n));
      });
      modoAtivo="MANUAL";
      render();
    };

  }

  render();

})();
