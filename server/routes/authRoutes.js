import express from "express";
import { failedLogin, login, signup } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/failedLogin", failedLogin);

export default router;
