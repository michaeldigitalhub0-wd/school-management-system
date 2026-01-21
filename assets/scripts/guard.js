// Simple route guard helpers using StorageAPI
const Guard = {
	getCurrentUser(){ return window.StorageAPI ? window.StorageAPI.getCurrentUser() : null; },
	isAuthenticated(){ return !!Guard.getCurrentUser(); },
	hasRole(role){
		const u = Guard.getCurrentUser();
		if(!u || !role) return false;
		return (u.Role || '').toString().toLowerCase() === role.toString().toLowerCase();
	},
	ensureAuthenticated(allowedRoles){
		const u = Guard.getCurrentUser();
		if(!u){
			alert('You must be signed in to view this page');
			window.location.href = '/Login.html';
			return false;
		}
		if(allowedRoles && allowedRoles.length){
			const ok = allowedRoles.some(r => (u.Role||'').toLowerCase() === r.toLowerCase());
			if(!ok){
				alert('Access denied for your role');
				window.location.href = '/Login.html';
				return false;
			}
		}
		return true;
	}
};

window.Guard = Guard;
