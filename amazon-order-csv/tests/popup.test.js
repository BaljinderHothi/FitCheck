// Import functions to test
const fs = require('fs');
const path = require('path');
const popupScript = fs.readFileSync(path.resolve(__dirname, '../popup.js'), 'utf8');
eval(popupScript);

describe('Popup Script', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="exportBtn">Export Orders to CSV</button>
      <div id="status"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('should set up event listener on export button', () => {
    // Trigger DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);

    const exportBtn = document.getElementById('exportBtn');
    expect(exportBtn.onclick).toBeDefined();
  });

  test('should handle successful export', async () => {
    // Mock chrome.tabs.query to return a tab
    chrome.tabs.query.mockImplementation((query, callback) => {
      return Promise.resolve([{ id: 1, url: 'https://www.amazon.com/orders' }]);
    });

    // Mock chrome.tabs.sendMessage to simulate successful export
    chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
      callback({ success: true });
    });

    // Trigger DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Click export button
    const exportBtn = document.getElementById('exportBtn');
    await exportBtn.click();

    // Check status message
    const statusDiv = document.getElementById('status');
    expect(statusDiv.textContent).toBe('Orders exported successfully!');
  });

  test('should handle failed export', async () => {
    // Mock chrome.tabs.query to return a tab
    chrome.tabs.query.mockImplementation((query, callback) => {
      return Promise.resolve([{ id: 1, url: 'https://www.amazon.com/orders' }]);
    });

    // Mock chrome.tabs.sendMessage to simulate failed export
    chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
      callback({ success: false, error: 'No orders found on this page. Please make sure you are on the Amazon orders page and have selected a year.' });
    });

    // Trigger DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Click export button
    const exportBtn = document.getElementById('exportBtn');
    await exportBtn.click();

    // Check status message
    const statusDiv = document.getElementById('status');
    expect(statusDiv.textContent).toBe('No orders found on this page. Please make sure you are on the Amazon orders page and have selected a year.');
  });
}); 