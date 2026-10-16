(() => {
"use strict";

const VERSION = "6.3.5";
const KEY = "ANALISE_BETA_V635";

const OLD_KEYS = [
  "ANALISE_BETA_V634",
  "ANALISE_BETA_V633",
  "ANALISE_BETA_V632",
  "ANALISE_BETA_V631",
  "ANALISE_BETA_V63",
  "ANALISE_BETA_V62",
  "ANALISE_BETA_V61",
  "ANALISE_BETA_V60",
  "ANALISE_BETA_V59",
  "ANALISE_BETA_V55_COMPLETO"
];

const W = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

const RED = new Set([
  1,3,5,7,9,12,14,16,18,
  19,21,23,25,27,30,32,34,36
]);

const REGIONS = {
  TIERS: [27,13,36,11,30,8,23,10,5,24,16,33],
  ORFAOS: [17,34,6,1,20,14,31,9],
  VOISINS: [22,18,29,7,25,2,21,4,19],
  ZERO: [28,12,35,3,26,0,32,15]
};

const FAMILIES = [
  "NORMAL",
  "DINAMICO",
  "RX_NORMAL",
  "RX_DINAMICO"
];

const RADII = [4,5,6];

const ORIGINALS = [
  ["FIXED","AUTO RANKING"],
  ["GEO","MELHOR GEOMETRIA"],
  ["BEST","MELHOR DESEMPENHO"],
  ["STABLE","ESTABILIDADE"],
  ["SWITCH","TROCA INTELIGENTE"],
  ["CONSENSUS","CONSENSO"],
  ["UNION","UNIÃO"]
];

const ADAPTATIVES = Array.from(
  {length:12},
  (_,i) => ({
    id:"A"+String(i+1).padStart(2,"0"),
    name:"ADAPTATIVA "+String(i+1).padStart(2,"0"),
    window:[10,10,10,20,20,20,30,30,20,30,20,30][i],
    margin:[.05,.10,.15,.05,.10,.15,.05,.10,.08,.12,.10,.08][i],
    maxRank:[12,12,12,12,12,12,12,12,12,6,4,8][i]
  })
);

const $ = id => document.getElementById(id);
const mod = n => (n%37+37)%37;
const idx = n => W.indexOf(n);
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const avg = a => a.length?a.reduce((s,n)=>s+n,0)/a.length:0;
const clone = x => x==null?x:JSON.parse(JSON.stringify(x));
const fmt = n => Number.isFinite(n)?n.toFixed(2).replace(".",","):"—";
const pct = (a,b) => b?fmt(100*a/b)+"%":"—";

const esc = x => String(x??"").replace(
  /[&<>"']/g,
  c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c])
);

function neighbors(n,r) {
  const p=idx(n);
  return Array.from(
    {length:2*r+1},
    (_,i)=>W[mod(p+i-r)]
  );
}

function distance(a,b) {
  const d=Math.abs(idx(a)-idx(b));
  return Math.min(d,37-d);
}

function direction(a,b) {
  const f=mod(idx(b)-idx(a));
  const r=mod(idx(a)-idx(b));
  return f<=r?f:-r;
}

function region(n) {
  return Object.keys(REGIONS).find(
    k=>REGIONS[k].includes(n)
  )||"ZERO";
}

const MIRROR=new Set();

for(const n of [11,12,13,21,22,23,31,32,33]) {
  for(const x of neighbors(n,1)) MIRROR.add(x);
}

const mirror=n=>MIRROR.has(n)?"ESPELHO":"ANTIESPELHO";

function fresh() {
  return {
    history:[],
    sources:[],
    ledger:[],
    virtualRows:[],
    virtualCycles:{},
    createdStrategies:[],

    strategy:"TRAINER",
    rank:3,
    manual:null,
    activeAdaptive:"A05",
    activeCreated:null,

    g1:true,
    g1Trainer:true,
    galeSkip:false,
    secondHouse:false,

    phase:"ENTRY",
    cycle:null,
    frozen:null,
    g1Decision:null,
    previousMotor:null,

    trainerChoice:null,
    trainerMotor:null,
    trainerTurns:0,
    trainerPending:false,
    trainerChanges:0,
    trainerHistory:[],
    protection:false,

    stake:1,
    galeMultiplier:1,

    g1History:[],
    g1Stats:{},
    g1Pending:[],
    g1Events:0,
    g1Decisions:[],
    g1Exclusion:{},

    open:{
      general:true,
      trainer:true,
      lab:false,
      motors:false,
      jumps:false,
      mirrors:false,
      timeline:true
    }
  };
}

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)||"null");
  } catch {
    return null;
  }
}

let state=fresh();
let origin=null;

for(const key of [KEY,...OLD_KEYS]) {
  const data=read(key);

  if(data&&Array.isArray(data.history)) {
    state={
      ...fresh(),
      ...data,
      open:{
        ...fresh().open,
        ...(data.open||{})
      }
    };
    origin=key;
    break;
  }
}

state.history=state.history.filter(
  n=>Number.isInteger(n)&&n>=0&&n<=36
);

for(const key of [
  "sources","ledger","virtualRows",
  "createdStrategies","trainerHistory",
  "g1History","g1Pending","g1Decisions"
]) {
  if(!Array.isArray(state[key])) state[key]=[];
}

for(const key of ["g1Stats","g1Exclusion"]) {
  if(!state[key]||typeof state[key]!=="object") {
    state[key]={};
  }
}

state.virtualCycles={};

if(origin!==KEY) {
  state.g1Stats={};
  state.g1Pending=[];
  state.g1Events=0;
  state.g1Decisions=[];
  state.g1Exclusion={};
  state.g1Trainer=true;
}

let storageWarning=false;

/* ARMAZENAMENTO COM COMPACTAÇÃO */

function compact() {
  state.ledger=state.ledger.slice(-150);
  state.virtualRows=state.virtualRows.slice(-1100);
  state.g1History=state.g1History.slice(-150);
  state.g1Decisions=state.g1Decisions.slice(-100);
  state.trainerHistory=state.trainerHistory.slice(-100);

  for(const map of [state.g1Stats,state.g1Exclusion]) {
    for(const [key,s] of Object.entries(map)) {
      s.recent=(s.recent||[]).slice(-50);
      if(!s.total) delete map[key];
    }
  }
}

function save() {
  compact();

  try {
    localStorage.setItem(KEY,JSON.stringify(state));
    storageWarning=false;
    return true;
  } catch {
    try {
      state.ledger=state.ledger.slice(-35);
      state.virtualRows=state.virtualRows.slice(-200);
      state.g1History=state.g1History.slice(-40);
      state.g1Decisions=state.g1Decisions.slice(-40);
      state.trainerHistory=state.trainerHistory.slice(-40);

      localStorage.setItem(KEY,JSON.stringify(state));
      storageWarning=false;
      return true;
    } catch {
      storageWarning=true;
      return false;
    }
  }
}

if(origin&&origin!==KEY) save();

/* ANÁLISE SEQUENCIAL */

function analyze(history) {
  const t=[];

  for(let i=Math.max(1,history.length-45);i<history.length;i++) {
    const a=history[i-1];
    const b=history[i];
    const pd=direction(a,b);

    t.push({
      from:a,
      to:b,
      numeric:b-a,
      physical:pd,
      distance:Math.abs(pd),
      mirrorFrom:mirror(a),
      mirrorTo:mirror(b)
    });
  }

  const last6=t.slice(-6);
  const last3=t.slice(-3);
  const prev3=t.slice(-6,-3);

  function streak(field) {
    const d=Math.sign(t.at(-1)?.[field]||0);
    let length=0;

    if(d) {
      for(let i=t.length-1;i>=0;i--) {
        if(Math.sign(t[i][field])!==d) break;
        length++;
      }
    }

    return {dir:d,length};
  }

  const regions={};

  for(const s of Object.keys(REGIONS)) {
    let absence=0;

    for(let i=history.length-1;i>=0;i--) {
      if(region(history[i])===s) break;
      absence++;
    }

    regions[s]={
      absence,
      recent:history.slice(-12).filter(
        n=>region(n)===s
      ).length
    };
  }

  return {
    transitions:t,
    last6,
    numericStreak:streak("numeric"),
    physicalStreak:streak("physical"),
    mean3:avg(last3.map(x=>x.distance)),
    previous3:avg(prev3.map(x=>x.distance)),
    acceleration:
      avg(last3.map(x=>x.distance))-
      avg(prev3.map(x=>x.distance)),
    regions,
    mirrorTransitions:last6.filter(
      x=>x.mirrorFrom!==x.mirrorTo
    ).length,
    mirrorDistance:avg(
      last6.filter(
        x=>x.mirrorFrom==="ESPELHO"||
           x.mirrorTo==="ESPELHO"
      ).map(x=>x.distance)
    )
  };
}

/* 12 MOTORES */

