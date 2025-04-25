import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config();



connectDB()
.then(
    app.listen(process.env.PORT || 5001, () => {
        console.log("Server running on port 5001");
    })
)
.catch(
    (error) => console.error("Error connecting to MongoDB", error)
)