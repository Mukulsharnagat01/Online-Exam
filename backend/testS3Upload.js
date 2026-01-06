import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

async function testS3Upload() {
    console.log('📤 Testing S3 File Upload...');
    console.log('='.repeat(50));
    
    // Validate environment
    const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'S3_BUCKET_NAME'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.log('❌ Missing environment variables:', missingVars.join(', '));
        console.log('👉 Add them to backend/.env file');
        return;
    }
    
    const s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });
    
    try {
        // Create test content
        const testContent = `AWS S3 Upload Test
        Timestamp: ${new Date().toISOString()}
        Bucket: ${process.env.S3_BUCKET_NAME}
        Region: ${process.env.AWS_REGION}
        Application: Exam Management System`;
        
        const fileName = `test-upload-${Date.now()}.txt`;
        const filePath = `test-uploads/${fileName}`;
        
        console.log('\n📝 Test Details:');
        console.log('- Bucket:', process.env.S3_BUCKET_NAME);
        console.log('- File:', filePath);
        console.log('- Content Length:', testContent.length, 'bytes');
        
        // Upload parameters
        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: filePath,
            Body: testContent,
            ContentType: 'text/plain',
            Metadata: {
                'test-purpose': 'exam-system-verification',
                'uploaded-by': 'test-script'
            }
        };
        
        console.log('\n🚀 Uploading file to S3...');
        const startTime = Date.now();
        
        // Upload file
        await s3.send(new PutObjectCommand(uploadParams));
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ Upload SUCCESSFUL in ${duration}ms!`);
        
        // Generate URL
        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filePath}`;
        console.log('\n🔗 File URL:', fileUrl);
        
        // Test URL accessibility
        console.log('\n🌐 Testing URL accessibility...');
        console.log('👉 Open this URL in browser:', fileUrl);
        console.log('Expected: You should see the test file content');
        
        console.log('\n🎉 S3 Upload Test Complete!');
        console.log('\n📋 Summary:');
        console.log('✅ AWS Credentials: VALID');
        console.log('✅ S3 Bucket: ACCESSIBLE');
        console.log('✅ File Upload: WORKING');
        console.log('✅ Permissions: CORRECT');
        
    } catch (error) {
        console.error('\n❌ Upload FAILED:', error.name);
        console.error('Error:', error.message);
        
        if (error.name === 'NoSuchBucket') {
            console.log('\n👉 Solution: Create the bucket first:');
            console.log(`   Bucket Name: ${process.env.S3_BUCKET_NAME}`);
            console.log(`   Region: ${process.env.AWS_REGION}`);
        }
    }
}

testS3Upload();