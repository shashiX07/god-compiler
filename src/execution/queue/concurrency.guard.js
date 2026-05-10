const MAX_CONCURRENT_EXECUTIONS = 3;

class ConcurrencyGuard {
    constructor() {
        this.activeExecutions = 0;
    }
    canRun() {
        return this.activeExecutions < MAX_CONCURRENT_EXECUTIONS;
    }
    start(){
        this.activeExecutions++;
    }
    end() {
        this.activeExecutions--;
        if(this.activeExecutions < 0) {
            this.activeExecutions = 0;
        }
    }
}

export const concurrencyGuard = new ConcurrencyGuard();
