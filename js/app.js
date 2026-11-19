// =========================================================================
// DATOS INICIALES Y CONSTANTES
// =========================================================================
const MASCOTAS_INICIALES = [
    { id: "mascota-luna", nombre: "Luna", especie: "Perro", edad: "2 años", sexo: "Hembra", tamanio: "Mediano", descripcion: "Cariñosa y juguetona. Está vacunada y castrada.", foto: "img/luna.jpg", alt: "Perra mediana de pelaje marron", estado: "Disponible" },
    { id: "mascota-michi", nombre: "Michi", especie: "Gato", edad: "1 año", sexo: "Macho", tamanio: "Pequeño", descripcion: "Curioso y tranquilo. Le encanta dormir al sol y jugar con pelotitas de tenis", foto: "img/michi.jpg", alt: "Gato naranja de ojos verdes", estado: "Disponible" },
    { id: "mascota-toby", nombre: "Toby", especie: "Perro", edad: "5 años", sexo: "Macho", tamanio: "Grande", descripcion: "Perro adulto, muy obediente. Ideal para una familia con patio.", foto: "img/toby.jpg", alt: "Perro grande de pelaje gris", estado: "En proceso" },
    { id: "mascota-nube", nombre: "Nube", especie: "Conejo", edad: "8 meses", sexo: "Hembra", tamanio: "Pequeño", descripcion: "Dulce y timida. Come verduras frescas y necesita un espacio amplio.", foto: "img/nube.jpg", alt: "Conejo blanco de orejas largas", estado: "En proceso" },
    { id: "mascota-mora", nombre: "Mora", especie: "Gato", edad: "3 años", sexo: "Hembra", tamanio: "Pequeño", descripcion: "Independiente. Desparasitada y con todo al día.", foto: "img/mora.jpg", alt: "Gata gris oscuro de ojos amarillos", estado: "Disponible" },
    { id: "mascota-rocky", nombre: "Rocky", especie: "Perro", edad: "4 meses", sexo: "Macho", tamanio: "Mediano", descripcion: "Cachorro con mucha energia. Necesita paseos diarios y mucho amor.", foto: "img/rocky.jpg", alt: "Cachorro de pelaje dorado", estado: "Disponible" }
];

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// =========================================================================
// FUNCIONES AUXILIARES (STORAGE Y DOM)
// =========================================================================
function leerStorage(clave) {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : [];
}

function guardarStorage(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

function crearNodo(etiqueta, clase, texto) {
    const nodo = document.createElement(etiqueta);
    if (clase) {
        nodo.className = clase;
    }
    if (texto) {
        nodo.appendChild(document.createTextNode(texto));
    }
    return nodo;
}

function limpiarContenedor(contenedor) {
    while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
    }
}

function existeAdmin() {
    return leerStorage("usuarios").filter((u) => u.perfil === "Administrador").length > 0;
}

function inicializarStorage() {
    if (!localStorage.getItem("mascotas")) guardarStorage("mascotas", MASCOTAS_INICIALES);
    if (!localStorage.getItem("usuarios")) {
        guardarStorage("usuarios", [{ nombre: "Joaquin", email: "joaquin@gmail.com", clave: "1234", perfil: "Usuario", fechaRegistro: "2026-03-15" }]);
    }
    if (!localStorage.getItem("favoritos")) guardarStorage("favoritos", ["mascota-luna", "mascota-michi"]);
    if (!localStorage.getItem("solicitudes")) guardarStorage("solicitudes", ["mascota-toby", "mascota-nube"]);
    if (!localStorage.getItem("vistaMascotas")) localStorage.setItem("vistaMascotas", "tarjetas");
}

// =========================================================================
// TEMA OSCURO Y NAVEGACION
// =========================================================================
function configurarTema() {
    const btnTema = document.querySelector(".boton-tema");
    const esOscuro = localStorage.getItem("tema") === "oscuro";

    if (esOscuro) {
        document.body.classList.add("tema-oscuro");
        if (btnTema) btnTema.innerHTML = "Tema claro";
    }

    if (btnTema) {
        btnTema.addEventListener("click", function () {
            document.body.classList.toggle("tema-oscuro");
            const activo = document.body.classList.contains("tema-oscuro");
            localStorage.setItem("tema", activo ? "oscuro" : "claro");
            btnTema.innerHTML = activo ? "Tema claro" : "Tema oscuro";
        });
    }
}

