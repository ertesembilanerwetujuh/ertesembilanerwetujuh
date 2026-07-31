import { supabase } from "./supabase.js";

/* ===================================================
   UTIL
=================================================== */

const TARIF = 500;

const formatRupiah = (n = 0) =>
    Number(n).toLocaleString("id-ID");

function getWIB() {

    const now = new Date();

    const wib = now.toLocaleString("sv-SE", {
        timeZone: "Asia/Jakarta"
    });

    const [date, time] = wib.split(" ");

    return {
        date,
        time,
        full: `${date} ${time}`
    };

}

function getTanggal() {

    const { date, time } = getWIB();

    const hour = Number(
        time.split(":")[0]
    );

    let d = new Date(date);

    if (hour < 9) {
        d.setDate(d.getDate() - 1);
    }

    return d.toLocaleDateString("sv-SE");

}

/* ===================================================
   LOGIN
=================================================== */

const session = JSON.parse(
    localStorage.getItem("petugas_session")
);

if (!session) {

    location.replace("login.html");
    throw new Error("Session tidak ditemukan.");

}

const isPetugas = true;

/* ===================================================
   STATE
=================================================== */

const state = {

    warga: [],

    input: {},

    total: {},

    jam: {},

    editCount: {},

    updatedAt: {},

    filter: "all",

    blok: "all",

    profil: "aktif",

    active: null,

    lastUpdatedId: null

};

/* ===================================================
   LOCAL STORAGE
=================================================== */

const STORAGE_KEY =
    `jimpitan_${getTanggal()}`;

/* ===================================================
   DOM
=================================================== */

const el = {

    list:
        document.getElementById("listWarga"),

    search:
        document.getElementById("searchInput"),

    clearSearch:
        document.getElementById("clearSearch"),

    sidebar:
        document.getElementById("sidebar"),

    overlay:
        document.getElementById("overlay"),

    btnMenu:
        document.getElementById("btnMenu"),

    btnProfil:
        document.getElementById("btnProfil"),

    profilSidebar:
        document.getElementById("profilSidebar"),

    badge:
        document.getElementById("filterBadge"),

    badgeText:
        document.getElementById("filterText"),

    badgeIcon:
        document.getElementById("filterIcon"),

    blokBadge:
        document.getElementById("blokBadge"),

    blokSidebar:
        document.getElementById("blokSidebar"),

    blokText:
        document.getElementById("blokText"),

    detailPage:
        document.getElementById("detailPage"),

    detailRumah:
        document.getElementById("detailRumah"),

    detailId:
        document.getElementById("detailId"),

    detailNamaBig:
        document.getElementById("detailNamaBig"),

    detailValue:
        document.getElementById("detailValue"),

    minus:
        document.getElementById("minus"),

    plus:
        document.getElementById("plus"),

    save:
        document.getElementById("saveBtn"),

    back:
        document.getElementById("btnBack")

};

/* ===================================================
   LOAD DATABASE WARGA
=================================================== */

async function loadWarga() {

    console.log("LOAD DATABASE WARGA");

    const { data, error } = await supabase

        .from("database_warga")

        .select("*")

        .order("warga_id");

    if (error) {

        console.error(error);

        return;

    }

    state.warga = data || [];

    console.log(
        "TOTAL WARGA :",
        state.warga.length
    );

}

/* ===================================================
   LOCAL STORAGE
=================================================== */

function loadLocalData() {

    const data = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || {};

    state.total = {};

    state.jam = {};

    state.editCount = {};

    state.updatedAt = {};

    Object.values(data).forEach(item => {

        state.total[item.warga_id] =
            item.jumlah;

        state.jam[item.warga_id] =
            item.jam;

        state.editCount[item.warga_id] =
            item.edit_count || 1;

        state.updatedAt[item.warga_id] =
            item.updated_at || 0;

    });

}

function saveLocalData() {

    const data = {};

    Object.keys(state.total).forEach(id => {

        data[id] = {

            warga_id: id,

            jumlah:
                state.total[id],

            jam:
                state.jam[id],

            edit_count:
                state.editCount[id],

            updated_at:
                state.updatedAt[id]

        };

    });

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}




/* ===================================================
   BACKUP SUPABASE
=================================================== */

async function backupData(warga, jumlah) {

    const { data, error } = await supabase
        .from("backup_jimpitan_harian")
        .upsert({
            warga_id: warga.warga_id,
            jumlah: jumlah,
            tanggal: getTanggal(),
            created_by: session.petugas_id,
            edit_count: state.editCount[warga.warga_id],
            updated_at: new Date().toISOString(),
            status: "backup"
        }, {
            onConflict: "warga_id,tanggal"
        })
        .select();

    console.log("DATA :", data);
    console.log("ERROR :", error);
}








