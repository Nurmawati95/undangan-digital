// Loader data acara dinamis untuk template undangan.
// Dibaca dari ?event=slug (mis. /u/putra-putri -> render.html -> code.html?event=putra-putri)
// Jika tidak ada slug / gagal fetch: tampilkan konten default bawaan template.
(function () {
var SUPABASE_URL = 'https://nrotipuxmfbiqvzolzox.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_aWyIwLYXvHDgHbTYKDnVjA_54uijLKx';
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
document.querySelectorAll(sel).forEach(function (el) { el.src = v; });
}
function bg(sel, v) {
if (!v) return;
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
if (P.foto) {
var im = document.querySelectorAll('#mempelai img');
if (im[0]) im[0].src = P.foto;
if (W.foto && im[1]) im[1].src = W.foto;
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
if (A1.maps) { var m1 = c.querySelector('a[href*="maps"]'); if (m1) m1.href = A1.maps; }
}
if (cards[1] && (A2.nama || A2.tanggal || A2.jam || A2.tempat || A2.alamat)) {
var c2 = cards[1];
if (A2.nama) { var h2 = c2.querySelector('h3'); if (h2) h2.textContent = A2.nama; }
var t2 = fmtTgl(A2.tanggal); if (t2) { var p2 = c2.querySelector('.font-semibold'); if (p2) p2.textContent = t2; }
if (A2.jam) { var pj2 = c2.querySelectorAll('.text-slate-500'); if (pj2[0]) pj2[0].textContent = 'Pukul ' + A2.jam; }
var inf2 = c2.querySelectorAll('p.text-xs');
if (A2.tempat && inf2[1]) inf2[1].textContent = A2.tempat;
if (A2.alamat && inf2[2]) inf2[2].textContent = A2.alamat;
if (A2.maps) { var m2 = c2.querySelector('a[href*="maps"]'); if (m2) m2.href = A2.maps; }
}
if (d.galeri && d.galeri.length) {
var g = document.querySelectorAll('#galeri .grid img');
d.galeri.slice(0, g.length).forEach(function (url, i) { g[i].src = url; });
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
});
})();

