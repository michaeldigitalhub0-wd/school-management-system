// Dashboard refresher: populate elements with data counts
(function(){
    const Storage = window.StorageAPI;
    function count(key){
        if(!Storage) return 0;
        if(key === 'Admins') return Storage.get('Admins',[]).length;
        if(key === 'Teachers') return Storage.get('Teachers',[]).length;
        if(key === 'Students') return Storage.get('Students',[]).length;
        if(key === 'Classes') return Storage.get('Classes',[]).length;
        if(key === 'Results') return Storage.get('Results',[]).length;
        return 0;
    }

    window.Dashboard = window.Dashboard || {};
    window.Dashboard.refresh = function(){
        document.querySelectorAll('[data-dashboard-key]').forEach(el=>{
            const key = el.getAttribute('data-dashboard-key');
            el.textContent = count(key);
        });
        // update recent activities area if present
        const actEl = document.querySelector('[data-dashboard-activities]');
        if(actEl && window.StorageAPI){
            const acts = window.StorageAPI.getActivities();
            actEl.innerHTML = '';
            if(!acts.length) actEl.textContent = 'No activity yet.';
            acts.slice(0,10).forEach(a=>{
                const li = document.createElement('div'); li.className = 'activity-item';
                const who = a.actor ? `<strong>${a.actor}</strong> ` : '';
                const when = a.time ? ` <span class="muted">${new Date(a.time).toLocaleString()}</span>` : '';
                li.innerHTML = `${who}${a.action || ''}${when}`;
                actEl.appendChild(li);
            });
        }
    };

    document.addEventListener('DOMContentLoaded', ()=>{
        Dashboard.refresh();
        // render recent activities if present
        const actEl = document.querySelector('[data-dashboard-activities]');
        if(actEl && window.StorageAPI){
            const acts = window.StorageAPI.getActivities();
            actEl.innerHTML = '';
            if(!acts.length) actEl.textContent = 'No activity yet.';
            acts.slice(0,10).forEach(a=>{
                const li = document.createElement('div'); li.className = 'activity-item';
                const who = a.actor ? `<strong>${a.actor}</strong> ` : '';
                const when = a.time ? ` <span class="muted">${new Date(a.time).toLocaleString()}</span>` : '';
                li.innerHTML = `${who}${a.action || ''}${when}`;
                actEl.appendChild(li);
            });
        }
    });
})();
