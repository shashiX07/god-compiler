class RuntimeRegistery {
    constructor() {
        this.runtime = new Map();
    }
    register(language, runtime) {
        this.runtime.set(language, runtime);
    }
    get(language) {
        return this.runtime.get(language);
    }
    list() {
        return [...this.runtime.keys()].sort();
    }
}

export const runtimeRegistry = new RuntimeRegistery();