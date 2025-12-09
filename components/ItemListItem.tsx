import { ProductRecord } from "@/common/search-api.types";
import { formatDate, formatPrice, getConditionLabel } from "@/lib/formatter";
import React, { useState } from "react";
import { Dialog } from "./ui/dialog";
import Image from "next/image";

// Helper component for JSON modal
const JsonModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ProductRecord;
}> = ({ open, onOpenChange, data }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {open && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ pointerEvents: "auto" }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-gray-800 opacity-60"
          style={{ pointerEvents: "auto" }}
          onClick={() => onOpenChange(false)}
          aria-label="Close modal overlay"
        />
        {/* Modal Content */}
        <div
          className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full p-6"
          style={{ top: 0, left: 0, transform: "none", pointerEvents: "auto" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Item JSON</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-500 hover:text-gray-800 text-xl"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          <pre className="overflow-auto max-h-[60vh] text-xs bg-gray-100 p-3 rounded border border-gray-200 select-text">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    )}
  </Dialog>
);

/**
 * Props for the <li> component
 */
export interface ItemListItemProps {
  item: ProductRecord;
  ctaPath: string;
  tvDisplayWord: string;
}

const ItemListItem: React.FC<ItemListItemProps> = ({
  item,
  ctaPath,
  tvDisplayWord,
}) => {
  console.log("ctaPath: ", ctaPath);
  console.log("tvDisplayWord: ", tvDisplayWord);
  // Destructure for easier access
  const { item_info, sell_info, flow_purchase, offer_info } = item;

  // --- Prepare dynamic values ---
  const conditionLabel = getConditionLabel(item_info?.fixed_condition || "--");

  const altText =
    item_info?.item_attrs && Array.isArray(item_info.item_attrs)
      ? item_info.item_attrs.map((attr) => attr.value).join(" ")
      : "";

  const imageUrl =
    item_info?.item_image_upload && Array.isArray(item_info?.item_image_upload)
      ? `${item_info.item_image_upload[0]}?width=204&height=153&type=resize`
      : undefined;

  const formattedPrice = formatPrice(sell_info?.purchase_price || 0);

  const formattedDate = formatDate(flow_purchase || "");

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <li className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="h-full flex flex-col justify-between">
        {/* Horizontal layout: Image on left, content on right */}
        <div className="flex p-4 gap-4">
          {/* Image Block - Left Side */}
          <div className="shrink-0">
            <img
              width="148"
              height="148"
              src={imageUrl || "https://placehold.co/148x148"}
              alt={altText}
              className="w-[148px] h-[148px] object-contain"
              loading="lazy"
            />
          </div>

          {/* Text Block - Right Side */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Product Name */}
            <p className="text-sm text-gray-800 font-bold leading-snug mb-2 wrap-anywhere">
              {altText}
            </p>

            {/* Condition Label */}
            <div className="mb-2">
              <span className="inline-block bg-yellow-400 text-gray-800 text-[14px] font-bold rounded-full py-[3px] px-[19px]">
                {conditionLabel}
              </span>
            </div>

            {/* Price */}
            <p className="text-[28px] font-black text-[#D50000] mb-1 ">
              ¥{formattedPrice}
            </p>

            {/* Date and Location */}
            <p className="text-xs text-gray-600">
              <span>{formattedDate}</span>  
              <span className="hidden md:inline">&nbsp;</span>
              <br className="md:hidden" />
              <span>{offer_info?.pref}で買取</span>
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="px-4 pb-4">
          <button
            className="bg-[#1DBE00] hover:opacity-70 transition-colors duration-200 rounded-md py-3 text-center font-normal w-full cursor-pointer"
            onClick={() => setModalOpen(true)}
            type="button"
          >
            <span className="text-white font-medium text-sm">
              買取価格を調べる ({item_info?.item_id}) ({item?.item_info?.score})
            </span>
          </button>
        </div>
      </div>

      <JsonModal open={modalOpen} onOpenChange={setModalOpen} data={item} />
    </li>
  );
};

export default ItemListItem;
