
import React from 'react';
import { Asset, SortConfig, SortableAssetKeys } from '../types';
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';

interface ResultsTableProps {
  assets: Asset[];
  sortConfig: SortConfig | null;
  onSort: (key: SortableAssetKeys) => void;
}

const columnHeaders: { key: SortableAssetKeys; label: string }[] = [
  { key: 'assetId', label: 'รหัสทรัพย์สิน' },
  { key: 'type', label: 'ประเภท' },
  { key: 'model', label: 'รุ่น / โมเดล / ยี่ห้อ' },
  { key: 'serialNumber', label: 'Serial Number' },
  { key: 'location', label: 'สถานที่' },
];

const SortIcon = ({ sortConfig, columnKey }: { sortConfig: SortConfig | null, columnKey: SortableAssetKeys }) => {
  if (!sortConfig || sortConfig.key !== columnKey) {
    return <ChevronsUpDown className="w-4 h-4 ml-2 opacity-30" />;
  }
  if (sortConfig.direction === 'ascending') {
    return <ChevronUp className="w-4 h-4 ml-2" />;
  }
  return <ChevronDown className="w-4 h-4 ml-2" />;
};

const ResultsTable: React.FC<ResultsTableProps> = ({ assets, sortConfig, onSort }) => {
  if (assets.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 w-full overflow-x-auto">
      <h2 className="text-xl font-semibold text-slate-700 mb-4">ผลการวิเคราะห์</h2>
      <div className="overflow-y-auto max-h-[500px]">
        <table className="w-full min-w-[700px] text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0">
            <tr>
              {columnHeaders.map(({ key, label }) => (
                <th key={key} scope="col" className="px-6 py-3">
                  <button className="flex items-center" onClick={() => onSort(key)}>
                    {label}
                    <SortIcon sortConfig={sortConfig} columnKey={key} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{asset.assetId || '-'}</td>
                <td className="px-6 py-4">{asset.type || '-'}</td>
                <td className="px-6 py-4">{asset.model || '-'}</td>
                <td className="px-6 py-4">{asset.serialNumber || '-'}</td>
                <td className="px-6 py-4">{asset.location || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
