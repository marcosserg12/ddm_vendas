import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { __ddmDatabase } from '../api/MysqlServer.js';
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Components/ui/tabs';
import { Loader2, Lock, User, CheckCircle2, ArrowLeft, ShieldCheck, Phone, Fingerprint, Award, Cog, Layers } from 'lucide-react';
import { toast } from 'sonner';
import LogoDDM from '../assets/imgs/logo_ddm.png';

const darkInput = "w-full pl-10 pr-4 h-12 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 font-medium focus:outline-none focus:border-orange-500/40 focus:bg-white/8 transition-all";
const darkInputSm = "w-full px-4 h-12 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 font-medium focus:outline-none focus:border-orange-500/40 transition-all";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [registerData, setRegisterData] = useState({
    ds_nome: '', ds_email: '', ds_login: '',
    nu_telefone: '', nu_cpf_cnpj: '', senha: '', confirmPassword: ''
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
    if (registerData.senha !== registerData.confirmPassword)
      return toast.error('As senhas não coincidem.');
    if (!registerData.nu_cpf_cnpj || registerData.nu_cpf_cnpj.length < 11)
      return toast.error('CPF ou CNPJ inválido.');
    setLoading(true);
    try {
      await __ddmDatabase.entities.auth.register({
        ds_nome: registerData.ds_nome, ds_email: registerData.ds_email,
        ds_login: registerData.ds_login, nu_telefone: registerData.nu_telefone,
        nu_cpf_cnpj: registerData.nu_cpf_cnpj, senha: registerData.senha
      });
      toast.success('Cadastro realizado! Acesse sua conta.');
      setActiveTab('login');
      setRegisterData({ ds_nome: '', ds_email: '', ds_login: '', nu_telefone: '', nu_cpf_cnpj: '', senha: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Erro ao realizar cadastro.');
    } finally { setLoading(false); }
  };

  return (
    <div className="font-sans">

      {/* ============ MOBILE (< lg) ============ */}
      <div className="lg:hidden min-h-screen bg-[#060f1e] flex flex-col relative overflow-hidden">

        {/* Decorações */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-orange-500/10 pointer-events-none" />
        <div className="absolute top-20 -right-10 w-48 h-48 rounded-full border border-orange-500/5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-orange-500/40 to-transparent" />

        <div className="relative z-10 flex flex-col min-h-screen px-6 pt-12 pb-8">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <img src={LogoDDM} alt="DDM" className="w-9 h-9 object-contain" />
            <div className="leading-none">
              <p className="text-base font-black uppercase tracking-tighter text-white">DDM</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-400">Indústria e Comércio</p>
            </div>
          </div>

          {/* Título */}
          <div className="mb-8">
            <h1 className="text-[2.2rem] font-black text-white uppercase tracking-tighter leading-[0.9] mb-2">
              {activeTab === 'login'
                ? <>Bem-vindo<br /><span className="text-orange-500">de volta</span></>
                : <>Criar<br /><span className="text-orange-500">conta</span></>}
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              {activeTab === 'login' ? 'Acesse o portal DDM' : 'Preencha os dados abaixo'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/5 border border-white/8 rounded-2xl p-1 mb-7 gap-1">
            {[['login', 'Entrar'], ['register', 'Cadastrar']].map(([tab, label]) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-600 hover:text-gray-500'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Form Login */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <DarkField label="E-mail ou Login">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input className={darkInput} placeholder="login ou email@empresa.com"
                  value={loginData.identifier} onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })} required />
              </DarkField>

              <DarkField label="Senha">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input type="password" className={darkInput} placeholder="••••••••"
                  value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
              </DarkField>

              <button type="submit" disabled={loading}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20 transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Acessar Portal</>}
              </button>

              <p className="text-center text-xs text-gray-300 font-medium mt-1">
                Não tem conta?{' '}
                <button type="button" onClick={() => setActiveTab('register')} className="text-orange-400 font-black hover:text-orange-300">
                  Cadastre-se
                </button>
              </p>
            </form>
          )}

          {/* Form Cadastro */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <DarkField label="Nome Completo / Razão Social">
                <input required className={darkInputSm} placeholder="Seu nome ou empresa"
                  value={registerData.ds_nome} onChange={(e) => setRegisterData({ ...registerData, ds_nome: e.target.value })} />
              </DarkField>

              <div className="grid grid-cols-2 gap-3">
                <DarkField label="E-mail">
                  <input type="email" required className={darkInputSm} placeholder="email@..."
                    value={registerData.ds_email} onChange={(e) => setRegisterData({ ...registerData, ds_email: e.target.value })} />
                </DarkField>
                <DarkField label="Login">
                  <input required className={darkInputSm} placeholder="usuário"
                    value={registerData.ds_login} onChange={(e) => setRegisterData({ ...registerData, ds_login: e.target.value })} />
                </DarkField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DarkField label="CPF / CNPJ">
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600" />
                  <input required className={darkInput} placeholder="Somente números"
                    value={registerData.nu_cpf_cnpj} onChange={(e) => setRegisterData({ ...registerData, nu_cpf_cnpj: e.target.value })} />
                </DarkField>
                <DarkField label="Telefone">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600" />
                  <input required className={darkInput} placeholder="(00) 00000-0000"
                    value={registerData.nu_telefone} onChange={(e) => setRegisterData({ ...registerData, nu_telefone: e.target.value })} />
                </DarkField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DarkField label="Senha">
                  <input type="password" required className={darkInputSm} placeholder="••••••••"
                    value={registerData.senha} onChange={(e) => setRegisterData({ ...registerData, senha: e.target.value })} />
                </DarkField>
                <DarkField label="Confirmar">
                  <input type="password" required className={darkInputSm} placeholder="••••••••"
                    value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} />
                </DarkField>
              </div>

              <button type="submit" disabled={loading}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20 transition-all mt-2 flex items-center justify-center disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Conta'}
              </button>
            </form>
          )}

          {/* Rodapé */}
          <div className="mt-auto pt-10 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="w-3 h-3" /> Navegar como Visitante
            </Link>
          </div>
        </div>
      </div>

      {/* ============ DESKTOP (lg+) ============ */}
      <div className="hidden lg:flex min-h-screen">

        {/* Painel esquerdo */}
        <div className="relative w-[45%] flex flex-col justify-between p-12 overflow-hidden bg-[#060f1e]">
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-orange-500/10 pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full border border-orange-500/15 pointer-events-none" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full border border-blue-500/10 pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-orange-600/5 blur-3xl pointer-events-none" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-60" />

          <div className="relative z-10 flex items-center gap-4">
            <img src={LogoDDM} alt="DDM" className="w-12 h-12 object-contain drop-shadow-lg" />
            <div className="leading-none">
              <p className="text-xl font-black uppercase tracking-tighter text-white">DDM</p>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-orange-400">Indústria e Comércio</p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
              <Award className="w-3 h-3 text-orange-400" />
              <span className="text-orange-400 text-[10px] font-black uppercase tracking-[0.2em]">Desde 1993</span>
            </div>
            <h2 className="text-5xl font-black mb-4 uppercase leading-[0.9] tracking-tighter text-white">
              Portal de <br /><span className="text-orange-500">Acesso</span>
            </h2>
            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8 max-w-sm">
              Gestão técnica de peças industriais em borracha e poliuretano com mais de 30 anos de mercado nacional.
            </p>
            <div className="space-y-3 mb-10">
              <FeatureItem text="Acesso com login interno ou e-mail" />
              <FeatureItem text="Pedidos e orçamentos direto pelo portal" />
              <FeatureItem text="Segurança de dados padrão DDM" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ val: '30+', label: 'Anos', icon: Award }, { val: '1k+', label: 'Produtos', icon: Layers }, { val: '100%', label: 'Nacional', icon: Cog }].map(({ val, label, icon: Icon }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-1">
                  <Icon className="w-4 h-4 text-orange-500 mb-1" />
                  <p className="text-xl font-black text-white leading-none">{val}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
            <ShieldCheck className="w-4 h-4 text-orange-600" /> Conexão Segura
          </div>
        </div>

        {/* Painel direito — formulário */}
        <div className="flex-1 flex items-center justify-center p-10 bg-gray-50">
          <div className="w-full max-w-[420px]">
            <div className="mb-7">
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                {activeTab === 'login' ? <>Bem-vindo <span className="text-orange-500">de volta</span></> : <>Criar <span className="text-orange-500">conta</span></>}
              </h1>
              <p className="text-gray-400 text-xs font-medium mt-1">
                {activeTab === 'login' ? 'Entre com suas credenciais para acessar o portal' : 'Preencha os dados abaixo para se cadastrar'}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-7 bg-gray-200/70 p-1 rounded-2xl h-11">
                <TabsTrigger value="login" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all">Entrar</TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <form onSubmit={handleLogin} className="space-y-4">
                  <Field label="E-mail ou Login">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="login ou email@empresa.com" className="pl-10 h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium" value={loginData.identifier} onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })} required />
                  </Field>
                  <Field label="Senha">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type="password" placeholder="••••••••" className="pl-10 h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
                  </Field>
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-gray-900 hover:bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-md transition-all duration-300 mt-1">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4 mr-2 text-orange-400" />Acessar Portal</>}
                  </Button>
                  <p className="text-center text-[11px] text-gray-400 font-medium">
                    Não tem conta?{' '}<button type="button" onClick={() => setActiveTab('register')} className="text-orange-500 font-black hover:underline">Cadastre-se</button>
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="register" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <form onSubmit={handleRegister} className="space-y-3">
                  <Field label="Nome Completo / Razão Social">
                    <Input required className="h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium" value={registerData.ds_nome} onChange={(e) => setRegisterData({ ...registerData, ds_nome: e.target.value })} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="E-mail"><Input type="email" required className="h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium" value={registerData.ds_email} onChange={(e) => setRegisterData({ ...registerData, ds_email: e.target.value })} /></Field>
                    <Field label="Login"><Input required className="h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium" value={registerData.ds_login} onChange={(e) => setRegisterData({ ...registerData, ds_login: e.target.value })} /></Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="CPF / CNPJ">
                      <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input required placeholder="Somente números" className="pl-9 h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium" value={registerData.nu_cpf_cnpj} onChange={(e) => setRegisterData({ ...registerData, nu_cpf_cnpj: e.target.value })} />
                    </Field>
                    <Field label="Telefone">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input required placeholder="(00) 00000-0000" className="pl-9 h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium" value={registerData.nu_telefone} onChange={(e) => setRegisterData({ ...registerData, nu_telefone: e.target.value })} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Senha"><Input type="password" required className="h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium" value={registerData.senha} onChange={(e) => setRegisterData({ ...registerData, senha: e.target.value })} /></Field>
                    <Field label="Confirmar Senha"><Input type="password" required className="h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium" value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} /></Field>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-md transition-all mt-1">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center mt-7">
              <Link to="/" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-orange-500 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Navegar como Visitante
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{label}</Label>
      <div className="relative">{children}</div>
    </div>
  );
}

function DarkField({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-gray-300 tracking-widest">{label}</label>
      <div className="relative">{children}</div>
    </div>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full bg-orange-500/15 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-3 h-3 text-orange-500" />
      </div>
      <span className="text-sm font-medium text-gray-400">{text}</span>
    </div>
  );
}
