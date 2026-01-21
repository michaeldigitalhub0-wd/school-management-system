// Admin page behaviors: add/list students, teachers, classes, and view results
(function(){
    const Storage = window.StorageAPI;
    function el(selector){ return document.querySelector(selector); }

    function renderStudents(){
        const tbody = el('main .data-table tbody');
        if(!tbody) return;
        const students = Storage ? Storage.getByRole('student') : [];
        tbody.innerHTML = '';
        students.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${s.Name||''}</td><td>${s.Class||s.$CLASS||''}</td><td>${s.Roll||s.$ADMISSION_NUMBER||''}</td><td>${s.Phone||s.Email||''}</td><td><button class="small-btn edit-btn" data-email="${s.Email}">Edit</button> <button class="small-btn delete-btn" data-email="${s.Email}" style="background:#e35;">Delete</button></td>`;
            // add impersonate button for admin convenience
            // insert after actions cell
            tr.querySelector && tr.querySelector('td:last-child') && (tr.querySelector('td:last-child').innerHTML = `<button class="small-btn edit-btn" data-email="${s.Email}">Edit</button> <button class="small-btn setpass-btn" data-email="${s.Email}" data-role="student" style="background:#5a5;">Set password</button> <button class="small-btn imp-btn" data-email="${s.Email}" data-role="student" style="background:#3a8;">Login</button> <button class="small-btn delete-btn" data-email="${s.Email}" style="background:#e35;">Delete</button>`);
            tbody.appendChild(tr);
        });
    }

    function renderTeachers(){
        const tbody = el('main .data-table tbody');
        if(!tbody) return;
        const teachers = Storage ? Storage.getByRole('teacher') : [];
        tbody.innerHTML = '';
        teachers.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${t.Name||''}</td><td>${t.Subject||t.$SUBJECT||''}</td><td>${t.Email||''}</td><td>${t.Phone||''}</td><td><button class="small-btn edit-btn" data-email="${t.Email}">Edit</button> <button class="small-btn delete-btn" data-email="${t.Email}" style="background:#e35;">Delete</button></td>`;
            tr.querySelector && tr.querySelector('td:last-child') && (tr.querySelector('td:last-child').innerHTML = `<button class="small-btn edit-btn" data-email="${t.Email}">Edit</button> <button class="small-btn setpass-btn" data-email="${t.Email}" data-role="teacher" style="background:#5a5;">Set password</button> <button class="small-btn imp-btn" data-email="${t.Email}" data-role="teacher" style="background:#3a8;">Impersonate</button> <button class="small-btn delete-btn" data-email="${t.Email}" style="background:#e35;">Delete</button>`);
            tbody.appendChild(tr);
        });
    }

    function renderResults(){
        const tbody = el('main .data-table tbody');
        if(!tbody) return;
        const results = Storage ? Storage.get('Results',[]) : [];
        tbody.innerHTML = '';
        results.forEach(r => {
            const avg = r.average || computeAverage(r.scores || {});
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${r.studentName||r.student||''}</td><td>${r.class||''}</td><td>${r.term||''}</td><td>${avg}</td><td><button class="small-btn" data-id="${r.id||''}">View</button></td>`;
            tbody.appendChild(tr);
        });
    }

    function renderParents(){
        const tbody = el('main .data-table tbody');
        if(!tbody) return;
        const parents = Storage ? Storage.getByRole('parent') : [];
        tbody.innerHTML = '';
        parents.forEach(p => {
            const child = p.ChildEmail || p.Child || '';
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${p.Name||''}</td><td>${child}</td><td>${p.Phone||p.Email||''}</td><td><button class="small-btn edit-btn" data-email="${p.Email}">Edit</button> <button class="small-btn setpass-btn" data-email="${p.Email}" data-role="parent" style="background:#5a5;">Set password</button> <button class="small-btn imp-btn" data-email="${p.Email}" data-role="parent" style="background:#3a8;">Impersonate</button> <button class="small-btn delete-btn" data-email="${p.Email}" style="background:#e35;">Delete</button></td>`;
            tbody.appendChild(tr);
        });
    }

    function computeAverage(scores){
        const vals = Object.values(scores||{}).map(Number).filter(v=>!isNaN(v));
        if(!vals.length) return '—';
        return (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1);
    }

    function generatePassword(len = 10){
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        let out = '';
        for(let i=0;i<len;i++) out += chars[Math.floor(Math.random()*chars.length)];
        return out;
    }

    function sendMailto(to, subject, body){
        if(!to) return;
        const s = encodeURIComponent(subject || '');
        const b = encodeURIComponent(body || '');
        const mailto = `mailto:${encodeURIComponent(to)}?subject=${s}&body=${b}`;
        // open in new tab/window; some browsers may block multiple opens
        window.open(mailto, '_blank');
    }

    async function composeEmail(){
        const data = await window.UI.modalForm({
            title: 'Compose email to role',
            fields: [
                { name: 'Role', label: 'Role', type: 'select', options: [ {value:'student', label:'Students'}, {value:'teacher', label:'Teachers'}, {value:'parent', label:'Parents'} ] },
                { name: 'Subject', label: 'Subject' },
                { name: 'Body', label: 'Body (use placeholders: {{Name}}, {{Email}}, {{Password}}, {{Class}}, {{Teacher}} )', type: 'textarea' }
            ],
            submitText: 'Send'
        });
        if(!data) return;
        const role = data.Role;
        const subject = data.Subject || '';
        const bodyTemplate = data.Body || '';
        const recipients = Storage.getByRole(role) || [];
        if(!recipients.length){ alert('No recipients found for ' + role); return; }
        const actor = (Storage && Storage.getCurrentUser && Storage.getCurrentUser()) ? Storage.getCurrentUser().Name : 'Admin';
        // send emails sequentially to avoid popup blocking
        recipients.forEach((r, i) => {
            setTimeout(()=>{
                const teacherForStudent = (role === 'student') ? (Storage.getByRole('teacher')||[]).find(t => (t.Class||t.AssignedClass) === (r.Class||r.$CLASS)) || (Storage.getByRole('teacher')||[])[0] : null;
                const teacherName = teacherForStudent ? teacherForStudent.Name : 'Not assigned';
                const body = (bodyTemplate || '').replace(/{{Name}}/g, r.Name||'')
                    .replace(/{{Email}}/g, r.Email||'')
                    .replace(/{{Password}}/g, r.Password||'')
                    .replace(/{{Class}}/g, r.Class||r.$CLASS||'')
                    .replace(/{{Teacher}}/g, teacherName);
                if(r.Email){
                    if(window.EmailHelper && window.EmailHelper.sendMailto) window.EmailHelper.sendMailto(r.Email, subject, body);
                    else sendMailto(r.Email, subject, body);
                }
            }, i * 500);
        });
        Storage && Storage.addActivity && Storage.addActivity({ actor, action: `Sent emails to ${recipients.length} ${role}`, time: new Date().toISOString() });
        alert('Emails queued in your email client.');
    }

    async function addStudent(){
        const data = await window.UI.modalForm({
            title: 'Add student',
            fields: [
                {name:'Name', label:'Full name'},
                {name:'Email', label:'Email', type:'email'},
                {name:'Class', label:'Class'},
                {name:'Roll', label:'Admission/Roll'}
            ],
            submitText: 'Add'
        });
        if(!data) return;
        const pwd = generatePassword(10);
        const arr = Storage.getByRole('student');
        arr.push({ Name: data.Name, Email: (data.Email||'').toLowerCase(), Class: data.Class, Roll: data.Roll, Password: pwd, createdAt: new Date().toISOString() });
        Storage.saveByRole('student', arr);
        renderStudents();
        if(window.Dashboard) window.Dashboard.refresh();
        const actor = (Storage && Storage.getCurrentUser && Storage.getCurrentUser()) ? Storage.getCurrentUser().Name : 'System';
        Storage && Storage.addActivity && Storage.addActivity({ actor, action: `Added student ${data.Name} (${data.Email})`, time: new Date().toISOString() });
        // Attempt to find a teacher for the class (best-effort)
        const teacher = (Storage.getByRole('teacher')||[]).find(t => (t.Class||t.AssignedClass) === data.Class) || (Storage.getByRole('teacher')||[])[0];
        const teacherName = teacher ? teacher.Name : 'Not assigned';
        const subject = `Welcome ${data.Name} — your account details`;
        const body = `Welcome ${data.Name},\n\nYour student account has been created.\n\nLogin credentials:\nEmail: ${data.Email}\nPassword: ${pwd}\nClass: ${data.Class}\nTeacher: ${teacherName}\n\nPlease login at ${window.location.origin + '/Login.html'}\n\nRegards,\nSchool Admin`;
        if(data.Email) {
            if(window.EmailHelper && window.EmailHelper.sendMailto) window.EmailHelper.sendMailto(data.Email, subject, body);
            else sendMailto(data.Email, subject, body);
            Storage && Storage.addActivity && Storage.addActivity({ actor, action: `Sent welcome email to student ${data.Email}`, time: new Date().toISOString() });
        }
        alert('Student added and welcome email queued');
    }

    async function addTeacher(){
        const data = await window.UI.modalForm({
            title: 'Add teacher',
            fields: [ {name:'Name', label:'Full name'}, {name:'Email', label:'Email', type:'email'}, {name:'Subject', label:'Subject'} ],
            submitText: 'Add'
        });
        if(!data) return;
        const pwd = generatePassword(10);
        const arr = Storage.getByRole('teacher');
        arr.push({ Name: data.Name, Email: (data.Email||'').toLowerCase(), Subject: data.Subject, Password: pwd, createdAt: new Date().toISOString() });
        Storage.saveByRole('teacher', arr);
        renderTeachers();
        if(window.Dashboard) window.Dashboard.refresh();
        const actor = (Storage && Storage.getCurrentUser && Storage.getCurrentUser()) ? Storage.getCurrentUser().Name : 'System';
        Storage && Storage.addActivity && Storage.addActivity({ actor, action: `Added teacher ${data.Name} (${data.Email})`, time: new Date().toISOString() });
        // send welcome email to teacher with credentials
        const subject = `Welcome ${data.Name} — your teacher account`;
        const body = `Welcome ${data.Name},\n\nYour teacher account has been created.\n\nLogin credentials:\nEmail: ${data.Email}\nPassword: ${pwd}\nSubject: ${data.Subject}\n\nPlease login at ${window.location.origin + '/Login.html'}\n\nRegards,\nSchool Admin`;
        if(data.Email){
            if(window.EmailHelper && window.EmailHelper.sendMailto) window.EmailHelper.sendMailto(data.Email, subject, body);
            else sendMailto(data.Email, subject, body);
            Storage && Storage.addActivity && Storage.addActivity({ actor, action: `Sent welcome email to teacher ${data.Email}`, time: new Date().toISOString() });
        }
        alert('Teacher added and welcome email queued');
    }

    async function deleteStudent(email){
        if(!email) return;
        const ok = await window.UI.modalForm({ title: 'Confirm delete', fields:[], submitText:'Delete' });
        if(!ok) return;
        let arr = Storage.getByRole('student');
        arr = arr.filter(s => (s.Email||'').toLowerCase() !== (email||'').toLowerCase());
        Storage.saveByRole('student', arr);
        renderStudents();
        if(window.Dashboard) window.Dashboard.refresh();
        const actor = (Storage && Storage.getCurrentUser && Storage.getCurrentUser()) ? Storage.getCurrentUser().Name : 'System';
        Storage && Storage.addActivity && Storage.addActivity({ actor, action: `Deleted student ${email}`, time: new Date().toISOString() });
    }

    async function deleteTeacher(email){
        if(!email) return;
        const ok = await window.UI.modalForm({ title: 'Confirm delete', fields:[], submitText:'Delete' });
        if(!ok) return;
        let arr = Storage.getByRole('teacher');
        arr = arr.filter(t => (t.Email||'').toLowerCase() !== (email||'').toLowerCase());
        Storage.saveByRole('teacher', arr);
        renderTeachers();
        if(window.Dashboard) window.Dashboard.refresh();
        const actor = (Storage && Storage.getCurrentUser && Storage.getCurrentUser()) ? Storage.getCurrentUser().Name : 'System';
        Storage && Storage.addActivity && Storage.addActivity({ actor, action: `Deleted teacher ${email}`, time: new Date().toISOString() });
    }

    async function addClass(){
        const data = await window.UI.modalForm({ title: 'Add class', fields:[{name:'name', label:'Class name'}], submitText:'Add' });
        if(!data) return;
        const classes = Storage.get('Classes',[]);
        classes.push({ name: data.name, createdAt: new Date().toISOString() });
        Storage.set('Classes', classes);
        if(window.Dashboard) window.Dashboard.refresh();
        const actor = (Storage && Storage.getCurrentUser && Storage.getCurrentUser()) ? Storage.getCurrentUser().Name : 'System';
        Storage && Storage.addActivity && Storage.addActivity({ actor, action: `Added class ${data.name}`, time: new Date().toISOString() });
        alert('Class added');
    }

    async function addParent(){
        const students = Storage.getByRole('student') || [];
        const options = students.map(s=>({ value: (s.Email||s.$EMAIL||''), label: (s.Name? (s.Name + (s.Class? (' — ' + s.Class):'')) : (s.Email||'')) }));
        const data = await window.UI.modalForm({
            title: 'Add parent',
            fields: [
                {name:'Name', label:'Full name'},
                {name:'Email', label:'Email', type:'email'},
                {name:'Phone', label:'Phone'},
                {name:'ChildEmail', label:'Child (select)', type:'select', options: options }
            ],
            submitText: 'Add'
        });
        if(!data) return;
        const pwd = generatePassword(10);
        const arr = Storage.getByRole('parent');
        arr.push({ Name: data.Name, Email: (data.Email||'').toLowerCase(), Phone: data.Phone, ChildEmail: data.ChildEmail, Password: pwd, createdAt: new Date().toISOString() });
        Storage.saveByRole('parent', arr);
        renderParents();
        if(window.Dashboard) window.Dashboard.refresh();
        const actor = (Storage && Storage.getCurrentUser && Storage.getCurrentUser()) ? Storage.getCurrentUser().Name : 'System';
        Storage && Storage.addActivity && Storage.addActivity({ actor, action: `Added parent ${data.Name} (${data.Email}) for child ${data.ChildEmail}`, time: new Date().toISOString() });
        // send welcome email to parent including child info
        const child = (Storage.getByRole('student')||[]).find(s=> (s.Email||'').toLowerCase() === (data.ChildEmail||'').toLowerCase());
        const childName = child ? (child.Name || '') : '';
        const childClass = child ? (child.Class || child.$CLASS || '') : '';
        const subject = `Welcome ${data.Name} — parent account`;
        const body = `Welcome ${data.Name},\n\nA parent account has been created for you.\n\nLogin credentials:\nEmail: ${data.Email}\nPassword: ${pwd}\nChild: ${childName} (${data.ChildEmail})\nClass: ${childClass}\n\nPlease login at ${window.location.origin + '/Login.html'}\n\nRegards,\nSchool Admin`;
        if(data.Email){
            if(window.EmailHelper && window.EmailHelper.sendMailto) window.EmailHelper.sendMailto(data.Email, subject, body);
            else sendMailto(data.Email, subject, body);
            Storage && Storage.addActivity && Storage.addActivity({ actor, action: `Sent welcome email to parent ${data.Email}`, time: new Date().toISOString() });
        }
        alert('Parent added and welcome email queued');
    }

    async function deleteParent(email){
        if(!email) return;
        const ok = await window.UI.modalForm({ title: 'Confirm delete', fields:[], submitText:'Delete' });
        if(!ok) return;
        let arr = Storage.getByRole('parent');
        arr = arr.filter(p => (p.Email||'').toLowerCase() !== (email||'').toLowerCase());
        Storage.saveByRole('parent', arr);
        renderParents();
        if(window.Dashboard) window.Dashboard.refresh();
        const actor = (Storage && Storage.getCurrentUser && Storage.getCurrentUser()) ? Storage.getCurrentUser().Name : 'System';
        Storage && Storage.addActivity && Storage.addActivity({ actor, action: `Deleted parent ${email}`, time: new Date().toISOString() });
    }

    async function impersonateUser(email, role){
        if(!email || !role) return;
        const arr = Storage.getByRole(role||'');
        const user = (arr||[]).find(u => ((u.Email||'').toLowerCase() === (email||'').toLowerCase()));
        if(!user){ alert('User not found'); return; }
        const ok = await window.UI.modalForm({ title: 'Admin Login', fields:[], submitText:'Continue' });
        if(!ok) return;
        const current = (Storage && Storage.getCurrentUser && Storage.getCurrentUser()) || null;
        const impersonated = Object.assign({}, user);
        impersonated.__impersonatedBy = current ? (current.Email || current.Name) : 'admin';
        impersonated.__impersonatedAt = new Date().toISOString();
        Storage && Storage.setCurrentUser && Storage.setCurrentUser(impersonated);
        Storage && Storage.addActivity && Storage.addActivity({ actor: (current && current.Name) || 'Admin', action: `Impersonated ${role} ${user.Name || user.Email}`, time: new Date().toISOString() });
        // redirect to impersonated user's dashboard
        const r = (role||'').toString().toLowerCase();
        let path = '/Login.html';
        if(r === 'admin') path = '/pages/admin/dashboard.html';
        else if(r === 'teacher') path = '/pages/teachers/dashboard.html';
        else if(r === 'student') path = '/pages/students/dashboard.html';
        else if(r === 'parent') path = '/pages/parents/dashboard.html';
        window.location.replace(path);
    }

    async function setPassword(email, role){
        if(!email || !role) return;
        const data = await window.UI.modalForm({
            title: 'Set password',
            fields: [
                { name: 'NewPassword', label: 'New password', type: 'password' },
                { name: 'ConfirmPassword', label: 'Confirm password', type: 'password' }
            ],
            submitText: 'Set'
        });
        if(!data) return;
        const p1 = data.NewPassword || '';
        const p2 = data.ConfirmPassword || '';
        if(!p1 || p1 !== p2){ alert('Passwords do not match'); return; }
        if(window.Utils && window.Utils.passwordStrength && window.Utils.passwordStrength(p1) < 1){ if(!confirm('Password seems weak. Continue?')) return; }
        const arr = Storage.getByRole(role) || [];
        const idx = arr.findIndex(u => ((u.Email||'').toLowerCase() === (email||'').toLowerCase()));
        if(idx === -1){ alert('User not found'); return; }
        arr[idx].Password = p1;
        Storage.saveByRole(role, arr);
        // If currently signed-in user matches, update current user password too
        const cur = Storage.getCurrentUser && Storage.getCurrentUser();
        if(cur && ((cur.Email||'').toLowerCase() === (email||'').toLowerCase())){
            cur.Password = p1;
            Storage.setCurrentUser && Storage.setCurrentUser(cur);
        }
        const actor = (Storage && Storage.getCurrentUser && Storage.getCurrentUser()) ? Storage.getCurrentUser().Name : 'System';
        Storage && Storage.addActivity && Storage.addActivity({ actor, action: `Set password for ${role} ${email}`, time: new Date().toISOString() });
        alert('Password updated');
    }

    function exportResultsCSV(){
        const results = Storage.get('Results',[]);
        if(!results.length){ alert('No results'); return; }
        const rows = ['student,studentEmail,class,term,average'];
        results.forEach(r => rows.push([r.studentName||'', r.studentEmail||'', r.class||'', r.term||'', r.average||''].join(',')));
        const csv = rows.join('\n');
        const blob = new Blob([csv], {type:'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'results.csv'; a.click(); URL.revokeObjectURL(url);
        const actor = (Storage && Storage.getCurrentUser && Storage.getCurrentUser()) ? Storage.getCurrentUser().Name : 'System';
        Storage && Storage.addActivity && Storage.addActivity({ actor, action: `Exported results CSV (${results.length} rows)`, time: new Date().toISOString() });
    }

    document.addEventListener('DOMContentLoaded', ()=>{
        const path = window.location.pathname.replace(/\\/g,'/');
        if(path.endsWith('/pages/admin/students.html')){
            const btn = document.querySelector('.controls .btn'); if(btn) btn.textContent = 'Add student'; btn && btn.addEventListener('click', addStudent);
            // add Compose email button
            const controls = document.querySelector('.controls');
            if(controls && !controls.querySelector('.email-btn')){
                const ebtn = document.createElement('button'); ebtn.className = 'btn email-btn'; ebtn.textContent = 'Compose email'; ebtn.addEventListener('click', composeEmail); controls.appendChild(ebtn);
            }
            renderStudents();
            const tbody = document.querySelector('main .data-table tbody');
            if(tbody){
                tbody.addEventListener('click', function(e){
                    const t = e.target;
                    if(t.matches('.delete-btn')){
                        const email = t.getAttribute('data-email'); deleteStudent(email);
                            } else if(t.matches('.imp-btn')){
                                const email = t.getAttribute('data-email'); const role = t.getAttribute('data-role') || 'student'; impersonateUser(email, role);
                            } else if(t.matches('.setpass-btn')){
                                const email = t.getAttribute('data-email'); const role = t.getAttribute('data-role') || 'student'; setPassword(email, role);
                    } else if(t.matches('.edit-btn')){
                        const email = t.getAttribute('data-email');
                        alert('Edit not implemented yet for ' + email);
                    }
                });
            }
        }
        if(path.endsWith('/pages/admin/teachers.html')){
            const btn = document.querySelector('.controls .btn'); if(btn) btn.textContent = 'Add teacher'; btn && btn.addEventListener('click', addTeacher);
            const controls = document.querySelector('.controls');
            if(controls && !controls.querySelector('.email-btn')){
                const ebtn = document.createElement('button'); ebtn.className = 'btn email-btn'; ebtn.textContent = 'Compose email'; ebtn.addEventListener('click', composeEmail); controls.appendChild(ebtn);
            }
            renderTeachers();
            // delegate delete/edit actions
            const tbody = document.querySelector('main .data-table tbody');
            if(tbody){
                tbody.addEventListener('click', function(e){
                    const t = e.target;
                    if(t.matches('.delete-btn')){
                        const email = t.getAttribute('data-email'); deleteTeacher(email);
                        } else if(t.matches('.imp-btn')){
                            const email = t.getAttribute('data-email'); const role = t.getAttribute('data-role') || 'teacher'; impersonateUser(email, role);
                            } else if(t.matches('.setpass-btn')){
                                const email = t.getAttribute('data-email'); const role = t.getAttribute('data-role') || 'teacher'; setPassword(email, role);
                        } else if(t.matches('.edit-btn')){
                        // optional: implement edit flow
                        const email = t.getAttribute('data-email');
                        alert('Edit not implemented yet for ' + email);
                    }
                });
            }
        }
        if(path.endsWith('/pages/admin/classes.html')){
            const btn = document.querySelector('.controls .btn'); if(btn) btn.textContent = 'Add class'; btn && btn.addEventListener('click', addClass);
        }
        if(path.endsWith('/pages/admin/parents.html')){
            const btn = document.querySelector('.controls .btn'); if(btn) btn.textContent = 'Add parent'; btn && btn.addEventListener('click', addParent);
            const controls = document.querySelector('.controls');
            if(controls && !controls.querySelector('.email-btn')){
                const ebtn = document.createElement('button'); ebtn.className = 'btn email-btn'; ebtn.textContent = 'Compose email'; ebtn.addEventListener('click', composeEmail); controls.appendChild(ebtn);
            }
            renderParents();
            const tbody = document.querySelector('main .data-table tbody');
            if(tbody){
                tbody.addEventListener('click', function(e){
                    const t = e.target;
                    if(t.matches('.delete-btn')){
                        const email = t.getAttribute('data-email'); deleteParent(email);
                        } else if(t.matches('.imp-btn')){
                            const email = t.getAttribute('data-email'); const role = t.getAttribute('data-role') || 'parent'; impersonateUser(email, role);
                            } else if(t.matches('.setpass-btn')){
                                const email = t.getAttribute('data-email'); const role = t.getAttribute('data-role') || 'parent'; setPassword(email, role);
                        } else if(t.matches('.edit-btn')){
                        const email = t.getAttribute('data-email');
                        alert('Edit not implemented yet for ' + email);
                    }
                });
            }
        }
        if(path.endsWith('/pages/admin/dashboard.html')){
            const clearBtn = document.getElementById('clear-activity');
            if(clearBtn){ clearBtn.addEventListener('click', ()=>{ Storage && Storage.clearActivities && Storage.clearActivities(); if(window.Dashboard) window.Dashboard.refresh(); const actEl = document.querySelector('[data-dashboard-activities]'); if(actEl) actEl.textContent = 'No activity yet.'; }); }
        }
        if(path.endsWith('/pages/admin/results.html')){
            const controls = document.querySelector('.controls');
            if(controls){
                const btn = controls.querySelector('.btn') || document.createElement('button');
                btn.textContent = 'Export CSV'; btn.className = 'btn';
                btn.addEventListener('click', exportResultsCSV);
                controls.appendChild(btn);
            }
            renderResults();
            const clearBtn = document.getElementById('clear-activity');
            if(clearBtn){ clearBtn.addEventListener('click', ()=>{ Storage && Storage.clearActivities && Storage.clearActivities(); if(window.Dashboard) window.Dashboard.refresh(); const actEl = document.querySelector('[data-dashboard-activities]'); if(actEl) actEl.textContent = 'No activity yet.'; }); }
        }
    });
})();
