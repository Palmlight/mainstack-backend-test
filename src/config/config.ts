import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  enviroment: string;
  DB_URI: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  enviroment: process.env.NODE_ENV || 'development',
  DB_URI: process.env.DB_URI || '',
};

export default config;
