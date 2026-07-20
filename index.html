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
  let faixa10Ativa = false;
  let analise100Ativa = false;
  let analiseColunasAtiva = false;
  let colunasTopo = [1,2,3,4,5,6,7,8,9,10,11,12];

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

  function analisarColunas(){
    const base = historicoCompleto.slice().reverse();
    const colunas = 12;
    let html = "";

    for(let c=0;c<colunas;c++){
      const cont = {};
      for(let t=0;t<=9;t++) cont[t]=0;

      for(let i=c;i<base.length;i+=colunas){
        cont[terminal(base[i])]++;
      }

      const top = Object.entries(cont)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,2)
        .map(x=>Number(x[0]));

      html += `
        <span style="
          display:inline-block;
          margin:2px;
          padding:4px 6px;
          background:#222;
          border:1px solid #555;
          border-radius:4px;
          font-size:12px;
          color:#fff;
        ">
          C${c+1}: 
          <b style="color:${corTerminal[top[0]]}">T${top[0]}</b> /
          <b style="color:${corTerminal[top[1]]}">T${top[1]}</b>
        </span>
      `;
    }

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
        <button id="btn10">10</button>
        <button id="btnAnalise100">Análise 100</button>
        <button id="btnAnaliseColunas">Análise Colunas</button>
      </div>

      <div style="border:1px solid #555;padding:8px;margin-bottom:10px">
        Terminais:
        <div id="btnT" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
      </div>

      <div id="conjArea" style="display:none;margin-top:12px;overflow-x:auto"></div>

      <div id="analiseColunasBox" style="display:none;margin-top:10px"></div>

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
      colunasTopo = [1,2,3,4,5,6,7,8,9,10,11,12];

      inputHist.style.display="none";

      if(analise100Ativa) aplicarAnalise100();

      render();
    },0);
  });

  btn10.onclick = ()=>{
    faixa10Ativa = !faixa10Ativa;
    render();
  };

  btnAnalise100.onclick = ()=>{
    analise100Ativa = !analise100Ativa;

    if(analise100Ativa){
      aplicarAnalise100();
    }

    render();
  };

  btnAnaliseColunas.onclick = ()=>{
    analiseColunasAtiva = !analiseColunasAtiva;
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

    if(analiseColunasAtiva){
      const primeiro = colunasTopo.shift();
      colunasTopo.push(primeiro);
    }

    if(analise100Ativa) aplicarAnalise100();

    render();
  };

  btnClear.onclick = ()=>{
    timeline = [];
    historicoCompleto = [];
    ordemSelecionados.length = 0;
    analises.MANUAL.filtros.clear();
    faixa10Ativa = false;
    analise100Ativa = false;
    analiseColunasAtiva = false;
    colunasTopo = [1,2,3,4,5,6,7,8,9,10,11,12];
    render();
  };

  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();

    if(analiseColunasAtiva){
      const ultimo = colunasTopo.pop();
      colunasTopo.unshift(ultimo);
    }

    historicoCompleto.push(n);

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

    tl.innerHTML = timeline.join(" · ");

    btn10.style.background = faixa10Ativa ? "#ffc107" : "";
    btn10.style.color = faixa10Ativa ? "#000" : "";

    btnAnalise100.style.background = analise100Ativa ? "#00e676" : "";
    btnAnalise100.style.color = analise100Ativa ? "#000" : "";

    btnAnaliseColunas.style.background = analiseColunasAtiva ? "#00bcd4" : "";
    btnAnaliseColunas.style.color = analiseColunasAtiva ? "#000" : "";

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
        ${analiseColunasAtiva ? `
          <div style="
            display:grid;
            grid-template-columns:repeat(12,minmax(26px,1fr));
            gap:4px;
            margin-bottom:4px;
            font-size:10px;
            font-weight:700;
            color:#ffc107;
            text-align:center;
          ">
            ${colunasTopo.map(c=>`
              <div style="border:1px solid #555;background:#111;border-radius:4px;padding:2px">
                C${c}
              </div>
            `).join("")}
          </div>
        ` : ``}

        <div style="display:grid;grid-template-columns:${analiseColunasAtiva ? 'repeat(12,minmax(26px,1fr))' : 'repeat(auto-fit,minmax(26px,1fr))'};gap:4px">
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
              border:${faixa10Ativa && n>=10 && n<=19 ? "3px solid #ffc107" : (n===ultimoNumero ? `3px solid ${mapaCores[n] || '#fff'}` : '1px solid #333')};
              box-shadow:${n===ultimoNumero ? `0 0 10px ${mapaCores[n] || '#fff'}` : 'none'};
              animation:${n===ultimoNumero ? 'piscaStrong 0.8s infinite' : 'none'};
            ">${n}</div>
          `).join("")}
        </div>
      `;
    } else {
      conjArea.style.display = "none";
    }

    if(analiseColunasAtiva && historicoCompleto.length){
      analiseColunasBox.style.display = "block";
      analiseColunasBox.innerHTML = analisarColunas();
    } else {
      analiseColunasBox.style.display = "none";
      analiseColunasBox.innerHTML = "";
    }

    desenharRadar();
  }

  conjArea.onclick = ()=>{
    expandido = !expandido;
    render();
  };

  render();

})();
