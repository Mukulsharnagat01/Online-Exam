import { checkAWSConnection } from './config/awsConfig.js';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  console.log('Running full AWS connectivity check (S3 + DynamoDB)...');
  try {
    const result = await checkAWSConnection();
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error during check:', err);
  }
})();
