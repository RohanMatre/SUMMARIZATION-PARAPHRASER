import React, { useState } from "react";
import katex from "katex";

export default (props) => {
  const { value } = props;
  const [container, setContainer] = useState(null);

  let timer = null;

  const update = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(() => {
      if (!container) return;
      katex.render(value, container, { displayMode: true });
    }, 0);
  };

  update();

//   return <div ref={(c) => setContainer(c)} onClick={onClick} />;
  return <div ref={(c) => setContainer(c)}  />;
};
