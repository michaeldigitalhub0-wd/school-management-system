// Student behaviors: view own results
(function(){
    const Storage = window.StorageAPI;
    function el(s){ return document.querySelector(s); }

    function renderStudentResults(){
        const user = Storage.getCurrentUser();
        if(!user) return;
        const tbody = el('main .data-table tbody'); if(!tbody) return;
        const results = Storage.get('Results',[]).filter(r => (r.studentEmail||'').toLowerCase() === (user.Email||'').toLowerCase() || (r.studentName||'').toLowerCase() === (user.Name||'').toLowerCase());
        tbody.innerHTML = '';
        if(!results.length){ tbody.innerHTML = '<tr><td colspan="3">No results yet</td></tr>'; return; }
        results.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${r.subject||'General'}</td><td>${r.term||''}</td><td>${r.score||r.average||''}</td>`;
            tbody.appendChild(tr);
        });
    }

    document.addEventListener('DOMContentLoaded', ()=>{
        renderStudentResults();
    });
})();
