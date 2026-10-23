/* ANÁLISE BETA 6.6.13 — RETOMADA SEM COMPACTAÇÃO NA TELA.
Trocar de aba não executa mais save()/LZW completo na thread da interface.
Serialização do checkpoint também ocorre no worker de salvamento.
Dois calculadores de bancos adicionais por leitura foram eliminados; os mesmos
65 bancos e todas as análises são calculados pelo worker de cada leitura.
Falha do worker não transfere silenciosamente o motor inteiro para o teclado.
Reinserir o código transfere a sessão em memória sem compactação síncrona.
Persistência, diário de entradas, linhas do tempo e reanálise preservados.
*/
/* ANÁLISE BETA 6.6.13 — REANÁLISE DA IMPORTAÇÃO E APRESENTAÇÃO ÚNICA.
A revisão restaura o prefixo anterior à entrada: 6 componentes x 4 intensidades.
Tentativas e jogadas ficam registradas; acerto revisado não apaga o LOSS original.
Uma hipótese ajustada ao passado começa com ZERO validações; somente os giros
posteriores a avaliam e autorizam influência limitada nos pesos dos motores.
Entrada manual publica os centros uma vez por conclusão, sem prévia duplicada
nem avisos de recebido/concluído no teclado. Persistência 6.6.11 preservada.
*/
/* Correção de sessão e resposta ao clique:
- Número recebido aparece antes das operações de armazenamento.
- Cópia e diferença para desfazer calculadas no worker de análise.
- Próxima jogada é publicada uma vez, junto do estado final calculado.
- Busca geométrica usa duas máscaras inteiras exatas de 32+5 bits no laço crítico.
  Mesma busca, pontuação e desempates; sem reduzir as análises.
- Caches de leituras limitados sem reduzir hipóteses nem mudar os pesos.
- Checkpoints completos com revisão: banco persistente, cópia permanente e cópia da aba.
- Recuperação escolhe a cópia íntegra mais recente, inclusive após desfazer/zerar.
- Falha de leitura protege a cópia existente de gravação vazia automática.
- Aviso de salvamento permanece visível na tela compartilhada.
*/
/* ANÁLISE BETA V6.6.13 — SELEÇÃO MASTER CORRIGIDA.
Mesmo ranking para todos os candidatos elegíveis: BASE, V1–V8,
12 adaptativas, AUTO 1–4, terceiro automático, personalizadas e treinadores.
O MASTER e o controlador pós-loss não disputam consigo mesmos.
Pós-loss e pós-três-loss conservam suas prioridades independentes.
Últimas 5/15/30 entradas: pesos 60%/25%/15%, com decaimento temporal.
GREEN direto=1; GREEN G1 confirmado=.45; G1 pendente=.15; LOSS final=-1.
LOSS final e sequência de LOSS recebem penalização explícita.
Memória de revisões anteriores participa como ajuste limitado e centrado.
Não força mais o vencedor do antigo indicador restrito a 64 variações.
Resultado geral mostra INDICAÇÃO MASTER, ou MASTER NO CICLO quando congelado,
com W/G1/R recentes da escolha, de maneira independente nos dois sentidos.
Ciclo/G1 comprometido não troca; nenhum resultado futuro participa do ranking.
Atlas, encadeamentos, polos, arcos, controles e persistência preservados.
Este é um critério comparativo; não garante acerto nem ausência de LOSS.
*/
/* ANÁLISE BETA V6.6.13 — LEITURAS ATIVAS DA JANELA COMPLETA.
Atlas integral de 1.369 formas de triangulação e 361 pares de amplitudes.
Encadeamentos de todos os comprimentos 4..70 disponíveis na janela:
sequência numérica, deslocamentos, reflexão, amplitudes, direção,
fechamento, percurso, interrupção, retomada e mudanças de direção.
Polos: 1.369 pares ordenados de posições, distâncias 0..18,
19 tolerâncias 0..18, convergência/divergência, fusão, ruptura,
retomada, concentração, dispersão e sobreposição explicitamente descrita.
A sobreposição em tolerâncias largas não representa dois polos distintos.
Arcos: 37 inícios por 37 larguras e todas as janelas 1..70 disponíveis.
Roda inteira: 37 parametrizações equivalentes, uma cobertura neutra.
Não duplica esses casos como observações independentes nem como vitórias.
Todas as leituras alimentam os pesos antes da geometria de 28 números.
Nenhum painel novo, botão de ativação ou importação obrigatória.
Ciclos e defesas comprometidas, treinadores, pós-loss, duas leituras,
linha do tempo, persistência, teclado e controles anteriores preservados.
Só padrões anteriores com sucessor conhecido fornecem evidência.
Cadeia tão longa quanto a janela é descrita sem inventar sucessor histórico.
Escopo: leitura dentro da janela de até 70 resultados, com estes critérios
explícitos. Não significa todas as definições matemáticas imagináveis,
nem cobertura individual de 37, nem melhoria de acerto comprovada.
*/
/* V6.6.13 — MEMÓRIA CAUSAL DO QUARTO RESULTADO.
Acrescenta trinca→quarto, forma girada/refletida, amplitude/proporção,
encadeamento de 4–8, fechamento/contorno, sucessores de arcos e polos.
Atlas: 1.369 formas relativas, equivalentes a 50.653 trincas numéricas.
Enumeração geométrica NÃO significa ocorrências observadas ou acertos.
OPÇÃO EXPERIMENTAL, DESLIGADA POR PADRÃO: não houve ganho consistente.
Oito canais usam somente resultados já conhecidos; influência total até 20%
do componente de triangulação, e somente com avaliação causal favorável.
Desligada, ou na falta de suporte, preserva exatamente o peso anterior.
A avaliação desta memória não bloqueia gatilhos PÓS-LOSS/PÓS-3 LOSS.
A tela compacta, os dois sentidos, um teclado, as estratégias e as defesas
comprometidas permanecem. Sessões da 6.6.5 são retomadas sem reimportação.
Resultados anteriores não são recalculados como se usassem o novo motor.
*/
/* ANÁLISE BETA 6.6.13 — DUAS LEITURAS EM UMA TELA COMPACTA.
BASE: 6.6.4, com os cálculos da 6.6.1 preservados.
NORMAL: histórico na ordem cronológica escolhida na importação.
INVERTIDO: os mesmos resultados em ordem reversa, com treinamento próprio.
Todas as estratégias, variações, linhas do tempo e centros,
últimos 14, resultados, ciclos e defesas são independentes por conjunto.
Um único teclado registra o mesmo resultado novo nos dois conjuntos.
A reversão se aplica à importação; os novos resultados são anexados aos dois.
Importar, recuperar, desfazer e zerar atuam nos dois conjuntos juntos.
O salvamento de cada conjunto tem chave própria e não substitui a 6.6.4 simples.
As jogadas podem coincidir. Duas leituras não garantem mais acertos.
*/
(() => {
"use strict";
// Cada leitura encontra apenas seus próprios elementos, mesmo quando os
// quadros são reunidos na tela única. Nenhum ID de uma leitura busca a outra.
function createSideDocument(root,nativeDocument,listeners){
 const scopes=[root];
 function all(selector){return [...new Set(scopes.flatMap(scope=>[...scope.querySelectorAll(selector)]))];}
 return {
  body:root,
  registerScope(element){if(!scopes.includes(element))scopes.push(element);},
  getElementById(id){for(const scope of scopes){if(scope.id===id)return scope;const el=scope.getElementById?scope.getElementById(id):scope.querySelector('[id="'+id+'"]');if(el)return el;}return null;},
  querySelector:selector=>all(selector)[0]||null,
  querySelectorAll:all,
  createElement:tag=>nativeDocument.createElement(tag),
  get visibilityState(){return nativeDocument.visibilityState;},
  addEventListener(type,handler,options){const target=type==='visibilitychange'?nativeDocument:root;target.addEventListener(type,handler,options);listeners.push([target,type,handler,options]);}
 };
}

function runBetaSide(side,root,coordinator,nativeDocument){
const sideListeners=[];
const document=createSideDocument(root,nativeDocument,sideListeners);
function sideWindowAdd(type,handler,options){
 globalThis.addEventListener(type,handler,options);sideListeners.push([globalThis,type,handler,options]);
}

  "use strict";
if(typeof globalThis['__analiseBetaDispose_'+side]==='function')globalThis['__analiseBetaDispose_'+side]();
let appAlive=true;
function isCurrentApp(){return appAlive;}

  /*
ANÁLISE BETA V6.6.13 — BASE V6.4.5 + VARIAÇÕES V6.4.9.

- Pós-loss atravessa a pausa MASTER; PÓS-3 LOSS independente, todas as estratégias e prioridade máxima.
- Sequências de LOSS finais sobrevivem ao descarte da janela; checkpoint sem fila ilimitada.
- Busca geométrica validada preservada; seleção parcial exata e metadados de geometria reutilizados; salvamento compactado em segundo plano.
- Número aparece imediatamente; indicação atualiza uma única vez, sem tela provisória vazia.
- Estado completo salvo após cada número, com retomada da fila ao reabrir.
- Reutilização de caches de análises puras; critérios e cálculos mantidos.
- MASTER decide entre as estratégias, incluindo o Treinador Global independente.
- Após encerrar entrada/G1, MASTER observa dois resultados completos antes do próximo sinal.
- Linha MASTER registra os ciclos executados; sem resultados fictícios durante a pausa.
- Ajuste visual: quadro expande sob a própria linha, sem rolagem programada; textos e números compactos.
- Pós-loss exclusivamente das 12 adaptativas; pode intervir sobre qualquer seleção quando ligado.
- Nome da linha do tempo abre quadro de jogo; indicação pós-loss destacada; placares separados.
- Botão 3º automático por proprietário; PÓS-LOSS automático entre perdas finais recentes.
- Pós-loss sem validação mínima: LOSS final já habilita a estratégia. Histórico apenas ordena as candidatas.
- Treinador Global e Pós-loss podem ficar ligados juntos: sem LOSS novo segue o Global; com LOSS usa o Pós-loss.
- Estratégia BASE selecionável, além de V1–V8 em cada grupo.
- Ranking das oito variações: posição, acerto direto e melhor ao lado do nome.
- Linhas por ciclo: W verde, G1 amarelo; o mesmo quadrinho vira R vermelho se perder a defesa.
- Grupos de treinadores, originais e variações recolhíveis.
- Somente Treinador Global e Treinador Global Números.
- Oito variações por original e Treinador Números.
- Cada variação conserva NORMAL, DINAMICO, RX_NORMAL e RX_DINAMICO, C4/C5/C6.
- Cada conjunto tem 12 coberturas distintas de 28 e cobre a roda inteira, 37/37.
- Janela importada de 8 a 70; entram 10 novos, saem 10 antigos.
- Análises e próxima jogada atualizadas a cada número; descarte de dez a cada dez.
- Jogada e defesa comprometidas preservadas, inclusive na virada do bloco.
- Melhor variação virtual no lugar do líquido; avaliação somente com resultados passados.
- Processamento em segundo plano quando disponível; número recebido aparece imediatamente.
- Análises de triangulação, amplitude, percurso, encadeamento, polos e arcos mantidas.

Cobertura conjunta não transforma uma jogada de 28 em cobertura individual de 37.
*/
  const VERSION = "6.6.13",
    KEY = 'ANALISE_BETA_V664_DUAL_'+side,
    WINDOW = 70;
  const OLD_KEYS=[];
  const W = [
    32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
    16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26, 0,
  ];

  const W_INDEX = Array(37);

  W.forEach((n, i) => {
    W_INDEX[n] = i;
  });

  const RED = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ]);

  const REGIONS = {
    TIERS: [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33],
    ORFAOS: [17, 34, 6, 1, 20, 14, 31, 9],
    VOISINS: [22, 18, 29, 7, 25, 2, 21, 4, 19],
    ZERO: [28, 12, 35, 3, 26, 0, 32, 15],
  };

  const FAMILIES = ["NORMAL", "DINAMICO", "RX_NORMAL", "RX_DINAMICO"],
    RADII = [4, 5, 6];

  const ORIGINALS = [
    ["FIXED", "AUTO RANKING"],
    ["GEO", "MELHOR GEOMETRIA"],
    ["BEST", "MELHOR DESEMPENHO"],
    ["STABLE", "ESTABILIDADE"],
    ["SWITCH", "TROCA INTELIGENTE"],
    ["CONSENSUS", "CONSENSO"],
    ["UNION", "UNIÃO"],
  ];

  const ADAPTATIVES = Array.from({ length: 12 }, (_, i) => ({
    id: "A" + String(i + 1).padStart(2, "0"),
    name: "ADAPTATIVA " + String(i + 1).padStart(2, "0"),
    window: [10, 10, 10, 20, 20, 20, 30, 30, 20, 30, 20, 30][i],
    margin: [
      0.05, 0.1, 0.15, 0.05, 0.1, 0.15, 0.05, 0.1, 0.08, 0.12, 0.1, 0.08,
    ][i],
    maxRank: [12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 4, 8][i],
  }));

  const G1_MODES = ["CONGELADA", "AJUSTE FINO", "RECONSTRUÇÃO"],
    BEHAVIORS = ["CONTINUIDADE", "DESLOCAMENTO", "RUPTURA"];

  const $ = (id) => document.getElementById(id),
    mod = (n) => ((n % 37) + 37) % 37,
    ix = (n) => (Number.isInteger(n) && n >= 0 && n <= 36 ? W_INDEX[n] : -1),
    avg = (a) => (a.length ? a.reduce((s, n) => s + n, 0) / a.length : 0),
    clamp = (n, a, b) => Math.max(a, Math.min(b, n)),
    copy = (x) => (x == null ? x : JSON.parse(JSON.stringify(x))),
    fmt = (n) => (Number.isFinite(n) ? n.toFixed(2).replace(".", ",") : "—"),
    pct = (a, b) => (b ? fmt((100 * a) / b) + "%" : "—");

  const nearBand = (n) =>
    n === 0 ? "0" : n <= 2 ? "1-2" : n <= 4 ? "3-4" : n <= 8 ? "5-8" : "9+";

  function esc(x) {
    return String(x ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  function cleanNumbers(a) {
    return Array.isArray(a)
      ? a.filter((n) => Number.isInteger(n) && n >= 0 && n <= 36)
      : [];
  }

  function neighbors(n, r) {
    const p = ix(n);
    return p < 0
      ? []
      : Array.from({ length: 2 * r + 1 }, (_, i) => W[mod(p + i - r)]);
  }

  function distance(a, b) {
    const x = ix(a),
      y = ix(b);
    if (x < 0 || y < 0) return 18;
    const d = Math.abs(x - y);
    return Math.min(d, 37 - d);
  }

  function direction(a, b) {
    const x = ix(a),
      y = ix(b);
    if (x < 0 || y < 0) return 0;
    const f = mod(y - x),
      r = mod(x - y);
    return f <= r ? f : -r;
  }

  function region(n) {
    return Object.keys(REGIONS).find((k) => REGIONS[k].includes(n)) || "ZERO";
  }

  const MIRROR = new Set();

  for (const n of [11, 12, 13, 21, 22, 23, 31, 32, 33])
    for (const x of neighbors(n, 1)) MIRROR.add(x);

  function mirror(n) {
    return MIRROR.has(n) ? "ESPELHO" : "ANTIESPELHO";
  }

  function signaturePlay(play) {
    return play.blocks
      .map((b) => b.radius + ":" + b.center)
      .sort()
      .join("|");
  }

  function validPlay(p) {
    return (
      !!p &&
      typeof p === "object" &&
      Array.isArray(p.numbers) &&
      p.numbers.length === 28 &&
      p.numbers.every((n) => Number.isInteger(n) && n >= 0 && n <= 36) &&
      new Set(p.numbers).size === 28 &&
      Array.isArray(p.blocks) &&
      p.blocks.length === 6 &&
      p.blocks.filter((b) => b.radius === 2).length === 5 &&
      p.blocks.filter((b) => b.radius === 1).length === 1 &&
      p.blocks.every(
        (b) =>
          Number.isInteger(b.center) &&
          ix(b.center) >= 0 &&
          Array.isArray(b.numbers) &&
          b.numbers.join(",") === neighbors(b.center, b.radius).join(","),
      ) &&
      p.blocks.flatMap((b) => b.numbers).every((n) => p.numbers.includes(n))
    );
  }

  function restoreShape(shape, score) {
    const blocks = shape.split("|").map((part) => {
      const [radius, center] = part.split(":").map(Number);
      return { center, radius, numbers: neighbors(center, radius) };
    });
    const play = { blocks, numbers: blocks.flatMap((b) => b.numbers), score };
    if (!validPlay(play)) throw Error("GEOMETRIA SALVA INVÁLIDA.");
    return play;
  }

  function cycleIsFree() {
    return state.phase === "ENTRY" && state.cycle === null;
  }

  const FIVE = W.map((n) => ({
      center: n,
      radius: 2,
      numbers: neighbors(n, 2),
    })),
    THREE = W.map((n) => ({ center: n, radius: 1, numbers: neighbors(n, 1) }));

  for (const b of [...FIVE, ...THREE])
    b.mask = b.numbers.reduce((s, n) => s | (1n << BigInt(ix(n))), 0n);

  function missing(play) {
    return validPlay(play)
      ? W.filter((n) => !play.numbers.includes(n))
      : [...W];
  }

  function hopTrend(a, b) {
    const x = Math.abs(a),
      y = Math.abs(b);
    return !x && !y
      ? "PARADO"
      : !x
        ? "SAÍDA"
        : !y
          ? "PARADA"
          : y < x
            ? "CONTRAÇÃO"
            : y > x
              ? "EXPANSÃO"
              : "MANUTENÇÃO";
  }

  function lengthBand(n) {
    return n === 0
      ? "0"
      : n <= 6
        ? "1-6"
        : n <= 18
          ? "7-18"
          : n <= 36
            ? "19-36"
            : n <= 72
              ? "37-72"
              : "73+";
  }

  function routeFeatures(numbers) {
    const steps = numbers.slice(1).map((n, i) => direction(numbers[i], n)),
      net = steps.reduce((s, n) => s + n, 0),
      length = steps.reduce((s, n) => s + Math.abs(n), 0),
      signs = new Set(steps.filter(Boolean).map(Math.sign)),
      sameDirection = signs.size === 1,
      closure = numbers.length ? distance(numbers[0], numbers.at(-1)) : 0,
      contour = sameDirection && Math.abs(net) >= 31 && closure <= 6,
      completedTurns = Math.floor(Math.abs(net) / 37),
      nearestTurns = Math.round(net / 37),
      residual = net - nearestTurns * 37,
      trends = steps.slice(1).map((n, i) => hopTrend(steps[i], n)),
      labels = [];
    if (closure === 0) labels.push("FECHAMENTO EXATO");
    else if (closure <= 2) labels.push("FECHAMENTO A 1-2 CASAS");
    else if (closure <= 6) labels.push("FECHAMENTO A 3-6 CASAS");
    if (contour) labels.push("FECHAMENTO POR CONTORNO");
    if (completedTurns) labels.push("VOLTA ACUMULADA " + completedTurns);
    if (trends.length) labels.push(trends.at(-1));
    return {
      numbers: [...numbers],
      steps,
      net,
      length,
      sameDirection,
      closure,
      contour,
      completedTurns,
      nearestTurns,
      residual,
      trends,
      amplitude: Math.max(0, ...steps.map(Math.abs)),
      efficiency: length ? Math.abs(net) / length : 0,
      labels,
    };
  }

  function normalizeSpace(w) {
    const mean = avg(w) || 1;
    return w.map((v) => v / mean);
  }

  function routeSimilarity(a, b) {
    if (a.steps.length !== b.steps.length) return 0;
    const order = avg(a.steps.map((v, i) => Math.abs(v - b.steps[i]))),
      trend = avg(a.trends.map((v, i) => (v === b.trends[i] ? 1 : 0)));
    return (
      Math.exp(
        -Math.abs(a.net - b.net) / 10 -
          Math.abs(a.closure - b.closure) / 4 -
          Math.abs(a.length - b.length) / 12 -
          order / 6,
      ) *
      (a.contour === b.contour ? 1 : 0.35) *
      (a.sameDirection === b.sameDirection ? 1 : 0.5) *
      (0.5 + 0.5 * (a.trends.length ? trend : 1))
    );
  }

  function routeRead(h) {
    const current = [];
    for (let size = 3; size <= Math.min(8, h.length); size++)
      current.push(routeFeatures(h.slice(-size)));
    const weights = Array(37).fill(1),
      matched = new Set();
    let examples = 0;
    for (const r of current) {
      const size = r.numbers.length;
      for (let end = size - 1; end < h.length - 1; end++) {
        const old = routeFeatures(h.slice(end - size + 1, end + 1)),
          similarity = routeSimilarity(old, r),
          recency = Math.exp(-(h.length - 2 - end) / 30),
          projected = W[mod(ix(h.at(-1)) + direction(h[end], h[end + 1]))];
        if (similarity > 0.35) {
          examples++;
          matched.add(end + 1);
        }
        for (let j = 0; j < 37; j++)
          weights[j] +=
            (similarity * recency * Math.exp(-distance(W[j], projected) / 2)) /
            Math.sqrt(size);
      }
    }
    const triangle = current.find((r) => r.numbers.length === 3),
      chain = current.find((r) => r.numbers.length === 4),
      key = triangle
        ? "R:C" +
          Number(triangle.contour) +
          "|F" +
          nearBand(triangle.closure) +
          "|D" +
          Math.sign(triangle.net) +
          "|V" +
          Math.min(2, chain?.completedTurns || 0) +
          "|L" +
          lengthBand(triangle.length) +
          "|H" +
          triangle.trends.join(",")
        : "R:SEM PERCURSO";
    return {
      current,
      examples,
      uniqueExamples: matched.size,
      weights: normalizeSpace(weights),
      key,
      triangle: triangle || null,
      chain: chain || null,
    };
  }

  const triangleCache = new Map();

  function pointTriangle(n) {
    const a = (2 * Math.PI * ix(n)) / 37;
    return { x: Math.sin(a), y: Math.cos(a) };
  }

  function angleTriangle(a, b, c) {
    const u = { x: a.x - b.x, y: a.y - b.y },
      v = { x: c.x - b.x, y: c.y - b.y },
      d = Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y);
    return d < 1e-12
      ? null
      : (Math.acos(clamp((u.x * v.x + u.y * v.y) / d, -1, 1)) * 180) / Math.PI;
  }

  function triangleFeatures(a, b, c) {
    const s1 = direction(a, b),
      s2 = direction(b, c),
      closure = distance(a, c),
      p = pointTriangle(a),
      q = pointTriangle(b),
      r = pointTriangle(c),
      area =
        Math.abs((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)) / 2;
    let type = "MUDANÇA DE SETOR";
    if (a === b && b === c) type = "REPETIÇÃO";
    else if (a === c) type = "RETORNO EXATO";
    else if (b === c) type = "REPETIÇÃO FINAL";
    else if (!s1) type = "SAÍDA DA REPETIÇÃO";
    else if (Math.sign(s1) === Math.sign(s2)) type = "CONTINUAÇÃO";
    else if (closure < Math.abs(s1)) type = "RETORNO PARCIAL";
    else type = "INVERSÃO COM AFASTAMENTO";
    const route = routeFeatures([a, b, c]);
    return {
      a,
      b,
      c,
      s1,
      s2,
      closure,
      area,
      type,
      route,
      trend: hopTrend(s1, s2),
      ratio: Math.abs(s1) ? Math.abs(s2) / Math.abs(s1) : null,
      contour: route.contour,
      labels: [type, ...route.labels],
      chords: [
        Math.hypot(p.x - q.x, p.y - q.y),
        Math.hypot(q.x - r.x, q.y - r.y),
        Math.hypot(p.x - r.x, p.y - r.y),
      ],
      angles: [
        angleTriangle(q, p, r),
        angleTriangle(p, q, r),
        angleTriangle(p, r, q),
      ],
      degenerate: area < 1e-10,
    };
  }

  function triangleContext(h) {
    if (h.length < 3) return "SEM TRINCA";
    const f = triangleFeatures(...h.slice(-3));
    return (
      f.type +
      "|F:" +
      nearBand(f.closure) +
      "|C:" +
      Number(f.contour) +
      "|S:" +
      Math.sign(f.route.net) +
      "|H:" +
      f.trend +
      "|L:" +
      lengthBand(f.route.length)
    );
  }

/* Memória causal do quarto resultado. Geometria simulada não é observação.
   O atlas enumera formas possíveis; distribuições usam SOMENTE sucessores vistos.
   Cada canal conta uma ocorrência uma vez. Canais não somam suas amostras.
   Sem suporte e avaliação cronológica favorável, a influência é exatamente zero. */
function createTriangleMemory666(wheel){
  const N=37, index=Array(N), names=[
    'TRINCA EXATA → QUARTO', 'FORMA GIRADA', 'FORMA REFLETIDA',
    'AMPLITUDE E PROPORÇÃO', 'ENCADEAMENTO 4–8', 'FECHAMENTO E CONTORNO',
    'ARCO → PRÓXIMO RESULTADO', 'POLOS → PRÓXIMO RESULTADO'
  ];
  wheel.forEach((n,i)=>{index[n]=i;});
  const mod=n=>(n%N+N)%N;
  const jump=(a,b)=>{const d=mod(b-a);return d<=18?d:d-N;};
  const dist=(a,b)=>Math.abs(jump(a,b));
  const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
  const cache=new Map(), forecasts=new Map();
  const keep=(map,key,value)=>{map.set(key,value);if(map.size>384)map.delete(map.keys().next().value);return value;};
  const points=Array.from({length:N},(_,i)=>[Math.sin(i*2*Math.PI/N),Math.cos(i*2*Math.PI/N)]);
  const chord=(a,b)=>Math.hypot(points[a][0]-points[b][0],points[a][1]-points[b][1]);
  const angle=(a,b,c)=>{
    const x=points[a][0]-points[b][0],y=points[a][1]-points[b][1];
    const u=points[c][0]-points[b][0],v=points[c][1]-points[b][1];
    const length=Math.hypot(x,y)*Math.hypot(u,v);
    return length<1e-12?null:Math.acos(Math.max(-1,Math.min(1,(x*u+y*v)/length)))*180/Math.PI;
  };
  // Fixar A na posição 0 elimina apenas rotações: 37² formas, todas as repetições inclusas.
  const atlas=Array.from({length:N*N},(_,id)=>{
    const b=Math.floor(id/N),c=id%N,s1=jump(0,b),s2=jump(b,c);
    const closure=dist(0,c),net=s1+s2;
    const area=Math.abs((points[b][0]-points[0][0])*(points[c][1]-points[0][1])-(points[b][1]-points[0][1])*(points[c][0]-points[0][0]))/2;
    const type=b===0&&c===0?'TRIPLA':c===0?'RETORNO':b===0?'REPETIÇÃO INICIAL':b===c?'REPETIÇÃO FINAL':Math.sign(s1)===Math.sign(s2)?'CONTINUIDADE':'INVERSÃO';
    return Object.freeze({s1,s2,closure,net,length:Math.abs(s1)+Math.abs(s2),
      trend:Math.sign(Math.abs(s2)-Math.abs(s1)),type,area,degenerate:area<1e-10,
      ratio:s1?Math.abs(s2/s1):null,
      contour:Math.sign(s1)===Math.sign(s2)&&s1!==0&&Math.abs(net)>=31&&closure<=6,
      chords:[chord(0,b),chord(b,c),chord(0,c)],angles:[angle(b,0,c),angle(0,b,c),angle(0,c,b)]});
  });
  const feature=(a,b,c)=>atlas[mod(b-a)*N+mod(c-a)];
  const kernels=Array.from({length:N},(_,center)=>{
    const values=Array.from({length:N},(_,j)=>Math.exp(-dist(center,j)/1.25));
    const total=values.reduce((s,v)=>s+v,0);return values.map(v=>v/total);
  });
  function arc(p,end){
    const start=Math.max(0,end-5);let best=null;
    for(let sector=0;sector<N;sector++){
      let count=0;for(let i=start;i<=end;i++)if(mod(p[i]-sector)<8)count++;
      if(!best||count>best.count)best={start:sector,count};
    }
    if(!best||best.count<3)return null;
    const inside=mod(p[end]-best.start)<8;
    return {...best,inside,total:end-start+1,offset:mod(p[end]-best.start)};
  }
  function poles(p,end){
    if(end<3)return null;
    const a=p[end-3],b=p[end-2],c=p[end-1],d=p[end];
    if(dist(a,b)<8||dist(a,c)>2||dist(b,d)>2)return null;
    const initial=dist(a,b),separation=dist(c,d);
    return {a,b,c,d,separation,movement:Math.sign(separation-initial)};
  }
  function raw(history){
    const h=history.slice(-70),key=h.join(',');if(cache.has(key))return cache.get(key);
    const p=h.map(n=>index[n]),end=p.length-1;
    const modes=names.map(name=>({name,support:0,occurrences:0,weights:Array(N).fill(6)}));
    if(end<2)return keep(cache,key,modes.map(m=>({...m,weights:Array(N).fill(1)})));
    const current=feature(p[end-2],p[end-1],p[end]);
    const currentArc=arc(p,end),currentPoles=poles(p,end);
    function add(k,weight,center,exact=false){
      if(weight<0.025)return;
      const mode=modes[k];mode.support+=weight;mode.occurrences++;
      if(exact)mode.weights[mod(center)]+=weight*N;
      else for(let j=0;j<N;j++)mode.weights[j]+=weight*N*kernels[mod(center)][j];
    }
    for(let old=2;old<end;old++){
      // old+1 is an observed successor and is never the unknown next spin.
      const f=feature(p[old-2],p[old-1],p[old]),next=p[old+1];
      const recency=Math.exp(-(end-old-1)/28),delta=jump(p[old],next);
      if(h[old-2]===h[end-2]&&h[old-1]===h[end-1]&&h[old]===h[end])add(0,recency,next,true);
      const shape=(f.type===current.type?1:0.2)*(f.trend===current.trend?1:0.4);
      const sameDiff=Math.abs(f.s1-current.s1)+Math.abs(f.s2-current.s2);
      if(sameDiff<=4)add(1,recency*Math.exp(-sameDiff/2)*shape,p[end]+delta);
      const reflectedDiff=Math.abs(f.s1+current.s1)+Math.abs(f.s2+current.s2);
      if(reflectedDiff<=4)add(2,recency*Math.exp(-reflectedDiff/2)*shape,p[end]-delta);
      const amplitudeDiff=Math.abs(Math.abs(f.s1)-Math.abs(current.s1))+Math.abs(Math.abs(f.s2)-Math.abs(current.s2));
      if(amplitudeDiff<=5&&f.trend===current.trend&&Math.abs(f.closure-current.closure)<=3){
        const sign=Math.sign(current.s2)*Math.sign(f.s2)||1;
        const ratio=f.ratio==null||current.ratio==null?1:Math.exp(-Math.abs(Math.log((f.ratio+0.1)/(current.ratio+0.1))));
        add(3,recency*Math.exp(-amplitudeDiff/3)*ratio,p[end]+delta*sign);
      }
      // One historical endpoint contributes once: choose its longest supported chain.
      let chain=null;
      for(let length=Math.min(8,old+1,end+1);length>=4;length--){
        let error=0,opposite=0;
        for(let k=0;k<length-1;k++){
          const a=jump(p[end-k-1],p[end-k]),b=jump(p[old-k-1],p[old-k]);
          error+=Math.abs(a-b);if(Math.sign(a)!==Math.sign(b))opposite++;
        }
        if(error/(length-1)<=2&&opposite<=1){chain={error:error/(length-1),length};break;}
      }
      if(chain)add(4,recency*Math.exp(-chain.error/2)*(chain.length-2)/6,p[end]+delta);
      if(current.closure<=6&&f.closure<=6&&current.contour===f.contour&&f.type===current.type&&f.trend===current.trend){
        const similarity=Math.exp(-Math.abs(current.closure-f.closure)/2-Math.abs(current.length-f.length)/8-Math.abs(current.area-f.area));
        add(5,recency*similarity,p[end-2]+jump(p[old-2],next));
      }
      const oldArc=currentArc?arc(p,old):null;
      if(oldArc&&oldArc.inside===currentArc.inside&&Math.abs(oldArc.count-currentArc.count)<=1&&Math.abs(oldArc.total-currentArc.total)<=1){
        const relative=dist(oldArc.offset,currentArc.offset);
        if(relative<=4)add(6,recency*Math.exp(-relative/2),currentArc.start+mod(next-oldArc.start));
      }
      const oldPoles=currentPoles?poles(p,old):null;
      if(oldPoles&&oldPoles.movement===currentPoles.movement&&Math.abs(oldPoles.separation-currentPoles.separation)<=3){
        add(7,recency*Math.exp(-Math.abs(oldPoles.separation-currentPoles.separation)/2),currentPoles.c+jump(oldPoles.c,next));
      }
    }
    for(const mode of modes){const average=mean(mode.weights);mode.weights=mode.weights.map(v=>v/average);}
    return keep(cache,key,modes);
  }
  function analyze(history,baseline){
    const h=history.slice(-70),key=h.join(',');if(forecasts.has(key))return forecasts.get(key);
    const current=raw(h),base=baseline(h),logs=names.map(()=>[]);
    // Rolling chronological validation. No actual result enters its own forecast.
    for(let t=Math.max(8,h.length-24);t<h.length;t++){
      const before=h.slice(0,t),past=raw(before),previous=baseline(before),outcome=index[h[t]];
      for(let k=0;k<names.length;k++){
        if(past[k].support<2||past[k].occurrences<3)continue;
        const comparison=previous[outcome],trial=0.85*comparison+0.15*past[k].weights[outcome];
        logs[k].push(Math.log(Math.max(1e-9,trial)/Math.max(1e-9,comparison)));
      }
    }
    const modes=current.map((model,k)=>{
      const values=logs[k],gain=mean(values),count=values.length;
      const variance=count>1?values.reduce((s,x)=>s+(x-gain)**2,0)/(count-1):0;
      const stderr=count?Math.sqrt(variance/count):0;
      const recentGain=mean(values.slice(-4));
      const active=count>=8&&model.occurrences>=3&&model.support>=2&&gain>stderr&&recentGain>0;
      const mass=active?Math.min(0.2,(gain-stderr)*5)*count/(count+16)*Math.min(1,model.support/8):0;
      return {...model,evaluations:count,meanLogGain:gain,stderr,recentGain,active,mass};
    });
    const totalMass=modes.reduce((s,m)=>s+m.mass,0),influence=Math.min(0.2,totalMass);
    const weights=totalMass?base.map((v,j)=>v*(1-influence)+influence*modes.reduce((s,m)=>s+m.weights[j]*m.mass,0)/totalMass):[...base];
    return keep(forecasts,key,{weights,modes,influence,observedSuccessors:Math.max(0,h.length-3),
      status:influence?'ATIVA EM TESTE CRONOLÓGICO':'SEM SUPORTE FAVORÁVEL — BASE PRESERVADA'});
  }
  return {raw,analyze,feature,atlas,names,clear(){cache.clear();forecasts.clear();}};
}


  /* Leitura estrutural ativa. Enumera os 37 próximos resultados e seus estados.
   Uma alternativa possível não é uma previsão confirmada. Somente sucessores
   já observados atribuem peso. Leitura e escolha permanecem separadas. */
function createMotorReadings667(wheel, atlas) {
  const size = 37;
  const positions = Array(size);
  wheel.forEach((number, index) => { positions[number] = index; });
  const mod = value => (value % size + size) % size;
  const jump = (from, to) => {
    const forward = mod(to - from);
    return forward <= 18 ? forward : forward - size;
  };
  const distance = (from, to) => Math.abs(jump(from, to));
  const average = values => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
  const band = value => value === 0 ? '0' : value <= 2 ? '1–2' : value <= 6 ? '3–6' : value <= 12 ? '7–12' : '13+';
  const amplitudeBand = value => value <= 3 ? 'CURTO' : value <= 9 ? 'MÉDIO' : 'LONGO';
  const normalize = values => {
    const mean = average(values) || 1;
    return values.map(value => value / mean);
  };
  const cache = new Map();
  const groups = ['TRIANGULAÇÃO', 'AMPLITUDE', 'ENCADEAMENTO', 'FECHAMENTO/PERCURSO', 'POLOS', 'ARCOS'];
  const profiles = [
    [1, 1, 1, 1, 1, 1],
    [1.2, 1.8, 1.5, 1, .6, .6],
    [.8, .7, .8, 1.3, 1.1, 1.7],
    [.8, 1.1, 2, 2, .6, .6],
    [2.3, 1.2, 1.6, 1.8, .5, .5],
    [.6, .6, .7, .8, 2.4, 2.1],
    [1.4, .8, .9, 2, 1.7, .6],
    [.8, 2.2, 1.4, 1.5, .6, 1.3]
  ];

  /* Atlas completo: nenhum corte por ranking, frequência ou classe.
     ID = posição relativa de B * 37 + posição relativa de C, com A = 0.
     Cada registro guarda atributos exatos; somente o passado fornece sucessores. */
  const relativeForms = Array.from({ length: 1369 }, (_, id) => {
    const b = Math.floor(id / 37), c = id % 37;
    const shape = atlas.feature(0, b, c);
    return Object.freeze({ ...shape, id, positions: Object.freeze([0, b, c]),
      amplitudes: Object.freeze([Math.abs(shape.s1), Math.abs(shape.s2)]),
      amplitudeId: Math.abs(shape.s1) * 19 + Math.abs(shape.s2),
      amplitudeChange: Math.abs(shape.s2) - Math.abs(shape.s1),
      perimeter: shape.chords.reduce((sum, value) => sum + value, 0),
      partialReturn: c !== 0 && shape.s1 * shape.s2 < 0 && shape.closure < Math.abs(shape.s1),
      signedResidual: shape.net - Math.round(shape.net / 37) * 37,
      algebraicTurns: shape.net / 37,
      chords: Object.freeze([...shape.chords]), angles: Object.freeze([...shape.angles])
    });
  });
  const amplitudeForms = Array.from({ length: 361 }, (_, id) => {
    const first = Math.floor(id / 19), second = id % 19;
    return Object.freeze({ id, first, second, difference: second - first,
      ratio: first === 0 ? null : second / first,
      trend: second < first ? 'CONTRAÇÃO' : second > first ? 'EXPANSÃO' : 'MANUTENÇÃO' });
  });
  const formId = (a, b, c) => mod(b - a) * 37 + mod(c - a);
  const kernelCache = new Map();

  function fullKernels(currentId) {
    if (kernelCache.has(currentId)) return kernelCache.get(currentId);
    const current = relativeForms[currentId];
    const geometry = new Float64Array(1369);
    const closure = new Float64Array(1369);
    const amplitude = new Float64Array(361);
    for (const old of relativeForms) {
      // Todos os 1.369 registros são avaliados, sem faixas arredondadas.
      const steps = (Math.abs(current.s1 - old.s1) + Math.abs(current.s2 - old.s2)) / 12;
      const chords = current.chords.reduce((sum, value, i) => sum + Math.abs(value - old.chords[i]), 0) / 3;
      const angles = current.angles.reduce((sum, value, i) => {
        const other = old.angles[i];
        return sum + (value == null || other == null ? Number(value !== other) : Math.abs(value - other) / 180);
      }, 0) / 3;
      const area = Math.abs(current.area - old.area);
      const ratio = current.ratio == null || old.ratio == null
        ? Number(current.ratio !== old.ratio)
        : Math.abs(Math.atan(current.ratio) - Math.atan(old.ratio));
      const attributes = Math.abs(current.closure - old.closure) / 18 +
        Math.abs(current.amplitudeChange - old.amplitudeChange) / 36 + ratio +
        Number(current.partialReturn !== old.partialReturn) + Number(current.degenerate !== old.degenerate);
      geometry[old.id] = Math.exp(-steps - chords - angles - area - attributes) + (old.id === currentId ? 4 : 0);
      closure[old.id] = Math.exp(-Math.abs(current.closure - old.closure) / 4 -
        Math.abs(current.net - old.net) / 12 - Math.abs(current.length - old.length) / 12 -
        Number(current.contour !== old.contour));
    }
    for (const old of amplitudeForms) {
      amplitude[old.id] = Math.exp(-(Math.abs(current.amplitudes[0] - old.first) +
        Math.abs(current.amplitudes[1] - old.second)) / 5 -
        Math.abs(current.amplitudeChange - old.difference) / 8) +
        (old.id === current.amplitudeId ? 3 : 0);
    }
    const result = { geometry, closure, amplitude };
    kernelCache.set(currentId, result);
    if (kernelCache.size > 32) kernelCache.delete(kernelCache.keys().next().value);
    return result;
  }

  function exhaustiveRead(prefix) {
    const formCounts = new Uint16Array(1369);
    const amplitudeCounts = new Uint16Array(361);
    const observed = new Map();
    // A trinca corrente ainda não tem sucessor e não pode treiná-lo.
    for (let end = 2; end < prefix.length - 1; end++) {
      const id = formId(prefix[end - 2], prefix[end - 1], prefix[end]);
      const shape = relativeForms[id];
      const nextStep = jump(prefix[end], prefix[end + 1]);
      const mass = Math.exp(-(prefix.length - 2 - end) / 28);
      formCounts[id]++;
      amplitudeCounts[shape.amplitudeId]++;
      let record = observed.get(id);
      if (!record) {
        record = { id, count: 0, mass: 0, successors: new Map() };
        observed.set(id, record);
      }
      record.count++;
      record.mass += mass;
      const next = record.successors.get(nextStep) || { step: nextStep, count: 0, mass: 0 };
      next.count++;
      next.mass += mass;
      record.successors.set(nextStep, next);
    }
    const currentId = prefix.length >= 3 ? formId(...prefix.slice(-3)) : null;
    const groups = [0, 1, 3].map(group => ({ name: ['TRIANGULAÇÃO', 'AMPLITUDE', '', 'FECHAMENTO/PERCURSO'][group],
      group, support: 0, modes: group === 1 ? 361 : 1369, weights: Array(37).fill(8) }));
    if (currentId != null) {
      const kernels = fullKernels(currentId);
      const anchor = prefix.at(-1);
      // Percorre explicitamente o atlas inteiro. Sem ocorrência, contribuição
      // observada é zero; o registro continua disponível, sem inventar evidência.
      for (let id = 0; id < 1369; id++) {
        const shape = relativeForms[id], record = observed.get(id);
        if (!record) continue;
        const coefficients = [kernels.geometry[id], kernels.amplitude[shape.amplitudeId], kernels.closure[id]];
        groups.forEach((group, index) => {
          const coefficient = coefficients[index];
          group.support += coefficient * record.mass;
          for (const successor of record.successors.values()) {
            const target = mod(anchor + successor.step);
            const contribution = coefficient * successor.mass * 37;
            group.weights[target] += contribution * .7;
            group.weights[mod(target - 1)] += contribution * .15;
            group.weights[mod(target + 1)] += contribution * .15;
          }
        });
      }
    }
    groups.forEach(group => { group.weights = normalize(group.weights); });
    return { currentId, formsEvaluated: currentId == null ? 0 : 1369,
      amplitudesEvaluated: currentId == null ? 0 : 361,
      representedForms: 1369, representedAmplitudes: 361,
      numericTriples: 50653, formCounts, amplitudeCounts,
      observedForms: observed.size, successorSamples: Math.max(0, prefix.length - 3),
      observed: [...observed.values()].map(record => ({ ...record, successors: [...record.successors.values()] })), groups };
  }

  function catalogue(history, id = null) {
    const reading = read(history), data = reading.exhaustive;
    const describe = form => ({ ...form, occurrences: data.formCounts[form.id],
      successors: data.observed.find(record => record.id === form.id)?.successors || [],
      status: data.formCounts[form.id] ? 'OBSERVADA COM SUCESSOR' : 'REPRESENTADA SEM SUCESSOR OBSERVADO' });
    if (id != null) return Number.isInteger(id) && id >= 0 && id < 1369 ? describe(relativeForms[id]) : null;
    return relativeForms.map(describe);
  }

  // Capacidade finita explícita: qualquer sequência de até 70 resultados pode
  // ser descrita. Apenas sequências anteriores com sucessor treinam os pesos.
  const polePairs = Object.freeze(Array.from({length:1369},(_,id)=>{
    const a=Math.floor(id/37),b=id%37;
    return Object.freeze({id,positionA:a,positionB:b,numberA:wheel[a],numberB:wheel[b],
      separation:distance(a,b),direction:jump(a,b)});
  }));

  function polePairReading(prefix,next,a,b,tolerance){
    if(![a,b,next,tolerance].every(Number.isInteger)||a<0||a>36||b<0||b>36||next<0||next>36||tolerance<0||tolerance>18)return null;
    const da=distance(a,next),db=distance(b,next),insideA=da<=tolerance,insideB=db<=tolerance;
    const last=prefix.at(-1),previous=prefix.length>1?prefix.at(-2):null;
    const side=n=>n==null?-1:distance(a,n)>tolerance&&distance(b,n)>tolerance?-1:distance(a,n)<distance(b,n)?0:distance(a,n)>distance(b,n)?1:2;
    const currentSide=side(next),lastSide=side(last),priorSide=side(previous);
    let event=currentSide<0?'FORA DOS POLOS':currentSide===2?'SOBREPOSIÇÃO DOS POLOS':lastSide<0?'RETOMADA':lastSide===currentSide?'PERMANÊNCIA':'ALTERNÂNCIA';
    if(currentSide<0&&lastSide>=0)event='SAÍDA DOS POLOS';
    if(currentSide<0&&lastSide<0&&priorSide>=0)event='RUPTURA';
    if(a===b&&currentSide>=0)event='POLO ÚNICO / CONCENTRAÇÃO';
    const oldSeparation=distance(a,b);
    const newSeparation=currentSide===0?distance(next,b):currentSide===1?distance(a,next):oldSeparation;
    const movement=Math.sign(newSeparation-oldSeparation);
    if(currentSide>=0&&currentSide<2&&oldSeparation>0&&newSeparation===0)event='FUSÃO';
    else if(event==='ALTERNÂNCIA'&&movement<0)event='CONVERGÊNCIA';
    else if(event==='ALTERNÂNCIA'&&movement>0)event='DIVERGÊNCIA';
    return {tolerance,positionA:a,positionB:b,numberA:wheel[a],numberB:wheel[b],
      separation:oldSeparation,nextSeparation:newSeparation,movement,distanceA:da,distanceB:db,
      insideA,insideB,overlap:insideA&&insideB,side:currentSide,event,
      shiftA:currentSide===0?jump(a,next):0,shiftB:currentSide===1?jump(b,next):0};
  }

  function poleWindowWeights(prefix){
    const weights=Array(37).fill(8),tolerances=Array.from({length:19},(_,t)=>({tolerance:t,support:0}));
    if(prefix.length<4)return {name:'POLOS',weights:normalize(weights),support:0,tolerances,pairPositions:1369,separations:19};
    const current=prefix.slice(-4),[a,b,c,d]=current;
    const features=q=>({initial:distance(q[0],q[1]),final:distance(q[2],q[3]),
      shiftA:jump(q[0],q[2]),shiftB:jump(q[1],q[3]),span:jump(q[0],q[1])});
    const now=features(current);let support=0,samples=0;
    for(let end=3;end<prefix.length-1;end++){
      const q=prefix.slice(end-3,end+1),old=features(q);
      const geometry=Math.exp(-Math.abs(now.initial-old.initial)/6-Math.abs(now.final-old.final)/6-
        Math.abs(now.shiftA-old.shiftA)/8-Math.abs(now.shiftB-old.shiftB)/8-Math.abs(now.span-old.span)/10);
      let coefficient=0;
      for(let t=0;t<=18;t++){
        const activeNow=Math.abs(now.shiftA)<=t&&Math.abs(now.shiftB)<=t;
        const activeOld=Math.abs(old.shiftA)<=t&&Math.abs(old.shiftB)<=t;
        // 0..18 são examinados; sobreposição é explícita e não são 19 ensaios independentes.
        const overlapNow=now.final<=2*t,overlapOld=old.final<=2*t;
        const similarity=geometry*(activeNow===activeOld?1:.25)*(overlapNow===overlapOld?1:.5);
        tolerances[t].support+=similarity;
        coefficient+=similarity/19;
      }
      const mass=coefficient*Math.exp(-(prefix.length-2-end)/28);
      const next=mod(c+jump(q[2],prefix[end+1]));
      weights[next]+=mass*37*.7;weights[mod(next-1)]+=mass*37*.15;weights[mod(next+1)]+=mass*37*.15;
      support+=mass;samples++;
    }
    return {name:'POLOS',weights:normalize(weights),support,tolerances,pairPositions:1369,separations:19,samples,
      current:{...now,numbers:current.map(p=>wheel[p]),movement:Math.sign(now.final-now.initial)}};
  }

  // Todas as janelas 1..N, todos os 37 inícios, larguras 1..36.
  // Largura 37 também é representada, mas é neutra: contém a roda inteira.
  function arcWindowWeights(prefix){
    const length=prefix.length,weights=Array(37).fill(8),tables=[];
    const windows=Array.from({length},(_,i)=>i+1);
    if(!length)return {name:'ARCOS',weights,support:0,windows,sectorCases:1369,uniqueCovers:1333};
    const eventTables=[],runTables=[];
    const previousFlags=new Uint8Array(1369),runs=new Uint8Array(1369),seen=new Uint8Array(1369);
    for(let end=0;end<length;end++){
      const table=new Uint8Array((end+1)*1369),frequency=new Uint8Array(37);
      for(let window=1;window<=end+1;window++){
        frequency[prefix[end-window+1]]++;
        const offset=(window-1)*1369;
        for(let start=0;start<37;start++){
          let count=0;
          for(let width=1;width<=37;width++){
            count+=frequency[mod(start+width-1)];
            table[offset+(width-1)*37+start]=count;
          }
        }
      }
      tables.push(table);
      const events=new Uint8Array(1369),runSnapshot=new Uint8Array(1369);
      for(let width=1;width<=37;width++)for(let start=0;start<37;start++){
        const id=(width-1)*37+start,inside=Number(mod(prefix[end]-start)<width);
        // 0=fora,1=entrada,2=permanência,3=saída,4=reentrada.
        events[id]=inside?(end&&previousFlags[id]?2:seen[id]?4:1):(end&&previousFlags[id]?3:0);
        runs[id]=end&&previousFlags[id]===inside?runs[id]+1:1;
        runSnapshot[id]=runs[id];previousFlags[id]=inside;if(inside)seen[id]=1;
      }
      eventTables.push(events);runTables.push(runSnapshot);
    }
    const current=tables.at(-1),currentEvents=eventTables.at(-1),currentRuns=runTables.at(-1);
    let support=0,comparisons=0;
    for(let end=0;end<length-1;end++){
      let coefficient=0,windowCount=end+1;
      for(let window=1;window<=windowCount;window++){
        let sum=0;const offset=(window-1)*1369;
        // Cada leitura espacial participa uma vez; sem somar como acertos.
        for(let id=0;id<1332;id++){
          const delta=Math.abs(current[offset+id]-tables[end][offset+id]);
          const density=1/(1+delta/window);
          const transition=currentEvents[id]===eventTables[end][id]?1:.35;
          const duration=1/(1+Math.abs(currentRuns[id]-runTables[end][id])/window);
          sum+=density*transition*duration;
        }
        coefficient+=sum/1332;comparisons+=1332;
      }
      const mass=coefficient/windowCount*Math.exp(-(length-2-end)/28);
      const next=prefix[end+1];
      weights[next]+=mass*37*.7;weights[mod(next-1)]+=mass*37*.15;weights[mod(next+1)]+=mass*37*.15;
      support+=mass;
    }
    return {name:'ARCOS',weights:normalize(weights),support,windows,sectorCases:1369,
      uniqueCovers:1333,comparisons,representedWindowSectorCases:length*1369};
  }

  function poleStep(previous, prefix, next, tolerance) {
    const state = previous ? {
      ...previous,
      anchors: previous.anchors ? [...previous.anchors] : null,
      drift: previous.drift ? [...previous.drift] : [0, 0]
    } : { active: false, anchors: null, drift: [0, 0], outside: 0, age: 0, event: 'SEM FORMAÇÃO' };
    state.age++;
    state.inactiveAge = state.active || state.concentration != null ? 0 : (state.inactiveAge || 0) + 1;
    if (state.anchors && (state.active || (state.event === 'RUPTURA' && state.outside <= 3))) {
      const oldDistance = distance(...state.anchors);
      const expected = 1 - state.lastSide;
      const de = distance(next, state.anchors[expected]);
      const ds = distance(next, state.anchors[state.lastSide]);
      if (de <= tolerance && de <= ds) {
        const resumed = !state.active || state.outside > 0 || state.event === 'INTERRUPÇÃO';
        state.drift[expected] += jump(state.anchors[expected], next);
        state.anchors[expected] = next;
        state.lastSide = expected;
        state.outside = 0;
        state.active = true;
        state.event = resumed ? 'RETOMADA' : 'ALTERNÂNCIA';
      } else if (state.active && ds <= tolerance) {
        state.drift[state.lastSide] += jump(state.anchors[state.lastSide], next);
        state.anchors[state.lastSide] = next;
        state.outside = 0;
        state.event = 'INTERRUPÇÃO';
      } else {
        state.outside++;
        state.event = state.outside >= 2 ? 'RUPTURA' : 'SAÍDA';
        if (state.outside >= 2) state.active = false;
      }
      state.separation = distance(...state.anchors);
      state.movement = Math.sign(state.separation - oldDistance);
      if (state.active && state.separation <= Math.max(2, tolerance)) {
        state.active = false;
        state.event = 'FUSÃO';
        state.concentration = next;
        state.fromFusion = true;
        state.concentrationOutside = 0;
      } else if (state.active && state.event === 'ALTERNÂNCIA') {
        if (state.movement < 0) state.event = 'CONVERGÊNCIA';
        if (state.movement > 0) state.event = 'DIVERGÊNCIA';
        if (!state.movement) state.event = 'MANUTENÇÃO';
      }
    } else if (state.concentration != null) {
      if (distance(next, state.concentration) <= Math.max(2, tolerance)) {
        state.concentration = next;
        state.fromFusion = true;
        state.concentrationOutside = 0;
        state.event = 'CONCENTRAÇÃO APÓS FUSÃO';
      } else {
        state.concentrationOutside++;
        state.event = state.concentrationOutside >= 2 ? 'DISPERSÃO APÓS FUSÃO' : 'SAÍDA APÓS FUSÃO';
        if (state.concentrationOutside >= 2) state.concentration = null;
      }
    }
    if (!state.active && prefix.length >= 3 && state.event !== 'FUSÃO') {
      const [a, b, c] = prefix.slice(-3);
      if (distance(a, b) >= (tolerance<=8?Math.max(8,2*tolerance+2):0) &&
          distance(a, c) <= tolerance && distance(b, next) <= tolerance) {
        const split = state.concentration != null || state.fromFusion;
        state.anchors = [c, next];
        state.drift = [jump(a, c), jump(b, next)];
        state.lastSide = 1;
        state.separation = distance(c, next);
        state.movement = Math.sign(state.separation - distance(a, b));
        state.outside = 0;
        state.active = true;
        state.concentration = null;
        state.event = tolerance>8&&distance(c,next)<=2*tolerance?'SOBREPOSIÇÃO DOS POLOS':split ? 'NOVOS POLOS APÓS FUSÃO' : 'FORMAÇÃO';
      }
    }
    if(state.active)state.inactiveAge=0;
    if(!state.active&&state.concentration==null&&state.inactiveAge>3){state.anchors=null;state.event='ENCERRADO';}
    return state;
  }

  function chooseArc(previous, prefix, width) {
    if (prefix.length < 4 || width === 37) return { width, start: null, event: 'SEM CONCENTRAÇÃO', outside: 0, inside: 0 };
    const sample = prefix.slice(-8);
    const counts = Array(size).fill(0);
    for (const position of sample) counts[position]++;
    let total = 0;
    for (let j = 0; j < width; j++) total += counts[j];
    let best = { start: 0, count: total };
    for (let start = 1; start < size; start++) {
      total += counts[mod(start + width - 1)] - counts[start - 1];
      if (total > best.count) best = { start, count: total };
    }
    const minimum = Math.max(2, Math.ceil(sample.length * width / size + 1));
    const state = previous ? { ...previous } : { width, start: null, outside: 0, inside: 0, weak: 0 };
    if (state.start != null) {
      const count = sample.filter(position => mod(position - state.start) < width).length;
      state.weak = count < minimum ? (state.weak || 0) + 1 : 0;
      if (best.count >= minimum && best.start !== state.start && best.count >= count + 2) {
        state.start = best.start;
        state.event = 'SUBSTITUIÇÃO';
        state.outside = 0;
        state.inside = 0;
        state.lastInside = null;
      } else if (state.weak >= 2 || (state.outside >= 8 && count < minimum)) {
        state.start = null;
        state.event = 'ENCERRAMENTO';
      } else if (!state.weak && previous?.weak) state.event = 'RETOMADA DO ARCO';
      else if (state.weak) state.event = 'ENFRAQUECIMENTO';
    } else if (best.count >= minimum) {
      state.start = best.start;
      state.event = 'FORMAÇÃO';
      state.outside = 0;
      state.inside = 0;
      state.lastInside = null;
      state.weak = 0;
    } else state.event = state.event === 'ENCERRAMENTO' ? 'ENCERRAMENTO' : 'SEM CONCENTRAÇÃO';
    state.width = width;
    state.count = state.start == null ? 0 : sample.filter(position => mod(position - state.start) < width).length;
    return state;
  }

  function consumeArc(prepared, next) {
    const state = { ...prepared };
    if (state.start == null) return state;
    const inside = mod(next - state.start) < state.width;
    const transition = inside ? state.lastInside === true ? 'PERMANÊNCIA' : state.outside > 0 ? 'REENTRADA' : 'ENTRADA'
                             : state.lastInside === true ? 'SAÍDA' : 'AFASTAMENTO';
    state.transition = transition;
    if (!['SUBSTITUIÇÃO', 'FORMAÇÃO', 'ENFRAQUECIMENTO', 'RETOMADA DO ARCO'].includes(state.event)) state.event = transition;
    state.inside = inside ? state.inside + 1 : 0;
    state.outside = inside ? 0 : state.outside + 1;
    state.lastInside = inside;
    return state;
  }


  // Todos os setores fixos são lidos, inclusive quando não são o arco eleito.
  // Chaves compactas evitam armazenar 1.369 objetos em cada prefixo histórico.
  function fixedArcKeys(prefix) {
    const keys = new Uint16Array(37 * 37);
    const recent = prefix.slice(-8);
    for (let width = 1; width <= 37; width++) {
      for (let start = 0; start < 37; start++) {
        const flags = recent.map(position => mod(position - start) < width);
        const count = flags.filter(Boolean).length;
        let run = 0;
        const inside = flags.at(-1) || false;
        for (let k = flags.length - 1; k >= 0 && flags[k] === inside && run < 4; k--) run++;
        keys[(width - 1) * 37 + start] = count * 10 + Number(inside) * 5 + run;
      }
    }
    return keys;
  }

  function arcAlternative(history, number, start, width, window=8) {
    if (!Number.isInteger(start) || start < 0 || start > 36 || !Number.isInteger(width) || width < 1 || width > 37) return null;
    const prefix = history.slice(-70).map(number => positions[number]);
    const priorInside = prefix.length ? mod(prefix.at(-1) - start) < width : null;
    const inside = mod(positions[number] - start) < width;
    const visited = prefix.some(position => mod(position - start) < width);
    const event = inside ? priorInside === true ? 'PERMANÊNCIA' : visited ? 'REENTRADA' : 'ENTRADA'
                         : priorInside === true ? 'SAÍDA' : 'AFASTAMENTO';
    const sample = prefix.slice(-Math.max(1,Math.min(70,Math.trunc(window)||8)));
    const visits = sample.filter(position => mod(position - start) < width).length;
    return { start, startNumber: wheel[start], width, number, inside, event, visits, sample: sample.length };
  }

  function makeFrame(prefix, poles, arcs, captureModes = true) {
    const end = prefix.length - 1;
    if (end < 2) return { modes: [], poles, arcs, triangle: null, chains: [] };
    const a = prefix[end - 2], b = prefix[end - 1], c = prefix[end];
    const shape = atlas.feature(a, b, c);
    const f = { ...shape,
      partialReturn: a!==c && shape.s1*shape.s2<0 && shape.closure<Math.abs(shape.s1),
      perimeter: shape.chords.reduce((sum,value)=>sum+value,0),
      amplitudeChange: Math.abs(shape.s2)-Math.abs(shape.s1),
      abruptAmplitude: Math.abs(Math.abs(shape.s2)-Math.abs(shape.s1))>=10,
      amplitudeAlternation: (Math.abs(shape.s1)<=3&&Math.abs(shape.s2)>=10)||(Math.abs(shape.s2)<=3&&Math.abs(shape.s1)>=10),
      signedResidual: shape.net-Math.round(shape.net/37)*37,
      algebraicTurns: shape.net/37
    };
    const modes = [];
    function mode(id, group, key, anchor = c, orientation = 1) {
      if(captureModes)modes.push({ id, group, key, anchor, orientation });
    }
    const chains = [];
    for (let length = 4; length <= Math.min(70, prefix.length); length++) {
      const chain = prefix.slice(-length);
      const steps = chain.slice(1).map((position, i) => jump(chain[i], position));
      const net = steps.reduce((sum, value) => sum + value, 0);
      const absolute = steps.reduce((sum, value) => sum + Math.abs(value), 0);
      const closure = distance(chain[0], c);
      const trends = steps.slice(1).map((value, i) => Math.sign(Math.abs(value) - Math.abs(steps[i])));
      mode('CADEIA NUMÉRICA '+length,2,chain.join(','),null);
      mode('CADEIA EXATA ' + length, 2, steps.join(','));
      const reflected=steps.map(value=>-value).join(',');
      const ordered=steps.join(',');
      mode('CADEIA REFLETIDA '+length,2,ordered<reflected?ordered:reflected,c,ordered<reflected?1:-1);
      mode('CADEIA AMPLITUDES '+length,2,steps.map(Math.abs).join(','));
      mode('CADEIA DIREÇÃO/AMPLITUDE ' + length, 2, steps.map(value => Math.sign(value) + ':' + amplitudeBand(Math.abs(value))).join(','));
      mode('PERCURSO/RETORNO ' + length, 3, [Math.sign(net), Math.floor(Math.abs(net) / 6), Math.floor(absolute / 10), band(closure), trends.join(',')].join('|'), chain[0]);
      chains.push({ length, steps, net, absolute, closure, turns: net / 37, residual: mod(net), trends,
        interruption: steps.length>=3&&Math.sign(steps.at(-2))===Math.sign(steps.at(-3))&&Math.sign(steps.at(-1))!==Math.sign(steps.at(-2)),
        resumption: steps.length>=3&&steps.at(-1)===steps.at(-3)&&steps.at(-1)!==steps.at(-2),
        directionChanges: steps.slice(1).filter((value,index)=>Math.sign(value)!==Math.sign(steps[index])).length
      });
    }
    for (let tolerance = 0; tolerance <= 18; tolerance++) {
      const state = poles[tolerance];
      const relevant = state.anchors && (state.active || state.outside <= 3 || state.concentration != null);
      const key = relevant ? [state.event, band(state.separation || 0), state.movement || 0, Math.min(3, state.outside), state.drift.map(Math.sign).join(',')].join('|') : null;
      const anchor = state.concentration != null ? state.concentration : state.anchors ? state.anchors[1 - state.lastSide] : c;
      mode('POLOS TOLERÂNCIA ' + tolerance, 4, key, anchor);
    }
    for (let width = 1; width <= 37; width++) {
      const state = arcs[width - 1];
      const key = state.start == null ? null : [state.event, state.transition, state.count, Math.min(4, state.outside), Math.min(4, state.inside)].join('|');
      mode('ARCO ' + width, 5, key, state.start == null ? c : state.start);
    }
    if(captureModes)for(let width=1;width<=37;width++){
      mode('ARCO TODOS OS SETORES '+width,5,width===37?null:'TODOS OS SETORES');
      modes.at(-1).fixedWidth=width;
    }
    return { modes, poles, arcs, triangle: f, chains, fixedKeys: captureModes ? fixedArcKeys(prefix) : null };
  }

  function read(history) {
    const h = history.slice(-70);
    const key = h.join(',');
    if (cache.has(key)) return cache.get(key);
    const prefix = [];
    let poles = Array.from({ length: 19 }, () => null);
    let arcs = Array.from({ length: 37 }, () => null);
    const frames = [];
    for (const number of h) {
      const next = positions[number];
      const prepared = arcs.map((state, index) => chooseArc(state, prefix, index + 1));
      poles = poles.map((state, tolerance) => poleStep(state, prefix, next, tolerance));
      arcs = prepared.map(state => consumeArc(state, next));
      prefix.push(next);
      frames.push(makeFrame(prefix, poles, arcs));
    }
    const current = frames.at(-1) || { modes: [], poles, arcs, triangle: null, chains: [] };
    const modes = current.modes.map(mode => ({ ...mode, support: 0, occurrences: 0, weights: Array(size).fill(16), outcomes: Array(size).fill(0), outcomeIndices: Array.from({length:size},()=>[]) }));
    for (let end = 2; end < h.length - 1; end++) {
      const previous = frames[end];
      const next = positions[h[end + 1]];
      const mass = Math.exp(-(h.length - 2 - end) / 28);
      const previousModes = new Map(previous.modes.map(mode => [mode.id, mode]));
      for (const mode of modes) {
        const old = previousModes.get(mode.id);
        if (mode.fixedWidth || mode.key == null || !old || old.key !== mode.key) continue;
        mode.support += mass;
        mode.occurrences++;
        const center = mode.anchor == null ? next : mod(mode.anchor + jump(old.anchor, next) * mode.orientation * old.orientation);
        mode.outcomes[center]++;
        mode.outcomeIndices[center].push(end);
        mode.weights[center] += mass * size * .7;
        mode.weights[mod(center - 1)] += mass * size * .15;
        mode.weights[mod(center + 1)] += mass * size * .15;
      }
    }
    for(const mode of modes.filter(mode=>mode.fixedWidth&&mode.fixedWidth<37)){
      const indices=new Set();
      for(let start=0;start<37;start++){
        const index=(mode.fixedWidth-1)*37+start;
        for(let end=2;end<h.length-1;end++){
          if(frames[end].fixedKeys[index]!==current.fixedKeys[index])continue;
          const mass=Math.exp(-(h.length-2-end)/28)/37;
          const center=positions[h[end+1]];
          mode.support+=mass;indices.add(end);
          mode.outcomeIndices[center].push(end);mode.outcomes[center]++;
          mode.weights[center]+=mass*37*.7;
          mode.weights[mod(center-1)]+=mass*37*.15;
          mode.weights[mod(center+1)]+=mass*37*.15;
        }
      }
      mode.occurrences=indices.size;
    }
    for (const mode of modes) mode.weights = normalize(mode.weights);
    const exhaustive = exhaustiveRead(prefix);
    const summaries = groups.map((name, group) => {
      const members = modes.filter(mode => mode.group === group && mode.support > 0);
      const support = Math.max(0, ...members.map(mode => mode.support));
      const weights = members.length ? normalize(Array.from({ length: size }, (_, j) => average(members.map(mode => mode.weights[j])))) : Array(size).fill(1);
      return { name, support, modes: members.length, weights };
    });
    for(const complete of exhaustive.groups){
      if(complete.group===3){
        const legacy=summaries[3];
        summaries[3]={...complete,weights:normalize(complete.weights.map((value,j)=>(value+legacy.weights[j])/2)),support:Math.max(complete.support,legacy.support)};
      }else summaries[complete.group]=complete;
    }
    const completePoles=poleWindowWeights(prefix),completeArcs=arcWindowWeights(prefix);
    for(const [group,complete] of [[4,completePoles],[5,completeArcs]]){
      const previous=summaries[group];
      summaries[group]={name:previous.name,support:Math.max(previous.support,complete.support),modes:previous.modes,
        weights:normalize(previous.weights.map((value,j)=>(value+complete.weights[j])/2))};
    }
    const preparedArcs = arcs.map((state, index) => chooseArc(state, prefix, index + 1));
    const candidateCache=new Map();
    function describeCandidate(number){
      if(candidateCache.has(number))return candidateCache.get(number);
      const position=positions[number];if(position==null)return null;
      const futurePoles = poles.map((state, tolerance) => poleStep(state, prefix, position, tolerance));
      const futureArcs = preparedArcs.map(state => consumeArc(state, position));
      const future = makeFrame([...prefix, position], futurePoles, futureArcs, false);
      const last = current.triangle;
      const description = { number, position, triangle: future.triangle,
        triangleTransition: last && future.triangle ? { areaChange: Math.sign(future.triangle.area - last.area), closureChange: Math.sign(future.triangle.closure - last.closure), turn: Math.sign(future.triangle.s2), ratio: future.triangle.ratio } : null,
        chains: future.chains,
        poleEvents: futurePoles.map((state, tolerance) => ({ tolerance, event: state.event, movement: state.movement || 0, separation: state.separation == null ? null : state.separation, anchors: state.anchors ? state.anchors.map(p => wheel[p]) : [] })),
        arcEvents: futureArcs.map(state => ({ width: state.width, event: state.event, transition: state.transition || null, start: state.start, outside: state.outside, inside: state.inside })),
        allArcStartsRead: true, arcSectorCases: 1369,
        historicalSupport: new Set(modes.flatMap(mode => mode.outcomeIndices[position])).size,
        supportingChannels: modes.filter(mode => mode.outcomes[position] > 0).length
      };
      candidateCache.set(number,description);return description;
    }
    const result = { version: '6.6.13', prefix: h, get candidates(){return wheel.map(describeCandidate);},candidate:describeCandidate,modes, groups: summaries, exhaustive, completePoles,completeArcs,
      candidateCount:37, channelCount: modes.length, arcSectorCases:1369,chainLengths:Array.from({length:Math.max(0,h.length-3)},(_,i)=>i+4),
      interpretationCount:37 * modes.length,
      status: 'LEITURA ATIVA — HIPÓTESES NÃO SÃO ACERTOS' };
    result.profileCache = new Map();
    cache.set(key, result);
    if (cache.size > 4) cache.delete(cache.keys().next().value);
    return result;
  }

  function weights(history, profile = {}) {
    const reading = read(history);
    const cacheKey = [profile.family || '', profile.radius || '', profile.variation || ''].join('|');
    if (reading.profileCache.has(cacheKey)) return reading.profileCache.get(cacheKey);
    const shares = [...(profiles[profile.variation - 1] || profiles[0])];
    if ((profile.family || '').startsWith('RX')) { shares[0] *= 1.35; shares[2] *= 1.3; }
    if ((profile.family || '').includes('DINAMICO')) { shares[1] *= 1.35; shares[3] *= 1.25; }
    if (profile.radius) { shares[4] *= .8 + (profile.radius - 4) * .2; shares[5] *= .8 + (profile.radius - 4) * .25; }
    const total = shares.reduce((sum, value) => sum + value, 0);
    const result = normalize(Array.from({ length: size }, (_, j) => reading.groups.reduce((sum, group, k) => {
      const confidence = group.support / (group.support + 12);
      return sum + shares[k] / total * (1 + confidence * (group.weights[j] - 1));
    }, 0)));
    reading.profileCache.set(cacheKey, result);
    return result;
  }

  function merge(original, history, profile = {}, strength = .18) {
    if (history.length < 3) return original;
    const reading = read(history);
    if (!reading.groups.some(group => group.support > 0)) return original;
    const contribution = weights(history, profile);
    const mean = average(original) || 1;
    return original.map((value, j) => Math.max(.001, value * (1 - strength) + mean * contribution[j] * strength));
  }

  function summary(history) {
    const reading = read(history);
    return { version: reading.version, candidateCount: reading.candidateCount,
      channelCount: reading.channelCount, interpretationCount: reading.interpretationCount,
      relativeForms:1369, amplitudeForms:361, numericTriples:50653,
      formsEvaluated:reading.exhaustive.formsEvaluated, amplitudesEvaluated:reading.exhaustive.amplitudesEvaluated,
      successorSamples:reading.exhaustive.successorSamples,
      chainLengths:reading.chainLengths,poleTolerances:19,polePairPositions:1369,poleSeparations:19,
      arcWindows:reading.completeArcs.windows,arcWindowSectorCases:reading.completeArcs.representedWindowSectorCases||0,
      groups: reading.groups.map(({ name, support, modes }) => ({ name, support, modes })) };
  }

  return { read, candidate(history,number){return read(history).candidate(number);},weights, merge, summary, catalogue, relativeForms, amplitudeForms, fullKernels, polePairs,polePairReading,poleWindowWeights,arcWindowWeights,poleStep, chooseArc, consumeArc, arcAlternative,
    clear() { cache.clear(); kernelCache.clear(); } };
}

const triangleMemory666 = createTriangleMemory666(W);
  const motorReadings667=createMotorReadings667(W,triangleMemory666);
  function triangleAnalysis(h) {
    const original=legacyTriangleAnalysis(h);
    if(!state.structuralMemoryEnabled)return original;
    const successor=triangleMemory666.analyze(h,past=>legacyTriangleAnalysis(past).weights);
    return {...original,weights:successor.weights,successorMemory:successor};
  }

  function legacyTriangleAnalysis(h) {
    const key = h.join(",");
    if (triangleCache.has(key)) return triangleCache.get(key);
    const triples = [];
    for (let i = 0; i + 2 < h.length; i++)
      triples.push({
        ...triangleFeatures(h[i], h[i + 1], h[i + 2]),
        position: i + 3,
      });
    const weights = Array(37).fill(1),
      counts = {};
    for (const t of triples)
      for (const label of t.labels) counts[label] = (counts[label] || 0) + 1;
    let matches = 0,
      exactPairs = 0;
    if (h.length >= 2) {
      const a = h.at(-2),
        b = h.at(-1),
        jump = direction(a, b),
        candidates = W.map((n) => triangleFeatures(a, b, n));
      for (const t of triples) {
        const hop =
            Math.exp(-Math.abs(t.s1 - jump) / 4) *
            (Math.sign(t.s1) === Math.sign(jump) ? 1 : 0.2),
          physical = Math.exp(-(distance(a, t.a) + distance(b, t.b)) / 10),
          recency = Math.exp(-(h.length - t.position) / 30),
          exact = t.a === a && t.b === b;
        if (exact) exactPairs++;
        if (hop > 0.3) matches++;
        for (let j = 0; j < 37; j++) {
          const f = candidates[j],
            second = Math.exp(-Math.abs(f.s2 - t.s2) / 3.5),
            close = Math.exp(-Math.abs(f.closure - t.closure) / 4),
            area = Math.exp(-Math.abs(f.area - t.area) * 2),
            angle =
              f.angles[1] == null || t.angles[1] == null
                ? f.degenerate === t.degenerate
                  ? 1
                  : 0.2
                : Math.exp(-Math.abs(f.angles[1] - t.angles[1]) / 30),
            shape =
              (f.type === t.type ? 1 : 0.15) * 0.45 +
              (f.contour === t.contour ? 1 : 0.15) * 0.25 +
              (f.trend === t.trend ? 1 : 0.15) * 0.3,
            amplitude = Math.exp(
              -Math.abs(f.route.length - t.route.length) / 10,
            );
          weights[j] +=
            recency *
            (hop * 0.7 + physical * 0.3) *
            (second * 0.3 +
              close * 0.15 +
              area * 0.1 +
              angle * 0.1 +
              shape * 0.2 +
              amplitude * 0.15);
          if (exact)
            weights[j] += recency * 2 * Math.exp(-distance(W[j], t.c) / 1.8);
        }
      }
    }
    const r = {
      triples,
      last: triples.at(-1) || null,
      weights: normalizeSpace(weights),
      counts,
      matches,
      exactPairs,
      context: triangleContext(h),
      samples: triples.length,
    };
    triangleCache.set(key, r);
    if (triangleCache.size > 64)
      triangleCache.delete(triangleCache.keys().next().value);
    return r;
  }

  function applyTriangle(weights, h, strength = 0.28) {
    const a = triangleAnalysis(h);
    if (!a.samples) return weights;
    const scale = avg(weights.map((x) => Math.max(0, x))) || 1,
      reliability = Math.min(1, a.samples / 20);
    for (let j = 0; j < 37; j++)
      weights[j] = Math.max(
        0.001,
        weights[j] +
          scale * strength * reliability * clamp(a.weights[j] - 1, -0.75, 2),
      );
    return weights;
  }

  function triangleCoverage(play, h) {
    if (!validPlay(play)) return 0;
    const w = triangleAnalysis(h).weights;
    return (
      play.numbers.reduce((s, n) => s + w[ix(n)], 0) /
      w.reduce((s, n) => s + n, 0)
    );
  }

  function arcCandidates(h) {
    const recent = h.slice(-20);
    return W.map((_, start) => {
      const numbers = Array.from({ length: 8 }, (_, j) => W[mod(start + j)]);
      return {
        start,
        numbers,
        count: recent.filter((n) => numbers.includes(n)).length,
        total: recent.length,
      };
    }).sort((a, b) => b.count - a.count || a.start - b.start);
  }

  function arcMinimum(a) {
    return Math.max(3, Math.ceil(a.total * 0.3));
  }

  function selectArc(h, active) {
    if (h.length < 6) return null;
    const ranked = arcCandidates(h),
      best = ranked[0],
      old = active ? ranked.find((a) => a.start === active.start) : null,
      qualified = best.count >= arcMinimum(best);
    if (!active || active.active === false) return qualified ? best : null;
    if (old.count < arcMinimum(old)) {
      if (qualified && best.start !== old.start) return best;
      return active.weak >= 1 || active.outside >= 12 ? null : old;
    }
    return qualified &&
      (best.count > old.count + 1 ||
        (active.outside >= 3 && best.count > old.count))
      ? best
      : old;
  }

  function arcContext(a, event = a.event) {
    return (
      "S" +
      a.start +
      "|E" +
      event +
      "|Q" +
      (a.count >= arcMinimum(a) ? "FORTE" : "FRACO") +
      "|D" +
      Math.min(3, a.outside) +
      "|I" +
      Math.min(3, a.inside)
    );
  }

  function trackArcs(h) {
    let active = null,
      last = null;
    const events = [],
      episodes = [],
      transitions = {},
      contextTransitions = {};
    function setArc(candidate, position) {
      if (!candidate) {
        if (active) {
          active.active = false;
          active.strength = 0;
          active.event = "ENCERRADO";
          episodes.push(copy(active));
          events.push({
            position,
            number: null,
            arcId: active.id,
            start: active.start,
            event: "ENCERRADO",
            inside: false,
            gap: active.lastGap,
            outside: active.outside,
          });
          last = active;
          active = null;
        }
        return;
      }
      if (active?.start === candidate.start) {
        active.count = candidate.count;
        active.total = candidate.total;
        active.weak =
          candidate.count < arcMinimum(candidate) ? active.weak + 1 : 0;
        active.health = active.weak ? "ENFRAQUECIDO" : "FORTE";
        active.strength = active.weak ? 0.25 : 1;
        return;
      }
      if (active) {
        active.active = false;
        active.event = "SUBSTITUÍDO";
        episodes.push(copy(active));
        last = active;
      }
      active = {
        ...candidate,
        id: "ARC@" + position + ":" + candidate.start,
        formedBefore: position,
        active: true,
        health: "FORTE",
        strength: 1,
        weak: 0,
        lastInside: null,
        seenInside: false,
        event: "NOVO ARCO",
        inside: 0,
        outside: 0,
        entries: 0,
        exits: 0,
        returns: 0,
        lastGap: 0,
        maxGap: 0,
        drift: last ? direction(W[last.start], W[candidate.start]) : 0,
      };
    }
    for (let i = 0; i < h.length; i++) {
      setArc(selectArc(h.slice(0, i), active), i + 1);
      if (!active) continue;
      const number = h[i],
        inside = active.numbers.includes(number),
        priorEvent = active.event;
      if (active.lastInside != null) {
        for (const [map, key] of [
          [transitions, priorEvent],
          [contextTransitions, arcContext(active, priorEvent)],
        ]) {
          const b = map[key] || (map[key] = { total: 0, hits: 0 });
          b.total++;
          if (inside) b.hits++;
        }
      }
      if (inside) {
        if (active.lastInside === false) {
          active.lastGap = active.outside;
          active.entries++;
          if (active.seenInside) {
            active.returns++;
            active.event = "REENTRADA";
          } else active.event = "ENTRADA";
        } else if (active.lastInside === true) active.event = "PERMANÊNCIA";
        else {
          active.entries++;
          active.event = "ENTRADA";
        }
        active.inside = active.lastInside === true ? active.inside + 1 : 1;
        active.outside = 0;
        active.seenInside = true;
      } else {
        if (active.lastInside === true) {
          active.exits++;
          active.event = "SAÍDA";
        } else active.event = active.outside >= 3 ? "AFASTAMENTO" : "FORA";
        active.outside++;
        active.inside = 0;
        active.maxGap = Math.max(active.maxGap, active.outside);
      }
      active.lastInside = inside;
      events.push({
        position: i + 1,
        number,
        arcId: active.id,
        start: active.start,
        event: active.event,
        health: active.health,
        inside,
        gap: active.lastGap,
        outside: active.outside,
      });
    }
    setArc(selectArc(h, active), h.length + 1);
    return {
      active,
      last,
      events,
      episodes,
      transitions,
      contextTransitions,
      ranked: arcCandidates(h),
    };
  }

  function trackPoles(h) {
    let active = null,
      concentration = null;
    const events = [],
      episodes = [];
    for (let i = 0; i < h.length; i++) {
      const n = h[i];
      if (concentration?.active) {
        if (distance(n, concentration.center) <= 4) {
          concentration.center = n;
          concentration.visits++;
          concentration.outside = 0;
        } else if (++concentration.outside >= 2) concentration.active = false;
      }
      if (active?.active) {
        const previous = distance(...active.anchors),
          expected = 1 - active.lastSide,
          de = distance(n, active.anchors[expected]),
          ds = distance(n, active.anchors[active.lastSide]);
        if (de <= 4 && de <= ds) {
          const interrupted = ![
              "ALTERNÂNCIA",
              "FORMADO",
              "CONVERGÊNCIA",
              "DIVERGÊNCIA",
            ].includes(active.event),
            shift = direction(active.anchors[expected], n);
          active.drift[expected] += shift;
          active.lastShift[expected] = shift;
          active.anchors[expected] = n;
          active.lastSide = expected;
          active.alternations++;
          active.outside = 0;
          active.event = interrupted ? "RETOMADA" : "ALTERNÂNCIA";
        } else if (ds <= 4) {
          const side = active.lastSide,
            shift = direction(active.anchors[side], n);
          active.lastShift[side] = shift;
          active.drift[side] += shift;
          active.anchors[side] = n;
          active.interruptions++;
          active.outside = 0;
          active.event = "INTERRUPÇÃO";
        } else {
          active.outside++;
          active.event = active.outside >= 2 ? "RUPTURA" : "SAÍDA DOS POLOS";
          if (active.outside >= 2) active.active = false;
        }
        active.separation = distance(...active.anchors);
        active.movement =
          active.separation < previous
            ? "CONVERGÊNCIA"
            : active.separation > previous
              ? "DIVERGÊNCIA"
              : "MANUTENÇÃO";
        if (active.active && active.separation <= 4) {
          active.active = false;
          active.event = "FUSÃO";
          concentration = {
            active: true,
            center: n,
            formed: i + 1,
            visits: 1,
            outside: 0,
            origins: [...active.anchors],
          };
        } else if (
          active.active &&
          active.outside === 0 &&
          active.separation <= 6 &&
          active.movement === "CONVERGÊNCIA"
        )
          active.event = "CONVERGÊNCIA";
        if (!active.active) episodes.push(copy(active));
        events.push({
          position: i + 1,
          number: n,
          event: active.event,
          movement: active.movement,
          separation: active.separation,
          anchors: [...active.anchors],
          drift: [...active.drift],
        });
      }
      if (!active?.active && i >= 3) {
        const [a, b, c, d] = h.slice(i - 3, i + 1);
        if (
          distance(a, c) <= 2 &&
          distance(b, d) <= 2 &&
          Math.min(distance(a, b), distance(c, d)) >= 8
        ) {
          active = {
            id: "POLES@" + (i + 1),
            active: true,
            start: i - 2,
            anchors: [c, d],
            initial: [a, b],
            lastSide: 1,
            drift: [direction(a, c), direction(b, d)],
            lastShift: [direction(a, c), direction(b, d)],
            alternations: 2,
            interruptions: 0,
            outside: 0,
            event: "FORMADO",
            movement: "MANUTENÇÃO",
            separation: distance(c, d),
          };
          concentration = null;
          events.push({
            position: i + 1,
            number: n,
            event: "FORMADO",
            movement: active.movement,
            separation: active.separation,
            anchors: [c, d],
            drift: [...active.drift],
          });
        }
      }
    }
    return { active, events, episodes, concentration };
  }

  function chainFeatures(h) {
    if (h.length < 4) return null;
    const [a, b, c, d] = h.slice(-4),
      first = triangleFeatures(a, b, c),
      second = triangleFeatures(b, c, d),
      hops = [direction(a, b), direction(b, c), direction(c, d)],
      route = routeFeatures([a, b, c, d]);
    return {
      numbers: [a, b, c, d],
      hops,
      first,
      second,
      route,
      key:
        first.type +
        ":" +
        nearBand(first.closure) +
        ":" +
        first.trend +
        ">" +
        second.type +
        ":" +
        nearBand(second.closure) +
        ":" +
        second.trend +
        "|L" +
        lengthBand(route.length) +
        "|S" +
        hops.map(Math.sign).join(","),
    };
  }

  const spaceCache = new Map(),
    rawSpaceCache = new Map();

  const COMPONENTS = ["triangle", "chain", "pole", "arc", "route"],
    BASE_SHARES = [0.35, 0.2, 0.15, 0.15, 0.15];

  function rawSpatial(h) {
    const key = h.join(",");
    if (rawSpaceCache.has(key)) return rawSpaceCache.get(key);
    const route = routeRead(h),
      tri = triangleAnalysis(h),
      arcs = trackArcs(h),
      poles = trackPoles(h),
      chain = chainFeatures(h),
      cw = Array(37).fill(1),
      pw = Array(37).fill(1),
      aw = Array(37).fill(1);
    let chainExamples = 0;
    if (chain)
      for (let end = 3; end < h.length - 1; end++) {
        const old = chainFeatures(h.slice(end - 3, end + 1)),
          diff = avg(chain.hops.map((s, j) => Math.abs(s - old.hops[j]))),
          shape =
            (old.first.type === chain.first.type ? 0.5 : 0) +
            (old.second.type === chain.second.type ? 0.5 : 0),
          similarity =
            Math.exp(-diff / 4) *
            (0.25 + 0.75 * shape) *
            (0.5 +
              0.5 *
                Number(
                  old.route.trends.join(",") === chain.route.trends.join(","),
                )),
          recency = Math.exp(-(h.length - 2 - end) / 30),
          projected = W[mod(ix(h.at(-1)) + direction(h[end], h[end + 1]))];
        if (similarity > 0.25) chainExamples++;
        for (let j = 0; j < 37; j++)
          cw[j] +=
            similarity * recency * Math.exp(-distance(W[j], projected) / 2);
      }
    const p = poles.active;
    if (p?.active) {
      const expected = 1 - p.lastSide,
        anchor = p.anchors[expected],
        shift = clamp(p.lastShift[expected], -2, 2),
        projected = W[mod(ix(anchor) + shift)],
        strength =
          Math.min(1, p.alternations / 5) *
          (p.event === "SAÍDA DOS POLOS"
            ? 0.25
            : p.event === "INTERRUPÇÃO"
              ? 0.45
              : p.event === "CONVERGÊNCIA"
                ? 0.6
                : 1);
      for (let j = 0; j < 37; j++)
        pw[j] +=
          strength *
          (Math.exp(-distance(W[j], anchor) / 2) +
            0.4 * Math.exp(-distance(W[j], projected) / 2));
    }
    const concentration = poles.concentration;
    if (!p?.active && concentration?.active) {
      const strength =
        Math.min(0.7, concentration.visits / 8) / (1 + concentration.outside);
      for (let j = 0; j < 37; j++)
        pw[j] += strength * Math.exp(-distance(W[j], concentration.center) / 2);
    }
    const a = arcs.active;
    let arcEvidence = { hits: 0, total: 0, score: 8 / 37 };
    if (a) {
      const base = 8 / 37,
        b = arcs.contextTransitions[arcContext(a)] || { hits: 0, total: 0 },
        historical = (b.hits + base * 10) / (b.total + 10),
        density = (a.count + base * 8) / (a.total + 8),
        confidence = Math.min(1, a.total / 16) * a.strength,
        sectorMass = clamp(historical * 0.75 + density * 0.25, 0.05, 0.7);
      arcEvidence = { ...b, score: historical };
      for (let j = 0; j < 37; j++) {
        const target = a.numbers.includes(W[j])
          ? (sectorMass * 37) / 8
          : ((1 - sectorMass) * 37) / 29;
        aw[j] = 1 + (target - 1) * confidence;
      }
    }
    const chainWeights = normalizeSpace(cw),
      poleWeights = normalizeSpace(pw),
      arcWeights = normalizeSpace(aw),
      keys = ["T:" + tri.context];
    if (route.triangle) keys.push(route.key);
    if (chain) keys.push("C:" + chain.key);
    if (p?.active)
      keys.push(
        "P:" +
          p.event +
          "|D:" +
          nearBand(p.separation) +
          "|M:" +
          p.movement +
          "|F:" +
          Math.sign(p.drift[0]) +
          "," +
          Math.sign(p.drift[1]),
      );
    else if (concentration?.active)
      keys.push(
        "P:FUSÃO|S:" +
          ix(concentration.center) +
          "|F:" +
          Math.min(2, concentration.outside),
      );
    if (a) keys.push("A:" + arcContext(a));
    else keys.push("A:SEM ARCO ATIVO");
    const r = {
      tri,
      arcs,
      poles,
      chain,
      route,
      chainExamples,
      chainWeights,
      poleWeights,
      arcWeights,
      arcEvidence,
      keys,
      components: [
        tri.weights,
        chainWeights,
        poleWeights,
        arcWeights,
        route.weights,
      ],
    };
    rawSpaceCache.set(key, r);
    if (rawSpaceCache.size > 80)
      rawSpaceCache.delete(rawSpaceCache.keys().next().value);
    return r;
  }

  function adaptiveSpatial(h) {
    const sums = Array(5).fill(0),
      details = [];
    let samples = 0;
    for (let end = Math.max(8, h.length - 24); end < h.length; end++) {
      const r = rawSpatial(h.slice(0, end)),
        n = ix(h[end]);
      for (let k = 0; k < 5; k++)
        sums[k] += clamp(Math.log(Math.max(0.01, r.components[k][n])), -2, 2);
      samples++;
    }
    const confidence = samples / (samples + 16),
      gains = sums.map((s) =>
        Math.exp(
          clamp((samples ? s / samples : 0) * 4 * confidence, -0.5, 0.5),
        ),
      ),
      unnormalized = BASE_SHARES.map((b, k) => b * gains[k]),
      total = unnormalized.reduce((s, n) => s + n, 0),
      shares = unnormalized.map((n) => n / total);
    for (let k = 0; k < 5; k++)
      details.push({
        component: COMPONENTS[k],
        base: BASE_SHARES[k],
        share: shares[k],
        samples,
        meanLogGain: samples ? sums[k] / samples : 0,
      });
    return { shares, details, samples, confidence };
  }

  function spatialRead(h) {
    h = h.slice(-WINDOW);
    const key = h.join(",");
    if (spaceCache.has(key)) return spaceCache.get(key);
    const raw = rawSpatial(h),
      adaptive = adaptiveSpatial(h),
      weights = normalizeSpace(
        W.map((_, j) =>
          raw.components.reduce((s, w, k) => s + w[j] * adaptive.shares[k], 0),
        ),
      ),
      r = { ...raw, adaptive, weights: motorReadings667.merge(weights,h), readingVersion:"6.6.13" };
    spaceCache.set(key, r);
    if (spaceCache.size > 40)
      spaceCache.delete(spaceCache.keys().next().value);
    return r;
  }

  function applySpatial(weights, h, strength = 0.3) {
    if (h.length < 3) return weights;
    const r = spatialRead(h),
      scale = avg(weights.map((v) => Math.max(0, v))) || 1,
      reliability = Math.min(1, (h.length - 2) / 20);
    for (let j = 0; j < 37; j++)
      weights[j] = Math.max(
        0.001,
        weights[j] +
          scale * strength * reliability * clamp(r.weights[j] - 1, -0.75, 2),
      );
    return weights;
  }

  function spatialCoverage(play, h) {
    if (!validPlay(play)) return 0;
    const w = spatialRead(h).weights;
    return (
      play.numbers.reduce((s, n) => s + w[ix(n)], 0) /
      w.reduce((s, n) => s + n, 0)
    );
  }

  function spatialMatch(keys, current) {
    if (!keys?.length) return 0;
    const importance = { T: 0.2, C: 0.2, P: 0.2, A: 0.2, R: 0.2 };
    return current.reduce(
      (s, k) => s + (keys.includes(k) ? importance[k[0]] || 0 : 0),
      0,
    );
  }

  function spatialMetrics(rows, h, hit = (r) => r.result !== "LOSS") {
    const keys = spatialRead(h).keys;
    let support = 0,
      weightedHits = 0,
      total = 0,
      hits = 0;
    for (const row of rows) {
      const w = spatialMatch(
        row.spatialKeys || (row.triangleKey ? ["T:" + row.triangleKey] : []),
        keys,
      );
      if (!w) continue;
      support += w;
      total++;
      if (hit(row)) {
        weightedHits += w;
        hits++;
      }
    }
    return {
      total,
      hits,
      loss: total - hits,
      support,
      score: (weightedHits + (28 / 37) * 8) / (support + 8),
    };
  }

  function analyze(h) {
    const transitions = [];
    for (let i = Math.max(1, h.length - 45); i < h.length; i++) {
      const a = h[i - 1],
        b = h[i],
        physical = direction(a, b);
      transitions.push({
        from: a,
        to: b,
        numeric: b - a,
        physical,
        distance: Math.abs(physical),
        mirrorFrom: mirror(a),
        mirrorTo: mirror(b),
      });
    }
    function streak(field) {
      const sign = Math.sign(transitions.at(-1)?.[field] || 0);
      let length = 0;
      if (sign)
        for (let i = transitions.length - 1; i >= 0; i--) {
          if (Math.sign(transitions[i][field]) !== sign) break;
          length++;
        }
      return { dir: sign, length };
    }
    const regions = {};
    for (const name of Object.keys(REGIONS)) {
      let absence = 0;
      for (let i = h.length - 1; i >= 0; i--) {
        if (region(h[i]) === name) break;
        absence++;
      }
      regions[name] = {
        absence,
        recent: h.slice(-12).filter((n) => region(n) === name).length,
      };
    }
    const last3 = transitions.slice(-3),
      previous3 = transitions.slice(-6, -3);
    return {
      transitions,
      last6: transitions.slice(-6),
      numericStreak: streak("numeric"),
      physicalStreak: streak("physical"),
      mean3: avg(last3.map((x) => x.distance)),
      previous3: avg(previous3.map((x) => x.distance)),
      acceleration:
        avg(last3.map((x) => x.distance)) -
        avg(previous3.map((x) => x.distance)),
      regions,
    };
  }

  function weightsFor(h, family, radius) {
    const weights = Array(37).fill(0.01),
      recent = h.slice(-60);
    for (let k = 0; k < recent.length; k++) {
      const p = ix(recent[recent.length - 1 - k]),
        decay = Math.exp(-k / (radius * 2.3));
      for (let j = 0; j < 37; j++) {
        const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
        if (d <= 6) weights[j] += (decay * (7 - d)) / 7;
      }
    }
    if (family.includes("DINAMICO"))
      for (let k = 0; k < Math.min(radius + 2, h.length); k++) {
        const p = ix(h[h.length - 1 - k]);
        for (let j = 0; j < 37; j++) {
          const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
          if (d <= 3) weights[j] += ((4 - d) / (k + 2)) * 1.7;
        }
      }
    if (family.startsWith("RX")) {
      const length = Math.min(radius, h.length - 2),
        matches = [];
      if (length >= 2) {
        for (let i = 0; i + length < h.length - 1; i++) {
          let score = 0;
          for (let j = 0; j < length; j++)
            score +=
              Math.max(0, 6 - distance(h[h.length - length + j], h[i + j])) / 6;
          matches.push({ score: score / length, next: h[i + length] });
        }
        matches.sort((a, b) => b.score - a.score);
        for (const m of matches.slice(0, 12)) {
          const p = ix(m.next);
          for (let j = 0; j < 37; j++) {
            const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
            if (d <= 3) weights[j] += (4 - d) * m.score * 0.45;
          }
        }
      }
    }
    if (h.length >= 3) {
      const a = analyze(h),
        last = h.at(-1),
        nb =
          a.last6.filter((x) => x.numeric > 0).length -
          a.last6.filter((x) => x.numeric < 0).length,
        pb =
          a.last6.filter((x) => x.physical > 0).length -
          a.last6.filter((x) => x.physical < 0).length,
        expected = clamp(
          Math.round(avg(a.last6.map((x) => x.distance))),
          1,
          18,
        );
      for (const n of W) {
        const pd = direction(last, n),
          d = Math.abs(pd);
        let b = 0;
        if (nb && Math.sign(n - last) === Math.sign(nb)) b += 0.1;
        if (pb && Math.sign(pd) === Math.sign(pb)) b += 0.12;
        if (Math.abs(d - expected) <= 2) b += 0.09;
        if (
          a.numericStreak.length >= 2 &&
          Math.sign(n - last) === a.numericStreak.dir
        )
          b += 0.07;
        if (
          a.physicalStreak.length >= 2 &&
          Math.sign(pd) === a.physicalStreak.dir
        )
          b += 0.07;
        if (a.acceleration >= 3 && d >= 10) b += 0.07;
        if (a.acceleration <= -3 && d <= 5) b += 0.07;
        weights[ix(n)] += (b * radius) / 5;
      }
    }
    return applyReanalysisMemory(motorReadings667.merge(applySpatial(weights,h,
      0.3+(radius-4)*0.035+(family.startsWith("RX")?0.035:0)),h,{family,radius},.12),h);
  }

  const motorDiversityCache = new Map();

  let diversityPool = null;

  let diversitySafety = null;

  const MAX_MOTOR_OVERLAP = 24;

  function coverageCode(play) {
    return [...play.numbers].sort((a, b) => a - b).join(",");
  }

  function population32(n) {
    n = n - ((n >>> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
    return (((n + (n >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
  }

  function sharedCoverage(a, b) {
    return 19 + population32(a.low & b.low) + population32(a.high & b.high);
  }

  function gapGeometry(gaps, start) {
    let position = start;
    const blocks = [];
    for (let k = 0; k < 6; k++) {
      const radius = k === 0 ? 1 : 2;
      const center = W[mod(position + radius)];
      blocks.push({ center, radius, numbers: neighbors(center, radius) });
      position += radius * 2 + 1 + gaps[k];
    }
    return { blocks, numbers: blocks.flatMap((b) => b.numbers), score: 0 };
  }

  function motorCoverageAudit(motors) {
    const counts = Array(37).fill(0);
    const candidates = motors.map((m) => diversityCandidate(m.play));
    let maxOverlap = 0;
    for (let i = 0; i < candidates.length; i++) {
      for (const n of candidates[i].play.numbers) counts[n]++;
      for (let j = 0; j < i; j++)
        maxOverlap = Math.max(
          maxOverlap,
          sharedCoverage(candidates[i], candidates[j]),
        );
    }
    return {
      counts,
      covered: counts.filter(Boolean).length,
      distinct: new Set(candidates.map((c) => c.code)).size,
      maxOverlap,
      minCoverage: Math.min(...counts),
      maxCoverage: Math.max(...counts),
    };
  }

  function validMotorEnsemble(motors) {
    if (motors.length !== 12 || !motors.every((m) => validPlay(m.play)))
      return false;
    const a = motorCoverageAudit(motors);
    return (
      a.covered === 37 && a.distinct === 12 && a.maxOverlap <= MAX_MOTOR_OVERLAP
    );
  }

  function diversityCandidates() {
    if (diversityPool) return diversityPool;
    const patterns = [
      [9, 0, 0, 0, 0, 0],
      [6, 3, 0, 0, 0, 0],
      [4, 1, 1, 1, 1, 1],
      [3, 2, 1, 1, 1, 1],
      [3, 3, 3, 0, 0, 0],
      [2, 2, 2, 1, 1, 1],
      [5, 2, 2, 0, 0, 0],
      [4, 3, 2, 0, 0, 0],
    ];
    const shapes = new Map(),
      pool = new Map();
    for (const pattern of patterns)
      for (let rotation = 0; rotation < 6; rotation++) {
        const gaps = pattern.map((_, i) => pattern[(i + rotation) % 6]);
        shapes.set(gaps.join(","), gaps);
        shapes.set([...gaps].reverse().join(","), [...gaps].reverse());
      }
    for (const gaps of shapes.values())
      for (let start = 0; start < 37; start++) {
        const play = gapGeometry(gaps, start);
        if (!validPlay(play)) throw Error("GEOMETRIA DE VARIAÇÃO INVÁLIDA.");
        const candidate = diversityCandidate(play);
        if (!pool.has(candidate.code)) pool.set(candidate.code, candidate);
      }
    diversityPool = [...pool.values()];

    /* Reserva verificada para o caso de a busca por qualidade não concluir.
   Também é escolhida por pesos e rotação comum, antes do resultado. */
    const selected = [],
      counts = Array(37).fill(0);
    for (let k = 0; k < 12; k++) {
      let best = null,
        bestValue = -Infinity;
      for (const candidate of diversityPool) {
        if (
          selected.some(
            (old) => sharedCoverage(old, candidate) > MAX_MOTOR_OVERLAP,
          )
        )
          continue;
        let value = 0;
        for (const n of candidate.play.numbers) value += 1 / (1 + counts[n]);
        if (value > bestValue + 1e-12) {
          best = candidate;
          bestValue = value;
        }
      }
      if (!best) throw Error("NÃO FOI POSSÍVEL FORMAR A RESERVA DE VARIAÇÕES.");
      selected.push(best);
      for (const n of best.play.numbers) counts[n]++;
    }
    diversitySafety = selected;
    if (!validMotorEnsemble(selected.map((c) => ({ play: c.play })))) {
      throw Error("RESERVA SEM COBERTURA INTEGRAL DA RODA.");
    }
    return diversityPool;
  }

  function rotatedDiversity(play, shift) {
    const blocks = play.blocks.map((b) => {
      const center = W[mod(ix(b.center) + shift)];
      return { center, radius: b.radius, numbers: neighbors(center, b.radius) };
    });
    return { blocks, numbers: blocks.flatMap((b) => b.numbers), score: 0 };
  }

  function diversifyMotors(proposals) {
    const pool = [...diversityCandidates()];
    const seen = new Set(pool.map((c) => c.code));
    for (const m of proposals) {
      const c = diversityCandidate(m.play);
      if (!seen.has(c.code)) {
        pool.push(c);
        seen.add(c.code);
      }
    }
    const normalized = proposals.map((m) => {
      const total = m.weights.reduce((s, v) => s + v, 0) || 1;
      return m.weights.map((v) => v / total);
    });
    const values = normalized.map((weights) =>
      pool.map((c) => c.play.numbers.reduce((s, n) => s + weights[ix(n)], 0)),
    );
    let chosen = null,
      chosenValue = -Infinity;

    /* Ordens diferentes evitam que um único motor defina todas as lacunas. */
    for (const step of [1, 5, 7]) {
      const selected = Array(12).fill(null),
        counts = Array(37).fill(0);
      let failed = false;
      for (let k = 0; k < 12; k++) {
        const index = (k * step) % 12;
        let best = -1,
          bestValue = -Infinity;
        for (let j = 0; j < pool.length; j++) {
          const candidate = pool[j];
          if (
            selected.some(
              (old) =>
                old && sharedCoverage(old, candidate) > MAX_MOTOR_OVERLAP,
            )
          )
            continue;
          let complementary = 0;
          for (const n of candidate.play.numbers)
            complementary += 1 / (1 + counts[n]);
          const value = values[index][j] + (0.045 * complementary) / 28;
          if (value > bestValue + 1e-12) {
            best = j;
            bestValue = value;
          }
        }
        if (best < 0) {
          failed = true;
          break;
        }
        selected[index] = pool[best];
        for (const n of pool[best].play.numbers) counts[n]++;
      }
      if (failed || counts.some((c) => c === 0)) continue;
      const value = selected.reduce(
        (sum, c, i) =>
          sum + c.play.numbers.reduce((s, n) => s + normalized[i][ix(n)], 0),
        0,
      );
      if (value > chosenValue) {
        chosenValue = value;
        chosen = selected;
      }
    }

    if (!chosen) {
      for (let shift = 0; shift < 37; shift++)
        for (const step of [1, 5, 7]) {
          const selected = proposals.map((_, i) =>
            diversityCandidate(
              rotatedDiversity(diversitySafety[(i * step) % 12].play, shift),
            ),
          );
          const value = selected.reduce(
            (sum, c, i) =>
              sum +
              c.play.numbers.reduce((s, n) => s + normalized[i][ix(n)], 0),
            0,
          );
          if (value > chosenValue) {
            chosenValue = value;
            chosen = selected;
          }
        }
    }

    const result = proposals.map((m, i) => {
      const { weights, ...motor } = m;
      const play = copy(chosen[i].play);
      play.score = play.numbers.reduce((sum, n) => sum + weights[ix(n)], 0);
      return {
        ...motor,
        play,
        score: play.score,
        baseScore: m.score,
        diversity: {
          changed: coverageCode(m.play) !== coverageCode(play),
          maxOverlap: MAX_MOTOR_OVERLAP,
        },
      };
    });
    if (!validMotorEnsemble(result))
      throw Error("FALHA NA VERIFICAÇÃO DOS 12 MOTORES.");
    return result;
  }

  function motors(h) {
    if (h.length < 8) return [];
    h = h.slice(-WINDOW);
    const cacheKey = h.join(",");
    if (motorDiversityCache.has(cacheKey))
      return copy(motorDiversityCache.get(cacheKey));
    const proposals = [],
      s = spatialRead(h);
    for (const family of FAMILIES)
      for (const radius of RADII) {
        const weights = weightsFor(h, family, radius);
        const play = geometry(weights);
        if (!validPlay(play))
          throw Error("MOTOR SEM GEOMETRIA VÁLIDA: " + family + "_" + radius);
        proposals.push({
          key: family + "_" + radius,
          family,
          radius,
          weights,
          score: play.score,
          play,
          triangleKey: triangleContext(h),
          spatialKeys: [...s.keys],
          spatialVersion: VERSION,
          readingVersion:"6.6.13",readingCandidates:37,
          componentShares: [...s.adaptive.shares],
          adaptiveSamples: s.adaptive.samples,
        });
      }
    const result = diversifyMotors(proposals);
    for (const m of result) {
      m.triangleScore = triangleCoverage(m.play, h);
      m.spatialScore = spatialCoverage(m.play, h);
    }
    result.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
    result.forEach((m, i) => {
      m.rank = i + 1;
    });
    motorDiversityCache.set(cacheKey, copy(result));
    if (motorDiversityCache.size > 24)
      motorDiversityCache.delete(motorDiversityCache.keys().next().value);
    return result;
  }

  function generateNumberCombination(h) {
    if (h.length < 8) return null;
    const trigger = h.at(-1),
      weights = Array(37).fill(0.02),
      recent = h.slice(-60);
    for (let k = 0; k < recent.length; k++) {
      const p = ix(recent[recent.length - 1 - k]),
        decay = Math.exp(-k / 18);
      for (let j = 0; j < 37; j++) {
        const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
        if (d <= 5) weights[j] += (decay * (6 - d)) / 6;
      }
    }
    if (h.length >= 2) {
      const expected = mod(ix(trigger) + direction(h.at(-2), trigger));
      for (let j = 0; j < 37; j++) {
        const d = Math.min(Math.abs(expected - j), 37 - Math.abs(expected - j));
        if (d <= 4) weights[j] += (5 - d) * 0.14;
      }
    }
    for (let i = 0; i < h.length - 1; i++) {
      if (h[i] !== trigger) continue;
      const p = ix(h[i + 1]),
        decay = Math.exp(-(h.length - 1 - i) / 28);
      for (let j = 0; j < 37; j++) {
        const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
        if (d <= 3) weights[j] += ((decay * (4 - d)) / 4) * 0.9;
      }
    }
    applySpatial(weights, h, 0.35);
    const play = geometry(weights);
    return validPlay(play)
      ? {
          key: "NUMERO_GERADO_" + trigger,
          name: "COMBINAÇÃO DO " + trigger,
          trigger,
          score: play.score,
          spatialScore: spatialCoverage(play, h),
          play,
        }
      : null;
  }

  function registerNumberCombination(h, turn) {
    const g = generateNumberCombination(h);
    if (g)
      state.numberCombinations.push({
        id: "NC_" + turn,
        turn,
        origin: g.trigger,
        motor: g.key,
        play: copy(g.play),
        centers: g.play.blocks.map((b) => b.center),
        covered: [...g.play.numbers],
        triangleKey: triangleContext(h),
        spatialKeys: [...spatialRead(h).keys],
      });
  }

  function numberTransitions(h, trigger) {
    const rows = [];
    for (let i = 0; i < h.length - 1; i++)
      if (h[i] === trigger)
        rows.push({
          next: h[i + 1],
          age: h.length - 1 - i,
          position: i + 2,
          triggerPosition: i + 1,
        });
    return rows;
  }

  function compareNumberCombination(record, trigger, h) {
    const transitions = numberTransitions(h, trigger),
      covered = new Set(record.covered),
      matchedNumbers = [],
      missedNumbers = [];
    let matches = 0,
      weightedMatches = 0,
      totalWeight = 0;
    for (const t of transitions) {
      const w = Math.exp(-t.age / 35);
      totalWeight += w;
      if (covered.has(t.next)) {
        matches++;
        weightedMatches += w;
        matchedNumbers.push(t.next);
      } else missedNumbers.push(t.next);
    }
    const total = transitions.length,
      base = 28 / 37,
      historical = (matches + base * 3) / (total + 3),
      recent = (weightedMatches + base * 2) / (totalWeight + 2),
      numericalScore = historical * 0.65 + recent * 0.35,
      spatialScore = spatialCoverage(record.play, h);
    return {
      ...record,
      trigger,
      total,
      matches,
      misses: total - matches,
      weightedMatches,
      numericalScore,
      triangleScore: triangleCoverage(record.play, h),
      spatialScore,
      score: numericalScore * 0.75 + spatialScore * 0.25,
      matchedNumbers,
      missedNumbers,
    };
  }

  function rankNumberCombinations(h, trigger = h.at(-1)) {
    return trigger == null
      ? []
      : state.numberCombinations
          .filter((r) => validPlay(r.play))
          .map((r) => compareNumberCombination(r, trigger, h))
          .sort(
            (a, b) =>
              b.score - a.score || b.matches - a.matches || b.turn - a.turn,
          );
  }

  function bestNumberCombination(h) {
    if (h.length < 8) return null;
    const trigger = h.at(-1),
      best = rankNumberCombinations(h, trigger)[0];
    return best
      ? {
          key: "NUM_T" + best.turn + "_N" + best.origin,
          name: "COMBINAÇÃO DO " + best.origin,
          rank: 0,
          score: best.score,
          spatialScore: best.spatialScore,
          sourceNumber: best.origin,
          sourceTurn: best.turn,
          trigger,
          matches: best.matches,
          tests: best.total,
          play: copy(best.play),
          type: "NUMBER",
        }
      : null;
  }

  function updateNumberChoice() {
    const s = bestNumberCombination(state.history);
    if (!s) {
      state.numberChoice = null;
      return null;
    }
    const old = state.numberChoice;
    if (old && (old.sourceTurn !== s.sourceTurn || old.trigger !== s.trigger))
      state.numberChanges++;
    state.numberChoice = {
      trigger: s.trigger,
      sourceNumber: s.sourceNumber,
      sourceTurn: s.sourceTurn,
      motor: s.key,
      score: s.score,
      matches: s.matches,
      tests: s.tests,
      spatialScore: s.spatialScore,
      play: copy(s.play),
    };
    return s;
  }

  function recordNumberComparison(before, n, turn) {
    const trigger = before.at(-1),
      s = bestNumberCombination(before);
    if (trigger == null || !s) return;
    state.numberComparisons.push({
      turn,
      trigger,
      sourceNumber: s.sourceNumber,
      sourceTurn: s.sourceTurn,
      next: n,
      covered: s.play.numbers.includes(n),
      centers: s.play.blocks.map((b) => b.center),
      triangleKey: triangleContext(before),
      spatialKeys: [...spatialRead(before).keys],
    });
  }

  function definitions() {
    return [
      ...ORIGINALS.map(([rule, name]) => ({
        id: "ORIGINAL:" + rule,
        name,
        rule,
        type: "ORIGINAL",
      })),
      ...Array.from({ length: 4 }, (_, i) => ({
        id: "RANK:" + (i + 1),
        name: "AUTO " + (i + 1) + "º",
        rank: i + 1,
        type: "RANK",
      })),
      ...ADAPTATIVES.map((config) => ({
        id: "ADAPTIVE:" + config.id,
        name: config.name,
        config,
        type: "ADAPTIVE",
      })),
      ...state.created.map((c) => ({
        id: "CREATED:" + c.id,
        name: c.name,
        config: c.config,
        type: "CREATED",
      })),
    ];
  }

  function motorRate(key, limit = 12) {
    if (key.includes("::")) return variantMotorRate(key, limit);
    const available = state.ledger.filter(
        (r) => r.motorHits && key in r.motorHits,
      ),
      rows = available.slice(-limit);
    if (!rows.length) return 0.5;
    const global = rows.filter((r) => r.motorHits[key]).length / rows.length,
      local = spatialMetrics(
        available,
        state.history,
        (r) => !!r.motorHits[key],
      ),
      w = (0.4 * local.support) / (local.support + 8);
    return global * (1 - w) + local.score * w;
  }

  function chooseMotor(def, cs, previous) {
    if (!cs.length) return null;
    const fixed = cs[clamp(state.rank - 1, 0, cs.length - 1)];
    if (def.rank) return cs[clamp(def.rank - 1, 0, cs.length - 1)];
    if (def.rule === "FIXED") return chooseAutoMotor(cs);
    if (def.config) {
      const c = def.config,
        ranked = cs
          .filter((m) => m.rank <= c.maxRank)
          .map((m) => ({
            motor: m,
            score:
              motorRate(m.key, 3) * 0.55 + motorRate(m.key, c.window) * 0.45,
          }))
          .sort((a, b) => b.score - a.score || a.motor.rank - b.motor.rank),
        best = ranked[0],
        old = ranked.find((x) => x.motor.key === previous);
      if (old && best && best.score < old.score + c.margin) return old.motor;
      return best?.motor || fixed;
    }
    if (def.rule === "GEO") return cs[0];
    if (def.rule === "BEST")
      return [...cs].sort(
        (a, b) => motorRate(b.key, 20) - motorRate(a.key, 20),
      )[0];
    if (def.rule === "STABLE")
      return cs.find((m) => m.key === previous && m.rank <= 5) || fixed;
    if (def.rule === "SWITCH") {
      const old = cs.find((m) => m.key === previous) || fixed,
        best = [...cs].sort(
          (a, b) => motorRate(b.key, 12) - motorRate(a.key, 12),
        )[0];
      return motorRate(best.key, 12) > motorRate(old.key, 12) + 0.12
        ? best
        : old;
    }
    if (["CONSENSUS", "UNION"].includes(def.rule)) {
      const w = Array(37).fill(0),
        selected = def.rule === "UNION" ? cs.slice(0, 3) : cs;
      for (const m of selected)
        for (const n of m.play.numbers) w[ix(n)] += 1 / (1 + m.rank * 0.1);
      applySpatial(w, state.history, 0.25);
      const play = geometry(w);
      if (play)
        return {
          key: def.rule,
          rank: 0,
          score: play.score,
          spatialScore: spatialCoverage(play, state.history),
          spatialKeys: [...spatialRead(state.history).keys],
          play,
        };
    }
    return fixed;
  }

  function fineG1(original, trigger, h = state.history) {
    if (!validPlay(original?.play)) return null;
    const w = Array(37).fill(0.01),
      mandatory = neighbors(trigger, 1);
    for (const n of original.play.numbers) w[ix(n)] += 100;
    applySpatial(w, h, 0.2);
    for (const n of mandatory) w[ix(n)] += 100000;
    const play = geometry(w, mandatory);
    return play
      ? {
          key: original.key,
          rank: original.rank,
          play,
          spatialScore: spatialCoverage(play, h),
        }
      : copy(original);
  }

  function g1History(strategy = null, mode = null, limit = 400) {
    return state.g1Rows
      .filter(
        (r) =>
          (strategy == null || r.strategy === strategy) &&
          (mode == null || r.mode === mode),
      )
      .slice(-limit);
  }

  function uniqueGales(strategy = null, limit = 100) {
    const map = new Map();
    for (const r of g1History(strategy, null, 5000)) {
      const k = r.strategy + "|" + r.eventId;
      if (!map.has(k)) map.set(k, r);
    }
    return [...map.values()].slice(-limit);
  }

  function numberG1Rows(strategy, trigger, mode = null, limit = 200) {
    return state.g1Rows
      .filter(
        (r) =>
          r.strategy === strategy &&
          r.trigger === trigger &&
          (mode == null || r.mode === mode),
      )
      .slice(-limit);
  }

  function numberG1Metrics(strategy, trigger, mode, limit = 100) {
    const rows = numberG1Rows(strategy, trigger, mode, limit),
      hits = rows.filter((r) => r.hit).length;
    return {
      total: rows.length,
      hits,
      loss: rows.length - hits,
      rate: rows.length ? hits / rows.length : null,
    };
  }

  function numberG1Events(strategy, trigger, limit = 100) {
    const map = new Map();
    for (const r of numberG1Rows(strategy, trigger, null, 1000))
      if (!map.has(r.eventId)) map.set(r.eventId, r);
    return [...map.values()].slice(-limit);
  }

  function behaviorReading(original, h, strategy, trigger = null) {
    const rows = uniqueGales(strategy, 45),
      recent = rows.slice(-12),
      last6 = rows.slice(-6),
      loss12 = recent.filter((r) => !r.hit).length,
      loss6 = last6.filter((r) => !r.hit).length,
      uncovered = new Set(missing(original.play)),
      outside6 = h.slice(-6).filter((n) => uncovered.has(n)).length;
    let streak = 0;
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i].hit) break;
      streak++;
    }
    const nr = trigger == null ? [] : numberG1Events(strategy, trigger, 20),
      recentN = nr.slice(-8),
      numberLoss = recentN.filter((r) => !r.hit).length;
    let type = "CONTINUIDADE";
    if (
      streak >= 3 ||
      (last6.length >= 5 && loss6 / last6.length >= 0.6) ||
      (h.length >= 6 && outside6 >= 4) ||
      (recentN.length >= 4 && numberLoss / recentN.length >= 0.6)
    )
      type = "RUPTURA";
    else if (
      (recent.length >= 5 && loss12 / recent.length >= 0.32) ||
      outside6 >= 2 ||
      (recentN.length >= 3 && numberLoss / recentN.length >= 0.34)
    )
      type = "DESLOCAMENTO";
    const s = spatialRead(h);
    return {
      type,
      streak,
      outside6,
      loss12,
      total12: recent.length,
      loss6,
      total6: last6.length,
      numberTotal: recentN.length,
      numberLoss,
      numberHit: recentN.length - numberLoss,
      triangle: s.tri.last?.labels.join(" + ") || "SEM TRINCA",
      poles: s.poles.active?.event || "SEM POLOS",
      arc: s.arcs.active
        ? s.arcs.active.health + " / " + s.arcs.active.event
        : s.arcs.last?.event || "SEM ARCO",
    };
  }

  function reconstructG1(original, trigger, h, strategy) {
    if (!validPlay(original?.play)) return null;
    const r = behaviorReading(original, h, strategy, trigger),
      w = Array(37).fill(0.1),
      recent = h.slice(-60),
      gales = g1History(strategy, null, 180),
      transitions = numberTransitions(h, trigger);
    for (const n of W) {
      const f60 = recent.filter((x) => x === n).length,
        f24 = h.slice(-24).filter((x) => x === n).length,
        f8 = h.slice(-8).filter((x) => x === n).length,
        losses = gales.filter((row) => !row.hit && row.outcome === n).length,
        conditional = transitions.reduce(
          (s, t) => s + (t.next === n ? Math.exp(-t.age / 35) : 0),
          0,
        );
      let v =
        f60 * 0.3 + f24 * 0.55 + f8 * 0.85 + losses * 0.35 + conditional * 2.2;
      if (r.type === "DESLOCAMENTO") v += f8 * 0.35 + conditional * 0.35;
      if (r.type === "RUPTURA")
        v += f8 * 0.6 + losses * 0.45 + conditional * 0.65;
      w[ix(n)] += v;
    }
    for (let k = 0; k < recent.length; k++) {
      const p = ix(recent[recent.length - 1 - k]),
        decay = Math.exp(-k / (r.type === "RUPTURA" ? 8 : 14));
      for (let j = 0; j < 37; j++) {
        const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
        if (d <= 3) w[j] += ((decay * (4 - d)) / 4) * 0.65;
      }
    }
    for (const n of neighbors(trigger, 2)) w[ix(n)] += 0.4;
    applySpatial(w, h, 0.4);
    const play = geometry(w);
    return validPlay(play)
      ? {
          key: "G1_INDEPENDENTE",
          rank: 0,
          play,
          behavior: r.type,
          spatialScore: spatialCoverage(play, h),
        }
      : null;
  }

  function defenses(original, trigger, h, strategy) {
    if (!validPlay(original?.play)) return [];
    const r = behaviorReading(original, h, strategy, trigger),
      recon = reconstructG1(original, trigger, h, strategy);
    return [
      { mode: "CONGELADA", motor: copy(original), behavior: r.type },
      {
        mode: "AJUSTE FINO",
        motor: fineG1(original, trigger, h),
        behavior: r.type,
      },
      ...(recon
        ? [{ mode: "RECONSTRUÇÃO", motor: recon, behavior: r.type }]
        : []),
    ];
  }

  function defenseMetrics(strategy, mode, limit = 100) {
    const rows = g1History(strategy, mode, limit),
      hits = rows.filter((r) => r.hit).length;
    return {
      total: rows.length,
      hits,
      loss: rows.length - hits,
      rate: rows.length ? hits / rows.length : null,
    };
  }

  function rankDefenses(options, strategy, h, trigger = null) {
    return options
      .map((o) => {
        const rows = g1History(strategy, o.mode, 100),
          recent = rows.slice(-12),
          hits = rows.filter((r) => r.hit).length,
          hits12 = recent.filter((r) => r.hit).length,
          base = 28 / 37,
          historical = (hits + base * 12) / (rows.length + 12),
          short = (hits12 + base * 8) / (recent.length + 8),
          coverage = h.length
            ? h.slice(-18).filter((n) => o.motor.play.numbers.includes(n))
                .length / Math.min(18, h.length)
            : base,
          byNumber =
            trigger == null
              ? { total: 0, hits: 0, loss: 0 }
              : numberG1Metrics(strategy, trigger, o.mode, 100),
          conditional = (byNumber.hits + base * 8) / (byNumber.total + 8);
        let bonus = 0;
        if (o.behavior === "CONTINUIDADE" && o.mode === "CONGELADA")
          bonus = 0.012;
        if (o.behavior === "DESLOCAMENTO" && o.mode === "AJUSTE FINO")
          bonus = 0.01;
        if (o.behavior === "RUPTURA" && o.mode === "RECONSTRUÇÃO") bonus = 0.02;
        const nw =
            trigger == null
              ? 0
              : Math.min(0.48, byNumber.total / (byNumber.total + 8)),
          global = historical * 0.55 + short * 0.25 + coverage * 0.2,
          original = global * (1 - nw) + conditional * nw + bonus,
          spatialScore = spatialCoverage(o.motor.play, h),
          local = spatialMetrics(rows, h, (r) => r.hit),
          lw = (0.2 * local.support) / (local.support + 8),
          combined = original * 0.8 + spatialScore * 0.2;
        return {
          ...o,
          score: combined * (1 - lw) + local.score * lw,
          spatialScore,
          contextTotal: local.total,
          total: rows.length,
          hits,
          loss: rows.length - hits,
          numberTotal: byNumber.total,
          numberHits: byNumber.hits,
          numberLoss: byNumber.loss,
          numberScore: conditional,
          uncovered: missing(o.motor.play),
        };
      })
      .sort((a, b) => b.score - a.score || b.numberTotal - a.numberTotal);
  }

  function chooseG1(original, trigger, h, strategy) {
    const ranked = rankDefenses(
      defenses(original, trigger, h, strategy),
      strategy,
      h,
      trigger,
    );
    if (!ranked.length) return null;
    let c = ranked[0];
    const frozen = ranked.find((x) => x.mode === "CONGELADA");
    if (
      frozen &&
      c !== frozen &&
      c.total < 8 &&
      c.numberTotal < 4 &&
      c.score - frozen.score < 0.025
    )
      c = frozen;
    return {
      motor: copy(c.motor),
      mode: c.mode,
      behavior: c.behavior,
      score: c.score,
      spatialScore: c.spatialScore,
      triangleKey: triangleContext(h),
      spatialKeys: [...spatialRead(h).keys],
      numberTotal: c.numberTotal,
      numberHits: c.numberHits,
      numberLoss: c.numberLoss,
      uncovered: c.uncovered,
      alternatives: ranked.map((o) => ({
        mode: o.mode,
        score: o.score,
        spatialScore: o.spatialScore,
        contextTotal: o.contextTotal,
        total: o.total,
        hits: o.hits,
        loss: o.loss,
        numberTotal: o.numberTotal,
        numberHits: o.numberHits,
        numberLoss: o.numberLoss,
      })),
    };
  }

  function virtualCycle(id) {
    return (
      state.virtual[id] ||
      (state.virtual[id] = {
        phase: "ENTRY",
        previous: null,
        defense: null,
        entry: null,
        trigger: null,
        entryTrigger: null,
        triangleKey: null,
        spatialKeys: [],
      })
    );
  }

  function profit(result) {
    const u = Number(state.stake) || 1,
      g = Number(state.multiplier) || 1;
    return result === "GREEN"
      ? 8 * u
      : result === "GREEN G1"
        ? (8 * g - 28) * u
        : result === "LOSS"
          ? -28 * (1 + g) * u
          : 0;
  }

  function settlePending(n, turn) {
    for (const p of state.g1Pending)
      state.g1Rows.push({
        turn,
        eventId: p.eventId,
        strategy: p.strategy,
        mode: p.mode,
        behavior: p.behavior,
        trigger: p.trigger,
        outcome: n,
        hit: p.numbers.includes(n),
        uncovered: p.uncovered,
        entryMotor: p.entryMotor || null,
        triangleKey: p.triangleKey || "SEM TRINCA",
        spatialKeys: copy(p.spatialKeys || []),
      });
    state.g1Pending = [];
  }

  function standardDecision(motor, n, h, strategy) {
    return state.g1Trainer
      ? chooseG1(motor, n, h, strategy)
      : {
          motor: state.g1 ? fineG1(motor, n, h) : copy(motor),
          mode: state.g1 ? "AJUSTE FINO" : "CONGELADA",
          behavior: behaviorReading(motor, h, strategy, n).type,
          triangleKey: triangleContext(h),
          spatialKeys: [...spatialRead(h).keys],
        };
  }

  function openRealGale(motor, n, after, turn) {
    const strategy = state.cycle.strategy;
    state.cycle.trigger = n;
    const d = standardDecision(motor, n, after, strategy);
    state.cycle.decision = d;
    state.defense = copy(d?.motor || motor);
    state.phase = state.galeSkip ? "GALE_SKIP" : "GALE";
    state.decisions.push({
      turn,
      strategy,
      mode: d?.mode || "CONGELADA",
      behavior: d?.behavior || "CONTINUIDADE",
      trigger: n,
      numberTests: d?.numberTotal || 0,
      triangleKey: d?.triangleKey,
      spatialKeys: copy(d?.spatialKeys || []),
    });
  }

  function undoSnapshot() {
    const { undoStack, ...data } = state;
    return copy(data);
  }

  function inverseChanges(before, after, path = [], ops = []) {
    if (JSON.stringify(before) === JSON.stringify(after)) return ops;
    if (Array.isArray(before) && Array.isArray(after)) {
      const a = before.map((v) => JSON.stringify(v)),
        b = after.map((v) => JSON.stringify(v));
      let drop = -1;
      for (let d = 0; d <= a.length; d++) {
        const count = a.length - d;
        if (count > b.length) continue;
        if (count && a[d] !== b[0]) continue;
        let equal = true;
        for (let j = 0; j < count; j++)
          if (a[d + j] !== b[j]) {
            equal = false;
            break;
          }
        if (equal) {
          drop = d;
          break;
        }
      }
      const shared = a.length - drop;
      ops.push({
        kind: "slide",
        path: [...path],
        removeTail: after.length - shared,
        restoreHead: copy(before.slice(0, drop)),
      });
      return ops;
    }
    if (
      before &&
      after &&
      typeof before === "object" &&
      typeof after === "object" &&
      !Array.isArray(before) &&
      !Array.isArray(after)
    ) {
      for (const k of new Set([
        ...Object.keys(before),
        ...Object.keys(after),
      ])) {
        if (!(k in before)) ops.push({ kind: "delete", path: [...path, k] });
        else if (!(k in after))
          ops.push({ kind: "set", path: [...path, k], value: copy(before[k]) });
        else inverseChanges(before[k], after[k], [...path, k], ops);
      }
      return ops;
    }
    ops.push({ kind: "set", path: [...path], value: copy(before) });
    return ops;
  }

  function applyInverse(ops) {
    for (const op of ops) {
      let parent = state;
      for (const k of op.path.slice(0, -1)) parent = parent[k];
      const key = op.path.at(-1);
      if (op.kind === "slide") {
        const a = parent[key];
        if (op.removeTail) a.splice(a.length - op.removeTail, op.removeTail);
        a.unshift(...copy(op.restoreHead));
      } else if (op.kind === "delete") delete parent[key];
      else parent[key] = copy(op.value);
    }
  }

  function waitFrame() {
    return new Promise((r) => requestAnimationFrame(() => r()));
  }

  function parseInput(text) {
    return (String(text).match(/\d+/g) || [])
      .map(Number)
      .filter((n) => Number.isInteger(n) && n >= 0 && n <= 36);
  }

  const VARIANT_OWNERS = [
    ...ORIGINALS.map(([id, name]) => ({ id, name })),
    { id: "NUMBER", name: "TREINADOR GLOBAL NÚMEROS" },
  ];

  const VARIANT_PROFILES = [
    { name: "EQUILÍBRIO", decay: 18, space: [1, 1, 1, 1, 1], recent: 0.18 },
    {
      name: "RECENTE",
      decay: 5,
      space: [1.4, 1.2, 0.6, 0.6, 1.2],
      recent: 0.95,
    },
    {
      name: "ESTABILIDADE",
      decay: 36,
      space: [0.8, 0.8, 1.1, 1.5, 0.8],
      recent: 0.12,
    },
    {
      name: "PERCURSO",
      decay: 12,
      space: [0.9, 1.5, 0.6, 0.6, 2.2],
      recent: 0.35,
    },
    {
      name: "TRIANGULAÇÃO",
      decay: 16,
      space: [2.3, 1.6, 0.5, 0.5, 1],
      recent: 0.25,
    },
    {
      name: "POLOS E ARCOS",
      decay: 24,
      space: [0.6, 0.7, 2.4, 2.1, 0.6],
      recent: 0.25,
    },
    {
      name: "RETORNO",
      decay: 10,
      space: [1.5, 0.8, 1.5, 0.6, 1.3],
      recent: 0.45,
    },
    { name: "AMPLITUDE", decay: 8, space: [1, 1.4, 0.6, 1.1, 2], recent: 0.65 },
  ];

  const variantForecastCache = new Map();

  let variantEvaluationContext = null;

  let strategyButtonsSignature = null;

  function variantBookId(owner, variation) {
    return owner + "@V" + variation;
  }

  function variantBook(owner, variation) {
    const id = variantBookId(owner, variation);
    return (
      state.variantBooks[id] ||
      (state.variantBooks[id] = {
        rows: [],
        previous: null,
        autoRank: 1,
        combinations: [],
        cycle: null,
      })
    );
  }

  function variantAnalyticalWeights(
    h,
    family,
    radius,
    owner,
    variation,
    base,
    spatial,
    shared,
  ) {
    const profile = VARIANT_PROFILES[variation - 1];
    const ownerIndex = VARIANT_OWNERS.findIndex((o) => o.id === owner);
    const normalized = normalizeSpace(base);
    const additiveKey = owner + "@" + variation + ":" + radius;
    const coefficient = 0.78 + 0.035 * ownerIndex;
    if (shared?.additive.has(additiveKey)) {
      const item = shared.additive.get(additiveKey);
      const raw = normalized.map((v, j) => v * coefficient + item.weights[j]);
      const mean = avg(raw) || 1;
      return {
        weights: raw.map((v) => v / mean),
        poolScores: item.scores.map(
          (v, j) =>
            (v + coefficient * shared.base.get(family + "_" + radius)[j]) /
            mean,
        ),
      };
    }
    const shares = profile.space.map((v, k) => v * spatial.adaptive.shares[k]);
    const shareTotal = shares.reduce((s, v) => s + v, 0);
    const recent = Array(37).fill(0.01);
    const decay = profile.decay * (0.85 + ownerIndex * 0.065);
    for (let age = 0; age < h.length; age++) {
      const center = h[h.length - 1 - age],
        mass = Math.exp(-age / decay);
      for (let j = 0; j < 37; j++) {
        const d = distance(center, W[j]);
        if (d <= radius) recent[j] += (mass * (radius + 1 - d)) / (radius + 1);
      }
    }
    const recency = normalizeSpace(recent);
    const completeWeights667=motorReadings667.weights(h,{variation,radius});
    const last = h.at(-1),
      prior = h.at(-2);
    const jump = prior == null ? 0 : direction(prior, last);
    const returnCenter = prior == null ? last : prior;
    const projected = W[mod(ix(last) + jump)];
    const amplitude = clamp(
      Math.round(spatial.route.triangle?.amplitude || Math.abs(jump)),
      1,
      18,
    );
    // Hipóteses espaciais distintas, definidas antes do resultado. Não são o
    // trajeto físico da bola nem uma rotação posterior de uma jogada já pronta.
    const offsets = [0, -3, 3, -6, 6, -10, 10, 18];
    const hypothesis = W[mod(ix(projected) + offsets[variation - 1])];
    const additive = W.map((n, j) => {
      const mixed = spatial.components.reduce(
        (sum, w, k) => sum + (w[j] * shares[k]) / shareTotal,
        0,
      );
      let value = mixed * 0.65 + recency[j] * profile.recent;
      value+=.18*(completeWeights667[j]-1);
      value +=
        1.8 * Math.exp(-distance(n, hypothesis) / (1.6 + (radius - 4) * 0.4));
      if (variation === 4) value += 0.5 * Math.exp(-distance(n, projected) / 2);
      if (variation === 7)
        value += 0.8 * Math.exp(-distance(n, returnCenter) / 2);
      if (variation === 8)
        value += 0.65 * Math.exp(-Math.abs(distance(last, n) - amplitude) / 2);
      if (owner === "NUMBER") {
        for (let i = 0; i < h.length - 1; i++)
          if (h[i] === last) {
            value +=
              Math.exp(-(h.length - 2 - i) / (decay + 8)) *
              Math.exp(-distance(n, h[i + 1]) / (1.5 + (variation % 3))) *
              2;
          }
      }
      return value;
    });
    const raw = normalized.map((v, j) =>
      Math.max(0.001, v * coefficient + additive[j]),
    );
    if (!shared) return normalizeSpace(raw);
    const scores = diversityCandidates().map((c) => candidateFit(c, additive));
    shared.additive.set(additiveKey, { weights: additive, scores });
    const mean = avg(raw) || 1;
    return {
      weights: raw.map((v) => v / mean),
      poolScores: scores.map(
        (v, j) =>
          (v + coefficient * shared.base.get(family + "_" + radius)[j]) / mean,
      ),
    };
  }

  function candidateFit(candidate, weights) {
    let sum = 0;
    const indices =
      candidate.indices || (candidate.indices = candidate.play.numbers.map(ix));
    for (let k = 0; k < indices.length; k++) sum += weights[indices[k]];
    return sum;
  }

  function variantMotorRate(key, limit = 12) {
    const id = key.split("::")[0];
    const motorKey = key.split("::")[1];
    const available = state.variantBooks[id]?.rows || [];
    const rows = available.slice(-limit);
    if (!rows.length) return 0.5;
    const global =
      rows.filter((r) => r.motorHits[motorKey]).length / rows.length;
    const local = spatialMetrics(
      available,
      state.history,
      (r) => !!r.motorHits[motorKey],
    );
    const weight = (0.4 * local.support) / (local.support + 8);
    return global * (1 - weight) + local.score * weight;
  }

  function variantAutoChoice(cs) {
    const book = variantEvaluationContext;
    const ranked = cs
      .slice(0, 4)
      .map((motor, i) => {
        const rows = book.rows.slice(-30),
          recent = rows.slice(-5),
          rank = i + 1;
        const direct =
          (rows.filter((r) => r.rankHits[rank]).length + (4 * 28) / 37) /
          (rows.length + 4);
        const short =
          (recent.filter((r) => r.rankHits[rank]).length + (2 * 28) / 37) /
          (recent.length + 2);
        return { motor, rank, score: direct * 0.55 + short * 0.45 };
      })
      .sort((a, b) => b.score - a.score || a.rank - b.rank);
    const current = ranked.find((r) => r.rank === book.autoRank);
    const best =
      current && ranked[0].score - current.score < 0.012 ? current : ranked[0];
    return { ...best.motor, autoRank: best.rank };
  }

  function chooseVariant(owner, variation, cs, h) {
    const id = variantBookId(owner, variation);
    const book = state.variantBooks[id] || {
      rows: [],
      previous: null,
      autoRank: 1,
      combinations: [],
    };
    if (owner === "NUMBER") {
      const trigger = h.at(-1);
      const choices = [
        ...cs.map((m) => ({ motor: m, record: null })),
        ...book.combinations
          .filter((r) => validPlay(r.play))
          .map((record) => ({
            motor: {
              key: id + "::NUM@" + record.turn,
              rank: 0,
              play: record.play,
              score: record.play.score,
            },
            record,
          })),
      ];
      const ranked = choices
        .map((item) => {
          const record = item.record || {
            play: item.motor.play,
            covered: item.motor.play.numbers,
            turn: state.totalTurns,
            origin: trigger,
          };
          const comparison = compareNumberCombination(record, trigger, h);
          return { ...item, score: comparison.score };
        })
        .sort((a, b) => b.score - a.score || b.motor.score - a.motor.score);
      return {
        ...copy(ranked[0].motor),
        bankId: id,
        owner,
        variation,
        type: "NUMBER",
        trigger,
        sourceNumber: ranked[0].record?.origin ?? trigger,
        sourceTurn: ranked[0].record?.turn ?? state.totalTurns,
      };
    }
    variantEvaluationContext = book;
    try {
      const motor = chooseMotor({ rule: owner }, cs, book.previous);
      return { ...copy(motor), bankId: id, owner, variation };
    } finally {
      variantEvaluationContext = null;
    }
  }

  function activeVariationOwner() {
    return VARIANT_OWNERS.some((o) => o.id === state.strategy)
      ? state.strategy
      : null;
  }

  function settleVariantForecasts(forecasts, n, turn, before) {
    for (const f of forecasts) {
      const book = variantBook(f.owner, f.variation),
        motorHits = {},
        rankHits = {};
      for (const m of f.motors) {
        const motorKey = m.family + "_" + m.radius;
        motorHits[motorKey] = m.play.numbers.includes(n);
        if (m.rank <= 4) rankHits[m.rank] = motorHits[motorKey];
      }
      book.rows.push({
        turn,
        motorHits,
        rankHits,
        entryHit: f.choice.play.numbers.includes(n),
        selectedKey: f.choice.key,
        spatialKeys: [...spatialRead(before).keys],
      });
      book.rows = book.rows.slice(-WINDOW);
      book.previous = f.choice.key;
      book.autoRank = f.choice.autoRank || book.autoRank;
      if (f.owner === "NUMBER") {
        const generated = f.motors[0];
        book.combinations.push({
          turn: turn - 1,
          origin: before.at(-1),
          play: copy(generated.play),
          covered: [...generated.play.numbers],
        });
        book.combinations = book.combinations.slice(-WINDOW);
      }
    }
  }

  function breakdown(strategy = null, mode = "CONGELADA") {
    const out = {
      CONTINUIDADE: { total: 0, hits: 0 },
      DESLOCAMENTO: { total: 0, hits: 0 },
      RUPTURA: { total: 0, hits: 0 },
    };
    for (const r of g1History(strategy, mode, 5000)) {
      const v = out[r.behavior];
      if (!v) continue;
      v.total++;
      if (r.hit) v.hits++;
    }
    return out;
  }
  /* ANÁLISES A CADA RESULTADO; RETIRADA DO HISTÓRICO EM BLOCOS DE DEZ. A entrada e o G1 comprometidos permanecem
   congelados. A avaliação de cada resultado usa somente a previsão anterior. */
  let blockRuntimeKey = null;
  let blockRuntimeData = null;
  let workerClient = null;
  let workerDisabled = false;
  let clientSequence = 0;
  let clientRequests = new Map();
  let inputQueue = [];
  let inputRunning = false;
  let saveTimer = null;
  let lastInputMs = 0;
  let durableTurn = 0;
  const geometryMemo = new Map();

  function geometry(weights, mandatory = []) {
    const key = weights.join(",") + "|" + mandatory.join(",");
    if (geometryMemo.has(key)) return copy(geometryMemo.get(key));
    const play = rawGeometry(weights, mandatory);
    geometryMemo.set(key, copy(play));
    if (geometryMemo.size > 160)
      geometryMemo.delete(geometryMemo.keys().next().value);
    return play;
  }

  function fresh() {
    return {
      structuralMemoryVersion: "6.6.13",
      structuralMemoryEnabled: false,
      forecastVersion: VERSION,
      history: [],
      historyTurns: [],
      sources: [],
      totalTurns: 0,
      manualCount: 0,
      manualLog: [],
      undoStack: [],
      strategy: "MASTER",importAudit:null,
      masterChoice: null,
      masterHistory: [], masterLessons:[],masterReviews:[],importReanalyses:[],reanalysisPolicies:[],
      masterResumeTurn: 0,
      globalStrategyPrevious: null,
      postLossEnabled: false,
      postThreeEnabled: false,
      postThreeUsed: {},
      strategyStreaks: {},
      focusTimelineId: null,
      rank: 3,
      manual: null,
      adaptive: "A05",
      created: [],
      activeCreated: null,
      g1: true,
      g1Trainer: true,
      galeSkip: false,
      secondHouse: false,
      stake: 1,
      multiplier: 1,
      phase: "ENTRY",
      cycle: null,
      defense: null,
      previous: null,
      trainerChoice: null,
      trainerTurns: 0,
      trainerChanges: 0,
      trainerPending: false,
      trainerHistory: [],
      numberChoice: null,
      numberChanges: 0,
      numberHistory: [],
      numberCombinations: [],
      numberComparisons: [],
      virtual: {},
      entryRows: [],
      g1Rows: [],
      g1Pending: [],
      realG1: [],
      decisions: [],
      ledger: [],
      variantBooks: {},
      variantSelections: {},
      strategyTimeline: {},
      timelineCycles: {},
      timelineFormat: 2,
      autoRows: [],
      autoRank: 1,
      groupsOpen: { trainers: true, originals: false },
      open: { general: true, timeline: true },
      block: {
        size: 0,
        pending: 0,
        revision: 0,
        anchor: [],
        decisionTurn: 0,
        data: null,
        best: null,
      },
    };
  }

  function normalizeState(data) {
    const r = fresh();
    for (const key of Object.keys(r))
      if (data?.[key] !== undefined) r[key] = data[key];
    r.history = cleanNumbers(r.history);
    if (r.history.length > 79) r.history = r.history.slice(-70);
    for (const field of [
      "historyTurns",
      "sources",
      "manualLog",
      "undoStack",
      "created",
      "trainerHistory",
      "numberHistory",
      "numberCombinations",
      "numberComparisons",
      "entryRows",
      "g1Rows",
      "g1Pending",
      "realG1",
      "decisions",
      "ledger",
      "autoRows",
      "masterHistory",
    "masterLessons","masterReviews","importReanalyses","reanalysisPolicies",])
      if (!Array.isArray(r[field])) r[field] = [];
    r.totalTurns = Math.max(
      Number(r.totalTurns) || 0,
      r.history.length,
      Number(r.ledger.at(-1)?.turn) || 0,
    );
    if (r.historyTurns.length !== r.history.length)
      r.historyTurns = r.history.map(
        (_, i) => r.totalTurns - r.history.length + i + 1,
      );
    if (r.sources.length !== r.history.length)
      r.sources = r.history.map(() => "HISTÓRICO");
    for (const field of [
      "variantBooks",
      "variantSelections",
      "strategyTimeline",
      "timelineCycles",
      "virtual",
      "groupsOpen",
      "postThreeUsed",
      "strategyStreaks",
    ]) {
      if (!r[field] || typeof r[field] !== "object") r[field] = {};
    }
    if (data?.timelineFormat !== 2) {
      r.strategyTimeline = {};
      r.timelineCycles = {};
      r.timelineFormat = 2;
    }
    if (data?.postLossEnabled === undefined && r.strategy === "POSTLOSS")
      r.postLossEnabled = true;
    r.postLossEnabled = !!r.postLossEnabled;
    r.postThreeEnabled = !!r.postThreeEnabled;
    if (
      data?.forecastVersion !== VERSION &&
      data?.strategy === "TRAINER" &&
      !Object.prototype.hasOwnProperty.call(data, "masterResumeTurn")
    )
      r.strategy = "MASTER";
    r.masterResumeTurn = Math.max(0, Number(r.masterResumeTurn) || 0);
    if (r.cycle && !r.cycle.controller) r.cycle.controller = r.strategy;
    r.open = {
      general: r.open?.general !== false,
      timeline: r.open?.timeline !== false,
    };
    if (
      !r.block ||
      !Array.isArray(r.block.anchor) ||
      !Number.isInteger(r.block.size)
    ) {
      r.block = {
        size: Math.min(70, r.history.length),
        pending: 0,
        revision: 0,
        anchor: [...r.history],
        decisionTurn: r.totalTurns,
        data: null,
        best: null,
      };
    }
    r.block.size = clamp(r.block.size || r.history.length, 0, 70);
    r.block.pending = clamp(Number(r.block.pending) || 0, 0, 9);
    if (r.forecastVersion !== VERSION) {
      r.block.data = null;
      r.forecastVersion = VERSION;
    }
    r.undoStack = r.undoStack.slice(-70);
    if (
      !VARIANT_OWNERS.some((o) => o.id === r.strategy) &&
      ![
        "MASTER",
        "TRAINER",
        "POSTLOSS",
        "AUTO",
        "ADAPTIVE",
        "CREATED",
      ].includes(r.strategy)
    ) {
      r.strategy = "TRAINER";
      r.manual = null;
    }
    if(data.structuralMemoryVersion!=="6.6.13"){
      r.structuralMemoryVersion="6.6.13";
      r.block={...r.block,data:null};
    }

    return r;
  }

  function settings() {
    return Object.fromEntries(
      [
        "structuralMemoryEnabled","strategy",
        "postLossEnabled",
        "postThreeEnabled",
        "rank",
        "manual",
        "adaptive",
        "created",
        "activeCreated",
        "g1",
        "g1Trainer",
        "galeSkip",
        "secondHouse",
        "stake",
        "multiplier",
        "groupsOpen",
        "variantSelections",
      ].map((k) => [k, copy(state[k])]),
    );
  }

  function clearSpatialCaches() {
    motorReadings667.clear();
    triangleMemory666.clear();
    triangleCache.clear();
    spaceCache.clear();
    rawSpaceCache.clear();
    motorDiversityCache.clear();
    variantForecastCache.clear();
    blockRuntimeKey = null;
    blockRuntimeData = null;
  }

  function compactMotor(m) {
    const result = { readingVersion:"6.6.13", readingCandidates:37,};
    for (const field of [
      "key",
      "rank",
      "family",
      "radius",
      "score",
      "bankId",
      "owner",
      "variation",
      "autoRank",
      "type",
      "trigger",
      "sourceNumber",
      "sourceTurn",
    ])
      if (m[field] != null) result[field] = m[field];
    result.shape = signaturePlay(m.play);
    return result;
  }

  function expandMotor(m) {
    const { shape, ...motor } = m;
    return { ...motor, play: restoreShape(shape, m.score) };
  }

  

  function prepareBlock() {
    if (state.history.length < 8) return null;
    if (state.block.data && state.block.decisionTurn === state.totalTurns)
      return currentBlock();
    state.block.anchor = [...state.history].slice(-70);
    state.block.decisionTurn = state.totalTurns;
    variantForecastCache.clear();
    const variants = allVariantForecasts(state.block.anchor),
      global = motors(state.block.anchor);
    state.block.data = {
      global: global.map(compactMotor),
      variants: variants.map((f) => ({
        bankId: f.bankId,
        owner: f.owner,
        name: f.name,
        variation: f.variation,
        motors: f.motors.map(compactMotor),
        choice: compactMotor(f.choice),
      })),
    };
    state.block.best = rankBestVariation();
    registerNumberCombination(state.block.anchor, state.totalTurns);
    updateNumberChoice();
    updateTrainer();
    blockRuntimeKey = null;
    updateMaster(currentBlock());
    return currentBlock();
  }

  function currentBlock() {
    if (!state.block.data) return null;
    const key = state.block.revision + "|" + state.block.decisionTurn;
    if (blockRuntimeKey === key && blockRuntimeData) return blockRuntimeData;
    const data = state.block.data;
    blockRuntimeData = {
      global: data.global.map(expandMotor),
      variants: data.variants.map((f) => ({
        ...f,
        motors: f.motors.map(expandMotor),
        choice: expandMotor(f.choice),
      })),
    };
    blockRuntimeKey = key;
    return blockRuntimeData;
  }

  function selectedVariantForecast() {
    const owner = activeVariationOwner();
    if (!owner || chosenVariation(owner) === 0) return null;
    return (
      currentBlock()?.variants.find(
        (f) => f.owner === owner && f.variation === chosenVariation(owner),
      ) || null
    );
  }

  function chooseAutoMotor(cs, h = state.history) {
    if (variantEvaluationContext) return variantAutoChoice(cs);
    const ranked = cs
      .slice(0, 4)
      .map((motor, i) => {
        const rank = i + 1,
          rows = state.autoRows.slice(-30),
          recent = rows.slice(-5);
        const score =
          ((rows.filter((r) => r.hits[rank]).length + (4 * 28) / 37) /
            (rows.length + 4)) *
            0.6 +
          ((recent.filter((r) => r.hits[rank]).length + (2 * 28) / 37) /
            (recent.length + 2)) *
            0.4;
        return { motor, rank, score };
      })
      .sort((a, b) => b.score - a.score || a.rank - b.rank);
    if (!ranked.length) return null;
    const current = ranked.find((r) => r.rank === state.autoRank);
    const choice =
      current && ranked[0].score - current.score < 0.012 ? current : ranked[0];
    return { ...choice.motor, autoRank: choice.rank };
  }

  function activeDefinition() {
    if (
      state.strategy === "MASTER" &&
      !state.cycle &&
      masterRestRemaining() > 0 &&
      !priorityRecoveryChoice()
    )
      return {
        id: "MASTER",
        name: "MASTER • PAUSA • FALTAM " + masterRestRemaining() + " GIRO(S)",
        type: "MASTER",
      };
    const target = state.cycle
      ? state.cycle.original?.postLossTarget
      : priorityRecoveryChoice()?.motor?.postLossTarget;
    if (target)
      return {
        id: target.defenseStrategy || target.id,
        name:
          (target.kind === "POST3"
            ? "JOGADA PÓS-3 LOSS • "
            : "JOGADA PÓS-LOSS • ") + target.name,
        type: "POSTLOSS",
      };
    if (
      state.cycle?.controller === "TRAINER" &&
      state.cycle.original?.globalStrategyTarget
    )
      return {
        id: "TRAINER",
        name:
          "TREINADOR GLOBAL • " +
          state.cycle.original.globalStrategyTarget.name,
        type: "GLOBAL_STRATEGY",
      };
    if (state.cycle?.original?.masterTarget)
      return {
        id: state.cycle.strategy,
        name: "MASTER • " + state.cycle.original.masterTarget.name,
        type: "MASTER",
      };
    if (state.cycle)
      return (
        [...definitions(), ...trainerRanking()].find(
          (d) => d.id === state.cycle.strategy,
        ) || baseActiveDefinition()
      );
    return baseActiveDefinition();
  }

  function trainerRanking() {
    const base = definitions().map((def) => {
      const rows = state.entryRows
        .filter((r) => r.strategy === def.id && r.closed)
        .slice(-30);
      const hits = rows.filter((r) => r.result !== "LOSS").length;
      return {
        ...def,
        total: rows.length,
        hits,
        score: (hits + (8 * 28) / 37) / (rows.length + 8),
      };
    });
    for (const f of state.block.data?.variants || []) {
      const rows = state.variantBooks[f.bankId]?.rows || [],
        hits = rows.filter((r) => r.entryHit).length;
      base.push({
        id: f.bankId,
        name: f.name + " • V" + f.variation,
        type: "VARIANT",
        owner: f.owner,
        variation: f.variation,
        total: rows.length,
        hits,
        score: (hits + (8 * 28) / 37) / (rows.length + 8),
      });
    }
    return base.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  }

  function updateTrainer() {
    const ranked = trainerRanking(),
      best = ranked[0];
    if (!best) return;
    const current = ranked.find((d) => d.id === state.trainerChoice);
    const selected =
      current && best.score - current.score < 0.035 ? current : best;
    if (state.trainerChoice !== selected.id) {
      if (state.trainerChoice) state.trainerChanges++;
      state.trainerHistory.push({
        turn: state.totalTurns,
        from: state.trainerChoice || "INICIAL",
        to: selected.id,
        score: selected.score,
      });
      state.trainerChoice = selected.id;
      state.trainerTurns = 0;
    }
  }

  function activeMotor(cs = currentBlock()?.global || []) {
    const recovery = priorityRecoveryChoice();
    if (recovery) return copy(recovery.motor);
    if (
      state.strategy === "MASTER" &&
      !state.cycle &&
      masterRestRemaining() > 0
    )
      return null;
    if (state.manual)
      return cs.find((m) => m.key === state.manual) || cs[0] || null;
    if (state.postLossEnabled || state.strategy === "POSTLOSS") {
      const selected = postLossChoice();
      if (selected) return copy(selected.motor);
    }
    if (state.strategy === "POSTLOSS") return null;
    if (state.strategy === "MASTER")
      return copy(masterSelection()?.motor || null);
    if (state.strategy === "TRAINER") return copy(independentGlobalMotor());
    if (state.variantSelections[activeVariationOwner()] === -3)
      return thirdVariationMotor(activeVariationOwner());
    const direct = selectedVariantForecast();
    if (direct) return copy(direct.choice);
    return motorForDefinition(baseActiveDefinition(), cs, state.previous);
  }

  function pruneRolling() {
    const cutoff = state.historyTurns[0] || 1;
    for (const field of [
      "ledger",
      "entryRows",
      "g1Rows",
      "numberCombinations",
      "numberComparisons",
      "numberHistory",
      "realG1",
      "decisions",
      "trainerHistory",
      "autoRows",
    ]) {
      state[field] = state[field].filter(
        (r) => Number.isFinite(r.turn) && r.turn >= cutoff,
      );
    }
    for (const b of Object.values(state.variantBooks)) {
      b.rows = b.rows.filter((r) => r.turn >= cutoff);
      b.combinations = b.combinations.filter((r) => r.turn >= cutoff - 1);
    }
  }

  function settleNativeStrategies(
    cs,
    numberBefore,
    n,
    turn,
    after,
    trigger,
    spatial,
  ) {
    settlePending(n, turn);
    const pending = [];
    for (const def of [...definitions(), { id: "NUMBER", type: "NUMBER" }]) {
      const v = virtualCycle(def.id);
      if (v.phase === "ENTRY") {
        const m =
          def.type === "NUMBER"
            ? numberBefore
            : chooseMotor(def, cs, v.previous);
        if (!m) continue;
        v.previous = m.key;
        v.entryTrigger = trigger;
        v.spatialKeys = [...spatial.keys];
        if (m.play.numbers.includes(n)) {
          state.entryRows.push({
            turn,
            strategy: def.id,
            result: "GREEN",
            closed: true,
            motor: m.key,
            spatialKeys: [...spatial.keys],
            profit: profit("GREEN"),
          });
        } else {
          v.phase = "GALE";
          v.entry = copy(m);
          v.trigger = n;
          const options = defenses(m, n, after, def.id);
          for (const o of options)
            pending.push({
              eventId: def.id + "@" + turn,
              strategy: def.id,
              mode: o.mode,
              behavior: o.behavior,
              trigger: n,
              entryMotor: m.key,
              numbers: [...o.motor.play.numbers],
              uncovered: missing(o.motor.play),
              spatialKeys: [...spatialRead(after).keys],
            });
          const decision = chooseG1(m, n, after, def.id);
          v.defense = decision?.motor || fineG1(m, n, after) || copy(m);
        }
      } else {
        const result = v.defense?.play.numbers.includes(n)
          ? "GREEN G1"
          : "LOSS";
        state.entryRows.push({
          turn,
          strategy: def.id,
          result,
          closed: true,
          motor: v.entry?.key,
          spatialKeys: copy(v.spatialKeys || []),
          profit: profit(result),
        });
        v.phase = "ENTRY";
        v.entry = null;
        v.defense = null;
        v.trigger = null;
      }
    }
    state.g1Pending = pending;
  }

  function spin(n, source = "HISTÓRICO") {
    if (!Number.isInteger(n) || n < 0 || n > 36) throw Error("NÚMERO INVÁLIDO");
    const before = [...state.history],
      turn = state.totalTurns + 1,
      trigger = before.at(-1);
    const block = before.length >= 8 ? currentBlock() || prepareBlock() : null;
    const cs = block?.global || [],
      forecasts = block?.variants || [];
    const timelineForecasts = snapshotTimelineForecasts(block);
    const phaseBefore = state.phase,
      oldCycle = copy(state.cycle),
      definitionBefore = activeDefinition();
    const controller = oldCycle?.controller || state.strategy;
    const masterPaused =
      state.strategy === "MASTER" &&
      state.phase === "ENTRY" &&
      masterRestRemaining() > 0 &&
      !priorityRecoveryChoice(block);
    const spatial = spatialRead(before.slice(-70)),
      after = [...before, n].slice(-70);
    let result = "AGUARDANDO",
      played = null;
    const masterReviewDraft=controller==='MASTER'&&phaseBefore==='ENTRY'&&!masterPaused&&block
      ?prepareMasterReview(timelineForecasts,block):null;
    if (masterPaused) {
      result = "PAUSA MASTER";
    } else if (state.phase === "ENTRY") {
      const motor = activeMotor(cs);
      if (motor) {
        played = copy(motor);
        state.previous = motor.key;
        if (motor.postLossTarget?.kind === "POST3")
          state.postThreeUsed[motor.postLossTarget.id] =
            motor.postLossTarget.lossTurn;
        state.cycle = {
          controller: state.strategy,
          strategy: definitionBefore.id,
          original: copy(motor),
          entryTurn: turn,
          entryTrigger: trigger,
          trigger: null,
          decision: null,
          triangleKey: triangleContext(before),
          spatialKeys: [...spatial.keys],
        };
        if (state.secondHouse) {
          state.defense = copy(motor);
          state.phase = "SECOND_SKIP";
          result = "2ª CASA";
        } else if (motor.play.numbers.includes(n)) {
          result = "GREEN";
          state.cycle = null;
        } else {
          result = "GALE";
          openRealGale(motor, n, after, turn);
        }
      }
    } else if (state.phase === "SECOND_SKIP") {
      played = copy(state.defense);
      result = "CASA PULADA";
      state.phase = "SECOND_ENTRY";
    } else if (state.phase === "SECOND_ENTRY") {
      played = copy(state.defense);
      if (played?.play.numbers.includes(n)) {
        result = "GREEN";
        state.phase = "ENTRY";
        state.cycle = null;
        state.defense = null;
      } else {
        result = "GALE";
        openRealGale(played, n, after, turn);
      }
    } else if (state.phase === "GALE_SKIP") {
      played = copy(state.defense);
      result = "GALE PULADO";
      state.phase = "GALE";
    } else if (state.phase === "GALE") {
      played = copy(state.defense);
      result = played?.play.numbers.includes(n) ? "GREEN G1" : "LOSS";
      state.realG1.push({
        turn,
        strategy: state.cycle?.strategy,
        mode: state.cycle?.decision?.mode,
        behavior: state.cycle?.decision?.behavior,
        trigger: state.cycle?.trigger,
        outcome: n,
        result,
      });
      state.phase = "ENTRY";
      state.cycle = null;
      state.defense = null;
    }
    recordMasterCycle(controller, oldCycle, played, result, turn);
    settleTimelineForecasts(timelineForecasts, n, turn, before);
    advanceMasterReviews(masterReviewDraft,played,controller,oldCycle,result,n,turn,before);
    updateStrategyStreaks(turn);
    settleNativeStrategies(
      cs,
      block?.variants.find((f) => f.owner === "NUMBER")?.choice,
      n,
      turn,
      after,
      trigger,
      spatial,
    );
    settleVariantForecasts(forecasts, n, turn, before.slice(-70));
    const motorHits = {};
    for (const m of cs) motorHits[m.key] = m.play.numbers.includes(n);
    const hits = {};
    for (const m of cs.slice(0, 4)) hits[m.rank] = motorHits[m.key];
    if (cs.length) state.autoRows.push({ turn, hits });
    const postLossTarget = copy(
      oldCycle?.original?.postLossTarget || played?.postLossTarget || null,
    );
    const playRoute = played
      ? postLossTarget
        ? postLossTarget.kind === "POST3"
          ? "POST3LOSS"
          : "POSTLOSS"
        : "NORMAL"
      : null;
    state.ledger.push({
      readingAudit: {
        version: "6.6.13", prefix: [...before].slice(-70), beforeTurn: turn-1,
        candidateCount: 37, chainMaximum:before.length, poleTolerances:19, polePairPositions:1369, arcWindowCount:before.length, relativeForms:1369, amplitudeForms:361, formsEvaluated:motorReadings667.summary(before).formsEvaluated, channelCount: motorReadings667.summary(before).channelCount,
        supportedGroups: motorReadings667.summary(before).groups.filter(group=>group.support>0).map(group=>group.name),
        coveredByMotors: Object.keys(motorHits).filter(key=>motorHits[key]),
        selectedBank: oldCycle?.original?.bankId||played?.bankId||"GLOBAL",
        bankAlternatives: [{bankId:"GLOBAL",coveredBy:cs.filter(motor=>motor.play.numbers.includes(n)).map(motor=>motor.key)},
          ...forecasts.map(forecast=>({bankId:forecast.bankId,coveredBy:forecast.motors.filter(motor=>motor.play.numbers.includes(n)).map(motor=>motor.key)}))],
        readingSupport: motorReadings667.candidate(before,n)?.historicalSupport||0,
        chosenCovered: played?.play?.numbers.includes(n) ?? null,
        note: "HIPÓTESES ENUMERADAS NÃO SÃO ACERTOS VIRTUAIS"
      },
      controller,
      masterTarget: copy(
        oldCycle?.original?.masterTarget || played?.masterTarget || null,
      ),
      playRoute,
      postLossTarget,
      turn,
      number: n,
      source,
      trigger,
      strategy: oldCycle?.strategy || definitionBefore.id,
      motor: played?.key || "—",
      phase: phaseBefore,
      result,
      profit: profit(result),
      play: played?.play || null,
      spatialKeys: [...spatial.keys],
      motorHits,
      autoRank: played?.autoRank || null,
    });
    if(before.length>=8)validateReanalysisPolicies(before,n,turn);
    state.totalTurns = turn;
    state.history.push(n);
    state.historyTurns.push(turn);
    state.sources.push(source);
    state.trainerTurns++;
    if (before.length >= 8) {
      state.block.pending++;
      if (state.block.pending === 10) {
        if (state.block.size) {
          state.history.splice(0, 10);
          state.historyTurns.splice(0, 10);
          state.sources.splice(0, 10);
        }
        state.block.pending = 0;
        state.block.revision++;
        state.block.anchor = [...state.history];
        state.block.decisionTurn = turn;
        state.block.data = null;
        blockRuntimeKey = null;
        blockRuntimeData = null;
        variantForecastCache.clear();
        pruneRolling();
      }
    }

    // O descarte continua em dez; a previsão seguinte nunca usa o bloco anterior.
    state.block.data = null;
    blockRuntimeKey = null;
    blockRuntimeData = null;
    variantForecastCache.clear();
    state.block.best = rankBestVariation();
    return state.ledger.at(-1);
  }

  
function importFingerprint(value){
 const text=JSON.stringify(value);let hash=2166136261;
 for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619)>>>0;
 return hash.toString(16).padStart(8,'0').toUpperCase();
}
function describeImport(numbers,opts){
 const config={};
 for(const key of ['structuralMemoryEnabled','strategy','postLossEnabled','postThreeEnabled','rank','manual','adaptive',
 'created','activeCreated','g1','g1Trainer','galeSkip','secondHouse'])config[key]=copy(opts[key]);
 return {version:VERSION,count:numbers.length,oldest:numbers[0],newest:numbers.at(-1),
 historyId:importFingerprint(numbers),settingsId:importFingerprint(config),config};
}

function importNumbersCore(numbers, opts, manualLog = []) {
    state = { ...fresh(), ...opts, manualLog: copy(manualLog) };
    clearSpatialCaches();
    const clean = cleanNumbers(numbers).slice(-70);
state.importAudit=describeImport(clean,opts);
    // A importação cresce até o tamanho escolhido; não descarta seu próprio histórico.
    state.block.size = 0;
    state.importTrainingActive=true;
    try{for (const n of clean) spin(n, "HISTÓRICO");}
    finally{state.importTrainingActive=false;}
    state.block = {
      size: clean.length,
      pending: 0,
      revision: state.block.revision + 1,
      anchor: [...state.history],
      decisionTurn: state.totalTurns,
      data: null,
      best: null,
    };
    clearSpatialCaches();
    prepareBlock();
  }

  function chosenVariation(owner) {
    const value = state.variantSelections[owner];
    if (value === -3) {
      const ranked = variationPerformance(owner);
      return ranked.some((r) => r.total) ? ranked[2].variation : 0;
    }
    return Number.isInteger(value) && value >= 0 && value <= 8 ? value : 1;
  }

  function motorForDefinition(def, cs, previous) {
    if (!def) return null;
    if (def.type === "VARIANT")
      return copy(
        currentBlock()?.variants.find((f) => f.bankId === def.id)?.choice ||
          null,
      );
    if (def.type === "NUMBER") return bestNumberCombination(state.history);
    return chooseMotor(def, cs, previous);
  }

  function variationPerformance(owner){
    return Array.from({length:8},(_,index)=>{
      const variation=index+1,stats=masterCandidateStats(variantBookId(owner,variation));
      return {...stats,variation,hits:stats.direct,rate:stats.total?stats.direct/stats.total:0};
    }).sort((a,b)=>Number(b.total>0)-Number(a.total>0)||b.score-a.score||a.lossStreak-b.lossStreak||a.variation-b.variation)
      .map((row,index)=>({...row,position:index+1}));
  }


  function timelineDefinitions() {
    return [
      { id: "MASTER", name: "TREINADOR GLOBAL MASTER" },
      { id: "TRAINER", name: "TREINADOR GLOBAL • ESTRATÉGIA" },
      { id: "POSTLOSS", name: "PÓS-LOSS" },
      ...VARIANT_OWNERS.flatMap((o) => [
        {
          id: o.id === "NUMBER" ? "NUMBER" : "ORIGINAL:" + o.id,
          name: o.name + " • BASE",
        },
        { id: o.id + "@THIRD", name: o.name + " • 3º AUTOMÁTICO" },
        ...Array.from({ length: 8 }, (_, i) => ({
          id: variantBookId(o.id, i + 1),
          name: o.name + " • V" + (i + 1),
        })),
      ]),
      ...definitions()
        .filter((d) => d.type !== "ORIGINAL")
        .map((d) => ({ id: d.id, name: d.name })),
    ];
  }

  function updateVariantButtons() {
    const original = state.cycle?.original;
    const owner = original?.owner || activeVariationOwner();
    const variation = original?.variation ?? chosenVariation(owner);
    for (const b of document.querySelectorAll("[data-variant-owner]")) {
      b.classList.toggle(
        "active",
        b.dataset.variantOwner === owner &&
          Number(b.dataset.variant) === variation,
      );
    }
  }

  function timelineSamples(id) {
    const cutoff = state.historyTurns[0] || 1;
    return (state.strategyTimeline[id] || []).filter((r) => r.turn >= cutoff);
  }

  function snapshotTimelineForecasts(block) {
    if (!block) return [];
    const forecasts = [];
    const append = (id, motor) => {
      if (validPlay(motor?.play))
        forecasts.push({
          id,
          motor: copy(motor),
          defenseStrategy:
            motor.postLossTarget?.defenseStrategy ||
            motor.thirdTarget?.id ||
            id,
        });
    };
    for (const def of definitions())
      append(
        def.id,
        chooseMotor(def, block.global, state.virtual[def.id]?.previous),
      );
    append("NUMBER", bestNumberCombination(state.history));
    for (const f of block.variants) append(f.bankId, f.choice);
    const trainer =
      trainerRanking().find((d) => d.id === state.trainerChoice) ||
      trainerRanking()[0];
    append("TRAINER", independentGlobalMotor(block));
    for (const owner of VARIANT_OWNERS)
      append(owner.id + "@THIRD", thirdVariationMotor(owner.id, block));
    append("POSTLOSS", postLossChoice(block)?.motor);
    return forecasts;
  }

  function settleTimelineForecasts(forecasts, n, turn, before) {
    const cutoff = state.historyTurns[0] || 1;
    const all = new Map(forecasts.map((f) => [f.id, f]));
    for (const id of Object.keys(state.timelineCycles))
      if (!all.has(id)) all.set(id, { id });
    for (const f of all.values()) {
      if (f.id === "MASTER") continue;
      const rows =
        state.strategyTimeline[f.id] || (state.strategyTimeline[f.id] = []);
      let cycle = state.timelineCycles[f.id];
      if (!cycle) {
        if (!validPlay(f.motor?.play)) continue;
        if (f.id === "TRAINER") state.globalStrategyPrevious = f.motor.key;
        cycle = {
          entry: copy(f.motor),
          defenseStrategy: f.defenseStrategy || f.id,
          config: {
            g1: state.g1,
            g1Trainer: state.g1Trainer,
            galeSkip: state.galeSkip,
            secondHouse: state.secondHouse,
          },
          phase: state.secondHouse ? "SECOND_SKIP" : "ENTRY",
          initialSkip: !!state.secondHouse,
        };
        state.timelineCycles[f.id] = cycle;
      }
      if (cycle.phase === "SECOND_SKIP") {
        if (cycle.initialSkip) cycle.initialSkip = false;
        else cycle.phase = "ENTRY";
        continue;
      }
      if (cycle.phase === "GALE_SKIP") {
        cycle.phase = "GALE";
        continue;
      }
      if (cycle.phase === "GALE") {
        const row = rows.find((r) => r.turn === cycle.turn);
        if (row) {
          row.result = cycle.defense.play.numbers.includes(n)
            ? "GREEN G1"
            : "LOSS";
          row.closed = true;
          row.closedTurn = turn;
        }
        delete state.timelineCycles[f.id];
      } else if (cycle.entry.play.numbers.includes(n)) {
        rows.push({ turn, result: "GREEN", closed: true, closedTurn: turn });
        delete state.timelineCycles[f.id];
      } else {
        rows.push({ turn, result: "GREEN G1", closed: false });
        cycle.turn = turn;
        const h = [...before, n].slice(-70),
          config = cycle.config;
        const decision = config.g1Trainer
          ? chooseG1(cycle.entry, n, h, cycle.defenseStrategy || f.id)
          : {
              motor: config.g1 ? fineG1(cycle.entry, n, h) : copy(cycle.entry),
            };
        cycle.defense = copy(decision?.motor || cycle.entry);
        cycle.phase = config.galeSkip ? "GALE_SKIP" : "GALE";
      }
      state.strategyTimeline[f.id] = rows
        .filter((r) => r.turn >= cutoff)
        .slice(-79);
    }
  }
  /* O terceiro é uma posição acompanhada dentro do proprietário, não uma V fixa. */
  function thirdVariationMotor(owner, block = currentBlock()) {
    const ranked = variationPerformance(owner);
    if (!ranked.some((r) => r.total)) return null;
    const variation = ranked[2].variation;
    const forecast = block?.variants.find(
      (f) => f.owner === owner && f.variation === variation,
    );
    return forecast
      ? {
          ...copy(forecast.choice),
          thirdTarget: { owner, variation, id: forecast.bankId },
        }
      : null;
  }

  function timelineMotor(id, block = currentBlock()) {
    if (!block) return null;
    if (id.endsWith("@THIRD"))
      return thirdVariationMotor(id.slice(0, -6), block);
    if (id === "MASTER") return masterSelection(block)?.motor || null;
    if (id === "TRAINER") return independentGlobalMotor(block);
    if (id === "NUMBER") return bestNumberCombination(state.history);
    const variant = block.variants.find((f) => f.bankId === id);
    if (variant) return copy(variant.choice);
    const definition = definitions().find((d) => d.id === id);
    return definition
      ? chooseMotor(definition, block.global, state.virtual[id]?.previous)
      : null;
  }

  /* Só ciclos encerrados antes da decisão entram na comparação.
   O próximo ciclo depois de cada LOSS fornece uma observação pós-loss. */
  function postLossStats(id) {
    const rows = timelineSamples(id)
      .filter((r) => r.closed && r.closedTurn <= state.totalTurns)
      .sort((a, b) => a.turn - b.turn);
    const following = [];
    for (let i = 1; i < rows.length; i++)
      if (
        rows[i - 1].result === "LOSS" &&
        rows[i].turn > rows[i - 1].closedTurn
      ) {
        following.push(rows[i]);
      }
    const recoveries = following.filter((r) => r.result !== "LOSS").length;
    const repeatLoss = following.length - recoveries;
    const direct = following.filter((r) => r.result === "GREEN").length;
    const recent = following.slice(-5),
      recentHits = recent.filter((r) => r.result !== "LOSS").length;
    const base = 28 / 37;
    const recovery = (recoveries + 4 * base) / (following.length + 4);
    const short = (recentHits + 3 * base) / (recent.length + 3);
    const first = (direct + 3 * base) / (following.length + 3);
    let streak = 0;
    for (let i = rows.length - 1; i >= 0 && rows[i].result === "LOSS"; i--)
      streak++;
    return {
      samples: following.length,
      recoveries,
      repeatLoss,
      direct,
      streak,
      score:
        recovery * 0.55 +
        short * 0.3 +
        first * 0.15 -
        (0.25 * repeatLoss) / (following.length + 4) -
        0.025 * Math.max(0, streak - 1),
      last: rows.at(-1) || null,
    };
  }

  function postLossRanking(block = currentBlock()) {
    if (!block) return [];
    return definitions()
      .filter((d) => d.type === "ADAPTIVE")
      .map((def) => {
        const stats = postLossStats(def.id);
        const justLost =
          stats.last?.result === "LOSS" &&
          stats.last.closedTurn === state.totalTurns;
        const eligible = justLost; // Sem mínimo de ciclos ou validação para entrar.
        return { ...def, ...stats, justLost, eligible };
      })
      .filter((r) => r.justLost)
      .sort(
        (a, b) =>
          Number(b.eligible) - Number(a.eligible) ||
          b.score - a.score ||
          b.samples - a.samples ||
          a.id.localeCompare(b.id),
      );
  }

  function postLossChoice(block = currentBlock()) {
    for (const candidate of postLossRanking(block)) {
      if (!candidate.eligible) continue;
      const motor = timelineMotor(candidate.id, block);
      if (validPlay(motor?.play))
        return {
          ...candidate,
          motor: {
            ...copy(motor),
            postLossTarget: {
              id: candidate.id,
              name: candidate.name,
              lossTurn: candidate.last.closedTurn,
              samples: candidate.samples,
              recoveries: candidate.recoveries,
              repeatLoss: candidate.repeatLoss,
              score: candidate.score,
              defenseStrategy: motor.thirdTarget?.id || candidate.id,
            },
          },
        };
    }
    return null;
  }

  function trainerBaseDefinition() {
    return (
      trainerRanking().find((d) => d.id === state.trainerChoice) ||
      trainerRanking()[0] ||
      definitions()[0]
    );
  }

  function baseActiveDefinition() {
    const owner = activeVariationOwner(),
      defs = definitions();
    if (state.strategy === "POSTLOSS")
      return {
        id: "POSTLOSS",
        name: "PÓS-LOSS • AGUARDANDO LOSS DAS ADAPTATIVAS",
        type: "POSTLOSS",
      };
    if (owner && !state.manual) {
      const variation = chosenVariation(owner),
        name = VARIANT_OWNERS.find((o) => o.id === owner).name;
      if (variation === 0)
        return owner === "NUMBER"
          ? { id: "NUMBER", name, type: "NUMBER" }
          : { ...defs.find((d) => d.id === "ORIGINAL:" + owner), name };
      return {
        id: variantBookId(owner, variation),
        name:
          name +
          (state.variantSelections[owner] === -3 ? " • 3º AUTOMÁTICO" : "") +
          " • V" +
          variation,
        type: "VARIANT",
        owner,
        variation,
      };
    }
    if (state.strategy === "MASTER") {
      const chosen = masterSelection();
      return chosen
        ? {
            id: chosen.motor.masterTarget.defenseStrategy,
            name: "MASTER • " + chosen.name,
            type: "MASTER",
          }
        : {
            id: "MASTER",
            name: "MASTER • AGUARDANDO HISTÓRICO",
            type: "MASTER",
          };
    }
    if (state.strategy === "TRAINER")
      return {
        id: "TRAINER",
        name: "TREINADOR GLOBAL • " + trainerBaseDefinition().name,
        type: "GLOBAL_STRATEGY",
      };
    if (state.strategy === "AUTO")
      return defs.find((d) => d.id === "RANK:" + state.rank) || defs[0];
    if (state.strategy === "ADAPTIVE")
      return defs.find((d) => d.id === "ADAPTIVE:" + state.adaptive) || defs[0];
    if (state.strategy === "CREATED")
      return defs.find((d) => d.id === state.activeCreated) || defs[0];
    return defs[0];
  }

  function resultGroups(rows) {
    return {
      normal: rows.filter((r) => r.playRoute === "NORMAL"),
      postLoss: rows.filter((r) => r.playRoute === "POSTLOSS"),
      postThree: rows.filter((r) => r.playRoute === "POST3LOSS"),
      combined: rows,
      legacy: rows.filter(
        (r) => !["NORMAL", "POSTLOSS", "POST3LOSS"].includes(r.playRoute),
      ),
    };
  }

  function masterRestRemaining() {
    return Math.max(
      0,
      (Number(state.masterResumeTurn) || 0) - (state.totalTurns + 1),
    );
  }
  /* Cada lado mantém seu próprio ranking, avaliações e memória de decisões.
     Revisões usam somente jogadas registradas ANTES dos resultados. */
  function bestMasterVariation(owner, block=currentBlock()) {
    if(!block)return null;
    for(const position of variationPerformance(owner)){
      const forecast=block.variants.find(f=>f.owner===owner&&f.variation===position.variation);
      if(validPlay(forecast?.choice?.play))return {id:forecast.bankId,
        name:(VARIANT_OWNERS.find(o=>o.id===owner)?.name||owner)+' • V'+position.variation,
        owner,variation:position.variation,performancePosition:position.position,
        performanceScore:position.score};
    }
    return null;
  }

  function masterCandidateMotor(definition,block=currentBlock()){
    const id=definition.resolvedId||definition.id;
    return timelineMotor(id,block);
  }

  /* Reanálise supervisionada da importação. Hipóteses são definidas pelo
     prefixo; o resultado conhecido apenas avalia as tentativas depois.
     O ajuste retrospectivo nunca conta como validação prospectiva. */
  const REANALYSIS_COMPONENTS = ['triangle','chain','pole','arc','route','recent'];
  const REANALYSIS_LEVELS = [.35,.55,.75,.90];
  function reanalysisWeights(prefix, group, level) {
    const h=prefix.slice(-70), reading=spatialRead(h);
    const recent=Array(37).fill(.1);
    for(let age=0;age<h.length;age++){
      const mass=Math.exp(-age/12);
      for(let j=0;j<37;j++)recent[j]+=mass*Math.exp(-distance(W[j],h[h.length-1-age])/2);
    }
    const components=[...reading.components,normalizeSpace(recent)];
    const selected=components[group], strength=REANALYSIS_LEVELS[level];
    const reference=normalizeSpace(reading.weights);
    return normalizeSpace(reference.map((v,j)=>Math.max(.001,v*(1-strength)+selected[j]*strength)));
  }
  function reanalysisKey(group,level){return 'REVIEW:'+group+':'+level;}
  function validateReanalysisPolicies(prefix,number,turn){
    for(const policy of state.reanalysisPolicies){
      if(policy.createdTurn>=turn)continue;
      const play=geometry(reanalysisWeights(prefix,policy.group,policy.level));
      if(!validPlay(play))continue;
      const hit=play.numbers.includes(number);
      policy.evaluations++;
      if(hit)policy.hits++;
      policy.lastEvaluation={beforeTurn:turn-1,turn,number,hit};
    }
  }
  function applyReanalysisMemory(weights,h){
    if(!state.reanalysisPolicies?.length)return weights;
    const base=28/37, mean=avg(weights)||1;
    for(const policy of state.reanalysisPolicies){
      // Só resultados POSTERIORES à descoberta autorizam influência.
      if(policy.evaluations<4)continue;
      const estimate=(policy.hits+base*8)/(policy.evaluations+8);
      const strength=Math.min(.12,Math.max(0,estimate-base)*policy.evaluations/(policy.evaluations+8));
      if(!strength)continue;
      const proposal=reanalysisWeights(h,policy.group,policy.level);
      for(let j=0;j<37;j++)weights[j]=Math.max(.001,weights[j]+mean*strength*(proposal[j]-1));
    }
    return weights;
  }
  function reviseImportedMasterLoss(review,turn){
    if(!review.imported || review.actualResult!=='LOSS')return null;
    const results=review.observations||[];
    const entryIndex=results.findIndex(row=>row.phase==='ENTRY');
    if(entryIndex<0)return null;
    const entryOutcome=results[entryIndex];
    const prefix=results[entryIndex].prefix;
    const attempts=[];let solution=null;
    // 6 leituras x 4 intensidades. Sem deslocamento escolhido pelo resultado,
    // sem adicionar o número revelado aos pesos ou como número obrigatório.
    for(let level=0;level<4&&!solution;level++){
      for(let group=0;group<6&&!solution;group++){
        const weights=reanalysisWeights(prefix,group,level);
        const play=geometry(weights);
        if(!validPlay(play))continue;
        let simulated=play.numbers.includes(entryOutcome.number)?'GREEN':null;
        let defense=null;
        if(!simulated){
          const gale=results.slice(entryIndex+1).find(row=>row.phase==='GALE');
          if(gale){
            const failureHistory=[...prefix,entryOutcome.number].slice(-70);
            const original={key:reanalysisKey(group,level),play};
            // Reconstrói a defesa somente com informação até a falha da entrada.
            const savedRows=state.g1Rows;
            state.g1Rows=savedRows.filter(row=>row.turn<entryOutcome.turn);
            try{
              const config=review.config;
              const decision=config.g1Trainer?chooseG1(original,entryOutcome.number,failureHistory,'MASTER')
                :{motor:config.g1?fineG1(original,entryOutcome.number,failureHistory):original};
              defense=decision?.motor?.play||play;
              simulated=defense.numbers.includes(gale.number)?'GREEN G1':'LOSS';
            }finally{state.g1Rows=savedRows;}
          }else simulated='LOSS';
        }
        const attempt={id:reanalysisKey(group,level),component:REANALYSIS_COMPONENTS[group],
          group,level,strength:REANALYSIS_LEVELS[level],result:simulated,
          entryShape:signaturePlay(play),defenseShape:defense?signaturePlay(defense):null};
        attempts.push(attempt);
        if(simulated!=='LOSS')solution=attempt;
      }
    }
    const record={id:'REANALYSIS@'+review.turn,turn:review.turn,closedTurn:turn,
      beforeTurn:review.beforeTurn,originalResult:'LOSS',selectedId:review.selectedId,
      prefix:[...prefix],observedAfter:results.map(row=>({turn:row.turn,number:row.number,phase:row.phase})),
      status:solution?'REVISED':'UNSOLVED',result:solution?.result||'LOSS',attempts,
      solution:solution?{...solution}:null,retrospective:true,validated:false,
      meaning:'TREINAMENTO REVISADO DEPOIS DO RESULTADO; NÃO É PREVISÃO COMPROVADA'};
    state.importReanalyses.push(record);
    state.importReanalyses=state.importReanalyses.slice(-120);
    if(solution&&!state.reanalysisPolicies.some(policy=>policy.id===solution.id)){
      state.reanalysisPolicies.push({id:solution.id,group:solution.group,level:solution.level,
        createdTurn:turn,evaluations:0,hits:0,lastEvaluation:null});
    }
    return record;
  }

  function masterLessonStats(id){
    const keys=spatialRead(state.history.slice(-70)).keys;
    let support=0,reward=0,count=0,direct=0,g1=0,loss=0;
    for(const lesson of state.masterLessons){
      if(lesson.closedTurn>state.totalTurns||!Object.prototype.hasOwnProperty.call(lesson.outcomes,id))continue;
      const value=lesson.outcomes[id];
      const similarity=.25+.75*spatialMatch(lesson.spatialKeys,keys);
      const recency=Math.exp(-Math.max(0,state.totalTurns-lesson.closedTurn)/70);
      const weight=similarity*recency;
      support+=weight;reward+=weight*(value===2?1:value===1?.55:0);count++;
      if(value===2)direct++;else if(value===1)g1++;else loss++;
    }
    const prior=28/37;
    return {count,support,direct,g1,loss,score:(reward+prior*8)/(support+8)};
  }

  function prepareMasterReview(forecasts,block){
    const definitions=masterDefinitions(block);
    const alternatives=forecasts.filter(f=>f.id!=='POSTLOSS'&&validPlay(f.motor?.play)).map(f=>{
      const definition=definitions.find(d=>d.id===f.id);
      const motor=f.motor;
      return {id:f.id,entry:copy(motor),defenseStrategy:definition?.resolvedId||f.defenseStrategy||f.id,
        phase:state.secondHouse?'SECOND_SKIP':'ENTRY',initialSkip:!!state.secondHouse,result:null};
    });
    return {version:'6.6.13',turn:state.totalTurns+1,beforeTurn:state.totalTurns,
      imported:!!state.importTrainingActive,observations:[],
      prefix:[...state.history].slice(-70),spatialKeys:[...spatialRead(state.history.slice(-70)).keys],
      config:{g1:state.g1,g1Trainer:state.g1Trainer,galeSkip:state.galeSkip,secondHouse:state.secondHouse},
      forecastFingerprint:importFingerprint(alternatives.map(a=>[a.id,signaturePlay(a.entry.play)])),
      alternatives,actualResult:null,selectedId:null};
  }

  function stepMasterAlternative(alternative,review,n,turn,before){
    if(alternative.result)return;
    if(alternative.phase==='SECOND_SKIP'){
      if(alternative.initialSkip)alternative.initialSkip=false;
      else alternative.phase='ENTRY';
      return;
    }
    if(alternative.phase==='GALE_SKIP'){alternative.phase='GALE';return;}
    if(alternative.phase==='GALE'){
      alternative.result=alternative.defense.play.numbers.includes(n)?'GREEN G1':'LOSS';
      alternative.closedTurn=turn;return;
    }
    if(alternative.entry.play.numbers.includes(n)){
      alternative.result='GREEN';alternative.closedTurn=turn;return;
    }
    const history=[...before,n].slice(-70),config=review.config;
    const existing=state.timelineCycles[alternative.id];
    const reusable=existing?.turn===turn&&validPlay(existing.defense?.play)&&
      ['g1','g1Trainer','galeSkip','secondHouse'].every(key=>existing.config?.[key]===config[key])&&
      (existing.defenseStrategy||alternative.id)===alternative.defenseStrategy&&
      signaturePlay(existing.entry.play)===signaturePlay(alternative.entry.play);
    const decision=reusable?{motor:existing.defense}:config.g1Trainer
      ?chooseG1(alternative.entry,n,history,alternative.defenseStrategy)
      :{motor:config.g1?fineG1(alternative.entry,n,history):copy(alternative.entry)};
    alternative.defense=copy(decision?.motor||alternative.entry);
    alternative.phase=config.galeSkip?'GALE_SKIP':'GALE';
  }

  function advanceMasterReviews(draft,played,controller,oldCycle,result,n,turn,before){
    if(draft&&played){
      draft.selectedId=played.postLossTarget?.id||played.masterTarget?.id||null;
      state.masterReviews.push(draft);
    }
    const actualStart=oldCycle?.entryTurn||turn;
    for(const review of state.masterReviews){
      if(review.imported){
        const first=review.alternatives.find(a=>a.id===review.selectedId)||review.alternatives[0];
        review.observations.push({turn,number:n,prefix:[...before].slice(-70),
          phase:first?.phase==='GALE'?'GALE':['ENTRY','SECOND_ENTRY'].includes(first?.phase)?'ENTRY':first?.phase});
      }
      for(const alternative of review.alternatives)stepMasterAlternative(alternative,review,n,turn,before);
      if(controller==='MASTER'&&review.turn===actualStart&&['GREEN','GREEN G1','LOSS'].includes(result)){
        review.actualResult=result;review.actualClosedTurn=turn;
      }
    }
    const remaining=[];
    for(const review of state.masterReviews){
      if(!review.actualResult||review.alternatives.some(a=>!a.result)){remaining.push(review);continue;}
      reviseImportedMasterLoss(review,turn);
      const outcomes={};
      for(const a of review.alternatives)outcomes[a.id]=a.result==='GREEN'?2:a.result==='GREEN G1'?1:0;
      state.masterLessons.push({version:review.version,turn:review.turn,beforeTurn:review.beforeTurn,
        closedTurn:turn,actualClosedTurn:review.actualClosedTurn,actualResult:review.actualResult,
        selectedId:review.selectedId,spatialKeys:review.spatialKeys,forecastFingerprint:review.forecastFingerprint,
        outcomes,entryWinners:Object.keys(outcomes).filter(id=>outcomes[id]===2),
        defenseWinners:Object.keys(outcomes).filter(id=>outcomes[id]===1)});
    }
    state.masterReviews=remaining;
    // Memória separada da janela: o descarte de dez não apaga as lições.
    state.masterLessons=state.masterLessons.slice(-120);
  }

  function masterVariationScore(id,baseScore){
    const lesson=masterLessonStats(id),weight=.20*lesson.support/(lesson.support+8);
    return baseScore*(1-weight)+lesson.score*weight;
  }

    /* Nota comparativa, não probabilidade do próximo giro.
     GREEN=1; G1 confirmado=.45; G1 pendente=.15; LOSS final=-1.
     Últimas 5/15/30 entradas pesam 60%/25%/15%, respectivamente.
     Dentro de cada janela, resultados recentes recebem maior peso.
     Uma perda pendente nunca é contada como LOSS final. */
  function masterCandidateStats(id){
    const cache = typeof renderStatsCache === 'undefined' ? null : renderStatsCache;
    if(cache?.has(id)) return cache.get(id);
    const rows=timelineSamples(id).filter(row=>Number.isFinite(row.turn)&&row.turn<=state.totalTurns)
      .slice().sort((a,b)=>a.turn-b.turn).slice(-30);
    const closed=row=>row.closed&&Number(row.closedTurn??(row.result==='GREEN'?row.turn:Infinity))<=state.totalTurns;
    const reward=row=>row.result==='GREEN'&&closed(row)?1:closed(row)&&row.result==='GREEN G1'?.45:closed(row)&&row.result==='LOSS'?-1:.15;
    function windowScore(limit,decay){
      const sample=rows.slice(-limit);let mass=0,value=0;
      for(let index=0;index<sample.length;index++){
        const weight=Math.exp(-(sample.length-1-index)/decay);
        mass+=weight;value+=weight*reward(sample[index]);
      }
      return (value+.5*1.5)/(mass+1.5);
    }
    const finished=rows.filter(closed),recent=rows.slice(-5);
    const direct=finished.filter(row=>row.result==='GREEN').length;
    const g1=finished.filter(row=>row.result==='GREEN G1').length;
    const loss=finished.filter(row=>row.result==='LOSS').length;
    let lossStreak=0;
    for(let i=finished.length-1;i>=0&&finished[i].result==='LOSS';i--)lossStreak++;
    const baseScore=.60*windowScore(5,3)+.25*windowScore(15,10)+.15*windowScore(30,20)-.08*Math.min(3,lossStreak);
    const lesson=masterLessonStats(id);
    const feedback=.10*(lesson.score-28/37)*lesson.support/(lesson.support+8);
    const result = {total:rows.length,closedTotal:finished.length,direct,g1,loss,hits:direct+g1,
      pending:rows.length-finished.length,firstMiss:rows.length-direct,lossStreak,
      recentDirect:recent.filter(row=>closed(row)&&row.result==='GREEN').length,
      recentG1:recent.filter(row=>closed(row)&&row.result==='GREEN G1').length,
      recentLoss:recent.filter(row=>closed(row)&&row.result==='LOSS').length,
      recentPending:recent.filter(row=>!closed(row)).length,
      score:baseScore+feedback,baseScore,feedback,lesson,
      weights:{recent5:.60,recent15:.25,last30:.15},
      rewards:{GREEN:1,GREEN_G1:.45,PENDING_G1:.15,LOSS:-1}};
    cache?.set(id,result);
    return result;
  }

  function masterDefinitions(block=currentBlock()){
    // O controlador MASTER não se compara consigo mesmo. Pós-loss continua
    // como prioridade independente sobre a escolha normal, quando ativado.
    return timelineDefinitions().filter(def=>!['MASTER','POSTLOSS'].includes(def.id));
  }

  function masterRanking(block=currentBlock()){
    if(!block)return [];
    return masterDefinitions(block).map(def=>{
      const motor=timelineMotor(def.id,block);
      return {...def,...masterCandidateStats(def.id),eligible:validPlay(motor?.play)};
    }).filter(def=>def.eligible).sort((a,b)=>
      Number(b.total>0)-Number(a.total>0)||b.score-a.score||
      a.lossStreak-b.lossStreak||b.recentDirect-a.recentDirect||b.closedTotal-a.closedTotal||a.id.localeCompare(b.id));
  }

  function rankBestVariation(){
    const block=currentBlock();
    if(block)return masterRanking(block)[0]||null;
    // Durante o processamento não usa uma cobertura do giro anterior.
    return null;
  }

  function displayedMasterChoice(){
    const cycle=state.cycle;
    if(cycle?.controller==='MASTER'){
      const target=cycle.original?.postLossTarget||cycle.original?.masterTarget;
      if(target)return {...target,...masterCandidateStats(target.id),committed:true};
    }
    if(state.strategy==='MASTER'&&state.phase==='ENTRY'){
      const priority=priorityRecoveryChoice(currentBlock());
      if(priority?.motor?.postLossTarget){
        const target=priority.motor.postLossTarget;
        return {...target,...masterCandidateStats(target.id),priority:true};
      }
    }
    return state.block.best;
  }


  function updateMaster(block = currentBlock()) {
    const best = masterRanking(block)[0];
    if (!best) return;
    state.block.best=copy(best);
    if (state.masterChoice !== best.id) {
      state.masterHistory.push({
        turn: state.totalTurns,
        from: state.masterChoice || "INICIAL",
        to: best.id,
        name: best.name,
        score: best.score,
        total: best.total,
      });
      state.masterHistory = state.masterHistory.slice(-70);
    }
    state.masterChoice = best.id;
  }

  function independentGlobalMotor(block = currentBlock()) {
    const definition = trainerBaseDefinition();
    const motor = block
      ? motorForDefinition(
          definition,
          block.global,
          state.globalStrategyPrevious,
        )
      : null;
    return validPlay(motor?.play)
      ? {
          ...copy(motor),
          globalStrategyTarget: { id: definition.id, name: definition.name },
        }
      : null;
  }

  function masterSelection(block = currentBlock()) {
    if (!block) return null;
    const definition = masterRanking(block)[0];
    if (!definition) return null;
    const motor = masterCandidateMotor(definition, block);
    return validPlay(motor?.play)
      ? {
          ...definition,
          motor: {
            ...copy(motor),
            masterTarget: {
              id: definition.id,
              name: definition.name,
              defenseStrategy: definition.resolvedId||motor.thirdTarget?.id||definition.id,
              owner:definition.owner||motor.owner||null,variation:definition.variation||motor.variation||null,
              performancePosition:definition.performancePosition||null,
            },
          },
        }
      : null;
  }

  function recordMasterCycle(controller, oldCycle, played, result, turn) {
    if (controller !== "MASTER") return;
    if (!["GREEN", "GALE", "GREEN G1", "LOSS"].includes(result)) return;
    const rows =
      state.strategyTimeline.MASTER || (state.strategyTimeline.MASTER = []);
    const start = oldCycle?.entryTurn || turn;
    let row = rows.find((r) => r.turn === start);
    const target =
      oldCycle?.original?.postLossTarget ||
      oldCycle?.original?.masterTarget ||
      played?.postLossTarget ||
      played?.masterTarget;
    if (!row) {
      row = {
        turn: start,
        result: "GREEN G1",
        closed: false,
        targetId: target?.id || null,
        targetName: target?.name || null,
      };
      rows.push(row);
    }
    row.result = result === "GALE" ? "GREEN G1" : result;
    row.closed = result !== "GALE";
    if (row.closed) {
      row.closedTurn = turn;
      state.masterResumeTurn = turn + 3;
    }
    const cutoff = state.historyTurns[0] || 1;
    state.strategyTimeline.MASTER = rows
      .filter((r) => r.turn >= cutoff)
      .slice(-79);
  }

  /* Caches dependentes do estado são renovados; análises puras por histórico
   exato continuam disponíveis para reutilização, sem alterar os cálculos. */
  function clearRuntimeCaches() {
    motorDiversityCache.clear();
    variantForecastCache.clear();
    blockRuntimeKey = null;
    blockRuntimeData = null;
  }

  /* Checkpoints completos. LZW síncrono reduz o espaço ocupado sem cortar histórico,
   treinamento, ciclos ou desfazer. A fila possui seu próprio diário causal. */
  function packSession(text) {
    const bytes = unescape(encodeURIComponent(text)),
      dictionary = new Map();
    let next = 257,
      phrase = "",
      chunk = "",
      chunks = [];
    const emit = (code) => {
      chunk += String.fromCharCode(code);
      if (chunk.length >= 8192) {
        chunks.push(chunk);
        chunk = "";
      }
    };
    for (let i = 0; i < bytes.length; i++) {
      const char = bytes[i],
        joined = phrase + char;
      if (!phrase || dictionary.has(joined)) {
        phrase = joined;
        continue;
      }
      emit(phrase.length === 1 ? phrase.charCodeAt(0) : dictionary.get(phrase));
      if (next < 65535) dictionary.set(joined, next++);
      else {
        emit(256);
        dictionary.clear();
        next = 257;
      }
      phrase = char;
    }
    if (phrase)
      emit(phrase.length === 1 ? phrase.charCodeAt(0) : dictionary.get(phrase));
    chunks.push(chunk);
    return "BETA_LZW1:" + chunks.join("");
  }
  function unpackSession(text) {
    if (!text.startsWith("BETA_LZW1:")) return text;
    const dictionary = [],
      parts = [];
    let next = 257,
      previous = "";
    for (let i = 10; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code === 256) {
        dictionary.length = 0;
        next = 257;
        previous = "";
        continue;
      }
      const value =
        code < 256
          ? String.fromCharCode(code)
          : dictionary[code] || (code === next ? previous + previous[0] : null);
      if (value == null) throw Error("Checkpoint inválido.");
      parts.push(value);
      if (previous && next < 65535) dictionary[next++] = previous + value[0];
      previous = value;
    }
    return decodeURIComponent(escape(parts.join("")));
  }
  // Checkpoint duplo: o armazenamento da aba tem quota independente.
  // A revisão acompanha o conteúdo, inclusive ao zerar, importar ou desfazer.
  let sessionRevision = 0;
  let recoveryLocked = false;
  let sessionDatabase = null;
  function openSessionDatabase() {
    if (typeof indexedDB === 'undefined') return Promise.resolve(null);
    if (sessionDatabase) return sessionDatabase;
    sessionDatabase = new Promise(resolve => {
      try {
        const request = indexedDB.open('ANALISE_BETA_SESSOES', 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('checkpoints')) db.createObjectStore('checkpoints');
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = request.onblocked = () => resolve(null);
      } catch (error) { resolve(null); }
    });
    return sessionDatabase;
  }
  async function readDatabaseCheckpoint() {
    const db = await openSessionDatabase();
    if (!db) return null;
    return new Promise(resolve => {
      try {
        const transaction = db.transaction('checkpoints', 'readonly');
        const request = transaction.objectStore('checkpoints').get(KEY);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
        transaction.onabort = () => resolve(null);
      } catch (error) { resolve(null); }
    });
  }
  async function writeDatabaseCheckpoint(envelope, revision, turn, primary) {
    const db = await openSessionDatabase();
    if (!db) return false;
    return new Promise(resolve => {
      try {
        const transaction = db.transaction('checkpoints', 'readwrite');
        const store = transaction.objectStore('checkpoints');
        const request = store.get(KEY);
        request.onsuccess = () => {
          let oldRevision = -1;
          try { oldRevision = JSON.parse(request.result).revision; } catch (error) {}
          if (!(oldRevision > revision)) store.put(envelope, KEY);
        };
        transaction.oncomplete = () => {
          if (revision === sessionRevision && isCurrentApp()) {
            durableTurn = turn;
            if (!primary) saveError = '';
            persistPendingInputs();
            showSaveHealth();
          }
          resolve(true);
        };
        transaction.onerror = transaction.onabort = () => resolve(false);
      } catch (error) { resolve(false); }
    });
  }
  function checkpointValue(text) {
    const value = text.startsWith('BETA_LZW1:') ? null : JSON.parse(text);
    if (value && value.__betaSession === 2) {
      if (!Number.isSafeInteger(value.revision) || typeof value.packed !== 'string')
        throw Error('Envelope de sessão inválido.');
      const data = JSON.parse(unpackSession(value.packed), reviveCheckpoint);
      return { revision: value.revision, data };
    }
    return { revision: 0, data: JSON.parse(unpackSession(text), reviveCheckpoint) };
  }
  function reviveCheckpoint(k, v) {
    return v && typeof v.__betaPlay === 'string'
      ? restoreShape(v.__betaPlay, v.score) : v;
  }
  function read(key) {
    const candidates = [];
    let failed = false;
    for (const [storage, name] of [
      [() => localStorage, key],
      [() => typeof sessionStorage === 'undefined' ? null : sessionStorage, key + '_SAFE']
    ]) {
      try {
        const raw = storage()?.getItem(name);
        if (raw == null) continue;
        const decoded = checkpointValue(raw);
        if (!Array.isArray(decoded.data?.history)) throw Error('Histórico salvo inválido.');
        candidates.push(decoded);
      } catch (error) { failed = true; }
    }
    candidates.sort((a, b) => b.revision - a.revision);
    if (candidates.length) {
      sessionRevision = Math.max(sessionRevision, candidates[0].revision);
      recoveryLocked = false;
      return candidates[0].data;
    }
    if (failed && key === KEY) {
      recoveryLocked = true;
      saveError = 'A sessão não pôde ser lida. A cópia existente foi protegida; use RECUPERAR HISTÓRICO.';
    }
    return null;
  }
  function commitCheckpoint(packed, turn) {
    if (recoveryLocked) { showSaveHealth(); return false; }
    sessionRevision = Math.max(sessionRevision + 1, Date.now() * 1000);
    const envelope = JSON.stringify({ __betaSession: 2, revision: sessionRevision, packed });
    let primary = false, backup = false;
    try { localStorage.setItem(KEY, envelope); primary = true; } catch (error) {}
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(KEY + '_SAFE', envelope); backup = true;
      }
    } catch (error) {}
    writeDatabaseCheckpoint(envelope, sessionRevision, turn, primary);
    if (primary || backup) {
      durableTurn = turn;
      if (primary) pruneSavedVersions();
      saveError = primary ? '' : 'SALVO SOMENTE NA ABA: o armazenamento permanente está indisponível. Não feche esta aba.';
      showSaveHealth();
      return true;
    }
    saveError = 'NÃO FOI POSSÍVEL SALVAR. Mantenha esta aba aberta; a sessão está somente na memória.';
    showSaveHealth();
    return false;
  }
  function showSaveHealth() {
    coordinator?.storageChanged?.();
  }
  function save() {
if(!isCurrentApp() || recoveryLocked || bootLoading)return false;

    try {
      if (typeof checkpointSerial !== "undefined") checkpointSerial++;
      if (typeof checkpointEpoch !== "undefined") checkpointEpoch++;
      const raw = JSON.stringify(state, (k, v) =>
        validPlay(v) ? { __betaPlay: signaturePlay(v), score: v.score } : v,
      );
      return commitCheckpoint(packSession(raw), state.totalTurns);
    } catch (error) {
      saveError = "SALVAMENTO FALHOU: " + String(error.message || error);
      return false;
    }
  }

  /* Busca geométrica original validada: cinco blocos de cinco e um de três,
   sem reaproveitar combinações intermediárias da busca otimizada. */
  function rawGeometry(weights, mandatory = []) {
    const score = (b) => ({
        ...b,
        lowMask: Number(b.mask & 0xffffffffn) >>> 0,
        highMask: Number(b.mask >> 32n),
        value: b.numbers.reduce((s, n) => s + (weights[ix(n)] || 0), 0),
      }),
      fives = FIVE.map(score).sort((a, b) => b.value - a.value),
      threes = THREE.map(score)
        .filter((b) => mandatory.every((n) => b.numbers.includes(n)))
        .sort((a, b) => b.value - a.value);
    let best = null;
    for (const small of threes) {
      let beam = [{ blocks: [small], lowMask: small.lowMask, highMask: small.highMask, score: small.value }];
      for (let step = 0; step < 5; step++) {
        const next = [];
        for (const item of beam)
          for (const b of fives) {
            if ((item.lowMask & b.lowMask) !== 0 || (item.highMask & b.highMask) !== 0) continue;
            next.push({
              blocks: [...item.blocks, b],
              lowMask: (item.lowMask | b.lowMask) >>> 0,
              highMask: item.highMask | b.highMask,
              score: item.score + b.value,
            });
          }
        next.sort((a, b) => b.score - a.score);
        beam = [];
        const seen = new Set();
        for (const item of next) {
          const k = item.highMask + ":" + item.lowMask;
          if (seen.has(k)) continue;
          seen.add(k);
          beam.push(item);
          if (beam.length >= 6) break;
        }
        if (!beam.length) break;
      }
      for (const item of beam)
        if (item.blocks.length === 6 && (!best || item.score > best.score))
          best = item;
    }
    if (!best) return null;
    const blocks = best.blocks.map((b) => ({
        center: b.center,
        radius: b.radius,
        numbers: [...b.numbers],
      })),
      p = {
        blocks,
        numbers: blocks.flatMap((b) => b.numbers),
        score: best.score,
      };
    return validPlay(p) ? p : null;
  }

  /* Seleção parcial exata: somente os 96 melhores são ordenados e materializados.
   Mesma pontuação, mesma ordem de desempate pelo índice de origem. */
  function topPoolCandidates(scores, limit = 96) {
    const pool = diversityCandidates(),
      heap = [];
    const worse = (a, b) =>
      scores[a] < scores[b] || (scores[a] === scores[b] && a > b);
    for (let index = 0; index < scores.length; index++) {
      if (heap.length < limit) {
        heap.push(index);
        let child = heap.length - 1;
        while (child) {
          const parent = (child - 1) >> 1;
          if (!worse(heap[child], heap[parent])) break;
          [heap[child], heap[parent]] = [heap[parent], heap[child]];
          child = parent;
        }
      } else if (worse(heap[0], index)) {
        heap[0] = index;
        let parent = 0;
        while (true) {
          let child = parent * 2 + 1;
          if (child >= heap.length) break;
          if (child + 1 < heap.length && worse(heap[child + 1], heap[child]))
            child++;
          if (!worse(heap[child], heap[parent])) break;
          [heap[child], heap[parent]] = [heap[parent], heap[child]];
          parent = child;
        }
      }
    }
    return heap
      .sort((a, b) => scores[b] - scores[a] || a - b)
      .map((index) => ({
        candidate: pool[index],
        score: scores[index],
        index,
      }));
  }

  function fastIndependentMotors(proposals) {
    const pool = diversityCandidates();
    const candidates = proposals.map((m) => topPoolCandidates(m.poolScores));
    let chosen = null,
      chosenScore = -Infinity;
    for (const step of [1, 5, 7]) {
      const selected = Array(12).fill(null),
        counts = Array(37).fill(0);
      for (let k = 0; k < 12; k++) {
        const i = (k * step) % 12;
        let best = null,
          value = -Infinity;
        for (const item of candidates[i]) {
          if (selected.some((c) => c && sharedCoverage(c, item.candidate) > 24))
            continue;
          let newNumbers = 0;
          for (const n of item.candidate.play.numbers)
            if (!counts[n]) newNumbers++;
          const score = item.score + 0.08 * newNumbers;
          if (score > value) {
            value = score;
            best = item.candidate;
          }
        }
        if (!best) break;
        selected[i] = best;
        for (const n of best.play.numbers) counts[n]++;
      }
      if (selected.some((c) => !c) || counts.some((n) => !n)) continue;
      const score = selected.reduce(
        (sum, c, i) => sum + candidateFit(c, proposals[i].weights),
        0,
      );
      if (score > chosenScore) {
        chosenScore = score;
        chosen = selected;
      }
    }
    if (!chosen) {
      for (let shift = 0; shift < 37; shift++) {
        const selected = diversitySafety.map((c) =>
          diversityCandidate(rotatedDiversity(c.play, shift)),
        );
        const score = selected.reduce(
          (sum, c, i) => sum + candidateFit(c, proposals[i].weights),
          0,
        );
        if (score > chosenScore) {
          chosenScore = score;
          chosen = selected;
        }
      }
    }
    const result = proposals.map((m, i) => {
      const { weights, poolScores, ...motor } = m;
      const play = copy(chosen[i].play);
      play.score = candidateFit(chosen[i], weights);
      return { ...motor, score: play.score, play };
    });
    if (!validMotorEnsemble(result))
      throw Error("CONJUNTO INCOMPLETO: " + proposals[0].bankId);
    result.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
    result.forEach((m, i) => (m.rank = i + 1));
    return result;
  }

  function coordinateOwnerVariations(forecasts) {
    for (const owner of VARIANT_OWNERS) {
      const group = forecasts.filter((f) => f.owner === owner.id);
      if (!group.length) continue;
      const alternatives = group.map((f) => {
        if (owner.id === "CONSENSUS" || owner.id === "UNION") {
          const weights = Array(37).fill(0);
          const members =
            owner.id === "UNION" ? f.motors.slice(0, 3) : f.motors;
          for (const m of members)
            for (const n of m.play.numbers)
              weights[ix(n)] += 1 / (1 + m.rank * 0.1);
          applySpatial(weights, state.history, 0.25);
          const ranked = topPoolCandidates(
            diversityCandidates().map((candidate) =>
              candidateFit(candidate, weights),
            ),
          );
          return [
            f.choice,
            ...ranked.slice(0, 96).map((r) => ({
              key: owner.id,
              rank: 0,
              play: { ...copy(r.candidate.play), score: r.score },
              score: r.score,
              spatialKeys: [...spatialRead(state.history).keys],
            })),
          ];
        }
        let motors =
          owner.id === "FIXED" ? f.motors.slice(0, 4) : [...f.motors];
        if (owner.id === "BEST" || owner.id === "SWITCH")
          motors.sort(
            (a, b) =>
              variantMotorRate(b.key, owner.id === "BEST" ? 20 : 12) -
                variantMotorRate(a.key, owner.id === "BEST" ? 20 : 12) ||
              a.rank - b.rank,
          );
        if (owner.id === "NUMBER")
          motors.sort((a, b) => {
            const score = (m) =>
              compareNumberCombination(
                { play: m.play, covered: m.play.numbers },
                state.history.at(-1),
                state.history,
              ).score;
            return score(b) - score(a) || a.rank - b.rank;
          });
        return [f.choice, ...motors];
      });
      const prepared = alternatives.map((items) => {
        const seen = new Set();
        return items
          .filter((m) => {
            const code = coverageCode(m.play);
            if (seen.has(code)) return false;
            seen.add(code);
            return true;
          })
          .map((motor) => ({
            motor,
            candidate: diversityCandidate(motor.play),
          }));
      });
      let final = null;
      for (const order of [0, 1, 2, 3, 4, 5, 6, 7]) {
        const selected = Array(8).fill(null),
          counts = Array(37).fill(0);
        let failed = false;
        for (let k = 0; k < 8; k++) {
          const index = (k + order) % 8,
            f = group[index];
          const choices = prepared[index];
          let best = null,
            bestScore = -Infinity;
          for (let i = 0; i < choices.length; i++) {
            const { motor, candidate } = choices[i];
            if (
              selected.some(
                (m) =>
                  m &&
                  sharedCoverage(diversityCandidate(m.play), candidate) > 27,
              )
            )
              continue;
            let additional = 0;
            for (const n of motor.play.numbers) if (!counts[n]) additional++;
            const score = (i === 0 ? 0.25 : 0) + 1 / (1 + i) + additional * 2;
            if (score > bestScore) {
              best = motor;
              bestScore = score;
            }
          }
          if (!best) {
            failed = true;
            break;
          }
          selected[index] = {
            ...copy(best),
            bankId: f.bankId,
            owner: f.owner,
            variation: f.variation,
          };
          if (owner.id === "FIXED")
            selected[index].autoRank = best.autoRank || best.rank;
          if (owner.id === "NUMBER")
            Object.assign(selected[index], {
              type: "NUMBER",
              trigger: state.history.at(-1),
              sourceNumber: best.sourceNumber ?? state.history.at(-1),
              sourceTurn: best.sourceTurn ?? state.totalTurns,
            });
          for (const n of best.play.numbers) counts[n]++;
        }
        if (!failed && counts.every(Boolean)) {
          final = selected;
          break;
        }
      }
      if (!final) {
        // Reserva de conjuntos inteiros: conserva a regra da original, inclusive
        // AUTO exclusivamente 1–4, sem transformar CONSENSO em um motor isolado.
        const options = group.map((f) => {
          const weights = new Map(f._weights.map((m) => [m.key, m.weights]));
          return Array.from({ length: 37 }, (_, shift) => {
            const motors = f.motors
              .map((m, i) => {
                const play = rotatedDiversity(diversitySafety[i].play, shift);
                play.score = play.numbers.reduce(
                  (sum, n) => sum + weights.get(m.key)[ix(n)],
                  0,
                );
                return { ...m, play, score: play.score };
              })
              .sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
            motors.forEach((m, i) => (m.rank = i + 1));
            return {
              motors,
              choice: chooseVariant(
                f.owner,
                f.variation,
                motors,
                state.history,
              ),
            };
          });
        });
        for (let order = 0; order < 8 && !final; order++) {
          const selected = Array(8).fill(null),
            banks = Array(8).fill(null),
            counts = Array(37).fill(0);
          for (let k = 0; k < 8; k++) {
            const index = (k + order) % 8;
            let best = null,
              bestValue = -Infinity;
            for (const option of options[index]) {
              const candidate = diversityCandidate(option.choice.play);
              if (
                selected.some(
                  (m) =>
                    m &&
                    sharedCoverage(diversityCandidate(m.play), candidate) > 27,
                )
              )
                continue;
              const gain = option.choice.play.numbers.filter(
                (n) => !counts[n],
              ).length;
              const value = gain * 2 + option.choice.score / 100;
              if (value > bestValue) {
                best = option;
                bestValue = value;
              }
            }
            if (!best) break;
            selected[index] = best.choice;
            banks[index] = best.motors;
            for (const n of best.choice.play.numbers) counts[n]++;
          }
          if (selected.every(Boolean) && counts.every(Boolean)) {
            final = selected;
            for (let i = 0; i < 8; i++) group[i].motors = banks[i];
          }
        }
      }
      if (!final)
        throw Error(
          "NÃO FOI POSSÍVEL DIVERSIFICAR AS OITO VARIAÇÕES: " + owner.id,
        );
      for (let i = 0; i < 8; i++) group[i].choice = final[i];
    }
  }

  const coverageCandidateMemo = new WeakMap();
  function diversityCandidate(play) {
    if (coverageCandidateMemo.has(play)) return coverageCandidateMemo.get(play);
    const covered = new Set(play.numbers);
    let low = 0,
      high = 0;
    for (let n = 0; n < 37; n++)
      if (!covered.has(n)) {
        if (n < 32) low |= 1 << n;
        else high |= 1 << (n - 32);
      }
    const candidate = { play, low, high, code: coverageCode(play) };
    coverageCandidateMemo.set(play, candidate);
    return candidate;
  }

  function allVariantForecasts(h, onlyOwner = null) {
    if (h.length < 8) return [];
    const key =
      h.join(",") +
      "|" +
      state.totalTurns +
      (onlyOwner ? "|OWNER:" + onlyOwner : "");
    if (variantForecastCache.has(key)) return variantForecastCache.get(key);
    const spatial = spatialRead(h),
      baseWeights = new Map(),
      shared = { base: new Map(), additive: new Map() };
    for (const family of FAMILIES)
      for (const radius of RADII) {
        const base = weightsFor(h, family, radius),
          key = family + "_" + radius;
        baseWeights.set(key, base);
        const normalized = normalizeSpace(base);
        shared.base.set(
          key,
          diversityCandidates().map((c) => candidateFit(c, normalized)),
        );
      }
    const forecasts = [];
    for (const owner of VARIANT_OWNERS.filter(
      (o) =>
        !onlyOwner ||
        (Array.isArray(onlyOwner)
          ? onlyOwner.includes(o.id)
          : o.id === onlyOwner),
    ))
      for (let variation = 1; variation <= 8; variation++) {
        const bankId = variantBookId(owner.id, variation),
          proposals = [];
        for (const family of FAMILIES)
          for (const radius of RADII) {
            const analysis = variantAnalyticalWeights(
              h,
              family,
              radius,
              owner.id,
              variation,
              baseWeights.get(family + "_" + radius),
              spatial,
              shared,
            );
            proposals.push({
              key: bankId + "::" + family + "_" + radius,
              bankId,
              owner: owner.id,
              variation,
              family,
              radius,
              weights: analysis.weights,
              poolScores: analysis.poolScores,
              spatialKeys: [...spatial.keys],
              componentShares: [...spatial.adaptive.shares],
              adaptiveSamples: spatial.adaptive.samples,
              spatialVersion: VERSION,
          readingVersion:"6.6.13",readingCandidates:37,
            });
          }
        const cs = fastIndependentMotors(proposals);
        forecasts.push({
          bankId,
          owner: owner.id,
          name: owner.name,
          variation,
          motors: cs,
          _weights: proposals,
          choice: chooseVariant(owner.id, variation, cs, h),
        });
      }
    coordinateOwnerVariations(forecasts);
    for (const f of forecasts) delete f._weights;
    variantForecastCache.set(key, forecasts);
    if (variantForecastCache.size > 4)
      variantForecastCache.delete(variantForecastCache.keys().next().value);
    return forecasts;
  }


  async function prepareBlockParallel() {
    // Um único calculador por leitura; todos os 65 bancos continuam ativos.
    // prepareBlock conserva a mesma busca, pesos, ordenação e regras.
    return prepareBlock();
  }


  /* Os contadores de sequência não são apagados pelo descarte da janela. */
  function updateStrategyStreaks(turn = state.totalTurns) {
    for (const [id, rows] of Object.entries(state.strategyTimeline)) {
      const closed = rows
        .filter((r) => r.closed && r.closedTurn <= turn)
        .sort((a, b) => a.closedTurn - b.closedTurn);
      let counter = state.strategyStreaks[id];
      if (!counter) {
        let loss = 0;
        for (
          let i = closed.length - 1;
          i >= 0 && closed[i].result === "LOSS";
          i--
        )
          loss++;
        const last = closed.at(-1);
        if (last)
          state.strategyStreaks[id] = {
            loss,
            closedTurn: last.closedTurn,
            result: last.result,
          };
        continue;
      }
      for (const row of closed)
        if (row.closedTurn > counter.closedTurn) {
          counter = {
            loss: row.result === "LOSS" ? counter.loss + 1 : 0,
            closedTurn: row.closedTurn,
            result: row.result,
          };
        }
      state.strategyStreaks[id] = counter;
    }
  }
  function postThreeChoice(block = currentBlock()) {
    if (!block) return null;
    const candidates = timelineDefinitions()
      .filter((d) => !["POSTLOSS", "POST3LOSS"].includes(d.id))
      .map((def) => {
        const stats = postLossStats(def.id),
          counter = state.strategyStreaks[def.id];
        const streak = counter?.loss ?? stats.streak,
          lossTurn = counter?.closedTurn ?? stats.last?.closedTurn;
        return { ...def, ...stats, streak, lossTurn };
      })
      .filter(
        (candidate) =>
          candidate.streak >= 3 &&
          candidate.lossTurn > (state.postThreeUsed[candidate.id] || 0),
      )
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.samples - a.samples ||
          b.lossTurn - a.lossTurn ||
          a.id.localeCompare(b.id),
      );
    for (const candidate of candidates) {
      const motor = timelineMotor(candidate.id, block);
      if (!validPlay(motor?.play)) continue;
      return {
        ...candidate,
        motor: {
          ...copy(motor),
          postLossTarget: {
            kind: "POST3",
            id: candidate.id,
            name: candidate.name,
            lossTurn: candidate.lossTurn,
            streak: candidate.streak,
            samples: candidate.samples,
            recoveries: candidate.recoveries,
            repeatLoss: candidate.repeatLoss,
            score: candidate.score,
            defenseStrategy:
              motor.thirdTarget?.id ||
              motor.globalStrategyTarget?.id ||
              motor.masterTarget?.defenseStrategy ||
              candidate.id,
          },
        },
      };
    }
    return null;
  }
  function priorityRecoveryChoice(block = currentBlock()) {
    if (state.postThreeEnabled) {
      const choice = postThreeChoice(block);
      if (choice) return choice;
    }
    return state.postLossEnabled || state.strategy === "POSTLOSS"
      ? postLossChoice(block)
      : null;
  }

  /* Só remove cópias de versões anteriores depois de gravar a sessão completa
   na chave atual; a sessão em uso e seus registros permanecem intactos. */
  function pruneSavedVersions() {
    if (!localStorage.getItem(KEY)) return;
    for (const oldKey of OLD_KEYS) {
      try {
        localStorage.removeItem?.(oldKey);
        localStorage.removeItem?.(oldKey + "_QUEUE");
      } catch (error) {}
    }
  }

  let state = fresh();
  let busy = false;
  let saveError = "";

  function analysisBackground() {
    const localStorage = {
      getItem() {
        return null;
      },
      setItem() {},
    };
    /*
ANÁLISE BETA V6.6.13 — BASE V6.4.5 + VARIAÇÕES V6.4.9.

- Pós-loss atravessa a pausa MASTER; PÓS-3 LOSS independente, todas as estratégias e prioridade máxima.
- Sequências de LOSS finais sobrevivem ao descarte da janela; checkpoint sem fila ilimitada.
- Busca geométrica validada preservada; seleção parcial exata e metadados de geometria reutilizados; salvamento compactado em segundo plano.
- Número aparece imediatamente; indicação atualiza uma única vez, sem tela provisória vazia.
- Estado completo salvo após cada número, com retomada da fila ao reabrir.
- Reutilização de caches de análises puras; critérios e cálculos mantidos.
- MASTER decide entre as estratégias, incluindo o Treinador Global independente.
- Após encerrar entrada/G1, MASTER observa dois resultados completos antes do próximo sinal.
- Linha MASTER registra os ciclos executados; sem resultados fictícios durante a pausa.
- Ajuste visual: quadro expande sob a própria linha, sem rolagem programada; textos e números compactos.
- Pós-loss exclusivamente das 12 adaptativas; pode intervir sobre qualquer seleção quando ligado.
- Nome da linha do tempo abre quadro de jogo; indicação pós-loss destacada; placares separados.
- Botão 3º automático por proprietário; PÓS-LOSS automático entre perdas finais recentes.
- Pós-loss sem validação mínima: LOSS final já habilita a estratégia. Histórico apenas ordena as candidatas.
- Treinador Global e Pós-loss podem ficar ligados juntos: sem LOSS novo segue o Global; com LOSS usa o Pós-loss.
- Estratégia BASE selecionável, além de V1–V8 em cada grupo.
- Ranking das oito variações: posição, acerto direto e melhor ao lado do nome.
- Linhas por ciclo: W verde, G1 amarelo; o mesmo quadrinho vira R vermelho se perder a defesa.
- Grupos de treinadores, originais e variações recolhíveis.
- Somente Treinador Global e Treinador Global Números.
- Oito variações por original e Treinador Números.
- Cada variação conserva NORMAL, DINAMICO, RX_NORMAL e RX_DINAMICO, C4/C5/C6.
- Cada conjunto tem 12 coberturas distintas de 28 e cobre a roda inteira, 37/37.
- Janela importada de 8 a 70; entram 10 novos, saem 10 antigos.
- Análises e próxima jogada atualizadas a cada número; descarte de dez a cada dez.
- Jogada e defesa comprometidas preservadas, inclusive na virada do bloco.
- Melhor variação virtual no lugar do líquido; avaliação somente com resultados passados.
- Processamento em segundo plano quando disponível; número recebido aparece imediatamente.
- Análises de triangulação, amplitude, percurso, encadeamento, polos e arcos mantidas.

Cobertura conjunta não transforma uma jogada de 28 em cobertura individual de 37.
*/
    const VERSION = "6.6.13",
      KEY = "ANALISE_BETA_V664",
      WINDOW = 70;
    const OLD_KEYS=[];
    const W = [
      32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
      16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26, 0,
    ];

    const W_INDEX = Array(37);

    W.forEach((n, i) => {
      W_INDEX[n] = i;
    });

    const RED = new Set([
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ]);

    const REGIONS = {
      TIERS: [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33],
      ORFAOS: [17, 34, 6, 1, 20, 14, 31, 9],
      VOISINS: [22, 18, 29, 7, 25, 2, 21, 4, 19],
      ZERO: [28, 12, 35, 3, 26, 0, 32, 15],
    };

    const FAMILIES = ["NORMAL", "DINAMICO", "RX_NORMAL", "RX_DINAMICO"],
      RADII = [4, 5, 6];

    const ORIGINALS = [
      ["FIXED", "AUTO RANKING"],
      ["GEO", "MELHOR GEOMETRIA"],
      ["BEST", "MELHOR DESEMPENHO"],
      ["STABLE", "ESTABILIDADE"],
      ["SWITCH", "TROCA INTELIGENTE"],
      ["CONSENSUS", "CONSENSO"],
      ["UNION", "UNIÃO"],
    ];

    const ADAPTATIVES = Array.from({ length: 12 }, (_, i) => ({
      id: "A" + String(i + 1).padStart(2, "0"),
      name: "ADAPTATIVA " + String(i + 1).padStart(2, "0"),
      window: [10, 10, 10, 20, 20, 20, 30, 30, 20, 30, 20, 30][i],
      margin: [
        0.05, 0.1, 0.15, 0.05, 0.1, 0.15, 0.05, 0.1, 0.08, 0.12, 0.1, 0.08,
      ][i],
      maxRank: [12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 4, 8][i],
    }));

    const G1_MODES = ["CONGELADA", "AJUSTE FINO", "RECONSTRUÇÃO"],
      BEHAVIORS = ["CONTINUIDADE", "DESLOCAMENTO", "RUPTURA"];

    const $ = (id) => document.getElementById(id),
      mod = (n) => ((n % 37) + 37) % 37,
      ix = (n) => (Number.isInteger(n) && n >= 0 && n <= 36 ? W_INDEX[n] : -1),
      avg = (a) => (a.length ? a.reduce((s, n) => s + n, 0) / a.length : 0),
      clamp = (n, a, b) => Math.max(a, Math.min(b, n)),
      copy = (x) => (x == null ? x : JSON.parse(JSON.stringify(x))),
      fmt = (n) => (Number.isFinite(n) ? n.toFixed(2).replace(".", ",") : "—"),
      pct = (a, b) => (b ? fmt((100 * a) / b) + "%" : "—");

    const nearBand = (n) =>
      n === 0 ? "0" : n <= 2 ? "1-2" : n <= 4 ? "3-4" : n <= 8 ? "5-8" : "9+";

    function esc(x) {
      return String(x ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );
    }

    function cleanNumbers(a) {
      return Array.isArray(a)
        ? a.filter((n) => Number.isInteger(n) && n >= 0 && n <= 36)
        : [];
    }

    function neighbors(n, r) {
      const p = ix(n);
      return p < 0
        ? []
        : Array.from({ length: 2 * r + 1 }, (_, i) => W[mod(p + i - r)]);
    }

    function distance(a, b) {
      const x = ix(a),
        y = ix(b);
      if (x < 0 || y < 0) return 18;
      const d = Math.abs(x - y);
      return Math.min(d, 37 - d);
    }

    function direction(a, b) {
      const x = ix(a),
        y = ix(b);
      if (x < 0 || y < 0) return 0;
      const f = mod(y - x),
        r = mod(x - y);
      return f <= r ? f : -r;
    }

    function region(n) {
      return Object.keys(REGIONS).find((k) => REGIONS[k].includes(n)) || "ZERO";
    }

    const MIRROR = new Set();

    for (const n of [11, 12, 13, 21, 22, 23, 31, 32, 33])
      for (const x of neighbors(n, 1)) MIRROR.add(x);

    function mirror(n) {
      return MIRROR.has(n) ? "ESPELHO" : "ANTIESPELHO";
    }

    function signaturePlay(play) {
      return play.blocks
        .map((b) => b.radius + ":" + b.center)
        .sort()
        .join("|");
    }

    function validPlay(p) {
      return (
        !!p &&
        typeof p === "object" &&
        Array.isArray(p.numbers) &&
        p.numbers.length === 28 &&
        p.numbers.every((n) => Number.isInteger(n) && n >= 0 && n <= 36) &&
        new Set(p.numbers).size === 28 &&
        Array.isArray(p.blocks) &&
        p.blocks.length === 6 &&
        p.blocks.filter((b) => b.radius === 2).length === 5 &&
        p.blocks.filter((b) => b.radius === 1).length === 1 &&
        p.blocks.every(
          (b) =>
            Number.isInteger(b.center) &&
            ix(b.center) >= 0 &&
            Array.isArray(b.numbers) &&
            b.numbers.join(",") === neighbors(b.center, b.radius).join(","),
        ) &&
        p.blocks.flatMap((b) => b.numbers).every((n) => p.numbers.includes(n))
      );
    }

    function restoreShape(shape, score) {
      const blocks = shape.split("|").map((part) => {
        const [radius, center] = part.split(":").map(Number);
        return { center, radius, numbers: neighbors(center, radius) };
      });
      const play = { blocks, numbers: blocks.flatMap((b) => b.numbers), score };
      if (!validPlay(play)) throw Error("GEOMETRIA SALVA INVÁLIDA.");
      return play;
    }

    function cycleIsFree() {
      return state.phase === "ENTRY" && state.cycle === null;
    }

    const FIVE = W.map((n) => ({
        center: n,
        radius: 2,
        numbers: neighbors(n, 2),
      })),
      THREE = W.map((n) => ({
        center: n,
        radius: 1,
        numbers: neighbors(n, 1),
      }));

    for (const b of [...FIVE, ...THREE])
      b.mask = b.numbers.reduce((s, n) => s | (1n << BigInt(ix(n))), 0n);

    function missing(play) {
      return validPlay(play)
        ? W.filter((n) => !play.numbers.includes(n))
        : [...W];
    }

    function hopTrend(a, b) {
      const x = Math.abs(a),
        y = Math.abs(b);
      return !x && !y
        ? "PARADO"
        : !x
          ? "SAÍDA"
          : !y
            ? "PARADA"
            : y < x
              ? "CONTRAÇÃO"
              : y > x
                ? "EXPANSÃO"
                : "MANUTENÇÃO";
    }

    function lengthBand(n) {
      return n === 0
        ? "0"
        : n <= 6
          ? "1-6"
          : n <= 18
            ? "7-18"
            : n <= 36
              ? "19-36"
              : n <= 72
                ? "37-72"
                : "73+";
    }

    function routeFeatures(numbers) {
      const steps = numbers.slice(1).map((n, i) => direction(numbers[i], n)),
        net = steps.reduce((s, n) => s + n, 0),
        length = steps.reduce((s, n) => s + Math.abs(n), 0),
        signs = new Set(steps.filter(Boolean).map(Math.sign)),
        sameDirection = signs.size === 1,
        closure = numbers.length ? distance(numbers[0], numbers.at(-1)) : 0,
        contour = sameDirection && Math.abs(net) >= 31 && closure <= 6,
        completedTurns = Math.floor(Math.abs(net) / 37),
        nearestTurns = Math.round(net / 37),
        residual = net - nearestTurns * 37,
        trends = steps.slice(1).map((n, i) => hopTrend(steps[i], n)),
        labels = [];
      if (closure === 0) labels.push("FECHAMENTO EXATO");
      else if (closure <= 2) labels.push("FECHAMENTO A 1-2 CASAS");
      else if (closure <= 6) labels.push("FECHAMENTO A 3-6 CASAS");
      if (contour) labels.push("FECHAMENTO POR CONTORNO");
      if (completedTurns) labels.push("VOLTA ACUMULADA " + completedTurns);
      if (trends.length) labels.push(trends.at(-1));
      return {
        numbers: [...numbers],
        steps,
        net,
        length,
        sameDirection,
        closure,
        contour,
        completedTurns,
        nearestTurns,
        residual,
        trends,
        amplitude: Math.max(0, ...steps.map(Math.abs)),
        efficiency: length ? Math.abs(net) / length : 0,
        labels,
      };
    }

    function normalizeSpace(w) {
      const mean = avg(w) || 1;
      return w.map((v) => v / mean);
    }

    function routeSimilarity(a, b) {
      if (a.steps.length !== b.steps.length) return 0;
      const order = avg(a.steps.map((v, i) => Math.abs(v - b.steps[i]))),
        trend = avg(a.trends.map((v, i) => (v === b.trends[i] ? 1 : 0)));
      return (
        Math.exp(
          -Math.abs(a.net - b.net) / 10 -
            Math.abs(a.closure - b.closure) / 4 -
            Math.abs(a.length - b.length) / 12 -
            order / 6,
        ) *
        (a.contour === b.contour ? 1 : 0.35) *
        (a.sameDirection === b.sameDirection ? 1 : 0.5) *
        (0.5 + 0.5 * (a.trends.length ? trend : 1))
      );
    }

    function routeRead(h) {
      const current = [];
      for (let size = 3; size <= Math.min(8, h.length); size++)
        current.push(routeFeatures(h.slice(-size)));
      const weights = Array(37).fill(1),
        matched = new Set();
      let examples = 0;
      for (const r of current) {
        const size = r.numbers.length;
        for (let end = size - 1; end < h.length - 1; end++) {
          const old = routeFeatures(h.slice(end - size + 1, end + 1)),
            similarity = routeSimilarity(old, r),
            recency = Math.exp(-(h.length - 2 - end) / 30),
            projected = W[mod(ix(h.at(-1)) + direction(h[end], h[end + 1]))];
          if (similarity > 0.35) {
            examples++;
            matched.add(end + 1);
          }
          for (let j = 0; j < 37; j++)
            weights[j] +=
              (similarity *
                recency *
                Math.exp(-distance(W[j], projected) / 2)) /
              Math.sqrt(size);
        }
      }
      const triangle = current.find((r) => r.numbers.length === 3),
        chain = current.find((r) => r.numbers.length === 4),
        key = triangle
          ? "R:C" +
            Number(triangle.contour) +
            "|F" +
            nearBand(triangle.closure) +
            "|D" +
            Math.sign(triangle.net) +
            "|V" +
            Math.min(2, chain?.completedTurns || 0) +
            "|L" +
            lengthBand(triangle.length) +
            "|H" +
            triangle.trends.join(",")
          : "R:SEM PERCURSO";
      return {
        current,
        examples,
        uniqueExamples: matched.size,
        weights: normalizeSpace(weights),
        key,
        triangle: triangle || null,
        chain: chain || null,
      };
    }

    const triangleCache = new Map();

    function pointTriangle(n) {
      const a = (2 * Math.PI * ix(n)) / 37;
      return { x: Math.sin(a), y: Math.cos(a) };
    }

    function angleTriangle(a, b, c) {
      const u = { x: a.x - b.x, y: a.y - b.y },
        v = { x: c.x - b.x, y: c.y - b.y },
        d = Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y);
      return d < 1e-12
        ? null
        : (Math.acos(clamp((u.x * v.x + u.y * v.y) / d, -1, 1)) * 180) /
            Math.PI;
    }

    function triangleFeatures(a, b, c) {
      const s1 = direction(a, b),
        s2 = direction(b, c),
        closure = distance(a, c),
        p = pointTriangle(a),
        q = pointTriangle(b),
        r = pointTriangle(c),
        area =
          Math.abs((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x)) / 2;
      let type = "MUDANÇA DE SETOR";
      if (a === b && b === c) type = "REPETIÇÃO";
      else if (a === c) type = "RETORNO EXATO";
      else if (b === c) type = "REPETIÇÃO FINAL";
      else if (!s1) type = "SAÍDA DA REPETIÇÃO";
      else if (Math.sign(s1) === Math.sign(s2)) type = "CONTINUAÇÃO";
      else if (closure < Math.abs(s1)) type = "RETORNO PARCIAL";
      else type = "INVERSÃO COM AFASTAMENTO";
      const route = routeFeatures([a, b, c]);
      return {
        a,
        b,
        c,
        s1,
        s2,
        closure,
        area,
        type,
        route,
        trend: hopTrend(s1, s2),
        ratio: Math.abs(s1) ? Math.abs(s2) / Math.abs(s1) : null,
        contour: route.contour,
        labels: [type, ...route.labels],
        chords: [
          Math.hypot(p.x - q.x, p.y - q.y),
          Math.hypot(q.x - r.x, q.y - r.y),
          Math.hypot(p.x - r.x, p.y - r.y),
        ],
        angles: [
          angleTriangle(q, p, r),
          angleTriangle(p, q, r),
          angleTriangle(p, r, q),
        ],
        degenerate: area < 1e-10,
      };
    }

    function triangleContext(h) {
      if (h.length < 3) return "SEM TRINCA";
      const f = triangleFeatures(...h.slice(-3));
      return (
        f.type +
        "|F:" +
        nearBand(f.closure) +
        "|C:" +
        Number(f.contour) +
        "|S:" +
        Math.sign(f.route.net) +
        "|H:" +
        f.trend +
        "|L:" +
        lengthBand(f.route.length)
      );
    }

/* Memória causal do quarto resultado. Geometria simulada não é observação.
   O atlas enumera formas possíveis; distribuições usam SOMENTE sucessores vistos.
   Cada canal conta uma ocorrência uma vez. Canais não somam suas amostras.
   Sem suporte e avaliação cronológica favorável, a influência é exatamente zero. */
function createTriangleMemory666(wheel){
  const N=37, index=Array(N), names=[
    'TRINCA EXATA → QUARTO', 'FORMA GIRADA', 'FORMA REFLETIDA',
    'AMPLITUDE E PROPORÇÃO', 'ENCADEAMENTO 4–8', 'FECHAMENTO E CONTORNO',
    'ARCO → PRÓXIMO RESULTADO', 'POLOS → PRÓXIMO RESULTADO'
  ];
  wheel.forEach((n,i)=>{index[n]=i;});
  const mod=n=>(n%N+N)%N;
  const jump=(a,b)=>{const d=mod(b-a);return d<=18?d:d-N;};
  const dist=(a,b)=>Math.abs(jump(a,b));
  const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
  const cache=new Map(), forecasts=new Map();
  const keep=(map,key,value)=>{map.set(key,value);if(map.size>384)map.delete(map.keys().next().value);return value;};
  const points=Array.from({length:N},(_,i)=>[Math.sin(i*2*Math.PI/N),Math.cos(i*2*Math.PI/N)]);
  const chord=(a,b)=>Math.hypot(points[a][0]-points[b][0],points[a][1]-points[b][1]);
  const angle=(a,b,c)=>{
    const x=points[a][0]-points[b][0],y=points[a][1]-points[b][1];
    const u=points[c][0]-points[b][0],v=points[c][1]-points[b][1];
    const length=Math.hypot(x,y)*Math.hypot(u,v);
    return length<1e-12?null:Math.acos(Math.max(-1,Math.min(1,(x*u+y*v)/length)))*180/Math.PI;
  };
  // Fixar A na posição 0 elimina apenas rotações: 37² formas, todas as repetições inclusas.
  const atlas=Array.from({length:N*N},(_,id)=>{
    const b=Math.floor(id/N),c=id%N,s1=jump(0,b),s2=jump(b,c);
    const closure=dist(0,c),net=s1+s2;
    const area=Math.abs((points[b][0]-points[0][0])*(points[c][1]-points[0][1])-(points[b][1]-points[0][1])*(points[c][0]-points[0][0]))/2;
    const type=b===0&&c===0?'TRIPLA':c===0?'RETORNO':b===0?'REPETIÇÃO INICIAL':b===c?'REPETIÇÃO FINAL':Math.sign(s1)===Math.sign(s2)?'CONTINUIDADE':'INVERSÃO';
    return Object.freeze({s1,s2,closure,net,length:Math.abs(s1)+Math.abs(s2),
      trend:Math.sign(Math.abs(s2)-Math.abs(s1)),type,area,degenerate:area<1e-10,
      ratio:s1?Math.abs(s2/s1):null,
      contour:Math.sign(s1)===Math.sign(s2)&&s1!==0&&Math.abs(net)>=31&&closure<=6,
      chords:[chord(0,b),chord(b,c),chord(0,c)],angles:[angle(b,0,c),angle(0,b,c),angle(0,c,b)]});
  });
  const feature=(a,b,c)=>atlas[mod(b-a)*N+mod(c-a)];
  const kernels=Array.from({length:N},(_,center)=>{
    const values=Array.from({length:N},(_,j)=>Math.exp(-dist(center,j)/1.25));
    const total=values.reduce((s,v)=>s+v,0);return values.map(v=>v/total);
  });
  function arc(p,end){
    const start=Math.max(0,end-5);let best=null;
    for(let sector=0;sector<N;sector++){
      let count=0;for(let i=start;i<=end;i++)if(mod(p[i]-sector)<8)count++;
      if(!best||count>best.count)best={start:sector,count};
    }
    if(!best||best.count<3)return null;
    const inside=mod(p[end]-best.start)<8;
    return {...best,inside,total:end-start+1,offset:mod(p[end]-best.start)};
  }
  function poles(p,end){
    if(end<3)return null;
    const a=p[end-3],b=p[end-2],c=p[end-1],d=p[end];
    if(dist(a,b)<8||dist(a,c)>2||dist(b,d)>2)return null;
    const initial=dist(a,b),separation=dist(c,d);
    return {a,b,c,d,separation,movement:Math.sign(separation-initial)};
  }
  function raw(history){
    const h=history.slice(-70),key=h.join(',');if(cache.has(key))return cache.get(key);
    const p=h.map(n=>index[n]),end=p.length-1;
    const modes=names.map(name=>({name,support:0,occurrences:0,weights:Array(N).fill(6)}));
    if(end<2)return keep(cache,key,modes.map(m=>({...m,weights:Array(N).fill(1)})));
    const current=feature(p[end-2],p[end-1],p[end]);
    const currentArc=arc(p,end),currentPoles=poles(p,end);
    function add(k,weight,center,exact=false){
      if(weight<0.025)return;
      const mode=modes[k];mode.support+=weight;mode.occurrences++;
      if(exact)mode.weights[mod(center)]+=weight*N;
      else for(let j=0;j<N;j++)mode.weights[j]+=weight*N*kernels[mod(center)][j];
    }
    for(let old=2;old<end;old++){
      // old+1 is an observed successor and is never the unknown next spin.
      const f=feature(p[old-2],p[old-1],p[old]),next=p[old+1];
      const recency=Math.exp(-(end-old-1)/28),delta=jump(p[old],next);
      if(h[old-2]===h[end-2]&&h[old-1]===h[end-1]&&h[old]===h[end])add(0,recency,next,true);
      const shape=(f.type===current.type?1:0.2)*(f.trend===current.trend?1:0.4);
      const sameDiff=Math.abs(f.s1-current.s1)+Math.abs(f.s2-current.s2);
      if(sameDiff<=4)add(1,recency*Math.exp(-sameDiff/2)*shape,p[end]+delta);
      const reflectedDiff=Math.abs(f.s1+current.s1)+Math.abs(f.s2+current.s2);
      if(reflectedDiff<=4)add(2,recency*Math.exp(-reflectedDiff/2)*shape,p[end]-delta);
      const amplitudeDiff=Math.abs(Math.abs(f.s1)-Math.abs(current.s1))+Math.abs(Math.abs(f.s2)-Math.abs(current.s2));
      if(amplitudeDiff<=5&&f.trend===current.trend&&Math.abs(f.closure-current.closure)<=3){
        const sign=Math.sign(current.s2)*Math.sign(f.s2)||1;
        const ratio=f.ratio==null||current.ratio==null?1:Math.exp(-Math.abs(Math.log((f.ratio+0.1)/(current.ratio+0.1))));
        add(3,recency*Math.exp(-amplitudeDiff/3)*ratio,p[end]+delta*sign);
      }
      // One historical endpoint contributes once: choose its longest supported chain.
      let chain=null;
      for(let length=Math.min(8,old+1,end+1);length>=4;length--){
        let error=0,opposite=0;
        for(let k=0;k<length-1;k++){
          const a=jump(p[end-k-1],p[end-k]),b=jump(p[old-k-1],p[old-k]);
          error+=Math.abs(a-b);if(Math.sign(a)!==Math.sign(b))opposite++;
        }
        if(error/(length-1)<=2&&opposite<=1){chain={error:error/(length-1),length};break;}
      }
      if(chain)add(4,recency*Math.exp(-chain.error/2)*(chain.length-2)/6,p[end]+delta);
      if(current.closure<=6&&f.closure<=6&&current.contour===f.contour&&f.type===current.type&&f.trend===current.trend){
        const similarity=Math.exp(-Math.abs(current.closure-f.closure)/2-Math.abs(current.length-f.length)/8-Math.abs(current.area-f.area));
        add(5,recency*similarity,p[end-2]+jump(p[old-2],next));
      }
      const oldArc=currentArc?arc(p,old):null;
      if(oldArc&&oldArc.inside===currentArc.inside&&Math.abs(oldArc.count-currentArc.count)<=1&&Math.abs(oldArc.total-currentArc.total)<=1){
        const relative=dist(oldArc.offset,currentArc.offset);
        if(relative<=4)add(6,recency*Math.exp(-relative/2),currentArc.start+mod(next-oldArc.start));
      }
      const oldPoles=currentPoles?poles(p,old):null;
      if(oldPoles&&oldPoles.movement===currentPoles.movement&&Math.abs(oldPoles.separation-currentPoles.separation)<=3){
        add(7,recency*Math.exp(-Math.abs(oldPoles.separation-currentPoles.separation)/2),currentPoles.c+jump(oldPoles.c,next));
      }
    }
    for(const mode of modes){const average=mean(mode.weights);mode.weights=mode.weights.map(v=>v/average);}
    return keep(cache,key,modes);
  }
  function analyze(history,baseline){
    const h=history.slice(-70),key=h.join(',');if(forecasts.has(key))return forecasts.get(key);
    const current=raw(h),base=baseline(h),logs=names.map(()=>[]);
    // Rolling chronological validation. No actual result enters its own forecast.
    for(let t=Math.max(8,h.length-24);t<h.length;t++){
      const before=h.slice(0,t),past=raw(before),previous=baseline(before),outcome=index[h[t]];
      for(let k=0;k<names.length;k++){
        if(past[k].support<2||past[k].occurrences<3)continue;
        const comparison=previous[outcome],trial=0.85*comparison+0.15*past[k].weights[outcome];
        logs[k].push(Math.log(Math.max(1e-9,trial)/Math.max(1e-9,comparison)));
      }
    }
    const modes=current.map((model,k)=>{
      const values=logs[k],gain=mean(values),count=values.length;
      const variance=count>1?values.reduce((s,x)=>s+(x-gain)**2,0)/(count-1):0;
      const stderr=count?Math.sqrt(variance/count):0;
      const recentGain=mean(values.slice(-4));
      const active=count>=8&&model.occurrences>=3&&model.support>=2&&gain>stderr&&recentGain>0;
      const mass=active?Math.min(0.2,(gain-stderr)*5)*count/(count+16)*Math.min(1,model.support/8):0;
      return {...model,evaluations:count,meanLogGain:gain,stderr,recentGain,active,mass};
    });
    const totalMass=modes.reduce((s,m)=>s+m.mass,0),influence=Math.min(0.2,totalMass);
    const weights=totalMass?base.map((v,j)=>v*(1-influence)+influence*modes.reduce((s,m)=>s+m.weights[j]*m.mass,0)/totalMass):[...base];
    return keep(forecasts,key,{weights,modes,influence,observedSuccessors:Math.max(0,h.length-3),
      status:influence?'ATIVA EM TESTE CRONOLÓGICO':'SEM SUPORTE FAVORÁVEL — BASE PRESERVADA'});
  }
  return {raw,analyze,feature,atlas,names,clear(){cache.clear();forecasts.clear();}};
}


    /* Leitura estrutural ativa. Enumera os 37 próximos resultados e seus estados.
   Uma alternativa possível não é uma previsão confirmada. Somente sucessores
   já observados atribuem peso. Leitura e escolha permanecem separadas. */
function createMotorReadings667(wheel, atlas) {
  const size = 37;
  const positions = Array(size);
  wheel.forEach((number, index) => { positions[number] = index; });
  const mod = value => (value % size + size) % size;
  const jump = (from, to) => {
    const forward = mod(to - from);
    return forward <= 18 ? forward : forward - size;
  };
  const distance = (from, to) => Math.abs(jump(from, to));
  const average = values => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
  const band = value => value === 0 ? '0' : value <= 2 ? '1–2' : value <= 6 ? '3–6' : value <= 12 ? '7–12' : '13+';
  const amplitudeBand = value => value <= 3 ? 'CURTO' : value <= 9 ? 'MÉDIO' : 'LONGO';
  const normalize = values => {
    const mean = average(values) || 1;
    return values.map(value => value / mean);
  };
  const cache = new Map();
  const groups = ['TRIANGULAÇÃO', 'AMPLITUDE', 'ENCADEAMENTO', 'FECHAMENTO/PERCURSO', 'POLOS', 'ARCOS'];
  const profiles = [
    [1, 1, 1, 1, 1, 1],
    [1.2, 1.8, 1.5, 1, .6, .6],
    [.8, .7, .8, 1.3, 1.1, 1.7],
    [.8, 1.1, 2, 2, .6, .6],
    [2.3, 1.2, 1.6, 1.8, .5, .5],
    [.6, .6, .7, .8, 2.4, 2.1],
    [1.4, .8, .9, 2, 1.7, .6],
    [.8, 2.2, 1.4, 1.5, .6, 1.3]
  ];

  /* Atlas completo: nenhum corte por ranking, frequência ou classe.
     ID = posição relativa de B * 37 + posição relativa de C, com A = 0.
     Cada registro guarda atributos exatos; somente o passado fornece sucessores. */
  const relativeForms = Array.from({ length: 1369 }, (_, id) => {
    const b = Math.floor(id / 37), c = id % 37;
    const shape = atlas.feature(0, b, c);
    return Object.freeze({ ...shape, id, positions: Object.freeze([0, b, c]),
      amplitudes: Object.freeze([Math.abs(shape.s1), Math.abs(shape.s2)]),
      amplitudeId: Math.abs(shape.s1) * 19 + Math.abs(shape.s2),
      amplitudeChange: Math.abs(shape.s2) - Math.abs(shape.s1),
      perimeter: shape.chords.reduce((sum, value) => sum + value, 0),
      partialReturn: c !== 0 && shape.s1 * shape.s2 < 0 && shape.closure < Math.abs(shape.s1),
      signedResidual: shape.net - Math.round(shape.net / 37) * 37,
      algebraicTurns: shape.net / 37,
      chords: Object.freeze([...shape.chords]), angles: Object.freeze([...shape.angles])
    });
  });
  const amplitudeForms = Array.from({ length: 361 }, (_, id) => {
    const first = Math.floor(id / 19), second = id % 19;
    return Object.freeze({ id, first, second, difference: second - first,
      ratio: first === 0 ? null : second / first,
      trend: second < first ? 'CONTRAÇÃO' : second > first ? 'EXPANSÃO' : 'MANUTENÇÃO' });
  });
  const formId = (a, b, c) => mod(b - a) * 37 + mod(c - a);
  const kernelCache = new Map();

  function fullKernels(currentId) {
    if (kernelCache.has(currentId)) return kernelCache.get(currentId);
    const current = relativeForms[currentId];
    const geometry = new Float64Array(1369);
    const closure = new Float64Array(1369);
    const amplitude = new Float64Array(361);
    for (const old of relativeForms) {
      // Todos os 1.369 registros são avaliados, sem faixas arredondadas.
      const steps = (Math.abs(current.s1 - old.s1) + Math.abs(current.s2 - old.s2)) / 12;
      const chords = current.chords.reduce((sum, value, i) => sum + Math.abs(value - old.chords[i]), 0) / 3;
      const angles = current.angles.reduce((sum, value, i) => {
        const other = old.angles[i];
        return sum + (value == null || other == null ? Number(value !== other) : Math.abs(value - other) / 180);
      }, 0) / 3;
      const area = Math.abs(current.area - old.area);
      const ratio = current.ratio == null || old.ratio == null
        ? Number(current.ratio !== old.ratio)
        : Math.abs(Math.atan(current.ratio) - Math.atan(old.ratio));
      const attributes = Math.abs(current.closure - old.closure) / 18 +
        Math.abs(current.amplitudeChange - old.amplitudeChange) / 36 + ratio +
        Number(current.partialReturn !== old.partialReturn) + Number(current.degenerate !== old.degenerate);
      geometry[old.id] = Math.exp(-steps - chords - angles - area - attributes) + (old.id === currentId ? 4 : 0);
      closure[old.id] = Math.exp(-Math.abs(current.closure - old.closure) / 4 -
        Math.abs(current.net - old.net) / 12 - Math.abs(current.length - old.length) / 12 -
        Number(current.contour !== old.contour));
    }
    for (const old of amplitudeForms) {
      amplitude[old.id] = Math.exp(-(Math.abs(current.amplitudes[0] - old.first) +
        Math.abs(current.amplitudes[1] - old.second)) / 5 -
        Math.abs(current.amplitudeChange - old.difference) / 8) +
        (old.id === current.amplitudeId ? 3 : 0);
    }
    const result = { geometry, closure, amplitude };
    kernelCache.set(currentId, result);
    if (kernelCache.size > 32) kernelCache.delete(kernelCache.keys().next().value);
    return result;
  }

  function exhaustiveRead(prefix) {
    const formCounts = new Uint16Array(1369);
    const amplitudeCounts = new Uint16Array(361);
    const observed = new Map();
    // A trinca corrente ainda não tem sucessor e não pode treiná-lo.
    for (let end = 2; end < prefix.length - 1; end++) {
      const id = formId(prefix[end - 2], prefix[end - 1], prefix[end]);
      const shape = relativeForms[id];
      const nextStep = jump(prefix[end], prefix[end + 1]);
      const mass = Math.exp(-(prefix.length - 2 - end) / 28);
      formCounts[id]++;
      amplitudeCounts[shape.amplitudeId]++;
      let record = observed.get(id);
      if (!record) {
        record = { id, count: 0, mass: 0, successors: new Map() };
        observed.set(id, record);
      }
      record.count++;
      record.mass += mass;
      const next = record.successors.get(nextStep) || { step: nextStep, count: 0, mass: 0 };
      next.count++;
      next.mass += mass;
      record.successors.set(nextStep, next);
    }
    const currentId = prefix.length >= 3 ? formId(...prefix.slice(-3)) : null;
    const groups = [0, 1, 3].map(group => ({ name: ['TRIANGULAÇÃO', 'AMPLITUDE', '', 'FECHAMENTO/PERCURSO'][group],
      group, support: 0, modes: group === 1 ? 361 : 1369, weights: Array(37).fill(8) }));
    if (currentId != null) {
      const kernels = fullKernels(currentId);
      const anchor = prefix.at(-1);
      // Percorre explicitamente o atlas inteiro. Sem ocorrência, contribuição
      // observada é zero; o registro continua disponível, sem inventar evidência.
      for (let id = 0; id < 1369; id++) {
        const shape = relativeForms[id], record = observed.get(id);
        if (!record) continue;
        const coefficients = [kernels.geometry[id], kernels.amplitude[shape.amplitudeId], kernels.closure[id]];
        groups.forEach((group, index) => {
          const coefficient = coefficients[index];
          group.support += coefficient * record.mass;
          for (const successor of record.successors.values()) {
            const target = mod(anchor + successor.step);
            const contribution = coefficient * successor.mass * 37;
            group.weights[target] += contribution * .7;
            group.weights[mod(target - 1)] += contribution * .15;
            group.weights[mod(target + 1)] += contribution * .15;
          }
        });
      }
    }
    groups.forEach(group => { group.weights = normalize(group.weights); });
    return { currentId, formsEvaluated: currentId == null ? 0 : 1369,
      amplitudesEvaluated: currentId == null ? 0 : 361,
      representedForms: 1369, representedAmplitudes: 361,
      numericTriples: 50653, formCounts, amplitudeCounts,
      observedForms: observed.size, successorSamples: Math.max(0, prefix.length - 3),
      observed: [...observed.values()].map(record => ({ ...record, successors: [...record.successors.values()] })), groups };
  }

  function catalogue(history, id = null) {
    const reading = read(history), data = reading.exhaustive;
    const describe = form => ({ ...form, occurrences: data.formCounts[form.id],
      successors: data.observed.find(record => record.id === form.id)?.successors || [],
      status: data.formCounts[form.id] ? 'OBSERVADA COM SUCESSOR' : 'REPRESENTADA SEM SUCESSOR OBSERVADO' });
    if (id != null) return Number.isInteger(id) && id >= 0 && id < 1369 ? describe(relativeForms[id]) : null;
    return relativeForms.map(describe);
  }

  // Capacidade finita explícita: qualquer sequência de até 70 resultados pode
  // ser descrita. Apenas sequências anteriores com sucessor treinam os pesos.
  const polePairs = Object.freeze(Array.from({length:1369},(_,id)=>{
    const a=Math.floor(id/37),b=id%37;
    return Object.freeze({id,positionA:a,positionB:b,numberA:wheel[a],numberB:wheel[b],
      separation:distance(a,b),direction:jump(a,b)});
  }));

  function polePairReading(prefix,next,a,b,tolerance){
    if(![a,b,next,tolerance].every(Number.isInteger)||a<0||a>36||b<0||b>36||next<0||next>36||tolerance<0||tolerance>18)return null;
    const da=distance(a,next),db=distance(b,next),insideA=da<=tolerance,insideB=db<=tolerance;
    const last=prefix.at(-1),previous=prefix.length>1?prefix.at(-2):null;
    const side=n=>n==null?-1:distance(a,n)>tolerance&&distance(b,n)>tolerance?-1:distance(a,n)<distance(b,n)?0:distance(a,n)>distance(b,n)?1:2;
    const currentSide=side(next),lastSide=side(last),priorSide=side(previous);
    let event=currentSide<0?'FORA DOS POLOS':currentSide===2?'SOBREPOSIÇÃO DOS POLOS':lastSide<0?'RETOMADA':lastSide===currentSide?'PERMANÊNCIA':'ALTERNÂNCIA';
    if(currentSide<0&&lastSide>=0)event='SAÍDA DOS POLOS';
    if(currentSide<0&&lastSide<0&&priorSide>=0)event='RUPTURA';
    if(a===b&&currentSide>=0)event='POLO ÚNICO / CONCENTRAÇÃO';
    const oldSeparation=distance(a,b);
    const newSeparation=currentSide===0?distance(next,b):currentSide===1?distance(a,next):oldSeparation;
    const movement=Math.sign(newSeparation-oldSeparation);
    if(currentSide>=0&&currentSide<2&&oldSeparation>0&&newSeparation===0)event='FUSÃO';
    else if(event==='ALTERNÂNCIA'&&movement<0)event='CONVERGÊNCIA';
    else if(event==='ALTERNÂNCIA'&&movement>0)event='DIVERGÊNCIA';
    return {tolerance,positionA:a,positionB:b,numberA:wheel[a],numberB:wheel[b],
      separation:oldSeparation,nextSeparation:newSeparation,movement,distanceA:da,distanceB:db,
      insideA,insideB,overlap:insideA&&insideB,side:currentSide,event,
      shiftA:currentSide===0?jump(a,next):0,shiftB:currentSide===1?jump(b,next):0};
  }

  function poleWindowWeights(prefix){
    const weights=Array(37).fill(8),tolerances=Array.from({length:19},(_,t)=>({tolerance:t,support:0}));
    if(prefix.length<4)return {name:'POLOS',weights:normalize(weights),support:0,tolerances,pairPositions:1369,separations:19};
    const current=prefix.slice(-4),[a,b,c,d]=current;
    const features=q=>({initial:distance(q[0],q[1]),final:distance(q[2],q[3]),
      shiftA:jump(q[0],q[2]),shiftB:jump(q[1],q[3]),span:jump(q[0],q[1])});
    const now=features(current);let support=0,samples=0;
    for(let end=3;end<prefix.length-1;end++){
      const q=prefix.slice(end-3,end+1),old=features(q);
      const geometry=Math.exp(-Math.abs(now.initial-old.initial)/6-Math.abs(now.final-old.final)/6-
        Math.abs(now.shiftA-old.shiftA)/8-Math.abs(now.shiftB-old.shiftB)/8-Math.abs(now.span-old.span)/10);
      let coefficient=0;
      for(let t=0;t<=18;t++){
        const activeNow=Math.abs(now.shiftA)<=t&&Math.abs(now.shiftB)<=t;
        const activeOld=Math.abs(old.shiftA)<=t&&Math.abs(old.shiftB)<=t;
        // 0..18 são examinados; sobreposição é explícita e não são 19 ensaios independentes.
        const overlapNow=now.final<=2*t,overlapOld=old.final<=2*t;
        const similarity=geometry*(activeNow===activeOld?1:.25)*(overlapNow===overlapOld?1:.5);
        tolerances[t].support+=similarity;
        coefficient+=similarity/19;
      }
      const mass=coefficient*Math.exp(-(prefix.length-2-end)/28);
      const next=mod(c+jump(q[2],prefix[end+1]));
      weights[next]+=mass*37*.7;weights[mod(next-1)]+=mass*37*.15;weights[mod(next+1)]+=mass*37*.15;
      support+=mass;samples++;
    }
    return {name:'POLOS',weights:normalize(weights),support,tolerances,pairPositions:1369,separations:19,samples,
      current:{...now,numbers:current.map(p=>wheel[p]),movement:Math.sign(now.final-now.initial)}};
  }

  // Todas as janelas 1..N, todos os 37 inícios, larguras 1..36.
  // Largura 37 também é representada, mas é neutra: contém a roda inteira.
  function arcWindowWeights(prefix){
    const length=prefix.length,weights=Array(37).fill(8),tables=[];
    const windows=Array.from({length},(_,i)=>i+1);
    if(!length)return {name:'ARCOS',weights,support:0,windows,sectorCases:1369,uniqueCovers:1333};
    const eventTables=[],runTables=[];
    const previousFlags=new Uint8Array(1369),runs=new Uint8Array(1369),seen=new Uint8Array(1369);
    for(let end=0;end<length;end++){
      const table=new Uint8Array((end+1)*1369),frequency=new Uint8Array(37);
      for(let window=1;window<=end+1;window++){
        frequency[prefix[end-window+1]]++;
        const offset=(window-1)*1369;
        for(let start=0;start<37;start++){
          let count=0;
          for(let width=1;width<=37;width++){
            count+=frequency[mod(start+width-1)];
            table[offset+(width-1)*37+start]=count;
          }
        }
      }
      tables.push(table);
      const events=new Uint8Array(1369),runSnapshot=new Uint8Array(1369);
      for(let width=1;width<=37;width++)for(let start=0;start<37;start++){
        const id=(width-1)*37+start,inside=Number(mod(prefix[end]-start)<width);
        // 0=fora,1=entrada,2=permanência,3=saída,4=reentrada.
        events[id]=inside?(end&&previousFlags[id]?2:seen[id]?4:1):(end&&previousFlags[id]?3:0);
        runs[id]=end&&previousFlags[id]===inside?runs[id]+1:1;
        runSnapshot[id]=runs[id];previousFlags[id]=inside;if(inside)seen[id]=1;
      }
      eventTables.push(events);runTables.push(runSnapshot);
    }
    const current=tables.at(-1),currentEvents=eventTables.at(-1),currentRuns=runTables.at(-1);
    let support=0,comparisons=0;
    for(let end=0;end<length-1;end++){
      let coefficient=0,windowCount=end+1;
      for(let window=1;window<=windowCount;window++){
        let sum=0;const offset=(window-1)*1369;
        // Cada leitura espacial participa uma vez; sem somar como acertos.
        for(let id=0;id<1332;id++){
          const delta=Math.abs(current[offset+id]-tables[end][offset+id]);
          const density=1/(1+delta/window);
          const transition=currentEvents[id]===eventTables[end][id]?1:.35;
          const duration=1/(1+Math.abs(currentRuns[id]-runTables[end][id])/window);
          sum+=density*transition*duration;
        }
        coefficient+=sum/1332;comparisons+=1332;
      }
      const mass=coefficient/windowCount*Math.exp(-(length-2-end)/28);
      const next=prefix[end+1];
      weights[next]+=mass*37*.7;weights[mod(next-1)]+=mass*37*.15;weights[mod(next+1)]+=mass*37*.15;
      support+=mass;
    }
    return {name:'ARCOS',weights:normalize(weights),support,windows,sectorCases:1369,
      uniqueCovers:1333,comparisons,representedWindowSectorCases:length*1369};
  }

  function poleStep(previous, prefix, next, tolerance) {
    const state = previous ? {
      ...previous,
      anchors: previous.anchors ? [...previous.anchors] : null,
      drift: previous.drift ? [...previous.drift] : [0, 0]
    } : { active: false, anchors: null, drift: [0, 0], outside: 0, age: 0, event: 'SEM FORMAÇÃO' };
    state.age++;
    state.inactiveAge = state.active || state.concentration != null ? 0 : (state.inactiveAge || 0) + 1;
    if (state.anchors && (state.active || (state.event === 'RUPTURA' && state.outside <= 3))) {
      const oldDistance = distance(...state.anchors);
      const expected = 1 - state.lastSide;
      const de = distance(next, state.anchors[expected]);
      const ds = distance(next, state.anchors[state.lastSide]);
      if (de <= tolerance && de <= ds) {
        const resumed = !state.active || state.outside > 0 || state.event === 'INTERRUPÇÃO';
        state.drift[expected] += jump(state.anchors[expected], next);
        state.anchors[expected] = next;
        state.lastSide = expected;
        state.outside = 0;
        state.active = true;
        state.event = resumed ? 'RETOMADA' : 'ALTERNÂNCIA';
      } else if (state.active && ds <= tolerance) {
        state.drift[state.lastSide] += jump(state.anchors[state.lastSide], next);
        state.anchors[state.lastSide] = next;
        state.outside = 0;
        state.event = 'INTERRUPÇÃO';
      } else {
        state.outside++;
        state.event = state.outside >= 2 ? 'RUPTURA' : 'SAÍDA';
        if (state.outside >= 2) state.active = false;
      }
      state.separation = distance(...state.anchors);
      state.movement = Math.sign(state.separation - oldDistance);
      if (state.active && state.separation <= Math.max(2, tolerance)) {
        state.active = false;
        state.event = 'FUSÃO';
        state.concentration = next;
        state.fromFusion = true;
        state.concentrationOutside = 0;
      } else if (state.active && state.event === 'ALTERNÂNCIA') {
        if (state.movement < 0) state.event = 'CONVERGÊNCIA';
        if (state.movement > 0) state.event = 'DIVERGÊNCIA';
        if (!state.movement) state.event = 'MANUTENÇÃO';
      }
    } else if (state.concentration != null) {
      if (distance(next, state.concentration) <= Math.max(2, tolerance)) {
        state.concentration = next;
        state.fromFusion = true;
        state.concentrationOutside = 0;
        state.event = 'CONCENTRAÇÃO APÓS FUSÃO';
      } else {
        state.concentrationOutside++;
        state.event = state.concentrationOutside >= 2 ? 'DISPERSÃO APÓS FUSÃO' : 'SAÍDA APÓS FUSÃO';
        if (state.concentrationOutside >= 2) state.concentration = null;
      }
    }
    if (!state.active && prefix.length >= 3 && state.event !== 'FUSÃO') {
      const [a, b, c] = prefix.slice(-3);
      if (distance(a, b) >= (tolerance<=8?Math.max(8,2*tolerance+2):0) &&
          distance(a, c) <= tolerance && distance(b, next) <= tolerance) {
        const split = state.concentration != null || state.fromFusion;
        state.anchors = [c, next];
        state.drift = [jump(a, c), jump(b, next)];
        state.lastSide = 1;
        state.separation = distance(c, next);
        state.movement = Math.sign(state.separation - distance(a, b));
        state.outside = 0;
        state.active = true;
        state.concentration = null;
        state.event = tolerance>8&&distance(c,next)<=2*tolerance?'SOBREPOSIÇÃO DOS POLOS':split ? 'NOVOS POLOS APÓS FUSÃO' : 'FORMAÇÃO';
      }
    }
    if(state.active)state.inactiveAge=0;
    if(!state.active&&state.concentration==null&&state.inactiveAge>3){state.anchors=null;state.event='ENCERRADO';}
    return state;
  }

  function chooseArc(previous, prefix, width) {
    if (prefix.length < 4 || width === 37) return { width, start: null, event: 'SEM CONCENTRAÇÃO', outside: 0, inside: 0 };
    const sample = prefix.slice(-8);
    const counts = Array(size).fill(0);
    for (const position of sample) counts[position]++;
    let total = 0;
    for (let j = 0; j < width; j++) total += counts[j];
    let best = { start: 0, count: total };
    for (let start = 1; start < size; start++) {
      total += counts[mod(start + width - 1)] - counts[start - 1];
      if (total > best.count) best = { start, count: total };
    }
    const minimum = Math.max(2, Math.ceil(sample.length * width / size + 1));
    const state = previous ? { ...previous } : { width, start: null, outside: 0, inside: 0, weak: 0 };
    if (state.start != null) {
      const count = sample.filter(position => mod(position - state.start) < width).length;
      state.weak = count < minimum ? (state.weak || 0) + 1 : 0;
      if (best.count >= minimum && best.start !== state.start && best.count >= count + 2) {
        state.start = best.start;
        state.event = 'SUBSTITUIÇÃO';
        state.outside = 0;
        state.inside = 0;
        state.lastInside = null;
      } else if (state.weak >= 2 || (state.outside >= 8 && count < minimum)) {
        state.start = null;
        state.event = 'ENCERRAMENTO';
      } else if (!state.weak && previous?.weak) state.event = 'RETOMADA DO ARCO';
      else if (state.weak) state.event = 'ENFRAQUECIMENTO';
    } else if (best.count >= minimum) {
      state.start = best.start;
      state.event = 'FORMAÇÃO';
      state.outside = 0;
      state.inside = 0;
      state.lastInside = null;
      state.weak = 0;
    } else state.event = state.event === 'ENCERRAMENTO' ? 'ENCERRAMENTO' : 'SEM CONCENTRAÇÃO';
    state.width = width;
    state.count = state.start == null ? 0 : sample.filter(position => mod(position - state.start) < width).length;
    return state;
  }

  function consumeArc(prepared, next) {
    const state = { ...prepared };
    if (state.start == null) return state;
    const inside = mod(next - state.start) < state.width;
    const transition = inside ? state.lastInside === true ? 'PERMANÊNCIA' : state.outside > 0 ? 'REENTRADA' : 'ENTRADA'
                             : state.lastInside === true ? 'SAÍDA' : 'AFASTAMENTO';
    state.transition = transition;
    if (!['SUBSTITUIÇÃO', 'FORMAÇÃO', 'ENFRAQUECIMENTO', 'RETOMADA DO ARCO'].includes(state.event)) state.event = transition;
    state.inside = inside ? state.inside + 1 : 0;
    state.outside = inside ? 0 : state.outside + 1;
    state.lastInside = inside;
    return state;
  }


  // Todos os setores fixos são lidos, inclusive quando não são o arco eleito.
  // Chaves compactas evitam armazenar 1.369 objetos em cada prefixo histórico.
  function fixedArcKeys(prefix) {
    const keys = new Uint16Array(37 * 37);
    const recent = prefix.slice(-8);
    for (let width = 1; width <= 37; width++) {
      for (let start = 0; start < 37; start++) {
        const flags = recent.map(position => mod(position - start) < width);
        const count = flags.filter(Boolean).length;
        let run = 0;
        const inside = flags.at(-1) || false;
        for (let k = flags.length - 1; k >= 0 && flags[k] === inside && run < 4; k--) run++;
        keys[(width - 1) * 37 + start] = count * 10 + Number(inside) * 5 + run;
      }
    }
    return keys;
  }

  function arcAlternative(history, number, start, width, window=8) {
    if (!Number.isInteger(start) || start < 0 || start > 36 || !Number.isInteger(width) || width < 1 || width > 37) return null;
    const prefix = history.slice(-70).map(number => positions[number]);
    const priorInside = prefix.length ? mod(prefix.at(-1) - start) < width : null;
    const inside = mod(positions[number] - start) < width;
    const visited = prefix.some(position => mod(position - start) < width);
    const event = inside ? priorInside === true ? 'PERMANÊNCIA' : visited ? 'REENTRADA' : 'ENTRADA'
                         : priorInside === true ? 'SAÍDA' : 'AFASTAMENTO';
    const sample = prefix.slice(-Math.max(1,Math.min(70,Math.trunc(window)||8)));
    const visits = sample.filter(position => mod(position - start) < width).length;
    return { start, startNumber: wheel[start], width, number, inside, event, visits, sample: sample.length };
  }

  function makeFrame(prefix, poles, arcs, captureModes = true) {
    const end = prefix.length - 1;
    if (end < 2) return { modes: [], poles, arcs, triangle: null, chains: [] };
    const a = prefix[end - 2], b = prefix[end - 1], c = prefix[end];
    const shape = atlas.feature(a, b, c);
    const f = { ...shape,
      partialReturn: a!==c && shape.s1*shape.s2<0 && shape.closure<Math.abs(shape.s1),
      perimeter: shape.chords.reduce((sum,value)=>sum+value,0),
      amplitudeChange: Math.abs(shape.s2)-Math.abs(shape.s1),
      abruptAmplitude: Math.abs(Math.abs(shape.s2)-Math.abs(shape.s1))>=10,
      amplitudeAlternation: (Math.abs(shape.s1)<=3&&Math.abs(shape.s2)>=10)||(Math.abs(shape.s2)<=3&&Math.abs(shape.s1)>=10),
      signedResidual: shape.net-Math.round(shape.net/37)*37,
      algebraicTurns: shape.net/37
    };
    const modes = [];
    function mode(id, group, key, anchor = c, orientation = 1) {
      if(captureModes)modes.push({ id, group, key, anchor, orientation });
    }
    const chains = [];
    for (let length = 4; length <= Math.min(70, prefix.length); length++) {
      const chain = prefix.slice(-length);
      const steps = chain.slice(1).map((position, i) => jump(chain[i], position));
      const net = steps.reduce((sum, value) => sum + value, 0);
      const absolute = steps.reduce((sum, value) => sum + Math.abs(value), 0);
      const closure = distance(chain[0], c);
      const trends = steps.slice(1).map((value, i) => Math.sign(Math.abs(value) - Math.abs(steps[i])));
      mode('CADEIA NUMÉRICA '+length,2,chain.join(','),null);
      mode('CADEIA EXATA ' + length, 2, steps.join(','));
      const reflected=steps.map(value=>-value).join(',');
      const ordered=steps.join(',');
      mode('CADEIA REFLETIDA '+length,2,ordered<reflected?ordered:reflected,c,ordered<reflected?1:-1);
      mode('CADEIA AMPLITUDES '+length,2,steps.map(Math.abs).join(','));
      mode('CADEIA DIREÇÃO/AMPLITUDE ' + length, 2, steps.map(value => Math.sign(value) + ':' + amplitudeBand(Math.abs(value))).join(','));
      mode('PERCURSO/RETORNO ' + length, 3, [Math.sign(net), Math.floor(Math.abs(net) / 6), Math.floor(absolute / 10), band(closure), trends.join(',')].join('|'), chain[0]);
      chains.push({ length, steps, net, absolute, closure, turns: net / 37, residual: mod(net), trends,
        interruption: steps.length>=3&&Math.sign(steps.at(-2))===Math.sign(steps.at(-3))&&Math.sign(steps.at(-1))!==Math.sign(steps.at(-2)),
        resumption: steps.length>=3&&steps.at(-1)===steps.at(-3)&&steps.at(-1)!==steps.at(-2),
        directionChanges: steps.slice(1).filter((value,index)=>Math.sign(value)!==Math.sign(steps[index])).length
      });
    }
    for (let tolerance = 0; tolerance <= 18; tolerance++) {
      const state = poles[tolerance];
      const relevant = state.anchors && (state.active || state.outside <= 3 || state.concentration != null);
      const key = relevant ? [state.event, band(state.separation || 0), state.movement || 0, Math.min(3, state.outside), state.drift.map(Math.sign).join(',')].join('|') : null;
      const anchor = state.concentration != null ? state.concentration : state.anchors ? state.anchors[1 - state.lastSide] : c;
      mode('POLOS TOLERÂNCIA ' + tolerance, 4, key, anchor);
    }
    for (let width = 1; width <= 37; width++) {
      const state = arcs[width - 1];
      const key = state.start == null ? null : [state.event, state.transition, state.count, Math.min(4, state.outside), Math.min(4, state.inside)].join('|');
      mode('ARCO ' + width, 5, key, state.start == null ? c : state.start);
    }
    if(captureModes)for(let width=1;width<=37;width++){
      mode('ARCO TODOS OS SETORES '+width,5,width===37?null:'TODOS OS SETORES');
      modes.at(-1).fixedWidth=width;
    }
    return { modes, poles, arcs, triangle: f, chains, fixedKeys: captureModes ? fixedArcKeys(prefix) : null };
  }

  function read(history) {
    const h = history.slice(-70);
    const key = h.join(',');
    if (cache.has(key)) return cache.get(key);
    const prefix = [];
    let poles = Array.from({ length: 19 }, () => null);
    let arcs = Array.from({ length: 37 }, () => null);
    const frames = [];
    for (const number of h) {
      const next = positions[number];
      const prepared = arcs.map((state, index) => chooseArc(state, prefix, index + 1));
      poles = poles.map((state, tolerance) => poleStep(state, prefix, next, tolerance));
      arcs = prepared.map(state => consumeArc(state, next));
      prefix.push(next);
      frames.push(makeFrame(prefix, poles, arcs));
    }
    const current = frames.at(-1) || { modes: [], poles, arcs, triangle: null, chains: [] };
    const modes = current.modes.map(mode => ({ ...mode, support: 0, occurrences: 0, weights: Array(size).fill(16), outcomes: Array(size).fill(0), outcomeIndices: Array.from({length:size},()=>[]) }));
    for (let end = 2; end < h.length - 1; end++) {
      const previous = frames[end];
      const next = positions[h[end + 1]];
      const mass = Math.exp(-(h.length - 2 - end) / 28);
      const previousModes = new Map(previous.modes.map(mode => [mode.id, mode]));
      for (const mode of modes) {
        const old = previousModes.get(mode.id);
        if (mode.fixedWidth || mode.key == null || !old || old.key !== mode.key) continue;
        mode.support += mass;
        mode.occurrences++;
        const center = mode.anchor == null ? next : mod(mode.anchor + jump(old.anchor, next) * mode.orientation * old.orientation);
        mode.outcomes[center]++;
        mode.outcomeIndices[center].push(end);
        mode.weights[center] += mass * size * .7;
        mode.weights[mod(center - 1)] += mass * size * .15;
        mode.weights[mod(center + 1)] += mass * size * .15;
      }
    }
    for(const mode of modes.filter(mode=>mode.fixedWidth&&mode.fixedWidth<37)){
      const indices=new Set();
      for(let start=0;start<37;start++){
        const index=(mode.fixedWidth-1)*37+start;
        for(let end=2;end<h.length-1;end++){
          if(frames[end].fixedKeys[index]!==current.fixedKeys[index])continue;
          const mass=Math.exp(-(h.length-2-end)/28)/37;
          const center=positions[h[end+1]];
          mode.support+=mass;indices.add(end);
          mode.outcomeIndices[center].push(end);mode.outcomes[center]++;
          mode.weights[center]+=mass*37*.7;
          mode.weights[mod(center-1)]+=mass*37*.15;
          mode.weights[mod(center+1)]+=mass*37*.15;
        }
      }
      mode.occurrences=indices.size;
    }
    for (const mode of modes) mode.weights = normalize(mode.weights);
    const exhaustive = exhaustiveRead(prefix);
    const summaries = groups.map((name, group) => {
      const members = modes.filter(mode => mode.group === group && mode.support > 0);
      const support = Math.max(0, ...members.map(mode => mode.support));
      const weights = members.length ? normalize(Array.from({ length: size }, (_, j) => average(members.map(mode => mode.weights[j])))) : Array(size).fill(1);
      return { name, support, modes: members.length, weights };
    });
    for(const complete of exhaustive.groups){
      if(complete.group===3){
        const legacy=summaries[3];
        summaries[3]={...complete,weights:normalize(complete.weights.map((value,j)=>(value+legacy.weights[j])/2)),support:Math.max(complete.support,legacy.support)};
      }else summaries[complete.group]=complete;
    }
    const completePoles=poleWindowWeights(prefix),completeArcs=arcWindowWeights(prefix);
    for(const [group,complete] of [[4,completePoles],[5,completeArcs]]){
      const previous=summaries[group];
      summaries[group]={name:previous.name,support:Math.max(previous.support,complete.support),modes:previous.modes,
        weights:normalize(previous.weights.map((value,j)=>(value+complete.weights[j])/2))};
    }
    const preparedArcs = arcs.map((state, index) => chooseArc(state, prefix, index + 1));
    const candidateCache=new Map();
    function describeCandidate(number){
      if(candidateCache.has(number))return candidateCache.get(number);
      const position=positions[number];if(position==null)return null;
      const futurePoles = poles.map((state, tolerance) => poleStep(state, prefix, position, tolerance));
      const futureArcs = preparedArcs.map(state => consumeArc(state, position));
      const future = makeFrame([...prefix, position], futurePoles, futureArcs, false);
      const last = current.triangle;
      const description = { number, position, triangle: future.triangle,
        triangleTransition: last && future.triangle ? { areaChange: Math.sign(future.triangle.area - last.area), closureChange: Math.sign(future.triangle.closure - last.closure), turn: Math.sign(future.triangle.s2), ratio: future.triangle.ratio } : null,
        chains: future.chains,
        poleEvents: futurePoles.map((state, tolerance) => ({ tolerance, event: state.event, movement: state.movement || 0, separation: state.separation == null ? null : state.separation, anchors: state.anchors ? state.anchors.map(p => wheel[p]) : [] })),
        arcEvents: futureArcs.map(state => ({ width: state.width, event: state.event, transition: state.transition || null, start: state.start, outside: state.outside, inside: state.inside })),
        allArcStartsRead: true, arcSectorCases: 1369,
        historicalSupport: new Set(modes.flatMap(mode => mode.outcomeIndices[position])).size,
        supportingChannels: modes.filter(mode => mode.outcomes[position] > 0).length
      };
      candidateCache.set(number,description);return description;
    }
    const result = { version: '6.6.13', prefix: h, get candidates(){return wheel.map(describeCandidate);},candidate:describeCandidate,modes, groups: summaries, exhaustive, completePoles,completeArcs,
      candidateCount:37, channelCount: modes.length, arcSectorCases:1369,chainLengths:Array.from({length:Math.max(0,h.length-3)},(_,i)=>i+4),
      interpretationCount:37 * modes.length,
      status: 'LEITURA ATIVA — HIPÓTESES NÃO SÃO ACERTOS' };
    result.profileCache = new Map();
    cache.set(key, result);
    if (cache.size > 4) cache.delete(cache.keys().next().value);
    return result;
  }

  function weights(history, profile = {}) {
    const reading = read(history);
    const cacheKey = [profile.family || '', profile.radius || '', profile.variation || ''].join('|');
    if (reading.profileCache.has(cacheKey)) return reading.profileCache.get(cacheKey);
    const shares = [...(profiles[profile.variation - 1] || profiles[0])];
    if ((profile.family || '').startsWith('RX')) { shares[0] *= 1.35; shares[2] *= 1.3; }
    if ((profile.family || '').includes('DINAMICO')) { shares[1] *= 1.35; shares[3] *= 1.25; }
    if (profile.radius) { shares[4] *= .8 + (profile.radius - 4) * .2; shares[5] *= .8 + (profile.radius - 4) * .25; }
    const total = shares.reduce((sum, value) => sum + value, 0);
    const result = normalize(Array.from({ length: size }, (_, j) => reading.groups.reduce((sum, group, k) => {
      const confidence = group.support / (group.support + 12);
      return sum + shares[k] / total * (1 + confidence * (group.weights[j] - 1));
    }, 0)));
    reading.profileCache.set(cacheKey, result);
    return result;
  }

  function merge(original, history, profile = {}, strength = .18) {
    if (history.length < 3) return original;
    const reading = read(history);
    if (!reading.groups.some(group => group.support > 0)) return original;
    const contribution = weights(history, profile);
    const mean = average(original) || 1;
    return original.map((value, j) => Math.max(.001, value * (1 - strength) + mean * contribution[j] * strength));
  }

  function summary(history) {
    const reading = read(history);
    return { version: reading.version, candidateCount: reading.candidateCount,
      channelCount: reading.channelCount, interpretationCount: reading.interpretationCount,
      relativeForms:1369, amplitudeForms:361, numericTriples:50653,
      formsEvaluated:reading.exhaustive.formsEvaluated, amplitudesEvaluated:reading.exhaustive.amplitudesEvaluated,
      successorSamples:reading.exhaustive.successorSamples,
      chainLengths:reading.chainLengths,poleTolerances:19,polePairPositions:1369,poleSeparations:19,
      arcWindows:reading.completeArcs.windows,arcWindowSectorCases:reading.completeArcs.representedWindowSectorCases||0,
      groups: reading.groups.map(({ name, support, modes }) => ({ name, support, modes })) };
  }

  return { read, candidate(history,number){return read(history).candidate(number);},weights, merge, summary, catalogue, relativeForms, amplitudeForms, fullKernels, polePairs,polePairReading,poleWindowWeights,arcWindowWeights,poleStep, chooseArc, consumeArc, arcAlternative,
    clear() { cache.clear(); kernelCache.clear(); } };
}

const triangleMemory666 = createTriangleMemory666(W);
  const motorReadings667=createMotorReadings667(W,triangleMemory666);
  function triangleAnalysis(h) {
    const original=legacyTriangleAnalysis(h);
    if(!state.structuralMemoryEnabled)return original;
    const successor=triangleMemory666.analyze(h,past=>legacyTriangleAnalysis(past).weights);
    return {...original,weights:successor.weights,successorMemory:successor};
  }

    function legacyTriangleAnalysis(h) {
      const key = h.join(",");
      if (triangleCache.has(key)) return triangleCache.get(key);
      const triples = [];
      for (let i = 0; i + 2 < h.length; i++)
        triples.push({
          ...triangleFeatures(h[i], h[i + 1], h[i + 2]),
          position: i + 3,
        });
      const weights = Array(37).fill(1),
        counts = {};
      for (const t of triples)
        for (const label of t.labels) counts[label] = (counts[label] || 0) + 1;
      let matches = 0,
        exactPairs = 0;
      if (h.length >= 2) {
        const a = h.at(-2),
          b = h.at(-1),
          jump = direction(a, b),
          candidates = W.map((n) => triangleFeatures(a, b, n));
        for (const t of triples) {
          const hop =
              Math.exp(-Math.abs(t.s1 - jump) / 4) *
              (Math.sign(t.s1) === Math.sign(jump) ? 1 : 0.2),
            physical = Math.exp(-(distance(a, t.a) + distance(b, t.b)) / 10),
            recency = Math.exp(-(h.length - t.position) / 30),
            exact = t.a === a && t.b === b;
          if (exact) exactPairs++;
          if (hop > 0.3) matches++;
          for (let j = 0; j < 37; j++) {
            const f = candidates[j],
              second = Math.exp(-Math.abs(f.s2 - t.s2) / 3.5),
              close = Math.exp(-Math.abs(f.closure - t.closure) / 4),
              area = Math.exp(-Math.abs(f.area - t.area) * 2),
              angle =
                f.angles[1] == null || t.angles[1] == null
                  ? f.degenerate === t.degenerate
                    ? 1
                    : 0.2
                  : Math.exp(-Math.abs(f.angles[1] - t.angles[1]) / 30),
              shape =
                (f.type === t.type ? 1 : 0.15) * 0.45 +
                (f.contour === t.contour ? 1 : 0.15) * 0.25 +
                (f.trend === t.trend ? 1 : 0.15) * 0.3,
              amplitude = Math.exp(
                -Math.abs(f.route.length - t.route.length) / 10,
              );
            weights[j] +=
              recency *
              (hop * 0.7 + physical * 0.3) *
              (second * 0.3 +
                close * 0.15 +
                area * 0.1 +
                angle * 0.1 +
                shape * 0.2 +
                amplitude * 0.15);
            if (exact)
              weights[j] += recency * 2 * Math.exp(-distance(W[j], t.c) / 1.8);
          }
        }
      }
      const r = {
        triples,
        last: triples.at(-1) || null,
        weights: normalizeSpace(weights),
        counts,
        matches,
        exactPairs,
        context: triangleContext(h),
        samples: triples.length,
      };
      triangleCache.set(key, r);
      if (triangleCache.size > 64)
        triangleCache.delete(triangleCache.keys().next().value);
      return r;
    }

    function applyTriangle(weights, h, strength = 0.28) {
      const a = triangleAnalysis(h);
      if (!a.samples) return weights;
      const scale = avg(weights.map((x) => Math.max(0, x))) || 1,
        reliability = Math.min(1, a.samples / 20);
      for (let j = 0; j < 37; j++)
        weights[j] = Math.max(
          0.001,
          weights[j] +
            scale * strength * reliability * clamp(a.weights[j] - 1, -0.75, 2),
        );
      return weights;
    }

    function triangleCoverage(play, h) {
      if (!validPlay(play)) return 0;
      const w = triangleAnalysis(h).weights;
      return (
        play.numbers.reduce((s, n) => s + w[ix(n)], 0) /
        w.reduce((s, n) => s + n, 0)
      );
    }

    function arcCandidates(h) {
      const recent = h.slice(-20);
      return W.map((_, start) => {
        const numbers = Array.from({ length: 8 }, (_, j) => W[mod(start + j)]);
        return {
          start,
          numbers,
          count: recent.filter((n) => numbers.includes(n)).length,
          total: recent.length,
        };
      }).sort((a, b) => b.count - a.count || a.start - b.start);
    }

    function arcMinimum(a) {
      return Math.max(3, Math.ceil(a.total * 0.3));
    }

    function selectArc(h, active) {
      if (h.length < 6) return null;
      const ranked = arcCandidates(h),
        best = ranked[0],
        old = active ? ranked.find((a) => a.start === active.start) : null,
        qualified = best.count >= arcMinimum(best);
      if (!active || active.active === false) return qualified ? best : null;
      if (old.count < arcMinimum(old)) {
        if (qualified && best.start !== old.start) return best;
        return active.weak >= 1 || active.outside >= 12 ? null : old;
      }
      return qualified &&
        (best.count > old.count + 1 ||
          (active.outside >= 3 && best.count > old.count))
        ? best
        : old;
    }

    function arcContext(a, event = a.event) {
      return (
        "S" +
        a.start +
        "|E" +
        event +
        "|Q" +
        (a.count >= arcMinimum(a) ? "FORTE" : "FRACO") +
        "|D" +
        Math.min(3, a.outside) +
        "|I" +
        Math.min(3, a.inside)
      );
    }

    function trackArcs(h) {
      let active = null,
        last = null;
      const events = [],
        episodes = [],
        transitions = {},
        contextTransitions = {};
      function setArc(candidate, position) {
        if (!candidate) {
          if (active) {
            active.active = false;
            active.strength = 0;
            active.event = "ENCERRADO";
            episodes.push(copy(active));
            events.push({
              position,
              number: null,
              arcId: active.id,
              start: active.start,
              event: "ENCERRADO",
              inside: false,
              gap: active.lastGap,
              outside: active.outside,
            });
            last = active;
            active = null;
          }
          return;
        }
        if (active?.start === candidate.start) {
          active.count = candidate.count;
          active.total = candidate.total;
          active.weak =
            candidate.count < arcMinimum(candidate) ? active.weak + 1 : 0;
          active.health = active.weak ? "ENFRAQUECIDO" : "FORTE";
          active.strength = active.weak ? 0.25 : 1;
          return;
        }
        if (active) {
          active.active = false;
          active.event = "SUBSTITUÍDO";
          episodes.push(copy(active));
          last = active;
        }
        active = {
          ...candidate,
          id: "ARC@" + position + ":" + candidate.start,
          formedBefore: position,
          active: true,
          health: "FORTE",
          strength: 1,
          weak: 0,
          lastInside: null,
          seenInside: false,
          event: "NOVO ARCO",
          inside: 0,
          outside: 0,
          entries: 0,
          exits: 0,
          returns: 0,
          lastGap: 0,
          maxGap: 0,
          drift: last ? direction(W[last.start], W[candidate.start]) : 0,
        };
      }
      for (let i = 0; i < h.length; i++) {
        setArc(selectArc(h.slice(0, i), active), i + 1);
        if (!active) continue;
        const number = h[i],
          inside = active.numbers.includes(number),
          priorEvent = active.event;
        if (active.lastInside != null) {
          for (const [map, key] of [
            [transitions, priorEvent],
            [contextTransitions, arcContext(active, priorEvent)],
          ]) {
            const b = map[key] || (map[key] = { total: 0, hits: 0 });
            b.total++;
            if (inside) b.hits++;
          }
        }
        if (inside) {
          if (active.lastInside === false) {
            active.lastGap = active.outside;
            active.entries++;
            if (active.seenInside) {
              active.returns++;
              active.event = "REENTRADA";
            } else active.event = "ENTRADA";
          } else if (active.lastInside === true) active.event = "PERMANÊNCIA";
          else {
            active.entries++;
            active.event = "ENTRADA";
          }
          active.inside = active.lastInside === true ? active.inside + 1 : 1;
          active.outside = 0;
          active.seenInside = true;
        } else {
          if (active.lastInside === true) {
            active.exits++;
            active.event = "SAÍDA";
          } else active.event = active.outside >= 3 ? "AFASTAMENTO" : "FORA";
          active.outside++;
          active.inside = 0;
          active.maxGap = Math.max(active.maxGap, active.outside);
        }
        active.lastInside = inside;
        events.push({
          position: i + 1,
          number,
          arcId: active.id,
          start: active.start,
          event: active.event,
          health: active.health,
          inside,
          gap: active.lastGap,
          outside: active.outside,
        });
      }
      setArc(selectArc(h, active), h.length + 1);
      return {
        active,
        last,
        events,
        episodes,
        transitions,
        contextTransitions,
        ranked: arcCandidates(h),
      };
    }

    function trackPoles(h) {
      let active = null,
        concentration = null;
      const events = [],
        episodes = [];
      for (let i = 0; i < h.length; i++) {
        const n = h[i];
        if (concentration?.active) {
          if (distance(n, concentration.center) <= 4) {
            concentration.center = n;
            concentration.visits++;
            concentration.outside = 0;
          } else if (++concentration.outside >= 2) concentration.active = false;
        }
        if (active?.active) {
          const previous = distance(...active.anchors),
            expected = 1 - active.lastSide,
            de = distance(n, active.anchors[expected]),
            ds = distance(n, active.anchors[active.lastSide]);
          if (de <= 4 && de <= ds) {
            const interrupted = ![
                "ALTERNÂNCIA",
                "FORMADO",
                "CONVERGÊNCIA",
                "DIVERGÊNCIA",
              ].includes(active.event),
              shift = direction(active.anchors[expected], n);
            active.drift[expected] += shift;
            active.lastShift[expected] = shift;
            active.anchors[expected] = n;
            active.lastSide = expected;
            active.alternations++;
            active.outside = 0;
            active.event = interrupted ? "RETOMADA" : "ALTERNÂNCIA";
          } else if (ds <= 4) {
            const side = active.lastSide,
              shift = direction(active.anchors[side], n);
            active.lastShift[side] = shift;
            active.drift[side] += shift;
            active.anchors[side] = n;
            active.interruptions++;
            active.outside = 0;
            active.event = "INTERRUPÇÃO";
          } else {
            active.outside++;
            active.event = active.outside >= 2 ? "RUPTURA" : "SAÍDA DOS POLOS";
            if (active.outside >= 2) active.active = false;
          }
          active.separation = distance(...active.anchors);
          active.movement =
            active.separation < previous
              ? "CONVERGÊNCIA"
              : active.separation > previous
                ? "DIVERGÊNCIA"
                : "MANUTENÇÃO";
          if (active.active && active.separation <= 4) {
            active.active = false;
            active.event = "FUSÃO";
            concentration = {
              active: true,
              center: n,
              formed: i + 1,
              visits: 1,
              outside: 0,
              origins: [...active.anchors],
            };
          } else if (
            active.active &&
            active.outside === 0 &&
            active.separation <= 6 &&
            active.movement === "CONVERGÊNCIA"
          )
            active.event = "CONVERGÊNCIA";
          if (!active.active) episodes.push(copy(active));
          events.push({
            position: i + 1,
            number: n,
            event: active.event,
            movement: active.movement,
            separation: active.separation,
            anchors: [...active.anchors],
            drift: [...active.drift],
          });
        }
        if (!active?.active && i >= 3) {
          const [a, b, c, d] = h.slice(i - 3, i + 1);
          if (
            distance(a, c) <= 2 &&
            distance(b, d) <= 2 &&
            Math.min(distance(a, b), distance(c, d)) >= 8
          ) {
            active = {
              id: "POLES@" + (i + 1),
              active: true,
              start: i - 2,
              anchors: [c, d],
              initial: [a, b],
              lastSide: 1,
              drift: [direction(a, c), direction(b, d)],
              lastShift: [direction(a, c), direction(b, d)],
              alternations: 2,
              interruptions: 0,
              outside: 0,
              event: "FORMADO",
              movement: "MANUTENÇÃO",
              separation: distance(c, d),
            };
            concentration = null;
            events.push({
              position: i + 1,
              number: n,
              event: "FORMADO",
              movement: active.movement,
              separation: active.separation,
              anchors: [c, d],
              drift: [...active.drift],
            });
          }
        }
      }
      return { active, events, episodes, concentration };
    }

    function chainFeatures(h) {
      if (h.length < 4) return null;
      const [a, b, c, d] = h.slice(-4),
        first = triangleFeatures(a, b, c),
        second = triangleFeatures(b, c, d),
        hops = [direction(a, b), direction(b, c), direction(c, d)],
        route = routeFeatures([a, b, c, d]);
      return {
        numbers: [a, b, c, d],
        hops,
        first,
        second,
        route,
        key:
          first.type +
          ":" +
          nearBand(first.closure) +
          ":" +
          first.trend +
          ">" +
          second.type +
          ":" +
          nearBand(second.closure) +
          ":" +
          second.trend +
          "|L" +
          lengthBand(route.length) +
          "|S" +
          hops.map(Math.sign).join(","),
      };
    }

    const spaceCache = new Map(),
      rawSpaceCache = new Map();

    const COMPONENTS = ["triangle", "chain", "pole", "arc", "route"],
      BASE_SHARES = [0.35, 0.2, 0.15, 0.15, 0.15];

    function rawSpatial(h) {
      const key = h.join(",");
      if (rawSpaceCache.has(key)) return rawSpaceCache.get(key);
      const route = routeRead(h),
        tri = triangleAnalysis(h),
        arcs = trackArcs(h),
        poles = trackPoles(h),
        chain = chainFeatures(h),
        cw = Array(37).fill(1),
        pw = Array(37).fill(1),
        aw = Array(37).fill(1);
      let chainExamples = 0;
      if (chain)
        for (let end = 3; end < h.length - 1; end++) {
          const old = chainFeatures(h.slice(end - 3, end + 1)),
            diff = avg(chain.hops.map((s, j) => Math.abs(s - old.hops[j]))),
            shape =
              (old.first.type === chain.first.type ? 0.5 : 0) +
              (old.second.type === chain.second.type ? 0.5 : 0),
            similarity =
              Math.exp(-diff / 4) *
              (0.25 + 0.75 * shape) *
              (0.5 +
                0.5 *
                  Number(
                    old.route.trends.join(",") === chain.route.trends.join(","),
                  )),
            recency = Math.exp(-(h.length - 2 - end) / 30),
            projected = W[mod(ix(h.at(-1)) + direction(h[end], h[end + 1]))];
          if (similarity > 0.25) chainExamples++;
          for (let j = 0; j < 37; j++)
            cw[j] +=
              similarity * recency * Math.exp(-distance(W[j], projected) / 2);
        }
      const p = poles.active;
      if (p?.active) {
        const expected = 1 - p.lastSide,
          anchor = p.anchors[expected],
          shift = clamp(p.lastShift[expected], -2, 2),
          projected = W[mod(ix(anchor) + shift)],
          strength =
            Math.min(1, p.alternations / 5) *
            (p.event === "SAÍDA DOS POLOS"
              ? 0.25
              : p.event === "INTERRUPÇÃO"
                ? 0.45
                : p.event === "CONVERGÊNCIA"
                  ? 0.6
                  : 1);
        for (let j = 0; j < 37; j++)
          pw[j] +=
            strength *
            (Math.exp(-distance(W[j], anchor) / 2) +
              0.4 * Math.exp(-distance(W[j], projected) / 2));
      }
      const concentration = poles.concentration;
      if (!p?.active && concentration?.active) {
        const strength =
          Math.min(0.7, concentration.visits / 8) / (1 + concentration.outside);
        for (let j = 0; j < 37; j++)
          pw[j] +=
            strength * Math.exp(-distance(W[j], concentration.center) / 2);
      }
      const a = arcs.active;
      let arcEvidence = { hits: 0, total: 0, score: 8 / 37 };
      if (a) {
        const base = 8 / 37,
          b = arcs.contextTransitions[arcContext(a)] || { hits: 0, total: 0 },
          historical = (b.hits + base * 10) / (b.total + 10),
          density = (a.count + base * 8) / (a.total + 8),
          confidence = Math.min(1, a.total / 16) * a.strength,
          sectorMass = clamp(historical * 0.75 + density * 0.25, 0.05, 0.7);
        arcEvidence = { ...b, score: historical };
        for (let j = 0; j < 37; j++) {
          const target = a.numbers.includes(W[j])
            ? (sectorMass * 37) / 8
            : ((1 - sectorMass) * 37) / 29;
          aw[j] = 1 + (target - 1) * confidence;
        }
      }
      const chainWeights = normalizeSpace(cw),
        poleWeights = normalizeSpace(pw),
        arcWeights = normalizeSpace(aw),
        keys = ["T:" + tri.context];
      if (route.triangle) keys.push(route.key);
      if (chain) keys.push("C:" + chain.key);
      if (p?.active)
        keys.push(
          "P:" +
            p.event +
            "|D:" +
            nearBand(p.separation) +
            "|M:" +
            p.movement +
            "|F:" +
            Math.sign(p.drift[0]) +
            "," +
            Math.sign(p.drift[1]),
        );
      else if (concentration?.active)
        keys.push(
          "P:FUSÃO|S:" +
            ix(concentration.center) +
            "|F:" +
            Math.min(2, concentration.outside),
        );
      if (a) keys.push("A:" + arcContext(a));
      else keys.push("A:SEM ARCO ATIVO");
      const r = {
        tri,
        arcs,
        poles,
        chain,
        route,
        chainExamples,
        chainWeights,
        poleWeights,
        arcWeights,
        arcEvidence,
        keys,
        components: [
          tri.weights,
          chainWeights,
          poleWeights,
          arcWeights,
          route.weights,
        ],
      };
      rawSpaceCache.set(key, r);
      if (rawSpaceCache.size > 80)
        rawSpaceCache.delete(rawSpaceCache.keys().next().value);
      return r;
    }

    function adaptiveSpatial(h) {
      const sums = Array(5).fill(0),
        details = [];
      let samples = 0;
      for (let end = Math.max(8, h.length - 24); end < h.length; end++) {
        const r = rawSpatial(h.slice(0, end)),
          n = ix(h[end]);
        for (let k = 0; k < 5; k++)
          sums[k] += clamp(Math.log(Math.max(0.01, r.components[k][n])), -2, 2);
        samples++;
      }
      const confidence = samples / (samples + 16),
        gains = sums.map((s) =>
          Math.exp(
            clamp((samples ? s / samples : 0) * 4 * confidence, -0.5, 0.5),
          ),
        ),
        unnormalized = BASE_SHARES.map((b, k) => b * gains[k]),
        total = unnormalized.reduce((s, n) => s + n, 0),
        shares = unnormalized.map((n) => n / total);
      for (let k = 0; k < 5; k++)
        details.push({
          component: COMPONENTS[k],
          base: BASE_SHARES[k],
          share: shares[k],
          samples,
          meanLogGain: samples ? sums[k] / samples : 0,
        });
      return { shares, details, samples, confidence };
    }

    function spatialRead(h) {
      h = h.slice(-WINDOW);
      const key = h.join(",");
      if (spaceCache.has(key)) return spaceCache.get(key);
      const raw = rawSpatial(h),
        adaptive = adaptiveSpatial(h),
        weights = normalizeSpace(
          W.map((_, j) =>
            raw.components.reduce(
              (s, w, k) => s + w[j] * adaptive.shares[k],
              0,
            ),
          ),
        ),
        r = { ...raw, adaptive, weights: motorReadings667.merge(weights,h), readingVersion:"6.6.13" };
      spaceCache.set(key, r);
      if (spaceCache.size > 40)
        spaceCache.delete(spaceCache.keys().next().value);
      return r;
    }

    function applySpatial(weights, h, strength = 0.3) {
      if (h.length < 3) return weights;
      const r = spatialRead(h),
        scale = avg(weights.map((v) => Math.max(0, v))) || 1,
        reliability = Math.min(1, (h.length - 2) / 20);
      for (let j = 0; j < 37; j++)
        weights[j] = Math.max(
          0.001,
          weights[j] +
            scale * strength * reliability * clamp(r.weights[j] - 1, -0.75, 2),
        );
      return weights;
    }

    function spatialCoverage(play, h) {
      if (!validPlay(play)) return 0;
      const w = spatialRead(h).weights;
      return (
        play.numbers.reduce((s, n) => s + w[ix(n)], 0) /
        w.reduce((s, n) => s + n, 0)
      );
    }

    function spatialMatch(keys, current) {
      if (!keys?.length) return 0;
      const importance = { T: 0.2, C: 0.2, P: 0.2, A: 0.2, R: 0.2 };
      return current.reduce(
        (s, k) => s + (keys.includes(k) ? importance[k[0]] || 0 : 0),
        0,
      );
    }

    function spatialMetrics(rows, h, hit = (r) => r.result !== "LOSS") {
      const keys = spatialRead(h).keys;
      let support = 0,
        weightedHits = 0,
        total = 0,
        hits = 0;
      for (const row of rows) {
        const w = spatialMatch(
          row.spatialKeys || (row.triangleKey ? ["T:" + row.triangleKey] : []),
          keys,
        );
        if (!w) continue;
        support += w;
        total++;
        if (hit(row)) {
          weightedHits += w;
          hits++;
        }
      }
      return {
        total,
        hits,
        loss: total - hits,
        support,
        score: (weightedHits + (28 / 37) * 8) / (support + 8),
      };
    }

    function analyze(h) {
      const transitions = [];
      for (let i = Math.max(1, h.length - 45); i < h.length; i++) {
        const a = h[i - 1],
          b = h[i],
          physical = direction(a, b);
        transitions.push({
          from: a,
          to: b,
          numeric: b - a,
          physical,
          distance: Math.abs(physical),
          mirrorFrom: mirror(a),
          mirrorTo: mirror(b),
        });
      }
      function streak(field) {
        const sign = Math.sign(transitions.at(-1)?.[field] || 0);
        let length = 0;
        if (sign)
          for (let i = transitions.length - 1; i >= 0; i--) {
            if (Math.sign(transitions[i][field]) !== sign) break;
            length++;
          }
        return { dir: sign, length };
      }
      const regions = {};
      for (const name of Object.keys(REGIONS)) {
        let absence = 0;
        for (let i = h.length - 1; i >= 0; i--) {
          if (region(h[i]) === name) break;
          absence++;
        }
        regions[name] = {
          absence,
          recent: h.slice(-12).filter((n) => region(n) === name).length,
        };
      }
      const last3 = transitions.slice(-3),
        previous3 = transitions.slice(-6, -3);
      return {
        transitions,
        last6: transitions.slice(-6),
        numericStreak: streak("numeric"),
        physicalStreak: streak("physical"),
        mean3: avg(last3.map((x) => x.distance)),
        previous3: avg(previous3.map((x) => x.distance)),
        acceleration:
          avg(last3.map((x) => x.distance)) -
          avg(previous3.map((x) => x.distance)),
        regions,
      };
    }

    function weightsFor(h, family, radius) {
      const weights = Array(37).fill(0.01),
        recent = h.slice(-60);
      for (let k = 0; k < recent.length; k++) {
        const p = ix(recent[recent.length - 1 - k]),
          decay = Math.exp(-k / (radius * 2.3));
        for (let j = 0; j < 37; j++) {
          const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
          if (d <= 6) weights[j] += (decay * (7 - d)) / 7;
        }
      }
      if (family.includes("DINAMICO"))
        for (let k = 0; k < Math.min(radius + 2, h.length); k++) {
          const p = ix(h[h.length - 1 - k]);
          for (let j = 0; j < 37; j++) {
            const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
            if (d <= 3) weights[j] += ((4 - d) / (k + 2)) * 1.7;
          }
        }
      if (family.startsWith("RX")) {
        const length = Math.min(radius, h.length - 2),
          matches = [];
        if (length >= 2) {
          for (let i = 0; i + length < h.length - 1; i++) {
            let score = 0;
            for (let j = 0; j < length; j++)
              score +=
                Math.max(0, 6 - distance(h[h.length - length + j], h[i + j])) /
                6;
            matches.push({ score: score / length, next: h[i + length] });
          }
          matches.sort((a, b) => b.score - a.score);
          for (const m of matches.slice(0, 12)) {
            const p = ix(m.next);
            for (let j = 0; j < 37; j++) {
              const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
              if (d <= 3) weights[j] += (4 - d) * m.score * 0.45;
            }
          }
        }
      }
      if (h.length >= 3) {
        const a = analyze(h),
          last = h.at(-1),
          nb =
            a.last6.filter((x) => x.numeric > 0).length -
            a.last6.filter((x) => x.numeric < 0).length,
          pb =
            a.last6.filter((x) => x.physical > 0).length -
            a.last6.filter((x) => x.physical < 0).length,
          expected = clamp(
            Math.round(avg(a.last6.map((x) => x.distance))),
            1,
            18,
          );
        for (const n of W) {
          const pd = direction(last, n),
            d = Math.abs(pd);
          let b = 0;
          if (nb && Math.sign(n - last) === Math.sign(nb)) b += 0.1;
          if (pb && Math.sign(pd) === Math.sign(pb)) b += 0.12;
          if (Math.abs(d - expected) <= 2) b += 0.09;
          if (
            a.numericStreak.length >= 2 &&
            Math.sign(n - last) === a.numericStreak.dir
          )
            b += 0.07;
          if (
            a.physicalStreak.length >= 2 &&
            Math.sign(pd) === a.physicalStreak.dir
          )
            b += 0.07;
          if (a.acceleration >= 3 && d >= 10) b += 0.07;
          if (a.acceleration <= -3 && d <= 5) b += 0.07;
          weights[ix(n)] += (b * radius) / 5;
        }
      }
      return applyReanalysisMemory(motorReadings667.merge(applySpatial(weights,h,
      0.3+(radius-4)*0.035+(family.startsWith("RX")?0.035:0)),h,{family,radius},.12),h);
    }

    const motorDiversityCache = new Map();

    let diversityPool = null;

    let diversitySafety = null;

    const MAX_MOTOR_OVERLAP = 24;

    function coverageCode(play) {
      return [...play.numbers].sort((a, b) => a - b).join(",");
    }

    function population32(n) {
      n = n - ((n >>> 1) & 0x55555555);
      n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
      return (((n + (n >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
    }

    function sharedCoverage(a, b) {
      return 19 + population32(a.low & b.low) + population32(a.high & b.high);
    }

    function gapGeometry(gaps, start) {
      let position = start;
      const blocks = [];
      for (let k = 0; k < 6; k++) {
        const radius = k === 0 ? 1 : 2;
        const center = W[mod(position + radius)];
        blocks.push({ center, radius, numbers: neighbors(center, radius) });
        position += radius * 2 + 1 + gaps[k];
      }
      return { blocks, numbers: blocks.flatMap((b) => b.numbers), score: 0 };
    }

    function motorCoverageAudit(motors) {
      const counts = Array(37).fill(0);
      const candidates = motors.map((m) => diversityCandidate(m.play));
      let maxOverlap = 0;
      for (let i = 0; i < candidates.length; i++) {
        for (const n of candidates[i].play.numbers) counts[n]++;
        for (let j = 0; j < i; j++)
          maxOverlap = Math.max(
            maxOverlap,
            sharedCoverage(candidates[i], candidates[j]),
          );
      }
      return {
        counts,
        covered: counts.filter(Boolean).length,
        distinct: new Set(candidates.map((c) => c.code)).size,
        maxOverlap,
        minCoverage: Math.min(...counts),
        maxCoverage: Math.max(...counts),
      };
    }

    function validMotorEnsemble(motors) {
      if (motors.length !== 12 || !motors.every((m) => validPlay(m.play)))
        return false;
      const a = motorCoverageAudit(motors);
      return (
        a.covered === 37 &&
        a.distinct === 12 &&
        a.maxOverlap <= MAX_MOTOR_OVERLAP
      );
    }

    function diversityCandidates() {
      if (diversityPool) return diversityPool;
      const patterns = [
        [9, 0, 0, 0, 0, 0],
        [6, 3, 0, 0, 0, 0],
        [4, 1, 1, 1, 1, 1],
        [3, 2, 1, 1, 1, 1],
        [3, 3, 3, 0, 0, 0],
        [2, 2, 2, 1, 1, 1],
        [5, 2, 2, 0, 0, 0],
        [4, 3, 2, 0, 0, 0],
      ];
      const shapes = new Map(),
        pool = new Map();
      for (const pattern of patterns)
        for (let rotation = 0; rotation < 6; rotation++) {
          const gaps = pattern.map((_, i) => pattern[(i + rotation) % 6]);
          shapes.set(gaps.join(","), gaps);
          shapes.set([...gaps].reverse().join(","), [...gaps].reverse());
        }
      for (const gaps of shapes.values())
        for (let start = 0; start < 37; start++) {
          const play = gapGeometry(gaps, start);
          if (!validPlay(play)) throw Error("GEOMETRIA DE VARIAÇÃO INVÁLIDA.");
          const candidate = diversityCandidate(play);
          if (!pool.has(candidate.code)) pool.set(candidate.code, candidate);
        }
      diversityPool = [...pool.values()];

      /* Reserva verificada para o caso de a busca por qualidade não concluir.
   Também é escolhida por pesos e rotação comum, antes do resultado. */
      const selected = [],
        counts = Array(37).fill(0);
      for (let k = 0; k < 12; k++) {
        let best = null,
          bestValue = -Infinity;
        for (const candidate of diversityPool) {
          if (
            selected.some(
              (old) => sharedCoverage(old, candidate) > MAX_MOTOR_OVERLAP,
            )
          )
            continue;
          let value = 0;
          for (const n of candidate.play.numbers) value += 1 / (1 + counts[n]);
          if (value > bestValue + 1e-12) {
            best = candidate;
            bestValue = value;
          }
        }
        if (!best)
          throw Error("NÃO FOI POSSÍVEL FORMAR A RESERVA DE VARIAÇÕES.");
        selected.push(best);
        for (const n of best.play.numbers) counts[n]++;
      }
      diversitySafety = selected;
      if (!validMotorEnsemble(selected.map((c) => ({ play: c.play })))) {
        throw Error("RESERVA SEM COBERTURA INTEGRAL DA RODA.");
      }
      return diversityPool;
    }

    function rotatedDiversity(play, shift) {
      const blocks = play.blocks.map((b) => {
        const center = W[mod(ix(b.center) + shift)];
        return {
          center,
          radius: b.radius,
          numbers: neighbors(center, b.radius),
        };
      });
      return { blocks, numbers: blocks.flatMap((b) => b.numbers), score: 0 };
    }

    function diversifyMotors(proposals) {
      const pool = [...diversityCandidates()];
      const seen = new Set(pool.map((c) => c.code));
      for (const m of proposals) {
        const c = diversityCandidate(m.play);
        if (!seen.has(c.code)) {
          pool.push(c);
          seen.add(c.code);
        }
      }
      const normalized = proposals.map((m) => {
        const total = m.weights.reduce((s, v) => s + v, 0) || 1;
        return m.weights.map((v) => v / total);
      });
      const values = normalized.map((weights) =>
        pool.map((c) => c.play.numbers.reduce((s, n) => s + weights[ix(n)], 0)),
      );
      let chosen = null,
        chosenValue = -Infinity;

      /* Ordens diferentes evitam que um único motor defina todas as lacunas. */
      for (const step of [1, 5, 7]) {
        const selected = Array(12).fill(null),
          counts = Array(37).fill(0);
        let failed = false;
        for (let k = 0; k < 12; k++) {
          const index = (k * step) % 12;
          let best = -1,
            bestValue = -Infinity;
          for (let j = 0; j < pool.length; j++) {
            const candidate = pool[j];
            if (
              selected.some(
                (old) =>
                  old && sharedCoverage(old, candidate) > MAX_MOTOR_OVERLAP,
              )
            )
              continue;
            let complementary = 0;
            for (const n of candidate.play.numbers)
              complementary += 1 / (1 + counts[n]);
            const value = values[index][j] + (0.045 * complementary) / 28;
            if (value > bestValue + 1e-12) {
              best = j;
              bestValue = value;
            }
          }
          if (best < 0) {
            failed = true;
            break;
          }
          selected[index] = pool[best];
          for (const n of pool[best].play.numbers) counts[n]++;
        }
        if (failed || counts.some((c) => c === 0)) continue;
        const value = selected.reduce(
          (sum, c, i) =>
            sum + c.play.numbers.reduce((s, n) => s + normalized[i][ix(n)], 0),
          0,
        );
        if (value > chosenValue) {
          chosenValue = value;
          chosen = selected;
        }
      }

      if (!chosen) {
        for (let shift = 0; shift < 37; shift++)
          for (const step of [1, 5, 7]) {
            const selected = proposals.map((_, i) =>
              diversityCandidate(
                rotatedDiversity(diversitySafety[(i * step) % 12].play, shift),
              ),
            );
            const value = selected.reduce(
              (sum, c, i) =>
                sum +
                c.play.numbers.reduce((s, n) => s + normalized[i][ix(n)], 0),
              0,
            );
            if (value > chosenValue) {
              chosenValue = value;
              chosen = selected;
            }
          }
      }

      const result = proposals.map((m, i) => {
        const { weights, ...motor } = m;
        const play = copy(chosen[i].play);
        play.score = play.numbers.reduce((sum, n) => sum + weights[ix(n)], 0);
        return {
          ...motor,
          play,
          score: play.score,
          baseScore: m.score,
          diversity: {
            changed: coverageCode(m.play) !== coverageCode(play),
            maxOverlap: MAX_MOTOR_OVERLAP,
          },
        };
      });
      if (!validMotorEnsemble(result))
        throw Error("FALHA NA VERIFICAÇÃO DOS 12 MOTORES.");
      return result;
    }

    function motors(h) {
      if (h.length < 8) return [];
      h = h.slice(-WINDOW);
      const cacheKey = h.join(",");
      if (motorDiversityCache.has(cacheKey))
        return copy(motorDiversityCache.get(cacheKey));
      const proposals = [],
        s = spatialRead(h);
      for (const family of FAMILIES)
        for (const radius of RADII) {
          const weights = weightsFor(h, family, radius);
          const play = geometry(weights);
          if (!validPlay(play))
            throw Error("MOTOR SEM GEOMETRIA VÁLIDA: " + family + "_" + radius);
          proposals.push({
            key: family + "_" + radius,
            family,
            radius,
            weights,
            score: play.score,
            play,
            triangleKey: triangleContext(h),
            spatialKeys: [...s.keys],
            spatialVersion: VERSION,
          readingVersion:"6.6.13",readingCandidates:37,
            componentShares: [...s.adaptive.shares],
            adaptiveSamples: s.adaptive.samples,
          });
        }
      const result = diversifyMotors(proposals);
      for (const m of result) {
        m.triangleScore = triangleCoverage(m.play, h);
        m.spatialScore = spatialCoverage(m.play, h);
      }
      result.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
      result.forEach((m, i) => {
        m.rank = i + 1;
      });
      motorDiversityCache.set(cacheKey, copy(result));
      if (motorDiversityCache.size > 24)
        motorDiversityCache.delete(motorDiversityCache.keys().next().value);
      return result;
    }

    function generateNumberCombination(h) {
      if (h.length < 8) return null;
      const trigger = h.at(-1),
        weights = Array(37).fill(0.02),
        recent = h.slice(-60);
      for (let k = 0; k < recent.length; k++) {
        const p = ix(recent[recent.length - 1 - k]),
          decay = Math.exp(-k / 18);
        for (let j = 0; j < 37; j++) {
          const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
          if (d <= 5) weights[j] += (decay * (6 - d)) / 6;
        }
      }
      if (h.length >= 2) {
        const expected = mod(ix(trigger) + direction(h.at(-2), trigger));
        for (let j = 0; j < 37; j++) {
          const d = Math.min(
            Math.abs(expected - j),
            37 - Math.abs(expected - j),
          );
          if (d <= 4) weights[j] += (5 - d) * 0.14;
        }
      }
      for (let i = 0; i < h.length - 1; i++) {
        if (h[i] !== trigger) continue;
        const p = ix(h[i + 1]),
          decay = Math.exp(-(h.length - 1 - i) / 28);
        for (let j = 0; j < 37; j++) {
          const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
          if (d <= 3) weights[j] += ((decay * (4 - d)) / 4) * 0.9;
        }
      }
      applySpatial(weights, h, 0.35);
      const play = geometry(weights);
      return validPlay(play)
        ? {
            key: "NUMERO_GERADO_" + trigger,
            name: "COMBINAÇÃO DO " + trigger,
            trigger,
            score: play.score,
            spatialScore: spatialCoverage(play, h),
            play,
          }
        : null;
    }

    function registerNumberCombination(h, turn) {
      const g = generateNumberCombination(h);
      if (g)
        state.numberCombinations.push({
          id: "NC_" + turn,
          turn,
          origin: g.trigger,
          motor: g.key,
          play: copy(g.play),
          centers: g.play.blocks.map((b) => b.center),
          covered: [...g.play.numbers],
          triangleKey: triangleContext(h),
          spatialKeys: [...spatialRead(h).keys],
        });
    }

    function numberTransitions(h, trigger) {
      const rows = [];
      for (let i = 0; i < h.length - 1; i++)
        if (h[i] === trigger)
          rows.push({
            next: h[i + 1],
            age: h.length - 1 - i,
            position: i + 2,
            triggerPosition: i + 1,
          });
      return rows;
    }

    function compareNumberCombination(record, trigger, h) {
      const transitions = numberTransitions(h, trigger),
        covered = new Set(record.covered),
        matchedNumbers = [],
        missedNumbers = [];
      let matches = 0,
        weightedMatches = 0,
        totalWeight = 0;
      for (const t of transitions) {
        const w = Math.exp(-t.age / 35);
        totalWeight += w;
        if (covered.has(t.next)) {
          matches++;
          weightedMatches += w;
          matchedNumbers.push(t.next);
        } else missedNumbers.push(t.next);
      }
      const total = transitions.length,
        base = 28 / 37,
        historical = (matches + base * 3) / (total + 3),
        recent = (weightedMatches + base * 2) / (totalWeight + 2),
        numericalScore = historical * 0.65 + recent * 0.35,
        spatialScore = spatialCoverage(record.play, h);
      return {
        ...record,
        trigger,
        total,
        matches,
        misses: total - matches,
        weightedMatches,
        numericalScore,
        triangleScore: triangleCoverage(record.play, h),
        spatialScore,
        score: numericalScore * 0.75 + spatialScore * 0.25,
        matchedNumbers,
        missedNumbers,
      };
    }

    function rankNumberCombinations(h, trigger = h.at(-1)) {
      return trigger == null
        ? []
        : state.numberCombinations
            .filter((r) => validPlay(r.play))
            .map((r) => compareNumberCombination(r, trigger, h))
            .sort(
              (a, b) =>
                b.score - a.score || b.matches - a.matches || b.turn - a.turn,
            );
    }

    function bestNumberCombination(h) {
      if (h.length < 8) return null;
      const trigger = h.at(-1),
        best = rankNumberCombinations(h, trigger)[0];
      return best
        ? {
            key: "NUM_T" + best.turn + "_N" + best.origin,
            name: "COMBINAÇÃO DO " + best.origin,
            rank: 0,
            score: best.score,
            spatialScore: best.spatialScore,
            sourceNumber: best.origin,
            sourceTurn: best.turn,
            trigger,
            matches: best.matches,
            tests: best.total,
            play: copy(best.play),
            type: "NUMBER",
          }
        : null;
    }

    function updateNumberChoice() {
      const s = bestNumberCombination(state.history);
      if (!s) {
        state.numberChoice = null;
        return null;
      }
      const old = state.numberChoice;
      if (old && (old.sourceTurn !== s.sourceTurn || old.trigger !== s.trigger))
        state.numberChanges++;
      state.numberChoice = {
        trigger: s.trigger,
        sourceNumber: s.sourceNumber,
        sourceTurn: s.sourceTurn,
        motor: s.key,
        score: s.score,
        matches: s.matches,
        tests: s.tests,
        spatialScore: s.spatialScore,
        play: copy(s.play),
      };
      return s;
    }

    function recordNumberComparison(before, n, turn) {
      const trigger = before.at(-1),
        s = bestNumberCombination(before);
      if (trigger == null || !s) return;
      state.numberComparisons.push({
        turn,
        trigger,
        sourceNumber: s.sourceNumber,
        sourceTurn: s.sourceTurn,
        next: n,
        covered: s.play.numbers.includes(n),
        centers: s.play.blocks.map((b) => b.center),
        triangleKey: triangleContext(before),
        spatialKeys: [...spatialRead(before).keys],
      });
    }

    function definitions() {
      return [
        ...ORIGINALS.map(([rule, name]) => ({
          id: "ORIGINAL:" + rule,
          name,
          rule,
          type: "ORIGINAL",
        })),
        ...Array.from({ length: 4 }, (_, i) => ({
          id: "RANK:" + (i + 1),
          name: "AUTO " + (i + 1) + "º",
          rank: i + 1,
          type: "RANK",
        })),
        ...ADAPTATIVES.map((config) => ({
          id: "ADAPTIVE:" + config.id,
          name: config.name,
          config,
          type: "ADAPTIVE",
        })),
        ...state.created.map((c) => ({
          id: "CREATED:" + c.id,
          name: c.name,
          config: c.config,
          type: "CREATED",
        })),
      ];
    }

    function motorRate(key, limit = 12) {
      if (key.includes("::")) return variantMotorRate(key, limit);
      const available = state.ledger.filter(
          (r) => r.motorHits && key in r.motorHits,
        ),
        rows = available.slice(-limit);
      if (!rows.length) return 0.5;
      const global = rows.filter((r) => r.motorHits[key]).length / rows.length,
        local = spatialMetrics(
          available,
          state.history,
          (r) => !!r.motorHits[key],
        ),
        w = (0.4 * local.support) / (local.support + 8);
      return global * (1 - w) + local.score * w;
    }

    function chooseMotor(def, cs, previous) {
      if (!cs.length) return null;
      const fixed = cs[clamp(state.rank - 1, 0, cs.length - 1)];
      if (def.rank) return cs[clamp(def.rank - 1, 0, cs.length - 1)];
      if (def.rule === "FIXED") return chooseAutoMotor(cs);
      if (def.config) {
        const c = def.config,
          ranked = cs
            .filter((m) => m.rank <= c.maxRank)
            .map((m) => ({
              motor: m,
              score:
                motorRate(m.key, 3) * 0.55 + motorRate(m.key, c.window) * 0.45,
            }))
            .sort((a, b) => b.score - a.score || a.motor.rank - b.motor.rank),
          best = ranked[0],
          old = ranked.find((x) => x.motor.key === previous);
        if (old && best && best.score < old.score + c.margin) return old.motor;
        return best?.motor || fixed;
      }
      if (def.rule === "GEO") return cs[0];
      if (def.rule === "BEST")
        return [...cs].sort(
          (a, b) => motorRate(b.key, 20) - motorRate(a.key, 20),
        )[0];
      if (def.rule === "STABLE")
        return cs.find((m) => m.key === previous && m.rank <= 5) || fixed;
      if (def.rule === "SWITCH") {
        const old = cs.find((m) => m.key === previous) || fixed,
          best = [...cs].sort(
            (a, b) => motorRate(b.key, 12) - motorRate(a.key, 12),
          )[0];
        return motorRate(best.key, 12) > motorRate(old.key, 12) + 0.12
          ? best
          : old;
      }
      if (["CONSENSUS", "UNION"].includes(def.rule)) {
        const w = Array(37).fill(0),
          selected = def.rule === "UNION" ? cs.slice(0, 3) : cs;
        for (const m of selected)
          for (const n of m.play.numbers) w[ix(n)] += 1 / (1 + m.rank * 0.1);
        applySpatial(w, state.history, 0.25);
        const play = geometry(w);
        if (play)
          return {
            key: def.rule,
            rank: 0,
            score: play.score,
            spatialScore: spatialCoverage(play, state.history),
            spatialKeys: [...spatialRead(state.history).keys],
            play,
          };
      }
      return fixed;
    }

    function fineG1(original, trigger, h = state.history) {
      if (!validPlay(original?.play)) return null;
      const w = Array(37).fill(0.01),
        mandatory = neighbors(trigger, 1);
      for (const n of original.play.numbers) w[ix(n)] += 100;
      applySpatial(w, h, 0.2);
      for (const n of mandatory) w[ix(n)] += 100000;
      const play = geometry(w, mandatory);
      return play
        ? {
            key: original.key,
            rank: original.rank,
            play,
            spatialScore: spatialCoverage(play, h),
          }
        : copy(original);
    }

    function g1History(strategy = null, mode = null, limit = 400) {
      return state.g1Rows
        .filter(
          (r) =>
            (strategy == null || r.strategy === strategy) &&
            (mode == null || r.mode === mode),
        )
        .slice(-limit);
    }

    function uniqueGales(strategy = null, limit = 100) {
      const map = new Map();
      for (const r of g1History(strategy, null, 5000)) {
        const k = r.strategy + "|" + r.eventId;
        if (!map.has(k)) map.set(k, r);
      }
      return [...map.values()].slice(-limit);
    }

    function numberG1Rows(strategy, trigger, mode = null, limit = 200) {
      return state.g1Rows
        .filter(
          (r) =>
            r.strategy === strategy &&
            r.trigger === trigger &&
            (mode == null || r.mode === mode),
        )
        .slice(-limit);
    }

    function numberG1Metrics(strategy, trigger, mode, limit = 100) {
      const rows = numberG1Rows(strategy, trigger, mode, limit),
        hits = rows.filter((r) => r.hit).length;
      return {
        total: rows.length,
        hits,
        loss: rows.length - hits,
        rate: rows.length ? hits / rows.length : null,
      };
    }

    function numberG1Events(strategy, trigger, limit = 100) {
      const map = new Map();
      for (const r of numberG1Rows(strategy, trigger, null, 1000))
        if (!map.has(r.eventId)) map.set(r.eventId, r);
      return [...map.values()].slice(-limit);
    }

    function behaviorReading(original, h, strategy, trigger = null) {
      const rows = uniqueGales(strategy, 45),
        recent = rows.slice(-12),
        last6 = rows.slice(-6),
        loss12 = recent.filter((r) => !r.hit).length,
        loss6 = last6.filter((r) => !r.hit).length,
        uncovered = new Set(missing(original.play)),
        outside6 = h.slice(-6).filter((n) => uncovered.has(n)).length;
      let streak = 0;
      for (let i = rows.length - 1; i >= 0; i--) {
        if (rows[i].hit) break;
        streak++;
      }
      const nr = trigger == null ? [] : numberG1Events(strategy, trigger, 20),
        recentN = nr.slice(-8),
        numberLoss = recentN.filter((r) => !r.hit).length;
      let type = "CONTINUIDADE";
      if (
        streak >= 3 ||
        (last6.length >= 5 && loss6 / last6.length >= 0.6) ||
        (h.length >= 6 && outside6 >= 4) ||
        (recentN.length >= 4 && numberLoss / recentN.length >= 0.6)
      )
        type = "RUPTURA";
      else if (
        (recent.length >= 5 && loss12 / recent.length >= 0.32) ||
        outside6 >= 2 ||
        (recentN.length >= 3 && numberLoss / recentN.length >= 0.34)
      )
        type = "DESLOCAMENTO";
      const s = spatialRead(h);
      return {
        type,
        streak,
        outside6,
        loss12,
        total12: recent.length,
        loss6,
        total6: last6.length,
        numberTotal: recentN.length,
        numberLoss,
        numberHit: recentN.length - numberLoss,
        triangle: s.tri.last?.labels.join(" + ") || "SEM TRINCA",
        poles: s.poles.active?.event || "SEM POLOS",
        arc: s.arcs.active
          ? s.arcs.active.health + " / " + s.arcs.active.event
          : s.arcs.last?.event || "SEM ARCO",
      };
    }

    function reconstructG1(original, trigger, h, strategy) {
      if (!validPlay(original?.play)) return null;
      const r = behaviorReading(original, h, strategy, trigger),
        w = Array(37).fill(0.1),
        recent = h.slice(-60),
        gales = g1History(strategy, null, 180),
        transitions = numberTransitions(h, trigger);
      for (const n of W) {
        const f60 = recent.filter((x) => x === n).length,
          f24 = h.slice(-24).filter((x) => x === n).length,
          f8 = h.slice(-8).filter((x) => x === n).length,
          losses = gales.filter((row) => !row.hit && row.outcome === n).length,
          conditional = transitions.reduce(
            (s, t) => s + (t.next === n ? Math.exp(-t.age / 35) : 0),
            0,
          );
        let v =
          f60 * 0.3 +
          f24 * 0.55 +
          f8 * 0.85 +
          losses * 0.35 +
          conditional * 2.2;
        if (r.type === "DESLOCAMENTO") v += f8 * 0.35 + conditional * 0.35;
        if (r.type === "RUPTURA")
          v += f8 * 0.6 + losses * 0.45 + conditional * 0.65;
        w[ix(n)] += v;
      }
      for (let k = 0; k < recent.length; k++) {
        const p = ix(recent[recent.length - 1 - k]),
          decay = Math.exp(-k / (r.type === "RUPTURA" ? 8 : 14));
        for (let j = 0; j < 37; j++) {
          const d = Math.min(Math.abs(p - j), 37 - Math.abs(p - j));
          if (d <= 3) w[j] += ((decay * (4 - d)) / 4) * 0.65;
        }
      }
      for (const n of neighbors(trigger, 2)) w[ix(n)] += 0.4;
      applySpatial(w, h, 0.4);
      const play = geometry(w);
      return validPlay(play)
        ? {
            key: "G1_INDEPENDENTE",
            rank: 0,
            play,
            behavior: r.type,
            spatialScore: spatialCoverage(play, h),
          }
        : null;
    }

    function defenses(original, trigger, h, strategy) {
      if (!validPlay(original?.play)) return [];
      const r = behaviorReading(original, h, strategy, trigger),
        recon = reconstructG1(original, trigger, h, strategy);
      return [
        { mode: "CONGELADA", motor: copy(original), behavior: r.type },
        {
          mode: "AJUSTE FINO",
          motor: fineG1(original, trigger, h),
          behavior: r.type,
        },
        ...(recon
          ? [{ mode: "RECONSTRUÇÃO", motor: recon, behavior: r.type }]
          : []),
      ];
    }

    function defenseMetrics(strategy, mode, limit = 100) {
      const rows = g1History(strategy, mode, limit),
        hits = rows.filter((r) => r.hit).length;
      return {
        total: rows.length,
        hits,
        loss: rows.length - hits,
        rate: rows.length ? hits / rows.length : null,
      };
    }

    function rankDefenses(options, strategy, h, trigger = null) {
      return options
        .map((o) => {
          const rows = g1History(strategy, o.mode, 100),
            recent = rows.slice(-12),
            hits = rows.filter((r) => r.hit).length,
            hits12 = recent.filter((r) => r.hit).length,
            base = 28 / 37,
            historical = (hits + base * 12) / (rows.length + 12),
            short = (hits12 + base * 8) / (recent.length + 8),
            coverage = h.length
              ? h.slice(-18).filter((n) => o.motor.play.numbers.includes(n))
                  .length / Math.min(18, h.length)
              : base,
            byNumber =
              trigger == null
                ? { total: 0, hits: 0, loss: 0 }
                : numberG1Metrics(strategy, trigger, o.mode, 100),
            conditional = (byNumber.hits + base * 8) / (byNumber.total + 8);
          let bonus = 0;
          if (o.behavior === "CONTINUIDADE" && o.mode === "CONGELADA")
            bonus = 0.012;
          if (o.behavior === "DESLOCAMENTO" && o.mode === "AJUSTE FINO")
            bonus = 0.01;
          if (o.behavior === "RUPTURA" && o.mode === "RECONSTRUÇÃO")
            bonus = 0.02;
          const nw =
              trigger == null
                ? 0
                : Math.min(0.48, byNumber.total / (byNumber.total + 8)),
            global = historical * 0.55 + short * 0.25 + coverage * 0.2,
            original = global * (1 - nw) + conditional * nw + bonus,
            spatialScore = spatialCoverage(o.motor.play, h),
            local = spatialMetrics(rows, h, (r) => r.hit),
            lw = (0.2 * local.support) / (local.support + 8),
            combined = original * 0.8 + spatialScore * 0.2;
          return {
            ...o,
            score: combined * (1 - lw) + local.score * lw,
            spatialScore,
            contextTotal: local.total,
            total: rows.length,
            hits,
            loss: rows.length - hits,
            numberTotal: byNumber.total,
            numberHits: byNumber.hits,
            numberLoss: byNumber.loss,
            numberScore: conditional,
            uncovered: missing(o.motor.play),
          };
        })
        .sort((a, b) => b.score - a.score || b.numberTotal - a.numberTotal);
    }

    function chooseG1(original, trigger, h, strategy) {
      const ranked = rankDefenses(
        defenses(original, trigger, h, strategy),
        strategy,
        h,
        trigger,
      );
      if (!ranked.length) return null;
      let c = ranked[0];
      const frozen = ranked.find((x) => x.mode === "CONGELADA");
      if (
        frozen &&
        c !== frozen &&
        c.total < 8 &&
        c.numberTotal < 4 &&
        c.score - frozen.score < 0.025
      )
        c = frozen;
      return {
        motor: copy(c.motor),
        mode: c.mode,
        behavior: c.behavior,
        score: c.score,
        spatialScore: c.spatialScore,
        triangleKey: triangleContext(h),
        spatialKeys: [...spatialRead(h).keys],
        numberTotal: c.numberTotal,
        numberHits: c.numberHits,
        numberLoss: c.numberLoss,
        uncovered: c.uncovered,
        alternatives: ranked.map((o) => ({
          mode: o.mode,
          score: o.score,
          spatialScore: o.spatialScore,
          contextTotal: o.contextTotal,
          total: o.total,
          hits: o.hits,
          loss: o.loss,
          numberTotal: o.numberTotal,
          numberHits: o.numberHits,
          numberLoss: o.numberLoss,
        })),
      };
    }

    function virtualCycle(id) {
      return (
        state.virtual[id] ||
        (state.virtual[id] = {
          phase: "ENTRY",
          previous: null,
          defense: null,
          entry: null,
          trigger: null,
          entryTrigger: null,
          triangleKey: null,
          spatialKeys: [],
        })
      );
    }

    function profit(result) {
      const u = Number(state.stake) || 1,
        g = Number(state.multiplier) || 1;
      return result === "GREEN"
        ? 8 * u
        : result === "GREEN G1"
          ? (8 * g - 28) * u
          : result === "LOSS"
            ? -28 * (1 + g) * u
            : 0;
    }

    function settlePending(n, turn) {
      for (const p of state.g1Pending)
        state.g1Rows.push({
          turn,
          eventId: p.eventId,
          strategy: p.strategy,
          mode: p.mode,
          behavior: p.behavior,
          trigger: p.trigger,
          outcome: n,
          hit: p.numbers.includes(n),
          uncovered: p.uncovered,
          entryMotor: p.entryMotor || null,
          triangleKey: p.triangleKey || "SEM TRINCA",
          spatialKeys: copy(p.spatialKeys || []),
        });
      state.g1Pending = [];
    }

    function standardDecision(motor, n, h, strategy) {
      return state.g1Trainer
        ? chooseG1(motor, n, h, strategy)
        : {
            motor: state.g1 ? fineG1(motor, n, h) : copy(motor),
            mode: state.g1 ? "AJUSTE FINO" : "CONGELADA",
            behavior: behaviorReading(motor, h, strategy, n).type,
            triangleKey: triangleContext(h),
            spatialKeys: [...spatialRead(h).keys],
          };
    }

    function openRealGale(motor, n, after, turn) {
      const strategy = state.cycle.strategy;
      state.cycle.trigger = n;
      const d = standardDecision(motor, n, after, strategy);
      state.cycle.decision = d;
      state.defense = copy(d?.motor || motor);
      state.phase = state.galeSkip ? "GALE_SKIP" : "GALE";
      state.decisions.push({
        turn,
        strategy,
        mode: d?.mode || "CONGELADA",
        behavior: d?.behavior || "CONTINUIDADE",
        trigger: n,
        numberTests: d?.numberTotal || 0,
        triangleKey: d?.triangleKey,
        spatialKeys: copy(d?.spatialKeys || []),
      });
    }

    function undoSnapshot() {
      const { undoStack, ...data } = state;
      return copy(data);
    }

    function inverseChanges(before, after, path = [], ops = []) {
      if (JSON.stringify(before) === JSON.stringify(after)) return ops;
      if (Array.isArray(before) && Array.isArray(after)) {
        const a = before.map((v) => JSON.stringify(v)),
          b = after.map((v) => JSON.stringify(v));
        let drop = -1;
        for (let d = 0; d <= a.length; d++) {
          const count = a.length - d;
          if (count > b.length) continue;
          if (count && a[d] !== b[0]) continue;
          let equal = true;
          for (let j = 0; j < count; j++)
            if (a[d + j] !== b[j]) {
              equal = false;
              break;
            }
          if (equal) {
            drop = d;
            break;
          }
        }
        const shared = a.length - drop;
        ops.push({
          kind: "slide",
          path: [...path],
          removeTail: after.length - shared,
          restoreHead: copy(before.slice(0, drop)),
        });
        return ops;
      }
      if (
        before &&
        after &&
        typeof before === "object" &&
        typeof after === "object" &&
        !Array.isArray(before) &&
        !Array.isArray(after)
      ) {
        for (const k of new Set([
          ...Object.keys(before),
          ...Object.keys(after),
        ])) {
          if (!(k in before)) ops.push({ kind: "delete", path: [...path, k] });
          else if (!(k in after))
            ops.push({
              kind: "set",
              path: [...path, k],
              value: copy(before[k]),
            });
          else inverseChanges(before[k], after[k], [...path, k], ops);
        }
        return ops;
      }
      ops.push({ kind: "set", path: [...path], value: copy(before) });
      return ops;
    }

    function applyInverse(ops) {
      for (const op of ops) {
        let parent = state;
        for (const k of op.path.slice(0, -1)) parent = parent[k];
        const key = op.path.at(-1);
        if (op.kind === "slide") {
          const a = parent[key];
          if (op.removeTail) a.splice(a.length - op.removeTail, op.removeTail);
          a.unshift(...copy(op.restoreHead));
        } else if (op.kind === "delete") delete parent[key];
        else parent[key] = copy(op.value);
      }
    }

    function waitFrame() {
      return new Promise((r) => requestAnimationFrame(() => r()));
    }

    function parseInput(text) {
      return (String(text).match(/\d+/g) || [])
        .map(Number)
        .filter((n) => Number.isInteger(n) && n >= 0 && n <= 36);
    }

    const VARIANT_OWNERS = [
      ...ORIGINALS.map(([id, name]) => ({ id, name })),
      { id: "NUMBER", name: "TREINADOR GLOBAL NÚMEROS" },
    ];

    const VARIANT_PROFILES = [
      { name: "EQUILÍBRIO", decay: 18, space: [1, 1, 1, 1, 1], recent: 0.18 },
      {
        name: "RECENTE",
        decay: 5,
        space: [1.4, 1.2, 0.6, 0.6, 1.2],
        recent: 0.95,
      },
      {
        name: "ESTABILIDADE",
        decay: 36,
        space: [0.8, 0.8, 1.1, 1.5, 0.8],
        recent: 0.12,
      },
      {
        name: "PERCURSO",
        decay: 12,
        space: [0.9, 1.5, 0.6, 0.6, 2.2],
        recent: 0.35,
      },
      {
        name: "TRIANGULAÇÃO",
        decay: 16,
        space: [2.3, 1.6, 0.5, 0.5, 1],
        recent: 0.25,
      },
      {
        name: "POLOS E ARCOS",
        decay: 24,
        space: [0.6, 0.7, 2.4, 2.1, 0.6],
        recent: 0.25,
      },
      {
        name: "RETORNO",
        decay: 10,
        space: [1.5, 0.8, 1.5, 0.6, 1.3],
        recent: 0.45,
      },
      {
        name: "AMPLITUDE",
        decay: 8,
        space: [1, 1.4, 0.6, 1.1, 2],
        recent: 0.65,
      },
    ];

    const variantForecastCache = new Map();

    let variantEvaluationContext = null;

    let strategyButtonsSignature = null;

    function variantBookId(owner, variation) {
      return owner + "@V" + variation;
    }

    function variantBook(owner, variation) {
      const id = variantBookId(owner, variation);
      return (
        state.variantBooks[id] ||
        (state.variantBooks[id] = {
          rows: [],
          previous: null,
          autoRank: 1,
          combinations: [],
          cycle: null,
        })
      );
    }

    function variantAnalyticalWeights(
      h,
      family,
      radius,
      owner,
      variation,
      base,
      spatial,
      shared,
    ) {
      const profile = VARIANT_PROFILES[variation - 1];
      const ownerIndex = VARIANT_OWNERS.findIndex((o) => o.id === owner);
      const normalized = normalizeSpace(base);
      const additiveKey = owner + "@" + variation + ":" + radius;
      const coefficient = 0.78 + 0.035 * ownerIndex;
      if (shared?.additive.has(additiveKey)) {
        const item = shared.additive.get(additiveKey);
        const raw = normalized.map((v, j) => v * coefficient + item.weights[j]);
        const mean = avg(raw) || 1;
        return {
          weights: raw.map((v) => v / mean),
          poolScores: item.scores.map(
            (v, j) =>
              (v + coefficient * shared.base.get(family + "_" + radius)[j]) /
              mean,
          ),
        };
      }
      const shares = profile.space.map(
        (v, k) => v * spatial.adaptive.shares[k],
      );
      const shareTotal = shares.reduce((s, v) => s + v, 0);
      const recent = Array(37).fill(0.01);
      const decay = profile.decay * (0.85 + ownerIndex * 0.065);
      for (let age = 0; age < h.length; age++) {
        const center = h[h.length - 1 - age],
          mass = Math.exp(-age / decay);
        for (let j = 0; j < 37; j++) {
          const d = distance(center, W[j]);
          if (d <= radius)
            recent[j] += (mass * (radius + 1 - d)) / (radius + 1);
        }
      }
      const recency = normalizeSpace(recent);
    const completeWeights667=motorReadings667.weights(h,{variation,radius});
      const last = h.at(-1),
        prior = h.at(-2);
      const jump = prior == null ? 0 : direction(prior, last);
      const returnCenter = prior == null ? last : prior;
      const projected = W[mod(ix(last) + jump)];
      const amplitude = clamp(
        Math.round(spatial.route.triangle?.amplitude || Math.abs(jump)),
        1,
        18,
      );
      // Hipóteses espaciais distintas, definidas antes do resultado. Não são o
      // trajeto físico da bola nem uma rotação posterior de uma jogada já pronta.
      const offsets = [0, -3, 3, -6, 6, -10, 10, 18];
      const hypothesis = W[mod(ix(projected) + offsets[variation - 1])];
      const additive = W.map((n, j) => {
        const mixed = spatial.components.reduce(
          (sum, w, k) => sum + (w[j] * shares[k]) / shareTotal,
          0,
        );
        let value = mixed * 0.65 + recency[j] * profile.recent;
      value+=.18*(completeWeights667[j]-1);
        value +=
          1.8 * Math.exp(-distance(n, hypothesis) / (1.6 + (radius - 4) * 0.4));
        if (variation === 4)
          value += 0.5 * Math.exp(-distance(n, projected) / 2);
        if (variation === 7)
          value += 0.8 * Math.exp(-distance(n, returnCenter) / 2);
        if (variation === 8)
          value +=
            0.65 * Math.exp(-Math.abs(distance(last, n) - amplitude) / 2);
        if (owner === "NUMBER") {
          for (let i = 0; i < h.length - 1; i++)
            if (h[i] === last) {
              value +=
                Math.exp(-(h.length - 2 - i) / (decay + 8)) *
                Math.exp(-distance(n, h[i + 1]) / (1.5 + (variation % 3))) *
                2;
            }
        }
        return value;
      });
      const raw = normalized.map((v, j) =>
        Math.max(0.001, v * coefficient + additive[j]),
      );
      if (!shared) return normalizeSpace(raw);
      const scores = diversityCandidates().map((c) =>
        candidateFit(c, additive),
      );
      shared.additive.set(additiveKey, { weights: additive, scores });
      const mean = avg(raw) || 1;
      return {
        weights: raw.map((v) => v / mean),
        poolScores: scores.map(
          (v, j) =>
            (v + coefficient * shared.base.get(family + "_" + radius)[j]) /
            mean,
        ),
      };
    }

    function candidateFit(candidate, weights) {
      let sum = 0;
      const indices =
        candidate.indices ||
        (candidate.indices = candidate.play.numbers.map(ix));
      for (let k = 0; k < indices.length; k++) sum += weights[indices[k]];
      return sum;
    }

    function variantMotorRate(key, limit = 12) {
      const id = key.split("::")[0];
      const motorKey = key.split("::")[1];
      const available = state.variantBooks[id]?.rows || [];
      const rows = available.slice(-limit);
      if (!rows.length) return 0.5;
      const global =
        rows.filter((r) => r.motorHits[motorKey]).length / rows.length;
      const local = spatialMetrics(
        available,
        state.history,
        (r) => !!r.motorHits[motorKey],
      );
      const weight = (0.4 * local.support) / (local.support + 8);
      return global * (1 - weight) + local.score * weight;
    }

    function variantAutoChoice(cs) {
      const book = variantEvaluationContext;
      const ranked = cs
        .slice(0, 4)
        .map((motor, i) => {
          const rows = book.rows.slice(-30),
            recent = rows.slice(-5),
            rank = i + 1;
          const direct =
            (rows.filter((r) => r.rankHits[rank]).length + (4 * 28) / 37) /
            (rows.length + 4);
          const short =
            (recent.filter((r) => r.rankHits[rank]).length + (2 * 28) / 37) /
            (recent.length + 2);
          return { motor, rank, score: direct * 0.55 + short * 0.45 };
        })
        .sort((a, b) => b.score - a.score || a.rank - b.rank);
      const current = ranked.find((r) => r.rank === book.autoRank);
      const best =
        current && ranked[0].score - current.score < 0.012
          ? current
          : ranked[0];
      return { ...best.motor, autoRank: best.rank };
    }

    function chooseVariant(owner, variation, cs, h) {
      const id = variantBookId(owner, variation);
      const book = state.variantBooks[id] || {
        rows: [],
        previous: null,
        autoRank: 1,
        combinations: [],
      };
      if (owner === "NUMBER") {
        const trigger = h.at(-1);
        const choices = [
          ...cs.map((m) => ({ motor: m, record: null })),
          ...book.combinations
            .filter((r) => validPlay(r.play))
            .map((record) => ({
              motor: {
                key: id + "::NUM@" + record.turn,
                rank: 0,
                play: record.play,
                score: record.play.score,
              },
              record,
            })),
        ];
        const ranked = choices
          .map((item) => {
            const record = item.record || {
              play: item.motor.play,
              covered: item.motor.play.numbers,
              turn: state.totalTurns,
              origin: trigger,
            };
            const comparison = compareNumberCombination(record, trigger, h);
            return { ...item, score: comparison.score };
          })
          .sort((a, b) => b.score - a.score || b.motor.score - a.motor.score);
        return {
          ...copy(ranked[0].motor),
          bankId: id,
          owner,
          variation,
          type: "NUMBER",
          trigger,
          sourceNumber: ranked[0].record?.origin ?? trigger,
          sourceTurn: ranked[0].record?.turn ?? state.totalTurns,
        };
      }
      variantEvaluationContext = book;
      try {
        const motor = chooseMotor({ rule: owner }, cs, book.previous);
        return { ...copy(motor), bankId: id, owner, variation };
      } finally {
        variantEvaluationContext = null;
      }
    }

    function activeVariationOwner() {
      return VARIANT_OWNERS.some((o) => o.id === state.strategy)
        ? state.strategy
        : null;
    }

    function settleVariantForecasts(forecasts, n, turn, before) {
      for (const f of forecasts) {
        const book = variantBook(f.owner, f.variation),
          motorHits = {},
          rankHits = {};
        for (const m of f.motors) {
          const motorKey = m.family + "_" + m.radius;
          motorHits[motorKey] = m.play.numbers.includes(n);
          if (m.rank <= 4) rankHits[m.rank] = motorHits[motorKey];
        }
        book.rows.push({
          turn,
          motorHits,
          rankHits,
          entryHit: f.choice.play.numbers.includes(n),
          selectedKey: f.choice.key,
          spatialKeys: [...spatialRead(before).keys],
        });
        book.rows = book.rows.slice(-WINDOW);
        book.previous = f.choice.key;
        book.autoRank = f.choice.autoRank || book.autoRank;
        if (f.owner === "NUMBER") {
          const generated = f.motors[0];
          book.combinations.push({
            turn: turn - 1,
            origin: before.at(-1),
            play: copy(generated.play),
            covered: [...generated.play.numbers],
          });
          book.combinations = book.combinations.slice(-WINDOW);
        }
      }
    }

    function breakdown(strategy = null, mode = "CONGELADA") {
      const out = {
        CONTINUIDADE: { total: 0, hits: 0 },
        DESLOCAMENTO: { total: 0, hits: 0 },
        RUPTURA: { total: 0, hits: 0 },
      };
      for (const r of g1History(strategy, mode, 5000)) {
        const v = out[r.behavior];
        if (!v) continue;
        v.total++;
        if (r.hit) v.hits++;
      }
      return out;
    }
    /* ANÁLISES A CADA RESULTADO; RETIRADA DO HISTÓRICO EM BLOCOS DE DEZ. A entrada e o G1 comprometidos permanecem
   congelados. A avaliação de cada resultado usa somente a previsão anterior. */
    let blockRuntimeKey = null;
    let blockRuntimeData = null;
    let workerClient = null;
    let workerDisabled = false;
    let clientSequence = 0;
    let clientRequests = new Map();
    let inputQueue = [];
    let inputRunning = false;
    let saveTimer = null;
    let lastInputMs = 0;
    let durableTurn = 0;
    const geometryMemo = new Map();

    function geometry(weights, mandatory = []) {
      const key = weights.join(",") + "|" + mandatory.join(",");
      if (geometryMemo.has(key)) return copy(geometryMemo.get(key));
      const play = rawGeometry(weights, mandatory);
      geometryMemo.set(key, copy(play));
      if (geometryMemo.size > 160)
        geometryMemo.delete(geometryMemo.keys().next().value);
      return play;
    }

    function fresh() {
      return {
      structuralMemoryVersion: "6.6.13",
      structuralMemoryEnabled: false,
        forecastVersion: VERSION,
        history: [],
        historyTurns: [],
        sources: [],
        totalTurns: 0,
        manualCount: 0,
        manualLog: [],
        undoStack: [],
        strategy: "MASTER",importAudit:null,
        masterChoice: null,
        masterHistory: [], masterLessons:[],masterReviews:[],importReanalyses:[],reanalysisPolicies:[],
        masterResumeTurn: 0,
        globalStrategyPrevious: null,
        postLossEnabled: false,
        postThreeEnabled: false,
        postThreeUsed: {},
        strategyStreaks: {},
        focusTimelineId: null,
        rank: 3,
        manual: null,
        adaptive: "A05",
        created: [],
        activeCreated: null,
        g1: true,
        g1Trainer: true,
        galeSkip: false,
        secondHouse: false,
        stake: 1,
        multiplier: 1,
        phase: "ENTRY",
        cycle: null,
        defense: null,
        previous: null,
        trainerChoice: null,
        trainerTurns: 0,
        trainerChanges: 0,
        trainerPending: false,
        trainerHistory: [],
        numberChoice: null,
        numberChanges: 0,
        numberHistory: [],
        numberCombinations: [],
        numberComparisons: [],
        virtual: {},
        entryRows: [],
        g1Rows: [],
        g1Pending: [],
        realG1: [],
        decisions: [],
        ledger: [],
        variantBooks: {},
        variantSelections: {},
        strategyTimeline: {},
        timelineCycles: {},
        timelineFormat: 2,
        autoRows: [],
        autoRank: 1,
        groupsOpen: { trainers: true, originals: false },
        open: { general: true, timeline: true },
        block: {
          size: 0,
          pending: 0,
          revision: 0,
          anchor: [],
          decisionTurn: 0,
          data: null,
          best: null,
        },
      };
    }

    function normalizeState(data) {
      const r = fresh();
      for (const key of Object.keys(r))
        if (data?.[key] !== undefined) r[key] = data[key];
      r.history = cleanNumbers(r.history);
      if (r.history.length > 79) r.history = r.history.slice(-70);
      for (const field of [
        "historyTurns",
        "sources",
        "manualLog",
        "undoStack",
        "created",
        "trainerHistory",
        "numberHistory",
        "numberCombinations",
        "numberComparisons",
        "entryRows",
        "g1Rows",
        "g1Pending",
        "realG1",
        "decisions",
        "ledger",
        "autoRows",
        "masterHistory",
      "masterLessons","masterReviews","importReanalyses","reanalysisPolicies",])
        if (!Array.isArray(r[field])) r[field] = [];
      r.totalTurns = Math.max(
        Number(r.totalTurns) || 0,
        r.history.length,
        Number(r.ledger.at(-1)?.turn) || 0,
      );
      if (r.historyTurns.length !== r.history.length)
        r.historyTurns = r.history.map(
          (_, i) => r.totalTurns - r.history.length + i + 1,
        );
      if (r.sources.length !== r.history.length)
        r.sources = r.history.map(() => "HISTÓRICO");
      for (const field of [
        "variantBooks",
        "variantSelections",
        "strategyTimeline",
        "timelineCycles",
        "virtual",
        "groupsOpen",
        "postThreeUsed",
        "strategyStreaks",
      ]) {
        if (!r[field] || typeof r[field] !== "object") r[field] = {};
      }
      if (data?.timelineFormat !== 2) {
        r.strategyTimeline = {};
        r.timelineCycles = {};
        r.timelineFormat = 2;
      }
      if (data?.postLossEnabled === undefined && r.strategy === "POSTLOSS")
        r.postLossEnabled = true;
      r.postLossEnabled = !!r.postLossEnabled;
      r.postThreeEnabled = !!r.postThreeEnabled;
      if (
        data?.forecastVersion !== VERSION &&
        data?.strategy === "TRAINER" &&
        !Object.prototype.hasOwnProperty.call(data, "masterResumeTurn")
      )
        r.strategy = "MASTER";
      r.masterResumeTurn = Math.max(0, Number(r.masterResumeTurn) || 0);
      if (r.cycle && !r.cycle.controller) r.cycle.controller = r.strategy;
      r.open = {
        general: r.open?.general !== false,
        timeline: r.open?.timeline !== false,
      };
      if (
        !r.block ||
        !Array.isArray(r.block.anchor) ||
        !Number.isInteger(r.block.size)
      ) {
        r.block = {
          size: Math.min(70, r.history.length),
          pending: 0,
          revision: 0,
          anchor: [...r.history],
          decisionTurn: r.totalTurns,
          data: null,
          best: null,
        };
      }
      r.block.size = clamp(r.block.size || r.history.length, 0, 70);
      r.block.pending = clamp(Number(r.block.pending) || 0, 0, 9);
      if (r.forecastVersion !== VERSION) {
        r.block.data = null;
        r.forecastVersion = VERSION;
      }
      r.undoStack = r.undoStack.slice(-70);
      if (
        !VARIANT_OWNERS.some((o) => o.id === r.strategy) &&
        ![
          "MASTER",
          "TRAINER",
          "POSTLOSS",
          "AUTO",
          "ADAPTIVE",
          "CREATED",
        ].includes(r.strategy)
      ) {
        r.strategy = "TRAINER";
        r.manual = null;
      }
    if(data.structuralMemoryVersion!=="6.6.13"){
      r.structuralMemoryVersion="6.6.13";
      r.block={...r.block,data:null};
    }

      return r;
    }

    function settings() {
      return Object.fromEntries(
        [
          "structuralMemoryEnabled","strategy",
          "postLossEnabled",
          "postThreeEnabled",
          "rank",
          "manual",
          "adaptive",
          "created",
          "activeCreated",
          "g1",
          "g1Trainer",
          "galeSkip",
          "secondHouse",
          "stake",
          "multiplier",
          "groupsOpen",
          "variantSelections",
        ].map((k) => [k, copy(state[k])]),
      );
    }

    function clearSpatialCaches() {
    motorReadings667.clear();
    triangleMemory666.clear();
      triangleCache.clear();
      spaceCache.clear();
      rawSpaceCache.clear();
      motorDiversityCache.clear();
      variantForecastCache.clear();
      blockRuntimeKey = null;
      blockRuntimeData = null;
    }

    function compactMotor(m) {
      const result = { readingVersion:"6.6.13", readingCandidates:37,};
      for (const field of [
        "key",
        "rank",
        "family",
        "radius",
        "score",
        "bankId",
        "owner",
        "variation",
        "autoRank",
        "type",
        "trigger",
        "sourceNumber",
        "sourceTurn",
      ])
        if (m[field] != null) result[field] = m[field];
      result.shape = signaturePlay(m.play);
      return result;
    }

    function expandMotor(m) {
      const { shape, ...motor } = m;
      return { ...motor, play: restoreShape(shape, m.score) };
    }

    

    function prepareBlock() {
      if (state.history.length < 8) return null;
      if (state.block.data && state.block.decisionTurn === state.totalTurns)
        return currentBlock();
      state.block.anchor = [...state.history].slice(-70);
      state.block.decisionTurn = state.totalTurns;
      variantForecastCache.clear();
      const variants = allVariantForecasts(state.block.anchor),
        global = motors(state.block.anchor);
      state.block.data = {
        global: global.map(compactMotor),
        variants: variants.map((f) => ({
          bankId: f.bankId,
          owner: f.owner,
          name: f.name,
          variation: f.variation,
          motors: f.motors.map(compactMotor),
          choice: compactMotor(f.choice),
        })),
      };
      state.block.best = rankBestVariation();
      registerNumberCombination(state.block.anchor, state.totalTurns);
      updateNumberChoice();
      updateTrainer();
      blockRuntimeKey = null;
      updateMaster(currentBlock());
      return currentBlock();
    }

    function currentBlock() {
      if (!state.block.data) return null;
      const key = state.block.revision + "|" + state.block.decisionTurn;
      if (blockRuntimeKey === key && blockRuntimeData) return blockRuntimeData;
      const data = state.block.data;
      blockRuntimeData = {
        global: data.global.map(expandMotor),
        variants: data.variants.map((f) => ({
          ...f,
          motors: f.motors.map(expandMotor),
          choice: expandMotor(f.choice),
        })),
      };
      blockRuntimeKey = key;
      return blockRuntimeData;
    }

    function selectedVariantForecast() {
      const owner = activeVariationOwner();
      if (!owner || chosenVariation(owner) === 0) return null;
      return (
        currentBlock()?.variants.find(
          (f) => f.owner === owner && f.variation === chosenVariation(owner),
        ) || null
      );
    }

    function chooseAutoMotor(cs, h = state.history) {
      if (variantEvaluationContext) return variantAutoChoice(cs);
      const ranked = cs
        .slice(0, 4)
        .map((motor, i) => {
          const rank = i + 1,
            rows = state.autoRows.slice(-30),
            recent = rows.slice(-5);
          const score =
            ((rows.filter((r) => r.hits[rank]).length + (4 * 28) / 37) /
              (rows.length + 4)) *
              0.6 +
            ((recent.filter((r) => r.hits[rank]).length + (2 * 28) / 37) /
              (recent.length + 2)) *
              0.4;
          return { motor, rank, score };
        })
        .sort((a, b) => b.score - a.score || a.rank - b.rank);
      if (!ranked.length) return null;
      const current = ranked.find((r) => r.rank === state.autoRank);
      const choice =
        current && ranked[0].score - current.score < 0.012
          ? current
          : ranked[0];
      return { ...choice.motor, autoRank: choice.rank };
    }

    function activeDefinition() {
      if (
        state.strategy === "MASTER" &&
        !state.cycle &&
        masterRestRemaining() > 0 &&
        !priorityRecoveryChoice()
      )
        return {
          id: "MASTER",
          name: "MASTER • PAUSA • FALTAM " + masterRestRemaining() + " GIRO(S)",
          type: "MASTER",
        };
      const target = state.cycle
        ? state.cycle.original?.postLossTarget
        : priorityRecoveryChoice()?.motor?.postLossTarget;
      if (target)
        return {
          id: target.defenseStrategy || target.id,
          name:
            (target.kind === "POST3"
              ? "JOGADA PÓS-3 LOSS • "
              : "JOGADA PÓS-LOSS • ") + target.name,
          type: "POSTLOSS",
        };
      if (
        state.cycle?.controller === "TRAINER" &&
        state.cycle.original?.globalStrategyTarget
      )
        return {
          id: "TRAINER",
          name:
            "TREINADOR GLOBAL • " +
            state.cycle.original.globalStrategyTarget.name,
          type: "GLOBAL_STRATEGY",
        };
      if (state.cycle?.original?.masterTarget)
        return {
          id: state.cycle.strategy,
          name: "MASTER • " + state.cycle.original.masterTarget.name,
          type: "MASTER",
        };
      if (state.cycle)
        return (
          [...definitions(), ...trainerRanking()].find(
            (d) => d.id === state.cycle.strategy,
          ) || baseActiveDefinition()
        );
      return baseActiveDefinition();
    }

    function trainerRanking() {
      const base = definitions().map((def) => {
        const rows = state.entryRows
          .filter((r) => r.strategy === def.id && r.closed)
          .slice(-30);
        const hits = rows.filter((r) => r.result !== "LOSS").length;
        return {
          ...def,
          total: rows.length,
          hits,
          score: (hits + (8 * 28) / 37) / (rows.length + 8),
        };
      });
      for (const f of state.block.data?.variants || []) {
        const rows = state.variantBooks[f.bankId]?.rows || [],
          hits = rows.filter((r) => r.entryHit).length;
        base.push({
          id: f.bankId,
          name: f.name + " • V" + f.variation,
          type: "VARIANT",
          owner: f.owner,
          variation: f.variation,
          total: rows.length,
          hits,
          score: (hits + (8 * 28) / 37) / (rows.length + 8),
        });
      }
      return base.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    }

    function updateTrainer() {
      const ranked = trainerRanking(),
        best = ranked[0];
      if (!best) return;
      const current = ranked.find((d) => d.id === state.trainerChoice);
      const selected =
        current && best.score - current.score < 0.035 ? current : best;
      if (state.trainerChoice !== selected.id) {
        if (state.trainerChoice) state.trainerChanges++;
        state.trainerHistory.push({
          turn: state.totalTurns,
          from: state.trainerChoice || "INICIAL",
          to: selected.id,
          score: selected.score,
        });
        state.trainerChoice = selected.id;
        state.trainerTurns = 0;
      }
    }

    function activeMotor(cs = currentBlock()?.global || []) {
      const recovery = priorityRecoveryChoice();
      if (recovery) return copy(recovery.motor);
      if (
        state.strategy === "MASTER" &&
        !state.cycle &&
        masterRestRemaining() > 0
      )
        return null;
      if (state.manual)
        return cs.find((m) => m.key === state.manual) || cs[0] || null;
      if (state.postLossEnabled || state.strategy === "POSTLOSS") {
        const selected = postLossChoice();
        if (selected) return copy(selected.motor);
      }
      if (state.strategy === "POSTLOSS") return null;
      if (state.strategy === "MASTER")
        return copy(masterSelection()?.motor || null);
      if (state.strategy === "TRAINER") return copy(independentGlobalMotor());
      if (state.variantSelections[activeVariationOwner()] === -3)
        return thirdVariationMotor(activeVariationOwner());
      const direct = selectedVariantForecast();
      if (direct) return copy(direct.choice);
      return motorForDefinition(baseActiveDefinition(), cs, state.previous);
    }

    function pruneRolling() {
      const cutoff = state.historyTurns[0] || 1;
      for (const field of [
        "ledger",
        "entryRows",
        "g1Rows",
        "numberCombinations",
        "numberComparisons",
        "numberHistory",
        "realG1",
        "decisions",
        "trainerHistory",
        "autoRows",
      ]) {
        state[field] = state[field].filter(
          (r) => Number.isFinite(r.turn) && r.turn >= cutoff,
        );
      }
      for (const b of Object.values(state.variantBooks)) {
        b.rows = b.rows.filter((r) => r.turn >= cutoff);
        b.combinations = b.combinations.filter((r) => r.turn >= cutoff - 1);
      }
    }

    function settleNativeStrategies(
      cs,
      numberBefore,
      n,
      turn,
      after,
      trigger,
      spatial,
    ) {
      settlePending(n, turn);
      const pending = [];
      for (const def of [...definitions(), { id: "NUMBER", type: "NUMBER" }]) {
        const v = virtualCycle(def.id);
        if (v.phase === "ENTRY") {
          const m =
            def.type === "NUMBER"
              ? numberBefore
              : chooseMotor(def, cs, v.previous);
          if (!m) continue;
          v.previous = m.key;
          v.entryTrigger = trigger;
          v.spatialKeys = [...spatial.keys];
          if (m.play.numbers.includes(n)) {
            state.entryRows.push({
              turn,
              strategy: def.id,
              result: "GREEN",
              closed: true,
              motor: m.key,
              spatialKeys: [...spatial.keys],
              profit: profit("GREEN"),
            });
          } else {
            v.phase = "GALE";
            v.entry = copy(m);
            v.trigger = n;
            const options = defenses(m, n, after, def.id);
            for (const o of options)
              pending.push({
                eventId: def.id + "@" + turn,
                strategy: def.id,
                mode: o.mode,
                behavior: o.behavior,
                trigger: n,
                entryMotor: m.key,
                numbers: [...o.motor.play.numbers],
                uncovered: missing(o.motor.play),
                spatialKeys: [...spatialRead(after).keys],
              });
            const decision = chooseG1(m, n, after, def.id);
            v.defense = decision?.motor || fineG1(m, n, after) || copy(m);
          }
        } else {
          const result = v.defense?.play.numbers.includes(n)
            ? "GREEN G1"
            : "LOSS";
          state.entryRows.push({
            turn,
            strategy: def.id,
            result,
            closed: true,
            motor: v.entry?.key,
            spatialKeys: copy(v.spatialKeys || []),
            profit: profit(result),
          });
          v.phase = "ENTRY";
          v.entry = null;
          v.defense = null;
          v.trigger = null;
        }
      }
      state.g1Pending = pending;
    }

    function spin(n, source = "HISTÓRICO") {
      if (!Number.isInteger(n) || n < 0 || n > 36)
        throw Error("NÚMERO INVÁLIDO");
      const before = [...state.history],
        turn = state.totalTurns + 1,
        trigger = before.at(-1);
      const block =
        before.length >= 8 ? currentBlock() || prepareBlock() : null;
      const cs = block?.global || [],
        forecasts = block?.variants || [];
      const timelineForecasts = snapshotTimelineForecasts(block);
      const phaseBefore = state.phase,
        oldCycle = copy(state.cycle),
        definitionBefore = activeDefinition();
      const controller = oldCycle?.controller || state.strategy;
      const masterPaused =
        state.strategy === "MASTER" &&
        state.phase === "ENTRY" &&
        masterRestRemaining() > 0 &&
        !priorityRecoveryChoice(block);
      const spatial = spatialRead(before.slice(-70)),
        after = [...before, n].slice(-70);
      let result = "AGUARDANDO",
        played = null;
    const masterReviewDraft=controller==='MASTER'&&phaseBefore==='ENTRY'&&!masterPaused&&block
      ?prepareMasterReview(timelineForecasts,block):null;
      if (masterPaused) {
        result = "PAUSA MASTER";
      } else if (state.phase === "ENTRY") {
        const motor = activeMotor(cs);
        if (motor) {
          played = copy(motor);
          state.previous = motor.key;
          if (motor.postLossTarget?.kind === "POST3")
            state.postThreeUsed[motor.postLossTarget.id] =
              motor.postLossTarget.lossTurn;
          state.cycle = {
            controller: state.strategy,
            strategy: definitionBefore.id,
            original: copy(motor),
            entryTurn: turn,
            entryTrigger: trigger,
            trigger: null,
            decision: null,
            triangleKey: triangleContext(before),
            spatialKeys: [...spatial.keys],
          };
          if (state.secondHouse) {
            state.defense = copy(motor);
            state.phase = "SECOND_SKIP";
            result = "2ª CASA";
          } else if (motor.play.numbers.includes(n)) {
            result = "GREEN";
            state.cycle = null;
          } else {
            result = "GALE";
            openRealGale(motor, n, after, turn);
          }
        }
      } else if (state.phase === "SECOND_SKIP") {
        played = copy(state.defense);
        result = "CASA PULADA";
        state.phase = "SECOND_ENTRY";
      } else if (state.phase === "SECOND_ENTRY") {
        played = copy(state.defense);
        if (played?.play.numbers.includes(n)) {
          result = "GREEN";
          state.phase = "ENTRY";
          state.cycle = null;
          state.defense = null;
        } else {
          result = "GALE";
          openRealGale(played, n, after, turn);
        }
      } else if (state.phase === "GALE_SKIP") {
        played = copy(state.defense);
        result = "GALE PULADO";
        state.phase = "GALE";
      } else if (state.phase === "GALE") {
        played = copy(state.defense);
        result = played?.play.numbers.includes(n) ? "GREEN G1" : "LOSS";
        state.realG1.push({
          turn,
          strategy: state.cycle?.strategy,
          mode: state.cycle?.decision?.mode,
          behavior: state.cycle?.decision?.behavior,
          trigger: state.cycle?.trigger,
          outcome: n,
          result,
        });
        state.phase = "ENTRY";
        state.cycle = null;
        state.defense = null;
      }
      recordMasterCycle(controller, oldCycle, played, result, turn);
      settleTimelineForecasts(timelineForecasts, n, turn, before);
    advanceMasterReviews(masterReviewDraft,played,controller,oldCycle,result,n,turn,before);
      updateStrategyStreaks(turn);
      settleNativeStrategies(
        cs,
        block?.variants.find((f) => f.owner === "NUMBER")?.choice,
        n,
        turn,
        after,
        trigger,
        spatial,
      );
      settleVariantForecasts(forecasts, n, turn, before.slice(-70));
      const motorHits = {};
      for (const m of cs) motorHits[m.key] = m.play.numbers.includes(n);
      const hits = {};
      for (const m of cs.slice(0, 4)) hits[m.rank] = motorHits[m.key];
      if (cs.length) state.autoRows.push({ turn, hits });
      const postLossTarget = copy(
        oldCycle?.original?.postLossTarget || played?.postLossTarget || null,
      );
      const playRoute = played
        ? postLossTarget
          ? postLossTarget.kind === "POST3"
            ? "POST3LOSS"
            : "POSTLOSS"
          : "NORMAL"
        : null;
      state.ledger.push({
      readingAudit: {
        version: "6.6.13", prefix: [...before].slice(-70), beforeTurn: turn-1,
        candidateCount: 37, chainMaximum:before.length, poleTolerances:19, polePairPositions:1369, arcWindowCount:before.length, relativeForms:1369, amplitudeForms:361, formsEvaluated:motorReadings667.summary(before).formsEvaluated, channelCount: motorReadings667.summary(before).channelCount,
        supportedGroups: motorReadings667.summary(before).groups.filter(group=>group.support>0).map(group=>group.name),
        coveredByMotors: Object.keys(motorHits).filter(key=>motorHits[key]),
        selectedBank: oldCycle?.original?.bankId||played?.bankId||"GLOBAL",
        bankAlternatives: [{bankId:"GLOBAL",coveredBy:cs.filter(motor=>motor.play.numbers.includes(n)).map(motor=>motor.key)},
          ...forecasts.map(forecast=>({bankId:forecast.bankId,coveredBy:forecast.motors.filter(motor=>motor.play.numbers.includes(n)).map(motor=>motor.key)}))],
        readingSupport: motorReadings667.candidate(before,n)?.historicalSupport||0,
        chosenCovered: played?.play?.numbers.includes(n) ?? null,
        note: "HIPÓTESES ENUMERADAS NÃO SÃO ACERTOS VIRTUAIS"
      },
        controller,
        masterTarget: copy(
          oldCycle?.original?.masterTarget || played?.masterTarget || null,
        ),
        playRoute,
        postLossTarget,
        turn,
        number: n,
        source,
        trigger,
        strategy: oldCycle?.strategy || definitionBefore.id,
        motor: played?.key || "—",
        phase: phaseBefore,
        result,
        profit: profit(result),
        play: played?.play || null,
        spatialKeys: [...spatial.keys],
        motorHits,
        autoRank: played?.autoRank || null,
      });
      if(before.length>=8)validateReanalysisPolicies(before,n,turn);
    state.totalTurns = turn;
      state.history.push(n);
      state.historyTurns.push(turn);
      state.sources.push(source);
      state.trainerTurns++;
      if (before.length >= 8) {
        state.block.pending++;
        if (state.block.pending === 10) {
          if (state.block.size) {
            state.history.splice(0, 10);
            state.historyTurns.splice(0, 10);
            state.sources.splice(0, 10);
          }
          state.block.pending = 0;
          state.block.revision++;
          state.block.anchor = [...state.history];
          state.block.decisionTurn = turn;
          state.block.data = null;
          blockRuntimeKey = null;
          blockRuntimeData = null;
          variantForecastCache.clear();
          pruneRolling();
        }
      }

      // O descarte continua em dez; a previsão seguinte nunca usa o bloco anterior.
      state.block.data = null;
      blockRuntimeKey = null;
      blockRuntimeData = null;
      variantForecastCache.clear();
      state.block.best = rankBestVariation();
      return state.ledger.at(-1);
    }

    
function importFingerprint(value){
 const text=JSON.stringify(value);let hash=2166136261;
 for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619)>>>0;
 return hash.toString(16).padStart(8,'0').toUpperCase();
}
function describeImport(numbers,opts){
 const config={};
 for(const key of ['structuralMemoryEnabled','strategy','postLossEnabled','postThreeEnabled','rank','manual','adaptive',
 'created','activeCreated','g1','g1Trainer','galeSkip','secondHouse'])config[key]=copy(opts[key]);
 return {version:VERSION,count:numbers.length,oldest:numbers[0],newest:numbers.at(-1),
 historyId:importFingerprint(numbers),settingsId:importFingerprint(config),config};
}

function importNumbersCore(numbers, opts, manualLog = []) {
      state = { ...fresh(), ...opts, manualLog: copy(manualLog) };
      clearSpatialCaches();
      const clean = cleanNumbers(numbers).slice(-70);
state.importAudit=describeImport(clean,opts);
      // A importação cresce até o tamanho escolhido; não descarta seu próprio histórico.
      state.block.size = 0;
      state.importTrainingActive=true;
    try{for (const n of clean) spin(n, "HISTÓRICO");}
    finally{state.importTrainingActive=false;}
      state.block = {
        size: clean.length,
        pending: 0,
        revision: state.block.revision + 1,
        anchor: [...state.history],
        decisionTurn: state.totalTurns,
        data: null,
        best: null,
      };
      clearSpatialCaches();
      prepareBlock();
    }

    function chosenVariation(owner) {
      const value = state.variantSelections[owner];
      if (value === -3) {
        const ranked = variationPerformance(owner);
        return ranked.some((r) => r.total) ? ranked[2].variation : 0;
      }
      return Number.isInteger(value) && value >= 0 && value <= 8 ? value : 1;
    }

    function motorForDefinition(def, cs, previous) {
      if (!def) return null;
      if (def.type === "VARIANT")
        return copy(
          currentBlock()?.variants.find((f) => f.bankId === def.id)?.choice ||
            null,
        );
      if (def.type === "NUMBER") return bestNumberCombination(state.history);
      return chooseMotor(def, cs, previous);
    }

    function variationPerformance(owner){
    return Array.from({length:8},(_,index)=>{
      const variation=index+1,stats=masterCandidateStats(variantBookId(owner,variation));
      return {...stats,variation,hits:stats.direct,rate:stats.total?stats.direct/stats.total:0};
    }).sort((a,b)=>Number(b.total>0)-Number(a.total>0)||b.score-a.score||a.lossStreak-b.lossStreak||a.variation-b.variation)
      .map((row,index)=>({...row,position:index+1}));
  }


    function timelineDefinitions() {
      return [
        { id: "MASTER", name: "TREINADOR GLOBAL MASTER" },
        { id: "TRAINER", name: "TREINADOR GLOBAL • ESTRATÉGIA" },
        { id: "POSTLOSS", name: "PÓS-LOSS" },
        ...VARIANT_OWNERS.flatMap((o) => [
          {
            id: o.id === "NUMBER" ? "NUMBER" : "ORIGINAL:" + o.id,
            name: o.name + " • BASE",
          },
          { id: o.id + "@THIRD", name: o.name + " • 3º AUTOMÁTICO" },
          ...Array.from({ length: 8 }, (_, i) => ({
            id: variantBookId(o.id, i + 1),
            name: o.name + " • V" + (i + 1),
          })),
        ]),
        ...definitions()
          .filter((d) => d.type !== "ORIGINAL")
          .map((d) => ({ id: d.id, name: d.name })),
      ];
    }

    function updateVariantButtons() {
      const original = state.cycle?.original;
      const owner = original?.owner || activeVariationOwner();
      const variation = original?.variation ?? chosenVariation(owner);
      for (const b of document.querySelectorAll("[data-variant-owner]")) {
        b.classList.toggle(
          "active",
          b.dataset.variantOwner === owner &&
            Number(b.dataset.variant) === variation,
        );
      }
    }

    function timelineSamples(id) {
      const cutoff = state.historyTurns[0] || 1;
      return (state.strategyTimeline[id] || []).filter((r) => r.turn >= cutoff);
    }

    function snapshotTimelineForecasts(block) {
      if (!block) return [];
      const forecasts = [];
      const append = (id, motor) => {
        if (validPlay(motor?.play))
          forecasts.push({
            id,
            motor: copy(motor),
            defenseStrategy:
              motor.postLossTarget?.defenseStrategy ||
              motor.thirdTarget?.id ||
              id,
          });
      };
      for (const def of definitions())
        append(
          def.id,
          chooseMotor(def, block.global, state.virtual[def.id]?.previous),
        );
      append("NUMBER", bestNumberCombination(state.history));
      for (const f of block.variants) append(f.bankId, f.choice);
      const trainer =
        trainerRanking().find((d) => d.id === state.trainerChoice) ||
        trainerRanking()[0];
      append("TRAINER", independentGlobalMotor(block));
      for (const owner of VARIANT_OWNERS)
        append(owner.id + "@THIRD", thirdVariationMotor(owner.id, block));
      append("POSTLOSS", postLossChoice(block)?.motor);
      return forecasts;
    }

    function settleTimelineForecasts(forecasts, n, turn, before) {
      const cutoff = state.historyTurns[0] || 1;
      const all = new Map(forecasts.map((f) => [f.id, f]));
      for (const id of Object.keys(state.timelineCycles))
        if (!all.has(id)) all.set(id, { id });
      for (const f of all.values()) {
        if (f.id === "MASTER") continue;
        const rows =
          state.strategyTimeline[f.id] || (state.strategyTimeline[f.id] = []);
        let cycle = state.timelineCycles[f.id];
        if (!cycle) {
          if (!validPlay(f.motor?.play)) continue;
          if (f.id === "TRAINER") state.globalStrategyPrevious = f.motor.key;
          cycle = {
            entry: copy(f.motor),
            defenseStrategy: f.defenseStrategy || f.id,
            config: {
              g1: state.g1,
              g1Trainer: state.g1Trainer,
              galeSkip: state.galeSkip,
              secondHouse: state.secondHouse,
            },
            phase: state.secondHouse ? "SECOND_SKIP" : "ENTRY",
            initialSkip: !!state.secondHouse,
          };
          state.timelineCycles[f.id] = cycle;
        }
        if (cycle.phase === "SECOND_SKIP") {
          if (cycle.initialSkip) cycle.initialSkip = false;
          else cycle.phase = "ENTRY";
          continue;
        }
        if (cycle.phase === "GALE_SKIP") {
          cycle.phase = "GALE";
          continue;
        }
        if (cycle.phase === "GALE") {
          const row = rows.find((r) => r.turn === cycle.turn);
          if (row) {
            row.result = cycle.defense.play.numbers.includes(n)
              ? "GREEN G1"
              : "LOSS";
            row.closed = true;
            row.closedTurn = turn;
          }
          delete state.timelineCycles[f.id];
        } else if (cycle.entry.play.numbers.includes(n)) {
          rows.push({ turn, result: "GREEN", closed: true, closedTurn: turn });
          delete state.timelineCycles[f.id];
        } else {
          rows.push({ turn, result: "GREEN G1", closed: false });
          cycle.turn = turn;
          const h = [...before, n].slice(-70),
            config = cycle.config;
          const decision = config.g1Trainer
            ? chooseG1(cycle.entry, n, h, cycle.defenseStrategy || f.id)
            : {
                motor: config.g1
                  ? fineG1(cycle.entry, n, h)
                  : copy(cycle.entry),
              };
          cycle.defense = copy(decision?.motor || cycle.entry);
          cycle.phase = config.galeSkip ? "GALE_SKIP" : "GALE";
        }
        state.strategyTimeline[f.id] = rows
          .filter((r) => r.turn >= cutoff)
          .slice(-79);
      }
    }
    /* O terceiro é uma posição acompanhada dentro do proprietário, não uma V fixa. */
    function thirdVariationMotor(owner, block = currentBlock()) {
      const ranked = variationPerformance(owner);
      if (!ranked.some((r) => r.total)) return null;
      const variation = ranked[2].variation;
      const forecast = block?.variants.find(
        (f) => f.owner === owner && f.variation === variation,
      );
      return forecast
        ? {
            ...copy(forecast.choice),
            thirdTarget: { owner, variation, id: forecast.bankId },
          }
        : null;
    }

    function timelineMotor(id, block = currentBlock()) {
      if (!block) return null;
      if (id.endsWith("@THIRD"))
        return thirdVariationMotor(id.slice(0, -6), block);
      if (id === "MASTER") return masterSelection(block)?.motor || null;
      if (id === "TRAINER") return independentGlobalMotor(block);
      if (id === "NUMBER") return bestNumberCombination(state.history);
      const variant = block.variants.find((f) => f.bankId === id);
      if (variant) return copy(variant.choice);
      const definition = definitions().find((d) => d.id === id);
      return definition
        ? chooseMotor(definition, block.global, state.virtual[id]?.previous)
        : null;
    }

    /* Só ciclos encerrados antes da decisão entram na comparação.
   O próximo ciclo depois de cada LOSS fornece uma observação pós-loss. */
    function postLossStats(id) {
      const rows = timelineSamples(id)
        .filter((r) => r.closed && r.closedTurn <= state.totalTurns)
        .sort((a, b) => a.turn - b.turn);
      const following = [];
      for (let i = 1; i < rows.length; i++)
        if (
          rows[i - 1].result === "LOSS" &&
          rows[i].turn > rows[i - 1].closedTurn
        ) {
          following.push(rows[i]);
        }
      const recoveries = following.filter((r) => r.result !== "LOSS").length;
      const repeatLoss = following.length - recoveries;
      const direct = following.filter((r) => r.result === "GREEN").length;
      const recent = following.slice(-5),
        recentHits = recent.filter((r) => r.result !== "LOSS").length;
      const base = 28 / 37;
      const recovery = (recoveries + 4 * base) / (following.length + 4);
      const short = (recentHits + 3 * base) / (recent.length + 3);
      const first = (direct + 3 * base) / (following.length + 3);
      let streak = 0;
      for (let i = rows.length - 1; i >= 0 && rows[i].result === "LOSS"; i--)
        streak++;
      return {
        samples: following.length,
        recoveries,
        repeatLoss,
        direct,
        streak,
        score:
          recovery * 0.55 +
          short * 0.3 +
          first * 0.15 -
          (0.25 * repeatLoss) / (following.length + 4) -
          0.025 * Math.max(0, streak - 1),
        last: rows.at(-1) || null,
      };
    }

    function postLossRanking(block = currentBlock()) {
      if (!block) return [];
      return definitions()
        .filter((d) => d.type === "ADAPTIVE")
        .map((def) => {
          const stats = postLossStats(def.id);
          const justLost =
            stats.last?.result === "LOSS" &&
            stats.last.closedTurn === state.totalTurns;
          const eligible = justLost; // Sem mínimo de ciclos ou validação para entrar.
          return { ...def, ...stats, justLost, eligible };
        })
        .filter((r) => r.justLost)
        .sort(
          (a, b) =>
            Number(b.eligible) - Number(a.eligible) ||
            b.score - a.score ||
            b.samples - a.samples ||
            a.id.localeCompare(b.id),
        );
    }

    function postLossChoice(block = currentBlock()) {
      for (const candidate of postLossRanking(block)) {
        if (!candidate.eligible) continue;
        const motor = timelineMotor(candidate.id, block);
        if (validPlay(motor?.play))
          return {
            ...candidate,
            motor: {
              ...copy(motor),
              postLossTarget: {
                id: candidate.id,
                name: candidate.name,
                lossTurn: candidate.last.closedTurn,
                samples: candidate.samples,
                recoveries: candidate.recoveries,
                repeatLoss: candidate.repeatLoss,
                score: candidate.score,
                defenseStrategy: motor.thirdTarget?.id || candidate.id,
              },
            },
          };
      }
      return null;
    }

    function trainerBaseDefinition() {
      return (
        trainerRanking().find((d) => d.id === state.trainerChoice) ||
        trainerRanking()[0] ||
        definitions()[0]
      );
    }

    function baseActiveDefinition() {
      const owner = activeVariationOwner(),
        defs = definitions();
      if (state.strategy === "POSTLOSS")
        return {
          id: "POSTLOSS",
          name: "PÓS-LOSS • AGUARDANDO LOSS DAS ADAPTATIVAS",
          type: "POSTLOSS",
        };
      if (owner && !state.manual) {
        const variation = chosenVariation(owner),
          name = VARIANT_OWNERS.find((o) => o.id === owner).name;
        if (variation === 0)
          return owner === "NUMBER"
            ? { id: "NUMBER", name, type: "NUMBER" }
            : { ...defs.find((d) => d.id === "ORIGINAL:" + owner), name };
        return {
          id: variantBookId(owner, variation),
          name:
            name +
            (state.variantSelections[owner] === -3 ? " • 3º AUTOMÁTICO" : "") +
            " • V" +
            variation,
          type: "VARIANT",
          owner,
          variation,
        };
      }
      if (state.strategy === "MASTER") {
        const chosen = masterSelection();
        return chosen
          ? {
              id: chosen.motor.masterTarget.defenseStrategy,
              name: "MASTER • " + chosen.name,
              type: "MASTER",
            }
          : {
              id: "MASTER",
              name: "MASTER • AGUARDANDO HISTÓRICO",
              type: "MASTER",
            };
      }
      if (state.strategy === "TRAINER")
        return {
          id: "TRAINER",
          name: "TREINADOR GLOBAL • " + trainerBaseDefinition().name,
          type: "GLOBAL_STRATEGY",
        };
      if (state.strategy === "AUTO")
        return defs.find((d) => d.id === "RANK:" + state.rank) || defs[0];
      if (state.strategy === "ADAPTIVE")
        return (
          defs.find((d) => d.id === "ADAPTIVE:" + state.adaptive) || defs[0]
        );
      if (state.strategy === "CREATED")
        return defs.find((d) => d.id === state.activeCreated) || defs[0];
      return defs[0];
    }

    function resultGroups(rows) {
      return {
        normal: rows.filter((r) => r.playRoute === "NORMAL"),
        postLoss: rows.filter((r) => r.playRoute === "POSTLOSS"),
        postThree: rows.filter((r) => r.playRoute === "POST3LOSS"),
        combined: rows,
        legacy: rows.filter(
          (r) => !["NORMAL", "POSTLOSS", "POST3LOSS"].includes(r.playRoute),
        ),
      };
    }

    function masterRestRemaining() {
      return Math.max(
        0,
        (Number(state.masterResumeTurn) || 0) - (state.totalTurns + 1),
      );
    }
  /* Cada lado mantém seu próprio ranking, avaliações e memória de decisões.
     Revisões usam somente jogadas registradas ANTES dos resultados. */
  function bestMasterVariation(owner, block=currentBlock()) {
    if(!block)return null;
    for(const position of variationPerformance(owner)){
      const forecast=block.variants.find(f=>f.owner===owner&&f.variation===position.variation);
      if(validPlay(forecast?.choice?.play))return {id:forecast.bankId,
        name:(VARIANT_OWNERS.find(o=>o.id===owner)?.name||owner)+' • V'+position.variation,
        owner,variation:position.variation,performancePosition:position.position,
        performanceScore:position.score};
    }
    return null;
  }

  function masterCandidateMotor(definition,block=currentBlock()){
    const id=definition.resolvedId||definition.id;
    return timelineMotor(id,block);
  }

  /* Reanálise supervisionada da importação. Hipóteses são definidas pelo
     prefixo; o resultado conhecido apenas avalia as tentativas depois.
     O ajuste retrospectivo nunca conta como validação prospectiva. */
  const REANALYSIS_COMPONENTS = ['triangle','chain','pole','arc','route','recent'];
  const REANALYSIS_LEVELS = [.35,.55,.75,.90];
  function reanalysisWeights(prefix, group, level) {
    const h=prefix.slice(-70), reading=spatialRead(h);
    const recent=Array(37).fill(.1);
    for(let age=0;age<h.length;age++){
      const mass=Math.exp(-age/12);
      for(let j=0;j<37;j++)recent[j]+=mass*Math.exp(-distance(W[j],h[h.length-1-age])/2);
    }
    const components=[...reading.components,normalizeSpace(recent)];
    const selected=components[group], strength=REANALYSIS_LEVELS[level];
    const reference=normalizeSpace(reading.weights);
    return normalizeSpace(reference.map((v,j)=>Math.max(.001,v*(1-strength)+selected[j]*strength)));
  }
  function reanalysisKey(group,level){return 'REVIEW:'+group+':'+level;}
  function validateReanalysisPolicies(prefix,number,turn){
    for(const policy of state.reanalysisPolicies){
      if(policy.createdTurn>=turn)continue;
      const play=geometry(reanalysisWeights(prefix,policy.group,policy.level));
      if(!validPlay(play))continue;
      const hit=play.numbers.includes(number);
      policy.evaluations++;
      if(hit)policy.hits++;
      policy.lastEvaluation={beforeTurn:turn-1,turn,number,hit};
    }
  }
  function applyReanalysisMemory(weights,h){
    if(!state.reanalysisPolicies?.length)return weights;
    const base=28/37, mean=avg(weights)||1;
    for(const policy of state.reanalysisPolicies){
      // Só resultados POSTERIORES à descoberta autorizam influência.
      if(policy.evaluations<4)continue;
      const estimate=(policy.hits+base*8)/(policy.evaluations+8);
      const strength=Math.min(.12,Math.max(0,estimate-base)*policy.evaluations/(policy.evaluations+8));
      if(!strength)continue;
      const proposal=reanalysisWeights(h,policy.group,policy.level);
      for(let j=0;j<37;j++)weights[j]=Math.max(.001,weights[j]+mean*strength*(proposal[j]-1));
    }
    return weights;
  }
  function reviseImportedMasterLoss(review,turn){
    if(!review.imported || review.actualResult!=='LOSS')return null;
    const results=review.observations||[];
    const entryIndex=results.findIndex(row=>row.phase==='ENTRY');
    if(entryIndex<0)return null;
    const entryOutcome=results[entryIndex];
    const prefix=results[entryIndex].prefix;
    const attempts=[];let solution=null;
    // 6 leituras x 4 intensidades. Sem deslocamento escolhido pelo resultado,
    // sem adicionar o número revelado aos pesos ou como número obrigatório.
    for(let level=0;level<4&&!solution;level++){
      for(let group=0;group<6&&!solution;group++){
        const weights=reanalysisWeights(prefix,group,level);
        const play=geometry(weights);
        if(!validPlay(play))continue;
        let simulated=play.numbers.includes(entryOutcome.number)?'GREEN':null;
        let defense=null;
        if(!simulated){
          const gale=results.slice(entryIndex+1).find(row=>row.phase==='GALE');
          if(gale){
            const failureHistory=[...prefix,entryOutcome.number].slice(-70);
            const original={key:reanalysisKey(group,level),play};
            // Reconstrói a defesa somente com informação até a falha da entrada.
            const savedRows=state.g1Rows;
            state.g1Rows=savedRows.filter(row=>row.turn<entryOutcome.turn);
            try{
              const config=review.config;
              const decision=config.g1Trainer?chooseG1(original,entryOutcome.number,failureHistory,'MASTER')
                :{motor:config.g1?fineG1(original,entryOutcome.number,failureHistory):original};
              defense=decision?.motor?.play||play;
              simulated=defense.numbers.includes(gale.number)?'GREEN G1':'LOSS';
            }finally{state.g1Rows=savedRows;}
          }else simulated='LOSS';
        }
        const attempt={id:reanalysisKey(group,level),component:REANALYSIS_COMPONENTS[group],
          group,level,strength:REANALYSIS_LEVELS[level],result:simulated,
          entryShape:signaturePlay(play),defenseShape:defense?signaturePlay(defense):null};
        attempts.push(attempt);
        if(simulated!=='LOSS')solution=attempt;
      }
    }
    const record={id:'REANALYSIS@'+review.turn,turn:review.turn,closedTurn:turn,
      beforeTurn:review.beforeTurn,originalResult:'LOSS',selectedId:review.selectedId,
      prefix:[...prefix],observedAfter:results.map(row=>({turn:row.turn,number:row.number,phase:row.phase})),
      status:solution?'REVISED':'UNSOLVED',result:solution?.result||'LOSS',attempts,
      solution:solution?{...solution}:null,retrospective:true,validated:false,
      meaning:'TREINAMENTO REVISADO DEPOIS DO RESULTADO; NÃO É PREVISÃO COMPROVADA'};
    state.importReanalyses.push(record);
    state.importReanalyses=state.importReanalyses.slice(-120);
    if(solution&&!state.reanalysisPolicies.some(policy=>policy.id===solution.id)){
      state.reanalysisPolicies.push({id:solution.id,group:solution.group,level:solution.level,
        createdTurn:turn,evaluations:0,hits:0,lastEvaluation:null});
    }
    return record;
  }

  function masterLessonStats(id){
    const keys=spatialRead(state.history.slice(-70)).keys;
    let support=0,reward=0,count=0,direct=0,g1=0,loss=0;
    for(const lesson of state.masterLessons){
      if(lesson.closedTurn>state.totalTurns||!Object.prototype.hasOwnProperty.call(lesson.outcomes,id))continue;
      const value=lesson.outcomes[id];
      const similarity=.25+.75*spatialMatch(lesson.spatialKeys,keys);
      const recency=Math.exp(-Math.max(0,state.totalTurns-lesson.closedTurn)/70);
      const weight=similarity*recency;
      support+=weight;reward+=weight*(value===2?1:value===1?.55:0);count++;
      if(value===2)direct++;else if(value===1)g1++;else loss++;
    }
    const prior=28/37;
    return {count,support,direct,g1,loss,score:(reward+prior*8)/(support+8)};
  }

  function prepareMasterReview(forecasts,block){
    const definitions=masterDefinitions(block);
    const alternatives=forecasts.filter(f=>f.id!=='POSTLOSS'&&validPlay(f.motor?.play)).map(f=>{
      const definition=definitions.find(d=>d.id===f.id);
      const motor=f.motor;
      return {id:f.id,entry:copy(motor),defenseStrategy:definition?.resolvedId||f.defenseStrategy||f.id,
        phase:state.secondHouse?'SECOND_SKIP':'ENTRY',initialSkip:!!state.secondHouse,result:null};
    });
    return {version:'6.6.13',turn:state.totalTurns+1,beforeTurn:state.totalTurns,
      imported:!!state.importTrainingActive,observations:[],
      prefix:[...state.history].slice(-70),spatialKeys:[...spatialRead(state.history.slice(-70)).keys],
      config:{g1:state.g1,g1Trainer:state.g1Trainer,galeSkip:state.galeSkip,secondHouse:state.secondHouse},
      forecastFingerprint:importFingerprint(alternatives.map(a=>[a.id,signaturePlay(a.entry.play)])),
      alternatives,actualResult:null,selectedId:null};
  }

  function stepMasterAlternative(alternative,review,n,turn,before){
    if(alternative.result)return;
    if(alternative.phase==='SECOND_SKIP'){
      if(alternative.initialSkip)alternative.initialSkip=false;
      else alternative.phase='ENTRY';
      return;
    }
    if(alternative.phase==='GALE_SKIP'){alternative.phase='GALE';return;}
    if(alternative.phase==='GALE'){
      alternative.result=alternative.defense.play.numbers.includes(n)?'GREEN G1':'LOSS';
      alternative.closedTurn=turn;return;
    }
    if(alternative.entry.play.numbers.includes(n)){
      alternative.result='GREEN';alternative.closedTurn=turn;return;
    }
    const history=[...before,n].slice(-70),config=review.config;
    const existing=state.timelineCycles[alternative.id];
    const reusable=existing?.turn===turn&&validPlay(existing.defense?.play)&&
      ['g1','g1Trainer','galeSkip','secondHouse'].every(key=>existing.config?.[key]===config[key])&&
      (existing.defenseStrategy||alternative.id)===alternative.defenseStrategy&&
      signaturePlay(existing.entry.play)===signaturePlay(alternative.entry.play);
    const decision=reusable?{motor:existing.defense}:config.g1Trainer
      ?chooseG1(alternative.entry,n,history,alternative.defenseStrategy)
      :{motor:config.g1?fineG1(alternative.entry,n,history):copy(alternative.entry)};
    alternative.defense=copy(decision?.motor||alternative.entry);
    alternative.phase=config.galeSkip?'GALE_SKIP':'GALE';
  }

  function advanceMasterReviews(draft,played,controller,oldCycle,result,n,turn,before){
    if(draft&&played){
      draft.selectedId=played.postLossTarget?.id||played.masterTarget?.id||null;
      state.masterReviews.push(draft);
    }
    const actualStart=oldCycle?.entryTurn||turn;
    for(const review of state.masterReviews){
      if(review.imported){
        const first=review.alternatives.find(a=>a.id===review.selectedId)||review.alternatives[0];
        review.observations.push({turn,number:n,prefix:[...before].slice(-70),
          phase:first?.phase==='GALE'?'GALE':['ENTRY','SECOND_ENTRY'].includes(first?.phase)?'ENTRY':first?.phase});
      }
      for(const alternative of review.alternatives)stepMasterAlternative(alternative,review,n,turn,before);
      if(controller==='MASTER'&&review.turn===actualStart&&['GREEN','GREEN G1','LOSS'].includes(result)){
        review.actualResult=result;review.actualClosedTurn=turn;
      }
    }
    const remaining=[];
    for(const review of state.masterReviews){
      if(!review.actualResult||review.alternatives.some(a=>!a.result)){remaining.push(review);continue;}
      reviseImportedMasterLoss(review,turn);
      const outcomes={};
      for(const a of review.alternatives)outcomes[a.id]=a.result==='GREEN'?2:a.result==='GREEN G1'?1:0;
      state.masterLessons.push({version:review.version,turn:review.turn,beforeTurn:review.beforeTurn,
        closedTurn:turn,actualClosedTurn:review.actualClosedTurn,actualResult:review.actualResult,
        selectedId:review.selectedId,spatialKeys:review.spatialKeys,forecastFingerprint:review.forecastFingerprint,
        outcomes,entryWinners:Object.keys(outcomes).filter(id=>outcomes[id]===2),
        defenseWinners:Object.keys(outcomes).filter(id=>outcomes[id]===1)});
    }
    state.masterReviews=remaining;
    // Memória separada da janela: o descarte de dez não apaga as lições.
    state.masterLessons=state.masterLessons.slice(-120);
  }

  function masterVariationScore(id,baseScore){
    const lesson=masterLessonStats(id),weight=.20*lesson.support/(lesson.support+8);
    return baseScore*(1-weight)+lesson.score*weight;
  }

    /* Nota comparativa, não probabilidade do próximo giro.
     GREEN=1; G1 confirmado=.45; G1 pendente=.15; LOSS final=-1.
     Últimas 5/15/30 entradas pesam 60%/25%/15%, respectivamente.
     Dentro de cada janela, resultados recentes recebem maior peso.
     Uma perda pendente nunca é contada como LOSS final. */
  function masterCandidateStats(id){
    const rows=timelineSamples(id).filter(row=>Number.isFinite(row.turn)&&row.turn<=state.totalTurns)
      .slice().sort((a,b)=>a.turn-b.turn).slice(-30);
    const closed=row=>row.closed&&Number(row.closedTurn??(row.result==='GREEN'?row.turn:Infinity))<=state.totalTurns;
    const reward=row=>row.result==='GREEN'&&closed(row)?1:closed(row)&&row.result==='GREEN G1'?.45:closed(row)&&row.result==='LOSS'?-1:.15;
    function windowScore(limit,decay){
      const sample=rows.slice(-limit);let mass=0,value=0;
      for(let index=0;index<sample.length;index++){
        const weight=Math.exp(-(sample.length-1-index)/decay);
        mass+=weight;value+=weight*reward(sample[index]);
      }
      return (value+.5*1.5)/(mass+1.5);
    }
    const finished=rows.filter(closed),recent=rows.slice(-5);
    const direct=finished.filter(row=>row.result==='GREEN').length;
    const g1=finished.filter(row=>row.result==='GREEN G1').length;
    const loss=finished.filter(row=>row.result==='LOSS').length;
    let lossStreak=0;
    for(let i=finished.length-1;i>=0&&finished[i].result==='LOSS';i--)lossStreak++;
    const baseScore=.60*windowScore(5,3)+.25*windowScore(15,10)+.15*windowScore(30,20)-.08*Math.min(3,lossStreak);
    const lesson=masterLessonStats(id);
    const feedback=.10*(lesson.score-28/37)*lesson.support/(lesson.support+8);
    return {total:rows.length,closedTotal:finished.length,direct,g1,loss,hits:direct+g1,
      pending:rows.length-finished.length,firstMiss:rows.length-direct,lossStreak,
      recentDirect:recent.filter(row=>closed(row)&&row.result==='GREEN').length,
      recentG1:recent.filter(row=>closed(row)&&row.result==='GREEN G1').length,
      recentLoss:recent.filter(row=>closed(row)&&row.result==='LOSS').length,
      recentPending:recent.filter(row=>!closed(row)).length,
      score:baseScore+feedback,baseScore,feedback,lesson,
      weights:{recent5:.60,recent15:.25,last30:.15},
      rewards:{GREEN:1,GREEN_G1:.45,PENDING_G1:.15,LOSS:-1}};
  }

  function masterDefinitions(block=currentBlock()){
    // O controlador MASTER não se compara consigo mesmo. Pós-loss continua
    // como prioridade independente sobre a escolha normal, quando ativado.
    return timelineDefinitions().filter(def=>!['MASTER','POSTLOSS'].includes(def.id));
  }

  function masterRanking(block=currentBlock()){
    if(!block)return [];
    return masterDefinitions(block).map(def=>{
      const motor=timelineMotor(def.id,block);
      return {...def,...masterCandidateStats(def.id),eligible:validPlay(motor?.play)};
    }).filter(def=>def.eligible).sort((a,b)=>
      Number(b.total>0)-Number(a.total>0)||b.score-a.score||
      a.lossStreak-b.lossStreak||b.recentDirect-a.recentDirect||b.closedTotal-a.closedTotal||a.id.localeCompare(b.id));
  }

  function rankBestVariation(){
    const block=currentBlock();
    if(block)return masterRanking(block)[0]||null;
    // Durante o processamento não usa uma cobertura do giro anterior.
    return null;
  }

  function displayedMasterChoice(){
    const cycle=state.cycle;
    if(cycle?.controller==='MASTER'){
      const target=cycle.original?.postLossTarget||cycle.original?.masterTarget;
      if(target)return {...target,...masterCandidateStats(target.id),committed:true};
    }
    if(state.strategy==='MASTER'&&state.phase==='ENTRY'){
      const priority=priorityRecoveryChoice(currentBlock());
      if(priority?.motor?.postLossTarget){
        const target=priority.motor.postLossTarget;
        return {...target,...masterCandidateStats(target.id),priority:true};
      }
    }
    return state.block.best;
  }


    function updateMaster(block = currentBlock()) {
      const best = masterRanking(block)[0];
      if (!best) return;
    state.block.best=copy(best);
      if (state.masterChoice !== best.id) {
        state.masterHistory.push({
          turn: state.totalTurns,
          from: state.masterChoice || "INICIAL",
          to: best.id,
          name: best.name,
          score: best.score,
          total: best.total,
        });
        state.masterHistory = state.masterHistory.slice(-70);
      }
      state.masterChoice = best.id;
    }

    function independentGlobalMotor(block = currentBlock()) {
      const definition = trainerBaseDefinition();
      const motor = block
        ? motorForDefinition(
            definition,
            block.global,
            state.globalStrategyPrevious,
          )
        : null;
      return validPlay(motor?.play)
        ? {
            ...copy(motor),
            globalStrategyTarget: { id: definition.id, name: definition.name },
          }
        : null;
    }

    function masterSelection(block = currentBlock()) {
      if (!block) return null;
      const definition = masterRanking(block)[0];
      if (!definition) return null;
      const motor = masterCandidateMotor(definition, block);
      return validPlay(motor?.play)
        ? {
            ...definition,
            motor: {
              ...copy(motor),
              masterTarget: {
                id: definition.id,
                name: definition.name,
                defenseStrategy: definition.resolvedId||motor.thirdTarget?.id||definition.id,
              owner:definition.owner||motor.owner||null,variation:definition.variation||motor.variation||null,
              performancePosition:definition.performancePosition||null,
              },
            },
          }
        : null;
    }

    function recordMasterCycle(controller, oldCycle, played, result, turn) {
      if (controller !== "MASTER") return;
      if (!["GREEN", "GALE", "GREEN G1", "LOSS"].includes(result)) return;
      const rows =
        state.strategyTimeline.MASTER || (state.strategyTimeline.MASTER = []);
      const start = oldCycle?.entryTurn || turn;
      let row = rows.find((r) => r.turn === start);
      const target =
        oldCycle?.original?.postLossTarget ||
        oldCycle?.original?.masterTarget ||
        played?.postLossTarget ||
        played?.masterTarget;
      if (!row) {
        row = {
          turn: start,
          result: "GREEN G1",
          closed: false,
          targetId: target?.id || null,
          targetName: target?.name || null,
        };
        rows.push(row);
      }
      row.result = result === "GALE" ? "GREEN G1" : result;
      row.closed = result !== "GALE";
      if (row.closed) {
        row.closedTurn = turn;
        state.masterResumeTurn = turn + 3;
      }
      const cutoff = state.historyTurns[0] || 1;
      state.strategyTimeline.MASTER = rows
        .filter((r) => r.turn >= cutoff)
        .slice(-79);
    }

    /* Caches dependentes do estado são renovados; análises puras por histórico
   exato continuam disponíveis para reutilização, sem alterar os cálculos. */
    function clearRuntimeCaches() {
      motorDiversityCache.clear();
      variantForecastCache.clear();
      blockRuntimeKey = null;
      blockRuntimeData = null;
    }

    /* Checkpoints completos. LZW síncrono reduz o espaço ocupado sem cortar histórico,
   treinamento, ciclos ou desfazer. A fila possui seu próprio diário causal. */
    function packSession(text) {
      const bytes = unescape(encodeURIComponent(text)),
        dictionary = new Map();
      let next = 257,
        phrase = "",
        chunk = "",
        chunks = [];
      const emit = (code) => {
        chunk += String.fromCharCode(code);
        if (chunk.length >= 8192) {
          chunks.push(chunk);
          chunk = "";
        }
      };
      for (let i = 0; i < bytes.length; i++) {
        const char = bytes[i],
          joined = phrase + char;
        if (!phrase || dictionary.has(joined)) {
          phrase = joined;
          continue;
        }
        emit(
          phrase.length === 1 ? phrase.charCodeAt(0) : dictionary.get(phrase),
        );
        if (next < 65535) dictionary.set(joined, next++);
        else {
          emit(256);
          dictionary.clear();
          next = 257;
        }
        phrase = char;
      }
      if (phrase)
        emit(
          phrase.length === 1 ? phrase.charCodeAt(0) : dictionary.get(phrase),
        );
      chunks.push(chunk);
      return "BETA_LZW1:" + chunks.join("");
    }
    function unpackSession(text) {
      if (!text.startsWith("BETA_LZW1:")) return text;
      const dictionary = [],
        parts = [];
      let next = 257,
        previous = "";
      for (let i = 10; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code === 256) {
          dictionary.length = 0;
          next = 257;
          previous = "";
          continue;
        }
        const value =
          code < 256
            ? String.fromCharCode(code)
            : dictionary[code] ||
              (code === next ? previous + previous[0] : null);
        if (value == null) throw Error("Checkpoint inválido.");
        parts.push(value);
        if (previous && next < 65535) dictionary[next++] = previous + value[0];
        previous = value;
      }
      return decodeURIComponent(escape(parts.join("")));
    }
    function read(key) {
      try {
        const raw = localStorage.getItem(key);
        if (raw == null) return null;
        return JSON.parse(unpackSession(raw), (k, v) =>
          v && typeof v.__betaPlay === "string"
            ? restoreShape(v.__betaPlay, v.score)
            : v,
        );
      } catch (error) {
        saveError =
          "Não foi possível recuperar o estado salvo: " +
          String(error.message || error);
        return null;
      }
    }
    function save() {
      try {
        if (typeof checkpointSerial !== "undefined") checkpointSerial++;
        if (typeof checkpointEpoch !== "undefined") checkpointEpoch++;
        const raw = JSON.stringify(state, (k, v) =>
          validPlay(v) ? { __betaPlay: signaturePlay(v), score: v.score } : v,
        );
        localStorage.setItem(KEY, packSession(raw));
        pruneSavedVersions();
        durableTurn = state.totalTurns;
        saveError = "";
        return true;
      } catch (error) {
        saveError = "SALVAMENTO FALHOU: " + String(error.message || error);
        return false;
      }
    }

    /* Busca geométrica original validada: cinco blocos de cinco e um de três,
   sem reaproveitar combinações intermediárias da busca otimizada. */
    function rawGeometry(weights, mandatory = []) {
      const score = (b) => ({
          ...b,
          lowMask: Number(b.mask & 0xffffffffn) >>> 0,
          highMask: Number(b.mask >> 32n),
          value: b.numbers.reduce((s, n) => s + (weights[ix(n)] || 0), 0),
        }),
        fives = FIVE.map(score).sort((a, b) => b.value - a.value),
        threes = THREE.map(score)
          .filter((b) => mandatory.every((n) => b.numbers.includes(n)))
          .sort((a, b) => b.value - a.value);
      let best = null;
      for (const small of threes) {
        let beam = [{ blocks: [small], lowMask: small.lowMask, highMask: small.highMask, score: small.value }];
        for (let step = 0; step < 5; step++) {
          const next = [];
          for (const item of beam)
            for (const b of fives) {
              if ((item.lowMask & b.lowMask) !== 0 || (item.highMask & b.highMask) !== 0) continue;
              next.push({
                blocks: [...item.blocks, b],
                lowMask: (item.lowMask | b.lowMask) >>> 0,
              highMask: item.highMask | b.highMask,
                score: item.score + b.value,
              });
            }
          next.sort((a, b) => b.score - a.score);
          beam = [];
          const seen = new Set();
          for (const item of next) {
            const k = item.highMask + ":" + item.lowMask;
            if (seen.has(k)) continue;
            seen.add(k);
            beam.push(item);
            if (beam.length >= 6) break;
          }
          if (!beam.length) break;
        }
        for (const item of beam)
          if (item.blocks.length === 6 && (!best || item.score > best.score))
            best = item;
      }
      if (!best) return null;
      const blocks = best.blocks.map((b) => ({
          center: b.center,
          radius: b.radius,
          numbers: [...b.numbers],
        })),
        p = {
          blocks,
          numbers: blocks.flatMap((b) => b.numbers),
          score: best.score,
        };
      return validPlay(p) ? p : null;
    }

    /* Seleção parcial exata: somente os 96 melhores são ordenados e materializados.
   Mesma pontuação, mesma ordem de desempate pelo índice de origem. */
    function topPoolCandidates(scores, limit = 96) {
      const pool = diversityCandidates(),
        heap = [];
      const worse = (a, b) =>
        scores[a] < scores[b] || (scores[a] === scores[b] && a > b);
      for (let index = 0; index < scores.length; index++) {
        if (heap.length < limit) {
          heap.push(index);
          let child = heap.length - 1;
          while (child) {
            const parent = (child - 1) >> 1;
            if (!worse(heap[child], heap[parent])) break;
            [heap[child], heap[parent]] = [heap[parent], heap[child]];
            child = parent;
          }
        } else if (worse(heap[0], index)) {
          heap[0] = index;
          let parent = 0;
          while (true) {
            let child = parent * 2 + 1;
            if (child >= heap.length) break;
            if (child + 1 < heap.length && worse(heap[child + 1], heap[child]))
              child++;
            if (!worse(heap[child], heap[parent])) break;
            [heap[child], heap[parent]] = [heap[parent], heap[child]];
            parent = child;
          }
        }
      }
      return heap
        .sort((a, b) => scores[b] - scores[a] || a - b)
        .map((index) => ({
          candidate: pool[index],
          score: scores[index],
          index,
        }));
    }

    function fastIndependentMotors(proposals) {
      const pool = diversityCandidates();
      const candidates = proposals.map((m) => topPoolCandidates(m.poolScores));
      let chosen = null,
        chosenScore = -Infinity;
      for (const step of [1, 5, 7]) {
        const selected = Array(12).fill(null),
          counts = Array(37).fill(0);
        for (let k = 0; k < 12; k++) {
          const i = (k * step) % 12;
          let best = null,
            value = -Infinity;
          for (const item of candidates[i]) {
            if (
              selected.some((c) => c && sharedCoverage(c, item.candidate) > 24)
            )
              continue;
            let newNumbers = 0;
            for (const n of item.candidate.play.numbers)
              if (!counts[n]) newNumbers++;
            const score = item.score + 0.08 * newNumbers;
            if (score > value) {
              value = score;
              best = item.candidate;
            }
          }
          if (!best) break;
          selected[i] = best;
          for (const n of best.play.numbers) counts[n]++;
        }
        if (selected.some((c) => !c) || counts.some((n) => !n)) continue;
        const score = selected.reduce(
          (sum, c, i) => sum + candidateFit(c, proposals[i].weights),
          0,
        );
        if (score > chosenScore) {
          chosenScore = score;
          chosen = selected;
        }
      }
      if (!chosen) {
        for (let shift = 0; shift < 37; shift++) {
          const selected = diversitySafety.map((c) =>
            diversityCandidate(rotatedDiversity(c.play, shift)),
          );
          const score = selected.reduce(
            (sum, c, i) => sum + candidateFit(c, proposals[i].weights),
            0,
          );
          if (score > chosenScore) {
            chosenScore = score;
            chosen = selected;
          }
        }
      }
      const result = proposals.map((m, i) => {
        const { weights, poolScores, ...motor } = m;
        const play = copy(chosen[i].play);
        play.score = candidateFit(chosen[i], weights);
        return { ...motor, score: play.score, play };
      });
      if (!validMotorEnsemble(result))
        throw Error("CONJUNTO INCOMPLETO: " + proposals[0].bankId);
      result.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
      result.forEach((m, i) => (m.rank = i + 1));
      return result;
    }

    function coordinateOwnerVariations(forecasts) {
      for (const owner of VARIANT_OWNERS) {
        const group = forecasts.filter((f) => f.owner === owner.id);
        if (!group.length) continue;
        const alternatives = group.map((f) => {
          if (owner.id === "CONSENSUS" || owner.id === "UNION") {
            const weights = Array(37).fill(0);
            const members =
              owner.id === "UNION" ? f.motors.slice(0, 3) : f.motors;
            for (const m of members)
              for (const n of m.play.numbers)
                weights[ix(n)] += 1 / (1 + m.rank * 0.1);
            applySpatial(weights, state.history, 0.25);
            const ranked = topPoolCandidates(
              diversityCandidates().map((candidate) =>
                candidateFit(candidate, weights),
              ),
            );
            return [
              f.choice,
              ...ranked.slice(0, 96).map((r) => ({
                key: owner.id,
                rank: 0,
                play: { ...copy(r.candidate.play), score: r.score },
                score: r.score,
                spatialKeys: [...spatialRead(state.history).keys],
              })),
            ];
          }
          let motors =
            owner.id === "FIXED" ? f.motors.slice(0, 4) : [...f.motors];
          if (owner.id === "BEST" || owner.id === "SWITCH")
            motors.sort(
              (a, b) =>
                variantMotorRate(b.key, owner.id === "BEST" ? 20 : 12) -
                  variantMotorRate(a.key, owner.id === "BEST" ? 20 : 12) ||
                a.rank - b.rank,
            );
          if (owner.id === "NUMBER")
            motors.sort((a, b) => {
              const score = (m) =>
                compareNumberCombination(
                  { play: m.play, covered: m.play.numbers },
                  state.history.at(-1),
                  state.history,
                ).score;
              return score(b) - score(a) || a.rank - b.rank;
            });
          return [f.choice, ...motors];
        });
        const prepared = alternatives.map((items) => {
          const seen = new Set();
          return items
            .filter((m) => {
              const code = coverageCode(m.play);
              if (seen.has(code)) return false;
              seen.add(code);
              return true;
            })
            .map((motor) => ({
              motor,
              candidate: diversityCandidate(motor.play),
            }));
        });
        let final = null;
        for (const order of [0, 1, 2, 3, 4, 5, 6, 7]) {
          const selected = Array(8).fill(null),
            counts = Array(37).fill(0);
          let failed = false;
          for (let k = 0; k < 8; k++) {
            const index = (k + order) % 8,
              f = group[index];
            const choices = prepared[index];
            let best = null,
              bestScore = -Infinity;
            for (let i = 0; i < choices.length; i++) {
              const { motor, candidate } = choices[i];
              if (
                selected.some(
                  (m) =>
                    m &&
                    sharedCoverage(diversityCandidate(m.play), candidate) > 27,
                )
              )
                continue;
              let additional = 0;
              for (const n of motor.play.numbers) if (!counts[n]) additional++;
              const score = (i === 0 ? 0.25 : 0) + 1 / (1 + i) + additional * 2;
              if (score > bestScore) {
                best = motor;
                bestScore = score;
              }
            }
            if (!best) {
              failed = true;
              break;
            }
            selected[index] = {
              ...copy(best),
              bankId: f.bankId,
              owner: f.owner,
              variation: f.variation,
            };
            if (owner.id === "FIXED")
              selected[index].autoRank = best.autoRank || best.rank;
            if (owner.id === "NUMBER")
              Object.assign(selected[index], {
                type: "NUMBER",
                trigger: state.history.at(-1),
                sourceNumber: best.sourceNumber ?? state.history.at(-1),
                sourceTurn: best.sourceTurn ?? state.totalTurns,
              });
            for (const n of best.play.numbers) counts[n]++;
          }
          if (!failed && counts.every(Boolean)) {
            final = selected;
            break;
          }
        }
        if (!final) {
          // Reserva de conjuntos inteiros: conserva a regra da original, inclusive
          // AUTO exclusivamente 1–4, sem transformar CONSENSO em um motor isolado.
          const options = group.map((f) => {
            const weights = new Map(f._weights.map((m) => [m.key, m.weights]));
            return Array.from({ length: 37 }, (_, shift) => {
              const motors = f.motors
                .map((m, i) => {
                  const play = rotatedDiversity(diversitySafety[i].play, shift);
                  play.score = play.numbers.reduce(
                    (sum, n) => sum + weights.get(m.key)[ix(n)],
                    0,
                  );
                  return { ...m, play, score: play.score };
                })
                .sort(
                  (a, b) => b.score - a.score || a.key.localeCompare(b.key),
                );
              motors.forEach((m, i) => (m.rank = i + 1));
              return {
                motors,
                choice: chooseVariant(
                  f.owner,
                  f.variation,
                  motors,
                  state.history,
                ),
              };
            });
          });
          for (let order = 0; order < 8 && !final; order++) {
            const selected = Array(8).fill(null),
              banks = Array(8).fill(null),
              counts = Array(37).fill(0);
            for (let k = 0; k < 8; k++) {
              const index = (k + order) % 8;
              let best = null,
                bestValue = -Infinity;
              for (const option of options[index]) {
                const candidate = diversityCandidate(option.choice.play);
                if (
                  selected.some(
                    (m) =>
                      m &&
                      sharedCoverage(diversityCandidate(m.play), candidate) >
                        27,
                  )
                )
                  continue;
                const gain = option.choice.play.numbers.filter(
                  (n) => !counts[n],
                ).length;
                const value = gain * 2 + option.choice.score / 100;
                if (value > bestValue) {
                  best = option;
                  bestValue = value;
                }
              }
              if (!best) break;
              selected[index] = best.choice;
              banks[index] = best.motors;
              for (const n of best.choice.play.numbers) counts[n]++;
            }
            if (selected.every(Boolean) && counts.every(Boolean)) {
              final = selected;
              for (let i = 0; i < 8; i++) group[i].motors = banks[i];
            }
          }
        }
        if (!final)
          throw Error(
            "NÃO FOI POSSÍVEL DIVERSIFICAR AS OITO VARIAÇÕES: " + owner.id,
          );
        for (let i = 0; i < 8; i++) group[i].choice = final[i];
      }
    }

    const coverageCandidateMemo = new WeakMap();
    function diversityCandidate(play) {
      if (coverageCandidateMemo.has(play))
        return coverageCandidateMemo.get(play);
      const covered = new Set(play.numbers);
      let low = 0,
        high = 0;
      for (let n = 0; n < 37; n++)
        if (!covered.has(n)) {
          if (n < 32) low |= 1 << n;
          else high |= 1 << (n - 32);
        }
      const candidate = { play, low, high, code: coverageCode(play) };
      coverageCandidateMemo.set(play, candidate);
      return candidate;
    }

    function allVariantForecasts(h, onlyOwner = null) {
      if (h.length < 8) return [];
      const key =
        h.join(",") +
        "|" +
        state.totalTurns +
        (onlyOwner ? "|OWNER:" + onlyOwner : "");
      if (variantForecastCache.has(key)) return variantForecastCache.get(key);
      const spatial = spatialRead(h),
        baseWeights = new Map(),
        shared = { base: new Map(), additive: new Map() };
      for (const family of FAMILIES)
        for (const radius of RADII) {
          const base = weightsFor(h, family, radius),
            key = family + "_" + radius;
          baseWeights.set(key, base);
          const normalized = normalizeSpace(base);
          shared.base.set(
            key,
            diversityCandidates().map((c) => candidateFit(c, normalized)),
          );
        }
      const forecasts = [];
      for (const owner of VARIANT_OWNERS.filter(
        (o) =>
          !onlyOwner ||
          (Array.isArray(onlyOwner)
            ? onlyOwner.includes(o.id)
            : o.id === onlyOwner),
      ))
        for (let variation = 1; variation <= 8; variation++) {
          const bankId = variantBookId(owner.id, variation),
            proposals = [];
          for (const family of FAMILIES)
            for (const radius of RADII) {
              const analysis = variantAnalyticalWeights(
                h,
                family,
                radius,
                owner.id,
                variation,
                baseWeights.get(family + "_" + radius),
                spatial,
                shared,
              );
              proposals.push({
                key: bankId + "::" + family + "_" + radius,
                bankId,
                owner: owner.id,
                variation,
                family,
                radius,
                weights: analysis.weights,
                poolScores: analysis.poolScores,
                spatialKeys: [...spatial.keys],
                componentShares: [...spatial.adaptive.shares],
                adaptiveSamples: spatial.adaptive.samples,
                spatialVersion: VERSION,
          readingVersion:"6.6.13",readingCandidates:37,
              });
            }
          const cs = fastIndependentMotors(proposals);
          forecasts.push({
            bankId,
            owner: owner.id,
            name: owner.name,
            variation,
            motors: cs,
            _weights: proposals,
            choice: chooseVariant(owner.id, variation, cs, h),
          });
        }
      coordinateOwnerVariations(forecasts);
      for (const f of forecasts) delete f._weights;
      variantForecastCache.set(key, forecasts);
      if (variantForecastCache.size > 4)
        variantForecastCache.delete(variantForecastCache.keys().next().value);
      return forecasts;
    }

  
    async function prepareBlockParallel() {
    // Um único calculador por leitura; todos os 65 bancos continuam ativos.
    // prepareBlock conserva a mesma busca, pesos, ordenação e regras.
    return prepareBlock();
  }


    /* Os contadores de sequência não são apagados pelo descarte da janela. */
    function updateStrategyStreaks(turn = state.totalTurns) {
      for (const [id, rows] of Object.entries(state.strategyTimeline)) {
        const closed = rows
          .filter((r) => r.closed && r.closedTurn <= turn)
          .sort((a, b) => a.closedTurn - b.closedTurn);
        let counter = state.strategyStreaks[id];
        if (!counter) {
          let loss = 0;
          for (
            let i = closed.length - 1;
            i >= 0 && closed[i].result === "LOSS";
            i--
          )
            loss++;
          const last = closed.at(-1);
          if (last)
            state.strategyStreaks[id] = {
              loss,
              closedTurn: last.closedTurn,
              result: last.result,
            };
          continue;
        }
        for (const row of closed)
          if (row.closedTurn > counter.closedTurn) {
            counter = {
              loss: row.result === "LOSS" ? counter.loss + 1 : 0,
              closedTurn: row.closedTurn,
              result: row.result,
            };
          }
        state.strategyStreaks[id] = counter;
      }
    }
    function postThreeChoice(block = currentBlock()) {
      if (!block) return null;
      const candidates = timelineDefinitions()
        .filter((d) => !["POSTLOSS", "POST3LOSS"].includes(d.id))
        .map((def) => {
          const stats = postLossStats(def.id),
            counter = state.strategyStreaks[def.id];
          const streak = counter?.loss ?? stats.streak,
            lossTurn = counter?.closedTurn ?? stats.last?.closedTurn;
          return { ...def, ...stats, streak, lossTurn };
        })
        .filter(
          (candidate) =>
            candidate.streak >= 3 &&
            candidate.lossTurn > (state.postThreeUsed[candidate.id] || 0),
        )
        .sort(
          (a, b) =>
            b.score - a.score ||
            b.samples - a.samples ||
            b.lossTurn - a.lossTurn ||
            a.id.localeCompare(b.id),
        );
      for (const candidate of candidates) {
        const motor = timelineMotor(candidate.id, block);
        if (!validPlay(motor?.play)) continue;
        return {
          ...candidate,
          motor: {
            ...copy(motor),
            postLossTarget: {
              kind: "POST3",
              id: candidate.id,
              name: candidate.name,
              lossTurn: candidate.lossTurn,
              streak: candidate.streak,
              samples: candidate.samples,
              recoveries: candidate.recoveries,
              repeatLoss: candidate.repeatLoss,
              score: candidate.score,
              defenseStrategy:
                motor.thirdTarget?.id ||
                motor.globalStrategyTarget?.id ||
                motor.masterTarget?.defenseStrategy ||
                candidate.id,
            },
          },
        };
      }
      return null;
    }
    function priorityRecoveryChoice(block = currentBlock()) {
      if (state.postThreeEnabled) {
        const choice = postThreeChoice(block);
        if (choice) return choice;
      }
      return state.postLossEnabled || state.strategy === "POSTLOSS"
        ? postLossChoice(block)
        : null;
    }

    /* Só remove cópias de versões anteriores depois de gravar a sessão completa
   na chave atual; a sessão em uso e seus registros permanecem intactos. */
    function pruneSavedVersions() {
      if (!localStorage.getItem(KEY)) return;
      for (const oldKey of OLD_KEYS) {
        try {
          localStorage.removeItem?.(oldKey);
          localStorage.removeItem?.(oldKey + "_QUEUE");
        } catch (error) {}
      }
    }

    let state = fresh();
    let busy = false;
    let saveError = "";

    self.onmessage = async function (event) {
      const data = event.data;
      try {
        if (data.action === "IMPORT") {
          importNumbersCore(data.numbers, data.settings, data.manualLog);
          self.postMessage({ id: data.id, kind: "FINAL", state });
          return;
        }
        state = normalizeState(data.state);
        clearRuntimeCaches();
        if (data.action === "RESTORE") {
          clearSpatialCaches();
          await prepareBlockParallel();
          self.postMessage({ id: data.id, kind: "FINAL", state });
          return;
        }
        if (data.action === "BANKS") {
          const forecasts = allVariantForecasts(
            state.history.slice(-70),
            data.owners,
          );
          const variants = forecasts.map((f) => ({
            bankId: f.bankId,
            owner: f.owner,
            name: f.name,
            variation: f.variation,
            motors: f.motors.map(compactMotor),
            choice: compactMotor(f.choice),
          }));
          self.postMessage({ id: data.id, variants });
          return;
        }
        const before = undoSnapshot();
        spin(data.number, "TEMPO REAL");
        if (!state.block.data && state.history.length >= 8) await prepareBlockParallel();
        const row = state.ledger.at(-1);
        state.manualLog.push({
          id: Date.now()+"_"+state.totalTurns,turn:state.totalTurns,number:data.number,
          result:row.result,profit:row.profit,strategy:row.strategy,motor:row.motor,
          phase:row.phase,controller:row.controller,masterTarget:copy(row.masterTarget),
          playRoute:row.playRoute,postLossTarget:copy(row.postLossTarget),timestamp:Date.now()
        });
        state.manualCount++;
        const undoOps=inverseChanges(before,undoSnapshot());
        self.postMessage({ id:data.id, kind:'SPIN', state, undoOps });
      } catch (error) {
        self.postMessage({
          id: data.id,
          error: String(error.message || error),
        });
      }
    };
  }


  async function toggleStructuralMemory666(){
    if(busy)return;
    if(!cycleIsFree()){alert('AGUARDE ENCERRAR O CICLO ATUAL.');return;}
    const previous=copy(state);
    setBusy(true,'PREPARANDO MEMÓRIA TRIANGULAR');await waitFrame();
    try{
      state.structuralMemoryEnabled=!state.structuralMemoryEnabled;
      state.block.data=null;clearSpatialCaches();
      const result=await workerRequest('RESTORE',{state:{...state,undoStack:[]}});
      if(!isCurrentApp())return;
      if(result){const stack=state.undoStack;state={...result,undoStack:stack};}
      else if(state.history.length>=8)prepareBlock();
      save();
    }catch(error){state=previous;clearSpatialCaches();alert(String(error.message||error));}
    finally{if(isCurrentApp()){setBusy(false);render();}}
  }

  function button(label, action, parent, extra = "") {
    const b = document.createElement("button");
    b.className = "btn " + extra;
    b.textContent = label;
    b.onclick = action;
    parent.appendChild(b);
    return b;
  }
  function sortedBlocks(play) {
    return validPlay(play)
      ? [...play.blocks].sort(
          (a, b) =>
            Object.keys(REGIONS).indexOf(region(a.center)) -
            Object.keys(REGIONS).indexOf(region(b.center)),
        )
      : [];
  }
  function centersHTML(play) {
    return sortedBlocks(play)
      .map(
        (b) =>
          `<div class="center ${b.radius === 1 ? "short" : ""}"><strong>${b.center}</strong><small>${region(b.center)}</small><small>${b.radius} ${b.radius === 1 ? "VIZINHO" : "VIZINHOS"}</small></div>`,
      )
      .join("");
  }
  function cloud(numbers, highlight = []) {
    const marked = new Set(highlight);
    return `<div class="cloud">${numbers.map((n) => `<span class="${marked.has(n) ? "danger" : ""}">${n}</span>`).join("")}</div>`;
  }
  function tableHTML(headers, rows) {
    return `<div class="tablewrap"><table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c ?? "—"}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  function metrics(rows) {
    const closed = rows.filter((r) =>
        ["GREEN", "GREEN G1", "LOSS"].includes(r.result),
      ),
      green = closed.filter((r) => r.result === "GREEN").length,
      g1 = closed.filter((r) => r.result === "GREEN G1").length,
      loss = closed.filter((r) => r.result === "LOSS").length,
      net = closed.reduce((s, r) => s + (r.profit || 0), 0);
    return { total: closed.length, green, g1, loss, net };
  }
  const css = `
*{box-sizing:border-box}body{margin:0;background:#101720;color:#f4f7fb;font:13px Arial,sans-serif}.app{max-width:1100px;margin:auto;padding:12px}h1{font-size:24px;text-align:center;color:#59e5ff;margin:15px 0 5px}.sub{text-align:center;font-size:11px;color:#b3c7d9;line-height:1.7;margin-bottom:15px}.panel{background:#1d2938;border:1px solid #405a73;border-radius:11px;padding:12px;margin:10px 0}.title{color:#47e1f8;font-size:12px;font-weight:bold;margin:13px 0}.row{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0}.btn{background:#304359;border:1px solid #708aa6;border-radius:7px;color:white;padding:10px;font-size:11px;font-weight:bold;cursor:pointer}.btn.active{background:#087e9c;border-color:#4eeaff}.btn.trainer{background:#263f4c;border-color:#4d8191}.btn.trainer.active,.btn.trainer.on{background:#086c4d;border:2px solid #42ffb0;box-shadow:0 0 13px #27e99a77,inset 0 0 8px #27e99a33}.btn.number.active{background:#705200;border:2px solid #ffdf60;box-shadow:0 0 16px #ffce3677}.btn.number10.active{background:#512884;border:2px solid #d6a3ff;box-shadow:0 0 16px #ae67ff77}.btn:disabled,.key:disabled{opacity:.35;cursor:not-allowed}textarea{width:100%;height:88px;padding:10px;border-radius:8px;background:#0c1623;border:1px solid #62758b;color:white}.status{font-size:12px;color:#b5d7e8;padding:9px 0;overflow-wrap:anywhere}.windowBox{background:#102b2c;border:1px solid #32bba2;border-radius:9px;padding:12px;margin:10px 0}.windowBox strong{font-size:27px;color:#54f0c3}.bar{height:10px;background:#34475a;border-radius:20px;overflow:hidden;margin:10px 0}.barfill{height:100%;background:#31dca9}.centers{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;margin:12px 0}.center{min-height:86px;min-width:0;padding:8px 2px;border:2px solid #20d7f4;border-radius:9px;background:#086c91;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;text-align:center}.center.short{background:#d2a62b;border-color:#ffe28a;color:#111}.center strong{font-size:clamp(27px,5vw,43px);line-height:1;font-weight:900}.center small{font-size:9px;font-weight:bold}.keys{display:grid;grid-template-columns:repeat(6,1fr);gap:5px}.key{touch-action:manipulation;height:44px;border:1px solid #71849b;border-radius:7px;color:white;font-size:16px;font-weight:bold;cursor:pointer}.key.zero{grid-column:span 6}.history{display:flex;flex-wrap:wrap;gap:5px}.chip{min-width:47px;padding:8px;border:2px solid #667f99;border-radius:7px;text-align:center}.chip b{display:block;font-size:18px}.chip small{font-size:9px}.chip.green{border:3px solid #29e99a}.chip.loss{border:3px solid #ff416e}.chip.gale{border:3px solid #ffe045}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.metric{background:#293c51;border-radius:8px;padding:11px 5px;text-align:center}.metric small{display:block;font-size:9px;color:#bbd0e2}.metric b{display:block;font-size:22px;margin-top:5px}.good{color:#4ee4a4}.bad{color:#ff778c}.box{background:#132235;border:1px solid #46617d;border-radius:9px;padding:12px;margin:9px 0;line-height:1.7;overflow-wrap:anywhere}.g1card{background:#142438;border:1px solid #55728f;border-radius:9px;padding:12px;margin:9px 0}.g1card.selected{border:2px solid #38e6aa;background:#10382e}.cloud{display:flex;flex-wrap:wrap;gap:5px;margin:9px 0}.cloud span{display:inline-flex;min-width:36px;height:36px;align-items:center;justify-content:center;background:#2b4058;border:1px solid #64829f;border-radius:7px;font-weight:bold}.cloud span.danger{background:#69283e;border-color:#ff6989}.tablewrap{overflow:auto}table{width:100%;min-width:610px;border-collapse:collapse;font-size:11px}td,th{padding:9px;text-align:left;border-bottom:1px solid #41556e}th{color:#57def4}.listrow{border-bottom:1px solid #35485d;padding:9px 2px;font-size:11px;line-height:1.7;overflow-wrap:anywhere}.muted{color:#b1c7d9;font-size:11px;line-height:1.7;overflow-wrap:anywhere}.head{width:100%;background:#2c4056;color:white;border:1px solid #66829f;border-radius:8px;padding:12px;font-weight:bold;text-align:left;cursor:pointer;display:flex;justify-content:space-between;gap:8px}.hide{display:none}input[type=number]{width:110px;padding:9px;background:#101b2a;color:white;border:1px solid #637b95;border-radius:7px}select{padding:10px;background:#101b2a;color:white;border:1px solid #8d6eb0;border-radius:7px;max-width:100%}.play10{position:relative;min-height:86px}#centers{position:relative}.reject10{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);z-index:3;background:#d20b2b;color:white;border:2px solid #ff8c9c;text-align:center;font-size:clamp(19px,5vw,31px);font-weight:900;padding:8px 4px;box-shadow:0 3px 18px #000b;pointer-events:none}.reject10 small{display:block;font-size:10px;line-height:1.4;margin-top:3px}.triangleDrawing{max-width:540px;margin:10px auto}.triangleDrawing svg{display:block;width:100%;height:auto}@media(max-width:600px){.center{min-height:79px}.center strong{font-size:clamp(25px,7vw,37px)}.center small{font-size:8px}.btn{font-size:10px;padding:9px}}
`;
  const variationUINodes = new Map();
  const timelineUINodes = new Map();
  let timelineLayoutKey = "";
  /* CONTROLES RECOLHÍVEIS. Os elementos são construídos uma vez; o lançamento
   troca somente os textos, os centros e o placar. */
  function groupDetails(id, title, parent, open = false) {
    const details = document.createElement("details");
    details.className = "controlGroup";
    details.open = state.groupsOpen[id] ?? open;
    const summary = document.createElement("summary");
    summary.textContent = title;
    details.appendChild(summary);
    details.ontoggle = () => {
      state.groupsOpen[id] = details.open;
      scheduleSave();
    };
    parent.appendChild(details);
    return details;
  }

  function variationControls(owner, parent) {
    const details = groupDetails(
      "owner:" + owner.id,
      owner.name,
      parent,
      false,
    );
    const summary = details.querySelector("summary");
    const row = document.createElement("div");
    row.className = "row";
    const base = button(
      "BASE • " + owner.name,
      () => changeVariation(owner.id, 0),
      row,
    );
    base.dataset.variantOwner = owner.id;
    base.dataset.variant = "0";
    base.title =
      "Selecionar a estratégia base, com o mesmo cálculo disponível ao Treinador Global.";
    const third = button(
      "3º POR DESEMPENHO • AUTOMÁTICO",
      () => changeVariation(owner.id, -3),
      row,
    );
    third.dataset.thirdOwner = owner.id;
    const buttons = new Map();
    for (let variation = 1; variation <= 8; variation++) {
      const b = button(
        "V" + variation + " • " + VARIANT_PROFILES[variation - 1].name,
        () => changeVariation(owner.id, variation),
        row,
      );
      b.dataset.variantOwner = owner.id;
      b.dataset.variant = String(variation);
      buttons.set(variation, b);
    }
    details.appendChild(row);
    variationUINodes.set(owner.id, {
      summary,
      row,
      base,
      third,
      buttons,
      order: "",
    });
  }

  function buildStrategies() {
    const signature = JSON.stringify(state.created.map((c) => [c.id, c.name]));
    if (strategyButtonsSignature === signature) return;
    strategyButtonsSignature = signature;
    const root = $("strategies");
    root.innerHTML = "";
    variationUINodes.clear();
    const trainers = groupDetails(
      "trainers",
      "TREINADORES INDEPENDENTES",
      root,
      true,
    );
    const row = document.createElement("div");
    row.className = "row";
    const master = button(
      "TREINADOR GLOBAL MASTER",
      () => changeStrategy("MASTER"),
      row,
      "trainer",
    );
    master.dataset.choice = "MASTER";
    const trainer = button(
      "TREINADOR GLOBAL • ESTRATÉGIA",
      () => changeStrategy("TRAINER"),
      row,
      "trainer",
    );
    trainer.dataset.choice = "TRAINER";
    const postloss = button("PÓS-LOSS", () => togglePostLoss(), row, "trainer");
    postloss.dataset.choice = "POSTLOSS";
    const postThree = button(
      "PÓS-3 LOSS • TODAS",
      () => togglePostThree(),
      row,
      "trainer",
    );
    postThree.dataset.choice = "POST3LOSS";
    trainers.appendChild(row);
    variationControls(
      VARIANT_OWNERS.find((o) => o.id === "NUMBER"),
      trainers,
    );
    const originals = groupDetails(
      "originals",
      "ESTRATÉGIAS ORIGINAIS",
      root,
      false,
    );
    for (const owner of VARIANT_OWNERS.filter((o) => o.id !== "NUMBER"))
      variationControls(owner, originals);
    const adaptive = groupDetails("adaptive", "12 ADAPTATIVAS", root, false);
    const ar = document.createElement("div");
    ar.className = "row";
    for (const config of ADAPTATIVES) {
      const b = button(
        config.name,
        () => changeStrategy("ADAPTIVE", config.id),
        ar,
      );
      b.dataset.choice = config.id;
    }
    adaptive.appendChild(ar);
    const auto = groupDetails("auto", "AUTO 1–4", root, false),
      rr = document.createElement("div");
    rr.className = "row";
    for (let rank = 1; rank <= 4; rank++) {
      const b = button(
        "AUTO " + rank + "º",
        () => {
          if (busy || !cycleIsFree()) return;
          state.rank = rank;
          changeStrategy("AUTO");
        },
        rr,
      );
      b.dataset.rank = String(rank);
    }
    auto.appendChild(rr);
    if (state.created.length) {
      const custom = groupDetails("custom", "PERSONALIZADAS", root, false),
        cr = document.createElement("div");
      cr.className = "row";
      for (const item of state.created) {
        const b = button(
          item.name,
          () => changeStrategy("CREATED", null, "CREATED:" + item.id),
          cr,
        );
        b.dataset.created = item.id;
      }
      custom.appendChild(cr);
    }
  }

  function changeStrategy(strategy, adaptive = null, created = null) {
    if (busy) return;
    if (!cycleIsFree()) {
      alert("AGUARDE ENCERRAR O CICLO ATUAL.");
      return;
    }
    state.strategy = strategy;
    state.focusTimelineId = null;
    state.adaptive = adaptive || state.adaptive;
    state.activeCreated = created;
    state.manual = null;
    scheduleSave();
    render();
  }

  function changeVariation(owner, variation) {
    if (busy) return;
    if (!cycleIsFree()) {
      alert("AGUARDE ENCERRAR O CICLO ATUAL.");
      return;
    }
    state.variantSelections[owner] = variation;
    state.strategy = owner;
    state.focusTimelineId = null;
    state.manual = null;
    scheduleSave();
    render();
  }

  function metricsHTML(rows) {
    const m = metrics(rows),
      best = displayedMasterChoice();
    return (
      '<div class="metrics">' +
      [
        ["CICLOS", m.total],
        ["GREEN", m.green],
        ["GREEN G1", m.g1],
        ["LOSS", m.loss],
        ["ACERTOS", pct(m.green + m.g1, m.total)],
        [
          best?.committed?"MASTER NO CICLO":best?.priority?"PRIORIDADE PÓS-LOSS":"INDICAÇÃO MASTER",
          best?esc(best.name)+"<small>"+
            (best.total?"ÚLTIMAS 5: W "+best.recentDirect+" • G1 "+best.recentG1+" • R "+best.recentLoss+
              (best.recentPending?" • EM G1 "+best.recentPending:""):"ESCOLHA INICIAL • SEM AVALIAÇÕES")+
            "</small>":"AGUARDANDO HISTÓRICO",
        ],
      ]
        .map(
          ([label, value]) =>
            '<div class="metric"><small>' +
            label +
            "</small><b>" +
            value +
            "</b></div>",
        )
        .join("") +
      "</div>"
    );
  }

  let renderStatsCache = null;
  function render() {
if(!isCurrentApp())return;
    renderStatsCache = new Map();

    try {performRender();coordinator.render?.();
    } catch (error) {
      console.error(error);
      if ($("status"))
        $("status").textContent = "ERRO: " + String(error.message || error);
    } finally { renderStatsCache = null; }
  }

  function performRender() {
const receipt=$('importAudit'),audit=state.importAudit;
if(receipt)receipt.textContent=audit?'ÚLTIMA IMPORTAÇÃO '+audit.historyId+' • '+audit.count+
' NÚMEROS • MAIS ANTIGO '+audit.oldest+' • MAIS RECENTE '+audit.newest+' • CONFIG '+audit.settingsId:'';

    buildStrategies();
    const block = currentBlock(),
      definition = activeDefinition();
    const motor =
      state.defense ||
      state.cycle?.original ||
      (block ? activeMotor(block.global) : null);
    $("status").textContent =
      state.block.size +
      " NA JANELA + " +
      state.block.pending +
      " NOVOS • GIRO " +
      state.totalTurns +
      " • " +
      state.phase +
      (saveError ? " • FALHA AO SALVAR: " + saveError : "");
    $("counter").textContent = state.block.size + " / 70";
    $("barfill").style.width = (100 * state.block.size) / 70 + "%";
    $("windowInfo").textContent =
      "JANELA " +
      state.block.size +
      " • NOVOS " +
      state.block.pending +
      "/10 • " +
      (state.block.data
        ? "JOGADA ATUALIZADA • RETIRA DEZ ANTIGOS A CADA DEZ NOVOS"
        : "PREPARANDO PRÓXIMA JOGADA");
    $("cycleInfo").textContent = cycleIsFree()
      ? "CICLO LIVRE"
      : "CICLO " + state.phase + " • JOGADA E DEFESA PRESERVADAS";
    $("selected").textContent =
      definition.name +
      " • " +
      (motor?.key || "AGUARDANDO ATUALIZAÇÃO") +
      (state.cycle?.decision ? " • G1 " + state.cycle.decision.mode : "");
    patchHTML($("centers"), centersHTML(motor?.play));
    $("coverage").textContent = motor
      ? "28 COBERTOS • 9 DESCOBERTOS: " + missing(motor.play).join(" • ")
      : "IMPORTE DE 8 A 70 RESULTADOS.";
    for (const b of document.querySelectorAll("[data-choice]"))
      b.classList.toggle(
        "active",
        b.dataset.choice === "POST3LOSS"
          ? !!state.postThreeEnabled
          : b.dataset.choice === "POSTLOSS"
            ? !!state.postLossEnabled
            : state.strategy === "ADAPTIVE"
              ? b.dataset.choice === state.adaptive
              : b.dataset.choice === state.strategy,
      );
    for (const b of document.querySelectorAll("[data-rank]"))
      b.classList.toggle(
        "active",
        state.strategy === "AUTO" && Number(b.dataset.rank) === state.rank,
      );
    for (const b of document.querySelectorAll("[data-option]"))
      b.classList.toggle("active", !!state[b.dataset.option]);
    for (const b of document.querySelectorAll("[data-created]"))
      b.classList.toggle(
        "active",
        state.strategy === "CREATED" &&
          state.activeCreated === "CREATED:" + b.dataset.created,
      );
    updateVariantButtons();
    updateVariationRanks();
    renderTimelinePanel();
    for (const b of document.querySelectorAll("[data-third-owner]"))
      b.classList.toggle(
        "active",
        activeVariationOwner() === b.dataset.thirdOwner &&
          state.variantSelections[b.dataset.thirdOwner] === -3,
      );
    if (
      state.strategy === "POSTLOSS" ||
      state.postLossEnabled ||
      state.postThreeEnabled
    ) {
      const target =
        state.cycle?.original?.postLossTarget || motor?.postLossTarget;
      const prefix =
        target?.kind === "POST3"
          ? "JOGADA PÓS-3 LOSS • PRIORIDADE"
          : "JOGADA PÓS-LOSS • ADAPTATIVAS";
      if (target)
        $("selected").textContent =
          prefix +
          " • " +
          target.name +
          " • RECUPERAÇÕES " +
          target.recoveries +
          "/" +
          target.samples +
          " • LOSS REPETIDOS " +
          target.repeatLoss +
          " • " +
          state.phase;
      else if (state.strategy !== "POSTLOSS")
        $("selected").textContent +=
          (state.postLossEnabled ? " • PÓS-LOSS LIGADO" : "") +
          (state.postThreeEnabled ? " • PÓS-3 LOSS LIGADO" : "");
      else $("selected").textContent = prefix + " • AGUARDANDO LOSS FINAL";
      if (!motor)
        $("coverage").textContent =
          state.strategy === "POSTLOSS"
            ? "Aguarda um LOSS final. Sem mínimo de ciclos."
            : "Preparando a próxima jogada do Treinador Global.";
    }
    renderLastNumbers();
    $("general").hidden = !state.open.general;
    if (state.open.general) {
      patchHTML($("general"),
        '<div class="title">RESULTADOS DA JANELA</div>' +
        resultsSeparatedHTML(state.ledger) +
        '<div class="title">MANUAIS ARQUIVADOS</div>' +
        resultsSeparatedHTML(state.manualLog)+reanalysisSummaryHTML());
    }
    const target =
      state.cycle?.original?.postLossTarget || motor?.postLossTarget;
    $("selected").className =
      "playNotice " + (target ? "postLossNotice" : "normalNotice");
    if (
      state.strategy === "MASTER" &&
      !state.cycle &&
      masterRestRemaining() > 0 &&
      !target
    ) {
      $("selected").textContent =
        "MASTER • SEM ENTRADA • FALTAM " +
        masterRestRemaining() +
        " GIRO(S) DE PAUSA";
      $("selected").className = "playNotice normalNotice";
      $("cycleInfo").textContent =
        "CICLO ENCERRADO • MASTER AGUARDA DOIS RESULTADOS COMPLETOS";
      $("coverage").textContent =
        "PAUSA MASTER: registre os resultados, sem nova entrada.";
    } else if (state.strategy === "MASTER" && motor?.masterTarget) {
      $("selected").textContent =
        "MASTER ESCOLHEU: " + motor.masterTarget.name + " • " + state.phase;
    }
    if(state.structuralMemoryEnabled)$("selected").textContent+=" • TRIANGULAÇÃO EXPERIMENTAL";

    renderFocusGame(motor);
    $("stake").value = state.stake;
    $("multiplier").value = state.multiplier;
  }

  function scheduleSave() {
if(!isCurrentApp())return;

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (busy || inputRunning) {
        scheduleSave();
        return;
      }
      saveAsync();
    }, 150);
  }

  function setBusy(value, message = "") {
if(!isCurrentApp())return;

    busy = value;
    if (message) $("status").textContent = message;
    for (const id of ["import", "restore", "undo", "clear"])
      if ($(id)) $(id).disabled = value;
    for (const key of document.querySelectorAll(".key"))
      key.disabled = value && !inputRunning;
  }

  function undoSide() {
    if (busy || !state.undoStack.length) return;
    checkpointSerial++;
    checkpointEpoch++;
    applyInverse(state.undoStack.pop().ops);
    clearSpatialCaches();
    scheduleSave();
    render();
  }

  function workerRequest(action, payload) {
    if (typeof Worker === "undefined" || workerDisabled)
      return Promise.reject(Error('O cálculo em segundo plano está indisponível. A sessão foi preservada.'));
    return new Promise((resolve, reject) => {
      try {
        if (!workerClient) {
          const url = URL.createObjectURL(
            new Blob(["(" + analysisBackground.toString() + ")();"], {
              type: "text/javascript",
            }),
          );
          workerClient = new Worker(url);
          URL.revokeObjectURL(url);
          if (globalThis['__analiseBetaWorker_'+side])
            globalThis['__analiseBetaWorker_'+side].terminate();
          globalThis['__analiseBetaWorker_'+side] = workerClient;
          workerClient.onmessage = (event) => {
            const message = event.data,
              request = clientRequests.get(message.id);
            if (!request) return;
            clientRequests.delete(message.id);
            if (message.error) request.reject(Error(message.error));
            else request.resolve(message.kind === 'SPIN' ? {state:message.state,undoOps:message.undoOps} : message.state);
          };
          workerClient.onerror = () => {
            workerDisabled = true;
            workerClient.terminate();
            workerClient = null;
            for (const request of clientRequests.values())
              request.reject(Error('O calculador foi interrompido pelo navegador. A sessão foi preservada.'));
            clientRequests.clear();
          };
        }
        const id = ++clientSequence;
        clientRequests.set(id, { resolve, reject });
        workerClient.postMessage({ id, action, ...payload });
      } catch (error) {
        workerDisabled = true;
        reject(Error('Não foi possível iniciar o calculador em segundo plano: '+String(error.message||error)));
      }
    });
  }

  async function loadHistory(
    numbers,
    { customSettings = null, customManualLog = null } = {},
  ) {
    if(!isCurrentApp()||busy||inputRunning||inputQueue.length)return;
clearTimeout(saveTimer);checkpointSerial++;checkpointEpoch++;checkpointNext=null;
if(workerClient){workerClient.onmessage=null;workerClient.onerror=null;workerClient.terminate();workerClient=null;}
clientRequests.clear();workerDisabled=false;

    const before = state,
      opts = customSettings || settings();
    setBusy(true, "IMPORTANDO HISTÓRICO");
    await waitFrame();
    try {
      const result = await workerRequest("IMPORT", {
        numbers,
        settings: opts,
        manualLog: customManualLog || [],
      });
if(!isCurrentApp())return;
      if (result) state = normalizeState(result);
      else importNumbersCore(numbers, opts, customManualLog || []);
      clearSpatialCaches();
      recoveryLocked = false;
      save();
      persistPendingInputs();
    } catch (error) {
      state = before;
      clearSpatialCaches();
      alert("ERRO NA IMPORTAÇÃO: " + String(error.message || error));
    } finally {
      setBusy(false);
      render();
    }
  }

  function addSideManual(n) {
    if (busy && !inputRunning) return;
    if (state.history.length < 8) {
      alert("IMPORTE DE 8 A 70 RESULTADOS.");
      return;
    }
    inputQueue.push(n);
    pendingReceipts.push(n);
    renderLastNumbers();
    persistPendingInputs();

    drainInputQueue();
  }

  async function drainInputQueue() {
    if (inputRunning || !inputQueue.length) return;
    inputRunning = true;
    busy=true;
    clearTimeout(saveTimer);
    const number = inputQueue.shift(),
      oldUndo = state.undoStack;
    await new Promise((resolve) => setTimeout(resolve, 0));
    const previousState = state;
    let before = null;
    const started = performance.now();
    try {
      const result = await workerRequest("SPIN", {
        number,
        state: { ...state, undoStack: [] },
      });
      if (result) state = { ...result.state, undoStack: oldUndo };
      else {
        before = undoSnapshot();
        spin(number, "TEMPO REAL");
        prepareBlock();
      }
      clearRuntimeCaches();
      const row = state.ledger.at(-1);
      if (result) {
        state.undoStack.push({turn:state.totalTurns, number, ops:result.undoOps});
      } else {
      state.manualLog.push({
        id: Date.now() + "_" + state.totalTurns,
        turn: state.totalTurns,
        number,
        result: row.result,
        profit: row.profit,
        strategy: row.strategy,
        motor: row.motor,
        phase: row.phase,
        controller: row.controller,
        masterTarget: copy(row.masterTarget),
        playRoute: row.playRoute,
        postLossTarget: copy(row.postLossTarget),
        timestamp: Date.now(),
      });
      state.manualCount++;
      state.undoStack.push({
        turn: state.totalTurns,
        number,
        ops: inverseChanges(before, undoSnapshot()),
      });
      }
      state.undoStack = state.undoStack.slice(-70);
      lastInputMs = performance.now() - started;
      pendingReceipts.shift();
      persistPendingInputs();
    } catch (error) {
      state = before ? { ...before, undoStack: oldUndo } : previousState;
      clearSpatialCaches();
      inputQueue = [];
      persistPendingInputs();
      alert("ERRO AO INSERIR NÚMERO: " + String(error.message || error));
    } finally {
      inputRunning = false;
      busy=false;
      render();
      saveAsync();

      if (inputQueue.length) drainInputQueue();
    }
  }

  async function importSideHistory(numbers) {
    if (busy) return;
    const clean = cleanNumbers(numbers).slice(-70);
    if (clean.length < 8) {
      alert("INFORME PELO MENOS OITO NÚMEROS DE 0 A 36.");
      return;
    }
    if (
      !confirm(
        "IMPORTAR " +
          clean.length +
          " RESULTADOS? A JANELA TERÁ " +
          clean.length +
          " NÚMEROS E RETIRARÁ DEZ ANTIGOS A CADA DEZ NOVOS. A PRÓXIMA JOGADA ATUALIZA A CADA NÚMERO.",
      )
    )
      return;
    $("paste").value = "";
    await loadHistory(clean);
  }

  function clearSide() {
    if (busy || !confirm("ZERAR HISTÓRICO, TREINADORES E REGISTROS?")) return;
    recoveryLocked = false;
    state = fresh();
    clearSpatialCaches();
    save();
    pendingReceipts = [];
    inputQueue = [];
    persistPendingInputs();
    render();
  }

  function updateVariationRanks() {
    for (const owner of VARIANT_OWNERS) {
      const ui = variationUINodes.get(owner.id);
      if (!ui) continue;
      const ranked = variationPerformance(owner.id),
        ready = ranked.some((r) => r.total > 0);
      ui.summary.textContent =
        owner.name +
        (ready
          ? " • MELHOR: V" +
            ranked[0].variation +
            " • 3º: V" +
            ranked[2].variation
          : " • SEM TESTES");
      for (const r of ranked) {
        const b = ui.buttons.get(r.variation);
        const text =
          (ready ? r.position + "º • " : "") +
          "V" +
          r.variation +
          " • " +
          VARIANT_PROFILES[r.variation - 1].name +
          " • " +
          (r.total ? pct(r.hits, r.total) : "SEM TESTES");
        if (b.textContent !== text) b.textContent = text;
        b.title = r.total
          ? r.hits +
            " acertos diretos em " +
            r.total +
            " testes. Posição " +
            r.position +
            "."
          : "Sem observações ainda.";
      }
      ui.third.textContent =
        "3º POR DESEMPENHO • " +
        (ready ? "V" + ranked[2].variation : "AGUARDANDO TESTES");
      const order = ranked.map((r) => r.variation).join(",");
      if (ui.order !== order) {
        for (const r of ranked) ui.row.appendChild(ui.buttons.get(r.variation));
        ui.order = order;
      }
    }
  }

  function reanalysisSummaryHTML(){
    const rows=state.importReanalyses||[];
    if(!rows.length)return '';
    const solved=rows.filter(row=>row.status==='REVISED').length;
    return '<div class="title">REANÁLISE DA IMPORTAÇÃO • RETROSPECTIVA</div><div class="muted">'+
      solved+' revisões com acerto simulado • '+(rows.length-solved)+' sem solução nas 24 hipóteses. '+
      'Resultados originais preservados; ajustes só influenciam motores após avaliações posteriores.</div>';
  }
  function renderReanalysisLane(ui){
    if(!ui.reviewCells){
      const label=document.createElement('div');label.className='muted';
      label.textContent='REVISÃO DA IMPORTAÇÃO • APÓS CONHECER O RESULTADO';
      ui.reviewCells=document.createElement('div');ui.reviewCells.className='timelineCells';
      ui.item.appendChild(label);ui.item.appendChild(ui.reviewCells);
    }
    patchHTML(ui.reviewCells,(state.importReanalyses||[]).slice(-20).map(row=>{
      const solved=row.status==='REVISED',direct=row.result==='GREEN';
      const text=solved?(direct?'W*':'G1*'):'?';
      const title='GIRO '+row.turn+' • LOSS original • '+row.attempts.length+' tentativas • '+
        (solved?'AJUSTE RETROSPECTIVO: '+row.solution.component:'SEM SOLUÇÃO ENCONTRADA');
      return '<span class="wlCell '+(solved?(direct?'wlWin':'wlGale'):'wlLoss')+'" title="'+esc(title)+'">'+text+'</span>';
    }).join('')||'<span class="muted">SEM LOSS IMPORTADO PARA REVISAR</span>');
  }

  function renderTimelinePanel() {
    const root = $("timelines");
    if (!root) return;
    root.hidden = !state.open.timeline;
    if (!state.open.timeline) return;
    const definitions = timelineDefinitions(),
      layout = definitions.map((d) => d.id + "=" + d.name).join("|");
    if (layout !== timelineLayoutKey) {
      const focus = $("focusGame");
      if (focus) root.before?.(focus);
      root.innerHTML = "";
      timelineUINodes.clear();
      timelineLayoutKey = layout;
      for (const def of definitions) {
        const item = document.createElement("div");
        item.className = "timelineItem";
        const row = document.createElement("div");
        row.className = "timelineRow";
        const label = document.createElement("button");
        label.className = "btn timelineName";
        label.textContent = def.name;
        label.dataset.timelineSelect = def.id;
        label.onclick = () => selectTimeline(def.id);
        const cells = document.createElement("div");
        cells.className = "timelineCells";
        row.appendChild(label);
        row.appendChild(cells);
        item.appendChild(row);
        root.appendChild(item);
        timelineUINodes.set(def.id, { item, row, cells, signature: null });
      }
    }
    for (const def of definitions) {
      const rows = timelineSamples(def.id).slice(-20),
        ui = timelineUINodes.get(def.id);
      if(def.id==='MASTER')renderReanalysisLane(ui);
      const signature = rows
        .map((r) => r.turn + ":" + r.result + ":" + r.closed)
        .join(",");
      if (ui.signature === signature) continue;
      ui.signature = signature;
      ui.cells.innerHTML = rows.length
        ? rows
            .map((r) => {
              const green = r.result === "GREEN",
                gale = r.result === "GREEN G1";
              return (
                '<span class="wlCell ' +
                (green ? "wlWin" : gale ? "wlGale" : "wlLoss") +
                '" title="GIRO ' +
                r.turn +
                '">' +
                (green ? "W" : gale ? "G1" : "R") +
                "</span>"
              );
            })
            .join("")
        : '<span class="muted">AGUARDANDO CICLOS</span>';
    }
  }

  function togglePostLoss() {
    if (busy) return;
    if (!cycleIsFree()) {
      alert("AGUARDE ENCERRAR O CICLO ATUAL.");
      return;
    }
    state.postLossEnabled = !state.postLossEnabled;

    if (!state.postLossEnabled && state.strategy === "POSTLOSS")
      state.strategy = "TRAINER";
    state.manual = null;
    scheduleSave();
    render();
  }

  function toggleTrainer() {
    if (busy) return;
    if (!cycleIsFree()) {
      alert("AGUARDE ENCERRAR O CICLO ATUAL.");
      return;
    }
    state.strategy = "TRAINER";
    state.manual = null;
    scheduleSave();
    render();
  }

  function timelineCellsHTML(id) {
    const rows = timelineSamples(id).slice(-20);
    return rows.length
      ? rows
          .map((r) => {
            const green = r.result === "GREEN",
              gale = r.result === "GREEN G1";
            return (
              '<span class="wlCell ' +
              (green ? "wlWin" : gale ? "wlGale" : "wlLoss") +
              '" title="GIRO ' +
              r.turn +
              '">' +
              (green ? "W" : gale ? "G1" : "R") +
              "</span>"
            );
          })
          .join("")
      : '<span class="muted">AGUARDANDO CICLOS</span>';
  }

  function selectTimeline(id) {
    if (busy) return;
    if (!cycleIsFree()) {
      alert("AGUARDE ENCERRAR O CICLO ATUAL PARA TROCAR A ESTRATÉGIA.");
      return;
    }
    if (!timelineDefinitions().some((d) => d.id === id)) return;
    if (id === "MASTER") state.strategy = "MASTER";
    else if (id === "TRAINER") state.strategy = "TRAINER";
    else if (id === "POSTLOSS") {
      state.strategy = "POSTLOSS";
      state.postLossEnabled = true;
    } else if (id === "NUMBER") {
      state.strategy = "NUMBER";
      state.variantSelections.NUMBER = 0;
    } else if (id.startsWith("ORIGINAL:")) {
      state.strategy = id.slice(9);
      state.variantSelections[state.strategy] = 0;
    } else if (id.endsWith("@THIRD")) {
      state.strategy = id.slice(0, -6);
      state.variantSelections[state.strategy] = -3;
    } else if (id.includes("@V")) {
      const [owner, variation] = id.split("@V");
      state.strategy = owner;
      state.variantSelections[owner] = Number(variation);
    } else if (id.startsWith("ADAPTIVE:")) {
      state.strategy = "ADAPTIVE";
      state.adaptive = id.slice(9);
    } else if (id.startsWith("RANK:")) {
      state.strategy = "AUTO";
      state.rank = Number(id.slice(5));
    } else if (id.startsWith("CREATED:")) {
      state.strategy = "CREATED";
      state.activeCreated = id;
    }
    state.manual = null;
    state.focusTimelineId = id;
    state.open.timeline = true;
    scheduleSave();
    render();
  }

  function renderFocusGame(motor) {
    const root = $("focusGame");
    if (!root) return;
    root.hidden = !state.focusTimelineId;
    if (!state.focusTimelineId) return;
    const item = timelineUINodes.get(state.focusTimelineId)?.item;
    if (item && root.parentNode !== item) item.appendChild(root);
    if (!$("focusKeys")) {
      root.innerHTML =
        '<div class="row"><strong id="focusTitle"></strong><button class="btn" id="focusClose">FECHAR QUADRO</button></div>' +
        '<div class="timelineCells" id="focusTimeline"></div><div class="muted" id="focusTimelineLabel"></div>' +
        '<div class="title">ÚLTIMOS 14 NÚMEROS</div><div class="history" id="focusLast"></div>' +
        '<div id="focusMode" aria-live="polite"></div><div class="centers" id="focusCenters"></div><div class="muted" id="focusCoverage"></div>' +
        '<div class="keys" id="focusKeys" hidden></div><div class="status" id="focusReceipt" aria-live="polite"></div>';
      $("focusClose").onclick = () => {
        state.focusTimelineId = null;
        scheduleSave();
        render();
      };
      for (let n = 0; n <= 36; n++) {
        const b = document.createElement("button");
        b.className = "key" + (n === 0 ? " zero" : "");
        b.textContent = n;
        b.dataset.focusNumber = String(n);
        b.style.background =
          n === 0 ? "#087b50" : RED.has(n) ? "#ac293f" : "#12151b";
        b.onclick = () => {
          addManual(n);
        };
        $("focusKeys").appendChild(b);
      }
    }
    const definition = timelineDefinitions().find(
      (d) => d.id === state.focusTimelineId,
    );
    $("focusTitle").textContent = definition?.name || "ESTRATÉGIA SELECIONADA";
    $("focusTimeline").innerHTML = timelineCellsHTML(state.focusTimelineId);
    const target =
      state.cycle?.original?.postLossTarget || motor?.postLossTarget;
    $("focusTimelineLabel").textContent =
      "LINHA DA ESTRATÉGIA: " + (definition?.name || state.focusTimelineId);
    if (target && target.id !== state.focusTimelineId)
      $("focusTimelineLabel").innerHTML +=
        '<div class="postLossText">LINHA DA JOGADA PÓS-LOSS: ' +
        esc(target.name) +
        "</div>" +
        timelineCellsHTML(target.id);
    patchHTML($("focusLast"), $("last").innerHTML);
    $("focusMode").textContent = $("selected").textContent;
    $("focusMode").className =
      "playNotice " + (target ? "postLossNotice" : "normalNotice");
    patchHTML($("focusCenters"), centersHTML(motor?.play));
    $("focusCoverage").textContent = $("coverage").textContent;
    for (const b of document.querySelectorAll("[data-focus-number]"))
      b.disabled = busy && !inputRunning;
    if (!inputRunning) $("focusReceipt").textContent = $("receipt").textContent;
  }

  function resultsSeparatedHTML(rows) {
    const groups = resultGroups(rows),
      legacy = metrics(groups.legacy).total;
    return (
      '<div class="title">NORMAL</div>' +
      metricsHTML(groups.normal) +
      '<div class="title postLossText">PÓS-LOSS • ADAPTATIVAS</div>' +
      metricsHTML(groups.postLoss) +
      '<div class="title postLossText">PÓS-3 LOSS • TODAS</div>' +
      metricsHTML(groups.postThree) +
      '<div class="title">NORMAL + PÓS-LOSS + PÓS-3 LOSS • TOTAL</div>' +
      metricsHTML(groups.combined) +
      (legacy
        ? '<div class="muted">' +
          legacy +
          " ciclos anteriores sem identificação de normal/pós-loss permanecem somente no total.</div>"
        : "")
    );
  }

  let pendingReceipts = [];
  let bootLoading = true;

  function patchHTML(element, html) {
    if (element && element.innerHTML !== html) element.innerHTML = html;
  }

  function renderLastNumbers() {
    const known = state.history.map((n, i) => ({
      number: n,
      turn: state.historyTurns[i],
      pending: false,
    }));
    const pending = pendingReceipts.map((n) => ({ number: n, pending: true }));
    const html = [...known, ...pending]
      .slice(-14)
      .reverse()
      .map((item) => {
        const n = item.number,
          row = item.pending
            ? null
            : state.ledger.find((r) => r.turn === item.turn);
        const result = item.pending ? "" : row?.result || "HISTÓRICO";
        const cls =
          result === "LOSS"
            ? "loss"
            : result.startsWith("GREEN")
              ? "green"
              : result === "GALE"
                ? "gale"
                : "";
        return (
          '<div class="chip ' +
          cls +
          '" style="background:' +
          (n === 0 ? "#087b50" : RED.has(n) ? "#a72740" : "#14181f") +
          '"><b>' +
          n +
          "</b><small>" +
          (result ? esc(result) : "&nbsp;") +
          "</small></div>"
        );
      })
      .join("");
    patchHTML($("last"), html);
    patchHTML($("focusLast"), html);
  }

  let queueRevision = 0;
  function persistPendingInputs() {
    if(!isCurrentApp() || bootLoading || recoveryLocked)return;
    queueRevision = Math.max(queueRevision+1,Date.now()*1000);
    const journal = JSON.stringify({
      revision:queueRevision, baseTurn:durableTurn,
      numbers:state.manualLog.filter(row=>row.turn>durableTurn).map(row=>row.number).concat(pendingReceipts)
    });
    let saved=false;
    for(const [storage,name] of [
      [()=>localStorage,KEY+'_QUEUE'],
      [()=>typeof sessionStorage==='undefined'?null:sessionStorage,KEY+'_QUEUE_SAFE']
    ]){
      try { const target=storage();if(target){target.setItem(name,journal);saved=true;} } catch(error) {}
    }
    if(!saved){saveError='Não foi possível salvar o número recebido. Mantenha a aba aberta até concluir o processamento.';showSaveHealth();}
  }
  function resumePendingInputs() {
    try {
      const journals=[];
      for(const [storage,name] of [
        [()=>localStorage,KEY+'_QUEUE'],
        [()=>typeof sessionStorage==='undefined'?null:sessionStorage,KEY+'_QUEUE_SAFE']
      ]){
        try { const value=JSON.parse(storage()?.getItem(name)||'null');if(value)journals.push(value); } catch(error) {}
      }
      journals.sort((a,b)=>(b.revision||0)-(a.revision||0));
      const journal=journals[0];
      queueRevision=Math.max(queueRevision,journal?.revision||0);
      if (
        !journal ||
        !Number.isInteger(journal.baseTurn) ||
        journal.baseTurn > state.totalTurns
      )
        return;
      const numbers = cleanNumbers(journal.numbers).slice(
        Math.max(0, state.totalTurns - journal.baseTurn),
      );
      if (!numbers.length) return;
      pendingReceipts = [...numbers];
      inputQueue = [...numbers];
      renderLastNumbers();
      drainInputQueue();
    } catch (error) {
      saveError =
        "Não foi possível recuperar a fila: " + String(error.message || error);
    }
  }

  /* A compactação do checkpoint não ocupa mais a thread do teclado. O diário
   curto permanece síncrono até o checkpoint confirmar que foi gravado. */
  let checkpointWorker = null,
    checkpointSerial = 0,
    checkpointBusy = false,
    checkpointNext = null,
    checkpointEpoch = 0;
  function saveAsync() {
if(!isCurrentApp() || recoveryLocked)return;

    if (typeof Worker === "undefined") {
      scheduleCheckpointFallback();
      return;
    }
    try {
      if (!checkpointWorker) {
        const source =
          'const W='+JSON.stringify(W)+';'+
          'const mod=n=>(n%37+37)%37;const ix=n=>W.indexOf(n);'+
          neighbors.toString()+';'+validPlay.toString()+';'+signaturePlay.toString()+';'+
          'const packSession='+packSession.toString()+';'+
          'self.onmessage=e=>{try{const raw=JSON.stringify(e.data.state,(k,v)=>validPlay(v)?{__betaPlay:signaturePlay(v),score:v.score}:v);'+
          'self.postMessage({id:e.data.id,epoch:e.data.epoch,turn:e.data.turn,packed:packSession(raw)});'+
          '}catch(error){self.postMessage({id:e.data.id,epoch:e.data.epoch,error:String(error.message||error)});}};';
        const url = URL.createObjectURL(
          new Blob([source], { type: "text/javascript" }),
        );
        checkpointWorker = new Worker(url);
        URL.revokeObjectURL(url);
        checkpointWorker.onmessage = (event) => {
if(!isCurrentApp())return;
          const result = event.data;
          checkpointBusy = false;
          if (result.epoch === checkpointEpoch && result.turn >= durableTurn) {
            if (result.error) saveError = result.error;
            else
              try {
                if (commitCheckpoint(result.packed, result.turn)) persistPendingInputs();
              } catch (error) {
                saveError =
                  "SALVAMENTO FALHOU: " + String(error.message || error);
              }
          }
          const next = checkpointNext;
          checkpointNext = null;
          if (next) saveAsync();
        };
        checkpointWorker.onerror = () => {
          checkpointWorker.terminate();
          checkpointWorker = null;
          checkpointBusy = false;
          checkpointNext = null;
          scheduleCheckpointFallback();
        };
      }
      const id = ++checkpointSerial,
        turn = state.totalTurns;
      const message = { id, epoch: checkpointEpoch, turn, state };
      if (checkpointBusy) checkpointNext = true;
      else {
        checkpointBusy = true;
        checkpointWorker.postMessage(message);
      }
    } catch (error) {
      scheduleCheckpointFallback();
    }
  }
  function scheduleCheckpointFallback() {
    // Uma falha do compactador não deve provocar uma compactação pesada
    // síncrona na volta à aba. O diário conserva os números ainda não salvos.
    persistPendingInputs();
    saveError='O salvamento em segundo plano foi interrompido. Mantenha a aba aberta e use RECUPERAR HISTÓRICO para retomar.';
    showSaveHealth();
  }

  function togglePostThree() {
    if (busy) return;
    if (!cycleIsFree()) {
      alert("AGUARDE ENCERRAR O CICLO ATUAL.");
      return;
    }
    state.postThreeEnabled = !state.postThreeEnabled;
    state.manual = null;
    scheduleSave();
    render();
  }

  document.body.innerHTML = `
<style>${css}
:host{display:block;color:#f4f7fb;font:13px Arial,sans-serif}
#paste,#import,#restore,#undo,#clear{display:none}

.controlGroup{margin:9px 0;padding:9px;background:#172434;border:1px solid #405a73;border-radius:8px}
.controlGroup summary{cursor:pointer;padding:9px;color:#59e5ff;font-weight:bold}
.controlGroup .controlGroup{background:#102030}
.metric:last-child b{font-size:14px;overflow-wrap:anywhere}
#receipt{min-height:25px;color:#59e5ff;padding:6px 0}
.timelineRow{display:flex;gap:9px;align-items:center;padding:7px 0;border-bottom:1px solid #35485d}
.timelineName{flex:0 0 225px;font-size:11px;font-weight:bold;overflow-wrap:anywhere}
.timelineCells{display:flex;flex-wrap:wrap;gap:3px;min-width:0}
.wlCell{display:inline-flex;width:20px;height:23px;align-items:center;justify-content:center;border-radius:4px;font-size:11px;font-weight:bold;color:#fff}
.playNotice{font-size:16px;font-weight:bold;line-height:1.6;padding:12px;border-radius:8px;margin:9px 0;overflow-wrap:anywhere}
.normalNotice{background:#123b55;color:#fff;border:2px solid #56dfff}
.postLossNotice{background:#482264;color:#ffe27d;border:3px solid #e0a5ff}
.postLossText{color:#f0b5ff;font-weight:bold}
.focusGame{background:#152b3d;border:2px solid #62dfff;border-radius:8px;padding:8px;margin:7px 0;font-size:11px}
.focusGame .row{gap:4px;margin:5px 0}
.focusGame #focusTitle{font-size:12px}
.focusGame .title{font-size:10px;margin:8px 0 4px}
.focusGame .btn{font-size:10px;padding:7px}
.focusGame .playNotice{font-size:12px;padding:7px;margin:6px 0;border-width:2px}
.focusGame .centers{gap:4px;margin:7px 0}
.focusGame .center{min-height:58px;padding:5px 2px;gap:3px}
.focusGame .center strong{font-size:clamp(20px,5vw,26px)}
.focusGame .center small{font-size:8px}
.focusGame .history{gap:4px}
.focusGame .chip{min-width:32px;padding:4px;border-width:2px}
.focusGame .chip b{font-size:14px}
.focusGame .chip small{font-size:8px}
.focusGame .keys{gap:4px}
.focusGame .key{height:36px;font-size:14px}
.focusGame .status,.focusGame .muted{font-size:10px}
@media(pointer:coarse){.focusGame .key,.focusGame .btn{min-height:44px}}
.timelineName{font-size:13px;line-height:1.5;min-height:44px;text-align:left}
.wlGale{background:#f1c232;color:#171717}.wlWin{background:#087f52}.wlLoss{background:#a72845}
@media(max-width:650px){.timelineRow{display:block}.timelineName{margin-bottom:5px}.wlCell{width:18px;height:22px}}
</style>
<main class="app">
<h1>${side} • ANÁLISE BETA V${VERSION}</h1>
<div class="sub">8 VARIAÇÕES POR ORIGINAL E TREINADOR NÚMEROS • 12 MOTORES PRÓPRIOS POR VARIAÇÃO<br>PRÓXIMA JOGADA A CADA NÚMERO • DESCARTE EM DEZ • JANELA ATÉ 70</div>
<section class="panel">
<div class="title">LEITURA ${side}</div>
<textarea id="paste" placeholder="Cole de 8 a 70 números, do mais antigo ao mais recente"></textarea>
<div class="row"><button class="btn" id="import">IMPORTAR</button><button class="btn" id="restore">RECUPERAR HISTÓRICO</button><button class="btn" id="undo">APAGAR ÚLTIMO MANUAL</button><button class="btn" id="clear">ZERAR TUDO</button></div>
<div class="status" id="status"></div>
<div class="muted" id="importAudit"></div>
<div class="windowBox"><strong id="counter">0 / 70</strong><div class="bar"><div class="barfill" id="barfill"></div></div><div class="muted" id="windowInfo"></div><div class="muted" id="cycleInfo"></div></div>
</section>
<section class="panel"><div class="title">ESTRATÉGIA ATIVA</div><div id="strategies"></div><div class="row" id="options"></div><div class="muted" id="selected"></div><div class="centers" id="centers"></div><div class="muted" id="coverage"></div></section>
<section class="panel"><div class="title">TECLADO 0–36</div><div id="receipt" aria-live="polite"></div><div class="keys" id="keys"></div></section>
<section class="panel"><div class="title">ÚLTIMOS 14 NÚMEROS</div><div class="history" id="last"></div></section>
<section class="panel"><button class="head" id="timelineToggle">LINHAS DO TEMPO • TODAS AS ESTRATÉGIAS <span>− / +</span></button><div class="muted">CICLOS VIRTUAIS: W VERDE = DIRETO; G1 AMARELO = DEFESA; R VERMELHO = LOSS FINAL. ÚLTIMOS 20 CICLOS. MAIS RECENTE À DIREITA.</div><div id="focusGame" class="focusGame" hidden></div><div id="timelines"></div></section>
<section class="panel"><div class="title">FICHAS / G1</div><div class="row"><label>VALOR DA FICHA <input id="stake" type="number" min=".01" step=".01"></label><label>MULTIPLICADOR G1 <input id="multiplier" type="number" min=".01" step=".01"></label></div></section>
<section class="panel"><button class="head" id="generalToggle">RESULTADO GERAL <span>− / +</span></button><div id="general"></div></section>
</main>`;

  for (const [field, label] of [
    ["g1Trainer", "TREINADOR GLOBAL G1"],
    ["g1", "G1 AJUSTE FINO"],
    ["galeSkip", "GALE 2ª RODADA"],
    ["secondHouse", "2ª CASA"],
  ]) {
    const b = button(
      label,
      () => {
        if (busy) return;
        if (!cycleIsFree()) {
          alert("AGUARDE ENCERRAR O CICLO.");
          return;
        }
        state[field] = !state[field];
        scheduleSave();
        render();
      },
      $("options"),
    );
    b.dataset.option = field;
  }

  const structuralButton666=button('MEMÓRIA TRIANGULAR • TESTE',toggleStructuralMemory666,$('options'));
  structuralButton666.dataset.option='structuralMemoryEnabled';
  structuralButton666.title='Experimental: a comparação histórica não demonstrou ganho consistente. Desligada preserva os pesos anteriores.';
  for (let n = 0; n <= 36; n++) {
    const b = document.createElement("button");
    b.className = "key" + (n === 0 ? " zero" : "");
    b.textContent = n;
    b.style.background =
      n === 0 ? "#087b50" : RED.has(n) ? "#ac293f" : "#12151b";
    b.onclick = () => addManual(n);
    $("keys").appendChild(b);
  }
  $("import").onclick = () => importHistory(parseInput($("paste").value));
  $("restore").onclick = async () => {
    if (busy) return;
    if(workerDisabled){
      workerClient?.terminate();workerClient=null;workerDisabled=false;clientRequests.clear();
    }
    for (const key of [KEY, ...OLD_KEYS]) {
      const data = read(key);
      if (data && Array.isArray(data.history)) {
        state = normalizeState(data);
        if (key !== KEY) state.undoStack = [];
        clearSpatialCaches();
        if (!state.block.data) {
          setBusy(true, "RECUPERANDO");
          await waitFrame();
          try{
            const stack=state.undoStack;
            const restored=await workerRequest('RESTORE',{state:{...state,undoStack:[]}});
            state={...restored,undoStack:stack};
          }finally{setBusy(false);}
        }
        save();
        render();
        resumePendingInputs();
        return;
      }
    }
    alert("NENHUM HISTÓRICO ENCONTRADO.");
  };
  $("undo").onclick = undo;
  $("clear").onclick = clearAll;
  $("stake").onchange = () => {
    state.stake = Math.max(0.01, Number($("stake").value) || 1);
    scheduleSave();
  };
  $("multiplier").onchange = () => {
    state.multiplier = Math.max(0.01, Number($("multiplier").value) || 1);
    scheduleSave();
  };
  $("timelineToggle").onclick = () => {
    state.open.timeline = !state.open.timeline;
    scheduleSave();
    render();
  };
  $("generalToggle").onclick = () => {
    state.open.general = !state.open.general;
    scheduleSave();
    render();
  };

  async function restoreBootSession() {
    setBusy(true, 'RECUPERANDO SESSÃO');
    try {
      let recovered = globalThis['__analiseBetaTransfer_'+side] || read(KEY);
      const handoff = !!globalThis['__analiseBetaTransfer_'+side];
      delete globalThis['__analiseBetaTransfer_'+side];
      const databaseRaw = handoff ? null : await readDatabaseCheckpoint();
      if (!isCurrentApp()) return;
      if (databaseRaw) {
        try {
          const saved = checkpointValue(databaseRaw);
          if (Array.isArray(saved.data?.history) && (!recovered || saved.revision > sessionRevision)) {
            recovered = saved.data;
            sessionRevision = saved.revision;
            recoveryLocked = false;
            saveError = '';
          }
        } catch (error) {
          if (!recovered) {
            recoveryLocked = true;
            saveError = 'Não foi possível ler a sessão. As cópias existentes foram protegidas.';
          }
        }
      }
      if (!recovered && !recoveryLocked) {
        for (const key of OLD_KEYS) {
          recovered = read(key);
          if (recovered) { recovered.undoStack = []; break; }
        }
      }
      if (recovered) state = normalizeState(recovered);
      durableTurn = state.totalTurns;
      render();
      if (state.history.length >= 8 && !state.block.data) {
        const result = await workerRequest('RESTORE', {state:{...state,undoStack:[]}});
        if (!isCurrentApp()) return;
        if (result) state = {...result,undoStack:state.undoStack};
        else prepareBlock();
      }
    } catch (error) {
      saveError = 'RECUPERAÇÃO NÃO CONCLUÍDA: '+String(error.message||error);
      recoveryLocked = true;
    } finally {
      bootLoading = false;
      if (isCurrentApp()) {
        setBusy(false);
        render();
        if (!recoveryLocked) resumePendingInputs();
      }
    }
  }
  restoreBootSession();
  // O checkpoint completo já é agendado após cada alteração. Ao trocar de
  // aba, grava somente o diário curto. Não compacta, recalcula ou redesenha.
  function recordLifecycleJournal(){
    if(!isCurrentApp())return;
    persistPendingInputs();
  }
  sideWindowAdd('pagehide',recordLifecycleJournal);
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden')recordLifecycleJournal();
  });

globalThis['__analiseBetaDispose_'+side]=()=>{
 if(!appAlive)return;
 clearTimeout(saveTimer);persistPendingInputs();
 globalThis['__analiseBetaTransfer_'+side]=state;appAlive=false;
 if(workerClient)workerClient.terminate();
 if(checkpointWorker)checkpointWorker.terminate();
 clientRequests.clear();
};

// Teclado e comandos de sessão são compartilhados. Estratégias, escolhas,
// estatísticas, G1 e pausas continuam locais a esta leitura.
function addManual(n){return coordinator.add(n);}
function undo(){return coordinator.undo();}
function clearAll(){return coordinator.clear();}
function importHistory(numbers){return coordinator.import(numbers);}
const sideDispose=globalThis['__analiseBetaDispose_'+side];
return {
 side,root,
 styles:()=>root.querySelector('style').textContent,
 element:id=>$(id),
 mount(id,target){const element=$(id);if(!element)return null;document.registerScope(element);target.appendChild(element);return element;},
 timelineRows(){return timelineDefinitions().map(def=>{const ui=timelineUINodes.get(def.id);if(ui)document.registerScope(ui.item);return {id:def.id,name:def.name,item:ui?.item};});},
 setFinancial(stake,multiplier){state.stake=stake;state.multiplier=multiplier;$('stake').value=stake;$('multiplier').value=multiplier;scheduleSave();},
 structuralDiagnostics(simulate=false){if(!state.structuralMemoryEnabled&&!simulate)return {status:'DESLIGADA — SEM GANHO COMPROVADO',influence:0};const r=triangleMemory666.analyze(state.history,past=>legacyTriangleAnalysis(past).weights);return {status:r.status,influence:r.influence,observedSuccessors:r.observedSuccessors,modes:r.modes.map(({name,support,occurrences,evaluations,meanLogGain,stderr,active,mass})=>({name,support,occurrences,evaluations,meanLogGain,stderr,active,mass}))};},
 triangleCatalogue(id=null){return motorReadings667.catalogue(state.history,id);},
 amplitudeCatalogue(){return motorReadings667.amplitudeForms.map(form=>({...form,occurrences:motorReadings667.read(state.history).exhaustive.amplitudeCounts[form.id]}));},
 motorReadings(number=null){const r=motorReadings667.read(state.history);return number==null?{...motorReadings667.summary(state.history),candidates:r.candidates}:r.candidates.find(option=>option.number===number);},
 auditReading(turn){const row=state.ledger.find(row=>row.turn===turn);if(!row?.readingAudit)return null;return {record:copy(row.readingAudit),outcome:row.number,options:motorReadings667.read(row.readingAudit.prefix).candidates};},
 poleCatalogue(){return motorReadings667.polePairs.map(pair=>({...pair}));},
 poleReading(number,numberA,numberB,tolerance){return motorReadings667.polePairReading(state.history.map(ix),ix(number),ix(numberA),ix(numberB),tolerance);},
 arcReading(number,start,width,window=8){return motorReadings667.arcAlternative(state.history,number,start,width,window);},
 masterDiagnostics(){return {reanalyses:copy(state.importReanalyses),policies:copy(state.reanalysisPolicies),display:copy(displayedMasterChoice()),choice:copy(masterSelection()),ranking:copy(masterRanking()),bestVariations:VARIANT_OWNERS.map(owner=>bestMasterVariation(owner.id)),lessons:copy(state.masterLessons),pendingReviews:state.masterReviews.length};},
 getState:()=>state,
 busy:()=>busy||inputRunning||inputQueue.length>0,
 canEnqueue:()=>appAlive&&state.history.length>=8&&(!busy||inputRunning),
 enqueue(n){addSideManual(n);},
 async importLocal(numbers){
  await loadHistory(numbers);
  if(JSON.stringify(state.history)!==JSON.stringify(numbers))throw Error('A importação '+side+' não foi concluída.');
 },
 undoLocal(){undoSide();},
 clearLocal(){
  recoveryLocked=false;state=fresh();clearSpatialCaches();save();pendingReceipts=[];inputQueue=[];persistPendingInputs();render();
 },
 async restoreLocal(){await $('restore').onclick();},
 snapshot:()=>copy(state),
 rollback(snapshot){state=normalizeState(copy(snapshot));clearSpatialCaches();save();persistPendingInputs();render();},
 saveLocal(){return save();},
 storageHealth(){return saveError;},
 dispose(){
  sideDispose();
  for(const [target,type,handler,options] of sideListeners)target.removeEventListener(type,handler,options);
 },
 select(id){selectTimeline(id);},
 // Exportação para conferência dos testes e dos registros, sem tocar no motor.
 summary(){return {side,version:VERSION,turn:state.totalTurns,phase:state.phase,
  history:[...state.history],audit:copy(state.importAudit),metrics:metrics(state.ledger),
  timelineIds:timelineDefinitions().map(d=>d.id),manual:state.manualLog.map(r=>r.number)};}
};

}

// Um número digitado é observado pelos dois sistemas. A inversão vale para
// o histórico inicial; resultados ao vivo são anexados ao fim de AMBOS.
const nativeDocument=globalThis.document;
if(typeof globalThis.__analiseBetaDualDispose==='function')globalThis.__analiseBetaDualDispose();
if(typeof globalThis.__analiseBetaDispose==='function')globalThis.__analiseBetaDispose();
let alive=true,operation=false,monitoring=false,aligned=true,expectedTurn=0;
const sides={};
let unifiedReady=false;
const pairedRows=new Map();
nativeDocument.body.innerHTML=`<style id="dual-base-style"></style>
<style>
body{margin:0;background:#101720;color:#f4f7fb;font:13px Arial,sans-serif}
#beta-dual-app{max-width:1100px;margin:auto;padding:10px;box-sizing:border-box}
#beta-dual-app *{box-sizing:border-box}
#beta-dual-app h1{font-size:22px;color:#59e5ff;margin:8px 0}
#beta-dual-app textarea{display:block;width:100%;height:75px;background:#0c1623;color:#fff;border:1px solid #62758b;border-radius:7px;padding:9px;font:16px Arial,sans-serif;margin:8px 0}
#beta-dual-app .dual-controls{display:flex;flex-wrap:wrap;gap:7px;align-items:center}
#beta-dual-app .dual-controls button,#beta-dual-app select{background:#304359;border:1px solid #708aa6;border-radius:7px;color:#fff;padding:9px;min-height:40px}
#beta-dual-app .dual-controls button{cursor:pointer}
#beta-dual-app button:disabled{opacity:.4;cursor:default}
#beta-dual-app label{display:block;line-height:1.7}
#beta-dual-app .dual-status{line-height:1.6;margin-top:8px;overflow-wrap:anywhere;color:#c4d8eb}
#beta-dual-app .reading-card{border:1px solid #4386ad;border-left:5px solid #59d3ff;background:#122b3e;border-radius:7px;padding:8px;margin:7px 0;min-width:0}
#beta-dual-app .reading-card.reverse{border-left-color:#4483ee;background:#182b45}
#beta-dual-app .reading-mark{font-size:11px;color:#b5dcf3;display:flex;align-items:center;gap:6px;margin-bottom:4px}
#beta-dual-app .reading-dot{display:inline-block;width:10px;height:10px;background:#59d3ff;border-radius:2px;flex:none}
#beta-dual-app .reverse .reading-dot{background:#4483ee}
#beta-dual-app .centers{grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;margin:7px 0}
#beta-dual-app .center{min-height:57px;padding:5px 1px;gap:3px;border-width:1px}
#beta-dual-app .center strong{font-size:clamp(21px,5.5vw,29px)}
#beta-dual-app .center small{font-size:8px}
#beta-dual-app .playNotice{font-size:12px;padding:7px;margin:5px 0;border-width:2px}
#beta-dual-app .history-lane{display:flex;align-items:center;gap:5px;margin:7px 0;min-width:0}
#beta-dual-app .history-lane .history{flex:1;display:grid;grid-template-columns:repeat(14,minmax(0,1fr));gap:2px;min-width:0}
#beta-dual-app .history-lane .chip{min-width:0;padding:4px 0;border-width:1px;border-radius:3px}
#beta-dual-app .history-lane .chip b{font-size:clamp(10px,2.6vw,15px);line-height:1.2}
#beta-dual-app .history-lane .chip small{display:none}
#beta-dual-app .timeline-pair{margin:7px 0;border:1px solid #366181;border-radius:7px;overflow:hidden}
#beta-dual-app .timelineItem{padding:0 7px;background:#11283a;border-left:4px solid #59d3ff}
#beta-dual-app .timelineItem.reverse-lane{background:#182b45;border-left-color:#4483ee}
#beta-dual-app .timelineRow{border:0;margin:0}
#beta-dual-app .reverse-lane .timelineName{flex:0 0 32px;width:32px;font-size:0;min-height:32px;padding:3px;margin:0}
#beta-dual-app .reverse-lane .timelineName::before{content:'↶';font-size:16px}
#beta-dual-app .reverse-lane .timelineRow{padding-top:3px;padding-bottom:7px}
#beta-dual-app .focusGame .keys,#beta-dual-app .focusGame [id="focusReceipt"]{display:none}
#beta-dual-app .history-lane .history [title]{cursor:default}
#beta-dual-app [hidden]{display:none!important}
#beta-dual-app .control-label{font-size:11px;color:#b5dcf3;padding:6px 0}
#beta-dual-app .audit-details .muted{font-size:10px}
@media(max-width:650px){#beta-dual-app .reverse-lane .timelineRow{display:flex;gap:6px}#beta-dual-app .timelineName{font-size:12px}#beta-dual-app .history-lane{gap:3px}}
</style>
<main id="beta-dual-app">
<section class="panel">
<h1>ANÁLISE BETA 6.6.13</h1>
<label for="dual-paste">IMPORTAR HISTÓRICO</label>
<textarea id="dual-paste" placeholder="Cole de 8 a 70 resultados."></textarea>
<div class="dual-controls">
<label>ORDEM COPIADA <select id="dual-order"><option value="OLDEST">MAIS ANTIGO → MAIS RECENTE</option><option value="NEWEST">MAIS RECENTE → MAIS ANTIGO</option></select></label>
<button type="button" id="dual-import">IMPORTAR</button><button type="button" id="dual-undo">APAGAR ÚLTIMO</button><button type="button" id="dual-restore">RECUPERAR</button><button type="button" id="dual-clear">ZERAR TUDO</button>
</div>
<div class="dual-status" id="dual-status" role="status" aria-live="polite">Duas leituras independentes • um teclado.</div>
<div id="dual-save-health" class="dual-status" role="alert" hidden></div>
<details class="audit-details"><summary>Conferir importação e janela</summary><div id="dual-audit-normal"></div><div id="dual-audit-inverted"></div></details>
</section>
<section class="panel">
<div class="title">TREINADORES E ESTRATÉGIAS</div>
<div class="dual-controls"><label>AJUSTAR LEITURA <select id="dual-control-side"><option value="NORMAL">NORMAL</option><option value="INVERTIDO">INVERSA</option></select></label></div>
<div id="dual-controls-normal"></div><div id="dual-controls-inverted" hidden></div>
</section>
<section class="panel" id="dual-plays">
<div class="title">JOGADAS</div>
<div class="reading-card"><div class="reading-mark"><span class="reading-dot"></span>NORMAL</div><div id="dual-play-normal"></div></div>
<div class="reading-card reverse"><div class="reading-mark"><span class="reading-dot"></span>INVERSA</div><div id="dual-play-inverted"></div></div>
</section>
<section class="panel"><div class="title">TECLADO 0–36</div><div id="dual-keyboard"></div></section>
<section class="panel" id="dual-last-panel"><div class="title">ÚLTIMOS 14 NÚMEROS</div>
<div class="history-lane"><span class="reading-dot" title="Normal" aria-label="Normal"></span><div id="dual-last-normal"></div></div>
<div class="history-lane reverse"><span class="reading-dot" title="Inversa" aria-label="Inversa"></span><div id="dual-last-inverted"></div></div>
</section>
<section class="panel"><button class="head" id="dual-timeline-toggle">LINHAS DO TEMPO • NORMAL / INVERSA <span>− / +</span></button><div class="muted">W = direto • G1 = defesa • R = LOSS final. Linha de cima: normal. Linha azul de baixo: inversa.</div><div id="dual-timelines"></div></section>
<section class="panel"><div class="title">FICHAS / G1</div><div class="row" id="dual-financial"></div></section>
<section class="panel"><button class="head" id="dual-general-toggle">RESULTADO GERAL <span>− / +</span></button><div id="dual-general"><details open><summary>NORMAL</summary><div id="dual-result-normal"></div></details><details><summary>INVERSA</summary><div id="dual-result-inverted"></div></details></div></section>
<div id="dual-normal" hidden></div><div id="dual-inverted" hidden></div>
</main>
`;
const ui=id=>nativeDocument.getElementById(id);
const status=message=>{if(alive)ui('dual-status').textContent=message;};
const stateKey='ANALISE_BETA_V664_DUAL_INPUT_ORDER';
try{const saved=localStorage.getItem(stateKey);if(['OLDEST','NEWEST'].includes(saved))ui('dual-order').value=saved;}catch{}
ui('dual-order').onchange=()=>{try{localStorage.setItem(stateKey,ui('dual-order').value);}catch{}};
function both(){return [sides.NORMAL,sides.INVERTIDO].filter(Boolean);}
function running(){return operation||both().some(s=>s.busy());}
function updateButtons(){
 const blocked=operation;
 for(const id of ['dual-import','dual-undo','dual-restore','dual-clear'])ui(id).disabled=blocked;
 for(const id of ['dual-controls-normal','dual-controls-inverted','dual-plays','dual-keyboard','dual-timelines'])ui(id).inert=operation;
}
function inputNumbers(text){
 const tokens=String(text).match(/\d+/g)||[];
 if(tokens.some(n=>/^0{2,}$/.test(n)))throw Error('00 não é 0. Use somente a roda de 0 a 36.');
 if(/-\s*\d/.test(String(text)))throw Error('O histórico contém número negativo.');
 const numbers=tokens.map(Number);
 if(numbers.some(n=>n>36))throw Error('O histórico contém número maior que 36.');
 return numbers;
}
function prepareHistories(numbers,order){
 let normal=[...numbers];
 if(order==='NEWEST')normal.reverse();
 // Seleciona os 70 mais recentes ANTES de inverter a segunda leitura.
 normal=normal.slice(-70);
 return {NORMAL:normal,INVERTIDO:[...normal].reverse()};
}
async function idle(){
 while(alive&&both().some(s=>s.busy()))await new Promise(resolve=>setTimeout(resolve,20));
}
function checkAlignment(){
 const [a,b]=both().map(s=>s.getState());
 aligned=!!a&&!!b&&a.totalTurns===b.totalTurns&&
 JSON.stringify(a.manualLog.map(r=>r.number))===JSON.stringify(b.manualLog.map(r=>r.number));
 if(aligned)expectedTurn=a.totalTurns;
 else status('RETOMADA INCOMPLETA ENTRE OS DOIS CONJUNTOS. RECUPERE OU IMPORTE O HISTÓRICO ANTES DE CONTINUAR.');
 return aligned;
}
async function watchNumbers(){
 if(monitoring)return;
 monitoring=true;
 await idle();
 if(alive){
  const turns=both().map(s=>s.getState().totalTurns);
  if(turns.some(n=>n!==expectedTurn)){
   aligned=false;status('NÚMERO NÃO CONCLUÍDO NOS DOIS CONJUNTOS. RECUPERE OU IMPORTE ANTES DE CONTINUAR.');
  }else{
   checkAlignment();
   if(aligned)status('NORMAL E INVERTIDO ATUALIZADOS • GIRO '+expectedTurn+' • JOGADAS E G1 INDEPENDENTES');
  }
  updateButtons();
 }
 monitoring=false;
}
const coordinator={
 async import(numbers){
  if(!alive||running())return false;
  if(!Array.isArray(numbers))throw Error('HISTÓRICO INVÁLIDO.');
  if(numbers.some(n=>!Number.isInteger(n)||n<0||n>36)){alert('USE SOMENTE NÚMEROS DE 0 A 36.');return false;}
  if(numbers.length<8){alert('INFORME PELO MENOS OITO NÚMEROS.');return false;}
  const histories=prepareHistories(numbers,ui('dual-order').value);
  if(!confirm('IMPORTAR '+histories.NORMAL.length+' NÚMEROS NOS DOIS CONJUNTOS?\nNORMAL E INVERTIDO TERÃO TREINAMENTO E CICLOS PRÓPRIOS.'))return false;
  operation=true;updateButtons();
  const snapshots=both().map(s=>s.snapshot());
  try{
   status('LENDO HISTÓRICO NORMAL…');
   await sides.NORMAL.importLocal(histories.NORMAL);
   if(!alive)return false;
   status('LENDO O MESMO HISTÓRICO INVERTIDO…');
   await sides.INVERTIDO.importLocal(histories.INVERTIDO);
   if(!alive)return false;
   checkAlignment();ui('dual-paste').value='';
   status('DUAS LEITURAS CONCLUÍDAS • '+histories.NORMAL.length+' NÚMEROS • NORMAL: '+histories.NORMAL[0]+' → '+histories.NORMAL.at(-1)+' • INVERTIDO: '+histories.INVERTIDO[0]+' → '+histories.INVERTIDO.at(-1));
   return true;
  }catch(error){
   if(alive){both().forEach((s,i)=>s.rollback(snapshots[i]));checkAlignment();status('IMPORTAÇÃO NÃO CONCLUÍDA. OS DOIS ESTADOS ANTERIORES FORAM PRESERVADOS.');alert(String(error.message||error));}
   return false;
  }finally{operation=false;if(alive)updateButtons();}
 },
 add(n){
  if(!alive||operation||!aligned)return false;
  if(!Number.isInteger(n)||n<0||n>36)return false;
  if(both().length!==2||both().some(s=>!s.canEnqueue())){status('AGUARDE A PREPARAÇÃO DOS DOIS CONJUNTOS OU IMPORTE UM HISTÓRICO.');return false;}
  expectedTurn++;
  for(const side of both())side.enqueue(n);
  updateButtons();watchNumbers();return true;
 },
 undo(){
  if(!alive||running())return false;
  if(both().some(s=>!s.getState().undoStack.length)){alert('NÃO HÁ UM LANÇAMENTO MANUAL PARA DESFAZER NOS DOIS CONJUNTOS.');return false;}
  both().forEach(s=>s.undoLocal());checkAlignment();status('ÚLTIMO NÚMERO DESFEITO NOS DOIS CONJUNTOS');updateButtons();return true;
 },
 clear(){
  if(!alive||running())return false;
  if(!confirm('ZERAR OS DOIS HISTÓRICOS, TREINADORES E REGISTROS?'))return false;
  both().forEach(s=>s.clearLocal());aligned=true;expectedTurn=0;status('NORMAL E INVERTIDO ZERADOS');updateButtons();return true;
 },
 async restore(){
  if(!alive||running())return false;
  operation=true;updateButtons();status('RECUPERANDO NORMAL E INVERTIDO…');
  try{
   for(const side of both())await side.restoreLocal();
   await idle();if(alive&&checkAlignment())status('DUAS SESSÕES RECUPERADAS • GIRO '+expectedTurn);
  }finally{operation=false;if(alive)updateButtons();}
 },
 storageChanged(){
  if(!unifiedReady)return;
  const warnings=both().map(s=>s.storageHealth()).filter(Boolean);
  ui('dual-save-health').textContent=[...new Set(warnings)].join(' • ');
  ui('dual-save-health').hidden=!warnings.length;
 },
 render(){if(unifiedReady){pairTimelines();this.storageChanged();}},
 busy:running,prepareHistories,inputNumbers
};
for(const [side,id] of [['NORMAL','dual-normal'],['INVERTIDO','dual-inverted']]){
 const root=ui(id).attachShadow({mode:'open'});
 sides[side]=runBetaSide(side,root,coordinator,nativeDocument);
}
function pairTimelines(){
 const normal=sides.NORMAL.timelineRows(),inverse=new Map(sides.INVERTIDO.timelineRows().map(row=>[row.id,row]));
 for(const row of normal){
  const reversed=inverse.get(row.id);if(!row.item||!reversed?.item)continue;
  let pair=pairedRows.get(row.id);
  if(!pair){pair=nativeDocument.createElement('div');pair.className='timeline-pair';pair.dataset.strategy=row.id;pairedRows.set(row.id,pair);ui('dual-timelines').appendChild(pair);}
  row.item.classList.add('normal-lane');reversed.item.classList.add('reverse-lane');
  const label=reversed.item.querySelector('.timelineName');if(label)label.setAttribute('aria-label',row.name+' • leitura inversa');
  if(row.item.parentNode!==pair)pair.appendChild(row.item);
  if(reversed.item.parentNode!==pair)pair.appendChild(reversed.item);
  // Existing focus elements remain below their own timeline, including after rebuilds.
 }
 for(const [side,id] of [['NORMAL','dual-controls-normal'],['INVERTIDO','dual-controls-inverted']]){
  const focus=sides[side].element('focusGame');
  if(focus&&!focus.hidden){const wanted=pairedRows.get(sides[side].getState().focusTimelineId);const rows=side==='NORMAL'?normal:[...inverse.values()];const lane=rows.find(row=>row.id===sides[side].getState().focusTimelineId)?.item;if(wanted&&lane&&focus.parentNode!==lane)lane.appendChild(focus);}
 }
}
function mountUnified(){
 ui('dual-base-style').textContent=sides.NORMAL.styles();
 for(const [side,tail] of [['NORMAL','normal'],['INVERTIDO','inverted']]){
  const engine=sides[side];
  for(const id of ['strategies','options'])engine.mount(id,ui('dual-controls-'+tail));
  for(const id of ['selected','centers','coverage'])engine.mount(id,ui('dual-play-'+tail));
  for(const id of ['status','importAudit','counter','windowInfo','cycleInfo'])engine.mount(id,ui('dual-audit-'+tail));
  engine.mount('last',ui('dual-last-'+tail));
  // The wrapper itself stretches to the available history lane width.
  ui('dual-last-'+tail).style.flex='1';ui('dual-last-'+tail).style.minWidth='0';
  engine.mount('general',ui('dual-result-'+tail));
  // Register the focus root before it moves under a timeline row.
  engine.mount('focusGame',ui('dual-timelines'));
 }
 for(const id of ['receipt','keys'])sides.NORMAL.mount(id,ui('dual-keyboard'));
 for(const [id,label] of [['stake','VALOR DA FICHA'],['multiplier','MULTIPLICADOR G1']]){
  const wrapper=nativeDocument.createElement('label');wrapper.textContent=label;
  sides.NORMAL.mount(id,wrapper);ui('dual-financial').appendChild(wrapper);
  const input=sides.NORMAL.element(id),previous=input.onchange;
  input.onchange=()=>{previous?.();const s=sides.NORMAL.getState();sides.INVERTIDO.setFinancial(s.stake,s.multiplier);};
 }
 unifiedReady=true;pairTimelines();
}
mountUnified();
ui('dual-control-side').onchange=()=>{const inverse=ui('dual-control-side').value==='INVERTIDO';ui('dual-controls-normal').hidden=inverse;ui('dual-controls-inverted').hidden=!inverse;};
ui('dual-timeline-toggle').onclick=()=>{ui('dual-timelines').hidden=!ui('dual-timelines').hidden;};
ui('dual-general-toggle').onclick=()=>{ui('dual-general').hidden=!ui('dual-general').hidden;};
ui('dual-import').onclick=()=>{try{coordinator.import(inputNumbers(ui('dual-paste').value));}catch(error){alert(String(error.message||error));}};
ui('dual-undo').onclick=()=>coordinator.undo();
ui('dual-clear').onclick=()=>coordinator.clear();
ui('dual-restore').onclick=()=>coordinator.restore();
globalThis.__analiseBetaDual={...coordinator,normal:sides.NORMAL,inverted:sides.INVERTIDO};
globalThis.__analiseBetaDualDispose=()=>{
 if(!alive)return;
 alive=false;both().forEach(s=>s.dispose());
};
updateButtons();
(async()=>{await idle();if(!alive)return;if(checkAlignment()&&expectedTurn)status('NORMAL E INVERTIDO RETOMADOS • GIRO '+expectedTurn);updateButtons();})();

})();
