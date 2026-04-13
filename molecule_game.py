"""
Molecule Master — a chemistry practice game.

Displays a 2D structure of a molecule fetched from the PubChem PUG REST API
and asks the player to name it. Difficulty (and points) increase as the
player answers correctly. The Hint button pulls a short description from a
secondary API (Wikipedia REST) and redacts the molecule name from it.

Dependencies: requests, Pillow (PIL), tkinter (stdlib)
    pip install requests Pillow

Run:
    python3 molecule_game.py
"""

from __future__ import annotations

import io
import re
import random
import threading
import tkinter as tk
import urllib.parse
from tkinter import font as tkfont
from typing import Callable, Optional

import requests
from PIL import Image, ImageChops, ImageDraw, ImageTk


# --------------------------------------------------------------------------- #
# Molecule data                                                               #
# --------------------------------------------------------------------------- #
#
# Each molecule is a dict with:
#   cid     : PubChem Compound ID (used to fetch the structure image)
#   answers : set of accepted lowercase answers
#   formula : molecular formula shown in feedback / hints
#   display : the "official" name used in feedback
#   wiki    : Wikipedia page title for the secondary-API hint lookup

MOLECULES: dict[int, list[dict]] = {
    1: [
        {"cid": 962,  "display": "Water",            "wiki": "Water",
         "answers": {"water", "h2o", "dihydrogen monoxide"},
         "formula": "H\u2082O"},
        {"cid": 297,  "display": "Methane",          "wiki": "Methane",
         "answers": {"methane", "ch4"},
         "formula": "CH\u2084"},
        {"cid": 222,  "display": "Ammonia",          "wiki": "Ammonia",
         "answers": {"ammonia", "nh3", "azane"},
         "formula": "NH\u2083"},
        {"cid": 280,  "display": "Carbon dioxide",   "wiki": "Carbon_dioxide",
         "answers": {"carbon dioxide", "co2"},
         "formula": "CO\u2082"},
        {"cid": 784,  "display": "Hydrogen peroxide","wiki": "Hydrogen_peroxide",
         "answers": {"hydrogen peroxide", "h2o2"},
         "formula": "H\u2082O\u2082"},
        {"cid": 947,  "display": "Nitrogen",         "wiki": "Nitrogen",
         "answers": {"nitrogen", "n2", "dinitrogen"},
         "formula": "N\u2082"},
    ],
    2: [
        {"cid": 702,  "display": "Ethanol",          "wiki": "Ethanol",
         "answers": {"ethanol", "ethyl alcohol", "c2h5oh", "c2h6o"},
         "formula": "C\u2082H\u2086O"},
        {"cid": 887,  "display": "Methanol",         "wiki": "Methanol",
         "answers": {"methanol", "methyl alcohol", "ch3oh", "ch4o"},
         "formula": "CH\u2084O"},
        {"cid": 176,  "display": "Acetic acid",      "wiki": "Acetic_acid",
         "answers": {"acetic acid", "ethanoic acid", "ch3cooh"},
         "formula": "C\u2082H\u2084O\u2082"},
        {"cid": 241,  "display": "Benzene",          "wiki": "Benzene",
         "answers": {"benzene", "c6h6"},
         "formula": "C\u2086H\u2086"},
        {"cid": 6324, "display": "Ethylene",         "wiki": "Ethylene",
         "answers": {"ethylene", "ethene", "c2h4"},
         "formula": "C\u2082H\u2084"},
        {"cid": 6334, "display": "Propane",          "wiki": "Propane",
         "answers": {"propane", "c3h8"},
         "formula": "C\u2083H\u2088"},
    ],
    3: [
        {"cid": 2519, "display": "Caffeine",         "wiki": "Caffeine",
         "answers": {"caffeine"},
         "formula": "C\u2088H\u2081\u2080N\u2084O\u2082"},
        {"cid": 2244, "display": "Aspirin",          "wiki": "Aspirin",
         "answers": {"aspirin", "acetylsalicylic acid"},
         "formula": "C\u2089H\u2088O\u2084"},
        {"cid": 180,  "display": "Acetone",          "wiki": "Acetone",
         "answers": {"acetone", "propanone", "2-propanone", "dimethyl ketone"},
         "formula": "C\u2083H\u2086O"},
        {"cid": 1176, "display": "Urea",             "wiki": "Urea",
         "answers": {"urea", "carbamide"},
         "formula": "CH\u2084N\u2082O"},
        {"cid": 5793, "display": "Glucose",          "wiki": "Glucose",
         "answers": {"glucose", "d-glucose", "dextrose"},
         "formula": "C\u2086H\u2081\u2082O\u2086"},
        {"cid": 311,  "display": "Citric acid",      "wiki": "Citric_acid",
         "answers": {"citric acid"},
         "formula": "C\u2086H\u2088O\u2087"},
    ],
    4: [
        {"cid": 5997, "display": "Cholesterol",      "wiki": "Cholesterol",
         "answers": {"cholesterol"},
         "formula": "C\u2082\u2087H\u2084\u2086O"},
        {"cid": 6013, "display": "Testosterone",     "wiki": "Testosterone",
         "answers": {"testosterone"},
         "formula": "C\u2081\u2089H\u2082\u2088O\u2082"},
        {"cid": 681,  "display": "Dopamine",         "wiki": "Dopamine",
         "answers": {"dopamine"},
         "formula": "C\u2088H\u2081\u2081NO\u2082"},
        {"cid": 5202, "display": "Serotonin",        "wiki": "Serotonin",
         "answers": {"serotonin", "5-ht", "5-hydroxytryptamine"},
         "formula": "C\u2081\u2080H\u2081\u2082N\u2082O"},
        {"cid": 5816, "display": "Adrenaline",       "wiki": "Adrenaline",
         "answers": {"adrenaline", "epinephrine"},
         "formula": "C\u2089H\u2081\u2083NO\u2083"},
        {"cid": 1983, "display": "Acetaminophen",    "wiki": "Paracetamol",
         "answers": {"acetaminophen", "paracetamol", "tylenol"},
         "formula": "C\u2088H\u2089NO\u2082"},
    ],
    5: [
        {"cid": 5904,     "display": "Penicillin G",
         "wiki": "Benzylpenicillin",
         "answers": {"penicillin", "penicillin g", "benzylpenicillin"},
         "formula": "C\u2081\u2086H\u2081\u2088N\u2082O\u2084S"},
        {"cid": 5957,     "display": "ATP (adenosine triphosphate)",
         "wiki": "Adenosine_triphosphate",
         "answers": {"atp", "adenosine triphosphate"},
         "formula": "C\u2081\u2080H\u2081\u2086N\u2085O\u2081\u2083P\u2083"},
        {"cid": 54670067, "display": "Ascorbic acid (vitamin C)",
         "wiki": "Vitamin_C",
         "answers": {"ascorbic acid", "vitamin c", "l-ascorbic acid"},
         "formula": "C\u2086H\u2088O\u2086"},
        {"cid": 3034034,  "display": "Quinine",         "wiki": "Quinine",
         "answers": {"quinine"},
         "formula": "C\u2082\u2080H\u2082\u2084N\u2082O\u2082"},
        {"cid": 6475848,  "display": "Chlorophyll a",   "wiki": "Chlorophyll_a",
         "answers": {"chlorophyll", "chlorophyll a"},
         "formula": "C\u2085\u2085H\u2087\u2082MgN\u2084O\u2085"},
        {"cid": 5280343,  "display": "Quercetin",       "wiki": "Quercetin",
         "answers": {"quercetin"},
         "formula": "C\u2081\u2085H\u2081\u2080O\u2087"},
    ],
}

