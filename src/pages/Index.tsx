
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, ChefHat, Sparkles, Utensils, Eye, Palette } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import dishesBg from "@/assets/dishes-bg.jpg";
import ingredientsBg from "@/assets/ingredients-bg.jpg";
import tiramisuImg from "@/assets/tiramisu.png";
import caesarSaladImg from "@/assets/Caesar Salad.png";
import butterChickenImg from "@/assets/ButterChicken.png";
import falafelWrapImg from "@/assets/Falafel_Wrap.png";
import paellaImg from "@/assets/Paella.png";
import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js/dist/tesseract.min.js";
import axios from "axios";

// Add mock data pool at the top (after imports)
const MOCK_DISHES = [
  { name: 'Tiramisu', description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream.' },
  { name: 'Caesar Salad', description: 'Crisp romaine lettuce with Caesar dressing, croutons, and parmesan.' },
  { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken and Indian spices.' },
  { name: 'Falafel Wrap', description: 'Chickpea patties with veggies and tahini in a warm pita.' },
  { name: 'Paella', description: 'Spanish rice dish with seafood, chicken, and saffron.' }
];

const MOCK_IMAGES = [
  tiramisuImg,
  caesarSaladImg,
  butterChickenImg,
  falafelWrapImg,
  paellaImg
];

// --- API CALL HELPERS ---
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Helper for delay
function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

// Fetch dish info from GPT
export async function fetchDishInfos(extractedText: string): Promise<{ name: string; description: string }[]> {
  const gptResponse = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts dish names and short, appetizing descriptions from restaurant menus. If the provided text is not a food menu, reply with ONLY the word 'ERROR'. If it is a menu, choose the top 5 dishes by your own opinion (based on popularity, uniqueness, or taste appeal) and reply with a JSON array of 5 objects, each with 'name' (dish name) and 'description' (a short, appetizing description of the dish). Reply ONLY with the JSON array or 'ERROR'. Example: [{\"name\":\"Tiramisu\",\"description\":\"Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream\"}, ...]",
        },
        {
          role: "user",
          content: extractedText,
        },
      ],
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
    }
  );
  let gptContent = gptResponse.data.choices[0].message.content.trim();
  if (gptContent === "ERROR") {
    throw new Error("The uploaded image does not appear to be a food menu. Please try again.");
  }
  // Extract JSON array from code block if present
  const codeBlockMatch = gptContent.match(/```(?:json)?\n([\s\S]*?)```/i);
  if (codeBlockMatch) {
    gptContent = codeBlockMatch[1].trim();
  }
  let dishes: { name: string; description: string }[] = [];
  try {
    dishes = JSON.parse(gptContent);
    if (!Array.isArray(dishes) || dishes.length === 0) throw new Error();
  } catch {
    throw new Error("Failed to extract dishes from menu. Please try another image.");
  }
  return dishes;
}

