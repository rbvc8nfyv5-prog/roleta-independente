(function () {

  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const terminal = n => n % 10;

  const corTerminal = {
    0:"#ff5252",1:"#ff9800",2:"#ffc107",3:"#00e676",
    4:"#00bcd4",5:"#2196f3",6:"#9c27b0",7:"#e91e63",
    8:"#8bc34a",9:"#ffffff"
  };

  const tabelaJogada = {
    0:[2,3,7],1:[3,5,9],2:[3,5,9],3:[5,6,9],4:[0,4,8],
    5:[0,5,7],6:[0,6,7],7:[0,7,9],8:[3,5,9],9:[3,5,9],
    10:[0,5,7],11:[0,5,7],12:[3,5,7],13:[3,5,9],14:[0,2,7],
    15:[3,5,9],16:[1,2,9],17:[1,5,7],18:[1,5,8],19:[0,4,8],
    20:[2,3,7],21:[1,6,9],22:[2,3,7],23:[2,3,8],24:[4,5,7],
    25:[1,2,5],26:[0,6,9],27:[2,3,9],28:[0,2,7],29:[2,3,9],
    30:[0,1,5],31:[3,5,8],32:[2,3,9],33:[3,5,7],34:[5,6,9],
    35:[0,5,7],36:[1,3,7]
  };

  const eixos = [
    { nome:"ZERO", trios:[[0,32,15],[19,4,21],[2,25,17],[34,6,27]] },
    { nome:"TIERS", trios:[[13,36,11],[30,8,23],[10,5,24],[16,33,1]] },
    { nome:"ORPHELINS", trios:[[20,14,31],[9,22,18],[7,29,28],[12,35,3]] }
  ];

  let timeline = [];
  let rotacao = 0;
  let melhorRotacao = 0;

  let analises = { MANUAL: { filtros:new Set(), res:[] } };

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
  }

  function rotacionarNumero(n, offset){
    const i = track.indexOf(n);
    return track[(i + offset + 37) % 37];
  }

  function triosSelecionados(filtros, offset=rotacao){

    let selecionados=[];
    let restantes=[];

    eixos.forEach(e=>{
      e.trios.forEach(trio=>{
        const inter = trio.map(terminal)
          .filter(t=>!filtros.size||filtros.has(t)).length;

        const obj = {eixo:e.nome,trio};

        if(inter>0) selecionados.push(obj);
        else restantes.push(obj);
      });
    });

    const todos = [...selecionados, ...restantes].slice(0,9);

    return todos.map(x=>{
      return {
        eixo:x.eixo,
        trio:x.trio.map(n=>rotacionarNumero(n,offset))
      };
    });
  }

  function validarNumero(n, filtros, offset=rotacao){
    return triosSelecionados(filtros,offset)
      .some(x=>x.trio.includes(n));
  }

  function registrar(n, filtrosAtivos){
    analises.MANUAL.res.unshift(
      validarNumero(n,filtrosAtivos)?"V":"X"
    );
  }

  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:1000px;margin:auto">

      <h3 style="text-align:center">CSM</h3>

      Rotação:
      <input type="range" min="-5" max="5" value="0" id="rot">
      <span id="rotVal">0</span>
      <div style="margin-top:6px;color:#00e676">
        Melhor Rotação Simulada:
        <span id="bestRot">0</span>
      </div>

      <div style="margin:10px 0">
        🕒 Timeline:
        <span id="tl" style="font-size:18px;font-weight:600"></span>
      </div>

      <div id="nums"
        style="display:grid;grid-template-columns:repeat(9,1fr);
        gap:6px;margin-top:12px"></div>

    </div>
  `;

  rot.oninput = function(){
    rotacao = +this.value;
    rotVal.innerText = rotacao;
    render();
  };

  for(let n=0;n<=36;n++){
    const b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>add(n);
    nums.appendChild(b);
  }

  function simularMelhorRotacao(n,filtros){

    let melhor = 0;

    for(let r=-5;r<=5;r++){
      if(validarNumero(n,filtros,r)){
        melhor = r;
        break;
      }
    }

    return melhor;
  }

  function add(n){

    const filtrosAntes = new Set(analises.MANUAL.filtros);

    // simula antes de registrar
    melhorRotacao = simularMelhorRotacao(n,filtrosAntes);

    registrar(n,filtrosAntes);

    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();

    if(tabelaJogada[n]){
      analises.MANUAL.filtros.clear();
      tabelaJogada[n].forEach(t=>{
        analises.MANUAL.filtros.add(t);
      });
    }

    render();
  }

  function render(){

    bestRot.innerText = melhorRotacao;

    tl.innerHTML = timeline.map((n,i)=>{
      const r=analises.MANUAL.res[i];
      const c=r==="V"?"#00e676":r==="X"?"#ff5252":"#aaa";
      return `<span style="color:${c}">${n}</span>`;
    }).join(" · ");
  }

  render();

})();
