import express from "express";
import {
  getPublicVerification,
  getVerificationInbox,
  sendCompanyApprovalLink,
  sendMentorOtp,
  verifyCompanyApproval,
  verifyMentorOtp
} from "../controllers/verificationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/public/:verificationId", getPublicVerification);

router.use(protect);
router.get("/inbox", allowRoles("mentor", "company", "admin"), getVerificationInbox);
router.post("/:id/mentor/send-otp", allowRoles("student"), sendMentorOtp);
router.post("/:id/mentor/verify", verifyMentorOtp);
router.post("/:id/company/send-link", allowRoles("student"), sendCompanyApprovalLink);
router.post("/:id/company/verify", verifyCompanyApproval);

export default router;
