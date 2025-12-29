// Configuração do Supabase
const SUPABASE_URL = 'https://ihywqcbyknqwztgnfdub.supabase.co';
const SUPABASE_KEY = 'sb_publishable_rmo3yEOjYTGjKwrMCa-skw_aS1X02Fl';

// Inicializar Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Array para armazenar os ganhos
let expenses = [];

// Carregar ganhos do Supabase ao iniciar
async function loadExpenses() {
    try {
        const { data, error } = await supabase
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
            status: item.status
        }));
        
        renderExpenses();
        updateSummary();
    } catch (error) {
        console.error('Erro ao carregar saques:', error);
    }
}

// Adicionar novo ganho
async function addExpense(description, amount) {
    try {
        const { data, error } = await supabase
            .from('saques')
            .insert([
                {
                    description: description,
                    amount: parseFloat(amount),
                    type: 'saque-processando',
                    status: 'processando'
                }
            ])
            .select()
            .single();
        
        if (error) {
            console.error('Erro ao adicionar saque:', error);
            return;
        }
        
        const expense = {
            id: data.id,
            description: data.description,
            amount: parseFloat(data.amount),
            type: data.type,
            status: data.status
        };
        
        expenses.push(expense);
        renderExpenses();
        updateSummary();
    } catch (error) {
        console.error('Erro ao adicionar saque:', error);
    }
}

// Alternar entre ganho e saque processando
async function toggleToSaque(id) {
    const expense = expenses.find(e => e.id === id);
    if (expense && expense.type === 'ganho') {
        try {
            const { error } = await supabase
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
    try {
        const { error } = await supabase
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
    const expense = expenses.find(e => e.id === id);
    if (expense && expense.type === 'saque-processando' && expense.status === 'processando') {
        try {
            const { error } = await supabase
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
                        ${isGanho ? 'Recebido por: Gustavo' : 'Saque'}
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

// Limpar todos os ganhos
async function clearAllExpenses() {
    if (confirm('Tem certeza que deseja limpar todos os ganhos?')) {
        try {
            const { error } = await supabase
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

// Event listeners
document.getElementById('expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const description = document.getElementById('description').value.trim();
    const amount = document.getElementById('amount').value;
    
    if (description && amount > 0) {
        addExpense(description, amount);
        
        // Limpar formulário
        document.getElementById('expenseForm').reset();
        
        // Focar no campo de descrição
        document.getElementById('description').focus();
    }
});

document.getElementById('clearAll').addEventListener('click', clearAllExpenses);

// Carregar ganhos ao iniciar (aguardar Supabase carregar)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(loadExpenses, 100);
    });
} else {
    setTimeout(loadExpenses, 100);
}

