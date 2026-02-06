import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// explicitly load .env from backend folder
dotenv.config({ path: path.join(__dirname, ".env") });

import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

console.log("Loaded MONGODB_URI:", process.env.MONGODB_URI);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
