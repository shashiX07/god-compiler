import express from 'express';
import cors from 'cors';
import executeRoutes from './routes/execute.routes.js';

const app = express();

app.use(cors());
app.use(express.json({
    limit: '100kb'
}));

app.use('/execute', executeRoutes);

// root endpoint
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Welcome to God Compiler API"
    })
});

// health check endpoint
app.get("/health", (req, res) => {
    return res.json({
        success: true,
        message: "Server is healthy"
    })
})

export default app;

