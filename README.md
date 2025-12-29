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

## Deploy

Este projeto pode ser facilmente deployado na Vercel ou qualquer serviço de hospedagem estática.

