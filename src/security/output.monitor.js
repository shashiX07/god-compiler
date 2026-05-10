const MAX_OUTPUT_BYTES = 1024 * 1024; // 1 MB

export class OutputMonitor {
    constructor(process) {
        this.process = process;
        this.totalBytes = 0;
    }

    track(chunk){
        this.totalBytes += Buffer.byteLength(chunk);
        if(this.totalBytes > MAX_OUTPUT_BYTES) {
            try {
                if (typeof this.process?.kill === 'function') {
                    // PTY processes and Windows child processes typically don't support negative PGIDs.
                    this.process.kill('SIGKILL');
                } else if (process.platform === 'win32') {
                    process.kill(this.process.pid, 'SIGKILL');
                } else {
                    process.kill(-this.process.pid, 'SIGKILL');
                }
            }catch (error) {
                console.error("Error killing process due to output limit:", error);
            }
        }
    }
}