import {timeStringSchema} from './timestring.schema';
import {connectionSchema} from './connection.schema';
import {mongodbConnectionSchema} from './mongodb-connection.schema';
import {mysqlConnectionSchema} from './mysql-connection.schema';
import {redisConnectionSchema} from './redis-connection.schema';

export const configSchemas = {
    timeString: timeStringSchema,
    connection: connectionSchema,
    mongodbConnection: mongodbConnectionSchema,
    mysqlConnection: mysqlConnectionSchema,
    redisConnection: redisConnectionSchema
};
