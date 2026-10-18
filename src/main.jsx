import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './components/App/App'

const rootElement = document.getElementById('root');
let rubberCenteredWidth = 0;
const rubberCenterObserver = new ResizeObserver(() => {
  const overflow = rootElement.scrollWidth - rootElement.clientWidth;
  if (overflow <= 0 || rootElement.scrollWidth === rubberCenteredWidth) return;
  rubberCenteredWidth = rootElement.scrollWidth;
  rootElement.scrollLeft = overflow / 2;
});
new MutationObserver(() => {
  [...rootElement.children].forEach((child) => rubberCenterObserver.observe(child));
}).observe(rootElement, { childList: true });

const pressTarget = (event) => event.target.closest?.("button:not(:disabled), [role=button], a[class*=button]");
let pressedElement = null;
const pressDown = (element) => {
  if (!element) return;
  releasePress();
  delete element.dataset.uiReleased;
  element.dataset.uiPressed = "";
  pressedElement = element;
};
const releasePress = () => {
  const element = pressedElement;
  if (!element) return;
  pressedElement = null;
  delete element.dataset.uiPressed;
  element.dataset.uiReleased = "";
  setTimeout(() => delete element.dataset.uiReleased, 320);
};
document.addEventListener("pointerdown", (event) => {
  if (event.button === 0) pressDown(pressTarget(event));
}, true);
["pointerup", "pointercancel"].forEach((type) => document.addEventListener(type, releasePress, true));
window.addEventListener("blur", releasePress);
document.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && !event.repeat) pressDown(pressTarget(event));
}, true);
document.addEventListener("keyup", (event) => {
  if (event.key === "Enter" || event.key === " ") releasePress();
}, true);

let rubberResizeTimer = null;
window.addEventListener("resize", () => {
  document.documentElement.classList.add("rubber-resizing");
  clearTimeout(rubberResizeTimer);
  rubberResizeTimer = setTimeout(() => document.documentElement.classList.remove("rubber-resizing"), 200);
});

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </BrowserRouter>
);
