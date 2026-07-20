(function () {

  // ================= CONFIGURAÇÃO =================

  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const terminal = n => n % 10;

  const STORAGE_KEY = "CSM_MELHOR_PAR_HISTORICO_V2";

  // ================= PARES FIXOS =================

  const paresFixos = [
    [1,5],
    [3,9],
    [4,8],
    [0,7],
    [6,2],
    [3,2]
  ];

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

  const numerosVermelhos = new Set([
    1,3,5,7,9,12,14,16,18,
    19,21,23,25,27,30,32,34,36
  ]);

  // ================= ESTADO =================

  let historico = carregarHistorico();
  let proximoHorario = calcularProximoHorario();

  // ================= HORÁRIO =================

  function doisDigitos(valor){
    return String(valor).padStart(2,"0");
  }

  function horarioAtual(){
    const agora = new Date();

    return {
      horas: agora.getHours(),
      minutos: agora.getMinutes()
    };
  }

  function horarioParaMinutos(horario){

    if(!horario || !/^\d{2}:\d{2}$/.test(horario)){

      const atual = horarioAtual();

      return atual.horas * 60 + atual.minutos;
    }

    const partes = horario
      .split(":")
      .map(Number);

    return partes[0] * 60 + partes[1];
  }

  function minutosParaHorario(total){

    total = ((total % 1440) + 1440) % 1440;

    const horas = Math.floor(total / 60);
    const minutos = total % 60;

    return `${doisDigitos(horas)}:${doisDigitos(minutos)}`;
  }

  function somarMinutos(horario, quantidade){

    return minutosParaHorario(
      horarioParaMinutos(horario) + quantidade
    );
  }

  function calcularProximoHorario(){

    if(historico.length > 0){

      return somarMinutos(
        historico[0].horario,
        1
      );
    }

    const atual = horarioAtual();

    return `${doisDigitos(atual.horas)}:${doisDigitos(atual.minutos)}`;
  }

  // ================= ARMAZENAMENTO =================

  function carregarHistorico(){

    try{

      const salvo =
        localStorage.getItem(STORAGE_KEY);

      if(!salvo){
        return [];
      }

      const dados =
        JSON.parse(salvo);

      if(!Array.isArray(dados)){
        return [];
      }

      return dados.filter(item =>
        item &&
        Number.isInteger(item.numero) &&
        item.numero >= 0 &&
        item.numero <= 36 &&
        typeof item.horario === "string"
      );

    }catch(erro){

      return [];
    }
  }

  function salvarHistorico(){

    try{

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(historico)
      );

    }catch(erro){

      console.error(
        "Não foi possível salvar o histórico.",
        erro
      );
    }
  }

  // ================= VIZINHOS =================

  function vizinhos1(numero){

    const indice =
      track.indexOf(numero);

    return [
      track[(indice + 36) % 37],
      numero,
      track[(indice + 1) % 37]
    ];
  }

  function coberturaDoPar(par){

    const cobertura =
      new Set();

    par.forEach(t => {

      track.forEach(numero => {

        if(terminal(numero) === t){

          vizinhos1(numero)
            .forEach(vizinho => {
              cobertura.add(vizinho);
            });
        }
      });
    });

    return cobertura;
  }

  // ================= ANÁLISE =================

  function analisarPar(par){

    const cobertura =
      coberturaDoPar(par);

    const acertos = [];
    const quebras = [];

    historico.forEach(item => {

      if(cobertura.has(item.numero)){

        acertos.push(item);

      }else{

        quebras.push(item);

      }
    });

    const total =
      historico.length;

    const percentual =
      total > 0
        ? (acertos.length / total) * 100
        : 0;

    return {
      par,
      cobertura,
      acertos,
      quebras,
      total,
      percentual
    };
  }

  // ================= MELHOR ENTRE OS PARES FIXOS =================

  function encontrarMelhorPar(){

    let melhor = null;

    paresFixos.forEach(par => {

      const analise =
        analisarPar(par);

      if(
        !melhor ||

        analise.percentual >
        melhor.percentual ||

        (
          analise.percentual ===
          melhor.percentual &&

          analise.acertos.length >
          melhor.acertos.length
        ) ||

        (
          analise.percentual ===
          melhor.percentual &&

          analise.acertos.length ===
          melhor.acertos.length &&

          analise.quebras.length <
          melhor.quebras.length
        )
      ){

        melhor = analise;
      }
    });

    return melhor ||
      analisarPar(paresFixos[0]);
  }

  // ================= INSERÇÃO =================

  function adicionarNumero(numero){

    historico.unshift({
      numero:numero,
      horario:proximoHorario
    });

    proximoHorario =
      somarMinutos(
        proximoHorario,
        1
      );

    salvarHistorico();

    render();
  }

  function apagarUltimo(){

    if(!historico.length){
      return;
    }

    historico.shift();

    proximoHorario =
      calcularProximoHorario();

    salvarHistorico();

    render();
  }

  function apagarTudo(){

    const confirmar =
      window.confirm(
        "Apagar todo o histórico armazenado?"
      );

    if(!confirmar){
      return;
    }

    historico = [];

    proximoHorario =
      calcularProximoHorario();

    salvarHistorico();

    render();
  }

  // ================= COR ROLETA =================

  function corNumeroRoleta(numero){

    if(numero === 0){

      return {
        fundo:"#f5f5f5",
        texto:"#8d1431"
      };
    }

    if(numerosVermelhos.has(numero)){

      return {
        fundo:"#ef3852",
        texto:"#ffffff"
      };
    }

    return {
      fundo:"#262223",
      texto:"#ffffff"
    };
  }

  // ================= INTERFACE =================

  document.body.style.margin = "0";
  document.body.style.background = "#111";
  document.body.style.color = "#fff";
  document.body.style.fontFamily = "Arial, sans-serif";

  document.body.innerHTML = `

    <style>

      *{
        box-sizing:border-box;
      }

      button,
      input{
        font-family:Arial,sans-serif;
      }

      button{
        cursor:pointer;
        touch-action:manipulation;
      }

      .csm-container{
        width:100%;
        max-width:1100px;
        margin:auto;
        padding:12px;
      }

      .csm-painel{
        background:#1d1d1f;
        border:1px solid #444;
        border-radius:10px;
        padding:10px;
        margin-bottom:10px;
      }

      .csm-resumo{
        display:grid;
        grid-template-columns:repeat(4,1fr);
        gap:8px;
      }

      .csm-card{
        min-height:90px;
        background:#272729;
        border:1px solid #414145;
        border-radius:9px;
        padding:9px;
      }

      .csm-label{
        color:#aaa;
        font-size:12px;
        margin-bottom:6px;
      }

      .csm-valor{
        font-size:22px;
        font-weight:900;
      }

      .csm-terminal{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-width:50px;
        height:42px;
        margin-right:6px;
        border-radius:8px;
        color:#fff;
        font-size:20px;
        font-weight:900;
        border:2px solid rgba(255,255,255,.6);
      }

      .csm-barra{
        height:12px;
        border-radius:8px;
        background:#3a3a3a;
        overflow:hidden;
        margin-top:8px;
      }

      .csm-barra-interna{
        height:100%;
        width:0;
        background:linear-gradient(
          90deg,
          #00e5ff,
          #00e676
        );
      }

      .csm-horario{
        display:flex;
        align-items:center;
        gap:10px;
        flex-wrap:wrap;
      }

      .csm-horario-atual{
        font-size:30px;
        font-weight:900;
        color:#00e5ff;
      }

      .csm-time-input{
        padding:8px;
        background:#222;
        color:#fff;
        border:1px solid #555;
        border-radius:7px;
        font-size:18px;
        font-weight:900;
      }

      .csm-btn{
        padding:9px 12px;
        border:1px solid #555;
        border-radius:7px;
        background:#333;
        color:#fff;
        font-weight:800;
      }

      .csm-btn-vermelho{
        background:#70242d;
      }

      .csm-pares-fixos{
        display:flex;
        flex-wrap:wrap;
        gap:7px;
      }

      .csm-par-fixo{
        padding:6px 9px;
        border-radius:7px;
        background:#292929;
        border:1px solid #555;
        font-weight:900;
      }

      .csm-par-fixo-ativo{
        border:2px solid #00e676;
        box-shadow:0 0 10px rgba(0,230,118,.55);
      }

      .csm-teclado{
        display:grid;
        grid-template-columns:repeat(9,1fr);
        gap:6px;
      }

      .csm-numero-btn{
        min-height:42px;
        border:1px solid #555;
        border-radius:7px;
        color:#fff;
        font-size:16px;
        font-weight:900;
      }

      .csm-timeline{
        font-size:18px;
        font-weight:800;
        line-height:1.9;
        word-break:break-word;
      }

      .csm-historico{
        display:grid;
        grid-template-columns:repeat(6,1fr);
        gap:10px;
      }

      .csm-historico-item{
        text-align:center;
      }

      .csm-historico-numero{
        height:76px;
        display:flex;
        align-items:center;
        justify-content:center;
        position:relative;
        border-radius:9px;
        font-size:22px;
        font-weight:900;
        border:2px solid #555;
      }

      .csm-historico-numero:after{
        content:"";
        position:absolute;
        width:42px;
        height:42px;
        border-radius:50%;
        border:4px solid currentColor;
      }

      .csm-historico-numero span{
        position:relative;
        z-index:2;
      }

      .csm-acerto{
        box-shadow:
          0 0 0 3px #00e676,
          0 0 15px rgba(0,230,118,.6);
      }

      .csm-quebra{
        box-shadow:
          0 0 0 3px #ff5252,
          0 0 15px rgba(255,82,82,.55);
      }

      .csm-historico-hora{
        margin-top:5px;
        font-size:13px;
        font-weight:800;
      }

      .csm-quebras{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        margin-top:8px;
      }

      .csm-quebra-chip{
        padding:6px 8px;
        background:#5d222b;
        border:1px solid #a84d5a;
        border-radius:7px;
        font-size:13px;
        font-weight:900;
      }

      @media(max-width:750px){

        .csm-resumo{
          grid-template-columns:repeat(2,1fr);
        }

        .csm-historico{
          grid-template-columns:repeat(4,1fr);
        }

        .csm-teclado{
          grid-template-columns:repeat(6,1fr);
        }

        .csm-historico-numero{
          height:65px;
        }

      }

    </style>

    <div class="csm-container">

      <h2 style="
        text-align:center;
        margin:4px 0 12px">
        CSM — Pares Fixos + 1 Vizinho
      </h2>

      <div class="csm-painel">

        <div class="csm-horario">

          <div>

            <div class="csm-label">
              Horário do próximo número
            </div>

            <div
              id="csmProximoHorario"
              class="csm-horario-atual">
              --:--
            </div>

          </div>

          <div>

            <div class="csm-label">
              Ajustar horário
            </div>

            <input
              id="csmHorarioInput"
              class="csm-time-input"
              type="time"
              step="60">

          </div>

          <button
            id="csmMenosMinuto"
            class="csm-btn">
            −1 minuto
          </button>

          <button
            id="csmMaisMinuto"
            class="csm-btn">
            +1 minuto
          </button>

          <button
            id="csmApagarUltimo"
            class="csm-btn">
            Apagar último
          </button>

          <button
            id="csmApagarTudo"
            class="csm-btn csm-btn-vermelho">
            Apagar tudo
          </button>

        </div>

      </div>

      <div class="csm-painel">

        <b>Pares fixos analisados</b>

        <div
          id="csmParesFixos"
          class="csm-pares-fixos"
          style="margin-top:8px">
        </div>

      </div>

      <div class="csm-painel">

        <div class="csm-resumo">

          <div class="csm-card">

            <div class="csm-label">
              Melhor par fixo
            </div>

            <div id="csmMelhorPar"></div>

          </div>

          <div class="csm-card">

            <div class="csm-label">
              Percentual com 1 vizinho
            </div>

            <div
              id="csmPercentual"
              class="csm-valor">
              0%
            </div>

            <div class="csm-barra">

              <div
                id="csmBarra"
                class="csm-barra-interna">
              </div>

            </div>

          </div>

          <div class="csm-card">

            <div class="csm-label">
              Acertos
            </div>

            <div
              id="csmAcertos"
              class="csm-valor">
              0 / 0
            </div>

          </div>

          <div class="csm-card">

            <div class="csm-label">
              Última quebra
            </div>

            <div
              id="csmUltimaQuebra"
              class="csm-valor">
              —
            </div>

          </div>

        </div>

      </div>

      <div class="csm-painel">

        <b>
          Onde aconteceram as quebras
        </b>

        <div
          id="csmListaQuebras"
          class="csm-quebras">
        </div>

      </div>

      <div class="csm-painel">

        <b>
          Timeline analisada
        </b>

        <div
          id="csmTimeline"
          class="csm-timeline">
        </div>

      </div>

      <div class="csm-painel">

        <b>
          Teclado 0–36
        </b>

        <div style="
          color:#aaa;
          font-size:12px;
          margin:5px 0 9px">

          Clique no número.
          Ele será armazenado com o horário acima.

        </div>

        <div
          id="csmTeclado"
          class="csm-teclado">
        </div>

      </div>

      <div class="csm-painel">

        <b>
          Histórico armazenado
        </b>

        <div
          id="csmHistorico"
          class="csm-historico"
          style="margin-top:10px">
        </div>

      </div>

    </div>
  `;

  // ================= ELEMENTOS =================

  const elementoProximoHorario =
    document.getElementById(
      "csmProximoHorario"
    );

  const elementoHorarioInput =
    document.getElementById(
      "csmHorarioInput"
    );

  const elementoParesFixos =
    document.getElementById(
      "csmParesFixos"
    );

  const elementoMelhorPar =
    document.getElementById(
      "csmMelhorPar"
    );

  const elementoPercentual =
    document.getElementById(
      "csmPercentual"
    );

  const elementoBarra =
    document.getElementById(
      "csmBarra"
    );

  const elementoAcertos =
    document.getElementById(
      "csmAcertos"
    );

  const elementoUltimaQuebra =
    document.getElementById(
      "csmUltimaQuebra"
    );

  const elementoListaQuebras =
    document.getElementById(
      "csmListaQuebras"
    );

  const elementoTimeline =
    document.getElementById(
      "csmTimeline"
    );

  const elementoHistorico =
    document.getElementById(
      "csmHistorico"
    );

  const elementoTeclado =
    document.getElementById(
      "csmTeclado"
    );

  // ================= TECLADO =================

  for(
    let numero = 0;
    numero <= 36;
    numero++
  ){

    const cores =
      corNumeroRoleta(numero);

    const botao =
      document.createElement(
        "button"
      );

    botao.className =
      "csm-numero-btn";

    botao.textContent =
      numero;

    botao.style.background =
      cores.fundo;

    botao.style.color =
      cores.texto;

    botao.onclick = () => {

      adicionarNumero(
        numero
      );

    };

    elementoTeclado
      .appendChild(botao);
  }

  // ================= EVENTOS =================

  document
    .getElementById(
      "csmMenosMinuto"
    )
    .onclick = () => {

      proximoHorario =
        somarMinutos(
          proximoHorario,
          -1
        );

      render();

    };

  document
    .getElementById(
      "csmMaisMinuto"
    )
    .onclick = () => {

      proximoHorario =
        somarMinutos(
          proximoHorario,
          1
        );

      render();

    };

  document
    .getElementById(
      "csmApagarUltimo"
    )
    .onclick =
      apagarUltimo;

  document
    .getElementById(
      "csmApagarTudo"
    )
    .onclick =
      apagarTudo;

  elementoHorarioInput
    .onchange =
      event => {

        if(
          event.target.value
        ){

          proximoHorario =
            event.target.value;

          render();
        }

      };

  // ================= RENDER =================

  function render(){

    const melhor =
      encontrarMelhorPar();

    elementoProximoHorario
      .textContent =
        proximoHorario;

    elementoHorarioInput
      .value =
        proximoHorario;

    // ===== PARES FIXOS =====

    elementoParesFixos
      .innerHTML =
        paresFixos
          .map(par => {

            const analise =
              analisarPar(par);

            const ativo =
              par[0] ===
                melhor.par[0] &&
              par[1] ===
                melhor.par[1];

            return `
              <div
                class="
                  csm-par-fixo
                  ${
                    ativo
                      ? "csm-par-fixo-ativo"
                      : ""
                  }
                "
              >

                <span style="
                  color:${corTerminal[par[0]]}
                ">
                  T${par[0]}
                </span>

                +

                <span style="
                  color:${corTerminal[par[1]]}
                ">
                  T${par[1]}
                </span>

                &nbsp;

                ${Math.round(
                  analise.percentual
                )}%

              </div>
            `;

          })
          .join("");

    // ===== MELHOR PAR =====

    elementoMelhorPar
      .innerHTML =
        melhor.par
          .map(t => `
            <span
              class="csm-terminal"
              style="
                background:
                ${corTerminal[t]}
              "
            >
              T${t}
            </span>
          `)
          .join("");

    const percentualArredondado =
      Math.round(
        melhor.percentual
      );

    elementoPercentual
      .textContent =
        percentualArredondado +
        "%";

    elementoBarra
      .style.width =
        percentualArredondado +
        "%";

    elementoAcertos
      .textContent =
        `${
          melhor.acertos.length
        } / ${
          melhor.total
        }`;

    // ===== ÚLTIMA QUEBRA =====

    if(
      melhor.quebras.length >
      0
    ){

      const ultimaQuebra =
        melhor.quebras[0];

      elementoUltimaQuebra
        .innerHTML = `

          ${ultimaQuebra.numero}

          <div style="
            font-size:12px;
            color:#aaa;
            margin-top:3px
          ">
            ${ultimaQuebra.horario}
          </div>
        `;

    }else{

      elementoUltimaQuebra
        .textContent =
          "—";

    }

    // ===== LISTA QUEBRAS =====

    if(
      melhor.quebras.length >
      0
    ){

      elementoListaQuebras
        .innerHTML =
          melhor.quebras
            .map(item => `

              <span
                class="csm-quebra-chip"
              >

                ${item.numero}
                ·
                ${item.horario}

              </span>

            `)
            .join("");

    }else{

      elementoListaQuebras
        .innerHTML = `

          <span style="
            color:#00e676;
            font-weight:900
          ">

            Sem quebra no
            histórico atual

          </span>

        `;

    }

    // ===== TIMELINE =====

    elementoTimeline
      .innerHTML =
        historico
          .map(item => {

            const acertou =
              melhor
                .cobertura
                .has(
                  item.numero
                );

            return `

              <span style="
                display:inline-block;
                margin-right:5px;
                color:${
                  acertou
                    ? "#00e676"
                    : "#ff5252"
                }
              ">

                ${item.numero}

              </span>

            `;

          })
          .join("");

    // ===== HISTÓRICO =====

    elementoHistorico
      .innerHTML =
        historico
          .map(item => {

            const cores =
              corNumeroRoleta(
                item.numero
              );

            const acertou =
              melhor
                .cobertura
                .has(
                  item.numero
                );

            return `

              <div
                class="
                  csm-historico-item
                "
              >

                <div
                  class="
                    csm-historico-numero
                    ${
                      acertou
                        ? "csm-acerto"
                        : "csm-quebra"
                    }
                  "
                  style="
                    background:
                    ${cores.fundo};

                    color:
                    ${cores.texto};
                  "
                >

                  <span>
                    ${item.numero}
                  </span>

                </div>

                <div
                  class="
                    csm-historico-hora
                  "
                >

                  ${item.horario}

                </div>

              </div>

            `;

          })
          .join("");

  }

  render();

})();
