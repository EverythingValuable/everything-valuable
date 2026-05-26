// Parse dimension strings and convert between units
export function parseDimensions(dimensionString) {
  if (!dimensionString) return null;

  // Try to match patterns like "8 × 12 in", "H 10 × W 8 in", "10 x 20 cm", etc.
  const inchMatch = dimensionString.match(/[\d.]+\s*×?\s*[\d.]+(\s*×?\s*[\d.]+)?\s*in/i);
  const cmMatch = dimensionString.match(/[\d.]+\s*×?\s*[\d.]+(\s*×?\s*[\d.]+)?\s*cm/i);

  let inches = null;
  let cms = null;

  if (inchMatch) {
    const numbers = inchMatch[0].match(/[\d.]+/g).map(Number);
    inches = numbers;
  } else if (cmMatch) {
    const numbers = cmMatch[0].match(/[\d.]+/g).map(Number);
    cms = numbers;
    // Convert cm to inches
    inches = numbers.map(cm => (cm / 2.54).toFixed(2)).map(Number);
  }

  return { inches, cms };
}

export function formatDimensions(dimensionString) {
  const parsed = parseDimensions(dimensionString);
  if (!parsed || !parsed.inches) return dimensionString; // Return original if can't parse

  const { inches, cms } = parsed;
  
  // If we have inches, convert to cm for display
  const cmValues = inches.map(inch => (inch * 2.54).toFixed(1)).map(Number);

  // Format as "H 8 × W 12 in / H 20.3 × W 30.5 cm"
  if (inches.length === 2) {
    return `H ${inches[0]} × W ${inches[1]} in / H ${cmValues[0]} × W ${cmValues[1]} cm`;
  } else if (inches.length === 3) {
    return `H ${inches[0]} × W ${inches[1]} × D ${inches[2]} in / H ${cmValues[0]} × W ${cmValues[1]} × D ${cmValues[2]} cm`;
  }

  return dimensionString;
}