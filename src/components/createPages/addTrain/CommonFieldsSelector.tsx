// CommonFieldsSelector.tsx
import React from 'react';
import SearchableInput from '../../../modules/SearchableInput';
import { Organization, MaintenanceTeam, Document, FormDataStation } from '../AddTypes';

interface CommonFieldOption {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'select' | 'object';
}

const COMMON_FIELD_OPTIONS: CommonFieldOption[] = [
  { key: 'stationNumberValue', label: 'Номер станции', type: 'string' },
  { key: 'org', label: 'Организация', type: 'object' },
  { key: 'mteam', label: 'Обслуживающая бригада', type: 'object' },
  { key: 'number', label: 'Номер шлейфа', type: 'number' },
  { key: 'length', label: 'Длина шлейфа', type: 'number' },
  //{ key: 'trainLaboriousness', label: 'Трудоемкость шлейфа', type: 'number' },
  //{ key: 'location', label: 'Место установки', type: 'string' },
  { key: 'coordinates', label: 'Координаты установки', type: 'string' },
  { key: 'sectionNumber', label: 'Номер раздела', type: 'number' },
  { key: 'dateEntered', label: 'Дата ввода в эксплуатацию', type: 'date' },
  { key: 'dateAdjusted', label: 'Дата корректировки', type: 'date' },
  { key: 'projectDoc', label: 'Проектная документация', type: 'object' },
  { key: 'commissionDoc', label: 'Акт ввода в эксплуатацию', type: 'object' },
  { key: 'adminDoc', label: 'Исполнительная документация', type: 'object' },
];

interface CommonFieldsSelectorProps {
  commonFields: string[]; 
  commonFieldValues: Record<string, any>;
  onToggleField: (field: string) => void;
  onValueChange: (field: string, value: any) => void; 
}

const CommonFieldsSelector: React.FC<CommonFieldsSelectorProps> = ({
  commonFields,
  commonFieldValues,
  onToggleField,
  onValueChange,
}) => {
  const handleCheckboxChange = (field: string) => {
    if (commonFields.includes(field)) {
      onToggleField(field); 
    } else if (commonFields.length < 15) {
      onToggleField(field); 
    }
  };

  const renderFieldInput = (field: string) => {
    const value = commonFieldValues[field];
    const onChange = (val: any) => onValueChange(field, val);

    switch (field) {
      case 'org':
        return (
          <SearchableInput<Organization>
            endpoint="/orgs/all"
            commentParam="shortTitle"
            onItemSelected={(item) => onChange(item)}
            inputId={`common-${field}`}
            style={{ height: '40px' }}
            isRequired={true}
          />
        );
      case 'mteam':
        return (
          <SearchableInput<MaintenanceTeam>
            endpoint="/maintenance_teams/all"
            commentParam="orgShortTitle"
            onItemSelected={(item) => onChange(item)}
            inputId={`common-${field}`}
            style={{ height: '40px' }}
            isRequired={true}
          />
        );
      case 'stationNumberValue':
        return (
          <SearchableInput<FormDataStation>
            endpoint="/stations/all"
            onItemSelected={(item) => {
              const stationName = item?.name?.title ?? '';
              const stationId = item?.id ?? null;
              onChange(item.number?.toString() ?? ''); 
              onValueChange("stationNameValue", stationName);
              onValueChange("stationId", stationId)
            }}
            inputId={`common-${field}`}
            searchAndShowParam="number"
            commentParam={(item) => item?.name?.title ?? 'Без названия'}
            style={{ height: '40px' }}
            isRequired={true}
          />
        );
      case 'dateEntered':
      case 'dateAdjusted':
        return (
          <input
            type="date"
            className="form-control"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            style={{ height: '40px' }}
          />
        );
      case 'sectionNumber':
      case 'length':
        return (
          <input
            type="number"
            className="form-control"
            value={value ?? ''}
            onChange={(e) => onChange(parseInt(e.target.value) || null)}
            placeholder="0"
            style={{ height: '40px' }}
          />
        );
      case 'number':
        return (
          <input
            type="text"
            className="form-control required"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="0.000"
            style={{ height: '40px' }}
            required={true}
          />
        );
      case 'trainLaboriousness':
        return (
          <input
            type="number"
            min="0"
            step="0.01"
            className="form-control"
            value={value ?? ''}
            onChange={(e) => onChange(+parseFloat(e.target.value).toFixed(3) || null)}
            placeholder="0.000"
            style={{ height: '40px' }}
          />
        );
      case 'adminDoc':
        return (
          <SearchableInput<Document>
            endpoint="/documents/admin"
            onItemSelected={(item) => onChange(item)}
            inputId={`common-${field}`}
            style={{ height: '40px' }}
          />
        );
      case 'commissionDoc':
        return (
          <SearchableInput
            endpoint="/documents/comission"
            onItemSelected={(item) => onChange(item)}
            inputId={`common-${field}`}
            style={{ height: '40px' }}
          />
        );
      case 'projectDoc':
        return (
          <SearchableInput
            endpoint="/documents/project"
            onItemSelected={(item) => onChange(item)}
            inputId={`common-${field}`}
            style={{ height: '40px' }}
          />
        );
      default:
        return (
          <input
            type="text"
            className="form-control"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            style={{ height: '40px' }}
          />
        );
    }
  };

  return (
    <div className="card mb-4 border-secondary">
      <div className="card-header border-secondary text-black" style={{ backgroundColor: '#FFD369' }}>
        <h5 className="mb-0">📋 Общие поля</h5>
      </div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-12">
            <p className="text-muted small">
              Выберите поля, которые будут одинаковыми для всех создаваемых объектов
            </p>
          </div>
        </div>
        <div className="row g-3">
          {COMMON_FIELD_OPTIONS.map((option) => (
            <div key={option.key} className="col-md-4 col-lg-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`common-${option.key}-checkbox`}
                  checked={commonFields.includes(option.key)}
                  onChange={() => handleCheckboxChange(option.key)}
                  disabled={commonFields.length >= 15 && !commonFields.includes(option.key)}
                />
                <label className="form-check-label" htmlFor={`common-${option.key}`}>
                  {option.label}
                </label>
              </div>
            </div>
          ))}
        </div>

        {commonFields.length > 0 && (
          <div className="mt-4 pt-3 border-top">
            <h6 className="mb-3">Значения общих полей:</h6>
            <div className="row g-3">
              {commonFields.map((fieldKey) => {
                const option = COMMON_FIELD_OPTIONS.find((o) => o.key === fieldKey);
                if (!option) return null;
                return (
                  <div key={fieldKey} className="col-md-4">
                    <label className="form-label">{option.label}</label>
                    {renderFieldInput(fieldKey)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommonFieldsSelector;