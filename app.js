
(function () {
"use strict";

const KEY = "ANALISE_BETA_V36";
const OLD = [
  "ANALISE_BETA_V35",
  "ANALISE_BETA_VIRTUAL_V34",
  "ANALISE_BETA_VIRTUAL_V3",
  "ANALISE_BETA_DUZIAS_RX_12_V32"
];

const W = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

const INDEX = new Map(W.map((n,i) => [n,i]));

const MOTORS = [
  "NORMAL",
  "DINAMICO",
  "RX_NORMAL",
  "RX_DINAMICO"
];

const RX = [4,5,6];

const PREFIX = {
  NORMAL:"N",
  DINAMICO:"D",
  RX_NORMAL:"RN",
  RX_DINAMICO:"RD"
};

const LABEL = {
  NORMAL:"NORMAL",
  DINAMICO:"DINÂMICO",
  RX_NORMAL:"RAIO-X NORMAL",
  RX_DINAMICO:"RAIO-X DINÂMICO"
};

const RED = new Set([
  1,3,5,7,9,12,14,16,18,
  19,21,23,25,27,30,32,34,36
]);

const mod = n => (n%37+37)%37;
const idx = n => INDEX.get(n) ?? -1;

const dist = (a,b) => {
  let d = Math.abs(idx(a)-idx(b));
  return Math.min(d,37-d);
};

const signed = (a,b) => {
  let d = mod(idx(b)-idx(a));
  return d>18 ? d-37 : d;
};

const neigh = (n,r) =>
  Array.from(
    {length:r*2+1},
    (_,i) => W[mod(idx(n)+i-r)]
  );

const dozen = n =>
  n===0 ? 0 : n<=12 ? 1 : n<=24 ? 2 : 3;

const color = n =>
  n===0 ? "#087c48" :
  RED.has(n) ? "#b9233b" : "#171717";

const $ = id => document.getElementById(id);

const fmt = n =>
  Number(n||0).toFixed(2).replace(".",",");

const clean = a =>
  Array.isArray(a)
    ? a.map(Number)
       .filter(n =>
         Number.isInteger(n) &&
         n>=0 && n<=36
       )
       .slice(-20)
    : [];

const matrix = f =>
  Object.fromEntries(
    MOTORS.map(m => [
      m,
      Object.fromEntries(
        RX.map(r => [r,f()])
      )
    ])
  );

function fresh() {
  return {
    history:[],
    rank:3,
    alternate:false,
    nextRank:3,
    fineG1:false,

    seen:0,
    autoWins:0,
    autoLosses:0,
    positionRecords:[],

    mode:"AUTO",
    manual:"NORMAL",
    rx:4,

    lines:{
      AUTO:[],
      ...matrix(() => [])
    },

    pending:{
      AUTO:null,
      ...matrix(() => null)
    },

    frozen:{
      AUTO:null,
      ...matrix(() => null)
    },

    cards:[],
    cardFreeze:null,
    audit:null,

    openLines:false,
    openCandidates:false,
    openVirtual:true
  };
}

let s = fresh();

try {
  let raw = localStorage.getItem(KEY);

  if (!raw) {
    for (const k of OLD) {
      raw = localStorage.getItem(k);
      if (raw) break;
    }
  }

  if (raw) {
    let a = JSON.parse(raw);

    s.history = clean(a.history || a.historico);
    s.alternate = !!a.alternate;

    s.nextRank =
      [2,3].includes(Number(a.nextRank))
        ? Number(a.nextRank)
        : 3;

    s.fineG1 = !!a.fineG1;
    s.seen = Number(a.seen) || 0;
    s.autoWins = Number(a.autoWins) || 0;
    s.autoLosses = Number(a.autoLosses) || 0;

    s.positionRecords =
      Array.isArray(a.positionRecords)
        ? a.positionRecords.slice(-1000)
        : [];

    s.rank =
      [1,2,3,4].includes(
        Number(a.rank ?? a.autoPosicao)
      )
        ? Number(a.rank ?? a.autoPosicao)
        : 3;

    s.mode = a.mode || a.modo || "AUTO";
    s.manual =
      a.manual || a.motorManual || "NORMAL";

    s.rx = Number(a.rx || a.manualRX || 4);

    s.openLines = !!(
      a.openLines ||
      a.painelTimelinesAberto ||
      a.linhasAbertas
    );

    s.openCandidates = !!(
      a.openCandidates ||
      a.painelCandidatosAberto
    );

    s.openVirtual =
      a.openVirtual ??
      a.jogadorVirtualAberto ??
      true;

    const lines = a.lines || a.timelines;
    const pending = a.pending || a.pendentes;
    const frozen = a.frozen || a.freezes;

    if (lines) {
      s.lines.AUTO =
        Array.isArray(lines.AUTO)
          ? lines.AUTO.slice(-20)
          : [];

      for (const m of MOTORS) {
        for (const r of RX) {
          s.lines[m][r] =
            Array.isArray(lines[m]?.[r])
              ? lines[m][r].slice(-20)
              : [];
        }
      }
    }

    if (pending) {
      s.pending.AUTO = pending.AUTO || null;

      for (const m of MOTORS) {
        for (const r of RX) {
          s.pending[m][r] =
            pending[m]?.[r] || null;
        }
      }
    }

    if (frozen) {
      s.frozen.AUTO = frozen.AUTO || null;

      for (const m of MOTORS) {
        for (const r of RX) {
          s.frozen[m][r] =
            frozen[m]?.[r] || null;
        }
      }
    }

    s.cards =
      Array.isArray(a.cards || a.visual)
        ? (a.cards || a.visual).slice(-14)
        : [];

    s.cardFreeze =
      a.cardFreeze || a.visualFreeze || null;

    s.audit =
      a.audit || a.diagnostico || null;
  }
} catch(e) {
  console.warn(
    "Histórico anterior não pôde ser lido",
    e
  );
}

function save() {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(s)
    );
  } catch(e) {
    console.warn(e);
  }
}

