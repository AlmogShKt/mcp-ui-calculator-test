export function renderCalculatorWidget(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MCP-UI Calculator</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }

        .calculator {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 20px;
          max-width: 400px;
          width: 100%;
        }

        .calculator h1 {
          text-align: center;
          color: #333;
          margin-bottom: 20px;
          font-size: 24px;
        }

        .display {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 32px;
          padding: 20px;
          border-radius: 10px;
          text-align: right;
          margin-bottom: 20px;
          font-weight: 300;
          word-wrap: break-word;
          word-break: break-all;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        button {
          padding: 15px;
          font-size: 18px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          background: #f0f0f0;
          color: #333;
        }

        button:hover {
          background: #e0e0e0;
          transform: translateY(-2px);
        }

        button:active {
          transform: translateY(0);
        }

        button.operator {
          background: #667eea;
          color: white;
        }

        button.operator:hover {
          background: #5568d3;
        }

        button.equals {
          background: #48bb78;
          color: white;
          grid-column: span 2;
        }

        button.equals:hover {
          background: #38a169;
        }

        button.clear {
          background: #f56565;
          color: white;
          grid-column: span 2;
        }

        button.clear:hover {
          background: #e53e3e;
        }

        .info {
          margin-top: 20px;
          padding: 15px;
          background: #f7fafc;
          border-radius: 10px;
          color: #4a5568;
          font-size: 14px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="calculator">
        <h1>🧮 Calculator</h1>
        <div class="display" id="display">0</div>
        <div class="buttons">
          <button class="clear" onclick="clearDisplay()">C</button>
          <button class="operator" onclick="appendOperator('/')">÷</button>
          <button class="operator" onclick="appendOperator('*')">×</button>
          
          <button onclick="appendNumber('7')">7</button>
          <button onclick="appendNumber('8')">8</button>
          <button onclick="appendNumber('9')">9</button>
          <button class="operator" onclick="appendOperator('-')">−</button>
          
          <button onclick="appendNumber('4')">4</button>
          <button onclick="appendNumber('5')">5</button>
          <button onclick="appendNumber('6')">6</button>
          <button class="operator" onclick="appendOperator('+')">+</button>
          
          <button onclick="appendNumber('1')">1</button>
          <button onclick="appendNumber('2')">2</button>
          <button onclick="appendNumber('3')">3</button>
          <button onclick="appendNumber('.')">.</button>
          
          <button onclick="appendNumber('0')" style="grid-column: span 2;">0</button>
          <button class="equals" onclick="calculate()">=</button>
        </div>
        <div class="info">
          Connected to MCP-UI + Apps SDK
        </div>
      </div>

      <script>
        let display = document.getElementById('display');
        let currentValue = '0';
        let previousValue = '';
        let operation = null;
        let shouldResetDisplay = false;

        function updateDisplay() {
          display.textContent = currentValue;
        }

        function appendNumber(num) {
          if (shouldResetDisplay) {
            currentValue = num;
            shouldResetDisplay = false;
          } else {
            if (currentValue === '0' && num !== '.') {
              currentValue = num;
            } else if (num === '.' && currentValue.includes('.')) {
              return;
            } else {
              currentValue += num;
            }
          }
          updateDisplay();
          notifyParent('number', currentValue);
        }

        function appendOperator(op) {
          if (operation !== null && !shouldResetDisplay) {
            calculate();
          }
          previousValue = currentValue;
          operation = op;
          shouldResetDisplay = true;
          notifyParent('operator', op);
        }

        function calculate() {
          if (operation === null || shouldResetDisplay) return;

          let result;
          const prev = parseFloat(previousValue);
          const current = parseFloat(currentValue);

          switch (operation) {
            case '+':
              result = prev + current;
              break;
            case '-':
              result = prev - current;
              break;
            case '*':
              result = prev * current;
              break;
            case '/':
              result = current !== 0 ? prev / current : 0;
              break;
            default:
              return;
          }

          currentValue = result.toString();
          operation = null;
          shouldResetDisplay = true;
          updateDisplay();
          notifyParent('result', currentValue);
        }

        function clearDisplay() {
          currentValue = '0';
          previousValue = '';
          operation = null;
          shouldResetDisplay = false;
          updateDisplay();
          notifyParent('clear', '0');
        }

        function notifyParent(action, value) {
          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'calculator',
              action: action,
              value: value,
              timestamp: new Date().toISOString()
            }, '*');
          }
          console.log('[Calculator]', action, value);
        }
      </script>
    </body>
    </html>
  `;
}
