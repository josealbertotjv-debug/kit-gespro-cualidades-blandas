# Video tutorial para usuarios (GP-13)

Publicado en: https://josealbertotjv-debug.github.io/kit-gespro-cualidades-blandas/tutorial/

Cómo regenerarlo cuando cambie la interfaz (trabaja en `/tmp/vid`):

1. App local con datos demo: `PORT=4600 SQLITE_PATH=/tmp/vid/demo.db SEED_DEMO_DATA=true node src/server.mjs`
2. Voz (Piper TTS sin conexión, voz `es_MX-claude-high`): `python gen_tts.py`. Lee `narration.json` (`say` = texto hablado, `sub` = subtítulo).
3. Grabación (Playwright + Chromium, captura CDP a 1920×1080): `node record.mjs`
4. Montaje (ffmpeg: voz + subtítulos incrustados): `python build.py salida.mp4`
