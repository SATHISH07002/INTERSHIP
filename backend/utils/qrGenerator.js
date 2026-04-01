import QRCode from "qrcode";

const generateQrCode = async (value) => QRCode.toDataURL(value, { margin: 1, width: 180 });

export default generateQrCode;