function stats(a) {
  const v = (a||[]).filter(x =>
    !x.wait &&
    !x.sem &&
    typeof x.hit === "boolean"
  );

  const rate = n => {
    let b = v.slice(-n);

    return b.length
      ? 100*b.filter(x => x.hit).length/b.length
      : 0;
  };

  let losses = 0;

  for (
    let i=v.length-1;
    i>=0 && !v[i].hit;
    i--
  ) {
    losses++;
  }

  return {
    n:v.length,
    r10:rate(10),
    r20:rate(20),
    losses
  };
}

function heat(history,r) {
  let v = new Float64Array(37);

  let decay = {
    4:.78,
    5:.82,
    6:.86
  }[r];

  let weight = 1;

  for (
    let i=history.length-1;
    i>=0;
    i--
  ) {
    for (let j=0;j<37;j++) {
      let d = dist(history[i],W[j]);

      if (d<=4) {
        v[j] +=
          [1,.72,.44,.22,.1][d]*weight;
      }
    }

    weight *= decay;
  }

  let max = Math.max(.001,...v);

  return v.map(x => x/max);
}

function rxMatch(history,r) {
  if (history.length<r*2+4) {
    return null;
  }

  let current = history.slice(-r);
  let samples = [];

  for (
    let i=0;
    i+r<history.length-r;
    i++
  ) {
    let score = 0;

    for (let k=0;k<r;k++) {
      score +=
        (
          dozen(history[i+k]) ===
          dozen(current[k])
            ? .7
            : 0
        ) +
        .3*(
          1-dist(history[i+k],current[k])/19
        );
    }

    samples.push({
      n:history[i+r],
      score:score/r
    });
  }

  samples.sort((a,b) => b.score-a.score);

  let chosen = samples.slice(
    0,
    Math.max(
      4,
      Math.ceil(samples.length*.3)
    )
  );

  let out = new Float64Array(37);

  for (const x of chosen) {
    for (let j=0;j<37;j++) {
      let d = dist(x.n,W[j]);

      if (d<=3) {
        out[j] +=
          [1,.7,.42,.18][d]*
          (.4+.6*x.score);
      }
    }
  }

  let max = Math.max(.001,...out);

  return {
    values:out.map(x => x/max),
    similarity:
      chosen.reduce(
        (t,x) => t+x.score,
        0
      ) /
      Math.max(1,chosen.length)*100
  };
}

function scores(history,m,r) {
  let recent = heat(history,r);

  let rx = m.startsWith("RX")
    ? rxMatch(history,r)
    : null;

  if (m.startsWith("RX") && !rx) {
    return null;
  }

  let out = new Float64Array(37);

  for (let j=0;j<37;j++) {
    let n = W[j];
    let z = r-3;
    let near = 0;

    for (const h of history) {
      let d = dist(n,h);

      near += d<=3
        ? [1,.72,.4,.15][d]
        : 0;
    }

    let score =
      (dozen(n)===z ? .60 : 0) +
      recent[j]*.48 +
      near/Math.max(1,history.length)*.6;

    if (m.startsWith("RX")) {
      score =
        score*.72 +
        rx.values[j]*.7;
    }

    if (m.includes("DINAMICO")) {
      let a = history.slice(-r);
      let v = 0;

      for (let i=0;i<a.length;i++) {
        let d = dist(n,a[i]);

        v +=
          (i+1)/a.length*
          (d<=5 ? (6-d)/6 : 0);
      }

      score += v*.12;
    }

    out[j] = score;
  }

  return {
    out,
    similarity:rx?.similarity || 0
  };
}

/*
  GEOMETRIA
  Cinco setores de cinco números.
  Um setor de três números.
  Total de 28 números sem sobreposição.
*/

function geometry(weights) {
  let p5 = new Float64Array(37);
  let p3 = new Float64Array(37);

  for (let c=0;c<37;c++) {
    for (let d=-2;d<=2;d++) {
      p5[c] +=
        weights[mod(c+d)]*
        (
          d===0
            ? 1.22
            : Math.abs(d)===1
              ? 1.08
              : 1
        );
    }

    for (let d=-1;d<=1;d++) {
      p3[c] +=
        weights[mod(c+d)]*
        (d===0 ? 1.22 : 1);
    }
  }

  let best = null;

  for (let start=0;start<37;start++) {
    for (let short=0;short<6;short++) {
      let sizes = [5,5,5,5,5,5];
      sizes[short] = 3;

      let memo = new Map();

      function solve(k,g) {
        if (k===6) {
          return g===9
            ? {value:0,gaps:[]}
            : null;
        }

        let key = k+"|"+g;

        if (memo.has(key)) {
          return memo.get(key);
        }

        let used = 0;

        for (let i=0;i<k;i++) {
          used += sizes[i];
        }

        let center = mod(
          start+
          used+
          g+
          Math.floor(sizes[k]/2)
        );

        let val =
          sizes[k]===3
            ? p3[center]
            : p5[center];

        let win = null;

        for (
          let gap=0;
          gap<=9-g;
          gap++
        ) {
          if (gap===1) continue;

          let next = solve(k+1,g+gap);

          if (!next) continue;

          let total = val+next.value;

          if (
            !win ||
            total>win.value
          ) {
            win = {
              value:total,
              gaps:[gap,...next.gaps]
            };
          }
        }

        memo.set(key,win);

        return win;
      }

      let result = solve(0,0);

      if (
        !result ||
        (best && result.value<=best.value)
      ) {
        continue;
      }

      let cursor = start;
      let centers5 = [];
      let center3 = null;

      for (let k=0;k<6;k++) {
        let center = W[
          mod(
            cursor+
            Math.floor(sizes[k]/2)
          )
        ];

        if (sizes[k]===3) {
          center3 = center;
        } else {
          centers5.push(center);
        }

        cursor += sizes[k]+result.gaps[k];
      }

      best = {
        value:result.value,
        centers5,
        center3
      };
    }
  }

  return best
    ? makePlay(
        best.centers5,
        best.center3,
        best.value
      )
    : null;
}