function weightsFor(history,family,radius) {
  const weights=Array(37).fill(.01);
  const recent=history.slice(-50);

  for(let k=0;k<recent.length;k++) {
    const p=idx(recent[recent.length-1-k]);
    const decay=Math.exp(-k/(radius*2.3));

    for(let j=0;j<37;j++) {
      const d=Math.min(Math.abs(p-j),37-Math.abs(p-j));

      if(d<=6) weights[j]+=decay*(7-d)/7;
    }
  }

  if(family.includes("DINAMICO")) {
    for(let k=0;k<Math.min(radius+2,history.length);k++) {
      const p=idx(history[history.length-1-k]);

      for(let j=0;j<37;j++) {
        const d=Math.min(Math.abs(p-j),37-Math.abs(p-j));

        if(d<=3) weights[j]+=(4-d)/(k+2)*1.7;
      }
    }
  }

  if(family.startsWith("RX")) {
    const length=Math.min(radius,history.length-2);

    if(length>=2) {
      const current=history.slice(-length);
      const matches=[];
      const start=Math.max(0,history.length-160-length);

      for(let i=start;i+length<history.length-1;i++) {
        let score=0;

        for(let j=0;j<length;j++) {
          score+=Math.max(
            0,
            6-distance(current[j],history[i+j])
          )/6;
        }

        matches.push({
          score:score/length,
          next:history[i+length]
        });
      }

      matches.sort((a,b)=>b.score-a.score);

      for(const m of matches.slice(0,12)) {
        const p=idx(m.next);

        for(let j=0;j<37;j++) {
          const d=Math.min(Math.abs(p-j),37-Math.abs(p-j));

          if(d<=3) weights[j]+=(4-d)*m.score*.45;
        }
      }
    }
  }

  if(history.length>=3) {
    const a=analyze(history);
    const last=history.at(-1);

    const up=a.last6.filter(x=>x.numeric>0).length;
    const down=a.last6.filter(x=>x.numeric<0).length;
    const nb=(up-down)/Math.max(1,up+down);

    const cw=a.last6.filter(x=>x.physical>0).length;
    const ccw=a.last6.filter(x=>x.physical<0).length;
    const pb=(cw-ccw)/Math.max(1,cw+ccw);

    const expected=clamp(
      Math.round(avg(a.last6.map(x=>x.distance))),
      1,18
    );

    const lastJump=a.last6.at(-1)?.distance||0;

    const target=clamp(
      Math.round(lastJump+a.acceleration*.5),
      1,18
    );

    const strength={
      NORMAL:.72,
      DINAMICO:1,
      RX_NORMAL:.88,
      RX_DINAMICO:1.12
    }[family]||1;

    for(const n of W) {
      const nd=n-last;
      const pd=direction(last,n);
      const d=Math.abs(pd);
      let bonus=0;

      if(nb&&Math.sign(nd)===Math.sign(nb)) {
        bonus+=.10*Math.abs(nb);
      }

      if(a.numericStreak.length>=2&&
         Math.sign(nd)===a.numericStreak.dir) {
        bonus+=.07;
      }

      if(pb&&Math.sign(pd)===Math.sign(pb)) {
        bonus+=.12*Math.abs(pb);
      }

      if(a.physicalStreak.length>=2&&
         Math.sign(pd)===a.physicalStreak.dir) {
        bonus+=.07;
      }

      if(Math.abs(d-expected)<=2) bonus+=.09;
      if(Math.abs(d-target)<=2) bonus+=.09;
      if(a.acceleration>=3&&d>=10) bonus+=.07;
      if(a.acceleration<=-3&&d<=5) bonus+=.07;

      const change=mirror(n)!==mirror(last);
      const rate=a.mirrorTransitions/
        Math.max(1,a.last6.length);

      bonus+=change?.045*rate:.045*(1-rate);

      if(a.mirrorDistance&&
         Math.abs(d-a.mirrorDistance)<=2) {
        bonus+=.055;
      }

      if(a.mean3>=9) {
        bonus+=.045/
          (1+a.regions[region(n)].recent*.2);
      }

      weights[idx(n)]+=
        bonus*strength*radius/5;
    }
  }

  return weights;
}

/* GEOMETRIA 28 NÚMEROS */

const FIVE=[];
const THREE=[];

for(let p=0;p<37;p++) {
  for(const radius of [1,2]) {
    const numbers=neighbors(W[p],radius);

    const block={
      center:W[p],
      radius,
      numbers,
      mask:numbers.reduce(
        (s,n)=>s|(1n<<BigInt(idx(n))),
        0n
      )
    };

    (radius===1?THREE:FIVE).push(block);
  }
}

function geometry(weights,mandatory=[]) {
  const score=b=>({
    ...b,
    value:b.numbers.reduce(
      (s,n)=>s+weights[idx(n)],0
    )
  });

  const fives=FIVE.map(score).sort(
    (a,b)=>b.value-a.value
  );

  const threes=THREE.map(score)
    .filter(b=>mandatory.every(n=>b.numbers.includes(n)))
    .sort((a,b)=>b.value-a.value);

  let best=null;

  for(const small of threes) {
    let beam=[{
      blocks:[small],
      mask:small.mask,
      score:small.value
    }];

    for(let step=0;step<5;step++) {
      const next=[];

      for(const item of beam) {
        for(const b of fives) {
          if((item.mask&b.mask)!==0n) continue;

          next.push({
            blocks:[...item.blocks,b],
            mask:item.mask|b.mask,
            score:item.score+b.value
          });
        }
      }

      next.sort((a,b)=>b.score-a.score);

      const seen=new Set();
      beam=[];

      for(const item of next) {
        const key=item.mask.toString();

        if(seen.has(key)) continue;
        seen.add(key);
        beam.push(item);

        if(beam.length>=5) break;
      }

      if(!beam.length) break;
    }

    for(const item of beam) {
      if(item.blocks.length!==6) continue;

      if(!best||item.score>best.score) {
        best=item;
      }
    }
  }

  if(!best) return null;

  const blocks=best.blocks.map(b=>({
    center:b.center,
    radius:b.radius,
    numbers:[...b.numbers]
  }));

  const numbers=blocks.flatMap(b=>b.numbers);

  if(new Set(numbers).size!==28) return null;

  return {
    score:best.score,
    blocks,
    numbers,
    centers5:blocks.filter(
      b=>b.radius===2
    ).map(b=>b.center),
    center3:blocks.find(
      b=>b.radius===1
    ).center
  };
}

function candidates(history) {
  if(history.length<8) return [];

  const result=[];

  for(const family of FAMILIES) {
    for(const radius of RADII) {
      if(family.startsWith("RX")&&
         history.length<radius*2+4) {
        continue;
      }

      const play=geometry(
        weightsFor(history,family,radius)
      );

      if(!play) continue;

      result.push({
        key:family+"_"+radius,
        family,
        radius,
        score:play.score,
        play
      });
    }
  }

  result.sort((a,b)=>b.score-a.score);

  result.forEach((c,i)=>{
    c.rank=i+1;
  });

  return result;
}

let cacheKey="";
let cacheValue=[];

function getCandidates() {
  const h=state.history.slice(-200);
  const key=state.history.length+":"+
    h.slice(-30).join(",");

  if(key!==cacheKey) {
    cacheKey=key;
    cacheValue=candidates(h);
  }

  return cacheValue;
}

function invalidate() {
  cacheKey="";
}

/* ESTRATÉGIAS */

function definitions() {
  const defs=ORIGINALS.map(([rule,name])=>({
    id:"ORIGINAL:"+rule,
    name,
    type:"ORIGINAL",
    rule
  }));

  for(let i=1;i<=4;i++) {
    defs.push({
      id:"RANK:"+i,
      name:"AUTO "+i+"º",
      type:"RANK",
      rank:i
    });
  }

  for(const c of ADAPTATIVES) {
    defs.push({
      id:"ADAPTIVE:"+c.id,
      name:c.name,
      type:"ADAPTIVE",
      config:c
    });
  }

  for(const c of state.createdStrategies) {
    defs.push({
      id:"CREATED:"+c.id,
      name:c.name,
      type:"CREATED",
      config:c.config
    });
  }

  return defs;
}

function recentMotorRate(key,window=12) {
  const rows=state.ledger.filter(
    r=>r.virtual?.some(v=>v.key===key)
  ).slice(-window);

  if(!rows.length) return null;

  return rows.filter(r=>
    r.virtual.find(
      v=>v.key===key
    )?.numbers.includes(r.number)
  ).length/rows.length;
}

