// Lightweight email helper: supports mailto and (optional) server-backed sending
(function(){
    const Storage = window.StorageAPI;

    function sendMailto(to, subject, body){
        if(!to) return;
        const s = encodeURIComponent(subject || '');
        const b = encodeURIComponent(body || '');
        const mailto = `mailto:${encodeURIComponent(to)}?subject=${s}&body=${b}`;
        window.open(mailto, '_blank');
    }

    // placeholder for future server send integration
    async function sendViaApi(recipient, subject, body, apiConfig){
        try{
            const res = await fetch((apiConfig && apiConfig.url) || '/api/email/send', {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ to: recipient, subject, body })
            });
            if(!res.ok) throw new Error('send_failed');
            return await res.json();
        }catch(e){ throw e; }
    }

    window.EmailHelper = { sendMailto, sendViaApi };
})();
