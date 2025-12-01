export type ItemAttribute = Partial<{
  label: string;
  value: string;
}>;

export type ItemInfo = {
  item_id: string;
  title: string;
  category?: string;
  fixed_condition?: string;
  item_image_upload?: string[];
  item_attrs?: ItemAttribute[];
  score?: number;
};

export type SellInfo = Partial<{
  purchase_price?: number;
  sell_price?: number;
  sold_price?: number;
  temp_profit_amount?: number;
}>;

export type OfferInfo = Partial<{
  pref: string;
  address: string;
  sex: string;
  age_group: number;
  flow_dispatched: string;
  exit_service: string[];
  sold_exit_service: string;
  business_domain: string;
  offer_type: string;
  window: string;
  sale_count: number;
}>;

export type ProductRecord = Partial<{
  item_info: ItemInfo;
  sell_info: SellInfo;
  offer_info: OfferInfo;
  flow_purchase: string;
}>;
