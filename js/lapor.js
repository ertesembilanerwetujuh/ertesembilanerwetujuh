import { supabase } from "./supabase.js";

/* ===================================================
   SESSION
=================================================== */

const session =
    JSON.parse(
        localStorage.getItem("petugas_session")
    ) || {};




/* ===================================================
   DOM
=================================================== */

const el = {

    grup: document.getElementById("grupAktif"),
    petugas: document.getElementById("petugasAktif"),
    status: document.getElementById("statusAudit"),

    // Ringkasan
    total: document.getElementById("totalUang"),
    totalNominal: document.getElementById("totalNominal"),
    totalPemasukanLain: document.getElementById("totalPemasukanLain"),

    // Riwayat Jimpitan
    rumah: document.getElementById("totalRumah"),
    sudah: document.getElementById("sudahInput"),
    kosong: document.getElementById("kosongInput"),
    belum: document.getElementById("belumInput"),



    listRincianInput: document.getElementById("listRincianInput"),

    // Profil Warga
    totalHarian: document.getElementById("totalHarian"),
    totalMingguan: document.getElementById("totalMingguan"),
    totalBulanan: document.getElementById("totalBulanan"),
    totalTahunan: document.getElementById("totalTahunan"),
    totalNonAktif: document.getElementById("totalNonAktif"),
    totalWarga: document.getElementById("totalWarga"),

    pembawa: document.getElementById("pembawaUang"),

    listAbsensi: document.getElementById("listAbsensi"),
    btnAbsensi: document.getElementById("btnAbsensi"),

    catatan: document.getElementById("catatan"),
    btnKirim: document.getElementById("btnKirim"),

    cekGalon: document.getElementById("cekGalon"),
    cekKopi: document.getElementById("cekKopi"),
    cekGula: document.getElementById("cekGula"),
    cekTeh: document.getElementById("cekTeh"),

    btnSalin: document.getElementById("btnSalin")
    

};


/* ===================================================
   STATE
=================================================== */

const state = {

    warga: [],
    local: {},
    sessionServer: null,

    // Harian
    totalNominal: 0,
    totalRumah: 0,

    sudahInput: 0,
    belumInput: 0,

    inputNominal: 0,
    inputKosong: 0,

    persenNominal: 0,
    persenKosong: 0,
    persenBelum: 0,

    rincianServer: [],

    // Non Harian
    totalPemasukanLain: 0,

    // Profil Warga
    totalMingguan: 0,
    totalBulanan: 0,
    totalTahunan: 0,
    totalNonAktif: 0,
    totalWarga: 0

};


/* ===================================================
   TIME
=================================================== */

function getWIB() {

    const now = new Date();

    const wib = now.toLocaleString(
        "sv-SE",
        {
            timeZone: "Asia/Jakarta"
        }
    );

    const [date, time] = wib.split(" ");

    return { date, time };

}

function getTanggal() {

    const { date, time } = getWIB();

    let [y, m, d] = date.split("-");

    const jam =
        Number(
            time.split(":")[0]
        );

    if (jam < 9) {

        const prev =
            new Date(date);

        prev.setDate(
            prev.getDate() - 1
        );

        y = prev.getFullYear();

        m = String(
            prev.getMonth() + 1
        ).padStart(2, "0");

        d = String(
            prev.getDate()
        ).padStart(2, "0");

    }

    return `${y}-${m}-${d}`;

}


/* ===================================================
   FORMAT
=================================================== */

function rupiah(n = 0) {

    return Number(n).toLocaleString("id-ID");

}

const STORAGE_KEY =
    `jimpitan_${getTanggal()}`;

const REPORT_KEY =
    `laporan_${getTanggal()}`;

const ABSENSI_KEY =
    `absensi_${getTanggal()}`;


/* ===================================================
   SIMPAN ABSENSI
=================================================== */

function saveAbsensi() {

    const data = {};

    document
        .querySelectorAll(".absensi-status")
        .forEach(select => {

            data[select.dataset.id] =
                select.value;

        });

    localStorage.setItem(
        ABSENSI_KEY,
        JSON.stringify(data)
    );

}




/* ===================================================
   LOAD RINCIAN JIMPITAN SERVER
=================================================== */

