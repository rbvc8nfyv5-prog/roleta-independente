(function(){

"use strict";

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const STORAGE_KEY = "ANALISADOR_069_IDS_CORRESPONDENTES_V1";
const STORAGE_ESTADO = "ANALISADOR_069_ESTADO_AUTO_V3";

const TAMANHO_JANELA = 14;
const JANELA_ESTADO = 20;
const MAX_HISTORICO = 5000;
const MAX_TIMELINE = 200;

const COR_T0 = "#00c853";
const COR_T6 = "#ffc107";
const COR_T9 = "#2196f3";

const BASES_069 = [
  0,10,20,30,
  6,16,26,36,
  9,19,29
];

const TODOS_IDS_RX = [
  0,10,20,30,
  6,16,26,36,
  9,19,29,39
];

const IDS_ESPECIAIS = {
  25:[39],
  17:[9],
  2:[9]
};

const PERCENTUAL_REPLICAS_RX = 0.10;
const MIN_REPLICAS_RX = 15;
const MAX_REPLICAS_RX = 40;
const MIN_ZONAS_RX = 8;

const QTD_2V = 5;
const QTD_1V = 1;

/*
  AUTO NOVO

  Estado recente manda.
  Histórico geral apenas estabiliza.

  Não existe mais trava de 3 pontos.
  Se outro RX estiver melhor no estado
  atual, ele pode assumir imediatamente.
*/

const PESO_ULTIMOS_10 = 0.45;
const PESO_ULTIMOS_20 = 0.35;
const PESO_SIMILARIDADE = 0.15;
const PESO_HISTORICO = 0.05;


/* =========================================================
   ROLETA
========================================================= */

const track = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

const numerosVermelhos = new Set([
  1,3,5,7,9,
  12,14,16,18,
  19,21,23,25,27,
  30,32,34,36
]);

const regioesRoleta = {
  ZERO:new Set([0,32,15,26,3,35,12]),
  VOISINS:new Set([19,4,21,2,25,28,7,29,18,22]),
  ORPHELINS:new Set([9,31,14,20,1,17,6,34]),
  TIERS:new Set([27,13,36,11,30,8,23,10,5,24,16,33])
};

const coresRegioes = {
  ZERO:"#9bea2c",
  VOISINS:"#8a20d4",
  ORPHELINS:"#176436",
  TIERS:"#29499b"
};


/* =========================================================
   ESTADO
========================================================= */

let historico = carregarHistorico();

let estado = {
  modo:"AUTO",
  manualRX:6,

  /*
    snapshots:
    jogadas que estão esperando
    o PRÓXIMO resultado.
  */
  pendentes:{
    4:null,
    5:null,
    6:null
  },

  /*
    timeline real.
  */
  timeline:{
    4:[],
    5:[],
    6:[]
  },

  rxAutoAtual:6
};

carregarEstado();


/* =========================================================
   STORAGE
========================================================= */

function carregarHistorico(){

  try{

    const raw = localStorage.getItem(STORAGE_KEY);

    if(!raw) return [];

    const dados = JSON.parse(raw);

    if(!Array.isArray(dados)) return [];

    return dados
      .map(Number)
      .filter(n =>
        Number.isInteger(n) &&
        n >= 0 &&
        n <= 36
      )
      .slice(-MAX_HISTORICO);

  }catch(e){
    return [];
  }
}


function salvarHistorico(){

  try{
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(historico)
    );
  }catch(e){}
}


function carregarEstado(){

  try{

    const raw = localStorage.getItem(STORAGE_ESTADO);

    if(!raw) return;

    const salvo = JSON.parse(raw);

    if(
      salvo.modo === "AUTO" ||
      salvo.modo === "MANUAL"
    ){
      estado.modo = salvo.modo;
    }

    if([4,5,6].includes(salvo.manualRX)){
      estado.manualRX = salvo.manualRX;
    }

    if([4,5,6].includes(salvo.rxAutoAtual)){
      estado.rxAutoAtual = salvo.rxAutoAtual;
    }

    if(salvo.timeline){

      [4,5,6].forEach(rx => {

        if(Array.isArray(salvo.timeline[rx])){
          estado.timeline[rx] =
            salvo.timeline[rx].slice(-MAX_TIMELINE);
        }

      });

    }

    if(salvo.pendentes){

      [4,5,6].forEach(rx => {

        if(salvo.pendentes[rx]){
          estado.pendentes[rx] =
            salvo.pendentes[rx];
        }

      });

    }

  }catch(e){}
}


function salvarEstado(){

  try{

    localStorage.setItem(
      STORAGE_ESTADO,
      JSON.stringify(estado)
    );

  }catch(e){}
}


/* =========================================================
   HELPERS
========================================================= */

function indiceRoda(numero){
  return track.indexOf(numero);
}


function setorVizinhosOrdenado(centro, quantidade){

  const i = indiceRoda(centro);

  if(i < 0) return [];

  const nums = [];

  for(let d=-quantidade; d<=quantidade; d++){

    nums.push(
      track[
        (i+d+track.length) %
        track.length
      ]
    );

  }

  return nums;
}


function vizinhos(numero, quantidade=1){

  const i = indiceRoda(numero);

  if(i < 0) return [];

  const resultado = [numero];

  for(let d=1; d<=quantidade; d++){

    resultado.push(
      track[
        (i-d+track.length) %
        track.length
      ]
    );

    resultado.push(
      track[
        (i+d) %
        track.length
      ]
    );

  }

  return resultado;
}


function familiaDoId(id){

  if([0,10,20,30].includes(id)) return 0;
  if([6,16,26,36].includes(id)) return 6;
  if([9,19,29,39].includes(id)) return 9;

  return null;
}


function corDoId(id){

  const f = familiaDoId(id);

  if(f === 0) return COR_T0;
  if(f === 6) return COR_T6;
  if(f === 9) return COR_T9;

  return "#555";
}


function regiaoDoNumero(numero){

  if(regioesRoleta.ZERO.has(numero)) return "ZERO";
  if(regioesRoleta.VOISINS.has(numero)) return "VOISINS";
  if(regioesRoleta.ORPHELINS.has(numero)) return "ORPHELINS";
  if(regioesRoleta.TIERS.has(numero)) return "TIERS";

  return null;
}


function corNumeroRoleta(numero){

  if(numero === 0){
    return "#087c48";
  }

  if(numerosVermelhos.has(numero)){
    return "#c6283d";
  }

  return "#181818";
}


/* =========================================================
   IDS
========================================================= */

const coberturaDasBases = {};

BASES_069.forEach(base => {

  coberturaDasBases[base] =
    new Set(vizinhos(base,1));

});


function idsQueBatem(numero){

  const ids = [];

  BASES_069.forEach(base => {

    if(coberturaDasBases[base].has(numero)){
      ids.push(base);
    }

  });

  if(
    Object.prototype.hasOwnProperty.call(
      IDS_ESPECIAIS,
      numero
    )
  ){

    IDS_ESPECIAIS[numero].forEach(id => {

      if(!ids.includes(id)){
        ids.push(id);
      }

    });

  }

  return ids;
}


function familiasQueBatem(numero){

  return new Set(
    idsQueBatem(numero)
      .map(familiaDoId)
      .filter(f => f !== null)
  );
}


/* =========================================================
   TRAJETÓRIA
========================================================= */

function gerarTrajetoria(janela){

  let t0=0;
  let t6=0;
  let t9=0;

  const pontos=[];
  const eventos=[];

  janela.forEach((numero,index) => {

    const f = familiasQueBatem(numero);

    const b0 = f.has(0) ? 1 : 0;
    const b6 = f.has(6) ? 1 : 0;
    const b9 = f.has(9) ? 1 : 0;

    t0 += b0;
    t6 += b6;
    t9 += b9;

    eventos.push({
      t0:b0,
      t6:b6,
      t9:b9
    });

    pontos.push({
      posicao:index+1,
      numero,
      t0,
      t6,
      t9
    });

  });

  return {
    pontos,
    eventos,
    total0:t0,
    total6:t6,
    total9:t9
  };
}


function chaveEvento(e){

  let c="";

  if(e.t0) c+="0";
  if(e.t6) c+="6";
  if(e.t9) c+="9";

  return c || "-";
}


function calcularSimilaridade(atual, antiga){

  const tamanho = atual.length;

  if(
    tamanho === 0 ||
    antiga.length !== tamanho
  ){
    return 0;
  }

  const a = gerarTrajetoria(atual);
  const b = gerarTrajetoria(antiga);

  let iguais=0;

  for(let i=0;i<tamanho;i++){

    if(
      chaveEvento(a.eventos[i]) ===
      chaveEvento(b.eventos[i])
    ){
      iguais++;
    }

  }

  const scoreEventos =
    iguais/tamanho*100;

  let erro=0;

  for(let i=0;i<tamanho;i++){

    erro += Math.abs(
      a.pontos[i].t0 -
      b.pontos[i].t0
    );

    erro += Math.abs(
      a.pontos[i].t6 -
      b.pontos[i].t6
    );

    erro += Math.abs(
      a.pontos[i].t9 -
      b.pontos[i].t9
    );

  }

  const maxErro =
    tamanho*tamanho*3;

  let scoreForma =
    1-(erro/maxErro);

  scoreForma =
    Math.max(
      0,
      Math.min(1,scoreForma)
    )*100;

  return (
    scoreEventos*0.80 +
    scoreForma*0.20
  );
}


/* =========================================================
   RÉPLICAS
========================================================= */

function selecionarReplicas(base, tamanho){

  const total = base.length;

  if(total < tamanho*2+1){

    return {
      estado:"AGUARDANDO",
      replicas:[],
      similaridade:0
    };

  }

  const inicioAtual =
    total-tamanho;

  const janelaAtual =
    base.slice(inicioAtual);

  const todas=[];

  for(
    let inicio=0;
    inicio+tamanho<inicioAtual;
    inicio++
  ){

    const fim =
      inicio+tamanho;

    const proximo =
      base[fim];

    if(proximo === undefined){
      continue;
    }

    todas.push({

      inicio,
      fim,
      proximo,

      similaridade:
        calcularSimilaridade(
          janelaAtual,
          base.slice(inicio,fim)
        ),

      distancia:
        inicioAtual-fim

    });

  }

  todas.sort((a,b) => {

    if(
      Math.abs(
        b.similaridade-a.similaridade
      ) > 0.0001
    ){
      return b.similaridade-a.similaridade;
    }

    return a.distancia-b.distancia;

  });

  if(!todas.length){

    return {
      estado:"SEM DADOS",
      replicas:[],
      similaridade:0
    };

  }

  let qtd =
    Math.ceil(
      todas.length *
      PERCENTUAL_REPLICAS_RX
    );

  qtd =
    Math.max(
      qtd,
      MIN_REPLICAS_RX
    );

  qtd =
    Math.min(
      qtd,
      todas.length,
      MAX_REPLICAS_RX
    );

  const grupo =
    todas.slice(0,qtd);

  const zonas =
    new Set();

  grupo.forEach(item => {

    idsQueBatem(item.proximo)
      .forEach(id => zonas.add(id));

  });

  let indice=qtd;

  while(
    zonas.size < MIN_ZONAS_RX &&
    indice < todas.length &&
    grupo.length < MAX_REPLICAS_RX
  ){

    const item =
      todas[indice++];

    grupo.push(item);

    idsQueBatem(item.proximo)
      .forEach(id => zonas.add(id));

  }

  const similaridade =
    grupo.reduce(
      (s,x) => s+x.similaridade,
      0
    ) / grupo.length;

  return {
    estado:"OK",
    replicas:grupo,
    similaridade,
    zonasEncontradas:zonas.size
  };
}


/* =========================================================
   ESTADO ATUAL ALTO / BAIXO
========================================================= */

function analisarEstadoAtual(base){

  const janela =
    base.slice(-JANELA_ESTADO);

  let baixos=0;
  let altos=0;
  let zero=0;

  janela.forEach(n => {

    if(n === 0){
      zero++;
    }
    else if(n <= 18){
      baixos++;
    }
    else{
      altos++;
    }

  });

  const validos =
    baixos+altos;

  const pBaixo =
    validos
    ?
    baixos/validos
    :
    0.5;

  const pAlto =
    validos
    ?
    altos/validos
    :
    0.5;

  return {
    janela,
    baixos,
    altos,
    zero,
    pBaixo,
    pAlto
  };
}


/* =========================================================
   FREQUÊNCIA DAS RÉPLICAS
========================================================= */

function gerarFrequenciaReplicas(replicas){

  const freq =
    new Map();

  track.forEach(n =>
    freq.set(n,0)
  );

  replicas.forEach(item => {

    if(freq.has(item.proximo)){

      freq.set(
        item.proximo,
        freq.get(item.proximo)+1
      );

    }

  });

  return freq;
}


/* =========================================================
   SETORES + MOMENTO DA MESA
========================================================= */

function avaliarSetor(
  centro,
  quantidade,
  frequencia,
  momento
){

  const numeros =
    setorVizinhosOrdenado(
      centro,
      quantidade
    );

  if(!numeros.length){
    return null;
  }

  let suporte=0;
  let score=0;
  let distintos=0;

  let altosSetor=0;
  let baixosSetor=0;

  numeros.forEach((numero,index) => {

    const qtd =
      frequencia.get(numero) || 0;

    suporte += qtd;

    if(qtd > 0){
      distintos++;
    }

    const distancia =
      Math.abs(index-quantidade);

    let mult=1;

    if(quantidade === 2){

      if(distancia === 0){
        mult=1.35;
      }
      else if(distancia === 1){
        mult=1.15;
      }

    }else{

      if(distancia === 0){
        mult=1.25;
      }

    }

    score += qtd*mult;

    if(numero >= 19){
      altosSetor++;
    }

    else if(
      numero >=1 &&
      numero <=18
    ){
      baixosSetor++;
    }

  });


  /*
    ESTADO ATUAL:

    É apenas um ajuste pequeno.
    Não substitui o Raio X.

    Se últimos 20 estão mais altos,
    setores com maior presença alta
    recebem pequeno bônus.
  */

  if(momento){

    const desequilibrio =
      momento.pAlto -
      momento.pBaixo;

    const balancoSetor =
      (
        altosSetor -
        baixosSetor
      )
      /
      numeros.length;

    score +=
      suporte *
      desequilibrio *
      balancoSetor *
      0.30;

  }


  return {
    centro,
    quantidade,
    numeros,
    suporte,
    distintos,
    score
  };
}


/* =========================================================
   MONTA 5x2V + 1x1V
========================================================= */

function montarJogada(
  replicas,
  base
){

  const frequencia =
    gerarFrequenciaReplicas(
      replicas
    );

  const momento =
    analisarEstadoAtual(
      base
    );

  const candidatos2 =
    track
    .map(c =>
      avaliarSetor(
        c,
        2,
        frequencia,
        momento
      )
    )
    .sort((a,b) =>
      b.score-a.score
    );

  const candidatos1 =
    track
    .map(c =>
      avaliarSetor(
        c,
        1,
        frequencia,
        momento
      )
    )
    .sort((a,b) =>
      b.score-a.score
    );


  let melhor=null;


  /*
    Testa cada possível setor 1V
    como reserva.

    Depois encaixa cinco 2V
    sem sobreposição.
  */

  candidatos1.forEach(um => {

    const usados =
      new Set(
        um.numeros
      );

    const dois=[];

    let score =
      um.score;


    for(const candidato of candidatos2){

      const sobrepoe =
        candidato.numeros.some(
          n => usados.has(n)
        );

      if(sobrepoe){
        continue;
      }

      dois.push(candidato);

      score +=
        candidato.score;

      candidato.numeros.forEach(
        n => usados.add(n)
      );

      if(dois.length === 5){
        break;
      }

    }


    if(
      dois.length === 5 &&
      usados.size === 28
    ){

      if(
        !melhor ||
        score > melhor.score
      ){

        melhor = {
          blocos2:dois,
          blocos1:[um],
          numerosUsados:usados,
          score
        };

      }

    }

  });


  if(!melhor){

    return {
      blocos2:[],
      blocos1:[],
      numerosUsados:new Set(),
      score:0
    };

  }


  melhor.blocos2.sort(
    (a,b) =>
      b.score-a.score
  );

  return melhor;
}


/* =========================================================
   ANALISAR RX 4/5/6
========================================================= */

function analisarRX(
  base,
  tamanho
){

  const selecao =
    selecionarReplicas(
      base,
      tamanho
    );


  if(
    selecao.estado !== "OK"
  ){

    return {
      tamanho,
      valido:false,
      similaridade:0,
      replicas:[],
      jogada:null
    };

  }


  const jogada =
    montarJogada(
      selecao.replicas,
      base
    );


  return {

    tamanho,

    valido:
      jogada.blocos2.length === 5 &&
      jogada.blocos1.length === 1 &&
      jogada.numerosUsados.size === 28,

    similaridade:
      selecao.similaridade,

    replicas:
      selecao.replicas,

    zonasEncontradas:
      selecao.zonasEncontradas,

    jogada

  };
}


/* =========================================================
   SNAPSHOT FIEL

   A jogada gerada AGORA fica guardada.
   O próximo número será comparado com ela.

   Trocar AUTO/MANUAL não altera snapshot.
========================================================= */

function criarSnapshot(rx){

  if(
    !rx ||
    !rx.valido ||
    !rx.jogada
  ){
    return null;
  }

  return {

    tamanho:
      rx.tamanho,

    criadoCom:
      historico.length,

    numeros:
      Array.from(
        rx.jogada.numerosUsados
      ),

    blocos2:
      rx.jogada.blocos2.map(
        b => ({
          centro:b.centro,
          numeros:b.numeros.slice()
        })
      ),

    blocos1:
      rx.jogada.blocos1.map(
        b => ({
          centro:b.centro,
          numeros:b.numeros.slice()
        })
      )

  };
}


/* =========================================================
   FECHAR RESULTADO PENDENTE

   É executado ANTES de inserir
   o novo número no histórico.
========================================================= */

function avaliarPendentes(
  novoNumero
){

  [4,5,6].forEach(rx => {

    const pendente =
      estado.pendentes[rx];

    if(!pendente){
      return;
    }


    const green =
      pendente.numeros.includes(
        novoNumero
      );


    estado.timeline[rx].push({

      resultado:
        novoNumero,

      green,

      criadoCom:
        pendente.criadoCom,

      rx,

      hora:
        Date.now()

    });


    estado.timeline[rx] =
      estado.timeline[rx]
      .slice(-MAX_TIMELINE);


    /*
      Resultado já foi conferido.
      Nunca mais é recalculado.
    */

    estado.pendentes[rx] =
      null;

  });


  salvarEstado();
}


/* =========================================================
   PLACAR REAL
========================================================= */

function estatisticaTimeline(rx){

  const timeline =
    estado.timeline[rx] || [];


  const ultimos20 =
    timeline.slice(-20);


  const ultimos10 =
    timeline.slice(-10);


  function taxa(lista){

    if(!lista.length){
      return 0;
    }

    const greens =
      lista.filter(
        x => x.green
      ).length;

    return (
      greens /
      lista.length *
      100
    );
  }


  let sequenciaLoss=0;

  for(
    let i=timeline.length-1;
    i>=0;
    i--
  ){

    if(timeline[i].green){
      break;
    }

    sequenciaLoss++;

  }


  return {

    total:
      timeline.length,

    taxa10:
      taxa(ultimos10),

    taxa20:
      taxa(ultimos20),

    taxaHistorica:
      taxa(
        timeline.slice(-100)
      ),

    sequenciaLoss

  };
}


/* =========================================================
   FORÇA AUTO
========================================================= */

function calcularForcaAuto(
  rx
){

  if(
    !rx ||
    !rx.valido
  ){
    return -Infinity;
  }


  const est =
    estatisticaTimeline(
      rx.tamanho
    );


  /*
    Enquanto não existe histórico real
    suficiente da estratégia, a
    similaridade ajuda mais.
  */

  if(est.total < 5){

    return (
      rx.similaridade *
      0.70
      +
      (
        rx.zonasEncontradas || 0
      )
      /
      8 *
      100 *
      0.30
    );

  }


  let nota =

    est.taxa10 *
    PESO_ULTIMOS_10

    +

    est.taxa20 *
    PESO_ULTIMOS_20

    +

    rx.similaridade *
    PESO_SIMILARIDADE

    +

    est.taxaHistorica *
    PESO_HISTORICO;


  /*
    PUNIÇÃO POR LOSS CONSECUTIVO.

    Agora o AUTO não fica agarrado
    em um RX que começou a falhar.
  */

  if(est.sequenciaLoss >= 2){

    nota -=
      (
        est.sequenciaLoss-1
      )
      *
      4;

  }


  return nota;
}


/* =========================================================
   ESCOLHER AUTO

   NÃO HÁ MAIS TRAVA/HISTERESE.
========================================================= */

function escolherAuto(analises){

  const ranking =
    analises
    .filter(x => x.valido)
    .map(rx => ({
      ...rx,
      forcaAuto:
        calcularForcaAuto(rx),
      estatistica:
        estatisticaTimeline(
          rx.tamanho
        )
    }))
    .sort((a,b) => {

      if(
        Math.abs(
          b.forcaAuto -
          a.forcaAuto
        ) > 0.0001
      ){
        return b.forcaAuto-a.forcaAuto;
      }

      if(
        b.estatistica.taxa20 !==
        a.estatistica.taxa20
      ){
        return (
          b.estatistica.taxa20 -
          a.estatistica.taxa20
        );
      }

      return (
        b.similaridade -
        a.similaridade
      );

    });


  if(!ranking.length){
    return {
      escolhido:null,
      ranking:[]
    };
  }


  estado.rxAutoAtual =
    ranking[0].tamanho;


  salvarEstado();


  return {
    escolhido:
      ranking[0],
    ranking
  };
}


/* =========================================================
   CALCULAR ESTADO ATUAL DOS TRÊS
========================================================= */

function calcularTudo(){

  const rx4 =
    analisarRX(
      historico,
      4
    );

  const rx5 =
    analisarRX(
      historico,
      5
    );

  const rx6 =
    analisarRX(
      historico,
      6
    );


  const analises = [
    rx4,
    rx5,
    rx6
  ];


  const auto =
    escolherAuto(
      analises
    );


  /*
    IMPORTANTÍSSIMO:

    Os três recebem snapshot,
    mesmo se AUTO estiver usando
    apenas um.

    Assim conseguimos saber
    honestamente se 4, 5 ou 6
    teria acertado o próximo giro.
  */

  analises.forEach(rx => {

    estado.pendentes[
      rx.tamanho
    ] =
      criarSnapshot(rx);

  });


  salvarEstado();


  let ativo;


  if(
    estado.modo === "MANUAL"
  ){

    ativo =
      analises.find(
        x =>
          x.tamanho ===
          estado.manualRX
      );

  }

  else{

    ativo =
      auto.escolhido;

  }


  return {
    analises,
    auto,
    ativo
  };
}


/* =========================================================
   INSERIR NÚMERO

   ORDEM É FUNDAMENTAL:

   1. verifica snapshots antigos;
   2. grava GREEN/LOSS;
   3. insere novo número;
   4. calcula novas jogadas;
   5. congela para próximo giro.
========================================================= */

function adicionarNumero(numero){

  avaliarPendentes(
    numero
  );


  historico.push(
    numero
  );


  historico =
    historico.slice(
      -MAX_HISTORICO
    );


  salvarHistorico();


  statusArea.textContent =
    "Número " +
    numero +
    " inserido.";


  statusArea.style.color =
    "#00e5ff";


  render();
}


/* =========================================================
   COLAR HISTÓRICO

   Aqui não inventamos GREEN/LOSS
   retroativo.

   Timeline começa fielmente a partir
   do momento em que o sistema passa
   a acompanhar os próximos números.
========================================================= */

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
    .filter(
      n => n>=0 && n<=36
    )
    .slice(-MAX_HISTORICO);
}


