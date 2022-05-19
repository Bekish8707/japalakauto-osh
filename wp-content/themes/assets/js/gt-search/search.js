var cps_domain = '';
var firstTitle = '';
var cps_queryStr = '';
function instant_search() {
    return $('.advSearch').find('input[type="hidden"][name=cps_use_ajax]').val() == 1
}
function cps_convert_url(cps_queryStr) {
    var cps_pares = cps_queryStr.split('&');
    var newQueryStr = '';
    for (var i in cps_pares) {
        if (/[^&]+?=[^&]+/.test(cps_pares[i])) {
            if (typeof (cps_pares[i]) == 'function') {
                continue;
            }
            var key = cps_pares[i].split('=')[0];
            var val = cps_pares[i].split('=')[1];
            newQueryStr += Url.decode(key) + '-' + val + '/';
        }
    }
    return newQueryStr;
}
function doCPSearch() {
    if (!instant_search())
        return
    if (!/\#search\//.test(location.hash)) {
        return;
    }
    $('.hideInventory').hide();
    $('#content').css('opacity', '0.059');
    $('.col-sm-9').css('opacity', '0.059');
    $('.loading-msg').show();
    var query = location.hash.substr(8);
    var title = query.replace(/([^-\/]+)-([^\/]*)\//g, '/$1-$2');
    query = query.replace(/([^-\/]+)-([^\/]*)\//g, '$1=$2&');
    var titleParts = title.substr(1).split('/');
    var newTitile = firstTitle + ' | Search: ';
    var sPrevField = '';
    var sLabel = '';
    for (var i = 0; i < titleParts.length; i++) {
        titlePart = titleParts[i].split('-');
        if (typeof (titlePart[0]) == 'undefined' || typeof (titlePart[1]) == 'undefined') {
            continue;
        }
        if (titlePart[0] == 'order' || titlePart[0] == 'orderdirection') {
            continue;
        }
        sLabel = $('[name="' + titlePart[0] + '"]').prevAll('label:first').text();
        if (sLabel == '') {
            sLabel = titlePart[0];
        }
        if (sPrevField == titlePart[0]) {
            newTitile += ', ' + titlePart[1];
        } else {
            if (i > 0) {
                newTitile += ' / ';
            }
            newTitile += sLabel + ' - ' + titlePart[1];
        }
        sPrevField = titlePart[0];
    }
    document.title = newTitile;
    jQuery.get(cps_domain + '/wp-admin/admin-ajax.php?action=ajax_custom_search&cps_use_ajax=1&' + query + Math.random(), {}, function(resp) {
        $('.hideOnSearch').hide();
        $('.loading-msg').hide();
        $(".navbar-collapse").collapse('hide');
        $('#content').css('opacity', '1');
        $('.col-sm-9').css('opacity', '1');
        $('#cps_ajax_search_results').html(resp);
    }, 'html');
}
function manual_hashchange(hash) {
    location.hash = Url.decode(hash);
    doCPSearch();
}
$(function($) {
    cps_domain = $('.advSearch').data('domain');
    firstTitle = $('title').text();
    $('.advSearch').submit(function(e) {
        var $this = $(this);
        if (instant_search()) {
            e.preventDefault();
            $this.find('input[name=cps_use_ajax]').attr('disabled', 'disabled');
            cps_queryStr = $this.serialize();
            $this.find('input[name=cps_use_ajax]').removeAttr('disabled');
            var regPath = /^\/search/;
            if (regPath.test(location.pathname)) {
                location.href = cps_domain + '/#search/' + cps_convert_url(cps_queryStr);
            } else {
                location.hash = 'search/' + cps_convert_url(cps_queryStr);
            }
            doCPSearch();
        } else {
            $this.find('input[name=cps_use_ajax]').attr('disabled', 'disabled');
            cps_queryStr = $this.serialize();
            $this.find('input[name=cps_use_ajax]').removeAttr('disabled');
            $this.removeAttr('action').attr('action', cps_domain + '/search/' + cps_convert_url(cps_queryStr));
        }
    });
    $('input[name=cps_use_ajax]').change(function() {
        var expiresDate = new Date();
        expiresDate.setTime(expiresDate.getTime() + 1000 * 60 * 60 * 24 * 7);
        document.cookie = 'cps_use_ajax=' + $(this).val() + '; expires=' + expiresDate.toGMTString() + ';';
    });
    $('#cps_ajax_search_results').delegate('.cpsBack', 'click', function(e) {
        e.preventDefault();
        $('#cps_ajax_search_results').html('');
        $('.hideOnSearch').show();
    });
    doCPSearch();
    $(window).hashchange(function() {
        doCPSearch();
    });
});
var Url = {
    encode: function(string) {
        return escape(this._utf8_encode(string));
    },
    decode: function(string) {
        return this._utf8_decode(unescape(string));
    },
    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}
