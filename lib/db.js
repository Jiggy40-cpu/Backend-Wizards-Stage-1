const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database and create table
async function initializeDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        gender VARCHAR(50),
        gender_probability FLOAT,
        sample_size INT,
        age INT,
        age_group VARCHAR(50),
        country_id VARCHAR(10),
        country_probability FLOAT,
        created_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_name ON profiles(name);
      CREATE INDEX IF NOT EXISTS idx_gender ON profiles(gender);
      CREATE INDEX IF NOT EXISTS idx_country_id ON profiles(country_id);
      CREATE INDEX IF NOT EXISTS idx_age_group ON profiles(age_group);
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    client.release();
  }
}

// Get profile by ID
async function getProfile(id) {
  try {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

// Get profile by name
async function getProfileByName(name) {
  try {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting profile by name:', error);
    return null;
  }
}

// Get all profiles with optional filters
async function getAllProfiles(filters = {}) {
  try {
    let query = 'SELECT id, name, gender, age, age_group, country_id FROM profiles WHERE 1=1';
    const params = [];

    if (filters.gender) {
      query += ' AND LOWER(gender) = LOWER($' + (params.length + 1) + ')';
      params.push(filters.gender);
    }

    if (filters.country_id) {
      query += ' AND UPPER(country_id) = UPPER($' + (params.length + 1) + ')';
      params.push(filters.country_id);
    }

    if (filters.age_group) {
      query += ' AND LOWER(age_group) = LOWER($' + (params.length + 1) + ')';
      params.push(filters.age_group);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error getting all profiles:', error);
    return [];
  }
}

// Create profile
async function createProfile(profile) {
  try {
    const {
      id,
      name,
      gender,
      gender_probability,
      sample_size,
      age,
      age_group,
      country_id,
      country_probability,
      created_at
    } = profile;

    const result = await pool.query(
      `INSERT INTO profiles (
        id, name, gender, gender_probability, sample_size,
        age, age_group, country_id, country_probability, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        id,
        name,
        gender,
        gender_probability,
        sample_size,
        age,
        age_group,
        country_id,
        country_probability,
        created_at
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
}

// Delete profile
async function deleteProfile(id) {
  try {
    const result = await pool.query(
      'DELETE FROM profiles WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting profile:', error);
    return false;
  }
}

module.exports = {
  initializeDb,
  getProfile,
  getProfileByName,
  getAllProfiles,
  createProfile,
  deleteProfile,
  pool
};