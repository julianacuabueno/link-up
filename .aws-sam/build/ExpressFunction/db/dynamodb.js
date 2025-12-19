import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-west-2'
});

const docClient = DynamoDBDocumentClient.from(client);

// Table names from environment variables (set by SAM template)
const TABLES = {
  USERS: process.env.USERS_TABLE || 'link-up-users',
  EVENTS: process.env.EVENTS_TABLE || 'link-up-events'
};

export {
  docClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
  TABLES
};
