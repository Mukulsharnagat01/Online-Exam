import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config();

// Basic env validation to help debug credential issues
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials not set. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your environment or .env file.');
    process.exit(1);
}

const dynamoDB = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Simplified tables without GSIs for now
const tables = [
    {
        TableName: 'Exams',
        KeySchema: [{ AttributeName: 'examId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'examId', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST'
    },
    {
        TableName: 'ExamSubmissions',
        KeySchema: [{ AttributeName: 'submissionId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'submissionId', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST'
    },
    {
        TableName: 'Results',
        KeySchema: [{ AttributeName: 'resultId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'resultId', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST'
    },
    {
  TableName: 'ExamProgress',
  KeySchema: [
    { AttributeName: 'userExamKey', KeyType: 'HASH' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'userExamKey', AttributeType: 'S' }
  ],
  BillingMode: 'PAY_PER_REQUEST'
}
];

async function createTable(tableConfig) {
    try {
        const command = new CreateTableCommand(tableConfig);
        await dynamoDB.send(command);
        console.log(`✅ Table "${tableConfig.TableName}" created successfully`);
        return true;
    } catch (error) {
        if (error.name === 'ResourceInUseException') {
            console.log(`⚠️  Table "${tableConfig.TableName}" already exists`);
            return true;
        } else {
            console.error(`❌ Error creating table "${tableConfig.TableName}":`, error.message);
            return false;
        }
    }
}

async function setupTables() {
    console.log('🚀 Setting up DynamoDB Tables...');
    console.log('='.repeat(50));
    
    let successCount = 0;
    
    for (const tableConfig of tables) {
        const success = await createTable(tableConfig);
        if (success) successCount++;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Setup Summary:');
    console.log(`✅ Successfully created/verified: ${successCount} tables`);
    console.log(`📋 Total tables needed: ${tables.length}`);
    
    if (successCount === tables.length) {
        console.log('\n🎉 All tables are ready!');
        console.log('\n📝 Next Steps:');
        console.log('1. ✅ Run addGSI.js to add Global Secondary Indexes');
        console.log('2. ✅ Run testDynamoDB.js to verify');
        console.log('3. ✅ Start your backend server');
    } else {
        console.log('\n⚠️  Some tables failed to create.');
        console.log('👉 Check AWS Console → DynamoDB for existing tables');
    }
}

setupTables();