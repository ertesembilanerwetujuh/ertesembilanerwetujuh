import { supabase } from "./supabase.js";
import { showToast } from "./utils.js";



/* ===================================================
   DEVICE ID JIMPITAN
=================================================== */

let deviceId = localStorage.getItem("device_id");

if (!deviceId) {

    deviceId = crypto.randomUUID();

    localStorage.setItem(
        "device_id",
        deviceId
    );

}



/* ===================================================
   INIT
=================================================== */

document.addEventListener(
    "DOMContentLoaded",
    init
);



function init(){


    const session =
        localStorage.getItem(
            "jimpitan_session"
        );


    /*
       Kalau sudah pernah buka Jimpitan
       langsung ke login
    */

    if(session === "true"){

        location.replace(
            "login.html"
        );

        return;

    }



    const btnMasuk =
        document.querySelector(".btn-primary");


    if(!btnMasuk) return;


    btnMasuk.addEventListener(
        "click",
        masukJimpitan
    );


}





/* ===================================================
   SESSION DEVICE JIMPITAN
=================================================== */


async function masukJimpitan(event){


    event.preventDefault();


    try{


        const {data,error}=await supabase

        .from("session_laporan")

        .select("id")

        .eq(
            "device_id",
            deviceId
        )

        .eq(
            "app",
            "jimpitan"
        )

        .maybeSingle();



        if(error)
            throw error;




        if(!data){


            const {error:insertError}=

            await supabase

            .from("session_laporan")

            .insert({

                device_id:deviceId,
                app:"jimpitan"

            });



            if(insertError)
                throw insertError;


        }





        localStorage.setItem(
            "jimpitan_session",
            "true"
        );





        location.replace(
            "login.html"
        );



    }


    catch(err){


        console.error(err);


        showToast(
            "Gagal membuka Jimpitan."
        );


    }


}