(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  // ================= TRINCAS (TIMING) =================
  const trincasTiming = [
    [4,7,16],
    [2,20,30],
    [6,9,26],
    [17,23,31],
    [18,19,24],
    [9,17,26]
  ];

  // ================= LISTA DE CENTRAIS (TRINCAS QUE VOCÊ DEU) =================
  // (aqui a gente DESMEMBRA e faz JUNÇÃO dinâmica)
  const trincasCentraisEntrada = [
    [0,22,13],
    [7,24,19],
    [12,21,30],
    [9,4,36],
    [23,31,32],
    [15,16,27],
    [7,16,17],
    [3,8,25],
    [20,28,34]
  ];

  // ================= TRINCAS FIXAS DO PAR (somente para vincular ao par) =================
  const trincasParFixas = [
    [11,20,21],
    [2,18,26],
    [3,33,36],
    [4,11,20],
    [2,5,35],
    [7,19,27],
    [8,26,14]
  ];

  // ================= ESTADO =================
  let hist = [];
  let timeline = [];
  let janela = 6;            // 3..6
  let coberturaNivel = 2;    // 1..4

  // Motor: estado por “candidato” (timing ou centrais)
  // key = "T|a-b-c" ou "C|a-b-c"
  const motor = {
    estados: {},          // { key: {fase, tentativas, wins, losses, streak, lastBetAt} }
    ultimaAposta: null    // { key, setCobertura, label }
  };

  // ================= UTIL =================
  const idx = n => track.indexOf(n);
  const terminal = n => n % 10;

  function vizinhos(n, d = coberturaNivel){
    const i = idx(n);
    let a = [];
    for(let x = -d; x <= d; x++){
      a.push(track[(i + 37 + x) % 37]);
    }
    return a;
  }

  function makeSetCobertura(trinca){
    const s = new Set();
    trinca.forEach(c => vizinhos(c, coberturaNivel).forEach(n => s.add(n)));
    return s;
  }

  function scoreCobertura(trinca, base){
    const s = makeSetCobertura(trinca);
    let c = 0;
    base.forEach(n => { if(s.has(n)) c++; });
    return c;
  }

  function distMin(a,b){
    const da = Math.abs(idx(a) - idx(b));
    return Math.min(da, 37 - da);
  }

  // ================= (1) MELHOR TRINCA TIMING (como sempre) =================
  function melhorTrincaTiming(){
    const base = timeline.slice(0, janela);
    let best = null;

    trincasTiming.forEach(trinca=>{
      const sc = scoreCobertura(trinca, base);
      if(!best || sc > best.score){
        best = { tipo:"T", trinca, score: sc };
      }
    });

    return best;
  }

  // ================= (2) TRINCA DE CENTRAIS DINÂMICA (DESMEMBRA + JUNÇÃO) =================
  // - desmembra todas centrais -> pool único
  // - dá score por central (cobertura do central sozinho)
  // - escolhe 3 melhores, mas sem colar demais (evita overlap)
  function melhorTrincaCentraisDinamica(){
    const base = timeline.slice(0, janela);
    if(base.length < 3) return null;

    // pool único
    const pool = [];
    const seen = new Set();
    trincasCentraisEntrada.flat().forEach(n=>{
      if(!seen.has(n)){
        seen.add(n);
        pool.push(n);
      }
    });

    // score por central
    const rank = pool.map(c=>{
      const s = new Set(vizinhos(c, coberturaNivel));
      let sc = 0;
      base.forEach(n => { if(s.has(n)) sc++; });
      return { c, sc };
    }).sort((a,b)=>b.sc - a.sc);

    // junção: pega 3 centrais com distância mínima (pra não virar “trinca colada”)
    const minDist = 6; // ajuste “casa”: evita overlap demais
    const escolhidos = [];
    for(const it of rank){
      const ok = escolhidos.every(x => distMin(x, it.c) >= minDist);
      if(ok){
        escolhidos.push(it.c);
        if(escolhidos.length === 3) break;
      }
    }

    // fallback: se não conseguir 3 por distância, completa com os próximos
    let i = 0;
    while(escolhidos.length < 3 && i < rank.length){
      const c = rank[i].c;
      if(!escolhidos.includes(c)) escolhidos.push(c);
      i++;
    }

    if(escolhidos.length < 3) return null;

    // score final por cobertura da trinca montada
    const trinca = escolhidos;
    const scFinal = scoreCobertura(trinca, base);

    return { tipo:"C", trinca, score: scFinal };
  }

  // ================= PAR 1 (mantido) =================
  function melhorParTimeline(){
    const base = timeline.slice(0, janela);
    let best=null;

    for(let a=0;a<10;a++){
      for(let b=a+1;b<10;b++){
        let s=new Set();
        track.forEach(n=>{
          if(terminal(n)===a || terminal(n)===b) s.add(n);
        });
        let sc=0;
        base.forEach(n=>{ if(s.has(n)) sc++; });
        if(!best || sc>best.score){
          best={a,b,score:sc};
        }
      }
    }
    return best;
  }

  function trincaVinculadaAoPar(par){
    if(!par) return null;

    const base = timeline.slice(0, janela);

    let numsPar = new Set();
    track.forEach(n=>{
      if(terminal(n)===par.a || terminal(n)===par.b){
        numsPar.add(n);
      }
    });

    let best=null;

    trincasParFixas.forEach(trinca=>{
      // cobertura restrita aos números do par
      let curto=new Set();
      trinca.forEach(c=>{
        vizinhos(c, coberturaNivel).forEach(n=>{
          if(numsPar.has(n)) curto.add(n);
        });
      });

      let sc=0;
      base.forEach(n=>{ if(curto.has(n)) sc++; });

      if(!best || sc > best.score){
        best = { trinca, score: sc };
      }
    });

    return best;
  }

  // ================= MOTOR (CASA) COM WIN/LOSS REAL =================
  // Regras implementadas:
  // 1) padrão precisa existir (score mínimo)
  // 2) exige quebra antes de liberar entrada
  // 3) retorna 1ª ou 2ª (máx 2 tentativas)
  // 4) cancela se falhar 2 tentativas
  //
  // OBS: o motor só evolui quando existe APOSTA REAL (sinal) e entra um novo número.

  function getState(key){
    if(!motor.estados[key]){
      motor.estados[key] = {
        fase: "observando", // observando -> em_ciclo -> quebrou -> retorno1 -> retorno2 -> cancelado
        tentativas: 0,
        wins: 0,
        losses: 0,
        streak: 0
      };
    }
    return motor.estados[key];
  }

  function scoreMinimo(jan){
    // “casa”: exige presença mínima no recorte
    // 3->1, 4->2, 5->2, 6->2
    if(jan <= 3) return 1;
    return 2;
  }

  function podeVirarCandidato(cand){
    const base = timeline.slice(0, janela);
    const min = scoreMinimo(janela);
    return cand && cand.score >= min && base.length >= janela;
  }

  function registrarResultadoAposta(novoNumero){
    if(!motor.ultimaAposta) return;

    const { key, setCobertura } = motor.ultimaAposta;
    const st = getState(key);

    const win = setCobertura.has(novoNumero);

    if(win){
      st.wins++;
      st.streak++;
      st.losses = st.losses; // mantém
      // vitória “zera” retorno e volta para ciclo vivo
      st.fase = "em_ciclo";
      st.tentativas = 0;
    }else{
      st.losses++;
      st.streak = 0;

      // se estava em ciclo e perdeu → QUEBRA
      if(st.fase === "em_ciclo"){
        st.fase = "quebrou";
        st.tentativas = 0;
      }else if(st.fase === "retorno1"){
        st.fase = "retorno2";
        st.tentativas = 2;
      }else if(st.fase === "retorno2"){
        st.fase = "cancelado";
      }else if(st.fase === "quebrou"){
        // perdeu sem ter apostado? não entra aqui porque só registramos quando há aposta
      }else{
        // observando/cancelado: não muda por perda
      }
    }

    motor.ultimaAposta = null; // aposta consumida
  }

  function validarParaEntrar(key, cand){
    const st = getState(key);

    // ativação inicial: se o padrão existe de verdade, marca ciclo vivo
    if(st.fase === "observando"){
      st.fase = "em_ciclo";
      return { ok:false, motivo:"ciclo_iniciando" };
    }

    if(st.fase === "cancelado"){
      return { ok:false, motivo:"cancelado" };
    }

    // casa: só libera entrada DEPOIS da quebra
    if(st.fase === "quebrou"){
      st.fase = "retorno1";
      st.tentativas = 1;
      return { ok:true, retorno:1 };
    }

    if(st.fase === "retorno1"){
      // ainda pode tentar (se já virou retorno1 e não deu, vai virar retorno2 no registro)
      return { ok:true, retorno:1 };
    }

    if(st.fase === "retorno2"){
      return { ok:true, retorno:2 };
    }

    // em_ciclo: não entra (aguarda quebra)
    return { ok:false, motivo:"aguardar_quebra" };
  }

  function decidirSinal(){
    // candidatos
    const t = melhorTrincaTiming();
    const c = melhorTrincaCentraisDinamica();

    // filtra por existência (score mínimo)
    const candT = podeVirarCandidato(t) ? t : null;
    const candC = podeVirarCandidato(c) ? c : null;

    // valida pelo mesmo motor
    const jogaveis = [];

    if(candT){
      const key = "T|" + candT.trinca.join("-");
      const v = validarParaEntrar(key, candT);
      if(v.ok){
        jogaveis.push({ ...candT, key, retorno: v.retorno });
      }
    }

    if(candC){
      const key = "C|" + candC.trinca.join("-");
      const v = validarParaEntrar(key, candC);
      if(v.ok){
        jogaveis.push({ ...candC, key, retorno: v.retorno });
      }
    }

    if(!jogaveis.length) return null;

    // critério simples e “casa”: maior score de presença no recorte
    jogaveis.sort((a,b)=>b.score - a.score);
    return jogaveis[0];
  }

  // ================= UI (MESMA ESTRUTURA) =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML=`
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Timing + Centrais (Motor Único)</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Cole histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff;border:1px solid #555"/>
        <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>

          Timing:
          <select id="jan">
            <option>3</option><option>4</option><option>5</option><option selected>6</option>
          </select>

          Cobertura:
          <select id="cov">
            <option>1</option><option selected>2</option><option>3</option><option>4</option>
          </select>
        </div>
      </div>

      <div>🕒 Linha do tempo (14): <span id="tl"></span></div>

      <div style="border:2px solid #0f0;padding:10px;margin:8px 0">
        🚦 <b>SINAL</b><br>
        <span id="sinal">⛔ SEM ENTRADA</span>
      </div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🎯 <b>Trinca do Timing (leitura)</b><br>
        <span id="timingBox">-</span>
      </div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🧩 <b>Trinca de Centrais (dinâmica por junção)</b><br>
        <span id="centraisBox">-</span>
      </div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🔗 <b>Par 1</b><br>
        <span id="par1">-</span><br>
        <small id="trincaPar">-</small>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  document.getElementById("jan").onchange=e=>{ janela=parseInt(e.target.value,10); render(); };
  document.getElementById("cov").onchange=e=>{ coberturaNivel=parseInt(e.target.value,10); render(); };

  const nums=document.getElementById("nums");
  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff;border:1px solid #555";
    b.onclick=()=>add(n);
    nums.appendChild(b);
  }

  function add(n){
    // 1) se existia aposta anterior, registra win/loss com o número novo
    registrarResultadoAposta(n);

    // 2) atualiza histórico + timeline (último à esquerda)
    hist.push(n);
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();

    render();
  }

  document.getElementById("col").onclick=()=>{
    document.getElementById("inp").value
      .split(/[\s,]+/)
      .map(Number)
      .filter(n=>n>=0&&n<=36)
      .forEach(add);
    document.getElementById("inp").value="";
  };

  document.getElementById("lim").onclick=()=>{
    hist=[]; timeline=[];
    motor.estados = {};
    motor.ultimaAposta = null;
    render();
  };

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");

    // caixas de leitura
    const t = melhorTrincaTiming();
    document.getElementById("timingBox").textContent = t ? `${t.trinca.join("-")} | score ${t.score}` : "-";

    const c = melhorTrincaCentraisDinamica();
    document.getElementById("centraisBox").textContent = c ? `${c.trinca.join("-")} | score ${c.score}` : "-";

    // par + trinca vinculada
    const p = melhorParTimeline();
    document.getElementById("par1").textContent = p ? `Par 1: T${p.a}·T${p.b} (${p.score})` : "-";
    const tv = trincaVinculadaAoPar(p);
    document.getElementById("trincaPar").textContent = tv ? `Trinca vinculada ao par: ${tv.trinca.join("-")} (${tv.score})` : "-";

    // sinal (motor único)
    const s = decidirSinal();
    if(!s){
      document.getElementById("sinal").textContent = "⛔ SEM ENTRADA (aguardar quebra/retorno)";
      return;
    }

    // arma a aposta (será validada no próximo número inserido)
    motor.ultimaAposta = {
      key: s.key,
      setCobertura: makeSetCobertura(s.trinca),
      label: (s.tipo === "T" ? "TIMING" : "CENTRAIS")
    };

    document.getElementById("sinal").textContent =
      `🎯 JOGAR AGORA → ${s.trinca.join("-")} (retorno ${s.retorno})`;
  }

  render();

})();
