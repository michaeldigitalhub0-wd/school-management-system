// Validation and small utility helpers
const Utils = {
	isEmail(val){
		if(!val) return false;
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
	},
	isNotEmpty(val){ return val !== null && val !== undefined && String(val).trim() !== ''; },
	passwordStrength(p){
		if(!p) return 0;
		let score = 0;
		if(p.length >= 8) score++;
		if(/[A-Z]/.test(p)) score++;
		if(/[0-9]/.test(p)) score++;
		if(/[^A-Za-z0-9]/.test(p)) score++;
		return score; // 0-4
	},
	showError(el, msg){
		if(!el) { alert(msg); return; }
		let node = document.createElement('div');
		node.className = 'form-error';
		node.textContent = msg;
		el.parentNode && el.parentNode.appendChild(node);
		setTimeout(()=> node.remove(), 4000);
	}
};

window.Utils = Utils;

// Simple modal form UI that matches site styles
;(function(){
	function ensureStyles(){
		if(document.getElementById('site-modal-styles')) return;
		const css = `
		.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:9999}
		.modal-card{background:var(--surface, #fff);border-radius:10px;padding:1.25rem;max-width:520px;width:100%;box-shadow:0 6px 24px rgba(0,0,0,0.12)}
		.modal-card h3{margin:0 0 0.75rem;font-size:1.1rem}
		.modal-row{display:flex;flex-direction:column;gap:0.4rem;margin-bottom:0.6rem}
		.modal-row label{font-size:0.85rem;color:var(--secondary-text-color)}
		.modal-row input,.modal-row select,.modal-row textarea{padding:0.6rem;border-radius:999px;border:1px solid rgba(0,0,0,0.08);width:100%}
		.modal-actions{display:flex;gap:0.5rem;justify-content:flex-end;margin-top:0.6rem}
		.modal-btn{padding:0.6rem 1rem;border-radius:999px;background:var(--primary-color,#123);color:#fff;border:none}
		.modal-cancel{background:transparent;color:var(--primary-color,#123);border:1px solid rgba(0,0,0,0.08)}
		`;
		const s = document.createElement('style'); s.id = 'site-modal-styles'; s.textContent = css; document.head.appendChild(s);
	}

	function buildField(field){
		const wrap = document.createElement('div'); wrap.className = 'modal-row';
		if(field.label){ const l = document.createElement('label'); l.textContent = field.label; wrap.appendChild(l); }
		let input;
		if(field.type === 'textarea'){
			input = document.createElement('textarea'); input.rows = 4;
		} else if(field.type === 'select'){
			input = document.createElement('select');
			(field.options||[]).forEach(o=>{ const opt = document.createElement('option'); opt.value = o.value; opt.textContent = o.label; input.appendChild(opt); });
		} else {
			input = document.createElement('input'); input.type = field.type || 'text';
		}
		input.name = field.name;
		if(field.value) input.value = field.value;
		wrap.appendChild(input);
		return {wrap, input};
	}

	window.UI = window.UI || {};
	window.UI.modalForm = function(opts){
		ensureStyles();
		return new Promise((resolve)=>{
			const overlay = document.createElement('div'); overlay.className = 'modal-overlay';
			const card = document.createElement('div'); card.className = 'modal-card';
			const title = document.createElement('h3'); title.textContent = opts.title || 'Form'; card.appendChild(title);
			const fields = opts.fields || [];
			const inputs = {};
			fields.forEach(f=>{
				const built = buildField(f);
				card.appendChild(built.wrap);
				inputs[f.name] = built.input;
			});
			const actions = document.createElement('div'); actions.className = 'modal-actions';
			const cancel = document.createElement('button'); cancel.className = 'modal-cancel'; cancel.textContent = 'Cancel';
			const submit = document.createElement('button'); submit.className = 'modal-btn'; submit.textContent = opts.submitText || 'Save';
			actions.appendChild(cancel); actions.appendChild(submit); card.appendChild(actions);
			overlay.appendChild(card); document.body.appendChild(overlay);
			cancel.addEventListener('click', ()=>{ overlay.remove(); resolve(null); });
			submit.addEventListener('click', ()=>{
				const out = {};
				Object.keys(inputs).forEach(k=> out[k] = inputs[k].value);
				overlay.remove(); resolve(out);
			});
		});
	};
})();