function makePlay(
  centers5,
  center3,
  score=0
) {
  if (
    centers5.length!==5 ||
    new Set([...centers5,center3]).size!==6
  ) {
    return null;
  }

  let blocks = [
    ...centers5.map(c => ({
      center:c,
      r:2,
      nums:neigh(c,2)
    })),
    {
      center:center3,
      r:1,
      nums:neigh(center3,1)
    }
  ];

  let numbers = new Set(
    blocks.flatMap(b => b.nums)
  );

  if (numbers.size!==28) {
    return null;
  }

  for (let i=0;i<37;i++) {
    if (
      !numbers.has(W[i]) &&
      numbers.has(W[mod(i-1)]) &&
      numbers.has(W[mod(i+1)])
    ) {
      return null;
    }
  }

  return {
    centers5:[...centers5],
    center3,
    blocks,
    numbers,
    score,
    valid:true
  };
}

function snapshot(c) {
  return c?.valid
    ? {
        motor:c.motor,
        rx:c.rx,
        rank:c.rank,
        score:c.autoScore,
        centers5:[...c.play.centers5],
        center3:c.play.center3,
        history:s.history.join(",")
      }
    : null;
}

function snapPlay(x) {
  return x
    ? makePlay(
        x.centers5 || x.centros2 || [],
        x.center3 ?? x.centro1
      )
    : null;
}

function check(n,play) {
  if (!play) {
    return {
      hit:false,
      kind:"SEM",
      gap:99
    };
  }

  for (const b of play.blocks) {
    if (b.nums.includes(n)) {
      let d = dist(n,b.center);

      return {
        hit:true,
        kind:
          d===0
            ? "ALVO"
            : d===1
              ? "V1"
              : "V2",
        gap:0,
        center:b.center
      };
    }
  }

  let closest = play.blocks
    .map(b => ({
      center:b.center,
      r:b.r,
      gap:dist(n,b.center)-b.r,
      side:Math.sign(
        signed(b.center,n)
      )
    }))
    .sort((a,b) => a.gap-b.gap)[0];

  return {
    hit:false,
    kind:"FORA",
    ...closest
  };
}

/*
  G1 AJUSTE FINO

  O ajuste só ocorre após falha inicial.
  Não altera a quantidade de setores.
  Não permite sobreposição.
  Congela a jogada ajustada.
*/

function tuneG1(original,miss) {
  let base = snapPlay(original);

  if (!base) return null;

  let err = check(miss,base);

  if (err.hit) {
    return {
      ...original,
      g1:{
        type:"ORIGINAL",
        shift:0,
        reason:"Cobertura já incluía resultado"
      }
    };
  }

  let near = base.blocks
    .slice()
    .sort(
      (a,b) =>
        (dist(miss,a.center)-a.r) -
        (dist(miss,b.center)-b.r)
    );

  let candidates = [];

  const add = (p,type,shift,center) => {
    if (!p) return;

    let coverage =
      check(miss,p).hit ? 1 : 0;

    let moved = p.blocks.reduce(
      (sum,b,i) =>
        sum+
        dist(
          b.center,
          base.blocks[i].center
        ),
      0
    );

    candidates.push({
      p,
      type,
      shift,
      center,
      coverage,
      moved
    });
  };

  for (const b of near) {
    for (const shift of [-2,-1,1,2]) {
      let newCenter =
        W[mod(idx(b.center)+shift)];

      let centers = base.centers5.slice();
      let short = base.center3;

      if (b.r===1) {
        short = newCenter;
      } else {
        centers[
          centers.indexOf(b.center)
        ] = newCenter;
      }

      add(
        makePlay(centers,short),
        "SETOR",
        shift,
        b.center
      );
    }
  }

  for (const shift of [-2,-1,1,2]) {
    let move = c =>
      W[mod(idx(c)+shift)];

    add(
      makePlay(
        base.centers5.map(move),
        move(base.center3)
      ),
      "CONJUNTO",
      shift,
      null
    );
  }

  candidates.sort(
    (a,b) =>
      b.coverage-a.coverage ||
      a.moved-b.moved ||
      (a.type==="SETOR" ? -1 : 1)
  );

  let chosen = candidates[0];

  if (!chosen) {
    return {
      ...original,
      g1:{
        type:"SEM_AJUSTE",
        shift:0,
        reason:
          "Nenhum deslocamento válido; cobertura original mantida"
      }
    };
  }

  return {
    ...original,
    centers5:chosen.p.centers5,
    center3:chosen.p.center3,
    g1:{
      type:chosen.type,
      shift:chosen.shift,
      center:chosen.center,
      miss,
      coveredMiss:!!chosen.coverage,
      reason:
        "Deslocamento físico limitado a 1 ou 2 casas"
    }
  };
}

/*
  AUTO 2º ⇄ 3º

  A alternância só acontece depois
  da conclusão da entrada ou do G1.
*/

function currentRank() {
  return s.alternate
    ? s.nextRank
    : s.rank;
}

let cachedKey = null;
let cached = null;

function invalidate() {
  cachedKey = null;
  cached = null;
}

