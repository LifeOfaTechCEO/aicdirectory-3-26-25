const { MongoClient } = require('mongodb');

// =====================================
// UPDATE THESE VALUES WITH YOUR NEW USER
// =====================================
const username = "aicdadmin2";  // User visible in the MongoDB screenshot
const password = "A9t23YN2ExiwMPkY";  // The new password you provided
// =====================================

const uri = `mongodb+srv://${username}:${password}@cluster0.vdmop.mongodb.net/aicd?retryWrites=true&w=majority`;

console.log(`Testing connection with user: ${username}`);
console.log('Connection string being used (masked):', 
  uri.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)(@.*)/, '$1****$3'));

async function testConnection() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000
  });

  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully to MongoDB');
    
    // List databases to verify permissions
    const adminDb = client.db().admin();
    const dbList = await adminDb.listDatabases();
    console.log('✅ Databases available:', dbList.databases.map(db => db.name).join(', '));
    
    // Test writing a document to verify write permissions
    const testDb = client.db('aicd');
    const testCollection = testDb.collection('connection_test');
    
    const result = await testCollection.insertOne({
      test: 'connection',
      timestamp: new Date()
    });
    
    console.log('✅ Successfully inserted document:', result.insertedId);
    
    // Read it back
    const doc = await testCollection.findOne({ _id: result.insertedId });
    console.log('✅ Successfully retrieved document:', JSON.stringify(doc));
    
    // Clean up - delete the test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Successfully deleted test document');
    
    console.log('\n✅✅✅ ALL TESTS PASSED - YOUR CONNECTION WORKS! ✅✅✅');
    console.log('\nTo update your application, edit .env.local with this connection string:');
    console.log(`MONGODB_URI="mongodb+srv://${username}:${password}@cluster0.vdmop.mongodb.net/aicd?retryWrites=true&w=majority"`);
    
    return 'Connection test successful';
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err);
    console.log('\n❌❌❌ CONNECTION FAILED - PLEASE CHECK YOUR CREDENTIALS ❌❌❌');
    throw err;
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

// Run the test
testConnection()
  .then(console.log)
  .catch(() => {
    process.exit(1);
  }); 