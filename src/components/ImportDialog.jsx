import { useState } from 'react';
import Papa from 'papaparse';
import { addNode } from '../lib/graph.js';
import { calculateLeverageScore } from '../lib/scoring.js';

export default function ImportDialog({ onClose, onImportComplete }) {
  const [csvText, setCsvText] = useState('');
  const [mapping, setMapping] = useState({});
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState('');

  // Auto-detect industry from job title
  function detectIndustry(role, company) {
    const text = `${role} ${company}`.toLowerCase();
    const industries = {
      tech: ['developer', 'engineer', 'software', 'tech', 'programmer', 'it'],
      finance: ['finance', 'bank', 'investment', 'trading', 'analyst', 'wealth'],
      ecommerce: ['ecommerce', 'e-commerce', 'retail', 'shopify', 'amazon'],
      logistics: ['logistics', 'supply', 'shipping', 'warehouse', 'fulfillment'],
      consulting: ['consultant', 'consulting', 'advisor', 'advisory'],
    };

    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return industry;
      }
    }
    return '';
  }

  const handleParse = () => {
    if (!csvText.trim()) {
      setStatus('Please paste CSV data');
      return;
    }

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setStatus(`Parse errors: ${results.errors.map(e => e.message).join(', ')}`);
          return;
        }

        const data = results.data;
        if (data.length === 0) {
          setStatus('No data found in CSV');
          return;
        }

        // Auto-detect column mapping
        const headers = Object.keys(data[0]);
        const autoMapping = {
          name: headers.find(h => /name|full.name|person/i.test(h)) || headers[0],
          email: headers.find(h => /email/i.test(h)) || '',
          phone: headers.find(h => /phone|mobile|tel/i.test(h)) || '',
          role: headers.find(h => /role|title|position|job/i.test(h)) || '',
          company: headers.find(h => /company|organization|org/i.test(h)) || '',
          location: headers.find(h => /location|city|address/i.test(h)) || '',
          linkedin: headers.find(h => /linkedin/i.test(h)) || '',
        };

        setMapping(autoMapping);
        setPreview(data.slice(0, 5)); // Preview first 5 rows
        setStatus(`Found ${data.length} rows. Preview below.`);
      },
      error: (error) => {
        setStatus(`Parse error: ${error.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      setStatus('Please paste CSV data first');
      return;
    }

    setImporting(true);
    setStatus('Importing...');

    try {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const data = results.data;
          let imported = 0;
          let errors = 0;

          for (const row of data) {
            try {
              const name = row[mapping.name] || '';
              if (!name.trim()) {
                errors++;
                continue;
              }

              const role = row[mapping.role] || '';
              const company = row[mapping.company] || '';
              const industry = detectIndustry(role, company);

              const nodeData = {
                type: 'person',
                name: name.trim(),
                email: (row[mapping.email] || '').trim(),
                phone: (row[mapping.phone] || '').trim(),
                location: (row[mapping.location] || '').trim(),
                social: {
                  linkedin: (row[mapping.linkedin] || '').trim(),
                  x: '',
                  instagram: '',
                  whatsapp: '',
                },
                occupation: {
                  role: role.trim(),
                  company: company.trim(),
                  industry: industry,
                },
                skills: [],
                scores: {
                  capitalAccess: 0,
                  skillValue: 0,
                  networkReach: 0,
                  reliability: 0,
                  speed: 0,
                  alignment: 0,
                },
                leverageScore: 0,
                notes: [],
                lastInteraction: null,
              };

              await addNode(nodeData);
              imported++;
            } catch (error) {
              console.error('Error importing row:', error);
              errors++;
            }
          }

          setStatus(`Imported ${imported} nodes. ${errors} errors.`);
          if (onImportComplete) {
            onImportComplete(imported);
          }
          setImporting(false);
        },
        error: (error) => {
          setStatus(`Import error: ${error.message}`);
          setImporting(false);
        },
      });
    } catch (error) {
      setStatus(`Import error: ${error.message}`);
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white">BULK ASSET IMPORT</h2>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Convert CSV to Graph Nodes</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Paste CSV data (with headers)
            </label>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="name,email,phone,role,company,location,linkedin&#10;John Doe,john@example.com,123-456-7890,Developer,Tech Corp,San Francisco,linkedin.com/in/johndoe"
              className="w-full h-40 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleParse}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Parse & Preview
            </button>
            <button
              onClick={handleImport}
              disabled={importing || preview.length === 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>

          {Object.keys(mapping).length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Column Mapping</h3>
              <div className="space-y-1 text-sm">
                {Object.entries(mapping).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-400">{key}:</span>
                    <span className="text-white">{value || '(not mapped)'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {preview.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Preview (first 5 rows)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-700">
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} className="px-2 py-1 text-left">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-gray-700">
                        {Object.values(row).map((value, j) => (
                          <td key={j} className="px-2 py-1 text-gray-300">
                            {String(value).substring(0, 30)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {status && (
            <div className={`p-3 rounded ${status.includes('error') || status.includes('Error') ? 'bg-red-900' : 'bg-gray-700'}`}>
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

