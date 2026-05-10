const MAX_OUTPUT_SIZE = 1024 * 1024; // 1 MB

export class OutputGuard {
    constructor(process) {
        this.process = process;
        this.currentSize = 0;
        this.isExceeded = false;
    }
    addChunk(chunk) {
        this.currentSize += chunk.length;
        if (this.currentSize > MAX_OUTPUT_SIZE) {
            this.isExceeded = true;
            try {
                this.process.kill('SIGKILL');
            } catch (error) {
                console.error("Error killing process due to output limit:", error);
            }
        }
    }
}