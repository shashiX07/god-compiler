import path from 'path';
import { env } from './env.js';

export const paths = {
    ROOT: process.cwd(),
    // Keep each server process in its own directory so shutdown cleanup cannot
    // remove workspaces belonging to another process.
    TEMP_EXECUTIONS: path.resolve(env.TEMP_DIR, `server-${process.pid}`)
}
