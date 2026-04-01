import express from "express";
import { getProfile, loginUser, registerUser, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getProfile);
router.put("/profile", protect, upload.single("profileImage"), updateProfile);

export default router;
