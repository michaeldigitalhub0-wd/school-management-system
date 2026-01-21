// App header utilities: adds Logout button and search wiring across pages
(function(){
    const Storage = window.StorageAPI;

    function logout(){
        try{ Storage && Storage.clearCurrentUser && Storage.clearCurrentUser(); }catch(e){}
        window.location.replace('/Login.html');
    }

    function wireSearch(){
        document.querySelectorAll('input.search').forEach(input=>{
            const tableBody = document.querySelector('main .data-table tbody');
            if(!tableBody) return;
            input.addEventListener('input', ()=>{
                const q = input.value.trim().toLowerCase();
                Array.from(tableBody.rows).forEach(row=>{
                    const text = row.textContent.toLowerCase();
                    row.style.display = q ? (text.includes(q) ? '' : 'none') : '';
                });
            });
        });
    }

    function injectLogout(header){
        if(!header) return;
        // create container on right
        let container = header.querySelector('.header-actions');
        if(!container){
            container = document.createElement('div');
            container.className = 'header-actions';
            container.style.marginLeft = 'auto';
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.gap = '0.75rem';
            header.appendChild(container);
        }
        let btn = container.querySelector('#logoutBtn');
        if(!btn){
            btn = document.createElement('button');
            btn.id = 'logoutBtn';
            btn.className = 'btn';
            btn.textContent = 'Log out';
            container.appendChild(btn);
        }
        // Add stop-impersonation button if impersonating
        let stopBtn = container.querySelector('#stopImpersonation');
        if(!stopBtn){
            stopBtn = document.createElement('button');
            stopBtn.id = 'stopImpersonation';
            stopBtn.className = 'btn';
            stopBtn.textContent = 'Return to Admin';
            stopBtn.style.display = 'none';
            container.appendChild(stopBtn);
            stopBtn.addEventListener('click', ()=>{
                const cur = Storage && Storage.getCurrentUser && Storage.getCurrentUser();
                if(cur && cur.__impersonatedBy){
                    // try to restore admin by email or name
                    const adminId = cur.__impersonatedBy;
                    const admins = Storage.getByRole('admin') || [];
                    const found = admins.find(a => (a.Email && a.Email.toLowerCase() === (adminId||'').toLowerCase()) || (a.Name && a.Name === adminId));
                    if(found){ Storage.setCurrentUser && Storage.setCurrentUser(found); window.location.replace('/pages/admin/dashboard.html'); return; }
                    // fallback: clear current user
                    Storage.clearCurrentUser && Storage.clearCurrentUser(); window.location.replace('/Login.html');
                }
            });
        }
        // show if impersonating
        const cur = Storage && Storage.getCurrentUser && Storage.getCurrentUser();
        if(cur && cur.__impersonatedBy){ stopBtn.style.display = ''; } else { stopBtn.style.display = 'none'; }
        btn.addEventListener('click', logout);
    }

    function showTopBanner(){
        const user = Storage && Storage.getCurrentUser ? Storage.getCurrentUser() : null;
        if(!user) return;
        if(document.querySelector('.top-banner')) return;
        const banner = document.createElement('div'); banner.className = 'top-banner';
        banner.innerHTML = `<div class="top-banner-inner">Signed in as <strong>${user.Name||user.Email||''}</strong> (${user.Role||''})<button class="top-banner-close" aria-label="Close">×</button></div>`;
        document.body.insertBefore(banner, document.body.firstChild);
        // inject styles if not present
        if(!document.getElementById('top-banner-style')){
            const s = document.createElement('style'); s.id = 'top-banner-style'; s.textContent = `
                .top-banner{position:fixed;left:0;right:0;top:0;z-index:10000;background:linear-gradient(90deg,#f0f8ff,#e8f4ff);border-bottom:1px solid rgba(0,0,0,0.06);padding:0.4rem}
                .top-banner-inner{max-width:1100px;margin:0 auto;padding:0 1rem;display:flex;align-items:center;justify-content:center;gap:1rem;font-size:0.95rem}
                .top-banner .top-banner-close{margin-left:1rem;border:none;background:transparent;font-size:1.2rem;cursor:pointer}
                body{padding-top:0}
            `; document.head.appendChild(s);
        }
        banner.querySelector('.top-banner-close').addEventListener('click', ()=> banner.remove());
        // auto-dismiss after 5s
        setTimeout(()=>{ banner && banner.remove(); }, 5000);
    }

    document.addEventListener('DOMContentLoaded', ()=>{
        const header = document.querySelector('.app-header');
        injectLogout(header);
        wireSearch();
        showTopBanner();
    });
})();
