(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  // ================= TRINCAS =================
  const trincas = [
    [4,7,16],
    [2,20,30],
    [6,9,26],
    [17,23,31],
    [18,19,24],
    [9,17,26]
  ];

  // ================= ESTADO =================
  let hist = [];
  let timeline = [];
  let janela = 6;

  // estado por trinca
  let estadoTrincas = {};

  trincas.forEach(t=>{
    estadoTrincas[t.join("-")] = {
      wins: 0,
      quebras: 0,
      retornos: 0,
      ultimo: null
    };
  });

  // ================= UTIL =================
  function vizinhos(n, d){
    const i = track.indexOf(n);
    let a=[];
    for(let x=-d;x<=d;x++){
      a.push(track[(i+37+x)%37]);
    }
    return a;
  }

  function areaTrinca(trinca){
    let s = new Set();
    trinca.forEach(c=>{
      vizinhos(c,2).forEach(n=>s.add(n));
    });
    return s;
  }

  function cobertura(area, base){
    return base.filter(n=>area.has(n)).length;
  }

  // ================= ATUALIZA ESQUADRA =================
  function atualizarEsquadra(n){
    trincas.forEach(trinca=>{
      const key = trinca.join("-");
      const area = areaTrinca(trinca);
      const st = estadoTrincas[key];

      if(area.has(n)){
        if(st.quebras > 0){
          st.retornos = st.quebras;
        }
        st.wins++;
        st.quebras = 0;
        st.ultimo = "win";
      } else {
        st.quebras++;
        st.ultimo = "break";
      }
    });
  }

  // ================= TEXTO ESQUADRA =================
  function textoEsquadra(){
    let linhas = [];

    for(let k in estadoTrincas){
      const st = estadoTrincas[k];
      if(st.retornos > 0){
        let nivel =
          st.retornos === 1 ? "retorno de 1ª" :
          st.retornos === 2 ? "retorno de 2ª" :
          "retorno de 3ª+";
        linhas.push(`${k} → ${nivel}`);
      }
    }

    return linhas.length
      ? linhas.join("<br>")
      : "Nenhuma trinca em retorno no momento";
  }

  // ================= TRINCA DO TIMING =================
  function melhorTrincaTimeline(){
    const base = timeline.slice(0,janela);
    let best=null;

    trincas.forEach(trinca=>{
      const area = areaTrinca(trinca);
      const score = cobertura(area, base);
      if(!best || score > best.score){
        best = { trinca, score };
      }
    });

    return best;
  }

  // ================= PAR 1 =================
  function melhorParTimeline(){
    const base = timeline.slice(0,janela);
    let best=null;

    for(let a=0;a<10;a++){
      for(let b=a+1;b<10;b++){
        let area=new Set();
        track.forEach(n=>{
          if(n%10===a || n%10===b) area.add(n);
        });
        let sc=cobertura(area, base);
        if(!best || sc>best.score){
          best={a,b,score:sc};
        }
      }
    }
    return best;
  }

  // ================= TRINCA VINCULADA AO PAR =================
  function trincaVinculadaAoPar(par){
    if(!par) return null;

    let numsPar=new Set();
    track.forEach(n=>{
      if(n%10===par.a || n%10===par.b) numsPar.add(n);
    });

    let best=null;
    trincas.forEach(trinca=>{
      const area=areaTrinca(trinca);
      const sc=[...numsPar].filter(n=>area.has(n)).length;
      if(!best || sc>best.score){
        best={trinca,score:sc};
      }
    });
    return best;
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:900px;margin:auto">
      <h3 style="text-align:center">CSM – Esquadra das Trincas</h3>

      <div style="border:1px solid #444;padding:8px;margin-bottom:8px">
        📋 Cole histórico:
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff;border:1px solid #555"/>
        <div style="margin-top:6px">
          <button id="col">Colar</button>
          <button id="lim">Limpar</button>
        </div>
      </div>

      <div>🕒 Linha do tempo (14): <span id="tl"></span></div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🎯 <b>Trinca do Timing</b><br>
        <span id="trinca"></span>
      </div>

      <div style="border:1px solid #666;padding:8px;margin:6px 0">
        🔗 <b>Par 1</b><br>
        <span id="par1"></span><br>
        <small id="trincaPar"></small>
      </div>

      <div style="border:2px solid #0f0;padding:10px;margin:8px 0">
        🟢 <b>Esquadra (retorno das trincas)</b><br>
        <span id="esquadra"></span>
      </div>

      <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
    </div>
  `;

  const nums=document.getElementById("nums");
  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>add(n);
    nums.appendChild(b);
  }

  function add(n){
    hist.push(n);
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    atualizarEsquadra(n);
    render();
  }

  document.getElementById("col").onclick=()=>{
    document.getElementById("inp").value
      .split(/[\s,]+/)
      .map(Number)
      .filter(n=>n>=0&&n<=36)
      .forEach(add);
    document.getElementById("inp").value="";
  };

  document.getElementById("lim").onclick=()=>{
    hist=[]; timeline=[];
    for(let k in estadoTrincas){
      estadoTrincas[k]={wins:0,quebras:0,retornos:0,ultimo:null};
    }
    render();
  };

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");

    const t = melhorTrincaTimeline();
    document.getElementById("trinca").textContent =
      t ? `${t.trinca.join("-")} | impactos: ${t.score}` : "-";

    const p = melhorParTimeline();
    document.getElementById("par1").textContent =
      p ? `Par 1: T${p.a}·T${p.b}` : "-";

    const tv = trincaVinculadaAoPar(p);
    document.getElementById("trincaPar").textContent =
      tv ? `Trinca vinculada ao par: ${tv.trinca.join("-")}` : "";

    document.getElementById("esquadra").innerHTML = textoEsquadra();
  }

})();
