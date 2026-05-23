USE [proyecto]
GO

-- 1. Insertar Usuarios
-- El usuario 1 será "Juanito" para que coincida con tu page.tsx
INSERT INTO usuarios (nombre, apellido, email, telefono, pais, provincia, contrasena)
VALUES 
('Juanito', 'Pérez', 'juanito@example.com', '8888-1111', 'Costa Rica', 'Cartago', 'hashed_pass_123'),
('María', 'Gómez', 'maria@example.com', '8888-2222', 'Costa Rica', 'San José', 'hashed_pass_456'),
('Carlos', 'López', 'carlos@example.com', '8888-3333', 'Costa Rica', 'Heredia', 'hashed_pass_789');

-- 2. Insertar Cuentas (Depende de Usuarios)
-- Le daremos dos cuentas a Juanito (ID 1) para que el balance total se sume correctamente
INSERT INTO cuentas (id_usuario, nombre, tipo_moneda, saldo_actual)
VALUES 
(1, 'Cuenta Planilla BCR', 'CRC', 250000.50),
(1, 'Billetera Efectivo', 'CRC', 45000.00),
(2, 'Cuenta de Ahorros BAC', 'CRC', 500000.00);

-- 3. Insertar Categorias (Depende de Usuarios)
-- Agregamos las categorías que mencionas en tu UI ('Casa', 'Tarjeta de crédito') y otras extras
INSERT INTO categorias (nombre, tipo, id_usuario)
VALUES 
('Salario', 'Ingreso', 1),
('Casa', 'Gasto', 1),
('Tarjeta de crédito', 'Gasto', 1),
('Alimentación', 'Gasto', 1),
('Transporte', 'Gasto', 1);

-- 4. Insertar Grupos (Depende de Usuarios)
INSERT INTO grupos (nombre, descripcion, id_creador)
VALUES 
('Viaje a la Playa', 'Gastos compartidos para el viaje de fin de año', 1);

-- 5. Insertar Grupo_Usuarios (Usuarios <-> Grupos)
INSERT INTO grupo_usuarios (id_grupo, id_usuario, rol)
VALUES 
(1, 1, 'Administrador'),
(1, 2, 'Miembro'),
(1, 3, 'Miembro');

-- 6. Insertar Transacciones (Depende de Usuarios, Cuentas y Categorías)
-- Estas son las 5 transacciones que tu page.tsx va a cargar en la tabla inferior
INSERT INTO transacciones (id_usuario, id_cuenta, id_categoria, tipo, metodo, monto, descripcion, fecha, es_compartido)
VALUES 
(1, 1, 1, 'Ingreso', 'Transferencia', 450000.00, 'Pago de quincena', '2026-05-01 08:00:00', 0),
(1, 1, 2, 'Gasto', 'Transferencia', 150000.00, 'Pago de Alquiler', '2026-05-02 10:30:00', 0),
(1, 1, 3, 'Gasto', 'Tarjeta Débito', 45000.00, 'Abono a tarjeta', '2026-05-05 14:15:00', 0),
(1, 2, 4, 'Gasto', 'Efectivo', 25000.00, 'Compras en el supermercado', '2026-05-10 18:45:00', 0),
(1, 1, 5, 'Gasto', 'Sinpe Móvil', 3500.00, 'Viaje en Uber', '2026-05-12 09:20:00', 0);

-- 7. Insertar Gasto_Compartido (Depende de Transacciones y Grupos)
-- Opcional: convertimos una nueva transacción en un gasto compartido
INSERT INTO transacciones (id_usuario, id_cuenta, id_categoria, tipo, metodo, monto, descripcion, fecha, es_compartido)
VALUES 
(1, 1, 4, 'Gasto', 'Tarjeta Débito', 60000.00, 'Cena grupal', '2026-05-13 20:00:00', 1);

-- Suponiendo que la transacción anterior tomó el ID 6:
INSERT INTO gasto_compartido (id_transaccion, id_grupo)
VALUES (6, 1);

-- 8. Insertar Division_Gasto (Depende de Gasto_Compartido y Usuarios)
-- Suponiendo que el gasto compartido anterior tomó el ID 1:
INSERT INTO division_gasto (id_gasto, id_usuario, monto, pagado)
VALUES 
(1, 1, 20000.00, 1),
(1, 2, 20000.00, 0),
(1, 3, 20000.00, 0);