async function loadRincianServer(){

    const { data, error } =
        await supabase
            .from("jimpitan_harian")
            .select("*")
            .eq(
                "tanggal",
                getTanggal()
            );


    if(error){

        console.error(
            "LOAD RINCIAN SERVER",
            error
        );

        return;

    }


    state.rincianServer =
        data || [];


    console.log(
        "DATA RINCIAN SERVER",
        state.rincianServer
    );

}











function renderRincianInput(){


    if(!el.listRincianInput) return;


    el.listRincianInput.innerHTML = "";


    const wargaAktif =
    state.warga.filter(
        w =>
            w.status === "Harian" ||
            w.status === "Mingguan" ||
            w.status === "Bulanan"
    );





wargaAktif.sort((a,b)=>{

    const jumlahA =
        state.local[a.warga_id]?.jumlah || 0;

    const jumlahB =
        state.local[b.warga_id]?.jumlah || 0;


    // nominal terbesar ke kecil
    if(jumlahB !== jumlahA){
        return jumlahB - jumlahA;
    }


    // kalau nominal sama, nama A-Z
    const namaA =
        (a.nama_warga || a.nama).toLowerCase();

    const namaB =
        (b.nama_warga || b.nama).toLowerCase();


    return namaA.localeCompare(namaB);

});









    wargaAktif.forEach(w => {


        const data =
            state.local[w.warga_id];


        const jumlah =
            data?.jumlah || 0;



        const div =
            document.createElement("div");


        div.className =
            "rincian-item";


        div.innerHTML = `

        <div>

            <div class="rincian-nama">
                ${w.nama_warga || w.nama}
            </div>


        </div>


        <div class="
            rincian-nominal
            ${jumlah === 0 ? "rincian-kosong" : ""}
        ">

            ${rupiah(jumlah)}

        </div>

        `;


        el.listRincianInput.appendChild(div);


    });

}

/* ===================================================
   LOAD LAPORAN
=================================================== */

function loadLaporan() {

    const data =
        JSON.parse(
            localStorage.getItem(REPORT_KEY)
        ) || {};

    console.log("LOAD", data);

    el.pembawa.value = data.pembawa || "";
    el.catatan.value = data.catatan || "";

    el.cekGalon.value = data.galon || "";
    el.cekKopi.value = data.kopi || "";
    el.cekGula.value = data.gula || "";
    el.cekTeh.value = data.teh || "";

}




/* ===================================================
   SAVE LAPORAN
=================================================== */

function saveLaporan() {

    console.log("SAVE", {
        galon: el.cekGalon.value,
        kopi: el.cekKopi.value,
        gula: el.cekGula.value,
        teh: el.cekTeh.value
    });

    const data = {

        pembawa: el.pembawa.value,

        catatan: el.catatan.value,

        galon: el.cekGalon.value,
        kopi: el.cekKopi.value,
        gula: el.cekGula.value,
        teh: el.cekTeh.value

    };

    localStorage.setItem(
        REPORT_KEY,
        JSON.stringify(data)
    );

}



/* ===================================================
   AUTO SAVE
=================================================== */

[
    el.pembawa,
    el.catatan,

    el.cekGalon,
    el.cekKopi,
    el.cekGula,
    el.cekTeh,


].forEach(item => {

    item?.addEventListener(
        "change",
        saveLaporan
    );

});

el.catatan?.addEventListener(
    "input",
    saveLaporan
);



/* ===================================================
   LOAD LOCAL
=================================================== */

function loadLocal() {

    state.local =
        JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        ) || {};

    console.log("LOAD LOCAL", state.local);

}


/* ===================================================
   LOAD DATABASE WARGA
=================================================== */

async function loadWarga() {

    const { data, error } =
        await supabase
            .from("database_warga")
            .select("*")
            .order("warga_id", {
                ascending:true
            });

    if(error){
        console.error(error);
        return;
    }

    state.warga = data || [];

    console.log("DATA WARGA :", state.warga);

}


/* ===================================================
   LOAD SESSION SERVER
=================================================== */

async function loadSession() {

    const petugasId = Number(session.petugas_id);

    if (!petugasId) {
        state.sessionServer = null;
        return;
    }

    const { data: petugas, error } =
        await supabase
            .from("petugas_jimpitan")
            .select("petugas_id,no_grup,nama_petugas")
            .eq("petugas_id", petugasId)
            .maybeSingle();

    if (error) {
        console.error(error);
        state.sessionServer = null;
        return;
    }

    if (!petugas) {
        state.sessionServer = null;
        return;
    }

    state.sessionServer = {
        grup: petugas.no_grup,
        petugas: petugas.nama_petugas,
        status: "Sedang Aktif"
    };

        session.petugas_id = petugas.petugas_id;
        session.nama_petugas = petugas.nama_petugas;
        session.no_grup = petugas.no_grup;

        // Jangan hilangkan session_id yang sudah ada
        localStorage.setItem(
            "petugas_session",
            JSON.stringify(session)
        );
}


