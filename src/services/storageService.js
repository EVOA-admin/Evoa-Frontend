import { supabase } from '../config/supabase';

const storageService = {
    /**
     * Upload a file to Supabase Storage
     * @param {File} file - The file to upload
     * @param {string} bucket - The bucket name (e.g., 'startups', 'documents')
     * @param {string} path - The path/filename
     * @returns {Promise<string>} - The public URL of the uploaded file
     */
    uploadFile: async (file, bucket, path) => {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                throw error;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(data.path);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    /**
     * Delete a file from Supabase Storage
     * @param {string} bucket
     * @param {string} path
     */
    deleteFile: async (bucket, path) => {
        try {
            const { error } = await supabase.storage
                .from(bucket)
                .remove([path]);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
};

export const uploadFile = storageService.uploadFile;
export const deleteFile = storageService.deleteFile;

export default storageService;
