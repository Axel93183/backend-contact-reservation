import bodyParser from "body-parser";
import dotenv from "dotenv";
import express, { Request, Response } from "express";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Test route
app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running!");
});

// Import routes
import contactRouter from "./routes/contact";
app.use("/api/contact", contactRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
