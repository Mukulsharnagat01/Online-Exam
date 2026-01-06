import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

async function testAWS() {
    console.log('🎯 AWS CONNECTION TEST');
    console.log('='.repeat(50));
    
    // Check env variables
    console.log('\n📋 Environment Variables:');
    console.log('- AWS_REGION:', process.env.AWS_REGION || '❌ NOT SET');
    console.log('- S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME || '❌ NOT SET');
    console.log('- AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ SET' : '❌ NOT SET');
    console.log('- AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ SET' : '❌ NOT SET');
    
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.log('\n❌ AWS Credentials missing in .env file');
        console.log('👉 Add these to backend/.env file:');
        console.log('AWS_ACCESS_KEY_ID=your_key_here');
        console.log('AWS_SECRET_ACCESS_KEY=your_secret_here');
        console.log('AWS_REGION=ap-south-1');
        console.log('S3_BUCKET_NAME=your-bucket-name');
        return;
    }
    
    // Create S3 client
    const s3 = new S3Client({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });
    
    try {
        console.log('\n🚀 Testing AWS S3 Connection...');
        const data = await s3.send(new ListBucketsCommand({}));
        
        console.log('✅ AWS Connection SUCCESSFUL!');
        console.log('📦 Total Buckets Found:', data.Buckets.length);
        
        // List all buckets
        if (data.Buckets.length > 0) {
            console.log('\n📋 Available Buckets:');
            data.Buckets.forEach((bucket, index) => {
                console.log(`  ${index + 1}. ${bucket.Name}`);
            });
        }
        
        // Check our specific bucket
        const bucketNames = data.Buckets.map(b => b.Name);
        const targetBucket = process.env.S3_BUCKET_NAME;
        
        if (bucketNames.includes(targetBucket)) {
            console.log(`\n✅ GREAT! Your bucket "${targetBucket}" exists!`);
        } else {
            console.log(`\n⚠️  Bucket "${targetBucket}" not found in your account.`);
            console.log('👉 Create it in AWS Console:');
            console.log('   1. Go to S3 Service');
            console.log('   2. Click "Create bucket"');
            console.log('   3. Name:', targetBucket);
            console.log('   4. Region:', process.env.AWS_REGION);
            console.log('   5. UNCHECK "Block all public access"');
            console.log('   6. Create bucket');
        }
        
        console.log('\n🎉 AWS Setup Test Complete!');
        
    } catch (error) {
        console.error('\n❌ AWS Connection FAILED!');
        console.error('Error Type:', error.name);
        console.error('Error Message:', error.message);
        
        // Detailed error analysis
        console.log('\n🔧 Troubleshooting Tips:');
        
        if (error.name === 'InvalidAccessKeyId') {
            console.log('1. Your AWS Access Key ID is incorrect');
            console.log('2. Generate new keys: AWS Console → IAM → Users → Your User → Security Credentials');
        } 
        else if (error.name === 'SignatureDoesNotMatch') {
            console.log('1. Your AWS Secret Access Key is incorrect');
            console.log('2. Make sure you copied the entire key correctly');
        }
        else if (error.name === 'AccessDeniedException') {
            console.log('1. Your IAM user doesn\'t have S3 permissions');
            console.log('2. Add "AmazonS3FullAccess" policy to your IAM user');
        }
        else if (error.message.includes('credentials')) {
            console.log('1. Check if .env file is in correct location (backend folder)');
            console.log('2. Make sure .env variables are correctly named');
        }
        else {
            console.log('1. Check your internet connection');
            console.log('2. Verify AWS region is correct');
            console.log('3. Try switching region to "ap-south-1"');
        }
    }
}

// Run the test
testAWS();