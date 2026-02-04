/**
 * Componente IconoAcceso - Icono de acceso en el header
 * Muestra person (login) para anónimos o shopping_bag para usuarios autenticados
 * Con transición suave de fade-in/fade-out
 */

import { useEffect, useState } from "react";

interface Props {
    usuarioActivo: boolean;
    rolUsuario?: string;
}

export default function IconoAcceso({ usuarioActivo, rolUsuario }: Props) {
    const [visible, setVisible] = useState(false);
    const [mostrarCarrito, setMostrarCarrito] = useState(usuarioActivo);

    useEffect(() => {
        if (usuarioActivo) {
            // Fade-out del icono anterior, luego fade-in del nuevo
            setVisible(false);
            setTimeout(() => {
                setMostrarCarrito(true);
                setTimeout(() => setVisible(true), 50);
            }, 150);
        } else {
            setVisible(true);
            setMostrarCarrito(false);
        }
    }, [usuarioActivo]);

    if (!mostrarCarrito) {
        // Usuario anónimo - Mostrar icono de login
        return (
            <a
                href="/login"
                className="btn-acceso"
                style={{
                    opacity: visible ? 1 : 0,
                    transition: "opacity 300ms ease",
                    color: "var(--texto-primario)",
                }}
                aria-label="Iniciar sesión"
            >
                <span className="material-symbols-outlined">person</span>
            </a>
        );
    }

    // Usuario autenticado - Mostrar icono de carrito
    return (
        <button
            className="btn-acceso"
            style={{
                opacity: visible ? 1 : 0,
                transition: "opacity 300ms ease",
                position: "relative",
                color: "var(--texto-primario)",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: ".5rem",
                border: "none",
                cursor: "pointer",

            }}
            aria-label="Carrito de compras"
        >
            <span className="material-symbols-outlined">shopping_bag</span>
            {rolUsuario === "admin" && (
                <span
                    className="badge-admin"
                    style={{
                        position: "absolute",
                        top: "0px",
                        right: "0px",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        background: "var(--primario)",
                        border: "2px solid var(--texto-primario)"
                    }}
                />
            )}
        </button>
    );
}
