#Solve bug Django couldnt assign default boolean values in Mysql 
ALTER TABLE `saacd`.`saaacd_semestre` ALTER esActivo SET DEFAULT 0;
ALTER TABLE `saacd`.`saaacd_fichatecnica` ALTER precio SET DEFAULT 0;
ALTER TABLE `saacd`.`saaacd_ubicacion` ALTER altitud SET DEFAULT 0;
ALTER TABLE `saacd`.`saaacd_ubicacion` ALTER exposicionSol SET DEFAULT 0;
ALTER TABLE `saacd`.`saaacd_dispositivo` ALTER tiempoVida SET DEFAULT 0;
ALTER TABLE `saacd`.`saaacd_mapa` ALTER esActivo SET DEFAULT 0;
ALTER TABLE `saacd`.`saaacd_actividad` ALTER esPeticion SET DEFAULT 0;
ALTER TABLE `saacd`.`saaacd_horarioclase` ALTER horasClase SET DEFAULT 0;
ALTER TABLE `saacd`.`saaacd_informacionescolar` ALTER numClasesSemanal SET DEFAULT 0;
ALTER TABLE saacd.saaacd_calendario ADD UNIQUE (diaHabil);
ALTER TABLE saacd.saaacd_semestre ADD UNIQUE (inicio, fin);

#SHOW EVENTS FROM saacd;
#STARTS '2020-10-19 22:07:00'
# run everyday at 1AM
DROP EVENT IF EXISTS updateDevicesDaily;
CREATE EVENT updateDevicesDaily
ON SCHEDULE EVERY 1 DAY 
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 1 HOUR)
DO UPDATE saacd.saaacd_dispositivo d,
       (SELECT ie.ubicacion_id, hc.horasClase FROM saacd.saaacd_calendario c
		INNER JOIN saacd.saaacd_informacionescolar ie on ie.semestre_id = c.semestre_id
		INNER JOIN saacd.saaacd_horarioclase hc ON(hc.infoEscolar_id = ie.id AND hc.diaSemana=dayofweek(c.diahabil))
		where c.diaHabil = CURDATE() AND c.semestre_id=(SELECT id FROM saacd.saaacd_semestre where esActivo=1))
				AS hour_location
	SET d.tiempoVida = d.tiempoVida + hour_location.horasClase
	WHERE d.ubicacion_id = hour_location.ubicacion_id AND d.fechaBaja = NULL;
	
DROP TRIGGER IF EXISTS insert_prediction_device;
DELIMITER $$
CREATE TRIGGER insert_prediction_device
BEFORE INSERT ON saacd.saaacd_dispositivo FOR EACH ROW
BEGIN
	SET @altitude = (SELECT altitud FROM saacd.saaacd_ubicacion WHERE id=NEW.ubicacion_id );
	SET @classesTotal = (SELECT numClasesSemanal FROM saacd.saaacd_informacionescolar 
						WHERE ubicacion_id = NEW.ubicacion_id
						AND semestre_id=(SELECT id FROM saacd.saaacd_semestre WHERE esActivo=1));
	SET @model = (SELECT m.nombre FROM saacd.saaacd_fichatecnica ft
					INNER JOIN saacd.saaacd_modelo m ON m.id=ft.modelo_id
                    WHERE ft.id=NEW.fichaTecnica_id);
    SET NEW.prediccionVidaUtil = CASE @model WHEN "ELPLP54" THEN 79454.2333 - (32.34 * @altitude ) - (2.510625 * @classesTotal)
									 WHEN "ELPLP58" THEN NULL
									 WHEN "SF200" THEN NULL
                                     END;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS cancel_activities;
DELIMITER $$
CREATE TRIGGER cancel_activities
AFTER UPDATE ON saacd.saaacd_dispositivo FOR EACH ROW
BEGIN
	IF NEW.fechaBaja != OLD.fechaBaja AND NEW.fechaBaja != NULL THEN
		UPDATE saacd.saaacd_actividad
		SET estado = 4 #CANCELADA
		WHERE dispositivo_id = NEW.id AND (estado= 1 OR estado=2); #PENDIENTE O EN PROGRESO
        
        SET @model = (SELECT m.nombre FROM saacd.saaacd_fichatecnica ft
					INNER JOIN saacd.saaacd_modelo m ON m.id=ft.modelo_id
                    WHERE ft.id=NEW.fichaTecnica_id);
		IF @model != "ELPLP54" AND @model != "ELPLP58" AND @model != "SF200" THEN
			SET @averageDevicesLifeTime = (SELECT AVG( tiempoVida) FROM saacd.saaacd_dispositivo
											WHERE fichaTecnica_id = NEW.fichaTecnica_id 
                                            AND fechaBaja != NULL );
			UPDATE saacd.saaacd_dispositivo 
            SET prediccionVidaUtil =  @averageDevicesLifeTime
		    WHERE fichaTecnica_id = NEW.fichaTecnica_id AND fechaBaja != NULL; 
	     END IF;
	END IF;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS addDaysToCalendar;
