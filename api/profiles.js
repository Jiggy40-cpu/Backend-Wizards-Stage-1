const express = require('express');
const router = express.Router();
const { v7: uuidv7 } = require('uuid');
const { fetchProfileData } = require('../lib/external-apis');
const { getProfile, getAllProfiles, createProfile, deleteProfile, getProfileByName } = require('../lib/db');
const { validateName, classifyAgeGroup } = require('../lib/validators');

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    const validation = validateName(name);
    if (!validation.valid) {
      return res.status(validation.status).json({
        status: 'error',
        message: validation.message
      });
    }

    const normalizedName = name.toLowerCase().trim();

    const existing = await getProfileByName(normalizedName);
    if (existing) {
      return res.status(200).json({
        status: 'success',
        message: 'Profile already exists',
        data: existing
      });
    }

    const apiData = await fetchProfileData(name);
    if (apiData.error) {
      return res.status(502).json({
        status: 'error',
        message: apiData.error
      });
    }

    const id = uuidv7();
    const now = new Date().toISOString();
    const ageGroup = classifyAgeGroup(apiData.age);

    const profile = {
      id,
      name: name,
      gender: apiData.gender,
      gender_probability: apiData.gender_probability,
      sample_size: apiData.sample_size,
      age: apiData.age,
      age_group: ageGroup,
      country_id: apiData.country_id,
      country_probability: apiData.country_probability,
      created_at: now
    };

    await createProfile(profile);

    res.status(201).json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    console.error('POST error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await getProfile(id);

    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    console.error('GET by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { gender, country_id, age_group } = req.query;

    const filters = {};
    if (gender) filters.gender = gender.toLowerCase();
    if (country_id) filters.country_id = country_id.toUpperCase();
    if (age_group) filters.age_group = age_group.toLowerCase();

    const profiles = await getAllProfiles(filters);

    res.status(200).json({
      status: 'success',
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    console.error('GET all error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteProfile(id);

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('DELETE error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;