MAX_LEVEL = max(MOLECULES)
CORRECT_PER_LEVEL = 3          # correct answers needed to advance a level
POINTS_PER_LEVEL = 10          # points per correct = level * POINTS_PER_LEVEL

# --------------------------------------------------------------------------- #
# Visual palette                                                              #
# --------------------------------------------------------------------------- #

BG_TOP      = "#0b1026"
BG_BOTTOM   = "#1a2250"
CARD_BG     = "#111a3a"
CARD_BORDER = "#2b3a7a"
TEXT_MAIN   = "#e8ecff"
TEXT_DIM    = "#8b94c9"
ACCENT      = "#22d3ee"     # cyan
ACCENT_DARK = "#0891b2"
GOOD        = "#34d399"     # emerald
BAD         = "#f87171"     # red
GOLD        = "#fbbf24"
PURPLE      = "#a78bfa"

PUBCHEM_PNG_URL = (
    "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/PNG"
    "?image_size=large"
)
WIKI_SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
WIKI_UA = "MoleculeMaster/1.0 (educational chemistry practice game)"

WINDOW_W = 980
WINDOW_H = 780


# --------------------------------------------------------------------------- #
# Drawing helpers                                                             #
# --------------------------------------------------------------------------- #

def _interp(c1: str, c2: str, t: float) -> str:
    """Linearly interpolate between two hex colors."""
    r1, g1, b1 = int(c1[1:3], 16), int(c1[3:5], 16), int(c1[5:7], 16)
    r2, g2, b2 = int(c2[1:3], 16), int(c2[3:5], 16), int(c2[5:7], 16)
    r = int(r1 + (r2 - r1) * t)
    g = int(g1 + (g2 - g1) * t)
    b = int(b1 + (b2 - b1) * t)
    return f"#{r:02x}{g:02x}{b:02x}"


