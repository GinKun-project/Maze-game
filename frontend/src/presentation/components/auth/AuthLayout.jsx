import React from "react";

const AuthLayout = ({ title, children, footer }) => (
  <div className="auth-page">
    <div className="auth-card">
      <div className="auth-hud">
        <span>07/11</span>
        <span>01▢▢</span>
        <span>103+2</span>
      </div>
      <h1 className="auth-title">{title}</h1>
      {children}
      {footer ? <div className="auth-footer">{footer}</div> : null}
    </div>
  </div>
);

export default AuthLayout;
