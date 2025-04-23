# Evrlink Frontend

## Deployment Guide

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the environment variables in `.env`:
   ```
   VITE_API_URL=https://your-deployed-backend-url.com
   ```

### AWS Deployment

#### Prerequisites
- AWS account with appropriate permissions
- AWS CLI installed and configured
- Node.js and npm installed

#### Deployment Steps

1. **Build the application**:
   ```bash
   npm run build
   ```
   This creates a `dist` directory with the production build.

2. **Deploy to S3 (Static Website Hosting)**:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront (optional but recommended)**:
   - Create a CloudFront distribution pointing to your S3 bucket
   - Set up HTTPS with a custom domain
   - Configure cache settings

4. **Environment Variables**:
   - For AWS Amplify or Elastic Beanstalk, set the environment variables in the AWS console
   - For S3 deployments, make sure your `.env` file has the correct values before building

### Important Configuration Notes

- The frontend and backend are designed to be deployed separately
- The application uses environment variables to determine the API URL
- Make sure CORS is properly configured on the backend to allow requests from your frontend domain
- For local development, the application will default to `http://localhost:3001` if no environment variables are set

### Troubleshooting

- If images don't load, check that the API_BASE_URL is correctly set
- Verify that CORS is properly configured on the backend
- Check browser console for any errors 