def draw_vertical_gradient(canvas: tk.Canvas, w: int, h: int,
                           top: str, bottom: str, tag: str = "bg") -> None:
    """Paint a vertical gradient on a Canvas by stacking thin rectangles."""
    canvas.delete(tag)
    steps = 96
    for i in range(steps):
        y0 = int(h * i / steps)
        y1 = int(h * (i + 1) / steps)
        color = _interp(top, bottom, i / (steps - 1))
        canvas.create_rectangle(0, y0, w, y1 + 1, outline="",
                                fill=color, tags=tag)


def rounded_rect(canvas: tk.Canvas, x1: int, y1: int, x2: int, y2: int,
                 r: int = 18, **kwargs) -> int:
    """Draw an approximated rounded rectangle as a smoothed polygon."""
    pts = [
        x1 + r, y1,
        x2 - r, y1,
        x2, y1,
        x2, y1 + r,
        x2, y2 - r,
        x2, y2,
        x2 - r, y2,
        x1 + r, y2,
        x1, y2,
        x1, y2 - r,
        x1, y1 + r,
        x1, y1,
    ]
    return canvas.create_polygon(pts, smooth=True, **kwargs)


# --------------------------------------------------------------------------- #
# Game                                                                        #
# --------------------------------------------------------------------------- #

