// src/components/createPages/addObjectOS/MassCreationFormItemObjectOS.tsx
import React from 'react';
import SearchableInput from '../../../modules/SearchableInput';
import {
  Organization,
  MaintenanceTeam,
  Document,
  DetectorItem,
  FormDataStation,
  SelectedDetector,
  FormDataObjectOS,
  MassCreationForm,
} from '../AddTypes';

interface MassCreationFormItemObjectOSProps {
  form: MassCreationForm<FormDataObjectOS>;
  index: number;
  commonFields: (keyof FormDataObjectOS)[];
  onUpdate: (updates: Partial<MassCreationForm<FormDataObjectOS>>) => void;
  onRemove: () => void;
  isRemovable: boolean;
}

const MassCreationFormItemObjectOS: React.FC<MassCreationFormItemObjectOSProps> = ({
  form,
  index,
  commonFields,
  onUpdate,
  onRemove,
  isRemovable,
}) => {
  const isDisabled = form.status === 'success';

  const handleFieldChange = (field: keyof FormDataObjectOS, value: any) => {
    if (isDisabled) return;
    onUpdate({
      formData: { ...form.formData, [field]: value },
    });
  };

  // Датчики
  const handleDetectorAdd = () => {
    const newDetector: SelectedDetector = {
      rowId: Date.now() + Math.random() * 10000,
      detector: null,
      quantity: 1,
    };
    onUpdate({
      selectedDetectors: [...form.selectedDetectors, newDetector],
    });
  };
  const handleDetectorUpdate = (rowId: number, updates: Partial<SelectedDetector>) => {
    const updated = form.selectedDetectors.map((d: SelectedDetector) =>
      d.rowId === rowId ? { ...d, ...updates } : d
    );
    onUpdate({ selectedDetectors: updated });
  };
  const handleDetectorRemove = (rowId: number) => {
    const updated = form.selectedDetectors.filter((d: SelectedDetector) => d.rowId !== rowId);
    onUpdate({ selectedDetectors: updated });
  };

  const isCommonField = (field: keyof FormDataObjectOS) => commonFields.includes(field);

  return (
    <div
      className={`card mb-4 ${
        form.status === 'error'
          ? 'border-danger'
          : form.status === 'success'
          ? 'border-success'
          : 'border-secondary'
      }`}
    >
      <div
        className={`card-header d-flex justify-content-between align-items-center ${
          form.status === 'success'
            ? 'bg-success text-white'
            : form.status === 'error'
            ? 'bg-danger text-white'
            : 'bg-secondary text-white'
        }`}
      >
        <span>📝 Объект ОС #{index + 1}</span>
        <div className="d-flex gap-2">
          {form.status === 'success' && <span className="badge bg-light text-dark">✓ Создан</span>}
          {form.status === 'error' && <span className="badge bg-light text-dark">✗ Ошибка</span>}
          {form.status === 'submitting' && <span className="badge bg-light text-dark">⏳ Отправка...</span>}
          {isRemovable && !isDisabled && (
            <button type="button" className="btn btn-sm btn-outline-light" onClick={onRemove}>
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="card-body">
        {form.errorMessage && <div className="alert alert-danger mb-3">{form.errorMessage}</div>}

        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor={`number-${form.id}`} className="form-label">
              Номер объекта <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              id={`number-${form.id}`}
              className={`form-control ${form.formData.number == null ? 'is-invalid' : ''}`}
              value={form.formData.number ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : parseFloat(e.target.value);
                handleFieldChange('number', val);
              }}
              placeholder="000.00"
              style={{ height: '50px' }}
              disabled={isDisabled || isCommonField('number')}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor={`name-${form.id}`} className="form-label">
              Наименование <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id={`name-${form.id}`}
              className={`form-control ${!form.formData.name ? 'is-invalid' : ''}`}
              value={form.formData.name ?? ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Объекта охраны"
              style={{ height: '50px' }}
              disabled={isDisabled || isCommonField('name')}
              required
            />
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <label htmlFor={`organization-${form.id}`} className="form-label">
              Организация <span className="text-danger">*</span>
            </label>
            <SearchableInput<Organization>
              endpoint="/orgs/all"
              commentParam="shortTitle"
              onItemSelected={(item) => handleFieldChange('org', item)}
              inputId={`organization-${form.id}`}
              style={{ height: '50px' }}
              isRequired={true}
              isDisabled={isDisabled || isCommonField('org')}
              showAfterReload={form.formData.org?.title ?? ''}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor={`mteam-${form.id}`} className="form-label">
              Бригада <span className="text-danger">*</span>
            </label>
            <SearchableInput<MaintenanceTeam>
              endpoint="/maintenance_teams/all"
              commentParam="orgShortTitle"
              onItemSelected={(item) => handleFieldChange('mteam', item)}
              inputId={`mteam-${form.id}`}
              style={{ height: '50px' }}
              isRequired={true}
              isDisabled={isDisabled || isCommonField('mteam')}
              showAfterReload={form.formData.mteam?.title ?? ''}
            />
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <label htmlFor={`station-${form.id}`} className="form-label">
              Номер прибора на объекте
            </label>
            <SearchableInput<FormDataStation>
              endpoint="/stations/all"
              onItemSelected={(item) => handleFieldChange('station', item)}
              inputId={`station-${form.id}`}
              searchAndShowParam="number"
              commentParam={(item) => item?.name?.title ?? ''}
              style={{ height: '50px' }}
              isDisabled={isDisabled || isCommonField('station')}
              showAfterReload={form.formData.station?.number?.toString() ?? ''}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor={`adminStation-${form.id}`} className="form-label">
              Номер станции
            </label>
            <SearchableInput<FormDataStation>
              endpoint="/stations/all"
              onItemSelected={(item) => handleFieldChange('adminStation', item)}
              inputId={`adminStation-${form.id}`}
              searchAndShowParam="number"
              commentParam={(item) => item?.name?.title ?? ''}
              style={{ height: '50px' }}
              isDisabled={isDisabled || isCommonField('adminStation')}
              showAfterReload={form.formData.adminStation?.number?.toString() ?? ''}
            />
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-md-4">
            <label htmlFor={`phone-${form.id}`} className="form-label">
              Телефон
            </label>
            <input
              type="text"
              id={`phone-${form.id}`}
              className="form-control"
              value={form.formData.phone ?? ''}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              placeholder="Телефон"
              style={{ height: '50px' }}
              disabled={isDisabled || isCommonField('phone')}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor={`coordinates-${form.id}`} className="form-label">
              Координаты
            </label>
            <input
              type="text"
              id={`coordinates-${form.id}`}
              className="form-control"
              value={form.formData.coordinates ?? ''}
              onChange={(e) => handleFieldChange('coordinates', e.target.value)}
              placeholder="Координаты"
              style={{ height: '50px' }}
              disabled={isDisabled || isCommonField('coordinates')}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor={`dateEntered-${form.id}`} className="form-label">
              Дата ввода
            </label>
            <input
              type="date"
              id={`dateEntered-${form.id}`}
              className="form-control"
              value={form.formData.dateEntered ?? ''}
              onChange={(e) => handleFieldChange('dateEntered', e.target.value)}
              style={{ height: '50px' }}
              disabled={isDisabled || isCommonField('dateEntered')}
            />
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-md-4">
            <label htmlFor={`dateAdjusted-${form.id}`} className="form-label">
              Дата корректировки
            </label>
            <input
              type="date"
              id={`dateAdjusted-${form.id}`}
              className="form-control"
              value={form.formData.dateAdjusted ?? ''}
              onChange={(e) => handleFieldChange('dateAdjusted', e.target.value)}
              style={{ height: '50px' }}
              disabled={isDisabled || isCommonField('dateAdjusted')}
            />
          </div>
        </div>

        {/* Датчики */}
        <div className="mt-3">
          <div className="d-flex align-items-center mb-2">
            <label className="form-label mb-0">Датчики</label>
            <button
              type="button"
              className="btn btn-sm btn-outline-success mx-1"
              onClick={handleDetectorAdd}
              disabled={isDisabled}
            >
              + Добавить
            </button>
          </div>
          {form.selectedDetectors.map((item: SelectedDetector, detIndex: number) => (
            <div key={item.rowId} className="row mb-2 align-items-end gx-2">
              <div className="col-md-8">
                <label htmlFor={`detector-${form.id}-${item.rowId}`} className="form-label small">
                  Датчик #{detIndex + 1}
                </label>
                <SearchableInput<DetectorItem>
                  endpoint="/detectors/all"
                  onItemSelected={(data) => handleDetectorUpdate(item.rowId, { detector: data })}
                  inputId={`detector-${form.id}-${item.rowId}`}
                  style={{ height: '40px' }}
                  isDisabled={isDisabled}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small">Количество</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={item.quantity === 0 ? '' : item.quantity}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value) || 0;
                    handleDetectorUpdate(item.rowId, { quantity: qty });
                  }}
                  style={{ height: '40px' }}
                  disabled={isDisabled}
                />
              </div>
              <div className="col-md-1">
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ height: '40px' }}
                  onClick={() => handleDetectorRemove(item.rowId)}
                  disabled={isDisabled}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3 mt-1">
          <div className="col-md-4">
            <label htmlFor={`projectDoc-${form.id}`} className="form-label">
              Проектная документация
            </label>
            <SearchableInput<Document>
              endpoint="/documents/project"
              onItemSelected={(item) => handleFieldChange('projectDoc', item)}
              inputId={`projectDoc-${form.id}`}
              style={{ height: '50px' }}
              isDisabled={isDisabled || isCommonField('projectDoc')}
              showAfterReload={form.formData.projectDoc?.title ?? ''}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor={`commissionDoc-${form.id}`} className="form-label">
              Акт ввода
            </label>
            <SearchableInput<Document>
              endpoint="/documents/comission"
              onItemSelected={(item) => handleFieldChange('commissionDoc', item)}
              inputId={`commissionDoc-${form.id}`}
              style={{ height: '50px' }}
              isDisabled={isDisabled || isCommonField('commissionDoc')}
              showAfterReload={form.formData.commissionDoc?.title ?? ''}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor={`adminDoc-${form.id}`} className="form-label">
              Исполнительная документация
            </label>
            <SearchableInput<Document>
              endpoint="/documents/admin"
              onItemSelected={(item) => handleFieldChange('adminDoc', item)}
              inputId={`adminDoc-${form.id}`}
              style={{ height: '50px' }}
              isDisabled={isDisabled || isCommonField('adminDoc')}
              showAfterReload={form.formData.adminDoc?.title ?? ''}
            />
          </div>
        </div>

        <div className="mt-3">
          <label htmlFor={`comment-${form.id}`} className="form-label">
            Комментарий
          </label>
          <textarea
            id={`comment-${form.id}`}
            className="form-control"
            rows={2}
            value={form.formData.comment ?? ''}
            onChange={(e) => handleFieldChange('comment', e.target.value)}
            placeholder="Комментарий"
            disabled={isDisabled}
          />
        </div>
      </div>
    </div>
  );
};

export default MassCreationFormItemObjectOS;