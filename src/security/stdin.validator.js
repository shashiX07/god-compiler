import { MAX } from "uuid";

const MAX_STDIN_SIZE = 1024 * 10; // 10 KB
export const validateStdin = (input) => {
    if (typeof input !== "string") {
        return false;
    }
    if (input.length > MAX_STDIN_SIZE) {
        return false;
    }
    return true;
}