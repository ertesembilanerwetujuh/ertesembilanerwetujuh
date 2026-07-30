/* ===================================================
   BACK HANDLER
=================================================== */

function initBackHandler(options = {}) {

    let lastBackPress = 0;

    // Tambah satu history agar Back pertama
    // tidak langsung keluar halaman
    history.pushState(
        { app: true },
        "",
        location.href
    );

    window.addEventListener("popstate", () => {

        // Halaman boleh menangani Back sendiri
        if (typeof options.onBack === "function") {

            if (options.onBack()) {

                history.pushState(
                    { app: true },
                    "",
                    location.href
                );

                return;

            }

        }

        const now = Date.now();

        if (now - lastBackPress < 2000) {

            // Biarkan browser keluar
            return;

        }

        lastBackPress = now;

        showToastBig(
            "<div class='toast-header'>PERHATIAN</div><br>Tekan sekali lagi untuk keluar."
        );

        history.pushState(
            { app: true },
            "",
            location.href
        );

    });

}

window.initBackHandler = initBackHandler;