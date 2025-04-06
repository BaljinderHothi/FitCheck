let scriptInjected = false;

async function extractOrders() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orders = [];

      // Find all order containers using the correct class names
      const orderContainers = document.querySelectorAll('.order-card__list');

      if (orderContainers.length === 0) {
        console.log('No order containers found');
        resolve([]);
        return;
      }

      console.log('Found order containers:', orderContainers.length);

      for (const container of orderContainers) {
        try {
          const orderText = container.textContent;
          const orderMatch = orderText.match(/Order #\s*([\d-]+)/);
          const orderNumber = orderMatch ? orderMatch[1] : '';

          //console.log('Order number:', orderNumber);
          if (!orderNumber) continue;

          const orderInfo = extractOrderFromMainPage(container);
          if (orderInfo) {
            //console.log('Order info:', orderInfo);
            orders.push(orderInfo);
          }
        } catch (error) {
          console.error('Error processing order:', error);
        }
      }

      console.log('Final orders:', orders);
      resolve(orders);
    }, 2000); // Delay of 2 seconds to allow DOM to load
  });
}

// Function to extract order information from the main page
function extractOrderFromMainPage(container) {
  try {
    const elements = container.querySelectorAll("span.a-size-base.a-color-secondary.aok-break-word");
    orderDate = elements.length > 0 ? elements[0].innerText.trim() : '';
    const orderMatch = container.textContent.match(/Order #\s*([\d-]+)/);
    const orderNumber = orderMatch ? orderMatch[1] : '';
    const total = elements.length > 1 ? elements[1].innerText.trim() : '';
    const anchorElements = container.querySelectorAll('a.a-link-normal');
    const items = [];

    anchorElements.forEach(anchor => {
      if (anchor.href.includes('/dp/')) { // Only select product links
        const itemName = anchor.innerText.trim();
        if (itemName) { // Ensure it's not an empty string
          items.push(itemName);
        } else {
          //console.log("Empty product name found for:", anchor.href);
        }
      }
    });
    return { orderDate, orderNumber, total, items };
  } catch (error) {
    console.error('Error extracting from main page:', error);
  }
  return null;
}

// Function to convert orders to CSV
function convertToCSV(orders) {
  const headers = ['Order Date', 'Order Number', 'Total', 'Item Name'];
  let csv = headers.join(',') + '\n';
  orders.forEach(order => {
    order.items.forEach(item => {
      const row = [
        `"${order.orderDate.replace(/"/g, '""')}"`,
        `"${order.orderNumber.replace(/"/g, '""')}"`,
        `"${order.total.replace(/"/g, '""')}"`,
        `"${item.replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\n';
    });
  });
  return csv;
}

// Function to download CSV
function downloadCSV(data) {
  if (window.downloadTriggered) return;
  window.downloadTriggered = true;

  console.log('Downloading CSV...');
  
  const blob = new Blob([data], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'orders.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'exportOrders') {
    if (scriptInjected) return; // Prevent double execution
    scriptInjected = true;

    extractOrders(); // Your function to extract orders
    sendResponse({ success: true });
  }
});

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractOrders,
    extractOrderFromMainPage,
    convertToCSV,
    downloadCSV
  };
}