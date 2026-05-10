import { env } from '../config/env.js';

const cppOutputFile = process.platform === 'win32' ? "main.exe" : "main";

export const EXECUTION_CONSTANTS = {
    // C/C++ related constants
    CPP_SOURCE_FILE: "main.cpp",
    CPP_OUTPUT_FILE: cppOutputFile,
    COMPILE_TIMEOUT: 10000, // 10 seconds
    RUN_TIMEOUT: env.RUN_TIMEOUT,
    MAX_CONCURRENT_EXECUTIONS: env.MAX_CONCURRENT_EXECUTIONS,
}
