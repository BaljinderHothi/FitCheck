document.addEventListener('DOMContentLoaded', function () {
  const exportBtn = document.getElementById('exportBtn');
  
  exportBtn.addEventListener('click', async () => {
    if (exportBtn.dataset.clicked) return; // Prevent multiple clicks
    exportBtn.dataset.clicked = true; // Mark as clicked

    console.log("Exporting orders...");

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.url.includes('amazon.com')) {
        console.error('Please navigate to Amazon orders page');
        return;
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      chrome.tabs.sendMessage(tab.id, { action: 'exportOrders' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          return;
        }
        
        if (response && response.success) {
          console.log('Orders exported successfully!');
        } else {
          console.error(response?.error || 'Failed to export orders.');
        }
      });

    } catch (error) {
      console.error('Error:', error);
    }
  }, { once: true }); // Ensures event runs only once
});
