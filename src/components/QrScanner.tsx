import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig, Html5QrcodeResult } from 'html5-qrcode';
import { Camera, CameraOff } from 'lucide-react';

interface QrScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: Html5QrcodeResult) => void;
  onScanFailure: (error: any) => void;
  onScanComplete?: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onScanFailure, onScanComplete }) => {
  const qrCodeRegionId = 'html5qr-code-full-region';
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const config: Html5QrcodeCameraScanConfig = {
    fps: 10,
    qrbox: { width: 250, height: 250 }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping the scanner:', err);
      }
    }
  };

  const startScanner = async (cameraId: string) => {
    if (!html5QrCodeRef.current || isScanning) return;

    try {
      await html5QrCodeRef.current.start(
        cameraId,
        config,
        async (decodedText: string, decodedResult: Html5QrcodeResult) => {
          await onScanSuccess(decodedText, decodedResult);
          if (onScanComplete) {
            onScanComplete();
          }
        },
        onScanFailure
      );
      setIsScanning(true);
    } catch (err) {
      console.error('Error starting the scanner:', err);
      onScanFailure(err);
    }
  };

  const switchCamera = async () => {
    await stopScanner();
    const nextCameraIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextCameraIndex);
    await startScanner(cameras[nextCameraIndex].id);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);

    const initializeCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          setCameras(devices);
          // Find back camera index
          const backCameraIndex = devices.findIndex(device =>
            /back|rear|environment/i.test(device.label)
          );
          // Start with back camera if available, otherwise use first camera
          const initialIndex = backCameraIndex !== -1 ? backCameraIndex : 0;
          setCurrentCameraIndex(initialIndex);
          await startScanner(devices[initialIndex].id);
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

    initializeCameras();

    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="relative">
      <div id={qrCodeRegionId} className="w-full"></div>
      {cameras.length > 1 && (
        <button
          onClick={switchCamera}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Switch Camera"
        >
          {isScanning ? (
            <Camera className="w-6 h-6 text-gray-700" />
          ) : (
            <CameraOff className="w-6 h-6 text-gray-700" />
          )}
        </button>
      )}
    </div>
  );
};

export default QrScanner;