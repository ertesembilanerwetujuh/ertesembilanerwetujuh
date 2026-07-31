import { supabase } from "./supabase.js";
import { showToast } from "./utils.js";

const grupSelect = document.getElementById("grupSelect");
const petugasSelect = document.getElementById("petugasSelect");
const btnLogin = document.getElementById("btnLogin");



/* ===================================================
   INIT
=================================================== */

document.addEventListener("DOMContentLoaded", init);

async function init() {

    try {

        const session = JSON.parse(
            localStorage.getItem("petugas_session")
        );

        if (session) {

            location.replace("jimpitan.html");
            return;

        }

        await loadGroup();

        petugasSelect.disabled = true;

    } catch (err) {

        console.error(err);

        showToast("Gagal memuat halaman.");

    }

}

/* ===================================================
   LOAD GROUP
=================================================== */

async function loadGroup() {

    grupSelect.innerHTML = `
        <option value="">
            Memuat data...
        </option>
    `;

    const { data, error } = await supabase
        .from("petugas_jimpitan")
        .select("no_grup")
        .order("petugas_id");

    if (error) {

        console.error(error);

        showToast("Gagal memuat grup.");

        return;

    }

    const groups = [...new Set(data.map(row => row.no_grup))];

    let html = `
        <option value="">
            Pilih Grup
        </option>
    `;

    groups.forEach(grup => {

        html += `
            <option value="${grup}">
                ${grup}
            </option>
        `;

    });

    grupSelect.innerHTML = html;

}

/* ===================================================
   LOAD PETUGAS
=================================================== */

grupSelect.addEventListener("change", loadPetugas);

async function loadPetugas() {

    const grup = grupSelect.value;

    if (!grup) {

        petugasSelect.disabled = true;

        petugasSelect.innerHTML = `
            <option value="">
                Pilih grup dahulu
            </option>
        `;

        return;

    }

    petugasSelect.disabled = true;

    petugasSelect.innerHTML = `
        <option value="">
            Memuat petugas...
        </option>
    `;

    const { data, error } = await supabase
        .from("petugas_jimpitan")
        .select("petugas_id,nama_petugas")
        .eq("no_grup", grup)
        .order("petugas_id");

    if (error) {

        console.error(error);

        showToast("Gagal memuat petugas.");

        return;

    }

    let html = `
        <option value="">
            Pilih Petugas
        </option>
    `;

    data.forEach(row => {

        html += `
            <option value="${row.petugas_id}">
                ${row.nama_petugas}
            </option>
        `;

    });

    petugasSelect.innerHTML = html;

    petugasSelect.disabled = false;

}

/* ===================================================
   LOGIN
=================================================== */

btnLogin.addEventListener("click", login);

async function login() {

    const grup = grupSelect.value;
    const petugas = petugasSelect.value;

    if (!grup) {

        showToast("Pilih grup.");

        return;

    }

    if (!petugas) {

        showToast("Pilih petugas.");

        return;

    }

    btnLogin.disabled = true;

    btnLogin.textContent = "Masuk...";

    try {



        /* ===========================
           Simpan session ke database
        =========================== */

const { data, error: insertError } = await supabase

    .from("session_jimpitan")

    .insert({

        petugas_id: Number(petugas)

    })

    .select()

    .single();

if (insertError) {

    throw insertError;

}

        /* ===========================
           Simpan localStorage
        =========================== */

        const namaPetugas =
            petugasSelect.options[
                petugasSelect.selectedIndex
            ].text;

const session = {

    session_id: data.id,

    petugas_id: Number(petugas),

    no_grup: grup,

    nama_petugas: namaPetugas

};

        localStorage.setItem(

            "petugas_session",

            JSON.stringify(session)

        );

        location.replace("jimpitan.html");

    } catch (err) {

        console.error(err);

        showToast("Login gagal.");

        btnLogin.disabled = false;

        btnLogin.textContent = "Masuk";

    }

}
