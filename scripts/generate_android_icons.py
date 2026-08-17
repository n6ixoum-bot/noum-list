from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "icon.png"
SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}


def main() -> None:
    image = Image.open(SOURCE).convert("RGBA")
    for folder, size in SIZES.items():
        target_dir = ROOT / "android" / "app" / "src" / "main" / "res" / folder
        target_dir.mkdir(parents=True, exist_ok=True)
        resized = image.resize((size, size), Image.Resampling.LANCZOS)
        for name in ("ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"):
            resized.save(target_dir / name, format="PNG", optimize=True)


if __name__ == "__main__":
    main()
