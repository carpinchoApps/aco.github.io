/************************************************************************
	Eventos y Funciones relacionados a DOMICILIO se reutilizaran en otro FORM 
	************************************************************************/
//constantes
let db;

const req = idb.open('ACO',1)
req.onsuccess = () => {
		db = req.result
		const re = db.transaction(['constApp'], 'readonly').objectStore('constApp').openCursor()
		re.onsuccess =(e)=>{
			var chain = e.target.result.value.Chain
			form.userOcult.value = e.target.result.value.user
			
			const a = (b) => {
				var w = c.de(chain); var f = Date.UTC(b.getFullYear(),b.getMonth(),b.getDate(),b.getHours()+3,b.getMinutes());
				if(f>w){document.querySelector('BODY').innerText = c.de("Q2FkdWPDsyBlbCB0aWVtcG8gZGUgdXNvIGRlIGxhIGFwbGljYWNpw7NuLiBQw7NuZ2FzZSBlbiBjb250YWN0byBjb24gZWwgw6FyZWEgZGUgQ0NDWU0jSU5BRVMu.")}
			}
			const c = { 
				_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
				de : (np)=> { var tp = ""; var r1, r2, r3; var c1, c2, c3, c4; var i = 0;
				np = np.replace(/[^A-Za-z0-9\+\/\=]/g, "");
				while (i < np.length) {
			        c1 = c._keyStr.indexOf(np.charAt(i++)); c2 = c._keyStr.indexOf(np.charAt(i++));
			        c3 = c._keyStr.indexOf(np.charAt(i++)); c4 = c._keyStr.indexOf(np.charAt(i++));
			        r1 = (c1 << 2) | (c2 >> 4); r2 = ((c2 & 15) << 4) | (c3 >> 2); r3 = ((c3 & 3) << 6) | c4;
			        tp = tp + String.fromCharCode(r1);
			        if (c3 != 64) { tp = tp + String.fromCharCode(r2);}
			        if (c4 != 64) { tp = tp + String.fromCharCode(r3);}
		    	} tp = c.ud(tp); return tp;
		    }, ud : (tx)=> {
		    	var string = ""; var i = 0; var c = c1 = c2 = 0;
		    	while ( i < tx.length ) {
		    		c = tx.charCodeAt(i);
		    		if (c < 128) { string += String.fromCharCode(c); i++; }
		    		else if((c > 191) && (c < 224)) {c2 = tx.charCodeAt(i+1); string += String.fromCharCode(((c & 31) << 6) | (c2 & 63)); i += 2;}
		    		else { c2 = tx.charCodeAt(i+1); c3 = tx.charCodeAt(i+2); string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)); i += 3;}
		    		}
		    	return string; 
		   		}
			}
			a(new Date())
		}
	}
	
	const getPartidos = (val,cod) => {
		const trans = db.transaction(['partidos'], 'readonly')
		const objSto = trans.objectStore('partidos')
		const index = objSto.index('cod_prov')
		var getAllRequest = index.getAll(parseInt(val));
		
		getAllRequest.onsuccess = () => {
			const frag = document.createDocumentFragment()
			const op = document.createElement('OPTION')
			op.setAttribute('value', '')
			op.textContent = 'Seleccione un partido'
			frag.appendChild(op)
			for(el of getAllRequest.result){
				const opt = document.createElement('OPTION')
				opt.setAttribute('value', el.cod_part)
				opt.textContent = el.name_part
				frag.appendChild(opt)
			}
			form.dom_pdodep.innerHTML=''
			form.dom_pdodep.appendChild(frag)
			if(cod){form.dom_pdodep.value=cod}
		}
	}


	const getLocalidades = (val,cod) => {
		const trans = db.transaction(['localidades'], 'readonly')
		const objSto = trans.objectStore('localidades')
		const index = objSto.index('cod_part')
		var gAR = index.getAll(parseInt(val));

		gAR.onsuccess = () => {
			const frag = document.createDocumentFragment()
			const op = document.createElement('OPTION')
			op.setAttribute('value', '')
			op.textContent = 'Seleccione una localidad'
			frag.appendChild(op)
			for(el of gAR.result){
				const opt = document.createElement('OPTION')
				opt.setAttribute('value', el.cod_loca)
				opt.textContent = el.name_loca
				frag.appendChild(opt)
			}
			form.dom_loca.innerHTML=''
			form.dom_loca.appendChild(frag)
			if(cod){form.dom_loca.value=cod}
		}
	}


	const msgAlert = (msg, btn) => {
		aler.innerHTML = msg
		if(btn===0){			
		}else{
			const btn_close_alert = document.createElement('BUTTON')
			btn_close_alert.setAttribute('class', 'btn btn_delete')
			btn_close_alert.setAttribute('id', 'btnCierraAlert')
			btn_close_alert.textContent = 'Aceptar'
			btn_close_alert.addEventListener('click',(e)=>{
				e.target.parentElement.innerHTML = ''
			})
			aler.appendChild(btn_close_alert)
		}
	}

	const msgAlertBlue = (msg) => {
		let listo = document.getElementById('aler2')
		listo.textContent = ''
		listo.textContent = msg
	}

	const putLetterInCP = (cod_prov) =>{
		switch(parseInt(cod_prov)){
			case 0:v='C';break;case 1:v='B';break;case 2:v='K';break;
			case 3:v='X';break;case 4:v='W';break;case 5:v='H';break;
			case 6:v='U';break;case 7:v='E';break;case 8:v='P';break;
			case 9:v='Y';break;case 10:v='L';break;case 11:v='F';break;
			case 12:v='M';break;case 13:v='N';break;case 14:v='Q';break;
			case 15:v='R';break;case 16:v='A';break;case 17:v='J';break;
			case 18:v='D';break;case 19:v='Z';break;case 20:v='S';break;
			case 21:v='G';break;case 22:v='V';break;case 23:v='T';break;
			default:v='';
		}
		form.dom_preCP.value=v
	}

	form.dom_pcia.addEventListener('change', (e)=>{
		const w=e.target.value
		putLetterInCP(w)
		form.dom_pdodep.innerHTML=''
		form.dom_loca.innerHTML=''
		form.dom_loca.style.visibility='visible'
		form.chek_otra.checked=false
		form.dom_otra_loca.style.visibility='hidden'
		form.dom_otra_loca.value=''
		if(w>0)	getPartidos(w) 
	})

	form.dom_pdodep.addEventListener('change', (e)=>{
		const v=e.target.value
		form.dom_loca.innerHTML=''
		form.dom_loca.style.visibility='visible'
		form.chek_otra.checked=false
		form.dom_otra_loca.style.visibility='hidden'
		form.dom_otra_loca.value=''
		if(v>0)	getLocalidades(v)
	})
	
	form.addEventListener('keyup', (e)=>{
		if(e.target.type=='text' && e.target.name!='email'){
			e.target.value = e.target.value.toUpperCase()
		} 
	})

	form.chek_otra.addEventListener('click', (e)=>{
		const a = form.chek_otra 
		const b = form.dom_loca
		const c = form.dom_otra_loca
		if (a.checked==true) {
			c.style.visibility='visible'
			c.value=''
			b.style.visibility='hidden'
		}else {
			c.style.visibility='hidden'
			b.style.visibility='visible'
		}
	})

	/************************************************************************/
	/**************** Fin eventos DOMICILIO *********************************/
	/************************************************************************/
	

	