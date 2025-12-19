import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  docClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
  TABLES
} from '../db/dynamodb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.USERS
    }));

    res.json({
      success: true,
      data: result.Items || [],
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

/* POST route to insert users from JSON file */
router.post('/load-from-file', async (req, res, next) => {
  try {
    // Read users data from JSON file
    const filePath = join(__dirname, '../data/users.json');
    const fileContent = await readFile(filePath, 'utf8');
    const users = JSON.parse(fileContent);

    // Insert each user
    for (const user of users) {
      await docClient.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: {
          email: user.email,
          id: user.id,
          name: user.name,
          age: user.age,
          city: user.city
        }
      }));
    }

    res.json({
      success: true,
      message: `${users.length} users loaded successfully`,
      data: users
    });
  } catch (error) {
    console.error('Error loading users from file:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading users from file',
      error: error.message
    });
  }
});

/* POST route to insert a single user */
router.post('/', async (req, res, next) => {
  try {
    const { id, name, email, age, city } = req.body;

    if (!id || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'ID, name, and email are required fields'
      });
    }

    await docClient.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: { email, id, name, age, city },
      ConditionExpression: 'attribute_not_exists(email)'
    }));

    res.json({
      success: true,
      message: 'User created successfully',
      data: { id, name, email, age, city }
    });
  } catch (error) {
    console.error('Error creating user:', error);

    if (error.name === 'ConditionalCheckFailedException') {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

/* DELETE route to clear all users */
router.delete('/clear', async (req, res, next) => {
  try {
    // First, scan to get all user emails (the key)
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.USERS,
      ProjectionExpression: 'email'
    }));

    // Delete each user
    for (const item of result.Items || []) {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.USERS,
        Key: { email: item.email }
      }));
    }

    res.json({
      success: true,
      message: 'All users cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing users:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing users',
      error: error.message
    });
  }
});

export default router;
