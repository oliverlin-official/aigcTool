
import React from 'react';

export const DEFAULT_CAMERA: { azimuth: number; elevation: number; distance: number } = {
  azimuth: 0,
  elevation: 0,
  distance: 1.0,
};

export const DEFAULT_CONFIG = {
  seed: 0,
  randomizeSeed: true,
  width: 1024,
  height: 1024,
  proMode: false,
  aspectRatio: "1:1" as const,
  resolution: "1K" as const,
};

export const CAMERA_PRESETS = [
  { name: 'Front View', azimuth: 0, elevation: 0, distance: 1.0 },
  { name: 'Bird\'s Eye', azimuth: 0, elevation: 60, distance: 1.4 },
  { name: 'Worm\'s Eye', azimuth: 0, elevation: -30, distance: 0.8 },
  { name: 'Side Profile', azimuth: 90, elevation: 0, distance: 1.0 },
  { name: 'Back View', azimuth: 180, elevation: 0, distance: 1.0 },
  { name: 'Close Up', azimuth: 0, elevation: 10, distance: 0.6 },
];

export const CAMERA_SLIDERS = [
  {
    key: 'azimuth' as const,
    label: 'Azimuth',
    min: 0,
    max: 315,
    step: 45,
    desc: 'Horizontal rotation'
  },
  {
    key: 'elevation' as const,
    label: 'Elevation',
    min: -30,
    max: 60,
    step: 1,
    desc: 'Vertical angle'
  },
  {
    key: 'distance' as const,
    label: 'Distance',
    min: 0.6,
    max: 1.4,
    step: 0.1,
    desc: 'Camera zoom level'
  }
];
