(function () {

  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const terminal = n => n % 10;

  const eixos = [
    { nome:"ZERO", trios:[[0,32,15],[19,4,21],[2,25,17],[34,6,27]] },
    { nome:"TIERS", trios:[[13,36,11],[30,8,23],[10,5,24],[16,33,1]] },
    { nome:"ORPHELINS", trios:[[20,14,31],[9,22,18],[7,29,28],[12,35,3]] }
  ];

  let timeline = [];
  let janela = 6;
  let modoAtivo = "MANUAL";
  let autoTAtivo = null;

  const gruposManual = [
    new Set([2,5,8,9]),
    new Set([1,4,7,9]),
    new Set([0,3,6,9])
  ];

  const analises = {
    MANUAL:{ filtros:new Set(), res:[] },
    VIZINHO:{ filtros:new Set(), res:[], motor:new Set() },
    NUNUM:{ filtros:new Set(), res:[] },
    AUTO:{
      3:{ filtros:new Set(), res:[] },
      4:{ filtros:new Set(), res:[] },
      5:{ filtros:new Set(), res:[] },
      6:{ filtros:new Set(), res:[] },
      7:{ filtros:new Set(), res:[] }
    }
  };

  let modoConjuntos=false;
  let filtrosConjuntos=new Set();

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [ track[(i+36)%37], n, track[(i+1)%37] ];
  }

  function calcularAutoT(k){
    const set=new Set();
    for(const n of timeline.slice(0,janela)){
      set.add(terminal(n));
      if(set.size>=k) break;
    }
    analises.AUTO[k].filtros=set;
  }

  function melhorTrincaBase(){
    const cont={};
    timeline.slice(0,janela).forEach(n=>{
      const t=terminal(n);
      cont[t]=(cont[t]||0)+1;
    });

    return Object.entries(cont)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,3)
      .map(x=>+x[0]);
  }

  function calcularVizinho(){
    const base=melhorTrincaBase();
    analises.VIZINHO.motor.clear();

    base.forEach(t=>{
      track.filter(n=>terminal(n)===t)
        .forEach(n=>vizinhosRace(n)
          .forEach(v=>analises.VIZINHO.motor.add(v))
        );
    });
  }

  function calcularNunum(){
    const set=new Set();
    timeline.slice(0,2).forEach(n=>{
      vizinhosRace(n).forEach(v=>set.add(terminal(v)));
    });
    analises.NUNUM.filtros=set;
  }

  function triosSelecionados(filtros){
    let lista=[];
    eixos.forEach(e=>{
      e.trios.forEach(trio=>{
        const inter=trio.map(terminal)
          .filter(t=>!filtros.size||filtros.has(t)).length;
        if(inter>0) lista.push({eixo:e.nome,trio});
      });
    });
    return lista.slice(0,9);
  }

  function validar(n,f){
    return triosSelecionados(f).some(x=>x.trio.includes(n));
  }

  function registrar(n){
    analises.MANUAL.res.unshift(validar(n,analises.MANUAL.filtros)?"V":"X");
    analises.VIZINHO.res.unshift(analises.VIZINHO.motor.has(n)?"V":"X");
    analises.NUNUM.res.unshift(validar(n,analises.NUNUM.filtros)?"V":"X");
    [3,4,5,6,7].forEach(k=>{
      analises.AUTO[k].res.unshift(validar(n,analises.AUTO[k].filtros)?"V":"X");
    });
  }

  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.innerHTML=`
  <div style="max-width:900px;margin:auto;padding:10px">
    <h3 style="text-align:center">CSM</h3>

    Histórico:
    <input id="inp" style="width:100%;background:#222;color:#fff"/>

    <button id="col">Colar</button>
    <button id="lim">Limpar</button>

    Janela:
    <select id="jan">
      ${Array.from({length:8},(_,i)=>`<option ${i+3===6?'selected':''}>${i+3}</option>`).join("")}
    </select>

    <div style="margin-top:8px">
      Timeline:
      <span id="tl"></span>
    </div>

    <div id="manualSec" style="margin-top:6px"></div>

    <div style="margin-top:8px">
      <button class="modo" data-m="MANUAL">MANUAL</button>
      <button class="modo" data-m="VIZINHO">VIZINHO</button>
      <button class="modo" data-m="NUNUM">NUNUM</button>
      <button id="btnConj">CONJUNTOS</button>
    </div>

    <div id="conjArea" style="margin-top:6px"></div>

    <div id="nums"></div>
  </div>
  `;

  document.querySelectorAll(".modo").forEach(b=>{
    b.onclick=()=>{modoAtivo=b.dataset.m;render();};
  });

  btnConj.onclick=()=>{
    modoConjuntos=!modoConjuntos;
    render();
  };

  for(let n=0;n<=36;n++){
    const b=document.createElement("button");
    b.textContent=n;
    b.onclick=()=>add(n);
    nums.appendChild(b);
  }

  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    registrar(n);
    calcularVizinho();
    calcularNunum();
    [3,4,5,6,7].forEach(calcularAutoT);
    render();
  }

  col.onclick=()=>{
    inp.value.split(/[\s,]+/)
      .map(Number).filter(n=>n>=0&&n<=36).forEach(add);
    inp.value="";
  };

  lim.onclick=()=>{
    timeline=[];
    render();
  };

  function render(){

    tl.innerHTML = timeline.join(" · ");

    // ===== MANUAL HORIZONTAL =====
    if(modoAtivo==="MANUAL"){

      manualSec.innerHTML = gruposManual.map(grupo=>{

        const marcados=new Set();

        track.forEach(n=>{
          if(grupo.has(terminal(n))){
            vizinhosRace(n).forEach(v=>marcados.add(v));
          }
        });

        return `
          <div style="display:flex;gap:3px;margin-top:4px">
            ${timeline.map(n=>`
              <span style="
                padding:3px 5px;
                background:${marcados.has(n)?"#00e676":"#222"};
                border-radius:3px;
              ">${n}</span>
            `).join("")}
          </div>
        `;
      }).join("");

    } else {
      manualSec.innerHTML="";
    }

    // ===== CONJUNTOS VOLTOU =====
    if(modoConjuntos){

      const marcados=new Set();

      filtrosConjuntos.forEach(t=>{
        track.forEach(n=>{
          if(terminal(n)===t){
            vizinhosRace(n).forEach(v=>marcados.add(v));
          }
        });
      });

      conjArea.innerHTML = `
        <div style="display:flex;gap:3px">
          ${timeline.map(n=>`
            <span style="
              padding:3px 5px;
              background:${marcados.has(n)?"#00e676":"#222"};
              border-radius:3px;
            ">${n}</span>
          `).join("")}
        </div>
      `;
    } else {
      conjArea.innerHTML="";
    }
  }

  render();

})();
