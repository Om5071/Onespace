import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { documentApi } from '../../api/documentApi';
import { ZoomIn, ZoomOut, RotateCcw, Download, FileText, ExternalLink } from 'lucide-react';

export const PdfViewerModal = ({ doc, isOpen, onClose }) => {
  const [zoom, setZoom] = useState(100);

  if (!isOpen || !doc) return null;

  const fileUrl = documentApi.viewUrl(doc._id);
  const downloadUrl = documentApi.downloadUrl(doc._id);
  const isPdf = (doc.mimeType || doc.fileType || doc.originalName || doc.fileName || '').toLowerCase().includes('pdf');
  const isImage = (doc.mimeType || doc.fileType || doc.originalName || doc.fileName || '').toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/) || (doc.mimeType || '').includes('image');

  const handleZoomIn = () => setZoom((prev) => Math.min(200, prev + 15));
  const handleZoomOut = () => setZoom((prev) => Math.max(50, prev - 15));
  const handleResetZoom = () => setZoom(100);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={doc.originalName || doc.fileName} maxWidth="max-w-5xl">
      <div className="flex flex-col h-[75vh]">
        {/* PDF / File Viewer Toolbar */}
        <div className="flex items-center justify-between p-3 bg-[#131D31] border border-slate-800 rounded-xl mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg bg-[#1A243B] text-slate-200 hover:bg-[#23304E] cursor-pointer text-xs transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-300 w-12 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg bg-[#1A243B] text-slate-200 hover:bg-[#23304E] cursor-pointer text-xs transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg bg-[#1A243B] text-slate-200 hover:bg-[#23304E] cursor-pointer text-xs transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1A243B] hover:bg-[#23304E] text-slate-200 text-xs font-semibold border border-slate-700/60"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
            </a>
            <a
              href={downloadUrl}
              download={doc.originalName || doc.fileName}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          </div>
        </div>

        {/* Viewer Content Frame */}
        <div className="flex-1 overflow-auto bg-[#0B0F19] rounded-xl flex items-center justify-center p-2 border border-slate-800 relative">
          {isPdf ? (
            <div
              className="w-full h-full transition-transform duration-200 origin-top flex flex-col"
              style={{ transform: zoom !== 100 ? `scale(${zoom / 100})` : 'none' }}
            >
              <object
                data={`${fileUrl}#toolbar=1&navpanes=0`}
                type="application/pdf"
                className="w-full h-full min-h-[60vh] rounded-lg bg-white"
              >
                <iframe
                  src={`${fileUrl}#zoom=${zoom}`}
                  title={doc.originalName || doc.fileName}
                  className="w-full h-full min-h-[60vh] rounded-lg border-0 bg-white"
                />
              </object>
            </div>
          ) : isImage ? (
            <img
              src={fileUrl}
              alt={doc.originalName || doc.fileName}
              style={{ transform: `scale(${zoom / 100})` }}
              className="max-h-full max-w-full object-contain rounded-lg shadow-md transition-transform duration-200"
            />
          ) : (
            <div className="text-center p-8">
              <FileText className="w-16 h-16 text-slate-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">
                Preview not directly supported in-browser for this format
              </p>
              <a
                href={downloadUrl}
                download={doc.originalName || doc.fileName}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                <Download className="w-4 h-4" /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PdfViewerModal;