function actualizarNavegacion() {
    const linkSolicitudes = document.getElementById("nav-solicitudes");
    if (linkSolicitudes) {
        linkSolicitudes.innerHTML = `Mis solicitudes (${leerStorage("solicitudes").length})`;
    }

    const linkCambiarRol = document.getElementById("nav-cambiar-rol");
    if (linkCambiarRol) {
        linkCambiarRol.addEventListener("click", function (e) {
            e.preventDefault();
            if (!existeAdmin()) {
                window.location.href = "registro-admin.html";
            } else {
                const admins = leerStorage("usuarios").filter((u) => u.perfil === "Administrador");
                guardarStorage("usuarioActivo", admins[0]);
                window.location.href = "admin.html";
            }
        });
    }

    const linkCerrar = document.getElementById("nav-cerrar");
    if (linkCerrar) {
        linkCerrar.addEventListener("click", function () {
            localStorage.removeItem("usuarioActivo");
        });
    }
}

// =========================================================================
// RENDERIZADO DINAMICO DE MASCOTAS (TARJETAS O LISTA)
// =========================================================================
function renderizarMascotas(contenedor, listaMascotas, modoVista, soloFavoritos) {
    if (!contenedor) return;
    limpiarContenedor(contenedor);

    if (listaMascotas.length === 0) {
        contenedor.appendChild(crearNodo("p", "", "No se encontraron mascotas para mostrar."));
        return;
    }

    const favoritos = leerStorage("favoritos");

    listaMascotas.forEach((mascota) => {
        const esFavorito = favoritos.indexOf(mascota.id) > -1;
        const article = crearNodo("article", modoVista === "lista" ? "item-lista" : "tarjeta", "");
        article.id = mascota.id;

        const img = document.createElement("img");
        img.src = mascota.foto || "img/luna.jpg";
        img.alt = mascota.alt || mascota.nombre;
        article.appendChild(img);

        const contenedorInfo = modoVista === "lista" ? crearNodo("div", "datos", "") : article;
        contenedorInfo.appendChild(crearNodo("h3", "", mascota.nombre));

        const pEtiquetas = document.createElement("p");
        const datos = [mascota.especie, mascota.edad, mascota.sexo, mascota.tamanio];
        datos.forEach((dato, idx) => {
            pEtiquetas.appendChild(crearNodo("span", "etiqueta", dato));
            if (idx < datos.length - 1) pEtiquetas.appendChild(document.createTextNode(" "));
        });
        contenedorInfo.appendChild(pEtiquetas);
        contenedorInfo.appendChild(crearNodo("p", "", mascota.descripcion));

        if (modoVista === "lista") article.appendChild(contenedorInfo);

        const divAcciones = crearNodo("div", "acciones", "");
        const btnFav = crearNodo("button", esFavorito ? "favorito marcado" : "favorito", esFavorito ? "Quitar de favoritos" : "Marcar favorito");
        btnFav.type = "button";
        btnFav.addEventListener("click", function () {
            let favs = leerStorage("favoritos");
            favs = favs.indexOf(mascota.id) > -1 ? favs.filter((id) => id !== mascota.id) : favs.concat(mascota.id);
            guardarStorage("favoritos", favs);
            if (soloFavoritos) {
                cargarPaginaMiCuenta();
            } else {
                renderizarMascotas(contenedor, filtrarMascotas(), localStorage.getItem("vistaMascotas") || "tarjetas", false);
            }
        });

        const btnSolicitar = crearNodo("button", "btn-adopcion", "Solicitar adopcion");
        btnSolicitar.type = "button";
        btnSolicitar.addEventListener("click", function () {
            const sols = leerStorage("solicitudes");
            if (sols.indexOf(mascota.id) === -1) {
                sols.push(mascota.id);
                guardarStorage("solicitudes", sols);
            }
            window.location.href = "solicitudes.html";
        });

        divAcciones.appendChild(btnFav);
        divAcciones.appendChild(btnSolicitar);
        article.appendChild(divAcciones);
        contenedor.appendChild(article);
    });
}

