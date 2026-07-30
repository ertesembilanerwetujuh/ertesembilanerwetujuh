/* ===========================================
   TOAST
=========================================== */

const toast = document.getElementById("toast");

let timer = null;

export function showToast(message, duration = 2000){

    if(!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(timer);

    timer = setTimeout(() => {

        toast.classList.remove("show");

    }, duration);

}