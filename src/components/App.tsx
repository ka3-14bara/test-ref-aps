import "../styles/App.css";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import Navigation from "./Navigation";
import 'bootstrap-icons/font/bootstrap-icons.css';
import Login from "./Login";
import TableBuilder from "../modules/TableBuilder";
import { AuthProvider } from "../contexts/AuthProvider";
import ProtectedRoute from "../modules/ProtectedRoute";
import MainPage from "./MainPage";
import ExcelViewer from "./createPages/ExcelViewer";
import AddOneField from "./createPages/AddOneField";
import AddOrgs from "./createPages/AddOrg";
import AddTrain from "./createPages/addTrain/AddTrain";
import AddDetectors from "./createPages/AddDetectors";
import AddMaintenanceType from "./createPages/AddMaintenanceType";
import AddStations from "./createPages/AddStations";
import AddDocument from "./createPages/AddDocument";
import DraftsTableOS from "./DraftsTableOS";
import DraftsTableTrain from "./DraftsTableTrain";
import DraftsTableStation from "./DraftsTableStation";
import AdminPannel from "./AdminPanel";
import ChangePassword from "./ChangePassword";
import AddMTeam from "./createPages/AddMTeam";
import ReportsPage from "./report/ReportsPage";
import AddObjectOS from "./createPages/addObjectsOS/AddObjectOS";

function AppContent() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/login" && <Navigation />}
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Группируем защищенные маршруты */}
        <Route
          element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ADMIN"]} />}
        >
          <Route path="/admin" element={<AdminPannel />} />
        </Route>
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "ROLE_ADMIN",
                "ADMIN",
                "ROLE_MANAGER",
                "MANAGER",
                "ROLE_USER",
                "USER",
              ]}
            />
          }
        >
          <Route path="/" element={<MainPage />} />

          <Route path="/change_psswd" element={<ChangePassword />} />

          <Route
            path="/station_names"
            element={
              <TableBuilder
                req="/station_names"
                isShowAdd={true}
                pageTitle="Справочник - Наименования станций"
                createText="Создать новую"
                notShowedEdit={[]}
              />
            }
          />
          <Route
            path="/station_names/add"
            element={
              <AddOneField
                endPoint="/station_names"
                prevPage="Наименования станций"
                title="Справочник - Форма добавления наименования станции"
                titleLabel="Наименование станции:"
                placeHolder="Наименование станции"
              />
            }
          />

          <Route
            path="/maintenance_teams"
            element={
              <TableBuilder
                req="/maintenance_teams"
                isShowAdd={true}
                pageTitle="Справочник - Обслуживающие бригады"
                createText="Создать новую"
                notShowedEdit={["id"]}
              />
            }
          />
          <Route
            path="/maintenance_teams/add"
            element={
              <AddMTeam
                endPoint="/maintenance_teams"
                prevPage="Обслуживающие бригады"
                title="Форма добавления обслуживающей бригады"
                titleLabel="Название обслуживающей бригады:"
                placeHolder="Название обслуживающей бригады"
              />
            }
          />

          <Route
            path="/stations"
            element={
              <TableBuilder
                req="/stations"
                isShowAdd={true}
                pageTitle="Учёт станций ПС, ОС, ОПС"
                createText="Создать новую"
                notShowedEdit={["КФ", "ОСМ", "КИ", "Обсл", "Пров", "ПР"]}
                draftPage="/stations/add/drafts"
              />
            }
          />
          <Route
            path="/stations/add"
            element={<AddStations endPoint="/stations" />}
          />
          <Route path="/stations/add/drafts" element={<DraftsTableStation />} />

          <Route
            path="/detector_types"
            element={
              <TableBuilder
                req="/detector_types"
                isShowAdd={true}
                pageTitle="Справочник - Типы извещателей и датчиков"
                createText="Создать новый"
                notShowedEdit={[]}
              />
            }
          />
          <Route
            path="/detector_types/add"
            element={
              <AddOneField
                endPoint="/detector_types"
                prevPage="Типы извещателей и датчиков"
                title="Форма добавления типа датчика"
                titleLabel="Тип датчика:"
                placeHolder="Тип датчика"
              />
            }
          />

          <Route
            path="/orgs"
            element={
              <TableBuilder
                req="/orgs"
                isShowAdd={true}
                pageTitle="Справочник - Подразделения и организации"
                createText="Создать новое"
                notShowedEdit={["id"]}
              />
            }
          />
          <Route path="/orgs/add" element={<AddOrgs endPoint="/orgs" />} />

          <Route
            path="/detectors"
            element={
              <TableBuilder
                req="/detectors"
                isShowAdd={true}
                pageTitle="Справочник - Извещатели и датчики"
                createText="Создать новый"
                notShowedEdit={[]}
              />
            }
          />
          <Route
            path="/detectors/add"
            element={<AddDetectors endPoint="/detectors" />}
          />

          <Route
            path="/work_type_codes"
            element={
              <TableBuilder
                req="/work_type_codes"
                isShowAdd={true}
                pageTitle="Справочник - Коды видов регламентных работ"
                createText="Создать новый"
                notShowedEdit={["id"]}
              />
            }
          />
          <Route
            path="/work_type_codes/add"
            element={
              <AddOneField
                endPoint="/work_type_codes"
                prevPage="Коды видов регламентных работ"
                title="Форма добавления кодов видов регламентных работ"
                titleLabel="Название код вида регламентной работы:"
                placeHolder="Название кода регламентной работы"
              />
            }
          />

          <Route
            path="/work_types"
            element={
              <TableBuilder
                req="/work_types"
                isShowAdd={true}
                pageTitle="Справочник - Виды регламентных работ"
                createText="Создать новый"
                notShowedEdit={["КФ", "ОСМ", "КИ", "Обсл", "Пров", "ПР"]}
              />
            }
          />
          <Route
            path="/work_types/add"
            element={<AddMaintenanceType endPoint="/work_types" />}
          />

          <Route
            path="/trains"
            element={
              <TableBuilder
                req="/trains"
                isShowAdd={true}
                pageTitle="Журнал - Учёт шлейфов ПС"
                createText="Создать новый"
                notShowedEdit={["КФ", "ОСМ", "КИ", "Обсл", "Пров", "ПР"]}
                draftPage="/trains/add/drafts"
              />
            }
          />
          <Route path="/trains/add" element={<AddTrain endPoint="/trains" />} />
          <Route path="/trains/add/drafts" element={<DraftsTableTrain />} />
          <Route
            path="/subjects"
            element={
              <TableBuilder
                req="/subjects"
                isShowAdd={true}
                pageTitle="Журнал - Учёт объектов ОС"
                createText="Создать новый"
                notShowedEdit={["id"]}
                draftPage="/subjects/add/drafts"
              />
            }
          />
          <Route
            path="/subjects/add"
            element={<AddObjectOS endPoint="/subjects" />}
          />
          <Route path="/subjects/add/drafts" element={<DraftsTableOS />} />
          <Route
            path="/schedules/train"
            element={<ExcelViewer req="/schedules/train" header="ТО ПС СОУЭ" />}
          />
          <Route
            path="/schedules/subject"
            element={<ExcelViewer req="/schedules/subject" header="ТО ОС" />}
          />
          <Route
            path="/documents"
            element={
              <TableBuilder
                req="/documents"
                isShowAdd={true}
                pageTitle="Справочник - Документы"
                createText="Создать новый"
                notShowedEdit={["id"]}
              />
            }
          />
          <Route
            path="/documents/add"
            element={<AddDocument endPoint="/documents" />}
          />
        </Route>

        <Route path="/report" element={<ReportsPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
