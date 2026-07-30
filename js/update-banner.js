const updateBanner = document.getElementById("updateBanner");
const btnNanti = document.getElementById("btnNanti");
const btnPerbarui = document.getElementById("btnPerbarui");

/* ===============================
   TAMPIL / SEMBUNYI
================================ */

export function tampilkanBannerUpdate() {

    if (!updateBanner) return;

    updateBanner.classList.remove("hidden");

}

export function sembunyikanBannerUpdate() {

    if (!updateBanner) return;

    updateBanner.classList.add("hidden");

}

/* ===============================
   EVENT
================================ */

btnNanti?.addEventListener("click", () => {

    sembunyikanBannerUpdate();

});

btnPerbarui?.addEventListener("click", () => {

    if (window.updateApp) {

        window.updateApp();

    } else {

        window.location.reload();

    }

});