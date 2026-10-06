import { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { axiosInstance } from "../api/axios";

const ChangePassword = () => {

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  // Состояния валидации
  const [errors, setErrors] = useState({
    match: "",
    sameAsOld: "",
    pattern: "",
  });

  // Тот самый паттерн из страницы Login
  const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  useEffect(() => {
    const newErrors = { match: "", sameAsOld: "", pattern: "" };

    // 1. Проверка на паттерн (сложность пароля)
    if (formData.newPassword && !passwordPattern.test(formData.newPassword)) {
      newErrors.pattern =
        "Пароль должен содержать минимум 8 символов, цифру, заглавную и строчную буквы";
    }

    // 2. Проверка на совпадение со старым
    if (
      formData.newPassword &&
      formData.oldPassword &&
      formData.newPassword === formData.oldPassword
    ) {
      newErrors.sameAsOld = "Новый пароль не должен совпадать со старым";
    }

    // 3. Проверка подтверждения
    if (
      formData.confirmPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.match = "Пароли не совпадают";
    }

    setErrors(newErrors);
  }, [formData]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // Блокируем отправку, если есть хоть одна ошибка
    if (errors.match || errors.sameAsOld || errors.pattern) return;

    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      await axiosInstance.put("/auth/change_password", {
        currentPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.newPassword,
      });

      setStatus({ type: "success", msg: "Пароль успешно изменен!" });
    } catch (error: any) {
      setStatus({
        type: "danger",
        msg: error.response?.data?.detail || "Ошибка при смене пароля",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = !!(errors.match || errors.sameAsOld || errors.pattern);

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <Card
        style={{ width: "100%", maxWidth: "450px" }}
        className="shadow-sm border-0"
      >
        <Card.Body className="p-4">
          <h3 className="text-center mb-4">Смена пароля</h3>

          {status.msg && <Alert variant={status.type}>{status.msg}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Текущий пароль */}
            <Form.Group className="mb-3">
              <Form.Label>Текущий пароль</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showOld ? "text" : "password"}
                  value={formData.oldPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, oldPassword: e.target.value })
                  }
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowOld(!showOld)}
                >
                  <i className={`bi bi-eye${showOld ? "-slash" : ""}`}></i>
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Новый пароль */}
            <Form.Group className="mb-3">
              <Form.Label>Новый пароль</Form.Label>
              <InputGroup hasValidation>
                <Form.Control
                  type={showNew ? "text" : "password"}
                  isInvalid={!!errors.pattern || !!errors.sameAsOld}
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowNew(!showNew)}
                >
                  <i className={`bi bi-eye${showNew ? "-slash" : ""}`}></i>
                </Button>
                <Form.Control.Feedback type="invalid">
                  {errors.pattern || errors.sameAsOld}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            {/* Подтверждение */}
            <Form.Group className="mb-4">
              <Form.Label>Подтвердите новый пароль</Form.Label>
              <InputGroup hasValidation>
                <Form.Control
                  type={showConfirm ? "text" : "password"}
                  isInvalid={!!errors.match}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  <i className={`bi bi-eye${showConfirm ? "-slash" : ""}`}></i>
                </Button>
                <Form.Control.Feedback type="invalid">
                  {errors.match}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2"
              disabled={loading || hasErrors}
              style={{
                backgroundColor: "#FFD369",
                border: "none",
                color: "#000",
                fontWeight: "bold",
              }}
            >
              {loading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                "Обновить пароль"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ChangePassword;
