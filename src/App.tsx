import React from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/app.css";

import { AuthProvider } from "./contexts/AuthProvider";
import Navigation from "./components/layout/Navigation";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import TableBuilder from "./components/table/TableBuilder";

import Login from "./pages/auth/Login";
import ChangePassword from "./pages/auth/ChangePassword";
import MainPage from "./pages/main/MainPage";
import AdminPanel from "./pages/admin/AdminPanel";
import ReportsPage from "./pages/report/ReportsPage";
import ExcelViewer from "./components/excel/ExcelViewer";

// Формы создания
import AddOneField from "./pages/creation/dictionaries/AddOneField";
import AddOrg from "./pages/creation/dictionaries/AddOrg";
import AddMTeam from "./pages/creation/dictionaries/AddMTeam";
import AddMaintenanceType from "./pages/creation/dictionaries/AddMaintenanceType";
import AddDetectors from "./pages/creation/detectors/AddDetectors";
import AddDocument from "./pages/creation/documents/AddDocument";
import AddStations from "./pages/creation/stations/AddStations";
import AddTrain from "./pages/creation/train/AddTrain";
import AddObjectOS from "./pages/creation/objectsOS/AddObjectOS";

// Черновики
import DraftsTableOS from "./pages/drafts/DraftsTableOS";
import DraftsTableTrain from "./pages/drafts/DraftsTableTrain";
import DraftsTableStation from "./pages/drafts/DraftsTableStation";

function AppContent() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/login" && <Navigation />}
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Роуты администратора */}
        <Route
          element={<ProtectedRoute allowedRoles={["ROLE_ADMIN", "ADMIN"]} />}
        >
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        {/* Авторизованные рабочие маршруты */}
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

          {/* Справочники */}
          <Route
            path="/station_names"
            element={
              <TableBuilder
                req="/station_names"
                pageTitle="Справочник - Наименования станций"
                createText="Создать наименование"
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
                placeHolder="Введите наименование"
              />
            }
          />

          <Route
            path="/maintenance_teams"
            element={
              <TableBuilder
                req="/maintenance_teams"
                pageTitle="Справочник - Обслуживающие бригады"
                createText="Создать бригаду"
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
                placeHolder="Введите название"
              />
            }
          />

          <Route
            path="/orgs"
            element={
              <TableBuilder
                req="/orgs"
                pageTitle="Справочник - Подразделения и организации"
                createText="Создать организацию"
                notShowedEdit={["id"]}
              />
            }
          />
          <Route path="/orgs/add" element={<AddOrg endPoint="/orgs" />} />

          <Route
            path="/detector_types"
            element={
              <TableBuilder
                req="/detector_types"
                pageTitle="Справочник - Типы извещателей и датчиков"
                createText="Создать тип"
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
                placeHolder="Введите тип датчика"
              />
            }
          />

          <Route
            path="/detectors"
            element={
              <TableBuilder
                req="/detectors"
                pageTitle="Справочник - Извещатели и датчики"
                createText="Создать датчик"
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
                pageTitle="Справочник - Коды регламентных работ"
                createText="Создать код"
                notShowedEdit={["id"]}
              />
            }
          />
          <Route
            path="/work_type_codes/add"
            element={
              <AddOneField
                endPoint="/work_type_codes"
                prevPage="Коды регламентных работ"
                title="Форма добавления кода регламентной работы"
                titleLabel="Код вида регламентной работы:"
                placeHolder="Введите код"
              />
            }
          />

          <Route
            path="/work_types"
            element={
              <TableBuilder
                req="/work_types"
                pageTitle="Справочник - Виды регламентных работ"
                createText="Создать вид работы"
                notShowedEdit={["КФ", "ОСМ", "КИ", "Обсл", "Пров", "ПР"]}
              />
            }
          />
          <Route
            path="/work_types/add"
            element={<AddMaintenanceType endPoint="/work_types" />}
          />

          <Route
            path="/documents"
            element={
              <TableBuilder
                req="/documents"
                pageTitle="Справочник - Документы"
                createText="Загрузить документ"
                notShowedEdit={["id"]}
              />
            }
          />
          <Route
            path="/documents/add"
            element={<AddDocument endPoint="/documents" />}
          />

          {/* Журналы */}
          <Route
            path="/stations"
            element={
              <TableBuilder
                req="/stations"
                pageTitle="Учёт станций ПС, ОС, ОПС"
                createText="Добавить станцию"
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
            path="/trains"
            element={
              <TableBuilder
                req="/trains"
                pageTitle="Журнал - Учёт шлейфов ПС"
                createText="Добавить шлейф"
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
                pageTitle="Журнал - Учёт объектов ОС"
                createText="Добавить объект ОС"
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

          {/* Графики */}
          <Route
            path="/schedules/train"
            element={<ExcelViewer req="/schedules/train" header="ТО ПС СОУЭ" />}
          />
          <Route
            path="/schedules/subject"
            element={<ExcelViewer req="/schedules/subject" header="ТО ОС" />}
          />

          {/* Отчеты */}
          <Route path="/report" element={<ReportsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
