# Finanças do guguinha

Aplicação web para gerenciamento de ganhos e saques de criptomoedas.

## Funcionalidades

- Adicionar ganhos/saques
- Marcar saques como processando ou concluído
- Visualizar resumo financeiro
- Dados salvos no Supabase

## Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)
- Supabase (Backend/Database)

## Configuração

1. Clone o repositório
2. Copie o arquivo `config.js.example` para `config.js`:
   ```bash
   cp config.js.example config.js
   ```
3. Edite o arquivo `config.js` e preencha com suas credenciais do Supabase:
   - `SUPABASE_URL`: URL do seu projeto Supabase
   - `SUPABASE_KEY`: Chave pública (publishable key) do Supabase
4. Abra o arquivo `index.html` no navegador ou use um servidor local
5. Os dados são salvos automaticamente no Supabase

**Importante:** O arquivo `config.js` não é commitado no git por segurança. Certifique-se de criar este arquivo antes de usar a aplicação.

## Deploy na Vercel

### Configuração das Variáveis de Ambiente

1. Acesse o painel da Vercel do seu projeto
2. Vá em **Settings** → **Environment Variables**
3. Adicione as seguintes variáveis de ambiente:
   - `SUPABASE_URL`: URL do seu projeto Supabase
   - `SUPABASE_KEY`: Chave pública (publishable key) do Supabase

### Deploy

O projeto está configurado para gerar automaticamente o arquivo `config.js` durante o build a partir das variáveis de ambiente configuradas na Vercel.

1. Faça push do código para o GitHub
2. A Vercel detectará automaticamente as mudanças
3. Durante o build, o script `build.js` será executado e gerará o `config.js` com as credenciais

**Importante:** Certifique-se de que as variáveis de ambiente estão configuradas na Vercel antes de fazer o deploy, caso contrário o build falhará.

