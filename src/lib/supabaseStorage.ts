import { supabase, isSupabaseConfigured } from './supabase';

export const MEDIA_BUCKET = 'tamanna-media';

export interface StorageFileItem {
  name: string;
  id?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  last_accessed_at?: string | null;
  metadata?: Record<string, any> | null;
  publicUrl: string;
  folder: string;
  size?: number;
}

/**
 * Ensures that the tamanna-media storage bucket exists.
 */
export async function ensureStorageBucket(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn('Could not list storage buckets:', error.message);
      return false;
    }
    const exists = buckets?.some(b => b.name === MEDIA_BUCKET);
    if (!exists) {
      const { error: createError } = await supabase.storage.createBucket(MEDIA_BUCKET, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
      });
      if (createError) {
        console.warn('Bucket creation notice:', createError.message);
      }
    }
    return true;
  } catch (err) {
    console.error('ensureStorageBucket error:', err);
    return false;
  }
}

/**
 * Uploads a File or Blob to Supabase Storage and returns the public CDN URL.
 * Falls back to base64 if storage is unavailable.
 */
export async function uploadToSupabaseStorage(
  file: File | Blob,
  folder: string = 'products',
  customFileName?: string
): Promise<{ url: string; path?: string; error?: string; isSupabase?: boolean }> {
  try {
    const fileExt = (file as File).name 
      ? (file as File).name.split('.').pop()?.toLowerCase() || 'jpg'
      : (file.type ? file.type.split('/')[1] || 'jpg' : 'jpg');

    const cleanFolderName = folder.replace(/^\/+|\/+$/g, '');
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const fileName = customFileName 
      ? `${customFileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      : `${cleanFolderName}_${uniqueId}.${fileExt}`;
    
    const filePath = `${cleanFolderName}/${fileName}`;

    if (!isSupabaseConfigured()) {
      const base64 = await blobToBase64(file);
      return { url: base64, error: 'Supabase not configured, using local memory' };
    }

    // Ensure bucket exists or proceed
    await ensureStorageBucket();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg'
      });

    if (error) {
      console.warn('Supabase storage upload error, falling back to base64:', error.message);
      const base64 = await blobToBase64(file);
      return { url: base64, error: error.message, isSupabase: false };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(filePath);

    return { 
      url: urlData.publicUrl, 
      path: filePath, 
      isSupabase: true 
    };
  } catch (err: any) {
    console.error('Storage upload exception:', err);
    const base64 = await blobToBase64(file);
    return { url: base64, error: err?.message || 'Upload failed', isSupabase: false };
  }
}

/**
 * Lists all uploaded media files in a specific folder or all folders
 */
export async function listSupabaseStorageFiles(folder: string = 'products'): Promise<StorageFileItem[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .list(cleanFolder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error || !data) {
      console.warn('List files error:', error?.message);
      return [];
    }

    return data
      .filter(item => item.name && !item.name.startsWith('.'))
      .map(item => {
        const filePath = cleanFolder ? `${cleanFolder}/${item.name}` : item.name;
        const { data: urlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(filePath);
        return {
          name: item.name,
          id: item.id,
          updated_at: item.updated_at,
          created_at: item.created_at,
          metadata: item.metadata,
          publicUrl: urlData.publicUrl,
          folder: cleanFolder,
          size: item.metadata?.size || 0
        };
      });
  } catch (err) {
    console.error('listSupabaseStorageFiles error:', err);
    return [];
  }
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteFromSupabaseStorage(filePath: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([filePath]);
    return !error;
  } catch (err) {
    console.error('deleteFromSupabaseStorage error:', err);
    return false;
  }
}

/**
 * Helper to convert Blob or File to Base64 String
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsDataURL(blob);
  });
}
