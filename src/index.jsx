import { createRoot } from 'react-dom/client'
import { CookiesProvider } from "react-cookie";
import Router from "./containers/Router.jsx";

createRoot(document.getElementById('root')).render(
    <CookiesProvider defaultSetOptions={{ path: '/' }}>
        <Router />
    </CookiesProvider>
)
