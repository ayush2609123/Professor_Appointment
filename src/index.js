
import dotenv from "dotenv" ;
dotenv.config ({
  path: '../env'
})
import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    console.log("MongoDB connected!");

    const PORT = process.env.PORT || 8001;
    app.listen(PORT, () => {
      console.log(`Server is running at: ${PORT}`);
    });

    app.on("error", (error) => {
      console.error("Server Error:", error);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed!", err);
    process.exit(1);
  });
