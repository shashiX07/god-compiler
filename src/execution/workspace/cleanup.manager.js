import fs from 'fs/promises';

export class CleanupManager {
   static async cleanWorkspace(workspacePath) {
        try {
            await fs.rm(workspacePath, { recursive: true, force: true });
        } catch (err) {
            console.error(`Error cleaning workspace at ${workspacePath}:`, err);
        };
   } 
}