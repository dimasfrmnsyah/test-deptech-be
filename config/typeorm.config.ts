import { DataSourceOptions } from 'typeorm';
import 'dotenv/config';
export default (): DataSourceOptions => {
  const { 
    DB_HOST, 
    DB_PORT, 
    DB_USER, 
    DB_PASS,
    DB_NAME, 
    DB_SYNC,
    DB_LOGGING='true' } 
  = process.env;
  return {
    type: 'mysql', host: DB_HOST, port: DB_PORT, username: DB_USER, password: DB_PASS, database: DB_NAME,
    entities: [__dirname + '/../**/*.entity.{ts,js}'], synchronize: DB_SYNC==='true', logging: DB_LOGGING==='true', timezone: 'Z'
  } as DataSourceOptions;
};