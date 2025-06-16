// Simple test script to verify the terminal API integration
import { terminalService } from './src/api/terminalService.js';

async function testTerminalAPI() {
  console.log('Testing Terminal API...');
  
  try {
    // Test with default timezone
    console.log('\n1. Testing with default timezone (Africa/Cairo)...');
    const defaultResult = await terminalService.getTerminalInformationForPos();
    
    console.log('✅ Default timezone API call successful!');
    console.log('Terminal Information:', {
      branchId: defaultResult.branchId,
      branchName: defaultResult.branchName,
      cashJournal: defaultResult.cashJournal,
      isSessionOpened: defaultResult.isSessionOpened,
      currentCash: defaultResult.currentCash,
      salesRepCode: defaultResult.salesRepCode
    });
    
    // Test with specific timezone
    console.log('\n2. Testing with specific timezone (America/New_York)...');
    const specificResult = await terminalService.getTerminalInformationForPos('America/New_York');
    
    console.log('✅ Specific timezone API call successful!');
    console.log('Session Status:', {
      isSessionOpened: specificResult.isSessionOpened,
      openSessionDate: specificResult.openSessionDate,
      currentCash: specificResult.currentCash,
      cashCustomer: specificResult.cashCustomer
    });
    
    // Test business settings
    console.log('\n3. Business Settings:');
    console.log({
      isBusinessToBusiness: defaultResult.isBusinessToBusiness,
      canEditPrice: defaultResult.canEditPrice,
      selectBatch: defaultResult.selectBatch
    });
    
    if (defaultResult.isSessionOpened) {
      console.log('\n✅ Session is currently OPEN');
      console.log(`   Opened at: ${defaultResult.openSessionDate}`);
      console.log(`   Current cash: $${defaultResult.currentCash}`);
    } else {
      console.log('\n❌ Session is currently CLOSED');
    }
    
  } catch (error) {
    console.log('❌ API call failed:', error.message);
    console.log('Error details:', error);
  }
}

// Run the test
testTerminalAPI();
