import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

dotenv.config();

// stable path calc
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, "../data/recipes.json");

// helpers
const toNumOrNull = (v) => {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
};

const caloriesNumber = (c) => {
  if (c == null) return null;
  const n = Number(String(c).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const normalize = (r) => ({
  cuisine: r?.cuisine ?? null,
  title: r?.title ?? null,
  rating: toNumOrNull(r?.rating),
  prep_time: toNumOrNull(r?.prep_time),
  cook_time: toNumOrNull(r?.cook_time),
  total_time: toNumOrNull(r?.total_time),
  description: r?.description ?? null,

  // map extra fields present in the JSON
  url: r?.URL ?? null,
  continent: r?.Contient ?? null, // JSON key is "Contient"
  country_state: r?.Country_State ?? null, // JSON key is "Country_State"
  ingredients: Array.isArray(r?.ingredients) ? r.ingredients : undefined,
  instructions: Array.isArray(r?.instructions) ? r.instructions : undefined,

  nutrients: {
    ...(r?.nutrients || {}),
    calories: r?.nutrients?.calories ?? null,
    caloriesNumber: caloriesNumber(r?.nutrients?.calories),
  },
  serves: r?.serves ?? null,
});

(async () => {
  console.log("[import] starting");
  console.log("[import] reading:", DATA_FILE);

  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing in .env");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected");

    const rawText = fs.readFileSync(DATA_FILE, "utf8");
    const raw = JSON.parse(rawText);

    // Accept array, {data: []}, OR object keyed by numbers (your file)
    let rows = [];
    if (Array.isArray(raw)) rows = raw;
    else if (raw && Array.isArray(raw.data)) rows = raw.data;
    else if (raw && typeof raw === "object") rows = Object.values(raw); //important JSON

    console.log(`[import] found ${rows.length} rows`);
    const docs = rows.map(normalize);

    await Recipe.deleteMany({});
    await Recipe.insertMany(docs, { ordered: false });
    console.log(`imported ${docs.length} recipes`);
  } catch (e) {
    console.error("import failed:", e.message);
  } finally {
    await mongoose.disconnect().catch(() => {});
    console.log("[import] done");
  }
})();
