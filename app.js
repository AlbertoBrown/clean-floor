const TAREAS = ["Salón", "Cocina", "Baños", "Libre"];
const CUADRANTE = [
  ["Alberto", "Irene", "Víctor", "Murci"],
  ["Murci", "Alberto", "Irene", "Víctor"],
  ["Víctor", "Murci", "Alberto", "Irene"],
  ["Irene", "Víctor", "Murci", "Alberto"]
];

const BASE_DATE_ISO = "2025-09-29";

function norm(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function semanasEntre(base, fecha) {
  const msSemana = 1000 * 60 * 60 * 24 * 7;
  return Math.floor((fecha - base) / msSemana);
}

function parseDateOrNull(value) {
  if (!value) return null;
  const parsed = new Date(value + "T00:00:00");
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function semanaISO(fecha) {
  const target = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const dayNr = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNr);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
}

function setResultado(html, state = "info") {
  const panel = document.getElementById("resultado");
  panel.innerHTML = html;
  panel.dataset.state = state;
}

function calcularTurno() {
  const nombre = document.getElementById("nombre").value;
  const fechaStr = document.getElementById("fecha").value;
  const anchorToggle = document.getElementById("anchor-toggle");
  const anchorStr = document.getElementById("anchor").value;

  if (!nombre || !fechaStr) {
    setResultado("<strong>⚠️ Debes introducir un nombre y una fecha.</strong>", "warning");
    return;
  }

  const fecha = parseDateOrNull(fechaStr);
  if (!fecha) {
    setResultado("<strong>❌ Fecha inválida.</strong>", "error");
    return;
  }

  let base = parseDateOrNull(BASE_DATE_ISO);

  if (anchorToggle.checked) {
    const anclada = parseDateOrNull(anchorStr);
    if (!anclada) {
      setResultado("<strong>⚠️ Activas el anclaje pero la fecha es inválida.</strong>", "warning");
      return;
    }
    base = anclada;
  }

  const semanasPasadas = semanasEntre(base, fecha);
  const idxSemana = ((semanasPasadas % 4) + 4) % 4;
  const ciclo = idxSemana + 1;

  let tarea = null;
  let nombreOficial = null;
  const nombreNormalizado = norm(nombre);
  for (let j = 0; j < TAREAS.length; j++) {
    const candidato = CUADRANTE[idxSemana][j];
    if (norm(candidato) === nombreNormalizado) {
      tarea = TAREAS[j];
      nombreOficial = candidato;
      break;
    }
  }

  const fechaLarga = fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const fechaISO = fecha.toISOString().slice(0, 10);
  const isoWeek = semanaISO(fecha);

  let html = `<div class="pill accent">Semana ${ciclo} / 4</div>`;
  html += `<p><strong>Fecha:</strong> ${fechaLarga.charAt(0).toUpperCase() + fechaLarga.slice(1)}</p>`;
  html += `<p><strong>Fecha ISO:</strong> ${fechaISO}</p>`;
  html += `<p><strong>Semana ISO:</strong> ${isoWeek}</p>`;

  const baseIso = base.toISOString().slice(0, 10);
  const baseHuman = base.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  html += `<p><strong>Semana 1 anclada:</strong> ${baseHuman.charAt(0).toUpperCase() + baseHuman.slice(1)} <span class="pill">${baseIso}</span></p>`;

  if (tarea) {
    const nombreMostrar = nombreOficial ?? nombre;
    html += `<p>✅ A <strong>${nombreMostrar}</strong> le corresponde: <strong>${tarea}</strong>.</p>`;
    setResultado(html, "success");
  } else {
    html += `<p>❓ Nombre no encontrado. Usa: Alberto, Irene, Víctor o Murci.</p>`;
    setResultado(html, "warning");
  }
}
