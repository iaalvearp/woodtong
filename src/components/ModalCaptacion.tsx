import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { X, ArrowRight, Check, Loader2, MessageCircle } from 'lucide-react';
import { actions } from 'astro:actions';

export default function ModalCaptacion() {
    const [paso, setPaso] = useState(1);
    const [visible, setVisible] = useState(false);
    const [cargando, setCargando] = useState(false);

    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');

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
                // Resetear form
                setNombre('');
                setCorreo('');
                setTelefono('');
            }, 4000);
            return () => clearTimeout(timeout);
        }
    }, [paso]);

    if (!visible) return null;

    const manejarSiguiente = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPaso(2);
    };

    const manejarFinalizar = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCargando(true);

        try {
            const { error } = await actions.registrarProspecto({
                nombreCompleto: nombre,
                correoElectronico: correo,
                telefonoMovil: telefono || undefined
            });

            if (error) {
                console.error("Error al registrar:", error);
                alert("Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.");
            } else {
                setPaso(3);
            }
        } catch (err) {
            console.error("Error inesperado:", err);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
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
                                <p className="text-[#86868b] text-sm">Suscríbete ahora y obtén un 15% de descuento en tu primera pieza de colección.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Nombre Completo</label>
                                    <input
                                        required
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Tu nombre"
                                        className="w-full px-5 py-3.5 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-[#064c39]/20 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Correo Electrónico</label>
                                    <input
                                        required
                                        type="email"
                                        value={correo}
                                        onChange={(e) => setCorreo(e.target.value)}
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
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Paso Final</h2>
                                <p className="text-[#86868b] text-sm">Casi terminamos. Déjanos tu WhatsApp para recibir asesoría personalizada (opcional).</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Teléfono Móvil</label>
                                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase">Opcional</span>
                                    </div>
                                    <input
                                        type="tel"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
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
                                {cargando ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>
                                        <span>{telefono ? "Obtener Cupón y Asesoría" : "Obtener Cupón"}</span>
                                        {telefono ? <MessageCircle size={18} /> : <ArrowRight size={18} />}
                                    </>
                                )}
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
                        <div className="text-center space-y-4 py-8 animate-in zoom-in duration-700">
                            <div className="w-20 h-20 bg-[#064c39]/10 rounded-full flex items-center justify-center mx-auto text-[#064c39] animate-bounce">
                                <Check size={40} strokeWidth={3} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-gray-900">¡Tu cupón está en camino!</h2>
                                <p className="text-[#86868b] leading-relaxed">
                                    Hemos enviado tu cupón del 15% de descuento a <span className="text-[#064c39] font-semibold">{correo}</span>.
                                    {telefono && <><br /><span className="text-xs mt-2 block">Un diseñador se pondrá en contacto contigo pronto.</span></>}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

