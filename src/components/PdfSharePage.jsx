import React, { useEffect, useState } from 'react';
import './PdfSharePage.css';
import bannerText from './bannerText';
import { endpoints } from '../api/api';

const PdfSharePage = () => {
  const [pdfCode, setPdfCode] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfCopied, setPdfCopied] = useState(false);
  const [pdfError, setPdfError] = useState('');

  useEffect(() => {
    if (!pdfFile) {
      setPdfPreview('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(pdfFile);
    setPdfPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [pdfFile]);

  const onPdfChange = (event) => {
    const file = event.target.files?.[0] || null;
    setPdfFile(file);
    setPdfError('');
  };

  const uploadPdf = () => {
    if (!pdfFile) {
      setPdfError('Please select a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', pdfFile);

    setPdfLoading(true);
    setPdfError('');

    fetch(endpoints.uploadPdf, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          throw new Error(data.message || 'Failed to upload PDF');
        }
        setPdfCode(data.id);
      })
      .catch(error => {
        console.error('Error:', error);
        setPdfError(error.message || 'Failed to upload PDF');
      })
      .finally(() => {
        setPdfLoading(false);
      });
  };

  const copyPdfCode = () => {
    if (!pdfCode) return;

    navigator.clipboard.writeText(pdfCode)
      .then(() => {
        setPdfCopied(true);
        setTimeout(() => setPdfCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div>
      <div className="nameBanner">
        {bannerText}
      </div>
      <div className="shareMain">
        <div className="pdfBox">
          <div className="code">
            {pdfCode ? (
              <>
                <h1>PDF Code</h1>
                <div onClick={copyPdfCode} className="codeBadge">
                  {pdfCode} {pdfCopied ? '✓' : '📋'}
                </div>
              </>
            ) : (
              <h1>Share a PDF</h1>
            )}
          </div>

          <div className="pdfUploadRow">
            <input
              type="file"
              accept="application/pdf"
              onChange={onPdfChange}
              className="pdfInput"
            />
            {pdfError && <div className="pdfError">{pdfError}</div>}
          </div>

          {pdfPreview && (
            <div className="pdfPreview">
              <iframe src={pdfPreview} title="PDF preview" />
            </div>
          )}

          <div className="buttons-container">
            <button
              className="Btn pdf-share-btn"
              onClick={uploadPdf}
              disabled={pdfLoading}
            >
              {pdfLoading ? 'Sharing...' : 'Share PDF'}
            </button>

            <button
              className="Btn secondaryBtn"
              onClick={() => { window.location.href = '/share-image'; }}
            >
              Share Image
            </button>

            <button
              className="Btn secondaryBtn"
              onClick={() => { window.location.href = '/sharePage'; }}
            >
              Share Text
            </button>

            <button
              className="Btn secondaryBtn"
              onClick={() => { window.location.href = '/'; }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfSharePage;
