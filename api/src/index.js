import dotenv from "dotenv";
import colors from "colors";
import app from "./app.js";
import connectDB from "./db/db.js";
dotenv.config({
  path: "./.env",
});
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `⚙️ Server is running at port : ${process.env.PORT}`.bgYellow.white
      );
    });
  })
  .catch((err) => {
    console.log("Mongo DB connection failed !!!", err);
  });