function inserirHistorico(){

  const campo =
    document.getElementById(
      "entradaHistorico"
    );


  const numeros =
    extrairNumeros(
      campo.value
    );


  if(!numeros.length){

    statusArea.textContent =
      "Nenhum número válido.";

    return;
  }


  historico =
    numeros;


  /*
    Novo histórico:
    limpa timeline antiga porque
    não pertence necessariamente
    a esta sequência.
  */

  estado.timeline = {
    4:[],
    5:[],
    6:[]
  };

  estado.pendentes = {
    4:null,
    5:null,
    6:null
  };


  salvarHistorico();
  salvarEstado();


  campo.value = "";


  statusArea.textContent =
    historico.length +
    " números carregados.";


  render();
}


/* =========================================================
   APAGAR
========================================================= */

function apagarUltimo(){

  if(!historico.length){
    return;
  }


  historico.pop();


  /*
    Ao voltar o histórico manualmente,
    o snapshot atual deixa de ser válido.
  */

  estado.pendentes = {
    4:null,
    5:null,
    6:null
  };


  salvarHistorico();
  salvarEstado();

  render();
}


function apagarTudo(){

  if(
    !confirm(
      "Apagar todo o histórico?"
    )
  ){
    return;
  }


  historico=[];


  estado.timeline = {
    4:[],
    5:[],
    6:[]
  };


  estado.pendentes = {
    4:null,
    5:null,
    6:null
  };


  salvarHistorico();
  salvarEstado();

  render();
}


