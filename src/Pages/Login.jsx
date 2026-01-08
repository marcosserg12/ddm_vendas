import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '../api/base44Client';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Components/ui/tabs';
// CORREÇÃO: Adicionado 'ArrowLeft' na lista de imports
import { Loader2, Lock, Mail, ArrowRight, User, Factory, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Estados dos formulários
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.login(loginData.email, loginData.password);
      toast.success('Login realizado com sucesso!');
      navigate('/');
      window.location.reload();
    } catch (error) {
      toast.error('Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      setTimeout(() => {
        toast.success('Conta criada com sucesso! Faça login.');
        setActiveTab('login');
      }, 1500);
    } catch (error) {
      toast.error('Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Lado Esquerdo - Visual (Aparece apenas em telas grandes) */}
      <div className="hidden lg:flex relative bg-gray-900 flex-col justify-between p-10 text-white overflow-hidden">
        {/* Imagem de Fundo com Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop"
            alt="Background Industrial"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
        </div>

        {/* Logo e Texto */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="bg-orange-500 p-2 rounded-lg">
            <Factory className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">DDM Indústria</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold mb-4">Peças técnicas de borracha com qualidade garantida.</h2>
          <p className="text-gray-400 mb-8">
            Acesse sua conta para gerenciar pedidos, acompanhar entregas e solicitar orçamentos personalizados.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-300">Acompanhamento em tempo real</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-300">Histórico de compras</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-300">Suporte especializado</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-500">
          &copy; {new Date().getFullYear()} DDM Indústria e Comércio.
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-[400px] space-y-6">

          {/* Header Mobile (Logo aparece aqui em telas pequenas) */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DDM Indústria</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bem-vindo de volta</h1>
            <p className="text-sm text-gray-500">
              Digite suas credenciais para acessar sua conta
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Criar Conta</TabsTrigger>
            </TabsList>

            {/* LOGIN FORM */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemplo@email.com"
                      className="pl-9 h-11 bg-white"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link to="#" className="text-xs text-orange-600 hover:text-orange-500 font-medium">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-9 h-11 bg-white"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-base font-semibold" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Entrar
                </Button>
              </form>
            </TabsContent>

            {/* REGISTER FORM */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      className="pl-9 h-11 bg-white"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="exemplo@email.com"
                      className="pl-9 h-11 bg-white"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-pass">Senha</Label>
                    <Input
                      id="reg-pass"
                      type="password"
                      className="h-11 bg-white"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pass">Confirmar</Label>
                    <Input
                      id="confirm-pass"
                      type="password"
                      className="h-11 bg-white"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-base font-semibold" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Criar Conta Grátis
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para a loja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}