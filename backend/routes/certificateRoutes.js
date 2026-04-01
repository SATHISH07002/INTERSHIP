import express from "express";
import { verifyCertificate } from "../controllers/certificateController.js";

const router = express.Router();

router.get("/verify/:id", verifyCertificate);

export default router;
