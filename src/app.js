import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { UPLOADS_ROOT } from "./middleware/upload.js";

const app = express();

// Trust the first proxy (ngrok, Vercel, etc.) so req.protocol reflects https
app.set("trust proxy", 1);

// Allow all origins — supports multiple frontend URLs (localhost, ngrok, etc.)
// We reflect the request origin back so cookies/credentials still work.
app.use(
  cors({
    origin: (origin, callback) => callback(null, origin || "*"),
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(UPLOADS_ROOT));
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
