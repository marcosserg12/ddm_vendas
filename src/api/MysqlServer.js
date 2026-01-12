// src/api/MysqlServer.js

const BASE_URL = 'http://localhost:3001/api';
const IMG_BASE_URL = 'http://localhost:3001'; // URL para carregar as imagens no <img src="">

/**
 * Helper para simplificar as chamadas Fetch
 */
const apiRequest = async (endpoint, method = 'GET', data = null) => {
    const token = localStorage.getItem('ddm_token'); // Recupera o JWT salvo no login

    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '' 
        }
    };

    if (data) config.body = JSON.stringify(data);

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Se o token estiver expirado (401), desloga o usuário
    if (response.status === 401) {
        localStorage.removeItem('ddm_token');
        window.location.href = '/login';
    }

    return response.json();
};

export const __ddmDatabase = {
    BASE_URL,
    IMG_URL: IMG_BASE_URL,

    entities: {
        // --- AUTENTICAÇÃO ---
        auth: {
            login: (identifier, senha) => apiRequest('/login', 'POST', { identifier, senha }),
        },

        // --- PRODUTOS ---
        Produtos: {
            list: () => apiRequest('/produtos'),
            getById: (id) => apiRequest(`/produtos/${id}`),
            create: (data) => apiRequest('/produtos', 'POST', data),
            update: (id, data) => apiRequest(`/produtos/${id}`, 'PUT', data),
            delete: (id) => apiRequest(`/produtos/${id}`, 'DELETE'),
        },

        // --- IMAGENS (Sincronizado com o novo server.js) ---
        ProdutoImagens: {
            /**
             * @param {FormData} formData - Deve conter 'image', 'id_produto' e 'st_principal'
             */
            upload: (formData) => apiRequest('/admin/upload-product-image', 'POST', formData),
            
            delete: (id_imagem) => apiRequest(`/produto_imagens/${id_imagem}`, 'DELETE'),
            
            // Define qual imagem será a capa (st_principal = 'S')
            setAsMain: (id_imagem, id_produto) => apiRequest('/produto_imagens/set-main', 'PUT', { id_imagem, id_produto }),
        },

        // --- VENDAS ---
        Vendas: {
            list: () => apiRequest('/vendas'),
            getById: (id) => apiRequest(`/vendas/${id}`),
        },

        // --- ITENS DE VENDA (Para os Gráficos) ---
        VendaProdutos: {
            list: () => apiRequest('/admin/order-items'), // Ajuste para sua rota de itens
        },

        // --- DADOS AUXILIARES (Para os Selects do Form de Produto) ---
        Auxiliary: {
            getAll: () => apiRequest('/admin/auxiliary-data'),
            getCategorias: () => apiRequest('/categoria'),
            getMarcas: () => apiRequest('/marca'),
            getRoscas: () => apiRequest('/rosca'),
        },

        Embalagens: {
            list: () => apiRequest('/embalagem'),
            create: (data) => apiRequest('/embalagem', 'POST', data),
            update: (id, data) => apiRequest(`/embalagem/${id}`, 'PUT', data),
            delete: (id) => apiRequest(`/embalagem/${id}`, 'DELETE'),
        }
    }
};

/**
 * UTILITÁRIO: Formata o caminho da imagem para ser exibido no componente
 * Ex: getFullImageUrl('/uploads/products/1_1.jpg') -> 'http://localhost:3001/uploads/products/1_1.jpg'
 */
export const getFullImageUrl = (path) => {
    if (!path) return 'https://placehold.co/400x400?text=Sem+Imagem';
    if (path.startsWith('http')) return path;
    return `${IMG_BASE_URL}${path}`;
};