// =========================================================================
// PAGINAS 1 Y 2: INDEX.HTML Y REGISTRO-ADMIN.HTML
// =========================================================================
function inicializarIndex() {
    const demoUsuario = document.getElementById("demo-usuario");
    const demoAdmin = document.getElementById("demo-admin");
    const formIngreso = document.getElementById("form-ingreso");

    if (demoUsuario) {
        demoUsuario.addEventListener("click", function (e) {
            e.preventDefault();
            const user = leerStorage("usuarios").filter((u) => u.perfil === "Usuario")[0];
            guardarStorage("usuarioActivo", user);
            window.location.href = "usuario.html";
        });
    }

    if (demoAdmin) {
        demoAdmin.addEventListener("click", function (e) {
            e.preventDefault();
            if (!existeAdmin()) {
                window.location.href = "registro-admin.html";
            } else {
                const admin = leerStorage("usuarios").filter((u) => u.perfil === "Administrador")[0];
                guardarStorage("usuarioActivo", admin);
                window.location.href = "admin.html";
            }
        });
    }

    if (formIngreso) {
        formIngreso.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const clave = document.getElementById("clave").value;
            const msgError = document.getElementById("mensaje-ingreso");

            if (!REGEX_EMAIL.test(email)) {
                msgError.innerHTML = "Ingresá un correo electrónico válido.";
                return;
            }

            const usuarios = leerStorage("usuarios");
            const encontrados = usuarios.filter((u) => u.email.toLowerCase() === email);

            if (encontrados.length > 0) {
                if (encontrados[0].clave !== clave) {
                    msgError.innerHTML = "Contraseña incorrecta.";
                    return;
                }
                guardarStorage("usuarioActivo", encontrados[0]);
                window.location.href = encontrados[0].perfil === "Administrador" ? "admin.html" : "usuario.html";
            } else {
                const base = email.substring(0, email.indexOf("@"));
                const nuevo = {
                    nombre: base.charAt(0).toUpperCase() + base.substring(1),
                    email: email,
                    clave: clave,
                    perfil: "Usuario",
                    fechaRegistro: "2026-11-19"
                };
                usuarios.push(nuevo);
                guardarStorage("usuarios", usuarios);
                guardarStorage("usuarioActivo", nuevo);
                window.location.href = "usuario.html";
            }
        });
    }
}

function inicializarRegistroAdmin() {
    const formAdmin = document.getElementById("form-registro-admin");
    if (!formAdmin) return;

    formAdmin.addEventListener("submit", function (e) {
        e.preventDefault();
        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const clave = document.getElementById("clave").value;
        const clave2 = document.getElementById("clave2").value;
        const mensaje = document.getElementById("mensaje-admin");

        if (nombre.length < 3) { mensaje.innerHTML = "El nombre debe tener al menos 3 caracteres."; return; }
        if (!REGEX_EMAIL.test(email)) { mensaje.innerHTML = "El formato del correo electrónico no es válido."; return; }
        if (clave.length < 4) { mensaje.innerHTML = "La contraseña debe tener al menos 4 caracteres."; return; }
        if (clave !== clave2) { mensaje.innerHTML = "Las contraseñas no coinciden."; return; }

        const usuarios = leerStorage("usuarios");
        const nuevoAdmin = { nombre: nombre, email: email, clave: clave, perfil: "Administrador", fechaRegistro: "2026-11-19" };
        usuarios.push(nuevoAdmin);
        guardarStorage("usuarios", usuarios);
        guardarStorage("usuarioActivo", nuevoAdmin);
        window.location.href = "admin.html";
    });
}

// =========================================================================
// PAGINAS 3 Y 4: CATALOGO USUARIO Y MI-CUENTA.HTML
// =========================================================================
function filtrarMascotas() {
    const input = document.getElementById("buscador-mascotas");
    const select = document.getElementById("filtro-especie");
    const texto = input ? input.value.trim().toLowerCase() : "";
    const especie = select ? select.value.toLowerCase() : "todos";

    return leerStorage("mascotas").filter((m) =>
        (texto === "" || m.nombre.toLowerCase().indexOf(texto) > -1 || m.descripcion.toLowerCase().indexOf(texto) > -1) &&
        (especie === "todos" || m.especie.toLowerCase() === especie)
    );
}