function chooseMotor(def,cs,previous) {
  if(!cs.length) return null;

  const fixed=cs[
    clamp(state.rank-1,0,cs.length-1)
  ];

  if(def.type==="RANK") {
    return cs[
      clamp(def.rank-1,0,cs.length-1)
    ];
  }

  if(def.type==="ADAPTIVE"||
     def.type==="CREATED") {

    const cfg=def.config||ADAPTATIVES[4];

    const ranked=cs.filter(
      c=>c.rank<=cfg.maxRank
    ).map(c=>({
      c,
      score:
        (recentMotorRate(c.key,3)??.5)*.55+
        (recentMotorRate(c.key,cfg.window)??.5)*.45
    })).sort(
      (a,b)=>b.score-a.score||a.c.rank-b.c.rank
    );

    const best=ranked[0];
    const old=ranked.find(
      x=>x.c.key===previous
    );

    if(old&&best&&
       best.score<old.score+cfg.margin) {
      return old.c;
    }

    return best?.c||fixed;
  }

  if(def.rule==="GEO") return cs[0];

  if(def.rule==="BEST") {
    return [...cs].sort(
      (a,b)=>
        (recentMotorRate(b.key,20)??-.1)-
        (recentMotorRate(a.key,20)??-.1)||
        a.rank-b.rank
    )[0];
  }

  if(def.rule==="STABLE") {
    const old=cs.find(
      c=>c.key===previous
    );

    return old&&old.rank<=5?old:fixed;
  }

  if(def.rule==="SWITCH") {
    const old=cs.find(
      c=>c.key===previous
    )||fixed;

    const best=[...cs].sort(
      (a,b)=>
        (recentMotorRate(b.key,12)??-.1)-
        (recentMotorRate(a.key,12)??-.1)
    )[0];

    return (
      (recentMotorRate(best.key,12)??0)>
      (recentMotorRate(old.key,12)??0)+.12
    )?best:old;
  }

  if(def.rule==="CONSENSUS"||
     def.rule==="UNION") {

    const weights=Array(37).fill(0);

    const selected=def.rule==="UNION"
      ?cs.slice(0,3):cs;

    for(const c of selected) {
      for(const n of c.play.numbers) {
        weights[idx(n)]+=
          def.rule==="UNION"
            ?1:1/(1+c.rank*.1);
      }
    }

    const play=geometry(weights);

    if(play) {
      return {
        key:def.rule,
        rank:0,
        score:play.score,
        play
      };
    }
  }

  return fixed;
}

const snap=m=>m?{
  key:m.key,
  rank:m.rank,
  score:m.score,
  play:clone(m.play)
}:null;

/* DEFESA G1 */

function tuneG1(original,trigger) {
  if(!original?.play) return null;

  const mandatory=neighbors(trigger,1);
  const weights=Array(37).fill(.01);

  for(const n of original.play.numbers) {
    weights[idx(n)]+=100;
  }

  for(const n of mandatory) {
    weights[idx(n)]+=100000;
  }

  const play=geometry(weights,mandatory);

  return play?{
    ...clone(original),
    play,
    g1:true,
    trigger
  }:clone(original);
}

function validPlay(play) {
  return !!play&&
    Array.isArray(play.numbers)&&
    play.numbers.length===28&&
    new Set(play.numbers).size===28;
}

function g1Options(original,trigger,post) {
  if(!validPlay(original?.play)) return [];

  const options=[{
    id:"CONGELADO",
    mode:"CONGELADO",
    key:original.key,
    rank:original.rank||0,
    motor:snap(original)
  }];

  const fine=tuneG1(original,trigger);

  if(validPlay(fine?.play)) {
    options.push({
      id:"AJUSTE FINO",
      mode:"AJUSTE FINO",
      key:original.key,
      rank:original.rank||0,
      motor:snap(fine)
    });
  }

  for(const c of post) {
    if(!validPlay(c.play)) continue;

    options.push({
      id:"RECONSTRUÇÃO:"+c.key,
      mode:"RECONSTRUÇÃO",
      key:c.key,
      rank:c.rank,
      motor:snap(c)
    });
  }

  return options;
}

const statKey=(strategy,option)=>
  strategy+"|"+option;

function emptyStat() {
  return {
    total:0,
    hits:0,
    recent:[],
    lossStreak:0,
    lastTurn:0
  };
}

function updateStat(map,key,hit,turn) {
  const s=map[key]||emptyStat();

  s.total++;
  s.hits+=hit?1:0;
  s.recent.push(hit?1:0);

  if(s.recent.length>50) s.recent.shift();

  s.lossStreak=hit?0:s.lossStreak+1;
  s.lastTurn=turn;

  map[key]=s;
}

/*
PREVISÃO ANTES DO RESULTADO.
AVALIAÇÃO SOMENTE NO GIRO SEGUINTE.
*/

function settleG1(number) {
  if(!state.g1Pending.length) return;

  const turn=state.history.length+1;

  for(const p of state.g1Pending) {
    const hit=p.numbers.includes(number);

    updateStat(
      state.g1Stats,
      statKey(p.strategyId,p.optionId),
      hit,
      turn
    );

    for(const n of p.excluded) {
      updateStat(
        state.g1Exclusion,
        statKey(p.strategyId,"EXCLUDED:"+n),
        n===number,
        turn
      );
    }

    state.g1Events++;
  }

  state.g1Pending=[];
}

function virtualG1Candidates(number,cs) {
  const misses=[];

  for(const def of definitions()) {
    const v=virtualCycle(def.id);

    const entry=snap(
      chooseMotor(def,cs,v.previous)
    );

    if(entry&&
       !entry.play.numbers.includes(number)) {
      misses.push({
        strategyId:def.id,
        motor:entry
      });
    }
  }

  return misses;
}

function prepareG1(number,misses,post) {
  const pending=[];

  for(const miss of misses) {
    const options=g1Options(
      miss.motor,
      number,
      post
    );

    for(const option of options) {
      const covered=new Set(
        option.motor.play.numbers
      );

      pending.push({
        strategyId:miss.strategyId,
        optionId:option.id,
        mode:option.mode,
        key:option.key,
        numbers:[...covered],
        excluded:W.filter(
          n=>!covered.has(n)
        )
      });
    }
  }

  state.g1Pending=pending;
}

/* AVALIAÇÃO ESTATÍSTICA */

function evidence(strategy,option) {
  const s=state.g1Stats[
    statKey(strategy,option.id)
  ]||emptyStat();

  const base=28/37;
  const recent=s.recent||[];

  function smooth(window,prior) {
    const a=recent.slice(-window);

    return (
      a.reduce((x,y)=>x+y,0)+base*prior
    )/(a.length+prior);
  }

  const s3=smooth(3,6);
  const s12=smooth(12,10);
  const s30=smooth(30,15);

  const long=(
    s.hits+base*20
  )/(s.total+20);

  const score=
    s3*.12+
    s12*.33+
    s30*.35+
    long*.20-
    Math.min(s.lossStreak,5)*.006;

  return {
    sample:s.total,
    hits:s.hits,
    score,
    rate:s.total?s.hits/s.total:base
  };
}

function exclusionEvidence(strategy,option) {
  let penalty=0;

  for(const n of W) {
    if(option.motor.play.numbers.includes(n)) {
      continue;
    }

    const s=state.g1Exclusion[
      statKey(strategy,"EXCLUDED:"+n)
    ];

    if(!s||s.total<12) continue;

    const recent=s.recent||[];
    const misses=recent.reduce(
      (a,b)=>a+b,0
    );

    penalty+=Math.max(
      0,
      (misses+1)/(recent.length+37)-1/37
    );
  }

  return penalty/9;
}

function chooseBestG1(original,trigger,post,strategy) {
  const options=g1Options(
    original,trigger,post
  );

  if(!options.length) return null;

  const ranked=options.map(option=>{
    const e=evidence(strategy,option);

    const excluded=exclusionEvidence(
      strategy,option
    );

    const retained=option.motor.play.numbers.filter(
      n=>original.play.numbers.includes(n)
    ).length;

    return {
      ...option,
      e,
      excluded,
      retained,
      score:e.score-excluded*.025
    };
  }).sort(
    (a,b)=>
      b.score-a.score||
      b.e.sample-a.e.sample||
      b.retained-a.retained
  );

  const frozen=ranked.find(
    x=>x.mode==="CONGELADO"
  );

  let chosen=ranked[0];

  /*
  NÃO SUBSTITUI A DEFESA CONGELADA
  SEM AMOSTRA E VANTAGEM MÍNIMAS.
  */

  if(frozen&&chosen!==frozen) {
    if(
      chosen.e.sample<12||
      chosen.score-frozen.score<.012
    ) {
      chosen=frozen;
    }
  }

  return {
    mode:chosen.mode,
    key:chosen.key,
    rank:chosen.rank,
    motor:clone(chosen.motor),
    score:chosen.score,
    sample:chosen.e.sample,
    strategyId:strategy,
    trigger,
    alternatives:ranked.map(x=>({
      mode:x.mode,
      key:x.key,
      score:x.score,
      sample:x.e.sample,
      hits:x.e.hits
    }))
  };
}

