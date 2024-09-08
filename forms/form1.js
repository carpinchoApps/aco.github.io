const idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
const coops = document.getElementById('coops')
const cmbObjSoc = document.getElementById('CmbModObjSoc')
const form = document.getElementById('form')
const aler = document.getElementById('aler')
const TOC = document.getElementById('TextoObjetoSocial')

if(idb){

	let db;
	const req = idb.open('ACO',1)

	req.onsuccess = () => {
		db = req.result
		readCoops()
		readModelosArt5()
	}

	req.onerror = (error) => {
			console.log('Error',req.error)
	}
	
	//funciones indexedDB
	const readCoops = () => {
		const objSto = db.transaction(['coops'], 'readonly').objectStore('coops')
		const req = objSto.openCursor()
		const counter = objSto.count()
		counter.onsuccess = (e) => { 
			const cuantas = counter.result;
			const re = db.transaction(['constApp'], 'readonly').objectStore('constApp').openCursor()
			re.onsuccess =(e)=>{
				var n = e.target.result.value.LimiteMaximoDeCoopACargar;
				if(cuantas>=n){ 
					msgAlert('Se alcanzó el maximo de coops a Cargar.');
					form.Restablecer.style.display='none'
					form.Guardar.textContent = 'Ir a carga de asociados =>'
					form.Guardar.addEventListener('click', ()=>{
						location.replace('form2.htm')
					})
				}else{
					form.Restablecer.style.display='inline-block'
				}
			}
		}
		const frag =document.createDocumentFragment()
		req.onsuccess = (e) => {
			const cursor = e.target.result
			if(cursor){
				const bloqueCoop = document.createElement('P')
				bloqueCoop.setAttribute('class', 'fondoenfiltros')
				bloqueCoop.innerHTML =`<img src="coop_24.gif" class="loguitocoop"> <b>${cursor.value.Denominacion} </b><span>Tipo: ${cursor.value.TipoCoop} - ${cursor.value.ModArt5_name}</span> <center><button data-type="update" data-key="${cursor.key}" class="btn btn_update">Modificar</button> <button data-type="delete" data-key="${cursor.key}" class="btn btn_delete">Borrar</button> <button data-type="cargar" data-key="${cursor.key}" class="btn btn_print">Ir a cargar socios =></button></center>`
				frag.appendChild(bloqueCoop)
				cursor.continue()
			}
			else{
				coops.textContent =''
				coops.appendChild(frag)
			}
		}
	}

	const readModelosArt5 = () => {
		const trans = db.transaction(['modsArt5'],'readonly')
		const objSto = trans.objectStore('modsArt5')
		const request = objSto.openCursor()
		const frag = document.createDocumentFragment()
		request.onsuccess = (e) => {
			const cursor = e.target.result
			if(cursor){
				const opt = document.createElement('OPTION')
				opt.setAttribute('value', cursor.key)
				opt.textContent = cursor.value.title
				frag.appendChild(opt)
				cursor.continue()
			}else {
				//cmbObjSoc.innerHTML = ''
				cmbObjSoc.appendChild(frag)
			}
		}
	}

	const getTxtModelo = (val) => {
		if(val){
			const trans = db.transaction(['modsArt5'], 'readonly')
			const objSto = trans.objectStore('modsArt5')
			const req = objSto.get(parseInt(val))
			req.onsuccess = ()=>{
				TOC.textContent=req.result.txt
			}
		}
		else{
			TOC.textContent=''
		}
	}

	const addCoop = (data) => {
		const trans = db.transaction(['coops'], 'readwrite')
		const objSto = trans.objectStore('coops')
		const result = objSto.add(data)
		result.onsuccess = () =>{
			form.dom_pdodep.innerHTML=''
			form.dom_loca.innerHTML=''
			msgAlert('Se ha guardado la cooperativa.')
			form.reset()
			TOC.innerHTML=''
		}
		readCoops()
	}

	const deleteCoop = (key) => {
		const trans = db.transaction(['coops'], 'readwrite')
		const objSto = trans.objectStore('coops')
		const req = objSto.delete(parseInt(key))
		req.onsuccess = () => {
			const getAllk = db.transaction(['asocs'], 'readonly').objectStore('asocs').index('Id_Coop').getAllKeys(parseInt(key))
			getAllk.onsuccess = (e) => {
				const k = e.target.result
				for(el in k){const req = db.transaction(['asocs'], 'readwrite').objectStore('asocs').delete(parseInt(k[el]))}	
		    	readCoops()
				//location.reload()
			}
		}
		req.onerror = (e) => {
			alert('Se produjo un error: '+e.result+' Consulta al administrador de la web...');
		}
	}

	const deleteAllAsocsFrom = (key) =>{
		const getAllk = db.transaction(['asocs'], 'readonly').objectStore('asocs').index('Id_Coop').getAllKeys(parseInt(key))
		getAllk.onsuccess = (e) => {
			const k = e.target.result
			for(el in k){const req = db.transaction(['asocs'], 'readwrite').objectStore('asocs').delete(parseInt(k[el]))}
		}
	}

	const getCoopToUp = (key) => {
		const trans = db.transaction(['coops'], 'readwrite')
		const objSto = trans.objectStore('coops')
		const req = objSto.get(parseInt(key))
		req.onsuccess = (e) => {
			const res = req.result || e.result
			form.fechaAsamblea.value = res.FActa
			form.hora.value = res.HActa
			form.denominacion.value = res.Denominacion
			form.cap_sus.value = res.CapSusInd
			form.tipo_coop.value = res.TipoCoop
			form.especial.checked = res.NoBoleta
			form.dom_calle.value = res.Dom_calle
			form.dom_num.value = res.Dom_num
			form.dom_piso.value = res.Dom_piso
			form.dom_dto.value = res.Dom_dto
			form.dom_adic.value = res.Dom_adic
			form.dom_pcia.value = res.Dom_pcia_cod
			if(res.Dom_pcia_cod>0){
				getPartidos(res.Dom_pcia_cod, res.Dom_pdodep_cod)
				getLocalidades(res.Dom_pdodep_cod,res.Dom_loca_cod)
				if(res.Dom_loca=='' && res.Dom_otra_loca != ''){
					form.chek_otra.checked = true
					form.dom_otra_loca.style.visibility='visible'
					form.dom_otra_loca.value = res.Dom_otra_loca
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
			form.dom_preCP.value = res.Dom_preCP
			form.dom_CP.value = res.Dom_CP
			form.dom_posCP.value = res.Dom_posCP
			form.CmbModObjSoc.value = res.ModArt5_cod
			//getTxtModelo(res.ModArt5_cod)
			TOC.textContent = res.ModArt5_text
			form.ConApellido.value = res.ConApellido
			form.ConNombres.value = res.ConNombres
			form.ConNroDoc.value = res.ConNroDoc
			form.ConTel_cod.value = res.ConTel_cod
			form.ConTel_num.value = res.ConTel_num
			form.ConTel_cel.value = res.ConTel_cel
			form.empresa.value = res.Empresa
			form.ConEmail.value = res.ConEmail
			form.Guardar.dataset.action = 'update' 
			form.Guardar.dataset.key = key 
			form.Guardar.textContent = 'Actualizar'
			form.Guardar.style.display='inline-block'
		}
	}

	const updateCoop = (data, key) => {
		const result = db.transaction(['coops'], 'readwrite').objectStore('coops').put(data, key)
		result.onsuccess =()=>{
			form.Guardar.dataset.action = 'add'
			form.Guardar.dataset.key = ''
			form.Guardar.textContent = 'Guardar Datos'
			msgAlert('Los datos fueron actualizados')
			readCoops() 
			form.reset()
			TOC.textContent=''
		}
	}

	const updateArt5 = (data) => {
		let art5cod = cmbObjSoc.value
		let title = cmbObjSoc.options[cmbObjSoc.selectedIndex].text
		let valor = {title:title,txt:data}
		const result = db.transaction(['modsArt5'], 'readwrite').objectStore('modsArt5').put(valor, parseInt(art5cod))
		result.onsuccess =()=>{
			msgAlert('Se actualizó el objeto social.')
		}
	}

	//eventos que escuchan clicks de botones y combos
	//aqui iban las funciones de locacion1

	form.tipo_coop.addEventListener('change', (e)=>{
		if(e.target.value=='viv') {
			cmbObjSoc.selectedIndex=42
			getTxtModelo(42)
		}else{
			TOC.textContent=''
			cmbObjSoc.selectedIndex=''
		}
	})
	cmbObjSoc.addEventListener('change', (e)=>{
		getTxtModelo(e.target.value);
	})
	TOC.addEventListener('click', (e)=>{
		msgAlert('Se activó la edición de objeto social. Al terminar de modificar hacer click en "Guardar datos" ó "Actualizar".',0)
	})
	TOC.addEventListener('blur', (e)=>{
		if(e.target.textContent !== ''){
			//updateArt5(e.target.textContent) //si guardamos el texto en la base no hace falta actualizar el modelo
		}
	})
	coops.addEventListener('click', (e)=>{
		if(e.target.dataset.type == 'update'){
			getCoopToUp(e.target.dataset.key)
			 form.Guardar.addEventListener('click', ()=>{
			 	//form.submit()
			 }) 
		}else if (e.target.dataset.type == 'delete'){
			if(confirm('¿Realmente desea borrar esta Cooperativa?')){
				deleteCoop(e.target.dataset.key)
			}
		}else if (e.target.dataset.type == 'cargar'){
			location.replace('form2.htm')
		}
	})
	
	form.addEventListener('submit', (e)=>{
		e.preventDefault()
		
		let op = e.target.dom_pcia
		let od = e.target.dom_pdodep
		let ol = e.target.dom_loca
		let vol = e.target.dom_otra_loca.value
		let d, dc, l, lc
		
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

		
		const nMA = e.target.CmbModObjSoc.options[e.target.CmbModObjSoc.selectedIndex].text
		const nMAm = nMA.slice(0,3).toLowerCase()
		const nTC = e.target.tipo_coop.value
		
		if(nMAm==='viv' && nMAm!=nTC) {
			msgAlert('No se puede elegir el objeto vivienda para una coop de trabajo.')
			return false
		}else if(nMAm!='viv' && nTC==='viv'){
			msgAlert('No se puede elegir un objeto de trabajo para una coop de vivienda.')
			return false
		}
		
		const data = {
			FActa : e.target.fechaAsamblea.value, 
			HActa : e.target.hora.value, 
			Denominacion : e.target.denominacion.value,
			CapSusInd : e.target.cap_sus.value,
			TipoCoop : e.target.tipo_coop.value,
			NoBoleta : e.target.especial.checked,
			Dom_calle : e.target.dom_calle.value,
			Dom_num : e.target.dom_num.value,
			Dom_piso : e.target.dom_piso.value,
			Dom_dto : e.target.dom_dto.value,
			Dom_adic : e.target.dom_adic.value,
			Dom_pcia : op.options[op.selectedIndex].text,
			Dom_pcia_cod : op.value,
			Dom_pdodep : d,
			Dom_pdodep_cod : dc,
			Dom_loca : l,
			Dom_loca_cod : lc,
			Dom_otra_loca : vol,
			Dom_preCP : e.target.dom_preCP.value,
			Dom_CP : e.target.dom_CP.value,
			Dom_posCP : e.target.dom_posCP.value,
			ModArt5_cod : e.target.CmbModObjSoc.value,
			ModArt5_name : nMA,
			ModArt5_text : TOC.textContent,
			ConApellido : e.target.ConApellido.value,
			ConNombres : e.target.ConNombres.value,
			ConNroDoc : e.target.ConNroDoc.value,
			ConTel_cod : e.target.ConTel_cod.value,
			ConTel_num : e.target.ConTel_num.value,
			ConTel_cel : e.target.ConTel_cel.value,
			Empresa : e.target.empresa.value,
			ConEmail : e.target.ConEmail.value,
			user : e.target.userOcult.value
		}
		const btn = form.Guardar.dataset.action
		if(btn=='add'){
			addCoop(data)
		} else if(btn=='update'){
			updateCoop(data,parseInt(form.Guardar.dataset.key))
		}
	})
	document.querySelector('INPUT[type="reset"]').addEventListener('click',(e)=>{
		TOC.textContent=''
		form.Guardar.dataset.action = 'add'
		form.Guardar.dataset.key = ''
		form.Guardar.textContent = 'Guardar Datos'
		readCoops() 
	})
	
}
else{
	alert('El navegador no es compaitble con indexedDB !')
	location.replace('https://www.argentina.gob.ar/inaes/constituir-cooperativas')
}