function inicializarCatalogoUsuario() {
    const contenedor = document.getElementById("listado-mascotas");
    if (!contenedor) return;

    const btnTarjetas = document.getElementById("btn-vista-tarjetas");
    const btnLista = document.getElementById("btn-vista-lista");
    if (window.location.pathname.indexOf("usuario-lista.html") > -1) localStorage.setItem("vistaMascotas", "lista");

    function aplicarVista(vista) {
        localStorage.setItem("vistaMascotas", vista);
        contenedor.className = vista;
        if (btnLista && btnTarjetas) {
            if (vista === "lista") { btnLista.classList.add("activo"); btnTarjetas.classList.remove("activo"); }
            else { btnTarjetas.classList.add("activo"); btnLista.classList.remove("activo"); }
        }
        renderizarMascotas(contenedor, filtrarMascotas(), vista, false);
    }

    if (btnTarjetas) btnTarjetas.addEventListener("click", (e) => { e.preventDefault(); aplicarVista("tarjetas"); });
    if (btnLista) btnLista.addEventListener("click", (e) => { e.preventDefault(); aplicarVista("lista"); });

    const buscador = document.getElementById("buscador-mascotas");
    const filtro = document.getElementById("filtro-especie");
    if (buscador) 
        buscador.addEventListener("keyup", () => aplicarVista(localStorage.getItem("vistaMascotas") || "tarjetas"));
    if (filtro) 
        filtro.addEventListener("change", () => aplicarVista(localStorage.getItem("vistaMascotas") || "tarjetas"));

    aplicarVista(localStorage.getItem("vistaMascotas") || "tarjetas");
}

function cargarPaginaMiCuenta() {
    const contenedorFav = document.getElementById("contenedor-favoritos");
    if (!contenedorFav) return;

    const usuario = JSON.parse(localStorage.getItem("usuarioActivo")) || leerStorage("usuarios")[0];
    if (usuario) {
        document.getElementById("perfil-nombre").innerHTML = usuario.nombre;
        document.getElementById("perfil-correo").innerHTML = usuario.email;
        document.getElementById("perfil-rol").innerHTML = usuario.perfil;
        document.getElementById("perfil-fecha").innerHTML = usuario.fechaRegistro || "2026-03-15";
    }

    const favIds = leerStorage("favoritos");
    const favoritas = leerStorage("mascotas").filter((m) => favIds.indexOf(m.id) > -1);
    document.getElementById("titulo-favoritos").innerHTML = `Mis favoritos (${favoritas.length})`;
    renderizarMascotas(contenedorFav, favoritas, "tarjetas", true);
}

