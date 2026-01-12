import React, { useState } from 'react';
import { __ddmDatabase } from '../api/MysqlServer.js';
import { useMutation } from '@tanstack/react-query';
import {
    Phone, Mail, MapPin, Send, CheckCircle,
    Wrench, FileText, Loader2, MessageCircle
} from 'lucide-react';

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

const ESTADOS_BR = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

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
        tipo: fromCart ? 'catalogo' : 'personalizado'
    });
    const [submitted, setSubmitted] = useState(false);

    const submitMutation = useMutation({
        mutationFn: async (data) => {
            // Simulando o envio para o backend
            // Em produção, você faria um POST para /api/contato
            console.log("Enviando solicitação DDM:", data);
            await new Promise(resolve => setTimeout(resolve, 1500));
            return true;
        },
        onSuccess: () => {
            setSubmitted(true);
            toast.success('Sua mensagem foi enviada à nossa engenharia!');
        },
        onError: () => {
            toast.error('Erro ao processar sua solicitação. Tente o WhatsApp.');
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
                <Card className="max-w-lg mx-4 text-center border-t-8 border-t-green-500 rounded-3xl shadow-2xl">
                    <CardContent className="pt-12 pb-10 px-10">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter mb-4">
                            Solicitação <span className="text-green-600">Recebida!</span>
                        </h2>
                        <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                            Obrigado pelo contato. Nossa equipe técnica analisará sua mensagem e retornará em até 24h úteis.
                        </p>
                        <Button
                            className="w-full h-14 bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest rounded-xl transition-all"
                            onClick={() => setSubmitted(false)}
                        >
                            Voltar ao Atendimento
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header Dark DDM */}
            <section className="bg-gray-900 py-20 border-b-4 border-orange-500">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase italic tracking-tighter">
                        Canais de <span className="text-orange-500">Atendimento</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.3em] max-w-2xl mx-auto">
                        Suporte técnico especializado para manutenção industrial e revendas.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Informações de Contato Rápidas */}
                    <div className="space-y-6">
                        <ContactInfoCard 
                            icon={Phone} 
                            title="Comercial" 
                            text="(31) 3621-0000" 
                            subtext="Segunda a Sexta, 8h às 18h" 
                        />
                        <ContactInfoCard 
                            icon={MessageCircle} 
                            title="WhatsApp" 
                            text="(31) 9XXXX-XXXX" 
                            subtext="Atendimento imediato" 
                            isWhatsApp
                        />
                        <ContactInfoCard 
                            icon={Mail} 
                            title="E-mail Técnico" 
                            text="vendas@ddmindustria.com.br" 
                            subtext="Para envio de desenhos e amostras" 
                        />

                        <Card className="bg-gray-900 text-white border-none rounded-3xl shadow-xl overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-orange-500 rounded-2xl">
                                        <Wrench className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-black uppercase italic tracking-tight">Engenharia Sob Medida</h3>
                                </div>
                                <p className="text-gray-400 text-sm font-medium leading-relaxed">
                                    Não encontrou o que precisava? Desenvolvemos ferramentais e moldes para peças exclusivas em borracha e poliuretano.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Formulário Principal */}
                    <div className="lg:col-span-2">
                        <Card className="rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden">
                            <CardHeader className="bg-white border-b p-8">
                                <CardTitle className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-gray-900">
                                    <FileText className="w-5 h-5 text-orange-500" />
                                    Abertura de Chamado Técnico
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="font-black uppercase text-[10px] tracking-widest text-gray-400">Seu Nome / Razão Social</Label>
                                            <Input required value={formData.nome_cliente} onChange={(e) => handleChange('nome_cliente', e.target.value)} className="h-12 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white transition-colors" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="font-black uppercase text-[10px] tracking-widest text-gray-400">Nome da Empresa</Label>
                                            <Input value={formData.empresa} onChange={(e) => handleChange('empresa', e.target.value)} className="h-12 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white transition-colors" />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="font-black uppercase text-[10px] tracking-widest text-gray-400">E-mail para Retorno</Label>
                                            <Input type="email" required value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="h-12 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white transition-colors" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="font-black uppercase text-[10px] tracking-widest text-gray-400">Telefone / Celular</Label>
                                            <Input required value={formData.telefone} onChange={(e) => handleChange('telefone', e.target.value)} className="h-12 rounded-xl border-2 border-gray-50 bg-gray-50 focus:bg-white transition-colors" />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="font-black uppercase text-[10px] tracking-widest text-gray-400">Finalidade do Contato</Label>
                                            <Select value={formData.tipo} onValueChange={(val) => handleChange('tipo', val)}>
                                                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-50 bg-gray-50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="catalogo">Dúvida sobre Peças de Catálogo</SelectItem>
                                                    <SelectItem value="personalizado">Desenvolvimento Sob Medida</SelectItem>
                                                    <SelectItem value="vendas">Cotação de Grande Volume</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="font-black uppercase text-[10px] tracking-widest text-gray-400">Sua Localidade (UF)</Label>
                                            <Select value={formData.estado} onValueChange={(val) => handleChange('estado', val)}>
                                                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-50 bg-gray-50">
                                                    <SelectValue placeholder="Selecione o estado" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ESTADOS_BR.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="font-black uppercase text-[10px] tracking-widest text-gray-400">Descrição Detalhada</Label>
                                        <Textarea 
                                            rows={6} 
                                            value={formData.mensagem} 
                                            onChange={(e) => handleChange('mensagem', e.target.value)}
                                            className="rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white transition-colors resize-none"
                                            placeholder="Descreva as especificações técnicas, quantidades ou dúvidas gerais..."
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        disabled={submitMutation.isPending}
                                        className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-orange-500/20"
                                    >
                                        {submitMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Send className="w-5 h-5 mr-3" />}
                                        {submitMutation.isPending ? "Processando..." : "Enviar Solicitação Técnica"}
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

// Sub-componente para os cards de informação
function ContactInfoCard({ icon: Icon, title, text, subtext, isWhatsApp = false }) {
    return (
        <Card className={`rounded-3xl border-2 border-gray-100 shadow-sm transition-transform hover:-translate-y-1 ${isWhatsApp ? 'hover:border-green-200' : 'hover:border-orange-200'}`}>
            <CardContent className="p-6 flex items-start gap-5">
                <div className={`p-4 rounded-2xl ${isWhatsApp ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</h4>
                    <p className="text-sm font-black text-gray-900 tracking-tight">{text}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase italic">{subtext}</p>
                </div>
            </CardContent>
        </Card>
    );
}