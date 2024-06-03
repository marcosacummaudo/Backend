import bcrypt from 'bcrypt';

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (enteredPassword, savedPassword) => bcrypt.compareSync(enteredPassword, savedPassword);
