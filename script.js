(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store={
    get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
    set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  };
  $('#yr').textContent=new Date().getFullYear();

  /* ---------- Robot ---------- */
  const SPLINE_URL='';
  const tpl=$('#robotTpl').innerHTML;
  $$('[data-robot]').forEach((el,i)=>{
    if(SPLINE_URL && el.id==='aboutRobot'){el.innerHTML=`<iframe src="${SPLINE_URL}" loading="lazy" title="3D robot"></iframe>`;return}
    el.innerHTML=tpl.replaceAll('__ID__',i);
  });
  addEventListener('pointermove',e=>{
    $$('.robot').forEach(r=>{
      const b=r.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height*.35;
      const nx=Math.max(-1,Math.min(1,(e.clientX-cx)/(innerWidth*.28))),ny=Math.max(-1,Math.min(1,(e.clientY-cy)/(innerHeight*.28)));
      const h=$('.rhead',r),f=$('.face',r);
      if(h)h.style.transform=`rotate(${nx*7}deg)`;
      if(f)f.style.transform=`translate(${nx*12}px,${ny*8}px)`;
      $$('.pupil',r).forEach(p=>p.style.transform=`translate(${nx*8}px,${ny*9}px)`);
    });
  });

  /* ---------- Intro ---------- */
  const intro=$('#intro');
  let introDone=false;
  function tilesFx(){
    if(reduce)return;
    const c=document.createElement('div');c.id='tiles';
    const cols=12,rows=Math.ceil(innerHeight/(innerWidth/cols))+1;
    c.style.gridTemplateColumns=`repeat(${cols},1fr)`;c.style.gridTemplateRows=`repeat(${rows},1fr)`;
    for(let i=0;i<cols*rows;i++){const d=document.createElement('i');d.style.animationDelay=(Math.random()*.55)+'s';c.append(d)}
    document.body.append(c);setTimeout(()=>c.remove(),1900);
  }
  function closeIntro(){
    if(introDone)return; introDone=true;
    tilesFx();
    setTimeout(()=>{
      intro.classList.add('out');
      document.body.classList.remove('locked');
      document.body.classList.add('ready');
      startTyping();kickSwing();
    },reduce?0:500);
  }
  intro.addEventListener('click',closeIntro);
  setTimeout(closeIntro,4800);

  /* ---------- Spotlight + kursor kotak ---------- */
  const csq=$('#csq');let tx=0,ty=0,cx=0,cy=0;
  addEventListener('pointermove',e=>{
    document.documentElement.style.setProperty('--mx',e.clientX+'px');
    document.documentElement.style.setProperty('--my',e.clientY+'px');
    tx=e.clientX+14;ty=e.clientY+14;csq.classList.add('show');
  });
  (function follow(){cx+=(tx-cx)*.16;cy+=(ty-cy)*.16;csq.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(follow)})();

  /* ---------- Nav ---------- */
  const nav=$('#nav'),burger=$('#burger'),mob=$('#mob');
  burger.onclick=()=>{burger.classList.toggle('open');mob.classList.toggle('open')};
  $$('#mob a').forEach(a=>a.addEventListener('click',()=>{burger.classList.remove('open');mob.classList.remove('open')}));
  const secs=['home','about','portfolio','contact'].map(id=>document.getElementById(id));
  const navA=[...$$('.links.l a'),...$$('.links.r a')];
  const order=['home','about','portfolio','contact'];
  function spy(){
    let cur=0;const y=scrollY+innerHeight*.35;
    secs.forEach((s,i)=>{if(s.offsetTop<=y)cur=i});
    navA.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+order[cur]));
    nav.classList.toggle('scrolled',scrollY>30);
  }
  addEventListener('scroll',spy,{passive:true});spy();

  /* ---------- Typing ---------- */
  const roles=['Web Developer','fresh Grad','UI Builder','Problem Solver','Happy coding!'];
  function startTyping(){
    const el=$('#role');let r=0,c=0,del=false;
    (function tick(){
      const w=roles[r];el.textContent=w.slice(0,c);
      if(!del&&c===w.length){del=true;return setTimeout(tick,1500)}
      if(del&&c===0){del=false;r=(r+1)%roles.length}
      c+=del?-1:1;setTimeout(tick,del?40:85);
    })();
  }

  /* ---------- Marquee ABOUT ME ---------- */
  $$('[data-m]').forEach(t=>{t.innerHTML='<span class="a">ABOUT</span><span class="m">ME</span>'.repeat(14)});

  /* ---------- Reveal + counters ---------- */
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;
    e.target.classList.add('in');io.unobserve(e.target);
    $$('[data-count]',e.target).concat(e.target.matches('[data-count]')?[e.target]:[]).forEach(count);
  }),{threshold:.15});
  $$('.reveal').forEach(n=>io.observe(n));
  function count(n){
    const to=+n.dataset.count,suf=n.dataset.suffix||'',t0=performance.now(),d=1400;
    (function f(t){const p=Math.min((t-t0)/d,1),e=1-Math.pow(1-p,3);n.textContent=Math.round(to*e)+suf;if(p<1)requestAnimationFrame(f)})(t0);
  }

  /* ---------- Tabs ---------- */
  const tabs=$$('#tabs button'),pill=$('#pill');
  tabs.forEach((b,i)=>b.addEventListener('click',()=>{
    tabs.forEach(x=>x.classList.remove('on'));b.classList.add('on');
    pill.style.transform=`translateX(${i*100}%)`;
    $$('.panel').forEach(p=>p.classList.remove('on'));
    $('#'+b.dataset.t).classList.add('on');
  }));

  /* ---------- Lanyard physics (SMOOTH) ---------- */
  const swing=$('#swing'),badge=$('#badge'),zone=$('#zone');
  let ang=0,vel=0,dragging=false,lastT=performance.now(),rafOn=false;
  function loop(t){
    const dt=Math.min((t-lastT)/16.67,3);lastT=t;
    if(!dragging){
      const g=.0045,damp=.985;
      vel+=-Math.sin(ang)*g*dt*8;
      vel*=Math.pow(damp,dt);
      ang+=vel*dt;
      if(Math.abs(ang)<.0005&&Math.abs(vel)<.0005){ang=0;vel=0}
    }
    swing.style.transform=`rotate(${ang}rad)`;
    requestAnimationFrame(loop);
  }
  function kickSwing(){
    if(!reduce){vel=.018}
    if(!rafOn){rafOn=true;requestAnimationFrame(t=>{lastT=t;loop(t)})}
  }
  function pivot(){const r=swing.getBoundingClientRect();return{x:r.left,y:r.top}}
  let prev=0,prevT=0;
  badge.addEventListener('pointerdown',e=>{
    dragging=true;badge.setPointerCapture(e.pointerId);
    const p=pivot();prev=Math.atan2(-(e.clientX-p.x),e.clientY-p.y);ang=prev;prevT=performance.now();
    if(!rafOn){rafOn=true;requestAnimationFrame(t=>{lastT=t;loop(t)})}
  });
  badge.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const p=pivot(),a=Math.atan2(-(e.clientX-p.x),e.clientY-p.y);
    const clamp=Math.max(-1.15,Math.min(1.15,-a));
    const now=performance.now(),dtm=Math.max(now-prevT,1);
    vel=(clamp-ang)/(dtm/16.67)*.45;ang=clamp;prevT=now;
  });
  const end=()=>{dragging=false};
  badge.addEventListener('pointerup',end);badge.addEventListener('pointercancel',end);
  badge.style.touchAction='none';
  zone.addEventListener('pointermove',e=>{
    if(dragging||reduce)return;
    vel+=(e.movementX||0)*.00005;
  });

  /* ---------- Message form -> email (GMAIL) ---------- */
  $('#mailForm').addEventListener('submit',e=>{
    e.preventDefault();
    const n=$('#mName').value,m=$('#mEmail').value,t=$('#mMsg').value;
    const to='febryandhika1922@gmail.com';
    const subject=encodeURIComponent('Pesan dari '+n);
    const body=encodeURIComponent(t+'\n\n— '+n+' ('+m+')');
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`,'_blank');
  });

  /* ---------- Comments ---------- */
  const heart='<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  let cms=store.get('cmts_v1',[{id:1,name:'Febry AVT',text:'Terima kasih sudah mampir!',likes:2,liked:false,pin:true}]);
  const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function draw(){
    const list=[...cms].sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||b.id-a.id);
    $('#cmts').innerHTML=list.map(c=>`
      <div class="cm ${c.pin?'pin':''}">
        <div class="av">${esc(c.name[0]||'?')}</div>
        <div class="bd"><div class="nm">${esc(c.name)} ${c.pin?'<span class="pinb">📌 PINNED</span>':''}</div>
          <p>${esc(c.text)}</p>${c.img?`<img src="${c.img}" alt="Lampiran">`:''}</div>
        <button class="like ${c.liked?'on':''}" data-id="${c.id}">${heart}<span>${c.likes}</span></button>
      </div>`).join('');
  }
  $('#cmts').addEventListener('click',e=>{
    const b=e.target.closest('.like');if(!b)return;
    const c=cms.find(x=>x.id==b.dataset.id);c.liked=!c.liked;c.likes+=c.liked?1:-1;store.set('cmts_v1',cms);draw();
  });
  $('#cImg').addEventListener('change',e=>{$('#upName').textContent=e.target.files[0]?e.target.files[0].name:'Upload Image'});
  $('#cForm').addEventListener('submit',e=>{
    e.preventDefault();
    const name=$('#cName').value.trim(),text=$('#cText').value.trim();if(!name||!text)return;
    const f=$('#cImg').files[0];
    const add=img=>{cms.push({id:Date.now(),name,text,likes:0,liked:false,pin:false,img});store.set('cmts_v1',cms);draw();$('#cText').value='';$('#cImg').value='';$('#upName').textContent='Upload Image'};
    if(f&&f.size<400000){const r=new FileReader();r.onload=()=>add(r.result);r.readAsDataURL(f)}else add();
  });
  draw();

  /* ---------- Modal detail project ---------- */
  const PROJECTS={
    bumdes:{
      title:'Website BUMDes Caracas',
      img:'img/bumdes-caracas.jpg',
      gal:['img/bumdes-caracas.jpg','img/bumdes-logo.png','img/bumdes-usaha.jpg','img/bumdes-sampah.png'],
      role:'Full-stack Developer · Desa Caracas, Kec. Kaljati, Kab. Subang',
      status:'SIAP HOSTING · BELUM ONLINE',
      desc:'Website resmi Badan Usaha Milik Desa (BUMDes) Caracas yang menampilkan profil, produk, dan layanan desa, sekaligus dilengkapi panel admin untuk mengelola data usaha secara digital.',
      feat:[
        'Halaman publik: profil BUMDes, produk, layanan, dan struktur pengurus',
        'Sistem login dengan 4 peran: Admin Utama, Admin BUMDes, User Bank Sampah, User Layanan Usaha',
        'Modul Bank Sampah: data nasabah, harga sampah, dan keuangan sampah',
        'Modul Badan Usaha: keuangan usaha, laporan stok, dan laporan keuangan',
        'Manajemen produk, kegiatan harian, dan pengurus dengan upload gambar'
      ],
      tech:['PHP','MySQL','HTML','CSS','JavaScript'],
      links:[{t:'Live Demo (segera)',off:true}]
    },
    psht:{
      title:'Website PSHT Cabang Subang',
      img:'img/psht-subang.jpg',
      gal:['img/psht-subang.jpg','img/psht-lambang.png','img/psht-sekretariat.jpg'],
      role:'Full-stack Developer · Persaudaraan Setia Hati Terate Cabang Subang',
      status:'SIAP HOSTING · BELUM ONLINE',
      desc:'Website organisasi PSHT Cabang Subang dengan sistem CMS, sehingga pengurus dapat memperbarui konten dan data keanggotaan tanpa menyentuh kode.',
      feat:[
        'Halaman publik: profil, informasi/berita, dan galeri dokumentasi',
        'Dashboard Super Admin dan panel Admin dengan level akses berbeda',
        'Pengelolaan data warga, wiro anom, pengurus cabang, pengurus ranting, dan dewan cabang',
        'Pencatatan keuangan cabang dan log aktivitas admin',
        'CMS untuk mengubah konten halaman dan upload dokumentasi kegiatan'
      ],
      tech:['PHP','MySQL','HTML','CSS','JavaScript'],
      links:[{t:'Live Demo (segera)',off:true}]
    },
    portfolio:{
      title:'Website Portfolio',
      img:'img/portofolio.png',
      gal:['img/portofolio.png','img/portfolio-intro.png','img/portfolio-idcard.png'],
      role:'Front-end Developer · Website ini sendiri',
      status:'LIVE · HALAMAN INI',
      desc:'Website portfolio pribadi dengan intro animasi, ID card interaktif berbasis fisika pendulum, dan sistem komentar pengunjung yang tersimpan di browser.',
      feat:[
        'Intro animasi dengan robot SVG yang mengikuti kursor',
        'ID card interaktif (drag & pendulum physics)',
        'Section About dengan marquee bergerak',
        'Portfolio dengan tab Projects / Certificates / Tech Stack',
        'Form kontak & kolom komentar dengan localStorage'
      ],
      tech:['HTML','CSS','JavaScript'],
      links:[{t:'Lihat Halaman Ini',href:'#home'}]
    }
  };
  const modal=$('#modal');
  function openProj(k){
    const p=PROJECTS[k];if(!p)return;
    $('#mImg').src=p.gal[0];$('#mImg').alt=p.title;
    $('#mGal').innerHTML=p.gal.map((g,i)=>`<button type="button" class="${i?'':'on'}" data-src="${g}" aria-label="Gambar ${i+1}"><img src="${g}" alt=""></button>`).join('');
    $('#mStatus').textContent=p.status;
    $('#mTitle').textContent=p.title;$('#mRole').textContent=p.role;$('#mDesc').textContent=p.desc;
    $('#mFeat').innerHTML=p.feat.map(f=>'<li>'+esc(f)+'</li>').join('');
    $('#mTech').innerHTML=p.tech.map(t=>'<span>'+esc(t)+'</span>').join('');
    $('#mLinks').innerHTML=p.links.map(l=>`<a class="btn ${l.off?'off':''}" ${l.off?'':`href="${l.href}" target="_blank" rel="noopener"`}>${esc(l.t)}</a>`).join('');
    modal.classList.add('open');document.body.classList.add('locked');
  }
  function closeProj(){modal.classList.remove('open');document.body.classList.remove('locked')}
  $$('[data-proj]').forEach(b=>b.addEventListener('click',()=>openProj(b.dataset.proj)));
  $('#mGal').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    $('#mImg').src=b.dataset.src;$$('#mGal button').forEach(x=>x.classList.toggle('on',x===b))});
  $('#mClose').addEventListener('click',closeProj);
  modal.addEventListener('click',e=>{if(e.target===modal)closeProj()});

  /* ---------- LIGHTBOX SERTIFIKAT ---------- */
  const CERTS={
    axioo:{
      name:'Piagam Penghargaan Prakerin',
      issuer:'PT Tera Data Indonusa (AXIOO) · 2021',
      icon:'🏅',
      img:'img/axioo.jpeg'
    },
    rajawali:{
      name:'Sertifikat PKL — PG Rajawali II',
      issuer:'PT PG Rajawali II Subang · 2025',
      icon:'🎓',
      img:'img/bumn.jpeg'
    },
    mandiri:{
      name:'Workshop Boost Skills with Laravel + AI',
      issuer:'Universitas Mandiri · 2025',
      icon:'⭐',
      img:'img/laravel.jpeg'
    },
    bnsp:{
      name:'Sertifikat Kompetensi BNSP',
      issuer:'BNSP · Junior Network Administrator · 2022',
      icon:'🛡️',
      img:'img/tkj.jpeg'
    }
  };
  const certOrder=['axioo','rajawali','mandiri','bnsp'];
  const certbox=$('#certbox');
  let certCur=0;

  function openCert(key){
    const idx=certOrder.indexOf(key);
    if(idx<0)return;
    certCur=idx;
    renderCert();
    certbox.classList.add('open');
    document.body.classList.add('locked');
  }
  function renderCert(){
    const key=certOrder[certCur];
    const c=CERTS[key];
    $('#certboxIcon').textContent=c.icon;
    $('#certboxName').textContent=c.name;
    $('#certboxIssuer').textContent=c.issuer;
    const img=$('#certboxImg');
    img.src=c.img;
    img.alt=c.name;
  }
  function closeCert(){
    certbox.classList.remove('open');
    document.body.classList.remove('locked');
  }
  function nextCert(dir){
    certCur=(certCur+dir+certOrder.length)%certOrder.length;
    renderCert();
  }

  $$('[data-cert]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    openCert(b.dataset.cert);
  }));

  $('#certboxClose').addEventListener('click',closeCert);
  $('#certboxNavPrev').addEventListener('click',e=>{e.stopPropagation();nextCert(-1)});
  $('#certboxNavNext').addEventListener('click',e=>{e.stopPropagation();nextCert(1)});
  $('#certboxPrev').addEventListener('click',e=>{e.stopPropagation();nextCert(-1)});
  $('#certboxNext').addEventListener('click',e=>{e.stopPropagation();nextCert(1)});

  certbox.addEventListener('click',e=>{
    if(e.target===certbox)closeCert();
  });

  // Keyboard: ESC untuk close, arrow untuk navigasi
  addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if(certbox.classList.contains('open'))closeCert();
      if(modal.classList.contains('open'))closeProj();
    }
    if(certbox.classList.contains('open')){
      if(e.key==='ArrowLeft')nextCert(-1);
      if(e.key==='ArrowRight')nextCert(1);
    }
  });

  /* ============================================================
     DOWNLOAD CV SEBAGAI GAMBAR (PNG)
     Format: Calibri, hitam, 11pt, spasi 1.0 (mirip Word formal)
     ============================================================ */
  const CV_DATA = {
    name: 'FEBRY ANDHIKA VALENT TRIESNAWAN',
    contact: 'Subang, Jawa Barat  |  081313112208  |  febryandhika1922@gmail.com',
    linkedin: 'https://www.linkedin.com/in/febry-andhika-valent-triesnawan-9b8a8a366',
    summary: 'Lulusan Universitas Mandiri Subang Teknik Informatika dengan IPK 3,36 dan pengalaman Praktik Kerja Lapangan (PKL) di dua lingkungan industri: manufaktur perangkat elektronik (flashing dan perbaikan unit NG) serta BUMN bidang pangan (ID FOOD, PT PG Rajawali II Subang). Teliti, disiplin, terbiasa mengikuti prosedur kerja dan standar kualitas, mampu bekerja dalam tim maupun mandiri, serta cepat belajar dan beradaptasi di lingkungan kerja baru. Siap ditempatkan di berbagai posisi dan bidang sesuai kebutuhan perusahaan.',
    experience: [
      {
        title: 'Praktik Kerja Lapangan (PKL) — ID FOOD, PT PG Rajawali II',
        period: 'Juli 2025 – September 2025',
        place: 'Subang, Jawa Barat',
        points: [
          'Membuat, mengembangkan, dan memelihara website untuk mendukung aktivitas operasional perusahaan serta mempermudah pengiriman data pekerja lapangan secara langsung ke kantor melalui database server.',
          'Melakukan input data dan administrasi, serta memastikan website dan sistem pengelolaan database berjalan dengan baik agar data dari lapangan dapat tersimpan dan diakses oleh pihak kantor.',
          'Memperoleh pengalaman langsung dalam pengembangan website, pemeliharaan sistem informasi, pengelolaan data, dan alur kerja divisi IT di lingkungan perusahaan.',
          'Mempelajari alur kerja dan budaya kerja perusahaan BUMN secara langsung.'
        ]
      },
      {
        title: 'Praktik Kerja Lapangan (PKL) — PT Tera Data Indonusa (Pabrik Laptop AXIO)',
        period: 'September 2021 – Desember 2021',
        place: 'Cakung, Jakarta Timur',
        points: [
          'Melakukan proses flashing pada unit laptop sesuai prosedur produksi.',
          'Memperbaiki dan menangani barang/unit berstatus NG (Not Good) hingga memenuhi standar kualitas.',
          'Mengidentifikasi penyebab kerusakan perangkat (troubleshooting) dan melaporkan hasilnya ke supervisor.'
        ]
      }
    ],
    education: [
      { school: 'Universitas Mandiri Subang', period: '2022 – 2026', detail: 'S1 Teknik Informatika | IPK 3,36 / 4,00' },
      { school: 'SMK AL-MUFTI', period: '2019 – 2022', detail: 'Teknik Komputer Dan Jaringan' }
    ],
    skills: [
      { label: 'Teknis & Digital', desc: 'Pengembangan dan pemeliharaan website, pemrograman, desain digital, pengelolaan sistem, serta troubleshooting.' },
      { label: 'Administrasi & Pengolahan Data', desc: 'Input dan pengolahan data, pengelolaan database, pengarsipan dokumen, serta Microsoft Word, Excel, dan PowerPoint.' },
      { label: 'Analisis & Pemecahan Masalah', desc: 'Berpikir analitis, identifikasi masalah, ketelitian, dan kemampuan mencari solusi secara efektif.' },
      { label: 'Soft Skills', desc: 'Komunikasi, kerja sama tim, disiplin, tanggung jawab, manajemen waktu, kemampuan belajar cepat, dan adaptasi terhadap lingkungan kerja.' }
    ],
    certifications: [
      'Sertifikasi Jaringan Komputer — BNSP | 2022',
      'TOEFL (Test of English as a Foreign Language) — Skor 480 | 2026'
    ]
  };

  function generateCVImage(){
    // ==== Pengaturan halaman ala Word (A4, margin normal 2.54 cm) ====
    // Format: Calibri, hitam, 11pt, spasi 1.0
    const PAGE_W = 794;                       // A4 @96 dpi
    const MARGIN_X = 96;                      // ~2.54 cm
    const MARGIN_TOP = 96;
    const FONT = "'Calibri','Carlito','Segoe UI',Arial,sans-serif";
    const SIZE_BODY = 15;                     // 11pt ≈ 14.67px
    const SIZE_H1   = 22;                     // nama (18pt)
    const SIZE_H2   = 16;                     // judul section (12pt bold)
    const SIZE_SMALL = 12;                    // footer
    const LINE_H    = SIZE_BODY * 1.0 * 1.25; // spasi 1.0, sedikit renggang agar nyaman
    const PARAGAP   = 8;

    const maxW = PAGE_W - MARGIN_X*2;

    // ---- Helper: word wrap yang mengembalikan array baris ----
    function wrapLines(ctx, text, maxWidth){
      const words = text.split(' ');
      let line = '';
      const lines = [];
      for(let i=0;i<words.length;i++){
        const test = line ? line + ' ' + words[i] : words[i];
        if(ctx.measureText(test).width > maxWidth && line){
          lines.push(line);
          line = words[i];
        } else {
          line = test;
        }
      }
      if(line) lines.push(line);
      return lines;
    }

    // ---- Ukur tinggi total dulu ----
    const measure = document.createElement('canvas').getContext('2d');
    measure.font = `${SIZE_BODY}px ${FONT}`;
    let totalH = MARGIN_TOP;
    totalH += SIZE_H1 + 10;                     // nama
    totalH += SIZE_BODY + 4;                    // kontak
    totalH += SIZE_BODY + 4;                    // linkedin
    totalH += 20;                               // gap
    // Ringkasan
    totalH += SIZE_H2 + 10;
    totalH += wrapLines(measure, CV_DATA.summary, maxW).length * LINE_H + PARAGAP + 10;
    // Pengalaman
    totalH += SIZE_H2 + 10;
    CV_DATA.experience.forEach(exp=>{
      totalH += SIZE_BODY + 8;
      totalH += SIZE_BODY + 4;
      exp.points.forEach(p=>{
        totalH += wrapLines(measure, '• ' + p, maxW).length * LINE_H;
      });
      totalH += PARAGAP + 10;
    });
    // Pendidikan
    totalH += SIZE_H2 + 10;
    CV_DATA.education.forEach(()=>{ totalH += SIZE_BODY + 4 + SIZE_BODY + 8; });
    totalH += 8;
    // Keahlian
    totalH += SIZE_H2 + 10;
    CV_DATA.skills.forEach(s=>{
      totalH += SIZE_BODY + 4;
      totalH += wrapLines(measure, s.desc, maxW).length * LINE_H + PARAGAP;
    });
    // Sertifikasi
    totalH += SIZE_H2 + 10;
    CV_DATA.certifications.forEach(()=>{ totalH += SIZE_BODY + 8; });
    totalH += 50; // footer

    const PAGE_H = Math.max(totalH + MARGIN_TOP, 1123); // min A4

    // ---- Canvas utama ----
    const canvas = document.createElement('canvas');
    const dpr = 2;
    canvas.width  = PAGE_W * dpr;
    canvas.height = PAGE_H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Background putih
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,PAGE_W,PAGE_H);

    let y = MARGIN_TOP;

    // ---- Nama (hitam, bold) ----
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${SIZE_H1}px ${FONT}`;
    ctx.fillText(CV_DATA.name, MARGIN_X, y + SIZE_H1);
    y += SIZE_H1 + 12;

    // ---- Kontak (hitam) ----
    ctx.fillStyle = '#000000';
    ctx.font = `${SIZE_BODY}px ${FONT}`;
    ctx.fillText(CV_DATA.contact, MARGIN_X, y + SIZE_BODY);
    y += SIZE_BODY + 4;

    // ---- LinkedIn (hitam) ----
    ctx.fillText(CV_DATA.linkedin, MARGIN_X, y + SIZE_BODY);
    y += SIZE_BODY + 18;

    // ---- Garis pemisah ----
    function hr(yy){
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(MARGIN_X, yy);
      ctx.lineTo(PAGE_W-MARGIN_X, yy);
      ctx.stroke();
    }
    hr(y);
    y += 24;

    // ---- Section title (hitam, bold) ----
    function sectionTitle(txt){
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${SIZE_H2}px ${FONT}`;
      ctx.fillText(txt, MARGIN_X, y + SIZE_H2);
      y += SIZE_H2 + 10;
    }

    // ---- Ringkasan ----
    sectionTitle('RINGKASAN PROFESIONAL');
    ctx.fillStyle = '#000000';
    ctx.font = `${SIZE_BODY}px ${FONT}`;
    {
      const lines = wrapLines(ctx, CV_DATA.summary, maxW);
      lines.forEach((ln,i)=>ctx.fillText(ln, MARGIN_X, y + SIZE_BODY + i*LINE_H));
      y += lines.length * LINE_H + PARAGAP + 10;
    }

    // ---- Pengalaman Kerja ----
    sectionTitle('PENGALAMAN KERJA');
    CV_DATA.experience.forEach(exp=>{
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${SIZE_BODY}px ${FONT}`;
      const titleLines = wrapLines(ctx, exp.title, maxW);
      titleLines.forEach((ln,i)=>ctx.fillText(ln, MARGIN_X, y + SIZE_BODY + i*LINE_H));
      y += titleLines.length * LINE_H + 2;

      ctx.font = `${SIZE_BODY}px ${FONT}`;
      ctx.fillText(exp.period + '  |  ' + exp.place, MARGIN_X, y + SIZE_BODY);
      y += SIZE_BODY + 4;

      exp.points.forEach(p=>{
        const lines = wrapLines(ctx, '• ' + p, maxW);
        lines.forEach((ln,i)=>ctx.fillText(ln, MARGIN_X, y + SIZE_BODY + i*LINE_H));
        y += lines.length * LINE_H;
      });
      y += PARAGAP + 8;
    });

    // ---- Pendidikan ----
    sectionTitle('PENDIDIKAN');
    CV_DATA.education.forEach(e=>{
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${SIZE_BODY}px ${FONT}`;
      ctx.fillText(e.school, MARGIN_X, y + SIZE_BODY);
      ctx.font = `${SIZE_BODY}px ${FONT}`;
      ctx.fillText('  [' + e.period + ']', MARGIN_X + ctx.measureText(e.school).width + 100, y + SIZE_BODY);
      y += SIZE_BODY + 4;
      ctx.fillText(e.detail, MARGIN_X, y + SIZE_BODY);
      y += SIZE_BODY + 8;
    });
    y += 6;

    // ---- Keahlian ----
    sectionTitle('KEAHLIAN');
    CV_DATA.skills.forEach(s=>{
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${SIZE_BODY}px ${FONT}`;
      ctx.fillText(s.label + ':', MARGIN_X, y + SIZE_BODY);
      y += SIZE_BODY + 4;
      ctx.font = `${SIZE_BODY}px ${FONT}`;
      const lines = wrapLines(ctx, s.desc, maxW);
      lines.forEach((ln,i)=>ctx.fillText(ln, MARGIN_X, y + SIZE_BODY + i*LINE_H));
      y += lines.length * LINE_H + PARAGAP;
    });

    // ---- Sertifikasi & Bahasa ----
    sectionTitle('SERTIFIKASI & BAHASA');
    CV_DATA.certifications.forEach(c=>{
      ctx.fillStyle = '#000000';
      ctx.font = `${SIZE_BODY}px ${FONT}`;
      ctx.fillText('• ' + c, MARGIN_X, y + SIZE_BODY);
      y += SIZE_BODY + 8;
    });

    // ---- Footer ----
    y += 20;
    ctx.fillStyle = '#555555';
    ctx.font = `italic ${SIZE_SMALL}px ${FONT}`;
    ctx.fillText('CV ini dibuat otomatis dari portfolio Febry Andhika — ' + new Date().toLocaleDateString('id-ID'), MARGIN_X, y + SIZE_SMALL);

    return canvas;
  }

  const btnDL = document.getElementById('downloadCV');
  if(btnDL){
    btnDL.addEventListener('click', ()=>{
      btnDL.disabled = true;
      const oldHTML = btnDL.innerHTML;
      btnDL.innerHTML = 'Menyiapkan CV...';
      setTimeout(()=>{
        try{
          const canvas = generateCVImage();
          canvas.toBlob(blob=>{
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'CV_Febry_Andhika_Valent_Triesnawan.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(()=>URL.revokeObjectURL(url), 1000);
            btnDL.disabled = false;
            btnDL.innerHTML = oldHTML;
          }, 'image/png');
        }catch(err){
          console.error(err);
          alert('Gagal membuat CV. Silakan coba lagi.');
          btnDL.disabled = false;
          btnDL.innerHTML = oldHTML;
        }
      }, 100);
    });
  }
})();