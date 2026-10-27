/**
 * YENİ NESLE, YENİ NESİL SINIF - ANA JAVASCRIPT DOSYASI
 * Ferah ve Doğayla İç İçe Öğrenme Mimarisi
 * Saf Vanilla JS - Harici Kütüphane Bağımlılığı Yoktur
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. SES MOTORU & DOĞA AMBİYANS SENTEZLEYİCİSİ (Web Audio API)
     ========================================================================== */
  class NatureAudioEngine {
    constructor() {
      this.audioCtx = null;
      this.isNaturePlaying = false;
      this.soundEnabled = true;
      this.natureNodes = [];
    }

    init() {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
    }

    playClick() {
      if (!this.soundEnabled) return;
      this.init();
      if (!this.audioCtx) return;

      try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(550, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(280, this.audioCtx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.04);
      } catch (e) {}
    }

    playSuccess() {
      if (!this.soundEnabled) return;
      this.init();
      if (!this.audioCtx) return;

      try {
        const now = this.audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0.06, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
      } catch (e) {}
    }

    toggleNatureAmbience() {
      this.init();
      if (!this.audioCtx) return false;

      if (this.isNaturePlaying) {
        this.natureNodes.forEach(node => {
          try { node.stop(); } catch (e) {}
          try { node.disconnect(); } catch (e) {}
        });
        this.natureNodes = [];
        this.isNaturePlaying = false;
        return false;
      } else {
        try {
          const bufferSize = this.audioCtx.sampleRate * 2;
          const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.025;
            b6 = white * 0.115926;
          }

          const whiteNoise = this.audioCtx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          const filter = this.audioCtx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);

          const gain = this.audioCtx.createGain();
          gain.gain.setValueAtTime(0.09, this.audioCtx.currentTime);

          whiteNoise.connect(filter);
          filter.connect(gain);
          gain.connect(this.audioCtx.destination);

          whiteNoise.start();
          this.natureNodes.push(whiteNoise);
          this.isNaturePlaying = true;
          return true;
        } catch (e) {
          return false;
        }
      }
    }
  }

  const audio = new NatureAudioEngine();

  const natureSoundBtn = document.getElementById('nature-sound-toggle');
  if (natureSoundBtn) {
    natureSoundBtn.addEventListener('click', () => {
      const isPlaying = audio.toggleNatureAmbience();
      const txt = natureSoundBtn.querySelector('.sound-txt');
      if (isPlaying) {
        natureSoundBtn.classList.add('playing');
        if (txt) txt.innerHTML = 'Doğa Sesi: <strong>Açık (Orman)</strong>';
      } else {
        natureSoundBtn.classList.remove('playing');
        if (txt) txt.innerHTML = 'Doğa Sesi: <strong>Kapalı</strong>';
      }
    });
  }

  const soundToggleBtn = document.getElementById('sound-toggle');
  if (soundToggleBtn) {
    const soundOn = soundToggleBtn.querySelector('.sound-on-icon');
    const soundOff = soundToggleBtn.querySelector('.sound-off-icon');

    soundToggleBtn.addEventListener('click', () => {
      audio.soundEnabled = !audio.soundEnabled;
      if (audio.soundEnabled) {
        soundOn.classList.remove('hidden');
        soundOff.classList.add('hidden');
        audio.playClick();
      } else {
        soundOn.classList.add('hidden');
        soundOff.classList.remove('hidden');
      }
    });
  }

  /* ==========================================================================
     2. GİRİŞ EKRANI (PRELOADER)
     ========================================================================== */
  const introScreen = document.getElementById('intro-screen');
  const introProgress = document.getElementById('intro-progress');
  const introPercentage = document.getElementById('intro-percentage');
  const introStatusText = document.getElementById('intro-status-text');
  const skipIntroBtn = document.getElementById('skip-intro-btn');

  let currentPercent = 0;
  let introFinished = false;

  const steps = [
    { threshold: 0, text: 'Ferah mekan ve doğa yerleşimi yükleniyor...' },
    { threshold: 30, text: 'Orman manzaralı cam cephe optimize ediliyor...' },
    { threshold: 65, text: 'Doğal ahşap dalga masalar hazırlanıyor...' },
    { threshold: 90, text: '"Yeni nesle, yeni nesil sınıf" hazır!' }
  ];

  function finishIntro() {
    if (introFinished) return;
    introFinished = true;
    if (introScreen) {
      introScreen.classList.add('hide');
      setTimeout(() => {
        introScreen.style.display = 'none';
        startCounters();
      }, 650);
    }
  }

  if (skipIntroBtn) skipIntroBtn.addEventListener('click', finishIntro);

  const introTimer = setInterval(() => {
    currentPercent += Math.floor(Math.random() * 9) + 4;
    if (currentPercent >= 100) {
      currentPercent = 100;
      clearInterval(introTimer);
      if (introProgress) introProgress.style.width = '100%';
      if (introPercentage) introPercentage.textContent = '100%';
      if (introStatusText) introStatusText.textContent = 'Hazır!';
      setTimeout(finishIntro, 300);
    } else {
      if (introProgress) introProgress.style.width = `${currentPercent}%`;
      if (introPercentage) introPercentage.textContent = `${currentPercent}%`;
      const curMsg = steps.slice().reverse().find(s => currentPercent >= s.threshold);
      if (curMsg && introStatusText) introStatusText.textContent = curMsg.text;
    }
  }, 45);

  /* ==========================================================================
     3. AMBİYANS CANVAS (MAT PARÇACIKLAR)
     ========================================================================== */
  const canvas = document.getElementById('ambient-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = window.innerWidth < 768 ? 20 : 40;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: i % 2 === 0 ? 'rgba(74, 222, 128, 0.25)' : 'rgba(217, 119, 6, 0.2)'
      });
    }

    function renderCanvas() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(74, 222, 128, ${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(renderCanvas);
    }
    renderCanvas();
  }

  /* ==========================================================================
     4. NAVBAR & AKTİF MENÜ
     ========================================================================== */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerCloseBtn = document.getElementById('drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
      audio.playClick();
    });

    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        audio.playClick();
      });
    }

    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  const navSections = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll('.nav-links .nav-link');

  window.addEventListener('scroll', () => {
    let cur = '';
    const scrollPos = window.scrollY + 180;

    navSections.forEach(sec => {
      if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
        cur = sec.getAttribute('id');
      }
    });

    desktopLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${cur}`) {
        link.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     5. HERO SAYAÇLARI
     ========================================================================== */
  function startCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      let current = 0;
      const step = Math.max(1, Math.floor(target / 30));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          counter.textContent = target;
          clearInterval(interval);
        } else {
          counter.textContent = current;
        }
      }, 35);
    });
  }

  /* ==========================================================================
     6. PLAN ANALİZİ MOTORU
     ========================================================================== */
  const planData = {
    tree: {
      badge: 'DOĞAL ODAK NOKTASI',
      title: 'Merkezi Ağaç & Doğal Taş Saksı Alanı',
      sub: '"Ferah bir çalışma alanının yaşayan kalbi"',
      desc: 'Sınıfın kalbinde yer alan doğal taş saksı içerisindeki canlı ağaç, mekana taze oksijen ve sakinleştirici bir doğal dokunuş kazandırır. Öğrenciler ders aralarında ve grup çalışmalarında bu yeşil adanın çevresinde toplanır.',
      specs: [
        '✓ Doğal Harçlı Taş Duvar Saksı',
        '✓ Canlı İç Mekan Ağacı & Doğal Toprak',
        '✓ Doğal Çakıl Taş Dolgusu',
        '✓ 360 Derece Rahat Dolaşım Alanı'
      ],
      quote: '"Yeşilin ve doğal ahşabın olduğu ferah bir alanda öğrencinin dikkati dağılmaz, zihni sakinleşir ve üretkenliği artar."',
      author: '— Biyofilik Eğitim Tasarımı İlkeleri'
    },
    amphi: {
      badge: 'AMFİ & ETKİLEŞİM',
      title: 'Kavisli Çok Seviyeli Oturma Alanı ve Taş Dolgu',
      sub: '"Hiyerarşisiz, herkesin birbirini gördüğü amfi alanı"',
      desc: 'Doğal taş dolgulu zemin ve kademeli ahşap basamaklar, sınıfın tiyatro ve tartışma düzenine saniyeler içinde geçmesini sağlar. Minderlerle desteklenmiş ferah oturum sunar.',
      specs: [
        '✓ Çok Seviyeli Masif Ahşap Kademeler',
        '✓ Doğal Dere Taşı Yataklama Dolgusu',
        '✓ 18-24 Öğrenci Eşzamanlı Dinleme Kapasitesi',
        '✓ Ergonomik Rahat Oturma Minderleri'
      ],
      quote: '"Sıra arkasına saklanmak yok; herkes halkanın bir parçası, herkesin sesi eşit ve değerli."',
      author: '— Yeni Nesil Pedagoji Manifestosu'
    },
    tables: {
      badge: 'ORGANİK ÇALIŞMA İSTASYONU',
      title: 'Modüler Çalışma Masaları ve Ahşap Tabureler',
      sub: '"Doğanın kıvrımlarını taşıyan dalga formlu masalar"',
      desc: 'Düz ve sert köşeli sıralar yerine çocukların beden ergonomisine uyum sağlayan kıvrımlı dalga masalar kullanılmıştır. Masalar birleştiğinde büyük bir proje adasına, ayrıldığında bireysel hücrelere dönüşür.',
      specs: [
        '✓ Masif Meşe Doğal Ahşap Tabla',
        '✓ 3 Ayaklı Hafif ve Devrilmez Ahşap Tabureler',
        '✓ Hızlıca İstenen Düzene Geçebilen Mobilite',
        '✓ Çizilmeye Dayanıklı Doğal Koruyucu Cila'
      ],
      quote: '"Doğada hiçbir şey cetvelle çizilmiş düz çizgilerle var olmaz; masalar da doğanın kıvrımını takip etmelidir."',
      author: '— Çocuk Gelişimi & Ergonomi Derneği'
    },
    glass: {
      badge: 'PANORAMİK DOĞA CEPHESİ',
      title: 'Orman Manzaralı Cam Duvar ve Ahşap Pergola',
      sub: '"Dört mevsim yeşili içeri alan ışık koridoru"',
      desc: 'Dış mekandaki orman dokusunu kesintisiz içeri alan tavandan tabana şeffaf cam duvar ve ahşap pergola tavan yapısı. Gün ışığını içeri alarak göz yorgunluğunu sıfırlar.',
      specs: [
        '✓ Tavandan Tabana Çift Camlı Isı Yalıtımlı Paneller',
        '✓ Doğal Masif Ahşap Pergola Tavan Taşıyıcıları',
        '✓ Orman & Ağaç Manzaralı Görsel Derinlik',
        '✓ Gün Işığını Doğrudan Masalara İndiren Çatı Pencereleri'
      ],
      quote: '"Ders dinlerken kafasını çevirdiğinde rüzgarda sallanan ağaç dallarını gören bir çocuğun zihni asla yorulmaz."',
      author: '— Çevre Psikolojisi Araştırmaları'
    },
    kitchen: {
      badge: 'YAŞAM BECERİLERİ & BESLENME',
      title: 'Fonksiyonel Mutfak / Servis Alanı',
      sub: '"Okulda ev sıcaklığı, bitki çayı ve paylaşım"',
      desc: 'Sınıfın girişinde yer alan kompakt servis mutfağı; lavabo, ocak, su arıtma ünitesi ve saklama dolaplarıyla donatılmıştır. Öğrenciler bitki çaylarını demler ve sağlıklı atıştırmalıklarını hazırlar.',
      specs: [
        '✓ Tezgah Üstü Paslanmaz Çelik Evye & Su Arıtma',
        '✓ Bitki Çayı & Sıcak Su Hazırlama İstasyonu',
        '✓ Geri Dönüşümlü Atık Ayrıştırma Hazneleri',
        '✓ Kilitli Hijyenik Ahşap Mutfak Dolapları'
      ],
      quote: '"Eğitim sadece kitap okumak değildir; bir fincan ıhlamur demlemeyi ve arkadaşıyla bölüşmeyi öğrenmektir."',
      author: '— Yaşam Odaklı Eğitim Felsefesi'
    },
    fireplace: {
      badge: 'HUZUR & SESSİZLİK ALANI',
      title: 'Şömineli Okuma Köşesi & Kütüphane',
      sub: '"Sıcak alevler, rahat koltuk ve kitaplar"',
      desc: 'Sınıfın köşesinde çıtırdayan şömine, berjer koltuk ve masif ahşap kitaplık rafları. Öğrencilerin derinleşerek kitap okuyabileceği ve sakinleşebileceği huzurlu bir vaha.',
      specs: [
        '✓ Doğal Taş Kaplama Şömine Görünümü & Sıcak Işık',
        '✓ Ergonomik Kumaş Kaplı Geniş Berjer Koltuk',
        '✓ Tavana Kadar Uzanan Masif Meşe Kitaplık',
        '✓ Sessiz Fısıltı ve Bireysel Odaklanma Alanı'
      ],
      quote: '"Kitap okumak bir ceza değil; şömine başında sıcacık bir fincan eşliğinde çıkılan en güzel yolculuktur."',
      author: '— Edebiyat & Okuma Kültürü Derneği'
    }
  };

  const planButtons = document.querySelectorAll('.plan-tab-btn');
  const zoneBadge = document.getElementById('zoneBadge');
  const zoneTitle = document.getElementById('zoneTitle');
  const zoneSub = document.getElementById('zoneSub');
  const zoneDesc = document.getElementById('zoneDesc');
  const zoneSpecs = document.getElementById('zoneSpecs');
  const zoneQuote = document.getElementById('zoneQuote');
  const zoneAuthor = document.getElementById('zoneAuthor');

  planButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      planButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      audio.playClick();

      const zoneKey = btn.getAttribute('data-zone');
      const data = planData[zoneKey];

      if (data) {
        if (zoneBadge) zoneBadge.textContent = data.badge;
        if (zoneTitle) zoneTitle.textContent = data.title;
        if (zoneSub) zoneSub.textContent = data.sub;
        if (zoneDesc) zoneDesc.textContent = data.desc;
        if (zoneSpecs) {
          zoneSpecs.innerHTML = data.specs.map(s => `<span class="spec-pill">${s}</span>`).join('');
        }
        if (zoneQuote) zoneQuote.textContent = data.quote;
        if (zoneAuthor) zoneAuthor.textContent = data.author;
      }
    });
  });

  /* ==========================================================================
     7. KARŞILAŞTIRMA SEKMELERİ & SLIDER
     ========================================================================== */
  const modeTabs = document.querySelectorAll('.mode-tab');
  const displayBlocks = {
    split: document.getElementById('split-view'),
    slider: document.getElementById('slider-view'),
    matrix: document.getElementById('matrix-view')
  };

  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      audio.playClick();

      const view = tab.getAttribute('data-view');
      Object.keys(displayBlocks).forEach(key => {
        if (displayBlocks[key]) {
          if (key === view) displayBlocks[key].classList.remove('hidden');
          else displayBlocks[key].classList.add('hidden');
        }
      });
    });
  });

  const sliderWrapper = document.getElementById('sliderWrapper');
  const afterImageLayer = document.getElementById('afterImageLayer');
  const sliderHandle = document.getElementById('sliderHandle');

  if (sliderWrapper && afterImageLayer && sliderHandle) {
    let isDragging = false;

    function moveSlider(clientX) {
      const rect = sliderWrapper.getBoundingClientRect();
      let offsetX = clientX - rect.left;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;
      const pct = (offsetX / rect.width) * 100;
      afterImageLayer.style.width = `${pct}%`;
      sliderHandle.style.left = `${pct}%`;
    }

    sliderWrapper.addEventListener('mousedown', e => {
      isDragging = true;
      moveSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => (isDragging = false));
    window.addEventListener('mousemove', e => {
      if (isDragging) moveSlider(e.clientX);
    });

    sliderWrapper.addEventListener('touchstart', e => {
      isDragging = true;
      moveSlider(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => (isDragging = false));
    window.addEventListener('touchmove', e => {
      if (isDragging) moveSlider(e.touches[0].clientX);
    }, { passive: true });
  }

  /* ==========================================================================
     8. GALERİ FİLTRELEME & MODAL LIGHTBOX
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.g-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-card.g-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      audio.playClick();

      const filter = btn.getAttribute('data-filter');
      galleryItems.forEach(item => {
        if (filter === 'all' || item.classList.contains(filter)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  const galleryData = {
    'modal-plan': {
      src: './assets/images/biyofilik-mimari-plan.jpg',
      badge: 'Mimari Çizim',
      title: 'Ferah Sınıf Yerleşim Planı',
      desc: 'Canlı yeşil alan, kademeli taş oturma amfisi, orman manzaralı cam cephe, dalga masalar ve şömineli okuma köşesini gösteren ölçekli mimari plan.',
      specs: [
        '✦ <strong>Merkez:</strong> Doğal taş saksılı iç mekan yeşil alanı',
        '✦ <strong>Cephe:</strong> Tavandan tabana orman manzaralı cam duvar ve ahşap pergola',
        '✦ <strong>Oturum:</strong> Kavisli amfi basamakları ve nehir taşı dolgusu',
        '✦ <strong>Slogan:</strong> "Yeni nesle, yeni nesil sınıf"'
      ]
    },
    'modal-forest': {
      src: './assets/images/orman-manzarali-sinif.png',
      badge: 'İç Mekan Perspektifi',
      title: 'Orman Manzarası & Ahşap Kirişli Tavan',
      desc: 'Güneş ışığını doğrudan içeri alan eğimli ahşap tavan kirişleri ve çatı ışıklıkları. Çocukların ormanı izleyerek dalga masalarda ders çalıştığı ferah ekosistem.',
      specs: [
        '✦ <strong>Tavan:</strong> Masif ahşap kirişler ve doğal gün ışığı sağlayan skylight pencereleri',
        '✦ <strong>Doğa:</strong> Boydan boya orman manzaralı cam cephe',
        '✦ <strong>Kütüphane:</strong> Duvar boyu masif meşe kitaplık rafları',
        '✦ <strong>Zemin:</strong> Doğal ahşap zemin kaplaması'
      ]
    },
    'modal-furniture': {
      src: './assets/images/organik-ahsap-mobilya.png',
      badge: 'Mobilya & Biyofili Detayı',
      title: 'Organik Dalga Masalar & Canlı Bitki Rafları',
      desc: 'Doğal kıvrımlara sahip ahşap dalga masalar ve çocukların arasında dolaşan doğal hava temizleyici bitki üniteleri.',
      specs: [
        '✦ <strong>Masalar:</strong> Çocuk ergonomisine uygun kavisli dalga formlu masif tablalar',
        '✦ <strong>Tabureler:</strong> Devrilmez, hafif ahşap tabureler',
        '✦ <strong>Bitkiler:</strong> Havayı tazeleyen yeşil bitki rafları'
      ]
    },
    'modal-modular': {
      src: './assets/images/moduler-sinif.jpg',
      badge: 'Uygulanmış Modern Proje',
      title: 'Modüler Altıgen Ada & Kademeli Oturma',
      desc: 'Puf modülleriyle donatılmış, ahşap tavanlı ve ferah grup çalışma ortamı.',
      specs: [
        '✦ <strong>Tavan:</strong> Doğal ahşap çıtalı ses yutucu akustik tavan',
        '✦ <strong>Işık:</strong> Dairesel homojen asma armatürler',
        '✦ <strong>Modüller:</strong> Silinebilir altıgen ve kıvrımlı puf oturma birimleri'
      ]
    },
    'modal-hallway': {
      src: './assets/images/acik-atolye.png',
      badge: 'Açık Atölye & Koridor',
      title: 'Açık Koridor & 360° Yazılabilir Duvar Panosu',
      desc: 'Kapıları kaldıran şeffaf cam bölmeler, koridoru bir öğrenme atölyesine dönüştüren boydan boya beyaz tahta duvarlar.',
      specs: [
        '✦ <strong>Duvar:</strong> Manyetik ve tamamen yazılabilir kuru silinebilir dev duvar',
        '✦ <strong>Zemin:</strong> Ses yansıtmayan endüstriyel vinil kaplama',
        '✦ <strong>Hareket:</strong> Tekerlekli ergonomik sandalyeler'
      ]
    },
    'modal-breakout': {
      src: './assets/images/interaktif-alan.jpg',
      badge: 'Medya & Dinlenme Köşesi',
      title: 'İnteraktif Medya Ekranı & Galeri Duvarı',
      desc: 'Öğrenci çalışmalarının sergilendiği panolar, sunum ekranı ve rahat minderli mola alanı.',
      specs: [
        '✦ <strong>Ekran:</strong> 4K Dokunmatik interaktif sunum ekranı',
        '✦ <strong>Dinlenme:</strong> Konforlu minderler',
        '✦ <strong>Sergi:</strong> Öğrenci çizim ve projeleri için modüler pano'
      ]
    }
  };

  const galleryModal = document.getElementById('galleryModal');
  const modalImg = document.getElementById('modalImg');
  const modalBadge = document.getElementById('modalBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalSpecs = document.getElementById('modalSpecs');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');

  document.querySelectorAll('.zoom-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const modalKey = btn.getAttribute('data-modal');
      const data = galleryData[modalKey];

      if (data && galleryModal) {
        modalImg.src = data.src;
        modalBadge.textContent = data.badge;
        modalTitle.textContent = data.title;
        modalDesc.textContent = data.desc;
        modalSpecs.innerHTML = data.specs.map(s => `<div>${s}</div>`).join('');
        galleryModal.classList.remove('hidden');
        audio.playClick();
      }
    });
  });

  function closeGalleryModal() {
    if (galleryModal) {
      galleryModal.classList.add('hidden');
      audio.playClick();
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeGalleryModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeGalleryModal);
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeGalleryModal();
  });

  /* ==========================================================================
     9. SİMÜLATÖR MOTORU
     ========================================================================== */
  const simButtons = document.querySelectorAll('.sim-btn');
  const modulesContainer = document.getElementById('modulesContainer');
  const simModeTag = document.getElementById('simModeTag');
  const simModeDesc = document.getElementById('simModeDesc');

  const simInfoMap = {
    team: {
      tag: 'Aktif Düzen: Grup & Takım Düzeni',
      desc: 'Dalga masalar ferah ortak üretim adalarına ayrıldı. Öğrenciler yüz yüze bakarak tartışır ve birlikte üretir.'
    },
    amphi: {
      tag: 'Aktif Düzen: Kavisli Amfi & Sunum / Münazara',
      desc: 'Masalar kavisli amfi düzenine geçti. Ortadaki sahne, sunum yapan öğrenci veya anlatıcı için doğal bir merkeze dönüştü.'
    },
    individual: {
      tag: 'Aktif Düzen: Orman Manzaralı Bireysel Odak',
      desc: 'Masalar pencerelere ve orman manzarasına doğru ayrıldı. Masif ahşabın huzuru ve doğal ışık sayesinde tam odaklanma sağlandı.'
    },
    maker: {
      tag: 'Aktif Düzen: Geniş Atölye & Üretim',
      desc: 'Masalar servis alanı ve şöminenin yanına çekilerek merkezde devasa bir serbest üretim ve maket alanı açıldı.'
    }
  };

  simButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      simButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      audio.playClick();

      const layout = btn.getAttribute('data-layout');
      if (modulesContainer) modulesContainer.className = `modules-container layout-${layout}`;

      if (simInfoMap[layout]) {
        if (simModeTag) simModeTag.textContent = simInfoMap[layout].tag;
        if (simModeDesc) simModeDesc.textContent = simInfoMap[layout].desc;
      }
    });
  });

  /* ==========================================================================
     10. TEST MOTORU
     ========================================================================== */
  const calcBtn = document.getElementById('calculate-score-btn');
  const quizResult = document.getElementById('quizResult');
  const resultScoreNum = document.getElementById('resultScoreNum');
  const resultTitle = document.getElementById('resultTitle');
  const resultFeedback = document.getElementById('resultFeedback');
  const retakeBtn = document.getElementById('retake-quiz-btn');

  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const q1 = document.querySelector('input[name="q1"]:checked');
      const q2 = document.querySelector('input[name="q2"]:checked');
      const q3 = document.querySelector('input[name="q3"]:checked');
      const q4 = document.querySelector('input[name="q4"]:checked');
      const q5 = document.querySelector('input[name="q5"]:checked');

      if (!q1 || !q2 || !q3 || !q4 || !q5) {
        alert('Lütfen tüm 5 soruyu yanıtlayınız!');
        return;
      }

      const total = +q1.value + +q2.value + +q3.value + +q4.value + +q5.value;
      audio.playSuccess();

      let counter = 0;
      quizResult.classList.remove('hidden');
      calcBtn.parentElement.classList.add('hidden');

      const countInt = setInterval(() => {
        counter += 2;
        if (counter >= total) {
          resultScoreNum.textContent = total;
          clearInterval(countInt);
        } else {
          resultScoreNum.textContent = counter;
        }
      }, 20);

      if (total <= 30) {
        resultTitle.textContent = 'Eski Basık Sınıf Düzeni (Dönüşüm Gerekli)';
        resultFeedback.textContent = 'Sınıfınız doğadan ve hareketten kopuk, sıkışık bir düzende. Çocukların enerjisi ve merakı beton duvarlar arasında sönüyor. Ferah çalışma alanları ve dalga masalarla tanışmalısınız!';
      } else if (total <= 70) {
        resultTitle.textContent = 'Geçiş Dönemi Sınıfı (Potansiyeli Yüksek)';
        resultFeedback.textContent = 'Bazı güzel adımlar atılmış ancak geniş sirkülasyon, kavisli amfi oturma ve orman manzaralı cam cephe gibi ferahlık devrimi henüz tamamlanmamış.';
      } else {
        resultTitle.textContent = '🌿 Yeni Nesle Uygun Ferah ve Doğal Sınıf!';
        resultFeedback.textContent = 'Harika! Sınıfınız tam anlamıyla "Yeni nesle, yeni nesil sınıf" felsefesini yansıtıyor. Çocukların ferahlıkla nefes aldığı, doğayla iç içe mükemmel bir öğrenme alanındasınız!';
      }
    });
  }

  if (retakeBtn) {
    retakeBtn.addEventListener('click', () => {
      quizResult.classList.add('hidden');
      calcBtn.parentElement.classList.remove('hidden');
      document.querySelectorAll('.quiz-option input').forEach(inp => (inp.checked = false));
      audio.playClick();
    });
  }

  /* ==========================================================================
     11. YUKARI ÇIK & SCROLL REVEAL
     ========================================================================== */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      audio.playClick();
    });
  }

  const revealNodes = document.querySelectorAll('[data-reveal]');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.getAttribute('data-delay') || 0;
        setTimeout(() => el.classList.add('revealed'), delay);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -25px 0px' });

  revealNodes.forEach(node => observer.observe(node));

  document.querySelectorAll('.btn, .nav-link, .hotspot').forEach(el => {
    el.addEventListener('click', () => audio.playClick());
  });

});