/* =========================================================
   AUTO / MANUAL
========================================================= */

function ativarAuto(){

  estado.modo =
    "AUTO";

  salvarEstado();

  render();
}


function ativarManual(rx){

  estado.modo =
    "MANUAL";

  estado.manualRX =
    rx;

  salvarEstado();

  render();
}


/* =========================================================
   INTERFACE
========================================================= */

document.body.innerHTML="";

document.body.style.margin="0";
document.body.style.background="#101010";
document.body.style.color="#fff";
document.body.style.fontFamily="Arial,sans-serif";


const app =
document.createElement("div");


app.innerHTML = `

<style>

*{box-sizing:border-box}

button,textarea{
font-family:Arial,sans-serif
}

button{
cursor:pointer
}

.app{
max-width:880px;
margin:auto;
padding:7px
}

h2{
text-align:center;
margin:5px 0 9px
}

.painel{
background:#1d1d1f;
border:1px solid #444;
border-radius:10px;
padding:8px;
margin-bottom:7px
}

.titulo{
font-size:11px;
font-weight:900;
color:#aaa
}

textarea{
width:100%;
height:65px;
background:#111;
color:white;
border:1px solid #555;
border-radius:7px;
padding:7px
}

.acoes{
display:flex;
gap:5px;
margin-top:5px;
flex-wrap:wrap
}

.btn{
background:#333;
border:1px solid #555;
border-radius:7px;
color:white;
padding:7px 9px;
font-weight:900
}

.verde{background:#146238}
.vermelho{background:#762832}

.status{
font-size:10px;
font-weight:900;
color:#aaa;
margin-top:5px
}

.modos{
display:flex;
gap:4px;
align-items:center;
flex-wrap:wrap
}

.modo{
background:#222;
border:1px solid #555;
color:#999;
border-radius:7px;
padding:7px 10px;
font-weight:900
}

.modo.ativo{
background:#007d98;
border-color:#00e5ff;
color:white
}

.modo.vencedor{
box-shadow:0 0 8px #00e5ff;
border-color:#00e5ff
}


/* MOMENTO */

.momento{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:5px;
margin-top:6px
}

.momentoBox{
background:#111;
border:1px solid #333;
border-radius:7px;
padding:6px;
text-align:center
}

.momentoBox small{
display:block;
font-size:8px;
color:#888
}

.momentoBox strong{
font-size:16px
}


/* TIMELINE */

.timelineArea{
margin-top:8px
}

.timelineLinha{
display:grid;
grid-template-columns:46px 1fr 55px;
gap:5px;
align-items:center;
margin-top:5px
}

.timelineNome{
font-size:11px;
font-weight:900;
text-align:center
}

.timeline{
display:flex;
gap:2px;
overflow:hidden;
justify-content:flex-end
}

.resultadoGL{
width:17px;
min-width:17px;
height:17px;
border-radius:4px;
display:flex;
align-items:center;
justify-content:center;
font-size:8px;
font-weight:900
}

.green{
background:#00a651;
color:white
}

.loss{
background:#c62828;
color:white
}

.timelineTaxa{
font-size:10px;
font-weight:900;
text-align:right
}


/* ÚLTIMOS 14 */

.linha{
display:grid;
grid-template-columns:55px 1fr;
gap:5px;
margin-top:5px;
align-items:center
}

.rotulo{
font-size:8px;
font-weight:900;
color:#888
}

.scroll{
display:flex;
gap:3px;
overflow-x:auto
}

.bola,
.regiao,
.id{
min-width:34px;
height:34px;
display:flex;
align-items:center;
justify-content:center;
font-size:12px;
font-weight:900
}

.bola{
border-radius:50%;
border:2px solid #aaa
}

.regiao{
border-radius:6px
}

.id{
background:#111;
border:1px solid #444;
border-radius:6px;
gap:2px
}

.tag{
padding:5px 3px;
border-radius:4px
}


/* JOGADA */

.jogadaTitulo{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:5px
}

.rxAtivo{
font-size:12px;
font-weight:900;
color:#00e5ff
}

.jogadaLinha{
display:flex;
gap:5px;
overflow-x:auto;
margin-top:5px
}

.bloco{
min-width:137px;
background:#111;
border:1px solid #00e5ff;
border-radius:8px;
padding:7px;
text-align:center
}

.bloco.um{
border-color:#ffc107
}

.bloco small{
display:block;
font-size:8px;
color:#888;
font-weight:900
}

.bloco strong{
font-size:21px;
display:block;
margin:3px
}

.nums{
border-top:1px solid #333;
padding-top:4px;
font-size:10px;
font-weight:900
}


/* TECLADO */

.teclado{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:4px;
margin-top:5px
}

.numero{
height:38px;
border:1px solid #666;
border-radius:6px;
color:white;
font-weight:900
}

.zero{
grid-column:span 6
}

@media(max-width:600px){

.app{padding:5px}

.timelineLinha{
grid-template-columns:38px 1fr 46px
}

.resultadoGL{
width:15px;
min-width:15px;
height:15px
}

}

</style>


<div class="app">

<h2>Análise 0 • 6 • 9</h2>


<div class="painel">

<textarea
id="entradaHistorico"
placeholder="Cole o histórico..."
></textarea>

<div class="acoes">

<button
id="inserir"
class="btn verde">
Inserir histórico
</button>

<button
id="apagarUltimo"
class="btn">
Apagar último
</button>

<button
id="apagarTudo"
class="btn vermelho">
Apagar tudo
</button>

</div>

<div
id="status"
class="status">
Pronto.
</div>

</div>


<div class="painel">

<div class="titulo">
CONTROLE RAIO X
</div>

<div class="modos">

<button id="auto" class="modo">
AUTO
</button>

<button id="m4" class="modo">
4
</button>

<button id="m5" class="modo">
5
</button>

<button id="m6" class="modo">
6
</button>

</div>


<div
id="momento"
class="momento">
</div>


<div class="timelineArea">

<div class="titulo">
DESEMPENHO REAL — ÚLTIMOS 20
</div>

<div
id="timeline4"
class="timelineLinha">
</div>

<div
id="timeline5"
class="timelineLinha">
</div>

<div
id="timeline6"
class="timelineLinha">
</div>

</div>

</div>


<div class="painel">

<div class="titulo">
ÚLTIMOS 14
</div>

<div class="linha">

<div class="rotulo">
ROLETA
</div>

<div id="linhaRoleta" class="scroll">
</div>

</div>

<div class="linha">

<div class="rotulo">
REGIÃO
</div>

<div id="linhaRegiao" class="scroll">
</div>

</div>

<div class="linha">

<div class="rotulo">
ID
</div>

<div id="linhaID" class="scroll">
</div>

</div>

</div>


<div class="painel">

<div class="jogadaTitulo">

<div class="titulo">
JOGADA SUGERIDA
</div>

<div
id="rxAtivo"
class="rxAtivo">
—
</div>

</div>

<div id="jogada">
</div>

</div>


<div class="painel">

<div class="titulo">
TECLADO 0–36
</div>

<div
id="teclado"
class="teclado">
</div>

</div>

</div>
`;


