import RegisterRoute from "./RegisterRoute.js";
import LoginRoute from "./AuthRoute.js";
import ProfileRoute from "./ProfileRoute.js";
import GestionUtilisateurRoute from "./GestionUtilisateurRoute.js";
import askRoute from "./AskRoute.js";



const ApiRoutes = (app) => {
    app.use(RegisterRoute);
    app.use(LoginRoute);
    app.use(ProfileRoute);
    app.use(GestionUtilisateurRoute);
    app.use(askRoute);
}

export default ApiRoutes;