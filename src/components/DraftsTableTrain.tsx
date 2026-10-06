import DraftsTable from "./DraftsTable"; 
import { FormDataTrain } from "./createPages/AddTypes";

const DraftsTrainPage = () => {
  return (
    <DraftsTable<FormDataTrain>
      title="Черновики шлейфов (ПС)"
      storageKey="objectPS_drafts_list"
      createPath="/trains/add" // Куда вернуться при нажатии "Выбрать"
      parrentPageText="Учёт шлейфов ПС"
      parrentPageUrl="/trains"
      prevPageText="Форма добавления шлейфа"
      columns={[
        {
          header: "№ станции",
          render: (d) => d.stationNumberValue || "—"
        },
        {
          header: "Организация",
          render: (d) => d.org?.shortTitle || d.org?.title || "—",
        },
        {
          header: "Бригада",
          render: (d) => d.mteam?.title || "—",
        },
        {
          header: "Длина шлейфа",
          render: (d) => d.length || "—",
        },
        { 
          header: "№ шлейфа", 
          render: (d) => d.number || "—" 
        },
        {
          header: "Трудоемкость шлейфа",
          render: (d) => d.trainLaboriousness || "—",
        },
        {
          header: "Место установки",
          render: (d) => d.location || "—",
        },
        { 
          header: "Координаты", 
          render: (d) => d.sectionNumber || "—" 
        },
        { 
          header: "Номер раздела", 
          render: (d) => d.sectionNumber || "—"
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
          header: "Проектная документация",
          render: (d) => d.projectDoc?.title || "—",
        },
        {
          header: "Акт ввода в эксплуатацию",
          render: (d) => d.commissionDoc?.title || "—",
        },
        {
          header: "Исполнительная документация",
          render: (d) => d.adminDoc?.title || "—",
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

