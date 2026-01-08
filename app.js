// ==================== PARES DE TERMINAIS ====================

// gera os 45 pares (0–9)
function gerar45Pares(){
  const pares = [];
  for(let i=0;i<=9;i++){
    for(let j=i+1;j<=9;j++){
      pares.push([i,j]);
    }
  }
  return pares;
}

// retorna o terminal
const terminal = n => n % 10;

// verifica se um número pertence ao par
function pertenceAoPar(n, par){
  const t = terminal(n);
  return t === par[0] || t === par[1];
}

// conta ocorrências no histórico
function contarNoHistorico(par){
  return hist.filter(n => pertenceAoPar(n, par)).length;
}

// conta ocorrências nos últimos N giros
function contarNosUltimos(par, n=30){
  return hist.slice(-n).filter(x => pertenceAoPar(x, par)).length;
}

// mede tendência (recente vs média)
function tendenciaPar(par){
  const total = contarNoHistorico(par);
  const recente = contarNosUltimos(par, 30);
  const mediaEsperada = hist.length ? total * (30 / hist.length) : 0;
  return recente - mediaEsperada;
}

// mede sequência (blocos consecutivos)
function medirSequencia(par){
  let maxSeq = 0, atual = 0;
  hist.forEach(n=>{
    if(pertenceAoPar(n,par)){
      atual++;
      if(atual > maxSeq) maxSeq = atual;
    } else {
      atual = 0;
    }
  });
  return maxSeq;
}

// confluência com últimos chamados
function confluenciaChamados(par, ultimos=14){
  const ult = hist.slice(-ultimos);
  let pontos = 0;
  ult.forEach((n,i)=>{
    if(pertenceAoPar(n,par)){
      pontos += (ultimos - i); // peso por recência
    }
  });
  return pontos;
}

// ==================== ANÁLISE PRINCIPAL ====================

function analisarPares(){
  const pares = gerar45Pares();

  const W_FREQ   = 1.0;
  const W_REC    = 1.5;
  const W_TREND  = 2.0;
  const W_SEQ    = 1.2;
  const W_CONF   = 2.5;

  const ranking = pares.map(par=>{
    const freqTotal = contarNoHistorico(par);
    const freqRec   = contarNosUltimos(par, 30);
    const trend     = tendenciaPar(par);
    const seq       = medirSequencia(par);
    const conf      = confluenciaChamados(par, 14);

    const score =
      W_FREQ  * freqTotal +
      W_REC   * freqRec +
      W_TREND * trend +
      W_SEQ   * seq +
      W_CONF  * conf;

    return {
      par,
      score,
      freqTotal,
      freqRec,
      trend,
      seq,
      conf
    };
  });

  ranking.sort((a,b)=>b.score - a.score);

  // retorna os DOIS melhores
  return ranking.slice(0,2);
}
