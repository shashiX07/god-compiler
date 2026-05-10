import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { paths } from '../../config/paths.js';

export class WorkspaceManager {
    static async createWorkspace(jobId = uuidv4()) {
        const JobID = jobId;

        const workspacePath = path.join(paths.TEMP_EXECUTIONS, JobID);
        await fs.mkdir(workspacePath, { recursive: true });

        return {
            JobID,
            workspacePath
        }
    }
}
