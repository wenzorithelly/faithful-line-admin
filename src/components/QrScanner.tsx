import React, { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig, Html5QrcodeResult } from 'html5-qrcode';

interface QrScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: Html5QrcodeResult) => void;
  onScanFailure: (error: any) => void;
  onScanComplete?: () => void; // New optional prop
}

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onScanFailure, onScanComplete }) => {
  const qrCodeRegionId = 'html5qr-code-full-region';
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Ensure the code runs only on the client side
    if (typeof window === 'undefined') return;

    const config: Html5QrcodeCameraScanConfig = { fps: 10, qrbox: { width: 250, height: 250 } };
    html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          // Log available cameras for debugging
          console.log('Available cameras:', devices);

          // Prefer back-facing camera
          const backCamera = devices.find(device =>
            /back|rear|environment/i.test(device.label)
          );

          const selectedCameraId = backCamera ? backCamera.id : devices[0].id;

          if (backCamera) {
            console.log(`Using back camera: ${backCamera.label}`);
          } else {
            console.log('Back camera not found. Using the first available camera.');
          }

          if (html5QrCodeRef.current) {
            await html5QrCodeRef.current.start(
              selectedCameraId,
              config,
              async (decodedText: string, decodedResult: Html5QrcodeResult) => {
                await onScanSuccess(decodedText, decodedResult);
                if (onScanComplete) {
                  onScanComplete();
                }
              },
              onScanFailure
            );
          }
        } else {
          const errorMsg = 'No cameras found on this device.';
          console.error(errorMsg);
          onScanFailure(new Error(errorMsg));
        }
      } catch (err) {
        console.error('Error accessing cameras:', err);
        onScanFailure(err);
      }
    };

    startScanner();

    // Cleanup function
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop()
          .then(() => {
            // 'clear' does not return a Promise, so no 'catch' here
            html5QrCodeRef.current?.clear();
          })
          .catch(err => {
            console.error('Error stopping the scanner:', err);
          });
      }
    };
  }, [onScanSuccess, onScanFailure, onScanComplete]);

  return (
    <div id={qrCodeRegionId} style={{ width: '100%' }}></div>
  );
};

export default QrScanner;
