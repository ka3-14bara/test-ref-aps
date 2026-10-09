import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { axiosInstance } from "../../api/client";

export const ChangePassword: React.FC = () => {
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

  const [errors, setErrors] = useState({
    match: "",
    sameAsOld: "",
    pattern: "",
  });

  const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  useEffect(() => {
    const newErrors = { match: "", sameAsOld: "", pattern: "" };

    if (formData.newPassword && !passwordPattern.test(formData.newPassword)) {
      newErrors.pattern =
        "Пароль должен содержать минимум 8 символов, цифру, заглавную и строчную буквы";
    }

    if (
      formData.newPassword &&
      formData.oldPassword &&
      formData.newPassword === formData.oldPassword
    ) {
      newErrors.sameAsOld = "Новый пароль не должен совпадать со старым";
    }

    if (
      formData.confirmPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.match = "Пароли не совпадают";
    }

    setErrors(newErrors);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      setStatus({
        type: "danger",
        msg:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Ошибка при смене пароля",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Boolean(errors.match || errors.sameAsOld || errors.pattern);

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
          <h4 className="text-center mb-4 fw-bold">Смена пароля</h4>

          {status.msg && (
            <Alert variant={status.type} className="py-2 small">
              {status.msg}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">
                Текущий пароль
              </Form.Label>
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
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                >
                  <i className={`bi bi-eye${showOld ? "-slash" : ""}`}></i>
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">
                Новый пароль
              </Form.Label>
              <InputGroup hasValidation>
                <Form.Control
                  type={showNew ? "text" : "password"}
                  isInvalid={Boolean(errors.pattern || errors.sameAsOld)}
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  required
                />
                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                >
                  <i className={`bi bi-eye${showNew ? "-slash" : ""}`}></i>
                </Button>
                <Form.Control.Feedback type="invalid">
                  {errors.pattern || errors.sameAsOld}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-semibold">
                Подтвердите новый пароль
              </Form.Label>
              <InputGroup hasValidation>
                <Form.Control
                  type={showConfirm ? "text" : "password"}
                  isInvalid={Boolean(errors.match)}
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
                  type="button"
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
              className="w-100 py-2 fw-bold"
              disabled={loading || hasErrors}
              style={{
                backgroundColor: "#FFD369",
                borderColor: "#E5BD55",
                color: "#000",
              }}
            >
              {loading ? (
                <Spinner size="sm" animation="border" className="me-2" />
              ) : null}
              Обновить пароль
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ChangePassword;
