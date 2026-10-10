(function () {
"use strict";

/*
  ANÁLISE BETA
  12 MOTORES — ESTRATÉGIA FÍSICA DAS DÚZIAS

  NORMAL C4 / C5 / C6
  DINÂMICO C4 / C5 / C6
  RAIO X NORMAL C4 / C5 / C6
  RAIO X DINÂMICO C4 / C5 / C6

  C4 = PRIMEIRA DÚZIA
  C5 = SEGUNDA DÚZIA
  C6 = TERCEIRA DÚZIA

  TODOS OS MOTORES UTILIZAM:
  - DÚZIAS E SEUS VIZINHOS FÍSICOS
  - ZONAS DE QUEBRA
  - CONCENTRAÇÃO FÍSICA
  - ÚLTIMOS 20 RESULTADOS
  - 5 ALVOS COM 2 VIZINHOS
  - 1 ALVO COM 1 VIZINHO
  - 28 NÚMEROS DISTINTOS
  - SEM SOBREPOSIÇÃO
  - SEM BURACO ISOLADO
  - 12 JOGADAS DIFERENTES
  - AUTO ENTRE OS 12 MOTORES
  - G1 INDIVIDUAL
*/

const STORAGE = "ANALISE_BETA_DUZIAS_RX_12_V1";
const MAX_HISTORICO = 20;

const TRACK = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

const VERMELHOS = new Set([
  1,3,5,7,9,12,14,16,18,
  19,21,23,25,27,30,32,34,36
]);

const MOTORES = [
  "NORMAL",
  "DINAMICO",
  "RX_NORMAL",
  "RX_DINAMICO"
];

const RX_LIST = [4,5,6];

const ZONAS_QUEBRA = {
  1: [13,14,15,16,17,18],
  2: [0,26,3,35,28,7,6,30],
  3: [23,10,24,20,22,21,4,19]
};

const GRUPOS_FISICOS = {
  1: [
    [3,12,7],
    [4,2,21],
    [11,8,5],
    [6,1,9]
  ],
  2: [
    [13,36,11,30,8],
    [23,10,5,24,16],
    [15,19,17,14,20,18]
  ],
  3: [
    [25,17,34,6,27],
    [32,15,19,4,21],
    [29,7,28,12,35,3,26],
    [31,9,22,18,33]
  ]
};

const REGIOES = {
  ZERO: new Set([0,32,15,26,3,35,12]),
  VOISINS: new Set([19,4,21,2,25,28,7,29,18,22]),
  ORPHELINS: new Set([9,31,14,20,1,17,6,34]),
  TIERS: new Set([27,13,36,11,30,8,23,10,5,24,16,33])
};

const INDICE = new Map(
  TRACK.map((numero,i) => [numero,i])
);

function indice(n) {
  return INDICE.has(n) ? INDICE.get(n) : -1;
}

function modulo(n,m) {
  return ((n % m) + m) % m;
}

function numeroOffset(n,offset) {
  const i = indice(n);
  return i < 0 ? n : TRACK[modulo(i+offset,37)];
}

function setor(centro,qtd) {
  const i = indice(centro);
  if (i < 0) return [];

  const numeros = [];

  for (let d=-qtd;d<=qtd;d++) {
    numeros.push(TRACK[modulo(i+d,37)]);
  }

  return numeros;
}

function distanciaRoda(a,b) {
  const ia = indice(a);
  const ib = indice(b);

  if (ia<0 || ib<0) return 99;

  const d = Math.abs(ia-ib);
  return Math.min(d,37-d);
}

function deltaRoda(a,b) {
  const ia = indice(a);
  const ib = indice(b);

  if (ia<0 || ib<0) return 0;

  let d = modulo(ib-ia,37);

  if (d>18) d-=37;

  return d;
}

function duzia(n) {
  if (n>=1 && n<=12) return 1;
  if (n>=13 && n<=24) return 2;
  if (n>=25 && n<=36) return 3;
  return 0;
}

function duziaMotor(rx) {
  return rx===4 ? 1 : rx===5 ? 2 : 3;
}

function regiao(n) {
  for (const [nome,conjunto] of Object.entries(REGIOES)) {
    if (conjunto.has(n)) return nome;
  }
  return "OUTROS";
}

function corRoleta(n) {
  return n===0
    ? "#087c48"
    : VERMELHOS.has(n)
      ? "#c6283d"
      : "#181818";
}

function limitar(base) {
  return Array.isArray(base)
    ? base.filter(n => Number.isInteger(n) && n>=0 && n<=36).slice(-20)
    : [];
}

function estruturaVazia(valor=null) {
  return {
    AUTO: valor,
    NORMAL: {4:valor,5:valor,6:valor},
    DINAMICO: {4:valor,5:valor,6:valor},
    RX_NORMAL: {4:valor,5:valor,6:valor},
    RX_DINAMICO: {4:valor,5:valor,6:valor}
  };
}

function timelinesVazias() {
  return estruturaVazia(null);
}

function criarEstado() {
  const timelines = timelinesVazias();

  timelines.AUTO=[];

  for (const motor of MOTORES) {
    for (const rx of RX_LIST) {
      timelines[motor][rx]=[];
    }
  }

  return {
    historico:[],
    modo:"AUTO",
    motorManual:"NORMAL",
    manualRX:4,
    timelines,
    pendentes:estruturaVazia(null),
    freezes:estruturaVazia(null),
    visual:[],
    visualFreeze:null,
    offset:0
  };
}

let estado = criarEstado();

try {
  const raw = localStorage.getItem(STORAGE);

  if (raw) {
    const salvo = JSON.parse(raw);

    if (salvo && typeof salvo==="object") {
      estado.historico=limitar(salvo.historico);

      if (["AUTO","MANUAL"].includes(salvo.modo)) {
        estado.modo=salvo.modo;
      }

      if (MOTORES.includes(salvo.motorManual)) {
        estado.motorManual=salvo.motorManual;
      }

      if (RX_LIST.includes(salvo.manualRX)) {
        estado.manualRX=salvo.manualRX;
      }

      if (salvo.timelines) {
        if (Array.isArray(salvo.timelines.AUTO)) {
          estado.timelines.AUTO=salvo.timelines.AUTO.slice(-20);
        }

        for (const motor of MOTORES) {
          for (const rx of RX_LIST) {
            const lista=salvo.timelines[motor]?.[rx];

            if (Array.isArray(lista)) {
              estado.timelines[motor][rx]=lista.slice(-20);
            }
          }
        }
      }

      if (salvo.pendentes) {
        estado.pendentes=salvo.pendentes;
      }

      if (salvo.freezes) {
        estado.freezes=salvo.freezes;
      }

      if (Array.isArray(salvo.visual)) {
        estado.visual=salvo.visual.slice(-14);
      }

      estado.visualFreeze=salvo.visualFreeze||null;

      if (
        Number.isInteger(salvo.offset) &&
        Math.abs(salvo.offset)<=2
      ) {
        estado.offset=salvo.offset;
      }
    }
  }
} catch(e) {}

function salvar() {
  estado.historico=limitar(estado.historico);
  estado.visual=estado.visual.slice(-14);

  try {
    localStorage.setItem(STORAGE,JSON.stringify(estado));
  } catch(e) {}
}

/* ============================================================
   ANÁLISE DAS DÚZIAS
============================================================ */

function analisarDuzias(base) {
  const janela=limitar(base);

  const calor=new Map(
    TRACK.map(n=>[n,0])
  );

  const info={
    1:{contagem:0,forca:0,duplas:0,concentracao:0,score:0},
    2:{contagem:0,forca:0,duplas:0,concentracao:0,score:0},
    3:{contagem:0,forca:0,duplas:0,concentracao:0,score:0}
  };

  const quebra={1:0,2:0,3:0};
  const transicoes=[];

  janela.forEach((numero,i)=>{
    const recencia=.45+.55*(i+1)/Math.max(1,janela.length);
    const d=duzia(numero);

    if (d) {
      info[d].contagem++;
      info[d].forca+=recencia;
    }

    for (let z=1;z<=3;z++) {
      if (ZONAS_QUEBRA[z].includes(numero)) {
        quebra[z]+=recencia;
      }
    }

    for (const alvo of TRACK) {
      const dist=distanciaRoda(numero,alvo);
      const pesos=[1,.78,.52,.29,.14,.06];

      if (dist<=5) {
        calor.set(
          alvo,
          calor.get(alvo)+pesos[dist]*recencia
        );
      }
    }

    if (i>0) {
      const anterior=janela[i-1];
      const dist=distanciaRoda(anterior,numero);

      if (dist<=2) {
        transicoes.push({
          anterior,
          numero,
          distancia:dist,
          peso:recencia
        });

        for (let z=1;z<=3;z++) {
          const pertence=
            Number(duzia(anterior)===z)+
            Number(duzia(numero)===z);

          info[z].duplas+=recencia*(
            pertence===2 ? 1 :
            pertence===1 ? .45 : .12
          );
        }
      }
    }
  });

  for (let z=1;z<=3;z++) {
    let soma=0;
    let quantidade=0;

    for (const grupo of GRUPOS_FISICOS[z]) {
      for (const numero of grupo) {
        soma+=calor.get(numero)||0;
        quantidade++;
      }
    }

    info[z].concentracao=quantidade?soma/quantidade:0;

    info[z].score=
      info[z].forca*.38+
      info[z].duplas*.28+
      info[z].concentracao*.26+
      quebra[z]*.08;
  }

  const maior=Math.max(
    .000001,
    info[1].score,
    info[2].score,
    info[3].score
  );

  const ranking=[1,2,3].map(z=>({
    duzia:z,
    ...info[z],
    intensidade:info[z].score/maior
  })).sort((a,b)=>b.score-a.score);

  return {
    janela,
    calor,
    info,
    quebra,
    transicoes,
    ranking
  };
}

function scoreDuziaNumero(numero,analise,alvoDuzia) {
  const d=duzia(numero);
  let score=0;

  const principal=analise.ranking[0]?.score||1;
  const calorMax=Math.max(.000001,...analise.calor.values());

  if (d) {
    score+=(analise.info[d].score/principal)*.24;
  }

  if (d===alvoDuzia) {
    score+=.75;
  }

  score+=
    ((analise.calor.get(numero)||0)/calorMax)*.30;

  for (let z=1;z<=3;z++) {
    const intensidade=analise.info[z].score/principal;
    let proximidade=0;

    for (const grupo of GRUPOS_FISICOS[z]) {
      for (const alvo of grupo) {
        const dist=distanciaRoda(numero,alvo);

        const peso=
          dist===0 ? 1 :
          dist===1 ? .75 :
          dist===2 ? .45 :
          dist===3 ? .20 : 0;

        proximidade=Math.max(proximidade,peso);
      }
    }

    const fator=z===alvoDuzia ? .40 : .13;

    score+=intensidade*proximidade*fator;

    if (ZONAS_QUEBRA[z].includes(numero)) {
      score+=intensidade*(z===alvoDuzia?.16:.05);
    }
  }

  for (const par of analise.transicoes) {
    const da=distanciaRoda(numero,par.anterior);
    const db=distanciaRoda(numero,par.numero);

    if (da<=2 && db<=2) {
      score+=par.peso*.12;
    } else if (da<=3 || db<=3) {
      score+=par.peso*.035;
    }
  }

  return score;
}

/* ============================================================
   CONTAGEM
============================================================ */

function mapaContagem(base,rx) {
  const mapa=new Map(TRACK.map(n=>[n,0]));
  const decay={4:.78,5:.82,6:.86}[rx];

  let peso=1;

  for (let i=base.length-1;i>=0;i--) {
    const numero=base[i];

    for (const alvo of TRACK) {
      const d=distanciaRoda(numero,alvo);

      const p=
        d===0 ? 1 :
        d===1 ? .72 :
        d===2 ? .44 :
        d===3 ? .22 :
        d===4 ? .10 : 0;

      if (p) {
        mapa.set(alvo,mapa.get(alvo)+p*peso);
      }
    }

    peso*=decay;
  }

  const maior=Math.max(.000001,...mapa.values());

  for (const n of TRACK) {
    mapa.set(n,mapa.get(n)/maior);
  }

  return mapa;
}

/* ============================================================
   RAIO X
============================================================ */

function analisarRX(base,rx) {
  if (base.length<rx*2+4) {
    return {
      valido:false,
      frequencia:new Map(TRACK.map(n=>[n,0])),
      similaridade:0
    };
  }

  const atual=base.slice(-rx);
  const candidatos=[];

  for (let i=0;i+rx<base.length-rx;i++) {
    const trecho=base.slice(i,i+rx);
    const proximo=base[i+rx];

    let iguais=0;
    let fisica=0;

    for (let k=0;k<rx;k++) {
      if (duzia(trecho[k])===duzia(atual[k])) {
        iguais++;
      }

      const dist=distanciaRoda(trecho[k],atual[k]);

      fisica+=Math.max(0,1-dist/19);
    }

    const similaridade=
      (iguais/rx)*70+
      (fisica/rx)*30;

    candidatos.push({
      proximo,
      similaridade,
      inicio:i
    });
  }

  candidatos.sort(
    (a,b)=>b.similaridade-a.similaridade||
    b.inicio-a.inicio
  );

  const quantidade=Math.min(
    candidatos.length,
    Math.max(4,Math.ceil(candidatos.length*.30))
  );

  const replicas=candidatos.slice(0,quantidade);

  const frequencia=new Map(TRACK.map(n=>[n,0]));

  for (const rep of replicas) {
    const peso=.40+.60*rep.similaridade/100;

    for (const alvo of TRACK) {
      const d=distanciaRoda(rep.proximo,alvo);

      const p=
        d===0 ? 1 :
        d===1 ? .70 :
        d===2 ? .42 :
        d===3 ? .18 : 0;

      if (p) {
        frequencia.set(
          alvo,
          frequencia.get(alvo)+p*peso
        );
      }
    }
  }

  const max=Math.max(.000001,...frequencia.values());

  for (const n of TRACK) {
    frequencia.set(n,frequencia.get(n)/max);
  }

  return {
    valido:replicas.length>0,
    frequencia,
    replicas,
    similaridade:replicas.length
      ? replicas.reduce((s,x)=>s+x.similaridade,0)/replicas.length
      : 0
  };
}

/* ============================================================
   GEOMETRIA DA JOGADA
============================================================ */

function assinaturaJogada(jogada) {
  if (!jogada?.valido) return "";

  return [...jogada.numeros]
    .sort((a,b)=>a-b)
    .join(",");
}

function buracosDeUm(jogada) {
  if (!jogada?.valido) return [];

  const cobertos=jogada.numeros;
  const buracos=[];

  for (let i=0;i<37;i++) {
    const numero=TRACK[i];

    if (cobertos.has(numero)) continue;

    const anterior=TRACK[modulo(i-1,37)];
    const seguinte=TRACK[modulo(i+1,37)];

    if (
      cobertos.has(anterior) &&
      cobertos.has(seguinte)
    ) {
      buracos.push(numero);
    }
  }

  return buracos;
}

function validarJogada(jogada) {
  if (!jogada) return false;

  if (jogada.blocos2.length!==5) return false;
  if (jogada.blocos1.length!==1) return false;
  if (jogada.numeros.size!==28) return false;

  const todos=[
    ...jogada.blocos2.flatMap(x=>x.numeros),
    ...jogada.blocos1.flatMap(x=>x.numeros)
  ];

  if (todos.length!==28) return false;
  if (new Set(todos).size!==28) return false;

  return buracosDeUm({...jogada,valido:true}).length===0;
}

/*
  CONSTRUÇÃO EXAUSTIVA COM PODA

  Em vez de escolher os centros de maneira gulosa,
  percorre combinações de blocos físicos.

  O resultado final sempre é validado.
*/

function construirJogada(ranking,assinaturasUsadas,variacao=0) {
  const scoreMapa=new Map(
    ranking.map(x=>[x.numero,x.score])
  );

  const candidatos=TRACK.map(numero=>({
    numero,
    score:scoreMapa.get(numero)||0
  })).sort((a,b)=>b.score-a.score);

  const indiceVariacao=modulo(variacao,37);

  const candidatos1=[
    ...candidatos.slice(indiceVariacao),
    ...candidatos.slice(0,indiceVariacao)
  ];

  let melhor=null;
  let melhorScore=-Infinity;

  const limiteNos=250000;
  let nos=0;

  const blocos5=TRACK.map(centro=>({
    centro,
    qtd:2,
    numeros:setor(centro,2),
    score:scoreMapa.get(centro)||0,
    mask:setor(centro,2).reduce(
      (m,n)=>m|(1n<<BigInt(indice(n))),
      0n
    )
  }));

  const blocos3=TRACK.map(centro=>({
    centro,
    qtd:1,
    numeros:setor(centro,1),
    score:scoreMapa.get(centro)||0,
    mask:setor(centro,1).reduce(
      (m,n)=>m|(1n<<BigInt(indice(n))),
      0n
    )
  }));

  const ordenar5=blocos5.slice().sort(
    (a,b)=>b.score-a.score
  );

  const porCentro3=new Map(
    blocos3.map(b=>[b.centro,b])
  );

  function avaliar(blocos,um,score) {
    const numeros=new Set();

    for (const b of blocos) {
      b.numeros.forEach(n=>numeros.add(n));
    }

    um.numeros.forEach(n=>numeros.add(n));

    const jogada={
      valido:true,
      blocos2:blocos.map(b=>({
        centro:b.centro,
        qtd:2,
        numeros:b.numeros.slice(),
        score:b.score
      })),
      blocos1:[{
        centro:um.centro,
        qtd:1,
        numeros:um.numeros.slice(),
        score:um.score
      }],
      numeros,
      score
    };

    if (!validarJogada(jogada)) return;

    const assinatura=assinaturaJogada(jogada);

    if (assinaturasUsadas?.has(assinatura)) return;

    if (score>melhorScore) {
      melhor=jogada;
      melhorScore=score;
    }
  }

  /*
    Para evitar buracos de um número, os 9 números
    descobertos precisam formar intervalos de pelo
    menos 2 posições no aro da roleta.
  */

  function busca(blocos,mask,inicio,score,um) {
    if (++nos>limiteNos) return;

    if (blocos.length===5) {
      avaliar(blocos,um,score);
      return;
    }

    const faltam=5-blocos.length;

    if (ordenar5.length-inicio<faltam) return;

    for (
      let i=inicio;
      i<=ordenar5.length-faltam;
      i++
    ) {
      if (nos>limiteNos) return;

      const candidato=ordenar5[i];

      if ((mask&candidato.mask)!==0n) continue;

      blocos.push(candidato);

      busca(
        blocos,
        mask|candidato.mask,
        i+1,
        score+candidato.score,
        um
      );

      blocos.pop();
    }
  }

  /*
    O centro de 3 números também é escolhido
    pela pontuação da estratégia da dúzia.
  */

  for (const item of candidatos1) {
    if (nos>limiteNos) break;

    const um=porCentro3.get(item.numero);

    if (!um) continue;

    busca([],um.mask,0,um.score,um);
  }

  return melhor;
}

/* ============================================================
   ESTRATÉGIAS DOS 12 MOTORES
============================================================ */

function gerarConfig(
  base,
  motor,
  rx,
  assinaturasUsadas=null,
  variacao=0
) {
  base=limitar(base);

  const alvoDuzia=duziaMotor(rx);
  const analise=analisarDuzias(base);

  const dinamico=
    motor==="DINAMICO"||
    motor==="RX_DINAMICO";

  const raioX=
    motor==="RX_NORMAL"||
    motor==="RX_DINAMICO";

  const minimo=raioX
    ? Math.max(14,rx*2+4)
    : Math.max(8,rx+4);

  if (base.length<minimo) {
    return {
      valido:false,
      motor,
      rx,
      alvoDuzia,
      motivo:"AGUARDANDO DADOS"
    };
  }

  const contagem=mapaContagem(base,rx);
  const rxInfo=raioX?analisarRX(base,rx):null;

  if (raioX && !rxInfo.valido) {
    return {
      valido:false,
      motor,
      rx,
      alvoDuzia,
      motivo:"SEM RÉPLICAS"
    };
  }

  const ranking=[];

  for (const numero of TRACK) {
    const d=duzia(numero);

    const scoreDuzia=
      scoreDuziaNumero(
        numero,
        analise,
        alvoDuzia
      );

    const scoreContagem=contagem.get(numero)||0;

    const scoreRX=rxInfo
      ? rxInfo.frequencia.get(numero)||0
      : 0;

    const proximidadeDuzia=
      d===alvoDuzia ? 1 : 0;

    const proximidadeQuebra=
      ZONAS_QUEBRA[alvoDuzia].some(
        alvo=>distanciaRoda(numero,alvo)<=2
      ) ? 1 : 0;

    let score=
      scoreDuzia*.50+
      scoreContagem*.28+
      proximidadeDuzia*.14+
      proximidadeQuebra*.08;

    if (raioX) {
      score=
        scoreDuzia*.40+
        scoreRX*.36+
        scoreContagem*.12+
        proximidadeDuzia*.08+
        proximidadeQuebra*.04;
    }

    if (dinamico) {
      const recentes=base.slice(-Math.min(rx,base.length));

      let direita=0;
      let esquerda=0;

      recentes.forEach((n,i)=>{
        const delta=deltaRoda(numero,n);
        const peso=(i+1)/recentes.length;

        if (Math.abs(delta)<=7) {
          if (delta>0) direita+=peso;
          if (delta<0) esquerda+=peso;
        }
      });

      const tendencia=
        (direita-esquerda)/
        Math.max(.000001,direita+esquerda);

      score+=Math.abs(tendencia)*.12;

      const offset=Math.sign(tendencia);

      if (offset!==0) {
        const vizinho=numeroOffset(numero,offset);

        score+=
          scoreDuziaNumero(
            vizinho,
            analise,
            alvoDuzia
          )*.06;
      }
    }

    /*
      Variação determinística por motor e linha.
      Não utiliza sorteios futuros.
    */

    const deslocamento=
      modulo(indice(numero)+variacao*7,37);

    score+=
      Math.sin(deslocamento*2.3999632297)*.0001;

    ranking.push({
      numero,
      score
    });
  }

  ranking.sort((a,b)=>b.score-a.score);

  let jogada=null;

  for (let tentativa=0;tentativa<4;tentativa++) {
    jogada=construirJogada(
      ranking,
      assinaturasUsadas,
      variacao+tentativa*5
    );

    if (jogada) break;
  }

  if (!jogada) {
    return {
      valido:false,
      motor,
      rx,
      alvoDuzia,
      motivo:"SEM COMBINAÇÃO VÁLIDA"
    };
  }

  const assinatura=assinaturaJogada(jogada);

  if (assinaturasUsadas?.has(assinatura)) {
    return {
      valido:false,
      motor,
      rx,
      alvoDuzia,
      motivo:"JOGADA REPETIDA"
    };
  }

  return {
    valido:true,
    motor,
    rx,
    alvoDuzia,
    jogada,
    analise,
    similaridade:rxInfo?.similaridade||0,
    score:jogada.score,
    assinatura
  };
}

/* ============================================================
   CLASSIFICAÇÃO
============================================================ */

function classificarJogada(numero,jogada) {
  if (!jogada?.valido) {
    return {
      green:false,
      tipo:"FORA",
      lado:0
    };
  }

  const blocos=[
    ...jogada.blocos2,
    ...jogada.blocos1
  ];

  for (const bloco of blocos) {
    if (bloco.numeros.includes(numero)) {
      const dist=distanciaRoda(numero,bloco.centro);

      return {
        green:true,
        tipo:dist===0?"ALVO":dist===1?"V1":"V2",
        lado:Math.sign(deltaRoda(bloco.centro,numero))
      };
    }
  }

  let melhor=null;

  for (const bloco of blocos) {
    const delta=deltaRoda(bloco.centro,numero);
    const gap=Math.abs(delta)-bloco.qtd;

    if (gap>0 && (!melhor||gap<melhor.gap)) {
      melhor={
        gap,
        lado:Math.sign(delta)
      };
    }
  }

  return {
    green:false,
    tipo:
      melhor?.gap===1?"FORA1":
      melhor?.gap===2?"FORA2":"FORA",
    lado:melhor?.lado||0
  };
}

/* ============================================================
   BACKTEST
============================================================ */

function backtest(base,motor,rx) {
  base=limitar(base);

  const timeline=[];

  const minimo=
    motor.startsWith("RX")||
    motor==="DINAMICO"
      ? Math.max(14,rx*2+4)
      : Math.max(8,rx+4);

  for (let i=minimo;i<base.length;i++) {
    const passado=base.slice(0,i);
    const config=gerarConfig(passado,motor,rx);

    if (!config.valido) {
      timeline.push({
        resultado:base[i],
        semJogada:true,
        green:null
      });
      continue;
    }

    const r=classificarJogada(base[i],config.jogada);

    timeline.push({
      resultado:base[i],
      semJogada:false,
      green:r.green,
      tipo:r.tipo,
      lado:r.lado
    });
  }

  return statsTimeline(timeline);
}

function statsTimeline(lista) {
  const validos=(lista||[])
    .filter(x=>
      !x.semJogada &&
      !x.aguardandoG1 &&
      x.green!==null &&
      x.green!==undefined
    )
    .slice(-20);

  function taxa(qtd) {
    const itens=validos.slice(-qtd);

    return itens.length
      ? itens.filter(x=>x.green).length/itens.length*100
      : 0;
  }

  let losses=0;

  for (let i=validos.length-1;i>=0;i--) {
    if (validos[i].green) break;
    losses++;
  }

  return {
    total:validos.length,
    taxa5:taxa(5),
    taxa10:taxa(10),
    taxa20:taxa(20),
    lossSeguidos:losses,
    timeline:lista||[]
  };
}

/* ============================================================
   12 CONFIGURAÇÕES INDEPENDENTES
============================================================ */

function calcularDoze(base) {
  const resultado={
    NORMAL:{},
    DINAMICO:{},
    RX_NORMAL:{},
    RX_DINAMICO:{}
  };

  const usadas=new Set();
  let variacao=0;

  for (const motor of MOTORES) {
    for (const rx of RX_LIST) {
      const cfg=gerarConfig(
        base,
        motor,
        rx,
        usadas,
        variacao++
      );

      if (cfg.valido) {
        usadas.add(cfg.assinatura);

        cfg.backtest=backtest(base,motor,rx);
        cfg.live=statsTimeline(estado.timelines[motor][rx]);

        cfg.scoreAuto=
          cfg.backtest.taxa5*.28+
          cfg.backtest.taxa10*.26+
          cfg.backtest.taxa20*.18+
          cfg.live.taxa10*.15+
          cfg.live.taxa20*.08+
          cfg.similaridade*.05-
          cfg.live.lossSeguidos*3;

        cfg.scoreAuto+=
          Math.min(10,cfg.score*.15);
      }

      resultado[motor][rx]=cfg;
    }
  }

  return resultado;
}

function escolherAuto(configs) {
  const candidatos=[];

  for (const motor of MOTORES) {
    for (const rx of RX_LIST) {
      const cfg=configs[motor][rx];

      if (cfg?.valido) {
        candidatos.push(cfg);
      }
    }
  }

  candidatos.sort(
    (a,b)=>b.scoreAuto-a.scoreAuto||
    b.score-a.score
  );

  return candidatos[0]||null;
}

function configManual(configs) {
  return configs[estado.motorManual]?.[estado.manualRX]||null;
}

function configAtiva(configs,auto) {
  return estado.modo==="AUTO"
    ? auto
    : configManual(configs);
}

/* ============================================================
   SNAPSHOT E G1
============================================================ */

function snapshot(config) {
  if (!config?.valido) return null;

  return {
    motor:config.motor,
    rx:config.rx,
    centros2:config.jogada.blocos2.map(b=>b.centro),
    centro1:config.jogada.blocos1[0].centro,
    assinaturaHistorico:estado.historico.join(",")
  };
}

function jogadaDeSnapshot(p) {
  if (!p) return null;

  const blocos2=(p.centros2||[]).map(centro=>({
    centro,
    qtd:2,
    numeros:setor(centro,2)
  }));

  const blocos1=p.centro1===null||p.centro1===undefined
    ? []
    : [{
        centro:p.centro1,
        qtd:1,
        numeros:setor(p.centro1,1)
      }];

  const numeros=new Set(
    [...blocos2,...blocos1].flatMap(b=>b.numeros)
  );

  return {
    valido:true,
    blocos2,
    blocos1,
    numeros
  };
}

function avaliarLinha(numero,pendente,freeze,lista,sig) {
  lista=(lista||[]).slice(-20);

  if (freeze) {
    const r=classificarJogada(
      numero,
      jogadaDeSnapshot(freeze)
    );

    const pos=lista.findLastIndex(
      x=>x.aguardandoG1===true
    );

    const item={
      resultadoG1:numero,
      green:r.green,
      tipo:r.tipo,
      lado:r.lado,
      fase:r.green?"G1":"LOSS",
      g1:r.green,
      aguardandoG1:false,
      semJogada:false
    };

    if (pos>=0) {
      lista[pos]={...lista[pos],...item};
    } else {
      lista.push({
        resultado:numero,
        ...item
      });
    }

    return {
      lista:lista.slice(-20),
      freeze:null,
      pendente:null
    };
  }

  if (
    !pendente ||
    pendente.assinaturaHistorico!==sig
  ) {
    lista.push({
      resultado:numero,
      semJogada:true,
      green:null,
      fase:"SEM"
    });

    return {
      lista:lista.slice(-20),
      freeze:null,
      pendente:null
    };
  }

  const r=classificarJogada(
    numero,
    jogadaDeSnapshot(pendente)
  );

  if (r.green) {
    lista.push({
      resultado:numero,
      semJogada:false,
      green:true,
      tipo:r.tipo,
      lado:r.lado,
      fase:"ENTRADA",
      aguardandoG1:false
    });

    return {
      lista:lista.slice(-20),
      freeze:null,
      pendente:null
    };
  }

  lista.push({
    resultado:numero,
    semJogada:false,
    green:null,
    tipo:r.tipo,
    lado:r.lado,
    fase:"ESPERA_G1",
    aguardandoG1:true
  });

  return {
    lista:lista.slice(-20),
    freeze:{...pendente},
    pendente:null
  };
}

function avaliarPendentes(numero) {
  const sig=estado.historico.join(",");

  const auto=avaliarLinha(
    numero,
    estado.pendentes.AUTO,
    estado.freezes.AUTO,
    estado.timelines.AUTO,
    sig
  );

  estado.timelines.AUTO=auto.lista;
  estado.freezes.AUTO=auto.freeze;
  estado.pendentes.AUTO=auto.pendente;

  for (const motor of MOTORES) {
    for (const rx of RX_LIST) {
      const r=avaliarLinha(
        numero,
        estado.pendentes[motor][rx],
        estado.freezes[motor][rx],
        estado.timelines[motor][rx],
        sig
      );

      estado.timelines[motor][rx]=r.lista;
      estado.freezes[motor][rx]=r.freeze;
      estado.pendentes[motor][rx]=r.pendente;
    }
  }
}

function garantirPendentes(configs,auto) {
  const sig=estado.historico.join(",");

  if (!estado.freezes.AUTO) {
    if (
      !estado.pendentes.AUTO ||
      estado.pendentes.AUTO.assinaturaHistorico!==sig
    ) {
      estado.pendentes.AUTO=snapshot(auto);
    }
  }

  for (const motor of MOTORES) {
    for (const rx of RX_LIST) {
      if (estado.freezes[motor]?.[rx]) continue;

      const atual=estado.pendentes[motor]?.[rx];

      if (!atual||atual.assinaturaHistorico!==sig) {
        estado.pendentes[motor][rx]=snapshot(
          configs[motor][rx]
        );
      }
    }
  }

  salvar();
}

/* ============================================================
   ENTRADA
============================================================ */

function adicionarNumero(numero) {
  if (!Number.isInteger(numero)||numero<0||numero>36) return;

  const configs=calcularDoze(estado.historico);
  const auto=escolherAuto(configs);
  const ativa=configAtiva(configs,auto);

  garantirPendentes(configs,auto);

  const estavaG1=!!estado.visualFreeze;

  avaliarPendentes(numero);

  if (estavaG1) {
    const r=classificarJogada(
      numero,
      jogadaDeSnapshot(estado.visualFreeze)
    );

    const ultimo=estado.visual[estado.visual.length-1];

    if (ultimo) {
      ultimo.g1=numero;
      ultimo.g1Green=r.green;
      ultimo.green=r.green;
      ultimo.fase=r.green?"G1":"LOSS";
    }

    estado.visualFreeze=null;
  } else {
    const snap=snapshot(ativa);

    const r=snap
      ? classificarJogada(numero,jogadaDeSnapshot(snap))
      : null;

    const item={
      resultado:numero,
      g1:null,
      g1Green:null,
      green:r?.green===true?true:null,
      semJogada:!snap,
      fase:!snap
        ? "SEM"
        : r.green
          ? "ENTRADA"
          : "ESPERA_G1",
      motor:ativa?.motor||null,
      rx:ativa?.rx||null
    };

    estado.visual.push(item);

    if (r && !r.green) {
      estado.visualFreeze=snap;
    }
  }

  estado.historico.push(numero);
  estado.historico=estado.historico.slice(-20);

  salvar();
  render();
}

function extrairNumeros(texto) {
  const encontrados=String(texto).match(
    /\b(?:[0-9]|[12][0-9]|3[0-6])\b/g
  );

  return encontrados
    ? encontrados.map(Number).slice(-20)
    : [];
}

function resetarAnalise() {
  const novo=criarEstado();

  estado.timelines=novo.timelines;
  estado.pendentes=novo.pendentes;
  estado.freezes=novo.freezes;
  estado.visual=[];
  estado.visualFreeze=null;
  estado.offset=0;
}

function inserirHistorico() {
  const campo=document.getElementById("entradaHistorico");
  const numeros=extrairNumeros(campo.value);

  if (!numeros.length) return;

  estado.historico=numeros;

  resetarAnalise();
  salvar();

  campo.value="";
  render();
}

function apagarUltimo() {
  if (!estado.historico.length) return;

  estado.historico.pop();
  resetarAnalise();
  salvar();
  render();
}

function apagarTudo() {
  if (!confirm("Apagar histórico?")) return;

  estado.historico=[];
  resetarAnalise();
  salvar();
  render();
}

function selecionarAuto() {
  estado.modo="AUTO";
  salvar();
  render();
}

function selecionarManual(motor,rx) {
  estado.modo="MANUAL";
  estado.motorManual=motor;
  estado.manualRX=rx;
  salvar();
  render();
}

/* ============================================================
   INTERFACE
============================================================ */

document.body.innerHTML="";

document.body.style.cssText=
  "margin:0;background:#101010;color:#fff;font-family:Arial,sans-serif";

const app=document.createElement("div");

app.innerHTML=`
<style>
*{box-sizing:border-box}
body{background:#101010}
.app{max-width:900px;margin:auto;padding:7px}
h2{text-align:center;font-size:20px;margin:5px}
.painel{
  background:#1c1c1f;
  border:1px solid #414141;
  border-radius:10px;
  padding:8px;
  margin-bottom:7px
}
.titulo{
  font-size:9px;
  font-weight:900;
  color:#999;
  margin-bottom:6px
}
textarea{
  width:100%;
  height:60px;
  background:#111;
  color:#fff;
  border:1px solid #555;
  border-radius:7px;
  padding:7px
}
.botoes,.modos{
  display:flex;
  gap:5px;
  flex-wrap:wrap;
  margin-top:5px
}
button{
  cursor:pointer;
  font-family:Arial;
  font-weight:900
}
.btn{
  border:1px solid #555;
  background:#333;
  color:#fff;
  border-radius:7px;
  padding:7px 10px
}
.btn.verde{background:#17643b}
.btn.red{background:#762832}
.seletorGrupo{margin-top:9px}
.seletorTitulo{
  font-size:9px;
  font-weight:900;
  color:#999
}
.modo{
  background:#222;
  color:#aaa;
  border:1px solid #555;
  border-radius:7px;
  padding:8px 12px
}
.modo.ativo{
  background:#007d98;
  border-color:#00e5ff;
  color:#fff
}
.modo.dinamico.ativo{
  background:#6c4d00;
  border-color:#ffc107
}
.modo.raiox.ativo{
  background:#4b236b;
  border-color:#d27cff
}
.modo.raiox.dinamico.ativo{
  background:#7a3d00;
  border-color:#ff9800
}
.origemAuto{
  margin-top:8px;
  padding:8px;
  background:#111;
  border:1px solid #00e5ff;
  border-radius:7px;
  font-size:10px;
  font-weight:900;
  text-align:center;
  color:#00e5ff
}
.resumo{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:4px;
  margin-top:8px
}
.card{
  background:#111;
  border:1px solid #333;
  border-radius:7px;
  padding:8px;
  text-align:center
}
.card small{
  display:block;
  font-size:8px;
  color:#999;
  font-weight:900
}
.card strong{font-size:16px}
.duziasLinha{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:5px
}
.duziaCard{
  background:#111;
  border:1px solid #444;
  border-radius:7px;
  padding:8px;
  text-align:center
}
.duziaCard.forte{border-color:#00e676}
.duziaCard small{
  display:block;
  font-size:8px;
  color:#aaa
}
.duziaCard strong{
  display:block;
  font-size:17px;
  margin:4px
}
.duziaCard span{
  font-size:8px;
  color:#aaa
}
.timelineSecao{
  margin-top:10px;
  padding-top:7px;
  border-top:1px solid #333
}
.timelineTituloGrupo{
  font-size:9px;
  font-weight:900;
  color:#aaa
}
.timelineRow{
  display:grid;
  grid-template-columns:85px 1fr 42px;
  gap:4px;
  align-items:center;
  margin-top:5px
}
.timeline{
  display:flex;
  gap:2px;
  justify-content:flex-end;
  overflow:hidden
}
.gl{
  width:18px;
  height:18px;
  min-width:18px;
  border-radius:4px;
  font-size:7px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:900
}
.gl.green{background:#00994d}
.gl.loss{background:#c62828}
.gl.g1{background:#ffc107;color:#111}
.gl.wait{
  background:#4a3510;
  border:1px solid #ffc107;
  color:#ffc107
}
.gl.sem{
  background:#333;
  color:#999
}
.nomeTL,.taxaTL{
  font-size:8px;
  font-weight:900
}
.taxaTL{text-align:right}
.duplas14{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  gap:5px
}
.dupla14{
  min-height:65px;
  border-radius:7px;
  background:#272727;
  border:2px solid #555;
  display:flex;
  justify-content:center;
  align-items:flex-start;
  position:relative;
  padding:6px 4px 26px
}
.dupla14.green{border-color:#00b85c}
.dupla14.loss{border-color:#d93a3a}
.dupla14.g1{border-color:#ffc107}
.dupla14.wait{border-color:#8a6b00}
.bolaDupla{
  width:31px;
  height:31px;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
  font-weight:900;
  border:2px solid #aaa
}
.resultadoEntrada{
  position:absolute;
  bottom:3px;
  left:50%;
  transform:translateX(-50%);
  background:#171717;
  border:1px solid #777;
  border-radius:5px;
  padding:3px 5px;
  font-size:8px;
  white-space:nowrap
}
.resultadoEntrada.green{background:#00994d}
.resultadoEntrada.loss{background:#c62828}
.resultadoEntrada.g1{
  background:#ffc107;
  color:#111
}
.resultadoEntrada.wait{color:#ffc107}
.jogadaStatus{
  display:inline-block;
  font-size:9px;
  font-weight:900;
  color:#00e5ff;
  border:1px solid #007d98;
  background:#15323a;
  padding:6px;
  border-radius:6px;
  margin-bottom:7px
}
.jogadaStatus.congelada{
  color:#ffc107;
  border-color:#ffc107;
  background:#4a3510
}
.grupoRegiao{
  margin-bottom:8px;
  background:#161616;
  border:1px solid #333;
  border-radius:8px;
  padding:6px
}
.grupoRegiaoTitulo{
  font-size:9px;
  font-weight:900;
  color:#aaa;
  margin-bottom:5px
}
.jogada{
  display:flex;
  gap:5px;
  overflow-x:auto
}
.bloco{
  min-width:135px;
  background:#111;
  border:1px solid #00e5ff;
  border-radius:8px;
  padding:7px;
  text-align:center
}
.bloco.um{border-color:#ffc107}
.bloco small{
  font-size:8px;
  color:#999;
  font-weight:900
}
.bloco strong{
  display:block;
  font-size:22px;
  margin:4px
}
.numeros{
  border-top:1px solid #333;
  padding-top:5px;
  font-size:10px;
  font-weight:900
}
.teclado{
  display:grid;
  grid-template-columns:repeat(6,1fr);
  gap:4px
}
.numero{
  height:39px;
  border:1px solid #666;
  border-radius:6px;
  color:#fff
}
.zero{grid-column:span 6}
.status{
  font-size:9px;
  font-weight:900;
  color:#00e676;
  margin-top:7px;
  line-height:1.6
}
@media(max-width:600px){
  .resumo{grid-template-columns:repeat(2,1fr)}
  .duplas14{grid-template-columns:repeat(4,1fr)}
  .timelineRow{grid-template-columns:70px 1fr 36px}
}
</style>

<div class="app">

<h2>ANÁLISE BETA</h2>

<div class="painel">
  <textarea
    id="entradaHistorico"
    placeholder="Cole o histórico — últimos 20"
  ></textarea>

  <div class="botoes">
    <button id="inserir" class="btn verde">INSERIR</button>
    <button id="apagar" class="btn">APAGAR ÚLTIMO</button>
    <button id="limpar" class="btn red">APAGAR TUDO</button>
  </div>

  <div id="status" class="status">PRONTO</div>
</div>

<div class="painel">

  <div class="seletorGrupo">
    <div class="seletorTitulo">AUTO • 12 CANDIDATOS</div>
    <div class="modos">
      <button id="btnAUTO" class="modo">AUTO</button>
    </div>
  </div>

  <div class="seletorGrupo">
    <div class="seletorTitulo">NORMAL • DÚZIAS FÍSICAS</div>
    <div class="modos">
      <button id="btnN4" class="modo">C4</button>
      <button id="btnN5" class="modo">C5</button>
      <button id="btnN6" class="modo">C6</button>
    </div>
  </div>

  <div class="seletorGrupo">
    <div class="seletorTitulo">DINÂMICO • DÚZIAS FÍSICAS</div>
    <div class="modos">
      <button id="btnD4" class="modo dinamico">C4</button>
      <button id="btnD5" class="modo dinamico">C5</button>
      <button id="btnD6" class="modo dinamico">C6</button>
    </div>
  </div>

  <div class="seletorGrupo">
    <div class="seletorTitulo">RAIO X NORMAL</div>
    <div class="modos">
      <button id="btnRN4" class="modo raiox">RX C4</button>
      <button id="btnRN5" class="modo raiox">RX C5</button>
      <button id="btnRN6" class="modo raiox">RX C6</button>
    </div>
  </div>

  <div class="seletorGrupo">
    <div class="seletorTitulo">RAIO X DINÂMICO</div>
    <div class="modos">
      <button id="btnRD4" class="modo raiox dinamico">RX C4</button>
      <button id="btnRD5" class="modo raiox dinamico">RX C5</button>
      <button id="btnRD6" class="modo raiox dinamico">RX C6</button>
    </div>
  </div>

  <div id="origemAuto" class="origemAuto">AUTO</div>
  <div id="resumo" class="resumo"></div>

  <div class="timelineSecao">
    <div class="timelineTituloGrupo">CONCENTRAÇÃO FÍSICA DAS DÚZIAS</div>
    <div id="duzias" class="duziasLinha"></div>
  </div>

  <div class="timelineSecao">
    <div class="timelineTituloGrupo">AUTO FINAL</div>
    <div id="timelineAUTO" class="timelineRow"></div>
  </div>

  <div class="timelineSecao">
    <div class="timelineTituloGrupo">NORMAL</div>
    <div id="timelineN4" class="timelineRow"></div>
    <div id="timelineN5" class="timelineRow"></div>
    <div id="timelineN6" class="timelineRow"></div>
  </div>

  <div class="timelineSecao">
    <div class="timelineTituloGrupo">DINÂMICO</div>
    <div id="timelineD4" class="timelineRow"></div>
    <div id="timelineD5" class="timelineRow"></div>
    <div id="timelineD6" class="timelineRow"></div>
  </div>

  <div class="timelineSecao">
    <div class="timelineTituloGrupo">RAIO X NORMAL</div>
    <div id="timelineRN4" class="timelineRow"></div>
    <div id="timelineRN5" class="timelineRow"></div>
    <div id="timelineRN6" class="timelineRow"></div>
  </div>

  <div class="timelineSecao">
    <div class="timelineTituloGrupo">RAIO X DINÂMICO</div>
    <div id="timelineRD4" class="timelineRow"></div>
    <div id="timelineRD5" class="timelineRow"></div>
    <div id="timelineRD6" class="timelineRow"></div>
  </div>

</div>

<div class="painel">
  <div class="titulo">ÚLTIMAS 14 • JOGADA SELECIONADA</div>
  <div id="ultimos14" class="duplas14"></div>
</div>

<div class="painel">
  <div class="titulo">JOGADA</div>
  <div id="jogada"></div>
</div>

<div class="painel">
  <div class="titulo">TECLADO</div>
  <div id="teclado" class="teclado"></div>
</div>

</div>
`;

document.body.appendChild(app);

/* ============================================================
   EVENTOS
============================================================ */

document.getElementById("inserir").onclick=inserirHistorico;
document.getElementById("apagar").onclick=apagarUltimo;
document.getElementById("limpar").onclick=apagarTudo;
document.getElementById("btnAUTO").onclick=selecionarAuto;

for (const rx of RX_LIST) {
  document.getElementById("btnN"+rx).onclick=
    ()=>selecionarManual("NORMAL",rx);

  document.getElementById("btnD"+rx).onclick=
    ()=>selecionarManual("DINAMICO",rx);

  document.getElementById("btnRN"+rx).onclick=
    ()=>selecionarManual("RX_NORMAL",rx);

  document.getElementById("btnRD"+rx).onclick=
    ()=>selecionarManual("RX_DINAMICO",rx);
}

/* ============================================================
   TECLADO
============================================================ */

const teclado=document.getElementById("teclado");

for (let n=1;n<=36;n++) {
  const b=document.createElement("button");

  b.className="numero";
  b.textContent=n;
  b.style.background=corRoleta(n);
  b.onclick=()=>adicionarNumero(n);

  teclado.appendChild(b);
}

const zero=document.createElement("button");

zero.className="numero zero";
zero.textContent="0";
zero.style.background=corRoleta(0);
zero.onclick=()=>adicionarNumero(0);

teclado.appendChild(zero);

/* ============================================================
   RENDER TIMELINES
============================================================ */

function renderTimeline(id,nome,lista) {
  const itens=(lista||[]).slice(-20);

  const validos=itens.filter(x=>
    !x.semJogada &&
    !x.aguardandoG1 &&
    x.green!==null &&
    x.green!==undefined
  );

  const taxa=validos.length
    ? validos.filter(x=>x.green).length/validos.length*100
    : 0;

  const html=itens.map(x=>{
    if (x.semJogada) {
      return '<span class="gl sem">—</span>';
    }

    if (x.aguardandoG1) {
      return '<span class="gl wait">…</span>';
    }

    if (x.green && x.fase==="G1") {
      return '<span class="gl g1">G1</span>';
    }

    if (x.green) {
      return '<span class="gl green">G</span>';
    }

    return '<span class="gl loss">L</span>';
  }).join("");

  document.getElementById(id).innerHTML=
    '<div class="nomeTL">'+nome+'</div>'+
    '<div class="timeline">'+html+'</div>'+
    '<div class="taxaTL">'+
    (validos.length?taxa.toFixed(0)+"%":"—")+
    '</div>';
}

function renderDuzias(analise) {
  document.getElementById("duzias").innerHTML=
    analise.ranking.map((x,i)=>`
      <div class="duziaCard ${i===0?"forte":""}">
        <small>${x.duzia}ª DÚZIA</small>
        <strong>${(x.intensidade*100).toFixed(0)}%</strong>
        <span>${x.contagem}/20 • FÍSICA</span>
      </div>
    `).join("");
}

function nomeMotor(motor) {
  return {
    NORMAL:"NORMAL",
    DINAMICO:"DINÂMICO",
    RX_NORMAL:"RAIO X NORMAL",
    RX_DINAMICO:"RAIO X DINÂMICO"
  }[motor]||"—";
}

function renderJogada(config,congelada=false) {
  const area=document.getElementById("jogada");

  if (!config?.valido||!config.jogada?.valido) {
    area.innerHTML=
      '<div style="color:#999">AGUARDANDO JOGADA VÁLIDA</div>';
    return;
  }

  const blocos=[
    ...config.jogada.blocos2.map(b=>({...b,um:false})),
    ...config.jogada.blocos1.map(b=>({...b,um:true}))
  ];

  const ordem=["TIERS","ORPHELINS","ZERO","VOISINS","OUTROS"];

  blocos.sort((a,b)=>
    ordem.indexOf(regiao(a.centro))-
    ordem.indexOf(regiao(b.centro))
  );

  const grupos=new Map();

  for (const bloco of blocos) {
    const nome=regiao(bloco.centro);

    if (!grupos.has(nome)) grupos.set(nome,[]);

    grupos.get(nome).push(bloco);
  }

  let html=`
    <div class="jogadaStatus ${congelada?"congelada":""}">
      ${congelada?"JOGADA CONGELADA • G1":"JOGADA ATUAL"}
      • ${nomeMotor(config.motor)} C${config.rx}
      • ${config.alvoDuzia||duziaMotor(config.rx)}ª DÚZIA
      • 28 NÚMEROS
    </div>
  `;

  for (const [nome,itens] of grupos) {
    html+=`
      <div class="grupoRegiao">
        <div class="grupoRegiaoTitulo">${nome}</div>
        <div class="jogada">
          ${itens.map(b=>`
            <div class="bloco ${b.um?"um":""}">
              <small>${b.um?"1 VIZINHO":"2 VIZINHOS"} DO</small>
              <strong>${b.centro}</strong>
              <div class="numeros">
                ${b.numeros.join(" • ")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  area.innerHTML=html;
}

function renderUltimos14() {
  document.getElementById("ultimos14").innerHTML=
    estado.visual.slice(-14).map(x=>{
      let classe="loss";
      let texto="L";

      if (x.semJogada) {
        classe="sem";
        texto="—";
      } else if (x.fase==="ESPERA_G1") {
        classe="wait";
        texto="…";
      } else if (x.fase==="G1") {
        classe="g1";
        texto="G1";
      } else if (x.green) {
        classe="green";
        texto="G";
      }

      return `
        <div class="dupla14 ${classe}">
          <div
            class="bolaDupla"
            style="background:${corRoleta(x.resultado)}"
          >${x.resultado}</div>
          <div class="resultadoEntrada ${classe}">
            ${texto}${x.g1!==null&&x.g1!==undefined?" • "+x.g1:""}
          </div>
        </div>
      `;
    }).join("");
}

/* ============================================================
   RENDER PRINCIPAL
============================================================ */

function render() {
  const base=limitar(estado.historico);
  const analise=analisarDuzias(base);

  const configs=calcularDoze(base);
  const auto=escolherAuto(configs);
  const ativa=configAtiva(configs,auto);

  garantirPendentes(configs,auto);

  const botoes=[
    "btnAUTO",
    "btnN4","btnN5","btnN6",
    "btnD4","btnD5","btnD6",
    "btnRN4","btnRN5","btnRN6",
    "btnRD4","btnRD5","btnRD6"
  ];

  for (const id of botoes) {
    document.getElementById(id).classList.remove("ativo");
  }

  if (estado.modo==="AUTO") {
    document.getElementById("btnAUTO").classList.add("ativo");
  } else {
    const prefixo={
      NORMAL:"btnN",
      DINAMICO:"btnD",
      RX_NORMAL:"btnRN",
      RX_DINAMICO:"btnRD"
    }[estado.motorManual];

    document.getElementById(
      prefixo+estado.manualRX
    ).classList.add("ativo");
  }

  document.getElementById("origemAuto").textContent=
    auto
      ? "AUTO ESCOLHEU • "+
        nomeMotor(auto.motor)+
        " • C"+auto.rx+
        " • "+auto.alvoDuzia+"ª DÚZIA"+
        " • SCORE "+auto.scoreAuto.toFixed(1)
      : "AUTO • AGUARDANDO JOGADAS VÁLIDAS";

  const bt=auto?.backtest;
  const live=statsTimeline(estado.timelines.AUTO);

  const resumo=[
    ["BT10 AUTO",bt?.taxa10],
    ["BT20 AUTO",bt?.taxa20],
    ["REAL10 AUTO",live.total?live.taxa10:null],
    ["REAL20 AUTO",live.total?live.taxa20:null]
  ];

  document.getElementById("resumo").innerHTML=
    resumo.map(([nome,valor])=>`
      <div class="card">
        <small>${nome}</small>
        <strong>${Number.isFinite(valor)?valor.toFixed(0)+"%":"—"}</strong>
      </div>
    `).join("");

  renderDuzias(analise);

  renderTimeline(
    "timelineAUTO",
    "AUTO",
    estado.timelines.AUTO
  );

  const prefixos={
    NORMAL:"N",
    DINAMICO:"D",
    RX_NORMAL:"RN",
    RX_DINAMICO:"RD"
  };

  for (const motor of MOTORES) {
    for (const rx of RX_LIST) {
      renderTimeline(
        "timeline"+prefixos[motor]+rx,
        (motor.startsWith("RX")?"RX C":"C")+rx,
        estado.timelines[motor][rx]
      );
    }
  }

  renderUltimos14();

  let configExibida=ativa;
  let congelada=false;

  const freeze=estado.modo==="AUTO"
    ? estado.freezes.AUTO
    : estado.freezes[estado.motorManual]?.[estado.manualRX];

  if (freeze) {
    configExibida={
      valido:true,
      motor:freeze.motor,
      rx:freeze.rx,
      alvoDuzia:duziaMotor(freeze.rx),
      jogada:jogadaDeSnapshot(freeze)
    };

    congelada=true;
  }

  renderJogada(configExibida,congelada);

  const totalValidas=MOTORES.reduce(
    (s,motor)=>s+RX_LIST.filter(
      rx=>configs[motor][rx]?.valido
    ).length,
    0
  );

  const assinaturas=new Set();

  for (const motor of MOTORES) {
    for (const rx of RX_LIST) {
      const cfg=configs[motor][rx];

      if (cfg?.valido) {
        assinaturas.add(cfg.assinatura);
      }
    }
  }

  const dominante=analise.ranking[0];

  document.getElementById("status").textContent=
    base.length+"/20"+
    " • 12 MOTORES"+
    " • "+totalValidas+"/12 JOGADAS VÁLIDAS"+
    " • "+assinaturas.size+" COBERTURAS DIFERENTES"+
    " • 5 ALVOS ±2 + 1 ALVO ±1"+
    " • SEM SOBREPOSIÇÃO"+
    " • SEM BURACO DE 1"+
    " • AUTO ATIVO"+
    (dominante
      ?" • CONCENTRAÇÃO: "+dominante.duzia+"ª DÚZIA"
      :"")+
    (congelada?" • G1 CONGELADO":"");

  salvar();
}

/* ============================================================
   INICIALIZAÇÃO
============================================================ */

render();

})();
