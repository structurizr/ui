<%@ include file="/WEB-INF/fragments/workspace/javascript.jspf" %>

<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/structurizr-embed.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/structurizr-content${structurizrConfiguration.versionSuffix}.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/structurizr-documentation${structurizrConfiguration.versionSuffix}.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/structurizr-ui${structurizrConfiguration.versionSuffix}.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/markdown-it-13.0.1.min.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/katex-0.16.4.min.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/asciidoctor-2.2.6.min.js"></script>

<link href="${structurizrConfiguration.cdnUrl}/css/katex-0.16.4.min.css" rel="stylesheet" media="screen" />
<link href="${structurizrConfiguration.cdnUrl}/css/structurizr-asciidoctor.css" rel="stylesheet" media="screen" />
<link href="${structurizrConfiguration.cdnUrl}/css/structurizr-documentation.css" rel="stylesheet" media="screen" />

<%@ include file="/WEB-INF/fragments/progress-message.jspf" %>
<%@ include file="/WEB-INF/fragments/quick-navigation.jspf" %>

<style id="brandingStyles"></style>

<div class="row" style="padding-top: 20px; padding-bottom: 0; margin-left: 0; margin-right: 0">
    <div class="col-sm-2" style="padding-left: 30px">
        <div id="documentationNavigationPanel" class="hidden-xs">

            <div id="documentationNavigation"></div>

            <div class="navigationItemSeparator"></div>

            <c:if test="${not empty sharingUrlPrefix}">
            <div class="navigationItem">
                <a id="shareLink" href="" class="hidden"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/share-fill.svg" class="icon-sm" /> Share</a>
            </div>

            <script nonce="${scriptNonce}">
                $('#shareLink').click(function(event) {
                    event.preventDefault();

                    var scope = '${scope}';
                    if (scope === WORKSPACE_SCOPE) {
                        window.open('${sharingUrlPrefix}/documentation/' + window.location.hash);
                    } else {
                        window.open('${sharingUrlPrefix}/documentation/' + scope + window.location.hash);
                    }
                });
            </script>
            </c:if>

            <div class="navigationItem">
                <a id="exportLink" href="" class="hidden"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/filetype-html.svg" class="icon-sm" /> Export to offline HTML page</a>
            </div>

            <div id="documentationMetadata">
                <c:if test="${not empty param.version}">
                <div style="margin-bottom: 10px">
                    <span class="label label-version"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/clock-history.svg" class="icon-xs icon-white" /> ${workspace.internalVersion}</span>
                </div>
                </c:if>
                <span id="lastModifiedDate"></span>
                <c:if test="${not empty workspace.version}">
                    <br />
                    Version: ${workspace.version}
                </c:if>
            </div>
        </div>
    </div>

    <div class="col-sm-10" style="margin-top: 0; margin-bottom: 0">
        <div id="documentationNavigationDropDownPanel" class="form-group visible-xs centered" style="margin-top: 0; margin-bottom: 20px">
            <div class="btn-group">
                <select id="documentationNavigationDropDown" class="form-control"></select>
            </div>
        </div>

        <div id="documentationPanel">
            <div id="documentationHeader">
                <div class="centered">
                    <img src="" class="brandingLogo hidden" alt="Branding logo" />
                </div>
                <h1><span id="documentationScopeName"></span></h1>
            </div>

            <div id="documentationContent"></div>
        </div>
    </div>
</div>

