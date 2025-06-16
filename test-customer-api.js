// Simple test script to verify the customer API integration
import { customerService } from './src/api/customerService.js';

async function testCustomerAPI() {
  console.log('Testing Customer API...');
  
  try {
    // Test basic pagination
    console.log('\n1. Testing basic pagination...');
    const basicResult = await customerService.getCustomerForPosPaginated({
      pageNumber: 1,
      pageSize: 5,
      isNotBusinessPartner: false
    });
    
    console.log('✅ Basic API call successful!');
    console.log('Response structure:', {
      totalCount: basicResult.totalCount,
      totalPages: basicResult.totalPages,
      pageIndex: basicResult.pageIndex,
      itemsCount: basicResult.items?.length || 0
    });
    
    if (basicResult.items && basicResult.items.length > 0) {
      console.log('Sample customer:', {
        id: basicResult.items[0].id,
        name: basicResult.items[0].name,
        sapCustomer: basicResult.items[0].sapCustomer,
        primaryPhone: basicResult.items[0].primaryPhone,
        isBusinessPartner: basicResult.items[0].isBusinessPartner,
        city: basicResult.items[0].city
      });
    }
    
    // Test with search key
    console.log('\n2. Testing with search key...');
    const searchResult = await customerService.getCustomerForPosPaginated({
      pageNumber: 1,
      pageSize: 10,
      isNotBusinessPartner: false,
      searchKey: 'test'
    });

    console.log('✅ Search API call successful!');
    console.log(`Found ${searchResult.items?.length || 0} customers matching "test"`);

    // Test individual customers only (isNotBusinessPartner: true)
    console.log('\n3. Testing individual customers only...');
    const individualResult = await customerService.getCustomerForPosPaginated({
      pageNumber: 1,
      pageSize: 10,
      isNotBusinessPartner: true
    });

    console.log('✅ Individual customers API call successful!');
    console.log(`Found ${individualResult.items?.length || 0} individual customers`);

    // Test business customers only (isNotBusinessPartner: false)
    console.log('\n4. Testing business customers only...');
    const businessResult = await customerService.getCustomerForPosPaginated({
      pageNumber: 1,
      pageSize: 10,
      isNotBusinessPartner: false
    });

    console.log('✅ Business customers API call successful!');
    console.log(`Found ${businessResult.items?.length || 0} business customers`);
    
  } catch (error) {
    console.log('❌ API call failed:', error.message);
    console.log('Error details:', error);
  }
}

// Run the test
testCustomerAPI();
