(function () {

  "use strict";

  // ================= CONFIGURAÇÃO =================

  const STORAGE_KEY =
    "ANALISADOR_VISUAL_TERMINAIS_V1";

  const numerosVermelhos = new Set([
    1,3,5,7,9,
    12,14,16,18,
    19,21,23,25,27,
    30,32,34,36
  ]);

  const formacoes = [
    {
      nome: "Coluna esquerda",
      terminais: [7,4,1]
    },
    {
      nome: "Coluna central",
      terminais: [8,5,2]
    },
    {
      nome: "Coluna direita",
      terminais: [9,6,3]
    },
    {
      nome: "Linha superior",
      terminais: [7,8,9]
    },
    {
      nome: "Linha central",
      terminais: [4,5,6]
    },
    {
      nome: "Linha inferior",
      terminais: [1,2,3]
    },
    {
      nome: "Diagonal 7–5–3",
      terminais: [7,5,3]
    },
    {
      nome: "Diagonal 9–5–1",
      terminais: [9,5,1]
    }
  ];

  let historico = carregarHistorico();

  // ================= FUNÇÕES BÁSICAS =================

  function terminal(numero){

    return numero === 0
      ? 0
      : numero % 10;
  }

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
        "Não foi possível salvar o histórico.",
        erro
      );
    }
  }

  function corNumeroRoleta(numero){

    if(numero === 0){

      return {
        fundo:"#07874b",
        texto:"#ffffff"
      };
    }

    if(numerosVermelhos.has(numero)){

      return {
        fundo:"#c6283d",
        texto:"#ffffff"
      };
    }

    return {
      fundo:"#171717",
      texto:"#ffffff"
    };
  }

  function contarTerminais(terminais){

    const contagens = {};

    terminais.forEach(item => {

      contagens[item] =
        (contagens[item] || 0) + 1;
    });

    return contagens;
  }

  function numerosDosTerminais(
    terminaisAlvo
  ){

    const numeros = [];

    for(
      let numero = 0;
      numero <= 36;
      numero++
    ){

      if(
        terminaisAlvo.includes(
          terminal(numero)
        )
      ){

        numeros.push(numero);
      }
    }

    return numeros;
  }

  // ================= ANÁLISE =================

  function encontrarFormacoesCompletas(
    terminaisUnicos
  ){

    return formacoes.filter(formacao =>

      formacao.terminais.every(item =>
        terminaisUnicos.includes(item)
      )
    );
  }

  function encontrarFormacoesParciais(
    terminaisUnicos,
    contagens
  ){

    return formacoes
      .map(formacao => {

        const encontrados =
          formacao.terminais.filter(item =>
            terminaisUnicos.includes(item)
          );

        const faltantes =
          formacao.terminais.filter(item =>
            !terminaisUnicos.includes(item)
          );

        const forca =
          encontrados.reduce(
            (total,item) =>
              total +
              (contagens[item] || 0),
            0
          );

        return {
          nome:formacao.nome,
          terminais:formacao.terminais,
          encontrados,
          faltantes,
          forca
        };
      })
      .filter(resultado =>
        resultado.encontrados.length === 2 &&
        resultado.faltantes.length === 1
      )
      .sort((a,b) => {

        if(b.forca !== a.forca){
          return b.forca - a.forca;
        }

        return (
          formacoes.indexOf(
            formacoes.find(item =>
              item.nome === a.nome
            )
          ) -
          formacoes.indexOf(
            formacoes.find(item =>
              item.nome === b.nome
            )
          )
        );
      });
  }

  function analisarUltimosQuatro(){

    const numeros =
      historico.slice(-4);

    const terminais =
      numeros.map(terminal);

    const contagens =
      contarTerminais(terminais);

    const terminaisUnicos =
      [...new Set(terminais)];

    const completas =
      encontrarFormacoesCompletas(
        terminaisUnicos
      );

    if(completas.length){

      const formacao =
        completas[0];

      return {
        tipo:"completa",
        numeros,
        terminais,
        contagens,
        formacao,
        terminaisAlvo:
          formacao.terminais,
        numerosAlvo:
          numerosDosTerminais(
            formacao.terminais
          )
      };
    }

    const parciais =
      encontrarFormacoesParciais(
        terminaisUnicos,
        contagens
      );

    if(parciais.length){

      const formacao =
        parciais[0];

      const terminalFaltante =
        formacao.faltantes[0];

      return {
        tipo:"parcial",
        numeros,
        terminais,
        contagens,
        formacao,
        terminalFaltante,
        numerosConfirmacao:
          numerosDosTerminais([
            terminalFaltante
          ])
      };
    }

    const repetidos =
      Object.entries(contagens)
        .filter(([,quantidade]) =>
          quantidade > 1
        )
        .map(([item,quantidade]) => ({
          terminal:Number(item),
          quantidade
        }))
        .sort((a,b) =>
          b.quantidade -
          a.quantidade
        );

    if(repetidos.length){

      return {
        tipo:"repeticao",
        numeros,
        terminais,
        contagens,
        repetidos
      };
    }

    return {
      tipo:"nenhuma",
      numeros,
      terminais,
      contagens
    };
  }

  // ================= HISTÓRICO =================

  function adicionarNumero(numero){

    historico.push(numero);

    if(historico.length > 300){
      historico.shift();
    }

    salvarHistorico();
    render();
  }

  function apagarUltimo(){

    if(!historico.length){
      return;
    }

    historico.pop();

    salvarHistorico();
    render();
  }

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
    render();
  }

  // ================= INTERFACE =================

  document.body.style.margin = "0";
  document.body.style.background = "#101010";
  document.body.style.color = "#ffffff";
  document.body.style.fontFamily =
    "Arial, sans-serif";

  document.body.innerHTML = `

    <style>

      *{
        box-sizing:border-box;
      }

      button{
        font-family:Arial,sans-serif;
        cursor:pointer;
        touch-action:manipulation;
      }

      .app{
        width:100%;
        max-width:760px;
        margin:auto;
        padding:10px;
      }

      .titulo{
        margin:3px 0 10px;
        text-align:center;
        font-size:21px;
      }

      .painel{
        margin-bottom:9px;
        padding:9px;
        background:#1d1d1f;
        border:1px solid #414141;
        border-radius:10px;
      }

      .painel-titulo{
        margin-bottom:7px;
        color:#d3d3d3;
        font-size:13px;
        font-weight:900;
      }

      .linha-botoes{
        display:flex;
        gap:7px;
        flex-wrap:wrap;
      }

      .btn{
        padding:8px 12px;
        background:#343434;
        color:#ffffff;
        border:1px solid #555;
        border-radius:7px;
        font-weight:900;
      }

      .btn-vermelho{
        background:#762832;
      }

      .historico{
        display:flex;
        min-height:39px;
        gap:5px;
        align-items:center;
        overflow-x:auto;
      }

      .historico-numero{
        min-width:36px;
        height:36px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:50%;
        border:2px solid #666;
        font-size:15px;
        font-weight:900;
      }

      .historico-numero.ultimo{
        border-color:#00e5ff;
        box-shadow:0 0 8px #00e5ff;
      }

      .teclado-roleta{
        display:grid;
        grid-template-columns:repeat(6,1fr);
        gap:5px;
      }

      .numero-btn{
        min-height:42px;
        border:1px solid #666;
        border-radius:7px;
        color:#fff;
        font-size:16px;
        font-weight:900;
      }

      .numero-btn:active{
        transform:scale(.96);
      }

      .zero-btn{
        grid-column:span 6;
      }

      .terminais-resumo{
        display:flex;
        min-height:30px;
        gap:5px;
        align-items:center;
        justify-content:center;
        flex-wrap:wrap;
      }

      .terminal-chip{
        min-width:30px;
        height:30px;
        display:flex;
        align-items:center;
        justify-content:center;
        border:1px solid #666;
        border-radius:7px;
        background:#111;
        font-weight:900;
      }

      .terminal-chip.repetido{
        border-color:#ffc107;
        color:#ffc107;
      }

      .seta{
        color:#777;
      }

      .teclado-terminal{
        display:grid;
        grid-template-columns:repeat(3,57px);
        gap:6px;
        justify-content:center;
        margin-top:8px;
      }

      .terminal-key{
        position:relative;
        height:45px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#101010;
        border:2px solid #555;
        border-radius:9px;
        font-size:20px;
        font-weight:900;
      }

      .terminal-key.zero{
        grid-column:2;
      }

      .terminal-key.ativo{
        background:#164dcc;
        border-color:#61a4ff;
      }

      .terminal-key.completo{
        background:#16763d;
        border-color:#4cff8a;
      }

      .terminal-key.faltante{
        color:#ffd740;
        border-color:#ffd740;
      }

      .contador{
        position:absolute;
        top:2px;
        right:3px;
        min-width:18px;
        height:18px;
        padding:0 4px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:10px;
        background:#dc263b;
        color:#fff;
        font-size:10px;
      }

      .resultado{
        padding:10px;
        background:#101010;
        border-left:5px solid #777;
        border-radius:8px;
        line-height:1.45;
      }

      .resultado.completo{
        border-left-color:#00e676;
      }

      .resultado.parcial{
        border-left-color:#ffc107;
      }

      .resultado.nenhuma{
        border-left-color:#ff5252;
      }

      .resultado-titulo{
        margin-bottom:4px;
        font-size:17px;
        font-weight:900;
      }

      .alvos{
        margin-top:6px;
        font-size:14px;
        line-height:1.55;
        word-break:break-word;
      }

      .muted{
        color:#999;
        font-size:12px;
      }

      @media(max-width:520px){

        .app{
          padding:6px;
        }

        .painel{
          padding:7px;
        }

        .teclado-roleta{
          gap:4px;
        }

        .numero-btn{
          min-height:39px;
          font-size:14px;
        }
      }

    </style>

    <main class="app">

      <h2 class="titulo">
        Analisador Visual de Terminais
      </h2>

      <section class="painel">

        <div class="linha-botoes">

          <button
            id="btnApagarUltimo"
            class="btn"
          >
            Apagar último
          </button>

          <button
            id="btnApagarTudo"
            class="btn btn-vermelho"
          >
            Apagar tudo
          </button>

        </div>

      </section>

      <section class="painel">

        <div class="painel-titulo">
          Histórico
        </div>

        <div
          id="historico"
          class="historico"
        ></div>

      </section>

      <section class="painel">

        <div class="painel-titulo">
          Teclado 0–36
        </div>

        <div
          id="tecladoRoleta"
          class="teclado-roleta"
        ></div>

      </section>

      <section class="painel">

        <div class="painel-titulo">
          Últimos 4 terminais
        </div>

        <div
          id="resumoTerminais"
          class="terminais-resumo"
        ></div>

        <div
          id="tecladoTerminal"
          class="teclado-terminal"
        >

          <div
            class="terminal-key"
            data-terminal="7"
          >
            7
          </div>

          <div
            class="terminal-key"
            data-terminal="8"
          >
            8
          </div>

          <div
            class="terminal-key"
            data-terminal="9"
          >
            9
          </div>

          <div
            class="terminal-key"
            data-terminal="4"
          >
            4
          </div>

          <div
            class="terminal-key"
            data-terminal="5"
          >
            5
          </div>

          <div
            class="terminal-key"
            data-terminal="6"
          >
            6
          </div>

          <div
            class="terminal-key"
            data-terminal="1"
          >
            1
          </div>

          <div
            class="terminal-key"
            data-terminal="2"
          >
            2
          </div>

          <div
            class="terminal-key"
            data-terminal="3"
          >
            3
          </div>

          <div
            class="terminal-key zero"
            data-terminal="0"
          >
            0
          </div>

        </div>

      </section>

      <section class="painel">

        <div class="painel-titulo">
          Análise
        </div>

        <div id="resultado"></div>

      </section>

    </main>
  `;

  // ================= ELEMENTOS =================

  const elementoHistorico =
    document.getElementById(
      "historico"
    );

  const elementoTecladoRoleta =
    document.getElementById(
      "tecladoRoleta"
    );

  const elementoResumoTerminais =
    document.getElementById(
      "resumoTerminais"
    );

  const elementoResultado =
    document.getElementById(
      "resultado"
    );

  // ================= TECLADO 0–36 =================

  for(
    let numero = 1;
    numero <= 36;
    numero++
  ){

    const cores =
      corNumeroRoleta(numero);

    const botao =
      document.createElement("button");

    botao.type = "button";
    botao.className = "numero-btn";
    botao.textContent = numero;

    botao.style.background =
      cores.fundo;

    botao.style.color =
      cores.texto;

    botao.onclick = () => {
      adicionarNumero(numero);
    };

    elementoTecladoRoleta
      .appendChild(botao);
  }

  const botaoZero =
    document.createElement("button");

  botaoZero.type = "button";
  botaoZero.className =
    "numero-btn zero-btn";

  botaoZero.textContent = "0";
  botaoZero.style.background = "#07874b";
  botaoZero.style.color = "#ffffff";

  botaoZero.onclick = () => {
    adicionarNumero(0);
  };

  elementoTecladoRoleta
    .appendChild(botaoZero);

  // ================= EVENTOS =================

  document
    .getElementById("btnApagarUltimo")
    .onclick = apagarUltimo;

  document
    .getElementById("btnApagarTudo")
    .onclick = apagarTudo;

  // ================= RENDERIZAÇÃO =================

  function limparTecladoTerminal(){

    document
      .querySelectorAll(".terminal-key")
      .forEach(elemento => {

        elemento.classList.remove(
          "ativo",
          "completo",
          "faltante"
        );

        const contador =
          elemento.querySelector(
            ".contador"
          );

        if(contador){
          contador.remove();
        }
      });
  }

  function pintarTerminaisAtivos(
    contagens
  ){

    Object.entries(contagens)
      .forEach(([item,quantidade]) => {

        const elemento =
          document.querySelector(
            `.terminal-key[data-terminal="${item}"]`
          );

        if(!elemento){
          return;
        }

        elemento.classList.add("ativo");

        if(quantidade > 1){

          const contador =
            document.createElement("span");

          contador.className =
            "contador";

          contador.textContent =
            quantidade;

          elemento.appendChild(contador);
        }
      });
  }

  function pintarFormacaoCompleta(
    formacao
  ){

    formacao.terminais
      .forEach(item => {

        const elemento =
          document.querySelector(
            `.terminal-key[data-terminal="${item}"]`
          );

        if(elemento){
          elemento.classList.add(
            "completo"
          );
        }
      });
  }

  function pintarTerminalFaltante(
    item
  ){

    const elemento =
      document.querySelector(
        `.terminal-key[data-terminal="${item}"]`
      );

    if(elemento){
      elemento.classList.add(
        "faltante"
      );
    }
  }

  function renderHistorico(){

    elementoHistorico.innerHTML = "";

    if(!historico.length){

      elementoHistorico.innerHTML = `
        <span class="muted">
          Clique nos números abaixo.
        </span>
      `;

      return;
    }

    const visiveis =
      historico.slice(-20);

    visiveis.forEach((numero,index) => {

      const cores =
        corNumeroRoleta(numero);

      const item =
        document.createElement("div");

      item.className =
        "historico-numero";

      if(index === visiveis.length - 1){
        item.classList.add("ultimo");
      }

      item.style.background =
        cores.fundo;

      item.style.color =
        cores.texto;

      item.textContent =
        numero;

      elementoHistorico
        .appendChild(item);
    });

    elementoHistorico.scrollLeft =
      elementoHistorico.scrollWidth;
  }

  function renderResumoTerminais(
    analise
  ){

    elementoResumoTerminais.innerHTML = "";

    if(!analise.terminais.length){

      elementoResumoTerminais.innerHTML = `
        <span class="muted">
          Nenhum número inserido.
        </span>
      `;

      return;
    }

    analise.terminais
      .forEach((item,index) => {

        const chip =
          document.createElement("div");

        chip.className =
          "terminal-chip";

        if(
          analise.contagens[item] > 1
        ){

          chip.classList.add(
            "repetido"
          );
        }

        chip.textContent =
          item;

        elementoResumoTerminais
          .appendChild(chip);

        if(
          index <
          analise.terminais.length - 1
        ){

          const seta =
            document.createElement("span");

          seta.className = "seta";
          seta.textContent = "→";

          elementoResumoTerminais
            .appendChild(seta);
        }
      });
  }

  function renderResultado(
    analise
  ){

    if(!analise.numeros.length){

      elementoResultado.innerHTML = `

        <div class="resultado nenhuma">

          <div class="resultado-titulo">
            Insira os números
          </div>

          <div class="muted">
            A análise utiliza os quatro últimos resultados.
          </div>

        </div>
      `;

      return;
    }

    if(analise.tipo === "completa"){

      elementoResultado.innerHTML = `

        <div class="resultado completo">

          <div class="resultado-titulo">
            Formação completa:
            ${analise.formacao.terminais.join("–")}
          </div>

          <div>
            ${analise.formacao.nome}
          </div>

          <div class="alvos">

            <strong>
              Terminais do alvo:
            </strong>

            ${analise.terminaisAlvo.join(", ")}

            <br>

            <strong>
              Números:
            </strong>

            ${analise.numerosAlvo.join(", ")}

          </div>

        </div>
      `;

      return;
    }

    if(analise.tipo === "parcial"){

      elementoResultado.innerHTML = `

        <div class="resultado parcial">

          <div class="resultado-titulo">
            Quase formada:
            ${analise.formacao.terminais.join("–")}
          </div>

          <div>
            ${analise.formacao.nome}
          </div>

          <div class="alvos">

            Falta o terminal

            <strong>
              ${analise.terminalFaltante}
            </strong>

            <br>

            <strong>
              Confirma com:
            </strong>

            ${analise.numerosConfirmacao.join(", ")}

          </div>

        </div>
      `;

      return;
    }

    if(analise.tipo === "repeticao"){

      const texto =
        analise.repetidos
          .map(item =>
            `T${item.terminal} repetiu ` +
            `${item.quantidade}x`
          )
          .join(" | ");

      elementoResultado.innerHTML = `

        <div class="resultado parcial">

          <div class="resultado-titulo">
            Terminal repetido
          </div>

          <div>
            ${texto}
          </div>

          <div class="muted">
            Ainda não fechou uma linha.
          </div>

        </div>
      `;

      return;
    }

    elementoResultado.innerHTML = `

      <div class="resultado nenhuma">

        <div class="resultado-titulo">
          Sem formação
        </div>

        <div class="muted">
          Os terminais estão espalhados.
        </div>

      </div>
    `;
  }

  function render(){

    const analise =
      analisarUltimosQuatro();

    renderHistorico();

    limparTecladoTerminal();

    pintarTerminaisAtivos(
      analise.contagens
    );

    renderResumoTerminais(
      analise
    );

    if(analise.tipo === "completa"){

      pintarFormacaoCompleta(
        analise.formacao
      );
    }

    if(analise.tipo === "parcial"){

      pintarTerminalFaltante(
        analise.terminalFaltante
      );
    }

    renderResultado(
      analise
    );
  }

  render();

})();
