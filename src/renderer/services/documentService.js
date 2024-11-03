import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { supabase } from './supabaseClient';

export const documentService = {
  async generateDocument(templateId, clientId, userId) {
    try {
      // 1. Fetch template file from Supabase storage
      const { data: template } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single();

      const { data: templateFile, error: downloadError } =
        await supabase.storage.from('templates').download(template.file_path);

      if (downloadError) throw downloadError;

      // 2. Fetch client data
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      // 3. Fetch lawyer data
      const { data: lawyer, error: lawyerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (lawyerError) throw lawyerError;

      // 4. Prepare data for template
      const data = {
        nomeCliente: `${client.first_name} ${client.last_name}`,
        nacionalidade: client.nationality,
        estadoCivil: client.marital_status,
        numeroRG: client.rg,
        expeditorRG: client.expeditor_rg,
        numeroCPF: client.cpf,
        enderecoCompleto: `${client.address}, nº ${client.address_number}, ${client.neighborhood}, ${client.city}/${client.state}`,
        nomeAdv: lawyer.name,
        numeroOAB: lawyer.oab_number,
        dataContrato: new Date().toLocaleDateString('pt-BR'),
      };

      // 5. Load template
      const zip = new PizZip(await templateFile.arrayBuffer());
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // 6. Render template
      doc.render(data);

      // 7. Generate file name
      const sanitizedTemplateName = template.name
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      const sanitizedClientName = `${client.first_name}_${client.last_name}`
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();

      const fileName = `${sanitizedTemplateName}_${sanitizedClientName}_${Date.now()}.docx`;
      const filePath = `client-${clientId}/${fileName}`;

      // 8. Get output
      const docBlob = doc.getZip().generate({
        type: 'blob',
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // 9. Save to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('client-files')
        .upload(filePath, docBlob);

      if (uploadError) throw uploadError;

      // 10. Create file record
      const { data: fileRecord, error: fileError } = await supabase
        .from('files')
        .insert([
          {
            client_id: clientId,
            file_name: fileName,
            file_path: filePath,
            file_type:
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            description: `Generated from template: ${template.name}`,
            uploaded_by: userId,
          },
        ])
        .select()
        .single();

      if (fileError) throw fileError;

      // 11. Trigger download
      saveAs(docBlob, fileName);

      return fileRecord;
    } catch (error) {
      console.error('Error generating document:', error);
      throw error;
    }
  },
};
