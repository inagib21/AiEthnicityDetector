'use client';

import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Webcam from 'react-webcam';
import ImageUploadButton from './ImageUploadButton';

interface Predictions {
  race: string;
  race_probs: { [key: string]: number };
  gender: string;
  gender_prob: number;
  age: string;
  age_prob: number;
  error?: string;
}

const FaceAnalysis = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [photoSource, setPhotoSource] = useState<'camera' | 'upload' | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleReset = () => {
    setPhoto(null);
    setPredictions(null);
    setPhotoSource(null);
    setIsCameraActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  function base64toBlob(base64Data: string) {
    const byteCharacters = atob(base64Data.split(",")[1]);
    const arrayBuffer = new ArrayBuffer(byteCharacters.length);
    const byteArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: "image/jpeg" });
  }

  const startCamera = async () => {
    try {
      setPhotoSource(null);
      console.log("Starting camera...");
      setCameraError(null);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to start camera";
      setCameraError(errorMessage);
      alert(`Camera error: ${errorMessage}`);
    }
  };

  const stopCamera = () => {
    setIsCameraActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };


// In your handleImageUpload function:
const handleImageUpload = async (file: File) => {
  try {
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch('/api/py/analyze-face', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to analyze face: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Create preview
    const photoURL = URL.createObjectURL(file);
    setPhoto(photoURL);
    setPredictions(data);
    setPhotoSource('upload');

  } catch (err) {
    console.error('Error analyzing face:', err);
    setPredictions({
      error: err instanceof Error ? err.message : 'Failed to analyze face',
    } as Predictions);
  } finally {
    setIsLoading(false);
  }
};

// And similarly in your takePhoto function:
const takePhoto = async () => {
  if (!webcamRef.current) {
    console.error('Camera not found');
    return;
  }

  try {
    setIsLoading(true);
    console.log('Taking photo...');
    const imgSrc = webcamRef.current.getScreenshot();
    if (!imgSrc) {
      throw new Error('Failed to take photo');
    }

    const blob = base64toBlob(imgSrc);
    const formData = new FormData();
    formData.append('file', blob, 'photo.jpg');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch('/api/py/analyze-face', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to analyze face: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Received predictions:', data);
    
    setPhoto(imgSrc);
    setPredictions(data);
    setPhotoSource('camera');
    stopCamera();

  } catch (err) {
    console.error('Error analyzing face:', err);
    setPredictions({
      error: err instanceof Error ? err.message : 'Failed to analyze face',
    } as Predictions);
  } finally {
    setIsLoading(false);
  }
};



const saveToAlbum = async () => {
  if (!photo || !predictions) {
    console.error('No photo or predictions to save');
    return;
  }

  try {
    // Create a new canvas for the combined image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Load the original image to get its dimensions
    const img = new Image();
    img.src = photo;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    // Set canvas dimensions - original image plus space for text
    canvas.width = Math.max(img.width, 800); // Minimum width of 800px
    canvas.height = img.height + 400; // Extra 400px for analysis results

    // Fill background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the image at the top
    ctx.drawImage(img, (canvas.width - img.width) / 2, 0);

    // Setup text styling
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'black';
    let yPosition = img.height + 40;

    // Draw Analysis Results header
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Analysis Results:', 20, yPosition);
    yPosition += 40;

    // Draw Race/Ethnicity
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Race/Ethnicity:', 20, yPosition);
    ctx.font = '18px Arial';
    ctx.fillText(`${predictions.race} (${(predictions.race_probs[predictions.race] * 100).toFixed(1)}%)`, 200, yPosition);
    yPosition += 40;

    // Draw Gender
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Gender:', 20, yPosition);
    ctx.font = '18px Arial';
    ctx.fillText(`${predictions.gender} (${(predictions.gender_prob * 100).toFixed(1)}%)`, 200, yPosition);
    yPosition += 40;

    // Draw Age
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Age Range:', 20, yPosition);
    ctx.font = '18px Arial';
    ctx.fillText(`${predictions.age} (${(predictions.age_prob * 100).toFixed(1)}%)`, 200, yPosition);

    // Create timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `face_analysis_${timestamp}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    }, 'image/png');

    // Reset the form
    setPhoto(null);
    setPredictions(null);
    alert('Analysis image saved successfully!');
  } catch (err) {
    console.error('Error saving to album:', err);
    alert('Failed to save analysis to album');
  }
};

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {(isCameraActive || photo) && (
        <Button 
          variant="ghost" 
          size="icon"
          className="mb-2" 
          onClick={handleReset}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      )}

      <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6 space-y-4">
          {/* Camera/Photo Display */}
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {isCameraActive ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                mirrored={true}
                className="w-full h-full object-cover"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "user"
                }}
              />
            ) : photo ? (
              <img
                src={photo}
                alt="Captured photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
            {/* Loading/Error overlay */}
            {(isLoading || cameraError) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-100 text-white p-4 text-center">
                {isLoading ? "Analyzing..." : cameraError}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isCameraActive && !photo && (
              <>
                <Button onClick={startCamera} disabled={!!cameraError}>
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
                <ImageUploadButton 
                  onImageSelect={handleImageUpload}
                  disabled={isLoading}
                />
              </>
            )}
            {isCameraActive && (
              <Button onClick={takePhoto}>
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            )}
            {photo && (
              <>
                {photoSource === 'camera' ? (
                  <Button onClick={startCamera}>Retake Photo</Button>
                  
                ) : (
                  // <ImageUploadButton 
                  //   onImageSelect={handleImageUpload}
                  //   disabled={isLoading}
                  //   buttonText="Upload Another Photo"
                  // />
                  null
                )}
                <Button onClick={saveToAlbum}>Save to Album</Button>
              </>
            )}
          </div>

          {/* Predictions Display */}
          {predictions && !predictions.error && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Analysis Results:</h3>
              <div className="space-y-4">
                {/* Race Predictions */}
                <div>
                  <h4 className="font-medium">Race/Ethnicity:</h4>
                  <div className="ml-2">
                    <div className="font-semibold">{predictions.race}</div>
                    <div className="text-sm space-y-1">
                      {Object.entries(predictions.race_probs).map(([race, prob]) => (
                        <div key={race} className="flex items-center gap-2">
                          <div className="w-24">{race}:</div>
                          <div className="flex-1 bg-gray-200 h-2 rounded-full">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${(prob * 100).toFixed(1)}%` }}
                            />
                          </div>
                          <div className="w-16 text-right">{(prob * 100).toFixed(1)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Gender Prediction */}
                <div>
                  <h4 className="font-medium">Gender:</h4>
                  <div className="ml-2">
                    <div className="font-semibold">{predictions.gender}</div>
                    <div className="text-sm">
                      Confidence: {(predictions.gender_prob * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* Age Prediction */}
                <div>
                  <h4 className="font-medium">Age Range:</h4>
                  <div className="ml-2">
                    <div className="font-semibold">{predictions.age}</div>
                    <div className="text-sm">
                      Confidence: {(predictions.age_prob * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {predictions && predictions.error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              <h3 className="font-semibold mb-2">Error:</h3>
              <div>{predictions.error}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceAnalysis;