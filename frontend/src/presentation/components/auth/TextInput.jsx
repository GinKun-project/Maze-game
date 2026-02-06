import React from "react";

const TextInput = ({ label, ...rest }) => (
  <label className="input-group">
    {label ? <span className="input-label">{label}</span> : null}
    <input className="input-field" {...rest} />
  </label>
);

export default TextInput;
