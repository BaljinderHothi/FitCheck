document.addEventListener('DOMContentLoaded', () => {
  const submitReviewBtn = document.getElementById("submitReview");
  const productSelector = document.getElementById('productSelector');
  const reviewTextArea = document.getElementById('reviewText');
  const worthItSelect = document.getElementById('worthIt');
  const stars = document.querySelectorAll('.star');

  console.log('Review form elements:', {
    submitBtn: submitReviewBtn,
    productSelect: productSelector,
    reviewText: reviewTextArea,
    worthItSelect: worthItSelect,
    stars: stars.length
  });

  let selectedRating = 0;

  // Star rating functionality
  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.getAttribute('data-value'));
      stars.forEach(s => s.classList.remove('selected'));
      for (let i = 0; i < selectedRating; i++) {
        stars[i].classList.add('selected');
      }
      console.log('Selected rating:', selectedRating);
    });
  });

  // Submit handler
  async function handleReviewSubmit() {
    const reviewText = reviewTextArea.value.trim();
    const worthIt = worthItSelect.value;
    const product = productSelector.options[productSelector.selectedIndex]?.text;

    // Validation
    if (!productSelector.value) {
      alert('Please select a product');
      return;
    }
    if (selectedRating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!reviewText) {
      alert('Please enter your review');
      return;
    }

    submitReviewBtn.disabled = true;
    submitReviewBtn.textContent = 'Submitting...';

    try {
      // Create PROPERLY STRUCTURED review data
      const reviewData = {
        product: {
          name: product,
          id: productSelector.value
        },
        rating: selectedRating,
        review: reviewText,
        worthIt: worthIt,
        meta: {
          timestamp: new Date().toISOString(),
          source: 'chrome_extension'
        }
      };

      console.log('Sending review data:', reviewData);


      const response = await chrome.runtime.sendMessage({
        type: 'SUBMIT_REVIEW',  
        payload: reviewData        
      });

      if (!response) {
        throw new Error('No response from background script');
      }

      if (response.success) {
        alert('Review submitted successfully!');
        // Reset form
        reviewTextArea.value = '';
        productSelector.value = '';
        worthItSelect.value = 'yes';
        stars.forEach(star => star.classList.remove('selected'));
        selectedRating = 0;
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      submitReviewBtn.disabled = false;
      submitReviewBtn.textContent = 'Submit Review';
    }
  }

  submitReviewBtn.addEventListener('click', handleReviewSubmit);
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'SUBMIT_REVIEW') {
    console.log('Received message:', message);
    console.log('Sender:', sender);

    const reviewDetails = message.data || {}; 
    console.log('Review Details:', reviewDetails);


    sendResponse({ success: true });
  }
  return true; 
});















// document.addEventListener('DOMContentLoaded', () => {
//   // DOM Elements
//   const submitReviewBtn = document.getElementById("submitReview");
//   const productSelector = document.getElementById('productSelector');
//   const reviewTextArea = document.getElementById('reviewText');
//   const worthItSelect = document.getElementById('worthIt');
//   const stars = document.querySelectorAll('.star');
//   const statusDiv = document.createElement('div');
//   statusDiv.className = 'status-message';
//   document.body.appendChild(statusDiv);

//   // State
//   let selectedRating = 0;
//   let submissionInProgress = false;

//   // Star Rating Functionality
//   stars.forEach(star => {
//     star.addEventListener('click', () => {
//       selectedRating = parseInt(star.getAttribute('data-value'));
//       updateStarDisplay();
//     });
//   });

//   function updateStarDisplay() {
//     stars.forEach((star, index) => {
//       star.classList.toggle('selected', index < selectedRating);
//     });
//   }

//   // Main submission handler
//   async function handleReviewSubmit() {
//     if (submissionInProgress) return;
    
//     // Validate form
//     if (!validateForm()) return;

//     submissionInProgress = true;
//     setSubmitState(true);

//     try {
//       const reviewData = createReviewData();
//       console.log('Submitting review:', reviewData);

//       // Send message with proper response handling
//       const response = await sendMessageToBackground({
//         action: 'SUBMIT_REVIEW',
//         data: reviewData
//       });

//       handleSubmissionResponse(response);
      
//     } catch (error) {
//       handleSubmissionError(error);
//     } finally {
//       submissionInProgress = false;
//       setSubmitState(false);
//     }
//   }

//   // Proper message sending with port handling
//   function sendMessageToBackground(message) {
//     return new Promise((resolve, reject) => {
//       // Set a timeout for the message
//       const timeout = setTimeout(() => {
//         reject(new Error('Background script did not respond in time'));
//       }, 5000); // 5 second timeout

//       chrome.runtime.sendMessage(message, (response) => {
//         clearTimeout(timeout);
        
//         // Check for Chrome API errors
//         if (chrome.runtime.lastError) {
//           reject(new Error(chrome.runtime.lastError.message));
//           return;
//         }

//         // Check for valid response
//         if (!response) {
//           reject(new Error('No response from background script'));
//           return;
//         }

//         resolve(response);
//       });
//     });
//   }

//   function validateForm() {
//     if (!productSelector.value) {
//       showStatus('Please select a product', true);
//       return false;
//     }
//     if (selectedRating === 0) {
//       showStatus('Please select a rating', true);
//       return false;
//     }
//     if (!reviewTextArea.value.trim()) {
//       showStatus('Please enter your review', true);
//       return false;
//     }
//     return true;
//   }

//   function createReviewData() {
//     return {
//       product: {
//         name: productSelector.options[productSelector.selectedIndex]?.text,
//         id: productSelector.value
//       },
//       rating: selectedRating,
//       review: reviewTextArea.value.trim(),
//       worthIt: worthItSelect.value,
//       meta: {
//         timestamp: new Date().toISOString(),
//         source: 'chrome_extension'
//       }
//     };
//   }

//   function handleSubmissionResponse(response) {
//     if (response?.success) {
//       showStatus('Review submitted successfully!');
//       resetForm();
//     } else {
//       throw new Error(response?.error || 'Submission failed without error details');
//     }
//   }

//   function handleSubmissionError(error) {
//     console.error('Review submission error:', error);
//     showStatus(`Error: ${error.message}`, true);
//   }

//   function resetForm() {
//     reviewTextArea.value = '';
//     productSelector.value = '';
//     worthItSelect.value = 'yes';
//     selectedRating = 0;
//     updateStarDisplay();
//   }

//   function setSubmitState(isSubmitting) {
//     submitReviewBtn.disabled = isSubmitting;
//     submitReviewBtn.textContent = isSubmitting ? 'Submitting...' : 'Submit Review';
//   }

//   function showStatus(message, isError = false) {
//     statusDiv.textContent = message;
//     statusDiv.style.color = isError ? '#ff4444' : '#00C851';
//     setTimeout(() => statusDiv.textContent = '', 5000);
//   }

//   // Initialize
//   function populateProducts() {
//     // Example products - replace with real data loading
//     const products = [
//       { id: 'prod1', name: 'Wireless Headphones' },
//       { id: 'prod2', name: 'Smart Watch' }
//     ];
    
//     products.forEach(product => {
//       const option = new Option(product.name, product.id);
//       productSelector.add(option);
//     });
//   }

//   // Event Listeners
//   submitReviewBtn.addEventListener('click', handleReviewSubmit);
//   populateProducts();

//   // Add styles for status message
//   const style = document.createElement('style');
//   style.textContent = `
//     .status-message {
//       margin: 10px 0;
//       padding: 8px;
//       border-radius: 4px;
//       font-size: 14px;
//       text-align: center;
//     }
//   `;
//   document.head.appendChild(style);
// });