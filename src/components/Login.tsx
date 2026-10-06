import { useEffect, useState } from "react";
import { axiosInstance, useAxiosInterceptor } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Новое поле
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // Глазик для подтверждения
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("login");

  const [passwordOk, setPasswordOk] = useState(true);
  const [usernameOk, setUsernameOk] = useState(true);
  const [matchOk, setMatchOk] = useState(true); // Состояние совпадения паролей

  const navigate = useNavigate();
  const { login } = useAuth();
  useAxiosInterceptor();

  const isLogin = type === "login";

  const changeType = () => {
    setType(type === "login" ? "register" : "login");
    setError(null);
    setConfirmPassword(""); // Сбрасываем при переключении
  };

  useEffect(() => {
    const pattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

    if (isLogin) {
      setUsernameOk(true);
      setPasswordOk(true);
      setMatchOk(true);
    } else {
      setUsernameOk(username.length >= 5);
      setPasswordOk(pattern.test(password));
      setMatchOk(password === confirmPassword);
    }
  }, [username, password, confirmPassword, type, isLogin]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!isLogin && (!passwordOk || !usernameOk || !matchOk)) return;

    setLoading(true);
    setError(null);
    try {
      const endPoint = isLogin ? "/auth/login" : "/auth/register";
      // Формируем базовые данные
      const payload: { username: string; password: string; roleName?: string } =
        {
          username,
          password,
        };

      // Если это регистрация, добавляем роль
      if (!isLogin) {
        payload.roleName = "USER";
      }

      const response = await axiosInstance.post(endPoint, payload);

      if (response.status === 200 || response.status === 201) {
        await login();
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Ошибка. Проверьте введенные данные.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Card
        style={{ width: "100%", maxWidth: "450px" }}
        className="shadow border-0"
      >
        <Card.Body className="p-4">
          <h2 className="text-center mb-4" style={{ fontWeight: "600" }}>
            {isLogin ? "Вход" : "Регистрация"}
          </h2>

          {error && (
            <Alert variant="danger" className="py-2">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* Логин */}
            <Form.Group className="mb-3">
              <Form.Label>Имя пользователя:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                isInvalid={!usernameOk && !isLogin}
                required
              />
              <Form.Control.Feedback type="invalid">
                Логин от 5 символов
              </Form.Control.Feedback>
            </Form.Group>

            {/* Пароль */}
            <Form.Group className="mb-3">
              <Form.Label>Пароль:</Form.Label>
              <InputGroup hasValidation>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isInvalid={!passwordOk && !isLogin}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                </Button>
                <Form.Control.Feedback type="invalid">
                  Нужно 8+ символов, цифра, заглавная и строчная буквы
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            {/* Повтор пароля (только при регистрации) */}
            {!isLogin && (
              <Form.Group className="mb-4">
                <Form.Label>Подтверждение пароля:</Form.Label>
                <InputGroup hasValidation>
                  <Form.Control
                    type={showConfirm ? "text" : "password"}
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    isInvalid={!matchOk && confirmPassword.length > 0}
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    <i
                      className={`bi bi-eye${showConfirm ? "-slash" : ""}`}
                    ></i>
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    Пароли не совпадают
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            )}

            <Button
              type="submit"
              disabled={
                loading ||
                (!isLogin && (!passwordOk || !usernameOk || !matchOk))
              }
              className="w-100 py-2 mb-3"
              style={{
                backgroundColor: "#FFD369",
                border: "none",
                color: "#000",
                fontWeight: "bold",
              }}
            >
              {loading ? (
                <Spinner size="sm" animation="border" className="me-2" />
              ) : null}
              {isLogin ? (loading ? "Вход..." : "Войти") : "Зарегистрироваться"}
            </Button>
          </Form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={changeType}
              className="text-decoration-none shadow-none text-muted"
            >
              {isLogin ? "Зарегистрироваться" : "Назад на страницу входа"}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
