import { SOCKET_URL } from '../config';

/**
 * Utility for building consistent image URLs from backend paths
 */
export const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  // Fallback to local server address
  const baseUrl = SOCKET_URL;
  return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
};
