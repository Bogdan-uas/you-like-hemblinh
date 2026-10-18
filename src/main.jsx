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
