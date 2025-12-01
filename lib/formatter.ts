/**
 * Gets the Japanese label for an item's condition.
 */
export const getConditionLabel = (condition: string): string => {
  switch (condition) {
    case 'n': return '新品';
    case 's': return '未使用品';
    case 'a': return '美品';
    case 'b': return '程度良好';
    case 'c': return '一般中古';
    case 'd': return '程度不良';
    case 'j': return 'ジャンク';
    case 'v': return 'アンティーク';
    default: return '';
  }
};

/**
 * Formats a number as Japanese currency (replaces number_format).
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ja-JP').format(price);
};

/**
 * Formats a date string to 'YYYY/M/D' (replaces date/strtotime).
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  // Using 'ja-JP' locale with numeric representation gives the YYYY/M/D format.
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
};
