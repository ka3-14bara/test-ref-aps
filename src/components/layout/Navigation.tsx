import React, { useEffect, useState } from "react";
import { Navbar, Container, NavDropdown, Nav } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { axiosInstance } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { User } from "../../types/api";
import UserAvatar from "../common/UserAvatar";
import logoImg from "../../assets/logo.png";

export const Navigation: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    axiosInstance
      .get<User>("/auth/info")
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Ошибка загрузки профиля", err));
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Ошибка при логауте:", error);
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <Navbar
      expand="lg"
      style={{ backgroundColor: "#FFD369" }}
      className="shadow-sm mb-3"
    >
      <Container fluid className="px-4">
        <Navbar.Brand
          as={Link}
          to="/"
          className="fw-bold text-dark d-flex align-items-center gap-2"
        >
          <i className="bi bi-shield-check fs-4"></i>
          Система учета АПС, ОС, СОУЭ
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            <NavDropdown title="Справочники" id="nav-dropdown-dictionaries">
              <NavDropdown.Item as={Link} to="/station_names">
                Наименования станций
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/orgs">
                Подразделения и организации
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/maintenance_teams">
                Обслуживающие бригады
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/detector_types">
                Типы извещателей и датчиков
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/detectors">
                Извещатели и датчики
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/work_type_codes">
                Коды видов регламентных работ
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/work_types">
                Виды регламентных работ
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/documents">
                Документы
              </NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="Журналы" id="nav-dropdown-journals">
              <NavDropdown.Item as={Link} to="/stations">
                Учет станций ПС, ОС, ОПС
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/trains">
                Учет шлейфов ПС
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/subjects">
                Учет объектов ОС
              </NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="Графики" id="nav-dropdown-schedules">
              <NavDropdown.Item as={Link} to="/schedules/train">
                График ТО ПС и СОУЭ
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/schedules/subject">
                График ТО ОС
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Link as={Link} to="/report">
              Отчеты
            </Nav.Link>
          </Nav>

          <Nav className="ms-auto align-items-center gap-3">
            <NavDropdown
              title={<UserAvatar user={user} />}
              id="user-profile-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/change_psswd">
                <i className="bi bi-key me-2"></i> Смена пароля
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i> Выйти
              </NavDropdown.Item>
            </NavDropdown>

            <img
              src={logoImg}
              alt="Logo"
              style={{ height: "36px", objectFit: "contain" }}
              className="d-none d-xl-block ms-2"
            />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
