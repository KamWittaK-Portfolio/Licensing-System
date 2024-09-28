let editor = document.querySelector("#editor");

ace.edit(editor, {
    theme: "ace/theme/monokai",
    mode: "ace/mode/lua",
    highlightActiveLine: true, // Optional: highlight the active line
    highlightGutterLine: true, // Optional: highlight the gutter line
    showPrintMargin: false, // Optional: hide print margin
    fontSize: "20px", // Set font size as needed,
    readOnly: true, // Set the editor to read-only
});