/* ===================================================
   CLEAR SEARCH
=================================================== */

function updateClearButton() {

    if (!el.clearSearch) return;

    if (el.search.value.trim()) {

        el.clearSearch.classList.add("show");

    } else {

        el.clearSearch.classList.remove("show");

    }

}

el.clearSearch?.addEventListener("click", e => {

    e.preventDefault();
    e.stopPropagation();

    el.search.value = "";

    el.search.focus();

    updateClearButton();

    render();

});


/* ===================================================
   ICON
=================================================== */

function getIcon(warga_id) {

    const total = state.total[warga_id];

    const edit = state.editCount[warga_id] || 0;

    if (total == null)
        return "circle-alert.svg";

    if (Number(total) === 0)
        return "circle-x.svg";

    if (edit > 1)
        return "badge-check.svg";

    return "circle-check.svg";

}


/* ===================================================
   FILTER DATA
=================================================== */

function filterData(list) {

    const getValue = w =>
        state.total[w.warga_id];

    switch (state.filter) {

        case "alert":

            list = list.filter(
                w => getValue(w) == null
            );

            break;

        case "zero":

            list = list.filter(
                w =>
                    getValue(w) != null &&
                    Number(getValue(w)) === 0
            );

            break;

        case "done":

            list = list.filter(
                w =>
                    Number(getValue(w)) > 0
            );

            break;

    }



    /* ================= FILTER PROFIL ================= */
    

    if (state.profil === "aktif") {

    list = list.filter(w => {

        const status =
            (w.status || "")
            .trim()
            .toLowerCase();

        return [
            "harian",
            "mingguan",
            "bulanan"
        ].includes(status);

    });

}

    else if (state.profil === "nonaktif") {

        list = list.filter(w =>
            ["Tahunan","Non Aktif"]
            .includes(w.status)
        );

    }




    if (state.blok !== "all") {

        list = list.filter(w => {

            const rumah =
                (w.no_rumah || "")
                .toUpperCase();

            switch (state.blok) {

                case "J. RAYA":
                    return rumah.includes("J. RAYA");

                case "A":
                    return rumah.includes("BLOK A");

                case "B":
                    return rumah.includes("BLOK B");

                case "C":
                    return rumah.includes("BLOK C");

                default:
                    return true;

            }

        });

    }

    return list;

}


/* ===================================================
   FILTER UI
=================================================== */

function updateFilterUI() {

    if (!el.badge) return;

    if (state.filter === "all") {

        el.badge.classList.remove("show");

        el.badgeText.textContent = "Filter";

        el.badgeIcon.src =
            "assets/icons/text-align-justify.svg";

        return;

    }

    el.badge.classList.add("show");

    const text = {

        alert: "Belum",

        zero: "Kosong",

        done: "Sudah"

    };

    const icon = {

        alert: "circle-alert.svg",

        zero: "circle-x.svg",

        done: "circle-check.svg"

    };

    el.badgeText.textContent =
        text[state.filter];

    el.badgeIcon.src =
        `assets/icons/${icon[state.filter]}`;

}


function updateBlokUI() {

    const text = {

        all: "SEMUA",

        "J. RAYA": "J. RAYA",

        A: "BLOK A",

        B: "BLOK B",

        C: "BLOK C"

    };

    el.blokText.textContent =
        text[state.blok];

    el.blokBadge.classList.toggle(
        "active",
        state.blok !== "all"
    );

}


/* ===================================================
   RENDER
=================================================== */

function render() {

    let list = [...state.warga];

    const keyword =
        el.search.value
        .trim()
        .toLowerCase();

    if (keyword) {

        list = list.filter(w => {

            return (

                String(w.warga_id)
                .toLowerCase()
                .includes(keyword)

                ||

                String(w.no_rumah || "")
                .toLowerCase()
                .includes(keyword)

                ||

                String(w.nama_warga || "")
                .toLowerCase()
                .includes(keyword)

            );

        });

    }

    list = filterData(list);

    list.sort((a, b) => {

        if (
            a.warga_id === state.lastUpdatedId
        ) return -1;

        if (
            b.warga_id === state.lastUpdatedId
        ) return 1;

        return (
            (state.updatedAt[b.warga_id] || 0) -
            (state.updatedAt[a.warga_id] || 0)
        );

    });

    el.list.innerHTML = "";

    list.forEach(drawItem);

}


/* ===================================================
   DRAW ITEM
=================================================== */

