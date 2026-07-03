# Mundial 2026 — Cuadro de eliminación (React)

App en React + Vite. Cuadro tipo nodo con líneas conectoras SVG; al elegir un
ganador en un partido, avanza automáticamente al siguiente y el cuadro hace
scroll hacia la ronda activa.

## Desarrollo local

```bash
npm install
npm run dev
```

## Desplegar en GitHub Pages

**Antes de nada**, en `vite.config.js` y `package.json` reemplazá
`mundial-bracket` / `TU-USUARIO` por el nombre real de tu repo y tu usuario
de GitHub. Si el repo tiene otro nombre y no cambiás `base` en
`vite.config.js`, la página va a cargar en blanco.

### Opción A — con el paquete `gh-pages` (más simple)

```bash
git init
git add .
git commit -m "Cuadro Mundial 2026"
git remote add origin https://github.com/TU-USUARIO/mundial-bracket.git
git push -u origin main

npm run deploy
```

Esto publica la carpeta `dist/` en la rama `gh-pages`. Luego, en GitHub:
Settings → Pages → Source → elegí la rama `gh-pages`.

### Opción B — con GitHub Actions (deploy automático en cada push)

Ya incluí `.github/workflows/deploy.yml`. Solo necesitás:

1. Subir el repo a GitHub (rama `main`).
2. En Settings → Pages → Source, elegir **GitHub Actions**.
3. Cada `git push` a `main` compila y publica solo.

## Datos del bracket

Todo el torneo (equipos, fechas, quién alimenta a quién) vive en
`src/data.js`. Las banderas se cargan desde flagcdn.com usando el código
ISO de cada país (por ejemplo `gb-eng` para Inglaterra).
