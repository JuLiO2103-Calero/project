// Selecciona el formulario por id o por clase (en tu HTML está como class="form-contact")
const form = document.querySelector('.form-contact');


form.addEventListener('submit', function (e) {
    e.preventDefault(); // evita recargar la página

    const nombreEl = document.getElementById('nombre');
    const correoEl = document.getElementById('correo');
    const mensajeEl = document.getElementById('mensaje');

    const nombre = nombreEl ? nombreEl.value.trim() : '';
    const correo = correoEl ? correoEl.value.trim() : '';
    const mensaje = mensajeEl ? mensajeEl.value.trim() : '';

    // Validación sencilla
    if (!nombre || !correo || !mensaje) {
        alert('Por favor completa todos los campos antes de enviar.');
        return;
    }
    
    const texto = `Hola! Soy ${nombre}. Mi correo es ${correo}. Mensaje: ${mensaje}`;
    const url = `https://wa.me/50581855631?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
    alert('¡Mensaje enviado! Nos pondremos en contacto contigo pronto.');
});
