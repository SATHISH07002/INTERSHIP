import express from "express";
import { applyToOffer, closeOffer, createOffer, getOffers } from "../controllers/offerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getOffers);
router.post("/", protect, allowRoles("company"), createOffer);
router.put("/:id/close", protect, allowRoles("company"), closeOffer);
router.post("/:id/apply", protect, allowRoles("student"), applyToOffer);

export default router;
