/**
 * Lógica de Seleção de Embalagem - DDM Indústria
 * @param {Array} items - Itens do carrinho (devem conter nu_comprimento, nu_largura, nu_altura, nu_peso e nu_quantidade)
 * @param {Array} availableBoxes - Lista de registros da tb_embalagem vindos do banco
 */
export const findBestBox = (items, availableBoxes) => {
    if (!items || items.length === 0 || !availableBoxes || availableBoxes.length === 0) {
        return null;
    }

    // 1. Calcular Volume Total e Peso Total do Pedido
    let totalVolumeRequired = 0;
    let totalProductsWeight = 0;

    items.forEach(item => {
        // Volume unitário em mm³ ou cm³ (mantendo a unidade do banco)
        const unitVolume = Number(item.nu_comprimento) * Number(item.nu_largura) * Number(item.nu_altura);
        totalVolumeRequired += unitVolume * Number(item.nu_quantidade);
        totalProductsWeight += Number(item.nu_peso) * Number(item.nu_quantidade);
    });

    // 2. Filtrar apenas embalagens ativas e ordenar da menor para a maior por volume
    const sortedBoxes = availableBoxes
        .filter(box => box.st_ativo === 'S')
        .sort((a, b) => {
            const volA = Number(a.nu_comprimento) * Number(a.nu_largura) * Number(a.nu_altura);
            const volB = Number(b.nu_comprimento) * Number(b.nu_largura) * Number(b.nu_altura);
            return volA - volB;
        });

    // 3. Encontrar a primeira caixa que caiba o volume e suporte o peso
    const selectedBox = sortedBoxes.find(box => {
        const boxCapacityVolume = Number(box.nu_comprimento) * Number(box.nu_largura) * Number(box.nu_altura);
        const supportsWeight = Number(box.nu_peso_maximo) >= totalProductsWeight;
        const fitsVolume = boxCapacityVolume >= totalVolumeRequired;

        return supportsWeight && fitsVolume;
    });

    // 4. Se não encontrar uma caixa que caiba tudo, retorna a maior disponível 
    // (No backend, isso sinalizaria a necessidade de dividir em 2 volumes)
    return selectedBox || sortedBoxes[sortedBoxes.length - 1];
};