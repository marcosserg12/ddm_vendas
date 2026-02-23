import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { __ddmDatabase } from '../api/MysqlServer.js';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Components/ui/tabs';
import { Loader2, Lock, Mail, User, Factory, CheckCircle2, ArrowLeft, ShieldCheck, Phone, Fingerprint } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Estados dos formulários
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    ds_nome: '', 
    ds_email: '', 
    ds_login: '', 
    nu_telefone: '', 
    nu_cpf_cnpj: '', 
    senha: '', 
    confirmPassword: '' 
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await __ddmDatabase.entities.auth.login(loginData.identifier, loginData.password);
      if (response.token) {
        localStorage.setItem('ddm_token', response.token);
        localStorage.setItem('ddm_user', JSON.stringify(response.user));
        toast.success(`Bem-vindo, ${response.user.ds_nome}!`);
        if (response.user.id_perfil === 1) navigate('/admin');
        else navigate('/');
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.message || 'Credenciais inválidas.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerData.senha !== registerData.confirmPassword) {
      return toast.error('As senhas não coincidem.');
    }

    if (!registerData.nu_cpf_cnpj || registerData.nu_cpf_cnpj.length < 11) {
      return toast.error('CPF ou CNPJ inválido.');
    }

    setLoading(true);
    try {
      // Usando a rota de registro sincronizada com o server
      await __ddmDatabase.entities.auth.register({
        ds_nome: registerData.ds_nome,
        ds_email: registerData.ds_email,
        ds_login: registerData.ds_login,
        nu_telefone: registerData.nu_telefone,
        nu_cpf_cnpj: registerData.nu_cpf_cnpj,
        senha: registerData.senha
      });

      toast.success('Cadastro técnico realizado! Acesse sua conta.');
      setActiveTab('login');
      // Limpa formulário
      setRegisterData({ ds_nome: '', ds_email: '', ds_login: '', nu_telefone: '', nu_cpf_cnpj: '', senha: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Erro ao realizar cadastro.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-white font-sans">
      
      {/* LADO ESQUERDO: BRANDING */}
      <div className="hidden lg:flex relative bg-gray-900 flex-col justify-between p-12 text-white overflow-hidden border-r-8 border-orange-600">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000" alt="Fábrica DDM" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/95 to-orange-950/30" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-orange-600 p-2.5 rounded-xl"><Factory className="w-7 h-7 text-white" /></div>
          <span className="text-2xl font-black uppercase tracking-tighter italic">DDM <span className="text-orange-600">Indústria</span></span>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-5xl font-black mb-6 uppercase italic leading-[0.9] tracking-tighter">Portal de <span className="text-orange-600">Acesso.</span></h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-10 leading-relaxed">Gestão técnica de peças industriais em borracha e poliuretano.</p>
          <div className="space-y-4">
            <FeatureItem text="Acesso com login interno ou e-mail" />
            <FeatureItem text="Pedidos e faturamento direto via portal" />
            <FeatureItem text="Segurança de dados padrão DDM" />
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
          <ShieldCheck className="w-4 h-4" /> Conexão Segura v2.0
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIOS */}
      <div className="flex items-center justify-center p-8 bg-gray-50/50">
        <div className="w-full max-w-[460px] space-y-8">
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Login <span className="text-orange-600">DDM</span></h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilize suas credenciais industriais</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-200/50 p-1 rounded-2xl h-14">
              <TabsTrigger value="login" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-orange-600">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-orange-600">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">E-mail ou Login</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="seu.login ou email@ddm.com.br" className="pl-12 h-14 bg-white border-2 border-gray-100 rounded-2xl font-bold" value={loginData.identifier} onChange={(e) => setLoginData({...loginData, identifier: e.target.value})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type="password" placeholder="••••••••" className="pl-12 h-14 bg-white border-2 border-gray-100 rounded-2xl font-bold" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} required />
                  </div>
                </div>
                <Button type="submit" className="w-full h-16 bg-gray-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all gap-3" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 text-orange-500" />} Autenticar Acesso
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nome Completo / Razão Social</Label>
                  <Input required className="h-12 bg-white border-2 border-gray-100 rounded-xl font-bold text-sm" value={registerData.ds_nome} onChange={(e) => setRegisterData({...registerData, ds_nome: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">E-mail</Label>
                        <Input type="email" required className="h-12 bg-white border-2 border-gray-100 rounded-xl font-bold text-sm" value={registerData.ds_email} onChange={(e) => setRegisterData({...registerData, ds_email: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Login</Label>
                        <Input required className="h-12 bg-white border-2 border-gray-100 rounded-xl font-bold text-sm" value={registerData.ds_login} onChange={(e) => setRegisterData({...registerData, ds_login: e.target.value})} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">CPF / CNPJ</Label>
                        <div className="relative">
                            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <Input required placeholder="Somente números" className="pl-9 h-12 bg-white border-2 border-gray-100 rounded-xl font-bold text-sm" value={registerData.nu_cpf_cnpj} onChange={(e) => setRegisterData({...registerData, nu_cpf_cnpj: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Telefone</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <Input required placeholder="(00) 00000-0000" className="pl-9 h-12 bg-white border-2 border-gray-100 rounded-xl font-bold text-sm" value={registerData.nu_telefone} onChange={(e) => setRegisterData({...registerData, nu_telefone: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Senha</Label>
                        <Input type="password" required className="h-12 bg-white border-2 border-gray-100 rounded-xl font-bold text-sm" value={registerData.senha} onChange={(e) => setRegisterData({...registerData, senha: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Confirmar Senha</Label>
                        <Input type="password" required className="h-12 bg-white border-2 border-gray-100 rounded-xl font-bold text-sm" value={registerData.confirmPassword} onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})} />
                    </div>
                </div>

                <Button type="submit" className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg mt-2 transition-all" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Finalizar Cadastro Industrial"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center pt-2">
            <Link to="/" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-orange-600 transition-colors">
              <ArrowLeft className="w-3 h-3 mr-2" /> Navegar como Visitante
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-orange-600/20 p-1.5 rounded-full"><CheckCircle2 className="w-4 h-4 text-orange-600" /></div>
      <span className="text-xs font-bold text-gray-300 uppercase tracking-tight italic">{text}</span>
    </div>
  );
}
