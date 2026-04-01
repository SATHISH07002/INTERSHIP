import express from "express";
import {
  editAndResubmitInternship,
  getInternships,
  getPendingApprovals,
  submitInternship,
  updateStatus
} from "../controllers/internshipController.js";
import { getInternshipDocuments, uploadInternshipDocument } from "../controllers/documentController.js";
import { createWorkLog, getWorkLogs, reviewWorkLog } from "../controllers/workLogController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getInternships);
router.get("/pending", allowRoles("college", "company"), getPendingApprovals);
router.post("/", allowRoles("student"), upload.single("report"), submitInternship);
router.get("/:id/documents", getInternshipDocuments);
router.post("/:id/documents", allowRoles("student", "mentor", "company", "admin"), upload.single("file"), uploadInternshipDocument);
router.get("/:id/logs", getWorkLogs);
router.post("/:id/logs", allowRoles("student"), upload.single("proof"), createWorkLog);
router.put("/logs/:logId/review", allowRoles("mentor", "company", "college", "admin"), reviewWorkLog);
router.put("/:id/resubmit", allowRoles("student"), upload.single("report"), editAndResubmitInternship);
router.put("/:id/status", allowRoles("college", "company"), updateStatus);

export default router;
