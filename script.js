
const root = document.documentElement;

const uploadInput = document.getElementById("image-upload");
const uploadZone = document.getElementById("upload-zone");
const imagePreview = document.getElementById("image-preview");
const uploadIcon = document.getElementById("upload-icon");
const uploadTitle = document.getElementById("upload-title");
const uploadSubtitle = document.getElementById("upload-subtitle");
const palette = document.getElementById("palette");
const paletteDescription = document.getElementById("palette-description");
const previewCanvas = document.getElementById("preview-canvas");
const moodButtons = document.querySelectorAll(".mood");
const resetButton = document.getElementById("reset-button");
const exportButton = document.getElementById("export-button");

let extractedColors = [];
let selectedColor = "";
let wallpaperURL = "";
let currentMood = "minimal";

const sliderDefaults = {
  saturation: 100,
  brightness: 100,
  contrast: 100,
  blur: 8,
  overlay: 45
};

const moods = {
  minimal: {
    background: "#171923",
    card: "#222635",
    text: "#f3f0ff",
    muted: "#a4a8bf",
    accent: "#a99aff",
    overlay: 45,
    blur: 8
  },
  vibrant: {
    background: "#171126",
    card: "#29203c",
    text: "#fff5ff",
    muted: "#d0b9e0",
    accent: "#ff88bd",
    overlay: 30,
    blur: 10
  },
  warm: {
    background: "#241a19",
    card: "#382722",
    text: "#fff4e7",
    muted: "#d2b9a8",
    accent: "#f0b76f",
    overlay: 35,
    blur: 12
  },
  cool: {
    background: "#111e29",
    card: "#1c2c3a",
    text: "#eff8ff",
    muted: "#a9c1d4",
    accent: "#75d8ee",
    overlay: 40,
    blur: 12
  },
  glass: {
    background: "#171827",
    card: "#ffffff12",
    text: "#f6f4ff",
    muted: "#c2c1d9",
    accent: "#c1a8ff",
    overlay: 55,
    blur: 18
  }
};

function setVariable(name, value) {
  root.style.setProperty(name, value);
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b]
    .map(value => Math.max(0, Math.min(255, Math.round(value)))
      .toString(16).padStart(2, "0"))
    .join("");
}

function getPalette(image) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", {
    willReadFrequently: true
  });

  const size = 100;
  canvas.width = size;
  canvas.height = size;

  context.drawImage(image, 0, 0, size, size);

  const pixels = context.getImageData(0, 0, size, size).data;
  const buckets = new Map();

  for (let i = 0; i < pixels.length; i += 16) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const alpha = pixels[i + 3];

    if (alpha < 200) continue;

    // Group similar colors into the same bucket.
    const key = [
      Math.round(r / 32),
      Math.round(g / 32),
      Math.round(b / 32)
    ].join(",");

    const bucket = buckets.get(key) || {
      r: 0, g: 0, b: 0, count: 0
    };

    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.count++;

    buckets.set(key, bucket);
  }

  return [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    .map(bucket => ({
      hex: rgbToHex(
        bucket.r / bucket.count,
        bucket.g / bucket.count,
        bucket.b / bucket.count
      ),
      count: bucket.count
    }))
    .filter((color, index, all) =>
      all.findIndex(item => item.hex === color.hex) === index
    )
    .slice(0, 5)
    .map(color => color.hex);
}

function renderPalette() {
  palette.replaceChildren();

  if (!extractedColors.length) {
    const message = document.createElement("div");
    message.className = "empty-palette";
    message.textContent = "Your colors will appear here.";
    palette.append(message);
    return;
  }

  extractedColors.forEach(color => {
    const button = document.createElement("button");
    button.className = "swatch";
    button.type = "button";
    button.setAttribute("aria-label", "Use color " + color);
    button.title = "Use " + color;

    if (color === selectedColor) {
      button.classList.add("selected");
      button.setAttribute("aria-pressed", "true");
    } else {
      button.setAttribute("aria-pressed", "false");
    }

    const swatchColor = document.createElement("span");
    swatchColor.className = "swatch-color";
    swatchColor.style.backgroundColor = color;

    const code = document.createElement("span");
    code.className = "swatch-code";
    code.textContent = color.toUpperCase();

    button.append(swatchColor, code);

    button.addEventListener("click", () => {
      selectedColor = color;
      renderPalette();
      applyTheme();
    });

    palette.append(button);
  });

  paletteDescription.textContent =
    extractedColors.length + " colors extracted. Click one to use it.";
}

