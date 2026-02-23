'use client';

import { useRef, useState } from 'react';
import { Camera, X, Check, RefreshCw } from 'lucide-react';

interface PhotoCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoData: string) => void;
  type: 'pickup' | 'delivery';
}

export default function PhotoCapture({ isOpen, onClose, onCapture, type }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-dark-900">
        <h2 className="font-semibold text-lg">
          {type === 'pickup' ? 'Take Pickup Photo' : 'Take Delivery Photo'}
        </h2>
        <button 
          onClick={onClose}
          className="p-2 tap-target"
        >
          <X size={24} />
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-teal-500/10 p-4">
        <p className="text-sm text-teal-400">
          {type === 'pickup' 
            ? 'Please take a photo of the receipt or order confirmation at the restaurant.'
            : 'Please take a photo of the delivered order at the customer\'s door or handoff location.'}
        </p>
      </div>

      {/* Camera Preview */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              onLoadedMetadata={startCamera}
            />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={capturePhoto}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center tap-target shadow-lg"
              >
                <div className="w-14 h-14 border-4 border-teal-500 rounded-full" />
              </button>
            </div>
          </>
        ) : (
          <>
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={retakePhoto}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw size={20} />
                Retake
              </button>
              <button
                onClick={confirmPhoto}
                className="btn-primary flex items-center gap-2"
              >
                <Check size={20} />
                Confirm
              </button>
            </div>
          </>
        )}
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
