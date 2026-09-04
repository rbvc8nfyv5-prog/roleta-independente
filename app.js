(function () {

  "use strict";

  // =========================================================
  // CONFIGURAÇÃO
  // =========================================================

  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const TAMANHO_JANELA = 14;

  const STORAGE_KEY =
    "ANALISADOR_EXCLUSIVO_069_1V_V1";

  const TERMINAIS_ANALISADOS = [
    0,6,9
  ];

  const numerosVermelhos = new Set([
    1,3,5,7,9,
    12,14,16,18,
    19,21,23,25,27,
    30,32,34,36
  ]);


  // =========================================================
  // REGIÕES
  // =========================================================

  const regioesRoleta = {

    ZERO: new Set([
      0,32,15,26,3,35,12
    ]),

    VOISINS: new Set([
      19,4,21,2,25,
      28,7,29,18,22
    ]),

    ORPHELINS: new Set([
      9,31,14,20,1,17,6,34
    ]),

    TIERS: new Set([
      27,13,36,11,30,8,
      23,10,5,24,16,33
    ])

  };


  const coresRegioes = {

    ZERO:"#9bea2c",

    VOISINS:"#8a20d4",

    ORPHELINS:"#176436",

    TIERS:"#29499b"

  };


  // =========================================================
  // CORES DOS TERMINAIS 0 / 6 / 9
  // =========================================================

  const coresTerminais = {

    0:"#00c853",

    6:"#ffc107",

    9:"#2196f3"

  };


  let historico =
    carregarHistorico();


  // =========================================================
  // TERMINAL
  // =========================================================

  function terminal(numero){

    return numero % 10;
  }


  // =========================================================
  // STORAGE
  // =========================================================

  function carregarHistorico(){

    try{

      const salvo =
        localStorage.getItem(
          STORAGE_KEY
        );

      if(!salvo){
        return [];
      }


      const dados =
        JSON.parse(salvo);


      if(!Array.isArray(dados)){
        return [];
      }


      return dados
        .map(Number)
        .filter(numero =>
          Number.isInteger(numero) &&
          numero >= 0 &&
          numero <= 36
        )
        .slice(-300);

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
        "Erro ao salvar histórico.",
        erro
      );
    }
  }


  // =========================================================
  // VIZINHOS NA RACE
  // =========================================================

  function vizinhos(
    numero,
    quantidade = 1
  ){

    const indice =
      track.indexOf(numero);


    if(indice === -1){
      return [];
    }


    const resultado =
      [numero];


    for(
      let distancia = 1;
      distancia <= quantidade;
      distancia++
    ){

      resultado.push(

        track[
          (
            indice -
            distancia +
            track.length
          ) %
          track.length
        ]

      );


      resultado.push(

        track[
          (
            indice +
            distancia
          ) %
          track.length
        ]

      );

    }


    return resultado;
  }


  // =========================================================
  // COBERTURA DE UM TERMINAL COM 1 VIZINHO
  // =========================================================

  function coberturaTerminal1V(
    numeroTerminal
  ){

    const cobertura =
      new Set();


    track.forEach(numero => {

      if(
        terminal(numero) ===
        numeroTerminal
      ){

        vizinhos(numero,1)
          .forEach(numeroCoberto => {

            cobertura.add(
              numeroCoberto
            );

          });

      }

    });


    return cobertura;
  }


  // =========================================================
  // COBERTURAS FIXAS 0 / 6 / 9
  // =========================================================

  const coberturas069 = {

    0:coberturaTerminal1V(0),

    6:coberturaTerminal1V(6),

    9:coberturaTerminal1V(9)

  };


  // =========================================================
  // QUAL TERMINAL O NÚMERO BATE
  // =========================================================

  function terminaisQueBatem(
    numero
  ){

    const resultado = [];


    TERMINAIS_ANALISADOS
      .forEach(t => {

        if(
          coberturas069[t]
            .has(numero)
        ){

          resultado.push(t);

        }

      });


    return resultado;
  }


  // =========================================================
  // REGIÃO
  // =========================================================

  function regiaoDoNumero(
    numero
  ){

    if(
      regioesRoleta.ZERO.has(numero)
    ){
      return "ZERO";
    }


    if(
      regioesRoleta.VOISINS.has(numero)
    ){
      return "VOISINS";
    }


    if(
      regioesRoleta.ORPHELINS.has(numero)
    ){
      return "ORPHELINS";
    }


    if(
      regioesRoleta.TIERS.has(numero)
    ){
      return "TIERS";
    }


    return null;
  }


  // =========================================================
  // ANÁLISE DOS ÚLTIMOS 14
  // =========================================================

  function analisarJanela14(){

    const janela =
      historico.slice(
        -TAMANHO_JANELA
      );


    const sequenciaBatidas =
      janela.map(numero => {

        return {

          numero,

          terminais:
            terminaisQueBatem(
              numero
            )

        };

      });


    const contagem = {

      0:0,
      6:0,
      9:0

    };


    sequenciaBatidas
      .forEach(item => {

        item.terminais
          .forEach(t => {

            contagem[t]++;

          });

      });


    const numerosSemBatida =
      sequenciaBatidas
        .filter(item =>
          item.terminais.length === 0
        )
        .length;


    const numerosComBatida =
      sequenciaBatidas.length -
      numerosSemBatida;


    return {

      janela,

      sequenciaBatidas,

      contagem,

      numerosComBatida,

      numerosSemBatida

    };
  }


  // =========================================================
  // EXTRAÇÃO DO HISTÓRICO
  // =========================================================

  function extrairNumeros(
    texto
  ){

    const encontrados =
      texto.match(
        /\b(?:[0-9]|[12][0-9]|3[0-6])\b/g
      );


    if(!encontrados){
      return [];
    }


    return encontrados
      .map(Number)
      .filter(numero =>
        numero >= 0 &&
        numero <= 36
      )
      .slice(-300);
  }


  // =========================================================
  // INSERIR HISTÓRICO
  // =========================================================

  function inserirHistorico(){

    const entrada =
      document.getElementById(
        "entradaHistorico"
      );


    const numeros =
      extrairNumeros(
        entrada.value
      );


    if(!numeros.length){

      statusArea.textContent =
        "Nenhum número válido encontrado.";

      statusArea.style.color =
        "#ff5252";

      return;
    }


    historico =
      numeros.slice(-300);


    salvarHistorico();


    entrada.value = "";


    statusArea.textContent =
      `${historico.length} números carregados.`;


    statusArea.style.color =
      "#00e676";


    render();
  }


  // =========================================================
  // ADICIONAR NÚMERO
  // =========================================================

  function adicionarNumero(
    numero
  ){

    historico.push(numero);


    if(
      historico.length > 300
    ){

      historico.shift();
    }


    salvarHistorico();


    statusArea.textContent =
      `Número ${numero} inserido.`;


    statusArea.style.color =
      "#00e5ff";


    render();
  }


  // =========================================================
  // APAGAR ÚLTIMO
  // =========================================================

  function apagarUltimo(){

    if(!historico.length){
      return;
    }


    const apagado =
      historico.pop();


    salvarHistorico();


    statusArea.textContent =
      `Número ${apagado} apagado.`;


    statusArea.style.color =
      "#ffc107";


    render();
  }


  // =========================================================
  // APAGAR TUDO
  // =========================================================

  function apagarTudo(){

    const confirmar =
      window.confirm(
        "Apagar todo o histórico?"
      );


    if(!confirmar){
      return;
    }


    historico = [];


    salvarHistorico();


    statusArea.textContent =
      "Histórico apagado.";


    statusArea.style.color =
      "#ff5252";


    render();
  }


  // =========================================================
  // COR NORMAL DA ROLETA
  // =========================================================

  function corNumeroRoleta(
    numero
  ){

    if(numero === 0){

      return {

        fundo:"#087c48",
        texto:"#ffffff"

      };
    }


    if(
      numerosVermelhos.has(
        numero
      )
    ){

      return {

        fundo:"#c6283d",
        texto:"#ffffff"

      };
    }


    return {

      fundo:"#181818",
      texto:"#ffffff"

    };
  }


  // =========================================================
  // INTERFACE
  // =========================================================

  document.body.style.margin =
    "0";

  document.body.style.background =
    "#101010";

  document.body.style.color =
    "#ffffff";

  document.body.style.fontFamily =
    "Arial,sans-serif";


  document.body.innerHTML = `

  <style>

    *{
      box-sizing:border-box;
    }

    button,
    textarea{
      font-family:Arial,sans-serif;
    }

    button{
      cursor:pointer;
      touch-action:manipulation;
    }


    .app{
      width:100%;
      max-width:850px;
      margin:auto;
      padding:8px;
    }


    h2{
      text-align:center;
      margin:5px 0 10px;
      font-size:22px;
    }


    .painel{
      background:#1d1d1f;
      border:1px solid #444;
      border-radius:10px;
      padding:9px;
      margin-bottom:8px;
    }


    .tituloPainel{
      color:#aaa;
      font-size:12px;
      font-weight:900;
      margin-bottom:7px;
    }


    textarea{
      width:100%;
      min-height:72px;
      padding:8px;
      background:#111;
      color:#fff;
      border:1px solid #555;
      border-radius:7px;
      font-size:14px;
    }


    .acoes{
      display:flex;
      gap:6px;
      flex-wrap:wrap;
      margin-top:7px;
    }


    .btn{
      padding:8px 11px;
      background:#333;
      color:#fff;
      border:1px solid #555;
      border-radius:7px;
      font-weight:900;
    }


    .verde{
      background:#146238;
    }


    .vermelho{
      background:#762832;
    }


    .status{
      margin-top:7px;
      color:#aaa;
      font-size:12px;
      font-weight:900;
    }


    /* =====================================================
       RESUMO 0 6 9
    ===================================================== */


    .resumo069{
      display:grid;
      grid-template-columns:
        repeat(3,1fr);
      gap:6px;
    }


    .card069{
      padding:8px;
      border:1px solid #444;
      border-radius:8px;
      background:#111;
      text-align:center;
    }


    .titulo069{
      font-size:18px;
      font-weight:900;
    }


    .valor069{
      margin-top:3px;
      font-size:14px;
      font-weight:900;
    }


    /* =====================================================
       JANELA 14
    ===================================================== */


    .janelaBloco{
      display:flex;
      flex-direction:column;
      gap:7px;
    }


    .linhaJanela{
      display:grid;
      grid-template-columns:
        90px minmax(0,1fr);
      gap:6px;
      align-items:center;
    }


    .rotuloLinha{
      color:#bbb;
      font-size:10px;
      font-weight:900;
      line-height:1.25;
    }


    .janelaScroll{
      display:flex;
      gap:5px;
      overflow-x:auto;
      padding-bottom:2px;
    }


    .numeroJanela{
      min-width:37px;
      height:37px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:50%;
      border:2px solid rgba(
        255,
        255,
        255,
        .75
      );
      color:#fff;
      font-size:14px;
      font-weight:900;
    }


    .numeroRegiao{
      min-width:37px;
      height:37px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:8px;
      border:2px solid rgba(
        255,
        255,
        255,
        .65
      );
      color:#fff;
      font-size:14px;
      font-weight:900;
    }


    /* =====================================================
       LINHA DE BATIDAS 0 / 6 / 9
    ===================================================== */


    .batidaBox{
      min-width:37px;
      height:37px;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:2px;
      border-radius:8px;
      background:#111;
      border:1px solid #555;
      padding:2px;
    }


    .batidaVazia{
      color:#555;
      font-size:15px;
      font-weight:900;
    }


    .tagTerminal{
      min-width:24px;
      height:28px;
      padding:0 4px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:6px;
      color:#fff;
      font-size:13px;
      font-weight:900;
    }


    .batidaDupla{
      border-color:#ffffff;
      box-shadow:
        0 0 7px rgba(
          255,
          255,
          255,
          .45
        );
    }


    /* =====================================================
       LEGENDAS
    ===================================================== */


    .legendaRegioes{
      display:flex;
      justify-content:center;
      gap:10px;
      flex-wrap:wrap;
      margin-top:8px;
      color:#aaa;
      font-size:10px;
    }


    .legendaItem{
      display:flex;
      align-items:center;
      gap:4px;
    }


    .legendaCor{
      width:11px;
      height:11px;
      border-radius:3px;
    }


    /* =====================================================
       TECLADO
    ===================================================== */


    .teclado{
      display:grid;
      grid-template-columns:
        repeat(6,1fr);
      gap:4px;
    }


    .numeroBtn{
      min-height:40px;
      border:1px solid #666;
      border-radius:7px;
      color:#fff;
      font-size:15px;
      font-weight:900;
    }


    .numeroBtn:active{
      transform:scale(.96);
    }


    .zeroBtn{
      grid-column:span 6;
    }


    /* =====================================================
       HISTÓRICO
    ===================================================== */


    .historico{
      display:flex;
      gap:4px;
      overflow-x:auto;
      min-height:34px;
    }


    .histNumero{
      min-width:31px;
      height:31px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:6px;
      border:1px solid #555;
      font-size:13px;
      font-weight:900;
    }


    .histNumero.janelaAtual{
      border:2px solid #00e5ff;
    }


    .histNumero.ultimo{
      box-shadow:
        0 0 8px #00e5ff;
    }


    @media(
      max-width:600px
    ){

      .app{
        padding:5px;
      }


      .painel{
        padding:7px;
      }


      .linhaJanela{
        grid-template-columns:
          64px minmax(0,1fr);
      }


      .rotuloLinha{
        font-size:9px;
      }


      .numeroJanela,
      .numeroRegiao,
      .batidaBox{
        min-width:34px;
        height:34px;
      }


      .tagTerminal{
        min-width:21px;
        height:25px;
        font-size:11px;
      }


      .teclado{
        gap:3px;
      }


      .numeroBtn{
        min-height:38px;
      }

    }

  </style>


  <main class="app">

    <h2>
      Análise 0 • 6 • 9
    </h2>


    <!-- ENTRADA -->

    <section class="painel">

      <textarea
        id="entradaHistorico"
        placeholder="Cole o histórico do mais antigo para o mais recente..."
      ></textarea>


      <div class="acoes">

        <button
          id="btnInserir"
          class="btn verde"
        >
          Inserir histórico
        </button>


        <button
          id="btnApagarUltimo"
          class="btn"
        >
          Apagar último
        </button>


        <button
          id="btnApagarTudo"
          class="btn vermelho"
        >
          Apagar tudo
        </button>

      </div>


      <div
        id="statusArea"
        class="status"
      >
        Cole o histórico ou use o teclado.
      </div>

    </section>


    <!-- RESUMO EXCLUSIVO 069 -->

    <section class="painel">

      <div class="tituloPainel">
        0 • 6 • 9 — 1 VIZINHO / ÚLTIMOS 14
      </div>


      <div class="resumo069">

        <div
          class="card069"
          style="
            border-color:#00c853
          "
        >

          <div class="titulo069">
            T0
          </div>

          <div
            id="qtdT0"
            class="valor069"
          >
            0
          </div>

        </div>


        <div
          class="card069"
          style="
            border-color:#ffc107
          "
        >

          <div class="titulo069">
            T6
          </div>

          <div
            id="qtdT6"
            class="valor069"
          >
            0
          </div>

        </div>


        <div
          class="card069"
          style="
            border-color:#2196f3
          "
        >

          <div class="titulo069">
            T9
          </div>

          <div
            id="qtdT9"
            class="valor069"
          >
            0
          </div>

        </div>

      </div>

    </section>


    <!-- ÚLTIMOS 14 -->

    <section class="painel">

      <div class="tituloPainel">

        ÚLTIMOS
        <span id="qtdJanela">
          0
        </span>
        /14

      </div>


      <div class="janelaBloco">


        <!-- LINHA 1 -->

        <div class="linhaJanela">

          <div class="rotuloLinha">
            PRETO /<br>
            VERMELHO
          </div>


          <div
            id="linhaCores"
            class="janelaScroll"
          ></div>

        </div>


        <!-- LINHA 2 -->

        <div class="linhaJanela">

          <div class="rotuloLinha">
            REGIÕES
          </div>


          <div
            id="linhaRegioes"
            class="janelaScroll"
          ></div>

        </div>


        <!-- LINHA 3 -->

        <div class="linhaJanela">

          <div class="rotuloLinha">
            BATIDA<br>
            0 • 6 • 9
          </div>


          <div
            id="linhaBatidas"
            class="janelaScroll"
          ></div>

        </div>

      </div>


      <div class="legendaRegioes">

        <div class="legendaItem">

          <span
            class="legendaCor"
            style="
              background:#9bea2c
            "
          ></span>

          Zero

        </div>


        <div class="legendaItem">

          <span
            class="legendaCor"
            style="
              background:#8a20d4
            "
          ></span>

          Voisins

        </div>


        <div class="legendaItem">

          <span
            class="legendaCor"
            style="
              background:#176436
            "
          ></span>

          Orphelins

        </div>


        <div class="legendaItem">

          <span
            class="legendaCor"
            style="
              background:#29499b
            "
          ></span>

          Tiers

        </div>

      </div>

    </section>


    <!-- TECLADO -->

    <section class="painel">

      <div class="tituloPainel">
        TECLADO 0–36
      </div>


      <div
        id="teclado"
        class="teclado"
      ></div>

    </section>


    <!-- HISTÓRICO -->

    <section class="painel">

      <div class="tituloPainel">

        HISTÓRICO —
        <span id="qtdHistorico">
          0
        </span>

      </div>


      <div
        id="historico"
        class="historico"
      ></div>

    </section>

  </main>
  `;


  // =========================================================
  // ELEMENTOS
  // =========================================================

  const statusArea =
    document.getElementById(
      "statusArea"
    );


  const elementoQtdJanela =
    document.getElementById(
      "qtdJanela"
    );


  const elementoLinhaCores =
    document.getElementById(
      "linhaCores"
    );


  const elementoLinhaRegioes =
    document.getElementById(
      "linhaRegioes"
    );


  const elementoLinhaBatidas =
    document.getElementById(
      "linhaBatidas"
    );


  const elementoTeclado =
    document.getElementById(
      "teclado"
    );


  const elementoHistorico =
    document.getElementById(
      "historico"
    );


  const elementoQtdHistorico =
    document.getElementById(
      "qtdHistorico"
    );


  const elementoQtdT0 =
    document.getElementById(
      "qtdT0"
    );


  const elementoQtdT6 =
    document.getElementById(
      "qtdT6"
    );


  const elementoQtdT9 =
    document.getElementById(
      "qtdT9"
    );


  // =========================================================
  // TECLADO
  // =========================================================

  for(
    let numero = 1;
    numero <= 36;
    numero++
  ){

    const cores =
      corNumeroRoleta(
        numero
      );


    const botao =
      document.createElement(
        "button"
      );


    botao.className =
      "numeroBtn";


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
      .appendChild(
        botao
      );

  }


  const botaoZero =
    document.createElement(
      "button"
    );


  botaoZero.className =
    "numeroBtn zeroBtn";


  botaoZero.textContent =
    "0";


  botaoZero.style.background =
    "#087c48";


  botaoZero.style.color =
    "#ffffff";


  botaoZero.onclick = () => {

    adicionarNumero(0);

  };


  elementoTeclado
    .appendChild(
      botaoZero
    );


  // =========================================================
  // EVENTOS
  // =========================================================

  document
    .getElementById(
      "btnInserir"
    )
    .onclick =
      inserirHistorico;


  document
    .getElementById(
      "btnApagarUltimo"
    )
    .onclick =
      apagarUltimo;


  document
    .getElementById(
      "btnApagarTudo"
    )
    .onclick =
      apagarTudo;


  // =========================================================
  // RENDER JANELA 14
  // =========================================================

  function renderJanela(
    analise
  ){

    elementoQtdJanela.textContent =
      analise.janela.length;


    elementoQtdT0.textContent =
      analise.contagem[0] +
      "/" +
      analise.janela.length;


    elementoQtdT6.textContent =
      analise.contagem[6] +
      "/" +
      analise.janela.length;


    elementoQtdT9.textContent =
      analise.contagem[9] +
      "/" +
      analise.janela.length;


    if(
      !analise.janela.length
    ){

      elementoLinhaCores.innerHTML =
        "Sem números.";

      elementoLinhaRegioes.innerHTML =
        "Sem números.";

      elementoLinhaBatidas.innerHTML =
        "Sem números.";

      return;
    }


    // =====================================================
    // LINHA 1 — COR NORMAL
    // =====================================================

    elementoLinhaCores.innerHTML =
      analise.janela
        .map(numero => {

          const cores =
            corNumeroRoleta(
              numero
            );


          return `

            <div
              class="numeroJanela"
              style="
                background:${cores.fundo};
                color:${cores.texto};
              "
            >

              ${numero}

            </div>

          `;

        })
        .join("");


    // =====================================================
    // LINHA 2 — REGIÕES
    // =====================================================

    elementoLinhaRegioes.innerHTML =
      analise.janela
        .map(numero => {

          const regiao =
            regiaoDoNumero(
              numero
            );


          const cor =
            regiao
              ? coresRegioes[regiao]
              : "#555";


          return `

            <div
              class="numeroRegiao"
              style="
                background:${cor};
              "
              title="${regiao || ""}"
            >

              ${numero}

            </div>

          `;

        })
        .join("");


    // =====================================================
    // LINHA 3 — BATIDA 0 / 6 / 9
    // =====================================================

    elementoLinhaBatidas.innerHTML =
      analise.sequenciaBatidas
        .map(item => {


          if(
            !item.terminais.length
          ){

            return `

              <div
                class="batidaBox"
              >

                <span
                  class="batidaVazia"
                >
                  —
                </span>

              </div>

            `;
          }


          const tags =
            item.terminais
              .map(t => `

                <span
                  class="tagTerminal"
                  style="
                    background:
                    ${coresTerminais[t]};
                  "
                >
                  ${t}
                </span>

              `)
              .join("");


          return `

            <div
              class="
                batidaBox
                ${
                  item.terminais.length > 1
                    ? "batidaDupla"
                    : ""
                }
              "
            >

              ${tags}

            </div>

          `;

        })
        .join("");
  }


  // =========================================================
  // HISTÓRICO
  // =========================================================

  function renderHistorico(){

    elementoQtdHistorico.textContent =
      historico.length;


    if(!historico.length){

      elementoHistorico.innerHTML =
        "Histórico vazio.";

      return;
    }


    const inicioJanela =
      Math.max(
        0,
        historico.length -
        TAMANHO_JANELA
      );


    const visiveis =
      historico.slice(-60);


    const offset =
      historico.length -
      visiveis.length;


    elementoHistorico.innerHTML =
      visiveis
        .map(
          (
            numero,
            index
          ) => {


            const indiceReal =
              offset + index;


            const cores =
              corNumeroRoleta(
                numero
              );


            const dentroJanela =
              indiceReal >=
              inicioJanela;


            const ultimo =
              indiceReal ===
              historico.length - 1;


            return `

              <div
                class="
                  histNumero
                  ${
                    dentroJanela
                      ? "janelaAtual"
                      : ""
                  }
                  ${
                    ultimo
                      ? "ultimo"
                      : ""
                  }
                "
                style="
                  background:
                  ${cores.fundo};
                  color:
                  ${cores.texto};
                "
              >

                ${numero}

              </div>

            `;

          }
        )
        .join("");


    elementoHistorico.scrollLeft =
      elementoHistorico.scrollWidth;
  }


  // =========================================================
  // RENDER PRINCIPAL
  // =========================================================

  function render(){

    const analise =
      analisarJanela14();


    renderJanela(
      analise
    );


    renderHistorico();

  }


  // =========================================================
  // INICIAR
  // =========================================================

  render();

})();
