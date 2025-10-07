
import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

/** Nested schema so we can index caloriesNumber */
const nutrientsSchema = new Schema(
  {
    calories: { 
      type: String, 
      default: null }, // e.g. "389 kcal"

    carbohydrateContent: { 
      type: String, 
      default: null },
      
    cholesterolContent: { 
      type: String, 
      default: null },

    fiberContent: { 
      type: String, 
      default: null },

    proteinContent: { 
      type: String, 
      default: null },

    saturatedFatContent: { 
      type: String, 
      default: null },

    sodiumContent: { 
      type: String, 
      default: null },

    sugarContent: { 
      type: String, 
      default: null },

    fatContent: { 
      type: String, 
      default: null },

    unsaturatedFatContent: { 
      type: String, 
      default: null },

    // numeric extracted during import for range queries
    caloriesNumber: { 
      type: Number, 
      index: true, 
      default: null }
  },
  { _id: false }
);

const recipeSchema = new Schema(
  {
    cuisine: { 
      type: String, 
      index: true },
    title: { 
      type: String, 
      index: true },
    rating: { 
      type: Number, 
      default: null },
    prep_time: { 
      type: Number, 
      default: null },
    cook_time: { 
      type: Number, 
      default: null },
    total_time: { 
      type: Number, 
      default: null },
    description: { 
      type: String, 
      default: null },

    // extras from your JSON (optional but harmless & useful)
    url: { 
      type: String, 
      default: null },
    continent: { 
      type: String, 
      default: null },
    country_state: { 
      type: String, 
      default: null },
    ingredients: { 
      type: [String], 
      default: undefined },
    instructions: { 
      type: [String], 
      default: undefined },

    nutrients: { 
      type: nutrientsSchema, 
      default: {} },
    serves: { 
      type: String, 
      default: null }
  },
  { timestamps: true }
);

/** Helpful secondary indexes */
recipeSchema.index({ rating: -1 });
recipeSchema.index({ total_time: 1 });
recipeSchema.index({ title: 1, cuisine: 1 });

/** Clean JSON output */
recipeSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

const Recipe = models.Recipe || model("Recipe", recipeSchema);
export default Recipe;
