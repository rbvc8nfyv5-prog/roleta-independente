(function () {

  // ===== TRACK FÍSICO =====
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,
    30,8,23,10,5,24,16,33,1,20,14,31,9,
    22,18,29,7,28,12,35,3,26,0
  ];

  const reds = new Set([
    1,3,5,7,9,12,14,16,18,19,
    21,23,25,27,30,32,34,36
  ]);

  // ===== ÂNCORAS =====
  const ancoras = [12, 32, 2, 13, 23, 33, 22];

  const coresAncora = {
    12: "#e53935",
    32: "#8e24aa",
    2:  "#3949ab",
    13: "#fb8c00",
    23: "#00897b",
    33: "#6d4c41",
    22: "#fdd835"
  };

  // ===== ESTADO =====
  let hist = []; // máximo 14

  // ===== FUNÇÕES =====
  function corNumero(n){
    if(n === 0) return "#2ecc71";
    return reds.has(n) ? "#c0392b" : "#111";
  }

  function ehDoisVizinhos(n, a){
    const ia = track.indexOf(a);
    const inx = track.indexOf(n);

    let dist = Math.abs(ia - inx);
    dist = Math.min(dist, track.length - dist);

    if(a === 22 && n === 14) return true;
    if(a === 13 && n === 34) return true;

    return dist <= 2;
  }

  function ancoraDoNumero(n){
    for(let a of ancoras){
      if(ehDoisVizinhos(n, a)) return a;
    }
    return null;
  }

  // ===== UI =====
  document.body.innerHTML = `
    <div style="
      background:#0f0f0f;
      color:#f1f1f1;
      padding:12px;
      font-family:Arial;
      overflow:hidden;
    ">

      <h3 style="text-align:center;margin:6px 0 10px">
        Linha do Tempo
      </h3>

      <!-- QUADRO DA LINHA DO TEMPO -->
      <div style="
        border:1px solid #444;
        border-radius:8px;
        padding:12px 8px;
        margin-bottom:20px;
        background:#141414;
      ">
        <div id="linha" style="
          display:flex;
          flex-wrap:wrap;
          gap:6px;
          justify-content:center;
        "></div>
      </div>

      <!-- BOTÕES DE INSERIR -->
      <div id="nums" style="
        display:grid;
        grid-template-columns:repeat(9, 1fr);
        gap:6px;
      "></div>

    </div>
  `;

  const linha = document.getElementById("linha");
  const nums  = document.getElementById("nums");

  // ===== BOTÕES DE INSERIR (0–36) =====
  for(let n=0;n<=36;n++){
    let b = document.createElement("button");
    b.textContent = n;
    b.style = `
      padding:10px;
      height:44px;
      font-size:15px;
      font-weight:bold;
      border-radius:6px;
      background:#1a1a1a;
      border:1px solid #333;
      color:#00e5ff; /* COR DO NÚMERO (igual à imagem) */
    `;
    b.onclick = () => {
      hist.push(n);
      if(hist.length > 14) hist.shift();
      render();
    };
    nums.appendChild(b);
  }

  // ===== RENDER =====
  function render(){
    linha.innerHTML = "";

    // mais recente à esquerda
    [...hist].reverse().forEach(n => {
      const a = ancoraDoNumero(n);

      const box = document.createElement("div");
      box.style = `
        width:44px;
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:4px;
      `;

      const num = document.createElement("div");
      num.style = `
        width:44px;
        height:44px;
        background:${corNumero(n)};
        border-radius:6px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:18px;
        font-weight:bold;
        color:#f1f1f1;
      `;
      num.textContent = n;

      box.appendChild(num);

      // ÂNCORA MAIOR (legível)
      if(a !== null){
        const lbl = document.createElement("div");
        lbl.style = `
          font-size:15px;   /* AUMENTADO */
          font-weight:bold;
          line-height:15px;
          color:${coresAncora[a]};
        `;
        lbl.textContent = a;
        box.appendChild(lbl);
      }

      linha.appendChild(box);
    });
  }

})();