function drawItem(w) {

    const div =
        document.createElement("div");

    div.className = "wa-item";

    div.dataset.id = w.warga_id;

    div.innerHTML = `

<div class="wa-row">

    <div class="wa-left">

        <img
            class="icon"
            src="assets/icons/${getIcon(w.warga_id)}">

        <div class="wa-text">

            <div class="rumah">
                ${w.no_rumah || "-"}
            </div>

            <div class="nama">
                ${w.nama_warga}
            </div>

            <div class="kode">
                ID ${w.warga_id}
            </div>

        </div>

    </div>

    <div class="wa-right">

        <div class="total">

            ${
                state.total[w.warga_id] != null
                ? formatRupiah(state.total[w.warga_id])
                : "-"
            }

        </div>

        <div class="status-warga ${w.status === "Tidak" ? "inactive" : ""}">
            ${w.status || "-"}
        </div>

        <div class="status">
            ${state.jam[w.warga_id] || "Belum input"}
        </div>

    </div>

</div>

`;

    if (w.warga_id === state.lastUpdatedId) {

        setTimeout(() => {

            div.querySelector(".icon")
                ?.classList.add("bounce");

            setTimeout(() => {

                div.querySelector(".icon")
                    ?.classList.remove("bounce");

            }, 500);

        }, 50);

    }

    div.onclick = () => openDetail(w);

    el.list.appendChild(div);

}





/* ===================================================
   DETAIL
=================================================== */

function updateDetailColor(value) {

    if (!el.detailValue) return;

    el.detailValue.classList.remove(
        "zero",
        "positive"
    );

    if (Number(value) > 0) {

        el.detailValue.classList.add("positive");

    } else {

        el.detailValue.classList.add("zero");

    }

}


/* ===================================================
   DETAIL HISTORY
=================================================== */

function openDetailHistory() {

    if (location.hash === "#detail") return;

    history.pushState(
        { detail: true },
        "",
        "#detail"
    );

}



function openDetail(w) {

    state.active = w;

    el.detailRumah.textContent =
        w.no_rumah || "-";

    el.detailId.textContent =
        `ID ${w.warga_id}`;

    el.detailNamaBig.textContent =
        w.nama_warga;

    const value =
        state.input[w.warga_id] ??
        state.total[w.warga_id] ??
        0;

    state.input[w.warga_id] = value;

    el.detailValue.textContent =
        formatRupiah(value);

    updateDetailColor(value);

    if (isPetugas) {

        el.minus.style.display = "";
        el.plus.style.display = "";
        el.save.style.display = "";

    } else {

        el.minus.style.display = "none";
        el.plus.style.display = "none";
        el.save.style.display = "none";

    }

    openDetailHistory();

    el.detailPage.classList.add("open");

}


function closeDetail(fromHistory = false) {

    el.detailPage.classList.remove("open");

    state.active = null;

    if (!fromHistory && location.hash === "#detail") {

        history.back();

    }

}


/* ===================================================
   BACK BUTTON HP
=================================================== */

window.addEventListener("popstate", () => {

    if (
        location.hash !== "#detail" &&
        el.detailPage.classList.contains("open")
    ) {

        closeDetail(true);

    }

});



/* ===================================================
   BUTTON BACK DETAIL
=================================================== */

el.back?.addEventListener("click", () => {

    if (el.detailPage.classList.contains("open")) {

        history.back();

    }

});





/* ===================================================
   PLUS MINUS
=================================================== */

el.plus.onclick = () => {

    if (!state.active) return;

    const id = state.active.warga_id;

    state.input[id] =
        (state.input[id] || 0) + TARIF;

    el.detailValue.textContent =
        formatRupiah(state.input[id]);

    updateDetailColor(state.input[id]);

};


el.minus.onclick = () => {

    if (!state.active) return;

    const id = state.active.warga_id;

    state.input[id] = Math.max(
        0,
        (state.input[id] || 0) - TARIF
    );

    el.detailValue.textContent =
        formatRupiah(state.input[id]);

    updateDetailColor(state.input[id]);

};


/* ===================================================
   SAVE
=================================================== */

el.save.onclick = async () => {

    if (!isPetugas) {

        alert("Silakan login sebagai petugas.");

        return;

    }

    if (!state.active) return;

    const id =
        state.active.warga_id;

    const nilai =
        state.input[id] ?? 0;

    state.total[id] =
        nilai;

    state.editCount[id] =
        (state.editCount[id] || 0) + 1;

    state.jam[id] =
    getWIB()
    .time
    .replace(/:/g, ".") + " WIB";

    state.updatedAt[id] =
        Date.now();

    state.lastUpdatedId =
        id;

    saveLocalData();

    await backupData(
        state.active,
        nilai
    );



    delete state.input[id];

    el.search.value = "";

    updateClearButton();

    history.back();

    requestAnimationFrame(() => {

        render();

        document
            .querySelector(
                `[data-id="${id}"]`
            )
            ?.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });

        setTimeout(() => {

            state.lastUpdatedId = null;

            render();

        }, 600);

    });

};




