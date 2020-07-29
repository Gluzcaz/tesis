#Solve bug Django couldnt assign default boolean values in Mysql 
ALTER TABLE `saacd`.`saaacd_semestre` ALTER esActivo SET DEFAULT 0;
ALTER TABLE `saacd`.`saaacd_mapa` ALTER esActivo SET DEFAULT 0;
ALTER TABLE `saacd`.`saaacd_actividad` ALTER esSiniestro SET DEFAULT 0;

###Catalogos:

#Categoria
INSERT INTO `saacd`.`saaacd_categoria` (`nombre`) VALUES ('Mantenimiento preventivo y correctivo a equipos de cómputo y medios.');
commit;
INSERT INTO `saacd`.`saaacd_categoria` (`nombre`, `categoriaSuperior_id`) VALUES ('Actualización de Software.', 1);
commit;
INSERT INTO `saacd`.`saaacd_categoria` (`nombre`, `categoriaSuperior_id`) VALUES ('Actualización de sistema operativo.', 2);
commit;
INSERT INTO `saacd`.`saaacd_categoria` (`nombre`) VALUES ('Atención a usuarios');
commit;
INSERT INTO `saacd`.`saaacd_categoria` (`nombre`, `categoriaSuperior_id`) VALUES ('Reporte de quejas', '4');
INSERT INTO `saacd`.`saaacd_categoria` (`nombre`, `categoriaSuperior_id`) VALUES ('Limpieza  Externa', '1');
INSERT INTO `saacd`.`saaacd_categoria` (`nombre`, `categoriaSuperior_id`) VALUES ('Prevención de software malicioso (Análisis de seguridad)', '1');
INSERT INTO `saacd`.`saaacd_categoria` (`nombre`, `categoriaSuperior_id`) VALUES ('Actualización de paquetería', '2');
select * from saacd.saaacd_categoria;

#Semestre
INSERT INTO `saacd`.`saaacd_semestre` (`nombre`) VALUES ('2019-2');
INSERT INTO `saacd`.`saaacd_semestre` (`nombre`) VALUES ('2020-1');
INSERT INTO `saacd`.`saaacd_semestre` (`nombre`, `esActivo`) VALUES ('2020-2', '1');
commit;
SELECT * FROM saacd.saaacd_semestre;

#Tipo de Dispositivo
INSERT INTO `saacd`.`saaacd_tipodispositivo` (`nombre`) VALUES ('Lámpara');
INSERT INTO `saacd`.`saaacd_tipodispositivo` (`nombre`) VALUES ('Proyector');
INSERT INTO `saacd`.`saaacd_tipodispositivo` (`nombre`) VALUES ('Pizarrón Electrónico');
INSERT INTO `saacd`.`saaacd_tipodispositivo` (`nombre`) VALUES ('Teclado');
INSERT INTO `saacd`.`saaacd_tipodispositivo` (`nombre`) VALUES ('CPU');
commit;

#Tipo de Ubicacion
INSERT INTO `saacd`.`saaacd_tipoubicacion` (`nombre`) VALUES ('Edificio');
INSERT INTO `saacd`.`saaacd_tipoubicacion` (`nombre`) VALUES ('Salón');
INSERT INTO `saacd`.`saaacd_tipoubicacion` (`nombre`) VALUES ('Área Anexo de Ingeniería');

#Marca
INSERT INTO `saacd`.`saaacd_marca` (`nombre`) VALUES ('EPSON');
INSERT INTO `saacd`.`saaacd_marca` (`nombre`) VALUES ('DELL');
INSERT INTO `saacd`.`saaacd_marca` (`nombre`) VALUES ('HP');
SELECT * FROM saacd.saaacd_marca;

#Modelo 
INSERT INTO `saacd`.`saaacd_modelo` (`nombre`, `marca_id`) VALUES ('ELPLP58', '1');
INSERT INTO `saacd`.`saaacd_modelo` (`nombre`, `marca_id`) VALUES ('ELPLP56', '1');
INSERT INTO `saacd`.`saaacd_modelo` (`nombre`, `marca_id`) VALUES ('Inspiron15R', '3');

SELECT * FROM saacd.saaacd_modelo;

#FichaTecnica
INSERT INTO `saacd`.`saaacd_fichatecnica` (`garantiaFabricante`, `tiempoVida`, `existenciaInventario`, `precio`, `modelo_id`) VALUES ('2', '3', '1', '7200.502', '1');
INSERT INTO `saacd`.`saaacd_fichatecnica` (`garantiaFabricante`, `tiempoVida`, `precio`, `modelo_id`) VALUES ('5', '10', '15000', '3');

