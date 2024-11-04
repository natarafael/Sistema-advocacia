# MR Advogados - Sistema de Gerenciamento para Escritório de Advocacia

Uma aplicação desktop desenvolvida em Electron + React para gerenciar um escritório de advocacia, fornecendo ferramentas para gestão de clientes, documentos, agendamentos e controle financeiro.

## Funcionalidades

### Gestão de Usuários

- Sistema de autenticação completo
- Gerenciamento de perfis de advogados
- Controle de sessão e atividades

### Gestão de Clientes

- Cadastro completo de clientes com informações detalhadas
- Edição e atualização de dados
- Visualização organizada de informações
- Busca e filtragem de clientes
- Exclusão de clientes com remoção em cascata

### Gestão de Documentos

- Sistema de templates para geração de documentos
- Upload e download de arquivos
- Organização de documentos por cliente
- Geração automática de documentos com dados do cliente

### Agendamentos

- Calendário interativo para gerenciamento de compromissos
- Visualização diária, semanal e mensal
- Registro de atendimentos por cliente
- Histórico de atendimentos

### Controle Financeiro

- Criação de planos de pagamento
- Gestão de parcelas
- Registro de pagamentos
- Histórico financeiro por cliente
- Controle de valores recebidos e pendentes

## Tecnologias Utilizadas

- **Electron**: Framework para desenvolvimento desktop
- **React**: Biblioteca para construção da interface
- **Supabase**: Backend as a Service para autenticação e banco de dados
- **Tailwind CSS**: Framework CSS para estilização
- **Material React Table**: Componente para tabelas interativas
- **FullCalendar**: Biblioteca para calendário
- **React Hook Form**: Gerenciamento de formulários
- **Yup**: Validação de dados
- **HeadlessUI**: Componentes UI acessíveis

## Requisitos do Sistema

- Node.js (versão 14.x ou superior)
- npm (versão 7.x ou superior)

## Instalação e Execução

1. Clone o repositório:

```bash
git clone [url-do-repositorio]
```

2. Instale as dependências:

```bash
npm install
```

3. Execute em modo desenvolvimento:

```bash
npm start
```

4. Para criar o executável:

```bash
npm run package
```

## Estrutura do Banco de Dados

O sistema utiliza o Supabase como banco de dados com as seguintes tabelas principais:

- **users**: Informações dos usuários/advogados
- **clients**: Dados dos clientes
- **templates**: Templates de documentos
- **files**: Arquivos e documentos
- **appointments**: Agendamentos e atendimentos
- **payment_plans**: Planos de pagamento
- **installments**: Parcelas dos pagamentos
- **payment_history**: Histórico de pagamentos

## Segurança

- Autenticação via Supabase
- Row Level Security (RLS) implementado
- Controle de sessão
- Backup automático de dados

## Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença [MIT](LICENSE).

## Contato

Seu Nome - [seu-email@exemplo.com](mailto:seu-email@exemplo.com)

Link do Projeto: [https://github.com/seu-usuario/seu-repositorio](https://github.com/seu-usuario/seu-repositorio)

## Agradecimentos

- [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [FullCalendar](https://fullcalendar.io/)
