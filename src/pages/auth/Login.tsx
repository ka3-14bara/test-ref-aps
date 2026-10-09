import React, { useEffect, useState } from "react";
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
import { axiosInstance, useAxiosInterceptor } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";

export const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"login" | "register">("login");

  const [passwordOk, setPasswordOk] = useState(true);
  const [usernameOk, setUsernameOk] = useState(true);
  const [matchOk, setMatchOk] = useState(true);

  const navigate = useNavigate();
  const { login } = useAuth();
  useAxiosInterceptor();

  const isLogin = type === "login";

  const changeType = () => {
    setType(isLogin ? "register" : "login");
    setError(null);
    setConfirmPassword("");
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
  }, [username, password, confirmPassword, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && (!passwordOk || !usernameOk || !matchOk)) return;

    setLoading(true);
    setError(null);

    try {
      const endPoint = isLogin ? "/auth/login" : "/auth/register";
      const payload: { username: string; password: string; roleName?: string } =
        {
          username,
          password,
        };

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
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card
        style={{ width: "100%", maxWidth: "440px" }}
        className="shadow-sm border-0"
      >
        <Card.Body className="p-4">
          <h3 className="text-center mb-4 fw-bold text-dark">
            {isLogin ? "Авторизация" : "Регистрация"}
          </h3>

          {error && (
            <Alert variant="danger" className="py-2 small">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">
                Имя пользователя
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                isInvalid={!usernameOk && !isLogin}
                required
              />
              <Form.Control.Feedback type="invalid">
                Логин должен быть от 5 символов
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">Пароль</Form.Label>
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
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                </Button>
                <Form.Control.Feedback type="invalid">
                  Минимум 8 символов, цифра, заглавная и строчная буквы
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            {!isLogin && (
              <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold">
                  Подтверждение пароля
                </Form.Label>
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
                    type="button"
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
              className="w-100 py-2 mb-3 fw-bold"
              style={{
                backgroundColor: "#FFD369",
                borderColor: "#E5BD55",
                color: "#000",
              }}
            >
              {loading ? (
                <Spinner size="sm" animation="border" className="me-2" />
              ) : null}
              {isLogin ? "Войти" : "Зарегистрироваться"}
            </Button>
          </Form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={changeType}
              className="text-decoration-none shadow-none text-muted small"
            >
              {isLogin
                ? "Нет учетной записи? Зарегистрироваться"
                : "Уже зарегистрированы? Войти"}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
