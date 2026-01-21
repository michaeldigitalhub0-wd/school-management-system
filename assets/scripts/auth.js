
/* Auth helpers — uses StorageAPI (assets/scripts/storage.js)
   Provides `signup` and `login` handlers that store JSON arrays per role
*/
(function(){
    const roles = document.querySelector('#role');
    const userName = document.querySelector('#username');
    const userPassword = document.querySelector('#newpassword') || document.querySelector('#password') || document.querySelector('#userpassword');
    const userEmailEl = document.querySelector('#email') || document.querySelector('#loginEmail');
    const userIdentifierEl = document.querySelector('#loginEmail') || document.querySelector('#email') || document.querySelector('#username');
    const userPhone = document.querySelector('#phone');

    function clearInputs(){
        if(userName) userName.value = '';
        if(userEmailEl) userEmailEl.value = '';
        if(userPassword) userPassword.value = '';
        if(userPhone) userPhone.value = '';
    }

    function signupHandler(e){
        if(e) e.preventDefault();
        const roleValue = roles ? roles.value : '';
        const name = userName ? userName.value.trim() : '';
        const email = userEmailEl ? userEmailEl.value.trim().toLowerCase() : (userIdentifierEl ? userIdentifierEl.value.trim().toLowerCase() : '');
        const password = userPassword ? userPassword.value : '';
        const phone = userPhone ? userPhone.value.trim() : '';

        if(!roleValue || !email || !password || !name){
            alert('Please fill all required fields');
            return;
        }

        const arr = window.StorageAPI ? window.StorageAPI.getByRole(roleValue) : [];
        if(arr.some(u => u.Email === email)){
            alert('A user with this email already exists');
            return;
        }

        const user = {
            Role: roleValue.charAt(0).toUpperCase() + roleValue.slice(1).toLowerCase(),
            Name: name,
            Email: email,
            Password: password,
            Phone: phone,
            createdAt: new Date().toISOString()
        };

        arr.push(user);
        if(window.StorageAPI) window.StorageAPI.saveByRole(roleValue, arr);
        window.StorageAPI && window.StorageAPI.setCurrentUser(user);
        alert(`${user.Role} registered successfully`);
        clearInputs();
        redirectToDashboard(roleValue);
    }

    function loginHandler(e){
        if(e) e.preventDefault();
        const roleValue = roles ? roles.value : '';
        const identifier = userIdentifierEl ? userIdentifierEl.value.trim() : '';
        const password = userPassword ? userPassword.value : '';

        if(!roleValue || !identifier || !password){
            alert('Please enter role, username/email and password');
            return;
        }

        console.log('login attempt', { role: roleValue, identifier, password });
        const arr = window.StorageAPI ? window.StorageAPI.getByRole(roleValue) : [];
        const user = arr.find(u => ((u.Email && u.Email.toLowerCase() === identifier.toLowerCase()) || (u.Name && u.Name.toLowerCase() === identifier.toLowerCase())) && u.Password === password);
        if(user){
            window.StorageAPI && window.StorageAPI.setCurrentUser(user);
            console.log('login success', user);
            alert(`Welcome ${user.Name || user.Role}`);
            redirectToDashboard(roleValue);
        } else {
            console.log('login failed - no match');
            alert('Invalid credentials');
        }
    }

    function redirectToDashboard(role){
        if(!role) return;
        const r = role.toString().toLowerCase();
        let path = '/Login.html';
        if(r === 'admin') path = '/pages/admin/dashboard.html';
        else if(r === 'teacher') path = '/pages/teachers/dashboard.html';
        else if(r === 'student') path = '/pages/students/dashboard.html';
        else if(r === 'parent') path = '/pages/parents/dashboard.html';
        window.location.replace(path);
    }

    document.addEventListener('DOMContentLoaded', function(){
        const signBtn = document.querySelector('#sign_up');
        const logBtn = document.querySelector('#log_in');
        const signupLink = document.querySelector('.signup-link');

        if(signBtn) signBtn.addEventListener('click', signupHandler);
        if(logBtn) logBtn.addEventListener('click', loginHandler);
    });

})();



