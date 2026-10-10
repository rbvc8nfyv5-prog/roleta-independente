(function () {
  "use strict";

  /*
   ============================================================
   ANÁLISE BETA — VERSÃO 3.0
   ============================================================

   12 MOTORES:
   - NORMAL C4 / C5 / C6
   - DINÂMICO C4 / C5 / C6
   - RAIO-X C4 / C5 / C6
   - RAIO-X DINÂMICO C4 / C5 / C6

   ALTERAÇÕES:
   1. Jogada atual somente com os números centrais.
   2. Quadrados azuis = 2 vizinhos.
   3. Quadrado amarelo = 1 vizinho.
   4. Todos os alvos em uma linha horizontal.
   5. Ordem VOISINS antes de ZERO.
   6. Painel de candidatos minimizável.
   7. Timelines minimizáveis, mostrando somente AUTO.
   8. Jogador virtual abaixo do teclado.
   9. Diagnóstico automático quando a entrada não acerta.
   10. Análise da primeira entrada e do G1.
   11. Cache para evitar cálculos repetidos.
   12. Renderização otimizada.
   13. Histórico persistente.
   14. G1 independente para cada motor.
   15. Sem sobreposição dos setores.
   16. Sem buracos isolados.
   17. Cobertura de 28 números.
   18. Zonas de quebra e concentração física.

   OBSERVAÇÃO:
   O jogador virtual explica matematicamente o resultado
   em relação à cobertura e aos critérios usados.
   Ele não identifica causas reais de resultados aleatórios
   nem garante previsões futuras.
   ============================================================
  */

  const STORAGE = "ANALISE_BETA_VIRTUAL_V3";
  const MAX_HISTORICO = 20;
  const MAX_TIMELINE = 20;
  const MAX_VISUAL = 14;

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

  const ZONAS_QUEBRA = {
    1: [13, 14, 15, 16, 17, 18],
    2: [0, 26, 3, 35, 28, 7, 6, 30],
    3: [23, 10, 24, 20, 22, 21, 4, 19]
  };

  const GRUPOS_FISICOS = {
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
    VOISINS: new Set([
      19, 4, 21, 2, 25, 28, 7, 29, 18, 22
    ]),
    ZERO: new Set([
      0, 32, 15, 26, 3, 35, 12
    ]),
    TIERS: new Set([
      27, 13, 36, 11, 30, 8,
      23, 10, 5, 24, 16, 33
    ]),
    ORPHELINS: new Set([
      9, 31, 14, 20, 1, 17, 6, 34
    ])
  };

  const ORDEM_REGIOES = [
    "VOISINS",
    "ZERO",
    "TIERS",
    "ORPHELINS",
    "OUTROS"
  ];

  const PREFIXOS = {
    NORMAL: "N",
    DINAMICO: "D",
    RX_NORMAL: "RN",
    RX_DINAMICO: "RD"
  };

  const INDICE = new Map(
    TRACK.map((n, i) => [n, i])
  );

  const mod = (n, m) => ((n % m) + m) % m;

  function pos(n) {
    return INDICE.get(n) ?? -1;
  }

  function distancia(a, b) {
    const ia = pos(a);
    const ib = pos(b);

    if (ia < 0 || ib < 0) return 99;

    const d = Math.abs(ia - ib);

    return Math.min(d, 37 - d);
  }

  function delta(a, b) {
    if (pos(a) < 0 || pos(b) < 0) return 0;

    let d = mod(pos(b) - pos(a), 37);

    if (d > 18) d -= 37;

    return d;
  }

  function vizinhos(numero, quantidade) {
    const i = pos(numero);

    if (i < 0) return [];

    const resultado = [];

    for (
      let d = -quantidade;
      d <= quantidade;
      d++
    ) {
      resultado.push(
        TRACK[mod(i + d, 37)]
      );
    }

    return resultado;
  }

  function duzia(n) {
    if (n === 0) return 0;
    if (n <= 12) return 1;
    if (n <= 24) return 2;
    return 3;
  }

  function alvoRX(rx) {
    return rx - 3;
  }

  function corNumero(n) {
    if (n === 0) return "#087c48";

    return VERMELHOS.has(n)
      ? "#c6283d"
      : "#181818";
  }

  function regiao(n) {
    for (
      const [nome, numeros]
      of Object.entries(REGIOES)
    ) {
      if (numeros.has(n)) return nome;
    }

    return "OUTROS";
  }

  function nomeMotor(motor) {
    return {
      NORMAL: "NORMAL",
      DINAMICO: "DINÂMICO",
      RX_NORMAL: "RAIO-X",
      RX_DINAMICO: "RAIO-X DINÂMICO"
    }[motor] || "—";
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

  /*
   ============================================================
   ESTADO
   ============================================================
  */

  function estrutura(valor) {
    return {
      AUTO: valor,
      NORMAL: {
        4: valor,
        5: valor,
        6: valor
      },
      DINAMICO: {
        4: valor,
        5: valor,
        6: valor
      },
      RX_NORMAL: {
        4: valor,
        5: valor,
        6: valor
      },
      RX_DINAMICO: {
        4: valor,
        5: valor,
        6: valor
      }
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
      const raw = localStorage.getItem(STORAGE);

      if (!raw) return;

      const salvo = JSON.parse(raw);

      if (!salvo || typeof salvo !== "object") {
        return;
      }

      estado.historico = limitarHistorico(
        salvo.historico
      );

      estado.modo =
        salvo.modo === "MANUAL"
          ? "MANUAL"
          : "AUTO";

      if (MOTORES.includes(salvo.motorManual)) {
        estado.motorManual = salvo.motorManual;
      }

      if (RX_LIST.includes(salvo.manualRX)) {
        estado.manualRX = salvo.manualRX;
      }

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
            const lista =
              salvo.timelines[motor]?.[rx];

            if (Array.isArray(lista)) {
              estado.timelines[motor][rx] =
                lista.slice(-MAX_TIMELINE);
            }
          }
        }
      }

      for (
        const campo
        of ["pendentes", "freezes"]
      ) {
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
      console.warn(
        "Erro ao carregar histórico:",
        erro
      );
    }
  }

  function salvar() {
    try {
      localStorage.setItem(
        STORAGE,
        JSON.stringify(estado)
      );
    } catch (erro) {
      console.warn(
        "Erro ao salvar:",
        erro
      );
    }
  }

  carregar();

  /*
   ============================================================
   ANÁLISE FÍSICA
   ============================================================
  */

  function analisarFisica(base) {
    const calor = new Float64Array(37);

    const contagem = [0, 0, 0, 0];
    const forca = [0, 0, 0, 0];
    const quebra = [0, 0, 0, 0];

    const pesos = [
      1,
      0.78,
      0.52,
      0.29,
      0.14,
      0.06
    ];

    for (let i = 0; i < base.length; i++) {
      const numero = base[i];

      const peso =
        0.45 +
        0.55 *
        (i + 1) /
        Math.max(1, base.length);

      const d = duzia(numero);

      if (d) {
        contagem[d]++;
        forca[d] += peso;
      }

      for (let z = 1; z <= 3; z++) {
        if (ZONAS_QUEBRA[z].includes(numero)) {
          quebra[z] += peso;
        }
      }

      for (let j = 0; j < 37; j++) {
        const dist = distancia(
          numero,
          TRACK[j]
        );

        if (dist <= 5) {
          calor[j] += pesos[dist] * peso;
        }
      }
    }

    const info = {};

    for (let z = 1; z <= 3; z++) {
      const numeros = [
        ...new Set(
          GRUPOS_FISICOS[z].flat()
        )
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
        intensidade:
          info[z].score / maior
      }))
      .sort(
        (a, b) => b.score - a.score
      );

    return {
      calor,
      info,
      ranking,
      maxCalor: Math.max(
        0.00001,
        ...calor
      )
    };
  }

  function contagemFisica(base, rx) {
    const mapa = new Float64Array(37);

    const decay = {
      4: 0.78,
      5: 0.82,
      6: 0.86
    }[rx];

    const pesos = [
      1,
      0.72,
      0.44,
      0.22,
      0.10
    ];

    let peso = 1;

    for (
      let i = base.length - 1;
      i >= 0;
      i--
    ) {
      for (let j = 0; j < 37; j++) {
        const dist = distancia(
          base[i],
          TRACK[j]
        );

        if (dist <= 4) {
          mapa[j] +=
            pesos[dist] * peso;
        }
      }

      peso *= decay;
    }

    const maior = Math.max(
      0.00001,
      ...mapa
    );

    return mapa.map(
      valor => valor / maior
    );
  }

  /*
   ============================================================
   RAIO-X
   ============================================================
  */

  function analisarRaioX(base, rx) {
    const frequencia =
      new Float64Array(37);

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

        if (
          duzia(antigo) ===
          duzia(recente)
        ) {
          score += 0.70;
        }

        score +=
          0.30 *
          Math.max(
            0,
            1 -
            distancia(antigo, recente) / 19
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

    const escolhidos =
      candidatos.slice(
        0,
        Math.max(
          4,
          Math.ceil(
            candidatos.length * 0.30
          )
        )
      );

    const pesos = [
      1,
      0.70,
      0.42,
      0.18
    ];

    for (const item of escolhidos) {
      for (let j = 0; j < 37; j++) {
        const dist = distancia(
          item.numero,
          TRACK[j]
        );

        if (dist <= 3) {
          frequencia[j] +=
            pesos[dist] *
            (0.40 + 0.60 * item.score);
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
            (soma, item) =>
              soma + item.score,
            0
          ) /
          escolhidos.length * 100
        : 0;

    return {
      valido: escolhidos.length > 0,
      frequencia: frequencia.map(
        valor => valor / maior
      ),
      similaridade
    };
  }

  /*
   ============================================================
   PONTUAÇÃO DOS 12 MOTORES
   ============================================================
  */

  function pontuarMotor(
    base,
    motor,
    rx,
    analise,
    contagem,
    raioX
  ) {
    const usaRaioX =
      motor.startsWith("RX");

    const dinamico =
      motor.includes("DINAMICO");

    if (
      usaRaioX &&
      !raioX?.valido
    ) {
      return null;
    }

    const alvoDuzia = alvoRX(rx);

    const scores =
      new Float64Array(37);

    for (let j = 0; j < 37; j++) {
      const numero = TRACK[j];

      const principal =
        duzia(numero) === alvoDuzia
          ? 1
          : 0;

      let proximidade = 0;

      for (
        const grupo
        of GRUPOS_FISICOS[alvoDuzia]
      ) {
        for (const alvo of grupo) {
          const d = distancia(
            numero,
            alvo
          );

          const peso =
            d === 0 ? 1 :
            d === 1 ? 0.75 :
            d === 2 ? 0.45 :
            d === 3 ? 0.20 : 0;

          proximidade = Math.max(
            proximidade,
            peso
          );
        }
      }

      const quebra =
        ZONAS_QUEBRA[alvoDuzia].some(
          alvo =>
            distancia(numero, alvo) <= 2
        ) ? 1 : 0;

      const fisica =
        analise.calor[j] /
        analise.maxCalor;

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
        const ultimos =
          base.slice(-rx);

        let direcao = 0;
        let total = 0;

        ultimos.forEach(
          (n, i) => {
            const d = delta(
              numero,
              n
            );

            if (
              Math.abs(d) <= 7
            ) {
              const peso =
                (i + 1) /
                ultimos.length;

              direcao +=
                Math.sign(d) * peso;

              total += peso;
            }
          }
        );

        if (total > 0) {
          score +=
            Math.abs(
              direcao / total
            ) * 0.11;
        }
      }

      scores[j] = score;
    }

    return {
      scores,
      similaridade:
        raioX?.similaridade || 0
    };
  }

  /*
   ============================================================
   GEOMETRIA PRÉ-CALCULADA
   ============================================================

   5 setores de 5 números = 25
   1 setor de 3 números = 3

   Total = 28 números.

   A busca de combinações é preparada apenas uma vez.
   Nenhuma recursão é executada durante os cliques.
   ============================================================
  */

  const PADROES = [];

  function gerarPadroes(
    restante,
    atual
  ) {
    if (atual.length === 6) {
      if (restante === 0) {
        PADROES.push(
          atual.slice()
        );
      }

      return;
    }

    for (
      let gap = 0;
      gap <= restante;
      gap++
    ) {
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

  function prepararModelos() {
    const assinaturas =
      new Set();

    for (
      let inicio = 0;
      inicio < 37;
      inicio++
    ) {
      for (
        let posicao3 = 0;
        posicao3 < 6;
        posicao3++
      ) {
        for (
          const gaps
          of PADROES
        ) {
          let cursor = inicio;

          const blocos5 = [];
          let bloco3 = -1;

          for (
            let k = 0;
            k < 6;
            k++
          ) {
            const tamanho =
              k === posicao3
                ? 3
                : 5;

            const centro = mod(
              cursor +
              Math.floor(
                tamanho / 2
              ),
              37
            );

            if (k === posicao3) {
              bloco3 = centro;
            } else {
              blocos5.push(
                centro
              );
            }

            cursor = mod(
              cursor +
              tamanho +
              gaps[k],
              37
            );
          }

          const chave =
            blocos5
              .slice()
              .sort(
                (a, b) => a - b
              )
              .join("-") +
            "|" +
            bloco3;

          if (
            assinaturas.has(chave)
          ) {
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
  }

  prepararModelos();

  /*
   ============================================================
   ESCOLHA DA JOGADA
   ============================================================
  */

  function construirJogada(
    scores,
    usadas,
    variacao = 0
  ) {
    const pontos5 =
      new Float64Array(37);

    const pontos3 =
      new Float64Array(37);

    for (
      let centro = 0;
      centro < 37;
      centro++
    ) {
      for (
        let d = -2;
        d <= 2;
        d++
      ) {
        const peso =
          d === 0 ? 1.22 :
          Math.abs(d) === 1
            ? 1.08
            : 1;

        pontos5[centro] +=
          scores[
            mod(
              centro + d,
              37
            )
          ] * peso;
      }

      for (
        let d = -1;
        d <= 1;
        d++
      ) {
        pontos3[centro] +=
          scores[
            mod(
              centro + d,
              37
            )
          ] *
          (d === 0
            ? 1.22
            : 1);
      }
    }

    let melhor = null;
    let maior = -Infinity;

    for (
      const modelo
      of MODELOS
    ) {
      if (
        usadas?.has(
          modelo.chave
        )
      ) {
        continue;
      }

      let score =
        pontos3[
          modelo.bloco3
        ];

      for (
        const centro
        of modelo.blocos5
      ) {
        score +=
          pontos5[centro];
      }

      score +=
        Math.sin(
          (variacao + 1) *
          (modelo.bloco3 + 1) *
          0.77
        ) * 0.00001;

      if (
        score > maior
      ) {
        maior = score;
        melhor = modelo;
      }
    }

    if (!melhor) return null;

    const blocos2 =
      melhor.blocos5.map(
        i => ({
          centro: TRACK[i],
          qtd: 2,
          numeros: vizinhos(
            TRACK[i],
            2
          )
        })
      );

    const blocos1 = [{
      centro:
        TRACK[melhor.bloco3],
      qtd: 1,
      numeros: vizinhos(
        TRACK[melhor.bloco3],
        1
      )
    }];

    const numeros = new Set(
      [
        ...blocos2,
        ...blocos1
      ].flatMap(
        b => b.numeros
      )
    );

    if (
      numeros.size !== 28
    ) {
      return null;
    }

    for (
      let i = 0;
      i < 37;
      i++
    ) {
      const numero = TRACK[i];

      if (
        numeros.has(numero)
      ) {
        continue;
      }

      const anterior =
        TRACK[mod(i - 1, 37)];

      const seguinte =
        TRACK[mod(i + 1, 37)];

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
      score: maior,
      assinatura:
        melhor.chave
    };
  }

  /*
   ============================================================
   CONFIGURAÇÕES
   ============================================================
  */

  function gerarConfig(
    base,
    motor,
    rx,
    usadas,
    variacao,
    analise,
    contagem,
    raioX
  ) {
    const minimo =
      motor.startsWith("RX")
        ? Math.max(
            14,
            rx * 2 + 4
          )
        : Math.max(
            8,
            rx + 4
          );

    if (
      base.length < minimo
    ) {
      return {
        valido: false,
        motor,
        rx,
        motivo:
          "AGUARDANDO HISTÓRICO"
      };
    }

    const info =
      pontuarMotor(
        base,
        motor,
        rx,
        analise,
        contagem,
        raioX
      );

    if (!info) {
      return {
        valido: false,
        motor,
        rx,
        motivo:
          "SEM RÉPLICAS"
      };
    }

    const jogada =
      construirJogada(
        info.scores,
        usadas,
        variacao
      );

    if (!jogada) {
      return {
        valido: false,
        motor,
        rx,
        motivo:
          "SEM JOGADA VÁLIDA"
      };
    }

    return {
      valido: true,
      motor,
      rx,
      alvoDuzia:
        alvoRX(rx),
      jogada,
      score:
        jogada.score,
      assinatura:
        jogada.assinatura,
      similaridade:
        info.similaridade
    };
  }

  /*
   ============================================================
   CLASSIFICAÇÃO
   ============================================================
  */

  function classificar(
    numero,
    jogada
  ) {
    if (
      !jogada?.valido
    ) {
      return {
        green: false,
        tipo: "SEM",
        distancia: null,
        centro: null
      };
    }

    const blocos = [
      ...jogada.blocos2,
      ...jogada.blocos1
    ];

    for (
      const bloco
      of blocos
    ) {
      if (
        bloco.numeros.includes(
          numero
        )
      ) {
        const d = distancia(
          numero,
          bloco.centro
        );

        return {
          green: true,
          tipo:
            d === 0
              ? "ALVO"
              : d === 1
                ? "V1"
                : "V2",
          distancia: d,
          centro:
            bloco.centro,
          lado:
            Math.sign(
              delta(
                bloco.centro,
                numero
              )
            )
        };
      }
    }

    let maisProximo = null;

    for (
      const bloco
      of blocos
    ) {
      const d = distancia(
        numero,
        bloco.centro
      );

      const gap =
        d - bloco.qtd;

      if (
        gap > 0 &&
        (
          !maisProximo ||
          gap <
          maisProximo.gap
        )
      ) {
        maisProximo = {
          centro:
            bloco.centro,
          distancia: d,
          gap,
          qtd:
            bloco.qtd,
          lado:
            Math.sign(
              delta(
                bloco.centro,
                numero
              )
            )
        };
      }
    }

    return {
      green: false,
      tipo:
        maisProximo?.gap === 1
          ? "FORA1"
          : maisProximo?.gap === 2
            ? "FORA2"
            : "FORA",
      distancia:
        maisProximo?.distancia ??
        null,
      centro:
        maisProximo?.centro ??
        null,
      gap:
        maisProximo?.gap ??
        null,
      lado:
        maisProximo?.lado ??
        0
    };
  }

  /*
   ============================================================
   ESTATÍSTICAS
   ============================================================
  */

  function estatisticas(
    lista
  ) {
    const validos =
      (lista || [])
        .filter(
          item =>
            !item.semJogada &&
            !item.aguardandoG1 &&
            typeof item.green ===
              "boolean"
        )
        .slice(-20);

    function taxa(qtd) {
      const itens =
        validos.slice(-qtd);

      if (!itens.length) {
        return 0;
      }

      return (
        itens.filter(
          x => x.green
        ).length /
        itens.length
      ) * 100;
    }

    let perdas = 0;

    for (
      let i =
        validos.length - 1;
      i >= 0;
      i--
    ) {
      if (
        validos[i].green
      ) {
        break;
      }

      perdas++;
    }

    return {
      total:
        validos.length,
      taxa5:
        taxa(5),
      taxa10:
        taxa(10),
      taxa20:
        taxa(20),
      perdas
    };
  }

  /*
   ============================================================
   CACHE
   ============================================================
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

    const analise =
      analisarFisica(base);

    const contagens = {};
    const raioXs = {};

    for (const rx of RX_LIST) {
      contagens[rx] =
        contagemFisica(
          base,
          rx
        );

      raioXs[rx] =
        analisarRaioX(
          base,
          rx
        );
    }

    const usadas = new Set();

    let variacao = 0;

    for (
      const motor
      of MOTORES
    ) {
      for (
        const rx
        of RX_LIST
      ) {
        const config =
          gerarConfig(
            base,
            motor,
            rx,
            usadas,
            variacao++,
            analise,
            contagens[rx],
            raioXs[rx]
          );

        if (
          config.valido
        ) {
          usadas.add(
            config.assinatura
          );

          const live =
            estatisticas(
              estado.timelines[
                motor
              ][rx]
            );

          config.scoreAuto =
            config.score +
            live.taxa10 *
              0.02 +
            live.taxa20 *
              0.01 -
            live.perdas *
              0.30 +
            config.similaridade *
              0.005;
        }

        configs[motor][rx] =
          config;
      }
    }

    return {
      configs,
      analise
    };
  }

  function escolherAuto(
    configs
  ) {
    const candidatos = [];

    for (
      const motor
      of MOTORES
    ) {
      for (
        const rx
        of RX_LIST
      ) {
        const config =
          configs[motor][rx];

        if (
          config?.valido
        ) {
          candidatos.push(
            config
          );
        }
      }
    }

    candidatos.sort(
      (a, b) =>
        b.scoreAuto -
        a.scoreAuto
    );

    return (
      candidatos[0] ||
      null
    );
  }

  function obterConfigs() {
    const chave =
      estado.historico.join(
        ","
      );

    if (
      cacheChave === chave &&
      cacheResultado
    ) {
      return cacheResultado;
    }

    const resultado =
      calcularDoze(
        estado.historico
      );

    resultado.auto =
      escolherAuto(
        resultado.configs
      );

    cacheChave = chave;
    cacheResultado =
      resultado;

    return resultado;
  }

  function configAtiva(
    configs,
    auto
  ) {
    if (
      estado.modo ===
      "AUTO"
    ) {
      return auto;
    }

    return (
      configs[
        estado.motorManual
      ]?.[
        estado.manualRX
      ] ||
      null
    );
  }

  /*
   ============================================================
   SNAPSHOT E G1
   ============================================================
  */

  function snapshot(
    config
  ) {
    if (
      !config?.valido
    ) {
      return null;
    }

    return {
      motor:
        config.motor,
      rx:
        config.rx,
      centros2:
        config.jogada.blocos2.map(
          b => b.centro
        ),
      centro1:
        config.jogada.blocos1[0]
          .centro,
      historico:
        estado.historico.join(
          ","
        )
    };
  }

  function jogadaSnapshot(
    snap
  ) {
    if (!snap) return null;

    const blocos2 =
      (snap.centros2 || [])
        .map(
          centro => ({
            centro,
            qtd: 2,
            numeros:
              vizinhos(
                centro,
                2
              )
          })
        );

    const blocos1 = [{
      centro:
        snap.centro1,
      qtd: 1,
      numeros:
        vizinhos(
          snap.centro1,
          1
        )
    }];

    return {
      valido: true,
      blocos2,
      blocos1,
      numeros:
        new Set(
          [
            ...blocos2,
            ...blocos1
          ].flatMap(
            b => b.numeros
          )
        )
    };
  }

  function prepararPendentes(
    configs,
    auto
  ) {
    const chave =
      estado.historico.join(
        ","
      );

    if (
      !estado.freezes.AUTO &&
      estado.pendentes.AUTO
        ?.historico !== chave
    ) {
      estado.pendentes.AUTO =
        snapshot(auto);
    }

    for (
      const motor
      of MOTORES
    ) {
      for (
        const rx
        of RX_LIST
      ) {
        if (
          estado.freezes[
            motor
          ][rx]
        ) {
          continue;
        }

        if (
          estado.pendentes[
            motor
          ][rx]?.historico !==
          chave
        ) {
          estado.pendentes[
            motor
          ][rx] =
            snapshot(
              configs[
                motor
              ][rx]
            );
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
    const lista =
      timeline.slice(
        -MAX_TIMELINE
      );

    if (freeze) {
      const resultado =
        classificar(
          numero,
          jogadaSnapshot(
            freeze
          )
        );

      let ultimo = -1;

      for (
        let i =
          lista.length - 1;
        i >= 0;
        i--
      ) {
        if (
          lista[i]
            .aguardandoG1
        ) {
          ultimo = i;
          break;
        }
      }

      const atualizacao = {
        resultadoG1:
          numero,
        green:
          resultado.green,
        tipo:
          resultado.tipo,
        fase:
          resultado.green
            ? "G1"
            : "LOSS",
        aguardandoG1:
          false,
        semJogada:
          false
      };

      if (
        ultimo >= 0
      ) {
        lista[ultimo] = {
          ...lista[ultimo],
          ...atualizacao
        };
      } else {
        lista.push({
          resultado:
            numero,
          ...atualizacao
        });
      }

      return {
        timeline:
          lista.slice(
            -MAX_TIMELINE
          ),
        pendente: null,
        freeze: null
      };
    }

    if (
      !pendente ||
      pendente.historico !==
      chave
    ) {
      lista.push({
        resultado:
          numero,
        green: null,
        semJogada:
          true,
        fase: "SEM"
      });

      return {
        timeline:
          lista.slice(
            -MAX_TIMELINE
          ),
        pendente: null,
        freeze: null
      };
    }

    const resultado =
      classificar(
        numero,
        jogadaSnapshot(
          pendente
        )
      );

    if (
      resultado.green
    ) {
      lista.push({
        resultado:
          numero,
        green: true,
        tipo:
          resultado.tipo,
        semJogada:
          false,
        fase:
          "ENTRADA"
      });

      return {
        timeline:
          lista.slice(
            -MAX_TIMELINE
          ),
        pendente: null,
        freeze: null
      };
    }

    lista.push({
      resultado:
        numero,
      green: null,
      semJogada:
        false,
      aguardandoG1:
        true,
      fase:
        "ESPERA_G1"
    });

    return {
      timeline:
        lista.slice(
          -MAX_TIMELINE
        ),
      pendente: null,
      freeze: {
        ...pendente
      }
    };
  }

  function avaliarPendentes(
    numero
  ) {
    const chave =
      estado.historico.join(
        ","
      );

    const auto =
      avaliarLinha(
        numero,
        estado.pendentes.AUTO,
        estado.freezes.AUTO,
        estado.timelines.AUTO,
        chave
      );

    estado.timelines.AUTO =
      auto.timeline;

    estado.pendentes.AUTO =
      auto.pendente;

    estado.freezes.AUTO =
      auto.freeze;

    for (
      const motor
      of MOTORES
    ) {
      for (
        const rx
        of RX_LIST
      ) {
        const resultado =
          avaliarLinha(
            numero,
            estado.pendentes[
              motor
            ][rx],
            estado.freezes[
              motor
            ][rx],
            estado.timelines[
              motor
            ][rx],
            chave
          );

        estado.timelines[
          motor
        ][rx] =
          resultado.timeline;

        estado.pendentes[
          motor
        ][rx] =
          resultado.pendente;

        estado.freezes[
          motor
        ][rx] =
          resultado.freeze;
      }
    }
  }

  /*
   ============================================================
   JOGADOR VIRTUAL
   ============================================================

   Quando o número não está na jogada:
   - Identifica o número sorteado.
   - Identifica a dúzia.
   - Identifica a zona de quebra.
   - Mede a distância física até a cobertura.
   - Identifica o setor mais próximo.
   - Verifica se foi falha de primeira entrada.
   - Mantém o G1 separado.
   - Não altera a jogada retroativamente.
   ============================================================
  */

  function zonaDoNumero(
    numero
  ) {
    const zonas = [];

    for (
      let z = 1;
      z <= 3;
      z++
    ) {
      if (
        ZONAS_QUEBRA[
          z
        ].includes(
          numero
        )
      ) {
        zonas.push(z);
      }
    }

    return zonas;
  }

  function analisarFalha(
    numero,
    snap,
    historicoAnterior
  ) {
    if (!snap) {
      return {
        tipo:
          "SEM_JOGADA",
        numero,
        titulo:
          "AGUARDANDO HISTÓRICO",
        texto:
          "Ainda não havia uma jogada válida para avaliar.",
        detalhes: []
      };
    }

    const jogada =
      jogadaSnapshot(
        snap
      );

    const resultado =
      classificar(
        numero,
        jogada
      );

    const d =
      duzia(numero);

    const zonas =
      zonaDoNumero(
        numero
      );

    const cobertos =
      jogada.numeros;

    const vizinhoEsquerdo =
      TRACK[
        mod(
          pos(numero) - 1,
          37
        )
      ];

    const vizinhoDireito =
      TRACK[
        mod(
          pos(numero) + 1,
          37
        )
      ];

    const anterior =
      historicoAnterior.length
        ? historicoAnterior[
            historicoAnterior.length - 1
          ]
        : null;

    const deslocamento =
      anterior === null
        ? null
        : delta(
            anterior,
            numero
          );

    const detalhes = [];

    detalhes.push(
      "Número sorteado: " +
      numero
    );

    detalhes.push(
      "Dúzia: " +
      (
        d === 0
          ? "ZERO"
          : d + "ª"
      )
    );

    detalhes.push(
      "Motor utilizado: " +
      nomeMotor(
        snap.motor
      ) +
      " C" +
      snap.rx
    );

    detalhes.push(
      "Vizinhos físicos do resultado: " +
      vizinhoEsquerdo +
      " / " +
      vizinhoDireito
    );

    if (
      zonas.length
    ) {
      detalhes.push(
        "Zona de quebra: " +
        zonas.join(
          ", "
        )
      );
    } else {
      detalhes.push(
        "Fora das zonas de quebra cadastradas"
      );
    }

    if (
      anterior !== null
    ) {
      detalhes.push(
        "Último resultado anterior: " +
        anterior
      );

      detalhes.push(
        "Deslocamento físico: " +
        Math.abs(
          deslocamento
        ) +
        " posições"
      );
    }

    if (
      resultado.green
    ) {
      return {
        tipo:
          "ACERTO",
        numero,
        titulo:
          "ACERTO NA PRIMEIRA ENTRADA",
        texto:
          "O número " +
          numero +
          " estava dentro da cobertura da jogada.",
        detalhes: [
          ...detalhes,
          "Classificação: " +
          resultado.tipo,
          "Centro atingido: " +
          resultado.centro
        ]
      };
    }

    const faltou =
      resultado.gap ?? null;

    const centro =
      resultado.centro;

    const setor =
      jogada.blocos2.find(
        b =>
          b.centro ===
          centro
      ) ||
      jogada.blocos1.find(
        b =>
          b.centro ===
          centro
      );

    const margem =
      setor?.qtd ?? 0;

    const descobertos =
      TRACK.filter(
        n =>
          !cobertos.has(n)
      );

    detalhes.push(
      "Centro coberto mais próximo: " +
      (
        centro ??
        "NÃO IDENTIFICADO"
      )
    );

    detalhes.push(
      "Cobertura desse centro: ±" +
      margem +
      " vizinho(s)"
    );

    detalhes.push(
      "Distância até o centro: " +
      (
        resultado.distancia ??
        "—"
      )
    );

    detalhes.push(
      "Distância além da cobertura: " +
      (
        faltou ??
        "—"
      )
    );

    detalhes.push(
      "Números descobertos: " +
      descobertos.join(
        ", "
      )
    );

    let explicacao = "";

    if (
      faltou === 1
    ) {
      explicacao =
        "O resultado ficou imediatamente fora de um dos setores cobertos. " +
        "Faltou uma posição física para alcançar o número " +
        numero +
        ".";
    } else if (
      faltou === 2
    ) {
      explicacao =
        "O resultado ficou duas posições além da borda do setor mais próximo.";
    } else {
      explicacao =
        "O número sorteado estava em uma região descoberta pela configuração atual.";
    }

    if (
      zonas.length
    ) {
      explicacao +=
        " Ele também pertence à zona de quebra " +
        zonas.join(
          ", "
        ) +
        ".";
    }

    return {
      tipo:
        "FALHA_PRIMEIRA",
      numero,
      titulo:
        "POR QUE NÃO PEGOU DE PRIMEIRA?",
      texto:
        explicacao,
      detalhes,
      centro,
      distancia:
        resultado.distancia,
      faltou,
      zona:
        zonas,
      resultadoG1:
        null
    };
  }

  function atualizarDiagnosticoG1(
    numero,
    snap
  ) {
    const resultado =
      classificar(
        numero,
        jogadaSnapshot(
          snap
        )
      );

    const anterior =
      estado.diagnostico;

    if (
      !anterior ||
      anterior.tipo !==
        "FALHA_PRIMEIRA"
    ) {
      return;
    }

    const diagnostico = {
      ...anterior,
      resultadoG1:
        numero,
      greenG1:
        resultado.green
    };

    if (
      resultado.green
    ) {
      diagnostico.titulo =
        "PRIMEIRA FALHOU • G1 ACERTOU";

      diagnostico.texto +=
        " No G1, saiu " +
        numero +
        ", que estava na mesma cobertura congelada.";
    } else {
      diagnostico.titulo =
        "PRIMEIRA E G1 NÃO ACERTARAM";

      diagnostico.texto +=
        " No G1, saiu " +
        numero +
        ", também fora da cobertura congelada.";
    }

    diagnostico.detalhes = [
      ...anterior.detalhes,
      "Resultado do G1: " +
      numero,
      "G1: " +
      (
        resultado.green
          ? "ACERTO"
          : "ERRO"
      )
    ];

    estado.diagnostico =
      diagnostico;
  }

  /*
   ============================================================
   ENTRADA DOS NÚMEROS
   ============================================================
  */

  function adicionarNumero(
    numero
  ) {
    if (
      !Number.isInteger(numero) ||
      numero < 0 ||
      numero > 36
    ) {
      return;
    }

    const historicoAnterior =
      estado.historico.slice();

    const {
      configs,
      auto
    } = obterConfigs();

    prepararPendentes(
      configs,
      auto
    );

    const ativa =
      configAtiva(
        configs,
        auto
      );

    avaliarPendentes(
      numero
    );

    if (
      estado.visualFreeze
    ) {
      const snap =
        estado.visualFreeze;

      const resultado =
        classificar(
          numero,
          jogadaSnapshot(
            snap
          )
        );

      const ultimo =
        estado.visual[
          estado.visual.length - 1
        ];

      if (ultimo) {
        ultimo.g1 =
          numero;

        ultimo.green =
          resultado.green;

        ultimo.fase =
          resultado.green
            ? "G1"
            : "LOSS";
      }

      atualizarDiagnosticoG1(
        numero,
        snap
      );

      estado.visualFreeze =
        null;

    } else {
      const snap =
        snapshot(
          ativa
        );

      const resultado =
        snap
          ? classificar(
              numero,
              jogadaSnapshot(
                snap
              )
            )
          : null;

      estado.visual.push({
        resultado:
          numero,
        g1: null,
        green:
          resultado?.green
            ? true
            : null,
        semJogada:
          !snap,
        fase:
          !snap
            ? "SEM"
            : resultado.green
              ? "ENTRADA"
              : "ESPERA_G1"
      });

      estado.diagnostico =
        analisarFalha(
          numero,
          snap,
          historicoAnterior
        );

      if (
        resultado &&
        !resultado.green
      ) {
        estado.visualFreeze =
          snap;
      }
    }

    estado.ultimoNumero =
      numero;

    estado.historico.push(
      numero
    );

    estado.historico =
      estado.historico.slice(
        -MAX_HISTORICO
      );

    estado.visual =
      estado.visual.slice(
        -MAX_VISUAL
      );

    invalidarCache();
    salvar();
    agendarRender();
  }

  function reiniciarApontamentos() {
    const novo =
      criarEstado();

    estado.timelines =
      novo.timelines;

    estado.pendentes =
      novo.pendentes;

    estado.freezes =
      novo.freezes;

    estado.visual = [];

    estado.visualFreeze =
      null;

    estado.diagnostico =
      null;

    estado.ultimoNumero =
      null;

    invalidarCache();
  }

  function inserirHistorico() {
    const campo =
      document.getElementById(
        "entradaHistorico"
      );

    const encontrados =
      campo.value.match(
        /\b(?:[0-9]|[12][0-9]|3[0-6])\b/g
      );

    if (
      !encontrados
    ) {
      return;
    }

    estado.historico =
      limitarHistorico(
        encontrados.map(
          Number
        )
      );

    reiniciarApontamentos();

    campo.value = "";

    salvar();
    agendarRender();
  }

  function apagarUltimo() {
    if (
      !estado.historico.length
    ) {
      return;
    }

    estado.historico.pop();

    reiniciarApontamentos();

    salvar();
    agendarRender();
  }

  function apagarTudo() {
    if (
      !confirm(
        "Apagar todo o histórico?"
      )
    ) {
      return;
    }

    estado.historico = [];

    reiniciarApontamentos();

    salvar();
    agendarRender();
  }

  function selecionar(
    motor,
    rx
  ) {
    if (
      motor === "AUTO"
    ) {
      estado.modo =
        "AUTO";
    } else {
      estado.modo =
        "MANUAL";

      estado.motorManual =
        motor;

      estado.manualRX =
        rx;
    }

    salvar();
    agendarRender();
  }

  /*
   ============================================================
   INTERFACE
   ============================================================
  */

  document.body.innerHTML =
    "";

  document.body.style.cssText = `
    margin:0;
    background:#101014;
    color:#fff;
    font-family:Arial,sans-serif;
  `;

  const app =
    document.createElement(
      "div"
    );

  app.innerHTML = `
<style>
* {
  box-sizing: border-box;
}

body {
  background: #101014;
}

.app {
  max-width: 950px;
  margin: auto;
  padding: 8px;
}

h2 {
  text-align: center;
  font-size: 20px;
  margin: 8px 0;
  color: #fff;
}

.painel {
  background: #1b1c23;
  border: 1px solid #363843;
  border-radius: 11px;
  padding: 10px;
  margin-bottom: 9px;
}

.titulo {
  font-size: 10px;
  font-weight: 900;
  color: #aeb5c5;
  margin-bottom: 8px;
}

textarea {
  width: 100%;
  height: 60px;
  background: #101116;
  color: white;
  border: 1px solid #515666;
  border-radius: 7px;
  padding: 9px;
  resize: vertical;
}

button {
  font-family: Arial, sans-serif;
  font-weight: 900;
  cursor: pointer;
  touch-action: manipulation;
}

.botoes,
.modos {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 7px;
}

.btn {
  background: #333846;
  color: white;
  border: 1px solid #555e70;
  border-radius: 7px;
  padding: 9px 11px;
  font-size: 10px;
}

.btn.verde {
  background: #17643b;
}

.btn.red {
  background: #782a35;
}

.cabecalhoRecolher {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #232632;
  border: 1px solid #414756;
  border-radius: 8px;
  padding: 10px;
  color: white;
  text-align: left;
}

.cabecalhoRecolher strong {
  font-size: 11px;
}

.seta {
  color: #00d9ff;
  font-size: 15px;
}

.conteudoRecolher {
  margin-top: 8px;
}

.oculto {
  display: none !important;
}

.autoCompacto {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px;
  background: #111820;
  border: 1px solid #007d98;
  border-radius: 8px;
  margin-top: 7px;
}

.autoQuadrado {
  min-width: 53px;
  height: 42px;
  background: #007d98;
  border: 1px solid #00e5ff;
  border-radius: 8px;
  color: white;
  font-size: 12px;
  font-weight: 900;
}

.autoDescricao {
  flex: 1;
  min-width: 100px;
  font-size: 10px;
  font-weight: 900;
  color: #00e5ff;
}

.seletorGrupo {
  margin-top: 11px;
}

.seletorTitulo {
  font-size: 9px;
  color: #aeb5c5;
  font-weight: 900;
}

.modo {
  background: #262936;
  color: #c3c7d0;
  border: 1px solid #555c6b;
  border-radius: 7px;
  padding: 9px 12px;
  font-size: 11px;
}

.modo.ativo {
  background: #007d98;
  color: white;
  border-color: #00e5ff;
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

.resumo {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  margin-top: 10px;
}

.card {
  background: #101116;
  border: 1px solid #333947;
  border-radius: 7px;
  padding: 9px 5px;
  text-align: center;
}

.card small {
  display: block;
  font-size: 8px;
  color: #a4aab7;
}

.card strong {
  display: block;
  font-size: 18px;
  margin-top: 4px;
}

.duziasLinha {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.duziaCard {
  background: #101116;
  border: 1px solid #414653;
  border-radius: 7px;
  padding: 8px;
  text-align: center;
}

.duziaCard.forte {
  border-color: #00e676;
}

.duziaCard small {
  display: block;
  font-size: 8px;
  color: #aeb5c5;
}

.duziaCard strong {
  display: block;
  font-size: 17px;
  margin: 5px 0;
}

.duziaCard span {
  font-size: 8px;
  color: #aeb5c5;
}

.timelineSecao {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #363843;
}

.timelineTituloGrupo {
  font-size: 9px;
  font-weight: 900;
  color: #aeb5c5;
}

.timelineRow {
  display: grid;
  grid-template-columns: 70px minmax(0,1fr) 38px;
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
  width: 17px;
  min-width: 17px;
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
  min-height: 63px;
  border-radius: 7px;
  background: #272a34;
  border: 2px solid #555;
  display: flex;
  justify-content: center;
  position: relative;
  padding: 6px 3px 25px;
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
  width: 30px;
  height: 30px;
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
  font-size: 8px;
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

/*
  JOGADA ATUAL:
  SOMENTE 6 QUADRADOS HORIZONTAIS
*/

.jogadaStatus {
  display: block;
  font-size: 10px;
  font-weight: 900;
  color: #00e5ff;
  margin-bottom: 9px;
  line-height: 1.5;
}

.jogadaStatus.congelada {
  color: #ffc107;
}

.jogadaHorizontal {
  display: grid;
  grid-template-columns: repeat(6,minmax(0,1fr));
  gap: 5px;
  width: 100%;
}

.alvoQuadrado {
  aspect-ratio: 1 / 1;
  min-height: 45px;
  background: #006ca6;
  border: 2px solid #00cfff;
  border-radius: 9px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(16px,4vw,27px);
  font-weight: 900;
}

.alvoQuadrado.um {
  background: #b78300;
  border-color: #ffd54f;
  color: #111;
}

.alvoQuadrado.congelado {
  box-shadow: 0 0 0 1px #ffc107 inset;
}

.legendaJogada {
  display: flex;
  gap: 13px;
  align-items: center;
  margin-top: 9px;
  flex-wrap: wrap;
  font-size: 9px;
  color: #aeb5c5;
}

.legendaCor {
  display: inline-block;
  width: 11px;
  height: 11px;
  border-radius: 3px;
  margin-right: 4px;
  vertical-align: middle;
}

.legendaCor.azul {
  background: #0089cf;
}

.legendaCor.amarelo {
  background: #ffc107;
}

.teclado {
  display: grid;
  grid-template-columns: repeat(6,1fr);
  gap: 5px;
}

.numero {
  height: 43px;
  border: 1px solid #666;
  border-radius: 6px;
  color: white;
  font-size: 13px;
}

.zero {
  grid-column: span 6;
}

/*
  JOGADOR VIRTUAL
*/

.virtualCabecalho {
  display: flex;
  align-items: center;
  gap: 9px;
}

.virtualAvatar {
  width: 39px;
  height: 39px;
  background: #133e50;
  border: 1px solid #00d9ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.virtualTitulo {
  font-size: 13px;
  font-weight: 900;
  color: #00d9ff;
}

.virtualSubtitulo {
  font-size: 9px;
  color: #aeb5c5;
  margin-top: 3px;
}

.virtualStatus {
  padding: 9px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 900;
  margin-top: 10px;
  line-height: 1.5;
}

.virtualStatus.green {
  background: #123b2b;
  color: #00e676;
  border: 1px solid #008e52;
}

.virtualStatus.loss {
  background: #451d25;
  color: #ff6c78;
  border: 1px solid #a33142;
}

.virtualStatus.wait {
  background: #373015;
  color: #ffd54f;
  border: 1px solid #977c20;
}

.virtualTexto {
  background: #11141b;
  border: 1px solid #363b48;
  border-radius: 8px;
  padding: 11px;
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: #e4e8f0;
}

.virtualDetalhes {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  gap: 5px;
  margin-top: 9px;
}

.virtualDetalhe {
  background: #12151d;
  border: 1px solid #333b4a;
  border-radius: 6px;
  padding: 8px;
  font-size: 10px;
  line-height: 1.5;
  color: #c5cedc;
}

.status {
  font-size: 10px;
  font-weight: 900;
  color: #00e676;
  margin-top: 8px;
  line-height: 1.6;
}

@media(max-width:600px) {
  .resumo {
    grid-template-columns: repeat(2,1fr);
  }

  .duplas14 {
    grid-template-columns: repeat(4,1fr);
  }

  .timelineRow {
    grid-template-columns: 63px minmax(0,1fr) 34px;
  }

  .gl {
    width: 15px;
    min-width: 15px;
    height: 17px;
    font-size: 7px;
  }

  .alvoQuadrado {
    min-height: 42px;
    border-radius: 6px;
  }

  .jogadaHorizontal {
    gap: 4px;
  }

  .virtualDetalhes {
    grid-template-columns: 1fr;
  }
}
</style>

<div class="app">

  <h2>ANÁLISE BETA</h2>

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
      <strong>
        AUTO • 12 CANDIDATOS
      </strong>

      <span
        id="setaCandidatos"
        class="seta"
      >
        +
      </span>
    </button>

    <div
      id="autoCompacto"
      class="autoCompacto"
    >
      <button
        id="btnAUTO"
        class="autoQuadrado"
      >
        AUTO
      </button>

      <div
        id="autoDescricao"
        class="autoDescricao"
      >
        AGUARDANDO
      </div>
    </div>

    <div
      id="conteudoCandidatos"
      class="conteudoRecolher oculto"
    >

      ${[
        [
          "NORMAL",
          "NORMAL • DÚZIAS FÍSICAS",
          "N",
          ""
        ],
        [
          "DINAMICO",
          "DINÂMICO • DÚZIAS FÍSICAS",
          "D",
          "dinamico"
        ],
        [
          "RX_NORMAL",
          "RAIO-X NORMAL",
          "RN",
          "raiox"
        ],
        [
          "RX_DINAMICO",
          "RAIO-X DINÂMICO",
          "RD",
          "raiox dinamico"
        ]
      ].map(
        ([
          motor,
          nome,
          prefixo,
          classe
        ]) => `
          <div class="seletorGrupo">

            <div class="seletorTitulo">
              ${nome}
            </div>

            <div class="modos">

              ${RX_LIST.map(
                rx => `
                  <button
                    id="btn${prefixo}${rx}"
                    class="modo ${classe}"
                  >
                    ${prefixo.startsWith("R") ? "RX " : ""}C${rx}
                  </button>
                `
              ).join("")}

            </div>

          </div>
        `
      ).join("")}

      <div
        id="resumo"
        class="resumo"
      ></div>

      <div class="timelineSecao">

        <div class="timelineTituloGrupo">
          CONCENTRAÇÃO FÍSICA DAS DÚZIAS
        </div>

        <div
          id="duzias"
          class="duziasLinha"
        ></div>

      </div>

    </div>

  </div>

  <div class="painel">

    <button
      id="recolherTimelines"
      class="cabecalhoRecolher"
    >
      <strong>
        LINHAS DO TEMPO
      </strong>

      <span
        id="setaTimelines"
        class="seta"
      >
        +
      </span>
    </button>

    <div class="timelineSecao">

      <div class="timelineTituloGrupo">
        AUTO
      </div>

      <div
        id="timelineAUTO"
        class="timelineRow"
      ></div>

    </div>

    <div
      id="conteudoTimelines"
      class="oculto"
    >

      ${[
        [
          "NORMAL",
          "N"
        ],
        [
          "DINÂMICO",
          "D"
        ],
        [
          "RAIO-X NORMAL",
          "RN"
        ],
        [
          "RAIO-X DINÂMICO",
          "RD"
        ]
      ].map(
        ([nome, prefixo]) => `
          <div class="timelineSecao">

            <div class="timelineTituloGrupo">
              ${nome}
            </div>

            ${RX_LIST.map(
              rx => `
                <div
                  id="timeline${prefixo}${rx}"
                  class="timelineRow"
                ></div>
              `
            ).join("")}

          </div>
        `
      ).join("")}

    </div>

  </div>

  <div class="painel">

    <div class="titulo">
      ÚLTIMAS 14 JOGADAS
    </div>

    <div
      id="ultimos14"
      class="duplas14"
    ></div>

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

    <div
      id="teclado"
      class="teclado"
    ></div>

  </div>

  <div class="painel">

    <button
      id="recolherVirtual"
      class="cabecalhoRecolher"
    >
      <div class="virtualCabecalho">

        <div class="virtualAvatar">
          🤖
        </div>

        <div>
          <div class="virtualTitulo">
            JOGADOR VIRTUAL
          </div>

          <div class="virtualSubtitulo">
            ANÁLISE DA PRIMEIRA ENTRADA E G1
          </div>
        </div>

      </div>

      <span
        id="setaVirtual"
        class="seta"
      >
        −
      </span>

    </button>

    <div
      id="conteudoVirtual"
    >

      <div
        id="virtualStatus"
        class="virtualStatus wait"
      >
        AGUARDANDO RESULTADO
      </div>

      <div
        id="virtualTexto"
        class="virtualTexto"
      >
        Insira um número no teclado para iniciar a análise.
      </div>

      <div
        id="virtualDetalhes"
        class="virtualDetalhes"
      ></div>

    </div>

  </div>

</div>
`;

  document.body.appendChild(
    app
  );

  /*
   ============================================================
   EVENTOS
   ============================================================
  */

  document.getElementById(
    "inserir"
  ).onclick =
    inserirHistorico;

  document.getElementById(
    "apagar"
  ).onclick =
    apagarUltimo;

  document.getElementById(
    "limpar"
  ).onclick =
    apagarTudo;

  document.getElementById(
    "btnAUTO"
  ).onclick = () =>
    selecionar(
      "AUTO"
    );

  for (
    const motor
    of MOTORES
  ) {
    for (
      const rx
      of RX_LIST
    ) {
      document.getElementById(
        "btn" +
        PREFIXOS[motor] +
        rx
      ).onclick = () =>
        selecionar(
          motor,
          rx
        );
    }
  }

  document.getElementById(
    "recolherCandidatos"
  ).onclick = () => {
    estado.painelCandidatosAberto =
      !estado.painelCandidatosAberto;

    salvar();
    renderPaineis();
  };

  document.getElementById(
    "recolherTimelines"
  ).onclick = () => {
    estado.painelTimelinesAberto =
      !estado.painelTimelinesAberto;

    salvar();
    renderPaineis();
  };

  document.getElementById(
    "recolherVirtual"
  ).onclick = () => {
    estado.jogadorVirtualAberto =
      !estado.jogadorVirtualAberto;

    salvar();
    renderPaineis();
  };

  /*
   ============================================================
   TECLADO
   ============================================================
  */

  const teclado =
    document.getElementById(
      "teclado"
    );

  for (
    let numero = 1;
    numero <= 36;
    numero++
  ) {
    const botao =
      document.createElement(
        "button"
      );

    botao.className =
      "numero";

    botao.textContent =
      numero;

    botao.style.background =
      corNumero(numero);

    botao.onclick = () =>
      adicionarNumero(
        numero
      );

    teclado.appendChild(
      botao
    );
  }

  const zero =
    document.createElement(
      "button"
    );

  zero.className =
    "numero zero";

  zero.textContent =
    "0";

  zero.style.background =
    corNumero(0);

  zero.onclick = () =>
    adicionarNumero(0);

  teclado.appendChild(
    zero
  );

  /*
   ============================================================
   PAINÉIS RECOLHÍVEIS
   ============================================================
  */

  function renderPaineis() {
    const candidatos =
      document.getElementById(
        "conteudoCandidatos"
      );

    const timelines =
      document.getElementById(
        "conteudoTimelines"
      );

    const virtual =
      document.getElementById(
        "conteudoVirtual"
      );

    candidatos.classList.toggle(
      "oculto",
      !estado.painelCandidatosAberto
    );

    timelines.classList.toggle(
      "oculto",
      !estado.painelTimelinesAberto
    );

    virtual.classList.toggle(
      "oculto",
      !estado.jogadorVirtualAberto
    );

    document.getElementById(
      "setaCandidatos"
    ).textContent =
      estado.painelCandidatosAberto
        ? "−"
        : "+";

    document.getElementById(
      "setaTimelines"
    ).textContent =
      estado.painelTimelinesAberto
        ? "−"
        : "+";

    document.getElementById(
      "setaVirtual"
    ).textContent =
      estado.jogadorVirtualAberto
        ? "−"
        : "+";
  }

  /*
   ============================================================
   TIMELINES
   ============================================================
  */

  function renderTimeline(
    id,
    nome,
    lista
  ) {
    const itens =
      (lista || []).slice(
        -MAX_TIMELINE
      );

    const validos =
      itens.filter(
        item =>
          !item.semJogada &&
          !item.aguardandoG1 &&
          typeof item.green ===
            "boolean"
      );

    const taxa =
      validos.length
        ? validos.filter(
            x => x.green
          ).length /
          validos.length * 100
        : null;

    const html =
      itens.map(
        item => {
          if (
            item.semJogada
          ) {
            return `
              <span class="gl sem">
                —
              </span>
            `;
          }

          if (
            item.aguardandoG1
          ) {
            return `
              <span class="gl wait">
                …
              </span>
            `;
          }

          if (
            item.green &&
            item.fase ===
              "G1"
          ) {
            return `
              <span class="gl g1">
                G1
              </span>
            `;
          }

          if (
            item.green
          ) {
            return `
              <span class="gl green">
                G
              </span>
            `;
          }

          return `
            <span class="gl loss">
              L
            </span>
          `;
        }
      ).join("");

    document.getElementById(
      id
    ).innerHTML = `
      <div class="nomeTL">
        ${nome}
      </div>

      <div class="timeline">
        ${html}
      </div>

      <div class="taxaTL">
        ${taxa === null
          ? "—"
          : taxa.toFixed(0) + "%"
        }
      </div>
    `;
  }

  /*
   ============================================================
   JOGADA HORIZONTAL
   ============================================================

   EXEMPLO VISUAL:

   [30] [24] [11] [06] [19] [33]

   AZUL:
   Centro + 2 vizinhos de cada lado.

   AMARELO:
   Centro + 1 vizinho de cada lado.

   Não exibe os números vizinhos.
   Apenas o centro.
   ============================================================
  */

  function renderJogada(
    config,
    congelada
  ) {
    const area =
      document.getElementById(
        "jogada"
      );

    if (
      !config?.valido ||
      !config.jogada?.valido
    ) {
      area.innerHTML = `
        <div class="jogadaStatus">
          AGUARDANDO JOGADA VÁLIDA
        </div>
      `;

      return;
    }

    const blocos = [
      ...config.jogada.blocos2.map(
        b => ({
          ...b,
          um: false
        })
      ),
      ...config.jogada.blocos1.map(
        b => ({
          ...b,
          um: true
        })
      )
    ];

    blocos.sort(
      (a, b) => {
        const regA =
          ORDEM_REGIOES.indexOf(
            regiao(
              a.centro
            )
          );

        const regB =
          ORDEM_REGIOES.indexOf(
            regiao(
              b.centro
            )
          );

        return (
          regA - regB ||
          pos(a.centro) -
          pos(b.centro)
        );
      }
    );

    const status =
      congelada
        ? "G1 • JOGADA CONGELADA"
        : "JOGADA ATUAL";

    area.innerHTML = `
      <div
        class="jogadaStatus ${congelada ? "congelada" : ""}"
      >
        ${status}
        • ${nomeMotor(config.motor)}
        • C${config.rx}
        • ${alvoRX(config.rx)}ª DÚZIA
      </div>

      <div class="jogadaHorizontal">

        ${blocos.map(
          bloco => `
            <div
              class="alvoQuadrado
              ${bloco.um ? "um" : ""}
              ${congelada ? "congelado" : ""}"
              title="${bloco.um ? "1 vizinho" : "2 vizinhos"}"
            >
              ${bloco.centro}
            </div>
          `
        ).join("")}

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

        <span>
          28 NÚMEROS COBERTOS
        </span>

      </div>
    `;
  }

  /*
   ============================================================
   ÚLTIMOS 14
   ============================================================
  */

  function renderUltimos() {
    const area =
      document.getElementById(
        "ultimos14"
      );

    area.innerHTML =
      estado.visual
        .slice(-MAX_VISUAL)
        .map(
          item => {
            const classe =
              item.semJogada
                ? "sem"
                : item.fase ===
                    "ESPERA_G1"
                  ? "wait"
                  : item.fase ===
                      "G1"
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
              <div
                class="dupla14 ${classe}"
              >

                <div
                  class="bolaDupla"
                  style="background:${corNumero(item.resultado)}"
                >
                  ${item.resultado}
                </div>

                <div
                  class="resultadoEntrada ${classe}"
                >
                  ${textos[classe]}

                  ${item.g1 == null
                    ? ""
                    : " • " + item.g1
                  }
                </div>

              </div>
            `;
          }
        ).join("");
  }

  /*
   ============================================================
   RENDER JOGADOR VIRTUAL
   ============================================================
  */

  function renderVirtual() {
    const diagnostico =
      estado.diagnostico;

    const status =
      document.getElementById(
        "virtualStatus"
      );

    const texto =
      document.getElementById(
        "virtualTexto"
      );

    const detalhes =
      document.getElementById(
        "virtualDetalhes"
      );

    if (!diagnostico) {
      status.className =
        "virtualStatus wait";

      status.textContent =
        "AGUARDANDO RESULTADO";

      texto.textContent =
        "Quando você clicar em um número, vou comparar o resultado com a jogada que estava ativa antes do sorteio.";

      detalhes.innerHTML =
        "";

      return;
    }

    const acertou =
      diagnostico.tipo ===
        "ACERTO" ||
      diagnostico.greenG1 ===
        true;

    const aguardando =
      diagnostico.tipo ===
        "SEM_JOGADA";

    status.className =
      "virtualStatus " +
      (
        aguardando
          ? "wait"
          : acertou
            ? "green"
            : "loss"
      );

    status.textContent =
      diagnostico.titulo;

    texto.textContent =
      diagnostico.texto;

    detalhes.innerHTML =
      (diagnostico.detalhes || [])
        .map(
          detalhe => {
            const div =
              document.createElement(
                "div"
              );

            div.className =
              "virtualDetalhe";

            div.textContent =
              detalhe;

            return div.outerHTML;
          }
        ).join("");
  }

  /*
   ============================================================
   RENDER OTIMIZADO
   ============================================================
  */

  let renderPendente =
    false;

  function agendarRender() {
    if (
      renderPendente
    ) {
      return;
    }

    renderPendente =
      true;

    setTimeout(
      () => {
        renderPendente =
          false;

        render();
      },
      0
    );
  }

  function render() {
    const base =
      estado.historico;

    const {
      configs,
      auto,
      analise
    } = obterConfigs();

    prepararPendentes(
      configs,
      auto
    );

    const ativa =
      configAtiva(
        configs,
        auto
      );

    /*
      SELEÇÃO DOS BOTÕES
    */

    const ids = [
      "btnAUTO"
    ];

    for (
      const motor
      of MOTORES
    ) {
      for (
        const rx
        of RX_LIST
      ) {
        ids.push(
          "btn" +
          PREFIXOS[motor] +
          rx
        );
      }
    }

    for (
      const id
      of ids
    ) {
      document.getElementById(
        id
      ).classList.remove(
        "ativo"
      );
    }

    if (
      estado.modo ===
      "AUTO"
    ) {
      document.getElementById(
        "btnAUTO"
      ).style.background =
        "#007d98";

      document.getElementById(
        "btnAUTO"
      ).style.borderColor =
        "#00e5ff";

    } else {
      document.getElementById(
        "btnAUTO"
      ).style.background =
        "#303744";

      document.getElementById(
        "btnAUTO"
      ).style.borderColor =
        "#555c6b";

      const idAtivo =
        "btn" +
        PREFIXOS[
          estado.motorManual
        ] +
        estado.manualRX;

      document.getElementById(
        idAtivo
      ).classList.add(
        "ativo"
      );
    }

    /*
      AUTO COMPACTO
    */

    document.getElementById(
      "autoDescricao"
    ).textContent =
      auto
        ? (
            nomeMotor(
              auto.motor
            ) +
            " • C" +
            auto.rx +
            " • " +
            auto.alvoDuzia +
            "ª DÚZIA"
          )
        : "AGUARDANDO JOGADAS";

    /*
      RESUMO
    */

    const live =
      estatisticas(
        estado.timelines.AUTO
      );

    document.getElementById(
      "resumo"
    ).innerHTML =
      [
        [
          "REAL 5",
          live.total
            ? live.taxa5
            : null
        ],
        [
          "REAL 10",
          live.total
            ? live.taxa10
            : null
        ],
        [
          "REAL 20",
          live.total
            ? live.taxa20
            : null
        ],
        [
          "PERDAS",
          live.perdas
        ]
      ].map(
        ([nome, valor]) => `
          <div class="card">

            <small>
              ${nome}
            </small>

            <strong>
              ${valor === null
                ? "—"
                : nome === "PERDAS"
                  ? valor
                  : valor.toFixed(0) + "%"
              }
            </strong>

          </div>
        `
      ).join("");

    /*
      DÚZIAS
    */

    document.getElementById(
      "duzias"
    ).innerHTML =
      analise.ranking.map(
        (item, i) => `
          <div
            class="duziaCard ${i === 0 ? "forte" : ""}"
          >

            <small>
              ${item.duzia}ª DÚZIA
            </small>

            <strong>
              ${(item.intensidade * 100).toFixed(0)}%
            </strong>

            <span>
              ${item.contagem}/20
              • QUEBRA
              ${item.quebra.toFixed(1)}
            </span>

          </div>
        `
      ).join("");

    /*
      TIMELINES
    */

    renderTimeline(
      "timelineAUTO",
      "AUTO",
      estado.timelines.AUTO
    );

    for (
      const motor
      of MOTORES
    ) {
      for (
        const rx
        of RX_LIST
      ) {
        renderTimeline(
          "timeline" +
          PREFIXOS[motor] +
          rx,
          motor.startsWith(
            "RX"
          )
            ? "RX C" + rx
            : "C" + rx,
          estado.timelines[
            motor
          ][rx]
        );
      }
    }

    /*
      JOGADA
    */

    const freeze =
      estado.modo ===
        "AUTO"
        ? estado.freezes.AUTO
        : estado.freezes[
            estado.motorManual
          ][
            estado.manualRX
          ];

    let configExibida =
      ativa;

    if (freeze) {
      configExibida = {
        valido: true,
        motor:
          freeze.motor,
        rx:
          freeze.rx,
        jogada:
          jogadaSnapshot(
            freeze
          )
      };
    }

    renderJogada(
      configExibida,
      !!freeze
    );

    /*
      HISTÓRICO E VIRTUAL
    */

    renderUltimos();

    renderVirtual();

    /*
      STATUS
    */

    const validos = [];

    for (
      const motor
      of MOTORES
    ) {
      for (
        const rx
        of RX_LIST
      ) {
        const config =
          configs[motor][rx];

        if (
          config?.valido
        ) {
          validos.push(
            config
          );
        }
      }
    }

    const diferentes =
      new Set(
        validos.map(
          config =>
            config.assinatura
        )
      ).size;

    const dominante =
      analise.ranking[0];

    document.getElementById(
      "status"
    ).textContent =
      base.length +
      "/20" +
      " • 12 MOTORES" +
      " • " +
      validos.length +
      "/12 VÁLIDOS" +
      " • " +
      diferentes +
      " JOGADAS DIFERENTES" +
      " • 28 NÚMEROS" +
      " • SEM SOBREPOSIÇÃO" +
      " • CONCENTRAÇÃO " +
      dominante.duzia +
      "ª DÚZIA" +
      (
        freeze
          ? " • G1 CONGELADO"
          : ""
      );

    renderPaineis();

    salvar();
  }

  /*
   ============================================================
   INICIALIZAÇÃO
   ============================================================
  */

  agendarRender();

})();
