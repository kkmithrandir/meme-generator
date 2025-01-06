const canvas = document.getElementById("memeCanvas");
const ctx = canvas.getContext("2d");

// DOM Elements
const keywordInput = document.getElementById("keywordInput");
const topTextInput = document.getElementById("topTextInput");
const bottomTextInput = document.getElementById("bottomTextInput");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");

/**
 * Fetch the list of memes from Imgflip.
 * Returns an array of meme objects { id, name, url, width, height }.
 */
async function fetchImgflipMemes() {
  try {
    const res = await fetch("https://api.imgflip.com/get_memes");
    const data = await res.json();
    if (data.success) {
      return data.data.memes;
    } else {
      console.error("Failed to fetch Imgflip memes:", data);
      return [];
    }
  } catch (err) {
    console.error("Error fetching memes from Imgflip:", err);
    return [];
  }
}

/**
 * Find a meme template that matches the keyword (simple substring match).
 */
function findMemeByKeyword(memes, keyword) {
  const lowerKeyword = keyword.toLowerCase();
  const matches = memes.filter((meme) =>
    meme.name.toLowerCase().includes(lowerKeyword)
  );
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Generate the meme:
 * 1. Fetch meme list from Imgflip
 * 2. Find the first template matching the keyword
 * 3. Draw that template on the canvas
 * 4. Overlay top and bottom text
 */
async function generateMeme() {
  const keyword = keywordInput.value.trim();
  if (!keyword) {
    alert("Please enter a keyword.");
    return;
  }

  // Clear canvas before drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Fetch memes
  const allMemes = await fetchImgflipMemes();
  if (!allMemes || allMemes.length === 0) {
    alert("Could not fetch memes from Imgflip. Try again later.");
    return;
  }

  // 2. Find a matching meme
  const matchedMeme = findMemeByKeyword(allMemes, keyword);
  if (!matchedMeme) {
    alert("No matching meme template found for that keyword!");
    return;
  }

  // 3. Load meme image
  const memeImage = new Image();
  memeImage.crossOrigin = "anonymous"; // helps avoid cross-origin issues
  memeImage.src = matchedMeme.url;

  memeImage.onload = () => {
    // Simple approach: draw image to fill the canvas
    ctx.drawImage(memeImage, 0, 0, canvas.width, canvas.height);

    // 4. Overlay text
    const topText = topTextInput.value.trim().toUpperCase();
    const bottomText = bottomTextInput.value.trim().toUpperCase();

    // Text style
    ctx.font = "bold 40px Impact, sans-serif";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.textAlign = "center";

    // Draw top text (approx. 10% from top)
    if (topText) {
      const x = canvas.width / 2;
      const y = 50; // Adjust as needed
      ctx.fillText(topText, x, y);
      ctx.strokeText(topText, x, y);
    }

    // Draw bottom text (approx. 10% from bottom)
    if (bottomText) {
      const x = canvas.width / 2;
      const y = canvas.height - 30;
      ctx.fillText(bottomText, x, y);
      ctx.strokeText(bottomText, x, y);
    }
  };
}

/**
 * Copy the meme as an actual image to the clipboard (so it can be pasted into Slack, Discord, etc.).
 */
async function copyMemeToClipboard() {
  // Convert the canvas to a Blob
  canvas.toBlob(async (blob) => {
    if (!blob) {
      console.error("Failed to create blob from canvas.");
      return;
    }

    // Create a ClipboardItem with the Blob, specifying its MIME type
    const clipboardItem = new ClipboardItem({
      "image/png": blob,
    });

    try {
      // Use the Async Clipboard API (requires secure context and a user gesture)
      await navigator.clipboard.write([clipboardItem]);
      alert("Meme image copied to clipboard! Paste it in your chat app.");
    } catch (err) {
      console.error("Failed to copy meme to clipboard:", err);
      alert("Failed to copy meme. Check console for more details.");
    }
  }, "image/png");
}

// Event Listeners
generateBtn.addEventListener("click", generateMeme);
copyBtn.addEventListener("click", copyMemeToClipboard);
