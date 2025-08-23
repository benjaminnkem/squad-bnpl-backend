export const formatNaira = (amount: string | number) => {
  const value = parseFloat(amount as string);
  return value.toLocaleString('en-NG', {
    currency: 'NGN',
    style: 'currency',
  });
};
