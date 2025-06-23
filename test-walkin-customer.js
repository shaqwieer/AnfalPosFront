// Simple test script to verify the walk-in customer creation API
import { customerService } from './src/api/customerService.js';

async function testWalkinCustomerCreation() {
  console.log('Testing Walk-in Customer Creation API...');
  
  try {
    // Test 1: Create a simple walk-in customer
    console.log('\n1. Testing simple walk-in customer creation...');
    const simpleCustomerData = {
      name: 'John Doe Walk-in',
      primaryPhone: '+966555123456',
      isBusinessPartner: false,
      additionalNotes: 'Test walk-in customer created via API'
    };
    
    const simpleResult = await customerService.createWalkinCustomer(simpleCustomerData);
    console.log('✅ Simple walk-in customer created successfully!');
    console.log('Customer Details:', {
      id: simpleResult.id,
      name: simpleResult.name,
      phone: simpleResult.primaryPhone,
      isBusinessPartner: simpleResult.isBusinessPartner
    });
    
    // Test 2: Create a business walk-in customer with more details
    console.log('\n2. Testing business walk-in customer creation...');
    const businessCustomerData = {
      name: 'ABC Company Walk-in',
      primaryPhone: '+966555987654',
      email: 'contact@abccompany.com',
      isBusinessPartner: true,
      crNumber: 'CR123456789',
      vatNumber: 'VAT987654321',
      contactPersonName: 'Ahmed Al-Rashid',
      contactMobileNumber: '+966501234567',
      contactEmail: 'ahmed@abccompany.com',
      city: 'Riyadh',
      district: 'Olaya',
      streetName: 'King Fahd Road',
      buildingNumber: '123',
      postalCode: '12345',
      industry: 'Technology',
      website: 'www.abccompany.com',
      additionalNotes: 'Business walk-in customer with full details'
    };
    
    const businessResult = await customerService.createWalkinCustomer(businessCustomerData);
    console.log('✅ Business walk-in customer created successfully!');
    console.log('Business Customer Details:', {
      id: businessResult.id,
      name: businessResult.name,
      phone: businessResult.primaryPhone,
      email: businessResult.email,
      crNumber: businessResult.crNumber,
      vatNumber: businessResult.vatNumber,
      contactPerson: businessResult.contactPersonName,
      isBusinessPartner: businessResult.isBusinessPartner
    });
    
    // Test 3: Create minimal customer (only required fields)
    console.log('\n3. Testing minimal walk-in customer creation...');
    const minimalCustomerData = {
      name: 'Jane Smith',
      primaryPhone: '+966555111222',
      isBusinessPartner: false
    };
    
    const minimalResult = await customerService.createWalkinCustomer(minimalCustomerData);
    console.log('✅ Minimal walk-in customer created successfully!');
    console.log('Minimal Customer Details:', {
      id: minimalResult.id,
      name: minimalResult.name,
      phone: minimalResult.primaryPhone,
      isBusinessPartner: minimalResult.isBusinessPartner
    });
    
    console.log('\n🎉 All walk-in customer creation tests passed!');
    
    // Test 4: Verify API response structure
    console.log('\n4. API Response Structure Analysis:');
    console.log('Available fields in response:', Object.keys(simpleResult));
    
    // Test 5: Error handling test
    console.log('\n5. Testing error handling...');
    try {
      const invalidCustomerData = {
        // Missing required name field
        primaryPhone: '+966555000000',
        isBusinessPartner: false
      };
      
      await customerService.createWalkinCustomer(invalidCustomerData);
      console.log('❌ Error handling test failed - should have thrown an error');
    } catch (error) {
      console.log('✅ Error handling works correctly:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Walk-in customer creation test failed:', error.message);
    console.log('Error details:', error);
  }
}

// Run the test
testWalkinCustomerCreation();
