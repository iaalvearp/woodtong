import { useState, useEffect } from 'react';
import type { SubmitEvent } from 'react';
import { X, ArrowRight, Check, Loader2 } from 'lucide-react';

export default function ModalCaptacion() {
    const [paso, setPaso] = useState(1);
    const [visible, setVisible] = useState(false);
    const [cargando, setCargando] = useState(false);

    // Exponer función para abrir el modal desde fuera (Astro)
    useEffect(() => {
        const handleOpen = () => setVisible(true);
        document.addEventListener('abrir-modal-captacion', handleOpen);
        return () => document.removeEventListener('abrir-modal-captacion', handleOpen);
    }, []);

    // Auto-cerrar después de finalizar (Paso 3)
    useEffect(() => {
        if (paso === 3) {
            const timeout = setTimeout(() => {
                setVisible(false);
                setPaso(1);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [paso]);

    if (!visible) return null;

    const manejarSiguiente = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPaso(2);
    };

    const manejarFinalizar = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCargando(true);
        // Simulación de guardado en D1
        await new Promise(r => setTimeout(r, 1500));
        setCargando(false);
        setPaso(3);
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Botón Cerrar */}
                <button
                    onClick={() => setVisible(false)}
                    className="absolute top-6 right-6 z-10 p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
                >
                    <X size={20} />
                </button>

                {/* Indicador de Progreso */}
                <div className="flex justify-center gap-2 pt-10 pb-2">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${paso >= 1 ? 'w-8 bg-[#064c39]' : 'w-2 bg-gray-200'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${paso >= 2 ? 'w-8 bg-[#064c39]' : 'w-2 bg-gray-200'}`} />
                </div>

                <div className="p-8 pt-4">
                    {paso === 1 && (
                        <form onSubmit={manejarSiguiente} className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Diseño Exclusivo</h2>
                                <p className="text-[#86868b] text-sm">Suscríbete para recibir noticias de nuestras nuevas colecciones y obtén un beneficio.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Nombre Completo</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Tu nombre"
                                        className="w-full px-5 py-3.5 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-[#064c39]/20 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Correo Electrónico</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        className="w-full px-5 py-3.5 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-[#064c39]/20 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-[#064c39] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#053d2e] transition-all shadow-lg shadow-[#064c39]/20 active:scale-[0.98]"
                            >
                                <span>Continuar</span>
                                <ArrowRight size={18} />
                            </button>
                        </form>
                    )}

                    {paso === 2 && (
                        <form onSubmit={manejarFinalizar} className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Tu Regalo Especial</h2>
                                <p className="text-[#86868b] text-sm">Finaliza tu suscripción y recibe un 15% de descuento en tu primera compra.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Teléfono Móvil</label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="55 0000 0000"
                                        className="w-full px-5 py-3.5 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-[#064c39]/20 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={cargando}
                                type="submit"
                                className="w-full py-4 bg-[#064c39] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#053d2e] transition-all shadow-lg shadow-[#064c39]/20 active:scale-[0.98] disabled:opacity-70"
                            >
                                {cargando ? <Loader2 className="animate-spin" /> : <span>Obtener Cupón</span>}
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaso(1)}
                                className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-2"
                            >
                                Volver atrás
                            </button>
                        </form>
                    )}

                    {paso === 3 && (
                        <div className="text-center space-y-4 py-8 animate-in zoom-in duration-500">
                            <div className="w-16 h-16 bg-[#064c39]/10 rounded-full flex items-center justify-center mx-auto text-[#064c39]">
                                <Check size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">¡Todo listo!</h2>
                            <p className="text-[#86868b]">Hemos enviado tu cupón por mensaje. ¡Bienvenido a Woodtong!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
