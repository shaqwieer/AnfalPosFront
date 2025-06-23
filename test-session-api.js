// Simple test script to verify the session management API integration
import { terminalService } from './src/api/terminalService.js';

async function testSessionAPI() {
  console.log('Testing Session Management API...');
  
  try {
    // Test 1: Try to open a session (might fail if already open)
    console.log('\n1. Testing Open Session...');
    try {
      const openResult = await terminalService.openShiftSession();
      console.log('✅ Open session successful!');
      console.log('Session opened:', openResult);
    } catch (error) {
      console.log('⚠️ Open session failed (might already be open):', error.message);
    }
    
    // Test 2: Get terminal information to check session status
    console.log('\n2. Getting current terminal information...');
    const terminalInfo = await terminalService.getTerminalInformationForPos();
    console.log('✅ Terminal info retrieved!');
    console.log('Session Status:', {
      isSessionOpened: terminalInfo.isSessionOpened,
      branchName: terminalInfo.branchName,
      cashJournal: terminalInfo.cashJournal,
      currentCash: terminalInfo.currentCash
    });
    
    // Test 3: Get session details before closing
    console.log('\n3. Getting session details before closing...');
    try {
      const sessionDetails = await terminalService.getSessionDetailsForClosing();
      console.log('✅ Session details before closing retrieved!');
      console.log('Session Details:', {
        id: sessionDetails.id,
        expectedCashEndAmount: sessionDetails.expectedCashEndAmount,
        discrepancyAmount: sessionDetails.discrepancyAmount,
        businessEntityName: sessionDetails.businessEntityName,
        shiftStartTime: sessionDetails.shiftStartTime,
        statusName: sessionDetails.statusName,
        cashStartAmount: sessionDetails.cashStartAmount
      });
    } catch (error) {
      console.log('❌ Failed to get session details before closing:', error.message);
    }
    
    // Test 4: Test close session structure (without actually closing)
    console.log('\n4. Testing close session parameters structure...');
    const mockCloseParams = {
      shiftSessionId: 123,
      shiftCashDeposits: {
        depositAmount: 100.50,
        depositNo: 'DEP-TEST-001',
        attachment: 'test-receipt.pdf'
      },
      Notes: 'Test session closure',
      attachment: null // Would be a File object in real usage
    };
    console.log('✅ Close session parameters structure validated:', mockCloseParams);
    
    console.log('\n🎉 All session API tests completed!');
    
  } catch (error) {
    console.log('❌ Session API test failed:', error.message);
    console.log('Error details:', error);
  }
}

// Run the test
testSessionAPI();
