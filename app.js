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
    12: "#e53935", // vermelho
    32: "#8e24aa", // roxo
    2:  "#3949ab", // azul
    13: "#fb8c00", // laranja
    23: "#00897b", // verde azulado
    33: "#6d4c41", // marrom
    22: "#fdd835"  // amarelo
  };

  // ===== ESTADO =====
  let hist = []; // máximo 14 números

  // ===== FUNÇÕES =====
  function corNumero(n){
    if(n === 0) return "#2ecc71";
    return reds.has(n) ? "#e74c3c" : "#222";
  }

  function ehDoisVizinhos(n, a){
    const ia = track.indexOf(a);
    const inx = track.indexOf(n);

    let dist = Math.abs(ia - inx);
    dist = Math.min(dist, track.length - dist);

    // exceções manuais
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
      background:#111;
      color:#fff;
      padding:12px;
      font-family:Arial;
      overflow:hidden;
    ">

      <h3 style="text-align:center;margin:6px 0 10px">
        Linha do Tempo (14 | mais recente à esquerda)
      </h3>

      <!-- LINHA DO TEMPO -->
      <div id="linha" style="
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        justify-content:center;
        margin-bottom:14px;
      "></div>

      <!-- BOTÕES DE ENTRADA -->
      <div id="nums" style="
        display:grid;
        grid-template-columns:repeat(9, 1fr);
        gap:6px;
      "></div>

    </div>
  `;

  const linha = document.getElementById("linha");
  const nums  = document.getElementById("nums");

  // ===== BOTÕES DE ENTRADA =====
  for(let n=0;n<=36;n++){
    let b = document.createElement("button");
    b.textContent = n;
    b.style = `
      padding:10px;
      font-size:14px;
      border-radius:6px;
      height:44px;
    `;
    b.onclick = () => {
      hist.push(n);

      // mantém só os 14 mais recentes
      if(hist.length > 14){
        hist.shift(); // remove o mais antigo
      }

      render();
    };
    nums.appendChild(b);
  }

  // ===== RENDER =====
  function render(){
    linha.innerHTML = "";

    // MAIS RECENTE À ESQUERDA
    [...hist].reverse().forEach(n => {
      const a = ancoraDoNumero(n);

      const box = document.createElement("div");
      box.style = `
        width:44px;
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:2px;
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
        font-size:14px;
        font-weight:bold;
      `;
      num.textContent = n;

      box.appendChild(num);

      // rótulo da âncora (igual à regra do T)
      if(a !== null){
        const lbl = document.createElement("div");
        lbl.style = `
          font-size:9px;
          font-weight:bold;
          line-height:10px;
          color:${coresAncora[a]};
        `;
        lbl.textContent = a;
        box.appendChild(lbl);
      }

      linha.appendChild(box);
    });
  }

})();