class MoleculeGame:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Molecule Master  \u2013  a chemistry practice game")
        self.root.geometry(f"{WINDOW_W}x{WINDOW_H}")
        self.root.configure(bg=BG_TOP)
        self.root.resizable(False, False)

        # state
        self.score = 0
        self.level = 1
        self.streak = 0
        self.correct_this_level = 0
        self.current: Optional[dict] = None
        self.history: list[int] = []                 # CIDs already shown
        self.image_cache: dict[int, Image.Image] = {}
        self.wiki_cache: dict[str, str] = {}
        self._tk_image: Optional[ImageTk.PhotoImage] = None   # keep reference
        self._locked = False                         # block input during delay

        # fonts
        self.f_title    = tkfont.Font(family="Helvetica", size=30, weight="bold")
        self.f_sub      = tkfont.Font(family="Helvetica", size=12, slant="italic")
        self.f_stat_lbl = tkfont.Font(family="Helvetica", size=10, weight="bold")
        self.f_stat_val = tkfont.Font(family="Helvetica", size=22, weight="bold")
        self.f_body     = tkfont.Font(family="Helvetica", size=14)
        self.f_small    = tkfont.Font(family="Helvetica", size=11)
        self.f_btn      = tkfont.Font(family="Helvetica", size=12, weight="bold")
        self.f_feedback = tkfont.Font(family="Helvetica", size=14, weight="bold")

        # main canvas (gradient background + everything drawn on it)
        self.canvas = tk.Canvas(root, width=WINDOW_W, height=WINDOW_H,
                                highlightthickness=0, bd=0)
        self.canvas.pack(fill="both", expand=True)
        draw_vertical_gradient(self.canvas, WINDOW_W, WINDOW_H,
                               BG_TOP, BG_BOTTOM)

        self._build_header()
        self._build_card()
        self._build_controls()
        self._build_footer()

        self.root.bind("<Return>", lambda e: self._submit())
        self.entry.focus_set()

        self.next_molecule()

    # ---------- UI layout ------------------------------------------------- #

    def _build_header(self) -> None:
        self.canvas.create_text(
            42, 50, anchor="w", text="\u269B  Molecule Master",
            font=self.f_title, fill=TEXT_MAIN,
        )
        self.canvas.create_text(
            42, 86, anchor="w",
            text="Name the molecule shown below. Climb the levels, score higher.",
            font=self.f_sub, fill=TEXT_DIM,
        )

        # stat panel (right side)
        panel_x1, panel_y1 = WINDOW_W - 330, 26
        panel_x2, panel_y2 = WINDOW_W - 40, 108
        rounded_rect(self.canvas, panel_x1, panel_y1, panel_x2, panel_y2,
                     r=16, fill=CARD_BG, outline=CARD_BORDER, width=2)

        col_w = (panel_x2 - panel_x1) / 3
        cols = [
            ("SCORE",  GOLD),
            ("LEVEL",  ACCENT),
            ("STREAK", GOOD),
        ]
        self.stat_val_ids: dict[str, int] = {}
        for i, (label, color) in enumerate(cols):
            cx = panel_x1 + col_w * (i + 0.5)
            self.canvas.create_text(cx, panel_y1 + 22, text=label,
                                    font=self.f_stat_lbl, fill=TEXT_DIM)
            val = self.canvas.create_text(cx, panel_y1 + 52, text="0",
                                          font=self.f_stat_val, fill=color)
            self.stat_val_ids[label] = val

    def _build_card(self) -> None:
        # large molecule card
        self.card_x1, self.card_y1 = 60, 130
        self.card_x2, self.card_y2 = WINDOW_W - 60, 560
        # soft shadow underlay
        rounded_rect(self.canvas, self.card_x1 + 5, self.card_y1 + 8,
                     self.card_x2 + 5, self.card_y2 + 8,
                     r=22, fill="#05081c", outline="")
        self.card_shape = rounded_rect(
            self.canvas, self.card_x1, self.card_y1,
            self.card_x2, self.card_y2,
            r=22, fill=CARD_BG, outline=CARD_BORDER, width=2,
        )

        # image slot: center of card, above the progress bar
        self.img_x = (self.card_x1 + self.card_x2) // 2
        self.img_y = 320
        self.img_item = self.canvas.create_image(self.img_x, self.img_y, image=None)
        self.status_item = self.canvas.create_text(
            self.img_x, self.img_y,
            text="Loading\u2026", font=self.f_body, fill=TEXT_DIM,
        )

        # progress bar toward next level (bottom of card)
        self.bar_x1 = self.card_x1 + 30
        self.bar_x2 = self.card_x2 - 30
        self.bar_y  = self.card_y2 - 28
        self.canvas.create_text(
            self.bar_x1, self.bar_y - 20, anchor="w",
            text="Progress to next level", font=self.f_small, fill=TEXT_DIM,
        )
        self.progress_label = self.canvas.create_text(
            self.bar_x2, self.bar_y - 20, anchor="e",
            text="0 / 3", font=self.f_small, fill=TEXT_DIM,
        )
        self.canvas.create_rectangle(
            self.bar_x1, self.bar_y, self.bar_x2, self.bar_y + 10,
            fill="#1a224a", outline="",
        )
        self.progress_fill = self.canvas.create_rectangle(
            self.bar_x1, self.bar_y, self.bar_x1, self.bar_y + 10,
            fill=ACCENT, outline="",
        )

    def _build_controls(self) -> None:
        # a card behind the input row so things feel grouped
        ctl_x1, ctl_y1 = 60, 580
        ctl_x2, ctl_y2 = WINDOW_W - 60, 680
        rounded_rect(self.canvas, ctl_x1, ctl_y1, ctl_x2, ctl_y2,
                     r=18, fill=CARD_BG, outline=CARD_BORDER, width=2)

        self.canvas.create_text(
            ctl_x1 + 24, ctl_y1 + 18, anchor="w", text="Your answer",
            font=self.f_small, fill=TEXT_DIM,
        )

        # text entry — classic tk.Entry sits inside the canvas via create_window
        self.entry_var = tk.StringVar()
        self.entry = tk.Entry(
            self.root, textvariable=self.entry_var,
            font=self.f_body,
            bg="#0b1130", fg=TEXT_MAIN, insertbackground=ACCENT,
            relief="flat", bd=0, highlightthickness=2,
            highlightbackground=CARD_BORDER, highlightcolor=ACCENT,
        )
        entry_x = ctl_x1 + 24
        entry_y = ctl_y1 + 52
        entry_w = 440
        entry_h = 38
        self.canvas.create_window(entry_x, entry_y, anchor="w",
                                  window=self.entry,
                                  width=entry_w, height=entry_h)

        # Canvas-drawn buttons so macOS doesn't override colors/borders
        btn_h = 40
        btn_y = entry_y - btn_h // 2
        gap = 14
        x = entry_x + entry_w + 24
        self._make_button(x, btn_y, 110, btn_h, "SUBMIT",
                          ACCENT, ACCENT_DARK, "#0b1026",
                          self._submit, tag="btn_submit")
        x += 110 + gap
        self._make_button(x, btn_y, 100, btn_h, "HINT",
                          PURPLE, "#8b5cf6", "#ffffff",
                          self._hint, tag="btn_hint")
        x += 100 + gap
        self._make_button(x, btn_y, 100, btn_h, "SKIP",
                          "#334168", "#475588", TEXT_MAIN,
                          self._skip, tag="btn_skip")

    def _build_footer(self) -> None:
        self.feedback_item = self.canvas.create_text(
            WINDOW_W // 2, 708, text="", font=self.f_feedback, fill=TEXT_MAIN,
            width=WINDOW_W - 100, justify="center",
        )
        self.canvas.create_text(
            WINDOW_W // 2, 752,
            text="Structures via PubChem PUG REST  \u2022  Hints via Wikipedia"
                 "  \u2022  Press Enter to submit",
            font=self.f_small, fill=TEXT_DIM,
        )

    # ---------- canvas button helper ------------------------------------- #

    def _make_button(self, x: int, y: int, w: int, h: int, label: str,
                     base: str, hover: str, fg: str,
                     on_click: Callable[[], None], tag: str) -> None:
        """Draw a rounded-rectangle button with text and bind click/hover."""
        poly = rounded_rect(self.canvas, x, y, x + w, y + h,
                            r=12, fill=base, outline="")
        text = self.canvas.create_text(x + w / 2, y + h / 2, text=label,
                                       font=self.f_btn, fill=fg)
        self.canvas.addtag_withtag(tag, poly)
        self.canvas.addtag_withtag(tag, text)

        def on_enter(_e: object) -> None:
            self.canvas.itemconfigure(poly, fill=hover)
            self.canvas.configure(cursor="hand2")

        def on_leave(_e: object) -> None:
            self.canvas.itemconfigure(poly, fill=base)
            self.canvas.configure(cursor="")

        self.canvas.tag_bind(tag, "<Enter>", on_enter)
        self.canvas.tag_bind(tag, "<Leave>", on_leave)
        self.canvas.tag_bind(tag, "<Button-1>", lambda _e: on_click())

    # ---------- game flow ------------------------------------------------- #

    def _pick_molecule(self) -> dict:
        pool = MOLECULES[self.level]
        unseen = [m for m in pool if m["cid"] not in self.history]
        if not unseen:
            # everything at this level already shown — reset history for level
            self.history = []
            unseen = pool
        return random.choice(unseen)

    def next_molecule(self) -> None:
        self._locked = False
        self.current = self._pick_molecule()
        self.history.append(self.current["cid"])
        self.entry_var.set("")
        self.canvas.itemconfigure(self.feedback_item, text="", fill=TEXT_MAIN)
        self.canvas.itemconfigure(self.status_item,
                                  text="Loading molecule\u2026", fill=TEXT_DIM)
        self.canvas.itemconfigure(self.img_item, image="")
        self.entry.configure(state="normal")
        self.entry.focus_set()

        cid = self.current["cid"]
        threading.Thread(target=self._fetch_image, args=(cid,),
                         daemon=True).start()

    # ---------- molecule image pipeline ---------------------------------- #

    def _fetch_image(self, cid: int) -> None:
        """Download the structure PNG from PubChem (runs off the UI thread)."""
        try:
            if cid in self.image_cache:
                img = self.image_cache[cid]
            else:
                resp = requests.get(PUBCHEM_PNG_URL.format(cid=cid), timeout=15)
                resp.raise_for_status()
                img = Image.open(io.BytesIO(resp.content)).convert("RGBA")
                img = self._prepare_molecule_image(img)
                self.image_cache[cid] = img
        except Exception as exc:                           # noqa: BLE001
            self.root.after(0, self._on_image_error, cid, str(exc))
            return
        self.root.after(0, self._on_image_ready, cid, img)

    def _prepare_molecule_image(self, img: Image.Image) -> Image.Image:
        """Crop whitespace, scale up, drop onto a rounded white plate."""
        # 1. Auto-crop — PubChem adds a lot of padding around small structures.
        rgb = img.convert("RGB")
        bg_ref = Image.new("RGB", rgb.size, (255, 255, 255))
        diff = ImageChops.difference(rgb, bg_ref)
        bbox = diff.getbbox()
        if bbox:
            # expand the crop slightly so nothing is clipped
            left, top, right, bottom = bbox
            pad_c = 8
            left   = max(0, left - pad_c)
            top    = max(0, top - pad_c)
            right  = min(img.size[0], right + pad_c)
            bottom = min(img.size[1], bottom + pad_c)
            img = img.crop((left, top, right, bottom))

        # 2. Scale up to fill the plate while preserving aspect ratio.
        target_w, target_h = 500, 360
        img.thumbnail((target_w, target_h), Image.LANCZOS)

        # 3. Drop onto a rounded white plate.
        pad = 28
        plate_w = img.size[0] + pad * 2
        plate_h = img.size[1] + pad * 2
        plate = Image.new("RGBA", (plate_w, plate_h), (255, 255, 255, 255))
        plate.paste(img, (pad, pad), img)

        mask = Image.new("L", (plate_w, plate_h), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [0, 0, plate_w, plate_h], radius=20, fill=255,
        )
        rounded = Image.new("RGBA", (plate_w, plate_h), (0, 0, 0, 0))
        rounded.paste(plate, (0, 0), mask)
        return rounded

    def _on_image_ready(self, cid: int, img: Image.Image) -> None:
        if not self.current or self.current["cid"] != cid:
            return  # a skip raced ahead of the download
        self._tk_image = ImageTk.PhotoImage(img)
        self.canvas.itemconfigure(self.img_item, image=self._tk_image)
        self.canvas.itemconfigure(self.status_item, text="")

    def _on_image_error(self, cid: int, msg: str) -> None:
        if not self.current or self.current["cid"] != cid:
            return
        self.canvas.itemconfigure(
            self.status_item,
            text=f"Couldn't load structure.\n({msg[:70]})",
            fill=BAD,
        )

    # ---------- input handling ------------------------------------------- #

    def _normalize(self, text: str) -> str:
        return " ".join(text.strip().lower().split())

    def _submit(self) -> None:
        if self._locked or not self.current:
            return
        guess = self._normalize(self.entry_var.get())
        if not guess:
            return
        if guess in self.current["answers"]:
            self._on_correct()
        else:
            self._on_wrong(guess)

    def _on_correct(self) -> None:
        gained = self.level * POINTS_PER_LEVEL
        self.score += gained
        self.streak += 1
        self.correct_this_level += 1

        self._flash_card(GOOD)
        self.canvas.itemconfigure(
            self.feedback_item,
            text=f"\u2713  Correct!  +{gained} points   "
                 f"({self.current['display']})",
            fill=GOOD,
        )
        self._update_stats()
        self._locked = True

        if (self.correct_this_level >= CORRECT_PER_LEVEL
                and self.level < MAX_LEVEL):
            self.level += 1
            self.correct_this_level = 0
            self.history.clear()
            self.root.after(
                900,
                lambda: self.canvas.itemconfigure(
                    self.feedback_item,
                    text=f"\u2728  Level up!  Now on Level {self.level}",
                    fill=GOLD,
                ),
            )
        self.root.after(1500, self.next_molecule)

    def _on_wrong(self, guess: str) -> None:
        self.streak = 0
        self._flash_card(BAD)
        msg = (f"\u2717  Not quite — \"{guess}\" isn't right. "
               f"Formula: {self.current['formula']}")
        self.canvas.itemconfigure(self.feedback_item, text=msg, fill=BAD)
        self._update_stats()

    def _skip(self) -> None:
        if self._locked or not self.current:
            return
        self.streak = 0
        self.canvas.itemconfigure(
            self.feedback_item,
            text=f"Skipped. That was {self.current['display']}.",
            fill=TEXT_DIM,
        )
        self._update_stats()
        self._locked = True
        self.root.after(1100, self.next_molecule)

    # ---------- hint (secondary API: Wikipedia) -------------------------- #

    def _hint(self) -> None:
        if self._locked or not self.current:
            return
        mol = self.current
        self.canvas.itemconfigure(
            self.feedback_item,
            text=f"Hint: formula {mol['formula']}  \u2022  fetching clue\u2026",
            fill=ACCENT,
        )
        threading.Thread(target=self._fetch_hint, args=(mol,),
                         daemon=True).start()

    def _fetch_hint(self, mol: dict) -> None:
        wiki_title = mol["wiki"]
        try:
            if wiki_title in self.wiki_cache:
                extract = self.wiki_cache[wiki_title]
            else:
                url = WIKI_SUMMARY_URL.format(
                    title=urllib.parse.quote(wiki_title))
                resp = requests.get(url, timeout=10,
                                    headers={"User-Agent": WIKI_UA})
                resp.raise_for_status()
                data = resp.json()
                extract = data.get("extract", "") or ""
                self.wiki_cache[wiki_title] = extract
        except Exception:                                  # noqa: BLE001
            extract = ""

        clue = self._build_clue(mol, extract)
        self.root.after(0, self._show_hint, mol, clue)

    def _build_clue(self, mol: dict, extract: str) -> str:
        """Take a Wikipedia extract and turn it into a spoiler-free hint."""
        if not extract:
            # fall back to a generic hint if the API call failed
            first = mol["display"].split()[0]
            return (f"Hint: formula {mol['formula']}, starts with "
                    f"'{first[0].upper()}', {len(first)} letters.")

        # take first ~2 sentences to keep the hint short
        pieces = re.split(r"(?<=[.!?])\s+", extract)
        snippet = " ".join(pieces[:2])
        if len(snippet) > 280:
            snippet = snippet[:277].rsplit(" ", 1)[0] + "\u2026"

        # redact anything that would give the answer away
        redact_terms: set[str] = set(mol["answers"])
        redact_terms.add(self._normalize(mol["display"]))
        for word in self._normalize(mol["display"]).split():
            if len(word) > 3 and word.isalpha():
                redact_terms.add(word)
        # also mask the Wikipedia page title tokens
        for word in mol["wiki"].replace("_", " ").lower().split():
            if len(word) > 3 and word.isalpha():
                redact_terms.add(word)

        for term in sorted(redact_terms, key=len, reverse=True):
            if not term:
                continue
            pattern = re.compile(
                r"\b" + re.escape(term) + r"\b", re.IGNORECASE)
            snippet = pattern.sub("\u2588\u2588\u2588", snippet)

        return f"Hint (formula {mol['formula']}):  {snippet}"

    def _show_hint(self, mol: dict, clue: str) -> None:
        if not self.current or self.current["cid"] != mol["cid"]:
            return  # user moved on
        self.canvas.itemconfigure(self.feedback_item, text=clue, fill=ACCENT)

    # ---------- visuals --------------------------------------------------- #

    def _flash_card(self, color: str) -> None:
        self.canvas.itemconfigure(self.card_shape, outline=color, width=4)
        self.root.after(
            400,
            lambda: self.canvas.itemconfigure(
                self.card_shape, outline=CARD_BORDER, width=2,
            ),
        )

    def _update_stats(self) -> None:
        self.canvas.itemconfigure(self.stat_val_ids["SCORE"],
                                  text=str(self.score))
        self.canvas.itemconfigure(self.stat_val_ids["LEVEL"],
                                  text=str(self.level))
        self.canvas.itemconfigure(self.stat_val_ids["STREAK"],
                                  text=str(self.streak))

        frac = min(self.correct_this_level / CORRECT_PER_LEVEL, 1.0)
        new_x2 = self.bar_x1 + int((self.bar_x2 - self.bar_x1) * frac)
        self.canvas.coords(
            self.progress_fill,
            self.bar_x1, self.bar_y, new_x2, self.bar_y + 10,
        )
        self.canvas.itemconfigure(
            self.progress_label,
            text=f"{self.correct_this_level} / {CORRECT_PER_LEVEL}",
        )


# --------------------------------------------------------------------------- #
# Entry point                                                                 #
# --------------------------------------------------------------------------- #

def main() -> None:
    root = tk.Tk()
    MoleculeGame(root)
    root.mainloop()


if __name__ == "__main__":
    main()
