//to prevent multiple listeners from being added so we don't get multiple messages
if (!window.reviewListenerAdded) { 
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'SUBMIT_REVIEW') {
      console.log('Data received from popup inside review.js:', message.data);
      sendResponse({ success: true });

      const worthItOptions = [
        "Yes definitely worth it",
        "Maybe, I am not sure", 
        "I don't recommend"
      ];
    }
  });

  window.reviewListenerAdded = true;
}
