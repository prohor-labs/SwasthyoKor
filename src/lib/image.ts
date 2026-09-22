import imageCompression from "browser-image-compression";

export interface CompressImageOptions {
  /**
   * Maximum file size in MB (default: 1.5MB)
   */
  maxSizeMB?: number;
  /**
   * Maximum width or height in pixels (default: 1920)
   */
  maxWidthOrHeight?: number;
  /**
   * WebP compression quality (0.0 to 1.0, default: 0.90 for lossless visual clarity)
   */
  initialQuality?: number;
  /**
   * Run compression in background Web Worker (default: true)
   */
  useWebWorker?: boolean;
}

/**
 * Compresses an image File using browser-image-compression into a WebP File without losing quality.
 *
 * @param file The original image File from an input or dropzone
 * @param options Custom compression options
 * @returns The optimized WebP File
 */
export async function compressImage(
  file: File,
  options: CompressImageOptions = {},
): Promise<File> {
  if (!file?.type.startsWith("image/")) {
    return file;
  }

  try {
    const defaultOptions = {
      maxSizeMB: options.maxSizeMB ?? 1.5,
      maxWidthOrHeight: options.maxWidthOrHeight ?? 1920,
      initialQuality: options.initialQuality ?? 0.9,
      fileType: "image/webp",
      useWebWorker: options.useWebWorker ?? true,
    };

    const compressedBlob = await imageCompression(file, defaultOptions);

    // Give the file a clean .webp extension and mime type
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    return new File([compressedBlob], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn(
      "browser-image-compression failed, using original file:",
      error,
    );
    return file;
  }
}

// Alias for backward compatibility
export const compressImageClient = compressImage;