function calculate() {
  let key =
    s.history.join(",")+"|"+
    MOTORS.flatMap(m =>
      RX.map(r => {
        let t = stats(s.lines[m][r]);

        return [
          t.n,
          t.r10,
          t.r20,
          t.losses
        ].join(":");
      })
    ).join("|");

  if (
    cachedKey===key &&
    cached
  ) {
    return cached;
  }

  let configs = matrix(() => null);
  let ranking = [];

  for (const m of MOTORS) {
    for (const r of RX) {
      let min = m.startsWith("RX")
        ? Math.max(14,r*2+4)
        : Math.max(8,r+4);

      if (s.history.length<min) {
        continue;
      }

      let v = scores(s.history,m,r);

      if (!v) continue;

      let play = geometry(v.out);

      if (!play) continue;

      let t = stats(s.lines[m][r]);

      let autoScore =
        play.score +
        t.r10*.02 +
        t.r20*.01 -
        t.losses*.30 +
        v.similarity*.005;

      let cfg = {
        motor:m,
        rx:r,
        valid:true,
        play,
        autoScore,
        similarity:v.similarity
      };

      configs[m][r] = cfg;
      ranking.push(cfg);
    }
  }

  ranking.sort(
    (a,b) =>
      b.autoScore-a.autoScore ||
      MOTORS.indexOf(a.motor)-
      MOTORS.indexOf(b.motor) ||
      a.rx-b.rx
  );

  ranking.forEach(
    (c,i) => c.rank=i+1
  );

  cachedKey = key;

  cached = {
    configs,
    ranking,
    auto:
      ranking[currentRank()-1] ||
      ranking[ranking.length-1] ||
      null
  };

  return cached;
}

function active(d) {
  return s.mode==="AUTO"
    ? d.auto
    : d.configs[s.manual]?.[s.rx];
}

function prepare(d) {
  let key = s.history.join(",");

  if (
    !s.frozen.AUTO &&
    s.pending.AUTO?.history!==key
  ) {
    s.pending.AUTO = snapshot(d.auto);
  }

  for (const m of MOTORS) {
    for (const r of RX) {
      if (
        !s.frozen[m][r] &&
        s.pending[m][r]?.history!==key
      ) {
        s.pending[m][r] =
          snapshot(d.configs[m][r]);
      }
    }
  }
}

/*
  AVALIAÇÃO DAS JOGADAS
*/

function evaluate(
  n,
  p,
  freeze,
  line,
  key
) {
  line = line.slice(-20);

  if (freeze) {
    let test = check(
      n,
      snapPlay(freeze)
    );

    let i = line.findLastIndex(
      x => x.wait
    );

    if (i>=0) {
      line[i] = {
        ...line[i],
        wait:false,
        hit:test.hit,
        g1:n,
        phase:
          test.hit ? "G1" : "LOSS"
      };
    } else {
      line.push({
        n,
        hit:test.hit,
        g1:n,
        phase:
          test.hit ? "G1" : "LOSS"
      });
    }

    return {
      line:line.slice(-20),
      freeze:null,
      pending:null,
      done:true,
      hit:test.hit
    };
  }

  if (
    !p ||
    p.history!==key
  ) {
    line.push({
      n,
      sem:true,
      phase:"SEM"
    });

    return {
      line:line.slice(-20),
      freeze:null,
      pending:null,
      done:false
    };
  }

  let t = check(
    n,
    snapPlay(p)
  );

  if (t.hit) {
    line.push({
      n,
      hit:true,
      phase:"ENTRADA"
    });

    return {
      line:line.slice(-20),
      freeze:null,
      pending:null,
      done:true,
      hit:true
    };
  }

  line.push({
    n,
    wait:true,
    phase:"ESPERA"
  });

  return {
    line:line.slice(-20),
    freeze:s.fineG1
      ? tuneG1(p,n)
      : {
          ...p,
          g1:{
            type:"ORIGINAL",
            shift:0,
            miss:n,
            reason:"Ajuste fino desligado"
          }
        },
    pending:null,
    done:false
  };
}

function updateAll(n) {
  let key = s.history.join(",");

  let a = evaluate(
    n,
    s.pending.AUTO,
    s.frozen.AUTO,
    s.lines.AUTO,
    key
  );

  s.lines.AUTO = a.line;
  s.pending.AUTO = a.pending;
  s.frozen.AUTO = a.freeze;

  if (a.done) {
    if (a.hit) {
      s.autoWins++;
    } else {
      s.autoLosses++;
    }

    if (s.alternate) {
      s.nextRank =
        s.nextRank===3 ? 2 : 3;

      s.rank = s.nextRank;
    }
  }

  for (const m of MOTORS) {
    for (const r of RX) {
      let b = evaluate(
        n,
        s.pending[m][r],
        s.frozen[m][r],
        s.lines[m][r],
        key
      );

      s.lines[m][r] = b.line;
      s.pending[m][r] = b.pending;
      s.frozen[m][r] = b.freeze;
    }
  }
}

/*
  REGISTRO DOS RESULTADOS
*/

