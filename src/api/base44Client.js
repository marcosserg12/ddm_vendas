const API_KEY = '5c87cdb0740046578350ab74ab4e3a7d';
const APP_ID = '695d8a5fcced15d131233c52';
const BASE_URL = `https://app.base44.com/api/apps/${APP_ID}`;

// Função auxiliar para fazer as chamadas (evita repetir código)
async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const headers = {
        'api_key': API_KEY,
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
    }

    return response.json();
}

export const base44 = {
    entities: {
        Product: {
            // Listar produtos (conforme seu código anterior esperava)
            list: async () => {
                return request('/entities/Product');
            },
            // Criar produto
            create: async (data) => {
                return request('/entities/Product', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            },
            // Atualizar produto
            update: async (id, data) => {
                return request(`/entities/Product/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
            },
            // Deletar produto
            delete: async (id) => {
                return request(`/entities/Product/${id}`, {
                    method: 'DELETE'
                });
            }
        },
        CartItem: {
            list: async () => {
                return request('/entities/CartItem');
            },
            create: async (data) => {
                return request('/entities/CartItem', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            },
            update: async (id, data) => {
                return request(`/entities/CartItem/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
            },
            delete: async (id) => {
                return request(`/entities/CartItem/${id}`, {
                    method: 'DELETE'
                });
            }
        },
        Order: {
            list: async () => {
                return request('/entities/Order');
            },
            create: async (data) => {
                return request('/entities/Order', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            },
            update: async (id, data) => {
                return request(`/entities/Order/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
            }
        }
    },
    // Adicionei isso pois seu código AdminProducts tentava fazer upload de imagem
    integrations: {
        Core: {
            UploadFile: async ({ file }) => {
                const formData = new FormData();
                formData.append('file', file);

                // Nota: O endpoint de upload geralmente é diferente.
                // Tentei deduzir, mas se der erro, precisaremos do código original de upload.
                const response = await fetch(`https://app.base44.com/api/storage/upload`, {
                    method: 'POST',
                    headers: {
                        'api_key': API_KEY
                    },
                    body: formData
                });
                return response.json();
            }
        }
    }
};