document.body.appendChild(app);


/* =========================================================
   DOM
========================================================= */

const statusArea =
document.getElementById("status");

const jogadaArea =
document.getElementById("jogada");

const rxAtivoArea =
document.getElementById("rxAtivo");


/* =========================================================
   TECLADO
========================================================= */

const teclado =
document.getElementById("teclado");


for(let n=1;n<=36;n++){

  const b =
    document.createElement("button");

  b.className="numero";

  b.textContent=n;

  b.style.background =
    corNumeroRoleta(n);

  b.onclick=() =>
    adicionarNumero(n);

  teclado.appendChild(b);
}


const bz =
document.createElement("button");

bz.className="numero zero";
bz.textContent="0";
bz.style.background="#087c48";
bz.onclick=() => adicionarNumero(0);

teclado.appendChild(bz);


/* =========================================================
   EVENTOS
========================================================= */

document.getElementById("auto")
.onclick=ativarAuto;

document.getElementById("m4")
.onclick=() => ativarManual(4);

document.getElementById("m5")
.onclick=() => ativarManual(5);

document.getElementById("m6")
.onclick=() => ativarManual(6);

document.getElementById("inserir")
.onclick=inserirHistorico;

document.getElementById("apagarUltimo")
.onclick=apagarUltimo;

document.getElementById("apagarTudo")
.onclick=apagarTudo;


