const fs = require('fs');
const path = require('path');

const dbFile = path.join(process.cwd(), 'data.json');

function loadProfiles() {
  try {
    if (fs.existsSync(dbFile)) {
      return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading profiles:', error);
  }
  return {};
}

function saveProfiles(profiles) {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(profiles, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving profiles:', error);
  }
}

async function initializeDb() {
  if (!fs.existsSync(dbFile)) {
    saveProfiles({});
  }
  console.log('Database initialized successfully');
}

async function getProfile(id) {
  const profiles = loadProfiles();
  return profiles[id] || null;
}

async function getProfileByName(name) {
  const profiles = loadProfiles();
  const normalizedName = name.toLowerCase().trim();
  for (const id in profiles) {
    if (profiles[id].name.toLowerCase().trim() === normalizedName) {
      return profiles[id];
    }
  }
  return null;
}

async function getAllProfiles(filters = {}) {
  const profiles = loadProfiles();
  let results = Object.values(profiles);

  if (filters.gender) {
    results = results.filter(p => p.gender && p.gender.toLowerCase() === filters.gender.toLowerCase());
  }
  if (filters.country_id) {
    results = results.filter(p => p.country_id && p.country_id.toUpperCase() === filters.country_id.toUpperCase());
  }
  if (filters.age_group) {
    results = results.filter(p => p.age_group && p.age_group.toLowerCase() === filters.age_group.toLowerCase());
  }

  results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  return results.map(p => ({
    id: p.id,
    name: p.name,
    gender: p.gender,
    age: p.age,
    age_group: p.age_group,
    country_id: p.country_id
  }));
}

async function createProfile(profile) {
  const profiles = loadProfiles();
  profiles[profile.id] = profile;
  saveProfiles(profiles);
  return profile;
}

async function deleteProfile(id) {
  const profiles = loadProfiles();
  if (profiles[id]) {
    delete profiles[id];
    saveProfiles(profiles);
    return true;
  }
  return false;
}

module.exports = {
  initializeDb,
  getProfile,
  getProfileByName,
  getAllProfiles,
  createProfile,
  deleteProfile
};