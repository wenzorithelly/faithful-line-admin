export const applyMask = (mask: string, digits: string) => {
  let formatted = '';
  let digitIndex = 0;

  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === '9') {
      if (digitIndex < digits.length) {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        break;
      }
    } else {
      formatted += mask[i];
    }
  }

  return formatted;
};

export const countDigits = (mask: string) => {
  return mask.split('').filter(char => char === '9').length;
};

