
(() => {
"use strict";

/*
  ANÁLISE BETA V5.6
  BASE: CÓDIGO V5.5 ENVIADO PELO USUÁRIO

  PRESERVADO:
  - HTML e estrutura visual original
  - 12 motores
  - Geometria de 28 números
  - Estratégias existentes
  - Teclado 0–36
  - Importação de 200 números
  - Histórico e tempo real
  - GREEN, GALE e LOSS
  - Ranking, auditoria e linha do tempo

  ACRESCENTADO:
  - Treinador Estratégico Virtual
  - Backtest cronológico
  - Auditoria dos 12 motores
  - Estratégias adaptativas
  - Laboratório de regras e parâmetros
  - Diagnóstico de erros e acertos
  - Comparação de estratégias
  - Recomendações concretas
  - Criação de botões de estratégia
  - Ativação das estratégias criadas
  - Persistência das configurações

  IMPORTANTE:
  O backtest mede desempenho histórico.
  Não garante vantagem futura na roleta.
*/

const VERSION = "5.6";
const KEY = "ANALISE_BETA_V55_COMPLETO";
const MAX = 200;

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

const SECTORS = {
  TIERS:[
    27,13,36,11,30,8,23,10,5,24,16,33
  ],
  ORFAOS:[
    17,34,6,1,20,14,31,9
  ],
  VOISINS:[
    22,18,29,7,25,2,21,4,19
  ],
  ZERO:[
    28,12,35,3,26,0,32,15
  ]
};

const FAMILIES = [
  "NORMAL",
  "DINAMICO",
  "RX_NORMAL",
  "RX_DINAMICO"
];

const RADII = [4,5,6];

const $ = id => document.getElementById(id);

const mod = n => (n % 37 + 37) % 37;

const index = n => W.indexOf(n);

const fmt = n =>
  Number.isFinite(n)
    ? n.toFixed(1).replace(".",",")
    : "—";

const pct = (a,b) =>
  b ? fmt(100*a/b)+"%" : "—";

const esc = x =>
  String(x ?? "").replace(
    /[&<>"']/g,
    c => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#39;"
    }[c])
  );

function sector(n){
  return Object.keys(SECTORS).find(
    k => SECTORS[k].includes(n)
  ) || "—";
}

function distance(a,b){
  const d = Math.abs(index(a)-index(b));
  return Math.min(d,37-d);
}

function fresh(){
  return {
    history:[],
    sources:[],
    strategy:"FIXED",
    rank:3,
    manual:null,
    g1:true,
    secondHouse:false,
    galeSkip:false,
    createdStrategies:[],
    activeCreated:null,
    trainerMin:12,
    open:{
      trainer:true,
      lab:true,
      motors:false,
      timeline:false
    }
  };
}

let state = fresh();

try {
  const old = JSON.parse(
    localStorage.getItem(KEY) || "null"
  );

  if(old){
    state = {
      ...fresh(),
      ...old,
      createdStrategies:
        Array.isArray(old.createdStrategies)
          ? old.createdStrategies
          : [],
      open:{
        ...fresh().open,
        ...old.open
      }
    };
  }
}catch(e){}

function save(){
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(state)
    );
  }catch(e){}
}

/* ==========================================
   12 MOTORES ORIGINAIS
   ========================================== */

function motorWeights(history,family,radius){

  const weights = Array(37).fill(.01);
  const recent = history.slice(-60);

  for(let k=0;k<recent.length;k++){

    const n=recent[recent.length-1-k];
    const decay=Math.exp(-k/(radius*2.3));

    for(let j=0;j<37;j++){

      const d=distance(n,W[j]);

      if(d<=6){
        weights[j]+=
          decay*(7-d)/7;
      }
    }
  }

  if(family.includes("DINAMICO")){

    for(
      let k=0;
      k<Math.min(radius+2,history.length);
      k++
    ){

      const n=history[history.length-1-k];

      for(let j=0;j<37;j++){

        const d=distance(n,W[j]);

        if(d<=3){
          weights[j]+=
            (4-d)/(k+2)*1.7;
        }
      }
    }
  }

  if(family.startsWith("RX")){

    const length=Math.min(
      radius,
      history.length-2
    );

    if(length>=2){

      const current=history.slice(-length);
      const matches=[];

      for(
        let i=0;
        i+length<history.length-1;
        i++
      ){

        let score=0;

        for(let j=0;j<length;j++){

          score+=Math.max(
            0,
            6-distance(
              current[j],
              history[i+j]
            )
          )/6;
        }

        matches.push({
          score:score/length,
          next:history[i+length]
        });
      }

      matches.sort(
        (a,b)=>b.score-a.score
      );

      const selected=matches.slice(
        0,
        Math.max(
          3,
          Math.ceil(matches.length*.2)
        )
      );

      for(const match of selected){

        for(let j=0;j<37;j++){

          const d=distance(
            match.next,
            W[j]
          );

          if(d<=3){
            weights[j]+=
              (4-d)*match.score*.45;
          }
        }
      }
    }
  }

  return weights;
}

/* ==========================================
   GEOMETRIA ORIGINAL
   5 BLOCOS DE 5
   1 BLOCO DE 3
   TOTAL 28 NÚMEROS
   ========================================== */

function geometry(weights){

  const p5=Array(37).fill(0);
  const p3=Array(37).fill(0);

  for(let c=0;c<37;c++){

    for(let d=-2;d<=2;d++){
      p5[c]+=weights[mod(c+d)];
    }

    for(let d=-1;d<=1;d++){
      p3[c]+=weights[mod(c+d)];
    }
  }

  let best=null;

  for(let start=0;start<37;start++){

    for(let short=0;short<6;short++){

      const sizes=Array(6).fill(5);
      sizes[short]=3;

      const memo=new Map();

      function solve(k,g){

        if(k===6){
          return g===9
            ? {score:0,gaps:[]}
            : null;
        }

        const key=k+"|"+g;

        if(memo.has(key)){
          return memo.get(key);
        }

        let used=0;

        for(let j=0;j<k;j++){
          used+=sizes[j];
        }

        const center=mod(
          start+
          used+
          g+
          Math.floor(sizes[k]/2)
        );

        const value=sizes[k]===3
          ?p3[center]
          :p5[center];

        let winner=null;

        for(
          let gap=0;
          gap<=9-g;
          gap++
        ){

          if(gap===1)continue;

          const next=solve(
            k+1,
            g+gap
          );

          if(!next)continue;

          const score=value+next.score;

          if(
            !winner||
            score>winner.score
          ){
            winner={
              score,
              gaps:[
                gap,
                ...next.gaps
              ]
            };
          }
        }

        memo.set(key,winner);

        return winner;
      }

      const result=solve(0,0);

      if(!result)continue;

      if(
        best&&
        result.score<=best.score
      )continue;

      let cursor=start;

      const centers5=[];
      let center3=null;
      const blocks=[];

      for(let k=0;k<6;k++){

        const size=sizes[k];

        const centerIndex=mod(
          cursor+
          Math.floor(size/2)
        );

        const center=W[centerIndex];
        const radius=size===3?1:2;

        const numbers=Array.from(
          {length:size},
          (_,i)=>W[mod(cursor+i)]
        );

        blocks.push({
          center,
          radius,
          numbers
        });

        if(radius===1){
          center3=center;
        }else{
          centers5.push(center);
        }

        cursor+=
          size+
          result.gaps[k];
      }

      const numbers=blocks.flatMap(
        x=>x.numbers
      );

      if(
        new Set(numbers).size!==28
      )continue;

      best={
        score:result.score,
        centers5,
        center3,
        blocks,
        numbers
      };
    }
  }

  return best;
}

function candidates(history){

  if(history.length<8)return [];

  const result=[];

  for(const family of FAMILIES){

    for(const radius of RADII){

      if(
        family.startsWith("RX")&&
        history.length<radius*2+4
      )continue;

      const weights=motorWeights(
        history,
        family,
        radius
      );

      const play=geometry(weights);

      if(!play)continue;

      result.push({
        key:family+"_"+radius,
        family,
        radius,
        play,
        score:play.score
      });
    }
  }

  result.sort(
    (a,b)=>b.score-a.score
  );

  result.forEach(
    (c,i)=>c.rank=i+1
  );

  return result;
}