/* =========================================================
   RENDER TIMELINE
========================================================= */

function renderTimeline(rx){

  const area =
    document.getElementById(
      "timeline"+rx
    );

  const timeline =
    estado.timeline[rx]
      .slice(-20);

  const est =
    estatisticaTimeline(rx);


  const caixas =
    timeline
    .map(item => {

      return (
        '<span class="' +
        'resultadoGL ' +
        (
          item.green
          ? 'green'
          : 'loss'
        ) +
        '" title="Resultado ' +
        item.resultado +
        '">' +

        (
          item.green
          ? 'G'
          : 'L'
        ) +

        '</span>'
      );

    })
    .join("");


  area.innerHTML =

    '<div class="timelineNome">' +
    'RX' + rx +
    '</div>' +

    '<div class="timeline">' +
    caixas +
    '</div>' +

    '<div class="timelineTaxa">' +
    (
      est.total
      ? est.taxa20.toFixed(0)+"%"
      : "—"
    ) +
    '</div>';
}


/* =========================================================
   RENDER MOMENTO
========================================================= */

function renderMomento(){

  const m =
    analisarEstadoAtual(
      historico
    );


  const total =
    m.baixos +
    m.altos;


  const baixo =
    total
    ?
    m.baixos/total*100
    :
    0;


  const alto =
    total
    ?
    m.altos/total*100
    :
    0;


  document
  .getElementById("momento")
  .innerHTML =

    '<div class="momentoBox">' +
    '<small>BAIXOS 1–18</small>' +
    '<strong>' +
    baixo.toFixed(0) +
    '%</strong>' +
    '</div>' +

    '<div class="momentoBox">' +
    '<small>ALTOS 19–36</small>' +
    '<strong>' +
    alto.toFixed(0) +
    '%</strong>' +
    '</div>' +

    '<div class="momentoBox">' +
    '<small>JANELA</small>' +
    '<strong>' +
    m.janela.length +
    '</strong>' +
    '</div>';
}


