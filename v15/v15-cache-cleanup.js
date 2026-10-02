(()=>{
  const KEY='litoral-oke-v15-cleaned';
  if(localStorage.getItem(KEY)) return;
  localStorage.setItem(KEY,'1');
  try{
    if('serviceWorker' in navigator){ navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.unregister()))).catch(()=>{}); }
    if('caches' in window){ caches.keys().then(keys=>Promise.all(keys.filter(k=>/litoral|workbox|vite/i.test(k)).map(k=>caches.delete(k)))).catch(()=>{}); }
  }catch(e){}
})();
