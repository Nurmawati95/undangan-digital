
        const music = document.getElementById('bg-music');
        const musicBtn = document.getElementById('music-btn');
        const bottomNav = document.getElementById('bottom-nav');
        let isPlaying = false;

        // 1. Fungsi Buka Sampul Undangan
        function openInvitation() {
            const cover = document.getElementById('cover-overlay');
            cover.style.transform = 'translateY(-100%)';
            
            // Tampilkan navigasi bawah & tombol musik
            musicBtn.classList.remove('hidden');
            bottomNav.classList.remove('hidden');
            bottomNav.classList.add('flex');

            // Putar musik otomatis
            music.play().then(() => {
                isPlaying = true;
            }).catch(err => console.log("Autoplay dicegah browser:", err));
        }

        // 2. Fungsi Play/Pause Musik
        function toggleMusic() {
            if (isPlaying) {
                music.pause();
                musicBtn.classList.remove('animate-spin-slow');
            } else {
                music.play();
                musicBtn.classList.add('animate-spin-slow');
            }
            isPlaying = !isPlaying;
        }

        // 3. Fungsi Salin Nomor Rekening
        function copyText(text) {
            navigator.clipboard.writeText(text);
            alert("Nomor rekening " + text + " berhasil disalin!");
        }

        // 4. UCAPAN & RSVP via Supabase (tersimpan permanen)
        const SUPABASE_URL = 'https://nrotipuxmfbiqvzolzox.supabase.co';
        const SUPABASE_ANON_KEY = 'sb_publishable_aWyIwLYXvHDgHbTYKDnVjA_54uijLKx';
        const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

        function escapeHtml(str) {
            return String(str).replace(/[&<>"']/g, (c) => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
            }[c]));
        }

        function renderComment(nama, hadir, pesan) {
            const badgeColor = hadir === 'Hadir' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700';
            return `
                <div class="bg-[#FAF9F6] p-3.5 rounded-xl border border-slate-100">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-xs text-[#2391FF]">${escapeHtml(nama)}</span>
                        <span class="text-[10px] ${badgeColor} px-2 py-0.5 rounded-full font-semibold">${escapeHtml(hadir)}</span>
                    </div>
                    <p class="text-xs text-slate-600">${escapeHtml(pesan)}</p>
                </div>
            `;
        }

        async function loadUcapan() {
            const list = document.getElementById('comment-list');
            if (!supabaseClient) return;
            list.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">Memuat ucapan...</p>';
            const { data, error } = await supabaseClient
                .from('ucapan')
                .select('nama,hadir,pesan')
                .order('created_at', { ascending: false })
                .limit(50);
            if (error) {
                console.error('Gagal memuat ucapan:', error);
                list.innerHTML = '<p class="text-xs text-rose-500 text-center py-4">Gagal memuat ucapan. Coba refresh halaman.</p>';
                return;
            }
            if (!data || data.length === 0) {
                list.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">Belum ada ucapan. Jadilah yang pertama mengirim doa terbaik!</p>';
                return;
            }
            list.innerHTML = data.map((u) => renderComment(u.nama, u.hadir, u.pesan)).join('');
        }

        async function submitComment(e) {
            e.preventDefault();
            const nama = document.getElementById('input-nama').value.trim();
            const hadir = document.getElementById('input-hadir').value;
            const pesan = document.getElementById('input-pesan').value.trim();
            const list = document.getElementById('comment-list');
            if (!nama || !pesan) return;

            if (!supabaseClient) {
                alert('Koneksi database belum siap. Coba refresh halaman.');
                return;
            }

            const btn = e.target.querySelector('button[type="submit"]');
            const btnHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Mengirim...';

            const { error } = await supabaseClient.from('ucapan').insert({ nama, hadir, pesan });
            btn.disabled = false;
            btn.innerHTML = btnHtml;

            if (error) {
                console.error('Gagal mengirim ucapan:', error);
                alert('Gagal mengirim ucapan. Coba lagi ya.');
                return;
            }
            list.insertAdjacentHTML('afterbegin', renderComment(nama, hadir, pesan));
            e.target.reset();
        }

        // Muat ucapan tersimpan saat halaman dibuka
        loadUcapan();

        // 5. Fungsi Baca Nama Tamu dari Link URL (?to=Nama+Tamu)
        const urlParams = new URLSearchParams(window.location.search);
        const guest = urlParams.get('to');
        if (guest) {
            document.getElementById('guest-name').innerText = guest;
        }

        // 6. Fungsi Hitung Mundur Waktu (Countdown ke 30 Oktober 2026)
        const targetDate = new Date("Oct 30, 2026 08:00:00").getTime();
        setInterval(() => {
            const now = new Date().getTime();
            const diff = targetDate - now;

            if (diff > 0) {
                document.getElementById('days').innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
                document.getElementById('hours').innerText = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
                document.getElementById('minutes').innerText = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
                document.getElementById('seconds').innerText = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
            }
        }, 1000);
    