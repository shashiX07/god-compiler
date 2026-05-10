

import { ExecutionManager } from "../execution/manager/execution.manager.js";


export const executeCode = async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Code is required"
            });
        }
        if (language !== 'cpp') {
            return res.status(400).json({
                success: false,
                message: "Unsupported language only cpp is supported"
            });
        }

        const result = await ExecutionManager.executeCpp(code);

        return res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error("Error executing code:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while executing code"
        });
    }
};