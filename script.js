let htmlEditor;
let cssEditor;
let previewIframe;
let outputCode;
let outputCodeElement;
let autoReload = true;

window.addEventListener("DOMContentLoaded", function() {
    htmlEditor = ace.edit("htmlEditor");
    htmlEditor.setTheme("ace/theme/monokai");
    htmlEditor.session.setMode("ace/mode/html");
    htmlEditor.setGhostText("HTML");

    cssEditor = ace.edit("cssEditor");
    cssEditor.setTheme("ace/theme/monokai");
    cssEditor.session.setMode("ace/mode/css");
    cssEditor.setGhostText("css");

    const rawHTML = localStorage.getItem("rawHTML");
    const rawCSS = localStorage.getItem("rawCSS");
    if (rawHTML) htmlEditor.setValue(rawHTML);
    if (rawCSS) cssEditor.setValue(rawCSS);

    setTimeout(() => {
        renderPreview();
    }, 500);

    htmlEditor.on("input", () => {
        if (autoReload) renderPreview();
    });

    cssEditor.on("input", () => {
        if (autoReload) renderPreview();
    });

    document.querySelector("#autoReload").addEventListener("click", () => {
        autoReload = !autoReload;
    });

    previewIframe = document.querySelector("#previewRender");
    outputCodeElement = document.querySelector("#outputCode");
    const resizer = this.document.querySelector("#resizer")

    for (element of document.querySelectorAll(".visibilityToggle")) {
        element.addEventListener("click", e => {
            const button = e.target;
            const editor = button.parentElement.parentElement.querySelector(".editor");
            const column = button.parentElement.parentElement;
            if (editor.style.display == "none") {
                editor.style.display = "block";
                column.style.flex = 1;
                button.innerText = "-";
            } else {
                editor.style.display = "none";
                column.style.flex = 0;
                button.innerText = "+";
            }
        });
    }

    document.querySelector("#reloadPreview").addEventListener("click", renderPreview);

    document.querySelector("#copyOutput").addEventListener("click", () => {
        outputCode = document.querySelector("#outputCode").value;
        navigator.clipboard.writeText(outputCode);
    });

    let resizing = false;
    let overlay = document.querySelector("#resizeOverlay");
    resizer.addEventListener("mousedown", () => {
        resizing = true;
        overlay.style.display = "block";
        document.body.style.userSelect = "none";
    });

    document.addEventListener("mouseup", () => {
        resizing = false;
        overlay.style.display = "none";
        document.body.style.userSelect = "auto";
    });

    document.addEventListener("mousemove", e => {
        if (resizing) {
            outputCodeElement.style.height = window.innerHeight - e.clientY + "px";
        }
    });
});

document.addEventListener("keydown", function(e) {
    if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83) {
        e.preventDefault();
        renderPreview();
        // Process the event here (such as click on submit button)
    }
}, false);


function renderPreview() {
    const rawHTML = htmlEditor.getValue();
    const rawCSS = cssEditor.getValue();

    localStorage.setItem("rawHTML", rawHTML);
    localStorage.setItem("rawCSS", rawCSS);

    const tempElement = document.createElement("div");
    tempElement.innerHTML = rawHTML;

    let rulesets = rawCSS.split("}");

    for (ruleset of rulesets) {
        let selector = ruleset.split("{")[0].trim();
        if (!selector) continue;
        try {
            document.querySelector(selector);
        } catch (error) {
            console.error(`Selector not found: ${selector}`);
            continue;
        }

        const minified = ruleset.replace(/\s+/g, "");
        const properties = minified.split("{")[1].trim().split(";");

        for (element of tempElement.querySelectorAll(selector)) {
            const propertyString = properties.join(";");
            element.style.cssText = propertyString;
        }
    }
    previewIframe.srcdoc = tempElement.innerHTML;
    document.querySelector("#outputCode").innerHTML = html_beautify(tempElement.innerHTML);
}