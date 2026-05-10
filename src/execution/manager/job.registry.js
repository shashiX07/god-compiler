class jobRegistry {
    constructor() {
        this.jobs = new Map();
    }
    create(job) {
        this.jobs.set(job.id, job);
    }
    get(jobId) {
        return this.jobs.get(jobId);
    }
    remove(jobId) {
        this.jobs.delete(jobId);
    }
    getAll() {
        return Array.from(this.jobs.values());
    }
}

export const JobRegistry = new jobRegistry();