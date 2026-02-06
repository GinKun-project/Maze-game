import React, { useState } from "react";

const PasswordInput = ({ label, ...rest }) => {
  const [show, setShow] = useState(false);

  return (
    <label className="input-group">
      {label ? <span className="input-label">{label}</span> : null}
      <input
        className="input-field"
        type={show ? "text" : "password"}
        {...rest}
      />
      <button
        type="button"
        className="input-action"
        onClick={() => setShow((p) => !p)}
      >
        {show ? "HIDE" : "SHOW"}
      </button>
    </label>
  );
};

export default PasswordInput;
