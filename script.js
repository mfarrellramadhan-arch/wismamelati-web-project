/* =================================================================
   TERATAK HIJAU KOS & RESIDENCE — SCRIPT UTAMA (Vanilla JS)
   Daftar isi:
     1. Dark Mode Toggle (dengan localStorage)
     2. Navbar: efek scroll + menu mobile
     3. Data Tipe Kamar & Render Kartu Dinamis (+ badge status)
     4. Scroll Reveal Animation (IntersectionObserver)
     5. Galeri & Lightbox
     6. Testimonial Carousel
     7. FAQ Accordion
     8. Contact Form (validasi & feedback sederhana)
     9. Util kecil (tahun footer, smooth-close menu saat klik link)
================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------
     1. DARK MODE TOGGLE
     Menyimpan preferensi pengguna di localStorage agar tetap
     konsisten saat halaman dibuka kembali. Jika belum pernah diatur,
     ikuti preferensi sistem (prefers-color-scheme).
  --------------------------------------------------------------- */
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggle');

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    themeToggleBtn.setAttribute('aria-pressed', theme === 'dark');
    themeToggleBtn.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Ubah ke mode terang' : 'Ubah ke mode gelap'
    );
  }

  const savedTheme = localStorage.getItem('teratakhijau-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('teratakhijau-theme', nextTheme);
  });

  /* ---------------------------------------------------------------
     2. NAVBAR — efek saat scroll + menu mobile (hamburger)
  --------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  // Tambah class 'is-scrolled' saat halaman discroll melewati ambang tertentu
  function handleNavbarScroll() {
    navbar.classList.toggle('is-scrolled', window.scrollY > 30);
  }
  handleNavbarScroll(); // jalankan sekali saat load
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  // Toggle menu mobile
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Tutup menu mobile otomatis saat salah satu link diklik
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Auto close ketika user klik diluar nav menu
  const handleAutoClose = (e) => {
    if (navMenu.classList.contains('is-open') && (!e || !e.target.closest('.navbar'))) {
      navMenu.classList.remove('is-open');
    };
  };

  document.addEventListener('click', handleAutoClose);

  // Close menu dengan button
  document.body.addEventListener('click', (e) => {
    const dismissBtn = e.target.closest('[data-dismiss-target]')
  
    if (!dismissBtn) return;
  
    const targetSelector = dismissBtn.getAttribute('data-dismiss-target')
    const targetElement = dismissBtn.closest(targetSelector)
  
    if (targetElement) {
      targetElement.classList.remove('is-open')
    }
  })
  


  /* ---------------------------------------------------------------
     3. DATA TIPE KAMAR — sumber data tunggal untuk render kartu
     Cukup ubah angka "sisa" di sini untuk memperbarui status
     ketersediaan di seluruh halaman tanpa menyentuh HTML.
  --------------------------------------------------------------- */
  const roomData = [
    {
      nama: 'Kamar Dalam',
      deskripsi: 'Kamar isian dengan posisi didalam bangunan dan tidak langsung menghadap teras.',
      harga: 800000,
      satuan: 'bulan',
      sisa: 3, // jumlah kamar tersisa, gunakan 0 untuk status "Penuh"
      fasilitas: ['Kasur Single', 'Lemari', 'Wi-Fi', 'Meja'],
      gambar: 'https://picsum.photos/seed/teratakhijau-room-standar/500/380',
    },
    {
      nama: 'Kamar Luar',
      deskripsi: 'Kamar isian dengan posisi menghadap ke teras luar.',
      harga: 1200000,
      satuan: 'bulan',
      sisa: 1,
      fasilitas: ['Kasur single', 'Meja', 'Wi-Fi', 'lemari'],
      gambar: 'https://picsum.photos/seed/teratakhijau-room-deluxe/500/380',
    },
    // {
    //   nama: 'Kamar Suite',
    //   deskripsi: 'Tipe paling nyaman, AC, kamar mandi dalam, dan akses balkon pribadi.',
    //   harga: 1750000,
    //   satuan: 'bulan',
    //   sisa: 0,
    //   fasilitas: ['AC', 'Kamar Mandi Dalam', 'Balkon'],
    //   gambar: 'https://picsum.photos/seed/teratakhijau-room-suite/500/380',
    // },
  ];

  // Tentukan label & class badge berdasarkan jumlah kamar yang tersisa
  function getAvailabilityBadge(sisa) {
    if (sisa <= 0) {
      return { text: 'Penuh', className: 'room-card__badge--full' };
    }
    if (sisa <= 1) {
      return { text: `Sisa ${sisa} Kamar`, className: 'room-card__badge--limited' };
    }
    return { text: `Sisa ${sisa} Kamar`, className: 'room-card__badge--available' };
  }

  // Format angka jadi format Rupiah sederhana (tanpa library eksternal)
  function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
  }

  function renderRoomCards() {
    const roomGrid = document.getElementById('roomGrid');
    if (!roomGrid) return;

    // Bangun markup HTML dari array roomData, lalu sisipkan sekali (efisien)
    const cardsHTML = roomData.map((room) => {
      const badge = getAvailabilityBadge(room.sisa);
      const isFull = room.sisa <= 0;

      const amenitiesHTML = room.fasilitas
        .map((item) => `<span>${item}</span>`)
        .join('');

      return `
        <article class="room-card reveal">
          <div class="room-card__media">
            <img src="${room.gambar}" alt="Tampilan ${room.nama} di Wisma Melati Kos" loading="lazy">
            <span class="room-card__badge ${badge.className}">${badge.text}</span>
          </div>

          <div class="room-card__body">
            <h3>${room.nama}</h3>
            <p class="room-card__desc">${room.deskripsi}</p>
            <div class="room-card__amenities">${amenitiesHTML}</div>
            <div class="room-card__footer">
              <div class="room-card__price">
                <strong>${formatRupiah(room.harga)}</strong>
                <span>per ${room.satuan}</span>
              </div>
              <a
                href="${isFull ? '#kontak' : `https://wa.me/6281234567890?text=${encodeURIComponent('Halo, saya ingin booking ' + room.nama + ' di Teratak Hijau.')}`}"
                class="btn ${isFull ? 'btn--disabled' : 'btn--primary'} btn--sm"
                ${isFull ? 'aria-disabled="true"' : 'target="_blank" rel="noopener noreferrer"'}
              >
                ${isFull ? 'Gabung Waiting List' : 'Booking'}
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    roomGrid.innerHTML = cardsHTML;

    // Setelah kartu disisipkan, daftarkan ulang elemen .reveal yang baru
    // dibuat ke IntersectionObserver supaya animasi fade-in tetap berjalan.
    roomGrid.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  }

  /* ---------------------------------------------------------------
     4. SCROLL REVEAL ANIMATION
     Menambahkan class 'is-visible' saat elemen .reveal masuk viewport.
  --------------------------------------------------------------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target); // animasi cukup sekali
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  // Render kartu kamar dulu (butuh data), baru observe semua .reveal yang sudah ada
  renderRoomCards();
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* ---------------------------------------------------------------
     5. GALERI & LIGHTBOX
     Klik salah satu foto di grid galeri akan membuka lightbox
     dengan navigasi sebelumnya/berikutnya antar foto.
  --------------------------------------------------------------- */
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentGalleryIndex = 0;

  function openLightbox(index) {
    currentGalleryIndex = index;
    const item = galleryItems[index];
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = item.querySelector('img').alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden'; // kunci scroll halaman di belakang modal
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  function showRelativeImage(step) {
    currentGalleryIndex = (currentGalleryIndex + step + galleryItems.length) % galleryItems.length;
    openLightbox(currentGalleryIndex);
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => showRelativeImage(-1));
  lightboxNext.addEventListener('click', () => showRelativeImage(1));

  // Tutup lightbox saat klik area gelap di luar foto, atau tekan Escape
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showRelativeImage(-1);
    if (e.key === 'ArrowRight') showRelativeImage(1);
  });

  /* ---------------------------------------------------------------
     6. TESTIMONIAL CAROUSEL
     Carousel sederhana berbasis transform translateX, lengkap
     dengan tombol prev/next dan indikator dot.
  --------------------------------------------------------------- */
  const testimonialTrack = document.getElementById('testimonialTrack');
  const testimonialSlides = Array.from(testimonialTrack.children);
  const testimonialDotsWrap = document.getElementById('testimonialDots');
  const testimonialPrevBtn = document.getElementById('testimonialPrev');
  const testimonialNextBtn = document.getElementById('testimonialNext');
  let testimonialIndex = 0;

  // Buat dot indikator sesuai jumlah slide secara dinamis
  testimonialSlides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Lihat testimoni ke-${index + 1}`);
    dot.addEventListener('click', () => goToTestimonial(index));
    testimonialDotsWrap.appendChild(dot);
  });
  const testimonialDots = Array.from(testimonialDotsWrap.children);

  function goToTestimonial(index) {
    testimonialIndex = (index + testimonialSlides.length) % testimonialSlides.length;
    testimonialTrack.style.transform = `translateX(-${testimonialIndex * 100}%)`;
    testimonialDots.forEach((dot, i) => dot.classList.toggle('is-active', i === testimonialIndex));
  }
  goToTestimonial(0); // inisialisasi tampilan & dot pertama

  testimonialPrevBtn.addEventListener('click', () => goToTestimonial(testimonialIndex - 1));
  testimonialNextBtn.addEventListener('click', () => goToTestimonial(testimonialIndex + 1));

  // Auto-rotate testimoni setiap 6 detik, berhenti sejenak saat pengguna berinteraksi
  let testimonialAutoplay = setInterval(() => goToTestimonial(testimonialIndex + 1), 6000);
  const testimonialCarousel = document.getElementById('testimonialCarousel');
  testimonialCarousel.addEventListener('mouseenter', () => clearInterval(testimonialAutoplay));
  testimonialCarousel.addEventListener('mouseleave', () => {
    testimonialAutoplay = setInterval(() => goToTestimonial(testimonialIndex + 1), 6000);
  });

  /* ---------------------------------------------------------------
     7. FAQ ACCORDION
     Hanya satu pertanyaan yang terbuka dalam satu waktu agar
     halaman tetap rapi (menutup item lain saat item baru dibuka).
  --------------------------------------------------------------- */
  const accordionTriggers = document.querySelectorAll('.accordion__trigger');

  accordionTriggers.forEach((trigger) => {
    const panel = trigger.nextElementSibling;

    trigger.addEventListener('click', () => {
      const isCurrentlyOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Tutup semua item FAQ lain
      accordionTriggers.forEach((otherTrigger) => {
        otherTrigger.setAttribute('aria-expanded', 'false');
        otherTrigger.nextElementSibling.style.maxHeight = null;
      });

      // Buka item yang baru diklik, kecuali jika sebelumnya sudah terbuka
      // (klik dua kali pada item yang sama akan menutupnya / toggle)
      if (!isCurrentlyOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------------------------------------------------------------
     8. CONTACT FORM
     Tidak ada backend pada demo ini, jadi pengiriman disimulasikan
     dengan validasi dasar dan pesan status untuk pengguna.
  --------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nama = contactForm.nama.value.trim();
    const kontak = contactForm.kontak.value.trim();
    const pesan = contactForm.pesan.value.trim();

    if (!nama || !kontak || !pesan) {
      formStatus.textContent = 'Mohon lengkapi semua kolom sebelum mengirim pesan.';
      formStatus.classList.add('is-error');
      return;
    }

    // Simulasi pengiriman berhasil (di proyek nyata, sambungkan ke backend/API di sini)
    formStatus.classList.remove('is-error');
    formStatus.textContent = `Terima kasih, ${nama}! Pesanmu sudah kami terima, tim kami akan segera menghubungi melalui ${kontak}.`;
    contactForm.reset();
  });

  /* ---------------------------------------------------------------
     9. UTIL KECIL — tahun berjalan otomatis di footer
  --------------------------------------------------------------- */
  document.getElementById('currentYear').textContent = new Date().getFullYear();

});

  /* ---------------------------------------------------------------
     10.
  --------------------------------------------------------------- */


