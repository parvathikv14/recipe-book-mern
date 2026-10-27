import { Router } from "express";
import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

const router = Router();

function cleanList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  return [];
}
function payload(body) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    category: body.category,
    ingredients: cleanList(body.ingredients),
    steps: cleanList(body.steps),
    cookingTime: Number(body.cookingTime),
  };
}
function badId(id) {
  return !mongoose.isValidObjectId(id);
}

router.get("/", async (_req, res, next) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ message: "Invalid recipe ID" });
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const data = payload(req.body);
    if (!data.name || data.name.length < 2) return res.status(400).json({ message: "Enter a recipe name with at least 2 characters" });
    if (!data.category) return res.status(400).json({ message: "Choose a category" });
    if (!data.ingredients.length) return res.status(400).json({ message: "Add at least one ingredient" });
    if (!data.steps.length) return res.status(400).json({ message: "Add at least one preparation step" });
    if (!Number.isFinite(data.cookingTime) || data.cookingTime < 1 || data.cookingTime > 1440) return res.status(400).json({ message: "Cooking time must be between 1 and 1440 minutes" });
    const recipe = await Recipe.create(data);
    res.status(201).json(recipe);
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ message: "Invalid recipe ID" });
    const data = payload(req.body);
    if (!data.name || data.name.length < 2 || !data.category || !data.ingredients.length || !data.steps.length || !Number.isFinite(data.cookingTime) || data.cookingTime < 1 || data.cookingTime > 1440) {
      return res.status(400).json({ message: "Please provide valid values for every field" });
    }
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (badId(req.params.id)) return res.status(400).json({ message: "Invalid recipe ID" });
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json({ message: "Recipe deleted" });
  } catch (error) { next(error); }
});

export default router;
