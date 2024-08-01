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
import Loader from "./Loader";

const Compiler = () => {
  const [mode, setMode] = useState("js");
  const [logs, setLogs] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(true);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true); // Loading state for preview
  const [isEditorLoading, setIsEditorLoading] = useState(true); // Loading state for editor
  const [isConsoleLoading, setIsConsoleLoading] = useState(true); // Loading state for console




  const toggleTest = () => setIsTestOpen(!isTestOpen);
  const toggleConsole = () => setIsConsoleOpen(!isConsoleOpen);
  const clearLogs = () => {
    setLogs([]);
  };


  // useEffect(() => {
  //   // Simulate loading time
  //   setTimeout(() => {
  //     setIsEditorLoading(false);
  //   }, 3000); // 2 seconds loading time
  // }, []);

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
      setIsPreviewLoading(false);
      // setIsEditorLoading(false);
      // setIsConsoleLoading(false);

  }, []);

  const handleTabClick = (mode) => {
    setMode(mode);
  };

  const onRun = useCallback(() => {
    let iframe = document.getElementById("preview");
    iframe.contentWindow.location.reload(true);


    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

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

    setIsEditorLoading(false);
    setIsConsoleLoading(false);

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
              
              {isEditorLoading && <Loader/>}
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
                  marginTop: "-355px",
                }}
              >
                <textarea className="form-control" id="js"></textarea>
              </div>
            </div>
          </div>

          <div className="runjs__preview">
          {isPreviewLoading && <Loader />}
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
        <div className="runjs__console" id="console"
        style={{
          height: isTestOpen ? "260px" : "50px", // Adjust height as needed
          transition: "height 0.5s ease",
          overflow: "hidden",
        }}
        >
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
          // onClick={toggleTest}
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
              onClick={toggleTest}
            />
          </div>
        </div>
     
            {showConfetti && <ConfettiCanvas />}
          
      </div>
      <div className="runjs__console" id="console"  
       style={{
        height: isConsoleOpen ? "260px" : "50px", // Adjust height as needed
        transition: "height 0.5s ease",
        overflow: "hidden",
        left:"50%"
      }}
      >
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
         
        >
          <h1 className="headingnew">Console</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MdRefresh onClick={clearLogs} size={"1.5rem"} />
            <FaTrash color="red" size={"1.2rem"} />
            <FaArrowDown
             onClick={toggleConsole}
              style={{
                transform: isConsoleOpen ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s"
              }}
              />
          </div>
        </div>
        {isConsoleLoading ? (
          <Loader />
        ) : (
          logs.map((log, index) => (
            <p key={index}>
              {log !==
              "Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot"
                ? log
                : ""}
            </p>
          ))
        )}
      </div>
      </div>
  );
};

export default Compiler;
