import dotenv from 'dotenv';
dotenv.config();

export const getSecret = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Secret ${key} not found!`);
  return value;
};
