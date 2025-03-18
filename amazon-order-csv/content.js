// Function to extract order details from the page
async function extractOrders() {
  const orders = [];
  
  // Find all order containers using the correct class names
  const orderContainers = document.querySelectorAll('.order-card.js-order-card');
  
  if (orderContainers.length === 0) {
    console.log('No order containers found');
    return [];
  }

  console.log('Found order containers:', orderContainers.length);

  for (const container of orderContainers) {
    try {
      // Get order number from the text content
      const orderText = container.textContent;
      const orderMatch = orderText.match(/Order #\s*([\d-]+)/);
      const orderNumber = orderMatch ? orderMatch[1] : '';
      console.log('Order number:', orderNumber);

      if (!orderNumber) continue;

      // Get the "View order details" link - updated selector
      const detailsLink = container.querySelector('a[href*="order-details"]') || 
                         container.querySelector('a:not([class]):contains("View order details")') ||
                         Array.from(container.querySelectorAll('a')).find(a => a.textContent.includes('View order details'));
      
      if (!detailsLink) {
        console.log('No details link found for order:', orderNumber);
        // Try to get order information from the main page instead
        const orderInfo = extractOrderFromMainPage(container);
        if (orderInfo) {
          orders.push(orderInfo);
          continue;
        }
        continue;
      }

      // Open order details in a new window
      const detailsUrl = detailsLink.href;
      console.log('Opening details URL:', detailsUrl);

      // Fetch the order details page
      const response = await fetch(detailsUrl);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      // Extract information from the details page
      const orderDate = doc.querySelector('.order-date-invoice-item')?.textContent.trim() || '';
      const total = doc.querySelector('.order-summary-total')?.textContent.trim() || '';

      // Get items from the details page
      const items = [];
      const itemRows = doc.querySelectorAll('.a-fixed-left-grid.a-spacing-none');
      
      itemRows.forEach(row => {
        const itemName = row.querySelector('.a-link-normal')?.textContent.trim() || '';
        const itemPrice = row.querySelector('.a-color-price')?.textContent.trim() || '';
        const quantityText = row.textContent.match(/Quantity:\s*(\d+)/) || ['', '1'];
        const itemQuantity = quantityText[1];

        if (itemName) {
          items.push({
            name: itemName,
            price: itemPrice,
            quantity: itemQuantity
          });
        }
      });

      if (items.length > 0) {
        orders.push({
          orderDate,
          orderNumber,
          total,
          items
        });
      }
    } catch (error) {
      console.error('Error processing order:', error);
    }
  }

  console.log('Final orders:', orders);
  return orders;
}

// Function to extract order information from the main page
function extractOrderFromMainPage(container) {
  try {
    // Get order date
    const dateElement = container.querySelector('.a-color-secondary');
    const orderDate = dateElement ? dateElement.textContent.trim() : '';

    // Get order number (already have it from earlier)
    const orderMatch = container.textContent.match(/Order #\s*([\d-]+)/);
    const orderNumber = orderMatch ? orderMatch[1] : '';

    // Get total
    const totalElement = container.querySelector('.a-color-price');
    const total = totalElement ? totalElement.textContent.trim() : '';

    // Get items
    const items = [];
    const itemElements = container.querySelectorAll('.a-fixed-right-grid-inner');
    
    itemElements.forEach(itemElement => {
      const itemName = itemElement.querySelector('a')?.textContent.trim() || '';
      const itemPrice = itemElement.querySelector('.a-color-price')?.textContent.trim() || '';
      const quantityText = itemElement.textContent.match(/Quantity:\s*(\d+)/) || ['', '1'];
      const itemQuantity = quantityText[1];

      if (itemName) {
        items.push({
          name: itemName,
          price: itemPrice,
          quantity: itemQuantity
        });
      }
    });

    if (items.length > 0) {
      return {
        orderDate,
        orderNumber,
        total,
        items
      };
    }
  } catch (error) {
    console.error('Error extracting from main page:', error);
  }
  return null;
}

// Function to convert orders to CSV
function convertToCSV(orders) {
  const headers = ['Order Date', 'Order Number', 'Total', 'Item Name', 'Item Price', 'Quantity'];
  let csv = headers.join(',') + '\n';

  orders.forEach(order => {
    order.items.forEach(item => {
      const row = [
        `"${order.orderDate.replace(/"/g, '""')}"`,
        `"${order.orderNumber.replace(/"/g, '""')}"`,
        `"${order.total.replace(/"/g, '""')}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.price.replace(/"/g, '""')}"`,
        `"${item.quantity.replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\n';
    });
  });

  return csv;
}

// Function to download CSV
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exportOrders') {
    try {
      console.log('Starting order extraction...');
      extractOrders().then(orders => {
        console.log('Found orders:', orders.length);
        
        if (orders.length === 0) {
          console.log('No orders found on this page');
          sendResponse({ success: false, error: 'No orders found on this page. Please make sure you are on the Amazon orders page and have selected a year.' });
          return;
        }

        const csv = convertToCSV(orders);
        const filename = `amazon_orders_${new Date().toISOString().split('T')[0]}.csv`;
        downloadCSV(csv, filename);
        
        sendResponse({ success: true });
      }).catch(error => {
        console.error('Error during export:', error);
        sendResponse({ success: false, error: error.message });
      });
    } catch (error) {
      console.error('Error during export:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Will respond asynchronously
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