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
				let LyF;
				if(Coop.Dom_pcia_cod==0){
					LyF = Coop.Dom_pcia;
					ubica = `<b>${LyF}</b>, `
				}else{
					ubica = `provincia de <b>${Coop.Dom_pcia}</b>, `
					if(Coop.Dom_pcia_cod==1) ubica += `partido de <b>${Coop.Dom_pdodep}</b>, `
					else ubica += `departamento de <b>${Coop.Dom_pdodep}</b>, `
					if(Coop.Dom_otra_loca!=''){
						LyF=Coop.Dom_otra_loca;
						ubica += `localidad de <b>${Coop.Dom_otra_loca}</b>, `
					}else{
						buscoRaro=Coop.Dom_loca.indexOf("(",0);
						if(buscoRaro>0){
							Coop.Dom_loca=Coop.Dom_loca.substring(0,buscoRaro).trimEnd();
						}
						LyF=Coop.Dom_loca;
						ubica += `localidad de <b>${Coop.Dom_loca}</b>, `
					}
				}

				const daName = (tipo)=>{
					if(tipo=='viv') return 'VIVIENDA'
					else return 'TRABAJO'
				}
				
				if(Coop.NoBoleta) noBole = ''
				else noBole = '<li>Boleta de depósito correspondiente al 5% del capital suscripto.</li>'
				
				LyF += `, ${Coop.FActa.split('-')[2]} de ${nombre_meses[Coop.FActa.split('-')[1]-1]} de ${Coop.FActa.split('-')[0]}`

				if(Coop.Dom_calle) domicil = Coop.Dom_calle
				if(Coop.Dom_num) domicil += ', Nº '+Coop.Dom_num
				if(Coop.Dom_piso) domicil += ', piso '+Coop.Dom_piso
				if(Coop.Dom_dto) domicil += ', departamento '+Coop.Dom_dto
				if(Coop.Dom_adic) domicil += ', datos adicionales '+Coop.Dom_adic

				if(Coop.TipoCoop=='r1000') firma2 = 'Síndico'
					else firma2 = 'Secretario'

				let notapresHTML = `<p align="right">${LyF}</p><p>&nbsp;</p><p>&nbsp;</p> <p>&nbsp;</p><p class="cua">SEÑOR <br />PRESIDENTE DEL INAES<br>
					Avda. Belgrano 1656<br>C1093AAR - Ciudad Autónoma de Buenos Aires</p><p>&nbsp;</p>
					<p>&nbsp;</p><p align="justify"><b>${Coop.Asocs[0].Apellidos}, ${Coop.Asocs[0].Nombres}</b> 
					y <b>${Coop.Asocs[1].Apellidos}, ${Coop.Asocs[1].Nombres}</b> en su carácter de
					Presidente y ${firma2} respectivamente, de la Cooperativa de <b>${daName(Coop.TipoCoop)} ${Coop.Denominacion} </b>LIMITADA, 
					se dirigen  respetuosamente al Sr. Presidente, solicitando la inscripción de esta Cooperativa en el Registro Nacional,
					su reconocimiento y autorización para funcionar, conforme a lo prescripto por la Ley Nº 20.337.</p>	<p align="justify">
					A los efectos de cumplimentar los requisitos establecidos por la mencionada Ley, se acompaña:<br><ol type="1">
					<li>Copia del Acta Constitutiva y Estatuto Social.</li>
					<li>Copia del Acta de Distribución de Cargos del Consejo de Administración.</li>
					<li>Declaración jurada unificada.</li>
					 ${noBole} 
					<li>Fotocopia de DNI y CUIL/CUIT de todos los socios fundadores.</li></ol></p>
					<p align="justify">Asimismo dejamos constancia que la cooperativa fija domicilio legal en la calle <b>${domicil}</b>, ${ubica} Código Postal: ${Coop.Dom_preCP+Coop.Dom_CP+Coop.Dom_posCP}, 
					Teléfono Fijo: ${Coop.ConTel_cod}-${Coop.ConTel_num}, Teléfono Celular: ${Coop.ConTel_cod}-${Coop.ConTel_cel}, Correo electrónico: ${Coop.ConEmail}.</p>
					<p align="justify">El señor/a ${Coop.ConApellido}, ${Coop.ConNombres}; Documento de Identidad Nº${Coop.ConNroDoc} ha sido autorizado por el Consejo de Administración para representar a la Cooperativa durante el trámite de inscripción.</p>
					<p align="justify">Agradeciendo del Señor Presidente se sirva dar curso favorable a lo solicitado, le saluda atentamente.</p>
					<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>
					<table border="0" width="100%">
					  <tr>
					    <td style="border-top:1px solid #000" width="33%" align="center"><b><script type="text/javascript">document.write(secre_name);</script></b></td>
					    <td width="33%" align="center">&nbsp;</td>
					    <td style="border-top:1px solid #000" width="33%" align="center"><b><script type="text/javascript">document.write(presi_name);</script></b></td>
					  </tr>
					  <tr>
					    <td width="33%" align="center">${firma2}</td>
					    <td width="33%" align="center">&nbsp;</td>
					    <td width="33%" align="center">Presidente</td>
					  </tr>
					</table>`
				
				let firstBlockHTML=`<center><P><b>DECLARACION&nbsp;JURADA</b></P></center><P>&nbsp;</P><p align="justify">
					Por medio de la presente declaramos <b>en carácter de declaración jurada</b> que:</p><P >&nbsp;</P>
					<ol type="1">
					<li>No existe relación de parentesco que impida el ejercicio del cargo para el que fueron electos/as los/as integrantes de los órganos de administración y fiscalización.</li>
					<li>Ninguno de los/as integrantes del Consejo de Administración y Fiscalización se encuentran alcanzados/as por las restricciones establecidas en la Ley 20.337 y en el Estatuto.</li>
					<li>Se constituye la cooperativa con el objeto de ayuda mutua contemplado en la Ley Nº 20.337 y resoluciones emanadas de la autoridad de aplicación.</li>
					<li>Fijamos como domicilio electrónico, donde nos daremos por notificados de todo requerimiento y/o comunicación que realice el INAES, el siguiente correo electrónico: ${Coop.ConEmail}</li>
					</ol>
					<P>A los efectos de facilitar la comunicación podrán contactar a ${Coop.ConApellido}, ${Coop.ConNombres} con teléfono número (${Coop.ConTel_cod})(${Coop.ConTel_num}) y Whatsapp  +549 (${Coop.ConTel_cod})(${Coop.ConTel_cel}).</P>
					<P>&nbsp;</P>
					<p align="right">${LyF}.</p>`

				let secondBlockHTML=`<table  width="100%" cellpadding="0" cellspacing="0" border="1"><tr><th height="50" width="35%">Firma</th>
					<th height="50" width="48%">Aclaración y Cargo</th><th height="50" width="17%">DNI</th></tr>`
				for(el in Coop.Asocs){
					let a=Coop.Asocs[el]
					if(a.Id_Cargo<1030){
						secondBlockHTML += `<tr><td height="50" width="33%">&nbsp;</td><td height="50" width="33%">${a.Apellidos}, ${a.Nombres}<br>${a.Cargo}</td><td height="50" width="33%">${a.NroDoc}</td></tr>`
					}
				}
				secondBlockHTML += '</table>`<p class="pie">Las firmas que anteceden fueron puestas ante mí. Conste.</p>`<div class="saltopagina"></div>'
				document.querySelector('DIV').innerHTML=firstBlockHTML+secondBlockHTML+notapresHTML
				window.print()
			}
		}
	}
}else{
	alert('No se pasaron los parametros.')
	window.close()
}