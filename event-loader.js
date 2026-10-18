// Loader data acara dinamis untuk template undangan.
// Dibaca dari ?event=slug (mis. /u/putra-putri -> render.html -> code.html?event=putra-putri)
// Jika tidak ada slug / gagal fetch: tampilkan konten default bawaan template.
(function () {
var SUPABASE_URL = 'https://nrotipuxmfbiqvzolzox.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_aWyIwLYXvHDgHbTYKDnVjA_54uijLKx';
// ===== SHUFFLE FOTO GALERI =====
// Foto di grid galeri saling bertukar tempat secara berkala,
// berapapun jumlah fotonya (minimal 2). Jalan untuk acara dinamis & demo statis.
function pasangShuffleGaleri() {
var g = document.querySelectorAll('#galeri .grid img');
if (g.length < 2) return;
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
var imgs = Array.prototype.slice.call(g);
setInterval(function () {
var a = Math.floor(Math.random() * imgs.length);
var b = Math.floor(Math.random() * imgs.length);
while (b === a) b = Math.floor(Math.random() * imgs.length);
// Fade out kedua foto, tukar src saat tak terlihat, lalu fade in
imgs[a].style.opacity = '0';
imgs[b].style.opacity = '0';
setTimeout(function () {
var tmp = imgs[a].src;
imgs[a].src = imgs[b].src;
imgs[b].src = tmp;
imgs[a].style.opacity = '1';
imgs[b].style.opacity = '1';
}, 400);
}, 4500);
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', pasangShuffleGaleri);
} else {
pasangShuffleGaleri();
}
var slug = new URLSearchParams(window.location.search).get('event');
if (!slug) return;
var sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
if (!sb) return;
function txt(sel, v) {
if (v === undefined || v === null || v === '') return;
document.querySelectorAll(sel).forEach(function (el) { el.textContent = v; });
}
function img(sel, v) {
if (!v) return;
v = toDirectImg(v);
document.querySelectorAll(sel).forEach(function (el) { el.src = v; });
}
// Konversi link share Google Drive -> URL gambar langsung (lh3).
// Link share Drive (…/file/d/ID/view) adalah halaman HTML, bukan gambar.
// Suffix =s1600 memaksa URL baru sehingga browser mengambil gambar segar
// (menghindari cache lama "halaman izin" Google dari saat file masih private).
function toDirectImg(u) {
if (!u) return u;
u = String(u).trim();
if (/drive\.google\.com/.test(u)) {
var m = u.match(/\/file\/d\/([A-Za-z0-9_-]+)/) || u.match(/[?&]id=([A-Za-z0-9_-]+)/);
if (m) return 'https://lh3.googleusercontent.com/d/' + m[1] + '=s1600';
return u;
}
var m2 = u.match(/^https:\/\/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)(?:=s\d+)?$/);
if (m2) return 'https://lh3.googleusercontent.com/d/' + m2[1] + '=s1600';
return u;
}
// Konversi link Google Maps apa pun -> URL embed iframe (tanpa API key).
// Contoh: .../maps/place/Nama/@-3.1,122.1,17z -> .../maps?q=-3.1,122.1&output=embed
function toMapEmbed(u) {
if (!u) return '';
u = String(u).trim();
// Jika yang ditempel kode <iframe src="..."> utuh (dari Google Maps > Embed a map),
// ambil URL src-nya saja. &amp; -> & agar query string valid.
var mifr = u.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
if (mifr) u = mifr[1];
u = u.replace(/&amp;/g, '&');
if (/google\.com\/maps\/embed/.test(u)) return u;
var mq = u.match(/[?&](?:q|query)=([^&]+)/);
if (mq) return 'https://www.google.com/maps?q=' + mq[1] + '&output=embed';
var mlat = u.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
if (mlat) return 'https://www.google.com/maps?q=' + mlat[1] + ',' + mlat[2] + '&output=embed';
var mplace = u.match(/maps\/place\/([^/@]+)/);
if (mplace) return 'https://www.google.com/maps?q=' + mplace[1].replace(/\+/g, '%20') + '&output=embed';
return 'https://www.google.com/maps?q=' + encodeURIComponent(u) + '&output=embed';
}
function bg(sel, v) {
if (!v) return;
v = toDirectImg(v);
document.querySelectorAll(sel).forEach(function (el) {
var old = el.getAttribute('style') || '';
var grad = old.match(/linear-gradient\([^)]+\)/) || 'linear-gradient(to bottom, rgba(11,26,48,0.55), rgba(11,26,48,0.92))';
el.setAttribute('style', el.getAttribute('style').replace(/url\('[^']*'\)/, "url('" + v + "')"));
if (!/linear-gradient/.test(el.getAttribute('style'))) {
el.setAttribute('style', 'background-image: ' + grad + ", url('" + v + "'); " + old);
}
});
}
function fmtTgl(iso) {
if (!iso) return '';
try {
var d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
var hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][d.getDay()];
var bln = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][d.getMonth()];
return hari + ', ' + d.getDate() + ' ' + bln + ' ' + d.getFullYear();
} catch (e) { return iso; }
}
function fmtPendek(iso) {
if (!iso) return '';
try {
var d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
return String(d.getDate()).padStart(2,'0') + ' . ' + String(d.getMonth()+1).padStart(2,'0') + ' . ' + d.getFullYear();
} catch (e) { return iso; }
}
sb.from('events').select('*').eq('slug', slug).single().then(function (res) {
var d = res.data;
if (res.error || !d) return;
window.__EVENT_ID__ = d.id;
var P = d.mempelai_pria || {}, W = d.mempelai_wanita || {};
var A1 = d.acara1 || {}, A2 = d.acara2 || {};
var K = d.kata || {}, WA = d.wa || {}, L = d.lainnya || {};
var panggilan = [P.panggilan, W.panggilan].filter(Boolean).join(' & ') || null;
if (panggilan) {
txt('#cover-overlay h1', panggilan);
txt('#home h1', panggilan);
document.title = 'The Wedding of ' + panggilan + ' - UNDIGITAL';
}
var tglPanjang = fmtTgl(d.tanggal_utama || A1.tanggal);
var tglPendek = fmtPendek(d.tanggal_utama || A1.tanggal);
if (tglPanjang) txt('#cover-overlay .text-\\[\\#FFCD54\\]', tglPanjang);
if (tglPendek) txt('#home .tracking-wider', tglPendek);
if (d.tanggal_utama || A1.tanggal) window.__WEDDING_DATE__ = new Date((d.tanggal_utama || A1.tanggal) + 'T08:00:00').getTime();
var heroImg = d.foto_hero || d.foto_cover;
if (d.foto_cover) bg('#cover-overlay > div', d.foto_cover);
if (heroImg) img('#home img', heroImg);
if (P.nama) txt('#mempelai h3', P.nama);
if (P.nama) {
var hs = document.querySelectorAll('#mempelai h3');
if (hs[0]) hs[0].textContent = P.nama;
if (W.nama && hs[1]) hs[1].textContent = W.nama;
}
if (P.ortu) {
var ps = document.querySelectorAll('#mempelai .text-slate-500');
if (ps[0]) ps[0].textContent = P.ortu;
if (W.ortu && ps[1]) ps[1].textContent = W.ortu;
}
if (P.foto || W.foto) {
var im = document.querySelectorAll('#mempelai img');
if (im[0]) {
im[0].dataset.defaultSrc = im[0].src;
im[0].onerror = function () { if (this.dataset.defaultSrc) this.src = this.dataset.defaultSrc; };
if (P.foto) im[0].src = toDirectImg(P.foto);
}
if (im[1]) {
im[1].dataset.defaultSrc = im[1].src;
im[1].onerror = function () { if (this.dataset.defaultSrc) this.src = this.dataset.defaultSrc; };
if (W.foto) im[1].src = toDirectImg(W.foto);
}
}
if (P.ig) {
var igs = document.querySelectorAll('#mempelai a[href*="instagram"]');
if (igs[0]) { igs[0].href = 'https://instagram.com/' + P.ig; igs[0].innerHTML = '<i class="fa-brands fa-instagram"></i> @' + P.ig; }
if (W.ig && igs[1]) { igs[1].href = 'https://instagram.com/' + W.ig; igs[1].innerHTML = '<i class="fa-brands fa-instagram"></i> @' + W.ig; }
}
if (K.quote) {
var q = document.querySelector('#mempelai p.italic');
if (q) q.innerHTML = '"' + K.quote + '"<br/><b class="text-[#2391FF]">' + (K.sumber || '') + '</b>';
}
var cards = document.querySelectorAll('#acara .bg-white.p-6');
if (cards[0] && (A1.nama || A1.tanggal || A1.jam || A1.tempat || A1.alamat)) {
var c = cards[0];
if (A1.nama) { var h = c.querySelector('h3'); if (h) h.textContent = A1.nama; }
var t1 = fmtTgl(A1.tanggal); if (t1) { var p1 = c.querySelector('.font-semibold'); if (p1) p1.textContent = t1; }
if (A1.jam) { var pj = c.querySelectorAll('.text-slate-500'); if (pj[0]) pj[0].textContent = 'Pukul ' + A1.jam; }
var inf = c.querySelectorAll('p.text-xs');
if (A1.tempat && inf[1]) inf[1].textContent = A1.tempat;
if (A1.alamat && inf[2]) inf[2].textContent = A1.alamat;
if (A1.maps && !/maps\/embed|<iframe/i.test(A1.maps)) { var m1 = c.querySelector('a[href*="maps"]'); if (m1) m1.href = A1.maps; }
}
if (cards[1] && (A2.nama || A2.tanggal || A2.jam || A2.tempat || A2.alamat)) {
var c2 = cards[1];
if (A2.nama) { var h2 = c2.querySelector('h3'); if (h2) h2.textContent = A2.nama; }
var t2 = fmtTgl(A2.tanggal); if (t2) { var p2 = c2.querySelector('.font-semibold'); if (p2) p2.textContent = t2; }
if (A2.jam) { var pj2 = c2.querySelectorAll('.text-slate-500'); if (pj2[0]) pj2[0].textContent = 'Pukul ' + A2.jam; }
var inf2 = c2.querySelectorAll('p.text-xs');
if (A2.tempat && inf2[1]) inf2[1].textContent = A2.tempat;
if (A2.alamat && inf2[2]) inf2[2].textContent = A2.alamat;
var btn2 = c2.querySelector('a[href*="maps"]');
if (A2.maps) {
if (!/maps\/embed|<iframe/i.test(A2.maps)) { if (btn2) btn2.href = A2.maps; }
else if (btn2) { btn2.style.display = 'none'; }
} else if (btn2) { btn2.style.display = 'none'; }
}
// Peta embed per acara: acara 1 dari link biasa, acara 2 dari kode embed.
// Jika kosong -> sembunyikan iframe (tamu tidak melihat peta default bawaan template).
var ffm1 = cards[0] ? cards[0].querySelector('iframe.maps-embed') : null;
if (ffm1) { if (A1.maps) { ffm1.src = toMapEmbed(A1.maps); } else { ffm1.style.display = 'none'; } }
var ffm2 = cards[1] ? cards[1].querySelector('iframe.maps-embed') : null;
if (ffm2) { if (A2.maps) { ffm2.src = toMapEmbed(A2.maps); } else { ffm2.style.display = 'none'; } }
if (d.galeri && d.galeri.length) {
var g = document.querySelectorAll('#galeri .grid img');
d.galeri.slice(0, g.length).forEach(function (url, i) { g[i].src = toDirectImg(url); });
}
if (K.c1j || K.c1i || K.c2j || K.c2i) {
var st = document.querySelectorAll('#galeri .space-y-6 h4, #galeri .space-y-6 > div h4');
var sp = document.querySelectorAll('#galeri .space-y-6 p');
if (K.c1j && st[0]) st[0].textContent = K.c1j;
if (K.c1i && sp[0]) sp[0].textContent = K.c1i;
if (K.c2j && st[1]) st[1].textContent = K.c2j;
if (K.c2i && sp[1]) sp[1].textContent = K.c2i;
}

if (L.rek1) {
var parts = L.rek1.split('-').map(function (s) { return s.trim(); });
var bank = parts[0] || 'BANK', norek = parts[1] || L.rek1, an = parts[2] || '';
var card = document.querySelector('section .from-\\[\\#2391FF\\]');
if (card) {
if (bank) { var b = card.querySelector('.tracking-widest'); if (b) b.textContent = bank; }
if (norek) { var n = card.querySelector('.font-mono'); if (n) n.textContent = norek; }
if (an) { var a = card.querySelectorAll('.text-\\[\\#FFCD54\\]'); if (a[0]) a[0].textContent = an; }
var btn = card.querySelector('button');
if (btn) btn.setAttribute('onclick', "copyText('" + norek.replace(/'/g, '') + "')");
}
}
if (L.musik) {
var aud = document.getElementById('bg-music');
if (aud) { var src = aud.querySelector('source'); if (src) src.src = L.musik; aud.load(); }
}
if (WA.nomor) {
var old = document.getElementById('wa-confirm-btn');
if (old) old.remove();
var nav = document.getElementById('bottom-nav');
var a = document.createElement('a');
a.id = 'wa-confirm-btn';
a.href = 'https://wa.me/' + WA.nomor.replace(/\D/g, '') + '?text=' + encodeURIComponent(WA.pesan || 'Assalamualaikum, saya akan hadir.');
a.target = '_blank';
a.className = 'fixed bottom-32 right-4 z-40 w-11 h-11 bg-emerald-500 text-white rounded-full shadow-xl flex items-center justify-center';
a.innerHTML = '<i class="fa-brands fa-whatsapp text-xl"></i>';
a.title = WA.teks || 'Konfirmasi via WhatsApp';
document.body.appendChild(a);
}
if (K.tutup) {
var f = document.querySelector('footer .mb-1');
if (f) f.textContent = K.tutup;
}
var fl = document.querySelector('footer h3');
if (fl && panggilan) fl.textContent = panggilan;
if (L.tamu && !new URLSearchParams(window.location.search).get('to')) {
var g2 = document.getElementById('guest-name');
if (g2) g2.textContent = L.tamu;
}

// ===== PARAMETER TAMU ?kpd= (prioritas) atau ?to= (lama) =====
var _up = new URLSearchParams(window.location.search);
var _kpd = _up.get('kpd') || _up.get('to') || '';
if (_kpd) {
var _gn = document.getElementById('guest-name');
if (_gn) _gn.textContent = _kpd;
}

// ===== TOMBOL SHAAR DI DEKAT "Buka Undangan" =====
function pasangShareUI() {
var slug = _up.get('event') || '';
var kpd = _kpd;
var base = window.location.origin + '/u/' + slug;
var link = kpd ? base + '?kpd=' + encodeURIComponent(kpd) : base;
var teks = kpd ? 'Assalamualaikum, saya undangan dari ' + kpd : 'Assalamualaikum, saya akan hadir.';
var waUrl = 'https://wa.me/?text=' + encodeURIComponent(teks + ' ' + link);
var btnCopy = document.getElementById('btn-copy-link');
var btnWA = document.getElementById('btn-wa-share');
if (btnCopy) {
btnCopy.onclick = function () {
navigator.clipboard.writeText(link).then(function () {
var asm = btnCopy.innerHTML;
btnCopy.innerHTML = '<i class="fa-solid fa-check"></i> <span>Disalin!</span>';
setTimeout(function () { btnCopy.innerHTML = asm; }, 2000);
});
};
}
if (btnWA) btnWA.href = waUrl;
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', pasangShareUI);
} else {
pasangShareUI();
}

})();
})();



