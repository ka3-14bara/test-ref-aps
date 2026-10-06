import DraftsTable from "./DraftsTable"; 
import { FormDataStation } from "./createPages/AddTypes";

const DraftsTrainPage = () => {
  return (
    <DraftsTable<FormDataStation>
      title="Черновики станций (ПС, ОС, ОПС)"
      storageKey="objectPsOsOps_drafts_list"
      createPath="/stations/add" // Куда вернуться при нажатии "Выбрать"
      parrentPageText="Учет станций ПС, ОС, ОПС"
      parrentPageUrl="/stations"
      prevPageText="Форма добавления учета станции"
      columns={[
        {
          header: "Тип станции",
          render: (d) => d.typeDisplayValue || "—"
        },
        {
          header: "№ станции",
          render: (d) => d.number || "—",
        },
        {
          header: "Наименование станции",
          render: (d) => d.name?.title || "—",
        },
        { 
          header: "Ёмкость", 
          render: (d) => d.capacity || "—" 
        },
        {
          header: "Норматив",
          render: (d) => d.normative || "—",
        },
        {
          header: "Нумерация шлейфов",
          render: (d) => ("от " + (d.objectsNumberFrom  ?? "—") + " до " + (d.objectsNumberTo  ?? "—")),
        },
        { 
          header: "Инвентарный номер", 
          render: (d) => d.inventoryNumber || "—" 
        },
        { 
          header: "Место установки", 
          render: (d) => d.installationLocation || "—"
        },
        {
          header: "Дата ввода в эксплуатацию",
          render: (d) => d.dateEntered || "—",
        },
        {
          header: "Дата корректировки",
          render: (d) => d.dateAdjusted || "—",
        },
        { 
          header: "Звук", 
          render: (d) => d.sound || "—"
        },
        { 
          header: "Свет-звук", 
          render: (d) => d.lightSound || "—"
        },
        { 
          header: "Речь", 
          render: (d) => d.voice || "—"
        },
        { 
          header: "Свет", 
          render: (d) => d.light || "—"
        },
        { 
          header: "АПС", 
          render: (d) => d.supplyFireAlarmQuantity || "—"
        },
        { 
          header: "СОУЭ", 
          render: (d) => d.supplyWarningEvacuationControlQuantity || "—"
        },
        {
          header: "Комментарий",
          render: (d) => d.comment || "—",
        },
      ]}
    />
  );
};

export default DraftsTrainPage;

