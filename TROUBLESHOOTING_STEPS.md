# MongoDB Authentication Troubleshooting

We've identified that the issue is with MongoDB authentication. All connection attempts result in the same error:
```
bad auth : Authentication failed
```

## Diagnosis Results

1. We've confirmed the username `admin2` is being used correctly in the connection string
2. We've tried multiple connection string formats, all with the same authentication error
3. The error is consistent across both the main application and our isolated test script
4. The connection string format is valid (we know this because the error is authentication-specific, not syntax-related)

## Required Steps to Fix

Since we've exhausted troubleshooting with the current credentials, here are the steps needed to resolve this issue:

### 1. Create a New Database User in MongoDB Atlas

1. Log in to MongoDB Atlas: https://cloud.mongodb.com
2. Select your cluster (Cluster0)
3. Click on "Database Access" in the left sidebar
4. Click "Add New Database User"
5. Create a user with the following settings:
   - Authentication Method: Password
   - Username: `aicdadmin` (use a new username to avoid conflicts)
   - Password: Create a strong password
   - Database User Privileges: Atlas admin (or at minimum "Read and Write to Any Database")
   - Ensure the user has access to the `aicd` database
6. Click "Add User"

### 2. Verify IP Access

1. In MongoDB Atlas, go to "Network Access" in the left sidebar
2. Ensure there's an entry allowing access from your current IP address
3. If needed, add your IP or use `0.0.0.0/0` to allow access from anywhere (not recommended for production)

### 3. Update Connection String

1. In MongoDB Atlas, click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the provided connection string
4. Update the `.env.local` file with the new connection string, replacing username and password with your new credentials

```
MONGODB_URI="mongodb+srv://aicdadmin:YOUR_NEW_PASSWORD@cluster0.vdmop.mongodb.net/aicd?retryWrites=true&w=majority"
```

### 4. Test the Connection

1. Run our test script:
```
node test-mongo-connection.js
```

2. Once connection is successful, start the application:
```
npm run dev
```

### 5. Verify Data Saving

1. Access the admin panel: http://localhost:3000/admin
2. Login with admin / admin123
3. Create a new section and verify it saves correctly

## Additional Notes

- MongoDB Atlas might have changed password requirements or login policies
- The user `admin2` might have been deleted or had its password changed
- There might be a restriction on the IP addresses that can access the database 