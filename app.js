
(() => {
"use strict";

/*
 ANÁLISE BETA V5.7

 BASE PRESERVADA:
 - HTML e identidade visual
 - 12 motores
 - Geometria de 28 números
 - Estratégias originais
 - Teclado 0–36
 - Histórico de 200 números
 - GREEN / GALE / LOSS
 - Treinador e laboratório
 - Ranking e linha do tempo

 NOVO:
 - Botão TREINADOR ESTRATÉGICO
 - Treinador escolhe automaticamente a
   configuração recomendada
 - 12 estratégias adaptativas nos botões
 - Cada adaptativa pode ser ativada sozinha
 - Estratégias criadas permanecem disponíveis
 - Resultado geral expansível
 - Ranking virtual expansível
 - Oportunidades expansíveis
 - Plano de cobertura expansível
 - Comparações expansíveis
 - Cache de cálculos e renderização
 - Análise cronológica sem antecipar resultados

 AVISO:
 A melhor configuração observada no
 histórico não garante acertos futuros.
*/

const VERSION="5.7";
const KEY="ANALISE_BETA_V55_COMPLETO";
const MAX=200;

const W=[
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

const RED=new Set([
  1,3,5,7,9,12,14,16,18,
  19,21,23,25,27,30,32,34,36
]);

const SECTORS={
  TIERS:[27,13,36,11,30,8,23,10,5,24,16,33],
  ORFAOS:[17,34,6,1,20,14,31,9],
  VOISINS:[22,18,29,7,25,2,21,4,19],
  ZERO:[28,12,35,3,26,0,32,15]
};

const FAMILIES=[
  "NORMAL",
  "DINAMICO",
  "RX_NORMAL",
  "RX_DINAMICO"
];

const RADII=[4,5,6];

const $=id=>document.getElementById(id);
const mod=n=>(n%37+37)%37;
const index=n=>W.indexOf(n);

const fmt=n=>Number.isFinite(n)
  ?n.toFixed(1).replace(".",",")
  :"—";

const pct=(a,b)=>b
  ?fmt(100*a/b)+"%"
  :"—";

const esc=x=>String(x??"").replace(
  /[&<>"']/g,
  c=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c])
);

function sector(n){
  return Object.keys(SECTORS).find(
    k=>SECTORS[k].includes(n)
  )||"—";
}

function distance(a,b){
  const d=Math.abs(index(a)-index(b));
  return Math.min(d,37-d);
}

/* ======================================
   ESTADO
====================================== */

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
    activeAdaptive:null,
    activeCreated:null,
    createdStrategies:[],
    open:{
      general:true,
      trainer:true,
      lab:true,
      motors:false,
      timeline:false,
      virtualRanking:false,
      opportunities:false,
      coveragePlan:false,
      comparisons:false,
      created:false
    }
  };
}

let state=fresh();

try{
  const old=JSON.parse(
    localStorage.getItem(KEY)||"null"
  );

  if(old){
    state={
      ...fresh(),
      ...old,
      open:{
        ...fresh().open,
        ...(old.open||{})
      },
      createdStrategies:
        Array.isArray(old.createdStrategies)
          ?old.createdStrategies
          :[]
    };
  }
}catch(e){}

function save(){
  try{
    localStorage.setItem(
      KEY,
      JSON.stringify(state)
    );
  }catch(e){}
}

/* ======================================
   CONFIGURAÇÕES ADAPTATIVAS

   Todas aparecem nos botões.
====================================== */

const ADAPTATIVES=[
  {
    id:"A01",
    name:"ADAPTATIVA 01",
    window:10,
    margin:.05,
    minSamples:6,
    persistence:3,
    maxRank:12,
    lossPenalty:0,
    consensus:0,
    recentWeight:0,
    switchAfterLoss:false
  },
  {
    id:"A02",
    name:"ADAPTATIVA 02",
    window:10,
    margin:.10,
    minSamples:6,
    persistence:3,
    maxRank:12,
    lossPenalty:0,
    consensus:0,
    recentWeight:0,
    switchAfterLoss:false
  },
  {
    id:"A03",
    name:"ADAPTATIVA 03",
    window:10,
    margin:.15,
    minSamples:6,
    persistence:3,
    maxRank:12,
    lossPenalty:0,
    consensus:0,
    recentWeight:0,
    switchAfterLoss:false
  },
  {
    id:"A04",
    name:"ADAPTATIVA 04",
    window:20,
    margin:.05,
    minSamples:10,
    persistence:3,
    maxRank:12,
    lossPenalty:0,
    consensus:0,
    recentWeight:0,
    switchAfterLoss:false
  },
  {
    id:"A05",
    name:"ADAPTATIVA 05",
    window:20,
    margin:.10,
    minSamples:10,
    persistence:3,
    maxRank:12,
    lossPenalty:0,
    consensus:0,
    recentWeight:0,
    switchAfterLoss:false
  },
  {
    id:"A06",
    name:"ADAPTATIVA 06",
    window:20,
    margin:.15,
    minSamples:10,
    persistence:3,
    maxRank:12,
    lossPenalty:0,
    consensus:0,
    recentWeight:0,
    switchAfterLoss:false
  },
  {
    id:"A07",
    name:"ADAPTATIVA 07",
    window:30,
    margin:.05,
    minSamples:12,
    persistence:3,
    maxRank:12,
    lossPenalty:0,
    consensus:0,
    recentWeight:0,
    switchAfterLoss:false
  },
  {
    id:"A08",
    name:"ADAPTATIVA 08",
    window:30,
    margin:.10,
    minSamples:12,
    persistence:3,
    maxRank:12,
    lossPenalty:0,
    consensus:0,
    recentWeight:0,
    switchAfterLoss:false
  },
  {
    id:"A09",
    name:"ADAPTATIVA 09",
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
    id:"A10",
    name:"ADAPTATIVA 10",
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
    id:"A11",
    name:"ADAPTATIVA 11",
    window:20,
    margin:.10,
    minSamples:10,
    persistence:3,
    maxRank:4,
    lossPenalty:.03,
    consensus:.05,
    recentWeight:.5,
    switchAfterLoss:true
  },
  {
    id:"A12",
    name:"ADAPTATIVA 12",
    window:30,
    margin:.08,
    minSamples:12,
    persistence:2,
    maxRank:8,
    lossPenalty:.015,
    consensus:.08,
    recentWeight:.35,
    switchAfterLoss:true
  }
];

