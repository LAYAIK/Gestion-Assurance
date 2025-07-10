import RegisterRoute from "./RegisterRoute.js";
import LoginLogoutRoute from "./AuthRoute.js";
import ProfileRoute from "./ProfileRoute.js";
import GestionUtilisateurRoute from "./GestionUtilisateurRoute.js";
import askRoute from "./AskRoute.js";
import ClientRoute from "./ClientRoute.js";
import RoleRoute from "./RoleRoute.js";
import TypeAssuranceRoute from "./TypeAssuranceRoute.js";
import ContratAssuranceRoute from "./ContratAssuranceRoute.js";
import VehiculeRoute from "./VehiculeRoute.js";
import DossierRoute from "./DossierRoute.js";
import SinistreRoute from "./SinistreRoute.js";
import HistoriqueEventRoute from "./HistoriqueEventRoute.js";
import IndemnisationSinistreRoute from "./IndemnisationSinistreRoute.js";
import RapprochementBancaireRoute from "./RapprochementBancaireRoute.js";
import ArchiveRoute from "./ArchiveRoute.js";
import DocumentRoute from "./DocumentRoute.js";
import AnalyticsRoute from "./AnalyticsRoute.js";


const ApiRoutes = (app) => {
    app.use(RegisterRoute);
    app.use('/auth',LoginLogoutRoute);
    app.use(ProfileRoute);
    app.use(GestionUtilisateurRoute);
    app.use(askRoute);
    app.use('/api/clients',ClientRoute);
    app.use(RoleRoute);
    app.use(TypeAssuranceRoute);
    app.use(ContratAssuranceRoute);
    app.use(VehiculeRoute);
    app.use(DossierRoute);
    app.use(SinistreRoute);
    app.use(HistoriqueEventRoute);
    app.use(IndemnisationSinistreRoute);
    app.use(RapprochementBancaireRoute);
    app.use(ArchiveRoute);
    app.use(DocumentRoute);
    app.use('/api/analytics',AnalyticsRoute);
    
}

export default ApiRoutes;