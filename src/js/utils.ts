

/**
 * CSSを動的に読み込む
 */
const loadCssFile = (filePath:string) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = filePath;
    document.head.appendChild(link);
};


export {
    loadCssFile,
};