/* ======================================
   12 MOTORES ORIGINAIS
====================================== */

function motorWeights(history,family,radius){

  const weights=Array(37).fill(.01);
  const recent=history.slice(-60);

  for(let k=0;k<recent.length;k++){

    const n=recent[recent.length-1-k];
    const decay=Math.exp(-k/(radius*2.3));

    for(let j=0;j<37;j++){

      const d=distance(n,W[j]);

      if(d<=6){
        weights[j]+=decay*(7-d)/7;
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
          weights[j]+=(4-d)/(k+2)*1.7;
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

      matches.sort((a,b)=>b.score-a.score);

      const selected=matches.slice(
        0,
        Math.max(
          3,
          Math.ceil(matches.length*.2)
        )
      );

      for(const match of selected){

        for(let j=0;j<37;j++){

          const d=distance(match.next,W[j]);

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

/* ======================================
   GEOMETRIA ORIGINAL
   5 CENTROS ±2
   1 CENTRO ±1
   TOTAL 28
====================================== */

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
            ?{score:0,gaps:[]}
            :null;
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

        for(let gap=0;gap<=9-g;gap++){

          if(gap===1)continue;

          const next=solve(k+1,g+gap);

          if(!next)continue;

          const score=value+next.score;

          if(!winner||score>winner.score){
            winner={
              score,
              gaps:[gap,...next.gaps]
            };
          }
        }

        memo.set(key,winner);
        return winner;
      }

      const result=solve(0,0);

      if(!result)continue;

      if(best&&result.score<=best.score){
        continue;
      }

      let cursor=start;
      const centers5=[];
      let center3=null;
      const blocks=[];

      for(let k=0;k<6;k++){

        const size=sizes[k];

        const centerIndex=mod(
          cursor+Math.floor(size/2)
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

        cursor+=size+result.gaps[k];
      }

      const numbers=blocks.flatMap(
        x=>x.numbers
      );

      if(new Set(numbers).size!==28){
        continue;
      }

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

  result.sort((a,b)=>b.score-a.score);

  result.forEach((c,i)=>{
    c.rank=i+1;
  });

  return result;
}

/* ======================================
   CACHE DOS MOTORES

   Evita calcular os 12 motores
   repetidamente para cada estratégia.
====================================== */

let frameCache={
  signature:null,
  frames:[]
};

function buildFrames(history){

  const signature=history.join(",");

  if(frameCache.signature===signature){
    return frameCache.frames;
  }

  const frames=[];

  for(let i=0;i<=history.length;i++){

    frames.push({
      turn:i+1,
      candidates:candidates(
        history.slice(0,i)
      ),
      result:
        i<history.length
          ?history[i]
          :null
    });
  }

  frameCache={
    signature,
    frames
  };

  return frames;
}

/* ======================================
   ESTATÍSTICA VIRTUAL
====================================== */

function previousStats(key,records,window=20){

  const past=records.filter(
    r=>r.candidates.some(
      c=>c.key===key
    )
  ).slice(-window);

  let hits=0;

  for(const r of past){

    const c=r.candidates.find(
      x=>x.key===key
    );

    if(c.play.numbers.includes(r.n)){
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

/* ======================================
   MOTOR ADAPTATIVO
====================================== */

function adaptiveChoose(
  cs,
  records,
  previous,
  config
){

  if(!cs.length)return null;

  const {
    window=20,
    minSamples=10,
    margin=.10,
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

  if(!eligible.length)return cs[0];

  const ranked=eligible.map(c=>{

    const stats=previousStats(
      c.key,
      records,
      window
    );

    let score=stats.total>=minSamples
      ?stats.rate
      :.5;

    if(recentWeight){

      const short=previousStats(
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

      const misses=records
        .slice(-5)
        .filter(r=>{

          const old=r.candidates.find(
            x=>x.key===c.key
          );

          return old&&
            !old.play.numbers.includes(r.n);
        }).length;

      score-=misses*lossPenalty;
    }

    if(consensus){

      let votes=0;

      for(const n of c.play.numbers){

        votes+=cs.filter(
          x=>x.play.numbers.includes(n)
        ).length;
      }

      score+=
        consensus*
        votes/(28*cs.length);
    }

    return {
      c,
      score,
      stats
    };
  });

  ranked.sort(
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

  if(old.c.key===best.c.key){
    return old.c;
  }

  if(switchAfterLoss){

    const recent=records.slice(-persistence);

    if(recent.length===persistence){

      const failures=recent.every(r=>{

        const c=r.candidates.find(
          x=>x.key===previous
        );

        return c&&
          !c.play.numbers.includes(r.n);
      });

      if(failures){
        return best.c;
      }
    }
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

/* ======================================
   ESCOLHA DAS ESTRATÉGIAS

   TREINADOR:
   usa a configuração selecionada
   pelo laboratório.

   ADAPTATIVA:
   usa apenas sua própria regra.
====================================== */

function choose(
  cs,
  records,
  rule,
  rank=3,
  previous=null,
  config=null,
  manualKey=null
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
      x=>x.key===(manualKey||state.manual)
    )||fixed;
  }

  if(
    rule==="ADAPTIVE"||
    rule==="CREATED"
  ){

    return adaptiveChoose(
      cs,
      records,
      previous,
      config||ADAPTATIVES[0]
    );
  }

  if(rule==="FIXED")return fixed;

  if(rule==="GEO")return cs[0];

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

    const selected=rule==="UNION"
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

/* ======================================
   SNAPSHOT
====================================== */

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
      centers5:[...c.play.centers5],
      center3:c.play.center3,
      numbers:[...c.play.numbers],
      blocks:c.play.blocks.map(b=>({
        center:b.center,
        radius:b.radius,
        numbers:[...b.numbers]
      }))
    }
  };
}

/* ======================================
   GALE ORIGINAL
====================================== */

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

/* ======================================
   SIMULAÇÃO CRONOLÓGICA
====================================== */

function simulate(
  history,
  sources,
  rule,
  rank=3,
  options={},
  config=null,
  frames=null,
  manualKey=null
){

  frames=frames||buildFrames(history);

  const records=[];
  const cycles=[];
  const entries=[];
  const audits=[];
  const allRecords=[];

  let phase="ENTRY";
  let frozen=null;
  let previous=null;

  let activeSource="HISTÓRICO";
  let activeCycle=null;
  let activeMotor=null;

  for(let i=0;i<history.length;i++){

    const n=history[i];
    const cs=frames[i].candidates;

    const selected=choose(
      cs,
      allRecords,
      rule,
      rank,
      previous,
      config,
      manualKey
    );

    const selectedSnap=snapshot(selected);

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

    const actual=frozen||selectedSnap;

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

      previous=selected.key;

      activeMotor=selectedSnap;
      activeSource=source;
      activeCycle=i+1;

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
    }

    const alternatives=cs.filter(
      c=>c.play.numbers.includes(n)
    );

    if(play&&!covered){

      const ranked=alternatives.map(c=>({
        c,
        stats:previousStats(
          c.key,
          allRecords,
          20
        )
      })).sort(
        (a,b)=>
          (b.stats.rate??-1)-
          (a.stats.rate??-1)
      );

      const best=ranked[0]?.c||null;

      const selectedStats=selected
        ?previousStats(
          selected.key,
          allRecords,
          20
        )
        :null;

      let category="LACUNA DE COBERTURA";

      if(alternatives.length){
        category="OPORTUNIDADE RETROSPECTIVA";
      }

      if(
        best&&
        selectedStats&&
        ranked[0].stats.total>=12&&
        selectedStats.total>=12&&
        ranked[0].stats.rate>
          selectedStats.rate+.10
      ){
        category="MELHORIA CANDIDATA";
      }

      audits.push({
        turn:i+1,
        n,
        phase:beforePhase,
        selected:actual.key,
        category,
        alternatives:
          alternatives.map(c=>c.key),
        best:best?.key||null,
        removed:best
          ?play.numbers.filter(
            x=>!best.play.numbers.includes(x)
          )
          :[],
        added:best
          ?best.play.numbers.filter(
            x=>!play.numbers.includes(x)
          )
          :[]
      });
    }

    entries.push({
      turn:i+1,
      n,
      label,
      selected:actual?.key||"—",
      region:sector(n),
      source,
      phase:beforePhase,
      covered,
      alternatives:
        alternatives.map(c=>c.key)
    });

    allRecords.push(decision);
  }

  return {
    records,
    cycles,
    entries,
    audits,
    allRecords,
    phase,
    current:frozen,
    previous
  };
}

/* ======================================
   MÉTRICAS
====================================== */

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

      if(last!==null)switches++;

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

/* ======================================
   TREINADOR VIRTUAL
====================================== */

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

  for(const name of Object.keys(SECTORS)){

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

    if(
      entry?.selected&&
      entry.selected!=="—"
    ){

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

    if(
      entry?.label==="GREEN"||
      entry?.label==="GREEN G1"
    ){

      greenCount++;

      successes.push({
        turn:i+1,
        n,
        motor:entry.selected,
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

      const alternatives=frame.candidates.filter(
        c=>c.play.numbers.includes(n)
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

  return {
    totalNumbers:history.length,
    greenCount,
    galeCount,
    lossCount,
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

/* ======================================
   LABORATÓRIO
====================================== */

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
    train,
    valid,
    total
  };
}

let labCache={
  signature:null,
  data:null
};

function laboratory(history,frames){

  if(history.length<30){

    return {
      status:"HISTÓRICO INSUFICIENTE",
      rows:[],
      recommendation:null,
      baseline:null
    };
  }

  const signature=[
    history.join(","),
    state.g1,
    state.galeSkip,
    state.secondHouse
  ].join("|");

  if(labCache.signature===signature){
    return labCache.data;
  }

  const sources=history.map(
    ()=>"HISTÓRICO"
  );

  const rows=[];

  for(const [rule,rank,name] of RULES){

    rows.push({
      rule,
      rank,
      name,
      config:null,
      ...evaluateStrategy(
        history,
        sources,
        rule,
        rank,
        null,
        frames
      )
    });
  }

  for(const config of ADAPTATIVES){

    rows.push({
      rule:"ADAPTIVE",
      rank:3,
      name:config.name,
      config,
      ...evaluateStrategy(
        history,
        sources,
        "ADAPTIVE",
        3,
        config,
        frames
      )
    });
  }

  for(const created of state.createdStrategies){

    rows.push({
      rule:"CREATED",
      rank:3,
      name:created.name,
      config:created.config,
      createdId:created.id,
      ...evaluateStrategy(
        history,
        sources,
        "CREATED",
        3,
        created.config,
        frames
      )
    });
  }

  const baseline=rows.find(
    x=>
      x.rule==="FIXED"&&
      x.rank===3
  );

  rows.sort(
    (a,b)=>
      (b.valid.rate??-1)-
      (a.valid.rate??-1)||
      a.valid.loss-b.valid.loss||
      b.valid.total-a.valid.total
  );

  const eligible=rows.filter(
    x=>x.valid.total>=8
  );

  const recommendation=
    eligible[0]||null;

  const data={
    status:recommendation
      ?"COMPARAÇÃO HISTÓRICA CONCLUÍDA"
      :"AMOSTRA INSUFICIENTE",
    rows,
    recommendation,
    baseline
  };

  labCache={
    signature,
    data
  };

  return data;
}

/* ======================================
   TREINADOR AUTOMÁTICO

   A recomendação é aprendida
   no histórico disponível.

   Ao ativar TREINADOR, o motor
   selecionado passa a usar a regra
   recomendada, e não o número
   futuro.

   A escolha de parâmetros a partir
   da validação é exploratória.
====================================== */

function trainerRule(lab){

  const rec=lab?.recommendation;

  if(!rec){
    return {
      rule:"FIXED",
      rank:state.rank,
      config:null,
      name:"AUTO RANKING"
    };
  }

  return {
    rule:rec.rule,
    rank:rec.rank,
    config:rec.config,
    name:rec.name
  };
}

function strategicDiagnosis(lab,trainer){

  if(!lab.recommendation){

    return {
      title:"AGUARDANDO MAIS DADOS",
      messages:[
        "Importe mais números para comparar estratégias."
      ]
    };
  }

  const best=lab.recommendation;
  const baseline=lab.baseline;

  const messages=[];

  messages.push(
    "Foram analisados "+
    trainer.totalNumbers+
    " números e "+
    lab.rows.length+
    " configurações."
  );

  messages.push(
    "Melhor resultado observado na comparação: "+
    best.name+
    ", com "+
    pct(
      best.valid.green,
      best.valid.total
    )+
    " em "+
    best.valid.total+
    " ciclos de validação."
  );

  if(baseline){

    messages.push(
      "AUTO 3º: "+
      pct(
        baseline.valid.green,
        baseline.valid.total
      )+
      " na mesma etapa."
    );
  }

  messages.push(
    "Foram encontrados "+
    trainer.alternativeHits+
    " giros descobertos nos quais outro motor cobria o resultado."
  );

  messages.push(
    "Em "+
    trainer.nobodyCovered+
    " giros descobertos, nenhum dos 12 motores cobria o número."
  );

  if(best.config){

    messages.push(
      "Regra: janela de "+
      best.config.window+
      " giros, amostra mínima de "+
      best.config.minSamples+
      " e margem de troca de "+
      fmt(best.config.margin*100)+
      " pontos percentuais."
    );

    messages.push(
      "Escolher entre os "+
      best.config.maxRank+
      " primeiros motores elegíveis."
    );

    if(best.config.switchAfterLoss){

      messages.push(
        "Antecipar a troca após "+
        best.config.persistence+
        " falhas consecutivas do motor mantido."
      );
    }
  }

  messages.push(
    "O botão TREINADOR ESTRATÉGICO usa essa regra automaticamente. A comparação histórica não garante vantagem futura."
  );

  return {
    title:best.name,
    messages
  };
}

/* ======================================
   IDENTIFICAR REGRA ATIVA
====================================== */

function activeRule(lab){

  if(state.manual){

    return {
      rule:"MANUAL",
      rank:state.rank,
      config:null,
      name:state.manual
    };
  }

  if(state.strategy==="TRAINER"){

    return trainerRule(lab);
  }

  if(state.strategy==="ADAPTIVE"){

    const config=ADAPTATIVES.find(
      x=>x.id===state.activeAdaptive
    )||ADAPTATIVES[0];

    return {
      rule:"ADAPTIVE",
      rank:3,
      config,
      name:config.name
    };
  }

  if(state.strategy==="CREATED"){

    const created=state.createdStrategies.find(
      x=>x.id===state.activeCreated
    );

    if(created){

      return {
        rule:"CREATED",
        rank:3,
        config:created.config,
        name:created.name
      };
    }
  }

  return {
    rule:state.strategy,
    rank:state.rank,
    config:null,
    name:state.strategy
  };
}

/* ======================================
   CRIAR E ATIVAR
====================================== */

function activateRecommendation(rec){

  if(!rec)return;

  state.manual=null;
  state.activeCreated=null;
  state.activeAdaptive=null;

  if(rec.rule==="ADAPTIVE"){

    state.strategy="ADAPTIVE";
    state.activeAdaptive=rec.config.id;

  }else if(rec.rule==="CREATED"){

    state.strategy="CREATED";
    state.activeCreated=rec.createdId;

  }else{

    state.strategy=rec.rule;
    state.rank=rec.rank;
  }

  refresh();
}

function createStrategy(rec){

  if(!rec||!rec.config)return;

  const signature=JSON.stringify({
    ...rec.config,
    id:undefined,
    name:undefined
  });

  let existing=state.createdStrategies.find(
    x=>JSON.stringify({
      ...x.config,
      id:undefined,
      name:undefined
    })===signature
  );

  if(!existing){

    existing={
      id:"VIRTUAL_"+Date.now(),
      name:"ESTRATÉGIA VIRTUAL "+
        (state.createdStrategies.length+1),
      config:{...rec.config}
    };

    state.createdStrategies.push(existing);
  }

  state.manual=null;
  state.activeAdaptive=null;
  state.activeCreated=existing.id;
  state.strategy="CREATED";

  labCache.signature=null;

  refresh();
}

/* ======================================
   CSS ORIGINAL + EXPANSÃO
====================================== */

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
.virtualHero{
  background:#102b3a;
  border:1px solid #1cacc8;
  border-radius:10px;
  padding:14px;
  margin:12px 0;
}
.virtualRecommendation{
  background:#102f27;
  border:1px solid #35a981;
  border-radius:10px;
  padding:14px;
  margin:10px 0;
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
}
.virtualWarning{
  border-left:3px solid #d9a63c;
  padding:9px;
  background:#2b281f;
  color:#e8d5a6;
  font-size:11px;
  line-height:1.6;
}
.miniHead{
  display:flex;
  justify-content:space-between;
  width:100%;
  margin:10px 0 0;
  padding:11px;
  background:#24364b;
  border:1px solid #4c6985;
  border-radius:8px;
  color:#d6eafa;
  font-size:11px;
  font-weight:bold;
  cursor:pointer;
}
.miniContent{
  padding:8px 2px;
}
.strategyGroup{
  margin-top:12px;
  padding-top:8px;
  border-top:1px solid #34485e;
}
.strategyLabel{
  font-size:10px;
  color:#7fe1f3;
  font-weight:bold;
  margin:8px 0;
}
.trainerActive{
  background:#0d896c!important;
  border-color:#69ffcf!important;
}
.loading{
  color:#83d9e8;
  font-size:11px;
  padding:8px;
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

  <button class="head" data-panel="general">
    RESULTADO GERAL
    <span>−</span>
  </button>

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

/* ======================================
   BOTÕES DE ESTRATÉGIAS
====================================== */

const STRATEGIES=[
  ["FIXED","AUTO RANKING"],
  ["GEO","MELHOR GEOMETRIA"],
  ["BEST","MELHOR DESEMPENHO"],
  ["STABLE","ESTABILIDADE"],
  ["SWITCH","TROCA INTELIGENTE"],
  ["CONSENSUS","CONSENSO"],
  ["UNION","UNIÃO"]
];

function strategyButton(
  label,
  callback,
  group,
  extraClass=""
){

  const b=document.createElement("button");

  b.className="btn "+extraClass;
  b.textContent=label;
  b.onclick=callback;

  group.appendChild(b);

  return b;
}

function buildStrategyButtons(){

  const root=$("strategies");

  root.innerHTML="";

  const trainerGroup=document.createElement("div");
  trainerGroup.className="strategyGroup";
  trainerGroup.style.width="100%";

  trainerGroup.innerHTML=`
    <div class="strategyLabel">
      TREINADOR AUTOMÁTICO
    </div>
  `;

  const trainerButton=strategyButton(
    "TREINADOR ESTRATÉGICO",
    ()=>{

      state.manual=null;
      state.activeAdaptive=null;
      state.activeCreated=null;
      state.strategy="TRAINER";

      refresh();
    },
    trainerGroup,
    "trainerActive"
  );

  trainerButton.dataset.trainer="1";

  root.appendChild(trainerGroup);

  const originals=document.createElement("div");

  originals.className="strategyGroup";
  originals.style.width="100%";

  originals.innerHTML=`
    <div class="strategyLabel">
      ESTRATÉGIAS ORIGINAIS
    </div>
  `;

  const originalRow=document.createElement("div");
  originalRow.className="row";

  for(const [key,name] of STRATEGIES){

    const b=strategyButton(
      name,
      ()=>{

        state.manual=null;
        state.activeAdaptive=null;
        state.activeCreated=null;
        state.strategy=key;

        refresh();
      },
      originalRow
    );

    b.dataset.strategy=key;
  }

  for(let rank=1;rank<=4;rank++){

    const b=strategyButton(
      "AUTO "+rank+"º",
      ()=>{

        state.manual=null;
        state.activeAdaptive=null;
        state.activeCreated=null;
        state.strategy="FIXED";
        state.rank=rank;

        refresh();
      },
      originalRow
    );

    b.dataset.rank=rank;
  }

  originals.appendChild(originalRow);
  root.appendChild(originals);

  const adaptiveGroup=document.createElement("div");

  adaptiveGroup.className="strategyGroup";
  adaptiveGroup.style.width="100%";

  adaptiveGroup.innerHTML=`
    <div class="strategyLabel">
      ESTRATÉGIAS ADAPTATIVAS
      — SELEÇÃO INDIVIDUAL
    </div>
  `;

  const adaptiveRow=document.createElement("div");
  adaptiveRow.className="row";

  for(const config of ADAPTATIVES){

    const b=strategyButton(
      config.name,
      ()=>{

        state.manual=null;
        state.activeCreated=null;
        state.strategy="ADAPTIVE";
        state.activeAdaptive=config.id;

        refresh();
      },
      adaptiveRow
    );

    b.dataset.adaptive=config.id;
  }

  adaptiveGroup.appendChild(adaptiveRow);
  root.appendChild(adaptiveGroup);

  if(state.createdStrategies.length){

    const createdGroup=document.createElement("div");

    createdGroup.className="strategyGroup";
    createdGroup.style.width="100%";

    createdGroup.innerHTML=`
      <div class="strategyLabel">
        ESTRATÉGIAS CRIADAS
      </div>
    `;

    const createdRow=document.createElement("div");
    createdRow.className="row";

    for(const created of state.createdStrategies){

      const b=strategyButton(
        created.name,
        ()=>{

          state.manual=null;
          state.activeAdaptive=null;
          state.activeCreated=created.id;
          state.strategy="CREATED";

          refresh();
        },
        createdRow
      );

      b.dataset.createdStrategy=created.id;
    }

    createdGroup.appendChild(createdRow);
    root.appendChild(createdGroup);
  }
}

buildStrategyButtons();

/* ======================================
   OPÇÕES ORIGINAIS
====================================== */

for(const [field,name] of [
  ["g1","G1 AJUSTE FINO"],
  ["galeSkip","GALE 2ª RODADA"],
  ["secondHouse","2ª CASA"]
]){

  const b=document.createElement("button");

  b.className="btn";
  b.dataset.option=field;
  b.textContent=name;

  b.onclick=()=>{

    state[field]=!state[field];

    labCache.signature=null;

    refresh();
  };

  $("options").appendChild(b);
}

/* ======================================
   MOTORES ORIGINAIS
====================================== */

for(const family of FAMILIES){

  for(const radius of RADII){

    const key=family+"_"+radius;

    const b=document.createElement("button");

    b.className="btn";
    b.textContent=key;

    b.onclick=()=>{

      state.manual=key;
      state.activeAdaptive=null;
      state.activeCreated=null;

      refresh();
    };

    $("motors").appendChild(b);
  }
}

/* ======================================
   TECLADO ORIGINAL
====================================== */

for(let n=0;n<=36;n++){

  const b=document.createElement("button");

  b.className="key"+(n===0?" zero":"");

  b.textContent=n;

  b.style.background=
    n===0
      ?"#087b50"
      :RED.has(n)
        ?"#ac293f"
        :"#12151b";

  b.onclick=()=>{

    state.history.push(n);
    state.sources.push("TEMPO REAL");

    state.history=state.history.slice(-MAX);
    state.sources=state.sources.slice(-MAX);

    refresh();
  };

  $("keys").appendChild(b);
}

/* ======================================
   EXPANSÃO / RECOLHIMENTO

   Funciona também nos quadros internos.
====================================== */

function applyOpenState(){

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

      const span=button.querySelector("span");

      if(span){
        span.textContent=open?"−":"+";
      }
    }
  }
}

document.addEventListener("click",e=>{

  const button=e.target.closest(
    "[data-panel]"
  );

  if(!button)return;

  const name=button.dataset.panel;

  state.open[name]=!state.open[name];

  applyOpenState();
  save();
});

/* ======================================
   IMPORTAR / APAGAR / ZERAR
====================================== */

$("import").onclick=()=>{

  const numbers=(
    $("paste").value.match(/\d+/g)||[]
  )
  .map(Number)
  .filter(n=>n>=0&&n<=36)
  .slice(-MAX);

  if(!numbers.length){

    alert("Cole números de 0 a 36.");
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

  if(!confirm(
    "Apagar histórico e análises?"
  ))return;

  state=fresh();

  frameCache.signature=null;
  labCache.signature=null;

  buildStrategyButtons();

  refresh();
};

/* ======================================
   RESULTADO GERAL ORIGINAL
====================================== */

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

/* ======================================
   MINI QUADRO EXPANSÍVEL
====================================== */

function miniPanel(
  id,
  title,
  content
){

  const open=!!state.open[id];

  return `
    <button
      class="miniHead"
      data-panel="${esc(id)}"
    >
      ${esc(title)}
      <span>${open?"−":"+"}</span>
    </button>

    <div
      id="${esc(id)}"
      class="miniContent ${
        open?"":"hide"
      }"
    >
      ${content}
    </div>
  `;
}

/* ======================================
   RANKING VIRTUAL OCULTO
====================================== */

function virtualRankingHTML(trainer){

  return trainer.ranking.map(
    (m,i)=>`

      <div class="listrow">

        <b>
          ${i+1}º ${esc(m.key)}
        </b>

        <div class="muted">

          ${m.total} giros

          • ${m.hits} cobertos

          • ${m.misses} descobertos

          • ${pct(m.hits,m.total)}

        </div>

      </div>

    `
  ).join("");
}

/* ======================================
   OPORTUNIDADES OCULTAS
====================================== */

function opportunitiesHTML(result){

  const last=result.audits.at(-1);

  return `

    ${last?`

      <div class="box">

        <b>
          ${esc(last.category)}
        </b>

        <p>
          GIRO ${last.turn}
          • NÚMERO ${last.n}
        </p>

        <p>
          MOTOR:
          ${esc(last.selected)}
        </p>

        <p>
          FASE:
          ${esc(last.phase)}
        </p>

        <p>
          OUTROS MOTORES:
          ${esc(
            last.alternatives.join(", ")||
            "NENHUM"
          )}
        </p>

        <p>
          ALTERNATIVA:
          ${esc(last.best||"NENHUMA")}
        </p>

        <p>
          ENTRARIAM:
          ${esc(
            last.added.join(", ")||
            "—"
          )}
        </p>

        <p>
          SAIRIAM:
          ${esc(
            last.removed.join(", ")||
            "—"
          )}
        </p>

      </div>

    `:""}

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

  `;
}

/* ======================================
   PLANO DE COBERTURA
====================================== */

function coveragePlanHTML(
  result,
  trainer
){

  const track=tracking(result);

  return `

    <div class="box">

      <b>
        ANÁLISE DE COBERTURA
      </b>

      <p>
        Giros descobertos:
        ${trainer.uncovered}
      </p>

      <p>
        Outro motor cobria:
        ${trainer.alternativeHits}
      </p>

      <p>
        Nenhum motor cobria:
        ${trainer.nobodyCovered}
      </p>

      <p>
        Trocas realizadas:
        ${track.switches}
      </p>

      <p>
        Maior permanência:
        ${track.maxStreak}
      </p>

    </div>

    <div class="title">
      REGIÕES
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
      MOTORES UTILIZADOS
    </div>

    ${Object.entries(
      track.byMotor
    ).map(
      ([key,x])=>`

        <div class="listrow">

          ${esc(key)}

          • ${x.decisions} decisões

          • cobertura:
          ${pct(
            x.covered,
            x.decisions
          )}

        </div>

      `
    ).join("")}

  `;
}

/* ======================================
   TREINADOR VISUAL
====================================== */

function trainerHTML(
  trainer,
  result,
  diagnosis,
  lab
){

  const track=tracking(result);

  const recommended=lab.recommendation;

  return `

  <div class="virtualHero">

    <div class="title">
      TREINADOR ESTRATÉGICO VIRTUAL
    </div>

    <div class="muted">

      Auditoria de todos os números,
      motores, regiões, GREEN,
      Gale, LOSS e estratégias.

    </div>

    <div class="metrics">

      <div class="metric">
        <small>NÚMEROS</small>
        <b>${trainer.totalNumbers}</b>
      </div>

      <div class="metric">
        <small>MOTORES</small>
        <b>12</b>
      </div>

      <div class="metric">
        <small>TROCAS</small>
        <b>${track.switches}</b>
      </div>

      <div class="metric">
        <small>GREEN</small>
        <b class="good">
          ${trainer.greenCount}
        </b>
      </div>

      <div class="metric">
        <small>GALE</small>
        <b>${trainer.galeCount}</b>
      </div>

      <div class="metric">
        <small>LOSS</small>
        <b class="bad">
          ${trainer.lossCount}
        </b>
      </div>

    </div>

  </div>

  <div class="virtualRecommendation">

    <div class="title">
      RECOMENDAÇÃO DO TREINADOR
    </div>

    <b>
      ${esc(diagnosis.title)}
    </b>

    ${diagnosis.messages.map(
      x=>`

        <div class="virtualLine">
          ${esc(x)}
        </div>

      `
    ).join("")}

    ${recommended?`

      <button
        class="virtualButton"
        id="activateTrainer"
      >
        ATIVAR TREINADOR ESTRATÉGICO
      </button>

      <button
        class="virtualButton"
        id="activateRecommended"
      >
        ATIVAR SOMENTE
        ${esc(recommended.name)}
      </button>

    `:""}

  </div>

  ${miniPanel(
    "virtualRanking",
    "RANKING VIRTUAL DOS 12 MOTORES",
    state.open.virtualRanking
      ?virtualRankingHTML(trainer)
      :""
  )}

  ${miniPanel(
    "opportunities",
    "ÚLTIMAS 20 OPORTUNIDADES",
    state.open.opportunities
      ?opportunitiesHTML(result)
      :""
  )}

  ${miniPanel(
    "coveragePlan",
    "PLANO DE COBERTURA E REGIÕES",
    state.open.coveragePlan
      ?coveragePlanHTML(
        result,
        trainer
      )
      :""
  )}

  <div class="virtualWarning">

    O treinador recomenda a configuração
    com melhor resultado observado
    no backtest. Não há garantia de
    acerto nos próximos giros.

  </div>

  `;
}

/* ======================================
   COMPARAÇÕES EXPANSÍVEIS
====================================== */

function comparisonsHTML(lab){

  return `

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

  `;
}

/* ======================================
   LABORATÓRIO VISUAL
====================================== */

function laboratoryHTML(lab){

  const rec=lab.recommendation;

  return `

  <div class="box">

    <b>
      ${esc(lab.status)}
    </b>

    <p class="muted">

      Estratégias originais e adaptativas
      avaliadas em sequência.

      Desenvolvimento: 65%.

      Comparação: 35%.

      A escolha da melhor entre várias
      configurações é exploratória.

    </p>

  </div>

  ${rec?`

    <div class="virtualRecommendation">

      <div class="title">
        ESTRATÉGIA INDICADA
      </div>

      <b>
        ${esc(rec.name)}
      </b>

      <div class="virtualLine">

        GREEN:
        ${rec.valid.green}

        • GALE:
        ${rec.valid.gale}

        • LOSS:
        ${rec.valid.loss}

      </div>

      <div class="virtualLine">

        TAXA:
        ${pct(
          rec.valid.green,
          rec.valid.total
        )}

      </div>

      <div class="virtualLine">

        CICLOS:
        ${rec.valid.total}

      </div>

      ${rec.config?`

        <div class="virtualLine">

          JANELA:
          ${rec.config.window}

          • MARGEM:
          ${fmt(
            rec.config.margin*100
          )}%

        </div>

        <div class="virtualLine">

          AMOSTRA:
          ${rec.config.minSamples}

          • RANKING:
          ${rec.config.maxRank}

        </div>

      `:""}

      <button
        class="virtualButton"
        id="labActivate"
      >
        ATIVAR ESTRATÉGIA INDICADA
      </button>

      ${rec.config?`

        <button
          class="virtualButton"
          id="labCreate"
        >
          CRIAR BOTÃO PERSONALIZADO
        </button>

      `:""}

    </div>

  `:""}

  ${miniPanel(
    "comparisons",
    "COMPARAÇÃO DE TODAS AS ESTRATÉGIAS",
    state.open.comparisons
      ?comparisonsHTML(lab)
      :""
  )}

  ${miniPanel(
    "created",
    "ESTRATÉGIAS PERSONALIZADAS",
    state.open.created
      ?state.createdStrategies.map(
        x=>`

          <button
            class="virtualButton"
            data-created="${esc(x.id)}"
          >
            ${esc(x.name)}
            • JANELA ${x.config.window}
            • TROCA
            ${fmt(x.config.margin*100)}%
          </button>

        `
      ).join("")||`
        <div class="box">
          Nenhuma estratégia criada.
        </div>
      `
      :""
  )}

  `;
}

/* ======================================
   RENDERIZAÇÃO ASSÍNCRONA

   O quadro principal aparece primeiro.
   Laboratório é processado depois,
   evitando reconstruir os painéis
   pesados durante a digitação.
====================================== */

let renderToken=0;

function render(){

  const token=++renderToken;

  const history=state.history;
  const sources=state.sources;

  $("status").textContent=
    history.length+
    "/200 números • ANALISANDO";

  /*
    A interface cede um ciclo para
    atualizar o status antes do
    cálculo.
  */

  setTimeout(()=>{

    if(token!==renderToken)return;

    try{

      performRender(token);

    }catch(error){

      console.error(
        "ANÁLISE BETA:",
        error
      );

      $("status").textContent=
        "ERRO NA ANÁLISE: "+
        error.message;
    }

  },0);
}

function performRender(token){

  const history=state.history;
  const sources=state.sources;

  const frames=buildFrames(history);

  /*
    O laboratório fica em cache
    enquanto histórico e opções
    não mudarem.
  */

  const lab=laboratory(
    history,
    frames
  );

  if(token!==renderToken)return;

  const active=activeRule(lab);

  const result=simulate(
    history,
    sources,
    active.rule,
    active.rank,
    optionsNow(),
    active.config,
    frames,
    state.manual
  );

  const cs=frames.at(-1)?.candidates||[];

  const selected=choose(
    cs,
    result.allRecords,
    active.rule,
    active.rank,
    result.previous,
    active.config,
    state.manual
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

  /* ====================================
     ESTADO DOS BOTÕES
  ==================================== */

  for(const b of document.querySelectorAll(
    "[data-strategy]"
  )){

    b.classList.toggle(
      "active",
      !state.manual&&
      state.strategy===b.dataset.strategy
    );
  }

  for(const b of document.querySelectorAll(
    "[data-adaptive]"
  )){

    b.classList.toggle(
      "active",
      !state.manual&&
      state.strategy==="ADAPTIVE"&&
      state.activeAdaptive===
        b.dataset.adaptive
    );
  }

  for(const b of document.querySelectorAll(
    "[data-created-strategy]"
  )){

    b.classList.toggle(
      "active",
      !state.manual&&
      state.strategy==="CREATED"&&
      state.activeCreated===
        b.dataset.createdStrategy
    );
  }

  for(const b of document.querySelectorAll(
    "[data-trainer]"
  )){

    b.classList.toggle(
      "active",
      !state.manual&&
      state.strategy==="TRAINER"
    );
  }

  for(const b of document.querySelectorAll(
    "[data-rank]"
  )){

    b.classList.toggle(
      "active",
      !state.manual&&
      state.strategy==="FIXED"&&
      state.rank===Number(b.dataset.rank)
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

  /* ====================================
     JOGADA ATIVA
  ==================================== */

  $("selected").textContent=
    active.name+
    " • MOTOR "+
    (selected?.key||"AGUARDANDO")+
    " • "+
    result.phase;

  $("centers").innerHTML=play
    ?play.blocks.map(
      b=>`

        <div class="center ${
          b.radius===1?"short":""
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

  /* ====================================
     ÚLTIMOS 14
  ==================================== */

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

  /* ====================================
     RESULTADO GERAL
  ==================================== */

  const historical=result.cycles.filter(
    x=>x.source==="HISTÓRICO"
  );

  const live=result.cycles.filter(
    x=>x.source==="TEMPO REAL"
  );

  if(state.open.general){

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
  }

  /* ====================================
     TREINADOR
  ==================================== */

  const trainer=virtualTrainer(
    history,
    result,
    frames
  );

  const diagnosis=strategicDiagnosis(
    lab,
    trainer
  );

  if(state.open.trainer){

    $("trainer").innerHTML=trainerHTML(
      trainer,
      result,
      diagnosis,
      lab
    );

    const trainerButton=$(
      "activateTrainer"
    );

    if(trainerButton){

      trainerButton.onclick=()=>{

        state.manual=null;
        state.activeAdaptive=null;
        state.activeCreated=null;
        state.strategy="TRAINER";

        refresh();
      };
    }

    const recommendedButton=$(
      "activateRecommended"
    );

    if(
      recommendedButton&&
      lab.recommendation
    ){

      recommendedButton.onclick=()=>{

        activateRecommendation(
          lab.recommendation
        );
      };
    }
  }

  /* ====================================
     LABORATÓRIO
  ==================================== */

  if(state.open.lab){

    $("lab").innerHTML=laboratoryHTML(
      lab
    );

    const activate=$("labActivate");

    if(activate&&lab.recommendation){

      activate.onclick=()=>{

        activateRecommendation(
          lab.recommendation
        );
      };
    }

    const create=$("labCreate");

    if(create&&lab.recommendation){

      create.onclick=()=>{

        createStrategy(
          lab.recommendation
        );

        buildStrategyButtons();
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

        state.manual=null;
        state.activeAdaptive=null;
        state.activeCreated=id;
        state.strategy="CREATED";

        refresh();
      };
    }
  }

  /* ====================================
     RANKING ORIGINAL
  ==================================== */

  if(state.open.motors){

    $("motors").querySelectorAll(
      ".listrow"
    ).forEach(x=>x.remove());

    $("motors").insertAdjacentHTML(
      "beforeend",

      cs.map(
        c=>`

          <div class="listrow">

            <b>${c.rank}º</b>

            • ${esc(c.key)}

            • SCORE ${fmt(c.score)}

            <div class="muted">

              ${c.play.centers5.join(", ")}

              + ${c.play.center3}

            </div>

          </div>

        `
      ).join("")
    );
  }

  /* ====================================
     LINHA DO TEMPO ORIGINAL
  ==================================== */

  if(state.open.timeline){

    $("timeline").innerHTML=result.entries
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
              ${x.covered?"SIM":"NÃO"}

              • ALTERNATIVAS:
              ${esc(
                x.alternatives.join(", ")||
                "NENHUMA"
              )}

            </div>

          </div>

        `
      ).join("");
  }

  applyOpenState();

  save();
}

function refresh(){
  render();
}

/* ======================================
   INICIALIZAÇÃO
====================================== */

render();

})();