/* ==========================================
   MEMÓRIA DO BACKTEST

   Os motores são calculados uma vez
   por posição histórica e reutilizados
   pelas estratégias.

   Nenhuma decisão usa o número
   que ainda será sorteado.
   ========================================== */

let engineCache={
  signature:null,
  frames:[]
};

function historySignature(history){
  return history.join(",");
}

function buildFrames(history){

  const signature=historySignature(history);

  if(
    engineCache.signature===signature
  ){
    return engineCache.frames;
  }

  const frames=[];

  for(let i=0;i<=history.length;i++){

    frames.push({
      turn:i+1,
      before:history.slice(0,i),
      candidates:candidates(
        history.slice(0,i)
      ),
      result:
        i<history.length
          ?history[i]
          :null
    });
  }

  engineCache={
    signature,
    frames
  };

  return frames;
}

/* ==========================================
   ESTATÍSTICA HISTÓRICA DE MOTORES

   Cada motor é avaliado virtualmente
   em todos os giros anteriores,
   independentemente de ter sido escolhido.
   ========================================== */

function motorStats(
  key,
  records,
  window=20
){

  const past=records
    .filter(r=>
      r.candidates.some(
        c=>c.key===key
      )
    )
    .slice(-window);

  let hits=0;

  for(const r of past){

    const c=r.candidates.find(
      x=>x.key===key
    );

    if(
      c.play.numbers.includes(r.n)
    ){
      hits++;
    }
  }

  return {
    total:past.length,
    hits,
    misses:past.length-hits,
    rate:past.length
      ?hits/past.length
      :null
  };
}

function previousStats(
  key,
  records,
  window=20
){
  return motorStats(
    key,
    records,
    window
  );
}

/* ==========================================
   REGRAS ADAPTATIVAS
   ========================================== */

function adaptiveChoose(
  cs,
  records,
  previous,
  config
){

  const {
    window=20,
    minSamples=12,
    margin=.08,
    persistence=3,
    maxRank=12,
    lossPenalty=0,
    consensus=0,
    recentWeight=0,
    switchAfterLoss=false
  }=config;

  const eligible=cs.filter(
    c=>c.rank<=maxRank
  );

  if(!eligible.length){
    return cs[0]||null;
  }

  const recent=records.slice(-window);

  const ranked=eligible.map(c=>{

    const stats=motorStats(
      c.key,
      records,
      window
    );

    let score=stats.rate??0;

    if(stats.total<minSamples){
      score=.5;
    }

    if(recentWeight){

      const short=motorStats(
        c.key,
        records,
        Math.max(
          5,
          Math.floor(window/2)
        )
      );

      if(short.rate!==null){
        score=
          score*(1-recentWeight)+
          short.rate*recentWeight;
      }
    }

    if(lossPenalty){

      const last=records
        .slice(-5)
        .filter(r=>{

          const old=r.candidates.find(
            x=>x.key===c.key
          );

          return old&&
            !old.play.numbers.includes(r.n);
        }).length;

      score-=
        last*lossPenalty;
    }

    if(consensus){

      const votes=c.play.numbers.reduce(
        (total,n)=>{

          return total+
            cs.filter(x=>
              x.play.numbers.includes(n)
            ).length;

        },0
      );

      score+=
        consensus*
        votes/(28*cs.length);
    }

    return {
      c,
      score,
      stats
    };
  }).sort(
    (a,b)=>
      b.score-a.score||
      a.c.rank-b.c.rank
  );

  const best=ranked[0];

  if(!previous)return best.c;

  const old=ranked.find(
    x=>x.c.key===previous
  );

  if(!old)return best.c;

  if(
    old.c.key===best.c.key
  ){
    return old.c;
  }

  const recentPrevious=records
    .slice(-persistence)
    .filter(r=>{

      const c=r.candidates.find(
        x=>x.key===previous
      );

      return c&&
        !c.play.numbers.includes(r.n);
    });

  const consecutiveMisses=
    recentPrevious.length===persistence;

  if(
    switchAfterLoss&&
    consecutiveMisses
  ){
    return best.c;
  }

  if(
    best.stats.total>=minSamples&&
    old.stats.total>=minSamples&&
    best.score>=old.score+margin
  ){
    return best.c;
  }

  return old.c;
}

/* ==========================================
   ESTRATÉGIAS ORIGINAIS
   ========================================== */

function choose(
  cs,
  records,
  rule,
  rank=3,
  previous=null,
  config=null
){

  if(!cs.length)return null;

  const fixed=cs[
    Math.min(
      Math.max(rank-1,0),
      cs.length-1
    )
  ];

  if(rule==="MANUAL"){

    return cs.find(
      x=>x.key===state.manual
    )||fixed;
  }

  if(rule==="CREATED"){

    return adaptiveChoose(
      cs,
      records,
      previous,
      config||{}
    );
  }

  if(rule==="FIXED"){
    return fixed;
  }

  if(rule==="GEO"){
    return cs[0];
  }

  if(rule==="BEST"){

    return [...cs].sort((a,b)=>{

      const A=previousStats(
        a.key,
        records
      );

      const B=previousStats(
        b.key,
        records
      );

      const ar=A.total>=8
        ?A.rate:-1;

      const br=B.total>=8
        ?B.rate:-1;

      return br-ar||
        a.rank-b.rank;

    })[0];
  }

  if(rule==="STABLE"){

    const old=cs.find(
      x=>x.key===previous
    );

    return old&&old.rank<=5
      ?old
      :fixed;
  }

  if(rule==="SWITCH"){

    const old=cs.find(
      x=>x.key===previous
    )||fixed;

    const oldStats=previousStats(
      old.key,
      records
    );

    const alternatives=cs.map(c=>({
      c,
      stats:previousStats(
        c.key,
        records
      )
    }))
    .filter(x=>x.stats.total>=12)
    .sort(
      (a,b)=>
        b.stats.rate-a.stats.rate
    );

    if(
      alternatives.length&&
      oldStats.total>=12&&
      alternatives[0].stats.rate>
        oldStats.rate+.12
    ){
      return alternatives[0].c;
    }

    return old;
  }

  if(
    rule==="CONSENSUS"||
    rule==="UNION"
  ){

    const votes=Array(37).fill(0);

    const selected=
      rule==="UNION"
        ?cs.slice(0,3)
        :cs;

    for(const c of selected){

      for(const n of c.play.numbers){

        votes[index(n)]+=
          rule==="UNION"
            ?1
            :1/(1+c.rank*.1);
      }
    }

    const play=geometry(votes);

    return {
      key:rule,
      family:rule,
      radius:0,
      rank:0,
      score:play.score,
      play
    };
  }

  return fixed;
}

function snapshot(c){

  if(!c)return null;

  return {
    key:c.key,
    family:c.family,
    radius:c.radius,
    rank:c.rank,
    score:c.score,
    play:{
      score:c.play.score,
      centers5:[
        ...c.play.centers5
      ],
      center3:c.play.center3,
      numbers:[
        ...c.play.numbers
      ],
      blocks:c.play.blocks.map(b=>({
        center:b.center,
        radius:b.radius,
        numbers:[
          ...b.numbers
        ]
      }))
    }
  };
}

/* ==========================================
   GALE ORIGINAL
   ========================================== */

function tuneG1(candidate,miss){

  if(!candidate)return null;

  const weights=W.map(n=>
    candidate.play.numbers.includes(n)
      ?10
      :0
  );

  weights[index(miss)]+=500;

  weights[
    mod(index(miss)-1)
  ]+=200;

  weights[
    mod(index(miss)+1)
  ]+=200;

  const play=geometry(weights);

  return {
    ...candidate,
    play
  };
}

/* ==========================================
   MOTOR DE BACKTEST

   - Replay cronológico
   - Decisão antes do resultado
   - Snapshot dos 12 motores
   - Registro de entrada
   - Registro de Gale
   - Registro de LOSS
   - Registro de oportunidades
   ========================================== */

