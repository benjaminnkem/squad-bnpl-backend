import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  BadRequestException,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService, ImageProcessingOptions } from './upload.service';
import { Response } from 'express';
import * as path from 'path';
import { multerConfig } from 'src/_lib/config/multer.config';
import { UploadDto } from './upload.dto';

type UploadResult = {
  original?: {
    filename: string;
    originalName: string;
    path: string;
    url: string;
    size: number;
    mimetype: string;
    metadata: any;
  };
  processed?: {
    path: string;
    url: string;
  } | null;
  thumbnail?: {
    path: string;
    url: string;
  } | null;
  error?: string;
};

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const metadata = await this.uploadService.getImageMetadata(file.path);

      let processedImagePath: string | null = null;
      let thumbnailPath: string | null = null;

      // Process image if options are provided
      if (
        uploadDto.width ||
        uploadDto.height ||
        uploadDto.format ||
        uploadDto.quality
      ) {
        const options: ImageProcessingOptions = {
          width: uploadDto.width,
          height: uploadDto.height,
          quality: uploadDto.quality,
          format: uploadDto.format,
        };
        processedImagePath = await this.uploadService.processImage(
          file.path,
          options,
        );
      }

      // Create thumbnail if requested
      if (uploadDto.createThumbnail) {
        thumbnailPath = await this.uploadService.createThumbnail(file.path);
      }

      return {
        success: true,
        message: 'File uploaded successfully',
        data: {
          original: {
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            url: this.uploadService.getFileUrl(file.path),
            size: file.size,
            mimetype: file.mimetype,
            metadata,
          },
          processed: processedImagePath
            ? {
                path: processedImagePath,
                url: this.uploadService.getFileUrl(processedImagePath),
              }
            : null,
          thumbnail: thumbnailPath
            ? {
                path: thumbnailPath,
                url: this.uploadService.getFileUrl(thumbnailPath),
              }
            : null,
        },
      };
    } catch (error) {
      // Clean up uploaded file on error
      await this.uploadService.deleteFile(file.path);
      throw new BadRequestException(
        `Image processing failed: ${error.message}`,
      );
    }
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results: UploadResult[] = [];

    for (const file of files) {
      try {
        const metadata = await this.uploadService.getImageMetadata(file.path);

        let processedImagePath: string | null = null;
        let thumbnailPath: string | null = null;

        if (
          uploadDto.width ||
          uploadDto.height ||
          uploadDto.format ||
          uploadDto.quality
        ) {
          const options: ImageProcessingOptions = {
            width: uploadDto.width,
            height: uploadDto.height,
            quality: uploadDto.quality,
            format: uploadDto.format,
          };
          processedImagePath = await this.uploadService.processImage(
            file.path,
            options,
          );
        }

        if (uploadDto.createThumbnail) {
          thumbnailPath = await this.uploadService.createThumbnail(file.path);
        }

        results.push({
          original: {
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            url: this.uploadService.getFileUrl(file.path),
            size: file.size,
            mimetype: file.mimetype,
            metadata,
          },
          processed: processedImagePath
            ? {
                path: processedImagePath,
                url: this.uploadService.getFileUrl(processedImagePath),
              }
            : null,
          thumbnail: thumbnailPath
            ? {
                path: thumbnailPath,
                url: this.uploadService.getFileUrl(thumbnailPath),
              }
            : null,
        });
      } catch (error) {
        await this.uploadService.deleteFile(file.path);
        results.push({
          error: `Failed to process ${file.originalname}: ${error.message}`,
        });
      }
    }

    return {
      success: true,
      message: 'Files processed',
      data: results,
    };
  }

  @Get('files/:filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join('./uploads', filename);
    return res.sendFile(path.resolve(filePath));
  }

  @Get('processed/:filename')
  async serveProcessedFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = path.join('./uploads/processed', filename);
    return res.sendFile(path.resolve(filePath));
  }
}
