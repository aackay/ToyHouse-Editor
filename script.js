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
    htmlEditor.setShowPrintMargin(false);
    htmlEditor.setOptions({
        placeholder: "Enter HTML...",
    });

    cssEditor = ace.edit("cssEditor");
    cssEditor.setTheme("ace/theme/monokai");
    cssEditor.session.setMode("ace/mode/css");
    cssEditor.setShowPrintMargin(false);
    cssEditor.setOptions({
        placeholder: "Enter CSS...",
    });

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
            const column = button.parentElement.parentElement;
            
            if (column.classList.contains("hidden")) {
                column.classList.remove("hidden");
                button.innerText = "-";
            } else {
                column.classList.add("hidden");
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

    const rulesets = rawCSS.split("}");
    for (let ruleset of rulesets) {
        const [selectorRaw, declarationsRaw] = ruleset.split("{");
        if (!selectorRaw || !declarationsRaw) continue;

        const selector = selectorRaw.trim();
        const declarations = declarationsRaw.trim().replace(/\s*;\s*$/, ""); // trim last semicolon

        let elements;
        try {
            elements = tempElement.querySelectorAll(selector);
        } catch (e) {
            console.warn("Invalid selector:", selector);
            continue;
        }

        for (const el of elements) {
            // Append to existing inline styles
            el.style.cssText += declarations + ";";
        }
    }

    const output = tempElement.innerHTML;

    const parser = new DOMParser();
    const doc = parser.parseFromString(output, "text/html");
    doc.body.style.margin = "0";
    doc.body.style.padding = "0";

    previewIframe.srcdoc = doc.documentElement.innerHTML;
    outputCodeElement.textContent = html_beautify(output);
}
