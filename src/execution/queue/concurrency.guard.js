import { EXECUTION_CONSTANTS } from "../../constants/execution.constants.js";
const MAX_CONCURRENT_EXECUTIONS = EXECUTION_CONSTANTS.MAX_CONCURRENT_EXECUTIONS;
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
