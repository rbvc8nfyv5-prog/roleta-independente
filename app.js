(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  const terminais = {
    0:[0,10,20,30],1:[1,11,21,31],2:[2,12,22,32],3:[3,13,23,33],
    4:[4,14,24,34],5:[5,15,25,35],6:[6,16,26,36],
    7:[7,17,27],8:[8,18,28],9:[9,19,29]
  };

  const ancoras = [12,32,2,22,13,23,33];

  // ================= ESTADO =================
  let hist = [];

  // ================= FUNÇÕES BASE =================
  const terminal = n => n % 10;

  function vizinhos(n){
    let i = track.indexOf(n);
    return [track[(i+36)%37], track[(i+1)%37]];
  }

  // ================= ESPALHAMENTO DO TERMINAL =================
  function espalhamentoTerminal(t){
    let set = new Set();
    terminais[t].forEach(n=>{
      vizinhos(n).forEach(v=>{
        set.add(terminal(v));
      });
    });
    return [...set];
  }

  // ================= FORÇA DOS TERMINAIS =================
  function forcaTerminal(){
    let mapa = {};
    let ult = hist.slice(-14);

    ult.forEach(n=>{
      let t = terminal(n);
      mapa[t] = (mapa[t] || 0) + 1;
      vizinhos(n).forEach(v=>{
        let tv = terminal(v);
        mapa[tv] = (mapa[tv] || 0) + 1;
      });
    });

    return mapa;
  }

  // ================= TERMINAIS PRIORITÁRIOS =================
  function terminaisPrioritarios(){
    if(hist.length === 0) return [];

    let ultimo = hist[hist.length - 1];
    let tBase = terminal(ultimo);

    let espalhados = espalhamentoTerminal(tBase);
    let forca = forcaTerminal();

    return espalhados
      .map(t => ({ t, score: forca[t] || 0 }))
      .sort((a,b)=>b.score - a.score)
      .slice(0,3)
      .map(o=>o.t);
  }

  // ================= ALVOS =================
  function alvos(){
    let ts = terminaisPrioritarios();
    let res = [];
    ts.forEach(t=>{
      terminais[t].forEach(n=>{
        if(!res.includes(n)) res.push(n);
      });
    });
    return res.slice(0,3);
  }

  // ================= ÂNCORAS =================
  function coberturaAncora(a){
    let i = track.indexOf(a);
    return [
      track[(i+36)%37], a, track[(i+1)%37]
    ];
  }

  function ancoraDoNumero(n){
    if(n === 14) return 22;
    if(n === 34) return 13;
    for(let a of ancoras){
      if(coberturaAncora(a).includes(n)) return a;
    }
    return ancoras[0];
  }

  function alvosMais(){
    let base = alvos();
    let res = [];
    base.forEach(n=>{
      let a = ancoraDoNumero(n);
      if(!res.includes(a)) res.push(a);
    });
    base.forEach(n=>{
      vizinhos(n).forEach(v=>{
        let a = ancoraDoNumero(v);
        if(res.length < 4 && !res.includes(a)) res.push(a);
      });
    });
    return res.slice(0,4);
  }

  // ================= ALVOS SECOS (INALTERADO) =================
  function alvoSeco(){
    let ts = terminaisPrioritarios();
    let secos = [];
    ts.forEach(t=>{
      terminais[t].forEach(n=>{
        if(secos.every(x=>{
          let d = Math.abs(track.indexOf(x)-track.indexOf(n));
          return Math.min(d,37-d) >= 4;
        })) secos.push(n);
      });
    });
    return secos.slice(0,6);
  }

  // ================= UI =================
  document.body.style.background = "#111";
  document.body.style.color = "#fff";

  document.body.innerHTML = `
    <div style="padding:10px;font-family:sans-serif">
      <h3 style="text-align:center">App Caballerro</h3>

      <div>🕒 Linha do tempo: <span id="tl"></span></div>
      <div>📊 TERMINAIS PRIORITÁRIOS: <span id="tp"></span></div>
      <div>🎯 ALVOS: <span id="alvos"></span></div>
      <div>🎯 ALVOS +: <span id="alvosMais"></span></div>
      <div>🎯 ALVOS SECOS: <span id="alvosSeco"></span></div>

      <div id="nums"
        style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px">
      </div>
    </div>
  `;

  const nums = document.getElementById("nums");

  for(let n=0;n<=36;n++){
    let b = document.createElement("button");
    b.textContent = n;
    b.style = "padding:8px;background:#333;color:#fff;border:1px solid #555";
    b.onclick = ()=>{ hist.push(n); render(); };
    nums.appendChild(b);
  }

  function render(){
    document.getElementById("tl").textContent =
      hist.slice(-14).join(" · ");

    document.getElementById("tp").textContent =
      terminaisPrioritarios().map(t=>"T"+t).join(" · ");

    document.getElementById("alvos").textContent =
      alvos().join(" · ");

    document.getElementById("alvosMais").textContent =
      alvosMais().join(" · ");

    document.getElementById("alvosSeco").textContent =
      alvoSeco().join(" · ");
  }

  render();

})();
