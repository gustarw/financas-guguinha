# Configuração na Vercel

## Passo a Passo para Adicionar as Chaves do Supabase

### 1. Acesse o Painel da Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione o projeto **financas-guguinha** (ou o nome do seu projeto)

### 2. Adicione as Variáveis de Ambiente

1. No painel do projeto, clique em **Settings**
2. No menu lateral, clique em **Environment Variables**
3. Clique no botão **Add New** para adicionar cada variável:

#### Variável 1: SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Value:** `https://ihywqcbyknqwztgnfdub.supabase.co`
- **Environment:** Selecione todas (Production, Preview, Development)
- Clique em **Save**

#### Variável 2: SUPABASE_KEY
- **Name:** `SUPABASE_KEY`
- **Value:** `sb_publishable_rmo3yEOjYTGjKwrMCa-skw_aS1X02Fl`
- **Environment:** Selecione todas (Production, Preview, Development)
- Clique em **Save**

### 3. Faça o Redeploy (se necessário)

1. Após adicionar as variáveis, vá para a aba **Deployments**
2. Clique nos três pontos (...) do deployment mais recente
3. Selecione **Redeploy**
4. Ou faça um novo commit e push para o GitHub - a Vercel fará o deploy automaticamente

### 4. Verificar se Funcionou

Após o deploy, o arquivo `config.js` será gerado automaticamente durante o build com as credenciais das variáveis de ambiente.

## Como Funciona

- O script `build.js` é executado durante o build na Vercel
- Ele lê as variáveis de ambiente `SUPABASE_URL` e `SUPABASE_KEY`
- Gera automaticamente o arquivo `config.js` com essas credenciais
- O site funciona normalmente com as credenciais configuradas

## Importante

- As variáveis de ambiente são seguras e não aparecem no código
- O arquivo `config.js` gerado não é commitado no git
- Cada ambiente (Production, Preview, Development) pode ter valores diferentes se necessário

