"""Ensambla frames + narración + subtítulos en el MP4 final."""
import json, re, subprocess, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/vid/tutorial.mp4"
T = json.load(open("/tmp/vid/timeline.json"))
beats = {b["id"]: b for b in json.load(open("/tmp/vid/narration.json"))}
t0, tEnd = T["t0"], T["tEnd"]
total = tEnd - t0

# ---------------------------------------------------------------- video
frames = sorted(T["frames"], key=lambda f: f["t"])
pre = [f for f in frames if f["t"] <= t0]
post = [f for f in frames if f["t"] > t0]
seq = ([pre[-1]] if pre else []) + post
with open("/tmp/vid/frames.txt", "w") as fh:
    for i, f in enumerate(seq):
        start = max(f["t"], t0)
        nxt = seq[i + 1]["t"] if i + 1 < len(seq) else tEnd
        d = max(nxt - start, 0.001)
        fh.write(f"file '{f['f']}'\nduration {d:.4f}\n")
    fh.write(f"file '{seq[-1]['f']}'\n")

# ---------------------------------------------------------------- audio
tl = T["timeline"]
inputs, filters = [], []
for i, b in enumerate(tl):
    inputs += ["-i", f"/tmp/vid/audio/{b['id']}.wav"]
    ms = int(b["start"] * 1000 + 120)
    filters.append(f"[{i}:a]aresample=48000,adelay={ms}|{ms}[a{i}]")
mix = "".join(f"[a{i}]" for i in range(len(tl)))
filters.append(f"{mix}amix=inputs={len(tl)}:normalize=0:dropout_transition=0,apad,atrim=0:{total:.3f},"
               f"highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=11[out]")
subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(filters),
                "-map", "[out]", "-ac", "2", "-ar", "48000", "/tmp/vid/narration.wav"], check=True)

# ---------------------------------------------------------------- subtítulos
def chunks(text, maxlen=95):
    parts = re.split(r"(?<=[.!?…:;])\s+", text.strip())
    out = []
    for p in parts:
        while len(p) > maxlen:
            cut = p.rfind(", ", 0, maxlen)
            cut = cut + 1 if cut > 30 else (p.rfind(" ", 0, maxlen))
            out.append(p[:cut].strip()); p = p[cut:].strip()
        if p:
            if out and len(out[-1]) + len(p) < 60 and not out[-1].endswith((".", ":", "?")):
                out[-1] += " " + p
            else:
                out.append(p)
    return out

def ts(s):
    h = int(s // 3600); m = int(s % 3600 // 60); sec = s % 60
    return f"{h}:{m:02d}:{sec:05.2f}"

ass = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1920", "PlayResY: 1080", "WrapStyle: 0", "",
       "[V4+ Styles]",
       "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
       "Style: Sub,Liberation Sans,42,&H00FFFFFF,&H00FFFFFF,&H28141210,&H28141210,-1,0,0,0,100,100,0,0,3,14,0,2,220,220,46,1",
       "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
for b in tl:
    cs = chunks(beats[b["id"]]["sub"])
    start = b["start"] + 0.12
    dur = b["dur"]
    weights = [len(c) + 8 for c in cs]
    acc = start
    for c, w in zip(cs, weights):
        d = dur * w / sum(weights)
        ass.append(f"Dialogue: 0,{ts(acc)},{ts(acc + d - 0.04)},Sub,,0,0,0,,{c}")
        acc += d
open("/tmp/vid/subs.ass", "w").write("\n".join(ass) + "\n")

# ---------------------------------------------------------------- final
subprocess.run(["ffmpeg", "-y", "-v", "error", "-stats", "-f", "concat", "-safe", "0", "-i", "/tmp/vid/frames.txt",
                "-i", "/tmp/vid/narration.wav",
                "-vf", "scale=1920:1080:flags=lanczos,fps=30,format=yuv420p,ass=/tmp/vid/subs.ass",
                "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-tune", "stillimage",
                "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-t", f"{total:.3f}", OUT], check=True)
print("OK", OUT, round(total, 1), "s")
