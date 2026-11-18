import React from "react";
import "./main.css";

const BASE = import.meta.env.BASE_URL;

export interface MainProps {
  [key: string]: any;
}

export const Main: React.FC<MainProps> = () => {
  return (
    <div className="page-main">
      <section className="main-hero" aria-label="Главный баннер GOOSE Fashion House">
        <div className="main-hero__container">
          <img
            src={`${BASE}banner.png`}
            alt="GOOSE Fashion House — PDF-выкройки для одежды кукол"
            className="main-hero__img"
          />
        </div>
      </section>
    </div>
  );
};

export default Main;
