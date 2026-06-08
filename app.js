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
  let resultadosTimeline = [];
  let expandido = false;
  let analise100Ativa = false;
  let analiseTerminalAtiva = false;
  let resultadoAnaliseTerminal = null;
  let resultadoAnalise100 = null;

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

  function contarTerminalNaLista(t, lista){
    let qtd = 0;
    lista.forEach(n=>{
      if(terminal(n) === t) qtd++;
    });
    return qtd;
  }

  function contarCoberturaNaLista(t, lista, qtdVizinho){
    const cobertura = coberturaTerminal(t, qtdVizinho);
    let qtd = 0;
    lista.forEach(n=>{
      if(cobertura.has(n)) qtd++;
    });
    return qtd;
  }

  function distanciaTerminal(a,b){
    const d = Math.abs(a-b);
    return Math.min(d, 10-d);
  }

  function coberturaDupla(t2,t1){
    const cov2 = coberturaTerminal(t2,2);
    const cov1 = coberturaTerminal(t1,1);
    return new Set([...cov2, ...cov1]);
  }

  function contarIntersecao(a,b){
    let qtd = 0;
    a.forEach(v=>{
      if(b.has(v)) qtd++;
    });
    return qtd;
  }

  function proximidadeZonaMae(t2,t1,zona){
    if(!zona) return { perto:true, score:0, intersecao:0, distMin:0 };

    const zonaCobertura = coberturaDupla(zona.t2,zona.t1);
    const testeCobertura = coberturaDupla(t2,t1);

    const intersecao = contarIntersecao(zonaCobertura, testeCobertura);

    const distMin = Math.min(
      distanciaTerminal(t2,zona.t2),
      distanciaTerminal(t2,zona.t1),
      distanciaTerminal(t1,zona.t2),
      distanciaTerminal(t1,zona.t1)
    );

    const perto =
      t2 === zona.t2 ||
      t2 === zona.t1 ||
      t1 === zona.t2 ||
      t1 === zona.t1 ||
      distMin <= 1 ||
      intersecao >= 8;

    const score =
      (intersecao * 2) +
      (distMin === 0 ? 30 : 0) +
      (distMin === 1 ? 18 : 0) +
      (distMin === 2 ? 6 : 0);

    return { perto, score, intersecao, distMin };
  }

  function validarNumeroNaJogada(n, r){
    if(!r) return null;

    const cobertura = coberturaDupla(r.t2,r.t1);

    if(cobertura.has(n)){
      return {
        tipo:"GREEN",
        cor:"#00e676",
        detalhe:`Green | T${r.t2} 2v + T${r.t1} 1v`
      };
    }

    return {
      tipo:"LOSS",
      cor:"#ff5252",
      detalhe:`Loss | T${r.t2} 2v + T${r.t1} 1v`
    };
  }

  function calcularAnalise100(){
    if(historicoCompleto.length < 3) return null;

    let melhor = null;

    for(let t2=0;t2<=9;t2++){
      for(let t1=0;t1<=9;t1++){

        if(t1 === t2) continue;

        const cobertura = coberturaDupla(t2,t1);

        let green = 0;
        let red = 0;

        const base = historicoCompleto.slice(-100);

        for(let i=0;i<base.length-1;i++){
          const prox = base[i+1];
          if(cobertura.has(prox)) green++;
          else red++;
        }

        const total = green + red;
        const taxa = total ? green / total : 0;

        const teste = { t2, t1, green, red, taxa };

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
    resultadoAnalise100 = calcularAnalise100();
    if(!resultadoAnalise100) return;

    analises.MANUAL.filtros.clear();
    ordemSelecionados.length = 0;

    analises.MANUAL.filtros.add(resultadoAnalise100.t2);
    ordemSelecionados.push(resultadoAnalise100.t2);

    analises.MANUAL.filtros.add(resultadoAnalise100.t1);
    ordemSelecionados.push(resultadoAnalise100.t1);

    atualizarModosPorOrdem();
  }

  function calcularAnaliseTerminal(hist){
    if(hist.length < 3) return null;

    const histOriginal = historicoCompleto;
    historicoCompleto = hist.slice();

    const zonaMae = calcularAnalise100();

    const gatilho = terminal(hist[hist.length - 1]);
    const base = hist.slice(-100);
    const ultimos14 = hist.slice(-14);
    const ultimos6 = hist.slice(-6);

    let melhor = null;
    let melhorFora = null;

    for(let t2=0;t2<=9;t2++){
      for(let t1=0;t1<=9;t1++){

        if(t1 === t2) continue;

        const cobertura = coberturaDupla(t2,t1);

        let green = 0;
        let red = 0;
        let ocorrencias = 0;

        for(let i=0;i<base.length-1;i++){
          const atual = base[i];
          const prox = base[i+1];

          if(terminal(atual) === gatilho){
            ocorrencias++;

            if(cobertura.has(prox)){
              green++;
            } else {
              red++;
            }
          }
        }

        const total = green + red;
        const taxa = total ? green / total : 0;

        const forcaT2Timeline = contarTerminalNaLista(t2, ultimos14);
        const forcaT1Timeline = contarTerminalNaLista(t1, ultimos14);

        const forcaT2Vizinho1_6 = contarCoberturaNaLista(t2, ultimos6, 1);
        const forcaT1Vizinho1_6 = contarCoberturaNaLista(t1, ultimos6, 1);

        const forcaT2Vizinho2_6 = contarCoberturaNaLista(t2, ultimos6, 2);
        const forcaT1Vizinho2_6 = contarCoberturaNaLista(t1, ultimos6, 2);

        const forcaT2Crua6 = contarTerminalNaLista(t2, ultimos6);
        const forcaT1Crua6 = contarTerminalNaLista(t1, ultimos6);

        const zona = proximidadeZonaMae(t2,t1,zonaMae);

        const scoreHistorico = (green * 4) - (red * 3) + (taxa * 10);
        const scoreTimeline = (forcaT2Timeline * 4) + (forcaT1Timeline * 2);
        const scoreUltimos6 =
          (forcaT2Vizinho2_6 * 6) +
          (forcaT1Vizinho2_6 * 4) +
          (forcaT2Vizinho1_6 * 4) +
          (forcaT1Vizinho1_6 * 2) +
          (forcaT2Crua6 * 3) +
          (forcaT1Crua6 * 2);

        let score = scoreHistorico + scoreTimeline + scoreUltimos6 + zona.score;

        if(!zona.perto){
          score -= 999;
        }

        const teste = {
          gatilho,
          t2,
          t1,
          green,
          red,
          taxa,
          ocorrencias,
          zonaMae,
          zonaPerto:zona.perto,
          zonaIntersecao:zona.intersecao,
          zonaDistancia:zona.distMin,
          forcaT2Timeline,
          forcaT1Timeline,
          forcaT2Vizinho1_6,
          forcaT1Vizinho1_6,
          forcaT2Vizinho2_6,
          forcaT1Vizinho2_6,
          forcaT2Crua6,
          forcaT1Crua6,
          score
        };

        if(ocorrencias > 0){
          if(
            !melhorFora ||
            teste.score > melhorFora.score ||
            (teste.score === melhorFora.score && teste.green > melhorFora.green) ||
            (teste.score === melhorFora.score && teste.green === melhorFora.green && teste.red < melhorFora.red)
          ){
            melhorFora = teste;
          }

          if(
            teste.zonaPerto &&
            (
              !melhor ||
              teste.score > melhor.score ||
              (teste.score === melhor.score && teste.green > melhor.green) ||
              (teste.score === melhor.score && teste.green === melhor.green && teste.red < melhor.red) ||
              (teste.score === melhor.score && teste.green === melhor.green && teste.red === melhor.red && teste.taxa > melhor.taxa)
            )
          ){
            melhor = teste;
          }
        }
      }
    }

    historicoCompleto = histOriginal;

    return melhor || melhorFora;
  }

  function aplicarAnaliseTerminal(){
    resultadoAnaliseTerminal = calcularAnaliseTerminal(historicoCompleto);

    if(!resultadoAnaliseTerminal) return;

    analises.MANUAL.filtros.clear();
    ordemSelecionados.length = 0;

    analises.MANUAL.filtros.add(resultadoAnaliseTerminal.t2);
    ordemSelecionados.push(resultadoAnaliseTerminal.t2);

    analises.MANUAL.filtros.add(resultadoAnaliseTerminal.t1);
    ordemSelecionados.push(resultadoAnaliseTerminal.t1);

    atualizarModosPorOrdem();
  }

  function recalcularTimelineRetroativa(){
    resultadosTimeline = historicoCompleto.map(()=>null);

    if(!analiseTerminalAtiva) return;

    for(let i=0;i<historicoCompleto.length-1;i++){
      const histAteAqui = historicoCompleto.slice(0,i+1);
      const analise = calcularAnaliseTerminal(histAteAqui);
      const prox = historicoCompleto[i+1];

      if(analise){
        resultadosTimeline[i+1] = validarNumeroNaJogada(prox, analise);
      }
    }
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

      <div id="analiseTerminalBox" style="display:none;border:1px solid #555;background:#181818;padding:8px;border-radius:6px;margin:10px 0"></div>

      <div style="margin:10px 0">
        🕒 Timeline:
        <span id="tl" style="font-size:18px;font-weight:600"></span>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">
        <button id="btnUndo">Apagar último</button>
        <button id="btnClear">Apagar tudo</button>
        <button id="btnAnalise100">Análise 100</button>
        <button id="btnAnaliseTerminal">Análise Terminal</button>
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
      if(analiseTerminalAtiva) aplicarAnaliseTerminal();

      recalcularTimelineRetroativa();

      render();
    },0);
  });

  btnAnalise100.onclick = ()=>{
    analise100Ativa = !analise100Ativa;
    analiseTerminalAtiva = false;
    resultadoAnaliseTerminal = null;
    resultadosTimeline = historicoCompleto.map(()=>null);

    if(analise100Ativa){
      aplicarAnalise100();
    }

    render();
  };

  btnAnaliseTerminal.onclick = ()=>{
    analiseTerminalAtiva = !analiseTerminalAtiva;
    analise100Ativa = false;

    if(analiseTerminalAtiva){
      aplicarAnaliseTerminal();
      recalcularTimelineRetroativa();
    } else {
      resultadoAnaliseTerminal = null;
      resultadosTimeline = historicoCompleto.map(()=>null);
    }

    render();
  };

  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.textContent="T"+t;
    b.style="padding:6px;background:#444;color:#fff;border:1px solid #666";
    b.onclick=()=>{
      analise100Ativa = false;
      analiseTerminalAtiva = false;
      resultadoAnaliseTerminal = null;
      resultadosTimeline = historicoCompleto.map(()=>null);

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
    if(analiseTerminalAtiva) aplicarAnaliseTerminal();

    recalcularTimelineRetroativa();

    render();
  };

  btnClear.onclick = ()=>{
    timeline = [];
    historicoCompleto = [];
    resultadosTimeline = [];
    ordemSelecionados.length = 0;
    analises.MANUAL.filtros.clear();
    analise100Ativa = false;
    analiseTerminalAtiva = false;
    resultadoAnaliseTerminal = null;
    resultadoAnalise100 = null;
    render();
  };

  function add(n){
    let validacao = null;

    if(analiseTerminalAtiva && resultadoAnaliseTerminal){
      validacao = validarNumeroNaJogada(n, resultadoAnaliseTerminal);
    }

    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();

    historicoCompleto.push(n);
    resultadosTimeline.push(validacao);

    if(analise100Ativa) aplicarAnalise100();
    if(analiseTerminalAtiva) aplicarAnaliseTerminal();

    render();
  }

  function renderAnaliseTerminal(){
    if(!analiseTerminalAtiva){
      analiseTerminalBox.style.display = "none";
      analiseTerminalBox.innerHTML = "";
      return;
    }

    analiseTerminalBox.style.display = "block";

    if(!resultadoAnaliseTerminal){
      analiseTerminalBox.innerHTML = `
        <div style="font-weight:700;color:#ffc107;text-align:center">ANÁLISE TERMINAL</div>
        <div style="font-size:12px;text-align:center;margin-top:4px">
          Histórico insuficiente para calcular.
        </div>
      `;
      return;
    }

    const r = resultadoAnaliseTerminal;
    const zona = r.zonaMae;

    analiseTerminalBox.innerHTML = `
      <div style="font-weight:700;color:#ffc107;text-align:center">ANÁLISE TERMINAL</div>

      <div style="font-size:13px;text-align:center;margin-top:5px">
        Gatilho atual:
        <b style="color:${corTerminal[r.gatilho]}">T${r.gatilho}</b>
      </div>

      ${zona ? `
        <div style="font-size:12px;text-align:center;margin-top:5px;color:#ccc">
          Zona-mãe Análise 100:
          <b style="color:${corTerminal[zona.t2]}">T${zona.t2}</b>
          +
          <b style="color:${corTerminal[zona.t1]}">T${zona.t1}</b>
          · ${zona.green}G/${zona.red}L
          · ${(zona.taxa*100).toFixed(1)}%
        </div>
      ` : ``}

      <div style="font-size:13px;text-align:center;margin-top:5px">
        Melhor jogada próxima:
        <b style="color:${corTerminal[r.t2]}">T${r.t2} com 2 vizinhos</b>
        +
        <b style="color:${corTerminal[r.t1]}">T${r.t1} com 1 vizinho</b>
      </div>

      <div style="font-size:12px;text-align:center;margin-top:5px;color:#ccc">
        Histórico gatilho: ${r.ocorrencias}
        · Green: ${r.green}
        · Red: ${r.red}
        · Taxa: ${(r.taxa*100).toFixed(1)}%
      </div>

      <div style="font-size:12px;text-align:center;margin-top:5px;color:#ccc">
        Timeline 14:
        T${r.t2}=<b style="color:${corTerminal[r.t2]}">${r.forcaT2Timeline}</b>
        · T${r.t1}=<b style="color:${corTerminal[r.t1]}">${r.forcaT1Timeline}</b>
      </div>

      <div style="font-size:12px;text-align:center;margin-top:5px;color:#ccc">
        Últimos 6 com 1 vizinho:
        T${r.t2}=<b style="color:${corTerminal[r.t2]}">${r.forcaT2Vizinho1_6}</b>
        · T${r.t1}=<b style="color:${corTerminal[r.t1]}">${r.forcaT1Vizinho1_6}</b>
      </div>

      <div style="font-size:12px;text-align:center;margin-top:5px;color:#ccc">
        Últimos 6 com 2 vizinhos:
        T${r.t2}=<b style="color:${corTerminal[r.t2]}">${r.forcaT2Vizinho2_6}</b>
        · T${r.t1}=<b style="color:${corTerminal[r.t1]}">${r.forcaT1Vizinho2_6}</b>
      </div>

      <div style="font-size:12px;text-align:center;margin-top:5px;color:#ccc">
        Conexão com zona-mãe:
        Interseção: <b style="color:#fff">${r.zonaIntersecao}</b>
        · Distância: <b style="color:#fff">${r.zonaDistancia}</b>
        · Score: <b style="color:#fff">${r.score.toFixed(1)}</b>
      </div>
    `;
  }

  function renderTimeline(){
    const ultimos = historicoCompleto.slice(-14).reverse();
    const indices = [];

    for(let i=historicoCompleto.length-1;i>=Math.max(0,historicoCompleto.length-14);i--){
      indices.push(i);
    }

    tl.innerHTML = ultimos.map((n,idx)=>{
      const res = resultadosTimeline[indices[idx]];

      if(!res){
        return `<span style="display:inline-block;margin:2px;padding:3px 5px;border-radius:4px;background:#222;border:1px solid #444;color:#fff">${n}</span>`;
      }

      return `
        <span title="${res.detalhe}" style="
          display:inline-block;
          margin:2px;
          padding:3px 5px;
          border-radius:4px;
          background:${res.cor};
          border:1px solid ${res.cor};
          color:#000;
          font-weight:800;
        ">${n}</span>
      `;
    }).join("");
  }

  function render(){

    renderTimeline();

    renderAnaliseTerminal();

    btnAnalise100.style.background = analise100Ativa ? "#00e676" : "";
    btnAnalise100.style.color = analise100Ativa ? "#000" : "";

    btnAnaliseTerminal.style.background = analiseTerminalAtiva ? "#ffc107" : "";
    btnAnaliseTerminal.style.color = analiseTerminalAtiva ? "#000" : "";

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
