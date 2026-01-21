// LocalStorage JSON helpers and role-based getters/setters
const StorageAPI = {
	get(key, defaultVal = null){
		try{
			const v = localStorage.getItem(key);
			return v ? JSON.parse(v) : defaultVal;
		}catch(e){ return defaultVal; }
	},
	set(key, value){
		try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){}
	},
	remove(key){ localStorage.removeItem(key); },
	clear(){ localStorage.clear(); },
	getByRole(role){
		if(!role) return [];
		const key = StorageAPI._roleKey(role);
		const data = StorageAPI.get(key, []);
		if(Array.isArray(data)) return data;
		// migrate single-object stored values into an array
		const arr = data ? [data] : [];
		StorageAPI.set(key, arr);
		return arr;
	},
	saveByRole(role, arr){
		if(!role) return;
		const key = StorageAPI._roleKey(role);
		StorageAPI.set(key, arr || []);
	},
	setCurrentUser(user){ StorageAPI.set('currentUser', user); },
	getCurrentUser(){ return StorageAPI.get('currentUser', null); },
	clearCurrentUser(){ StorageAPI.remove('currentUser'); },
	// Activity log helpers
	addActivity(entry){
		try{
			const list = StorageAPI.get('Activity', []);
			list.unshift(entry);
			// keep recent 100
			StorageAPI.set('Activity', list.slice(0,100));
		}catch(e){}
	},
	getActivities(){ return StorageAPI.get('Activity', []); },
	clearActivities(){ StorageAPI.set('Activity', []); },
	_roleKey(role){
		const r = role.toString().toLowerCase();
		if(r === 'admin') return 'Admins';
		if(r === 'teacher') return 'Teachers';
		if(r === 'student') return 'Students';
		if(r === 'parent') return 'Parents';
		return role;
	}
};

window.StorageAPI = StorageAPI;
