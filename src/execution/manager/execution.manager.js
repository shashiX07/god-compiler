import { WorkspaceManager } from "../workspace/workspace.manager.js";
import { CleanupManager } from "../workspace/cleanup.manager.js";
import { CppExecutor} from "../languages/cpp/index.js";
import { JobRegistry } from "./job.registry.js";
import { JOB_STATES } from "./state.machine.js";
import { concurrencyGuard } from "../queue/concurrency.guard.js";
import { v4 as uuidv4 } from 'uuid';
export class ExecutionManager {
    static async executeCpp(code) {
        if (!concurrencyGuard.canRun()) {
            return {
                success:false,
                "message": "Server is busy. You are in the queue. Please wait for your turn."
            }
        }
        concurrencyGuard.start();
        const jobID = uuidv4();
        const {workspacePath} = await WorkspaceManager.createWorkspace(jobID);
        const job = {
            id: jobID,
            state: JOB_STATES.CREATED,
            workspacePath,
            createdAt: new Date()
        }
        JobRegistry.create(job);
        try {
            job.state = JOB_STATES.COMPILING;
            const result = await CppExecutor.execute(code, workspacePath);
            job.state = JOB_STATES.COMPLETED;
            return result;
        } catch (error) {
            console.error("Error during execution:", error);
            job.state = JOB_STATES.FAILED;
            return {
                success: false,
                phase: 'compilation/execution',
                message: "Error during code execution: \n" + error.message
            }
        } finally {
            await CleanupManager.cleanWorkspace(workspacePath);
            job.state = JOB_STATES.CLEAN;
            JobRegistry.remove(jobID);
            concurrencyGuard.end();
        }
    }
}