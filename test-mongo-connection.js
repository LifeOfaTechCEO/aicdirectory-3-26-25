const { MongoClient } = require('mongodb');
require('dotenv').config({ path: 'test.env' });

// Function to test a specific connection string
async function testConnectionString(uri, label) {
  console.log(`\n\n====== TESTING ${label} ======`);
  
  // Debug output of raw connection string
  console.log('Raw connection string (first part):', uri.substring(0, 30) + '...');

  // Extract username reliably
  let username = 'unknown';
  try {
    const uriParts = uri.split('@');
    if (uriParts.length > 0) {
      const authPart = uriParts[0];
      const credentialsParts = authPart.split('//');
      if (credentialsParts.length > 1) {
        const userPassParts = credentialsParts[1].split(':');
        username = userPassParts[0];
      }
    }
  } catch (e) {
    console.error('Error parsing connection string:', e);
  }

  console.log('User being used:', username);
  console.log('Connection string being used (masked):', 
    uri.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)(@.*)/, '$1****$3'));

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000
  });

  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Connected successfully to MongoDB');
    
    // List databases to verify permissions
    const adminDb = client.db().admin();
    const dbList = await adminDb.listDatabases();
    console.log('Databases available:', dbList.databases.map(db => db.name).join(', '));
    
    // Test writing a document to verify write permissions
    const testDb = client.db('aicd');
    const testCollection = testDb.collection('connection_test');
    
    const result = await testCollection.insertOne({
      test: 'connection',
      timestamp: new Date()
    });
    
    console.log('Successfully inserted document:', result.insertedId);
    
    // Read it back
    const doc = await testCollection.findOne({ _id: result.insertedId });
    console.log('Successfully retrieved document:', doc);
    
    // Clean up - delete the test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('Successfully deleted test document');
    
    return 'Connection test successful';
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    return `Connection failed: ${err.message}`;
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

// Test all connection strings
async function testAllConnections() {
  // Also try with regular .env.local
  require('dotenv').config({ path: '.env.local' });
  
  const results = [];
  
  // Test the actual .env.local
  results.push(await testConnectionString(process.env.MONGODB_URI, "ACTUAL .env.local CONNECTION"));
  
  // Test various formats from test.env
  results.push(await testConnectionString(process.env.MONGODB_URI_ORIGINAL, "ORIGINAL FORMAT"));
  results.push(await testConnectionString(process.env.MONGODB_URI_ENCODED, "ENCODED PASSWORD"));
  results.push(await testConnectionString(process.env.MONGODB_URI_ALT, "ALTERNATIVE FORMAT (mongodb://)"));
  results.push(await testConnectionString(process.env.MONGODB_URI_AUTH, "WITH EXPLICIT AUTH SOURCE"));
  
  console.log("\n\n======= RESULTS SUMMARY =======");
  results.forEach((result, index) => {
    const labels = [
      "ACTUAL .env.local CONNECTION", 
      "ORIGINAL FORMAT", 
      "ENCODED PASSWORD", 
      "ALTERNATIVE FORMAT", 
      "WITH EXPLICIT AUTH SOURCE"
    ];
    console.log(`${labels[index]}: ${result}`);
  });
}

// Run tests
testAllConnections().catch(console.error); 