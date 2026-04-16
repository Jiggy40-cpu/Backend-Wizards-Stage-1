const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Initialize database
async function initializeDb() {
  try {
    // Test connection
    await prisma.$executeRaw`SELECT 1`;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Get profile by ID
async function getProfile(id) {
  try {
    return await prisma.profile.findUnique({
      where: { id }
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

// Get profile by name
async function getProfileByName(name) {
  try {
    return await prisma.profile.findUnique({
      where: { name }
    });
  } catch (error) {
    console.error('Error getting profile by name:', error);
    return null;
  }
}

// Get all profiles with optional filters
async function getAllProfiles(filters = {}) {
  try {
    const where = {};

    if (filters.gender) {
      where.gender = {
        equals: filters.gender,
        mode: 'insensitive'
      };
    }

    if (filters.country_id) {
      where.countryId = {
        equals: filters.country_id,
        mode: 'insensitive'
      };
    }

    if (filters.age_group) {
      where.ageGroup = {
        equals: filters.age_group,
        mode: 'insensitive'
      };
    }

    const profiles = await prisma.profile.findMany({
      where,
      select: {
        id: true,
        name: true,
        gender: true,
        age: true,
        ageGroup: true,
        countryId: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Map field names for API response
    return profiles.map(p => ({
      id: p.id,
      name: p.name,
      gender: p.gender,
      age: p.age,
      age_group: p.ageGroup,
      country_id: p.countryId
    }));
  } catch (error) {
    console.error('Error getting all profiles:', error);
    return [];
  }
}

// Create profile
async function createProfile(profile) {
  try {
    return await prisma.profile.create({
      data: {
        id: profile.id,
        name: profile.name,
        gender: profile.gender,
        genderProbability: profile.gender_probability,
        sampleSize: profile.sample_size,
        age: profile.age,
        ageGroup: profile.age_group,
        countryId: profile.country_id,
        countryProbability: profile.country_probability,
        createdAt: new Date(profile.created_at)
      }
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
}

// Delete profile
async function deleteProfile(id) {
  try {
    const result = await prisma.profile.delete({
      where: { id }
    });
    return !!result;
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
  prisma
};