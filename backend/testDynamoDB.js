import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

async function testDynamoDB() {
    console.log('🗄️ Testing DynamoDB Connection...');
    console.log('='.repeat(50));
    
    const dynamoDB = new DynamoDBClient({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });
    
    try {
        console.log('\n📋 Listing DynamoDB Tables...');
        const result = await dynamoDB.send(new ListTablesCommand({}));
        
        console.log('✅ DynamoDB Connection SUCCESSFUL!');
        console.log('📊 Total Tables:', result.TableNames.length);
        
        if (result.TableNames.length > 0) {
            console.log('\n📑 Available Tables:');
            result.TableNames.forEach((table, index) => {
                console.log(`  ${index + 1}. ${table}`);
            });
        }
        
        // Check for required tables
        const requiredTables = ['Exams', 'ExamSubmissions', 'Results'];
        console.log('\n🔍 Checking Required Tables:');
        
        requiredTables.forEach(table => {
            if (result.TableNames.includes(table)) {
                console.log(`  ✅ ${table}: EXISTS`);
            } else {
                console.log(`  ❌ ${table}: NOT FOUND`);
            }
        });
        
        // If tables don't exist, provide creation script
        const missingTables = requiredTables.filter(table => !result.TableNames.includes(table));
        if (missingTables.length > 0) {
            console.log('\n🚨 Missing tables detected!');
            console.log('👉 Run this script to create tables:');
            console.log('   node scripts/setupAWSTables.js');
        } else {
            console.log('\n🎉 All required DynamoDB tables exist!');
        }
        
    } catch (error) {
        console.error('\n❌ DynamoDB Connection FAILED!');
        console.error('Error:', error.name);
        console.error('Message:', error.message);
    }
}

testDynamoDB();