import mongoose from "mongoose";

/* Builds the MongoDB connection string.
   - In production you can set a single MONGODB_URI and it wins.
   - Otherwise we assemble it from parts, URL-encoding the password so
     special characters can never break the connection string. */
export function buildMongoUri() {
  const { MONGODB_URI, DB_USER, DB_PASSWORD, DB_HOST, DB_HOSTS, DB_NAME, DB_REPLICA_SET } =
    process.env;

  if (MONGODB_URI) return MONGODB_URI;

  if (!DB_USER || !DB_PASSWORD || !DB_NAME) return null;
  const pw = encodeURIComponent(DB_PASSWORD);

  // Direct (non-SRV) connection — used when DB_HOSTS is provided. Skips the DNS
  // SRV lookup that some networks refuse (querySrv ECONNREFUSED).
  if (DB_HOSTS && DB_REPLICA_SET) {
    return `mongodb://${DB_USER}:${pw}@${DB_HOSTS}/${DB_NAME}?ssl=true&replicaSet=${DB_REPLICA_SET}&authSource=admin&retryWrites=true&w=majority`;
  }

  // Standard SRV connection (default)
  if (!DB_HOST) return null;
  return `mongodb+srv://${DB_USER}:${pw}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;
}

export async function connectDB(retries = 5, delayMs = 3000) {
  const uri = buildMongoUri();
  if (!uri) {
    throw new Error(
      "Missing database config. Set DB_USER, DB_PASSWORD, DB_HOST, DB_NAME (or MONGODB_URI) in server/.env"
    );
  }

  // Retry a few times so a transient network blip doesn't kill startup.
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`… DB connect attempt ${attempt}/${retries} failed (${err.message}). Retrying in ${delayMs / 1000}s…`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}
