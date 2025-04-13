import config from '@/config/config';
import { anyObject } from './response.util';
import { sign, decode } from 'jsonwebtoken';

export const generateJWTToken = async (payload: anyObject): Promise<string> => {
  const expiresIn = config.JWT?.expiresIn as string | number;
  return sign(payload, config.JWT?.secret as string, {
    expiresIn,
    algorithm: 'HS256',
  });
};

export const decodeJWTToken = (token: string) => decode(token);
