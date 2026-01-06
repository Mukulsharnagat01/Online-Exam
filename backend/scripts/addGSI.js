import { DynamoDBClient, UpdateTableCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const dynamoDB = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// GSI configurations
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

async function addGSI(config) {
    try {
        // First update attribute definitions
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
        console.log(`✅ GSI "${config.IndexName}" added to table "${config.TableName}"`);
        return true;
    } catch (error) {
        if (error.name === 'ResourceInUseException') {
            console.log(`⚠️  GSI "${config.IndexName}" already exists on table "${config.TableName}"`);
            return true;
        } else {
            console.error(`❌ Error adding GSI "${config.IndexName}" to "${config.TableName}":`, error.message);
            return false;
        }
    }
}

async function setupGSIs() {
    console.log('🔧 Adding Global Secondary Indexes...');
    console.log('='.repeat(50));
    
    let successCount = 0;
    
    for (const config of gsiConfigs) {
        const success = await addGSI(config);
        if (success) successCount++;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 GSI Setup Summary:');
    console.log(`✅ Successfully added: ${successCount} GSIs`);
    console.log(`📋 Total GSIs needed: ${gsiConfigs.length}`);
    
    if (successCount === gsiConfigs.length) {
        console.log('\n🎉 All GSIs are ready!');
    }
}

setupGSIs();