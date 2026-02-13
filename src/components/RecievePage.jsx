import React, { useState, useRef } from 'react';
import './RecievePage.css';
import bannerText from './bannerText';
import { endpoints } from '../api/api';

const RecievePage = () => {
  const [receivedData, setReceivedData] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [imageCode, setImageCode] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [pdfCode, setPdfCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const inputRef = useRef(null);

  const receiveData = () => {
    const code = inputRef.current.value.trim();
    if (!code) {
      setError('Please enter a code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setImageData(null);
    setImageCode('');
    setPdfData(null);
    setPdfCode('');

    fetch(endpoints.get(code))
      .then(res => {
        if (!res.ok) {
          throw new Error('Invalid code or content not found');
        }
        return res.json();
      })
      .then(data => {
        if (data && data.text) {
          const unescapedText = data.text
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\\\/g, '\\');
          setReceivedData(unescapedText);
          setSuccessMessage('Text received successfully.');
        } else {
          setError('No data found for this code');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError(error.message || 'Failed to retrieve data');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const receiveImage = () => {
    const code = inputRef.current.value.trim();
    if (!code) {
      setError('Please enter a code');
      return;
    }

    setImageLoading(true);
    setError('');
    setSuccessMessage('');
    setReceivedData('');
    setPdfData(null);
    setPdfCode('');

    fetch(endpoints.getImage(code))
      .then(res => {
        if (!res.ok) {
          throw new Error('Invalid code or image not found');
        }
        return res.json();
      })
      .then(data => {
        if (data?.image?.url) {
          setImageData(data.image);
          setImageCode(code);
          setSuccessMessage('Image received wait for it to load or Download it now.');
        } else {
          setError('No image found for this code');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError(error.message || 'Failed to retrieve image');
      })
      .finally(() => {
        setImageLoading(false);
      });
  };

  const receivePdf = () => {
    const code = inputRef.current.value.trim();
    if (!code) {
      setError('Please enter a code');
      return;
    }

    setPdfLoading(true);
    setError('');
    setSuccessMessage('');
    setReceivedData('');
    setImageData(null);
    setImageCode('');

    fetch(endpoints.getPdf(code))
      .then(res => {
        if (!res.ok) {
          throw new Error('Invalid code or PDF not found');
        }
        return res.json();
      })
      .then(data => {
        if (data?.pdf?.url) {
          setPdfData(data.pdf);
          setPdfCode(code);
          setSuccessMessage('PDF received wait for it to load or Download it now.');
        } else {
          setError('No PDF found for this code');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError(error.message || 'Failed to retrieve PDF');
      })
      .finally(() => {
        setPdfLoading(false);
      });
  };

  const copyToClipboard = () => {
    if (!receivedData) return;

    navigator.clipboard.writeText(receivedData)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(error => {
        console.error('Error copying:', error);
      });
  };

  const downloadImage = () => {
    if (!imageCode) return;
    window.location.href = endpoints.downloadImage(imageCode);
  };

  const downloadPdf = () => {
    if (!pdfCode) return;
    window.location.href = endpoints.downloadPdf(pdfCode);
  };

  return (
    <div>
      <div className="nameBanner">
        {bannerText}
      </div>

      <div className="receiveMain">
        <div className="receiveContainer">
          <div className="receivedData">
            <h1>Received Data</h1>
            {}
            {imageData ? (
              <div className="imageResult">
                <div className="imagePreviewLarge">
                  <img src={imageData.url} alt={imageData.originalName || 'Shared'} />
                </div>
                <div className="imageMeta">
                  {imageData.originalName || 'Shared image'}
                </div>
              </div>
            ) : pdfData ? (
              <div className="pdfResult">
                <div className="pdfPreviewLarge">
                  <iframe src={pdfData.url} title="Shared PDF" />
                </div>
                <div className="pdfMeta">
                  {pdfData.originalName || 'Shared PDF'}
                </div>
              </div>
            ) : (
              <pre className="data">
                {receivedData || 'Enter a code below to fetch shared content...'}
              </pre>
            )}
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Enter the share code..."
              ref={inputRef}
              onChange={() => {
                if (error) setError('');
                if (successMessage) setSuccessMessage('');
              }}
            />
            {error && (
              <div style={{
                color: '#ff6b6b',
                fontSize: '0.9rem',
                marginTop: '0.5rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            {successMessage && !error && (
              <div style={{
                color: '#22c55e',
                fontSize: '0.9rem',
                marginTop: '0.5rem',
                textAlign: 'center'
              }}>
                {successMessage}
              </div>
            )}
          </div>

          <div className="buttons-container">
            {receivedData && (
              <button
                className={`Btn ${copied ? 'copied' : ''}`}
                id="copyBtn"
                onClick={copyToClipboard}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}

            {imageData && (
              <button
                className="Btn"
                onClick={downloadImage}
              >
                Download
              </button>
            )}

            {pdfData && (
              <button
                className="Btn"
                onClick={downloadPdf}
              >
                Download PDF
              </button>
            )}

            <button
              className="Btn"
              id="recievePageBtn"
              onClick={receiveData}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Receive Text'}
            </button>

            <button
              className="Btn image-receive-btn"
              onClick={receiveImage}
              disabled={imageLoading}
            >
              {imageLoading ? 'Loading...' : 'Receive Image'}
            </button>

            <button
              className="Btn pdf-receive-btn"
              onClick={receivePdf}
              disabled={pdfLoading}
            >
              {pdfLoading ? 'Loading...' : 'Receive PDF'}
            </button>

            <button
              className="Btn"
              id="backBtn"
              onClick={() => (window.location.href = '/')}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecievePage;

