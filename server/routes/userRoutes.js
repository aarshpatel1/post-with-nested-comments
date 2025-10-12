import express from "express";
import { allUsers } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/allUsers", auth, allUsers);

export default router;
