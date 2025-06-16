// Simple test script to verify the category API integration
import { categoryService } from './src/api/categoryService.js';

async function testCategoryAPI() {
  console.log('Testing Category API...');

  try {
    const categories = await categoryService.getCategoriesForItems();
    console.log('✅ Categories API call successful!');
    console.log('Categories received:', categories);

    if (Array.isArray(categories)) {
      console.log(`✅ Received ${categories.length} categories`);
      categories.forEach((category, index) => {
        console.log(`  ${index + 1}. ${category}`);
      });

      // Test items API with first category
      if (categories.length > 0) {
        console.log('\nTesting Items API...');
        const firstCategory = categories[0];
        const items = await categoryService.getItemsForQuickInvoiceBasedOnCategory(firstCategory);
        console.log(`✅ Items API call successful for category: ${firstCategory}`);
        console.log(`✅ Received ${items.length} items`);

        if (items.length > 0) {
          console.log('Sample item:', {
            id: items[0].id,
            name: items[0].name,
            arabicName: items[0].arabicName,
            sapItem: items[0].sapItem,
            itemGroup: items[0].itemGroup,
            price: items[0].price,
            isBatchManaged: items[0].isBatchManaged,
            totalStock: items[0].totalStock
          });
        }
      }
    } else {
      console.log('❌ Expected array but received:', typeof categories);
    }

  } catch (error) {
    console.log('❌ API call failed:', error.message);
    console.log('Error details:', error);
  }
}

// Run the test
testCategoryAPI();
