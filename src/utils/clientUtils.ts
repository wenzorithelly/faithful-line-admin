// utils/clientUtils.ts
export interface UIClient {
  name: string;
  phone: string;
  entered_at: boolean;
  country: string;
}

export const filterClientsData = (data: UIClient[], query: string): UIClient[] => {
  const normalizeString = (str: string): string =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const normalizedQuery = normalizeString(query);

  if (normalizedQuery) {
    return data.filter((client) =>
      normalizeString(client.name).includes(normalizedQuery)
    );
  }
  return data;
};
