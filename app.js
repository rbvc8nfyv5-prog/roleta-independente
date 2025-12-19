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

  const coresT = {
    0:"#00e5ff",1:"#ff1744",2:"#00e676",3:"#ff9100",
    4:"#d500f9",5:"#ffee58",6:"#2979ff",
    7:"#ff4081",8:"#76ff03",9:"#8d6e63"
  };

  const coresCavalo = { A:"#9c27b0", B:"#1e88e5", C:"#43a047" };
  const coresSetor = { TIER:"#e53935", ORPHANS:"#1e88e5", ZERO:"#43a047", VOISINS:"#8e24aa" };
  const coresColuna = {1:"#42a5f5",2:"#66bb6a",3:"#ffa726"};
  const coresDuzia  = {1:"#66bb6a",2:"#42a5f5",3:"#ef5350"};

  // ================= ESTADO =================
  let hist = [];
  let mostrar5 = false;
  let modoCavalos = false;
  let modoSetores = false;
  let modoRotulo = "T";

  // ================= FUNÇÕES =================
  const terminal = n => n % 10;
  const coluna = n => n===0?null:((n-1)%3)+1;
  const duzia = n => n===0?null:Math.ceil(n/12);

  function cavaloDoTerminal(t){
    if(cavalos.A.includes(t)) return "A";
    if(cavalos.B.includes(t)) return "B";
    return "C";
  }

  function corNumero(n){
    if(modoCavalos) return coresCavalo[cavaloDoTerminal(terminal(n))];
    if(modoSetores){
      for(let s in setores) if(setores[s].has(n)) return coresSetor[s];
    }
    if(n===0) return "#0f0";
    return reds.has(n) ? "#e74c3c" : "#222";
  }

  function coverTerminal(t){
    let s=new Set();
    terminais[t].forEach(n=>{
      let i=track.indexOf(n);
      s.add(n);
      s.add(track[(i+36)%37]);
      s.add(track[(i+1)%37]);
    });
    return s;
  }

  function melhoresPares(){
    let ult=hist.slice(-14);
    let pares=[];
    for(let a=0;a<10;a++){
      for(let b=a+1;b<10;b++){
        let ca=coverTerminal(a), cb=coverTerminal(b);
        let hits=ult.filter(n=>ca.has(n)||cb.has(n)).length;
        pares.push({a,b,hits});
      }
    }
    return pares.sort((x,y)=>y.hits-x.hits).slice(0,5);
  }

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

  // 🎯 ALVO SECO (6 números secos dentro do alvo)
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

      <div id="linhas"></div>

      <div style="border:1px solid #666;padding:6px;text-align:center;margin:6px 0">
        🎯 ALVO: <span id="centros"></span>
      </div>

      <div style="border:1px dashed #aaa;padding:6px;text-align:center;margin:6px 0">
        🎯 ALVO SECO: <span id="alvoSeco"></span>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">
        <button id="bTerm">Terminais</button>
        <button id="bCav">Cavalos</button>
        <button id="bCol">Coluna</button>
        <button id="bDuz">Dúzia</button>
        <button id="bSet">Setores</button>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:8px"></div>
    </div>
  `;

  const bTerm = document.getElementById("bTerm");
  const bCav  = document.getElementById("bCav");
  const bCol  = document.getElementById("bCol");
  const bDuz  = document.getElementById("bDuz");
  const bSet  = document.getElementById("bSet");
  const nums  = document.getElementById("nums");
  const linhas=document.getElementById("linhas");

  for(let i=0;i<5;i++){
    let d=document.createElement("div");
    d.id="h"+i;
    d.style="display:flex;gap:4px;justify-content:center;margin-bottom:4px";
    linhas.appendChild(d);
  }

  bTerm.onclick=()=>{mostrar5=!mostrar5;render();};
  bCav.onclick=()=>{modoCavalos=!modoCavalos;render();};
  bCol.onclick=()=>{modoRotulo=modoRotulo==="C"?"T":"C";render();};
  bDuz.onclick=()=>{modoRotulo=modoRotulo==="D"?"T":"D";render();};
  bSet.onclick=()=>{modoSetores=!modoSetores;render();};

  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.style="font-size:16px;padding:8px";
    b.onclick=()=>{hist.push(n);render();};
    nums.appendChild(b);
  }

  function render(){
    let ult=hist.slice(-14).reverse();
    let pares=melhoresPares();

    for(let i=0;i<5;i++){
      let h=document.getElementById("h"+i);
      h.style.display=(mostrar5||i===0)?"flex":"none";
      h.innerHTML="";
      let p=pares[i];
      ult.forEach((n,idx)=>{
        let w=document.createElement("div");
        let d=document.createElement("div");
        d.textContent=n;
        d.style=`width:24px;height:24px;line-height:24px;font-size:12px;
                 background:${corNumero(n)};color:#fff;border-radius:4px;
                 text-align:center`;
        w.appendChild(d);
        h.appendChild(w);
      });
    }

    document.getElementById("centros").textContent = analisarCentros().join(" · ");
    document.getElementById("alvoSeco").textContent = alvoSeco().join(" · ");
  }

  render();

})();
