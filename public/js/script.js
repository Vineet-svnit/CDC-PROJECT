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

// To automatically make the flash message disappear
setTimeout(() => {
  const flash = document.getElementById("flash-message");
  if (flash) {
    flash.style.transition = "opacity 0.5s ease";
    flash.style.opacity = 0;
    setTimeout(() => flash.remove(), 500); // remove after fade-out
  }
}, 3000); // 3 seconds