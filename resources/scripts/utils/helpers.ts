/**
 * Generate random string base on defined length
 * @param {number} length
 * @returns {string}
 */
export const makeRandomString = (length: number): string => {
  return Math.random().toString(36).substring(2, length);
};

/**
 * Transform variable from snake case to camel case
 * @param {string} str
 * @returns {string}
 */
export const snakeToCamel = (str: string): string => {
  const terms = str.trim().split('_');
  // transfrom all terms from [1,n] into capitalize
  const transformedTerms = terms.map((term: string, index) => {
    if (index === 0) {
      return term;
    }
    const firstChar = term.charAt(0).toUpperCase();
    const theRestChars = term.substring(1);
    return `${firstChar}${theRestChars}`;
  });
  return transformedTerms.join('');
};