function chooseG1(original,trigger,post) {
  const strategy=
    state.cycle?.strategyId||
    activeDefinition().id;

  if(!state.g1Trainer) {
    const motor=state.g1
      ?tuneG1(original,trigger)
      :clone(original);

    state.g1Decision={
      mode:state.g1?"AJUSTE FINO":"CONGELADO",
      key:motor?.key||"—",
      strategyId:strategy,
      trigger,
      trainer:false
    };

    return motor;
  }

  const decision=chooseBestG1(
    original,trigger,post,strategy
  );

  if(!decision) {
    state.g1Decision={
      mode:"CONGELADO",
      key:original.key,
      strategyId:strategy,
      trigger,
      trainer:true
    };

    return clone(original);
  }

  state.g1Decision={
    mode:decision.mode,
    key:decision.key,
    rank:decision.rank,
    score:decision.score,
    sample:decision.sample,
    strategyId:strategy,
    trigger,
    trainer:true,
    alternatives:decision.alternatives
  };

  state.g1Decisions.push({
    turn:state.history.length+1,
    ...clone(state.g1Decision)
  });

  return clone(decision.motor);
}

/* SIMULAÇÃO VIRTUAL */

function profit(result) {
  const unit=Number(state.stake)||1;
  const g=Number(state.galeMultiplier)||1;

  if(result==="GREEN") return 8*unit;

  if(result==="GREEN G1") {
    return (8*g-28)*unit;
  }

  if(result==="LOSS") {
    return -28*(1+g)*unit;
  }

  return 0;
}

function virtualCycle(id) {
  if(!state.virtualCycles[id]) {
    state.virtualCycles[id]={
      phase:"ENTRY",
      frozen:null,
      previous:null
    };
  }

  return state.virtualCycles[id];
}

function processVirtual(number,cs) {
  for(const def of definitions()) {
    const v=virtualCycle(def.id);

    let motor=null;
    let result="AGUARDANDO";
    let closed=false;

    if(v.phase==="ENTRY") {
      motor=snap(
        chooseMotor(def,cs,v.previous)
      );

      if(!motor) continue;

      v.previous=motor.key;

      if(motor.play.numbers.includes(number)) {
        result="GREEN";
        closed=true;
      } else {
        result="GALE";

        v.frozen=state.g1
          ?tuneG1(motor,number)
          :clone(motor);

        v.phase="GALE";
      }
    } else {
      motor=clone(v.frozen);

      result=motor?.play.numbers.includes(number)
        ?"GREEN G1":"LOSS";

      closed=true;
      v.phase="ENTRY";
      v.frozen=null;
    }

    state.virtualRows.push({
      turn:state.history.length+1,
      strategy:def.id,
      number,
      motor:motor?.key||"—",
      result,
      closed,
      profit:profit(result)
    });
  }
}

function virtualMetrics(id,window) {
  const rows=state.virtualRows.filter(
    r=>r.strategy===id&&r.closed
  ).slice(-window);

  let green=0;
  let g1=0;
  let loss=0;
  let streak=0;
  let maxLoss=0;
  let net=0;

  for(const r of rows) {
    net+=r.profit;

    if(r.result==="GREEN") {
      green++;
      streak=0;
    } else if(r.result==="GREEN G1") {
      g1++;
      streak=0;
    } else if(r.result==="LOSS") {
      loss++;
      streak++;
      maxLoss=Math.max(maxLoss,streak);
    }
  }

  return {
    total:rows.length,
    green,
    g1,
    loss,
    hits:green+g1,
    net,
    maxLoss,
    rate:rows.length
      ?(green+g1)/rows.length:null,
    average:rows.length?net/rows.length:0
  };
}

function stability(id) {
  const m3=virtualMetrics(id,3);
  const m12=virtualMetrics(id,12);
  const m30=virtualMetrics(id,30);

  const base=28/37;

  const smooth=m=>(
    m.hits+8*base
  )/(m.total+8);

  const a=smooth(m3);
  const b=smooth(m12);
  const c=smooth(m30);

  const consistency=1-clamp(
    (Math.abs(a-b)+Math.abs(b-c))/2,
    0,1
  );

  const finance=clamp(
    (m12.average+56)/112,
    0,1
  );

  const score=clamp(
    a*.25+
    b*.30+
    c*.20+
    consistency*.15+
    finance*.10-
    Math.min(m30.maxLoss,6)*.015,
    0,1
  );

  return {m3,m12,m30,score};
}

/* TREINADOR GLOBAL */

let rankingCacheKey="";
let rankingCache=null;

function trainerRanking(cs=getCandidates()) {
  const key=
    state.history.length+":"+
    state.virtualRows.length+":"+
    state.createdStrategies.length;

  if(key===rankingCacheKey&&rankingCache) {
    return rankingCache;
  }

  const rows=definitions().map(def=>{
    const s=stability(def.id);
    const v=virtualCycle(def.id);

    const motor=chooseMotor(
      def,cs,v.previous
    );

    const score=
      s.score*.70+
      clamp((s.m12.average+56)/112,0,1)*.20+
      (s.m3.rate??28/37)*.10;

    return {
      ...def,
      motor,
      stability:s,
      score
    };
  }).sort(
    (a,b)=>
      b.score-a.score||
      a.id.localeCompare(b.id)
  );

  const qualified=rows.filter(
    r=>r.stability.m30.total>=12
  );

  const bad=qualified.filter(
    r=>
      r.stability.m12.net<0&&
      r.stability.m12.loss>=2
  );

  rankingCacheKey=key;

  rankingCache={
    rows,
    best:rows[0]||null,
    protection:
      qualified.length>=5&&
      bad.length/qualified.length>=.7
  };

  return rankingCache;
}

function trainerUpdate(cs=getCandidates()) {
  if(
    state.strategy!=="TRAINER"||
    state.manual||
    state.phase!=="ENTRY"||
    !cs.length
  ) return;

  const ranking=trainerRanking(cs);
  state.protection=ranking.protection;

  const previous=state.trainerChoice;
  const turns=state.trainerTurns;

  const current=ranking.rows.find(
    r=>r.id===previous
  );

  const best=ranking.best;

  if(!best) return;

  let change=!previous;
  let reason="INICIAL";

  if(previous) {
    if(turns>=3||state.trainerPending) {
      change=true;
      reason="LIMITE DE 3 GIROS";
    } else if(
      turns>=1&&
      best.id!==previous&&
      best.score>(current?.score??0)+.035
    ) {
      change=true;
      reason="DESEMPENHO RECENTE";
    }
  }

  if(!change) return;

  const chosen=(
    previous
      ?ranking.rows.filter(r=>r.id!==previous)
      :ranking.rows
  )[0]||best;

  if(previous&&chosen.id!==previous) {
    state.trainerChanges++;
  }

  state.trainerChoice=chosen.id;
  state.trainerMotor=chosen.motor?.key||null;
  state.trainerTurns=0;
  state.trainerPending=false;

  state.trainerHistory.push({
    turn:state.history.length,
    from:previous,
    to:chosen.id,
    motor:chosen.motor?.key||null,
    reason,
    score:chosen.score
  });
}

function activeDefinition() {
  const defs=definitions();

  if(state.strategy==="TRAINER") {
    return defs.find(
      d=>d.id===state.trainerChoice
    )||defs[0];
  }

  if(state.strategy==="ADAPTIVE") {
    return defs.find(
      d=>d.id==="ADAPTIVE:"+state.activeAdaptive
    )||defs[0];
  }

  if(state.strategy==="CREATED") {
    return defs.find(
      d=>d.id==="CREATED:"+state.activeCreated
    )||defs[0];
  }

  return defs.find(
    d=>d.id==="ORIGINAL:"+state.strategy
  )||defs[0];
}

function activeMotor(cs) {
  if(state.manual) {
    return cs.find(
      c=>c.key===state.manual
    )||cs[0]||null;
  }

  const def=activeDefinition();

  if(state.strategy==="TRAINER") {
    return trainerRanking(cs).rows.find(
      r=>r.id===state.trainerChoice
    )?.motor||cs[0]||null;
  }

  return chooseMotor(
    def,cs,state.previousMotor
  );
}

/* PROCESSAMENTO REAL */

