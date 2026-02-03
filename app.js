(function () {

  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];
  const terminal = n => n % 10;

  const eixos = [
    {
      nome:"ZERO",
      trios:[
        [32,0,26,3,35],
        [15,19,4,21,2],
        [25,17,34,6,27]
      ]
    },
    {
      nome:"TIERS",
      trios:[
        [13,36,11,30,8,23],
        [10,5,24,16,33,1]
      ]
    },
    {
      nome:"ORPHELINS",
      trios:[
        [20,14,31,9,22],
        [18,29,7,28,12]
      ]
    }
  ];

  let timeline = [];
  let modoAtivo = "MANUAL";
  let modoConjuntos = false;
  let filtrosConjuntos = new Set();

  function vizinhosRace(n){
    const i = track.indexOf(n);
    return [track[(i+36)%37], n, track[(i+1)%37]];
  }

  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.innerHTML = `
    <div style="padding:10px;max-width:1000px;margin:auto">
      <h3 style="text-align:center">CSM</h3>

      <div style="margin-bottom:6px">
        🕒 Timeline:
        <div id="tl"></div>
      </div>

      <div style="display:flex;gap:6px;margin-bottom:6px">
        <button id="btnConj" style="background:#444;color:#fff">CONJUNTOS</button>
      </div>

      <div style="border:1px solid #555;padding:6px">
        Terminais:
        <div id="btnT" style="display:flex;gap:4px;flex-wrap:wrap"></div>
      </div>

      <div style="margin-top:6px">
        🔁 Timeline Conjunto:
        <div id="tlConj"></div>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:12px"></div>
    </div>
  `;

  const tl = document.getElementById("tl");
  const tlConj = document.getElementById("tlConj");
  const btnT = document.getElementById("btnT");
  const btnConj = document.getElementById("btnConj");

  btnConj.onclick=()=>{
    modoConjuntos=!modoConjuntos;
    btnConj.style.background = modoConjuntos?"#00e676":"#444";
    render();
  };

  for(let t=0;t<=9;t++){
    const b=document.createElement("button");
    b.textContent="T"+t;
    b.style="background:#444;color:#fff";
    b.onclick=()=>{
      filtrosConjuntos.has(t)?filtrosConjuntos.delete(t):filtrosConjuntos.add(t);
      render();
    };
    btnT.appendChild(b);
  }

  for(let n=0;n<=36;n++){
    const b=document.createElement("button");
    b.textContent=n;
    b.onclick=()=>add(n);
    nums.appendChild(b);
  }

  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    render();
  }

  function render(){
    tl.innerHTML = timeline.join(" · ");

    document.querySelectorAll("#btnT button").forEach(b=>{
      const t=+b.textContent.slice(1);
      b.style.background = filtrosConjuntos.has(t)?"#00e676":"#444";
    });

    if(modoConjuntos){
      const marcados=new Set();
      filtrosConjuntos.forEach(t=>{
        track.forEach(n=>{
          if(terminal(n)===t){
            vizinhosRace(n).forEach(v=>marcados.add(v));
          }
        });
      });

      tlConj.innerHTML = timeline.map(n=>{
        const c = marcados.has(n)?"#00e676":"#ff5252";
        return `<span style="color:${c}">${n}</span>`;
      }).join(" · ");
    } else {
      tlConj.innerHTML = "";
    }
  }

})();
