const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        gender VARCHAR(10),
        gender_probability DECIMAL(5, 4),
        sample_size INTEGER,
        age INTEGER,
        age_group VARCHAR(20),
        country_id VARCHAR(5),
        country_probability DECIMAL(5, 4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

async function getProfile(id) {
  try {
    const result = await pool.query('SELECT * FROM profiles WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

async function getProfileByName(name) {
  try {
    const normalizedName = name.toLowerCase().trim();
    const result = await pool.query(
      'SELECT * FROM profiles WHERE LOWER(TRIM(name)) = $1',
      [normalizedName]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting profile by name:', error);
    return null;
  }
}

async function getAllProfiles(filters = {}) {
  try {
    let query = 'SELECT id, name, gender, age, age_group, country_id FROM profiles WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.gender) {
      query += ` AND LOWER(gender) = $${paramCount}`;
      params.push(filters.gender.toLowerCase());
      paramCount++;
    }

    if (filters.country_id) {
      query += ` AND UPPER(country_id) = $${paramCount}`;
      params.push(filters.country_id.toUpperCase());
      paramCount++;
    }

    if (filters.age_group) {
      query += ` AND LOWER(age_group) = $${paramCount}`;
      params.push(filters.age_group.toLowerCase());
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error getting all profiles:', error);
    return [];
  }
}

async function createProfile(profile) {
  try {
    const result = await pool.query(
      `INSERT INTO profiles (id, name, gender, gender_probability, sample_size, age, age_group, country_id, country_probability, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        profile.id,
        profile.name,
        profile.gender,
        profile.gender_probability,
        profile.sample_size,
        profile.age,
        profile.age_group,
        profile.country_id,
        profile.country_probability,
        profile.created_at
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
}

async function deleteProfile(id) {
  try {
    const result = await pool.query('DELETE FROM profiles WHERE id = $1', [id]);
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
  deleteProfile
};