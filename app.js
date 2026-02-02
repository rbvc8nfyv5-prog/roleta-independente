(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const terminal = n => n % 10;

  // ================= EIXOS =================
  const eixos = {
    ZERO: [[0,32,15],[19,4,21],[2,25,17],[34,6,27]],
    TIERS: [[13,36,11],[30,8,23],[10,5,24],[16,33,1]],
    ORPH: [[20,14,31],[9,22,18],[7,29,28],[12,35,3]]
  };

  // ================= ESTADO =================
  let hist = [];
  let janela = 6;
  let modo = "AUTO";
  let autoT = 5;
  let manualT = new Set();

  // ================= UTIL =================
  function vizinhos(n){
    const i = track.indexOf(n);
    return [track[(i+36)%37], track[(i+1)%37]];
  }

  // ================= TERMINAIS ATIVOS =================
  function getTerminais(){
    if (modo === "MANUAL") return new Set(manualT);

    if (modo === "AUTO") {
      const s = new Set();
      for (const n of hist) {
        s.add(terminal(n));
        if (s.size >= autoT) break;
      }
      return s;
    }

    if (modo === "VIZINHO") {
      const c = {};
      hist.slice(0,janela).forEach(n=>{
        vizinhos(n).forEach(v=>{
          const t = terminal(v);
          c[t]=(c[t]||0)+1;
        });
      });
      return new Set(
        Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>+x[0])
      );
    }

    if (modo === "NUNUM") {
      if (hist.length < 2) return new Set();
      const [a,b] = hist;
      const s = new Set([
        terminal(a),
        terminal(b)
      ]);
      vizinhos(a).forEach(v=>s.add(terminal(v)));
      vizinhos(b).forEach(v=>s.add(terminal(v)));
      return s;
    }

    return new Set();
  }

  // ================= TRIOS =================
  function triosAtivos(ts){
    const out={ZERO:[],TIERS:[],ORPH:[]};
    Object.entries(eixos).forEach(([k,v])=>{
      v.forEach(t=>{
        if(t.map(terminal).some(x=>ts.has(x))){
          out[k].push(t);
        }
      });
    });
    return out;
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML=`
  <div style="max-width:900px;margin:auto;padding:10px">
    <h3 style="text-align:center">CSM — Auto / Manual Terminais</h3>

    Histórico:
    <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>

    <div style="margin:6px 0">
      <button id="col" class="ctl">Colar</button>
      <button id="lim" class="ctl">Limpar</button>
      Janela:
      <select id="jan">${[3,4,5,6,7,8,9,10].map(n=>`<option ${n===6?'selected':''}>${n}</option>`)}</select>
      Auto T:
      <select id="auto">${[2,3,4,5,6,7].map(n=>`<option ${n===5?'selected':''}>${n}</option>`)}</select>
    </div>

    <div style="margin:6px 0">
      <button class="modo" data-m="AUTO">Auto</button>
      <button class="modo" data-m="MANUAL">Manual</button>
      <button class="modo" data-m="VIZINHO">Vizinhos</button>
      <button class="modo" data-m="NUNUM">Nunum</button>
    </div>

    <div style="border:1px solid #555;padding:6px;margin:6px 0">
      Terminais:
      <div id="btnT"></div>
    </div>

    <div>Timeline (14): <span id="tl"></span></div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px">
      <div><b>ZERO</b><div id="z"></div></div>
      <div><b>TIERS</b><div id="t"></div></div>
      <div><b>ORPHELINS</b><div id="o"></div></div>
    </div>

    <div id="nums" style="display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:10px"></div>
  </div>`;

  // ================= BOTÕES T =================
  const btnT=document.getElementById("btnT");
  for(let i=0;i<10;i++){
    const b=document.createElement("button");
    b.textContent="T"+i;
    b.style="padding:6px;background:#333;color:#fff";
    b.onclick=()=>{
      manualT.has(i)?manualT.delete(i):manualT.add(i);
      render();
    };
    btnT.appendChild(b);
  }

  // ================= NUMBERS =================
  for(let i=0;i<=36;i++){
    const b=document.createElement("button");
    b.textContent=i;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>{hist.unshift(i);render();};
    document.getElementById("nums").appendChild(b);
  }

  // ================= EVENTOS =================
  document.getElementById("jan").onchange=e=>{janela=+e.target.value;render();};
  document.getElementById("auto").onchange=e=>{autoT=+e.target.value;render();};

  document.getElementById("col").onclick=()=>{
    document.getElementById("inp").value
      .split(/[\s,]+/).map(Number).filter(n=>n>=0&&n<=36)
      .forEach(n=>hist.unshift(n));
    document.getElementById("inp").value="";
    render();
  };

  document.getElementById("lim").onclick=()=>{
    hist=[];manualT.clear();render();
  };

  document.querySelectorAll(".modo").forEach(b=>{
    b.style.background="#333";
    b.style.color="#fff";
    b.onclick=()=>{
      modo=b.dataset.m;
      document.querySelectorAll(".modo").forEach(x=>{
        x.style.background="#333";
        x.style.fontSize="14px";
      });
      b.style.background="#00e676";
      b.style.fontSize="16px";
      render();
    };
  });

  // ================= RENDER =================
  function render(){
    const ts=getTerminais();
    const tr=triosAtivos(ts);

    document.getElementById("tl").innerHTML =
      hist.slice(0,14).map(n=>{
        const ok=[...tr.ZERO,...tr.TIERS,...tr.ORPH].flat().includes(n);
        return `<span style="color:${ok?'#2e7d32':'#c62828'}">${n}</span>`;
      }).join(" · ");

    document.querySelectorAll("#btnT button").forEach(b=>{
      const t=+b.textContent.slice(1);
      b.style.background = ts.has(t) ? "#00e676" : "#333";
    });

    document.getElementById("z").innerHTML = tr.ZERO.map(x=>x.join("-")).join("<br>");
    document.getElementById("t").innerHTML = tr.TIERS.map(x=>x.join("-")).join("<br>");
    document.getElementById("o").innerHTML = tr.ORPH.map(x=>x.join("-")).join("<br>");
  }

  render();

})();
