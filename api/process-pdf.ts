import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import formidable from 'formidable';
import fs from 'fs';

// Since the client sends multipart/form-data, we need to disable Vercel's default body parser.
export const config = {
  api: {
    bodyParser: false,
  },
};

const fileToGenerativePart = (path: string, mimeType: string) => {
  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimeType,
    },
  };
};

// This schema is now used on the server-side.
const assetSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      assetId: { type: Type.STRING, description: 'รหัสทรัพย์สินของอุปกรณ์' },
      type: { type: Type.STRING, description: 'ประเภทของอุปกรณ์ เช่น PC, Monitor, Printer, Notebook' },
      model: { type: Type.STRING, description: 'ชื่อรุ่น, โมเดล, หรือยี่ห้อของอุปกรณ์' },
      serialNumber: { type: Type.STRING, description: 'Serial Number หรือ S/N ของอุปกรณ์' },
      location: { type: Type.STRING, description: 'สถานที่ตั้งของอุปกรณ์ เช่น กฟส. [ชื่อสาขา] หรือ กฟภ. [ชื่อสาขา]' },
    },
    required: ["assetId", "type", "model", "serialNumber", "location"],
  },
};

const prompt = `
  วิเคราะห์เอกสาร PDF ที่แนบมานี้ ซึ่งเป็นเอกสารเกี่ยวกับทรัพย์สิน
  หน้าที่ของคุณคือดึงข้อมูลของทรัพย์สินทุกชิ้นในเอกสารอย่างละเอียด
  สำหรับทรัพย์สินแต่ละชิ้น ให้ดึงข้อมูลต่อไปนี้:
  1.  รหัสทรัพย์สิน
  2.  ประเภทของทรัพย์สิน (เช่น PC, Monitor, Printer)
  3.  รุ่น, โมเดล, หรือยี่ห้อ
  4.  Serial Number (SN)
  5.  สถานที่ (มองหาคำว่า กฟส. หรือ กฟภ. แล้วตามด้วยชื่อสาขา)

  โปรดส่งคืนข้อมูลในรูปแบบ JSON array ตาม schema ที่กำหนด หากข้อมูลส่วนใดไม่พบ ให้ใช้ค่าเป็น null
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.API_KEY) {
    return res.status(500).json({ error: "API key not configured on the server." });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    
    const pdfFile = files.pdfFile?.[0];

    if (!pdfFile) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = fileToGenerativePart(pdfFile.filepath, pdfFile.mimetype || 'application/pdf');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: assetSchema,
      },
    });

    const parsedResponse = JSON.parse(response.text);
    
    // Clean up the temporary file
    fs.unlinkSync(pdfFile.filepath);
    
    res.status(200).json({ assets: Array.isArray(parsedResponse) ? parsedResponse : [] });

  } catch (error: any) {
    console.error('Error in process-pdf handler:', error);
    res.status(500).json({ error: `An internal server error occurred: ${error.message}` });
  }
}
