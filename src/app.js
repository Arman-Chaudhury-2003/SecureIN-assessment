import express from "express";
import cors from "cors";
import morgan from "morgan";
import recipeRoutes from "./routes/recipe.routes.js";

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/recipes", recipeRoutes);
app.get("/health", (_, res) => res.json({ ok: true }));

export default app;
