import express from "express";
import {
  decideInternship,
  getAdminInternships,
  getAdminUsers,
  updateCompanyDomains
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("admin"));
router.get("/internships", getAdminInternships);
router.post("/internships/:id/decision", decideInternship);
router.get("/users", getAdminUsers);
router.put("/companies/:id/domains", updateCompanyDomains);

export default router;
