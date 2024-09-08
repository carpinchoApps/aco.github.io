const idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
const qcoop = document.getElementById('cualcoop')
const con_adm = document.getElementById('display_consejo_adm')
const con_sind = document.getElementById('display_consejo_sind')
const asocs = document.getElementById('display_socios')
const form = document.getElementById('form')
const aler = document.getElementById('aler')
const prin = document.getElementById('linksimpresion')

if(idb){
	let db;
	const req = idb.open('ACO',1)

	req.onsuccess = () => {
		db = req.result
		const trans = db.transaction(['coops'], 'readonly')
		const objSto = trans.objectStore('coops')
		const cuantas = objSto.count()
		cuantas.onsuccess = (e) => { 
			if(cuantas.result==0){
				alert('No se ha cargado ninguna cooperativa')
				location.replace('form1.htm')
			}
		}
		loadCoops()
	}

	req.onerror = (error) => {
			console.log('Error',req.error)
	}

	//*******************************//
	//****  funciones indexedDB ****//
	//*****************************//
	const loadCoops = () => {
		const trans = db.transaction(['coops'], 'readonly')
		const objSto = trans.objectStore('coops')
		const req = objSto.openCursor()
		const frag =document.createDocumentFragment()
		req.onsuccess = (e) => {
			const cursor = e.target.result
			let tip
			if(cursor){
				if(cursor.value.TipoCoop.indexOf('r')>=0){
					tip='TRABAJO'
				}else{
					tip='VIVIENDA'
				}
				const bl = document.createElement('OPTION')
				bl.setAttribute('value', `${cursor.key},${cursor.value.TipoCoop}`)
				bl.textContent =`COOP. de ${tip} ${cursor.value.Denominacion} LTDA. e/f  (${cursor.value.TipoCoop})`
				frag.appendChild(bl)
				cursor.continue()
			}
			else{
				//qcoop.innerHTML =''
				qcoop.appendChild(frag)
			}

		}
	}
	const readAsocs = (id_tipo_coop) => {
		con_adm.innerHTML=''; con_sind.innerHTML='';asocs.innerHTML=''; 
		let id_coop = id_tipo_coop.split(',')[0]
		let tipo_coop = id_tipo_coop.split(',')[1]
		let SCoop=getSpecs(tipo_coop)
		const index = db.transaction(['asocs'], 'readonly').objectStore('asocs').index('Id_Coop')
		var getAllR = index.getAll(parseInt(id_coop));
		var gAllk = index.getAllKeys(parseInt(id_coop));
		getAllR.onsuccess = (e) => {
			let arrS=e.target.result
			gAllk.onsuccess = (e) => {
				const k = e.target.result
				for(i in arrS){arrS[i].Id_As = k[i];}
				arrS.sort((a,b)=>a.Id_Cargo-b.Id_Cargo)
				const frag_cons = document.createDocumentFragment()
				const frag_sind = document.createDocumentFragment()
				const frag_asoc = document.createDocumentFragment()
				var cont_cargos=0
				for(e in SCoop.cargos){
					const res = arrS.find(cargo => cargo.Id_Cargo===(SCoop.cargos[e].cod).toString())
					if(res){cont_cargos++;					}
				}
				var cont_per=0
				for(e in arrS){
					const blq = document.createElement('P')
					blq.setAttribute('class', 'fondoenfiltros')
					if(arrS[e].Id_Cargo==1030){
						blq.innerHTML =`<img src="tut.gif" class="loguitocoop"><span>${arrS[e].Apellidos} ${arrS[e].Nombres}</span> <center><button data-type="update" data-key="${arrS[e].Id_As}" class="btn btn_update">Modificar</button> <button data-type="delete" data-key="${arrS[e].Id_As}" class="btn btn_delete">Borrar</button></center>`	
					}else{
						blq.innerHTML =`<img src="tut.gif" class="loguitocoop"> <b>${arrS[e].Cargo}: </b><span>${arrS[e].Apellidos} ${arrS[e].Nombres}</span> <center><button data-type="update" data-key="${arrS[e].Id_As}" class="btn btn_update">Modificar</button> <button data-type="delete" data-key="${arrS[e].Id_As}" class="btn btn_delete">Borrar</button></center>`	
					}
					if(arrS[e].Id_Cargo>1000 && arrS[e].Id_Cargo<1020){
						frag_cons.appendChild(blq)
					}else if(arrS[e].Id_Cargo>1020 && arrS[e].Id_Cargo<1029){
						frag_sind.appendChild(blq)
					}else{
						frag_asoc.appendChild(blq)
					}
					cont_per++
				}
				con_adm.appendChild(frag_cons)
				con_sind.appendChild(frag_sind)
				asocs.appendChild(frag_asoc)
				if(cont_cargos==SCoop.Directivos && cont_per>=SCoop.MinPer){
					mostrarHojas(id_tipo_coop)
				}else{
					document.getElementById('aler2').innerHTML=''
				}
				if(cont_per==SCoop.MaxPer && cont_per>0){
					msgAlert('Se alcanzó el máximo de asociados')
					form.Guardar.style.visibility='hidden'
					form.Restablecer.style.visibility='hidden'
				}
				
			}
		}
	}

	const addAsoc = (data,id_tipo_coop) => {
		const resul = db.transaction(['asocs'], 'readwrite').objectStore('asocs').add(data)
		resul.onsuccess = (e) =>{
			onSelectCoop(id_tipo_coop)
		}
	}
	
	const deleteAsoc = (key, id_tipo_coop) => {
		const req = db.transaction(['asocs'], 'readwrite').objectStore('asocs').delete(parseInt(key))
		req.onsuccess = () => {
			onSelectCoop(id_tipo_coop)
		}
		req.onerror = (e) => {
			alert('Se produjo un error al borrar al socio: '+e.result+' Consulta al administrador de la web...');
		}
	}
	const getAsocToUp = (key) => {
		const req = db.transaction(['asocs'], 'readwrite').objectStore('asocs').get(parseInt(key))
		req.onsuccess = (e) => {
			const r = req.result || e.result
			loadCargosDisp(r.Id_Coop+','+r.Tipo_Coop,r.Id_Cargo+','+r.Cargo)
			form.tipo_doc.value=r.TipoDoc
			form.nro_doc.value=r.NroDoc
			form.nro_doc.disabled='disabled'
			form.CUIL.value=r.NroDoc
			form.a_cuil.value=r.DigitCuil.substring(0,2)
			form.p_cuil.value=r.DigitCuil.substring(2,3)
			form.apellidos.value=r.Apellidos
			form.nombres.value=r.Nombres
			form.sexo.value=r.Sexo
			form.estado_civil.value=r.EstCiv_cod
			form.area_cod.value=r.AreaCod
			form.num_tel.value=r.NumTel
			//nuevos datos Res.2397/21
			form.email.value=r.Email
			form.profesion.value=r.Profesion
			form.nacionalidad.value=r.Nacionalidad
			form.residencia.value=r.Residencia
			form.fecha_nac.value=r.FechaNac
			//datos domicilio
			form.dom_calle.value= r.Dom_calle
			form.dom_num.value 	= r.Dom_num
			form.dom_piso.value = r.Dom_piso
			form.dom_dto.value 	= r.Dom_dto
			form.dom_adic.value = r.Dom_adic
			form.dom_pcia.value = r.Dom_pcia_cod
			if(r.Dom_pcia_cod>0){
				getPartidos(r.Dom_pcia_cod, r.Dom_pdodep_cod)
				getLocalidades(r.Dom_pdodep_cod,r.Dom_loca_cod)
				if(r.Dom_loca=='' && r.Dom_otra_loca != ''){
					form.chek_otra.checked = true
					form.dom_otra_loca.style.visibility='visible'
					form.dom_otra_loca.value = r.Dom_otra_loca
					form.dom_loca.style.visibility='hidden'
				}else{
					form.chek_otra.checked = false
					form.dom_otra_loca.style.visibility='hidden'
					form.dom_otra_loca.value = ''
					form.dom_loca.style.visibility='visible'
				}
			}else{
				form.dom_pdodep.innerHTML = ''
				form.dom_loca.innerHTML = ''
				form.chek_otra.checked = false
				form.dom_otra_loca.value = ''
			}
			form.dom_preCP.value = r.Dom_preCP
			form.dom_CP.value = r.Dom_CP
			form.dom_posCP.value = r.Dom_posCP
			form.Guardar.style.visibility='visible'
			form.Restablecer.style.visibility='hidden'
			form.Guardar.dataset.action = 'update' 
			form.Guardar.dataset.key = key 
			form.Guardar.textContent = 'Actualizar'
			form.Guardar.style.display='inline-block'
			qcoop.disabled=true
			prin.innerHTML=''
			
		}
	}
	const updateAsoc = (data,key,id_tipo_coop) => {
		const result = db.transaction(['asocs'], 'readwrite').objectStore('asocs').put(data, parseInt(key))
		result.onsuccess =()=>{
			form.Guardar.dataset.action = 'add'
			form.Guardar.dataset.key = ''
			form.Guardar.textContent = 'Guardar Datos'
			onSelectCoop(id_tipo_coop) 
			qcoop.disabled=false
			msgAlert('Los datos fueron actualizados')
		}
	}

	const mostrarHojas = (id_tipo_coop) =>{
		let id_coop = id_tipo_coop.split(',')[0]
		let tipo_coop = id_tipo_coop.split(',')[1]
		let cadenaHojas = `<div class="he">Acta Constitutiva</div><div class="he">Acta Nº1 del Consejo de Administración</div><div class="he">Declaración Jurada y Nota de Presentación</div><div class="he">Exención Boleta</div><div class="he"><!--Certificado de Capacitación--></div>
			
			<div><img border="0" src="hojas.gif" class="page" id="actaConst" /></div>
			<div><img border="0" src="hoja.gif" class="page" id="actaN1" /></div>
			<div><img border="0" src="hoja.gif" class="page" id="decJud" /></div>
			<div><img border="0" src="hoja.gif" class="page" id="exencionBoleta" /></div>
			<div><!--<img border="0" src="hoja.gif" class="page" id="planiCapa" />--></div> 

			<div>Imprime Estatuto, Suscripción e Integración de cuotas sociales, y Elección de Consejeros y Síndicos. Firman Presidente, Secretario y Tesorero (o Presidente y Síndico si son 3) pero sin colocar los cargos. Aclaran la firma y colocan el n° de documento. Las firmas se certifican por TAD o certificador.<br /><br> Tamaño Oficio/Legal OBLIGATORIO.</div>
			<div>Imprime la distribución de cargos de los consejeros electos en asamblea. Firman Presidente y Secretario (o sólo Presidente si son 3). Las firmas se certifican por TAD o certificador.</div>
			<div>Contiene declaraciones juradas de parentesco y de ayuda mutua. Este documento debe ser firmado por la totalidad de los miembros del Consejo de Administración (titulares y suplentes) y por la totalidad de los miembros de la Sindicatura (titulares y suplentes). Estas firmas deben estar certificadas por TAD o certificador.
			<hr>La nota de presentación la firman Presidente y Secretario (o Síndico si son 3). No se certifican las firmas.
			</div>
			<div>Contiene nota solicitando, por motivos extraordinarios, la exención de presentación de la boleta de depósito del 5% del capital suscripto. No se certifican las firmas.</div>
			<div><!--El capacitador da el curso de "Introducción al cooperativismo" frente al grupo cooperativo y certifica la asistencia de todos.--></div>`
		prin.innerHTML=cadenaHojas
		msgAlertBlue('Ya está en condiciones de imprimir los documentos')
	}

	const getSpecs = (tipo_coop) =>{
		if(tipo_coop=='r1000'){SCoop = {cargos:[{name:'Presidente', cod:1001},{name:'Síndico Titular',cod:1021}],MaxPer:5,Directivos:2,MinPer:3}}
		else if(tipo_coop=='r750'){SCoop = {cargos:[{name:'Presidente', cod:1001},{name:'Secretario',cod:1002},{name:'Tesorero',cod:1003},{name:'Síndico Titular',cod:1021},{name:'Síndico Suplente',cod:1022}],MaxPer:9,Directivos:5,MinPer:6}
		}else{SCoop = {cargos:[{name:'Presidente', cod:1001},{name:'Secretario',cod:1002},{name:'Tesorero',cod:1003},{name:'Vocal Suplente 1º',cod:1011},{name:'Vocal Suplente 2º',cod:1012},{name:'Síndico Titular',cod:1021},{name:'Síndico Suplente',cod:1022}],MaxPer:0,Directivos:7,MinPer:10}}
		return SCoop;
	}

	const loadCargosDisp = (id_tipo_coop,asocEditCargo) => {
		let id_coop = id_tipo_coop.split(',')[0]
		let tipo_coop = id_tipo_coop.split(',')[1]
		const getAllR = db.transaction(['asocs'],'readonly').objectStore('asocs').index('Id_Coop').getAll(parseInt(id_coop))
		getAllR.onsuccess = (e) => {
			let arrS=e.target.result
			const frag_disp = document.createDocumentFragment()
			let SCoop=getSpecs(tipo_coop)
			for(e in SCoop.cargos){
				const res = arrS.find( cargo => cargo.Id_Cargo===(SCoop.cargos[e].cod).toString()	)
				if(!res){
					const op = document.createElement('OPTION')
					op.setAttribute('value', SCoop.cargos[e].cod)
					op.textContent = SCoop.cargos[e].name
					frag_disp.appendChild(op)
				}
			}
			const op = document.createElement('OPTION')
			op.setAttribute('value', 1030)
			op.textContent = 'Asociado'
			frag_disp.appendChild(op)
			form.cargo.innerHTML=''
			form.cargo.appendChild(frag_disp)
			if(asocEditCargo){
				if(asocEditCargo && asocEditCargo.split(',')[0]!='1030'){
					let myNewOption = new Option(asocEditCargo.split(',')[1], asocEditCargo.split(',')[0]);
					form.cargo.options[form.cargo.options.length] = myNewOption;
					form.cargo.selectedIndex=(form.cargo.options.length-1);
				}else{
					form.cargo.selectedIndex=(form.cargo.options.length-1);
				}
			}
		}
	}

	const onSelectCoop = (id_tipo_coop) => {
		if(id_tipo_coop!=0){
			document.getElementsByClassName('nuevoAsocs')[0].style.visibility='visible'
			form.Guardar.style.visibility='visible'
			form.Restablecer.style.visibility='visible'
			aler.innerHTML=''; prin.innerHTML=''; form.tipo_doc.disabled=false;form.nro_doc.disabled=false;form.dom_pdodep.innerHTML='';form.dom_loca.innerHTML='';form.dom_loca.style.visibility='visible';form.dom_otra_loca.style.visibility='hidden';form.reset();
			readAsocs(id_tipo_coop)
			let id_coop = id_tipo_coop.split(',')[0]
			form.Guardar.dataset.id_coop=id_tipo_coop
			let tipo_coop = id_tipo_coop.split(',')[1]
			loadCargosDisp(id_tipo_coop)

			const req = db.transaction(['coops'], 'readonly').objectStore('coops').get(parseInt(id_coop))
			req.onsuccess = (e) => {
				const o = e.target.result
				const cp = o.Dom_pcia_cod
				const cd = o.Dom_pdodep_cod
				const cl = o.Dom_loca_cod
				form.dom_pcia.value = cp
				if(cp>0){
					getPartidos(cp,cd)
					getLocalidades(cd,cl)
				}
				putLetterInCP(cp)
				form.dom_CP.value = o.Dom_CP
				form.dom_posCP.value = o.Dom_posCP
				if(o.Dom_otra_loca!=''){
					form.chek_otra.click()
					form.dom_otra_loca.value=o.Dom_otra_loca
				}
				form.Guardar.dataset.action = 'add' 
				form.Guardar.textContent = 'Guardar'
				form.Guardar.dataset.key=''
			}
		}else{
			form.cargo.innerHTML=''
			form.Guardar.dataset.id_coop=''
			form.Guardar.dataset.key=''
			form.Guardar.dataset.action = 'add' 
			form.Guardar.textContent = 'Guardar'
			form.dom_pcia.value=-1
			form.dom_pdodep.innerHTML=''
			form.dom_loca.innerHTML=''
			form.Guardar.style.visibility='hidden'
			form.Restablecer.style.visibility='hidden'
			form.dom_otra_loca.style.visibility='hidden'
			form.dom_loca.style.visibility='hidden'
			document.getElementsByClassName('nuevoAsocs')[0].style.visibility='hidden'
			prin.innerHTML=''
		}
	}


	//****************************************************//
	// eventos que escuchan clicks de botones y combos **//
	//**************************************************//
	qcoop.addEventListener('change', (e) => {
		onSelectCoop(e.target.value)		
	})

	const espejarDNI = () => {
		form.CUIL.value=form.nro_doc.value
	}

	const cuitValido = (cuit) => {
		let esCuit=true
		if(cuit.length==11){
			//console.log('Controlo el cuit xq tiene 11 digitos.');
			var vec=new Array(10);
			x=i=dv=0;
			// Multiplico los dígitos.
			vec[0] = cuit.charAt( 0) * 5;vec[1] = cuit.charAt( 1) * 4;
			vec[2] = cuit.charAt( 2) * 3;vec[3] = cuit.charAt( 3) * 2;
			vec[4] = cuit.charAt( 4) * 7;vec[5] = cuit.charAt( 5) * 6;
			vec[6] = cuit.charAt( 6) * 5;vec[7] = cuit.charAt( 7) * 4;
			vec[8] = cuit.charAt( 8) * 3;vec[9] = cuit.charAt( 9) * 2;
			for( i = 0;i<=9; i++) {	x += vec[i];}
			dv = (11 - (x % 11)) % 11;
			if( dv == cuit.charAt(10) ) {
				esCuit=true
			}else{
				esCuit=false
			}
		}
		return esCuit
	}
	
	form.nro_doc.addEventListener('change', espejarDNI)
	
	form.nro_doc.addEventListener('keyup', espejarDNI)
		
	form.addEventListener('submit', (e) => {
		e.preventDefault()
		const act=form.Guardar.dataset.action
		const id_tipo_coop = form.Guardar.dataset.id_coop
		const key = form.Guardar.dataset.key
		const n=form.nro_doc.value
		const req = db.transaction(['asocs'],'readonly').objectStore('asocs').index('NroDoc').getAll(parseInt(n))
		req.onsuccess = (ev) => {
			if(ev.target.result.length && act=='add'){
				msgAlert('El DNI del socio ya existe en una cooperativa.')
			}else{
				let op = e.target.dom_pcia
				let od = e.target.dom_pdodep
				let ol = e.target.dom_loca
				let vol = e.target.dom_otra_loca.value
				let d, dc, l, lc
				
				//control cuitValido(cuit)
				var ac=form.a_cuil.value;var c=form.nro_doc.value;var pc=form.p_cuil.value;
				var cuit
				if(ac!='' && pc=='' || ac=='' && pc!=''){
					msgAlert('El cuil esta incompleto. Ingrese todos los dígitos.')
					return false
				}
				if(c.length==7){cuit=ac+'0'+c+pc;}else{cuit=ac+c+pc;}
				if(!cuitValido(cuit)){
					msgAlert('El CUIL es inválido. Ingrese un CUIL válido.')
					return false
				}
				//fin cuil

				if(op.value==-1) {
					msgAlert('Seleccione la provincia.')
					op.focus()
					return false
				}
				else if(op.value>0 && od.value<1){
					msgAlert('Seleccione el partido/departamento.')
					od.focus()
					return false
				}
				else if(od.value>0 && ol.value<1 && form.chek_otra.checked==false){
					msgAlert('Debe seleccionarse al menos una LOCALIDAD ó elija OTRA LOCALIDAD e ingrésela manualmente.')
					ol.focus()
					return false
				}
				else if((form.chek_otra.checked==true && vol=="")){
					msgAlert('Ingrese el nombre de la LOCALIDAD que no figura en lista.')
					e.target.dom_otra_loca.focus()
					return false
				}
				else if(form.dom_num.value=='' && form.dom_adic.value==''){
					msgAlert('Si no ingresa calle y número, ingrese lo que corresponda en datos adicionales Parcela, Manzana, Lote, Casa, Bloque, Puerta, etc.')
					form.dom_adic.focus()
					return false
				}
				else if(op.value==0){
					d = ''
					dc = ''
					l = ''
					lc = ''
					vol = ''
				}
				else {
					d = od.options[od.selectedIndex].text
					dc = od.value
					if(form.chek_otra.checked==true){
						l = ''
						lc = ''
					}else{
						l = ol.options[ol.selectedIndex].text
						lc = ol.value
						vol = ''
					}
				}
				
				const data={
					Id_Coop : parseInt(id_tipo_coop.split(',')[0]),
					Tipo_Coop : id_tipo_coop.split(',')[1],
					Id_Cargo : form.cargo.value, 
					Cargo : form.cargo.options[form.cargo.selectedIndex].text,
					TipoDoc : form.tipo_doc.value,
					NroDoc : parseInt(form.nro_doc.value),
					DigitCuil : form.a_cuil.value+form.p_cuil.value,
					Apellidos : form.apellidos.value,
					Nombres : form.nombres.value,
					Sexo: form.sexo.value, 
					EstCiv_cod: parseInt(form.estado_civil.value),
					EstCiv: form.estado_civil.options[form.estado_civil.selectedIndex].text,
					AreaCod: form.area_cod.value,
					NumTel: form.num_tel.value,
					//nuevos datos solicitados Res.2397/21
					Email: form.email.value,
					Profesion: form.profesion.value,
					Nacionalidad: form.nacionalidad.value,
					Residencia: form.residencia.value,
					FechaNac: form.fecha_nac.value,
					//conjunto datos domicilio
					Dom_calle : form.dom_calle.value,
					Dom_num : form.dom_num.value,
					Dom_piso : form.dom_piso.value,
					Dom_dto : form.dom_dto.value,
					Dom_adic : form.dom_adic.value, 
					Dom_pcia : op.options[op.selectedIndex].text,
					Dom_pcia_cod : op.value,
					Dom_pdodep : d,
					Dom_pdodep_cod : dc,
					Dom_loca : l,
					Dom_loca_cod : lc,
					Dom_otra_loca : vol,
					Dom_preCP : e.target.dom_preCP.value,
					Dom_CP : e.target.dom_CP.value,
					Dom_posCP : e.target.dom_posCP.value
				}
				
				if(act=='add'){
					addAsoc(data,id_tipo_coop)	
				}else if(act=='update'){
					updateAsoc(data,key,id_tipo_coop)
				}
				
			}
		}
	})
	
	document.getElementById('asocs').addEventListener('click',(e)=>{
		const k=e.target.dataset.key
		const t=e.target.dataset.type
		const id_tipo_coop=form.Guardar.dataset.id_coop
		if(t=='update'){
			getAsocToUp(k)
		}else if(t=='delete'){
			if(confirm('¿Realmente desea borrar este asociado?')){
				deleteAsoc(k,id_tipo_coop)
			}
		}
	})
	
	prin.addEventListener('click', (e) => {
		let a = e.target.id; let url, d;
		let b =	qcoop.value
		let c = b.split(',')[1]
		if(c=='viv'){d='../pages/ActaConstitutivaViv.htm#'+b;}else{d='../pages/ActaConstitutiva.htm#'+b;}
		switch(a){
			case 'exencionBoleta':url='../pages/ExencionBoleta.htm#'+b;break;
			case 'actaConst':url=d;break;
			case 'actaN1':url='../pages/ActaN1Distrib.htm#'+b;break;
			case 'decJud':url='../pages/DecJudUni.htm#'+b;break;
			case 'planiCapa':url='../pages/CertificadoCapacitacion.htm#'+b;break;
			default:url='';
		}
		window.open(url,'_blank')
	})

		
}
else{
	alert('El navegador no es compaitble con indexedDB !')
	location.replace('https://www.argentina.gob.ar/inaes/constituir-cooperativas')
}
