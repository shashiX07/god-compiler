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
                process.kill(-this.process.pid, 'SIGKILL');
            }catch (error) {
                console.error("Error killing process due to output limit:", error);
            }
        }
    }
}