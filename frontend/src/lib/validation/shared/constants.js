/** Field limits aligned with Sequelize models in backend-rokkru-auth-intergrate/models */

export const PHONE_MIN_LENGTH = 8
export const PHONE_MAX_LENGTH = 10

export const STUDENT_FIELD_LIMITS = {
  firstname: 100,
  lastname: 100,
  phone_number: 100,
  study_major: 100,
  university: 150,
  description: 200,
  address: 250,
}

export const MENTOR_FIELD_LIMITS = {
  firstname: 100,
  lastname: 100,
  gender: 20,
  phone_number: 100,
  address: 255,
  description: null,
}

export const AUTH_FIELD_LIMITS = {
  email: 255,
  passwordMin: 8,
}
