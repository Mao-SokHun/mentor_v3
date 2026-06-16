import { UserType } from '../../models/index.js';

/**
 * Get all user types from the database.
 */
export const getUserTypes = async (req, res) => {
  try {
    const userTypes = await UserType.findAll();
    res.json(userTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new user type.
 */
export const createUserType = async (req, res) => {
  try {
    const { user_type_name } = req.body;
    if (!user_type_name) {
      return res.status(400).json({ error: 'user_type_name is required' });
    }
    const newUserType = await UserType.create({ user_type_name });
    res.status(201).json(newUserType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
