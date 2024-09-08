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
					let LyF
					if(Coop.Dom_pcia_cod==0) {
						LyF = Coop.Dom_pcia
						ubica = `<b>${LyF}</b>, `
					}else{
						ubica = `provincia de <b>${Coop.Dom_pcia}</b>, `
						if(Coop.Dom_pcia_cod==1) ubica += `partido de <b>${Coop.Dom_pdodep}</b>, `
						else ubica += `departamento de <b>${Coop.Dom_pdodep}</b>, `
						if(Coop.Dom_otra_loca!='') {
							LyF=Coop.Dom_otra_loca
							ubica += `localidad de <b>${Coop.Dom_otra_loca}</b>, `
						}
						else{
							buscoRaro=Coop.Dom_loca.indexOf("(",0);
							if(buscoRaro>0){
								Coop.Dom_loca=Coop.Dom_loca.substring(0,buscoRaro).trimEnd();
							}
							LyF=Coop.Dom_loca
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

					let exencionBoletaHTML = `<p align="right">${LyF}</p><p>&nbsp;</p><p>&nbsp;</p> <p>&nbsp;</p><p class="cua">SEÑOR <br />PRESIDENTE DEL INAES<br>
						Avda. Belgrano 1656<br>C1093AAR - Ciudad Autónoma de Buenos Aires</p><p>&nbsp;</p>
						<p>&nbsp;</p><p align="justify"><b>${Coop.Asocs[0].Apellidos}, ${Coop.Asocs[0].Nombres}</b> 
						y <b>${Coop.Asocs[1].Apellidos}, ${Coop.Asocs[1].Nombres}</b> en su carácter de
						Presidente y ${firma2} respectivamente, de la Cooperativa de <b>${daName(Coop.TipoCoop)} ${Coop.Denominacion} </b>LIMITADA, 
						se dirigen  respetuosamente al Sr. Presidente, solicitando se exceptúe a la cooperativa, por motivos extraordinarios,  ya que el personal del banco  nos solicita el acta constitutiva, y/o siendo este de difícil acceso desde nuestra localidad, de la presentación de la boleta de depósito del 5% del capital suscripto, permaneciendo en nuestro poder dicho capital.</p>	<p align="justify">
						</p>
						<p align="justify">Agradeciendo del Señor Presidente se sirva dar curso favorable a lo solicitado, le saluda atentamente.</p>
						<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>
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
					
					document.querySelector('DIV').innerHTML=exencionBoletaHTML
					window.print()
					}
			}
	}
}else{
	alert('No se pasaron los parametros.')
	window.close()
}