function addNumber(n) {
  if (
    !Number.isInteger(n) ||
    n<0 ||
    n>36
  ) {
    return;
  }

  let d = calculate();
  prepare(d);

  let original =
    s.mode==="AUTO"
      ? s.pending.AUTO
      : s.pending[s.manual][s.rx];

  let preRank = d.ranking.map(c => ({
    motor:c.motor,
    rx:c.rx,
    rank:c.rank,
    score:c.autoScore,
    hit:check(n,c.play).hit
  }));

  let wasG1 = !!s.cardFreeze;
  let oldG1 = s.cardFreeze;

  s.seen++;

  if (!wasG1) {
    for (const c of d.ranking) {
      s.positionRecords.push({
        position:c.rank,
        hit:check(n,c.play).hit
      });
    }

    s.positionRecords =
      s.positionRecords.slice(-1000);
  }

  updateAll(n);

  if (wasG1) {
    let t = check(
      n,
      snapPlay(oldG1)
    );

    let last = s.cards.at(-1);

    if (last) {
      last.g1 = n;
      last.hit = t.hit;
      last.phase =
        t.hit ? "G1" : "LOSS";
    }

    if (s.audit) {
      s.audit.title =
        t.hit
          ? "G1 ACERTOU COM AJUSTE"
          : "G1 FALHOU APÓS AJUSTE";

      s.audit.text +=
        " | G1: "+n+
        " — "+
        (t.hit ? "ACERTO" : "ERRO")+
        ".";
    }

    s.cardFreeze = null;
  } else {
    let t = check(
      n,
      snapPlay(original)
    );

    s.cards.push({
      n,
      hit:t.hit,
      sem:!original,
      phase:
        !original
          ? "SEM"
          : t.hit
            ? "ENTRADA"
            : "ESPERA"
    });

    let nextG1 =
      original && !t.hit
        ? (
            s.fineG1
              ? tuneG1(original,n)
              : {
                  ...original,
                  g1:{
                    type:"ORIGINAL",
                    shift:0,
                    miss:n
                  }
                }
          )
        : null;

    s.cardFreeze = nextG1;

    let alternative =
      preRank.filter(x => x.hit);

    s.audit = {
      title:
        !original
          ? "SEM JOGADA"
          : t.hit
            ? "ACERTO NA ENTRADA"
            : "AJUSTE FINO PREPARADO PARA G1",

      text:
        !original
          ? "Histórico insuficiente."
          : t.hit
            ? "A cobertura inicial acertou o resultado "+n+"."
            : (
                "Resultado "+n+
                " fora da entrada. "+
                (
                  nextG1?.g1?.type==="SETOR"
                    ? "Setor "+
                      nextG1.g1.center+
                      " deslocado "+
                      nextG1.g1.shift+
                      " posição(ões)."
                    : nextG1?.g1?.type==="CONJUNTO"
                      ? "Conjunto deslocado "+
                        nextG1.g1.shift+
                        " posição(ões)."
                      : "Cobertura original preservada."
                )+
                " Alternativas que cobririam a primeira entrada: "+
                (
                  alternative.map(
                    x =>
                      x.rank+"º "+
                      LABEL[x.motor]+
                      " C"+x.rx
                  ).join(", ") ||
                  "nenhuma"
                )+
                ". A mudança não garante o próximo resultado."
              )
    };
  }

  s.cards = s.cards.slice(-14);
  s.history = clean([...s.history,n]);

  invalidate();
  save();
  render();
}

/*
  CONTROLES
*/

function resetLines() {
  let a = fresh();

  s.seen = 0;
  s.autoWins = 0;
  s.autoLosses = 0;
  s.positionRecords = [];

  s.nextRank = 3;

  if (s.alternate) {
    s.rank = 3;
  }

  s.lines = a.lines;
  s.pending = a.pending;
  s.frozen = a.frozen;
  s.cards = [];
  s.cardFreeze = null;
  s.audit = null;

  invalidate();
}

function setRank(n) {
  s.alternate = false;
  s.rank = n;
  s.mode = "AUTO";

  if (!s.frozen.AUTO) {
    s.pending.AUTO = null;
  }

  invalidate();
  save();
  render();
}

function toggleAlternate() {
  s.alternate = !s.alternate;

  if (s.alternate) {
    s.nextRank = 3;
    s.rank = 3;
  }

  s.mode = "AUTO";

  if (!s.frozen.AUTO) {
    s.pending.AUTO = null;
  }

  invalidate();
  save();
  render();
}

function toggleFine() {
  s.fineG1 = !s.fineG1;

  save();
  render();
}

function positionStats() {
  let arr = [];

  for (let p=1;p<=12;p++) {
    let items =
      s.positionRecords.filter(
        x => x.position===p
      );

    if (items.length) {
      let wins =
        items.filter(x => x.hit).length;

      arr.push({
        position:p,
        total:items.length,
        wins,
        rate:100*wins/items.length
      });
    }
  }

  return arr
    .sort(
      (a,b) =>
        b.rate-a.rate ||
        b.total-a.total ||
        a.position-b.position
    )
    .slice(0,3);
}

function setMode(m,r) {
  s.mode =
    m==="AUTO" ? "AUTO" : "MANUAL";

  if (m!=="AUTO") {
    s.manual = m;
    s.rx = r;
  }

  save();
  render();
}

function insert() {
  let nums =
    (
      $("inputHistory").value.match(/\d+/g) ||
      []
    )
    .map(Number)
    .filter(n => n>=0 && n<=36);

  if (!nums.length) return;

  s.history = clean(nums);

  resetLines();

  $("inputHistory").value = "";

  save();
  render();
}

function undo() {
  s.history.pop();

  resetLines();

  save();
  render();
}

function clear() {
  if (!confirm("Apagar todo o histórico?")) {
    return;
  }

  s.history = [];

  resetLines();

  save();
  render();
}

/*
  INTERFACE
*/

