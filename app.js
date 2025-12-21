javascript:(function(){

  const STYLE_ID = 'race-timeline-style';
  const MAX_HISTORY = 14; // 🔒 linha do tempo fixa em 14

  if(!document.getElementById(STYLE_ID)){
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.innerHTML = `
      .race-h0{
        background:#00ff99!important;
        color:#000!important;
        box-shadow:0 0 14px #00ff99;
        transform:scale(1.2);
        border-radius:50%;
      }
      .race-h1{
        background:#9bffcc!important;
        color:#000!important;
        box-shadow:0 0 8px #9bffcc;
        border-radius:50%;
      }
      .race-h2{
        background:#e0fff1!important;
        color:#000!important;
        border-radius:50%;
      }
    `;
    document.head.appendChild(style);
  }

  let history = [];

  function applyTimeline(){
    document.querySelectorAll('.race-h0,.race-h1,.race-h2')
      .forEach(e => e.classList.remove('race-h0','race-h1','race-h2'));

    history.forEach((num, idx) => {
      document.querySelectorAll('[data-number], .number, .roulette-number')
        .forEach(el => {
          if(el.textContent.trim() === num){
            if(idx === 0) el.classList.add('race-h0');      // último
            else if(idx === 1) el.classList.add('race-h1'); // penúltimo
            else el.classList.add('race-h2');               // restantes
          }
        });
    });
  }

  const observer = new MutationObserver(() => {
    const last =
      document.querySelector('.last-result, .recent-number, .result-number');

    if(!last) return;

    const value = last.textContent.trim();
    if(history[0] === value) return;

    history.unshift(value);
    if(history.length > MAX_HISTORY) history.pop();

    applyTimeline();
  });

  observer.observe(document.body,{
    childList:true,
    subtree:true
  });

  console.log('Linha do tempo da race ativa (14 números)');

})();
