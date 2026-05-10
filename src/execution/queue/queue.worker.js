import  { executionQueue } from './execution.queue.js';
import { concurrencyGuard } from './concurrency.guard.js';

export const startQueueWorker = () => {
    setInterval(async () => {
        if (!concurrencyGuard.canRun()) {
            return;
        }
        const nextJob = executionQueue.dequeue();

        if (!nextJob) {
            return;
        }

        concurrencyGuard.start();

        try {
            await nextJob.execute();
        } finally {
            concurrencyGuard.end();
        }
    }, 100);
}