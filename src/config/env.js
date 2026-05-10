import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MAX_CODE_SIZE: Number(process.env.MAX_CODE_SIZE, 10) || 10000,
    TEMP_DIR: process.env.TEMP_DIR || '/tmp/executions',
    RUN_TIMEOUT: Number(process.env.RUN_TIMEOUT, 10) || 30000,
    MAX_CONCURRENT_EXECUTIONS: Number(process.env.MAX_CONCURRENT_EXECUTIONS, 10) || 5,
}