(function () {

  // ================= CONFIG BASE =================
  const track = [32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26,0];
  const reds = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

  const terminais = {
    0:[0,10,20,30],1:[1,11,21,31],2:[2,12,22,32],3:[3,13,23,33],
    4:[4,14,24,34],5:[5,15,25,35],6:[6,16,26,36],
    7:[7,17,27],8:[8,18,28],9:[9,19,29]
  };

  const cavalos = { A:[2,5,8], B:[0,3,6,9], C:[1,4,7] };

  const setores = {
    TIER:    new Set([27,13,36,11,30,8,23,10,5,24,16,33]),
    ORPHANS:new Set([1,20,14,31,9,17,34,6]),
    ZERO:    new Set([0,3,12,15,26,32,35]),
    VOISINS:new Set([2,4,7,18,19,21,22,25,28,29])
  };

  // ================= ÂNCORAS =================
  const ancoras = [12,32,2,22,13,23,33];

  // ================= ESTADO =================
  let hist = [];

  // ================= FUNÇÕES =================
  function coberturaAncora(a){
    let i = track.indexOf(a);
    return new Set([
      track[(i+36)%37],
      track[(i+35)%37],
      a,
      track[(i+1)%37],
      track[(i+2)%37]
    ]);
  }

  function ancoraDoNumero(n){
    // exceções explícitas
    if(n === 14) return 22;
    if(n === 34) return 13;

    for(let a of ancoras){
      if(coberturaAncora(a).has(n)) return a;
    }
  }

  function analisarCentros(){
    if(hist.length < 6) return [];
    let ult = hist.slice(-14).reverse();
    let usados = [];
    for(let n of ult){
      if(usados.every(x=>{
        let d = Math.abs(track.indexOf(x)-track.indexOf(n));
        return Math.min(d,37-d) >= 6;
      })){
        usados.push(n);
        if(usados.length === 3) break;
      }
    }
    return usados;
  }

  // 🎯 ALVO SECO (INALTERADO)
  function alvoSeco(){
    let centros = analisarCentros();
    if(centros.length < 3) return [];

    let range = new Set();
    centros.forEach(c=>{
      let i = track.indexOf(c);
      for(let d=-4; d<=4; d++){
        range.add(track[(i+37+d)%37]);
      }
    });

    let ordenado = [...range].sort(
      (a,b)=>track.indexOf(a)-track.indexOf(b)
    );

    let secos=[];
    for(let n of ordenado){
      if(secos.every(x=>{
        let d=Math.abs(track.indexOf(x)-track.indexOf(n));
        return Math.min(d,37-d)>=4;
      })){
        secos.push(n);
        if(secos.length===6) break;
      }
    }
    return secos;
  }

  // ================= UI =================
  document.body.innerHTML = `
    <div style="padding:10px;color:#fff;max-width:100vw">
      <h3 style="text-align:center">App Caballerro</h3>

      <div style="border:1px solid #666;padding:6px;text-align:center;margin:6px 0">
        🎯 ALVO: <span id="centros"></span>
      </div>

      <div style="border:1px solid #666;padding:6px;text-align:center;margin:6px 0">
        🎯 ALVO +: <span id="alvoMais"></span>
      </div>

      <div style="border:1px dashed #aaa;padding:6px;text-align:center;margin:6px 0">
        🎯 ALVO SECO: <span id="alvoSeco"></span>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:8px"></div>
    </div>
  `;

  const nums = document.getElementById("nums");

  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.style="font-size:16px;padding:8px";
    b.onclick=()=>{hist.push(n);render();};
    nums.appendChild(b);
  }

  function render(){
    let centros = analisarCentros();

    document.getElementById("centros").textContent =
      centros.join(" · ");

    document.getElementById("alvoMais").textContent =
      centros.map(n => ancoraDoNumero(n)).join(" · ");

    document.getElementById("alvoSeco").textContent =
      alvoSeco().join(" · ");
  }

  render();

})();
