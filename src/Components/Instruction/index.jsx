import { useState, useEffect } from "react";
import "./style.scss";
import chevron from './img/chevron-right.svg'

const getTutorials = (roles) =>
    roles?.region_admin?.canEdit?.length || roles?.region_admin?.canView?.length
        ? [
              {
                  label: "Региональный куратор",
                  command: () => {
                      window.open("/docs/tutorial_region.pdf");
                  },
              },
          ]
        : [
              {
                  label: "Заявка на участие",
                  command: () => {
                      window.open("/docs/tutorial.pdf");
                  },
              },
              {
                  label: "Отчет о мероприятиях",
                  command: () => {
                      window.open("/docs/tutorial2.pdf");
                  },
              },
          ];

const PersonalAccount = (roles) => {
    const [data, setData] = useState();

    useEffect(() => {
        setData(getTutorials(roles));
    }, []);

    return (
        <div className={"instructions"}>
            <div className={"instructions-layout"}>
                <div className={"instructions__container"}>
                    <div className={"title"}>Инструкции</div>
                </div>
                <div className={"instructions__container instructions__container_items"}>
                    {data?.map((i, idx) => {
                        return (
                            <div key={idx} className="instructions__item" href={`${window.location.origin}/pdf/#`} target="_blank" onClick={i.command}>
                                <span className="instructions__text">{i.label}</span>
                                <img src={chevron} className="instruction__chevron" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PersonalAccount;
