import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './enviroment.config';
import * as path from 'path';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.name,
  synchronize: config.database.synchronize,
  entities: [path.join(__dirname, '../../**/*.entity{.ts,.js}')],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  ...(config.nodeEnv === 'development'
    ? {}
    : {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
};

export const AppDataSource = new DataSource(dataSourceOptions);
