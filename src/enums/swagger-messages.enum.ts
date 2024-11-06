export enum UserMessages {
  GET_AUTH_USER_SUCCESS = "Successfully retrieved authenticated user.",
  UPDATE_USER_SUCCESS = "Successfully updated user.",
  GET_ACCESS_HISTORY_SUCCESS = "Successfully retrieved access history.",
}

export enum ProductMessages {
  GET_PRODUCT_SUCCESS = "Successfully retrieved product.",
  CREATE_PRODUCT_SUCCESS = "Successfully created product.",
  UPDATE_PRODUCT_SUCCESS = "Successfully updated product.",
  DELETE_PRODUCT_SUCCESS = "Successfully deleted product.",
  PRODUCT_ID = "Product id.",
}

export enum OrderMessages {
  CREATE_ORDER_SUCCESS = "Successfully created order.",
  UPDATE_ORDER_SUCCESS = "Successfully updated order.",
  REQUEST_CANCEL_ORDER_SUCCESS = "Successfully to request cancel order.",
  CANCEL_ORDER_SUCCESS = "Successfully cancelled order.",
  GET_ORDER_SUCCESS = "Successfully retrieved order.",
  ORDER_ID = "Order id",
  USER_ORDERS = "User orders",
}

export enum CollectionGroupMessages {
  CREATE_GROUP_SUCCESS = "Successfully created collection group.",
  UPDATE_GROUP_SUCCESS = "Successfully updated collection group.",
  DELETE_GROUP_SUCCESS = "Successfully deleted collection group.",
  GET_GROUP_SUCCESS = "Successfully retrieved collection group.",
}

export enum CollectionMessages {
  CREATE_COLLECTION_SUCCESS = "Successfully created collection.",
  UPDATE_COLLECTION_SUCCESS = "Successfully updated collection.",
  DELETE_COLLECTION_SUCCESS = "Successfully deleted collection.",
  GET_COLLECTION_SUCCESS = "Successfully retrieved collection.",
  COLLECTION_ID = "Collection id",
  INCLUDE_FILTER = "Include filter",
}

export enum CategoryMessages {
  GET_CATEGORIES_SUCCESS = "Successfully retrieved categories.",
  DELETE_CATEGORIES_SUCCESS = "Successfully deleted categories.",
  UPDATE_CATEGORIES_SUCCESS = "Successfully updated categories.",
  CREATE_CATEGORY_SUCCESS = "Successfully created category.",
}

export enum CartMessages {
  ADD_CART_ITEM_SUCCESS = "Successfully added item to cart.",
  GET_USER_CART_SUCCESS = "Successfully retrieved user cart.",
}

export enum AuthMessages {
  SIGN_IN_SUCCESS = "Successfully signed in.",
  SIGN_UP_SUCCESS = "Successfully signed up.",
  SIGN_OUT_SUCCESS = "Successfully signed out.",
  REFRESH_TOKEN_SUCCESS = "Successfully refreshed token.",
  FORGOT_PASSWORD_SUCCESS = "Successfully sent forgot password email.",
  RESET_PASSWORD_SUCCESS = "Successfully reset password.",
  AUTH_TOKEN = "JWT Authorization token with any role",
  AUTH_ADMIN_TOKEN = "JWT Authorization token with admin role",
  AUTH_CUSTOMER_TOKEN = "JWT Authorization token with customer role",
}

export enum RatingMessages {
  GET_RATINGS_SUCCESS = "Successfully retrieved ratings.",
  PRODUCT_NOT_FOUND = "Product not found.",
  RATABLE = "Ratable",
}

export enum PaginationMessaqes {
  PAGE = "Current page",
  LIMIT = "Item limit",
}
