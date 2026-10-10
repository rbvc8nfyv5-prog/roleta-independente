
(function () {
  "use strict";

  /*
   ANÁLISE BETA V3.4
   -----------------
   AUTO padrão: 3º colocado no ranking.
   Opções: 1º, 2º, 3º e 4º.
   Ranking: scoreAuto decrescente.
   12 motores independentes.
   G1 congelado por motor.
   28 números cobertos, sem sobreposição.
   Cinco centros com 2 vizinhos.
   Um centro com 1 vizinho.
   Jogador Virtual: auditoria da escolha.
  */

  const STORAGE = "ANALISE_BETA_VIRTUAL_V34";
  const STORAGE_ANTIGO = "ANALISE_BETA_VIRTUAL_V3";

  const MAX_HISTORICO = 20;
  const MAX_TIMELINE = 20;
  const MAX_VISUAL = 14;

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

  const PREFIXOS = {
    NORMAL: "N",
    DINAMICO: "D",
    RX_NORMAL: "RN",
    RX_DINAMICO: "RD"
  };

  const NOMES = {
    NORMAL: "NORMAL",
    DINAMICO: "DINÂMICO",
    RX_NORMAL: "RAIO-X",
    RX_DINAMICO: "RAIO-X DINÂMICO"
  };

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
    VOISINS: new Set([
      19,4,21,2,25,28,7,29,18,22
    ]),
    ZERO: new Set([
      0,32,15,26,3,35,12
    ]),
    TIERS: new Set([
      27,13,36,11,30,8,
      23,10,5,24,16,33
    ]),
    ORPHELINS: new Set([
      9,31,14,20,1,17,6,34
    ])
  };

  const ORDEM_REGIOES = [
    "VOISINS",
    "ZERO",
    "TIERS",
    "ORPHELINS",
    "OUTROS"
  ];

  const INDICE = new Map(
    TRACK.map((n,i) => [n,i])
  );

  const mod = (n,m) => ((n % m) + m) % m;

  function el(id) {
    return document.getElementById(id);
  }

  function pos(n) {
    return INDICE.get(n) ?? -1;
  }

  function distancia(a,b) {
    const ia = pos(a);
    const ib = pos(b);

    if (ia < 0 || ib < 0) return 99;

    const d = Math.abs(ia-ib);
    return Math.min(d,37-d);
  }

  function delta(a,b) {
    if (pos(a) < 0 || pos(b) < 0) return 0;

    let d = mod(pos(b)-pos(a),37);
    if (d > 18) d -= 37;

    return d;
  }

  function vizinhos(n,qtd) {
    const i = pos(n);
    if (i < 0) return [];

    const saida = [];

    for (let d=-qtd;d<=qtd;d++) {
      saida.push(TRACK[mod(i+d,37)]);
    }

    return saida;
  }

  function duzia(n) {
    if (n === 0) return 0;
    if (n <= 12) return 1;
    if (n <= 24) return 2;
    return 3;
  }

  function alvoRX(rx) {
    return rx-3;
  }

  function corNumero(n) {
    if (n === 0) return "#087c48";
    return VERMELHOS.has(n)
      ? "#c6283d"
      : "#181818";
  }

  function regiao(n) {
    for (const [nome,numeros] of Object.entries(REGIOES)) {
      if (numeros.has(n)) return nome;
    }
    return "OUTROS";
  }

  function limitarHistorico(lista) {
    if (!Array.isArray(lista)) return [];

    return lista
      .map(Number)
      .filter(n =>
        Number.isInteger(n) &&
        n >= 0 &&
        n <= 36
      )
      .slice(-MAX_HISTORICO);
  }

  function formatar(n) {
    return Number.isFinite(n)
      ? n.toFixed(3).replace(".",",")
      : "—";
  }

  function criarEstrutura(valor) {
    return {
      AUTO: valor,
      NORMAL: {
        4:valor,5:valor,6:valor
      },
      DINAMICO: {
        4:valor,5:valor,6:valor
      },
      RX_NORMAL: {
        4:valor,5:valor,6:valor
      },
      RX_DINAMICO: {
        4:valor,5:valor,6:valor
      }
    };
  }

  function criarEstado() {
    const timelines = criarEstrutura(null);

    timelines.AUTO = [];

    for (const motor of MOTORES) {
      for (const rx of RX_LIST) {
        timelines[motor][rx] = [];
      }
    }

    return {
      historico: [],
      modo: "AUTO",
      motorManual: "NORMAL",
      manualRX: 4,

      autoPosicao: 3,

      timelines,
      pendentes: criarEstrutura(null),
      freezes: criarEstrutura(null),

      visual: [],
      visualFreeze: null,

      painelCandidatosAberto: false,
      painelTimelinesAberto: false,
      jogadorVirtualAberto: true,

      diagnostico: null,
      ultimoNumero: null
    };
  }

  let estado = criarEstado();

  function carregar() {
    try {
      const raw =
        localStorage.getItem(STORAGE) ||
        localStorage.getItem(STORAGE_ANTIGO);

      if (!raw) return;

      const salvo = JSON.parse(raw);
      if (!salvo || typeof salvo !== "object") return;

      estado.historico =
        limitarHistorico(salvo.historico);

      estado.modo =
        salvo.modo === "MANUAL"
          ? "MANUAL"
          : "AUTO";

      if (MOTORES.includes(salvo.motorManual)) {
        estado.motorManual = salvo.motorManual;
      }

      if (RX_LIST.includes(Number(salvo.manualRX))) {
        estado.manualRX = Number(salvo.manualRX);
      }

      estado.autoPosicao =
        [1,2,3,4].includes(Number(salvo.autoPosicao))
          ? Number(salvo.autoPosicao)
          : 3;

      estado.painelCandidatosAberto =
        !!salvo.painelCandidatosAberto;

      estado.painelTimelinesAberto =
        !!salvo.painelTimelinesAberto;

      estado.jogadorVirtualAberto =
        salvo.jogadorVirtualAberto !== false;

      estado.diagnostico =
        salvo.diagnostico || null;

      estado.ultimoNumero =
        salvo.ultimoNumero ?? null;

      if (salvo.timelines) {
        if (Array.isArray(salvo.timelines.AUTO)) {
          estado.timelines.AUTO =
            salvo.timelines.AUTO.slice(-MAX_TIMELINE);
        }

        for (const motor of MOTORES) {
          for (const rx of RX_LIST) {
            const lista = salvo.timelines[motor]?.[rx];

            if (Array.isArray(lista)) {
              estado.timelines[motor][rx] =
                lista.slice(-MAX_TIMELINE);
            }
          }
        }
      }

      for (const campo of ["pendentes","freezes"]) {
        if (!salvo[campo]) continue;

        estado[campo].AUTO =
          salvo[campo].AUTO || null;

        for (const motor of MOTORES) {
          for (const rx of RX_LIST) {
            estado[campo][motor][rx] =
              salvo[campo][motor]?.[rx] || null;
          }
        }
      }

      if (Array.isArray(salvo.visual)) {
        estado.visual =
          salvo.visual.slice(-MAX_VISUAL);
      }

      estado.visualFreeze =
        salvo.visualFreeze || null;

    } catch (erro) {
      console.warn("Erro ao carregar:",erro);
    }
  }

  function salvar() {
    try {
      localStorage.setItem(
        STORAGE,
        JSON.stringify(estado)
      );
    } catch (erro) {
      console.warn("Erro ao salvar:",erro);
    }
  }

  carregar();

  /*
   ANÁLISE FÍSICA
  */

  function analisarFisica(base) {
    const calor = new Float64Array(37);
    const contagem = [0,0,0,0];
    const forca = [0,0,0,0];
    const quebra = [0,0,0,0];

    const pesos = [1,0.78,0.52,0.29,0.14,0.06];

    for (let i=0;i<base.length;i++) {
      const numero = base[i];

      const peso =
        0.45 +
        0.55*(i+1)/Math.max(1,base.length);

      const d = duzia(numero);

      if (d) {
        contagem[d]++;
        forca[d] += peso;
      }

      for (let z=1;z<=3;z++) {
        if (ZONAS_QUEBRA[z].includes(numero)) {
          quebra[z] += peso;
        }
      }

      for (let j=0;j<37;j++) {
        const dist = distancia(numero,TRACK[j]);

        if (dist <= 5) {
          calor[j] += pesos[dist]*peso;
        }
      }
    }

    const info = {};

    for (let z=1;z<=3;z++) {
      const numeros = [
        ...new Set(GRUPOS_FISICOS[z].flat())
      ];

      const fisica =
        numeros.reduce(
          (s,n) => s+calor[pos(n)],
          0
        )/numeros.length;

      const score =
        forca[z]*0.46 +
        fisica*0.40 +
        quebra[z]*0.14;

      info[z] = {
        duzia:z,
        contagem:contagem[z],
        fisica,
        quebra:quebra[z],
        score
      };
    }

    const maior = Math.max(
      0.00001,
      info[1].score,
      info[2].score,
      info[3].score
    );

    const ranking = [1,2,3]
      .map(z => ({
        ...info[z],
        intensidade:info[z].score/maior
      }))
      .sort((a,b) => b.score-a.score);

    return {
      calor,
      info,
      ranking,
      maxCalor:Math.max(0.00001,...calor)
    };
  }

  function contagemFisica(base,rx) {
    const mapa = new Float64Array(37);

    const decay = {
      4:0.78,
      5:0.82,
      6:0.86
    }[rx];

    const pesos = [1,0.72,0.44,0.22,0.10];

    let peso = 1;

    for (let i=base.length-1;i>=0;i--) {
      for (let j=0;j<37;j++) {
        const dist = distancia(base[i],TRACK[j]);

        if (dist <= 4) {
          mapa[j] += pesos[dist]*peso;
        }
      }

      peso *= decay;
    }

    const maior = Math.max(0.00001,...mapa);

    return mapa.map(v => v/maior);
  }

  /*
   RAIO-X
  */

  function analisarRaioX(base,rx) {
    const frequencia = new Float64Array(37);

    if (base.length < rx*2+4) {
      return {
        valido:false,
        frequencia,
        similaridade:0
      };
    }

    const atual = base.slice(-rx);
    const candidatos = [];

    for (
      let i=0;
      i+rx<base.length-rx;
      i++
    ) {
      let score = 0;

      for (let k=0;k<rx;k++) {
        const antigo = base[i+k];
        const recente = atual[k];

        if (duzia(antigo) === duzia(recente)) {
          score += 0.70;
        }

        score += 0.30*Math.max(
          0,
          1-distancia(antigo,recente)/19
        );
      }

      candidatos.push({
        numero:base[i+rx],
        score:score/rx,
        indice:i
      });
    }

    candidatos.sort(
      (a,b) => b.score-a.score || b.indice-a.indice
    );

    const escolhidos = candidatos.slice(
      0,
      Math.max(
        4,
        Math.ceil(candidatos.length*0.30)
      )
    );

    const pesos = [1,0.70,0.42,0.18];

    for (const item of escolhidos) {
      for (let j=0;j<37;j++) {
        const dist = distancia(
          item.numero,
          TRACK[j]
        );

        if (dist <= 3) {
          frequencia[j] +=
            pesos[dist] *
            (0.40+0.60*item.score);
        }
      }
    }

    const maior = Math.max(
      0.00001,
      ...frequencia
    );

    const similaridade =
      escolhidos.length
        ? escolhidos.reduce(
            (s,item) => s+item.score,
            0
          )/escolhidos.length*100
        : 0;

    return {
      valido:escolhidos.length>0,
      frequencia:frequencia.map(v => v/maior),
      similaridade
    };
  }

  /*
   PONTUAÇÃO
  */

  function pontuarMotor(
    base,
    motor,
    rx,
    analise,
    contagem,
    raioX
  ) {
    const usaRX = motor.startsWith("RX");
    const dinamico = motor.includes("DINAMICO");

    if (usaRX && !raioX?.valido) {
      return null;
    }

    const alvoDuzia = alvoRX(rx);
    const scores = new Float64Array(37);

    for (let j=0;j<37;j++) {
      const numero = TRACK[j];

      const principal =
        duzia(numero) === alvoDuzia ? 1 : 0;

      let proximidade = 0;

      for (const grupo of GRUPOS_FISICOS[alvoDuzia]) {
        for (const alvo of grupo) {
          const d = distancia(numero,alvo);

          const peso =
            d===0 ? 1 :
            d===1 ? 0.75 :
            d===2 ? 0.45 :
            d===3 ? 0.20 : 0;

          proximidade = Math.max(
            proximidade,
            peso
          );
        }
      }

      const quebra =
        ZONAS_QUEBRA[alvoDuzia].some(
          alvo => distancia(numero,alvo)<=2
        ) ? 1 : 0;

      const fisica =
        analise.calor[j]/analise.maxCalor;

      let score =
        principal*0.52 +
        proximidade*0.48 +
        fisica*0.24 +
        quebra*0.22 +
        contagem[j]*0.22;

      if (usaRX) {
        score =
          principal*0.42 +
          proximidade*0.38 +
          fisica*0.22 +
          quebra*0.18 +
          contagem[j]*0.12 +
          raioX.frequencia[j]*0.34;
      }

      if (dinamico) {
        const ultimos = base.slice(-rx);

        let direcao = 0;
        let total = 0;

        ultimos.forEach((n,i) => {
          const d = delta(numero,n);

          if (Math.abs(d)<=7) {
            const peso =
              (i+1)/ultimos.length;

            direcao += Math.sign(d)*peso;
            total += peso;
          }
        });

        if (total>0) {
          score +=
            Math.abs(direcao/total)*0.11;
        }
      }

      scores[j] = score;
    }

    return {
      scores,
      similaridade:raioX?.similaridade||0
    };
  }

  /*
   GEOMETRIA OTIMIZADA

   Em vez de guardar milhares de objetos
   e percorrê-los para cada motor,
   a seleção usa programação dinâmica.

   Os seis setores são blocos físicos
   não sobrepostos de tamanhos:
   5,5,5,5,5,3.

   Restam 9 posições descobertas,
   distribuídas em lacunas de 0
   ou pelo menos 2 posições.
  */

  function construirJogada(scores) {
    const pontos5 = new Float64Array(37);
    const pontos3 = new Float64Array(37);

    for (let centro=0;centro<37;centro++) {
      for (let d=-2;d<=2;d++) {
        const peso =
          d===0 ? 1.22 :
          Math.abs(d)===1 ? 1.08 : 1;

        pontos5[centro] +=
          scores[mod(centro+d,37)]*peso;
      }

      for (let d=-1;d<=1;d++) {
        pontos3[centro] +=
          scores[mod(centro+d,37)] *
          (d===0 ? 1.22 : 1);
      }
    }

    let melhor = null;
    let maior = -Infinity;

    /*
      Para cada início e posição do bloco
      de três números, a DP escolhe
      as seis lacunas totalizando nove.
    */

    for (let inicio=0;inicio<37;inicio++) {
      for (let pos3=0;pos3<6;pos3++) {
        const tamanhos = [
          5,5,5,5,5,5
        ];

        tamanhos[pos3] = 3;

        const memo = new Map();

        function resolver(k,gastos) {
          const chave = k+"|"+gastos;

          if (memo.has(chave)) {
            return memo.get(chave);
          }

          if (k===6) {
            return gastos===9
              ? {score:0,gaps:[]}
              : null;
          }

          const anteriores =
            tamanhos
              .slice(0,k)
              .reduce((a,b)=>a+b,0);

          const cursor =
            mod(
              inicio+anteriores+gastos,
              37
            );

          const tamanho = tamanhos[k];

          const centro =
            mod(
              cursor+Math.floor(tamanho/2),
              37
            );

          const valor =
            tamanho===3
              ? pontos3[centro]
              : pontos5[centro];

          let escolhido = null;

          for (
            let gap=0;
            gap<=9-gastos;
            gap++
          ) {
            if (gap===1) continue;

            const resto =
              resolver(k+1,gastos+gap);

            if (!resto) continue;

            const total = valor+resto.score;

            if (
              !escolhido ||
              total>escolhido.score
            ) {
              escolhido = {
                score:total,
                gaps:[gap,...resto.gaps]
              };
            }
          }

          memo.set(chave,escolhido);
          return escolhido;
        }

        const resultado = resolver(0,0);
        if (!resultado) continue;

        if (resultado.score>maior) {
          maior = resultado.score;

          let cursor = inicio;
          const centros5 = [];
          let centro3 = -1;

          for (let k=0;k<6;k++) {
            const tamanho = tamanhos[k];

            const centro =
              mod(
                cursor+Math.floor(tamanho/2),
                37
              );

            if (tamanho===3) {
              centro3 = TRACK[centro];
            } else {
              centros5.push(TRACK[centro]);
            }

            cursor = mod(
              cursor+tamanho+resultado.gaps[k],
              37
            );
          }

          melhor = {
            centros5,
            centro3
          };
        }
      }
    }

    if (!melhor) return null;

    const blocos2 =
      melhor.centros5.map(centro => ({
        centro,
        qtd:2,
        numeros:vizinhos(centro,2)
      }));

    const blocos1 = [{
      centro:melhor.centro3,
      qtd:1,
      numeros:vizinhos(melhor.centro3,1)
    }];

    const numeros = new Set(
      [...blocos2,...blocos1]
        .flatMap(b => b.numeros)
    );

    if (numeros.size!==28) {
      return null;
    }

    for (let i=0;i<37;i++) {
      const n = TRACK[i];

      if (numeros.has(n)) continue;

      const anterior = TRACK[mod(i-1,37)];
      const seguinte = TRACK[mod(i+1,37)];

      if (
        numeros.has(anterior) &&
        numeros.has(seguinte)
      ) {
        return null;
      }
    }

    const assinatura =
      blocos2
        .map(b=>b.centro)
        .sort((a,b)=>a-b)
        .join("-") +
      "|" +
      blocos1[0].centro;

    return {
      valido:true,
      blocos2,
      blocos1,
      numeros,
      score:maior,
      assinatura
    };
  }

  /*
   CONFIGURAÇÕES
  */

  function gerarConfig(
    base,
    motor,
    rx,
    analise,
    contagem,
    raioX
  ) {
    const minimo =
      motor.startsWith("RX")
        ? Math.max(14,rx*2+4)
        : Math.max(8,rx+4);

    if (base.length<minimo) {
      return {
        valido:false,
        motor,
        rx,
        motivo:"AGUARDANDO HISTÓRICO"
      };
    }

    const info = pontuarMotor(
      base,
      motor,
      rx,
      analise,
      contagem,
      raioX
    );

    if (!info) {
      return {
        valido:false,
        motor,
        rx,
        motivo:"SEM RÉPLICAS"
      };
    }

    const jogada =
      construirJogada(info.scores);

    if (!jogada) {
      return {
        valido:false,
        motor,
        rx,
        motivo:"SEM JOGADA VÁLIDA"
      };
    }

    return {
      valido:true,
      motor,
      rx,
      alvoDuzia:alvoRX(rx),
      jogada,
      score:jogada.score,
      assinatura:jogada.assinatura,
      similaridade:info.similaridade
    };
  }

  /*
   ESTATÍSTICAS
  */

  function estatisticas(lista) {
    const validos = (lista||[])
      .filter(item =>
        !item.semJogada &&
        !item.aguardandoG1 &&
        typeof item.green==="boolean"
      )
      .slice(-20);

    function taxa(qtd) {
      const itens = validos.slice(-qtd);

      return itens.length
        ? itens.filter(x=>x.green).length /
          itens.length*100
        : 0;
    }

    let perdas = 0;

    for (let i=validos.length-1;i>=0;i--) {
      if (validos[i].green) break;
      perdas++;
    }

    return {
      total:validos.length,
      taxa5:taxa(5),
      taxa10:taxa(10),
      taxa20:taxa(20),
      perdas
    };
  }

  /*
   CACHE E RANKING
  */

  let cacheChave = null;
  let cacheResultado = null;

  function invalidarCache() {
    cacheChave = null;
    cacheResultado = null;
  }

  function calcularDoze(base) {
    const configs = {
      NORMAL:{},
      DINAMICO:{},
      RX_NORMAL:{},
      RX_DINAMICO:{}
    };

    const analise = analisarFisica(base);
    const contagens = {};
    const raioXs = {};

    for (const rx of RX_LIST) {
      contagens[rx] =
        contagemFisica(base,rx);

      raioXs[rx] =
        analisarRaioX(base,rx);
    }

    const ranking = [];

    for (const motor of MOTORES) {
      for (const rx of RX_LIST) {
        const config = gerarConfig(
          base,
          motor,
          rx,
          analise,
          contagens[rx],
          raioXs[rx]
        );

        if (config.valido) {
          const live =
            estatisticas(estado.timelines[motor][rx]);

          config.scoreAuto =
            config.score +
            live.taxa10*0.02 +
            live.taxa20*0.01 -
            live.perdas*0.30 +
            config.similaridade*0.005;

          ranking.push(config);
        }

        configs[motor][rx] = config;
      }
    }

    ranking.sort(
      (a,b) =>
        b.scoreAuto-a.scoreAuto ||
        b.score-a.score ||
        MOTORES.indexOf(a.motor)-
        MOTORES.indexOf(b.motor) ||
        a.rx-b.rx
    );

    ranking.forEach((item,i) => {
      item.posicaoRanking = i+1;
    });

    return {
      configs,
      analise,
      ranking
    };
  }

  function escolherAuto(ranking) {
    const posicao = estado.autoPosicao || 3;

    return (
      ranking[posicao-1] ||
      ranking[ranking.length-1] ||
      null
    );
  }

  function obterConfigs() {
    const chave = estado.historico.join(",");

    if (
      cacheChave===chave &&
      cacheResultado
    ) {
      return cacheResultado;
    }

    const resultado =
      calcularDoze(estado.historico);

    resultado.auto =
      escolherAuto(resultado.ranking);

    cacheChave = chave;
    cacheResultado = resultado;

    return resultado;
  }

  function configAtiva(dados) {
    if (estado.modo==="AUTO") {
      return dados.auto;
    }

    return (
      dados.configs[estado.motorManual]
        ?.[estado.manualRX] ||
      null
    );
  }

  /*
   SNAPSHOTS

   A escolha é congelada antes
   do próximo resultado.
  */

  function snapshot(config) {
    if (!config?.valido) return null;

    return {
      motor:config.motor,
      rx:config.rx,
      score:config.score,
      scoreAuto:config.scoreAuto,
      posicaoRanking:config.posicaoRanking||null,
      centros2:config.jogada.blocos2
        .map(b=>b.centro),
      centro1:config.jogada.blocos1[0].centro,
      historico:estado.historico.join(",")
    };
  }

  function jogadaSnapshot(snap) {
    if (!snap) return null;

    const blocos2 =
      (snap.centros2||[]).map(centro=>({
        centro,
        qtd:2,
        numeros:vizinhos(centro,2)
      }));

    const blocos1 = [{
      centro:snap.centro1,
      qtd:1,
      numeros:vizinhos(snap.centro1,1)
    }];

    return {
      valido:true,
      blocos2,
      blocos1,
      numeros:new Set(
        [...blocos2,...blocos1]
          .flatMap(b=>b.numeros)
      )
    };
  }

  function prepararPendentes(dados) {
    const chave = estado.historico.join(",");

    if (
      !estado.freezes.AUTO &&
      estado.pendentes.AUTO?.historico!==chave
    ) {
      estado.pendentes.AUTO =
        snapshot(dados.auto);
    }

    for (const motor of MOTORES) {
      for (const rx of RX_LIST) {
        if (estado.freezes[motor][rx]) {
          continue;
        }

        if (
          estado.pendentes[motor][rx]?.historico!==chave
        ) {
          estado.pendentes[motor][rx] =
            snapshot(dados.configs[motor][rx]);
        }
      }
    }
  }

  /*
   CLASSIFICAÇÃO
  */

  function classificar(numero,jogada) {
    if (!jogada?.valido) {
      return {
        green:false,
        tipo:"SEM",
        distancia:null,
        centro:null,
        gap:null
      };
    }

    const blocos = [
      ...jogada.blocos2,
      ...jogada.blocos1
    ];

    for (const bloco of blocos) {
      if (bloco.numeros.includes(numero)) {
        const d = distancia(numero,bloco.centro);

        return {
          green:true,
          tipo:
            d===0 ? "ALVO" :
            d===1 ? "V1" : "V2",
          distancia:d,
          centro:bloco.centro,
          gap:0
        };
      }
    }

    let maisProximo = null;

    for (const bloco of blocos) {
      const d = distancia(numero,bloco.centro);
      const gap = d-bloco.qtd;

      if (
        gap>0 &&
        (
          !maisProximo ||
          gap<maisProximo.gap
        )
      ) {
        maisProximo = {
          centro:bloco.centro,
          distancia:d,
          gap,
          qtd:bloco.qtd
        };
      }
    }

    return {
      green:false,
      tipo:
        maisProximo?.gap===1
          ? "FORA1"
          : maisProximo?.gap===2
            ? "FORA2"
            : "FORA",
      distancia:maisProximo?.distancia??null,
      centro:maisProximo?.centro??null,
      gap:maisProximo?.gap??null
    };
  }

  /*
   TIMELINES E G1
  */

  function avaliarLinha(
    numero,
    pendente,
    freeze,
    timeline,
    chave
  ) {
    const lista = timeline.slice(-MAX_TIMELINE);

    if (freeze) {
      const resultado = classificar(
        numero,
        jogadaSnapshot(freeze)
      );

      let ultimo = -1;

      for (let i=lista.length-1;i>=0;i--) {
        if (lista[i].aguardandoG1) {
          ultimo = i;
          break;
        }
      }

      const atualizacao = {
        resultadoG1:numero,
        green:resultado.green,
        tipo:resultado.tipo,
        fase:resultado.green?"G1":"LOSS",
        aguardandoG1:false,
        semJogada:false
      };

      if (ultimo>=0) {
        lista[ultimo] = {
          ...lista[ultimo],
          ...atualizacao
        };
      } else {
        lista.push({
          resultado:numero,
          ...atualizacao
        });
      }

      return {
        timeline:lista.slice(-MAX_TIMELINE),
        pendente:null,
        freeze:null
      };
    }

    if (
      !pendente ||
      pendente.historico!==chave
    ) {
      lista.push({
        resultado:numero,
        green:null,
        semJogada:true,
        fase:"SEM"
      });

      return {
        timeline:lista.slice(-MAX_TIMELINE),
        pendente:null,
        freeze:null
      };
    }

    const resultado = classificar(
      numero,
      jogadaSnapshot(pendente)
    );

    if (resultado.green) {
      lista.push({
        resultado:numero,
        green:true,
        tipo:resultado.tipo,
        semJogada:false,
        fase:"ENTRADA"
      });

      return {
        timeline:lista.slice(-MAX_TIMELINE),
        pendente:null,
        freeze:null
      };
    }

    lista.push({
      resultado:numero,
      green:null,
      semJogada:false,
      aguardandoG1:true,
      fase:"ESPERA_G1"
    });

    return {
      timeline:lista.slice(-MAX_TIMELINE),
      pendente:null,
      freeze:{...pendente}
    };
  }

  function avaliarPendentes(numero) {
    const chave = estado.historico.join(",");

    const auto = avaliarLinha(
      numero,
      estado.pendentes.AUTO,
      estado.freezes.AUTO,
      estado.timelines.AUTO,
      chave
    );

    estado.timelines.AUTO = auto.timeline;
    estado.pendentes.AUTO = auto.pendente;
    estado.freezes.AUTO = auto.freeze;

    for (const motor of MOTORES) {
      for (const rx of RX_LIST) {
        const resultado = avaliarLinha(
          numero,
          estado.pendentes[motor][rx],
          estado.freezes[motor][rx],
          estado.timelines[motor][rx],
          chave
        );

        estado.timelines[motor][rx] =
          resultado.timeline;

        estado.pendentes[motor][rx] =
          resultado.pendente;

        estado.freezes[motor][rx] =
          resultado.freeze;
      }
    }
  }

  /*
   JOGADOR VIRTUAL

   Responde:
   - Por que o AUTO não escolheu
     uma alternativa que acertaria?
   - Qual era o ranking anterior?
   - Qual alternativa cobria o número?
   - O que precisaria mudar na regra?

   A comparação é retrospectiva.
   Não usa o resultado para refazer
   a escolha anterior.
  */

  function nomeConfig(snap) {
    if (!snap) return "SEM JOGADA";

    return (
      NOMES[snap.motor] +
      " C" +
      snap.rx
    );
  }

  function diagnosticarEscolha(
    numero,
    snapEscolhido,
    rankingAnterior,
    historicoAnterior
  ) {
    if (!snapEscolhido) {
      return {
        tipo:"SEM_JOGADA",
        titulo:"AGUARDANDO JOGADA",
        texto:"Ainda não havia configuração válida para avaliar.",
        detalhes:[]
      };
    }

    const resultado = classificar(
      numero,
      jogadaSnapshot(snapEscolhido)
    );

    const alternativas =
      rankingAnterior.map((config,i) => {
        const teste = classificar(
          numero,
          config.jogada
        );

        return {
          posicao:i+1,
          motor:config.motor,
          rx:config.rx,
          scoreAuto:config.scoreAuto,
          acertou:teste.green,
          classificacao:teste.tipo,
          centro:teste.centro
        };
      });

    const acertaram =
      alternativas.filter(x=>x.acertou);

    const escolhidaPosicao =
      snapEscolhido.posicaoRanking ||
      alternativas.find(
        x =>
          x.motor===snapEscolhido.motor &&
          x.rx===snapEscolhido.rx
      )?.posicao ||
      null;

    const detalhes = [
      "Resultado: "+numero,
      "Escolha anterior: "+nomeConfig(snapEscolhido),
      "Posição da escolha: "+
        (escolhidaPosicao?escolhidaPosicao+"º":"MANUAL"),
      "Pontuação da escolha: "+
        formatar(snapEscolhido.scoreAuto),
      "Cobertura: 28 de 37 números"
    ];

    if (resultado.green) {
      detalhes.push(
        "Acerto: "+resultado.tipo+
        " do centro "+resultado.centro
      );

      return {
        tipo:"ACERTO",
        titulo:"ACERTO NA PRIMEIRA ENTRADA",
        texto:
          "A configuração escolhida antes do sorteio " +
          "já cobria o número "+numero+
          ". Não seria necessário mudar a posição do AUTO.",
        detalhes,
        resultadoOriginal:numero
      };
    }

    const alternativa =
      acertaram[0] || null;

    const outras = acertaram
      .map(x =>
        x.posicao+"º "+
        NOMES[x.motor]+" C"+x.rx+
        " ("+formatar(x.scoreAuto)+")"
      )
      .join(" • ");

    detalhes.push(
      "Alternativas que acertariam: "+
      (outras||"NENHUMA")
    );

    detalhes.push(
      "Distância além da cobertura: "+
      (resultado.gap??"—")
    );

    let texto;

    if (alternativa) {
      const diferenca =
        snapEscolhido.scoreAuto -
        alternativa.scoreAuto;

      texto =
        "O número "+numero+
        " ficou fora da configuração escolhida. " +
        "O sistema priorizou o "+
        (escolhidaPosicao||"motor selecionado")+
        "º colocado, "+nomeConfig(snapEscolhido)+
        ", mas o "+alternativa.posicao+
        "º colocado ("+
        NOMES[alternativa.motor]+
        " C"+alternativa.rx+
        ") já cobria esse resultado. ";

      if (diferenca>0) {
        texto +=
          "A alternativa recebeu "+
          formatar(diferenca)+
          " ponto(s) a menos no ranking. ";
      } else if (diferenca<0) {
        texto +=
          "A alternativa tinha pontuação maior, "+
          "mas não estava na posição configurada. ";
      } else {
        texto +=
          "As pontuações eram equivalentes "+
          "na precisão exibida. ";
      }

      texto +=
        "Para acertar essa entrada específica, "+
        "a escolha teria de ter sido o "+
        alternativa.posicao+
        "º colocado antes do sorteio. "+
        "Isso mostra uma divergência entre "+
        "a regra de seleção e o resultado observado, "+
        "não prova que essa alternativa "+
        "seria melhor no próximo giro.";

    } else {
      texto =
        "O número "+numero+
        " ficou fora da configuração escolhida "+
        "e nenhuma das alternativas válidas "+
        "do ranking anterior o cobria. "+
        "Trocar apenas entre 1º, 2º, 3º ou 4º "+
        "não teria acertado essa entrada. "+
        "Seria necessário alterar a composição "+
        "dos setores ou a regra de pontuação, "+
        "sem garantia de melhora futura.";
    }

    const anterior =
      historicoAnterior.length
        ? historicoAnterior[historicoAnterior.length-1]
        : null;

    if (anterior!==null) {
      detalhes.push(
        "Resultado anterior: "+anterior
      );
    }

    return {
      tipo:"FALHA_PRIMEIRA",
      titulo:"POR QUE ESCOLHEMOS ESSA JOGADA?",
      texto,
      detalhes,
      resultadoOriginal:numero,
      alternativa,
      alternativasAcertaram:acertaram.length,
      resultadoG1:null
    };
  }

  function atualizarDiagnosticoG1(numero,snap) {
    const anterior = estado.diagnostico;

    if (
      !anterior ||
      anterior.tipo!=="FALHA_PRIMEIRA"
    ) {
      return;
    }

    const resultado = classificar(
      numero,
      jogadaSnapshot(snap)
    );

    estado.diagnostico = {
      ...anterior,
      resultadoG1:numero,
      greenG1:resultado.green,
      titulo:
        resultado.green
          ? "PRIMEIRA FALHOU • G1 ACERTOU"
          : "PRIMEIRA E G1 FALHARAM",
      texto:
        anterior.texto+
        " No G1, o resultado foi "+numero+
        (resultado.green
          ? ", dentro da cobertura original."
          : ", novamente fora da cobertura original."),
      detalhes:[
        ...anterior.detalhes,
        "Resultado G1: "+numero,
        "G1: "+(resultado.green?"ACERTO":"ERRO")
      ]
    };
  }

  /*
   ENTRADAS
  */

  function adicionarNumero(numero) {
    if (
      !Number.isInteger(numero) ||
      numero<0 ||
      numero>36
    ) {
      return;
    }

    const historicoAnterior =
      estado.historico.slice();

    const dados = obterConfigs();

    prepararPendentes(dados);

    const ativa = configAtiva(dados);

    /*
      Guardamos as alternativas
      ANTES de inserir o resultado.
    */

    const rankingAnterior =
      dados.ranking.slice();

    const snapAtiva = snapshot(ativa);

    avaliarPendentes(numero);

    if (estado.visualFreeze) {
      const snap = estado.visualFreeze;

      const resultado = classificar(
        numero,
        jogadaSnapshot(snap)
      );

      const ultimo =
        estado.visual[estado.visual.length-1];

      if (ultimo) {
        ultimo.g1 = numero;
        ultimo.green = resultado.green;
        ultimo.fase =
          resultado.green?"G1":"LOSS";
      }

      atualizarDiagnosticoG1(numero,snap);

      estado.visualFreeze = null;

    } else {
      const resultado = snapAtiva
        ? classificar(
            numero,
            jogadaSnapshot(snapAtiva)
          )
        : null;

      estado.visual.push({
        resultado:numero,
        g1:null,
        green:resultado?.green?true:null,
        semJogada:!snapAtiva,
        fase:
          !snapAtiva
            ? "SEM"
            : resultado.green
              ? "ENTRADA"
              : "ESPERA_G1"
      });

      estado.diagnostico =
        diagnosticarEscolha(
          numero,
          snapAtiva,
          rankingAnterior,
          historicoAnterior
        );

      if (resultado && !resultado.green) {
        estado.visualFreeze = snapAtiva;
      }
    }

    estado.ultimoNumero = numero;

    estado.historico.push(numero);
    estado.historico =
      estado.historico.slice(-MAX_HISTORICO);

    estado.visual =
      estado.visual.slice(-MAX_VISUAL);

    invalidarCache();
    salvar();
    agendarRender();
  }

  function reiniciarApontamentos() {
    const novo = criarEstado();

    estado.timelines = novo.timelines;
    estado.pendentes = novo.pendentes;
    estado.freezes = novo.freezes;
    estado.visual = [];
    estado.visualFreeze = null;
    estado.diagnostico = null;
    estado.ultimoNumero = null;

    invalidarCache();
  }

  function inserirHistorico() {
    const campo = el("entradaHistorico");

    const encontrados =
      campo.value.match(
        /(?:^|[^0-9])(?:[0-9]|[12][0-9]|3[0-6])(?=$|[^0-9])/g
      );

    if (!encontrados) return;

    const numeros = encontrados
      .map(x=>Number(x.trim()))
      .filter(n =>
        Number.isInteger(n) &&
        n>=0 &&
        n<=36
      );

    if (!numeros.length) return;

    estado.historico =
      limitarHistorico(numeros);

    reiniciarApontamentos();

    campo.value = "";
    salvar();
    agendarRender();
  }

  function apagarUltimo() {
    if (!estado.historico.length) return;

    estado.historico.pop();
    reiniciarApontamentos();

    salvar();
    agendarRender();
  }

  function apagarTudo() {
    if (!confirm("Apagar todo o histórico?")) {
      return;
    }

    estado.historico = [];
    reiniciarApontamentos();

    salvar();
    agendarRender();
  }

  function selecionar(motor,rx) {
    if (motor==="AUTO") {
      estado.modo = "AUTO";
    } else {
      estado.modo = "MANUAL";
      estado.motorManual = motor;
      estado.manualRX = rx;
    }

    salvar();
    agendarRender();
  }

  function selecionarPosicao(p) {
    if (![1,2,3,4].includes(p)) return;

    estado.autoPosicao = p;
    estado.modo = "AUTO";

    /*
      Se AUTO está aguardando G1,
      a cobertura congelada não muda.
    */

    if (!estado.freezes.AUTO) {
      estado.pendentes.AUTO = null;
    }

    invalidarCache();
    salvar();
    agendarRender();
  }

  /*
   INTERFACE
  */

  document.body.innerHTML = "";

  document.body.style.cssText = `
    margin:0;
    background:#101014;
    color:#fff;
    font-family:Arial,sans-serif;
  `;

  const app = document.createElement("div");

  app.innerHTML = `
<style>
*{box-sizing:border-box}

body{
  background:#101014;
  color:#fff;
}

.app{
  max-width:950px;
  margin:auto;
  padding:8px;
}

h2{
  text-align:center;
  font-size:20px;
  margin:8px 0;
}

.painel{
  background:#1b1c23;
  border:1px solid #363843;
  border-radius:11px;
  padding:10px;
  margin-bottom:9px;
}

.titulo{
  font-size:10px;
  font-weight:900;
  color:#aeb5c5;
  margin-bottom:8px;
}

textarea{
  width:100%;
  height:60px;
  background:#101116;
  color:#fff;
  border:1px solid #515666;
  border-radius:7px;
  padding:9px;
  resize:vertical;
}

button{
  font-family:Arial,sans-serif;
  font-weight:900;
  cursor:pointer;
  touch-action:manipulation;
}

.botoes,.modos{
  display:flex;
  flex-wrap:wrap;
  gap:5px;
  margin-top:7px;
}

.btn{
  background:#333846;
  color:white;
  border:1px solid #555e70;
  border-radius:7px;
  padding:9px 11px;
  font-size:10px;
}

.btn.verde{background:#17643b}
.btn.red{background:#782a35}

.cabecalhoRecolher{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  background:#232632;
  border:1px solid #414756;
  border-radius:8px;
  padding:10px;
  color:#fff;
  text-align:left;
}

.cabecalhoRecolher strong{
  font-size:11px;
}

.seta{
  color:#00d9ff;
  font-size:15px;
}

.conteudoRecolher{
  margin-top:8px;
}

.oculto{
  display:none!important;
}

.autoCompacto{
  display:flex;
  align-items:center;
  gap:8px;
  padding:8px;
  background:#111820;
  border:1px solid #007d98;
  border-radius:8px;
  margin-top:7px;
}

.autoQuadrado{
  min-width:53px;
  height:42px;
  background:#007d98;
  border:1px solid #00e5ff;
  border-radius:8px;
  color:white;
  font-size:12px;
}

.autoDescricao{
  flex:1;
  min-width:0;
  font-size:10px;
  font-weight:900;
  color:#00e5ff;
  line-height:1.5;
}

.seletorGrupo{
  margin-top:11px;
}

.seletorTitulo{
  font-size:9px;
  color:#aeb5c5;
  font-weight:900;
}

.modo{
  background:#262936;
  color:#c3c7d0;
  border:1px solid #555c6b;
  border-radius:7px;
  padding:9px 12px;
  font-size:11px;
}

.modo.ativo{
  background:#007d98;
  color:white;
  border-color:#00e5ff;
}

.modo.dinamico.ativo{
  background:#6c4d00;
  border-color:#ffc107;
}

.modo.raiox.ativo{
  background:#4b236b;
  border-color:#d27cff;
}

.modo.raiox.dinamico.ativo{
  background:#7a3d00;
  border-color:#ff9800;
}

.posicaoAuto{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:5px;
  margin-top:8px;
}

.posicaoBtn{
  min-height:42px;
  background:#292d39;
  border:1px solid #535b6c;
  color:#cbd3df;
  border-radius:8px;
  font-size:14px;
}

.posicaoBtn.ativo{
  background:#007d98;
  border:2px solid #00e5ff;
  color:white;
}

.posicaoInfo{
  font-size:9px;
  color:#aeb5c5;
  margin-top:7px;
  line-height:1.5;
}

.rankingLista{
  display:grid;
  gap:5px;
  margin-top:10px;
}

.rankingItem{
  display:grid;
  grid-template-columns:32px minmax(0,1fr) auto;
  gap:7px;
  align-items:center;
  padding:8px;
  background:#11151d;
  border:1px solid #343c4b;
  border-radius:7px;
  font-size:10px;
}

.rankingItem.selecionado{
  border-color:#00e5ff;
  background:#10313d;
}

.rankingPos{
  font-size:13px;
  font-weight:900;
  color:#ffd54f;
}

.rankingScore{
  color:#00e5ff;
  font-weight:900;
  font-variant-numeric:tabular-nums;
}

.resumo{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:5px;
  margin-top:10px;
}

.card{
  background:#101116;
  border:1px solid #333947;
  border-radius:7px;
  padding:9px 5px;
  text-align:center;
}

.card small{
  display:block;
  font-size:8px;
  color:#a4aab7;
}

.card strong{
  display:block;
  font-size:18px;
  margin-top:4px;
}

.duziasLinha{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:5px;
}

.duziaCard{
  background:#101116;
  border:1px solid #414653;
  border-radius:7px;
  padding:8px;
  text-align:center;
}

.duziaCard.forte{
  border-color:#00e676;
}

.duziaCard small{
  display:block;
  font-size:8px;
  color:#aeb5c5;
}

.duziaCard strong{
  display:block;
  font-size:17px;
  margin:5px 0;
}

.duziaCard span{
  font-size:8px;
  color:#aeb5c5;
}

.timelineSecao{
  margin-top:10px;
  padding-top:8px;
  border-top:1px solid #363843;
}

.timelineTituloGrupo{
  font-size:9px;
  font-weight:900;
  color:#aeb5c5;
}

.timelineRow{
  display:grid;
  grid-template-columns:70px minmax(0,1fr) 38px;
  gap:5px;
  align-items:center;
  margin-top:6px;
}

.timeline{
  display:flex;
  gap:2px;
  justify-content:flex-end;
  overflow:hidden;
}

.gl{
  width:17px;
  min-width:17px;
  height:18px;
  border-radius:4px;
  font-size:8px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:900;
}

.gl.green{background:#00994d}
.gl.loss{background:#c62828}
.gl.g1{
  background:#ffc107;
  color:#111;
}
.gl.wait{
  background:#4a3510;
  color:#ffc107;
}
.gl.sem{
  background:#333;
  color:#999;
}

.nomeTL,.taxaTL{
  font-size:9px;
  font-weight:900;
}

.taxaTL{text-align:right}

.duplas14{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  gap:5px;
}

.dupla14{
  min-height:63px;
  border-radius:7px;
  background:#272a34;
  border:2px solid #555;
  display:flex;
  justify-content:center;
  position:relative;
  padding:6px 3px 25px;
}

.dupla14.green{border-color:#00b85c}
.dupla14.loss{border-color:#d93a3a}
.dupla14.g1{border-color:#ffc107}
.dupla14.wait{border-color:#8a6b00}

.bolaDupla{
  width:30px;
  height:30px;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
  font-weight:900;
  border:2px solid #aaa;
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
  white-space:nowrap;
}

.resultadoEntrada.green{background:#00994d}
.resultadoEntrada.loss{background:#c62828}
.resultadoEntrada.g1{
  background:#ffc107;
  color:#111;
}
.resultadoEntrada.wait{color:#ffc107}

.jogadaStatus{
  display:block;
  font-size:10px;
  font-weight:900;
  color:#00e5ff;
  margin-bottom:9px;
  line-height:1.5;
}

.jogadaStatus.congelada{
  color:#ffc107;
}

.jogadaHorizontal{
  display:grid;
  grid-template-columns:repeat(6,minmax(0,1fr));
  gap:5px;
  width:100%;
}

.alvoQuadrado{
  aspect-ratio:1/1;
  min-height:42px;
  background:#006ca6;
  border:2px solid #00cfff;
  border-radius:9px;
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:clamp(16px,4vw,27px);
  font-weight:900;
}

.alvoQuadrado.um{
  background:#b78300;
  border-color:#ffd54f;
  color:#111;
}

.alvoQuadrado.congelado{
  box-shadow:0 0 0 1px #ffc107 inset;
}

.legendaJogada{
  display:flex;
  gap:13px;
  align-items:center;
  margin-top:9px;
  flex-wrap:wrap;
  font-size:9px;
  color:#aeb5c5;
}

.legendaCor{
  display:inline-block;
  width:11px;
  height:11px;
  border-radius:3px;
  margin-right:4px;
  vertical-align:middle;
}

.legendaCor.azul{background:#0089cf}
.legendaCor.amarelo{background:#ffc107}

.teclado{
  display:grid;
  grid-template-columns:repeat(6,1fr);
  gap:5px;
}

.numero{
  height:43px;
  border:1px solid #666;
  border-radius:6px;
  color:white;
  font-size:13px;
}

.zero{grid-column:span 6}

.virtualCabecalho{
  display:flex;
  align-items:center;
  gap:9px;
}

.virtualAvatar{
  width:39px;
  height:39px;
  background:#133e50;
  border:1px solid #00d9ff;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:22px;
}

.virtualTitulo{
  font-size:13px;
  font-weight:900;
  color:#00d9ff;
}

.virtualSubtitulo{
  font-size:9px;
  color:#aeb5c5;
  margin-top:3px;
}

.virtualStatus{
  padding:9px;
  border-radius:8px;
  font-size:11px;
  font-weight:900;
  margin-top:10px;
  line-height:1.5;
}

.virtualStatus.green{
  background:#123b2b;
  color:#00e676;
  border:1px solid #008e52;
}

.virtualStatus.loss{
  background:#451d25;
  color:#ff6c78;
  border:1px solid #a33142;
}

.virtualStatus.wait{
  background:#373015;
  color:#ffd54f;
  border:1px solid #977c20;
}

.virtualTexto{
  background:#11141b;
  border:1px solid #363b48;
  border-radius:8px;
  padding:11px;
  margin-top:8px;
  font-size:12px;
  line-height:1.6;
  color:#e4e8f0;
}

.virtualDetalhes{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:5px;
  margin-top:9px;
}

.virtualDetalhe{
  background:#12151d;
  border:1px solid #333b4a;
  border-radius:6px;
  padding:8px;
  font-size:10px;
  line-height:1.5;
  color:#c5cedc;
}

.status{
  font-size:10px;
  font-weight:900;
  color:#00e676;
  margin-top:8px;
  line-height:1.6;
}

@media(max-width:600px){
  .resumo{
    grid-template-columns:repeat(2,1fr);
  }

  .duplas14{
    grid-template-columns:repeat(4,1fr);
  }

  .timelineRow{
    grid-template-columns:63px minmax(0,1fr) 34px;
  }

  .gl{
    width:15px;
    min-width:15px;
    height:17px;
    font-size:7px;
  }

  .alvoQuadrado{
    min-height:40px;
    border-radius:6px;
  }

  .jogadaHorizontal{gap:4px}

  .virtualDetalhes{
    grid-template-columns:1fr;
  }
}
</style>

<div class="app">

  <h2>ANÁLISE BETA V3.4</h2>

  <div class="painel">

    <textarea
      id="entradaHistorico"
      placeholder="Cole o histórico — últimos 20 números"
    ></textarea>

    <div class="botoes">
      <button id="inserir" class="btn verde">
        INSERIR
      </button>

      <button id="apagar" class="btn">
        APAGAR ÚLTIMO
      </button>

      <button id="limpar" class="btn red">
        APAGAR TUDO
      </button>
    </div>

    <div id="status" class="status">
      PRONTO
    </div>

  </div>

  <div class="painel">

    <button
      id="recolherCandidatos"
      class="cabecalhoRecolher"
    >
      <strong>AUTO • 12 CANDIDATOS</strong>
      <span id="setaCandidatos" class="seta">+</span>
    </button>

    <div class="autoCompacto">

      <button id="btnAUTO" class="autoQuadrado">
        AUTO
      </button>

      <div id="autoDescricao" class="autoDescricao">
        AGUARDANDO
      </div>

    </div>

    <div class="seletorGrupo">

      <div class="seletorTitulo">
        ESCOLHA A POSIÇÃO DO AUTO
      </div>

      <div class="posicaoAuto">
        <button id="autoP1" class="posicaoBtn">1º</button>
        <button id="autoP2" class="posicaoBtn">2º</button>
        <button id="autoP3" class="posicaoBtn">3º</button>
        <button id="autoP4" class="posicaoBtn">4º</button>
      </div>

      <div class="posicaoInfo">
        PADRÃO: 3º COLOCADO • RANKING POR PONTUAÇÃO DECRESCENTE
      </div>

    </div>

    <div id="conteudoCandidatos" class="conteudoRecolher oculto">

      ${[
        ["NORMAL","NORMAL • DÚZIAS FÍSICAS","N",""],
        ["DINAMICO","DINÂMICO • DÚZIAS FÍSICAS","D","dinamico"],
        ["RX_NORMAL","RAIO-X NORMAL","RN","raiox"],
        ["RX_DINAMICO","RAIO-X DINÂMICO","RD","raiox dinamico"]
      ].map(([motor,nome,prefixo,classe])=>`
        <div class="seletorGrupo">

          <div class="seletorTitulo">
            ${nome}
          </div>

          <div class="modos">
            ${RX_LIST.map(rx=>`
              <button
                id="btn${prefixo}${rx}"
                class="modo ${classe}"
              >
                ${prefixo.startsWith("R")?"RX ":""}C${rx}
              </button>
            `).join("")}
          </div>

        </div>
      `).join("")}

      <div class="timelineSecao">

        <div class="timelineTituloGrupo">
          RANKING COMPLETO • 12 MOTORES
        </div>

        <div id="rankingLista" class="rankingLista"></div>

      </div>

      <div id="resumo" class="resumo"></div>

      <div class="timelineSecao">

        <div class="timelineTituloGrupo">
          CONCENTRAÇÃO FÍSICA DAS DÚZIAS
        </div>

        <div id="duzias" class="duziasLinha"></div>

      </div>

    </div>

  </div>

  <div class="painel">

    <button
      id="recolherTimelines"
      class="cabecalhoRecolher"
    >
      <strong>LINHAS DO TEMPO</strong>
      <span id="setaTimelines" class="seta">+</span>
    </button>

    <div class="timelineSecao">

      <div class="timelineTituloGrupo">
        AUTO
      </div>

      <div id="timelineAUTO" class="timelineRow"></div>

    </div>

    <div id="conteudoTimelines" class="oculto">

      ${[
        ["NORMAL","N"],
        ["DINÂMICO","D"],
        ["RAIO-X NORMAL","RN"],
        ["RAIO-X DINÂMICO","RD"]
      ].map(([nome,prefixo])=>`
        <div class="timelineSecao">

          <div class="timelineTituloGrupo">
            ${nome}
          </div>

          ${RX_LIST.map(rx=>`
            <div
              id="timeline${prefixo}${rx}"
              class="timelineRow"
            ></div>
          `).join("")}

        </div>
      `).join("")}

    </div>

  </div>

  <div class="painel">

    <div class="titulo">
      ÚLTIMAS 14 JOGADAS
    </div>

    <div id="ultimos14" class="duplas14"></div>

  </div>

  <div class="painel">

    <div class="titulo">
      JOGADA ATUAL
    </div>

    <div id="jogada"></div>

  </div>

  <div class="painel">

    <div class="titulo">
      TECLADO
    </div>

    <div id="teclado" class="teclado"></div>

  </div>

  <div class="painel">

    <button
      id="recolherVirtual"
      class="cabecalhoRecolher"
    >

      <div class="virtualCabecalho">

        <div class="virtualAvatar">🤖</div>

        <div>
          <div class="virtualTitulo">
            JOGADOR VIRTUAL
          </div>

          <div class="virtualSubtitulo">
            AUDITORIA DA ESCOLHA E DAS ALTERNATIVAS
          </div>
        </div>

      </div>

      <span id="setaVirtual" class="seta">−</span>

    </button>

    <div id="conteudoVirtual">

      <div id="virtualStatus" class="virtualStatus wait">
        AGUARDANDO RESULTADO
      </div>

      <div id="virtualTexto" class="virtualTexto">
        Insira um número para comparar a escolha com as alternativas.
      </div>

      <div id="virtualDetalhes" class="virtualDetalhes"></div>

    </div>

  </div>

</div>
`;

  document.body.appendChild(app);

  /*
   EVENTOS
  */

  el("inserir").onclick = inserirHistorico;
  el("apagar").onclick = apagarUltimo;
  el("limpar").onclick = apagarTudo;

  el("btnAUTO").onclick = () => selecionar("AUTO");

  for (let p=1;p<=4;p++) {
    el("autoP"+p).onclick = () =>
      selecionarPosicao(p);
  }

  for (const motor of MOTORES) {
    for (const rx of RX_LIST) {
      el("btn"+PREFIXOS[motor]+rx).onclick =
        () => selecionar(motor,rx);
    }
  }

  el("recolherCandidatos").onclick = () => {
    estado.painelCandidatosAberto =
      !estado.painelCandidatosAberto;

    salvar();
    renderPaineis();
  };

  el("recolherTimelines").onclick = () => {
    estado.painelTimelinesAberto =
      !estado.painelTimelinesAberto;

    salvar();
    renderPaineis();
  };

  el("recolherVirtual").onclick = () => {
    estado.jogadorVirtualAberto =
      !estado.jogadorVirtualAberto;

    salvar();
    renderPaineis();
  };

  /*
   TECLADO
  */

  const teclado = el("teclado");

  for (let numero=1;numero<=36;numero++) {
    const botao = document.createElement("button");

    botao.className = "numero";
    botao.textContent = numero;
    botao.style.background = corNumero(numero);

    botao.onclick = () => adicionarNumero(numero);

    teclado.appendChild(botao);
  }

  const zero = document.createElement("button");

  zero.className = "numero zero";
  zero.textContent = "0";
  zero.style.background = corNumero(0);
  zero.onclick = () => adicionarNumero(0);

  teclado.appendChild(zero);

  /*
   PAINÉIS
  */

  function renderPaineis() {
    el("conteudoCandidatos").classList.toggle(
      "oculto",
      !estado.painelCandidatosAberto
    );

    el("conteudoTimelines").classList.toggle(
      "oculto",
      !estado.painelTimelinesAberto
    );

    el("conteudoVirtual").classList.toggle(
      "oculto",
      !estado.jogadorVirtualAberto
    );

    el("setaCandidatos").textContent =
      estado.painelCandidatosAberto?"−":"+";

    el("setaTimelines").textContent =
      estado.painelTimelinesAberto?"−":"+";

    el("setaVirtual").textContent =
      estado.jogadorVirtualAberto?"−":"+";
  }

  /*
   TIMELINES
  */

  function renderTimeline(id,nome,lista) {
    const itens =
      (lista||[]).slice(-MAX_TIMELINE);

    const validos = itens.filter(item =>
      !item.semJogada &&
      !item.aguardandoG1 &&
      typeof item.green==="boolean"
    );

    const taxa = validos.length
      ? validos.filter(x=>x.green).length /
        validos.length*100
      : null;

    const html = itens.map(item => {
      if (item.semJogada) {
        return '<span class="gl sem">—</span>';
      }

      if (item.aguardandoG1) {
        return '<span class="gl wait">…</span>';
      }

      if (item.green && item.fase==="G1") {
        return '<span class="gl g1">G1</span>';
      }

      if (item.green) {
        return '<span class="gl green">G</span>';
      }

      return '<span class="gl loss">L</span>';
    }).join("");

    el(id).innerHTML = `
      <div class="nomeTL">${nome}</div>
      <div class="timeline">${html}</div>
      <div class="taxaTL">
        ${taxa===null?"—":taxa.toFixed(0)+"%"}
      </div>
    `;
  }

  /*
   JOGADA ATUAL
  */

  function renderJogada(config,congelada) {
    const area = el("jogada");

    if (!config?.valido || !config.jogada?.valido) {
      area.innerHTML = `
        <div class="jogadaStatus">
          AGUARDANDO JOGADA VÁLIDA
        </div>
      `;
      return;
    }

    const blocos = [
      ...config.jogada.blocos2.map(b=>({
        ...b,um:false
      })),
      ...config.jogada.blocos1.map(b=>({
        ...b,um:true
      }))
    ];

    blocos.sort((a,b) => {
      const regA =
        ORDEM_REGIOES.indexOf(regiao(a.centro));

      const regB =
        ORDEM_REGIOES.indexOf(regiao(b.centro));

      return regA-regB ||
        pos(a.centro)-pos(b.centro);
    });

    const status =
      congelada
        ? "G1 • JOGADA CONGELADA"
        : "JOGADA ATUAL";

    const posicao =
      config.posicaoRanking
        ? " • "+config.posicaoRanking+"º RANKING"
        : "";

    area.innerHTML = `
      <div class="jogadaStatus ${congelada?"congelada":""}">
        ${status}
        • ${NOMES[config.motor]}
        • C${config.rx}
        • ${alvoRX(config.rx)}ª DÚZIA
        ${posicao}
      </div>

      <div class="jogadaHorizontal">
        ${blocos.map(bloco=>`
          <div
            class="alvoQuadrado
              ${bloco.um?"um":""}
              ${congelada?"congelado":""}"
            title="${bloco.um?"1 vizinho":"2 vizinhos"}"
          >
            ${bloco.centro}
          </div>
        `).join("")}
      </div>

      <div class="legendaJogada">
        <span>
          <span class="legendaCor azul"></span>
          2 VIZINHOS
        </span>

        <span>
          <span class="legendaCor amarelo"></span>
          1 VIZINHO
        </span>

        <span>28 NÚMEROS COBERTOS</span>
      </div>
    `;
  }

  /*
   ÚLTIMAS 14
  */

  function renderUltimos() {
    el("ultimos14").innerHTML =
      estado.visual
        .slice(-MAX_VISUAL)
        .map(item=>{
          const classe =
            item.semJogada
              ? "sem"
              : item.fase==="ESPERA_G1"
                ? "wait"
                : item.fase==="G1"
                  ? "g1"
                  : item.green
                    ? "green"
                    : "loss";

          const textos = {
            sem:"—",
            wait:"…",
            g1:"G1",
            green:"G",
            loss:"L"
          };

          return `
            <div class="dupla14 ${classe}">
              <div
                class="bolaDupla"
                style="background:${corNumero(item.resultado)}"
              >
                ${item.resultado}
              </div>

              <div class="resultadoEntrada ${classe}">
                ${textos[classe]}
                ${item.g1==null?"":" • "+item.g1}
              </div>
            </div>
          `;
        }).join("");
  }

  /*
   JOGADOR VIRTUAL
  */

  function renderVirtual() {
    const d = estado.diagnostico;

    const status = el("virtualStatus");
    const texto = el("virtualTexto");
    const detalhes = el("virtualDetalhes");

    if (!d) {
      status.className = "virtualStatus wait";
      status.textContent = "AGUARDANDO RESULTADO";

      texto.textContent =
        "O próximo resultado será comparado " +
        "com a escolha e o ranking anteriores.";

      detalhes.innerHTML = "";
      return;
    }

    const acertou =
      d.tipo==="ACERTO" ||
      d.greenG1===true;

    const aguardando =
      d.tipo==="SEM_JOGADA";

    status.className =
      "virtualStatus "+
      (
        aguardando
          ? "wait"
          : acertou
            ? "green"
            : "loss"
      );

    status.textContent = d.titulo;
    texto.textContent = d.texto;

    detalhes.innerHTML = "";

    for (const item of d.detalhes||[]) {
      const div = document.createElement("div");

      div.className = "virtualDetalhe";
      div.textContent = item;

      detalhes.appendChild(div);
    }
  }

  /*
   RENDER
  */

  let renderPendente = false;

  function agendarRender() {
    if (renderPendente) return;

    renderPendente = true;

    setTimeout(()=>{
      renderPendente = false;
      render();
    },0);
  }

  function render() {
    const dados = obterConfigs();

    prepararPendentes(dados);

    const ativa = configAtiva(dados);

    /*
      BOTÕES DOS MOTORES
    */

    for (const motor of MOTORES) {
      for (const rx of RX_LIST) {
        const botao =
          el("btn"+PREFIXOS[motor]+rx);

        botao.classList.toggle(
          "ativo",
          estado.modo==="MANUAL" &&
          estado.motorManual===motor &&
          estado.manualRX===rx
        );
      }
    }

    el("btnAUTO").style.background =
      estado.modo==="AUTO"
        ? "#007d98"
        : "#303744";

    el("btnAUTO").style.borderColor =
      estado.modo==="AUTO"
        ? "#00e5ff"
        : "#555c6b";

    /*
      SELETOR DE POSIÇÃO
    */

    for (let p=1;p<=4;p++) {
      el("autoP"+p).classList.toggle(
        "ativo",
        estado.autoPosicao===p
      );
    }

    /*
      AUTO COMPACTO
    */

    el("autoDescricao").textContent =
      dados.auto
        ? (
            estado.autoPosicao+
            "º DO RANKING • "+
            NOMES[dados.auto.motor]+
            " C"+dados.auto.rx+
            " • SCORE "+
            formatar(dados.auto.scoreAuto)
          )
        : "AGUARDANDO JOGADAS VÁLIDAS";

    /*
      RANKING COMPLETO
    */

    el("rankingLista").innerHTML =
      dados.ranking.length
        ? dados.ranking.map((config,i)=>`
            <div class="rankingItem ${
              i===estado.autoPosicao-1
                ? "selecionado"
                : ""
            }">
              <div class="rankingPos">
                ${i+1}º
              </div>

              <div>
                ${NOMES[config.motor]} C${config.rx}
                ${i===estado.autoPosicao-1
                  ? " • AUTO"
                  : ""}
              </div>

              <div class="rankingScore">
                ${formatar(config.scoreAuto)}
              </div>
            </div>
          `).join("")
        : `
          <div class="posicaoInfo">
            AGUARDANDO HISTÓRICO SUFICIENTE
          </div>
        `;

    /*
      RESUMO
    */

    const live =
      estatisticas(estado.timelines.AUTO);

    el("resumo").innerHTML = [
      ["REAL 5",live.total?live.taxa5:null],
      ["REAL 10",live.total?live.taxa10:null],
      ["REAL 20",live.total?live.taxa20:null],
      ["PERDAS",live.perdas]
    ].map(([nome,valor])=>`
      <div class="card">
        <small>${nome}</small>
        <strong>
          ${
            valor===null
              ? "—"
              : nome==="PERDAS"
                ? valor
                : valor.toFixed(0)+"%"
          }
        </strong>
      </div>
    `).join("");

    /*
      DÚZIAS
    */

    el("duzias").innerHTML =
      dados.analise.ranking.map((item,i)=>`
        <div class="duziaCard ${i===0?"forte":""}">
          <small>${item.duzia}ª DÚZIA</small>
          <strong>
            ${(item.intensidade*100).toFixed(0)}%
          </strong>
          <span>
            ${item.contagem}/${estado.historico.length}
            • QUEBRA ${item.quebra.toFixed(1)}
          </span>
        </div>
      `).join("");

    /*
      AUTO + TODAS AS 12 TIMELINES

      As 12 linhas são renderizadas
      independentemente de o painel
      estar aberto ou fechado.
    */

    renderTimeline(
      "timelineAUTO",
      "AUTO",
      estado.timelines.AUTO
    );

    for (const motor of MOTORES) {
      for (const rx of RX_LIST) {
        renderTimeline(
          "timeline"+PREFIXOS[motor]+rx,
          motor.startsWith("RX")
            ? "RX C"+rx
            : "C"+rx,
          estado.timelines[motor][rx]
        );
      }
    }

    /*
      JOGADA EXIBIDA
    */

    const freeze =
      estado.modo==="AUTO"
        ? estado.freezes.AUTO
        : estado.freezes[
            estado.motorManual
          ][estado.manualRX];

    let configExibida = ativa;

    if (freeze) {
      configExibida = {
        valido:true,
        motor:freeze.motor,
        rx:freeze.rx,
        posicaoRanking:freeze.posicaoRanking,
        jogada:jogadaSnapshot(freeze)
      };
    }

    renderJogada(configExibida,!!freeze);

    renderUltimos();
    renderVirtual();

    /*
      STATUS
    */

    const validos = dados.ranking.length;

    const diferentes = new Set(
      dados.ranking.map(c=>c.assinatura)
    ).size;

    const dominante =
      dados.analise.ranking[0];

    el("status").textContent =
      estado.historico.length+"/20"+
      " • 12 MOTORES"+
      " • "+validos+"/12 VÁLIDOS"+
      " • "+diferentes+" CONFIGURAÇÕES"+
      " • AUTO "+estado.autoPosicao+"º SCORE"+
      " • 28 NÚMEROS"+
      " • SEM SOBREPOSIÇÃO"+
      " • CONCENTRAÇÃO "+
      dominante.duzia+"ª DÚZIA"+
      (freeze?" • G1 CONGELADO":"");

    renderPaineis();
    salvar();
  }

  /*
   INICIALIZAÇÃO
  */

  agendarRender();

})();