function simulate(
  history,
  sources,
  rule,
  rank=3,
  options={},
  config=null,
  frames=null
){

  frames=frames||buildFrames(history);

  const records=[];
  const cycles=[];
  const entries=[];
  const audits=[];
  const decisions=[];

  let phase="ENTRY";
  let frozen=null;
  let previous=null;

  let activeSource="HISTÓRICO";
  let activeCycle=null;
  let activeMotor=null;
  let activeEntry=null;

  const allRecords=[];

  for(let i=0;i<history.length;i++){

    const n=history[i];
    const cs=frames[i].candidates;

    const selected=choose(
      cs,
      allRecords,
      rule,
      rank,
      previous,
      config
    );

    const selectedSnap=snapshot(
      selected
    );

    const source=
      sources?.[i]||
      "HISTÓRICO";

    const beforePhase=phase;

    const decision={
      turn:i+1,
      n,
      candidates:cs.map(snapshot),
      selected:selectedSnap,
      phase:beforePhase,
      source
    };

    /*
      Estatística virtual dos motores:
      primeiro decide, depois registra
      o resultado para o próximo giro.
    */

    const actual=
      frozen||selectedSnap;

    const play=actual?.play||null;

    const covered=!!(
      play&&
      play.numbers.includes(n)
    );

    let label="AGUARDANDO";

    if(!play){

      label="SEM MOTOR";
    }

    else if(phase==="ENTRY"){

      if(selected){
        previous=selected.key;
      }

      activeMotor=selectedSnap;
      activeSource=source;
      activeCycle=i+1;
      activeEntry=decision;

      if(options.secondHouse){

        frozen=selectedSnap;
        phase="SECOND_SKIP";
        label="2ª CASA";

      }else{

        records.push(decision);

        if(covered){

          cycles.push({
            source,
            green:true,
            direct:true,
            gale:false,
            loss:false,
            start:i+1,
            end:i+1,
            motor:actual.key
          });

          activeMotor=null;
          activeCycle=null;
          activeEntry=null;

          label="GREEN";

        }else{

          frozen=options.g1
            ?tuneG1(selectedSnap,n)
            :selectedSnap;

          phase=options.galeSkip
            ?"GALE_SKIP"
            :"GALE";

          label="GALE";
        }
      }
    }

    else if(phase==="SECOND_SKIP"){

      phase="SECOND_ENTRY";
      label="CASA PULADA";
    }

    else if(phase==="SECOND_ENTRY"){

      records.push(decision);

      if(covered){

        cycles.push({
          source:activeSource,
          green:true,
          direct:true,
          gale:false,
          loss:false,
          start:activeCycle,
          end:i+1,
          motor:activeMotor?.key
        });

        frozen=null;
        phase="ENTRY";

        activeMotor=null;
        activeCycle=null;
        activeEntry=null;

        label="GREEN";

      }else{

        frozen=options.g1
          ?tuneG1(frozen,n)
          :frozen;

        phase=options.galeSkip
          ?"GALE_SKIP"
          :"GALE";

        label="GALE";
      }
    }

    else if(phase==="GALE_SKIP"){

      phase="GALE";
      label="GALE PULADO";
    }

    else if(phase==="GALE"){

      cycles.push({
        source:activeSource,
        green:covered,
        direct:false,
        gale:true,
        loss:!covered,
        start:activeCycle,
        end:i+1,
        motor:activeMotor?.key
      });

      label=covered
        ?"GREEN G1"
        :"LOSS";

      frozen=null;
      phase="ENTRY";

      activeMotor=null;
      activeCycle=null;
      activeEntry=null;
    }

    const alternatives=cs.filter(
      c=>c.play.numbers.includes(n)
    );

    const missed=
      play&&!covered;

    const counterfactual=alternatives.map(
      c=>{

        const stats=motorStats(
          c.key,
          allRecords,
          20
        );

        return {
          key:c.key,
          rank:c.rank,
          previous:stats
        };
      }
    );

    counterfactual.sort(
      (a,b)=>
        (b.previous.rate??-1)-
        (a.previous.rate??-1)||
        a.rank-b.rank
    );

    if(missed){

      const best=counterfactual[0];

      const bestCandidate=best
        ?cs.find(
          x=>x.key===best.key
        )
        :null;

      const selectedStats=
        selected
          ?motorStats(
            selected.key,
            allRecords,
            20
          )
          :null;

      let category=
        "LACUNA DE COBERTURA";

      if(alternatives.length){
        category=
          "OPORTUNIDADE RETROSPECTIVA";
      }

      if(
        best&&
        selectedStats&&
        best.previous.total>=12&&
        selectedStats.total>=12&&
        best.previous.rate>
          selectedStats.rate+.10
      ){
        category=
          "MELHORIA CANDIDATA";
      }

      audits.push({
        turn:i+1,
        n,
        phase:beforePhase,
        selected:actual.key,
        category,
        alternatives:
          alternatives.map(
            c=>c.key
          ),
        best:best?.key||null,
        previousBest:
          best?.previous||null,
        previousSelected:
          selectedStats,
        removed:bestCandidate
          ?play.numbers.filter(
            x=>
              !bestCandidate.play.numbers
                .includes(x)
          )
          :[],
        added:bestCandidate
          ?bestCandidate.play.numbers
            .filter(
              x=>
                !play.numbers.includes(x)
            )
          :[]
      });
    }

    entries.push({
      turn:i+1,
      n,
      label,
      selected:
        actual?.key||"—",
      region:sector(n),
      source,
      phase:beforePhase,
      covered,
      alternatives:
        alternatives.map(
          c=>c.key
        )
    });

    decisions.push({
      turn:i+1,
      n,
      source,
      phase:beforePhase,
      motor:
        actual?.key||null,
      selected:
        selected?.key||null,
      covered,
      result:label,
      sector:sector(n),
      candidateCoverage:
        cs.map(c=>({
          key:c.key,
          covered:
            c.play.numbers.includes(n),
          rank:c.rank
        }))
    });

    allRecords.push({
      turn:i+1,
      n,
      candidates:cs.map(snapshot),
      selected:selectedSnap,
      phase:beforePhase,
      source
    });
  }

  return {
    records,
    cycles,
    entries,
    audits,
    decisions,
    allRecords,
    phase,
    current:frozen,
    previous
  };
}

/* ==========================================
   INDICADORES ORIGINAIS
   ========================================== */

function metrics(cycles){

  const total=cycles.length;

  const green=cycles.filter(
    x=>x.green
  ).length;

  const gale=cycles.filter(
    x=>x.gale
  ).length;

  const loss=cycles.filter(
    x=>x.loss
  ).length;

  const direct=cycles.filter(
    x=>x.direct
  ).length;

  return {
    total,
    green,
    gale,
    loss,
    direct,
    rate:total
      ?green/total
      :null
  };
}

function tracking(result){

  const rows=result.records.filter(
    x=>x.selected
  );

  let switches=0;
  let streak=0;
  let maxStreak=0;
  let last=null;

  const byMotor={};

  for(const r of rows){

    const key=r.selected.key;

    if(key===last){

      streak++;

    }else{

      if(last!==null){
        switches++;
      }

      streak=1;
      last=key;
    }

    maxStreak=Math.max(
      maxStreak,
      streak
    );

    if(!byMotor[key]){

      byMotor[key]={
        decisions:0,
        covered:0
      };
    }

    byMotor[key].decisions++;

    if(
      r.selected.play.numbers.includes(r.n)
    ){
      byMotor[key].covered++;
    }
  }

  return {
    switches,
    streak,
    maxStreak,
    byMotor
  };
}

/* ==========================================
   TREINADOR VIRTUAL
   AUDITORIA DE TODOS OS GIROS
   ========================================== */

