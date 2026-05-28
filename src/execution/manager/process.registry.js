class ProcessRegistry {
    constructor() {
        this.processes = new Map();
        // Backward-compatible alias for older accessors.
        this.process = this.processes;
    }
    
    add(jobId, process) {
        this.processes.set(jobId, process);
    }

    get(jobId) {
        return this.processes.get(jobId);
    }

    remove(jobId){
        this.processes.delete(jobId);
    }

}

export const processRegistry = new ProcessRegistry();