// Service-specific data and configurations

export const PHOTOGRAPHER_STYLES = [
  'Traditional',
  'Candid',
  'Fashion',
  'Product',
  'Newborn',
  'Architecture',
  'Wildlife',
  'Sports',
  'Travel',
  'Aerial'
];

export const VIDEOGRAPHER_STYLES = [
  'Traditional',
  'Candid',
  'Fashion',
  'Product',
  'Newborn',
  'Architecture',
  'Sports',
  'Travel'
];

export const EQUIPMENT_TYPES = [
  'Camera',
  'Lenses',
  'Lighting',
  'Gimbal',
  'Tripod',
  'Drone'
];

export const WEB_LIVE_QUALITIES = ['4K', '2K', 'HD'];

export const LED_WALL_TYPES = ['P2', 'P3', 'P4', 'P5', 'P6'];

export const PHOTOGRAPHY_FIRM_SERVICES = [
  'Wedding',
  'Corporate Event',
  'Birthday',
  'Other Parties'
];

export const SERVICE_CENTRE_CATEGORIES = [
  'Camera',
  'Lenses',
  'Lighting Gear',
  'Gimbal',
  'Drone',
  'Specialist'
];

export const CAMERA_BRANDS = [
  'Canon',
  'Nikon',
  'Sony',
  'Fujifilm',
  'Panasonic',
  'Olympus',
  'Leica',
  'Hasselblad',
  'Phase One',
  'Pentax',
  'Sigma',
  'RED',
  'ARRI',
  'Blackmagic',
  'Other'
];

export const CAMERA_MODELS: Record<string, string[]> = {
  Canon: [
    'EOS R5', 'EOS R6', 'EOS R3', 'EOS R', 'EOS RP',
    'EOS 5D Mark IV', 'EOS 6D Mark II', 'EOS 90D',
    'EOS M50', 'EOS Rebel T7i', 'EOS-1D X Mark III',
    'Other Canon Model'
  ],
  Nikon: [
    'Z9', 'Z7 II', 'Z6 II', 'Z5', 'Z fc',
    'D850', 'D780', 'D7500', 'D5600',
    'D6', 'Other Nikon Model'
  ],
  Sony: [
    'A7S III', 'A7 IV', 'A7R V', 'A7C', 'A1',
    'A9 II', 'A6600', 'A6400', 'FX3', 'FX6',
    'Other Sony Model'
  ],
  Fujifilm: [
    'X-T5', 'X-T4', 'X-H2S', 'X-S10', 'X-Pro3',
    'GFX 100S', 'GFX 50S II', 'Other Fujifilm Model'
  ],
  Panasonic: [
    'Lumix GH6', 'Lumix GH5 II', 'Lumix S5', 'Lumix S1H',
    'Lumix S1R', 'Other Panasonic Model'
  ],
  Other: ['Specify Model']
};

export const LENS_BRANDS = [
  'Canon', 'Nikon', 'Sony', 'Sigma', 'Tamron',
  'Tokina', 'Zeiss', 'Samyang', 'Rokinon',
  'Fujifilm', 'Panasonic', 'Other'
];

export const LENS_TYPES = [
  'Wide Angle (14-35mm)',
  'Standard Zoom (24-70mm)',
  'Telephoto (70-200mm)',
  'Super Telephoto (200mm+)',
  'Prime 24mm',
  'Prime 35mm',
  'Prime 50mm',
  'Prime 85mm',
  'Prime 135mm',
  'Macro',
  'Fisheye',
  'Other'
];

export const LIGHTING_BRANDS = [
  'Godox',
  'Profoto',
  'Broncolor',
  'Elinchrom',
  'Bowens',
  'Westcott',
  'Aputure',
  'Nanlite',
  'Rotolight',
  'Dedolight',
  'Other'
];

export const LIGHTING_TYPES = [
  'Studio Strobe',
  'LED Panel',
  'Softbox',
  'Ring Light',
  'Fresnel Light',
  'Umbrella',
  'Reflector',
  'Light Stand',
  'Other'
];

export const GIMBAL_BRANDS = [
  'DJI',
  'Zhiyun',
  'Moza',
  'FeiyuTech',
  'Tilta',
  'Other'
];

export const GIMBAL_MODELS = [
  'DJI Ronin RS3',
  'DJI Ronin RS2',
  'DJI Ronin SC',
  'Zhiyun Crane 3S',
  'Zhiyun Weebill 3',
  'Moza AirCross 2',
  'Other'
];

export const TRIPOD_BRANDS = [
  'Manfrotto',
  'Gitzo',
  'Benro',
  'Sirui',
  'Vanguard',
  'Peak Design',
  'Really Right Stuff',
  'Other'
];

export const DRONE_BRANDS = [
  'DJI',
  'Autel',
  'Parrot',
  'Skydio',
  'Other'
];

export const DRONE_MODELS = [
  'DJI Mavic 3',
  'DJI Air 3',
  'DJI Mini 3 Pro',
  'DJI FPV',
  'DJI Inspire 2',
  'DJI Phantom 4 Pro',
  'Autel EVO II',
  'Other'
];