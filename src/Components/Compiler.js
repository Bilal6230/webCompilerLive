import React, { useEffect, useCallback, useRef, useState } from "react";
import Tooltip from "react-tooltip-lite";
import init from "./init";
import "./bulma.min.css";
import "./index.css";
import { initCodeEditor } from "./lib";
import Navbar from "./Navbbar";
import { FaArrowDown, FaCss3, FaFileAlt, FaHtml5, FaRunning, FaTrash } from "react-icons/fa";
import { MdArrowForwardIos, MdBrowserUpdated, MdRefresh } from "react-icons/md";
import { DiJavascript } from "react-icons/di";
import ConfettiCanvas from "./ConfettiCanvas";

const Compiler = () => {
  const [mode, setMode] = useState("js");
  const [logs, setLogs] = useState([]);
  const [testResults, setTestResults] = useState([ ]); 
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(true);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState("browser");
  const [iframeLoaded, setIframeLoaded] = useState(false); 



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

    console.log(testResults)
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
      </script>
    `);
    preview.close();
    preview.head.innerHTML = `
      <link rel="stylesheet" href="./static/view.css">
      <style>${css}</style>
    `;
      iframe.style.display = "block";
      // setIsPreviewLoading(false);
      // setIsEditorLoading(false);
      // setIsConsoleLoading(false
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
    // let iframe = document.getElementById("preview");
    clearLogs();
    onLoad();
    setShowConfetti(true);
    setIframeLoaded(true);
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

    // setIsEditorLoading(false);
    // setIsConsoleLoading(false);

    onRun();
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
                        {/* {isEditorLoading && <Loader/>} */}
            <div
              id="html-wrap"
              style={{
                visibility: mode === "html" ? "visible" : "hidden",
                marginTop: "60px",
                  height:"100vh"
              }}
            >
              <textarea className="form-control" id="html"></textarea>
            </div>
            <div
              id="css-wrap"
              style={{
                visibility: mode === "css" ? "visible" : "hidden",
                marginTop: "-580px",
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
                marginTop: "-660px",
              }}
            >
              <textarea className="form-control" id="js"></textarea>
            </div>
          </div>
        </div>

        <div className="runjs__preview" style={{height: isConsoleOpen ? "68vh" : "89vh", }} >
             

<div className="preview-tabs" style={{borderBottom: "1px solid gray"}}>
            <button
              className={`tab ${previewMode === "instructions" ? "active" : ""}`}
              onClick={() => setPreviewMode("instructions")}
              style={{padding:"15px", color:"white",borderRadius:"6px"}}
            >
            <FaFileAlt color="lightblue" />  Instructions
            </button>
            <button
              className={`tab ${previewMode === "browser" ? "active" : ""}`}
              onClick={() => setPreviewMode("browser")}
              style={{padding:"15px", color:"white",borderRadius:"6px"}}
            >
             <MdBrowserUpdated color="yellow" size={"1.5rem"}/>  Browser
            </button>
          </div>
          <div className="preview-content">
            {previewMode === "instructions" && (
              <div className="instructions">
                <h2>  Instructions</h2>
                <p>Here are the instructions for the task...</p>
                <p>1. Write your HTML, CSS, and JavaScript code.</p>
                <p>2. Click on the "Run Code" button to see the output in the browser tab.</p>
                <p>3. Check the console logs and test cases below for feedback.</p>
              </div>
            )}
            {previewMode === "browser" && (
             <>
             {!iframeLoaded && (
               <div className="iframe-placeholder">
                 <p>JavaScript file will render here.</p>
               </div>
             )}
             <iframe
               onLoad={() => {
                 setIframeLoaded(true);
                 onLoad();
               }}
               id="preview"
               style={{ backgroundColor: "#5555", color: "white", height:isConsoleOpen ? "63vh": "83vh" }}
               src="./static/view.html"
               seamless
               width="100%"
             ></iframe>
           </>
        )}
          </div>
        </div>
      </div>
      <div className="runjs__console" id="console"  style={{
        height: isTestOpen ? "260px" : "50px", // Adjust height as needed
        transition: "height 0.5s ease",
        overflow: "hidden",
      }}>
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
        >
          <h1 className="headingnew">Test ({testResults.length}/{testResults.length})</h1>
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
            onClick={toggleTest}
              style={{
                transform: isTestOpen ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s"
              }}
            />
          </div>
        </div>
        {/* {isTestOpen && (
          <div style={{ backgroundColor: "#5555", color: "white", padding: "15px"}}> */}
            {/* Your test content goes here */}
            <div style={{ padding: "10px" }}>
          {testResults.map((result, index) => (
            <div className="testcases" key={index}>{result}</div>
          ))}
        </div>
            {showConfetti && <ConfettiCanvas />}
          {/* </div>
        )} */}
      </div>
      {/* <div className="runjs__console" id="console"  
       style={{
        height: isConsoleOpen ? "260px" : "50px", // Adjust height as needed
        transition: "height 0.5s ease",
        overflow: "hidden",
        left:"50%"
      }}
      >
        <div style={{ padding: "10px" }}>
          {testResults.map((result, index) => (
            <div className="testcases" key={index}>{result}</div>
          ))}
        </div>
          
           {showConfetti && <ConfettiCanvas />}
        </div> */}
      <div className="runjs__console" id="console"  style={{
        height: isConsoleOpen ? "260px" : "50px", // Adjust height as needed
        transition: "height 0.5s ease",
        left:"50%",
        overflow: "hidden",
      }} >
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
            <MdRefresh size={"1.5rem"} />
            <FaTrash  onClick={clearLogs} color="red" size={"1.2rem"} />
            <FaArrowDown
             onClick={toggleConsole}
              style={{
                transform: isConsoleOpen ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s"
              }}
              />
          </div>
        </div>
        {/* {isConsoleOpen && (
          <div style={{ backgroundColor: "#5555", color: "white", padding: "15px", display:"flex" , flexDirection:"column",justifyContent:"space-between"}}> */}
             {logs.map((log, index) => (
            <div key={index}>
              {log !== "" ? <p style={pStyle}>{log}</p> : null}
            </div>
          ))}
          {/* </div>
        )} */}
      </div>
    </div>
  );
};

export default Compiler;
