USE [proyecto]
-- 1. Tabla Usuarios (Independiente)
CREATE TABLE usuarios (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    nombre NVARCHAR(100) NOT NULL,
    apellido NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    telefono NVARCHAR(20) NOT NULL,
    pais NVARCHAR(100) NOT NULL,
    provincia NVARCHAR(100) NOT NULL,
    contrasena NVARCHAR(255) NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE()
);

-- 2. Tabla Cuentas (Depende de Usuarios)
CREATE TABLE cuentas (
    id_cuenta INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    id_usuario INT NOT NULL,
    nombre NVARCHAR(100) NOT NULL,
    tipo_moneda NVARCHAR(10) NOT NULL,
    saldo_actual DECIMAL(12,2) NOT NULL,
    CONSTRAINT FK_cuentas_usuarios FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario)
);

-- 3. Tabla Categorias (Depende de Usuarios)
CREATE TABLE categorias (
    id_categoria INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    nombre NVARCHAR(100) NOT NULL,
    tipo NVARCHAR(20) NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT FK_categorias_usuarios FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario)
);

-- 4. Tabla Grupos (Depende de Usuarios para el creador)
CREATE TABLE grupos (
    id_group INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    nombre NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(255),
    id_creador INT NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_grupos_usuarios FOREIGN KEY (id_creador) 
        REFERENCES usuarios(id_usuario)
);

-- 5. Tabla Grupo_Usuarios (Tabla intermedia Usuarios <-> Grupos)
CREATE TABLE grupo_usuarios (
    id_grupo INT NOT NULL,
    id_usuario INT NOT NULL,
    rol NVARCHAR(20) NOT NULL,
    PRIMARY KEY (id_grupo, id_usuario),
    CONSTRAINT FK_grupoUsuarios_grupos FOREIGN KEY (id_grupo) 
        REFERENCES grupos(id_group),
    CONSTRAINT FK_grupoUsuarios_usuarios FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario)
);

-- 6. Tabla Transacciones (Depende de Usuarios, Cuentas y Categorias)
CREATE TABLE transacciones (
    id_transaccion INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    id_usuario INT NOT NULL,
    id_cuenta INT NOT NULL,
    id_categoria INT NOT NULL,
    tipo NVARCHAR(20) NOT NULL,
    metodo NVARCHAR(50) NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    descripcion NVARCHAR(255),
    fecha DATETIME NOT NULL,
    es_compartido BIT NOT NULL DEFAULT 0,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_transacciones_usuarios FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario),
    CONSTRAINT FK_transacciones_cuentas FOREIGN KEY (id_cuenta) 
        REFERENCES cuentas(id_cuenta),
    CONSTRAINT FK_transacciones_categorias FOREIGN KEY (id_categoria) 
        REFERENCES categorias(id_categoria)
);

-- 7. Tabla Gasto_Compartido (Depende de Transacciones y Grupos)
CREATE TABLE gasto_compartido (
    id_gasto INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    id_transaccion INT NOT NULL,
    id_grupo INT NOT NULL,
    CONSTRAINT FK_gastoCompartido_transacciones FOREIGN KEY (id_transaccion) 
        REFERENCES transacciones(id_transaccion),
    CONSTRAINT FK_gastoCompartido_grupos FOREIGN KEY (id_grupo) 
        REFERENCES grupos(id_group)
);

-- 8. Tabla Division_Gasto (Depende de Gasto_Compartido y Usuarios)
CREATE TABLE division_gasto (
    id_gasto INT NOT NULL,
    id_usuario INT NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    pagado BIT NOT NULL DEFAULT 0,
    PRIMARY KEY (id_gasto, id_usuario),
    CONSTRAINT FK_divisionGasto_gastoCompartido FOREIGN KEY (id_gasto) 
        REFERENCES gasto_compartido(id_gasto),
    CONSTRAINT FK_divisionGasto_usuarios FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario)
);