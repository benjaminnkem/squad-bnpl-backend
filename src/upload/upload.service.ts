import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

@Injectable()
export class UploadService {
  private readonly uploadDir = './uploads';
  private readonly processedDir = './uploads/processed';

  constructor() {
    this.ensureDirectoriesExist();
  }

  private async ensureDirectoriesExist() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }

    try {
      await fs.access(this.processedDir);
    } catch {
      await fs.mkdir(this.processedDir, { recursive: true });
    }
  }

  async processImage(
    filePath: string,
    options: ImageProcessingOptions = {},
  ): Promise<string> {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'jpeg',
    } = options;

    const fileName = path.basename(filePath, path.extname(filePath));
    const processedFileName = `${fileName}_processed.${format}`;
    const processedFilePath = path.join(this.processedDir, processedFileName);

    await sharp(filePath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFormat(format, { quality })
      .toFile(processedFilePath);

    return processedFilePath;
  }

  async createThumbnail(filePath: string): Promise<string> {
    const fileName = path.basename(filePath, path.extname(filePath));
    const thumbnailFileName = `${fileName}_thumb.jpeg`;
    const thumbnailPath = path.join(this.processedDir, thumbnailFileName);

    await sharp(filePath)
      .resize(150, 150, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 70 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  }

  async getImageMetadata(filePath: string) {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha,
        channels: metadata.channels,
      };
    } catch (error) {
      console.log('Error getting image metadata:', error);
      return null;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  getFileUrl(filePath: string): string {
    return filePath.replace('./uploads/', '/uploads/');
  }
}
