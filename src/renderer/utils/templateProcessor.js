export const FIELD_MAPPINGS = {
  // Client fields mapping
  nomeCliente: (client) =>
    client ? `${client.first_name || ''} ${client.last_name || ''}`.trim() : '',
  nacionalidade: (client) => client?.nationality || '',
  estadoCivil: (client) => client?.marital_status || '',
  numeroRG: (client) => client?.rg || '',
  expeditorRG: (client) => client?.expeditor_rg || '',
  numeroCPF: (client) => client?.cpf || '',
  enderecoCompleto: (client) =>
    client
      ? [
          client.address,
          client.address_number ? `nº ${client.address_number}` : '',
          client.neighborhood,
          client.city,
          client.state,
        ]
          .filter(Boolean)
          .join(', ')
      : '',

  // Lawyer fields mapping
  nomeAdv: (profile) => profile?.name || '',
  numeroOAB: (profile) => profile?.oab_number || '',

  // Document fields
  dataContrato: () => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('pt-BR', options);
  },
};

export const detectPlaceholders = (htmlContent) => {
  // First, remove the style tag and its contents
  const contentWithoutStyles = htmlContent.replace(
    /<style>[\s\S]*?<\/style>/g,
    '',
  );

  // Only look for placeholders in the actual content
  const placeholderRegex = /\{([^}]+)\}/g;
  const placeholders = new Set();
  let match;

  while ((match = placeholderRegex.exec(contentWithoutStyles)) !== null) {
    placeholders.add(match[1]);
  }

  // Validate placeholders against known fields
  const validPlaceholders = [];
  const invalidPlaceholders = [];

  placeholders.forEach((placeholder) => {
    if (FIELD_MAPPINGS[placeholder]) {
      validPlaceholders.push(placeholder);
    } else {
      invalidPlaceholders.push(placeholder);
    }
  });

  return {
    validPlaceholders,
    invalidPlaceholders,
    allPlaceholders: Array.from(placeholders),
  };
};
