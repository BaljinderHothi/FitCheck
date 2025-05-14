// Integration tests for purchase detection and saving
describe('Purchase Detection and Storage Integration', () => {
    beforeEach(() => {

      document.body.innerHTML = `
        <div class="product-title">Test Product</div>
        <div class="price">$29.99</div>
      `;
      
     
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (message.type === 'PURCHASE_DETECTED') {

          savePurchaseData(message.data);
        }
        if (callback) callback({ success: true });
        return true;
      });
      

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        if (keys.includes('userToken')) {
          callback({ userToken: 'test-token-123' });
        }
      });
      

      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve({ success: true, id: 'saved-purchase-123' })
        })
      );
    });
    
    test('should detect purchase and send data to background script', () => {

      Object.defineProperty(window, 'location', {
        value: { href: 'https://example.com/confirmation' }
      });
      

      detectPurchase();
      

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'PURCHASE_DETECTED',
        data: expect.objectContaining({
          item: 'Test Product',
          price: '$29.99',
          url: 'https://example.com/confirmation'
        })
      });
    });
    
    test('should store purchase data when user is logged in', async () => {
      const purchaseData = {
        item: 'Test Product',
        price: '$29.99',
        url: 'https://example.com/product',
        timestamp: new Date().toISOString()
      };
      

      await savePurchaseData(purchaseData);
      

      expect(chrome.storage.local.get).toHaveBeenCalledWith(['userToken'], expect.any(Function));
      

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123'
          }),
          body: expect.stringContaining('Test Product')
        })
      );
    });
    
    test('should prompt for login when token is missing', async () => {

      chrome.storage.local.get.mockImplementationOnce((keys, callback) => {
        callback({});
      });
      

      const promptUserLogin = jest.fn();
      
      const purchaseData = {
        item: 'Test Product',
        price: '$29.99'
      };
      
      await savePurchaseData(purchaseData);
      
      // Verify login was prompted
      expect(promptUserLogin).toHaveBeenCalled();
      // Verify API was not called
      expect(fetch).not.toHaveBeenCalled();
    });
  });