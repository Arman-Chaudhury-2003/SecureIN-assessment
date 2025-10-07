import Recipe from "../models/Recipe.js";

const parseOp = (raw) => {
  if (typeof raw !== "string") return {};
  const m = raw.match(/^(<=|>=|<|>|=)?\s*([0-9.]+)$/);
  if (!m) return {};
  const [, op, num] = m;
  const v = Number(num);
  const map = { "<=": "$lte", ">=": "$gte", "<": "$lt", ">": "$gt", "=": "$eq" };
  return { [map[op || "="] || "$eq"]: v };
};

export const getRecipes = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Recipe.find().sort({ rating: -1 }).skip(skip).limit(limit),
    Recipe.countDocuments()
  ]);

  res.json({ page, limit, total, data });
};

export const searchRecipes = async (req, res) => {
  const { title, cuisine, rating, total_time, calories } = req.query;
  const filter = {};

  if (title) filter.title = { $regex: String(title), $options: "i" };
  if (cuisine) filter.cuisine = { $regex: String(cuisine), $options: "i" };
  if (rating) filter.rating = parseOp(String(rating));
  if (total_time) filter.total_time = parseOp(String(total_time));
  if (calories) filter["nutrients.caloriesNumber"] = parseOp(String(calories)); // numeric

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 50);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Recipe.find(filter).sort({ rating: -1 }).skip(skip).limit(limit),
    Recipe.countDocuments(filter)
  ]);

  res.json({ page, limit, total, data });
};
