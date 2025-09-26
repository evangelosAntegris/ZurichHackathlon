// File Upload Service for UBS Customer Service Application
// Handles all file upload operations including validation, progress tracking, and storage

// Uncomment when ready to use Supabase
// import { createClient } from '@supabase/supabase-js'

export interface FileUploadOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  folder?: string
  generateThumbnail?: boolean
  onProgress?: (progress: number) => void
  onError?: (error: string) => void
}

export interface UploadResult {
  success: boolean
  fileUrl?: string
  fileName?: string
  fileSize?: number
  error?: string
  thumbnailUrl?: string
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export class FileUploadService {
  // Uncomment when ready to use Supabase
  // private supabase = createClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // );

  private readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB
  private readonly DEFAULT_ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
  ]

  /**
   * Validate file before upload
   */
  validateFile(file: File, options: FileUploadOptions = {}): FileValidationResult {
    const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE
    const allowedTypes = options.allowedTypes || this.DEFAULT_ALLOWED_TYPES

    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds ${this.formatFileSize(maxSize)} limit`,
      }
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`,
      }
    }

    // Check for empty file
    if (file.size === 0) {
      return {
        isValid: false,
        error: "File is empty",
      }
    }

    return { isValid: true }
  }

  /**
   * Upload single file
   */
  async uploadFile(file: File, options: FileUploadOptions = {}): Promise<UploadResult> {
    try {
      // Validate file first
      const validation = this.validateFile(file, options)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        }
      }

      // Mock implementation - replace with actual Supabase upload
      return await this.mockUploadFile(file, options)

      // Uncomment when ready to use Supabase
      // return await this.supabaseUploadFile(file, options);
    } catch (error) {
      console.error("File upload error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: File[], options: FileUploadOptions = {}): Promise<UploadResult[]> {
    const results: UploadResult[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Update progress for batch upload
      if (options.onProgress) {
        const progress = (i / files.length) * 100
        options.onProgress(progress)
      }

      const result = await this.uploadFile(file, {
        ...options,
        onProgress: undefined, // Don't pass individual progress for batch
      })

      results.push(result)
    }

    // Final progress update
    if (options.onProgress) {
      options.onProgress(100)
    }

    return results
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileName: string, folder?: string): Promise<boolean> {
    try {
      // Mock implementation
      console.log(`[MOCK] Deleting file: ${fileName} from folder: ${folder || "root"}`)
      return true

      // Uncomment when ready to use Supabase
      // const filePath = folder ? `${folder}/${fileName}` : fileName;
      // const { error } = await this.supabase.storage
      //   .from('uploads')
      //   .remove([filePath]);
      //
      // if (error) {
      //   console.error('Delete error:', error);
      //   return false;
      // }
      //
      // return true;
    } catch (error) {
      console.error("File deletion error:", error)
      return false
    }
  }

  /**
   * Get file URL
   */
  async getFileUrl(fileName: string, folder?: string): Promise<string | null> {
    try {
      // Mock implementation
      const mockUrl = `https://mock-storage.supabase.co/storage/v1/object/public/uploads/${folder ? folder + "/" : ""}${fileName}`
      return mockUrl

      // Uncomment when ready to use Supabase
      // const filePath = folder ? `${folder}/${fileName}` : fileName;
      // const { data } = this.supabase.storage
      //   .from('uploads')
      //   .getPublicUrl(filePath);
      //
      // return data.publicUrl;
    } catch (error) {
      console.error("Get file URL error:", error)
      return null
    }
  }

  /**
   * Generate thumbnail for images
   */
  async generateThumbnail(file: File, maxWidth = 200): Promise<string | null> {
    if (!file.type.startsWith("image/")) {
      return null
    }

    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.8))
      }

      img.onerror = () => resolve(null)
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Mock upload implementation for development
   */
  private async mockUploadFile(file: File, options: FileUploadOptions): Promise<UploadResult> {
    // Simulate upload progress
    if (options.onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        options.onProgress(i)
      }
    }

    const fileName = `${Date.now()}-${file.name}`
    const folder = options.folder || "uploads"
    const mockUrl = `https://mock-storage.supabase.co/storage/v1/object/public/uploads/${folder}/${fileName}`

    let thumbnailUrl: string | undefined
    if (options.generateThumbnail && file.type.startsWith("image/")) {
      thumbnailUrl = (await this.generateThumbnail(file)) || undefined
    }

    console.log(`[MOCK] Uploaded file: ${fileName} to folder: ${folder}`)

    return {
      success: true,
      fileUrl: mockUrl,
      fileName,
      fileSize: file.size,
      thumbnailUrl,
    }
  }

  /**
   * Actual Supabase upload implementation (commented out)
   */
  // private async supabaseUploadFile(file: File, options: FileUploadOptions): Promise<UploadResult> {
  //   const fileName = `${Date.now()}-${file.name}`;
  //   const folder = options.folder || 'uploads';
  //   const filePath = `${folder}/${fileName}`;
  //
  //   // Upload file to Supabase Storage
  //   const { data, error } = await this.supabase.storage
  //     .from('uploads')
  //     .upload(filePath, file, {
  //       cacheControl: '3600',
  //       upsert: false
  //     });
  //
  //   if (error) {
  //     throw new Error(`Upload failed: ${error.message}`);
  //   }
  //
  //   // Get public URL
  //   const { data: urlData } = this.supabase.storage
  //     .from('uploads')
  //     .getPublicUrl(filePath);
  //
  //   let thumbnailUrl: string | undefined;
  //   if (options.generateThumbnail && file.type.startsWith('image/')) {
  //     thumbnailUrl = await this.generateThumbnail(file) || undefined;
  //   }
  //
  //   return {
  //     success: true,
  //     fileUrl: urlData.publicUrl,
  //     fileName,
  //     fileSize: file.size,
  //     thumbnailUrl
  //   };
  // }

  /**
   * Utility function to format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(fileName: string): string {
    return fileName.split(".").pop()?.toLowerCase() || ""
  }

  /**
   * Check if file is an image
   */
  isImageFile(file: File): boolean {
    return file.type.startsWith("image/")
  }

  /**
   * Check if file is a document
   */
  isDocumentFile(file: File): boolean {
    const documentTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
    ]
    return documentTypes.includes(file.type)
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService()
