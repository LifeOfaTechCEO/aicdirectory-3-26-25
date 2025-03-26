const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

// Get connection string from environment
const uri = process.env.MONGODB_URI;

// Extract username for logging
const username = uri.match(/mongodb\+srv:\/\/([^:]+):/)
  ? uri.match(/mongodb\+srv:\/\/([^:]+):/)[1]
  : 'unknown';

console.log(`Testing connection with user: ${username}`);
console.log('Connection string being used (masked):', 
  uri.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)(@.*)/, '$1****$3'));

async function verifyData() {
  console.log('================================================================');
  console.log('               MongoDB Data Verification Tool');
  console.log('================================================================');
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000
  });

  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully to MongoDB');
    
    // List all available databases
    const adminDb = client.db().admin();
    const dbList = await adminDb.listDatabases();
    console.log('✅ Databases available:', dbList.databases.map(db => db.name).join(', '));
    
    // Check the aicd database
    const db = client.db('aicd');
    const collections = await db.listCollections().toArray();
    console.log('✅ Collections in aicd database:', collections.map(c => c.name).join(', '));
    
    // Specifically check for the sections collection
    if (collections.some(c => c.name === 'sections')) {
      console.log('✅ Sections collection exists');
      
      // Get count of documents in sections collection
      const sectionsCollection = db.collection('sections');
      const count = await sectionsCollection.countDocuments();
      console.log(`✅ Number of documents in sections collection: ${count}`);
      
      if (count > 0) {
        // Get sample of data
        const sections = await sectionsCollection.find().limit(1).toArray();
        
        console.log('✅ Sample section document:');
        console.log(JSON.stringify(sections[0], null, 2));
        
        // Check for categories
        if (sections[0] && sections[0].categories && sections[0].categories.length > 0) {
          console.log(`✅ First section has ${sections[0].categories.length} categories`);
          
          // Check for items
          const firstCategory = sections[0].categories[0];
          if (firstCategory && firstCategory.items && firstCategory.items.length > 0) {
            console.log(`✅ First category has ${firstCategory.items.length} items`);
            
            // Log the first item
            console.log('✅ Sample item:');
            console.log(JSON.stringify(firstCategory.items[0], null, 2));
            
            return {
              success: true,
              message: 'Database verification complete. Data structure looks good!'
            };
          } else {
            console.log('❌ No items found in the first category');
            return {
              success: false,
              message: 'Database structure issue: No items found in categories'
            };
          }
        } else {
          console.log('❌ No categories found in sections');
          return {
            success: false,
            message: 'Database structure issue: No categories found in sections'
          };
        }
      } else {
        console.log('❌ No section documents found in collection');
        return {
          success: false,
          message: 'Database structure issue: Sections collection exists but is empty'
        };
      }
    } else {
      console.log('❌ Sections collection does not exist');
      return {
        success: false,
        message: 'Database structure issue: Sections collection does not exist'
      };
    }
  } catch (err) {
    console.error('❌ Error connecting to MongoDB or verifying data:', err);
    return {
      success: false,
      message: `Error: ${err.message}`
    };
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

// Run the verification
verifyData()
  .then(result => {
    console.log('\n================================================================');
    console.log(`VERIFICATION RESULT: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(result.message);
    console.log('================================================================');
    
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('\n================================================================');
    console.error('VERIFICATION ERROR:', err.message);
    console.error('================================================================');
    process.exit(1);
  }); 