function applyTheme() {
  const mood = moods[currentMood];
  const accent = selectedColor || mood.accent;

  setVariable("--demo-bg", mood.background);
  setVariable("--demo-card", mood.card);
  setVariable("--demo-text", mood.text);
  setVariable("--demo-muted", mood.muted);
  setVariable("--demo-accent", accent);

  // Make the selected accent affect the full interface.
  setVariable("--accent", accent);

  if (currentMood === "glass") {
    previewCanvas.style.backdropFilter = "blur(12px)";
  } else {
    previewCanvas.style.backdropFilter = "none";
  }

  document.querySelectorAll(".mood").forEach(button => {
    const active = button.dataset.mood === currentMood;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  updateSlider("saturation", sliderDefaults.saturation);
  updateSlider("brightness", sliderDefaults.brightness);
  updateSlider("contrast", sliderDefaults.contrast);
  updateSlider("blur", mood.blur);
  updateSlider("overlay", mood.overlay);
}

function updateSlider(name, value) {
  const input = document.getElementById(name);
  const output = document.getElementById(name + "-value");

  input.value = value;

  if (name === "blur") {
    output.value = value + "px";
  } else if (name === "overlay") {
    output.value = value + "%";
  } else {
    output.value = value + "%";
  }

  const variables = {
    saturation: "--saturation",
    brightness: "--brightness",
    contrast: "--contrast",
    blur: "--bg-blur",
    overlay: "--overlay-opacity"
  };

  let cssValue = value;

  if (["saturation", "brightness", "contrast"].includes(name)) {
    cssValue += "%";
  }

  if (name === "blur") cssValue += "px";
  if (name === "overlay") cssValue = value / 100;

  setVariable(variables[name], cssValue);
}

function resetAdjustments() {
  Object.entries(sliderDefaults).forEach(([name, value]) => {
    updateSlider(name, value);
  });

  currentMood = "minimal";
  selectedColor = "";
  applyTheme();
  renderPalette();
}

uploadInput.addEventListener("change", event => {
  const file = event.target.files[0];

  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    alert("Please choose a JPG, PNG or WEBP image.");
    uploadInput.value = "";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    alert("Please choose an image smaller than 10 MB.");
    uploadInput.value = "";
    return;
  }

  const newURL = URL.createObjectURL(file);
  const image = new Image();

  image.onload = () => {
    try {
      const colors = getPalette(image);

      if (!colors.length) {
        throw new Error("No colors could be extracted.");
      }

      if (wallpaperURL) URL.revokeObjectURL(wallpaperURL);
      wallpaperURL = newURL;

      extractedColors = colors;
      selectedColor = colors[0];

      imagePreview.src = wallpaperURL;
      imagePreview.hidden = false;
      uploadIcon.hidden = true;
      uploadTitle.textContent = file.name;
      uploadSubtitle.textContent = "Wallpaper loaded successfully";

      setVariable("--wallpaper", `url("${wallpaperURL}")`);

      currentMood = "minimal";
      renderPalette();
      applyTheme();
    } catch (error) {
      URL.revokeObjectURL(newURL);
      alert("We couldn't read that image. Please try another one.");
      console.error(error);
    }
  };

  image.onerror = () => {
    URL.revokeObjectURL(newURL);
    alert("We couldn't open that image. Please try another one.");
  };

  image.src = newURL;
});

["dragenter", "dragover"].forEach(eventName => {
  uploadZone.addEventListener(eventName, event => {
    event.preventDefault();
    uploadZone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach(eventName => {
  uploadZone.addEventListener(eventName, event => {
    event.preventDefault();
    uploadZone.classList.remove("dragging");
  });
});

uploadZone.addEventListener("drop", event => {
  const file = event.dataTransfer.files[0];

  if (!file) return;

  const transfer = new DataTransfer();
  transfer.items.add(file);
  uploadInput.files = transfer.files;
  uploadInput.dispatchEvent(new Event("change", { bubbles: true }));
});

moodButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentMood = button.dataset.mood;
    selectedColor = extractedColors[0] || "";
    applyTheme();
    renderPalette();
  });
});

["saturation", "brightness", "contrast", "blur", "overlay"]
  .forEach(name => {
    document.getElementById(name).addEventListener("input", event => {
      updateSlider(name, Number(event.target.value));
    });
  });

resetButton.addEventListener("click", resetAdjustments);

document.getElementById("demo-form").addEventListener("submit", event => {
  event.preventDefault();
  document.getElementById("demo-message").textContent =
    "Thanks for trying Forma! This is a demo, so no email was sent.";
});

exportButton.addEventListener("click", () => {
  const mood = moods[currentMood];

  const theme = {
    name: "Chromatic Theme",
    mood: currentMood,
    palette: extractedColors,
    selectedColor: selectedColor || mood.accent,
    settings: {
      saturation: Number(document.getElementById("saturation").value),
      brightness: Number(document.getElementById("brightness").value),
      contrast: Number(document.getElementById("contrast").value),
      blur: Number(document.getElementById("blur").value),
      overlay: Number(document.getElementById("overlay").value)
    },
    colors: {
      background: mood.background,
      card: mood.card,
      text: mood.text,
      muted: mood.muted,
      accent: selectedColor || mood.accent
    }
  };

  const blob = new Blob(
    [JSON.stringify(theme, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "chromatic-theme.json";
  link.click();
  URL.revokeObjectURL(url);
});

resetAdjustments();
