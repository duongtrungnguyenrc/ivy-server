declare namespace Vnp {
  declare type TransactionRefundType = "02" | "03";

  // Define a base type with common fields
  declare type BaseParams = {
    vnp_Version: string;
    vnp_Command: string;
    vnp_TmnCode: string;
    vnp_TxnRef: string;
    vnp_Amount: number;
    vnp_OrderInfo: string;
    vnp_CreateDate: string;
    vnp_IpAddr: string;
    vnp_SecureHash: string;
  };

  declare type PayParams = BaseParams & {
    vnp_Locale: string;
    vnp_CurrCode: string;
    vnp_OrderType: string | number;
    vnp_ReturnUrl: string;
  };

  declare type RefundParams = BaseParams & {
    vnp_RequestId: string;
    vnp_TransactionType: TransactionRefundType;
    vnp_TransactionNo: string;
    vnp_CreateBy: string;
    vnp_TransactionDate: string;
  };

  declare type CallbackParams = {
    vnp_Amount: number;
    vnp_BankCode: string;
    vnp_BankTranNo: string;
    vnp_CardType: string;
    vnp_OrderInfo: string;
    vnp_PayDate: string;
    vnp_ResponseCode: string;
    vnp_TmnCode: string;
    vnp_TransactionNo: string;
    vnp_TransactionStatus: string;
    vnp_TxnRef: string;
    vnp_SecureHash: string;
  };
}