/* ===================================================
   LOAD DROPDOWN PEMBAWA
=================================================== */

async function loadPembawa() {

    const { data, error } =
        await supabase
            .from("petugas_jimpitan")
            .select("nama_petugas")
            .eq("no_grup", session.no_grup)
            .order("petugas_id");

    if (error) {
        console.error(error);
        return;
    }

    el.pembawa.innerHTML =
        `<option value="">Pilih Petugas</option>`;

    (data || []).forEach(row => {

        el.pembawa.innerHTML += `
            <option value="${row.nama_petugas}">
                ${row.nama_petugas}
            </option>
        `;

    });

}



function updateWarna(select) {

    select.classList.remove(
        "hadir",
        "tidak"
    );

    if (select.value === "Hadir") {
        select.classList.add("hadir");
    } else {
        select.classList.add("tidak");
    }

}




/* ===================================================
   LOAD PETUGAS ABSENSI
=================================================== */

async function loadAbsensi() {

    const { data, error } =
        await supabase
            .from("petugas_jimpitan")
            .select("petugas_id,nama_petugas")
            .eq("no_grup", session.no_grup)
            .order("petugas_id");

    if (error) {
        console.error(error);
        return;
    }

    el.listAbsensi.innerHTML = "";



const saved =
    JSON.parse(
        localStorage.getItem(ABSENSI_KEY)
    ) || {};



data.forEach(row => {


    const status =
        saved[row.petugas_id] || "Hadir";


    el.listAbsensi.innerHTML += `
        <div class="absensi-row">

            <span>${row.nama_petugas}</span>

            <select
                class="absensi-status"
                data-id="${row.petugas_id}">

                <option
                    value="Hadir"
                    ${status === "Hadir" ? "selected" : ""}>
                    Hadir
                </option>


                <option
                    value="Tidak"
                    ${status === "Tidak" ? "selected" : ""}>
                    Tidak
                </option>

            </select>

        </div>
    `;


});

    // PASANG WARNA SETELAH HTML SUDAH ADA
    document
        .querySelectorAll(".absensi-status")
        .forEach(select => {

            updateWarna(select);

            select.addEventListener(
                "change",
                () => {

                    updateWarna(select);

                    saveAbsensi();

                }
            );

        });

}




/* ===================================================
   KIRIM DATA ABSENSI
=================================================== */

async function kirimAbsensi() {


    const payload = [];

    document
        .querySelectorAll(".absensi-status")
        .forEach(select => {

            payload.push({

                petugas_id: Number(select.dataset.id),

                no_grup: session.no_grup,

                tanggal: getTanggal(),

                status: select.value

            });

        });




        


el.btnAbsensi.disabled = true;
el.btnAbsensi.textContent = "Mengirim...";

showLoading("Mengirim data absensi ke server...");



    try {

        const { error } =
            await supabase
                .from("petugas_harian")
                .upsert(
                    payload,
                    {
                        onConflict:
                            "petugas_id,tanggal"
                    }
                );

        if (error) throw error;


        showToast(
            "✅ Data terkirim..."
        );

    } catch (err) {

    console.error(err);

    showToast(
        err.message,
        "error"
    );

    } finally {

        hideLoading();

        el.btnAbsensi.disabled = false;
        el.btnAbsensi.textContent =
            "Kirim Data Absensi";

    }

}



/* ===================================================
   HITUNG RINGKASAN
=================================================== */

