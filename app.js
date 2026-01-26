(function () {

  // ================= CONFIG =================
  const track = [
    32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,
    23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,
    12,35,3,26,0
  ];

  const TRINCAS = [
    [4,7,16],
    [2,20,30],
    [6,9,26],
    [17,23,31],
    [18,19,24],
    [9,17,26]
  ];

  let timeline = [];

  // estado oculto por trinca
  const estado = {};
  TRINCAS.forEach(t=>{
    estado[t.join("-")] = {
      wins: 0,
      quebras: 0
    };
  });

  // ================= UTIL =================
  function viz(n,d){
    const i = track.indexOf(n);
    let a=[];
    for(let x=-d;x<=d;x++){
      a.push(track[(i+37+x)%37]);
    }
    return a;
  }

  function area(trinca){
    let s = new Set();
    trinca.forEach(c=>{
      viz(c,2).forEach(n=>s.add(n));
    });
    return s;
  }

  // ================= MOTOR =================
  let sinal = null;

  function atualizar(n){
    sinal = null;

    TRINCAS.forEach(tr=>{
      const key = tr.join("-");
      const a = area(tr);
      const st = estado[key];

      if(a.has(n)){
        if(st.quebras > 0){
          sinal = tr; // 🔔 HORA DE JOGAR
          st.wins = 0;
          st.quebras = 0;
        } else {
          st.wins++;
        }
      } else {
        if(st.wins >= 2){
          st.quebras++;
        }
      }
    });
  }

  // ================= UI =================
  document.body.style.background="#111";
  document.body.style.color="#fff";
  document.body.style.fontFamily="sans-serif";

  document.body.innerHTML = `
    <div style="padding:10px;max-width:700px;margin:auto">
      <h3 style="text-align:center">CSM – ESQUADRA</h3>

      <div style="border:1px solid #444;padding:8px">
        <input id="inp" placeholder="Cole histórico"
          style="width:100%;padding:6px;background:#222;color:#fff"/>
        <button id="col">Colar</button>
      </div>

      <div style="margin:8px 0">
        🕒 Timeline: <span id="tl"></span>
      </div>

      <div style="border:3px solid #00ff00;padding:14px;
                  font-size:20px;text-align:center">
        <b id="out">—</b>
      </div>

      <div id="nums"
        style="display:grid;grid-template-columns:repeat(9,1fr);
               gap:6px;margin-top:10px"></div>
    </div>
  `;

  const nums = document.getElementById("nums");
  for(let n=0;n<=36;n++){
    let b=document.createElement("button");
    b.textContent=n;
    b.style="padding:8px;background:#333;color:#fff";
    b.onclick=()=>add(n);
    nums.appendChild(b);
  }

  function add(n){
    timeline.unshift(n);
    if(timeline.length>14) timeline.pop();
    atualizar(n);
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

  function render(){
    document.getElementById("tl").textContent = timeline.join(" · ");

    if(sinal){
      document.getElementById("out").textContent =
        `🟢 JOGAR AGORA\n${sinal.join(" – ")}`;
    } else {
      document.getElementById("out").textContent = "—";
    }
  }

})();
