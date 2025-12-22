(function () {

  // ================= CONFIG BASE =================
  const terminais = {
    0:[0,10,20,30],
    1:[1,11,21,31],
    2:[2,12,22,32],
    3:[3,13,23,33],
    4:[4,14,24,34],
    5:[5,15,25,35],
    6:[6,16,26,36],
    7:[7,17,27],
    8:[8,18,28],
    9:[9,19,29]
  };

  // ================= ESTADO =================
  let hist = [];

  // ================= FUNÇÕES BASE =================
  const terminal = n => n % 10;

  // ================= FORÇA DOS TERMINAIS (últimos 14) =================
  function forcaTerminais(){
    let mapa = {};
    for(let t=0;t<=9;t++) mapa[t]=0;

    hist.slice(-14).forEach(n=>{
      mapa[terminal(n)]++;
    });

    return mapa;
  }

  // ================= CSM / TRINCA ATIVA (3 últimos) =================
  function trincaAtiva(){
    if(hist.length < 3) return [];

    let ultimos3 = hist.slice(-3);
    let set = new Set();

    ultimos3.forEach(n=>{
      set.add(terminal(n));
    });

    return [...set].sort(); // normalizada
  }

  // ================= ALVOS FIXOS DA TRINCA =================
  function alvosFixos(){
    let trinca = trincaAtiva();
    let nums = [];

    trinca.forEach(t=>{
      terminais[t].forEach(n=>{
        nums.push(n);
      });
    });

    return nums;
  }

  // ================= UI =================
  document.body.style.background = "#111";
  document.body.style.color = "#fff";

  document.body.innerHTML = `
    <div style="padding:10px;font-family:sans-serif">
      <h3 style="text-align:center">App Caballerro</h3>

      <div style="margin-bottom:6px">
        🕒 Linha do tempo (espelhada): <span id="timeline"></span>
      </div>

      <div style="border:1px solid #555;padding:6px;margin:6px 0;text-align:center">
        📊 Força dos Terminais (14):<br>
        <span id="forca"></span>
      </div>

      <div style="border:1px solid #666;padding:6px;margin:6px 0;text-align:center">
        🔢 CSM / Trinca Ativa (3 últimos): <span id="trinca"></span>
      </div>

      <div style="border:1px solid #999;padding:6px;margin:6px 0;text-align:center">
        🎯 ALVOS FIXOS DA TRINCA (<span id="qtd"></span>):<br>
        <span id="alvos"></span>
      </div>

      <div id="nums"
           style="display:grid;grid-template-columns:repeat(9,1fr);
                  gap:6px;margin-top:10px">
      </div>
    </div>
  `;

  const nums = document.getElementById("nums");

  // ================= BOTÕES =================
  for(let n=0;n<=36;n++){
    let b = document.createElement("button");
    b.textContent = n;
    b.style = "padding:8px;background:#333;color:#fff;border:1px solid #555";
    b.onclick = ()=>{ hist.push(n); render(); };
    nums.appendChild(b);
  }

  // ================= RENDER =================
  function render(){
    // linha do tempo espelhada
    document.getElementById("timeline").textContent =
      hist.slice(-14).reverse().join(" · ");

    // força dos terminais
    let forca = forcaTerminais();
    document.getElementById("forca").textContent =
      Object.entries(forca)
        .map(([t,v])=>`T${t}:${v}`)
        .join(" | ");

    // trinca ativa
    let tr = trincaAtiva();
    document.getElementById("trinca").textContent =
      tr.length ? tr.map(t=>"T"+t).join(" · ") : "-";

    // alvos fixos
    let alvos = alvosFixos();
    document.getElementById("alvos").textContent =
      alvos.join(" · ");

    document.getElementById("qtd").textContent =
      alvos.length;
  }

  render();

})();
