import React, { useEffect, useCallback, useRef, useState } from "react";
import Tooltip from "react-tooltip-lite";
import init from "./init";
import "./bulma.min.css";
import "./index.css";
import { initCodeEditor } from "./lib";
import Navbar from "./Navbbar";
import { FaArrowDown, FaCss3, FaHtml5, FaRunning, FaTrash } from "react-icons/fa";
import { MdArrowForwardIos, MdRefresh } from "react-icons/md";
import { DiJavascript } from "react-icons/di";
import ConfettiCanvas from "./ConfettiCanvas";

const Compiler = () => {
  const [mode, setMode] = useState("js");
  const [logs, setLogs] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(true);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);



  const toggleTest = () => setIsTestOpen(!isTestOpen);
  const toggleConsole = () => setIsConsoleOpen(!isConsoleOpen);
  const clearLogs = () => {
    setLogs([]);
  };

  const toggleMaximize = () => {
    setIsMaximized((prev) => !prev);
  };

  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = (...args) => {
        const message = args.join(" ");
        setLogs((prevLogs) => [...prevLogs, message]);
        originalConsoleLog.apply(console, args);
    };

    console.error = (...args) => {
        const message = args.join(" ");
        setLogs((prevLogs) => [...prevLogs, message]);
        originalConsoleError.apply(console, args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);

  let staticRef = useRef({
    isAuto: false,
    js: null,
    css: null,
    html: null,
    lib: [
      "https://unpkg.com/babel-standalone/babel.min.js",
      "https://unpkg.com/react/umd/react.development.js",
      "https://unpkg.com/react-dom/umd/react-dom.development.js",
    ],
  });

  const onLoad = useCallback(() => {
    let iframe = document.getElementById("preview"),
      html = staticRef.current.html.getValue(),
      css = staticRef.current.css.getValue(),
      js = staticRef.current.js.getValue();
    iframe.style.display = "none";
    var preview;
    if (iframe.contentDocument) {
      preview = iframe.contentDocument;
    } else if (iframe.contentWindow) {
      preview = iframe.contentWindow.document;
    } else {
      preview = iframe.document;
    }
    let lib = ``;
    staticRef.current.lib.forEach((item) => {
      lib += `<script src="${item}"></script>`;
    });
    preview.open();
    preview.write(`
      ${lib}${html}
      <script type="text/babel" data-presets="react">
          // Override console methods in the iframe
          const originalConsoleLog = console.log;
          const originalConsoleError = console.error;
          console.log = (...args) => {
          window.parent.postMessage({ type: 'log', data: args.join(' ') }, '*');
            originalConsoleLog.apply(console, args);
          };
          console.error = (...args) => {
          window.parent.postMessage({ type: 'error', data: args.join(' ') }, '*');
            originalConsoleError.apply(console, args);
          };
            ${js}
      </script>
    `);
    preview.close();
    preview.head.innerHTML = `
      <link rel="stylesheet" href="./static/view.css">
      <style>${css}</style>
    `;
    iframe.style.display = "block";
  }, []);

  const pStyle = {
    fontSize: '14px',
    fontFamily: '"Fira Code", monospace',
    borderBottom: '1px solid #3e3e3e',
    overflow: 'hidden',
    padding: '10px 20px',
    margin: '0px',
    color: '#ff7976'
  };

  const handleTabClick = (mode) => {
    setMode(mode);
  };

  const onRun = useCallback(() => {
    let iframe = document.getElementById("preview");
    clearLogs();
    onLoad();
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, [onLoad]);

  useEffect(() => {
    window.addEventListener("message", function (event) {
      if (event.data && ["log", "error"].includes(event.data.type)) {
        console.log(event.data.data);
      }
    });
    staticRef.current.js = initCodeEditor(
      document.getElementById("js"),
      "javascript",
      init.javascript
    );
    staticRef.current.html = initCodeEditor(
      document.getElementById("html"),
      "htmlmixed",
      init.html
    );
    staticRef.current.css = initCodeEditor(
      document.getElementById("css"),
      "css",
      init.css
    );
    onRun();
  }, [onRun]);

  return (
    <div className="runjs">
      <Navbar />
      <div className="mainbody">
        <div className={`runjs__editor ${isMaximized ? 'maximized' : ''}`}>
          <div className="tabs">
            <div
              className={`tab ${mode === "html" ? "active" : ""}`}
              onClick={() => handleTabClick("html")}
            >
              <FaHtml5 color="ORANGE" size={"1.2rem"} /> HTML
            </div>
            <div
              className={`tab ${mode === "css" ? "active" : ""}`}
              onClick={() => handleTabClick("css")}
            >
              <FaCss3 color="blue" size={"1.2rem"} /> CSS
            </div>
            <div
              className={`tab ${mode === "js" ? "active" : ""}`}
              onClick={() => handleTabClick("js")}
            >
              <DiJavascript color="yellow" size={"1.2rem"} /> index.js
            </div>
            <div className="dropdown">
              <button className="dropdown-button" onClick={toggleMaximize}>
                <FaArrowDown />
              </button>
              <div className={`dropdown-menu ${isMaximized ? 'open' : ''}`}>
                <button onClick={toggleMaximize}>
                  {isMaximized ? 'Minimize' : 'Maximize'}
                </button>
              </div>
            </div>
          </div>
          <div className="editor-wrap">
            <div
              id="html-wrap"
              style={{
                visibility: mode === "html" ? "visible" : "hidden",
                marginTop: "60px",
                  height:"600px"
              }}
            >
              <textarea className="form-control" id="html"></textarea>
            </div>
            <div
              id="css-wrap"
              style={{
                visibility: mode === "css" ? "visible" : "hidden",
                marginTop: "-590px",
              }}
            >
              <textarea
                  // style={{ height: "566px" }}
                className="form-control"
                id="css"
              ></textarea>
            </div>
            <div
              id="js-wrap"
              style={{
                visibility: mode === "js" ? "visible" : "hidden",
                marginTop: "-300px",
              }}
            >
              <textarea className="form-control" id="js"></textarea>
            </div>
          </div>
        </div>

        <div className="runjs__preview">
          <iframe
            onLoad={onLoad}
            id="preview"
            style={{ backgroundColor: "#5555", color: "white" }}
            src="./static/view.html"
            seamless
            width="100%"
            height="100%"
          ></iframe>
        </div>
      </div>
      <div className="runjs__console" id="console">
        <div
          style={{
            backgroundColor: "#5555",
            color: "white",
            display: "flex",
            padding: "15px",
            flexDirection: "row",
            justifyContent: "space-between",
            borderRight: "1px solid grey",
            borderBottom: "1px solid grey",
            cursor: "pointer"
          }}
          onClick={toggleTest}
        >
          <h1 className="headingnew">Test (0/2)</h1>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              style={{
                backgroundColor: "#65c8ff",
                padding: "8px",
                borderRadius: "6px",
                outline: "none",
                border: "none",
                marginRight: "10px"
              }}
              onClick={onRun}
            >
              <MdArrowForwardIos /> Run Code
            </button>
            <FaArrowDown
              style={{
                transform: isTestOpen ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s"
              }}
            />
          </div>
        </div>
        {isTestOpen && (
          <div style={{ backgroundColor: "#5555", color: "white", padding: "15px"}}>
            {/* Your test content goes here */}
            {showConfetti && <ConfettiCanvas />}
          </div>
        )}
      </div>
      <div className="runjs__console" id="console"  style={{left:"50%"}} >
        <div
          style={{
            backgroundColor: "#5555",
            color: "white",
            display: "flex",
            padding: "15px",
            flexDirection: "row",
            justifyContent: "space-between",
            borderRight: "1px solid grey",
            marginLefteft:"200px" ,
            borderBottom: "1px solid grey",
            cursor: "pointer"
          }}
          onClick={toggleConsole}
        >
          <h1 className="headingnew">Console</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MdRefresh size={"1.5rem"} />
            <FaTrash  onClick={clearLogs} color="red" size={"1.2rem"} />
            <FaArrowDown
              style={{
                transform: isConsoleOpen ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s"
              }}
              />
          </div>
        </div>
        {isConsoleOpen && (
          <div style={{ backgroundColor: "#5555", color: "white", padding: "15px", display:"flex" , flexDirection:"column",justifyContent:"space-between"}}>
             {logs.map((log, index) => (
            <div key={index}>
              {log !== "" ? <p style={pStyle}>{log}</p> : null}
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Compiler;