function hitungRingkasan() {

    /* ================= HARIAN ================= */

    const wargaHarian =
        state.warga.filter(
            w => w.status === "Harian"
        );

    state.totalRumah = wargaHarian.length;

    state.totalNominal = 0;

    state.sudahInput = 0;
    state.belumInput = 0;

    state.inputNominal = 0;
    state.inputKosong = 0;

    state.totalPemasukanLain = 0;

    state.totalMingguan = 0;
    state.totalBulanan = 0;
    state.totalTahunan = 0;

    for (const warga of wargaHarian) {

        const item = state.local[warga.warga_id];

        if (!item) {
            state.belumInput++;
            continue;
        }

        state.sudahInput++;

        const jumlah = Number(item.jumlah || 0);

        state.totalNominal += jumlah;

        if (jumlah > 0) {
            state.inputNominal++;
        } else {
            state.inputKosong++;
        }
    }

    const total = state.totalRumah || 1;

    state.persenNominal =
        Math.round(state.inputNominal / total * 100);

    state.persenKosong =
        Math.round(state.inputKosong / total * 100);

    state.persenBelum =
        Math.round(state.belumInput / total * 100);


    /* ================= MINGGUAN ================= */

    const wargaMingguan =
        state.warga.filter(
            w => w.status === "Mingguan"
        );

    state.totalMingguan = wargaMingguan.length;

    for (const warga of wargaMingguan) {

        const item = state.local[warga.warga_id];

        if (!item) continue;

        state.totalPemasukanLain += Number(item.jumlah || 0);

    }


    /* ================= BULANAN ================= */

    const wargaBulanan =
        state.warga.filter(
            w => w.status === "Bulanan"
        );

    state.totalBulanan = wargaBulanan.length;

    for (const warga of wargaBulanan) {

        const item = state.local[warga.warga_id];

        if (!item) continue;

        state.totalPemasukanLain += Number(item.jumlah || 0);

    }


    /* ================= TAHUNAN ================= */

    const wargaTahunan =
        state.warga.filter(
            w => w.status === "Tahunan"
        );

    state.totalTahunan = wargaTahunan.length;

    for (const warga of wargaTahunan) {

        const item = state.local[warga.warga_id];

        if (!item) continue;

        state.totalPemasukanLain += Number(item.jumlah || 0);

    }

    /* ================= NON AKTIF ================= */

    const wargaNonAktif =
        state.warga.filter(
            w => w.status === "Non Aktif"
        );

    state.totalNonAktif =
        wargaNonAktif.length;


    state.totalWarga =
        state.totalRumah +
        state.totalMingguan +
        state.totalBulanan +
        state.totalTahunan +
        state.totalNonAktif;




}



/* ===================================================
   RENDER
=================================================== */

function render() {

    el.grup.textContent =
        session.no_grup || "-";

    el.petugas.textContent =
        session.nama_petugas || "-";

    el.status.textContent =
        state.sessionServer?.status || "Sedang Aktif";

    const totalSemua =
        state.totalNominal +
        state.totalPemasukanLain;

    el.total.textContent =
        totalSemua.toLocaleString("id-ID");

    el.totalNominal.textContent =
        state.totalNominal.toLocaleString("id-ID");

    el.totalPemasukanLain.textContent =
        state.totalPemasukanLain.toLocaleString("id-ID");

    // Riwayat Jimpitan
    el.rumah.textContent = state.totalRumah;
    el.sudah.textContent = state.inputNominal;
    el.kosong.textContent = state.inputKosong;
    el.belum.textContent = state.belumInput;

    document.getElementById("persenNominal").textContent =
        `${state.persenNominal}%`;

    document.getElementById("persenKosong").textContent =
        `${state.persenKosong}%`;

    document.getElementById("persenBelum").textContent =
        `${state.persenBelum}%`;

    // Profil Warga
    el.totalHarian.textContent =
        state.totalRumah;

    el.totalMingguan.textContent =
        state.totalMingguan;

    el.totalBulanan.textContent =
        state.totalBulanan;

    el.totalTahunan.textContent =
        state.totalTahunan;

    el.totalNonAktif.textContent =
        state.totalNonAktif;

    el.totalWarga.textContent =
        state.totalWarga;

}



/* ===================================================
   BACK HANDLER
=================================================== */

initBackHandler();



/* ===================================================
   INIT
=================================================== */

async function init() {

    try {

        console.log("1. loadLocal");
        loadLocal();

        console.log("2. loadWarga");
        await loadWarga();

        console.log("3. loadSession");
        await loadSession();

        console.log("4. loadPembawa");
        await loadPembawa();

        console.log("5. loadAbsensi");
        await loadAbsensi();

        console.log("6. hitungRingkasan");
        hitungRingkasan();

        console.log("7. render");
        render();

        console.log("8. renderRincianInput");
        renderRincianInput();

        console.log("9. loadLaporan");
        loadLaporan();


    } catch (err) {

        console.error("INIT ERROR :", err);

    }

}