function virtualTrainer(
  history,
  result,
  frames
){

  const motors={};
  const regions={};

  let uncovered=0;
  let alternativeHits=0;
  let nobodyCovered=0;

  let motorSwitches=0;
  let currentMotor=null;
  let motorStreak=0;
  let maxMotorStreak=0;

  let regionStreak=0;
  let maxRegionStreak=0;
  let lastRegion=null;

  let galeCount=0;
  let lossCount=0;
  let greenCount=0;

  const failures=[];
  const successes=[];
  const transitions=[];

  for(const family of FAMILIES){

    for(const radius of RADII){

      motors[
        family+"_"+radius
      ]={
        total:0,
        hits:0,
        misses:0,
        maxHits:0,
        maxMisses:0,
        hitStreak:0,
        missStreak:0
      };
    }
  }

  for(const name of Object.keys(
    SECTORS
  )){

    regions[name]={
      total:0,
      longest:0
    };
  }

  for(let i=0;i<history.length;i++){

    const n=history[i];
    const region=sector(n);

    const frame=frames[i];

    const entry=result.entries[i];

    if(regions[region]){
      regions[region].total++;
    }

    if(region===lastRegion){

      regionStreak++;

    }else{

      if(lastRegion!==null){

        transitions.push({
          turn:i+1,
          from:lastRegion,
          to:region
        });
      }

      regionStreak=1;
      lastRegion=region;
    }

    maxRegionStreak=Math.max(
      maxRegionStreak,
      regionStreak
    );

    if(regions[region]){

      regions[region].longest=Math.max(
        regions[region].longest,
        regionStreak
      );
    }

    for(const c of frame.candidates){

      const m=motors[c.key];

      if(!m)continue;

      const hit=c.play.numbers.includes(n);

      m.total++;

      if(hit){

        m.hits++;
        m.hitStreak++;
        m.missStreak=0;

      }else{

        m.misses++;
        m.missStreak++;
        m.hitStreak=0;
      }

      m.maxHits=Math.max(
        m.maxHits,
        m.hitStreak
      );

      m.maxMisses=Math.max(
        m.maxMisses,
        m.missStreak
      );
    }

    if(entry?.selected&&
       entry.selected!=="—"){

      if(entry.selected===currentMotor){

        motorStreak++;

      }else{

        if(currentMotor!==null){
          motorSwitches++;
        }

        currentMotor=entry.selected;
        motorStreak=1;
      }

      maxMotorStreak=Math.max(
        maxMotorStreak,
        motorStreak
      );
    }

    if(entry?.label==="GREEN"||
       entry?.label==="GREEN G1"){

      greenCount++;

      successes.push({
        turn:i+1,
        n,
        motor:entry.selected,
        phase:entry.phase,
        label:entry.label
      });
    }

    if(entry?.label==="GALE"){
      galeCount++;
    }

    if(entry?.label==="LOSS"){
      lossCount++;
    }

    if(
      entry?.selected!=="—"&&
      !entry?.covered
    ){

      uncovered++;

      const alternatives=frame.candidates
        .filter(c=>
          c.play.numbers.includes(n)
        );

      if(alternatives.length){
        alternativeHits++;
      }else{
        nobodyCovered++;
      }

      failures.push({
        turn:i+1,
        n,
        motor:entry.selected,
        phase:entry.phase,
        alternatives:
          alternatives.map(c=>c.key),
        label:entry.label
      });
    }
  }

  const ranking=Object.entries(motors)
    .map(([key,m])=>({
      key,
      ...m,
      rate:m.total
        ?m.hits/m.total
        :null
    }))
    .sort(
      (a,b)=>
        (b.rate??-1)-
        (a.rate??-1)
    );

  const total=result.cycles.length;

  return {
    totalNumbers:history.length,
    evaluated:result.decisions.length,
    greenCount,
    galeCount,
    lossCount,
    totalCycles:total,
    uncovered,
    alternativeHits,
    nobodyCovered,
    motorSwitches,
    currentMotor,
    motorStreak,
    maxMotorStreak,
    regionStreak,
    maxRegionStreak,
    transitions,
    regions,
    ranking,
    failures,
    successes
  };
}

/* ==========================================
   LABORATÓRIO ORIGINAL
   ========================================== */

const RULES=[
  ["FIXED",1,"AUTO 1º"],
  ["FIXED",2,"AUTO 2º"],
  ["FIXED",3,"AUTO 3º"],
  ["FIXED",4,"AUTO 4º"],
  ["GEO",1,"MELHOR GEOMETRIA"],
  ["BEST",3,"MELHOR DESEMPENHO"],
  ["STABLE",3,"ESTABILIDADE"],
  ["SWITCH",3,"TROCA INTELIGENTE"],
  ["CONSENSUS",3,"CONSENSO"],
  ["UNION",3,"UNIÃO"]
];

/* ==========================================
   NOVAS REGRAS QUE O TREINADOR TESTA

   O laboratório compara parâmetros
   diferentes sem olhar antecipadamente
   o resultado de cada giro.
   ========================================== */

function candidateConfigurations(){

  const configs=[];

  const windows=[10,20,30];

  const margins=[.05,.10,.15];

  for(const window of windows){

    for(const margin of margins){

      configs.push({
        window,
        margin,
        minSamples:Math.min(
          12,
          Math.max(6,Math.floor(window/2))
        ),
        persistence:3,
        maxRank:12,
        lossPenalty:0,
        consensus:0,
        recentWeight:0,
        switchAfterLoss:false
      });
    }
  }

  configs.push(
    {
      window:20,
      margin:.08,
      minSamples:10,
      persistence:2,
      maxRank:12,
      lossPenalty:.025,
      consensus:0,
      recentWeight:.4,
      switchAfterLoss:true
    },
    {
      window:30,
      margin:.12,
      minSamples:12,
      persistence:3,
      maxRank:6,
      lossPenalty:.02,
      consensus:.04,
      recentWeight:.3,
      switchAfterLoss:false
    },
    {
      window:20,
      margin:.10,
      minSamples:10,
      persistence:3,
      maxRank:4,
      lossPenalty:.03,
      consensus:.05,
      recentWeight:.5,
      switchAfterLoss:true
    }
  );

  return configs;
}

function optionsNow(){
  return {
    g1:state.g1,
    galeSkip:state.galeSkip,
    secondHouse:state.secondHouse
  };
}

function evaluateStrategy(
  history,
  sources,
  rule,
  rank,
  config,
  frames
){

  const result=simulate(
    history,
    sources,
    rule,
    rank,
    optionsNow(),
    config,
    frames
  );

  const split=Math.floor(
    history.length*.65
  );

  const train=metrics(
    result.cycles.filter(
      x=>x.end<=split
    )
  );

  const valid=metrics(
    result.cycles.filter(
      x=>x.start>split
    )
  );

  const total=metrics(
    result.cycles
  );

  return {
    result,
    train,
    valid,
    total
  };
}

function laboratory(
  history,
  frames
){

  if(history.length<30){

    return {
      status:"HISTÓRICO INSUFICIENTE",
      rows:[],
      recommendation:null,
      baseline:null,
      generated:[]
    };
  }

  const sources=history.map(
    ()=>"HISTÓRICO"
  );

  const rows=[];

  for(const [rule,rank,name] of RULES){

    const evaluation=evaluateStrategy(
      history,
      sources,
      rule,
      rank,
      null,
      frames
    );

    rows.push({
      rule,
      rank,
      name,
      config:null,
      ...evaluation
    });
  }

  const baseline=rows.find(
    x=>
      x.rule==="FIXED"&&
      x.rank===3
  );

  const generated=[];

  for(const config of candidateConfigurations()){

    const evaluation=evaluateStrategy(
      history,
      sources,
      "CREATED",
      3,
      config,
      frames
    );

    const name=
      "ADAPTATIVA "+
      config.window+
      " / "+
      Math.round(config.margin*100)+"%";

    generated.push({
      rule:"CREATED",
      rank:3,
      name,
      config,
      ...evaluation
    });
  }

  const all=[
    ...rows,
    ...generated
  ];

  /*
    A ordenação considera a validação.
    Não transforma o melhor resultado
    da amostra em garantia futura.
  */

  all.sort((a,b)=>{

    const ar=a.valid.rate??-1;
    const br=b.valid.rate??-1;

    return br-ar||
      a.valid.loss-b.valid.loss||
      b.valid.total-a.valid.total;
  });

  const eligible=all.filter(
    x=>x.valid.total>=8
  );

  const recommendation=
    eligible[0]||null;

  return {
    status:recommendation
      ?"COMPARAÇÃO HISTÓRICA CONCLUÍDA"
      :"AMOSTRA DE VALIDAÇÃO INSUFICIENTE",
    rows:all,
    recommendation,
    baseline,
    generated
  };
}

/* ==========================================
   DIAGNÓSTICO ESTRATÉGICO

   O treinador identifica:
   - regras com menos LOSS
   - regras com mais GREEN
   - regras que reduziram Gale
   - custo das trocas
   - estabilidade
   - resultado fora do desenvolvimento
   ========================================== */

