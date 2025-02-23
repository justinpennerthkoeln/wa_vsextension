export const buildDateFromString = (dateString: string): string => {
  //2025-02-23T14:02:44 -> 23.02.2025 - 14:02
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
  return `${day}.${month}.${year} - ${hours}:${minutes}`;
};