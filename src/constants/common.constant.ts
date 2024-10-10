export const OTP_LENGTH = 6;
export const OTP_TTL = 15 * 60 * 1000;
export const VNPAY_FASHION_PRODUCT_TYPE = 200000;
export const TOKEN_TYPE = "Bearer";
export const CHAT_ADMIN_ROOM_ID = "admin";
export const NOT_DELETED_FILTER = {
    $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
};
