
(function () {
"use strict";

/*
 ANÁLISE BETA V3.7
 AUTO FIXO / AUTO 2º ⇄ 3º / AUTO MELHORES 2
 G1 CONGELADO E AJUSTE FINO
 12 MOTORES INDEPENDENTES
 RANKING GEOMÉTRICO SOMENTE INFORMATIVO
*/

const KEY = "ANALISE_BETA_V37_GEOMETRIA";

const OLD = [
  "ANALISE_BETA_V36",
  "ANALISE_BETA_V35",
  "ANALISE_BETA_VIRTUAL_V34",
  "ANALISE_BETA_VIRTUAL_V3"
];

const W = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

const INDEX = new Map(W.map((n,i)=>[n,i]));

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

function dist(a,b) {
  if (idx(a)<0 || idx(b)<0) return 99;
  const d = Math.abs(idx(a)-idx(b));
  return Math.min(d,37-d);
}

function signed(a,b) {
  let d = mod(idx(b)-idx(a));
  return d>18 ? d-37 : d;
}

function neigh(n,r) {
  return Array.from(
    {length:r*2+1},
    (_,i)=>W[mod(idx(n)+i-r)]
  );
}

function dozen(n) {
  return n===0 ? 0 : n<=12 ? 1 : n<=24 ? 2 : 3;
}

function color(n) {
  return n===0 ? "#087c48" :
    RED.has(n) ? "#b9233b" : "#171717";
}

const $ = id => document.getElementById(id);

const fmt = n =>
  Number.isFinite(Number(n))
    ? Number(n).toFixed(2).replace(".",",")
    : "—";

function clean(a) {
  return Array.isArray(a)
    ? a.map(Number).filter(n=>
        Number.isInteger(n) && n>=0 && n<=36
      ).slice(-20)
    : [];
}

function matrix(factory) {
  return Object.fromEntries(
    MOTORS.map(m=>[
      m,
      Object.fromEntries(
        RX.map(r=>[r,factory()])
      )
    ])
  );
}

function fresh() {
  return {
    history:[],
    rank:3,
    alternate:false,
    nextRank:3,
    best2:false,
    bestTurn:0,
    fineG1:false,

    seen:0,
    autoWins:0,
    autoLosses:0,

    positionRecords:[],
    positionPending:[],
    positionFrozen:[],

    mode:"AUTO",
    manual:"NORMAL",
    rx:4,

    lines:{
      AUTO:[],
      ...matrix(()=>[])
    },

    pending:{
      AUTO:null,
      ...matrix(()=>null)
    },

    frozen:{
      AUTO:null,
      ...matrix(()=>null)
    },

    cards:[],
    audit:null,

    openLines:false,
    openCandidates:false,
    openVirtual:true
  };
}

let s = fresh();

function load() {
  try {
    let raw = localStorage.getItem(KEY);

    if (!raw) {
      for (const k of OLD) {
        raw = localStorage.getItem(k);
        if (raw) break;
      }
    }

    if (!raw) return;

    const a = JSON.parse(raw);

    s.history = clean(a.history || a.historico);

    s.alternate = !!a.alternate;
    s.best2 = !!a.best2;
    s.bestTurn = Number(a.bestTurn)===1 ? 1 : 0;
    s.fineG1 = !!a.fineG1;

    s.nextRank = [2,3].includes(Number(a.nextRank))
      ? Number(a.nextRank) : 3;

    s.rank = [1,2,3,4].includes(
      Number(a.rank ?? a.autoPosicao)
    ) ? Number(a.rank ?? a.autoPosicao) : 3;

    s.seen = Number(a.seen)||0;
    s.autoWins = Number(a.autoWins)||0;
    s.autoLosses = Number(a.autoLosses)||0;

    s.mode = a.mode || a.modo || "AUTO";
    s.manual = a.manual || a.motorManual || "NORMAL";
    s.rx = Number(a.rx || a.manualRX || 4);

    s.positionRecords = Array.isArray(a.positionRecords)
      ? a.positionRecords.slice(-1000) : [];

    s.positionPending = Array.isArray(a.positionPending)
      ? a.positionPending : [];

    s.positionFrozen = Array.isArray(a.positionFrozen)
      ? a.positionFrozen : [];

    s.openLines = !!(
      a.openLines || a.painelTimelinesAberto
    );

    s.openCandidates = !!(
      a.openCandidates || a.painelCandidatosAberto
    );

    s.openVirtual =
      a.openVirtual ?? a.jogadorVirtualAberto ?? true;

    const lines = a.lines || a.timelines;
    const pending = a.pending || a.pendentes;
    const frozen = a.frozen || a.freezes;

    if (lines) {
      s.lines.AUTO = Array.isArray(lines.AUTO)
        ? lines.AUTO.slice(-20) : [];

      for (const m of MOTORS) {
        for (const r of RX) {
          s.lines[m][r] = Array.isArray(lines[m]?.[r])
            ? lines[m][r].slice(-20) : [];
        }
      }
    }

    if (pending) {
      s.pending.AUTO = pending.AUTO || null;

      for (const m of MOTORS) {
        for (const r of RX) {
          s.pending[m][r] = pending[m]?.[r] || null;
        }
      }
    }

    if (frozen) {
      s.frozen.AUTO = frozen.AUTO || null;

      for (const m of MOTORS) {
        for (const r of RX) {
          s.frozen[m][r] = frozen[m]?.[r] || null;
        }
      }
    }

    s.cards = Array.isArray(a.cards || a.visual)
      ? (a.cards || a.visual).slice(-14) : [];

    s.audit = a.audit || a.diagnostico || null;

  } catch(e) {
    console.warn("Erro ao carregar:",e);
  }
}

function save() {
  try {
    localStorage.setItem(KEY,JSON.stringify(s));
  } catch(e) {
    console.warn(e);
  }
}

load();

/* ESTATÍSTICAS */

function stats(a) {
  const v = (a||[]).filter(x=>
    !x.wait &&
    !x.sem &&
    typeof x.hit==="boolean"
  );

  const rate = n => {
    const b = v.slice(-n);
    return b.length
      ? 100*b.filter(x=>x.hit).length/b.length
      : 0;
  };

  let losses = 0;

  for (let i=v.length-1;i>=0&&!v[i].hit;i--) {
    losses++;
  }

  return {
    n:v.length,
    wins:v.filter(x=>x.hit).length,
    lossesTotal:v.filter(x=>!x.hit).length,
    r10:rate(10),
    r20:rate(20),
    losses
  };
}

/* ANÁLISE FÍSICA */

function heat(history,r) {
  const v = new Float64Array(37);
  const decay = {4:.78,5:.82,6:.86}[r];

  let weight = 1;

  for (let i=history.length-1;i>=0;i--) {
    for (let j=0;j<37;j++) {
      const d = dist(history[i],W[j]);

      if (d<=4) {
        v[j] += [1,.72,.44,.22,.1][d]*weight;
      }
    }

    weight *= decay;
  }

  const max = Math.max(.001,...v);
  return v.map(x=>x/max);
}

function rxMatch(history,r) {
  if (history.length<r*2+4) return null;

  const current = history.slice(-r);
  const samples = [];

  for (let i=0;i+r<history.length-r;i++) {
    let score = 0;

    for (let k=0;k<r;k++) {
      score +=
        (dozen(history[i+k])===dozen(current[k])
          ? .7 : 0) +
        .3*(1-dist(history[i+k],current[k])/19);
    }

    samples.push({
      n:history[i+r],
      score:score/r,
      index:i
    });
  }

  samples.sort((a,b)=>
    b.score-a.score || b.index-a.index
  );

  const chosen = samples.slice(
    0,
    Math.max(4,Math.ceil(samples.length*.3))
  );

  const out = new Float64Array(37);

  for (const x of chosen) {
    for (let j=0;j<37;j++) {
      const d = dist(x.n,W[j]);

      if (d<=3) {
        out[j] += [1,.7,.42,.18][d]*
          (.4+.6*x.score);
      }
    }
  }

  const max = Math.max(.001,...out);

  return {
    values:out.map(x=>x/max),
    similarity:
      chosen.reduce((t,x)=>t+x.score,0)/
      Math.max(1,chosen.length)*100
  };
}

function scores(history,m,r) {
  const recent = heat(history,r);

  const rx = m.startsWith("RX")
    ? rxMatch(history,r)
    : null;

  if (m.startsWith("RX")&&!rx) return null;

  const out = new Float64Array(37);

  for (let j=0;j<37;j++) {
    const n = W[j];
    const z = r-3;

    let near = 0;

    for (const h of history) {
      const d = dist(n,h);
      near += d<=3 ? [1,.72,.4,.15][d] : 0;
    }

    let score =
      (dozen(n)===z ? .60 : 0) +
      recent[j]*.48 +
      near/Math.max(1,history.length)*.6;

    if (m.startsWith("RX")) {
      score = score*.72+rx.values[j]*.7;
    }

    if (m.includes("DINAMICO")) {
      const a = history.slice(-r);
      let v = 0;

      for (let i=0;i<a.length;i++) {
        const d = dist(n,a[i]);

        v += (i+1)/a.length*
          (d<=5 ? (6-d)/6 : 0);
      }

      score += v*.12;
    }

    out[j] = score;
  }

  return {
    out,
    similarity:rx?.similarity||0
  };
}

/*
 GEOMETRIA:
 5 SETORES DE 5 NÚMEROS
 1 SETOR DE 3 NÚMEROS
 TOTAL 28 SEM SOBREPOSIÇÃO

 A pontuação geométrica é preservada
 separadamente para formar o ranking
 informativo da geometria.
*/

function geometry(weights) {
  const p5 = new Float64Array(37);
  const p3 = new Float64Array(37);

  for (let c=0;c<37;c++) {
    for (let d=-2;d<=2;d++) {
      p5[c] += weights[mod(c+d)]*
        (d===0 ? 1.22 :
          Math.abs(d)===1 ? 1.08 : 1);
    }

    for (let d=-1;d<=1;d++) {
      p3[c] += weights[mod(c+d)]*
        (d===0 ? 1.22 : 1);
    }
  }

  let best = null;

  for (let start=0;start<37;start++) {
    for (let short=0;short<6;short++) {
      const sizes = [5,5,5,5,5,5];
      sizes[short] = 3;

      const memo = new Map();

      function solve(k,g) {
        if (k===6) {
          return g===9
            ? {value:0,gaps:[]}
            : null;
        }

        const key = k+"|"+g;

        if (memo.has(key)) {
          return memo.get(key);
        }

        let used = 0;

        for (let i=0;i<k;i++) {
          used += sizes[i];
        }

        const center = mod(
          start+used+g+Math.floor(sizes[k]/2)
        );

        const val = sizes[k]===3
          ? p3[center] : p5[center];

        let winner = null;

        for (let gap=0;gap<=9-g;gap++) {
          if (gap===1) continue;

          const next = solve(k+1,g+gap);
          if (!next) continue;

          const total = val+next.value;

          if (!winner || total>winner.value) {
            winner = {
              value:total,
              gaps:[gap,...next.gaps]
            };
          }
        }

        memo.set(key,winner);
        return winner;
      }

      const result = solve(0,0);

      if (
        !result ||
        (best && result.value<=best.value)
      ) continue;

      let cursor = start;
      const centers5 = [];
      let center3 = null;

      for (let k=0;k<6;k++) {
        const center = W[
          mod(cursor+Math.floor(sizes[k]/2))
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
    ? makePlay(best.centers5,best.center3,best.value)
    : null;
}

function makePlay(centers5,center3,score=0) {
  if (
    !Array.isArray(centers5) ||
    centers5.length!==5 ||
    !W.includes(center3) ||
    centers5.some(n=>!W.includes(n)) ||
    new Set([...centers5,center3]).size!==6
  ) return null;

  const blocks = [
    ...centers5.map(c=>({
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

  const numbers = new Set(
    blocks.flatMap(b=>b.nums)
  );

  if (numbers.size!==28) return null;

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
    valid:true,
    centers5:[...centers5],
    center3,
    blocks,
    numbers,
    score
  };
}

/* SNAPSHOTS */

function snapshot(c) {
  if (!c?.valid) return null;

  return {
    motor:c.motor,
    rx:c.rx,
    rank:c.rank,
    geometryRank:c.geometryRank,
    score:c.autoScore,
    geometryScore:c.play.score,
    centers5:[...c.play.centers5],
    center3:c.play.center3,
    history:s.history.join(",")
  };
}

function snapPlay(x) {
  if (!x) return null;

  return makePlay(
    x.centers5 || x.centros2 || [],
    x.center3 ?? x.centro1
  );
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
      const d = dist(n,b.center);

      return {
        hit:true,
        kind:
          d===0 ? "ALVO" :
          d===1 ? "V1" : "V2",
        gap:0,
        center:b.center
      };
    }
  }

  const closest = play.blocks
    .map(b=>({
      center:b.center,
      r:b.r,
      gap:dist(n,b.center)-b.r,
      side:Math.sign(signed(b.center,n))
    }))
    .sort((a,b)=>a.gap-b.gap)[0];

  return {
    hit:false,
    kind:"FORA",
    ...closest
  };
}

/* G1 AJUSTE FINO */

function tuneG1(original,miss) {
  const base = snapPlay(original);
  if (!base) return null;

  const err = check(miss,base);

  if (err.hit) {
    return {
      ...original,
      g1:{
        type:"ORIGINAL",
        shift:0,
        reason:"Número já coberto"
      }
    };
  }

  const near = base.blocks.slice().sort(
    (a,b)=>
      (dist(miss,a.center)-a.r) -
      (dist(miss,b.center)-b.r)
  );

  const candidates = [];

  function add(p,type,shift,center) {
    if (!p) return;

    const coverage = check(miss,p).hit ? 1 : 0;

    const moved = p.blocks.reduce(
      (sum,b,i)=>
        sum+dist(b.center,base.blocks[i].center),
      0
    );

    candidates.push({
      p,type,shift,center,coverage,moved
    });
  }

  for (const b of near) {
    for (const shift of [-2,-1,1,2]) {
      const newCenter =
        W[mod(idx(b.center)+shift)];

      const centers = base.centers5.slice();
      let short = base.center3;

      if (b.r===1) {
        short = newCenter;
      } else {
        centers[centers.indexOf(b.center)] =
          newCenter;
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
    const move = c=>W[mod(idx(c)+shift)];

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

  candidates.sort((a,b)=>
    b.coverage-a.coverage ||
    a.moved-b.moved ||
    (a.type==="SETOR" ? -1 : 1)
  );

  const chosen = candidates[0];

  if (!chosen) {
    return {
      ...original,
      g1:{
        type:"SEM_AJUSTE",
        shift:0,
        miss,
        reason:"Cobertura original preservada"
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
      coveredMiss:!!chosen.coverage
    }
  };
}

/*
 RANKING DE DESEMPENHO
 Apenas acertos iniciais observados.
 A geometria NÃO entra nesse ranking.
*/

function positionStats(limit=3) {
  const arr = [];

  for (let p=1;p<=12;p++) {
    const items = s.positionRecords.filter(
      x=>x.position===p
    );

    if (!items.length) continue;

    const wins = items.filter(x=>x.hit).length;

    arr.push({
      position:p,
      total:items.length,
      wins,
      rate:100*wins/items.length
    });
  }

  return arr.sort((a,b)=>
    b.rate-a.rate ||
    b.total-a.total ||
    a.position-b.position
  ).slice(0,limit);
}

function currentRank() {
  if (s.best2) {
    const top = positionStats(2);

    return top[s.bestTurn]?.position ??
      top[0]?.position ??
      3;
  }

  return s.alternate ? s.nextRank : s.rank;
}

/*
 CÁLCULO DOS 12 MOTORES

 IMPORTANTE:
 O AUTO mantém a fórmula original.

 O ranking geométrico é separado.
 Não acrescentamos peso geométrico
 à seleção do AUTO.
*/

let cachedKey = null;
let cached = null;

function invalidate() {
  cachedKey = null;
  cached = null;
}

function calculate() {
  const key =
    s.history.join(",")+"|"+
    MOTORS.flatMap(m=>
      RX.map(r=>{
        const t = stats(s.lines[m][r]);

        return [
          t.n,
          t.r10,
          t.r20,
          t.losses
        ].join(":");
      })
    ).join("|")+"|"+currentRank();

  if (cachedKey===key && cached) {
    return cached;
  }

  const configs = matrix(()=>null);
  const ranking = [];

  for (const m of MOTORS) {
    for (const r of RX) {
      const minimum = m.startsWith("RX")
        ? Math.max(14,r*2+4)
        : Math.max(8,r+4);

      if (s.history.length<minimum) continue;

      const v = scores(s.history,m,r);
      if (!v) continue;

      const play = geometry(v.out);
      if (!play) continue;

      const t = stats(s.lines[m][r]);

      const autoScore =
        play.score +
        t.r10*.02 +
        t.r20*.01 -
        t.losses*.30 +
        v.similarity*.005;

      const cfg = {
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

  ranking.sort((a,b)=>
    b.autoScore-a.autoScore ||
    MOTORS.indexOf(a.motor)-
      MOTORS.indexOf(b.motor) ||
    a.rx-b.rx
  );

  ranking.forEach((c,i)=>{
    c.rank=i+1;
  });

  /*
   RANKING GEOMÉTRICO INDEPENDENTE
  */

  const geometryRanking = [...ranking].sort(
    (a,b)=>
      b.play.score-a.play.score ||
      a.rank-b.rank
  );

  geometryRanking.forEach((c,i)=>{
    c.geometryRank=i+1;
  });

  cachedKey = key;

  cached = {
    configs,
    ranking,
    geometryRanking,
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
  const key = s.history.join(",");

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

/* AVALIAÇÃO DAS LINHAS */

function evaluate(n,p,freeze,line,key) {
  line = line.slice(-20);

  if (freeze) {
    const test = check(n,snapPlay(freeze));

    const i = line.findLastIndex(x=>x.wait);

    if (i>=0) {
      line[i] = {
        ...line[i],
        wait:false,
        hit:test.hit,
        g1:n,
        phase:test.hit ? "G1" : "LOSS"
      };
    } else {
      line.push({
        n,
        hit:test.hit,
        g1:n,
        phase:test.hit ? "G1" : "LOSS"
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

  if (!p || p.history!==key) {
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

  const t = check(n,snapPlay(p));

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
            miss:n
          }
        },
    pending:null,
    done:false
  };
}

function updateAll(n) {
  const key = s.history.join(",");

  const a = evaluate(
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
      s.nextRank = s.nextRank===3 ? 2 : 3;
      s.rank = s.nextRank;
    }

    if (s.best2) {
      s.bestTurn = 1-s.bestTurn;
    }
  }

  for (const m of MOTORS) {
    for (const r of RX) {
      const b = evaluate(
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

/* INSERÇÃO DE RESULTADOS */

function addNumber(n) {
  if (
    !Number.isInteger(n) ||
    n<0 || n>36
  ) return;

  const d = calculate();
  prepare(d);

  const original = s.mode==="AUTO"
    ? s.pending.AUTO
    : s.pending[s.manual][s.rx];

  const preRank = d.ranking.map(c=>({
    motor:c.motor,
    rx:c.rx,
    rank:c.rank,
    geometryRank:c.geometryRank,
    score:c.autoScore,
    geometryScore:c.play.score,
    hit:check(n,c.play).hit
  }));

  const oldFreeze = s.mode==="AUTO"
    ? s.frozen.AUTO
    : s.frozen[s.manual][s.rx];

  const wasG1 = !!oldFreeze;

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
    const t = check(n,snapPlay(oldFreeze));
    const last = s.cards.at(-1);

    if (last) {
      last.g1 = n;
      last.hit = t.hit;
      last.phase = t.hit ? "G1" : "LOSS";
    }

    if (s.audit) {
      s.audit.title = t.hit
        ? "G1 ACERTOU"
        : "G1 FALHOU";

      s.audit.text +=
        " Resultado G1: "+n+
        " — "+(t.hit?"ACERTO":"ERRO")+".";
    }

  } else {
    const t = check(n,snapPlay(original));

    s.cards.push({
      n,
      hit:t.hit,
      sem:!original,
      phase:
        !original ? "SEM" :
        t.hit ? "ENTRADA" : "ESPERA"
    });

    const nextG1 =
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

    const alternatives =
      preRank.filter(x=>x.hit);

    let explanation = "";

    if (!original) {
      explanation =
        "Histórico insuficiente para uma jogada válida.";
    } else if (t.hit) {
      explanation =
        "O número "+n+
        " foi coberto na primeira entrada.";
    } else {
      explanation =
        "O número "+n+
        " ficou fora da cobertura inicial. ";

      if (nextG1?.g1?.type==="SETOR") {
        explanation +=
          "Ajuste fino: setor "+
          nextG1.g1.center+
          " deslocado "+
          nextG1.g1.shift+
          " posição(ões). ";
      } else if (
        nextG1?.g1?.type==="CONJUNTO"
      ) {
        explanation +=
          "Ajuste fino: conjunto deslocado "+
          nextG1.g1.shift+
          " posição(ões). ";
      } else {
        explanation +=
          "Cobertura original mantida no G1. ";
      }

      explanation +=
        "Alternativas que cobririam a entrada: "+
        (
          alternatives.map(x=>
            x.rank+"º AUTO / "+
            x.geometryRank+"º GEOMETRIA — "+
            LABEL[x.motor]+" C"+x.rx
          ).join(", ") || "nenhuma"
        )+".";
    }

    s.audit = {
      title:
        !original ? "SEM JOGADA" :
        t.hit ? "ACERTO NA ENTRADA" :
        "AUDITORIA DA FALHA INICIAL",

      text:explanation,

      chosen:original
        ? {
            motor:original.motor,
            rx:original.rx,
            rank:original.rank,
            geometryRank:original.geometryRank,
            score:original.score,
            geometryScore:original.geometryScore,
            centers5:original.centers5,
            center3:original.center3
          }
        : null
    };
  }

  s.cards = s.cards.slice(-14);
  s.history = clean([...s.history,n]);

  invalidate();
  save();
  render();
}

/* CONTROLES */

function resetLines() {
  const a = fresh();

  s.seen = 0;
  s.autoWins = 0;
  s.autoLosses = 0;

  s.positionRecords = [];
  s.positionPending = [];
  s.positionFrozen = [];

  s.nextRank = 3;
  s.bestTurn = 0;

  if (s.alternate) s.rank = 3;

  s.lines = a.lines;
  s.pending = a.pending;
  s.frozen = a.frozen;

  s.cards = [];
  s.audit = null;

  invalidate();
}

function setRank(n) {
  s.best2 = false;
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
  s.best2 = false;
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

function toggleBest2() {
  s.best2 = !s.best2;

  if (s.best2) {
    s.alternate = false;
    s.bestTurn = 0;
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

function setMode(m,r) {
  s.mode = m==="AUTO" ? "AUTO" : "MANUAL";

  if (m!=="AUTO") {
    s.manual = m;
    s.rx = r;
  }

  save();
  render();
}

function insert() {
  const nums = (
    $("inputHistory").value.match(/\d+/g) || []
  ).map(Number).filter(n=>n>=0&&n<=36);

  if (!nums.length) return;

  s.history = clean(nums);
  resetLines();

  $("inputHistory").value = "";

  save();
  render();
}

function undo() {
  if (!s.history.length) return;

  s.history.pop();
  resetLines();

  save();
  render();
}

function clear() {
  if (!confirm("Apagar todo o histórico?")) return;

  s.history = [];
  resetLines();

  save();
  render();
}

/* INTERFACE */

const css = `
*{box-sizing:border-box}
body{
  margin:0;
  background:#101014;
  color:#fff;
  font-family:Arial,sans-serif
}
.app{
  max-width:960px;
  margin:auto;
  padding:9px
}
h2{
  text-align:center;
  font-size:20px
}
.panel{
  background:#1c1e26;
  border:1px solid #3c414e;
  border-radius:10px;
  padding:11px;
  margin-bottom:9px
}
.head{
  width:100%;
  display:flex;
  justify-content:space-between;
  background:#292e3a;
  color:white;
  border:1px solid #4d5669;
  border-radius:7px;
  padding:11px;
  font-weight:bold;
  cursor:pointer
}
.hidden{display:none!important}
.row{
  display:flex;
  gap:6px;
  flex-wrap:wrap;
  margin:8px 0
}
.btn{
  padding:10px;
  border:1px solid #667083;
  border-radius:7px;
  background:#303746;
  color:white;
  font-weight:bold;
  cursor:pointer
}
.btn.selected{
  background:#087b99;
  border:2px solid #00d9ff
}
.rankButtons{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:6px
}
.rankButtons button{font-size:17px}
.small{
  font-size:10px;
  color:#b4bfce;
  line-height:1.6
}
.accent{
  color:#00d9ff;
  font-size:12px;
  font-weight:bold;
  margin:8px 0
}
.grid6{
  display:grid;
  grid-template-columns:repeat(6,minmax(0,1fr));
  gap:5px
}
.center{
  padding:12px 0;
  border-radius:8px;
  text-align:center;
  background:#006fa7;
  border:2px solid #00cfff;
  font-size:24px;
  font-weight:bold
}
.center.short{
  background:#b98c0b;
  border-color:#ffe078;
  color:#111
}
.keys{
  display:grid;
  grid-template-columns:repeat(6,1fr);
  gap:5px
}
.key{
  height:43px;
  color:#fff;
  border:1px solid #666;
  border-radius:7px;
  font-weight:bold;
  cursor:pointer
}
.key.zero{grid-column:span 6}
.line{
  display:grid;
  grid-template-columns:77px 1fr 36px;
  gap:4px;
  align-items:center;
  margin:8px 0;
  font-size:10px
}
.marks{
  display:flex;
  justify-content:flex-end;
  gap:2px;
  overflow:hidden
}
.mark{
  min-width:16px;
  height:19px;
  border-radius:3px;
  display:grid;
  place-items:center;
  font-size:8px;
  background:#555
}
.mark.good{background:#009d55}
.mark.bad{background:#b82b39}
.mark.g1{
  background:#ffcc22;
  color:#111
}
.mark.wait{background:#6c5818}
.history{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  gap:5px
}
.history span{
  padding:9px 2px;
  text-align:center;
  border-radius:6px;
  border:2px solid #555;
  font-size:12px;
  font-weight:bold
}
.audit{
  padding:11px;
  background:#101820;
  border:1px solid #36536b;
  border-radius:7px;
  font-size:12px;
  line-height:1.65
}
textarea{
  width:100%;
  height:65px;
  background:#0f121a;
  color:white;
  border:1px solid #667;
  padding:8px;
  border-radius:7px
}
.candidate{
  padding:7px;
  border-bottom:1px solid #363c48;
  font-size:11px;
  line-height:1.6
}
.candidate.pick{
  background:#123d4b;
  color:#00e5ff
}
.switches{
  display:flex;
  gap:6px;
  flex-wrap:wrap;
  margin:8px 0
}
.switches button{
  flex:1;
  min-width:140px
}
.summaryAuto{
  font-size:11px;
  color:#00e5ff;
  margin:7px 0;
  font-weight:bold;
  line-height:1.6
}
.positionBox{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:6px;
  margin:10px 0
}
.positionCard{
  background:#102b36;
  border:1px solid #00a7c7;
  border-radius:8px;
  padding:9px;
  text-align:center;
  font-size:11px
}
.positionCard strong{
  display:block;
  font-size:21px;
  color:#00e5ff;
  margin:5px
}
.positionCard small{
  font-size:9px;
  color:#b4bfce
}
.info{
  padding:9px;
  background:#121923;
  border:1px solid #344454;
  border-radius:7px;
  margin:7px 0;
  font-size:11px;
  line-height:1.6
}
@media(max-width:600px){
  .history{
    grid-template-columns:repeat(4,1fr)
  }
  .center{font-size:19px}
  .mark{min-width:14px}
}
`;

document.body.innerHTML = `
<style>${css}</style>

<main class="app">

<h2>ANÁLISE BETA V3.7</h2>

<section class="panel">
  <textarea
    id="inputHistory"
    placeholder="Cole os últimos 20 números"
  ></textarea>

  <div class="row">
    <button class="btn" id="insert">INSERIR</button>
    <button class="btn" id="undo">APAGAR ÚLTIMO</button>
    <button class="btn" id="clear">APAGAR TUDO</button>
  </div>

  <div class="small" id="status"></div>
</section>

<section class="panel">

  <button class="head" id="toggleCandidates">
    AUTO • 12 CANDIDATOS
    <span id="arrowCandidates">+</span>
  </button>

  <div class="row">
    <button class="btn" id="auto">AUTO</button>
    <div class="accent" id="autoLabel"></div>
  </div>

  <div class="small">
    POSIÇÃO DO AUTO (PADRÃO: 3º)
  </div>

  <div class="rankButtons" id="rankButtons"></div>

  <div class="switches">
    <button class="btn" id="alternate">
      AUTO 2º ⇄ 3º
    </button>

    <button class="btn" id="best2">
      AUTO MELHORES 2
    </button>

    <button class="btn" id="fine">
      G1 AJUSTE FINO
    </button>
  </div>

  <div class="small" id="alternateInfo"></div>

  <div id="candidatePanel" class="hidden">

    <div id="motorButtons"></div>

    <div class="accent">
      RANKING AUTO • 12 MOTORES
    </div>

    <div id="candidates"></div>

    <div class="accent" style="margin-top:14px">
      RANKING DA GEOMETRIA
    </div>

    <div class="small">
      SOMENTE ACOMPANHAMENTO.
      NÃO ALTERA O AUTO.
    </div>

    <div id="geometryRanking"></div>

  </div>
</section>

<section class="panel">

  <button class="head" id="toggleLines">
    LINHAS DO TEMPO • AUTO + 12 MOTORES
    <span id="arrowLines">+</span>
  </button>

  <div id="autoSummary" class="summaryAuto"></div>
  <div id="autoLine"></div>

  <div id="otherLines" class="hidden"></div>

</section>

<section class="panel">
  <div class="small">ÚLTIMAS 14 JOGADAS</div>
  <div class="history" id="cards"></div>
</section>

<section class="panel">
  <div class="accent" id="playLabel">
    JOGADA ATUAL
  </div>

  <div class="grid6" id="play"></div>
  <div class="small" id="g1Info"></div>
</section>

<section class="panel">
  <div class="small">TECLADO</div>
  <div class="keys" id="keys"></div>
</section>

<section class="panel">

  <button class="head" id="toggleVirtual">
    JOGADOR VIRTUAL
    <span id="arrowVirtual">−</span>
  </button>

  <div id="virtualContent">

    <div class="accent">
      DOIS MELHORES DESEMPENHOS OBSERVADOS
    </div>

    <div class="small">
      TAXA DE ACERTO NA PRIMEIRA ENTRADA
    </div>

    <div class="positionBox" id="positionBox"></div>

    <div class="accent">
      ANÁLISE DA GEOMETRIA
    </div>

    <div class="info" id="geometryVirtual"></div>

    <div class="accent">
      AUDITORIA DA ESCOLHA
    </div>

    <div class="audit" id="virtual"></div>

    <div class="info" id="virtualDetails"></div>

  </div>

</section>

</main>
`;

/* EVENTOS */

$("alternate").onclick = toggleAlternate;
$("best2").onclick = toggleBest2;
$("fine").onclick = toggleFine;

$("insert").onclick = insert;
$("undo").onclick = undo;
$("clear").onclick = clear;

$("auto").onclick = ()=>setMode("AUTO");

$("toggleCandidates").onclick = ()=>{
  s.openCandidates = !s.openCandidates;
  save();
  render();
};

$("toggleLines").onclick = ()=>{
  s.openLines = !s.openLines;
  save();
  render();
};

$("toggleVirtual").onclick = ()=>{
  s.openVirtual = !s.openVirtual;
  save();
  render();
};

/* TECLADO */

for (let n=1;n<=36;n++) {
  const b = document.createElement("button");

  b.className = "key";
  b.textContent = n;
  b.style.background = color(n);
  b.onclick = ()=>addNumber(n);

  $("keys").appendChild(b);
}

const zero = document.createElement("button");

zero.className = "key zero";
zero.textContent = "0";
zero.style.background = color(0);
zero.onclick = ()=>addNumber(0);

$("keys").appendChild(zero);

/* BOTÕES DO AUTO */

for (let n=1;n<=4;n++) {
  const b = document.createElement("button");

  b.className = "btn";
  b.id = "rank"+n;
  b.textContent = n+"º";
  b.onclick = ()=>setRank(n);

  $("rankButtons").appendChild(b);
}

/* BOTÕES DOS MOTORES */

for (const m of MOTORS) {
  const div = document.createElement("div");

  div.className = "row";

  const title = document.createElement("strong");
  title.className = "small";
  title.style.width = "100%";
  title.textContent = LABEL[m];

  div.appendChild(title);

  for (const r of RX) {
    const b = document.createElement("button");

    b.className = "btn";
    b.id = "motor"+PREFIX[m]+r;
    b.textContent = "C"+r;

    b.onclick = ()=>setMode(m,r);

    div.appendChild(b);
  }

  $("motorButtons").appendChild(div);
}

/* LINHAS DO TEMPO */

function lineHtml(name,items) {
  const valid = stats(items);

  const marks = items.slice(-20).map(x=>{
    const cls =
      x.sem ? "" :
      x.wait ? "wait" :
      x.phase==="G1" ? "g1" :
      x.hit ? "good" : "bad";

    const text =
      x.sem ? "—" :
      x.wait ? "…" :
      x.phase==="G1" ? "G1" :
      x.hit ? "G" : "L";

    return '<span class="mark '+cls+'">'+
      text+"</span>";
  }).join("");

  return `
    <div class="line">
      <b>${name}</b>
      <div class="marks">${marks}</div>
      <b>
        ${valid.n ? Math.round(valid.r20)+"%" : "—"}
      </b>
    </div>
  `;
}

/* RENDERIZAÇÃO */

function render() {
  const d = calculate();

  prepare(d);

  $("status").textContent =
    s.history.length+"/20 números"+
    " • "+d.ranking.length+"/12 motores válidos"+
    " • 28 cobertos • 9 descobertos";

  $("autoLabel").textContent = d.auto
    ? (
        "AUTO "+currentRank()+"º: "+
        LABEL[d.auto.motor]+" C"+d.auto.rx+
        " • SCORE "+fmt(d.auto.autoScore)+
        " • GEOMETRIA "+d.auto.geometryRank+"º"
      )
    : "AGUARDANDO MOTORES";

  $("auto").classList.toggle(
    "selected",
    s.mode==="AUTO"
  );

  for (let n=1;n<=4;n++) {
    $("rank"+n).classList.toggle(
      "selected",
      !s.alternate && !s.best2 && s.rank===n
    );
  }

  for (const m of MOTORS) {
    for (const r of RX) {
      $("motor"+PREFIX[m]+r).classList.toggle(
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

  /*
   RANKING AUTO ORIGINAL
  */

  $("candidates").innerHTML =
    d.ranking.map(c=>`
      <div class="candidate ${
        d.auto===c ? "pick" : ""
      }">
        <b>${c.rank}º AUTO</b>
        • ${LABEL[c.motor]} C${c.rx}
        • SCORE ${fmt(c.autoScore)}
        ${d.auto===c ? " • SELECIONADO" : ""}
      </div>
    `).join("");

  /*
   RANKING GEOMÉTRICO INDEPENDENTE
  */

  $("geometryRanking").innerHTML =
    d.geometryRanking.map(c=>`
      <div class="candidate">
        <b>${c.geometryRank}º GEOMETRIA</b>
        • ${LABEL[c.motor]} C${c.rx}
        • PESO ${fmt(c.play.score)}
        • AUTO ${c.rank}º
      </div>
    `).join("");

  $("alternate").classList.toggle(
    "selected",
    s.alternate
  );

  $("best2").classList.toggle(
    "selected",
    s.best2
  );

  $("fine").classList.toggle(
    "selected",
    s.fineG1
  );

  $("alternateInfo").textContent =
    s.best2
      ? (
          "MELHORES 2 • próxima posição "+
          currentRank()+"º • alternância após "+
          "a conclusão da entrada ou G1"
        )
      : s.alternate
        ? (
            s.frozen.AUTO
              ? "G1 CONGELADO • NÃO ALTERAR A POSIÇÃO"
              : "ALTERNÂNCIA ATIVA • PRÓXIMO "+
                currentRank()+"º"
          )
        : "POSIÇÃO FIXA "+s.rank+"º";

  /*
   NÚMEROS VISTOS / WINS / LOSSES
  */

  const complete = s.autoWins+s.autoLosses;

  const rate = complete
    ? 100*s.autoWins/complete
    : null;

  $("autoSummary").textContent =
    "NÚMEROS VISTOS: "+s.seen+
    " • WINS: "+s.autoWins+
    " • LOSSES: "+s.autoLosses+
    " • ASSERTIVIDADE: "+
    (rate===null ? "—" : rate.toFixed(1)+"%")+
    " • JOGADAS CONCLUÍDAS: "+complete;

  $("autoLine").innerHTML =
    lineHtml("AUTO",s.lines.AUTO);

  $("otherLines").classList.toggle(
    "hidden",
    !s.openLines
  );

  $("arrowLines").textContent =
    s.openLines ? "−" : "+";

  $("otherLines").innerHTML =
    MOTORS.map(m=>
      '<div class="small" style="margin-top:10px">'+
      LABEL[m]+
      "</div>"+
      RX.map(r=>
        lineHtml("C"+r,s.lines[m][r])
      ).join("")
    ).join("");

  /*
   ÚLTIMAS 14
  */

  $("cards").innerHTML =
    s.cards.map(x=>{
      const border =
        x.phase==="G1" ? "#ffcc22" :
        x.hit ? "#00bd68" :
        x.phase==="LOSS" ? "#f04a5d" :
        "#777";

      const result =
        x.phase==="G1" ? "G1" :
        x.phase==="ESPERA" ? "…" :
        x.hit ? "G" :
        x.phase==="LOSS" ? "L" : "—";

      return `
        <span style="
          background:${color(x.n)};
          border-color:${border}
        ">
          ${x.n}
          <small style="display:block">
            ${result}
            ${x.g1!=null ? " / "+x.g1 : ""}
          </small>
        </span>
      `;
    }).join("");

  /*
   JOGADA ATUAL E G1 CONGELADO
  */

  const freeze = s.mode==="AUTO"
    ? s.frozen.AUTO
    : s.frozen[s.manual][s.rx];

  const cfg = active(d);

  const play = freeze
    ? snapPlay(freeze)
    : cfg?.play;

  $("playLabel").textContent = freeze
    ? (
        "G1 • "+
        (freeze.g1?.type==="ORIGINAL"
          ? "ORIGINAL" : "AJUSTE FINO")+
        " CONGELADO • "+
        LABEL[freeze.motor]+" C"+freeze.rx
      )
    : cfg
      ? (
          "JOGADA ATUAL • "+
          LABEL[cfg.motor]+" C"+cfg.rx+
          " • AUTO "+cfg.rank+"º"+
          " • GEOMETRIA "+cfg.geometryRank+"º"
        )
      : "AGUARDANDO JOGADA";

  const blocks = play?.blocks
    .slice()
    .sort((a,b)=>idx(a.center)-idx(b.center))
    || [];

  $("play").innerHTML =
    blocks.map(b=>`
      <div
        class="center ${b.r===1 ? "short" : ""}"
        title="${b.nums.join(", ")}"
      >
        ${b.center}
      </div>
    `).join("");

  const g = freeze?.g1;

  $("g1Info").textContent = g
    ? (
        "G1: "+g.type+
        " • DESLOCAMENTO "+g.shift+
        " • ERRO ANTERIOR "+g.miss+
        " • 28 NÚMEROS SEM SOBREPOSIÇÃO"
      )
    : (
        "AZUL: 2 VIZINHOS"+
        " • AMARELO: 1 VIZINHO"+
        " • 28 NÚMEROS COBERTOS"
      );

  /*
   JOGADOR VIRTUAL
   DOIS MELHORES DESEMPENHOS
  */

  $("positionBox").innerHTML =
    positionStats(2).map((x,i)=>`
      <div class="positionCard">
        <small>${i+1}º DESEMPENHO</small>
        <strong>${x.position}ª POSIÇÃO</strong>
        ${x.rate.toFixed(1)}%
        <small style="display:block">
          ${x.wins} acertos /
          ${x.total} entradas
        </small>
      </div>
    `).join("") ||
    '<div class="small">Sem registros suficientes.</div>';

  /*
   GEOMETRIA NO JOGADOR VIRTUAL
  */

  if (d.geometryRanking.length) {
    const best = d.geometryRanking[0];

    $("geometryVirtual").textContent =
      "MELHOR GEOMETRIA: "+
      LABEL[best.motor]+" C"+best.rx+
      " • PESO "+fmt(best.play.score)+
      " • 1º RANKING GEOMÉTRICO"+
      " • "+best.rank+"º RANKING AUTO."+
      " A geometria é informativa e não altera"+
      " a escolha do AUTO.";
  } else {
    $("geometryVirtual").textContent =
      "AGUARDANDO GEOMETRIAS VÁLIDAS.";
  }

  $("virtual").textContent = s.audit
    ? s.audit.title+" — "+s.audit.text
    : "Aguardando resultado para avaliar a escolha.";

  const chosen = s.audit?.chosen;

  $("virtualDetails").textContent = chosen
    ? (
        "ESCOLHA ANTERIOR: "+
        LABEL[chosen.motor]+" C"+chosen.rx+
        " • RANK AUTO: "+chosen.rank+"º"+
        " • RANK GEOMETRIA: "+
        (chosen.geometryRank ?? "—")+"º"+
        " • SCORE AUTO: "+fmt(chosen.score)+
        " • PESO GEOMÉTRICO: "+
        fmt(chosen.geometryScore)+
        " • CENTROS 2V: "+
        chosen.centers5.join(", ")+
        " • CENTRO 1V: "+chosen.center3
      )
    : "Sem escolha anterior para detalhar.";

  $("virtualContent").classList.toggle(
    "hidden",
    !s.openVirtual
  );

  $("arrowVirtual").textContent =
    s.openVirtual ? "−" : "+";

  save();
}

/* INICIALIZAÇÃO */

render();

})();
