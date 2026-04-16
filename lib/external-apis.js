const axios = require('axios');

const GENDERIZE_URL = 'https://api.genderize.io';
const AGIFY_URL = 'https://api.agify.io';
const NATIONALIZE_URL = 'https://api.nationalize.io';

async function fetchProfileData(name) {
  try {
    const [genderResponse, ageResponse, nationalityResponse] = await Promise.all([
      axios.get(`${GENDERIZE_URL}?name=${name}`).catch(err => ({ data: null })),
      axios.get(`${AGIFY_URL}?name=${name}`).catch(err => ({ data: null })),
      axios.get(`${NATIONALIZE_URL}?name=${name}`).catch(err => ({ data: null }))
    ]);

    const genderData = genderResponse.data;
    const ageData = ageResponse.data;
    const nationalityData = nationalityResponse.data;

    if (!genderData || genderData.gender === null || genderData.count === 0) {
      return { error: 'Genderize returned an invalid response' };
    }

    if (!ageData || ageData.age === null) {
      return { error: 'Agify returned an invalid response' };
    }

    if (!nationalityData || !nationalityData.country || nationalityData.country.length === 0) {
      return { error: 'Nationalize returned an invalid response' };
    }

    const topCountry = nationalityData.country.reduce((prev, current) =>
      prev.probability > current.probability ? prev : current
    );

    return {
      gender: genderData.gender,
      gender_probability: genderData.probability,
      sample_size: genderData.count,
      age: ageData.age,
      country_id: topCountry.country_id,
      country_probability: topCountry.probability
    };
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return { error: 'Failed to fetch profile data' };
  }
}

module.exports = {
  fetchProfileData
};