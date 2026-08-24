#!/usr/bin/env python3
"""Create a co-branded Matchnode + client logo image."""

from __future__ import annotations

import argparse
from pathlib import Path

import cairosvg
from PIL import Image, ImageDraw


def trim_transparent(image: Image.Image) -> Image.Image:
    bbox = image.getbbox()
    if bbox is None:
        return image
    return image.crop(bbox)


def resize_to_height(image: Image.Image, height: int) -> Image.Image:
    width = max(1, round(image.width * height / image.height))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def load_logo(path: Path, height: int) -> Image.Image:
    if path.suffix.lower() == ".svg":
        png_bytes = cairosvg.svg2png(
            url=str(path),
            output_width=max(800, height * 8),
        )
        image = Image.open(__import__("io").BytesIO(png_bytes)).convert("RGBA")
    else:
        image = Image.open(path).convert("RGBA")
    image = trim_transparent(image)
    return resize_to_height(image, height)


def create_combined_logo(
    matchnode_path: Path,
    client_path: Path,
    output_path: Path,
    *,
    logo_height: int = 72,
    gap: int = 28,
    divider_width: int = 2,
    divider_color: tuple[int, int, int, int] = (120, 120, 120, 255),
    divider_extra_height: int = 8,
    padding_x: int = 24,
    padding_y: int = 20,
    background: tuple[int, int, int, int] = (0, 0, 0, 255),
) -> Path:
    matchnode = load_logo(matchnode_path, logo_height)
    client = load_logo(client_path, logo_height)

    divider_height = logo_height + divider_extra_height
    content_width = matchnode.width + gap + divider_width + gap + client.width
    content_height = max(matchnode.height, client.height, divider_height)

    canvas_width = content_width + (padding_x * 2)
    canvas_height = content_height + (padding_y * 2)
    canvas = Image.new("RGBA", (canvas_width, canvas_height), background)

    matchnode_x = padding_x
    matchnode_y = padding_y + (content_height - matchnode.height) // 2
    canvas.alpha_composite(matchnode, (matchnode_x, matchnode_y))

    divider_x = matchnode_x + matchnode.width + gap
    divider_y = padding_y + (content_height - divider_height) // 2
    draw = ImageDraw.Draw(canvas)
    draw.rectangle(
        [
            divider_x,
            divider_y,
            divider_x + divider_width - 1,
            divider_y + divider_height,
        ],
        fill=divider_color,
    )

    client_x = divider_x + divider_width + gap
    client_y = padding_y + (content_height - client.height) // 2
    canvas.alpha_composite(client, (client_x, client_y))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path, format="PNG")
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--matchnode",
        type=Path,
        default=Path("pilates_anytime/assets/matchnode-logo.png"),
    )
    parser.add_argument(
        "--client",
        type=Path,
        default=Path("pilates_anytime/assets/pilates-anytime-logo.svg"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("pilates_anytime/assets/matchnode-pilates-anytime-combined.png"),
    )
    parser.add_argument("--logo-height", type=int, default=72)
    args = parser.parse_args()

    output = create_combined_logo(
        args.matchnode,
        args.client,
        args.output,
        logo_height=args.logo_height,
    )
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