// Fetch DALL·E images for each dish (staggered, update UI as each arrives)
export async function fetchDalleImages(
  dishes: { name: string; description: string }[],
  setDishImageErrors: React.Dispatch<React.SetStateAction<boolean[]>>,
  setDishImages: React.Dispatch<React.SetStateAction<(string | null)[]>>
): Promise<(string | null)[]> {
  // If all dish names are the same, use a single DALL·E request for n images
  const allSame = dishes.every(d => d.name === dishes[0].name);
  if (allSame) {
    try {
      const dalleResponse = await axios.post(
        "https://api.openai.com/v1/images/generations",
        {
          prompt: `A photorealistic, realistic, beautifully plated, tasty-looking dish: ${dishes[0].name}. Professional food photography, restaurant menu style, high detail, vibrant colors, no text, no watermark, no people, only the dish on a clean background, 4k, studio lighting, shallow depth of field.`,
          n: 5,
          size: "512x512",
        },
        {
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      const urls = dalleResponse.data.data.map((img: any) => img.url);
      setDishImages(urls); // direct assignment, fixes linter error
      setDishImageErrors(Array(dishes.length).fill(false));
      return urls;
    } catch (err) {
      setDishImageErrors(Array(dishes.length).fill(true));
      setDishImages(Array(dishes.length).fill(null));
      return Array(dishes.length).fill(null);
    }
  }
  // Otherwise, use staggered per-dish requests
  const results: (string | null)[] = Array(5).fill(null);
  const promises = dishes.slice(0, 5).map((dish, idx) =>
    new Promise<void>(resolve => {
      setTimeout(async () => {
        try {
          const dalleResponse = await axios.post(
            "https://api.openai.com/v1/images/generations",
            {
              prompt: `A photorealistic, realistic, beautifully plated, tasty-looking dish: ${dish.name}. Professional food photography, restaurant menu style, high detail, vibrant colors, no text, no watermark, no people, only the dish on a clean background, 4k, studio lighting, shallow depth of field.`,
              n: 1,
              size: "512x512",
            },
            {
              headers: {
                Authorization: `Bearer ${openaiApiKey}`,
                "Content-Type": "application/json",
              },
            }
          );
          results[idx] = dalleResponse.data.data[0].url;
        } catch {
          setDishImageErrors(prev => {
            const copy = [...prev];
            copy[idx] = true;
            return copy;
          });
          results[idx] = null;
        }
        setDishImages(prev => {
          const copy = [...prev];
          copy[idx] = results[idx];
          return copy;
        });
        resolve();
      }, idx * 500);
    })
  );
  await Promise.all(promises);
  return results;
}

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [dishNames, setDishNames] = useState<string[]>([]);
  const [dishImages, setDishImages] = useState<string[]>([]);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [dishInfos, setDishInfos] = useState<{ name: string; description: string }[]>([]);
  const [dishImageErrors, setDishImageErrors] = useState<boolean[]>([false, false, false, false]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setCameraActive(false);
      setModalOpen(false); // Close modal immediately after selection
    }
  };

  // Handle camera capture
  const handleOpenCamera = async () => {
    setCameraActive(true);
    setSelectedImage(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          setSelectedImage(new File([blob], "captured.png", { type: "image/png" }));
          setCameraActive(false);
          setModalOpen(false); // Close modal immediately after capture
        }
      }, "image/png");
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCameraActive(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Add handler for View Examples
  const handleViewExamples = () => {
    // Use mock data in its defined order to ensure images match descriptions
    setDishInfos(MOCK_DISHES);
    setDishNames(MOCK_DISHES.map(d => d.name));
    setDishImages(MOCK_IMAGES);
    setDishImageErrors(Array(5).fill(false));
    setProcessError(null);
    setProcessing(false);
  };

  // OCR processing after image selection
  React.useEffect(() => {
    if (selectedImage) {
      setOcrLoading(true);
      setOcrError(null);
      setExtractedText(null);

      if (!selectedImage.type.startsWith('image/')) {
        setOcrError('Selected file is not an image.');
        setOcrLoading(false);
        setImageDataUrl(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const imageDataUrl = reader.result as string;
        setImageDataUrl(imageDataUrl); // Save for debug UI
        Tesseract.recognize(imageDataUrl, "eng")
          .then(({ data: { text } }) => {
            setExtractedText(text);
            setOcrLoading(false);
          })
          .catch((err) => {
            setOcrError("Failed to extract text from image. Please try again.");
            setOcrLoading(false);
          });
      };
      reader.onerror = () => {
        setOcrError("Failed to read the image file.");
        setOcrLoading(false);
        setImageDataUrl(null);
      };
      reader.readAsDataURL(selectedImage);
    } else {
      setImageDataUrl(null);
    }
  }, [selectedImage]);

  // When a new image is selected, clear previous results
  React.useEffect(() => {
    if (selectedImage) {
      setDishInfos([]);
      setDishNames([]);
      setDishImages([]);
      setDishImageErrors([false, false, false, false]);
      setProcessError(null);
    }
  }, [selectedImage]);

  // Remove manual button and useEffect to trigger image generation automatically
  React.useEffect(() => {
    if (extractedText && !processing && !dishImages.length && !processError) {
      (async () => {
        setProcessing(true);
        setProcessError(null);
     
        try {
          // 1. Verify menu and extract top6 dishes with descriptions
          const dishes = await fetchDishInfos(extractedText);
          setDishInfos(dishes);
          setDishNames(dishes.map(d => d.name));
          await fetchDalleImages(dishes, setDishImageErrors, setDishImages);
          console.log('DALL·E dishImages:', dishImages);
          setProcessing(false);
        } catch (err: any) {
          setProcessError("An error occurred while processing the menu. Please try again.");
          setProcessing(false);
        }
      })();
    }
  }, [extractedText, processing, dishImages.length, processError]);

  // Log extractedText for debugging
  if (extractedText) {
    console.log('Extracted menu text:', extractedText);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-8 sm:py-12">
        <div className="absolute inset-0">
          <img 
            src={heroBg} 
            alt="Restaurant kitchen background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95"></div>
        </div>
        <div className="relative container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium text-primary">
              <Sparkles className="w-4 h-4" />
              AI-Powered Food Visualization
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Visualize your dishes
              <span className="block text-primary">before they hit the table</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Bring your menus to life with AI. Create stunning, realistic photos of your dishes 
              to perfect presentation, plan layouts, and wow your customers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
               <Button size="lg" className="text-lg px-8 py-6" onClick={() => setModalOpen(true)}>
                 <Camera className="w-5 h-5 mr-2" />
                 Start Creating
               </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={handleViewExamples}>
                  <Eye className="w-5 h-5 mr-2" />
                  View Examples
                </Button>
            </div>
          </div>
        </div>
        {/* Modal for image selection */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative overflow-y-auto max-h-[90vh]">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={handleCloseModal}>&times;</button>
              <h2 className="text-xl font-bold mb-4">Upload or Take a Photo of Your Menu</h2>
              {!cameraActive ? (
                <div className="flex flex-col gap-4">
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">Upload Image</Button>
                  <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                  <Button onClick={handleOpenCamera} variant="outline">Take Photo</Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 items-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded" style={{ maxHeight: 300 }} />
                  <Button onClick={handleCapture}>Capture</Button>
                  <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                </div>
              )}
              {/* Debug info removed from modal */}
            </div>
          </div>
        )}
        {/* OCR Loading, Error, and Result UI */}
        {ocrLoading && (
          <div className="mt-8 flex justify-center">
            <div className="text-lg text-primary">Extracting text from image...</div>
          </div>
        )}
        {ocrError && (
          <div className="mt-8 flex justify-center">
            <div className="text-lg text-red-600">{ocrError}</div>
          </div>
        )}
        {/* Extracted Menu Text UI removed */}
        {/* OpenAI/DALL·E Loading, Error, and Results UI */}
        {processing && (
          <div className="mt-8 flex justify-center">
            <div className="text-lg text-primary">Processing menu and generating images...</div>
          </div>
        )}
        {processError && (
          <div className="mt-8 flex justify-center">
            <div className="text-lg text-red-600">{processError}</div>
          </div>
        )}
        {/* Show error if processError is set, otherwise show recommended dishes UI */}
        {processError ? (
          <div className="mt-4 mb-16 flex flex-col items-center text-red-600 text-lg font-semibold" style={{ zIndex: 1, position: 'relative' }}>
            {processError}
          </div>
        ) : dishInfos.length > 0 && (
          <div className="mt-4 mb-16 flex flex-col items-center" style={{ zIndex: 1, position: 'relative' }}>
            <div style={{ fontWeight: 'bold', fontSize: 24, marginBottom: 24, color: '#1a202c', textAlign: 'center', zIndex: 1, position: 'relative' }}>Top 5 dishes which we recommend to order:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" style={{ zIndex: 1, position: 'relative' }}>
              {[0,1,2,3,4].map((idx) => {
                const dish = dishInfos[idx] || { name: "Loading...", description: "" };
                return (
                  <div key={idx} className="flex flex-col items-center border rounded-lg p-4 bg-white shadow-md w-72" style={{ zIndex: 1, position: 'relative' }}>
                    <div className="w-40 h-40 flex items-center justify-center bg-gray-100 rounded mb-4 overflow-hidden" style={{ zIndex: 1, position: 'relative' }}>
                      {dishImages[idx] && typeof dishImages[idx] === 'string' && dishImages[idx] !== '' ? (
                        <img
                          src={dishImages[idx]!}
                          alt={dish.name}
                          className="object-cover w-full h-full"
                          style={{ zIndex: 1, position: 'relative' }}
                          onError={() => {
                            setDishImageErrors(prev => {
                              const copy = [...prev];
                              copy[idx] = true;
                              return copy;
                            });
                          }}
                        />
                      ) : dishImageErrors[idx] ? (
                        <div className="text-red-500 text-xs text-center" style={{ zIndex: 1, position: 'relative' }}>Image failed to generate</div>
                      ) : (
                        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24" style={{ zIndex: 1, position: 'relative' }}>
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      )}
                    </div>
                    <div className="font-semibold text-lg mb-2 text-center" style={{ zIndex: 1, position: 'relative' }}>{dish.name}</div>
                    <div className="text-sm text-gray-600 text-center" style={{ zIndex: 1, position: 'relative' }}>{dish.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-24">
        <div className="absolute inset-0 opacity-10">
          <img 
            src={dishesBg} 
            alt="Plated dishes background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Perfect every dish before service
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From concept to plate, visualize your culinary creations with photorealistic AI
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-border/50 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Menu Planning</CardTitle>
                <CardDescription>
                  Visualize new dishes before prep work begins. Test plating ideas and perfect presentations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Visual Marketing</CardTitle>
                <CardDescription>
                  Create stunning menu photos for social media, websites, and promotional materials.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Staff Training</CardTitle>
                <CardDescription>
                  Show your team exactly how dishes should look with consistent, professional photos.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-24">
        <div className="absolute inset-0">
          <img 
            src={ingredientsBg} 
            alt="Fresh ingredients background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-muted/95"></div>
        </div>
        <div className="relative container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center border-border/50">
            <CardHeader className="space-y-6 py-12">
              <CardTitle className="text-3xl sm:text-4xl font-bold">
                Ready to revolutionize your kitchen?
              </CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                Join forward-thinking chefs and restaurants who are using AI to perfect their dishes 
                and create stunning visual content.
              </CardDescription>
              <div className="pt-4">
                <Button size="lg" className="text-lg px-12 py-6">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Today
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
