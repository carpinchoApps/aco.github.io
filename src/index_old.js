function databaseExists(dbname, callback, newChain) {
    var req = indexedDB.open(dbname);
    var existed = true;
    req.onsuccess = function () {
        req.result.close();
        if (!existed) indexedDB.deleteDatabase(dbname)
        callback(existed, dbname, newChain);
    }
    req.onupgradeneeded = function () {
        existed = false;
    }
}

var newChain = location.hash.replace('#','')
var dbName='CCCYM#INAES'

if(newChain) {
	databaseExists(dbName, function (yesno,dbname, newChain) {
	    let nc = c.de(newChain.split('|')[0]), b = new Date(), f = Date.UTC(b.getFullYear(),b.getMonth(),b.getDate(),b.getHours()+3,b.getMinutes())
	    if(yesno) {
	    	console.log('La base ya existe... verificamos la clave UTC...')
	    	const req = indexedDB.open(dbname,1)
			req.onsuccess = () => {
				const re = req.result.transaction(['constApp'], 'readonly').objectStore('constApp').openCursor()	
				re.onsuccess=(e)=>{
					let ec = c.de(e.target.result.value.Chain)
					if(f>nc){
						document.querySelector('BODY').innerText = c.de("Q2FkdWPDsyBlbCB0aWVtcG8gZGUgdXNvIGRlIGxhIGFwbGljYWNpw7NuLiBQw7NuZ2FzZSBlbiBjb250YWN0byBjb24gZWwgw6FyZWEgZGUgQ0NDWU0jSU5BRVMu.")
					}else if(isNaN(nc)){
						document.querySelector('BODY').innerText = c.de("RWwgcGFyw6FtZXRybyBlcyBpbmNvcnJlY3RvLiBQw7NuZ2FzZSBlbiBjb250YWN0byBjb24gZWwgw6FyZWEgZGUgQ0NDWU0jSU5BRVMuCiAg")
					}else{
						console.log('La clave UTC esta vigente...!')
						if(ec<nc) {
							const vaciar = req.result.transaction(['asocs'], 'readwrite').objectStore('asocs').clear()
							const vaciar2 = req.result.transaction(['coops'], 'readwrite').objectStore('coops').clear()
							console.log('La clave UTC existente es anterior a la ingresada y se vaciaron los almacenes coops y asocs')
						}else if(ec>nc) {
							console.log('La clave UTC existente es posterior a la ingresada'); //en es caso no hacemos nada
						}else if(ec==nc) {
							console.log('La claves UTC existente e ingresada son idénticas'); //en este caso tampoco
						}
						updateConst(dbname, newChain) 
					}
				}
			}
		}else{
	    	console.log('No existe la base, verificamos la clave UTC...')
	    	if(f>nc){
				document.querySelector('BODY').innerText = c.de("Q2FkdWPDsyBlbCB0aWVtcG8gZGUgdXNvIGRlIGxhIGFwbGljYWNpw7NuLiBQw7NuZ2FzZSBlbiBjb250YWN0byBjb24gZWwgw6FyZWEgZGUgQ0NDWU0jSU5BRVMu.")
			}else if(isNaN(nc)){
				document.querySelector('BODY').innerText = c.de("RWwgcGFyw6FtZXRybyBlcyBpbmNvcnJlY3RvLiBQw7NuZ2FzZSBlbiBjb250YWN0byBjb24gZWwgw6FyZWEgZGUgQ0NDWU0jSU5BRVMuCiAg")
			}else{
				console.log('La clave UTC esta vigente... A crear la base!')
				createDatabase(dbname, newChain)	
			}
	    }
	}, newChain)
}else {
	document.querySelector('BODY').innerText = 'No se pasaron los parámetros.'
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

const createDatabase = (dbname, newChain) => {
	let a = newChain.split('|')[0], b = parseInt(c.de(newChain.split('|')[1])), db
	const constApp = {Chain : a, LimiteMaximoDeCoopACargar : b}
	const req = indexedDB.open(dbname,1)
	const msg = document.getElementById('msgWaiting')
	const modotest=0

	//1º por unica vez
	req.onupgradeneeded = (e) => {
		db = req.result
		console.log('Creando base y almacenes...')
		msg.textContent='Creando base y almacenes...'

		//creamos 5 almacenes de objetos
		const oS_constApp = db.createObjectStore('constApp', {autoIncrement: true})
		const oS_modsArt5 = db.createObjectStore('modsArt5', {autoIncrement: true})
		const oS_partidos = db.createObjectStore('partidos', {autoIncrement: true})
		oS_partidos.createIndex("cod_prov","cod_prov", {unique:false})
		const oS_localidades = db.createObjectStore('localidades', {autoIncrement: true})
		oS_localidades.createIndex("cod_part","cod_part", {unique:false})
		const oS_coops = db.createObjectStore('coops', {autoIncrement: true})
		const oS_asocs = db.createObjectStore('asocs', {autoIncrement: true})
		oS_asocs.createIndex("Id_Coop", "Id_Coop", {unique:false})
		oS_asocs.createIndex("NroDoc", "NroDoc", {unique:false})
		
		//insertamos datos en los almacenes
		console.log('Insertando constantes de la app...')
		msg.textContent='Insertando constantes de la app...'
		oS_constApp.add(constApp)	
		
		console.log('Insertando modelos de Art.5º...')
		msg.textContent='Insertando modelos de Art.5º...'
		for(el of modsSocArt5){
					oS_modsArt5.add(el)	
		}

		console.log('Insertando partidos...')
		msg.textContent='Insertando partidos...'
		for(el of arrayPartidos){
			oS_partidos.add(el)
		}
		
		console.log('Insertando localidades...')
		msg.textContent='Insertando localidades...'
		for(el of arrayLocalidades){
			oS_localidades.add(el)
		}

		if(modotest==1){
			console.log('Insertando coops de test...')
			msg.textContent='Insertando coops de test...'
			for(el of arrayCoops){
				oS_coops.add(el)
			}
			
			console.log('Insertando socios de test...')
			msg.textContent='Insertando socios de test...'
			for(el of arrayAsociados){
				oS_asocs.add(el)
			}
		}
		//completado
		console.log('SUCESSFULL....wait to redirection...')
		msg.textContent='...estamos cargando el formulario....'
		
	}

	//2º si ya existe la base
	req.onsuccess = (e) => {
		window.location.href = 'forms/form1.htm'
	}

	//tercero, si hay error se muestra
	req.onerror = (error) => {
		console.log('Error',error.target.errorCode)
		msg.textContent="Contacte al administrador. Database error: " + error.target.errorCode
	}
}

const updateConst = (dbname, newChain) => {
	let a = newChain.split('|')[0], b = parseInt(c.de(newChain.split('|')[1]))
	const data = {Chain : a, LimiteMaximoDeCoopACargar : b}
	const req = indexedDB.open(dbname,1)
	req.onsuccess = () => {
		console.log('update-> abrimos la base....');
		const res = req.result.transaction(['constApp'], 'readwrite').objectStore('constApp').put(data, 1)
		res.onsuccess = (e) => {
			console.log('Se actualizó la cadena UTC y número de cooperativas.')
			req.result.close()
			window.location.href = 'forms/form1.htm'
		}
		res.onerror = (err) => {
			console.log(err)
		}
	}
}