#Ubicacion
INSERT INTO `saacd`.`saaacd_ubicacion` (`nombre`, `tipoUbicacion_id`) VALUES ('J', '1');
INSERT INTO `saacd`.`saaacd_ubicacion` (`nombre`, `tipoUbicacion_id`) VALUES ('I', '1');
INSERT INTO `saacd`.`saaacd_ubicacion` (`nombre`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES ('J201', '2', '1');
INSERT INTO `saacd`.`saaacd_ubicacion` (`nombre`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES ('I101', '2', '2');

#Dispositivo
INSERT INTO `saacd`.`saaacd_dispositivo` (`inventarioUNAM`, `fechaIngresoUbicacion`, `fechaAlta`, `fichaTecnica_id`, `tipoDispositivo_id`, `ubicacion_id`) VALUES ('528ERYYU', '2020-06-06', '2020-06-06', '1', '1', '3');
INSERT INTO `saacd`.`saaacd_dispositivo` (`inventarioUNAM`, `fechaIngresoUbicacion`, `fechaAlta`, `fichaTecnica_id`, `tipoDispositivo_id`, `ubicacion_id`) VALUES ('529PLOWQ', '2020-05-04', '2018-08-14', '2', '5', '3');


#Actividad
#CASOS 
INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `fechaAlta`, `categoria_id`, `dispositivo_id`, `semestre_id`, `ubicacion_id`, `usuario_id`) VALUES ('r', 'a', 'Profesor comenta que en la clase anterior tampoco funcionaba. Su clase fue a las 10 am.', '2020-06-06', '7', '2', '3', '3', '1');
INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `fechaResolucion`, `fechaAlta`, `fechaRequerido`, `esSiniestro`, `categoria_id`, `dispositivo_id`, `semestre_id`, `ubicacion_id`, `usuario_id`) VALUES ('p', 'm', 'Profesor  requiere que se atienda para su siguiente clase.', '2020-06-12', '2020-06-06', '2020-06-09', '1', '8', '2', '3', '3', '2');
INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `fechaResolucion`, `fechaAlta`, `categoria_id`, `dispositivo_id`, `semestre_id`, `ubicacion_id`, `usuario_id`) VALUES ('e', 'b', 'Resuelto', '2020-06-02', '2020-06-01', '6', '2', '3', '4', '2');
INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `fechaAlta`, `actividadSuperior_id`, `categoria_id`, `dispositivo_id`, `semestre_id`, `ubicacion_id`, `usuario_id`) VALUES ('p', 'a', '2020-06-07', '2', '8', '2', '3', '3', '1');



INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `categoria_id`, `semestre_id`, `usuario_id`, `esSiniestro`) VALUES ('p', 'b', 'Prueba1', '4', '1', '1', '0');
INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `esSiniestro`, `categoria_id`, `semestre_id`) VALUES ('p', 'b', 'Prueba2', '0', '4', '1');
INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `esSiniestro`, `categoria_id`, `semestre_id`) VALUES ('p', 'b', 'Prueba3', '0', '4', '1');
INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `esSiniestro`, `categoria_id`, `semestre_id`) VALUES ('p', 'b', 'Prueba4', '0', '4', '1');
INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `esSiniestro`, `categoria_id`, `semestre_id`, `usuario_id`) VALUES ('e', 'a', '', '1', '4', '2', '1');
INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `categoria_id`, `semestre_id`, `usuario_id`, `esSiniestro`) VALUES ('p', 'b', 'Prueba5', '4', '1', '1', '0');
INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `esSiniestro`, `categoria_id`, `semestre_id`) VALUES ('p', 'b', 'Prueba6', '0', '4', '1');
INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `esSiniestro`, `categoria_id`, `semestre_id`) VALUES ('p', 'b', 'Prueba7', '0', '4', '1');
INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `esSiniestro`, `categoria_id`, `semestre_id`) VALUES ('p', 'b', 'Prueba8', '0', '4', '1');
INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `esSiniestro`, `categoria_id`, `semestre_id`, `usuario_id`) VALUES ('e', 'a', 'Prueba9', '1', '4', '2', '1');


	ESTADO = Choices(
		('r', ('Realizada')), 
		('p', ('Pendiente')), 
		('e', ('En Progreso'))
	)
	
	PRIORIDAD = Choices(
		('a', ('Alta')), 
		('m', ('Media')), 
		('b', ('Baja'))
	)



Common queries:

alter table saacd.saaacd_categoria modify categoriaSuperior_id int DEFAULT NULL;