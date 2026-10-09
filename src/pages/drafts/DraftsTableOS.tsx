import React from "react";
import DraftsTable from "./DraftsTable";
import { FormDataObjectOS } from "../../types/creation";

export const DraftsTableOS: React.FC = () => {
  return (
    <DraftsTable<FormDataObjectOS>
      title="Черновики объектов (ПС)"
      storageKey="objectOS_drafts_list"
      createPath="/subjects/add"
      parentPageText="Учет объектов ОС"
      parentPageUrl="/subjects"
      prevPageText="Форма добавления объекта ОС"
      columns={[
        { header: "№ объекта", render: (d) => d.number ?? "—" },
        { header: "Наименование", render: (d) => d.name || "—" },
        {
          header: "Организация",
          render: (d) => d.org?.shortTitle || d.org?.title || "—",
        },
        { header: "Бригада", render: (d) => d.mteam?.title || "—" },
        { header: "№ прибора", render: (d) => d.station?.number ?? "—" },
        { header: "№ станции", render: (d) => d.adminStation?.number ?? "—" },
        { header: "Телефон", render: (d) => d.phone || "—" },
        { header: "Координаты", render: (d) => d.coordinates || "—" },
        { header: "Дата ввода", render: (d) => d.dateEntered || "—" },
        { header: "Дата корр.", render: (d) => d.dateAdjusted || "—" },
        { header: "Проектная док.", render: (d) => d.projectDoc?.title || "—" },
        { header: "Акт ввода", render: (d) => d.commissionDoc?.title || "—" },
        { header: "Исполнит. док.", render: (d) => d.adminDoc?.title || "—" },
        { header: "Комментарий", render: (d) => d.comment || "—" },
      ]}
    />
  );
};

export default DraftsTableOS;
