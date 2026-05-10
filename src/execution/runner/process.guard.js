export class ProcessGuard {
    static killProcess(process) {
        try {
            process.kill('SIGKILL');
        }catch (error) {
            console.error("Error killing process:", error);
        }
    }
}