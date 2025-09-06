export interface StickerOption {
  id: string;
  label: string;
  prompt: string;
  description?: string;
}

export const stickerOptions: StickerOption[] = [
  {
    id: 'meme',
    label: 'Create Meme Sticker',
    prompt: 'Create meme sticker',
    description: 'Funny memes with text and expressions'
  },
  {
    id: 'christmas',
    label: 'Create Christmas Sticker',
    prompt: 'Create Christmas sticker',
    description: 'Festive holiday themes with Santa, reindeer, snowflakes'
  },
  {
    id: 'motivational',
    label: 'Create Motivational Sticker',
    prompt: 'Create motivational sticker',
    description: 'Inspiring quotes and uplifting designs'
  }
];

export default stickerOptions;
