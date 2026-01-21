// Parent behaviors: view child progress by child email
(function(){
    const Storage = window.StorageAPI;
    function el(s){ return document.querySelector(s); }

    function renderChildProgress(childEmail){
        const tbody = el('main .data-table tbody'); if(!tbody) return;
        const results = Storage.get('Results',[]).filter(r => (r.studentEmail||'').toLowerCase() === (childEmail||'').toLowerCase());
        tbody.innerHTML = '';
        if(!results.length){ tbody.innerHTML = '<tr><td colspan="3">No results for this child</td></tr>'; return; }
        results.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${r.subject||'General'}</td><td>${r.term||''}</td><td>${r.score||r.average||''}</td>`;
            tbody.appendChild(tr);
        });
    }

    document.addEventListener('DOMContentLoaded', ()=>{
        const path = window.location.pathname.replace(/\\/g,'/');
        if(path.endsWith('/pages/parents/child-progress.html')){
            const controls = document.querySelector('.controls') || document.querySelector('main .card');
            if(controls){
                const div = document.createElement('div');
                div.innerHTML = '<input id="childEmail" placeholder="Child email"><button id="viewChild" class="btn">View</button>';
                controls.insertBefore(div, controls.firstChild);
                document.getElementById('viewChild').addEventListener('click', ()=>{
                    const email = document.getElementById('childEmail').value.trim().toLowerCase();
                    if(!email){ alert('Enter child email'); return; }
                    renderChildProgress(email);
                });
            }
        }
    });
})();
