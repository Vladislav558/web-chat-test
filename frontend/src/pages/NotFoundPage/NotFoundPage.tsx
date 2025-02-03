import React from "react";
import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.scss";

const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.subtitle}>Страница не найдена</p>
      <Link to="/auth" className={styles.button}>
        На главную
      </Link>
    </div>
  );
};

export default NotFoundPage;