<script nonce="${scriptNonce}">
    const requestedScope = '${scope}';
    const documentationNavigation = $('#documentationNavigation');
    const documentationNavigationDropDown = $('#documentationNavigationDropDown');
    const documentationNavigationDropDownPanel = $('#documentationNavigationDropDownPanel');
    var contentRenderer;

    const elementsWithDocumentation = [];
    var sections = [];
    var rendered = false;

    const anchors = [];
    const navigationIdsByAnchor = [];

    var filenameToSection = {};

    const WORKSPACE_SCOPE = '*';

    progressMessage.show('<p>Loading workspace...</p>');

    function workspaceLoaded() {
        resize();

        if (structurizr.workspace.hasDocumentation()) {
            contentRenderer = new structurizr.ui.ContentRenderer(
                structurizr.workspace,
                '${structurizrConfiguration.cdnUrl}',
                '${urlPrefix}',
                '${urlSuffix}');

            structurizr.scripting = {};
            structurizr.scripting.exportDocumentationToOfflineHtmlPage = function (callback) {
                exportDocumentationToOfflineHtmlPage(callback);
            };

            structurizr.scripting.isDocumentationRendered = function() {
                return rendered;
            };

            init();
            show();

            window.onhashchange = function() {
                scrollToHash();
            };

            document.addEventListener("keydown", changeDocumentation);

            $('#documentationPanel').scroll(function() {
                var topPadding = 30;
                var documentationPanelHeight = $('#documentationPanel').innerHeight();
                var documentationPanelOffsetTop = $('#documentationPanel').offset().top - topPadding;
                var done = false;

                $('.headingAnchor').each(function () {
                    if (done === false && $(this).offset().top > documentationPanelOffsetTop && $(this).position().top < documentationPanelHeight) {
                        var hash = '#' + $(this).attr('name');
                        highlightNavigation(undefined, hash);
                        if (window.location.hash !== hash) {
                            window.history.pushState({}, '', hash);
                        }
                        done = true;
                    }
                });
            });

            $(window).resize(function() {
                resize();
            });

            $('#lastModifiedDate').html(new Date(structurizr.workspace.getLastModifiedDate()).toLocaleString(undefined,
                {
                    weekday: 'long',
                    year:'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    timeZoneName : 'long'
                }
            ));

            $('#shareLink').removeClass('hidden');
        } else {
            showNoDocumentationPage();
        }

        structurizr.ui.applyBranding(structurizr.workspace.getViews().configuration.branding);
        $('#brandingLogoAnchor').attr('href', '${urlPrefix}');
        progressMessage.hide();
    }

    function init() {
        if (structurizr.workspace.getDocumentation().sections.length > 0) {
            elementsWithDocumentation.push(WORKSPACE_SCOPE);

            if (requestedScope === WORKSPACE_SCOPE) {
                sections = structurizr.workspace.getDocumentation().sections;
                $('#documentationScopeName').html(structurizr.util.escapeHtml(structurizr.workspace.getName()));
            }
        }

        structurizr.workspace.getModel().softwareSystems.forEach(function(softwareSystem) {
            if (softwareSystem.documentation.sections.length > 0) {
                elementsWithDocumentation.push(softwareSystem.id);

                const scope = toScope(softwareSystem);
                if (requestedScope === scope) {
                    sections = softwareSystem.documentation.sections;
                    contentRenderer.setScope(softwareSystem);
                    $('#documentationScopeName').html(structurizr.util.escapeHtml(softwareSystem.name));
                }
            }

            if (softwareSystem.containers) {
                softwareSystem.containers.forEach(function(container) {
                    if (container.documentation.sections.length > 0) {
                        elementsWithDocumentation.push(container.id);

                        const scope = toScope(container);
                        if (requestedScope === scope) {
                            sections = container.documentation.sections;
                            contentRenderer.setScope(container);
                            $('#documentationScopeName').html(structurizr.util.escapeHtml(container.name));
                        }
                    }
                });
            }
        });

        if (sections.length > 0) {
            sections.sort(function (a, b) {
                var result = a.order - b.order;

                if (result === 0) {
                    result = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
                }

                return result;
            });

            // assign section numbers
            var sectionNumber = 1;
            sections.forEach(function(section) {
                section.number = sectionNumber++;
            })
        }
    }

    function toScope(element) {
        if (element.type === structurizr.constants.SOFTWARE_SYSTEM_ELEMENT_TYPE) {
            return structurizr.util.escapeHtml(element.name);
        } else if (element.type === structurizr.constants.CONTAINER_ELEMENT_TYPE) {
            const softwareSystem = structurizr.workspace.findElementById(element.parentId);
            return structurizr.util.escapeHtml(softwareSystem.name) + '/' + structurizr.util.escapeHtml(element.name);
        }

        return undefined;
    }

    function scrollToHash() {
        var hash = window.location.hash;
        if (hash && hash.length > 0) {
            hash = hash.substring(1);
            const anchor = $('a[name="' + hash + '"]');
            if (anchor && anchor.length > 0) {
                anchor[0].scrollIntoView(true);
            }
        } else {
            $('#documentationScopeName')[0].scrollIntoView(false);
            documentationNavigationDropDown.val(decodeURIComponent(window.location.pathname));
        }
    }

    function showNoDocumentationPage() {
        const documentationContent = $('#documentationContent');
        $('#documentationScopeName').html(structurizr.util.escapeHtml(structurizr.workspace.getName()));
        documentationContent.addClass('centered');
        documentationContent.css('margin-top', '100px');
        documentationContent.css('margin-bottom', '100px');

        var random = Math.floor((Math.random() * 4) + 1);
        if (random === 1) {
            documentationContent.append('<p>The owner of this workspace values working software over comprehensive documentation. :-)</p>');
        } else if (random === 2) {
            documentationContent.append('<p>This page intentionally left blank. :-)</p>');
        } else if (random === 3) {
            documentationContent.append('<p>The code is the documentation. :-)</p>');
        } else {
            documentationContent.append("<p>This isn't the documentation you're looking for... :-)</p>");
        }

        documentationContent.append('<p class="smaller">(there is no documentation in this workspace)</p>');
    }

    function show() {
        $('#documentationContent').empty();

        if (requestedScope === WORKSPACE_SCOPE) {
            if (sections.length > 0) {
                sections.forEach(function(section) {
                    showDocumentationSection(section);
                });
            } else {
                // workspace level documentation has been requested, but none exists,
                // so show documentation for the first element instead
                const elementId = elementsWithDocumentation[0];
                const element = structurizr.workspace.findElementById(elementId);
                const scope = toScope(element);
                window.location.href = '${urlPrefix}/documentation/' + scope + '${urlSuffix}';
                return;
            }
        } else {
            sections.forEach(function(section) {
                showDocumentationSection(section);
            });
        }

        renderNavigation();

        if (window.location.hash !== undefined) {
            scrollToHash();
        }

        $("#documentationContent a").each(function() {
            const a = $(this);
            const href = a.attr('href');

            if (href !== undefined) {
                if (href.indexOf('#') === -1) {
                    const targetSection = filenameToSection[href];
                    if (targetSection !== undefined) {
                        a.attr('href', '#' + targetSection.number)
                    }
                } else {
                    const parts = href.split('#');
                    const filename = parts[0];
                    const hash = parts[1];

                    const targetSection = filenameToSection[filename];
                    if (targetSection !== undefined) {
                        a.attr('href', '#' + hash);
                    }
                }
            }
        });

        $("#documentationContent img").click(function(){
            const image = $(this);
            const src = image.attr("src");

            const imageWindow = window.open("", "");
            imageWindow.document.write('<img src="' + src + '" />');
        });

        rendered = false;

        setTimeout(checkDiagramsRendered, 500);
    }

    function renderNavigation() {
        elementsWithDocumentation.forEach(function(elementId) {
            var scope;

            if (elementId === WORKSPACE_SCOPE) {
                scope = WORKSPACE_SCOPE;
                const uri = '${urlPrefix}/documentation${urlSuffix}';

                documentationNavigation.append('<div class="documentationNavigationLink documentationNavigationHeading"><a href="' + uri + '">' + structurizr.util.escapeHtml(structurizr.workspace.getName()) + '</a></div>');
                documentationNavigationDropDown.append(
                    $('<option></option>').val(uri).html('[Workspace]' + structurizr.util.escapeHtml(structurizr.workspace.getName()))
                );
                quickNavigation.addItem('[Workspace] ' + structurizr.util.escapeHtml(structurizr.workspace.getName()), uri);
            } else {
                var element = structurizr.workspace.findElementById(elementId);
                if (element !== undefined) {
                    scope = toScope(element);
                    var uri = '${urlPrefix}/documentation/' + scope + '${urlSuffix}';

                    documentationNavigation.append('<div class="documentationNavigationLink documentationNavigationHeading"><a href="' + uri + '">' + structurizr.util.escapeHtml(element.name) + '</a></div>');
                    documentationNavigationDropDown.append(
                        $('<option></option>').val(uri).html(structurizr.util.escapeHtml('[' + structurizr.workspace.getTerminologyFor(element)) + '] ' + structurizr.util.escapeHtml(element.name))
                    );
                    quickNavigation.addItem(structurizr.util.escapeHtml('[' + structurizr.workspace.getTerminologyFor(element)) + '] ' + structurizr.util.escapeHtml(element.name), uri);
                }
            }

            if (scope === requestedScope) {
                renderNavigationForScope();
            }
        });

        documentationNavigationDropDown.change(function() {
            window.location.href = documentationNavigationDropDown.val();
        });

        $('#exportLink').click(function(event) {
            event.preventDefault();
            exportDocumentationToOfflineHtmlPage();
        });
    }

    function renderNavigationForScope() {
        $('#documentationContent h2, #documentationContent h3').each(function () {
            const tag = $(this).prop("tagName");
            var sectionTitle = $(this).text();
            const sectionNumber = sectionTitle.trim().split(' ')[0];
            sectionTitle = sectionTitle.substr(sectionNumber.length + 1);

            var linkClass = 'documentationNavigationSection';
            var padding = '&nbsp;&nbsp;&nbsp;&nbsp;';

            if (tag === 'H3') {
                linkClass = 'documentationNavigationSubSection';
                padding = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            }

            const sectionAnchorByName = '#' + findHeadingAnchor(sectionNumber, sectionTitle);
            anchors.push(sectionAnchorByName);
            navigationIdsByAnchor[sectionAnchorByName] = anchors.length;

            documentationNavigation.append('<div id="documentationNavigationLink' + (anchors.length) + '" class="documentationNavigationLink ' + linkClass + '"><a href="' + sectionAnchorByName + '">' + sectionNumber + ' ' + structurizr.util.escapeHtml(sectionTitle) + '</a></div>');
            documentationNavigationDropDown.append(
                $('<option class="sectionNavigationOption"></option>').val(sectionAnchorByName).html(padding + sectionNumber + ' ' + structurizr.util.escapeHtml(sectionTitle))
            );
            quickNavigation.addItem(padding + sectionNumber + ' ' + structurizr.util.escapeHtml(sectionTitle), sectionAnchorByName);
        });
    }

    function highlightNavigation(event, hash) {
        if (hash === undefined) {
            hash = location.hash;
        }

        $('.documentationNavigationLink').removeClass('documentationNavigationLinkActive');

        const index = navigationIdsByAnchor[hash];
        if (index === undefined && hash === '') {
            $('#documentationScopeName')[0].scrollIntoView(false);
        }

        if (index > -1) {
            $('#documentationNavigationLink' + index).addClass('documentationNavigationLinkActive');
            $('#documentationNavigationDropDown').val(hash);

            try {
                // scroll the navigation link into view if needed
                const documentationNavigationPanel = $('#documentationNavigationPanel');
                const navigationLink = $('#documentationNavigationLink' + index);
                if (navigationLink.offset().top < documentationNavigationPanel.offset().top) {
                    navigationLink[0].scrollIntoView(true);
                } else if ((navigationLink.offset().top + navigationLink.height()) > (documentationNavigationPanel.offset().top + documentationNavigationPanel.height())) {
                    navigationLink[0].scrollIntoView(false);
                }
            } catch (err) {
                console.log(err);
            }
        }
    }

    function checkDiagramsRendered() {
        var numberOfDiagramsRendered = 0;
        for (var i = 0; i < window.frames.length; i++) {
            const iframe = window.frames[i];

            if (iframe.isRendered !== undefined && iframe.isRendered())  {
                numberOfDiagramsRendered++;
            }
        }

        if (numberOfDiagramsRendered < window.frames.length) {
            setTimeout(checkDiagramsRendered, 500);
        } else {
            rendered = true;
            $('#exportLink').removeClass('hidden');
        }
    }

    function showDocumentationSection(section) {
        if (section) {
            if (section.filename) {
                filenameToSection[section.filename] = section;
            }

            const result = contentRenderer.render(section);
            const documentationContent = $('#documentationContent');

            const sectionNumber = section.number;
            const sectionTitle = section.title;
            const headingAnchor = registerHeadingAnchor(sectionNumber, sectionTitle);

            var html = '';
            html += '<div class="documentationSection">';
            html += '<a name="' + sectionNumber + '"></a>';
            html += '<a name="' + structurizr.util.escapeHtml(headingAnchor) + '" class="headingAnchor"></a>';
            html += '<h2 class="documentationSectionHeading">';
            html += sectionNumber + ' ' + structurizr.util.escapeHtml(sectionTitle) + '</h2>';
            html += '<div id="documentationSectionContent' + sectionNumber + '" class="documentationSectionContent">' + result + '</div>';
            html += '</div>';
            documentationContent.append(html);

            $('#documentationSectionContent' + sectionNumber + ' h1, #documentationSectionContent' + sectionNumber + ' h2').each(function () {
                $(this).remove();
            });

            var subSectionNumber = 0;
            var subSubSectionNumber = 0;
            $('#documentationSectionContent' + sectionNumber + ' h3, #documentationSectionContent' + sectionNumber + ' h4').each(function () {
                var tag = $(this).prop("tagName");
                var text = $(this).text();
                var html = $(this).html();

                if (tag === "H3") {
                    subSectionNumber++;
                    subSubSectionNumber = 0;

                    const sectionNumber = section.number + '.' + subSectionNumber;
                    const sectionTitle = text;
                    const headingAnchor = registerHeadingAnchor(sectionNumber, sectionTitle);

                    $('<a name="' + sectionNumber + '"/><a name="' + headingAnchor + '" class="headingAnchor" />').insertBefore(this);
                    $(this).html(sectionNumber + ' ' + html);
                } else if (tag === "H4") {
                    subSubSectionNumber++;

                    const sectionNumber = section.number + '.' + subSectionNumber + '.' + subSubSectionNumber;
                    const sectionTitle = text;
                    const headingAnchor = registerHeadingAnchor(sectionNumber, sectionTitle);

                    $('<a name="' + sectionNumber + '"/><a name="' + headingAnchor + '" class="headingAnchor" />').insertBefore(this);
                }
            });

            $('.sectionSelector').addClass('hidden');
        }

        return section;
    }

    function changeDocumentation(evt) {
        const hash = window.location.hash;
        const index = anchors.indexOf(hash);

        if (evt.key === 'ArrowRight') {
            if (index < anchors.length - 1) {
                window.location.hash = anchors[index+1];
            }
        } else if (evt.key === 'ArrowLeft') {
            if (index > 0) {
                window.location.hash = anchors[index-1];
            }
        }
    }

    function resize() {
        const topNavigationHeight = $('#topNavigation').outerHeight(true);
        const padding = 20;
        var navigationDropDownHeight = 0;
        if (documentationNavigationDropDownPanel.is(':visible')) {
            navigationDropDownHeight = documentationNavigationDropDownPanel.innerHeight();
        }
        const documentationPanelHeight = (window.innerHeight - topNavigationHeight - padding - navigationDropDownHeight);
        $('#documentationPanel').css('height', documentationPanelHeight + 'px');
        $('#documentationContent').css('margin-bottom', (0.75 * documentationPanelHeight) + 'px');
        $('#documentationNavigationPanel').css('height', (window.innerHeight - topNavigationHeight - padding) + 'px');
    }

    function exportDocumentationToOfflineHtmlPage(callback) {
        const exportWindow = window.open('/static/html/offline-documentation.html');

        const exportDocumentation = function() {
            const documentationContentDiv = exportWindow.document.getElementById('documentationContent');

            if (!documentationContentDiv) {
                setTimeout(exportDocumentation, 100);
            } else {
                var originalContent = document.getElementById("documentationContent").innerHTML;
                exportWindow.document.title = "Structurizr - " + structurizr.workspace.getName();
                exportWindow.document.getElementById('brandingStyles').innerHTML = document.getElementById('brandingStyles').innerHTML;
                exportWindow.document.getElementById('documentationHeader').innerHTML = document.getElementById('documentationHeader').innerHTML;

                const embeddedDiagrams = $('#documentationContent iframe.structurizrEmbed');
                embeddedDiagrams.each(function(index) {
                    var iframe = embeddedDiagrams[index];
                    if (iframe.contentWindow.isExportable && iframe.contentWindow.isExportable()) {
                        var embeddedDiagramDiv = exportWindow.document.createElement("div");
                        embeddedDiagramDiv.className = 'img-thumbnail';

                        var svgMarkupForDiagram = iframe.contentWindow.Structurizr.diagram.convertCurrentDiagramToSVG(index, false);
                        var svgMarkupForDiagramKey = iframe.contentWindow.Structurizr.diagram.convertCurrentDiagramKeyToSVG(index);

                        var parentDiv = iframe.parentNode;
                        embeddedDiagramDiv.innerHTML = svgMarkupForDiagram + '<div class="diagramKey">' + svgMarkupForDiagramKey + '</div>';
                        parentDiv.insertBefore(embeddedDiagramDiv, iframe);
                        parentDiv.removeChild(iframe);
                    } else {
                        iframe.parentNode.removeChild(iframe);
                    }
                });

                documentationContentDiv.innerHTML = document.getElementById("documentationContent").innerHTML;

                const branding = structurizr.workspace.getViews().configuration.branding;
                if (branding.font.url) {
                    const head = exportWindow.document.head;
                    const link = exportWindow.document.createElement('link');

                    link.type = 'text/css';
                    link.rel = 'stylesheet';
                    link.href = branding.font.url;

                    head.appendChild(link);
                }

                if (callback) {
                    callback(exportWindow.document.documentElement.outerHTML);
                    exportWindow.close();
                } else {
                    const content = exportWindow.document.documentElement.outerHTML;
                    structurizr.util.downloadFile(content, "text/html;charset=utf-8", 'structurizr-' + structurizr.workspace.getId() + '-documentation.html');
                    exportWindow.close();
                }

                document.getElementById("documentationContent").innerHTML = originalContent;
            }
        };

        if (window.navigator.userAgent.indexOf("Edge") > -1) {
            exportDocumentation();
        } else {
            exportWindow.addEventListener("load", exportDocumentation);
        }
    }
</script>

<c:choose>
    <c:when test="${not empty workspaceAsJson}">
<%@ include file="/WEB-INF/fragments/workspace/load-via-inline.jspf" %>
    </c:when>
    <c:otherwise>
<%@ include file="/WEB-INF/fragments/workspace/load-via-api.jspf" %>
    </c:otherwise>
</c:choose>

<c:if test="${structurizrConfiguration.type eq 'lite'}">
<%@ include file="/WEB-INF/fragments/workspace/auto-refresh.jspf" %>
</c:if>