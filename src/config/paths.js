import path from 'path';
import { env } from './env.js';

export const paths = {
    ROOT: process.cwd(),
    TEMP_EXECUTIONS: path.resolve(env.TEMP_DIR)
}
