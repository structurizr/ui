<link href="${structurizrConfiguration.cdnUrl}/css/structurizr-review.css" rel="stylesheet" media="screen" />
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/structurizr-review${structurizrConfiguration.versionSuffix}.js"></script>

<c:forEach var="message" items="${messages.unreadMessages}">
    <div class="alert alert-${message.type} alert-dismissible" role="alert" style="margin-bottom: 0">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            ${message.text}
    </div>
</c:forEach>

<div id="diagramControls" class="centered">
    <div class="row">
        <div class="col-sm-2" style="padding: 18px 30px 10px 30px">
            <a href="/"><img src="${structurizrConfiguration.cdnUrl}/img/structurizr-banner.png" alt="Structurizr" class="structurizrBannerLight img-responsive brandingLogo" /><img src="${structurizrConfiguration.cdnUrl}/img/structurizr-banner-dark.png" alt="Structurizr" class="structurizrBannerDark img-responsive brandingLogo" /></a>
        </div>
        <div class="col-sm-10" style="padding: 18px 30px 10px 30px">
            <div class="form-inline">
                <form id="createReviewForm" class="form-horizontal" style="display: inline-block;" method="post" action="/user/review/create">
                    <select name="review" class="form-control" style="margin-right: 5px">
                        <option value="General">General review</option>
                        <option value="Risk">Risk review</option>
                        <option value="STRIDE">STRIDE review</option>
                    </select>
                </form>
                <label id="addDiagramsButton" class="btn btn-default small">
                    <img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/plus-circle.svg" class="icon-btn" />
                    Add diagram(s) <input id="diagramPicker" name="files" type="file" multiple="multiple" style="display: none;">
                </label>
                <button id="createReviewButton" disabled class="btn btn-default"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/check-circle.svg" class="icon-btn" /> Create and share review</button>
            </div>
        </div>
    </div>
</div>

<div class="small centered" style="margin-top: 20px;">
    Choose the diagram(s) that you would like to include in the review. Refresh the page to start again.
</div>

<div id="diagrams">
</div>

<script nonce="${scriptNonce}">
    const review = new structurizr.Review(undefined, undefined, false);
    document.getElementById('diagramPicker').onchange = review.addDiagram;

    $(window).on("beforeunload", function() {
        if (review.isUnsavedChanges()) {
            return "There are unsaved changes.";
        }
    });
</script>