DELIMITER $$
CREATE PROCEDURE addDaysToCalendar(
    startDate DATE, 
    endDate DATE,
    semesterId INT
)
BEGIN
    DECLARE dt DATE DEFAULT startDate;

    WHILE dt <= endDate DO
		INSERT INTO `saacd`.`saaacd_calendario` ( `diaHabil`, `semestre_id`) VALUES (dt, semesterId);
        SET dt = DATE_ADD(dt,INTERVAL 1 day);
    END WHILE;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS removeDaysFromCalendar;
DELIMITER $$
CREATE PROCEDURE removeDaysFromCalendar(
    startDate DATE, 
    endDate DATE,
    semesterId INT
)
BEGIN
    DELETE FROM saacd.saaacd_calendario WHERE diaHabil BETWEEN startDate AND endDate AND semestre_id=semesterId;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS insert_semester_days;
DELIMITER $$
CREATE TRIGGER insert_semester_days
AFTER INSERT ON saacd.saaacd_semestre FOR EACH ROW
BEGIN
	CALL addDaysToCalendar( NEW.inicio , NEW.fin, NEW.id);
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS change_semester_period;
DELIMITER $$
CREATE TRIGGER change_semester_period
AFTER UPDATE ON saacd.saaacd_semestre FOR EACH ROW
BEGIN
    IF OLD.inicio > NEW.inicio THEN
		CALL addDaysToCalendar( NEW.inicio , date_add(OLD.inicio, INTERVAL -1 DAY), NEW.id);
	ELSEIF OLD.inicio < NEW.inicio THEN 
		CALL removeDaysFromCalendar(OLD.inicio, date_add(NEW.inicio, INTERVAL -1 DAY));	
	END IF;
    
    IF OLD.fin > NEW.fin THEN
		CALL removeDaysFromCalendar(date_add(NEW.fin, INTERVAL 1 DAY), OLD.fin);	
	ELSEIF OLD.fin < NEW.fin THEN 
		CALL addDaysToCalendar( date_add(OLD.fin, INTERVAL 1 DAY)  , NEW.fin, NEW.id);
    END IF;
END$$
DELIMITER ;

	
###Catálogos:
#Semestre
INSERT INTO `saacd`.`saaacd_semestre` (`id`, `nombre`, `inicio`, `fin`, `esActivo`) VALUES (
	1	,	"2021-2"	,	"2021-02-15"	,	"2021-06-11"	,	0	);
INSERT INTO `saacd`.`saaacd_semestre` (`id`, `nombre`, `inicio`, `fin`, `esActivo`) VALUES (
	2	,	"2021-1"	,	 "2020-09-21"	,	 "2021-01-29"	,	1	 );
INSERT INTO `saacd`.`saaacd_semestre` (`id`, `nombre`, `inicio`, `fin`, `esActivo`) VALUES (
	3	,	"2020-2"	,	"2020-01-27"	,	"2020-08-21"	,	0	);
INSERT INTO `saacd`.`saaacd_semestre` (`id`, `nombre`, `inicio`, `fin`, `esActivo`) VALUES (
	4	,	"2020-1"	,	"2019-08-05"	,	"2019-11-22"	,	0	);
commit;

#Tipo de Dispositivo
INSERT INTO `saacd`.`saaacd_tipodispositivo` (`id`, `nombre`) VALUES (	1	,	"Lámpara de proyector"	);
INSERT INTO `saacd`.`saaacd_tipodispositivo` (`id`, `nombre`) VALUES (	2	,	"Proyector"	);
INSERT INTO `saacd`.`saaacd_tipodispositivo` (`id`, `nombre`) VALUES (	3	,	"Pizarrón Electrónico"	);
INSERT INTO `saacd`.`saaacd_tipodispositivo` (`id`, `nombre`) VALUES (	4	,	"Teclado"	);
INSERT INTO `saacd`.`saaacd_tipodispositivo` (`id`, `nombre`) VALUES (	5	,	"CPU"	);
commit;

