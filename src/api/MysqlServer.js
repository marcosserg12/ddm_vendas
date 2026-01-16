const BASE_URL = 'http://localhost:3001/api';
const IMG_BASE_URL = 'http://localhost:3001';

const apiRequest = async (endpoint, method = 'GET', data = null, formData = null) => {
    const token = localStorage.getItem('ddm_token');
    const headers = { 'Authorization': token ? `Bearer ${token}` : '' };

    // Se não for FormData (arquivo), define JSON
    if (!formData) headers['Content-Type'] = 'application/json';

    const config = { method, headers };
    if (data) config.body = JSON.stringify(data);
    if (formData) config.body = formData;

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    try {
        const response = await fetch(`${BASE_URL}${cleanEndpoint}`, config);

        if (response.status === 401) {
            localStorage.removeItem('ddm_token');
            localStorage.removeItem('ddm_user');
            window.location.href = '/login';
            return;
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
            const text = await response.text();
            if (!text && response.ok) return {};
            throw new Error(text || `Erro na comunicação: ${response.status}`);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        throw error;
    }
};

export const __ddmDatabase = {
    BASE_URL,
    IMG_URL: IMG_BASE_URL,

    entities: {
        auth: {
            login: (identifier, senha) => apiRequest('/login', 'POST', { identifier, senha }),
            register: (data) => apiRequest('/usuarios/registrar', 'POST', data),
        },
        Produtos: {
            list: () => apiRequest('/produtos'),
            getById: (id) => apiRequest(`/produtos/${id}`),
            create: (data) => apiRequest('/produtos', 'POST', data),
            update: (id, data) => apiRequest(`/produtos/${id}`, 'PUT', data),
            delete: (id) => apiRequest(`/produtos/${id}`, 'DELETE'),
        },
        ProdutoImagens: {
            upload: (formData) => apiRequest('/admin/upload-product-image', 'POST', null, formData),
            delete: (id) => apiRequest(`/produto_imagens/${id}`, 'DELETE'),
            setAsMain: (id_img, id_prod) => apiRequest(`/produto_imagens/${id_img}/capa`, 'PUT', { id_produto: id_prod }),
            listByProduct: (id) => apiRequest(`/produtos/${id}/imagens`),
        },
        Compatibilidade: {
            listByProduct: (id) => apiRequest(`/produtos/${id}/compatibilidade`),
            save: (id_produto, modelos_ids) => apiRequest(`/produtos/${id_produto}/compatibilidade`, 'POST', { modelos_ids })
        },

        Carrinho: {
            list: () => apiRequest('/carrinho'),
            add: (data) => apiRequest('/carrinho', 'POST', data),
            update: (id, data) => apiRequest(`/carrinho/${id}`, 'PUT', data),
            delete: (id) => apiRequest(`/carrinho/${id}`, 'DELETE'),
        },

        // --- ADICIONADO PARA O CHECKOUT (Endereços) ---
        Ufs: {
            list: () => apiRequest('/estados')
        },
        Municipios: {
            listByUf: (idUf) => apiRequest(`/municipios/${idUf}`)
        },
        // ----------------------------------------------

        Marcas: { list: () => apiRequest('/marcas') },
        Modelos: { list: () => apiRequest('/modelos') },
        Series: { list: () => apiRequest('/series') },
        Categoria: { list: () => apiRequest('/categoria') },

        Vendas: {
            list: () => apiRequest('/vendas'),
            create: (data) => apiRequest('/vendas', 'POST', data),
        },
        VendaProdutos: { list: () => apiRequest('/admin/order-items') },

        Enderecos: {
            list: () => apiRequest('/enderecos'),
            create: (data) => apiRequest('/enderecos', 'POST', data),
        },
        Auxiliary: { getList: (table) => apiRequest(`/${table}`).catch(() => []) },

        Embalagens: {
            list: () => apiRequest('/embalagem'),
            create: (data) => apiRequest('/embalagem', 'POST', data),
            update: (id, data) => apiRequest(`/embalagem/${id}`, 'PUT', data),
            delete: (id) => apiRequest(`/embalagem/${id}`, 'DELETE'),
        }
    }
};

export const getFullImageUrl = (path) => {
    if (!path) return 'https://placehold.co/400x400?text=Sem+Imagem';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${IMG_BASE_URL}${cleanPath}`;
};