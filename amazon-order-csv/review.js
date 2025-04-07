
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'SUBMIT_REVIEW') {
    //alert('Submitting review...OMEGALULTRA');

    sendResponse({ success: true });
  }

  const worthItOptions = [
    "Yes definitely worth it",
    "Maybe, I am not sure", 
    "I don't recommend"
  ];
  
  const fakeReview = {
    item_name: "Amazon Echo Dot (4th Gen)",
    rating: Math.floor(Math.random() * 5) + 1, // Random 1-5
    review: "This product met my expectations",
    worth_it: message.data?.worth_it || worthItOptions[Math.floor(Math.random() * 3)]
  };
  alert('Fake Review: ', fakeReview.item_name, fakeReview.rating, fakeReview.review, fakeReview.worth_it);
  console.log('Processing review:', fakeReview);
});





// const urlParams = new URLSearchParams(window.location.search);
// const purchaseId = urlParams.get('purchaseId');
// const productName = urlParams.get('product');







// let selectedRating = 0;
// const stars = document.querySelectorAll('.star');
// stars.forEach(star => {
//   star.addEventListener('click', () => {
//     const value = parseInt(star.getAttribute('data-value'));
//     selectedRating = value;
    
    
//     stars.forEach(s => {
//       const starValue = parseInt(s.getAttribute('data-value'));
//       if (starValue <= selectedRating) {
//         s.classList.add('selected');
//       } else {
//         s.classList.remove('selected');
//       }
//     });
//   });
// });

//document.getElementById('submitReview').addEventListener('click', () => {
  // const reviewText = document.getElementById('reviewText').value;
  // const worthIt = document.getElementById('worthIt').value;
  
  // if (selectedRating === 0) {
  //   alert('Please select a rating');
  //   return;
  // }
  
  // chrome.runtime.sendMessage({
  //   type: 'SUBMIT_REVIEW',
  //   data: {
  //     purchaseId,
  //     rating: selectedRating,
  //     review: reviewText,
  //     worthIt,
  //     submittedAt: new Date().toISOString()
  //   }
  // }, (response) => {
  //   if (response && response.success) {
  //     //close after submission
  //     window.close();
  //   }
  // });

//   console.log('submitReview Button Activated')
// });