/* =========================================================
   RENDER ÚLTIMOS 14
========================================================= */

function render14(){

  const janela =
    historico.slice(-14);


  document
  .getElementById("linhaRoleta")
  .innerHTML =

    janela.map(n =>

      '<div class="bola" ' +
      'style="background:' +
      corNumeroRoleta(n) +
      '">' +
      n +
      '</div>'

    ).join("");


  document
  .getElementById("linhaRegiao")
  .innerHTML =

    janela.map(n => {

      const r =
        regiaoDoNumero(n);

      return (
        '<div class="regiao" ' +
        'style="background:' +
        (
          r
          ? coresRegioes[r]
          : "#555"
        ) +
        '">' +
        n +
        '</div>'
      );

    }).join("");


  document
  .getElementById("linhaID")
  .innerHTML =

    janela.map(n => {

      const ids =
        idsQueBatem(n);

      if(!ids.length){

        return (
          '<div class="id">—</div>'
        );

      }

      return (

        '<div class="id">' +

        ids.map(id =>

          '<span class="tag" ' +
          'style="background:' +
          corDoId(id) +
          '">' +
          id +
          '</span>'

        ).join("") +

        '</div>'

      );

    }).join("");
}


/* =========================================================
   RENDER CONTROLE
========================================================= */

function renderControle(resultado){

  ["auto","m4","m5","m6"]
  .forEach(id => {

    document
    .getElementById(id)
    .classList.remove(
      "ativo",
      "vencedor"
    );

  });


  if(
    estado.modo === "AUTO"
  ){

    document
    .getElementById("auto")
    .classList.add("ativo");


    if(
      resultado.auto.escolhido
    ){

      document
      .getElementById(
        "m" +
        resultado.auto.escolhido.tamanho
      )
      .classList.add(
        "vencedor"
      );

    }

  }

  else{

    document
    .getElementById(
      "m" +
      estado.manualRX
    )
    .classList.add(
      "ativo"
    );

  }

}


