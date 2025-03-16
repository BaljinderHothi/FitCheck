
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
      
      if not new user we would just */
      
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
    
    chrome.tabs.create({ url: 'https://yourapp.com/login' });
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