import { DynamoDBClient, CreateTableCommand, UpdateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const dynamoDB = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Basic tables (without GSIs initially)
const basicTables = [
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
    }
];

// GSIs to add after tables are created
const gsiConfigs = [
    {
        TableName: 'ExamSubmissions',
        IndexName: 'userId-index',
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
    },
    {
        TableName: 'ExamSubmissions',
        IndexName: 'examId-index',
        KeySchema: [{ AttributeName: 'examId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
    },
    {
        TableName: 'Results',
        IndexName: 'userId-index',
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
    },
    {
        TableName: 'Results',
        IndexName: 'examId-index',
        KeySchema: [{ AttributeName: 'examId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' }
    }
];

async function listTables() {
    try {
        const result = await dynamoDB.send(new ListTablesCommand({}));
        return result.TableNames || [];
    } catch (error) {
        console.error('Error listing tables:', error.message);
        return [];
    }
}

async function createTable(tableConfig) {
    try {
        const command = new CreateTableCommand(tableConfig);
        await dynamoDB.send(command);
        console.log(`✅ Table "${tableConfig.TableName}" created`);
        return true;
    } catch (error) {
        if (error.name === 'ResourceInUseException') {
            console.log(`⚠️  Table "${tableConfig.TableName}" already exists`);
            return true;
        } else {
            console.error(`❌ Error creating "${tableConfig.TableName}":`, error.message);
            return false;
        }
    }
}

async function addGSI(config) {
    try {
        const updateParams = {
            TableName: config.TableName,
            AttributeDefinitions: [
                { AttributeName: config.KeySchema[0].AttributeName, AttributeType: 'S' }
            ],
            GlobalSecondaryIndexUpdates: [
                {
                    Create: {
                        IndexName: config.IndexName,
                        KeySchema: config.KeySchema,
                        Projection: config.Projection
                    }
                }
            ]
        };

        await dynamoDB.send(new UpdateTableCommand(updateParams));
        console.log(`✅ GSI "${config.IndexName}" added to "${config.TableName}"`);
        return true;
    } catch (error) {
        if (error.name === 'ResourceInUseException' || error.message.includes('already exists')) {
            console.log(`⚠️  GSI "${config.IndexName}" already exists on "${config.TableName}"`);
            return true;
        } else {
            console.error(`❌ Error adding GSI "${config.IndexName}" to "${config.TableName}":`, error.message);
            return false;
        }
    }
}

async function fixAll() {
    console.log('🔧 FIXING DYNAMODB SETUP');
    console.log('='.repeat(50));
    
    // Check existing tables
    console.log('\n📋 Checking existing tables...');
    const existingTables = await listTables();
    console.log('Found tables:', existingTables.join(', ') || 'None');
    
    // Step 1: Create missing basic tables
    console.log('\n🚀 Step 1: Creating missing tables...');
    const tablesToCreate = basicTables.filter(table => !existingTables.includes(table.TableName));
    
    if (tablesToCreate.length === 0) {
        console.log('✅ All basic tables already exist!');
    } else {
        for (const tableConfig of tablesToCreate) {
            await createTable(tableConfig);
        }
    }
    
    // Wait a moment for tables to be active
    console.log('\n⏳ Waiting for tables to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 2: Add GSIs
    console.log('\n🔧 Step 2: Adding Global Secondary Indexes...');
    
    for (const gsiConfig of gsiConfigs) {
        // Check if table exists before adding GSI
        const currentTables = await listTables();
        if (currentTables.includes(gsiConfig.TableName)) {
            await addGSI(gsiConfig);
            // Small delay between GSI creations
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            console.log(`❌ Table "${gsiConfig.TableName}" not found for GSI`);
        }
    }
    
    // Final verification
    console.log('\n' + '='.repeat(50));
    console.log('✅ FIX COMPLETE!');
    console.log('\n📝 Next: Run testDynamoDB.js to verify');
}

fixAll();