/* =========================================================
   RENDER JOGADA
========================================================= */

function renderJogada(rx){

  if(
    !rx ||
    !rx.valido
  ){

    rxAtivoArea.textContent="—";

    jogadaArea.innerHTML =
      '<div style="color:#777">' +
      'Aguardando dados.' +
      '</div>';

    return;
  }


  rxAtivoArea.textContent =

    "RX" +
    rx.tamanho +

    (
      estado.modo === "AUTO"
      ? " • AUTO"
      : " • MANUAL"
    );


  const dois =
    rx.jogada.blocos2
    .map(b =>

      '<div class="bloco">' +

      '<small>2 VIZINHOS DO</small>' +

      '<strong>' +
      b.centro +
      '</strong>' +

      '<div class="nums">' +
      b.numeros.join(" • ") +
      '</div>' +

      '</div>'

    ).join("");


  const um =
    rx.jogada.blocos1
    .map(b =>

      '<div class="bloco um">' +

      '<small>1 VIZINHO DO</small>' +

      '<strong>' +
      b.centro +
      '</strong>' +

      '<div class="nums">' +
      b.numeros.join(" • ") +
      '</div>' +

      '</div>'

    ).join("");


  jogadaArea.innerHTML =

    '<div class="jogadaLinha">' +
    dois +
    '</div>' +

    '<div class="jogadaLinha">' +
    um +
    '</div>';
}


