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

  let timeline = [];
  let historicoCompleto = [];
  let expandido = false;
  let analise100Ativa = false;

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

  function vizinhos9(n){
    const i = track.indexOf(n);
    const arr = [];
    for(let d=-9; d<=9; d++){
      arr.push(track[(i+d+37)%37]);
    }
    return arr;
  }

  const lado0 = new Set(vizinhos9(0));
  const lado10 = new Set(vizinhos9(10));

  function sequenciaAtual(setor){
    let seq = 0;
    for(let i=historicoCompleto.length-1;i>=0;i--){
      if(setor.has(historicoCompleto[i])) seq++;
      else break;
    }
    return seq;
  }

  function sequenciaMaxima(setor){
    let atual = 0;
    let max = 0;

    historicoCompleto.forEach(n=>{
      if(setor.has(n)){
        atual++;
        if(atual > max) max = atual;
      } else {
        atual = 0;
      }
    });

    return max;
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

  function aplicarAnalise100(){
    if(historicoCompleto.length < 3) return;

    let melhor = null;

    for(let t2=0;t2<=9;t2++){
      for(let t1=0;t1<=9;t1++){

        if(t1 === t2) continue;

        const cov2 = coberturaTerminal(t2,2);
        const cov1 = coberturaTerminal(t1,1);

        const cobertura = new Set([...cov2, ...cov1]);

        let green = 0;
        let red = 0;

        const base = historicoCompleto.slice(-100);

        for(let i=0;i<base.length-1;i++){
          const prox = base[i+1];

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

    if(!melhor) return;

    analises.MANUAL.filtros.clear();
    ordemSelecionados.length = 0;

    analises.MANUAL.filtros.add(melhor.t2);
    ordemSelecionados.push(melhor.t2);

    analises.MANUAL.filtros.add(melhor.t1);
    ordemSelecionados.push(melhor.t1);

    atualizarModosPorOrdem();
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

      @keyframes piscaQuadro {
        0% { box-shadow:0 0 4px #fff; transform:scale(1); }
        50% { box-shadow:0 0 22px #00e676; transform:scale(1.04); }
        100% { box-shadow:0 0 4px #fff; transform:scale(1); }
      }
    </style>

    <div style="padding:10px;max-width:1000px;margin:auto">

      <textarea id="inputHist" placeholder="Cole histórico aqui"
      style="width:100%;margin-bottom:10px;background:#222;color:#fff;border:1px solid #555;padding:6px"></textarea>

      <h3 style="text-align:center">CSM</h3>

      <div id="ladoBox" style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0"></div>

      <div style="margin:10px 0">
        🕒 Timeline:
        <span id="tl" style="font-size:18px;font-weight:600"></span>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">
        <button id="btnUndo">Apagar último</button>
        <button id="btnClear">Apagar tudo</button>
        <button id="btnAnalise100">Análise 100</button>
      </div>

      <div style="border:1px solid #555;padding:8px;margin-bottom:10px">
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
      atualizarModosPorOrdem();
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

  btnUndo.onclick = ()=>{
    if(!timeline.length) return;
    timeline.shift();
    historicoCompleto.pop();

    if(analise100Ativa) aplicarAnalise100();

    render();
  };

  btnClear.onclick = ()=>{
    timeline = [];
    historicoCompleto = [];
    ordemSelecionados.length = 0;
    analises.MANUAL.filtros.clear();
    analise100Ativa = false;
    render();
  };

  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();

    historicoCompleto.push(n);

    if(analise100Ativa) aplicarAnalise100();

    render();
  }

  function renderLados(){
    const atual0 = sequenciaAtual(lado0);
    const max0 = sequenciaMaxima(lado0);

    const atual10 = sequenciaAtual(lado10);
    const max10 = sequenciaMaxima(lado10);

    const pisca0 = atual0 > 0 && atual0 === max0 && max0 > 0;
    const pisca10 = atual10 > 0 && atual10 === max10 && max10 > 0;

    ladoBox.innerHTML = `
      <div style="
        border:2px solid ${pisca10 ? "#00e676" : "#555"};
        border-radius:6px;
        padding:8px;
        background:#181818;
        animation:${pisca10 ? "piscaQuadro 0.8s infinite" : "none"};
      ">
        <div style="font-weight:700;text-align:center;color:#ffc107;margin-bottom:5px">LADO 10</div>
        <div style="font-size:11px;text-align:center;margin-bottom:5px">
          ${vizinhos9(10).join(" · ")}
        </div>
        <div style="display:flex;justify-content:space-around;font-size:13px">
          <span>Atual: <b style="color:#00e676">${atual10}</b></span>
          <span>Máxima: <b style="color:#ff5252">${max10}</b></span>
        </div>
      </div>

      <div style="
        border:2px solid ${pisca0 ? "#00e676" : "#555"};
        border-radius:6px;
        padding:8px;
        background:#181818;
        animation:${pisca0 ? "piscaQuadro 0.8s infinite" : "none"};
      ">
        <div style="font-weight:700;text-align:center;color:#00bcd4;margin-bottom:5px">LADO 0</div>
        <div style="font-size:11px;text-align:center;margin-bottom:5px">
          ${vizinhos9(0).join(" · ")}
        </div>
        <div style="display:flex;justify-content:space-around;font-size:13px">
          <span>Atual: <b style="color:#00e676">${atual0}</b></span>
          <span>Máxima: <b style="color:#ff5252">${max0}</b></span>
        </div>
      </div>
    `;
  }

  function render(){

    tl.innerHTML = timeline.join(" · ");

    renderLados();

    btnAnalise100.style.background = analise100Ativa ? "#00e676" : "";
    btnAnalise100.style.color = analise100Ativa ? "#000" : "";

    document.querySelectorAll("#btnT button").forEach(b=>{
      const t=+b.textContent.match(/\d+/)[0];
      const ativo = analises.MANUAL.filtros.has(t);

      b.style.background = ativo ? corTerminal[t] : "#444";

      if(modosTerminais[t] === 2){
        b.style.border = "3px solid #fff";
        b.style.boxShadow = `0 0 10px ${corTerminal[t]}`;
        b.textContent = `T${t} 2v`;
      }
      else if(modosTerminais[t] === 1){
        b.style.border = "2px solid #999";
        b.style.boxShadow = "none";
        b.textContent = `T${t} 1v`;
      }
      else{
        b.style.border = "1px solid #666";
        b.style.boxShadow = "none";
        b.textContent = `T${t}`;
      }
    });

    if(analises.MANUAL.filtros.size > 0){

      const mapaCores = {};
      const base = expandido ? historicoCompleto.slice().reverse() : timeline;
      const ultimoNumero = timeline[0];

      analises.MANUAL.filtros.forEach(t=>{
        track.forEach(n=>{
          if(terminal(n)===t){

            if(modosTerminais[t] === 2){
              vizinhos2(n).forEach(v=>mapaCores[v] = corTerminal[t]);

              segundoVizinho(n).forEach(v=>{
                mapaCores[v] = clarearCor(corTerminal[t]);
              });

            } else if(modosTerminais[t] === 1){
              vizinhos1(n).forEach(v=>{
                if(!mapaCores[v]) mapaCores[v] = corTerminal[t];
              });
            }

          }
        });
      });

      conjArea.style.display = "block";

      conjArea.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(26px,1fr));gap:4px">
          ${base.map(n=>`
            <div style="
              height:26px;
              display:flex;
              align-items:center;
              justify-content:center;
              background:${mapaCores[n] || "#222"};
              color:#fff;
              font-size:10px;
              border-radius:4px;
              border:${n===ultimoNumero ? `3px solid ${mapaCores[n] || '#fff'}` : '1px solid #333'};
              box-shadow:${n===ultimoNumero ? `0 0 10px ${mapaCores[n] || '#fff'}` : 'none'};
              animation:${n===ultimoNumero ? 'piscaStrong 0.8s infinite' : 'none'};
            ">${n}</div>
          `).join("")}
        </div>
      `;
    } else {
      conjArea.style.display = "none";
    }
  }

  conjArea.onclick = ()=>{
    expandido = !expandido;
    render();
  };

  render();

})();
