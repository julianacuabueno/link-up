import serverlessExpress from '@vendia/serverless-express';
import app from './app.js';
console.log('Starting serverless express');
export const handler = serverlessExpress({ app });
