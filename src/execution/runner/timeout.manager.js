export class TimeoutManager {
    static createTimeout(process, timeout) {
        return setTimeout(() => {
            try {
                process.kill('SIGKILL');
            }catch (error) {
                console.error("Error killing process on timeout:", error);
            }
        }, timeout);
    }
}