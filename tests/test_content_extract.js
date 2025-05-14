const { JSDOM } = require("jsdom");

// 📦 Realistic Amazon-like mock HTML
const html = `
  <div class="order-card__list">
    <div class="a-row">Order # 123-4567890-1234567</div>
    <div>
      <span class="a-size-base a-color-secondary aok-break-word">Jan 1, 2024</span>
      <span class="a-size-base a-color-secondary aok-break-word">$19.99</span>
    </div>
    <a class="a-link-normal" href="/dp/ABC123">Product 1</a>
  </div>
`;

// 🧠 Create JSDOM first
const dom = new JSDOM(html);
global.document = dom.window.document;
global.window = dom.window;
global.Node = dom.window.Node;

// ✅ Shim innerText after DOM is initialized
Object.defineProperty(global.window.HTMLElement.prototype, 'innerText', {
  get() {
    return this.textContent;
  }
});

// 🛠️ Mock Chrome extension API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: () => {},
    }
  }
};

// ✅ Now import the logic AFTER mocks are in place
const { extractOrders } = require("../amazon-order-csv/content.js");

// 🧪 Run test
extractOrders().then(result => {
  console.log("✅ Extracted Orders:\n", JSON.stringify(result, null, 2));
}).catch(err => {
  console.error("❌ Error during extraction:", err);
});
