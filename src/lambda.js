// src/lambda.js
const serverlessExpress = require('@vendia/serverless-express');
const app = require('./app'); // your existing Express app

exports.handler = serverlessExpress({ app });