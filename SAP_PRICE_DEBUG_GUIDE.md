# 🔍 SAP Price Debugging Guide

## 🚨 Issue Identified
The SAP API is consistently returning a price of 100 for all items, which suggests there may be an issue with:
1. **Material SAP Code**: Wrong or missing material code being sent
2. **API Response**: SAP returning default/fallback pricing
3. **Data Mapping**: Incorrect field being used for material identification

## 🛠️ Debug Enhancements Added

### **1. Enhanced SAP Request Logging**
```javascript
console.log('💰 SAP PRICE REQUEST - Fetching price for:', {
  materialSapCode: materialSapCode,
  requestBody: { materialSapCode: materialSapCode },
  apiEndpoint: '/Items/GetPriceForSpecificItemFromSap',
  timestamp: new Date().toISOString()
});
```

### **2. Comprehensive Response Analysis**
```javascript
console.log('💰 SAP PRICE RESPONSE - Complete API Response:', {
  materialSapCode: materialSapCode,
  fullResponse: response,
  responseStatus: response.status,
  responseHeaders: response.headers,
  responseData: response.data,
  dataStructure: {
    success: response.data?.success,
    message: response.data?.message,
    data: response.data?.data,
    statusCode: response.data?.statusCode
  },
  priceDetails: {
    price: response.data?.data?.price,
    isCustomerSpecific: response.data?.data?.isCustomerSpecific,
    canEditPrice: response.data?.data?.canEditPrice,
    selectBatch: response.data?.data?.selectBatch,
    batches: response.data?.data?.batches,
    batchCount: response.data?.data?.batches?.length || 0
  }
});
```

### **3. Price 100 Warning System**
```javascript
if (response.data?.data?.price === 100) {
  console.warn('⚠️ SAP PRICE WARNING - Price is exactly 100:', {
    materialSapCode: materialSapCode,
    possibleIssues: [
      'Default/fallback price being returned',
      'Material code not found in SAP',
      'SAP system returning test data',
      'Material code format incorrect'
    ],
    responseData: response.data
  });
}
```

### **4. Material Code Selection Logic**
```javascript
// Check multiple possible fields for SAP material code
const materialSapCode = product.specifications?.['Sap Item'] || 
                       product.specifications?.['sapItem'] || 
                       product.materialCode || 
                       product.sapCode || 
                       product.sku;

console.log('💰 MATERIAL CODE SELECTION:', {
  selectedMaterialCode: materialSapCode,
  availableOptions: {
    'specifications.Sap Item': product.specifications?.['Sap Item'],
    'specifications.sapItem': product.specifications?.['sapItem'],
    'materialCode': product.materialCode,
    'sapCode': product.sapCode,
    'sku': product.sku
  },
  finalChoice: materialSapCode
});
```

### **5. Product Data Structure Analysis**
```javascript
const debugProductData = (product: any) => {
  console.log('🔍 PRODUCT DATA ANALYSIS:', {
    productName: product.name,
    productSku: product.sku,
    fullProductObject: product,
    specifications: product.specifications,
    possibleSapCodes: {
      'sku': product.sku,
      'specifications.Sap Item': product.specifications?.['Sap Item'],
      'specifications.sapItem': product.specifications?.['sapItem'],
      'materialCode': product.materialCode,
      'sapCode': product.sapCode,
      'sapMaterialCode': product.sapMaterialCode,
      'materialSapCode': product.materialSapCode
    },
    allKeys: Object.keys(product),
    specificationsKeys: product.specifications ? Object.keys(product.specifications) : 'No specifications'
  });
};
```

## 🔍 Debugging Steps

### **Step 1: Check Console Logs**
1. Open browser console (F12)
2. Click on any product item
3. Look for these log entries:
   - `🔍 PRODUCT DATA ANALYSIS:` - Shows complete product structure
   - `💰 MATERIAL CODE SELECTION:` - Shows which field is being used
   - `💰 SAP PRICE REQUEST:` - Shows what's being sent to SAP
   - `💰 SAP PRICE RESPONSE:` - Shows complete SAP response
   - `⚠️ SAP PRICE WARNING:` - Alerts if price is exactly 100

### **Step 2: Analyze Product Data**
Look at the `🔍 PRODUCT DATA ANALYSIS:` log to identify:
- **Available fields**: What properties does the product object have?
- **Specifications**: Does the product have a specifications object?
- **SAP codes**: Are there any SAP-specific fields?

### **Step 3: Verify Material Code**
Check the `💰 MATERIAL CODE SELECTION:` log to see:
- **Selected code**: Which field is being used as material SAP code
- **Available options**: What other fields are available
- **Correct field**: Is the right field being selected?

### **Step 4: Examine SAP Response**
Review the `💰 SAP PRICE RESPONSE:` log for:
- **Success status**: Is the API call successful?
- **Response message**: What message does SAP return?
- **Price value**: Is it always 100?
- **Batch data**: Are batches being returned correctly?

## 🎯 Common Issues & Solutions

### **Issue 1: Wrong Material Code Field**
**Symptoms**: Price always 100, material not found in SAP
**Solution**: Update material code selection logic to use correct field

```javascript
// If the correct field is different, update this:
const materialSapCode = product.correctSapField || product.sku;
```

### **Issue 2: Material Code Format**
**Symptoms**: Price always 100, format mismatch
**Solution**: Format the material code correctly

```javascript
// Example: Add prefix/suffix or format transformation
const materialSapCode = `PREFIX_${product.sku}_SUFFIX`;
```

### **Issue 3: SAP System Issues**
**Symptoms**: All items return same price, SAP message indicates error
**Solution**: Check SAP system status or contact SAP administrator

### **Issue 4: Test Data**
**Symptoms**: Price always 100, success=true but test environment
**Solution**: Verify API endpoint points to production SAP system

## 📊 Expected Console Output

### **Normal Flow:**
```
🔍 PRODUCT DATA ANALYSIS: { productName: "Item Name", sku: "ITEM123", ... }
💰 MATERIAL CODE SELECTION: { selectedMaterialCode: "ITEM123", ... }
💰 SAP PRICE REQUEST: { materialSapCode: "ITEM123", ... }
💰 SAP PRICE RESPONSE: { price: 150.50, success: true, ... }
```

### **Problem Flow:**
```
🔍 PRODUCT DATA ANALYSIS: { productName: "Item Name", sku: "ITEM123", ... }
💰 MATERIAL CODE SELECTION: { selectedMaterialCode: "ITEM123", ... }
💰 SAP PRICE REQUEST: { materialSapCode: "ITEM123", ... }
💰 SAP PRICE RESPONSE: { price: 100, success: true, ... }
⚠️ SAP PRICE WARNING: Price is exactly 100 - possible issues detected
```

## 🔧 Next Steps

1. **Run the debug version** and collect console logs
2. **Identify the correct SAP material code field** from product data
3. **Update material code selection logic** if needed
4. **Verify SAP API endpoint** and authentication
5. **Test with known working material codes** from SAP system

The enhanced logging will help identify exactly why the SAP price is always 100 and guide you to the correct solution.
