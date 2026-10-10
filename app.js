
(function () {
  "use strict";

  /*
   ANÁLISE BETA V3.3

   AUTO:
   1. Ordena pontuações da MAIOR para a MENOR.
   2. Escolhe o SEGUNDO colocado.
   3. Mantém o TERCEIRO como alternativa.
   4. Não altera a escolha após o resultado.

   12 motores independentes.
   13 linhas do tempo (AUTO + 12).
   G1 congelado.
   Jogador virtual com auditoria da escolha.
   5 centros com 2 vizinhos.
   1 centro com 1 vizinho.
   Total de 28 números sem sobreposição.
   Sem buracos isolados.
  */

  const STORAGE = "ANALISE_BETA_V33";
  const MAX = 20;

  const TRACK = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const RED = new Set([
    1,3,5,7,9,12,14,16,18,
    19,21,23,25,27,30,32,34,36
  ]);

  const MOTORES = [
    "NORMAL",
    "DINAMICO",
    "RX_NORMAL",
    "RX_DINAMICO"
  ];

  const RXS = [4,5,6];

  const PREFIXO = {
    NORMAL:"N",
    DINAMICO:"D",
    RX_NORMAL:"RN",
    RX_DINAMICO:"RD"
  };

  const NOMES = {
    NORMAL:"NORMAL",
    DINAMICO:"DINÂMICO",
    RX_NORMAL:"RAIO-X",
    RX_DINAMICO:"RAIO-X DINÂMICO"
  };

  const ZONAS = {
    1:[13,14,15,16,17,18],
    2:[0,26,3,35,28,7,6,30],
    3:[23,10,24,20,22,21,4,19]
  };

  const GRUPOS = {
    1:[
      [3,12,7],
      [4,2,21],
      [11,8,5],
      [6,1,9]
    ],
    2:[
      [13,36,11,30,8],
      [23,10,5,24,16],
      [15,19,17,14,20,18]
    ],
    3:[
      [25,17,34,6,27],
      [32,15,19,4,21],
      [29,7,28,12,35,3,26],
      [31,9,22,18,33]
    ]
  };

  const REGIOES = {
    VOISINS:new Set([
      19,4,21,2,25,28,7,29,18,22
    ]),
    ZERO:new Set([
      0,32,15,26,3,35,12
    ]),
    TIERS:new Set([
      27,13,36,11,30,8,
      23,10,5,24,16,33
    ]),
    ORPHELINS:new Set([
      9,31,14,20,1,17,6,34
    ])
  };

  const ORDEM = [
    "VOISINS",
    "ZERO",
    "TIERS",
    "ORPHELINS",
    "OUTROS"
  ];

  const IDX = new Map(
    TRACK.map((n,i) => [n,i])
  );

  const mod = (n,m) => ((n % m) + m) % m;

  const pos = n => IDX.get(n) ?? -1;

  function distancia(a,b) {
    const d = Math.abs(pos(a)-pos(b));
    return Math.min(d,37-d);
  }

  function delta(a,b) {
    let d = mod(pos(b)-pos(a),37);
    return d > 18 ? d-37 : d;
  }

  function vizinhos(n,q) {
    const p = pos(n);
    if(p < 0) return [];

    return Array.from(
      {length:q*2+1},
      (_,i) => TRACK[mod(p+i-q,37)]
    );
  }

  function duzia(n) {
    return n === 0 ? 0 :
      n <= 12 ? 1 :
      n <= 24 ? 2 : 3;
  }

  function regiao(n) {
    return Object.keys(REGIOES).find(
      r => REGIOES[r].has(n)
    ) || "OUTROS";
  }

  function cor(n) {
    return n === 0 ? "#087c48" :
      RED.has(n) ? "#c6283d" : "#181818";
  }

  function formatar(n) {
    return Number(n || 0)
      .toFixed(2)
      .replace(".",",");
  }

  function limitar(a) {
    return Array.isArray(a)
      ? a.map(Number).filter(
          n => Number.isInteger(n) &&
          n >= 0 && n <= 36
        ).slice(-MAX)
      : [];
  }

  function estrutura(valor) {
    const obj = {AUTO:valor};

    for(const m of MOTORES) {
      obj[m] = {};
      for(const rx of RXS) {
        obj[m][rx] = valor;
      }
    }

    return obj;
  }

  function novoEstado() {
    const timelines = estrutura(null);

    timelines.AUTO = [];

    for(const m of MOTORES) {
      for(const rx of RXS) {
        timelines[m][rx] = [];
      }
    }

    return {
      historico:[],
      modo:"AUTO",
      motorManual:"NORMAL",
      manualRX:4,
      timelines,
      pendentes:estrutura(null),
      freezes:estrutura(null),
      visual:[],
      visualFreeze:null,
      diagnostico:null,
      candidatosAbertos:false,
      timelinesAbertas:false,
      virtualAberto:true
    };
  }

  let estado = novoEstado();

  function carregar() {
    try {
      const chaves = [
        STORAGE,
        "ANALISE_BETA_DUZIAS_RX_12_V32",
        "ANALISE_BETA_VIRTUAL_V3"
      ];

      let salvo = null;

      for(const chave of chaves) {
        const raw = localStorage.getItem(chave);

        if(raw) {
          salvo = JSON.parse(raw);
          break;
        }
      }

      if(!salvo) return;

      estado.historico = limitar(salvo.historico);

      estado.modo =
        salvo.modo === "MANUAL"
          ? "MANUAL" : "AUTO";

      if(MOTORES.includes(salvo.motorManual)) {
        estado.motorManual = salvo.motorManual;
      }

      if(RXS.includes(salvo.manualRX)) {
        estado.manualRX = salvo.manualRX;
      }

      for(const m of MOTORES) {
        for(const rx of RXS) {
          const tl = salvo.timelines?.[m]?.[rx];

          if(Array.isArray(tl)) {
            estado.timelines[m][rx] =
              tl.slice(-MAX);
          }

          estado.pendentes[m][rx] =
            salvo.pendentes?.[m]?.[rx] || null;

          estado.freezes[m][rx] =
            salvo.freezes?.[m]?.[rx] || null;
        }
      }

      if(Array.isArray(salvo.timelines?.AUTO)) {
        estado.timelines.AUTO =
          salvo.timelines.AUTO.slice(-MAX);
      }

      estado.pendentes.AUTO =
        salvo.pendentes?.AUTO || null;

      estado.freezes.AUTO =
        salvo.freezes?.AUTO || null;

      estado.visual =
        Array.isArray(salvo.visual)
          ? salvo.visual.slice(-14) : [];

      estado.visualFreeze =
        salvo.visualFreeze || null;

      estado.diagnostico =
        salvo.diagnostico || null;

      estado.candidatosAbertos =
        !!salvo.candidatosAbertos;

      estado.timelinesAbertas =
        !!(
          salvo.timelinesAbertas ||
          salvo.linhasAbertas ||
          salvo.painelTimelinesAberto
        );

      estado.virtualAberto =
        salvo.virtualAberto !== false &&
        salvo.jogadorVirtualAberto !== false;

    } catch(e) {
      console.warn("Falha ao carregar:",e);
    }
  }

  function salvar() {
    try {
      localStorage.setItem(
        STORAGE,
        JSON.stringify(estado)
      );
    } catch(e) {
      console.warn("Falha ao salvar:",e);
    }
  }

  carregar();

  // ANÁLISE FÍSICA

  function analisarFisica(base) {
    const calor = new Float64Array(37);
    const cont = [0,0,0,0];
    const forca = [0,0,0,0];
    const quebra = [0,0,0,0];

    const pesos = [1,.78,.52,.29,.14,.06];

    base.forEach((n,i) => {
      const peso =
        .45 + .55*(i+1)/Math.max(1,base.length);

      const d = duzia(n);

      if(d) {
        cont[d]++;
        forca[d] += peso;
      }

      for(let z=1;z<=3;z++) {
        if(ZONAS[z].includes(n)) {
          quebra[z] += peso;
        }
      }

      for(let j=0;j<37;j++) {
        const dist = distancia(n,TRACK[j]);

        if(dist <= 5) {
          calor[j] += pesos[dist]*peso;
        }
      }
    });

    const info = {};

    for(let z=1;z<=3;z++) {
      const nums = [...new Set(GRUPOS[z].flat())];

      const fisica =
        nums.reduce(
          (s,n) => s+calor[pos(n)],0
        )/nums.length;

      info[z] = {
        duzia:z,
        contagem:cont[z],
        fisica,
        quebra:quebra[z],
        score:
          forca[z]*.46 +
          fisica*.40 +
          quebra[z]*.14
      };
    }

    const maior = Math.max(
      .00001,
      info[1].score,
      info[2].score,
      info[3].score
    );

    return {
      calor,
      info,
      ranking:[1,2,3].map(z => ({
        ...info[z],
        intensidade:info[z].score/maior
      })).sort((a,b) => b.score-a.score),
      maxCalor:Math.max(.00001,...calor)
    };
  }

  function contagemFisica(base,rx) {
    const mapa = new Float64Array(37);
    const decay = {4:.78,5:.82,6:.86}[rx];
    const pesos = [1,.72,.44,.22,.10];

    let peso = 1;

    for(let i=base.length-1;i>=0;i--) {
      for(let j=0;j<37;j++) {
        const d = distancia(base[i],TRACK[j]);

        if(d <= 4) {
          mapa[j] += pesos[d]*peso;
        }
      }

      peso *= decay;
    }

    const maior = Math.max(.00001,...mapa);

    return mapa.map(v => v/maior);
  }

  function analisarRX(base,rx) {
    const freq = new Float64Array(37);

    if(base.length < rx*2+4) {
      return {
        valido:false,
        freq,
        similaridade:0
      };
    }

    const atual = base.slice(-rx);
    const candidatos = [];

    for(let i=0;i+rx<base.length-rx;i++) {
      let score = 0;

      for(let k=0;k<rx;k++) {
        score +=
          (
            duzia(base[i+k]) === duzia(atual[k])
              ? .7 : 0
          ) +
          .3*Math.max(
            0,
            1-distancia(base[i+k],atual[k])/19
          );
      }

      candidatos.push({
        n:base[i+rx],
        score:score/rx,
        i
      });
    }

    candidatos.sort(
      (a,b) => b.score-a.score || b.i-a.i
    );

    const escolhidos = candidatos.slice(
      0,
      Math.max(4,Math.ceil(candidatos.length*.3))
    );

    const pesos = [1,.7,.42,.18];

    for(const item of escolhidos) {
      for(let j=0;j<37;j++) {
        const d = distancia(item.n,TRACK[j]);

        if(d <= 3) {
          freq[j] +=
            pesos[d]*(.4+.6*item.score);
        }
      }
    }

    const maior = Math.max(.00001,...freq);

    return {
      valido:escolhidos.length > 0,
      freq:freq.map(v => v/maior),
      similaridade:
        escolhidos.reduce(
          (s,x) => s+x.score,0
        )/Math.max(1,escolhidos.length)*100
    };
  }

  // PONTUAÇÃO DOS MOTORES

  function pontuar(base,motor,rx,analise,cont,raioX) {
    const usaRX = motor.startsWith("RX");
    const dinamico = motor.includes("DINAMICO");

    if(usaRX && !raioX.valido) {
      return null;
    }

    const alvo = rx-3;
    const scores = new Float64Array(37);

    for(let j=0;j<37;j++) {
      const numero = TRACK[j];

      const principal =
        duzia(numero) === alvo ? 1 : 0;

      let proximidade = 0;

      for(const grupo of GRUPOS[alvo]) {
        for(const n of grupo) {
          const d = distancia(numero,n);

          const peso =
            d === 0 ? 1 :
            d === 1 ? .75 :
            d === 2 ? .45 :
            d === 3 ? .20 : 0;

          proximidade = Math.max(
            proximidade,peso
          );
        }
      }

      const quebra = ZONAS[alvo].some(
        n => distancia(numero,n) <= 2
      ) ? 1 : 0;

      const fisica =
        analise.calor[j]/analise.maxCalor;

      let score =
        principal*.52 +
        proximidade*.48 +
        fisica*.24 +
        quebra*.22 +
        cont[j]*.22;

      if(usaRX) {
        score =
          principal*.42 +
          proximidade*.38 +
          fisica*.22 +
          quebra*.18 +
          cont[j]*.12 +
          raioX.freq[j]*.34;
      }

      if(dinamico) {
        const ultimos = base.slice(-rx);

        let direcao = 0;
        let total = 0;

        ultimos.forEach((n,i) => {
          const d = delta(numero,n);

          if(Math.abs(d) <= 7) {
            const peso = (i+1)/ultimos.length;
            direcao += Math.sign(d)*peso;
            total += peso;
          }
        });

        if(total) {
          score += Math.abs(direcao/total)*.11;
        }
      }

      scores[j] = score;
    }

    return {
      scores,
      similaridade:raioX.similaridade || 0
    };
  }

  // MODELOS GEOMÉTRICOS PRÉ-CALCULADOS

  const PADROES = [];

  function gerarGaps(restante,atual) {
    if(atual.length === 6) {
      if(restante === 0) {
        PADROES.push(atual.slice());
      }
      return;
    }

    for(let gap=0;gap<=restante;gap++) {
      if(gap === 1) continue;

      atual.push(gap);
      gerarGaps(restante-gap,atual);
      atual.pop();
    }
  }

  gerarGaps(9,[]);

  const MODELOS = [];

  function prepararModelos() {
    const usadas = new Set();

    for(let inicio=0;inicio<37;inicio++) {
      for(let p3=0;p3<6;p3++) {
        for(const gaps of PADROES) {
          let cursor = inicio;

          const b5 = [];
          let b3 = -1;

          for(let k=0;k<6;k++) {
            const tamanho = k === p3 ? 3 : 5;

            const centro = mod(
              cursor+Math.floor(tamanho/2),37
            );

            if(k === p3) {
              b3 = centro;
            } else {
              b5.push(centro);
            }

            cursor = mod(
              cursor+tamanho+gaps[k],37
            );
          }

          const chave =
            b5.slice().sort((a,b)=>a-b).join("-") +
            "|" + b3;

          if(usadas.has(chave)) continue;

          usadas.add(chave);

          MODELOS.push({
            b5,
            b3,
            chave
          });
        }
      }
    }
  }

  prepararModelos();

  function construirJogada(scores,usadas,variacao) {
    const p5 = new Float64Array(37);
    const p3 = new Float64Array(37);

    for(let c=0;c<37;c++) {
      for(let d=-2;d<=2;d++) {
        const peso =
          d === 0 ? 1.22 :
          Math.abs(d) === 1 ? 1.08 : 1;

        p5[c] +=
          scores[mod(c+d,37)]*peso;
      }

      for(let d=-1;d<=1;d++) {
        p3[c] +=
          scores[mod(c+d,37)]*
          (d === 0 ? 1.22 : 1);
      }
    }

    let melhor = null;
    let maior = -Infinity;

    for(const modelo of MODELOS) {
      if(usadas.has(modelo.chave)) continue;

      let score = p3[modelo.b3];

      for(const centro of modelo.b5) {
        score += p5[centro];
      }

      score +=
        Math.sin(
          (variacao+1)*(modelo.b3+1)*.77
        )*.00001;

      if(score > maior) {
        maior = score;
        melhor = modelo;
      }
    }

    if(!melhor) return null;

    const blocos2 = melhor.b5.map(i => ({
      centro:TRACK[i],
      qtd:2,
      numeros:vizinhos(TRACK[i],2)
    }));

    const blocos1 = [{
      centro:TRACK[melhor.b3],
      qtd:1,
      numeros:vizinhos(TRACK[melhor.b3],1)
    }];

    const numeros = new Set(
      [...blocos2,...blocos1]
        .flatMap(b => b.numeros)
    );

    if(numeros.size !== 28) return null;

    for(let i=0;i<37;i++) {
      const n = TRACK[i];

      if(
        !numeros.has(n) &&
        numeros.has(TRACK[mod(i-1,37)]) &&
        numeros.has(TRACK[mod(i+1,37)])
      ) {
        return null;
      }
    }

    return {
      valido:true,
      blocos2,
      blocos1,
      numeros,
      score:maior,
      assinatura:melhor.chave
    };
  }

  // CONFIGURAÇÕES E RANKING

  function estatisticas(lista) {
    const validos = (lista || [])
      .filter(
        x =>
          !x.semJogada &&
          !x.aguardandoG1 &&
          typeof x.green === "boolean"
      )
      .slice(-20);

    function taxa(q) {
      const itens = validos.slice(-q);

      return itens.length
        ? itens.filter(x => x.green).length /
          itens.length*100
        : 0;
    }

    let perdas = 0;

    for(let i=validos.length-1;i>=0;i--) {
      if(validos[i].green) break;
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

  function gerarConfig(
    base,motor,rx,usadas,variacao,
    analise,cont,raioX
  ) {
    const minimo = motor.startsWith("RX")
      ? Math.max(14,rx*2+4)
      : Math.max(8,rx+4);

    if(base.length < minimo) {
      return {
        valido:false,motor,rx,
        motivo:"AGUARDANDO HISTÓRICO"
      };
    }

    const info = pontuar(
      base,motor,rx,analise,cont,raioX
    );

    if(!info) {
      return {
        valido:false,motor,rx,
        motivo:"SEM RÉPLICAS"
      };
    }

    const jogada = construirJogada(
      info.scores,usadas,variacao
    );

    if(!jogada) {
      return {
        valido:false,motor,rx,
        motivo:"SEM JOGADA"
      };
    }

    return {
      valido:true,
      motor,
      rx,
      alvoDuzia:rx-3,
      jogada,
      assinatura:jogada.assinatura,
      score:jogada.score,
      similaridade:info.similaridade
    };
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
    const raios = {};

    for(const rx of RXS) {
      contagens[rx] = contagemFisica(base,rx);
      raios[rx] = analisarRX(base,rx);
    }

    const usadas = new Set();
    let variacao = 0;

    for(const motor of MOTORES) {
      for(const rx of RXS) {
        const cfg = gerarConfig(
          base,motor,rx,usadas,variacao++,
          analise,contagens[rx],raios[rx]
        );

        if(cfg.valido) {
          usadas.add(cfg.assinatura);

          const live = estatisticas(
            estado.timelines[motor][rx]
          );

          cfg.scoreAuto =
            cfg.score*.15 +
            live.taxa10*.15 +
            live.taxa20*.08 +
            cfg.similaridade*.05 -
            live.perdas*3;
        }

        configs[motor][rx] = cfg;
      }
    }

    return {configs,analise};
  }

  /*
   CORREÇÃO PRINCIPAL V3.3

   Maior pontuação = 1º.
   Segunda maior = 2º (AUTO).
   Terceira maior = 3º (alternativa).
  */

  function rankingMotores(configs) {
    const lista = [];

    for(const motor of MOTORES) {
      for(const rx of RXS) {
        const cfg = configs[motor][rx];

        if(cfg?.valido) {
          lista.push(cfg);
        }
      }
    }

    lista.sort((a,b) =>
      b.scoreAuto-a.scoreAuto ||
      b.score-a.score ||
      MOTORES.indexOf(a.motor) -
        MOTORES.indexOf(b.motor) ||
      a.rx-b.rx
    );

    lista.forEach((cfg,i) => {
      cfg.posicaoRanking = i+1;
    });

    return lista;
  }

  function escolherAuto(ranking) {
    return ranking[1] || ranking[0] || null;
  }

  function escolherTerceiro(ranking) {
    return ranking[2] || null;
  }

  let cacheChave = null;
  let cacheDados = null;

  function invalidarCache() {
    cacheChave = null;
    cacheDados = null;
  }

  function obterConfigs() {
    const chave =
      estado.historico.join(",") + "|" +
      MOTORES.map(m =>
        RXS.map(rx => {
          const t = estado.timelines[m][rx];

          return t.length + ":" +
            (t[t.length-1]?.fase || "");
        }).join(";")
      ).join("|");

    if(cacheChave === chave && cacheDados) {
      return cacheDados;
    }

    const dados = calcularDoze(estado.historico);

    dados.ranking = rankingMotores(dados.configs);
    dados.auto = escolherAuto(dados.ranking);
    dados.terceiro = escolherTerceiro(dados.ranking);

    cacheChave = chave;
    cacheDados = dados;

    return dados;
  }

  function configAtiva(configs,auto) {
    return estado.modo === "AUTO"
      ? auto
      : configs[estado.motorManual]?.[estado.manualRX];
  }

  // SNAPSHOT E CLASSIFICAÇÃO

  function snapshot(cfg) {
    if(!cfg?.valido) return null;

    return {
      motor:cfg.motor,
      rx:cfg.rx,
      centros2:cfg.jogada.blocos2.map(
        b => b.centro
      ),
      centro1:cfg.jogada.blocos1[0].centro,
      historico:estado.historico.join(",")
    };
  }

  function jogadaSnapshot(snap) {
    if(!snap) return null;

    const blocos2 = (snap.centros2 || []).map(
      centro => ({
        centro,
        qtd:2,
        numeros:vizinhos(centro,2)
      })
    );

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
          .flatMap(b => b.numeros)
      )
    };
  }

  function classificar(numero,jogada) {
    if(!jogada?.valido) {
      return {green:false,tipo:"SEM"};
    }

    const blocos = [
      ...jogada.blocos2,
      ...jogada.blocos1
    ];

    for(const b of blocos) {
      if(b.numeros.includes(numero)) {
        const d = distancia(numero,b.centro);

        return {
          green:true,
          tipo:d === 0 ? "ALVO" :
            d === 1 ? "V1" : "V2",
          centro:b.centro
        };
      }
    }

    return {
      green:false,
      tipo:"FORA"
    };
  }

  // LINHAS DO TEMPO E G1

  function prepararPendentes(configs,auto) {
    const chave = estado.historico.join(",");

    if(
      !estado.freezes.AUTO &&
      estado.pendentes.AUTO?.historico !== chave
    ) {
      estado.pendentes.AUTO = snapshot(auto);
    }

    for(const motor of MOTORES) {
      for(const rx of RXS) {
        if(estado.freezes[motor][rx]) continue;

        if(
          estado.pendentes[motor][rx]?.historico !==
          chave
        ) {
          estado.pendentes[motor][rx] =
            snapshot(configs[motor][rx]);
        }
      }
    }
  }

  function avaliarLinha(numero,p,freeze,lista,chave) {
    lista = (lista || []).slice(-MAX);

    if(freeze) {
      const r = classificar(
        numero,jogadaSnapshot(freeze)
      );

      let indice = -1;

      for(let i=lista.length-1;i>=0;i--) {
        if(lista[i].aguardandoG1) {
          indice = i;
          break;
        }
      }

      const atualizacao = {
        resultadoG1:numero,
        green:r.green,
        tipo:r.tipo,
        fase:r.green ? "G1" : "LOSS",
        aguardandoG1:false,
        semJogada:false
      };

      if(indice >= 0) {
        lista[indice] = {
          ...lista[indice],
          ...atualizacao
        };
      } else {
        lista.push({
          resultado:numero,
          ...atualizacao
        });
      }

      return {
        lista:lista.slice(-MAX),
        freeze:null,
        pendente:null
      };
    }

    if(!p || p.historico !== chave) {
      lista.push({
        resultado:numero,
        semJogada:true,
        green:null,
        fase:"SEM"
      });

      return {
        lista:lista.slice(-MAX),
        freeze:null,
        pendente:null
      };
    }

    const r = classificar(
      numero,jogadaSnapshot(p)
    );

    if(r.green) {
      lista.push({
        resultado:numero,
        green:true,
        tipo:r.tipo,
        semJogada:false,
        fase:"ENTRADA"
      });

      return {
        lista:lista.slice(-MAX),
        freeze:null,
        pendente:null
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
      lista:lista.slice(-MAX),
      freeze:{...p},
      pendente:null
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

    estado.timelines.AUTO = auto.lista;
    estado.freezes.AUTO = auto.freeze;
    estado.pendentes.AUTO = auto.pendente;

    for(const motor of MOTORES) {
      for(const rx of RXS) {
        const r = avaliarLinha(
          numero,
          estado.pendentes[motor][rx],
          estado.freezes[motor][rx],
          estado.timelines[motor][rx],
          chave
        );

        estado.timelines[motor][rx] = r.lista;
        estado.freezes[motor][rx] = r.freeze;
        estado.pendentes[motor][rx] = r.pendente;
      }
    }
  }

  // JOGADOR VIRTUAL: AUDITORIA DA ESCOLHA

  function auditar(numero,escolhida,ranking) {
    if(!escolhida?.valido) {
      return {
        titulo:"SEM JOGADA VÁLIDA",
        texto:"Ainda não havia configuração para comparar.",
        detalhes:[]
      };
    }

    const acerto = classificar(
      numero,escolhida.jogada
    ).green;

    const segundo = ranking[1] || ranking[0];
    const terceiro = ranking[2] || null;

    const alternativas = ranking.filter(
      cfg => classificar(
        numero,cfg.jogada
      ).green
    );

    const detalhes = [
      "RESULTADO: " + numero,
      "ESCOLHIDO: " +
        NOMES[escolhida.motor] +
        " C" + escolhida.rx,
      "POSIÇÃO: " +
        escolhida.posicaoRanking + "º",
      "PONTUAÇÃO: " +
        formatar(escolhida.scoreAuto),
      "2º COLOCADO: " +
        (segundo
          ? NOMES[segundo.motor] +
            " C" + segundo.rx +
            " (" + formatar(segundo.scoreAuto) + ")"
          : "—"),
      "3º COLOCADO: " +
        (terceiro
          ? NOMES[terceiro.motor] +
            " C" + terceiro.rx +
            " (" + formatar(terceiro.scoreAuto) + ")"
          : "—")
    ];

    if(acerto) {
      return {
        titulo:"ACERTO NA PRIMEIRA ENTRADA",
        texto:
          "A escolha feita antes do sorteio " +
          "cobria o número " + numero + ".",
        detalhes
      };
    }

    if(alternativas.length) {
      const melhor = alternativas[0];

      const terceiroAcertaria =
        terceiro &&
        classificar(numero,terceiro.jogada).green;

      return {
        titulo:"FALHA NA ESCOLHA DO MOTOR",
        texto:
          "O 2º colocado foi escolhido, mas não " +
          "cobria o número " + numero + ". " +
          (
            terceiroAcertaria
              ? "O 3º colocado cobriria esse número."
              : "O 3º colocado também não cobriria esse número."
          ) +
          " Entre os motores disponíveis, " +
          NOMES[melhor.motor] +
          " C" + melhor.rx +
          " era o mais bem pontuado dos que " +
          "cobririam o resultado. Essa constatação " +
          "é posterior ao sorteio; não prova que " +
          "seria possível antecipá-lo.",
        detalhes:[
          ...detalhes,
          "MELHOR ALTERNATIVA QUE COBRIA: " +
            NOMES[melhor.motor] +
            " C" + melhor.rx,
          "POSIÇÃO DA ALTERNATIVA: " +
            melhor.posicaoRanking + "º",
          "PONTUAÇÃO DA ALTERNATIVA: " +
            formatar(melhor.scoreAuto),
          "MOTORES QUE COBRIAM: " +
            alternativas.map(
              c => NOMES[c.motor] +
                " C" + c.rx +
                " (" + c.posicaoRanking + "º)"
            ).join(" • ")
        ]
      };
    }

    return {
      titulo:"NENHUM MOTOR COBRIA O RESULTADO",
      texto:
        "O número " + numero +
        " estava fora das 12 coberturas disponíveis. " +
        "Escolher o 3º colocado também não teria " +
        "produzido acerto na primeira entrada.",
      detalhes
    };
  }

  // ENTRADA DE NÚMEROS

  let renderPendente = false;

  function agendarRender() {
    if(renderPendente) return;

    renderPendente = true;

    setTimeout(() => {
      renderPendente = false;
      render();
    },0);
  }

  function adicionarNumero(numero) {
    if(
      !Number.isInteger(numero) ||
      numero < 0 || numero > 36
    ) return;

    const dados = obterConfigs();

    prepararPendentes(dados.configs,dados.auto);

    const ativa = configAtiva(
      dados.configs,dados.auto
    );

    avaliarPendentes(numero);

    if(estado.visualFreeze) {
      const r = classificar(
        numero,
        jogadaSnapshot(estado.visualFreeze)
      );

      const ultimo = estado.visual.at(-1);

      if(ultimo) {
        ultimo.g1 = numero;
        ultimo.green = r.green;
        ultimo.fase = r.green ? "G1" : "LOSS";
      }

      if(estado.diagnostico) {
        estado.diagnostico = {
          ...estado.diagnostico,
          titulo:r.green
            ? "G1 ACERTOU"
            : "ENTRADA E G1 FALHARAM",
          detalhes:[
            ...(estado.diagnostico.detalhes || []),
            "G1: " + numero +
              " — " + (r.green ? "ACERTO" : "ERRO")
          ]
        };
      }

      estado.visualFreeze = null;

    } else {
      const snap = snapshot(ativa);

      const r = snap
        ? classificar(
            numero,jogadaSnapshot(snap)
          )
        : null;

      estado.visual.push({
        resultado:numero,
        g1:null,
        green:r?.green ? true : null,
        semJogada:!snap,
        fase:!snap
          ? "SEM"
          : r.green
            ? "ENTRADA"
            : "ESPERA_G1"
      });

      estado.diagnostico = auditar(
        numero,ativa,dados.ranking
      );

      if(r && !r.green) {
        estado.visualFreeze = snap;
      }
    }

    estado.visual = estado.visual.slice(-14);

    estado.historico.push(numero);
    estado.historico = estado.historico.slice(-MAX);

    invalidarCache();
    salvar();
    agendarRender();
  }

  function reiniciarApontamentos() {
    const novo = novoEstado();

    estado.timelines = novo.timelines;
    estado.pendentes = novo.pendentes;
    estado.freezes = novo.freezes;
    estado.visual = [];
    estado.visualFreeze = null;
    estado.diagnostico = null;

    invalidarCache();
  }

  function inserirHistorico() {
    const campo =
      document.getElementById("entradaHistorico");

    const nums = (
      campo.value.match(
        /\b(?:[0-9]|[12][0-9]|3[0-6])\b/g
      ) || []
    ).map(Number);

    if(!nums.length) return;

    estado.historico = limitar(nums);

    reiniciarApontamentos();

    campo.value = "";

    salvar();
    agendarRender();
  }

  function apagarUltimo() {
    if(!estado.historico.length) return;

    estado.historico.pop();
    reiniciarApontamentos();
    salvar();
    agendarRender();
  }

  function apagarTudo() {
    if(!confirm("Apagar todo o histórico?")) return;

    estado.historico = [];
    reiniciarApontamentos();
    salvar();
    agendarRender();
  }

  function selecionar(motor,rx) {
    if(motor === "AUTO") {
      estado.modo = "AUTO";
    } else {
      estado.modo = "MANUAL";
      estado.motorManual = motor;
      estado.manualRX = rx;
    }

    salvar();
    agendarRender();
  }

  // INTERFACE

  document.body.innerHTML = "";
  document.body.style.cssText = `
    margin:0;
    background:#101014;
    color:white;
    font-family:Arial,sans-serif;
  `;

  const app = document.createElement("div");

  app.innerHTML = `
  <style>
    *{box-sizing:border-box}
    .app{max-width:950px;margin:auto;padding:8px}
    h2{text-align:center;font-size:20px;margin:8px}
    .painel{
      background:#1b1c23;
      border:1px solid #363843;
      border-radius:11px;
      padding:10px;
      margin-bottom:9px
    }
    .titulo{
      font-size:10px;
      font-weight:900;
      color:#aeb5c5;
      margin-bottom:8px
    }
    textarea{
      width:100%;
      height:60px;
      background:#101116;
      color:white;
      border:1px solid #515666;
      border-radius:7px;
      padding:9px
    }
    button{
      font-family:Arial;
      font-weight:900;
      cursor:pointer;
      touch-action:manipulation
    }
    .botoes,.modos{
      display:flex;
      flex-wrap:wrap;
      gap:5px;
      margin-top:7px
    }
    .btn{
      background:#333846;
      color:white;
      border:1px solid #555e70;
      border-radius:7px;
      padding:9px 11px;
      font-size:10px
    }
    .verde{background:#17643b}
    .red{background:#782a35}
    .cabecalho{
      width:100%;
      display:flex;
      justify-content:space-between;
      align-items:center;
      background:#232632;
      border:1px solid #414756;
      border-radius:8px;
      color:white;
      padding:10px;
      font-size:11px
    }
    .seta{color:#00d9ff;font-size:15px}
    .oculto{display:none!important}
    .autoCompacto{
      display:flex;
      align-items:center;
      gap:8px;
      margin-top:7px;
      padding:8px;
      background:#111820;
      border:1px solid #007d98;
      border-radius:8px
    }
    .autoQuadrado{
      width:55px;
      height:42px;
      background:#007d98;
      color:white;
      border:1px solid #00e5ff;
      border-radius:8px
    }
    .autoDescricao{
      font-size:10px;
      font-weight:900;
      color:#00e5ff;
      flex:1
    }
    .seletorGrupo{margin-top:12px}
    .seletorTitulo{
      font-size:9px;
      color:#aeb5c5;
      font-weight:900
    }
    .modo{
      background:#262936;
      color:#c3c7d0;
      border:1px solid #555c6b;
      border-radius:7px;
      padding:9px 12px;
      font-size:11px
    }
    .modo.ativo{
      background:#007d98;
      border-color:#00e5ff;
      color:white
    }
    .resumo{
      display:grid;
      grid-template-columns:repeat(4,1fr);
      gap:5px;
      margin-top:10px
    }
    .card{
      background:#101116;
      border:1px solid #333947;
      border-radius:7px;
      padding:9px 5px;
      text-align:center
    }
    .card small{
      display:block;
      font-size:8px;
      color:#a4aab7
    }
    .card strong{
      display:block;
      font-size:18px;
      margin-top:4px
    }
    .duzias{
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:5px;
      margin-top:10px
    }
    .duzia{
      background:#101116;
      border:1px solid #414653;
      border-radius:7px;
      padding:8px;
      text-align:center
    }
    .duzia.forte{border-color:#00e676}
    .duzia small{
      display:block;
      font-size:8px;
      color:#aeb5c5
    }
    .duzia strong{
      display:block;
      font-size:17px;
      margin:5px
    }
    .duzia span{
      font-size:8px;
      color:#aeb5c5
    }
    .timelineSecao{
      margin-top:10px;
      padding-top:8px;
      border-top:1px solid #363843
    }
    .timelineTitulo{
      font-size:9px;
      font-weight:900;
      color:#aeb5c5
    }
    .timelineRow{
      display:grid;
      grid-template-columns:65px minmax(0,1fr) 35px;
      gap:5px;
      align-items:center;
      margin-top:6px
    }
    .timeline{
      display:flex;
      gap:2px;
      justify-content:flex-end;
      overflow:hidden
    }
    .gl{
      width:15px;
      min-width:15px;
      height:18px;
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
    .gl.wait{background:#4a3510;color:#ffc107}
    .gl.sem{background:#333;color:#999}
    .nomeTL,.taxaTL{
      font-size:8px;
      font-weight:900
    }
    .taxaTL{text-align:right}
    .ultimos{
      display:grid;
      grid-template-columns:repeat(7,1fr);
      gap:5px
    }
    .ultimo{
      min-height:63px;
      border-radius:7px;
      background:#272a34;
      border:2px solid #555;
      display:flex;
      justify-content:center;
      position:relative;
      padding:6px 3px 25px
    }
    .ultimo.green{border-color:#00b85c}
    .ultimo.loss{border-color:#d93a3a}
    .ultimo.g1{border-color:#ffc107}
    .ultimo.wait{border-color:#8a6b00}
    .bola{
      width:30px;
      height:30px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:11px;
      font-weight:900;
      border:2px solid #aaa
    }
    .resultado{
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
    .resultado.green{background:#00994d}
    .resultado.loss{background:#c62828}
    .resultado.g1{
      background:#ffc107;
      color:#111
    }
    .jogadaStatus{
      font-size:10px;
      font-weight:900;
      color:#00e5ff;
      margin-bottom:9px
    }
    .jogadaStatus.congelada{color:#ffc107}
    .jogadaHorizontal{
      display:grid;
      grid-template-columns:repeat(6,minmax(0,1fr));
      gap:4px;
      width:100%
    }
    .alvo{
      aspect-ratio:1/1;
      min-height:42px;
      background:#006ca6;
      border:2px solid #00cfff;
      border-radius:7px;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:clamp(15px,4vw,27px);
      font-weight:900
    }
    .alvo.um{
      background:#b78300;
      border-color:#ffd54f;
      color:#111
    }
    .legenda{
      font-size:9px;
      color:#aeb5c5;
      margin-top:9px
    }
    .teclado{
      display:grid;
      grid-template-columns:repeat(6,1fr);
      gap:5px
    }
    .numero{
      height:43px;
      border:1px solid #666;
      border-radius:6px;
      color:white;
      font-size:13px
    }
    .zero{grid-column:span 6}
    .virtualStatus{
      padding:9px;
      border-radius:8px;
      font-size:11px;
      font-weight:900;
      margin-top:10px
    }
    .virtualStatus.green{
      background:#123b2b;
      color:#00e676
    }
    .virtualStatus.loss{
      background:#451d25;
      color:#ff6c78
    }
    .virtualStatus.wait{
      background:#373015;
      color:#ffd54f
    }
    .virtualTexto{
      background:#11141b;
      border:1px solid #363b48;
      border-radius:8px;
      padding:11px;
      margin-top:8px;
      font-size:12px;
      line-height:1.6
    }
    .virtualDetalhes{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:5px;
      margin-top:9px
    }
    .virtualDetalhe{
      background:#12151d;
      border:1px solid #333b4a;
      border-radius:6px;
      padding:8px;
      font-size:10px;
      line-height:1.5
    }
    .rankingLinha{
      font-size:10px;
      padding:7px;
      border-bottom:1px solid #333
    }
    .rankingLinha.selecionado{
      background:#123e4c;
      color:#00e5ff
    }
    .rankingLinha.terceiro{
      background:#453813;
      color:#ffd54f
    }
    .status{
      font-size:10px;
      font-weight:900;
      color:#00e676;
      margin-top:8px;
      line-height:1.6
    }
    @media(max-width:600px){
      .resumo{
        grid-template-columns:repeat(2,1fr)
      }
      .ultimos{
        grid-template-columns:repeat(4,1fr)
      }
      .virtualDetalhes{
        grid-template-columns:1fr
      }
    }
  </style>

  <div class="app">

    <h2>ANÁLISE BETA V3.3</h2>

    <div class="painel">
      <textarea
        id="entradaHistorico"
        placeholder="Cole os últimos 20 números"
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

      <div id="status" class="status">PRONTO</div>
    </div>

    <div class="painel">
      <button id="recolherCandidatos" class="cabecalho">
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

      <div id="conteudoCandidatos" class="oculto">
        ${MOTORES.map(m => `
          <div class="seletorGrupo">
            <div class="seletorTitulo">
              ${NOMES[m]}
            </div>
            <div class="modos">
              ${RXS.map(rx => `
                <button
                  id="btn${PREFIXO[m]}${rx}"
                  class="modo"
                >
                  C${rx}
                </button>
              `).join("")}
            </div>
          </div>
        `).join("")}

        <div class="titulo" style="margin-top:12px">
          RANKING POR PONTUAÇÃO • MAIOR PARA MENOR
        </div>
        <div id="ranking"></div>

        <div id="resumo" class="resumo"></div>

        <div class="titulo" style="margin-top:12px">
          CONCENTRAÇÃO FÍSICA DAS DÚZIAS
        </div>
        <div id="duzias" class="duzias"></div>
      </div>
    </div>

    <div class="painel">
      <button id="recolherTimelines" class="cabecalho">
        <strong>LINHAS DO TEMPO</strong>
        <span id="setaTimelines" class="seta">+</span>
      </button>

      <div class="timelineSecao">
        <div class="timelineTitulo">AUTO</div>
        <div id="timelineAUTO" class="timelineRow"></div>
      </div>

      <div id="conteudoTimelines" class="oculto">
        ${MOTORES.map(m => `
          <div class="timelineSecao">
            <div class="timelineTitulo">
              ${NOMES[m]}
            </div>
            ${RXS.map(rx => `
              <div
                id="timeline${PREFIXO[m]}${rx}"
                class="timelineRow"
              ></div>
            `).join("")}
          </div>
        `).join("")}
      </div>
    </div>

    <div class="painel">
      <div class="titulo">ÚLTIMAS 14 JOGADAS</div>
      <div id="ultimos14" class="ultimos"></div>
    </div>

    <div class="painel">
      <div class="titulo">JOGADA ATUAL</div>
      <div id="jogada"></div>
    </div>

    <div class="painel">
      <div class="titulo">TECLADO</div>
      <div id="teclado" class="teclado"></div>
    </div>

    <div class="painel">
      <button id="recolherVirtual" class="cabecalho">
        <strong>🤖 JOGADOR VIRTUAL</strong>
        <span id="setaVirtual" class="seta">−</span>
      </button>

      <div id="conteudoVirtual">
        <div
          id="virtualStatus"
          class="virtualStatus wait"
        >
          AGUARDANDO RESULTADO
        </div>

        <div
          id="virtualTexto"
          class="virtualTexto"
        ></div>

        <div
          id="virtualDetalhes"
          class="virtualDetalhes"
        ></div>
      </div>
    </div>

  </div>`;

  document.body.appendChild(app);

  const el = id => document.getElementById(id);

  // EVENTOS

  el("inserir").onclick = inserirHistorico;
  el("apagar").onclick = apagarUltimo;
  el("limpar").onclick = apagarTudo;

  el("btnAUTO").onclick = () => selecionar("AUTO");

  for(const motor of MOTORES) {
    for(const rx of RXS) {
      el("btn"+PREFIXO[motor]+rx).onclick =
        () => selecionar(motor,rx);
    }
  }

  el("recolherCandidatos").onclick = () => {
    estado.candidatosAbertos =
      !estado.candidatosAbertos;

    salvar();
    renderPaineis();
  };

  el("recolherTimelines").onclick = () => {
    estado.timelinesAbertas =
      !estado.timelinesAbertas;

    salvar();
    renderPaineis();
  };

  el("recolherVirtual").onclick = () => {
    estado.virtualAberto =
      !estado.virtualAberto;

    salvar();
    renderPaineis();
  };

  // TECLADO

  for(let n=1;n<=36;n++) {
    const botao = document.createElement("button");

    botao.className = "numero";
    botao.textContent = n;
    botao.style.background = cor(n);

    botao.onclick = () => adicionarNumero(n);

    el("teclado").appendChild(botao);
  }

  const zero = document.createElement("button");

  zero.className = "numero zero";
  zero.textContent = "0";
  zero.style.background = cor(0);
  zero.onclick = () => adicionarNumero(0);

  el("teclado").appendChild(zero);

  // RENDERIZAÇÃO DOS PAINÉIS

  function renderPaineis() {
    el("conteudoCandidatos").classList.toggle(
      "oculto",!estado.candidatosAbertos
    );

    el("conteudoTimelines").classList.toggle(
      "oculto",!estado.timelinesAbertas
    );

    el("conteudoVirtual").classList.toggle(
      "oculto",!estado.virtualAberto
    );

    el("setaCandidatos").textContent =
      estado.candidatosAbertos ? "−" : "+";

    el("setaTimelines").textContent =
      estado.timelinesAbertas ? "−" : "+";

    el("setaVirtual").textContent =
      estado.virtualAberto ? "−" : "+";
  }

  function renderTimeline(id,nome,lista) {
    const itens = (lista || []).slice(-20);

    const validos = itens.filter(
      x =>
        !x.semJogada &&
        !x.aguardandoG1 &&
        typeof x.green === "boolean"
    );

    const taxa = validos.length
      ? validos.filter(x=>x.green).length /
        validos.length*100
      : null;

    const html = itens.map(x => {
      if(x.semJogada) {
        return '<span class="gl sem">—</span>';
      }

      if(x.aguardandoG1) {
        return '<span class="gl wait">…</span>';
      }

      if(x.green && x.fase === "G1") {
        return '<span class="gl g1">G1</span>';
      }

      if(x.green) {
        return '<span class="gl green">G</span>';
      }

      return '<span class="gl loss">L</span>';
    }).join("");

    el(id).innerHTML = `
      <div class="nomeTL">${nome}</div>
      <div class="timeline">${html}</div>
      <div class="taxaTL">
        ${taxa === null ? "—" : taxa.toFixed(0)+"%"}
      </div>
    `;
  }

  function renderJogada(cfg,congelada) {
    if(!cfg?.valido || !cfg.jogada?.valido) {
      el("jogada").innerHTML =
        '<div class="jogadaStatus">AGUARDANDO JOGADA</div>';
      return;
    }

    const blocos = [
      ...cfg.jogada.blocos2.map(
        b => ({...b,um:false})
      ),
      ...cfg.jogada.blocos1.map(
        b => ({...b,um:true})
      )
    ];

    blocos.sort((a,b) =>
      ORDEM.indexOf(regiao(a.centro)) -
      ORDEM.indexOf(regiao(b.centro)) ||
      pos(a.centro)-pos(b.centro)
    );

    el("jogada").innerHTML = `
      <div class="jogadaStatus
        ${congelada ? "congelada" : ""}">
        ${congelada
          ? "G1 • JOGADA CONGELADA"
          : "JOGADA ATUAL"}
        • ${NOMES[cfg.motor]}
        • C${cfg.rx}
      </div>

      <div class="jogadaHorizontal">
        ${blocos.map(b => `
          <div class="alvo ${b.um ? "um" : ""}">
            ${b.centro}
          </div>
        `).join("")}
      </div>

      <div class="legenda">
        AZUL = 2 VIZINHOS •
        AMARELO = 1 VIZINHO •
        28 NÚMEROS COBERTOS
      </div>
    `;
  }

  function renderUltimos() {
    el("ultimos14").innerHTML =
      estado.visual.slice(-14).map(x => {
        const classe = x.semJogada
          ? "sem"
          : x.fase === "ESPERA_G1"
            ? "wait"
            : x.fase === "G1"
              ? "g1"
              : x.green
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
          <div class="ultimo ${classe}">
            <div
              class="bola"
              style="background:${cor(x.resultado)}"
            >
              ${x.resultado}
            </div>
            <div class="resultado ${classe}">
              ${textos[classe]}
              ${x.g1 == null ? "" : " • "+x.g1}
            </div>
          </div>
        `;
      }).join("");
  }

  function renderVirtual() {
    const d = estado.diagnostico;

    if(!d) {
      el("virtualStatus").className =
        "virtualStatus wait";

      el("virtualStatus").textContent =
        "AGUARDANDO RESULTADO";

      el("virtualTexto").textContent =
        "O AUTO utilizará o 2º motor de maior " +
        "pontuação. O 3º será comparado após " +
        "o resultado, sem alterar a escolha.";

      el("virtualDetalhes").innerHTML = "";
      return;
    }

    const acerto =
      d.titulo.includes("ACERTOU") ||
      d.titulo.includes("ACERTO NA");

    el("virtualStatus").className =
      "virtualStatus " +
      (acerto ? "green" : "loss");

    el("virtualStatus").textContent = d.titulo;
    el("virtualTexto").textContent = d.texto;

    const area = el("virtualDetalhes");
    area.replaceChildren();

    for(const detalhe of d.detalhes || []) {
      const div = document.createElement("div");
      div.className = "virtualDetalhe";
      div.textContent = detalhe;
      area.appendChild(div);
    }
  }

  function render() {
    const dados = obterConfigs();

    prepararPendentes(
      dados.configs,dados.auto
    );

    const ativa = configAtiva(
      dados.configs,dados.auto
    );

    // SELEÇÃO

    el("btnAUTO").style.background =
      estado.modo === "AUTO"
        ? "#007d98" : "#303744";

    for(const motor of MOTORES) {
      for(const rx of RXS) {
        el("btn"+PREFIXO[motor]+rx)
          .classList.toggle(
            "ativo",
            estado.modo === "MANUAL" &&
            estado.motorManual === motor &&
            estado.manualRX === rx
          );
      }
    }

    // AUTO E RANKING

    el("autoDescricao").textContent =
      dados.auto
        ? "2º MAIOR SCORE • " +
          NOMES[dados.auto.motor] +
          " C" + dados.auto.rx +
          " • " + formatar(dados.auto.scoreAuto) +
          (
            dados.terceiro
              ? " | 3º: " +
                NOMES[dados.terceiro.motor] +
                " C" + dados.terceiro.rx
              : ""
          )
        : "AGUARDANDO MOTORES VÁLIDOS";

    el("ranking").innerHTML =
      dados.ranking.map((cfg,i) => `
        <div class="rankingLinha
          ${i === 1 ? "selecionado" : ""}
          ${i === 2 ? "terceiro" : ""}">
          ${i+1}º • ${NOMES[cfg.motor]} C${cfg.rx}
          • ${formatar(cfg.scoreAuto)}
          ${i === 1 ? " • AUTO ESCOLHIDO" : ""}
          ${i === 2 ? " • ALTERNATIVA" : ""}
        </div>
      `).join("");

    // RESUMO

    const live = estatisticas(
      estado.timelines.AUTO
    );

    el("resumo").innerHTML = [
      ["REAL 5",live.total ? live.taxa5 : null],
      ["REAL 10",live.total ? live.taxa10 : null],
      ["REAL 20",live.total ? live.taxa20 : null],
      ["PERDAS",live.perdas]
    ].map(([nome,valor]) => `
      <div class="card">
        <small>${nome}</small>
        <strong>
          ${valor === null
            ? "—"
            : nome === "PERDAS"
              ? valor
              : valor.toFixed(0)+"%"}
        </strong>
      </div>
    `).join("");

    // DÚZIAS

    el("duzias").innerHTML =
      dados.analise.ranking.map((x,i) => `
        <div class="duzia ${i === 0 ? "forte" : ""}">
          <small>${x.duzia}ª DÚZIA</small>
          <strong>
            ${(x.intensidade*100).toFixed(0)}%
          </strong>
          <span>
            ${x.contagem}/20 •
            QUEBRA ${x.quebra.toFixed(1)}
          </span>
        </div>
      `).join("");

    // TODAS AS 13 TIMELINES

    renderTimeline(
      "timelineAUTO",
      "AUTO",
      estado.timelines.AUTO
    );

    for(const motor of MOTORES) {
      for(const rx of RXS) {
        renderTimeline(
          "timeline"+PREFIXO[motor]+rx,
          "C"+rx,
          estado.timelines[motor][rx]
        );
      }
    }

    // G1 CONGELADO

    const freeze =
      estado.modo === "AUTO"
        ? estado.freezes.AUTO
        : estado.freezes[
            estado.motorManual
          ][estado.manualRX];

    const configExibida = freeze
      ? {
          valido:true,
          motor:freeze.motor,
          rx:freeze.rx,
          jogada:jogadaSnapshot(freeze)
        }
      : ativa;

    renderJogada(configExibida,!!freeze);

    renderUltimos();
    renderVirtual();

    el("status").textContent =
      estado.historico.length +
      "/20 • 12 MOTORES • " +
      dados.ranking.length +
      " VÁLIDOS • AUTO 2º MAIOR SCORE" +
      " • 3º COMO ALTERNATIVA" +
      " • 28 NÚMEROS" +
      " • SEM SOBREPOSIÇÃO" +
      (freeze ? " • G1 CONGELADO" : "");

    renderPaineis();
    salvar();
  }

  // INICIALIZAÇÃO

  agendarRender();

})();