function recordSpin(
  number,
  source="TEMPO REAL",
  persist=true
) {
  if(
    !Number.isInteger(number)||
    number<0||
    number>36
  ) return;

  const cs=getCandidates();

  const virtual=cs.map(c=>({
    key:c.key,
    rank:c.rank,
    numbers:[...c.play.numbers]
  }));

  // Primeiro resolve previsões anteriores.
  settleG1(number);

  if(
    state.strategy==="TRAINER"&&
    state.phase==="ENTRY"
  ) {
    trainerUpdate(cs);
  }

  const def=activeDefinition();

  let motor=null;
  let result="AGUARDANDO";

  const before=state.phase;
  const cycleBefore=clone(state.cycle);
  const decisionBefore=clone(state.g1Decision);

  if(state.phase==="ENTRY") {
    motor=snap(activeMotor(cs));

    if(motor) {
      state.previousMotor=motor.key;

      state.cycle={
        strategy:def.name,
        strategyId:def.id,
        motor:motor.key,
        original:clone(motor),
        firstNumber:null,
        options:{
          g1:state.g1,
          galeSkip:state.galeSkip,
          secondHouse:state.secondHouse
        }
      };

      state.g1Decision=null;

      if(state.secondHouse) {
        state.frozen=clone(motor);
        state.phase="SECOND_SKIP";
        result="2ª CASA";
      } else if(
        motor.play.numbers.includes(number)
      ) {
        result="GREEN";
        state.phase="ENTRY";
        state.cycle=null;
        state.frozen=null;
      } else {
        result="GALE";
        state.cycle.firstNumber=number;

        const post=candidates([
          ...state.history.slice(-199),
          number
        ]);

        state.frozen=chooseG1(
          motor,number,post
        );

        state.phase=state.galeSkip
          ?"GALE_SKIP":"GALE";
      }
    }
  } else if(state.phase==="SECOND_SKIP") {
    motor=clone(state.frozen);
    result="CASA PULADA";
    state.phase="SECOND_ENTRY";
  } else if(state.phase==="SECOND_ENTRY") {
    motor=clone(state.frozen);

    if(motor?.play.numbers.includes(number)) {
      result="GREEN";
      state.phase="ENTRY";
      state.cycle=null;
      state.frozen=null;
    } else {
      result="GALE";
      state.cycle.firstNumber=number;

      const post=candidates([
        ...state.history.slice(-199),
        number
      ]);

      state.frozen=chooseG1(
        motor,number,post
      );

      state.phase=state.cycle.options.galeSkip
        ?"GALE_SKIP":"GALE";
    }
  } else if(state.phase==="GALE_SKIP") {
    motor=clone(state.frozen);
    result="GALE PULADO";
    state.phase="GALE";
  } else if(state.phase==="GALE") {
    // A defesa escolhida permanece congelada.
    motor=clone(state.frozen);

    result=motor?.play.numbers.includes(number)
      ?"GREEN G1":"LOSS";

    state.g1History.push({
      turn:state.history.length+1,
      strategyId:state.cycle?.strategyId||"",
      mode:state.g1Decision?.mode||"—",
      motor:state.g1Decision?.key||"—",
      trigger:state.cycle?.firstNumber,
      outcome:number,
      result
    });

    state.phase="ENTRY";
    state.cycle=null;
    state.frozen=null;
    state.g1Decision=null;
  }

  // Treinamento independente da fase real.
  const misses=virtualG1Candidates(
    number,cs
  );

  processVirtual(number,cs);

  if(misses.length) {
    prepareG1(
      number,
      misses,
      candidates([
        ...state.history.slice(-199),
        number
      ])
    );
  } else {
    state.g1Pending=[];
  }

  state.history.push(number);
  state.sources.push(source);

  state.ledger.push({
    turn:state.history.length,
    number,
    source,
    strategy:cycleBefore?.strategy||def.name,
    strategyId:cycleBefore?.strategyId||def.id,
    motor:motor?.key||"—",
    phase:before,
    result,
    profit:profit(result),
    play:motor?clone(motor.play):null,
    virtual,
    cycle:cycleBefore,
    g1Decision:decisionBefore,
    timestamp:Date.now()
  });

  invalidate();
  rankingCacheKey="";

  if(
    state.strategy==="TRAINER"&&
    !state.manual
  ) {
    state.trainerTurns++;

    if(state.phase==="ENTRY") {
      trainerUpdate(getCandidates());
    } else if(state.trainerTurns>=3) {
      state.trainerPending=true;
    }
  }

  if(persist) save();
}

/* IMPORTAÇÃO E RECONSTRUÇÃO */

let importing=false;

async function rebuild(numbers,sources=null) {
  if(importing) return;

  importing=true;

  const keys=[
    "strategy","rank","manual",
    "activeAdaptive","activeCreated",
    "createdStrategies","g1","g1Trainer",
    "galeSkip","secondHouse",
    "stake","galeMultiplier","open"
  ];

  const options={};

  for(const key of keys) {
    options[key]=clone(state[key]);
  }

  state={
    ...fresh(),
    ...options
  };

  invalidate();
  rankingCacheKey="";

  const start=Math.max(
    0,numbers.length-180
  );

  state.history=numbers.slice(0,start);
  state.sources=(sources||[]).slice(0,start);

  while(state.sources.length<start) {
    state.sources.push("HISTÓRICO");
  }

  try {
    for(let i=start;i<numbers.length;i++) {
      recordSpin(
        numbers[i],
        sources?.[i]||"HISTÓRICO",
        false
      );

      if((i-start)%3===2) {
        if($("status")) {
          $("status").textContent=
            "PROCESSANDO "+
            (i+1)+"/"+numbers.length;
        }

        await new Promise(
          resolve=>setTimeout(resolve,0)
        );
      }
    }
  } finally {
    importing=false;
  }

  save();
  render();
}

async function undo() {
  if(!state.history.length) return;

  await rebuild(
    state.history.slice(0,-1),
    state.sources.slice(0,-1)
  );
}

/* INTERFACE */

const css=`
*{box-sizing:border-box}
body{
  margin:0;
  background:#10151e;
  color:#f3f7fb;
  font-family:Arial,sans-serif
}
.app{
  max-width:1100px;
  margin:auto;
  padding:12px
}
h1{
  text-align:center;
  font-size:23px;
  margin:16px 0 5px
}
.sub{
  text-align:center;
  font-size:11px;
  color:#9cb3c9;
  margin-bottom:18px
}
.panel{
  background:#1c2634;
  border:1px solid #40546c;
  border-radius:11px;
  padding:12px;
  margin:10px 0
}
.title{
  color:#32d9f4;
  font-size:12px;
  font-weight:bold;
  margin:12px 0
}
.row{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  margin:8px 0
}
.btn{
  background:#304056;
  border:1px solid #69819d;
  border-radius:7px;
  padding:10px;
  color:white;
  font-weight:bold;
  font-size:11px;
  cursor:pointer
}
.btn.active{
  background:#087f9d;
  border-color:#32d9f4
}
.btn.trainer{
  background:#0a6653;
  border:2px solid #2c9f81
}
.btn.trainer.active{
  background:#075f4e;
  border:2px solid #69ffd0;
  box-shadow:0 0 12px #17f0ad
}
textarea{
  width:100%;
  height:85px;
  padding:10px;
  border-radius:8px;
  background:#0c1623;
  border:1px solid #62758b;
  color:white
}
.centers{
  display:grid;
  grid-template-columns:repeat(6,minmax(0,1fr));
  gap:5px;
  margin:12px 0
}
.center{
  min-width:0;
  min-height:88px;
  padding:9px 2px 7px;
  border:2px solid #20d7f4;
  background:#096a92;
  border-radius:9px;
  text-align:center;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:5px
}
.center.short{
  background:#caa127;
  border-color:#ffe282;
  color:#111
}
.centerNumber{
  display:block;
  width:100%;
  font-size:clamp(28px,5vw,44px);
  font-weight:900;
  line-height:1;
  letter-spacing:-1px;
  color:#fff;
  text-align:center;
  font-variant-numeric:tabular-nums
}
.center.short .centerNumber{
  color:#111
}
.centerInfo{
  display:block;
  width:100%;
  font-size:9px;
  line-height:1.25;
  font-weight:bold;
  color:#e4f6ff;
  text-align:center;
  overflow-wrap:anywhere
}
.center.short .centerInfo{
  color:#111
}
.keys{
  display:grid;
  grid-template-columns:repeat(6,1fr);
  gap:5px
}
.key{
  height:43px;
  border:1px solid #697b8f;
  border-radius:7px;
  color:white;
  font-size:15px;
  font-weight:bold;
  cursor:pointer
}
.key.zero{grid-column:span 6}
.metrics{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:6px
}
.metric{
  background:#29384b;
  padding:12px 5px;
  border-radius:8px;
  text-align:center
}
.metric small{
  display:block;
  font-size:9px;
  color:#b9cad9
}
.metric b{
  display:block;
  font-size:23px;
  margin-top:6px
}
.good{color:#4ee2a2}
.bad{color:#ff778c}
.muted{
  font-size:11px;
  color:#afc0d1;
  line-height:1.7
}
.box{
  background:#111d2a;
  border:1px solid #425a75;
  padding:12px;
  border-radius:9px;
  margin:9px 0;
  font-size:12px;
  line-height:1.7
}
.head{
  display:flex;
  justify-content:space-between;
  width:100%;
  background:#2c3d51;
  color:white;
  border:1px solid #5e7895;
  border-radius:8px;
  padding:12px;
  font-weight:bold;
  cursor:pointer
}
.hide{display:none}
.history{
  display:flex;
  flex-wrap:wrap;
  gap:5px
}
.chip{
  padding:8px;
  border:2px solid #718397;
  border-radius:7px;
  min-width:47px;
  text-align:center
}
.chip.green{border:3px solid #24f49a}
.chip.gale{border:3px solid #ffda35}
.chip.loss{border:3px solid #ff386c}
.chip b{
  display:block;
  font-size:18px
}
.chip small{font-size:9px}
.listrow{
  border-bottom:1px solid #35475b;
  padding:9px 3px;
  font-size:11px;
  line-height:1.7
}
.tablewrap{overflow:auto}
table{
  width:100%;
  border-collapse:collapse;
  min-width:620px;
  font-size:11px
}
td,th{
  padding:9px;
  border-bottom:1px solid #40516a;
  text-align:left
}
th{color:#50d9ee}
.virtualButton{
  width:100%;
  background:#0b8466;
  border:1px solid #52e6b5;
  color:white;
  border-radius:9px;
  padding:14px;
  font-size:13px;
  font-weight:bold;
  cursor:pointer;
  margin:8px 0
}
.strategyGroup{
  margin-top:12px;
  padding-top:8px;
  border-top:1px solid #34485e
}
.strategyLabel{
  font-size:10px;
  color:#7fe1f3;
  font-weight:bold;
  margin:8px 0
}
.status{
  padding:8px;
  font-size:11px;
  color:#81dceb
}
.numberCloud{
  display:flex;
  flex-wrap:wrap;
  gap:5px;
  margin:10px 0
}
.numberCloud span{
  padding:8px;
  background:#273b50;
  border:1px solid #60829f;
  border-radius:6px;
  font-size:12px;
  font-weight:bold
}
.warning{
  border-left:3px solid #d9a63c;
  padding:9px;
  background:#2b281f;
  color:#e8d5a6;
  font-size:11px;
  line-height:1.6
}
.danger{
  border:2px solid #ff5679;
  background:#38212a
}
input[type=number]{
  background:#0c1623;
  color:white;
  border:1px solid #62758b;
  border-radius:7px;
  padding:9px;
  width:110px
}
@media(max-width:600px){
  .center{
    min-height:80px;
    padding:8px 1px 6px;
    gap:5px
  }
  .centerNumber{
    font-size:clamp(26px,7vw,37px)
  }
  .centerInfo{
    font-size:8px;
    line-height:1.15
  }
  .btn{
    font-size:10px;
    padding:9px
  }
}
@media(max-width:380px){
  .centerNumber{font-size:28px}
  .centerInfo{font-size:7px}
}
`;