/* =========================================================
   RENDER
========================================================= */

function render(){

  /*
    Calcula RX4, RX5 e RX6
    simultaneamente.
  */

  const resultado =
    calcularTudo();


  renderControle(
    resultado
  );

  renderMomento();

  renderTimeline(4);
  renderTimeline(5);
  renderTimeline(6);

  render14();

  renderJogada(
    resultado.ativo
  );


  /*
    Diagnóstico interno.
  */

  console.table(

    resultado.auto.ranking
    .map(rx => {

      const e =
        estatisticaTimeline(
          rx.tamanho
        );

      return {

        RX:rx.tamanho,

        NOTA:
          rx.forcaAuto
          .toFixed(1),

        "10":
          e.taxa10
          .toFixed(0) +
          "%",

        "20":
          e.taxa20
          .toFixed(0) +
          "%",

        LOSS:
          e.sequenciaLoss,

        SIM:
          rx.similaridade
          .toFixed(1) +
          "%",

        ATIVO:
          resultado.auto.escolhido &&
          resultado.auto.escolhido.tamanho ===
          rx.tamanho
          ? "SIM"
          : ""

      };

    })

  );

}


/* =========================================================
   PRIMEIRA INICIALIZAÇÃO

   Se ainda não existe snapshot,
   render() cria as três jogadas
   aguardando o próximo número.
========================================================= */

render();

})();
