import { useEffect, useState } from "react";
import "./Preloader.css";

function waitForImage(img) {
  return new Promise((resolve) => {
    if (img.complete) return resolve();
    img.addEventListener("load", resolve, { once: true });
    img.addEventListener("error", resolve, { once: true });
  });
}

function waitForFonts() {
  return document.fonts ? document.fonts.ready : Promise.resolve();
}

// Is any part of the element inside the visible screen right now?
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  );
}

// Resolves when the video is REALLY playing (not paused, time advancing).
function waitForPlaying(video) {
  return new Promise((resolve) => {
    let done = false;

    const isPlaying = () =>
      !video.paused && video.currentTime > 0 && video.readyState >= 3;

    const finish = () => {
      if (done) return;
      done = true;
      video.removeEventListener("timeupdate", check);
      video.removeEventListener("playing", check);
      video.removeEventListener("error", finish);
      resolve();
    };

    const check = () => {
      if (isPlaying()) finish();
    };

    video.addEventListener("timeupdate", check);
    video.addEventListener("playing", check);
    video.addEventListener("error", finish);

    if (isPlaying()) return finish();

    // If the browser blocks autoplay (e.g. iOS Low Power Mode), the video
    // will never play by itself: don't keep the user waiting for nothing.
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch((error) => {
        if (error && error.name === "NotAllowedError") finish();
      });
    }
  });
}

// Resolves when the video has enough data to start.
function waitForCanPlay(video) {
  return new Promise((resolve) => {
    if (video.readyState >= 3) return resolve();
    video.addEventListener("canplay", resolve, { once: true });
    video.addEventListener("error", resolve, { once: true });
  });
}

function waitForVideo(video) {
  // Autoplay videos that are on screen must be actually playing.
  // The rest (off screen, or not autoplay) only need to be able to start:
  // Safari does not play off-screen videos, so waiting for them to play
  // would just hang until the safety timeout.
  if (video.autoplay && isInViewport(video)) {
    return waitForPlaying(video);
  }
  return waitForCanPlay(video);
}

export default function Preloader() {
  const [ready, setReady] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAll = async () => {
      const images = [...document.querySelectorAll("img")];
      const videos = [...document.querySelectorAll("video")];

      await Promise.all([
        waitForFonts(),
        ...images.map(waitForImage),
        ...videos.map(waitForVideo),
      ]);

      if (!cancelled) setReady(true);
    };

    const timeout = setTimeout(checkAll, 100);

    // Safety: never leave the user on black forever
    const maxWait = setTimeout(() => !cancelled && setReady(true), 20000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      clearTimeout(maxWait);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = ready ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [ready]);

  if (removed) return null;

  return (
    <div
      className={`preloader ${ready ? "preloader--hidden" : ""}`}
      onTransitionEnd={() => ready && setRemoved(true)}
    />
  );
}