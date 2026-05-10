class ExecutionQueue {
    constructor() {
        this.queue = [];
    }
    enqueue(job) {
        this.queue.push(job);
    }
    dequeue() {
        return this.queue.shift();
    }
    size() {
        return this.queue.length;
    }
}

export const executionQueue = new ExecutionQueue();