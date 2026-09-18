(function () {
"use strict";

/* =========================================================
   ANALISADOR 0 • 6 • 9
   MOTOR ADAPTATIVO COMPLETO — V10.4

   CORREÇÃO PRINCIPAL:
   - TRIO DE TERMINAIS = SOMENTE ÚLTIMOS 14
   - NÃO USA MAIS 20 PARA ESCOLHER O TRIO
   - NÃO É "OS 3 TERMINAIS QUE MAIS SAÍRAM"
   - BUSCA PRIMEIRO TRIOS COM 100% DE COBERTURA NOS 14
   - CADA TERMINAL DO TRIO TRABALHA COM ±1 TERMINAL
   - HAVENDO VÁRIOS 100%, DESEMPATA PELO MOMENTO MAIS RECENTE
   - TRIO É RECALCULADO A CADA NOVO NÚMERO
   - NÃO FICA PRESO EM 0/4/7
   - AUTO CONTINUA ESCOLHENDO RX4/RX5/RX6
   - RX CONTINUA SENDO A BASE DA JOGADA
   - 1 LOSS CONTINUA SENDO DIAGNOSTICADO
   - SEM OFFSET GLOBAL
========================================================= */

const STORAGE_KEY =
  "ANALISADOR_069_IDS_CORRESPONDENTES_V1";

const STORAGE_ENGINE =
  "ANALISADOR_069_ENGINE_COMPLETO_V10_4";

const MAX_HISTORICO = 5000;
const MAX_TIMELINE = 300;

const JANELA_VISUAL = 14;
const JANELA_MOMENTO = 14;

const RX_LIST = [4,5,6];

const MIN_REPLICAS = 15;
const MAX_REPLICAS = 40;
const PCT_REPLICAS = 0.10;

const TOTAL_COBERTURA = 28;

const COR_T0 = "#00c853";
const COR_T6 = "#ffc107";
const COR_T9 = "#2196f3";


/* =========================================================
   ROLETA
========================================================= */

const track = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

const vermelhos = new Set([
  1,3,5,7,9,
  12,14,16,18,
  19,21,23,25,27,
  30,32,34,36
]);

const regioes = {
  ZERO:new Set([
    0,32,15,26,3,35,12
  ]),

  VOISINS:new Set([
    19,4,21,2,25,
    28,7,29,18,22
  ]),

  ORPHELINS:new Set([
    9,31,14,20,1,17,6,34
  ]),

  TIERS:new Set([
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


/* =========================================================
   IDS
========================================================= */

const BASES = [
  0,10,20,30,
  6,16,26,36,
  9,19,29
];

const TODOS_IDS = [
  0,10,20,30,
  6,16,26,36,
  9,19,29,39
];

const ESPECIAIS = {
  25:[39],
  17:[9],
  2:[9]
};


/* =========================================================
   ESTADO
========================================================= */

let historico = carregarHistorico();

let estado = {

  modo:"AUTO",
  manualRX:6,

  pendentes:{
    AUTO:null,
    4:null,
    5:null,
    6:null
  },

  timelines:{
    AUTO:[],
    4:[],
    5:[],
    6:[]
  },

  ultimaEscolha:null
};

carregarEstado();


/* =========================================================
   STORAGE
========================================================= */

function carregarHistorico(){

  try{

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if(!raw){
      return [];
    }

    const arr =
      JSON.parse(raw);

    if(!Array.isArray(arr)){
      return [];
    }

    return arr
      .map(Number)
      .filter(n =>
        Number.isInteger(n) &&
        n >= 0 &&
        n <= 36
      )
      .slice(-MAX_HISTORICO);

  }catch(erro){

    console.error(erro);

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

    console.error(erro);
  }
}


function carregarEstado(){

  try{

    const raw =
      localStorage.getItem(
        STORAGE_ENGINE
      );

    if(!raw){
      return;
    }

    const salvo =
      JSON.parse(raw);


    if(
      salvo.modo === "AUTO" ||
      salvo.modo === "MANUAL"
    ){
      estado.modo =
        salvo.modo;
    }


    if(
      RX_LIST.includes(
        salvo.manualRX
      )
    ){
      estado.manualRX =
        salvo.manualRX;
    }


    if(salvo.pendentes){

      estado.pendentes =
        Object.assign(
          estado.pendentes,
          salvo.pendentes
        );
    }


    if(salvo.timelines){

      ["AUTO",4,5,6]
        .forEach(k => {

          if(
            Array.isArray(
              salvo.timelines[k]
            )
          ){

            estado.timelines[k] =
              salvo.timelines[k]
                .slice(
                  -MAX_TIMELINE
                );
          }
        });
    }


    if(salvo.ultimaEscolha){

      estado.ultimaEscolha =
        salvo.ultimaEscolha;
    }

  }catch(erro){

    console.error(erro);
  }
}


function salvarEstado(){

  try{

    localStorage.setItem(
      STORAGE_ENGINE,
      JSON.stringify(estado)
    );

  }catch(erro){

    console.error(erro);
  }
}


/* =========================================================
   RODA
========================================================= */

function indice(numero){

  return track.indexOf(numero);
}


function setor(
  centro,
  qtd
){

  const i =
    indice(centro);

  if(i < 0){
    return [];
  }

  const r = [];

  for(
    let d=-qtd;
    d<=qtd;
    d++
  ){

    r.push(
      track[
        (
          i+d+
          track.length
        ) %
        track.length
      ]
    );
  }

  return r;
}


function vizinhos(
  numero,
  qtd=1
){

  const i =
    indice(numero);

  if(i < 0){
    return [];
  }

  const r = [
    numero
  ];

  for(
    let d=1;
    d<=qtd;
    d++
  ){

    r.push(
      track[
        (
          i-d+
          track.length
        ) %
        track.length
      ]
    );

    r.push(
      track[
        (
          i+d
        ) %
        track.length
      ]
    );
  }

  return r;
}


function distanciaRoda(a,b){

  const ia =
    indice(a);

  const ib =
    indice(b);

  if(
    ia < 0 ||
    ib < 0
  ){
    return 99;
  }

  const d =
    Math.abs(
      ia-ib
    );

  return Math.min(
    d,
    track.length-d
  );
}


/* =========================================================
   REGIÃO / COR / ALTURA
========================================================= */

function regiao(numero){

  if(
    regioes.ZERO.has(numero)
  ){
    return "ZERO";
  }

  if(
    regioes.VOISINS.has(numero)
  ){
    return "VOISINS";
  }

  if(
    regioes.ORPHELINS.has(numero)
  ){
    return "ORPHELINS";
  }

  if(
    regioes.TIERS.has(numero)
  ){
    return "TIERS";
  }

  return null;
}


function corRoleta(numero){

  if(numero === 0){
    return "#087c48";
  }

  return vermelhos.has(numero)
    ? "#c6283d"
    : "#181818";
}


function altura(numero){

  if(numero === 0){
    return "ZERO";
  }

  return numero <= 18
    ? "BAIXO"
    : "ALTO";
}


/* =========================================================
   TERMINAIS
========================================================= */

function terminal(numero){

  return numero % 10;
}


function terminalAnterior(t){

  return (
    t+9
  ) % 10;
}


function terminalSeguinte(t){

  return (
    t+1
  ) % 10;
}


function terminalNaVizinhanca(
  terminalNumero,
  terminalCentro
){

  return (
    terminalNumero === terminalCentro ||
    terminalNumero === terminalAnterior(
      terminalCentro
    ) ||
    terminalNumero === terminalSeguinte(
      terminalCentro
    )
  );
}


/* =========================================================
   COMBINAÇÕES DE 3 TERMINAIS
========================================================= */

const COMBINACOES_TRIO = [];

for(
  let a=0;
  a<=7;
  a++
){

  for(
    let b=a+1;
    b<=8;
    b++
  ){

    for(
      let c=b+1;
      c<=9;
      c++
    ){

      COMBINACOES_TRIO.push([
        a,b,c
      ]);
    }
  }
}


/* =========================================================
   COBERTURA DE UM TRIO
========================================================= */

function trioAcertaNumero(
  trio,
  numero
){

  const t =
    terminal(numero);

  return trio.some(
    centro =>
      terminalNaVizinhanca(
        t,
        centro
      )
  );
}


/* =========================================================
   COBERTURA TERMINAL DO TRIO
========================================================= */

function coberturaTerminaisTrio(
  trio
){

  const cobertos =
    new Set();

  trio.forEach(t => {

    cobertos.add(t);

    cobertos.add(
      terminalAnterior(t)
    );

    cobertos.add(
      terminalSeguinte(t)
    );
  });

  return cobertos;
}


/* =========================================================
   ESTATÍSTICA DO TRIO NUMA JANELA
========================================================= */

function estatisticaTrio(
  trio,
  janela
){

  let acertos = 0;

  let direto = 0;
  let vizinho = 0;

  let falhas = 0;

  let pesoRecente = 0;
  let pesoPossivel = 0;


  janela.forEach(
    (numero,index) => {

      const t =
        terminal(numero);

      const peso =
        index + 1;

      pesoPossivel +=
        peso;


      if(
        trio.includes(t)
      ){

        acertos++;
        direto++;

        pesoRecente +=
          peso;
      }

      else if(
        trio.some(
          centro =>
            t === terminalAnterior(
              centro
            ) ||
            t === terminalSeguinte(
              centro
            )
        )
      ){

        acertos++;
        vizinho++;

        /*
          Vizinho conta como acerto,
          mas o terminal central recebe
          desempate um pouco maior.
        */
        pesoRecente +=
          peso*.82;
      }

      else{

        falhas++;
      }
    });


  const taxa =
    janela.length
      ? acertos /
        janela.length *
        100
      : 0;


  const scoreRecente =
    pesoPossivel
      ? pesoRecente /
        pesoPossivel *
        100
      : 0;


  return {
    acertos,
    direto,
    vizinho,
    falhas,
    taxa,
    scoreRecente
  };
}


/* =========================================================
   TRIO DE TERMINAIS DO MOMENTO

   DEFINITIVO:

   - SOMENTE ÚLTIMOS 14
   - NÃO USA 20
   - NÃO USA HISTÓRICO ANTIGO
   - NÃO ESCOLHE POR FREQUÊNCIA BRUTA
   - TESTA TODOS OS 120 TRIOS
   - PRIMEIRO PROCURA 100% NOS 14
   - ENTRE OS 100%, PRIORIZA:
       1) comportamento últimos 5
       2) comportamento últimos 8
       3) mais acerto DIRETO
       4) menor cobertura total de terminais
          para evitar trio largo demais
       5) recência
========================================================= */

function calcularTrioTerminais(
  base
){

  const janela14 =
    base.slice(-14);

  if(!janela14.length){

    return {
      trio:[],
      taxa14:0,
      taxa8:0,
      taxa5:0,
      direto14:0,
      vizinho14:0,
      falhas14:0,
      cobertura:[],
      candidatos100:0,
      ranking:[]
    };
  }


  const janela8 =
    janela14.slice(-8);

  const janela5 =
    janela14.slice(-5);


  const ranking =
    COMBINACOES_TRIO
      .map(trio => {

        const e14 =
          estatisticaTrio(
            trio,
            janela14
          );

        const e8 =
          estatisticaTrio(
            trio,
            janela8
          );

        const e5 =
          estatisticaTrio(
            trio,
            janela5
          );


        const cobertura =
          coberturaTerminaisTrio(
            trio
          );


        /*
          SCORE NÃO SUBSTITUI A REGRA
          DO 100%.

          Ele só desempata trios que
          possuem a mesma taxa.
        */
        const score =

          e14.taxa * 100000 +

          e5.taxa * 1000 +

          e8.taxa * 500 +

          e14.direto * 35 +

          e5.direto * 55 +

          e14.scoreRecente * 2 -

          cobertura.size * 4;


        return {

          trio:
            trio.slice(),

          taxa14:
            e14.taxa,

          taxa8:
            e8.taxa,

          taxa5:
            e5.taxa,

          direto14:
            e14.direto,

          vizinho14:
            e14.vizinho,

          falhas14:
            e14.falhas,

          direto5:
            e5.direto,

          scoreRecente:
            e14.scoreRecente,

          cobertura:
            Array.from(
              cobertura
            ).sort(
              (a,b)=>a-b
            ),

          coberturaQtd:
            cobertura.size,

          score
        };
      });


  ranking.sort(
    (a,b) => {

      /*
        PRIMEIRO:
        maior taxa nos 14.
      */
      if(
        b.taxa14 !==
        a.taxa14
      ){

        return (
          b.taxa14 -
          a.taxa14
        );
      }


      /*
        Se ambos são 100%,
        o momento mais recente
        decide.
      */
      if(
        b.taxa5 !==
        a.taxa5
      ){

        return (
          b.taxa5 -
          a.taxa5
        );
      }


      if(
        b.taxa8 !==
        a.taxa8
      ){

        return (
          b.taxa8 -
          a.taxa8
        );
      }


      /*
        Prefere o trio que realmente
        está pegando os terminais
        centrais, e não somente
        sobrevivendo pelos vizinhos.
      */
      if(
        b.direto5 !==
        a.direto5
      ){

        return (
          b.direto5 -
          a.direto5
        );
      }


      if(
        b.direto14 !==
        a.direto14
      ){

        return (
          b.direto14 -
          a.direto14
        );
      }


      /*
        Evita escolher automaticamente
        a combinação que cobre mais
        terminais apenas por ser larga.
      */
      if(
        a.coberturaQtd !==
        b.coberturaQtd
      ){

        return (
          a.coberturaQtd -
          b.coberturaQtd
        );
      }


      if(
        b.scoreRecente !==
        a.scoreRecente
      ){

        return (
          b.scoreRecente -
          a.scoreRecente
        );
      }


      return (
        b.score -
        a.score
      );
    }
  );


  /*
    PROCURA PRIMEIRO OS 100%.
  */
  const perfeitos =
    ranking.filter(
      x =>
        Math.abs(
          x.taxa14-100
        ) < .0001
    );


  const melhor =
    perfeitos.length
      ? perfeitos[0]
      : ranking[0];


  return {

    trio:
      melhor
        ? melhor.trio.slice()
        : [],

    taxa14:
      melhor
        ? melhor.taxa14
        : 0,

    taxa8:
      melhor
        ? melhor.taxa8
        : 0,

    taxa5:
      melhor
        ? melhor.taxa5
        : 0,

    direto14:
      melhor
        ? melhor.direto14
        : 0,

    vizinho14:
      melhor
        ? melhor.vizinho14
        : 0,

    falhas14:
      melhor
        ? melhor.falhas14
        : 0,

    cobertura:
      melhor
        ? melhor.cobertura.slice()
        : [],

    candidatos100:
      perfeitos.length,

    ranking
  };
}


/* =========================================================
   IDS 0/6/9
========================================================= */

const cobertura = {};

BASES.forEach(base => {

  cobertura[base] =
    new Set(
      vizinhos(
        base,
        1
      )
    );
});


function familia(id){

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


function corId(id){

  const f =
    familia(id);

  if(f === 0){
    return COR_T0;
  }

  if(f === 6){
    return COR_T6;
  }

  if(f === 9){
    return COR_T9;
  }

  return "#555";
}


function idsQueBatem(numero){

  const ids = [];

  BASES.forEach(base => {

    if(
      cobertura[base]
        .has(numero)
    ){

      ids.push(base);
    }
  });


  if(
    Object.prototype
      .hasOwnProperty.call(
        ESPECIAIS,
        numero
      )
  ){

    ESPECIAIS[numero]
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


function familiasQueBatem(numero){

  return new Set(

    idsQueBatem(numero)
      .map(familia)
      .filter(
        x => x !== null
      )
  );
}


/* =========================================================
   EVENTO RX
========================================================= */

function eventoNumero(numero){

  const f =
    familiasQueBatem(numero);

  return (
    (f.has(0) ? 1 : 0) |
    (f.has(6) ? 2 : 0) |
    (f.has(9) ? 4 : 0)
  );
}


function construirCache(base){

  const n =
    base.length;

  const eventos =
    new Uint8Array(n);

  for(
    let i=0;
    i<n;
    i++
  ){

    eventos[i] =
      eventoNumero(
        base[i]
      );
  }

  return {
    base,
    eventos
  };
}


/* =========================================================
   SIMILARIDADE RX
========================================================= */

function similaridadeJanelas(
  cache,
  a,
  b,
  tamanho
){

  let iguais = 0;
  let erro = 0;

  let a0=0;
  let a6=0;
  let a9=0;

  let b0=0;
  let b6=0;
  let b9=0;


  for(
    let k=0;
    k<tamanho;
    k++
  ){

    const ea =
      cache.eventos[a+k];

    const eb =
      cache.eventos[b+k];


    if(ea === eb){
      iguais++;
    }


    if(ea&1) a0++;
    if(ea&2) a6++;
    if(ea&4) a9++;

    if(eb&1) b0++;
    if(eb&2) b6++;
    if(eb&4) b9++;


    erro +=
      Math.abs(a0-b0);

    erro +=
      Math.abs(a6-b6);

    erro +=
      Math.abs(a9-b9);
  }


  const scoreEventos =
    iguais /
    tamanho *
    100;


  const maxErro =
    tamanho *
    tamanho *
    3;


  const scoreForma =
    Math.max(
      0,
      Math.min(
        1,
        1-(erro/maxErro)
      )
    ) *
    100;


  return (
    scoreEventos*.80 +
    scoreForma*.20
  );
}


/* =========================================================
   RAIO X
========================================================= */

function analisarRX(
  base,
  rx
){

  if(
    base.length <
    rx*2+18
  ){

    return {
      valido:false,
      rx,
      replicas:[],
      similaridade:0,
      rankingIds:[],
      sinal:{
        0:0,
        6:0,
        9:0
      }
    };
  }


  const cache =
    construirCache(base);


  const atualInicio =
    base.length-rx;


  const candidatos = [];


  for(
    let i=0;
    i+rx<atualInicio;
    i++
  ){

    const proximo =
      base[i+rx];


    if(
      proximo === undefined
    ){
      continue;
    }


    candidatos.push({

      inicio:i,

      proximo,

      similaridade:
        similaridadeJanelas(
          cache,
          atualInicio,
          i,
          rx
        )
    });
  }


  candidatos.sort(
    (a,b) => {

      if(
        b.similaridade !==
        a.similaridade
      ){

        return (
          b.similaridade -
          a.similaridade
        );
      }

      return (
        b.inicio -
        a.inicio
      );
    }
  );


  let qtd =
    Math.ceil(
      candidatos.length *
      PCT_REPLICAS
    );


  qtd =
    Math.max(
      MIN_REPLICAS,
      qtd
    );


  qtd =
    Math.min(
      MAX_REPLICAS,
      qtd,
      candidatos.length
    );


  const replicas =
    candidatos.slice(
      0,
      qtd
    );


  const contagem =
    new Map();


  TODOS_IDS.forEach(
    id =>
      contagem.set(
        id,
        0
      )
  );


  const familias = {
    0:0,
    6:0,
    9:0
  };


  function contarReplica(rep){

    const ids =
      idsQueBatem(
        rep.proximo
      );


    ids.forEach(id => {

      contagem.set(
        id,
        (
          contagem.get(id) ||
          0
        ) + 1
      );
    });


    const fs =
      Array.from(
        new Set(
          ids
            .map(familia)
            .filter(
              x => x !== null
            )
        )
      );


    if(fs.length){

      const parte =
        1 /
        fs.length;


      fs.forEach(f => {

        familias[f] +=
          parte;
      });
    }
  }


  replicas.forEach(
    contarReplica
  );


  function positivos(){

    return TODOS_IDS.filter(
      id =>
        (
          contagem.get(id) ||
          0
        ) > 0
    ).length;
  }


  let pos =
    qtd;


  while(
    positivos() < 8 &&
    pos < candidatos.length &&
    replicas.length <
      MAX_REPLICAS
  ){

    const rep =
      candidatos[pos++];


    replicas.push(rep);

    contarReplica(rep);
  }


  const rankingIds =
    TODOS_IDS
      .map(
        (id,ordem) => ({
          id,

          ocorrencias:
            contagem.get(id) ||
            0,

          ordem
        })
      )
      .filter(
        x =>
          x.ocorrencias > 0
      )
      .sort(
        (a,b) => {

          if(
            b.ocorrencias !==
            a.ocorrencias
          ){

            return (
              b.ocorrencias -
              a.ocorrencias
            );
          }

          return (
            a.ordem -
            b.ordem
          );
        }
      );


  const totalFamilias =
    familias[0] +
    familias[6] +
    familias[9];


  const sinal = {

    0:
      totalFamilias
        ? familias[0] /
          totalFamilias *
          100
        : 0,

    6:
      totalFamilias
        ? familias[6] /
          totalFamilias *
          100
        : 0,

    9:
      totalFamilias
        ? familias[9] /
          totalFamilias *
          100
        : 0
  };


  const similaridade =
    replicas.length
      ? replicas.reduce(
          (s,x) =>
            s+x.similaridade,
          0
        ) /
        replicas.length
      : 0;


  return {

    valido:
      replicas.length > 0,

    rx,

    replicas,

    similaridade,

    rankingIds,

    sinal
  };
}


/* =========================================================
   MOMENTO — EXATAMENTE ÚLTIMOS 14
========================================================= */

function analisarMomento(
  base
){

  const janela =
    base.slice(-14);


  const r = {

    tamanho:
      janela.length,

    alto:0,
    baixo:0,

    vermelho:0,
    preto:0,

    regioes:{
      ZERO:0,
      VOISINS:0,
      ORPHELINS:0,
      TIERS:0
    },

    trioTerminais:
      calcularTrioTerminais(
        base
      ),

    roda:
      new Map()
  };


  track.forEach(
    n =>
      r.roda.set(
        n,
        0
      )
  );


  janela.forEach(numero => {

    if(numero !== 0){

      if(numero <= 18){
        r.baixo++;
      }
      else{
        r.alto++;
      }


      if(
        vermelhos.has(numero)
      ){
        r.vermelho++;
      }
      else{
        r.preto++;
      }
    }


    const rg =
      regiao(numero);


    if(rg){
      r.regioes[rg]++;
    }


    track.forEach(alvo => {

      const d =
        distanciaRoda(
          numero,
          alvo
        );


      let peso = 0;


      if(d === 0){
        peso = 1;
      }

      else if(d === 1){
        peso = .55;
      }

      else if(d === 2){
        peso = .25;
      }


      if(peso){

        r.roda.set(
          alvo,
          (
            r.roda.get(alvo) ||
            0
          ) +
          peso
        );
      }
    });
  });


  return r;
}


/* =========================================================
   FREQUÊNCIA DAS RÉPLICAS
========================================================= */

function frequenciaReplicas(
  replicas
){

  const freq =
    new Map();


  track.forEach(
    n =>
      freq.set(
        n,
        0
      )
  );


  replicas.forEach(rep => {

    freq.set(
      rep.proximo,

      (
        freq.get(
          rep.proximo
        ) ||
        0
      ) + 1
    );
  });


  return freq;
}


/* =========================================================
   SCORE DO TRIO

   IMPORTANTE:

   O TRIO NÃO MONTA A JOGADA SOZINHO.

   ELE AJUDA O RX A ESCOLHER ENTRE
   SETORES COM SUPORTE HISTÓRICO.

   TERMINAL CENTRAL > VIZINHO.
========================================================= */

function scoreTrioTerminal(
  numero,
  momento
){

  const info =
    momento.trioTerminais;


  if(
    !info ||
    !Array.isArray(
      info.trio
    ) ||
    !info.trio.length
  ){
    return 0;
  }


  const t =
    terminal(numero);


  let melhor = 0;


  info.trio.forEach(
    centro => {

      if(
        t === centro
      ){

        melhor =
          Math.max(
            melhor,
            1
          );
      }

      else if(
        t === terminalAnterior(
          centro
        ) ||
        t === terminalSeguinte(
          centro
        )
      ){

        melhor =
          Math.max(
            melhor,
            .58
          );
      }
    }
  );


  /*
    Se o trio está em 100% nos 14,
    recebe confiança máxima.

    Se não existir trio 100%,
    usa a taxa real encontrada.
  */
  const confianca =
    info.taxa14 /
    100;


  return (
    melhor *
    confianca
  );
}


/* =========================================================
   LOSS ATUAL
========================================================= */

function diagnosticarLossAtual(){

  const lista =
    estado.timelines.AUTO;


  if(!lista.length){

    return {
      ativo:false,
      tipo:"SEM LOSS",
      intensidade:0
    };
  }


  const ultimo =
    lista[
      lista.length-1
    ];


  if(ultimo.green){

    return {
      ativo:false,
      tipo:"ESTRUTURA CONFIRMADA",
      intensidade:0
    };
  }


  const numero =
    ultimo.resultado;


  const t =
    terminal(numero);


  const rg =
    regiao(numero);


  const alt =
    altura(numero);


  const recentes =
    lista.slice(-5);


  const losses =
    recentes.filter(
      x => !x.green
    );


  let mesmoTerminal = 0;
  let mesmaRegiao = 0;
  let mesmaAltura = 0;
  let borda = 0;


  losses.forEach(x => {

    if(
      terminal(
        x.resultado
      ) === t
    ){
      mesmoTerminal++;
    }


    if(
      regiao(
        x.resultado
      ) === rg
    ){
      mesmaRegiao++;
    }


    if(
      altura(
        x.resultado
      ) === alt
    ){
      mesmaAltura++;
    }


    if(
      x.tipo === "FORA1"
    ){
      borda++;
    }
  });


  let intensidade = 1;

  let tipo =
    "QUEBRA ISOLADA";


  if(
    ultimo.tipo ===
    "FORA1"
  ){

    intensidade = 2;

    tipo =
      "QUEBRA DE BORDA";
  }


  if(
    mesmoTerminal >= 2 ||
    mesmaRegiao >= 2 ||
    mesmaAltura >= 3 ||
    borda >= 2
  ){

    intensidade = 3;

    tipo =
      "MUDANÇA DETECTADA";
  }


  return {

    ativo:true,

    tipo,

    intensidade,

    numero,

    terminal:t,

    regiao:rg,

    altura:alt,

    mesmoTerminal,

    mesmaRegiao,

    mesmaAltura,

    borda
  };
}


/* =========================================================
   RESPOSTA AO LOSS
========================================================= */

function scoreRespostaLoss(
  numeros
){

  const d =
    diagnosticarLossAtual();


  if(!d.ativo){
    return 0;
  }


  let score = 0;


  numeros.forEach(n => {

    const t =
      terminal(n);


    if(
      t === d.terminal
    ){

      score +=
        .13 *
        d.intensidade;
    }


    else if(
      t === terminalAnterior(
        d.terminal
      ) ||
      t === terminalSeguinte(
        d.terminal
      )
    ){

      score +=
        .055 *
        d.intensidade;
    }


    if(
      regiao(n) ===
      d.regiao
    ){

      score +=
        .03 *
        d.intensidade;
    }


    if(
      n !== 0 &&
      altura(n) ===
      d.altura
    ){

      score +=
        .018 *
        d.intensidade;
    }
  });


  return (
    score /
    Math.max(
      1,
      numeros.length
    )
  );
}


/* =========================================================
   SCORE DO SETOR
========================================================= */

function avaliarSetor(
  centro,
  qtd,
  freq,
  momento,
  contexto=1
){

  const numeros =
    setor(
      centro,
      qtd
    );


  let score = 0;

  let suporte = 0;

  let suporteAlvo = 0;
  let suporteV1 = 0;
  let suporteV2 = 0;


  numeros.forEach(
    (numero,index) => {

      const f =
        freq.get(numero) ||
        0;


      suporte +=
        f;


      const d =
        Math.abs(
          index-qtd
        );


      let peso = 1;


      if(qtd === 2){

        if(d === 0){

          peso = 1.48;

          suporteAlvo +=
            f;
        }

        else if(d === 1){

          peso = 1.25;

          suporteV1 +=
            f;
        }

        else{

          peso = 1;

          suporteV2 +=
            f;
        }
      }

      else{

        if(d === 0){

          peso = 1.34;

          suporteAlvo +=
            f;
        }

        else{

          peso = 1.08;

          suporteV1 +=
            f;
        }
      }


      score +=
        f *
        peso;
    }
  );


  /* =======================================================
     BORDA EXTERNA
  ======================================================= */

  const ic =
    indice(centro);


  const foraEsq =
    track[
      (
        ic-qtd-1+
        track.length
      ) %
      track.length
    ];


  const foraDir =
    track[
      (
        ic+qtd+1
      ) %
      track.length
    ];


  const freqFora =
    (
      freq.get(
        foraEsq
      ) ||
      0
    ) +
    (
      freq.get(
        foraDir
      ) ||
      0
    );


  score -=
    freqFora *
    .35;


  /*
    Favorece suporte interno.
  */
  score +=
    suporteAlvo*.10 +
    suporteV1*.07;


  if(
    contexto > 0 &&
    momento.tamanho
  ){

    let roda = 0;
    let trio = 0;

    let altos = 0;
    let baixos = 0;

    let reds = 0;
    let blacks = 0;


    numeros.forEach(n => {

      roda +=
        momento.roda.get(n) ||
        0;


      trio +=
        scoreTrioTerminal(
          n,
          momento
        );


      if(n !== 0){

        if(n <= 18){
          baixos++;
        }
        else{
          altos++;
        }


        if(
          vermelhos.has(n)
        ){
          reds++;
        }
        else{
          blacks++;
        }
      }
    });


    roda /=
      numeros.length;


    trio /=
      numeros.length;


    const totalAB =
      momento.alto +
      momento.baixo;


    const totalCor =
      momento.vermelho +
      momento.preto;


    let scoreAB = 0;
    let scoreCor = 0;


    if(totalAB){

      const pa =
        momento.alto /
        totalAB;


      const ps =
        altos /
        Math.max(
          1,
          altos+baixos
        );


      scoreAB =
        1 -
        Math.abs(
          pa-ps
        );
    }


    if(totalCor){

      const pr =
        momento.vermelho /
        totalCor;


      const ps =
        reds /
        Math.max(
          1,
          reds+blacks
        );


      scoreCor =
        1 -
        Math.abs(
          pr-ps
        );
    }


    /*
      RX CONTINUA PRINCIPAL.

      O trio 14 entra como confirmação
      forte do momento.
    */
    score +=
      suporte *
      (
        roda*.025 +
        trio*.31 +
        scoreAB*.07 +
        scoreCor*.04
      ) *
      contexto;


    score +=
      suporte *
      scoreRespostaLoss(
        numeros
      ) *
      contexto;
  }


  return {

    centro,

    qtd,

    numeros,

    suporte,

    suporteAlvo,

    suporteV1,

    suporteV2,

    freqFora,

    score
  };
}


/* =========================================================
   JOGADA
========================================================= */

function montarJogada(
  rx,
  base,
  contexto=1
){

  if(
    !rx ||
    !rx.valido
  ){

    return {
      valido:false,
      blocos2:[],
      blocos1:[],
      numeros:new Set()
    };
  }


  /*
    FONTE PRIMÁRIA DA JOGADA:
    PRÓXIMOS REAIS DAS RÉPLICAS RX.
  */
  const freq =
    frequenciaReplicas(
      rx.replicas
    );


  /*
    MOMENTO:
    EXATAMENTE OS ÚLTIMOS 14.
  */
  const momento =
    analisarMomento(
      base
    );


  const candidatos2 =
    track
      .map(
        c =>
          avaliarSetor(
            c,
            2,
            freq,
            momento,
            contexto
          )
      )
      .sort(
        (a,b) =>
          b.score-a.score
      );


  const candidatos1 =
    track
      .map(
        c =>
          avaliarSetor(
            c,
            1,
            freq,
            momento,
            contexto
          )
      )
      .sort(
        (a,b) =>
          b.score-a.score
      );


  let melhor = null;


  /*
    Testa cada candidato 1V.

    Depois procura 5 setores 2V
    sem sobreposição.

    Total = 28 números.
  */
  for(
    const um
    of candidatos1
  ){

    const usados =
      new Set(
        um.numeros
      );


    const dois = [];


    let score =
      um.score;


    for(
      const candidato
      of candidatos2
    ){

      const conflito =
        candidato.numeros
          .some(
            n =>
              usados.has(n)
          );


      if(conflito){
        continue;
      }


      dois.push(
        candidato
      );


      score +=
        candidato.score;


      candidato.numeros
        .forEach(
          n =>
            usados.add(n)
        );


      if(
        dois.length === 5
      ){
        break;
      }
    }


    if(
      dois.length === 5 &&
      usados.size ===
      TOTAL_COBERTURA
    ){

      if(
        !melhor ||
        score >
        melhor.score
      ){

        melhor = {

          valido:true,

          blocos2:
            dois,

          blocos1:[
            um
          ],

          numeros:
            usados,

          score,

          trioTerminais:
            momento
              .trioTerminais
              .trio
              .slice(),

          trioTaxa14:
            momento
              .trioTerminais
              .taxa14,

          trioTaxa5:
            momento
              .trioTerminais
              .taxa5,

          candidatosTrio100:
            momento
              .trioTerminais
              .candidatos100,

          coberturaTrio:
            momento
              .trioTerminais
              .cobertura
              .slice()
        };
      }
    }
  }


  if(!melhor){

    return {
      valido:false,
      blocos2:[],
      blocos1:[],
      numeros:new Set()
    };
  }


  return melhor;
}


/* =========================================================
   CLASSIFICA RESULTADO
========================================================= */

function classificarResultadoJogada(
  numero,
  jogada
){

  if(
    !jogada ||
    !jogada.valido
  ){

    return {
      green:false,
      tipo:"FORA",
      distancia:99
    };
  }


  const blocosCobertura = [];


  jogada.blocos2
    .forEach(b => {

      if(
        b.numeros.includes(
          numero
        )
      ){

        blocosCobertura.push({
          centro:b.centro,
          qtd:2
        });
      }
    });


  jogada.blocos1
    .forEach(b => {

      if(
        b.numeros.includes(
          numero
        )
      ){

        blocosCobertura.push({
          centro:b.centro,
          qtd:1
        });
      }
    });


  if(
    blocosCobertura.length
  ){

    let menor = 99;


    blocosCobertura
      .forEach(b => {

        const d =
          distanciaRoda(
            numero,
            b.centro
          );


        if(d < menor){
          menor = d;
        }
      });


    if(menor === 0){

      return {
        green:true,
        tipo:"ALVO",
        distancia:0
      };
    }


    if(menor === 1){

      return {
        green:true,
        tipo:"V1",
        distancia:1
      };
    }


    return {
      green:true,
      tipo:"V2",
      distancia:2
    };
  }


  let melhorFora = 99;


  jogada.blocos2
    .forEach(b => {

      const d =
        distanciaRoda(
          numero,
          b.centro
        ) - 2;


      if(
        d > 0 &&
        d < melhorFora
      ){

        melhorFora =
          d;
      }
    });


  jogada.blocos1
    .forEach(b => {

      const d =
        distanciaRoda(
          numero,
          b.centro
        ) - 1;


      if(
        d > 0 &&
        d < melhorFora
      ){

        melhorFora =
          d;
      }
    });


  if(
    melhorFora === 1
  ){

    return {
      green:false,
      tipo:"FORA1",
      distancia:1
    };
  }


  if(
    melhorFora === 2
  ){

    return {
      green:false,
      tipo:"FORA2",
      distancia:2
    };
  }


  return {
    green:false,
    tipo:"FORA",
    distancia:melhorFora
  };
}


/* =========================================================
   CONFIG
========================================================= */

function gerarConfig(
  base,
  rxTam,
  contexto=1
){

  const rx =
    analisarRX(
      base,
      rxTam
    );


  if(!rx.valido){

    return {
      valido:false,
      rx:rxTam
    };
  }


  const jogada =
    montarJogada(
      rx,
      base,
      contexto
    );


  return {

    valido:
      jogada.valido,

    rx:
      rxTam,

    contexto,

    raioX:
      rx,

    jogada,

    similaridade:
      rx.similaridade
  };
}


/* =========================================================
   BACKTEST
========================================================= */

function backtest(
  base,
  rxTam,
  contexto=1
){

  const timeline = [];

  const minimo = 45;


  if(
    base.length <= minimo
  ){

    return estatBacktest(
      timeline
    );
  }


  const inicio =
    Math.max(
      minimo,
      base.length-20
    );


  for(
    let i=inicio;
    i<base.length;
    i++
  ){

    const passado =
      base.slice(
        0,
        i
      );


    const cfg =
      gerarConfig(
        passado,
        rxTam,
        contexto
      );


    if(!cfg.valido){
      continue;
    }


    const real =
      base[i];


    const qualidade =
      classificarResultadoJogada(
        real,
        cfg.jogada
      );


    timeline.push({

      resultado:
        real,

      green:
        qualidade.green,

      tipo:
        qualidade.tipo,

      distancia:
        qualidade.distancia,

      terminal:
        terminal(real),

      regiao:
        regiao(real),

      altura:
        altura(real),

      trioTerminais:
        cfg.jogada
          .trioTerminais
          .slice(),

      trioTaxa14:
        cfg.jogada
          .trioTaxa14
    });
  }


  return estatBacktest(
    timeline
  );
}


/* =========================================================
   ESTATÍSTICA BACKTEST
========================================================= */

function estatBacktest(
  timeline
){

  function taxa(arr){

    if(!arr.length){
      return 0;
    }

    return (
      arr.filter(
        x => x.green
      ).length /
      arr.length *
      100
    );
  }


  function qualidade(arr){

    const q = {

      total:
        arr.length,

      green:0,

      alvo:0,
      v1:0,
      v2:0,

      fora1:0,
      fora2:0,
      fora:0,

      interno:0,

      pctInterno:0,
      pctBorda:0
    };


    arr.forEach(x => {

      if(x.green){
        q.green++;
      }


      if(
        x.tipo === "ALVO"
      ){
        q.alvo++;
      }

      else if(
        x.tipo === "V1"
      ){
        q.v1++;
      }

      else if(
        x.tipo === "V2"
      ){
        q.v2++;
      }

      else if(
        x.tipo === "FORA1"
      ){
        q.fora1++;
      }

      else if(
        x.tipo === "FORA2"
      ){
        q.fora2++;
      }

      else{
        q.fora++;
      }
    });


    q.interno =
      q.alvo +
      q.v1;


    if(q.green){

      q.pctInterno =
        q.interno /
        q.green *
        100;


      q.pctBorda =
        q.v2 /
        q.green *
        100;
    }


    return q;
  }


  let loss = 0;


  for(
    let i=timeline.length-1;
    i>=0;
    i--
  ){

    if(
      timeline[i].green
    ){
      break;
    }

    loss++;
  }


  return {

    total:
      timeline.length,

    taxa5:
      taxa(
        timeline.slice(-5)
      ),

    taxa10:
      taxa(
        timeline.slice(-10)
      ),

    taxa20:
      taxa(
        timeline.slice(-20)
      ),

    lossSeguidos:
      loss,

    qualidade5:
      qualidade(
        timeline.slice(-5)
      ),

    qualidade10:
      qualidade(
        timeline.slice(-10)
      ),

    qualidade20:
      qualidade(
        timeline.slice(-20)
      ),

    timeline
  };
}


/* =========================================================
   BUSCA ADAPTATIVA
========================================================= */

const CONTEXTOS = [
  0,
  .5,
  1
];


function melhorDoRX(
  base,
  rxTam
){

  let melhor = null;


  for(
    const contexto
    of CONTEXTOS
  ){

    const cfg =
      gerarConfig(
        base,
        rxTam,
        contexto
      );


    if(!cfg.valido){
      continue;
    }


    const bt =
      backtest(
        base,
        rxTam,
        contexto
      );


    let score =

      bt.taxa5*.35 +

      bt.taxa10*.35 +

      bt.taxa20*.25 +

      cfg.similaridade*.05;


    if(
      bt.qualidade10.green >= 3
    ){

      score +=
        bt.qualidade10
          .pctInterno *
        .035;


      score -=
        bt.qualidade10
          .pctBorda *
        .012;
    }


    const ult5 =
      bt.timeline.slice(-5);


    const fora1 =
      ult5.filter(
        x =>
          x.tipo ===
          "FORA1"
      ).length;


    if(fora1 === 1){
      score -= 2;
    }


    if(fora1 >= 2){
      score -=
        fora1*3;
    }


    /*
      UM LOSS JÁ REDUZ ADERÊNCIA.
    */
    if(
      bt.lossSeguidos === 1
    ){
      score -= 5;
    }


    if(
      bt.lossSeguidos === 2
    ){
      score -= 15;
    }


    if(
      bt.lossSeguidos >= 3
    ){
      score -= 30;
    }


    if(
      bt.total >= 10
    ){

      if(
        bt.taxa10 >= 90
      ){
        score += 5;
      }

      else if(
        bt.taxa10 >= 85
      ){
        score -= 2;
      }

      else{
        score -= 8;
      }
    }


    /*
      TRIO DOS 14:

      se a jogada atual está casada
      com um trio que cobre 100% dos
      últimos 14, isso é informação
      do estado atual da mesa.

      Não substitui o RX.
    */
    if(
      cfg.jogada.trioTaxa14 >= 99.999
    ){
      score += 2;
    }


    const item = {

      valido:
        cfg.valido,

      rx:
        cfg.rx,

      contexto:
        cfg.contexto,

      raioX:
        cfg.raioX,

      jogada:
        cfg.jogada,

      similaridade:
        cfg.similaridade,

      backtest:
        bt,

      score
    };


    if(
      !melhor ||
      item.score >
      melhor.score
    ){

      melhor =
        item;
    }
  }


  return melhor;
}


/* =========================================================
   AUTO
========================================================= */

function escolherAuto(
  configs
){

  const disponiveis =
    RX_LIST
      .map(
        rx =>
          configs[rx]
      )
      .filter(Boolean)
      .filter(
        x => x.valido
      );


  if(!disponiveis.length){
    return null;
  }


  disponiveis.sort(
    (a,b) => {

      if(
        b.backtest.taxa5 !==
        a.backtest.taxa5
      ){

        return (
          b.backtest.taxa5 -
          a.backtest.taxa5
        );
      }


      if(
        b.backtest.taxa10 !==
        a.backtest.taxa10
      ){

        return (
          b.backtest.taxa10 -
          a.backtest.taxa10
        );
      }


      if(
        b.backtest.taxa20 !==
        a.backtest.taxa20
      ){

        return (
          b.backtest.taxa20 -
          a.backtest.taxa20
        );
      }


      if(
        b.backtest
          .qualidade10
          .pctInterno !==
        a.backtest
          .qualidade10
          .pctInterno
      ){

        return (
          b.backtest
            .qualidade10
            .pctInterno -

          a.backtest
            .qualidade10
            .pctInterno
        );
      }


      if(
        a.backtest
          .lossSeguidos !==
        b.backtest
          .lossSeguidos
      ){

        return (
          a.backtest
            .lossSeguidos -

          b.backtest
            .lossSeguidos
        );
      }


      return (
        b.score -
        a.score
      );
    }
  );


  return disponiveis[0];
}


/* =========================================================
   ASSINATURA / SNAPSHOT
========================================================= */

function assinaturaHistorico(){

  return (
    historico.length +
    "|" +
    historico
      .slice(-32)
      .join(",")
  );
}


function snapshot(config){

  if(
    !config ||
    !config.valido
  ){
    return null;
  }


  return {

    assinatura:
      assinaturaHistorico(),

    rx:
      config.rx,

    contexto:
      config.contexto,

    numeros:
      Array.from(
        config.jogada.numeros
      ),

    centros2:
      config.jogada
        .blocos2
        .map(
          x => x.centro
        ),

    centro1:
      config.jogada
        .blocos1.length
        ? config.jogada
            .blocos1[0]
            .centro
        : null,

    trioTerminais:
      config.jogada
        .trioTerminais
        .slice(),

    trioTaxa14:
      config.jogada
        .trioTaxa14,

    hora:
      Date.now()
  };
}


/* =========================================================
   PENDENTES
========================================================= */

function garantirPendentes(
  configs,
  auto
){

  const sig =
    assinaturaHistorico();


  RX_LIST.forEach(rx => {

    const atual =
      estado.pendentes[rx];


    if(
      atual &&
      atual.assinatura === sig
    ){
      return;
    }


    estado.pendentes[rx] =
      snapshot(
        configs[rx]
      );
  });


  if(
    !estado.pendentes.AUTO ||
    estado.pendentes.AUTO
      .assinatura !== sig
  ){

    estado.pendentes.AUTO =
      snapshot(
        auto
      );
  }


  salvarEstado();
}


/* =========================================================
   CLASSIFICA SNAPSHOT
========================================================= */

function classificarSnapshot(
  numero,
  p
){

  if(!p){

    return {
      green:false,
      tipo:"FORA",
      distancia:99
    };
  }


  let melhorDentro = 99;


  if(
    Array.isArray(
      p.centros2
    )
  ){

    p.centros2
      .forEach(c => {

        const d =
          distanciaRoda(
            numero,
            c
          );


        if(
          d <= 2 &&
          d < melhorDentro
        ){

          melhorDentro =
            d;
        }
      });
  }


  if(
    p.centro1 !== null &&
    p.centro1 !== undefined
  ){

    const d =
      distanciaRoda(
        numero,
        p.centro1
      );


    if(
      d <= 1 &&
      d < melhorDentro
    ){

      melhorDentro =
        d;
    }
  }


  const green =
    Array.isArray(
      p.numeros
    ) &&
    p.numeros.includes(
      numero
    );


  if(green){

    if(
      melhorDentro === 0
    ){

      return {
        green:true,
        tipo:"ALVO",
        distancia:0
      };
    }


    if(
      melhorDentro === 1
    ){

      return {
        green:true,
        tipo:"V1",
        distancia:1
      };
    }


    return {
      green:true,
      tipo:"V2",
      distancia:2
    };
  }


  let melhorFora = 99;


  if(
    Array.isArray(
      p.centros2
    )
  ){

    p.centros2
      .forEach(c => {

        const d =
          distanciaRoda(
            numero,
            c
          ) - 2;


        if(
          d > 0 &&
          d < melhorFora
        ){

          melhorFora =
            d;
        }
      });
  }


  if(
    p.centro1 !== null &&
    p.centro1 !== undefined
  ){

    const d =
      distanciaRoda(
        numero,
        p.centro1
      ) - 1;


    if(
      d > 0 &&
      d < melhorFora
    ){

      melhorFora =
        d;
    }
  }


  if(
    melhorFora === 1
  ){

    return {
      green:false,
      tipo:"FORA1",
      distancia:1
    };
  }


  if(
    melhorFora === 2
  ){

    return {
      green:false,
      tipo:"FORA2",
      distancia:2
    };
  }


  return {
    green:false,
    tipo:"FORA",
    distancia:melhorFora
  };
}


/* =========================================================
   AVALIA PENDENTES
========================================================= */

function avaliarPendentes(
  numero
){

  const sigAntes =
    assinaturaHistorico();


  ["AUTO",4,5,6]
    .forEach(chave => {

      const p =
        estado.pendentes[chave];


      if(!p){
        return;
      }


      if(
        p.assinatura &&
        p.assinatura !==
        sigAntes
      ){

        estado.pendentes[chave] =
          null;

        return;
      }


      const resultado =
        classificarSnapshot(
          numero,
          p
        );


      estado.timelines[chave]
        .push({

          resultado:
            numero,

          green:
            resultado.green,

          tipo:
            resultado.tipo,

          distancia:
            resultado.distancia,

          terminal:
            terminal(numero),

          regiao:
            regiao(numero),

          altura:
            altura(numero),

          rx:
            p.rx,

          contexto:
            p.contexto,

          numeros:
            p.numeros.slice(),

          centros2:
            p.centros2.slice(),

          centro1:
            p.centro1,

          trioTerminais:
            Array.isArray(
              p.trioTerminais
            )
              ? p.trioTerminais
                  .slice()
              : [],

          trioTaxa14:
            p.trioTaxa14 || 0,

          hora:
            Date.now()
        });


      estado.timelines[chave] =
        estado.timelines[chave]
          .slice(
            -MAX_TIMELINE
          );


      estado.pendentes[chave] =
        null;
    });


  salvarEstado();
}


/* =========================================================
   LIVE STATS
========================================================= */

function statsTimeline(lista){

  function taxa(arr){

    if(!arr.length){
      return 0;
    }

    return (
      arr.filter(
        x => x.green
      ).length /
      arr.length *
      100
    );
  }


  let loss = 0;


  for(
    let i=lista.length-1;
    i>=0;
    i--
  ){

    if(
      lista[i].green
    ){
      break;
    }

    loss++;
  }


  return {

    total:
      lista.length,

    taxa5:
      taxa(
        lista.slice(-5)
      ),

    taxa10:
      taxa(
        lista.slice(-10)
      ),

    taxa20:
      taxa(
        lista.slice(-20)
      ),

    lossSeguidos:
      loss
  };
}


/* =========================================================
   8 IDS RX
========================================================= */

function montarOitoIds(rx){

  if(
    !rx ||
    !rx.valido
  ){
    return [];
  }


  const ranking =
    rx.rankingIds.slice();


  if(
    ranking.length < 8
  ){

    const contagem =
      new Map();


    TODOS_IDS.forEach(
      id =>
        contagem.set(
          id,
          0
        )
    );


    historico
      .slice(-20)
      .forEach(numero => {

        idsQueBatem(numero)
          .forEach(id => {

            contagem.set(
              id,
              (
                contagem.get(id) ||
                0
              ) + 1
            );
          });
      });


    TODOS_IDS
      .map(id => ({
        id,

        ocorrencias:
          contagem.get(id) ||
          0
      }))
      .filter(
        x =>
          x.ocorrencias > 0
      )
      .sort(
        (a,b) =>
          b.ocorrencias -
          a.ocorrencias
      )
      .forEach(x => {

        if(
          !ranking.some(
            r =>
              r.id === x.id
          )
        ){

          ranking.push({

            id:x.id,

            ocorrencias:
              x.ocorrencias,

            origem:"MESA"
          });
        }
      });
  }


  const primeiros =
    ranking.slice(
      0,
      9
    );


  const pos0 =
    primeiros.findIndex(
      x =>
        x.id === 0
    );


  const pos26 =
    primeiros.findIndex(
      x =>
        x.id === 26
    );


  const ambosNos8 =
    pos0 >= 0 &&
    pos0 < 8 &&
    pos26 >= 0 &&
    pos26 < 8;


  const saida = [];


  if(ambosNos8){

    let combinado = false;


    for(
      const item
      of primeiros
    ){

      if(
        item.id === 0 ||
        item.id === 26
      ){

        if(!combinado){

          const i0 =
            ranking.find(
              x =>
                x.id === 0
            );


          const i26 =
            ranking.find(
              x =>
                x.id === 26
            );


          saida.push({

            tipo:"ZERO26",

            label:"0 + 3",

            ocorrencias:
              (
                i0
                  ? i0.ocorrencias
                  : 0
              ) +
              (
                i26
                  ? i26.ocorrencias
                  : 0
              )
          });


          combinado = true;
        }
      }

      else{

        saida.push({

          tipo:"ID",

          id:item.id,

          ocorrencias:
            item.ocorrencias,

          origem:
            item.origem ||
            "RX"
        });
      }


      if(
        saida.length === 8
      ){
        break;
      }
    }
  }

  else{

    ranking
      .slice(0,8)
      .forEach(item => {

        saida.push({

          tipo:"ID",

          id:item.id,

          ocorrencias:
            item.ocorrencias,

          origem:
            item.origem ||
            "RX"
        });
      });
  }


  return saida.slice(
    0,
    8
  );
}


/* =========================================================
   INSERÇÃO
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

  render();
}


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
      n =>
        n >= 0 &&
        n <= 36
    )
    .slice(
      -MAX_HISTORICO
    );
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

    setStatus(
      "Nenhum número válido.",
      "#ff5252"
    );

    return;
  }


  historico =
    numeros;


  estado.pendentes = {
    AUTO:null,
    4:null,
    5:null,
    6:null
  };


  estado.timelines = {
    AUTO:[],
    4:[],
    5:[],
    6:[]
  };


  salvarHistorico();

  salvarEstado();


  campo.value = "";

  render();
}


function apagarUltimo(){

  if(!historico.length){
    return;
  }


  historico.pop();


  estado.pendentes = {
    AUTO:null,
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


  historico = [];


  estado = {

    modo:"AUTO",

    manualRX:6,

    pendentes:{
      AUTO:null,
      4:null,
      5:null,
      6:null
    },

    timelines:{
      AUTO:[],
      4:[],
      5:[],
      6:[]
    },

    ultimaEscolha:null
  };


  salvarHistorico();

  salvarEstado();

  render();
}


/* =========================================================
   UI
========================================================= */

document.body.innerHTML = "";

document.body.style.margin = "0";
document.body.style.background = "#101010";
document.body.style.color = "#fff";
document.body.style.fontFamily =
  "Arial,sans-serif";


const app =
  document.createElement(
    "div"
  );


app.innerHTML = `
<style>

*{
box-sizing:border-box
}

button,textarea{
font-family:Arial,sans-serif
}

button{
cursor:pointer;
touch-action:manipulation
}

.app{
max-width:900px;
margin:auto;
padding:6px
}

h2{
text-align:center;
margin:5px 0 9px;
font-size:21px
}

.painel{
background:#1d1d1f;
border:1px solid #444;
border-radius:10px;
padding:8px;
margin-bottom:7px
}

.titulo{
font-size:10px;
font-weight:900;
color:#aaa
}

textarea{
width:100%;
height:65px;
background:#111;
color:#fff;
border:1px solid #555;
border-radius:7px;
padding:7px
}

.acoes{
display:flex;
gap:5px;
flex-wrap:wrap;
margin-top:5px
}

.btn{
background:#333;
color:#fff;
border:1px solid #555;
border-radius:7px;
padding:7px 9px;
font-weight:900
}

.verde{
background:#146238
}

.vermelho{
background:#762832
}

.status{
font-size:10px;
font-weight:900;
color:#aaa;
margin-top:5px
}

.controle{
display:flex;
gap:4px;
align-items:center;
flex-wrap:wrap;
margin-top:5px
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
color:#fff
}

.modo.vencedor{
border-color:#00e5ff;
color:#00e5ff;
box-shadow:0 0 7px rgba(0,229,255,.45)
}

.motorGrid{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:4px;
margin-top:7px
}

.motorCard{
background:#111;
border:1px solid #333;
border-radius:7px;
padding:6px;
text-align:center
}

.motorCard small{
display:block;
font-size:7px;
font-weight:900;
color:#777
}

.motorCard strong{
display:block;
font-size:14px;
margin-top:3px
}

.ok90{
color:#00e676
}

.warn{
color:#ffc107
}

.bad{
color:#ff5252
}

.momento{
display:grid;
grid-template-columns:repeat(5,1fr);
gap:4px;
margin-top:7px
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
font-size:7px;
color:#777;
font-weight:900
}

.momentoBox strong{
font-size:14px
}

.trioPerfeito{
border-color:#00e676;
box-shadow:0 0 5px rgba(0,230,118,.25)
}

.timelineLinha{
display:grid;
grid-template-columns:45px 1fr 48px;
gap:4px;
align-items:center;
margin-top:4px
}

.timelineNome{
font-size:10px;
font-weight:900;
text-align:center
}

.timeline{
display:flex;
gap:2px;
overflow:hidden;
justify-content:flex-end
}

.gl{
width:16px;
min-width:16px;
height:16px;
border-radius:3px;
display:flex;
align-items:center;
justify-content:center;
font-size:7px;
font-weight:900
}

.greenGL{
background:#00a651
}

.lossGL{
background:#c62828
}

.timelineTaxa{
font-size:9px;
font-weight:900;
text-align:right
}

.linha{
display:grid;
grid-template-columns:55px minmax(0,1fr);
gap:4px;
align-items:center;
margin-top:5px
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
.regiaoBox,
.idBox{
min-width:33px;
height:33px;
display:flex;
align-items:center;
justify-content:center;
font-size:11px;
font-weight:900
}

.bola{
border-radius:50%;
border:2px solid #aaa
}

.regiaoBox{
border-radius:6px
}

.idBox{
background:#111;
border:1px solid #444;
border-radius:6px;
gap:2px
}

.idTag{
padding:5px 3px;
border-radius:4px
}

.sinais{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:4px;
margin-top:6px
}

.sinal{
background:#111;
border:1px solid #333;
border-radius:7px;
padding:6px;
text-align:center
}

.rxIds{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:4px;
margin-top:6px
}

.rxId{
background:#111;
border:1px solid #444;
border-radius:7px;
padding:7px;
text-align:center;
font-weight:900
}

.jogadaCab{
display:flex;
justify-content:space-between;
align-items:center;
gap:5px
}

.jogadaInfo{
font-size:11px;
font-weight:900;
color:#00e5ff
}

.jogadaLinha{
display:flex;
gap:5px;
overflow-x:auto;
margin-top:6px
}

.bloco{
min-width:138px;
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
font-size:7px;
font-weight:900;
color:#888
}

.bloco strong{
display:block;
font-size:21px;
margin:3px
}

.nums{
border-top:1px solid #333;
padding-top:4px;
font-size:10px;
font-weight:900
}

.teclado{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:4px;
margin-top:5px
}

.numeroBtn{
height:38px;
border:1px solid #666;
border-radius:6px;
color:#fff;
font-weight:900
}

.zeroBtn{
grid-column:span 6
}

@media(max-width:650px){

.motorGrid{
grid-template-columns:repeat(3,1fr)
}

.momento{
grid-template-columns:repeat(2,1fr)
}

.rxIds{
grid-template-columns:repeat(4,1fr)
}

.timelineLinha{
grid-template-columns:39px 1fr 43px
}

.gl{
width:14px;
min-width:14px;
height:14px
}

}

</style>


<div class="app">

<h2>Análise 0 • 6 • 9</h2>


<section class="painel">

<textarea
id="entradaHistorico"
placeholder="Cole o histórico do mais antigo para o mais recente..."
></textarea>

<div class="acoes">

<button
id="btnInserir"
class="btn verde">
Inserir histórico
</button>

<button
id="btnApagarUltimo"
class="btn">
Apagar último
</button>

<button
id="btnApagarTudo"
class="btn vermelho">
Apagar tudo
</button>

</div>

<div
id="statusArea"
class="status">
Pronto.
</div>

</section>


<section class="painel">

<div class="titulo">
MOTOR ADAPTATIVO
</div>

<div class="controle">

<button
id="auto"
class="modo">
AUTO
</button>

<button
id="rx4"
class="modo">
4
</button>

<button
id="rx5"
class="modo">
5
</button>

<button
id="rx6"
class="modo">
6
</button>

</div>


<div
id="motorGrid"
class="motorGrid">
</div>


<div
id="momento"
class="momento">
</div>


<div
style="margin-top:8px"
class="titulo">
LINHA DO TEMPO REAL — ÚLTIMOS 20
</div>


<div
id="timelineAUTO"
class="timelineLinha">
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

</section>


<section class="painel">

<div class="titulo">
ÚLTIMOS 14
</div>


<div class="linha">

<div class="rotulo">
ROLETA
</div>

<div
id="linhaRoleta"
class="scroll">
</div>

</div>


<div class="linha">

<div class="rotulo">
REGIÃO
</div>

<div
id="linhaRegiao"
class="scroll">
</div>

</div>


<div class="linha">

<div class="rotulo">
ID
</div>

<div
id="linhaID"
class="scroll">
</div>

</div>

</section>


<section class="painel">

<div
id="rxTitulo"
class="titulo">
RAIO X
</div>

<div
id="sinais"
class="sinais">
</div>

<div
id="rxIds"
class="rxIds">
</div>

</section>


<section class="painel">

<div class="jogadaCab">

<div class="titulo">
JOGADA SUGERIDA
</div>

<div
id="jogadaInfo"
class="jogadaInfo">
—
</div>

</div>

<div id="jogadaArea">
</div>

</section>


<section class="painel">

<div class="titulo">
TECLADO 0–36
</div>

<div
id="teclado"
class="teclado">
</div>

</section>

</div>
`;


document.body.appendChild(
  app
);


const statusArea =
  document.getElementById(
    "statusArea"
  );


const jogadaArea =
  document.getElementById(
    "jogadaArea"
  );


const jogadaInfo =
  document.getElementById(
    "jogadaInfo"
  );


/* =========================================================
   STATUS
========================================================= */

function setStatus(
  texto,
  cor="#aaa"
){

  statusArea.textContent =
    texto;

  statusArea.style.color =
    cor;
}


/* =========================================================
   TECLADO
========================================================= */

const teclado =
  document.getElementById(
    "teclado"
  );


for(
  let numero=1;
  numero<=36;
  numero++
){

  const btn =
    document.createElement(
      "button"
    );


  btn.className =
    "numeroBtn";


  btn.textContent =
    numero;


  btn.style.background =
    corRoleta(numero);


  btn.onclick = () =>
    adicionarNumero(
      numero
    );


  teclado.appendChild(
    btn
  );
}


const btnZero =
  document.createElement(
    "button"
  );


btnZero.className =
  "numeroBtn zeroBtn";


btnZero.textContent =
  "0";


btnZero.style.background =
  "#087c48";


btnZero.onclick = () =>
  adicionarNumero(0);


teclado.appendChild(
  btnZero
);


/* =========================================================
   BOTÕES
========================================================= */

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


document
  .getElementById(
    "auto"
  )
  .onclick = () => {

    estado.modo =
      "AUTO";

    salvarEstado();

    render();
  };


RX_LIST.forEach(rx => {

  document
    .getElementById(
      "rx"+rx
    )
    .onclick = () => {

      estado.modo =
        "MANUAL";

      estado.manualRX =
        rx;

      salvarEstado();

      render();
    };
});


/* =========================================================
   RENDER TIMELINE
========================================================= */

function renderTimeline(
  id,
  nome,
  lista
){

  const area =
    document.getElementById(
      id
    );


  const ultimos =
    lista.slice(-20);


  const st =
    statsTimeline(
      lista
    );


  const caixas =
    ultimos
      .map(x =>

        '<span class="gl '+
        (
          x.green
            ? "greenGL"
            : "lossGL"
        )+
        '" title="'+
        x.resultado+
        (
          x.tipo
            ? " • "+x.tipo
            : ""
        )+
        '">'+
        (
          x.green
            ? "G"
            : "L"
        )+
        '</span>'

      )
      .join("");


  area.innerHTML =

    '<div class="timelineNome">'+
    nome+
    '</div>'+

    '<div class="timeline">'+
    caixas+
    '</div>'+

    '<div class="timelineTaxa">'+
    (
      st.total
        ? st.taxa20.toFixed(0)+"%"
        : "—"
    )+
    '</div>';
}


/* =========================================================
   RENDER MOMENTO
========================================================= */

function renderMomento(){

  const m =
    analisarMomento(
      historico
    );


  const ab =
    m.alto +
    m.baixo;


  const cp =
    m.vermelho +
    m.preto;


  const baixo =
    ab
      ? m.baixo/ab*100
      : 0;


  const alto =
    ab
      ? m.alto/ab*100
      : 0;


  const red =
    cp
      ? m.vermelho/cp*100
      : 0;


  const black =
    cp
      ? m.preto/cp*100
      : 0;


  const trio =
    m.trioTerminais.trio;


  const trioTexto =
    trio.length
      ? trio
          .map(
            t => "T"+t
          )
          .join(" • ")
      : "—";


  const taxaTrio =
    m.trioTerminais
      .taxa14;


  const classe =
    taxaTrio >= 99.999
      ? "momentoBox trioPerfeito"
      : "momentoBox";


  document
    .getElementById(
      "momento"
    )
    .innerHTML =

    '<div class="momentoBox">'+
    '<small>BAIXO 1–18 • 14</small>'+
    '<strong>'+
    baixo.toFixed(0)+
    '%</strong>'+
    '</div>'+


    '<div class="momentoBox">'+
    '<small>ALTO 19–36 • 14</small>'+
    '<strong>'+
    alto.toFixed(0)+
    '%</strong>'+
    '</div>'+


    '<div class="momentoBox">'+
    '<small>VERMELHO • 14</small>'+
    '<strong>'+
    red.toFixed(0)+
    '%</strong>'+
    '</div>'+


    '<div class="momentoBox">'+
    '<small>PRETO • 14</small>'+
    '<strong>'+
    black.toFixed(0)+
    '%</strong>'+
    '</div>'+


    '<div class="'+
    classe+
    '">'+

    '<small>TRIO TERMINAIS • 14</small>'+

    '<strong style="font-size:11px">'+
    trioTexto+
    '</strong>'+

    '<div style="font-size:8px;margin-top:3px;color:'+
    (
      taxaTrio >= 99.999
        ? "#00e676"
        : "#ffc107"
    )+
    '">'+
    taxaTrio.toFixed(0)+
    '% • '+
    m.trioTerminais
      .direto14+
    ' DIRETO • '+
    m.trioTerminais
      .vizinho14+
    ' VIZ.'+
    '</div>'+

    '</div>';
}


/* =========================================================
   RENDER 14
========================================================= */

function render14(){

  const janela =
    historico.slice(-14);


  document
    .getElementById(
      "linhaRoleta"
    )
    .innerHTML =

    janela
      .map(n =>

        '<div class="bola" style="background:'+
        corRoleta(n)+
        '">'+
        n+
        '</div>'

      )
      .join("");


  document
    .getElementById(
      "linhaRegiao"
    )
    .innerHTML =

    janela
      .map(n => {

        const r =
          regiao(n);


        return (

          '<div class="regiaoBox" style="background:'+
          (
            r
              ? coresRegioes[r]
              : "#555"
          )+
          '">'+
          n+
          '</div>'
        );

      })
      .join("");


  document
    .getElementById(
      "linhaID"
    )
    .innerHTML =

    janela
      .map(n => {

        const ids =
          idsQueBatem(n);


        if(!ids.length){

          return (
            '<div class="idBox">—</div>'
          );
        }


        return (

          '<div class="idBox">'+

          ids
            .map(id =>

              '<span class="idTag" style="background:'+
              corId(id)+
              '">'+
              id+
              '</span>'

            )
            .join("")+

          '</div>'
        );

      })
      .join("");
}


/* =========================================================
   TAXA / MOTOR
========================================================= */

function classeTaxa(taxa){

  if(taxa >= 90){
    return "ok90";
  }

  if(taxa >= 85){
    return "warn";
  }

  return "bad";
}


function renderMotor(
  configs,
  auto
){

  const area =
    document.getElementById(
      "motorGrid"
    );


  if(!auto){

    area.innerHTML =

      '<div class="motorCard">'+
      '<small>STATUS</small>'+
      '<strong>AGUARDANDO</strong>'+
      '</div>';

    return;
  }


  const live =
    statsTimeline(
      estado.timelines.AUTO
    );


  area.innerHTML =

    '<div class="motorCard">'+
    '<small>RX ATIVO</small>'+
    '<strong>'+
    auto.rx+
    '</strong>'+
    '</div>'+


    '<div class="motorCard">'+
    '<small>BACKTEST 10</small>'+
    '<strong class="'+
    classeTaxa(
      auto.backtest.taxa10
    )+
    '">'+
    auto.backtest
      .taxa10
      .toFixed(0)+
    '%</strong>'+
    '</div>'+


    '<div class="motorCard">'+
    '<small>BACKTEST 20</small>'+
    '<strong class="'+
    classeTaxa(
      auto.backtest.taxa20
    )+
    '">'+
    auto.backtest
      .taxa20
      .toFixed(0)+
    '%</strong>'+
    '</div>'+


    '<div class="motorCard">'+
    '<small>REAL 10</small>'+
    '<strong class="'+
    classeTaxa(
      live.taxa10
    )+
    '">'+
    (
      live.total
        ? live.taxa10
            .toFixed(0)+"%"
        : "—"
    )+
    '</strong>'+
    '</div>'+


    '<div class="motorCard">'+
    '<small>REAL 20</small>'+
    '<strong class="'+
    classeTaxa(
      live.taxa20
    )+
    '">'+
    (
      live.total
        ? live.taxa20
            .toFixed(0)+"%"
        : "—"
    )+
    '</strong>'+
    '</div>'+


    '<div class="motorCard">'+
    '<small>LOSS</small>'+
    '<strong>'+
    live.lossSeguidos+
    '</strong>'+
    '</div>';
}


/* =========================================================
   CONTROLE
========================================================= */

function renderControle(auto){

  [
    "auto",
    "rx4",
    "rx5",
    "rx6"
  ]
  .forEach(id => {

    const el =
      document.getElementById(
        id
      );


    el.classList.remove(
      "ativo",
      "vencedor"
    );


    if(id !== "auto"){

      el.textContent =
        id.replace(
          "rx",
          ""
        );
    }
  });


  if(
    estado.modo ===
    "AUTO"
  ){

    document
      .getElementById(
        "auto"
      )
      .classList
      .add("ativo");


    if(auto){

      const btn =
        document.getElementById(
          "rx"+auto.rx
        );


      btn.classList
        .add("vencedor");


      btn.textContent =
        auto.rx+" ★";
    }
  }

  else{

    document
      .getElementById(
        "rx"+
        estado.manualRX
      )
      .classList
      .add("ativo");
  }
}


/* =========================================================
   RENDER RX
========================================================= */

function renderRaioX(config){

  const titulo =
    document.getElementById(
      "rxTitulo"
    );


  const sinais =
    document.getElementById(
      "sinais"
    );


  const areaIds =
    document.getElementById(
      "rxIds"
    );


  if(
    !config ||
    !config.valido
  ){

    titulo.textContent =
      "RAIO X — AGUARDANDO";


    sinais.innerHTML = "";

    areaIds.innerHTML = "";

    return;
  }


  titulo.textContent =

    "RAIO X "+
    config.rx+
    (
      estado.modo === "AUTO"
        ? " — MAIS FORTE"
        : " — MANUAL"
    );


  const s =
    config.raioX.sinal;


  sinais.innerHTML =

    '<div class="sinal">'+
    '<small style="color:'+
    COR_T0+
    '">0</small>'+
    '<strong>'+
    s[0].toFixed(0)+
    '%</strong>'+
    '</div>'+


    '<div class="sinal">'+
    '<small style="color:'+
    COR_T6+
    '">6</small>'+
    '<strong>'+
    s[6].toFixed(0)+
    '%</strong>'+
    '</div>'+


    '<div class="sinal">'+
    '<small style="color:'+
    COR_T9+
    '">9</small>'+
    '<strong>'+
    s[9].toFixed(0)+
    '%</strong>'+
    '</div>';


  const oito =
    montarOitoIds(
      config.raioX
    );


  areaIds.innerHTML =
    oito
      .map(item => {

        if(
          item.tipo ===
          "ZERO26"
        ){

          return (

            '<div class="rxId" style="border-color:'+
            COR_T0+
            '">'+
            '0 + 3'+
            '</div>'
          );
        }


        return (

          '<div class="rxId" style="border-color:'+
          corId(item.id)+
          '">'+
          item.id+
          '</div>'
        );

      })
      .join("");
}


/* =========================================================
   RENDER JOGADA
========================================================= */

function renderJogada(config){

  if(
    !config ||
    !config.valido
  ){

    jogadaInfo.textContent =
      "AGUARDANDO";


    jogadaArea.innerHTML =

      '<div style="color:#777;padding:8px">'+
      'Histórico insuficiente.'+
      '</div>';


    return;
  }


  const trio =
    config.jogada
      .trioTerminais
      .map(
        t => "T"+t
      )
      .join("•");


  jogadaInfo.textContent =

    "RX"+
    config.rx+

    " • BT10 "+
    config.backtest
      .taxa10
      .toFixed(0)+
    "%"+

    " • BT20 "+
    config.backtest
      .taxa20
      .toFixed(0)+
    "%"+

    " • "+
    trio+
    " "+
    config.jogada
      .trioTaxa14
      .toFixed(0)+
    "%";


  const linha2 =
    config.jogada
      .blocos2
      .map(b =>

        '<div class="bloco">'+
        '<small>2 VIZINHOS DO</small>'+
        '<strong>'+
        b.centro+
        '</strong>'+
        '<div class="nums">'+
        b.numeros
          .join(" • ")+
        '</div>'+
        '</div>'

      )
      .join("");


  const linha1 =
    config.jogada
      .blocos1
      .map(b =>

        '<div class="bloco um">'+
        '<small>1 VIZINHO DO</small>'+
        '<strong>'+
        b.centro+
        '</strong>'+
        '<div class="nums">'+
        b.numeros
          .join(" • ")+
        '</div>'+
        '</div>'

      )
      .join("");


  jogadaArea.innerHTML =

    '<div class="jogadaLinha">'+
    linha2+
    '</div>'+

    '<div class="jogadaLinha">'+
    linha1+
    '</div>';
}


/* =========================================================
   PROCESSAMENTO
========================================================= */

let renderToken = 0;


function render(){

  const meuToken =
    ++renderToken;


  render14();

  renderMomento();


  renderTimeline(
    "timelineAUTO",
    "AUTO",
    estado.timelines.AUTO
  );


  renderTimeline(
    "timeline4",
    "RX4",
    estado.timelines[4]
  );


  renderTimeline(
    "timeline5",
    "RX5",
    estado.timelines[5]
  );


  renderTimeline(
    "timeline6",
    "RX6",
    estado.timelines[6]
  );


  setStatus(
    historico.length
      ? "Calculando motor e backtest..."
      : "Pronto.",
    "#00e5ff"
  );


  setTimeout(
    () => {

      if(
        meuToken !==
        renderToken
      ){
        return;
      }


      try{

        const configs = {};


        RX_LIST.forEach(rx => {

          configs[rx] =
            melhorDoRX(
              historico,
              rx
            );
        });


        const auto =
          escolherAuto(
            configs
          );


        garantirPendentes(
          configs,
          auto
        );


        let ativa = null;


        if(
          estado.modo ===
          "AUTO"
        ){

          ativa =
            auto;
        }

        else{

          ativa =
            configs[
              estado.manualRX
            ];
        }


        const trioAtual =
          calcularTrioTerminais(
            historico
          );


        const diagnostico =
          diagnosticarLossAtual();


        estado.ultimaEscolha =
          auto
            ? {

                rx:
                  auto.rx,

                contexto:
                  auto.contexto,

                bt10:
                  auto.backtest
                    .taxa10,

                bt20:
                  auto.backtest
                    .taxa20,

                trio:
                  trioAtual
                    .trio
                    .slice(),

                trioTaxa14:
                  trioAtual
                    .taxa14,

                candidatos100:
                  trioAtual
                    .candidatos100,

                diagnostico:
                  diagnostico.tipo
              }
            : null;


        salvarEstado();


        renderControle(
          auto
        );


        renderMotor(
          configs,
          auto
        );


        renderRaioX(
          ativa
        );


        renderJogada(
          ativa
        );


        setStatus(
          historico.length+
          " números • trio recalculado nos últimos 14 • cálculo concluído.",
          "#00e676"
        );


        console.log(
          "ANALISADOR 0/6/9 V10.4",
          {

            ULTIMOS_14:
              historico.slice(-14),

            TRIO_14:
              trioAtual,

            AUTO:
              auto,

            RX4:
              configs[4],

            RX5:
              configs[5],

            RX6:
              configs[6],

            DIAGNOSTICO_LOSS:
              diagnostico
          }
        );

      }

      catch(erro){

        console.error(
          erro
        );


        setStatus(
          "Erro: "+
          (
            erro &&
            erro.message
              ? erro.message
              : String(erro)
          ),
          "#ff5252"
        );
      }

    },
    0
  );
}


/* =========================================================
   START
========================================================= */

render();

})();
