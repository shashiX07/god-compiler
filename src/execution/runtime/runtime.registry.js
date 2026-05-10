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
}

export const runtimeRegistry = new RuntimeRegistery();