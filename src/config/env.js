import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MAX_CODE_SIZE: Number(process.env.MAX_CODE_SIZE, 10) || 10000,
    EXECUTION_TIMEOUT: Number(process.env.EXECUTION_TIMEOUT, 10) || 5000,
    TEMP_DIR: process.env.TEMP_DIR || '/tmp/executions',
}