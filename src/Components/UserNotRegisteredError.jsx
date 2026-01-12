import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { __ddmDatabase } from '../api/MysqlServer.js';

const UserNotRegisteredError = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Sincronizado com a entidade consolidada
        __ddmDatabase.entities.auth.logout(); 
        navigate('/login');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="max-w-md w-full border-t-8 border-t-gray-900 shadow-2xl rounded-2xl overflow-hidden">
                <CardContent className="pt-12 pb-8 px-10">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-3xl bg-orange-50 text-orange-600 shadow-inner">
                            <ShieldAlert className="w-12 h-12 stroke-[2.5px]" />
                        </div>
                        
                        <h1 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter italic">
                            Acesso <span className="text-orange-600">Restrito</span>
                        </h1>
                        
                        <p className="text-sm font-bold text-gray-500 mb-10 leading-relaxed uppercase tracking-tight">
                            Este terminal de acesso é exclusivo para colaboradores autorizados da DDM Indústria. 
                            <span className="block mt-2 text-gray-400 font-medium normal-case italic">
                                Se você acredita que isso é um erro, contate o TI.
                            </span>
                        </p>

                        <div className="space-y-4">
                            <Button 
                                className="w-full h-14 bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
                                onClick={() => navigate('/')}
                            >
                                <ArrowLeft className="w-5 h-5 mr-3 text-orange-500" />
                                Voltar para a Loja
                            </Button>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <Button 
                                    variant="outline" 
                                    className="h-12 border-2 border-gray-100 font-black uppercase text-[10px] tracking-widest text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl transition-all"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sair da Conta
                                </Button>
                                
                                <Button 
                                    variant="ghost" 
                                    className="h-12 text-orange-600 hover:bg-orange-50 font-black uppercase text-[10px] tracking-widest rounded-xl"
                                    asChild
                                >
                                    <Link to="/contato">
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Suporte Técnico
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="mt-12 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
                                    Security Protocol 2.0
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserNotRegisteredError;