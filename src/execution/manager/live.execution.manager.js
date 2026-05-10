import fs from 'fs/promises';
import path from 'path';
import { WorkspaceManager } from '../workspace/workspace.manager.js';
import { CleanupManager } from '../workspace/cleanup.manager.js';
import { streamRunner } from '../runner/stream.runner.js';
import { EXECUTION_CONSTANTS } from '../../constants/execution.constants.js';
import { compileCpp } from '../compiler/compile.cpp.js';

export class LiveExecutionManager {
    static async executeCpp(code, socket) {
        const { workspacePath } = await WorkspaceManager.createWorkspace();
        
        try {
            const sourceFile = EXECUTION_CONSTANTS.CPP_SOURCE_FILE;
            const outputFile = EXECUTION_CONSTANTS.CPP_OUTPUT_FILE;
            const sourcePath = path.join(workspacePath, sourceFile);

            // 1. Write File
            await fs.writeFile(sourcePath, code);

            socket.send(JSON.stringify({
                event: 'status',
                data: 'Compiling...'
            }));

            // 2. Compile
            let compilerResult;
            try {
                compilerResult = await compileCpp(sourceFile, outputFile, workspacePath);
                
                // Handle the case where compileCpp resolves with success: false (like a Timeout)
                if (compilerResult.success === false) {
                    socket.send(JSON.stringify({
                        event: 'exit',
                        data: {
                            phase: 'compilation',
                            ...compilerResult
                        }
                    }));
                    return;
                }
            } catch (error) {
                // Handle the case where compileCpp rejects (Syntax Errors)
                socket.send(JSON.stringify({
                    event: 'exit',
                    data: {
                        success: false,
                        phase: 'compilation',
                        stderr: error.message,
                        stdout: ""
                    }
                }));
                return;
            }

            // 3. Execute (Streaming)
            socket.send(JSON.stringify({
                event: 'status',
                data: 'Compilation completed. Executing...'
            }));

            await streamRunner(`./${outputFile}`, workspacePath, socket);

        } catch (globalError) {
            console.error("Live Execution Manager Error:", globalError);
            socket.send(JSON.stringify({
                event: 'error',
                data: 'Internal server error during execution'
            }));
        } finally {
            // 4. Cleanup
            await CleanupManager.cleanWorkspace(workspacePath);
        }
    }
}