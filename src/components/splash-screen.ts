import { I18n } from "../i18n/i18n";
import type { MascotOption } from "../types";

const SVG_NS = "http://www.w3.org/2000/svg";

export function renderSplashScreen(
  i18n: I18n,
  mascot?: MascotOption
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "comimi-splash";

  const logoWrap = document.createElement("div");
  logoWrap.className = "comimi-splash-logo-wrap";
  if (mascot) {
    logoWrap.classList.add("comimi-splash-logo-wrap-custom");
  }

  const logo = buildSplashLogo(mascot);
  if (logo) logoWrap.append(logo);

  const text = document.createElement("div");
  text.className = "comimi-splash-text";
  text.append(document.createTextNode(i18n.t("splash.loading")));
  for (let index = 0; index < 3; index += 1) {
    const dot = document.createElement("span");
    dot.textContent = ".";
    text.append(dot);
  }

  logoWrap.append(text);
  wrap.append(logoWrap);
  return wrap;
}

function buildSplashLogo(option?: MascotOption): HTMLElement | null {
  if (option === false) {
    return null;
  }

  if (option) {
    const customLogo = document.createElement("div");
    customLogo.className = "comimi-splash-custom-logo";

    if ("render" in option) {
      customLogo.append(option.render());
    } else {
      const img = document.createElement("img");
      img.src = option.src;
      img.alt = option.alt ?? "";
      img.draggable = false;
      customLogo.append(img);
    }
    return customLogo;
  }

  const logo = document.createElement("div");
  logo.className = "comimi-splash-logo";
  logo.append(buildDefaultSplashSymbol(), renderSplashTypo());
  return logo;
}

function buildDefaultSplashSymbol(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 112.19 99.01");
  svg.setAttribute("class", "comimi-splash-symbol");

  appendStrokePath(
    svg,
    "M17.43,53.54c-7.74,7.51-12.43,17.29-12.43,27.99,0,4.34.78,8.53,2.21,12.48"
  );
  appendStrokePath(
    svg,
    "M104.98,94.01c1.43-3.95,2.21-8.14,2.21-12.48,0-10.91-4.87-20.85-12.87-28.42"
  );
  appendStrokePath(
    svg,
    "M55.79,43.81v-24.02c3.43-9.18,9.81-15.08,20.52-14.52,16.12.84,20.31,15.9,19.35,34.15-.25,4.75-.69,9.25-1.51,13.3",
    "comimi-splash-mimi comimi-splash-mimi-left"
  );
  appendStrokePath(
    svg,
    "M55.79,43.62v-24.02c-3.25-9.2-9.34-15.11-19.78-14.56-16.53.87-21.21,15.95-20.25,34.2.26,4.91.67,9.56,1.51,13.72",
    "comimi-splash-mimi comimi-splash-mimi-right"
  );

  const body = document.createElementNS(SVG_NS, "path");
  body.setAttribute(
    "d",
    "M80.44,49.41H31.46c-12.97,6.71-21.6,18.57-21.6,32.1,0,5.8,1.59,11.3,4.43,16.21h83.34c2.83-4.92,4.43-10.41,4.43-16.21,0-13.53-8.63-25.4-21.6-32.1Z"
  );
  body.setAttribute("fill", "#e0e0e0");
  svg.append(body);

  const eyes = document.createElementNS(SVG_NS, "g");
  eyes.setAttribute("class", "comimi-splash-eyes");
  for (const cx of ["40.17", "71.58"]) {
    const eye = document.createElementNS(SVG_NS, "circle");
    eye.setAttribute("class", "comimi-splash-eye");
    eye.setAttribute("cx", cx);
    eye.setAttribute("cy", "78.21");
    eye.setAttribute("r", "6");
    eye.setAttribute("fill", "#fff");
    eyes.append(eye);
  }
  svg.append(eyes);

  return svg;
}

