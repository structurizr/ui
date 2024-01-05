<%@ include file="/WEB-INF/fragments/workspace/javascript.jspf" %>
<%@ include file="/WEB-INF/fragments/progress-message.jspf" %>

<style>
    .table>tbody>tr>td {
        border: none;
    }
</style>

<div class="section">
    <div class="container centered">
        <h1>Recommendations</h1>

        <br />

        <div id="recommendations" style="text-align: left; font-size: 16px"></div>
    </div>
</div>

<script>
    function workspaceLoaded() {
        const recommendations = structurizr.workspace.getRecommendations();
        var count = 1;
        var html = '<table class="table"><tbody>';
        recommendations.forEach(function(recommendation) {
            if (recommendation.priority === 1) {
                html += '<tr class="danger">';
                html += '<td style="width: 150px"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/exclamation-triangle.svg" class="icon-sm" /> High</td>';
            } else if (recommendation.priority === 2) {
                html += '<tr class="warning">';
                html += '<td style="width: 150px"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/exclamation-circle.svg" class="icon-sm" /> Medium</td>';
            } else {
                html += '<tr class="info">';
                html += '<td style="width: 150px"><img src="${structurizrConfiguration.cdnUrl}/bootstrap-icons/info-square.svg" class="icon-sm" /> Low</td>';
            }
            html += '<td>';
            html += count + '. ' + structurizr.util.escapeHtml(recommendation.message);
            if (recommendation.link) {
                if (recommendation.link.indexOf('/') === 0) {
                    html += '<br /><br /><a href="<c:out value="${urlPrefix}" />' + recommendation.link + '" target="_blank"><c:out value="${urlPrefix}" />' + recommendation.link + '</a>';
                } else {
                    html += '<br /><br /><a href="' + recommendation.link + '" target="_blank">' + recommendation.link + '</a>';
                }
            }
            html += '</td>';
            html += '</tr>';
            html += '<tr style="height: 10px"><td colspan="3"></td></tr>'
            count++;
        });
        html += '<tbody></table>';

        $('#recommendations').html(html);
    }
</script>

<%@ include file="/WEB-INF/fragments/workspace/load-via-inline.jspf" %>