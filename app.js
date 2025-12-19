(function () {

  // ================= TRACK FÍSICO =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,
    30,8,23,10,5,24,16,33,1,20,14,31,9,
    22,18,29,7,28,12,35,3,26,0
  ];

  const reds = new Set([
    1,3,5,7,9,12,14,16,18,19,
    21,23,25,27,30,32,34,36
  ]);

  // ================= ESTADO =================
  let hist = []; // linha do tempo (máx 14)

  // ================= FUNÇÕES BASE =================
  function corNumero(n){
    if(n === 0) return "#2ecc71";
    return reds.has(n) ? "#c0392b" : "#111";
  }

  // ================= REGRA T CLÁSSICA =================

  // 3 centros estruturais
  function centrosT(){
    let centros = [];
    let ult = hist.slice(-14).reverse();

    for(let n of ult){
      if(centros.every(x=>{
        let d = Math.abs(track.indexOf(x) - track.indexOf(n));
        return Math.min(d, track.length - d) >= 9;
      })){
        centros.push(n);
        if(centros.length === 3) break;
      }
    }
    return centros;
  }

  // bloco T: 4 vizinhos para cada lado
  function blocosT(){
    return centrosT().map(c=>{
      let i = track.indexOf(c);
      let nums = [];
      for(let d=-4; d<=4; d++){
        nums.push(track[(i + d + track.length) % track.length]);
      }
      return { centro:c, nums };
    });
  }

  // SECO: 6 números fora do miolo
  function seco6(){
    let pool = new Set();

    centrosT().forEach(c=>{
      let i = track.indexOf(c);
      for(let d=-6; d<=6; d++){
        pool.add(track[(i + d + track.length) % track.length]);
      }
    });

    let ordenado = [...pool].sort(
      (a,b)=>track.indexOf(a)-track.indexOf(b)
    );

    let secos = [];
    for(let n of ordenado){
      if(secos.every(x=>{
        let d=Math.abs(track.indexOf(x)-track.indexOf(n));
        return Math.min(d,track.length-d)>=6;
      })){
        secos.push(n);
        if(secos.length===6) break;
      }
    }
    return secos;
  }

  // ================= UI =================
  document.body.innerHTML = `
    <div style="
      background:#0f0f0f;
      color:#f1f1f1;
      padding:12px;
      font-family:Arial;
      overflow:hidden;
    ">

      <h3 style="text-align:center;margin:6px 0 10px">
        Painel – Regra T Clássica
      </h3>

      <!-- LINHA DO TEMPO -->
      <div style="
        border:1px solid #444;
        border-radius:8px;
        padding:10px;
        margin-bottom:14px;
        background:#141414;
      ">
        <div id="linha" style="
          display:flex;
          flex-wrap:wrap;
          gap:6px;
          justify-content:center;
        "></div>
      </div>

      <!-- T CLÁSSICO -->
      <div style="
        border:1px solid #555;
        border-radius:8px;
        padding:10px;
        margin-bottom:14px;
        background:#121212;
      ">
        <div style="text-align:center;font-size:13px;margin-bottom:6px;color:#bbb">
          🎯 T CLÁSSICO — 3 centros · 4 vizinhos por lado
        </div>
        <div id="blocosT"
          style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
        </div>
      </div>

      <!-- SECO -->
      <div style="
        border:1px dashed #666;
        border-radius:8px;
        padding:10px;
        margin-bottom:18px;
        background:#101010;
      ">
        <div style="text-align:center;font-size:13px;margin-bottom:6px;color:#bbb">
          🎯 SECO — 6 números
        </div>
        <div id="seco"
          style="display:flex;gap:10px;justify-content:center">
        </div>
      </div>

      <!-- BOTÕES DE INSERIR -->
      <div id="nums" style="
        display:grid;
        grid-template-columns:repeat(9,1fr);
        gap:6px;
      "></div>

    </div>
  `;

  const linha   = document.getElementById("linha");
  const blocos = document.getElementById("blocosT");
  const seco   = document.getElementById("seco");
  const nums   = document.getElementById("nums");

  // ================= BOTÕES 0–36 =================
  for(let n=0;n<=36;n++){
    let b = document.createElement("button");
    b.textContent = n;
    b.style = `
      height:44px;
      font-size:15px;
      font-weight:bold;
      border-radius:6px;
      background:#1a1a1a;
      border:1px solid #333;
      color:#00e5ff;
    `;
    b.onclick = () => {
      hist.push(n);
      if(hist.length > 14) hist.shift();
      render();
    };
    nums.appendChild(b);
  }

  // ================= RENDER =================
  function render(){

    // Linha do tempo
    linha.innerHTML = "";
    [...hist].reverse().forEach(n=>{
      let d=document.createElement("div");
      d.style=`
        width:44px;height:44px;
        background:${corNumero(n)};
        border-radius:6px;
        display:flex;align-items:center;justify-content:center;
        font-size:18px;font-weight:bold;color:#f1f1f1
      `;
      d.textContent=n;
      linha.appendChild(d);
    });

    // T clássico
    blocos.innerHTML = "";
    blocosT().forEach(b=>{
      let col=document.createElement("div");
      col.style="display:flex;flex-direction:column;gap:4px;align-items:center";

      b.nums.forEach(n=>{
        let d=document.createElement("div");
        d.style=`
          width:34px;height:34px;
          background:${corNumero(n)};
          border-radius:6px;
          display:flex;align-items:center;justify-content:center;
          font-size:13px;
          font-weight:${n===b.centro?"bold":"normal"};
          border:${n===b.centro?"2px solid #fff":"none"};
          color:#f1f1f1
        `;
        d.textContent=n;
        col.appendChild(d);
      });

      blocos.appendChild(col);
    });

    // Seco
    seco.innerHTML = "";
    seco6().forEach(n=>{
      let d=document.createElement("div");
      d.style=`
        width:36px;height:36px;
        background:${corNumero(n)};
        border-radius:6px;
        display:flex;align-items:center;justify-content:center;
        font-size:14px;font-weight:bold;color:#f1f1f1
      `;
      d.textContent=n;
      seco.appendChild(d);
    });
  }

})();
