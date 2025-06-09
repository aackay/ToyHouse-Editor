let htmlEditor;
let cssEditor;
let previewIframe;
let outputCode;
let outputCodeElement;

window.addEventListener("DOMContentLoaded", function() {
    htmlEditor = ace.edit("htmlEditor");
    htmlEditor.setTheme("ace/theme/monokai");
    htmlEditor.session.setMode("ace/mode/html");
    htmlEditor.setGhostText("HTML");

    cssEditor = ace.edit("cssEditor");
    cssEditor.setTheme("ace/theme/monokai");
    cssEditor.session.setMode("ace/mode/css");
    cssEditor.setGhostText("css")

    previewIframe = document.querySelector("#previewRender");
    outputCodeElement = document.querySelector("#outputCode");
    const resizer = this.document.querySelector("#resizer")

    document.querySelector("#reloadPreview").addEventListener("click", renderPreview);

    document.querySelector("#copyOutput").addEventListener("click", () => {
        outputCode = document.querySelector("#outputCode").value;
        console.log(outputCode)
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
            console.log(e)
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
    const tempElement = document.createElement("div");
    tempElement.innerHTML = htmlEditor.getValue();
    const rawCSS = cssEditor.getValue();

    let rulesets = rawCSS.split("}");

    for (ruleset of rulesets) {
        let selector = ruleset.split("{")[0].trim();
        if (!selector) continue;

        const minified = ruleset.replace(/\s+/g, "");
        const properties = minified.split("{")[1].trim().split(";");

        for (element of tempElement.querySelectorAll(selector)) {
            const propertyString = properties.join(";");
            element.style.cssText = propertyString;
        }
    }
    previewIframe.srcdoc = tempElement.outerHTML;
    document.querySelector("#outputCode").innerText = tempElement.outerHTML;
}