/* ===================================================
   SIDEBAR
=================================================== */

el.btnMenu?.addEventListener("click", e => {

    e.stopPropagation();

    el.sidebar.classList.toggle("open");

    el.overlay.classList.toggle("show");

});


el.btnProfil?.addEventListener("click", e => {

    e.stopPropagation();

    el.profilSidebar.classList.toggle("open");

    el.overlay.classList.toggle("show");

});



el.blokBadge?.addEventListener("click", e => {

    e.stopPropagation();

    el.blokSidebar.classList.toggle("open");

    el.overlay.classList.toggle("show");

});


document.addEventListener("click", e => {

    if (
        !el.sidebar.contains(e.target) &&
        !el.btnMenu.contains(e.target)
    ) {
        el.sidebar.classList.remove("open");
    }

    if (
    !el.profilSidebar.contains(e.target) &&
    !el.btnProfil.contains(e.target)
    ) {

        el.profilSidebar.classList.remove("open");

    }

    if (
        !el.blokSidebar.contains(e.target) &&
        !el.blokBadge.contains(e.target)
    ) {
        el.blokSidebar.classList.remove("open");
    }

    if (

        !el.sidebar.classList.contains("open") &&

        !el.blokSidebar.classList.contains("open") &&

        !el.profilSidebar.classList.contains("open")

    ){

        el.overlay.classList.remove("show");

    }

});


/* ===================================================
   FILTER STATUS
=================================================== */

document
.querySelectorAll("#sidebar .sidebar-item")
.forEach(item => {

    item.addEventListener("click", () => {

        state.filter = item.dataset.filter;

        document
            .querySelectorAll("#sidebar .sidebar-item")
            .forEach(i => i.classList.remove("active"));

        item.classList.add("active");

        updateFilterUI();

        render();

        el.sidebar.classList.remove("open");

        el.overlay.classList.remove("show");

    });

});


/* ===================================================
   FILTER BLOK
=================================================== */

document
.querySelectorAll("#blokSidebar .sidebar-item")
.forEach(item => {

    item.addEventListener("click", () => {

        state.blok = item.dataset.blok;

        document
            .querySelectorAll("#blokSidebar .sidebar-item")
            .forEach(i => i.classList.remove("active"));

        item.classList.add("active");

        updateBlokUI();

        render();

        el.blokSidebar.classList.remove("open");

        el.overlay.classList.remove("show");

    });

});


/* ===================================================
   FILTER PROFIL
=================================================== */

document
.querySelectorAll("#profilSidebar .sidebar-item")
.forEach(item => {

    item.addEventListener("click", () => {

        state.profil =
            item.dataset.profil;

        document
            .querySelectorAll("#profilSidebar .sidebar-item")
            .forEach(i =>
                i.classList.remove("active")
            );

        item.classList.add("active");

        render();

        el.profilSidebar.classList.remove("open");

        el.overlay.classList.remove("show");

    });

});


/* ===================================================
   SEARCH
=================================================== */

el.search?.addEventListener("input", () => {

    updateClearButton();

    render();

});


/* ===================================================
   PLACEHOLDER
=================================================== */

function startTypingPlaceholder() {

    const text = "Cari nama warga...";

    let i = 0;

    function loop() {

        if (el.search.value) return;

        el.search.placeholder =
            text.substring(0, i);

        i++;

        if (i > text.length) {

            setTimeout(() => {

                i = 0;

                loop();

            }, 4000);

            return;

        }

        setTimeout(loop, 80);

    }

    loop();

}


/* ===================================================
   REFRESH
=================================================== */

function refreshJimpitan() {

    loadLocalData();

    updateFilterUI();

    updateBlokUI();

    updateClearButton();

    render();

}



/* ===================================================
   BACK HANDLER
=================================================== */

initBackHandler({

    onBack() {

        if (el.detailPage.classList.contains("open")) {

            closeDetail();

            return true;

        }

        return false;

    }

});



/* ===================================================
   INIT
=================================================== */

async function init() {

    console.clear();

    console.log("========== JIMPITAN ==========");

    // Jika halaman direfresh saat sedang di detail,
    // kembalikan URL ke jimpitan tanpa #detail
    if (location.hash === "#detail") {

        history.replaceState(
            {},
            "",
            location.pathname
        );

    }

    await loadWarga();

    loadLocalData();

    refreshJimpitan();

    startTypingPlaceholder();

    console.log(
        "READY",
        state.warga.length,
        "WARGA"
    );

}

init();
