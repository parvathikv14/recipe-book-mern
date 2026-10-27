import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Recipe name is required"], trim: true, minlength: 2, maxlength: 100 },
    category: { type: String, required: true, enum: ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Drink", "Other"] },
    ingredients: { type: [String], required: true, validate: { validator: (items) => items.length > 0 && items.some((item) => item.trim()), message: "Add at least one ingredient" } },
    steps: { type: [String], required: true, validate: { validator: (items) => items.length > 0 && items.some((item) => item.trim()), message: "Add at least one preparation step" } },
    cookingTime: { type: Number, required: true, min: [1, "Cooking time must be at least 1 minute"], max: [1440, "Cooking time must be 1440 minutes or less"] },
  },
  { timestamps: true }
);

export default mongoose.model("Recipe", recipeSchema);
