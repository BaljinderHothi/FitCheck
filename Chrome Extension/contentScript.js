
console.log('Content script loaded');

// Listen for checkout/purchase completions
document.addEventListener('DOMContentLoaded', () => {
  detectPurchase();
});

function detectPurchase() {
    /* function to detect the purchases
    different websites can have different logic so we have two routes
    
    1) for our MVP we do main sites like ebay and amazon and etsy
    
    2) find a different approach thats universal*/
  
  const isPurchasePage = 
    window.location.href.includes('confirmation') || 
    window.location.href.includes('receipt') ||
    window.location.href.includes('order-complete');
    
  if (isPurchasePage) {
    const purchaseData = extractPurchaseData();
    
    chrome.runtime.sendMessage({
      type: 'PURCHASE_DETECTED',
      data: purchaseData
    });
  }
}


function extractPurchaseData() {
  /* different sits will need different logic so i have to come back to this and work on it more as well as possibly think of different logic
  
  maybe an entirely new approach
  
  this is where the logic for the sites go*/
  let item = '';
  let price = '';
  const url = window.location.href;
  
  //this is a generic example i did for the mean time
  const priceElements = document.querySelectorAll('.price, .total, .amount');
  if (priceElements.length > 0) {
    price = priceElements[0].textContent.trim();
  }
  
  const itemElements = document.querySelectorAll('.item-name, .product-title');
  if (itemElements.length > 0) {
    item = itemElements[0].textContent.trim();
  }
  
  return {
    item,
    price,
    url,
    timestamp: new Date().toISOString()
  };
}

// Check if user needs to log in before using the extension
function checkLoginStatus() {
  // TODO: Endpoint to check login status
  // This should communicate with the background script to verify login status
  // If not logged in, it should trigger the login prompt
  
  chrome.runtime.sendMessage({ type: 'CHECK_LOGIN' }, (response) => {
    if (!response.isLoggedIn) {
      chrome.runtime.sendMessage({ type: 'LOGIN_REQUIRED' });
    }
  });
}