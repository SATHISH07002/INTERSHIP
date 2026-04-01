import crypto from "crypto";

export const generateVerificationId = () =>
  `IVS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

export const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

export const generateApprovalToken = () => crypto.randomBytes(18).toString("hex");
