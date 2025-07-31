(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

// theme change
function setCookie(name, value) {
  document.cookie = `${name}=${value}; path=/;`;
}

function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    let [k, v] = cookie.trim().split('=');
    if (k === name) return v;
  }
  return null;
}

// --- Toggle theme and update cookie ---
// let button = document.getElementById("theme-toggle");
// let icon = document.getElementById("theme-icon");

// window.onload = () => {
//   const cookieTheme = getCookie('theme') || "";
//   document.body.classList.add(cookieTheme);
// };

// button.addEventListener("click",async () => {

//   document.body.classList.toggle("dark-mode");

//   if (document.body.classList.contains("dark-mode")) {
//     icon.classList.replace("fa-moon", "fa-sun");
//     setCookie("theme","dark-mode");
//   } else {
//     icon.classList.replace("fa-sun", "fa-moon");
//     setCookie("theme","");
//   }
// });
