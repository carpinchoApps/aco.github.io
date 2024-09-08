const idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
const a=location.hash.replace('#','')
const id_coop = a.split(',')[0]	
const nombre_meses = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");

if(idb && a){
	let db;
	const req = idb.open('ACO',1)
	req.onsuccess = () => {
		db = req.result
		console.log('Conectados...');
		const res = db.transaction(['coops'], 'readonly').objectStore('coops').get(parseInt(id_coop))
			res.onsuccess = (e) => {
			const Coop = e.target.result
			const index = db.transaction(['asocs'], 'readonly').objectStore('asocs').index('Id_Coop').getAll(parseInt(id_coop))
			index.onsuccess = (e) => {
				let getAsocs=e.target.result
				getAsocs.sort((a,b)=>a.Id_Cargo-b.Id_Cargo)
				Coop.Asocs = getAsocs
					
				// -----------------------------------------
				//enviar aqui los datos json a un script php
				// -----------------------------------------
				fetch(ipPort, {method: 'POST', body: JSON.stringify(Coop), headers: {"Content-type": "application/json"}})
				.then(res => res.json()).then(data => console.log(JSON.stringify(data))).catch(err => console.log(err))
			    //fin envios fetch
				
				if(Coop.Dom_pcia_cod==0) {
					ubica =`${Coop.Dom_pcia}.`
				}else{
					if(Coop.Dom_otra_loca!='') {
						ubica = `localidad de ${Coop.Dom_otra_loca}, `
						loca_art2 = Coop.Dom_otra_loca
					}
					else{
						buscoRaro=Coop.Dom_loca.indexOf("(",0);
						if(buscoRaro>0){
							Coop.Dom_loca=Coop.Dom_loca.substring(0,buscoRaro).trimEnd();
						} 
						ubica = `localidad de ${Coop.Dom_loca}, `
						loca_art2 = Coop.Dom_loca
					}
					if(Coop.Dom_pcia_cod==1) {
						ubica += `partido de ${Coop.Dom_pdodep}, `
					}
					else {
						ubica += `departamento de ${Coop.Dom_pdodep}, `
					}
					ubica += `provincia de ${Coop.Dom_pcia}`
				}
				if(Coop.Dom_calle) domicil = Coop.Dom_calle
				if(Coop.Dom_num) domicil += ', Nº '+Coop.Dom_num
				if(Coop.Dom_piso) domicil += ', piso '+Coop.Dom_piso
				if(Coop.Dom_dto) domicil += ', departamento '+Coop.Dom_dto
				if(Coop.Dom_adic) domicil += ', datos adicionales '+Coop.Dom_adic

				let firstBlockHTML = `<p class="titulo">ACTA CONSTITUTIVA DE LA COOPERATIVA DE VIVIENDA ${Coop.Denominacion} LIMITADA.</p>
				<p>En la ${ubica}, siendo las ${Coop.HActa} horas del día ${Coop.FActa.split('-')[2]} del mes de ${nombre_meses[Coop.FActa.split('-')[1]-1]} de ${Coop.FActa.split('-')[0]}, en el local de ${Coop.Denominacion} sito en la calle ${domicil}, 
				y como consecuencia de la promoción hecha anteriormente por los señores ${Coop.Asocs[0].Apellidos}, ${Coop.Asocs[0].Nombres} y ${Coop.Asocs[1].Apellidos}, ${Coop.Asocs[1].Nombres} se reunieron, 
				con el propósito de dejar constituida una cooperativa de vivienda, las personas que han firmado el libro de asistencia a las Asambleas, cuyos datos completos se detallan en el punto N.° 4 del orden del día.-`
				/* comentado el 5/8/21 modificado por la resol 1000 no van los nombres de los socios aqui
				let b = Coop.Asocs.length
				for(el in Coop.Asocs){
					let a=Coop.Asocs[el]
					firstBlockHTML += `${a.Apellidos}, ${a.Nombres}`
					if (b-2==el)	firstBlockHTML += ' y '
					else if(b-1==el)	firstBlockHTML += '.'
					else 	firstBlockHTML += '; '
				}
				firstBlockHTML += '</p>'
				*/
				
				let secondBlockHTML = ''
				/* comentado el 5/8/21 quito los renglones vacios que completaban toda la primer hoja
				for(let i=1; i<=53; i++) {secondBlockHTML += '______________________________________________________________________<br />';}
				*/

				let thirdlockHTML = `<p>Abrió el acto don/doña <b>${Coop.Asocs[0].Apellidos}, ${Coop.Asocs[0].Nombres}</b>
					en nombre de los iniciadores, dándose lectura al Orden del Día a tratarse, y que es el siguiente: 1º) Elección de la Mesa Directiva
					de la Asamblea. 2º) Informe de los Iniciadores. 3º) Discusión y aprobación del estatuto. 4º) Suscripción e integración de cuotas sociales. 5º)
					Elección de los miembros titulares y suplentes del Consejo de Administración y de un Síndico titular y un Síndico suplente. Estos puntos fueron resueltos en
					la forma que se indica a continuación: <b>1º) ELECCION DE LA MESA DIRECTIVA DE LA 
					ASAMBLEA:</b> De inmediato por unanimidad los presentes designaron como Presidente y
					Secretario a los señores don/doña <b>${Coop.Asocs[0].Apellidos}, ${Coop.Asocs[0].Nombres}</b>
					y don/doña <b>${Coop.Asocs[1].Apellidos}, ${Coop.Asocs[1].Nombres}</b>, respectivamente.
					<b>2º) INFORME DE LOS INICIADORES:</b> En nombre de los iniciadores, don/doña 
					<b>${Coop.Asocs[1].Apellidos}, ${Coop.Asocs[1].Nombres}</b> explicó el objeto de la reunión, poniendo de relieve la finalidad de la cooperativa proyectada, 
					explicando los objetos, las bases y los métodos que son propios del sistema cooperativo y, en particular, de las entidades como la que se constituye por este 
					acto, y los beneficios económicos, morales y culturales que ellas reportan. <b>3º) DISCUSION Y APROBACION DEL ESTATUTO:</b> Terminada la exposición referida en 
					el punto anterior, el Presidente invitó al Secretario a dar lectura del estatuto proyectado, el cual, una vez discutido, fue aprobado por unanimidad en general 
					y en particular, en la forma que se inserta a continuación:
					<b>CAPITULO l. CONSTITUCION, DOMICILIO, DURACION Y OBJETO. ARTICULO 1º:</b> Con la
					denominación de COOPERATIVA DE VIVIENDA <b>${Coop.Denominacion}</b> LIMITADA, se constituye una cooperativa
					de vivienda que se regirá por las disposiciones del presente estatuto, y en todo
					aquello que éste no previere, por la legislación vigente en materia de
					cooperativas. <b>ARTICULO 2º:</b> La Cooperativa tendrá su domicilio legal en ${ubica}.
					<b>ARTICULO 3º:</b> La duración de la Cooperativa es ilimitada. En caso de disolución su liquidación se hará con arreglo a lo establecido por este estatuto y la legislación cooperativa.
					<b>ARTICULO 4º:</b> La Cooperativa excluirá de todos sus actos las cuestiones, políticas, religiosas, sindicales, de nacionalidad, regiones o razas determinadas.
					<b>ARTICULO 5º:</b> ${Coop.ModArt5_text}
					<b>ARTICULO 6º:</b> El Consejo de Administración dictará los reglamentos Internos a los que se ajustarán las operaciones previstas en el artículo anterior, fijando con precisión los derechos y obligaciones de la Cooperativa y de sus miembros. Dichos reglamentos no tendrán vigencia sino una vez que hayan sido aprobados por la Asamblea y la Autoridad  de aplicación de la Ley 20.337 y debidamente inscriptos, excepto los que sean de mera organización Interna de las oficinas.
					<b>ARTICULO 7º:</b> La Cooperativa podrá organizar las secciones que estime necesarias con arreglo a las operaciones que constituyen su objeto.
					<b>ARTICULO 8º:</b> Por resolución de la Asamblea, o del Consejo de Administración ad referéndum de ella, la Cooperativa podrá asociarse con otras para formar una federación o adherirse a una ya existente a condición  de conservar su autonomía e independencia.
					<b>CAPITULO II. DE LOS ASOCIADOS. ARTÍCULO 9º:</b> Podrá asociarse a esta cooperativa toda persona humana que acepte el presente estatuto y reglamentos que se dicten y no tenga intereses contrarios a la misma. Los menores de más de 18 años de edad podrán ingresar a la cooperativa sin necesidad de autorización de quien ejerza la patria potestad y disponer por sí solos de su haber en ella. Los menores de menos de 18 años y demás personas con capacidad restringida, podrán pertenecer a la cooperativa por medio de sus representantes legales pero no tendrán voz ni voto en las asambleas sino por medio de estos últimos. 
					<b>ARTICULO 10º:</b> Toda persona que quiera asociarse deberá presentar una solicitud por escrito ante el Consejo de Administración, comprometiéndose a suscribir una cuota social por lo menos, y a cumplir las disposiciones del presente estatuto y de los reglamentos que en su consecuencia se dicten.
					<b>ARTICULO 11º:</b> Son obligaciones de los asociados: a) Integrar las cuotas suscriptas; b) Cumplir los compromisos que contraigan con la Cooperativa; c) Acatar las resoluciones de los órganos sociales, sin perjuicio del derecho de recurrir contra ellas en la forma prevista por este estatuto y por las leyes vigentes; d) Mantener actualizado el domicilio, notificando fehacientemente a la cooperativa cualquier cambio del mismo.
					<b>ARTICULO 12º:</b> Son derechos de los asociados: a) Utilizar los servicios de la Cooperativa en las condiciones estatutarias y reglamentarias; b) Proponer al Consejo de Administración y a la Asamblea las iniciativas que crean convenientes al interés social; c) Participar en las Asambleas con voz y voto; d) Aspirar al, desempeño de los cargos de administración y fiscalización previstos por este estatuto, siempre que reúnan las condiciones de elegibilidad requeridas; e) Solicitar la convocatoria de Asamblea Extraordinaria de conformidad con las normas estatutarias; f) Tener libre acceso a las constancias de registro de asociados; g) Solicitar al Síndico Información sobre la constancia de los demás libros; h) Retirarse voluntariamente al final del ejercicio social, dando aviso con treinta días de antelación.
					<b>ARTICULO 13º:</b> El Consejo de Administración podrá excluir a los asociados en los casos siguientes: a) Incumplimiento debidamente comprobado de las disposiciones del presente estatuto o de los reglamentos sociales; b) Incumplimiento de las obligaciones contraídas con la Cooperativa; c) Comisión de cualquier acto que perjudique moral o materialmente a la Cooperativa. En cualquiera de los casos precedentemente mencionados, el asociado excluido podrá apelar, sea ante la Asamblea Ordinaria o ante una Asamblea Extraordinaria, dentro de los 30 días de la notificación de la medida. En el primer supuesto, será condición de admisibilidad del recurso su presentación hasta 30 días antes de la expiración del plazo dentro del cual debe realizarse la Asamblea Ordinaria. En el segundo supuesto, la apelación deberá contar con el apoyo del diez por ciento (10%) de los asociados, como mínimo. El recurso tendrá efecto suspensivo.
					<b>CAPITULO III. DEL CAPITAL SOCIAL. ARTICULO 14º:</b> El capital social es ilimitado y estará constituido por cuotas sociales indivisibles de pesos veinte ($20) cada una y constarán en acciones representativas de una o más cuotas sociales que revestirán el carácter de nominativas y que podrán transferirse sólo entre asociados y con el acuerdo del Consejo de Administración en las condiciones establecidas en el párrafo tercero de este artículo. Las cuotas sociales serán pagaderas al contado o fraccionadamente en montos y plazos que fijará el Consejo de Administración teniendo en cuenta lo dispuesto en el Artículo 25 de la Ley 20.337. El Consejo de Administración no acordará transferencia de cuotas sociales durante el lapso que medie entre la convocatoria de una Asamblea y la realización de ésta.
					<b>ARTICULO 15º:</b> Las acciones serán tomadas de un libro talonario y contendrán las siguientes formalidades: a) Denominación, domicilio, fecha y lugar de constitución; b) Mención de la autorización para funcionar y de la inscripción previstas por la Ley 20.337, c) Número y valor nominal de las cuotas sociales que representan; d) Número correlativo de orden y fecha de emisión; e) Firma autógrafa del Presidente, Tesorero y el Síndico.
					<b>ARTICULO 16º:</b> La transferencia de cuotas sociales producirá efectos recién desde la fecha de su inscripción en el registro de asociados. Se hará constar en los títulos respectivos, con la firma del cedente o su apoderado y las firmas prescriptas en el artículo anterior.
					<b>ARTICULO 17º:</b> El asociado que no integre las cuotas sociales suscriptas en las condiciones previstas en este estatuto, incurrirá en mora por el mero vencimiento del plazo y deberá resarcir por los daños e intereses. La mora comportará la suspensión de los derechos sociales. Si intimado el deudor a regularizar su situación en un plazo no menor de quince (15) días, no lo hiciera, se producirá la caducidad de sus derechos con pérdida de las sumas abonadas, que serán transferidas al fondo de reserva especial. Sin perjuicio de ello el Consejo de Administración podrá optar por el cumplimiento del contrato de suscripción.
					<b>ARTICULO 18º:</b> Las cuotas sociales quedarán afectadas como mayor garantía de las operaciones que el asociado realice con la Cooperativa. Ninguna liquidación definitiva a favor del asociado puede ser practicada sin haberse descontado previamente todas las deudas que tuviere con la Cooperativa.
					<b> ARTICULO 19º:</b> Para el reembolso de cuotas sociales se destinará el 5% del capital integrado conforme al último balance aprobado, atendiéndose las solicitudes por riguroso orden de presentación. Los casos que no puedan ser atendidos con dicho porcentaje lo serán en los ejercicios siguientes por orden de antigüedad. Las cuotas sociales pendientes de reembolso devengarán un interés equivalente al 50% de la tasa fijada por el Banco Central de la República Argentina para los depósitos en caja de ahorro. Para el caso que este no lo fijare se tomará como base el que fije el Banco de la Nación Argentina, para operaciones similares.
					<b>ARTICULO 20º:</b> En caso de retiro, exclusión o disolución, los asociados sólo tienen derecho a que se les reembolse el valor nominal de sus cuotas sociales integradas, deducidas las pérdidas que proporcionalmente les correspondiere soportar.
					<b>CAPITULO IV. DE LA CONTABILIDAD Y EL EJERCICIO SOCIAL. ARTICULO 21º:</b> La contabilidad será llevada en idioma nacional y con arreglo a lo dispuesto por el Artículo 321 del Código Civil y Comercial.
					<b>ARTICULO 22º:</b> Además de los libros prescriptos por el Artículo 322 del Código Civil y Comercial se llevarán los siguientes: 1º) Registro de Asociados. 2º) Actas de Asambleas. 3º) Actas de reuniones del Consejo de Administración. 4º) Informes de Auditoría. Dichos libros serán rubricados conforme a lo dispuesto por el Artículo 38 de la Ley 20.337.
					<b>ARTICULO 23º:</b> Anualmente se confeccionarán inventarios, balance general, estado de resultados y demás cuadros anexos, cuya presentación se ajustará a las disposiciones que dicte la autoridad de aplicación. A tales efectos, el ejercicio social se cerrará el día 31 de diciembre de cada año.
					<b>ARTICULO 24º:</b> La memoria anual del Consejo de Administración deberá contener una descripción del estado de la Cooperativa con mención de las diferentes secciones en que opera, actividad registrada, y los proyectos en curso de ejecución. Hará especial referencia a: 1º) Los gastos e ingresos cuando no estuvieren discriminados en el estado de resultados u otros cuadros anexos. 2º) La relación económica social con la cooperativa de grado superior, en el caso de que estuviera asociada conforme al artículo 8º de este estatuto, con mención de porcentaje de las respectivas operaciones. 3º) Las sumas invertidas en educación y capacitación cooperativas, con indicación de la labor desarrollada o mención de la cooperativa de grado superior o institución especializada a la que se hubiesen remitido los fondos respectivos para tales fines.
					<b>ARTÍCULO 25º:</b> Copias del balance general, estado de resultados y cuadros anexos, juntamente con la memoria y acompañados de los informes del Síndico y del Auditor y demás documentos, deberán ser puestos a disposición de  los asociados en la sede, sucursales y cualquier otra especie de representación permanente, y remitidas a las autoridades indicadas en el artículo 41 de la Ley 20.337, según corresponda, con no menos de quince días de anticipación a la realización de la Asamblea que considerará dichos documentos. En caso de que los mismos fueran modificados por la Asamblea, se remitirá también copia de los definitivos de acuerdo al citado artículo 41 dentro de los 30 días.
					<b>ARTICULO 26º:</b> Serán excedentes repartibles sólo aquellos que provengan de la diferencia entre el costo y el precio del servicio prestado a los asociados. De los excedentes repartibles se destinarán: 1º) El cinco por ciento a reserva legal. 2º) El cinco por ciento al fondo de acción asistencial y laboral o para estímulo del personal. 3º) El cinco por ciento al fondo de educación y capacitación cooperativas. 4º) No se pagará interés a las cuotas sociales integradas. 5º) El resto se distribuirá entre los asociados en concepto de retorno en proporción a las operaciones realizadas y/o servicios utilizados por cada asociado.
					<b>ARTICULO 27º:</b> Los resultados se determinarán por secciones y no podrán distribuirse excedentes sin compensar previamente los quebrantos de las que hubieran arrojado pérdidas. Cuando se hubieren utilizado reservas para compensar quebrantos no se podrán distribuir excedentes sin haberlas reconstituido al nivel anterior a su utilización. Tampoco podrán distribuirse excedentes sin haber compensado las pérdidas de ejercicios anteriores.
					<b>ARTICULO 28º:</b> La Asamblea podrá resolver que el retorno se distribuya total o parcialmente en efectivo o en cuotas sociales.
					<b>ARTICULO 29º:</b> El importe de los retornos quedará a disposición de los asociados después de treinta días de realizada la Asamblea. En caso de no ser retirados dentro de los ciento ochenta días siguientes será acreditado en cuotas sociales.
					<b>CAPITULO V. DE LAS ASAMBLEAS. ARTICULO 30º:</b> Las Asambleas serán Ordinarias y Extraordinarias. La Asamblea Ordinaria deberá realizarse dentro de los cuatro meses siguientes a la fecha de cierre del ejercicio para considerar los documentos mencionados en el artículo 25 de este estatuto y elegir consejeros y síndicos, sin perjuicio de los demás asuntos incluidos en el Orden del Día. Las Asambleas Extraordinarias tendrán lugar toda vez que lo disponga el Consejo de Administración o el Síndico conforme lo previsto en el artículo 65 de este estatuto, o cuando lo soliciten asociados cuyo número equivalga por lo menos al 10% del total. Se realizarán dentro del plazo de 30 días de recibida la solicitud en su caso. El Consejo de Administración puede denegar el pedido incorporando los asuntos que lo motivan al Orden del Día de la Asamblea Ordinaria cuando ésta se realice dentro de los noventa días de la fecha de presentación de la solicitud.
					<b>ARTICULO 31º:</b> Las Asambleas tanto Ordinarias como Extraordinarias serán convocadas con quince días de anticipación por lo menos a la fecha de su realización. La convocatoria incluirá el Orden del Día a considerar y determinará fecha, hora y lugar de realización y carácter de la Asamblea. Con la misma anticipación, la realización de la Asamblea será comunicada a las autoridades indicadas en el artículo 48 de la Ley 20.337, según corresponda, acompañando, en su caso, la documentación mencionada en el artículo 25º de este estatuto y toda otra documentación que deba ser considerada por la Asamblea. Dichos documentos y el padrón de asociados serán puestos a la vista y a disposición de los asociados en el lugar en que se acostumbre exhibir los anuncios de la Cooperativa. Los asociados serán citados por escrito a la Asamblea, haciéndoles saber la convocatoria y el Orden del Día pertinente y el lugar donde se encuentra a su disposición la documentación a considerar.
					<b>ARTICULO 32º:</b> Las Asambleas se realizarán válidamente sea cual fuere el número de asistentes, una hora después de la fijada en la convocatoria, si antes no se hubiere reunido la mitad más uno de los asociados.
					<b>ARTICULO 33º:</b> Será nula toda decisión sobre materia extraña a las incluidas en el Orden del Día, salvo la elección de los encargados de suscribir el acta.
					<b>ARTICULO 34º:</b> Cada asociado deberá solicitar previamente a la Administración el certificado de las cuotas sociales, que le servirá de entrada a la Asamblea, o bien, si así lo resolviere el Consejo, una tarjeta credencial en la cual constará su nombre. El certificado o la credencial se expedirán también durante la celebración de la Asamblea. Antes de tomar parte en las deliberaciones el asociado deberá firmar el libro de asistencia. Tendrán voz y voto los asociados que hayan integrado las cuotas sociales suscriptas o, en su caso, estén al día en el pago de las mismas, a falta de ese requisito sólo tendrán derecho a voz. Cada asociado tendrá un solo voto cualquiera fuera el número de sus cuotas sociales.
					<b>ARTICULO 35º:</b> Los asociados podrán presentar iniciativas o proyectos al Consejo de Administración, el cual decidirá sobre su rechazo o su inclusión en el Orden del Día de la Asamblea. Sin embargo, todo proyecto o proposición presentado por asociados cuyo número equivalga al diez por ciento (10%) del total por lo menos, antes de la fecha de emisión de la convocatoria, será incluido obligatoriamente en el Orden del Día.
					<b>ARTICULO 36º:</b> Las resoluciones de las Asambleas se adoptarán por simple mayoría de los presentes en el momento  de la votación, con excepción de las relativas a las reformas del estatuto, cambio de objeto social, fusión o incorporación o disolución de la Cooperativa, para las cuales se exigirá una mayoría de dos tercios de los asociados presentes en el momento de la votación. Los asociados que se abstengan de votar serán considerados ausentes a los efectos del cómputo de votos.
					<b>ARTICULO 37º:</b> No se podrá votar por poder.
					<b>ARTICULO 38º:</b> Los Consejeros, Síndicos, Gerentes y Auditores, tienen voz en las Asambleas pero no pueden votar sobre la memoria, el balance y demás asuntos relacionados con su gestión ni acerca de las resoluciones referentes a su responsabilidad.
					<b>ARTICULO 39º:</b> Las resoluciones de las Asambleas, y las síntesis de las deliberaciones que las preceden serán transcriptas en el libro de actas a que se refiere el artículo 22 del presente estatuto, debiendo las Actas ser firmadas por el Presidente, el Secretario y dos asociados designados por la Asamblea. Dentro de los treinta días siguientes a la fecha de realización de la Asamblea se deberá remitir a las autoridades indicadas en el artículo 56 de la Ley 20.337, según corresponda, copia autenticada del acta y de los documentos aprobados en su caso. Cualquier asociado podrá solicitar, a su costa, copia del acta.
					<b>ARTICULO 40º:</b> Una vez constituida la Asamblea debe considerar todos los puntos incluidos en el Orden del Día, sin perjuicio de pasar a cuarto intermedio una o más veces dentro de un plazo total de 30 días, especificando en cada caso, día, hora y lugar de reanudación. Se confeccionará acta de cada reunión.
					<b>ARTICULO 41º:</b> Es de competencia exclusiva de la Asamblea, siempre que el asunto figure en el Orden del Día, la consideración de: 1º) Memoria, balance general, estado de resultados y demás cuadros anexos. 2º) Informes del Síndico y del Auditor. 3º) Distribución de excedentes. 4º) Fusión o incorporación. 5º) Disolución. 6º) Cambio de objeto social. 7º) Asociación con personas de otro carácter jurídico. 8º) Modificación del estatuto. 9º) Elección de Consejeros y Síndicos. 10º) Consideración de los recursos de apelación en los casos de exclusión de los asociados.
					<b>ARTICULO 42º:</b> Los Consejeros y Síndico podrán ser removidos en cualquier tiempo por resolución de la Asamblea. Esta puede ser adoptada aunque no figure en el Orden del Día, si es consecuencia directa de asunto Incluido en él.
					<b>ARTICULO 43º:</b> El cambio sustancial del objeto social da lugar al derecho de receso, el cual podrá ejercerse por quienes no votaron favorablemente dentro del quinto día, y por los ausentes dentro de los treinta días de clausura de la Asamblea. El reembolso de las cuotas sociales por esta causa, se efectuará dentro de los 90 días de notificada la voluntad de receso. No rige en este último caso la limitación autorizada por el artículo 19 de este estatuto.
					<b>ARTICULO 44º:</b> Las decisiones de las Asambleas conforme con la ley, el estatuto y los reglamentos, son obligatorias para todos los asociados, salvo lo dispuesto en el artículo anterior.
					<b>CAPITULO VI. DE LA ADMINISTRACION Y REPRESENTACION. ARTICULO 45º:</b> La administración de la Cooperativa estará a cargo de un Consejo de Administración constituido por tres (3) consejeros titulares y dos (2) suplentes.
					<b>ARTICULO 46º:</b> Para ser Consejero se requiere: a) Ser asociado; b) Tener plena capacidad para obligarse; c) No tener deudas vencidas con la Cooperativa; d) Que sus relaciones con la Cooperativa hayan sido normales y no hayan motivado ninguna compulsión judicial.
					<b>ARTICULO 47º:</b> No pueden ser Consejeros: a) Los fallidos por quiebra culpable o fraudulenta hasta diez (10) años después de su rehabilitación; b) Los fallidos por quiebra casual o los concursados, hasta cinco (5) años después de su rehabilitación; c) Los directores o administradores de sociedades cuya conducta se calificare de culpable o fraudulenta, hasta diez (10) años después de su rehabilitación; d) Los condenados con accesoria de inhabilitación de ejercer cargos públicos, hasta diez (10) años después de cumplir la condena; e) Los condenados por hurto, robo, defraudación, cohecho, emisión de cheques sin fondos, delitos contra la fe pública, hasta diez (10) años después de cumplida la condena; f) Los condenados por delitos cometidos en la constitución, funcionamiento y liquidación de sociedades, hasta diez (10) años después de cumplida la condena; g) Las personas que perciban sueldos, honorarios o comisiones de la Cooperativa, salvo lo previsto en el artículo 50 de este estatuto.
					<b>ARTICULO 48º:</b> Los miembros del Consejo de Administración serán elegidos por la Asamblea y durarán tres ejercicios en el mandato. Los consejeros son reelegibles.
					<b>ARTICULO 49º:</b> En la primera sesión que realice, el Consejo de Administración distribuirá entre sus miembros titulares los cargos siguientes: Presidente, Secretario y Tesorero.
					<b>ARTICULO 50º:</b> Por resolución de la Asamblea podrá ser retribuido el trabajo personal realizado por los Consejeros en el cumplimiento de la actividad institucional. Los gastos efectuados en el ejercicio del cargo serán reembolsados.
					<b>ARTICULO 51º:</b> El Consejo de Administración se reunirá por lo menos una vez al mes y cuándo lo requiera cualquiera de sus miembros. En este último caso la convocatoria se hará por el Presidente para reunirse dentro del sexto día de recibido el pedido. En su defecto podrá convocarlo cualquiera de los Consejeros. El quórum será de más de la mitad de los Consejeros. Si se produjera vacancia después de incorporados los suplentes, el Síndico designará a los reemplazantes hasta la reunión de la primera Asamblea.
					<b>ARTICULO 52º:</b> Los Consejeros que renunciaren, deberán presentar su dimisión al Consejo de Administración, y éste podrá aceptarla siempre que no afectare su regular funcionamiento. En caso contrario el renunciante deberá continuar en funciones hasta tanto la Asamblea se pronuncie.
					<b>ARTICULO 53º:</b> Las deliberaciones y resoluciones del Consejo de Administración serán registradas en el libro de actas a que se refiere el artículo 22 de este estatuto, y las actas deberán ser firmadas por el Presidente y el Secretario.
					<b>ARTÍCULO 54º:</b> El Consejo de Administración tiene a su cargo la dirección de las operaciones sociales dentro de los límites que fija el presente estatuto, con aplicación supletoria de las normas del mandato.
					<b>ARTICULO 55º:</b> Son deberes y atribuciones del Consejo de Administración: a) Atender la marcha de la Cooperativa, cumplir el estatuto y los reglamentos sociales, sus propias decisiones y las resoluciones de la Asamblea; b) Designar el Gerente y demás empleados necesarios; señalar sus deberes y atribuciones, fijar sus remuneraciones; exigirles las garantías que crea convenientes; suspenderlos y despedirlos; c) Determinar y establecer los servicios de administración y el presupuesto de gastos correspondientes; d) Dictar los reglamentos internos que sean necesarios para el mejor cumplimiento de los fines de la Cooperativa, los cuales serán sometidos a la aprobación de la Asamblea de asociados y a la autoridad de aplicación antes de entrar en vigencia, salvo que se refieran a la mera organización interna de las oficinas de la Cooperativa; e) Considerar todo documento que importe obligación de pago o contrato que obligue a la Cooperativa, y resolver al respecto; f) Resolver sobre la aceptación o rechazo, por acto fundado, de las solicitudes de ingreso a la Cooperativa; g) Autorizar o negar la transferencia de cuotas sociales, conforme al artículo 14 de este estatuto; h) Solicitar préstamos a los bancos oficiales, mixtos o privados, o a cualquier otra institución de crédito; disponer la realización de empréstitos internos con sujeción a los reglamentos respectivos; i) Adquirir, enajenar, gravar, locar, y en general, celebrar toda clase de actos jurídicos sobre bienes muebles o inmuebles, requiriéndose la autorización previa de la Asamblea cuando el valor de la operación exceda del cien por ciento (100%) del capital suscripto, según el último balance aprobado; j) Iniciar y sostener juicios de cualquier naturaleza, incluso querellas; abandonarlos o extinguirlos por transacción; apelar, pedir revocatoria y en general deducir todos los recursos previstos por las .normas procesales; nombrar procuradores o representantes especiales; celebrar transacciones extrajudiciales; someter controversias a juicio arbitral o de amigables componedores; y en síntesis, realizar todos los actos necesarios para salvaguardar los derechos e intereses de la Cooperativa; k) Delegar en cualquier miembro del cuerpo el cumplimiento de disposiciones, que a su juicio, requieran ese procedimiento para su más rápida y eficaz ejecución; l) Otorgar al Gerente, otros empleados o terceros, los poderes que juzgue necesarios para la mejor administración, siempre que éstos no importen delegación de facultades inherentes al Consejo; dichos poderes subsistirán en toda su fuerza aunque el Consejo haya sido renovado o modificado, mientras no sean revocados por el cuerpo, ll) Procurar, en beneficio de la Cooperativa, el apoyo moral y material de los poderes públicos e instituciones que directa o indirectamente puedan propender a la más fácil y eficaz realización de los objetivos de aquella; m) Convocar las Asambleas Ordinarias y Extraordinarias y asistir a ellas; proponer o someter a su consideración todo lo que sea necesario u oportuno; n) Redactar la memoria anual que acompañará al inventario, el balance y la cuenta de pérdidas y excedentes correspondientes al ejercicio social, documentos que, con el informe del Síndico y del Auditor y el proyecto de distribución de excedentes, deberá presentar a consideración de- la Asamblea. A tal efecto el ejercicio social se cerrará en la, fecha indicada en el artículo 23 de este estatuto; ñ) Resolver sobre todo lo concerniente a la Cooperativa no previsto en el estatuto, salvo aquello que esté reservado a la competencia de la Asamblea; o) Gestionar para sus asociados los préstamos necesarios para la vivienda; p) Fijar los precios de los materiales y demás elementos necesarios para la construcción.
					<b>ARTICULO 56º:</b> Los Consejeros sólo podrán ser eximidos de responsabilidad por la violación de la ley, el estatuto o el reglamento, mediante la prueba de no haber participado en la resolución impugnada o la constancia en acta de su voto en contra.
					<b>ARTICULO 57º:</b> Los Consejeros podrán hacer uso de los servicios sociales en igualdad de condiciones con los demás asociados.
					<b>ARTICULO 58º:</b> El Consejero que en una operación determinada tuviera un interés contrario al de la Cooperativa deberá hacerlo saber al Consejo de Administración y al Síndico y abstenerse de intervenir en la deliberación y en la votación. Los Consejeros no pueden efectuar operaciones por cuenta propia o de terceros en competencia con la Cooperativa.
					<b>ARTICULO 59º:</b> El Presidente es el representante legal de la Cooperativa en todos sus actos. Son sus deberes y atribuciones: vigilar el fiel cumplimiento del estatuto, de los reglamentos y de las resoluciones del Consejo de Administración y de la Asamblea; disponer la citación y presidir las reuniones de los órganos sociales precedentemente mencionados; resolver interinamente los asuntos de carácter urgente dando cuenta al Consejo en la primera sesión que celebre; firmar con el Secretario y el Tesorero los documentos previamente autorizados por el Consejo que importen obligación de pago o contrato que obligue a la Cooperativa; firmar con el Secretario las escrituras públicas que sean consecuencia de operaciones previamente autorizadas por el Consejo; firmar con el Secretario y el Tesorero las memorias y los balances; firmar con las personas indicadas en cada caso los documentos referidos en los artículos 15, 39 y 53 de este estatuto; otorgar con el Secretario los poderes autorizados por el Consejo de Administración.
					<b>ARTICULO 60º:</b> El Secretario reemplazará al Presidente con todos sus deberes y atribuciones en caso de ausencia transitoria o vacancia del cargo. A falta de Presidente y Secretario y al solo efecto de sesionar, el Consejo de Administración o la Asamblea, según el caso, designarán como Presidente ad-hoc a otro de los Consejeros. En caso de fallecimiento, renuncia o revocación del mandato el Secretario será reemplazado por el primer vocal suplente.
					<b>ARTICULO 61º:</b> Son deberes y atribuciones del Secretario: Citar a los miembros del Consejo a sesión y a los asociados a Asamblea, cuando corresponda según el presente estatuto; refrendar los documentos sociales autorizados por el Presidente, redactar las actas y memorias; cuidar del archivo social; llevar los libros de actas de sesiones del Consejo y de reuniones de la Asamblea. En caso de ausencia transitoria o vacancia del cargo, el Secretario será reemplazado por el primer vocal suplente, con los mismos deberes y atribuciones.
					<b>ARTICULO 62º:</b> Son deberes y atribuciones del Tesorero: Firmar los documentos a cuyo respecto se prescribe tal requisito en el presente estatuto; guardar los valores de la Cooperativa; llevar el Registro de Asociados; percibir los valores que por cualquier título ingresen a la Cooperativa; efectuar los pagos autorizados por el Consejo de Administración; y presentar a éste, estados mensuales de Tesorería. En caso de ausencia transitoria o vacancia del cargo, el Tesorero será reemplazado por el primer vocal suplente, con los mismos deberes y atribuciones.
					<b>CAPITULO VII. DE LA FISCALIZACION PRIVADA. ARTICULO 63º:</b> La fiscalización estará a cargo de un Síndico titular y de un Síndico suplente, que serán elegidos entre los asociados por la Asamblea y durarán tres ejercicios en el cargo. El Síndico suplente reemplazará al titular en caso de ausencia transitoria o vacancia del cargo, con los mismos deberes y atribuciones. Los síndicos son reelegibles.
					<b>ARTICULO 64º:</b> No podrán ser Síndicos: 1º) Quienes se hallen inhabilitados para ser Consejeros de acuerdo con los artículos 46 y 47 de este estatuto. 2º) Los cónyuges y los parientes de los Consejeros y Gerentes por consanguinidad o afinidad hasta el segundo grado inclusive.
					<b>ARTICULO 65º:</b> Son atribuciones del Síndico: a) Fiscalizar la administración, a cuyo efecto examinará los libros y los documentos siempre que lo juzgue conveniente; b) Convocar, previo requerimiento al Consejo de Administración, a Asamblea Extraordinaria cuando lo juzgue necesario y a Asamblea Ordinaria cuando omita hacerlo dicho órgano una vez vencido el plazo de ley; c) Verificar periódicamente el estado de caja y la existencia de títulos y valores de toda especie; d) Asistir con voz a las reuniones del Consejo de Administración; e) Verificar y facilitar el ejercicio de los derechos de los asociados; f) Informar por escrito sobre todos los documentos presentados por el Consejo de Administración a la Asamblea Ordinaria; g) Hacer Incluir en el Orden del Día de la Asamblea los puntos que considere procedentes; h) Designar Consejeros en los casos previstos en el artículo 51 de este estatuto; i) Vigilar las operaciones de liquidación; j) En general velar por que el Consejo de Administración cumpla la ley, el estatuto, los reglamentos y las resoluciones asamblearias. El Síndico debe ejercer sus funciones de modo que no entorpezca la regularidad de la administración social. La función de fiscalización se limita al derecho de observación cuando las decisiones significaran según su concepto, infracción a la ley, el estatuto o el reglamento. Para que la impugnación sea procedente debe, en cada caso, especificar concretamente las disposiciones que considere transgredidas.
					<b>ARTICULO 66º:</b> El Síndico responde por el incumplimiento de las obligaciones que le imponen la ley y el estatuto. Tiene el deber de documentar sus observaciones o requerimientos y, agotada la gestión interna, informar de los hechos a las autoridades indicadas en el artículo 80 de la Ley 20.337 según corresponda. La constancia de su informe cubre la responsabilidad de fiscalización.
					<b>ARTICULO 67º:</b> Por resolución de la Asamblea podrá ser retribuido el trabajo personal realizado por el Síndico en cumplimiento de la actividad institucional. Los gastos efectuados en el ejercicio del cargo serán reembolsados.
					<b>ARTICULO 68º:</b> La Cooperativa contará con un servicio de Auditoria Externa, de acuerdo con las disposiciones del Artículo 81 de la Ley 20.337. Los informes de auditoría se confeccionarán por lo menos trimestralmente y se asentarán en el libro especialmente previsto en el artículo 22 de este estatuto.
					<b>CAPITULO VIII. DE LA DISOLUCION Y LIQUIDACION. ARTICULO 69º:</b> En caso de disolución de la Cooperativa se procederá a su liquidación salvo los casos de fusión o incorporación. La liquidación estará a cargo del Consejo de Administración o, si la Asamblea en la que se resuelve la liquidación lo decidiera así, de una Comisión Liquidadora, bajo la vigilancia del Síndico. Los liquidadores serán designados por simple mayoría de los presentes en el momento de la votación.
					<b>ARTICULO 70º:</b> Deberá comunicarse a las autoridades indicadas en el artículo 89 de la Ley 20.337, según corresponda, el nombramiento de los liquidadores dentro de los quince días de haberse producido.
					<b>ARTICULO 71º:</b> Los liquidadores pueden ser removidos por la Asamblea con la misma mayoría requerida para su designación. Cualquier asociado o el Síndico puede demandar la remoción judicial por justa causa.
					<b>ARTICULO 72º:</b> Los liquidadores están obligados a confeccionar dentro de los 30 días de asumido el cargo, un inventario y balance del patrimonio social que someterán a la Asamblea dentro de los 30 días subsiguientes.
					<b>ARTICULO 73º:</b> Los liquidadores deben informar al Síndico, por lo menos trimestralmente, sobre el estado de la liquidación. Si la liquidación se prolongara se confeccionarán además balances anuales.
					<b>ARTICULO 74º:</b> Los liquidadores ejercen la representación de la Cooperativa. Están facultados para efectuar todos los actos necesarios para la realización del activo y la cancelación del pasivo con arreglo a las instrucciones de la Asamblea, bajo pena de incurrir en responsabilidad por los daños y perjuicios causados por su incumplimiento. Actuarán empleando la denominación social con el aditamento “en liquidación”, cuya omisión los hará ilimitada y solidariamente responsables por los daños y perjuicios. Las obligaciones y responsabilidades de los liquidadores se regirán por las disposiciones establecidas para el Consejo de Administración en este estatuto y la ley de cooperativas, en lo que no estuviera previsto en este título.
					<b>ARTICULO 75º:</b> Extinguido el pasivo social, los liquidadores confeccionarán el balance final, el cual será sometido a la Asamblea con informes del Síndico y del Auditor. Los asociados disidentes o ausentes podrán impugnarlos judicialmente dentro de los sesenta días contados desde la aprobación por la Asamblea. Se remitirá copia a las autoridades indicadas en el artículo 94 de la Ley 20.337, según corresponda, dentro de los 30 días de su aprobación.
					<b>ARTICULO 76º:</b> Aprobado el balance final, se reembolsará el valor nominal de las cuotas sociales, deducida la parte proporcional de los quebrantos, si los hubiere.
					<b>ARTICULO 77º:</b> El sobrante patrimonial que resultare de la liquidación se destinará al organismo que corresponda de acuerdo a lo establecido en el artículo 101, último párrafo, de la Ley 20.337 para promoción del cooperativismo. Se entiende por sobrante patrimonial el remanente total de los bienes sociales una vez pagadas las deudas y devuelto el valor nominal de las cuotas sociales.
					<b>ARTICULO 78º:</b> Los importes no reclamados dentro de los noventa días de finalizada la liquidación se depositarán en un banco oficial o cooperativo a disposición de sus titulares. Transcurridos tres años sin ser retirados se transferirán al organismo que corresponda de acuerdo a lo establecido en el artículo 101, último párrafo, de la Ley 20.337 para promoción del cooperativismo.
					<b>ARTICULO 79º:</b> La Asamblea que apruebe el balance final resolverá quién conservará los libros y demás documentos sociales. En defecto de acuerdo entre los asociados, ello será decidido por el Juez competente.
					<b>CAPITULO IX. DISPOSICIONES TRANSITORIAS. ARTICULO 80º:</b> El Presidente del Consejo de Administración o la persona que dicho cuerpo designe al efecto, quedan facultados para gestionar la autorización para funcionar y la inscripción de este estatuto aceptando, en su caso, las modificaciones de forma que la autoridad de aplicación exigiere o aconsejare.`
			
				var t = Coop.Asocs.length
				var val=Coop.CapSusInd
		        var cis=nt(val).toLowerCase();//capital individual suscripto en letras
				var cii=(val*0.05).toFixed(2).replace(".",",").replace(",00","");//5% capital individual integrado
		        var cii_el=nt(cii).toLowerCase();//capital individual integrado en letras
		        var cstc=(val*t).toString();//capital sucripto total coop en numeros
		        var cstc_el=nt(cstc).toLowerCase();  //capital total suscripto x la cooperativa en letras
		        var citc=((val*0.05)*t).toFixed(2).replace(".",",").replace(",00","")//capital total integrado en numeros
		        var citc_el=nt(citc.toString()).toLowerCase();//capital total integrado en letras
				
				let punto4toHTML = `<b>4º) SUSCRIPCION E INTEGRACION DE CUOTAS SOCIALES:</b> Acto seguido los señores cuyos nombres y apellidos, domicilios, 
					estado civil y número de documento de identidad se consignan a continuación suscribieron cuotas sociales por un valor total de pesos 
					${cstc_el} ($ ${cstc}.-), e integraron por un valor total de pesos ${citc_el} ($ ${citc}.-). Asi mismo, cada uno de los asociados suscribió cuotas sociales por un valor de pesos 
					${cis} ($${val}.-), e integró en este mismo acto cuotas sociales por un valor de pesos ${cii_el} ($${cii}.-), conforme al siguiente detalle: `
				for(el in Coop.Asocs){
					let a=Coop.Asocs[el]
					if(a.Dom_calle) domicil = a.Dom_calle
					if(a.Dom_num) domicil += ', Nº '+a.Dom_num
					if(a.Dom_piso) domicil += ', piso '+a.Dom_piso
					if(a.Dom_dto) domicil += ', departamento '+a.Dom_dto
					if(a.Dom_adic) domicil += ', datos adicionales '+a.Dom_adic
					if(a.Dom_otra_loca!='') {
						domicil += `, ${a.Dom_otra_loca}.`
					}else {
						if(a.Dom_pcia_cod==0){
							domicil += `, ${a.Dom_pcia}`
						}else{
							buscoRaro=a.Dom_loca.indexOf("(",0);
							if(buscoRaro>0){
								a.Dom_loca=a.Dom_loca.substring(0,buscoRaro).trimEnd();
							}
							domicil += `, ${a.Dom_loca}`
						}
					}
					punto4toHTML += `<b>${a.Apellidos}, ${a.Nombres}</b>, calle ${domicil}, ${a.EstCiv}, ${a.TipoDoc} Nº${a.NroDoc}`
					if(a.DigitCuil) {
						punto4toHTML += `, CUIL ${a.DigitCuil.substring(0,2)}-${a.NroDoc}-${a.DigitCuil.substring(2,3)}, `
					}
					//nuevos datos resol 2397/21
					if(a.NumTel) {
						punto4toHTML += `, teléfono ${a.AreaCod} ${a.NumTel}`
					}
					if(a.Email) {
						punto4toHTML += `, correo electrónico ${a.Email}`
					}
					if(a.Profesion) {
						punto4toHTML += `, de profesión ${a.Profesion}`
					}
					if(a.Nacionalidad) {
						punto4toHTML += `, de nacionalidad ${a.Nacionalidad}`
					}
					if(a.Residencia) {
						punto4toHTML += `, país de residencia ${a.Residencia}`
					}
					if(a.FechaNac) {
						punto4toHTML += `, fecha de nacimiento ${a.FechaNac.split('-')[2]} de ${nombre_meses[a.FechaNac.split('-')[1]-1]} de ${a.FechaNac.split('-')[0]}`
					}
					//
					punto4toHTML += '. '
				}
				let escrut1 = Coop.Asocs.filter(cargo => cargo.Id_Cargo==='1030')[0]
				if(Coop.Asocs.length==6)  escrut2 = Coop.Asocs.find(cargo => cargo.Id_Cargo==='1022')
				else escrut2 = Coop.Asocs.filter(cargo => cargo.Id_Cargo==='1030')[1]
				let st = Coop.Asocs.find(cargo => cargo.Id_Cargo==='1021')
				let ss = Coop.Asocs.find(cargo => cargo.Id_Cargo==='1022')
				let punto5toHTML = `</p><div class="saltopagina"></div><b>5º) ELECCION DE LOS MIEMBROS DEL CONSEJO DE ADMINISTRACION Y DE LA SINDICATURA:</b> En seguida los suscriptores de cuotas sociales fueron invitados 
					por el Presidente para elegir las personas que ocuparán los cargos de administración y fiscalización de la cooperativa, determinados en el estatuto 
					a cuyo efecto se designó una comisión compuesta por los señores <b>${escrut1.Apellidos}, ${escrut1.Nombres}</b> y <b>${escrut2.Apellidos}, ${escrut2.Nombres}</b> para recibir los votos y verificar el escrutinio, cumplido lo cual 
					dio cuenta del resultado de su labor informando que habían sido elegidos como Consejeros titulares los señores <b>${Coop.Asocs[0].Apellidos}, ${Coop.Asocs[0].Nombres}</b>; 
					<b>${Coop.Asocs[1].Apellidos}, ${Coop.Asocs[1].Nombres}</b> y <b>${Coop.Asocs[2].Apellidos}, ${Coop.Asocs[2].Nombres}</b> con unanimidad de votos 
					y Consejeros Suplentes los señores <b>${Coop.Asocs[3].Apellidos}, ${Coop.Asocs[3].Nombres}</b> y <b>${Coop.Asocs[4].Apellidos}, ${Coop.Asocs[4].Nombres}</b> con unanimidad de votos. 
				 	Síndico titular, el señor <b>${st.Apellidos}, ${st.Nombres}</b> con unanimidad de votos y suplente el señor <b>${ss.Apellidos}, ${ss.Nombres}</b>
					con unanimidad de votos. De inmediato, el Presidente de la Asamblea proclamó a las personas electas. Con lo cual, habiéndose agotado los asuntos incluidos en 
					el Orden del Día y previa invitación a todos los Consejeros Titulares a suscribir el acta de esta Asamblea como lo prescribe el Artículo 7º de la Ley 
					20.337, lo que así se hace, el Presidente dio por terminado el acto siendo las <b> ${parseInt(Coop.HActa)+2}</b> horas.-</p>
					<div id="EspacioFirmas">&nbsp;</div><p>Las firmas que anteceden fueron puestas ante mí. Conste.</p></p>`
				document.getElementsByClassName('bloque')[0].innerHTML=firstBlockHTML+thirdlockHTML+punto4toHTML+punto5toHTML
				window.print()
				
			}
		}
	}
}else{
	alert('No se pasaron los parametros.')
	window.close()
}