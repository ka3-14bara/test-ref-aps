// src/components/createPages/addObjectOS/ObjectOSForm.tsx
import React from 'react';
import SearchableInput from '../../../modules/SearchableInput';
import { CreateItemModal } from '../../../modules/modal/CreateItemModal';
import { CreateDocumentModal } from '../../../modules/modal/CreateDocumentModal';
import {
  Organization,
  MaintenanceTeam,
  Document,
  DetectorItem,
  FormDataStation,
  SelectedDetector,
  FormDataObjectOS,
} from '../AddTypes';

interface ObjectOSFormProps {
  formData: FormDataObjectOS;
  setFormData: React.Dispatch<React.SetStateAction<FormDataObjectOS>>;
  selectedDetectors: SelectedDetector[];
  setSelectedDetectors: React.Dispatch<React.SetStateAction<SelectedDetector[]>>;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onSaveAsDraft: () => void;
  onBack: () => void;
  loading: boolean;
  error?: string | null;

  // Модалки
  isCreateModalOpenTeam: boolean;
  setIsCreateModalOpenTeam: (v: boolean) => void;
  isCreateModalOpenOrg: boolean;
  setIsCreateModalOpenOrg: (v: boolean) => void;
  isCreateModalOpenExecDoc: boolean;
  setIsCreateModalOpenExecDoc: (v: boolean) => void;
  isCreateModalOpenProjectDoc: boolean;
  setIsCreateModalOpenProjectDoc: (v: boolean) => void;
  isCreateModalOpenComissionDoc: boolean;
  setIsCreateModalOpenComissionDoc: (v: boolean) => void;
}

