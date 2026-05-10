import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,

  max: 30,

  message: {
    success: false,
    message: "Too many requests",
  },
});
