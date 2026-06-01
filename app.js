(function () {

  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];
  const terminal = n => n % 10;

  const corTerminal = {
    0:"#ff5252",1:"#ff9800",2:"#ffc107",3:"#00e676",4:"#00bcd4",
    5:"#2196f3",6:"#9c27b0",7:"#e91e63",8:"#8bc34a",9:"#ff00ff"
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
  let crupierInicio = "";
  let historicoCrupiers = [];
  let crupierAberto = null;

  try{
    const salvo = localStorage.getItem("historicoCrupiersCSM");
    if(salvo){
      historicoCrupiers = JSON.parse(salvo) || [];
    }
  }catch(e){
    historicoCrupiers = [];
  }

  function salvarLocal(){
    try{
      localStorage.setItem("historicoCrupiersCSM", JSON.stringify(historicoCrupiers));
    }catch(e){}
  }

  function dataAgora(){
    const d = new Date();
    return d.toLocaleString("pt-BR");
  }

  const analises = { MANUAL: { filtros:new Set(), res:[] } };
  const modosTerminais = {};
  const ordemSelecionados = [];
  for (let t = 0; t <= 9; t++) modosTerminais[t] = 0;

  const complexosFixos = [
    { nome:"C3/9", t2:3, t1:9 },
    { nome:"C2/3", t2:2, t1:3 },
    { nome:"C4/8", t2:4, t1:8 },
    { nome:"C6/2", t2:6, t1:2 },
    { nome:"C5/1", t2:5, t1:1 }
  ];

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
    if(ordemSelecionados.length > 0) modosTerminais[ordemSelecionados[0]] = 2;
    for(let i=1;i<ordemSelecionados.length;i++) modosTerminais[ordemSelecionados[i]] = 1;
  }

  function vizinhos1(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
  }

  function vizinhos2(n){
    const i = track.indexOf(n);
    return [ track[(i+35)%37], track[(i+36)%37], n, track[(i+1)%37], track[(i+2)%37] ];
  }

  function segundoVizinho(n){
    const i = track.indexOf(n);
    return [ track[(i+35)%37], track[(i+2)%37] ];
  }

  function distanciaFisica(a,b){
    const ia = track.indexOf(a);
    const ib = track.indexOf(b);
    let d = Math.abs(ia - ib);
    return Math.min(d, 37 - d);
  }

  function conflita2V(n, usados){
    return usados.some(u => distanciaFisica(n,u) <= 4);
  }

  function coberturaTerminal(t, qtd){
    const set = new Set();
    track.forEach(n=>{
      if(terminal(n) === t){
        if(qtd === 2) vizinhos2(n).forEach(v=>set.add(v));
        else vizinhos1(n).forEach(v=>set.add(v));
      }
    });
    return set;
  }

  function coberturaComplexo(c){
    const cov2 = coberturaTerminal(c.t2,2);
    const cov1 = coberturaTerminal(c.t1,1);
    return new Set([...cov2, ...cov1]);
  }

  function analisarComplexo(base,c){
    const cobertura = coberturaComplexo(c);
    let green = 0;
    let red = 0;

    base.forEach(n=>{
      if(cobertura.has(n)) green++;
      else red++;
    });

    const total = green + red;
    const taxa = total ? green / total : 0;

    return {
      nome:c.nome,
      t2:c.t2,
      t1:c.t1,
      green,
      red,
      taxa
    };
  }

  function melhorComplexo(base){
    if(!base || !base.length) return null;

    let melhor = null;

    complexosFixos.forEach(c=>{
      const teste = analisarComplexo(base,c);

      if(
        !melhor ||
        teste.taxa > melhor.taxa ||
        (teste.taxa === melhor.taxa && teste.green > melhor.green) ||
        (teste.taxa === melhor.taxa && teste.green === melhor.green && teste.red < melhor.red)
      ){
        melhor = teste;
      }
    });

    return melhor;
  }

  function coberturaCentrais2V(centrais){
    const set = new Set();
    centrais.forEach(c=>{
      vizinhos2(c).forEach(v=>set.add(v));
    });
    return set;
  }

  function percentualTop5(base, tops){
    if(!base.length || !tops.length) return 0;

    const cobertura = coberturaCentrais2V(tops);
    let acertos = 0;

    base.forEach(n=>{
      if(cobertura.has(n)) acertos++;
    });

    return (acertos / base.length) * 100;
  }

  function top5Quentes2VMelhorado(base){
    const final = [];
    const usados = new Set();

    while(final.length < 5){
      let melhor = null;

      track.forEach(c=>{
        if(conflita2V(c, final)) return;

        const bloco = vizinhos2(c);
        let ganho = 0;
        let totalBloco = 0;

        base.forEach(n=>{
          if(bloco.includes(n)){
            totalBloco++;
            if(!usados.has(n)) ganho++;
          }
        });

        const score = (ganho * 10) + totalBloco;

        const teste = { c, ganho, totalBloco, score };

        if(
          !melhor ||
          teste.score > melhor.score ||
          (teste.score === melhor.score && teste.ganho > melhor.ganho) ||
          (teste.score === melhor.score && teste.ganho === melhor.ganho && teste.totalBloco > melhor.totalBloco)
        ){
          melhor = teste;
        }
      });

      if(!melhor) break;

      final.push(melhor.c);
      vizinhos2(melhor.c).forEach(v=>usados.add(v));
    }

    track.forEach(n=>{
      if(final.length < 5 && !conflita2V(n, final)){
        final.push(n);
      }
    });

    return final;
  }

  function renderTop5(base){
    if(!base || !base.length) return "";

    const tops = top5Quentes2VMelhorado(base);
    const pct = percentualTop5(base, tops);

    return `
      <div style="margin-top:6px;font-size:12px;color:#fff">
        <b style="color:#ffc107">Top 5 quente 2v:</b>
        <span style="font-weight:700;color:#fff">${tops.join(" - ")}</span>
        <br>
        <b style="color:#00e676">Acerto Top 5:</b>
        <span style="font-weight:700;color:#00e676">${pct.toFixed(1)}%</span>
      </div>
    `;
  }

  function aplicarComplexoNoManual(c){
    if(!c) return;

    analises.MANUAL.filtros.clear();
    ordemSelecionados.length = 0;

    analises.MANUAL.filtros.add(c.t2);
    ordemSelecionados.push(c.t2);

    analises.MANUAL.filtros.add(c.t1);
    ordemSelecionados.push(c.t1);

    atualizarModosPorOrdem();
  }

  function aplicarAnalise100(){
    const melhor = melhorComplexo(historicoCompleto);
    if(!melhor) return;
    aplicarComplexoNoManual(melhor);
  }

  function salvarCrupierAtual(){
    if(!crupierAtivo) return;

    const melhor = melhorComplexo(crupierNumeros);
    const top5 = top5Quentes2VMelhorado(crupierNumeros);

    historicoCrupiers.push({
      id: Date.now(),
      nome: crupierNome,
      dataInicio: crupierInicio,
      dataFim: dataAgora(),
      total: crupierNumeros.length,
      numeros: crupierNumeros.slice(),
      top5,
      taxaTop5: percentualTop5(crupierNumeros, top5),
      melhor
    });

    salvarLocal();

    crupierAtivo = false;
    crupierNome = "";
    crupierNumeros = [];
    crupierInicio = "";
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
${c.melhor.nome}: T${c.melhor.t2} 2v / T${c.melhor.t1} 1v
Green: ${c.melhor.green}
Red: ${c.melhor.red}
Taxa: ${(c.melhor.taxa*100).toFixed(1)}%
Top 5: ${(c.top5 || []).join(" - ")}
Acerto Top 5: ${((c.taxaTop5 || 0)).toFixed(1)}%
Data: ${c.dataFim || ""}
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

    timeline = [];
    historicoCompleto = [];
    expandido = false;
    analises.MANUAL.filtros.clear();
    ordemSelecionados.length = 0;
    for(let t=0;t<=9;t++) modosTerminais[t] = 0;

    crupierAtivo = true;
    crupierNome = nome;
    crupierNumeros = [];
    crupierInicio = dataAgora();

    inputHist.value = "";
    inputHist.placeholder = "Cole histórico deste crupiê aqui";
    inputHist.style.display = "block";
  }

  function corNumeroAnalise(n, melhor){
    if(!melhor) return "#777";

    const cov2 = coberturaTerminal(melhor.t2,2);
    const cov1 = coberturaTerminal(melhor.t1,1);

    if(cov2.has(n)) return corTerminal[melhor.t2];
    if(cov1.has(n)) return corTerminal[melhor.t1];

    return "#777";
  }

  function estaDentroComplexo(n, melhor){
    if(!melhor) return false;
    return coberturaComplexo(melhor).has(n);
  }

  function dadosTop5(base){
    if(!base || !base.length) return { tops:[], cobertura:new Set() };
    const tops = top5Quentes2VMelhorado(base);
    return {
      tops,
      cobertura: coberturaCentrais2V(tops)
    };
  }

  function renderHistoricoNumeros(numeros, melhor){
    if(!numeros || !numeros.length) return "";

    const top5Info = dadosTop5(numeros);

    return `
      <div style="
        margin-top:6px;
        padding:5px;
        background:#111;
        border:1px solid #333;
        border-radius:4px;
        color:#ccc;
        font-size:11px;
        line-height:1.8;
        max-height:90px;
        overflow:auto;
      ">
        <b style="color:#ffc107">Histórico:</b><br>
        ${numeros.map(n=>{
          const dentroTop5 = top5Info.cobertura.has(n);
          const cor = corNumeroAnalise(n, melhor);

          return `
            <span style="
              color:${cor};
              font-weight:700;
              display:inline-flex;
              align-items:center;
              justify-content:center;
              width:${dentroTop5 ? "24px" : "auto"};
              height:${dentroTop5 ? "24px" : "auto"};
              border-radius:${dentroTop5 ? "50%" : "0"};
              border:${dentroTop5 ? "2px solid #00e676" : "0"};
              background:${dentroTop5 ? "#062d16" : "transparent"};
              margin:2px 3px;
            ">${n}</span>
          `;
        }).join("")}
      </div>
    `;
  }

  function apagarCrupier(id){
    const ok = confirm("Apagar este crupiê e todo o histórico dele?");
    if(!ok) return;

    historicoCrupiers = historicoCrupiers.filter(c=>c.id !== id);

    if(crupierAberto === id){
      crupierAberto = null;
    }

    salvarLocal();
    render();
  }

  function renderComplexos(base){
    if(!base || !base.length) return "";

    const melhor = melhorComplexo(base);

    const linhas = complexosFixos.map(c=>{
      const r = analisarComplexo(base,c);
      const ativo = melhor && melhor.nome === r.nome;

      return `
        <div style="
          margin-top:4px;
          padding:4px;
          border:${ativo ? "2px solid #00e676" : "1px solid #444"};
          background:${ativo ? "#102015" : "#111"};
          border-radius:4px;
        ">
          <b style="color:${ativo ? "#00e676" : "#ffc107"}">${r.nome}</b>:
          <span style="color:${corTerminal[r.t2]}">T${r.t2} 2v</span> /
          <span style="color:${corTerminal[r.t1]}">T${r.t1} 1v</span>
          | G: ${r.green}
          | R: ${r.red}
          | ${(r.taxa*100).toFixed(1)}%
        </div>
      `;
    }).join("");

    return `
      <div style="margin-top:6px;font-size:12px;color:#fff">
        <b style="color:#ffc107">Complexos fixos:</b>
        ${linhas}
      </div>
    `;
  }

  function renderCrupierBox(){
    if(!historicoCrupiers.length && !crupierAtivo) return "";

    let html = "";

    if(crupierAtivo){
      const melhorAtual = melhorComplexo(crupierNumeros);

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
          | Início: <b>${crupierInicio}</b>
          ${renderComplexos(crupierNumeros)}
          ${renderTop5(crupierNumeros)}
          ${renderHistoricoNumeros(crupierNumeros, melhorAtual)}
        </div>
      `;
    }

    historicoCrupiers.slice().reverse().forEach((c,i)=>{
      const aberto = crupierAberto === c.id;

      html += `
        <div
          data-crupier-id="${c.id}"
          style="
            margin-top:6px;
            padding:6px;
            border:1px solid #555;
            background:#222;
            color:#fff;
            font-size:12px;
            border-radius:4px;
            cursor:pointer;
          "
        >
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
            <b>${aberto ? "▼" : "▶"} ${c.nome}</b>
            <button data-delete-crupier="${c.id}" style="
              background:#ff5252;
              color:#fff;
              border:0;
              border-radius:4px;
              padding:2px 6px;
              font-size:11px;
              font-weight:700;
            ">Apagar</button>
          </div>

          <div style="margin-top:3px">
            ${c.dataFim || ""}
            ${c.melhor 
              ? `<br><b style="color:#00e676">${c.melhor.nome}</b>:
                 <span style="color:${corTerminal[c.melhor.t2]}">T${c.melhor.t2} 2v</span> /
                 <span style="color:${corTerminal[c.melhor.t1]}">T${c.melhor.t1} 1v</span>
                 | Green: ${c.melhor.green}
                 | Red: ${c.melhor.red}
                 | Taxa: ${(c.melhor.taxa*100).toFixed(1)}%`
              : `<br>Sem dados suficientes`}
            | Giros: ${c.total}
            ${renderComplexos(c.numeros || [])}
            ${renderTop5(c.numeros || [])}
            ${aberto ? renderHistoricoNumeros(c.numeros || [], c.melhor) : ""}
          </div>
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
      const numerosColados = inputHist.value
        .split(/[\s,;|]+/)
        .map(Number)
        .filter(n=>n>=0 && n<=36);

      if(crupierAtivo){
        numerosColados.forEach(n=>{
          historicoCompleto.push(n);
          crupierNumeros.push(n);
        });
      } else {
        historicoCompleto = numerosColados;
      }

      timeline = historicoCompleto.slice(-14).reverse();
      inputHist.style.display="none";

      if(analise100Ativa) aplicarAnalise100();

      render();
    },0);
  });

  btnAnalise100.onclick = ()=>{
    analise100Ativa = !analise100Ativa;
    if(analise100Ativa) aplicarAnalise100();
    render();
  };

  btnCrupier.onclick = ()=>{
    if(crupierAtivo){
      salvarCrupierAtual();
      iniciarNovoCrupier();
    } else {
      iniciarNovoCrupier();
    }

    if(analise100Ativa) aplicarAnalise100();
    render();
  };

  crupierBox.onclick = (e)=>{
    const del = e.target.closest("[data-delete-crupier]");
    if(del){
      e.stopPropagation();
      apagarCrupier(Number(del.getAttribute("data-delete-crupier")));
      return;
    }

    const card = e.target.closest("[data-crupier-id]");
    if(!card) return;

    const id = Number(card.getAttribute("data-crupier-id"));
    crupierAberto = crupierAberto === id ? null : id;
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

    if(crupierAtivo && crupierNumeros.length){
      crupierNumeros.pop();
    }

    if(analise100Ativa) aplicarAnalise100();
    render();
  };

  btnClear.onclick = ()=>{
    timeline = [];
    historicoCompleto = [];
    ordemSelecionados.length = 0;
    analises.MANUAL.filtros.clear();
    analise100Ativa = false;
    crupierAtivo = false;
    crupierNome = "";
    crupierNumeros = [];
    crupierInicio = "";
    crupierAberto = null;
    inputHist.value = "";
    inputHist.placeholder = "Cole histórico aqui";
    inputHist.style.display = "block";
    render();
  };

  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    historicoCompleto.push(n);

    if(crupierAtivo){
      crupierNumeros.push(n);
    }

    if(analise100Ativa) aplicarAnalise100();
    render();
  }

  function desenharRadar(){
    const canvas = document.getElementById("radar");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0,0,260,260);

    const cx = 130, cy = 130, r = 110;
    const ang = (Math.PI*2)/track.length;
    const ativos = new Set(timeline);

    for(let i=0;i<track.length;i++){
      const a1 = i*ang + Math.PI/2;
      const a2 = a1 + ang;

      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r,a1,a2);
      ctx.closePath();
      ctx.fillStyle="#1c1c1c";
      ctx.fill();

      const meio = (a1+a2)/2;
      const tx = cx + Math.cos(meio)*(r-25);
      const ty = cy + Math.sin(meio)*(r-25);

      ctx.fillStyle = ativos.has(track[i]) ? "#00e676" : "#fff";
      ctx.fillText(track[i],tx,ty);
    }
  }

  function render(){
    tl.innerHTML = timeline.map(n=>{
      return `<span style="color:${corDuzia(n)}">${n}</span>`;
    }).join(" · ");

    btnAnalise100.style.background = analise100Ativa ? "#00e676" : "";
    btnAnalise100.style.color = analise100Ativa ? "#000" : "";

    btnCrupier.style.background = crupierAtivo ? "#ffc107" : "";
    btnCrupier.style.color = crupierAtivo ? "#000" : "";
    btnCrupier.textContent = crupierAtivo ? "Novo Crupiê" : "Análise Crupiê";

    crupierBox.innerHTML = renderCrupierBox();

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
              segundoVizinho(n).forEach(v=>mapaCores[v] = clarearCor(corTerminal[t]));
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

    desenharRadar();
  }

  conjArea.onclick = ()=>{
    expandido = !expandido;
    render();
  };

  render();

})();
