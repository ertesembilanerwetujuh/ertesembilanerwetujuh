import { supabase } from "./supabase.js";



/* ===================================================
   ELEMENT
=================================================== */

const el = {

    grup:
        document.getElementById("grupAktif"),

    petugas:
        document.getElementById("petugasAktif"),

    status:
        document.getElementById("statusAudit"),

    statusTitle:
        document.getElementById("statusTitle"),

    logout:
        document.getElementById("btnLogout"),

    cancel:
        document.getElementById("btnCancel")

};



/* ===================================================
   SESSION LOCAL
=================================================== */

const session =
    JSON.parse(
        localStorage.getItem("petugas_session")
    ) || {};




/* ===================================================
   LOAD PROFILE
=================================================== */

function loadProfile() {

    console.log("SESSION:", session);

    el.grup.textContent =
        session.no_grup || "-";

    el.petugas.textContent =
        session.nama_petugas || "-";

    el.status.textContent =
        "Sedang Aktif";

    el.statusTitle.textContent =
        "Petugas";

}


loadProfile();




/* ===================================================
   LOGOUT
=================================================== */

async function logout() {

    if (!session.session_id) {

        clearLocal();

        location.href = "login.html";

        return;

    }

    try {

        await supabase

            .from("session_jimpitan")

            .update({

                logout_at:
                    new Date().toISOString()

            })

            .eq(

                "id",

                session.session_id

            );

    } catch (err) {

        console.error(

            "LOGOUT ERROR",

            err

        );

    }

    clearLocal();

    location.href =
        "login.html";

}




/* ===================================================
   CLEAR LOCAL
=================================================== */

function clearLocal(){

    localStorage.removeItem(
        "petugas_session"
    );

}



/* ===================================================
   BUTTON
=================================================== */

el.logout.onclick = ()=>{


    const yakin =
        confirm(
            "Keluar dari audit sekarang?"
        );


    if(yakin){

        logout();

    }

};



el.cancel.onclick = ()=>{

    history.back();

};