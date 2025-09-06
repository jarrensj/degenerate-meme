export interface StickerOption {
  id: string;
  label: string;
  prompt: string;
  description?: string;
  variations: string[];
}

export const stickerOptions: StickerOption[] = [
  {
    id: 'meme',
    label: 'Create Meme Sticker',
    prompt: 'Create meme sticker',
    description: 'Funny memes with text and expressions',
    variations: [
      'Create a happy meme sticker',
      'Create a celebration meme sticker',
      'Create a dancing meme sticker',
      'Create a workout meme sticker'
    ]
  },
  {
    id: 'christmas',
    label: 'Create Christmas Sticker',
    prompt: 'Create Christmas sticker',
    description: 'Festive holiday themes with Santa, reindeer, snowflakes',
    variations: [
      'Create a Christmas sticker with gingerbread',
      'Create a Christmas sticker with Christmas tree',
      'Create a Christmas sticker with snow',
      'Create a Christmas sticker with snowman'
    ]
  },
  {
    id: 'motivational',
    label: 'Create Motivational Sticker',
    prompt: 'Create motivational sticker',
    description: 'Inspiring quotes and uplifting designs',
    variations: [
      'Create a motivational sticker with success theme',
      'Create a motivational sticker with perseverance theme',
      'Create a motivational sticker with dream big theme',
      'Create a motivational sticker with positive vibes theme'
    ]
  }
];

// Helper function to get prompts based on selected option and quantity
export const getPromptsForQuantity = (selectedPrompt: string, quantity: number, hasUploadedImage: boolean = false): string[] => {
  const option = stickerOptions.find(opt => opt.prompt === selectedPrompt);
  if (!option) return Array(quantity).fill(selectedPrompt);
  
  const prompts: string[] = [];
  for (let i = 0; i < quantity; i++) {
    let basePrompt: string;
    if (i < option.variations.length) {
      basePrompt = option.variations[i];
    } else {
      // If we need more than available variations, cycle through them
      basePrompt = option.variations[i % option.variations.length];
    }
    
    // If user uploaded an image, modify the prompt to reference it
    if (hasUploadedImage) {
      basePrompt += ' based on the character or subject in the uploaded image';
    }
    
    prompts.push(basePrompt);
  }
  
  return prompts;
};

export default stickerOptions;