document.body.innerHTML=`
<style>${css}</style>
<main class="app">
  <h1>ANÁLISE BETA V${VERSION}</h1>

  <div class="sub">
    12 MOTORES • TREINADOR GLOBAL •
    DEFESA G1 VIRTUAL CONTÍNUA • 28 NÚMEROS
  </div>

  <section class="panel">
    <div class="title">IMPORTAR HISTÓRICO</div>
    <textarea id="paste"
      placeholder="Cole os números do mais antigo ao mais recente"></textarea>

    <div class="row">
      <button class="btn" id="import">IMPORTAR</button>
      <button class="btn" id="restore">RECUPERAR ANTERIOR</button>
      <button class="btn" id="undo">APAGAR ÚLTIMO</button>
      <button class="btn" id="clear">ZERAR</button>
    </div>

    <div class="status" id="status"></div>
  </section>

  <section class="panel">
    <div class="title">ESTRATÉGIA ATIVA</div>
    <div id="strategies"></div>
    <div class="row" id="options"></div>
    <div class="muted" id="selected"></div>
    <div class="centers" id="centers"></div>
    <div class="muted" id="coverage"></div>
  </section>

  <section class="panel">
    <div class="title">TECLADO 0–36</div>
    <div class="keys" id="keys"></div>
  </section>

  <section class="panel">
    <div class="title">ÚLTIMOS 14 RESULTADOS</div>
    <div class="history" id="last"></div>
  </section>

  ${[
    ["general","RESULTADO GERAL"],
    ["trainer","TREINADOR GLOBAL"],
    ["lab","LABORATÓRIO"],
    ["motors","12 MOTORES"],
    ["jumps","SALTOS E DIREÇÃO"],
    ["mirrors","ESPELHO / ANTIESPELHO"],
    ["timeline","LINHA DO TEMPO"]
  ].map(([id,title])=>`
    <section class="panel">
      <button class="head" data-panel="${id}">
        ${title}<span>−</span>
      </button>
      <div id="${id}"></div>
    </section>
  `).join("")}

  <section class="panel">
    <div class="title">FICHAS</div>
    <div class="row">
      <label>
        VALOR DA FICHA
        <input id="stake" type="number"
          min=".01" step=".01">
      </label>
      <label>
        MULTIPLICADOR G1
        <input id="multiplier" type="number"
          min=".01" step=".01">
      </label>
    </div>
  </section>

  <div class="warning">
    As defesas são avaliadas com previsões
    anteriores aos resultados. A cobertura
    de 28 dos 37 números não garante
    acerto ou lucro.
  </div>
</main>
`;

/* COMPONENTES */

function button(label,fn,parent,extra="") {
  const b=document.createElement("button");
  b.className="btn "+extra;
  b.textContent=label;
  b.onclick=fn;
  parent.appendChild(b);
  return b;
}

function changeStrategy(
  rule,
  adaptive=null,
  created=null
) {
  state.strategy=rule;
  state.activeAdaptive=adaptive;
  state.activeCreated=created;
  state.manual=null;

  if(rule==="TRAINER") {
    state.trainerChoice=null;
    state.trainerMotor=null;
    state.trainerTurns=0;
    state.trainerPending=false;
    trainerUpdate();
  }

  save();
  render();
}

function buildStrategies() {
  const root=$("strategies");
  root.innerHTML="";

  const groups=[
    [
      "TREINADOR",
      [[
        "TREINADOR GLOBAL",
        ()=>changeStrategy("TRAINER"),
        "TRAINER"
      ]]
    ],
    [
      "ORIGINAIS",
      ORIGINALS.map(([key,name])=>[
        name,
        ()=>changeStrategy(key),
        key
      ])
    ],
    [
      "12 ADAPTATIVAS",
      ADAPTATIVES.map(c=>[
        c.name,
        ()=>changeStrategy("ADAPTIVE",c.id),
        c.id
      ])
    ]
  ];

  for(const [label,items] of groups) {
    const group=document.createElement("div");
    group.className="strategyGroup";
    group.innerHTML=
      `<div class="strategyLabel">${label}</div>`;

    const row=document.createElement("div");
    row.className="row";

    for(const [name,fn,key] of items) {
      const b=button(
        name,fn,row,
        key==="TRAINER"?"trainer":""
      );

      b.dataset.choice=key;
    }

    group.appendChild(row);
    root.appendChild(group);
  }

  const ranks=document.createElement("div");
  ranks.className="row";

  for(let i=1;i<=4;i++) {
    const b=button(
      "AUTO "+i+"º",
      ()=>{
        state.rank=i;
        changeStrategy("FIXED");
      },
      ranks
    );

    b.dataset.rank=i;
  }

  root.appendChild(ranks);

  if(state.createdStrategies.length) {
    const group=document.createElement("div");
    group.className="strategyGroup";
    group.innerHTML=
      `<div class="strategyLabel">PERSONALIZADAS</div>`;

    const row=document.createElement("div");
    row.className="row";

    for(const c of state.createdStrategies) {
      const b=button(
        c.name,
        ()=>changeStrategy("CREATED",null,c.id),
        row
      );

      b.dataset.created=c.id;
    }

    group.appendChild(row);
    root.appendChild(group);
  }
}

buildStrategies();

for(const [field,label] of [
  ["g1","G1 AJUSTE FINO"],
  ["g1Trainer","TREINADOR GLOBAL G1"],
  ["galeSkip","GALE 2ª RODADA"],
  ["secondHouse","2ª CASA"]
]) {
  const b=button(
    label,
    ()=>{
      state[field]=!state[field];
      save();
      render();
    },
    $("options"),
    field==="g1Trainer"?"trainer":""
  );

  b.dataset.option=field;
}

$("stake").value=state.stake;
$("multiplier").value=state.galeMultiplier;

$("stake").onchange=()=>{
  state.stake=Math.max(
    .01,
    Number($("stake").value)||1
  );
  save();
  render();
};

$("multiplier").onchange=()=>{
  state.galeMultiplier=Math.max(
    .01,
    Number($("multiplier").value)||1
  );
  save();
  render();
};

for(let n=0;n<=36;n++) {
  const b=document.createElement("button");
  b.className="key"+(n===0?" zero":"");
  b.textContent=n;

  b.style.background=
    n===0?"#087b50":
    RED.has(n)?"#ac293f":"#12151b";

  b.onclick=()=>{
    if(importing) return;

    try {
      recordSpin(n);
      render();
    } catch(e) {
      showError(e);
    }
  };

  $("keys").appendChild(b);
}