const css = `
* {
  box-sizing:border-box;
}

body {
  margin:0;
  background:#101014;
  color:#fff;
  font-family:Arial,sans-serif;
}

.app {
  max-width:960px;
  margin:auto;
  padding:9px;
}

h2 {
  text-align:center;
  font-size:20px;
}

.panel {
  background:#1c1e26;
  border:1px solid #3c414e;
  border-radius:10px;
  padding:11px;
  margin-bottom:9px;
}

.head {
  width:100%;
  display:flex;
  justify-content:space-between;
  background:#292e3a;
  color:white;
  border:1px solid #4d5669;
  border-radius:7px;
  padding:11px;
  font-weight:bold;
}

.hidden {
  display:none!important;
}

.row {
  display:flex;
  gap:6px;
  flex-wrap:wrap;
  margin:8px 0;
}

.btn {
  padding:10px;
  border:1px solid #667083;
  border-radius:7px;
  background:#303746;
  color:white;
  font-weight:bold;
  cursor:pointer;
}

.btn.selected {
  background:#087b99;
  border:2px solid #00d9ff;
}

.rankButtons {
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:6px;
}

.rankButtons button {
  font-size:17px;
}

.small {
  font-size:10px;
  color:#b4bfce;
  line-height:1.6;
}

.accent {
  color:#00d9ff;
  font-size:12px;
  font-weight:bold;
  margin:8px 0;
}

.grid6 {
  display:grid;
  grid-template-columns:repeat(6,minmax(0,1fr));
  gap:5px;
}

.center {
  padding:12px 0;
  border-radius:8px;
  text-align:center;
  background:#006fa7;
  border:2px solid #00cfff;
  font-size:24px;
  font-weight:bold;
}

.center.short {
  background:#b98c0b;
  border-color:#ffe078;
  color:#111;
}

.keys {
  display:grid;
  grid-template-columns:repeat(6,1fr);
  gap:5px;
}

.key {
  height:43px;
  color:#fff;
  border:1px solid #666;
  border-radius:7px;
  font-weight:bold;
  cursor:pointer;
}

.key.zero {
  grid-column:span 6;
}

.line {
  display:grid;
  grid-template-columns:77px 1fr 36px;
  gap:4px;
  align-items:center;
  margin:8px 0;
  font-size:10px;
}

.marks {
  display:flex;
  justify-content:flex-end;
  gap:2px;
  overflow:hidden;
}

.mark {
  min-width:16px;
  height:19px;
  border-radius:3px;
  display:grid;
  place-items:center;
  font-size:8px;
  background:#555;
}

.mark.good {
  background:#009d55;
}

.mark.bad {
  background:#b82b39;
}

.mark.g1 {
  background:#ffcc22;
  color:#111;
}

.mark.wait {
  background:#6c5818;
}

.history {
  display:grid;
  grid-template-columns:repeat(7,1fr);
  gap:5px;
}

.history span {
  padding:9px 2px;
  text-align:center;
  border-radius:6px;
  border:2px solid #555;
  font-size:12px;
  font-weight:bold;
}

.audit {
  padding:11px;
  background:#101820;
  border:1px solid #36536b;
  border-radius:7px;
  font-size:12px;
  line-height:1.65;
}

textarea {
  width:100%;
  height:65px;
  background:#0f121a;
  color:white;
  border:1px solid #667;
  padding:8px;
  border-radius:7px;
}

.candidate {
  padding:7px;
  border-bottom:1px solid #363c48;
  font-size:11px;
}

.candidate.pick {
  background:#123d4b;
  color:#00e5ff;
}

.switches {
  display:flex;
  gap:6px;
  flex-wrap:wrap;
  margin:8px 0;
}

.switches button {
  flex:1;
  min-width:140px;
}

.summaryAuto {
  font-size:11px;
  color:#00e5ff;
  margin:7px 0;
  font-weight:bold;
}

.positionBox {
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:6px;
  margin:10px 0;
}

.positionCard {
  background:#102b36;
  border:1px solid #00a7c7;
  border-radius:8px;
  padding:9px;
  text-align:center;
  font-size:11px;
}

.positionCard strong {
  display:block;
  font-size:21px;
  color:#00e5ff;
  margin:5px;
}

.positionCard small {
  font-size:9px;
  color:#b4bfce;
}

.stats {
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  font-size:11px;
  margin-top:8px;
}

@media(max-width:600px) {
  .history {
    grid-template-columns:repeat(4,1fr);
  }

  .center {
    font-size:19px;
  }

  .mark {
    min-width:14px;
  }
}
`;

document.body.innerHTML = `
<style>${css}</style>

<main class="app">

  <h2>ANÁLISE BETA V3.6</h2>

  <section class="panel">
    <textarea
      id="inputHistory"
      placeholder="Cole os últimos 20 números"
    ></textarea>

    <div class="row">
      <button class="btn" id="insert">
        INSERIR
      </button>

      <button class="btn" id="undo">
        APAGAR ÚLTIMO
      </button>

      <button class="btn" id="clear">
        APAGAR TUDO
      </button>
    </div>

    <div class="small" id="status"></div>
  </section>

  <section class="panel">
    <button class="head" id="toggleCandidates">
      AUTO • 12 CANDIDATOS
      <span id="arrowCandidates">+</span>
    </button>

    <div class="row">
      <button class="btn" id="auto">
        AUTO
      </button>

      <div class="accent" id="autoLabel"></div>
    </div>

    <div class="small">
      POSIÇÃO DO AUTO (PADRÃO: 3º)
    </div>

    <div
      class="rankButtons"
      id="rankButtons"
    ></div>

    <div class="switches">
      <button class="btn" id="alternate">
        AUTO 2º ⇄ 3º
      </button>

      <button class="btn" id="fine">
        G1 AJUSTE FINO
      </button>
    </div>

    <div
      class="small"
      id="alternateInfo"
    ></div>

    <div id="candidatePanel" class="hidden">
      <div id="motorButtons"></div>
      <div id="candidates"></div>
    </div>
  </section>

  <section class="panel">
    <button class="head" id="toggleLines">
      LINHAS DO TEMPO • AUTO + 12 MOTORES
      <span id="arrowLines">+</span>
    </button>

    <div
      id="autoSummary"
      class="summaryAuto"
    ></div>

    <div id="autoLine"></div>

    <div
      id="otherLines"
      class="hidden"
    ></div>
  </section>

  <section class="panel">
    <div class="small">
      ÚLTIMAS 14 JOGADAS
    </div>

    <div
      class="history"
      id="cards"
    ></div>
  </section>

  <section class="panel">
    <div class="accent" id="playLabel">
      JOGADA ATUAL
    </div>

    <div
      class="grid6"
      id="play"
    ></div>

    <div
      class="small"
      id="g1Info"
    ></div>
  </section>

  <section class="panel">
    <div class="small">
      TECLADO
    </div>

    <div
      class="keys"
      id="keys"
    ></div>
  </section>

  <section class="panel">
    <button class="head" id="toggleVirtual">
      JOGADOR VIRTUAL • AJUSTE G1
      <span id="arrowVirtual">−</span>
    </button>

    <div
      class="small"
      style="margin-top:9px"
    >
      POSIÇÕES COM MELHOR RESULTADO OBSERVADO
      (ENTRADA INICIAL)
    </div>

    <div
      id="positionBox"
      class="positionBox"
    ></div>

    <div
      class="audit"
      id="virtual"
    ></div>
  </section>

</main>
`;

