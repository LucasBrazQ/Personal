#!/usr/bin/env python3
"""Build the Matchnode + PilatesAnytime co-branded logo lockup.

Reads the official vector logos from ``src/`` and writes the composed lockup
(SVG plus PNG exports) to ``dist/``.

The lockup follows the layout Matchnode uses for client co-branding: the
Matchnode "M" node mark, a vertical slate rule, then the client logo, all
optically centred on a shared horizontal axis.

Usage:
    python3 build.py
"""

from __future__ import annotations

import io
import re
from dataclasses import dataclass
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
DIST = ROOT / "dist"

# --- Layout spec -------------------------------------------------------------
# All values are multiples of the Matchnode mark height, so the whole lockup
# scales from a single number.
MARK_HEIGHT = 100.0
RULE_WIDTH = 0.042 * MARK_HEIGHT
RULE_HEIGHT = 1.16 * MARK_HEIGHT
GAP_BEFORE_RULE = 0.16 * MARK_HEIGHT
GAP_AFTER_RULE = 0.24 * MARK_HEIGHT
CLIENT_HEIGHT = 0.86 * MARK_HEIGHT
PADDING = 0.06 * MARK_HEIGHT

RULE_COLOR = "#5B6B87"
RULE_COLOR_ON_DARK = "#8E9CB3"

PATH_RE = re.compile(r"<path\b[^>]*/>|<path\b[^>]*>.*?</path>", re.DOTALL)
D_RE = re.compile(r'\bd="([^"]+)"')
FILL_RE = re.compile(r'\bfill="([^"]+)"')
VIEWBOX_RE = re.compile(r'\bviewBox="([^"]+)"')


@dataclass(frozen=True)
class Box:
    x: float
    y: float
    width: float
    height: float

    @property
    def right(self) -> float:
        return self.x + self.width

    @property
    def bottom(self) -> float:
        return self.y + self.height


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def view_box(svg: str) -> Box:
    numbers = [float(n) for n in VIEWBOX_RE.search(svg).group(1).replace(",", " ").split()]
    return Box(*numbers)


def paths(svg: str) -> list[str]:
    return PATH_RE.findall(svg)


def first_x(path_markup: str) -> float:
    """X coordinate of a path's initial moveto, used to tell mark from wordmark."""
    d = D_RE.search(path_markup).group(1)
    return float(re.match(r"\s*[Mm]\s*(-?[\d.]+)", d).group(1))


def normalise_path(path_markup: str) -> str:
    """Re-emit a path with only the attributes the lockup needs."""
    d = D_RE.search(path_markup).group(1)
    fill = FILL_RE.search(path_markup)
    fill_attr = f' fill="{fill.group(1)}"' if fill else ""
    return f'<path d="{d}"{fill_attr}/>'


def tight_box(body: str, box: Box, render_width: int = 3000) -> Box:
    """Measure the inked bounds of SVG markup, in the units of ``box``.

    Source logos carry viewBox padding that would otherwise show up as
    lopsided whitespace once the pieces sit next to each other, so every
    element is measured and positioned by its inked bounds instead.
    """
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="{box.x} {box.y} {box.width} {box.height}">{body}</svg>'
    )
    png = cairosvg.svg2png(bytestring=svg.encode("utf-8"), output_width=render_width)
    with Image.open(io.BytesIO(png)) as image:
        bounds = image.convert("RGBA").getchannel("A").getbbox()
        scale = box.width / image.width
    left, top, right, bottom = bounds
    return Box(
        x=box.x + left * scale,
        y=box.y + top * scale,
        width=(right - left) * scale,
        height=(bottom - top) * scale,
    )


def place(body: str, source: Box, height: float, x: float, centre_y: float) -> str:
    """Scale ``body`` to ``height`` and place it at ``x``, centred on ``centre_y``."""
    scale = height / source.height
    tx = x - source.x * scale
    ty = centre_y - (source.y * scale + height / 2)
    return f'<g transform="translate({tx:.4f} {ty:.4f}) scale({scale:.6f})">{body}</g>'


def scaled_width(source: Box, height: float) -> float:
    return source.width * height / source.height


def extract_matchnode_mark() -> tuple[str, Box]:
    """Pull the node mark out of the full Matchnode logo, dropping the wordmark."""
    svg = read(SRC / "matchnode-logo-full.svg")
    box = view_box(svg)
    mark_paths = [normalise_path(p) for p in paths(svg) if first_x(p) < 50]
    if len(mark_paths) != 13:
        raise SystemExit(f"expected 13 mark paths in the Matchnode logo, found {len(mark_paths)}")
    body = "".join(mark_paths)
    return body, tight_box(body, box)


