import { Router } from "express";
import { getRecipes, searchRecipes } from "../controllers/recipe.controller.js";
const router = Router();

router.get("/", getRecipes);
router.get("/search", searchRecipes);

export default router;