// =========================================================================
// PAGINAS 5 Y 6: SOLICITUDES.HTML Y ADMIN.HTML
// =========================================================================
function inicializarSolicitudes() {
    const tbody = document.getElementById("tabla-solicitudes-body");
    if (!tbody) return;

    function dibujarTabla() {
        limpiarContenedor(tbody);
        const ids = leerStorage("solicitudes");
        const solicitadas = leerStorage("mascotas").filter((m) => ids.indexOf(m.id) > -1);
        document.getElementById("total-solicitudes").innerHTML = `Total de solicitudes: ${solicitadas.length}`;
        actualizarNavegacion();

        if (solicitadas.length === 0) {
            const tr = document.createElement("tr");
            const td = crearNodo("td", "", "Todavía no agregaste mascotas a tu solicitud.");
            td.colSpan = 4;
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        solicitadas.forEach((m) => {
            const tr = document.createElement("tr");
            const tdFoto = document.createElement("td");
            const img = document.createElement("img");
            img.src = m.foto || "img/luna.jpg";
            img.alt = m.alt || m.nombre;
            tdFoto.appendChild(img);

            const tdAccion = document.createElement("td");
            const btnQuitar = crearNodo("button", "secundario", "Quitar");
            btnQuitar.type = "button";
            btnQuitar.addEventListener("click", function () {
                guardarStorage("solicitudes", leerStorage("solicitudes").filter((id) => id !== m.id));
                dibujarTabla();
            });
            tdAccion.appendChild(btnQuitar);

            tr.appendChild(tdFoto);
            tr.appendChild(crearNodo("td", "", m.nombre));
            tr.appendChild(crearNodo("td", "", m.especie));
            tr.appendChild(tdAccion);
            tbody.appendChild(tr);
        });
    }

    const formSolicitud = document.getElementById("form-enviar-solicitud");
    if (formSolicitud) {
        formSolicitud.addEventListener("submit", function (e) {
            e.preventDefault();
            const msg = document.getElementById("mensaje-solicitud");
            const ids = leerStorage("solicitudes");
            if (ids.length === 0) { msg.innerHTML = "Agregá al menos una mascota antes de enviar la solicitud."; return; }

            const tel = document.getElementById("telefono").value.trim();
            if (!/^[0-9\s\-\+]{7,20}$/.test(tel)) { msg.innerHTML = "Ingresá un teléfono de contacto válido (solo números, mínimo 7 dígitos)."; return; }

            const mascotas = leerStorage("mascotas");
            mascotas.forEach((m) => { if (ids.indexOf(m.id) > -1) m.estado = "En proceso"; });
            guardarStorage("mascotas", mascotas);
            guardarStorage("solicitudes", []);
            formSolicitud.reset();
            dibujarTabla();
            msg.innerHTML = "¡Solicitud enviada con éxito! Nos comunicaremos a la brevedad.";
        });
    }

    dibujarTabla();
}

function inicializarAdmin() {
    const tbody = document.getElementById("tabla-admin-body");
    if (!tbody) return;

    function dibujarTabla() {
        limpiarContenedor(tbody);
        const mascotas = leerStorage("mascotas");
        document.getElementById("total-admin").innerHTML = `Total: ${mascotas.length} mascotas`;

        mascotas.forEach((m) => {
            const tr = document.createElement("tr");
            const tdEstado = document.createElement("td");
            const spanEstado = crearNodo("span", m.estado === "Disponible" ? "etiqueta estado-disponible" : "etiqueta estado-proceso", m.estado);
            spanEstado.style.cursor = "pointer";
            spanEstado.title = "Click para cambiar estado";
            spanEstado.addEventListener("click", function () {
                m.estado = m.estado === "Disponible" ? "En proceso" : "Disponible";
                guardarStorage("mascotas", mascotas);
                dibujarTabla();
            });
            tdEstado.appendChild(spanEstado);

            const tdAccion = document.createElement("td");
            const btnEliminar = crearNodo("button", "secundario", "Eliminar");
            btnEliminar.type = "button";
            btnEliminar.addEventListener("click", function () {
                guardarStorage("mascotas", leerStorage("mascotas").filter((item) => item.id !== m.id));
                dibujarTabla();
            });
            tdAccion.appendChild(btnEliminar);

            tr.appendChild(crearNodo("td", "", m.nombre));
            tr.appendChild(crearNodo("td", "", m.especie));
            tr.appendChild(crearNodo("td", "", m.edad));
            tr.appendChild(tdEstado);
            tr.appendChild(tdAccion);
            tbody.appendChild(tr);
        });
    }

    const formAlta = document.getElementById("form-alta-mascota");
    if (formAlta) {
        formAlta.addEventListener("submit", function (e) {
            e.preventDefault();
            const nombre = document.getElementById("nombre").value.trim();
            const especieR = document.querySelector('input[name="especie"]:checked');
            const sexoR = document.querySelector('input[name="sexo"]:checked');
            const tamanioR = document.querySelector('input[name="tamanio"]:checked');
            const msg = document.getElementById("mensaje-alta");

            if (nombre === "" || !especieR || !sexoR || !tamanioR) { msg.innerHTML = "Completá nombre, especie, sexo y tamaño."; return; }

            const cap = (t) => t.charAt(0).toUpperCase() + t.substring(1);
            const edadNum = document.getElementById("edad").value.trim();
            const vac = document.querySelector('input[name="vacunado"]').checked;
            const cas = document.querySelector('input[name="castrado"]').checked;
            const salud = vac && cas ? " Vacunado y castrado." : vac ? " Vacunado." : cas ? " Castrado." : "";

            const mascotas = leerStorage("mascotas");
            mascotas.push({
                id: "mascota-" + Date.now(),
                nombre: nombre,
                especie: cap(especieR.value),
                edad: edadNum !== "" ? `${edadNum} ${parseInt(edadNum) === 1 ? "año" : "años"}` : "Sin especificar",
                sexo: cap(sexoR.value),
                tamanio: tamanioR.value === "pequeno" ? "Pequeño" : cap(tamanioR.value),
                descripcion: (document.getElementById("descripcion").value.trim() || "Mascota rescatada lista para encontrar hogar.") + salud,
                foto: document.getElementById("foto").value.trim() || "img/luna.jpg",
                alt: nombre,
                estado: "Disponible"
            });

            guardarStorage("mascotas", mascotas);
            formAlta.reset();
            msg.innerHTML = `Mascota "${nombre}" agregada correctamente.`;
            dibujarTabla();
        });
    }

    dibujarTabla();
}

// =========================================================================
// EVENTO LOAD: ARRANQUE DE LA APLICACION
// =========================================================================
window.addEventListener("load", function () {
    inicializarStorage();
    configurarTema();
    actualizarNavegacion();
    inicializarIndex();
    inicializarRegistroAdmin();
    inicializarCatalogoUsuario();
    cargarPaginaMiCuenta();
    inicializarSolicitudes();
    inicializarAdmin();
});