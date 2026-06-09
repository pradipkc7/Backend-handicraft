import app from "./src/app";
import { PORT as SERVER_PORT } from "./src/config/constant";
import { connectToMongoDB } from "./src/database/mongodb";

connectToMongoDB()
  .then(() => {
    console.log("MongoDB connection established, starting server...");
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB, server not started.", error);
    process.exit(1); // Exit the process with an error code
  });

app.listen(SERVER_PORT, () => {
  console.log(`Server Running:${SERVER_PORT}`);
});
