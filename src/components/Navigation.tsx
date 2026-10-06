import { Navbar, Container, NavDropdown, Nav } from "react-bootstrap";
import { axiosInstance } from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import logoRose from "../assets/logo.png";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { UserAvatar } from "../modules/UserAvatar";

export type User = {
  "username": string;
  "role": string;
  "permissions": string[]
}

const Navigation = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    axiosInstance.get("/auth/info")
      .then(res => setUser(res.data))
      .catch(err => console.error("Ошибка загрузки профиля", err));
  }, []);

  const logOut = async () => {
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
    <Navbar expand="lg" style={{ backgroundColor: "#FFD369" }}>
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="mx-3">
            Система учета АПС, ОС, СОУЭ
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarNavDropdown" />
          <Navbar.Collapse id="navbarNavDropdown">
            <Nav className="me-auto">
              <NavDropdown title="Справочники" id="navbarDropdownMenuLink">
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
                <NavDropdown.Item as={Link} to="/documents">Документы</NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="Журналы" id="navbarDropdownMenuLink">
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
              <NavDropdown title="Графики" id="navbarDropdownMenuLink">
                <NavDropdown.Item as={Link} to="/schedules/train">
                  График ТО ПС и СОУЭ
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/schedules/subject">
                  График ТО ОС
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link as={Link} to="/report">Отчеты</Nav.Link>
            </Nav>

            <Nav className="ms-auto align-items-center">
            <NavDropdown title={<UserAvatar user={user} />} id="user-profile-dropdown" align="end">
              <NavDropdown.Item as={Link} to="/change_psswd">
                Смена пароля
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logOut} className="text-danger">
                Выйти
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          </Navbar.Collapse>
          <img src={logoRose} alt="Logo" className="rose mx-2" />
        </Container>
      </Navbar>
  );
};

export default Navigation;
