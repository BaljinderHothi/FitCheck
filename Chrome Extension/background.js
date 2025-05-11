
await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  files: ['review.js']
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







chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');

    checkUserLoggedIn();
  });
  

  function checkUserLoggedIn() {
    chrome.storage.local.get(['userToken'], function(result) {
      /* so here we need to add the endpoint to ensure that the token is still valid, ensuring that the user is 
      properly logged in, if they arent we would go to the front end page and ensure that they are logged in
      
      this would be done in tandem to @anas and @nirath as we need to check the database and the front end signUp page
      */
    });
  }
  

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PURCHASE_DETECTED') {
      /* Here we would have the endpoint to take the purchase data and send it to the back end
      we have to decide how we store the purchases properly still
      ideally we just check the userid and check the date and time and use those to save the purchases
      so that when we are returning purchases and budget, its done through set dates
      
      ultimately makes it easier for us to filter*/
      
      savePurchaseData(message.data);
    } else if (message.type === 'LOGIN_REQUIRED') {
      /* is user is not logged in (line 9), we would then route them to the log in page 
      we ensure the log in, once logged in
      
      if new user do survey
      
      if not new user we would just jump into working fully */
      
      promptUserLogin();
    }
    
    return true; //keep the message channel open for async response
  });
  
  function savePurchaseData(data) {
    chrome.storage.local.get(['userToken'], function(result) {
      if (!result.userToken) {
        promptUserLogin();
        return;
      }
      /* endpoint to save the purchase data, header should include auth token, 
      data should show all purchase details*/
      
    });
  }

  function promptUserLogin() {
    
    /* The endpoint to handle auth flow
    this should reroute to the login page that @nirath is working on
    
    once successful log in is done, we need that to communicate to the extension so 
    that it can start working 
    it would communicate the auth token for that user*/
    
    chrome.tabs.create({ url: 'insert the url here' });
  }
  
  
  chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === 'AUTH_TOKEN') {
      /* endpoint to store the auth token
      this should save it to the chrome.storage.local
      
      this token will be used for all subsequent api calls that are being done*/
      
      chrome.storage.local.set({ userToken: message.token });
      sendResponse({ success: true });
    }
    
    return true;
  });

  function scheduleReviewReminder(purchaseData) {
    /* set up a reminder in the database for specific purchases,
    we then use that reminder to prompt the user to make a review of a purchase lets say after like 10 days from buying it */
    
    const purchaseDate = new Date(purchaseData.timestamp);
    const reviewDate = new Date(purchaseDate);
    reviewDate.setDate(reviewDate.getDate() + 7); // One week later
    
    //review reminders stored locally
    chrome.storage.local.get(['pendingReviews'], function(result) {
      const pendingReviews = result.pendingReviews || [];
      pendingReviews.push({
        purchaseId: purchaseData.id,
        product: purchaseData.item,
        reviewDue: reviewDate.toISOString(),
        url: purchaseData.url
      });
      
      chrome.storage.local.set({ pendingReviews });
    });
  }
  
  function saveProductReview(reviewData) {
    chrome.storage.local.get(['userToken'], function(result) {
      if (!result.userToken) {
        promptUserLogin();
        return;
      }
      
      /* create an endpoint to save the review data and send it to the ML model for better fine tuning reviews*/
      
      fetch('https://yourapi.com/api/reviews/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.userToken}`
        },
        body: JSON.stringify(reviewData)
      })
      .then(response => response.json())
      .then(data => {
        //update the prending review list
        removeFromPendingReviews(reviewData.purchaseId);
        
        //updates the user with the confirmation
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Review Submitted',
          message: 'Thank you for your feedback! It helps improve recommendations for future purchases!.'
        });
      })
      .catch(error => {
        console.error('Error saving review:', error);
      });
    });
  }
  
  //checking for pending due reviews
  function checkPendingReviews() {
    chrome.storage.local.get(['pendingReviews'], function(result) {
      const pendingReviews = result.pendingReviews || [];
      const now = new Date();
      
      pendingReviews.forEach(review => {
        const reviewDue = new Date(review.reviewDue);
        if (reviewDue <= now) {
          promptForReview(review);
        }
      });
    });
  }
  
  function promptForReview(reviewItem) {
   /* create the popup for users to leave a review, can honestly look like 
   
   item          price
   link          1-5 stars
   
   Typed message review (if we go that route)*/
    
    chrome.windows.create({
      url: `review.html?purchaseId=${reviewItem.purchaseId}&product=${encodeURIComponent(reviewItem.product)}`,
      type: 'popup',
      width: 400,
      height: 500
    });
  }
  
  //removes review from pending reviews, once a submission has been made
  function removeFromPendingReviews(purchaseId) {
    chrome.storage.local.get(['pendingReviews'], function(result) {
      const pendingReviews = result.pendingReviews || [];
      const updatedReviews = pendingReviews.filter(review => review.purchaseId !== purchaseId);
      chrome.storage.local.set({ pendingReviews: updatedReviews });
    });
  }
  
  chrome.alarms.create('checkReviews', { periodInMinutes: 1440 }); // Once per day
  
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkReviews') {
      checkPendingReviews();
    }
  });
  
  
  chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (buttonIndex === 0) { // "See Details" button
      chrome.storage.local.get(['latestRecommendation'], function(result) {
        if (result.latestRecommendation) {
          //open the recommendation details page
          chrome.tabs.create({ 
            url: `recommendation.html?data=${encodeURIComponent(JSON.stringify(result.latestRecommendation))}` 
          });
        }
      });
    }
    
  });
// background.js
// background.js

// Initialize storage if needed
// chrome.runtime.onInstalled.addListener(() => {
//   chrome.storage.local.set({ reviews: [] });
// });

// // Message handler with proper response
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log('Message received in background:', message);
  
//   if (message.action === 'SUBMIT_REVIEW') {
//     handleReviewSubmission(message.data)
//       .then(result => {
//         sendResponse({ success: true, ...result });
//       })
//       .catch(error => {
//         sendResponse({ 
//           success: false, 
//           error: error.message 
//         });
//       });
    
//     // Return true to indicate we'll send response asynchronously
//     return true;
//   }
// });

// async function handleReviewSubmission(reviewData) {
//   // Validate the review data
//   if (!reviewData?.product?.id || !reviewData.rating) {
//     throw new Error('Invalid review data');
//   }

//   // Store the review
//   return new Promise((resolve, reject) => {
//     chrome.storage.local.get(['reviews'], (result) => {
//       const reviews = result.reviews || [];
//       reviews.push(reviewData);
      
//       chrome.storage.local.set({ reviews }, () => {
//         if (chrome.runtime.lastError) {
//           reject(new Error('Failed to store review'));
//         } else {
//           resolve({ 
//             message: 'Review stored successfully',
//             reviewId: Date.now() 
//           });
//         }
//       });
//     });
//   });
// }