/* ===================================================
   TOAST LOADING
=================================================== */
const loading =
    document.getElementById("loading");

const toast =
    document.getElementById("toast");

const toastBig =
    document.getElementById("toastBig");

function showLoading(text = "Memproses..."){

    loading.querySelector("p").textContent = text;

    loading.classList.remove("hidden");

}

function hideLoading(){

    loading.classList.add("hidden");

}

function showToast(text,type="success"){

    toast.textContent = text;

    toast.className =
        `toast ${type} show`;

    setTimeout(()=>{

        toast.classList.remove("show");

    },20000);

}



function showToastBig(text, type = "success") {

    toastBig.innerHTML = text;

    toastBig.className =
        `toast-big ${type} show`;

    setTimeout(() => {

        toastBig.classList.remove("show");

    }, 3000);

}


/* ===================================================
   KIRIM KE SERVER
=================================================== */

async function kirimKeServer() {


    const list = Object.values(state.local);

    if (list.length === 0) {
        showToast("Belum ada data.","error");
        return;
    }

    el.btnKirim.disabled = true;
    el.btnKirim.textContent = "Mengirim...";
    showLoading("Mengirim data ke server...");



try {

    // Ambil data yang sudah ada di server
    const { data: existing, error: existingError } =
        await supabase
            .from("jimpitan_harian")
            .select("warga_id, created_by")
            .eq("tanggal", getTanggal());

    if (existingError) throw existingError;

    const existingMap = new Map();

    (existing || []).forEach(row => {

        existingMap.set(
            row.warga_id,
            row
        );

    });


    const payload = list.map(item => {

    const old =
        existingMap.get(item.warga_id);

    return {

        warga_id: item.warga_id,

        tanggal: getTanggal(),

        jumlah: item.jumlah,

        edit_count:
            item.edit_count || 1,

        // Tetap simpan pembuat pertama
        created_by:
            old?.created_by ??
            session.petugas_id

    };

});


    const { error } =
        await supabase
            .from("jimpitan_harian")
            .upsert(
                payload,
                {
                    onConflict:
                        "warga_id,tanggal"
                }
            );

    if (error) throw error;


// ==================================================
// UPDATE STATUS BACKUP -> TERKIRIM
// ==================================================

const { error: backupError } = await supabase
    .from("backup_jimpitan_harian")
    .update({
        status: "data jimpitan terkirim"
    })
    .eq("tanggal", getTanggal())
    .eq("created_by", session.petugas_id);

if (backupError) {
    console.error("UPDATE BACKUP", backupError);
}




        showToast(
            "✅ Data terkirim..."
        );


        // refresh tampilan rincian
        renderRincianInput();


        await loadSession();

        render();



    } catch (err) {

    console.error(err);

    showToast(
        err.message,
        "error"
    );

    } finally {

        hideLoading();

        el.btnKirim.disabled = false;
        el.btnKirim.textContent =
            "Kirim Data Jimpitan";

    }

}



/* ===================================================
   ACCORDION RINCIAN INPUT
=================================================== */

const rincianToggle =
    document.getElementById("rincianToggle");

const rincianContent =
    document.getElementById("rincianContent");

const rincianBox =
    document.querySelector(".rincian-input");


if(rincianToggle && rincianContent){

    rincianToggle.addEventListener("click",()=>{


        rincianBox.classList.toggle("open");


        if(rincianBox.classList.contains("open")){

            rincianContent.style.maxHeight =
                rincianContent.scrollHeight + "px";

        }else{

            rincianContent.style.maxHeight = null;

        }


    });

}


















const infoToggle = document.getElementById("infoToggle");
const infoContent = document.getElementById("infoContent");
const accordion = document.querySelector(".accordion");

if(infoToggle && infoContent){

    infoToggle.addEventListener("click",()=>{

        accordion.classList.toggle("open");

        if(accordion.classList.contains("open")){

            infoContent.style.maxHeight =
                infoContent.scrollHeight + "px";

        }else{

            infoContent.style.maxHeight = null;

        }

    });

}



/* ===================================================
   SALIN LAPORAN
=================================================== */

