import { supabase } from './supabaseClient';

const BUCKET_NAME = 'client-files';

export const fileService = {
  async uploadFile(file, clientId, description = '') {
    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `client-${clientId}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get file URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

      // Store file metadata in database
      const { data, error: dbError } = await supabase
        .from('files')
        .insert({
          client_id: clientId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: (await supabase.auth.getUser()).data.user.id,
          description,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  async getClientFiles(clientId) {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  },

  async deleteFile(fileId) {
    try {
      // First get the file data from the files table
      const { data: fileData, error: fetchError } = await supabase
        .from('files')
        .select('file_path')
        .eq('id', fileId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([fileData.file_path]);

      if (storageError) throw storageError;

      // Delete from files table
      const { error: deleteError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (deleteError) throw deleteError;

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  async getFileUrl(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 3600); // URL valid for 1 hour

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error generating file URL:', error);
      throw error;
    }
  },
};
