import { tampilkanBannerUpdate } from "./update-banner.js";

if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            const reg = await navigator.serviceWorker.register("./sw.js");

            window.updateApp = () => {

                if (reg.waiting) {

                    reg.waiting.postMessage({
                        type: "SKIP_WAITING"
                    });

                }

            };

            console.log("Service Worker aktif");

            // cek update
            reg.update();
            console.log("Mengecek pembaruan...");

            // jika update sudah menunggu
            if (reg.waiting) {

                console.log("Update sudah menunggu");

                tampilkanBannerUpdate();

            }

            // saat ada service worker baru
            reg.addEventListener("updatefound", () => {

                const worker = reg.installing;

                worker?.addEventListener("statechange", () => {

                    console.log("State:", worker.state);

                    if (
                        worker.state === "installed" &&
                        navigator.serviceWorker.controller
                    ) {

                        console.log("Versi baru ditemukan");

                        tampilkanBannerUpdate();

                    }

                });

            });

            // setelah SW baru aktif → reload otomatis
            navigator.serviceWorker.addEventListener(
                "controllerchange",
                () => {
                    window.location.reload();
                }
            );

        }

        catch (err) {

            console.error(err);

        }

    });

}
