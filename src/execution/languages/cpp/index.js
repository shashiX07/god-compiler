import path from 'path';
import fs from 'fs/promises';

import { compileCpp } from '../../compiler/compile.cpp.js';
import { runProcess } from '../../runner/process.runner.js';

import { EXECUTION_CONSTANTS } from '../../../constants/execution.constants.js';

export class CppExecutor {
    static async execute (code, workspacePath) {
        const sourceFile = EXECUTION_CONSTANTS.CPP_SOURCE_FILE;
        const outputFile = EXECUTION_CONSTANTS.CPP_OUTPUT_FILE;
    
        const sourcePath = path.join(workspacePath, sourceFile);

        await fs.writeFile(sourcePath, code);

        const compileResult = await compileCpp(sourceFile, outputFile, workspacePath);

        if (compileResult?.success === false) {
            return {
                success: false,
                phase: 'compilation',
                ...compileResult
            }
        }
        
        const executionResult = await runProcess(`./${outputFile}`, workspacePath);

        return {
            success: true,
            phase: 'execution',
            ...executionResult
        }

    }
}