const urlParams = new URLSearchParams(window.location.search);
const purchaseId = urlParams.get('purchaseId');
const productName = urlParams.get('product');


document.getElementById('productName').textContent = `Product: ${productName}`;


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

document.getElementById('submitReview').addEventListener('click', () => {
  const reviewText = document.getElementById('reviewText').value;
  const worthIt = document.getElementById('worthIt').value;
  
  if (selectedRating === 0) {
    alert('Please select a rating');
    return;
  }
  
  chrome.runtime.sendMessage({
    type: 'SUBMIT_REVIEW',
    data: {
      purchaseId,
      rating: selectedRating,
      review: reviewText,
      worthIt,
      submittedAt: new Date().toISOString()
    }
  }, (response) => {
    if (response && response.success) {
      //close after submission
      window.close();
    }
  });
});