function strategicDiagnosis(
  lab,
  trainer
){

  if(!lab.recommendation){

    return {
      title:"AGUARDANDO MAIS DADOS",
      messages:[
        "Ainda não há ciclos suficientes para comparar estratégias com segurança."
      ],
      config:null,
      recommended:null
    };
  }

  const best=lab.recommendation;
  const baseline=lab.baseline;

  const messages=[];

  const bestRate=best.valid.rate;
  const baseRate=baseline?.valid.rate;

  messages.push(
    "Foram analisados "+
    trainer.totalNumbers+
    " números e "+
    lab.rows.length+
    " configurações de estratégia."
  );

  messages.push(
    "A configuração com maior percentual observado na validação foi "+
    best.name+
    ", com "+
    pct(
      best.valid.green,
      best.valid.total
    )+
    " de GREEN em "+
    best.valid.total+
    " ciclos completos."
  );

  if(baseline){

    messages.push(
      "A referência AUTO 3º apresentou "+
      pct(
        baseline.valid.green,
        baseline.valid.total
      )+
      " na validação."
    );

    if(
      bestRate!==null&&
      baseRate!==null
    ){

      const difference=
        (bestRate-baseRate)*100;

      if(difference>0){

        messages.push(
          "Diferença observada em relação ao AUTO 3º: +"+
          fmt(difference)+
          " pontos percentuais."
        );

      }else if(difference<0){

        messages.push(
          "A configuração selecionada não superou o AUTO 3º em percentual."
        );

      }else{

        messages.push(
          "O percentual foi igual ao AUTO 3º."
        );
      }
    }
  }

  messages.push(
    "O treinador encontrou "+
    trainer.alternativeHits+
    " giros descobertos em que pelo menos outro motor teria coberto o número."
  );

  messages.push(
    "Em "+
    trainer.nobodyCovered+
    " giros descobertos, nenhum dos motores disponíveis cobria o resultado."
  );

  messages.push(
    "Essas oportunidades são retrospectivas. Para trocar antes do giro, a regra precisa se basear no desempenho anterior."
  );

  if(best.config){

    const c=best.config;

    messages.push(
      "REGRA PROPOSTA: avaliar os últimos "+
      c.window+
      " giros, exigir pelo menos "+
      c.minSamples+
      " amostras por motor e trocar quando a vantagem estimada atingir "+
      fmt(c.margin*100)+
      " pontos percentuais."
    );

    messages.push(
      "Limitar a escolha aos "+
      c.maxRank+
      " primeiros motores do ranking."
    );

    if(c.switchAfterLoss){

      messages.push(
        "Permitir antecipação de troca após "+
        c.persistence+
        " falhas recentes do motor mantido."
      );
    }

    if(c.lossPenalty){

      messages.push(
        "Aplicar penalidade de "+
        fmt(c.lossPenalty*100)+
        " pontos por falha recente no cálculo da prioridade."
      );
    }

    if(c.consensus){

      messages.push(
        "Adicionar peso de consenso entre os motores para avaliar estabilidade geométrica."
      );
    }

  }else{

    messages.push(
      "A melhor configuração observada já corresponde a uma estratégia existente: "+
      best.name+
      ". Não é necessário criar um botão duplicado."
    );
  }

  messages.push(
    "O resultado deve ser acompanhado em novos giros antes de considerar a estratégia validada. Nenhuma configuração garante ganhos."
  );

  return {
    title:best.name,
    messages,
    config:best.config,
    recommended:best
  };
}

/* ==========================================
   CRIAÇÃO DE ESTRATÉGIAS
   ========================================== */

function createStrategy(
  recommendation
){

  if(!recommendation)return;

  if(
    recommendation.rule!=="CREATED"||
    !recommendation.config
  ){
    state.manual=null;
    state.activeCreated=null;

    state.strategy=
      recommendation.rule;

    state.rank=
      recommendation.rank;

    refresh();
    return;
  }

  const config={
    ...recommendation.config
  };

  const signature=JSON.stringify(config);

  let existing=state.createdStrategies.find(
    x=>JSON.stringify(x.config)===signature
  );

  if(!existing){

    const id="TREINADOR_"+
      Date.now().toString(36);

    existing={
      id,
      name:"ESTRATÉGIA VIRTUAL "+
        (state.createdStrategies.length+1),
      config,
      createdAt:new Date().toISOString(),
      reference:{
        validTotal:
          recommendation.valid.total,
        validGreen:
          recommendation.valid.green,
        validGale:
          recommendation.valid.gale,
        validLoss:
          recommendation.valid.loss
      }
    };

    state.createdStrategies.push(
      existing
    );
  }

  state.activeCreated=existing.id;
  state.manual=null;
  state.strategy="CREATED";

  refresh();
}

function activeConfig(){

  if(!state.activeCreated){
    return null;
  }

  return state.createdStrategies.find(
    x=>x.id===state.activeCreated
  )?.config||null;
}

/* ==========================================
   INTERFACE ORIGINAL
   HTML E CSS PRESERVADOS
   ========================================== */

const css=`
*{box-sizing:border-box}
body{
  margin:0;
  background:#10151e;
  color:#f3f7fb;
  font-family:Arial,sans-serif;
}
.app{
  max-width:1100px;
  margin:auto;
  padding:12px;
}
h1{
  text-align:center;
  font-size:23px;
  margin:16px 0 5px;
}
.sub{
  text-align:center;
  font-size:11px;
  color:#9cb3c9;
  margin-bottom:18px;
}
.panel{
  background:#1c2634;
  border:1px solid #40546c;
  border-radius:11px;
  padding:12px;
  margin:10px 0;
}
.title{
  color:#32d9f4;
  font-size:12px;
  font-weight:bold;
  margin:12px 0;
}
.row{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  margin:8px 0;
}
.btn{
  background:#304056;
  border:1px solid #69819d;
  border-radius:7px;
  padding:10px;
  color:white;
  font-weight:bold;
  font-size:11px;
  cursor:pointer;
}
.btn.active{
  background:#087f9d;
  border-color:#32d9f4;
}
textarea{
  width:100%;
  height:85px;
  padding:10px;
  border-radius:8px;
  background:#0c1623;
  border:1px solid #62758b;
  color:white;
}
.centers{
  display:grid;
  grid-template-columns:repeat(6,1fr);
  gap:5px;
}
.center{
  padding:13px 2px;
  border:2px solid #20d7f4;
  background:#096a92;
  border-radius:9px;
  text-align:center;
  font-size:22px;
  font-weight:bold;
}
.center.short{
  background:#caa127;
  border-color:#ffe282;
  color:#111;
}
.center small{
  display:block;
  font-size:9px;
  margin-top:5px;
}
.keys{
  display:grid;
  grid-template-columns:repeat(6,1fr);
  gap:5px;
}
.key{
  height:43px;
  border:1px solid #697b8f;
  border-radius:7px;
  color:white;
  font-size:15px;
  font-weight:bold;
  cursor:pointer;
}
.key.zero{grid-column:span 6}
.metrics{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:6px;
}
.metric{
  background:#29384b;
  padding:12px 5px;
  border-radius:8px;
  text-align:center;
}
.metric small{
  display:block;
  font-size:9px;
  color:#b9cad9;
}
.metric b{
  display:block;
  font-size:23px;
  margin-top:6px;
}
.good{color:#4ee2a2}
.bad{color:#ff778c}
.muted{
  font-size:11px;
  color:#afc0d1;
  line-height:1.7;
}
.box{
  background:#111d2a;
  border:1px solid #425a75;
  padding:12px;
  border-radius:9px;
  margin:9px 0;
  font-size:12px;
  line-height:1.7;
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
  cursor:pointer;
}
.hide{display:none}
.history{
  display:flex;
  flex-wrap:wrap;
  gap:5px;
}
.chip{
  padding:8px;
  border:1px solid #718397;
  border-radius:7px;
  min-width:47px;
  text-align:center;
}
.chip b{
  display:block;
  font-size:18px;
}
.chip small{
  font-size:9px;
}
.listrow{
  border-bottom:1px solid #35475b;
  padding:9px 3px;
  font-size:11px;
  line-height:1.7;
}
.tablewrap{overflow:auto}
table{
  width:100%;
  border-collapse:collapse;
  min-width:600px;
  font-size:11px;
}
td,th{
  padding:9px;
  border-bottom:1px solid #40516a;
  text-align:left;
}
th{color:#50d9ee}

/* COMPONENTES ADICIONAIS */

.virtualHero{
  background:#102b3a;
  border:1px solid #1cacc8;
  border-radius:10px;
  padding:14px;
  margin:12px 0;
}
.virtualHero h3{
  margin:0 0 10px;
  color:#54e6ff;
  font-size:15px;
}
.virtualRecommendation{
  background:#102f27;
  border:1px solid #35a981;
  border-radius:10px;
  padding:14px;
  margin:10px 0;
}
.virtualRecommendation h3{
  margin:0 0 10px;
  color:#58edb0;
}
.virtualWarning{
  border-left:3px solid #d9a63c;
  padding:9px;
  background:#2b281f;
  color:#e8d5a6;
  font-size:11px;
  line-height:1.6;
}
.virtualLine{
  padding:8px 0;
  border-bottom:1px solid #355063;
  font-size:12px;
  line-height:1.6;
}
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
  margin:8px 0;
}
.virtualButton.active{
  background:#176eaa;
  border-color:#5fd5ff;
}
.virtualSmall{
  color:#b9d0dd;
  font-size:11px;
  line-height:1.7;
}
`;

