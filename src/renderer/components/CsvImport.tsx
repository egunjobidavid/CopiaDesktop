import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CsvImportProps {
  title: string;
  templateHeaders: string[];
  requiredFields: string[];
  onImport: (items: any[]) => Promise<{ created: number; errors: { index: number; message: string }[] }>;
  onClose: () => void;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

export function CsvImport({ title, templateHeaders, requiredFields, onImport, onClose }: CsvImportProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: { index: number; message: string }[] } | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) { toast.error('CSV must have a header row and at least one data row'); return; }
      const parsedHeaders = parseCsvLine(lines[0]);
      const parsedRows = lines.slice(1).map((line) => parseCsvLine(line));
      setHeaders(parsedHeaders);
      setCsvData(parsedRows);
      setStep('preview');
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csv = templateHeaders.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const items = csvData.map((row) => {
        const obj: any = {};
        headers.forEach((h, i) => { obj[h] = row[i] || ''; });
        return obj;
      });
      const res = await onImport(items);
      setResult(res);
      setStep('done');
      if (res.errors.length === 0) {
        toast.success(`Successfully imported ${res.created} ${title.toLowerCase()}`);
      } else {
        toast.success(`Imported ${res.created} ${title.toLowerCase()} with ${res.errors.length} errors`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const missingRequired = csvData.some((row) =>
    requiredFields.some((f) => {
      const idx = headers.indexOf(f);
      return idx === -1 || !row[idx];
    })
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title} Import</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        {step === 'upload' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload a CSV file to import {title.toLowerCase()} in bulk. Required fields: <span className="font-medium text-red-600">{requiredFields.join(', ')}</span>
            </p>
            <button onClick={downloadTemplate} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              <FileSpreadsheet className="w-4 h-4" /> Download CSV template
            </button>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Click to select a CSV file</p>
              <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Preview: <span className="font-medium">{csvData.length}</span> rows found
                {missingRequired && <span className="text-red-600 ml-2">(some required fields are empty)</span>}
              </p>
              <button onClick={() => { setStep('upload'); setCsvData([]); setHeaders([]); }} className="text-sm text-blue-600 hover:underline">
                Choose different file
              </button>
            </div>
            <div className="overflow-x-auto border rounded-lg max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                    {headers.map((h) => (
                      <th key={h} className={`px-3 py-2 text-left text-xs font-medium ${requiredFields.includes(h) ? 'text-red-600' : 'text-gray-500'}`}>
                        {h} {requiredFields.includes(h) && '*'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {csvData.slice(0, 20).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 text-gray-700">{cell || <span className="text-gray-300">-</span>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {csvData.length > 20 && <p className="text-xs text-gray-400">Showing first 20 rows of {csvData.length}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button onClick={handleImport} disabled={importing || missingRequired} className="btn-primary flex items-center gap-2">
                {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</> : `Import ${csvData.length} Rows`}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium">{result.created} {title.toLowerCase()} imported successfully</p>
                {result.errors.length > 0 && (
                  <p className="text-sm text-red-600">{result.errors.length} rows failed</p>
                )}
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-700 py-1">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Row {e.index + 1}: {e.message}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={onClose} className="btn-primary">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