#Marca
INSERT INTO `saacd`.`saaacd_marca` (`id`, `nombre`) VALUES (	1	,	"HP"	);
INSERT INTO `saacd`.`saaacd_marca` (`id`, `nombre`) VALUES (	2	,	"EPSON"	);

INSERT INTO `saacd`.`saaacd_marca` (`id`, `nombre`) VALUES (	3	,	"DELL"	);
commit;

#Modelo 
INSERT INTO `saacd`.`saaacd_modelo` (`id`, `nombre`, `marca_id`) VALUES (	1	,	 "ELPLP58"	,	2	);
INSERT INTO `saacd`.`saaacd_modelo` (`id`, `nombre`, `marca_id`) VALUES (	2	,	 "ELPLP54"	,	2	);

INSERT INTO `saacd`.`saaacd_modelo` (`id`, `nombre`, `marca_id`) VALUES (	3	,	 "Inspiron15R"	,	3	);
commit;

#FichaTecnica #Revisar punto en precio porque excel maneja comas
INSERT INTO `saacd`.`saaacd_fichatecnica` (`id`, `garantiaFabricante`, `precio`, `modelo_id`) VALUES (	1	,	2	,	937.57	,	2	);

INSERT INTO `saacd`.`saaacd_fichatecnica` (`id`, `garantiaFabricante`, `precio`, `modelo_id`) VALUES ('2', '3', '928.10', '1');
INSERT INTO `saacd`.`saaacd_fichatecnica` (`id`, `garantiaFabricante`, `precio`, `modelo_id`) VALUES ('3', '1', '15000', '3');
commit;

#Tipo de Ubicacion
INSERT INTO `saacd`.`saaacd_tipoubicacion` (`id`, `nombre`) VALUES (	1	,	"Edificio"	);
INSERT INTO `saacd`.`saaacd_tipoubicacion` (`id`, `nombre`) VALUES (	2	,	"Salón"	);
INSERT INTO `saacd`.`saaacd_tipoubicacion` (`id`, `nombre`) VALUES (	3	,	"Sala"	);
INSERT INTO `saacd`.`saaacd_tipoubicacion` (`id`, `nombre`) VALUES (	4	,	"Equipo"	);
INSERT INTO `saacd`.`saaacd_tipoubicacion` (`id`, `nombre`) VALUES (	5	,	"Zona"	);
commit;

