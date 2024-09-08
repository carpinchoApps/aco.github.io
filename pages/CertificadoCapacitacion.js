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

				if(Coop.Dom_calle) domicil = Coop.Dom_calle
				if(Coop.Dom_num) domicil += ', Nº '+Coop.Dom_num
				if(Coop.Dom_piso) domicil += ', piso '+Coop.Dom_piso
				if(Coop.Dom_dto) domicil += ', departamento '+Coop.Dom_dto
				if(Coop.Dom_adic) domicil += ', datos adicionales '+Coop.Dom_adic

				if(Coop.Dom_pcia_cod==0) {
					ubica =`${Coop.Dom_pcia}.`
				}else{
					if(Coop.Dom_otra_loca!='') {
						ubica = `${Coop.Dom_otra_loca}, `
					}
					else{
						buscoRaro=Coop.Dom_loca.indexOf("(",0);
						if(buscoRaro>0){
							Coop.Dom_loca=Coop.Dom_loca.substring(0,buscoRaro).trimEnd();
						} 
						ubica = `${Coop.Dom_loca}, `
					}
					if(Coop.Dom_pcia_cod==1) {
						ubica += `partido de ${Coop.Dom_pdodep}, `
					}
					else {
						ubica += `departamento de ${Coop.Dom_pdodep}, `
					}
					ubica += `provincia de ${Coop.Dom_pcia}.`
				}
				
				const daName = (tipo)=>{
					if(tipo=='viv') return 'VIVIENDA'
					else return 'TRABAJO'
				}

				let firstBlockHTML =`<table class="datos"><tr><th colspan="3"  scope="row">Denominación de la entidad: Cooperativa de ${daName(Coop.TipoCoop)} ${Coop.Denominacion} Ltda.</th></tr>
					<tr><th colspan="2" scope="row" width="65%">Domicilio: ${domicil}, ${ubica}</th>
					<th scope="row">Fecha del curso: ${Coop.FActa.split('-')[2]}/${nombre_meses[Coop.FActa.split('-')[1]-1]}/${Coop.FActa.split('-')[0]}</th></tr>
					<tr><th scope="row">Teléfono: (${Coop.ConTel_cod})-(${Coop.ConTel_num})</th>
					<th scope="row">Celular: (${Coop.ConTel_cod})-(${Coop.ConTel_cel})</th>
					<th scope="row">Correo electrónico: ${Coop.ConEmail} </th></tr></table>`

				let secondBlockHTML = `<table width="100%"  cellspacing="0" cellpadding="2" class="asistentes">
					<tr><th colspan="4" scope="col">Datos de los asistentes</th></tr>
					<tr><th scope="col">Apellido y Nombres</th><th width="12%" scope="col">Tipo y Nº Doc.</th>
					<th scope="col">Domicilio</th><th width="20%" scope="col">Firma</th></tr>`
					//el bucle para cada socio
				
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
							domicil += `, ${a.Dom_pcia}.`
						}else{
							buscoRaro=a.Dom_loca.indexOf("(",0);
							if(buscoRaro>0){
								a.Dom_loca=a.Dom_loca.substring(0,buscoRaro).trimEnd();
							}
							domicil += `, ${a.Dom_loca}.`
						}
					}
					secondBlockHTML += `<tr><td class='noBorde'>${a.Apellidos}, ${a.Nombres}</td><td>${a.TipoDoc} ${a.NroDoc}</td><td>${domicil}</td><td>&nbsp;</td>`
				}
				secondBlockHTML += `</table>`
				document.querySelector('DIV').innerHTML=firstBlockHTML+secondBlockHTML
				window.print()
			}
		}
	}
}else{
	alert('No se pasaron los parametros.')
	window.close()
}