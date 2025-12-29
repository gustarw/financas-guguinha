// Script de build para gerar config.js a partir das variáveis de ambiente da Vercel
const fs = require('fs');
const path = require('path');

// Ler variáveis de ambiente
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

// Validar se as variáveis foram fornecidas
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY devem estar configuradas na Vercel');
    process.exit(1);
}

// Conteúdo do config.js
const configContent = `// Configuração do Supabase
// Este arquivo é gerado automaticamente durante o build a partir das variáveis de ambiente da Vercel
const CONFIG = {
    SUPABASE_URL: '${SUPABASE_URL}',
    SUPABASE_KEY: '${SUPABASE_KEY}'
};
`;

// Escrever o arquivo config.js
const configPath = path.join(__dirname, 'config.js');
fs.writeFileSync(configPath, configContent, 'utf8');

console.log('✓ config.js gerado com sucesso a partir das variáveis de ambiente');

