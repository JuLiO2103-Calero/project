let clientes = []; // Variable para guardar los datos (normalizados)

fetch('../Scripts/Data.json')
  .then(respuesta => respuesta.json())
  .then(datos => {
    // Normalizar la estructura para facilitar búsquedas y renderizado
    clientes = (datos || []).map(c => {
      const nombre = c?.DatosPersonale?.Nombre || '';
      const apellido = c?.DatosPersonale?.Apellido || '';
      const email = c?.DatosConctacto?.Correo || '';
      const telefono = c?.DatosConctacto?.Telefono || '';
      const direccion = c?.DatosConctacto?.direccion || '';
      const usuario = c?.DatosUsuario?.Usuario || '';
      // La clave de contraseña en tu JSON es 'Contraseña' con tilde
      const contrasena = c?.DatosUsuario?.['Contraseña'] || '';
      const id = c?.DatosPersonale?.id || null;
      const edad = c?.DatosPersonale?.Edad || null;
      const citas = c?.Citas || [];
      return { id, nombre, apellido, email, telefono, direccion, usuario, contrasena, edad, citas, raw: c };
    });
    console.log('Datos cargados (normalizados):', clientes);
  })
  .catch(error => console.error('Error al cargar los datos:', error));

// --- Lógica del modal de login ---
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const closeBtn = modal ? modal.querySelector('.modal-close') : null;
  const cancelBtn = document.getElementById('btn-cancel');
  const errorEl = document.getElementById('login-error');

  function setModalOpen(open) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    // control foco simple
    if (open) {
      const first = modal.querySelector('input');
      if (first) first.focus();
    }
  }

  // Exponer función global para abrir el modal desde HTML si se necesita
  window.openLoginModal = function() {
    setModalOpen(true);
  };

  if (closeBtn) closeBtn.addEventListener('click', () => setModalOpen(false));
  if (cancelBtn) cancelBtn.addEventListener('click', () => setModalOpen(false));

  // Cerrar modal al pulsar fuera del contenido
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) setModalOpen(false);
    });
  }

  // Manejo del submit del login
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const usuario = document.getElementById('login-usuario')?.value.trim() || '';
      const contrasena = document.getElementById('login-contrasena')?.value || '';

      // Validación básica
      if (!usuario || !contrasena) {
        if (errorEl) errorEl.textContent = 'Completa usuario y contraseña.';
        return;
      }

  // Buscar coincidencia en clientes cargados (usamos la estructura normalizada)
  const normalizedInput = usuario.toLowerCase();
  console.log('Intento login con:', { usuario, contrasena });
  console.log('Usuarios disponibles:', clientes.map(c=>({usuario:c.usuario,email:c.email})));
      const match = clientes.find(c => {
        // comparar usuario (case-insensitive)
        if (c.usuario && c.usuario.toLowerCase() === normalizedInput && c.contrasena === contrasena) return true;
        // comparar email como alternativa (si el usuario ingresó correo)
        if (c.email && c.email.toLowerCase() === normalizedInput && c.contrasena === contrasena) return true;
        return false;
      });

      if (match) {
        if (errorEl) errorEl.textContent = '';
        setModalOpen(false);
        // Mostrar perfil amigable en la página
        renderUserProfile(match);
        // Aquí podrías redirigir o mostrar la zona privada
      } else {
        if (errorEl) errorEl.textContent = 'Usuario o contraseña incorrectos.';
      }
    });
  }

  // Abrir modal automáticamente al cargar si no hay perfil mostrado
  const profile = document.getElementById('user-profile');
  if (profile && profile.children.length === 0) {
    setTimeout(() => { if (window.openLoginModal) window.openLoginModal(); }, 200);
  }
});

// Abrir el modal cuando la pestaña se vuelve visible (útil si el usuario vuelve a la pestaña)
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') {
    // Abrimos el modal automáticamente solo si no hay usuario logueado en la UI
    const profile = document.getElementById('user-profile');
    if (profile && profile.children.length === 0) {
      // Pequeño delay para evitar abrir antes de que DOM esté listo en algunas circunstancias
      setTimeout(() => { if (window.openLoginModal) window.openLoginModal(); }, 200);
    }
  }
});

