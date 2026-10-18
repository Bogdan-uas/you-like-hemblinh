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
const playPress = (element) => {
  if (!element) return;
  element.classList.remove("ui-pressed");
  void element.offsetWidth;
  element.classList.add("ui-pressed");
};
document.addEventListener("pointerdown", (event) => playPress(pressTarget(event)), true);
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") playPress(pressTarget(event));
}, true);
document.addEventListener("animationend", (event) => {
  if (event.animationName === "ui-press") event.target.classList.remove("ui-pressed");
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
