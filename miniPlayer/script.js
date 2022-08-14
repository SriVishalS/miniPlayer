const video = document.querySelector("video");
const fullscreen = document.querySelector(".full-screen");
const playPause = document.querySelector(".play-pause");
const volume = document.querySelector(".volume");
const currentTime = document.querySelector(".current-time");
const duration = document.querySelector(".duration");
const buffer = document.querySelector(".buffer");
const totalDuration = document.querySelector(".total-duration");
const currentDuration = document.querySelector(".current-duration");
const controls = document.querySelector(".controls");
const videoContainer = document.querySelector(".video-container");
const currentVol = document.querySelector(".current-vol");
const totalVol = document.querySelector(".max-vol");
const mainPlayPause = document.querySelector(".play-pause-main");
const muteUnmute = document.querySelector(".mute-unmute");
const forward = document.querySelector(".forward");
const backward = document.querySelector(".backward");

let isPlaying = false,
  mouseDownProgress = false,
  mouseDownVol = false,
  isCursorOnControls = false,
  isFullscreen = false,
  muted = false,
  timeout,
  interval,
  volumeVal = 1;

currentVol.style.width = volumeVal * 100 + "%";

// Video Event Listeners
video.addEventListener("canplay", canPlayInit);
video.addEventListener("play", play);
video.addEventListener("pause", pause);
video.addEventListener("progress", handleProgress);
video.addEventListener("click", handleMainPlayPause);

fullscreen.addEventListener("click", handleFullscreen);

playPause.addEventListener("click", (e) => {
  if (!isPlaying) {
    play();
  } else {
    pause();
  }
});

duration.addEventListener("click", navigate);

duration.addEventListener("mousedown", (e) => {
  mouseDownProgress = true;
  navigate(e);
});

totalVol.addEventListener("mousedown", (e) => {
  mouseDownVol = true;
  handleVolume(e);
});

document.addEventListener("mouseup", (e) => {
  mouseDownProgress = false;
  mouseDownVol = false;
});

document.addEventListener("mousemove", (e) => {
  const totalDurationRect = duration.getBoundingClientRect();
  const totalVolRect = totalVol.getBoundingClientRect();

  if (
    mouseDownProgress &&
    totalDurationRect.width >= e.clientX - totalDurationRect.x
  ) {
    navigate(e);
  }
  if (mouseDownVol && totalVolRect.width >= e.clientX - totalVolRect.x) {
    handleVolume(e);
  }
});

videoContainer.addEventListener("mouseout", hideControls);
videoContainer.addEventListener("mousemove", (e) => {
  controls.classList.add("show-controls");
  hideControls();
});

controls.addEventListener("mouseover", (e) => {
  controls.classList.add("show-controls");
  isCursorOnControls = true;
});

controls.addEventListener("mouseout", (e) => {
  isCursorOnControls = false;
});

mainPlayPause.addEventListener("click", handleMainPlayPause);

mainPlayPause.onanimationend = function () {
  mainPlayPause.classList.remove("animate-main-play-pause");
};

muteUnmute.addEventListener("click", handleMuteUnmute);

muteUnmute.addEventListener("mouseover", (e) => {
  if (!muted) {
    totalVol.classList.add("show");
  } else {
    totalVol.classList.remove("show");
  }
});

muteUnmute.addEventListener("mouseout", (e) => {
  if (e.relatedTarget != volume) {
    totalVol.classList.remove("show");
  }
});

forward.addEventListener("click", () => {
  video.currentTime += 5;
  handleProgressBar();
});

backward.addEventListener("click", () => {
  video.currentTime -= 5;
  handleProgressBar();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }
});

function canPlayInit() {
  totalDuration.innerHTML = `${Math.floor(video.duration / 60)}:${Math.floor(
    video.duration % 60
  )}`;
  video.volume = volumeVal;
  muted = video.muted;
  if (video.paused) {
    controls.classList.add("show-controls");
    mainPlayPause.classList.add("show-main-play-pause");
  }
}

function play() {
  video.play();
  isPlaying = true;
  playPause.innerHTML = `<ion-icon name="pause-outline"></ion-icon>`;
  mainPlayPause.innerHTML = `<ion-icon name="pause-outline"></ion-icon>`;
  mainPlayPause.classList.remove("show-main-play-pause");
  watchInterval();
}

function watchInterval() {
  interval = requestAnimationFrame(watchInterval);
  handleProgressBar();
}

function handleProgressBar() {
  currentTime.style.width = (video.currentTime / video.duration) * 100 + "%";
  currentDuration.innerHTML = `${Math.floor(
    video.currentTime / 60
  )}:${Math.floor(video.currentTime % 60)}`;
}

function pause() {
  video.pause();
  isPlaying = false;
  playPause.innerHTML = `<ion-icon name="play-outline"></ion-icon>`;
  mainPlayPause.classList.add("show-main-play-pause");
  controls.classList.add("show-controls");
  mainPlayPause.innerHTML = `<ion-icon name="play-outline"></ion-icon>`;
  if (video.ended) {
    currentTime.style.width = 100 + "%";
  }
  cancelAnimationFrame(interval);
}

function navigate(e) {
  const totalDurationRect = duration.getBoundingClientRect();
  currentTime.style.width = e.clientX - totalDurationRect.x + "px";
  const currentTimeWidth = currentTime.getBoundingClientRect().width;
  video.currentTime =
    (currentTimeWidth / totalDurationRect.width) * video.duration;
  currentDuration.innerHTML = `${Math.floor(
    video.currentTime / 60
  )}:${Math.floor(video.currentTime % 60)}`;
}

function handleMuteUnmute() {
  if (!muted) {
    video.volume = 0;
    muted = true;
    muteUnmute.innerHTML = `<ion-icon name="volume-mute-outline"></ion-icon>`;
    totalVol.classList.remove("show");
  } else {
    video.volume = volumeVal;
    muted = false;
    totalVol.classList.add("show");
    muteUnmute.innerHTML = `<ion-icon name="volume-high-outline"></ion-icon>`;
  }
}

function hideControls() {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    if (isPlaying && !isCursorOnControls) {
      controls.classList.remove("show-controls");
    }
  }, 1000);
}

function handleMainPlayPause() {
  if (!isPlaying) {
    mainPlayPause.classList.add("animate-main-play-pause");
    play();
  } else {
    pause();
  }
}

function handleVolume(e) {
  const totalVolRect = totalVol.getBoundingClientRect();
  currentVol.style.width = e.clientX - totalVolRect.x + "px";
  volumeVal = (e.clientX - totalVolRect.x) / totalVolRect.width;
  volumeVal = volumeVal >= 0 ? volumeVal : 0;
  video.volume = volumeVal;
}

function handleProgress() {
  if (!video.buffered || !video.buffered.length) {
    return;
  }
  const width = (video.buffered.end(0) / video.duration) * 100 + "%";
  buffer.style.width = width;
}

function handleFullscreen() {
  if (!isFullscreen) {
    videoContainer.requestFullscreen();
    videoContainer.classList.add("fullscreen");
    fullscreen.innerHTML = `<ion-icon name="contract-outline"></ion-icon>`;
    isFullscreen = true;
  } else {
    document.exitFullscreen();
    videoContainer.classList.remove("fullscreen");
    fullscreen.innerHTML = `<ion-icon name="scan-outline"></ion-icon>`;
    isFullscreen = false;
  }
}
