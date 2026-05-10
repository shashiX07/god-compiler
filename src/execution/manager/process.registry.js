class ProcessRegistry {
    constructor() {
        this.process = new Map();
    }
    
    add(jobId, process) {
        this.process.set(jobId, process);
    }

    get(jobId) {
        return this.process.get(jobId);
    }

    remove(jobId){
        this.process.delete(jobId);
    }

}

export const processRegistry = new ProcessRegistry();