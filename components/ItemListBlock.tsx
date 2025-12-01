import React from "react";
import ItemListItem from "./ItemListItem";
import { ProductRecord } from "@/common/search-api.types";

export interface ItemListBlockProps {
  items: ProductRecord[];
  ctaPath: string;
  tvDisplayWord: string;
}

const ItemListBlock: React.FC<ItemListBlockProps> = ({
  items,
  ctaPath,
  tvDisplayWord,
}) => {
  return (
    <>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-[#FFF6DD] rounded-[10px] p-10 border-4 border-[#FFD357] max-w-[880px] mx-auto">
        {/* Use .map() to loop and render the ItemListItem component */}
        {items.map((item) => (
          <ItemListItem
            // React requires a unique key for lists.
            // Using the image URL as it's likely unique per item.
            key={
              item?.item_info?.item_id ||
              Math.random().toString(36).substr(2, 9)
            }
            item={item}
            ctaPath={ctaPath}
            tvDisplayWord={tvDisplayWord}
          />
        ))}
      </ul>
    </>
  );
};

export default ItemListBlock;