document.body.innerHTML=`
<style>${css}</style>

<main class="app">

<h1>ANÁLISE BETA V${VERSION}</h1>

<div class="sub">
  12 MOTORES • 28 COBERTOS •
  TREINADOR ESTRATÉGICO • LABORATÓRIO
</div>

<section class="panel">
  <div class="title">IMPORTAR HISTÓRICO</div>

  <textarea id="paste"
    placeholder="Cole até 200 números, do mais antigo ao mais recente">
  </textarea>

  <div class="row">

    <button class="btn" id="import">
      IMPORTAR E ANALISAR
    </button>

    <button class="btn" id="undo">
      APAGAR ÚLTIMO
    </button>

    <button class="btn" id="clear">
      ZERAR
    </button>

  </div>

  <div class="muted" id="status"></div>
</section>

<section class="panel">

  <div class="title">ESTRATÉGIA ATIVA</div>

  <div class="row" id="strategies"></div>

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

<section class="panel">

  <div class="title">RESULTADO GERAL</div>

  <div id="general"></div>

</section>

<section class="panel">

  <button class="head" data-panel="trainer">
    TREINADOR ESTRATÉGICO
    <span>−</span>
  </button>

  <div id="trainer"></div>

</section>

<section class="panel">

  <button class="head" data-panel="lab">
    LABORATÓRIO DE ESTRATÉGIAS
    <span>−</span>
  </button>

  <div id="lab"></div>

</section>

<section class="panel">

  <button class="head" data-panel="motors">
    12 MOTORES E RANKING
    <span>+</span>
  </button>

  <div id="motors"></div>

</section>

<section class="panel">

  <button class="head" data-panel="timeline">
    RASTREAMENTO GIRO A GIRO
    <span>+</span>
  </button>

  <div id="timeline"></div>

</section>

</main>
`;

/* ==========================================
   BOTÕES ORIGINAIS
   ========================================== */

const STRATEGIES=[
  ["FIXED","AUTO RANKING"],
  ["GEO","MELHOR GEOMETRIA"],
  ["BEST","MELHOR DESEMPENHO"],
  ["STABLE","ESTABILIDADE"],
  ["SWITCH","TROCA INTELIGENTE"],
  ["CONSENSUS","CONSENSO"],
  ["UNION","UNIÃO"]
];

for(const [key,name] of STRATEGIES){

  const b=document.createElement(
    "button"
  );

  b.className="btn";
  b.textContent=name;
  b.dataset.strategy=key;

  b.onclick=()=>{

    state.manual=null;
    state.activeCreated=null;
    state.strategy=key;

    refresh();
  };

  $("strategies").appendChild(b);
}

for(let rank=1;rank<=4;rank++){

  const b=document.createElement(
    "button"
  );

  b.className="btn";
  b.textContent="AUTO "+rank+"º";

  b.onclick=()=>{

    state.manual=null;
    state.activeCreated=null;
    state.strategy="FIXED";
    state.rank=rank;

    refresh();
  };

  $("strategies").appendChild(b);
}

for(const [field,name] of [
  ["g1","G1 AJUSTE FINO"],
  ["galeSkip","GALE 2ª RODADA"],
  ["secondHouse","2ª CASA"]
]){

  const b=document.createElement(
    "button"
  );

  b.className="btn";
  b.dataset.option=field;
  b.textContent=name;

  b.onclick=()=>{

    state[field]=!state[field];

    refresh();
  };

  $("options").appendChild(b);
}

for(const family of FAMILIES){

  for(const radius of RADII){

    const key=family+"_"+radius;

    const b=document.createElement(
      "button"
    );

    b.className="btn";
    b.textContent=key;

    b.onclick=()=>{

      state.manual=key;
      state.activeCreated=null;

      refresh();
    };

    $("motors").appendChild(b);
  }
}

/* ==========================================
   TECLADO ORIGINAL
   ========================================== */

for(let n=0;n<=36;n++){

  const b=document.createElement(
    "button"
  );

  b.className=
    "key"+(n===0?" zero":"");

  b.textContent=n;

  b.style.background=
    n===0
      ?"#087b50"
      :RED.has(n)
        ?"#ac293f"
        :"#12151b";

  b.onclick=()=>{

    state.history.push(n);

    state.sources.push(
      "TEMPO REAL"
    );

    state.history=
      state.history.slice(-MAX);

    state.sources=
      state.sources.slice(-MAX);

    refresh();
  };

  $("keys").appendChild(b);
}

/* ==========================================
   EXPANDIR / RECOLHER
   ========================================== */

for(const b of document.querySelectorAll(
  "[data-panel]"
)){

  b.onclick=()=>{

    const name=b.dataset.panel;

    state.open[name]=
      !state.open[name];

    render();
  };
}

/* ==========================================
   IMPORTAÇÃO
   ========================================== */

$("import").onclick=()=>{

  const raw=$("paste").value;

  const numbers=(
    raw.match(/\d+/g)||[]
  )
  .map(Number)
  .filter(n=>n>=0&&n<=36)
  .slice(-MAX);

  if(!numbers.length){

    alert(
      "Cole números de 0 a 36."
    );

    return;
  }

  state.history=numbers;

  state.sources=numbers.map(
    ()=>"HISTÓRICO"
  );

  $("paste").value="";

  refresh();
};

$("undo").onclick=()=>{

  state.history.pop();
  state.sources.pop();

  refresh();
};

$("clear").onclick=()=>{

  if(
    !confirm(
      "Apagar histórico e análises?"
    )
  )return;

  state=fresh();

  refresh();
};

/* ==========================================
   MÉTRICAS VISUAIS ORIGINAIS
   ========================================== */

function metricHTML(data){

  const m=metrics(data);

  return `
  <div class="metrics">

    <div class="metric">
      <small>DECISÕES FECHADAS</small>
      <b>${m.total}</b>
    </div>

    <div class="metric">
      <small>GREEN</small>
      <b class="good">${m.green}</b>
    </div>

    <div class="metric">
      <small>LOSS</small>
      <b class="bad">${m.loss}</b>
    </div>

    <div class="metric">
      <small>PRECISARAM GALE</small>
      <b>${m.gale}</b>
    </div>

    <div class="metric">
      <small>GREEN %</small>
      <b>${pct(m.green,m.total)}</b>
    </div>

    <div class="metric">
      <small>GALE %</small>
      <b>${pct(m.gale,m.total)}</b>
    </div>

  </div>`;
}

/* ==========================================
   PAINEL DO TREINADOR VIRTUAL
   ========================================== */

