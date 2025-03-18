// Unit tests for review functionality in background.js
describe('Review Management Unit Tests', () => {
    beforeEach(() => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ pendingReviews: [
          {
            purchaseId: 'test123',
            product: 'Test Product',
            reviewDue: new Date().toISOString(),
            url: 'https://example.com/product'
          }
        ]});
      });
      
      chrome.storage.local.set.mockImplementation((obj, callback) => {
        if (callback) callback();
      });
      
      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve({ success: true })
        })
      );
    });
    
    test('should schedule a review reminder with correct timing', () => {
      const purchaseData = {
        id: 'purchase123',
        item: 'Test Item',
        timestamp: new Date().toISOString(),
        url: 'https://example.com/item'
      };
      
      scheduleReviewReminder(purchaseData);
      
      expect(chrome.storage.local.get).toHaveBeenCalledWith(['pendingReviews'], expect.any(Function));
      expect(chrome.storage.local.set).toHaveBeenCalled();
      
      const setArg = chrome.storage.local.set.mock.calls[0][0];
      expect(setArg.pendingReviews.length).toBe(2); // Previous + new one
      expect(setArg.pendingReviews[1].purchaseId).toBe('purchase123');
      
      const reviewDate = new Date(setArg.pendingReviews[1].reviewDue);
      const purchaseDate = new Date(purchaseData.timestamp);
      const diffDays = Math.round((reviewDate - purchaseDate) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7);
    });
    
    test('should remove review from pending list after submission', () => {
      const purchaseId = 'test123';
      
      removeFromPendingReviews(purchaseId);
      
      expect(chrome.storage.local.get).toHaveBeenCalledWith(['pendingReviews'], expect.any(Function));
      expect(chrome.storage.local.set).toHaveBeenCalled();
      
      const setArg = chrome.storage.local.set.mock.calls[0][0];
      expect(setArg.pendingReviews.length).toBe(0);
    });
    
    test('should handle empty pending reviews gracefully', () => {
      chrome.storage.local.get.mockImplementationOnce((keys, callback) => {
        callback({ pendingReviews: [] });
      });
      
      const purchaseId = 'nonexistent';
      removeFromPendingReviews(purchaseId);
      
      expect(chrome.storage.local.set).toHaveBeenCalled();
      const setArg = chrome.storage.local.set.mock.calls[0][0];
      expect(setArg.pendingReviews).toEqual([]);
    });
  });