async function salinLaporan() {

let jumlahHadir = 0;
let jumlahTidak = 0;

const hadir =
    [...document.querySelectorAll(".absensi-row")]
    .map(row => {

        const nama =
            row.querySelector("span").textContent;

        const status =
            row.querySelector("select").value;

        if (status === "Hadir") {
            jumlahHadir++;
        } else {
            jumlahTidak++;
        }

        return `${status === "Hadir" ? "✅" : "❌"} ${status} : ${nama}`;

    })
    .join("\n");


const checklist = [
    `💧 ${el.cekGalon.value || "0"} Air Galon`,
    `☕ ${el.cekKopi.value || "0"} Kopi`,
    `🧂 ${el.cekGula.value || "0"} Gula`,
    `🍵 ${el.cekTeh.value || "0"} Teh`
].join("\n");


const nomorGrup =
    String(session.no_grup)
        .match(/\d+/)?.[0] || "";

const grupIcon = {
    "1": "1️⃣",
    "2": "2️⃣",
    "3": "3️⃣",
    "4": "4️⃣",
    "5": "5️⃣",
    "6": "6️⃣",
    "7": "7️⃣",
    "8": "8️⃣",
    "9": "9️⃣",
    "10": "🔟"
}[nomorGrup] || "👥";

const totalSemua =
    state.totalNominal +
    state.totalPemasukanLain;







const rincianJimpitan =
    state.warga
    .filter(w =>
        w.status === "Harian" ||
        w.status === "Mingguan" ||
        w.status === "Bulanan"
    )
    .sort((a,b)=>{

        const jumlahA =
            state.local[a.warga_id]?.jumlah || 0;

        const jumlahB =
            state.local[b.warga_id]?.jumlah || 0;


        if(jumlahB !== jumlahA){
            return jumlahB - jumlahA;
        }


        const namaA =
            (a.nama_warga || a.nama).toLowerCase();

        const namaB =
            (b.nama_warga || b.nama).toLowerCase();


        return namaA.localeCompare(namaB);

    })
    .map(w=>{

        const jumlah =
            state.local[w.warga_id]?.jumlah || 0;


        return `${Math.floor(jumlah / 500)} ${w.nama_warga || w.nama}`;

    })
    .join("\n");











const text =


`LAPORAN JIMPITAN RT9 RW7

Tanggal : ${getTanggal()}

${grupIcon} Grup : ${session.no_grup}
👨‍💼 Petugas : ${session.nama_petugas}

━━━━━━━━━━━━━━

💹 Pemasukan Hari ini
💰 Harian  : ${rupiah(state.totalNominal)}
💰 Berkala : ${rupiah(state.totalPemasukanLain)}
_____________________+
💵 Total     : ${rupiah(totalSemua)}

━━━━━━━━━━━━━━

💰 Pembawa Uang

${el.pembawa.value || "-"}

━━━━━━━━━━━━━━

🏠 ${String(state.totalRumah).padStart(2, " ")} Warga Jimpitan Aktif
🟢 ${String(state.inputNominal).padStart(2, " ")} Mengisi Jimpitan
🔴 ${String(state.inputKosong).padStart(2, " ")} Tidak mengisi
🟡 ${String(state.belumInput).padStart(2, " ")} Belum Diinput

━━━━━━━━━━━━━━

📋 Rincian Jimpitan

${rincianJimpitan}

━━━━━━━━━━━━━━

👥 Absensi Petugas

${hadir}

👥 Total Kehadiran

✅ Hadir : ${jumlahHadir} Orang
❌ Tidak : ${jumlahTidak} Orang

━━━━━━━━━━━━━━

🔍 Persediaan

${checklist}

━━━━━━━━━━━━━━

📝 Catatan

${el.catatan.value || "-"}`;











    try{

        await navigator.clipboard.writeText(text);

showToastBig(
    "<div class='toast-header'>PERHATIAN</div>" +
    "<div class='toast-message'>" +
    "<img src='assets/icons/files.svg'>" +
    "<span>Laporan Tersalin</span>" +
    "</div>" +
    "<small>Silakan paste di grup Whatsapp.</small>"
);


    }catch(err){

        console.error(err);

        showToast("Clipboard tidak didukung.", "error");

    }

}



/* ===================================================
   EVENT
=================================================== */

el.btnKirim?.addEventListener(
    "click",
    kirimKeServer
);

el.btnAbsensi?.addEventListener(
    "click",
    kirimAbsensi
);


el.btnSalin?.addEventListener(
    "click",
    salinLaporan
);



/* ===================================================
   START
=================================================== */

window.addEventListener(
    "DOMContentLoaded",
    init
);