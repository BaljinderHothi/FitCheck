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

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (!tabs[0].url.includes('amazon.com')) {
      document.getElementById('productSelector').innerHTML = 
        '<option value="" disabled>Please navigate to Amazon orders page</option>';
      return;
    }
    
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getProducts'}, (response) => {
      const selector = document.getElementById('productSelector');
      
      if (chrome.runtime.lastError) {
        selector.innerHTML = '<option value="" disabled>Error loading products</option>';
        return;
      }
      
      if (response && response.products && response.products.length > 0) {
        selector.innerHTML = '<option value="" disabled selected>Select a product...</option>';
        
        response.products.forEach((product, index) => {
          const option = document.createElement('option');
          option.value = index;
          option.textContent = product;
          selector.appendChild(option);
        });
      } else {
        selector.innerHTML = '<option value="" disabled>No products found</option>';
      }
    });
  });
  
});
