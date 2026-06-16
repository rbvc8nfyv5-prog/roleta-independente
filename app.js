(function () {

  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const terminal = n => n % 10;

  const corTerminal = {
    0:"#ff5252",
    1:"#ff9800",
    2:"#ffc107",
    3:"#00e676",
    4:"#00bcd4",
    5:"#2196f3",
    6:"#9c27b0",
    7:"#e91e63",
    8:"#8bc34a",
    9:"#ff00ff"
  };

  const coresNumerosFortes = [
    "#00e676",
    "#ffc107",
    "#2196f3",
    "#e91e63",
    "#ff9800"
  ];

  let timeline = [];
  let historicoCompleto = [];
  let expandido = false;
  let analiseNumeroAtiva = false;
  let numerosFortes = [];

  const analises = {
    MANUAL: { filtros:new Set(), res:[] }
  };

  const modosTerminais = {};
  const ordemSelecionados = [];

  for(let t=0; t<=9; t++){
    modosTerminais[t] = 0;
  }

  function clarearCor(hex){
    hex = hex.replace("#","");

    let r = parseInt(hex.substring(0,2),16);
    let g = parseInt(hex.substring(2,4),16);
    let b = parseInt(hex.substring(4,6),16);

    r = Math.min(255, Math.floor(r + (255-r)*0.45));
    g = Math.min(255, Math.floor(g + (255-g)*0.45));
    b = Math.min(255, Math.floor(b + (255-b)*0.45));

    return "#" + [r,g,b]
      .map(x => x.toString(16).padStart(2,"0"))
      .join("");
  }

  function atualizarModosPorOrdem(){
    for(let t=0; t<=9; t++){
      modosTerminais[t] = 0;
    }

    if(ordemSelecionados.length > 0){
      modosTerminais[ordemSelecionados[0]] = 2;
    }

    for(let i=1; i<ordemSelecionados.length; i++){
      modosTerminais[ordemSelecionados[i]] = 2;
    }
  }

  function vizinhos2(n){
    const i = track.indexOf(n);

    return [
      track[(i+35)%37],
      track[(i+36)%37],
      n,
      track[(i+1)%37],
      track[(i+2)%37]
    ];
  }

  function calcularAnaliseNumero(){

    numerosFortes = [];

    if(!analiseNumeroAtiva) return;

    const selecionados = ordemSelecionados.slice(0,2);

    if(selecionados.length !== 2) return;

    const candidatos = [];

    selecionados.forEach(t=>{

      for(let n=0;n<=36;n++){

        if(terminal(n) !== t) continue;

        const cobertura = new Set(vizinhos2(n));

        let score = 0;

        timeline.forEach(x=>{
          if(cobertura.has(x)){
            score++;
          }
        });

        candidatos.push({
          numero:n,
          score
        });
      }
    });

    numerosFortes = candidatos
      .sort((a,b)=>{
        if(b.score !== a.score){
          return b.score - a.score;
        }

        return a.numero - b.numero;
      })
      .slice(0,5)
      .map(x=>x.numero);
  }  document.body.style.background = "#111";
  document.body.style.color = "#fff";
  document.body.style.fontFamily = "sans-serif";

  document.body.innerHTML = `
    <style>
      @keyframes piscaStrong {
        0% { transform:scale(1); }
        50% { transform:scale(1.2); }
        100% { transform:scale(1); }
      }
    </style>

    <div style="padding:10px;max-width:1000px;margin:auto">

      <textarea
        id="inputHist"
        placeholder="Cole histórico aqui"
        style="
          width:100%;
          margin-bottom:10px;
          background:#222;
          color:#fff;
          border:1px solid #555;
          padding:6px
        ">
      </textarea>

      <h3 style="text-align:center">CSM</h3>

      <div style="margin:10px 0">
        🕒 Timeline:
        <span id="tl" style="font-size:18px;font-weight:600"></span>
      </div>

      <div style="
        display:flex;
        gap:8px;
        margin-bottom:10px;
        flex-wrap:wrap">

        <button id="btnUndo">Apagar último</button>

        <button id="btnClear">Apagar tudo</button>

        <button id="btnAnaliseNumero">
          Análise Número
        </button>

      </div>

      <div style="
        border:1px solid #555;
        padding:8px;
        margin-bottom:10px">

        <div style="margin-bottom:8px">
          Terminais:
        </div>

        <div id="btnT"
          style="
            display:flex;
            gap:6px;
            flex-wrap:wrap;
            margin-bottom:8px">
        </div>

        <div id="numerosFortesBox"
          style="
            display:none;
            gap:6px;
            flex-wrap:wrap">
        </div>

      </div>

      <div id="conjArea"
        style="
          display:none;
          margin-top:12px;
          overflow-x:auto">
      </div>

      <div id="nums"
        style="
          display:grid;
          grid-template-columns:repeat(9,1fr);
          gap:6px;
          margin-top:12px">
      </div>

    </div>
  `;

  inputHist.addEventListener("paste", ()=>{
    setTimeout(()=>{

      historicoCompleto = inputHist.value
        .split(/[\s,;|]+/)
        .map(Number)
        .filter(n => n >= 0 && n <= 36);

      timeline = historicoCompleto
        .slice(-14)
        .reverse();

      inputHist.style.display = "none";

      calcularAnaliseNumero();

      render();

    },0);
  });

  btnAnaliseNumero.onclick = ()=>{

    analiseNumeroAtiva = !analiseNumeroAtiva;

    if(!analiseNumeroAtiva){
      numerosFortes = [];
    }

    calcularAnaliseNumero();

    render();
  };

  for(let t=0;t<=9;t++){

    const b = document.createElement("button");

    b.textContent = "T" + t;

    b.style = `
      padding:6px;
      background:#444;
      color:#fff;
      border:1px solid #666
    `;

    b.onclick = ()=>{

      if(analises.MANUAL.filtros.has(t)){

        analises.MANUAL.filtros.delete(t);

        const idx = ordemSelecionados.indexOf(t);

        if(idx !== -1){
          ordemSelecionados.splice(idx,1);
        }

      } else {

        if(ordemSelecionados.length >= 2){

          const removido = ordemSelecionados.shift();

          analises.MANUAL.filtros.delete(removido);
        }

        analises.MANUAL.filtros.add(t);
        ordemSelecionados.push(t);
      }

      atualizarModosPorOrdem();

      calcularAnaliseNumero();

      render();
    };

    btnT.appendChild(b);
  }  for(let n=0; n<=36; n++){

    const b = document.createElement("button");

    b.textContent = n;

    b.style = `
      padding:8px;
      background:#333;
      color:#fff
    `;

    b.onclick = ()=>add(n);

    nums.appendChild(b);
  }

  btnUndo.onclick = ()=>{

    if(!timeline.length) return;

    historicoCompleto.pop();

    timeline = historicoCompleto
      .slice(-14)
      .reverse();

    calcularAnaliseNumero();

    render();
  };

  btnClear.onclick = ()=>{

    timeline = [];
    historicoCompleto = [];
    numerosFortes = [];
    expandido = false;
    analiseNumeroAtiva = false;

    ordemSelecionados.length = 0;

    analises.MANUAL.filtros.clear();

    for(let t=0; t<=9; t++){
      modosTerminais[t] = 0;
    }

    render();
  };

  function add(n){

    historicoCompleto.push(n);

    timeline = historicoCompleto
      .slice(-14)
      .reverse();

    calcularAnaliseNumero();

    render();
  }

  function renderTimelinePrincipal(){

    tl.innerHTML = timeline.map(n=>`
      <span style="
        display:inline-block;
        margin:2px;
        padding:3px 5px;
        border-radius:4px;
        background:#222;
        border:1px solid #444;
        color:#fff;
      ">${n}</span>
    `).join("");
  }

  function renderNumerosFortes(){

    if(!analiseNumeroAtiva || numerosFortes.length === 0){

      numerosFortesBox.style.display = "none";
      numerosFortesBox.innerHTML = "";

      return;
    }

    numerosFortesBox.style.display = "flex";

    numerosFortesBox.innerHTML = numerosFortes
      .map((n,i)=>`
        <div style="
          padding:4px 8px;
          border-radius:4px;
          background:${coresNumerosFortes[i]};
          color:#000;
          font-weight:800;
          font-size:13px;
        ">
          ${n}
        </div>
      `)
      .join("");
  }

  function mapaNumerosFortes(){

    const mapa = {};

    numerosFortes.forEach((n,i)=>{

      vizinhos2(n).forEach(v=>{

        if(!mapa[v]){
          mapa[v] = coresNumerosFortes[i];
        }

      });

    });

    return mapa;
  }  function render(){

    renderTimelinePrincipal();

    calcularAnaliseNumero();

    renderNumerosFortes();

    btnAnaliseNumero.style.background =
      analiseNumeroAtiva ? "#00e676" : "";

    btnAnaliseNumero.style.color =
      analiseNumeroAtiva ? "#000" : "";

    document.querySelectorAll("#btnT button")
      .forEach(b=>{

        const t = +b.textContent.match(/\d+/)[0];

        const ativo =
          analises.MANUAL.filtros.has(t);

        b.style.background =
          ativo ? corTerminal[t] : "#444";

        if(ativo){

          b.style.border =
            "3px solid #fff";

          b.style.boxShadow =
            `0 0 10px ${corTerminal[t]}`;

          b.textContent = `T${t} 2v`;

        } else {

          b.style.border =
            "1px solid #666";

          b.style.boxShadow = "none";

          b.textContent = `T${t}`;
        }

      });

    if(
      analiseNumeroAtiva &&
      numerosFortes.length > 0
    ){

      const mapaCores =
        mapaNumerosFortes();

      const base =
        expandido
          ? historicoCompleto.slice().reverse()
          : timeline;

      const ultimoNumero =
        timeline[0];

      conjArea.style.display =
        "block";

      conjArea.innerHTML = `
        <div style="
          display:grid;
          grid-template-columns:
            repeat(auto-fit,minmax(26px,1fr));
          gap:4px">

          ${base.map(n=>`
            <div style="
              height:26px;
              display:flex;
              align-items:center;
              justify-content:center;
              background:${mapaCores[n] || "#222"};
              color:${mapaCores[n] ? "#000" : "#fff"};
              font-size:10px;
              font-weight:
                ${mapaCores[n] ? "800" : "400"};
              border-radius:4px;
              border:
                ${n===ultimoNumero
                  ? `3px solid ${mapaCores[n] || "#fff"}`
                  : "1px solid #333"};
              box-shadow:
                ${n===ultimoNumero
                  ? `0 0 10px ${mapaCores[n] || "#fff"}`
                  : "none"};
              animation:
                ${n===ultimoNumero
                  ? "piscaStrong 0.8s infinite"
                  : "none"};
            ">
              ${n}
            </div>
          `).join("")}

        </div>
      `;

    } else {

      conjArea.style.display =
        "none";

      conjArea.innerHTML = "";
    }

  }

  conjArea.onclick = ()=>{

    expandido = !expandido;

    render();
  };

  render();

})();
