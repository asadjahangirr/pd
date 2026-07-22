import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import Product from "./models/Product.js";
import Category from "./models/Category.js";
import { products, categories } from "./data/products.js";

/* Loads the 9 products into MongoDB.
   Safe to re-run: it clears the collection first, then inserts fresh. */
async function seed() {
  try {
    await connectDB();
    console.log("✓ Connected to MongoDB");

    await Product.deleteMany({});
    console.log("✓ Cleared existing products");

    const docs = products.map((p, i) => ({
      slug: p.id, // the URL id becomes the stored slug
      name: p.name,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice ?? null,
      badge: p.badge ?? null,
      stock: p.stock ?? 0,
      image: p.image,
      short: p.short,
      description: p.description,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      reviews: p.reviews ?? [],
      order: i, // keep the original display order
    }));

    await Product.insertMany(docs);
    console.log(`✓ Seeded ${docs.length} products`);

    // Categories: add any missing defaults without wiping admin's edits.
    for (let i = 0; i < categories.length; i++) {
      await Category.updateOne(
        { name: categories[i] },
        { $setOnInsert: { name: categories[i], visible: true, order: i } },
        { upsert: true }
      );
    }
    console.log(`✓ Ensured ${categories.length} default categories`);
  } catch (err) {
    console.error("✗ Seed error:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("✓ Disconnected");
  }
}

seed();
