document.addEventListener('DOMContentLoaded', function() {
  const exportBtn = document.getElementById('exportBtn');
  const statusDiv = document.getElementById('status');

  exportBtn.addEventListener('click', async () => {
    statusDiv.textContent = 'Exporting orders...';
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('amazon.com')) {
        statusDiv.textContent = 'Please navigate to Amazon orders page';
        return;
      }

      // Inject content script if not already injected
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (error) {
        console.log('Content script might already be injected:', error);
      }

      // Send message to content script
      chrome.tabs.sendMessage(tab.id, { action: 'exportOrders' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          statusDiv.textContent = 'Error: Please refresh the page and try again';
          return;
        }
        
        if (response && response.success) {
          statusDiv.textContent = 'Orders exported successfully!';
        } else {
          statusDiv.textContent = response?.error || 'Failed to export orders. Please try again.';
        }
      });
    } catch (error) {
      console.error('Error:', error);
      statusDiv.textContent = 'Error: ' + error.message;
    }
  });
}); 