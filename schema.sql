-- Tabla de Muebles
CREATE TABLE IF NOT EXISTS Muebles (
    id_mueble INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL NOT NULL,
    url_imagen TEXT,
    categoria TEXT,
    orden_hero INTEGER DEFAULT 0
);

-- Tabla de Prospectos
CREATE TABLE IF NOT EXISTS Prospectos (
    id_prospecto INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_completo TEXT NOT NULL,
    correo TEXT NOT NULL,
    telefono TEXT,
    id_cupon TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Recomendaciones
CREATE TABLE IF NOT EXISTS Recomendaciones (
    id_recomiendacion INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente TEXT NOT NULL,
    texto TEXT NOT NULL,
    estrellas INTEGER
);

-- Tabla de Usuarios (Sistema de Autenticación)
CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    correo TEXT UNIQUE NOT NULL,
    clave_encriptada TEXT NOT NULL,
    rol TEXT DEFAULT 'cliente' CHECK(rol IN ('cliente', 'admin')),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Sesiones (Gestión de Tokens)
CREATE TABLE IF NOT EXISTS Sesiones (
    id_sesion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    token_sesion TEXT UNIQUE NOT NULL,
    token_refresco TEXT UNIQUE NOT NULL,
    expiracion DATETIME NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- Índices para optimizar consultas de sesión
CREATE INDEX IF NOT EXISTS idx_sesiones_token ON Sesiones(token_sesion);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON Sesiones(id_usuario);
CREATE INDEX IF NOT EXISTS idx_sesiones_expiracion ON Sesiones(expiracion);

-- Datos Iniciales (Opcional)
INSERT INTO Muebles (nombre, descripcion, precio, url_imagen, categoria, orden_hero) VALUES 
('Silla Lounge Eames', 'Clásico moderno en piel y madera', 12500, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY2Op6XBHjDFC48CqYWgOPapjq8sL1k0RNIwdOhQdQV72kCT51a8fZppeHDAl6w9I4Qz7ElN9cmAA1itz6o-GiJQO6ziTqYQ4OWDq6qTbm-ANtbkcYntKnV-mXVoZHNfq07I58vtAUoSkEYqJXljo3MHwXaKB-Om31adE5vpHr2mAHeZ4ijcuDDopDVK89EwMBSvjhoFPI8u_EfMfOgwjQztG94w9EGqov9MdyxgJKl0mj-Rtea7i_k3w25Y_tJYpPkyYtBb-vdwg', 'Sillas', 1),
('Lámpara Nórdica', 'Iluminación cálida con diseño escandinavo', 4200, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAw1TV_U5dYDJoSNL3gZSA2-FTpPNDeySg0ahASq_aURm78CCCG2kPHWmscbwX7JHAtuyivQETtpbVcYeWvdOhEw6Ol5wLhwa4Zj6_FpU6tB42-Ffx92uvRjgkcJ-z6fIsDBKFxjj4w9vLWE2wNZJzjiqppyOHo9tLqfKWfulLMf8x4yezg5lp6IaKHyHZMgTTsbnJ2Tysfd3jyr9RQgfHfc9a37d-k3V4MAgKdYZq0QntjgdR4zK_-j1aGDTMZw_7pD5nDTq48k6I', 'Iluminación', 2);
