
export interface CameraParams {
  azimuth: number;
  elevation: number;
  distance: number;
}

export interface GenerationConfig {
  seed: number;
  randomizeSeed: boolean;
  width: number;
  height: number;
  proMode: boolean;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  resolution: "1K" | "2K" | "4K";
}

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
  timestamp: number;
}
