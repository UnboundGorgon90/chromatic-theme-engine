# Chromatic — Your Colors, Your Canvas

Chromatic is an interactive image-to-theme studio that transforms a wallpaper into a customizable website theme. Upload an image, explore its extracted color palette, choose a visual mood, and fine-tune the result through a live preview.

## Features

- **Image upload:** Supports JPG, PNG, and WEBP, with a 10 MB file-size limit.
- **Automatic color extraction:** Samples image pixels, groups similar RGB values into color buckets, and selects a palette that balances common colors with visual variety.
- **Interactive palette:** Select an extracted color to use it as the theme accent.
- **Five theme presets:** Minimal, Vibrant, Warm, Cool, and Glass.
- **Live adjustments:** Control saturation, brightness, contrast, background blur, and overlay opacity.
- **Live preview:** See the theme applied to a sample website layout, including navigation, buttons, cards, typography, and an email form.
- **Contrast-aware buttons:** Automatically chooses light or dark button text based on the selected accent color's relative luminance.
- **Theme export:** Download the selected theme, palette, and adjustment settings as a JSON file.
- **Responsive layout:** Adapts the studio interface to smaller screens.
- **Reset controls:** Restore the default theme and adjustment settings.

## How to Run

1. Clone or download this repository.
2. Open the project folder in VS Code.
3. Open `index.html` in a browser. You can also use the VS Code Live Server extension.
4. Upload an image and start customizing your theme.

No package installation or build step is required.

## How Color Extraction Works

1. The uploaded image is drawn onto a small HTML canvas to reduce the amount of pixel data processed.
2. The canvas pixel data is sampled, skipping some pixels for efficiency.
3. Similar RGB colors are grouped into buckets using quantized color channels.
4. The average RGB value of each bucket becomes a candidate color.
5. The most frequent candidate is selected first. Further colors are chosen by balancing frequency with their RGB distance from the colors already selected.
6. The resulting palette is displayed as clickable swatches.

This is a lightweight color-quantization approach designed for a browser-based demo. It does not require an external color-extraction API.

## Theme Generation

Each preset defines a set of theme colors and default background effects. The selected preset and accent color are applied through CSS custom properties, allowing the preview to update without rebuilding the page.

The adjustment sliders update CSS properties directly, including image saturation, brightness, contrast, blur, and overlay opacity. The selected palette accent is preserved when switching presets.

The export action serializes the current theme configuration into a downloadable JSON file.

## Design Decisions

- A dark studio interface keeps attention on the image and theme preview.
- A numbered workflow separates image selection, palette exploration, mood selection, and fine-tuning.
- CSS custom properties keep theme updates consistent across preview components.
- The palette selection algorithm considers both color frequency and visual distinction instead of choosing only the five most common colors.
- Contrast-aware accent button text improves readability across different selected colors.
- Responsive CSS makes the controls and preview usable on smaller screens.
- Image validation and error handling help prevent unsupported or oversized uploads from being processed.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- HTML Canvas API
- Browser File API and Blob API

## Project Structure

- `index.html` — page structure and preview components
- `styles.css` — studio styling, responsive layout, and theme variables
- `script.js` — image processing, palette extraction, theme logic, slider controls, and JSON export

## Limitations

- The palette extraction method is a lightweight heuristic, not a perceptual color-clustering algorithm.
- Contrast-aware text selection applies to the primary accent buttons; it is not a full accessibility audit of every color combination.
- The preview demonstrates a theme applied to a sample interface rather than modifying an external website.

## Future Improvements

- Add alternative palette extraction strategies.
- Allow users to export reusable CSS variables alongside JSON.
- Add more detailed accessibility checks for text and component contrast.
- Support saving and importing previously exported themes.

---

**Chromatic — Find your color story.**