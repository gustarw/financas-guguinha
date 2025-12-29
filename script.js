// Configuração do Supabase - carregada do arquivo config.js
// As credenciais são carregadas do arquivo config.js que não é commitado
const SUPABASE_URL = CONFIG?.SUPABASE_URL || '';
const SUPABASE_KEY = CONFIG?.SUPABASE_KEY || '';

// Validar se as credenciais foram carregadas
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Erro: Credenciais do Supabase não encontradas. Certifique-se de que o arquivo config.js existe e está configurado corretamente.');
}

// Inicializar Supabase - aguardar carregamento
let supabaseClient;
function initSupabase() {
    // Verificar se as credenciais estão disponíveis
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error('Erro: Credenciais do Supabase não configuradas. Verifique o arquivo config.js');
        return false;
    }
    
    // Verificar se o Supabase foi carregado via CDN
    // O Supabase cria um objeto global 'supabase' quando carregado via CDN
    try {
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            return true;
        }
        // Tentar também verificar se está disponível globalmente
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            return true;
        }
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
    }
    return false;
}

// Array para armazenar os ganhos
let expenses = [];

// Carregar ganhos do Supabase ao iniciar
async function loadExpenses() {
    if (!supabaseClient) {
        console.error('Supabase não inicializado');
        return;
    }
    try {
        const { data, error } = await supabaseClient
            .from('saques')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Erro ao carregar saques:', error);
            return;
        }
        
        expenses = data.map(item => ({
            id: item.id,
            description: item.description,
            amount: parseFloat(item.amount),
            type: item.type,
            status: item.status,
            saqueDate: item.saque_date || item.created_at
        }));
        
        renderExpenses();
        updateSummary();
    } catch (error) {
        console.error('Erro ao carregar saques:', error);
    }
}

// Adicionar novo ganho
async function addExpense(description, amount, saqueDate) {
    if (!supabaseClient) {
        alert('Erro: Supabase não inicializado. Por favor, recarregue a página.');
        console.error('Supabase não inicializado');
        return;
    }
    try {
        const { data, error } = await supabaseClient
            .from('saques')
            .insert([
                {
                    description: description,
                    amount: parseFloat(amount),
                    type: 'saque-processando',
                    status: 'processando',
                    saque_date: saqueDate
                }
            ])
            .select()
            .single();
        
        if (error) {
            console.error('Erro ao adicionar saque:', error);
            alert('Erro ao adicionar saque: ' + error.message);
            return;
        }
        
        if (!data) {
            console.error('Nenhum dado retornado ao adicionar saque');
            alert('Erro: Nenhum dado retornado ao adicionar saque');
            return;
        }
        
        const expense = {
            id: data.id,
            description: data.description,
            amount: parseFloat(data.amount),
            type: data.type,
            status: data.status,
            saqueDate: data.saque_date || data.created_at
        };
        
        expenses.push(expense);
        renderExpenses();
        updateSummary();
    } catch (error) {
        console.error('Erro ao adicionar saque:', error);
        alert('Erro ao adicionar saque: ' + error.message);
    }
}

// Alternar entre ganho e saque processando
async function toggleToSaque(id) {
    if (!supabaseClient) {
        console.error('Supabase não inicializado');
        return;
    }
    const expense = expenses.find(e => e.id === id);
    if (expense && expense.type === 'ganho') {
        try {
            const { error } = await supabaseClient
                .from('saques')
                .update({
                    type: 'saque-processando',
                    status: 'processando'
                })
                .eq('id', id);
            
            if (error) {
                console.error('Erro ao atualizar saque:', error);
                return;
            }
            
            expense.type = 'saque-processando';
            expense.status = 'processando';
            renderExpenses();
            updateSummary();
        } catch (error) {
            console.error('Erro ao atualizar saque:', error);
        }
    }
}


// Remover ganho
async function removeExpense(id) {
    if (!supabaseClient) {
        console.error('Supabase não inicializado');
        return;
    }
    try {
        const { error } = await supabaseClient
            .from('saques')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Erro ao remover saque:', error);
            return;
        }
        
        expenses = expenses.filter(expense => expense.id !== id);
        renderExpenses();
        updateSummary();
    } catch (error) {
        console.error('Erro ao remover saque:', error);
    }
}

// Atualizar status do saque para concluído
async function updateSaqueStatus(id) {
    if (!supabaseClient) {
        console.error('Supabase não inicializado');
        return;
    }
    const expense = expenses.find(e => e.id === id);
    if (expense && expense.type === 'saque-processando' && expense.status === 'processando') {
        try {
            const { error } = await supabaseClient
                .from('saques')
                .update({ status: 'concluido' })
                .eq('id', id);
            
            if (error) {
                console.error('Erro ao atualizar status do saque:', error);
                return;
            }
            
            expense.status = 'concluido';
            renderExpenses();
            updateSummary();
        } catch (error) {
            console.error('Erro ao atualizar status do saque:', error);
        }
    }
}

