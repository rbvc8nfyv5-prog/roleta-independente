(function () {

  "use strict";

  // =========================================================
  // CONFIGURAÇÃO PRINCIPAL
  // =========================================================

  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const TAMANHO_JANELA = 14;

  const STORAGE_KEY =
    "ANALISADOR_069_IDS_CORRESPONDENTES_V1";

  const numerosVermelhos = new Set([
    1,3,5,7,9,
    12,14,16,18,
    19,21,23,25,27,
    30,32,34,36
  ]);


  // =========================================================
  // REGIÕES DA ROLETA
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
  // BASES 0 / 6 / 9
  // =========================================================

  const BASES_069 = [
    0,10,20,30,
    6,16,26,36,
    9,19,29
  ];


  // =========================================================
  // IDs ESPECIAIS
  //
  // 39 É UM ID DA ANÁLISE.
  // NÃO É NÚMERO DA ROLETA.
  //
  // 25 -> 39
  // 17 -> 9
  // 2  -> 9
  // =========================================================

  const IDS_ESPECIAIS = {

    25:[39],

    17:[9],

    2:[9]

  };


  // =========================================================
  // CORES DOS IDs / TERMINAIS
  // =========================================================

  const COR_T0 = "#00c853";
  const COR_T6 = "#ffc107";
  const COR_T9 = "#2196f3";


  function corDoId(id){

    if(
      id === 0 ||
      id === 10 ||
      id === 20 ||
      id === 30
    ){
      return COR_T0;
    }

    if(
      id === 6 ||
      id === 16 ||
      id === 26 ||
      id === 36
    ){
      return COR_T6;
    }

    if(
      id === 9 ||
      id === 19 ||
      id === 29 ||
      id === 39
    ){
      return COR_T9;
    }

    return "#555";
  }


  // =========================================================
  // IDENTIFICAR FAMÍLIA DO ID
  // =========================================================

  function familiaDoId(id){

    if(
      id === 0 ||
      id === 10 ||
      id === 20 ||
      id === 30
    ){
      return 0;
    }

    if(
      id === 6 ||
      id === 16 ||
      id === 26 ||
      id === 36
    ){
      return 6;
    }

    if(
      id === 9 ||
      id === 19 ||
      id === 29 ||
      id === 39
    ){
      return 9;
    }

    return null;
  }


  let historico =
    carregarHistorico();


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
  // VIZINHOS NA ROLETA
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

    const resultado = [
      numero
    ];

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
  // COBERTURA DAS BASES
  // =========================================================

  const coberturaDasBases = {};


  BASES_069.forEach(base => {

    coberturaDasBases[base] =
      new Set(
        vizinhos(base,1)
      );

  });


  // =========================================================
  // DESCOBRIR QUAL ID O RESULTADO ESTÁ BATENDO
  // =========================================================

  function idsQueBatem(numero){

    const ids = [];


    BASES_069.forEach(base => {

      if(
        coberturaDasBases[base]
          .has(numero)
      ){

        ids.push(base);

      }

    });


    if(
      Object.prototype
        .hasOwnProperty
        .call(
          IDS_ESPECIAIS,
          numero
        )
    ){

      IDS_ESPECIAIS[numero]
        .forEach(id => {

          if(
            !ids.includes(id)
          ){

            ids.push(id);

          }

        });

    }


    return ids;
  }


  // =========================================================
  // REGIÃO DO NÚMERO
  // =========================================================

  function regiaoDoNumero(numero){

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
  // ANÁLISE DA JANELA DE 14
  // =========================================================

  function analisarJanela14(){

    const janela =
      historico.slice(
        -TAMANHO_JANELA
      );


    const sequencia =
      janela.map(numero => {

        return {

          numero,

          ids:
            idsQueBatem(numero)

        };

      });


    return {

      janela,

      sequencia

    };
  }


  // =========================================================
  // DADOS DO GRÁFICO 0 / 6 / 9
  //
  // Cada linha acumula as batidas dentro dos últimos 14.
  // Uma rodada conta no máximo 1 ponto para cada família.
  // =========================================================

  function montarDadosGrafico069(){

    const janela =
      historico.slice(
        -TAMANHO_JANELA
      );

    let acumulado0 = 0;
    let acumulado6 = 0;
    let acumulado9 = 0;

    const dados = [

      {
        posicao:0,
        numero:null,
        t0:0,
        t6:0,
        t9:0
      }

    ];


    janela.forEach(
      (numero,index) => {

        const ids =
          idsQueBatem(numero);

        const familias =
          new Set(
            ids
              .map(familiaDoId)
              .filter(
                familia =>
                  familia !== null
              )
          );


        if(
          familias.has(0)
        ){
          acumulado0++;
        }

        if(
          familias.has(6)
        ){
          acumulado6++;
        }

        if(
          familias.has(9)
        ){
          acumulado9++;
        }


        dados.push({

          posicao:index + 1,

          numero,

          t0:acumulado0,

          t6:acumulado6,

          t9:acumulado9

        });

      }
    );


    return dados;
  }


  // =========================================================
  // EXTRAIR NÚMEROS DO TEXTO
  // =========================================================

  function extrairNumeros(texto){

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

  function adicionarNumero(numero){

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

  function corNumeroRoleta(numero){

    if(numero === 0){

      return {
        fundo:"#087c48",
        texto:"#ffffff"
      };

    }


    if(
      numerosVermelhos.has(numero)
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
        78px minmax(0,1fr);
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
      border:2px solid rgba(255,255,255,.75);
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
      border:2px solid rgba(255,255,255,.65);
      color:#fff;
      font-size:14px;
      font-weight:900;
    }

    .idBox{
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

    .idBoxMultiplo{
      border-color:#fff;
      box-shadow:
        0 0 7px rgba(255,255,255,.45);
    }

    .tagId{
      min-width:27px;
      height:28px;
      padding:0 4px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:6px;
      color:#fff;
      font-size:12px;
      font-weight:900;
    }

    .idVazio{
      color:#555;
      font-size:15px;
      font-weight:900;
    }


    /* =====================================================
       LEGENDA REGIÕES
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
       GRÁFICO 0 / 6 / 9
    ===================================================== */

    .graficoCabecalho{
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:8px;
      flex-wrap:wrap;
      margin-bottom:5px;
    }

    .graficoLegenda{
      display:flex;
      gap:9px;
      align-items:center;
      flex-wrap:wrap;
      font-size:11px;
      font-weight:900;
    }

    .graficoLegendaItem{
      display:flex;
      align-items:center;
      gap:4px;
    }

    .graficoLegendaCor{
      width:17px;
      height:4px;
      border-radius:4px;
    }

    .graficoResumo{
      display:flex;
      gap:5px;
      margin-bottom:7px;
    }

    .graficoResumoCard{
      flex:1;
      min-width:70px;
      background:#111;
      border:1px solid #444;
      border-radius:7px;
      padding:5px;
      text-align:center;
    }

    .graficoResumoNome{
      font-size:10px;
      font-weight:900;
      color:#aaa;
    }

    .graficoResumoValor{
      margin-top:2px;
      font-size:18px;
      font-weight:900;
    }

    .graficoContainer{
      width:100%;
      height:210px;
      position:relative;
      background:#111;
      border:1px solid #444;
      border-radius:8px;
      overflow:hidden;
    }

    #grafico069{
      width:100%;
      height:100%;
      display:block;
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


    @media(max-width:600px){

      .app{
        padding:5px;
      }

      .painel{
        padding:7px;
      }

      .linhaJanela{
        grid-template-columns:
          60px minmax(0,1fr);
      }

      .rotuloLinha{
        font-size:9px;
      }

      .numeroJanela,
      .numeroRegiao,
      .idBox{
        min-width:34px;
        height:34px;
      }

      .tagId{
        min-width:24px;
        height:25px;
        font-size:11px;
      }

      .teclado{
        gap:3px;
      }

      .numeroBtn{
        min-height:38px;
      }

      .graficoContainer{
        height:190px;
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


    <!-- ÚLTIMOS 14 -->

    <section class="painel">

      <div class="tituloPainel">

        ÚLTIMOS
        <span id="qtdJanela">0</span>/14

      </div>


      <div class="janelaBloco">


        <!-- LINHA 1 -->

        <div class="linhaJanela">

          <div class="rotuloLinha">
            ROLETA
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
            ID<br>
            0 • 6 • 9
          </div>

          <div
            id="linhaIds"
            class="janelaScroll"
          ></div>

        </div>

      </div>


      <div class="legendaRegioes">

        <div class="legendaItem">
          <span
            class="legendaCor"
            style="background:#9bea2c"
          ></span>
          Zero
        </div>

        <div class="legendaItem">
          <span
            class="legendaCor"
            style="background:#8a20d4"
          ></span>
          Voisins
        </div>

        <div class="legendaItem">
          <span
            class="legendaCor"
            style="background:#176436"
          ></span>
          Orphelins
        </div>

        <div class="legendaItem">
          <span
            class="legendaCor"
            style="background:#29499b"
          ></span>
          Tiers
        </div>

      </div>

    </section>


    <!-- =====================================================
         NOVO GRÁFICO 0 / 6 / 9
    ====================================================== -->

    <section class="painel">

      <div class="graficoCabecalho">

        <div class="tituloPainel" style="margin:0;">
          EVOLUÇÃO 0 • 6 • 9 — ÚLTIMOS 14
        </div>


        <div class="graficoLegenda">

          <div class="graficoLegendaItem">
            <span
              class="graficoLegendaCor"
              style="background:#00c853"
            ></span>
            0
          </div>

          <div class="graficoLegendaItem">
            <span
              class="graficoLegendaCor"
              style="background:#ffc107"
            ></span>
            6
          </div>

          <div class="graficoLegendaItem">
            <span
              class="graficoLegendaCor"
              style="background:#2196f3"
            ></span>
            9
          </div>

        </div>

      </div>


      <div class="graficoResumo">

        <div class="graficoResumoCard">

          <div class="graficoResumoNome">
            TERMINAL 0
          </div>

          <div
            id="graficoTotal0"
            class="graficoResumoValor"
            style="color:#00c853"
          >
            0
          </div>

        </div>


        <div class="graficoResumoCard">

          <div class="graficoResumoNome">
            TERMINAL 6
          </div>

          <div
            id="graficoTotal6"
            class="graficoResumoValor"
            style="color:#ffc107"
          >
            0
          </div>

        </div>


        <div class="graficoResumoCard">

          <div class="graficoResumoNome">
            TERMINAL 9
          </div>

          <div
            id="graficoTotal9"
            class="graficoResumoValor"
            style="color:#2196f3"
          >
            0
          </div>

        </div>

      </div>


      <div class="graficoContainer">

        <canvas id="grafico069"></canvas>

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
        <span id="qtdHistorico">0</span>

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

  const elementoLinhaIds =
    document.getElementById(
      "linhaIds"
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

  const graficoTotal0 =
    document.getElementById(
      "graficoTotal0"
    );

  const graficoTotal6 =
    document.getElementById(
      "graficoTotal6"
    );

  const graficoTotal9 =
    document.getElementById(
      "graficoTotal9"
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
      corNumeroRoleta(numero);

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

      adicionarNumero(numero);

    };

    elementoTeclado
      .appendChild(botao);

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
    .appendChild(botaoZero);


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
  // RENDER DOS ÚLTIMOS 14
  // =========================================================

  function renderJanela(analise){

    elementoQtdJanela.textContent =
      analise.janela.length;


    if(!analise.janela.length){

      elementoLinhaCores.innerHTML =
        "Sem números.";

      elementoLinhaRegioes.innerHTML =
        "Sem números.";

      elementoLinhaIds.innerHTML =
        "Sem números.";

      return;
    }


    // =====================================================
    // LINHA 1 — ROLETA
    // =====================================================

    elementoLinhaCores.innerHTML =
      analise.janela
        .map(numero => {

          const cores =
            corNumeroRoleta(numero);

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
    // LINHA 2 — REGIÃO
    // =====================================================

    elementoLinhaRegioes.innerHTML =
      analise.janela
        .map(numero => {

          const regiao =
            regiaoDoNumero(numero);

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
    // LINHA 3 — ID CORRESPONDENTE
    // =====================================================

    elementoLinhaIds.innerHTML =
      analise.sequencia
        .map(item => {

          if(!item.ids.length){

            return `

              <div class="idBox">

                <span class="idVazio">
                  —
                </span>

              </div>

            `;

          }


          const tags =
            item.ids
              .map(id => `

                <span
                  class="tagId"
                  style="
                    background:${corDoId(id)};
                  "
                >
                  ${id}
                </span>

              `)
              .join("");


          return `

            <div
              class="
                idBox
                ${
                  item.ids.length > 1
                    ? "idBoxMultiplo"
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
  // DESENHAR GRÁFICO DE LINHAS
  // =========================================================

  function renderGrafico069(){

    const canvas =
      document.getElementById(
        "grafico069"
      );

    const container =
      canvas.parentElement;

    const rect =
      container.getBoundingClientRect();

    const dpr =
      window.devicePixelRatio || 1;

    const largura =
      Math.max(
        300,
        Math.floor(rect.width)
      );

    const altura =
      Math.max(
        170,
        Math.floor(rect.height)
      );


    canvas.width =
      largura * dpr;

    canvas.height =
      altura * dpr;

    canvas.style.width =
      largura + "px";

    canvas.style.height =
      altura + "px";


    const ctx =
      canvas.getContext("2d");


    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );


    ctx.clearRect(
      0,
      0,
      largura,
      altura
    );


    const dados =
      montarDadosGrafico069();


    const ultimo =
      dados[
        dados.length - 1
      ];


    graficoTotal0.textContent =
      ultimo
        ? ultimo.t0
        : 0;

    graficoTotal6.textContent =
      ultimo
        ? ultimo.t6
        : 0;

    graficoTotal9.textContent =
      ultimo
        ? ultimo.t9
        : 0;


    // -------------------------------------------------------
    // MEDIDAS
    // -------------------------------------------------------

    const margemEsquerda = 29;
    const margemDireita = 12;
    const margemSuperior = 12;
    const margemInferior = 29;

    const larguraUtil =
      largura -
      margemEsquerda -
      margemDireita;

    const alturaUtil =
      altura -
      margemSuperior -
      margemInferior;


    // -------------------------------------------------------
    // FUNÇÕES DE POSIÇÃO
    // -------------------------------------------------------

    function x(posicao){

      return (
        margemEsquerda +
        (
          posicao /
          TAMANHO_JANELA
        ) *
        larguraUtil
      );

    }


    function y(valor){

      return (
        margemSuperior +
        alturaUtil -
        (
          valor /
          TAMANHO_JANELA
        ) *
        alturaUtil
      );

    }


    // -------------------------------------------------------
    // FUNDO
    // -------------------------------------------------------

    ctx.fillStyle =
      "#111";

    ctx.fillRect(
      0,
      0,
      largura,
      altura
    );


    // -------------------------------------------------------
    // GRADE HORIZONTAL
    // -------------------------------------------------------

    const niveis =
      [0,2,4,6,8,10,12,14];


    ctx.font =
      "10px Arial";

    ctx.textAlign =
      "right";

    ctx.textBaseline =
      "middle";


    niveis.forEach(valor => {

      const py =
        y(valor);


      ctx.beginPath();

      ctx.moveTo(
        margemEsquerda,
        py
      );

      ctx.lineTo(
        largura -
        margemDireita,
        py
      );

      ctx.strokeStyle =
        valor === 0
          ? "#666"
          : "#292929";

      ctx.lineWidth =
        1;

      ctx.stroke();


      ctx.fillStyle =
        "#777";

      ctx.fillText(
        valor,
        margemEsquerda - 5,
        py
      );

    });


    // -------------------------------------------------------
    // EIXO X
    // -------------------------------------------------------

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "top";


    for(
      let i = 1;
      i <= TAMANHO_JANELA;
      i++
    ){

      const px =
        x(i);


      ctx.beginPath();

      ctx.moveTo(
        px,
        margemSuperior
      );

      ctx.lineTo(
        px,
        margemSuperior +
        alturaUtil
      );

      ctx.strokeStyle =
        "#202020";

      ctx.lineWidth =
        1;

      ctx.stroke();


      ctx.fillStyle =
        "#666";

      ctx.fillText(
        String(i),
        px,
        margemSuperior +
        alturaUtil +
        6
      );

    }


    // -------------------------------------------------------
    // FUNÇÃO PARA DESENHAR CADA LINHA
    // -------------------------------------------------------

    function desenharLinha(
      chave,
      cor
    ){

      if(
        dados.length < 1
      ){
        return;
      }


      ctx.beginPath();


      dados.forEach(
        (ponto,index) => {

          const px =
            x(
              ponto.posicao
            );

          const py =
            y(
              ponto[chave]
            );


          if(index === 0){

            ctx.moveTo(
              px,
              py
            );

          }else{

            ctx.lineTo(
              px,
              py
            );

          }

        }
      );


      ctx.strokeStyle =
        cor;

      ctx.lineWidth =
        3;

      ctx.lineJoin =
        "round";

      ctx.lineCap =
        "round";

      ctx.stroke();


      // PONTOS

      dados
        .slice(1)
        .forEach(ponto => {

          const px =
            x(
              ponto.posicao
            );

          const py =
            y(
              ponto[chave]
            );


          ctx.beginPath();

          ctx.arc(
            px,
            py,
            3,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            cor;

          ctx.fill();

          ctx.strokeStyle =
            "#111";

          ctx.lineWidth =
            1.5;

          ctx.stroke();

        });

    }


    // -------------------------------------------------------
    // DESENHA AS TRÊS LINHAS NO MESMO GRÁFICO
    // -------------------------------------------------------

    desenharLinha(
      "t0",
      COR_T0
    );

    desenharLinha(
      "t6",
      COR_T6
    );

    desenharLinha(
      "t9",
      COR_T9
    );

  }


  // =========================================================
  // RENDER HISTÓRICO
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
              corNumeroRoleta(numero);

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
                  background:${cores.fundo};
                  color:${cores.texto};
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

    renderGrafico069();

  }


  // =========================================================
  // REDESENHAR GRÁFICO AO MUDAR TAMANHO DA TELA
  // =========================================================

  let resizeTimer = null;


  window.addEventListener(
    "resize",
    function(){

      clearTimeout(
        resizeTimer
      );

      resizeTimer =
        setTimeout(
          renderGrafico069,
          120
        );

    }
  );


  // =========================================================
  // INICIAR
  // =========================================================

  render();

})();
