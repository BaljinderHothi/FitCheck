
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

function showRecommendation(recommendation) {
    
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.right = '20px';
    popup.style.width = '300px';
    popup.style.padding = '15px';
    popup.style.backgroundColor = 'white';
    popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    popup.style.borderRadius = '5px';
    popup.style.zIndex = '9999';
    
    const score = recommendation.score;
    let color, title;
    
    if (score >= 0.8) {
      color = '#4CAF50'; // Green
      title = 'Great Purchase!';
    } else if (score >= 0.5) {
      color = '#FFC107'; // Yellow
      title = 'Decent Purchase';
    } else {
      color = '#F44336'; // Red
      title = 'Consider Alternative';
    }
    
    popup.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0; color: ${color};">${title}</h3>
        <button id="close-rec" style="background: none; border: none; cursor: pointer;">✕</button>
      </div>
      <p>${recommendation.message}</p>
      <div style="text-align: right;">
        <button id="view-details" style="background-color: #4285f4; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">View Details</button>
      </div>
    `;
    

    document.body.appendChild(popup);
    

    document.getElementById('close-rec').addEventListener('click', () => {
      popup.remove();
    });
    

    document.getElementById('view-details').addEventListener('click', () => {
      chrome.runtime.sendMessage({
        type: 'OPEN_RECOMMENDATION_DETAILS',
        data: recommendation
      });
      popup.remove();
    });
    

    setTimeout(() => {
      if (document.body.contains(popup)) {
        popup.remove();
      }
    }, 10000);
  }
  

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SHOW_RECOMMENDATION') {
      showRecommendation(message.data);
    }
    
    return true;
  });