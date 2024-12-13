const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // Corrected typo
const app = express();
const PORT = process.env.PORT || 3500;
const connectDB = require("./config/dbConfig");

require("dotenv").config();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/register", require("./routers/regestier"));
app.use("/login", require("./routers/login"));
app.use("/lists", require("./routers/lists"));
app.use("/items", require("./routers/items"));
app.use("/categories", require("./routers/categories"));
app.use("/reviews", require("./routers/reviews"));
app.use("/reviewsUser", require("./routers/reviewsUser"));
app.use("/chat", require("./routers/chat"));
app.use("/notification", require("./routers/notification"));



mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});



