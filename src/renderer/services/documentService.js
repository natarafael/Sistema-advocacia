import { supabase } from './supabaseClient';
import { FIELD_MAPPINGS } from '../utils/templateProcessor';
import html2pdf from 'html2pdf.js';

export const documentService = {
  async generateDocument(templateId, clientId, userId) {
    try {
      // 1. Fetch template
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;
      if (!template) throw new Error('Template not found');

      // 2. Fetch client data
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      if (!client) throw new Error('Client not found');

      // 3. Fetch lawyer data
      const { data: lawyer, error: lawyerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (lawyerError) throw lawyerError;
      if (!lawyer) throw new Error('Lawyer profile not found');

      // Check required fields
      const requiredClientFields = ['first_name', 'last_name', 'cpf', 'rg'];
      const missingFields = requiredClientFields.filter(
        (field) => !client[field],
      );

      if (missingFields.length > 0) {
        throw new Error(
          `Missing required client information: ${missingFields.join(', ')}`,
        );
      }

      if (!lawyer.oab_number) {
        throw new Error('Missing lawyer OAB number');
      }

      // 4. Replace placeholders in template
      let documentHtml = template.html_content;
      for (const [key, valueFunction] of Object.entries(FIELD_MAPPINGS)) {
        try {
          const placeholder = `{${key}}`;
          let value;

          // Determine if it's a client, lawyer, or date field and get the value
          if (
            key.startsWith('nome') ||
            key.includes('CPF') ||
            key.includes('RG')
          ) {
            value = valueFunction(client);
          } else if (key.includes('Adv') || key.includes('OAB')) {
            value = valueFunction(lawyer);
          } else {
            value = valueFunction();
          }

          documentHtml = documentHtml.replace(
            new RegExp(placeholder, 'g'),
            value,
          );
        } catch (error) {
          console.error(`Error processing field ${key}:`, error);
          throw new Error(`Error processing field ${key}`);
        }
      }

      // Process paragraphs and spacing
      documentHtml = documentHtml
        // Ensure double line breaks between paragraphs
        .replace(/\n\n/g, '</p><p>')
        // Convert single line breaks to <br>
        .replace(/\n/g, '<br>')
        // Wrap in paragraphs if not already
        .replace(/^(.+)$/m, '<p>$1</p>');

      // Add header and footer if they exist
      if (template.header_html) {
        documentHtml = `<div class="header">${template.header_html}</div>${documentHtml}`;
      }

      if (template.footer_html) {
        documentHtml = `${documentHtml}<div class="footer">${template.footer_html}</div>`;
      }

      // Add signature line
      documentHtml += `
        <div class="signature-line">
        <p>_______________________________</p>
        <p>${client.first_name} ${client.last_name}</p>
        </div>
        `;

      // 5. Convert to PDF
      const pdfBlob = await this.convertToPdf(documentHtml);

      // 6. Save to Supabase Storage
      const fileName = `documento_${Date.now()}.pdf`;
      const filePath = `client-${clientId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('client-files')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
        });

      if (uploadError) throw uploadError;

      // 7. Create file record in the files table
      const { data: fileRecord, error: fileError } = await supabase
        .from('files')
        .insert([
          {
            client_id: clientId,
            file_name: fileName,
            file_path: filePath,
            file_type: 'application/pdf',
            description: `Generated from template: ${template.name}`,
            uploaded_by: userId,
          },
        ])
        .select()
        .single();

      if (fileError) throw fileError;

      return fileRecord;
    } catch (error) {
      console.error('Error generating document:', error);
      throw error;
    }
  },

  async convertToPdf(htmlContent) {
    const opts = {
      margin: 20,
      filename: 'document.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
      pagebreak: { mode: 'css' },
    };

    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
            }
            
            p {
              margin: 1em 0;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              page-break-after: avoid;
            }
            
            .footer {
              text-align: center;
              margin-top: 30px;
              page-break-before: avoid;
            }
            
            .content {
              min-height: 800px;  /* Adjust based on your needs */
            }
            
            strong, b {
              font-weight: bold;
            }
            
            /* Preserve empty paragraphs for spacing */
            p:empty {
              height: 1em;
            }
            
            /* Force page breaks where needed */
            .page-break {
              page-break-after: always;
            }
            
            /* Proper signature spacing */
            .signature-line {
              margin-top: 50px;
              text-align: center;
            }
            
            /* Preserve whitespace */
            .preserve-whitespace {
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body class="preserve-whitespace">
          ${htmlContent}
        </body>
      </html>
    `;

    try {
      // Create a temporary container
      const container = document.createElement('div');
      container.innerHTML = styledHtml;
      document.body.appendChild(container);

      // Convert to PDF
      const pdf = await html2pdf().from(container).set(opts).outputPdf('blob');

      // Clean up
      document.body.removeChild(container);

      return pdf;
    } catch (error) {
      console.error('Error converting to PDF:', error);
      throw error;
    }
  },
};
