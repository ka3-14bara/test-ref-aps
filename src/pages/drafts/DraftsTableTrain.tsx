import React from "react";
import DraftsTable from "./DraftsTable";
import { FormDataTrain } from "../../types/creation";

export const DraftsTableTrain: React.FC = () => {
  return (
    <DraftsTable<FormDataTrain>
      title="Черновики шлейфов (ПС)"
      storageKey="objectPS_drafts_list"
      createPath="/trains/add"
      parentPageText="Учёт шлейфов ПС"
      parentPageUrl="/trains"
      prevPageText="Форма добавления шлейфа"
      columns={[
        { header: "№ станции", render: (d) => d.stationNumberValue || "—" },
        {
          header: "Организация",
          render: (d) => d.org?.shortTitle || d.org?.title || "—",
        },
        { header: "Бригада", render: (d) => d.mteam?.title || "—" },
        { header: "Длина", render: (d) => d.length ?? "—" },
        { header: "№ шлейфа", render: (d) => d.number || "—" },
        { header: "Место установки", render: (d) => d.location || "—" },
        { header: "Координаты", render: (d) => d.coordinates || "—" },
        { header: "Номер раздела", render: (d) => d.sectionNumber ?? "—" },
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

export default DraftsTableTrain;
