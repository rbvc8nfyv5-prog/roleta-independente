(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];
  const terminal = n => n % 10;

  // ================= TABELA COMPLETA ATUALIZADA =================
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
  let rotaçãoGlobal = 0;

  let analises = {
    MANUAL: { filtros:new Set(), res:[] }
  };

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
  }

  function triosSelecionados(filtros){
    let lista=[];
    eixos.forEach(e=>{
      e.trios.forEach(trio=>{
        const inter = trio.map(terminal)
          .filter(t=>!filtros.size||filtros.has(t)).length;
        if(inter>0) lista.push({eixo:e.nome,trio});
      });
    });
    return lista.slice(0,9);
  }

  function validarNumero(n, filtros){
    return triosSelecionados(filtros).some(x=>x.trio.includes(n));
  }

  function rotacionarTerminal(t){
    return (t + rotaçãoGlobal + 10) % 10;
  }

  function recalcularTudo(){

    analises.MANUAL.res = [];
    analises.MANUAL.filtros.clear();

    const copiaTimeline = [...timeline].reverse(); // do mais antigo ao mais recente

    copiaTimeline.forEach(n=>{

      const filtrosAntes = new Set(analises.MANUAL.filtros);

      analises.MANUAL.res.unshift(
        validarNumero(n,filtrosAntes)?"V":"X"
      );

      if(tabelaJogada[n]){
        analises.MANUAL.filtros.clear();
        tabelaJogada[n].forEach(t=>{
          analises.MANUAL.filtros.add(rotacionarTerminal(t));
        });
      }

    });

    render();
  }

  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:1000px;margin:auto">
      <h3 style="text-align:center">CSM</h3>

      <div style="margin-bottom:10px">
        Rotação:
        <input type="range" min="-5" max="5" value="0" id="rotRange">
        <span id="rotVal">0</span>
      </div>

      <div style="margin:10px 0">
        🕒 Timeline:
        <span id="tl" style="font-size:18px;font-weight:600"></span>
      </div>

      <div style="border:1px solid #555;padding:8px;margin-bottom:10px">
        Terminais:
        <div id="btnT" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div><b>ZERO</b><div id="cZERO"></div></div>
        <div><b>TIERS</b><div id="cTIERS"></div></div>
        <div><b>ORPHELINS</b><div id="cORPH"></div></div>
      </div>

      <div style="margin-top:15px;border:1px solid #444;padding:6px">
        <b>Timeline Conjuntos (Vizinhos Race)</b>
        <div id="tlConj"></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>
    </div>
  `;

  rotRange.oninput = function(){
    rotaçãoGlobal = parseInt(this.value);
    rotVal.innerText = rotaçãoGlobal;
    recalcularTudo();
  };

  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.textContent="T"+t;
    b.style="padding:6px;background:#444;color:#fff;border:1px solid #666";
    btnT.appendChild(b);
  }

  for(let n=0;n<=36;n++){
    const b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>add(n);
    nums.appendChild(b);
  }

  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    recalcularTudo();
  }

  function render(){

    tl.innerHTML = timeline.map((n,i)=>{
      const r=analises.MANUAL.res[i];
      const c=r==="V"?"#00e676":r==="X"?"#ff5252":"#aaa";
      return `<span style="color:${c}">${n}</span>`;
    }).join(" · ");

    const filtros = analises.MANUAL.filtros;

    const trios = triosSelecionados(filtros);
    const por={ZERO:[],TIERS:[],ORPHELINS:[]};
    trios.forEach(x=>por[x.eixo].push(x.trio.join("-")));
    cZERO.innerHTML=por.ZERO.join("<div></div>");
    cTIERS.innerHTML=por.TIERS.join("<div></div>");
    cORPH.innerHTML=por.ORPHELINS.join("<div></div>");

    document.querySelectorAll("#btnT button").forEach(b=>{
      const t=+b.textContent.slice(1);
      b.style.background =
        filtros.has(t) ? "#00e676" : "#444";
    });

    const numerosMarcados = new Set();

    filtros.forEach(t=>{
      track.forEach(n=>{
        if(terminal(n)===t){
          vizinhosRace(n).forEach(v=>{
            numerosMarcados.add(v);
          });
        }
      });
    });

    tlConj.innerHTML = timeline.map(n=>{
      const ativo = numerosMarcados.has(n);
      return `<span style="
        color:${ativo?"#00e676":"#555"};
        font-weight:${ativo?"700":"400"};
      ">${n}</span>`;
    }).join(" · ");
  }

  render();

})();
