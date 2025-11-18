
export interface Asset {
  id: string;
  assetId: string | null;
  type: string | null;
  model: string | null;
  serialNumber: string | null;
  location: string | null;
  sourceFile: string;
}

export type SortableAssetKeys = Exclude<keyof Asset, 'id' | 'sourceFile'>;

export interface SortConfig {
  key: SortableAssetKeys;
  direction: 'ascending' | 'descending';
}