const ObjectOSForm: React.FC<ObjectOSFormProps> = ({
  formData,
  setFormData,
  selectedDetectors,
  setSelectedDetectors,
  onSubmit,
  onReset,
  onSaveAsDraft,
  onBack,
  loading,
  error,
  isCreateModalOpenTeam,
  setIsCreateModalOpenTeam,
  isCreateModalOpenOrg,
  setIsCreateModalOpenOrg,
  isCreateModalOpenExecDoc,
  setIsCreateModalOpenExecDoc,
  isCreateModalOpenProjectDoc,
  setIsCreateModalOpenProjectDoc,
  isCreateModalOpenComissionDoc,
  setIsCreateModalOpenComissionDoc,
}) => {
  const [localIdCounter, setLocalIdCounter] = React.useState(1);

  // Обработчики
  const handleOrgChange = (item: Organization) => {
    setFormData(prev => ({ ...prev, org: item }));
  };
  const handleTeamChange = (item: MaintenanceTeam) => {
    setFormData(prev => ({ ...prev, mteam: item }));
  };
  const handleStationChange = (item: FormDataStation) => {
    setFormData(prev => ({ ...prev, station: item }));
  };
  const handleAdminStationChange = (item: FormDataStation) => {
    setFormData(prev => ({ ...prev, adminStation: item }));
  };
  const handleProjectDocChange = (item: Document) => {
    setFormData(prev => ({ ...prev, projectDoc: item }));
  };
  const handleComssionActChange = (item: Document) => {
    setFormData(prev => ({ ...prev, commissionDoc: item }));
  };
  const handleExecDocChange = (item: Document) => {
    setFormData(prev => ({ ...prev, adminDoc: item }));
  };
  const handleDateEnteredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, dateEntered: e.target.value }));
  };
  const handleDateAdjustedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, dateAdjusted: e.target.value }));
  };
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, comment: e.target.value }));
  };
  const handleStrInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: keyof FormDataObjectOS) => {
    setFormData(prev => ({ ...prev, [name]: e.target.value }));
  };
  const handleFloatInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: keyof FormDataObjectOS) => {
    const value = e.target.value === '' ? null : parseFloat(e.target.value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Датчики
  const addDetectorRow = () => {
    setSelectedDetectors(prev => [
      ...prev,
      { rowId: localIdCounter, detector: null, quantity: 1 },
    ]);
    setLocalIdCounter(prev => prev + 1);
  };
  const handleDetectorSelect = (rowId: number, detectorData: DetectorItem) => {
    setSelectedDetectors(prev =>
      prev.map(item =>
        item.rowId === rowId ? { ...item, detector: detectorData } : item
      )
    );
  };
  const handleQuantityChange = (rowId: number, value: string) => {
    const qty = parseInt(value) || 0;
    setSelectedDetectors(prev =>
      prev.map(item =>
        item.rowId === rowId ? { ...item, quantity: qty } : item
      )
    );
  };
  const removeDetectorRow = (rowId: number) => {
    setSelectedDetectors(prev => prev.filter(item => item.rowId !== rowId));
  };

  // Модалки
  const handleOpenCreateModalTeam = () => setIsCreateModalOpenTeam(true);
  const handleCloseCreateModalTeam = () => setIsCreateModalOpenTeam(false);
  const handleOpenCreateModalOrg = () => setIsCreateModalOpenOrg(true);
  const handleCloseCreateModalOrg = () => setIsCreateModalOpenOrg(false);
  const handleOpenCreateModalExecDoc = () => setIsCreateModalOpenExecDoc(true);
  const handleCloseCreateModalExecDoc = () => setIsCreateModalOpenExecDoc(false);
  const handleOpenCreateModalProjectDoc = () => setIsCreateModalOpenProjectDoc(true);
  const handleCloseCreateModalProjectDoc = () => setIsCreateModalOpenProjectDoc(false);
  const handleOpenCreateModalComissionDoc = () => setIsCreateModalOpenComissionDoc(true);
  const handleCloseCreateModalComissionDoc = () => setIsCreateModalOpenComissionDoc(false);

  const maintenancaTeam = [
    { key: 'title', label: 'Обслуживающая бригада' },
    { key: 'orgShortTitle', label: 'Обслуживаемая организация' },
    { key: 'comment', label: 'Комментарий' },
  ];
  const organization = [
    { key: 'title', label: 'Полное наименование организации' },
    { key: 'shortTitle', label: 'Сокращенное наименование' },
    { key: 'responsible', label: 'ФИО ответственного лица' },
    { key: 'jobTitle', label: 'Должность' },
    { key: 'comment', label: 'Комментарий' },
  ];

  const handleCreateStation = () => {
    // навигация на добавление станции
    // можно передать из пропсов или использовать navigate внутри
    // Временно просто alert
    alert('Переход на страницу добавления станции');
  };

  return (
    <form onSubmit={onSubmit} onReset={onReset}>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex gap-4 mb-4">
        <div className="d-flex flex-column flex-grow-1" style={{ width: '50%' }}>
          <label htmlFor="numberObj" className="form-label">
            Номер объекта <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            id="numberObj"
            className={`form-control ${formData.number == null ? 'is-invalid' : ''}`}
            value={formData.number ?? ''}
            onChange={(e) => handleFloatInputChange(e, 'number')}
            autoComplete="off"
            placeholder="000.00"
            style={{ height: '50px' }}
            required
          />
        </div>
        <div className="d-flex flex-column flex-grow-1" style={{ width: '50%' }}>
          <label htmlFor="name" className="form-label">
            Наименование объекта охраны <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="name"
            className={`form-control ${!formData.name ? 'is-invalid' : ''}`}
            value={formData.name ?? ''}
            onChange={(e) => handleStrInputChange(e, 'name')}
            autoComplete="off"
            placeholder="Объекта охраны"
            style={{ height: '50px' }}
            required
          />
        </div>
      </div>

      <div className="d-flex gap-4 mb-4">
        <div className="d-flex flex-column flex-grow-1" style={{ width: '50%' }}>
          <label htmlFor="organization" className="form-label">
            Организация или подразделение <span className="text-danger">*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
            <SearchableInput<Organization>
              endpoint="/orgs/all"
              commentParam="shortTitle"
              onItemSelected={handleOrgChange}
              inputId="organization"
              style={{ height: '50px' }}
              isRequired={true}
              showAfterReload={formData.org?.title ?? ''}
            />
            <button type="button" className="btn btn-outline-success h-100" onClick={handleOpenCreateModalOrg}>
              +
            </button>
            <CreateItemModal<Organization>
              isOpen={isCreateModalOpenOrg}
              onClose={handleCloseCreateModalOrg}
              endPoint="/orgs"
              onSuccess={() => {}}
              headers={organization}
              initialData={{ title: ' ', shortTitle: ' ', responsible: ' ', jobTitle: ' ', comment: ' ', deleted: false }}
              onCreated={(createdOrg) => setFormData(prev => ({ ...prev, org: createdOrg }))}
            />
          </div>
        </div>
        <div className="d-flex flex-column flex-grow-1" style={{ width: '50%' }}>
          <label htmlFor="maintenanceTeams" className="form-label">
            Обслуживающая бригада <span className="text-danger">*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
            <SearchableInput<MaintenanceTeam>
              endpoint="/maintenance_teams/all"
              commentParam="orgShortTitle"
              onItemSelected={handleTeamChange}
              inputId="maintenanceTeams"
              style={{ height: '50px' }}
              isRequired={true}
              showAfterReload={formData.mteam?.title ?? ''}
            />
            <button type="button" className="btn btn-outline-success h-100" onClick={handleOpenCreateModalTeam}>
              +
            </button>
            <CreateItemModal<MaintenanceTeam>
              isOpen={isCreateModalOpenTeam}
              onClose={handleCloseCreateModalTeam}
              endPoint="/maintenance_teams"
              onSuccess={() => {}}
              headers={maintenancaTeam}
              initialData={{ title: ' ', comment: ' ', deleted: false }}
              onCreated={(createdTeam) => setFormData(prev => ({ ...prev, mteam: createdTeam }))}
            />
          </div>
        </div>
      </div>

      <div className="d-flex gap-4 mb-4">
        <div className="d-flex flex-column flex-grow-1" style={{ width: '40%' }}>
          <label htmlFor="adminStation" className="form-label">
            Номер станции
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
            <SearchableInput<FormDataStation>
              endpoint="/stations/all"
              onItemSelected={handleAdminStationChange}
              inputId="adminStation"
              searchAndShowParam="number"
              commentParam={(item) => item?.name?.title ?? ''}
              style={{ height: '50px' }}
              showAfterReload={formData.adminStation?.number?.toString() ?? ''}
            />
            <button type="button" className="btn btn-outline-success h-100" onClick={handleCreateStation}>
              +
            </button>
          </div>
        </div>
        <div className="d-flex flex-column flex-grow-1" style={{ width: '40%' }}>
          <label htmlFor="stationNumber" className="form-label">
            Номер прибора на объекте
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
            <SearchableInput<FormDataStation>
              endpoint="/stations/all"
              onItemSelected={handleStationChange}
              inputId="stationNumber"
              searchAndShowParam="number"
              commentParam={(item) => item?.name?.title ?? ''}
              style={{ height: '50px' }}
              showAfterReload={formData.station?.number?.toString() ?? ''}
            />
            <button type="button" className="btn btn-outline-success h-100" onClick={handleCreateStation}>
              +
            </button>
          </div>
        </div>
        <div className="d-flex flex-column flex-grow-1" style={{ width: '20%' }}>
          <label htmlFor="phone" className="form-label">
            Номер телефона
          </label>
          <input
            type="text"
            id="phone"
            className="form-control"
            value={formData.phone ?? ''}
            onChange={(e) => handleStrInputChange(e, 'phone')}
            autoComplete="off"
            placeholder="Номер телефона"
            style={{ height: '50px' }}
          />
        </div>
      </div>

      <div className="d-flex gap-4 mb-4">
        <div className="d-flex flex-column flex-grow-1" style={{ width: '50%' }}>
          <label htmlFor="coordinates" className="form-label">
            Координаты объекта охраны
          </label>
          <input
            type="text"
            id="coordinates"
            className="form-control"
            value={formData.coordinates ?? ''}
            onChange={(e) => handleStrInputChange(e, 'coordinates')}
            autoComplete="off"
            placeholder="Координаты"
            style={{ height: '50px' }}
          />
        </div>
        <div className="d-flex flex-column flex-grow-1" style={{ width: '25%' }}>
          <label htmlFor="dateEntered" className="form-label">
            Дата ввода в эксплуатацию
          </label>
          <input
            type="date"
            id="dateEntered"
            className="form-control"
            value={formData.dateEntered ?? ''}
            onChange={handleDateEnteredChange}
            style={{ height: '50px' }}
          />
        </div>
        <div className="d-flex flex-column flex-grow-1" style={{ width: '25%' }}>
          <label htmlFor="dateAdjusted" className="form-label">
            Дата корректировки
          </label>
          <input
            type="date"
            id="dateAdjusted"
            className="form-control"
            value={formData.dateAdjusted ?? ''}
            onChange={handleDateAdjustedChange}
            style={{ height: '50px' }}
          />
        </div>
      </div>

      {/* Датчики */}
      <div>
        <div className="container-fluid">
          <div className="row mb-3">
            <div className="col-auto">
              <label htmlFor="addDetector" className="form-label">
                Добавить датчик
              </label>
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-outline-success" onClick={addDetectorRow}>
                +
              </button>
            </div>
          </div>
          {selectedDetectors.map((item, index) => (
            <div key={item.rowId} className="row mb-3 align-items-end gx-2">
              <div className="col-md-4">
                <label htmlFor={`title-${item.rowId}`} className="form-label">
                  Датчик [№ {index + 1}]
                </label>
                <SearchableInput<DetectorItem>
                  endpoint="/detectors/all"
                  onItemSelected={(data) => handleDetectorSelect(item.rowId, data as DetectorItem)}
                  inputId={`title-${item.rowId}`}
                  style={{ height: '50px' }}
                />
              </div>
              <div className="col-auto d-flex align-items-end">
                <div className="me-2">
                  <label htmlFor={`quantity-${item.rowId}`} className="form-label">
                    Количество:
                  </label>
                  <input
                    type="number"
                    id={`quantity-${item.rowId}`}
                    value={item.quantity === 0 ? '' : item.quantity}
                    onChange={(e) => handleQuantityChange(item.rowId, e.target.value)}
                    className="form-control"
                    min="1"
                    style={{ width: '80px', height: '50px' }}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ height: '50px' }}
                  onClick={() => removeDetectorRow(item.rowId)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="d-flex gap-4 mb-4">
        <div className="d-flex flex-column flex-grow-1" style={{ width: '33%' }}>
          <label htmlFor="projectDoc" className="form-label">
            Проектная документация
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
            <SearchableInput<Document>
              endpoint="/documents/project"
              onItemSelected={handleProjectDocChange}
              inputId="projectDoc"
              style={{ height: '50px' }}
            />
            <button type="button" className="btn btn-outline-success h-100" onClick={handleOpenCreateModalProjectDoc}>
              +
            </button>
            <CreateDocumentModal
              isOpen={isCreateModalOpenProjectDoc}
              onClose={handleCloseCreateModalProjectDoc}
              endPoint="/documents"
              onSuccess={() => {}}
              onCreated={(createdDoc) => setFormData(prev => ({ ...prev, projectDoc: createdDoc }))}
              docType="PROJECT"
            />
          </div>
        </div>
        <div className="d-flex flex-column flex-grow-1" style={{ width: '33%' }}>
          <label htmlFor="comissionAct" className="form-label">
            Акт ввода в эксплуатацию
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
            <SearchableInput<Document>
              endpoint="/documents/comission"
              onItemSelected={handleComssionActChange}
              inputId="comissionAct"
              style={{ height: '50px' }}
            />
            <button type="button" className="btn btn-outline-success h-100" onClick={handleOpenCreateModalComissionDoc}>
              +
            </button>
            <CreateDocumentModal
              isOpen={isCreateModalOpenComissionDoc}
              onClose={handleCloseCreateModalComissionDoc}
              endPoint="/documents"
              onSuccess={() => {}}
              onCreated={(createdDoc) => setFormData(prev => ({ ...prev, commissionDoc: createdDoc }))}
              docType="COMMISSION"
            />
          </div>
        </div>
        <div className="d-flex flex-column flex-grow-1" style={{ width: '33%' }}>
          <label htmlFor="executiveDoc" className="form-label">
            Исполнительная документация
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
            <SearchableInput<Document>
              endpoint="/documents/admin"
              onItemSelected={handleExecDocChange}
              inputId="executiveDoc"
              style={{ height: '50px' }}
            />
            <button type="button" className="btn btn-outline-success h-100" onClick={handleOpenCreateModalExecDoc}>
              +
            </button>
            <CreateDocumentModal
              isOpen={isCreateModalOpenExecDoc}
              onClose={handleCloseCreateModalExecDoc}
              endPoint="/documents"
              onSuccess={() => {}}
              onCreated={(createdDoc) => setFormData(prev => ({ ...prev, adminDoc: createdDoc }))}
              docType="ADMIN"
            />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="comment" className="form-label">
          Комментарий:
        </label>
        <textarea
          id="comment"
          className="form-control"
          rows={4}
          value={formData.comment ?? ''}
          onChange={handleCommentChange}
          autoComplete="off"
          placeholder="Комментарий"
        />
      </div>

      <div className="d-flex justify-content-start align-items-center gap-2">
        <button type="submit" className={`btn ${loading ? 'btn-secondary' : 'btn-success'}`} disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onSaveAsDraft}>
          В черновик
        </button>
        <button type="reset" className="btn btn-outline-warning">
          Сбросить
        </button>
        <button type="button" className="btn btn-secondary ms-auto" onClick={onBack}>
          Назад
        </button>
      </div>
    </form>
  );
};

export default ObjectOSForm;