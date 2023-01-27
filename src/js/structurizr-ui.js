structurizr.ui.applyBranding = function(branding) {
    if (branding.font.url) {
        const head = document.head;
        const link = document.createElement('link');

        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = branding.font.url;

        head.appendChild(link);
    }

    var fontNames = '';
    branding.font.name.split(',').forEach(function(fontName) {
        fontNames += '"' + structurizr.util.escapeHtml(fontName.trim()) + '", ';
    });

    const brandingStyles = $('#brandingStyles');
    brandingStyles.append('#documentationPanel { font-family: ' + fontNames.substr(0, fontNames.length-2) + ' }');

    if (branding.logo) {
        const brandingLogo = $('.brandingLogo');
        brandingLogo.attr('src', branding.logo);
        brandingLogo.removeClass('hidden');
    }
}