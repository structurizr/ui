var structurizr = structurizr || {
    util: {}
};

structurizr.util.shadeColor = function(color, percentAsInteger, darkMode) {
    if (darkMode === true) {
        percentAsInteger = -percentAsInteger;
    }

    var percent = 0;
    if (percentAsInteger === 0) {
        percent = 0;
    } else {
        if (percentAsInteger > 90) {
            percent = 0.9; // let's cap how much we shade the colour, so it doesn't become white
        } else {
            percent = percentAsInteger / 100;
        }
    }
    const f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
};