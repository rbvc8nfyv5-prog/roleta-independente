(function () {

  // ================= CONFIG BASE =================
  const track = [32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26,0];

  const terminais = {
    0:[0,10,20,30],1:[1,11,21,31],2:[2,12,22,32],3:[3,13,23,33],
    4:[4,14,24,34],5:[5,15,25,35],6:[6,16,26,36],
    7:[7,17,27],8:[8,18,28],9:[9,19,29]
  };

  // ================= ESTADO =================
  let hist = [];

  // ================= FUNÇÕES BASE =================
  const terminal = n => n % 10;

  function vizinhos(n){
    let i = track.indexOf(n);
    return [
      track[(i+36)%37],
      track[(i+1)%37]
    ];
  }

  // ================= LEITURA DE TENDÊNCIA =================
  function tendenciaPorTerminal(){
    let mapa = {};
    let ult = hist.slice(-14);

    ult.forEach(n=>{
      let tBase = terminal(n);
      let bloco = terminais[tBase];

      bloco.forEach(x=>{
        vizinhos(x).forEach(v=>{
          let tv = terminal(v);
          mapa[tv] = (mapa[tv] || 0) + 1;
        });
      });
    });

    return Object.entries(mapa)
      .sort((a,b)=>b[1]-a[1])
      .map(([t,v])=>`T${t} (${v})`);
  }

  // ================= ALVO (MANTIDO) =================
  function analisarCentros(){
    if(hist.length<6) return [];
    let ult=hist.slice(-14).reverse();
    let usados=[];
    for(let n of ult){
      if(usados.every(x=>{
        let d=Math.abs(track.indexOf(x)-track.indexOf(n));
        return Math.min(d,37-d)>=6;
      })){
        usados.push(n);
        if(usados.length===3) break;
      }
    }
    return usados;
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";

  document.body.innerHTML = `
    <div style="padding:10px">
      <h3 style="text-align:center">App Caballerro</h3>

      <div style="border:1px solid #666;padding:6px;text-align:center;margin:6px 0">
        🎯 ALVO: <span id="centros"></span>
      </div>

      <div style="border:1px solid #444;padding:6px;text-align:center;margin:6px 0">
        📊 TENDÊNCIA DE TERMINAIS<br>
        <span id="trend"></span>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  const nums = document.getElementById("nums");

  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.style="font-size:16px;padding:8px;background:#333;color:#fff;border:1px solid #555";
    b.onclick=()=>{hist.push(n);render();};
    nums.appendChild(b);
  }

  function render(){
    document.getElementById("centros").textContent =
      analisarCentros().join(" · ");

    document.getElementById("trend").textContent =
      tendenciaPorTerminal().join(" | ");
  }

  render();

})();
