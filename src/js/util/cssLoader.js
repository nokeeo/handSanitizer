define([], function () {
    return function (cssFilePath) {
        var headEl = document.querySelector('head');

        var cssLinkEl = document.createElement('link');
        cssLinkEl.setAttribute('rel', 'stylesheet');
        cssLinkEl.setAttribute('type', 'text/css');
        cssLinkEl.setAttribute('src', cssFilePath);

        headEl.appendChild(cssLinkEl);
    };
});