function trainerHTML(
  trainer,
  result,
  diagnosis
){

  const track=tracking(result);

  const lastAudit=result.audits.at(-1);

  const ranking=trainer.ranking;

  return `

  <div class="virtualHero">

    <h3>
      TREINADOR ESTRATÉGICO VIRTUAL
    </h3>

    <div class="virtualSmall">
      Auditoria cronológica de todos os
      números, motores, regiões, entradas,
      Gale, LOSS e estratégias alternativas.
    </div>

    <div class="metrics">

      <div class="metric">
        <small>NÚMEROS ANALISADOS</small>
        <b>${trainer.totalNumbers}</b>
      </div>

      <div class="metric">
        <small>MOTORES ANALISADOS</small>
        <b>12</b>
      </div>

      <div class="metric">
        <small>TROCAS DE MOTOR</small>
        <b>${track.switches}</b>
      </div>

      <div class="metric">
        <small>PERMANÊNCIA ATUAL</small>
        <b>${track.streak}</b>
      </div>

      <div class="metric">
        <small>MAIOR PERMANÊNCIA</small>
        <b>${track.maxStreak}</b>
      </div>

      <div class="metric">
        <small>MAIOR PERMANÊNCIA REGIÃO</small>
        <b>${trainer.maxRegionStreak}</b>
      </div>

    </div>

  </div>

  <div class="title">
    DIAGNÓSTICO COMPLETO
  </div>

  <div class="metrics">

    <div class="metric">
      <small>GREEN REGISTRADOS</small>
      <b class="good">
        ${trainer.greenCount}
      </b>
    </div>

    <div class="metric">
      <small>ENTRADAS PARA GALE</small>
      <b>${trainer.galeCount}</b>
    </div>

    <div class="metric">
      <small>LOSS</small>
      <b class="bad">
        ${trainer.lossCount}
      </b>
    </div>

    <div class="metric">
      <small>GIROS DESCOBERTOS</small>
      <b>${trainer.uncovered}</b>
    </div>

    <div class="metric">
      <small>OUTRO MOTOR COBRIA</small>
      <b>${trainer.alternativeHits}</b>
    </div>

    <div class="metric">
      <small>NENHUM MOTOR COBRIA</small>
      <b>${trainer.nobodyCovered}</b>
    </div>

  </div>

  <div class="title">
    CONCLUSÃO DO TREINADOR
  </div>

  <div class="virtualRecommendation">

    <h3>
      ${esc(diagnosis.title)}
    </h3>

    ${diagnosis.messages.map(
      message=>`
        <div class="virtualLine">
          ${esc(message)}
        </div>
      `
    ).join("")}

  </div>

  <div class="title">
    ANÁLISE DE OPORTUNIDADES
  </div>

  ${lastAudit?`

    <div class="box">

      <b>
        ${esc(lastAudit.category)}
      </b>

      <p>
        GIRO ${lastAudit.turn}
        • NÚMERO ${lastAudit.n}
      </p>

      <p>
        MOTOR:
        ${esc(lastAudit.selected)}
      </p>

      <p>
        FASE:
        ${esc(lastAudit.phase)}
      </p>

      <p>
        OUTROS MOTORES QUE COBRIAM:
        ${esc(
          lastAudit.alternatives.join(", ")||
          "NENHUM"
        )}
      </p>

      <p>
        ALTERNATIVA:
        ${esc(lastAudit.best||"NENHUMA")}
      </p>

      <p>
        NÚMEROS QUE ENTRARIAM:
        ${esc(
          lastAudit.added.join(", ")||
          "—"
        )}
      </p>

      <p>
        NÚMEROS QUE SAIRIAM:
        ${esc(
          lastAudit.removed.join(", ")||
          "—"
        )}
      </p>

    </div>

  `:`

    <div class="box">
      Aguardando decisões para auditoria.
    </div>

  `}

  <div class="title">
    RANKING VIRTUAL DOS 12 MOTORES
  </div>

  ${ranking.map(
    (m,i)=>`

      <div class="listrow">

        <b>
          ${i+1}º
          ${esc(m.key)}
        </b>

        <div class="muted">

          ${m.total} giros avaliados

          • ${m.hits} coberturas

          • ${m.misses} descobertos

          • ${pct(m.hits,m.total)}

        </div>

        <div class="muted">

          Maior sequência coberta:
          ${m.maxHits}

          • Maior sequência descoberta:
          ${m.maxMisses}

        </div>

      </div>

    `
  ).join("")}

  <div class="title">
    PERMANÊNCIA POR REGIÃO
  </div>

  ${Object.entries(
    trainer.regions
  ).map(
    ([name,r])=>`

      <div class="listrow">

        <b>${esc(name)}</b>

        • ${r.total} ocorrências

        • maior sequência:
        ${r.longest}

      </div>

    `
  ).join("")}

  <div class="title">
    RASTREAMENTO POR MOTOR ESCOLHIDO
  </div>

  ${Object.entries(
    track.byMotor
  ).map(
    ([key,x])=>`

      <div class="listrow">

        ${esc(key)}

        • ${x.decisions} decisões

        • cobertura direta
        ${pct(
          x.covered,
          x.decisions
        )}

      </div>

    `
  ).join("")}

  <div class="title">
    ÚLTIMAS 20 OPORTUNIDADES
  </div>

  ${result.audits
    .slice(-20)
    .reverse()
    .map(
      x=>`

        <div class="listrow">

          <b>
            ${esc(x.category)}
          </b>

          • GIRO ${x.turn}

          • ${x.n}

          • ${esc(x.selected)}

          <div class="muted">

            Alternativas:
            ${esc(
              x.alternatives.join(", ")||
              "nenhuma"
            )}

          </div>

        </div>

      `
    ).join("")}

  <div class="virtualWarning">

    Uma estratégia pode acertar muitos
    números no histórico e falhar em
    novos giros. Os resultados da
    auditoria não significam que o
    próximo sorteio seja previsível.

  </div>

  `;
}

/* ==========================================
   PAINEL LABORATÓRIO
   ========================================== */

function laboratoryHTML(
  lab,
  diagnosis
){

  const recommendation=
    lab.recommendation;

  const baseline=lab.baseline;

  const generated=lab.generated;

  return `

  <div class="box">

    <b>
      ${esc(lab.status)}
    </b>

    <p class="muted">

      O treinador testa estratégias
      existentes e configurações
      adaptativas usando somente os
      giros anteriores a cada decisão.

      Os primeiros 65% do histórico
      compõem o desenvolvimento.

      Os últimos 35% são usados
      para comparação fora do
      desenvolvimento.

      A escolha final entre muitas
      configurações continua sendo
      exploratória.

    </p>

  </div>

  ${recommendation?`

    <div class="virtualRecommendation">

      <h3>
        ESTRATÉGIA RECOMENDADA
      </h3>

      <b>
        ${esc(recommendation.name)}
      </b>

      <div class="virtualLine">

        GREEN NA VALIDAÇÃO:

        <b>
          ${pct(
            recommendation.valid.green,
            recommendation.valid.total
          )}
        </b>

      </div>

      <div class="virtualLine">

        GREEN:
        ${recommendation.valid.green}

        • GALE:
        ${recommendation.valid.gale}

        • LOSS:
        ${recommendation.valid.loss}

      </div>

      <div class="virtualLine">

        CICLOS:
        ${recommendation.valid.total}

      </div>

      ${recommendation.config?`

        <div class="virtualLine">

          JANELA:
          ${recommendation.config.window}
          giros

        </div>

        <div class="virtualLine">

          VANTAGEM PARA TROCA:
          ${fmt(
            recommendation.config.margin*100
          )}
          pontos percentuais

        </div>

        <div class="virtualLine">

          AMOSTRA MÍNIMA:
          ${recommendation.config.minSamples}

        </div>

        <div class="virtualLine">

          MOTORES ELEGÍVEIS:
          ${recommendation.config.maxRank}

        </div>

        <div class="virtualLine">

          ANTECIPAR TROCA POR FALHAS:
          ${recommendation.config.switchAfterLoss
            ?"SIM"
            :"NÃO"}

        </div>

      `:""}

      <button
        class="virtualButton"
        id="createRecommended"
      >

        ${recommendation.config
          ?"CRIAR E ATIVAR ESTRATÉGIA"
          :"ATIVAR ESTRATÉGIA EXISTENTE"}

      </button>

      <div class="virtualSmall">

        A ativação usa a regra
        calculada antes de cada
        novo resultado.

        O desempenho anterior não
        garante resultados futuros.

      </div>

    </div>

  `:""}

  ${baseline?`

    <div class="box">

      <div class="title">
        REFERÊNCIA AUTO 3º
      </div>

      GREEN:
      ${baseline.valid.green}

      • GALE:
      ${baseline.valid.gale}

      • LOSS:
      ${baseline.valid.loss}

      • TAXA:
      ${pct(
        baseline.valid.green,
        baseline.valid.total
      )}

    </div>

  `:""}

  <div class="title">
    TODAS AS ESTRATÉGIAS TESTADAS
  </div>

  <div class="tablewrap">

    <table>

      <thead>

        <tr>

          <th>ESTRATÉGIA</th>
          <th>DESENV.</th>
          <th>VALIDAÇÃO</th>
          <th>GALE</th>
          <th>LOSS</th>
          <th>CICLOS</th>

        </tr>

      </thead>

      <tbody>

        ${lab.rows.map(
          x=>`

            <tr>

              <td>
                ${esc(x.name)}
              </td>

              <td>
                ${pct(
                  x.train.green,
                  x.train.total
                )}
              </td>

              <td>
                ${pct(
                  x.valid.green,
                  x.valid.total
                )}
              </td>

              <td>
                ${x.valid.gale}
              </td>

              <td>
                ${x.valid.loss}
              </td>

              <td>
                ${x.valid.total}
              </td>

            </tr>

          `
        ).join("")}

      </tbody>

    </table>

  </div>

  <div class="title">
    ESTRATÉGIAS CRIADAS PELO TREINADOR
  </div>

  <div id="createdStrategies">

    ${state.createdStrategies.length
      ?state.createdStrategies.map(
        x=>`

          <button
            class="virtualButton ${
              state.activeCreated===x.id
                ?"active"
                :""
            }"
            data-created="${esc(x.id)}"
          >

            ${esc(x.name)}

            • JANELA
            ${x.config.window}

            • TROCA
            ${fmt(x.config.margin*100)}%

            ${state.activeCreated===x.id
              ?" • ATIVA"
              :""}

          </button>

        `
      ).join("")
      :`

        <div class="box">

          Nenhuma estratégia
          personalizada criada ainda.

        </div>

      `}

  </div>

  <div class="virtualWarning">

    O laboratório compara configurações,
    mas não pode eliminar a vantagem
    matemática da casa nem garantir
    que uma regra vencedora no
    backtest continue vencedora.

  </div>

  `;
}

