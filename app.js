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

    timeline = [];
    historicoCompleto = [];
    expandido = false;
    analises.MANUAL.filtros.clear();
    ordemSelecionados.length = 0;
    for(let t=0;t<=9;t++) modosTerminais[t] = 0;

    crupierAtivo = true;
    crupierNome = nome;
    crupierNumeros = [];

    inputHist.value = "";
    inputHist.placeholder = "Cole histórico deste crupiê aqui";
    inputHist.style.display = "block";
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

    if(analise100Ativa) aplicarAnalise100();

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
    historicoCrupiers = [];
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

    const cx = 130;
    const cy = 130;
    const r = 110;
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

      let corNumero="#fff";
      if(ativos.has(track[i])) corNumero="#00e676";

      ctx.fillStyle=corNumero;
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

    desenharRadar();
  }

  conjArea.onclick = ()=>{
    expandido = !expandido;
    render();
  };

  render();

})();
