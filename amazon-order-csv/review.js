chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'SUBMIT_REVIEW') {
    //alert('Submitting review...OMEGALULTRA');

    sendResponse({ success: true });
  }

  console.log('Data received from popup inside review.js:', message.data);

  const worthItOptions = [
    "Yes definitely worth it",
    "Maybe, I am not sure", 
    "I don't recommend"
  ];
  
  
});