// Renderizar perfil del usuario de forma amigable
function renderUserProfile(user) {
  const container = document.getElementById('user-profile');
  if (!container) return;
  // Limpia contenido previo
  container.innerHTML = '';

  const containerProfile = document.createElement('div');
  containerProfile.className = 'profile-container';

  const details = document.createElement('div');
  details.className = 'profile-details';

  const card = document.createElement('div');
  card.className = 'profile-card';

  // Avatar: si hay url de imagen usarla, sino usar iniciales
  const avatar = document.createElement('div');
  avatar.className = 'profile-avatar';
  if (user.avatar) {
    const img = document.createElement('img');
    img.src = user.avatar;
    img.alt = user.nombre || user.usuario || 'Avatar';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    avatar.innerHTML = '';
    avatar.appendChild(img);
  } else {
    const initials = (user.nombre || user.usuario || user.email || '').split(' ').map(s=>s[0]||'').join('').slice(0,2).toUpperCase();
    avatar.textContent = initials || 'U';
  }

  const info = document.createElement('div');
  info.className = 'profile-info profile-meta';
  const name = document.createElement('h3');
  name.textContent = (user.nombre ? (user.nombre + (user.apellido ? ' ' + user.apellido : '')) : (user.usuario || user.email || 'Usuario'));
  info.appendChild(name);

  // Campos adicionales amigables
  if (user.email) {
    const p = document.createElement('p'); p.textContent = 'Correo: ' + user.email; info.appendChild(p);
  }
  if (user.telefono) {
    const p = document.createElement('p'); p.textContent = 'Teléfono: ' + user.telefono; info.appendChild(p);
  }
  if (user.direccion) {
    const p = document.createElement('p'); p.textContent = 'Dirección: ' + user.direccion; info.appendChild(p);
  }
  if (user.edad) {
    const p = document.createElement('p'); p.textContent = 'Edad: ' + user.edad; info.appendChild(p);
  }
  // Añadir otros campos dinámicamente (omitimos 'edad' porque ya se muestra arriba)
  const extras = ['ciudad','ocupacion'];
  extras.forEach(k => { if (user[k]) { const p = document.createElement('p'); p.textContent = k.charAt(0).toUpperCase()+k.slice(1)+': '+user[k]; info.appendChild(p); } });

  

  card.appendChild(avatar);
  card.appendChild(info);

  // Estructura de detalles
  details.appendChild(avatar);
  details.appendChild(info);

  containerProfile.appendChild(details);
  container.appendChild(containerProfile);

  // Mostrar citas si existen en una sección separada
  if (user.citas && user.citas.length) {
    const apptSection = document.createElement('div');
    apptSection.className = 'profile-appointments';
    const h = document.createElement('h4'); h.textContent = 'Mis citas'; apptSection.appendChild(h);
    const ul = document.createElement('ul');
    user.citas.forEach(ci => {
      const li = document.createElement('li');
      const left = document.createElement('div'); left.className = 'appt-left';
      left.textContent = `${ci.fecha} — ${ci.servicio}`;
      const meta = document.createElement('div'); meta.className = 'appt-meta';
      meta.textContent = ci.profesional;
      const badge = document.createElement('div'); badge.className = 'appt-badge';
      badge.textContent = 'Ver';
      li.appendChild(left);
      li.appendChild(meta);
      li.appendChild(badge);
      ul.appendChild(li);
    });
    apptSection.appendChild(ul);
    container.appendChild(apptSection);
  }
  // Añadir botón de logout al final del perfil (debajo de citas)
  const logoutWrap = document.createElement('div');
  logoutWrap.style.marginTop = '14px';
  logoutWrap.style.display = 'flex';
  logoutWrap.style.justifyContent = 'flex-end';
  const finalLogout = document.createElement('button');
  finalLogout.className = 'btn-logout';
  finalLogout.textContent = 'Cerrar sesión';
  finalLogout.addEventListener('click', () => {
    container.innerHTML = '';
    if (window.openLoginModal) window.openLoginModal();
  });
  logoutWrap.appendChild(finalLogout);
  container.appendChild(logoutWrap);
}
