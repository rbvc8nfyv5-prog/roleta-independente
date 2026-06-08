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

  let top5ManualAtivo = false;
  let top5Manual = [];

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

  function setorComRaio(centro, raio){
    const i = track.indexOf(centro);
    const set = new Set();
    for(let d=-raio; d<=raio; d++){
      set.add(track[(i+d+37)%37]);
    }
    return set;
  }

  function analisarSetor(base, centro){
    const setor = setorComRaio(centro, 9);
    let atual = 0;
    let max = 0;
    let seq = 0;
    let total = 0;

    base.forEach(n=>{
      if(setor.has(n)){
        total++;
        seq++;
        if(seq > max) max = seq;
      } else {
        seq = 0;
      }
    });

    for(let i=base.length-1;i>=0;i--){
      if(setor.has(base[i])) atual++;
      else break;
    }

    return {
      centro,
      setor,
      atual,
      max,
      total,
      pct: base.length ? (total / base.length) * 100 : 0
    };
  }

  function renderSetoresBox(){
    const base = historicoCompleto;
    const z = analisarSetor(base, 0);
    const d = analisarSetor(base, 10);

    function card(nome, r, cor){
      const alerta = r.atual >= 3;
      return `
        <div style="
          flex:1;
          min-width:130px;
          padding:8px;
          border:${alerta ? `3px solid ${cor}` : "1px solid #555"};
          background:${alerta ? "#221b00" : "#181818"};
          border-radius:8px;
          color:#fff;
          box-shadow:${alerta ? `0 0 12px ${cor}` : "none"};
        ">
          <div style="font-weight:800;color:${cor};font-size:14px">${alerta ? "🔥 " : ""}${nome}</div>
          <div style="font-size:12px;margin-top:4px">Atual: <b>${r.atual}</b></div>
          <div style="font-size:12px">Máxima: <b>${r.max}</b></div>
          <div style="font-size:12px">Acerto: <b>${r.pct.toFixed(1)}%</b></div>
          <div style="font-size:10px;margin-top:4px;color:#aaa;line-height:1.3">
            ${Array.from(r.setor).join(" - ")}
          </div>
        </div>
      `;
    }

    return `
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:10px">
        ${card("LADO ZERO ±9", z, "#00e676")}
        ${card("LADO 10 ±9", d, "#ffc107")}
      </div>
    `;
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

  function validarTop5Manual(lista){
    if(lista.length !== 5) return false;
    for(let i=0;i<lista.length;i++){
      if(lista[i] < 0 || lista[i] > 36) return false;
      for(let j=i+1;j<lista.length;j++){
        if(distanciaFisica(lista[i], lista[j]) <= 4) return false;
      }
    }
    return true;
  }

  function top5Quentes2VMelhorado(base, complexoRef){
    if(top5ManualAtivo && top5Manual.length === 5){
      return top5Manual.slice();
    }

    const final = [];
    const usados = new Set();
    const coberturaRef = complexoRef ? coberturaComplexo(complexoRef) : null;

    while(final.length < 5){
      let melhor = null;

      track.forEach(c=>{
        if(conflita2V(c, final)) return;

        const bloco = vizinhos2(c);

        let toqueComplexo = 0;
        if(coberturaRef){
          bloco.forEach(n=>{
            if(coberturaRef.has(n)) toqueComplexo++;
          });
        }

        let ganho = 0;
        let totalBloco = 0;

        base.forEach(n=>{
          if(bloco.includes(n)){
            totalBloco++;
            if(!usados.has(n)) ganho++;
          }
        });

        const score = (ganho * 10) + totalBloco + (toqueComplexo * 15);

        const teste = { c, ganho, totalBloco, toqueComplexo, score };

        if(
          !melhor ||
          teste.score > melhor.score ||
          (teste.score === melhor.score && teste.ganho > melhor.ganho) ||
          (teste.score === melhor.score && teste.ganho === melhor.ganho && teste.toqueComplexo > melhor.toqueComplexo)
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

  function top5Atual(base){
    const comp = melhorComplexo(base);
    return top5Quentes2VMelhorado(base, comp);
  }

  function renderTop5(base){
    if(!base || !base.length) return "";

    const tops = top5Atual(base);
    const pct = percentualTop5(base, tops);

    return `
      <div style="margin-top:6px;font-size:12px;color:#fff">
        <b style="color:#ffc107">Top 5 quente 2v:</b>
        <span style="font-weight:700;color:#fff">${tops.join(" - ")}</span>
        <br>
        <b style="color:#00e676">Acerto Top 5:</b>
        <span style="font-weight:700;color:#00e676">${pct.toFixed(1)}%</span>
        ${top5ManualAtivo ? `<br><b style="color:#00bcd4">✍️ Top 5 manual</b>` : ""}
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

  function escolherTop5Manual(){
    const atual = top5ManualAtivo && top5Manual.length ? top5Manual.join(" ") : "";
    const txt = prompt("Digite 5 centrais do Top 5 manual separados por espaço:", atual);

    if(txt === null) return;

    const nums = txt
      .split(/[\s,;|]+/)
      .map(Number)
      .filter(n=>!isNaN(n) && n>=0 && n<=36);

    const unicos = [...new Set(nums)];

    if(!validarTop5Manual(unicos)){
      alert("Top 5 inválido. Use 5 números diferentes, de 0 a 36, sem encostar cobertura 2v.");
      return;
    }

    top5Manual = unicos;
    top5ManualAtivo = true;
    render();
  }

  function limparTop5Manual(){
    top5ManualAtivo = false;
    top5Manual = [];
    render();
  }

  function salvarCrupierAtual(){
    if(!crupierAtivo) return;

    const melhor = melhorComplexo(crup