/*
  EVENTOS
*/

$("alternate").onclick = toggleAlternate;
$("fine").onclick = toggleFine;
$("insert").onclick = insert;
$("undo").onclick = undo;
$("clear").onclick = clear;

$("auto").onclick = () =>
  setMode("AUTO");

$("toggleCandidates").onclick = () => {
  s.openCandidates = !s.openCandidates;
  save();
  render();
};

$("toggleLines").onclick = () => {
  s.openLines = !s.openLines;
  save();
  render();
};

$("toggleVirtual").onclick = () => {
  s.openVirtual = !s.openVirtual;
  save();
  render();
};

/*
  TECLADO
*/

for (let n=1;n<=36;n++) {
  let b = document.createElement("button");

  b.className = "key";
  b.textContent = n;
  b.style.background = color(n);

  b.onclick = () => addNumber(n);

  $("keys").appendChild(b);
}

let zero = document.createElement("button");

zero.className = "key zero";
zero.textContent = "0";
zero.style.background = color(0);

zero.onclick = () => addNumber(0);

$("keys").appendChild(zero);

/*
  BOTÕES DE POSIÇÃO
*/

for (let n=1;n<=4;n++) {
  let b = document.createElement("button");

  b.className = "btn";
  b.id = "rank"+n;
  b.textContent = n+"º";

  b.onclick = () => setRank(n);

  $("rankButtons").appendChild(b);
}

/*
  BOTÕES DOS 12 MOTORES
*/

for (const m of MOTORS) {
  let div = document.createElement("div");

  div.className = "row";

  div.innerHTML =
    '<strong class="small" style="width:100%">'+
    LABEL[m]+
    "</strong>";

  for (const r of RX) {
    let b = document.createElement("button");

    b.className = "btn";
    b.id = "motor"+PREFIX[m]+r;
    b.textContent = "C"+r;

    b.onclick = () => setMode(m,r);

    div.appendChild(b);
  }

  $("motorButtons").appendChild(div);
}

/*
  LINHAS DO TEMPO
*/

function lineHtml(name,items) {
  let valid = stats(items);

  let marks = items
    .slice(-20)
    .map(x => {
      let classe =
        x.sem
          ? ""
          : x.wait
            ? "wait"
            : x.phase==="G1"
              ? "g1"
              : x.hit
                ? "good"
                : "bad";

      let texto =
        x.sem
          ? "—"
          : x.wait
            ? "…"
            : x.phase==="G1"
              ? "G1"
              : x.hit
                ? "G"
                : "L";

      return (
        '<span class="mark '+classe+'">'+
        texto+
        "</span>"
      );
    })
    .join("");

  return (
    '<div class="line">'+
      "<b>"+name+"</b>"+
      '<div class="marks">'+marks+"</div>"+
      "<b>"+
        (
          valid.n
            ? Math.round(valid.r20)+"%"
            : "—"
        )+
      "</b>"+
    "</div>"
  );
}

/*
  RENDERIZAÇÃO
*/

