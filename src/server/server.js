const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 3000;

app.use(express.json(), cors());

// Cargar eventos de cards.json (y acceder al array)
let eventos = require("../data/cards.json");
eventos = eventos.cards;

// Ruta al archivo cards.json
const cardsPath = path.join(__dirname, "../data/cards.json");

// Función para obtener el siguiente ID disponible
const obtenerSiguienteId = () => {
    return eventos[eventos.length - 1].id +1;
}

let siguienteId = obtenerSiguienteId();

// ============ FUNCIONES AUXILIARES ============

    // Función para validar formato ISO 8601
    const validarFechaISO = (dateTime) => {
        // Expresión regular para formato ISO 8601: YYYY-MM-DDTHH:mm:ssZ o YYYY-MM-DDTHH:mm:ss.sssZ
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

        if (!isoRegex.test(dateTime)) {
            return false;
        }

        // Verificar que sea una fecha válida
        const fecha = new Date(dateTime);
        return !isNaN(fecha.getTime());
    };

// ============ RUTAS CRUD ============

    // READ - Obtener todos los eventos
    app.get("/api/eventos", (req, res) => {
        res.json(eventos);
    });

    // READ - Obtener evento por ID
    app.get("/api/eventos/:id", (req, res) => {
        const id = parseInt(req.params.id);
        const evento = eventos.find((e) => e.id === id);

        if (!evento) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }

        res.json(evento);
    });

    
    // CREATE - Crear un nuevo evento
    app.post("/api/eventos", (req, res) => {
        const { title, category, description, imgURL, dateTime } = req.body;

        if (!title) {
            return res.status(400).json({ error: "El título es obligatorio" });
        }
        if (!category) {
            return res.status(400).json({ error: "La categoría es obligatoria" })
        }
        if (!dateTime) {
            return res.status(400).json({ error: "La fecha y hora son obligatorias" });
        }
        if (!validarFechaISO(dateTime)) {
            return res.status(400).json({
                error: "Formato de fecha inválido. Use formato ISO 8601: YYYY-MM-DDTHH:mm:ssZ (ejemplo: 2025-10-16T10:00:00Z)",
            });
        }

        const nuevoEvento = {
            id: siguienteId++,
            title,
            category,
            description: description || "",
            imgURL: imgURL || "",
            dateTime
        };

        // Reflejar cambios en cards.json
        fs.readFile(cardsPath, "utf8", (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Error al leer el archivo JSON" });
            }

            let json;
            try {
                json = JSON.parse(data);
            } catch (parseErr) {
                return res.status(500).json({ error: "Error al parsear el archivo JSON" });
            }

            if (!json.cards) json.cards = [];
            json.cards.push(nuevoEvento);  // Cambios en JSON
            eventos.push(nuevoEvento);  // Cambios en HTML

            fs.writeFile(cardsPath, JSON.stringify(json, null, 2), (writeErr) => {
                if (writeErr) {
                    return res.status(500).json({ error: "Error al guardar el evento en el archivo JSON" });
                }
                res.status(201).json(nuevoEvento);
            });
        });
    });

    // UPDATE - Actualizar un evento existente
    app.put("/api/eventos/:id", (req, res) => {
        const id = parseInt(req.params.id);
        const { title, category, description, imgURL, dateTime } = req.body;

        const i = eventos.findIndex((e) => e.id === id);

        if (i === -1) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }

        if (dateTime !== undefined && !validarFechaISO(dateTime)) {
            return res.status(400).json({
                error: "Formato de fecha inválido. El formato requerido es ISO 8601: YYYY-MM-DDTHH:mm:ssZ",
            });
        }

        // Actualizar campos
        if (title !== undefined) eventos[i].title = title;
        if (category !== undefined) eventos[i].category = category;
        if (description !== undefined) eventos[i].description = description;
        if (imgURL !== undefined) eventos[i].imgURL = imgURL;
        if (dateTime !== undefined) eventos[i].dateTime = dateTime;

        // Reflejar cambios en cards.json
        const jsonActualizado = { cards: eventos };
        fs.writeFile(cardsPath, JSON.stringify(jsonActualizado, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: "Error al guardar los cambios en el archivo JSON" });
            }
            res.json(eventos[i]);  // Cambios en HTML
        });
    });

    // DELETE - Eliminar un evento
    app.delete("/api/eventos/:id", (req, res) => {
        const id = parseInt(req.params.id);
        const i = eventos.findIndex((e) => e.id === id);

        if (i === -1) {
            return res.status(404).json({ error: "Evento no encontrado" });
        }

        const eventoEliminado = eventos.splice(i, 1)[0];

        // Reflejar cambios en cards.json
        const jsonActualizado = { cards: eventos };
        fs.writeFile(cardsPath, JSON.stringify(jsonActualizado, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: "Error al guardar los cambios en el archivo JSON" });
            }
            res.json({ mensaje: "Evento eliminado", evento: eventoEliminado });
        });
    });

// ============ INICIAR SERVIDOR ============
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log("\nPrueba estas rutas:");
    console.log("GET    /api/eventos      - Ver todos los eventos");
    console.log("GET    /api/eventos/:id  - Ver un evento");
    console.log("POST   /api/eventos      - Crear evento");
    console.log("PUT    /api/eventos/:id  - Actualizar evento");
    console.log("DELETE /api/eventos/:id  - Eliminar evento");
});
