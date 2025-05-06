document.addEventListener('DOMContentLoaded', function () {
  //const submitReviewBtn = document.getElementById("submitReview");
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      chrome.storage.local.set({ loggedIn: false }, () => {
        window.location.href = "login.html";
      });
    });
  }
  const productSelector = document.getElementById('productSelector');
  const reviewTextArea = document.getElementById('reviewText');
  const worthItSelect = document.getElementById('worthIt');
  //const stars = document.querySelectorAll('.star');
  const urlParams = new URLSearchParams(window.location.search);
  const purchaseId = urlParams.get('purchaseId');
  const productName = urlParams.get('product');

  let selectedRating = 0;
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.getAttribute('data-value'));
      selectedRating = value;
      
      stars.forEach(s => {
        const starValue = parseInt(s.getAttribute('data-value'));
        if (starValue <= selectedRating) {
          s.classList.add('selected');
        } else {
          s.classList.remove('selected');
        }
      });
    });
  });

  const exportBtn = document.getElementById('exportBtn');
  const submitReviewBtn = document.getElementById("submitReview");

  exportBtn.addEventListener('click', async () => {
    if (exportBtn.dataset.clicked) return;
    exportBtn.dataset.clicked = true;

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
  }, { once: true });

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

  // Only ONE event listener for the submit button
  submitReviewBtn.addEventListener("click", async () => {
    console.log("Submit button clicked"); // This will print to Chrome console
    
    const productSelector = document.getElementById('productSelector');
    const reviewText = document.getElementById('reviewText').value;
    const worthIt = document.getElementById('worthIt').value;
    
    // Rest of your existing code...
    if (!productSelector.value || productSelector.selectedIndex <= 0) {
      alert('Please select a product to review');
      return;
    }
    
    if (selectedRating === 0) {
      alert('Please select a rating (popop.js)');
      return;
    }
    
    // const reviewData = {
    //     product: {
    //       name: product,
    //       id: productSelector.value
    //     },
    //     rating: selectedRating,
    //     review: reviewText,
    //     worthIt: worthIt,
    //     meta: {
    //       timestamp: new Date().toISOString(),
    //       source: 'chrome_extension'
    //     }
    //   };
    //console.log('Review data:', reviewData); // This will print to Chrome console
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.url.includes('amazon.com')) {
        console.error('Please navigate to Amazon orders page');
        return;
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['review.js']
      });

      chrome.tabs.sendMessage(tab.id, { 
        action: 'SUBMIT_REVIEW',
        data: { 
          name: productSelector.options[productSelector.selectedIndex].text,
          worth_it: worthIt,
          review: reviewText,
          rating: selectedRating,
          meta: {
            timestamp: new Date().toISOString(),
            source: 'chrome_extension'
          }
        } 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          return;
        }
        
        if (response && response.success) {
          console.log('Submit (line 133) successfully!');
        } else {
          console.error(response?.error || 'Failed to export orders.');
        }
      });

    } catch (error) {
      console.error('Error:', error);
    }

  })
});
    
    // const reviewData = {
    //   product: productSelector.options[productSelector.selectedIndex].text,
    //   rating: selectedRating,
    //   review: reviewText,
    //   worthIt,
    //   timestamp: new Date().toISOString()
    // };
  
    //console.log('Submitting review:', reviewData);
    //alert('Submitting review...');
    // try {
    //   const response = await new Promise((resolve) => {
    //     chrome.runtime.sendMessage(
    //       { type: 'SUBMIT_REVIEW', data: reviewData },
    //       resolve
    //     );
    //   });
  
    //   if (response?.success) {
    //     console.log('Review submitted successfully!');
    //     window.close();
    //   } else {
    //     console.error('Failed to submit review:', response?.error);
    //     alert('Failed to submit review. Please try again.');
    //   }
    // } catch (error) {
    //   console.error('Error submitting review:', error);
    //   alert('An error occurred. Please try again.');
    // }
//   })
// });
  