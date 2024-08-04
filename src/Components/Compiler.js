import React, { useEffect, useCallback, useRef, useState } from "react";
import Tooltip from "react-tooltip-lite";
import init from "./init";
import "./bulma.min.css";
import "./index.css";
import "./CodeMirror.css";
import { initCodeEditor } from "./lib";
import Navbar from "./Navbbar";
import { FaArrowDown, FaClipboardList, FaCss3, FaFileAlt, FaHtml5, FaTimes, FaTrash } from "react-icons/fa";

import { MdArrowForwardIos, MdBrowserUpdated, MdRefresh } from "react-icons/md";
import { DiJavascript } from "react-icons/di";
import ConfettiCanvas from "./ConfettiCanvas";
import SolutionButton from "./Solotion";
import { IoIosArrowDown } from "react-icons/io";
import { CgNotes } from "react-icons/cg";
import { HiOutlineClipboardList } from "react-icons/hi";
import { CiCreditCard2 } from "react-icons/ci";
import { FaRegTrashCan } from "react-icons/fa6";

const Compiler = () => {
  const [mode, setMode] = useState("html");
  const [logs, setLogs] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(true);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState("browser");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  const toggleTest = () => setIsTestOpen(!isTestOpen);
  const toggleConsole = () => setIsConsoleOpen(!isConsoleOpen);
  const clearLogs = () => {
    setLogs([]);
    setTestResults([]);
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
      setTestResults((prevResults) => [...prevResults, `Console log: ${message}`]);
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
    if (!html || html.trim() === "") {
      html = `
        <div style="height: 100%; width: 100%; color: gray; display: flex; align-items: center; justify-content: center; text-align: center;">
          <h3 style="font-weight: normal;">Challenges with an index.html will render here</h3>
        </div>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont,
        "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans",
        "Helvetica Neue", sans-serif;
          }
          a {
            color: #00b99f;
            transition: transform 150ms ease-out;
          }
          a:active{
            color: #dc9f16;
          }
        </style>
      `;
    }
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
        if (!window.scriptExecuted) {
          window.scriptExecuted = true;
          if (!window.consoleOverridden) {
            const originalIframeConsoleLog = console.log;
            const originalIframeConsoleError = console.error;
            console.log = (...args) => {
              window.parent.postMessage({ type: 'log', data: args.join(' ') }, '*');
              originalIframeConsoleLog.apply(console, args);
            };
            console.error = (...args) => {
              window.parent.postMessage({ type: 'error', data: args.join(' ') }, '*');
              originalIframeConsoleError.apply(console, args);
            };
            window.consoleOverridden = true;
          } 
          ${js}
        }
      </script>
    `);
    preview.close();
    preview.head.innerHTML = `
      <link rel="stylesheet" href="./static/view.css">
      <style>${css}</style>
    `;
    iframe.style.display = "block";
    setIsIframeLoading(false);
  }, []);

  const onRun = useCallback(() => {
    const iframe = document.getElementById("preview");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.scriptExecuted = false;
    }
    clearLogs();
    onLoad();
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, [onLoad]);

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
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && ["log", "error"].includes(event.data.type)) {
        console.log(event.data.data);
      }
    };

    window.addEventListener("message", handleMessage);

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

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onRun]);

  return (
    <div className="runjs">
      <Navbar />
      <div className="mainbody">
        <div className={`runjs__editor ${isMaximized ? 'maximized' : ''}`} >
          <div className="tabs">
            <div
              className={`tab ${mode === "html" ? "active" : ""}`}
              onClick={() => handleTabClick("html")}
            >
              Index.html
            </div>
            <div
              className={`tab ${mode === "css" ? "active" : ""}`}
              onClick={() => handleTabClick("css")}
            >
              index.css
            </div>
            <div
              className={`tab ${mode === "js" ? "active" : ""}`}
              onClick={() => handleTabClick("js")}
            >
              index.js
            </div>
            <div className="dropdown">
              <button className="dropdown-button" onClick={toggleMaximize}>
                <IoIosArrowDown />
              </button>
              {/* <div className={`dropdown-menu ${isMaximized ? 'open' : ''}`}>
                <button onClick={toggleMaximize}>
                  {isMaximized ? 'Minimize' : 'Maximize'}
                </button>
              </div> */}
            </div>
          </div>
          <div className="editor-wrap">
            <div
              id="html-wrap"
              style={{
                visibility: mode === "html" ? "visible" : "hidden",
                marginTop: '0',
                position: "absolute",
                top: "50px",
                width: "98.7%",
              }}
            >
              <textarea className="form-control" id="html"></textarea>
            </div>
            <div
              id="css-wrap"
              style={{
                visibility: mode === "css" ? "visible" : "hidden",
                marginTop: '0',
                position: "absolute",
                top: "50px",
                width: "98.7%",
              }}
            >
              <textarea className="form-control" id="css"></textarea>
            </div>
            <div
              id="js-wrap"
              style={{
                visibility: mode === "js" ? "visible" : "hidden",
                marginTop: '0',
                position: "absolute",
                top: "50px",
                width: "98.7%",
              }}
            >
              <textarea className="form-control" id="js"></textarea>
            </div>
          </div>
        </div>

        <div className="runjs__preview" style={{ height: isConsoleOpen ? "calc(-326px + 100vh)" : "0", }}>
          <div className="preview-tabs" style={{ borderBottom: "1px solid gray" }}>
              <button
              className={`tab ${previewMode === "instructions" ? "output_tab_active" : ""}`}
              onClick={() => setPreviewMode("instructions")}
              style={{ padding: "10px 15px", color: "white", backgroundColor:"#5555" }}
            >
            <span className={`clipboard-notes-icon me-2 ${previewMode === "instructions" ? "clipboard-notes-icon-active" : ""}`} >
              <HiOutlineClipboardList />
            </span>
            Instructions
            </button>
            <button
              className={`tab ${previewMode === "browser" ? "output_tab_active" : ""}`}
              onClick={() => {setPreviewMode("browser"); onLoad();}}
              style={{ padding: "10px 15px", color: "white", backgroundColor:"#5555" }}
            >
            <span className={`clipboard-notes-icon ${previewMode === "browser" ? "clipboard-notes-icon-active" : ""}`} >
              <CiCreditCard2/> 
              </span>
              Browser
            </button>
          </div>
          <div className="preview-content">
            {previewMode === "instructions" && (
               <div id="right-tabs-content" className="react">
               <div id="instructions" className="tab-content tab-content--active">
                 <h1 id="title">
                   Uppercase a string
                 </h1>
                 <div id="description">
                   <p>Complete the function sayLouder such that it makes the text in uppercase.</p>
                 </div>
               </div>
               <div className="tab-content">
                 <slot></slot>
               </div>
             </div>
            )}
            {previewMode === "browser" && (
              <>
                {isIframeLoading && (
                  <div className="iframe-placeholder">
                    <p>JavaScript file will render here.</p>
                  </div>
                )}
                <iframe
                  onLoad={() => {
                    if (!isIframeLoading) {
                      return;
                    }
                    setIframeLoaded(true);
                    onLoad();
                  }}
                  id="preview"
                  style={{ backgroundColor: "white", color: "white", height: isConsoleOpen ? "calc(-361px + 100vh)" : "0" }}
                  src="./static/view.html"
                  seamless
                  width="100%"
                >

                </iframe>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="runjs__console" id="test" style={{
          height: isTestOpen ? "260px" : "50px",
          transition: "height 0.5s ease",
          overflow: "hidden",
      }}>
        <div className="align-items-center"
          style={{
            backgroundColor: "#5555",
            color: "white",
            display: "flex",
            padding: "8.8px 15px",
            flexDirection: "row",
            justifyContent: "space-between",
            borderRight: "1px solid grey",
            borderBottom: "1px solid grey",
            cursor: "pointer",
            alignItems: "center",
            fontSize: "14px",
           
          }}
        >
          <h1 className="headingnew">Test (0/2)</h1>
          <div style={{ display: "flex", alignItems: "center" }}>
            <SolutionButton />
            <button
              style={{
                backgroundColor: "#65c8ff",
                padding: "4px 10px",
                borderRadius: "6px",
                outline: "none",
                border: "none",
                marginRight: "10px",
                fontSize: '12px',

              }}
              onClick={onRun}
            >
              <MdArrowForwardIos /> Run Code
            </button> 
            <IoIosArrowDown
              onClick={toggleTest}
              style={{
                transform: isTestOpen ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s",
                color:"#7a7a7a"
              }}
            />
          </div>
        </div>
        <div style={{ padding: "10px" }}>
          <ul style={{overflow:"hidden"}}>
            <li>
      <div className="test-name-container" style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <button className="clear-done" style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0",
          marginRight: "10px"
        }}>
                  <FaTimes size={20} color="grey" />
                </button>
                <div className="test-name">sayLouder returns a string</div>
              </div>
              <div className="error-message"></div>
            </li>
            <li>
      <div className="test-name-container" style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <button className="clear-done" style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0",
          marginRight: "10px"
        }}>
                  <FaTimes size={20} color="grey" />
                </button>
        <div className="test-name">sayLouder returns uppercased version</div>
              </div>
              <div className="error-message"></div>
            </li>
          </ul>
        </div>

        {showConfetti && <ConfettiCanvas />}
      </div>
      <div className="runjs__console" id="console" style={{
          height: isConsoleOpen ? "260px" : "50px",
          transition: "height 0.5s ease",
          left: "50%",
          overflow: "hidden",
      }}>
        <div className="align-items-center"
          style={{
            backgroundColor: "#5555",
            color: "white",
            display: "flex",
            padding: "10px 15px",
            flexDirection: "row",
            justifyContent: "space-between",
            borderRight: "1px solid grey",
            marginLefteft: "200px",
            borderBottom: "1px solid grey",
            cursor: "pointer", 
          }}
        >
          <h1 className="headingnew">Console</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MdRefresh size={"1rem"} />
            <FaRegTrashCan onClick={clearLogs} color="#7a7a7a" size={"1rem"} />
            <IoIosArrowDown
              onClick={toggleConsole}
              style={{
                transform: isConsoleOpen ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s",
                color:"#7a7a7a"
              }}
            />
          </div>
        </div>
        {logs.map((log, index) => (
          <div key={index}>
            {log !== "" ? <p style={pStyle}>{log}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Compiler;
