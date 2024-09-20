export enum ErrorMessage {
  // Auth

  INVALID_AUTH_TOKEN = "Token không hợp lệ",
  WRONG_EMAIL = "Địa chỉ email không tồn tại",
  WRONG_PASSWORD = "Mật khẩu không chính xác",
  USER_NOT_FOUND = "Người dùng không tồn tại",
  WRONG_EMAIL_OR_PASSWORD = "Email hoặc mật khẩu không chính xác",
  INVALID_OTP = "Mã OTP không hợp lệ",
  INVALID_RESET_PASSWORD_SESSION = "Phiên không tồn tại hoặc đã hết hiệu lực. Vui lòng thử lại sau",
  INVALID_IP_ADDRESS = "Địa chỉ IP không hợp lệ",
  FORBIDDEN = "Bạn không có quyền truy cập tài nguyên này",
  UNAUTHORIZED = "Vui lòng đăng nhập",

  // Product

  PRODUCT_NOT_FOUND = "Sản phẩm không tồn tại",
  PRODUCT_OPTION_NOT_FOUND = "Dòng sản phẩm không tồn tại",
  PRODUCT_SOLD_OUT = "Xin lỗi, sản phẩm hiện đang hết hàng",

  // Collection group

  COLLECTION_GROUP_NOT_FOUND = "Nhóm sản phẩm không tồn tại",
  COLLECTION_GROUP_REQUIRED = "Nhóm sản phẩm là bắt buộc",

  // Collection

  COLLECTION_NOT_FOUND = "Bộ sưu tập không tồn tại",

  // Order

  ORDER_NOT_FOUND = "Đơn hàng không tồn tại",

  // Payment

  CREATE_PAYMENT_TRANSACTION_FAILED = "Tạo phiên thanh toán thất bại",
}
