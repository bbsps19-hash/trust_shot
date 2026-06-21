"use strict";

const screens = {
  startScreen: document.getElementById("startScreen"),
  playerSelectScreen: document.getElementById("playerSelectScreen"),
  twoPlayerModeScreen: document.getElementById("twoPlayerModeScreen"),
  mapSelectScreen: document.getElementById("mapSelectScreen"),
  transitionScreen: document.getElementById("transitionScreen"),
  videoScreen: document.getElementById("videoScreen"),
  endScreen: document.getElementById("endScreen"),
};

const transitionImage = document.getElementById("transitionImage");
const gameVideo = document.getElementById("gameVideo");

let selectedPlayerMode = null;
let selectedTwoPlayerMode = null;
let selectedTheme = null;
let transitionTimer = null;
let endTimer = null;
let isThemeStarting = false;

const transitionImages = {
  arcade: "assets/images/아케이드.png",
  metalSlug: "assets/images/메탈슬러그.png",
  starWars: "assets/images/스타워즈.png",
  hymnBattle: "assets/images/죄악벗은 형제여.png",
};

const themeVideos = {
  arcade: "assets/videos/아케이드 테마.mp4",
  metalSlug: "assets/videos/메탈슬러그 테마.mp4",
  starWars: "assets/videos/스타워즈 테마.mp4",
  hymnBattle: "assets/videos/마귀들과 싸울지라.mp4",
};

function showScreen(screenId) {
  const nextScreen = screens[screenId];

  if (!nextScreen) {
    console.error("Unknown screen:", screenId);
    return;
  }

  Object.values(screens).forEach((screen) => {
    screen.classList.toggle("active", screen === nextScreen);
    screen.setAttribute("aria-hidden", String(screen !== nextScreen));
  });
}

function getRandomTheme() {
  const themes = ["arcade", "metalSlug", "starWars", "hymnBattle"];
  return themes[Math.floor(Math.random() * themes.length)];
}

function selectTheme(theme) {
  if (isThemeStarting) {
    return;
  }

  isThemeStarting = true;
  selectedTheme = theme === "random" ? getRandomTheme() : theme;
  showTransition(selectedTheme);
}

function showTransition(theme) {
  const imageSrc = transitionImages[theme];

  if (!imageSrc) {
    console.error("No transition image for theme:", theme);
    isThemeStarting = false;
    showScreen("mapSelectScreen");
    return;
  }

  window.clearTimeout(transitionTimer);
  transitionImage.src = imageSrc;
  showScreen("transitionScreen");

  transitionTimer = window.setTimeout(() => {
    playThemeVideo(theme);
  }, 1000);
}

function playThemeVideo(theme) {
  const videoSrc = themeVideos[theme];

  if (!videoSrc) {
    console.error("No video source for theme:", theme);
    finishGame();
    return;
  }

  gameVideo.pause();
  gameVideo.removeAttribute("src");
  gameVideo.load();
  gameVideo.src = videoSrc;
  gameVideo.currentTime = 0;
  showScreen("videoScreen");

  gameVideo.play().catch((error) => {
    console.error("Video play failed:", error);
    finishGame();
  });
}

function finishGame() {
  window.clearTimeout(transitionTimer);
  window.clearTimeout(endTimer);
  showScreen("endScreen");

  endTimer = window.setTimeout(() => {
    resetGame();
    showScreen("startScreen");
  }, 3000);
}

function resetGame() {
  window.clearTimeout(transitionTimer);
  window.clearTimeout(endTimer);

  selectedPlayerMode = null;
  selectedTwoPlayerMode = null;
  selectedTheme = null;
  isThemeStarting = false;

  gameVideo.pause();
  gameVideo.removeAttribute("src");
  gameVideo.load();
  transitionImage.removeAttribute("src");
}

document.querySelector('[data-action="start"]').addEventListener("click", () => {
  resetGame();
  showScreen("playerSelectScreen");
});

document.querySelector('[data-action="select-one"]').addEventListener("click", () => {
  selectedPlayerMode = "one";
  selectedTwoPlayerMode = null;
  showScreen("mapSelectScreen");
});

document.querySelector('[data-action="select-two"]').addEventListener("click", () => {
  selectedPlayerMode = "two";
  selectedTwoPlayerMode = null;
  showScreen("twoPlayerModeScreen");
});

document.querySelector('[data-action="select-cooperation"]').addEventListener("click", () => {
  selectedTwoPlayerMode = "cooperation";
  showScreen("mapSelectScreen");
});

document.querySelector('[data-action="select-versus"]').addEventListener("click", () => {
  selectedTwoPlayerMode = "versus";
  showScreen("mapSelectScreen");
});

document.querySelectorAll("#mapSelectScreen .hotspot").forEach((button) => {
  button.addEventListener("click", () => {
    selectTheme(button.dataset.theme);
  });
});

document.querySelectorAll("img").forEach((image) => {
  image.addEventListener("error", () => {
    console.error("Image failed to load:", image.getAttribute("src"));
  });
});

gameVideo.addEventListener("ended", finishGame);

gameVideo.addEventListener("error", () => {
  const mediaError = gameVideo.error;
  console.error("Video failed to load:", gameVideo.currentSrc || gameVideo.src, mediaError);

  if (screens.videoScreen.classList.contains("active")) {
    finishGame();
  }
});

showScreen("startScreen");