function render() {
  let d = calculate();

  prepare(d);

  $("status").textContent =
    s.history.length+
    "/20 números • "+
    d.ranking.length+
    "/12 motores válidos • "+
    "28 cobertos • 9 descobertos";

  $("autoLabel").textContent =
    d.auto
      ? (
          "AUTO "+
          currentRank()+
          "º: "+
          LABEL[d.auto.motor]+
          " C"+d.auto.rx+
          " • "+
          fmt(d.auto.autoScore)
        )
      : "AGUARDANDO MOTORES";

  $("auto").classList.toggle(
    "selected",
    s.mode==="AUTO"
  );

  for (let n=1;n<=4;n++) {
    $("rank"+n).classList.toggle(
      "selected",
      !s.alternate && s.rank===n
    );
  }

  for (const m of MOTORS) {
    for (const r of RX) {
      $("motor"+PREFIX[m]+r)
        .classList.toggle(
          "selected",
          s.mode==="MANUAL" &&
          s.manual===m &&
          s.rx===r
        );
    }
  }

  $("candidatePanel").classList.toggle(
    "hidden",
    !s.openCandidates
  );

  $("arrowCandidates").textContent =
    s.openCandidates ? "−" : "+";

  $("candidates").innerHTML =
    d.ranking.map(c =>
      '<div class="candidate '+
      (d.auto===c ? "pick" : "")+
      '">'+
      c.rank+"º • "+
      LABEL[c.motor]+
      " C"+c.rx+
      " • "+
      fmt(c.autoScore)+
      (d.auto===c ? " • AUTO" : "")+
      "</div>"
    ).join("");

  $("alternate").classList.toggle(
    "selected",
    s.alternate
  );

  $("fine").classList.toggle(
    "selected",
    s.fineG1
  );

  $("alternateInfo").textContent =
    s.alternate
      ? (
          s.frozen.AUTO
            ? "G1 CONGELADO • alterna só depois do resultado final"
            : "ATIVADO • próxima entrada "+
              currentRank()+
              "º colocado"
        )
      : "POSIÇÃO FIXA "+s.rank+"º";

  /*
    WINS / LOSSES / ASSERTIVIDADE
  */

  let complete =
    s.autoWins+s.autoLosses;

  let rate =
    complete
      ? 100*s.autoWins/complete
      : null;

  $("autoSummary").textContent =
    "NÚMEROS VISTOS: "+s.seen+
    " • WINS: "+s.autoWins+
    " • LOSSES: "+s.autoLosses+
    " • ASSERTIVIDADE: "+
    (
      rate===null
        ? "—"
        : rate.toFixed(1)+"%"
    )+
    " • ENTRADAS CONCLUÍDAS: "+
    complete;

  $("autoLine").innerHTML =
    lineHtml(
      "AUTO",
      s.lines.AUTO
    );

  $("otherLines").classList.toggle(
    "hidden",
    !s.openLines
  );

  $("arrowLines").textContent =
    s.openLines ? "−" : "+";

  $("otherLines").innerHTML =
    MOTORS.map(m =>
      '<div class="small" style="margin-top:10px">'+
      LABEL[m]+
      "</div>"+
      RX.map(r =>
        lineHtml(
          "C"+r,
          s.lines[m][r]
        )
      ).join("")
    ).join("");

  /*
    ÚLTIMAS 14 JOGADAS
  */

  $("cards").innerHTML =
    s.cards.map(x => {
      let border =
        x.phase==="G1"
          ? "#ffcc22"
          : x.hit
            ? "#00bd68"
            : x.phase==="LOSS"
              ? "#f04a5d"
              : "#777";

      let result =
        x.phase==="G1"
          ? "G1"
          : x.phase==="ESPERA"
            ? "…"
            : x.hit
              ? "G"
              : x.phase==="LOSS"
                ? "L"
                : "—";

      return (
        '<span style="background:'+
        color(x.n)+
        ";border-color:"+
        border+
        '">'+
        x.n+
        '<small style="display:block">'+
        result+
        (
          x.g1!=null
            ? " / "+x.g1
            : ""
        )+
        "</small>"+
        "</span>"
      );
    }).join("");

  /*
    JOGADA ATUAL / G1 CONGELADO
  */

  let freeze =
    s.mode==="AUTO"
      ? s.frozen.AUTO
      : s.frozen[s.manual][s.rx];

  let cfg = active(d);

  let play =
    freeze
      ? snapPlay(freeze)
      : cfg?.play;

  $("playLabel").textContent =
    freeze
      ? (
          "G1 • "+
          (
            freeze.g1?.type==="ORIGINAL"
              ? "ORIGINAL"
              : "AJUSTE FINO"
          )+
          " CONGELADO • "+
          LABEL[freeze.motor]+
          " C"+freeze.rx
        )
      : cfg
        ? (
            "JOGADA INICIAL • "+
            LABEL[cfg.motor]+
            " C"+cfg.rx
          )
        : "AGUARDANDO JOGADA";

  let blocks =
    play?.blocks
      .slice()
      .sort(
        (a,b) =>
          idx(a.center)-idx(b.center)
      ) || [];

  $("play").innerHTML =
    blocks.map(b =>
      '<div class="center '+
      (b.r===1 ? "short" : "")+
      '" title="'+
      b.nums.join(", ")+
      '">'+
      b.center+
      "</div>"
    ).join("");

  let g = freeze?.g1;

  $("g1Info").textContent =
    g
      ? (
          "G1: "+g.type+
          " • DESLOCAMENTO "+g.shift+
          " • ERRO ANTERIOR "+g.miss+
          " • 28 NÚMEROS SEM SOBREPOSIÇÃO"
        )
      : (
          "AZUL: 2 VIZINHOS • "+
          "AMARELO: 1 VIZINHO • "+
          "28 NÚMEROS"
        );

  /*
    JOGADOR VIRTUAL
    TRÊS MELHORES POSIÇÕES OBSERVADAS
  */

  $("positionBox").innerHTML =
    positionStats().map((x,i) =>
      '<div class="positionCard">'+
      "<small>"+
        (i+1)+
        "º DESEMPENHO"+
      "</small>"+
      "<strong>"+
        x.position+
        "ª POSIÇÃO"+
      "</strong>"+
      x.rate.toFixed(1)+
      "%<br>"+
      "<small>"+
        x.wins+
        " acertos / "+
        x.total+
        " entradas"+
      "</small>"+
      "</div>"
    ).join("") ||
    '<div class="small">'+
    "Sem entradas suficientes para comparar posições."+
    "</div>";

  $("virtual").classList.toggle(
    "hidden",
    !s.openVirtual
  );

  $("positionBox").classList.toggle(
    "hidden",
    !s.openVirtual
  );

  $("arrowVirtual").textContent =
    s.openVirtual ? "−" : "+";

  $("virtual").textContent =
    s.audit
      ? s.audit.title+" — "+s.audit.text
      : "Aguardando resultado para avaliar o G1.";

  save();
}

/*
  INICIALIZAÇÃO
*/

render();

})();
