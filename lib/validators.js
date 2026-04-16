function validateName(name) {
  if (!name) {
    return {
      valid: false,
      status: 400,
      message: 'Name is required'
    };
  }

  if (typeof name !== 'string') {
    return {
      valid: false,
      status: 422,
      message: 'Name must be a string'
    };
  }

  if (name.trim().length === 0) {
    return {
      valid: false,
      status: 400,
      message: 'Name cannot be empty'
    };
  }

  return { valid: true };
}

function classifyAgeGroup(age) {
  if (age >= 0 && age <= 12) return 'child';
  if (age >= 13 && age <= 19) return 'teenager';
  if (age >= 20 && age <= 59) return 'adult';
  if (age >= 60) return 'senior';
  return 'unknown';
}

module.exports = {
  validateName,
  classifyAgeGroup
};