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

  function corDuzia(n){
    if(n >= 1 && n <= 12) return "#00e676";
    if(n >= 13 && n <= 24) return "#ffc107";
    if(n >= 25 && n <= 36) return "#ff5252";
    return "#ffffff";
  }

  let timeline = [];
  let historicoCompleto = [];
  let expandido = false;
  let analise100Ativa = false;

  let crupierAtivo = false;
  let crupierNome = "";
  let crupierNumeros = [];
  let historicoCrupiers = [];

  const analises = {
    MANUAL: { filtros:new Set(), res:[] }
  };

  const modosTerminais = {};
  const ordemSelecionados = [];
  for (let t = 0; t <= 9; t++) modosTerminais[t] = 0;

  function clarearCor(hex){
    hex = hex.replace("#","");
    let r = parseInt(hex.substring(0,2),16);
    let g = parseInt(hex.substring(2,4),16);
    let b = parseInt(hex.substring(4,6),16);

    r = Math.min(255, Math.floor(r + (255-r)*0.45));
    g = Math.min(255, Math.floor(g + (255-g)*0.45));
    b = Math.min(255, Math.floor(b + (255-b)*0.45));

    return "#" + [r,g,b].map(x=>x.toString(16).padStart(2,"0")).join("");
  }

  function atualizarModosPorOrdem(){
    for(let t=0;t<=9;t++) modosTerminais[t] = 0;
    if(ordemSelecionados.length > 0){
      modosTerminais[ordemSelecionados[0]] = 2;
    }
    for(let i=1;i<ordemSelecionados.length;i++){
      modosTerminais[ordemSelecionados[i]] = 1;
    }
  }

  function vizinhos1(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
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

  function segundoVizinho(n){
    const i = track.indexOf(n);
    return [
      track[(i+35)%37],
      track[(i+2)%37]
    ];
  }

  function coberturaTerminal(t, qtd){
    const set = new Set();

    track.forEach(n=>{
      if(terminal(n) === t){
        if(qtd === 2){
          vizinhos2(n).forEach(v=>set.add(v));
        } else {
          vizinhos1(n).forEach(v=>set.add(v));
        }
      }
    });

    return set;
  }

  function melhorAnalise100(base){
    if(base.length < 3) return null;

    let melhor = null;

    for(let t2=0;t2<=9;t2++){
      for(let t1=0;t1<=9;t1++){

        if(t1 === t2) continue;

        const cov2 = coberturaTerminal(t2,2);
        const cov1 = coberturaTerminal(t1,1);

        const cobertura = new Set([...cov2, ...cov1]);

        let green = 0;
        let red = 0;

        const lista = base.slice(-100);

        for(let i=0;i<lista.length-1;i++){
          const prox = lista[i+1];

          if(cobertura.has(prox)){
            green++;
          } else {
            red++;
          }
        }

        const total = green + red;
        const taxa = total ? green / total : 0;

        const teste = {
          t2,
          t1,
          green,
          red,
          taxa
        };

        if(
          !melhor ||
          teste.red < melhor.red ||
          (teste.red === melhor.red && teste.green > melhor.green) ||
          (teste.red === melhor.red && teste.green === melhor.green && teste.taxa > melhor.taxa)
        ){
          melhor = teste;
        }
      }
    }

    return melhor;
  }

  function aplicarAnalise100(){
    const melhor = melhorAnalise100(historicoCompleto);

    if(!melhor) return;

    analises.MANUAL.filtros.clear();
    ordemSelecionados.length = 0;

    analises.MANUAL.filtros.add(melhor.t2);
    ordemSelecionados.push(melhor.t2);

    analises.MANUAL.filtros.add(melhor.t1);
    ordemSelecionados.push(melhor.t1);

    atualizarModosPorOrdem();
  }

  function salvarCrupierAtual(){
    if(!crupierAtivo) return;

    const melhor = melhorAnalise100(crupierNumeros);

    historicoCrupiers.push({
      nome: crupierNome,
      total: crupierNumeros.length,
      numeros: crupierNumeros.slice(),
      melhor
    });

    crupierAtivo = false;
    crupierNome = "";
    crupierNumeros = [];
  }

  function resumoUltimoCrupier(nome){
    const sessoes = historicoCrupiers.filter(c => c.nome.toLowerCase() === nome.toLowerCase());
    if(!sessoes.length) return "";

    const c = sessoes[sessoes.length - 1];

    if(!c.melhor){
      return `${nome}\nÚltima sessão: sem dados suficientes\nGiros: ${c.total}`;
    }

    return `${nome}
Última sessão:
T${c.melhor.t2} 2v / T${c.melhor.t1} 1v
Green: ${c.melhor.green}
Red: ${c.melhor.red}
Taxa: ${(c.melhor.taxa*100).toFixed(1)}%
Giros: ${c.total}`;
  }

  function iniciarNovoCrupier(){
    const nome = prompt("Nome do crupiê:");
    if(!nome) return;

    const resumo = resumoUltimoCrupier(nome);
    if(resumo){
      const ok = confirm(resumo + "\n\nIniciar nova sessão para esse crupiê?");
      if(!ok) return;
    }

    crupierAtivo = true;
    crupierNome = nome;
    crupierNumeros = [];
  }

  function renderCrupierBox(){
    if(!historicoCrupiers.length && !crupierAtivo){
      return "";
    }

    let html = "";

    if(crupierAtivo){
      html += `
        <div style="
          margin-top:8px;
          padding:6px;
          border:1px solid #00e676;
          background:#102015;
          color:#fff;
          font-size:12px;
          border-radius:4px;
        ">
          Crupiê ativo: <b style="color:#00e676">${crupierNome}</b>
          | Giros: <b>${crupierNumeros.length}</b>
        </div>
      `;
    }

    historicoCrupiers.slice().reverse().forEach((c,i)=>{
      html += `
        <div style="
          margin-top:6px;
          padding:6px;
          border:1px solid #555;
          background:#222;
          color:#fff;
          font-size:12px;
          border-radius:4px;
        ">
          <b>${c.nome}</b> — Sessão ${historicoCrupiers.length - i}
          ${c.melhor 
            ? `<br><span style="color:${corTerminal[c.melhor.t2]}">T${c.melhor.t2} 2v</span> /
               <span style="color:${corTerminal[c.melhor.t1]}">T${c.melhor.t1} 1v</span>
               | Green: ${c.melhor.green}
               | Red: ${c.melhor.red}
               | Taxa: ${(c.melhor.taxa*100).toFixed(1)}%`
            : `<br>Sem dados suficientes`}
          | Giros: ${c.total}
        </div>
      `;
    });

    return html;
  }

  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <style>
      @keyframes piscaStrong {
        0% { transform:scale(1); }
        50% { transform:scale(1.2); }
        100% { transform:scale(1); }
      }
    </style>

    <div style="padding:10px;max-width:1000px;margin:auto">

      <textarea id="inputHist" placeholder="Cole histórico aqui"
      style="width:100%;margin-bottom:10px;background:#222;color:#fff;border:1px solid #555;padding:6px"></textarea>

      <h3 style="text-align:center">CSM</h3>

      <div style="display:flex;justify-content:center;margin-bottom:10px">
        <canvas id="radar" width="260" height="260"></canvas>
      </div>

      <div style="margin:10px 0">
        🕒 Timeline:
        <span id="tl" style="font-size:18px;font-weight:600"></span>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">
        <button id="btnUndo">Apagar último</button>
        <button id="btnClear">Apagar tudo</button>
        <button id="btnAnalise100">Análise 100</button>
        <button id="btnCrupier">Análise Crupiê</button>
      </div>

      <div id="crupierBox"></div>

      <div style="border:1px solid #555;padding:8px;margin-bottom:10px;margin-top:10px">
        Terminais:
        <div id="btnT" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
      </div>

      <div id="conjArea" style="display:none;margin-top:12px;overflow-x:auto"></div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>
    </div>
  `;

  inputHist.addEventListener("paste", ()=>{
    setTimeout(()=>{
      historicoCompleto = inputHist.value
        .split(/[\s,;|]+/)
        .map(Number)
        .filter(n=>n>=0 && n<=36);

      timeline = historicoCompleto.slice(-14).reverse();
      inputHist.style.display="none";

      if(analise100Ativa) aplicarAnalise100();

      render();
    },0);
  });

  btnAnalise100.onclick = ()=>{
    analise100Ativa = !analise100Ativa;

    if(analise100Ativa){
      aplicarAnalise100();
    }

    render();
  };

  btnCrupier.onclick = ()=>{
    if(crupierAtivo){
      salvarCrupierAtual();
      iniciarNovoCrupier();
    } else {
      iniciarNovoCrupier();
    }

    render();
  };

  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.textContent="T"+t;
    b.style="padding:6px;background:#444;color:#fff;border:1px solid #666";
    b.onclick=()=>{
      analise100Ativa = false;

      if(analises.MANUAL.filtros.has(t)){
        analises.MANUAL.filtros.delete(t);
        const idx = ordemSelecionados.indexOf(t);
        if(idx !== -1) ordemSelecionados.splice(idx,1);
      } else {
        analises.MANUAL.filtros.add(t);
        ordemSelecionados.push(t);
      }
     
