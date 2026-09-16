(function(){
"use strict";

/* =========================================================
   ANALISADOR 0 • 6 • 9 — MOTOR COMPLETO V7
========================================================= */

const STORAGE_KEY =
"ANALISADOR_069_IDS_CORRESPONDENTES_V1";

const STORAGE_ESTADO =
"ANALISADOR_069_ESTADO_COMPLETO_V7";

const MAX_HISTORICO = 5000;
const MAX_TIMELINE = 300;

const TAMANHO_JANELA = 14;
const JANELA_MOMENTO = 20;

const RX_LIST = [4,5,6];

const TODOS_IDS_RX = [
  0,10,20,30,
  6,16,26,36,
  9,19,29,39
];

const PERCENTUAL_REPLICAS_RX = 0.10;
const MIN_REPLICAS_RX = 15;
const MAX_REPLICAS_RX = 40;

const META_ASSERTIVIDADE = 90;
const LIMITE_RECUPERACAO = 85;


/* =========================================================
   ROLETA
========================================================= */

const track = [
  32,15,19,4,21,2,25,17,34,6,
  27,13,36,11,30,8,23,10,5,24,
  16,33,1,20,14,31,9,22,18,29,
  7,28,12,35,3,26,0
];

const numerosVermelhos = new Set([
  1,3,5,7,9,
  12,14,16,18,
  19,21,23,25,27,
  30,32,34,36
]);

const regioesRoleta = {

  ZERO:new Set([
    0,32,15,26,3,35,12
  ]),

  VOISINS:new Set([
    19,4,21,2,25,
    28,7,29,18,22
  ]),

  ORPHELINS:new Set([
    9,31,14,20,1,17,6,34
  ]),

  TIERS:new Set([
    27,13,36,11,30,8,
    23,10,5,24,16,33
  ])

};

const coresRegioes = {
  ZERO:"#9bea2c",
  VOISINS:"#8a20d4",
  ORPHELINS:"#176436",
  TIERS:"#29499b"
};

const COR_T0 = "#00c853";
const COR_T6 = "#ffc107";
const COR_T9 = "#2196f3";


/* =========================================================
   BASES 0 / 6 / 9
========================================================= */

const BASES_069 = [
  0,10,20,30,
  6,16,26,36,
  9,19,29
];

const IDS_ESPECIAIS = {
  25:[39],
  17:[9],
  2:[9]
};


/* =========================================================
   HELPERS DA RODA
========================================================= */

function setorVizinhosOrdenado(centro,quantidade){

  const indice = track.indexOf(centro);

  if(indice === -1) return [];

  const nums=[];

  for(let d=-quantidade;d<=quantidade;d++){

    nums.push(
      track[
        (indice+d+track.length)
        %
        track.length
      ]
    );

  }

  return nums;
}


function vizinhos(numero,quantidade=1){

  const indice=track.indexOf(numero);

  if(indice===-1) return [];

  const resultado=[numero];

  for(let distancia=1;
      distancia<=quantidade;
      distancia++){

    resultado.push(
      track[
        (indice-distancia+track.length)
        %
        track.length
      ]
    );

    resultado.push(
      track[
        (indice+distancia)
        %
        track.length
      ]
    );

  }

  return resultado;
}


function distanciaRoda(a,b){

  const ia=track.indexOf(a);
  const ib=track.indexOf(b);

  if(ia<0 || ib<0) return 99;

  const d=Math.abs(ia-ib);

  return Math.min(
    d,
    track.length-d
  );
}


/* =========================================================
   REGIÕES
========================================================= */

function regiaoDoNumero(numero){

  if(regioesRoleta.ZERO.has(numero))
    return "ZERO";

  if(regioesRoleta.VOISINS.has(numero))
    return "VOISINS";

  if(regioesRoleta.ORPHELINS.has(numero))
    return "ORPHELINS";

  if(regioesRoleta.TIERS.has(numero))
    return "TIERS";

  return null;
}


/* =========================================================
   IDS
========================================================= */

const coberturaDasBases={};

BASES_069.forEach(base=>{

  coberturaDasBases[base]=
  new Set(vizinhos(base,1));

});


function idsQueBatem(numero){

  const ids=[];

  BASES_069.forEach(base=>{

    if(
      coberturaDasBases[base]
      .has(numero)
    ){
      ids.push(base);
    }

  });

  if(
    Object.prototype
    .hasOwnProperty
    .call(
      IDS_ESPECIAIS,
      numero
    )
  ){

    IDS_ESPECIAIS[numero]
    .forEach(id=>{

      if(!ids.includes(id))
        ids.push(id);

    });

  }

  return ids;
}


function familiaDoId(id){

  if(
    id===0 ||
    id===10 ||
    id===20 ||
    id===30
  ) return 0;

  if(
    id===6 ||
    id===16 ||
    id===26 ||
    id===36
  ) return 6;

  if(
    id===9 ||
    id===19 ||
    id===29 ||
    id===39
  ) return 9;

  return null;
}


function familiasQueBatem(numero){

  return new Set(
    idsQueBatem(numero)
    .map(familiaDoId)
    .filter(f=>f!==null)
  );
}


function corDoId(id){

  const f=familiaDoId(id);

  if(f===0) return COR_T0;
  if(f===6) return COR_T6;
  if(f===9) return COR_T9;

  return "#555";
}


/* =========================================================
   TERMINAIS T0–T9
========================================================= */

function terminalDoNumero(numero){
  return numero%10;
}


function vizinhosTerminal(t){

  return [
    (t+9)%10,
    t,
    (t+1)%10
  ];
}


function numerosDoTerminal(t){

  return track.filter(
    n=>n%10===t
  );
}


/* =========================================================
   HISTÓRICO
========================================================= */

function carregarHistorico(){

  try{

    const x=JSON.parse(
      localStorage.getItem(STORAGE_KEY)
      ||
      "[]"
    );

    if(!Array.isArray(x))
      return [];

    return x
    .map(Number)
    .filter(n=>
      Number.isInteger(n) &&
      n>=0 &&
      n<=36
    )
    .slice(-MAX_HISTORICO);

  }catch(e){

    return [];

  }
}


let historico=carregarHistorico();


function salvarHistorico(){

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(historico)
  );
}


/* =========================================================
   ESTADO
========================================================= */

function estadoPadrao(){

  return {

    modo:"AUTO",

    manualRX:6,

    pendentes:{
      4:null,
      5:null,
      6:null
    },

    pendenteAuto:null,

    timeline:{
      4:[],
      5:[],
      6:[]
    },

    timelineAuto:[],

    ultimaAnalise:null

  };
}


function carregarEstado(){

  const padrao=estadoPadrao();

  try{

    const salvo=JSON.parse(
      localStorage.getItem(STORAGE_ESTADO)
      ||
      "{}"
    );

    return {

      ...padrao,
      ...salvo,

      pendentes:{
        ...padrao.pendentes,
        ...(salvo.pendentes||{})
      },

      timeline:{
        ...padrao.timeline,
        ...(salvo.timeline||{})
      },

      timelineAuto:
      Array.isArray(salvo.timelineAuto)
      ?
      salvo.timelineAuto
      :
      []

    };

  }catch(e){

    return padrao;

  }
}


let estado=carregarEstado();


function salvarEstado(){

  localStorage.setItem(
    STORAGE_ESTADO,
    JSON.stringify(estado)
  );
}


/* =========================================================
   ASSINATURA DO HISTÓRICO

   ESSENCIAL:
   clicar AUTO / 4 / 5 / 6 NÃO altera
   uma previsão já congelada.
========================================================= */

function assinaturaHistorico(){

  return (
    historico.length +
    "|" +
    historico.slice(-32).join(",")
  );
}


/* =========================================================
   TRAJETÓRIA RX
========================================================= */

function gerarTrajetoria(janela){

  let t0=0,t6=0,t9=0;

  const pontos=[];
  const eventos=[];

  janela.forEach((numero,index)=>{

    const familias=
    familiasQueBatem(numero);

    const b0=familias.has(0)?1:0;
    const b6=familias.has(6)?1:0;
    const b9=familias.has(9)?1:0;

    t0+=b0;
    t6+=b6;
    t9+=b9;

    eventos.push({
      t0:b0,
      t6:b6,
      t9:b9
    });

    pontos.push({
      posicao:index+1,
      numero,
      t0,
      t6,
      t9
    });

  });

  return {
    pontos,
    eventos,
    total0:t0,
    total6:t6,
    total9:t9
  };
}


function chaveEvento(e){

  let s="";

  if(e.t0) s+="0";
  if(e.t6) s+="6";
  if(e.t9) s+="9";

  return s||"-";
}


function calcularSimilaridade(
  janelaAtual,
  janelaAntiga
){

  const tamanho=
  janelaAtual.length;

  if(
    !tamanho ||
    janelaAntiga.length!==tamanho
  ) return 0;

  const atual=
  gerarTrajetoria(janelaAtual);

  const antiga=
  gerarTrajetoria(janelaAntiga);

  let iguais=0;

  for(let i=0;i<tamanho;i++){

    if(
      chaveEvento(atual.eventos[i])
      ===
      chaveEvento(antiga.eventos[i])
    ){
      iguais++;
    }

  }

  const scoreEventos=
  iguais/tamanho*100;

  let erro=0;

  for(let i=0;i<tamanho;i++){

    erro+=Math.abs(
      atual.pontos[i].t0-
      antiga.pontos[i].t0
    );

    erro+=Math.abs(
      atual.pontos[i].t6-
      antiga.pontos[i].t6
    );

    erro+=Math.abs(
      atual.pontos[i].t9-
      antiga.pontos[i].t9
    );

  }

  const maxErro=
  tamanho*tamanho*3;

  let scoreForma=
  1-(erro/maxErro);

  scoreForma=
  Math.max(
    0,
    Math.min(1,scoreForma)
  )*100;

  return (
    scoreEventos*.80 +
    scoreForma*.20
  );
}


/* =========================================================
   MOMENTO ATUAL — 20 NÚMEROS
========================================================= */

function analisarMomento(base=historico){

  const janela=
  base.slice(-JANELA_MOMENTO);

  const r={

    total:janela.length,

    alto:0,
    baixo:0,
    zero:0,

    vermelho:0,
    preto:0,

    regioes:{
      ZERO:0,
      VOISINS:0,
      ORPHELINS:0,
      TIERS:0
    },

    familias:{
      0:0,
      6:0,
      9:0
    },

    terminais:
    Array(10).fill(0),

    terminalViz:
    Array(10).fill(0),

    roda:
    new Map()

  };

  track.forEach(n=>
    r.roda.set(n,0)
  );

  janela.forEach(numero=>{

    if(numero===0){
      r.zero++;
    }
    else if(numero<=18){
      r.baixo++;
    }
    else{
      r.alto++;
    }

    if(numero!==0){

      if(
        numerosVermelhos.has(numero)
      ){
        r.vermelho++;
      }
      else{
        r.preto++;
      }

    }

    const reg=
    regiaoDoNumero(numero);

    if(reg)
      r.regioes[reg]++;

    familiasQueBatem(numero)
    .forEach(f=>{
      r.familias[f]++;
    });

    const t=
    terminalDoNumero(numero);

    r.terminais[t]++;

    vizinhosTerminal(t)
    .forEach(tv=>{
      r.terminalViz[tv]++;
    });

    track.forEach(alvo=>{

      const d=
      distanciaRoda(numero,alvo);

      let p=0;

      if(d===0) p=1;
      else if(d===1) p=.55;
      else if(d===2) p=.25;

      if(p){

        r.roda.set(
          alvo,
          r.roda.get(alvo)+p
        );

      }

    });

  });

  return r;
}


/* =========================================================
   ESTATÍSTICA TIMELINE
========================================================= */

function estatisticaTimeline(lista){

  function taxa(qtd){

    const x=
    lista.slice(-qtd);

    if(!x.length)
      return 0;

    return (
      x.filter(v=>v.green).length
      /
      x.length
      *
      100
    );
  }

  let loss=0;

  for(let i=lista.length-1;i>=0;i--){

    if(lista[i].green)
      break;

    loss++;
  }

  return {

    total:lista.length,

    taxa5:taxa(5),
    taxa10:taxa(10),
    taxa20:taxa(20),

    lossSeguidos:loss

  };
}


/* =========================================================
   ESTADO DE RECUPERAÇÃO
========================================================= */

function estadoRecuperacao(){

  const e=
  estatisticaTimeline(
    estado.timelineAuto
  );

  if(e.total<5){

    return {
      nivel:0,
      nome:"APRENDENDO",
      stats:e
    };
  }

  if(
    e.lossSeguidos>=3 ||
    e.taxa20<80
  ){

    return {
      nivel:3,
      nome:"REESTRUTURAÇÃO",
      stats:e
    };
  }

  if(
    e.lossSeguidos>=2 ||
    e.taxa20<LIMITE_RECUPERACAO
  ){

    return {
      nivel:2,
      nome:"RECUPERAÇÃO FORTE",
      stats:e
    };
  }

  if(
    e.taxa20<META_ASSERTIVIDADE
  ){

    return {
      nivel:1,
      nome:"RECALIBRANDO",
      stats:e
    };
  }

  return {
    nivel:0,
    nome:"NORMAL",
    stats:e
  };
}


/* =========================================================
   RAIO X
========================================================= */

function analisarRaioX(base,tamanho){

  if(
    base.length <
    tamanho*2+2
  ){

    return {
      tamanho,
      replicas:[],
      similaridade:0,
      ranking:[],
      sinais:{
        0:0,
        6:0,
        9:0
      }
    };
  }

  const atual=
  base.slice(-tamanho);

  const candidatos=[];

  const fimAtual=
  base.length-tamanho;

  for(let inicio=0;
      inicio+tamanho<fimAtual;
      inicio++){

    const antiga=
    base.slice(
      inicio,
      inicio+tamanho
    );

    const proximo=
    base[inicio+tamanho];

    const similaridade=
    calcularSimilaridade(
      atual,
      antiga
    );

    candidatos.push({
      inicio,
      proximo,
      similaridade
    });
  }

  candidatos.sort((a,b)=>{

    if(
      b.similaridade!==
      a.similaridade
    ){
      return (
        b.similaridade-
        a.similaridade
      );
    }

    return b.inicio-a.inicio;
  });

  let qtd=
  Math.ceil(
    candidatos.length*
    PERCENTUAL_REPLICAS_RX
  );

  qtd=Math.max(
    MIN_REPLICAS_RX,
    qtd
  );

  qtd=Math.min(
    MAX_REPLICAS_RX,
    candidatos.length,
    qtd
  );

  let replicas=
  candidatos.slice(0,qtd);

  const contagem={};

  TODOS_IDS_RX.forEach(id=>{
    contagem[id]={
      id,
      ocorrencias:0,
      melhorSimilaridade:0,
      ultima:-1
    };
  });

  function contabilizar(rep){

    idsQueBatem(rep.proximo)
    .forEach(id=>{

      if(!contagem[id])
        return;

      contagem[id].ocorrencias++;

      contagem[id].melhorSimilaridade=
      Math.max(
        contagem[id].melhorSimilaridade,
        rep.similaridade
      );

      contagem[id].ultima=
      Math.max(
        contagem[id].ultima,
        rep.inicio
      );
    });
  }

  replicas.forEach(contabilizar);

  function positivos(){

    return TODOS_IDS_RX.filter(
      id=>
      contagem[id].ocorrencias>0
    ).length;
  }

  let cursor=qtd;

  while(
    positivos()<8 &&
    cursor<candidatos.length &&
    cursor<MAX_REPLICAS_RX
  ){

    const rep=
    candidatos[cursor];

    replicas.push(rep);

    contabilizar(rep);

    cursor++;
  }

  const ordemFixa=
  new Map(
    TODOS_IDS_RX.map(
      (id,i)=>[id,i]
    )
  );

  const ranking=
  Object.values(contagem)
  .filter(x=>x.ocorrencias>0)
  .sort((a,b)=>{

    if(
      b.ocorrencias!==
      a.ocorrencias
    ){
      return (
        b.ocorrencias-
        a.ocorrencias
      );
    }

    if(
      b.melhorSimilaridade!==
      a.melhorSimilaridade
    ){
      return (
        b.melhorSimilaridade-
        a.melhorSimilaridade
      );
    }

    if(b.ultima!==a.ultima)
      return b.ultima-a.ultima;

    return (
      ordemFixa.get(a.id)-
      ordemFixa.get(b.id)
    );
  });

  let f0=0,f6=0,f9=0,total=0;

  replicas.forEach(rep=>{

    const fs=
    [...familiasQueBatem(rep.proximo)];

    if(!fs.length)
      return;

    const parte=1/fs.length;

    fs.forEach(f=>{

      if(f===0) f0+=parte;
      if(f===6) f6+=parte;
      if(f===9) f9+=parte;

    });

    total++;
  });

  return {

    tamanho,
    replicas,

    similaridade:
    replicas.length
    ?
    replicas.reduce(
      (s,x)=>s+x.similaridade,
      0
    )/replicas.length
    :
    0,

    ranking,

    sinais:{
      0:total?f0/total*100:0,
      6:total?f6/total*100:0,
      9:total?f9/total*100:0
    }

  };
}


/* =========================================================
   FALLBACK MESA 14 / 20
========================================================= */

function analisarMesaAtual(){

  const j14=
  historico.slice(-14);

  const j20=
  historico.slice(-20);

  const dados={};

  TODOS_IDS_RX.forEach(id=>{

    dados[id]={
      id,
      incidencias14:0,
      incidencias20:0,
      rec14:-1,
      rec20:-1
    };

  });

  j14.forEach((n,i)=>{

    idsQueBatem(n)
    .forEach(id=>{

      if(!dados[id])
        return;

      dados[id].incidencias14++;
      dados[id].rec14=i;

    });

  });

  j20.forEach((n,i)=>{

    idsQueBatem(n)
    .forEach(id=>{

      if(!dados[id])
        return;

      dados[id].incidencias20++;
      dados[id].rec20=i;

    });

  });

  const ordem=
  new Map(
    TODOS_IDS_RX.map(
      (id,i)=>[id,i]
    )
  );

  return Object.values(dados)
  .sort((a,b)=>{

    if(
      b.incidencias14!==
      a.incidencias14
    ){
      return (
        b.incidencias14-
        a.incidencias14
      );
    }

    if(b.rec14!==a.rec14)
      return b.rec14-a.rec14;

    if(
      b.incidencias20!==
      a.incidencias20
    ){
      return (
        b.incidencias20-
        a.incidencias20
      );
    }

    if(b.rec20!==a.rec20)
      return b.rec20-a.rec20;

    return (
      ordem.get(a.id)-
      ordem.get(b.id)
    );
  });
}


/* =========================================================
   8 ZONAS RX
========================================================= */

function montar8Zonas(rx){

  const suportados=
  rx.ranking.map(x=>({
    tipo:"ID",
    id:x.id,
    label:String(x.id),
    origem:"RAIO X",
    ocorrencias:x.ocorrencias
  }));

  const mesa=
  analisarMesaAtual();

  const existentes=
  new Set(
    suportados.map(x=>x.id)
  );

  mesa.forEach(x=>{

    if(
      suportados.length>=9
    ) return;

    if(existentes.has(x.id))
      return;

    if(
      x.incidencias14<=0 &&
      x.incidencias20<=0
    ) return;

    suportados.push({
      tipo:"ID",
      id:x.id,
      label:String(x.id),
      origem:
      x.incidencias14>0
      ?
      "MESA 14"
      :
      "MESA 20",
      ocorrencias:
      x.incidencias14||
      x.incidencias20
    });

    existentes.add(x.id);
  });

  let primeiros=
  suportados.slice(0,8);

  const tem0=
  primeiros.some(x=>x.id===0);

  const tem26=
  primeiros.some(x=>x.id===26);

  if(tem0 && tem26){

    const pos=
    Math.min(
      primeiros.findIndex(x=>x.id===0),
      primeiros.findIndex(x=>x.id===26)
    );

    primeiros=
    primeiros.filter(
      x=>x.id!==0 && x.id!==26
    );

    primeiros.splice(
      pos,
      0,
      {
        tipo:"ZERO26",
        id:"0+26",
        label:"0 + 3",
        origem:"RAIO X",
        ocorrencias:0
      }
    );

    const usados=
    new Set(
      primeiros
      .filter(x=>x.tipo==="ID")
      .map(x=>x.id)
    );

    for(const c of suportados){

      if(primeiros.length>=8)
        break;

      if(
        c.id===0 ||
        c.id===26 ||
        usados.has(c.id)
      ) continue;

      primeiros.push(c);
      usados.add(c.id);
    }
  }

  while(primeiros.length<8){

    primeiros.push({
      tipo:"SEM",
      label:"—",
      origem:"SEM DADOS",
      ocorrencias:0
    });
  }

  return primeiros.slice(0,8);
}


/* =========================================================
   FREQUÊNCIA DOS PRÓXIMOS REAIS
========================================================= */

function frequenciaDasReplicas(replicas){

  const freq=new Map();

  track.forEach(n=>freq.set(n,0));

  replicas.forEach(rep=>{

    freq.set(
      rep.proximo,
      (freq.get(rep.proximo)||0)+1
    );

  });

  return freq;
}


/* =========================================================
   SCORE DO SETOR
========================================================= */

function avaliarSetor(
  centro,
  quantidade,
  frequencia,
  momento,
  recuperacao
){

  const numeros=
  setorVizinhosOrdenado(
    centro,
    quantidade
  );

  let score=0;
  let suporte=0;

  numeros.forEach((numero,index)=>{

    const freq=
    frequencia.get(numero)||0;

    suporte+=freq;

    const dist=
    Math.abs(index-quantidade);

    let peso=1;

    if(quantidade===2){

      if(dist===0) peso=1.45;
      else if(dist===1) peso=1.20;
      else peso=1;

    }
    else{

      if(dist===0) peso=1.30;
      else peso=1;

    }

    score+=freq*peso;
  });


  /* -----------------------------------------
     PENALIZAÇÃO DE BORDA
  ----------------------------------------- */

  const idx=
  track.indexOf(centro);

  const foraEsq=
  track[
    (
      idx-quantidade-1+
      track.length
    )
    %
    track.length
  ];

  const foraDir=
  track[
    (
      idx+quantidade+1
    )
    %
    track.length
  ];

  const forcaBorda=
  (
    frequencia.get(foraEsq)||0
  )
  +
  (
    frequencia.get(foraDir)||0
  );

  score-=
  forcaBorda*
  (
    recuperacao.nivel>=2
    ?
    .50
    :
    .35
  );


  /* -----------------------------------------
     ALTO / BAIXO
  ----------------------------------------- */

  const totalAB=
  momento.alto+
  momento.baixo;

  if(totalAB){

    const desequilibrio=
    (
      momento.alto-
      momento.baixo
    )
    /
    totalAB;

    let altos=0;
    let baixos=0;

    numeros.forEach(n=>{

      if(n>=19) altos++;
      else if(n>=1) baixos++;

    });

    const balancoSetor=
    (
      altos-baixos
    )
    /
    numeros.length;

    score+=
    suporte*
    desequilibrio*
    balancoSetor*
    (
      recuperacao.nivel>=2
      ?
      .50
      :
      .30
    );
  }


  /* -----------------------------------------
     VERMELHO / PRETO
  ----------------------------------------- */

  const totalCor=
  momento.vermelho+
  momento.preto;

  if(totalCor){

    const desequilibrio=
    (
      momento.vermelho-
      momento.preto
    )
    /
    totalCor;

    let red=0;
    let black=0;

    numeros.forEach(n=>{

      if(n===0) return;

      if(
        numerosVermelhos.has(n)
      ) red++;
      else black++;

    });

    const balanco=
    (
      red-black
    )
    /
    numeros.length;

    score+=
    suporte*
    desequilibrio*
    balanco*
    (
      recuperacao.nivel>=2
      ?
      .30
      :
      .15
    );
  }


  /* -----------------------------------------
     TERMINAIS
  ----------------------------------------- */

  const maxTerminal=
  Math.max(
    1,
    ...momento.terminalViz
  );

  let scoreTerminal=0;

  numeros.forEach(n=>{

    const t=
    terminalDoNumero(n);

    scoreTerminal+=
    momento.terminalViz[t]
    /
    maxTerminal;

  });

  score+=
  suporte*
  (
    scoreTerminal/
    numeros.length
  )
  *
  (
    recuperacao.nivel>=2
    ?
    .55
    :
    .25
  );


  /* -----------------------------------------
     POSIÇÃO FÍSICA DA RODA
  ----------------------------------------- */

  const maxRoda=
  Math.max(
    1,
    ...[...momento.roda.values()]
  );

  let fisico=0;

  numeros.forEach(n=>{

    fisico+=
    momento.roda.get(n)/
    maxRoda;

  });

  score+=
  suporte*
  (
    fisico/
    numeros.length
  )
  *
  (
    recuperacao.nivel>=2
    ?
    .40
    :
    .18
  );


  /* -----------------------------------------
     REGIÕES
     Somente ajuste da JOGADA.
     Não entra na similaridade RX.
  ----------------------------------------- */

  const regDominante=
  Object.entries(
    momento.regioes
  )
  .sort((a,b)=>b[1]-a[1])[0];

  if(regDominante){

    const nome=
    regDominante[0];

    const qtd=
    numeros.filter(
      n=>regiaoDoNumero(n)===nome
    ).length;

    score+=
    suporte*
    (
      qtd/numeros.length
    )
    *
    (
      recuperacao.nivel>=2
      ?
      .25
      :
      .10
    );
  }


  return {
    centro,
    quantidade,
    numeros,
    score,
    suporte
  };
}


/* =========================================================
   MONTAR JOGADA
   5 × 2V + 1 × 1V = 28
========================================================= */

function montarJogada(
  replicas,
  base=historico
){

  if(!replicas.length)
    return null;

  const frequencia=
  frequenciaDasReplicas(replicas);

  const momento=
  analisarMomento(base);

  const recuperacao=
  estadoRecuperacao();

  const candidatos2=
  track.map(centro=>
    avaliarSetor(
      centro,
      2,
      frequencia,
      momento,
      recuperacao
    )
  )
  .sort((a,b)=>b.score-a.score);

  const candidatos1=
  track.map(centro=>
    avaliarSetor(
      centro,
      1,
      frequencia,
      momento,
      recuperacao
    )
  )
  .sort((a,b)=>b.score-a.score);

  let melhor=null;

  /*
    Procura geometricamente uma combinação
    válida de 28 números.
  */

  for(const bloco1 of candidatos1){

    const usados=
    new Set(bloco1.numeros);

    const blocos2=[];

    let total=
    bloco1.score;

    for(const bloco2 of candidatos2){

      if(
        bloco2.numeros
        .some(n=>usados.has(n))
      ){
        continue;
      }

      blocos2.push(bloco2);

      total+=bloco2.score;

      bloco2.numeros
      .forEach(n=>usados.add(n));

      if(blocos2.length===5)
        break;
    }

    if(
      blocos2.length!==5 ||
      usados.size!==28
    ){
      continue;
    }

    if(
      !melhor ||
      total>melhor.score
    ){

      melhor={
        blocos2,
        bloco1,
        numerosUsados:usados,
        score:total
      };
    }
  }

  return melhor;
}


/* =========================================================
   ANÁLISE DOS TRÊS RX
========================================================= */

function calcularAnalises(){

  return RX_LIST.map(tamanho=>{

    const rx=
    analisarRaioX(
      historico,
      tamanho
    );

    const jogada=
    montarJogada(
      rx.replicas,
      historico
    );

    return {
      tamanho,
      ...rx,
      jogada,
      zonas:
      montar8Zonas(rx)
    };
  });
}


/* =========================================================
   ESCOLHA AUTO
========================================================= */

function escolherAuto(analises){

  const rec=
  estadoRecuperacao();

  const avaliadas=
  analises.map(rx=>{

    const est=
    estatisticaTimeline(
      estado.timeline[rx.tamanho]
    );

    let score;

    if(est.total<5){

      score=
      rx.similaridade*.85;

    }
    else{

      score=
      est.taxa5*.45 +
      est.taxa10*.30 +
      est.taxa20*.15 +
      rx.similaridade*.10;

      if(est.lossSeguidos===1)
        score-=3;

      if(est.lossSeguidos===2)
        score-=14;

      if(est.lossSeguidos>=3)
        score-=30+
        (est.lossSeguidos-3)*10;
    }

    /*
      Quando AUTO está deteriorando,
      damos ainda mais importância
      ao comportamento imediatamente recente.
    */

    if(rec.nivel>=1){

      score+=
      est.taxa5*.15;

      score-=
      est.lossSeguidos*
      (
        rec.nivel===1
        ?
        4
        :
        8
      );
    }

    return {
      rx,
      est,
      score
    };
  });

  avaliadas.sort((a,b)=>{

    if(
      b.est.taxa5!==
      a.est.taxa5
    ){
      return (
        b.est.taxa5-
        a.est.taxa5
      );
    }

    if(
      a.est.lossSeguidos!==
      b.est.lossSeguidos
    ){
      return (
        a.est.lossSeguidos-
        b.est.lossSeguidos
      );
    }

    return b.score-a.score;
  });

  return avaliadas[0]
  ?
  avaliadas[0].rx
  :
  analises[0];
}


/* =========================================================
   SNAPSHOT CONGELADO
========================================================= */

function criarSnapshot(rx,sig){

  if(
    !rx ||
    !rx.jogada ||
    rx.jogada.numerosUsados.size!==28
  ){
    return null;
  }

  return {

    assinatura:sig,

    criadoCom:
    historico.length,

    rx:
    rx.tamanho,

    numeros:
    [...rx.jogada.numerosUsados],

    centros2:
    rx.jogada.blocos2
    .map(x=>x.centro),

    centro1:
    rx.jogada.bloco1.centro,

    hora:
    Date.now()

  };
}


/* =========================================================
   GARANTIR PENDENTES

   NÃO sobrescreve se a história
   continua exatamente a mesma.
========================================================= */

function garantirPendentes(
  analises,
  ativoAuto
){

  const sig=
  assinaturaHistorico();

  analises.forEach(rx=>{

    const atual=
    estado.pendentes[rx.tamanho];

    if(
      atual &&
      atual.assinatura===sig
    ){
      return;
    }

    estado.pendentes[rx.tamanho]=
    criarSnapshot(rx,sig);
  });

  if(
    !estado.pendenteAuto ||
    estado.pendenteAuto.assinatura!==sig
  ){

    estado.pendenteAuto=
    criarSnapshot(
      ativoAuto,
      sig
    );
  }

  salvarEstado();
}


/* =========================================================
   AVALIAR PENDENTES
========================================================= */

function avaliarPendentes(
  novoNumero
){

  const sigAtual=
  assinaturaHistorico();

  RX_LIST.forEach(rx=>{

    const p=
    estado.pendentes[rx];

    if(!p)
      return;

    /*
      Se não corresponde ao estado
      imediatamente anterior, é stale.
    */

    if(
      p.assinatura!==sigAtual
    ){

      estado.pendentes[rx]=null;
      return;
    }

    const green=
    p.numeros.includes(
      novoNumero
    );

    estado.timeline[rx].push({

      resultado:novoNumero,
      green,

      rx,

      assinatura:
      p.assinatura,

      numeros:
      p.numeros.slice(),

      centros2:
      p.centros2.slice(),

      centro1:
      p.centro1,

      hora:
      Date.now()

    });

    estado.timeline[rx]=
    estado.timeline[rx]
    .slice(-MAX_TIMELINE);

    estado.pendentes[rx]=null;
  });


  const pAuto=
  estado.pendenteAuto;

  if(
    pAuto &&
    pAuto.assinatura===sigAtual
  ){

    const green=
    pAuto.numeros.includes(
      novoNumero
    );

    estado.timelineAuto.push({

      resultado:novoNumero,
      green,

      rx:pAuto.rx,

      numeros:
      pAuto.numeros.slice(),

      centros2:
      pAuto.centros2.slice(),

      centro1:
      pAuto.centro1,

      assinatura:
      pAuto.assinatura,

      hora:
      Date.now()

    });

    estado.timelineAuto=
    estado.timelineAuto
    .slice(-MAX_TIMELINE);
  }

  estado.pendenteAuto=null;

  salvarEstado();
}


/* =========================================================
   ENTRADA DO NÚMERO

   Atualiza visual primeiro.
   Análise pesada depois.
========================================================= */

function adicionarNumero(numero){

  avaliarPendentes(numero);

  historico.push(numero);

  historico=
  historico.slice(-MAX_HISTORICO);

  salvarHistorico();

  /*
    Número aparece imediatamente.
  */

  renderRapido();

  statusArea.textContent=
  "Entrou "+numero+
  " • recalculando próxima jogada...";

  /*
    Libera a pintura da interface
    antes do cálculo pesado.
  */

  setTimeout(()=>{
    renderCompleto();
  },0);
}


/* =========================================================
   INTERFACE
========================================================= */

document.body.innerHTML="";

document.body.style.cssText=
"margin:0;background:#101010;color:#fff;font-family:Arial,sans-serif";

const app=
document.createElement("div");

app.innerHTML=`

<style>

*{box-sizing:border-box}

button,textarea{
font-family:Arial,sans-serif
}

button{
cursor:pointer;
touch-action:manipulation
}

.app{
max-width:930px;
margin:auto;
padding:6px
}

h2{
text-align:center;
font-size:20px;
margin:5px 0 8px
}

.painel{
background:#1d1d1f;
border:1px solid #444;
border-radius:10px;
padding:8px;
margin-bottom:7px
}

.titulo{
font-size:9px;
font-weight:900;
color:#999
}

textarea{
width:100%;
height:60px;
background:#111;
color:#fff;
border:1px solid #555;
border-radius:7px;
padding:7px
}

.acoes,.controle{
display:flex;
gap:4px;
flex-wrap:wrap;
margin-top:5px
}

.btn{
background:#333;
border:1px solid #555;
color:#fff;
border-radius:7px;
padding:7px 9px;
font-weight:900
}

.ativo{
background:#007d98!important;
border-color:#00e5ff!important
}

.vencedor{
border-color:#00e5ff!important;
color:#00e5ff!important;
box-shadow:0 0 6px #00e5ff55
}

.status{
font-size:9px;
font-weight:900;
color:#00e5ff;
margin-top:5px
}

.motor{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:4px;
margin-top:6px
}

.card{
background:#111;
border:1px solid #333;
border-radius:7px;
padding:6px;
text-align:center
}

.card small{
display:block;
font-size:7px;
font-weight:900;
color:#777
}

.card strong{
font-size:14px
}

.ok{color:#00e676}
.aviso{color:#ffc107}
.ruim{color:#ff5252}

.momento{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:4px;
margin-top:6px
}

.mini{
background:#111;
border:1px solid #333;
border-radius:6px;
padding:5px;
text-align:center
}

.mini small{
display:block;
font-size:7px;
color:#777;
font-weight:900
}

.mini strong{
font-size:12px
}

.timelineLinha{
display:grid;
grid-template-columns:42px 1fr 45px;
gap:4px;
align-items:center;
margin-top:4px
}

.timelineNome{
font-size:9px;
font-weight:900
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
height:15px;
border-radius:3px;
display:flex;
align-items:center;
justify-content:center;
font-size:7px;
font-weight:900
}

.g{background:#00a651}
.l{background:#c62828}

.taxa{
font-size:9px;
font-weight:900;
text-align:right
}

.linha{
display:grid;
grid-template-columns:52px 1fr;
gap:4px;
align-items:center;
margin-top:4px
}

.rotulo{
font-size:7px;
font-weight:900;
color:#777
}

.scroll{
display:flex;
gap:3px;
overflow:auto
}

.bola,.regiao,.idbox{
min-width:32px;
height:32px;
display:flex;
align-items:center;
justify-content:center;
font-size:10px;
font-weight:900
}

.bola{
border-radius:50%;
border:2px solid #aaa
}

.regiao,.idbox{
border-radius:5px
}

.idbox{
background:#111;
border:1px solid #444;
gap:2px
}

.idtag{
padding:4px 2px;
border-radius:3px
}

.sinal{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:4px;
margin-top:6px
}

.sinalBox{
background:#111;
border:1px solid #333;
border-radius:6px;
padding:5px;
text-align:center
}

.sinalBox small{
display:block;
font-size:7px;
color:#777
}

.sinalBox strong{
font-size:14px
}

.zonas{
display:grid;
grid-template-columns:repeat(8,1fr);
gap:4px;
margin-top:6px
}

.zona{
background:#111;
border:1px solid #444;
border-radius:6px;
padding:5px 2px;
text-align:center
}

.zona strong{
display:block;
font-size:13px
}

.zona small{
font-size:6px;
color:#777
}

.jogadaLinha{
display:flex;
gap:5px;
overflow:auto;
margin-top:5px
}

.bloco{
min-width:135px;
background:#111;
border:1px solid #00e5ff;
border-radius:7px;
padding:6px;
text-align:center
}

.bloco.um{
border-color:#ffc107
}

.bloco small{
display:block;
font-size:7px;
color:#777;
font-weight:900
}

.bloco strong{
display:block;
font-size:20px
}

.nums{
border-top:1px solid #333;
padding-top:4px;
font-size:9px;
font-weight:900
}

.teclado{
display:grid;
grid-template-columns:repeat(6,1fr);
gap:4px;
margin-top:5px
}

.numeroBtn{
height:38px;
border:1px solid #666;
border-radius:6px;
color:#fff;
font-weight:900
}

.zeroBtn{
grid-column:span 6
}

@media(max-width:650px){

.motor{
grid-template-columns:repeat(3,1fr)
}

.momento{
grid-template-columns:repeat(3,1fr)
}

.zonas{
grid-template-columns:repeat(4,1fr)
}

}

</style>


<div class="app">

<h2>Análise 0 • 6 • 9</h2>


<section class="painel">

<textarea
id="entradaHistorico"
placeholder="Cole o histórico do mais antigo para o mais recente..."
></textarea>

<div class="acoes">

<button id="btnInserir" class="btn">
INSERIR HISTÓRICO
</button>

<button id="btnApagar" class="btn">
APAGAR ÚLTIMO
</button>

<button id="btnLimpar" class="btn">
APAGAR TUDO
</button>

</div>

<div id="statusArea" class="status">
Pronto.
</div>

</section>


<section class="painel">

<div class="titulo">
MOTOR ADAPTATIVO / ASSERTIVIDADE
</div>

<div class="controle">

<button id="auto" class="btn">
AUTO
</button>

<button id="rx4" class="btn">
4
</button>

<button id="rx5" class="btn">
5
</button>

<button id="rx6" class="btn">
6
</button>

</div>

<div id="motor" class="motor"></div>

<div id="momento" class="momento"></div>

<div style="margin-top:7px"
class="titulo">
TIMELINE REAL — PREVISÃO CONGELADA
</div>

<div id="timelines"></div>

</section>


<section class="painel">

<div class="titulo">
ÚLTIMOS 14
</div>

<div class="linha">

<div class="rotulo">
ROLETA
</div>

<div id="linhaRoleta"
class="scroll"></div>

</div>

<div class="linha">

<div class="rotulo">
REGIÃO
</div>

<div id="linhaRegiao"
class="scroll"></div>

</div>

<div class="linha">

<div class="rotulo">
ID
</div>

<div id="linhaID"
class="scroll"></div>

</div>

</section>


<section class="painel">

<div id="tituloRX"
class="titulo">
RAIO X
</div>

<div id="sinal"
class="sinal"></div>

<div id="zonas"
class="zonas"></div>

</section>


<section class="painel">

<div class="titulo">
JOGADA SUGERIDA
</div>

<div id="jogadaInfo"
class="status"></div>

<div id="jogadaArea"></div>

</section>


<section class="painel">

<div class="titulo">
TECLADO 0–36
</div>

<div id="teclado"
class="teclado"></div>

</section>

</div>
`;

document.body.appendChild(app);

const statusArea=
document.getElementById("statusArea");


/* =========================================================
   CORES
========================================================= */

function corNumero(numero){

  if(numero===0)
    return "#087c48";

  return numerosVermelhos.has(numero)
  ?
  "#c6283d"
  :
  "#181818";
}


/* =========================================================
   TIMELINE HTML
========================================================= */

function timelineHTML(nome,lista){

  const s=
  estatisticaTimeline(lista);

  return `

  <div class="timelineLinha">

    <div class="timelineNome">
      ${nome}
    </div>

    <div class="timeline">

      ${lista.slice(-20).map(x=>`

        <span
        class="gl ${x.green?"g":"l"}"
        title="Resultado ${x.resultado}">
        ${x.green?"G":"L"}
        </span>

      `).join("")}

    </div>

    <div class="taxa">
      ${s.total?s.taxa20.toFixed(0)+"%":"—"}
    </div>

  </div>

  `;
}


/* =========================================================
   RENDER RÁPIDO
========================================================= */

function renderRapido(){

  const janela=
  historico.slice(-14);

  document
  .getElementById("linhaRoleta")
  .innerHTML=
  janela.map(n=>`

    <div
    class="bola"
    style="background:${corNumero(n)}">
    ${n}
    </div>

  `).join("");


  document
  .getElementById("linhaRegiao")
  .innerHTML=
  janela.map(n=>{

    const r=
    regiaoDoNumero(n);

    return `

    <div
    class="regiao"
    style="background:${
      r
      ?
      coresRegioes[r]
      :
      "#555"
    }">
    ${n}
    </div>

    `;

  }).join("");


  document
  .getElementById("linhaID")
  .innerHTML=
  janela.map(n=>{

    const lista=
    idsQueBatem(n);

    if(!lista.length){

      return `
      <div class="idbox">—</div>
      `;
    }

    return `

    <div class="idbox">

    ${lista.map(id=>`

      <span
      class="idtag"
      style="background:${corDoId(id)}">
      ${id}
      </span>

    `).join("")}

    </div>

    `;

  }).join("");
}


/* =========================================================
   RENDER MOMENTO
========================================================= */

function renderMomento(){

  const m=
  analisarMomento();

  const totalAB=
  Math.max(
    1,
    m.alto+m.baixo
  );

  const totalCor=
  Math.max(
    1,
    m.vermelho+m.preto
  );

  const rankingTerminais=
  m.terminalViz
  .map((valor,t)=>({
    t,
    valor
  }))
  .sort(
    (a,b)=>b.valor-a.valor
  )
  .slice(0,3);

  const regiao=
  Object.entries(
    m.regioes
  )
  .sort((a,b)=>b[1]-a[1])[0];

  document
  .getElementById("momento")
  .innerHTML=`

  <div class="mini">
  <small>ALTO</small>
  <strong>
  ${(m.alto/totalAB*100).toFixed(0)}%
  </strong>
  </div>

  <div class="mini">
  <small>BAIXO</small>
  <strong>
  ${(m.baixo/totalAB*100).toFixed(0)}%
  </strong>
  </div>

  <div class="mini">
  <small>VERMELHO</small>
  <strong>
  ${(m.vermelho/totalCor*100).toFixed(0)}%
  </strong>
  </div>

  <div class="mini">
  <small>PRETO</small>
  <strong>
  ${(m.preto/totalCor*100).toFixed(0)}%
  </strong>
  </div>

  <div class="mini">
  <small>TERMINAIS</small>
  <strong>
  ${rankingTerminais
    .map(x=>"T"+x.t)
    .join(" • ")}
  </strong>
  </div>

  <div class="mini">
  <small>REGIÃO</small>
  <strong>
  ${regiao?regiao[0]:"—"}
  </strong>
  </div>

  `;
}


/* =========================================================
   RENDER MOTOR
========================================================= */

function classeTaxa(t){

  if(t>=90) return "ok";
  if(t>=85) return "aviso";

  return "ruim";
}


function renderMotor(
  ativoAuto
){

  const rec=
  estadoRecuperacao();

  const autoStats=
  rec.stats;

  document
  .getElementById("motor")
  .innerHTML=`

  <div class="card">
  <small>ESTADO</small>
  <strong class="${
    rec.nivel===0
    ?
    "ok"
    :
    rec.nivel===1
    ?
    "aviso"
    :
    "ruim"
  }">
  ${rec.nome}
  </strong>
  </div>

  <div class="card">
  <small>RX AUTO</small>
  <strong>
  ${ativoAuto?ativoAuto.tamanho:"—"}
  </strong>
  </div>

  <div class="card">
  <small>ÚLTIMOS 5</small>
  <strong class="${classeTaxa(autoStats.taxa5)}">
  ${autoStats.total?autoStats.taxa5.toFixed(0)+"%":"—"}
  </strong>
  </div>

  <div class="card">
  <small>ÚLTIMOS 10</small>
  <strong class="${classeTaxa(autoStats.taxa10)}">
  ${autoStats.total?autoStats.taxa10.toFixed(0)+"%":"—"}
  </strong>
  </div>

  <div class="card">
  <small>ÚLTIMOS 20</small>
  <strong class="${classeTaxa(autoStats.taxa20)}">
  ${autoStats.total?autoStats.taxa20.toFixed(0)+"%":"—"}
  </strong>
  </div>

  <div class="card">
  <small>LOSS SEGUIDOS</small>
  <strong class="${
    autoStats.lossSeguidos>=2
    ?
    "ruim"
    :
    ""
  }">
  ${autoStats.lossSeguidos}
  </strong>
  </div>

  `;

  document
  .getElementById("timelines")
  .innerHTML=

  timelineHTML(
    "AUTO",
    estado.timelineAuto
  )

  +

  timelineHTML(
    "RX4",
    estado.timeline[4]
  )

  +

  timelineHTML(
    "RX5",
    estado.timeline[5]
  )

  +

  timelineHTML(
    "RX6",
    estado.timeline[6]
  );
}


/* =========================================================
   RENDER RAIO X
========================================================= */

function renderRaioX(rx){

  document
  .getElementById("tituloRX")
  .textContent=

  estado.modo==="AUTO"
  ?
  `RAIO X ${rx.tamanho} — MAIS FORTE`
  :
  `RAIO X ${rx.tamanho} — MANUAL`;


  document
  .getElementById("sinal")
  .innerHTML=`

  <div class="sinalBox">
  <small>LINHA 0</small>
  <strong style="color:${COR_T0}">
  ${rx.sinais[0].toFixed(0)}%
  </strong>
  </div>

  <div class="sinalBox">
  <small>LINHA 6</small>
  <strong style="color:${COR_T6}">
  ${rx.sinais[6].toFixed(0)}%
  </strong>
  </div>

  <div class="sinalBox">
  <small>LINHA 9</small>
  <strong style="color:${COR_T9}">
  ${rx.sinais[9].toFixed(0)}%
  </strong>
  </div>

  `;


  document
  .getElementById("zonas")
  .innerHTML=
  rx.zonas.map(z=>`

    <div class="zona">

      <strong>
      ${z.label}
      </strong>

      <small>
      ${z.origem}
      </small>

    </div>

  `).join("");
}


/* =========================================================
   RENDER JOGADA
========================================================= */

function renderJogada(rx){

  const area=
  document.getElementById(
    "jogadaArea"
  );

  const info=
  document.getElementById(
    "jogadaInfo"
  );

  if(
    !rx ||
    !rx.jogada
  ){

    info.textContent=
    "AGUARDANDO";

    area.innerHTML="";

    return;
  }

  const rec=
  estadoRecuperacao();

  info.textContent=
  `RX${rx.tamanho} • ${
    rec.nome
  } • 28/37`;


  const dois=
  rx.jogada.blocos2
  .map(b=>`

    <div class="bloco">

    <small>
    2 VIZINHOS DO
    </small>

    <strong>
    ${b.centro}
    </strong>

    <div class="nums">
    ${b.numeros.join(" • ")}
    </div>

    </div>

  `).join("");


  const um=`

    <div class="bloco um">

    <small>
    1 VIZINHO DO
    </small>

    <strong>
    ${rx.jogada.bloco1.centro}
    </strong>

    <div class="nums">
    ${rx.jogada.bloco1.numeros.join(" • ")}
    </div>

    </div>

  `;


  area.innerHTML=`

  <div class="jogadaLinha">
  ${dois}
  </div>

  <div class="jogadaLinha">
  ${um}
  </div>

  `;
}


/* =========================================================
   RENDER CONTROLES
========================================================= */

function renderControles(
  auto
){

  ["auto","rx4","rx5","rx6"]
  .forEach(id=>{

    document
    .getElementById(id)
    .classList.remove(
      "ativo",
      "vencedor"
    );

  });

  if(estado.modo==="AUTO"){

    document
    .getElementById("auto")
    .classList.add("ativo");

    if(auto){

      document
      .getElementById(
        "rx"+auto.tamanho
      )
      .classList.add(
        "vencedor"
      );

    }

  }
  else{

    document
    .getElementById(
      "rx"+estado.manualRX
    )
    .classList.add("ativo");
  }
}


/* =========================================================
   RENDER COMPLETO
========================================================= */

function renderCompleto(){

  try{

    const analises=
    calcularAnalises();

    const auto=
    escolherAuto(analises);

    garantirPendentes(
      analises,
      auto
    );

    let ativo;

    if(estado.modo==="AUTO"){

      ativo=auto;

    }
    else{

      ativo=
      analises.find(
        x=>
        x.tamanho===
        estado.manualRX
      )
      ||
      auto;
    }

    renderRapido();

    renderMomento();

    renderMotor(auto);

    renderControles(auto);

    if(ativo){

      renderRaioX(ativo);
      renderJogada(ativo);

    }

    estado.ultimaAnalise=
    auto
    ?
    {
      rx:auto.tamanho,
      similaridade:auto.similaridade,
      hora:Date.now()
    }
    :
    null;

    salvarEstado();

    statusArea.textContent=
    auto
    ?
    "Próxima jogada calculada."
    :
    "Aguardando histórico suficiente.";

  }
  catch(erro){

    console.error(erro);

    statusArea.textContent=
    "Erro: "+
    (
      erro?.message ||
      "erro desconhecido"
    );
  }
}


/* =========================================================
   HISTÓRICO COLADO
========================================================= */

function extrairNumeros(texto){

  const x=
  texto.match(
    /\b(?:[0-9]|[12][0-9]|3[0-6])\b/g
  );

  if(!x)
    return [];

  return x
  .map(Number)
  .slice(-MAX_HISTORICO);
}


function inserirHistorico(){

  const campo=
  document.getElementById(
    "entradaHistorico"
  );

  const numeros=
  extrairNumeros(
    campo.value
  );

  if(!numeros.length){

    statusArea.textContent=
    "Nenhum número válido.";

    return;
  }

  historico=numeros;

  /*
    Histórico substituído:
    previsões/timeline antigas deixam
    de corresponder à sequência.
  */

  estado.pendentes={
    4:null,
    5:null,
    6:null
  };

  estado.pendenteAuto=null;

  estado.timeline={
    4:[],
    5:[],
    6:[]
  };

  estado.timelineAuto=[];

  salvarHistorico();
  salvarEstado();

  campo.value="";

  renderRapido();

  setTimeout(
    renderCompleto,
    0
  );
}


/* =========================================================
   APAGAR
========================================================= */

function apagarUltimo(){

  if(!historico.length)
    return;

  historico.pop();

  /*
    Estado mudou.
    Não usar snapshot antigo.
  */

  estado.pendentes={
    4:null,
    5:null,
    6:null
  };

  estado.pendenteAuto=null;

  salvarHistorico();
  salvarEstado();

  renderRapido();

  setTimeout(
    renderCompleto,
    0
  );
}


function apagarTudo(){

  if(
    !confirm("Apagar tudo?")
  ) return;

  historico=[];

  estado=
  estadoPadrao();

  salvarHistorico();
  salvarEstado();

  renderRapido();

  setTimeout(
    renderCompleto,
    0
  );
}


/* =========================================================
   AUTO / MANUAL

   IMPORTANTE:
   não cria nova previsão.
   Só muda o que está sendo exibido.
========================================================= */

function ativarAuto(){

  estado.modo="AUTO";

  salvarEstado();

  renderCompleto();
}


function ativarManual(rx){

  estado.modo="MANUAL";
  estado.manualRX=rx;

  salvarEstado();

  renderCompleto();
}


/* =========================================================
   EVENTOS
========================================================= */

document
.getElementById("btnInserir")
.onclick=
inserirHistorico;

document
.getElementById("btnApagar")
.onclick=
apagarUltimo;

document
.getElementById("btnLimpar")
.onclick=
apagarTudo;

document
.getElementById("auto")
.onclick=
ativarAuto;

document
.getElementById("rx4")
.onclick=
()=>ativarManual(4);

document
.getElementById("rx5")
.onclick=
()=>ativarManual(5);

document
.getElementById("rx6")
.onclick=
()=>ativarManual(6);


/* =========================================================
   TECLADO
========================================================= */

const teclado=
document.getElementById(
  "teclado"
);

for(let numero=1;
    numero<=36;
    numero++){

  const botao=
  document.createElement(
    "button"
  );

  botao.className=
  "numeroBtn";

  botao.textContent=
  numero;

  botao.style.background=
  corNumero(numero);

  botao.onclick=
  ()=>adicionarNumero(numero);

  teclado.appendChild(botao);
}

const zero=
document.createElement(
  "button"
);

zero.className=
"numeroBtn zeroBtn";

zero.textContent="0";

zero.style.background=
"#087c48";

zero.onclick=
()=>adicionarNumero(0);

teclado.appendChild(zero);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

renderRapido();

setTimeout(
  renderCompleto,
  0
);

})();
