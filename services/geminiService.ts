
import { GoogleGenAI } from "@google/genai";
import { CameraParams, GenerationConfig } from "../types";

export async function generateImageFromCamera(
  base64Image: string,
  camera: CameraParams,
  config: GenerationConfig
): Promise<{ imageUrl: string; prompt: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const model = config.proMode ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const getAzimuthDesc = (az: number) => {
    if (az <= 22.5 || az > 337.5) return "front view";
    if (az <= 67.5) return "front-right side view";
    if (az <= 112.5) return "right side view";
    if (az <= 157.5) return "back-right view";
    if (az <= 202.5) return "back view";
    if (az <= 247.5) return "back-left view";
    if (az <= 292.5) return "left side view";
    return "front-left side view";
  };

  const getElevationDesc = (el: number) => {
    if (el < -10) return "low angle shot, looking up";
    if (el > 20) return "high angle shot, looking down";
    return "eye-level shot";
  };

  const getDistanceDesc = (dist: number) => {
    if (dist < 0.8) return "close-up shot, extreme detail";
    if (dist > 1.2) return "wide shot, environment visible";
    return "medium shot";
  };

  const cameraPrompt = `${getAzimuthDesc(camera.azimuth)}, ${getElevationDesc(camera.elevation)}, ${getDistanceDesc(camera.distance)}`;
  const finalPrompt = `Transform this image to be seen from a ${cameraPrompt}. Maintain consistency with the original subject and lighting. Realistic style.`;

  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        imagePart,
        { text: finalPrompt },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: config.aspectRatio,
        imageSize: config.resolution, // Now using the configured resolution
      } as any,
    },
  });

  let imageUrl = "";
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) {
    throw new Error("No image data returned from model. Check your API key and quota.");
  }

  return { imageUrl, prompt: finalPrompt };
}
