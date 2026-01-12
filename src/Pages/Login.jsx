import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { __ddmDatabase } from '../api/MysqlServer.js';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Components/ui/tabs';
import { Loader2, Lock, Mail, User, Factory, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Estados dos formulários
  const [loginData, setLoginData] = useState({ identifier: '', password: '' }); // identifier aceita login ou email
  const [registerData, setRegisterData] = useState({ name: '', email: '', login: '', password: '', confirmPassword: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Chamada para a API consolidada no MysqlServer.js
      // O backend deve buscar por (ds_email = ? OR ds_login = ?)
      const response = await __ddmDatabase.entities.auth.login(
        loginData.identifier, 
        loginData.password
      );
      
      // O objeto 'response' deve conter { user: {id_usuario, ds_nome, id_perfil...}, token: "JWT_HERE" }
      if (response.token) {
        localStorage.setItem('ddm_token', response.token);
        localStorage.setItem('ddm_user', JSON.stringify(response.user));
        
        toast.success(`Bem-vindo, ${response.user.ds_nome}!`);

        // Redirecionamento baseado no perfil (Admin = 1)
        if (response.user.id_perfil === 1) {
          navigate('/admin');
        } else {
          navigate('/');
        }
        
        // Refresh para atualizar o estado global de autenticação (Header/Menu)
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error(error.message || 'Credenciais inválidas. Verifique seu login e senha.');
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
      // Exemplo de criação de usuário usando a entidade do seu banco
      await __ddmDatabase.entities.Usuarios.create({
        ds_nome: registerData.name,
        ds_email: registerData.email,
        ds_login: registerData.login,
        ds_senha: registerData.password,
        id_perfil: 2, // Cliente padrão
        st_ativo: 'S'
      });

      toast.success('Cadastro realizado! Agora você pode entrar.');
      setActiveTab('login');
    } catch (error) {
      toast.error('Erro ao realizar cadastro. Tente outro e-mail ou login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-white font-sans">
      
      {/* LADO ESQUERDO: BRANDING INDUSTRIAL DDM */}
      <div className="hidden lg:flex relative bg-gray-900 flex-col justify-between p-12 text-white overflow-hidden border-r-8 border-orange-600">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000"
            alt="Fábrica DDM"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/95 to-orange-950/30" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-600/20">
            <Factory className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-black uppercase tracking-tighter italic">DDM <span className="text-orange-600">Indústria</span></span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-5xl font-black mb-6 uppercase italic leading-[0.9] tracking-tighter text-white">
            Portal de <span className="text-orange-600">Acesso.</span>
          </h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-10 leading-relaxed">
            Gestão técnica de peças em borracha e poliuretano para infraestrutura e mineração.
          </p>
          <div className="space-y-4">
            <FeatureItem text="Acesso com login interno ou e-mail" />
            <FeatureItem text="Painel administrativo para gestão de vendas" />
            <FeatureItem text="Segurança de dados via criptografia JWT" />
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
          <ShieldCheck className="w-4 h-4" />
          Conexão Segura DDM v2.0
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIOS */}
      <div className="flex items-center justify-center p-8 bg-gray-50/50">
        <div className="w-full max-w-[420px] space-y-8">
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Login <span className="text-orange-600">DDM</span></h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilize seu login interno ou e-mail institucional</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-200/50 p-1 rounded-2xl h-14">
              <TabsTrigger value="login" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-black uppercase text-[10px] text-gray-400 ml-1">E-mail ou Login</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="joao.silva ou email@ddm.com.br"
                      className="pl-12 h-14 bg-white border-2 border-gray-100 rounded-2xl focus-visible:ring-orange-500 font-bold text-sm"
                      value={loginData.identifier}
                      onChange={(e) => setLoginData({...loginData, identifier: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-black uppercase text-[10px] text-gray-400 ml-1">Senha</Label>
                    <Link to="#" className="text-[10px] text-orange-600 hover:underline font-black uppercase">Esqueceu a senha?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      className="pl-12 h-14 bg-white border-2 border-gray-100 rounded-2xl focus-visible:ring-orange-500 font-bold"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-16 bg-gray-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-3" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 text-orange-500" />}
                  Autenticar Acesso
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-black uppercase text-[10px] text-gray-400 ml-1">Nome Completo</Label>
                  <Input
                    required
                    className="h-14 bg-white border-2 border-gray-100 rounded-2xl font-bold text-sm"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="font-black uppercase text-[10px] text-gray-400 ml-1">E-mail</Label>
                        <Input type="email" required className="h-14 bg-white border-2 border-gray-100 rounded-2xl font-bold text-sm" value={registerData.email} onChange={(e) => setRegisterData({...registerData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-black uppercase text-[10px] text-gray-400 ml-1">Login</Label>
                        <Input required className="h-14 bg-white border-2 border-gray-100 rounded-2xl font-bold text-sm" value={registerData.login} onChange={(e) => setRegisterData({...registerData, login: e.target.value})} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="font-black uppercase text-[10px] text-gray-400 ml-1">Senha</Label>
                        <Input type="password" required className="h-14 bg-white border-2 border-gray-100 rounded-2xl font-bold text-sm" value={registerData.password} onChange={(e) => setRegisterData({...registerData, password: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-black uppercase text-[10px] text-gray-400 ml-1">Repetir Senha</Label>
                        <Input type="password" required className="h-14 bg-white border-2 border-gray-100 rounded-2xl font-bold text-sm" value={registerData.confirmPassword} onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})} />
                    </div>
                </div>
                <Button type="submit" className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar Conta Industrial"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center pt-4">
            <Link to="/" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-orange-600 transition-colors">
              <ArrowLeft className="w-3 h-3 mr-2" />
              Navegar como Visitante
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
      <div className="bg-orange-600/20 p-1.5 rounded-full">
        <CheckCircle2 className="w-4 h-4 text-orange-600" />
      </div>
      <span className="text-xs font-bold text-gray-300 uppercase tracking-tight italic">{text}</span>
    </div>
  );
}