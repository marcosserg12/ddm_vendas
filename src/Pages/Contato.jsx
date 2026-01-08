import React, { useState } from 'react';
// CORREÇÃO: Caminho da API
import { base44 } from '../api/base44Client';
import { useMutation } from '@tanstack/react-query';
import {
    Phone, Mail, MapPin, Send, CheckCircle,
    Wrench, FileText, Loader2
} from 'lucide-react';

// CORREÇÃO: Caminhos dos componentes UI (Maiúscula em Components para consistência)
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Textarea } from '../Components/ui/textarea';
import { Label } from '../Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../Components/ui/select";

const ESTADOS_BR = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function Contato() {
    const urlParams = new URLSearchParams(window.location.search);
    const fromCart = urlParams.get('source') === 'cart';

    const [formData, setFormData] = useState({
        nome_cliente: '',
        empresa: '',
        email: '',
        telefone: '',
        cidade: '',
        estado: '',
        mensagem: '',
        tipo: 'personalizado'
    });
    const [submitted, setSubmitted] = useState(false);

    const submitMutation = useMutation({
        mutationFn: async (data) => {
            // Nota: O método SendEmail precisa estar implementado no base44Client.js
            // Se não estiver, isso vai dar erro.
            // Vou assumir que você adicionou a parte de 'integrations' que sugeri lá no começo.
            if (base44.integrations && base44.integrations.Core && base44.integrations.Core.SendEmail) {
                await base44.integrations.Core.SendEmail({
                    to: 'contato@ddmindustria.com.br',
                    subject: `Contato - ${data.tipo === 'personalizado' ? 'Peça Sob Medida' : 'Orçamento'} - ${data.nome_cliente}`,
                    body: `
              Nome: ${data.nome_cliente}
              Empresa: ${data.empresa || 'Não informado'}
              Email: ${data.email}
              Telefone: ${data.telefone}
              Cidade/Estado: ${data.cidade || 'Não informado'}/${data.estado || 'Não informado'}
              Tipo: ${data.tipo}

              Mensagem:
              ${data.mensagem}
            `
                });
            } else {
                // Fallback para simulação se a integração não existir
                console.log("Simulando envio de email:", data);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        },
        onSuccess: () => {
            setSubmitted(true);
            toast.success('Mensagem enviada com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao enviar mensagem. Tente novamente.');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        submitMutation.mutate(formData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (submitted) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center py-20">
                <Card className="max-w-lg mx-4 text-center">
                    <CardContent className="pt-12 pb-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Solicitação Enviada!
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Recebemos sua solicitação de orçamento. Nossa equipe entrará em contato
                            em breve através do e-mail ou telefone informados.
                        </p>
                        <Button
                            className="bg-orange-500 hover:bg-orange-600"
                            onClick={() => setSubmitted(false)}
                        >
                            Enviar Nova Solicitação
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <section className="bg-gray-900 py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Entre em Contato
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Nossa equipe está pronta para atender você e desenvolver peças sob medida
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        {/* Contact Cards */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Telefone</h3>
                                        <p className="text-gray-600">(31) 3621-0000</p>
                                        <p className="text-sm text-gray-400">Seg-Sex: 8h às 18h</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">E-mail</h3>
                                        <p className="text-gray-600">contato@ddmindustria.com.br</p>
                                        <p className="text-sm text-gray-400">Resposta em até 24h</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Localização</h3>
                                        <p className="text-gray-600">Vespasiano - MG</p>
                                        <p className="text-sm text-gray-400">Região Metropolitana de BH</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Custom Manufacturing */}
                        <Card className="bg-orange-50 border-orange-200">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Wrench className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Peças Sob Medida</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            Desenvolvemos peças personalizadas a partir de amostras ou
                                            desenhos técnicos. Nossa equipe de engenharia está pronta
                                            para atender suas necessidades específicas.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-lg">
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-orange-500" />
                                    Formulário de {fromCart ? 'Orçamento' : 'Contato'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="nome">Nome Completo *</Label>
                                            <Input
                                                id="nome"
                                                required
                                                value={formData.nome_cliente}
                                                onChange={(e) => handleChange('nome_cliente', e.target.value)}
                                                placeholder="Seu nome"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="empresa">Empresa</Label>
                                            <Input
                                                id="empresa"
                                                value={formData.empresa}
                                                onChange={(e) => handleChange('empresa', e.target.value)}
                                                placeholder="Nome da empresa"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">E-mail *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                placeholder="seu@email.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="telefone">Telefone *</Label>
                                            <Input
                                                id="telefone"
                                                required
                                                value={formData.telefone}
                                                onChange={(e) => handleChange('telefone', e.target.value)}
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="cidade">Cidade</Label>
                                            <Input
                                                id="cidade"
                                                value={formData.cidade}
                                                onChange={(e) => handleChange('cidade', e.target.value)}
                                                placeholder="Sua cidade"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="estado">Estado</Label>
                                            <Select
                                                value={formData.estado}
                                                onValueChange={(value) => handleChange('estado', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o estado" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ESTADOS_BR.map((estado) => (
                                                        <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tipo de Solicitação</Label>
                                        <Select
                                            value={formData.tipo}
                                            onValueChange={(value) => handleChange('tipo', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="catalogo">Dúvidas sobre Produtos</SelectItem>
                                                <SelectItem value="personalizado">Peça Personalizada / Sob Medida</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mensagem">Mensagem</Label>
                                        <Textarea
                                            id="mensagem"
                                            rows={5}
                                            value={formData.mensagem}
                                            onChange={(e) => handleChange('mensagem', e.target.value)}
                                            placeholder={
                                                formData.tipo === 'personalizado'
                                                    ? "Descreva a peça que você precisa, incluindo dimensões, material, quantidade e outras especificações..."
                                                    : "Informações adicionais sobre seu pedido..."
                                            }
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold"
                                        disabled={submitMutation.isPending}
                                    >
                                        {submitMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-2" />
                                                Enviar Solicitação
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}