// Renderizar lista de ganhos
function renderExpenses() {
    const container = document.getElementById('expensesContainer');
    
    if (expenses.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum ganho adicionado ainda.</p>';
        return;
    }
    
    container.innerHTML = expenses.map(expense => {
        const isSaqueProcessando = expense.type === 'saque-processando' && expense.status === 'processando';
        const isSaqueConcluido = expense.type === 'saque-processando' && expense.status === 'concluido';
        const isGanho = expense.type === 'ganho';
        
        const statusBadge = isSaqueProcessando 
            ? '<span class="status-badge status-processando">Processando</span>'
            : isSaqueConcluido
            ? '<span class="status-badge status-concluido">Concluído</span>'
            : '';
        
        let actionButtons = '';
        if (isGanho) {
            actionButtons = `<button class="toggle-btn" onclick="toggleToSaque(${expense.id})">Marcar como Saque Processando</button>`;
        } else if (isSaqueProcessando) {
            actionButtons = `<button class="update-btn" onclick="updateSaqueStatus(${expense.id})">Marcar como Concluído</button>`;
        }
        
        return `
            <div class="expense-item ${isSaqueProcessando ? 'saque-processando' : ''} ${isSaqueConcluido ? 'saque-concluido' : ''}">
                <div class="expense-info">
                    <div class="expense-description">
                        ${expense.description}
                        ${statusBadge}
                    </div>
                    <div class="expense-details">
                        ${isGanho ? 'Recebido por: Gustavo' : 'Saque'} • ${formatDate(expense.saqueDate)}
                    </div>
                </div>
                <div class="expense-amount ${isSaqueProcessando ? 'amount-processando' : ''} ${isSaqueConcluido ? 'amount-concluido' : ''}">${formatCurrency(expense.amount)}</div>
                <div class="expense-actions">
                    ${actionButtons}
                    <button class="delete-btn" onclick="removeExpense(${expense.id})">Remover</button>
                </div>
            </div>
        `;
    }).join('');
}

// Calcular resumo
function updateSummary() {
    let total = 0;
    
    expenses.forEach(expense => {
        if (expense.type === 'ganho') {
            total += expense.amount;
        } else if (expense.type === 'saque-processando') {
            // Saque processando não conta no total
            // Quando concluído, adiciona ao total (valor positivo)
            if (expense.status === 'concluido') {
                total += expense.amount;
            }
        }
    });
    
    // Não permitir saldo negativo, mostrar 0 se ficar negativo
    total = Math.max(0, total);
    
    // Atualizar valores na tela
    document.getElementById('totalAmount').textContent = formatCurrency(total);
}

// Formatar moeda
function formatCurrency(value) {
    // Converter para número e garantir 2 casas decimais
    const num = parseFloat(value);
    const fixed = num.toFixed(2);
    
    // Separar parte inteira e decimal
    const parts = fixed.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Adicionar separadores de milhar (pontos)
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Retornar formatado: R$ 1.245,42
    return 'R$ ' + formattedInteger + ',' + decimalPart;
}

// Formatar data
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

// Limpar todos os ganhos
async function clearAllExpenses() {
    if (!supabaseClient) {
        console.error('Supabase não inicializado');
        return;
    }
    if (confirm('Tem certeza que deseja limpar todos os ganhos?')) {
        try {
            const { error } = await supabaseClient
                .from('saques')
                .delete()
                .neq('id', 0); // Deleta todos os registros
            
            if (error) {
                console.error('Erro ao limpar saques:', error);
                return;
            }
            
            expenses = [];
            renderExpenses();
            updateSummary();
        } catch (error) {
            console.error('Erro ao limpar saques:', error);
        }
    }
}

// Configurar event listeners
function setupEventListeners() {
    const expenseForm = document.getElementById('expenseForm');
    const clearAllBtn = document.getElementById('clearAll');
    
    if (expenseForm) {
        expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const description = document.getElementById('description').value.trim();
            const amount = document.getElementById('amount').value;
            const saqueDate = document.getElementById('saqueDate').value;
            
            if (description && amount > 0 && saqueDate) {
                addExpense(description, amount, saqueDate);
                
                // Limpar formulário
                expenseForm.reset();
                
                // Definir data padrão como hoje
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('saqueDate').value = today;
                
                // Focar no campo de descrição
                document.getElementById('description').focus();
            }
        });
    }
    
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllExpenses);
    }
}

// Definir data padrão como hoje
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const saqueDateInput = document.getElementById('saqueDate');
    if (saqueDateInput) {
        saqueDateInput.value = today;
    }
}

// Carregar ganhos ao iniciar (aguardar Supabase carregar)
function waitForSupabase() {
    if (initSupabase()) {
        setDefaultDate();
        setupEventListeners();
        loadExpenses();
    } else {
        setTimeout(waitForSupabase, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        waitForSupabase();
    });
} else {
    waitForSupabase();
}

