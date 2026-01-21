// Teacher behaviors: add/edit results for students
(function(){
    const Storage = window.StorageAPI;
    function el(sel){ return document.querySelector(sel); }

    function renderStudentsList(selectEl){
        const students = Storage.getByRole('student');
        if(!selectEl) return;
        selectEl.innerHTML = '';
        students.forEach(s => {
            const opt = document.createElement('option'); opt.value = s.Email; opt.textContent = s.Name + ' (' + (s.Class||'') + ')';
            selectEl.appendChild(opt);
        });
    }

    function renderResults(){
        const tbody = el('main .data-table tbody'); if(!tbody) return;
        const results = Storage.get('Results',[]);
        tbody.innerHTML = '';
        results.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${r.studentName||r.studentEmail||''}</td><td>${r.subject||''}</td><td>${r.term||''}</td><td>${r.score||''}</td><td><button class='small-btn' data-id='${r.id||''}'>Edit</button></td>`;
            tbody.appendChild(tr);
        });
    }

    async function addResult(){
        const data = await window.UI.modalForm({
            title: 'Add result',
            fields: [
                {name:'studentEmail', label:'Student email'},
                {name:'subject', label:'Subject'},
                {name:'term', label:'Term'},
                {name:'score', label:'Score', type:'number'}
            ], submitText: 'Save'
        });
        if(!data) return;
        const studentSel = data.studentEmail;
        const subject = data.subject; const term = data.term; const score = data.score;
        const students = Storage.getByRole('student');
        const stud = students.find(s=> (s.Email||'').toLowerCase() === (studentSel||'').toLowerCase());
        const result = { id: Date.now().toString(36), studentEmail: (studentSel||'').toLowerCase(), studentName: stud?stud.Name:studentSel, subject, term, score: Number(score), createdAt: new Date().toISOString() };
        const arr = Storage.get('Results',[]);
        arr.push(result);
        result.average = result.score;
        Storage.set('Results', arr);
        renderResults();
        if(window.Dashboard) window.Dashboard.refresh();
        const actor = (Storage && Storage.getCurrentUser && Storage.getCurrentUser()) ? Storage.getCurrentUser().Name : 'Teacher';
        Storage && Storage.addActivity && Storage.addActivity({ actor, action: `Added result for ${result.studentName} — ${result.subject}: ${result.score}`, time: new Date().toISOString() });
        if(window.Dashboard) window.Dashboard.refresh();
        alert('Result saved');
    }

    document.addEventListener('DOMContentLoaded', ()=>{
        const path = window.location.pathname.replace(/\\/g,'/');
        if(path.includes('/pages/teachers')){
            const btn = document.querySelector('.controls .btn'); if(btn){ btn.textContent = 'Add result'; btn.addEventListener('click', addResult); }
            renderResults();
        }
    });
})();
