import dotenv from 'dotenv';
import os from 'os';
import path from 'path';

dotenv.config();

const defaultTempDir = path.join(os.tmpdir(), 'executions');
const configuredTempDir = process.env.TEMP_DIR;
const isUnixStylePathOnWindows =
    process.platform === 'win32' &&
    configuredTempDir &&
    configuredTempDir.startsWith('/');

export const env = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MAX_CODE_SIZE: Number(process.env.MAX_CODE_SIZE, 10) || 10000,
    TEMP_DIR: isUnixStylePathOnWindows ? defaultTempDir : (configuredTempDir || defaultTempDir),
    RUN_TIMEOUT: Number(process.env.RUN_TIMEOUT, 10) || 30000,
    MAX_EXECUTION_TIMEOUT: Number(process.env.MAX_EXECUTION_TIMEOUT, 10) || 600000,
    MAX_CONCURRENT_EXECUTIONS: Number(process.env.MAX_CONCURRENT_EXECUTIONS, 10) || 5,
    PYTHON_EXECUTABLE: process.env.PYTHON_EXECUTABLE || "",
}
