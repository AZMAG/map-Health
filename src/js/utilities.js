let cachedQS;

function qs(key) {
    if (cachedQS) {
        return cachedQS;
    }
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    let match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
    let data = match && decodeURIComponent(match[1].replace(/\+/g, " "));
    let mpa = config.MPAs.filter((mpa) => {
        return mpa.id === data;
    });
    if (mpa.length > 0) {
        cachedQS = data;
        return cachedQS;
    }
}

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

async function GetAllMPAS() {
    return new Promise(function (resolve, reject) {
        let where = config.defExpression[GetCOG()].include;

        $.getJSON(`${config.mainUrl}/2/query?where=${where}&outFields=MPA_FULLNAME,MPA&returnGeometry=false&orderByFields=MPA&returnDistinctValues=true&f=pjson`,
            function (res) {
                resolve(res.features.map(function (feature) {
                    return {
                        name: feature.attributes["MPA_FULLNAME"],
                        id: feature.attributes["MPA"]
                    };
                }));
            });
    });
}
$(() => {
    let $mpaDropdown = $("#mpaDropdown");
    GetAllMPAS().then(function (mpas) {
        config.MPAs = mpas;
        let mpaDropdownHTML = '<option value="all">Show All</option>';
        mpas.forEach(mpa => {
            mpaDropdownHTML += `<option value="${mpa.id}">${mpa.name}</option>`;
        });

        $mpaDropdown.html(mpaDropdownHTML);
        $mpaDropdown.selectpicker("refresh");
    })
});