import React, { memo } from "react";

export const MainPage = memo(function MainPage() {
  const instructions = [
    {
      num: 1,
      title: "Управление страницами таблицы",
      desc: "Для навигации по записям используйте кнопки пагинации внизу страницы («Назад», «Вперед», конкретные номера страниц). Выпадающий список «Строк» позволяет выбрать отображение 10, 25, 50 или 100 записей одновременно.",
      icon: "bi-file-earmark-spreadsheet",
    },
    {
      num: 2,
      title: "Поиск по данным",
      desc: "В строке поиска можно осуществлять поиск по всем столбцам одновременно либо выбрать конкретный столбец из выпадающего списка. Поиск фильтрует записи мгновенно.",
      icon: "bi-search",
    },
    {
      num: 3,
      title: "Видимость столбцов",
      desc: "Кнопка «Видимость столбцов» позволяет скрывать или отображать нужные поля для комфортной работы на экранах ПК и ноутбуков без горизонтального перегруза.",
      icon: "bi-columns-gap",
    },
    {
      num: 4,
      title: "Сортировка по столбцам",
      desc: "Кликните по заголовку любого доступного столбца для переключения направления сортировки (по возрастанию / по убыванию).",
      icon: "bi-arrow-down-up",
    },
    {
      num: 5,
      title: "Отображение удаленных записей",
      desc: "По умолчанию удаленные записи скрыты. Нажатие кнопки «Показать удаленные» отображает архивные строки, подсвеченные красным цветом.",
      icon: "bi-eye",
    },
    {
      num: 6,
      title: "Массовые и одиночные действия",
      desc: "Отметьте чекбокс одной строки для редактирования или выберите несколько строк для массового удаления, восстановления либо пакетного изменения комментариев.",
      icon: "bi-check2-square",
    },
    {
      num: 7,
      title: "Система черновиков",
      desc: "Кнопка «В черновик» в формах сохраняет неполные данные в локальное хранилище браузера. Вы всегда можете вернуться к незавершенному вводу через раздел «Черновики».",
      icon: "bi-archive",
    },
  ];

  return (
    <div className="container-fluid px-4 py-3">
      <div className="card shadow-sm border-0 mb-4 bg-light">
        <div className="card-body p-4">
          <h2 className="fw-bold mb-2">Система учета АПС, ОС, СОУЭ</h2>
          <p className="text-muted mb-0">
            Руководство пользователя и правила работы с реестрами, отчетами и
            графиками.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {instructions.map((item) => (
          <div key={item.num} className="col-md-6 col-xl-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-warning bg-opacity-25 text-dark rounded p-3 d-flex align-items-center justify-content-center">
                    <i className={`bi ${item.icon} fs-4`}></i>
                  </div>
                  <div>
                    <span className="badge bg-secondary mb-1">
                      Шаг {item.num}
                    </span>
                    <h6 className="card-title fw-bold mb-0">{item.title}</h6>
                  </div>
                </div>
                <p className="card-text text-muted small lh-base">
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default MainPage;
