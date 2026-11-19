import json, subprocess, sys

MODEL = "/tmp/vid/voices/es_MX-claude-high.onnx"
beats = json.load(open("/tmp/vid/narration.json"))
out = {}
for b in beats:
    wav = f"/tmp/vid/audio/{b['id']}.wav"
    subprocess.run(["/tmp/vid/venv/bin/piper", "-m", MODEL, "-f", wav, "--length-scale", "0.97",
                    "--sentence-silence", "0.25"], input=b["say"].encode(), check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                       "-of", "csv=p=0", wav]).strip())
    out[b["id"]] = d
    print(b["id"], round(d, 2))
json.dump(out, open("/tmp/vid/audio/durations.json", "w"), indent=1)
print("TOTAL", round(sum(out.values()), 1))
