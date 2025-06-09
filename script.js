window.addEventListener("DOMContentLoaded", function() {
    var htmlEditor = ace.edit("htmlEditor");
    htmlEditor.setTheme("ace/theme/monokai");
    htmlEditor.session.setMode("ace/mode/html");
    htmlEditor.setGhostText("HTML");

    var cssEditor = ace.edit("cssEditor");
    cssEditor.setTheme("ace/theme/monokai");
    cssEditor.session.setMode("ace/mode/css");
    cssEditor.setGhostText("css")

    const previewIframe = document.querySelector("#previewRender");

    document.querySelector("#reloadPreview").addEventListener("click", () => {
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
    });

    document.querySelector("#copyOutput").addEventListener("click", () => {
        const outputCode = document.querySelector("#outputCode").value;
        console.log(outputCode)
        navigator.clipboard.writeText(outputCode);
    })
});