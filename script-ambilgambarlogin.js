// ===== FORM LOGIN =====
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    // const photo    = document.getElementById("photo").files[0];

    // Nonaktifkan sementara pengecekan foto
    // if (!photo) {
    //   alert("Silakan ambil foto dulu!");
    //   return;
    // }

    // Simpan status login
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", username);
    localStorage.setItem("lastPage", "beranda");

    // Tampilkan app
    loginScreen.classList.add("hidden");
    appWrapper.classList.remove("hidden");
    appHeader.classList.remove("hidden");
    sidebar.classList.remove("hidden");

    openPage("beranda", false);
  });
}