const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const usersRoute = require("./routes/users");
const showsRoute = require("./routes/shows");
const loginRoute = require("./routes/login");
const reviewsRoute = require("./routes/reviews");
const reportsRoute = require("./routes/reports");
require("dotenv").config();
const path = require("path");

const PORT = 8081;
const app = express();

app.use("/showsuploads", express.static(path.join(__dirname, "showsuploads")));
app.use("/usersuploads", express.static(path.join(__dirname, "usersuploads")));

//MIDDLEWARES
app.use(cors());
app.use(express.json());

//ROUTES
app.use("/", usersRoute);
app.use("/", showsRoute);
app.use("/", loginRoute);
app.use("/", reviewsRoute);
app.use("/", reportsRoute);

mongoose.connect(
  "mongodb+srv://theroescode:6a9d0Ii16IXqNg87@happycluster.0r5fkx1.mongodb.net/TheatreVista",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error during db connection"));
db.once("open", () => {
  console.log("database successfully connected");
});
app.listen(PORT, () => console.log(`Server up and running on PORT: ${PORT}`));

// Installato bcrypt e jsonwebtoken --> npm i bcrypt jsonwebtoken
// Installato multer e cloudinary --> npm i multer multer-storage-cloudinary cloudinary