$("import").onclick=()=>{
  if(importing) return;

  const numbers=(
    $("paste").value.match(/\d+/g)||[]
  ).map(Number).filter(
    n=>Number.isInteger(n)&&n>=0&&n<=36
  );

  if(!numbers.length) {
    alert("COLE NÚMEROS DE 0 A 36.");
    return;
  }

  if(!confirm(
    "IMPORTAR "+numbers.length+
    " NÚMEROS E SUBSTITUIR O HISTÓRICO ATUAL?"
  )) return;

  $("paste").value="";
  rebuild(numbers);
};

$("restore").onclick=()=>{
  if(importing) return;

  let old=null;

  for(const key of OLD_KEYS) {
    const data=read(key);

    if(data?.history?.length) {
      old=data;
      break;
    }
  }

  if(!old) {
    alert("NENHUM HISTÓRICO ANTERIOR ENCONTRADO.");
    return;
  }

  if(confirm(
    "RECUPERAR "+old.history.length+" NÚMEROS?"
  )) {
    rebuild(old.history);
  }
};

$("undo").onclick=()=>{
  if(!importing) undo();
};

$("clear").onclick=()=>{
  if(importing||
     !confirm("APAGAR O HISTÓRICO ATUAL?")) {
    return;
  }

  state=fresh();
  invalidate();
  rankingCacheKey="";
  buildStrategies();
  save();
  render();
};

document.addEventListener("click",event=>{
  const b=event.target.closest("[data-panel]");

  if(!b) return;

  const id=b.dataset.panel;
  state.open[id]=!state.open[id];

  save();
  render();
});

/* RENDERIZAÇÃO */

function showError(e) {
  if($("status")) {
    $("status").textContent=
      "ERRO: "+String(e?.message||e);
  }

  console.error("ANÁLISE BETA",e);
}

function sortedBlocks(play) {
  if(!play) return [];

  return [...play.blocks].sort(
    (a,b)=>
      Object.keys(REGIONS).indexOf(region(a.center))-
      Object.keys(REGIONS).indexOf(region(b.center))
  );
}

function centersHTML(play) {
  return sortedBlocks(play).map(b=>`
    <div class="center ${b.radius===1?"short":""}">
      <strong class="centerNumber">${b.center}</strong>
      <small class="centerInfo">
        ${region(b.center)}
      </small>
      <small class="centerInfo">
        ${b.radius}
        ${b.radius===1?"VIZINHO":"VIZINHOS"}
      </small>
    </div>
  `).join("");
}

function metrics(rows) {
  const closed=rows.filter(
    r=>["GREEN","GREEN G1","LOSS"].includes(r.result)
  );

  const green=closed.filter(
    r=>r.result==="GREEN"
  ).length;

  const g1=closed.filter(
    r=>r.result==="GREEN G1"
  ).length;

  const loss=closed.filter(
    r=>r.result==="LOSS"
  ).length;

  const net=closed.reduce(
    (s,r)=>s+(r.profit||0),0
  );

  return {closed,green,g1,loss,net};
}

function metricsHTML(rows) {
  const m=metrics(rows);

  const items=[
    ["CICLOS",m.closed.length],
    ["GREEN",m.green],
    ["GREEN G1",m.g1],
    ["LOSS",m.loss],
    ["ACERTOS",pct(m.green+m.g1,m.closed.length)],
    ["LÍQUIDO",fmt(m.net)]
  ];

  return `
    <div class="metrics">
      ${items.map(([label,value])=>`
        <div class="metric">
          <small>${label}</small>
          <b>${value}</b>
        </div>
      `).join("")}
    </div>
  `;
}