function renderSplashTypo(): HTMLDivElement {
  const wrap = document.createElement("div");
  wrap.className = "comimi-splash-typo-wrap";

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 227.74 38.52");
  svg.setAttribute("class", "comimi-splash-typo");

  const letters = [
    "M12.53,14.42c-3.15,3.27-3.15,8.45,0,11.6,1.58,1.58,3.6,2.36,5.74,2.36,2.25,0,4.28-.79,5.86-2.36,1.91-1.91,5.18-1.91,7.21,0,1.91,2.03,1.91,5.18,0,7.21-3.49,3.49-8.11,5.29-13.07,5.29s-9.46-1.8-12.95-5.29C-1.77,26.02-1.77,14.42,5.32,7.32,12.53.11,24.13.11,31.34,7.32c1.91,1.91,1.91,5.18,0,7.1-2.03,2.03-5.29,2.03-7.21,0-3.15-3.15-8.45-3.15-11.6,0Z",
    "M76.15,20.27c0,10.02-8.22,18.25-18.36,18.25-4.96,0-9.57-1.8-12.95-5.29-3.49-3.49-5.41-8.11-5.41-12.95,0-10.14,8.22-18.36,18.36-18.36s18.36,8.22,18.36,18.36ZM66.01,20.27c0-4.5-3.72-8.22-8.22-8.22s-8.22,3.72-8.22,8.22c0,2.14.9,4.17,2.36,5.74,1.58,1.58,3.6,2.36,5.86,2.36,4.5,0,8.22-3.6,8.22-8.11Z",
    "M131.42,15.88v17.57c0,2.82-2.25,5.07-5.07,5.07s-5.07-2.25-5.07-5.07V15.88c0-2.36-2.03-4.39-4.51-4.39-1.13,0-2.25.45-3.15,1.24-.79.9-1.24,2.03-1.24,3.15v14.57c0,2.82-2.25,5.07-5.07,5.07s-5.07-2.25-5.07-5.07v-14.57c0-2.36-2.03-4.39-4.5-4.39s-4.39,1.92-4.39,4.39v17.68c0,2.7-2.25,4.96-5.07,4.96s-5.07-2.25-5.07-5.07V15.88c0-8,6.53-14.53,14.53-14.53,3.72,0,6.98,1.35,9.57,3.49,2.59-2.25,5.97-3.49,9.46-3.49,8.11,0,14.64,6.53,14.64,14.53Z",
    "M150.98,5.07v28.38c0,2.82-2.25,5.07-5.07,5.07s-5.07-2.25-5.07-5.07V5.07c0-2.7,2.25-5.07,5.07-5.07s5.07,2.36,5.07,5.07Z",
    "M208.61,15.88v17.57c0,2.82-2.25,5.07-5.07,5.07s-5.07-2.25-5.07-5.07V15.88c0-2.36-2.03-4.39-4.51-4.39-1.13,0-2.25.45-3.15,1.24-.79.9-1.24,2.03-1.24,3.15v14.57c0,2.82-2.25,5.07-5.07,5.07s-5.07-2.25-5.07-5.07v-14.57c0-2.36-2.03-4.39-4.5-4.39s-4.39,1.92-4.39,4.39v17.68c0,2.7-2.25,4.96-5.07,4.96s-5.07-2.25-5.07-5.07V15.88c0-8,6.53-14.53,14.53-14.53,3.72,0,6.98,1.35,9.57,3.49,2.59-2.25,5.97-3.49,9.46-3.49,8.11,0,14.64,6.53,14.64,14.53Z",
    "M227.74,5.07v28.38c0,2.82-2.25,5.07-5.07,5.07s-5.07-2.25-5.07-5.07V5.07c0-2.7,2.25-5.07,5.07-5.07s5.07,2.36,5.07,5.07Z"
  ];

  for (const d of letters) {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "#fff");
    svg.append(path);
  }

  wrap.append(svg);

  const heart1 = document.createElement("div");
  heart1.className = "comimi-splash-heart comimi-splash-heart-1";
  const heart2 = document.createElement("div");
  heart2.className = "comimi-splash-heart comimi-splash-heart-2";
  wrap.append(heart1, heart2);

  return wrap;
}

function appendStrokePath(
  svg: SVGSVGElement,
  d: string,
  className?: string
): void {
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  path.setAttribute("class", `comimi-splash-stroke ${className ?? ""}`.trim());
  svg.append(path);
}
