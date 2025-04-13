import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  enviroment: string;
  DB_URI: string;
  JWT: {
    secret: string;
    expiresIn: string;
  };
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  enviroment: process.env.NODE_ENV || 'development',
  DB_URI: process.env.DB_URI || '',
  JWT: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  },
};

export default config;
