import { FormDataObjectOS as FormDataOS } from "./createPages/AddTypes";
import DraftsTable from "./DraftsTable"; 

const DraftsTableOS = () => {
  return (
    <DraftsTable<FormDataOS>
      title="Черновики объектов (ПС)"
      storageKey="objectOS_drafts_list"
      createPath="/subjects/add" // Куда вернуться при нажатии "Выбрать"
      parrentPageText="Учет объектов ОС"
      parrentPageUrl="/subjects"
      prevPageText="Форма добавления объекта ОС"
      columns={[
        {
          header: "№ объекта",
          render: (d) => d.number || "—"
        },
        {
          header: "Наименование",
          render: (d) => d.name || "—"
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
          header: "№ прибора",
          render: (d) => d.adminStation?.number || "—"
        },
        {
          header: "№ станции",
          render: (d) => d.station?.number || "—"
        },
        {
          header: "Номер телефона",
          render: (d) => d.phone || "—",
        },
        { 
          header: "Координаты", 
          render: (d) => d.coordinates || "—" 
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

export default DraftsTableOS;
