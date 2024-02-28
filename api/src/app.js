import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import postRouter from "./routes/post.routes.js";
import commentsRouter from "./routes/comments.routes.js";
import path from "path";
const __dirname = path.resolve();
const app = express();
// //
// predefined middleware
app.use(express.json({ limit: "16kb" }));
app.use(morgan("tiny"));
app.use(cookieParser());

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

// routes import
app.use("/api/v1/users", authRouter);
app.use("/api/v1/post", postRouter);

app.use("/api/v1/comments", commentsRouter);
app.use(express.static(path.join(__dirname, "/client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});
export default app;