/* ==========================================
   RENDERIZAÇÃO PRINCIPAL
   ========================================== */

function render(){

  const history=state.history;
  const sources=state.sources;

  const frames=buildFrames(
    history
  );

  const rule=state.manual
    ?"MANUAL"
    :state.strategy;

  const config=rule==="CREATED"
    ?activeConfig()
    :null;

  const result=simulate(
    history,
    sources,
    rule,
    state.rank,
    optionsNow(),
    config,
    frames
  );

  const cs=frames.at(-1)?.candidates||[];

  const selected=choose(
    cs,
    result.allRecords,
    rule,
    state.rank,
    result.previous,
    config
  );

  const play=
    result.current?.play||
    selected?.play||
    null;

  $("status").textContent=
    history.length+
    "/200 números • "+
    cs.length+
    "/12 motores disponíveis • "+
    result.phase;

  for(const b of document.querySelectorAll(
    "[data-strategy]"
  )){

    b.classList.toggle(
      "active",
      !state.manual&&
      !state.activeCreated&&
      b.dataset.strategy===state.strategy
    );
  }

  for(const b of document.querySelectorAll(
    "[data-option]"
  )){

    b.classList.toggle(
      "active",
      !!state[b.dataset.option]
    );
  }

  $("selected").textContent=
    (
      state.manual||
      (
        state.activeCreated
          ?state.createdStrategies.find(
            x=>x.id===state.activeCreated
          )?.name
          :state.strategy
      )||
      state.strategy
    )+
    " • "+
    (selected?.key||"AGUARDANDO")+
    " • "+
    result.phase;

  $("centers").innerHTML=play
    ?play.blocks.map(
      b=>`

        <div class="center ${
          b.radius===1
            ?"short"
            :""
        }">

          ${b.center}

          <small>

            ${sector(b.center)}
            • ${b.radius}V

          </small>

        </div>

      `
    ).join("")
    :"";

  $("coverage").textContent=play
    ?"28 NÚMEROS COBERTOS • 9 DESCOBERTOS"
    :"Importe pelo menos 8 números.";

  $("last").innerHTML=result.entries
    .slice(-14)
    .reverse()
    .map(
      x=>`

        <div class="chip" style="
          background:${
            x.n===0
              ?"#087b50"
              :RED.has(x.n)
                ?"#a72740"
                :"#14181f"
          }">

          <b>${x.n}</b>

          <small>
            ${esc(x.label)}
          </small>

        </div>

      `
    ).join("");

  const historical=result.cycles.filter(
    x=>x.source==="HISTÓRICO"
  );

  const live=result.cycles.filter(
    x=>x.source==="TEMPO REAL"
  );

  $("general").innerHTML=`

    <div class="title">
      HISTÓRICO
    </div>

    ${metricHTML(historical)}

    <div class="title">
      TEMPO REAL
    </div>

    ${metricHTML(live)}

    <div class="title">
      TOTAL ACUMULADO
    </div>

    ${metricHTML(result.cycles)}

  `;

  /* ======================================
     TREINADOR VIRTUAL
     ====================================== */

  const trainer=virtualTrainer(
    history,
    result,
    frames
  );

  /* ======================================
     LABORATÓRIO
     ====================================== */

  const lab=laboratory(
    history,
    frames
  );

  const diagnosis=strategicDiagnosis(
    lab,
    trainer
  );

  $("trainer").innerHTML=trainerHTML(
    trainer,
    result,
    diagnosis
  );

  $("lab").innerHTML=laboratoryHTML(
    lab,
    diagnosis
  );

  /* ======================================
     CRIAR E ATIVAR ESTRATÉGIA
     ====================================== */

  const createButton=$(
    "createRecommended"
  );

  if(
    createButton&&
    lab.recommendation
  ){

    createButton.onclick=()=>{

      createStrategy(
        lab.recommendation
      );
    };
  }

  for(const b of document.querySelectorAll(
    "[data-created]"
  )){

    b.onclick=()=>{

      const id=b.dataset.created;

      const found=
        state.createdStrategies.find(
          x=>x.id===id
        );

      if(!found)return;

      state.activeCreated=id;
      state.manual=null;
      state.strategy="CREATED";

      refresh();
    };
  }

  /* ======================================
     RANKING ORIGINAL
     ====================================== */

  $("motors").querySelectorAll(
    ".listrow"
  ).forEach(
    x=>x.remove()
  );

  $("motors").insertAdjacentHTML(
    "beforeend",

    cs.map(
      c=>`

        <div class="listrow">

          <b>
            ${c.rank}º
          </b>

          • ${esc(c.key)}

          • SCORE
          ${fmt(c.score)}

          <div class="muted">

            ${c.play.centers5.join(", ")}

            + ${c.play.center3}

          </div>

        </div>

      `
    ).join("")
  );

  /* ======================================
     LINHA DO TEMPO ORIGINAL
     ====================================== */

  $("timeline").innerHTML=
    result.entries
      .slice(-80)
      .reverse()
      .map(
        x=>`

          <div class="listrow">

            GIRO ${x.turn}

            • ${x.n}

            • ${esc(x.label)}

            • ${esc(x.selected)}

            • ${esc(x.region)}

            • ${esc(x.source)}

            <div class="muted">

              FASE:
              ${esc(x.phase)}

              • COBERTURA:
              ${x.covered
                ?"SIM"
                :"NÃO"}

              • ALTERNATIVAS:
              ${esc(
                x.alternatives.join(", ")||
                "NENHUMA"
              )}

            </div>

          </div>

        `
      ).join("");

  /* ======================================
     EXPANSÃO ORIGINAL
     ====================================== */

  for(const [name,open] of Object.entries(
    state.open
  )){

    const element=$(name);

    const button=document.querySelector(
      '[data-panel="'+name+'"]'
    );

    if(element){

      element.classList.toggle(
        "hide",
        !open
      );
    }

    if(button){

      button.querySelector(
        "span"
      ).textContent=
        open?"−":"+";
    }
  }

  save();
}

function refresh(){
  render();
}

/* ==========================================
   INICIALIZAÇÃO
   ========================================== */

render();

})();
