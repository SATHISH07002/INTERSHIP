const randomBlock = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export const generateCertificateId = () => `CERT-${randomBlock()}-${Date.now().toString().slice(-6)}`;
export const generateVerificationId = () => `${randomBlock()}${randomBlock()}`;
