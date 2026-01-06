import { DynamoDBClient, UpdateTableCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const dynamoDB = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function addRemainingGSIs() {
    console.log('🔧 Adding remaining GSIs...');
    console.log('='.repeat(50));
    
    // Wait 2 minutes for previous GSIs to complete
    console.log('⏳ Waiting for previous GSIs to complete (2 minutes)...');
    await new Promise(resolve => setTimeout(resolve, 120000));
    
    const remainingGSIs = [
        {
            TableName: 'ExamSubmissions',
            IndexName: 'examId-index',
            KeySchema: [{ AttributeName: 'examId', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' }
        },
        {
            TableName: 'Results',
            IndexName: 'examId-index',
            KeySchema: [{ AttributeName: 'examId', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' }
        }
    ];
    
    for (const config of remainingGSIs) {
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
            
            // Wait between creations
            await new Promise(resolve => setTimeout(resolve, 30000));
            
        } catch (error) {
            if (error.name === 'ResourceInUseException' || error.message.includes('already exists')) {
                console.log(`✅ GSI "${config.IndexName}" already exists on "${config.TableName}"`);
            } else if (error.message.includes('subscriber limit')) {
                console.log(`⏳ GSI "${config.IndexName}": Still processing, try again in 5 minutes`);
            } else {
                console.error(`❌ Error: ${error.message}`);
            }
        }
    }
    
    console.log('\n🎉 GSI setup attempt complete!');
    console.log('👉 Check AWS Console → DynamoDB → Tables → Indexes');
}

addRemainingGSIs();