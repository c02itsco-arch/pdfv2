
import React, { useState, useMemo, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ResultsTable from './components/ResultsTable';
import AssetChart from './components/AssetChart';
import { extractAssetsFromPdf } from './services/geminiService';
import type { Asset, SortConfig, SortableAssetKeys } from './types';
import { ShieldCheck, Database, BarChart2 } from 'lucide-react';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'assetId', direction: 'ascending' });

  const handleFilesSelect = async (files: File[]) => {
    setIsProcessing(true);
    setError(null);
    setAssets([]); // Clear previous results

    try {
      const results = await Promise.all(
        files.map(async file => {
          try {
            const extracted = await extractAssetsFromPdf(file);
            return extracted.map(asset => ({
              ...asset,
              id: `${file.name}-${asset.assetId || Math.random()}`,
              sourceFile: file.name
            }));
          } catch (e) {
            console.error(`Error in file ${file.name}:`, e);
            return [];
          }
        })
      );
      
      const allAssets = results.flat();
      setAssets(allAssets);
      if (allAssets.length === 0) {
        setError("ไม่พบข้อมูลทรัพย์สินในไฟล์ที่อัปโหลด หรือประมวลผลไฟล์ไม่ได้");
      }

    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
    } finally {
      setIsProcessing(false);
    }
  };

  const sortedAssets = useMemo(() => {
    let sortableAssets = [...assets];
    if (sortConfig !== null) {
      sortableAssets.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableAssets;
  }, [assets, sortConfig]);

  const handleSort = useCallback((key: SortableAssetKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);
  

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Property Asset Analyzer</h1>
        </div>
      </header>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 px-4 sm:px-0">
            <FileUpload onFilesSelect={handleFilesSelect} isProcessing={isProcessing} />
          </div>

          <div className="lg:col-span-2 space-y-8 px-4 sm:px-0">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">เกิดข้อผิดพลาด</p>
                <p>{error}</p>
              </div>
            )}

            {isProcessing && (
              <div className="text-center p-10 bg-white rounded-2xl shadow-lg border border-slate-200">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-lg font-semibold text-slate-700">กำลังใช้ AI วิเคราะห์เอกสารของคุณ...</p>
                  <p className="text-slate-500">กรุณารอสักครู่ ระบบกำลังดึงข้อมูล</p>
              </div>
            )}
            
            {!isProcessing && assets.length === 0 && !error && (
              <div className="text-center p-10 bg-white rounded-2xl shadow-lg border border-slate-200">
                <BarChart2 className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-lg font-medium text-slate-800">เริ่มต้นการวิเคราะห์</h3>
                <p className="mt-1 text-sm text-slate-500">
                  อัปโหลดไฟล์ PDF ของคุณเพื่อดูข้อมูลและแผนภูมิสรุปผลที่นี่
                </p>
              </div>
            )}

            {!isProcessing && assets.length > 0 && (
              <>
                <AssetChart assets={assets} />
                <ResultsTable assets={sortedAssets} sortConfig={sortConfig} onSort={handleSort} />
              </>
            )}

          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-slate-500">
        <p>Powered by Google Gemini API. Developed for Asset Management.</p>
      </footer>
    </div>
  );
};

export default App;
