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
				let ha = parseInt(Coop.HActa)+2
				let ha2 = ha+':30'
				let firstBlockHTML = `<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p><b>ACTA Nº 1 DEL CONSEJO DE ADMINISTRACION, DISTRIBUCION DE CARGOS.- - -</b></p><p align="justify">`
				if(Coop.Dom_pcia_cod==0) {
					firstBlockHTML += `En la <b>${Coop.Dom_pcia}</b>, `
					ubica =`${Coop.Dom_pcia}.`
				}else{
					if(Coop.Dom_otra_loca!='') {
						firstBlockHTML += `En <b>${Coop.Dom_otra_loca}</b>, `
						ubica = `${Coop.Dom_otra_loca}, `
					}
					else{ 
						buscoRaro=Coop.Dom_loca.indexOf("(",0);
						if(buscoRaro>0){
							Coop.Dom_loca=Coop.Dom_loca.substring(0,buscoRaro).trimEnd();
						}
						firstBlockHTML += `En <b>${Coop.Dom_loca}</b>, `
						ubica = `${Coop.Dom_loca}, `
					}
					if(Coop.Dom_pcia_cod==1) {
						firstBlockHTML += `partido de <b>${Coop.Dom_pdodep}</b>, `
						ubica += `partido de ${Coop.Dom_pdodep}, `
					}
					else {
						firstBlockHTML += `departamento de <b>${Coop.Dom_pdodep}</b>, `
						ubica += `departamento de ${Coop.Dom_pdodep}, `
					}
					firstBlockHTML += `provincia de <b>${Coop.Dom_pcia}</b>, `
					ubica += `provincia de ${Coop.Dom_pcia}.`
				}
				
				const daName = (tipo)=>{
					if(tipo=='viv') return 'VIVIENDA'
					else return 'TRABAJO'
				}
				if(Coop.Dom_calle) domicil = Coop.Dom_calle
				if(Coop.Dom_num) domicil += ', Nº '+Coop.Dom_num
				if(Coop.Dom_piso) domicil += ', piso '+Coop.Dom_piso
				if(Coop.Dom_dto) domicil += ', departamento '+Coop.Dom_dto
				if(Coop.Dom_adic) domicil += ', datos adicionales '+Coop.Dom_adic
				
				firstBlockHTML += `a los ${Coop.FActa.split('-')[2]} días, del mes de ${nombre_meses[Coop.FActa.split('-')[1]-1]} de ${Coop.FActa.split('-')[0]} siendo
				siendo la hora ${ha} se reúnen los Consejeros electos en la Asamblea Constitutiva de la Cooperativa de 
				<b>${daName(Coop.TipoCoop)} ${Coop.Denominacion}</b> Limitada, celebrada con fecha ${Coop.FActa.split('-')[2]} de 
				${nombre_meses[Coop.FActa.split('-')[1]-1]} de ${Coop.FActa.split('-')[0]} a efectos de proceder a la distribución de cargos tal como lo prescribe el 
				Estatuto Social. Abierto el acto pasóse al tratamiento del punto en cuestión y luego de un cambio de opiniones resolvióse la integración del Consejo de Administración de la siguiente forma:</p>` 
				
				let secondBlockHTML = '<div align="left"><table border="0" width="100%">'
				for(el in Coop.Asocs){
					let a=Coop.Asocs[el]
					if(a.Id_Cargo<1020){secondBlockHTML += `<tr><td width="25%">${a.Cargo}:</td><td width="75%"><b>${a.Apellidos}, ${a.Nombres}</b></td></tr>`}
				}
				
				secondBlockHTML += `</table></div><p>Se deja constancia de que el domicilio legal de la entidad es ${domicil}, ${ubica}</p>
				<p>A los efectos de obtener la CUIT de la entidad se designa como Administrador de Relaciones (AR) a ${Coop.Asocs[0].Apellidos}, ${Coop.Asocs[0].Nombres}, también se decide adherir al Domicilio Fiscal Electrónico a través de la casilla de correo electrónico ${Coop.ConEmail}, se declara como número telefónico de telefonía móvil ${Coop.ConTel_cod} ${Coop.ConTel_cel}, de la empresa ${Coop.Empresa}. Se declara como domicilio fiscal el mencionado previamente como domicilio legal.</p>
				<p>No habiendo otro asunto que considerar, se levantó la sesión, siendo las <b>${ha2}</b> horas.</p>`
				if(Coop.TipoCoop=='r1000') {
					secondBlockHTML += `<div class="firmante"><b> ${Coop.Asocs[0].Apellidos}, ${Coop.Asocs[0].Nombres} </b><br>Presidente</div>`
				}
				else {
					secondBlockHTML += `<div class="firmante"><b> ${Coop.Asocs[1].Apellidos}, ${Coop.Asocs[1].Nombres} </b><br>Secretario/a</div><div class="firmante"><b> ${Coop.Asocs[0].Apellidos}, ${Coop.Asocs[0].Nombres} </b><br>Presidente</div>`
				}
				secondBlockHTML += `<p class="pie">Las firmas que anteceden fueron puestas ante mí. Conste.</p>`

				document.querySelector('DIV').innerHTML=firstBlockHTML+secondBlockHTML
				window.print()
			}
		}
	}
}else{
	alert('No se pasaron los parametros.')
	window.close()
}