import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

dotenv.config();
const app = express();
const server = http.createServer(app);

// boilerplate middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("../public"));
app.use(morgan("tiny"));

app.get("/", (req, res) => {
  return res.send("Hello JS Developer");
});

// app specific middlewares
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);

app.use((error, _, res, __) => {
  console.log("global handle", error);
  if (!error.statusCode) {
    error.statusCode = 500;
    error.success = false;
    error.data = null;
  }
  if (!error.message) {
    error.message = "something went wrong";
  }
  return res.status(error.statusCode).json(error);
});

app.all("*", (req, res) => {
  return res.status(404).json({ error: "Route not found!" });
});

export { server };
