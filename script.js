const display = document.getElementById('display');
const buttons = Array.from(document.querySelectorAll('.btn'));
const clearBtn = document.getElementById('clear');
const equalsBtn = document.getElementById('equals');

let current = '';      
let evaluated = false; 

function updateDisplay(){
  display.value = current || '0';
}

function lastTokenIsOperator(){
  return /[+\-*/]$/.test(current);
}

function appendValue(v){
  if (evaluated) {
    if (/[+\-*/]/.test(v)) {
      evaluated = false;
      if (current === 'Error') current = '';
      if (current === '' && v !== '-') return;
      current += v;
      return;
    }
    if (/[0-9.]/.test(v)) {
      if (lastTokenIsOperator()) {
        evaluated = false;
        current += v;
        return;
      }
      current = (v === '.') ? '0.' : v;
      evaluated = false;
      return;
    }
  }

  if (current === '0' && v === '0') return;

  if (v === '.') {
    const parts = current.split(/[\+\-\*\/]/);
    if (parts[parts.length - 1].includes('.')) return;
    if (current === '' || lastTokenIsOperator()) current += '0';
    current += '.';
    return;
  }

  if (/[+\-*/]/.test(v)) {
    if (current === '') {
      if (v === '-') { current = '-'; return; }
      return;
    }
    if (lastTokenIsOperator()) {
      current = current.slice(0, -1) + v;
      return;
    }
    current += v;
    return;
  }

  current += v;
}

function evaluateExpression(){
  if (!current) return;
  if (/[+\-*/.]$/.test(current)) current = current.slice(0, -1);
  if (!/^[0-9+\-*/.() ]+$/.test(current)) {
    current = 'Error';
    evaluated = true;
    updateDisplay();
    return;
  }
  try {
    const result = Function('"use strict"; return (' + current + ')')();
    if (Number.isFinite(result)) {
      current = (Math.abs(result - Math.trunc(result)) < 1e-12) ? String(Math.trunc(result)) : String(result);
    } else {
      current = 'Error';
    }
  } catch {
    current = 'Error';
  }
  evaluated = true;
}

function clearAll(){
  current = '';
  evaluated = false;
  updateDisplay();
}

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const v = btn.getAttribute('data-value');
    if (!v) return;
    if (v === '=') return;
    if (v === 'clear') return;
    if (btn.classList.contains('digit') || btn.classList.contains('dot') || btn.classList.contains('op')) {
      appendValue(v);
      updateDisplay();
    }
  });
});

equalsBtn.addEventListener('click', () => {
  evaluateExpression();
  updateDisplay();
});

clearBtn.addEventListener('click', () => {
  clearAll();
});

window.addEventListener('keydown', (e) => {
  const key = e.key;
  if ((/^[0-9]$/).test(key)) { appendValue(key); updateDisplay(); return; }
  if (key === '.') { appendValue('.'); updateDisplay(); return; }
  if (['+','-','*','/'].includes(key)) { appendValue(key); updateDisplay(); return; }
  if (key === 'Enter' || key === '=') { evaluateExpression(); updateDisplay(); return; }
  if (key === 'Backspace') { current = current.slice(0,-1); updateDisplay(); return; }
  if (key.toLowerCase() === 'c') { clearAll(); updateDisplay(); return; }
});