#Ubicacion
INSERT INTO `saacd`.`saaacd_ubicacion` (`id`, `nombre`, `altitud`, `exposicionSol`, `regionGeografica_id`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES (	1	,	"J"	,	0	,	0	,	null	,	1	,	null	);
INSERT INTO `saacd`.`saaacd_ubicacion` (`id`, `nombre`, `altitud`, `exposicionSol`, `regionGeografica_id`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES (	2	,	"I"	,	0	,	0	,	null	,	1	,	null	);
INSERT INTO `saacd`.`saaacd_ubicacion` (`id`, `nombre`, `altitud`, `exposicionSol`, `regionGeografica_id`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES (	13	,	"B"	,	2277	,	0	,	null	,	3	,	null	);
commit;
INSERT INTO `saacd`.`saaacd_ubicacion` (`id`, `nombre`, `altitud`, `exposicionSol`, `regionGeografica_id`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES (	3	,	"J205B"	,	2277	,	0	,	null	,	2	,	1	);
INSERT INTO `saacd`.`saaacd_ubicacion` (`id`, `nombre`, `altitud`, `exposicionSol`, `regionGeografica_id`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES (	4	,	"1"	,	2277	,	0	,	null	,	4	,	13	);
INSERT INTO `saacd`.`saaacd_ubicacion` (`id`, `nombre`, `altitud`, `exposicionSol`, `regionGeografica_id`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES (	5	,	"2"	,	2277	,	0	,	null	,	4	,	13	);
INSERT INTO `saacd`.`saaacd_ubicacion` (`id`, `nombre`, `altitud`, `exposicionSol`, `regionGeografica_id`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES (	6	,	"3"	,	2277	,	0	,	null	,	4	,	13	);
INSERT INTO `saacd`.`saaacd_ubicacion` (`id`, `nombre`, `altitud`, `exposicionSol`, `regionGeografica_id`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES (	7	,	"J101"	,	2274	,	0	,	null	,	2	,	1	);
INSERT INTO `saacd`.`saaacd_ubicacion` (`id`, `nombre`, `altitud`, `exposicionSol`, `regionGeografica_id`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES (	8	,	"J102"	,	2274	,	0	,	null	,	2	,	1	);
INSERT INTO `saacd`.`saaacd_ubicacion` (`id`, `nombre`, `altitud`, `exposicionSol`, `regionGeografica_id`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES (	9	,	"J103"	,	2274	,	0	,	null	,	2	,	1	);
INSERT INTO `saacd`.`saaacd_ubicacion` (`id`, `nombre`, `altitud`, `exposicionSol`, `regionGeografica_id`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES (	10	,	"I201"	,	2277	,	0	,	null	,	2	,	2	);
INSERT INTO `saacd`.`saaacd_ubicacion` (`id`, `nombre`, `altitud`, `exposicionSol`, `regionGeografica_id`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES (	11	,	"I202"	,	2277	,	0	,	null	,	2	,	2	);
INSERT INTO `saacd`.`saaacd_ubicacion` (`id`, `nombre`, `altitud`, `exposicionSol`, `regionGeografica_id`, `tipoUbicacion_id`, `ubicacionSuperior_id`) VALUES (	12	,	"I203"	,	2277	,	0	,	null	,	2	,	2	);
commit;


#Dispositivo
INSERT INTO `saacd`.`saaacd_dispositivo` (`id`, `tiempoVida`,`prediccionVidaUtil`, `inventarioUNAM`,`serie`,`resguardo`, `fechaBaja`, `fechaAlta`, `motivoBaja`, `fichaTecnica_id`, `tipoDispositivo_id`, `ubicacion_id`) VALUES (	1	,	72	,	80	,	"528ERYYU"	,	"52618973"	,	"7588522139"	,	"2020-10-16"	,	"2020-10-01"	,	"Defecto de fábrica"	,	1	,	1	,	7	);
INSERT INTO `saacd`.`saaacd_dispositivo` (`id`, `tiempoVida`,`prediccionVidaUtil`, `inventarioUNAM`,`serie`,`resguardo`, `fechaBaja`, `fechaAlta`, `motivoBaja`, `fichaTecnica_id`, `tipoDispositivo_id`, `ubicacion_id`) VALUES (	2	,	0	,	0	,	"529PLOWQ"	,	"8963247"	,	"5693058621"	,	null	,	"2020-10-12"	,	null	,	1	,	1	,	10	);

commit;
#Categoria
INSERT INTO `saacd`.`saaacd_categoria` (`id`, `nombre`, `categoriaSuperior_id`) VALUES (	1	,	"Mantenimiento preventivo y correctivo a equipos de cómputo y medios."	,	null);	
INSERT INTO `saacd`.`saaacd_categoria` (`id`, `nombre`, `categoriaSuperior_id`) VALUES (	9	,	"Soporte sistema de seguridad instalado en los salones."	,	null	);
INSERT INTO `saacd`.`saaacd_categoria` (`id`, `nombre`, `categoriaSuperior_id`) VALUES (	5	,	"Administración de actividades."	,	null	);
commit;
INSERT INTO `saacd`.`saaacd_categoria` (`id`, `nombre`, `categoriaSuperior_id`) VALUES (	2	,	"Actualización de Software."	,	1	);
commit;
INSERT INTO `saacd`.`saaacd_categoria` (`id`, `nombre`, `categoriaSuperior_id`) VALUES (	3	,	"Actualización de paquetería."	,	1	);
INSERT INTO `saacd`.`saaacd_categoria` (`id`, `nombre`, `categoriaSuperior_id`) VALUES (	4	,	"Actualización de MATLAB."	,	2	);

INSERT INTO `saacd`.`saaacd_categoria` (`id`, `nombre`, `categoriaSuperior_id`) VALUES (	6	,	"Generar hojas de asistencia de las salas de cómputo."	,	5	);
INSERT INTO `saacd`.`saaacd_categoria` (`id`, `nombre`, `categoriaSuperior_id`) VALUES (	7	,	"Registro de usuarios que usan las salas de cómputo."	,	5	);
INSERT INTO `saacd`.`saaacd_categoria` (`id`, `nombre`, `categoriaSuperior_id`) VALUES (	8	,	"Falla operacional del material."	,	null	);
INSERT INTO `saacd`.`saaacd_categoria` (`id`, `nombre`, `categoriaSuperior_id`) VALUES (	10	,	"Extravío de material."	,	9	);

#Información Escolar
INSERT INTO `saacd`.`saaacd_informacionescolar` (`id`, `duracionSemestral`, `duracionMensual`, `numClasesSemanal`, `semestre_id`, `ubicacion_id`) VALUES (	1	,	80	,	20	,	15	,	2	,	10	);
INSERT INTO `saacd`.`saaacd_informacionescolar` (`id`,  `numClasesSemanal`, `semestre_id`, `ubicacion_id`) VALUES (	2	,	25	,	1	,	10	);

#Horario Clase
INSERT INTO `saacd`.`saaacd_horarioclase` (`id`, `horasClase`, `diaSemana`, `infoEscolar_id`) VALUES (	1	,	7	,	2	,	1	);
INSERT INTO `saacd`.`saaacd_horarioclase` (`id`, `horasClase`, `diaSemana`, `infoEscolar_id`) VALUES (	2	,	8	,	3	,	1	);
INSERT INTO `saacd`.`saaacd_horarioclase` (`id`, `horasClase`, `diaSemana`, `infoEscolar_id`) VALUES (	3	,	9	,	4	,	1	);
INSERT INTO `saacd`.`saaacd_horarioclase` (`id`, `horasClase`, `diaSemana`, `infoEscolar_id`) VALUES (	4	,	5	,	5	,	1	);
INSERT INTO `saacd`.`saaacd_horarioclase` (`id`, `horasClase`, `diaSemana`, `infoEscolar_id`) VALUES (	5	,	6	,	6	,	1	);
INSERT INTO `saacd`.`saaacd_horarioclase` (`id`, `horasClase`, `diaSemana`, `infoEscolar_id`) VALUES (	6	,	2	,	7	,	1	);


#Actividad
INSERT INTO `saacd`.`saaacd_actividad`
(`id`,`estado`,`prioridad`,`comentario`,`fechaResolucion`,
`fechaAlta`,`fechaRequerido`,`esPeticion`,`actividadSuperior_id`,`categoria_id`,`dispositivo_id`,`semestre_id`,
`ubicacion_id`,`usuario_id`) VALUES(	1	,	1	,	2	,	"Imprimir dos copias"	,	null	,	"2020-10-16"	,	null	,	0	,	null	,	6	,	null	,	2	,	3	,	1	);

INSERT INTO `saacd`.`saaacd_actividad`
(`id`,`estado`,`prioridad`,`comentario`,`fechaResolucion`,
`fechaAlta`,`fechaRequerido`,`esPeticion`,`actividadSuperior_id`,`categoria_id`,`dispositivo_id`,`semestre_id`,
`ubicacion_id`,`usuario_id`) VALUES(	2	,	2	,	1	,	"Profesor comenta que en la clase anterior tampoco funcionaba. Su clase fue a las 10 am."	,	null	,	"2020-06-01"	,	"2020-06-02"	,	1	,	null	,	8	,	1	,	2	,	7	,	1	);



#CASOS 
INSERT INTO `saacd`.`saaacd_actividad` 
(`estado`, `prioridad`, `comentario`, `fechaAlta`, `categoria_id`, `dispositivo_id`, `semestre_id`, `ubicacion_id`, `usuario_id`) VALUES 
 (3, 1, 'Profesor comenta que en la clase anterior tampoco funcionaba. Su clase fue a las 10 am.', '2020-06-06', '7', '2', '3', '3', '1');
 
INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `fechaResolucion`, `fechaAlta`, `fechaRequerido`, `esSiniestro`, `categoria_id`, `dispositivo_id`, `semestre_id`, `ubicacion_id`, `usuario_id`) VALUES (
2, 2, 'Profesor  requiere que se atienda para su siguiente clase.', '2020-06-12', '2020-06-06', '2020-06-09', '1', '8', '2', '3', '3', '2');

INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `comentario`, `fechaResolucion`, `fechaAlta`, `categoria_id`, `dispositivo_id`, `semestre_id`, `ubicacion_id`, `usuario_id`) VALUES (
'e', 'b', 'Resuelto', '2020-06-02', '2020-06-01', '6', '2', '3', '4', '2');****

INSERT INTO `saacd`.`saaacd_actividad` (`estado`, `prioridad`, `fechaAlta`, `actividadSuperior_id`, `categoria_id`, `dispositivo_id`, `semestre_id`, `ubicacion_id`, `usuario_id`) VALUES (
'p', 'a', '2020-06-07', '2', '8', '2', '3', '3', '1');



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

