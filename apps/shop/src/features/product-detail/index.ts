export { fetchProductDetail, productDetailKeys, productPath } from "./api";
export {
  addCartItem,
  CART_STORAGE_KEY,
  cartQuantity,
  cartTotal,
  MAX_ITEM_QUANTITY,
  readCart,
  writeCart,
  type CartItem,
} from "./cart";
export { ProductDetailPage } from "./components/product-detail-page";
export { ProductDetailView } from "./components/product-detail-view";
export { ProductDetailSkeleton } from "./components/product-detail-skeleton";
export {
  availabilityLabel,
  clampQuantity,
  discountPercent,
  findVariant,
  firstAvailableVariant,
  optionAvailability,
  pickOption,
  productJsonLd,
  serializeJsonLd,
  selectionOf,
  stockNote,
  variantLabel,
  type VariantSelection,
} from "./detail";
