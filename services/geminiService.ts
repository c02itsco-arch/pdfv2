import type { Asset } from '../types';

export const extractAssetsFromPdf = async (file: File): Promise<Omit<Asset, 'id' | 'sourceFile'>[]> => {
  const formData = new FormData();
  // The key 'pdfFile' must match what the serverless function expects.
  formData.append('pdfFile', file);

  try {
    const response = await fetch('/api/process-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Server error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Response was not JSON, stick with the status text.
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.assets || [];

  } catch (error) {
    console.error(`Error uploading or processing file ${file.name}:`, error);
    // Re-throw a user-friendly error. The component will display this.
    throw new Error(`Failed to process ${file.name}. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
