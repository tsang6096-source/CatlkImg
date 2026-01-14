import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n"; // 初始化国际化
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { initSecurity } from "./utils/security";

// 初始化安全防护
initSecurity();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper>
      <App />
    </AppWrapper>
  </StrictMode>
);
