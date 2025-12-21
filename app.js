javascript:(function(){

  // ===== CONFIGURAÇÃO SEGURA =====
  const MAX_HISTORY = 14;
  const LAST_NUMBER_SELECTOR = '.last-result, .recent-number, .result-number';

  let history = [];

  // ===== CSS ISOLADO (não afeta o site) =====
  if(!document.getElementById('race-safe-style')){
    const style = document.createElement('style');
    style.id = 'race-safe-style';
    style.textContent = `
      .race-safe-0{
        outline: 3px solid #00ff99 !important;
        box-shadow: 0 0 10px #00ff99;
        border-radius: 50%;
      }
      .race-safe-1{
        outline: 2px solid #9bffcc !important;
        border-radius: 50%;
      }
      .race-safe-2{
        outline: 1px solid #d9fff0 !important;
        border-radius: 50%;
      }
    `;
    document.head.appendChild(style);
  }

  function applyTimeline(){
    document.querySelectorAll('.race-safe-0,.race-safe-1,.race-safe-2')
      .forEach(e => e.classList.remove('race-safe-0','race-safe-1','race-safe-2'));

    history.forEach((num, idx) => {
      document.querySelectorAll('[data-number], .number, .roulette-number')
        .forEach(el => {
          if(el.textContent.trim() === num){
            if(idx === 0) el.classList.add('race-safe-0');
            else if(idx === 1) el.classList.add('race-safe-1');
            else el.classList.add('race-safe-2');
          }
        });
    });
  }

  let lastSeen = null;

  setInterval(() => {
    const last = document.querySelector(LAST_NUMBER_SELECTOR);
    if(!last) return;

    const value = last.textContent.trim();
    if(!value || value === lastSeen) return;

    lastSeen = value;
    history.unshift(value);
    if(history.length > MAX_HISTORY) history.pop();

    applyTimeline();
  }, 800); // intervalo seguro

  console.log('Race timeline segura ativa');

})();