def write_mark_svg(body: str, box: Box) -> None:
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="{box.x:.4f} {box.y:.4f} {box.width:.4f} {box.height:.4f}" '
        f'width="{box.width:.4f}" height="{box.height:.4f}" '
        'role="img" aria-label="Matchnode">'
        f"{body}</svg>\n"
    )
    (SRC / "matchnode-mark.svg").write_text(svg, encoding="utf-8")


def client_artwork(filename: str) -> tuple[str, Box]:
    svg = read(SRC / filename)
    body = "".join(normalise_path(p) for p in paths(svg))
    fills = {FILL_RE.search(p).group(1) for p in paths(svg) if FILL_RE.search(p)}
    if not body:
        raise SystemExit(f"no paths found in {filename}")
    # The PilatesAnytime files colour their <g> wrapper rather than each path.
    group_fill = re.search(r"<g\b[^>]*\bfill=\"([^\"]+)\"", svg)
    if group_fill and not fills:
        body = f'<g fill="{group_fill.group(1)}">{body}</g>'
    return body, tight_box(body, view_box(svg))


def recolour(body: str, colour: str) -> str:
    body = re.sub(r'\s*fill="[^"]*"', "", body)
    return f'<g fill="{colour}">{body}</g>'


def build_lockup(
    mark_body: str,
    mark_box: Box,
    client_body: str,
    client_box: Box,
    rule_colour: str,
    title: str,
) -> str:
    mark_width = scaled_width(mark_box, MARK_HEIGHT)
    client_width = scaled_width(client_box, CLIENT_HEIGHT)

    content_height = max(MARK_HEIGHT, RULE_HEIGHT, CLIENT_HEIGHT)
    height = content_height + 2 * PADDING
    centre_y = height / 2

    mark_x = PADDING
    rule_x = mark_x + mark_width + GAP_BEFORE_RULE
    client_x = rule_x + RULE_WIDTH + GAP_AFTER_RULE
    width = client_x + client_width + PADDING

    parts = [
        place(mark_body, mark_box, MARK_HEIGHT, mark_x, centre_y),
        (
            f'<rect x="{rule_x:.4f}" y="{centre_y - RULE_HEIGHT / 2:.4f}" '
            f'width="{RULE_WIDTH:.4f}" height="{RULE_HEIGHT:.4f}" fill="{rule_colour}"/>'
        ),
        place(client_body, client_box, CLIENT_HEIGHT, client_x, centre_y),
    ]

    return (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {width:.4f} {height:.4f}" '
        f'width="{width:.4f}" height="{height:.4f}" '
        f'role="img" aria-label="{title}">'
        f"<title>{title}</title>"
        f"{''.join(parts)}"
        "</svg>\n"
    )


def export_png(svg_path: Path, png_path: Path, width: int, background: str | None = None) -> None:
    cairosvg.svg2png(
        url=str(svg_path),
        write_to=str(png_path),
        output_width=width,
        background_color=background,
    )


def main() -> None:
    DIST.mkdir(parents=True, exist_ok=True)

    mark_body, mark_box = extract_matchnode_mark()
    write_mark_svg(mark_body, mark_box)

    client_body, client_box = client_artwork("pilatesanytime-horizontal-black.svg")

    title = "Matchnode and PilatesAnytime"

    light = build_lockup(mark_body, mark_box, client_body, client_box, RULE_COLOR, title)
    light_path = DIST / "matchnode-pilatesanytime-lockup.svg"
    light_path.write_text(light, encoding="utf-8")

    # PilatesAnytime's official white logo is the same geometry recoloured, so the
    # reversed lockup is knocked out of the single source to keep both aligned.
    dark = build_lockup(
        recolour(mark_body, "#FFFFFF"),
        mark_box,
        recolour(client_body, "#FFFFFF"),
        client_box,
        RULE_COLOR_ON_DARK,
        f"{title} (reversed)",
    )
    dark_path = DIST / "matchnode-pilatesanytime-lockup-reversed.svg"
    dark_path.write_text(dark, encoding="utf-8")

    for width in (1200, 2400):
        export_png(light_path, DIST / f"matchnode-pilatesanytime-lockup-{width}w.png", width)
    export_png(
        light_path,
        DIST / "matchnode-pilatesanytime-lockup-2400w-white.png",
        2400,
        background="white",
    )
    export_png(
        dark_path,
        DIST / "matchnode-pilatesanytime-lockup-reversed-2400w.png",
        2400,
    )

    print(f"mark bounds     : {mark_box}")
    print(f"client bounds   : {client_box}")
    print(f"lockup viewBox  : {view_box(light)}")
    for path in sorted(DIST.iterdir()):
        print(f"  {path.relative_to(ROOT)} ({path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