function trainerHTML() {
  const ranking=trainerRanking();

  const active=ranking.rows.find(
    r=>r.id===state.trainerChoice
  );

  const real=state.g1History.length;

  const hits=state.g1History.filter(
    x=>x.result==="GREEN G1"
  ).length;

  const current=
    state.cycle?.strategyId||
    activeDefinition().id;

  const stats=Object.entries(state.g1Stats)
    .filter(([key])=>key.startsWith(current+"|"))
    .map(([key,s])=>({
      name:key.slice(current.length+1),
      ...s
    }))
    .sort((a,b)=>b.total-a.total);

  return `
    <div class="box">
      <b>TREINADOR GLOBAL</b>
      <p>
        ESTRATÉGIAS:
        ${ranking.rows.length}
      </p>
      <p>
        ATIVA:
        ${esc(active?.name||"—")}
      </p>
      <p>
        MOTOR:
        ${esc(state.trainerMotor||"—")}
      </p>
      <p>
        TROCAS:
        ${state.trainerChanges}
      </p>
      <p>
        GIROS DESDE TROCA:
        ${state.trainerTurns}
      </p>
      <p>
        ${state.trainerPending
          ?"TROCA PENDENTE — FECHAR GALE"
          :"AVALIAÇÃO A CADA GIRO"}
      </p>
    </div>

    <div class="box">
      <b>TREINADOR GLOBAL G1 — DEFESAS</b>

      <p>
        STATUS:
        <strong>
          ${state.g1Trainer?"ATIVADO":"DESATIVADO"}
        </strong>
      </p>

      <p>
        DEFESAS VIRTUAIS AVALIADAS:
        <b>${state.g1Events}</b>
      </p>

      <p>
        PREVISÕES PENDENTES:
        <b>${state.g1Pending.length}</b>
      </p>

      <p>
        GALES REAIS:
        <b>${real}</b>
      </p>

      <p>
        GREEN G1:
        <b>${hits}</b>
      </p>

      <p>
        APROVEITAMENTO:
        <b>${pct(hits,real)}</b>
      </p>

      <p>
        DEFESA ATUAL:
        <b>
          ${esc(state.g1Decision?.mode||"AGUARDANDO")}
          ${esc(state.g1Decision?.key||"")}
        </b>
      </p>

      <p>
        ESTRATÉGIA AVALIADA:
        ${esc(current)}
      </p>

      <div class="muted">
        As defesas são comparadas com
        resultados posteriores às previsões.
        A escolha exige evidência mínima
        para substituir o congelado.
      </div>
    </div>

    <div class="title">
      DEFESAS VIRTUAIS DA ESTRATÉGIA
    </div>

    <div class="tablewrap">
      <table>
        <thead>
          <tr>
            <th>DEFESA</th>
            <th>AMOSTRAS</th>
            <th>GREEN</th>
            <th>TAXA</th>
            <th>ÚLTIMOS 12</th>
          </tr>
        </thead>

        <tbody>
          ${stats.map(s=>`
            <tr>
              <td>${esc(s.name)}</td>
              <td>${s.total}</td>
              <td>${s.hits}</td>
              <td>${pct(s.hits,s.total)}</td>
              <td>
                ${pct(
                  s.recent.slice(-12).reduce(
                    (a,b)=>a+b,0
                  ),
                  Math.min(12,s.recent.length)
                )}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <button class="virtualButton" id="activateTrainer">
      ATIVAR TREINADOR GLOBAL
    </button>

    <div class="title">
      RANKING DE ESTABILIDADE
    </div>

    <div class="tablewrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>ESTRATÉGIA</th>
            <th>MOTOR</th>
            <th>3</th>
            <th>12</th>
            <th>30</th>
            <th>LÍQUIDO 12</th>
          </tr>
        </thead>

        <tbody>
          ${ranking.rows.map((r,i)=>`
            <tr>
              <td>${i+1}</td>
              <td>${esc(r.name)}</td>
              <td>${esc(r.motor?.key||"—")}</td>
              <td>
                ${pct(
                  r.stability.m3.hits,
                  r.stability.m3.total
                )}
              </td>
              <td>
                ${pct(
                  r.stability.m12.hits,
                  r.stability.m12.total
                )}
              </td>
              <td>
                ${pct(
                  r.stability.m30.hits,
                  r.stability.m30.total
                )}
              </td>
              <td>
                ${fmt(r.stability.m12.net)}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <div class="title">ÚLTIMAS TROCAS</div>

    ${state.trainerHistory.slice(-12).reverse().map(x=>`
      <div class="listrow">
        GIRO ${x.turn}
        • ${esc(x.from||"INÍCIO")}
        → ${esc(x.to)}
        <div class="muted">
          ${esc(x.reason)}
          • ${esc(x.motor)}
        </div>
      </div>
    `).join("")}
  `;
}

function jumpsHTML() {
  const a=analyze(state.history);

  return `
    <div class="box">
      <b>LEITURA SEQUENCIAL</b>

      <p>
        NUMÉRICO:
        ${a.numericStreak.dir>0?"CRESCENTE":
          a.numericStreak.dir<0?"DECRESCENTE":"MISTO"}
        • ${a.numericStreak.length} PASSOS
      </p>

      <p>
        FÍSICO:
        ${a.physicalStreak.dir>0?"HORÁRIO":
          a.physicalStreak.dir<0?"ANTI-HORÁRIO":"MISTO"}
        • ${a.physicalStreak.length} PASSOS
      </p>

      <p>
        MÉDIA ÚLTIMOS 3:
        ${fmt(a.mean3)} CASAS
      </p>

      <p>
        VARIAÇÃO:
        ${fmt(a.acceleration)}
      </p>
    </div>

    <div class="title">AUSÊNCIA POR REGIÃO</div>

    ${Object.keys(REGIONS).map(s=>`
      <div class="listrow">
        ${s}
        • ${a.regions[s].absence} GIROS
        • ${a.regions[s].recent} NOS ÚLTIMOS 12
      </div>
    `).join("")}

    <div class="title">ÚLTIMAS TRANSIÇÕES</div>

    ${a.transitions.slice(-12).reverse().map(x=>`
      <div class="listrow">
        ${x.from} → ${x.to}
        • ${x.distance} CASAS
        • ${x.physical>0?"HORÁRIO":"ANTI-HORÁRIO"}
        • ${x.mirrorFrom} → ${x.mirrorTo}
      </div>
    `).join("")}
  `;
}

function mirrorsHTML() {
  const last=state.history.at(-1);

  const near=last==null?[]:W.filter(
    n=>MIRROR.has(n)&&distance(last,n)<=4
  );

  const far=last==null?[]:W.filter(
    n=>MIRROR.has(n)&&distance(last,n)>=10
  );

  const recent=state.history.slice(-20);

  const groups=[
    ["ESPELHOS PRÓXIMOS",near],
    ["ESPELHOS DISTANTES",far],
    ["TODOS OS ESPELHOS",W.filter(n=>MIRROR.has(n))],
    ["ANTIESPELHOS",W.filter(n=>!MIRROR.has(n))]
  ];

  return `
    <div class="box">
      ESPELHO ÚLTIMOS 20:
      ${recent.filter(n=>MIRROR.has(n)).length}

      <p>
        ANTIESPELHO ÚLTIMOS 20:
        ${recent.filter(n=>!MIRROR.has(n)).length}
      </p>
    </div>

    ${groups.map(([name,arr])=>`
      <div class="title">${name}</div>
      <div class="numberCloud">
        ${arr.map(n=>`<span>${n}</span>`).join("")||"—"}
      </div>
    `).join("")}
  `;
}

function timelineHTML() {
  return state.ledger.slice(-80).reverse().map(r=>`
    <div class="listrow">
      <b>
        GIRO ${r.turn}
        • ${r.number}
        • ${esc(r.result)}
      </b>

      <div class="muted">
        ${esc(r.strategy)}
        • ${esc(r.motor)}
        • ${region(r.number)}
        • ${mirror(r.number)}
      </div>

      ${r.play?`
        <div class="muted">
          CENTROS:
          ${sortedBlocks(r.play).map(
            b=>b.center
          ).join(" • ")}
        </div>
      `:""}
    </div>
  `).join("");
}

let renderPending=false;

function render() {
  if(renderPending) return;

  renderPending=true;

  requestAnimationFrame(()=>{
    renderPending=false;

    try {
      performRender();
    } catch(e) {
      showError(e);
    }
  });
}

function performRender() {
  const cs=getCandidates();

  if(
    state.strategy==="TRAINER"&&
    !state.trainerChoice&&
    state.phase==="ENTRY"
  ) {
    trainerUpdate(cs);
  }

  const def=activeDefinition();

  const motor=
    state.frozen||
    snap(activeMotor(cs));

  const play=motor?.play||null;

  $("status").textContent=
    state.history.length+
    " NÚMEROS • "+
    cs.length+
    "/12 MOTORES • "+
    state.phase+
    " • G1 VIRTUAL: "+
    state.g1Events+
    (storageWarning?" • FALHA AO SALVAR":"");

  for(const b of document.querySelectorAll(
    "[data-choice]"
  )) {
    const choice=b.dataset.choice;

    const active=
      state.strategy==="TRAINER"
        ?choice==="TRAINER":
      state.strategy==="ADAPTIVE"
        ?choice===state.activeAdaptive:
      choice===state.strategy;

    b.classList.toggle(
      "active",
      !state.manual&&active
    );
  }

  for(const b of document.querySelectorAll(
    "[data-rank]"
  )) {
    b.classList.toggle(
      "active",
      state.strategy==="FIXED"&&
      state.rank===Number(b.dataset.rank)
    );
  }

  for(const b of document.querySelectorAll(
    "[data-option]"
  )) {
    b.classList.toggle(
      "active",
      !!state[b.dataset.option]
    );
  }

  const g1Active=[
    "GALE","GALE_SKIP"
  ].includes(state.phase);

  const g1Label=
    g1Active&&state.g1Decision
      ?" • G1 "+
       state.g1Decision.mode+
       " • "+
       state.g1Decision.key
      :"";

  $("selected").textContent=
    (state.cycle?.strategy||def.name)+
    " • MOTOR "+
    (motor?.key||"AGUARDANDO")+
    " • "+
    state.phase+
    g1Label;

  $("centers").innerHTML=centersHTML(play);

  const excluded=play
    ?W.filter(n=>!play.numbers.includes(n))
    :[];

  $("coverage").innerHTML=play
    ?"28 COBERTOS • 9 DESCOBERTOS"+
     '<div class="muted">FORA DA JOGADA: '+
     excluded.join(" • ")+
     "</div>"
    :"IMPORTE PELO MENOS 8 NÚMEROS.";

  const last=state.history.slice(-14);

  const resultMap=new Map(
    state.ledger.slice(-20).map(
      r=>[r.turn,r.result]
    )
  );

  $("last").innerHTML=last.map((n,i)=>{
    const turn=
      state.history.length-last.length+i+1;

    const result=
      resultMap.get(turn)||"HISTÓRICO";

    const color=
      result==="LOSS"?"loss":
      result.startsWith("GREEN")?"green":
      result==="GALE"?"gale":"";

    const background=
      n===0?"#087b50":
      RED.has(n)?"#a72740":"#14181f";

    return `
      <div class="chip ${color}"
        style="background:${background}">
        <b>${n}</b>
        <small>${esc(result)}</small>
      </div>
    `;
  }).reverse().join("");

  if(state.open.general) {
    $("general").innerHTML=
      '<div class="title">HISTÓRICO</div>'+
      metricsHTML(
        state.ledger.filter(
          r=>r.source==="HISTÓRICO"
        )
      )+
      '<div class="title">TEMPO REAL</div>'+
      metricsHTML(
        state.ledger.filter(
          r=>r.source==="TEMPO REAL"
        )
      )+
      '<div class="title">TOTAL</div>'+
      metricsHTML(state.ledger)+
      '<div class="box">NÚMEROS ARMAZENADOS: '+
      state.history.length+
      "</div>";
  }

  if(state.open.trainer) {
    $("trainer").innerHTML=trainerHTML();

    $("activateTrainer").onclick=()=>{
      changeStrategy("TRAINER");
    };
  }

  if(state.open.lab) {
    $("lab").innerHTML=`
      <div class="box">
        7 ORIGINAIS • 12 ADAPTATIVAS
        • 4 POSIÇÕES AUTO
        • PERSONALIZADAS
      </div>

      <button class="virtualButton" id="create">
        CRIAR CÓPIA DA MELHOR ADAPTATIVA
      </button>
    `;

    $("create").onclick=()=>{
      const best=trainerRanking().rows.find(
        r=>r.type==="ADAPTIVE"
      );

      if(!best) return;

      state.createdStrategies.push({
        id:"CUSTOM_"+Date.now(),
        name:"ESTRATÉGIA VIRTUAL "+
          (state.createdStrategies.length+1),
        config:clone(best.config)
      });

      buildStrategies();
      rankingCacheKey="";
      save();
      render();
    };
  }

  if(state.open.motors) {
    $("motors").innerHTML=
      '<div class="row">'+
      cs.map(c=>`
        <button class="btn" data-manual="${c.key}">
          ${esc(c.key)}
        </button>
      `).join("")+
      "</div>"+
      cs.map(c=>`
        <div class="listrow">
          <b>
            ${c.rank}º ${esc(c.key)}
          </b>
          <div class="muted">
            CENTROS:
            ${sortedBlocks(c.play).map(
              b=>b.center
            ).join(" • ")}
          </div>
        </div>
      `).join("");

    for(const b of document.querySelectorAll(
      "[data-manual]"
    )) {
      b.onclick=()=>{
        state.manual=b.dataset.manual;
        save();
        render();
      };
    }
  }

  if(state.open.jumps) {
    $("jumps").innerHTML=jumpsHTML();
  }

  if(state.open.mirrors) {
    $("mirrors").innerHTML=mirrorsHTML();
  }

  if(state.open.timeline) {
    $("timeline").innerHTML=timelineHTML();
  }

  for(const [id,open] of Object.entries(state.open)) {
    const el=$(id);

    if(el) {
      el.classList.toggle("hide",!open);
    }

    const b=document.querySelector(
      '[data-panel="'+id+'"]'
    );

    const span=b?.querySelector("span");

    if(span) {
      span.textContent=open?"−":"+";
    }
  }
}

/* INICIALIZAÇÃO */

render();

})();
