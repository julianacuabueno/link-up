import { Router } from 'express';
import mysql from 'mysql2/promise';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'app',
  password: 'app',
  database: 'app'
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database table
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create users table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        age INT,
        city VARCHAR(255)
      )
    `);
    
    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize database on startup
initializeDatabase();

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM users');
    connection.release();
    
    res.json({
      success: true,
      data: rows,
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
    
    const connection = await pool.getConnection();
    
    // Insert each user
    const insertPromises = users.map(user => {
      return connection.execute(
        'INSERT INTO users (id, name, email, age, city) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), age = VALUES(age), city = VALUES(city)',
        [user.id, user.name, user.email, user.age, user.city]
      );
    });
    
    await Promise.all(insertPromises);
    connection.release();
    
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
    
    const connection = await pool.getConnection();
    await connection.execute(
      'INSERT INTO users (id, name, email, age, city) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, age, city]
    );
    connection.release();
    
    res.json({
      success: true,
      message: 'User created successfully',
      data: { id, name, email, age, city }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'User with this ID or email already exists'
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
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM users');
    connection.release();
    
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