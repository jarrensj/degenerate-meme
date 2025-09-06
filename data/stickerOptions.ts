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
      'Create a workout meme sticker',
      'Create a hungry meme sticker',
      'Create a sad meme sticker',
      'Create a angry meme sticker',
      'Create a surprised meme sticker',
      'Create a confused meme sticker',
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
      'Create a motivational sticker with positive vibes theme',
      'Create a motivational sticker with confidence theme',
      'Create a motivational sticker with hard work theme',
    ]
  },
  {
    id: 'miss_you',
    label: 'Create I Miss You Sticker',
    prompt: 'Create I miss you sticker',
    description: 'Heartfelt missing someone expressions with cute and emotional designs',
    variations: [
      'Create an I miss you sticker with cute hearts',
      'Create an I miss you sticker with sad but sweet expression',
      'Create an I miss you sticker with distance theme',
      'Create an I miss you sticker with longing expression',
      'Create an I miss you sticker with thinking of you theme',
      'Create an I miss you sticker with hugging theme',
      'Create an I miss you sticker with letter/message theme',
      'Create an I miss you sticker with laying in bed theme'
    ]
  },
  {
    id: 'love_you',
    label: 'Create I Love You Sticker',
    prompt: 'Create I love you sticker',
    description: 'Romantic and loving expressions with hearts, kisses, and affectionate designs',
    variations: [
      'Create an I love you sticker with big red hearts',
      'Create an I love you sticker with cute couple theme',
      'Create an I love you sticker with kisses and hearts',
      'Create an I love you sticker with romantic flowers',
      'Create an I love you sticker with sweet animals in love',
      'Create an I love you sticker with sparkling hearts',
      'Create an I love you sticker with love letter theme',
    ]
  },
  {
    id: 'hungry',
    label: 'Create I\'m Hungry Sticker',
    prompt: 'Create I\'m hungry sticker',
    description: 'Food cravings and hungry expressions with delicious treats and appetite themes',
    variations: [
      'Create an I\'m hungry sticker with sushi craving',
      'Create an I\'m hungry sticker with pizza craving',
      'Create an I\'m hungry sticker with burger and fries',
      'Create an I\'m hungry sticker with cute hungry face',
      'Create an I\'m hungry sticker with ice cream desire',
      'Create an I\'m hungry sticker with taco theme',
      'Create an I\'m hungry sticker with ramen noodles',
      'Create an I\'m hungry sticker with donut obsession',
      'Create an I\'m hungry sticker with midnight snack theme',
      'Create an I\'m hungry sticker with growling stomach'
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
