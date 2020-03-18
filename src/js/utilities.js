let cachedQS;

//https://stackoverflow.com/questions/5999118/how-can-i-add-or-update-a-query-string-parameter
function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|#|$)", "i");
    if (value === undefined) {
        if (uri.match(re)) {
            return uri.replace(re, '$1$2');
        } else {
            return uri;
        }
    } else {
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            var hash = '';
            if (uri.indexOf('#') !== -1) {
                hash = uri.replace(/.*#/, '#');
                uri = uri.replace(/#.*/, '');
            }
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            return uri + separator + key + "=" + value + hash;
        }
    }
}

function GetQueryStringWhere(mpa) {
    let rtnDefExpress = $.extend({}, config.defExpression[GetCOG()]);
    if (mpa) {
        rtnDefExpress.include += ` AND MPA = '${mpa}'`;
    }
    return rtnDefExpress;
}

function GetCOG() {
    let lowerUrl = location.pathname.toLowerCase()
    if (lowerUrl.indexOf('mag') > -1) {
        return 'MAG';
    } else if (lowerUrl.indexOf('cag') > -1) {
        return 'CAG';
    }
}