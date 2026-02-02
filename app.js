(function () {

  // ================= CONFIG BASE =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,
    27,13,36,11,30,8,23,10,5,24,
    16,33,1,20,14,31,9,22,18,29,
    7,28,12,35,3,26,0
  ];

  const terminal = n => n % 10;
  const idx = n => track.indexOf(n);

  function vizinhos(n, d=1){
    const i = idx(n);
    let arr = [];
    for(let x=-d;x<=d;x++){
      if(x!==0) arr.push(track[(i+37+x)%37]);
    }
    return arr;
  }

  // ================= EIXOS =================
  const eixos = {
    ZERO: [
      [0,32,15],[19,4,21],[2,25,17],[34,6,27]
    ],
    TIERS: [
      [13,36,11],[30,8,23],[10,5,24],[16,33,1]
    ],
    ORPHELINS: [
      [20,14,31],[9,22,18],[7,29,28],[12,35,3]
    ]
  };

  // ================= ESTADO GLOBAL =================
  let timeline = [];

  // ================= ANÁLISES =================
  const analises = {
    manual: { T:new Set(), hist:[], res:[] },
    auto:   { T:new Set(), hist:[], res:[] },
    viz:    { T:new Set(), hist:[], res:[] },
    nunum:  { T:new Set(), hist:[], res:[] }
  };

  let modo = "manual";
  let autoCount = 0;

  // ================= AUTO =================
  function calcAuto(){
    if(autoCount<2) return;
    const s = new Set();
    for(const n of timeline){
      s.add(terminal(n));
      if(s.size>=autoCount) break;
    }
    analises.auto.T = s;
  }

  // ================= VIZINHOS =================
  function calcViz(){
    const s = new Set();
    timeline.slice(0,6).forEach(n=>{
      s.add(terminal(n));
      vizinhos(n).forEach(v=>s.add(terminal(v)));
    });
    analises.viz.T = new Set([...s].slice(0,3));
  }

  // ================= NUNUM =================
  function calcNunum(){
    if(timeline.length<2) return;
    const a = timeline[0], b = timeline[1];
    const s = new Set([
      terminal(a),terminal(b),
      ...vizinhos(a).map(terminal),
      ...vizinhos(b).map(terminal)
    ]);
    analises.nunum.T = s;
  }

  // ================= TRIOS =================
  function triosPorT(setT){
    let out=[];
    for(const eixo in eixos){
      eixos[eixo].forEach(t=>{
        const ts = t.map(terminal);
        const ok = ts.filter(x=>setT.has(x)).length;
        if(ok>0) out.push({eixo,trio:t,score:ok/3});
      });
    }
    out.sort((a,b)=>b.score-a.score);
    return out.slice(0,9);
  }

  // ================= VALIDAR =================
  function validar(n){
    for(const k in analises){
      const a = analises[k];
      if(!a.trios) continue;
      const hit = a.trios.some(t=>t.trio.includes(n));
      a.res.unshift(hit?"V":"X");
      if(a.res.length>14) a.res.pop();
    }
  }

  // ================= ADD =================
  function add(n){
    timeline.unshift(n);
    if(timeline.length>200) timeline.pop();

    validar(n);

    if(autoCount>0) calcAuto();
    calcViz();
    calcNunum();

    for(const k in analises){
      analises[k].trios = triosPorT(analises[k].T);
    }

    render();
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:1000px;margin:auto">
      <h3 style="text-align:center">CSM</h3>

      <div style="border:1px solid #444;padding:8px">
        <input id="inp" style="width:100%;padding:6px;background:#222;color:#fff"/>
        <button id="col">Colar</button>
        <button id="lim">Limpar</button>

        <button class="m" data-m="manual">Manual</button>
        <button class="m" data-m="auto">Auto</button>
        <button class="m" data-m="viz">Vizinhos</button>
        <button class="m" data-m="nunum">Nunum</button>

        Auto T:
        <select id="auto">
          <option>0</option><option>3</option><option>4</option><option>5</option><option>6</option>
        </select>
      </div>

      <div style="margin:10px 0;font-size:17px">
        Timeline: <span id="tl"></span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div><b>ZERO</b><div id="z"></div></div>
        <div><b>TIERS</b><div id="t"></div></div>
        <div><b>ORPHELINS</b><div id="o"></div></div>
      </div>
    </div>
  `;

  document.querySelectorAll(".m").forEach(b=>{
    b.onclick=()=>{
      modo=b.dataset.m;
      document.querySelectorAll(".m").forEach(x=>x.style.background="#444");
      b.style.background="#00e676";
      render();
    };
  });

  document.getElementById("auto").onchange=e=>{
    autoCount=+e.target.value;
    analises.auto.T.clear();
    calcAuto();
    render();
  };

  document.getElementById("col").onclick=()=>{
    document.getElementById("inp").value
      .split(/[\s,]+/)
      .map(Number)
      .filter(n=>n>=0&&n<=36)
      .forEach(add);
    document.getElementById("inp").value="";
  };

  document.getElementById("lim").onclick=()=>{
    timeline=[];
    for(const k in analises){
      analises[k].res=[];
    }
    render();
  };

  function render(){
    document.getElementById("tl").textContent = timeline.slice(0,14).join(" · ");
    const a = analises[modo];
    const por={ZERO:[],TIERS:[],ORPHELINS:[]};
    (a.trios||[]).forEach(x=>por[x.eixo].push(x.trio.join("-")));
    document.getElementById("z").innerHTML=por.ZERO.join("<br>");
    document.getElementById("t").innerHTML=por.TIERS.join("<br>");
    document.getElementById("o").innerHTML=por.ORPHELINS.join("<br>");
  }

  render();

})();
