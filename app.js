(function () {
  "use strict";

  /*
   * ANÁLISE BETA
   * 12 MOTORES — DÚZIAS, VIZINHOS E RAIO X
   *
   * CORREÇÕES:
   * - Renderização sem busca combinatória pesada.
   * - Cálculo das jogadas com cache.
   * - Sem recalcular backtest a cada clique.
   * - Zonas de quebra incluídas.
   * - Número 11 incluído na análise física.
   * - Cinco setores de 5 números.
   * - Um setor de 3 números.
   * - Total de 28 números sem sobreposição.
   * - Sem buracos isolados na roda.
   * - AUTO entre os 12 motores.
   * - G1 individual por estratégia.
   */

  const STORAGE = "ANALISE_BETA_DUZIAS_RX_12_V2";
  const MAX_HISTORICO = 20;

  const TRACK = [
    32, 15, 19, 4, 21, 2, 25, 17, 34, 6,
    27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
    16, 33, 1, 20, 14, 31, 9, 22, 18, 29,
    7, 28, 12, 35, 3, 26, 0
  ];

  const VERMELHOS = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18,
    19, 21, 23, 25, 27, 30, 32, 34, 36
  ]);

  const MOTORES = [
    "NORMAL",
    "DINAMICO",
    "RX_NORMAL",
    "RX_DINAMICO"
  ];

  const RX_LIST = [4, 5, 6];

  const ZONAS = {
    1: [13, 14, 15, 16, 17, 18],
    2: [0, 26, 3, 35, 28, 7, 6, 30],
    3: [23, 10, 24, 20, 22, 21, 4, 19]
  };

  const GRUPOS = {
    1: [
      [3, 12, 7],
      [4, 2, 21],
      [11, 8, 5],
      [6, 1, 9]
    ],
    2: [
      [13, 36, 11, 30, 8],
      [23, 10, 5, 24, 16],
      [15, 19, 17, 14, 20, 18]
    ],
    3: [
      [25, 17, 34, 6, 27],
      [32, 15, 19, 4, 21],
      [29, 7, 28, 12, 35, 3, 26],
      [31, 9, 22, 18, 33]
    ]
  };

  const REGIOES = {
    ZERO: new Set([0, 32, 15, 26, 3, 35, 12]),
    VOISINS: new Set([
      19, 4, 21, 2, 25, 28, 7, 29, 18, 22
    ]),
    ORPHELINS: new Set([
      9, 31, 14, 20, 1, 17, 6, 34
    ]),
    TIERS: new Set([
      27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33
    ])
  };

  const INDICE = new Map(
    TRACK.map((numero, i) => [numero, i])
  );

  const mod = (n, m) => ((n % m) + m) % m;

  const pos = n => INDICE.get(n) ?? -1;

  function distancia(a, b) {
    const d = Math.abs(pos(a) - pos(b));
    return Math.min(d, 37 - d);
  }

  function delta(a, b) {
    let d = mod(pos(b) - pos(a), 37);
    return d > 18 ? d - 37 : d;
  }

  function vizinhos(numero, quantidade) {
    const i = pos(numero);

    if (i < 0) return [];

    const resultado = [];

    for (let d = -quantidade; d <= quantidade; d++) {
      resultado.push(TRACK[mod(i + d, 37)]);
    }

    return resultado;
  }

  function duzia(numero) {
    if (numero === 0) return 0;
    if (numero <= 12) return 1;
    if (numero <= 24) return 2;
    return 3;
  }

  function alvoRX(rx) {
    return rx - 3;
  }

  function cor(numero) {
    if (numero === 0) return "#087c48";

    return VERMELHOS.has(numero)
      ? "#c6283d"
      : "#181818";
  }

  function regiao(numero) {
    for (const [nome, numeros] of Object.entries(REGIOES)) {
      if (numeros.has(numero)) return nome;
    }

    return "OUTROS";
  }

  function normalizarHistorico(lista) {
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

  function estrutura(valor) {
    return {
      AUTO: valor,
      NORMAL: { 4: valor, 5: valor, 6: valor },
      DINAMICO: { 4: valor, 5: valor, 6: valor },
      RX_NORMAL: { 4: valor, 5: valor, 6: valor },
      RX_DINAMICO: { 4: valor, 5: valor, 6: valor }
    };
  }

  function criarEstado() {
    const timelines = estrutura(null);

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
      timelines,
      pendentes: estrutura(null),
      freezes: estrutura(null),
      visual: [],
      visualFreeze: null
    };
  }

  let estado = criarEstado();

  try {
    const salvo = JSON.parse(
      localStorage.getItem(STORAGE) || "null"
    );

    if (salvo) {
      estado.historico = normalizarHistorico(
        salvo.historico
      );

      if (["AUTO", "MANUAL"].includes(salvo.modo)) {
        estado.modo = salvo.modo;
      }

      if (MOTORES.includes(salvo.motorManual)) {
        estado.motorManual = salvo.motorManual;
      }

      if (RX_LIST.includes(salvo.manualRX)) {
        estado.manualRX = salvo.manualRX;
      }

      if (salvo.timelines) {
        if (Array.isArray(salvo.timelines.AUTO)) {
          estado.timelines.AUTO =
            salvo.timelines.AUTO.slice(-20);
        }

        for (const motor of MOTORES) {
          for (const rx of RX_LIST) {
            const lista = salvo.timelines[motor]?.[rx];

            if (Array.isArray(lista)) {
              estado.timelines[motor][rx] =
                lista.slice(-20);
            }
          }
        }
      }

      if (salvo.pendentes) {
        estado.pendentes.AUTO =
          salvo.pendentes.AUTO || null;

        for (const motor of MOTORES) {
          for (const rx of RX_LIST) {
            estado.pendentes[motor][rx] =
              salvo.pendentes[motor]?.[rx] || null;
          }
        }
      }

      if (salvo.freezes) {
        estado.freezes.AUTO =
          salvo.freezes.AUTO || null;

        for (const motor of MOTORES) {
          for (const rx of RX_LIST) {
            estado.freezes[motor][rx] =
              salvo.freezes[motor]?.[rx] || null;
          }
        }
      }

      estado.visual = Array.isArray(salvo.visual)
        ? salvo.visual.slice(-14)
        : [];

      estado.visualFreeze =
        salvo.visualFreeze || null;
    }
  } catch (erro) {
    console.warn("Histórico não recuperado:", erro);
  }

  function salvar() {
    estado.historico = normalizarHistorico(
      estado.historico
    );

    try {
      localStorage.setItem(
        STORAGE,
        JSON.stringify(estado)
      );
    } catch (erro) {
      console.warn("Falha ao salvar:", erro);
    }
  }

  /*
   * ANÁLISE FÍSICA
   *
   * Considera:
   * - Dúzias.
   * - Vizinhos.
   * - Zonas de quebra.
   * - Concentração física.
   * - Últimos 20 resultados.
   */

  function analisar(base) {
    base = normalizarHistorico(base);

    const calor = new Float64Array(37);

    const contagem = [0, 0, 0, 0];
    const forca = [0, 0, 0, 0];
    const quebra = [0, 0, 0, 0];

    for (let i = 0; i < base.length; i++) {
      const numero = base[i];

      const peso =
        0.45 +
        0.55 * (i + 1) / Math.max(1, base.length);

      const d = duzia(numero);

      if (d) {
        contagem[d]++;
        forca[d] += peso;
      }

      for (let z = 1; z <= 3; z++) {
        if (ZONAS[z].includes(numero)) {
          quebra[z] += peso;
        }
      }

      for (let j = 0; j < 37; j++) {
        const distanciaFisica =
          distancia(numero, TRACK[j]);

        const pesos = [
          1,
          0.78,
          0.52,
          0.29,
          0.14,
          0.06
        ];

        if (distanciaFisica <= 5) {
          calor[j] +=
            pesos[distanciaFisica] * peso;
        }
      }
    }

    const info = {};

    for (let z = 1; z <= 3; z++) {
      const numeros = [
        ...new Set(GRUPOS[z].flat())
      ];

      const fisica =
        numeros.reduce(
          (soma, numero) =>
            soma + calor[pos(numero)],
          0
        ) / numeros.length;

      const score =
        forca[z] * 0.46 +
        fisica * 0.40 +
        quebra[z] * 0.14;

      info[z] = {
        duzia: z,
        contagem: contagem[z],
        fisica,
        quebra: quebra[z],
        score
      };
    }

    const maior = Math.max(
      0.00001,
      info[1].score,
      info[2].score,
      info[3].score
    );

    const ranking = [1, 2, 3]
      .map(z => ({
        ...info[z],
        intensidade: info[z].score / maior
      }))
      .sort((a, b) => b.score - a.score);

    return {
      calor,
      info,
      ranking,
      maxCalor: Math.max(0.00001, ...calor)
    };
  }

  function contagemFisica(base, rx) {
    const mapa = new Float64Array(37);

    const decay = {
      4: 0.78,
      5: 0.82,
      6: 0.86
    }[rx];

    let peso = 1;

    for (let i = base.length - 1; i >= 0; i--) {
      for (let j = 0; j < 37; j++) {
        const d = distancia(base[i], TRACK[j]);

        const pesos = [
          1,
          0.72,
          0.44,
          0.22,
          0.10
        ];

        if (d <= 4) {
          mapa[j] += pesos[d] * peso;
        }
      }

      peso *= decay;
    }

    const maior = Math.max(0.00001, ...mapa);

    return mapa.map(valor => valor / maior);
  }

  function analisarRaioX(base, rx) {
    const frequencia = new Float64Array(37);

    if (base.length < rx * 2 + 4) {
      return {
        valido: false,
        frequencia,
        similaridade: 0
      };
    }

    const atual = base.slice(-rx);
    const candidatos = [];

    for (
      let i = 0;
      i + rx < base.length - rx;
      i++
    ) {
      let score = 0;

      for (let k = 0; k < rx; k++) {
        const antigo = base[i + k];
        const recente = atual[k];

        if (duzia(antigo) === duzia(recente)) {
          score += 0.70;
        }

        score +=
          0.30 *
          Math.max(
            0,
            1 - distancia(antigo, recente) / 19
          );
      }

      candidatos.push({
        numero: base[i + rx],
        score: score / rx,
        indice: i
      });
    }

    candidatos.sort(
      (a, b) =>
        b.score - a.score ||
        b.indice - a.indice
    );

    const escolhidos = candidatos.slice(
      0,
      Math.max(
        4,
        Math.ceil(candidatos.length * 0.30)
      )
    );

    for (const item of escolhidos) {
      for (let j = 0; j < 37; j++) {
        const d = distancia(
          item.numero,
          TRACK[j]
        );

        const pesos = [
          1,
          0.70,
          0.42,
          0.18
        ];

        if (d <= 3) {
          frequencia[j] +=
            pesos[d] *
            (0.40 + 0.60 * item.score);
        }
      }
    }

    const maior = Math.max(
      0.00001,
      ...frequencia
    );

    const similaridade = escolhidos.length
      ? escolhidos.reduce(
          (soma, item) =>
            soma + item.score,
          0
        ) / escolhidos.length * 100
      : 0;

    return {
      valido: escolhidos.length > 0,
      frequencia: frequencia.map(
        valor => valor / maior
      ),
      similaridade
    };
  }

  function pontuacoes(base, motor, rx) {
    const analise = analisar(base);
    const contagem = contagemFisica(base, rx);

    const usaRaioX = motor.startsWith("RX");
    const dinamico = motor.includes("DINAMICO");

    const raioX = usaRaioX
      ? analisarRaioX(base, rx)
      : null;

    if (usaRaioX && !raioX.valido) {
      return null;
    }

    const alvoDuzia = alvoRX(rx);
    const scores = new Float64Array(37);

    for (let j = 0; j < 37; j++) {
      const numero = TRACK[j];

      const principal =
        duzia(numero) === alvoDuzia ? 1 : 0;

      let proximidade = 0;

      for (const grupo of GRUPOS[alvoDuzia]) {
        for (const alvo of grupo) {
          const d = distancia(numero, alvo);

          const peso = d <= 3
            ? [1, 0.75, 0.45, 0.20][d]
            : 0;

          proximidade = Math.max(
            proximidade,
            peso
          );
        }
      }

      const quebra = ZONAS[alvoDuzia].some(
        alvo => distancia(numero, alvo) <= 2
      ) ? 1 : 0;

      const fisica =
        analise.calor[j] / analise.maxCalor;

      let score =
        principal * 0.52 +
        proximidade * 0.48 +
        fisica * 0.24 +
        quebra * 0.22 +
        contagem[j] * 0.22;

      if (usaRaioX) {
        score =
          principal * 0.42 +
          proximidade * 0.38 +
          fisica * 0.22 +
          quebra * 0.18 +
          contagem[j] * 0.12 +
          raioX.frequencia[j] * 0.34;
      }

      if (dinamico) {
        const ultimos = base.slice(-rx);

        let direcao = 0;
        let total = 0;

        ultimos.forEach((n, i) => {
          const d = delta(numero, n);

          if (Math.abs(d) <= 7) {
            const peso =
              (i + 1) / ultimos.length;

            direcao += Math.sign(d) * peso;
            total += peso;
          }
        });

        if (total > 0) {
          score +=
            Math.abs(direcao / total) * 0.11;
        }
      }

      scores[j] = score;
    }

    return {
      scores,
      similaridade: raioX?.similaridade || 0
    };
  }

  /*
   * GEOMETRIA OTIMIZADA
   *
   * A roda possui 37 posições.
   * A jogada cobre 28.
   *
   * 5 blocos de 5 = 25
   * 1 bloco de 3 = 3
   *
   * Restam 9 posições descobertas.
   *
   * Cada intervalo descoberto precisa ter
   * tamanho zero ou pelo menos dois.
   *
   * Os modelos são preparados uma única vez.
   */

  const PADROES = [];

  function gerarPadroes(restante, atual) {
    if (atual.length === 6) {
      if (restante === 0) {
        PADROES.push(atual.slice());
      }

      return;
    }

    for (let gap = 0; gap <= restante; gap++) {
      if (gap === 1) continue;

      atual.push(gap);

      gerarPadroes(
        restante - gap,
        atual
      );

      atual.pop();
    }
  }

  gerarPadroes(9, []);

  const MODELOS = [];

  (function prepararModelos() {
    const assinaturas = new Set();

    for (let inicio = 0; inicio < 37; inicio++) {
      for (let posicao3 = 0; posicao3 < 6; posicao3++) {
        for (const gaps of PADROES) {
          let cursor = inicio;

          const blocos5 = [];
          let bloco3 = -1;

          for (let k = 0; k < 6; k++) {
            const tamanho =
              k === posicao3 ? 3 : 5;

            const centro = mod(
              cursor + Math.floor(tamanho / 2),
              37
            );

            if (k === posicao3) {
              bloco3 = centro;
            } else {
              blocos5.push(centro);
            }

            cursor = mod(
              cursor + tamanho + gaps[k],
              37
            );
          }

          const chave =
            blocos5.slice().sort(
              (a, b) => a - b
            ).join("-") +
            "|" +
            bloco3;

          if (assinaturas.has(chave)) {
            continue;
          }

          assinaturas.add(chave);

          MODELOS.push({
            blocos5,
            bloco3,
            chave
          });
        }
      }
    }
  })();

  /*
   * CÁLCULO RÁPIDO
   *
   * Sem recursão durante o clique.
   * Sem montar milhares de Sets por tentativa.
   */

  function construirJogada(
    scores,
    assinaturasUsadas,
    variacao = 0
  ) {
    const pontos5 = new Float64Array(37);
    const pontos3 = new Float64Array(37);

    for (let centro = 0; centro < 37; centro++) {
      for (let d = -2; d <= 2; d++) {
        const peso =
          d === 0 ? 1.22 :
          Math.abs(d) === 1 ? 1.08 : 1;

        pontos5[centro] +=
          scores[mod(centro + d, 37)] * peso;
      }

      for (let d = -1; d <= 1; d++) {
        pontos3[centro] +=
          scores[mod(centro + d, 37)] *
          (d === 0 ? 1.22 : 1);
      }
    }

    let melhor = null;
    let maiorScore = -Infinity;

    for (const modelo of MODELOS) {
      if (
        assinaturasUsadas &&
        assinaturasUsadas.has(modelo.chave)
      ) {
        continue;
      }

      let score = pontos3[modelo.bloco3];

      for (const centro of modelo.blocos5) {
        score += pontos5[centro];
      }

      score +=
        0.00001 *
        Math.sin(
          (variacao + 1) *
          (modelo.bloco3 + 1) *
          0.77
        );

      if (score > maiorScore) {
        maiorScore = score;
        melhor = modelo;
      }
    }

    if (!melhor) return null;

    const blocos2 = melhor.blocos5.map(i => ({
      centro: TRACK[i],
      qtd: 2,
      numeros: vizinhos(TRACK[i], 2)
    }));

    const blocos1 = [{
      centro: TRACK[melhor.bloco3],
      qtd: 1,
      numeros: vizinhos(
        TRACK[melhor.bloco3],
        1
      )
    }];

    const numeros = new Set(
      [...blocos2, ...blocos1].flatMap(
        bloco => bloco.numeros
      )
    );

    if (numeros.size !== 28) {
      return null;
    }

    for (let i = 0; i < 37; i++) {
      const numero = TRACK[i];

      if (numeros.has(numero)) continue;

      const anterior = TRACK[mod(i - 1, 37)];
      const seguinte = TRACK[mod(i + 1, 37)];

      if (
        numeros.has(anterior) &&
        numeros.has(seguinte)
      ) {
        return null;
      }
    }

    return {
      valido: true,
      blocos2,
      blocos1,
      numeros,
      score: maiorScore,
      assinatura: melhor.chave
    };
  }

  function gerarConfig(
    base,
    motor,
    rx,
    assinaturasUsadas = null,
    variacao = 0
  ) {
    const minimo = motor.startsWith("RX")
      ? Math.max(14, rx * 2 + 4)
      : Math.max(8, rx + 4);

    if (base.length < minimo) {
      return {
        valido: false,
        motor,
        rx,
        motivo: "AGUARDANDO DADOS"
      };
    }

    const info = pontuacoes(
      base,
      motor,
      rx
    );

    if (!info) {
      return {
        valido: false,
        motor,
        rx,
        motivo: "SEM RÉPLICAS"
      };
    }

    const jogada = construirJogada(
      info.scores,
      assinaturasUsadas,
      variacao
    );

    if (!jogada) {
      return {
        valido: false,
        motor,
        rx,
        motivo: "SEM JOGADA VÁLIDA"
      };
    }

    return {
      valido: true,
      motor,
      rx,
      alvoDuzia: alvoRX(rx),
      jogada,
      score: jogada.score,
      assinatura: jogada.assinatura,
      similaridade: info.similaridade
    };
  }

  function classificar(numero, jogada) {
    if (!jogada?.valido) {
      return {
        green: false,
        tipo: "FORA"
      };
    }

    for (
      const bloco of [
        ...jogada.blocos2,
        ...jogada.blocos1
      ]
    ) {
      if (bloco.numeros.includes(numero)) {
        const d = distancia(
          numero,
          bloco.centro
        );

        return {
          green: true,
          tipo:
            d === 0 ? "ALVO" :
            d === 1 ? "V1" : "V2"
        };
      }
    }

    return {
      green: false,
      tipo: "FORA"
    };
  }

  function estatisticas(lista) {
    const validos = (lista || [])
      .filter(item =>
        !item.semJogada &&
        !item.aguardandoG1 &&
        typeof item.green === "boolean"
      )
      .slice(-20);

    function taxa(qtd) {
      const itens = validos.slice(-qtd);

      if (!itens.length) return 0;

      return (
        itens.filter(x => x.green).length /
        itens.length
      ) * 100;
    }

    let perdas = 0;

    for (
      let i = validos.length - 1;
      i >= 0;
      i--
    ) {
      if (validos[i].green) break;
      perdas++;
    }

    return {
      total: validos.length,
      taxa5: taxa(5),
      taxa10: taxa(10),
      taxa20: taxa(20),
      perdas
    };
  }

  /*
   * CACHE DE CÁLCULO
   *
   * Cada histórico é calculado uma vez.
   * Renderizar a interface não recalcula as jogadas.
   */

  let cacheChave = null;
  let cacheResultado = null;

  function invalidarCache() {
    cacheChave = null;
    cacheResultado = null;
  }

  function calcularDoze(base) {
    const configs = {
      NORMAL: {},
      DINAMICO: {},
      RX_NORMAL: {},
      RX_DINAMICO: {}
    };

    const usadas = new Set();

    let variacao = 0;

    for (const motor of MOTORES) {
      for (const rx of RX_LIST) {
        const config = gerarConfig(
          base,
          motor,
          rx,
          usadas,
          variacao++
        );

        if (config.valido) {
          usadas.add(config.assinatura);

          const live = estatisticas(
            estado.timelines[motor][rx]
          );

          config.scoreAuto =
            config.score +
            live.taxa10 * 0.02 +
            live.taxa20 * 0.01 -
            live.perdas * 0.30 +
            config.similaridade * 0.005;
        }

        configs[motor][rx] = config;
      }
    }

    return configs;
  }

  function escolherAuto(configs) {
    const candidatos = [];

    for (const motor of MOTORES) {
      for (const rx of RX_LIST) {
        const config = configs[motor][rx];

        if (config?.valido) {
          candidatos.push(config);
        }
      }
    }

    candidatos.sort(
      (a, b) =>
        b.scoreAuto - a.scoreAuto
    );

    return candidatos[0] || null;
  }

  function obterConfigs() {
    const chave = estado.historico.join(",");

    if (
      cacheChave === chave &&
      cacheResultado
    ) {
      return cacheResultado;
    }

    const configs = calcularDoze(
      estado.historico
    );

    const auto = escolherAuto(configs);

    cacheChave = chave;
    cacheResultado = {
      configs,
      auto
    };

    return cacheResultado;
  }

  function configAtiva(configs, auto) {
    if (estado.modo === "AUTO") {
      return auto;
    }

    return configs[estado.motorManual]
      ?.[estado.manualRX] || null;
  }

  /*
   * G1 INDIVIDUAL
   */

  function snapshot(config) {
    if (!config?.valido) return null;

    return {
      motor: config.motor,
      rx: config.rx,
      centros2: config.jogada.blocos2.map(
        bloco => bloco.centro
      ),
      centro1:
        config.jogada.blocos1[0].centro,
      historico: estado.historico.join(",")
    };
  }

  function jogadaSnapshot(snap) {
    if (!snap) return null;

    const blocos2 = (snap.centros2 || [])
      .map(centro => ({
        centro,
        qtd: 2,
        numeros: vizinhos(centro, 2)
      }));

    const blocos1 = [{
      centro: snap.centro1,
      qtd: 1,
      numeros: vizinhos(snap.centro1, 1)
    }];

    return {
      valido: true,
      blocos2,
      blocos1,
      numeros: new Set(
        [...blocos2, ...blocos1].flatMap(
          bloco => bloco.numeros
        )
      )
    };
  }

  function prepararPendentes(configs, auto) {
    const chave = estado.historico.join(",");

    if (!estado.freezes.AUTO) {
      if (
        estado.pendentes.AUTO?.historico !== chave
      ) {
        estado.pendentes.AUTO =
          snapshot(auto);
      }
    }

    for (const motor of MOTORES) {
      for (const rx of RX_LIST) {
        if (estado.freezes[motor][rx]) {
          continue;
        }

        if (
          estado.pendentes[motor][rx]?.historico !== chave
        ) {
          estado.pendentes[motor][rx] =
            snapshot(configs[motor][rx]);
        }
      }
    }
  }

  function avaliarLinha(
    numero,
    pendente,
    freeze,
    timeline,
    chave
  ) {
    const lista = timeline.slice(-20);

    if (freeze) {
      const resultado = classificar(
        numero,
        jogadaSnapshot(freeze)
      );

      const ultimo = lista.findLastIndex(
        item => item.aguardandoG1
      );

      const atualizacao = {
        resultadoG1: numero,
        green: resultado.green,
        tipo: resultado.tipo,
        fase: resultado.green ? "G1" : "LOSS",
        aguardandoG1: false,
        semJogada: false
      };

      if (ultimo >= 0) {
        lista[ultimo] = {
          ...lista[ultimo],
          ...atualizacao
        };
      } else {
        lista.push({
          resultado: numero,
          ...atualizacao
        });
      }

      return {
        timeline: lista.slice(-20),
        pendente: null,
        freeze: null
      };
    }

    if (
      !pendente ||
      pendente.historico !== chave
    ) {
      lista.push({
        resultado: numero,
        green: null,
        semJogada: true,
        fase: "SEM"
      });

      return {
        timeline: lista.slice(-20),
        pendente: null,
        freeze: null
      };
    }

    const resultado = classificar(
      numero,
      jogadaSnapshot(pendente)
    );

    if (resultado.green) {
      lista.push({
        resultado: numero,
        green: true,
        tipo: resultado.tipo,
        semJogada: false,
        fase: "ENTRADA"
      });

      return {
        timeline: lista.slice(-20),
        pendente: null,
        freeze: null
      };
    }

    lista.push({
      resultado: numero,
      green: null,
      semJogada: false,
      aguardandoG1: true,
      fase: "ESPERA_G1"
    });

    return {
      timeline: lista.slice(-20),
      pendente: null,
      freeze: { ...pendente }
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

  function adicionarNumero(numero) {
    if (
      !Number.isInteger(numero) ||
      numero < 0 ||
      numero > 36
    ) {
      return;
    }

    const { configs, auto } = obterConfigs();

    prepararPendentes(configs, auto);

    const ativa = configAtiva(configs, auto);

    avaliarPendentes(numero);

    if (estado.visualFreeze) {
      const resultado = classificar(
        numero,
        jogadaSnapshot(estado.visualFreeze)
      );

      const ultimo =
        estado.visual[estado.visual.length - 1];

      if (ultimo) {
        ultimo.g1 = numero;
        ultimo.green = resultado.green;
        ultimo.fase =
          resultado.green ? "G1" : "LOSS";
      }

      estado.visualFreeze = null;
    } else {
      const snap = snapshot(ativa);

      const resultado = snap
        ? classificar(
            numero,
            jogadaSnapshot(snap)
          )
        : null;

      estado.visual.push({
        resultado: numero,
        g1: null,
        green: resultado?.green ? true : null,
        semJogada: !snap,
        fase: !snap
          ? "SEM"
          : resultado.green
            ? "ENTRADA"
            : "ESPERA_G1"
      });

      if (resultado && !resultado.green) {
        estado.visualFreeze = snap;
      }
    }

    estado.historico.push(numero);

    estado.historico =
      estado.historico.slice(-20);

    estado.visual =
      estado.visual.slice(-14);

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

    invalidarCache();
  }

  function inserirHistorico() {
    const campo = document.getElementById(
      "entradaHistorico"
    );

    const encontrados = campo.value.match(
      /\b(?:[0-9]|[12][0-9]|3[0-6])\b/g
    );

    if (!encontrados) return;

    estado.historico =
      normalizarHistorico(
        encontrados.map(Number)
      );

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

  function selecionar(motor, rx) {
    if (motor === "AUTO") {
      estado.modo = "AUTO";
    } else {
      estado.modo = "MANUAL";
      estado.motorManual = motor;
      estado.manualRX = rx;
    }

    salvar();
    agendarRender();
  }

  /*
   * INTERFACE
   */

  document.body.innerHTML = "";

  document.body.style.cssText = `
    margin: 0;
    background: #101010;
    color: #fff;
    font-family: Arial, sans-serif;
  `;

  const app = document.createElement("div");

  app.innerHTML = `
<style>
* {
  box-sizing: border-box;
}

.app {
  max-width: 900px;
  margin: auto;
  padding: 8px;
}

h2 {
  text-align: center;
  font-size: 20px;
  margin: 7px;
}

.painel {
  background: #1c1c1f;
  border: 1px solid #414141;
  border-radius: 10px;
  padding: 9px;
  margin-bottom: 8px;
}

.titulo {
  font-size: 10px;
  font-weight: 900;
  color: #aaa;
  margin-bottom: 7px;
}

textarea {
  width: 100%;
  height: 60px;
  background: #111;
  color: white;
  border: 1px solid #555;
  border-radius: 7px;
  padding: 8px;
}

.botoes,
.modos {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 6px;
}

button {
  cursor: pointer;
  font-family: Arial;
  font-weight: 900;
}

.btn {
  background: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 7px;
  padding: 8px 10px;
}

.btn.verde {
  background: #17643b;
}

.btn.red {
  background: #762832;
}

.seletorGrupo {
  margin-top: 10px;
}

.seletorTitulo {
  font-size: 10px;
  font-weight: 900;
  color: #aaa;
}

.modo {
  background: #222;
  color: #aaa;
  border: 1px solid #555;
  border-radius: 7px;
  padding: 9px 12px;
}

.modo.ativo {
  background: #007d98;
  border-color: #00e5ff;
  color: white;
}

.modo.dinamico.ativo {
  background: #6c4d00;
  border-color: #ffc107;
}

.modo.raiox.ativo {
  background: #4b236b;
  border-color: #d27cff;
}

.modo.raiox.dinamico.ativo {
  background: #7a3d00;
  border-color: #ff9800;
}

.origemAuto {
  margin-top: 9px;
  padding: 9px;
  background: #111;
  border: 1px solid #00e5ff;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 900;
  text-align: center;
  color: #00e5ff;
}

.resumo {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  margin-top: 9px;
}

.card {
  background: #111;
  border: 1px solid #333;
  border-radius: 7px;
  padding: 8px;
  text-align: center;
}

.card small {
  display: block;
  font-size: 9px;
  color: #999;
}

.card strong {
  font-size: 17px;
}

.duziasLinha {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.duziaCard {
  background: #111;
  border: 1px solid #444;
  border-radius: 7px;
  padding: 8px;
  text-align: center;
}

.duziaCard.forte {
  border-color: #00e676;
}

.duziaCard small {
  display: block;
  font-size: 9px;
  color: #aaa;
}

.duziaCard strong {
  display: block;
  font-size: 18px;
  margin: 5px 0;
}

.duziaCard span {
  font-size: 9px;
  color: #aaa;
}

.timelineSecao {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #333;
}

.timelineTituloGrupo {
  font-size: 10px;
  font-weight: 900;
  color: #aaa;
}

.timelineRow {
  display: grid;
  grid-template-columns: 80px 1fr 42px;
  gap: 5px;
  align-items: center;
  margin-top: 6px;
}

.timeline {
  display: flex;
  gap: 2px;
  justify-content: flex-end;
  overflow: hidden;
}

.gl {
  width: 18px;
  min-width: 18px;
  height: 18px;
  border-radius: 4px;
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.gl.green {
  background: #00994d;
}

.gl.loss {
  background: #c62828;
}

.gl.g1 {
  background: #ffc107;
  color: #111;
}

.gl.wait {
  background: #4a3510;
  color: #ffc107;
}

.gl.sem {
  background: #333;
  color: #999;
}

.nomeTL,
.taxaTL {
  font-size: 9px;
  font-weight: 900;
}

.taxaTL {
  text-align: right;
}

.duplas14 {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.dupla14 {
  min-height: 65px;
  border-radius: 7px;
  background: #272727;
  border: 2px solid #555;
  display: flex;
  justify-content: center;
  position: relative;
  padding: 6px 4px 26px;
}

.dupla14.green {
  border-color: #00b85c;
}

.dupla14.loss {
  border-color: #d93a3a;
}

.dupla14.g1 {
  border-color: #ffc107;
}

.dupla14.wait {
  border-color: #8a6b00;
}

.bolaDupla {
  width: 31px;
  height: 31px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  border: 2px solid #aaa;
}

.resultadoEntrada {
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  background: #171717;
  border: 1px solid #777;
  border-radius: 5px;
  padding: 3px 5px;
  font-size: 9px;
  white-space: nowrap;
}

.resultadoEntrada.green {
  background: #00994d;
}

.resultadoEntrada.loss {
  background: #c62828;
}

.resultadoEntrada.g1 {
  background: #ffc107;
  color: #111;
}

.resultadoEntrada.wait {
  color: #ffc107;
}

.jogadaStatus {
  display: inline-block;
  font-size: 10px;
  font-weight: 900;
  color: #00e5ff;
  border: 1px solid #007d98;
  background: #15323a;
  padding: 7px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.jogadaStatus.congelada {
  color: #ffc107;
  border-color: #ffc107;
  background: #4a3510;
}

.grupoRegiao {
  margin-bottom: 8px;
  background: #161616;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 7px;
}

.grupoRegiaoTitulo {
  font-size: 10px;
  font-weight: 900;
  color: #aaa;
  margin-bottom: 6px;
}

.jogada {
  display: flex;
  gap: 6px;
  overflow-x: auto;
}

.bloco {
  min-width: 135px;
  background: #111;
  border: 1px solid #00e5ff;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
}

.bloco.um {
  border-color: #ffc107;
}

.bloco small {
  font-size: 9px;
  color: #999;
  font-weight: 900;
}

.bloco strong {
  display: block;
  font-size: 23px;
  margin: 5px;
}

.numeros {
  border-top: 1px solid #333;
  padding-top: 6px;
  font-size: 11px;
  font-weight: 900;
}

.teclado {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
}

.numero {
  height: 42px;
  border: 1px solid #666;
  border-radius: 6px;
  color: white;
}

.zero {
  grid-column: span 6;
}

.status {
  font-size: 10px;
  font-weight: 900;
  color: #00e676;
  margin-top: 8px;
  line-height: 1.7;
}

@media (max-width: 600px) {
  .resumo {
    grid-template-columns: repeat(2, 1fr);
  }

  .duplas14 {
    grid-template-columns: repeat(4, 1fr);
  }

  .timelineRow {
    grid-template-columns: 70px 1fr 36px;
  }
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
    <div class="seletorGrupo">
      <div class="seletorTitulo">
        AUTO • 12 CANDIDATOS
      </div>

      <div class="modos">
        <button id="btnAUTO" class="modo">
          AUTO
        </button>
      </div>
    </div>

    ${[
      ["NORMAL", "NORMAL • DÚZIAS FÍSICAS", "N", ""],
      ["DINAMICO", "DINÂMICO • DÚZIAS FÍSICAS", "D", "dinamico"],
      ["RX_NORMAL", "RAIO X NORMAL", "RN", "raiox"],
      ["RX_DINAMICO", "RAIO X DINÂMICO", "RD", "raiox dinamico"]
    ].map(([motor, nome, prefixo, classe]) => `
      <div class="seletorGrupo">
        <div class="seletorTitulo">
          ${nome}
        </div>

        <div class="modos">
          ${RX_LIST.map(rx => `
            <button
              id="btn${prefixo}${rx}"
              class="modo ${classe}"
            >
              ${prefixo.startsWith("R") ? "RX " : ""}C${rx}
            </button>
          `).join("")}
        </div>
      </div>
    `).join("")}

    <div id="origemAuto" class="origemAuto">
      AUTO
    </div>

    <div id="resumo" class="resumo"></div>

    <div class="timelineSecao">
      <div class="timelineTituloGrupo">
        CONCENTRAÇÃO FÍSICA DAS DÚZIAS
      </div>

      <div id="duzias" class="duziasLinha"></div>
    </div>

    ${[
      ["AUTO FINAL", "AUTO", ["AUTO"]],
      ["NORMAL", "N", RX_LIST],
      ["DINÂMICO", "D", RX_LIST],
      ["RAIO X NORMAL", "RN", RX_LIST],
      ["RAIO X DINÂMICO", "RD", RX_LIST]
    ].map(([nome, prefixo, linhas]) => `
      <div class="timelineSecao">
        <div class="timelineTituloGrupo">
          ${nome}
        </div>

        ${linhas.map(rx => `
          <div
            id="timeline${prefixo}${rx === "AUTO" ? "" : rx}"
            class="timelineRow"
          ></div>
        `).join("")}
      </div>
    `).join("")}
  </div>

  <div class="painel">
    <div class="titulo">
      ÚLTIMAS 14 • JOGADA SELECIONADA
    </div>

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

  /*
   * EVENTOS
   */

  document.getElementById("inserir").onclick =
    inserirHistorico;

  document.getElementById("apagar").onclick =
    apagarUltimo;

  document.getElementById("limpar").onclick =
    apagarTudo;

  document.getElementById("btnAUTO").onclick =
    () => selecionar("AUTO");

  const PREFIXOS = {
    NORMAL: "N",
    DINAMICO: "D",
    RX_NORMAL: "RN",
    RX_DINAMICO: "RD"
  };

  for (const motor of MOTORES) {
    for (const rx of RX_LIST) {
      document.getElementById(
        "btn" + PREFIXOS[motor] + rx
      ).onclick = () => selecionar(motor, rx);
    }
  }

  /*
   * TECLADO
   */

  const teclado = document.getElementById(
    "teclado"
  );

  for (let numero = 1; numero <= 36; numero++) {
    const botao = document.createElement("button");

    botao.className = "numero";
    botao.textContent = numero;
    botao.style.background = cor(numero);

    botao.onclick = () => adicionarNumero(numero);

    teclado.appendChild(botao);
  }

  const zero = document.createElement("button");

  zero.className = "numero zero";
  zero.textContent = "0";
  zero.style.background = cor(0);
  zero.onclick = () => adicionarNumero(0);

  teclado.appendChild(zero);

  /*
   * RENDERIZAÇÃO
   */

  function renderTimeline(id, nome, lista) {
    const itens = (lista || []).slice(-20);

    const validos = itens.filter(
      item =>
        !item.semJogada &&
        !item.aguardandoG1 &&
        typeof item.green === "boolean"
    );

    const taxa = validos.length
      ? validos.filter(x => x.green).length /
        validos.length * 100
      : null;

    const html = itens.map(item => {
      if (item.semJogada) {
        return '<span class="gl sem">—</span>';
      }

      if (item.aguardandoG1) {
        return '<span class="gl wait">…</span>';
      }

      if (item.green && item.fase === "G1") {
        return '<span class="gl g1">G1</span>';
      }

      if (item.green) {
        return '<span class="gl green">G</span>';
      }

      return '<span class="gl loss">L</span>';
    }).join("");

    document.getElementById(id).innerHTML = `
      <div class="nomeTL">${nome}</div>

      <div class="timeline">
        ${html}
      </div>

      <div class="taxaTL">
        ${taxa === null ? "—" : taxa.toFixed(0) + "%"}
      </div>
    `;
  }

  function nomeMotor(motor) {
    return {
      NORMAL: "NORMAL",
      DINAMICO: "DINÂMICO",
      RX_NORMAL: "RAIO X NORMAL",
      RX_DINAMICO: "RAIO X DINÂMICO"
    }[motor] || "—";
  }

  function renderJogada(config, congelada) {
    const area = document.getElementById(
      "jogada"
    );

    if (!config?.valido || !config.jogada?.valido) {
      area.innerHTML = `
        <div style="color:#999">
          AGUARDANDO JOGADA VÁLIDA
        </div>
      `;

      return;
    }

    const blocos = [
      ...config.jogada.blocos2.map(
        bloco => ({ ...bloco, um: false })
      ),
      ...config.jogada.blocos1.map(
        bloco => ({ ...bloco, um: true })
      )
    ];

    const ordem = [
      "TIERS",
      "ORPHELINS",
      "ZERO",
      "VOISINS",
      "OUTROS"
    ];

    blocos.sort(
      (a, b) =>
        ordem.indexOf(regiao(a.centro)) -
        ordem.indexOf(regiao(b.centro))
    );

    const grupos = new Map();

    for (const bloco of blocos) {
      const nome = regiao(bloco.centro);

      if (!grupos.has(nome)) {
        grupos.set(nome, []);
      }

      grupos.get(nome).push(bloco);
    }

    let html = `
      <div class="jogadaStatus ${congelada ? "congelada" : ""}">
        ${congelada ? "JOGADA CONGELADA • G1" : "JOGADA ATUAL"}
        • ${nomeMotor(config.motor)}
        • C${config.rx}
        • ${alvoRX(config.rx)}ª DÚZIA
        • 28 NÚMEROS
      </div>
    `;

    for (const [nome, itens] of grupos) {
      html += `
        <div class="grupoRegiao">
          <div class="grupoRegiaoTitulo">
            ${nome}
          </div>

          <div class="jogada">
            ${itens.map(bloco => `
              <div class="bloco ${bloco.um ? "um" : ""}">
                <small>
                  ${bloco.um ? "1 VIZINHO" : "2 VIZINHOS"} DO
                </small>

                <strong>${bloco.centro}</strong>

                <div class="numeros">
                  ${bloco.numeros.join(" • ")}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    area.innerHTML = html;
  }

  function renderUltimos() {
    const area = document.getElementById(
      "ultimos14"
    );

    area.innerHTML = estado.visual
      .slice(-14)
      .map(item => {
        const classe = item.semJogada
          ? "sem"
          : item.fase === "ESPERA_G1"
            ? "wait"
            : item.fase === "G1"
              ? "g1"
              : item.green
                ? "green"
                : "loss";

        const textos = {
          sem: "—",
          wait: "…",
          g1: "G1",
          green: "G",
          loss: "L"
        };

        return `
          <div class="dupla14 ${classe}">
            <div
              class="bolaDupla"
              style="background:${cor(item.resultado)}"
            >
              ${item.resultado}
            </div>

            <div class="resultadoEntrada ${classe}">
              ${textos[classe]}
              ${item.g1 == null ? "" : " • " + item.g1}
            </div>
          </div>
        `;
      })
      .join("");
  }

  /*
   * RENDER AGENDADO
   *
   * Um único render por ciclo de interação.
   * Evita várias atualizações consecutivas.
   */

  let renderPendente = false;

  function agendarRender() {
    if (renderPendente) return;

    renderPendente = true;

    setTimeout(() => {
      renderPendente = false;
      render();
    }, 0);
  }

  function render() {
    const base = estado.historico;

    const analise = analisar(base);

    const { configs, auto } = obterConfigs();

    prepararPendentes(configs, auto);

    const ativa = configAtiva(configs, auto);

    const ids = ["btnAUTO"];

    for (const motor of MOTORES) {
      for (const rx of RX_LIST) {
        ids.push(
          "btn" + PREFIXOS[motor] + rx
        );
      }
    }

    for (const id of ids) {
      document.getElementById(id)
        .classList.remove("ativo");
    }

    const idAtivo = estado.modo === "AUTO"
      ? "btnAUTO"
      : "btn" +
        PREFIXOS[estado.motorManual] +
        estado.manualRX;

    document.getElementById(idAtivo)
      .classList.add("ativo");

    document.getElementById(
      "origemAuto"
    ).textContent = auto
      ? (
          "AUTO ESCOLHEU • " +
          nomeMotor(auto.motor) +
          " • C" + auto.rx +
          " • " + auto.alvoDuzia + "ª DÚZIA" +
          " • SCORE " + auto.scoreAuto.toFixed(1)
        )
      : "AUTO • AGUARDANDO JOGADAS VÁLIDAS";

    const live = estatisticas(
      estado.timelines.AUTO
    );

    document.getElementById("resumo").innerHTML = [
      ["REAL5 AUTO", live.total ? live.taxa5 : null],
      ["REAL10 AUTO", live.total ? live.taxa10 : null],
      ["REAL20 AUTO", live.total ? live.taxa20 : null],
      ["PERDAS", live.perdas]
    ].map(([nome, valor]) => `
      <div class="card">
        <small>${nome}</small>

        <strong>
          ${valor === null
            ? "—"
            : nome === "PERDAS"
              ? valor
              : valor.toFixed(0) + "%"
          }
        </strong>
      </div>
    `).join("");

    document.getElementById("duzias").innerHTML =
      analise.ranking.map((item, i) => `
        <div class="duziaCard ${i === 0 ? "forte" : ""}">
          <small>
            ${item.duzia}ª DÚZIA
          </small>

          <strong>
            ${(item.intensidade * 100).toFixed(0)}%
          </strong>

          <span>
            ${item.contagem}/20
            • FÍSICA
            • QUEBRA ${item.quebra.toFixed(1)}
          </span>
        </div>
      `).join("");

    renderTimeline(
      "timelineAUTO",
      "AUTO",
      estado.timelines.AUTO
    );

    for (const motor of MOTORES) {
      for (const rx of RX_LIST) {
        renderTimeline(
          "timeline" + PREFIXOS[motor] + rx,
          motor.startsWith("RX")
            ? "RX C" + rx
            : "C" + rx,
          estado.timelines[motor][rx]
        );
      }
    }

    renderUltimos();

    const freeze = estado.modo === "AUTO"
      ? estado.freezes.AUTO
      : estado.freezes[estado.motorManual]
          [estado.manualRX];

    let configExibida = ativa;

    if (freeze) {
      configExibida = {
        valido: true,
        motor: freeze.motor,
        rx: freeze.rx,
        jogada: jogadaSnapshot(freeze)
      };
    }

    renderJogada(
      configExibida,
      !!freeze
    );

    const validos = [];

    for (const motor of MOTORES) {
      for (const rx of RX_LIST) {
        const config = configs[motor][rx];

        if (config.valido) {
          validos.push(config);
        }
      }
    }

    const diferentes = new Set(
      validos.map(config => config.assinatura)
    ).size;

    const dominante = analise.ranking[0];

    document.getElementById("status").textContent =
      base.length + "/20" +
      " • 12 MOTORES" +
      " • " + validos.length + "/12 JOGADAS VÁLIDAS" +
      " • " + diferentes + " COBERTURAS DIFERENTES" +
      " • 5 ALVOS ±2 + 1 ALVO ±1" +
      " • SEM SOBREPOSIÇÃO" +
      " • SEM BURACO ISOLADO" +
      " • ZONAS DE QUEBRA 1/2/3" +
      " • CONCENTRAÇÃO: " +
      dominante.duzia + "ª DÚZIA" +
      (freeze ? " • G1 CONGELADO" : "");

    salvar();
  }

  /*
   * INICIALIZAÇÃO
   */

  agendarRender();

})();
