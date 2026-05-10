export class RuntimePipeline {
    static async run(runtime, context) {
        await runtime.prepare(context);
        const compileResult = await runtime.compile(context);
        if (compileResult?.success === false) {
            return {
                success: false,
                phase: 'compilation',
                ...compileResult
            }
        }
        return await runtime.execute(context);
    }
}