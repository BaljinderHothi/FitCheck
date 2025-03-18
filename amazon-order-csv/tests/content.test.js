// Import functions to test
const { extractOrderFromMainPage, convertToCSV, downloadCSV } = require('../content.js');
const fs = require('fs');
const path = require('path');
const contentScript = fs.readFileSync(path.resolve(__dirname, '../content.js'), 'utf8');
eval(contentScript);

// Mock URL API
global.URL = {
  createObjectURL: jest.fn(() => 'blob:mock-url'),
  revokeObjectURL: jest.fn()
};

// Mock Blob
global.Blob = function(content, options) {
  return { content, options };
};

describe('Amazon Order CSV Extension', () => {
  let mockContainer;
  
  beforeEach(() => {
    // Set up a mock order container
    document.body.innerHTML = `
      <div class="order-card js-order-card">
        <div class="order-header">
          <div class="a-row">Order # 111-2222333-4444555</div>
          <div class="yohtmlc-shipment-status-primaryText">March 15, 2024</div>
        </div>
        <div class="a-fixed-right-grid">
          <div class="a-fixed-right-grid-inner">
            <a class="a-link-normal">Test Product</a>
            <span class="a-color-price">$19.99</span>
            <span class="a-size-small">Quantity: 2</span>
          </div>
        </div>
      </div>
    `;
    mockContainer = document.querySelector('.order-card');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('extractOrderFromMainPage', () => {
    test('should extract order information from main page', () => {
      const result = extractOrderFromMainPage(mockContainer);
      
      expect(result).toBeTruthy();
      expect(result.orderNumber).toBe('111-2222333-4444555');
      expect(result.items.length).toBe(1);
      expect(result.items[0]).toEqual({
        name: 'Test Product',
        price: '$19.99',
        quantity: '2'
      });
    });

    test('should return null for invalid container', () => {
      const result = extractOrderFromMainPage(document.createElement('div'));
      expect(result).toBeNull();
    });
  });

  describe('convertToCSV', () => {
    test('should convert orders to CSV format', () => {
      const orders = [{
        orderDate: '2024-03-15',
        orderNumber: '111-2222333-4444555',
        total: '$19.99',
        items: [{
          name: 'Test Product',
          price: '$19.99',
          quantity: '2'
        }]
      }];

      const csv = convertToCSV(orders);
      const lines = csv.split('\n');
      
      expect(lines[0]).toBe('Order Date,Order Number,Total,Item Name,Item Price,Quantity');
      expect(lines[1]).toContain('111-2222333-4444555');
      expect(lines[1]).toContain('Test Product');
    });

    test('should handle empty orders array', () => {
      const csv = convertToCSV([]);
      expect(csv).toBe('Order Date,Order Number,Total,Item Name,Item Price,Quantity\n');
    });
  });

  describe('downloadCSV', () => {
    test('should create and click a download link', () => {
      const createElementSpy = jest.spyOn(document, 'createElement');
      const appendChildSpy = jest.spyOn(document.body, 'appendChild');
      const removeChildSpy = jest.spyOn(document.body, 'removeChild');

      downloadCSV('test,csv\n', 'test.csv');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });
  });
}); 